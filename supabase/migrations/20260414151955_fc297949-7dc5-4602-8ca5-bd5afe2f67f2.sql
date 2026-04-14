
CREATE OR REPLACE FUNCTION public.preview_task(_total_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _reward NUMERIC;
  _tasks_per_set INTEGER;
  _total_sets INTEGER := 3;
  _total_tasks INTEGER;
  _tier_percent NUMERIC;
  _current_set INTEGER;
  _tasks_in_set_before INTEGER;
  _set_min_target NUMERIC;
  _set_max_target NUMERIC;
  _set_target_profit NUMERIC;
  _set_profit_so_far NUMERIC := 0;
  _remaining_tasks_in_set INTEGER;
  _effective_amount NUMERIC;
  _seed_text TEXT;
  _seed_ratio NUMERIC;
  _avg_reward NUMERIC;
  _jitter NUMERIC;
  _budget_left NUMERIC;
  _max_allowed_tasks INTEGER;
  _starting_deposit NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Profile not found'); END IF;

  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010; _tasks_per_set := 55;
    WHEN 'Expert' THEN _tier_percent := 0.008; _tasks_per_set := 50;
    WHEN 'Professional' THEN _tier_percent := 0.006; _tasks_per_set := 45;
    ELSE _tier_percent := 0.004; _tasks_per_set := 40;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;
  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;

  IF _profile.tasks_completed_today >= _total_tasks OR _profile.tasks_completed_today >= _max_allowed_tasks THEN
    RETURN json_build_object('error', 'No tasks available');
  END IF;

  _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
  _tasks_in_set_before := _profile.tasks_completed_today - ((_current_set - 1) * _tasks_per_set);

  _starting_deposit := GREATEST(COALESCE(_profile.initial_deposit, 0), 100);

  -- All tiers now use 9%-10% of initial_deposit per set
  _set_min_target := ROUND(_starting_deposit * 0.09, 2);
  _set_max_target := ROUND(_starting_deposit * 0.10, 2);

  _seed_text := _user_id::text || ':' || to_char(COALESCE(_profile.last_task_reset, now()) AT TIME ZONE 'UTC', 'YYYYMMDD') || ':' || _current_set::text || ':' || COALESCE(_profile.vip_level, 'Junior');
  _seed_ratio := get_byte(decode(substr(md5(_seed_text), 1, 2), 'hex'), 0)::numeric / 255;
  _set_target_profit := ROUND(_set_min_target + ((_set_max_target - _set_min_target) * _seed_ratio), 2);

  IF _tasks_in_set_before > 0 THEN
    SELECT COALESCE(SUM(CASE WHEN recent.status = 'completed' THEN recent.advertising_salary ELSE 0 END), 0)
    INTO _set_profit_so_far
    FROM (
      SELECT advertising_salary, status
      FROM public.task_records
      WHERE user_id = _user_id
        AND created_at >= COALESCE(_profile.last_task_reset, '-infinity'::timestamptz)
      ORDER BY created_at DESC, id DESC
      LIMIT _tasks_in_set_before
    ) AS recent;
  END IF;

  _remaining_tasks_in_set := _tasks_per_set - _tasks_in_set_before;
  _budget_left := GREATEST(_set_target_profit - _set_profit_so_far, 0);

  IF _remaining_tasks_in_set <= 0 OR _budget_left <= 0 THEN
    _reward := 0;
  ELSIF _remaining_tasks_in_set = 1 THEN
    _reward := LEAST(_budget_left, _set_max_target - _set_profit_so_far);
    _reward := GREATEST(_reward, 0);
  ELSE
    _avg_reward := _budget_left / _remaining_tasks_in_set;
    _seed_text := _user_id::text || ':' || _profile.tasks_completed_today::text || ':' || to_char(COALESCE(_profile.last_task_reset, now()) AT TIME ZONE 'UTC', 'YYYYMMDDHH24MISS');
    _jitter := (get_byte(decode(substr(md5(_seed_text), 3, 2), 'hex'), 0)::numeric / 255) * 0.6 - 0.3;
    _reward := _avg_reward * (1 + _jitter);
    _reward := LEAST(_reward, _budget_left, _set_max_target - _set_profit_so_far);
    _reward := GREATEST(_reward, 0);
  END IF;

  _reward := ROUND(_reward, 2);
  _effective_amount := CASE WHEN _tier_percent > 0 THEN ROUND(_reward / _tier_percent, 2) ELSE 0 END;

  RETURN json_build_object(
    'success', true,
    'reward', _reward,
    'task_value', _effective_amount,
    'tier_percent', _tier_percent,
    'vip_level', _profile.vip_level,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set_before,
    'tasks_per_set', _tasks_per_set,
    'set_target_profit', _set_target_profit,
    'set_profit_so_far', _set_profit_so_far,
    'budget_left', _budget_left
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_task(_car_brand text, _car_name text, _car_image_url text, _total_amount numeric, _assignment_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _reward NUMERIC;
  _new_balance NUMERIC;
  _new_salary NUMERIC;
  _new_task_count INTEGER;
  _tasks_per_set INTEGER;
  _total_sets INTEGER := 3;
  _total_tasks INTEGER;
  _tier_percent NUMERIC;
  _current_set INTEGER;
  _tasks_in_set_before INTEGER;
  _tasks_in_set_after INTEGER;
  _et_hour INTEGER;
  _max_allowed_tasks INTEGER;
  _set_min_target NUMERIC;
  _set_max_target NUMERIC;
  _set_target_profit NUMERIC;
  _set_profit_so_far NUMERIC := 0;
  _remaining_tasks_in_set INTEGER;
  _effective_amount NUMERIC;
  _seed_text TEXT;
  _seed_ratio NUMERIC;
  _avg_reward NUMERIC;
  _jitter NUMERIC;
  _budget_left NUMERIC;
  _starting_deposit NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF _user_id <> '4c1d14e8-45a6-416b-866c-6b6fd8aab39e'::uuid THEN
    _et_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE 'America/New_York'));
    IF _et_hour < 10 OR _et_hour >= 22 THEN
      RETURN json_build_object('error', 'Promotions are only available between 10:00 AM and 10:00 PM (ET)');
    END IF;
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Profile not found'); END IF;
  IF _profile.status <> 'active' THEN RETURN json_build_object('error', 'Account is restricted'); END IF;
  IF _profile.task_cycle_completed THEN RETURN json_build_object('error', 'Task cycle completed. Please contact customer service to renew or upgrade your plan.'); END IF;
  IF _profile.balance < 100 THEN RETURN json_build_object('error', 'Minimum balance of $100 required'); END IF;

  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010; _tasks_per_set := 55;
    WHEN 'Expert' THEN _tier_percent := 0.008; _tasks_per_set := 50;
    WHEN 'Professional' THEN _tier_percent := 0.006; _tasks_per_set := 45;
    ELSE _tier_percent := 0.004; _tasks_per_set := 40;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;
  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;

  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
    RETURN json_build_object(
      'error', 'Set ' || LEAST(_profile.tasks_completed_today / _tasks_per_set, _total_sets) || ' completed. Contact customer support to unlock next set.',
      'set_locked', true, 'current_set', _current_set
    );
  END IF;

  IF _profile.tasks_completed_today >= _total_tasks THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
  _tasks_in_set_before := _profile.tasks_completed_today - ((_current_set - 1) * _tasks_per_set);

  _starting_deposit := GREATEST(COALESCE(_profile.initial_deposit, 0), 100);

  -- All tiers: 9%-10% of initial_deposit per set
  _set_min_target := ROUND(_starting_deposit * 0.09, 2);
  _set_max_target := ROUND(_starting_deposit * 0.10, 2);

  _seed_text := _user_id::text || ':' || to_char(COALESCE(_profile.last_task_reset, now()) AT TIME ZONE 'UTC', 'YYYYMMDD') || ':' || _current_set::text || ':' || COALESCE(_profile.vip_level, 'Junior');
  _seed_ratio := get_byte(decode(substr(md5(_seed_text), 1, 2), 'hex'), 0)::numeric / 255;
  _set_target_profit := ROUND(_set_min_target + ((_set_max_target - _set_min_target) * _seed_ratio), 2);

  IF _tasks_in_set_before > 0 THEN
    SELECT COALESCE(SUM(CASE WHEN recent.status = 'completed' THEN recent.advertising_salary ELSE 0 END), 0)
    INTO _set_profit_so_far
    FROM (
      SELECT advertising_salary, status
      FROM public.task_records
      WHERE user_id = _user_id
        AND created_at >= COALESCE(_profile.last_task_reset, '-infinity'::timestamptz)
      ORDER BY created_at DESC, id DESC
      LIMIT _tasks_in_set_before
    ) AS recent;
  END IF;

  _remaining_tasks_in_set := _tasks_per_set - _tasks_in_set_before;
  _budget_left := GREATEST(_set_target_profit - _set_profit_so_far, 0);

  IF _remaining_tasks_in_set <= 0 OR _budget_left <= 0 THEN
    _reward := 0;
  ELSIF _remaining_tasks_in_set = 1 THEN
    _reward := LEAST(_budget_left, _set_max_target - _set_profit_so_far);
    _reward := GREATEST(_reward, 0);
  ELSE
    _avg_reward := _budget_left / _remaining_tasks_in_set;
    _seed_text := _user_id::text || ':' || _profile.tasks_completed_today::text || ':' || to_char(COALESCE(_profile.last_task_reset, now()) AT TIME ZONE 'UTC', 'YYYYMMDDHH24MISS');
    _jitter := (get_byte(decode(substr(md5(_seed_text), 3, 2), 'hex'), 0)::numeric / 255) * 0.6 - 0.3;
    _reward := _avg_reward * (1 + _jitter);
    _reward := LEAST(_reward, _budget_left, _set_max_target - _set_profit_so_far);
    _reward := GREATEST(_reward, 0);
  END IF;

  _reward := ROUND(_reward, 2);
  _effective_amount := CASE WHEN _tier_percent > 0 THEN ROUND(_reward / _tier_percent, 2) ELSE 0 END;

  _new_balance := ROUND(_profile.balance + _reward, 2);
  _new_salary := ROUND(_profile.advertising_salary + _reward, 2);
  _new_task_count := _profile.tasks_completed_today + 1;
  _tasks_in_set_after := _new_task_count - ((_current_set - 1) * _tasks_per_set);

  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= _total_tasks),
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
  VALUES (_user_id, _car_brand, _car_name, _car_image_url, _effective_amount, _reward, _assignment_code, 'completed');

  RETURN json_build_object(
    'success', true,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'reward', _reward,
    'task_value', _effective_amount,
    'tier_percent', _tier_percent,
    'tasks_completed', _new_task_count,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set_after,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks,
    'set_target_profit', _set_target_profit,
    'set_profit_before_task', _set_profit_so_far,
    'set_profit_after_task', ROUND(_set_profit_so_far + _reward, 2),
    'set_profit_min', _set_min_target,
    'set_profit_max', _set_max_target,
    'budget_left', _budget_left,
    'remaining_tasks', _remaining_tasks_in_set,
    'task_cycle_completed', (_new_task_count >= _total_tasks),
    'set_completed', (_new_task_count >= _max_allowed_tasks)
  );
END;
$function$;
