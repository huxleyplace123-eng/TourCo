import {supabase,withTimeout} from '../portal/supabase.js';
export async function loadOperatorMessages(operatorId,limit=100) {
 const {data,error}=await withTimeout(supabase.from('operator_messages').select('*').eq('operator_id',operatorId).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(limit),12000,'Operator conversation');
 if(error)throw new Error(error.message);return (data||[]).reverse();
}
export async function sendOperatorMessage(operatorId,text,requestId) {
 const {data,error}=await withTimeout(supabase.rpc('send_operator_message',{requested_operator_id:operatorId,body:text,request_id:requestId}),15000,'Operator message');
 if(error)throw new Error(error.message);return data;
}
