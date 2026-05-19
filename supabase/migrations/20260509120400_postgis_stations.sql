-- Activer PostGIS si ce n'est pas déjà fait
create extension if not exists postgis;

-- Ajouter une colonne géographie pour les recherches par rayon (plus performant que calculer la distance sur lat/lng)
alter table public.stations 
add column if not exists geog geography(Point, 4326) generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored;

create index if not exists stations_geog_idx on public.stations using gist (geog);

-- Créer une fonction RPC pour récupérer les stations proches
create or replace function get_nearby_stations(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision default 5000
)
returns table (
  id uuid,
  name text,
  brand text,
  type text,
  lat double precision,
  lng double precision,
  address text,
  city text,
  distance_meters double precision
)
language sql
security definer
as $$
  select 
    id, name, brand, type, lat, lng, address, city,
    st_distance(geog, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography) as distance_meters
  from public.stations
  where st_dwithin(geog, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography, radius_meters)
  order by distance_meters asc
  limit 50;
$$;
