// Shared by the directory, editor and import path. Never replace an explicit WA number.
export function whatsappNumber(value) {
  const raw = String(value || "").trim();
  if (!raw || /[a-z]/i.test(raw)) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8) digits = `506${digits}`;
  else if (digits.length === 10) digits = `1${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : "";
}

export function resolveOperatorContacts(op) {
  const result = { ...op, ...(op.contactOverrides || {}) };
  // An explicitly cleared field stays clear; the default is only for unedited records.
  if (!Object.hasOwn(op.contactOverrides || {}, "whatsapp") && !result.whatsapp) {
    result.whatsapp = whatsappNumber(result.phone);
  }
  if (result.website && !/^https?:\/\//i.test(result.website)) {
    result.website = `https://${result.website}`;
  }
  return result;
}
