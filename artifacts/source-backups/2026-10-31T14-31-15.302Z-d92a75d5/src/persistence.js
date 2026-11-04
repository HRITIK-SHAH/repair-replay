import { products } from "./products.js";
export const KEY = "northstar-cart-v1";
export function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value
      .filter(
        (x) =>
          x &&
          products.some((p) => p.id === x.id) &&
          Number.isInteger(x.quantity) &&
          x.quantity >= 1 &&
          x.quantity <= 9 &&
          !seen.has(x.id) &&
          seen.add(x.id),
      )
      .map(({ id, quantity }) => ({ id, quantity }));
  } catch {
    return [];
  }
}
export function saveCart(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {}
}
