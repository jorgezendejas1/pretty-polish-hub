-- Crear bucket de storage para imágenes de diseños
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'design-inspirations',
  'design-inspirations',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Políticas de storage para permitir subida pública
CREATE POLICY "Cualquiera puede subir imágenes de diseño"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'design-inspirations');

CREATE POLICY "Las imágenes son públicamente accesibles"
ON storage.objects FOR SELECT
USING (bucket_id = 'design-inspirations');

-- Agregar columna para URLs de imágenes de inspiración en bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS inspiration_images text[] DEFAULT ARRAY[]::text[];