
-- Support settings table (admin-controlled WhatsApp number etc.)
CREATE TABLE public.support_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read support settings
CREATE POLICY "Anyone can read support settings"
  ON public.support_settings FOR SELECT TO public
  USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage support settings"
  ON public.support_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Seed default WhatsApp number
INSERT INTO public.support_settings (key, value) VALUES ('whatsapp_number', '');

-- Support messages table
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sender_type text NOT NULL DEFAULT 'user' CHECK (sender_type IN ('user', 'admin')),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view own messages
CREATE POLICY "Users can view own support messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert own messages (as user type)
CREATE POLICY "Users can send support messages"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

-- Admins can view all messages
CREATE POLICY "Admins can view all support messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can insert messages for any user
CREATE POLICY "Admins can send support messages"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') AND sender_type = 'admin');

-- Admins can delete messages
CREATE POLICY "Admins can delete support messages"
  ON public.support_messages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for support messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Index for fast lookups
CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id, created_at);
