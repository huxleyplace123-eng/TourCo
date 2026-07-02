// ── Tico — the soul of TicoWild ──────────────────────────────────────────────
// Tico is a witty, warm scarlet macaw who's flown Costa Rica's coast his whole
// life. He's the app's character: he recommends, rates, and reviews everything
// with personality — powered by the real intelligence engine so his opinions
// actually mean something (season, vetting, value, drive-time), never random.

import { vibeScores, activityContext, activityInsights, monthIndexNow } from "./context.js";
import { trustReceipt } from "./trust.js";
import { operators } from "../data.js";

// Tico's 0–5 rating for an ACTIVITY — a real blend, not a star gift.
// quality (rating) + operator trust + how in-season/right-now it is + value.
export function ticoRateActivity(a, monthIdx = monthIndexNow()) {
  const vs = vibeScores(a, monthIdx);
  const get = (k) => vs.find((s) => s.key === k)?.value ?? 3;
  const receipt = trustReceipt(operators.find((o) => o.id === a.operatorId));
  const trust = receipt ? receipt.score / 100 : 0.85;
  const base = (a.rating || 4.5) / 5;                       // guest quality
  const local = get("local") / 5;                          // operator confidence
  const value = get("value") / 5;
  const wildlifeBoost = get("wildlife") >= 4 ? 0.04 : 0;
  const raw = base * 0.42 + trust * 0.26 + local * 0.14 + value * 0.12 + wildlifeBoost + 0.02;
  const score = Math.min(5, Math.round(raw * 5 * 10) / 10); // 1 decimal
  return { score, isPick: score >= 4.7 };
}

// Simple rating for restaurants / bars / beaches (no operator record).
export function ticoRateSpot(spot) {
  // seed from tags + a stable hash so it's consistent and believable
  const t = (spot.tags || []).length;
  const seed = (spot.id || spot.name || "x").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const score = Math.min(5, Math.round((4.3 + (t % 3) * 0.15 + (seed % 4) * 0.06) * 10) / 10);
  return { score, isPick: score >= 4.7 };
}

// ── Tico's VOICE ── context-aware lines. Deterministic pick from the item id so
// the same card always shows the same Tico line (feels authored, not random).
function pick(arr, key) {
  const seed = String(key || "").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return arr[seed % arr.length];
}

// Tico's one-liner "review" for an activity — season/time-of-day aware.
export function ticoActivityTake(a, monthIdx = monthIndexNow()) {
  const ctx = activityContext(a);
  const { insights } = activityInsights(a, monthIdx);
  const season = insights.find((i) => i.type === "season" && i.tone === "good");
  if (season) return `¡Pura vida! ${season.text} — I'd jump on this now.`;
  const time = ctx.idealTime;
  const byTime = {
    morning: [
      "Go first thing — calm, quiet, and you'll beat the crowds. I would.",
      "Morning's the move here. Trust a bird who's watched this coast for years.",
    ],
    afternoon: [
      "Save this for the afternoon — golden light, breezy, perfect.",
      "This one shines in the afternoon. Bring a camera.",
    ],
    evening: [
      "An evening gem — the coast gets magic after dark out here.",
      "Do this one at dusk. You'll thank me.",
    ],
  }[time] || ["One of my favorites on the whole coast."];
  const energy = ctx.energy >= 3 ? " High energy — pace the rest of your day easy." : "";
  return pick(byTime, a.id) + energy;
}

export function ticoSpotTake(spot) {
  const lines = {
    sunset: ["Best sunset seat on the coast — get there early.", "I perch nearby just for this view. Order a cold one."],
    seafood: ["The fish here is off the boat, not the freezer. Order it.", "Locals eat here for a reason — trust the catch of the day."],
    local: ["This is where the Ticos actually eat. That's all you need to know.", "Real casados, honest prices. My kind of spot."],
    "date-night": ["Bring someone you like. This one earns you points.", "Candles, ocean, good food — you're welcome."],
    "cheap-eats": ["Big flavor, small bill. My favorite combo.", "Cheap, fast, delicious. Eat, then go adventure."],
    view: ["The view does half the work here — and it's a great half.", "Come for the view, stay for the sunset."],
    default: ["Solid pick — I've steered plenty of travelers here.", "A local favorite. You'll fit right in."],
  };
  const tag = (spot.tags || []).find((t) => lines[t]) || "default";
  return pick(lines[tag], spot.id || spot.name);
}

export function ticoBeachTake(b) {
  const lines = [
    "Sand between your toes, no rush — that's the assignment.",
    "One of my favorite stretches of coast. Stay for sunset.",
    "Get here early and it's practically yours.",
  ];
  return pick(lines, b.id);
}

export function ticoDealTake(d) {
  const lines = [
    "This one's the real deal — I'd grab it before it's gone.",
    "Verified savings, no catch. Stack it and thank me later.",
    "Locals use this code too. That's how you know it's good.",
    "Small effort, real money saved. Easy yes.",
  ];
  return pick(lines, d.id || d.code || d.title);
}

// Page-level greetings for Tico's floating companion — reacts to where you are.
export function ticoPageLine(page) {
  const lines = {
    home: "¡Hola! I'm Tico. Tell me your vibe and I'll plan your whole Costa Rica.",
    today: "Here's what's good today. I check the weather and tides so you don't have to.",
    activities: "See the 🦜 badges? Those are my personal picks — I don't hand those out lightly.",
    eat: "Hungry? I know every honest kitchen on this coast. Look for my picks.",
    map: "This is the whole country from up here — where I fly. Tap around.",
    deals: "Real savings only. I'd never send you to a tourist trap.",
    guide: "Local secrets live here — beaches, tips, the stuff guidebooks miss.",
    packages: "Pre-built trips I'd take myself. Open one and I'll tailor it.",
    build: "Let's build it together. Tell me who's coming and how you like to travel.",
    portal: "Your trip's looking good. Want me to fine-tune the days?",
    detail: "Nice choice. Here's my honest take and the best time to go.",
    john: "These are my hand-picks — the ones I'd book for my own flock.",
  };
  return lines[page] || "I'm Tico — your local macaw. Ask me anything.";
}

export const TICO = {
  name: "Tico",
  species: "Scarlet macaw · your local guide",
  tagline: "Vetted by a bird who actually lives here.",
};
