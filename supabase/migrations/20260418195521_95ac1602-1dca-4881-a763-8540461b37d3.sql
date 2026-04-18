-- Make the daily reset a no-op so user progress persists indefinitely.
-- Progress should ONLY be reset by an explicit admin action, never by a cron.
CREATE OR REPLACE FUNCTION public.reset_tasks_for_new_et_day()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Intentionally does nothing.
  -- Task count, current_unlocked_set, and task_cycle_completed are preserved
  -- across days, reloads, and working-hour boundaries.
  -- Only admin actions may reset user progress.
  RETURN json_build_object(
    'success', true,
    'affected', 0,
    'note', 'auto-reset disabled; admin-only reset'
  );
END;
$$;