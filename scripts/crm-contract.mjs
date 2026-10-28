import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { mergePortalTours, KID_SUITABILITY } = await import(new URL("../src/admin/portal-store.js", import.meta.url).href);

const [app, store, login, conversion, queue, operators, operatorPortal, portalStore, operatorMap, onboarding, operatorSchema] = await Promise.all([
  readFile(new URL("../src/admin/App.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/store.js", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/Login.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/conversion.js", import.meta.url), "utf8"),
  readFile(new URL("../src/inquiry-queue.js", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/OperatorsApp.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/OperatorPortal.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/admin/portal-store.js", import.meta.url), "utf8"),
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
assert.match(operators, /Kid suitability work queue/);
assert.match(operators, /All kid suitability/);
assert.match(operators, /mergePortalTours\(TOUR_SEED, loadPortalAll\(\)\)/);
assert.match(operatorPortal, /Kid-friendly suitability/);
assert.match(operatorPortal, /Family notes/);
assert.match(operatorPortal, /Minimum age/);
assert.match(portalStore, /CONFIRMED: "confirmed"/);
assert.match(portalStore, /NOT_SUITABLE: "not_suitable"/);
assert.match(portalStore, /NEEDS_REVIEW: "needs_review"/);
assert.match(portalStore, /function mergePortalTours/);
assert.doesNotMatch(portalStore, /normalizeKidSuitability\([^)]*child/);
const pricedForChildrenButUnreviewed = mergePortalTours(
  [{ id: "contract-tour", operatorId: "contract-op", operator: "Contract Operator", child: 15 }],
  { "contract-op": { tourOverrides: {} } },
)[0];
assert.equal(pricedForChildrenButUnreviewed.kidSuitability, KID_SUITABILITY.NEEDS_REVIEW, "A child price must not imply kid-friendly suitability");
const explicitlyReviewed = mergePortalTours(
  [{ id: "contract-tour", operatorId: "contract-op", operator: "Contract Operator", child: null }],
  { "contract-op": { tourOverrides: { "contract-tour": { kidSuitability: "confirmed", minimumAge: 8, familyNotes: "Adult supervision required" } } } },
)[0];
assert.equal(explicitlyReviewed.kidSuitability, KID_SUITABILITY.CONFIRMED);
assert.equal(explicitlyReviewed.minimumAge, 8);
assert.equal(explicitlyReviewed.familyNotes, "Adult supervision required");
assert.match(operatorMap, /tour meeting points across Costa Rica/);
assert.match(operatorMap, /companyIcon/);
assert.match(operatorMap, /Open exact location/);
assert.match(operatorMap, /tw-map-clear-selection/);
assert.match(operatorMap, /google\.com\/maps\/search/);
assert.match(onboarding, /MeetingPointPicker/);
assert.match(operatorSchema, /meeting_point_lat/);
assert.match(operatorSchema, /Exact guest meeting point required/);

console.log("CRM contract passed: action center, quotes, templates, lead recovery, operator meeting maps, explicit kid suitability, and expiring sessions are present.");
