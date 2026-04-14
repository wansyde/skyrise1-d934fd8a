
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
  _car_commissions NUMERIC[];
  _i INTEGER;
  _car_price NUMERIC;
  _car_commission NUMERIC;
  _total_remaining_cost NUMERIC := 0;
  _multiplier NUMERIC := 1;
  _total_raw_commission NUMERIC := 0;
  _final_commission NUMERIC := 0;
  _total_prices NUMERIC := 0;
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

  -- Calculate total remaining cost for ALL pending cars
  FOR _i IN 1..array_length(_record.car_prices, 1) LOOP
    IF _record.car_statuses[_i] = 'pending_insufficient' THEN
      _total_remaining_cost := _total_remaining_cost + _record.car_prices[_i];
    END IF;
  END LOOP;

  -- ALL-OR-NOTHING: balance must cover ALL remaining cars
  IF _profile.balance < 0 THEN
    RETURN json_build_object('error', 'Insufficient balance. Please deposit to continue.');
  END IF;

  -- Process: mark all pending cars as completed
  _new_balance := _profile.balance;
  _car_statuses := _record.car_statuses;
  _car_commissions := _record.car_commissions;

  FOR _i IN 1..array_length(_record.car_prices, 1) LOOP
    IF _car_statuses[_i] = 'pending_insufficient' THEN
      _car_statuses[_i] := 'completed_partial';
    END IF;
  END LOOP;

  -- All cars now completed - calculate totals and release escrow
  _total_raw_commission := 0;
  FOR _i IN 1..array_length(_record.car_prices, 1) LOOP
    _total_raw_commission := _total_raw_commission + COALESCE(_car_commissions[_i], 0);
    _total_prices := _total_prices + _record.car_prices[_i];
  END LOOP;
  _final_commission := ROUND(_total_raw_commission * _multiplier, 2);

  -- Release: refund all car prices + multiplied commission to balance
  _new_balance := ROUND(_new_balance + _total_prices + _final_commission, 2);

  UPDATE public.profiles
  SET balance = _new_balance,
      escrow_balance = 0,
      advertising_salary = ROUND(_profile.advertising_salary + _final_commission, 2),
      updated_at = now()
  WHERE user_id = _user_id;

  UPDATE public.task_records
  SET status = 'completed', car_statuses = _car_statuses, advertising_salary = _final_commission, created_at = now()
  WHERE id = _record_id;

  RETURN json_build_object('success', true, 'new_balance', _new_balance, 'all_completed', true, 'escrow_released', true, 'final_commission', _final_commission, 'multiplier', _multiplier);
END;
$function$;
