import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const index = read("index.html");
const main = read("src/main.jsx");
const app = read("src/App.jsx");
const css = read("src/mobile.css");
const activities = read("src/pages/Activities.jsx");
const activityCards = read("src/components/ActivityBrowseCard.jsx");

assert.match(index, /width=device-width, initial-scale=1, viewport-fit=cover/);
assert.match(index, /button:not\(\.tn-dot\):not\(\.tn-pin\)/);
assert.match(main, /import "\.\/mobile\.css"/);
assert.match(app, /className="public-site"/);
assert.match(app, /public-page-\$\{page\}/);

for (const breakpoint of ["820px", "520px", "380px"]) {
  assert.ok(css.includes(`max-width: ${breakpoint}`), `missing ${breakpoint} mobile breakpoint`);
}

for (const contract of [
  "overflow-x: clip",
  "env(safe-area-inset-bottom)",
  "100dvh",
  ".site-nav",
  ".site-section",
  ".responsive-card-grid",
  ".interactive-map",
  ".trip-builder-form",
  ".detail-hero",
  ".askjohn-chat",
  ".tico-chat-window",
  ".package-drawer",
  ".agreement-modal",
  ".footer-grid",
  ".deals-chapter-head",
  ".insider-anchor",
  ".mobile-break-grid",
]) {
  assert.ok(css.includes(contract), `mobile contract missing ${contract}`);
}

const publicPages = [
  "home", "today", "eat", "guide", "insider", "deals", "map", "tico",
  "activities", "detail", "packages", "build", "ask", "builder", "why",
  "partner", "portal", "john",
];
for (const page of publicPages) {
  assert.ok(app.includes(`page === "${page}"`), `public page ${page} is not covered by the shared mobile shell`);
}

assert.match(css, /site-section:not\(\.home-band\) \+ \.site-section:not\(\.home-band\)/, "adjacent mobile sections need a visible pause");
assert.match(activities, /activity-collection-section\+\.activity-collection-section/, "activity collections need chapter breaks on mobile");

assert.match(
  activities,
  /\.activity-worlds\{display:grid;grid-template-columns:minmax\(0,1fr\)/,
  "activity collections must become a single-column mobile grid",
);
assert.match(
  activities,
  /\.activity-world-card\{width:100%;height:172px;min-height:172px/,
  "activity collection cards must stay compact on phones",
);
assert.match(
  activities,
  /\.activity-world-copy>span:nth-of-type\(2\)\{display:none\}/,
  "activity collection descriptions must not crowd compact phone cards",
);
assert.match(
  activities,
  /\.activity-world-cta\{width:auto;min-height:0;/,
  "activity collection actions must remain visually lightweight on phones",
);
assert.ok(
  !activities.includes("flex:0 0 84vw"),
  "activity collection cards must not return to the cramped partial-width carousel",
);
assert.match(
  activityCards,
  /@media \(max-width: 380px\)[\s\S]*?\.tn-activity-browse-card__actions \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/,
  "activity card actions must stack on narrow phones",
);

console.log(`Mobile contract passed for ${publicPages.length} public page states.`);
