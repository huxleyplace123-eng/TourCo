// Do not turn extensions, multiple numbers or explanatory text into a different recipient.
export function whatsappDigits(value) {
  const raw = String(value || '').trim();
  if (!raw || !/^\+?[\d\s().-]+$/.test(raw)) return '';
  const digits = raw.replace(/\D/g, '').replace(/^00/, '');
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : '';
}
export function whatsappLink(value, text = '') {
  const digits = whatsappDigits(value);
  return digits ? `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
}
