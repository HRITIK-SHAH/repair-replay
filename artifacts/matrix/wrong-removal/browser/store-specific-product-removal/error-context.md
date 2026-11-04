# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: store.spec.js >> specific product removal
- Location: tests\store.spec.js:74:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('article', { name: 'Pebble speaker', exact: true })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('article', { name: 'Pebble speaker', exact: true }) with timeout 5000ms
  - waiting for getByRole('article', { name: 'Pebble speaker', exact: true })
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - generic [ref=f1e3]: Small upgrades. Better everyday. Free shipping on orders ₹5,000+
  - banner [ref=f1e4]:
    - link "Northstar home" [ref=f1e5] [cursor=pointer]:
      - /url: "#home"
      - text: ✳ northstar®
    - navigation "Main navigation" [ref=f1e6]:
      - link "Shop all" [ref=f1e7] [cursor=pointer]:
        - /url: "#shop"
      - link "Our approach" [ref=f1e8] [cursor=pointer]:
        - /url: "#about"
    - generic [ref=f1e9]:
      - generic [aria-hidden] [ref=f1e10]: ⌕
      - textbox "Search products" [ref=f1e11]:
        - /placeholder: Find your next essential
    - link "Bag (1)" [ref=f1e12] [cursor=pointer]:
      - /url: "#cart"
      - text: Bag
      - generic [ref=f1e13]: "1"
  - main [ref=f1e14]:
    - generic [ref=f1e15]:
      - generic [ref=f1e16]:
        - generic [ref=f1e17]:
          - paragraph [ref=f1e18]: YOUR EVERYDAY ESSENTIALS
          - heading "Your bag" [level=1] [ref=f1e19]
        - link "Continue shopping ↗" [ref=f1e20] [cursor=pointer]:
          - /url: "#shop"
      - generic [ref=f1e21]:
        - article "Pebble speaker" [ref=f1e23]:
          - img "Pebble speaker illustration" [ref=f1e25]
          - generic [ref=f1e30]:
            - paragraph [ref=f1e31]: Audio
            - heading "Pebble speaker" [level=2] [ref=f1e32]
            - paragraph [ref=f1e33]: ₹2,499.00 each
            - generic [ref=f1e34]:
              - button "Decrease Pebble speaker" [disabled] [ref=f1e35]: −
              - generic "Pebble speaker quantity" [ref=f1e36]: "1"
              - button "Increase Pebble speaker" [ref=f1e37] [cursor=pointer]: +
              - button "Remove Pebble speaker" [active] [ref=f1e38] [cursor=pointer]: Remove
          - strong [ref=f1e39]: ₹2,499.00
        - complementary [ref=f1e40]:
          - heading "Order summary" [level=2] [ref=f1e41]
          - generic [ref=f1e42]: Discount code
          - textbox "Discount code" [ref=f1e43]
          - paragraph [ref=f1e44]: "NORTH10: 10% off items on orders of ₹3,000 or more. Shipping is excluded. Rounded down to the nearest paise."
          - generic [ref=f1e45]:
            - generic [ref=f1e46]:
              - term [ref=f1e47]: Subtotal
              - definition [ref=f1e48]: ₹2,499.00
            - generic [ref=f1e49]:
              - term [ref=f1e50]: Discount
              - definition [ref=f1e51]: −₹0.00
            - generic [ref=f1e52]:
              - term [ref=f1e53]: Shipping
              - definition [ref=f1e54]: ₹99.00
            - generic [ref=f1e55]:
              - term [ref=f1e56]: Total
              - definition [ref=f1e57]: ₹2,598.00
          - paragraph [ref=f1e58]: Shipping ₹99; free on item subtotals of ₹5,000 or more. Prices include applicable demo taxes.
          - button "Continue to demo checkout" [ref=f1e59] [cursor=pointer]
          - generic [ref=f1e60]: No payment required. This is a demo store.
  - contentinfo [ref=f1e61]:
    - link "✳ northstar" [ref=f1e62] [cursor=pointer]:
      - /url: "#home"
    - paragraph [ref=f1e63]: Everyday, considered.
    - link "About this demo ↗" [ref=f1e64] [cursor=pointer]:
      - /url: "#about"
    - generic [ref=f1e65]: © 2026 Northstar. A fictional store.
  - status [ref=f1e66]: Pebble speaker added to your bag.
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
  49  |   await expect(page.getByTestId("payable-total")).toHaveText("₹1,497.00");
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
> 81  |   ).toHaveCount(0);
      |     ^ Error: expect(locator).toHaveCount(expected) failed
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
  150 | });
  151 | test("keyboard dialog entry, tab containment, dismissal and restoration", async ({
  152 |   page,
  153 | }) => {
  154 |   const view = page
  155 |     .getByRole("button", { name: "View Orbit headphones", exact: true })
  156 |     .last();
  157 |   await view.focus();
  158 |   await page.keyboard.press("Enter");
  159 |   await expect(page.getByRole("dialog")).toBeVisible();
  160 |   await expect(
  161 |     page.getByRole("button", { name: "Close product details" }),
  162 |   ).toBeFocused();
  163 |   await page.keyboard.press("Shift+Tab");
  164 |   await expect(
  165 |     page
  166 |       .getByRole("button", { name: "Add Orbit headphones to bag", exact: true })
  167 |       .last(),
  168 |   ).toBeFocused();
  169 |   await page.keyboard.press("Escape");
  170 |   await expect(view).toBeFocused();
  171 |   await page.keyboard.press("Tab");
  172 |   await page.keyboard.press("Enter");
  173 |   await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  174 |   await page.getByRole("link", { name: "Bag (1)" }).focus();
  175 |   await page.keyboard.press("Enter");
  176 |   await expect(page.getByRole("heading", { name: "Your bag" })).toBeVisible();
  177 |   await page.getByRole("button", { name: "Increase Orbit headphones" }).focus();
  178 |   await page.keyboard.press("Enter");
  179 |   await expect(page.getByLabel("Orbit headphones quantity")).toHaveText("2");
  180 |   await page.getByRole("button", { name: "Continue to demo checkout" }).focus();
  181 |   await page.keyboard.press("Enter");
```