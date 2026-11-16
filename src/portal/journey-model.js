import {validCalendarDate} from './calendar.js';
import {validPoint} from './meeting-point.js';

export function costaRicaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value = type => parts.find(p=>p.type===type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function minutesOfDay(time) {
  const match=String(time||'').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if(!match)return null;
  let hours=Number(match[1]);const minutes=Number(match[2]);
  if(minutes>59||hours>(match[3]?12:23)||(match[3]&&hours<1))return null;
  if(match[3])hours=hours%12+(match[3].toUpperCase()==='PM'?12:0);
  return hours*60+minutes;
}
export const journeyBookings = trip => (trip?.days||[]).flatMap(day=>(day.items||[]).map(item=>({...item,date:day.date})));
const active = b => !['Cancelled','Declined','Completed'].includes(b.status);
export function nextAdventure(trip,now=new Date()) {
  if(!trip||['Cancelled','Completed'].includes(trip.status))return null;
  const today=costaRicaDate(now);
  const clock=new Intl.DateTimeFormat('en-US',{timeZone:'America/Costa_Rica',hourCycle:'h23',hour:'2-digit',minute:'2-digit'}).format(now);
  const current=minutesOfDay(clock);
  return journeyBookings(trip).filter(b=>b.status==='Confirmed'&&validCalendarDate(b.date)&&b.date>=today)
    .filter(b=>b.date!==today||minutesOfDay(b.time)===null||minutesOfDay(b.time)>=current)
    .sort((a,b)=>a.date.localeCompare(b.date)||(minutesOfDay(a.time)??1440)-(minutesOfDay(b.time)??1440))[0]||null;
}
export function journeyReadiness(trip,{profile=null,profileLoaded=false,names=[],namesLoaded=false,now=new Date()}={}) {
  if(trip?.status==='Cancelled')return [];
  const bookings=trip.status==='Completed'?[]:journeyBookings(trip).filter(b=>active(b)&&(!validCalendarDate(b.date)||b.date>=costaRicaDate(now)));
  return [
    {key:'operators',label:'Operator confirmations',state:bookings.length&&bookings.every(b=>b.status==='Confirmed')?'ready':'attention',detail:bookings.length?`${bookings.filter(b=>b.status==='Confirmed').length} of ${bookings.length} upcoming activities confirmed`:'No upcoming activities published',action:'message'},
    {key:'meetings',label:'Times and meeting points',state:bookings.length&&bookings.every(b=>minutesOfDay(b.time)!==null&&validPoint(b.meetingPoint))?'ready':'attention',detail:'A confirmed activity needs a published time and exact meeting pin.',action:'message'},
    {key:'profile',label:'Your contact details',state:!profileLoaded?'unknown':profile?.name?.trim()&&profile?.phone?.trim()?'ready':'attention',detail:!profileLoaded?'Contact details have not loaded.':'Check your name and reachable phone number.',action:'account'},
    {key:'travelers',label:'Traveler names',state:!namesLoaded?'unknown':names.filter(x=>String(x).trim()).length>=Number(trip.travelers||1)?'ready':'attention',detail:'Names are private account records. Send operator coordination needs to your concierge.',action:'travelers'},
    {key:'payment',label:'Payment and operator balance',state:'unknown',detail:'Online payment verification is not connected yet. Ask the team for your payment statement.',action:'message'},
    {key:'documents',label:'Waivers and activity requirements',state:'unknown',detail:'Ask which operator waivers, age limits or accessibility requirements apply. This checklist is not clearance to travel.',action:'message'},
  ];
}
export function feedbackEligible(trip,now=new Date()) {
  if(!trip||trip.status==='Cancelled')return false;
  return trip.status==='Completed'||journeyBookings(trip).some(b=>b.status==='Completed'||(b.status==='Confirmed'&&validCalendarDate(b.date)&&b.date<costaRicaDate(now)));
}

// Whitelist exported fields. Never serialize the trip/profile object: it may
// contain private identifiers, payment amounts, traveler names or conversations.
export function tripShareText(trip,{includeDates=true,includeMeetings=false,includePacking=false}={},now=new Date()) {
  const lines=['TicoWild itinerary copy',`Region: ${trip.region||'Costa Rica'}`,`Trip status: ${trip.status||'Planning'}`,
    `Saved ${costaRicaDate(now)} (Costa Rica date). This copy does not update automatically.`];
  if(includeDates)lines.push(`Trip dates: ${trip.start||'Pending'} to ${trip.end||'Pending'}`);
  if(trip.status==='Cancelled')lines.push('TRIP CANCELLED — do not use this copy for travel or admission.');
  for(const b of journeyBookings(trip)){
    lines.push('',b.name||'Experience',`Operator: ${b.operator||'To be confirmed'}`,`Status: ${trip.status==='Cancelled'?'Cancelled':b.status||'Requested'}`);
    if(includeDates)lines.push(`When: ${b.date||'Pending'} · ${b.time||'Time pending'} (Costa Rica time)`);
    if(includeMeetings&&trip.status!=='Cancelled'&&b.status==='Confirmed'){
      lines.push(`Meet: ${b.meetingPoint?.name||b.meet||'Confirm with TicoWild'}`);
      if(b.meetingPoint?.instructions)lines.push(`Instructions: ${b.meetingPoint.instructions}`);
      if(validPoint(b.meetingPoint))lines.push(`Map coordinates: ${Number(b.meetingPoint.lat)}, ${Number(b.meetingPoint.lng)}`);
    }
    if(includePacking&&trip.status!=='Cancelled'&&active(b))lines.push(`Bring: ${b.bring||'Confirm with TicoWild'}`);
  }
  lines.push('','Only confirmed, current arrangements should be used for travel. Ask TicoWild to verify any change.',
    'Support: info@ticowild.com · https://ticowild.com/my/',
    'This copy does not grant portal access or contain payment records, traveler profiles, private messages or booking-pass codes.');
  return lines.join('\n');
}
const escapeHtml = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function offlineTripPack(trip,now=new Date()) {
  const text=tripShareText(trip,{includeDates:true,includeMeetings:true,includePacking:true},now);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>TicoWild offline trip pack</title><style>body{font:16px/1.7 system-ui,sans-serif;max-width:780px;margin:40px auto;padding:0 22px;color:#173d32}h1{font-size:30px}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}.note{padding:16px;background:#fff4d3;border-radius:12px}@media print{body{margin:0}}</style></head><body><h1>Your TicoWild trip pack</h1><p class="note">Offline snapshot, not a live confirmation or admission pass. Download a fresh copy after changes. Meeting instructions may reveal your travel locations; keep this file private. For immediate danger, contact local emergency services; concierge messages are not emergency dispatch.</p><pre>${escapeHtml(text)}</pre><p>Payment records and confidential traveler information are deliberately excluded. Open the portal when online for current details. Use your browser’s Print option to save a PDF.</p></body></html>`;
}
const requestKinds=['General question','Pickup help','Change date or travelers','Weather alternatives','Cancellation request','Choose a proposed alternative'];
export {requestKinds};
export function journeyRequest(trip,{kind,bookingId='',details}) {
  if(!requestKinds.includes(kind))throw new Error('Choose a request type.');
  const text=String(details||'').trim();if(text.length<8||text.length>1800)throw new Error('Please add 8–1,800 characters describing your request.');
  const booking=bookingId?journeyBookings(trip).find(b=>b.id===bookingId):null;
  if(bookingId&&!booking)throw new Error('Choose an activity from this trip.');
  if(trip.status==='Cancelled'&&!['General question','Pickup help'].includes(kind))throw new Error('This trip is cancelled. Use General question to discuss next steps.');
  return `[Trip request: ${kind}]\nTrip: ${trip.title} (${trip.id})\n${booking?`Activity: ${booking.name} (${booking.id}) · ${booking.date} · ${booking.time}\n`:''}\n${text}\n\nPlease confirm availability, price differences and any refund/cancellation terms before changing my booking. This message is a request, not a confirmed change.`;
}
export function feedbackMessage(trip,rating,comments,now=new Date()) {
  if(!feedbackEligible(trip,now))throw new Error('Feedback opens after an activity date or when the trip is marked completed.');
  if(!Number.isInteger(Number(rating))||Number(rating)<1||Number(rating)>5)throw new Error('Choose a rating from 1 to 5.');
  const text=String(comments||'').trim();if(text.length<8||text.length>1800)throw new Error('Please add 8–1,800 characters about your experience.');
  return `[Private trip feedback]\nTrip: ${trip.title} (${trip.id})\nRating: ${rating}/5\n\n${text}\n\nPlease follow up with me here if anything needs attention. This is private feedback, not a public review.`;
}

// Answers use only the selected customer's loaded itinerary. No provider calls,
// external AI requests, invented availability, weather forecasts or price quotes.
export function ricoTripAnswer(question,trip,now=new Date()) {
  const q=String(question||'').toLowerCase().trim();
  if(!q)return 'Ask me about your next activity, meeting point, packing or booking status.';
  if(/emergency|danger|injur|hurt|ambulance/.test(q))return 'For immediate danger, contact local emergency services first. TicoWild messages are not emergency dispatch. Notify your concierge when it is safe to do so.';
  if(/pay|refund|deposit|balance|cost|invoice|receipt|commission/.test(q))return 'The standard arrangement is 20% to TicoWild and 80% directly to the operator. I cannot verify payments or your remaining balance from the current portal amounts. Ask your concierge for a verified statement, receipt or refund update.';
  if(trip.status==='Cancelled')return 'This trip is cancelled. Do not use its itinerary or meeting points for travel. Your concierge can help with refunds, a new plan or other questions.';
  if(/weather|rain|cancel|change|reschedul|alternative/.test(q))return 'I cannot confirm live weather, safety, availability or booking changes. Use Change requests to ask the team for alternatives or identify a proposal you prefer. Wait for their confirmation before traveling or paying a difference.';
  const next=nextAdventure(trip,now);
  if(/next|when|time|meet|pickup|where/.test(q))return next?`Your next published confirmed activity is ${next.name}, operated by ${next.operator}, on ${next.date} at ${next.time||'a time to confirm'} (Costa Rica time). Meeting point: ${next.meetingPoint?.name||next.meet||'not yet published'}. ${next.meetingPoint?.instructions||''} Check for updates before leaving.`:'There is no upcoming confirmed activity in this itinerary. Your concierge can confirm what is next; requested or cancelled activities are not reservations.';
  if(/pack|bring|wear/.test(q)){
    const notes=journeyBookings(trip).filter(active).map(b=>`${b.name}: ${b.bring||'Ask the operator what to bring.'}`);
    return notes.length?`Your published preparation notes:\n${notes.join('\n')}\nConfirm any activity-specific safety requirements with the operator.`:'No upcoming preparation notes are published. Ask your concierge what to bring.';
  }
  if(/confirm|status|book/.test(q))return `Trip status: ${trip.status||'Planning'}.\n${journeyBookings(trip).map(b=>`${b.name}: ${b.status||'Requested'}`).join('\n')}\nOperator confirmation and payment verification are separate.`;
  if(/contact|help|support/.test(q))return 'Use your private concierge conversation for booking support, or email info@ticowild.com. I do not have a verified operator phone number to provide. Response times depend on team availability.';
  return 'I can summarize the itinerary published in this portal, but I cannot confirm new availability or make changes. Ask about your next activity, meeting point, packing, status or payments—or send the question to your concierge.';
}
