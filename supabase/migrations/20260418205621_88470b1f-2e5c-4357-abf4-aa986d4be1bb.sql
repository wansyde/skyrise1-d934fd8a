-- Remove 10am-10pm ET time restriction from task engine
-- Users can now complete promotions at any time

CREATE OR REPLACE FUNCTION public.preview_task(_total_amount numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _reward NUMERIC;
  _tasks_per_set INTEGER;
  _total_sets INTEGER := 3;
  _total_tasks INTEGER;
  _tier_percent NUMERIC;
  _current_set INTEGER;
  _tasks_in_set_before INTEGER;
  _max_allowed_tasks INTEGER;
  _effective_amount NUMERIC;
  _noise_seed TEXT;
  _noise_byte4 INTEGER;
  _decimal_noise NUMERIC;
  _min_task NUMERIC;
  _base_deposit NUMERIC;
  _set_target NUMERIC;
  _target_jitter NUMERIC;
  _salary_so_far NUMERIC;
  _max_reward NUMERIC;
  _ideal_reward NUMERIC;
  _remaining_profit NUMERIC;
  _remaining_tasks INTEGER;
  _jitter_byte INTEGER;
  _jitter NUMERIC;
  _set_percent NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Time restriction removed: promotions available 24/7

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Profile not found'); END IF;
  IF _profile.status <> 'active' THEN RETURN json_build_object('error', 'Account is restricted'); END IF;
  IF _profile.task_cycle_completed THEN RETURN json_build_object('error', 'Task cycle completed. Please contact customer service to renew or upgrade your plan.'); END IF;
  IF _profile.balance < 100 THEN RETURN json_build_object('error', 'Minimum balance of $100 required'); END IF;

  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010; _tasks_per_set := 55; _set_percent := 0.48;
    WHEN 'Expert' THEN _tier_percent := 0.008; _tasks_per_set := 50; _set_percent := 0.30;
    WHEN 'Professional' THEN _tier_percent := 0.006; _tasks_per_set := 45; _set_percent := 0.185;
    ELSE _tier_percent := 0.004; _tasks_per_set := 40; _set_percent := 0.09;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;
  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;

  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
    RETURN json_build_object(
      'error', 'Set ' || LEAST(_profile.tasks_completed_today / _tasks_per_set, _total_sets) || ' completed. Contact customer support to unlock next set.',
      'set_locked', true, 'current_set', _current_set
    );
  END IF;

  IF _profile.tasks_completed_today >= _total_tasks THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
  _tasks_in_set_before := _profile.tasks_completed_today - ((_current_set - 1) * _tasks_per_set);

  _base_deposit := GREATEST(COALESCE(_profile.initial_deposit, 0), 100);
  _base_deposit := LEAST(_base_deposit, ROUND(_profile.balance * 1.5, 2));
  _base_deposit := GREATEST(_base_deposit, 100);

  _noise_seed := _user_id::text || ':target:' || _current_set::text || ':' || _profile.last_task_reset::text;
  _target_jitter := (get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0)::numeric / 255) * 0.005;
  _set_target := ROUND(_base_deposit * (_set_percent + _target_jitter), 2);

  SELECT COALESCE(SUM(tr.advertising_salary), 0) INTO _salary_so_far
  FROM (
    SELECT advertising_salary
    FROM public.task_records
    WHERE user_id = _user_id
      AND created_at >= _profile.last_task_reset
      AND status = 'completed'
      AND task_type = 'regular'
    ORDER BY created_at ASC
    OFFSET ((_current_set - 1) * _tasks_per_set)
    LIMIT _tasks_in_set_before
  ) tr;

  _remaining_profit := GREATEST(_set_target - _salary_so_far, 0);
  _remaining_tasks := GREATEST(_tasks_per_set - _tasks_in_set_before, 1);
  _ideal_reward := _remaining_profit / _remaining_tasks;

  _noise_seed := _user_id::text || ':jitter:' || _profile.tasks_completed_today::text || ':' || _current_set::text || ':' || _profile.last_task_reset::text;
  _jitter_byte := get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0);
  _jitter := ((_jitter_byte::numeric / 255) - 0.5) * 0.80;
  _reward := ROUND(_ideal_reward * (1 + _jitter), 2);
  _reward := GREATEST(_reward, 0.01);

  _max_reward := ROUND(_base_deposit * (_set_percent + 0.005), 2) - _salary_so_far;
  IF _reward > _max_reward AND _max_reward > 0 THEN
    _reward := GREATEST(_max_reward, 0.01);
  ELSIF _max_reward <= 0 THEN
    _reward := 0.01;
  END IF;

  IF _ideal_reward > 0 AND _reward > _ideal_reward * 3 THEN
    _reward := ROUND(_ideal_reward * 3, 2);
  END IF;
  _reward := GREATEST(_reward, 0.01);

  _effective_amount := ROUND(_reward / _tier_percent, 2);
  _min_task := GREATEST(30, ROUND(_profile.balance * 0.15, 2));
  _effective_amount := GREATEST(_effective_amount, _min_task);
  _effective_amount := LEAST(_effective_amount, _profile.balance);
  _effective_amount := ROUND(_effective_amount, 2);

  _noise_byte4 := get_byte(decode(substr(md5(_noise_seed), 7, 2), 'hex'), 0);
  _decimal_noise := (_noise_byte4::numeric / 255) * 0.98 + 0.01;
  _effective_amount := FLOOR(_effective_amount) + _decimal_noise;
  _effective_amount := GREATEST(_effective_amount, _min_task);
  _effective_amount := LEAST(_effective_amount, _profile.balance);
  _effective_amount := ROUND(_effective_amount, 2);

  _reward := ROUND(_effective_amount * _tier_percent, 2);
  _reward := GREATEST(_reward, 0.01);

  IF _reward > _max_reward AND _max_reward > 0 THEN
    _reward := GREATEST(ROUND(_max_reward, 2), 0.01);
    _effective_amount := ROUND(_reward / _tier_percent, 2);
    _effective_amount := GREATEST(_effective_amount, _min_task);
    _effective_amount := LEAST(_effective_amount, _profile.balance);
  END IF;

  RETURN json_build_object(
    'success', true,
    'reward', _reward,
    'task_value', _effective_amount,
    'tier_percent', _tier_percent,
    'tasks_completed', _profile.tasks_completed_today,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set_before,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_task(_assignment_code text, _car_brand text, _car_image_url text, _car_name text, _total_amount numeric)
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
  _total_sets INTEGER := 3;
  _total_tasks INTEGER;
  _tier_percent NUMERIC;
  _current_set INTEGER;
  _tasks_in_set_before INTEGER;
  _tasks_in_set_after INTEGER;
  _max_allowed_tasks INTEGER;
  _effective_amount NUMERIC;
  _noise_seed TEXT;
  _noise_byte4 INTEGER;
  _decimal_noise NUMERIC;
  _min_task NUMERIC;
  _base_deposit NUMERIC;
  _set_target NUMERIC;
  _target_jitter NUMERIC;
  _salary_so_far NUMERIC;
  _max_reward NUMERIC;
  _ideal_reward NUMERIC;
  _remaining_profit NUMERIC;
  _remaining_tasks INTEGER;
  _jitter_byte INTEGER;
  _jitter NUMERIC;
  _set_percent NUMERIC;
  _referrer_id UUID;
  _set_earnings NUMERIC;
  _referral_bonus NUMERIC;
  _already_paid BOOLEAN;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Time restriction removed: promotions available 24/7

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Profile not found'); END IF;
  IF _profile.status <> 'active' THEN RETURN json_build_object('error', 'Account is restricted'); END IF;
  IF _profile.task_cycle_completed THEN RETURN json_build_object('error', 'Task cycle completed. Please contact customer service to renew or upgrade your plan.'); END IF;
  IF _profile.balance < 100 THEN RETURN json_build_object('error', 'Minimum balance of $100 required'); END IF;

  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010; _tasks_per_set := 55; _set_percent := 0.48;
    WHEN 'Expert' THEN _tier_percent := 0.008; _tasks_per_set := 50; _set_percent := 0.30;
    WHEN 'Professional' THEN _tier_percent := 0.006; _tasks_per_set := 45; _set_percent := 0.185;
    ELSE _tier_percent := 0.004; _tasks_per_set := 40; _set_percent := 0.09;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;
  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;

  IF _profile.tasks_completed_today >= _max_allowed_tasks THEN
    _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
    RETURN json_build_object(
      'error', 'Set ' || LEAST(_profile.tasks_completed_today / _tasks_per_set, _total_sets) || ' completed. Contact customer support to unlock next set.',
      'set_locked', true, 'current_set', _current_set
    );
  END IF;

  IF _profile.tasks_completed_today >= _total_tasks THEN
    RETURN json_build_object('error', 'Daily task limit reached');
  END IF;

  _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
  _tasks_in_set_before := _profile.tasks_completed_today - ((_current_set - 1) * _tasks_per_set);

  _base_deposit := GREATEST(COALESCE(_profile.initial_deposit, 0), 100);
  _base_deposit := LEAST(_base_deposit, ROUND(_profile.balance * 1.5, 2));
  _base_deposit := GREATEST(_base_deposit, 100);

  _noise_seed := _user_id::text || ':target:' || _current_set::text || ':' || _profile.last_task_reset::text;
  _target_jitter := (get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0)::numeric / 255) * 0.005;
  _set_target := ROUND(_base_deposit * (_set_percent + _target_jitter), 2);

  SELECT COALESCE(SUM(tr.advertising_salary), 0) INTO _salary_so_far
  FROM (
    SELECT advertising_salary
    FROM public.task_records
    WHERE user_id = _user_id
      AND created_at >= _profile.last_task_reset
      AND status = 'completed'
      AND task_type = 'regular'
    ORDER BY created_at ASC
    OFFSET ((_current_set - 1) * _tasks_per_set)
    LIMIT _tasks_in_set_before
  ) tr;

  _remaining_profit := GREATEST(_set_target - _salary_so_far, 0);
  _remaining_tasks := GREATEST(_tasks_per_set - _tasks_in_set_before, 1);
  _ideal_reward := _remaining_profit / _remaining_tasks;

  _noise_seed := _user_id::text || ':jitter:' || _profile.tasks_completed_today::text || ':' || _current_set::text || ':' || _profile.last_task_reset::text;
  _jitter_byte := get_byte(decode(substr(md5(_noise_seed), 1, 2), 'hex'), 0);
  _jitter := ((_jitter_byte::numeric / 255) - 0.5) * 0.80;
  _reward := ROUND(_ideal_reward * (1 + _jitter), 2);
  _reward := GREATEST(_reward, 0.01);

  _max_reward := ROUND(_base_deposit * (_set_percent + 0.005), 2) - _salary_so_far;
  IF _reward > _max_reward AND _max_reward > 0 THEN
    _reward := GREATEST(_max_reward, 0.01);
  ELSIF _max_reward <= 0 THEN
    _reward := 0.01;
  END IF;

  IF _ideal_reward > 0 AND _reward > _ideal_reward * 3 THEN
    _reward := ROUND(_ideal_reward * 3, 2);
  END IF;
  _reward := GREATEST(_reward, 0.01);

  _effective_amount := ROUND(_reward / _tier_percent, 2);
  _min_task := GREATEST(30, ROUND(_profile.balance * 0.15, 2));
  _effective_amount := GREATEST(_effective_amount, _min_task);
  _effective_amount := LEAST(_effective_amount, _profile.balance);

  _noise_byte4 := get_byte(decode(substr(md5(_noise_seed), 7, 2), 'hex'), 0);
  _decimal_noise := (_noise_byte4::numeric / 255) * 0.98 + 0.01;
  _effective_amount := FLOOR(_effective_amount) + _decimal_noise;
  _effective_amount := GREATEST(_effective_amount, _min_task);
  _effective_amount := LEAST(_effective_amount, _profile.balance);
  _effective_amount := ROUND(_effective_amount, 2);

  _reward := ROUND(_effective_amount * _tier_percent, 2);
  _reward := GREATEST(_reward, 0.01);

  IF _reward > _max_reward AND _max_reward > 0 THEN
    _reward := GREATEST(ROUND(_max_reward, 2), 0.01);
    _effective_amount := ROUND(_reward / _tier_percent, 2);
    _effective_amount := GREATEST(_effective_amount, _min_task);
    _effective_amount := LEAST(_effective_amount, _profile.balance);
  END IF;

  _new_balance := ROUND(_profile.balance + _reward, 2);
  _new_salary := ROUND(_profile.advertising_salary + _reward, 2);
  _new_task_count := _profile.tasks_completed_today + 1;
  _tasks_in_set_after := _new_task_count - ((_current_set - 1) * _tasks_per_set);

  UPDATE public.profiles
  SET balance = _new_balance,
      advertising_salary = _new_salary,
      tasks_completed_today = _new_task_count,
      task_cycle_completed = (_new_task_count >= _total_tasks),
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.task_records (user_id, car_brand, car_name, car_image_url, total_amount, advertising_salary, assignment_code, status)
  VALUES (_user_id, _car_brand, _car_name, _car_image_url, _effective_amount, _reward, _assignment_code, 'completed');

  IF _tasks_in_set_after >= _tasks_per_set THEN
    IF _profile.referred_by IS NOT NULL AND _profile.referred_by <> '' AND _profile.referred_by::uuid <> _user_id THEN
      _referrer_id := _profile.referred_by::uuid;

      SELECT EXISTS(
        SELECT 1 FROM public.referral_bonuses
        WHERE referred_user_id = _user_id
          AND set_number = _current_set
          AND reset_date = _profile.last_task_reset
      ) INTO _already_paid;

      IF NOT _already_paid THEN
        SELECT COALESCE(SUM(tr.advertising_salary), 0) + _reward INTO _set_earnings
        FROM (
          SELECT advertising_salary
          FROM public.task_records
          WHERE user_id = _user_id
            AND created_at >= _profile.last_task_reset
            AND status = 'completed'
            AND task_type = 'regular'
          ORDER BY created_at ASC
          OFFSET ((_current_set - 1) * _tasks_per_set)
          LIMIT (_tasks_per_set - 1)
        ) tr;

        _referral_bonus := ROUND(_set_earnings * 0.20, 2);

        IF _referral_bonus > 0 THEN
          UPDATE public.profiles
          SET balance = ROUND(balance + _referral_bonus, 2),
              updated_at = now()
          WHERE user_id = _referrer_id;

          INSERT INTO public.referral_bonuses (referrer_id, referred_user_id, set_number, bonus_amount, set_earnings, reset_date)
          VALUES (_referrer_id, _user_id, _current_set, _referral_bonus, _set_earnings, _profile.last_task_reset);

          INSERT INTO public.transactions (user_id, type, amount, status, description, method)
          VALUES (_referrer_id, 'referral_bonus', _referral_bonus, 'approved',
            'Referral bonus: 20% of set ' || _current_set || ' earnings from ' || COALESCE(_profile.username, 'user'),
            'referral');
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'new_balance', _new_balance,
    'new_salary', _new_salary,
    'reward', _reward,
    'task_value', _effective_amount,
    'tier_percent', _tier_percent,
    'tasks_completed', _new_task_count,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set_after,
    'tasks_per_set', _tasks_per_set,
    'total_tasks', _total_tasks,
    'task_cycle_completed', (_new_task_count >= _total_tasks),
    'set_completed', (_new_task_count >= _max_allowed_tasks)
  );
END;
$function$;

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

  -- Time restriction removed: promotions available 24/7

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