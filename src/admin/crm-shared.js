// Shared CRM vocabulary used by BOTH workspaces (customers + operators), so a
// "🔥 Fire" lead and a vendor "type" mean the same thing and look the same
// everywhere. Pure data — no React — imported by store.js, operators-store.js
// and the two app views.

// ── Lead temperature ──────────────────────────────────────────────────────────
// A priority/heat axis that is INDEPENDENT of pipeline stage: a lead can be
// "In talks" and still be 🔥 Fire. Ordered cold → hot so we can sort by it.
export const TEMPERATURES = ["Cold", "Warm", "Hot", "Fire"];

export const TEMPERATURE_META = {
  Cold: { emoji: "🧊", color: "#7FA6E8", label: "Cold" },
  Warm: { emoji: "🌤️", color: "#22D3EE", label: "Warm" },
  Hot:  { emoji: "🔥", color: "#FFD000", label: "Hot" },
  Fire: { emoji: "🚀", color: "#FB7185", label: "Fire" },
};

export const tempRank = (t) => {
  const i = TEMPERATURES.indexOf(t);
  return i === -1 ? -1 : i;
};

// ── Operator / vendor type ────────────────────────────────────────────────────
// Light-touch categorization of WHAT a vendor is, distinct from the activity
// categories they sell. Keeps hotels, transport and services from being lumped
// in with tour operators. `key` is stored; label + emoji are display only.
export const OPERATOR_TYPES = [
  { key: "tours",     label: "Tours & activities", emoji: "🎟️", color: "#22D3EE" },
  { key: "hotel",     label: "Hotels & lodging",   emoji: "🏨", color: "#7FA6E8" },
  { key: "transport", label: "Transport",          emoji: "🚐", color: "#34D399" },
  { key: "food",      label: "Food & dining",      emoji: "🍽️", color: "#FFD000" },
  { key: "wellness",  label: "Wellness & services", emoji: "🧘", color: "#A78BFA" },
  { key: "other",     label: "Concierge / other",  emoji: "🛎️", color: "#94A3B8" },
];

export const OPERATOR_TYPE_MAP = Object.fromEntries(OPERATOR_TYPES.map((t) => [t.key, t]));

export const operatorType = (key) => OPERATOR_TYPE_MAP[key] || OPERATOR_TYPE_MAP.other;

// Best-guess a vendor type from the activity categories on a seed operator, so
// existing data lands in the right bucket without hand-tagging all of them.
// Everything the pricing sheet knows about IS a tour/activity, so that's the
// default; the heuristics only fire for the few obvious non-tour words.
export function inferOperatorType(categories = []) {
  const hay = (Array.isArray(categories) ? categories.join(" ") : String(categories)).toLowerCase();
  if (/hotel|lodge|resort|stay|hostel|villa|b&b|accommodation/.test(hay)) return "hotel";
  if (/shuttle|transfer|transport|car rental|rent a car|driver|taxi/.test(hay)) return "transport";
  if (/restaurant|dining|food|cuisine|chef|farm.?to.?table|cooking/.test(hay)) return "food";
  if (/spa|massage|wellness|yoga|nanny|babysit|retreat/.test(hay)) return "wellness";
  return "tours";
}
