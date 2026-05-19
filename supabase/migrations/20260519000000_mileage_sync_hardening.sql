-- ============================================================
-- Velocewealth · Mileage sync hardening
-- The initial migration already syncs vehicles.current_mileage_km on
-- INSERT into fuel_entries / maintenance_entries. This migration adds:
--   1. A one-time backfill (in case rows existed before the trigger)
--   2. UPDATE trigger (when a user corrects an entry to a higher mileage)
--   3. A sanity guard that rejects obvious typos (e.g. 870000 vs 87000)
-- ============================================================

-- ===== 1. Backfill: realign each vehicle to the max mileage observed =====
update public.vehicles v
set current_mileage_km = sub.max_km
from (
  select vehicle_id, max(mileage_km) as max_km
  from (
    select vehicle_id, mileage_km from public.fuel_entries
    union all
    select vehicle_id, mileage_km from public.maintenance_entries
  ) all_entries
  group by vehicle_id
) sub
where v.id = sub.vehicle_id
  and sub.max_km > v.current_mileage_km;

-- ===== 2. Sanity guard: reject mileage > 200% of current (likely typo) =====
-- Tolerance: allow up to 2× the current mileage in a single jump.
-- A driver doing 30k km/year would need ~3 years between entries to hit
-- this threshold, so false positives are rare and benign (user retries).
create or replace function public.guard_mileage_sanity()
returns trigger as $$
declare
  current_km int;
begin
  select current_mileage_km into current_km
    from public.vehicles
    where id = new.vehicle_id;

  if current_km is not null
     and current_km > 0
     and new.mileage_km > current_km * 2
     and new.mileage_km - current_km > 50000
  then
    raise exception 'Kilométrage suspect: % km (actuel %, augmentation > 100%% et > 50000 km). Vérifiez la saisie.',
      new.mileage_km, current_km
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger fuel_guard_mileage
  before insert or update on public.fuel_entries
  for each row execute function public.guard_mileage_sanity();

create trigger maintenance_guard_mileage
  before insert on public.maintenance_entries
  for each row execute function public.guard_mileage_sanity();
-- (no UPDATE guard on maintenance — entries are immutable, see prevent_maintenance_mutation)

-- ===== 3. Extend bump trigger to UPDATE on fuel_entries =====
-- maintenance_entries are immutable so no UPDATE trigger needed there.
create trigger fuel_bump_mileage_update
  after update of mileage_km on public.fuel_entries
  for each row execute function public.bump_vehicle_mileage();
