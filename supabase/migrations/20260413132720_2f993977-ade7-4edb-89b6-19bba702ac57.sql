
CREATE OR REPLACE FUNCTION public.submit_withdrawal(_amount numeric, _wallet_address text, _wallet_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _profile RECORD;
  _new_balance NUMERIC;
  _tier_max NUMERIC;
  _status TEXT;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF _amount < 100 THEN
    RETURN json_build_object('error', 'Minimum withdrawal amount is $100');
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

  -- Tier-based max withdrawal limit
  CASE _profile.vip_level
    WHEN 'Elite' THEN _tier_max := 100000;
    WHEN 'Expert' THEN _tier_max := 60000;
    WHEN 'Professional' THEN _tier_max := 10000;
    ELSE _tier_max := 5000;
  END CASE;

  IF _amount > _tier_max THEN
    RETURN json_build_object('error', 'Maximum withdrawal for your level is ' || _tier_max::text || ' USDC');
  END IF;

  -- Determine status: manual review for 10k+
  IF _amount >= 10000 THEN
    _status := 'pending_review';
  ELSE
    _status := 'pending';
  END IF;

  _new_balance := ROUND(_profile.balance - _amount, 2);

  UPDATE public.profiles SET balance = _new_balance, updated_at = now(),
    saved_wallet_name = COALESCE(NULLIF(TRIM(_wallet_name), ''), saved_wallet_name),
    saved_wallet_address = COALESCE(NULLIF(TRIM(_wallet_address), ''), saved_wallet_address)
  WHERE user_id = _user_id;

  INSERT INTO public.withdrawals (user_id, amount, method, status, wallet_address)
  VALUES (_user_id, _amount, 'USDT (TRC-20)', _status, TRIM(_wallet_address));

  INSERT INTO public.transactions (user_id, type, amount, status, description, method)
  VALUES (_user_id, 'withdrawal', -_amount, _status, 
    CASE WHEN _status = 'pending_review' THEN 'Withdrawal pending manual review' ELSE 'Withdrawal request' END,
    'USDT (TRC-20)');

  IF _status = 'pending_review' THEN
    RETURN json_build_object('success', true, 'new_balance', _new_balance, 'status', 'pending_review',
      'message', 'Withdrawal submitted. Awaiting manual review.');
  END IF;

  RETURN json_build_object('success', true, 'new_balance', _new_balance, 'status', 'pending');
END;
$function$;
