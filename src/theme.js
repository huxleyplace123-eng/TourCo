// TourCo / TripNest brand tokens — CINEMATIC DARK theme.
// Neon brand hues (teal/emerald/gold/orchid) survive as glowing accents; the
// canvas goes deep midnight so photos, glass, and glow do the heavy lifting.
// Semantic names are kept (sand/white/charcoal) so components flip to dark by
// meaning: `sand` = app canvas, `white` = surface, `charcoal` = primary text.

export const c = {
  // neon accents
  emerald: "#3B82F6",
  jungle: "#0A2E8F",
  teal: "#22D3EE",
  blue: "#38BDF8",
  coral: "#FFD84D",
  gold: "#FFC24B",
  orchid: "#FF6B5A",
  // dark OCEAN-BLUE semantic tokens — deep royal navy so it feels oceanfront
  sand: "#04122E",       // app canvas (deep ocean navy)
  canvas2: "#072148",    // slightly lifted panel bg
  white: "#0A2A54",      // "surface" — cards/panels (rich royal blue)
  surface2: "#0E3564",   // lifted surface
  line: "rgba(120,190,255,.14)", // hairline borders (cool blue tint)
  charcoal: "#F1F7FF",   // primary text (near-white)
  stone: "#93AECF",      // secondary text (cool blue-grey)
  ink: "#04122E",        // deep navy (text on neon buttons)
};

export const FONT =
  "'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

export const grad = {
  hero: `linear-gradient(135deg,#0A2E8F 0%,#3B82F6 45%,#22D3EE 100%)`,
  ocean: `linear-gradient(135deg,#38BDF8,#22D3EE)`,
  jungle: `linear-gradient(135deg,#3B82F6,#0A2E8F)`,
  sunset: `linear-gradient(135deg,#FFD84D,#FFC24B)`,
  orchid: `linear-gradient(135deg,#FF6B5A,#22D3EE)`,
  reef: `linear-gradient(160deg,#22D3EE,#38BDF8 80%)`,
  gold: `linear-gradient(135deg,#FFC24B,#FFD84D)`,
  // aurora background wash for the whole app — ocean blues + a warm sun glow
  aurora: `radial-gradient(60% 80% at 15% 8%, rgba(34,211,238,.20), transparent 60%), radial-gradient(55% 75% at 85% 18%, rgba(56,189,248,.22), transparent 60%), radial-gradient(70% 90% at 75% 105%, rgba(10,53,100,.55), transparent 60%), radial-gradient(40% 50% at 92% 88%, rgba(255,194,75,.10), transparent 60%)`,
};

// Glass surface — frosted panel over the dark canvas.
export const glass = {
  background: "rgba(255,255,255,.045)",
  border: "1px solid rgba(255,255,255,.10)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

// Gradient chooser by activity category (mirrors the original Zt()).
export const gradFor = (cat) =>
  /Fishing|Catamaran|Snorkel|Whale|Yacht|Luxury/.test(cat)
    ? grad.ocean
    : /Surf|Rafting|Paragl/.test(cat)
    ? grad.reef
    : /ATV|Zipl|Waterfall|Night|Wildlife/.test(cat)
    ? grad.jungle
    : /Honeymoon/.test(cat)
    ? grad.orchid
    : /Group|Transport/.test(cat)
    ? grad.sunset
    : grad.ocean;

// Currency helper.
export const money = (n) => "$" + Math.round(n).toLocaleString();

// ── Design tokens ── a consistent elevation + radius scale so every surface
// feels like it belongs to the same product (the thing that reads as "premium").
export const shadow = {
  sm: "0 4px 18px -8px rgba(0,0,0,.55)",
  md: "0 18px 44px -20px rgba(0,0,0,.7)",
  lg: "0 34px 70px -28px rgba(0,0,0,.8)",
  xl: "0 50px 100px -34px rgba(0,0,0,.85)",
  glow: "0 0 0 1px rgba(34,211,238,.25), 0 18px 60px -18px rgba(34,211,238,.45)",
  glowGold: "0 0 0 1px rgba(255,194,75,.3), 0 18px 60px -18px rgba(255,194,75,.5)",
};
export const radius = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

// Gradient-text style — apply to a heading span for the signature accent.
export const gradText = (g = grad.hero) => ({
  background: g,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
});
