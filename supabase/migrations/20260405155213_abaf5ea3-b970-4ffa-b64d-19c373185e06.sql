
-- Update complete_task to enforce working hours (10AM-10PM ET)
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
  _total_sets INTEGER;
  _total_tasks INTEGER;
  _reward_pct NUMERIC;
  _current_set INTEGER;
  _tasks_in_set INTEGER;
  _et_hour INTEGER;
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

  CASE _profile.vip_level
    WHEN 'Elite' THEN _tasks_per_set := 55; _total_sets := 3; _reward_pct := 0.010;
    WHEN 'Expert' THEN _tasks_per_set := 50; _total_sets := 3; _reward_pct := 0.008;
    WHEN 'Professional' THEN _tasks_per_set := 45; _total_sets := 3; _reward_pct := 0.006;
    ELSE _tasks_per_set := 40; _total_sets := 3; _reward_pct := 0.004;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;

  IF _profile.tasks_completed_today >= _total_tasks THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  IF _profile.balance < _total_amount THEN
    INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
    VALUES (_user_id, _car_brand, _car_name, _car_image_url, _total_amount, 0, _assignment_code, 'pending');
    RETURN json_build_object('error', 'Insufficient balance', 'status', 'pending');
  END IF;

  _reward := ROUND(_total_amount * _reward_pct, 2);
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
    'tasks_completed', _new_task_count,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks,
    'task_cycle_completed', (_new_task_count >= _total_tasks)
  );
END;
$function$;

-- Update submit_withdrawal (2-arg version) to enforce $100 minimum
CREATE OR REPLACE FUNCTION public.submit_withdrawal(_amount numeric, _wallet_address text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF _amount < 100 THEN
    RETURN json_build_object('error', 'Minimum withdrawal amount is $100');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  IF _profile.status <> 'active' THEN
    RETURN json_build_object('error', 'Account is restricted');
  END IF;

  IF _amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  IF _amount > _profile.balance THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  IF _wallet_address IS NULL OR TRIM(_wallet_address) = '' THEN
    RETURN json_build_object('error', 'Wallet address is required');
  END IF;

  _new_balance := ROUND(_profile.balance - _amount, 2);

  UPDATE public.profiles SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;

  INSERT INTO public.withdrawals (user_id, amount, method, status, wallet_address)
  VALUES (_user_id, _amount, 'USDT (TRC-20)', 'pending', TRIM(_wallet_address));

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'withdrawal', -_amount, 'pending', 'Withdrawal request', 'USDT (TRC-20)');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$function$;

-- Update submit_withdrawal (3-arg version) to enforce $100 minimum
CREATE OR REPLACE FUNCTION public.submit_withdrawal(_amount numeric, _wallet_address text, _wallet_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF _amount < 100 THEN
    RETURN json_build_object('error', 'Minimum withdrawal amount is $100');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  IF _profile.status <> 'active' THEN
    RETURN json_build_object('error', 'Account is restricted');
  END IF;

  IF _amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  IF _amount > _profile.balance THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  IF _wallet_address IS NULL OR TRIM(_wallet_address) = '' THEN
    RETURN json_build_object('error', 'Wallet address is required');
  END IF;

  _new_balance := ROUND(_profile.balance - _amount, 2);

  UPDATE public.profiles SET balance = _new_balance, updated_at = now(),
    saved_wallet_name = COALESCE(NULLIF(TRIM(_wallet_name), ''), saved_wallet_name),
    saved_wallet_address = COALESCE(NULLIF(TRIM(_wallet_address), ''), saved_wallet_address)
  WHERE user_id = _user_id;

  INSERT INTO public.withdrawals (user_id, amount, method, status, wallet_address)
  VALUES (_user_id, _amount, 'USDT (TRC-20)', 'pending', TRIM(_wallet_address));

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'withdrawal', -_amount, 'pending', 'Withdrawal request', 'USDT (TRC-20)');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$function$;
