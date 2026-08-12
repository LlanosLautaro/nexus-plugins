import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const expected = new Map([
  ["Books", ["nexus.books", "0.1.29"]],
  ["booru", ["nexus.booru", "0.3.130"]],
  ["chat", ["nexus.chat", "0.1.7"]],
  ["life-tracker", ["nexus.life-tracker", "0.2.44"]],
  ["musica", ["nexus.musica", "0.1.10"]],
  ["tab-repository", ["nexus.tab-repository", "0.1.12"]],
]);

for (const [directory, [id, version]] of expected) {
  test(`${id} publica manifest v2 y version fijada`, async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(root, directory, "manifest.json"), "utf8"));
    assert.equal(manifest.id, id);
    assert.equal(manifest.version, version);
    assert.equal(manifest.apiVersion, 2);
    assert.ok(manifest.permissions.includes("host.node"));
  });

  test(`${id} conserva entrypoints reproducibles`, async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(root, directory, "manifest.json"), "utf8"));
    for (const entrypoint of Object.values(manifest.entrypoints)) {
      const absolutePath = path.resolve(root, directory, entrypoint);
      assert.ok(absolutePath.startsWith(path.join(root, directory, "dist")));
      await fs.access(absolutePath);
    }
  });
}

test("el SDK publico fija apiVersion 2", async () => {
  const source = await import("@nexus/plugin-sdk");
  assert.equal(source.NEXUS_PLUGIN_API_VERSION, 2);
});

test("el snapshot UI expone solo raiz y SCSS", async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, "packages", "nexus-ui", "package.json"), "utf8"));
  assert.deepEqual(Object.keys(manifest.exports), [".", "./scss"]);
});

test("Life Tracker recibe iconos, canvas y markdown mediante ctx.ui", async () => {
  const source = await fs.readFile(path.join(root, "life-tracker", "src", "renderer.js"), "utf8");
  assert.match(source, /configureLifeTrackerHostUi\(ctx\.ui\)/);
  assert.match(source, /configureTrainingHostUi\(ctx\.ui\)/);
});

test("Books y Booru reciben logging estructurado mediante ctx.log", async () => {
  const [books, booru] = await Promise.all([
    fs.readFile(path.join(root, "Books", "src", "backend.ts"), "utf8"),
    fs.readFile(path.join(root, "booru", "src", "backend.ts"), "utf8"),
  ]);
  assert.match(books, /booksBackendLogger = ctx\.log/);
  assert.match(booru, /booruBackendLogger = ctx\.log/);
});

test("ningun plugin importa fuentes privadas de la plataforma", async () => {
  const violations = [];
  for (const directory of expected.keys()) {
    const visit = async (current) => {
      for (const entry of await fs.readdir(current, { withFileTypes: true })) {
        const absolutePath = path.join(current, entry.name);
        if (entry.isDirectory()) await visit(absolutePath);
        else if (/\.(?:js|jsx|mjs|ts|tsx)$/.test(entry.name)) {
          const source = await fs.readFile(absolutePath, "utf8");
          if (/nexus-(?:backend|frontend)/.test(source)) violations.push(path.relative(root, absolutePath));
        }
      }
    };
    await visit(path.join(root, directory, "src"));
  }
  assert.deepEqual(violations, []);
});
