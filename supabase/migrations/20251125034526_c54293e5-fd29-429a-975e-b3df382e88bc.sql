-- Cambiar el bucket design-inspirations a privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'design-inspirations';

-- Eliminar políticas existentes demasiado permisivas
DROP POLICY IF EXISTS "Las imágenes son públicamente accesibles" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver inspiraciones" ON storage.objects;

-- Nueva política: Solo el cliente que subió la imagen puede verla
CREATE POLICY "Usuarios pueden ver sus propias inspiraciones"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-inspirations' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuarios pueden subir sus propias imágenes
CREATE POLICY "Usuarios pueden subir sus propias inspiraciones"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-inspirations' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Administradores pueden ver todas las imágenes
CREATE POLICY "Admins pueden ver todas las inspiraciones"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-inspirations'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Política: Administradores pueden gestionar todas las imágenes
CREATE POLICY "Admins pueden gestionar inspiraciones"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'design-inspirations'
  AND has_role(auth.uid(), 'admin'::app_role)
);