-- Fix 1: Replace SECURITY DEFINER view with SECURITY INVOKER view
-- Drop existing public_reviews view
DROP VIEW IF EXISTS public.public_reviews;

-- Recreate view with SECURITY INVOKER (respects RLS of querying user)
CREATE VIEW public.public_reviews 
WITH (security_invoker = true)
AS
SELECT 
  id,
  booking_id,
  rating,
  comment,
  created_at,
  -- Show only first initial of name for privacy
  SUBSTRING(client_name, 1, 1) || '.' as client_name
FROM public.reviews;

-- Grant SELECT on the view (users will still need appropriate RLS permissions on underlying table)
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Fix 2: Restrict chat_sentiment_metrics RLS policies
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert sentiment metrics" ON public.chat_sentiment_metrics;
DROP POLICY IF EXISTS "Anyone can update sentiment metrics" ON public.chat_sentiment_metrics;

-- Create restrictive policy for insertions (only authenticated users or service role)
CREATE POLICY "Authenticated users can insert sentiment metrics"
ON public.chat_sentiment_metrics
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' OR 
  auth.role() = 'service_role'
);

-- Create restrictive policy for updates (only recent records can be updated)
CREATE POLICY "Can update recent sentiment metrics"
ON public.chat_sentiment_metrics
FOR UPDATE
USING (
  created_at > NOW() - INTERVAL '24 hours'
);

-- Add comment for documentation
COMMENT ON VIEW public.public_reviews IS 'Public view of reviews with SECURITY INVOKER - respects RLS policies of querying user';
COMMENT ON POLICY "Authenticated users can insert sentiment metrics" ON public.chat_sentiment_metrics IS 'Restricts sentiment metric insertions to authenticated sessions or service role only';
COMMENT ON POLICY "Can update recent sentiment metrics" ON public.chat_sentiment_metrics IS 'Limits updates to records created within the last 24 hours to prevent historical data manipulation';