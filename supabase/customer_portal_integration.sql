-- Customer portal integration. Apply after unified_crm.sql and customer_portal_permissions.sql.
begin;
alter table public.trips add column if not exists source_customer_id text references public.crm_customers(id);
alter table public.trips add column if not exists portal_revision integer not null default 1;
create index if not exists trips_source_customer_idx on public.trips(source_customer_id);
create table if not exists public.customer_preferences (
 user_id uuid not null references auth.users(id) on delete cascade,
 key text not null check(length(key) between 1 and 120),
 value jsonb not null check(octet_length(value::text)<=30000),
 primary key(user_id,key)
);
alter table public.customer_preferences enable row level security;
drop policy if exists "own customer preferences" on public.customer_preferences;
create policy "own customer preferences" on public.customer_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.customer_preferences to authenticated;
create or replace function public.publish_customer_trip(customer_id text,trip_data jsonb,expected_revision integer default 0)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare c jsonb; owner_id uuid; tid uuid; old_revision integer; b jsonb; bid uuid; start_day date; end_day date; party integer;
begin
 if not public.is_team_member() then raise exception 'Team access required'; end if;
 select record into c from public.crm_customers where id=customer_id;
 if c is null then raise exception 'CRM customer not found'; end if;
 select id into owner_id from auth.users where lower(trim(email))=lower(trim(c->>'email')) and email_confirmed_at is not null;
 if owner_id is null then raise exception 'Customer must verify their email by signing in first'; end if;
 start_day=(trip_data->>'start_date')::date;end_day=(trip_data->>'end_date')::date;party=(trip_data->>'travelers')::integer;
 if start_day is null or end_day is null or end_day<start_day or party is null or party not between 1 and 100 or length(trim(coalesce(trip_data->>'title',''))) not between 1 and 200 then raise exception 'Invalid trip title, dates or traveler count';end if;
 if coalesce(trip_data->>'status','') not in ('Planning','Confirmed','In progress','Completed','Cancelled') then raise exception 'Invalid trip status';end if;
 if jsonb_typeof(trip_data->'bookings') is distinct from 'array' then raise exception 'Activities must be a list';end if;
 if jsonb_array_length(trip_data->'bookings')>100 then raise exception 'Too many activities';end if;
 tid=nullif(trip_data->>'id','')::uuid;
 if tid is not null then
  select portal_revision into old_revision from public.trips where id=tid and source_customer_id=customer_id and user_id=owner_id for update;
  if old_revision is null then raise exception 'Trip does not belong to this CRM customer';end if;
  if old_revision<>expected_revision then raise exception 'Trip changed in another session. Refresh and reopen it before publishing';end if;
  update public.trips set title=trim(trip_data->>'title'),region=left(trip_data->>'region',160),start_date=start_day,end_date=end_day,travelers=party,status=trip_data->>'status',portal_revision=portal_revision+1 where id=tid;
 else
  -- Client supplies a stable request UUID so retrying a slow publish cannot create duplicates.
  tid=(trip_data->>'request_id')::uuid;
  if tid is null then raise exception 'Missing publish request ID';end if;
  perform pg_advisory_xact_lock(hashtext(tid::text));
  if exists(select 1 from public.trips where id=tid and user_id=owner_id and source_customer_id=customer_id) then return tid;end if;
  insert into public.trips(id,user_id,source_customer_id,title,region,start_date,end_date,travelers,status)
  values(tid,owner_id,customer_id,trim(trip_data->>'title'),left(trip_data->>'region',160),start_day,end_day,party,trip_data->>'status');
 end if;
 for b in select value from jsonb_array_elements(trip_data->'bookings') loop
  bid=(b->>'id')::uuid;
  if bid is null or length(trim(coalesce(b->>'name',''))) not between 1 and 200 or (b->>'date') is null or (b->>'date')::date not between start_day and end_day then raise exception 'Invalid activity name, ID or date';end if;
  if coalesce(b->>'status','') not in ('Requested','Confirmed','Declined','Completed','Cancelled') then raise exception 'Invalid activity status';end if;
  if exists(select 1 from public.bookings where id=bid and (trip_id<>tid or user_id<>owner_id)) then raise exception 'Activity belongs to another trip';end if;
  insert into public.bookings(id,trip_id,user_id,name,operator,date,time,meet,bring,status)
  values(bid,tid,owner_id,trim(b->>'name'),left(b->>'operator',200),(b->>'date')::date,left(b->>'time',50),left(b->>'meet',1000),left(b->>'bring',1000),b->>'status')
  on conflict(id) do update set name=excluded.name,operator=excluded.operator,date=excluded.date,time=excluded.time,meet=excluded.meet,bring=excluded.bring,status=excluded.status;
 end loop;
 return tid;
end; $$;
revoke all on function public.publish_customer_trip(text,jsonb,integer) from public,anon;
grant execute on function public.publish_customer_trip(text,jsonb,integer) to authenticated;
commit;
