-- Drop existing RLS policies that are causing issues
DROP POLICY IF EXISTS "Users can view bookings with valid token" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create new RLS policies for bookings
-- Policy 1: Users can view their own bookings by email
CREATE POLICY "Users can view their own bookings by email"
ON public.bookings
FOR SELECT
TO authenticated
USING (client_email = auth.jwt()->>'email');

-- Policy 2: Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy 3: Anyone (authenticated or not) can create bookings
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 4: Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (client_email = auth.jwt()->>'email');

-- Policy 5: Admins can update any booking
CREATE POLICY "Admins can update any booking"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy 6: Users can delete their own bookings (soft delete via status)
CREATE POLICY "Users can delete their own bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (client_email = auth.jwt()->>'email');

-- Policy 7: Admins can delete any booking
CREATE POLICY "Admins can delete any booking"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);