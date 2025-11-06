-- Asignar rol de admin a jorge.zendejas1@gmail.com
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Buscar el UUID del usuario por su email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'jorge.zendejas1@gmail.com';

  -- Si el usuario existe, asignar el rol de admin
  IF user_uuid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;