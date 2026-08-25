import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

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
assert.match(home, /How TicoWild works/);
assert.match(home, /Confirm before you pay/);
assert.match(home, /Stop building your trip from twenty open tabs/);
assert.match(home, /One plan, built around you/);
assert.match(home, /Your trip should feel exciting before you even land/);

const hero = read("src/components/CinematicHero.jsx");
assert.equal(hero.includes("Where are you staying?"), false, "the homepage must earn the planning ask before requesting a city");
assert.match(hero, /Start with the trip you want/);
assert.match(hero, /No city, dates or signup required to begin/);

const builder = read("src/pages/Build.jsx");
assert.match(builder, /The feeling/);
assert.match(builder, /The shape/);
assert.match(builder, /Final touches/);
assert.ok(builder.indexOf("What should this trip feel like?") < builder.indexOf("Where does this trip take shape?"), "the planning flow must ask about the desired experience before route logistics");

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

const routing = read("src/routing.js");
for (const route of ["/activities", "/collections", "/plan", "/why-ticowild", "/insider-guide"]) {
  assert.ok(routing.includes(`"${route}"`), `missing public route ${route}`);
}
assert.match(routing, /metadataFor/);
assert.match(routing, /activityPath/);

const conversion = read("src/components/ConversionCenter.jsx");
assert.match(conversion, /No payment is taken here/);
assert.match(conversion, /instead of pretending your request was delivered/);

const schema = read("supabase/schema.sql");
assert.match(schema, /create table if not exists public\.public_inquiries/);
assert.match(schema, /create policy "public can create inquiries"/);

const sitemap = read("public/sitemap.xml");
for (const activity of ["offshore-sport-fishing-charter", "sunset-catamaran-cruise", "honeymoon-waterfall-sunset"]) {
  assert.ok(sitemap.includes(`/activities/${activity}`), `sitemap is missing ${activity}`);
}
assert.match(read("public/robots.txt"), /Sitemap: https:\/\/ticowild\.com\/sitemap\.xml/);

console.log("Public site contract passed: truthful conversion, concise home, URL routing, metadata, and inquiry storage are present.");
