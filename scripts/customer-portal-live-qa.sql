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
