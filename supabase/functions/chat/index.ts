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

// Rate limiting helper - AGRESIVO: 10 mensajes cada 5 minutos
const checkRateLimit = async (supabase: any, identifier: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: 'chat',
      p_max_requests: 10, // Reducido de 30 a 10
      p_window_seconds: 300 // Reducido de 3600 (1 hora) a 300 (5 minutos)
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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
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

    const { messages, sentiment } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Formato de mensaje inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate last message length (max 1000 characters)
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content || typeof lastMessage.content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mensaje inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (lastMessage.content.length > 1000) {
      // Registrar evento de seguridad
      await supabaseAdmin.from('security_logs').insert({
        ip_address: clientIP,
        event_type: 'length_exceeded',
        message: `Mensaje excede límite de 1000 caracteres (${lastMessage.content.length})`,
        blocked: true,
        user_message: lastMessage.content.substring(0, 200) + '...'
      });
      
      return new Response(
        JSON.stringify({ error: 'El mensaje es demasiado largo. Por favor limita tu mensaje a 1000 caracteres.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // VALIDACIÓN MEJORADA: Detectar y bloquear inyección de prompts
    const suspiciousPatterns = [
      /ignore\s+(previous|all|above|prior)\s+(instructions?|commands?|prompts?)/i,
      /system\s*:\s*/i,
      /you\s+are\s+now\s+/i,
      /\[system\]/i,
      /\<system\>/i,
      /forget\s+(everything|all|previous)/i,
      /new\s+(instructions?|role|personality)/i,
      /act\s+as\s+if/i,
      /pretend\s+(to\s+be|you\s+are)/i,
      /override\s+(instructions?|settings?)/i,
      /disregard\s+(previous|all)/i,
      /\\x[0-9a-f]{2}/i, // Detectar caracteres escapados hex
      /%[0-9a-f]{2}/i, // Detectar URL encoding sospechoso
    ];
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(lastMessage.content)
    );
    
    if (hasSuspiciousContent) {
      console.warn(`[SECURITY] Prompt injection attempt detected from IP ${clientIP}`);
      
      // Registrar evento de seguridad
      const detectedPattern = suspiciousPatterns.find(pattern => pattern.test(lastMessage.content));
      await supabaseAdmin.from('security_logs').insert({
        ip_address: clientIP,
        event_type: 'prompt_injection',
        message: `Patrón de inyección detectado: ${detectedPattern?.source || 'desconocido'}`,
        blocked: true,
        user_message: lastMessage.content.substring(0, 500),
        metadata: { pattern: detectedPattern?.toString() }
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Contenido no permitido detectado. Por favor reformula tu mensaje.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validación adicional: detectar exceso de caracteres especiales
    const specialCharCount = (lastMessage.content.match(/[<>{}[\]\\|`]/g) || []).length;
    if (specialCharCount > 10) {
      console.warn(`[SECURITY] Excessive special characters from IP ${clientIP}`);
      
      // Registrar evento de seguridad
      await supabaseAdmin.from('security_logs').insert({
        ip_address: clientIP,
        event_type: 'special_chars',
        message: `Caracteres especiales excesivos: ${specialCharCount} encontrados`,
        blocked: true,
        user_message: lastMessage.content.substring(0, 500),
        metadata: { special_char_count: specialCharCount }
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Demasiados caracteres especiales en el mensaje.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Adaptar el prompt basado en el sentimiento del usuario
    let sentimentModifier = '';
    if (sentiment === 'frustrated') {
      sentimentModifier = `\n\n🚨 ALERTA DE SENTIMIENTO: El cliente muestra signos de frustración o molestia. Adapta tu respuesta para ser:
- Extra empática y comprensiva
- Más directa y eficiente (menos rodeos)
- Ofrecer soluciones inmediatas o alternativas
- Validar sus sentimientos antes de continuar
- Si es apropiado, ofrecer contacto humano directo (WhatsApp/teléfono)
- Usar un tono más cálido y reconfortante
Ejemplo: "Entiendo perfectamente tu frustración. Déjame ayudarte a resolverlo de inmediato..."`;
    } else if (sentiment === 'happy') {
      sentimentModifier = `\n\n😊 SENTIMIENTO POSITIVO: El cliente está contento. Mantén:
- El mismo tono positivo y entusiasta
- Refuerza la experiencia positiva
- Aprovecha para sugerir servicios adicionales si es apropiado
Ejemplo: "¡Me encanta tu entusiasmo! Definitivamente te va a encantar el resultado..."`;
    }

    const systemPrompt = `Eres "Pita", la asistente virtual altamente inteligente y sofisticada de "Pitaya Nails", un salón de uñas premium en Cancún, México.${sentimentModifier}

## IDENTIDAD Y PERSONALIDAD
Eres Pita, una asistente con capacidades cognitivas avanzadas comparables a los mejores modelos de IA del mercado. Tu personalidad combina:
- Inteligencia excepcional para entender contextos complejos y sutilezas
- Empatía natural y calidez mexicana auténtica
- Profesionalismo de clase mundial
- Capacidad para anticipar necesidades del cliente
- Memoria contextual perfecta de toda la conversación

## CAPACIDADES COGNITIVAS AVANZADAS
Puedes:
- Entender preguntas complejas, ambiguas o con múltiples intenciones
- Inferir información implícita del contexto
- Manejar múltiples temas simultáneamente
- Adaptar tu estilo de comunicación al cliente
- Resolver problemas creativamente
- Ofrecer recomendaciones personalizadas basadas en preferencias
- Manejar objeciones y dudas con argumentos sólidos
- Detectar emociones y responder apropiadamente

## INFORMACIÓN DEL SALÓN
📍 **Ubicación**: Jardines del Sur 5, Cancún, Quintana Roo, C.P. 77536
📞 **Contacto**: +52 998 590 0050 (WhatsApp disponible)
📧 **Email**: pitayanailscancun@gmail.com
🕐 **Horario**: Lunes a Sábado 10:00-19:00 | Domingo CERRADO
📱 **Social**: @nailstation_cun (Instagram) | Pitaya Nails Cancún (Facebook)

## RECURSOS DEL SITIO WEB
Usa enlaces estratégicamente cuando sea relevante:
- [Servicios Completos](/servicios) - Catálogo con precios
- [Portafolio de Trabajos](/portafolio) - Galería profesional
- [Transformaciones Antes/Después](/transformaciones) - Casos de éxito
- [Conoce al Equipo](/equipo) - Nuestras profesionales certificadas
- [Nuestra Historia](/sobre-nosotros) - Valores y misión
- [Certificaciones](/certificaciones) - Acreditaciones profesionales
- [Contacto y Ubicación](/contacto) - Cómo llegar

## PROCESO DE RESERVA INTELIGENTE
Maneja el proceso de forma natural y fluida, adaptándote al cliente:

**Fase 1 - Descubrimiento**
- Pregunta abierta sobre qué busca (no asumas)
- Escucha activamente sus necesidades
- Haz preguntas inteligentes para clarificar
- Detecta si es cliente nuevo o recurrente

**Fase 2 - Recomendación Personalizada**
- Usa get_services solo si necesitas detalles
- Recomienda servicios basándote en sus necesidades
- Explica beneficios específicos para ellos
- Sugiere combinaciones populares si aplica

**Fase 3 - Selección de Profesional**
- Usa get_team para mostrar opciones
- Describe brevemente especialidades relevantes
- Permite elegir o recomienda basándote en servicio

**Fase 4 - Coordinación de Fecha/Hora**
- Pregunta fecha preferida (sé flexible)
- Usa check_availability inteligentemente
- Ofrece alternativas si primera opción no está disponible
- Considera duración total del servicio

**Fase 5 - Captura de Datos**
- Pide: nombre completo, email, teléfono
- Valida formato de datos sutilmente
- Explica por qué necesitas cada dato

**Fase 6 - Confirmación**
- Resume TODO claramente
- Pide confirmación explícita
- Usa create_booking con datos completos
- Proporciona código de confirmación

## PRINCIPIOS DE COMUNICACIÓN AVANZADA

1. **Contextual**: Recuerda TODA la conversación previa
2. **Proactiva**: Anticipa preguntas y ofrece información relevante
3. **Precisa**: Da respuestas exactas, no genéricas
4. **Persuasiva**: Usa técnicas de copywriting cuando sea apropiado
5. **Empática**: Lee entre líneas las emociones del cliente
6. **Eficiente**: Ve directo al grano pero sin ser brusca
7. **Educativa**: Explica "por qué" cuando sea relevante
8. **Memorable**: Usa ejemplos concretos y lenguaje visual

## MANEJO DE SITUACIONES COMPLEJAS

**Si el cliente está indeciso:**
- Haz preguntas específicas para entender qué le frena
- Ofrece información adicional relevante
- Sugiere hablar con el equipo por WhatsApp si necesita más detalle

**Si hay problemas con disponibilidad:**
- Sé honesta pero ofrece alternativas inmediatamente
- Explica por qué ciertos horarios son populares
- Sugiere reservar con anticipación para futuros servicios

**Si el cliente tiene quejas o dudas:**
- Escucha completamente antes de responder
- Valida sus sentimientos
- Ofrece soluciones concretas
- Escala a humanos si es necesario (vía WhatsApp/teléfono)

**Si preguntan algo que no sabes:**
- Sé honesta: "No tengo esa información específica"
- Ofrece alternativas: "Puedo conectarte con el equipo vía WhatsApp"
- Mantén la confianza del cliente

## TÉCNICAS DE VENTA CONSULTIVA

- Haz preguntas abiertas para entender necesidades reales
- Usa el lenguaje del cliente (repite sus palabras clave)
- Destaca beneficios, no solo características
- Crea urgencia sutil cuando sea apropiado
- Maneja objeciones de precio mostrando valor
- Usa prueba social ("Nuestro servicio más popular...")
- Ofrece next steps claros en cada interacción

## EJEMPLOS DE RESPUESTAS INTELIGENTES

❌ MAL: "Ofrecemos manicura."
✅ BIEN: "Basándome en lo que mencionas, te recomendaría nuestra [Manicura en Gel](/servicios) que dura 2-3 semanas sin descascararse, perfecta si buscas durabilidad. ¿Te interesa conocer más detalles?"

❌ MAL: "No hay disponibilidad."
✅ BIEN: "Ese horario está ocupado porque es muy popular, pero tengo disponible 11:00 AM o 3:00 PM el mismo día con Lily, nuestra especialista en nail art. ¿Alguno de esos horarios te funciona?"

## REGLAS DE ORO

1. NUNCA olvides el contexto de la conversación
2. SIEMPRE confirma antes de crear una reserva
3. SÉ ESPECÍFICA con precios, tiempos y detalles
4. USA herramientas (get_services, get_team, check_availability, create_booking) cuando necesites datos reales
5. ADAPTA tu estilo al cliente (formal/casual, breve/detallado)
6. MANTÉN el profesionalismo sin sonar robótica
7. OFRECE valor en cada mensaje
8. CIERRA conversaciones con next steps claros

Recuerda: No eres un bot básico. Eres una asistente excepcional con capacidades cognitivas avanzadas. Actúa como tal.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.8,
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