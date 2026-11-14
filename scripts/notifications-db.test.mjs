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

await db.exec(await readFile('supabase/portal_notifications.sql','utf8'));await db.exec(await readFile('supabase/portal_notifications.sql','utf8'));
const first='62000000-0000-0000-0000-000000000001',second='62000000-0000-0000-0000-000000000002';
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'alerts-a@example.test',now()),($2,'alerts-b@example.test',now())",[first,second]);
async function as(id,fn){await db.exec('begin;set local role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);try{const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}
await as(first,()=>db.query("insert into notification_receipts(user_id,event_key) values($1,'customer:message:test')",[first]));
await as(first,async()=>assert.equal((await db.query('select * from notification_receipts')).rows.length,1));
await as(second,async()=>assert.equal((await db.query('select * from notification_receipts')).rows.length,0));
await assert.rejects(as(second,()=>db.query("insert into notification_receipts(user_id,event_key) values($1,'forged')",[first])),/row-level security/);
await as(second,async()=>assert.equal((await db.query("update notification_receipts set read_at=now() returning *")).rows.length,0));
await assert.rejects(as(first,()=>db.query('update notification_receipts set user_id=$1',[second])),/row-level security/);
await db.query("insert into trips(id,user_id,title) values('62000000-0000-0000-0000-000000000003',$1,'QA')",[first]);
await db.query("insert into bookings(id,trip_id,user_id,name,status) values('62000000-0000-0000-0000-000000000004','62000000-0000-0000-0000-000000000003',$1,'QA','Requested')",[first]);
const booking=async()=>(await db.query('select * from bookings')).rows[0];
assert.equal(Number((await booking()).notification_revision),1);
await db.exec("update bookings set status='Confirmed' where id='62000000-0000-0000-0000-000000000004'");assert.equal(Number((await booking()).notification_revision),2);assert.ok((await booking()).notification_updated_at);
await db.exec("update bookings set status='Confirmed' where id='62000000-0000-0000-0000-000000000004'");assert.equal(Number((await booking()).notification_revision),2);
await db.exec("update bookings set status='Requested' where id='62000000-0000-0000-0000-000000000004'");assert.equal(Number((await booking()).notification_revision),3);
await db.exec('set role anon');await assert.rejects(db.query('select * from notification_receipts'),/permission denied/);await db.exec('reset role');
await db.close();console.log('PASS: account-private cross-device read receipts, forged recipient denial, anonymous denial, new booking revisions and duplicate-save suppression.');
