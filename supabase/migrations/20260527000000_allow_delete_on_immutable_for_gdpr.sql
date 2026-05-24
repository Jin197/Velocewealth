-- ============================================================
-- Velocewealth · GDPR vs Carnet Immutability — resolve conflict
-- ============================================================
-- Discovery: the initial immutability triggers blocked DELETE on
-- maintenance_entries AND audit_logs. That broke account deletion
-- because cascade FKs from profiles → maintenance_entries can no
-- longer remove the rows when the user invokes their right to be
-- forgotten (article 17 RGPD).
--
-- Resolution:
--   - Keep UPDATE blocked  →  user can't tamper with their certified log.
--   - Allow DELETE         →  cascade from auth.users / profiles works,
--                             account deletion completes.
--
-- The carnet's tamper-evidence property (hash chain) is preserved while
-- the row exists. Once the user closes the account, every entry is
-- destroyed alongside the profile — which is exactly what GDPR demands.
-- ============================================================

drop trigger if exists maintenance_no_delete on public.maintenance_entries;
drop trigger if exists audit_no_delete       on public.audit_logs;

-- The DELETE-blocking functions stay defined (still used by the
-- *_no_update triggers, which now share the same source) — only the
-- DELETE bindings are removed.
