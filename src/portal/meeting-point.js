export function validPoint(point) {
  if (point?.lat == null || point?.lng == null || String(point.lat).trim() === '' || String(point.lng).trim() === '') return false;
  const lat=Number(point.lat), lng=Number(point.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat)<=90 && Math.abs(lng)<=180;
}
