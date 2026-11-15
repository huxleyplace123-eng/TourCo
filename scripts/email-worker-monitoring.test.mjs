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

await db.exec(await readFile('supabase/email_worker_monitoring.sql','utf8'));await db.exec(await readFile('supabase/email_worker_monitoring.sql','utf8'));
const staff=crypto.randomUUID(),guest=crypto.randomUUID();
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'monitor-staff@example.test',now()),($2,'monitor-guest@example.test',now())",[staff,guest]);await db.query("insert into team_members values($1,'manager')",[staff]);
assert.equal((await db.query('select last_worker_check_at from email_notification_settings')).rows[0].last_worker_check_at,null);
await db.exec("update email_notification_settings set mode='live';select * from claim_portal_emails(5)");
assert.ok((await db.query('select last_worker_check_at from email_notification_settings')).rows[0].last_worker_check_at);
await db.exec('set role anon');await assert.rejects(db.query('select crm_email_health()'),/permission denied/);await db.exec('reset role;set role authenticated');
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[guest]);await assert.rejects(db.query('select crm_email_health()'),/Team access required/);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);const health=(await db.query('select crm_email_health() h')).rows[0].h;assert.ok(health.checked_at);assert.ok(health.last_worker_check_at);assert.equal(health.pending,0);
await assert.rejects(db.query('select * from claim_portal_emails(5)'),/permission denied/);
await db.close();console.log('PASS: monitoring migration idempotence, idle worker heartbeat, staff-only health, guest/anonymous denial and protected dispatch.');
