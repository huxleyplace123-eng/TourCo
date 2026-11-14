import {hasSupabase,supabase,withTimeout} from '../portal/supabase.js';
export async function savePortal(operatorId,portal,expectedUpdatedAt){
 if(!hasSupabase)return expectedUpdatedAt;
 if(expectedUpdatedAt===undefined)throw new Error('Reload the operator portal before saving.');
 const updated_at=new Date(Math.max(Date.now(),(Date.parse(expectedUpdatedAt)||0)+1)).toISOString();
 const payload={operator_id:operatorId,state:portal,updated_at};
 const query=expectedUpdatedAt===null?supabase.from('operator_portal_state').insert(payload):supabase.from('operator_portal_state').update({state:portal,updated_at}).eq('operator_id',operatorId).eq('updated_at',expectedUpdatedAt);
 const {data,error}=await withTimeout(query.select('updated_at').maybeSingle(),12000,'Operator portal save');
 if(error)throw error;
 if(!data){const error=new Error('This operator record changed in another session. Download your unsaved edits before reloading.');error.code='PORTAL_CONFLICT';throw error;}
 return data.updated_at;
}
