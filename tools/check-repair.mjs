import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const candidate = path.resolve(process.argv[2] || "");
const allowed = path.resolve("artifacts/repair-workspaces");
if (
  !candidate.startsWith(allowed + path.sep) ||
  !fs.existsSync(path.join(candidate, "src/main.jsx"))
)
  throw Error("Choose a prepared workspace under artifacts/repair-workspaces.");
if (fs.realpathSync(candidate) !== candidate)
  throw Error("Workspace must not be a link.");
const build = spawnSync(
  process.execPath,
  ["demo-shop/node_modules/vite/bin/vite.js", "build", candidate],
  { stdio: "inherit" },
);
if (build.status !== 0) process.exit(build.status || 1);
const result = spawnSync(
  process.execPath,
  [
    "node_modules/@playwright/test/cli.js",
    "test",
    "--output=artifacts/repair-results/" + path.basename(candidate),
  ],
  { stdio: "inherit", env: { ...process.env, NORTHSTAR_APP_ROOT: candidate } },
);
process.exit(result.status ?? 1);
