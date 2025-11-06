import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppNotificationRequest {
  phone: string;
  name: string;
  bookingDate: string;
  bookingTime: string;
  services: string[];
  professionalName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, name, bookingDate, bookingTime, services, professionalName }: WhatsAppNotificationRequest = await req.json();

    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      throw new Error('WhatsApp credentials not configured');
    }

    // Format phone number (remove +, spaces, dashes)
    const formattedPhone = phone.replace(/[\s\-\+]/g, '');

    // Create message
    const message = `¡Hola ${name}! 🌸

Tu reserva en Pitaya Nails ha sido confirmada ✨

📅 *Fecha:* ${bookingDate}
🕐 *Hora:* ${bookingTime}
💅 *Servicios:* ${services.join(', ')}
👤 *Profesional:* ${professionalName}

Nos vemos pronto en Jardines del Sur 5, Cancún.

¿Tienes alguna pregunta? ¡Escríbenos! 💕`;

    // Send WhatsApp message using Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`);
    }

    console.log('WhatsApp notification sent successfully:', data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-whatsapp-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
