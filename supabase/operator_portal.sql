-- TicoWild Partner Center
-- Run AFTER supabase/schema.sql in the Supabase SQL Editor.
-- This migration is safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.operators (
  id              text primary key,
  name            text not null,
  status          text not null default 'invited' check (status in ('invited','onboarding','active','suspended','declined')),
  type            text default 'tours',
  email           text,
  phone           text,
  whatsapp        text,
  website         text,
  regions         text,
  destinations    text,
  categories      text[] not null default '{}',
  referral_fee    numeric,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.team_members (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'admin' check (role in ('admin','manager','support','finance')),
  created_at  timestamptz not null default now()
);

create table if not exists public.operator_memberships (
  operator_id text not null references public.operators(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner','manager','guide','finance')),
  status      text not null default 'active' check (status in ('active','suspended')),
  created_at  timestamptz not null default now(),
  primary key (operator_id, user_id)
);

create unique index if not exists operator_membership_one_owner
  on public.operator_memberships(operator_id) where role = 'owner' and status = 'active';

create table if not exists public.operator_invites (
  id           uuid primary key default gen_random_uuid(),
  operator_id  text not null references public.operators(id) on delete cascade,
  email        text not null,
  role         text not null default 'owner' check (role in ('owner','manager','guide','finance')),
  invited_by   uuid references auth.users(id),
  expires_at   timestamptz not null default (now() + interval '14 days'),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

create unique index if not exists operator_invites_open_email
  on public.operator_invites(lower(email)) where accepted_at is null;

create table if not exists public.operator_applications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  email              text not null,
  company_name       text not null default '',
  contact_name       text default '',
  phone              text default '',
  whatsapp           text default '',
  website            text default '',
  regions            text[] not null default '{}',
  categories         text[] not null default '{}',
  languages          text[] not null default '{}',
  years_in_business  integer,
  description        text default '',
  status             text not null default 'draft' check (status in ('draft','pending','needs_changes','approved','declined')),
  review_notes       text,
  submitted_at       timestamptz,
  reviewed_at        timestamptz,
  reviewed_by        uuid references auth.users(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Compatibility layer for the portal UI already in the repository. Moving
-- tours/messages/availability to normalized tables later does not change auth.
create table if not exists public.operator_portal_state (
  operator_id text primary key references public.operators(id) on delete cascade,
  state       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create or replace function public.is_team_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.team_members where user_id = auth.uid());
$$;

create or replace function public.is_operator_member(requested_operator_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.operator_memberships
    where operator_id = requested_operator_id and user_id = auth.uid() and status = 'active'
  );
$$;

alter table public.operators            enable row level security;
alter table public.team_members         enable row level security;
alter table public.operator_memberships enable row level security;
alter table public.operator_invites     enable row level security;
alter table public.operator_applications enable row level security;
alter table public.operator_portal_state enable row level security;

drop policy if exists "operator or team reads company" on public.operators;
create policy "operator or team reads company" on public.operators for select
  using (public.is_operator_member(id) or public.is_team_member());

drop policy if exists "team manages companies" on public.operators;
create policy "team manages companies" on public.operators for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "member reads membership" on public.operator_memberships;
create policy "member reads membership" on public.operator_memberships for select
  using (user_id = auth.uid() or public.is_team_member());

drop policy if exists "team manages memberships" on public.operator_memberships;
create policy "team manages memberships" on public.operator_memberships for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team member reads own role" on public.team_members;
create policy "team member reads own role" on public.team_members for select
  using (user_id = auth.uid());

drop policy if exists "team manages invitations" on public.operator_invites;
create policy "team manages invitations" on public.operator_invites for all
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "invitee reads invitation" on public.operator_invites;
create policy "invitee reads invitation" on public.operator_invites for select
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));

drop policy if exists "applicant manages application" on public.operator_applications;
create policy "applicant manages application" on public.operator_applications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "team reviews applications" on public.operator_applications;
create policy "team reviews applications" on public.operator_applications for all
  using (public.is_team_member()) with check (public.is_team_member());

-- Applicants may edit their answers, but cannot approve themselves or write
-- team-only review fields even though they own the application row.
create or replace function public.protect_operator_application_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_team_member() then return new; end if;
  if new.status not in ('draft','pending') then raise exception 'Invalid applicant status'; end if;
  if tg_op = 'UPDATE' then
    new.review_notes := old.review_notes;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
  end if;
  return new;
end; $$;

drop trigger if exists protect_operator_application_review on public.operator_applications;
create trigger protect_operator_application_review before insert or update on public.operator_applications
  for each row execute function public.protect_operator_application_review();

drop policy if exists "operator manages portal" on public.operator_portal_state;
create policy "operator manages portal" on public.operator_portal_state for all
  using (public.is_operator_member(operator_id) or public.is_team_member())
  with check (public.is_operator_member(operator_id) or public.is_team_member());

-- An operator account is never allowed to choose an operator_id. A matching,
-- unexpired invitation is the only automatic link to an existing company.
create or replace function public.handle_new_operator_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pending_invite public.operator_invites%rowtype;
begin
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') <> 'operator' then
    return new;
  end if;

  insert into public.operator_applications (user_id, email, company_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'company_name', ''))
  on conflict (user_id) do nothing;

  select * into pending_invite
  from public.operator_invites
  where lower(email) = lower(new.email)
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if found then
    insert into public.operator_memberships (operator_id, user_id, role)
    values (pending_invite.operator_id, new.id, pending_invite.role)
    on conflict do nothing;
    insert into public.operator_portal_state (operator_id) values (pending_invite.operator_id)
    on conflict do nothing;
    update public.operator_invites set accepted_at = now() where id = pending_invite.id;
    update public.operators set status = 'onboarding', updated_at = now() where id = pending_invite.operator_id;
  end if;
  return new;
end; $$;

drop trigger if exists on_operator_auth_user_created on auth.users;
create trigger on_operator_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_operator_user();

-- Team-only approval for a public application. This creates the company,
-- links the applicant as owner, and opens the portal atomically.
create or replace function public.approve_operator_application(application_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  app public.operator_applications%rowtype;
  new_operator_id text;
begin
  if not public.is_team_member() then raise exception 'Not authorized'; end if;
  select * into app from public.operator_applications where id = application_id for update;
  if not found then raise exception 'Application not found'; end if;

  new_operator_id := regexp_replace(lower(app.company_name), '[^a-z0-9]+', '-', 'g') || '-' || substr(app.id::text, 1, 8);
  insert into public.operators (id,name,status,email,phone,whatsapp,website,regions,categories)
  values (new_operator_id,app.company_name,'active',app.email,app.phone,app.whatsapp,app.website,array_to_string(app.regions,', '),app.categories)
  on conflict (id) do update set status='active', updated_at=now();
  insert into public.operator_memberships (operator_id,user_id,role) values (new_operator_id,app.user_id,'owner') on conflict do nothing;
  insert into public.operator_portal_state (operator_id,state) values (new_operator_id,jsonb_build_object('profile',jsonb_build_object('name',app.company_name,'email',app.email,'phone',app.phone,'whatsapp',app.whatsapp,'website',app.website,'blurb',app.description))) on conflict do nothing;
  update public.operator_applications set status='approved',reviewed_at=now(),reviewed_by=auth.uid(),updated_at=now() where id=application_id;
  return new_operator_id;
end; $$;

grant execute on function public.approve_operator_application(uuid) to authenticated;

-- Team-only invitation for an operator that already exists in the CRM. The
-- portal signup trigger links the account only when the signup email matches.
create or replace function public.invite_operator(
  requested_operator_id text,
  company_name text,
  invite_email text,
  member_role text default 'owner'
) returns uuid language plpgsql security definer set search_path = public as $$
declare invite_id uuid;
begin
  if not public.is_team_member() then raise exception 'Not authorized'; end if;
  if member_role not in ('owner','manager','guide','finance') then raise exception 'Invalid role'; end if;
  insert into public.operators(id,name,email,status)
  values(requested_operator_id,company_name,lower(invite_email),'invited')
  on conflict(id) do update set name=excluded.name,email=excluded.email,updated_at=now();
  update public.operator_invites set expires_at=now()
    where lower(email)=lower(invite_email) and accepted_at is null;
  insert into public.operator_invites(operator_id,email,role,invited_by)
  values(requested_operator_id,lower(invite_email),member_role,auth.uid()) returning id into invite_id;
  return invite_id;
end; $$;

grant execute on function public.invite_operator(text,text,text,text) to authenticated;

-- Allow an assigned operator to read its bookings without exposing any other
-- customer's trips or bookings. Existing customer policies stay intact.
do $$ begin
  if to_regclass('public.bookings') is not null then
    execute 'drop policy if exists "assigned operator reads bookings" on public.bookings';
    execute 'create policy "assigned operator reads bookings" on public.bookings for select using (public.is_operator_member(operator_id))';
  end if;
end $$;

-- ONE-TIME ADMIN SETUP (run after your team member creates a Supabase account):
-- insert into public.team_members(user_id, role) values ('YOUR-AUTH-USER-UUID', 'admin');
