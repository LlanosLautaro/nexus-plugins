import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const relationPolicy = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "entity-relations.js")));

test("las pestañas relacionales dependen del tipo de perfil y Persona no agrega relaciones", () => {
  assert.deepEqual(
    relationPolicy.getBooruEntityProfileTabOptions("author").map((option) => option.value),
    ["gallery", "data", "tags"],
  );
  assert.deepEqual(
    relationPolicy.getBooruEntityProfileTabOptions("universe").map((option) => option.value),
    ["gallery", "characters", "artists", "data", "tags"],
  );
  assert.deepEqual(
    relationPolicy.getBooruEntityProfileTabOptions("character").map((option) => option.value),
    ["gallery", "artists", "data", "tags"],
  );
  assert.deepEqual(
    relationPolicy.getBooruEntityProfileTabOptions("artist").map((option) => option.value),
    ["gallery", "characters", "universes", "data", "tags"],
  );
});

test("el contrato incremental rechaza cruces no permitidos y conserva continuidad", () => {
  assert.equal(relationPolicy.normalizeBooruEntityRelationRequest({
    sourceKind: "author",
    sourceId: "author-1",
    relationKind: "artist",
  }), null);

  const request = relationPolicy.normalizeBooruEntityRelationRequest({
    sourceKind: "artist",
    sourceId: "artist-1",
    relationKind: "character",
    query: "vip",
    offset: 1,
    limit: 1,
  });
  const result = relationPolicy.createBooruIncrementalEntityResult([
    { id: "character-1" },
    { id: "character-2" },
    { id: "character-3" },
  ], request);

  assert.deepEqual(result.items.map((item) => item.id), ["character-2"]);
  assert.equal(result.totalCount, 3);
  assert.equal(result.hasMore, true);
  assert.equal(result.query, "vip");
});

test("el renderer usa navbar de entidades, relaciones y una galeria de perfil independiente de Media", () => {
  const workspaceSource = fs.readFileSync(path.join(pluginRoot, "src", "BooruWorkspaceView.jsx"), "utf8");
  const profileSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "entities", "EntityProfileView.jsx"), "utf8");

  assert.match(workspaceSource, /<EntityNavigationBar/);
  assert.match(workspaceSource, /\{showResourceWorkspace \? \(\s*<SplitSidebar/);
  assert.match(workspaceSource, /section: "profile"/);
  assert.match(workspaceSource, /invoke\("booru:list-entity-relations"/);
  assert.match(profileSource, /relationKind \? \(/);
  assert.match(profileSource, /<RelationsGrid/);
});
