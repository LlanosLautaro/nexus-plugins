import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const policy = JSON.parse(fs.readFileSync(path.join(root, "scripts", "dependency-overrides.json"), "utf8"));
const actual = Object.keys(packageJson.overrides || {}).sort();
const documented = policy.overrides.map((entry) => entry.selector).sort();
if (new Set(documented).size !== documented.length || JSON.stringify(actual) !== JSON.stringify(documented)) {
  throw new Error("Los overrides no coinciden con su politica rastreada.");
}
for (const entry of policy.overrides) if (!entry.reason?.trim() || !entry.removeWhen?.trim()) throw new Error(`Override incompleto: ${entry.selector}`);
console.log(`[overrides] ${actual.length} overrides documentados.`);
