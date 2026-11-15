import {writeFile} from 'node:fs/promises';
// Bounded read-only smoke test, never an authentication or email load test.
const paths=['/','/activities','/plan','/my/','/partners/','/admin/'];
const results=[];let next=0;const started=new Date().toISOString();
async function worker(){while(next<60){const n=next++,path=paths[n%paths.length],start=performance.now();try{const response=await fetch('https://ticowild.com'+path,{signal:AbortSignal.timeout(15000)});const body=await response.text();results.push({n,path,status:response.status,ms:Math.round(performance.now()-start),html:body.includes('<html'),bytes:Buffer.byteLength(body)});}catch(e){results.push({n,path,error:e.name,ms:Math.round(performance.now()-start)});}await new Promise(r=>setTimeout(r,750));}}
await Promise.all(Array.from({length:5},worker));
const times=results.map(r=>r.ms).sort((a,b)=>a-b);
const summary={started,requests:results.length,concurrency:5,p50Ms:times[Math.floor(times.length*.5)],p95Ms:times[Math.floor(times.length*.95)],failures:results.filter(r=>r.status!==200||!r.html),scope:'Read-only public HTML burst. Does not establish authenticated database, login, email or large-scale production capacity.'};
await writeFile('../../outputs/public-http-burst-results.json',JSON.stringify({summary,results},null,2));console.log(JSON.stringify(summary,null,2));if(summary.failures.length)process.exitCode=1;
