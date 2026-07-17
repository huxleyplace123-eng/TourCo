// Operators workspace — logic + persistence. The spreadsheet seed
// (operators-data.js) is read-only; everything the team changes (stage,
// follow-ups, notes, checklist, edits, custom operators) lives in a
// localStorage OVERLAY keyed by operator id, merged at read time — so a
// redeploy with fresher spreadsheet data never wipes working state.

import { OPERATOR_SEED } from "./operators-data.js";
import { CONTACTS_SEED } from "./operators-contacts.js";
import { inferOperatorType, OPERATOR_TYPES, TEMPERATURES } from "./crm-shared.js";
import { parseCsvText } from "./store.js";

const OVERLAY_KEY = "ticowild_crm_operators_v1";

// The pricing-sheet operators + the field-team outreach list, one seed.
const ALL_SEED = [...OPERATOR_SEED, ...CONTACTS_SEED];

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
  const seedIds = new Set(ALL_SEED.map((o) => o.id));
  const fromSeed = ALL_SEED.map((seed) => {
    const ov = overlay[seed.id] || {};
    return {
      ...seed,
      stage: ov.stage ?? normalizeSeedStage(seed.seedStage),
      temperature: ov.temperature ?? "",
      type: ov.type ?? inferOperatorType(seed.categories),
      owner: ov.owner ?? "",
      preferred: ov.preferred ?? false,
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
      type: ov.type ?? "tours",
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
      temperature: ov.temperature ?? "",
      owner: ov.owner ?? "",
      preferred: ov.preferred ?? false,
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

// ── CSV import ────────────────────────────────────────────────────────────────
// Take a CSV (ours or a loose export), fuzzy-match its headers to operator
// fields, and produce overlay entries (custom operators). Dedupes against the
// existing merged list by company name OR phone/WhatsApp. Mirrors the customer
// importer in store.js.
const squash = (s) => String(s).toLowerCase().replace(/[^a-z]/g, "");
const digits = (p) => String(p || "").replace(/\D/g, "");
const normName = (n) => String(n || "").trim().toLowerCase();

const OP_ALIASES = {
  name: ["name", "operator", "operatorseller", "company", "companyname", "business", "businessname", "seller"],
  type: ["type", "vendortype", "operatortype", "kind"],
  regions: ["region", "regions", "area", "zone"],
  destinations: ["destination", "destinations", "base", "town", "city", "location"],
  categories: ["categories", "category", "categorymix", "activities", "activity", "services", "tours", "toursoffered"],
  phone: ["phone", "primaryphone", "telephone", "tel", "phonenumber", "primaryphone"],
  whatsapp: ["whatsapp", "wa", "mobile", "cell", "cellphone"],
  email: ["email", "primaryemail", "mail", "emailaddress", "contactemail"],
  website: ["website", "site", "url", "web", "homepage"],
  takeRate: ["referralfee", "takerate", "fee", "commission", "targettakerate", "feepercent", "feepct", "targetrate"],
  temperature: ["heat", "temperature", "temp", "priority", "leadheat"],
  owner: ["owner", "assignedto", "assignee", "rep", "accountowner"],
  notes: ["notes", "note", "comments", "remarks", "commercial", "pricingask"],
};

const opTypeFromText = (v) => {
  const s = squash(v);
  if (!s) return "tours";
  const hit = OPERATOR_TYPES.find((t) => t.key === s || squash(t.label) === s || squash(t.label).startsWith(s) || s.includes(t.key));
  if (hit) return hit.key;
  // fall back to inferring from the free text (e.g. "hotel", "shuttle")
  return inferOperatorType([v]);
};

const opHeatFromText = (v) => {
  const s = squash(v);
  const hit = TEMPERATURES.find((t) => squash(t) === s);
  return hit || "";
};

const parseRate = (v) => {
  if (!v) return null;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return null;
  return n > 1 ? n / 100 : n; // "18" or "18%" → 0.18; "0.18" → 0.18
};

export function importOperatorsCsv(text, existing) {
  const rows = parseCsvText(text);
  if (rows.length < 2) return { entries: {}, imported: 0, skippedDuplicates: 0, badRows: 0 };
  const header = rows[0].map(squash);
  const colFor = {};
  for (const [key, names] of Object.entries(OP_ALIASES)) {
    const idx = header.findIndex((h) => names.includes(h));
    if (idx >= 0) colFor[key] = idx;
  }
  if (colFor.name === undefined) return { entries: {}, imported: 0, skippedDuplicates: 0, badRows: rows.length - 1 };

  const seenNames = new Set(existing.map((o) => normName(o.name)).filter(Boolean));
  const seenPhones = new Set(existing.flatMap((o) => [digits(o.phone), digits(o.whatsapp)]).filter(Boolean));

  const entries = {};
  let imported = 0, skippedDuplicates = 0, badRows = 0;
  for (const raw of rows.slice(1)) {
    const get = (k) => (colFor[k] === undefined ? "" : String(raw[colFor[k]] ?? "").trim());
    const name = get("name");
    if (!name) { badRows++; continue; }
    const phoneD = digits(get("phone")) || digits(get("whatsapp"));
    if (seenNames.has(normName(name)) || (phoneD && seenPhones.has(phoneD))) { skippedDuplicates++; continue; }

    const notesText = get("notes");
    entries[`custom-imp-${Math.random().toString(36).slice(2, 9)}`] = {
      custom: true,
      name,
      type: opTypeFromText(get("type")),
      regions: get("regions"),
      destinations: get("destinations"),
      categories: get("categories") ? get("categories").split(/[;,/]/).map((s) => s.trim()).filter(Boolean) : [],
      phone: get("phone"),
      whatsapp: get("whatsapp"),
      email: get("email"),
      website: get("website"),
      takeRate: parseRate(get("takeRate")),
      temperature: opHeatFromText(get("temperature")),
      owner: get("owner"),
      stage: "Not contacted",
      notes: notesText ? [{ id: `n_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), text: notesText }] : [],
      checklist: {},
    };
    seenNames.add(normName(name));
    if (phoneD) seenPhones.add(phoneD);
    imported++;
  }
  return { entries, imported, skippedDuplicates, badRows };
}
