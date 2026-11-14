-- Temporary internal verification; no operator invitation is delivered.
begin;
insert into auth.users(id,email,email_confirmed_at) values('61000000-0000-0000-0000-000000000001','invitation-qa@example.invalid',now());
insert into public.operators(id,name,status) values('invitation-qa-rollback','QA rollback','active');
insert into public.operator_invites(operator_id,email,role) values('invitation-qa-rollback','invitation-qa@example.invalid','owner');
select set_config('request.jwt.claim.sub','61000000-0000-0000-0000-000000000001',true);
set local role authenticated;
do $$ begin
 if public.accept_operator_invitation() is distinct from 'invitation-qa-rollback' then raise exception 'FAIL invitation not accepted';end if;
 if public.accept_operator_invitation() is not null then raise exception 'FAIL invitation retry';end if;
 if not exists(select 1 from public.operator_memberships where user_id=auth.uid() and operator_id='invitation-qa-rollback') then raise exception 'FAIL membership missing';end if;
 if not exists(select 1 from public.operators where id='invitation-qa-rollback' and status='active') then raise exception 'FAIL active status changed';end if;
end $$;
rollback;
select 'PASS: verified existing user linked, retry safe, active company preserved, fixtures rolled back' as invitation_check;
select (select count(*) from public.operators) as portal_companies,
(select count(*) from public.operator_memberships where status='active') as active_memberships,
(select count(*) from public.operator_invites where accepted_at is null and expires_at>now()) as pending_invitations,
(select count(*) from public.bookings b join public.trips t on t.id=b.trip_id where b.status not in ('Cancelled','Completed','Declined') and t.status not in ('Cancelled','Completed') and (b.operator_id is null or not exists(select 1 from public.operators o join public.operator_memberships m on m.operator_id=o.id where o.id=b.operator_id and o.status='active' and m.status='active'))) as bookings_needing_assignment;
