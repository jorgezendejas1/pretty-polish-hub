import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analyticsData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Analiza los siguientes datos de un salón de uñas y proporciona predicciones y recomendaciones estratégicas:

Estadísticas:
- Ingresos totales: $${analyticsData.totalRevenue} MXN
- Ingresos este mes: $${analyticsData.monthlyIncome} MXN
- Total de citas: ${analyticsData.totalBookings}
- Citas este mes: ${analyticsData.monthlyBookings}

Tendencia de ingresos (últimos 6 meses):
${analyticsData.monthlyRevenue.map((m: any) => `${m.name}: $${m.ingresos} MXN (${m.citas} citas)`).join('\n')}

Servicios más populares:
${analyticsData.topServices.map((s: any) => `${s.name}: ${s.value} veces`).join('\n')}

Horarios pico:
${analyticsData.peakHours.map((h: any) => `${h.hour}: ${h.count} citas`).join('\n')}

Proporciona un análisis profesional con:
1. **Predicción de ingresos** para el próximo mes basado en la tendencia
2. **Tendencias identificadas** (positivas y áreas de oportunidad)
3. **Recomendaciones estratégicas** para optimizar ingresos
4. **Sugerencias de servicios o paquetes** para aumentar ventas
5. **Optimización de horarios** basado en los horarios pico

Responde en español de forma estructurada, concisa y profesional. Usa formato claro con títulos y bullets points.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un consultor experto en análisis de negocios para salones de belleza. Proporcionas análisis profesionales, predicciones y recomendaciones estratégicas basadas en datos.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Límite de solicitudes excedido. Intenta de nuevo más tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Servicio temporalmente no disponible. Contacta al administrador.' }), {
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

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || 'No se pudo generar el análisis';

    return new Response(
      JSON.stringify({ analysis: analysisText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al generar análisis' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});