import {supabase,withTimeout} from '../portal/supabase.js';
export async function queueEmail(draft,requestKey,agreementId=null){
 if(!supabase)throw Error('The email service is not configured.');
 if(draft.bcc?.trim())throw Error('Send to one recipient at a time. Bcc bulk sending is not enabled.');
 const {data,error}=await withTimeout(supabase.rpc('queue_crm_email',{request_key:requestKey,recipient:draft.to.trim(),title:draft.subject.trim(),message_text:draft.body,agreement_id:agreementId}),15000,'Queue email');
 if(error)throw error;return data;
}
