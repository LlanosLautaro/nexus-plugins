import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const release = process.argv.includes("--release");

for (const plugin of ["Books", "booru", "chat", "life-tracker", "musica", "tab-repository"]) {
  const args = ["./scripts/build-plugin.mjs", plugin, ...(release ? ["--release"] : [])];
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
