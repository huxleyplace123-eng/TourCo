import assert from 'node:assert/strict';
import {optionalCoordinate,partnerBooking} from '../src/partners/booking-model.js';
for(const value of ['', ' ',null,undefined,'nope',91,Infinity])assert.equal(optionalCoordinate(value,90),null);
assert.equal(optionalCoordinate(0,90),0);assert.equal(optionalCoordinate('-84.5',180),-84.5);
const row=partnerBooking({id:'x',name:'Activity',guest_name:'Actual Guest',guest_count:4,status:'Confirmed'});
assert.equal(row.guest,'Actual Guest');assert.equal(row.pax,4);assert.equal(row.response,'accepted');assert.equal(row.pending,false);
assert.equal(partnerBooking({name:'Activity'}).guest,'Guest name pending');
assert.equal(partnerBooking({status:'Cancelled'}).response,null);
console.log('Partner display and optional coordinates passed.');
