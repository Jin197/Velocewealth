-- ============================================================
-- Velocewealth · profiles.email Uniqueness
-- Enforce a unique constraint on email in the profiles table.
-- ============================================================

ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
