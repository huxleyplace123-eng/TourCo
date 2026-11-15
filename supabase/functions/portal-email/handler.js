export function notificationMessage(row) {
  if (!/^\/(my\/|partners\/|admin\/)([?][a-zA-Z0-9=&_%.-]*)?$/.test(row.portal_path)) throw new Error('Invalid portal destination');
  return {
    from:'TicoWild <info@ticowild.com>',to:[row.recipient_email],reply_to:'info@ticowild.com',
    subject:row.subject,
    text:row.source_table==='crm_outbound' ? row.body_text : `${row.subject}\n\nOpen your secure TicoWild portal to view the details:\nhttps://ticowild.com${row.portal_path}\n\nSign in with the email address that received this notification. Private messages and booking details stay in your portal.\n\nQuestions? Reply to info@ticowild.com.\nTicoWild`,
  };
}

export function createEmailHandler({env,fetchImpl=fetch,verifyWebhook,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
  async function rpc(name,args){
    const response=await fetchImpl(`${env('SUPABASE_URL')}/rest/v1/rpc/${name}`,{
      method:'POST',headers:{apikey:env('SUPABASE_SERVICE_ROLE_KEY'),authorization:`Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,'content-type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000)
    });
    if(!response.ok)throw new Error(`Database operation failed (${response.status})`);
    const body=await response.text();return body ? JSON.parse(body) : null;
  }
  return async request=>{
    if(request.method!=='POST')return json({error:'POST required'},405);
    const route=new URL(request.url).pathname;
    if(route.endsWith('/webhook')){
      if(!env('RESEND_WEBHOOK_SECRET'))return json({error:'Webhook not configured'},503);
      let event;const eventId=request.headers.get('svix-id');
      try{event=await verifyWebhook(await request.text(),request.headers,env('RESEND_WEBHOOK_SECRET'));}catch{return json({error:'Invalid signature'},401);}
      if(!eventId||!event?.data?.email_id||!event.created_at||!Number.isFinite(Date.parse(event.created_at)))return json({error:'Malformed event'},400);
      try{await rpc('record_portal_email_delivery',{event_id:eventId,provider_id:event.data.email_id,event_type:event.type,event_at:event.created_at});return json({received:true});}
      catch{return json({error:'Delivery update unavailable; retry'},503);}
    }
    if(!route.endsWith('/dispatch'))return json({error:'Not found'},404);
    const secret=env('PORTAL_EMAIL_DISPATCH_SECRET');
    if(!secret||request.headers.get('x-dispatch-secret')!==secret)return json({error:'Unauthorized'},401);
    if(!env('RESEND_API_KEY')||!env('SUPABASE_SERVICE_ROLE_KEY'))return json({error:'Sender not configured'},503);
    try{
      const rows=await rpc('claim_portal_emails',{batch_size:5});let accepted=0,failed=0;
      for(const [index,row] of rows.entries()){
        if(index)await sleep(1100);
        let provider=null,error=null,retryable=false;
        try{
          const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${env('RESEND_API_KEY')}`,'content-type':'application/json','idempotency-key':`portal-email/${row.id}`},body:JSON.stringify(notificationMessage(row)),signal:AbortSignal.timeout(15000)});
          const result=await response.json();
          if(response.ok&&result.id){provider=result.id;accepted++;}
          else{error=`Email provider rejected request (${response.status})`;retryable=response.status===429||response.status>=500;failed++;}
        }catch{error='Email provider response unknown';retryable=true;failed++;}
        const recorded=await rpc('finish_portal_email',{notification_id:row.id,lease:row.lease_id,provider,error_text:error,retryable});
        if(!recorded)throw new Error('Delivery lease changed');
      }
      return json({claimed:rows.length,accepted,failed});
    }catch{return json({error:'Dispatch incomplete; queued work retained for retry'},503);}
  };
}
