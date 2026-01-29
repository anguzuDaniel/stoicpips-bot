-- Add payment tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_payment_ref TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
