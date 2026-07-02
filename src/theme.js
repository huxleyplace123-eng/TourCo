// TicoWild brand tokens — CINEMATIC DARK theme, matched EXACTLY to the logo.
// Logo palette: navy #0B1A2E, white #FFFFFF, yellow #FFD000, cyan #22D3EE,
// soft blue #7FA6E8. Everything below derives from those five colors so the
// whole app reads as one brand. `sand` = canvas, `white` = surface, `charcoal`
// = primary text (semantic names kept so components stay dark-by-meaning).

export const c = {
  // brand accents (from the logo)
  emerald: "#3EA9F0",    // supporting blue (kept name for compatibility)
  jungle: "#0B1A2E",     // logo navy
  teal: "#22D3EE",       // logo cyan
  blue: "#7FA6E8",       // logo soft blue
  coral: "#FFD000",      // logo yellow
  gold: "#FFD000",       // logo yellow (primary accent)
  orchid: "#FFD000",     // fold accents into brand yellow
  // dark NAVY semantic tokens — built on the logo's #0B1A2E
  sand: "#0B1A2E",       // app canvas (logo navy)
  canvas2: "#0F2440",    // slightly lifted panel bg
  white: "#13294A",      // "surface" — cards/panels
  surface2: "#1A355C",   // lifted surface
  line: "rgba(127,166,232,.16)", // hairline borders (logo soft-blue tint)
  charcoal: "#FFFFFF",   // primary text (logo white)
  stone: "#7FA6E8",      // secondary text (logo soft blue)
  ink: "#0B1A2E",        // logo navy (text on yellow/cyan buttons)
};

export const FONT =
  "'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

export const grad = {
  hero: `linear-gradient(135deg,#0B1A2E 0%,#22D3EE 55%,#7FA6E8 100%)`,
  ocean: `linear-gradient(135deg,#22D3EE,#7FA6E8)`,
  jungle: `linear-gradient(135deg,#22D3EE,#0B1A2E)`,
  sunset: `linear-gradient(135deg,#FFD000,#FFDE4D)`,
  orchid: `linear-gradient(135deg,#22D3EE,#7FA6E8)`,
  reef: `linear-gradient(160deg,#22D3EE,#7FA6E8 80%)`,
  gold: `linear-gradient(135deg,#FFD000,#FFDE4D)`,
  // aurora background wash — cyan + soft-blue glows with a warm yellow sun
  aurora: `radial-gradient(60% 80% at 15% 8%, rgba(34,211,238,.20), transparent 60%), radial-gradient(55% 75% at 85% 18%, rgba(127,166,232,.20), transparent 60%), radial-gradient(70% 90% at 75% 105%, rgba(11,26,46,.6), transparent 60%), radial-gradient(40% 50% at 92% 88%, rgba(255,208,0,.10), transparent 60%)`,
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
  glowGold: "0 0 0 1px rgba(255,208,0,.3), 0 18px 60px -18px rgba(255,208,0,.5)",
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
