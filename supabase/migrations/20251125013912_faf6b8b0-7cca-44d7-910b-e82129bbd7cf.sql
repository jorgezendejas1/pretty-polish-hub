-- Crear tabla para logs de seguridad del chatbot
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('prompt_injection', 'rate_limit', 'special_chars', 'length_exceeded')),
  message TEXT NOT NULL,
  blocked BOOLEAN DEFAULT true NOT NULL,
  user_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para consultas rápidas
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_ip ON public.security_logs(ip_address);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);

-- RLS: Solo admins pueden ver logs de seguridad
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admins pueden ver logs de seguridad"
ON public.security_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Función para limpiar logs antiguos (mantener últimos 30 días)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.security_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Habilitar realtime para security_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_logs;