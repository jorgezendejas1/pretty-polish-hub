-- Crear tabla para envíos de fotos de portafolio de clientes
CREATE TABLE public.portfolio_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.portfolio_submissions ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios envíos
CREATE POLICY "Users can view their own submissions"
ON public.portfolio_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden crear envíos
CREATE POLICY "Users can create submissions"
ON public.portfolio_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver todos los envíos
CREATE POLICY "Admins can view all submissions"
ON public.portfolio_submissions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Los admins pueden actualizar envíos (aprobar/rechazar)
CREATE POLICY "Admins can update submissions"
ON public.portfolio_submissions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_portfolio_submissions_user_id ON public.portfolio_submissions(user_id);
CREATE INDEX idx_portfolio_submissions_status ON public.portfolio_submissions(status);
CREATE INDEX idx_portfolio_submissions_created_at ON public.portfolio_submissions(created_at DESC);