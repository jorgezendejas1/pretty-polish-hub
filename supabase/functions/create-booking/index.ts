import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const validateBooking = (data: any) => {
  const errors: string[] = [];
  
  // Validate client_name
  if (!data.client_name || typeof data.client_name !== 'string') {
    errors.push('client_name is required');
  } else if (data.client_name.trim().length < 2 || data.client_name.trim().length > 100) {
    errors.push('client_name must be between 2 and 100 characters');
  }
  
  // Validate client_email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.client_email || typeof data.client_email !== 'string') {
    errors.push('client_email is required');
  } else if (!emailRegex.test(data.client_email) || data.client_email.length > 255) {
    errors.push('client_email must be a valid email address (max 255 characters)');
  }
  
  // Validate client_phone
  const phoneRegex = /^[+]?[0-9]{10,15}$/;
  if (!data.client_phone || typeof data.client_phone !== 'string') {
    errors.push('client_phone is required');
  } else if (!phoneRegex.test(data.client_phone.replace(/[\s-]/g, ''))) {
    errors.push('client_phone must be a valid phone number (10-15 digits)');
  }
  
  // Validate customizations.notes if present
  if (data.customizations?.notes && data.customizations.notes.length > 500) {
    errors.push('customization notes must not exceed 500 characters');
  }
  
  // Validate required fields
  if (!data.service_ids || !Array.isArray(data.service_ids) || data.service_ids.length === 0) {
    errors.push('service_ids is required and must be a non-empty array');
  }
  
  if (!data.service_names || !Array.isArray(data.service_names) || data.service_names.length === 0) {
    errors.push('service_names is required and must be a non-empty array');
  }
  
  if (!data.booking_date || typeof data.booking_date !== 'string') {
    errors.push('booking_date is required');
  }
  
  if (!data.booking_time || typeof data.booking_time !== 'string') {
    errors.push('booking_time is required');
  }
  
  if (!data.professional_id || typeof data.professional_id !== 'string') {
    errors.push('professional_id is required');
  }
  
  if (!data.professional_name || typeof data.professional_name !== 'string') {
    errors.push('professional_name is required');
  }
  
  if (typeof data.total_price !== 'number' || data.total_price < 0) {
    errors.push('total_price must be a positive number');
  }
  
  if (typeof data.total_duration !== 'number' || data.total_duration < 0) {
    errors.push('total_duration must be a positive number');
  }
  
  return { valid: errors.length === 0, errors };
};

// Rate limiting helper
const checkRateLimit = async (supabase: any, identifier: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: 'create-booking',
      p_max_requests: 10,
      p_window_seconds: 3600 // 10 requests per hour
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to not block legitimate users
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit exception:', error);
    return true; // Allow on error
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting - use IP address or a session identifier
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitPassed = await checkRateLimit(supabase, clientIP);
    
    if (!rateLimitPassed) {
      return new Response(
        JSON.stringify({ error: 'Too many booking requests. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const bookingData = await req.json();
    
    // Validate input
    const validation = validateBooking(bookingData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Sanitize data (trim strings)
    const sanitizedData = {
      ...bookingData,
      client_name: bookingData.client_name.trim(),
      client_email: bookingData.client_email.trim().toLowerCase(),
      client_phone: bookingData.client_phone.replace(/[\s-]/g, ''),
      customizations: bookingData.customizations ? {
        ...bookingData.customizations,
        notes: bookingData.customizations.notes?.trim().substring(0, 500)
      } : null,
      inspiration_images: bookingData.inspiration_images || []
    };
    
    // Check for scheduling conflicts with the same professional
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('booking_time, total_duration')
      .eq('booking_date', sanitizedData.booking_date)
      .eq('professional_id', sanitizedData.professional_id)
      .neq('status', 'cancelled');
    
    if (checkError) {
      console.error('Error checking availability:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check availability' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check for time conflicts
    if (existingBookings && existingBookings.length > 0) {
      const [requestedHours, requestedMinutes] = sanitizedData.booking_time.split(':').map(Number);
      const requestedStartMinutes = requestedHours * 60 + requestedMinutes;
      const requestedEndMinutes = requestedStartMinutes + sanitizedData.total_duration;
      
      const hasConflict = existingBookings.some((booking) => {
        const [bookingHours, bookingMinutes] = booking.booking_time.split(':').map(Number);
        const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
        const bookingEndMinutes = bookingStartMinutes + booking.total_duration;
        
        // Check if time slots overlap
        return (
          (requestedStartMinutes >= bookingStartMinutes && requestedStartMinutes < bookingEndMinutes) ||
          (requestedEndMinutes > bookingStartMinutes && requestedEndMinutes <= bookingEndMinutes) ||
          (requestedStartMinutes <= bookingStartMinutes && requestedEndMinutes >= bookingEndMinutes)
        );
      });
      
      if (hasConflict) {
        return new Response(
          JSON.stringify({ 
            error: 'Este horario ya no está disponible con esta profesional. Por favor selecciona otro horario.',
            code: 'BOOKING_CONFLICT'
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // Insert booking with service role (bypasses RLS)
    const { data, error } = await supabase
      .from('bookings')
      .insert([sanitizedData])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'No pudimos procesar tu reserva. Por favor intenta de nuevo.';
      if (error.message.includes('duplicate')) {
        errorMessage = 'Ya existe una reserva con estos datos.';
      } else if (error.message.includes('foreign key')) {
        errorMessage = 'Datos de la reserva inválidos. Por favor verifica la información.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          code: 'DATABASE_ERROR'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Return booking with token for future retrieval
    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: data,
        booking_token: data.booking_token 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
