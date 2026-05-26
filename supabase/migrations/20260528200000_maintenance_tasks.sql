-- ============================================================
-- Velocewealth · Schedulable maintenance tasks + in-app notifications
--
-- Turns the in-memory plan (lib/maintenance/plan.ts) into persisted,
-- schedulable tasks with reminders. Tasks can come from:
--   - 'plan'   : the IA plan (generic / digital-twin / hybrid)
--   - 'phm'    : the Prognostics & Health Management engine
--   - 'manual' : user adds the task by hand
-- ============================================================

-- 1. Enums --------------------------------------------------------------------

do $$ begin
  create type public.maintenance_task_source as enum ('plan', 'phm', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.maintenance_task_status as enum (
    'pending',      -- generated, not scheduled yet
    'scheduled',    -- user picked a date
    'in_progress',  -- user marked as currently being done
    'done',         -- closed; usually linked to a maintenance_entries row
    'snoozed',      -- pushed back to a later date
    'dismissed'     -- user explicitly ignored / not applicable
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.in_app_notification_kind as enum (
    'maintenance_reminder',
    'maintenance_overdue',
    'fine_majoration_soon',
    'fine_added',
    'mfa_required',
    'other'
  );
exception when duplicate_object then null; end $$;

-- 2. maintenance_tasks ------------------------------------------------------

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  source public.maintenance_task_source not null default 'plan',
  category text not null check (
    category in ('oil','tires','brakes','filter','battery','inspection','other')
  ),
  title text not null,
  description text,
  -- Free-form JSON instructions (checklist, tools, tutorials).
  -- Shape documented in lib/maintenance/instructions.ts; the DB does not
  -- constrain it so future enrichments don't need a migration.
  instructions jsonb,
  reasoning text,
  confidence numeric(3,2) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  estimated_cost numeric(10,2) check (estimated_cost is null or estimated_cost >= 0),
  estimated_duration_min int check (estimated_duration_min is null or estimated_duration_min > 0),
  -- IA-predicted deadline (immutable once created).
  due_at_date date,
  due_at_km int check (due_at_km is null or due_at_km >= 0),
  -- Date the user actually picked.
  scheduled_for date,
  reminder_days_before int not null default 7 check (reminder_days_before between 0 and 60),
  -- Reminder dispatch bookkeeping. We record which "phase" we already sent
  -- (e.g. '7d' for the long warning, '1d' for the urgent one, 'overdue' for
  -- post-due) so we never double-send. NULL = nothing sent.
  last_reminder_phase text,
  last_reminder_sent_at timestamptz,
  status public.maintenance_task_status not null default 'pending',
  snooze_until date,
  garage_id uuid,
  garage_name text,
  notes text,
  -- Once a task is completed via the "Mark as done" CTA we usually create
  -- a maintenance_entries row; this FK lets us link the two without losing
  -- the historical audit chain.
  linked_entry_id uuid references public.maintenance_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One pending/scheduled task per (vehicle, category) at any given time —
-- prevents the IA from re-creating duplicates every render.
create unique index if not exists maintenance_tasks_open_uniq
  on public.maintenance_tasks (vehicle_id, category)
  where status in ('pending', 'scheduled', 'in_progress', 'snoozed');

create index if not exists maintenance_tasks_user_scheduled_idx
  on public.maintenance_tasks (user_id, scheduled_for nulls last);

create index if not exists maintenance_tasks_due_reminder_idx
  on public.maintenance_tasks (scheduled_for, reminder_days_before, status)
  where status = 'scheduled';

-- updated_at trigger
create or replace function public.touch_maintenance_tasks_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists maintenance_tasks_set_updated_at on public.maintenance_tasks;
create trigger maintenance_tasks_set_updated_at
  before update on public.maintenance_tasks
  for each row execute function public.touch_maintenance_tasks_updated_at();

alter table public.maintenance_tasks enable row level security;

drop policy if exists "mt_select_own" on public.maintenance_tasks;
create policy "mt_select_own" on public.maintenance_tasks
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "mt_insert_own" on public.maintenance_tasks;
create policy "mt_insert_own" on public.maintenance_tasks
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "mt_update_own" on public.maintenance_tasks;
create policy "mt_update_own" on public.maintenance_tasks
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "mt_delete_own" on public.maintenance_tasks;
create policy "mt_delete_own" on public.maintenance_tasks
  for delete to authenticated using (user_id = auth.uid());

-- 3. in_app_notifications ---------------------------------------------------

create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.in_app_notification_kind not null,
  title text not null,
  body text,
  -- Where the bell-icon dropdown should send the user when clicked.
  link text,
  -- Optional FK-like pointers; we keep them as plain uuid columns so
  -- the notification is not lost if the underlying row is deleted.
  related_vehicle_id uuid,
  related_task_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists in_app_notifications_user_unread_idx
  on public.in_app_notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists in_app_notifications_user_recent_idx
  on public.in_app_notifications (user_id, created_at desc);

alter table public.in_app_notifications enable row level security;

drop policy if exists "ian_select_own" on public.in_app_notifications;
create policy "ian_select_own" on public.in_app_notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "ian_update_own" on public.in_app_notifications;
create policy "ian_update_own" on public.in_app_notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "ian_delete_own" on public.in_app_notifications;
create policy "ian_delete_own" on public.in_app_notifications
  for delete to authenticated using (user_id = auth.uid());

-- INSERTs only via service_role (the cron + server actions write here).
