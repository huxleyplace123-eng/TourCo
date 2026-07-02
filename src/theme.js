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
  // dark-theme semantic tokens
  sand: "#05070F",       // app canvas (deep midnight)
  canvas2: "#0A0F1E",    // slightly lifted panel bg
  white: "#0E1526",      // "surface" — cards/panels (dark, not white)
  surface2: "#131C33",   // lifted surface
  line: "rgba(255,255,255,.10)", // hairline borders on dark
  charcoal: "#F3F7FF",   // primary text (near-white)
  stone: "#8FA3C4",      // secondary text (cool grey-blue)
  ink: "#05070F",        // true dark (text on neon buttons)
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
  // aurora background wash for the whole app
  aurora: `radial-gradient(60% 80% at 15% 10%, rgba(34,211,238,.16), transparent 60%), radial-gradient(50% 70% at 85% 20%, rgba(59,130,246,.18), transparent 60%), radial-gradient(60% 80% at 70% 100%, rgba(255,107,90,.10), transparent 60%)`,
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
