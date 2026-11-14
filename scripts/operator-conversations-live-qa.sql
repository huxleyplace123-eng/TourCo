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
