-- ============================================================
-- Velocewealth · Trusted devices
-- Lightweight device-fingerprinting via opaque cookie + server-side row.
--
-- Each device gets a random `device_token` stored in an httpOnly cookie.
-- On the next login the server hashes the token and looks it up here.
-- If found and not revoked → the device is "trusted" (skip new-device
-- notifications, lighten future risk-based gates).
-- The hash means a leaked DB row can't be used to impersonate a device.
--
-- Users can view & revoke their devices from Settings → Security.
-- ============================================================

create table if not exists public.trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- SHA-256 of the random token sent in the cookie. Never store raw token.
  token_hash text not null,
  -- Free-text label for UX ("MacBook · Chrome", "iPhone · Safari"). Derived
  -- from User-Agent at first sight but editable by the user later.
  label text,
  last_ip inet,
  last_user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists trusted_devices_token_idx
  on public.trusted_devices(token_hash);
create index if not exists trusted_devices_user_idx
  on public.trusted_devices(user_id) where revoked_at is null;

-- ===== RLS =====
alter table public.trusted_devices enable row level security;

create policy "trusted_devices_select_own" on public.trusted_devices
  for select to authenticated
  using (user_id = auth.uid());

-- Revoke = soft delete via UPDATE — the user can flip revoked_at on their
-- own rows. INSERT is server-only (admin client at login time).
create policy "trusted_devices_update_own" on public.trusted_devices
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, update on public.trusted_devices to authenticated;
grant all on public.trusted_devices to service_role;
