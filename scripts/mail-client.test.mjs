import assert from 'node:assert/strict';
import { PublicClientApplication } from '@azure/msal-browser';
const account = { username: 'info@ticowild.com' };
assert.equal(typeof PublicClientApplication.prototype.initialize,'function');
let initialized = false;
PublicClientApplication.prototype.initialize = async () => { initialized = true; };
PublicClientApplication.prototype.getAllAccounts = () => { assert(initialized); return [account]; };
PublicClientApplication.prototype.acquireTokenSilent = async () => ({accessToken:'test-token'});
const {sendMail,listMail,readMail,replyMail}=await import('../src/admin/mail-client.js');
let calls=[];
globalThis.fetch=async(url,options)=>{calls.push({url:String(url),options});return new Response(null,{status:202});};
// The real constructor is used; a minimal server-side window supplies only the redirect origin.
globalThis.window={crypto:globalThis.crypto,addEventListener:()=>{},location:{origin:'https://ticowild.com',href:'https://ticowild.com/admin/'}};
await sendMail({to:'adamneal28@gmail.com',bcc:'',subject:'Test',body:'Hello'});
assert.equal(calls[0].url,'https://graph.microsoft.com/v1.0/me/sendMail');
assert.equal(JSON.parse(calls[0].options.body).saveToSentItems,true);
assert.equal(calls[0].options.headers.Authorization,'Bearer test-token');
await assert.rejects(listMail('inbox','https://example.com/steal'),/Invalid mailbox request/);
assert.equal(calls.length,1);
await replyMail('id/with/slashes','Hello');
assert(calls[1].url.includes('id%2Fwith%2Fslashes/reply'));
globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'Permission denied'}}),{status:403});
await assert.rejects(readMail('id'),/Permission denied/);
globalThis.fetch=async()=>{throw new Error('network down')};
await assert.rejects(sendMail({to:'a@example.com',bcc:'',subject:'Test',body:'Hello'}),/status is unknown/);
console.log('Mail client passed: destination guard, sent-copy request, reply ID encoding, permission errors, ambiguous-send protection.');


