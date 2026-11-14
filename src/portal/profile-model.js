// Only editable traveler fields may be written; identity comes from auth.
export function profilePayload(profile, user) {
  const next = { id:user.id, email:user.email };
  for (const [key, max] of Object.entries({name:120,phone:50,country:100,travelers:3,notes:5000})) {
    next[key] = String(profile[key] ?? '').trim();
    if (next[key].length > max) throw new Error(`${key} is too long.`);
  }
  if (next.travelers && (!/^\d+$/.test(next.travelers) || Number(next.travelers) < 1 || Number(next.travelers) > 100)) throw new Error('Enter between 1 and 100 travelers.');
  return next;
}
