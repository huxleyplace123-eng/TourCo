import assert from 'node:assert/strict';
import {optionalCoordinate,partnerBooking,upcomingPartnerBookings} from '../src/partners/booking-model.js';
const upcoming=upcomingPartnerBookings([
 {id:'cancelled',date:'2026-12-15',status:'Cancelled'},
 {id:'completed',date:'2026-12-15',status:'Completed'},
 {id:'declined',date:'2026-12-15',status:'Declined'},
 {id:'old',date:'2026-11-14',status:'Confirmed'},
 {id:'later',date:'2026-12-16',status:'Confirmed'},
 {id:'demo-declined',date:'2026-12-15'},
 {id:'next',date:'2026-12-15',status:'Requested'}
],{'demo-declined':'declined'},'2026-11-15');
assert.deepEqual(upcoming.map(b=>b.id),['next','later']);
for(const value of ['', ' ',null,undefined,'nope',91,Infinity])assert.equal(optionalCoordinate(value,90),null);
assert.equal(optionalCoordinate(0,90),0);assert.equal(optionalCoordinate('-84.5',180),-84.5);
const row=partnerBooking({id:'x',name:'Activity',guest_name:'Actual Guest',guest_count:4,status:'Confirmed'});
assert.equal(row.guest,'Actual Guest');assert.equal(row.pax,4);assert.equal(row.response,'accepted');assert.equal(row.pending,false);
assert.equal(partnerBooking({name:'Activity'}).guest,'Guest name pending');
assert.equal(partnerBooking({status:'Cancelled'}).response,null);
console.log('Partner display and optional coordinates passed.');

const pinned=partnerBooking({meeting_point_name:'Gate',meeting_point_lat:0,meeting_point_lng:0,meeting_instructions:'Arrive early'});assert.equal(pinned.pickup,'Gate');assert.equal(pinned.meetingPoint.lat,0);assert.equal(pinned.meetingPoint.instructions,'Arrive early');
