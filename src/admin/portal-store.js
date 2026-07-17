// Operator PORTAL data — the shared layer the operator writes from their portal
// and the TicoWild team reads inside the CRM (and vice-versa for messages).
// Prototype: one localStorage blob keyed by operator id. On the real backend
// this becomes per-operator rows with row-level security; the shape stays.

const PORTAL_KEY = "ticowild_portal_v1";

export function loadPortalAll() {
  try {
    const raw = localStorage.getItem(PORTAL_KEY);
    const p = raw ? JSON.parse(raw) : {};
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

export function savePortalAll(all) {
  localStorage.setItem(PORTAL_KEY, JSON.stringify(all));
}

// One operator's portal record, with sane empty defaults.
export function loadPortal(opId) {
  const all = loadPortalAll();
  const p = all[opId] || {};
  return {
    availability: p.availability || {},   // { "YYYY-MM-DD": "open" | "full" }
    messages: p.messages || [],           // [{ id, from: "operator"|"team", text, at }]
    agreement: p.agreement || { status: "Not sent" }, // status, signedName, signedAt
    bookingResponses: p.bookingResponses || {},        // { bookingId: "accepted"|"declined" }
    profile: p.profile || {},             // operator-editable overrides: name, phone, whatsapp, email, website, logo, blurb
  };
}

export function patchPortal(opId, patch) {
  const all = loadPortalAll();
  all[opId] = { ...loadPortal(opId), ...all[opId], ...patch };
  savePortalAll(all);
  return all[opId];
}

const mkId = () => `m_${Math.random().toString(36).slice(2, 9)}`;

export function addMessage(opId, from, text) {
  const rec = loadPortal(opId);
  const messages = [...rec.messages, { id: mkId(), from, text, at: new Date().toISOString() }];
  patchPortal(opId, { messages });
  return messages;
}

export function setDayAvailability(opId, isoDate, status) {
  const rec = loadPortal(opId);
  const availability = { ...rec.availability };
  if (!status) delete availability[isoDate];
  else availability[isoDate] = status;
  patchPortal(opId, { availability });
  return availability;
}

// The operator's effective contact card = their portal edits layered over the
// seed record from the CRM. Their portal edits always win.
export function effectiveProfile(op, portalProfile = {}) {
  return {
    name: portalProfile.name || op.name,
    phone: portalProfile.phone ?? op.phone ?? "",
    whatsapp: portalProfile.whatsapp ?? op.whatsapp ?? "",
    email: portalProfile.email ?? op.email ?? "",
    website: portalProfile.website ?? op.website ?? "",
    blurb: portalProfile.blurb ?? "",
    logo: portalProfile.logo || "",
  };
}

// ── Sample assigned bookings ──────────────────────────────────────────────────
// Deterministic per operator so the prototype's "Today" tab always has content
// and never reshuffles on reload. On the backend these are the real TicoWild
// bookings assigned to this operator. Guest contact is a MASKED proxy number.
const GUESTS = ["Sarah", "The Bakker family", "Diego", "Emma", "The Hendersons", "Lucía", "Mark & Kevin", "Anna", "Priya", "Tomás"];

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

const p2 = (n) => String(n).padStart(2, "0");
const isoIn = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };

export function sampleBookings(op, tours = []) {
  const rnd = seedFrom(op.id || op.name || "x");
  const n = 2 + Math.floor(rnd() * 2); // 2–3 bookings
  const times = ["7:30 AM", "8:00 AM", "9:00 AM", "1:00 PM", "2:30 PM"];
  const out = [];
  for (let i = 0; i < n; i++) {
    const tour = tours.length ? tours[Math.floor(rnd() * tours.length)] : null;
    const pax = 2 + Math.floor(rnd() * 5);
    const masked = `+506 6•• •• ${1000 + Math.floor(rnd() * 8999)}`;
    out.push({
      id: `bk_${op.id}_${i}`,
      guest: GUESTS[Math.floor(rnd() * GUESTS.length)],
      pax,
      date: isoIn(1 + Math.floor(rnd() * 21)),
      time: times[Math.floor(rnd() * times.length)],
      tour: tour ? tour.product : "Custom tour",
      pickup: ["Hotel lobby pickup", "Meet at operator base", "Beach entrance", "Hotel front desk"][Math.floor(rnd() * 4)],
      maskedPhone: masked,
      operatorNet: tour ? (tour.suggestedOperatorNet ?? tour.resident ?? tour.retail ?? 0) * pax : 0,
      pending: i === 0, // first one is a pending request to Accept/Decline
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
