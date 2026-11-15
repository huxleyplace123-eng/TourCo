import assert from 'node:assert/strict';
import {outlookComposeHref} from '../src/admin/outlook-compose.js';
const d={to:'a@example.com',bcc:'b@example.com',subject:'¡Hola! & + #',body:'Hello\n\nhttps://ticowild.com/partners/?agreement=test&x=1\n+ & #'};
const u=new URL(outlookComposeHref(d));for(const k of ['to','bcc','subject','body'])assert.equal(u.searchParams.get(k),d[k]);
assert.equal(u.origin,'https://outlook.office.com');assert.equal(u.searchParams.get('login_hint'),'info@ticowild.com');
assert.throws(()=>outlookComposeHref({...d,body:'{{name}}'}));assert.throws(()=>outlookComposeHref({...d,to:'bad\nBcc: a@example.com'}));assert.throws(()=>outlookComposeHref({...d,body:'x'.repeat(8000)}));
console.log('PASS: Outlook recipient/Bcc isolation, Unicode, multiline link preservation, mailbox hint, invalid input and long draft guards.');
