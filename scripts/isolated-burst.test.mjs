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

// Bounded isolated burst: synthetic identities only; never contacts production.
await db.exec(await readFile('supabase/booking_reminder_current_request.sql','utf8'));
await db.exec(await readFile('supabase/booking_reminder_current_request.sql','utf8'));
const start=performance.now(), ids=Array.from({length:100},()=>crypto.randomUUID());
for(let i=0;i<ids.length;i++){
 await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())',[ids[i],'burst-'+i+'@example.test']);
 await db.query("insert into trips(user_id,title) select $1,'Synthetic isolated trip '||g from generate_series(1,10) g",[ids[i]]);
}
await db.exec("update email_notification_settings set mode='live',daily_budget=40");
for(const id of ids) await db.query(`insert into messages(user_id,"from",text) values($1,'team','Synthetic isolated notification')`,[id]);
const results=await Promise.all(ids.map(id=>db.exec(`begin;set local role authenticated;select set_config('request.jwt.claim.sub','${id}',true);select count(*)::int n from trips;commit;`)));
for(const result of results) assert.equal(result[3].rows[0].n,10,'each customer sees only their own ten trips');
const claims=await Promise.all(Array.from({length:20},()=>db.query('select id from claim_portal_emails(10)')));
const claimed=claims.flatMap(r=>r.rows.map(x=>x.id));assert.equal(claimed.length,40);assert.equal(new Set(claimed).size,40);
assert.equal((await db.query("select count(*)::int n from email_notifications where state='pending'")).rows[0].n,60);
console.log(JSON.stringify({result:'PASS',customers:100,trips:1000,readRequests:100,claimRequests:20,claimed:40,duplicateClaims:0,pending:60,elapsedMs:Math.round(performance.now()-start),scope:'Isolated PGlite burst and access-control test; not production capacity or network load'},null,2));
await db.close();
