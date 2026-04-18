
-- 1. Create the ET-aware reset function used by the daily cron
CREATE OR REPLACE FUNCTION public.reset_tasks_for_new_et_day()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _et_today_start TIMESTAMPTZ;
  _affected INTEGER;
BEGIN
  -- Start of "today" in Eastern Time, expressed as a UTC timestamptz
  _et_today_start := (date_trunc('day', (now() AT TIME ZONE 'America/New_York'))) AT TIME ZONE 'America/New_York';

  UPDATE public.profiles
  SET tasks_completed_today = 0,
      current_unlocked_set = 1,
      task_cycle_completed = false,
      last_task_reset = _et_today_start,
      updated_at = now()
  WHERE last_task_reset < _et_today_start;

  GET DIAGNOSTICS _affected = ROW_COUNT;
  RETURN json_build_object('success', true, 'affected', _affected, 'et_today_start', _et_today_start);
END;
$$;

-- 2. Heal users whose counter was wrongly wiped: rebuild from task_records since their reset
WITH recomputed AS (
  SELECT
    p.user_id,
    COUNT(tr.id)::int AS real_count
  FROM public.profiles p
  LEFT JOIN public.task_records tr
    ON tr.user_id = p.user_id
   AND tr.created_at >= p.last_task_reset
  WHERE p.tasks_completed_today = 0
  GROUP BY p.user_id
)
UPDATE public.profiles p
SET tasks_completed_today = r.real_count,
    updated_at = now()
FROM recomputed r
WHERE p.user_id = r.user_id
  AND r.real_count > 0;

-- 3. Realign last_task_reset for any user whose reset is in the future relative to ET today
UPDATE public.profiles
SET last_task_reset = (date_trunc('day', (now() AT TIME ZONE 'America/New_York'))) AT TIME ZONE 'America/New_York',
    updated_at = now()
WHERE last_task_reset > now();
