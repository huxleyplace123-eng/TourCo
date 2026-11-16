import assert from 'node:assert/strict';
import {ACTORS as A,newRehearsal,viewBookings,prepareBooking,acceptBooking,acceptTerms,startCheckout,simulateProviderEvent,cancelBooking,simulateRefund,recordCollection,completeBooking,simulateDispute,simulateEmailDelivery,paymentSummary} from '../src/payments/rehearsal-model.js';
import {paymentNotification,parseSampleUsd} from '../src/payments/payment-notification.js';
const at='2026-11-15T20:00:00Z', late='2026-11-18T20:00:00Z', id='sample-1';
let checks=0;
function test(name,fn){fn();checks++;console.log(`PASS ${name}`);}
function ready(){let s=newRehearsal();s=prepareBooking(s,id,A.staff,at);s=acceptBooking(s,id,A.operator,at);s=acceptTerms(s,id,A.customer,at);return startCheckout(s,id,A.customer,at);}
function event(s,type='paid',overrides={},when=at){return simulateProviderEvent(s,id,{id:`event-${s.events.length+1}`,sessionId:s.bookings[0].session.id,type,amountMinor:10000,currency:'usd',livemode:false,...overrides},when);}
function paid(){return event(ready());}
test('unapproved, unaccepted and unsigned bookings cannot be charged',()=>{
 let s=newRehearsal();assert.throws(()=>startCheckout(s,id,A.customer,at));
 s=prepareBooking(s,id,A.staff,at);assert.throws(()=>startCheckout(s,id,A.customer,at));
 s=acceptBooking(s,id,A.operator,at);assert.throws(()=>startCheckout(s,id,A.customer,at));
 assert.throws(()=>startCheckout(ready(),id,A.customer,late),/expired/);
});
test('customer and assigned-operator views are scoped; returned data is detached',()=>{
 const s=ready();assert.equal(viewBookings(s,A.customer).length,2);assert.equal(viewBookings(s,A.otherCustomer).length,0);
 assert.equal(viewBookings(s,null).length,0);assert.equal(viewBookings(s,A.operator).length,1);
 assert.equal(viewBookings(s,A.otherOperator)[0].id,'sample-2');
 const view=viewBookings(s,A.customer);view[0].paidMinor=999;assert.equal(s.bookings[0].paidMinor,0);
});
test('wrong actor cannot approve, accept, pay, collect or refund',()=>{
 assert.throws(()=>prepareBooking(newRehearsal(),id,A.customer,at));assert.throws(()=>acceptBooking(ready(),id,A.otherOperator,at));
 assert.throws(()=>startCheckout(ready(),id,A.otherCustomer,at));assert.throws(()=>acceptTerms(ready(),id,A.otherCustomer,at));
 assert.throws(()=>recordCollection(paid(),id,A.otherOperator,{reference:'r',amountMinor:40000,method:'cash'},at));
 assert.throws(()=>simulateRefund(paid(),id,A.customer,{reference:'r',amountMinor:10000,result:'succeeded'},at));
});
test('repeat checkout uses one attempt; no payment on redirect/open',()=>{
 const s=ready(),next=startCheckout(s,id,A.customer,at);assert.equal(next.bookings[0].attempts.length,1);
 assert.equal(next.bookings[0].paidMinor,0);assert.equal(next.emails.length,0);assert.equal(next.bookings[0].receipts.length,0);
});
test('processing and decline do not issue receipts or confirmation',()=>{
 let s=event(ready(),'processing');assert.equal(s.bookings[0].paymentStatus,'processing');assert.equal(s.emails.length,0);
 s=event(s,'failed');assert.equal(s.bookings[0].paidMinor,0);assert.equal(s.bookings[0].receipts.length,0);
 const retry=startCheckout(s,id,A.customer,at);assert.equal(retry.bookings[0].attempts.length,2);
});
test('wrong amount, currency, mode and session fail without mutation',()=>{
 const s=ready();for(const change of [{amountMinor:40000},{currency:'crc'},{livemode:true},{sessionId:'unknown'}])assert.throws(()=>event(s,'paid',change));
 assert.equal(s.events.length,0);assert.equal(s.bookings[0].paidMinor,0);
});
test('paid deposit creates exactly one receipt and payment email',()=>{
 const s=paid();assert.equal(s.bookings[0].paidMinor,10000);assert.equal(s.bookings[0].receipts.length,1);assert.equal(s.emails.length,1);
 assert.match(s.emails[0].text,/Remaining: \$400.00 payable directly/);assert.match(s.emails[0].text,/Excursion total: \$500.00/);
 assert.match(s.emails[0].text,/Sign in with the email/);assert.match(s.emails[0].subject,/SAMPLE/);
 assert.equal(s.bookings[1].paidMinor,0);
});
test('event replay and distinct success events for same Session do not duplicate',()=>{
 const s=paid(),replayed=event(s,'paid',{id:'event-1'}),again=event(replayed);
 assert.equal(again.emails.length,1);assert.equal(again.bookings[0].paidMinor,10000);assert.equal(again.bookings[0].receipts.length,1);
});
test('delayed failure cannot downgrade paid; already-paid checkout is blocked',()=>{
 const s=event(paid(),'failed');assert.equal(s.bookings[0].paymentStatus,'paid');assert.equal(s.emails.length,1);
 assert.throws(()=>startCheckout(s,id,A.customer,at),/already/);
});
test('older checkout success is recorded; second paid attempt gets duplicate review',()=>{
 let s=ready();const old=s.bookings[0].session.id;s=event(s,'expired');s=startCheckout(s,id,A.customer,at);
 const current=s.bookings[0].session.id;s=event(s,'paid',{sessionId:old});s=event(s,'paid',{sessionId:current});
 assert.equal(s.bookings[0].paidMinor,20000);assert.equal(s.bookings[0].receipts.length,2);
 assert.equal(s.emails[1].kind,'review');assert.match(s.bookings[0].exceptions[0],/duplicate/);
});
test('email failure and retry preserve payment and a single outbox item',()=>{
 let s=paid();const email=s.emails[0].id;
 for(const result of ['failed','accepted','delivered','failed'])s=simulateEmailDelivery(s,email,A.staff,result,at);
 assert.equal(s.emails.length,1);assert.equal(s.emails[0].status,'delivered');assert.equal(s.emails[0].attempts,3);
 assert.equal(s.bookings[0].paidMinor,10000);assert.equal(s.bookings[0].receipts.length,1);
});
test('cancelled or expired-hold late success gets review, not booking confirmation',()=>{
 for(const s of [cancelBooking(ready(),id,A.staff,at),ready()]){
  const next=event(s,'paid',{},late);assert.equal(next.emails[0].kind,'review');assert.equal(next.bookings[0].paidMinor,10000);
  assert.match(next.emails[0].text,/not a booking confirmation/);
 }
 const cancelled=cancelBooking(paid(),id,A.staff,at);assert.equal(cancelled.bookings[0].refundedMinor,0);assert.equal(paymentSummary(cancelled.bookings[0]).operatorDueMinor,0);
 assert.throws(()=>startCheckout(cancelled,id,A.customer,at));
});
test('refund pending reserves amount; failures release it; success is idempotent',()=>{
 let s=paid();s=simulateRefund(s,id,A.staff,{reference:'r1',amountMinor:6000,result:'pending'},at);
 assert.equal(s.bookings[0].refundedMinor,0);assert.equal(s.emails.length,1);
 assert.throws(()=>simulateRefund(s,id,A.staff,{reference:'r2',amountMinor:5000,result:'pending'},at));
 s=simulateRefund(s,id,A.staff,{reference:'r1',amountMinor:6000,result:'failed'},at);
 s=simulateRefund(s,id,A.staff,{reference:'r2',amountMinor:10000,result:'succeeded'},at);
 s=simulateRefund(s,id,A.staff,{reference:'r2',amountMinor:10000,result:'succeeded'},at);
 assert.equal(s.bookings[0].refundedMinor,10000);assert.equal(s.bookings[0].paymentStatus,'refunded');assert.equal(s.emails.length,2);
 assert.equal(s.bookings[0].receipts[0].amountMinor,10000);assert.equal(s.bookings[0].operatorBalanceMinor,40000);
 assert.throws(()=>simulateRefund(s,id,A.staff,{reference:'r3',amountMinor:1,result:'succeeded'},at));
});
test('partial refunds preserve original payment and trigger active-booking review',()=>{
 const s=simulateRefund(paid(),id,A.staff,{reference:'part',amountMinor:2500,result:'succeeded'},at),summary=paymentSummary(s.bookings[0]);
 assert.equal(summary.netCollectedMinor,7500);assert.equal(summary.operatorDueMinor,40000);assert.equal(summary.review,true);
 assert.equal(s.bookings[0].paymentStatus,'partially refunded');
});
test('operator partial collections cannot over-collect or reuse changed receipt',()=>{
 let s=paid();const receipt={reference:'op1',amountMinor:15000,method:'cash'};s=recordCollection(s,id,A.operator,receipt,at);s=recordCollection(s,id,A.operator,receipt,at);
 assert.equal(s.bookings[0].collectedMinor,15000);assert.equal(paymentSummary(s.bookings[0]).operatorDueMinor,25000);
 assert.throws(()=>recordCollection(s,id,A.operator,{...receipt,amountMinor:10000},at));
 assert.throws(()=>recordCollection(s,id,A.operator,{...receipt,reference:'op2',amountMinor:25001},at));
 s=recordCollection(s,id,A.operator,{...receipt,reference:'op2',amountMinor:25000},at);assert.equal(paymentSummary(s.bookings[0]).operatorDueMinor,0);
 assert.equal(s.bookings[0].paidMinor,10000);
});
test('completion never marks operator balance paid; later collection remains possible',()=>{
 let s=completeBooking(paid(),id,A.operator,at);assert.equal(paymentSummary(s.bookings[0]).operatorDueMinor,40000);
 s=recordCollection(s,id,A.operator,{reference:'later',amountMinor:40000,method:'cash'},at);assert.equal(paymentSummary(s.bookings[0]).operatorDueMinor,0);
});
test('unpaid, cancelled, refunded or disputed bookings block ordinary collection',()=>{
 const cases=[ready(),cancelBooking(paid(),id,A.staff,at),simulateDispute(paid(),id,A.staff,at),simulateRefund(paid(),id,A.staff,{reference:'r',amountMinor:100,result:'succeeded'},at)];
 for(const s of cases)assert.throws(()=>recordCollection(s,id,A.operator,{reference:'r',amountMinor:40000,method:'cash'},at));
});
test('saved rehearsal restores financial history without generating another email',()=>{
 const s=JSON.parse(JSON.stringify(paid()));assert.equal(s.bookings[0].paidMinor,10000);assert.equal(s.emails.length,1);
 assert.equal(viewBookings(s,A.customer)[0].receipts.length,1);
});
test('zero, negative and fractional-cents refunds and collections are rejected',()=>{
 for(const amountMinor of [0,-1,1.5,NaN,Infinity,'100']){
  assert.throws(()=>simulateRefund(paid(),id,A.staff,{reference:'r',amountMinor,result:'succeeded'},at));
  assert.throws(()=>recordCollection(paid(),id,A.operator,{reference:'r',amountMinor,method:'cash'},at));
 }
});
test('email distinguishes full price, commission, operator balance and no automatic charge',()=>{
 const b=paid().bookings[0];const message=paymentNotification({booking:b,kind:'payment',amountMinor:10000,reference:'sample',sample:true});
 for(const text of ['20%, included in the total','We will not automatically charge','Costa Rica time','Cancellation terms','info@ticowild.com','https://ticowild.com/my/'])assert.ok(message.text.includes(text));
});
test('USD entry rejects hidden rounding and invalid amounts',()=>{
 assert.equal(parseSampleUsd('12.34'),1234);assert.equal(parseSampleUsd('12.3'),1230);
 for(const input of ['', '-1', '1.005', '1e3', 'Infinity','0'])assert.throws(()=>parseSampleUsd(input));
});
test('full cancellation refund clears deposit review but retains operator-money review',()=>{
 let s=cancelBooking(paid(),id,A.staff,at);s=simulateRefund(s,id,A.staff,{reference:'all',amountMinor:10000,result:'succeeded'},at);
 assert.equal(paymentSummary(s.bookings[0]).review,false);
 let withCollection=recordCollection(paid(),id,A.operator,{reference:'cash',amountMinor:10000,method:'cash'},at);
 withCollection=cancelBooking(withCollection,id,A.staff,at);withCollection=simulateRefund(withCollection,id,A.staff,{reference:'all',amountMinor:10000,result:'succeeded'},at);
 assert.equal(paymentSummary(withCollection.bookings[0]).review,true);assert.match(withCollection.bookings[0].exceptions[0],/Operator-collected/);
});
test('pending refunds block operator collection and appear in review',()=>{
 const s=simulateRefund(paid(),id,A.staff,{reference:'pending',amountMinor:10000,result:'pending'},at);
 assert.equal(paymentSummary(s.bookings[0]).review,true);
 assert.throws(()=>recordCollection(s,id,A.operator,{reference:'cash',amountMinor:40000,method:'cash'},at));
});
console.log(`${checks} payment rehearsal scenario groups passed. Simulation only; no provider, database or inbox was contacted.`);
