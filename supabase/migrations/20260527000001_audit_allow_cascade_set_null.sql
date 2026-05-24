-- ============================================================
-- Velocewealth · auth_audit_logs — allow ON DELETE SET NULL cascade
-- ============================================================
-- The blanket UPDATE-blocking trigger on auth_audit_logs collides with the
-- foreign-key cascade behavior: when a profile (auth user) is deleted, the
-- engine emits an `UPDATE auth_audit_logs SET user_id = NULL` for every
-- row referencing the deleted profile. The trigger raised an exception and
-- the whole DELETE rolled back — meaning account deletion never completed
-- in production once the table had at least one row for the user.
--
-- Fix: replace the function with a narrower one that:
--   - Allows the cascade-driven SET user_id = NULL (and ONLY that operation).
--   - Rejects every other UPDATE — content tampering remains impossible.
--
-- We compare every immutable column. If anything other than user_id changes,
-- or if user_id is moving the "wrong way" (NULL → value, or value → other
-- value), the UPDATE is refused.
-- ============================================================

create or replace function public.prevent_auth_audit_mutation()
returns trigger as $$
begin
  -- Allow only the FK cascade pattern: user_id transitions from a real
  -- UUID to NULL, with every other column unchanged.
  if TG_OP = 'UPDATE'
     and OLD.user_id is not null
     and NEW.user_id is null
     and OLD.id          = NEW.id
     and OLD.action      = NEW.action
     and OLD.ip is not distinct from NEW.ip
     and OLD.user_agent  is not distinct from NEW.user_agent
     and OLD.email_hash  is not distinct from NEW.email_hash
     and OLD.metadata::text = NEW.metadata::text
     and OLD.created_at  = NEW.created_at
  then
    return NEW;
  end if;
  raise exception 'auth_audit_logs are append-only';
end;
$$ language plpgsql;
