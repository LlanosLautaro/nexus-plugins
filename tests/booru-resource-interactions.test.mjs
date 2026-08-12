import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const actions = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "resource-actions.js")));
const paste = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "contextual-paste.js")));
const floating = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "floating-details.js")));
const browse = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "contextual-browse.js")));

test("el modelo compartido ofrece Details y conserva acciones propias del perfil", () => {
  const items = actions.buildBooruResourceActions({
    surface: "profile",
    selectionCount: 2,
    imageCompatible: true,
    visualCompatible: true,
  });
  assert.equal(items[0].id, "details");
  assert.ok(items.some((item) => item.id === "copy"));
  assert.ok(items.some((item) => item.id === "set-avatar"));
  assert.ok(items.some((item) => item.id === "disassociate-profile"));
  assert.ok(items.some((item) => item.id === "trash" && item.danger));
});

test("el contexto de pegado acumula ruta, grupo y relacion sin duplicar IDs", () => {
  assert.deepEqual(paste.mergeBooruClipboardAssociations(
    { kind: "character", entityId: "jinx" },
    { kind: "artist", entityId: "juancito" },
    { kind: "character", entityId: "jinx" },
  ).map(({ kind, entityId }) => `${kind}:${entityId}`), ["character:jinx", "artist:juancito"]);
});

test("los grupos asignables transportan identidad real y los temporales no", () => {
  const artistPlacements = browse.createBooruGroupedPlacements([{
    id: "resource-1",
    importedAt: "2026-07-21T10:00:00.000Z",
    artists: [{ id: "artist-1", displayName: "Juancito33" }],
  }], { grouping: "sectioned", groupBy: "artist" }, "resource");
  const datePlacements = browse.createBooruGroupedPlacements([{
    id: "resource-1",
    importedAt: "2026-07-21T10:00:00.000Z",
  }], { grouping: "sectioned", groupBy: "importedAt" }, "resource", false, new Date("2026-07-21T12:00:00.000Z"));

  assert.deepEqual(artistPlacements[0].association, { kind: "artist", entityId: "artist-1" });
  assert.equal(datePlacements[0].association, null);
});

test("la geometria flotante se limita al viewport tras moverla o redimensionarla", () => {
  assert.deepEqual(floating.clampBooruFloatingDetailsGeometry({
    x: 900,
    y: -40,
    width: 700,
    height: 900,
  }, { width: 800, height: 600 }), {
    x: 100,
    y: 0,
    width: 700,
    height: 600,
  });
});

