import {hasSupabase,supabase,withTimeout} from '../portal/supabase.js';
import {notificationItems} from './model.js';
import {emailHealthAlerts} from './health.js';
async function rows(query){const {data,error}=await withTimeout(query,12000,'Portal alerts');if(error)throw error;return data||[];}
async function user(){if(!hasSupabase)throw new Error('Alerts require a connected portal account.');const {data,error}=await withTimeout(supabase.auth.getUser(),10000,'Alert account');if(error)throw error;if(!data.user)throw new Error('Sign in to your team or portal account to see alerts.');return data.user;}
export async function loadNotifications(scope,operatorId){
 const account=await user();let data={},healthAlerts=[];
 if(scope==='team'){
  const team=await rows(supabase.from('team_members').select('user_id').eq('user_id',account.id));if(!team.length)throw new Error('Connect your team account in Applications to see CRM alerts.');
  const [messages,operatorMessages,bookings,applications,inquiries,agreements]=await Promise.all([
   rows(supabase.from('messages').select('*').eq('from','customer').order('at',{ascending:false}).limit(50)),
   rows(supabase.from('operator_messages').select('*').eq('sender_role','operator').order('created_at',{ascending:false}).limit(50)),
   rows(supabase.from('bookings').select('*').order('notification_updated_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false}).limit(50)),
   rows(supabase.from('operator_applications').select('id,status,updated_at').eq('status','pending').order('updated_at',{ascending:false}).limit(50)),
   rows(supabase.from('public_inquiries').select('id,status,created_at').eq('status','new').order('created_at',{ascending:false}).limit(50)),
   rows(supabase.from('operator_agreement_requests').select('id,company_name,signed_at').order('signed_at',{ascending:false,nullsFirst:false}).limit(50))]);data={messages,operatorMessages,bookings,applications,inquiries,agreements};
  try {
   const {data:health,error}=await withTimeout(supabase.rpc('crm_email_health'),12000,'Email health');
   healthAlerts=emailHealthAlerts(error?null:health);
  } catch { healthAlerts=emailHealthAlerts(null); }
 }else if(scope==='customer'){
  const [messages,bookings,trips]=await Promise.all([
   rows(supabase.from('messages').select('*').eq('user_id',account.id).eq('from','team').order('at',{ascending:false}).limit(50)),
   rows(supabase.from('bookings').select('*').eq('user_id',account.id).order('notification_updated_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false}).limit(50)),
   rows(supabase.from('trips').select('id,title,status,portal_revision,created_at,notification_updated_at').eq('user_id',account.id).order('notification_updated_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false}).limit(50))]);data={messages,bookings,trips};
 }else if(scope==='operator'&&operatorId){
  const [operatorMessages,bookings]=await Promise.all([
   rows(supabase.from('operator_messages').select('*').eq('operator_id',operatorId).eq('sender_role','team').order('created_at',{ascending:false}).limit(50)),
   rows(supabase.from('bookings').select('*').eq('operator_id',operatorId).order('notification_updated_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false}).limit(50))]);data={operatorMessages,bookings};
 }else throw new Error('Choose a connected operator account to see alerts.');
 const items=notificationItems(scope,data);
 const receipts=items.length?await rows(supabase.from('notification_receipts').select('event_key').eq('user_id',account.id).in('event_key',items.map(x=>x.key))):[];
 const read=new Set(receipts.map(x=>x.event_key));return {userId:account.id,items:[...healthAlerts,...items.map(x=>({...x,read:read.has(x.key)}))].slice(0,100)};
}
export async function markNotificationsRead(userId,keys){
 const account=await user();if(account.id!==userId)throw new Error('Your account changed. Refresh alerts before continuing.');
 if(!keys.length)return;
 await rows(supabase.from('notification_receipts').upsert([...new Set(keys)].map(event_key=>({user_id:userId,event_key})),{onConflict:'user_id,event_key'}).select('event_key'));
}
