-- Add is_active column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update RLS policies to respect is_active if necessary
-- For now, we handle this in the application middleware layer for broader blocking
-- But strictly speaking, we could add it to RLS too.
-- Let's keep it simple and handle it in middleware/logic first to avoid locking users out of their own profile reads if we just want to block actions.
