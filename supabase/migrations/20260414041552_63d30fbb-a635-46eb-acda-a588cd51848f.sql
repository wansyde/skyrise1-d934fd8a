
CREATE OR REPLACE FUNCTION public.preview_task(_total_amount numeric)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  _set_min_target NUMERIC;
  _set_max_target NUMERIC;
  _set_target_profit NUMERIC;
  _set_profit_so_far NUMERIC := 0;
  _remaining_tasks_in_set INTEGER;
  _effective_amount NUMERIC;
  _seed_text TEXT;
  _seed_ratio NUMERIC;
  _avg_reward NUMERIC;
  _jitter NUMERIC;
  _budget_left NUMERIC;
  _max_allowed_tasks INTEGER;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Profile not found'); END IF;

  -- Tier-specific settings (same as complete_task)
  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_percent := 0.010; _tasks_per_set := 55;
    WHEN 'Expert' THEN _tier_percent := 0.008; _tasks_per_set := 50;
    WHEN 'Professional' THEN _tier_percent := 0.006; _tasks_per_set := 45;
    ELSE _tier_percent := 0.004; _tasks_per_set := 40;
  END CASE;

  _total_tasks := _tasks_per_set * _total_sets;
  _max_allowed_tasks := COALESCE(_profile.current_unlocked_set, 1) * _tasks_per_set;

  IF _profile.tasks_completed_today >= _total_tasks OR _profile.tasks_completed_today >= _max_allowed_tasks THEN
    RETURN json_build_object('error', 'No tasks available');
  END IF;

  _current_set := LEAST((_profile.tasks_completed_today / _tasks_per_set) + 1, _total_sets);
  _tasks_in_set_before := _profile.tasks_completed_today - ((_current_set - 1) * _tasks_per_set);

  -- Set targets (same as complete_task)
  CASE _profile.vip_level
    WHEN 'Elite' THEN
      CASE _current_set WHEN 1 THEN _set_min_target:=150; _set_max_target:=250; WHEN 2 THEN _set_min_target:=140; _set_max_target:=230; ELSE _set_min_target:=150; _set_max_target:=250; END CASE;
    WHEN 'Expert' THEN
      CASE _current_set WHEN 1 THEN _set_min_target:=60; _set_max_target:=80; WHEN 2 THEN _set_min_target:=55; _set_max_target:=75; ELSE _set_min_target:=60; _set_max_target:=80; END CASE;
    WHEN 'Professional' THEN
      CASE _current_set WHEN 1 THEN _set_min_target:=25; _set_max_target:=30; WHEN 2 THEN _set_min_target:=23; _set_max_target:=28; ELSE _set_min_target:=25; _set_max_target:=30; END CASE;
    ELSE
      CASE _current_set WHEN 1 THEN _set_min_target:=8; _set_max_target:=10; WHEN 2 THEN _set_min_target:=7; _set_max_target:=9; ELSE _set_min_target:=8; _set_max_target:=10; END CASE;
  END CASE;

  -- Deterministic set target (same seed as complete_task)
  _seed_text := _user_id::text || ':' || to_char(COALESCE(_profile.last_task_reset, now()) AT TIME ZONE 'UTC', 'YYYYMMDD') || ':' || _current_set::text || ':' || COALESCE(_profile.vip_level, 'Junior');
  _seed_ratio := get_byte(decode(substr(md5(_seed_text), 1, 2), 'hex'), 0)::numeric / 255;
  _set_target_profit := ROUND(_set_min_target + ((_set_max_target - _set_min_target) * _seed_ratio), 2);

  -- Sum profit earned so far in this set
  IF _tasks_in_set_before > 0 THEN
    SELECT COALESCE(SUM(CASE WHEN recent.status = 'completed' THEN recent.advertising_salary ELSE 0 END), 0)
    INTO _set_profit_so_far
    FROM (
      SELECT advertising_salary, status
      FROM public.task_records
      WHERE user_id = _user_id
        AND created_at >= COALESCE(_profile.last_task_reset, '-infinity'::timestamptz)
      ORDER BY created_at DESC, id DESC
      LIMIT _tasks_in_set_before
    ) AS recent;
  END IF;

  _remaining_tasks_in_set := _tasks_per_set - _tasks_in_set_before;
  _budget_left := GREATEST(_set_target_profit - _set_profit_so_far, 0);

  -- Reward calculation (same logic as complete_task)
  IF _remaining_tasks_in_set <= 0 OR _budget_left <= 0 THEN
    _reward := 0;
  ELSIF _remaining_tasks_in_set = 1 THEN
    _reward := LEAST(_budget_left, _set_max_target - _set_profit_so_far);
    _reward := GREATEST(_reward, 0);
  ELSE
    _avg_reward := _budget_left / _remaining_tasks_in_set;
    _seed_text := _user_id::text || ':' || _profile.tasks_completed_today::text || ':' || clock_timestamp()::text;
    _jitter := (get_byte(decode(substr(md5(_seed_text), 3, 2), 'hex'), 0)::numeric / 255) * 0.6 - 0.3;
    _reward := _avg_reward * (1 + _jitter);
    _reward := LEAST(_reward, _budget_left, _set_max_target - _set_profit_so_far);
    _reward := GREATEST(_reward, 0);
  END IF;

  _reward := ROUND(_reward, 2);
  _effective_amount := CASE WHEN _tier_percent > 0 THEN ROUND(_reward / _tier_percent, 2) ELSE 0 END;

  RETURN json_build_object(
    'success', true,
    'reward', _reward,
    'task_value', _effective_amount,
    'tier_percent', _tier_percent,
    'vip_level', _profile.vip_level,
    'current_set', _current_set,
    'tasks_in_set', _tasks_in_set_before,
    'tasks_per_set', _tasks_per_set,
    'set_target_profit', _set_target_profit,
    'set_profit_so_far', _set_profit_so_far,
    'budget_left', _budget_left
  );
END;
$$;
