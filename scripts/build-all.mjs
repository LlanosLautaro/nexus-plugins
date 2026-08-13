import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLocalReleaseManifest, OFFICIAL_PLUGINS, promoteStagedRelease } from "./release-transaction.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const release = process.argv.includes("--release");
const stageRoot = release ? path.join(root, ".artifacts", `plugin-release-${Date.now()}-${process.pid}`) : null;

try {
  for (const plugin of OFFICIAL_PLUGINS) {
    const args = ["./scripts/build-plugin.mjs", plugin, ...(release ? ["--release", `--stage-root=${stageRoot}`] : [])];
    const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit", windowsHide: true });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`El build de ${plugin} fallo con codigo ${result.status ?? "null"}.`);
  }
  if (release) {
    promoteStagedRelease({ workspaceRoot: root, stageRoot });
    const manifest = createLocalReleaseManifest(root);
    const artifactRoot = path.join(root, ".artifacts", "releases");
    fs.mkdirSync(artifactRoot, { recursive: true });
    fs.writeFileSync(path.join(artifactRoot, "official-plugins.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    console.log("[plugins:release] Seis plugins promovidos transaccionalmente; manifiesto local generado.");
  }
} catch (error) {
  console.error("[plugins:build]", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (stageRoot) fs.rmSync(stageRoot, { recursive: true, force: true, maxRetries: 6, retryDelay: 100 });
}
