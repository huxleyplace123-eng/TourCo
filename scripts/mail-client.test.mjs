import assert from 'node:assert/strict';
import { PublicClientApplication } from '@azure/msal-browser';
// Native BroadcastChannel keeps Node alive; browsers manage this channel's lifetime.
const NativeBroadcastChannel = globalThis.BroadcastChannel;
globalThis.BroadcastChannel = class extends NativeBroadcastChannel {
  constructor(name) { super(name); this.unref(); }
};
let account = { username: 'info@ticowild.com', tenantId:'22bf624c-f971-44f6-9380-8f5c4d0be48c' };
let active = null, requestedScopes;
assert.equal(typeof PublicClientApplication.prototype.initialize,'function');
let initialized = false;
PublicClientApplication.prototype.initialize = async () => { initialized = true; };
PublicClientApplication.prototype.getAllAccounts = () => { assert(initialized); return [account]; };
PublicClientApplication.prototype.getActiveAccount = () => active;
PublicClientApplication.prototype.setActiveAccount = a => { active=a; };
PublicClientApplication.prototype.loginPopup = async options => { requestedScopes=options.scopes;return {account}; };
PublicClientApplication.prototype.clearCache = async () => { active=null; };
PublicClientApplication.prototype.acquireTokenSilent = async options => { assert.equal(options.account,account);return {accessToken:'test-token'}; };
const {sendMail,listMail,readMail,replyMail,connectMail,mailAccount}=await import('../src/admin/mail-client.js');
let calls=[];
globalThis.fetch=async(url,options)=>{calls.push({url:String(url),options});return new Response(null,{status:202});};
// The real constructor is used; a minimal server-side window supplies only the redirect origin.
globalThis.window={crypto:globalThis.crypto,addEventListener:()=>{},location:{origin:'https://ticowild.com',href:'https://ticowild.com/admin/'}};
await sendMail({to:'adamneal28@gmail.com',bcc:'',subject:'Test',body:'Hello'});
assert.equal(calls[0].url,'https://graph.microsoft.com/v1.0/users/info%40ticowild.com/sendMail');
assert.equal(JSON.parse(calls[0].options.body).saveToSentItems,true);
assert.equal(calls[0].options.headers.Authorization,'Bearer test-token');
await assert.rejects(listMail('inbox','https://example.com/steal'),/Invalid mailbox request/);
assert.equal(calls.length,1);
await replyMail('id/with/slashes','Hello');
assert(calls[1].url.includes('id%2Fwith%2Fslashes/reply'));
account={...account,username:'john@ticowild.com'};
await connectMail();
assert.deepEqual(requestedScopes,['User.Read','Mail.Read.Shared','Mail.Send.Shared']);
assert.equal((await mailAccount()).username,'john@ticowild.com');
await listMail();
assert(calls.at(-1).url.includes('/users/info%40ticowild.com/mailFolders/inbox/messages'));
await listMail('inbox','https://graph.microsoft.com/v1.0/users/info@ticowild.com/mailFolders/inbox/messages?$skip=50');
assert(calls.at(-1).url.includes('$skip=50'));
const before=calls.length;
for(const next of ['https://graph.microsoft.com/v1.0/users/john@ticowild.com/messages','https://graph.microsoft.com/v1.0/me/messages','https://evil.example/v1.0/users/info@ticowild.com/messages','https://graph.microsoft.com/v1.0/users/info@ticowild.com/../other/messages'])await assert.rejects(listMail('inbox',next),/Invalid mailbox request/);
assert.equal(calls.length,before);
account={...account,tenantId:'other-tenant'};
await assert.rejects(connectMail(),/approved TicoWild/);
assert.equal(await mailAccount(),null);
account={username:'unapproved@ticowild.com',tenantId:'22bf624c-f971-44f6-9380-8f5c4d0be48c'};
await assert.rejects(connectMail(),/approved TicoWild/);
account={...account,username:'john@ticowild.com'};
await connectMail();
globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'Permission denied'}}),{status:403});
await assert.rejects(readMail('id'),/Permission denied/);
globalThis.fetch=async()=>{throw new Error('network down')};
await assert.rejects(sendMail({to:'a@example.com',bcc:'',subject:'Test',body:'Hello'}),/status is unknown/);
console.log('Mail client passed: destination guard, sent-copy request, reply ID encoding, permission errors, ambiguous-send protection.');


