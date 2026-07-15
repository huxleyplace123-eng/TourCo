import { operators } from "../data.js";
import { isExplicitlyApproved } from "./publication.js";

// The 20/80 deposit math + the exact customer-facing language (used everywhere
// money is shown, so it's identical and never a surprise).
export function depositTerms(price, pax = 1) {
  const total = price * pax;
  const deposit = Math.round(total * 0.2);
  const balance = total - deposit;
  return {
    deposit,
    balance,
    total,
    line: `Your 20% deposit (${money(deposit)}) reserves the experience and covers TicoWild planning, coordination, and support. The remaining ${money(balance)} is paid directly to your local operator on the day.`,
    short: `20% now · 80% to the operator on the day`,
  };
}

/**
 * Build an operator receipt only from fields explicitly present in the record.
 * No inferred permits, safety checks, review sources, or reconfirmation dates.
 */
export function trustReceipt(op) {
  if (!isExplicitlyApproved(op)) return null;

  const checks = [{
    key: "publication",
    label: "Approved for publication",
    ok: true,
    detail: "Currently enabled in TicoWild's published partner catalog",
  }];

  if (op.insurance === true) {
    checks.push({
      key: "insurance",
      label: "Insurance recorded",
      ok: true,
      detail: "Insurance is marked on file in the current operator record",
    });
  }

  if (Number.isFinite(op.rating)) {
    checks.push({
      key: "rating",
      label: "Operator rating listed",
      ok: true,
      detail: `${op.rating}★ in the current TicoWild catalog`,
    });
  }

  if (op.whatsapp) {
    checks.push({
      key: "contact",
      label: "Direct contact on file",
      ok: true,
      detail: op.responseTime ? `Listed response time ${op.responseTime}` : "Operator contact route recorded",
    });
  }

  // Kept for Rico's recommendation formula; it is derived only from the
  // explicit record above and is not presented as an independent audit score.
  const score = Math.min(100, Math.round(
    40
    + (op.insurance === true ? 25 : 0)
    + (Number.isFinite(op.rating) ? (op.rating / 5) * 20 : 0)
    + (op.whatsapp ? 15 : 0),
  ));

  return { op, checks, score };
}

export function trustForActivity(activityOperatorId) {
  return trustReceipt(operators.find((operator) => operator.id === activityOperatorId));
}

function money(n) {
  return "$" + Math.round(n).toLocaleString();
}
