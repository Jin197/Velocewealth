-- Migration to relax profiles.plan_tier check constraint to include 'family'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_tier_check CHECK (plan_tier IN ('free', 'premium', 'family'));
