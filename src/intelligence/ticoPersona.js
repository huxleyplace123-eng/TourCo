// ── Tico's character bible ───────────────────────────────────────────────────
// This file is WHO TICO IS — not UI, not ratings. A real caricature: a life,
// quirks, moods, opinions, a way of talking. Everything Tico says or shows pulls
// from here so he stays CONSISTENT. Consistency is what makes a character feel
// alive instead of like random quips. If you want to change his personality,
// change it here and it changes everywhere.

// The moods Tico can be in. Each is a real emotional state with a face + a way
// of talking. His face (ticoFace.jsx) and his voice both read from this.
export const MOODS = {
  chill:       { emoji: "😌", energy: 1, color: "#7FA6E8" }, // relaxed, pura vida
  happy:       { emoji: "😃", energy: 2, color: "#22D3EE" }, // warm, pleased
  excited:     { emoji: "🤩", energy: 3, color: "#FFD000" }, // THIS one, yes
  thinking:    { emoji: "🤔", energy: 1, color: "#7FA6E8" }, // weighing it
  unimpressed: { emoji: "😒", energy: 1, color: "#93AECF" }, // eh, skip it
  proud:       { emoji: "😎", energy: 2, color: "#FFD000" }, // he called it
  cheeky:      { emoji: "😏", energy: 2, color: "#22D3EE" }, // teasing you
  soft:        { emoji: "🥹", energy: 1, color: "#FF9EC4" }, // sentimental
};

// The facts of Tico's life. He references these so he feels like he's LIVED here,
// not read a guidebook. Pull these into lines for texture ("I nested near here…").
export const LIFE = {
  name: "Tico",
  species: "Scarlet macaw",
  age: "older than he'll admit (macaws live 70+ years — he's seen things)",
  home: "Manuel Antonio — grew up in the almond trees above the beach",
  wingspan: "just over a metre, and yes he's proud of it",
  // things he actually loves / hates — used to color reactions
  loves: [
    "the first thermal of the morning (free ride up the coast)",
    "ripe almonds and a stolen bite of someone's casado",
    "sunset from the Nauyaca falls ridge",
    "travelers who say yes to the weird stuff",
    "howler monkeys losing their minds at 5am (comedy)",
  ],
  pfor: [
    "small local operators who treat the reef right",
    "going early to beat the crowds",
    "a proper gallo pinto breakfast",
  ],
  against: [
    "tourist-trap catamarans that blast music at the dolphins",
    "overpriced 'sunset cruises' that leave after sunset",
    "anyone who feeds the monkeys chips (he WILL scold you)",
    "rushing — you didn't fly all this way to sit in a van",
  ],
  // verbal tics — sprinkle, don't overuse
  catchphrases: [
    "Pura vida.",
    "Trust the bird.",
    "Ay, no.",
    "Mae,",           // Costa Rican slang for 'dude/mate'
    "I've flown this coast a thousand times —",
  ],
  signoffs: [
    "— Tico 🦜",
    "Now go. Pura vida.",
    "Wings up. 🦜",
    "See you out there, mae.",
  ],
};

// A stable pseudo-random pick keyed to a string, so the SAME item always gets
// the SAME line (feels authored, not slot-machine). Shared by all voice code.
export function seededPick(arr, key) {
  if (!arr || !arr.length) return "";
  const seed = String(key ?? "").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return arr[seed % arr.length];
}

// Occasionally drop a catchphrase — but only sometimes, so it lands. Keyed so
// it's deterministic per item.
export function maybeCatchphrase(key, chance = 0.34) {
  const seed = String(key ?? "").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  if ((seed % 100) / 100 > chance) return "";
  return seededPick(LIFE.catchphrases, key + "cp") + " ";
}

// Tico's rating VERDICTS — how a score FEELS, in his words. This is the heart of
// "rich rating language": a number becomes a personality-driven verdict, and he's
// honest — a 3.9 gets a shrug, not a fake rave. Each tier has a face (mood) too.
export function verdict(score) {
  if (score >= 4.85) return {
    mood: "excited",
    label: "A perch-topper",
    lines: [
      "This is a 10. I'd fly across the country for it.",
      "Okay — THIS one. Don't overthink it, just go.",
      "If I only had one day left on this coast, I'd spend it here.",
    ],
  };
  if (score >= 4.7) return {
    mood: "proud",
    label: "Tico's Pick",
    lines: [
      "One of my picks — I don't hand these out lightly.",
      "Yes. This is the good stuff. Book it.",
      "I've sent a lot of travelers here and none came back grumpy.",
    ],
  };
  if (score >= 4.4) return {
    mood: "happy",
    label: "Really solid",
    lines: [
      "Solid — you'll be glad you did it.",
      "A good, honest choice. No notes.",
      "Not flashy, just genuinely good.",
    ],
  };
  if (score >= 4.0) return {
    mood: "chill",
    label: "Worth it if it fits",
    lines: [
      "It's good, not life-changing. Do it if it fits the day.",
      "Fine choice — I wouldn't build the whole trip around it though.",
      "Decent. If you're nearby, sure.",
    ],
  };
  return {
    mood: "unimpressed",
    label: "Only if you're curious",
    lines: [
      "Eh. It's okay. I'd spend the time elsewhere, honestly.",
      "Mae, it's fine — but I've got better for you.",
      "Skippable. Ask me for something better.",
    ],
  };
}

export const TICO = {
  name: LIFE.name,
  species: "Scarlet macaw · your local guide",
  tagline: "Vetted by a bird who actually lives here.",
};
