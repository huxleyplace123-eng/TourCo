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
