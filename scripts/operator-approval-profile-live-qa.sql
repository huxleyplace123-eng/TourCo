-- Internal QA only. No lasting accounts, agreements, bookings or outgoing emails.
begin;
do $$
declare owner_id uuid:=gen_random_uuid(); staff_id uuid; application_id uuid; qa_operator_id text:='qa-profile-'||gen_random_uuid()::text; approved_id text; snapshot jsonb;
begin
 select user_id into staff_id from public.team_members limit 1;
 if staff_id is null then raise exception 'QA requires an existing team member';end if;
 insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values(owner_id,owner_id::text||'@example.invalid',now(),'{}');
 perform set_config('request.jwt.claim.sub',staff_id::text,true);
 perform public.invite_operator(qa_operator_id,'QA profile rollback',owner_id::text||'@example.invalid','owner');
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 perform public.accept_operator_invitation();
 select id into application_id from public.operator_applications where user_id=owner_id;
 update public.operator_applications set phone='+12025550100',categories=ARRAY['Adventure'],status='pending',agreement_version='qa-rollback-only',agreement_signer_name='QA TEST ONLY',agreement_legal_name='QA profile rollback',agreement_signer_title='QA',agreement_accepted_at=now(),agreement_signature='data:image/png;base64,QUFB',meeting_point_lat=10.42,meeting_point_lng=-84.73 where id=application_id;
 update public.operator_portal_state set state='{"profile":{"customField":"keep"},"tours":[{"id":"keep-tour"}]}' where operator_portal_state.operator_id=qa_operator_id;
 perform set_config('request.jwt.claim.sub',staff_id::text,true);
 approved_id:=public.approve_operator_application(application_id);
 if not exists(select 1 from public.operators where id=approved_id and phone='+12025550100' and categories=ARRAY['Adventure']) then raise exception 'FAIL reviewed operator details';end if;
 select state into snapshot from public.operator_portal_state where operator_portal_state.operator_id=approved_id;
 if snapshot->'profile'->>'phone'<>'+12025550100' or snapshot->'profile'->>'customField'<>'keep' or snapshot->'tours'->0->>'id'<>'keep-tour' then raise exception 'FAIL portal synchronization/preservation';end if;
end $$;
rollback;
select 'PASS: reviewed contact/category fields and portal profile synchronized; existing profile fields and tours preserved; all QA data rolled back.' as approval_profile_verification;
