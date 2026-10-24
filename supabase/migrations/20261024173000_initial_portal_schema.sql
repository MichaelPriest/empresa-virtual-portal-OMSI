-- Initial schema for Empresa Virtual OMSI portal.
-- No demo rows or simulated users are inserted.
create extension if not exists pgcrypto;

create type public.company_member_role as enum ('owner', 'admin', 'dispatcher', 'driver');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type public.vehicle_status as enum ('active', 'maintenance', 'inactive');
create type public.career_status as enum ('planned', 'in_progress', 'completed', 'canceled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  logo_url text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_member_role not null default 'driver',
  joined_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
create index company_members_user_idx on public.company_members(user_id, company_id);

create table public.garages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  city text,
  country_code char(2) not null default 'BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, name)
);
create index garages_company_idx on public.garages(company_id);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  garage_id uuid references public.garages(id) on delete set null,
  fleet_number text not null,
  display_name text not null,
  vehicle_model text,
  simulator text not null default 'omsi2' check (simulator in ('omsi2','openomsi','both')),
  status public.vehicle_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, fleet_number)
);
create index vehicles_company_idx on public.vehicles(company_id);

create table public.careers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 160),
  origin text,
  destination text,
  route_name text,
  simulator text not null default 'omsi2' check (simulator in ('omsi2','openomsi','both')),
  status public.career_status not null default 'planned',
  scheduled_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index careers_company_schedule_idx on public.careers(company_id, scheduled_at);

create table public.career_runs (
  id uuid primary key default gen_random_uuid(),
  career_id uuid not null references public.careers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references auth.users(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  status public.career_status not null default 'planned',
  started_at timestamptz,
  finished_at timestamptz,
  distance_km numeric(8,2) check (distance_km is null or distance_km >= 0),
  score numeric(8,2) check (score is null or score >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (finished_at is null or started_at is null or finished_at >= started_at)
);
create index career_runs_company_driver_idx on public.career_runs(company_id, driver_id, created_at desc);

create table public.plans (
  code text primary key check (code in ('free','premium_monthly','premium_annual')),
  name text not null,
  description text,
  billing_interval text not null check (billing_interval in ('none','month','year')),
  price_minor_units integer not null check (price_minor_units >= 0),
  currency char(3) not null default 'BRL',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
-- Catalog only: amounts are intentionally zero/TBD until pricing is approved.
insert into public.plans(code,name,description,billing_interval,price_minor_units,currency)
values
 ('free','Gratuito','Plano inicial da Empresa Virtual','none',0,'BRL'),
 ('premium_monthly','Premium mensal','Preço ainda não definido','month',0,'BRL'),
 ('premium_annual','Premium anual','Preço ainda não definido','year',0,'BRL');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  plan_code text not null references public.plans(code),
  status public.subscription_status not null default 'incomplete',
  provider text not null default 'stripe' check (provider in ('stripe','manual')),
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_period_end is null or current_period_start is null or current_period_end >= current_period_start)
);
create index subscriptions_user_status_idx on public.subscriptions(user_id, status);

create table public.audit_events (
  id bigint generated always as identity primary key,
  company_id uuid references public.companies(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_company_created_idx on public.audit_events(company_id, created_at desc);

-- Create/update timestamps.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger garages_updated_at before update on public.garages for each row execute function public.set_updated_at();
create trigger vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();
create trigger careers_updated_at before update on public.careers for each row execute function public.set_updated_at();
create trigger career_runs_updated_at before update on public.career_runs for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

-- A company creator automatically becomes its owner without client-side privilege escalation.
create or replace function public.add_company_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or auth.uid() <> new.created_by then
    raise exception 'Company creator must be the authenticated user';
  end if;
  insert into public.company_members(company_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;
revoke all on function public.add_company_creator_as_owner() from public, anon, authenticated;
create trigger companies_add_creator_owner after insert on public.companies
for each row execute function public.add_company_creator_as_owner();

-- RLS enabled on every exposed application table.
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.garages enable row level security;
alter table public.vehicles enable row level security;
alter table public.careers enable row level security;
alter table public.career_runs enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_self" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "company_members_select_self" on public.company_members for select to authenticated using (user_id = (select auth.uid()));
create policy "companies_select_member" on public.companies for select to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = id and m.user_id = (select auth.uid()))
);
create policy "companies_insert_creator" on public.companies for insert to authenticated with check (created_by = (select auth.uid()));
create policy "companies_update_owner" on public.companies for update to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = id and m.user_id = (select auth.uid()) and m.role in ('owner','admin'))
) with check (
  exists (select 1 from public.company_members m where m.company_id = id and m.user_id = (select auth.uid()) and m.role in ('owner','admin'))
);

create policy "garages_member_read" on public.garages for select to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = garages.company_id and m.user_id = (select auth.uid()))
);
create policy "garages_member_insert" on public.garages for insert to authenticated with check (
  exists (select 1 from public.company_members m where m.company_id = garages.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
);
create policy "garages_admin_update" on public.garages for update to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = garages.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
) with check (
  exists (select 1 from public.company_members m where m.company_id = garages.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
);
create policy "garages_admin_delete" on public.garages for delete to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = garages.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin'))
);

create policy "vehicles_member_read" on public.vehicles for select to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = vehicles.company_id and m.user_id = (select auth.uid()))
);
create policy "vehicles_dispatch_insert" on public.vehicles for insert to authenticated with check (
  exists (select 1 from public.company_members m where m.company_id = vehicles.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
);
create policy "vehicles_dispatch_update" on public.vehicles for update to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = vehicles.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
) with check (
  exists (select 1 from public.company_members m where m.company_id = vehicles.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
);
create policy "vehicles_admin_delete" on public.vehicles for delete to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = vehicles.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin'))
);

create policy "careers_member_read" on public.careers for select to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = careers.company_id and m.user_id = (select auth.uid()))
);
create policy "careers_dispatch_insert" on public.careers for insert to authenticated with check (
  created_by = (select auth.uid()) and exists (select 1 from public.company_members m where m.company_id = careers.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
);
create policy "careers_dispatch_update" on public.careers for update to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = careers.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
) with check (
  exists (select 1 from public.company_members m where m.company_id = careers.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','dispatcher'))
);
create policy "careers_admin_delete" on public.careers for delete to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = careers.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin'))
);

create policy "career_runs_member_read" on public.career_runs for select to authenticated using (
  exists (select 1 from public.company_members m where m.company_id = career_runs.company_id and m.user_id = (select auth.uid()))
);
create policy "career_runs_driver_insert" on public.career_runs for insert to authenticated with check (
  driver_id = (select auth.uid()) and exists (select 1 from public.company_members m where m.company_id = career_runs.company_id and m.user_id = (select auth.uid()))
);
create policy "career_runs_driver_update" on public.career_runs for update to authenticated using (
  driver_id = (select auth.uid()) and exists (select 1 from public.company_members m where m.company_id = career_runs.company_id and m.user_id = (select auth.uid()))
) with check (
  driver_id = (select auth.uid()) and exists (select 1 from public.company_members m where m.company_id = career_runs.company_id and m.user_id = (select auth.uid()))
);

create policy "plans_public_read" on public.plans for select to anon, authenticated using (is_public = true);
create policy "subscriptions_read_self" on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "audit_read_company_admin" on public.audit_events for select to authenticated using (
  company_id is not null and exists (
    select 1 from public.company_members m where m.company_id = audit_events.company_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin')
  )
);

-- No client-side writes to billing records or audit events.
revoke insert, update, delete on public.plans from anon, authenticated;
revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke insert, update, delete on public.audit_events from anon, authenticated;
