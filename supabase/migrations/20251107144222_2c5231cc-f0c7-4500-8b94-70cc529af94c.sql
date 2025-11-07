-- Eliminar la política demasiado permisiva
DROP POLICY IF EXISTS "Anyone can check booking availability" ON public.bookings;

-- Crear una vista pública que solo muestra información de disponibilidad (sin datos sensibles)
CREATE OR REPLACE VIEW public.booking_availability AS
SELECT 
  id,
  booking_date,
  booking_time,
  total_duration,
  professional_id,
  status
FROM public.bookings;

-- Permitir a todos consultar la vista de disponibilidad
GRANT SELECT ON public.booking_availability TO anon, authenticated;

-- Comentario para documentar
COMMENT ON VIEW public.booking_availability IS 'Vista pública que muestra solo la información necesaria para verificar disponibilidad de horarios, sin exponer datos sensibles de clientes';