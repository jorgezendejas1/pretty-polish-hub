-- Crear nuevo bucket PRIVADO para inspiraciones de clientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-inspirations',
  'client-inspirations',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para el nuevo bucket privado
CREATE POLICY "Usuarios autenticados pueden subir inspiraciones"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-inspirations');

CREATE POLICY "Usuarios autenticados pueden ver inspiraciones"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'client-inspirations');

CREATE POLICY "Admins pueden gestionar todas las inspiraciones"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'client-inspirations' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Función auxiliar para limpiar rate limits antiguos del chat
CREATE OR REPLACE FUNCTION public.cleanup_chat_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE endpoint = 'chat' AND created_at < NOW() - INTERVAL '1 hour';
END;
$$;