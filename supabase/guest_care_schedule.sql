-- Reviewed customer messages. Empty on installation; no historical messages sent.
begin;
create table if not exists public.guest_care_schedule (
 id uuid primary key, booking_id uuid not null references public.bookings(id) on delete cascade,
 kind text not null check(kind in ('preparation','feedback')), body text not null check(length(body) between 8 and 4500),
 send_at timestamptz not null, booking_revision integer not null,
 state text not null default 'scheduled' check(state in ('scheduled','sent','cancelled','needs_review')),
 created_by uuid not null references auth.users(id), updated_at timestamptz not null default now(), sent_at timestamptz,
 unique(booking_id,kind)
);
alter table public.guest_care_schedule enable row level security;
revoke all on public.guest_care_schedule from public,anon,authenticated;
grant select on public.guest_care_schedule to authenticated;
drop policy if exists "team reads guest care schedule" on public.guest_care_schedule;
create policy "team reads guest care schedule" on public.guest_care_schedule for select to authenticated using(public.is_team_member());
create or replace function public.save_guest_care_schedule(schedule_id uuid,booking uuid,message_kind text,message_body text,send_time timestamptz,expected_updated_at timestamptz default null)
returns public.guest_care_schedule language plpgsql security definer set search_path=public,pg_temp as $$
declare b bookings%rowtype;t trips%rowtype;r guest_care_schedule%rowtype;
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 select * into b from bookings where id=booking for update;
 select * into t from trips where id=b.trip_id;
 if b.id is null or t.status='Cancelled' or b.status in ('Cancelled','Declined') then raise exception 'Booking is not active';end if;
 if message_kind='preparation' and (b.status<>'Confirmed' or t.status='Completed' or b.date<(now() at time zone 'America/Costa_Rica')::date) then raise exception 'Preparation requires an upcoming confirmed activity';end if;
 if message_kind='feedback' and b.status<>'Completed' then raise exception 'Feedback requires a completed activity';end if;
 if message_kind='preparation' and (nullif(trim(b.time),'') is null or nullif(trim(b.bring),'') is null or b.meeting_point_lat is null or b.meeting_point_lng is null or nullif(trim(b.meeting_instructions),'') is null or b.operator_id is null) then raise exception 'Complete the booking preparation details first';end if;
 if send_time<=now() or send_time>now()+interval '1 year' then raise exception 'Choose a future send time within one year';end if;
 if message_kind='preparation' and send_time >= ((b.date+coalesce(b.time::time,time '00:00')) at time zone 'America/Costa_Rica') then raise exception 'Preparation must be sent before the activity starts';end if;
 select * into r from guest_care_schedule where booking_id=booking and kind=message_kind for update;
 if r.id is not null then
  if r.state='sent' then raise exception 'This message has already been sent';end if;
  if r.updated_at is distinct from expected_updated_at then raise exception 'Schedule changed; refresh before editing';end if;
  update guest_care_schedule set body=trim(message_body),send_at=send_time,booking_revision=coalesce(b.notification_revision,1),state='scheduled',updated_at=clock_timestamp() where id=r.id returning * into r;
 else
  if expected_updated_at is not null then raise exception 'Schedule changed; refresh';end if;
  insert into guest_care_schedule(id,booking_id,kind,body,send_at,booking_revision,created_by) values(schedule_id,booking,message_kind,trim(message_body),send_time,coalesce(b.notification_revision,1),auth.uid()) returning * into r;
 end if;
 return r;
end $$;
create or replace function public.cancel_guest_care_schedule(schedule_id uuid,expected_updated_at timestamptz)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 update guest_care_schedule set state='cancelled',updated_at=clock_timestamp() where id=schedule_id and updated_at=expected_updated_at and state in ('scheduled','needs_review');
 if not found then raise exception 'Message changed or already sent; refresh';end if;
end $$;
create or replace function public.dispatch_guest_care_schedule()
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r guest_care_schedule%rowtype;b bookings%rowtype;t trips%rowtype;
begin
 if not exists(select 1 from email_notification_settings where mode<>'off') then return;end if;
 for r in select * from guest_care_schedule where state='scheduled' and send_at<=now() order by send_at for update skip locked limit 20 loop
  select * into b from bookings where id=r.booking_id for update;
  select * into t from trips where id=b.trip_id for share;
  if t.status='Cancelled' or b.status in ('Cancelled','Declined') then
   update guest_care_schedule set state='cancelled',updated_at=clock_timestamp() where id=r.id;
  elsif b.notification_revision<>r.booking_revision or (r.kind='preparation' and (b.status<>'Confirmed' or t.status='Completed' or ((b.date+coalesce(b.time::time,time '00:00')) at time zone 'America/Costa_Rica')<=now())) or (r.kind='feedback' and b.status<>'Completed') then
   update guest_care_schedule set state='needs_review',updated_at=clock_timestamp() where id=r.id;
  else
   insert into messages(id,user_id,"from",text) values(r.id,t.user_id,'team',r.body) on conflict(id) do nothing;
   if not exists(select 1 from messages where id=r.id and user_id=t.user_id and "from"='team' and text=r.body) then raise exception 'Message identity conflict';end if;
   update guest_care_schedule set state='sent',sent_at=now(),updated_at=clock_timestamp() where id=r.id;
  end if;
 end loop;
end $$;
-- Existing worker invokes this function. Preserve overdue operator reminders.
create or replace function public.queue_overdue_booking_emails()
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare b record;k text;begin
 if not exists(select 1 from email_notification_settings where mode<>'off') then return;end if;
 for b in select * from bookings where status='Requested' and operator_id is not null and response_requested_at<=now()-interval '12 hours' loop
  k='booking-overdue:'||b.id||':'||b.response_requested_at;
  perform enqueue_operator_email(k,b.operator_id,'bookings',b.id::text,'TicoWild booking response is overdue');
  perform enqueue_team_email(k,'bookings',b.id::text,'An operator booking needs follow-up');
 end loop;
 perform dispatch_guest_care_schedule();
end $$;
revoke all on function public.save_guest_care_schedule(uuid,uuid,text,text,timestamptz,timestamptz),public.cancel_guest_care_schedule(uuid,timestamptz),public.dispatch_guest_care_schedule() from public,anon,authenticated;
grant execute on function public.save_guest_care_schedule(uuid,uuid,text,text,timestamptz,timestamptz),public.cancel_guest_care_schedule(uuid,timestamptz) to authenticated;
commit;
