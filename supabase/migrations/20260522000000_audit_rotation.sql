-- ============================================================
-- Velocewealth · audit_logs Rotation Policy & Bypass Mechanism
-- Implements a secure transaction-local bypass to allow purges of
-- historical audit logs while keeping them strictly append-only for standard queries.
-- ============================================================

-- ===== 1. Update the prevent_audit_mutation trigger function =====
create or replace function public.prevent_audit_mutation()
returns trigger as $$
begin
  -- Allow DELETE/UPDATE only when transaction session config veloce.bypass_audit_mutation is 'true'
  if current_setting('veloce.bypass_audit_mutation', true) = 'true' then
    if tg_op = 'DELETE' then
      return old;
    else
      return new;
    end if;
  end if;

  raise exception 'audit_logs are append-only (mutation blocked)';
end;
$$ language plpgsql;

-- ===== 2. Create the secure purge_old_audit_logs function =====
create or replace function public.purge_old_audit_logs(days_to_keep int default 30)
returns int as $$
declare
  deleted_count int;
begin
  -- Enable bypass temporarily within this transaction
  perform set_config('veloce.bypass_audit_mutation', 'true', true);

  delete from public.audit_logs
    where created_at < now() - (days_to_keep || ' days')::interval;

  get diagnostics deleted_count = row_count;

  -- Restore protection
  perform set_config('veloce.bypass_audit_mutation', 'false', true);

  return deleted_count;
end;
$$ language plpgsql security definer;
