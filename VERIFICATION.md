# Verification evidence

Verified locally on Windows with Node 24, Chromium, and Playwright on 31 October 2026.

| Source | Production build | Browser result | Expected failures |
| --- | --- | --- | --- |
| Correct baseline | Pass | 11 pass | None |
| Stale total | Pass | 10 pass, 1 fail | Total after removal |
| Repeated product | Pass | 9 pass, 2 fail | Repeated addition; quantity updates |
| Wrong removal | Pass | 9 pass, 2 fail | Selected item removal; resulting total |

All failures in the buggy rows are observations of their single source defect. There are no skipped tests or relaxed assertions. The matrix runner rejects any failures outside the scenario's declared expected set, missing designated failures, build failures, or browser-run errors. Full machine-readable results: [matrix summary](artifacts/matrix/summary.json). Per-scenario directories contain full JSON reports, build logs, failed screenshots, and trace ZIPs.

Five Node tests cover pricing, discount/shipping arithmetic, fixture independence, backup preservation, and path rejection. All pass. The isolated baseline repair workspace also builds and passes the same 11 unchanged browser tests.

The browser suite verifies name search, category filtering, sorting, empty results, addition, repeated addition, quantity bounds, selected and final removal, discount eligibility, required-field/email/PIN validation, simulated confirmation, localStorage recovery and persistence, empty checkout, dialog focus and keyboard dismissal/restoration, keyboard shopping through checkout, and unknown routes. Every test starts with cleared browser storage and records uncaught page exceptions as failures.

Desktop (1440px) and mobile (375px) full-page screenshots were captured and visually inspected. Overflow assertions cover storefront, populated cart, and checkout at 375px and 768px. [Desktop screenshot](artifacts/northstar-desktop.png) · [Mobile screenshot](artifacts/northstar-mobile.png).

Limitations: Chromium was exercised; Firefox/WebKit and screen-reader behavior were not independently audited. There was no RepairReplay control service or original repository fixture in the supplied empty workspace, so actual control-service/agent-sandbox integration could not be exercised. The isolated layout and trusted test runner are supplied in its place; see [integration instructions](INTEGRATION.md).
