-- Rewrite complete_aaa_task: deduct ALL car prices upfront, escrow ALL, allow negative balance
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
  _et_hour INTEGER;
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

  IF _user_id <> '4c1d14e8-45a6-416b-866c-6b6fd8aab39e'::uuid THEN
    _et_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE 'America/New_York'));
    IF _et_hour < 10 OR _et_hour >= 22 THEN
      RETURN json_build_object('error', 'Promotions are only available between 10:00 AM and 10:00 PM (ET)');
    END IF;
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

  _multiplier := GREATEST(COALESCE(_aaa.commission_multiplier, 1), 1);
  _car_statuses := ARRAY[]::TEXT[];
  _running_balance := _profile.balance;

  -- Compute totals + per-car visual status (green vs pending)
  -- Status is PURELY visual; settlement is batch.
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

  -- ALWAYS deduct full total_cost upfront (allow negative balance)
  -- ALWAYS escrow the full total_cost + raw commission
  _new_balance := ROUND(_profile.balance - _total_cost, 2);
  _new_escrow := ROUND(_profile.escrow_balance + _total_cost + _raw_commission, 2);

  -- Always pending (single settlement on submit)
  UPDATE public.profiles
  SET balance = _new_balance,
      escrow_balance = _new_escrow,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= 120),
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

-- Rewrite submit_pending_task: require non-negative balance, then refund full cost + multiplied commission
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
  _car_statuses TEXT[];
  _i INTEGER;
  _multiplier NUMERIC := 1;
  _total_raw_commission NUMERIC := 0;
  _final_commission NUMERIC := 0;
  _total_cost NUMERIC := 0;
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

  SELECT commission_multiplier INTO _multiplier
  FROM public.aaa_assignments
  WHERE id = _record.assignment_code::uuid;
  _multiplier := GREATEST(COALESCE(_multiplier, 1), 1);

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;

  -- Require non-negative balance to settle
  IF _profile.balance < 0 THEN
    RETURN json_build_object('error', 'Insufficient balance. Please deposit to clear deficit.');
  END IF;

  -- Mark every car green
  _car_statuses := _record.car_statuses;
  FOR _i IN 1..array_length(_record.car_prices, 1) LOOP
    _car_statuses[_i] := 'completed_partial';
    _total_cost := _total_cost + _record.car_prices[_i];
    _total_raw_commission := _total_raw_commission + COALESCE(_record.car_commissions[_i], 0);
  END LOOP;

  _final_commission := ROUND(_total_raw_commission * _multiplier, 2);

  -- Single settlement: refund total_cost + multiplied commission
  _new_balance := ROUND(_profile.balance + _total_cost + _final_commission, 2);

  UPDATE public.profiles
  SET balance = _new_balance,
      escrow_balance = GREATEST(ROUND(_profile.escrow_balance - _total_cost - _total_raw_commission, 2), 0),
      advertising_salary = ROUND(_profile.advertising_salary + _final_commission, 2),
      updated_at = now()
  WHERE user_id = _user_id;

  UPDATE public.task_records
  SET status = 'completed',
      car_statuses = _car_statuses,
      advertising_salary = _final_commission,
      created_at = now()
  WHERE id = _record_id;

  RETURN json_build_object(
    'success', true,
    'new_balance', _new_balance,
    'all_completed', true,
    'escrow_released', true,
    'final_commission', _final_commission,
    'multiplier', _multiplier,
    'total_cost', _total_cost
  );
END;
$function$;