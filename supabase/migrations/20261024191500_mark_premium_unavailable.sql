alter table public.plans add column if not exists is_available boolean not null default true;
update public.plans set is_available = false where code in ('premium_monthly','premium_annual');
