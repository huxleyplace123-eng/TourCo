import {validPoint} from '../portal/meeting-point.js';
export function operatorMeetingFields(operator) {
 const point=operator?.meetingPoint||{name:operator?.meeting_point_name,lat:operator?.meeting_point_lat,lng:operator?.meeting_point_lng,instructions:operator?.meeting_instructions};
 return {meeting_point_name:point?.name||'',meeting_point_lat:validPoint(point)?Number(point.lat):'',meeting_point_lng:validPoint(point)?Number(point.lng):'',meeting_instructions:point?.instructions||''};
}
export function validateMeetingFields(booking){
 const lat=booking.meeting_point_lat,lng=booking.meeting_point_lng;
 const blank=x=>x==null||String(x).trim()==='';
 if(blank(lat)&&blank(lng))return;
 if(!validPoint({lat,lng}))throw new Error('Each meeting pin needs valid latitude and longitude, or leave both blank.');
}
