-- Staff-only composed email and agreement delivery through the existing queue.
begin;
create table if not exists public.crm_outbound (
 id uuid primary key, created_by uuid not null references auth.users(id),
 recipient_email text not null,subject text not null,body_text text not null,
 agreement_id uuid references public.operator_agreement_requests(id),created_at timestamptz not null default now()
);
alter table public.crm_outbound enable row level security;
revoke all on public.crm_outbound from public,anon,authenticated;
grant select on public.crm_outbound to authenticated;
drop policy if exists "staff reads outbound mail" on public.crm_outbound;
create policy "staff reads outbound mail" on public.crm_outbound for select to authenticated using(is_team_member());
alter table public.email_notifications add column if not exists body_text text;

create or replace function public.queue_crm_email(request_key uuid,recipient text,title text,message_text text,agreement_id uuid default null)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare existing crm_outbound%rowtype; qid uuid; req operator_agreement_requests%rowtype;begin
 if not is_team_member() or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Verified team access required';end if;
 recipient=lower(trim(recipient)); title=trim(title);
 if request_key is null or recipient is null or recipient !~ '^[A-Za-z0-9.!#$%&''*+/=?^_{|}~-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$' or length(recipient)>254 or title is null or length(title) not between 1 and 180 or title ~ '[\r\n]' or message_text is null or length(trim(message_text)) not between 1 and 20000 then raise exception 'One valid recipient, subject and message required';end if;
 perform pg_advisory_xact_lock(hashtext(request_key::text));
 select * into existing from crm_outbound where id=request_key;
 if found then
  if existing.created_by<>auth.uid() or existing.recipient_email<>recipient or existing.subject<>title or existing.body_text<>message_text or existing.agreement_id is distinct from queue_crm_email.agreement_id then raise exception 'This send request already exists with different content. Check delivery history before preparing another message';end if;
  select id into qid from email_notifications where source_table='crm_outbound' and source_id=request_key::text;
  return qid;
 end if;
 -- Same row lock as the dispatcher serializes submissions and daily reservations.
 perform 1 from email_notification_settings where id=true for update;
 if not exists(select 1 from email_notification_settings where mode='live' or (mode='test' and recipient=any(test_recipients))) then raise exception 'Sending is paused or this recipient is excluded by test mode';end if;
 if (select count(*) from email_notifications where state in ('pending','processing'))>=100 then raise exception 'The email queue is full. Check delivery status before sending more';end if;
 if agreement_id is not null then
  select * into req from operator_agreement_requests where id=queue_crm_email.agreement_id;
  if not found or req.recipient_email<>recipient or req.signed_at is not null or req.expires_at<=now() then raise exception 'Prepare a current unsigned agreement for this recipient';end if;
  if position('https://ticowild.com/partners/?agreement='||req.id in message_text)=0 then raise exception 'Keep the secure agreement link in the email';end if;
 end if;
 insert into crm_outbound values(request_key,auth.uid(),recipient,title,message_text,agreement_id,now());
 insert into email_notifications(event_key,recipient_id,audience,source_table,source_id,subject,portal_path,recipient_email,body_text)
 values('crm-send:'||request_key,auth.uid(),'team','crm_outbound',request_key::text,title,'/admin/',recipient,message_text) returning id into qid;
 if agreement_id is not null then update operator_agreement_requests set events=events||jsonb_build_array(jsonb_build_object('kind','email_queued','at',now(),'notification_id',qid)) where id=queue_crm_email.agreement_id;end if;
 return qid;
end $$;
revoke all on function public.queue_crm_email(uuid,text,text,text,uuid) from public,anon;
grant execute on function public.queue_crm_email(uuid,text,text,text,uuid) to authenticated;

create or replace function public.portal_email_recipient_allowed(n public.email_notifications)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare oid text;begin
 if n.source_table='crm_outbound' then
  return exists(select 1 from crm_outbound o join team_members t on t.user_id=o.created_by
   join auth.users u on u.id=o.created_by and u.email_confirmed_at is not null
   where o.id::text=n.source_id and o.created_by=n.recipient_id and o.recipient_email=n.recipient_email
   and (o.agreement_id is null or exists(select 1 from operator_agreement_requests a where a.id=o.agreement_id and a.recipient_email=o.recipient_email and a.expires_at>now() and a.signed_at is null)));
 end if;
 if not exists(select 1 from auth.users where id=n.recipient_id and email_confirmed_at is not null) then return false;end if;
 if n.event_key like 'booking-overdue:%' and not exists(select 1 from bookings b where b.id::text=n.source_id and b.status='Requested' and b.operator_id is not null and b.response_requested_at<=now()-interval '12 hours' and n.event_key='booking-overdue:'||b.id||':'||b.response_requested_at) then return false;end if;
 if n.audience='team' then return exists(select 1 from team_members where user_id=n.recipient_id);end if;
 if n.audience='customer' then
  if n.source_table='messages' then return exists(select 1 from messages where id::text=n.source_id and user_id=n.recipient_id);end if;
  if n.source_table='trips' then return exists(select 1 from trips where id::text=n.source_id and user_id=n.recipient_id);end if;
  if n.source_table='bookings' then return exists(select 1 from bookings b join trips t on t.id=b.trip_id where b.id::text=n.source_id and b.user_id=n.recipient_id and t.user_id=n.recipient_id);end if;
 elsif n.audience='operator' then
  if n.source_table='bookings' then select operator_id into oid from bookings where id::text=n.source_id;
  elsif n.source_table='operator_messages' then select operator_id into oid from operator_messages where id::text=n.source_id;end if;
  return exists(select 1 from operator_memberships m join operators o on o.id=m.operator_id where m.operator_id=oid and m.user_id=n.recipient_id and m.status='active' and o.status in ('active','onboarding'));
 elsif n.audience='application' then return exists(select 1 from operator_applications where id::text=n.source_id and user_id=n.recipient_id);
 elsif n.audience='agreement' then return exists(select 1 from operator_agreement_requests a join auth.users u on lower(u.email)=a.recipient_email where a.id::text=n.source_id and u.id=n.recipient_id);
 end if;
 return false;
end $$;


create or replace function public.claim_portal_emails(batch_size integer default 5)
returns setof public.email_notifications language plpgsql security definer set search_path=public,pg_temp as $$
declare cfg email_notification_settings%rowtype; n email_notifications%rowtype; address text; used integer;begin
 -- Serialize budget reservation across concurrent workers.
 select * into cfg from email_notification_settings where id=true for update;
 if cfg.mode='off' then return;end if;
 perform queue_overdue_booking_emails();
 select count(*) into used from email_notifications where first_attempt_at>=date_trunc('day',now());
 for n in select * from email_notifications where (state='pending' and available_at<=now()) or (state='processing' and lease_until<now()) order by created_at for update skip locked limit least(greatest(batch_size,1),10) loop
  if n.source_table='crm_outbound' then address=n.recipient_email;else select lower(email) into address from auth.users where id=n.recipient_id;end if;
  if not portal_email_recipient_allowed(n) or (n.recipient_email is not null and n.recipient_email is distinct from address) or (cfg.mode='test' and not(address=any(cfg.test_recipients))) then
   update email_notifications set state='suppressed',last_error='Recipient no longer eligible or excluded by test mode',lease_id=null,lease_until=null where id=n.id;continue;
  end if;
  -- Provider idempotency expires after 24h: ambiguous older attempts require review.
  if n.first_attempt_at<now()-interval '23 hours' or n.attempts>=8 then
   update email_notifications set state='failed',last_error='Retry window exhausted; review provider log before resending',lease_id=null,lease_until=null where id=n.id;continue;
  end if;
  if n.first_attempt_at is null and used>=cfg.daily_budget then continue;end if;
  if n.first_attempt_at is null then used=used+1;end if;
  update email_notifications set state='processing',recipient_email=address,first_attempt_at=coalesce(first_attempt_at,now()),attempts=attempts+1,lease_id=gen_random_uuid(),lease_until=now()+interval '5 minutes'
   where id=n.id returning * into n;
  return next n;
 end loop;
end $$;


create or replace function public.track_agreement_email_delivery() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare aid uuid;begin
 if new.source_table<>'crm_outbound' or new.state=old.state then return new;end if;
 select agreement_id into aid from crm_outbound where id::text=new.source_id;
 if aid is not null and new.state in ('accepted','delivered','failed','bounced','suppressed') then
 update operator_agreement_requests set events=events||jsonb_build_array(jsonb_build_object('kind','email_'||new.state,'at',now(),'notification_id',new.id,'provider','transactional')) where id=aid;
 end if;return new;
end $$;
drop trigger if exists agreement_email_delivery on email_notifications;
create trigger agreement_email_delivery after update on email_notifications for each row execute function track_agreement_email_delivery();
revoke all on function public.track_agreement_email_delivery() from public,anon,authenticated;
create or replace function public.crm_email_health() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 return (select jsonb_build_object('mode',c.mode,'daily_budget',c.daily_budget,
 'attempted_today',(select count(*) from email_notifications where first_attempt_at>=date_trunc('day',now())),
 'pending',(select count(*) from email_notifications where state='pending'),
 'failed',(select count(*) from email_notifications where state in ('failed','bounced') and created_at>now()-interval '7 days'),
 'stalled',(select count(*) from email_notifications where state='processing' and lease_until<now()),
 'oldest_pending',(select min(created_at) from email_notifications where state='pending')) from email_notification_settings c where id=true);
end $$;
revoke all on function public.crm_email_health() from public,anon;
grant execute on function public.crm_email_health() to authenticated;
commit;
