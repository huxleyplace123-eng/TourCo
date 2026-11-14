import assert from "node:assert/strict";
import { mergedOperators, patchOperator, operatorsToCsv, importOperatorsCsv } from "../src/admin/operators-store.js";
import { whatsappNumber, resolveOperatorContacts } from "../src/admin/operator-contacts.js";
import { EMAIL_TEMPLATES } from "../src/admin/email-templates.js";

assert.equal(whatsappNumber("8672-3132"), "50686723132");
assert.equal(whatsappNumber("918-506-2803"), "19185062803");
assert.equal(whatsappNumber("+506 2645-6388"), "50626456388");
assert.equal(whatsappNumber("ask John"), "");
assert.equal(resolveOperatorContacts({phone:"50626456388", whatsapp:"50687477595"}).whatsapp, "50687477595");
assert.equal(resolveOperatorContacts({phone:"50626456388", contactOverrides:{whatsapp:""}}).whatsapp, "");
const before = mergedOperators({});
assert.equal(before.length, 81);
assert.equal(before.filter(o=>o.whatsapp).length, 69);
const id=before[0].id;
const overlay=patchOperator({}, id, {temperature:"Warm", notes:[{id:"test-note", text:"Keep John's note"}], contactOverrides:{phone:"+1 918-506-2803",whatsapp:"19185062803", email:"example@example.com"}});
const after=mergedOperators(overlay).find(o=>o.id===id);
assert.equal(after.phone, "+1 918-506-2803");
assert.equal(after.temperature,"Medium");
assert.equal(after.notes[0].text,"Keep John's note");
assert.equal(mergedOperators(JSON.parse(JSON.stringify(overlay))).find(o=>o.id===id).email,"example@example.com");
const imported=importOperatorsCsv('Operator,Heat,Stage,Notes\nTest operator,Warm,In talks,Keep this note',[]);
const record=Object.values(imported.entries)[0];
assert.equal(record.temperature,"Medium");
assert.equal(record.stage,"In talks");
assert.equal(record.notes[0].text,"Keep this note");
assert.match(operatorsToCsv([after]),/Keep John's note/);
for(const template of EMAIL_TEMPLATES.filter(t=>t.audience==='operator')) {
  assert.match(template.body,/\+1 918-506-2803/);
  assert.match(template.body,/https:\/\/wa.me\/19185062803/);
  assert.doesNotMatch(template.body,/8672-3132/);
}
console.log('Operator contacts, preservation, Warm import and seven template checks passed.');
