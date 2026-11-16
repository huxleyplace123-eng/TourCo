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

Stripe connector required reauthentication during preparation; no account state
was verified. Public official documentation was used as fallback.
