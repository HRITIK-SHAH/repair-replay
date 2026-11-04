import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relative = `artifacts/repair-workspaces/${crypto.randomUUID()}`;
const workspace = path.join(root, relative);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "fixtures/manifest.json"), "utf8"),
);
fs.mkdirSync(workspace, { recursive: true });
for (const rel of [
  "index.html",
  "package.json",
  "package-lock.json",
  ...manifest.files,
]) {
  if (rel.includes("..") || path.isAbsolute(rel))
    throw Error("Unsafe manifest path");
  const dest = path.join(workspace, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(
    path.join(root, "demo-shop", rel),
    dest,
    fs.constants.COPYFILE_EXCL,
  );
}
// The read-only shell resolves React from the trusted install without copying dependencies.
fs.writeFileSync(
  path.join(workspace, "vite.config.mjs"),
  `import path from 'node:path';\nexport default {resolve:{alias:{'react-dom/client':path.resolve('demo-shop/node_modules/react-dom/client.js'),'react-dom':path.resolve('demo-shop/node_modules/react-dom'),'react':path.resolve('demo-shop/node_modules/react')}},server:{fs:{allow:[${JSON.stringify(workspace)},path.resolve('demo-shop/node_modules')]}}};\n`,
);
console.log(`Workspace: ${relative}`);
console.log(`Agent writable root: ${path.join(workspace, "src")}`);
console.log(
  `Preview: node demo-shop/node_modules/vite/bin/vite.js ${relative} --host 127.0.0.1 --port 5173 --strictPort`,
);
console.log(`Trusted verification: node tools/check-repair.mjs ${relative}`);
