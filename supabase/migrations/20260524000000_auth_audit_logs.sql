-- ============================================================
-- Velocewealth · Auth audit logs
-- Dedicated append-only table for authentication events. Separated from
-- the domain `audit_logs` table so we can track failed logins (no user_id),
-- rate-limit events, and MFA challenges without violating the existing
-- NOT NULL + FK constraint on audit_logs.user_id.
--
-- Retention: rotated by the audit_rotation policy (~90 days for auth events,
-- shorter than domain audits because of GDPR data minimization).
-- ============================================================

create table if not exists public.auth_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in (
    'login_success',
    'login_failed',
    'login_rate_limited',
    'mfa_challenge_success',
    'mfa_challenge_failed',
    'mfa_enrolled',
    'mfa_disabled',
    'password_changed',
    'signup_blocked_breach'
  )),
  ip inet,
  user_agent text,
  email_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists auth_audit_user_idx on public.auth_audit_logs(user_id);
create index if not exists auth_audit_email_idx on public.auth_audit_logs(email_hash);
create index if not exists auth_audit_action_idx on public.auth_audit_logs(action, created_at desc);
create index if not exists auth_audit_created_idx on public.auth_audit_logs(created_at desc);

-- ===== RLS: users see only their own events =====
alter table public.auth_audit_logs enable row level security;

create policy "auth_audit_select_own" on public.auth_audit_logs
  for select to authenticated
  using (user_id = auth.uid());

-- Only service_role can INSERT (server actions use admin client)
grant select on public.auth_audit_logs to authenticated;
grant all on public.auth_audit_logs to service_role;

-- ===== Append-only: block UPDATE / DELETE =====
create or replace function public.prevent_auth_audit_mutation()
returns trigger as $$
begin
  raise exception 'auth_audit_logs are append-only';
end;
$$ language plpgsql;

create trigger auth_audit_no_update
  before update on public.auth_audit_logs
  for each row execute function public.prevent_auth_audit_mutation();

create trigger auth_audit_no_delete
  before delete on public.auth_audit_logs
  for each row execute function public.prevent_auth_audit_mutation();
