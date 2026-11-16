import {pathToFileURL} from 'node:url';
import {emailHealthAlerts} from '../src/notifications/health.js';
export async function checkOperations({fetchImpl=fetch,health,base='https://ticowild.com'}={}) {
  const failures=[];
  for(const path of ['/','/plan','/my/','/partners/','/admin/']) {
    try {
      const response=await fetchImpl(base+path,{signal:AbortSignal.timeout(15000)});
      const body=await response.text();
      if(!response.ok||!body.includes('<html')||!body.includes('/assets/'))failures.push(`Website route ${path} failed its availability check.`);
    } catch { failures.push(`Website route ${path} could not be reached.`); }
  }
  if(health)try{failures.push(...emailHealthAlerts(await health()).map(a=>a.title));}catch{failures.push('Notification health could not be checked.');}
  return {checkedAt:new Date().toISOString(),failures,notificationHealthChecked:!!health};
}
export async function sendOperationsAlert(report,{fetchImpl=fetch,key,to,incidentId}={}) {
  if(!key||!to||!incidentId)throw Error('Alert delivery requires a private provider key, recipient and stable incident ID.');
  const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`operations/${incidentId}`},body:JSON.stringify({from:'TicoWild <info@ticowild.com>',to:[to],subject:'TicoWild app needs attention',text:`Checked ${report.checkedAt}\n${report.failures.join('\n')}\nOpen the CRM delivery history and hosting dashboard. No customer data is included.`}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(`Alert provider returned HTTP ${response.status}.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=await checkOperations();console.log(JSON.stringify(report,null,2));
  // Running this script is read-only. An external scheduler must explicitly
  // call sendOperationsAlert with its secret store and incident deduplication.
  if(report.failures.length)process.exitCode=1;
}
