-- Live acceptance checks. All fixture data is rolled back. No emails or real reservations.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('10000000-0000-0000-0000-00000000ca01','portal-qa-a@example.invalid',now(),'{}'),
('10000000-0000-0000-0000-00000000ca02','portal-qa-b@example.invalid',now(),'{}');
insert into public.crm_customers(id,record) values('portal-qa-rollback','{"email":"portal-qa-a@example.invalid"}');
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
select public.publish_customer_trip('portal-qa-rollback','{"request_id":"10000000-0000-0000-0000-00000000ca03","title":"QA rollback only","region":"Arenal","start_date":"2026-12-01","end_date":"2026-12-03","travelers":2,"status":"Planning","bookings":[{"id":"10000000-0000-0000-0000-00000000ca04","name":"QA rollback activity","date":"2026-12-02","time":"08:00","status":"Requested"}]}',0);
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-00000000ca01',true),set_config('request.jwt.claims','{"email":"portal-qa-a@example.invalid"}',true);
do $$begin
 if (select count(*) from public.trips)<>1 then raise exception 'QA FAIL own trip';end if;
 if (select count(*) from public.bookings)<>1 then raise exception 'QA FAIL own activity';end if;
 update public.bookings set status='Confirmed';
 if found then raise exception 'QA FAIL customer changed booking';end if;
 begin
  insert into public.messages(user_id,"from",text) values(auth.uid(),'team','QA spoof');
  raise exception 'QA FAIL staff spoof allowed';
 exception when insufficient_privilege then null;end;
 insert into public.messages(user_id,"from",text) values(auth.uid(),'customer','QA rollback customer message');
 insert into public.customer_preferences(user_id,key,value) values(auth.uid(),'saved-ideas','[{"id":"qa","pax":2}]');
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-00000000ca02',true),set_config('request.jwt.claims','{"email":"portal-qa-b@example.invalid"}',true);
do $$begin
 if exists(select 1 from public.trips) or exists(select 1 from public.bookings) or exists(select 1 from public.messages) or exists(select 1 from public.customer_preferences) then raise exception 'QA FAIL cross-account leak';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
insert into public.messages(user_id,"from",text) values('10000000-0000-0000-0000-00000000ca01','team','QA rollback staff reply');
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-00000000ca01',true);
do $$begin if (select count(*) from public.messages)<>2 then raise exception 'QA FAIL reply visibility';end if;end $$;
rollback;
select 'PASS: live publish, own trip, blocked booking changes, blocked sender spoofing, saved preferences, cross-account isolation, and staff reply. All fixtures rolled back.' as customer_portal_verification;

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


-- Internal QA only. No external communications or real reservations. All fixtures roll back.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('50000000-0000-0000-0000-000000000001','conversation-c@example.invalid',now(),'{}'),
('50000000-0000-0000-0000-000000000002','conversation-o@example.invalid',now(),'{}'),
('50000000-0000-0000-0000-000000000003','conversation-other@example.invalid',now(),'{}');
insert into public.crm_customers(id,record) values('conversation-qa-rollback','{"name":"QA Guest","email":"conversation-c@example.invalid"}');
insert into public.operators(id,name,status) values('conversation-qa-rollback','QA Operator','active');
insert into public.operator_memberships(operator_id,user_id,role,status) values('conversation-qa-rollback','50000000-0000-0000-0000-000000000002','owner','active');
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
select public.publish_customer_trip('conversation-qa-rollback','{"request_id":"50000000-0000-0000-0000-000000000004","title":"QA rollback only","start_date":"2026-12-01","end_date":"2026-12-02","travelers":3,"status":"Planning","bookings":[{"id":"50000000-0000-0000-0000-000000000005","name":"QA rollback activity","operator_id":"conversation-qa-rollback","date":"2026-12-01","status":"Requested","meeting_point_name":"Guest gate","meeting_point_lat":10.42,"meeting_point_lng":-84.73,"meeting_instructions":"QA arrival instructions"}]}',0);
select public.send_operator_message('conversation-qa-rollback','QA team message','50000000-0000-0000-0000-000000000006');
select public.send_operator_message('conversation-qa-rollback','QA team message','50000000-0000-0000-0000-000000000006');
select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000002',true);
do $$ begin
 if (select count(*) from public.operator_messages where operator_id='conversation-qa-rollback')<>1 then raise exception 'FAIL conversation or retry';end if;
 if not exists(select 1 from public.operator_messages where operator_id='conversation-qa-rollback' and sender_role='team') then raise exception 'FAIL staff identity';end if;
 perform public.send_operator_message('conversation-qa-rollback','QA operator reply','50000000-0000-0000-0000-000000000007');
end $$;
select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000001',true);
do $$ begin
 if exists(select 1 from public.operator_messages where operator_id='conversation-qa-rollback') then raise exception 'FAIL customer conversation isolation';end if;
 if not exists(select 1 from public.bookings where id='50000000-0000-0000-0000-000000000005' and meeting_point_lat=10.42 and meeting_point_lng=-84.73 and meeting_instructions='QA arrival instructions') then raise exception 'FAIL customer meeting point';end if;
 begin
  perform public.send_operator_message('conversation-qa-rollback','forged','50000000-0000-0000-0000-000000000008');
  raise exception 'FAIL customer sent message';
 exception when others then if sqlerrm<>'Conversation access denied' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','50000000-0000-0000-0000-000000000003',true);
do $$ begin
 if exists(select 1 from public.operator_messages where operator_id='conversation-qa-rollback') then raise exception 'FAIL outsider conversation isolation';end if;
 if exists(select 1 from public.bookings where id='50000000-0000-0000-0000-000000000005') then raise exception 'FAIL outsider booking isolation';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.operator_messages where operator_id='conversation-qa-rollback' and sender_role='operator' and text='QA operator reply') then raise exception 'FAIL staff receives operator reply';end if;
end $$;
rollback;
select 'PASS: team/operator conversation, correct sender identity, duplicate retry prevention, private access, and customer meeting-point delivery. All QA fixtures rolled back.' as verification;

begin;
set local statement_timeout='20s';
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
do $$
declare c uuid=gen_random_uuid();o uuid=gen_random_uuid();t uuid=gen_random_uuid();b uuid=gen_random_uuid();aid uuid; oid text='qa-notify-'||gen_random_uuid(); before_count integer;begin
 insert into auth.users(id,email,email_confirmed_at) values(c,'qa-c-'||c||'@example.invalid',now()),(o,'qa-o-'||o||'@example.invalid',now());
 insert into operators(id,name,status) values(oid,'QA rollback only','active');
 insert into operator_memberships(operator_id,user_id,status,role) values(oid,o,'active','owner');
 insert into messages(user_id,"from",text) values(c,'customer','QA rollback customer message'),(c,'team','QA rollback staff reply');
 if not exists(select 1 from email_notifications where recipient_id=c and source_table='messages') then raise exception 'FAIL customer message notification';end if;
 insert into operator_messages(operator_id,sender_role,text) values(oid,'team','QA rollback operator message');
 if not exists(select 1 from email_notifications where recipient_id=o and source_table='operator_messages') then raise exception 'FAIL operator message notification';end if;
 insert into trips(id,user_id,title) values(t,c,'QA rollback trip');
 if not exists(select 1 from email_notifications where recipient_id=c and source_id=t::text) then raise exception 'FAIL trip notification';end if;
 insert into bookings(id,trip_id,user_id,operator_id,name,status) values(b,t,c,oid,'QA rollback activity','Requested');
 if (select count(*) from email_notifications where source_table='bookings' and source_id=b::text and recipient_id in(c,o))<>2 then raise exception 'FAIL booking recipients';end if;
 select count(*) into before_count from email_notifications where source_table='bookings' and source_id=b::text;
 update bookings set status='Requested' where id=b;
 if (select count(*) from email_notifications where source_table='bookings' and source_id=b::text)<>before_count then raise exception 'FAIL no-op duplicate';end if;
 alter table bookings disable trigger booking_response_deadline;
 update bookings set response_requested_at=now()-interval '13 hours' where id=b;
 alter table bookings enable trigger booking_response_deadline;
 perform queue_overdue_booking_emails(); perform queue_overdue_booking_emails();
 if (select count(*) from email_notifications where recipient_id=o and source_id=b::text and event_key like 'booking-overdue:%')<>1 then raise exception 'FAIL reminder deduplication';end if;
 update bookings set status='Confirmed' where id=b;
 if exists(select 1 from email_notifications n where n.source_id=b::text and n.event_key like 'booking-overdue:%' and portal_email_recipient_allowed(n)) then raise exception 'FAIL stale reminder allowed';end if;
 insert into operator_applications(user_id,email,company_name,status,agreement_signature,agreement_version,agreement_signer_name,agreement_legal_name) values(o,'qa-o-'||o||'@example.invalid','QA rollback','pending','data:image/png;base64,TEST','qa-noncontract','QA ONLY','QA ONLY');
 if not exists(select 1 from email_notifications where recipient_id=o and source_table='operator_applications') then raise exception 'FAIL application notification';end if;
 insert into operator_agreement_requests(operator_id,company_name,recipient_email,version,sections) values(oid,'QA ONLY - no contract','qa-o-'||o||'@example.invalid','qa-noncontract','[{"h":"QA only","p":"Synthetic test. No legal agreement."}]') returning id into aid;
 update operator_agreement_requests set signed_at=now(),signed_by=o where id=aid;
 if not exists(select 1 from email_notifications where recipient_id=o and source_id=aid::text) then raise exception 'FAIL signed receipt';end if;
 insert into public_inquiries(name,email,notes) values('QA rollback inquiry','qa-c-'||c||'@example.invalid','QA rollback') returning id into aid;
 if not exists(select 1 from email_notifications where source_table='public_inquiries' and source_id=aid::text) then raise exception 'FAIL staff inquiry alert';end if;
end $$;
rollback;
select 'PASS: live database generated customer/operator message, trip, booking, application, signed receipt and inquiry notifications; no-op suppression and 12-hour reminder deduplication passed. All synthetic data rolled back; no test event emails sent.' as verification;

select 'PASS: customer portal, operator booking handoff, meeting points, private conversations and notification generation checks completed; fixtures rolled back.' as connected_workflow_verification;