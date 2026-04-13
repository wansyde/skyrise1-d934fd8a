-- Drop the ALL policy and replace with specific policies
DROP POLICY IF EXISTS "Admins can manage aaa_assignments" ON public.aaa_assignments;

CREATE POLICY "Admins can select aaa_assignments"
ON public.aaa_assignments FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert aaa_assignments"
ON public.aaa_assignments FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update aaa_assignments"
ON public.aaa_assignments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete aaa_assignments"
ON public.aaa_assignments FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));