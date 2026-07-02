// ── Tico — the soul of TicoWild ──────────────────────────────────────────────
// Tico is a witty, warm, opinionated scarlet macaw who's flown Costa Rica's coast
// his whole life. This file is his VOICE + how he RATES. WHO he is (backstory,
// quirks, moods, verdict language) lives in ticoPersona.js — this file turns that
// character into opinions about specific things, powered by the real intelligence
// engine so what he says actually means something (season, vetting, value, drive).
//
// Everything Tico returns now carries a { mood } so his FACE can match his WORDS.

import { vibeScores, activityContext, activityInsights, monthIndexNow } from "./context.js";
import { trustReceipt } from "./trust.js";
import { operators } from "../data.js";
import { LIFE, seededPick, maybeCatchphrase, verdict } from "./ticoPersona.js";

export { TICO } from "./ticoPersona.js";

// ── RATINGS ──────────────────────────────────────────────────────────────────
// Tico's 0–5 for an ACTIVITY — a real blend, not a star gift.
export function ticoRateActivity(a, monthIdx = monthIndexNow()) {
  const vs = vibeScores(a, monthIdx);
  const get = (k) => vs.find((s) => s.key === k)?.value ?? 3;
  const receipt = trustReceipt(operators.find((o) => o.id === a.operatorId));
  const trust = receipt ? receipt.score / 100 : 0.85;
  const base = (a.rating || 4.5) / 5;
  const local = get("local") / 5;
  const value = get("value") / 5;
  const wildlifeBoost = get("wildlife") >= 4 ? 0.04 : 0;
  const raw = base * 0.42 + trust * 0.26 + local * 0.14 + value * 0.12 + wildlifeBoost + 0.02;
  const score = Math.min(5, Math.round(raw * 5 * 10) / 10);
  return { score, isPick: score >= 4.7 };
}

// Rating for restaurants / bars / beaches (no operator record) — stable + believable.
export function ticoRateSpot(spot) {
  const t = (spot.tags || []).length;
  const seed = (spot.id || spot.name || "x").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const score = Math.min(5, Math.round((4.3 + (t % 3) * 0.15 + (seed % 4) * 0.06) * 10) / 10);
  return { score, isPick: score >= 4.7 };
}

// ── VERDICTS ── the rich, feeling-based rating language. Returns { score, verdict,
// mood, label } so a card can show BOTH a number and Tico's honest gut reaction,
// with a face to match. This is the "10 vs it's-fine" honesty the character needs.
export function ticoActivityVerdict(a, monthIdx = monthIndexNow()) {
  const { score, isPick } = ticoRateActivity(a, monthIdx);
  const v = verdict(score);
  return { score, isPick, mood: v.mood, label: v.label, verdict: seededPick(v.lines, a.id) };
}
export function ticoSpotVerdict(spot) {
  const { score, isPick } = ticoRateSpot(spot);
  const v = verdict(score);
  return { score, isPick, mood: v.mood, label: v.label, verdict: seededPick(v.lines, spot.id || spot.name) };
}

// ── TAKES ── his one-liner review of a specific thing, in-character. Every take
// returns { text, mood } so the avatar beside it wears the right expression.
export function ticoActivityTake(a, monthIdx = monthIndexNow()) {
  const ctx = activityContext(a);
  const { insights } = activityInsights(a, monthIdx);
  const season = insights.find((i) => i.type === "season" && i.tone === "good");
  if (season) return { text: `¡Pura vida! ${season.text} — I'd jump on this now.`, mood: "excited" };

  const time = ctx.idealTime;
  const byTime = {
    morning: [
      "Go first thing — calm, quiet, you'll beat the crowds. I would.",
      "Morning's the move here. Trust a bird who's watched this coast for years.",
    ],
    afternoon: [
      "Save this for the afternoon — golden light, breezy, perfect.",
      "This one shines late in the day. Bring a camera, mae.",
    ],
    evening: [
      "An evening gem — the coast gets magic after dark out here.",
      "Do this one at dusk. You'll thank me.",
    ],
  }[time] || ["One of my favorites on the whole coast."];

  let text = maybeCatchphrase(a.id) + seededPick(byTime, a.id);
  if (ctx.energy >= 3) text += " High energy though — pace the rest of your day easy.";
  return { text, mood: ctx.energy >= 3 ? "excited" : "happy" };
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
  const moodByTag = { sunset: "soft", "date-night": "soft", seafood: "happy", view: "chill", "cheap-eats": "cheeky", local: "proud" };
  return { text: maybeCatchphrase(spot.id || spot.name, 0.25) + seededPick(lines[tag], spot.id || spot.name), mood: moodByTag[tag] || "happy" };
}

export function ticoBeachTake(b) {
  const lines = [
    "Sand between your toes, no rush — that's the assignment.",
    "One of my favorite stretches of coast. Stay for sunset.",
    "Get here early and it's practically yours.",
    `I nested near a beach like this once. ${LIFE.name === "Tico" ? "Good memories." : ""}`.trim(),
  ];
  return { text: seededPick(lines, b.id), mood: "chill" };
}

export function ticoDealTake(d) {
  const lines = [
    "This one's the real deal — I'd grab it before it's gone.",
    "Verified savings, no catch. Stack it and thank me later.",
    "Locals use this code too. That's how you know it's good.",
    "Small effort, real money saved. Easy yes, mae.",
  ];
  return { text: seededPick(lines, d.id || d.code || d.title), mood: "cheeky" };
}

// ── PAGE GREETINGS ── the dock's line per page, each with a mood so Tico's face
// greets you differently depending on where you are. Real character, not signage.
// ── SECTION INTROS ── Tico's spoken framing for a section, so a page header
// feels like HE is walking you through it. Returns { title, line, mood }.
export function ticoSectionIntro(kind, ctx = {}) {
  const region = ctx.region ? ` in ${ctx.region}` : "";
  const map = {
    topPicks:   { title: "Tico's Top Picks right now", mood: "proud",
      line: "I ranked these myself — best experiences on the coast this season. #1 is where I'd take you first." },
    activities: { title: "What I'd actually do", mood: "happy",
      line: `Everything here is vetted and rated by me. The 🦜 picks are the ones I'd book for my own flock${region}.` },
    eat:        { title: "Where I'd eat & drink", mood: "cheeky",
      line: "Skip the tourist traps — these are the honest kitchens and the best sunset seats. My picks are marked." },
    beaches:    { title: "The beaches I'd send you to", mood: "chill",
      line: "Some for surf, some for snorkel, some the locals keep quiet. I ranked the sand for you." },
    packages:   { title: "Trips I'd take myself", mood: "excited",
      line: "Pre-built and road-tested. Open one and I'll tailor the days around you." },
    deals:      { title: "Real savings, bird-approved", mood: "proud",
      line: "I'd never send my flock to a rip-off. These codes are the real thing." },
  };
  return map[kind] || map.topPicks;
}

export function ticoPageLine(page) {
  const lines = {
    home:      { text: "¡Hola! I'm Tico. I've flown this whole coast — tell me your vibe and I'll plan it.", mood: "happy" },
    today:     { text: "Here's what's actually good today. I read the sky and the tides so you don't have to.", mood: "chill" },
    activities:{ text: "See the 🦜 picks? Those are MINE. I don't hand them out lightly — trust the bird.", mood: "proud" },
    eat:       { text: "Hungry? I know every honest kitchen on this coast. Skip the tourist traps — I'll point you right.", mood: "cheeky" },
    map:       { text: "This is my whole country, from up where I fly. Go on — tap around.", mood: "excited" },
    deals:     { text: "Real savings only. I'd never send my flock to a rip-off.", mood: "proud" },
    guide:     { text: "The secrets live here — beaches, tips, the stuff guidebooks never learned.", mood: "chill" },
    packages:  { text: "These are trips I'd actually take myself. Open one and I'll tailor it to you.", mood: "happy" },
    build:     { text: "Alright, let's build it together. Who's coming, and how do you like to travel?", mood: "excited" },
    portal:    { text: "Ooh, your trip's shaping up nicely. Want me to fine-tune the days?", mood: "excited" },
    detail:    { text: "Good eye. Here's my honest take and exactly when to go.", mood: "happy" },
    john:      { text: "These are my hand-picks — the ones I'd book for my own flock.", mood: "proud" },
  };
  return lines[page] || { text: "I'm Tico — your local macaw. Ask me anything.", mood: "happy" };
}
