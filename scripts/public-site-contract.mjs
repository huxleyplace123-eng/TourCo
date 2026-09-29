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
assert.match(home, /What sounds like you\?/);
assert.match(home, /Days worth building/);
assert.match(home, /Follow the feeling\./);
assert.match(home, /You imagine the trip\./);
assert.match(home, /A trip this beautiful/);
assert.match(home, /FEATURED_IDS = \["a15", "a16", "a4", "a11"\]/, "homepage must use a restrained curated experience set");
assert.match(home, /className="home-featured-track"/, "homepage needs a mobile-friendly curated experience rail");
assert.match(home, /href=\{activityPath\(activity\)\}/, "homepage experience cards need real destinations");
assert.match(home, /viewActivity\(activity\.id\)/, "homepage experience cards should use in-app activity navigation");
assert.match(home, /className="home-regions"/, "homepage needs a cinematic regional discovery chapter");
assert.match(home, /go\("map"\)/, "regional discovery must connect to the live map");
assert.match(home, /className="home-concierge"/, "homepage needs one concise planning explanation");
assert.match(home, /className="home-closing"/, "homepage needs a cinematic destination close");

const hero = read("src/components/CinematicHero.jsx");
assert.equal(hero.includes("Where are you staying?"), false, "the homepage must earn the planning ask before requesting a city");
assert.equal(hero.includes("tn-hero-plan"), false, "the homepage hero must not repeat its message in a second planning panel");
assert.match(hero, /Start my trip/);
assert.equal(hero.includes("Browse activities"), false, "the homepage hero should present one clear primary CTA");

const builder = read("src/pages/Build.jsx");
assert.match(builder, /The feeling/);
assert.match(builder, /The shape/);
assert.match(builder, /Final touches/);
assert.ok(builder.indexOf("What should this trip feel like?") < builder.indexOf("Where does this trip take shape?"), "the planning flow must ask about the desired experience before route logistics");
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
assert.match(app, /mobile-plan-bar/, "mobile visitors need a persistent planning action after the hero");

const trips = read("src/pages/MyTrips.jsx");
assert.match(trips, /Ideas saved/);
assert.match(trips, /Availability check/);
assert.match(trips, /Confirm and pay/);

const detail = read("src/pages/Detail.jsx");
assert.match(detail, /What you’ll know before you pay/);
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
