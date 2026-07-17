// TicoWild CRM — data model + pure logic. Everything stateful lives in the
// browser's localStorage (no backend): each teammate's browser holds its own
// copy, and CSV export/import is the hand-off/backup path. Keeping the logic
// here pure (no React) keeps the UI file readable.

const STORAGE_KEY = "ticowild_crm_v1";
const COLUMNS_KEY = "ticowild_crm_columns_v1";

// ── Pipeline ──────────────────────────────────────────────────────────────────
export const STAGES = [
  "New",
  "Contacted",
  "Planning",
  "Quote sent",
  "Booked",
  "Completed",
  "Lost",
  "Not ready",
];

// Stages that count as "working the lead" — these feed follow-up buckets and
// pipeline value. Completed/Lost/Not ready are parked.
export const ACTIVE_STAGES = ["New", "Contacted", "Planning", "Quote sent", "Booked"];

export const STAGE_COLORS = {
  New: "#22D3EE",
  Contacted: "#7FA6E8",
  Planning: "#A78BFA",
  "Quote sent": "#FFD000",
  Booked: "#34D399",
  Completed: "#2DD4BF",
  Lost: "#F87171",
  "Not ready": "#94A3B8",
};

export const PAYMENT_STATUSES = [
  "No payment",
  "Deposit invoiced",
  "Deposit paid",
  "Paid in full",
  "Refunded",
];

export const LEAD_SOURCES = [
  "WhatsApp",
  "Instagram",
  "Website",
  "Referral",
  "Facebook",
  "TikTok",
  "Google",
  "Repeat guest",
];

// ── Record shape ──────────────────────────────────────────────────────────────
export function blankCustomer() {
  return {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: "",
    phone: "",
    email: "",
    country: "",
    travelStart: "",
    travelEnd: "",
    travelers: "",
    region: "",
    activities: "",
    budget: "",
    source: "",
    stage: "New",
    assignee: "",
    nextFollowUp: "",
    lastContacted: "",
    tripValue: "",
    payment: "No payment",
    tags: [],
    notes: [],
  };
}

// ── Persistence ───────────────────────────────────────────────────────────────
export function loadCustomers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomers(customers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function loadColumnPrefs(fallback) {
  try {
    const raw = localStorage.getItem(COLUMNS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveColumnPrefs(cols) {
  localStorage.setItem(COLUMNS_KEY, JSON.stringify(cols));
}

// ── Small helpers ─────────────────────────────────────────────────────────────
export const normPhone = (p) => String(p || "").replace(/\D/g, "");
export const normEmail = (e) => String(e || "").trim().toLowerCase();

export function daysFromToday(isoDate) {
  if (!isoDate) return null;
  const d = new Date(`${String(isoDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function todayIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDaysIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const moneyNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// ── Duplicates ────────────────────────────────────────────────────────────────
// A "duplicate" is a same-phone or same-email record (names repeat legitimately).
export function findDuplicates(customers, candidate, excludeId = null) {
  const phone = normPhone(candidate.phone);
  const email = normEmail(candidate.email);
  return customers.filter((c) => {
    if (excludeId && c.id === excludeId) return false;
    const samePhone = phone && normPhone(c.phone) === phone;
    const sameEmail = email && normEmail(c.email) === email;
    return samePhone || sameEmail;
  });
}

// ── Follow-up buckets ─────────────────────────────────────────────────────────
// The five lists the follow-ups dashboard shows. Only ACTIVE stages appear —
// nobody needs a reminder to call a Completed or Lost trip.
export function followUpBuckets(customers) {
  const active = customers.filter((c) => ACTIVE_STAGES.includes(c.stage));
  const overdue = [];
  const dueToday = [];
  const upcoming = [];
  for (const c of active) {
    const d = daysFromToday(c.nextFollowUp);
    if (d === null) continue;
    if (d < 0) overdue.push(c);
    else if (d === 0) dueToday.push(c);
    else if (d <= 7) upcoming.push(c);
  }
  const noContact = active.filter((c) => {
    if (c.stage === "Booked") return false; // booked = won; silence is fine
    const d = daysFromToday(c.lastContacted);
    return d === null || d <= -7;
  });
  const quotesWaiting = customers.filter((c) => c.stage === "Quote sent");
  const byFollowUp = (a, b) => String(a.nextFollowUp).localeCompare(String(b.nextFollowUp));
  overdue.sort(byFollowUp);
  dueToday.sort(byFollowUp);
  upcoming.sort(byFollowUp);
  noContact.sort((a, b) => String(a.lastContacted).localeCompare(String(b.lastContacted)));
  quotesWaiting.sort((a, b) => String(a.updatedAt).localeCompare(String(b.updatedAt)));
  return { overdue, dueToday, upcoming, noContact, quotesWaiting };
}

// ── CSV ───────────────────────────────────────────────────────────────────────
export const CSV_HEADERS = [
  ["name", "Full name"],
  ["phone", "Phone/WhatsApp"],
  ["email", "Email"],
  ["country", "Country"],
  ["travelStart", "Travel start"],
  ["travelEnd", "Travel end"],
  ["travelers", "Travelers"],
  ["region", "Region"],
  ["activities", "Activities"],
  ["budget", "Budget"],
  ["source", "Lead source"],
  ["stage", "Stage"],
  ["assignee", "Assigned to"],
  ["nextFollowUp", "Next follow-up"],
  ["lastContacted", "Last contacted"],
  ["tripValue", "Trip value"],
  ["payment", "Payment status"],
  ["tags", "Tags"],
  ["notesText", "Notes"],
];

const csvEscape = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(customers) {
  const header = CSV_HEADERS.map(([, label]) => csvEscape(label)).join(",");
  const rows = customers.map((c) =>
    CSV_HEADERS.map(([key]) => {
      if (key === "tags") return csvEscape((c.tags || []).join("; "));
      if (key === "notesText")
        return csvEscape(
          (c.notes || [])
            .map((n) => `[${String(n.at).slice(0, 10)}] ${n.text}`)
            .join(" | "),
        );
      return csvEscape(c[key]);
    }).join(","),
  );
  return [header, ...rows].join("\r\n");
}

// Minimal, correct CSV parser (quotes, escaped quotes, commas, newlines).
export function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const src = String(text ?? "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

// Map an imported CSV (ours or a loose export from elsewhere) onto customer
// records. Header matching is case/space/punctuation-insensitive.
export function importCsv(text, existing) {
  const rows = parseCsvText(text);
  if (rows.length < 2) return { imported: [], skippedDuplicates: 0, badRows: 0 };
  const squash = (s) => String(s).toLowerCase().replace(/[^a-z]/g, "");
  const aliases = {
    name: ["name", "fullname", "customer", "customername", "client"],
    phone: ["phone", "phonewhatsapp", "whatsapp", "mobile", "phonenumber"],
    email: ["email", "emailaddress", "mail"],
    country: ["country"],
    travelStart: ["travelstart", "startdate", "arrival", "traveldates", "datefrom"],
    travelEnd: ["travelend", "enddate", "departure", "dateto"],
    travelers: ["travelers", "numberoftravelers", "pax", "guests", "people"],
    region: ["region", "destination", "destinationorregion", "area"],
    activities: ["activities", "activitiesinterestedin", "interests", "tours"],
    budget: ["budget", "estimatedbudget"],
    source: ["source", "leadsource"],
    stage: ["stage", "salesstage", "status", "pipeline"],
    assignee: ["assignee", "assignedto", "assignedteammember", "owner", "rep"],
    nextFollowUp: ["nextfollowup", "followup", "nextfollowupdate", "followupdate"],
    lastContacted: ["lastcontacted", "lastcontact", "lasttouch"],
    tripValue: ["tripvalue", "estimatedtripvalue", "value", "dealvalue"],
    payment: ["payment", "paymentstatus", "depositpaymentstatus", "deposit"],
    tags: ["tags", "labels"],
    notesText: ["notes", "note", "comments"],
  };
  const header = rows[0].map(squash);
  const colFor = {};
  for (const [key, names] of Object.entries(aliases)) {
    const idx = header.findIndex((h) => names.includes(h));
    if (idx >= 0) colFor[key] = idx;
  }
  if (colFor.name === undefined) return { imported: [], skippedDuplicates: 0, badRows: rows.length - 1 };

  const imported = [];
  let skippedDuplicates = 0;
  let badRows = 0;
  const pool = [...existing];
  for (const raw of rows.slice(1)) {
    const get = (key) => (colFor[key] === undefined ? "" : String(raw[colFor[key]] ?? "").trim());
    const name = get("name");
    if (!name) {
      badRows++;
      continue;
    }
    const rec = { ...blankCustomer(), name };
    for (const key of Object.keys(aliases)) {
      if (key === "name" || key === "tags" || key === "notesText") continue;
      const v = get(key);
      if (v) rec[key] = v;
    }
    if (!STAGES.includes(rec.stage)) rec.stage = "New";
    if (!PAYMENT_STATUSES.includes(rec.payment)) rec.payment = "No payment";
    const tags = get("tags");
    if (tags) rec.tags = tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
    const notesText = get("notesText");
    if (notesText) {
      rec.notes = [
        { id: `n_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), kind: "note", text: notesText },
      ];
    }
    if (findDuplicates(pool, rec).length) {
      skippedDuplicates++;
      continue;
    }
    pool.push(rec);
    imported.push(rec);
  }
  return { imported, skippedDuplicates, badRows };
}

// ── Sample data ───────────────────────────────────────────────────────────────
// Optional starter set (button in the empty state) so every view shows life
// before real leads exist. Dates are relative to "now" so buckets populate.
export function sampleCustomers() {
  const mk = (over) => ({ ...blankCustomer(), ...over });
  const note = (daysAgo, text, kind = "note") => ({
    id: `n_${Math.random().toString(36).slice(2, 9)}`,
    at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    kind,
    text,
  });
  return [
    mk({
      name: "Sarah Mitchell", phone: "+1 415 555 0132", email: "sarah.m@gmail.com", country: "USA",
      travelStart: addDaysIso(45), travelEnd: addDaysIso(52), travelers: "2",
      region: "Guanacaste", activities: "Catamaran, Zipline, Sloth tour", budget: "$3,000",
      source: "Instagram", stage: "Quote sent", assignee: "John",
      nextFollowUp: addDaysIso(-2), lastContacted: addDaysIso(-4), tripValue: "2800",
      payment: "No payment", tags: ["honeymoon", "hot lead"],
      notes: [note(6, "Wants beachfront + adventure mix. Sent Tamarindo package."), note(4, "Quote sent — $2,800 for 2. Waiting on partner's dates.", "whatsapp")],
    }),
    mk({
      name: "Familie Bakker", phone: "+31 6 1234 5678", email: "j.bakker@ziggo.nl", country: "Netherlands",
      travelStart: addDaysIso(80), travelEnd: addDaysIso(94), travelers: "5",
      region: "Arenal + Manuel Antonio", activities: "Rafting, Hot springs, Wildlife night walk", budget: "€6,000",
      source: "Website", stage: "Planning", assignee: "Maria",
      nextFollowUp: addDaysIso(0), lastContacted: addDaysIso(-1), tripValue: "5500",
      payment: "No payment", tags: ["family", "2 weeks"],
      notes: [note(3, "Three kids (8–14). Prefers eco-lodges. Building 14-day route.")],
    }),
    mk({
      name: "Diego Fernández", phone: "+54 9 11 5555 4321", email: "diegof@outlook.com", country: "Argentina",
      travelStart: addDaysIso(20), travelEnd: addDaysIso(27), travelers: "4",
      region: "Caribbean side", activities: "Surf lessons, Snorkeling", budget: "$2,000",
      source: "Referral", stage: "Booked", assignee: "John",
      nextFollowUp: addDaysIso(5), lastContacted: addDaysIso(-2), tripValue: "1900",
      payment: "Deposit paid", tags: ["surf crew"],
      notes: [note(9, "Referred by Sarah M. Puerto Viejo focus."), note(2, "Deposit received. Send packing list next week.", "email")],
    }),
    mk({
      name: "Emma Thompson", phone: "+44 7700 900123", email: "emma.t@btinternet.com", country: "UK",
      travelStart: addDaysIso(120), travelEnd: addDaysIso(130), travelers: "2",
      region: "Undecided", activities: "Yoga retreat, Waterfalls", budget: "£4,000",
      source: "WhatsApp", stage: "New", assignee: "Maria",
      nextFollowUp: addDaysIso(1), lastContacted: "", tripValue: "3200",
      payment: "No payment", tags: [],
      notes: [note(0, "Came in via WhatsApp widget — asked about wellness trips.")],
    }),
    mk({
      name: "The Hendersons", phone: "+1 512 555 0198", email: "hendersonfam@yahoo.com", country: "USA",
      travelStart: addDaysIso(10), travelEnd: addDaysIso(17), travelers: "6",
      region: "Guanacaste", activities: "ATV, Catamaran, Fishing charter", budget: "$8,000",
      source: "Repeat guest", stage: "Booked", assignee: "John",
      nextFollowUp: addDaysIso(3), lastContacted: addDaysIso(-3), tripValue: "7400",
      payment: "Paid in full", tags: ["VIP", "repeat"],
      notes: [note(30, "Third trip with us. Wants same captain for the fishing day."), note(3, "Paid in full. Confirm ATV pickup time Thursday.", "call")],
    }),
    mk({
      name: "Lucía Morales", phone: "+34 612 345 678", email: "lucia.morales@gmail.com", country: "Spain",
      travelStart: addDaysIso(60), travelEnd: addDaysIso(70), travelers: "3",
      region: "Monteverde + Arenal", activities: "Canopy, Coffee tour, Hanging bridges", budget: "€3,500",
      source: "Google", stage: "Contacted", assignee: "Maria",
      nextFollowUp: addDaysIso(-1), lastContacted: addDaysIso(-9), tripValue: "3100",
      payment: "No payment", tags: ["spanish-speaking"],
      notes: [note(9, "Prefers WhatsApp in Spanish. Sent intro + sample itinerary.", "whatsapp")],
    }),
    mk({
      name: "Mark & Kevin O'Brien", phone: "+1 646 555 0177", email: "mkobrien@gmail.com", country: "USA",
      travelStart: addDaysIso(150), travelEnd: addDaysIso(160), travelers: "2",
      region: "South Pacific coast", activities: "Whale watching, Corcovado hike", budget: "$5,000",
      source: "Instagram", stage: "Not ready", assignee: "John",
      nextFollowUp: addDaysIso(30), lastContacted: addDaysIso(-14), tripValue: "4600",
      payment: "No payment", tags: ["next season"],
      notes: [note(14, "Planning for next season — check back in a month.")],
    }),
    mk({
      name: "Anna Kowalski", phone: "+48 601 234 567", email: "a.kowalski@wp.pl", country: "Poland",
      travelStart: addDaysIso(35), travelEnd: addDaysIso(42), travelers: "2",
      region: "Arenal", activities: "Rafting, Hot springs", budget: "$1,800",
      source: "Facebook", stage: "Lost", assignee: "Maria",
      nextFollowUp: "", lastContacted: addDaysIso(-20), tripValue: "1700",
      payment: "No payment", tags: [],
      notes: [note(20, "Went with a cheaper operator. Keep for next year — was friendly.")],
    }),
  ];
}
