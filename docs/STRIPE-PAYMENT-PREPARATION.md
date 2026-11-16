# Stripe payment preparation — November 15, 2026

Status: design and isolated calculation helpers only. No checkout endpoint, webhook,
database migration, live UI, Stripe account connection or payment collection has been enabled.

## Agreed customer flow

Adam confirmed: the 20% retained by TicoWild is its commission; the operator keeps the remaining 80% collected directly from the customer. This is the normal completed-booking split; cancellation exceptions remain governed by the accepted policy.

For each excursion, collect 20% of the approved total through TicoWild's Stripe
account. Customer pays the remaining 80% directly to that excursion's operator at
the excursion. A $500 excursion means $100 online and $400 to the operator.
Never schedule an automatic charge for the operator balance. Never describe that
balance as a Stripe payout. Multiple excursions need separate operator balances.

Current agreement version `2026-11-14-operator-partner-full-v2`, section 4, calls
the 20% the TicoWild Fee. Section 7 allows an operator share on some non-fault
cancellations. Preserve the version actually accepted by each operator; old
signed agreements cannot be retroactively replaced. Customer cancellation terms
and exception handling must be approved before accepting payments.

## Existing system gaps

- `trips.total` and `trips.deposit` are manually entered values, not proof of payment.
- `bookings.price` lacks an explicit currency, price revision and per-person versus
  whole-party meaning. Quote publication currently does not establish an approved
  chargeable total per excursion.
- `operatorNet` is deliberately null. Do not derive an amount owed from unverified
  legacy prices or imply that TicoWild will remit an operator payout.
- No legacy trip marked “Deposit paid” may be imported as verified Stripe payment.

## Prepared helper

`src/payments/deposit-model.js` calculates the 20/80 split from an explicit integer
minor-unit total and currency, rounding the deposit once and assigning the exact
remainder to the operator. The caller must validate Stripe-supported currency,
minimum/maximum charge and currency exponent; the helper does not do conversion.
It also checks paid Session amount, currency, ID and test/live mode against a
stored obligation. This is not signature verification or a complete webhook.
Run `node scripts/deposit-model.test.mjs`.

## Required implementation before enabling checkout

1. Staff approves a whole-party price and currency for each accepted excursion.
   Snapshot booking/customer/operator IDs, revision, total, 20% deposit, 80%
   operator balance and accepted customer terms/cancellation policy. Decide tax
   treatment before freezing this price. Do not silently add card surcharges.
2. Add private payment obligations, checkout attempts, Stripe event inbox,
   refund/dispute records and operator balance receipts. Financial records must
   survive cancellation. Customers read their own summary; operators see only
   their assigned excursion's balance; only the server changes Stripe status.
   Use RLS and ownership checks; no browser write access to financial status.
3. Authenticated server endpoint loads the approved revision and customer
   ownership itself. Reject cancelled/declined/unapproved/already-paid bookings.
   Create hosted Checkout for exactly the deposit, with no customer-supplied
   amount, price or arbitrary return URL. Use an allowlisted return origin.
   Keep restricted Stripe credentials and signing secrets only in server secrets.
4. Lock/uniquely constrain one active obligation per booking revision; persist
   checkout-attempt UUID before calling Stripe and use it as the idempotency key.
   Reuse the active Session; reconcile uncertain creation outcomes before retry.
   Never rely solely on Stripe's time-limited idempotency cache. Expire old Sessions
   before replacing prices; handle late payments against superseded revisions.
5. Required webhook verifies signature over the raw body, account and environment.
   Deduplicate event IDs transactionally and retrieve canonical Stripe state.
   Handle completed and async-success events only when payment_status is paid;
   handle async failure, expiry, refunds and disputes separately. Validate Session,
   currency and amount against the immutable obligation. A redirect never marks
   a deposit paid. Do not let delayed failure events overwrite verified success.
   Persist a durable event/transaction before acknowledging; retry processing
   safely. Queue one receipt per verified transition through the existing outbox.
6. Customer screen: full excursion total, 20% due/paid to TicoWild, 80% due directly
   to named operator, date and operator-supported payment methods. CRM: unpaid,
   processing, paid, partially refunded, refunded, failed and disputed states,
   with provider references and history. Operator: remaining balance to collect,
   recorded collection actor/time/reference, not a TicoWild payout estimate.
   Keep operator acceptance, deposit payment and balance collection independent.
7. Cancellation must stop new checkout immediately, expire existing Sessions,
   and route paid deposits for policy review; cancellation alone is not a refund.
   Record partial refunds and any approved section-7 operator share separately.
   A refund does not automatically increase the customer's operator balance.
   A payment arriving after cancellation needs review/refund, not reactivation.

## Activation gates

- Confirm Stripe account owner/entity/country, settlement currency, customer
  currency, bank destination and who absorbs processing fees. No rate assumed.
- Confirm customer-facing taxes, cancellation/refund policy and operator collection
  methods. Do not enable Stripe Tax without an active applicable registration.
- Decide whether payment follows operator acceptance (recommended initial flow)
  and how long a confirmed slot is held awaiting the deposit.
- Connect an isolated Stripe sandbox. Build and test the complete checkout/webhook
  implementation, ledger migration and three surfaces before live activation.
- Test declined cards, 3DS, abandoned checkout, async success/failure, invalid
  signatures, replay, out-of-order events, concurrent clicks, cross-user access,
  stale price, wrong currency/mode/amount, cancellation racing payment, partial
  and full refunds, disputes and receipt retry. Run real sandbox browser journeys.
- Deploy with collection disabled, verify configuration and monitoring, then
  explicitly activate live collection. No real charge during preparation.

Stripe Connect is not part of the ordinary 80% flow described here because the
operator receives that money directly from the customer. Any future automated
operator transfer, including cancellation shares, needs its own reviewed design.

## Primary references

- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/api/idempotent_requests
- https://docs.stripe.com/receipts

Stripe connector required reauthentication during preparation; no account state
was verified. Public official documentation was used as fallback.

## Full customer journey review

Reviewed against current portal data loading, payment display, booking data model,
operator model and agreement source. This is a gap audit, not a completed payment
journey test. Existing customer trip reads are tied to the authenticated user;
current Payments and Documents screens explicitly do not verify payments or issue
receipts. No invoice implementation was found in the reviewed payment surfaces.

| Stage | Required experience | Acceptance evidence before launch |
| --- | --- | --- |
| Quote | Whole-party total, currency, excursion/date/party size, named operator, 20% now, 80% at excursion, taxes and exclusions clearly shown | Staff approval freezes a priced revision; unpriced/expired quotes cannot be paid |
| Account | Customer signs in or verifies email before paying; checkout is attached to that account and booking | Existing and new customer, expired link, second device and password recovery tested; another customer's records remain inaccessible |
| Availability | Operator acceptance and a defined hold deadline precede checkout in the proposed initial flow | No charge for declined/unavailable inventory; expired holds and price changes invalidate checkout |
| Checkout | Branded Stripe checkout collects only the 20%; billing details and terms acceptance captured | Actual sandbox payment, 3DS, decline, cancellation and double-click tests |
| Return | Show processing until server verification arrives; a closed tab must not lose the payment | Webhook-before-redirect, redirect-before-webhook, no-return and lost-network cases |
| Portal | Persist totals, payment history, receipt/invoice access, balance per operator, itinerary, meeting point and support thread | Log out and return on another device; identical amounts in CRM and operator view |
| Documents | Booking statement covers full excursion; TicoWild invoice/receipt covers the 20% collected; operator handles its own 80% receipt | PDFs, email delivery and private document access checked; never mark full total paid from deposit alone |
| Before excursion | Reminders state the outstanding operator amount, currency, due date and accepted collection methods | Correct local excursion time; stop reminders after cancellation or recorded collection |
| At excursion | Operator records balance collection with amount, currency, method, actor and time | Distinguish operator-reported payment from Stripe-verified payment; corrections retain audit history |
| After excursion | Completed service remains separate from payment status; customer retains documents and support access | Completion cannot silently mark operator balance paid; unpaid balance remains visible |
| Changes/refunds | Show cancellation, refund requested/pending/succeeded/failed and revised documents as appropriate | Partial cancellation, reschedule, price adjustment, partial refund and dispute tested without erasing original records |

### Invoices and receipts

Recommended document set, pending business/tax review:

1. Booking statement: total excursion price, TicoWild 20%, operator 80%, currency,
   parties, excursion date, booking reference, policy version and payment history.
   Label it a booking statement; it is not evidence of a full payment.
2. TicoWild payment receipt: only money actually collected by TicoWild. Link it to
   the booking and label the charge clearly as the 20% booking commission included
   in the excursion total, so it cannot be mistaken for an extra fee.
3. TicoWild paid invoice if needed: Stripe supports post-payment invoices for
   one-time Checkout purchases, separately priced. Select that configuration only
   after reviewing cost and invoice requirements. Do not create a separate payable
   invoice after Checkout that charges the same commission a second time.
4. Operator receipt: covers the amount collected directly by the operator. A
   staff-entered “collected” status is not a Stripe receipt or proof of bank settlement.
5. Refund documentation: retain original invoice and payment history; attach the
   appropriate refund/credit record rather than editing the original paid amount.

Documents need stable references, issue dates, seller identity/contact details,
customer billing details as required, description, currency, amounts and applicable
tax details. Confirm who legally invoices each component before enabling billing;
the commercial 20/80 split alone does not determine tax/accounting treatment.
Store provider document references and allow authorized retrieval. Do not treat a
cached receipt URL as permanent: Stripe receipt links can expire. Provide recovery
and support, and never expose documents through guessable public booking URLs.

Stripe creates receipts for successful payments/refunds, but email delivery must
be configured. Sandbox automatic receipt emails do not behave like live receipts;
use supported manual test receipts and record that distinction. Avoid duplicate
TicoWild/Stripe payment receipts; the TicoWild itinerary confirmation is separate.

### Operational controls

- Daily reconciliation: match booking obligations to Stripe payments, refunds,
  disputes and balance transactions; account for gross commission, processing
  fees, net settlement and bank payout timing. Gross excursion sales, collected
  commission and recognized revenue are separate figures. Commission recognition
  follows the agreed accounting policy, not merely the charge date.
- Exception queue: paid with no booking match, payment after cancellation, duplicate
  charge, wrong amount/currency, webhook delay, failed refund, missing document,
  undelivered email, operator-reported short payment and unresolved dispute.
- Restrict refunds, price changes, write-offs and manual collection corrections to
  appropriate staff; retain actor/time/reason and old/new values. Never store card
  numbers or security codes. Refund to the original payment using supported flows.
- Reconcile automatically plus provide a staff recovery action; retries must not
  create another charge, refund or receipt. Monitor failed workers and aged payments.
- Define support owner, customer contact information, recognizable statement
  descriptor, response expectations and escalation coverage before launch.
- Set retention/access policy for documents and payment metadata, include these
  records in protected backups and test restoration without sending notifications.
- Email failure must not undo a verified payment; the portal remains the place to
  recover the booking and receipt. Include payment notices in capacity planning.

### Specific acceptance scenarios

Use a $500 excursion as the initial controlled test: $100 collected by TicoWild,
$400 due to the named operator. Then use two excursions with different operators
and prove each balance remains separate. Verify party-size and price changes before
and after payment, different payer/billing email without changing booking ownership,
same customer with multiple trips, duplicate provider events, expired sign-in and
receipt links, refund with no customer return visit, and attempted access by another
customer/operator. Every stage must agree across CRM, customer portal, operator
portal and Stripe. Local arithmetic tests alone do not establish any of this.

### Current release decision

Payment launch is blocked until checkout, the durable ledger, verified webhooks,
document generation/retrieval, reconciliation and the sandbox journey above exist
and pass. Preparation is saved locally; no payment UI or backend has been deployed.
The currently tested booking/messaging journey must not be described as a tested
payment journey. An accountant/business owner must confirm billing entity, tax,
invoice treatment and refund policy; Stripe connection is also still required.
