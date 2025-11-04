-- Asegurar que el enum app_role existe
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Asignar rol de admin a los correos especificados
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN ('jorge.zendejas1@gmail.com', 'pitayanailscancun@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;