
CREATE OR REPLACE FUNCTION public.preview_task(_total_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
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
  _et_hour INTEGER;
  _max_allowed_tasks INTEGER;
  _effective_amount NUMERIC;
  _noise_seed TEXT;
  _noise_byte1 INTEGER;
  _noise_byte2 INTEGER;
  _decimal_noise NUMERIC;
  _micro_factor NUMERIC;
  _min_task NUMERIC;
  _zone_roll NUMERIC;
  _zone_min NUMERIC;
  _zone_max NUMERIC;
  -- Budget variables
  _base_deposit NUMERIC;
  _set_target NUMERIC;
  _target_jitter NUMERIC;
  _budget_per_task NUMERIC;
  _remaining_tasks INTEGER;
  _salary_so_far NUMERIC;
  _budget_left NUMERIC;
  _reward_jitter NUMERIC;
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

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id;
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

  -- ======= BUDGET-BASED REWARD =======
  _base_deposit := GREATEST(COALESCE(_profile.initial_deposit, 0), 100);
  -- Deterministic target between 10%–12% using seeded noise
  _noise_seed := _user_id::text || ':target:' || _current_set::text || ':' || _profile.last_task_reset::text;
  _target_jitter := (get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0)::numeric / 255) * 0.02;
  _set_target := ROUND(_base_deposit * (0.10 + _target_jitter), 2);

  -- Calculate salary earned so far in this set from task_records
  SELECT COALESCE(SUM(tr.advertising_salary), 0) INTO _salary_so_far
  FROM public.task_records tr
  WHERE tr.user_id = _user_id
    AND tr.created_at >= _profile.last_task_reset
    AND tr.status = 'completed'
    AND tr.task_type = 'regular'
  OFFSET ((_current_set - 1) * _tasks_per_set)
  LIMIT _tasks_per_set;

  -- Simpler: count completed tasks in current set and sum their salary
  -- We use tasks_in_set_before which is already calculated
  _budget_left := GREATEST(_set_target - _salary_so_far, 0);
  _remaining_tasks := GREATEST(_tasks_per_set - _tasks_in_set_before, 1);
  _budget_per_task := _budget_left / _remaining_tasks;

  -- Add jitter to this task's reward (±15%)
  _noise_seed := _user_id::text || ':rw:' || _profile.tasks_completed_today::text || ':' || _current_set::text;
  _reward_jitter := 0.85 + (get_byte(decode(substr(md5(_noise_seed), 9, 2), 'hex'), 0)::numeric / 255) * 0.30;
  _reward := ROUND(_budget_per_task * _reward_jitter, 2);
  _reward := GREATEST(_reward, 0.01);
  -- Cap: never let cumulative exceed max target (12%)
  IF (_salary_so_far + _reward) > ROUND(_base_deposit * 0.12, 2) THEN
    _reward := GREATEST(ROUND(_base_deposit * 0.12 - _salary_so_far, 2), 0.01);
  END IF;

  -- ======= TASK DISPLAY VALUE (independent of reward) =======
  _min_task := GREATEST(30, ROUND(_profile.balance * 0.15, 2));

  _noise_seed := _user_id::text || ':zone:' || _profile.tasks_completed_today::text || ':' || _current_set::text;
  _zone_roll := get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0)::numeric / 255;
  _noise_byte1 := get_byte(decode(substr(md5(_noise_seed), 3, 2), 'hex'), 0);

  IF _profile.balance > 0 THEN
    IF _zone_roll < 0.25 THEN
      _zone_min := 0.15 * _profile.balance;
      _zone_max := 0.35 * _profile.balance;
    ELSIF _zone_roll < 0.70 THEN
      _zone_min := 0.35 * _profile.balance;
      _zone_max := 0.75 * _profile.balance;
    ELSE
      _zone_min := 0.75 * _profile.balance;
      _zone_max := 0.98 * _profile.balance;
    END IF;
    _effective_amount := ROUND(_zone_min + (_noise_byte1::numeric / 255) * (_zone_max - _zone_min), 2);
  ELSE
    _effective_amount := _min_task;
  END IF;

  _effective_amount := GREATEST(_effective_amount, _min_task);

  -- Decimal noise
  _noise_seed := _user_id::text || ':tv:' || _profile.tasks_completed_today::text || ':' || _current_set::text;
  _noise_byte1 := get_byte(decode(substr(md5(_noise_seed), 5, 2), 'hex'), 0);
  _noise_byte2 := get_byte(decode(substr(md5(_noise_seed), 7, 2), 'hex'), 0);
  _decimal_noise := 0.01 + (_noise_byte1::numeric / 255) * 0.98;
  _effective_amount := FLOOR(_effective_amount) + _decimal_noise;
  _micro_factor := 0.985 + (_noise_byte2::numeric / 255) * 0.030;
  _effective_amount := ROUND(_effective_amount * _micro_factor, 2);
  _effective_amount := GREATEST(_effective_amount, _min_task);
  _effective_amount := LEAST(_effective_amount, _profile.balance);

  RETURN json_build_object(
    'success', true,
    'reward', _reward,
    'task_value', _effective_amount,
    'tier_percent', _tier_percent,
    'tasks_completed', _profile.tasks_completed_today,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set_before,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks
  );
END;
$function$;

---

CREATE OR REPLACE FUNCTION public.complete_task(_assignment_code text, _car_brand text, _car_image_url text, _car_name text, _total_amount numeric)
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
  _effective_amount NUMERIC;
  _noise_seed TEXT;
  _noise_byte1 INTEGER;
  _noise_byte2 INTEGER;
  _decimal_noise NUMERIC;
  _micro_factor NUMERIC;
  _min_task NUMERIC;
  _zone_roll NUMERIC;
  _zone_min NUMERIC;
  _zone_max NUMERIC;
  -- Budget variables
  _base_deposit NUMERIC;
  _set_target NUMERIC;
  _target_jitter NUMERIC;
  _budget_per_task NUMERIC;
  _remaining_tasks INTEGER;
  _salary_so_far NUMERIC;
  _budget_left NUMERIC;
  _reward_jitter NUMERIC;
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

  -- ======= BUDGET-BASED REWARD =======
  _base_deposit := GREATEST(COALESCE(_profile.initial_deposit, 0), 100);
  -- Deterministic target between 10%–12% using seeded noise
  _noise_seed := _user_id::text || ':target:' || _current_set::text || ':' || _profile.last_task_reset::text;
  _target_jitter := (get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0)::numeric / 255) * 0.02;
  _set_target := ROUND(_base_deposit * (0.10 + _target_jitter), 2);

  -- Sum salary earned in this set so far
  -- We query task_records for current set's completed regular tasks
  SELECT COALESCE(SUM(tr.advertising_salary), 0) INTO _salary_so_far
  FROM (
    SELECT advertising_salary
    FROM public.task_records
    WHERE user_id = _user_id
      AND created_at >= _profile.last_task_reset
      AND status = 'completed'
      AND task_type = 'regular'
    ORDER BY created_at ASC
    OFFSET ((_current_set - 1) * _tasks_per_set)
    LIMIT _tasks_in_set_before
  ) tr;

  _budget_left := GREATEST(_set_target - _salary_so_far, 0);
  _remaining_tasks := GREATEST(_tasks_per_set - _tasks_in_set_before, 1);
  _budget_per_task := _budget_left / _remaining_tasks;

  -- Add jitter to this task's reward (±15%)
  _noise_seed := _user_id::text || ':rw:' || _profile.tasks_completed_today::text || ':' || _current_set::text;
  _reward_jitter := 0.85 + (get_byte(decode(substr(md5(_noise_seed), 9, 2), 'hex'), 0)::numeric / 255) * 0.30;
  _reward := ROUND(_budget_per_task * _reward_jitter, 2);
  _reward := GREATEST(_reward, 0.01);

  -- Hard cap: never exceed 12% of deposit for the set
  IF (_salary_so_far + _reward) > ROUND(_base_deposit * 0.12, 2) THEN
    _reward := GREATEST(ROUND(_base_deposit * 0.12 - _salary_so_far, 2), 0.01);
  END IF;

  -- Last task boost: if this is the last task and we're below 10%, force to hit minimum
  IF _tasks_in_set_before = (_tasks_per_set - 1) THEN
    IF (_salary_so_far + _reward) < ROUND(_base_deposit * 0.10, 2) THEN
      _reward := ROUND(_base_deposit * 0.10 - _salary_so_far, 2);
      _reward := GREATEST(_reward, 0.01);
    END IF;
  END IF;

  -- ======= TASK DISPLAY VALUE (independent of reward) =======
  _min_task := GREATEST(30, ROUND(_profile.balance * 0.15, 2));

  _noise_seed := _user_id::text || ':zone:' || _profile.tasks_completed_today::text || ':' || _current_set::text;
  _zone_roll := get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0)::numeric / 255;
  _noise_byte1 := get_byte(decode(substr(md5(_noise_seed), 3, 2), 'hex'), 0);

  IF _profile.balance > 0 THEN
    IF _zone_roll < 0.25 THEN
      _zone_min := 0.15 * _profile.balance;
      _zone_max := 0.35 * _profile.balance;
    ELSIF _zone_roll < 0.70 THEN
      _zone_min := 0.35 * _profile.balance;
      _zone_max := 0.75 * _profile.balance;
    ELSE
      _zone_min := 0.75 * _profile.balance;
      _zone_max := 0.98 * _profile.balance;
    END IF;
    _effective_amount := ROUND(_zone_min + (_noise_byte1::numeric / 255) * (_zone_max - _zone_min), 2);
  ELSE
    _effective_amount := _min_task;
  END IF;

  _effective_amount := GREATEST(_effective_amount, _min_task);

  -- Decimal noise
  _noise_seed := _user_id::text || ':tv:' || _profile.tasks_completed_today::text || ':' || _current_set::text;
  _noise_byte1 := get_byte(decode(substr(md5(_noise_seed), 5, 2), 'hex'), 0);
  _noise_byte2 := get_byte(decode(substr(md5(_noise_seed), 7, 2), 'hex'), 0);
  _decimal_noise := 0.01 + (_noise_byte1::numeric / 255) * 0.98;
  _effective_amount := FLOOR(_effective_amount) + _decimal_noise;
  _micro_factor := 0.985 + (_noise_byte2::numeric / 255) * 0.030;
  _effective_amount := ROUND(_effective_amount * _micro_factor, 2);
  _effective_amount := GREATEST(_effective_amount, _min_task);
  _effective_amount := LEAST(_effective_amount, _profile.balance);

  -- Update profile
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
    'task_cycle_completed', (_new_task_count >= _total_tasks),
    'set_completed', (_new_task_count >= _max_allowed_tasks)
  );
END;
$function$;
