// Real imagery per activity/region. These are hand-picked, hotlinkable Unsplash
// CDN photo IDs (the `images.unsplash.com/photo-...` form, which works without an
// API key — unlike the deprecated source.unsplash.com service). The gradient in
// each card stays underneath as an instant fallback while the photo loads or if
// it's unavailable offline. Replace any ID with your own licensed photo later.

const cdn = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

// Generic helper for building an Unsplash CDN url from a raw photo id (used by
// content that carries its own image id, e.g. Tico's knowledge cards).
export const cdnImage = (id, w = 800) => cdn(id, w);

// Curated Costa Rica / adventure photos per category.
const BY_CATEGORY = {
  "Deep Sea Fishing": "photo-1544551763-46a013bb70d5", // boat on open ocean
  "ATV Tours": "photo-1558980664-10e7170b5df9", // atv / off-road
  "Catamaran Cruises": "photo-1507525428034-b723cf961d3e", // sailing / turquoise sea
  Snorkeling: "photo-1544551763-92ab472cad5d", // snorkel / reef
  "Surf Lessons": "photo-1502680390469-be75c86b636f", // surfer
  Ziplining: "photo-1622977266039-dbb162254c12", // rainforest canopy
  "Wildlife Night Tours": "photo-1559253664-ca249d4608c6", // red-eyed tree frog (Costa Rica night-tour icon)
  "Whale & Dolphin Watching": "photo-1568430462989-44163eb1752f", // whale tail
  "White Water Rafting": "photo-1530866495561-507c9faab2ed", // rafting
  "Waterfall Adventures": "photo-1432405972618-c60b0225b8f9", // jungle waterfall
  Paragliding: "photo-1622396636133-ba43f812bc35", // paraglider over coast
  "Private Transportation": "photo-1502920917128-1aa500764cbd", // road through jungle
  "Adult Group Weekends": "photo-1520250497591-112f2f40a3f4", // friends beach
  "Honeymoon Experiences": "photo-1519741497674-611481863552", // couple, golden-hour, romantic
  "Luxury Private Tours": "photo-1567899378494-47b22a2ae96a", // luxury yacht
};

const BY_REGION = {
  "Manuel Antonio": "photo-1580094777767-4a6b8f7f9a2e",
  Quepos: "photo-1516815231560-8f41ec531527",
  Uvita: "photo-1552733407-5d5c46c3bb3b",
  Dominical: "photo-1502680390469-be75c86b636f",
  "Jacó": "photo-1502680390469-be75c86b636f",
  Tamarindo: "photo-1520942702018-0862200e6873",
  Guanacaste: "photo-1510414842594-a61c69b5ae57",
};

// Cinematic hero carousel — gorgeous Costa Rica scenes travelers actually book.
// Verified hotlinkable Unsplash CDN IDs (all 200 OK). They cross-fade behind
// the hero so the backdrop feels alive: beach, fishing, sailing, zipline, etc.
const HERO_SLIDES = [
  { id: "photo-1552733407-5d5c46c3bb3b", label: "Pacific coastline" },   // beach / coast
  { id: "photo-1507525428034-b723cf961d3e", label: "Turquoise shores" }, // catamaran / sea
  { id: "photo-1544551763-46a013bb70d5", label: "Offshore fishing" },    // fishing boat
  { id: "photo-1622977266039-dbb162254c12", label: "Rainforest canopy" },// zipline / jungle
  { id: "photo-1432405972618-c60b0225b8f9", label: "Jungle waterfalls" },// waterfall
  { id: "photo-1502680390469-be75c86b636f", label: "Surf & sunset" },    // surf
];
const HERO = HERO_SLIDES[0].id;

export const heroSlides = (w = 1900) => HERO_SLIDES.map((s) => ({ src: cdn(s.id, w), label: s.label }));

// ── Themed hero slide sets ── vivid, cross-fading backdrops per surface. These
// are DELIBERATELY different photos from HERO_SLIDES / the Meet Tico hero, so no
// two hero areas share imagery. Fishing is the star of the home + fishing sets.
const HERO_SETS = {
  // Homepage / dashboard — the GREATEST HITS of Costa Rica: the single most
  // jaw-dropping shot from each category, so the hero represents the whole app.
  // Interleaved (land → water → air → jungle) so every slide feels different.
  home: [
    { id: "photo-1745208746272-8d3b979d5f92", label: "Arenal volcano" },       // volcano cone in jungle
    { id: "photo-1632904074880-b77f02b6d01e", label: "Parasail the coast" },   // parasailing over ocean
    { id: "photo-1620658927695-c33df6fb8130", label: "Jungle waterfall" },     // waterfall into turquoise pool
    { id: "photo-1502680390469-be75c86b636f", label: "Surf the Pacific" },     // surfer barrel
    { id: "photo-1568430462989-44163eb1752f", label: "Whales of Uvita" },      // humpback breach
    { id: "photo-1679117730976-cdb5f6b05b88", label: "Zip the canopy" },       // ziplining
    { id: "photo-1519046904884-53103b34b206", label: "Hidden cove" },          // secluded palm cove
    { id: "photo-1708748978230-510e06b24530", label: "Offshore fishing" },     // sport fishing rods + wake
    { id: "photo-1544551763-92ab472cad5d", label: "Dive the reef" },           // snorkeling / reef
    { id: "photo-1505142468610-359e7d316be0", label: "Turquoise break" },      // aerial waves / beach
  ],
  // Activities — the FULL adventure reel: every kind of tour you can book in
  // Costa Rica, most exciting first, no two similar scenes back to back.
  activities: [
    { id: "photo-1679117730976-cdb5f6b05b88", label: "Zipline the canopy" },   // ziplining
    { id: "photo-1632904074880-b77f02b6d01e", label: "Parasail the coast" },   // parasailing over ocean
    { id: "photo-1530866495561-507c9faab2ed", label: "Hit the rapids" },       // white-water rafting
    { id: "photo-1502680390469-be75c86b636f", label: "Catch a wave" },         // surfing barrel
    { id: "photo-1729730626717-922a7f8f79d6", label: "Rip the jungle trails" },// ATV / quad riding
    { id: "photo-1708748978230-510e06b24530", label: "Reel in the big one" },  // sport fishing
    { id: "photo-1745208746272-8d3b979d5f92", label: "Hike a volcano" },       // Arenal volcano
    { id: "photo-1544551763-92ab472cad5d", label: "Dive the reef" },           // snorkeling
    { id: "photo-1568430462989-44163eb1752f", label: "Watch the whales" },     // whale watching
    { id: "photo-1620658927695-c33df6fb8130", label: "Chase waterfalls" },     // jungle waterfall
    { id: "photo-1762237855157-eb0ba25e39d4", label: "Party 'til sunrise" },   // nightlife / beach-bar party
  ],
  // Pure fishing set — for any fishing-forward surface.
  fishing: [
    { id: "photo-1707314175646-7f40247f36c0", label: "Rod over the blue" },
    { id: "photo-1537872384762-e785271d14f8", label: "Big-game reel" },
    { id: "photo-1619054976487-7198b8924922", label: "Reels ready" },          // rack of reels
    { id: "photo-1625183656263-171183307b15", label: "On the water" },
    { id: "photo-1515631604561-23e0be68ee06", label: "Fish on!" },             // landing a fish
    { id: "photo-1708748978230-510e06b24530", label: "Trolling the wake" },
  ],
  // Eat & Drink — beautiful PLACES full of people having fun (wide, not close-up).
  eat: [
    { id: "photo-1764397576374-7ba65a81d821", label: "Sunset on the sand" },   // beachside dining at golden hour
    { id: "photo-1781195480848-d8344ffc94dc", label: "Beach club buzz" },      // lively beachfront umbrellas + crowd
    { id: "photo-1528605248644-14dd04022da1", label: "Long-table nights" },    // friends laughing at outdoor dinner
    { id: "photo-1559339352-11d035aa65de", label: "Fresh off the boat" },      // open-air seaside restaurant
    { id: "photo-1517457373958-b7bdd4587205", label: "Rooftop after dark" },   // lively rooftop bar crowd
    { id: "photo-1436076863939-06870fe779c2", label: "Sunset toast" },         // beers clinking at sunset
  ],
  // Deals — savings on food + drink + nightlife, vivid and tempting.
  deals: [
    { id: "photo-1551024709-8f23befc6f87", label: "2-for-1 cocktails" },       // colorful cocktails
    { id: "photo-1436076863939-06870fe779c2", label: "Happy-hour pours" },     // beers at sunset
    { id: "photo-1541532713592-79a0317b6b77", label: "Group deals, more fun" },// friends toasting
    { id: "photo-1566417713940-fe7c737a9ef2", label: "Nightlife savings" },    // bar / neon
    { id: "photo-1559339352-11d035aa65de", label: "Dine for less" },           // seaside restaurant
  ],
  // Local's Guide — exploring: trails, viewpoints, the map, wildlife.
  guide: [
    { id: "photo-1551632811-561732d1e306", label: "On the trail" },            // backpacker on green trail
    { id: "photo-1440581572325-0bea30075d9d", label: "Into the rainforest" },  // sunlit forest path
    { id: "photo-1488646953014-85cb44e25828", label: "Plot the route" },       // map + camera + pack flatlay
    { id: "photo-1620658927695-c33df6fb8130", label: "Chasing waterfalls" },   // jungle waterfall
    { id: "photo-1540573133985-87b6da6d54a9", label: "Meet the locals" },      // monkey / wildlife
    { id: "photo-1473116763249-2faaef81ccda", label: "End at the beach" },     // sunset beach
  ],
};

// Return a themed slide set as {src,label}[] (falls back to the default heroSlides).
export const themedSlides = (key, w = 1900) =>
  (HERO_SETS[key] || HERO_SLIDES).map((s) => ({ src: cdn(s.id, w), label: s.label }));

// Cinematic hero photo per curated package (by package id).
const BY_PACKAGE = {
  p1: "photo-1533105079780-92b9be482077", // family / beach
  p2: "photo-1507525428034-b723cf961d3e", // group / boat
  p3: "photo-1544551763-46a013bb70d5",   // fishing / ocean
  p4: "photo-1519741497674-611481863552", // honeymoon / couple, golden-hour
  p5: "photo-1432405972618-c60b0225b8f9", // rainforest / waterfall
};

// People — founder + traveler portraits (Unsplash face crops).
const PEOPLE = {
  john: "photo-1500648767791-00dcc994a43e",   // friendly guide portrait
  sarah: "photo-1544005313-94ddf0286df2",       // woman
  delgado: "photo-1502823403499-6ccfcf4fb453",  // man
  crew: "photo-1517841905240-472988babdf9",     // young man
  emma: "photo-1438761681033-6461ffad8d80",     // woman 2
};

// Story scene photos for the Why page (paired with each pillar).
const WHY_SCENES = {
  vetted: "photo-1506929562872-bb421503ef21",   // beach guide / coast
  pricing: "photo-1454165804606-c3d57bc86b40",  // clean / trust
  concierge: "photo-1521737604893-d14cc237f11d", // people / support
  personal: "photo-1533105079780-92b9be482077", // family joy
};

export const activityImage = (a, w) => cdn(BY_CATEGORY[a.category] || "photo-1518259102261-b40117eabbc9", w);
export const regionImage = (name, w) => cdn(BY_REGION[name] || "photo-1518259102261-b40117eabbc9", w);
export const packageImage = (id, w = 1000) => cdn(BY_PACKAGE[id] || HERO, w);
export const personImage = (key, w = 200) => cdn(PEOPLE[key] || PEOPLE.john, w);
export const sceneImage = (key, w = 900) => cdn(WHY_SCENES[key] || HERO, w);
export const heroImage = (w = 1600) => cdn(HERO, w);

// Cinematic backdrop per sub-page hero (keeps every page on-brand + distinct).
const PAGE_HERO = {
  activities: "photo-1544551763-46a013bb70d5",  // ocean adventure
  packages: "photo-1507525428034-b723cf961d3e", // turquoise coast
  john: "photo-1516815231560-8f41ec531527",     // dock / local
  guide: "photo-1432405972618-c60b0225b8f9",     // waterfall
  why: "photo-1518259102261-b40117eabbc9",
  partner: "photo-1521737604893-d14cc237f11d",   // people
  portal: "photo-1552733407-5d5c46c3bb3b",        // beach
};
export const pageHero = (key, w = 1600) => cdn(PAGE_HERO[key] || HERO, w);

// Restaurant photos — chosen by the spot's vibe so cards look distinct.
const FOOD = {
  sunset: "photo-1414235077428-338989a2e8c0",     // dim romantic dining
  seafood: "photo-1559339352-11d035aa65de",        // seafood plate
  local: "photo-1550966871-3ed3cdb5ed0c",          // rustic local food
  sushi: "photo-1579584425555-c3ce17fd4351",
  tacos: "photo-1565299624946-b28f40a0ae38",
  cafe: "photo-1517248135467-4c7edcad34c4",        // café / breakfast
  fine: "photo-1424847651672-bf20a4b0982b",        // plated fine dining
  default: "photo-1555396273-367ea4eb4db5",        // general restaurant
};
// Deal photos — each deal carries its own explicit, correct photo URL.
export function dealImage(d) {
  return d.photo || cdn(HERO, 700);
}

// Beach photos — vary by vibe.
const BEACH_IMG = {
  swimming: "photo-1507525428034-b723cf961d3e",
  surf: "photo-1502680390469-be75c86b636f",
  snorkel: "photo-1544551763-92ab472cad5d",
  sunset: "photo-1552733407-5d5c46c3bb3b",
  hidden: "photo-1559827260-dc66d52bef19",
  default: "photo-1552733407-5d5c46c3bb3b",
};
export function beachImage(b, w = 700) {
  const t = b.tags || [];
  const key = /surf/.test(t.join(" ")) ? "surf" : t.includes("snorkel") ? "snorkel" : t.includes("swimming") ? "swimming" : t.includes("hidden") ? "hidden" : "sunset";
  return cdn(BEACH_IMG[key] || BEACH_IMG.default, w);
}
// Bar / nightlife photos.
const BAR_IMG = {
  sunset: "photo-1470337458703-46ad1756a187",
  nightclub: "photo-1566417713940-fe7c737a9ef2",
  "craft-beer": "photo-1436076863939-06870fe779c2",
  "live-music": "photo-1493676304819-0d7a8d026dcf",
  default: "photo-1514362545857-3bc16c4c7d1b",
};
export function barImage(bar, w = 700) {
  const t = bar.tags || [];
  const key = t.includes("nightclub") ? "nightclub" : t.includes("craft-beer") ? "craft-beer" : t.includes("live-music") ? "live-music" : "sunset";
  return cdn(BAR_IMG[key] || BAR_IMG.default, w);
}

export function restaurantImage(r, w = 700) {
  if (r.photo) return r.photo; // real venue photo (Photo component falls back to gradient on error)
  let key = "default";
  const t = r.tags || [];
  if (/Sushi/.test(r.cuisine)) key = "sushi";
  else if (/Taco|Mexican/.test(r.cuisine)) key = "tacos";
  else if (/Café|Breakfast/.test(r.cuisine)) key = "cafe";
  else if (t.includes("fine-dining")) key = "fine";
  else if (t.includes("sunset")) key = "sunset";
  else if (t.includes("local")) key = "local";
  else if (/Seafood/.test(r.cuisine)) key = "seafood";
  return cdn(FOOD[key] || FOOD.default, w);
}
