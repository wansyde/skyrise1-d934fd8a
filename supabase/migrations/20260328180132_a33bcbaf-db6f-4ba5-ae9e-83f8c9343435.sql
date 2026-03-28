
ALTER TABLE public.profiles ADD COLUMN saved_wallet_name text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN saved_wallet_address text DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.submit_withdrawal(_amount numeric, _wallet_address text, _wallet_name text DEFAULT NULL)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  IF _profile.status <> 'active' THEN
    RETURN json_build_object('error', 'Account is restricted');
  END IF;

  IF _amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  IF _amount > _profile.balance THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  IF _wallet_address IS NULL OR TRIM(_wallet_address) = '' THEN
    RETURN json_build_object('error', 'Wallet address is required');
  END IF;

  _new_balance := ROUND(_profile.balance - _amount, 2);

  -- Deduct balance immediately
  UPDATE public.profiles SET balance = _new_balance, updated_at = now(),
    saved_wallet_name = COALESCE(NULLIF(TRIM(_wallet_name), ''), saved_wallet_name),
    saved_wallet_address = COALESCE(NULLIF(TRIM(_wallet_address), ''), saved_wallet_address)
  WHERE user_id = _user_id;

  -- Create withdrawal request with pending status
  INSERT INTO public.withdrawals (user_id, amount, method, status, wallet_address)
  VALUES (_user_id, _amount, 'USDT (TRC-20)', 'pending', TRIM(_wallet_address));

  -- Log transaction
  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'withdrawal', -_amount, 'pending', 'Withdrawal request', 'USDT (TRC-20)');

  RETURN json_build_object('success', true, 'new_balance', _new_balance);
END;
$function$;
