import { activities } from "./data.js";

const PAGE_PATHS = {
  home: "/",
  activities: "/activities",
  packages: "/collections",
  build: "/plan",
  builder: "/plan",
  why: "/why-ticowild",
  partner: "/become-a-partner",
  portal: "/trip",
  deals: "/deals",
  map: "/explore-map",
  tico: "/meet-rico",
  insider: "/insider-guide",
  guide: "/insider-guide",
  eat: "/insider-guide",
};

const PAGE_META = {
  home: ["TicoWild | Curated Costa Rica Experiences", "Start with how you want Costa Rica to feel. TicoWild turns that vision into a trip that flows, then tailors it to your route and dates."],
  activities: ["Costa Rica Experiences | TicoWild", "Explore curated Costa Rica experiences by region, pace and travel style."],
  packages: ["Costa Rica Experience Collections | TicoWild", "Explore simple Costa Rica experience collections for couples, families, groups and adventure travelers."],
  build: ["Plan My Costa Rica Experiences | TicoWild", "Build a simple Costa Rica activity plan around your dates, route, group and travel style."],
  why: ["How TicoWild Works | TicoWild", "See how TicoWild helps travelers choose experiences, confirm the details and stay supported during their trip."],
  partner: ["Become a TicoWild Partner", "Apply to offer your Costa Rica experiences through TicoWild."],
  portal: ["My Costa Rica Trip | TicoWild", "Review the Costa Rica experiences saved to your TicoWild trip."],
  deals: ["Costa Rica Experience Offers | TicoWild", "Explore current TicoWild experience offers and trip ideas."],
  map: ["Explore Costa Rica by Map | TicoWild", "Explore Costa Rica destinations, experiences and local planning ideas on the TicoWild map."],
  tico: ["Meet Rico | TicoWild", "Meet Rico, TicoWild's Costa Rica planning companion."],
  insider: ["Costa Rica Insider Guide | TicoWild", "Practical Costa Rica destination, activity and route guidance from TicoWild."],
};

export function slugify(value = "") {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function activityPath(activityOrId) {
  const activity = typeof activityOrId === "string" ? activities.find((item) => item.id === activityOrId) : activityOrId;
  return activity ? `/activities/${slugify(activity.title)}` : "/activities";
}

export function pathFor(page, activeId = null) {
  if (page === "detail") return activityPath(activeId);
  return PAGE_PATHS[page] || "/";
}

export function routeFromPath(pathname = "/") {
  const clean = `/${pathname.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "")}`;
  if (clean === "/ask-rico") return { page: "build", activeId: null, canonicalPath: "/plan" };
  if (clean === "/local-expert") return { page: "tico", activeId: null, canonicalPath: "/meet-rico" };
  if (clean === "/") return { page: "home", activeId: null };
  if (clean.startsWith("/activities/")) {
    const slug = clean.slice("/activities/".length);
    const activity = activities.find((item) => slugify(item.title) === slug);
    return activity ? { page: "detail", activeId: activity.id } : { page: "activities", activeId: null };
  }
  const match = Object.entries(PAGE_PATHS).find(([, path]) => path === clean);
  return match ? { page: match[0], activeId: null } : { page: "home", activeId: null };
}

export function metadataFor(page, activeId = null) {
  if (page === "detail") {
    const activity = activities.find((item) => item.id === activeId);
    if (activity) return [`${activity.title} in ${activity.region} | TicoWild`, `${activity.desc} Request current availability and trip-fit guidance from TicoWild.`];
  }
  return PAGE_META[page] || PAGE_META.home;
}
