
-- Add task_type to task_records
ALTER TABLE public.task_records ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'regular';

-- AAA assignments table (admin-controlled)
CREATE TABLE public.aaa_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL, -- NULL = global (all users)
  task_position integer NOT NULL,
  number_of_cars integer NOT NULL DEFAULT 3 CHECK (number_of_cars >= 2 AND number_of_cars <= 5),
  total_assignment_amount numeric NOT NULL,
  car_names text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.aaa_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage aaa_assignments"
  ON public.aaa_assignments FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own aaa_assignments"
  ON public.aaa_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Trigger for updated_at
CREATE TRIGGER update_aaa_assignments_updated_at
  BEFORE UPDATE ON public.aaa_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: complete AAA task
CREATE OR REPLACE FUNCTION public.complete_aaa_task(
  _assignment_id uuid,
  _car_names text[],
  _total_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _aaa RECORD;
  _tier_percent NUMERIC;
  _base_profit NUMERIC;
  _actual_profit NUMERIC;
  _new_balance NUMERIC;
  _new_salary NUMERIC;
  _new_task_count INTEGER;
  _task_status TEXT;
  _record_id UUID;
  _max_allowed_tasks INTEGER;
  _et_hour INTEGER;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  _et_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE 'America/New_York'));
  IF _et_hour < 10 OR _et_hour >= 22 THEN
    RETURN json_build_object('error', 'Promotions are only available between 10:00 AM and 10:00 PM (ET)');
  END IF;

  -- Validate AAA assignment
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

  -- Tier percent
  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010;
    WHEN 'Expert' THEN _tier_percent := 0.008;
    WHEN 'Professional' THEN _tier_percent := 0.006;
    ELSE _tier_percent := 0.004;
  END CASE;

  -- AAA profit: base × 12
  _base_profit := ROUND(_total_amount * _tier_percent, 2);
  _actual_profit := ROUND(_base_profit * 12, 2);

  -- Check balance
  IF _profile.balance >= _total_amount THEN
    -- Normal: deduct nothing, add profit
    _new_balance := ROUND(_profile.balance + _actual_profit, 2);
    _new_salary := ROUND(_profile.advertising_salary + _actual_profit, 2);
    _task_status := 'completed';
  ELSE
    -- Insufficient: go negative, mark pending (no profit yet)
    _new_balance := ROUND(_profile.balance - _total_amount, 2);
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

  -- Insert task record
  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status, task_type)
  VALUES (_user_id, 'AAA', array_to_string(_car_names, ', '), '', _total_amount, _actual_profit, _assignment_id::text, _task_status, 'AAA')
  RETURNING id INTO _record_id;

  -- Mark AAA assignment as used (for user-specific ones)
  IF _aaa.user_id IS NOT NULL THEN
    UPDATE public.aaa_assignments SET status = 'used', updated_at = now() WHERE id = _assignment_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'task_status', _task_status,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'actual_profit', _actual_profit,
    'base_profit', _base_profit,
    'record_id', _record_id,
    'went_negative', _task_status = 'pending'
  );
END;
$$;

-- Function: submit pending AAA task (after user deposits)
CREATE OR REPLACE FUNCTION public.submit_pending_task(_record_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- User needs enough balance to cover the total_amount + current negative
  -- The balance is already negative from the AAA deduction
  -- They need balance >= 0 after we add back total_amount and give profit
  -- Actually: balance already had total_amount deducted. Now we add it back + profit.
  _new_balance := ROUND(_profile.balance + _record.total_amount + _record.advertising_salary, 2);
  
  IF _new_balance < 0 THEN
    RETURN json_build_object('error', 'Insufficient balance. Please deposit more funds.');
  END IF;

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
$$;
