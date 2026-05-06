
-- ============ STORAGE POLICIES ============
-- Support attachments: drop public read, add owner + admin
DROP POLICY IF EXISTS "Anyone can view support attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload support attachments" ON storage.objects;

CREATE POLICY "Users can view own support attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all support attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can upload own support attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars: bucket is no longer used (default avatar enforced); make private + remove public listing
UPDATE storage.buckets SET public = false WHERE id = 'avatars';
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;

CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all avatars"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND public.has_role(auth.uid(), 'admin')
);

-- ============ AAA ASSIGNMENTS ============
-- Remove unassigned-row exposure
DROP POLICY IF EXISTS "Users can view own aaa_assignments" ON public.aaa_assignments;
CREATE POLICY "Users can view own aaa_assignments"
ON public.aaa_assignments FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ============ REVOKE EXECUTE ON SECURITY DEFINER FUNCTIONS ============
-- Revoke anon/authenticated execute for sensitive functions; keep targeted GRANTs

-- Admin-only functions: revoke all, admins call via authenticated session (RLS check inside)
REVOKE EXECUTE ON FUNCTION public.admin_reset_withdraw_password(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_deposit(uuid, numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_withdraw(uuid, numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, uuid, text) FROM PUBLIC, anon;

-- User-only functions: revoke from anon, allow authenticated
REVOKE EXECUTE ON FUNCTION public.update_withdraw_password(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_withdraw_password(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_kyc(text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_withdrawal(numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_withdrawal(numeric, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.preview_task(numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.complete_task(text, text, text, text, numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.complete_aaa_task(uuid, text[], numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_pending_task(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.invest_in_plan(uuid, numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.update_withdraw_password(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_withdraw_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_kyc(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_withdrawal(numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_withdrawal(numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.preview_task(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_task(text, text, text, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_aaa_task(uuid, text[], numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pending_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invest_in_plan(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_withdraw_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_deposit(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_withdraw(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, uuid, text) TO authenticated;

-- validate_referral_code and get_email_by_username are intentionally callable by anon
-- (used during registration/login flows). Keep those grants.

-- ============ REALTIME CHANNEL AUTHORIZATION ============
-- Enable RLS on realtime.messages and require authenticated subscribers.
-- (postgres_changes already filters per-table RLS; this gates broadcast/presence channels.)
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can receive realtime"
ON realtime.messages FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can broadcast realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast realtime"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (true);
