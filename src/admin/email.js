// CRM mailbox workspace handles Microsoft authorization and sending.
export const TICO_EMAIL = "info@ticowild.com";
export function businessComposeHref({ to = "", bcc = "", subject = "", body = "" } = {}) {
  const params = new URLSearchParams({ workspace: "email" });
  if (to) params.set("to", to);
  if (bcc) params.set("bcc", bcc);
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `/admin/?${params.toString().replace(/\+/g, "%20")}`;
}
