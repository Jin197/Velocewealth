-- ============================================================
-- Velocewealth · Immutability + audit triggers
-- Maintenance entries are append-only by design (carnet certifié).
-- Any UPDATE or DELETE attempt is blocked at the DB level, even from
-- service-role calls. The only way to "correct" history is to add a new entry.
-- ============================================================

-- ===== Block UPDATE on maintenance_entries =====
create or replace function public.prevent_maintenance_mutation()
returns trigger as $$
begin
  raise exception 'maintenance_entries are immutable (carnet certifié). Add a new entry to correct history.'
    using errcode = 'check_violation';
end;
$$ language plpgsql;

create trigger maintenance_no_update
  before update on public.maintenance_entries
  for each row execute function public.prevent_maintenance_mutation();

create trigger maintenance_no_delete
  before delete on public.maintenance_entries
  for each row execute function public.prevent_maintenance_mutation();

-- ===== Block UPDATE / DELETE on audit_logs =====
create or replace function public.prevent_audit_mutation()
returns trigger as $$
begin
  raise exception 'audit_logs are append-only';
end;
$$ language plpgsql;

create trigger audit_no_update
  before update on public.audit_logs
  for each row execute function public.prevent_audit_mutation();

create trigger audit_no_delete
  before delete on public.audit_logs
  for each row execute function public.prevent_audit_mutation();

-- ===== Auto-audit on maintenance INSERT =====
create or replace function public.audit_maintenance_insert()
returns trigger as $$
begin
  insert into public.audit_logs (user_id, action, entity_type, entity_id, payload)
  values (
    new.user_id,
    'maintenance.create',
    'maintenance_entry',
    new.id,
    jsonb_build_object(
      'vehicle_id', new.vehicle_id,
      'category', new.category,
      'cost', new.cost,
      'mileage_km', new.mileage_km,
      'hash', new.hash,
      'previous_hash', new.previous_hash
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger maintenance_audit_insert
  after insert on public.maintenance_entries
  for each row execute function public.audit_maintenance_insert();

-- ===== Auto-bump vehicle.current_mileage_km on fuel/maintenance insert =====
create or replace function public.bump_vehicle_mileage()
returns trigger as $$
begin
  update public.vehicles
    set current_mileage_km = greatest(current_mileage_km, new.mileage_km)
    where id = new.vehicle_id and user_id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger fuel_bump_mileage
  after insert on public.fuel_entries
  for each row execute function public.bump_vehicle_mileage();

create trigger maintenance_bump_mileage
  after insert on public.maintenance_entries
  for each row execute function public.bump_vehicle_mileage();
