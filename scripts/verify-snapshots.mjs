import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "packages", "SNAPSHOTS.json");
const sourceCommit = "8d791d2efcf390da51fd64d3df989b71c3d7dce8";
const packages = [
  { name: "@nexus/plugin-sdk", version: "2.0.0", directory: "plugin-sdk" },
  { name: "@nexus/ui", version: "0.1.0", directory: "nexus-ui" },
];

async function listFiles(directory, relative = "") {
  const files = [];
  for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (["node_modules", "tests"].includes(entry.name)) continue;
    const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), childRelative));
    else if (entry.isFile()) files.push(childRelative);
  }
  return files;
}

async function buildManifest() {
  const records = [];
  for (const descriptor of packages) {
    const packageRoot = path.join(root, "packages", descriptor.directory);
    const files = await listFiles(packageRoot);
    const entries = [];
    const digest = createHash("sha256");
    for (const file of files) {
      const rawContents = await fs.readFile(path.join(packageRoot, file));
      const contents = /\.(?:cjs|css|d\.ts|js|json|jsx|md|mjs|scss|ts|tsx)$/i.test(file)
        ? Buffer.from(rawContents.toString("utf8").replace(/\r\n/g, "\n"), "utf8")
        : rawContents;
      const sha256 = createHash("sha256").update(contents).digest("hex");
      entries.push({ file, sha256 });
      digest.update(file).update("\0").update(contents).update("\0");
    }
    records.push({ ...descriptor, sourceCommit, digest: digest.digest("hex"), files: entries });
  }
  return { schemaVersion: 1, sourceRepository: "LlanosLautaro/nexus-platform", packages: records };
}

const actual = buildManifest();
if (process.argv.includes("--write")) {
  await fs.writeFile(manifestPath, `${JSON.stringify(await actual, null, 2)}\n`, "utf8");
  console.log("Snapshots registrados.");
} else {
  const expected = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const resolved = await actual;
  if (JSON.stringify(expected) !== JSON.stringify(resolved)) {
    throw new Error("Los snapshots publicos no coinciden con packages/SNAPSHOTS.json.");
  }
  console.log("Snapshots verificados.");
}
