create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  brand text not null check (length(trim(brand)) > 0),
  model text not null check (length(trim(model)) > 0),
  year integer not null check (year >= 1886),
  engine text,
  version text,
  plate text,
  current_mileage integer not null default 0 check (current_mileage >= 0),
  fuel_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.system_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  sort_order integer not null default 0
);

create table public.component_catalog (
  id uuid primary key default gen_random_uuid(),
  system_id uuid not null references public.system_catalog(id) on delete cascade,
  slug text not null,
  name text not null,
  default_interval_km integer check (default_interval_km > 0),
  default_interval_months integer check (default_interval_months > 0),
  unique (system_id, slug)
);

create table public.vehicle_components (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  catalog_component_id uuid references public.component_catalog(id),
  system_id uuid not null references public.system_catalog(id),
  custom_name text,
  status text not null default 'no_data'
    check (status in ('good', 'attention', 'critical', 'no_data')),
  interval_km integer check (interval_km > 0),
  interval_months integer check (interval_months > 0),
  last_service_date date,
  last_service_mileage integer check (last_service_mileage >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index vehicle_components_catalog_unique_idx
  on public.vehicle_components (vehicle_id, catalog_component_id)
  where catalog_component_id is not null;
create index vehicles_user_id_idx on public.vehicles (user_id);
create index component_catalog_system_id_idx on public.component_catalog (system_id);
create index vehicle_components_vehicle_id_idx on public.vehicle_components (vehicle_id);
create index vehicle_components_catalog_component_id_idx on public.vehicle_components (catalog_component_id);
create index vehicle_components_system_id_idx on public.vehicle_components (system_id);

create function private.seed_catalogs()
returns void
language sql
set search_path = ''
as $seed$
insert into public.system_catalog (slug, name, icon, sort_order)
values
  ('motor', 'Motor', 'engine', 10),
  ('freios', 'Freios', 'brakes', 20),
  ('suspensao', 'Suspensão', 'suspension', 30),
  ('pneus', 'Pneus', 'tires', 40),
  ('arrefecimento', 'Arrefecimento', 'cooling', 50),
  ('eletrica', 'Elétrica', 'electrical', 60),
  ('transmissao', 'Transmissão', 'transmission', 70),
  ('iluminacao', 'Iluminação', 'lighting', 80)
on conflict (slug) do update
set name = excluded.name,
    icon = excluded.icon,
    sort_order = excluded.sort_order;

insert into public.component_catalog (
  system_id,
  slug,
  name,
  default_interval_km,
  default_interval_months
)
select system_catalog.id, component.slug, component.name,
  component.default_interval_km, component.default_interval_months
from (
  values
    ('motor', 'oleo-do-motor', 'Óleo do motor', 10000, 12),
    ('motor', 'filtro-de-oleo', 'Filtro de óleo', 10000, 12),
    ('motor', 'filtro-de-ar', 'Filtro de ar', 15000, 12),
    ('motor', 'correia-dentada', 'Correia dentada', 60000, 48),
    ('motor', 'velas', 'Velas', 40000, 36),
    ('motor', 'bomba-de-combustivel', 'Bomba de combustível', null, null),
    ('freios', 'pastilhas-de-freio', 'Pastilhas de freio', null, null),
    ('freios', 'discos-de-freio', 'Discos de freio', null, null),
    ('suspensao', 'amortecedores', 'Amortecedores', null, null),
    ('suspensao', 'buchas', 'Buchas', null, null),
    ('pneus', 'pneus', 'Pneus', null, null),
    ('pneus', 'estepe', 'Estepe', null, null),
    ('arrefecimento', 'liquido-de-arrefecimento', 'Líquido de arrefecimento', 30000, 24),
    ('arrefecimento', 'radiador', 'Radiador', null, null),
    ('eletrica', 'bateria', 'Bateria', null, 36),
    ('eletrica', 'alternador', 'Alternador', null, null),
    ('transmissao', 'oleo-da-transmissao', 'Óleo da transmissão', 60000, 48),
    ('transmissao', 'embreagem', 'Embreagem', null, null),
    ('iluminacao', 'farois', 'Faróis', null, null),
    ('iluminacao', 'lanternas', 'Lanternas', null, null)
) as component(system_slug, slug, name, default_interval_km, default_interval_months)
join public.system_catalog on system_catalog.slug = component.system_slug
on conflict (system_id, slug) do update
set name = excluded.name,
    default_interval_km = excluded.default_interval_km,
    default_interval_months = excluded.default_interval_months;
$seed$;

select private.seed_catalogs();

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function private.set_updated_at();

create trigger vehicle_components_set_updated_at
before update on public.vehicle_components
for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.system_catalog enable row level security;
alter table public.component_catalog enable row level security;
alter table public.vehicle_components enable row level security;

create policy "Users can read their profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read their vehicles"
on public.vehicles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their vehicles"
on public.vehicles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their vehicles"
on public.vehicles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their vehicles"
on public.vehicles for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Authenticated users can read systems"
on public.system_catalog for select
to authenticated
using (true);

create policy "Authenticated users can read components"
on public.component_catalog for select
to authenticated
using (true);

create policy "Users can read their vehicle components"
on public.vehicle_components for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = vehicle_components.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create their vehicle components"
on public.vehicle_components for insert
to authenticated
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = vehicle_components.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can update their vehicle components"
on public.vehicle_components for update
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = vehicle_components.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = vehicle_components.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete their vehicle components"
on public.vehicle_components for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = vehicle_components.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create function public.create_vehicle_with_components(
  p_brand text,
  p_model text,
  p_year integer,
  p_current_mileage integer,
  p_engine text default null,
  p_version text default null,
  p_nickname text default null,
  p_oil_status text default 'no_data',
  p_tire_status text default 'no_data'
)
returns public.vehicles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_vehicle public.vehicles;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_oil_status not in ('good', 'attention', 'critical', 'no_data')
    or p_tire_status not in ('good', 'attention', 'critical', 'no_data') then
    raise exception 'Invalid component status';
  end if;

  insert into public.vehicles (
    user_id,
    nickname,
    brand,
    model,
    year,
    engine,
    version,
    current_mileage
  )
  values (
    (select auth.uid()),
    nullif(trim(p_nickname), ''),
    trim(p_brand),
    trim(p_model),
    p_year,
    nullif(trim(p_engine), ''),
    nullif(trim(p_version), ''),
    p_current_mileage
  )
  returning * into created_vehicle;

  insert into public.vehicle_components (
    vehicle_id,
    catalog_component_id,
    system_id,
    status,
    interval_km,
    interval_months
  )
  select
    created_vehicle.id,
    component_catalog.id,
    component_catalog.system_id,
    case
      when component_catalog.slug = 'oleo-do-motor' then p_oil_status
      when system_catalog.slug = 'pneus' then p_tire_status
      else 'no_data'
    end,
    component_catalog.default_interval_km,
    component_catalog.default_interval_months
  from public.component_catalog
  join public.system_catalog on system_catalog.id = component_catalog.system_id;

  return created_vehicle;
end;
$$;

revoke all on all tables in schema public from anon;
revoke all on public.profiles, public.vehicles, public.system_catalog,
  public.component_catalog, public.vehicle_components from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.vehicles to authenticated;
grant select on public.system_catalog, public.component_catalog to authenticated;
grant select, insert, update, delete on public.vehicle_components to authenticated;
revoke all on function public.create_vehicle_with_components(text, text, integer, integer, text, text, text, text, text) from public, anon;
grant execute on function public.create_vehicle_with_components(text, text, integer, integer, text, text, text, text, text) to authenticated;
revoke execute on function private.set_updated_at() from public, anon, authenticated;
revoke execute on function private.handle_new_user() from public, anon, authenticated;
revoke execute on function private.seed_catalogs() from public, anon, authenticated;
