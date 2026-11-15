import assert from 'node:assert/strict';
import {operators,activities,packages} from '../src/data.js';
import {trustReceipt} from '../src/intelligence/trust.js';
import {planTrip} from '../src/intelligence/planner.js';
assert.ok(activities.length>0 && packages.length>0);
for(const op of operators){assert.equal(op.catalogStatus,'planning-example');assert.equal(op.whatsapp,'');assert.equal(op.insurance,null);assert.equal(op.vetted,false);assert.equal(op.rating,null);assert.equal(trustReceipt(op),null);assert.match(op.name,/Provider to be confirmed/);}
for(const activity of activities){assert.equal(activity.rating,null);assert.equal(activity.reviews,null);assert.equal(activity.catalogStatus,'planning-example');}
console.log('PASS: planning examples remain available without false partner credentials, ratings or contact routes.');
