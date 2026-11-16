begin;
-- Lock the same booking before accepting the exact revision staff reviewed.
create or replace function public.save_reviewed_guest_care_schedule(schedule_id uuid,booking uuid,message_kind text,message_body text,send_time timestamptz,expected_booking_revision integer,expected_updated_at timestamptz default null)
returns public.guest_care_schedule language plpgsql security definer set search_path=public,pg_temp as $$
declare revision integer;
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 select notification_revision into revision from bookings where id=booking for update;
 if revision is null or revision is distinct from expected_booking_revision then raise exception 'Booking details changed. Refresh the trip, rebuild the message and review it again.';end if;
 return save_guest_care_schedule(schedule_id,booking,message_kind,message_body,send_time,expected_updated_at);
end $$;
revoke all on function public.save_reviewed_guest_care_schedule(uuid,uuid,text,text,timestamptz,integer,timestamptz) from public,anon,authenticated;
grant execute on function public.save_reviewed_guest_care_schedule(uuid,uuid,text,text,timestamptz,integer,timestamptz) to authenticated;
-- Existing implementation remains private to the guarded entry point.
revoke execute on function public.save_guest_care_schedule(uuid,uuid,text,text,timestamptz,timestamptz) from authenticated;
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
   update email_notifications set subject=case when r.kind='preparation' then 'Your TicoWild activity preparation is ready' else 'How was your TicoWild experience?' end where source_table='messages' and source_id=r.id::text and state='pending';
   update guest_care_schedule set state='sent',sent_at=now(),updated_at=clock_timestamp() where id=r.id;
  end if;
 end loop;
end $$;

commit;
