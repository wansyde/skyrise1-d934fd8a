
-- Drop the old unique index
DROP INDEX IF EXISTS public.idx_aaa_unique_user_set_position;

-- Create a partial unique index that only applies to active assignments
CREATE UNIQUE INDEX idx_aaa_unique_user_set_position 
ON public.aaa_assignments (user_id, set_number, task_position) 
WHERE status = 'active';
