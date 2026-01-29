-- Migration to add onboarding fields to profiles table
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS trading_experience TEXT;

COMMENT ON COLUMN public.profiles.full_name IS 'User''s display name';
COMMENT ON COLUMN public.profiles.username IS 'Unique handle for the user';
COMMENT ON COLUMN public.profiles.trading_experience IS 'User''s self-reported trading level (e.g., beginner, intermediate, pro)';
