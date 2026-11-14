import {validateMeetingFields} from './booking-meeting-point.js';
import {validCalendarDate} from '../portal/calendar.js';
export function tripDraft(customer,existing) {
  if(existing)return {...existing,bookings:existing.bookings.map(x=>({...x}))};
  return {request_id:crypto.randomUUID(),title:`${customer.name || 'Your'} Costa Rica trip`,region:customer.region||'',start_date:customer.travelStart||'',end_date:customer.travelEnd||'',travelers:Math.max(1,parseInt(customer.travelers)||1),status:'Planning',bookings:(customer.quoteItems||[]).map(x=>({id:crypto.randomUUID(),name:x.name||x.title||x.activity||'Experience',operator:x.operator||'',date:customer.travelStart||'',time:'',meet:'',bring:'',status:'Requested'}))};
}
export function validateTrip(trip) {
  if(!trip.title?.trim())throw new Error('Enter a trip title.');
  if(!validCalendarDate(trip.start_date)||!validCalendarDate(trip.end_date)||trip.end_date<trip.start_date)throw new Error('Enter valid trip dates in order.');
  if(!Number.isInteger(Number(trip.travelers))||trip.travelers<1||trip.travelers>100)throw new Error('Enter 1 to 100 travelers.');
  for(const b of trip.bookings){validateMeetingFields(b);if(!b.name?.trim()||!validCalendarDate(b.date)||b.date<trip.start_date||b.date>trip.end_date)throw new Error('Each activity needs a name and date within the trip.');}
  return trip;
}
export function needsReply(messages,userId) { const last=messages.filter(x=>x.user_id===userId).at(-1);return last?.from==='customer'; }

export function bookingsNeedingAssignment(trips,operators){
 const eligible=new Set(operators.map(o=>o.id));
 return trips.filter(t=>!['Cancelled','Completed'].includes(t.status)).flatMap(trip=>(trip.bookings||[]).filter(b=>!['Cancelled','Completed','Declined'].includes(b.status)&&(!b.operator_id||!eligible.has(b.operator_id))).map(booking=>({trip,booking,reason:booking.operator_id?'Assigned operator unavailable':'No operator assigned'})));
}
