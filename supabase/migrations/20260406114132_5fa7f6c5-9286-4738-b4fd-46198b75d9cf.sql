
-- Add image_url column to ticket_messages
ALTER TABLE public.ticket_messages ADD COLUMN image_url text;

-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', true);

-- Allow authenticated users to upload to support-attachments
CREATE POLICY "Users can upload support attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'support-attachments');

-- Allow anyone to view support attachments (public bucket)
CREATE POLICY "Anyone can view support attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'support-attachments');

-- Allow admins to delete support attachments
CREATE POLICY "Admins can delete support attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'support-attachments' AND public.has_role(auth.uid(), 'admin'));
