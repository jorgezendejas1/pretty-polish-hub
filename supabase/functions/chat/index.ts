import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Service and team data
const SERVICES = [
  { id: 'mani-classic', name: 'Manicura Clásica', price: 350, duration: 45 },
  { id: 'mani-gel', name: 'Manicura en Gel', price: 450, duration: 60 },
  { id: 'pedi-spa', name: 'Pedicura Spa', price: 500, duration: 75 },
  { id: 'nail-art', name: 'Nail Art Personalizado', price: 150, duration: 30, pricePerUnit: 150, durationPerUnit: 10 },
  { id: 'acrylic', name: 'Uñas Acrílicas', price: 800, duration: 120 },
  { id: 'polygel', name: 'Uñas con Polygel', price: 900, duration: 110 },
  { id: 'removal', name: 'Retiro de Gel/Acrílico', price: 200, duration: 30 },
  { id: 'paraffin', name: 'Tratamiento de Parafina', price: 250, duration: 30 },
];

const TEAM = [
  { id: 'lily', name: 'Lily Montaño', role: 'Nail Artist Principal', specialty: 'Nail Art y Diseños 3D', unavailableDays: [0] },
  { id: 'sofia', name: 'Sofía', role: 'Técnica en Uñas', specialty: 'Uñas Esculturales', unavailableDays: [0, 6] },
  { id: 'ana', name: 'Ana', role: 'Manicurista', specialty: 'Manicura y Pedicura Spa', unavailableDays: [0] },
];

// Rate limiting helper
const checkRateLimit = async (supabase: any, identifier: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: 'chat',
      p_max_requests: 30,
      p_window_seconds: 3600
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return true;
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit exception:', error);
    return true;
  }
};

// Tool handlers
const handleToolCall = async (toolName: string, args: any, supabase: any) => {
  console.log(`Tool call: ${toolName}`, args);
  
  if (toolName === 'get_services') {
    return JSON.stringify({ services: SERVICES });
  }
  
  if (toolName === 'get_team') {
    return JSON.stringify({ team: TEAM });
  }
  
  if (toolName === 'check_availability') {
    const { date, professional_id, duration } = args;
    const professional = TEAM.find(p => p.id === professional_id);
    
    if (!professional) {
      return JSON.stringify({ error: 'Profesional no encontrado' });
    }
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    if (professional.unavailableDays.includes(dayOfWeek)) {
      return JSON.stringify({ 
        available: false, 
        reason: `${professional.name} no trabaja este día` 
      });
    }
    
    // Generate available times (10 AM to 8 PM)
    const times: string[] = [];
    const start = 10;
    const end = 20;
    const interval = 30;
    
    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeSlotEnd = hour * 60 + minute + duration;
        const endHour = Math.floor(timeSlotEnd / 60);
        
        if (endHour <= end) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          times.push(time);
        }
      }
    }
    
    // Check existing bookings to filter occupied times
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { data: existingBookings, error } = await supabaseAdmin
        .from('bookings')
        .select('booking_time, total_duration')
        .eq('booking_date', date)
        .eq('professional_id', professional_id)
        .neq('status', 'cancelled');
      
      if (!error && existingBookings && existingBookings.length > 0) {
        // Filter out occupied time slots
        const availableFiltered = times.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const slotStartMinutes = hours * 60 + minutes;
          const slotEndMinutes = slotStartMinutes + duration;
          
          const hasConflict = existingBookings.some((booking) => {
            const [bookingHours, bookingMinutes] = booking.booking_time.split(':').map(Number);
            const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
            const bookingEndMinutes = bookingStartMinutes + booking.total_duration;
            
            return (
              (slotStartMinutes >= bookingStartMinutes && slotStartMinutes < bookingEndMinutes) ||
              (slotEndMinutes > bookingStartMinutes && slotEndMinutes <= bookingEndMinutes) ||
              (slotStartMinutes <= bookingStartMinutes && slotEndMinutes >= bookingEndMinutes)
            );
          });
          
          return !hasConflict;
        });
        
        return JSON.stringify({ 
          available: true, 
          availableTimes: availableFiltered,
          professional: professional.name 
        });
      }
    } catch (error) {
      console.error('Error checking existing bookings:', error);
      // Continue with all times if error
    }
    
    return JSON.stringify({ 
      available: true, 
      availableTimes: times,
      professional: professional.name 
    });
  }
  
  if (toolName === 'create_booking') {
    const { client_name, client_email, client_phone, service_ids, professional_id, booking_date, booking_time } = args;
    
    // Validate required fields
    if (!client_name || !client_email || !client_phone || !service_ids || !professional_id || !booking_date || !booking_time) {
      return JSON.stringify({ success: false, error: 'Faltan datos requeridos' });
    }
    
    // Calculate totals
    const selectedServices = SERVICES.filter(s => service_ids.includes(s.id));
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    
    const professional = TEAM.find(p => p.id === professional_id);
    
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // Check for scheduling conflicts first
      const { data: existingBookings, error: checkError } = await supabaseAdmin
        .from('bookings')
        .select('booking_time, total_duration')
        .eq('booking_date', booking_date)
        .eq('professional_id', professional_id)
        .neq('status', 'cancelled');
      
      if (checkError) {
        console.error('Error checking availability:', checkError);
        return JSON.stringify({ success: false, error: 'Error al verificar disponibilidad' });
      }
      
      // Check for time conflicts
      if (existingBookings && existingBookings.length > 0) {
        const [requestedHours, requestedMinutes] = booking_time.split(':').map(Number);
        const requestedStartMinutes = requestedHours * 60 + requestedMinutes;
        const requestedEndMinutes = requestedStartMinutes + totalDuration;
        
        const hasConflict = existingBookings.some((booking) => {
          const [bookingHours, bookingMinutes] = booking.booking_time.split(':').map(Number);
          const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
          const bookingEndMinutes = bookingStartMinutes + booking.total_duration;
          
          return (
            (requestedStartMinutes >= bookingStartMinutes && requestedStartMinutes < bookingEndMinutes) ||
            (requestedEndMinutes > bookingStartMinutes && requestedEndMinutes <= bookingEndMinutes) ||
            (requestedStartMinutes <= bookingStartMinutes && requestedEndMinutes >= bookingEndMinutes)
          );
        });
        
        if (hasConflict) {
          return JSON.stringify({ 
            success: false, 
            error: 'Lo siento, ese horario ya no está disponible con esta profesional. Por favor elige otro horario.' 
          });
        }
      }
      
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .insert({
          client_name: client_name.trim(),
          client_email: client_email.trim().toLowerCase(),
          client_phone: client_phone.trim(),
          service_ids,
          service_names: selectedServices.map(s => s.name),
          professional_id,
          professional_name: professional?.name || 'Unknown',
          booking_date,
          booking_time,
          total_price: totalPrice,
          total_duration: totalDuration,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) {
        console.error('Booking creation error:', error);
        return JSON.stringify({ success: false, error: 'Error al crear la reserva' });
      }
      
      // Enviar correo de confirmación
      try {
        await supabaseAdmin.functions.invoke('send-booking-confirmation', {
          body: {
            booking_id: data.id,
            client_email: data.client_email,
            client_name: data.client_name,
            booking_date: data.booking_date,
            booking_time: data.booking_time,
            service_names: data.service_names,
            professional_name: data.professional_name,
            total_price: data.total_price,
            total_duration: data.total_duration,
          }
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // No fallar la reserva si el correo falla
      }
      
      return JSON.stringify({ 
        success: true, 
        booking_id: data.id,
        booking_token: data.booking_token,
        message: `¡Reserva confirmada! Tu cita es el ${booking_date} a las ${booking_time} con ${professional?.name}. Total: $${totalPrice} MXN (${totalDuration} minutos). Te hemos enviado un correo de confirmación. Guarda este código para consultar tu reserva: ${data.booking_token.substring(0, 8)}` 
      });
    } catch (error) {
      console.error('Booking creation exception:', error);
      return JSON.stringify({ success: false, error: 'Error al procesar la reserva' });
    }
  }
  
  return JSON.stringify({ error: 'Herramienta no encontrada' });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitPassed = await checkRateLimit(supabase, clientIP);
    
    if (!rateLimitPassed) {
      return new Response(
        JSON.stringify({ error: 'Demasiadas solicitudes. Por favor intenta más tarde.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Eres "Pita", el asistente virtual amable y profesional de "Pitaya Nails", un salón de uñas de alta gama en Cancún, México.

Tu nombre es "Pita" y eres parte del equipo de Pitaya Nails. Cuando alguien te pregunte cómo te llamas, responde: "¡Hola! Soy Pita, tu asistente virtual de Pitaya Nails. 😊"

Puedes ayudar a los clientes con información Y también hacer reservas completas paso a paso.

INFORMACIÓN DEL SALÓN:
- Dirección: Jardines del Sur 5, Cancún, Quintana Roo, C.P. 77536
- Teléfono: +52 998 590 0050 (llamadas y WhatsApp)
- Email: pitayanailscancun@gmail.com
- Horario: Lunes a Sábado 10:00 AM - 7:00 PM, Domingo Cerrado
- Instagram: @nailstation_cun
- Facebook: Pitaya Nails Cancún

PÁGINAS DEL SITIO WEB (puedes enviar enlaces cuando sea relevante):
- [Ver Servicios](/servicios) - Lista completa de servicios con precios y descripciones
- [Ver Portafolio](/portafolio) - Galería de trabajos realizados
- [Ver Transformaciones](/transformaciones) - Fotos de antes y después
- [Nuestro Equipo](/equipo) - Conoce a las profesionales del salón
- [Sobre Nosotros](/sobre-nosotros) - Historia y valores del salón
- [Certificaciones](/certificaciones) - Diplomas y certificados del equipo
- [Contacto](/contacto) - Información de contacto y ubicación

Usa el formato [texto](url) para enviar enlaces cuando sea apropiado. Por ejemplo: "Puedes [ver todos nuestros servicios aquí](/servicios)"

FLUJO DE RESERVA (Guía al cliente paso a paso):
1. Pregunta qué servicios desea (usa get_services para mostrar la lista completa si es necesario)
2. Pregunta con qué profesional prefiere (usa get_team para mostrar el equipo)
3. Pregunta qué fecha prefiere
4. Verifica horarios disponibles (usa check_availability con fecha, professional_id y duración total)
5. Pide datos del cliente: nombre completo, email y teléfono
6. Resume la reserva y pide confirmación
7. Crea la reserva (usa create_booking con todos los datos)

IMPORTANTE:
- Preséntate como "Pita" cuando te pregunten tu nombre
- Sé cálido, conversacional y paciente
- Guía al cliente paso a paso, no pidas todo a la vez
- Confirma cada detalle antes de continuar
- Al usar check_availability, muestra los horarios disponibles de forma clara
- Después de crear la reserva, proporciona el código de confirmación al cliente
- Usa enlaces markdown cuando menciones servicios, el equipo, trabajos realizados o información del salón
- Ejemplo: "Puedes [ver nuestros servicios aquí](/servicios) o [conocer al equipo](/equipo)"

Responde siempre en español de manera natural y amigable.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_services',
              description: 'Obtiene la lista completa de servicios con precios y duraciones',
              parameters: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'get_team',
              description: 'Obtiene la lista del equipo con especialidades y disponibilidad',
              parameters: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'check_availability',
              description: 'Verifica horarios disponibles para una fecha, profesional y duración',
              parameters: {
                type: 'object',
                properties: {
                  date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
                  professional_id: { type: 'string', description: 'ID del profesional (lily, sofia, ana)' },
                  duration: { type: 'number', description: 'Duración total en minutos' },
                },
                required: ['date', 'professional_id', 'duration'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'create_booking',
              description: 'Crea una nueva reserva con todos los datos del cliente',
              parameters: {
                type: 'object',
                properties: {
                  client_name: { type: 'string', description: 'Nombre completo del cliente' },
                  client_email: { type: 'string', description: 'Email del cliente' },
                  client_phone: { type: 'string', description: 'Teléfono del cliente' },
                  service_ids: { type: 'array', items: { type: 'string' }, description: 'IDs de servicios' },
                  professional_id: { type: 'string', description: 'ID del profesional' },
                  booking_date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
                  booking_time: { type: 'string', description: 'Hora en formato HH:MM 24h' },
                },
                required: ['client_name', 'client_email', 'client_phone', 'service_ids', 'professional_id', 'booking_date', 'booking_time'],
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Límite de solicitudes excedido' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Servicio temporalmente no disponible' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Error del servicio de IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle streaming response
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                  continue;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  
                  // Handle tool calls
                  if (parsed.choices?.[0]?.delta?.tool_calls) {
                    const toolCalls = parsed.choices[0].delta.tool_calls;
                    
                    for (const toolCall of toolCalls) {
                      if (toolCall.function?.name && toolCall.function?.arguments) {
                        const toolName = toolCall.function.name;
                        const args = JSON.parse(toolCall.function.arguments);
                        const result = await handleToolCall(toolName, args, supabase);
                        
                        // Send tool result back to AI
                        const toolResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            model: 'google/gemini-2.5-flash',
                            messages: [
                              { role: 'system', content: systemPrompt },
                              ...messages,
                              { role: 'assistant', tool_calls: [toolCall] },
                              { role: 'tool', tool_call_id: toolCall.id, content: result },
                            ],
                            stream: true,
                          }),
                        });
                        
                        if (toolResponse.ok && toolResponse.body) {
                          const toolReader = toolResponse.body.getReader();
                          let toolBuffer = '';
                          
                          while (true) {
                            const { done: toolDone, value: toolValue } = await toolReader.read();
                            if (toolDone) break;
                            
                            toolBuffer += decoder.decode(toolValue, { stream: true });
                            const toolLines = toolBuffer.split('\n');
                            toolBuffer = toolLines.pop() || '';
                            
                            for (const toolLine of toolLines) {
                              if (toolLine.startsWith('data: ')) {
                                controller.enqueue(encoder.encode(`${toolLine}\n\n`));
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    // Regular content delta
                    controller.enqueue(encoder.encode(`${line}\n\n`));
                  }
                } catch (e) {
                  console.error('Parse error:', e);
                }
              }
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});