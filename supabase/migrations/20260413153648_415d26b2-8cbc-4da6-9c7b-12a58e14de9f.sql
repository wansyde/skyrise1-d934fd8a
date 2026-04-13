
-- Add set_number column to aaa_assignments
ALTER TABLE public.aaa_assignments
ADD COLUMN set_number integer NOT NULL DEFAULT 1;

-- Add unique constraint to prevent duplicates (user + set + position)
CREATE UNIQUE INDEX idx_aaa_unique_user_set_position
ON public.aaa_assignments (user_id, set_number, task_position)
WHERE status = 'active';
