import { activities } from "./data.js";
import { BLOG_POSTS, blogPostBySlug } from "./blog-data.js";

const PAGE_PATHS = {
  home: "/",
  activities: "/activities",
  kids: "/kid-friendly-costa-rica-activities",
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
  blog: "/blog",
};

const PAGE_META = {
  home: ["TicoWild | Costa Rica, Planned Locally", "Build a route-aware Costa Rica trip with independent local providers and current details confirmed before payment."],
  activities: ["Local Costa Rica Experiences | TicoWild", "Explore Costa Rica experiences by region, pace and travel style, then ask TicoWild to confirm the current provider details."],
  kids: ["Kid-Friendly Costa Rica Activities | TicoWild", "Find family-ready Costa Rica activities and have TicoWild check current age, height, swimming, weather and provider requirements before payment."],
  packages: ["Costa Rica Experience Collections | TicoWild", "Start with a route-aware collection for couples, families, groups or adventure travelers, built around independent local experiences."],
  build: ["Plan My Costa Rica Route | TicoWild", "Organize Costa Rica experiences around your dates, destinations, group and pace, with current provider details confirmed before payment."],
  why: ["How TicoWild Connects Your Costa Rica Trip", "See how TicoWild organizes your route, narrows the choices and confirms current details with independent local providers."],
  partner: ["Become a Local TicoWild Partner", "Connect your independent Costa Rica experience with travelers planning around your region and route."],
  portal: ["My Costa Rica Trip | TicoWild", "Review the local experiences and route ideas saved to your TicoWild trip."],
  deals: ["Costa Rica Experience Offers | TicoWild", "Explore listed offers from Costa Rica experiences and confirm the current terms before relying on them."],
  map: ["Explore Costa Rica by Route and Region | TicoWild", "Compare Costa Rica activity areas, beaches, food and key stops while keeping route and travel time in view."],
  tico: ["Meet Rico, Your Costa Rica Planning Companion | TicoWild", "Meet Rico, the planning companion that helps organize local Costa Rica experiences around your route."],
  insider: ["Costa Rica Local Places and Route Guide | TicoWild", "Browse local places, activities and practical Costa Rica context, organized around the route you want to travel."],
  blog: ["Costa Rica Travel Blog & Local Field Guide | TicoWild", "Plan Costa Rica with route-first ideas, local context, family guidance and practical provider questions."],
};

export function slugify(value = "") {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function activityPath(activityOrId) {
  const activity = typeof activityOrId === "string" ? activities.find((item) => item.id === activityOrId) : activityOrId;
  return activity ? `/activities/${slugify(activity.title)}` : "/activities";
}

export function blogPath(postOrSlug) {
  const slug = typeof postOrSlug === "string" ? postOrSlug : postOrSlug?.slug;
  return slug && blogPostBySlug(slug) ? `/blog/${slug}` : "/blog";
}

export function pathFor(page, activeId = null) {
  if (page === "detail") return activityPath(activeId);
  if (page === "article") return blogPath(activeId);
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
  if (clean.startsWith("/blog/")) {
    const slug = clean.slice("/blog/".length);
    const post = blogPostBySlug(slug);
    return post ? { page: "article", activeId: post.slug } : { page: "blog", activeId: null };
  }
  const match = Object.entries(PAGE_PATHS).find(([, path]) => path === clean);
  return match ? { page: match[0], activeId: null } : { page: "home", activeId: null };
}

export function metadataFor(page, activeId = null) {
  if (page === "detail") {
    const activity = activities.find((item) => item.id === activeId);
    if (activity) return [`${activity.title} in ${activity.region} | TicoWild`, `${activity.desc} Request current availability and trip-fit guidance from TicoWild.`];
  }
  if (page === "article") {
    const post = blogPostBySlug(activeId);
    if (post) return [post.seoTitle, post.description];
  }
  return PAGE_META[page] || PAGE_META.home;
}

export function isKidFriendlyCandidate(activity) {
  return Boolean(activity?.family && activity.level !== "High");
}

export function structuredDataFor(page, activeId = null) {
  const baseUrl = "https://ticowild.com";
  if (page === "blog") {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "TicoWild Costa Rica Field Guide",
      description: PAGE_META.blog[1],
      url: `${baseUrl}${PAGE_PATHS.blog}`,
      publisher: { "@type": "Organization", name: "TicoWild", url: baseUrl },
      blogPost: BLOG_POSTS.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.datePublished,
        url: `${baseUrl}${blogPath(post)}`,
      })),
    };
  }
  if (page === "article") {
    const post = blogPostBySlug(activeId);
    if (!post) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.datePublished,
      dateModified: post.datePublished,
      author: { "@type": "Organization", name: "TicoWild", url: baseUrl },
      publisher: { "@type": "Organization", name: "TicoWild", url: baseUrl },
      mainEntityOfPage: `${baseUrl}${blogPath(post)}`,
      image: `https://images.unsplash.com/${post.imageId}?auto=format&fit=crop&w=1600&q=82`,
      articleSection: post.category,
      isPartOf: { "@type": "Blog", name: "TicoWild Costa Rica Field Guide", url: `${baseUrl}${PAGE_PATHS.blog}` },
    };
  }
  if (page !== "kids") return null;
  const [name, description] = PAGE_META.kids;
  const familyActivities = activities.filter((activity) => isKidFriendlyCandidate(activity) && activity.category !== "Private Transportation");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${baseUrl}${PAGE_PATHS.kids}`,
    mainEntity: {
      "@type": "ItemList",
      name: "Kid-friendly Costa Rica activities",
      numberOfItems: familyActivities.length,
      itemListElement: familyActivities.map((activity, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristTrip",
          name: activity.title,
          description: activity.desc,
          url: `${baseUrl}${activityPath(activity)}`,
          touristType: "Families with children",
          areaServed: { "@type": "Country", name: "Costa Rica" },
          provider: { "@type": "Organization", name: "TicoWild", url: baseUrl },
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: activity.price,
            availability: "https://schema.org/InStock",
            url: `${baseUrl}${activityPath(activity)}`,
          },
        },
      })),
    },
  };
}
