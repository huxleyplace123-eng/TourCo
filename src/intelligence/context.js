// ── TripNest Intelligence: Living Context Layer ──────────────────────────────
// A deterministic "guide brain" of real Costa Rica knowledge. No API cost.
// Everything downstream (smart badges, the auto-planner, the concierge) reasons
// over the facts derived here. Replace the static climate table with a live
// weather/tide API later — the shape stays the same.

// Region geography — approximate drive-time graph (hours) along the Pacific
// coast, south→north. Used to avoid brutal back-to-back transfers.
export const REGION_ORDER = ["Uvita", "Dominical", "Quepos", "Manuel Antonio", "Jacó", "Tamarindo", "Guanacaste"];
const REGION_POS = Object.fromEntries(REGION_ORDER.map((r, i) => [r, i]));
// rough hours between adjacent coastal regions (index distance × ~0.9h, +overhead)
export function driveHours(a, b) {
  if (a === b) return 0;
  const pa = REGION_POS[a], pb = REGION_POS[b];
  if (pa == null || pb == null) return 2.5;
  return Math.round((Math.abs(pa - pb) * 0.9 + 0.4) * 10) / 10;
}

// Costa Rica climate by month (Pacific coast). rain = afternoon-shower risk 0–1.
// Dec–Apr = dry season; May–Nov = green season (wetter, lusher, cheaper).
const CLIMATE = [
  { m: "Jan", rain: 0.05, season: "dry", note: "Peak dry season — sunny & busy" },
  { m: "Feb", rain: 0.04, season: "dry", note: "Driest month of the year" },
  { m: "Mar", rain: 0.06, season: "dry", note: "Hot, dry, and clear" },
  { m: "Apr", rain: 0.12, season: "dry", note: "End of dry season, still great" },
  { m: "May", rain: 0.35, season: "green", note: "Green season begins — lush, fewer crowds" },
  { m: "Jun", rain: 0.45, season: "green", note: "Sunny mornings, afternoon showers" },
  { m: "Jul", rain: 0.35, season: "green", note: "'Veranillo' mini-dry spell — a sweet spot" },
  { m: "Aug", rain: 0.45, season: "green", note: "Whale season begins in the south" },
  { m: "Sep", rain: 0.6, season: "green", note: "Wettest — but greenest & cheapest" },
  { m: "Oct", rain: 0.62, season: "green", note: "Peak green — waterfalls at their fullest" },
  { m: "Nov", rain: 0.3, season: "green", note: "Rains easing, great value" },
  { m: "Dec", rain: 0.1, season: "dry", note: "Dry season returns — festive & popular" },
];
export function climateFor(monthIdx) { return CLIMATE[((monthIdx % 12) + 12) % 12]; }

// Seasonal wildlife windows (month indexes, 0=Jan).
export const SEASONS = {
  whales: { months: [7, 8, 9, 10, 11, 0, 1, 2], label: "Humpback whale season", peak: [8, 9] }, // Aug–Mar, peak Sep–Oct
  turtles: { months: [6, 7, 8, 9, 10], label: "Sea-turtle nesting", peak: [8, 9] },
  surf: { months: [4, 5, 6, 7, 8, 9], label: "Best surf swells", peak: [5, 6] },
  sailfish: { months: [11, 0, 1, 2, 3], label: "Peak sailfish bite", peak: [0, 1] },
};

// Derive per-activity "conditions knowledge" from its category + duration.
// Returns: { tide, idealTime, hours, energy, weatherSensitive, season }
export function activityContext(a) {
  const cat = a.category;
  const hours = parseFloat(a.duration) || (/full day/i.test(a.duration) ? 8 : 3);

  const tideDependent = /Snorkel|Catamaran|Fishing|Whale|Surf/.test(cat);
  const morningBest = /Fishing|ATV|Rafting|Zip|Whale|Waterfall|Wildlife.*(?!Night)/.test(cat) && !/Night/.test(cat);
  const isNight = /Night/.test(cat);
  const idealTime = isNight ? "evening" : morningBest ? "morning" : /Catamaran|Honeymoon|Paragl/.test(cat) ? "afternoon" : "morning";

  const energy = a.level === "High" ? 3 : a.level === "Moderate" ? 2 : 1;
  // outdoor water/air activities are more weather-sensitive than jungle/transport
  const weatherSensitive = /Catamaran|Paragl|Snorkel|Whale|Surf|Fishing/.test(cat) ? 0.9
    : /ATV|Rafting|Zip|Waterfall/.test(cat) ? 0.5 : 0.2;

  // which seasonal window (if any) this activity rides
  let season = null;
  if (/Whale/.test(cat)) season = "whales";
  else if (/Surf/.test(cat)) season = "surf";
  else if (/Fishing/.test(cat)) season = "sailfish";

  return { tideDependent, idealTime, hours, energy, weatherSensitive, season, isNight };
}

// A simple deterministic "tide" model for a given day + ideal time — enough to
// show a believable "calm morning water" style hint (swap for a tide API later).
export function tideHint(idealTime) {
  if (idealTime === "morning") return { state: "calmer", label: "Calmest water in the morning" };
  if (idealTime === "afternoon") return { state: "breezy", label: "Afternoon breeze — great for sailing" };
  return { state: "cool", label: "Cooler evening conditions" };
}

// Crowd / price pressure by season + rating (0–1). Higher = busier/pricier.
export function demandFor(a, monthIdx = new Date().getMonth?.() ?? 0) {
  const cl = climateFor(monthIdx);
  const seasonPressure = cl.season === "dry" ? 0.7 : 0.35;
  const popularity = Math.min(1, (a.reviews || 0) / 350);
  return Math.min(1, seasonPressure * 0.6 + popularity * 0.4);
}

// The headline "smart insight" for a single activity, given a target month.
// This is what powers the badge on cards / detail. Pure, testable, no API.
export function activityInsights(a, monthIdx) {
  const ctx = activityContext(a);
  const cl = climateFor(monthIdx);
  const out = [];

  // seasonal wildlife window
  if (ctx.season && SEASONS[ctx.season]) {
    const s = SEASONS[ctx.season];
    if (s.months.includes(monthIdx)) {
      const peaking = s.peak.includes(monthIdx);
      out.push({ type: "season", tone: "good", icon: "sparkle", text: peaking ? `${s.label} is peaking now` : `In season: ${s.label.toLowerCase()}` });
    }
  }

  // ideal time-of-day + tide
  if (ctx.tideDependent) {
    out.push({ type: "tide", tone: "info", icon: "clock", text: tideHint(ctx.idealTime).label });
  } else {
    out.push({ type: "time", tone: "info", icon: "clock", text: `Best in the ${ctx.idealTime}` });
  }

  // weather sensitivity vs month
  if (ctx.weatherSensitive > 0.6 && cl.rain > 0.4) {
    out.push({ type: "weather", tone: "warn", icon: "rain", text: "Book a morning slot — afternoon showers likely" });
  } else if (ctx.weatherSensitive < 0.3 && cl.rain > 0.4) {
    out.push({ type: "weather", tone: "good", icon: "sun", text: "Great even in the rain" });
  }

  // demand / value
  const d = demandFor(a, monthIdx);
  if (d > 0.75) out.push({ type: "demand", tone: "warn", icon: "trend", text: "In high demand — reserve early" });
  else if (cl.season === "green") out.push({ type: "value", tone: "good", icon: "tag", text: "Green-season value pricing" });

  return { ctx, climate: cl, insights: out };
}

// Month helpers so the UI can work with names or a Date.
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function monthIndexNow() { try { return new Date().getMonth(); } catch { return 0; } }
