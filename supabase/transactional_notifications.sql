-- Apply after portal_notifications, operator_conversations_meeting_points and operator_agreements.
-- Starts OFF. No historical activity is emailed by this migration.
begin;
create table if not exists public.email_notification_settings (
 id boolean primary key default true check(id),
 mode text not null default 'off' check(mode in ('off','test','live')),
 test_recipients text[] not null default '{}',
 daily_budget integer not null default 40 check(daily_budget between 1 and 10000)
);
insert into public.email_notification_settings(id) values(true) on conflict do nothing;
alter table public.email_notification_settings enable row level security;
revoke all on public.email_notification_settings from public,anon,authenticated;

create table if not exists public.email_notifications (
 id uuid primary key default gen_random_uuid(),
 event_key text not null, recipient_id uuid not null references auth.users(id) on delete cascade,
 audience text not null check(audience in ('team','customer','operator','application','agreement','account')),
 source_table text not null, source_id text not null,
 subject text not null, portal_path text not null,
 recipient_email text,
 state text not null default 'pending' check(state in ('pending','processing','accepted','delivered','failed','bounced','suppressed')),
 created_at timestamptz not null default now(), available_at timestamptz not null default now(),
 first_attempt_at timestamptz, attempts integer not null default 0,
 lease_id uuid, lease_until timestamptz, provider_id text unique,
 accepted_at timestamptz, delivered_at timestamptz, last_error text,
 unique(event_key,recipient_id),
 check(portal_path ~ '^/(my/|partners/|admin/)([?][a-zA-Z0-9=&_%.-]*)?$'),
 check(length(subject) between 1 and 180)
);
create index if not exists email_notifications_pending on public.email_notifications(available_at,created_at) where state in ('pending','processing');
alter table public.email_notifications enable row level security;
revoke all on public.email_notifications from public,anon,authenticated;
grant select on public.email_notifications to authenticated;
drop policy if exists "staff reads delivery status" on public.email_notifications;
create policy "staff reads delivery status" on public.email_notifications for select to authenticated using(public.is_team_member());

create or replace function public.enqueue_portal_email(k text, uid uuid, audience text, src text, sid text, title text, path text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from email_notification_settings where mode<>'off') then return;end if;
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then return;end if;
 insert into email_notifications(event_key,recipient_id,audience,source_table,source_id,subject,portal_path)
 values(k,uid,audience,src,sid,title,path) on conflict(event_key,recipient_id) do nothing;
end $$;

create or replace function public.enqueue_team_email(k text,src text,sid text,title text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare member record;begin
 for member in select user_id from team_members loop
  perform enqueue_portal_email(k,member.user_id,'team',src,sid,title,'/admin/');
 end loop;
end $$;

create or replace function public.enqueue_operator_email(k text,oid text,src text,sid text,title text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare member record;begin
 for member in select m.user_id from operator_memberships m join operators o on o.id=m.operator_id
 where m.operator_id=oid and m.status='active' and o.status in ('active','onboarding') loop
  perform enqueue_portal_email(k,member.user_id,'operator',src,sid,title,'/partners/');
 end loop;
end $$;

create or replace function public.queue_portal_event_email()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare k text; revision text;begin
 if not exists(select 1 from email_notification_settings where mode<>'off') then return new;end if;
 if tg_table_name='messages' then
  k='customer-message:'||new.id;
  if new."from"='customer' then perform enqueue_team_email(k,tg_table_name,new.id::text,'New customer message in TicoWild');
  else perform enqueue_portal_email(k,new.user_id,'customer',tg_table_name,new.id::text,'New message from TicoWild','/my/');end if;
 elsif tg_table_name='operator_messages' then
  if new.legacy then return new;end if;
  k='operator-message:'||new.id;
  if new.sender_role='operator' then perform enqueue_team_email(k,tg_table_name,new.id::text,'New operator message in TicoWild');
  else perform enqueue_operator_email(k,new.operator_id,tg_table_name,new.id::text,'New message from TicoWild');end if;
 elsif tg_table_name='bookings' then
  if tg_op='UPDATE' and new.notification_revision=old.notification_revision then return new;end if;
  k='booking:'||new.id||':'||new.notification_revision;
  perform enqueue_portal_email(k,new.user_id,'customer',tg_table_name,new.id::text,'Your TicoWild booking has an update','/my/');
  perform enqueue_operator_email(k,new.operator_id,tg_table_name,new.id::text,'A TicoWild booking needs your attention');
  perform enqueue_team_email(k,tg_table_name,new.id::text,'Booking activity in TicoWild');
 elsif tg_table_name='trips' then
  if tg_op='UPDATE' and (to_jsonb(new)-'portal_revision'-'notification_updated_at') is not distinct from (to_jsonb(old)-'portal_revision'-'notification_updated_at') then return new;end if;
  k='trip:'||new.id||':'||new.portal_revision;
  perform enqueue_portal_email(k,new.user_id,'customer',tg_table_name,new.id::text,'Your TicoWild trip has an update','/my/');
 elsif tg_table_name='operator_applications' then
  if new.status='draft' or (tg_op='UPDATE' and new.status=old.status) then return new;end if;
  k='application:'||new.id||':'||new.status||':'||new.updated_at;
  perform enqueue_portal_email(k,new.user_id,'application',tg_table_name,new.id::text,'Your TicoWild application: '||replace(new.status,'_',' '),'/partners/');
  if new.status='pending' then perform enqueue_team_email(k,tg_table_name,new.id::text,'Operator application ready for review');end if;
 elsif tg_table_name='public_inquiries' then
  if new.status='new' then perform enqueue_team_email('inquiry:'||new.id,tg_table_name,new.id::text,'New website inquiry in TicoWild');end if;
 elsif tg_table_name='operator_agreement_requests' then
  if new.signed_at is not null and old.signed_at is null then
   k='agreement-signed:'||new.id;
   perform enqueue_team_email(k,tg_table_name,new.id::text,'Operator agreement signed in TicoWild');
   perform enqueue_portal_email(k,new.signed_by,'agreement',tg_table_name,new.id::text,'Your signed TicoWild agreement is saved','/partners/?agreement='||new.id);
  end if;
 end if;
 return new;
end $$;

do $$ declare t text;begin
 foreach t in array array['messages','operator_messages','bookings','trips','operator_applications','public_inquiries','operator_agreement_requests'] loop
  execute format('drop trigger if exists queue_transactional_email on public.%I',t);
  execute format('create trigger queue_transactional_email after %s on public.%I for each row execute function public.queue_portal_event_email()',
   case when t in ('messages','operator_messages','public_inquiries') then 'insert' when t='operator_agreement_requests' then 'update' else 'insert or update' end,t);
 end loop;
end $$;

-- Recheck ownership at dispatch, not just when the event was created.
create or replace function public.portal_email_recipient_allowed(n public.email_notifications)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare oid text;begin
 if not exists(select 1 from auth.users where id=n.recipient_id and email_confirmed_at is not null) then return false;end if;
 if n.event_key like 'booking-overdue:%' and not exists(select 1 from bookings where id::text=n.source_id and status='Requested') then return false;end if;
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

alter table public.bookings add column if not exists response_requested_at timestamptz;
create or replace function public.track_booking_response_deadline()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if new.status='Requested' and new.operator_id is not null then
  if tg_op='INSERT' then new.response_requested_at=now();
  elsif old.status is distinct from new.status or old.operator_id is distinct from new.operator_id then new.response_requested_at=now();
  else new.response_requested_at=old.response_requested_at;end if;
 else new.response_requested_at=null;end if;
 return new;
end $$;
drop trigger if exists booking_response_deadline on public.bookings;
create trigger booking_response_deadline before insert or update on public.bookings for each row execute function public.track_booking_response_deadline();
create or replace function public.queue_overdue_booking_emails()
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare b record;k text;begin
 if not exists(select 1 from email_notification_settings where mode<>'off') then return;end if;
 for b in select * from bookings where status='Requested' and operator_id is not null and response_requested_at<=now()-interval '12 hours' loop
  k='booking-overdue:'||b.id||':'||b.response_requested_at;
  perform enqueue_operator_email(k,b.operator_id,'bookings',b.id::text,'TicoWild booking response is overdue');
  perform enqueue_team_email(k,'bookings',b.id::text,'An operator booking needs follow-up');
 end loop;
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
  select lower(email) into address from auth.users where id=n.recipient_id;
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

create or replace function public.finish_portal_email(notification_id uuid,lease uuid,provider text,error_text text default null,retryable boolean default false)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare saved boolean;
begin
 update email_notifications set state=case when provider is not null then 'accepted' when retryable then 'pending' else 'failed' end,
 provider_id=provider,accepted_at=case when provider is not null then now() else null end,
 last_error=left(error_text,500),available_at=now()+make_interval(secs=>least(3600,(60*power(2,attempts))::integer)),lease_id=null,lease_until=null
 where id=notification_id and lease_id=lease and state='processing';
 saved=found;
 if saved and provider is not null then
  perform record_portal_email_delivery(e.event_id,e.provider_id,e.event_type,e.event_at) from email_delivery_events e where e.provider_id=provider;
 end if;
 return saved;
end $$;

-- Webhooks may arrive before the worker saves the accepted provider id.
create table if not exists public.email_delivery_events (
 event_id text primary key,provider_id text not null,event_type text not null,event_at timestamptz not null,created_at timestamptz not null default now()
);
alter table public.email_delivery_events enable row level security;
revoke all on public.email_delivery_events from public,anon,authenticated;
create or replace function public.record_portal_email_delivery(event_id text,provider_id text,event_type text,event_at timestamptz)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if event_type not in ('email.delivered','email.bounced','email.failed','email.complained') then return;end if;
 insert into email_delivery_events values(event_id,provider_id,event_type,event_at,now()) on conflict do nothing;
 -- Bounce/complaint/failure takes priority over a late delivery callback.
 update email_notifications n set state=case when exists(select 1 from email_delivery_events e where e.provider_id=n.provider_id and e.event_type in ('email.bounced','email.complained')) then 'bounced'
 when exists(select 1 from email_delivery_events e where e.provider_id=n.provider_id and e.event_type='email.failed') then 'failed' else 'delivered' end,
 delivered_at=(select min(e.event_at) from email_delivery_events e where e.provider_id=n.provider_id and e.event_type='email.delivered')
 where n.provider_id=record_portal_email_delivery.provider_id;
end $$;

-- Only a backend service can enqueue, claim or update delivery; browser clients cannot send arbitrary emails.
revoke all on function public.enqueue_portal_email(text,uuid,text,text,text,text,text),public.enqueue_team_email(text,text,text,text),public.enqueue_operator_email(text,text,text,text,text),public.queue_portal_event_email(),public.portal_email_recipient_allowed(public.email_notifications),public.claim_portal_emails(integer),public.finish_portal_email(uuid,uuid,text,text,boolean),public.record_portal_email_delivery(text,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.queue_overdue_booking_emails(),public.track_booking_response_deadline() from public,anon,authenticated;
grant execute on function public.claim_portal_emails(integer),public.finish_portal_email(uuid,uuid,text,text,boolean),public.record_portal_email_delivery(text,text,text,timestamptz) to service_role;
commit;
