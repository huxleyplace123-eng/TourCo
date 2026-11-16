// Plain-text content only. Delivery must use the durable server outbox.
export const formatPaymentMoney = (minor, currency = 'usd') => new Intl.NumberFormat('en-US', {
  style:'currency', currency:currency.toUpperCase(),
}).format(minor / 100); // Rehearsal supports USD only; no implicit currency conversion.

export function parseSampleUsd(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) throw new Error('Enter a USD amount with no more than two decimal places.');
  const [whole, fraction=''] = String(value).split('.');
  const result=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(result) || result<=0) throw new Error('Enter a positive USD amount.');
  return result;
}

export function paymentNotification({booking, kind, amountMinor, reference, sample = false}) {
  const money = value => formatPaymentMoney(value, booking.currency);
  const prefix = sample ? '[SAMPLE — no real payment] ' : '';
  const paid = kind === 'payment';
  const review = kind === 'review';
  return {
    subject: prefix + (paid ? 'Payment received — your TicoWild booking' : review ? 'Payment received — booking needs review' : 'Your TicoWild refund update'),
    text: `${sample ? 'SAMPLE ONLY. No money moved and no real reservation was made.\n\n' : ''}Hello ${booking.customerName},\n\n${paid ? `We received your ${money(amountMinor)} upfront payment to TicoWild.` : review ? `We received ${money(amountMinor)}, but your booking needs staff review. This is not a booking confirmation. Please do not travel based on this notice.` : `Your refund of ${money(amountMinor)} has been recorded as successful by the payment provider. Bank posting time may vary.`}\n\nBooking: ${booking.reference}\nExperience: ${booking.name}\nOperator: ${booking.operatorName}\nDate: ${booking.date} at ${booking.time} (Costa Rica time)\nTravelers: ${booking.travelers}\nReference: ${reference}\n\n${paid ? `Excursion total: ${money(booking.totalMinor)}\nPaid to TicoWild: ${money(booking.depositMinor)} (20%, included in the total)\nRemaining: ${money(booking.operatorBalanceMinor)} payable directly to ${booking.operatorName} at the excursion.\nOperator payment methods: ${booking.collectionMethods}\nWe will not automatically charge this remaining balance.\n\n` : ''}Open your secure TicoWild portal for your current booking status, payment history and documents:\nhttps://ticowild.com/my/\nSign in with the email used for your booking.\n\n${paid ? `Meeting point: ${booking.meetingPoint}\nBring: ${booking.bring}\nCancellation terms: ${booking.cancellationPolicy}\n\n` : ''}Questions or a correction? Reply to info@ticowild.com.\nTicoWild`,
  };
}
