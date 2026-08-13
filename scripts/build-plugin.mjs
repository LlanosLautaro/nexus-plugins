import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { build } from "esbuild";
import * as sass from "sass";

const require = createRequire(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nexusUiRoot = path.join(workspaceRoot, "packages", "nexus-ui");
const pluginShimsRoot = path.join(workspaceRoot, "scripts", "shims");
const pluginName = process.argv.find((argument, index) => index >= 2 && !argument.startsWith("--"));
const releaseBuild = process.argv.includes("--release");
const stageArgument = process.argv.find((argument) => argument.startsWith("--stage-root="));
const stageRoot = stageArgument ? path.resolve(stageArgument.slice("--stage-root=".length)) : null;

function createHostReactAliasPlugin() {
  const shimByPackage = new Map([
    ["react", path.join(pluginShimsRoot, "react.cjs")],
    ["react-dom", path.join(pluginShimsRoot, "react-dom.cjs")],
    ["react-dom/client", path.join(pluginShimsRoot, "react-dom-client.cjs")],
    ["react/jsx-runtime", path.join(pluginShimsRoot, "react-jsx-runtime.cjs")],
    ["react/jsx-dev-runtime", path.join(pluginShimsRoot, "react-jsx-dev-runtime.cjs")],
  ]);

  return {
    name: "nexus-host-react-alias",
    setup(buildContext) {
      for (const [packageName, shimPath] of shimByPackage) {
        const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        buildContext.onResolve({ filter: new RegExp(`^${escapedPackageName}$`) }, () => ({
          path: shimPath,
        }));
      }
    },
  };
}

function createNexusUiAliasPlugin() {
  const entryByImport = new Map([
    ["@nexus/ui", path.join(nexusUiRoot, "src", "index.js")],
    ["@nexus/ui/shell", path.join(nexusUiRoot, "src", "shell", "index.js")],
    ["@nexus/ui/theme", path.join(nexusUiRoot, "src", "theme", "workspaceTheme.mjs")],
  ]);

  return {
    name: "nexus-ui-alias",
    setup(buildContext) {
      for (const [specifier, targetPath] of entryByImport) {
        const escapedSpecifier = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        buildContext.onResolve({ filter: new RegExp(`^${escapedSpecifier}$`) }, () => ({
          path: targetPath,
        }));
      }
    },
  };
}

const nexusUiSassImporter = {
  findFileUrl(url) {
    if (url === "@nexus/ui/scss") {
      return pathToFileURL(path.join(nexusUiRoot, "src", "scss", "_index.scss"));
    }

    return null;
  },
};

if (!pluginName) {
  console.error("[plugins:build] Uso: node ./scripts/build-plugin.mjs <plugin-folder> [--release]");
  process.exit(1);
}

const pluginRoot = path.join(workspaceRoot, pluginName);
const manifestPath = path.join(pluginRoot, "manifest.json");
const backendEntry = path.join(pluginRoot, "src", "backend.ts");
const rendererEntry = path.join(pluginRoot, "src", "renderer.js");
const rendererStylesEntry = path.join(pluginRoot, "src", "styles.scss");
const stagedPluginRoot = stageRoot ? path.join(stageRoot, pluginName) : pluginRoot;
const distRoot = path.join(stagedPluginRoot, "dist");

function bumpPatchVersion(versionValue) {
  const version = String(versionValue || "").trim();
  const semverMatch = version.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);

  if (!semverMatch) {
    throw new Error(
      `[plugins:build] La version "${version || "<vacia>"}" no sigue el formato <major>.<minor>.<patch>.`,
    );
  }

  const [, major, minor, patch, suffix = ""] = semverMatch;
  return `${major}.${minor}.${Number(patch) + 1}${suffix}`;
}

async function bumpManifestVersion() {
  const manifestSource = await fs.promises.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestSource);

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("[plugins:build] El manifest del plugin debe ser un objeto JSON.");
  }

  if (typeof manifest.version !== "string" || !manifest.version.trim()) {
    throw new Error("[plugins:build] El manifest del plugin requiere una version valida.");
  }

  const previousVersion = manifest.version.trim();
  const nextVersion = bumpPatchVersion(previousVersion);
  manifest.version = nextVersion;

  await fs.promises.writeFile(
    stageRoot ? path.join(stagedPluginRoot, "manifest.json") : manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  return {
    previousVersion,
    nextVersion,
  };
}

async function copyPdfJsWorkerIfNeeded() {
  if (!fs.existsSync(rendererEntry)) {
    return;
  }

  const rendererSource = await fs.promises.readFile(rendererEntry, "utf8");
  const librarySourceFiles = await fs.promises.readdir(path.join(pluginRoot, "src"));
  const importsPdfJs = rendererSource.includes("pdfjs-dist")
    || (
      await Promise.all(
        librarySourceFiles.map(async (fileName) => {
          const absolutePath = path.join(pluginRoot, "src", fileName);
          const stat = await fs.promises.stat(absolutePath);
          if (!stat.isFile()) {
            return false;
          }

          const source = await fs.promises.readFile(absolutePath, "utf8");
          return source.includes("pdfjs-dist");
        }),
      )
    ).some(Boolean);

  if (!importsPdfJs) {
    return;
  }

  const pdfWorkerPath = path.join(
    workspaceRoot,
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );

  if (!fs.existsSync(pdfWorkerPath)) {
    throw new Error(`[plugins:build] No se encontro pdf.worker.mjs en ${pdfWorkerPath}`);
  }

  await fs.promises.copyFile(pdfWorkerPath, path.join(distRoot, "pdf.worker.mjs"));

  const pdfWasmRoot = path.join(workspaceRoot, "node_modules", "pdfjs-dist", "wasm");

  if (!fs.existsSync(pdfWasmRoot)) {
    throw new Error(`[plugins:build] No se encontro la carpeta wasm de pdfjs-dist en ${pdfWasmRoot}`);
  }

  await fs.promises.cp(pdfWasmRoot, path.join(distRoot, "wasm"), { recursive: true });
}

async function generateLifeTrackerManagedDocAssetsIfNeeded() {
  if (pluginName !== "life-tracker") {
    return;
  }

  const backendBundlePath = path.join(distRoot, "backend.cjs");
  const backendBundle = require(backendBundlePath);
  const assets = backendBundle.buildTrainingManagedDocAssets?.();

  if (!Array.isArray(assets) || assets.length === 0) {
    throw new Error("No se pudieron generar los markdown gestionados de Life Tracker.");
  }

  const assetRoot = path.join(stagedPluginRoot, "assets", "training", "managed-docs");
  const resolvedAssetRoot = path.resolve(assetRoot);
  await fs.promises.rm(assetRoot, { recursive: true, force: true });
  await fs.promises.mkdir(assetRoot, { recursive: true });

  for (const asset of assets) {
    const relativePath = String(asset?.relativePath || "").replace(/\\/g, "/");
    const targetPath = path.resolve(assetRoot, relativePath);

    if (!relativePath || !targetPath.startsWith(`${resolvedAssetRoot}${path.sep}`)) {
      throw new Error(`Ruta de markdown gestionado invalida: ${relativePath || "<vacia>"}`);
    }

    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.promises.writeFile(targetPath, String(asset?.content || ""), "utf8");
  }

  console.log(`[plugins:build] Markdown gestionado de Life Tracker generado: ${assets.length} archivo(s).`);
}

if (!fs.existsSync(pluginRoot)) {
  console.error(`[plugins:build] No existe el plugin workspace: ${pluginRoot}`);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  console.error("[plugins:build] Falta manifest.json en el plugin.");
  process.exit(1);
}

await fs.promises.rm(distRoot, { recursive: true, force: true });
await fs.promises.mkdir(distRoot, { recursive: true });
if (stageRoot) await fs.promises.mkdir(stagedPluginRoot, { recursive: true });

if (fs.existsSync(backendEntry)) {
  await build({
    absWorkingDir: workspaceRoot,
    nodePaths: [path.join(workspaceRoot, "node_modules")],
    entryPoints: [backendEntry],
    outfile: path.join(distRoot, "backend.cjs"),
    bundle: true,
    external: ["electron"],
    format: "cjs",
    platform: "node",
    target: "node24",
    sourcemap: true,
    logLevel: "info",
  });

  await generateLifeTrackerManagedDocAssetsIfNeeded();
}

if (fs.existsSync(rendererEntry)) {
  await build({
    absWorkingDir: workspaceRoot,
    nodePaths: [path.join(workspaceRoot, "node_modules")],
    entryPoints: [rendererEntry],
    outfile: path.join(distRoot, "renderer.js"),
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "chrome120",
    define: {
      process: JSON.stringify({
        env: {
          NODE_ENV: "production",
        },
      }),
    },
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    loader: {
      ".js": "jsx",
    },
    banner: {
      js: "const React = window.React;",
    },
    plugins: [
      createHostReactAliasPlugin(),
      createNexusUiAliasPlugin(),
    ],
    sourcemap: true,
    logLevel: "info",
  });

  await copyPdfJsWorkerIfNeeded();
}

if (fs.existsSync(rendererStylesEntry)) {
  const compiledStyles = sass.compile(rendererStylesEntry, {
    style: "expanded",
    importers: [nexusUiSassImporter],
  });

  await fs.promises.writeFile(
    path.join(distRoot, "styles.css"),
    compiledStyles.css,
    "utf8",
  );
}

const versionUpdate = releaseBuild ? await bumpManifestVersion() : null;
console.log(versionUpdate
  ? `[plugins:build] Plugin compilado: ${pluginRoot} | version ${versionUpdate.previousVersion} -> ${versionUpdate.nextVersion}`
  : `[plugins:build] Plugin compilado reproduciblemente: ${pluginRoot}`);
