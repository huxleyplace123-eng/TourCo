import {supabase, withTimeout} from '../portal/supabase.js';
import {partnerBooking} from './booking-model.js';

export async function loadOperatorBookings(operatorId) {
  const {data,error}=await withTimeout(supabase.from('bookings').select('*').eq('operator_id',operatorId).order('date'),12000,'Operator bookings');
  if(error)throw error;
  return (data||[]).map(partnerBooking);
}
export async function respondToBooking(id,response) {
  const {data,error}=await withTimeout(supabase.rpc('respond_operator_booking',{booking_id:id,response}),15000,'Booking response');
  if(error)throw error;
  return partnerBooking(data);
}
