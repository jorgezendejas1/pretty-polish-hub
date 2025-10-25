import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting helper
const checkRateLimit = async (supabase: any, identifier: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: 'chat',
      p_max_requests: 30,
      p_window_seconds: 3600 // 30 requests per hour
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit exception:', error);
    return true;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
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

    const systemPrompt = `Eres un asistente virtual amigable y profesional de "Pitaya Nails", un salón de uñas de alta gama en Cancún, México.

INFORMACIÓN DEL SALÓN:
- Dirección: Jardines del Sur 5, Cancún, Quintana Roo, C.P. 77536
- Teléfono y WhatsApp: +52 998 112 3411
- Horario: Lun - Sab: 10:00 AM - 8:00 PM, Domingo: Cerrado
- Instagram: @nailstation_cun
- Facebook: Nail Station

SERVICIOS Y PRECIOS:
1. Manicura Clásica - $350 MXN (45 min)
2. Manicura en Gel - $450 MXN (60 min)
3. Pedicura Spa - $500 MXN (75 min)
4. Nail Art Personalizado - $150 MXN por uña (10 min por uña)
5. Uñas Acrílicas - $800 MXN (120 min)
6. Uñas con Polygel - $900 MXN (110 min)
7. Retiro de Gel/Acrílico - $200 MXN (30 min)
8. Tratamiento de Parafina - $250 MXN (30 min)

EQUIPO:
- Lily Rodríguez: Nail Artist Principal, especialista en Nail Art y Diseños 3D
- Sofía Martínez: Técnica en Uñas, experta en Uñas Esculturales
- Ana López: Manicurista, especialista en Manicura y Pedicura Spa

Tu función es:
- Responder preguntas sobre servicios, precios, horarios y ubicación
- Ayudar a los clientes a elegir el servicio adecuado según sus necesidades
- Ser cálida, profesional y útil
- Si te preguntan sobre disponibilidad específica, indica que pueden reservar en línea o llamar
- Siempre menciona que pueden reservar directamente en la página web`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Límite de solicitudes excedido. Por favor intenta más tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Servicio temporalmente no disponible.' }), {
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

    return new Response(response.body, {
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
