import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginDirectories = ["Books", "booru", "chat", "life-tracker", "musica", "tab-repository"];

async function visit(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (["dist", "node_modules", ".git"].includes(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(absolutePath);
    else if (/\.(?:js|jsx|mjs|ts|tsx)$/.test(entry.name)) {
      const source = await fs.readFile(absolutePath, "utf8");
      if (/nexus-(?:backend|frontend)/.test(source)) {
        throw new Error(`Import privado detectado: ${path.relative(root, absolutePath)}`);
      }
      if (/window\.nexus\.ipc|ctx\.registerIpc/.test(source)) {
        throw new Error(`Contrato plugin legacy detectado: ${path.relative(root, absolutePath)}`);
      }
    }
  }
}

for (const directory of pluginDirectories) await visit(path.join(root, directory, "src"));
console.log("Frontera publica de plugins verificada.");
