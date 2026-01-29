-- Migration to add bank account details to profiles table
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT;

COMMENT ON COLUMN public.profiles.bank_name IS 'The name of the user''s bank';
COMMENT ON COLUMN public.profiles.account_number IS 'The user''s bank account number';
COMMENT ON COLUMN public.profiles.account_name IS 'The name on the user''s bank account';
