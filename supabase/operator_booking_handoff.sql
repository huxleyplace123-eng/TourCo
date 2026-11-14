-- Apply after operator_portal.sql and customer_portal_integration.sql.
-- No historical operator assignments or responses are inferred.
begin;
alter table public.bookings add column if not exists guest_name text;
alter table public.bookings add column if not exists guest_count integer;
alter table public.bookings add column if not exists operator_responded_at timestamptz;
alter table public.bookings add column if not exists operator_responded_by uuid references auth.users(id);
update public.bookings b set guest_name=left(coalesce(nullif(trim(c.record->>'name'),''),nullif(trim(p.name),''),'Guest name pending'),200),guest_count=t.travelers
from public.trips t left join public.crm_customers c on c.id=t.source_customer_id left join public.profiles p on p.id=t.user_id
where b.trip_id=t.id and b.guest_count is null;
create or replace function public.publish_customer_trip(customer_id text,trip_data jsonb,expected_revision integer default 0)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare c jsonb; owner_id uuid; tid uuid; old_revision integer; b jsonb; bid uuid; start_day date; end_day date; party integer; assigned_id text; assigned_name text; guest text;
begin
 if not public.is_team_member() then raise exception 'Team access required'; end if;
 select record into c from public.crm_customers where id=customer_id;
 if c is null then raise exception 'CRM customer not found'; end if;
 select id into owner_id from auth.users where lower(trim(email))=lower(trim(c->>'email')) and email_confirmed_at is not null;
 if owner_id is null then raise exception 'Customer must verify their email by signing in first'; end if;
 guest=left(coalesce(nullif(trim(c->>'name'),''),(select nullif(trim(name),'') from public.profiles where id=owner_id),'Guest name pending'),200);
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
  assigned_id=nullif(b->>'operator_id','');
  assigned_name=left(b->>'operator',200);
  if assigned_id is not null then
   select name into assigned_name from public.operators o where o.id=assigned_id and o.status='active'
     and exists(select 1 from public.operator_memberships m where m.operator_id=o.id and m.status='active');
   if not found then raise exception 'Select an active operator with portal access';end if;
  end if;
  insert into public.bookings(id,trip_id,user_id,name,operator,date,time,meet,bring,status,operator_id,guest_name,guest_count)
  values(bid,tid,owner_id,trim(b->>'name'),assigned_name,(b->>'date')::date,left(b->>'time',50),left(b->>'meet',1000),left(b->>'bring',1000),case when trip_data->>'status'='Cancelled' then 'Cancelled' else b->>'status' end,assigned_id,guest,party)
  on conflict(id) do update set name=excluded.name,operator=excluded.operator,date=excluded.date,time=excluded.time,meet=excluded.meet,bring=excluded.bring,status=excluded.status,operator_id=excluded.operator_id,guest_name=excluded.guest_name,guest_count=excluded.guest_count;
 end loop;
 if trip_data->>'status'='Cancelled' then update public.bookings set status='Cancelled' where trip_id=tid;end if;
 return tid;
end; $$;

create or replace function public.respond_operator_booking(booking_id uuid,response text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare item public.bookings%rowtype; trip public.trips%rowtype; target text; tid uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required';end if;
 if response is null or response not in ('accepted','declined') then raise exception 'Invalid booking response';end if;
 select trip_id into tid from public.bookings where id=booking_id;
 -- Match publish lock ordering so responses and staff edits cannot deadlock.
 select * into trip from public.trips where id=tid for update;
 select * into item from public.bookings where id=booking_id for update;
 if item.id is null or not (public.is_team_member() or exists(
   select 1 from public.operator_memberships m join public.operators o on o.id=m.operator_id
   where m.user_id=auth.uid() and m.operator_id=item.operator_id and m.status='active'
     and m.role in ('owner','manager','guide') and o.status='active'
 )) then raise exception 'Booking access denied';end if;
 if trip.status in ('Cancelled','Completed') then raise exception 'This trip is no longer accepting responses';end if;
 target=case when response='accepted' then 'Confirmed' else 'Declined' end;
 if item.status=target then return to_jsonb(item);end if;
 if item.status is distinct from 'Requested' then raise exception 'Booking has changed. Refresh before responding';end if;
 update public.bookings set status=target,operator_responded_at=now(),operator_responded_by=auth.uid() where id=booking_id returning * into item;
 update public.trips set portal_revision=portal_revision+1 where id=tid;
 return to_jsonb(item);
end; $$;
revoke all on function public.respond_operator_booking(uuid,text) from public,anon;
grant execute on function public.respond_operator_booking(uuid,text) to authenticated;
revoke all on function public.publish_customer_trip(text,jsonb,integer) from public,anon;
grant execute on function public.publish_customer_trip(text,jsonb,integer) to authenticated;
commit;
