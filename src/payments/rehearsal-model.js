// ISOLATED REHEARSAL ONLY. This state machine is not a production payment server.
// Role arguments and simulated events below are test fixtures, not authentication.
// No fetch, real Stripe API, email sending or production database writes occur here.
import {splitExcursionTotal, matchesPaidDeposit} from './deposit-model.js';
import {paymentNotification} from './payment-notification.js';

export const ACTORS = Object.freeze({customer:'customer-demo', staff:'staff-demo', operator:'operator-demo', otherOperator:'operator-two', otherCustomer:'customer-other'});
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const validTime = at => requireThat(typeof at === 'string' && Number.isFinite(Date.parse(at)), 'A valid event time is required.');
const staffOnly = actor => requireThat(actor === ACTORS.staff, 'Only staff can perform this action.');
const minor = amount => requireThat(Number.isSafeInteger(amount) && amount > 0, 'Enter a positive whole number of cents.');
const find = (state, id) => { const b = state.bookings.find(x => x.id === id); requireThat(b, 'Booking not found.'); return b; };
function log(state, bookingId, action, actor, at, detail = '') { state.audit.push({bookingId, action, actor, at, detail}); }
function clone(state) { return structuredClone(state); }
function enqueue(state, b, kind, amountMinor, reference, at) {
  const id = `${kind}:${reference}`;
  if (state.emails.some(x => x.id === id)) return;
  state.emails.push({id, bookingId:b.id, to:b.customerEmail, kind, status:'queued', attempts:0, at,
    ...paymentNotification({booking:b, kind, amountMinor, reference, sample:true})});
}

export function newRehearsal() {
  const common = {customerId:ACTORS.customer, customerName:'Alex Sample', customerEmail:'alex@example.test',
    currency:'usd', travelers:2, time:'09:00', bring:'Water, sunscreen and comfortable shoes',
    cancellationPolicy:'Sample only: cancellations require staff review under the accepted policy.',
    termsVersion:'sample-policy-v1', termsAccepted:false, status:'Requested', priceApproved:false,
    paymentStatus:'unpaid', paidMinor:0, refundedMinor:0, collectedMinor:0, session:null, attempts:[],
    receipts:[], refunds:[], collections:[], dispute:'none', exceptions:[]};
  return {version:1, bookings:[
    {...structuredClone(common), ...splitExcursionTotal(50000,'usd'), id:'sample-1', reference:'SAMPLE-1001',
      name:'Rainforest discovery', operatorId:ACTORS.operator, operatorName:'Sample Rainforest Tours',
      date:'2026-12-15', meetingPoint:'Sample visitor center — not a real pickup', collectionMethods:'USD cash (sample policy)'},
    {...structuredClone(common), ...splitExcursionTotal(30000,'usd'), id:'sample-2', reference:'SAMPLE-1002',
      name:'Sunset wildlife cruise', operatorId:ACTORS.otherOperator, operatorName:'Sample Coastal Adventures',
      date:'2026-12-16', meetingPoint:'Sample marina — not a real pickup', collectionMethods:'Card or USD cash (sample policy)'},
  ], emails:[], events:[], audit:[]};
}

export function viewBookings(state, actor) {
  return clone(state.bookings.filter(b => actor === ACTORS.staff || b.customerId === actor || b.operatorId === actor));
}

export function prepareBooking(state, id, actor, at) {
  staffOnly(actor); validTime(at); const next=clone(state), b=find(next,id);
  requireThat(b.status === 'Requested', 'Only a requested booking can be approved.');
  b.priceApproved=true; b.holdUntil=new Date(Date.parse(at)+86400000).toISOString();
  log(next,id,'Price approved; 24-hour sample hold',actor,at); return next;
}
export function acceptBooking(state, id, actor, at) {
  validTime(at); const next=clone(state), b=find(next,id);
  requireThat(actor === b.operatorId, 'Only the assigned operator can accept.');
  requireThat(b.status === 'Requested' && b.priceApproved, 'Staff must approve the price first.');
  b.status='Confirmed'; log(next,id,'Operator accepted',actor,at); return next;
}
export function acceptTerms(state,id,actor,at) {
  validTime(at);const next=clone(state),b=find(next,id);
  requireThat(actor===b.customerId,'Sign in as the booking customer.');
  b.termsAccepted=true;b.termsAcceptedAt=at;log(next,id,'Sample terms accepted',actor,at,b.termsVersion);return next;
}
export function startCheckout(state,id,actor,at) {
  validTime(at);const next=clone(state),b=find(next,id);
  requireThat(actor===b.customerId,'Sign in as the booking customer.');
  requireThat(b.priceApproved && b.status==='Confirmed','An approved price and operator acceptance are required.');
  requireThat(b.termsAccepted,'Accept the sample booking and cancellation terms first.');
  requireThat(Date.parse(at)<Date.parse(b.holdUntil),'The booking hold expired. Ask staff to reconfirm availability.');
  requireThat(b.paidMinor===0 && b.dispute==='none','This booking already has a payment or payment review.');
  if (b.session && ['open','processing'].includes(b.session.status)) return next;
  const idKey=`sample-session-${id}-${b.attempts.length+1}`;
  b.session={id:idKey, status:'open', amount_total:b.depositMinor, currency:b.currency, mode:'payment',livemode:false};
  b.attempts.push({...b.session, at}); b.paymentStatus='unpaid';
  log(next,id,'Sample checkout opened',actor,at);return next;
}

// Events are explicitly simulated by the rehearsal controls. Production requires
// signed webhooks + canonical Stripe retrieval + DB transaction/unique constraints.
export function simulateProviderEvent(state,id,event,at) {
  validTime(at);requireThat(typeof event.id==='string' && event.id.length>0,'Event ID required.');
  const next=clone(state),b=find(next,id);
  if (next.events.includes(event.id)) return next;
  requireThat(b.session,'Open a sample checkout first.');
  const attempt=b.attempts.find(x=>x.id===event.sessionId);
  requireThat(attempt,'Event does not match a known checkout.');
  requireThat(['processing','failed','expired','paid'].includes(event.type),'Unknown sample event.');
  if(event.type==='paid') {
    const session={...attempt,payment_status:'paid',amount_total:event.amountMinor,currency:event.currency,livemode:event.livemode};
    requireThat(matchesPaidDeposit(session,{checkoutSessionId:attempt.id,depositMinor:b.depositMinor,currency:b.currency,livemode:false}),'Payment amount, currency or environment does not match.');
    if(!b.receipts.some(x=>x.sessionId===attempt.id)) {
      const duplicate=b.paidMinor>0;
      b.paidMinor+=b.depositMinor;attempt.status='paid';b.session.status='paid';b.paymentStatus='paid';
      const receipt={reference:`SAMPLE-RECEIPT-${b.id}-${b.receipts.length+1}`, sessionId:attempt.id, amountMinor:b.depositMinor, at};b.receipts.push(receipt);
      const needsReview=duplicate||b.status!=='Confirmed'||Date.parse(at)>=Date.parse(b.holdUntil);
      if(duplicate)b.exceptions.push('More than one checkout was paid; duplicate-charge refund review required.');
      else if(needsReview)b.exceptions.push('Payment arrived after cancellation or hold expiry; review/refund required.');
      enqueue(next,b,needsReview?'review':'payment',b.depositMinor,receipt.reference,at);
    }
  } else if(b.paidMinor===0) {
    // Do not let a delayed failure/expiry overwrite an already verified payment.
    attempt.status=event.type;
    if(b.session.id===attempt.id){b.session.status=event.type;b.paymentStatus=event.type==='processing'?'processing':event.type;}
  }
  next.events.push(event.id);log(next,id,`Simulated provider: ${event.type}`,'simulator',at);return next;
}
export function cancelBooking(state,id,actor,at) {
  staffOnly(actor);validTime(at);const next=clone(state),b=find(next,id);
  requireThat(b.status!=='Completed','Completed excursions require staff adjustment review.');
  b.status='Cancelled'; if(b.session && b.session.status!=='paid')b.session.status='expired';
  if(b.paidMinor>b.refundedMinor && !b.exceptions.includes('Cancellation refund review required.'))b.exceptions.push('Cancellation refund review required.');
  if(b.collectedMinor>0 && !b.exceptions.includes('Operator-collected funds require separate refund review.'))b.exceptions.push('Operator-collected funds require separate refund review.');
  log(next,id,'Booking cancelled; no automatic refund',actor,at);return next;
}
export function simulateRefund(state,id,actor,{reference,amountMinor,result},at) {
  staffOnly(actor);validTime(at);minor(amountMinor);const next=clone(state),b=find(next,id);
  requireThat(typeof reference==='string' && reference.length>0,'Refund reference required.');
  requireThat(['pending','failed','succeeded'].includes(result),'Invalid refund result.');
  const previous=b.refunds.find(x=>x.reference===reference);
  if(previous){requireThat(previous.amountMinor===amountMinor,'Refund amount cannot change.');if(previous.status==='succeeded')return next;}
  const reserved=b.refunds.filter(x=>x.reference!==reference && x.status==='pending').reduce((s,x)=>s+x.amountMinor,0);
  requireThat(amountMinor<=b.paidMinor-b.refundedMinor-reserved,'Refund exceeds the unreserved payment.');
  const record=previous||{reference,amountMinor};record.status=result;record.at=at;if(!previous)b.refunds.push(record);
  if(result==='succeeded'){
    b.refundedMinor+=amountMinor;b.paymentStatus=b.refundedMinor===b.paidMinor?'refunded':'partially refunded';
    if(b.refundedMinor===b.paidMinor)b.exceptions=b.exceptions.filter(x=>!['Cancellation refund review required.','Payment arrived after cancellation or hold expiry; review/refund required.','More than one checkout was paid; duplicate-charge refund review required.'].includes(x));
    enqueue(next,b,'refund',amountMinor,reference,at);
  }
  log(next,id,`Sample refund ${result}`,actor,at);return next;
}
export function recordCollection(state,id,actor,{reference,amountMinor,method},at) {
  validTime(at);minor(amountMinor);const next=clone(state),b=find(next,id);
  requireThat(actor===b.operatorId,'Only the assigned operator can record collection.');
  requireThat(['Confirmed','Completed'].includes(b.status) && b.paidMinor===b.depositMinor && b.refundedMinor===0 && b.dispute==='none' && b.exceptions.length===0 && !b.refunds.some(x=>x.status!=='succeeded'),'Collection requires an active booking with a paid deposit and no financial review.');
  requireThat(typeof reference==='string'&&reference.trim()&&typeof method==='string'&&method.trim(),'Receipt reference and method required.');
  const previous=b.collections.find(x=>x.reference===reference);
  if(previous){requireThat(previous.amountMinor===amountMinor&&previous.method===method,'Collection reference already used with different details.');return next;}
  requireThat(amountMinor<=b.operatorBalanceMinor-b.collectedMinor,'Collection exceeds the remaining operator balance.');
  b.collections.push({reference,amountMinor,method,at,actor});b.collectedMinor+=amountMinor;
  log(next,id,'Operator reported collection',actor,at);return next;
}
export function completeBooking(state,id,actor,at) {
  validTime(at);const next=clone(state),b=find(next,id);requireThat(actor===b.operatorId,'Only the assigned operator can complete.');
  requireThat(b.status==='Confirmed','Only an active confirmed excursion can be completed.');
  b.status='Completed';log(next,id,'Excursion completed; payment balances unchanged',actor,at);return next;
}
export function simulateDispute(state,id,actor,at) {
  staffOnly(actor);validTime(at);const next=clone(state),b=find(next,id);requireThat(b.paidMinor>0,'No payment to dispute.');
  b.dispute='open';log(next,id,'Sample dispute opened',actor,at);return next;
}
export function simulateEmailDelivery(state,emailId,actor,result,at) {
  staffOnly(actor);validTime(at);requireThat(['failed','accepted','delivered'].includes(result),'Invalid email result.');
  const next=clone(state),email=next.emails.find(x=>x.id===emailId);requireThat(email,'Email not found.');
  if(email.status==='delivered')return next;
  email.attempts+=1;email.status=result;email.lastAttemptAt=at;
  log(next,email.bookingId,`Sample email ${result}`,actor,at);return next;
}
export function paymentSummary(b) {
  return {totalMinor:b.totalMinor,paidMinor:b.paidMinor,refundedMinor:b.refundedMinor,
    netCollectedMinor:b.paidMinor-b.refundedMinor,operatorCollectedMinor:b.collectedMinor,
    operatorDueMinor:b.status==='Cancelled'?0:b.operatorBalanceMinor-b.collectedMinor,
    review:b.exceptions.length>0||b.dispute!=='none'||b.refunds.some(x=>x.status==='pending')||(b.refundedMinor>0&&b.status!=='Cancelled')};
}
