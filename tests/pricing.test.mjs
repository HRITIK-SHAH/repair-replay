import { test } from "node:test";
import assert from "node:assert/strict";
import { priceCart } from "../demo-shop/src/pricing.js";
test("empty cart has no charges", () =>
  assert.deepEqual(priceCart([]), {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
  }));
test("quantities and shipping use integer paise", () =>
  assert.deepEqual(priceCart([{ id: "loop", quantity: 3 }]), {
    subtotal: 209700,
    discount: 0,
    shipping: 9900,
    total: 219600,
  }));
test("discount threshold and free shipping use pre-discount subtotal", () => {
  assert.equal(priceCart([{ id: "loop", quantity: 4 }], "NORTH10").discount, 0);
  assert.deepEqual(priceCart([{ id: "form", quantity: 1 }], " north10 "), {
    subtotal: 399900,
    discount: 39990,
    shipping: 9900,
    total: 369810,
  });
  assert.deepEqual(priceCart([{ id: "dock", quantity: 3 }], "NORTH10"), {
    subtotal: 599700,
    discount: 59970,
    shipping: 0,
    total: 539730,
  });
  assert.equal(priceCart([{ id: "form", quantity: 1 }], "OTHER").discount, 0);
});
