
-- Add car_prices and profit_percentage to aaa_assignments
ALTER TABLE public.aaa_assignments
ADD COLUMN car_prices numeric[] NOT NULL DEFAULT '{}',
ADD COLUMN profit_percentage numeric NOT NULL DEFAULT 0.05;

-- Add car_prices to task_records for breakdown display
ALTER TABLE public.task_records
ADD COLUMN car_prices numeric[] NOT NULL DEFAULT '{}';

-- Recreate complete_aaa_task with new logic
CREATE OR REPLACE FUNCTION public.complete_aaa_task(_assignment_id uuid, _car_names text[], _total_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _aaa RECORD;
  _actual_profit NUMERIC;
  _new_balance NUMERIC;
  _new_salary NUMERIC;
  _new_task_count INTEGER;
  _task_status TEXT;
  _record_id UUID;
  _max_allowed_tasks INTEGER;
  _et_hour INTEGER;
  _computed_total NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  _et_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE 'America/New_York'));
  IF _et_hour < 10 OR _et_hour >= 22 THEN
    RETURN json_build_object('error', 'Promotions are only available between 10:00 AM and 10:00 PM (ET)');
  END IF;

  SELECT * INTO _aaa FROM public.aaa_assignments WHERE id = _assignment_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'AAA assignment not found or already used');
  END IF;

  IF _aaa.user_id IS NOT NULL AND _aaa.user_id <> _user_id THEN
    RETURN json_build_object('error', 'This assignment is not for you');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  IF _profile.status <> 'active' THEN
    RETURN json_build_object('error', 'Account is restricted');
  END IF;

  IF _profile.task_cycle_completed THEN
    RETURN json_build_object('error', 'Task cycle completed');
  END IF;

  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * 40;
  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    RETURN json_build_object('error', 'Set completed. Contact support to unlock next set.');
  END IF;

  -- Use total from assignment (sum of car_prices)
  _computed_total := _aaa.total_assignment_amount;

  -- Profit from admin-defined percentage
  _actual_profit := ROUND(_computed_total * _aaa.profit_percentage, 2);

  -- Check balance
  IF _profile.balance >= _computed_total THEN
    _new_balance := ROUND(_profile.balance + _actual_profit, 2);
    _new_salary := ROUND(_profile.advertising_salary + _actual_profit, 2);
    _task_status := 'completed';
  ELSE
    -- Go negative, pending
    _new_balance := ROUND(_profile.balance - _computed_total, 2);
    _new_salary := _profile.advertising_salary;
    _task_status := 'pending';
  END IF;

  _new_task_count := _profile.tasks_completed_today + 1;

  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= 120),
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status, task_type, car_prices)
  VALUES (_user_id, 'AAA', array_to_string(_aaa.car_names, ', '), '', _computed_total, _actual_profit, _assignment_id::text, _task_status, 'AAA', _aaa.car_prices)
  RETURNING id INTO _record_id;

  IF _aaa.user_id IS NOT NULL THEN
    UPDATE public.aaa_assignments SET status = 'used', updated_at = now() WHERE id = _assignment_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'task_status', _task_status,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'actual_profit', _actual_profit,
    'record_id', _record_id,
    'went_negative', _task_status = 'pending'
  );
END;
$function$;

-- Update submit_pending_task to enforce balance >= 0 check
CREATE OR REPLACE FUNCTION public.submit_pending_task(_record_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _record RECORD;
  _new_balance NUMERIC;
  _new_salary NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO _record FROM public.task_records
  WHERE id = _record_id AND user_id = _user_id AND status = 'pending' AND task_type = 'AAA'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Pending task not found');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;

  -- User's current balance must be >= 0 before they can submit
  IF _profile.balance < 0 THEN
    RETURN json_build_object('error', 'Insufficient balance. Please deposit funds to clear your negative balance before continuing.');
  END IF;

  -- Now resolve: add back the deducted amount + profit
  _new_balance := ROUND(_profile.balance + _record.total_amount + _record.advertising_salary, 2);
  _new_salary := ROUND(_profile.advertising_salary + _record.advertising_salary, 2);

  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      updated_at = now()
  WHERE user_id = _user_id;

  UPDATE public.task_records
  SET status = 'completed', created_at = now()
  WHERE id = _record_id;

  RETURN json_build_object('success', true, 'new_balance', _new_balance, 'new_salary', _new_salary);
END;
$function$;
