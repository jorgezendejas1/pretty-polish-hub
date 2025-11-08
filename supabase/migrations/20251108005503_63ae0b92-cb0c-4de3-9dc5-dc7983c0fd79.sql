-- Crear tabla de calificaciones y reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para reviews
CREATE POLICY "Cualquiera puede ver las reseñas"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Los usuarios pueden crear reseñas de sus propias citas"
ON public.reviews
FOR INSERT
WITH CHECK (
  client_email = (auth.jwt() ->> 'email'::text)
  OR client_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Los admins pueden ver todas las reseñas"
ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);

-- Crear tabla para recordatorios programados
CREATE TABLE IF NOT EXISTS public.scheduled_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'email',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para scheduled_reminders
CREATE POLICY "Solo admins pueden gestionar recordatorios"
ON public.scheduled_reminders
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);

-- Función para crear recordatorios automáticamente cuando se crea una reserva
CREATE OR REPLACE FUNCTION public.create_automatic_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear recordatorio 24 horas antes de la cita
  INSERT INTO public.scheduled_reminders (booking_id, reminder_type, scheduled_for)
  VALUES (
    NEW.id,
    'email',
    (NEW.booking_date::timestamp + NEW.booking_time::time - INTERVAL '24 hours')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para crear recordatorios automáticamente
CREATE TRIGGER create_reminder_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_automatic_reminder();