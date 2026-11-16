import {costaRicaDate,journeyBookings,minutesOfDay} from '../portal/journey-model.js';
import {validPoint} from '../portal/meeting-point.js';
export function journeyStage(trip,now=new Date()){
 if(trip.status==='Cancelled')return {title:'Your trip is cancelled',detail:'Your records remain available. Contact the team about next steps.'};
 if(trip.status==='Completed')return {title:'How did your trip go?',detail:'Share feedback about your completed activities. The team can follow up on anything unresolved.'};
 const rows=journeyBookings(trip).filter(b=>!['Cancelled','Declined','Completed'].includes(b.status));
 const today=costaRicaDate(now),todays=rows.filter(b=>b.date===today&&b.status==='Confirmed');
 if(todays.length)return {title:'Your adventure day',detail:`${todays.length} confirmed ${todays.length===1?'activity':'activities'} today. Review your latest meeting instructions before leaving.`};
 const waiting=rows.filter(b=>b.status!=='Confirmed').length;
 if(waiting||!rows.length)return {title:'We’re coordinating your trip',detail:waiting?`${waiting} ${waiting===1?'activity is':'activities are'} waiting for confirmation. Your concierge can explain what is still pending.`:'Your itinerary will appear here once the team publishes it.'};
 return {title:'Get ready for your trip',detail:'Review meeting details, what to bring, and any requirements with the team.'};
}
export function bookingReadiness(b){
 return [!b.operator_id&&'Operator assignment',minutesOfDay(b.time)===null&&'Start time',
 !validPoint(b.meetingPoint||{lat:b.meeting_point_lat,lng:b.meeting_point_lng})&&'Meeting pin',
 !(b.meeting_instructions||b.meetingPoint?.instructions||'').trim()&&'Arrival instructions',
 !(b.bring||'').trim()&&'Preparation notes'].filter(Boolean);
}
export function preparationQueue(trips,now=new Date()){
 const today=costaRicaDate(now);
 return trips.filter(t=>!['Cancelled','Completed'].includes(t.status)).flatMap(trip=>(trip.bookings||[]).filter(b=>b.date>=today&&!['Cancelled','Declined','Completed'].includes(b.status)).map(booking=>({trip,booking,missing:bookingReadiness(booking),today:booking.date===today}))).sort((a,b)=>String(a.booking.date).localeCompare(String(b.booking.date))||String(a.booking.time).localeCompare(String(b.booking.time)));
}
export const feedbackQuestions=[['accuracy','Was the excursion as described?'],['instructions','Were meeting instructions clear?'],['prepared','Was the operator prepared and on time?'],['recommend','Would you recommend it?']];
export function completedActivities(trip){return trip?.status==='Cancelled'?[]:journeyBookings(trip).filter(b=>b.status==='Completed');}
export function activityFeedback(trip,bookingId,rating,answers,comments){
 const b=completedActivities(trip).find(b=>b.id===bookingId);if(!b)throw Error('Choose an activity marked completed by the team.');
 if(![1,2,3,4,5].includes(Number(rating)))throw Error('Choose a rating from 1 to 5.');
 for(const [key] of feedbackQuestions)if(!['Yes','Partly','No'].includes(answers[key]))throw Error('Answer each feedback question.');
 if(String(comments||'').trim().length<8||comments.length>1800)throw Error('Add 8–1,800 characters about your experience.');
 const needsFollowup=Number(rating)<=3||Object.values(answers).some(x=>x!=='Yes');
 return `[Trip request: ${needsFollowup?'Experience follow-up':'Experience feedback'}]\nTrip: ${trip.title} (${trip.id})\nActivity: ${b.name} (${b.id}) · ${b.date}\nRating: ${rating}/5\n${feedbackQuestions.map(([k,q])=>`${q} ${answers[k]}`).join('\n')}\n\n${comments.trim()}\n\nPrivate feedback about a completed activity. Please respond here; this is not a public review.`;
}
