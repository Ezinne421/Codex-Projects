import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetTotal, financials } from "../server/finance.js";
test("rounds each line to minor units and applies contingency before tax", () => {
  assert.deepEqual(
    budgetTotal(
      [
        { quantity: 2.5, rateMinor: 10001 },
        { quantity: 3, rateMinor: 20000 },
      ],
      10,
      7.5,
    ),
    { subtotal: 85003, contingency: 8500, tax: 7013, total: 100516 },
  );
});
test("reports overspend and does not invent utilisation for an empty budget", () => {
  assert.equal(financials([], [{ amountMinor: 100 }]).utilisation, null);
  assert.equal(
    financials([{ quantity: 1, rateMinor: 1000 }], [{ amountMinor: 1500 }])
      .remaining,
    -500,
  );
  assert.equal(
    financials([{ quantity: 1, rateMinor: 1000 }], [{ amountMinor: 1500 }])
      .utilisation,
    150,
  );
});
test("rejects unsafe financial totals", () =>
  assert.throws(() => budgetTotal([{ quantity: 1e12, rateMinor: 1e12 }])));
