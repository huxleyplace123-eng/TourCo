import { supabase, withTimeout } from '../portal/supabase.js';
import { getTeamAccess } from './applications-data.js';
export async function requirePortalTeam() {
  const access=await getTeamAccess();
  if (!access.member) throw new Error('Sign in with an authorized TicoWild team account to manage customer trips and messages.');
  return access;
}
async function result(query,label) { const {data,error}=await withTimeout(query,15000,label); if(error)throw new Error(error.message);return data; }
export async function loadPortalWorkspace() {
  await requirePortalTeam();
  const [profiles,customers,trips,messages]=await Promise.all([
    result(supabase.from('profiles').select('id,name,email').order('name'),'Customer accounts'),
    result(supabase.from('crm_customers').select('id,record'),'CRM customers'),
    result(supabase.from('trips').select('*,bookings(*)').order('created_at',{ascending:false}),'Customer trips'),
    result(supabase.from('messages').select('*').order('at',{ascending:true}),'Customer messages'),
  ]);
  return {profiles,customers:customers.map(x=>({...x.record,id:x.id})),trips,messages};
}
export async function publishPortalTrip(customerId,trip) {
  await requirePortalTeam();
  return result(supabase.rpc('publish_customer_trip',{customer_id:customerId,trip_data:trip,expected_revision:trip.portal_revision||0}),'Publish customer trip');
}
export async function replyToCustomer(userId,text) {
  await requirePortalTeam();text=text.trim();if(!text||text.length>5000)throw new Error('Write 1 to 5,000 characters.');
  return result(supabase.from('messages').insert({user_id:userId,from:'team',text}).select().single(),'Customer reply');
}
