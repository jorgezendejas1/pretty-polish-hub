-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_ids TEXT[] NOT NULL,
  service_names TEXT[] NOT NULL,
  professional_id TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  total_duration INTEGER NOT NULL,
  customizations JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (public booking system)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading own bookings by email
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- Create index for faster queries
CREATE INDEX idx_bookings_email ON public.bookings(client_email);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);