-- Fix 1: Add secure token system for bookings (fixes PUBLIC_DATA_EXPOSURE)
ALTER TABLE public.bookings ADD COLUMN booking_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex');
CREATE UNIQUE INDEX idx_bookings_token ON public.bookings(booking_token);

-- Update RLS policy to require token for viewing bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view bookings with valid token" 
ON public.bookings 
FOR SELECT 
USING (booking_token = current_setting('request.jwt.claims', true)::json->>'booking_token' OR booking_token = current_setting('app.booking_token', true));

-- Fix 3: Create rate limiting function for edge functions (fixes OPEN_ENDPOINTS)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, endpoint, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are managed by service" 
ON public.rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  v_window_start := DATE_TRUNC('minute', NOW()) - (EXTRACT(EPOCH FROM (NOW() - DATE_TRUNC('hour', NOW())))::INTEGER / p_window_seconds * p_window_seconds || ' seconds')::INTERVAL;
  
  -- Get current count for this window
  SELECT request_count INTO v_current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start = v_window_start;
  
  -- If no record exists or count is below limit, allow request
  IF v_current_count IS NULL THEN
    -- Insert new record
    INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_start)
    VALUES (p_identifier, p_endpoint, 1, v_window_start)
    ON CONFLICT (identifier, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    RETURN TRUE;
  ELSIF v_current_count < p_max_requests THEN
    -- Increment counter
    UPDATE public.rate_limits
    SET request_count = request_count + 1
    WHERE identifier = p_identifier
      AND endpoint = p_endpoint
      AND window_start = v_window_start;
    RETURN TRUE;
  ELSE
    -- Limit exceeded
    RETURN FALSE;
  END IF;
END;
$$;

-- Cleanup old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;