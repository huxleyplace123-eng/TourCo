import assert from 'node:assert/strict';
import { mergeInquiries } from '../src/admin/inquiry-merge.js';
import { buildMyCostaRica } from '../src/intelligence/index.js';
const original = { id:'customer1', inquiryId:'first', email:'adam@example.com', travelStart:'2026-12-15', temperature:'Warm', stage:'Planning', notes:[{id:'old',text:'Keep this'}] };
const request = { id:'web_second', inquiryId:'second', email:'ADAM@example.com', travelStart:'2026-12-15', name:'Adam', phone:'123', notes:[{text:'Updated budget and child requirements'}] };
const merged = mergeInquiries([original],[request]);
assert.equal(merged.records.length,1);
assert.equal(merged.changed[0].temperature,'Warm');
assert.equal(merged.changed[0].stage,'Planning');
assert.equal(merged.changed[0].notes[0].text,'Keep this');
assert.match(merged.changed[0].notes[1].text,/Updated budget and child requirements/);
assert.equal(mergeInquiries(merged.records,[request]).changed.length,0);
assert.equal(mergeInquiries([original],[{...request,travelStart:'2026-12-20'}]).records.length,2);
assert.equal(mergeInquiries([],[request,request]).records.length,1);
for (const budget of ['low','mid']) {
  const result = buildMyCostaRica({who:'family',vibe:'nature',budget,youngKids:true,regions:['Manuel Antonio'],days:3,pax:2});
  const activities = result.plan.days.flatMap(day => day.activities);
  assert.ok(activities.length > 0);
  assert.ok(activities.every(a => a.family && a.level !== 'High'));
  assert.ok(activities.every(a => budget === 'low' ? a.price < 100 : a.price <= 200));
}
console.log('Inquiry preservation and planner constraints passed');
