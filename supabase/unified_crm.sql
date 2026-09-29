-- TicoWild unified CRM migration.
-- Run after schema.sql and operator_portal.sql. Safe to run repeatedly.

create table if not exists public.crm_customers (
  id text primary key,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_operator_overlays (
  operator_id text primary key,
  overlay jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.crm_customers enable row level security;
alter table public.crm_operator_overlays enable row level security;

drop policy if exists "public can create inquiries" on public.public_inquiries;
create policy "public can create inquiries" on public.public_inquiries for insert with check (
  true
);

alter table public.public_inquiries drop constraint if exists public_inquiries_safe_input;
alter table public.public_inquiries add constraint public_inquiries_safe_input check (
  length(trim(coalesce(name, ''))) between 1 and 120
  and length(trim(coalesce(email, ''))) between 3 and 320
  and length(coalesce(phone, '')) <= 50
  and length(coalesce(destination, '')) <= 160
  and length(coalesce(notes, '')) <= 5000
  and coalesce(cardinality(activity_ids), 0) <= 20
  and coalesce(status, 'new') in ('new', 'imported', 'archived', 'qa')
);

drop policy if exists "team manages crm customers" on public.crm_customers;
create policy "team manages crm customers" on public.crm_customers for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team manages operator overlays" on public.crm_operator_overlays;
create policy "team manages operator overlays" on public.crm_operator_overlays for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team reads public inquiries" on public.public_inquiries;
create policy "team reads public inquiries" on public.public_inquiries for select
  using (public.is_team_member());

drop policy if exists "team updates public inquiries" on public.public_inquiries;
create policy "team updates public inquiries" on public.public_inquiries for update
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team reads customer profiles" on public.profiles;
create policy "team reads customer profiles" on public.profiles for select
  using (public.is_team_member());

drop policy if exists "team manages trips" on public.trips;
create policy "team manages trips" on public.trips for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team manages bookings" on public.bookings;
create policy "team manages bookings" on public.bookings for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team manages messages" on public.messages;
create policy "team manages messages" on public.messages for all
  using (public.is_team_member()) with check (public.is_team_member());

create index if not exists crm_customers_updated_idx on public.crm_customers(updated_at desc);
create index if not exists public_inquiries_status_created_idx on public.public_inquiries(status, created_at);
create index if not exists trips_user_created_idx on public.trips(user_id, created_at desc);
create index if not exists messages_user_at_idx on public.messages(user_id, at);

-- The verified TicoWild Gmail account is the CRM owner. Supabase only fires
-- this after the mailbox owner completes its email sign-in link.
create or replace function public.handle_ticowild_team_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(new.email, '')) = 'ticowildtours@gmail.com' then
    insert into public.team_members (user_id, role) values (new.id, 'admin')
    on conflict (user_id) do update set role = 'admin';
  end if;
  return new;
end; $$;

drop trigger if exists on_ticowild_team_user_created on auth.users;
create trigger on_ticowild_team_user_created after insert or update of email on auth.users
  for each row execute function public.handle_ticowild_team_user();
