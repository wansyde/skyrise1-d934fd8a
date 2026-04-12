
CREATE OR REPLACE FUNCTION public.complete_task(
  _car_brand TEXT,
  _car_name TEXT,
  _car_image_url TEXT,
  _total_amount NUMERIC,
  _assignment_code TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _reward NUMERIC;
  _new_balance NUMERIC;
  _new_salary NUMERIC;
  _new_task_count INTEGER;
  _tasks_per_set INTEGER := 40;
  _total_sets INTEGER := 3;
  _total_tasks INTEGER;
  _tier_percent NUMERIC;
  _current_set INTEGER;
  _tasks_in_set INTEGER;
  _et_hour INTEGER;
  _max_allowed_tasks INTEGER;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  _et_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE 'America/New_York'));
  IF _et_hour < 10 OR _et_hour >= 22 THEN
    RETURN json_build_object('error', 'Promotions are only available between 10:00 AM and 10:00 PM (ET)');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  IF _profile.status <> 'active' THEN
    RETURN json_build_object('error', 'Account is restricted');
  END IF;

  IF _profile.task_cycle_completed THEN
    RETURN json_build_object('error', 'Task cycle completed. Please contact customer service to renew or upgrade your plan.');
  END IF;

  IF _profile.balance < 100 THEN
    RETURN json_build_object('error', 'Minimum balance of $100 required');
  END IF;

  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010;
    WHEN 'Expert' THEN _tier_percent := 0.008;
    WHEN 'Professional' THEN _tier_percent := 0.006;
    ELSE _tier_percent := 0.004;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;

  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;
  
  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
    RETURN json_build_object(
      'error', 'Set ' || LEAST(_profile.tasks_completed_today / _tasks_per_set, _total_sets) || ' completed. Contact customer support to unlock next set.',
      'set_locked', true,
      'current_set', _current_set
    );
  END IF;

  IF _profile.tasks_completed_today >= _total_tasks THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  -- Profit = task_value (total_amount) × tier percentage
  _reward := ROUND(_total_amount * _tier_percent, 2);
  _new_balance := ROUND(_profile.balance + _reward, 2);
  _new_salary := ROUND(_profile.advertising_salary + _reward, 2);
  _new_task_count := _profile.tasks_completed_today + 1;

  _current_set := LEAST((_new_task_count - 1) / _tasks_per_set + 1, _total_sets);
  _tasks_in_set := _new_task_count - (_current_set - 1) * _tasks_per_set;

  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= _total_tasks),
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
  VALUES (_user_id, _car_brand, _car_name, _car_image_url, _total_amount, _reward, _assignment_code, 'completed');

  RETURN json_build_object(
    'success', true,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'reward', _reward,
    'task_value', _total_amount,
    'tier_percent', _tier_percent,
    'tasks_completed', _new_task_count,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks,
    'task_cycle_completed', (_new_task_count >= _total_tasks),
    'set_completed', (_new_task_count >= _max_allowed_tasks)
  );
END;
$$;
