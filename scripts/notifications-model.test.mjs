import assert from 'node:assert/strict';
import {notificationItems} from '../src/notifications/model.js';
const data={messages:[{id:'1',from:'team',at:'2026-11-14T12:00:00Z'},{id:'2',from:'customer',at:'2026-11-14T13:00:00Z'}],operatorMessages:[{id:'3',sender_role:'team'},{id:'4',sender_role:'operator'}],bookings:[{id:'b',name:'Boat',status:'Requested',notification_revision:1,created_at:'2026-11-14T14:00:00Z'}]};
const customer=notificationItems('customer',{messages:data.messages,bookings:data.bookings});assert(customer.some(x=>x.key==='customer:message:1'));assert(!customer.some(x=>x.key==='customer:message:2'));assert.equal(customer[0].title,'Boat · Requested');
assert(notificationItems('team',data).some(x=>x.key==='team:operator-message:4'));assert(!notificationItems('team',data).some(x=>x.key==='team:operator-message:3'));
const next=notificationItems('customer',{bookings:[{...data.bookings[0],notification_revision:2}]});assert.notEqual(next[0].key,customer[0].key);
assert.equal(notificationItems('team',{inquiries:[{id:'q',status:'archived'}],applications:[{id:'a',status:'draft'}]}).length,0);
assert.equal(notificationItems('customer',{messages:Array.from({length:150},(_,i)=>({id:i,from:'team'}))}).length,100);
console.log('PASS: incoming-message filters, audience separation, revision-based unread keys, actionable application/inquiry filters, chronological ordering and bounded feed.');
