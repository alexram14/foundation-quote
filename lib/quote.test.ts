import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateQuote } from "./quote.ts";

test("empty quote is zero (no mobilization fee without work)", () => {
  const r = calculateQuote({ lines: [], discountPercent: 0, taxPercent: 8 });
  assert.equal(r.totalCents, 0);
});

test("piers + mobilization, discount, then tax", () => {
  // 4 push piers = 4 × $1,450 = $5,800, + $350 mobilization = $6,150
  // 10% discount = $615 → $5,535; 8% tax = $442.80 → $5,977.80
  const r = calculateQuote({ lines: [{ serviceId: "push-pier", quantity: 4 }], discountPercent: 10, taxPercent: 8 });
  assert.equal(r.subtotalCents, 615000);
  assert.equal(r.discountCents, 61500);
  assert.equal(r.taxCents, 44280);
  assert.equal(r.totalCents, 597780);
  assert.deepEqual(r.errors, []);
});

test("fractional piers are rejected, fractional linear feet are fine", () => {
  const r = calculateQuote({
    lines: [
      { serviceId: "push-pier", quantity: 2.5 },
      { serviceId: "drain-tile", quantity: 10.5 },
    ],
    discountPercent: 0,
    taxPercent: 0,
  });
  assert.equal(r.errors.length, 1);
  assert.equal(r.lines.length, 1);
  assert.equal(r.lines[0].totalCents, 68250); // 10.5 × $65
});

test("out-of-range discount is reported and clamped", () => {
  const r = calculateQuote({ lines: [{ serviceId: "sump-pump", quantity: 1 }], discountPercent: 150, taxPercent: 0 });
  assert.ok(r.errors.some((e) => e.includes("Discount")));
  assert.equal(r.totalCents, 0); // clamped to 100%
});
