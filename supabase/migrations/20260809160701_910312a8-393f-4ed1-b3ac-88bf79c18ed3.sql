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
  _new_balance NUMERIC;
  _new_escrow NUMERIC;
  _new_task_count INTEGER;
  _record_id UUID;
  _max_allowed_tasks INTEGER;
  _tasks_per_set INTEGER;
  _total_tasks INTEGER;
  _car_statuses TEXT[];
  _raw_commission NUMERIC := 0;
  _total_commission NUMERIC := 0;
  _total_cost NUMERIC := 0;
  _i INTEGER;
  _car_price NUMERIC;
  _car_commission NUMERIC;
  _all_affordable BOOLEAN := true;
  _multiplier NUMERIC;
  _running_balance NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
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

  IF _profile.balance < 0 THEN
    RETURN json_build_object('error', 'Outstanding deficit. Please deposit to continue.');
  END IF;

  IF _profile.task_cycle_completed THEN
    RETURN json_build_object('error', 'Task cycle completed');
  END IF;

  -- Tier-aware set sizing (matches complete_task / preview_task)
  CASE _profile.vip_level
    WHEN 'Elite' THEN _tasks_per_set := 55;
    WHEN 'Expert' THEN _tasks_per_set := 50;
    WHEN 'Professional' THEN _tasks_per_set := 45;
    ELSE _tasks_per_set := 40;
  END CASE;
  _total_tasks := _tasks_per_set * 3;

  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;
  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    RETURN json_build_object('error', 'Set completed. Contact support to unlock next set.');
  END IF;

  IF _profile.tasks_completed_today >= _total_tasks THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  _multiplier := GREATEST(COALESCE(_aaa.commission_multiplier, 1), 1);
  _car_statuses := ARRAY[]::TEXT[];
  _running_balance := _profile.balance;

  FOR _i IN 1..array_length(_aaa.car_prices, 1) LOOP
    _car_price := _aaa.car_prices[_i];
    _car_commission := COALESCE(_aaa.car_commissions[_i], 0);

    _total_cost := _total_cost + _car_price;
    _raw_commission := _raw_commission + _car_commission;

    IF _running_balance >= _car_price THEN
      _running_balance := _running_balance - _car_price;
      _car_statuses := array_append(_car_statuses, 'completed_partial');
    ELSE
      _car_statuses := array_append(_car_statuses, 'pending_insufficient');
      _all_affordable := false;
    END IF;
  END LOOP;

  _total_commission := ROUND(_raw_commission * _multiplier, 2);
  _new_task_count := _profile.tasks_completed_today + 1;

  _new_balance := ROUND(_profile.balance - _total_cost, 2);
  _new_escrow := ROUND(_profile.escrow_balance + _total_cost + _raw_commission, 2);

  UPDATE public.profiles
  SET balance = _new_balance,
      escrow_balance = _new_escrow,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= _total_tasks),
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.task_records (
    user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary,
    assignment_code, status, task_type, car_prices, car_statuses, car_commissions
  )
  VALUES (
    _user_id, 'AAA', array_to_string(_aaa.car_names, ', '), '',
    _aaa.total_assignment_amount, _raw_commission, _assignment_id::text,
    'pending', 'AAA', _aaa.car_prices, _car_statuses, _aaa.car_commissions
  )
  RETURNING id INTO _record_id;

  IF _aaa.user_id IS NOT NULL THEN
    UPDATE public.aaa_assignments SET status = 'used', updated_at = now() WHERE id = _assignment_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'task_status', 'pending',
    'new_balance', _new_balance,
    'escrow_balance', _new_escrow,
    'total_commission', _total_commission,
    'raw_commission', _raw_commission,
    'total_deducted', _total_cost,
    'total_cost', _total_cost,
    'multiplier', _multiplier,
    'car_statuses', _car_statuses,
    'record_id', _record_id,
    'all_completed', false,
    'all_affordable', _all_affordable
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_aaa_task(uuid, text[], numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_aaa_task(uuid, text[], numeric) TO authenticated;