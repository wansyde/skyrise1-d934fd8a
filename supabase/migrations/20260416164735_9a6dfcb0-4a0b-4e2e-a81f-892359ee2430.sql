
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
CHECK (type IN ('deposit', 'withdrawal', 'task', 'referral_bonus', 'investment', 'set_profit', 'bonus'));
