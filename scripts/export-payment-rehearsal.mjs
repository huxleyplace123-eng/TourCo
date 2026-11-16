import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {newRehearsal} from '../src/payments/rehearsal-model.js';
import {paymentNotification} from '../src/payments/payment-notification.js';
// Run the separate Vite rehearsal build first. Produces a portable, offline sample.
const output=process.argv[2];if(!output)throw new Error('Supply the output HTML path.');
const root=resolve('node_modules/.payment-rehearsal-build');
let html=await readFile(resolve(root,'payment-rehearsal/index.html'),'utf8');
const js=html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const css=html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if(!js||!css)throw new Error('Expected one built script and stylesheet.');
const asset=p=>{const full=resolve(root,'.'+p);if(!full.startsWith(root))throw new Error('Invalid asset path');return full;};
const code=(await readFile(asset(js[1]),'utf8')).replace(/<\/script/gi,'<\\/script');
const styles=await readFile(asset(css[1]),'utf8');
html=html.replace(js[0],()=>`<script type="module">${code}</script>`).replace(css[0],()=>`<style>${styles}</style>`);
await mkdir(dirname(resolve(output)),{recursive:true});await writeFile(output,html);
const message=paymentNotification({booking:newRehearsal().bookings[0],kind:'payment',amountMinor:10000,reference:'SAMPLE-RECEIPT-1001',sample:true});
await writeFile(resolve(dirname(output),'sample-payment-confirmation-email.txt'),`Subject: ${message.subject}\n\n${message.text}\n`);
console.log('Portable payment rehearsal exported. No external assets or real service connections.');
