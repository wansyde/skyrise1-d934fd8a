
-- Create KYC documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- RLS: Users can upload their own KYC docs
CREATE POLICY "Users can upload own kyc docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can view their own KYC docs
CREATE POLICY "Users can view own kyc docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can view all KYC docs
CREATE POLICY "Admins can view all kyc docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND public.has_role(auth.uid(), 'admin'));

-- Add KYC fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_name text,
ADD COLUMN IF NOT EXISTS kyc_id_number text,
ADD COLUMN IF NOT EXISTS kyc_id_type text,
ADD COLUMN IF NOT EXISTS kyc_front_url text,
ADD COLUMN IF NOT EXISTS kyc_back_url text,
ADD COLUMN IF NOT EXISTS kyc_selfie_url text,
ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamp with time zone;
