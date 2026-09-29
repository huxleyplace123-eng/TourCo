import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [app, store, login, conversion, queue] = await Promise.all([
  readFile(new URL("../src/admin/App.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/store.js", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/Login.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/conversion.js", import.meta.url), "utf8"),
  readFile(new URL("../src/inquiry-queue.js", import.meta.url), "utf8"),
]);

assert.match(app, /function TodayView/);
assert.match(app, /What needs attention today/);
assert.match(app, /useState\("table"\)/);
assert.match(app, /\["table", "Directory"\]/);
assert.match(app, /function QuoteBuilder/);
assert.match(app, /Gross margin/);
assert.match(app, /function CustomerTemplateComposer/);
assert.match(app, /Personalized automatically/);
assert.match(store, /quoteItems: \[\]/);
assert.match(store, /nextAction: ""/);
assert.match(conversion, /queueInquiry\(payload\)/);
assert.match(queue, /ticowild_inquiry_outbox_v1/);
assert.match(login, /12 \* 60 \* 60 \* 1000/);

console.log("CRM contract passed: action center, quotes, templates, lead recovery, and expiring sessions are present.");
