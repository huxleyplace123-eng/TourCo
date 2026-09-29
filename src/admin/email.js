// Keep CRM email actions pinned to the business inbox instead of whichever
// personal Gmail account happens to be active in the browser.
export const TICO_GMAIL = String(
  import.meta.env.VITE_TICOWILD_GMAIL || "ticowildtours@gmail.com",
).trim();

export function gmailComposeHref({ to = "", bcc = "", subject = "", body = "" } = {}) {
  const params = new URLSearchParams({
    authuser: TICO_GMAIL,
    view: "cm",
    fs: "1",
  });
  if (to) params.set("to", to);
  if (bcc) params.set("bcc", bcc);
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}
