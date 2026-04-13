CREATE POLICY "Admins can view all task_records"
ON public.task_records FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));