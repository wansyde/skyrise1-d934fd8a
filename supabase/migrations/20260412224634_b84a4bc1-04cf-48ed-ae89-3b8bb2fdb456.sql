
-- Add current_unlocked_set column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_unlocked_set integer NOT NULL DEFAULT 1;

-- Update complete_task RPC with dynamic earnings
CREATE OR REPLACE FUNCTION public.complete_task(
  _car_brand text, _car_name text, _car_image_url text, _total_amount numeric, _assignment_code text
)
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
  _tasks_per_set INTEGER := 40;
  _total_sets INTEGER := 3;
  _total_tasks INTEGER;
  _base_percent NUMERIC;
  _base_amount NUMERIC;
  _increment_rate NUMERIC;
  _growth_factor NUMERIC;
  _dynamic_percent NUMERIC;
  _max_percent NUMERIC;
  _task_value NUMERIC;
  _task_ratio NUMERIC;
  _current_set INTEGER;
  _tasks_in_set INTEGER;
  _et_hour INTEGER;
  _max_allowed_tasks INTEGER;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Check working hours: 10AM-10PM Eastern Time
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

  -- Tier configuration: base_amount, base_percent, increment_rate
  CASE _profile.vip_level
    WHEN 'Elite' THEN _base_amount := 5000; _base_percent := 0.010; _increment_rate := 0.0002;
    WHEN 'Expert' THEN _base_amount := 1500; _base_percent := 0.008; _increment_rate := 0.0003;
    WHEN 'Professional' THEN _base_amount := 500; _base_percent := 0.006; _increment_rate := 0.0004;
    ELSE _base_amount := 100; _base_percent := 0.004; _increment_rate := 0.0005;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;

  -- Check if user has reached limit for their unlocked sets
  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;
  
  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    -- Set completed, need unlock
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

  -- Dynamic percentage calculation
  _growth_factor := GREATEST((_profile.balance - _base_amount) / _base_amount, 0);
  _dynamic_percent := _base_percent + (_growth_factor * _increment_rate);
  _max_percent := _base_percent * 1.5; -- Cap at +50% of base
  _dynamic_percent := LEAST(_dynamic_percent, _max_percent);
  _dynamic_percent := GREATEST(_dynamic_percent, _base_percent); -- Never below base

  -- Task value scaling (60-80% of balance, smoothly interpolated)
  _task_ratio := 0.6 + (LEAST(_growth_factor, 5) / 5.0) * 0.2; -- scales from 0.6 to 0.8
  _task_value := ROUND(_profile.balance * _task_ratio, 2);

  -- Check if user can afford the task value
  IF _profile.balance < _task_value THEN
    _task_value := _profile.balance;
  END IF;

  -- Calculate reward
  _reward := ROUND(_task_value * _dynamic_percent, 2);
  _new_balance := ROUND(_profile.balance + _reward, 2);
  _new_salary := ROUND(_profile.advertising_salary + _reward, 2);
  _new_task_count := _profile.tasks_completed_today + 1;

  _current_set := LEAST((_new_task_count - 1) / _tasks_per_set + 1, _total_sets);
  _tasks_in_set := _new_task_count - (_current_set - 1) * _tasks_per_set;

  -- Check if all tasks completed
  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= _total_tasks),
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
  VALUES (_user_id, _car_brand, _car_name, _car_image_url, _task_value, _reward, _assignment_code, 'completed');

  RETURN json_build_object(
    'success', true,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'reward', _reward,
    'task_value', _task_value,
    'dynamic_percent', _dynamic_percent,
    'tasks_completed', _new_task_count,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks,
    'task_cycle_completed', (_new_task_count >= _total_tasks),
    'set_completed', (_new_task_count >= _max_allowed_tasks)
  );
END;
$function$;
