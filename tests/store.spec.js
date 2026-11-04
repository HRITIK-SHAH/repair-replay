import { test, expect } from "@playwright/test";
const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
test.afterEach(async ({ page }) => expect(pageErrors.get(page)).toEqual([]));
const add = async (page, name) =>
  page.getByRole("button", { name: `Add ${name} to bag`, exact: true }).click();
const bag = async (page) => page.getByRole("link", { name: /^Bag \(/ }).click();
test("search, category, sorting and empty results", async ({ page }) => {
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect(page.locator(".product")).toHaveCount(2);
  await page.getByRole("button", { name: "All products", exact: true }).click();
  await page.getByLabel("Sort products").selectOption("low");
  await expect(page.locator(".product h3").first()).toHaveText(
    "Loop charging cable",
  );
  await page.getByLabel("Sort products").selectOption("name");
  await expect(page.locator(".product h3").first()).toHaveText("Arc desk lamp");
  await page.getByLabel("Sort products").selectOption("high");
  await expect(page.locator(".product h3").first()).toHaveText(
    "Orbit headphones",
  );
  await page.getByLabel("Search products").fill("folio");
  await expect(page.locator(".product")).toHaveCount(1);
  await page.getByLabel("Search products").fill("no-such-product");
  await expect(page.getByText("No essentials found")).toBeVisible();
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(page.locator(".product")).toHaveCount(8);
});
test("add one product and persist after reload", async ({ page }) => {
  await add(page, "Orbit headphones");
  await bag(page);
  await expect(page.getByTestId("payable-total")).toHaveText("₹5,098.00");
  await page.reload();
  await expect(page.getByLabel("Orbit headphones quantity")).toHaveText("1");
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
});
test("repeated-product calculation", async ({ page }) => {
  await add(page, "Loop charging cable");
  await add(page, "Loop charging cable");
  await bag(page);
  await expect(page.getByLabel("Loop charging cable quantity")).toHaveText("2");
  await expect(page.getByTestId("payable-total")).toHaveText("₹1,497.00");
});
test("quantity updates and limits", async ({ page }) => {
  await add(page, "Loop charging cable");
  await bag(page);
  await expect(
    page.getByRole("button", { name: "Decrease Loop charging cable" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Increase Loop charging cable" })
    .click();
  await expect(page.getByTestId("payable-total")).toHaveText("₹1,497.00");
  await page
    .getByRole("button", { name: "Decrease Loop charging cable" })
    .click();
  await expect(page.getByTestId("payable-total")).toHaveText("₹798.00");
  for (let i = 0; i < 8; i++)
    await page
      .getByRole("button", { name: "Increase Loop charging cable" })
      .click();
  await expect(
    page.getByRole("button", { name: "Increase Loop charging cable" }),
  ).toBeDisabled();
  await expect(page.getByText("Maximum 9 per product.")).toBeVisible();
});
test("specific product removal", async ({ page }) => {
  await add(page, "Orbit headphones");
  await add(page, "Pebble speaker");
  await bag(page);
  await page.getByRole("button", { name: "Remove Pebble speaker" }).click();
  await expect(
    page.getByRole("article", { name: "Pebble speaker", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("article", { name: "Orbit headphones", exact: true }),
  ).toBeVisible();
});
test("stale total after removal", async ({ page }) => {
  await add(page, "Orbit headphones");
  await add(page, "Pebble speaker");
  await bag(page);
  await expect(page.getByTestId("payable-total")).toHaveText("₹7,498.00");
  await page.getByRole("button", { name: "Remove Pebble speaker" }).click();
  await expect(page.getByTestId("payable-total")).toHaveText("₹5,098.00");
});
test("remove final item and empty checkout guard", async ({ page }) => {
  await add(page, "Orbit headphones");
  await bag(page);
  await page.getByRole("button", { name: "Remove Orbit headphones" }).click();
  await expect(
    page.getByText(
      "Your bag is empty. Explore thoughtfully designed accessories.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  await page.goto("/#checkout");
  await expect(
    page.getByRole("button", { name: "Place simulated order" }),
  ).toHaveCount(0);
});
test("discount eligibility and arithmetic", async ({ page }) => {
  await add(page, "Loop charging cable");
  await bag(page);
  await page.getByLabel("Discount code").fill("NORTH10");
  await expect(page.getByTestId("payable-total")).toHaveText("₹798.00");
  await expect(page.getByText("Add ₹3,000 of items to qualify.")).toBeVisible();
  await page.getByRole("link", { name: "Continue shopping" }).click();
  await add(page, "Form keyboard");
  await bag(page);
  await expect(page.getByTestId("payable-total")).toHaveText("₹4,327.20");
  await page.getByLabel("Discount code").fill("BAD");
  await expect(page.getByText("Code not recognised.")).toBeVisible();
  await expect(page.getByTestId("payable-total")).toHaveText("₹4,797.00");
});
test("checkout validation and simulated order", async ({ page }) => {
  await add(page, "Orbit headphones");
  await bag(page);
  await page.getByRole("button", { name: "Continue to demo checkout" }).click();
  await page.getByRole("button", { name: "Place simulated order" }).click();
  await expect(page.getByRole("alert")).toHaveCount(5);
  await expect(page.getByLabel("Full name")).toBeFocused();
  await page.getByLabel("Full name").fill("Demo Shopper");
  await page.getByLabel("Email address").fill("invalid");
  await page.getByLabel("Street address").fill("123 Example Road");
  await page.getByLabel("City", { exact: true }).fill("Pune");
  await page.getByLabel("PIN code", { exact: true }).fill("123");
  await page.getByRole("button", { name: "Place simulated order" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(
    page.getByText("Enter a six-digit Indian PIN code."),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("demo@example.test");
  await page.getByLabel("PIN code", { exact: true }).fill("411001");
  await page.getByRole("button", { name: "Place simulated order" }).click();
  await expect(
    page.getByRole("heading", { name: "Thanks for stopping by." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("northstar-cart-v1")))
    .toBe("[]");
});
test("keyboard dialog entry, tab containment, dismissal and restoration", async ({
  page,
}) => {
  const view = page
    .getByRole("button", { name: "View Orbit headphones", exact: true })
    .last();
  await view.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close product details" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page
      .getByRole("button", { name: "Add Orbit headphones to bag", exact: true })
      .last(),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(view).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  await page.getByRole("link", { name: "Bag (1)" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Your bag" })).toBeVisible();
  await page.getByRole("button", { name: "Increase Orbit headphones" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Orbit headphones quantity")).toHaveText("2");
  await page.getByRole("button", { name: "Continue to demo checkout" }).focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Full name").focus();
  for (const value of [
    "Keyboard Shopper",
    "keyboard@example.test",
    "12 Demo Street",
    "Pune",
    "411001",
  ]) {
    await page.keyboard.type(value);
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Thanks for stopping by." }),
  ).toBeVisible();
});
test("invalid storage, unknown route and responsive layouts", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem("northstar-cart-v1", "invalid JSON"),
  );
  await page.reload();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "northstar-cart-v1",
      JSON.stringify([
        { id: "orbit", quantity: 2 },
        { id: "orbit", quantity: 3 },
        { id: "unknown", quantity: 1 },
        { id: "loop", quantity: -1 },
      ]),
    ),
  );
  await page.reload();
  await expect(page.getByRole("link", { name: "Bag (2)" })).toBeVisible();
  await page.goto("/#missing");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.goto("/");
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({
    path: "artifacts/northstar-desktop.png",
    fullPage: true,
  });
  for (const width of [375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.goto("/#cart");
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.goto("/#checkout");
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.goto("/");
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: "artifacts/northstar-mobile.png",
    fullPage: true,
  });
});
