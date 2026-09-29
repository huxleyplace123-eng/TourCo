import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { activities } from "../src/data.js";
import { planTrip } from "../src/intelligence/planner.js";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
  const relative = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(relative) : [relative];
});

const publicSource = ["src/App.jsx", ...walk("src/components"), ...walk("src/pages")]
  .filter((file) => /\.(jsx|js)$/.test(file))
  .map((file) => `${file}\n${read(file)}`)
  .join("\n");

assert.equal(publicSource.includes("window.alert("), false, "public conversion actions must never fall back to prototype alerts");

const home = read("src/pages/Home.jsx");
assert.equal(home.includes("ActivityCard"), false, "homepage should promote one journey instead of repeating the activity catalog");
assert.equal(home.includes("TodaySection"), false, "homepage should not repeat the separate Today catalog");
assert.equal(home.includes("TicoRanked"), false, "homepage should not repeat a second ranked catalog");
assert.equal(home.includes("home-journey"), false, "homepage must not repeat a numbered journey strip below the hero");
assert.equal(home.includes("SAMPLE_DAYS"), false, "homepage must not repeat another three-step timeline");
assert.equal(home.includes("home-feeling-wrap"), false, "homepage must not insert a redundant preference chooser after the hero");
assert.equal(/0[1-4] ·/.test(home), false, "homepage sections must not use a forced numbered chapter system");
assert.match(home, /Popular Costa Rica/);
assert.match(home, /Explore activities/);
assert.match(home, /Build your Costa Rica/);
assert.equal(home.includes("FEATURED_IDS"), false, "homepage must not repeat a disconnected featured catalog before the visual story");
assert.equal(home.includes("home-featured-track"), false, "homepage must not duplicate activity discovery in a second rail");
assert.match(home, /href=\{activityPath\(activity\)\}/, "homepage story scenes need real destinations");
assert.match(home, /viewActivity\(activity\.id\)/, "homepage story scenes should use in-app activity navigation");
assert.match(home, /className="home-regions"/, "homepage needs a cinematic regional discovery chapter");
assert.match(home, /className="home-action"/, "homepage needs a vivid, activity-led visual chapter");
for (const actionId of ["a7", "a10", "a6", "a9"]) assert.ok(home.includes(`"${actionId}"`), `homepage action reel is missing ${actionId}`);
assert.match(home, /go\("map"\)/, "regional discovery must connect to the live map");
assert.match(home, /className="home-concierge"/, "homepage needs one concise planning explanation");
assert.match(home, /className="home-closing"/, "homepage needs a cinematic destination close");
for (const [label, buttonMarkup] of [["Explore the map", "Explore the map <"], ["Build my trip", "Build my trip</Button>"], ["Start planning", ">Start planning <"]]) {
  assert.equal(home.includes(buttonMarkup), false, `homepage must not use a competing primary CTA: ${label}`);
}
assert.equal((home.match(/Plan my trip/g) || []).length, 1, "homepage content must present one clear primary CTA");
assert.equal((home.match(/onClick=\{\(\) => go\("build"\)\}/g) || []).length, 1, "the homepage primary CTA must open the planner");
const homeStoryOrder = ["home-action", "home-regions", "home-concierge", "home-closing"].map((token) => home.indexOf(token));
assert.ok(homeStoryOrder.every((position) => position >= 0), "homepage story is missing a required chapter");
assert.deepEqual([...homeStoryOrder].sort((a, b) => a - b), homeStoryOrder, "homepage must progress from vivid experiences to route to plan to action");

const hero = read("src/components/CinematicHero.jsx");
assert.equal(hero.includes("Where are you staying?"), false, "the homepage must earn the planning ask before requesting a city");
assert.equal(hero.includes("tn-hero-plan"), false, "the homepage hero must not repeat its message in a second planning panel");
assert.match(hero, /hero-where/, "the hero needs a destination or activity search field");
assert.match(hero, /hero-when/, "the hero needs an optional travel date field");
assert.match(hero, /onSearch\(query, date\)/, "the hero search needs to carry both pieces of context into discovery");
assert.equal(hero.includes("Start my trip"), false, "the search-first hero should not compete with a second planning CTA");
assert.equal(hero.includes("Browse activities"), false, "the homepage hero should present one clear primary CTA");

const nav = read("src/components/Nav.jsx");
assert.match(nav, /tripCount > 0 \? "My trip" : "Plan my trip"/, "the navigation must show one journey action that matches the visitor's state");
assert.equal(nav.includes("nav-cta"), false, "the navigation must not show separate My Trip and Plan my trip controls");

const builder = read("src/pages/Build.jsx");
assert.match(builder, /Travelers and interests/);
assert.match(builder, /Destinations and dates/);
assert.match(builder, /Budget and needs/);
assert.ok(builder.indexOf("Who is traveling and what do you want to do?") < builder.indexOf("Where are you going and when?"), "the planning flow must ask about travelers and interests before route logistics");
assert.match(builder, /result\.brief\?\.month/, "the planner must not invent a travel month when dates are blank");
assert.match(builder, /Want us to confirm this trip\?/, "the completed planner must visibly ask for contact information");
assert.match(builder, /Send my plan to TicoWild/, "the completed planner needs a direct CRM handoff");
assert.match(builder, /deliverInquiry/, "the completed planner contact form must use the live inquiry pipeline");

const fullDayPlan = planTrip([activities.find((activity) => activity.id === "a15"), activities.find((activity) => activity.id === "a8")], { maxPerDay: 2, pax: 2 });
assert.equal(fullDayPlan.days.length, 2, "a full-day experience must never be stacked with another activity");
assert.equal(fullDayPlan.climate, null, "an undated plan must not invent seasonal context");

const app = read("src/App.jsx");
assert.match(app, /routeFromPath\(window\.location\.pathname\)/, "public pages must restore state from a real URL");
assert.match(app, /window\.history\[replace \? "replaceState" : "pushState"\]/, "public navigation must update browser history");
assert.match(app, /ticowild\.trip\.v1/, "saved consumer trips must survive a refresh");
assert.match(app, /ticowild\.activitySearch/, "hero discovery terms must carry into the activity catalog");
assert.match(app, /ticowild\.activityDate/, "hero travel dates must carry into the activity catalog");
assert.match(app, /mobile-plan-bar/, "mobile visitors need a persistent planning action after the hero");

const activitiesPage = read("src/pages/Activities.jsx");
assert.match(activitiesPage, /ticowild\.activitySearch/, "the activity catalog must receive the hero search term");
assert.match(activitiesPage, /ticowild\.activityDate/, "the activity catalog must receive the hero travel date");
assert.match(activitiesPage, /Planning for/, "the selected travel date must remain visible after searching");

const trips = read("src/pages/MyTrips.jsx");
assert.match(trips, /Ideas saved/);
assert.match(trips, /Availability check/);
assert.match(trips, /Confirm and pay/);

const detail = read("src/pages/Detail.jsx");
assert.match(detail, /Availability, operator and pricing/);
assert.match(detail, /Cancellation terms/);
assert.match(detail, /const HERO_GLASS = "rgba\(5,15,33,\.86\)"/, "activity hero controls need a high-contrast dark surface");
assert.match(detail, /className="detail-back-button"/, "the activity back control needs explicit contrast styling");
assert.match(detail, /className="detail-hero-badges"/, "activity hero labels need explicit contrast styling");
assert.equal(detail.includes('bg="rgba(255,255,255,.92)"'), false, "activity hero badges must not use pale text on white surfaces");

const routing = read("src/routing.js");
for (const route of ["/activities", "/collections", "/plan", "/why-ticowild", "/insider-guide"]) {
  assert.ok(routing.includes(`"${route}"`), `missing public route ${route}`);
}
assert.match(routing, /metadataFor/);
assert.match(routing, /activityPath/);
assert.match(routing, /clean === "\/ask-rico"[\s\S]*canonicalPath: "\/plan"/, "the retired standalone Rico builder must resolve to the canonical planner");
assert.match(routing, /clean === "\/local-expert"[\s\S]*canonicalPath: "\/meet-rico"/, "the retired expert page must resolve to the canonical Rico page");

const conversion = read("src/components/ConversionCenter.jsx");
assert.match(conversion, /No payment is taken here/);
assert.match(conversion, /instead of pretending your request was delivered/);
assert.match(conversion, /ticowild:open-rico/, "Ask Rico actions must open the on-site guide instead of a different form");

const packages = read("src/pages/Packages.jsx");
assert.match(packages, /createPortal/, "the package drawer must escape transformed page layout");
assert.match(packages, /listed experiences from/i, "package cards must label the price scope");
assert.match(packages, /Lodging, transport, meals and custom additions are only included/, "package pricing must explain what the listed total excludes");
assert.equal(packages.includes("Tell John"), false, "customer-facing package help must use the Rico identity");

const insider = read("src/pages/InsiderGuide.jsx");
assert.match(insider, /const \[active, setActive\] = useState\(null\)/, "the guide must open one collection at a time");
assert.match(insider, /active === "dining"/, "the guide must conditionally render the selected collection");
assert.equal(insider.includes("without throwing away the depth"), false, "internal implementation language must not appear in customer copy");

const why = read("src/pages/Why.jsx");
assert.equal(why.includes("TicoWild should win"), false, "internal positioning language must not appear on the public site");
const dealsPage = read("src/pages/Deals.jsx");
assert.match(dealsPage, /title="Costa Rica deals and promo codes"/, "the deals page needs a direct descriptive title");
assert.equal(dealsPage.includes('title="Spend less on the right things" accentWord="less"'), false, "the deals hero must not duplicate its accent word");
for (const phrase of ["Now shape the route", "We’ll keep it practical", "See the kind of day", "Choose your kind of wild", "Less searching. Better Costa Rica days.", "Spend smarter. Do more.", "Where does this trip take shape?", "What should this trip feel like?", "Private Signature Days"]) {
  assert.equal(publicSource.includes(phrase), false, `public copy must use direct language instead of: ${phrase}`);
}
const legal = read("src/components/LegalModal.jsx");
assert.equal(legal.includes("counsel-reviewed"), false, "the legal modal must not claim an unavailable governing document");

const schema = read("supabase/schema.sql");
assert.match(schema, /create table if not exists public\.public_inquiries/);
assert.match(schema, /create policy "public can create inquiries"/);

const sitemap = read("public/sitemap.xml");
for (const activity of ["offshore-sport-fishing-charter", "sunset-catamaran-cruise", "honeymoon-waterfall-sunset"]) {
  assert.ok(sitemap.includes(`/activities/${activity}`), `sitemap is missing ${activity}`);
}
assert.match(read("public/robots.txt"), /Sitemap: https:\/\/ticowild\.com\/sitemap\.xml/);

console.log("Public site contract passed: truthful conversion, concise home, URL routing, metadata, and inquiry storage are present.");
