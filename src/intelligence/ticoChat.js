// ── Tico's chat brain ────────────────────────────────────────────────────────
// A lightweight, offline Q&A engine so the corner bird is a real chatbot that
// knows the app + Costa Rica. No API, no cost — keyword-matched intents with
// Rico-voiced answers. Each intent: keywords to match + an answer (+ optional
// action that routes somewhere in the app).

import { ticoPageLine } from "./tico.js";

// The starter questions shown as chips.
export const CHAT_SUGGESTIONS = [
  "How does booking work?",
  "How much is the deposit?",
  "Best time to visit?",
  "What can I do there?",
  "Is it safe?",
  "How do I get around?",
];

const INTENTS = [
  {
    keys: ["deposit", "pay", "upfront", "how much to reserve", "down payment"],
    answer: "You only put down a 20% deposit to lock in a tour — the rest is paid to the operator on the day. No surprises, and no full payment upfront. Pura vida.",
    action: { label: "Start planning", page: "build" },
  },
  {
    keys: ["book", "booking", "reserve", "how does it work", "how do i book"],
    answer: "Easy: add experiences to your trip, put down the listed deposit, and TicoWild coordinates confirmation with the approved partner before you go. You can also tell me your dates and I'll build the whole day-by-day for you.",
    action: { label: "Build my trip", page: "build" },
  },
  {
    keys: ["fee", "booking fee", "commission", "hidden", "extra cost"],
    answer: "No booking fees here. Big sites (OTAs) tack on 5–10% — I book you direct with the local operators, so you keep that money.",
  },
  {
    keys: ["best time", "when to visit", "season", "weather", "rain", "dry season", "green season"],
    answer: "Dry season (Dec–Apr) = the most sun. Green season (May–Nov) = lush jungle, fewer crowds, and 30–40% cheaper stays — the rain mostly comes in the afternoon, so we do the big stuff in the morning. Whales peak in Uvita Jul–Nov.",
    action: { label: "See today's conditions", page: "home" },
  },
  {
    keys: ["do", "activities", "adventure", "tours", "what can i", "things to do"],
    answer: "Everything: zipline the canopy, raft class III–IV rapids, parasail the coast, surf, ATV the jungle, sport-fish for marlin, hike a volcano, snorkel the reef, watch humpback whales, chase waterfalls. Want my ranked picks?",
    action: { label: "Browse activities", page: "activities" },
  },
  {
    keys: ["safe", "safety", "dangerous", "crime", "theft"],
    answer: "Costa Rica rewards smart travel. Never leave anything visible in a car, double-check it actually locked, and use licensed transport. Every experience I show comes from a partner explicitly approved for publication.",
    action: { label: "Open the Insider Guide", page: "insider" },
  },
  {
    keys: ["get around", "transport", "car", "rental", "drive", "shuttle", "taxi", "airport"],
    answer: "Private transfers beat rental cars on the rough coastal roads — and I coordinate every pickup. If you do rent, get a regular car (not an SUV) for most Pacific routes. Fly into SJO (San José) or LIR (Liberia) depending on your region.",
    action: { label: "Plan your route", page: "map" },
  },
  {
    keys: ["eat", "food", "restaurant", "drink", "bar", "nightlife", "soda", "casado"],
    answer: "Eat at 'sodas' — family kitchens with a full casado for $5–8 (vs $15–30 at tourist spots). For the right spot for the moment — best sunset seat, beach, or local kitchen — open my Insider Guide.",
    action: { label: "Open the Insider Guide", page: "insider" },
  },
  {
    keys: ["free", "cheap", "budget", "save", "deal", "discount", "money"],
    answer: "Tons is free: every beach, Tárcoles crocodile bridge, free hot springs by Arenal, Río Celeste, miradores, sunsets. The Insider Guide also keeps listed promo codes and happy hours together—confirm the offer details before you go.",
    action: { label: "See deals & free things", page: "deals" },
  },
  {
    keys: ["where", "region", "go", "location", "map", "manuel antonio", "uvita", "tamarindo", "guanacaste", "jaco", "quepos", "dominical", "arenal"],
    answer: "Seven coastal hubs, each with its own personality — Manuel Antonio for wildlife, Quepos for fishing, Uvita for whales, Tamarindo & Dominical for surf, Jacó for adventure & nightlife, Guanacaste for luxury & sun. The map shows exactly what's where.",
    action: { label: "Explore the map", page: "map" },
  },
  {
    keys: ["family", "kids", "children", "child"],
    answer: "Great for families — calm-water catamarans, gentle surf lessons, wildlife night walks, waterfall days. Manuel Antonio packs the most wildlife into the smallest, easiest area. I'll flag family-friendly picks for you.",
    action: { label: "Family-friendly tours", page: "activities" },
  },
  {
    keys: ["honeymoon", "couple", "romantic", "anniversary"],
    answer: "Ooh — someone's in love. Private waterfall picnics, sunset catamarans, couples' days on the south coast. I'll steer you somewhere with a great sunset.",
    action: { label: "See romantic trips", page: "packages" },
  },
  {
    keys: ["fish", "fishing", "marlin", "sailfish"],
    answer: "Quepos is the sport-fishing capital — offshore charters for marlin, sailfish and dorado, best early before the wind. Save me a bite of the catch, mae.",
    action: { label: "Fishing charters", page: "activities" },
  },
  {
    keys: ["who are you", "what are you", "your name", "rico", "rico the tico", "tico", "macaw", "about you"],
    answer: "I'm Rico the Tico — a scarlet macaw who grew up in the almond trees above Manuel Antonio. I've flown this whole coast and I rate every experience honestly. Think of me as your local intelligence.",
    action: { label: "Meet me properly", page: "tico" },
  },
  {
    keys: ["trip", "itinerary", "plan", "days", "schedule"],
    answer: "Tell me your dates, who's coming, and your vibe — I'll assemble a day-by-day around drive times, tides and season. Watch it build itself.",
    action: { label: "Build my Costa Rica", page: "build" },
  },
];

const FALLBACK = "Good question. I know the coast better than the app knows itself — try asking about booking, the deposit, the best time to visit, what to do, safety, getting around, or where to go. Or just tell me your vibe and I'll plan it.";

const BASE_SUGGESTIONS = [
  {
    label: "Help me choose a region",
    answer: "Start with the feeling you want: Manuel Antonio for easy wildlife, Uvita for a slower wild coast, Tamarindo for surf and energy, or Guanacaste for sun and polished resorts. The map makes the trade-offs easy to see.",
    action: { label: "Compare regions", page: "map" },
  },
  {
    label: "Build my trip",
    answer: "Tell me your dates, group, pace, and must-dos. I'll shape those into a day-by-day that respects drive times, weather, and the rhythm of the coast.",
    action: { label: "Start my plan", page: "build" },
  },
  {
    label: "How does booking work?",
    answer: "Choose the experiences you love, reserve them with the listed deposit, and TicoWild coordinates confirmation with the operator. You can build the whole trip first without committing.",
    action: { label: "Browse experiences", page: "activities" },
  },
];

const PAGE_SUGGESTIONS = {
  home: BASE_SUGGESTIONS,
  today: [
    { label: "Plan around today's conditions", answer: "Put weather-sensitive adventures early, keep the afternoon flexible, and save an easy beach, food, or sunset stop as your backup. I'll build that rhythm into the day.", action: { label: "Build today's plan", page: "build" } },
    { label: "Show me nearby experiences", answer: "The activity list is the quickest way to compare what fits your region, energy, and budget right now.", action: { label: "Browse experiences", page: "activities" } },
  ],
  activities: [
    { label: "Show me your best picks", answer: "My highest-rated choices balance the operator, season, value, and how memorable the experience really is — not just the biggest star count.", action: { label: "See Rico's rankings", page: "activities" } },
    { label: "Turn picks into a trip", answer: "Choose one or two must-dos first. Then I'll space the rest around travel time and recovery so the trip feels exciting, not exhausting.", action: { label: "Build my itinerary", page: "build" } },
  ],
  eat: [
    { label: "Help me eat like a local", answer: "Look for a busy soda at lunch, order the casado or catch of the day, and save the view-driven places for sunset. The local picks here skip the tourist-trap markup.", action: { label: "Explore the Insider Guide", page: "insider" } },
    { label: "Pair food with my itinerary", answer: "Build the day first, then leave room for a nearby lunch and an unhurried sunset dinner instead of driving across the coast for a table.", action: { label: "Build my trip", page: "build" } },
  ],
  insider: [
    { label: "Show me the local highlights", answer: "Start with the public preview for a taste of the coast. A confirmed TicoWild booking unlocks the full collection of beaches, local food, savings, and low-cost discoveries.", action: { label: "Explore the Insider Guide", page: "insider" } },
    { label: "Unlock the full guide", answer: "Build the trip you want and confirm a TicoWild booking. Your full Insider Guide then travels with you, organized around the stops in your route.", action: { label: "Start my plan", page: "build" } },
  ],
  deals: [
    { label: "Find the best value", answer: "Mix one signature paid adventure with free beaches, waterfalls, viewpoints, and local food. That keeps the trip memorable without paying tourist prices all day.", action: { label: "See the Insider Guide", page: "insider" } },
    { label: "Use these in a real trip", answer: "I can build around the experiences you want first, then layer in nearby savings without sending you zig-zagging across the country.", action: { label: "Build my trip", page: "build" } },
  ],
  map: [
    { label: "Which region fits me?", answer: "Choose the coast by vibe first: wildlife and convenience, surf and nightlife, quiet jungle, or resort comfort. Then compare drive time from your airport before adding tours.", action: { label: "Build with my region", page: "build" } },
    { label: "Show me what I can do", answer: "Once a region catches your eye, compare its experiences by energy, duration, and price.", action: { label: "Browse experiences", page: "activities" } },
  ],
  tico: [
    { label: "Plan with Rico", answer: "Now you know the bird. Give me your dates and the kind of days you love, and I'll turn them into a Costa Rica plan that actually flows.", action: { label: "Build my trip", page: "build" } },
    { label: "See Rico's honest picks", answer: "I score experiences on more than popularity. Season, value, local character, and operator quality all count.", action: { label: "See my rankings", page: "activities" } },
  ],
  detail: [
    { label: "What should I pair with this?", answer: "Pair a high-energy morning with an easy beach or sunset meal. If this is already a relaxed experience, add one signature adventure nearby rather than another long drive.", action: { label: "Browse compatible ideas", page: "activities" } },
    { label: "Fit it into my itinerary", answer: "Add what you love, then use the planner to order everything around region, timing, and pace.", action: { label: "Open my trip", page: "portal" } },
  ],
  packages: [
    { label: "Tailor one to me", answer: "Use a package as the spine, then adjust the pace, region, and signature experiences around your group. You don't have to accept a cookie-cutter week.", action: { label: "Personalize a trip", page: "build" } },
    { label: "Compare individual experiences", answer: "Browse the activity rankings when you want to swap a day or build from scratch.", action: { label: "Browse experiences", page: "activities" } },
  ],
  build: [
    { label: "How should I pace the trip?", answer: "Anchor each day with one main experience. Keep arrival and transfer days light, alternate high-energy and easy days, and leave one flexible window for weather or a discovery you make there." },
    { label: "Browse before I decide", answer: "Start with one must-do from the ranked experiences, then come back and I'll shape the rest around it.", action: { label: "See Rico's picks", page: "activities" } },
  ],
  portal: [
    { label: "Help me balance these days", answer: "I look for back-to-back long drives, too many early starts, and clusters of high-energy activities. A strong trip has one clear highlight per day and room to breathe.", action: { label: "Fine-tune my plan", page: "build" } },
    { label: "Add another experience", answer: "Choose something close to a region already in your trip. That adds variety without turning your vacation into a road rally.", action: { label: "Browse experiences", page: "activities" } },
  ],
  guide: [
    { label: "Show me the coast", answer: "Use the map to connect the beaches and local spots you like with realistic regions and travel time.", action: { label: "Open the map", page: "map" } },
    { label: "Build around these places", answer: "Pick your home bases first, then I'll add experiences and breathing room around them.", action: { label: "Build my trip", page: "build" } },
  ],
  why: BASE_SUGGESTIONS,
  partner: [
    { label: "What makes a strong partner?", answer: "Reliable communication, safe operations, transparent pricing, and a consistently excellent guest experience. TicoWild is intentionally selective so travelers can trust what they see.", action: { label: "Review the partner page", page: "partner" } },
    { label: "Explore the traveler experience", answer: "See the same experiences and planning flow travelers use before deciding whether the network fits your business.", action: { label: "Browse experiences", page: "activities" } },
  ],
  john: BASE_SUGGESTIONS,
  ask: BASE_SUGGESTIONS,
};

export function ticoGreeting(page = "home", tripCount = 0) {
  const normalizedPage = page === "builder" ? "build" : page;
  if (normalizedPage === "portal" && tripCount === 0) {
    return { text: "Your trip is a blank canvas. Add one experience you love and I'll help the rest of the days fall into place.", mood: "happy" };
  }
  if (normalizedPage === "portal" && tripCount > 0) {
    return { text: `You have ${tripCount} experience${tripCount === 1 ? "" : "s"} saved. Want me to check the pace and shape the days?`, mood: "excited" };
  }
  return ticoPageLine(normalizedPage);
}

export function ticoPageSuggestions(page = "home") {
  const normalizedPage = page === "builder" ? "build" : page;
  return PAGE_SUGGESTIONS[normalizedPage] || BASE_SUGGESTIONS;
}

// Match a user message to the best intent (simple keyword scoring).
export function ticoAnswer(input) {
  const q = (input || "").toLowerCase();
  if (!q.trim()) return { text: FALLBACK };
  let best = null, bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const k of intent.keys) if (q.includes(k)) score += k.length; // longer match = stronger
    if (score > bestScore) { bestScore = score; best = intent; }
  }
  if (!best) return { text: FALLBACK };
  return { text: best.answer, action: best.action || null };
}
