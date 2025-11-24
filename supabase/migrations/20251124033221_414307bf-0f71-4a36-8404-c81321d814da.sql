-- Restaurar el trigger original sin la llamada HTTP
CREATE OR REPLACE FUNCTION public.increment_loyalty_visits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;