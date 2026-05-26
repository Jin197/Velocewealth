-- ============================================================
-- Velocewealth · Traffic fines & penalty analytics
--
-- Tracks declarative fines (manual entry or PDF OCR import).
-- This is NOT a feed from ANTAI — French law does not expose a public
-- API for that, and bulk querying offence data without an explicit
-- agrément is illegal. The user records their own fines.
-- ============================================================

-- 1. Enums --------------------------------------------------------------------

do $$ begin
  create type public.infraction_category as enum (
    'speeding',
    'parking',
    'bus_lane',
    'red_light',
    'phone_driving',
    'seatbelt',
    'alcohol',
    'drugs',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fine_status as enum (
    'unpaid',
    'paid_minored',
    'paid_normal',
    'paid_majored',
    'paid_late_majored',
    'contested',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

-- 2. Vehicle column ---------------------------------------------------------

alter table public.vehicles
  add column if not exists registration_formula_number text;

-- 3. Main table -------------------------------------------------------------

create table if not exists public.traffic_fines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  -- Optional ANTAI identifiers (only present once the user has the paper)
  notice_number text,
  document_key text,
  category public.infraction_category not null,
  infraction_date timestamptz not null,
  notification_date timestamptz not null,
  status public.fine_status not null default 'unpaid',
  points_deducted smallint not null default 0 check (points_deducted between 0 and 6),
  amount_initial numeric(8,2) not null check (amount_initial >= 0),
  amount_paid numeric(8,2) check (amount_paid >= 0),
  paid_at timestamptz,
  source text not null default 'manual' check (source in ('manual', 'ocr_antai')),
  raw_ocr_text text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique notice number per user (a given avis cannot be entered twice)
create unique index if not exists traffic_fines_user_notice_uniq
  on public.traffic_fines (user_id, notice_number)
  where notice_number is not null;

-- Hot-path indexes
create index if not exists traffic_fines_user_notif_idx
  on public.traffic_fines (user_id, notification_date desc);

create index if not exists traffic_fines_vehicle_status_idx
  on public.traffic_fines (vehicle_id, status);

-- 4. updated_at trigger -----------------------------------------------------

create or replace function public.touch_traffic_fines_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists traffic_fines_set_updated_at on public.traffic_fines;
create trigger traffic_fines_set_updated_at
  before update on public.traffic_fines
  for each row execute function public.touch_traffic_fines_updated_at();

-- 5. Row Level Security -----------------------------------------------------

alter table public.traffic_fines enable row level security;

drop policy if exists "tf_select_own" on public.traffic_fines;
create policy "tf_select_own" on public.traffic_fines
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "tf_insert_own" on public.traffic_fines;
create policy "tf_insert_own" on public.traffic_fines
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "tf_update_own" on public.traffic_fines;
create policy "tf_update_own" on public.traffic_fines
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "tf_delete_own" on public.traffic_fines;
create policy "tf_delete_own" on public.traffic_fines
  for delete to authenticated
  using (user_id = auth.uid());
