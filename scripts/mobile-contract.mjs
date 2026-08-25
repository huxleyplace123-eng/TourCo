import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const index = read("index.html");
const main = read("src/main.jsx");
const app = read("src/App.jsx");
const css = read("src/mobile.css");

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

console.log(`Mobile contract passed for ${publicPages.length} public page states.`);
