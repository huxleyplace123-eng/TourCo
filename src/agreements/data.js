import {supabase,withTimeout} from '../portal/supabase.js';
import {AGREEMENT_SECTIONS,AGREEMENT_VERSION} from './terms.js';
async function result(p){const {data,error}=await withTimeout(p,15000,'Operator agreements');if(error)throw error;return data;}
export const listAgreements=op=>result(op?supabase.from('operator_agreement_requests').select('*').eq('operator_id',op).order('created_at',{ascending:false}):supabase.from('operator_agreement_requests').select('*').order('created_at',{ascending:false}));
export const getAgreement=id=>result(supabase.from('operator_agreement_requests').select('*').eq('id',id).single());
export const prepareAgreement=(op,email)=>result(supabase.rpc('prepare_operator_agreement',{op_id:op.id,company:op.name,recipient:email,doc_version:AGREEMENT_VERSION,doc_sections:AGREEMENT_SECTIONS}));
export const recordEvent=(id,kind)=>result(supabase.rpc('record_agreement_event',{request_id:id,event_kind:kind}));
export const openAgreement=id=>result(supabase.rpc('open_operator_agreement',{request_id:id}));
export const signAgreement=(id,details)=>result(supabase.rpc('sign_operator_agreement',{request_id:id,details}));
export const agreementLink=id=>new URL('/partners/?agreement='+encodeURIComponent(id),window.location.origin).href;
export const agreementMessage=(r)=>`Hello ${r.company_name},\n\nPlease review and sign your TicoWild operator agreement securely online:\n${agreementLink(r.id)}\n\nSign in or create an account using ${r.recipient_email}. Your signed copy will be saved in the portal—no attachment to email back.\n\nQuestions? John: +1 918-506-2803 (US)\nhttps://wa.me/19185062803\nTicoWild · info@ticowild.com`;
export {signedDocument,downloadAgreement} from './document.js';
