import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const nexusUiRoot = path.resolve(backendRoot, "packages", "nexus-ui");
const browse = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "contextual-browse.js")));

test("el texto libre se normaliza en terminos OR sin convertirlo en filtros exactos", () => {
  assert.deepEqual(browse.normalizeBooruFreeTextTerms('MágO "Mercy Overwatch" mago'), [
    "mago",
    "mercy overwatch",
  ]);
});

test("Aleatorio conserva una semilla estable y fuerza el modo continuo", () => {
  const items = Array.from({ length: 12 }, (_, index) => ({ id: `resource-${index}`, importedAt: `${index}` }));
  const query = browse.normalizeBooruBrowseQuery({
    sortBy: "random",
    grouping: "sectioned",
    randomSeed: "seed-a",
  }, "resource");
  const first = browse.sortBooruBrowseItems(items, query, "resource").map((item) => item.id);
  const second = browse.sortBooruBrowseItems(items, query, "resource").map((item) => item.id);
  const remixed = browse.sortBooruBrowseItems(items, { ...query, randomSeed: "seed-b" }, "resource").map((item) => item.id);

  assert.equal(query.grouping, "continuous");
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, remixed);
});

test("la agrupacion multivalor separa identidad unica y colocaciones incrementales", () => {
  const items = [
    {
      id: "resource-multi",
      importedAt: "2026-07-20T10:00:00.000Z",
      artists: [{ id: "artist-a", displayName: "Ana" }, { id: "artist-b", displayName: "Beto" }],
    },
    {
      id: "resource-ana-old",
      importedAt: "2026-07-10T10:00:00.000Z",
      artists: [{ id: "artist-a", displayName: "Ana" }],
    },
    {
      id: "resource-zoe",
      importedAt: "2026-07-05T10:00:00.000Z",
      artists: [{ id: "artist-z", displayName: "Zoe" }],
    },
    { id: "resource-empty", importedAt: "2026-07-21T10:00:00.000Z", artists: [] },
  ];
  const query = {
    sortBy: "importedAt",
    groupBy: "artist",
    groupOrderBy: "alphabetical",
    direction: "asc",
    grouping: "sectioned",
  };
  const firstPage = browse.createBooruIncrementalBrowseResult(items, query, { family: "resource", offset: 0, limit: 2 });
  const secondPage = browse.createBooruIncrementalBrowseResult(items, query, { family: "resource", offset: 2, limit: 2 });

  assert.equal(firstPage.totalCount, 3);
  assert.equal(firstPage.placementCount, 4);
  assert.equal(firstPage.hasMore, true);
  assert.equal(secondPage.hasMore, false);
  assert.deepEqual(
    [...firstPage.placements, ...secondPage.placements].map((placement) => placement.groupLabel),
    ["Ana", "Ana", "Beto", "Zoe"],
  );
  assert.deepEqual(
    [...firstPage.placements, ...secondPage.placements]
      .filter((placement) => placement.groupLabel === "Ana")
      .map((placement) => placement.resourceId),
    ["resource-multi", "resource-ana-old"],
  );
  assert.equal(
    [...firstPage.placements, ...secondPage.placements].filter((placement) => placement.resourceId === "resource-multi").length,
    2,
  );
  assert.equal([...firstPage.placements, ...secondPage.placements].some((placement) => placement.resourceId === "resource-empty"), false);
});

test("el orden de grupos se separa del orden interno fijo por integracion descendente", () => {
  const items = [
    { id: "ana-new", importedAt: "2026-07-10T10:00:00.000Z", authors: [{ displayName: "Ana" }] },
    { id: "ana-old", importedAt: "2026-07-01T10:00:00.000Z", authors: [{ displayName: "Ana" }] },
    { id: "beto-new", importedAt: "2026-07-20T10:00:00.000Z", authors: [{ displayName: "Beto" }] },
  ];
  const placements = browse.createBooruGroupedPlacements(items, {
    grouping: "sectioned",
    groupBy: "author",
    groupOrderBy: "importedAt",
    direction: "desc",
  }, "resource");

  assert.deepEqual(placements.map((placement) => placement.groupLabel), ["Beto", "Ana", "Ana"]);
  assert.deepEqual(
    placements.filter((placement) => placement.groupLabel === "Ana").map((placement) => placement.resourceId),
    ["ana-new", "ana-old"],
  );
});

test("los buckets de fecha y cantidad se invierten junto con la direccion", () => {
  const now = new Date("2026-07-21T15:00:00.000Z");
  const resources = [
    { id: "today", importedAt: "2026-07-21T10:00:00.000Z" },
    { id: "yesterday", importedAt: "2026-07-20T10:00:00.000Z" },
    { id: "older", importedAt: "2025-01-01T10:00:00.000Z" },
  ];
  const descending = browse.createBooruGroupedPlacements(resources, {
    sortBy: "importedAt", direction: "desc", grouping: "sectioned",
  }, "resource", false, now);
  const ascending = browse.createBooruGroupedPlacements(resources, {
    sortBy: "importedAt", direction: "asc", grouping: "sectioned",
  }, "resource", false, now);

  assert.deepEqual(descending.map((placement) => placement.groupLabel), ["Hoy", "Ayer", "Anteriores"]);
  assert.deepEqual(ascending.map((placement) => placement.groupLabel), ["Anteriores", "Ayer", "Hoy"]);
});

test("Universe solo aparece como criterio de listas de Characters con contexto multiverse", () => {
  assert.equal(browse.getBooruEntitySortOptions().some((option) => option.value === "universe"), false);
  assert.equal(browse.getBooruEntitySortOptions({ allowUniverseSort: true }).some((option) => option.value === "universe"), true);
});

test("las entidades parten por cantidad descendente y las fechas eligen recientes primero", () => {
  assert.deepEqual(browse.normalizeBooruBrowseQuery(null, "entity"), {
    sortBy: "resourceCount",
    direction: "desc",
    grouping: "continuous",
    randomSeed: "booru-stable",
    groupBy: "name",
    groupOrderBy: "alphabetical",
  });
  assert.equal(browse.getDefaultBooruBrowseDirection("createdAt"), "desc");
  assert.equal(browse.getDefaultBooruBrowseDirection("importedAt"), "desc");
  assert.equal(browse.getDefaultBooruBrowseDirection("resourceCount"), "desc");
  assert.equal(browse.getDefaultBooruBrowseDirection("name"), "asc");
});

test("el renderer conserva Enter como texto libre y usa un listener de rueda no pasivo", () => {
  const searchSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "search", "ResourceSearchComposer.jsx"), "utf8");
  const wheelSource = fs.readFileSync(path.join(nexusUiRoot, "src", "components", "Gallery", "Gallery.jsx"), "utf8");
  const controlsSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "shared", "ContextBrowseControls.jsx"), "utf8");
  const collapsibleGroupSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "shared", "CollapsibleGalleryGroup.jsx"), "utf8");
  const resourceGridSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "media", "ResourceGrid.jsx"), "utf8");
  const workspaceSource = fs.readFileSync(path.join(pluginRoot, "src", "BooruWorkspaceView.jsx"), "utf8");
  const backendSource = fs.readFileSync(path.join(pluginRoot, "src", "backend.ts"), "utf8");

  assert.match(searchSource, /highlightedIndex >= 0 && suggestions\[highlightedIndex\]/);
  assert.doesNotMatch(searchSource, /: suggestions\[0\]/);
  assert.match(searchSource, /Enter conserva el texto libre/);
  assert.match(wheelSource, /passive: false/);
  assert.match(wheelSource, /ref=\{setNodeRef\}/);
  assert.match(resourceGridSource, /<GalleryGrid/);
  assert.match(controlsSource, /Creciente/);
  assert.match(controlsSource, /Decreciente/);
  assert.match(controlsSource, /Seccionado/);
  assert.match(controlsSource, /Agrupar por/);
  assert.match(controlsSource, /Ordenar grupos/);
  assert.match(controlsSource, /direction: getDefaultBooruBrowseDirection\(sortBy\)/);
  assert.match(collapsibleGroupSource, /aria-expanded=\{!collapsed\}/);
  assert.match(workspaceSource, /freeText=\{resourceSearchText\}/);
  assert.match(workspaceSource, /exactFilters: normalizedEntitySearchTokens/);
  assert.match(workspaceSource, /placements=\{resourceState\.placements\}/);
  assert.match(backendSource, /booru_resource_inherited_tags/);
  assert.match(backendSource, /booru_character_universes/);
  assert.match(backendSource, /query\.groupBy === "author"/);
  assert.doesNotMatch(backendSource, /r\.original_filename LIKE/);
});
