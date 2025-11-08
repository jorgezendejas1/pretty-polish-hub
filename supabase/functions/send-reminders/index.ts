import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener recordatorios pendientes que deben enviarse
    const now = new Date().toISOString();
    const { data: reminders, error: remindersError } = await supabase
      .from("scheduled_reminders")
      .select(`
        *,
        bookings (
          client_name,
          client_email,
          client_phone,
          booking_date,
          booking_time,
          service_names,
          professional_name
        )
      `)
      .eq("sent", false)
      .lte("scheduled_for", now);

    if (remindersError) throw remindersError;

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hay recordatorios pendientes" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const reminder of reminders) {
      const booking = reminder.bookings;
      
      try {
        // Enviar email usando Resend API
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Pitaya Nails <onboarding@resend.dev>",
            to: [booking.client_email],
          subject: "Recordatorio: Tu cita en Pitaya Nails mañana",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ec4899;">¡Hola ${booking.client_name}!</h1>
              
              <p>Este es un recordatorio de tu cita programada para mañana:</p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Fecha:</strong> ${new Date(booking.booking_date).toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Hora:</strong> ${booking.booking_time}</p>
                <p><strong>Servicios:</strong> ${booking.service_names.join(', ')}</p>
                <p><strong>Profesional:</strong> ${booking.professional_name}</p>
              </div>
              
              <p>Nos vemos pronto en:</p>
              <p><strong>Jardines del Sur 5, Cancún, Quintana Roo, C.P. 77536</strong></p>
              
              <p>Si necesitas cancelar o reprogramar, por favor contáctanos lo antes posible:</p>
              <p>📧 pitayanailscancun@gmail.com</p>
              <p>📱 WhatsApp: 998-590-0050</p>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                ¡Esperamos verte!<br>
                <strong style="color: #ec4899;">Equipo Pitaya Nails</strong>
              </p>
            </div>
          `,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error(`Resend API error: ${emailResponse.status}`);
        }

        const emailData = await emailResponse.json();

        // Marcar como enviado
        await supabase
          .from("scheduled_reminders")
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq("id", reminder.id);

        results.push({
          reminderId: reminder.id,
          bookingId: booking.id,
          status: "sent",
          emailId: emailData?.id,
        });

        console.log(`Recordatorio enviado para reserva ${booking.id}`);
      } catch (error) {
        console.error(`Error enviando recordatorio ${reminder.id}:`, error);
        results.push({
          reminderId: reminder.id,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Procesados ${results.length} recordatorios`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error en send-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
