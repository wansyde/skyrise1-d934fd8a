
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
  _total_deducted NUMERIC := 0;
  _total_deficit NUMERIC := 0;
  _i INTEGER;
  _car_price NUMERIC;
  _car_commission NUMERIC;
  _all_completed BOOLEAN := true;
  _multiplier NUMERIC;
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

  _multiplier := GREATEST(COALESCE(_aaa.commission_multiplier, 1), 1);
  _new_balance := _profile.balance;
  _new_escrow := _profile.escrow_balance;
  _car_statuses := ARRAY[]::TEXT[];

  -- Process each car
  FOR _i IN 1..array_length(_aaa.car_prices, 1) LOOP
    _car_price := _aaa.car_prices[_i];
    _car_commission := COALESCE(_aaa.car_commissions[_i], 0);

    IF _new_balance >= _car_price THEN
      -- User can afford: deduct and escrow
      _new_balance := ROUND(_new_balance - _car_price, 2);
      _total_deducted := _total_deducted + _car_price;
      _raw_commission := _raw_commission + _car_commission;
      _new_escrow := ROUND(_new_escrow + _car_price + _car_commission, 2);
      _car_statuses := array_append(_car_statuses, 'completed_partial');
    ELSE
      -- User CANNOT afford: track full price as deficit, do NOT deduct from balance
      _total_deficit := _total_deficit + _car_price;
      _car_statuses := array_append(_car_statuses, 'pending_insufficient');
      _all_completed := false;
    END IF;
  END LOOP;

  _total_commission := ROUND(_raw_commission * _multiplier, 2);
  _new_task_count := _profile.tasks_completed_today + 1;

  IF _all_completed THEN
    -- All cars affordable: refund prices + pay multiplied commission
    _new_balance := ROUND(_new_balance + _total_deducted + _total_commission, 2);

    UPDATE public.profiles
    SET balance = _new_balance,
        escrow_balance = _profile.escrow_balance,
        advertising_salary = ROUND(_profile.advertising_salary + _total_commission, 2),
        tasks_completed_today = _new_task_count,
        task_cycle_completed = (_new_task_count >= 120),
        updated_at = now()
    WHERE user_id = _user_id;

    INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status, task_type, car_prices, car_statuses, car_commissions)
    VALUES (_user_id, 'AAA', array_to_string(_aaa.car_names, ', '), '', _aaa.total_assignment_amount, _total_commission, _assignment_id::text, 'completed', 'AAA', _aaa.car_prices, _car_statuses, _aaa.car_commissions)
    RETURNING id INTO _record_id;
  ELSE
    -- Partial: set balance to NEGATIVE of total unaffordable car prices (ignore remaining balance)
    _new_balance := ROUND(-_total_deficit, 2);

    UPDATE public.profiles
    SET balance = _new_balance,
        escrow_balance = _new_escrow,
        tasks_completed_today = _new_task_count,
        task_cycle_completed = (_new_task_count >= 120),
        updated_at = now()
    WHERE user_id = _user_id;

    INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status, task_type, car_prices, car_statuses, car_commissions)
    VALUES (_user_id, 'AAA', array_to_string(_aaa.car_names, ', '), '', _aaa.total_assignment_amount, _raw_commission, _assignment_id::text, 'pending', 'AAA', _aaa.car_prices, _car_statuses, _aaa.car_commissions)
    RETURNING id INTO _record_id;
  END IF;

  IF _aaa.user_id IS NOT NULL THEN
    UPDATE public.aaa_assignments SET status = 'used', updated_at = now() WHERE id = _assignment_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'task_status', CASE WHEN _all_completed THEN 'completed' ELSE 'pending' END,
    'new_balance', _new_balance,
    'escrow_balance', CASE WHEN _all_completed THEN _profile.escrow_balance ELSE _new_escrow END,
    'total_commission', _total_commission,
    'raw_commission', _raw_commission,
    'total_deducted', _total_deducted,
    'total_deficit', _total_deficit,
    'multiplier', _multiplier,
    'car_statuses', _car_statuses,
    'record_id', _record_id,
    'all_completed', _all_completed
  );
END;
$function$;
