import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const details = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "effective-details.js")));

test("Details mezcla tags y universes directos o heredados sin duplicarlos ni etiquetar su origen", () => {
  const directUniverse = { id: "universe-direct", displayName: "Directo" };
  const inheritedUniverse = { id: "universe-inherited", displayName: "Heredado" };
  const directTag = { id: "tag-direct", name: "Directa" };
  const inheritedTag = { id: "tag-inherited", name: "Heredada" };
  const resource = {
    authors: [{ id: "author-1", displayName: "Persona" }],
    artists: [],
    characters: [],
    directUniverses: [directUniverse],
    universes: [directUniverse, inheritedUniverse],
    manualTags: [directTag],
    tags: [directTag, inheritedTag],
  };
  const draft = {
    authors: resource.authors,
    artists: [],
    characters: [],
    universes: [directUniverse],
    manualTags: [directTag, { id: "tag-new", name: "Nueva" }],
  };
  const chips = details.buildBooruEffectiveDetailChips([resource], draft);

  assert.deepEqual(chips.map((chip) => `${chip.kind}:${chip.label}`), [
    "author:Persona",
    "universe:Heredado",
    "universe:Directo",
    "tag:Heredada",
    "tag:Directa",
    "tag:Nueva",
  ]);
  assert.equal(chips.some((chip) => Object.hasOwn(chip, "inherited")), false);
  assert.equal(chips.find((chip) => chip.id === "tag-new")?.persisted, false);
});
