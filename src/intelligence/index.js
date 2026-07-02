// ── TicoWild Intelligence: the tool surface ──────────────────────────────────
// One clean API the concierge calls to "think". Today the concierge (Ask John)
// is a rules engine that calls these tools; tomorrow a real LLM calls the exact
// same tools via function-calling. Keeping this seam means the brain can be
// upgraded without touching the UI. This IS the industry-changing architecture:
// a travel app whose intelligence is a swappable reasoning layer over real tools.

import { activities } from "../data.js";
import { activityInsights, vibeScores, monthIndexNow, MONTHS, climateFor, SEASONS, driveHours } from "./context.js";
import { planTrip } from "./planner.js";

// TOOL: recommend activities for a traveler profile (who/vibe/budget/month).
export function recommendActivities(profile = {}) {
  const monthIdx = profile.monthIdx ?? monthIndexNow();
  const scored = activities.map((a) => {
    let s = a.rating || 0;
    const reasons = [];
    if (profile.who === "family" && a.family) { s += 3; reasons.push("kid-safe"); }
    if (profile.who === "couple" && a.bestFor?.includes("Couples")) { s += 3; reasons.push("great for two"); }
    if (profile.who === "group" && a.bestFor?.includes("Groups")) { s += 3; reasons.push("built for groups"); }
    if (profile.vibe === "thrill" && a.level === "High") { s += 3; reasons.push("adrenaline"); }
    if (profile.vibe === "chill" && a.level === "Easy") { s += 3; reasons.push("relaxed"); }
    if (profile.vibe === "nature" && /Wildlife|Whale|Snorkel|Waterfall/.test(a.category)) { s += 3; reasons.push("wildlife & nature"); }
    if (profile.vibe === "water" && /Fishing|Catamaran|Snorkel|Surf|Whale|Rafting/.test(a.category)) { s += 3; reasons.push("on the water"); }
    if (profile.budget === "low" && a.price < 100) { s += 2; reasons.push("great value"); }
    if (profile.budget === "high" && a.price > 150) { s += 2; reasons.push("premium"); }

    // ── richer "Build My Costa Rica" inputs ──
    // stay near their base region → less driving
    if (profile.region && profile.region !== "Not sure yet") {
      const dh = driveHours(a.region, profile.region);
      if (dh === 0) { s += 2.5; reasons.push(`right by ${profile.region}`); }
      else if (dh <= 1) s += 1;
      else if (profile.avoidLongDrives && dh > 1.5) { s -= 3; } // they hate long drives
    }
    // young kids → drop high-intensity
    if (profile.youngKids && a.level === "High") s -= 4;
    // fears
    if (profile.fears?.includes("water") && /Fishing|Catamaran|Snorkel|Surf|Whale|Rafting/.test(a.category)) s -= 5;
    if (profile.fears?.includes("heights") && /Paragl|Zip/.test(a.category)) s -= 5;
    if (profile.fears?.includes("boats") && /Fishing|Catamaran|Whale|Snorkel/.test(a.category)) s -= 4;

    // in-season boost
    const { insights } = activityInsights(a, monthIdx);
    const inSeason = insights.find((i) => i.type === "season" && i.tone === "good");
    if (inSeason) { s += 2.5; reasons.unshift(inSeason.text.toLowerCase()); }
    return { a, score: s, reasons };
  }).sort((x, y) => y.score - x.score);
  return scored;
}

// TOOL: the hero — "Build My Costa Rica". Takes a full traveler profile and
// returns a personalized, optimized MULTI-DAY plan (recommend → optimize), with
// the reasons each activity was chosen and per-day logistics.
export function buildMyCostaRica(profile = {}) {
  const days = Math.max(1, Math.min(7, profile.days || 3));
  const perDay = profile.avoidLongDrives ? 2 : 2;
  const want = days * perDay + 1; // a little extra so the optimizer can choose
  const ranked = recommendActivities(profile).filter((r) => r.score > 0).slice(0, want);
  const reasonById = Object.fromEntries(ranked.map((r) => [r.a.id, r.reasons]));
  const plan = planTrip(ranked.map((r) => r.a), {
    monthIdx: profile.monthIdx ?? monthIndexNow(),
    maxPerDay: perDay,
    pax: profile.pax || 2,
    budget: profile.budget === "low" ? days * 240 : profile.budget === "high" ? Infinity : days * 400,
  });
  // trim to the requested number of days
  plan.days = plan.days.slice(0, days);
  plan.reasoning = plan.reasoning.slice(0, days);
  plan.totals.days = plan.days.length;
  plan.totals.cost = plan.days.reduce((s, d) => s + d.cost, 0);
  return { plan, reasonById, brief: monthBriefing(profile.monthIdx) };
}

// TOOL: get the smart insight badges for one activity.
export function getInsights(activityId, monthIdx) {
  const a = activities.find((x) => x.id === activityId);
  return a ? activityInsights(a, monthIdx ?? monthIndexNow()) : null;
}

// TOOL: TicoWild Vibe Scores for one activity (thrill/kid-safe/photo/…).
export function getVibeScores(activityOrId, monthIdx) {
  const a = typeof activityOrId === "string" ? activities.find((x) => x.id === activityOrId) : activityOrId;
  return a ? vibeScores(a, monthIdx ?? monthIndexNow()) : [];
}

// TOOL: build an optimized day-by-day plan from a set of activities.
export function buildPlan(activityIds, opts = {}) {
  const items = activityIds.map((id) => activities.find((a) => a.id === id)).filter(Boolean);
  return planTrip(items, opts);
}

// TOOL: what's special about a given month (season intelligence for the concierge).
export function monthBriefing(monthIdx = monthIndexNow()) {
  const cl = climateFor(monthIdx);
  const active = Object.values(SEASONS).filter((s) => s.months.includes(monthIdx)).map((s) => s.label);
  return { month: MONTHS[monthIdx], climate: cl, inSeason: active };
}

// A tiny "tool manifest" — the shape a real LLM would be handed for function
// calling. Documents the brain's capabilities in one place.
export const TOOLS = [
  { name: "recommendActivities", desc: "Rank activities for a traveler profile {who, vibe, budget, monthIdx}." },
  { name: "getInsights", desc: "Weather/tide/season/demand insight for one activity id." },
  { name: "buildPlan", desc: "Optimize a set of activity ids into a day-by-day trip {maxPerDay, budget, pax, monthIdx}." },
  { name: "monthBriefing", desc: "Season, climate, and wildlife windows for a month index." },
];
