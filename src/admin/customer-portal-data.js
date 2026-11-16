import { supabase, withTimeout } from '../portal/supabase.js';
import { getTeamAccess } from './applications-data.js';
import {deliverCustomerMessage} from '../portal/message-delivery.js';
export async function requirePortalTeam() {
  const access=await getTeamAccess();
  if (!access.member) throw new Error('Sign in with an authorized TicoWild team account to manage customer trips and messages.');
  return access;
}
async function result(query,label) { const {data,error}=await withTimeout(query,15000,label); if(error)throw new Error(error.message);return data; }
export async function loadPortalWorkspace() {
  await requirePortalTeam();
  const [profiles,customers,trips,messages,operators,memberships,overlays]=await Promise.all([
    result(supabase.from('profiles').select('id,name,email').order('name'),'Customer accounts'),
    result(supabase.from('crm_customers').select('id,record'),'CRM customers'),
    result(supabase.from('trips').select('*,bookings(*)').order('created_at',{ascending:false}),'Customer trips'),
    result(supabase.from('messages').select('*').order('at',{ascending:true}),'Customer messages'),
    result(supabase.from('operators').select('id,name,status,meeting_point_name,meeting_point_lat,meeting_point_lng,meeting_instructions').eq('status','active').order('name'),'Operator accounts'),
    result(supabase.from('operator_memberships').select('operator_id').eq('status','active'),'Operator access'),
    result(supabase.from('crm_operator_overlays').select('operator_id,overlay'),'Operator meeting details'),
  ]);
  return {profiles,operators:operators.filter(o=>memberships.some(m=>m.operator_id===o.id)).map(o=>({...o,meetingPoint:overlays.find(x=>x.operator_id===o.id)?.overlay?.meetingPoint})),customers:customers.map(x=>({...x.record,id:x.id})),trips,messages};
}
export async function publishPortalTrip(customerId,trip) {
  await requirePortalTeam();
  return result(supabase.rpc('publish_customer_trip',{customer_id:customerId,trip_data:trip,expected_revision:trip.portal_revision||0}),'Publish customer trip');
}
export async function replyToCustomer(userId,text) {
  const access=await requirePortalTeam();text=text.trim();if(!text||text.length>5000)throw new Error('Write 1 to 5,000 characters.');
  return deliverCustomerMessage({userId,text,sender:'team',actorId:access.session.user.id,
    storage:typeof sessionStorage==='undefined'?undefined:sessionStorage,
    insert:row=>result(supabase.from('messages').insert(row),'Customer reply'),
    find:id=>result(supabase.from('messages').select('*').eq('id',id).eq('user_id',userId).maybeSingle(),'Reply confirmation'),
    list:async()=>true});
}
