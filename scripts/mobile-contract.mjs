import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const index = read("index.html");
const main = read("src/main.jsx");
const app = read("src/App.jsx");
const css = read("src/mobile.css");
const activities = read("src/pages/Activities.jsx");
const activityCards = read("src/components/ActivityBrowseCard.jsx");
const ticoRanked = read("src/components/TicoRanked.jsx");
const exploreMap = read("src/pages/ExploreMap.jsx");
const customerPortal = read("src/portal/Portal.jsx");
const guestMeetingMap = read("src/portal/GuestMeetingMap.jsx");
const customerLogin = read("src/portal/Login.jsx");

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
  ".tico-chat-window",
  ".package-drawer",
  ".agreement-modal",
  ".footer-grid",
  ".deals-chapter-tabs",
  ".insider-anchor",
  ".mobile-break-grid",
]) {
  assert.ok(css.includes(contract), `mobile contract missing ${contract}`);
}

const publicPages = [
  "home", "today", "eat", "guide", "insider", "deals", "map", "tico",
  "activities", "detail", "packages", "build", "builder", "why",
  "partner", "portal",
];
for (const page of publicPages) {
  assert.ok(app.includes(`page === "${page}"`), `public page ${page} is not covered by the shared mobile shell`);
}

assert.match(css, /site-section:not\(\.home-band\) \+ \.site-section:not\(\.home-band\)/, "adjacent mobile sections need a visible pause");
assert.match(activities, /activity-collection-section\+\.activity-collection-section/, "activity collections need chapter breaks on mobile");
assert.match(activities, /activity-mosaic-heading h2\{font-size:22px/, "the second Activities section must read as supporting content on mobile");
assert.equal(activities.includes("gradText"), false, "the second Activities section must not repeat the hero gradient headline");
assert.match(ticoRanked, /className="rico-stars"/, "ranked ratings need a stable mobile star row");
assert.match(ticoRanked, /lineHeight: 0/, "star icons must not be clipped by the inline text baseline");
assert.match(ticoRanked, /position: "absolute", inset: 0, display: "block", maxWidth: "none"/, "partial star fills must stay aligned with their full star");
assert.match(css, /\.tico-dock\[data-lifted="true"\][\s\S]*?bottom: calc\(82px/, "the Rico guide must stay available above a mobile action bar");
assert.match(css, /\.interactive-map \.tn-pin \{[\s\S]*?min-width: 44px !important;[\s\S]*?min-height: 44px !important;/, "map pins need phone-sized touch targets");
assert.match(exploreMap, /aria-label=\{`Open \$\{typeLabel\(p\.type\)\}: \$\{pinTitle\(p\)\}`\}/, "map pins need accessible names");
assert.equal(css.includes('.tico-dock[data-lifted="true"] {\n    display: none'), false, "mobile action bars must not hide Rico chat actions");
assert.match(customerPortal, /View meeting point & voucher/, "confirmed customer bookings need a clear meeting-point action");
assert.match(customerPortal, /Open turn-by-turn directions/, "customer booking details need a directions action");
assert.match(customerPortal, /Private operator CRM information stays private/, "customer booking details must explain the privacy boundary");
assert.match(customerPortal, /Preview a sample trip/, "empty customer accounts need a safe sample-trip preview");
assert.match(customerPortal, /Nothing has been added to your account/, "sample trips must be clearly separated from real customer data");
assert.match(customerPortal, /Next up/, "the customer portal needs a clear next-action summary");
assert.match(customerPortal, /Meeting details/, "the next activity needs a direct meeting-details action");
assert.match(customerPortal, /Change password/, "customer accounts need a visible password security control");
assert.match(customerPortal, /Profile readiness/, "customer accounts need visible traveler-profile completeness");
assert.match(customerPortal, /Email me a fresh sign-in link/, "customer accounts need a secure re-entry control");
assert.match(customerPortal, /Your TicoWild concierge/, "customer messaging needs a professional concierge identity");
assert.match(customerLogin, /Email link/, "customer sign-in must preserve private email-link access");
assert.match(customerLogin, /Sign in securely/, "customer sign-in must support passwords customers create in Account");
assert.match(read("src/portal/portalData.js"), /supabase\.auth\.updateUser\(\{ password \}\)/, "change password must update the authenticated account rather than display a dead control");
assert.match(customerLogin, /@media\(max-width:800px\)/, "customer sign-in needs a dedicated mobile layout");
assert.match(customerPortal, /<Logo fontSize=\{20\} surface="light"/, "customer portal must use the real branded logo component");
assert.match(customerLogin, /<Logo fontSize=\{23\} surface="light"/, "mobile customer sign-in must use the real branded logo component");
assert.match(read("src/components/Logo.jsx"), /color: "#FFD000"/, "the TicoWild wordmark must preserve the official yellow Wild brand color");
assert.match(customerPortal, /@media\(max-width:700px\)/, "customer booking details need a dedicated phone layout");
assert.match(guestMeetingMap, /google\.com\/maps\/dir/, "customer meeting maps need turn-by-turn directions");
assert.equal(guestMeetingMap.includes("Open operator record"), false, "customer meeting maps must never expose the CRM action");
assert.match(css, /\.meet-tico-hero \{[\s\S]*?flex-direction: column !important/, "the Rico hero and proof strip must stack instead of competing side by side on mobile");
assert.match(css, /\.tico-credential-strip \{[\s\S]*?width: 100% !important/, "the Rico proof strip must use the full phone width");

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
