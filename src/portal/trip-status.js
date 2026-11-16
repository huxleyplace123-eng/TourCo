export function tripPresentation(trip, bookings, until) {
  const cancelled = trip.status === 'Cancelled';
  const completed = trip.status === 'Completed';
  const active = bookings.filter(item => !['Cancelled', 'Declined'].includes(item.status));
  const confirmed = active.filter(item => item.status === 'Confirmed').length;
  const ready = active.length > 0 && confirmed === active.length;
  return {
    cancelled,
    heading: cancelled ? 'Cancelled trip' : completed ? 'Completed trip' : until < 0 ? 'Your trip' : 'Your upcoming trip',
    countdown: cancelled ? 'Cancelled' : completed ? 'Completed' : until > 0 ? until : until === 0 ? 'Today' : trip.status || 'Planning',
    countdownLabel: !cancelled && !completed && until > 0 ? 'days to go' : 'trip status',
    itineraryHeading: cancelled || completed || until < 0 ? 'Itinerary' : 'Upcoming itinerary',
    status: cancelled ? 'Trip cancelled' : completed ? 'Trip completed' : !active.length ? 'No activities scheduled' : ready ? 'Everything is confirmed' : `${confirmed} of ${active.length} experiences confirmed`,
    caption: cancelled ? 'This trip is cancelled. Contact your concierge if you need help.' : completed ? 'Your trip is complete. Your concierge is here if you need help.' : !active.length ? 'Your concierge has not scheduled any active experiences yet.' : ready ? 'You are ready to go.' : 'TicoWild is coordinating the remaining activities.',
    progress: cancelled || !active.length ? 0 : Math.round(confirmed / active.length * 100),
  };
}
