-- ============================================================
-- Velocewealth · Trial Expiration Alerts
-- Automates trial end detection and triggers edge function emails
-- ============================================================

-- ===== Table to log processed alerts to avoid duplicate emails =====
create table if not exists public.trial_expiry_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  alert_type text not null check (alert_type in ('warning_j12', 'expiration_j14')),
  sent_at timestamptz not null default now(),
  constraint trial_expiry_logs_uniq unique (profile_id, alert_type)
);

-- Enable RLS
alter table public.trial_expiry_logs enable row level security;

-- Admin only access
create policy "Admin only read trial_expiry_logs" 
  on public.trial_expiry_logs for select 
  using (auth.role() = 'service_role');

-- ===== Function to detect expiring trials and trigger webhook/emails =====
create or replace function public.check_expiring_trials()
returns jsonb
security definer
set search_path = public
as $$
declare
  profile_row record;
  j12_count int := 0;
  j14_count int := 0;
  response_payload jsonb;
begin
  -- 1. Find users who signed up exactly 12 days ago (J+12 warning)
  for profile_row in 
    select id, email, full_name, created_at 
    from public.profiles
    where plan_tier = 'free'
      and created_at <= now() - interval '12 days'
      and created_at > now() - interval '13 days'
      and id not in (select profile_id from public.trial_expiry_logs where alert_type = 'warning_j12')
  loop
    -- Log the alert
    insert into public.trial_expiry_logs (profile_id, alert_type)
    values (profile_row.id, 'warning_j12');

    -- Note: In production, you would call your Supabase Edge Function here via pg_net:
    -- perform net.http_post(
    --   url := 'https://YOUR-PROJECT.supabase.co/functions/v1/send-trial-expiry-email',
    --   headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('vault.service_role_key', true)),
    --   body := jsonb_build_object('email', profile_row.email, 'fullName', profile_row.full_name, 'daysLeft', 2)
    -- );
    
    j12_count := j12_count + 1;
  end loop;

  -- 2. Find users who signed up exactly 14 days ago (J+14 expiration)
  for profile_row in 
    select id, email, full_name, created_at 
    from public.profiles
    where plan_tier = 'free'
      and created_at <= now() - interval '14 days'
      and id not in (select profile_id from public.trial_expiry_logs where alert_type = 'expiration_j14')
  loop
    -- Log the alert
    insert into public.trial_expiry_logs (profile_id, alert_type)
    values (profile_row.id, 'expiration_j14');

    -- Note: In production, trigger final downgrade email
    -- perform net.http_post(
    --   url := 'https://YOUR-PROJECT.supabase.co/functions/v1/send-trial-expiry-email',
    --   headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('vault.service_role_key', true)),
    --   body := jsonb_build_object('email', profile_row.email, 'fullName', profile_row.full_name, 'daysLeft', 0)
    -- );

    j14_count := j14_count + 1;
  end loop;

  return jsonb_build_object(
    'processed_j12_warnings', j12_count,
    'processed_j14_expirations', j14_count,
    'checked_at', now()
  );
end;
$$ language plpgsql;
