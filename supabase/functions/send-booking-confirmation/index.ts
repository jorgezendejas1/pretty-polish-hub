import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  email: string;
  name: string;
  bookingDate: string;
  bookingTime: string;
  services: string[];
  professionalName: string;
  totalPrice: number;
  totalDuration: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      name,
      bookingDate,
      bookingTime,
      services,
      professionalName,
      totalPrice,
      totalDuration,
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation to:", email);

    const servicesList = services.map(s => `<li>${s}</li>`).join('');

    const emailResponse = await resend.emails.send({
      from: "Pitaya Nails <onboarding@resend.dev>",
      to: [email],
      cc: ["liliana.ventas.retail@gmail.com", "pitayanailscancun@gmail.com"],
      subject: "✨ Confirmación de tu Cita en Pitaya Nails",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✨ Pitaya Nails</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #FF6B9D; margin-top: 0;">¡Hola, ${name}!</h2>
            
            <p style="font-size: 16px;">Tu cita ha sido confirmada exitosamente. ¡Nos vemos pronto! 💅</p>
            
            <div style="background: #FFF5F8; border-left: 4px solid #FF6B9D; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #C239B3; margin-top: 0;">📋 Detalles de tu Cita</h3>
              
              <p style="margin: 10px 0;"><strong>📅 Fecha:</strong> ${bookingDate}</p>
              <p style="margin: 10px 0;"><strong>⏰ Hora:</strong> ${bookingTime}</p>
              <p style="margin: 10px 0;"><strong>👩‍💼 Profesional:</strong> ${professionalName}</p>
              <p style="margin: 10px 0;"><strong>⏱️ Duración:</strong> ${totalDuration} minutos</p>
              
              <h4 style="color: #C239B3; margin-top: 20px; margin-bottom: 10px;">💖 Servicios:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                ${servicesList}
              </ul>
              
              <p style="margin-top: 20px; font-size: 20px; color: #FF6B9D;"><strong>Total: $${totalPrice} MXN</strong></p>
            </div>
            
            <div style="background: #F0F9FF; border-left: 4px solid #60A5FA; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px;"><strong>📍 Ubicación:</strong> Jardines del Sur 5, Cancún, Quintana Roo</p>
            </div>
            
            <div style="border-top: 2px solid #FFE4EC; margin: 30px 0; padding-top: 20px;">
              <p style="font-size: 14px; color: #666;">
                <strong>💡 Importante:</strong> Si necesitas cancelar o reagendar tu cita, por favor contáctanos con al menos 24 horas de anticipación.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              ¡Gracias por elegirnos! 💕<br>
              <strong>El equipo de Pitaya Nails</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Pitaya Nails. Todos los derechos reservados.</p>
            <p>Jardines del Sur 5, Cancún, Quintana Roo</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
