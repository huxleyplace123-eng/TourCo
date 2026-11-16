import assert from 'node:assert/strict';
import {splitExcursionTotal, matchesPaidDeposit} from '../src/payments/deposit-model.js';

assert.deepEqual(splitExcursionTotal(50000, 'usd'), {
  currency:'usd', totalMinor:50000, depositMinor:10000, operatorBalanceMinor:40000, depositPercent:20,
});
for (const total of [5, 6, 7, 8, 49999, 50001, Number.MAX_SAFE_INTEGER]) {
  const result = splitExcursionTotal(total, 'usd');
  assert.equal(result.depositMinor + result.operatorBalanceMinor, total);
  assert.ok(Number.isSafeInteger(result.depositMinor));
}
assert.equal(splitExcursionTotal(8, 'usd').depositMinor, 2);
for (const total of [undefined, null, '', '50000', 0, -1, 4, 10.5, NaN, Infinity, Number.MAX_SAFE_INTEGER+1]) {
  assert.throws(() => splitExcursionTotal(total, 'usd'));
}
for (const currency of [undefined, '', 'USD', 'dollars', 123]) assert.throws(() => splitExcursionTotal(50000, currency));
const obligation = {checkoutSessionId:'cs_test_1', depositMinor:10000, currency:'usd', livemode:false};
const paid = {id:'cs_test_1', mode:'payment', payment_status:'paid', amount_total:10000, currency:'usd', livemode:false};
assert.equal(matchesPaidDeposit(paid, obligation), true);
for (const change of [{payment_status:'unpaid'}, {payment_status:'no_payment_required'}, {mode:'setup'}, {amount_total:40000}, {currency:'crc'}, {id:'cs_other'}, {livemode:true}]) {
  assert.equal(matchesPaidDeposit({...paid,...change}, obligation), false);
}
assert.equal(matchesPaidDeposit(null, obligation), false);
assert.equal(matchesPaidDeposit(paid, {}), false);
console.log('Deposit preparation: split, rounding, invalid inputs, unpaid/mismatched session checks passed.');
