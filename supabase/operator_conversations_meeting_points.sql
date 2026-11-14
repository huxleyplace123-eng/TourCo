-- Shared operator conversations and booking-specific guest meeting points.
-- Apply after operator_booking_handoff.sql. Existing private messages remain private.
begin;
create table if not exists public.operator_messages (
 id uuid primary key default gen_random_uuid(),
 operator_id text not null references public.operators(id) on delete cascade,
 sender_user_id uuid references auth.users(id),
 sender_role text not null check(sender_role in ('team','operator')),
 text text not null check(length(trim(text)) between 1 and 5000),
 created_at timestamptz not null default now(),
 legacy boolean not null default false
);
create index if not exists operator_messages_thread_idx on public.operator_messages(operator_id,created_at,id);
alter table public.operator_messages enable row level security;
drop policy if exists "conversation participants read" on public.operator_messages;
create policy "conversation participants read" on public.operator_messages for select to authenticated using (
 public.is_team_member() or (public.is_operator_member(operator_id) and exists(select 1 from public.operators o where o.id=operator_id and o.status in ('active','onboarding')))
);
revoke all on public.operator_messages from anon;
revoke insert,update,delete on public.operator_messages from authenticated;
grant select on public.operator_messages to authenticated;
create or replace function pg_temp.legacy_message_time(value text,fallback timestamptz)
returns timestamptz language plpgsql as $$
begin return coalesce(value::timestamptz,fallback);exception when others then return fallback;end; $$;
-- Preserve server-stored legacy history once. Browser-only history is not guessed.
insert into public.operator_messages(id,operator_id,sender_role,text,created_at,legacy)
select md5(s.operator_id||':'||entry.ordinality::text||':'||entry.value::text)::uuid,s.operator_id,
 entry.value->>'from',entry.value->>'text',pg_temp.legacy_message_time(entry.value->>'at',s.updated_at),true
from public.operator_portal_state s
cross join lateral jsonb_array_elements(case when jsonb_typeof(s.state->'messages')='array' then s.state->'messages' else '[]'::jsonb end) with ordinality entry(value,ordinality)
where entry.value->>'from' in ('team','operator') and length(trim(entry.value->>'text')) between 1 and 5000
on conflict(id) do nothing;
create or replace function public.send_operator_message(requested_operator_id text,body text,request_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare actor text; saved public.operator_messages%rowtype;
begin
 if auth.uid() is null then raise exception 'Sign in required';end if;
 if request_id is null or body is null or length(trim(body)) not between 1 and 5000 then raise exception 'Write a message of 1 to 5000 characters';end if;
 if not exists(select 1 from public.operators where id=requested_operator_id) then raise exception 'Set up this operator portal account before sending shared messages';end if;
 if public.is_team_member() then actor='team';
 elsif public.is_operator_member(requested_operator_id) and exists(select 1 from public.operators where id=requested_operator_id and status in ('active','onboarding')) then actor='operator';
 else raise exception 'Conversation access denied';end if;
 insert into public.operator_messages(id,operator_id,sender_user_id,sender_role,text)
 values(request_id,requested_operator_id,auth.uid(),actor,trim(body)) on conflict(id) do nothing returning * into saved;
 if saved.id is null then
  select * into saved from public.operator_messages where id=request_id;
  if saved.operator_id is distinct from requested_operator_id or saved.sender_user_id is distinct from auth.uid() or saved.text is distinct from trim(body) then raise exception 'Message request does not match';end if;
 end if;
 return to_jsonb(saved);
end; $$;
revoke all on function public.send_operator_message(text,text,uuid) from public,anon;
grant execute on function public.send_operator_message(text,text,uuid) to authenticated;
alter table public.bookings add column if not exists meeting_point_name text;
alter table public.bookings add column if not exists meeting_point_lat double precision;
alter table public.bookings add column if not exists meeting_point_lng double precision;
alter table public.bookings add column if not exists meeting_instructions text;
create or replace function public.publish_customer_trip(customer_id text,trip_data jsonb,expected_revision integer default 0)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare c jsonb; owner_id uuid; tid uuid; old_revision integer; b jsonb; bid uuid; start_day date; end_day date; party integer; assigned_id text; assigned_name text; guest text; mlat double precision; mlng double precision; mname text; minstructions text;
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
  mlat=case when b ? 'meeting_point_lat' then nullif(trim(b->>'meeting_point_lat'),'')::double precision else (select meeting_point_lat from public.bookings where id=bid) end;
  mlng=case when b ? 'meeting_point_lng' then nullif(trim(b->>'meeting_point_lng'),'')::double precision else (select meeting_point_lng from public.bookings where id=bid) end;
  if (mlat is null)<>(mlng is null) or (mlat is not null and (not (mlat between -90 and 90) or not (mlng between -180 and 180))) then raise exception 'Enter both valid meeting coordinates or leave both blank';end if;
  mname=left(case when b ? 'meeting_point_name' then b->>'meeting_point_name' else (select meeting_point_name from public.bookings where id=bid) end,200);
  minstructions=left(case when b ? 'meeting_instructions' then b->>'meeting_instructions' else (select meeting_instructions from public.bookings where id=bid) end,2000);
  insert into public.bookings(id,trip_id,user_id,name,operator,date,time,meet,bring,status,operator_id,guest_name,guest_count,meeting_point_name,meeting_point_lat,meeting_point_lng,meeting_instructions)
  values(bid,tid,owner_id,trim(b->>'name'),assigned_name,(b->>'date')::date,left(b->>'time',50),left(b->>'meet',1000),left(b->>'bring',1000),case when trip_data->>'status'='Cancelled' then 'Cancelled' else b->>'status' end,assigned_id,guest,party,mname,mlat,mlng,minstructions)
  on conflict(id) do update set name=excluded.name,operator=excluded.operator,date=excluded.date,time=excluded.time,meet=excluded.meet,bring=excluded.bring,status=excluded.status,operator_id=excluded.operator_id,guest_name=excluded.guest_name,guest_count=excluded.guest_count,meeting_point_name=excluded.meeting_point_name,meeting_point_lat=excluded.meeting_point_lat,meeting_point_lng=excluded.meeting_point_lng,meeting_instructions=excluded.meeting_instructions;
 end loop;
 if trip_data->>'status'='Cancelled' then update public.bookings set status='Cancelled' where trip_id=tid;end if;
 return tid;
end; $$;


revoke all on function public.publish_customer_trip(text,jsonb,integer) from public,anon;
grant execute on function public.publish_customer_trip(text,jsonb,integer) to authenticated;
commit;
