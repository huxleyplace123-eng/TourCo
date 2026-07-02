// ── Tico reacts to YOU ───────────────────────────────────────────────────────
// This is what makes Tico feel like he's watching and cares — not a static guide.
// He reads your actual trip (what you've added, the vibe of it, the price, the
// pace) and reacts in character: excited, teasing, protective, proud. He also
// remembers your name across visits (localStorage). Every reaction returns a
// { text, mood } so his face matches what he's feeling about YOUR choices.

import { activities } from "../data.js";
import { seededPick, LIFE } from "./ticoPersona.js";

// ── Memory ── Tico remembers your name + that he's met you before.
const KEY = "ticowild.tico.memory";
export function ticoMemory() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function rememberTraveler(patch) {
  try {
    const next = { ...ticoMemory(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch { return patch; }
}
export function forgetTraveler() { try { localStorage.removeItem(KEY); } catch {} }

// Resolve trip item ids to full activity records.
function tripActivities(trip) {
  return (trip || []).map((t) => activities.find((a) => a.id === t.id)).filter(Boolean);
}

// Read the "shape" of your trip — this is how Tico understands your taste.
export function readTrip(trip) {
  const items = tripActivities(trip);
  const count = items.length;
  const spend = items.reduce((s, a) => s + (a.price || 0) * ((trip.find((t) => t.id === a.id)?.pax) || 2), 0);
  const cats = items.map((a) => a.category);
  const thrill = items.filter((a) => /Rafting|Zip|ATV|Paraglid|Surf|Fishing/i.test(a.category)).length;
  const chill = items.filter((a) => /Catamaran|Snorkel|Wildlife|Whale|Waterfall|Honeymoon/i.test(a.category)).length;
  const regions = new Set(items.map((a) => a.region));
  const highEnergy = thrill >= 2 && chill === 0;
  const allChill = chill >= 2 && thrill === 0;
  return { items, count, spend, cats, thrill, chill, regions: [...regions], highEnergy, allChill };
}

// ── Reaction when you ADD something to your trip ── the big "he's alive" moment.
export function ticoOnAdd(activity, trip) {
  const t = readTrip(trip);
  const name = ticoMemory().name;
  const hi = name ? `${name}, ` : "";

  // strong opinions on specific categories — this is where character shows
  const cat = activity.category || "";
  if (/Rafting|White Water/i.test(cat)) return { text: `${hi}oh YES. The rapids are alive right now — hold on and scream, that's the point.`, mood: "excited" };
  if (/Zip|Canopy/i.test(cat)) return { text: `Flying through my canopy, eh? Now you're getting it. 🦜`, mood: "excited" };
  if (/Wildlife Night/i.test(cat)) return { text: `The night walk — good. That's when the forest actually wakes up. Bring bug spray, trust me.`, mood: "proud" };
  if (/Catamaran/i.test(cat)) return { text: `${hi}nice — just promise me it's a boat that respects the dolphins. This one does.`, mood: "happy" };
  if (/Honeymoon|couple/i.test(cat)) return { text: `Ooh. Someone's in love. I approve — bring them somewhere with a sunset.`, mood: "soft" };
  if (/Fishing/i.test(cat)) return { text: `Offshore, early, before the wind — that's the move. Save me a bite of the catch.`, mood: "cheeky" };

  // reactions to the SHAPE of the growing trip
  if (t.count === 1) return { text: `${hi}first one in the basket. Good start — tell me what you're feeling and I'll fill the rest.`, mood: "happy" };
  if (t.highEnergy) return { text: `Mae, this is turning into an adrenaline trip. I love it — but let's slot ONE lazy beach day so you survive.`, mood: "cheeky" };
  if (t.allChill) return { text: `A slow, soft trip. Respect — pura vida is a skill. Want me to sneak in one little thrill though?`, mood: "chill" };
  if (t.regions.length >= 3) return { text: `Three regions already? Ambitious. I'll help you order these so you're not living in a van, ${name || "mae"}.`, mood: "thinking" };
  if (t.count >= 5) return { text: `${hi}okay this is a REAL trip now. ${t.count} experiences. I'm proud of you — let's tighten the days.`, mood: "proud" };

  return { text: seededPick([
    "Added. Good call — I'd have picked that too.",
    "Solid. Keep going, I'm building a picture of your taste.",
    `Nice one${name ? ", " + name : ""}. Trust the bird.`,
  ], activity.id), mood: "happy" };
}

// ── Ambient reaction to your trip as it stands (for the dock / trip page) ──
export function ticoTripVibe(trip) {
  const t = readTrip(trip);
  const name = ticoMemory().name;
  if (t.count === 0) return { text: `Your trip's empty${name ? ", " + name : ""} — that's a blank canvas. Add one thing you're curious about and I'll take it from there.`, mood: "happy" };
  if (t.highEnergy) return { text: "This trip is pure adrenaline. You're my kind of traveler — just hydrate, mae.", mood: "excited" };
  if (t.allChill) return { text: "Soft and slow. Honestly? The way to do Costa Rica. Pura vida.", mood: "soft" };
  if (t.spend > 800) return { text: "Treating yourself — good. Life's short, the coast is long. Worth every colón.", mood: "proud" };
  return { text: `${t.count} experiences, nicely balanced. I'd take this trip. Want me to order the days?`, mood: "happy" };
}
