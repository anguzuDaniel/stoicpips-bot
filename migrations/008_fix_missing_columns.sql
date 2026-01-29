-- Force-ensuring card info columns exist
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Refresh PostgreST schema cache
NOTIFY pgrst, 'reload schema';
