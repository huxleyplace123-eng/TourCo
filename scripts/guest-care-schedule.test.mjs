import {AGREEMENT_SECTIONS,AGREEMENT_VERSION} from '../src/agreements/terms.js';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const db=new PGlite();
await db.exec(`create role authenticated;create role anon;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;grant usage on schema auth to authenticated;`);
await db.exec(await readFile('supabase/schema.sql','utf8'));
await db.exec(`create table public.team_members(user_id uuid primary key,role text);create function public.is_team_member() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from team_members where user_id=auth.uid())$$;create table public.crm_customers(id text primary key,record jsonb);create policy "team manages trips" on trips for all using(is_team_member()) with check(is_team_member());create policy "team manages bookings" on bookings for all using(is_team_member()) with check(is_team_member());create policy "team manages messages" on messages for all using(is_team_member()) with check(is_team_member());grant select,insert,update,delete on profiles,trips,bookings,messages to authenticated;`);
await db.exec(await readFile('supabase/customer_portal_permissions.sql','utf8'));
await db.exec(await readFile('supabase/customer_portal_integration.sql','utf8'));

await db.exec((await readFile('supabase/operator_portal.sql','utf8')).replace('create extension if not exists pgcrypto;',''));
await db.exec(await readFile('supabase/operator_booking_handoff.sql','utf8'));
await db.exec(await readFile('supabase/operator_booking_handoff.sql','utf8'));

await db.exec('grant select,insert,update on operators,operator_memberships,operator_portal_state to authenticated;');


await db.exec(await readFile('supabase/operator_invitation_acceptance.sql','utf8'));await db.exec(await readFile('supabase/operator_onboarding_completion.sql','utf8'));await db.exec(await readFile('supabase/operator_onboarding_completion.sql','utf8'));
await db.exec('grant select,insert,update on operator_applications to authenticated');

await db.exec(await readFile('supabase/operator_agreements.sql','utf8'));
await db.exec(await readFile('supabase/operator_agreements.sql','utf8'));
await db.exec(await readFile('supabase/operator_conversations_meeting_points.sql','utf8'));
await db.exec(await readFile('supabase/portal_notifications.sql','utf8'));
await db.exec('create role service_role;');
await db.exec(await readFile('supabase/transactional_notifications.sql','utf8'));
await db.exec(await readFile('supabase/transactional_notifications.sql','utf8'));

await db.exec(await readFile('supabase/guest_care_schedule.sql','utf8'));
await db.exec(await readFile('supabase/guest_care_schedule.sql','utf8'));
await db.exec(await readFile('supabase/guest_care_review_guard.sql','utf8'));
const staff='77000000-0000-0000-0000-000000000001',customer='77000000-0000-0000-0000-000000000002',trip='77000000-0000-0000-0000-000000000003',booking='77000000-0000-0000-0000-000000000004',schedule='77000000-0000-0000-0000-000000000005';
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'staff@example.test',now()),($2,'customer@example.test',now())",[staff,customer]);
await db.query("insert into team_members values($1,'manager')",[staff]);
await db.query("insert into trips(id,user_id,title,status) values($1,$2,'QA trip','Confirmed')",[trip,customer]);
await db.exec("insert into operators(id,name,status) values('care-test','QA operator','active')");
await db.query("insert into bookings(id,trip_id,user_id,name,status,date,time,operator_id,bring,meeting_point_lat,meeting_point_lng,meeting_instructions) values($1,$2,$3,'QA activity','Confirmed',current_date+5,'09:00','care-test','Water',10,-84,'Arrive at reception')",[booking,trip,customer]);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[customer]);
await db.exec('set role authenticated');
assert.equal((await db.query('select * from guest_care_schedule')).rows.length,0);
await assert.rejects(()=>db.query("select save_guest_care_schedule($1,$2,'preparation','QA message body',now()+interval '1 hour',null)",[schedule,booking]),/Team access|permission denied/);
await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
await assert.rejects(()=>db.query("select save_reviewed_guest_care_schedule($1,$2,'preparation','QA stale message',now()+interval '1 hour',999,null)",[schedule,booking]),/Booking details changed/);
await db.exec('set role authenticated');await assert.rejects(()=>db.query("select save_guest_care_schedule($1,$2,'preparation','QA message body',now()+interval '1 hour',null)",[schedule,booking]),/permission denied/);await db.exec('reset role');
let row=(await db.query("select * from save_reviewed_guest_care_schedule($1,$2,'preparation','QA message body',now()+interval '1 hour',1,null)",[schedule,booking])).rows[0];
await assert.rejects(()=>db.query("select save_guest_care_schedule($1,$2,'preparation','Duplicate without version',now()+interval '1 hour',null)",[schedule,booking]),/Schedule changed/);
await db.exec("update guest_care_schedule set send_at=now()-interval '1 minute';select dispatch_guest_care_schedule();");
assert.equal((await db.query("select count(*)::int n from messages where id=$1",[schedule])).rows[0].n,0,'off mode does not send');
await db.exec("update email_notification_settings set mode='live';select dispatch_guest_care_schedule();select dispatch_guest_care_schedule();");
assert.equal((await db.query("select count(*)::int n from messages where id=$1",[schedule])).rows[0].n,1,'retry inserts only one message');
assert.equal((await db.query("select count(*)::int n from email_notifications where source_id=$1",[schedule])).rows[0].n,1,'one customer notification');
assert.equal((await db.query("select subject from email_notifications where source_id=$1",[schedule])).rows[0].subject,'Your TicoWild activity preparation is ready');
await db.exec("update guest_care_schedule set state='scheduled';update bookings set bring='Changed packing note';select dispatch_guest_care_schedule();");
assert.equal((await db.query('select state from guest_care_schedule')).rows[0].state,'needs_review');
await db.exec("update guest_care_schedule set state='scheduled';update trips set status='Cancelled';select dispatch_guest_care_schedule();");
assert.equal((await db.query('select state from guest_care_schedule')).rows[0].state,'cancelled');
await db.exec("update trips set status='Confirmed'");
await assert.rejects(()=>db.query("select save_guest_care_schedule(gen_random_uuid(),$1,'feedback','Please share feedback',now()+interval '1 hour',null)",[booking]),/completed/);
await db.exec("update bookings set status='Completed'");
const feedback=(await db.query("select * from save_guest_care_schedule(gen_random_uuid(),$1,'feedback','Please share feedback',now()+interval '1 hour',null)",[booking])).rows[0];
await db.query('select cancel_guest_care_schedule($1,$2)',[feedback.id,feedback.updated_at]);
await db.exec("update guest_care_schedule set send_at=now()-interval '1 minute';select dispatch_guest_care_schedule();");
assert.equal((await db.query('select state from guest_care_schedule where id=$1',[feedback.id])).rows[0].state,'cancelled');
await db.close();console.log('PASS: scheduled message authorization, idempotency, off mode, booking revisions, cancellations, completed-only feedback and cancellation.');
