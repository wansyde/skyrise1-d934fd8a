
-- Revoke column-level SELECT on withdraw_password so it never reaches any client (user or admin).
-- The verify_withdraw_password / update_withdraw_password / admin_reset_withdraw_password RPCs
-- are SECURITY DEFINER and bypass column grants for legitimate verification.
REVOKE SELECT (withdraw_password) ON public.profiles FROM PUBLIC, anon, authenticated;
