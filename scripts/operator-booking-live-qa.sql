-- Internal acceptance test only: no external messages; all fixtures rolled back.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('20000000-0000-0000-0000-00000000cb01','booking-qa-c@example.invalid',now(),'{}'),
('20000000-0000-0000-0000-00000000cb02','booking-qa-o@example.invalid',now(),'{}'),
('20000000-0000-0000-0000-00000000cb03','booking-qa-other@example.invalid',now(),'{}');
insert into public.crm_customers(id,record) values('booking-qa-rollback','{"name":"QA Guest","email":"booking-qa-c@example.invalid"}');
insert into public.operators(id,name,status) values('booking-qa-rollback','QA Operator','active');
insert into public.operator_memberships(operator_id,user_id,role,status) values('booking-qa-rollback','20000000-0000-0000-0000-00000000cb02','owner','active');
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
select public.publish_customer_trip('booking-qa-rollback','{"request_id":"20000000-0000-0000-0000-00000000cb04","title":"QA rollback only","start_date":"2026-12-01","end_date":"2026-12-02","travelers":3,"status":"Planning","bookings":[{"id":"20000000-0000-0000-0000-00000000cb05","name":"QA rollback activity","operator_id":"booking-qa-rollback","date":"2026-12-01","status":"Requested"}]}',0);
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-00000000cb02',true);
do $$ begin
 if (select count(*) from public.bookings)<>1 then raise exception 'FAIL operator assignment';end if;
 if not exists(select 1 from public.bookings where guest_name='QA Guest' and guest_count=3) then raise exception 'FAIL guest details';end if;
 perform public.respond_operator_booking('20000000-0000-0000-0000-00000000cb05','accepted');
 perform public.respond_operator_booking('20000000-0000-0000-0000-00000000cb05','accepted');
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-00000000cb01',true);
do $$ begin
 if not exists(select 1 from public.bookings where status='Confirmed') then raise exception 'FAIL customer confirmation';end if;
 if not exists(select 1 from public.trips where portal_revision=2) then raise exception 'FAIL response revision';end if;
 update public.bookings set status='Requested' where id='20000000-0000-0000-0000-00000000cb05';if found then raise exception 'FAIL customer booking edit';end if;
 begin
 perform public.respond_operator_booking('20000000-0000-0000-0000-00000000cb05','declined');
 raise exception 'FAIL customer response allowed';
 exception when raise_exception then if sqlerrm<>'Booking access denied' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-00000000cb03',true);
do $$ begin
 if exists(select 1 from public.bookings) then raise exception 'FAIL cross-account leak';end if;
 begin
 perform public.respond_operator_booking('20000000-0000-0000-0000-00000000cb05','declined');
 raise exception 'FAIL outsider response allowed';
 exception when raise_exception then if sqlerrm<>'Booking access denied' then raise;end if;end;
end $$;
reset role;
update public.bookings set status='Requested' where id='20000000-0000-0000-0000-00000000cb05';
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-00000000cb02',true);
set local role authenticated;
select public.respond_operator_booking('20000000-0000-0000-0000-00000000cb05','declined');
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-00000000cb01',true);
do $$ begin if not exists(select 1 from public.bookings where status='Declined') then raise exception 'FAIL customer decline';end if;end $$;
rollback;
select 'PASS: live assignment, guest details, operator acceptance, customer confirmation, decline, idempotency, revisions, customer write protection and cross-account isolation. All fixtures rolled back.' as booking_handoff_verification;

