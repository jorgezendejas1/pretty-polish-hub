-- Crear tabla de programa de lealtad
CREATE TABLE public.loyalty_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visits_count INTEGER NOT NULL DEFAULT 0,
  total_rewards_claimed INTEGER NOT NULL DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  next_reward_at INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_loyalty UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios puntos
CREATE POLICY "Users can view their own loyalty rewards"
ON public.loyalty_rewards
FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propios puntos (se crea automáticamente)
CREATE POLICY "Users can insert their own loyalty rewards"
ON public.loyalty_rewards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios puntos
CREATE POLICY "Users can update their own loyalty rewards"
ON public.loyalty_rewards
FOR UPDATE
USING (auth.uid() = user_id);

-- Los admins pueden ver todos los puntos
CREATE POLICY "Admins can view all loyalty rewards"
ON public.loyalty_rewards
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Los admins pueden actualizar todos los puntos
CREATE POLICY "Admins can update all loyalty rewards"
ON public.loyalty_rewards
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Función para incrementar visitas cuando se completa una reserva
CREATE OR REPLACE FUNCTION public.increment_loyalty_visits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_visits INTEGER;
BEGIN
  -- Solo incrementar si el estado cambia a 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Buscar el user_id asociado al email del cliente
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = NEW.client_email
    LIMIT 1;
    
    -- Si encontramos el usuario, actualizar o crear registro de lealtad
    IF v_user_id IS NOT NULL THEN
      -- Insertar o actualizar registro
      INSERT INTO public.loyalty_rewards (user_id, visits_count, last_visit_date, updated_at)
      VALUES (v_user_id, 1, NEW.booking_date::timestamp, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        visits_count = CASE
          -- Si alcanzó 8 visitas, resetear a 0 e incrementar recompensas reclamadas
          WHEN loyalty_rewards.visits_count + 1 >= 8 THEN 0
          ELSE loyalty_rewards.visits_count + 1
        END,
        total_rewards_claimed = CASE
          WHEN loyalty_rewards.visits_count + 1 >= 8 THEN loyalty_rewards.total_rewards_claimed + 1
          ELSE loyalty_rewards.total_rewards_claimed
        END,
        last_visit_date = NEW.booking_date::timestamp,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para incrementar visitas automáticamente
CREATE TRIGGER loyalty_visits_trigger
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.increment_loyalty_visits();

-- Crear índices para mejor rendimiento
CREATE INDEX idx_loyalty_rewards_user_id ON public.loyalty_rewards(user_id);
CREATE INDEX idx_loyalty_rewards_visits_count ON public.loyalty_rewards(visits_count);