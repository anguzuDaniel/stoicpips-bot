-- Migration: Add has_taken_first_trade to profiles
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_taken_first_trade BOOLEAN DEFAULT FALSE;

-- Optional: Reset existing free users to allow them one trade if desired
-- UPDATE public.profiles SET has_taken_first_trade = FALSE WHERE subscription_tier = 'free';
