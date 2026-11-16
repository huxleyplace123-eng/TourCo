import assert from 'node:assert/strict';
import {planTrip} from '../src/intelligence/planner.js';
import {buildMyCostaRica,recommendActivities} from '../src/intelligence/index.js';
const activity=(id,category,duration='3 hrs',region='Uvita')=>({id,category,duration,region,price:75,level:'Easy'});
const morning=activity('morning','Snorkeling');
const anotherMorning=activity('whales','Whale watching','3.5 hrs');
assert.equal(planTrip([morning,anotherMorning]).days.length,2,'competing morning activities need different days');
const afternoon=activity('sailing','Catamaran','3 hrs');
const paired=planTrip([morning,afternoon]);
assert.equal(paired.days.length,1,'compatible morning/afternoon suggestions remain possible');
assert.doesNotMatch(paired.reasoning[0].why,/zero transfer|short hop/);
assert.match(paired.reasoning[0].why,/need confirmation/);
assert.equal(planTrip([activity('long','Snorkeling','4 hrs'),activity('longer','Catamaran','4 hrs')]).days.length,2,'leave room for transfers and preparation');
const capped=planTrip([morning,anotherMorning,afternoon],{maxDays:1,pax:3});
assert.equal(capped.days.length,1);
assert.equal(capped.totals.activities,capped.days.flatMap(d=>d.activities).length);
assert.equal(capped.totals.cost,capped.days.reduce((s,d)=>s+d.cost,0));
for(const [fear,category] of [['boats',/Fishing|Catamaran|Whale|Snorkel/i],['heights',/Paragl|Zip/i],['water',/Fishing|Catamaran|Snorkel|Surf|Whale|Rafting/i]]){
  assert.ok(recommendActivities({who:'family',vibe:'water',fears:[fear]}).every(r=>!category.test(r.a.category)),`${fear} is an exclusion, not a score penalty`);
}
for(const days of [1,4,7])for(const budget of ['low','mid','any']){
  const {plan}=buildMyCostaRica({who:'family',vibe:'nature',regions:['Not sure yet'],days,pax:4,budget});
  assert.ok(plan.days.length<=days);
  assert.equal(plan.totals.activities,plan.days.flatMap(d=>d.activities).length);
  assert.equal(plan.totals.cost,plan.days.flatMap(d=>d.activities).reduce((s,a)=>s+a.price*4,0));
  for(const day of plan.days){
    assert.equal(new Set(day.items.map(a=>a.time)).size,day.items.length);
    assert.equal(new Set(day.activities.map(a=>a.region)).size,1);
    assert.ok(day.activities.every(a=>budget==='low'?a.price<100:budget==='mid'?a.price<=200:true));
  }
  assert.ok(plan.warnings.every(w=>!w.includes('over your')),'per-person activity budget must not invent a total-trip cap');
}
console.log('PASS: time-slot conflicts, transfer buffers, day-cap totals, exclusions, regional grouping and budget semantics.');
