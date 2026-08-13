import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const separator = process.argv.indexOf("--");
const [command, ...args] = process.argv.slice(separator + 1);
if (separator < 0 || !command) throw new Error("Uso: node stable-check.mjs -- <comando> [...args]");

function git(args, encoding = null) {
  return execFileSync("git", args, { cwd: root, encoding, windowsHide: true, maxBuffer: 128 * 1024 * 1024 });
}
function state() {
  const hash = createHash("sha256");
  hash.update(git(["status", "--porcelain=v2", "-z", "--untracked-files=all"]));
  hash.update(git(["diff", "--binary", "HEAD", "--"]));
  const files = git(["ls-files", "--others", "--exclude-standard", "-z"]).toString("utf8").split("\0").filter(Boolean).sort();
  for (const file of files) hash.update(file).update("\0").update(fs.readFileSync(path.join(root, file))).update("\0");
  return hash.digest("hex");
}
const before = state();
const npmCommand = process.platform === "win32" && command === "npm";
const resolvedCommand = npmCommand ? process.execPath : command;
const resolvedArgs = npmCommand
  ? [process.env.npm_execpath || path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args]
  : args;
const result = spawnSync(resolvedCommand, resolvedArgs, { cwd: root, env: process.env, stdio: "inherit", windowsHide: true });
const after = state();
if (before !== after) throw new Error("El gate de plugins modifico el estado Git.");
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
