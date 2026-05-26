-- ============================================================
-- Velocewealth · Add onboarding fields to profiles table
-- ============================================================

alter table public.profiles
  add column if not exists has_completed_onboarding boolean not null default false,
  add column if not exists onboarding_persona text check (onboarding_persona in ('collector','daily','fleet')),
  add column if not exists onboarding_objective text check (onboarding_objective in ('tco','phm','resale')),
  add column if not exists onboarding_motorization text check (onboarding_motorization in ('hybrid','electric','thermal'));
