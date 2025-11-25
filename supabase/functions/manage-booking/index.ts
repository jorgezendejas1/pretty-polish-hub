import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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

    const { action, bookingId, bookingToken, newDate, newTime } = await req.json();

    console.log('Manage booking request:', { action, bookingId, bookingToken });

    // Verify booking token
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('booking_token', bookingToken)
      .single();

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reserva no encontrada o token inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (action === 'cancel') {
      // Cancel booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Reserva cancelada exitosamente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return new Response(
          JSON.stringify({ success: false, error: 'Nueva fecha y hora requeridas' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check availability for new time
      const { data: conflicts } = await supabase
        .rpc('check_booking_availability', {
          p_date: newDate,
          p_professional_id: booking.professional_id
        });

      const [hours, minutes] = newTime.split(':').map(Number);
      const slotStartMinutes = hours * 60 + minutes;
      const slotEndMinutes = slotStartMinutes + booking.total_duration;

      const hasConflict = conflicts?.some((existingBooking: any) => {
        // Skip checking against the current booking
        if (existingBooking.id === bookingId) return false;

        const [bookingHours, bookingMinutes] = existingBooking.booking_time.split(':').map(Number);
        const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
        const bookingEndMinutes = bookingStartMinutes + existingBooking.total_duration;

        return (
          (slotStartMinutes >= bookingStartMinutes && slotStartMinutes < bookingEndMinutes) ||
          (slotEndMinutes > bookingStartMinutes && slotEndMinutes <= bookingEndMinutes) ||
          (slotStartMinutes <= bookingStartMinutes && slotEndMinutes >= bookingEndMinutes)
        );
      });

      if (hasConflict) {
        return new Response(
          JSON.stringify({ success: false, error: 'El horario seleccionado no está disponible' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      }

      // Update booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          booking_date: newDate,
          booking_time: newTime,
          status: 'pending'
        })
        .eq('id', bookingId);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Reserva reagendada exitosamente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Acción no válida' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error managing booking:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error desconocido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});