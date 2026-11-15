import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const html=await(await fetch('https://ticowild.com/my/')).text();
const queue=[...html.matchAll(/src="([^"]+\.js)"/g)].map(x=>new URL(x[1],'https://ticowild.com').href),seen=new Set();
let key,base;
while(queue.length&&seen.size<40){
 const url=queue.shift();if(seen.has(url))continue;seen.add(url);
 const text=await(await fetch(url)).text();
 base ||= text.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
 key ||= text.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];
 for(const m of text.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)){
  try{const payload=JSON.parse(Buffer.from(m[0].split('.')[1],'base64url'));if(payload.role==='anon')key=m[0];}catch{}
 }
 for(const m of text.matchAll(/["'](\.\.?\/[^"']+\.js)["']/g))queue.push(new URL(m[1],url).href);
}
assert.ok(key&&base,'Public deployed backend configuration not found');
const headers={apikey:key,'Content-Type':'application/json',...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})};
// A positive control prevents mistaking a malformed credential for working RLS.
const settings=await fetch(base+'/auth/v1/settings',{headers});
assert.equal(settings.status,200,'Public credential positive control failed');
const results=[];
for(const table of ['crm_customers','crm_operator_overlays','trips','bookings','messages','profiles','customer_preferences','operator_memberships','operator_applications','operator_messages','operator_agreement_requests','operator_portal_state','team_members','email_notifications','email_delivery_events','crm_outbound']){
 const response=await fetch(base+'/rest/v1/'+table+'?select=*&limit=1',{headers});
 const body=await response.json();const pass=[401,403].includes(response.status)||(response.ok&&Array.isArray(body)&&body.length===0);
 results.push({case:'Anonymous cannot read '+table,status:response.status,pass});assert.ok(pass,table+' unexpectedly accessible');
}
for(const name of ['crm_email_health','claim_portal_emails']){
 const response=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers,body:'{}'});
 const pass=[401,403].includes(response.status);results.push({case:'Anonymous cannot call '+name,status:response.status,pass});assert.ok(pass,name+' unexpectedly accessible');
}
const dispatch=await fetch(base+'/functions/v1/portal-email/dispatch',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
results.push({case:'Email dispatch rejects missing authorization',status:dispatch.status,pass:dispatch.status===401});assert.equal(dispatch.status,401);
await writeFile('../../outputs/live-access-results.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.pass).length}));
