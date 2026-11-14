export function recipients(value) {
  const addresses = [...new Set(String(value || "").split(/[;,]/).map(x => x.trim()).filter(Boolean))];
  if (addresses.some(x => !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(x))) throw new Error("Enter valid email addresses, separated by commas.");
  return addresses.map(address => ({ emailAddress: { address } }));
}
export function outgoingMessage({ to, bcc, subject, body }) {
  const toRecipients = recipients(to), bccRecipients = recipients(bcc);
  if (!toRecipients.length && !bccRecipients.length) throw new Error("Add a recipient.");
  if (!subject.trim() || !body.trim()) throw new Error("Add a subject and message.");
  if (/{{[^}]+}}/.test(subject + body)) throw new Error("Replace all template placeholders before sending.");
  return { subject: subject.trim(), body: { contentType: "Text", content: body }, toRecipients, bccRecipients };
}
export function messageMatches(message, query) {
  const text = [message.subject, message.bodyPreview, message.from?.emailAddress?.address,
    ...(message.toRecipients || []).map(x => x.emailAddress?.address)].join(" ").toLowerCase();
  return text.includes(query.trim().toLowerCase());
}
