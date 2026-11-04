import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
test("fixture differences are independent and confined to one registered file", () => {
  const m = JSON.parse(fs.readFileSync("fixtures/manifest.json", "utf8"));
  const expected = {
    "stale-total": "src/main.jsx",
    "repeated-product": "src/pricing.js",
    "wrong-removal": "src/Cart.jsx",
  };
  for (const [scenario, file] of Object.entries(expected)) {
    const different = m.files.filter(
      (rel) =>
        !fs
          .readFileSync(path.join("fixtures/baseline", rel))
          .equals(fs.readFileSync(path.join("fixtures", scenario, rel))),
    );
    assert.deepEqual(different, [file]);
  }
});
test("fixture replacement preserves unknown edits and refuses unsafe paths before writing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "northstar-fixture-"));
  fs.mkdirSync(path.join(root, "tools"));
  fs.copyFileSync("tools/fixture.mjs", path.join(root, "tools/fixture.mjs"));
  fs.cpSync("fixtures", path.join(root, "fixtures"), { recursive: true });
  fs.cpSync("fixtures/baseline", path.join(root, "demo-shop"), {
    recursive: true,
  });
  const edited = path.join(root, "demo-shop/src/pricing.js");
  fs.appendFileSync(edited, "\n// user work preserved\n");
  const before = fs.readFileSync(edited);
  const apply = spawnSync(
    process.execPath,
    [path.join(root, "tools/fixture.mjs"), "apply", "repeated-product"],
    { encoding: "utf8" },
  );
  assert.equal(apply.status, 0, apply.stderr);
  const backups = fs.readdirSync(path.join(root, "artifacts/source-backups"));
  assert.equal(backups.length, 1);
  assert.deepEqual(
    fs.readFileSync(
      path.join(root, "artifacts/source-backups", backups[0], "src/pricing.js"),
    ),
    before,
  );
  const m = JSON.parse(
    fs.readFileSync(path.join(root, "fixtures/manifest.json"), "utf8"),
  );
  m.files.push("../outside.js");
  fs.writeFileSync(
    path.join(root, "fixtures/manifest.json"),
    JSON.stringify(m),
  );
  const active = fs.readFileSync(edited);
  const unsafe = spawnSync(
    process.execPath,
    [path.join(root, "tools/fixture.mjs"), "reset"],
    { encoding: "utf8" },
  );
  assert.notEqual(unsafe.status, 0);
  assert.deepEqual(fs.readFileSync(edited), active);
  // Leave the isolated test directory available for inspection; never recursively delete an inferred path.
});
