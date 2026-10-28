// Operator PORTAL data — the shared layer the operator writes from their portal
// and the TicoWild team reads inside the CRM (and vice-versa for messages).
// Prototype: one localStorage blob keyed by operator id. On the real backend
// this becomes per-operator rows with row-level security; the shape stays.

const PORTAL_KEY = "ticowild_portal_v1";

// Explicit family suitability is intentionally independent from pricing. A
// child price can exist for many operational reasons and must never be used as
// a proxy for whether an experience is appropriate for children.
export const KID_SUITABILITY = Object.freeze({
  CONFIRMED: "confirmed",
  NOT_SUITABLE: "not_suitable",
  NEEDS_REVIEW: "needs_review",
});

export const KID_SUITABILITY_OPTIONS = Object.freeze([
  { value: KID_SUITABILITY.CONFIRMED, label: "Kid-friendly", shortLabel: "Confirmed" },
  { value: KID_SUITABILITY.NOT_SUITABLE, label: "Not kid-friendly", shortLabel: "Not suitable" },
  { value: KID_SUITABILITY.NEEDS_REVIEW, label: "Needs review", shortLabel: "Needs review" },
]);

export function normalizeKidSuitability(value) {
  if (value === true || value === "kid_friendly") return KID_SUITABILITY.CONFIRMED;
  if (value === false || value === "not_kid_friendly") return KID_SUITABILITY.NOT_SUITABLE;
  return Object.values(KID_SUITABILITY).includes(value) ? value : KID_SUITABILITY.NEEDS_REVIEW;
}

export function kidSuitabilityMeta(value) {
  const normalized = normalizeKidSuitability(value);
  return KID_SUITABILITY_OPTIONS.find((option) => option.value === normalized) || KID_SUITABILITY_OPTIONS[2];
}

const normalizeMinimumAge = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const age = Number(value);
  return Number.isFinite(age) && age >= 0 ? Math.round(age) : null;
};

// Builds the same tour catalog the operator sees: seed rows layered with local
// portal edits, plus operator-created tours. CRM uses this so review work is
// visible immediately instead of being stranded inside the partner portal.
export function mergePortalTours(seedTours, portalMap = loadPortalAll()) {
  const seeds = Array.isArray(seedTours) ? seedTours : [];
  const operatorNames = new Map(seeds.map((tour) => [tour.operatorId, tour.operator]));
  const mergedSeeds = seeds.flatMap((tour) => {
    const override = portalMap?.[tour.operatorId]?.tourOverrides?.[tour.id] || {};
    if (override.hidden) return [];
    const merged = { ...tour, ...override };
    return [{
      ...merged,
      kidSuitability: normalizeKidSuitability(merged.kidSuitability),
      minimumAge: normalizeMinimumAge(merged.minimumAge),
      familyNotes: String(merged.familyNotes || "").trim(),
    }];
  });
  const customTours = Object.entries(portalMap || {}).flatMap(([operatorId, portal]) =>
    (portal?.customTours || []).map((tour) => ({
      ...tour,
      operatorId,
      operator: tour.operator || operatorNames.get(operatorId) || "Operator-added tour",
      custom: true,
      kidSuitability: normalizeKidSuitability(tour.kidSuitability),
      minimumAge: normalizeMinimumAge(tour.minimumAge),
      familyNotes: String(tour.familyNotes || "").trim(),
      sourceLabel: tour.sourceLabel || "Operator portal",
    })),
  );
  return [...mergedSeeds, ...customTours];
}

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
    tourOverrides: p.tourOverrides || {}, // { [seedTourId]: { product?, retail?, hidden?, kidSuitability?, minimumAge?, familyNotes? } }
    customTours: p.customTours || [],     // [{ id, product, category, retail, duration, kidSuitability, minimumAge?, familyNotes? }]
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
