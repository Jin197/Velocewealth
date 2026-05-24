-- ============================================================
-- Velocewealth · Account-deletion OTP requests
-- Two-step destructive flow: the user first asks to delete their account,
-- we email them a 6-digit OTP, they have 15 minutes to confirm by typing
-- the code + their password + the irreversible-confirmation phrase.
--
-- We never store the raw OTP — only its SHA-256 hash, so a leaked row
-- can't be replayed against the verification endpoint.
-- ============================================================

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Look up the active (non-consumed, non-expired) request for a user fast.
create index if not exists adr_active_idx
  on public.account_deletion_requests(user_id, expires_at desc)
  where consumed_at is null;

-- ===== RLS: the user can see/cancel their own pending requests =====
alter table public.account_deletion_requests enable row level security;

create policy "adr_select_own" on public.account_deletion_requests
  for select to authenticated
  using (user_id = auth.uid());

create policy "adr_update_own" on public.account_deletion_requests
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "adr_delete_own" on public.account_deletion_requests
  for delete to authenticated
  using (user_id = auth.uid());

grant select, update, delete on public.account_deletion_requests to authenticated;
grant all on public.account_deletion_requests to service_role;

-- ===== Auto-purge expired or consumed rows older than 7 days =====
-- Not a trigger — a manual SQL the rotation cron job (see audit_rotation.sql)
-- can call. Keeping the function deterministic and idempotent.
create or replace function public.purge_old_account_deletion_requests()
returns integer
language sql
security definer
as $$
  with deleted as (
    delete from public.account_deletion_requests
    where created_at < now() - interval '7 days'
       or consumed_at is not null
    returning 1
  )
  select count(*)::integer from deleted;
$$;
