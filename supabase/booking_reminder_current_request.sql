-- Preserve CRM outbound authorization and reject obsolete response deadlines.
begin;
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
commit;
