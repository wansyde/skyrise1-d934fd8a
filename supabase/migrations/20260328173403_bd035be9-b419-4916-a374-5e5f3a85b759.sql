
-- Admin activity logs table
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  admin_username text NOT NULL DEFAULT '',
  action_type text NOT NULL,
  target_user_id uuid,
  target_username text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all logs"
ON public.admin_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only system (via security definer functions) can insert logs
CREATE POLICY "Admins can insert logs"
ON public.admin_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- No update or delete allowed (read-only after insert)

-- Helper function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action_type text,
  _target_user_id uuid DEFAULT NULL,
  _description text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_id uuid;
  _admin_name text;
  _target_name text;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL THEN RETURN; END IF;
  
  SELECT COALESCE(username, email, '') INTO _admin_name
  FROM public.profiles WHERE user_id = _admin_id LIMIT 1;
  
  IF _target_user_id IS NOT NULL THEN
    SELECT COALESCE(username, email, '') INTO _target_name
    FROM public.profiles WHERE user_id = _target_user_id LIMIT 1;
  END IF;
  
  INSERT INTO public.admin_logs (admin_user_id, admin_username, action_type, target_user_id, target_username, description)
  VALUES (_admin_id, COALESCE(_admin_name, ''), _action_type, _target_user_id, _target_name, _description);
END;
$$;

-- Add logging to admin_deposit
CREATE OR REPLACE FUNCTION public.admin_deposit(_user_id uuid, _amount numeric, _note text DEFAULT '')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL THEN RETURN json_build_object('error', 'Not authenticated'); END IF;
  IF NOT has_role(_admin_id, 'admin') THEN RETURN json_build_object('error', 'Unauthorized'); END IF;
  IF _amount <= 0 THEN RETURN json_build_object('error', 'Amount must be positive'); END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'User not found'); END IF;

  _new_balance := ROUND(_profile.balance + _amount, 2);
  UPDATE public.profiles SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;

  INSERT INTO public.deposits (user_id, amount, method, status, admin_note, wallet_address)
  VALUES (_user_id, _amount, 'admin', 'approved', _note, _admin_id::text);

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'deposit', _amount, 'approved', COALESCE(NULLIF(_note, ''), 'Admin deposit'), 'admin');

  PERFORM log_admin_action('deposit', _user_id, 'Deposited $' || _amount::text || ' (Balance: $' || _profile.balance::text || ' → $' || _new_balance::text || ')');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$$;

-- Add logging to admin_withdraw
CREATE OR REPLACE FUNCTION public.admin_withdraw(_user_id uuid, _amount numeric, _note text DEFAULT '')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL THEN RETURN json_build_object('error', 'Not authenticated'); END IF;
  IF NOT has_role(_admin_id, 'admin') THEN RETURN json_build_object('error', 'Unauthorized'); END IF;
  IF _amount <= 0 THEN RETURN json_build_object('error', 'Amount must be positive'); END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'User not found'); END IF;
  IF _profile.balance < _amount THEN RETURN json_build_object('error', 'Insufficient balance'); END IF;

  _new_balance := ROUND(_profile.balance - _amount, 2);
  UPDATE public.profiles SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;

  INSERT INTO public.withdrawals (user_id, amount, method, status, admin_note, wallet_address)
  VALUES (_user_id, _amount, 'admin', 'approved', _note, _admin_id::text);

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'withdrawal', -_amount, 'approved', COALESCE(NULLIF(_note, ''), 'Admin withdrawal'), 'admin');

  PERFORM log_admin_action('withdrawal', _user_id, 'Withdrew $' || _amount::text || ' (Balance: $' || _profile.balance::text || ' → $' || _new_balance::text || ')');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$$;
