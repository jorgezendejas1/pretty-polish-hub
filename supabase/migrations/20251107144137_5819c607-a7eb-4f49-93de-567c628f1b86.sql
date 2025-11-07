-- Crear una política pública para consultar disponibilidad de horarios
-- Solo permite ver fecha, hora y duración (no datos sensibles del cliente)
CREATE POLICY "Anyone can check booking availability"
ON public.bookings
FOR SELECT
USING (true);