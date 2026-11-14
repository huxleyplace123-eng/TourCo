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
const staff='65000000-0000-0000-0000-000000000001',op='65000000-0000-0000-0000-000000000002',other='65000000-0000-0000-0000-000000000003';
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'staff@example.test',now()),($2,'operator@example.test',now()),($3,'other@example.test',now())",[staff,op,other]);await db.query("insert into team_members values($1,'admin')",[staff]);
async function as(id,fn){await db.exec('begin;set local role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);try{const r=await fn();await db.exec('commit');return r;}catch(e){await db.exec('rollback');throw e;}}
const prepare=()=>as(staff,()=>db.query("select prepare_operator_agreement('agreement-qa','QA Company','operator@example.test','v1','[{\"h\":\"Terms\",\"p\":\"Preserved terms\"}]') id"));
const id=(await prepare()).rows[0].id;assert.equal((await prepare()).rows[0].id,id);
assert.equal((await as(other,()=>db.query('select * from operator_agreement_requests'))).rows.length,0);
await assert.rejects(as(other,()=>db.query('select open_operator_agreement($1)',[id])),/verified email/);
await as(op,()=>db.query('select open_operator_agreement($1)',[id]));
await assert.rejects(as(op,()=>db.query('update operator_agreement_requests set signed_at=now() where id=$1',[id])),/permission denied/);
await assert.rejects(as(op,()=>db.query("select record_agreement_event($1,'email_accepted')",[id])),/Team access/);
await as(staff,()=>db.query("select record_agreement_event($1,'whatsapp_opened')",[id]));
await assert.rejects(as(op,()=>db.query("select sign_operator_agreement($1,'{}')",[id])),/signature required/);
const details={legalName:'QA Company',signerName:'QA Owner',title:'Owner',signature:'data:image/png;base64,QUFB',email:'forged@example.test',acceptedAt:'2000-01-01'};
const signed=(await as(op,()=>db.query('select (sign_operator_agreement($1,$2)).*',[id,details]))).rows[0];assert.equal(signed.signed_data.email,'operator@example.test');assert.notEqual(signed.signed_data.acceptedAt,'2000-01-01');
const again=(await as(op,()=>db.query('select (sign_operator_agreement($1,$2)).*',[id,{...details,signerName:'Changed'}]))).rows[0];assert.equal(again.signed_data.signerName,'QA Owner');
await assert.rejects(as(other,()=>db.query('select sign_operator_agreement($1,$2)',[id,details])),/verified recipient/);
await db.exec("update operator_agreement_requests set signed_at=null,signed_data=null,expires_at=now()-interval '1 day'");await assert.rejects(as(op,()=>db.query('select sign_operator_agreement($1,$2)',[id,details])),/expired/);
console.log('PASS: recipient-only access, forged updates denied, server timestamp and email, immutable repeat signature, expiry, idempotent preparation and truthful channel events.');await db.close();
