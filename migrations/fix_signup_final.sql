
-- 1. Relax constraints on profiles table
-- We drop NOT NULL constraints on all columns except 'id' to ensure signup never fails
DO $$
BEGIN
    -- List of columns to potentially drop NOT NULL from
    -- These are columns that have been mentioned in various parts of the app
    
    -- email
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- phone
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- country_code
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN country_code DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- first_name
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN first_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- last_name
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN last_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- full_name
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- username
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- trading_experience
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN trading_experience DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- bank_name
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN bank_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- account_number
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN account_number DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- account_name
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN account_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- subscription_status
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN subscription_status DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- Ensure defaults for essential columns
ALTER TABLE public.profiles ALTER COLUMN is_admin SET DEFAULT FALSE;
ALTER TABLE public.profiles ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- 2. Create the robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- We include only the absolute bare minimum here
  -- Use ON CONFLICT to avoid duplicate errors
  INSERT INTO public.profiles (id, email, is_admin, subscription_tier)
  VALUES (
    NEW.id, 
    NEW.email, 
    FALSE, 
    'free'
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email; 
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- CRITICAL: This exception block ensures that auth.users insertion
  -- is NEVER blocked by errors in the profiles table trigger.
  -- "Database error saving new user" happens when this trigger fails.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Manual fix for any users missed due to previous failures
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
