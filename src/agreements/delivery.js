export function agreementExpired(record,now=Date.now()){return !record.signed_at&&new Date(record.expires_at).getTime()<=now;}
export function agreementSubject(record){return `Your TicoWild operator agreement · ${record.id}`;}
// A sent-folder match is evidence of submission, never proof of recipient delivery.
export async function checkAgreementSent(record,{list,read},origin=window.location.origin){
 const batch=await list('sentitems');
 const expected=new URL('/partners/?agreement='+encodeURIComponent(record.id),origin).href;
 const after=new Date(record.created_at).getTime();
 const candidates=(batch.value||[]).filter(m=>new Date(m.sentDateTime||m.receivedDateTime).getTime()>=after&&m.toRecipients?.some(r=>r.emailAddress?.address?.toLowerCase()===record.recipient_email.toLowerCase()));
 // Bound requests; explicitly report partial coverage rather than claiming no email exists.
 for(const item of candidates.slice(0,10)){
  const full=await read(item.id);
  const sender=full.from?.emailAddress?.address?.toLowerCase();
  if(sender==='info@ticowild.com'&&full.body?.content?.includes(expected))return {found:true,sentAt:full.sentDateTime||item.sentDateTime,webLink:full.webLink,id:item.id};
 }
 return {found:false,limited:Boolean(batch['@odata.nextLink'])||candidates.length>10};
}
