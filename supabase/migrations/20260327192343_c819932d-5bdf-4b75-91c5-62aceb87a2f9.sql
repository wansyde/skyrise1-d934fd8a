
CREATE TABLE public.task_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_brand text NOT NULL,
  car_name text NOT NULL,
  car_image_url text,
  total_amount numeric NOT NULL DEFAULT 0,
  advertising_salary numeric NOT NULL DEFAULT 0,
  assignment_code text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task records"
  ON public.task_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task records"
  ON public.task_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
