# RepairReplay integration

No `server.cjs`, `dashboard/`, `repair.cjs`, `investigate.cjs`, or `pipeline.cjs` was present in the supplied directory. No existing imports, hooks, or control-service behavior were changed.

## Source and trusted inputs

The customer app is `demo-shop/`, with active application source in `demo-shop/src/`. Its entry point is `src/main.jsx`. Pricing, product data, persistence, product illustration, cart UI, and checkout UI are separate modules. Package/configuration files are outside the editable source manifest. The running URL is `http://127.0.0.1:5173/`; open `/#cart` for cart inspection. `data-testid="payable-total"` identifies the final payable total; stable product-specific accessible button names identify add, quantity, and removal controls.

Only `demo-shop/src/` should be made writable to a repair agent. Keep `tests/`, `fixtures/`, `tools/`, the Playwright configuration, node_modules, and all control-service code outside its writable mount. Do not expose `.env` to the repair process. A prompt or AGENTS.md is not a security boundary: enforce the write allowlist using the RepairReplay agent's actual filesystem sandbox/container policy.

## Isolated repair runs

1. A trusted controller selects a fixture with `node tools/fixture.mjs apply <name>`.
2. Run `node tools/prepare-repair.mjs` to copy the active store into a fresh isolated workspace. It prints the workspace and the **only writable directory**, its `src/` child. It does not copy tests, fixture definitions, credentials, or repair hints.
3. Mount that `src/` directory as the agent's only writable root; keep the parent app shell read-only. Run the app with the trusted Vite executable, as printed by the preparation tool. The model should receive only the reproduction steps, expected behavior, browser evidence, and active application source.
4. From the trusted repository run `node tools/check-repair.mjs <workspace-relative-path>` to build the candidate and run the unchanged approved browser suite against it. Keep port 5173 free. Results remain outside the writable workspace.
5. Accept a repair only after all approved tests pass and the controller confirms that only registered source files changed. Keep the original fixture definitions unchanged.

An isolated candidate does not modify the active demo store. The controller can review and explicitly copy approved registered source edits into `demo-shop/src/` afterward. Selecting another fixture preserves the previous active source in `artifacts/source-backups/`.

The supplied preparation/check scripts provide isolation layout and trusted execution. They cannot impose OS filesystem permissions on an unrelated repair service that is not present here; configure that service's sandbox as above before giving an agent access.
