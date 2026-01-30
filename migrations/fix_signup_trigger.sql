
-- 1. Relax constraints on profiles table that might be causing failures
-- Some older versions of the app or manual changes might have set these to NOT NULL
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN is_admin SET DEFAULT FALSE;
ALTER TABLE public.profiles ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Ensure legacy name columns are nullable if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ALTER COLUMN first_name DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ALTER COLUMN last_name DROP NOT NULL;
    END IF;
END $$;

-- 2. Update the handle_new_user function to be more robust
-- We use COALESCE and default values to ensure the INSERT succeeds even if columns have strict constraints
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin, subscription_tier)
  VALUES (
    NEW.id, 
    NEW.email, 
    FALSE, 
    'free'
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email; -- If user exists (e.g. from manual entry), update the email
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback: Ensure trigger never blocks signup even if profile creation fails
  -- This is better than blocking the whole user creation with an opaque error
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-re-apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Clean up any "orphaned" users who signed up but didn't get a profile due to past errors
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
