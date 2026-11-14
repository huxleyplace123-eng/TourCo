begin;
create table if not exists public.notification_receipts (
 user_id uuid not null references auth.users(id) on delete cascade,
 event_key text not null check(length(event_key) between 1 and 300),
 read_at timestamptz not null default now(),
 primary key(user_id,event_key)
);
alter table public.notification_receipts enable row level security;
drop policy if exists "read own alert receipts" on public.notification_receipts;
create policy "read own alert receipts" on public.notification_receipts for select to authenticated using(user_id=auth.uid());
drop policy if exists "insert own alert receipts" on public.notification_receipts;
create policy "insert own alert receipts" on public.notification_receipts for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "update own alert receipts" on public.notification_receipts;
create policy "update own alert receipts" on public.notification_receipts for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
revoke all on public.notification_receipts from anon;
grant select,insert,update on public.notification_receipts to authenticated;
alter table public.bookings add column if not exists notification_revision bigint not null default 1;
alter table public.bookings add column if not exists notification_updated_at timestamptz;
create or replace function public.track_booking_notification_revision()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if (to_jsonb(new)-'notification_revision'-'notification_updated_at') is distinct from (to_jsonb(old)-'notification_revision'-'notification_updated_at') then
  new.notification_revision=old.notification_revision+1;new.notification_updated_at=now();
 else new.notification_revision=old.notification_revision;new.notification_updated_at=old.notification_updated_at;end if;
 return new;
end; $$;
drop trigger if exists booking_notification_revision on public.bookings;
create trigger booking_notification_revision before update on public.bookings for each row execute function public.track_booking_notification_revision();
alter table public.trips add column if not exists notification_updated_at timestamptz;
create or replace function public.track_trip_notification_time()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if (to_jsonb(new)-'notification_updated_at') is distinct from (to_jsonb(old)-'notification_updated_at') then new.notification_updated_at=now();else new.notification_updated_at=old.notification_updated_at;end if;
 return new;
end; $$;
drop trigger if exists trip_notification_time on public.trips;
create trigger trip_notification_time before update on public.trips for each row execute function public.track_trip_notification_time();
commit;
