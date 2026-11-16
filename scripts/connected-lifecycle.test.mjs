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
await db.exec(await readFile('supabase/operator_approval_profile_sync.sql','utf8'));
await db.exec(await readFile('supabase/operator_approval_profile_sync.sql','utf8'));
// Exercise the deployed migration combination, not just the original workflow.
for (const migration of ['crm_outbound_email.sql','booking_reminder_current_request.sql','email_worker_monitoring.sql']) {
 await db.exec(await readFile('supabase/'+migration,'utf8'));
}
const staff=crypto.randomUUID(),op=crypto.randomUUID(),customer=crypto.randomUUID();
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'staff@example.test',now()),($2,'operator@example.test',now()),($3,'customer@example.test',now())",[staff,op,customer]);
await db.query("insert into team_members values($1,'admin')",[staff]);
await db.exec("update email_notification_settings set mode='live';insert into crm_customers(id,record) values('lifecycle-customer','{\"name\":\"QA Guest\",\"email\":\"customer@example.test\"}');");
async function as(id,fn){await db.exec('begin;set local role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);try{const r=await fn();await db.exec('commit');return r;}catch(e){await db.exec('rollback');throw e;}}
await as(staff,()=>db.query("select invite_operator('lifecycle-operator','QA Company','operator@example.test','owner')"));
assert.equal((await as(op,()=>db.query('select accept_operator_invitation() id'))).rows[0].id,'lifecycle-operator');
const app=(await as(op,()=>db.query('select * from operator_applications'))).rows[0];
await as(op,()=>db.query("update operator_portal_state set state='{\"profile\":{\"customField\":\"keep\"},\"tours\":[{\"id\":\"keep-tour\"}]}' where operator_id='lifecycle-operator'"));
const agreementId=(await as(staff,()=>db.query("select prepare_operator_agreement('lifecycle-operator','QA Company','operator@example.test',$1,$2) id",[AGREEMENT_VERSION,JSON.stringify(AGREEMENT_SECTIONS)]))).rows[0].id;
await as(op,()=>db.query('select open_operator_agreement($1)',[agreementId]));
const signed=(await as(op,()=>db.query('select (sign_operator_agreement($1,$2)).*',[agreementId,{legalName:'QA Company',signerName:'QA Owner',title:'Owner',signature:'data:image/png;base64,QUFB'}]))).rows[0];
await as(op,()=>db.query("update operator_applications set contact_name='QA Owner',phone='+12025550100',categories=ARRAY['Adventure'],regions=ARRAY['Central Pacific'],description='QA test business',meeting_point_name='QA gate',meeting_point_lat=10.42,meeting_point_lng=-84.73,meeting_instructions='QA arrival',status='pending',agreement_version=$2,agreement_accepted_at=$3,agreement_signature=$4,agreement_legal_name=$5,agreement_signer_name=$6,agreement_signer_title=$7 where id=$1",[app.id,signed.version,signed.signed_at,signed.signed_data.signature,signed.signed_data.legalName,signed.signed_data.signerName,signed.signed_data.title]));
assert.equal((await as(staff,()=>db.query('select approve_operator_application($1) id',[app.id]))).rows[0].id,'lifecycle-operator');
const approvedProfile=(await as(op,()=>db.query("select * from operators where id='lifecycle-operator'"))).rows[0];
assert.equal(approvedProfile.phone,'+12025550100','approval must carry reviewed application contact details into the operator record');
assert.deepEqual(approvedProfile.categories,['Adventure']);
const approvedState=(await as(op,()=>db.query("select state from operator_portal_state where operator_id='lifecycle-operator'"))).rows[0].state;
assert.equal(approvedState.profile.phone,'+12025550100');
assert.equal(approvedState.profile.customField,'keep');
assert.equal(approvedState.tours[0].id,'keep-tour');
await as(op,()=>db.query("update operator_portal_state set state=jsonb_set(state,'{profile,phone}','\"+12025550199\"') where operator_id='lifecycle-operator'"));
await as(staff,()=>db.query('select approve_operator_application($1)',[app.id]));
assert.equal((await as(op,()=>db.query("select state->'profile'->>'phone' phone from operator_portal_state where operator_id='lifecycle-operator'"))).rows[0].phone,'+12025550199','repeated approval must not overwrite newer operator edits');
const bookingId=crypto.randomUUID();
await as(staff,()=>db.query('select publish_customer_trip($1,$2,0)',['lifecycle-customer',{request_id:crypto.randomUUID(),title:'QA connected trip',travelers:2,start_date:'2026-12-01',end_date:'2026-12-02',status:'Planning',bookings:[{id:bookingId,name:'QA activity',date:'2026-12-01',status:'Requested',operator_id:'lifecycle-operator',meeting_point_name:'QA gate',meeting_point_lat:10.42,meeting_point_lng:-84.73,meeting_instructions:'QA arrival'}]}]));
await as(op,()=>db.query('select respond_operator_booking($1,$2)',[bookingId,'accepted']));
const booking=(await as(customer,()=>db.query('select * from bookings where id=$1',[bookingId]))).rows[0];
assert.equal(booking.status,'Confirmed');assert.equal(booking.meeting_point_name,'QA gate');
await as(staff,()=>db.query("select send_operator_message('lifecycle-operator','QA team message',$1)",[crypto.randomUUID()]));
await as(op,()=>db.query("select send_operator_message('lifecycle-operator','QA reply',$1)",[crypto.randomUUID()]));
assert.equal((await as(customer,()=>db.query('select * from operator_messages'))).rows.length,0);
assert.equal((await as(op,()=>db.query('select * from operator_messages'))).rows.length,2);
const queued=(await db.query('select count(*)::int n from email_notifications')).rows[0].n;assert.ok(queued>=5);
console.log('PASS: one connected isolated lifecycle: invite, verified acceptance, agreement signing, application submission, staff approval, CRM booking, operator acceptance, customer confirmation/meeting point, private two-way conversation and notification generation. Queued events: '+queued+'. No external emails or production records.');
// Positive controls for a second populated customer and operator, not merely an
// empty outsider account. Both directions must deny cross-account access.
const customer2=crypto.randomUUID(),op2=crypto.randomUUID(),booking2=crypto.randomUUID();
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'customer2@example.test',now()),($2,'operator2@example.test',now())",[customer2,op2]);
await db.query("insert into crm_customers values('customer-two',$1)",[{email:'customer2@example.test',name:'Second sample customer'}]);
await db.exec("insert into operators(id,name,status) values('operator-two','Second sample operator','active')");
await db.query("insert into operator_memberships(operator_id,user_id,role,status) values('operator-two',$1,'owner','active')",[op2]);
await as(staff,()=>db.query('select publish_customer_trip($1,$2,0)',['customer-two',{request_id:crypto.randomUUID(),title:'Second isolated trip',travelers:1,start_date:'2026-12-01',end_date:'2026-12-02',status:'Planning',bookings:[{id:booking2,name:'Second activity',date:'2026-12-01',status:'Requested',operator_id:'operator-two'}]}]));
for(const [id,own,other] of [[customer,bookingId,booking2],[customer2,booking2,bookingId],[op,bookingId,booking2],[op2,booking2,bookingId]]){
  const rows=(await as(id,()=>db.query('select id from bookings'))).rows;
  assert.ok(rows.some(r=>r.id===own));assert.ok(!rows.some(r=>r.id===other));
}
await assert.rejects(as(op,()=>db.query("select respond_operator_booking($1,'accepted')",[booking2])),/access denied/);
await assert.rejects(as(op2,()=>db.query("select respond_operator_booking($1,'accepted')",[bookingId])),/access denied/);
await as(op2,()=>db.query("select respond_operator_booking($1,'declined')",[booking2]));
assert.equal((await as(customer2,()=>db.query('select status from bookings where id=$1',[booking2]))).rows[0].status,'Declined');
assert.equal((await as(customer,()=>db.query('select status from bookings where id=$1',[bookingId]))).rows[0].status,'Confirmed');
console.log('PASS: two populated customers and two populated operators; bidirectional isolation, forbidden responses, and decline propagation without changing the other booking.');
await db.close();
