// Operators workspace — logic + persistence. The spreadsheet seed
// (operators-data.js) is read-only; everything the team changes (stage,
// follow-ups, notes, checklist, edits, custom operators) lives in a
// localStorage OVERLAY keyed by operator id, merged at read time — so a
// redeploy with fresher spreadsheet data never wipes working state.

import { OPERATOR_SEED } from "./operators-data.js";

const OVERLAY_KEY = "ticowild_crm_operators_v1";

export const PARTNER_STAGES = [
  "Not contacted",
  "Outreach sent",
  "In talks",
  "Rates received",
  "Agreement sent",
  "Active partner",
  "Passed",
];

export const PARTNER_STAGE_COLORS = {
  "Not contacted": "#94A3B8",
  "Outreach sent": "#22D3EE",
  "In talks": "#7FA6E8",
  "Rates received": "#A78BFA",
  "Agreement sent": "#FFD000",
  "Active partner": "#34D399",
  Passed: "#F87171",
};

// The standard asks from the outreach plan — every operator gets this
// checklist so a call never misses an item.
export const OUTREACH_CHECKLIST = [
  { key: "fitNet", label: "FIT net rates", group: "Pricing" },
  { key: "segmentNet", label: "Child / student / local net", group: "Pricing" },
  { key: "groupTiers", label: "Group tiers", group: "Pricing" },
  { key: "taxes", label: "Taxes clarified", group: "Pricing" },
  { key: "blackout", label: "Blackout dates", group: "Pricing" },
  { key: "transport", label: "Transport zones", group: "Pricing" },
  { key: "cancellation", label: "Cancellation terms", group: "Pricing" },
  { key: "inventory", label: "Inventory method (API / Rezdy / FareHarbor / Bókun / manual)", group: "Operations" },
  { key: "cutoff", label: "Cutoff times", group: "Operations" },
  { key: "voucher", label: "Voucher flow", group: "Operations" },
  { key: "payout", label: "Payout timing", group: "Operations" },
  { key: "insurance", label: "Insurance + ICT credentials", group: "Operations" },
];

function loadOverlay() {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveOverlay(overlay) {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay));
}

export function loadOperatorOverlay() {
  return loadOverlay();
}

const normalizeSeedStage = (s) =>
  PARTNER_STAGES.includes(s) ? s : s === "Not Contacted" ? "Not contacted" : "Not contacted";

/** Seed + overlay → the working operator list the UI renders. */
export function mergedOperators(overlay) {
  const seedIds = new Set(OPERATOR_SEED.map((o) => o.id));
  const fromSeed = OPERATOR_SEED.map((seed) => {
    const ov = overlay[seed.id] || {};
    return {
      ...seed,
      stage: ov.stage ?? normalizeSeedStage(seed.seedStage),
      nextFollowUp: ov.nextFollowUp ?? "",
      lastContacted: ov.lastContacted ?? "",
      notes: ov.notes ?? [],
      checklist: ov.checklist ?? {},
      takeRate: ov.takeRate ?? seed.targetTakeRate,
      contactOverrides: ov.contactOverrides ?? {},
      custom: false,
    };
  });
  const customs = Object.entries(overlay)
    .filter(([id, ov]) => !seedIds.has(id) && ov && ov.custom)
    .map(([id, ov]) => ({
      id,
      name: ov.name || "New operator",
      regions: ov.regions || "",
      destinations: ov.destinations || "",
      categories: ov.categories || [],
      tourCount: 0,
      phone: ov.phone || "",
      phone2: "",
      whatsapp: ov.whatsapp || "",
      email: ov.email || "",
      b2bEmail: "",
      contactUrl: "",
      website: ov.website || "",
      contactType: "Added manually",
      verification: "",
      lastVerified: "",
      contactNotes: "",
      targetTakeRate: null,
      retailFound: false,
      residentFound: false,
      b2bNetReceived: false,
      seedStage: "Not contacted",
      outreachNotes: "",
      stage: ov.stage ?? "Not contacted",
      nextFollowUp: ov.nextFollowUp ?? "",
      lastContacted: ov.lastContacted ?? "",
      notes: ov.notes ?? [],
      checklist: ov.checklist ?? {},
      takeRate: ov.takeRate ?? null,
      contactOverrides: {},
      custom: true,
    }));
  return [...fromSeed, ...customs];
}

/** Patch one operator's overlay entry. */
export function patchOperator(overlay, id, patch) {
  return { ...overlay, [id]: { ...(overlay[id] || {}), ...patch } };
}

export function checklistProgress(checklist) {
  const done = OUTREACH_CHECKLIST.filter((item) => checklist?.[item.key]).length;
  return { done, total: OUTREACH_CHECKLIST.length };
}

export const pct = (v) => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`);
