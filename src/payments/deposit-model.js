// Preparation only: no checkout, credentials, or mutation of booking/payment state.
// Input is an approved per-excursion total in currency minor units, not a per-person price.
export function splitExcursionTotal(totalMinor, currency) {
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 5) {
    throw new Error('Supply a positive approved excursion total in minor units (at least 5).');
  }
  if (typeof currency !== 'string' || !/^[a-z]{3}$/.test(currency)) {
    throw new Error('Supply an explicit lowercase currency code.');
  }
  // Integer arithmetic avoids floating point money drift; round 20% to nearest minor unit.
  const depositMinor = Math.floor(totalMinor / 5) + (totalMinor % 5 >= 3 ? 1 : 0);
  return Object.freeze({currency, totalMinor, depositMinor,
    operatorBalanceMinor: totalMinor - depositMinor, depositPercent: 20});
}

// This is an amount-match check ONLY. The future server handler must first verify
// Stripe's signature/account/mode and retrieve the canonical Session. Never call
// this from a success-page redirect as proof of payment.
export function matchesPaidDeposit(session, obligation) {
  return session?.mode === 'payment' && session.payment_status === 'paid'
    && typeof obligation?.checkoutSessionId === 'string'
    && obligation.checkoutSessionId.length > 0
    && session.id === obligation.checkoutSessionId
    && Number.isSafeInteger(obligation.depositMinor) && obligation.depositMinor > 0
    && session.amount_total === obligation.depositMinor
    && session.currency === obligation.currency
    && typeof obligation.livemode === 'boolean'
    && session.livemode === obligation.livemode;
}
