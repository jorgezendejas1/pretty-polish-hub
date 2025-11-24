-- Actualizar el trigger para notificar a admins cuando se alcancen 7 visitas
CREATE OR REPLACE FUNCTION public.increment_loyalty_visits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_current_visits INTEGER;
  v_client_name TEXT;
  v_client_email TEXT;
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
      -- Obtener el conteo actual de visitas
      SELECT visits_count INTO v_current_visits
      FROM public.loyalty_rewards
      WHERE user_id = v_user_id;
      
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
        updated_at = NOW()
      RETURNING visits_count INTO v_current_visits;
      
      -- Si alcanzó exactamente 7 visitas (la próxima es gratis), notificar a los admins
      IF v_current_visits = 7 THEN
        v_client_name := NEW.client_name;
        v_client_email := NEW.client_email;
        
        -- Llamar a la edge function para notificar a los admins
        -- Usamos pg_net para hacer la petición HTTP de manera asíncrona
        PERFORM net.http_post(
          url := (SELECT 'https://hwzssuideymfwjeivwlg.supabase.co/functions/v1/notify-admins-reward'),
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT current_setting('app.settings.service_role_key', true))
          ),
          body := jsonb_build_object(
            'clientName', v_client_name,
            'clientEmail', v_client_email,
            'visitsCount', v_current_visits
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;