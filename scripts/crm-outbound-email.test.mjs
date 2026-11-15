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

await db.exec(await readFile('supabase/crm_outbound_email.sql','utf8'));
await db.exec(await readFile('supabase/crm_outbound_email.sql','utf8'));
const staff='77000000-0000-0000-0000-000000000001',customer='77000000-0000-0000-0000-000000000002';
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'staff@example.test',now()),($2,'customer@example.test',now())",[staff,customer]);
await db.query("insert into team_members values($1,'manager')",[staff]);
await db.exec("update email_notification_settings set mode='live'");
const send=(key,to='outside@example.test',subject='QA test',body='Plain text',aid=null)=>db.query('select queue_crm_email($1,$2,$3,$4,$5) id',[key,to,subject,body,aid]);
const key='77000000-0000-0000-0000-000000000010';
await db.exec('set role anon');await assert.rejects(send(key),/permission denied/);await db.exec('reset role');
await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[customer]);await assert.rejects(send(key),/Verified team access/);assert.equal((await db.query('select * from crm_outbound')).rows.length,0);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
const q=(await send(key)).rows[0].id;assert.equal((await send(key)).rows[0].id,q);
await assert.rejects(send(key,'other@example.test'),/different content/);
await assert.rejects(send('77000000-0000-0000-0000-000000000011','one@example.test,two@example.test'),/valid recipient/);
await assert.rejects(send('77000000-0000-0000-0000-000000000011','one@example.test',null),/valid recipient/);
await assert.rejects(db.query("update crm_outbound set body_text='tampered'"),/permission denied/);
await db.exec('reset role');
let claim=(await db.query('select * from claim_portal_emails(5)')).rows;assert.equal(claim.length,1);assert.equal(claim[0].recipient_email,'outside@example.test');assert.equal(claim[0].body_text,'Plain text');
const {notificationMessage}=await import('../supabase/functions/portal-email/handler.js');assert.equal(notificationMessage(claim[0]).text,'Plain text');assert.deepEqual(notificationMessage(claim[0]).to,['outside@example.test']);
await db.query('select finish_portal_email($1,$2,$3)',[q,claim[0].lease_id,'crm-provider']);
await db.query("select record_portal_email_delivery('crm-event','crm-provider','email.delivered',now())");assert.equal((await db.query('select state from email_notifications where id=$1',[q])).rows[0].state,'delivered');
const aid='77000000-0000-0000-0000-000000000020';
await db.query("insert into operator_agreement_requests(id,operator_id,company_name,recipient_email,version,sections) values($1,'qa','QA operator','outside@example.test','qa','[]')",[aid]);
await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
await assert.rejects(send('77000000-0000-0000-0000-000000000012','outside@example.test','Agreement','Missing link',aid),/secure agreement link/);
const aq=(await send('77000000-0000-0000-0000-000000000012','outside@example.test','Agreement','Open https://ticowild.com/partners/?agreement='+aid,aid)).rows[0].id;
await db.exec('reset role');claim=(await db.query('select * from claim_portal_emails(5)')).rows;assert.equal(claim.length,1);
await db.query('select finish_portal_email($1,$2,$3)',[aq,claim[0].lease_id,'agreement-provider']);await db.query("select record_portal_email_delivery('agreement-event','agreement-provider','email.delivered',now())");
assert.deepEqual((await db.query('select events from operator_agreement_requests where id=$1',[aid])).rows[0].events.map(e=>e.kind),['email_queued','email_accepted','email_delivered']);
await db.exec('set role authenticated');await send('77000000-0000-0000-0000-000000000013');await db.exec('reset role');await db.query('delete from team_members where user_id=$1',[staff]);
assert.equal((await db.query('select * from claim_portal_emails(5)')).rows.length,0);assert.equal((await db.query("select state from email_notifications where source_id='77000000-0000-0000-0000-000000000013'")).rows[0].state,'suppressed');
await db.close();console.log('CRM outbound tests passed: staff authorization, immutable content, idempotency, external recipients, agreement links, delivery events, and revoked access.');

