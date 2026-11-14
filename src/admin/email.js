// Sign in to Outlook with the business mailbox; compose links do not set From.
export const TICO_EMAIL = "info@ticowild.com";
export function businessComposeHref({ to = "", bcc = "", subject = "", body = "" } = {}) {
  const params = new URLSearchParams();
  if (to) params.set("to", to);
  if (bcc) params.set("bcc", bcc);
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}
