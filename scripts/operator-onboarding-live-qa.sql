begin;
insert into auth.users(id,email,email_confirmed_at) values('64000000-0000-0000-0000-00000000ab01','onboard-qa@example.invalid',now());
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
select public.invite_operator('onboard-qa-rollback','QA rollback operator','onboard-qa@example.invalid','owner');
select set_config('request.jwt.claim.sub','64000000-0000-0000-0000-00000000ab01',true);
select public.accept_operator_invitation();
do $$ begin
 if not exists(select 1 from public.operator_applications where user_id=auth.uid() and company_name='QA rollback operator' and status='draft') then raise exception 'FAIL invited application';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.team_members limit 1),true);
set local role authenticated;
update public.operator_applications set status='pending',agreement_accepted_at=now(),agreement_signature='data:image/png;base64,QA',meeting_point_lat=10,meeting_point_lng=-84 where user_id='64000000-0000-0000-0000-00000000ab01';
do $$ declare appid uuid; begin
 select id into appid from public.operator_applications where user_id='64000000-0000-0000-0000-00000000ab01';
 if public.approve_operator_application(appid) <> 'onboard-qa-rollback' then raise exception 'FAIL operator identity';end if;
 if public.approve_operator_application(appid) <> 'onboard-qa-rollback' then raise exception 'FAIL approval retry';end if;
 if (select count(*) from public.operator_memberships where user_id='64000000-0000-0000-0000-00000000ab01')<>1 then raise exception 'FAIL duplicate operator';end if;
 if not exists(select 1 from public.operators where id='onboard-qa-rollback' and status='active') then raise exception 'FAIL activated company';end if;
end $$;
rollback;
select 'PASS: invited verified owner receives onboarding, approval preserves the existing company, retry creates no duplicate. All fixtures rolled back.' as onboarding_verification;
