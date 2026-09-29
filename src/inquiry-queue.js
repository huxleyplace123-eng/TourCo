const KEY = "ticowild_inquiry_outbox_v1";

const read = () => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

// A browser-local safety net for deployments where the live inquiry database
// is temporarily unavailable. The public form still opens its email fallback,
// while the CRM on the same device can recover the structured lead later.
export function queueInquiry(inquiry) {
  const queued = read();
  const fingerprint = `${String(inquiry.email || "").trim().toLowerCase()}|${inquiry.arrival || ""}|${String(inquiry.activity_titles || [])}`;
  if (queued.some((item) => item.fingerprint === fingerprint)) return;
  queued.push({ ...inquiry, queueId: crypto.randomUUID(), fingerprint, queuedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(queued.slice(-50)));
}

export function takeQueuedInquiries() {
  const queued = read();
  if (queued.length) localStorage.removeItem(KEY);
  return queued;
}
