import {readdir,mkdir,writeFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile),results=[];let cursor=0;
const files=(await readdir('scripts')).filter(f=>f.endsWith('.test.mjs')||['crm-contract.mjs','mobile-contract.mjs','public-site-contract.mjs'].includes(f));
async function worker(){while(cursor<files.length){const file=files[cursor++];try{const result=await run(process.execPath,['scripts/'+file],{timeout:90000,maxBuffer:1000000,env:process.env});results.push({file,passed:true,output:result.stdout.trim()});console.log('PASS '+file);}catch(error){results.push({file,passed:false,output:(error.stdout||'')+(error.stderr||'')});console.log('FAIL '+file);}}}
await Promise.all([worker(),worker()]);await mkdir('artifacts',{recursive:true});await writeFile('artifacts/regression-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,total:results.length,failed:results.filter(r=>!r.passed).map(r=>r.file)}));process.exitCode=results.some(r=>!r.passed)?1:0;
