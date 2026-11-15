# TicoWild operations and recovery

## Verified architecture

Cloudflare Pages serves the Vite build from main. Supabase owns authentication, CRM/portal records and row-level access rules. The portal-email Edge Function dispatches queued transactional email through Resend. Browser mailbox access and direct Microsoft Graph sending are separate paths; Graph restrictions must not be confused with transactional-provider delivery.

## Release checks

Run `npm run build`, the affected scripts under `scripts/`, and the connected lifecycle test. Database suites require `@electric-sql/pglite` or `PGLITE_MODULE_PATH` pointing to its module. `scripts/connected-lifecycle.test.mjs` runs an isolated complete workflow without real accounts, emails or reservations. `scripts/connected-workflow-live-qa.sql` uses explicit rollback transactions; inspect its fixture IDs before running on production. These are not load tests.

After deployment, verify the actual live assets and affected UI. A successful build alone does not prove deployment. Never use a real operator's agreement, customer reservation or payment for QA.

## Mail operations

Use CRM Email delivery history to distinguish queued, accepted by provider, delivered and failed messages. Provider acceptance alone is not proof of inbox arrival. Inspect queue age, failed states, retry counts and remaining capacity before campaigns or launch traffic. The configured queue budget is separate from the provider's total allowance, which is also consumed by authentication mail. Do not raise the queue cap without confirming actual provider capacity.

The worker verifies permissions again at delivery time, uses stable idempotency keys and reconciles signed provider callbacks. Do not manually replay messages by creating new request IDs after an ambiguous timeout. Inspect the existing request's delivery record first.

## Frontend recovery

Identify the last verified Cloudflare Pages deployment and its matching Git commit. Roll back the frontend through the Pages deployment dashboard only after checking compatibility with current database migrations. A frontend rollback does not reverse database migrations or sent emails. Preserve failed-release evidence; do not reset the database as a frontend recovery step.

## Database backup and restore gate

Observed in the production dashboard on November 14, 2026: the project is on Free and the Backups page states that Free does not include project backups. No upgrade was purchased. Scheduled backup coverage is therefore absent, not merely unchecked. A separate manual protected backup or approved plan change is required before a production restore drill can be claimed.

Before a broad launch, inventory the actual project's backup/PITR availability and retention. Export a protected database backup using the database owner's supported mechanism. Separately inventory Storage files, authentication configuration, functions, cron jobs and secrets: source-code history is not a backup of customer data. Keep credentials and private data out of Git and public output folders.

Restore into a separate non-production project, disable outbound email/cron before loading data, and verify record counts, relationships, role isolation, authentication configuration, signed agreement copies and the connected workflow. Document the measured recovery time and data-loss window. Do not overwrite production to test recovery. No production backup or restore drill is claimed by this document.

## Launch gates requiring business or device evidence

- Confirm real operator identity, pricing, availability, cancellation terms, permits and insurance. Public seed listings are planning examples, not approved real inventory.
- Verify John can independently authenticate on his own device without disabling MFA.
- Complete a consenting real operator/customer trial after synthetic QA.
- Booking customer/operator notices, application needs-changes, operator overdue and team follow-up emails were observed in the recipient inboxes on November 14, 2026. The reminder fixture used an aged timestamp and prequeued scoped recipients; the real cron worker dispatched it. Real elapsed 12-hour operation and a consenting operator trial remain distinct from synthetic delivery QA.
- Assign incident/alert ownership and confirm capacity for expected traffic; conduct an agreed isolated load test before claiming scale readiness.
- Payments and automatic WhatsApp synchronization remain outside the current enabled scope.

## November 14 reminder correction and isolated burst

Apply supabase/booking_reminder_current_request.sql after crm_outbound_email.sql. It preserves composed-mail authorization and rejects a queued overdue reminder unless its event key matches the current booking response timestamp, the booking still requests a response, and the 12-hour deadline has passed. This migration was applied to production and its function definition verified. Reopening a request must never revive the prior reminder.

Run scripts/isolated-burst.test.mjs for bounded isolated reliability coverage: 100 synthetic customers, 1,000 trips, 100 submitted read requests and 20 worker claim requests. The test verifies each customer's ten trips, no duplicate claims, and a 40-message budget with 60 remaining pending. PGlite serializes database work; these numbers do not establish production throughput, concurrent network capacity or a recovery-time objective.
