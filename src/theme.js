// TourCo / TripNest brand tokens — colors, gradients, font stack.
// Lifted verbatim from the original single-file build so the look is identical.

export const c = {
  emerald: "#2F6BEB",
  jungle: "#0A2E8F",
  teal: "#22D3EE",
  blue: "#1E5FE0",
  coral: "#FFD000",
  gold: "#F0A400",
  orchid: "#FF5A4D",
  sand: "#EEF4FF",
  white: "#FFFFFF",
  stone: "#5B6B86",
  charcoal: "#0B1A2E",
};

export const FONT =
  "'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

export const grad = {
  hero: `linear-gradient(135deg,${c.jungle} 0%,${c.emerald} 45%,${c.teal} 100%)`,
  ocean: `linear-gradient(135deg,${c.blue},${c.teal})`,
  jungle: `linear-gradient(135deg,${c.emerald},${c.jungle})`,
  sunset: `linear-gradient(135deg,${c.coral},${c.gold})`,
  orchid: `linear-gradient(135deg,${c.orchid},${c.teal})`,
  reef: `linear-gradient(160deg,${c.teal},${c.blue} 80%)`,
  gold: `linear-gradient(135deg,${c.gold},${c.coral})`,
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
  sm: "0 4px 14px -8px rgba(15,30,40,.28)",
  md: "0 14px 40px -22px rgba(15,30,40,.4)",
  lg: "0 30px 60px -24px rgba(8,28,58,.5)",
  xl: "0 50px 90px -34px rgba(8,28,58,.6)",
  glow: "0 18px 50px -18px rgba(47,107,235,.55)",
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
