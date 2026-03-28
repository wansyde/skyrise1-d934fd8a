
-- Create admin_deposit function: adds balance and creates deposit record
CREATE OR REPLACE FUNCTION public.admin_deposit(_user_id uuid, _amount numeric, _note text DEFAULT '')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF NOT has_role(_admin_id, 'admin') THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF _amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  _new_balance := ROUND(_profile.balance + _amount, 2);

  UPDATE public.profiles SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;

  INSERT INTO public.deposits (user_id, amount, method, status, admin_note, wallet_address)
  VALUES (_user_id, _amount, 'admin', 'approved', _note, _admin_id::text);

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'deposit', _amount, 'approved', COALESCE(NULLIF(_note, ''), 'Admin deposit'), 'admin');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$function$;

-- Create admin_withdraw function: deducts balance and creates withdrawal record
CREATE OR REPLACE FUNCTION public.admin_withdraw(_user_id uuid, _amount numeric, _note text DEFAULT '')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF NOT has_role(_admin_id, 'admin') THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;

  IF _amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  IF _profile.balance < _amount THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  _new_balance := ROUND(_profile.balance - _amount, 2);

  UPDATE public.profiles SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;

  INSERT INTO public.withdrawals (user_id, amount, method, status, admin_note, wallet_address)
  VALUES (_user_id, _amount, 'admin', 'approved', _note, _admin_id::text);

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'withdrawal', -_amount, 'approved', COALESCE(NULLIF(_note, ''), 'Admin withdrawal'), 'admin');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$function$;
