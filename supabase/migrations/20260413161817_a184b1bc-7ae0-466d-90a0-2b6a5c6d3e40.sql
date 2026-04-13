
-- Add escrow_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS escrow_balance numeric NOT NULL DEFAULT 0;

-- Add car_commissions to aaa_assignments
ALTER TABLE public.aaa_assignments ADD COLUMN IF NOT EXISTS car_commissions numeric[] NOT NULL DEFAULT '{}'::numeric[];

-- Add car_statuses and car_commissions to task_records
ALTER TABLE public.task_records ADD COLUMN IF NOT EXISTS car_statuses text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.task_records ADD COLUMN IF NOT EXISTS car_commissions numeric[] NOT NULL DEFAULT '{}'::numeric[];

-- Update complete_aaa_task to process per-car with escrow
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
  _total_commission NUMERIC := 0;
  _total_deducted NUMERIC := 0;
  _i INTEGER;
  _car_price NUMERIC;
  _car_commission NUMERIC;
  _all_completed BOOLEAN := true;
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

  -- Process each car individually
  _new_balance := _profile.balance;
  _new_escrow := _profile.escrow_balance;
  _car_statuses := ARRAY[]::TEXT[];

  FOR _i IN 1..array_length(_aaa.car_prices, 1) LOOP
    _car_price := _aaa.car_prices[_i];
    -- Get commission: from car_commissions if set, otherwise use profit_percentage
    IF array_length(_aaa.car_commissions, 1) >= _i AND _aaa.car_commissions[_i] > 0 THEN
      _car_commission := _aaa.car_commissions[_i];
    ELSE
      _car_commission := ROUND(_car_price * _aaa.profit_percentage, 2);
    END IF;

    IF _new_balance >= _car_price THEN
      -- Can afford: deduct and mark green
      _new_balance := ROUND(_new_balance - _car_price, 2);
      _new_escrow := ROUND(_new_escrow + _car_commission, 2);
      _total_deducted := _total_deducted + _car_price;
      _total_commission := _total_commission + _car_commission;
      _car_statuses := array_append(_car_statuses, 'completed_partial');
    ELSE
      -- Cannot afford: mark red
      _car_statuses := array_append(_car_statuses, 'pending_insufficient');
      _all_completed := false;
    END IF;
  END LOOP;

  _new_task_count := _profile.tasks_completed_today + 1;

  -- If ALL cars completed, release escrow immediately
  IF _all_completed THEN
    _new_balance := ROUND(_new_balance + _new_escrow, 2);
    _new_escrow := 0;

    UPDATE public.profiles
    SET balance = _new_balance,
        escrow_balance = _new_escrow,
        advertising_salary = ROUND(_profile.advertising_salary + _total_commission, 2),
        tasks_completed_today = _new_task_count,
        task_cycle_completed = (_new_task_count >= 120),
        updated_at = now()
    WHERE user_id = _user_id;

    INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status, task_type, car_prices, car_statuses, car_commissions)
    VALUES (_user_id, 'AAA', array_to_string(_aaa.car_names, ', '), '', _aaa.total_assignment_amount, _total_commission, _assignment_id::text, 'completed', 'AAA', _aaa.car_prices, _car_statuses, 
      CASE WHEN array_length(_aaa.car_commissions, 1) > 0 THEN _aaa.car_commissions 
      ELSE (SELECT array_agg(ROUND(p * _aaa.profit_percentage, 2)) FROM unnest(_aaa.car_prices) AS p) END)
    RETURNING id INTO _record_id;
  ELSE
    -- Partial: task goes to pending, escrow holds commissions
    UPDATE public.profiles
    SET balance = _new_balance,
        escrow_balance = _new_escrow,
        tasks_completed_today = _new_task_count,
        task_cycle_completed = (_new_task_count >= 120),
        updated_at = now()
    WHERE user_id = _user_id;

    INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status, task_type, car_prices, car_statuses, car_commissions)
    VALUES (_user_id, 'AAA', array_to_string(_aaa.car_names, ', '), '', _aaa.total_assignment_amount, _total_commission, _assignment_id::text, 'pending', 'AAA', _aaa.car_prices, _car_statuses,
      CASE WHEN array_length(_aaa.car_commissions, 1) > 0 THEN _aaa.car_commissions 
      ELSE (SELECT array_agg(ROUND(p * _aaa.profit_percentage, 2)) FROM unnest(_aaa.car_prices) AS p) END)
    RETURNING id INTO _record_id;
  END IF;

  IF _aaa.user_id IS NOT NULL THEN
    UPDATE public.aaa_assignments SET status = 'used', updated_at = now() WHERE id = _assignment_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'task_status', CASE WHEN _all_completed THEN 'completed' ELSE 'pending' END,
    'new_balance', _new_balance,
    'escrow_balance', _new_escrow,
    'total_commission', _total_commission,
    'car_statuses', _car_statuses,
    'record_id', _record_id,
    'all_completed', _all_completed
  );
END;
$function$;

-- Update submit_pending_task to handle per-car completion + escrow release
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
  _new_escrow NUMERIC;
  _car_statuses TEXT[];
  _car_commissions NUMERIC[];
  _i INTEGER;
  _car_price NUMERIC;
  _car_commission NUMERIC;
  _all_completed BOOLEAN := true;
  _newly_earned NUMERIC := 0;
  _newly_deducted NUMERIC := 0;
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

  _new_balance := _profile.balance;
  _new_escrow := _profile.escrow_balance;
  _car_statuses := _record.car_statuses;
  _car_commissions := _record.car_commissions;

  -- Process remaining red cars
  FOR _i IN 1..array_length(_record.car_prices, 1) LOOP
    IF _car_statuses[_i] = 'pending_insufficient' THEN
      _car_price := _record.car_prices[_i];
      
      IF array_length(_car_commissions, 1) >= _i THEN
        _car_commission := _car_commissions[_i];
      ELSE
        _car_commission := 0;
      END IF;

      IF _new_balance >= _car_price THEN
        _new_balance := ROUND(_new_balance - _car_price, 2);
        _new_escrow := ROUND(_new_escrow + _car_commission, 2);
        _newly_deducted := _newly_deducted + _car_price;
        _newly_earned := _newly_earned + _car_commission;
        _car_statuses[_i] := 'completed_partial';
      ELSE
        _all_completed := false;
      END IF;
    END IF;
  END LOOP;

  IF _all_completed THEN
    -- All cars done: release escrow, mark completed
    _new_balance := ROUND(_new_balance + _new_escrow, 2);
    
    UPDATE public.profiles
    SET balance = _new_balance,
        escrow_balance = 0,
        advertising_salary = ROUND(_profile.advertising_salary + _record.advertising_salary + _newly_earned, 2),
        updated_at = now()
    WHERE user_id = _user_id;

    UPDATE public.task_records
    SET status = 'completed', car_statuses = _car_statuses, created_at = now()
    WHERE id = _record_id;

    RETURN json_build_object('success', true, 'new_balance', _new_balance, 'all_completed', true, 'escrow_released', true);
  ELSE
    -- Still incomplete: update statuses, keep in pending
    UPDATE public.profiles
    SET balance = _new_balance,
        escrow_balance = _new_escrow,
        updated_at = now()
    WHERE user_id = _user_id;

    UPDATE public.task_records
    SET car_statuses = _car_statuses, advertising_salary = _record.advertising_salary + _newly_earned
    WHERE id = _record_id;

    RETURN json_build_object('success', true, 'all_completed', false, 'car_statuses', _car_statuses, 'new_balance', _new_balance);
  END IF;
END;
$function$;

-- Add escrow_balance to the safe update policy check
-- First drop and recreate the user update policy to include escrow_balance protection
DROP POLICY IF EXISTS "Users can update safe profile fields" ON public.profiles;
CREATE POLICY "Users can update safe profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  (auth.uid() = user_id)
  AND (balance = (SELECT p.balance FROM profiles p WHERE p.user_id = auth.uid()))
  AND (advertising_salary = (SELECT p.advertising_salary FROM profiles p WHERE p.user_id = auth.uid()))
  AND (tasks_completed_today = (SELECT p.tasks_completed_today FROM profiles p WHERE p.user_id = auth.uid()))
  AND (vip_level = (SELECT p.vip_level FROM profiles p WHERE p.user_id = auth.uid()))
  AND (status = (SELECT p.status FROM profiles p WHERE p.user_id = auth.uid()))
  AND (kyc_status = (SELECT p.kyc_status FROM profiles p WHERE p.user_id = auth.uid()))
  AND (escrow_balance = (SELECT p.escrow_balance FROM profiles p WHERE p.user_id = auth.uid()))
);
