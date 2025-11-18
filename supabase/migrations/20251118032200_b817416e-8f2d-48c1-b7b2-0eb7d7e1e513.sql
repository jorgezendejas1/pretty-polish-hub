-- Fix: Hide client emails from public review queries
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Cualquiera puede ver las reseñas" ON public.reviews;

-- Drop view if exists and recreate
DROP VIEW IF EXISTS public.public_reviews;

-- Create view for public access (without emails)
CREATE VIEW public.public_reviews AS
SELECT 
  id,
  booking_id,
  rating,
  comment,
  created_at,
  -- Show only first initial of name for privacy
  SUBSTRING(client_name, 1, 1) || '.' as client_name
FROM public.reviews;

-- Allow anyone to read from the public view (no emails)
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Admins can still see full reviews with emails through the main table
CREATE POLICY "Admins can view all reviews with emails" ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Users can see their own reviews with full details
CREATE POLICY "Users can view their own reviews" ON public.reviews
FOR SELECT
USING (client_email = (auth.jwt() ->> 'email'::text));