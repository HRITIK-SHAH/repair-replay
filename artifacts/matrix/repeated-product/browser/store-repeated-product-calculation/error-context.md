# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: store.spec.js >> repeated-product calculation
- Location: tests\store.spec.js:44:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('payable-total')
Expected: "₹1,497.00"
Received: "₹798.00"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" getByTestId('payable-total') with timeout 5000ms
  - waiting for getByTestId('payable-total')
    14 × locator resolved to <dd data-testid="payable-total">₹798.00</dd>
       - unexpected value "₹798.00"

```

```yaml
- definition: ₹798.00
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | const pageErrors = new WeakMap();
  3   | test.beforeEach(async ({ page }) => {
  4   |   const errors = [];
  5   |   pageErrors.set(page, errors);
  6   |   page.on("pageerror", (error) => errors.push(error.message));
  7   |   await page.goto("/");
  8   |   await page.evaluate(() => localStorage.clear());
  9   |   await page.reload();
  10  | });
  11  | test.afterEach(async ({ page }) => expect(pageErrors.get(page)).toEqual([]));
  12  | const add = async (page, name) =>
  13  |   page.getByRole("button", { name: `Add ${name} to bag`, exact: true }).click();
  14  | const bag = async (page) => page.getByRole("link", { name: /^Bag \(/ }).click();
  15  | test("search, category, sorting and empty results", async ({ page }) => {
  16  |   await page.getByRole("button", { name: "Audio", exact: true }).click();
  17  |   await expect(page.locator(".product")).toHaveCount(2);
  18  |   await page.getByRole("button", { name: "All products", exact: true }).click();
  19  |   await page.getByLabel("Sort products").selectOption("low");
  20  |   await expect(page.locator(".product h3").first()).toHaveText(
  21  |     "Loop charging cable",
  22  |   );
  23  |   await page.getByLabel("Sort products").selectOption("name");
  24  |   await expect(page.locator(".product h3").first()).toHaveText("Arc desk lamp");
  25  |   await page.getByLabel("Sort products").selectOption("high");
  26  |   await expect(page.locator(".product h3").first()).toHaveText(
  27  |     "Orbit headphones",
  28  |   );
  29  |   await page.getByLabel("Search products").fill("folio");
  30  |   await expect(page.locator(".product")).toHaveCount(1);
  31  |   await page.getByLabel("Search products").fill("no-such-product");
  32  |   await expect(page.getByText("No essentials found")).toBeVisible();
  33  |   await page.getByRole("button", { name: "Clear search and filters" }).click();
  34  |   await expect(page.locator(".product")).toHaveCount(8);
  35  | });
  36  | test("add one product and persist after reload", async ({ page }) => {
  37  |   await add(page, "Orbit headphones");
  38  |   await bag(page);
  39  |   await expect(page.getByTestId("payable-total")).toHaveText("₹5,098.00");
  40  |   await page.reload();
  41  |   await expect(page.getByLabel("Orbit headphones quantity")).toHaveText("1");
  42  |   await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  43  | });
  44  | test("repeated-product calculation", async ({ page }) => {
  45  |   await add(page, "Loop charging cable");
  46  |   await add(page, "Loop charging cable");
  47  |   await bag(page);
  48  |   await expect(page.getByLabel("Loop charging cable quantity")).toHaveText("2");
> 49  |   await expect(page.getByTestId("payable-total")).toHaveText("₹1,497.00");
      |                                                   ^ Error: expect(locator).toHaveText(expected) failed
  50  | });
  51  | test("quantity updates and limits", async ({ page }) => {
  52  |   await add(page, "Loop charging cable");
  53  |   await bag(page);
  54  |   await expect(
  55  |     page.getByRole("button", { name: "Decrease Loop charging cable" }),
  56  |   ).toBeDisabled();
  57  |   await page
  58  |     .getByRole("button", { name: "Increase Loop charging cable" })
  59  |     .click();
  60  |   await expect(page.getByTestId("payable-total")).toHaveText("₹1,497.00");
  61  |   await page
  62  |     .getByRole("button", { name: "Decrease Loop charging cable" })
  63  |     .click();
  64  |   await expect(page.getByTestId("payable-total")).toHaveText("₹798.00");
  65  |   for (let i = 0; i < 8; i++)
  66  |     await page
  67  |       .getByRole("button", { name: "Increase Loop charging cable" })
  68  |       .click();
  69  |   await expect(
  70  |     page.getByRole("button", { name: "Increase Loop charging cable" }),
  71  |   ).toBeDisabled();
  72  |   await expect(page.getByText("Maximum 9 per product.")).toBeVisible();
  73  | });
  74  | test("specific product removal", async ({ page }) => {
  75  |   await add(page, "Orbit headphones");
  76  |   await add(page, "Pebble speaker");
  77  |   await bag(page);
  78  |   await page.getByRole("button", { name: "Remove Pebble speaker" }).click();
  79  |   await expect(
  80  |     page.getByRole("article", { name: "Pebble speaker", exact: true }),
  81  |   ).toHaveCount(0);
  82  |   await expect(
  83  |     page.getByRole("article", { name: "Orbit headphones", exact: true }),
  84  |   ).toBeVisible();
  85  | });
  86  | test("stale total after removal", async ({ page }) => {
  87  |   await add(page, "Orbit headphones");
  88  |   await add(page, "Pebble speaker");
  89  |   await bag(page);
  90  |   await expect(page.getByTestId("payable-total")).toHaveText("₹7,498.00");
  91  |   await page.getByRole("button", { name: "Remove Pebble speaker" }).click();
  92  |   await expect(page.getByTestId("payable-total")).toHaveText("₹5,098.00");
  93  | });
  94  | test("remove final item and empty checkout guard", async ({ page }) => {
  95  |   await add(page, "Orbit headphones");
  96  |   await bag(page);
  97  |   await page.getByRole("button", { name: "Remove Orbit headphones" }).click();
  98  |   await expect(
  99  |     page.getByText(
  100 |       "Your bag is empty. Explore thoughtfully designed accessories.",
  101 |     ),
  102 |   ).toBeVisible();
  103 |   await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  104 |   await page.goto("/#checkout");
  105 |   await expect(
  106 |     page.getByRole("button", { name: "Place simulated order" }),
  107 |   ).toHaveCount(0);
  108 | });
  109 | test("discount eligibility and arithmetic", async ({ page }) => {
  110 |   await add(page, "Loop charging cable");
  111 |   await bag(page);
  112 |   await page.getByLabel("Discount code").fill("NORTH10");
  113 |   await expect(page.getByTestId("payable-total")).toHaveText("₹798.00");
  114 |   await expect(page.getByText("Add ₹3,000 of items to qualify.")).toBeVisible();
  115 |   await page.getByRole("link", { name: "Continue shopping" }).click();
  116 |   await add(page, "Form keyboard");
  117 |   await bag(page);
  118 |   await expect(page.getByTestId("payable-total")).toHaveText("₹4,327.20");
  119 |   await page.getByLabel("Discount code").fill("BAD");
  120 |   await expect(page.getByText("Code not recognised.")).toBeVisible();
  121 |   await expect(page.getByTestId("payable-total")).toHaveText("₹4,797.00");
  122 | });
  123 | test("checkout validation and simulated order", async ({ page }) => {
  124 |   await add(page, "Orbit headphones");
  125 |   await bag(page);
  126 |   await page.getByRole("button", { name: "Continue to demo checkout" }).click();
  127 |   await page.getByRole("button", { name: "Place simulated order" }).click();
  128 |   await expect(page.getByRole("alert")).toHaveCount(5);
  129 |   await expect(page.getByLabel("Full name")).toBeFocused();
  130 |   await page.getByLabel("Full name").fill("Demo Shopper");
  131 |   await page.getByLabel("Email address").fill("invalid");
  132 |   await page.getByLabel("Street address").fill("123 Example Road");
  133 |   await page.getByLabel("City", { exact: true }).fill("Pune");
  134 |   await page.getByLabel("PIN code", { exact: true }).fill("123");
  135 |   await page.getByRole("button", { name: "Place simulated order" }).click();
  136 |   await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  137 |   await expect(
  138 |     page.getByText("Enter a six-digit Indian PIN code."),
  139 |   ).toBeVisible();
  140 |   await page.getByLabel("Email address").fill("demo@example.test");
  141 |   await page.getByLabel("PIN code", { exact: true }).fill("411001");
  142 |   await page.getByRole("button", { name: "Place simulated order" }).click();
  143 |   await expect(
  144 |     page.getByRole("heading", { name: "Thanks for stopping by." }),
  145 |   ).toBeVisible();
  146 |   await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  147 |   await expect
  148 |     .poll(() => page.evaluate(() => localStorage.getItem("northstar-cart-v1")))
  149 |     .toBe("[]");
```