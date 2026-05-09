-- ============================================================
-- Velocewealth · Row Level Security
-- Every user-owned table is locked down to user_id = auth.uid().
-- Public catalog tables (stations, garages) are readable by anyone authenticated.
-- ============================================================

-- ===== Enable RLS =====
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.fuel_entries enable row level security;
alter table public.maintenance_entries enable row level security;
alter table public.maintenance_alerts enable row level security;
alter table public.stations enable row level security;
alter table public.garages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

-- ===== Profiles =====
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- INSERT handled by trigger handle_new_user (security definer); no policy needed.

-- ===== Vehicles =====
create policy "vehicles_select_own" on public.vehicles
  for select using (auth.uid() = user_id);
create policy "vehicles_insert_own" on public.vehicles
  for insert with check (auth.uid() = user_id);
create policy "vehicles_update_own" on public.vehicles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vehicles_delete_own" on public.vehicles
  for delete using (auth.uid() = user_id);

-- ===== Fuel entries =====
create policy "fuel_select_own" on public.fuel_entries
  for select using (auth.uid() = user_id);
create policy "fuel_insert_own" on public.fuel_entries
  for insert with check (auth.uid() = user_id);
create policy "fuel_update_own" on public.fuel_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fuel_delete_own" on public.fuel_entries
  for delete using (auth.uid() = user_id);

-- ===== Maintenance entries (read + insert only) =====
create policy "maint_select_own" on public.maintenance_entries
  for select using (auth.uid() = user_id);
create policy "maint_insert_own" on public.maintenance_entries
  for insert with check (auth.uid() = user_id);
-- No update / delete policies = effectively immutable to client.
-- The trigger below also blocks any direct update/delete attempt.

-- ===== Maintenance alerts =====
create policy "alerts_select_own" on public.maintenance_alerts
  for select using (auth.uid() = user_id);
create policy "alerts_update_own" on public.maintenance_alerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alerts_delete_own" on public.maintenance_alerts
  for delete using (auth.uid() = user_id);

-- ===== Stations / Garages: public read for authenticated users =====
create policy "stations_select_all" on public.stations
  for select to authenticated using (true);
create policy "garages_select_all" on public.garages
  for select to authenticated using (true);

-- ===== Subscriptions: read-only for owner, writes only via service role =====
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ===== Audit logs: read-only for owner =====
create policy "audit_select_own" on public.audit_logs
  for select using (auth.uid() = user_id);
