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
    pickup: b.meet || 'Pickup details pending',
    maskedPhone: 'Contact TicoWild for guest coordination', operatorNet: null,
    pending: b.status === 'Requested', status: b.status,
    response: b.status === 'Confirmed' ? 'accepted' : b.status === 'Declined' ? 'declined' : null,
  };
}
