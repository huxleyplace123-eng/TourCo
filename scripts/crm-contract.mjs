import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [app, store, login, conversion, queue, operators, operatorMap, onboarding, operatorSchema] = await Promise.all([
  readFile(new URL("../src/admin/App.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/store.js", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/Login.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/conversion.js", import.meta.url), "utf8"),
  readFile(new URL("../src/inquiry-queue.js", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/OperatorsApp.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/OperatorMeetingMap.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/partners/Onboarding.jsx", import.meta.url), "utf8"),
  readFile(new URL("../supabase/migrations/20260929235000_operator_meeting_points.sql", import.meta.url), "utf8"),
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
assert.match(operators, /\["map", "Map"\]/);
assert.match(operators, /Add the exact guest meeting point before activating this partner/);
assert.match(operatorMap, /tour meeting points across Costa Rica/);
assert.match(operatorMap, /companyIcon/);
assert.match(operatorMap, /Open exact location/);
assert.match(operatorMap, /tw-map-clear-selection/);
assert.match(operatorMap, /google\.com\/maps\/search/);
assert.match(onboarding, /MeetingPointPicker/);
assert.match(operatorSchema, /meeting_point_lat/);
assert.match(operatorSchema, /Exact guest meeting point required/);

console.log("CRM contract passed: action center, quotes, templates, lead recovery, operator meeting maps, and expiring sessions are present.");
