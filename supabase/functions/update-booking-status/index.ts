import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando actualización automática de estatus de reservas...');

    const now = new Date();
    const nowString = now.toISOString();
    const todayDate = now.toISOString().split('T')[0];

    // 1. Marcar como "completado" las reservas que pasaron 2 horas después de su hora
    const { data: pendingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .lte('booking_date', todayDate);

    if (fetchError) {
      console.error('Error al obtener reservas:', fetchError);
      throw fetchError;
    }

    console.log(`Encontradas ${pendingBookings?.length || 0} reservas pendientes/confirmadas`);

    let completedCount = 0;
    let cancelledCount = 0;

    for (const booking of pendingBookings || []) {
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
      const twoHoursAfter = new Date(bookingDateTime.getTime() + (2 * 60 * 60 * 1000));

      if (now >= twoHoursAfter) {
        // Marcar como completado
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Error al completar reserva ${booking.id}:`, updateError);
        } else {
          completedCount++;
          console.log(`Reserva ${booking.id} marcada como completada`);

          // Enviar email solicitando reseña
          try {
            await supabase.functions.invoke('send-booking-confirmation', {
              body: {
                type: 'review_request',
                booking: booking,
                clientEmail: booking.client_email,
              }
            });
            console.log(`Email de solicitud de reseña enviado para reserva ${booking.id}`);
          } catch (emailError) {
            console.error(`Error al enviar email de reseña para ${booking.id}:`, emailError);
          }
        }
      }
    }

    // 2. Marcar como "cancelado" las reservas sin confirmar que están 24 horas en el futuro
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const { data: unconfirmedBookings, error: unconfirmedError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending')
      .lte('booking_date', tomorrowDate)
      .gte('booking_date', todayDate);

    if (unconfirmedError) {
      console.error('Error al obtener reservas sin confirmar:', unconfirmedError);
    } else {
      for (const booking of unconfirmedBookings || []) {
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
        const twentyFourHoursBefore = new Date(bookingDateTime.getTime() - (24 * 60 * 60 * 1000));

        // Si ya pasaron 24 horas antes de la cita y sigue en "pending", cancelar
        if (now >= twentyFourHoursBefore) {
          const { error: cancelError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', booking.id);

          if (cancelError) {
            console.error(`Error al cancelar reserva ${booking.id}:`, cancelError);
          } else {
            cancelledCount++;
            console.log(`Reserva ${booking.id} cancelada automáticamente`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Actualización completada: ${completedCount} reservas completadas, ${cancelledCount} canceladas`,
        completedCount,
        cancelledCount,
        timestamp: nowString,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error en update-booking-status:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Error al actualizar estatus de reservas',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
