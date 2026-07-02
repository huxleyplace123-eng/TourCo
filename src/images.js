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

// Cinematic hero — jungle-meets-coast aerial.
const HERO = "photo-1518259102261-b40117eabbc9";

// Cinematic hero photo per curated package (by package id).
const BY_PACKAGE = {
  p1: "photo-1533105079780-92b9be482077", // family / beach
  p2: "photo-1507525428034-b723cf961d3e", // group / boat
  p3: "photo-1544551763-46a013bb70d5",   // fishing / ocean
  p4: "photo-1518621736915-f3b1c41bfd00", // honeymoon / couple sunset
  p5: "photo-1432405972618-c60b0225b8f9", // rainforest / waterfall
};

export const activityImage = (a, w) => cdn(BY_CATEGORY[a.category] || "photo-1518259102261-b40117eabbc9", w);
export const regionImage = (name, w) => cdn(BY_REGION[name] || "photo-1518259102261-b40117eabbc9", w);
export const packageImage = (id, w = 1000) => cdn(BY_PACKAGE[id] || HERO, w);
export const heroImage = (w = 1600) => cdn(HERO, w);
