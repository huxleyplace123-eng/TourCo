export function upcomingPartnerBookings(bookings, responses, today) {
  return bookings.filter(b => b.date >= today && !['Cancelled','Declined','Completed'].includes(b.status) && responses[b.id] !== 'declined')
    .sort((a,b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)));
}

export function optionalCoordinate(value, limit) {
  if (value == null || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

export function partnerBooking(b) {
  return {
    id: b.id, guest: b.guest_name || 'Guest name pending',
    pax: b.guest_count ?? 'Pending', date: b.date,
    time: b.time || 'Time pending', tour: b.name || 'TicoWild experience',
    pickup: b.meet || b.meeting_point_name || 'Pickup details pending',
    meetingPoint:{name:b.meeting_point_name||'',lat:b.meeting_point_lat,lng:b.meeting_point_lng,instructions:b.meeting_instructions||''},
    maskedPhone: 'Contact TicoWild for guest coordination', operatorNet: null,
    pending: b.status === 'Requested', status: b.status,
    response: b.status === 'Confirmed' ? 'accepted' : b.status === 'Declined' ? 'declined' : null,
  };
}
