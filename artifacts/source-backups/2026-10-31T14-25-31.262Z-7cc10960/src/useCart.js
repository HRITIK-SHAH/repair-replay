import { useState, useEffect } from "react";
import { readCart, saveCart } from "./persistence.js";
export function useCart() {
  const [cart, setCart] = useState(readCart);
  useEffect(() => saveCart(cart), [cart]);
  return [cart, setCart];
}
