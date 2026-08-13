import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const OFFICIAL_PLUGINS = ["Books", "booru", "chat", "life-tracker", "musica", "tab-repository"];

function listFiles(root, relative = "") {
  if (!fs.existsSync(root)) return [];
  const output = [];
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const child = relative ? path.join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) output.push(...listFiles(root, child));
    else if (entry.isFile()) output.push(child.replaceAll("\\", "/"));
  }
  return output;
}

function replacePath(source, target) {
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function targetsFor(plugin) {
  return ["manifest.json", "dist", ...(plugin === "life-tracker" ? ["assets/training/managed-docs"] : [])];
}

export function promoteStagedRelease({ workspaceRoot, stageRoot, plugins = OFFICIAL_PLUGINS, failAfterTarget = null }) {
  const rollbackRoot = path.join(stageRoot, ".rollback");
  const snapshots = [];
  try {
    for (const plugin of plugins) {
      for (const relative of targetsFor(plugin)) {
        const target = path.join(workspaceRoot, plugin, relative);
        const backup = path.join(rollbackRoot, plugin, relative);
        const existed = fs.existsSync(target);
        if (existed) replacePath(target, backup);
        snapshots.push({ target, backup, existed });
      }
    }
    let promoted = 0;
    for (const plugin of plugins) {
      for (const relative of targetsFor(plugin)) {
        replacePath(path.join(stageRoot, plugin, relative), path.join(workspaceRoot, plugin, relative));
        promoted += 1;
        if (failAfterTarget === promoted) throw new Error("Fallo simulado durante la promocion de plugins.");
      }
    }
  } catch (error) {
    for (const snapshot of [...snapshots].reverse()) {
      fs.rmSync(snapshot.target, { recursive: true, force: true });
      if (snapshot.existed) replacePath(snapshot.backup, snapshot.target);
    }
    throw error;
  } finally {
    fs.rmSync(rollbackRoot, { recursive: true, force: true });
  }
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 128 * 1024 * 1024 }).trim();
}

export function createLocalReleaseManifest(workspaceRoot, plugins = OFFICIAL_PLUGINS) {
  const records = plugins.map((directory) => {
    const root = path.join(workspaceRoot, directory);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
    const files = listFiles(root).filter((file) => file === "manifest.json" || /^(?:dist|assets\/training\/managed-docs)\//.test(file));
    const distributed = files.map((file) => ({ file, sha256: createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex") }));
    const digest = createHash("sha256");
    for (const file of distributed) digest.update(file.file).update("\0").update(file.sha256).update("\0");
    return { directory, id: manifest.id, version: manifest.version, digest: digest.digest("hex"), files: distributed };
  });
  const status = git(workspaceRoot, ["status", "--porcelain=v2", "--untracked-files=all"]);
  const diff = execFileSync("git", ["diff", "--binary", "HEAD", "--"], { cwd: workspaceRoot, windowsHide: true });
  return {
    schemaVersion: 1,
    source: {
      commit: git(workspaceRoot, ["rev-parse", "HEAD"]),
      tree: git(workspaceRoot, ["rev-parse", "HEAD^{tree}"]),
      clean: status.length === 0,
      diffSha256: status.length === 0 ? null : createHash("sha256").update(diff).digest("hex"),
    },
    publication: { enabled: false, formats: [] },
    plugins: records,
  };
}
