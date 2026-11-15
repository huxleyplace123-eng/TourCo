import {AGREEMENT_VERSION} from '../agreements/terms.js';
const normalized=value=>String(value||'').trim().toLowerCase();
export function matchingSavedAgreement(rows,email,companyName){
 if(!normalized(companyName))return null;
 return rows.find(row=>row.signed_at&&row.version===AGREEMENT_VERSION&&normalized(row.recipient_email)===normalized(email)&&normalized(row.company_name)===normalized(companyName)&&normalized(row.signed_data?.legalName)===normalized(companyName))?.signed_data||null;
}
export function agreementMatchesCompany(agreement,companyName){
 return !!agreement&&normalized(agreement.legalName)===normalized(companyName)&&agreement.agreementVersion===AGREEMENT_VERSION;
}
