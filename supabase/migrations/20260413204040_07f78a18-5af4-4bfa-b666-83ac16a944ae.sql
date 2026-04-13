
-- 1. Remove user INSERT policy on transactions (transactions should only be created via RPCs)
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

-- 2. Make kyc-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'kyc-documents';

-- 3. Make support-attachments bucket private  
UPDATE storage.buckets SET public = false WHERE id = 'support-attachments';

-- 4. Create server-side withdraw password verification RPC
CREATE OR REPLACE FUNCTION public.verify_withdraw_password(_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _stored_password TEXT;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT withdraw_password INTO _stored_password
  FROM public.profiles
  WHERE user_id = _user_id;

  IF _stored_password IS NULL OR _stored_password = '' THEN
    RETURN true; -- No password set
  END IF;

  RETURN _stored_password = _password;
END;
$$;

-- 5. Create server-side withdraw password update RPC
CREATE OR REPLACE FUNCTION public.update_withdraw_password(_old_password text, _new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _stored_password TEXT;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF _new_password IS NULL OR TRIM(_new_password) = '' THEN
    RETURN json_build_object('error', 'New password cannot be empty');
  END IF;

  IF LENGTH(_new_password) < 4 OR LENGTH(_new_password) > 64 THEN
    RETURN json_build_object('error', 'Password must be 4-64 characters');
  END IF;

  SELECT withdraw_password INTO _stored_password
  FROM public.profiles
  WHERE user_id = _user_id;

  -- If a password exists, verify the old one
  IF _stored_password IS NOT NULL AND _stored_password <> '' THEN
    IF _old_password IS NULL OR _old_password <> _stored_password THEN
      RETURN json_build_object('error', 'Old password incorrect');
    END IF;
  END IF;

  UPDATE public.profiles
  SET withdraw_password = _new_password, updated_at = now()
  WHERE user_id = _user_id;

  RETURN json_build_object('success', true);
END;
$$;
