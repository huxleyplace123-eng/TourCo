-- TicoWild customer portal — database schema.
-- Paste this into your Supabase project (SQL Editor → New query → Run).
-- Row-level security is ON everywhere: a signed-in customer can only ever see
-- and touch their OWN rows. Your team (service role) sees everything from the CRM.

-- ── Profiles (1 per customer, keyed to their auth user) ──────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  phone      text,
  country    text,
  travelers  text,
  notes      text,
  created_at timestamptz default now()
);

-- ── Trips ────────────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text,
  region     text,
  start_date date,
  end_date   date,
  travelers  int,
  status     text default 'Planning',   -- Planning · Deposit paid · Confirmed · In progress · Completed
  total      numeric,
  deposit    numeric,
  created_at timestamptz default now()
);

-- ── Bookings (one per activity in a trip; also assigned to an operator) ──────
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  operator_id text,                       -- matches the CRM operator id
  name        text,                       -- activity name
  operator    text,                       -- operator display name
  date        date,
  time        text,
  meet        text,
  bring       text,
  photo       text,
  price       numeric,
  status      text default 'Requested',   -- Requested · Confirmed · Declined · Completed
  created_at  timestamptz default now()
);

-- ── Messages (customer ↔ TicoWild concierge; same thread the CRM shows) ──────
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  "from"     text not null,               -- 'customer' | 'team'
  text       text not null,
  at         timestamptz default now()
);

-- ── Row-level security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.trips    enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;

create policy "own profile"   on public.profiles for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own trips"     on public.trips    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own bookings"  on public.bookings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own messages"  on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
