-- Internal read-receipt verification; all fixture records roll back.
begin;
insert into auth.users(id,email,email_confirmed_at) values('63000000-0000-0000-0000-000000000001','alert-qa-a@example.invalid',now()),('63000000-0000-0000-0000-000000000002','alert-qa-b@example.invalid',now());
select set_config('request.jwt.claim.sub','63000000-0000-0000-0000-000000000001',true);
set local role authenticated;
insert into public.notification_receipts(user_id,event_key) values(auth.uid(),'customer:qa-alert');
do $$ begin if (select count(*) from public.notification_receipts)<>1 then raise exception 'FAIL own receipt';end if;end $$;
select set_config('request.jwt.claim.sub','63000000-0000-0000-0000-000000000002',true);
do $$ begin
 if exists(select 1 from public.notification_receipts) then raise exception 'FAIL private receipts';end if;
 begin
 insert into public.notification_receipts(user_id,event_key) values('63000000-0000-0000-0000-000000000001','forged');
 raise exception 'FAIL forged receipt accepted';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
insert into public.trips(id,user_id,title) values('63000000-0000-0000-0000-000000000003','63000000-0000-0000-0000-000000000001','QA rollback');
insert into public.bookings(id,trip_id,user_id,name,status) values('63000000-0000-0000-0000-000000000004','63000000-0000-0000-0000-000000000003','63000000-0000-0000-0000-000000000001','QA rollback','Requested');
update public.bookings set status='Confirmed' where id='63000000-0000-0000-0000-000000000004';
update public.bookings set status='Confirmed' where id='63000000-0000-0000-0000-000000000004';
do $$ begin if not exists(select 1 from public.bookings where id='63000000-0000-0000-0000-000000000004' and notification_revision=2 and notification_updated_at is not null) then raise exception 'FAIL booking alert revision';end if;end $$;
rollback;
select 'PASS: own-account read receipts, cross-account isolation, forged receipt denial, booking change version and duplicate suppression. QA rolled back.' as alert_verification;
