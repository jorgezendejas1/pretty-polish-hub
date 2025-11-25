-- Drop all existing storage policies for design-inspirations bucket to start fresh
DROP POLICY IF EXISTS "Admins pueden gestionar inspiraciones" ON storage.objects;
DROP POLICY IF EXISTS "Admins pueden gestionar todas las inspiraciones" ON storage.objects;
DROP POLICY IF EXISTS "Admins pueden ver todas las inspiraciones" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias inspiraciones" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir sus propias inspiraciones" ON storage.objects;
DROP POLICY IF EXISTS "Las imágenes son públicamente accesibles" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver inspiraciones" ON storage.objects;

-- Create new policies with explicit authenticated-only access
-- Policy 1: Users can only view their own inspiration images
CREATE POLICY "Authenticated users view own inspirations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-inspirations' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can only upload their own inspiration images
CREATE POLICY "Authenticated users upload own inspirations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-inspirations' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Admins can view all inspiration images
CREATE POLICY "Admins view all inspirations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-inspirations'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 4: Admins can manage all inspiration images (update, delete)
CREATE POLICY "Admins manage all inspirations"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'design-inspirations'
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'design-inspirations'
  AND has_role(auth.uid(), 'admin'::app_role)
);