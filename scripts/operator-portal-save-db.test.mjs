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


const user='65000000-0000-0000-0000-000000000001';await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'save@example.test',now())",[user]);await db.exec("insert into operators(id,name,status) values('qa','QA','active');insert into operator_portal_state(operator_id,state,updated_at) values('qa','{}','2026-11-14T12:00:00Z');");await db.query("insert into operator_memberships(operator_id,user_id,role,status) values('qa',$1,'owner','active')",[user]);
await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
const first=await db.query("update operator_portal_state set state=$1,updated_at='2026-11-14T12:00:01Z' where operator_id='qa' and updated_at='2026-11-14T12:00:00Z' returning updated_at",[{profile:{name:'First session'}}]);assert.equal(first.rows.length,1);
const stale=await db.query("update operator_portal_state set state=$1,updated_at='2026-11-14T12:00:02Z' where operator_id='qa' and updated_at='2026-11-14T12:00:00Z' returning updated_at",[{profile:{name:'Stale session'}}]);assert.equal(stale.rows.length,0);assert.equal((await db.query('select state from operator_portal_state')).rows[0].state.profile.name,'First session');await db.exec('reset role');await db.close();console.log('PASS: first operator edit saves; stale second-session edit cannot overwrite it.');
