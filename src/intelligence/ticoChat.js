// ── Tico's chat brain ────────────────────────────────────────────────────────
// A lightweight, offline Q&A engine so the corner bird is a real chatbot that
// knows the app + Costa Rica. No API, no cost — keyword-matched intents with
// Tico-voiced answers. Each intent: keywords to match + an answer (+ optional
// action that routes somewhere in the app).

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
    answer: "Easy: add experiences to your trip, put down the 20% deposit, and I get every operator to reconfirm before you go. You can also tell me your dates and I'll build the whole day-by-day for you.",
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
    answer: "Costa Rica is one of the safest countries in Latin America. Main thing: petty theft — never leave anything visible in a car, double-check it actually locked, and use vetted drivers over public buses. Every operator I send you to is vetted.",
    action: { label: "Read the local's guide", page: "guide" },
  },
  {
    keys: ["get around", "transport", "car", "rental", "drive", "shuttle", "taxi", "airport"],
    answer: "Private transfers beat rental cars on the rough coastal roads — and I coordinate every pickup. If you do rent, get a regular car (not an SUV) for most Pacific routes. Fly into SJO (San José) or LIR (Liberia) depending on your region.",
    action: { label: "Plan your route", page: "map" },
  },
  {
    keys: ["eat", "food", "restaurant", "drink", "bar", "nightlife", "soda", "casado"],
    answer: "Eat at 'sodas' — family kitchens with a full casado for $5–8 (vs $15–30 at tourist spots). For the right spot for the moment — best sunset seat, best happy hour, best local kitchen — check my Eat & Drink picks.",
    action: { label: "Where to eat & drink", page: "eat" },
  },
  {
    keys: ["free", "cheap", "budget", "save", "deal", "discount", "money"],
    answer: "Tons is free: every beach, Tárcoles crocodile bridge, free hot springs by Arenal, Río Celeste, miradores, sunsets. Plus verified promo codes and happy hours. I'd never send my flock to a rip-off.",
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
    keys: ["who are you", "what are you", "your name", "tico", "macaw", "about you"],
    answer: "I'm Tico — a scarlet macaw who grew up in the almond trees above Manuel Antonio. I've flown this whole coast and I rate every experience honestly. Think of me as your local intelligence.",
    action: { label: "Meet me properly", page: "tico" },
  },
  {
    keys: ["trip", "itinerary", "plan", "days", "schedule"],
    answer: "Tell me your dates, who's coming, and your vibe — I'll assemble a day-by-day around drive times, tides and season. Watch it build itself.",
    action: { label: "Build my Costa Rica", page: "build" },
  },
];

const GREETING = "¡Hola! I'm Tico, your local macaw. Ask me anything about Costa Rica or how TicoWild works — booking, deposits, the best time to visit, what to do. Or tap a question below.";
const FALLBACK = "Good question. I know the coast better than the app knows itself — try asking about booking, the deposit, the best time to visit, what to do, safety, getting around, or where to go. Or just tell me your vibe and I'll plan it.";

export function ticoGreeting() { return GREETING; }

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
