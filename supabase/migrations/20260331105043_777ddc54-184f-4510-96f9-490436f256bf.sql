
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE referral_code = UPPER(TRIM(_code))
  )
$$;
