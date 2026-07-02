// TicoWild — real Costa Rica map landmarks, each at its ACTUAL lat/long
// (from geodata sources). These extend the Explore Map beyond tours/eat/bars
// into a comprehensive country map: national parks, waterfalls, volcanoes,
// wildlife hotspots, viewpoints, airports, and gateway towns.

export const landmarks = [
  // ── National parks & reserves ──
  { id: "np1", kind: "park", name: "Manuel Antonio National Park", lat: 9.39, lng: -84.14, blurb: "Costa Rica's most-visited park — sloths, monkeys & white-sand beaches on the 'Sloth Trail'." },
  { id: "np2", kind: "park", name: "Corcovado National Park", lat: 8.57, lng: -83.57, blurb: "'The most biologically intense place on Earth' — jaguars, tapirs, all 4 monkey species. Guide required." },
  { id: "np3", kind: "park", name: "Tenorio Volcano N.P.", lat: 10.66, lng: -84.97, blurb: "Home of Río Celeste's surreal sky-blue river & waterfall." },
  { id: "np4", kind: "park", name: "Marino Ballena N.P.", lat: 9.14, lng: -83.74, blurb: "The Whale's Tail sandbar + prime humpback whale watching (Uvita)." },
  { id: "np5", kind: "park", name: "Arenal Volcano N.P.", lat: 10.46, lng: -84.70, blurb: "Iconic cone volcano over La Fortuna — hikes, hanging bridges & hot springs." },
  { id: "np6", kind: "park", name: "Monteverde Cloud Forest", lat: 10.30, lng: -84.80, blurb: "Misty cloud forest — quetzals, hanging bridges, and the original canopy ziplines." },

  // ── Waterfalls ──
  { id: "wf1", kind: "waterfall", name: "Nauyaca Waterfalls", lat: 9.29, lng: -83.79, blurb: "Two-tier 197ft falls with a huge natural swimming pool — near Dominical." },
  { id: "wf2", kind: "waterfall", name: "Río Celeste Waterfall", lat: 10.66, lng: -84.97, blurb: "The famous milky-blue waterfall in Tenorio — pure Costa Rica magic." },
  { id: "wf3", kind: "waterfall", name: "La Fortuna Waterfall", lat: 10.44, lng: -84.66, blurb: "A 200ft jungle cascade near Arenal — 500 steps down to a cool swim." },

  // ── Wildlife hotspots ──
  { id: "wl1", kind: "wildlife", name: "Sierpe Mangroves", lat: 8.86, lng: -83.47, blurb: "Boat through Central America's largest mangrove — birds, crocs, gateway to Drake Bay." },
  { id: "wl2", kind: "wildlife", name: "Tárcoles Crocodile Bridge", lat: 9.77, lng: -84.63, blurb: "Watch massive wild crocodiles from the bridge — free, on the way to Jacó." },
  { id: "wl3", kind: "wildlife", name: "Caño Island Biological Reserve", lat: 8.72, lng: -83.88, blurb: "Costa Rica's best snorkeling & diving — rays, turtles, reef sharks." },

  // ── Viewpoints ──
  { id: "vp1", kind: "view", name: "Nauyaca Ridge Lookout", lat: 9.30, lng: -83.83, blurb: "Panoramic ridge over the southern jungle & coast." },
  { id: "vp2", kind: "view", name: "Cerro Tortuga Viewpoint", lat: 9.44, lng: -84.15, blurb: "Sweeping Pacific & Manuel Antonio coastline views at golden hour." },

  // ── Airports (gateways) ──
  { id: "ap1", kind: "airport", name: "San José Intl (SJO)", lat: 9.998, lng: -84.204, blurb: "The main international gateway — most trips start here." },
  { id: "ap2", kind: "airport", name: "Liberia Intl (LIR)", lat: 10.60, lng: -85.54, blurb: "Guanacaste's international airport — closest for Tamarindo & the NW beaches." },
  { id: "ap3", kind: "airport", name: "Quepos Airport (XQP)", lat: 9.44, lng: -84.13, blurb: "Domestic strip — quick hops to Manuel Antonio." },
  { id: "ap4", kind: "airport", name: "Drake Bay Airstrip (DRK)", lat: 8.72, lng: -83.64, blurb: "Tiny airstrip — the fast way into remote Corcovado." },

  // ── Gateway towns ──
  { id: "tw1", kind: "town", name: "San José", lat: 9.93, lng: -84.08, blurb: "The capital — museums, markets, and where most journeys begin." },
  { id: "tw2", kind: "town", name: "La Fortuna", lat: 10.47, lng: -84.65, blurb: "Adventure hub at the foot of Arenal — ziplines, springs, waterfalls." },
];

// Layer definitions for the map (icon names map to lucide in the page).
export const LANDMARK_LAYERS = [
  { key: "park", label: "Parks", icon: "trees", color: "#37E36B" },
  { key: "waterfall", label: "Waterfalls", icon: "droplets", color: "#7FA6E8" },
  { key: "wildlife", label: "Wildlife", icon: "bird", color: "#FFC24B" },
  { key: "view", label: "Viewpoints", icon: "mountain", color: "#FF6B5A" },
  { key: "airport", label: "Airports", icon: "plane", color: "#C4B5FD" },
  { key: "town", label: "Towns", icon: "building", color: "#94A3B8" },
];
