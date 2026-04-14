
CREATE OR REPLACE FUNCTION public.admin_reset_withdraw_password(_user_id uuid, _new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_id UUID;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  IF NOT has_role(_admin_id, 'admin') THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;
  IF _new_password IS NULL OR TRIM(_new_password) = '' THEN
    RETURN json_build_object('error', 'Password cannot be empty');
  END IF;
  IF LENGTH(_new_password) < 4 OR LENGTH(_new_password) > 64 THEN
    RETURN json_build_object('error', 'Password must be 4-64 characters');
  END IF;

  UPDATE public.profiles
  SET withdraw_password = _new_password, updated_at = now()
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  PERFORM log_admin_action('reset_withdraw_password', _user_id, 'Reset transaction password');

  RETURN json_build_object('success', true, 'message', 'Transaction password reset successfully');
END;
$$;
