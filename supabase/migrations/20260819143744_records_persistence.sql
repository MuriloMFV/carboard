create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  service_date date not null,
  mileage integer not null check (mileage >= 0),
  title text not null check (length(trim(title)) > 0),
  total_cost numeric(12, 2) check (total_cost >= 0),
  workshop text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.maintenance_items (
  id uuid primary key default gen_random_uuid(),
  maintenance_id uuid not null references public.maintenance_records(id) on delete cascade,
  vehicle_component_id uuid references public.vehicle_components(id) on delete set null,
  description text,
  product_name text,
  brand text,
  specification jsonb,
  quantity numeric check (quantity > 0),
  item_cost numeric(12, 2) check (item_cost >= 0)
);

create table public.fuel_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  fueled_at date not null,
  mileage integer not null check (mileage >= 0),
  fuel_type text not null check (fuel_type in ('gasoline', 'ethanol')),
  total_cost numeric(12, 2) check (total_cost > 0),
  liters numeric(10, 3) check (liters > 0),
  price_per_liter numeric(10, 3) check (price_per_liter > 0),
  full_tank boolean not null default false,
  station text,
  notes text,
  created_at timestamptz not null default now(),
  check (num_nonnulls(total_cost, liters, price_per_liter) >= 2)
);

create table public.problems (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  system_id uuid references public.system_catalog(id) on delete set null,
  vehicle_component_id uuid references public.vehicle_components(id) on delete set null,
  title text not null check (length(trim(title)) > 0),
  description text,
  detected_at date not null,
  mileage integer not null check (mileage >= 0),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'open'
    check (status in ('open', 'monitoring', 'resolved')),
  estimated_cost numeric(12, 2) check (estimated_cost >= 0),
  resolved_at date,
  resolution_maintenance_id uuid references public.maintenance_records(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.improvements (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  category text,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'planned'
    check (status in ('planned', 'purchased', 'installed')),
  estimated_budget numeric(12, 2) check (estimated_budget >= 0),
  actual_cost numeric(12, 2) check (actual_cost >= 0),
  product_name text,
  product_url text,
  notes text,
  created_at timestamptz not null default now(),
  purchased_at date,
  installed_at date
);

create table public.mileage_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  mileage integer not null check (mileage >= 0),
  recorded_at date not null,
  source_type text not null
    check (source_type in ('manual', 'maintenance', 'fuel', 'problem', 'onboarding')),
  source_id uuid,
  created_at timestamptz not null default now()
);

create index maintenance_records_vehicle_date_idx
  on public.maintenance_records (vehicle_id, service_date desc);
create index maintenance_items_maintenance_id_idx
  on public.maintenance_items (maintenance_id);
create index maintenance_items_vehicle_component_id_idx
  on public.maintenance_items (vehicle_component_id);
create index fuel_records_vehicle_date_idx
  on public.fuel_records (vehicle_id, fueled_at desc);
create index problems_vehicle_status_date_idx
  on public.problems (vehicle_id, status, detected_at desc);
create index problems_system_id_idx on public.problems (system_id);
create index problems_vehicle_component_id_idx on public.problems (vehicle_component_id);
create index problems_resolution_maintenance_id_idx
  on public.problems (resolution_maintenance_id);
create index improvements_vehicle_status_created_idx
  on public.improvements (vehicle_id, status, created_at desc);
create index mileage_records_vehicle_date_idx
  on public.mileage_records (vehicle_id, recorded_at desc);

alter table public.maintenance_records enable row level security;
alter table public.maintenance_items enable row level security;
alter table public.fuel_records enable row level security;
alter table public.problems enable row level security;
alter table public.improvements enable row level security;
alter table public.mileage_records enable row level security;

create policy "Users can read their maintenance records"
on public.maintenance_records for select to authenticated
using (
  vehicle_id in (
    select vehicles.id from public.vehicles
    where vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create their maintenance records"
on public.maintenance_records for insert to authenticated
with check (
  vehicle_id in (
    select vehicles.id from public.vehicles
    where vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can update their maintenance records"
on public.maintenance_records for update to authenticated
using (
  vehicle_id in (
    select vehicles.id from public.vehicles
    where vehicles.user_id = (select auth.uid())
  )
)
with check (
  vehicle_id in (
    select vehicles.id from public.vehicles
    where vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete their maintenance records"
on public.maintenance_records for delete to authenticated
using (
  vehicle_id in (
    select vehicles.id from public.vehicles
    where vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can read their maintenance items"
on public.maintenance_items for select to authenticated
using (
  maintenance_id in (
    select maintenance_records.id
    from public.maintenance_records
    join public.vehicles on vehicles.id = maintenance_records.vehicle_id
    where vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create their maintenance items"
on public.maintenance_items for insert to authenticated
with check (
  exists (
    select 1
    from public.maintenance_records
    join public.vehicles on vehicles.id = maintenance_records.vehicle_id
    where maintenance_records.id = maintenance_items.maintenance_id
      and vehicles.user_id = (select auth.uid())
      and (
        maintenance_items.vehicle_component_id is null
        or maintenance_items.vehicle_component_id in (
          select vehicle_components.id
          from public.vehicle_components
          where vehicle_components.vehicle_id = maintenance_records.vehicle_id
        )
      )
  )
);

create policy "Users can update their maintenance items"
on public.maintenance_items for update to authenticated
using (
  maintenance_id in (
    select maintenance_records.id
    from public.maintenance_records
    join public.vehicles on vehicles.id = maintenance_records.vehicle_id
    where vehicles.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.maintenance_records
    join public.vehicles on vehicles.id = maintenance_records.vehicle_id
    where maintenance_records.id = maintenance_items.maintenance_id
      and vehicles.user_id = (select auth.uid())
      and (
        maintenance_items.vehicle_component_id is null
        or maintenance_items.vehicle_component_id in (
          select vehicle_components.id
          from public.vehicle_components
          where vehicle_components.vehicle_id = maintenance_records.vehicle_id
        )
      )
  )
);

create policy "Users can delete their maintenance items"
on public.maintenance_items for delete to authenticated
using (
  maintenance_id in (
    select maintenance_records.id
    from public.maintenance_records
    join public.vehicles on vehicles.id = maintenance_records.vehicle_id
    where vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can read their fuel records"
on public.fuel_records for select to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can create their fuel records"
on public.fuel_records for insert to authenticated
with check (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can update their fuel records"
on public.fuel_records for update to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())))
with check (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can delete their fuel records"
on public.fuel_records for delete to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));

create policy "Users can read their problems"
on public.problems for select to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can create their problems"
on public.problems for insert to authenticated
with check (
  vehicle_id in (select id from public.vehicles where user_id = (select auth.uid()))
  and (
    vehicle_component_id is null
    or vehicle_component_id in (
      select id from public.vehicle_components where vehicle_components.vehicle_id = problems.vehicle_id
    )
  )
  and (
    vehicle_component_id is null or system_id is null
    or exists (
      select 1 from public.vehicle_components
      where vehicle_components.id = problems.vehicle_component_id
        and vehicle_components.system_id = problems.system_id
    )
  )
);
create policy "Users can update their problems"
on public.problems for update to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())))
with check (
  vehicle_id in (select id from public.vehicles where user_id = (select auth.uid()))
  and (
    vehicle_component_id is null
    or vehicle_component_id in (
      select id from public.vehicle_components where vehicle_components.vehicle_id = problems.vehicle_id
    )
  )
);
create policy "Users can delete their problems"
on public.problems for delete to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));

create policy "Users can read their improvements"
on public.improvements for select to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can create their improvements"
on public.improvements for insert to authenticated
with check (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can update their improvements"
on public.improvements for update to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())))
with check (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can delete their improvements"
on public.improvements for delete to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));

create policy "Users can read their mileage records"
on public.mileage_records for select to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can create their mileage records"
on public.mileage_records for insert to authenticated
with check (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can update their mileage records"
on public.mileage_records for update to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())))
with check (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));
create policy "Users can delete their mileage records"
on public.mileage_records for delete to authenticated
using (vehicle_id in (select id from public.vehicles where user_id = (select auth.uid())));

create function public.update_vehicle_mileage_if_greater(
  p_vehicle_id uuid,
  p_candidate_mileage integer,
  p_source_type text,
  p_source_id uuid default null,
  p_recorded_at date default current_date
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  stored_mileage integer;
begin
  if p_candidate_mileage < 0 then
    raise exception using errcode = '22023', message = 'Invalid mileage';
  end if;
  if p_source_type not in ('manual', 'maintenance', 'fuel', 'problem', 'onboarding') then
    raise exception using errcode = '22023', message = 'Invalid mileage source';
  end if;

  select current_mileage
  into stored_mileage
  from public.vehicles
  where id = p_vehicle_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Vehicle not found';
  end if;

  if p_candidate_mileage <= stored_mileage then
    return false;
  end if;

  update public.vehicles
  set current_mileage = p_candidate_mileage
  where id = p_vehicle_id;

  insert into public.mileage_records (
    vehicle_id, mileage, recorded_at, source_type, source_id
  ) values (
    p_vehicle_id, p_candidate_mileage, p_recorded_at, p_source_type, p_source_id
  );

  return true;
end;
$$;

create function public.update_vehicle_mileage(
  p_vehicle_id uuid,
  p_mileage integer,
  p_recorded_at date default current_date
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.update_vehicle_mileage_if_greater(
    p_vehicle_id, p_mileage, 'manual', null, p_recorded_at
  ) then
    raise exception using errcode = '22023', message = 'Mileage must be greater than current mileage';
  end if;
  return true;
end;
$$;

create function public.create_maintenance_with_items(
  p_vehicle_id uuid,
  p_service_date date,
  p_mileage integer,
  p_title text,
  p_items jsonb,
  p_total_cost numeric default null,
  p_workshop text default null,
  p_notes text default null,
  p_interval_km integer default null,
  p_interval_months integer default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_id uuid;
  item jsonb;
  component_id uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception using errcode = '22023', message = 'At least one maintenance item is required';
  end if;
  if p_interval_km is not null and p_interval_km <= 0 then
    raise exception using errcode = '22023', message = 'Invalid mileage interval';
  end if;
  if p_interval_months is not null and p_interval_months <= 0 then
    raise exception using errcode = '22023', message = 'Invalid month interval';
  end if;

  insert into public.maintenance_records (
    vehicle_id, service_date, mileage, title, total_cost, workshop, notes
  ) values (
    p_vehicle_id,
    p_service_date,
    p_mileage,
    trim(p_title),
    p_total_cost,
    nullif(trim(p_workshop), ''),
    nullif(trim(p_notes), '')
  ) returning id into created_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    component_id := nullif(item ->> 'vehicleComponentId', '')::uuid;
    if component_id is null or not exists (
      select 1 from public.vehicle_components
      where id = component_id and vehicle_id = p_vehicle_id
    ) then
      raise exception using errcode = '22023', message = 'Invalid vehicle component';
    end if;

    insert into public.maintenance_items (
      maintenance_id,
      vehicle_component_id,
      description,
      product_name,
      brand,
      specification,
      quantity,
      item_cost
    ) values (
      created_id,
      component_id,
      nullif(trim(item ->> 'description'), ''),
      nullif(trim(item ->> 'productName'), ''),
      nullif(trim(item ->> 'brand'), ''),
      case when jsonb_typeof(item -> 'specification') = 'object'
        then item -> 'specification' else null end,
      nullif(item ->> 'quantity', '')::numeric,
      nullif(item ->> 'itemCost', '')::numeric
    );

    update public.vehicle_components
    set last_service_date = p_service_date,
        last_service_mileage = p_mileage,
        interval_km = coalesce(p_interval_km, interval_km),
        interval_months = coalesce(p_interval_months, interval_months),
        status = 'good'
    where id = component_id and vehicle_id = p_vehicle_id;
  end loop;

  perform public.update_vehicle_mileage_if_greater(
    p_vehicle_id, p_mileage, 'maintenance', created_id, p_service_date
  );
  return created_id;
end;
$$;

create function public.create_fuel_record(
  p_vehicle_id uuid,
  p_fueled_at date,
  p_mileage integer,
  p_fuel_type text,
  p_full_tank boolean,
  p_total_cost numeric default null,
  p_liters numeric default null,
  p_price_per_liter numeric default null,
  p_station text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare created_id uuid;
begin
  insert into public.fuel_records (
    vehicle_id, fueled_at, mileage, fuel_type, total_cost, liters,
    price_per_liter, full_tank, station, notes
  ) values (
    p_vehicle_id, p_fueled_at, p_mileage, p_fuel_type, p_total_cost,
    p_liters, p_price_per_liter, p_full_tank,
    nullif(trim(p_station), ''), nullif(trim(p_notes), '')
  ) returning id into created_id;

  perform public.update_vehicle_mileage_if_greater(
    p_vehicle_id, p_mileage, 'fuel', created_id, p_fueled_at
  );
  return created_id;
end;
$$;

create function public.create_problem_record(
  p_vehicle_id uuid,
  p_title text,
  p_detected_at date,
  p_mileage integer,
  p_priority text,
  p_system_id uuid default null,
  p_vehicle_component_id uuid default null,
  p_description text default null,
  p_estimated_cost numeric default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare created_id uuid;
begin
  if p_vehicle_component_id is not null and not exists (
    select 1 from public.vehicle_components
    where id = p_vehicle_component_id and vehicle_id = p_vehicle_id
      and (p_system_id is null or system_id = p_system_id)
  ) then
    raise exception using errcode = '22023', message = 'Invalid vehicle component';
  end if;

  insert into public.problems (
    vehicle_id, system_id, vehicle_component_id, title, description,
    detected_at, mileage, priority, status, estimated_cost
  ) values (
    p_vehicle_id, p_system_id, p_vehicle_component_id, trim(p_title),
    nullif(trim(p_description), ''), p_detected_at, p_mileage,
    p_priority, 'open', p_estimated_cost
  ) returning id into created_id;

  perform public.update_vehicle_mileage_if_greater(
    p_vehicle_id, p_mileage, 'problem', created_id, p_detected_at
  );
  return created_id;
end;
$$;

create function public.create_improvement_record(
  p_vehicle_id uuid,
  p_title text,
  p_priority text,
  p_category text default null,
  p_estimated_budget numeric default null,
  p_product_name text default null,
  p_product_url text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare created_id uuid;
begin
  insert into public.improvements (
    vehicle_id, title, category, priority, status, estimated_budget,
    actual_cost, product_name, product_url, notes
  ) values (
    p_vehicle_id, trim(p_title), nullif(trim(p_category), ''), p_priority,
    'planned', p_estimated_budget, null,
    nullif(trim(p_product_name), ''), nullif(trim(p_product_url), ''),
    nullif(trim(p_notes), '')
  ) returning id into created_id;
  return created_id;
end;
$$;

revoke all on public.maintenance_records, public.maintenance_items,
  public.fuel_records, public.problems, public.improvements,
  public.mileage_records from anon;
grant select, insert, update, delete on public.maintenance_records,
  public.maintenance_items, public.fuel_records, public.problems,
  public.improvements, public.mileage_records to authenticated;

revoke all on function public.update_vehicle_mileage_if_greater(uuid, integer, text, uuid, date) from public, anon;
revoke all on function public.update_vehicle_mileage(uuid, integer, date) from public, anon;
revoke all on function public.create_maintenance_with_items(uuid, date, integer, text, jsonb, numeric, text, text, integer, integer) from public, anon;
revoke all on function public.create_fuel_record(uuid, date, integer, text, boolean, numeric, numeric, numeric, text, text) from public, anon;
revoke all on function public.create_problem_record(uuid, text, date, integer, text, uuid, uuid, text, numeric) from public, anon;
revoke all on function public.create_improvement_record(uuid, text, text, text, numeric, text, text, text) from public, anon;
grant execute on function public.update_vehicle_mileage_if_greater(uuid, integer, text, uuid, date) to authenticated;
grant execute on function public.update_vehicle_mileage(uuid, integer, date) to authenticated;
grant execute on function public.create_maintenance_with_items(uuid, date, integer, text, jsonb, numeric, text, text, integer, integer) to authenticated;
grant execute on function public.create_fuel_record(uuid, date, integer, text, boolean, numeric, numeric, numeric, text, text) to authenticated;
grant execute on function public.create_problem_record(uuid, text, date, integer, text, uuid, uuid, text, numeric) to authenticated;
grant execute on function public.create_improvement_record(uuid, text, text, text, numeric, text, text, text) to authenticated;
