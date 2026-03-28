-- Backfill referral codes for existing users who don't have one
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR rec IN SELECT id FROM public.profiles WHERE referral_code IS NULL OR referral_code = ''
  LOOP
    LOOP
      new_code := UPPER(SUBSTRING(MD5(gen_random_uuid()::text || clock_timestamp()::text) FROM 1 FOR 8));
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE public.profiles SET referral_code = new_code WHERE id = rec.id;
  END LOOP;
END $$;