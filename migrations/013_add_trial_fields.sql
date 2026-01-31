-- Migration 013: Add 7-Day Free Trial Fields
-- Description: Adds columns to track trial start date and subscription status

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_started_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false;

-- Index for faster access control checks
CREATE INDEX IF NOT EXISTS idx_profiles_trial ON profiles (id, has_started_trial, trial_start_date, is_subscribed);
