-- Extend team-only health with the last successful worker database check.
begin;
alter table public.email_notification_settings add column if not exists last_worker_check_at timestamptz;
create or replace function public.claim_portal_emails(batch_size integer default 5)
returns setof public.email_notifications language plpgsql security definer set search_path=public,pg_temp as $$
declare cfg email_notification_settings%rowtype; n email_notifications%rowtype; address text; used integer;begin
 -- Serialize budget reservation across concurrent workers.
 select * into cfg from email_notification_settings where id=true for update;
 update email_notification_settings set last_worker_check_at=now() where id=true;
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
create or replace function public.crm_email_health() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 return (select jsonb_build_object('mode',c.mode,'daily_budget',c.daily_budget,
 'checked_at',now(),'last_worker_check_at',c.last_worker_check_at,
 'attempted_today',(select count(*) from email_notifications where first_attempt_at>=date_trunc('day',now())),
 'pending',(select count(*) from email_notifications where state='pending'),
 'failed',(select count(*) from email_notifications where state in ('failed','bounced') and created_at>now()-interval '7 days'),
 'stalled',(select count(*) from email_notifications where state='processing' and lease_until<now()),
 'oldest_pending',(select min(created_at) from email_notifications where state='pending')) from email_notification_settings c where id=true);
end $$;
commit;
