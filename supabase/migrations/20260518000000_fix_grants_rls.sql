-- ============================================================
-- Velocewealth · Fix GRANT privileges & service_role access
-- 
-- Problem: "permission denied for table vehicles" when using
-- the service_role key (cron jobs, webhooks, admin scripts).
--
-- Root cause: RLS is enabled but no explicit GRANT statements
-- exist for the 'service_role', 'authenticated', and 'anon'
-- roles on the public schema tables.
--
-- Solution:
--   1. GRANT usage on the public schema to all Supabase roles.
--   2. GRANT full CRUD to 'service_role' (admin backend).
--   3. GRANT full CRUD to 'authenticated' (logged-in users,
--      still filtered by RLS policies).
--   4. GRANT read-only to 'anon' on public catalogs only.
-- ============================================================

-- ===== 1. Schema-level access =====
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ===== 2. service_role: Full access (bypasses RLS by default) =====
-- User-owned tables
GRANT ALL ON public.profiles           TO service_role;
GRANT ALL ON public.vehicles           TO service_role;
GRANT ALL ON public.fuel_entries       TO service_role;
GRANT ALL ON public.maintenance_entries TO service_role;
GRANT ALL ON public.maintenance_alerts TO service_role;
GRANT ALL ON public.subscriptions      TO service_role;
GRANT ALL ON public.audit_logs         TO service_role;
GRANT ALL ON public.phm_feedback       TO service_role;

-- Public catalog tables
GRANT ALL ON public.stations TO service_role;
GRANT ALL ON public.garages  TO service_role;

-- ===== 3. authenticated: CRUD (filtered by RLS policies) =====
-- User-owned tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_entries       TO authenticated;
GRANT SELECT, INSERT                 ON public.maintenance_entries TO authenticated;
GRANT SELECT, UPDATE, DELETE         ON public.maintenance_alerts TO authenticated;
GRANT SELECT                         ON public.subscriptions      TO authenticated;
GRANT SELECT                         ON public.audit_logs         TO authenticated;
GRANT SELECT, INSERT                 ON public.phm_feedback       TO authenticated;

-- Public catalog tables (read-only for normal users)
GRANT SELECT ON public.stations TO authenticated;
GRANT SELECT ON public.garages  TO authenticated;

-- ===== 4. anon: Read-only on public catalogs =====
GRANT SELECT ON public.stations TO anon;
GRANT SELECT ON public.garages  TO anon;

-- ===== 5. Future tables: auto-GRANT for new tables =====
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
