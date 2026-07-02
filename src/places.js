// TicoWild — places & deals data. Real Costa Rica spots gathered from current
// travel guides (mytanfeet, Two Weeks in CR, Costa Rica Vibes, Tamaluxury,
// Native's Way, Costa Rica Happy Hour, Costa Rica Travel Blog). Beaches, bars/
// nightlife, and verified deals — each tagged so the concierge can answer in
// context, not dump a directory.

// ── BEACHES ──────────────────────────────────────────────────────────────────
export const beaches = [
  { id: "b1", name: "Playa Manuel Antonio", region: "Manuel Antonio", tags: ["swimming", "family", "wildlife", "calm"], blurb: "Postcard-perfect: calm blue water, white sand, palms. Inside the national park — sloths, monkeys and iguanas right on the beach.", tip: "Go early; the park has a daily entry limit and closes some days." },
  { id: "b2", name: "Playa Espadilla", region: "Manuel Antonio", tags: ["swimming", "sunset", "surf-beginner", "lively"], blurb: "The long public beach outside the park — great for a swim, boogie-boarding and sunset. Lively with vendors and beach bars.", tip: "Watch for rip currents; swim near other people." },
  { id: "b3", name: "Playa Uvita (Whale's Tail)", region: "Uvita", tags: ["sunset", "iconic", "family", "low-tide"], blurb: "Soft dark sand and the famous whale-tail sandbar — walk out ~1.25 miles to the tip at low tide. Stunning Pacific sunsets.", tip: "Only walkable at low tide — check the tide chart before you go." },
  { id: "b4", name: "Playa Dominical", region: "Dominical", tags: ["surf", "sunset", "laid-back"], blurb: "Serious surfers' beach — big, high-quality waves and killer sunsets. Not the prettiest sand, but the best vibe for wave-riders.", tip: "Strong currents — for confident swimmers/surfers; take a lesson first." },
  { id: "b5", name: "Playa Tamarindo", region: "Tamarindo", tags: ["surf-beginner", "lively", "sunset", "nightlife"], blurb: "Lively surf-town beach with gentle breaks for learning, beach bars, and a laid-back party vibe. Great sunsets.", tip: "Best beginner surf in the morning when it's calmer." },
  { id: "b6", name: "Playa Conchal", region: "Guanacaste", tags: ["swimming", "snorkel", "calm", "scenic"], blurb: "Made of crushed shells instead of sand, with clear turquoise water — one of the most beautiful (and calm) beaches in the country.", tip: "Bring water shoes; the 'sand' is coarse shell." },
  { id: "b7", name: "Playa Jacó", region: "Jacó", tags: ["surf-beginner", "lively", "nightlife", "sunset"], blurb: "Long grey-sand beach with reliable waves for learning and Costa Rica's biggest nightlife scene steps away.", tip: "Party central on weekends Dec–Apr — book quieter nights midweek." },
  { id: "b8", name: "Playa Biesanz", region: "Manuel Antonio", tags: ["snorkel", "calm", "hidden", "family"], blurb: "A small, sheltered cove down a jungle path — calm, clear water perfect for snorkeling and a quiet swim away from crowds.", tip: "A local 'hidden gem' — arrive early to beat the small crowd." },
];

export const BEACH_TAGS = [
  { key: "swimming", label: "Great for swimming 🏊" },
  { key: "surf", label: "Serious surf 🏄" },
  { key: "surf-beginner", label: "Beginner surf 🌊" },
  { key: "snorkel", label: "Snorkeling 🤿" },
  { key: "family", label: "Family-friendly 👨‍👩‍👧" },
  { key: "sunset", label: "Best sunsets 🌅" },
  { key: "hidden", label: "Hidden gems 🌴" },
  { key: "nightlife", label: "Near nightlife 🍹" },
];

// ── BARS & NIGHTLIFE ─────────────────────────────────────────────────────────
export const bars = [
  { id: "n1", name: "El Avión", region: "Manuel Antonio", type: "Bar · Views", tags: ["sunset", "view", "iconic"], happy: null, blurb: "Drinks inside & around a real cargo plane, high over the Pacific — the most iconic sundowner in Manuel Antonio." },
  { id: "n2", name: "El Lagarto", region: "Manuel Antonio", type: "Grill · Bar", tags: ["sunset", "view", "deal"], happy: "2x1 drinks at sunset", blurb: "Open-fire grill and sunset ocean views with a 2-for-1 drinks happy hour." },
  { id: "n3", name: "Barba Roja", region: "Manuel Antonio", type: "Bar · Restaurant", tags: ["sunset", "view", "classic"], happy: "Sunset happy hour", blurb: "A Manuel Antonio tradition since 1975 — hillside views, cocktails, and live nights." },
  { id: "n4", name: "El Patio de Café Milagro", region: "Manuel Antonio", type: "Café · Bar", tags: ["live-music", "deal", "coffee"], happy: "Nightly happy hour 4–6pm", blurb: "Craft beers, coffee cocktails and live music most nights with a 4–6pm happy hour." },
  { id: "n5", name: "Pangas Beach Club", region: "Tamarindo", type: "Beach Club", tags: ["sunset", "view", "deal", "romantic"], happy: "Feet-in-sand happy hour 4:30–6:30pm", blurb: "Relaxed beachfront/riverside club — the go-to for a golden-hour drink with your toes in the sand." },
  { id: "n6", name: "Sharky's", region: "Tamarindo", type: "Sports Bar", tags: ["deal", "groups", "sports"], happy: "Imperials half-price 4–6pm daily", blurb: "Lively sports bar — games on, half-price Imperial beers every afternoon. Group-friendly." },
  { id: "n7", name: "El Vaquero", region: "Tamarindo", type: "Brewpub", tags: ["live-music", "groups", "family"], happy: null, blurb: "Beachfront brewpub — family restaurant by day, live music and after-hours by night." },
  { id: "n8", name: "Crazy Monkey Bar", region: "Tamarindo", type: "Beach Bar", tags: ["sunset", "deal", "view"], happy: "Sunset happy hour 5–7pm", blurb: "Beachfront sunset spot with a 5–7pm happy hour and ocean views." },
  { id: "n9", name: "Backyard Bar", region: "Jacó", type: "Bar · Live Music", tags: ["live-music", "deal", "groups", "surf"], happy: "Famous happy hour", blurb: "Jacó legend right on the beach — famous happy hour, live music, and a surf crowd." },
  { id: "n10", name: "Clarita's Beach Bar", region: "Jacó", type: "Beach Bar", tags: ["sunset", "view", "groups"], happy: null, blurb: "Beachfront legend with sunset views — casual food, cold drinks, party energy on weekends." },
  { id: "n11", name: "PuddleFish Brewery", region: "Jacó", type: "Craft Brewery", tags: ["craft-beer", "groups", "casual"], happy: null, blurb: "Craft beer and fish tacos — Jacó's brewery hangout, chill and group-friendly." },
  { id: "n12", name: "Le Loft", region: "Jacó", type: "Nightclub", tags: ["nightclub", "groups", "late"], happy: null, blurb: "Jacó's top nightclub for 10+ years — DJs, dancing, the late-night move for groups." },
];

export const BAR_TAGS = [
  { key: "sunset", label: "Sunset drinks 🌅" },
  { key: "deal", label: "Happy hour 🍻" },
  { key: "live-music", label: "Live music 🎶" },
  { key: "view", label: "Best views 🏝️" },
  { key: "groups", label: "Good for groups 🍹" },
  { key: "nightclub", label: "Dance & late night 🪩" },
  { key: "craft-beer", label: "Craft beer 🍺" },
];

// ── VERIFIED DEALS & PROMO CODES ─────────────────────────────────────────────
// Real, specific Costa Rica savings gathered from current travel sources
// (Costa Rica Guide, Costa Rica Travel Blog, CR Surf, Paradise Catchers,
// mytanfeet). `code` = a real copy-able promo code where one exists; `save` = the
// actual amount. `featured` marks the marquee deal.
// Each deal has an explicit, correct `photo` so the image always matches the
// deal (a car for car rental, a real zipline for ziplines, etc.) — no fuzzy
// category mapping. All URLs verified hotlinkable.
const IMG = (id, w = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;
export const deals = [
  { id: "d1", title: "15% off tours, cars, hotels & transfers", where: "Costa Rica-wide", type: "Promo code", tag: "tour", photo: IMG("photo-1505142468610-359e7d316be0"), save: "Up to 15%", price: null, code: "CRGDISCOUNT", detail: "One code, no blackout dates — adventure tours, rental cars, lodging & private shuttles, all year.", expires: "No blackout dates", featured: true },
  { id: "d2", title: "Los Cañones Canopy + Hot Springs combo", where: "La Fortuna · Arenal", type: "Combo", tag: "tour", photo: IMG("photo-1622977266039-dbb162254c12"), save: "3-in-1", price: "$90", code: null, detail: "Canopy zipline + Los Lagos hot springs + water slides — one of La Fortuna's best-value days.", expires: "Daily" },
  { id: "d3", title: "Save $11/adult on Sky Adventures zipline", where: "Sky Adventures · Arenal", type: "Discount", tag: "tour", photo: IMG("photo-1622977266039-dbb162254c12"), save: "$11 off", price: null, code: null, detail: "High-adrenaline zipline through the canopy — save $11 adult / $10 student / $9 child, no booking fees.", expires: "Ongoing" },
  { id: "d4", title: "20% off Nauyaca & Manuel Antonio tours", where: "Paddle 9 · Central Pacific", type: "Promo code", tag: "tour", photo: IMG("photo-1432405972618-c60b0225b8f9"), save: "20% off", price: null, code: "PARADISE", detail: "Full-day waterfall tours, Nauyaca Waterfall, and Manuel Antonio Park guided tours.", expires: "Ongoing" },
  { id: "d5", title: "Sunset Sails catamaran — save $5/person", where: "Manuel Antonio", type: "Discount", tag: "tour", photo: IMG("photo-1507525428034-b723cf961d3e"), save: "$5 off", price: null, code: null, detail: "Fresh mahi-mahi cooked on board + complimentary cocktails. $5+ off morning, $3+ off afternoon sails.", expires: "Ongoing" },
  { id: "d6", title: "Kids 0–4 sail free", where: "Planet Dolphin · Manuel Antonio", type: "Family", tag: "tour", photo: IMG("photo-1544551763-46a013bb70d5"), save: "Kids free", price: null, code: null, detail: "Little ones 0–4 ride the catamaran free (small transport fee). Great family day on the water.", expires: "Year-round" },
  { id: "d7", title: "Hot springs pass (no zipline needed)", where: "Los Lagos · La Fortuna", type: "Deal", tag: "tour", photo: IMG("photo-1571003123894-1f0594d2b5d9"), save: "From", price: "$28", code: null, detail: "Not into ziplining? Grab just the hot springs + water-slide pass and still soak in Arenal.", expires: "Daily" },
  { id: "d8", title: "5% off ATV in Uvita", where: "Jungle ATV · Uvita", type: "Promo code", tag: "tour", photo: IMG("photo-1558980664-10e7170b5df9"), save: "5% / rider", price: null, code: "CR_Surf_Travel", detail: "5% off per rider on the backcountry ATV expedition through jungle & river crossings.", expires: "Ongoing" },
  { id: "d9", title: "10–20% off car rental + free extras", where: "Adobe Rent-a-Car", type: "Promo code", tag: "transport", photo: IMG("photo-1502877338535-766e1452684a"), save: "10–20%", price: null, code: "SURF", detail: "Plus free 2nd driver, car seats, surf racks & hotel delivery. Tip: a car beats an SUV for cost.", expires: "Ongoing" },
  { id: "d10", title: "5% off shuttles, buses & ferries", where: "Bookaway", type: "Promo code", tag: "transport", photo: IMG("photo-1464219789935-c2d9d9aba644"), save: "5% off", price: null, code: "PARADISE5", detail: "5% off shared shuttle transfers, buses and ferries countrywide.", expires: "Ongoing" },
  { id: "d11", title: "Green-season pricing", where: "TicoWild vetted operators", type: "Seasonal", tag: "tour", photo: IMG("photo-1552733407-5d5c46c3bb3b"), save: "Up to 20%", price: null, code: null, detail: "May–Nov: lower tour prices, 30–40% cheaper stays, lush jungle, far fewer crowds.", expires: "May–Nov" },
  { id: "d12", title: "Sunset 2-for-1 drinks", where: "El Lagarto · Manuel Antonio", type: "Happy hour", tag: "food", photo: IMG("photo-1470337458703-46ad1756a187"), save: "2-for-1", price: null, code: null, detail: "Two-for-one cocktails at sunset with ocean views. Just show up.", expires: "Daily at sunset" },
  { id: "d13", title: "Half-price Imperials", where: "Sharky's · Tamarindo", type: "Happy hour", tag: "food", photo: IMG("photo-1436076863939-06870fe779c2"), save: "50% off", price: null, code: null, detail: "Half-price Imperial beers, 4–6pm every day.", expires: "Daily 4–6pm" },
  { id: "d14", title: "Casado at a local soda", where: "Sodas countrywide", type: "Local price", tag: "food", photo: IMG("photo-1550966871-3ed3cdb5ed0c"), save: "$5–8", price: "$5–8", code: null, detail: "A full traditional plate for $5–8 at family sodas vs. $15–30 at tourist restaurants.", expires: "Everyday" },
];

export const DEAL_TAGS = [
  { key: "all", label: "All deals" },
  { key: "tour", label: "Tours 🎒" },
  { key: "food", label: "Food & drink 🍽️" },
  { key: "transport", label: "Transport 🚐" },
];

// ── FREE & NEARLY-FREE ── huge value most sites never tell you about.
export const freeThings = [
  { id: "f1", title: "Every beach is free", detail: "By law, all of Costa Rica's coastline is public — hundreds of km of Pacific & Caribbean beaches, no charge.", cost: "Free" },
  { id: "f2", title: "Cahuita National Park", detail: "Donation-based entry: 8km of coastal trails with reliable sloth sightings.", cost: "By donation" },
  { id: "f3", title: "Tarcoles crocodile bridge", detail: "Watch massive wild crocodiles from the bridge — 90 min from San José, totally free.", cost: "Free" },
  { id: "f4", title: "National parks are a steal", detail: "World-class nature for $0–$20 entry vs. pricey private reserves. Manuel Antonio is the classic.", cost: "$0–$20" },
  { id: "f5", title: "Sunsets on the Pacific", detail: "Year-round ~5:45pm sunsets over the ocean — the best show in the country costs nothing.", cost: "Free" },
  { id: "f6", title: "Waterfall swimming holes", detail: "Many jungle waterfalls have free natural pools at the base — ask a local for the quiet ones.", cost: "Free" },
];

// ── MONEY-SAVING TIPS ── practical, real ways to spend less.
export const moneyTips = [
  { id: "m1", tip: "Eat at 'sodas'", detail: "Filling casado meals for $5–8 at family sodas vs. $15–30 at tourist restaurants." },
  { id: "m2", tip: "Travel green season", detail: "May–Nov brings 30–40% lower accommodation prices and fewer crowds." },
  { id: "m3", tip: "Rent a car, not an SUV", detail: "A regular car is far cheaper and handles most Pacific-coast routes just fine." },
  { id: "m4", tip: "Book direct through TicoWild", detail: "No booking fees (OTAs add 5–10%), and every operator is reconfirmed before you go." },
  { id: "m5", tip: "Bundle your transfers", detail: "One flat price for airport + tour rides beats paying per-ride every time." },
  { id: "m6", tip: "Carry small colón", detail: "USD works, but small local cash gets better prices at sodas and markets." },
];
