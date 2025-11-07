-- Eliminar la vista con SECURITY DEFINER
DROP VIEW IF EXISTS public.booking_availability;

-- Crear una función segura para consultar disponibilidad
CREATE OR REPLACE FUNCTION public.check_booking_availability(
  p_date date,
  p_professional_id text
)
RETURNS TABLE (
  booking_time text,
  total_duration integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    booking_time,
    total_duration
  FROM public.bookings
  WHERE booking_date = p_date
    AND professional_id = p_professional_id
    AND status != 'cancelled';
$$;

-- Permitir a todos ejecutar la función
GRANT EXECUTE ON FUNCTION public.check_booking_availability(date, text) TO anon, authenticated;

-- Comentario para documentar
COMMENT ON FUNCTION public.check_booking_availability IS 'Función pública que retorna solo horarios ocupados para verificar disponibilidad, sin exponer datos sensibles de clientes';