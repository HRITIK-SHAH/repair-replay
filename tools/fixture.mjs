import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(root, "fixtures");
const manifest = JSON.parse(
  fs.readFileSync(path.join(fixtureRoot, "manifest.json"), "utf8"),
);
const command = process.argv[2] || "list";
const hash = (content) =>
  crypto.createHash("sha256").update(content).digest("hex");
function safe(base, rel) {
  if (typeof rel !== "string" || path.isAbsolute(rel) || rel.includes(".."))
    throw Error("Unsafe manifest path");
  const resolved = path.resolve(base, rel);
  if (!resolved.startsWith(base + path.sep))
    throw Error("Path escapes its root");
  let at = resolved;
  while (at !== path.dirname(at)) {
    if (fs.existsSync(at) && fs.lstatSync(at).isSymbolicLink())
      throw Error("Refusing symbolic link: " + at);
    at = path.dirname(at);
  }
  return resolved;
}
if (command === "list") {
  for (const [name, s] of Object.entries(manifest.scenarios))
    console.log(`${name}: ${s.description}`);
  process.exit(0);
}
if (!["apply", "reset"].includes(command))
  throw Error("Use list, apply <name>, or reset");
const name = command === "reset" ? "baseline" : process.argv[3];
if (!Object.hasOwn(manifest.scenarios, name))
  throw Error("Unknown fixture. Use list.");
// Validate and read every input before any mutation.
const files = manifest.files.map((rel) => {
  if (
    !rel.startsWith("src/") ||
    ![".js", ".jsx", ".css"].includes(path.extname(rel))
  )
    throw Error("Unregistered source path");
  const target = safe(path.join(root, "demo-shop"), rel);
  const source = safe(fixtureRoot, `${name}/${rel}`);
  const data = fs.readFileSync(source);
  return {
    rel,
    target,
    data,
    current: fs.existsSync(target) ? fs.readFileSync(target) : null,
  };
});
const known = new Map(
  manifest.files.map((rel) => [
    rel,
    new Set(
      Object.keys(manifest.scenarios).map((s) =>
        hash(fs.readFileSync(safe(fixtureRoot, `${s}/${rel}`))),
      ),
    ),
  ]),
);
const unexpected = files.filter(
  (f) => f.current && !known.get(f.rel).has(hash(f.current)),
);
const changed = files.filter((f) => !f.current || !f.current.equals(f.data));
if (!changed.length) {
  console.log(`${name} already active.`);
  process.exit(0);
}
// Preserve all current registered files before replacing even recognised fixtures.
const backup = path.join(
  root,
  "artifacts",
  "source-backups",
  `${new Date().toISOString().replaceAll(":", "-")}-${crypto.randomUUID().slice(0, 8)}`,
);
for (const f of files)
  if (f.current) {
    const destination = safe(backup, f.rel);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, f.current, { flag: "wx" });
  }
console.log(
  `Preserved current source at ${path.relative(root, backup)}${unexpected.length ? " (including unrecognised edits)" : ""}`,
);
for (const f of changed) {
  fs.mkdirSync(path.dirname(f.target), { recursive: true });
  fs.writeFileSync(f.target, f.data);
}
console.log(
  `Active fixture: ${name}. Only ${manifest.files.length} registered demo-shop source files are managed.`,
);
