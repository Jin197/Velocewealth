-- ============================================================
-- Velocewealth · Insurance mode (fixed vs variable) + monthly records
--
-- Until now `vehicles.insurance_monthly` carried a single flat monthly
-- amount. Real-world contracts vary:
--   - "fixed"    : same amount every month (classic auto policy)
--   - "variable" : per-month amount (pay-as-you-drive, seasonal, fleet)
--
-- We keep `vehicles.insurance_monthly` for backward compatibility — it
-- stores the constant amount when mode = 'fixed'. When mode = 'variable'
-- it is ignored at TCO time and the cost is summed from insurance_records.
-- ============================================================

-- 1. Column on vehicles ------------------------------------------------------

alter table public.vehicles
  add column if not exists insurance_mode text
    not null default 'fixed'
    check (insurance_mode in ('fixed', 'variable'));

-- 2. Per-month variable records ---------------------------------------------

create table if not exists public.insurance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- First day of the month the amount applies to (YYYY-MM-01).
  month date not null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists insurance_records_vehicle_month_uniq
  on public.insurance_records (vehicle_id, month);

create index if not exists insurance_records_user_month_idx
  on public.insurance_records (user_id, month desc);

-- updated_at trigger
create or replace function public.touch_insurance_records_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists insurance_records_set_updated_at on public.insurance_records;
create trigger insurance_records_set_updated_at
  before update on public.insurance_records
  for each row execute function public.touch_insurance_records_updated_at();

alter table public.insurance_records enable row level security;

drop policy if exists "ir_select_own" on public.insurance_records;
create policy "ir_select_own" on public.insurance_records
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "ir_insert_own" on public.insurance_records;
create policy "ir_insert_own" on public.insurance_records
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "ir_update_own" on public.insurance_records;
create policy "ir_update_own" on public.insurance_records
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "ir_delete_own" on public.insurance_records;
create policy "ir_delete_own" on public.insurance_records
  for delete to authenticated using (user_id = auth.uid());
