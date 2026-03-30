CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  referrer_user_id UUID;
  ref_code TEXT;
BEGIN
  ref_code := UPPER(TRIM(COALESCE(NEW.raw_user_meta_data->>'referred_by', '')));
  
  IF ref_code <> '' THEN
    SELECT user_id INTO referrer_user_id
    FROM public.profiles
    WHERE referral_code = ref_code
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, phone, username, gender, withdraw_password, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', ''),
    COALESCE(NEW.raw_user_meta_data->>'withdraw_password', ''),
    COALESCE(referrer_user_id::text, '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;