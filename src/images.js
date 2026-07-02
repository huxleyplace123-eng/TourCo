// Real imagery per activity/region. These are hand-picked, hotlinkable Unsplash
// CDN photo IDs (the `images.unsplash.com/photo-...` form, which works without an
// API key — unlike the deprecated source.unsplash.com service). The gradient in
// each card stays underneath as an instant fallback while the photo loads or if
// it's unavailable offline. Replace any ID with your own licensed photo later.

const cdn = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

// Curated Costa Rica / adventure photos per category.
const BY_CATEGORY = {
  "Deep Sea Fishing": "photo-1544551763-46a013bb70d5", // boat on open ocean
  "ATV Tours": "photo-1558980664-10e7170b5df9", // atv / off-road
  "Catamaran Cruises": "photo-1507525428034-b723cf961d3e", // sailing / turquoise sea
  Snorkeling: "photo-1544551763-92ab472cad5d", // snorkel / reef
  "Surf Lessons": "photo-1502680390469-be75c86b636f", // surfer
  Ziplining: "photo-1622977266039-dbb162254c12", // rainforest canopy
  "Wildlife Night Tours": "photo-1547721064-da6cfb341d50", // sloth / wildlife
  "Whale & Dolphin Watching": "photo-1568430462989-44163eb1752f", // whale tail
  "White Water Rafting": "photo-1530866495561-507c9faab2ed", // rafting
  "Waterfall Adventures": "photo-1432405972618-c60b0225b8f9", // jungle waterfall
  Paragliding: "photo-1622396636133-ba43f812bc35", // paraglider over coast
  "Private Transportation": "photo-1502920917128-1aa500764cbd", // road through jungle
  "Adult Group Weekends": "photo-1520250497591-112f2f40a3f4", // friends beach
  "Honeymoon Experiences": "photo-1518621736915-f3b1c41bfd00", // couple sunset beach
  "Luxury Private Tours": "photo-1567899378494-47b22a2ae96a", // luxury yacht
};

const BY_REGION = {
  "Manuel Antonio": "photo-1580094777767-4a6b8f7f9a2e",
  Quepos: "photo-1516815231560-8f41ec531527",
  Uvita: "photo-1552733407-5d5c46c3bb3b",
  Dominical: "photo-1502680390469-be75c86b636f",
  "Jacó": "photo-1544644181-1484b3fdfc62",
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

// Cinematic hero photo per curated package (by package id).
const BY_PACKAGE = {
  p1: "photo-1533105079780-92b9be482077", // family / beach
  p2: "photo-1507525428034-b723cf961d3e", // group / boat
  p3: "photo-1544551763-46a013bb70d5",   // fishing / ocean
  p4: "photo-1518621736915-f3b1c41bfd00", // honeymoon / couple sunset
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
