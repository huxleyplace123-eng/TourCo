import assert from 'node:assert/strict';
import {whatsappLink} from '../src/admin/whatsapp-link.js';
import {EMAIL_TEMPLATES} from '../src/admin/email-templates.js';
import {outgoingMessage} from '../src/admin/mail-model.js';
assert.equal(whatsappLink('+1 (918) 506-2803'),'https://wa.me/19185062803');
assert.equal(whatsappLink('00506 8888 7777'),'https://wa.me/50688887777');
for(const bad of ['8888-7777','+1 918 506 2803 ext 9','+1 9185062803 / +50688887777','abc','0000','9'.repeat(16)])assert.equal(whatsappLink(bad),null);
const text='Hello & + #\nhttps://ticowild.com/partners/?agreement=abc';assert.equal(new URL(whatsappLink('+19185062803',text)).searchParams.get('text'),text);
for(const t of EMAIL_TEMPLATES){assert(t.body.includes('info@ticowild.com'),t.id);if(t.audience==='operator')assert(t.body.includes('https://wa.me/19185062803'),t.id);}
const review=EMAIL_TEMPLATES.find(t=>t.id==='customer-review-request');assert(review);assert.throws(()=>outgoingMessage({to:'a@example.com',bcc:'',subject:review.subject,body:review.body}),/placeholders/);
console.log('PASS: malformed WhatsApp recipients rejected, message preserved, all built-in templates include business email, operator templates include John, review placeholders must be replaced.');
