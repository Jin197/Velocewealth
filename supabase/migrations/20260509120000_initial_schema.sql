-- ============================================================
-- Velocewealth · Initial schema
-- Tables for user data, vehicles, fuel, maintenance, public catalog
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ===== Profiles (1:1 with auth.users) =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  locale text not null default 'fr' check (locale in ('fr','en','es','ar','pt')),
  currency text not null default 'EUR',
  country text not null default 'FR',
  plan_tier text not null default 'free' check (plan_tier in ('free','premium')),
  stripe_customer_id text unique,
  ocr_credits_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);

-- ===== Vehicles =====
create table public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int not null,
  vin text,
  plate text not null,
  fuel_type text not null check (fuel_type in ('thermal','electric','hybrid')),
  purchase_date date not null,
  purchase_price numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  current_mileage_km int not null default 0,
  image_url text,
  color text,
  trim text,
  estimated_resale_value numeric(12,2) not null default 0,
  resale_trend text not null default 'stable' check (resale_trend in ('up','down','stable')),
  insurance_provider text,
  insurance_monthly numeric(8,2),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_user_idx on public.vehicles(user_id);
create index vehicles_archived_idx on public.vehicles(user_id) where archived_at is null;

-- ===== Fuel entries =====
create table public.fuel_entries (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_at timestamptz not null,
  energy_type text not null check (energy_type in ('gasoline','diesel','electric','e85','gpl')),
  quantity numeric(10,3) not null check (quantity > 0),
  unit text not null check (unit in ('L','kWh')),
  unit_price numeric(10,4) not null check (unit_price > 0),
  total_price numeric(10,2) not null check (total_price > 0),
  currency text not null,
  station_name text not null,
  station_city text,
  mileage_km int not null check (mileage_km >= 0),
  ocr_source text not null default 'manual' check (ocr_source in ('manual','ocr')),
  ocr_raw jsonb,
  receipt_url text,
  created_at timestamptz not null default now()
);

create index fuel_user_idx on public.fuel_entries(user_id);
create index fuel_vehicle_idx on public.fuel_entries(vehicle_id);
create index fuel_occurred_idx on public.fuel_entries(occurred_at desc);

-- ===== Maintenance entries (immutable, hash-chained) =====
create table public.maintenance_entries (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_at timestamptz not null,
  category text not null check (category in ('oil','tires','brakes','filter','battery','inspection','other')),
  description text not null,
  cost numeric(10,2) not null check (cost >= 0),
  currency text not null,
  garage_name text not null,
  garage_id uuid,
  mileage_km int not null check (mileage_km >= 0),
  next_due_mileage int,
  next_due_date date,
  invoice_url text,
  previous_hash text not null default 'genesis',
  hash text not null,
  created_at timestamptz not null default now()
);

create index maint_user_idx on public.maintenance_entries(user_id);
create index maint_vehicle_idx on public.maintenance_entries(vehicle_id);
create index maint_occurred_idx on public.maintenance_entries(occurred_at desc);

-- ===== Maintenance alerts (predicted) =====
create table public.maintenance_alerts (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('info','warning','critical')),
  predicted_mileage int not null,
  predicted_at timestamptz not null,
  message text not null,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create index alerts_user_idx on public.maintenance_alerts(user_id);
create index alerts_active_idx on public.maintenance_alerts(user_id) where dismissed_at is null;

-- ===== Stations (public catalog, read-only for users) =====
create table public.stations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text not null,
  type text not null check (type in ('gas','charger')),
  lat double precision not null,
  lng double precision not null,
  address text not null,
  city text not null,
  country text not null,
  available int,
  total int,
  created_at timestamptz not null default now()
);

create index stations_country_idx on public.stations(country);
create index stations_geo_idx on public.stations(lat, lng);

-- ===== Garages (public catalog, partner flag) =====
create table public.garages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  city text not null,
  country text not null,
  lat double precision not null,
  lng double precision not null,
  is_partner boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  services text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

create index garages_country_idx on public.garages(country);
create index garages_partner_idx on public.garages(is_partner) where is_partner = true;

-- ===== Subscriptions (Stripe) =====
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text not null unique,
  tier text not null default 'premium',
  status text not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_idx on public.subscriptions(user_id);

-- ===== Audit logs (append-only, immutable) =====
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_user_idx on public.audit_logs(user_id);
create index audit_entity_idx on public.audit_logs(entity_type, entity_id);

-- ===== Updated_at triggers =====
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ===== New user → profile auto-creation =====
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, locale, currency, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'locale', 'fr'),
    coalesce(new.raw_user_meta_data->>'currency', 'EUR'),
    coalesce(new.raw_user_meta_data->>'country', 'FR')
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
