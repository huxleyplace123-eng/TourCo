export function customerFingerprint(customer) {
  const email = String(customer?.email || '').trim().toLowerCase();
  return email ? `${email}|${customer?.travelStart || ''}` : `id:${customer?.id || ''}`;
}

// A repeat request is new information, not a duplicate to silently discard.
export function mergeInquiries(customers, incoming) {
  const records = new Map(customers.map(item => [item.id, item]));
  const byTrip = new Map(customers.map(item => [customerFingerprint(item), item.id]));
  const changed = new Map();
  for (const request of incoming) {
    const fingerprint = customerFingerprint(request);
    const id = byTrip.get(fingerprint) || request.id;
    const existing = records.get(id);
    if (!existing) {
      records.set(id, request); byTrip.set(fingerprint, id); changed.set(id, request);
      continue;
    }
    if (existing.inquiryId === request.inquiryId || (existing.notes || []).some(note => note.id === `inquiry_${request.inquiryId}`)) continue;
    const text = ['Additional website request', `Name: ${request.name}`, `Email: ${request.email}`, `Phone: ${request.phone || 'Not supplied'}`, `Dates: ${request.travelStart || 'Not supplied'} to ${request.travelEnd || 'Not supplied'}`, `Travelers: ${request.travelers || 'Not supplied'}`, `Destination: ${request.region || 'Not supplied'}`, `Activities: ${request.activities || 'Not supplied'}`, ...(request.notes || []).map(note => note.text)].join('\n');
    const updated = { ...existing, notes: [...(existing.notes || []), { id:`inquiry_${request.inquiryId}`, at:request.createdAt, kind:'note', text }] };
    records.set(id, updated); changed.set(id, updated);
  }
  return { records:[...records.values()], changed:[...changed.values()] };
}
