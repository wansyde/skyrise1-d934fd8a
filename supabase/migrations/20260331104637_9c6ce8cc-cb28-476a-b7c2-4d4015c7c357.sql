
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS isp text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS connection_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vpn boolean DEFAULT false;
