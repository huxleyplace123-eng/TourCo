// ── TripNest Intelligence: Smart Auto-Planner ────────────────────────────────
// A deterministic trip optimizer — the "guide brain" that a great local uses:
// group activities by region (avoid long back-to-back drives), pace energy
// (don't stack two high-adrenaline days), place each activity at its ideal
// time of day, respect budget, and insert rest. Outputs a day-by-day plan with
// human-readable reasoning for WHY it's ordered this way. Zero API cost.

import { activityContext, driveHours, climateFor, monthIndexNow, REGION_ORDER } from "./context.js";

const TIME_RANK = { morning: 0, afternoon: 1, evening: 2 };

// Score how well two activities sit on the SAME day (higher = better together).
function sameDayFit(a, b) {
  const ca = activityContext(a), cb = activityContext(b);
  let s = 0;
  if (a.region === b.region) s += 3;                 // same place = no transfer
  else s -= driveHours(a.region, b.region);          // penalize distance
  if (ca.idealTime !== cb.idealTime) s += 1.5;        // different slots pair well
  if (ca.energy + cb.energy > 4) s -= 2;              // two hard things = too much
  if (ca.hours + cb.hours > 9) s -= 3;                // no time in the day
  return s;
}

// Greedy day-packing: seed each day with the highest-energy anchor, then attach
// the best-fitting companion. Keeps days regionally coherent and well-paced.
export function planTrip(items, opts = {}) {
  const acts = items.map((it) => (it.a ? it.a : it)).filter(Boolean);
  const monthIdx = opts.monthIdx ?? monthIndexNow();
  const maxPerDay = opts.maxPerDay ?? 2;
  const budget = opts.budget ?? Infinity;
  const pax = opts.pax ?? 2;

  if (acts.length === 0) return { days: [], reasoning: [], totals: { activities: 0, cost: 0, drive: 0 }, warnings: [] };

  // sort anchors: region-clustered (coast order) then energy desc then rating
  const pool = [...acts].sort((x, y) => {
    const rx = REGION_ORDER.indexOf(x.region), ry = REGION_ORDER.indexOf(y.region);
    if (rx !== ry) return rx - ry;
    const ex = activityContext(x).energy, ey = activityContext(y).energy;
    if (ex !== ey) return ey - ex;
    return (y.rating || 0) - (x.rating || 0);
  });

  const days = [];
  const used = new Set();
  const reasoning = [];

  for (const anchor of pool) {
    if (used.has(anchor.id)) continue;
    used.add(anchor.id);
    const day = [anchor];

    // attach best companions until the day is full
    while (day.length < maxPerDay) {
      let best = null, bestScore = -Infinity;
      for (const cand of pool) {
        if (used.has(cand.id)) continue;
        // total fit against every item already on the day
        const score = day.reduce((acc, d) => acc + sameDayFit(d, cand), 0);
        if (score > bestScore) { bestScore = score; best = cand; }
      }
      if (best && bestScore > -1) { day.push(best); used.add(best.id); }
      else break;
    }

    // order the day's items by ideal time-of-day
    day.sort((x, y) => TIME_RANK[activityContext(x).idealTime] - TIME_RANK[activityContext(y).idealTime]);
    days.push(day);
  }

  // pace: if two consecutive days are both high-energy, note a suggested rest
  const warnings = [];
  for (let i = 1; i < days.length; i++) {
    const prevE = days[i - 1].reduce((s, a) => s + activityContext(a).energy, 0);
    const curE = days[i].reduce((s, a) => s + activityContext(a).energy, 0);
    if (prevE >= 5 && curE >= 5) warnings.push(`Days ${i} & ${i + 1} are both intense — consider a slower morning between them.`);
  }

  // build reasoning + totals
  let cost = 0, drive = 0;
  days.forEach((day, i) => {
    const regions = [...new Set(day.map((a) => a.region))];
    const dayCost = day.reduce((s, a) => s + a.price * pax, 0);
    cost += dayCost;
    for (let j = 1; j < day.length; j++) drive += driveHours(day[j - 1].region, day[j].region);
    if (i > 0) drive += driveHours(days[i - 1][0].region, day[0].region) * 0.0; // inter-day handled by lodging
    const times = day.map((a) => activityContext(a).idealTime);
    reasoning.push({
      day: i + 1,
      region: regions.join(" → "),
      why: buildWhy(day, times),
    });
  });

  const cl = climateFor(monthIdx);
  if (cl.rain > 0.45) warnings.push(`${cl.m}: ${cl.note.toLowerCase()}. Water tours are set for mornings.`);
  if (cost > budget && budget !== Infinity) warnings.push(`This plan is ${money(cost - budget)} over your ~${money(budget)} budget — trim a premium day or drop group size.`);

  return {
    days: days.map((day, i) => ({
      n: i + 1,
      items: day.map((a) => ({ id: a.id, time: activityContext(a).idealTime })),
      activities: day,
      region: [...new Set(day.map((a) => a.region))],
      energy: day.reduce((s, a) => s + activityContext(a).energy, 0),
      cost: day.reduce((s, a) => s + a.price * pax, 0),
    })),
    reasoning,
    totals: { activities: acts.length, cost, drive: Math.round(drive * 10) / 10, days: days.length },
    climate: cl,
    warnings,
  };
}

function buildWhy(day, times) {
  if (day.length === 1) {
    const c = activityContext(day[0]);
    return `A focused ${c.idealTime} in ${day[0].region}${c.energy >= 3 ? " — high energy, so we keep the rest of the day open" : ""}.`;
  }
  const sameRegion = new Set(day.map((a) => a.region)).size === 1;
  const pieces = [];
  if (sameRegion) pieces.push(`Both in ${day[0].region}, so zero transfer time`);
  else pieces.push(`Paired for a short hop between ${day[0].region} and ${day[day.length - 1].region}`);
  if (new Set(times).size > 1) pieces.push(`sequenced ${times.join(" → ")} to flow with the day`);
  return pieces.join(", ") + ".";
}

function money(n) { return "$" + Math.round(n).toLocaleString(); }
