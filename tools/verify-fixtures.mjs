import { spawnSync } from "node:child_process";
import fs from "node:fs";
const manifest = JSON.parse(fs.readFileSync("fixtures/manifest.json", "utf8"));
function run(args) {
  return spawnSync(process.execPath, args, {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
}
function apply(name) {
  const r = run([
    "tools/fixture.mjs",
    name === "baseline" ? "reset" : "apply",
    ...(name === "baseline" ? [] : [name]),
  ]);
  if (r.status !== 0) throw Error(r.stderr);
}
const results = [];
let failed = false;
try {
  for (const name of Object.keys(manifest.scenarios)) {
    apply(name);
    const build = run([
      "demo-shop/node_modules/vite/bin/vite.js",
      "build",
      "demo-shop",
    ]);
    const report = `artifacts/matrix/${name}`;
    fs.mkdirSync(report, { recursive: true });
    const browser = run([
      "node_modules/@playwright/test/cli.js",
      "test",
      "--reporter=json",
      `--output=${report}/browser`,
    ]);
    fs.writeFileSync(`${report}/report.json`, browser.stdout);
    fs.writeFileSync(`${report}/build.log`, build.stdout + build.stderr);
    let data;
    try {
      data = JSON.parse(browser.stdout);
    } catch {
      throw Error(browser.stderr + "\n" + browser.stdout);
    }
    const specs = [];
    function collect(s) {
      for (const spec of s.specs || [])
        specs.push({ title: spec.title, ok: spec.ok });
      for (const child of s.suites || []) collect(child);
    }
    for (const suite of data.suites || []) collect(suite);
    const failures = specs.filter((s) => !s.ok).map((s) => s.title);
    const designated = manifest.scenarios[name].test;
    const expected =
      name === "baseline"
        ? browser.status === 0
        : browser.status !== 0 && failures.includes(designated);
    const expectedFailures = manifest.scenarios[name].expectedFailures;
    const unexpectedFailures = failures.filter(
      (title) => !expectedFailures.includes(title),
    );
    const matchesMatrix =
      JSON.stringify([...failures].sort()) ===
      JSON.stringify([...expectedFailures].sort());
    const result = {
      name,
      buildPassed: build.status === 0,
      passed: specs.filter((s) => s.ok).length,
      failed: failures,
      designatedFailureObserved: expected,
      unexpectedFailures,
      matchesMatrix,
    };
    results.push(result);
    console.log(JSON.stringify(result));
    if (
      build.status !== 0 ||
      !expected ||
      !matchesMatrix ||
      specs.length !== 11 ||
      data.errors?.length
    )
      failed = true;
  }
} finally {
  apply("baseline");
  fs.mkdirSync("artifacts/matrix", { recursive: true });
  fs.writeFileSync(
    "artifacts/matrix/summary.json",
    JSON.stringify(results, null, 2),
  );
}
if (failed) process.exitCode = 1;
