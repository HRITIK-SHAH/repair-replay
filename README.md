<<<<<<< HEAD
# Northstar / RepairReplay demo

A local React + Vite consumer-tech storefront with eight fictional products and deterministic repair scenarios. All illustrations, product data, and fonts are local. No backend, payments, external requests, or customer-data uploads are used.

## Repository inspection

`C:\Users\KIIT\Downloads\META1` was empty when inspected (including hidden files); it was not a Git checkout. No RepairReplay server, dashboard, repair scripts, original bug fixture, or `.env` existed here. Consequently there was no original fixture to back up and no existing integration to modify. These files are an additive store/test harness, not a replacement for the missing control application. Credentials were neither read nor created.

## Windows PowerShell

From this directory, on Node 22 or newer:

```powershell
npm.cmd ci
npm.cmd --prefix demo-shop ci
npx.cmd playwright install chromium
npm.cmd run dev
```

Open **http://127.0.0.1:5173/**. Vite binds loopback only and uses `--strictPort`: it fails when 5173 is occupied. Stop a manually started server with Ctrl+C before testing. Browser tests start and stop their own Vite instance and explicitly refuse to reuse any existing service on that port.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run verify:fixtures
```

The fixture matrix runs the complete browser suite and a production build for each source fixture, saves JSON reports, screenshots and failure traces under `artifacts/matrix/`, and restores baseline source even if verification fails. Run `npm.cmd run build` after matrix verification before serving production output. `test-results/` and `playwright-report/` contain the latest standalone browser run.

## Shopping behavior

Search matches product names, without case sensitivity, and combines with category selection. Sort by featured order, either price direction, or name. Product dialogs support keyboard entry, Tab containment, Escape, and restoration to their opening button. The cart counts units and supports 1–9 units per product; decrement stops at 1, and Remove deletes the item. Adding a tenth unit is refused with an announcement.

Prices are integer paise. `NORTH10`, case-insensitive with surrounding whitespace ignored, discounts item subtotals of at least **₹3,000** by 10%, rounded down to a whole paise. Shipping is **₹99**, free at a pre-discount item subtotal of **₹5,000**, and zero for an empty cart. Discount does not affect shipping eligibility. Displayed prices include demo taxes; there is no additional tax calculation.

Only cart product IDs and quantities are saved in localStorage (`northstar-cart-v1`). Malformed JSON, invalid products, invalid quantities, and duplicate product rows are discarded; the first valid row for a product wins. Storage denial does not crash the store. Discounts and fictional checkout details are not persisted. Checkout requires a name, syntactically valid email, street address, city, and six-digit Indian PIN. It accepts fictional details and explicitly simulates an order; nothing is sent or shipped. Successful checkout clears the cart.

Routes use URL hashes: `#home`, `#shop`, `#about`, `#cart`, `#checkout`, and transient `#confirmation`. Unknown routes show a not-found page. Reloading confirmation does not recreate a completed order.

## Fixture selection

```powershell
npm.cmd run fixture -- list
npm.cmd run fixture -- apply stale-total
npm.cmd run fixture -- apply repeated-product
npm.cmd run fixture -- apply wrong-removal
npm.cmd run fixture -- reset
```

Each fixture is a complete copy of the same baseline source manifest. There are no runtime bug flags or storefront scenario controls. Fixture descriptions and mutation code live outside the application source. Switching a fixture replaces **only** the registered `demo-shop/src/` files; all other project files are left alone. The tool validates paths and source availability before writing and preserves the current registered source under `artifacts/source-backups/` before any replacement, including unknown user edits. If backup creation fails, application files are not changed. Keep these backups until you no longer need your edits.

| Fixture | Reproduction | Correct behavior | Approved browser test |
| --- | --- | --- | --- |
| `baseline` | Normal shopping | All assertions pass | Full suite |
| `stale-total` | Add Orbit and Pebble; remove Pebble | Payable total becomes ₹5,098.00 | `stale total after removal` |
| `repeated-product` | Add Loop twice | Quantity 2, payable ₹1,497.00 | `repeated-product calculation` |
| `wrong-removal` | Add Orbit then Pebble; remove Pebble | Orbit remains, Pebble disappears | `specific product removal` |

The quantity-update test also catches the repeated-product defect. The total-after-removal test also catches wrong removal because the remaining product has a different price. These are additional observations of the same defect, not independent source defects. Each buggy snapshot differs from baseline in exactly one application file and one behavioral change.

Open an expected failure trace with, for example:

```powershell
Get-ChildItem artifacts/matrix/stale-total -Recurse -Filter trace.zip
npx.cmd playwright show-trace '<trace path returned above>'
```

Desktop and mobile screenshots are at `artifacts/northstar-desktop.png` and `artifacts/northstar-mobile.png`. Browser layout checks cover 375px and 768px widths, including populated cart and checkout. These automated checks and manual screenshot inspection are not a full assistive-technology audit.

See [INTEGRATION.md](INTEGRATION.md) for repair-workspace isolation and trusted test execution. There is no live RepairReplay service in this supplied workspace, so integration with its agent sandbox remains the responsibility of that service's owner.
=======
# repair-replay
Meta-powered bug repair tool that reproduces website failures, proposes source-code fixes, and verifies repairs with Playwright tests.
>>>>>>> 130f05a6ae3322b6c7e25a5759f29f2d06eecbe6
