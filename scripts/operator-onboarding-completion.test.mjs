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
const staff='64000000-0000-0000-0000-000000000001',operator='64000000-0000-0000-0000-000000000002';
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'staff@example.test',now()),($2,'operator@example.test',now())",[staff,operator]);await db.query("insert into team_members values($1,'admin')",[staff]);
async function as(id,fn){await db.exec('begin;set local role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);try{const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}
await as(staff,()=>db.query("select invite_operator('crm-existing','Existing CRM company','operator@example.test','owner')"));
await as(operator,()=>db.query('select accept_operator_invitation()'));
const app=(await db.query('select * from operator_applications where user_id=$1',[operator])).rows[0];assert.ok(app);assert.equal(app.company_name,'Existing CRM company');
const approve=()=>as(staff,()=>db.query('select approve_operator_application($1) as id',[app.id]));
await assert.rejects(approve(),/submit/);
await as(staff,()=>db.query("update operator_applications set status='pending',agreement_accepted_at=now(),agreement_signature=null where id=$1",[app.id]));await assert.rejects(approve(),/Signed operator agreement/);
await as(staff,()=>db.query("update operator_applications set agreement_signature='data:image/png;base64,QA',meeting_point_lat=100,meeting_point_lng=0 where id=$1",[app.id]));await assert.rejects(approve(),/Exact guest meeting point/);
await as(staff,()=>db.query("update operator_applications set meeting_point_lat=10,meeting_point_lng=-84 where id=$1",[app.id]));
assert.equal((await approve()).rows[0].id,'crm-existing');assert.equal((await approve()).rows[0].id,'crm-existing');
assert.equal((await db.query('select count(*)::int n from operators')).rows[0].n,1);assert.equal((await db.query('select count(*)::int n from operator_memberships')).rows[0].n,1);assert.equal((await db.query("select status from operators where id='crm-existing'")).rows[0].status,'active');
await assert.rejects(as(operator,()=>db.query('select approve_operator_application($1)',[app.id])),/Not authorized/);
console.log('PASS: invited verified owner receives application, draft/missing signature/invalid pin cannot approve, approval reuses CRM identity, retry creates no duplicate and operators cannot self-approve.');await db.close();
