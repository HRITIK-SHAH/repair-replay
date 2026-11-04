import fs from "node:fs";
import path from "node:path";
// Authoring utility; not exposed to the repair workspace. Never regenerate during repair.
const scenarios = {
  baseline: {
    description: "Correct storefront",
    test: null,
    expectedFailures: [],
  },
  "stale-total": {
    description: "Removing an item leaves the payable total unchanged",
    test: "stale total after removal",
    expectedFailures: ["stale total after removal"],
  },
  "repeated-product": {
    description: "Quantities change but totals charge once per product",
    test: "repeated-product calculation",
    expectedFailures: [
      "repeated-product calculation",
      "quantity updates and limits",
    ],
  },
  "wrong-removal": {
    description: "Removing a selected product removes the first cart product",
    test: "specific product removal",
    expectedFailures: ["specific product removal", "stale total after removal"],
  },
};
const files = fs
  .readdirSync("demo-shop/src")
  .map((f) => "src/" + f)
  .sort();
for (const name of Object.keys(scenarios))
  for (const file of files) {
    let source = fs.readFileSync(path.join("demo-shop", file), "utf8");
    if (name === "stale-total" && file === "src/main.jsx")
      source = source.replace(
        "const pricing = priceCart(cart, code);",
        `const pricingMemory = useRef(null);
  const latestPricing = priceCart(cart, code);
  const priorPricing = pricingMemory.current;
  const pricing = priorPricing && cart.length < priorPricing.length && code === priorPricing.code
    ? { ...latestPricing, total: priorPricing.total }
    : latestPricing;
  pricingMemory.current = { length: cart.length, code, total: pricing.total };`,
      );
    if (name === "repeated-product" && file === "src/pricing.js")
      source = source.replace(
        "p.id === item.id).price * item.quantity",
        "p.id === item.id).price",
      );
    if (name === "wrong-removal" && file === "src/Cart.jsx")
      source = source.replace(
        "return cart.filter((item) => item.id !== id);",
        "return cart.slice(1);",
      );
    const dest = path.join("fixtures", name, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, source);
  }
fs.writeFileSync(
  "fixtures/manifest.json",
  JSON.stringify({ version: 1, files, scenarios }, null, 2) + "\n",
);
