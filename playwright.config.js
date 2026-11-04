import { defineConfig } from "@playwright/test";
import path from "node:path";
const appRoot = process.env.NORTHSTAR_APP_ROOT
  ? path.resolve(process.env.NORTHSTAR_APP_ROOT)
  : path.resolve("demo-shop");
if (
  appRoot !== path.resolve("demo-shop") &&
  !appRoot.startsWith(path.resolve("artifacts/repair-workspaces") + path.sep)
)
  throw Error("Unregistered application root");
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.js",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node demo-shop/node_modules/vite/bin/vite.js "${appRoot}" --host 127.0.0.1 --port 5173 --strictPort`,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
