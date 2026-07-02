// TicoWild — restaurant data. Real Costa Rica spots gathered from current
// travel guides (Tripadvisor, Two Weeks in Costa Rica, Costa Rica Travel Life,
// Costa Rica Vibes, Jungle Beach Vacation). Each carries contextual tags so the
// concierge can answer "best sunset near me" / "best after a tour" / "cheap
// eats" instead of dumping a directory. Prices: $ = budget, $$ = mid, $$$ = up.

export const restaurants = [
  // ── Manuel Antonio / Quepos ──
  { id: "r1", name: "Ronny's Place", region: "Manuel Antonio", cuisine: "Grill · Costa Rican", price: "$$", tags: ["sunset", "view", "romantic", "groups"], photo: "https://ronnysplace.com/wp-content/uploads/2024/09/Ronnysplace2167.jpg", blurb: "Open-air peninsula spot with arguably the best sunset view in Manuel Antonio. Grilled specialties, fun 'Pura Vida' vibe. Reserve for sunset (~5:30pm).", best: "Sunset dinner" },
  { id: "r2", name: "El Avión", region: "Manuel Antonio", cuisine: "Bar · International", price: "$$", tags: ["sunset", "view", "groups", "iconic"], blurb: "Built in and around a real C-123 cargo plane, high above the coast. Wide menu, killer Pacific sunsets, unforgettable setting.", best: "Drinks & a view" },
  { id: "r3", name: "Agua Azul Café", region: "Manuel Antonio", cuisine: "Seafood · International", price: "$$", tags: ["view", "romantic", "lunch", "seafood"], blurb: "Perched above the rainforest with sweeping ocean views. Relaxed but elevated — great for a casual lunch or a romantic dinner. Reserve an ocean-view table.", best: "Romantic dinner" },
  { id: "r4", name: "Oceano Seafood", region: "Manuel Antonio", cuisine: "Seafood", price: "$$", tags: ["seafood", "local", "no-frills"], blurb: "Local institution — no-frills room, incredibly fresh seafood. The mixed seafood platter is the move.", best: "Fresh seafood" },
  { id: "r5", name: "Gabriella's", region: "Manuel Antonio", cuisine: "Steak · Seafood", price: "$$$", tags: ["date-night", "fine-dining", "romantic", "view"], blurb: "Fine-dining steaks, seafood and pasta with top-notch service and ocean views. The splurge dinner.", best: "Special occasion" },
  { id: "r6", name: "Marisquería Jiuberths", region: "Quepos", cuisine: "Seafood", price: "$", tags: ["local", "cheap-eats", "seafood", "authentic"], blurb: "Where the locals eat — no-frills, super-fresh seafood at honest prices. More Ticos than tourists.", best: "Eat like a local" },
  { id: "r7", name: "Emilio's Café", region: "Manuel Antonio", cuisine: "Café · Breakfast", price: "$$", tags: ["breakfast", "lunch", "view", "coffee"], blurb: "Bright café with ocean views — strong coffee, big breakfasts, fresh lunches. Great start-the-day spot.", best: "Breakfast & coffee" },

  // ── Tamarindo / Guanacaste ──
  { id: "r8", name: "Pangas Beach Club", region: "Tamarindo", cuisine: "Seafood · Grill", price: "$$$", tags: ["sunset", "view", "romantic", "date-night", "seafood"], blurb: "Riverside/beachfront under the trees — candlelit dinners with beach and estuary views. Tamarindo's romantic showpiece.", best: "Candlelit dinner" },
  { id: "r9", name: "Green Papaya Taco Bar", region: "Tamarindo", cuisine: "Tacos · Mexican", price: "$", tags: ["cheap-eats", "casual", "groups", "vegetarian"], blurb: "Fresh, healthy, affordable tacos with great music and a cozy setting. Easy crowd-pleaser.", best: "Casual & cheap" },
  { id: "r10", name: "Wabi Sabi Sushi", region: "Tamarindo", cuisine: "Sushi · Japanese", price: "$$", tags: ["date-night", "seafood", "casual"], blurb: "Fresh sushi and sashimi in a relaxed room — a nice change of pace from grilled fish.", best: "Sushi night" },
  { id: "r11", name: "Antichi Sapori", region: "Tamarindo", cuisine: "Italian", price: "$$", tags: ["romantic", "date-night", "family"], blurb: "Authentic Italian — homemade pasta and seafood. Comforting and consistent.", best: "Italian craving" },

  // ── Uvita / Dominical ──
  { id: "r12", name: "Los Laureles", region: "Uvita", cuisine: "Costa Rican · Soda", price: "$", tags: ["local", "cheap-eats", "family", "authentic"], blurb: "The best local food at good prices — casados, burgers, pizza and seafood. A true Tico soda favorite.", best: "Authentic Tico food" },
  { id: "r13", name: "Soda Ranchito Doña María", region: "Uvita", cuisine: "Costa Rican · Soda", price: "$", tags: ["local", "cheap-eats", "breakfast", "authentic"], blurb: "Classic family soda — real Costa Rican home cooking. Open weekdays 7am–4pm. Order the casado.", best: "Local lunch" },
  { id: "r14", name: "Aracari (La Cusinga)", region: "Uvita", cuisine: "Seafood · Farm-to-table", price: "$$$", tags: ["view", "romantic", "fine-dining", "seafood"], blurb: "Ocean-view dining at La Cusinga Lodge — excellent seafood pasta and sustainable, local ingredients.", best: "Romantic ocean view" },
  { id: "r15", name: "El Pescado Loco", region: "Dominical", cuisine: "Seafood · Tacos", price: "$", tags: ["cheap-eats", "seafood", "casual", "lunch"], blurb: "Fish & shrimp tacos, fish & chips, and big sandwiches. The go-to quick, tasty seafood stop.", best: "Quick seafood" },
  { id: "r16", name: "Sabor Español", region: "Dominical", cuisine: "Spanish · Seafood", price: "$$", tags: ["date-night", "seafood", "romantic"], blurb: "Spanish seafood — grilled shellfish (mariscada) and fish with clams in white wine. A little special.", best: "Spanish seafood" },

  // ── Jacó ──
  { id: "r17", name: "El Hicaco", region: "Jacó", cuisine: "Seafood", price: "$$$", tags: ["seafood", "view", "date-night", "romantic"], blurb: "Beachfront Jacó classic — fresh whole fish and seafood towers right on the sand. Sunset-side.", best: "Beachfront seafood" },
  { id: "r18", name: "Tsunami Sushi", region: "Jacó", cuisine: "Sushi · Japanese", price: "$$", tags: ["casual", "groups", "seafood"], blurb: "Popular, lively sushi spot — big rolls, good for groups after a beach day.", best: "Group sushi" },
];

// Contextual "collections" the Restaurants page uses instead of a flat list.
export const DINING_COLLECTIONS = [
  { key: "sunset", label: "Best for sunset 🌅", tag: "sunset" },
  { key: "seafood", label: "Fresh seafood 🐟", tag: "seafood" },
  { key: "local", label: "Eat like a local 🇨🇷", tag: "local" },
  { key: "date-night", label: "Date night 💕", tag: "date-night" },
  { key: "cheap-eats", label: "Cheap eats 💵", tag: "cheap-eats" },
  { key: "family", label: "Good for families 👨‍👩‍👧", tag: "family" },
  { key: "view", label: "Best views 🏝️", tag: "view" },
  { key: "breakfast", label: "Breakfast & coffee ☕", tag: "breakfast" },
];
