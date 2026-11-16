# TicoWild operations and recovery

## November 15 synthetic reliability expansion

Customer requests now show progress in Messages, with a responsible team member
and timestamp. Staff send explicit status updates from the CRM customer thread;
updates are normal authorized team messages and use the existing notification
pipeline. Only team-authored updates for the same customer's request can change
the displayed status. Resolved does not change the booking. Unlinked customer
threads have the same controls. No schema migration is required.

Customer message delivery now reuses a stable per-account request ID after an
ambiguous failure and verifies the existing row before treating a retry as sent.
Unsent concierge drafts survive refresh in the same browser tab, are scoped to
the signed-in account, and clear after successful sign-out. Browser storage may
be disabled; the app still works, but persistence is unavailable in that case.

The planner reserves arrival/transfer days, caps activity days at each stop's
nights, leaves departure open, rejects date/night mismatches, and sends these
planning notes to staff. Unspecified routes with the short-drive preference use
one suggested region. These are planning constraints, not verified road times.

Run `node scripts/run-regression.mjs` from the repository root. Database tests
need `@electric-sql/pglite` installed or PGLITE_MODULE_PATH pointing to its module.
Results are written to ignored artifacts/regression-results.json. The connected
lifecycle includes two populated customers and two populated operators with
bidirectional access checks and independent accept/decline outcomes. This is
isolated database-role evidence, not four live browser sign-ins.

### External monitoring and backup activation still required

`node scripts/operations-monitor.mjs` performs a read-only public availability
check. Its tested alert function accepts a private Resend key, configured
recipient and stable incident ID from an external runner. The runner must poll
notification health through a separately authorized service, persist incident
state, suppress repeated alerts, report its own missed heartbeat and be scheduled
outside the app's host. No schedule or alert delivery is activated by this file.
Keep the selected alert recipient and credentials in private configuration.

`scripts/protected-backup.mjs` prepares a portable AES-256-GCM protected database
export. Configure PGSERVICE with a read-only export role and PostgreSQL password
file, certificate-verified TLS, BACKUP_ENCRYPTION_KEY (64 hexadecimal characters)
from a separate secret store, and BACKUP_OUTPUT (new absolute private path).
PG_DUMP_BINARY can point to a compatible installed PostgreSQL client. It writes
only authenticated ciphertext, refuses overwrite, verifies encryption round-trip
in memory, and limits exports to 256 MiB. It does not upload, schedule, recover
Storage object contents or recreate hosted authentication/functions/secrets.

Before enabling backups, select private off-site storage, retention and a durable
secret store independent of the export location. Restore a fresh export into a
separate non-production service with outbound workers disabled; verify records,
roles, storage, auth configuration and the lifecycle. Record recovery time and
data-loss window. Synthetic encryption tests do not establish production backup
or recovery readiness. No credentials, external storage or scheduler were
provisioned in this pass.

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

Restore into a separate non-production project, disable outbound email/cron before loading data, and verify record counts, relationships, role isolation, authentication configuration, signed agreement copies and the connected workflow. Document the measured recovery time and data-loss window. Do not overwrite production to test recovery. The local data-recovery drill below does not establish full hosted-service disaster recovery.

### November 14 protected export and local recovery

A full PostgreSQL custom-format archive was exported over certificate-verified TLS using an expiring, read-only database role. The role was revoked and dropped after export; production confirmed zero matching roles. The original database password was unchanged. The archive is held outside this repository in a restricted local folder, encrypted with Windows CurrentUser DPAPI; decryption produced the original SHA-256. Recovery on a different Windows profile has not been established, so this is not an off-site recovery plan.

An isolated PostgreSQL 17.12 server, bound only to loopback, restored the public, auth and storage schemas without errors after installing their standard extension dependencies and creating inert prerequisite roles. All 58 tables and 322 rows matched the archive by sorted COPY-row hashes with UTC timestamps. The storage object table contained zero rows. Managed Supabase extensions, vault secret recovery, hosted authentication configuration and the complete hosted service were not recreated. No production restore was performed and no outbound workers were enabled.

The local server was stopped after verification. Automated approval review blocked cleanup of the plaintext test exports and local cluster; they remain in the restricted backup folder. This cleanup and an automatic off-site backup/restore plan remain open.

## Automatic email monitoring

Apply `supabase/email_worker_monitoring.sql` after the outbound-mail migration. The dispatcher records a heartbeat even when idle. CRM staff receive persistent health alerts, refreshed every 30 seconds while the CRM is open, for stale/missing heartbeat, delayed or failed mail, expired leases, disabled/test mode and capacity limits. These alerts clear when the condition resolves; marking ordinary notifications read cannot hide them. Customers/operators cannot query staff email health. This is in-app monitoring, not unattended external paging. Assign an incident owner before broad launch.

The migration and frontend were deployed November 14. Unit, authorization, notification UI and 390/768/1440-pixel browser checks passed. Actual live assets included heartbeat and persistent-alert logic.

## Bounded public HTTP check

`node scripts/public-http-burst.mjs` checks six public entry routes with 60 GETs, concurrency five and a per-worker delay. On November 14 all 60 returned HTTP 200 HTML; p95 was 242 ms. This does not test authenticated database throughput, email/login limits, page interactions or large-scale production capacity.

## November 15 additional acceptance pass

All 47 automated suites passed. The connected lifecycle also passed after adding the latest composed-mail, current-reminder and worker-monitoring migrations together. This remains an isolated synthetic workflow, not a real operator trial.

`scripts/live-interactions.audit.mjs` passed 16 checks against the deployed site at 390 and 1440 pixels: website-to-customer sign-in navigation, password mode, filter empty-state/reset, three-step plan generation, blocked-network form recovery with preserved input and company-email fallback, partner validation, agreement deep-link sign-in guidance and the CRM authentication gate. The test blocks non-read browser requests, so it cannot prove successful submission or authenticated behavior. Set `PLAYWRIGHT_MODULE_PATH` when Playwright is installed outside the repository. Run from the repository root.

`scripts/live-access.audit.mjs` passed 19 production access checks: anonymous reads returned no data or access denial for 16 private tables, two privileged RPCs rejected anonymous access, and the email worker rejected unauthenticated dispatch. A successful public auth-settings request is the positive control for credential validity. The script uses only the public publishable/anonymous key from deployed assets and never prints it. These tests do not replace authenticated cross-account checks.

A fresh signed-in production rollback test and shared-sheet update could not run in this pass: desktop automation repeatedly returned `coordinate input geometry is unavailable` after window recovery, and the alternate browser had no signed-in project tab. Existing prior production evidence remains distinct from this pass. Local reports record the new results; do not mark the shared checklist updated until the edit is actually verified.

Follow-up at 00:20 Arizona on November 15: desktop control recovered. The complete `scripts/connected-workflow-live-qa.sql` ran successfully in the signed-in production SQL editor, with every fixture transaction rolled back. This rechecked customer/booking isolation, sender spoof prevention, saved preferences, staff replies, operator acceptance/decline, revision/idempotency handling, meeting points, private operator conversations and transactional event/reminder generation. Final checks showed zero named test customers/operators remaining, live email mode, a current worker heartbeat and zero pending messages. This is database-role testing, not a complete browser login-to-booking journey. The shared checklist was updated in rows 95–100 with the latest evidence and remaining limits.

## Launch gates requiring business or device evidence

- Confirm real operator identity, pricing, availability, cancellation terms, permits and insurance. Public seed listings are planning examples, not approved real inventory.
- Verify John can independently authenticate on his own device without disabling MFA.
- Complete a consenting real operator/customer trial after synthetic QA.
- Booking customer/operator notices, application needs-changes, operator overdue and team follow-up emails were observed in the recipient inboxes on November 14, 2026. The reminder fixture used an aged timestamp and prequeued scoped recipients; the real cron worker dispatched it. Real elapsed 12-hour operation and a consenting operator trial remain distinct from synthetic delivery QA.
- Assign incident/alert ownership and confirm capacity for expected traffic; conduct an agreed isolated load test before claiming scale readiness.
- Payments and automatic WhatsApp synchronization remain outside the current enabled scope. A separate local payment rehearsal now covers the 20% TicoWild commission, 80% operator balance, email previews and document examples; see `STRIPE-PAYMENT-PREPARATION.md`. It does not enable payments or send emails and is excluded from the production build.

## November 14 reminder correction and isolated burst

Apply supabase/booking_reminder_current_request.sql after crm_outbound_email.sql. It preserves composed-mail authorization and rejects a queued overdue reminder unless its event key matches the current booking response timestamp, the booking still requests a response, and the 12-hour deadline has passed. This migration was applied to production and its function definition verified. Reopening a request must never revive the prior reminder.

Run scripts/isolated-burst.test.mjs for bounded isolated reliability coverage: 100 synthetic customers, 1,000 trips, 100 submitted read requests and 20 worker claim requests. The test verifies each customer's ten trips, no duplicate claims, and a 40-message budget with 60 remaining pending. PGlite serializes database work; these numbers do not establish production throughput, concurrent network capacity or a recovery-time objective.

## November 15 customer travel tools

The customer portal now includes a next-confirmed-adventure card (Costa Rica
time), a readiness checklist, private account-saved personal reminders, a
downloadable offline HTML trip pack, selective itinerary-copy sharing, structured
change/weather/alternative requests, itinerary-based Rico answers and private
post-activity feedback. Documents, traveler details, payments and support have
explicit section navigation. Prepared requests/feedback open as editable drafts
in the existing Messages channel; the customer must send them. Draft edits persist
while switching portal tabs. No database migration or expanded data-access policy
is required; existing message and own-account preference permissions apply.

Boundaries: sharing creates a user-reviewed copy, not a revocable live guest link
or companion login. Location sharing is opt-in; financial fields, profile data,
messages and pass codes are omitted. The offline pack is a dated snapshot without
external assets/scripts, not a boarding/admission pass. Rico is a deterministic
helper over the loaded itinerary, not a live weather, inventory or payment service.
Requests do not alter dates/prices or automatically accept an alternative. Feedback
is private for every rating, with no new public-review integration or automatic
feedback-email campaign. Payment verification and operator balances remain manual
until the separate Stripe implementation is connected. The public Rico payment
answers were corrected to match that state and the included 20% commission.

Verification: all 53 regression suites passed, including 16 customer journey
model/privacy scenario groups and component interactions. Targeted follow-up
checks proved request-to-draft handoff without automatic sending. The production
build passed. Browser preview verified field-selective sharing, weather-request
preview, itinerary-grounded Rico and narrow-screen layout; an actual offline pack
download was found and inspected. Live deployment verification is recorded in the
customer-experience output report after publication.
