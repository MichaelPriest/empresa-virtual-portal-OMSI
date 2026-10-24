create or replace function public.validate_career_run_links()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_career_company uuid;
  v_vehicle_company uuid;
begin
  select c.company_id into v_career_company from public.careers c where c.id = new.career_id;
  if v_career_company is null or v_career_company <> new.company_id then
    raise exception 'Career run must reference a career from the same company';
  end if;
  if new.vehicle_id is not null then
    select v.company_id into v_vehicle_company from public.vehicles v where v.id = new.vehicle_id;
    if v_vehicle_company is null or v_vehicle_company <> new.company_id then
      raise exception 'Career run vehicle must belong to the same company';
    end if;
  end if;
  if new.driver_id <> (select auth.uid()) then
    raise exception 'Driver must be the authenticated user';
  end if;
  if not exists (select 1 from public.company_members m where m.company_id = new.company_id and m.user_id = new.driver_id) then
    raise exception 'Driver must be a member of the company';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_career_run_links() from public, anon, authenticated;
create trigger career_runs_validate_links before insert or update on public.career_runs
for each row execute function public.validate_career_run_links();

create or replace function public.prevent_company_creator_change()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'Company creator cannot be changed';
  end if;
  return new;
end;
$$;
revoke all on function public.prevent_company_creator_change() from public, anon, authenticated;
create trigger companies_creator_immutable before update on public.companies
for each row execute function public.prevent_company_creator_change();
