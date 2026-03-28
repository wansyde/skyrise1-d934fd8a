
-- 1. LOCK DOWN user_roles: only admins can INSERT
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Replace broad user UPDATE on profiles with restricted one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update safe profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND balance = (SELECT balance FROM public.profiles WHERE user_id = auth.uid())
  AND advertising_salary = (SELECT advertising_salary FROM public.profiles WHERE user_id = auth.uid())
  AND tasks_completed_today = (SELECT tasks_completed_today FROM public.profiles WHERE user_id = auth.uid())
  AND vip_level = (SELECT vip_level FROM public.profiles WHERE user_id = auth.uid())
  AND status = (SELECT status FROM public.profiles WHERE user_id = auth.uid())
  AND kyc_status = (SELECT kyc_status FROM public.profiles WHERE user_id = auth.uid())
);

-- 3. Remove user INSERT on task_records
DROP POLICY IF EXISTS "Users can insert own task records" ON public.task_records;

-- 4. Create secure task completion RPC
CREATE OR REPLACE FUNCTION public.complete_task(
  _car_brand TEXT,
  _car_name TEXT,
  _car_image_url TEXT,
  _total_amount NUMERIC,
  _assignment_code TEXT
)
RETURNS JSON
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
  _daily_limit INTEGER;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Fetch profile
  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  -- Check account status
  IF _profile.status <> 'active' THEN
    RETURN json_build_object('error', 'Account is restricted');
  END IF;

  -- Min balance check
  IF _profile.balance < 100 THEN
    RETURN json_build_object('error', 'Minimum balance of $100 required');
  END IF;

  -- Daily limit check (default 40)
  _daily_limit := 40;
  IF _profile.tasks_completed_today >= _daily_limit THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  -- Check balance >= task cost
  IF _profile.balance < _total_amount THEN
    -- Insert pending record
    INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
    VALUES (_user_id, _car_brand, _car_name, _car_image_url, _total_amount, 0, _assignment_code, 'pending');
    RETURN json_build_object('error', 'Insufficient balance', 'status', 'pending');
  END IF;

  -- Calculate reward (0.4%)
  _reward := ROUND(_total_amount * 0.004, 2);
  _new_balance := ROUND(_profile.balance + _reward, 2);
  _new_salary := ROUND(_profile.advertising_salary + _reward, 2);
  _new_task_count := _profile.tasks_completed_today + 1;

  -- Update profile
  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      tasks_completed_today = _new_task_count,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Insert completed task record
  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
  VALUES (_user_id, _car_brand, _car_name, _car_image_url, _total_amount, _reward, _assignment_code, 'completed');

  RETURN json_build_object(
    'success', true,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'reward', _reward,
    'tasks_completed', _new_task_count
  );
END;
$$;

-- 5. Create secure KYC submission RPC
CREATE OR REPLACE FUNCTION public.submit_kyc(
  _kyc_name TEXT,
  _kyc_id_number TEXT,
  _kyc_id_type TEXT,
  _kyc_front_url TEXT,
  _kyc_back_url TEXT,
  _kyc_selfie_url TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET kyc_name = _kyc_name,
      kyc_id_number = _kyc_id_number,
      kyc_id_type = _kyc_id_type,
      kyc_front_url = _kyc_front_url,
      kyc_back_url = _kyc_back_url,
      kyc_selfie_url = _kyc_selfie_url,
      kyc_status = 'submitted',
      kyc_submitted_at = now(),
      updated_at = now()
  WHERE user_id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$;

-- 6. Create secure investment RPC
CREATE OR REPLACE FUNCTION public.invest_in_plan(
  _plan_id UUID,
  _amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _balance NUMERIC;
  _plan RECORD;
  _ends_at TIMESTAMPTZ;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT balance INTO _balance FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  SELECT * INTO _plan FROM public.investment_plans WHERE id = _plan_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Plan not found');
  END IF;

  IF _amount < _plan.min_amount THEN
    RETURN json_build_object('error', 'Amount below minimum');
  END IF;

  IF _balance < _amount THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  _ends_at := now() + (_plan.duration_days || ' days')::INTERVAL;

  UPDATE public.profiles SET balance = ROUND(_balance - _amount, 2), updated_at = now() WHERE user_id = _user_id;

  INSERT INTO public.user_investments (user_id, plan_id, amount, ends_at)
  VALUES (_user_id, _plan_id, _amount, _ends_at);

  INSERT INTO public.transactions (user_id, type, amount, status, description)
  VALUES (_user_id, 'investment', -_amount, 'approved', 'Invested in ' || _plan.name);

  RETURN json_build_object('success', true);
END;
$$;
