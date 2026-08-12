import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const nexusUiRoot = path.resolve(backendRoot, "packages", "nexus-ui");
const navigation = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "workspace-navigation.js")));

test("la ruta tipada conserva perfil y subpestaña solo en su seccion compatible", () => {
  const route = navigation.normalizeBooruWorkspaceRoute({
    section: "universes",
    entityProfile: { kind: "universe", id: "overwatch", tab: "characters" },
  });

  assert.deepEqual(route.profile, { kind: "universe", id: "overwatch", tab: "characters" });
  assert.equal(navigation.createBooruWorkspaceRouteKey(route), "universes:overwatch:characters");
  assert.equal(navigation.normalizeBooruWorkspaceRoute({
    section: "characters",
    entityProfile: { kind: "universe", id: "overwatch", tab: "characters" },
  }).profile, null);
});

test("la pila vuelve de Mercy al origen exacto Overwatch Characters", async () => {
  const origin = navigation.normalizeBooruWorkspaceRoute({
    section: "universes",
    entityProfile: { kind: "universe", id: "overwatch", tab: "characters" },
  });
  const mercy = navigation.normalizeBooruWorkspaceRoute({
    section: "characters",
    entityProfile: { kind: "character", id: "mercy", tab: "gallery" },
  });
  const pushed = navigation.pushBooruWorkspaceRoute({ activeRoute: origin, backStack: [] }, mercy);
  const popped = await navigation.popBooruWorkspaceRoute(pushed, async () => true);

  assert.equal(navigation.createBooruWorkspaceRouteKey(popped.activeRoute), "universes:overwatch:characters");
  assert.deepEqual(popped.backStack, []);
});

test("una entidad borrada del historial cae en el ancestro raiz de su seccion", async () => {
  const deletedOrigin = navigation.normalizeBooruWorkspaceRoute({
    section: "universes",
    entityProfile: { kind: "universe", id: "deleted", tab: "characters" },
  });
  const current = navigation.normalizeBooruWorkspaceRoute({
    section: "characters",
    entityProfile: { kind: "character", id: "mercy", tab: "gallery" },
  });
  const result = await navigation.popBooruWorkspaceRoute({
    activeRoute: current,
    backStack: [deletedOrigin],
  }, async (candidate) => !candidate.profile);

  assert.equal(navigation.createBooruWorkspaceRouteKey(result.activeRoute), "universes:root");
});

test("la reseleccion limpia solo el historial de la seccion activa", () => {
  const media = navigation.createBooruSectionRootRoute("media");
  const overwatch = navigation.normalizeBooruWorkspaceRoute({
    section: "universes",
    entityProfile: { kind: "universe", id: "overwatch", tab: "characters" },
  });
  const mercy = navigation.normalizeBooruWorkspaceRoute({
    section: "characters",
    entityProfile: { kind: "character", id: "mercy", tab: "gallery" },
  });
  const reset = navigation.resetBooruWorkspaceSection({
    activeRoute: mercy,
    backStack: [media, overwatch],
  }, "characters");

  assert.equal(navigation.createBooruWorkspaceRouteKey(reset.activeRoute), "characters:root");
  assert.deepEqual(reset.backStack.map(navigation.createBooruWorkspaceRouteKey), [
    "media:root",
    "universes:overwatch:characters",
  ]);
});

test("las tres familias de columnas tienen defaults independientes y rango 2 a 12", () => {
  assert.deepEqual(navigation.normalizeBooruGridPreferences(), {
    resources: 6,
    entities: 5,
    profileResources: 6,
  });
  assert.equal(navigation.stepBooruGridColumns({ resources: 2 }, "resources", -120).resources, 2);
  assert.equal(navigation.stepBooruGridColumns({ entities: 12 }, "entities", 120).entities, 12);
  assert.equal(navigation.stepBooruGridColumns({ profileResources: 6 }, "profileResources", -120).profileResources, 5);
  assert.equal(navigation.stepBooruGridColumns({ profileResources: 6 }, "profileResources", 120).profileResources, 7);
});

test("los rails laterales normalizan y limitan sus anchos persistidos", () => {
  assert.deepEqual(navigation.normalizeBooruRailWidths(), { left: 280, right: 380 });
  assert.deepEqual(navigation.normalizeBooruRailWidths({ left: 120, right: 900 }), { left: 220, right: 520 });
  assert.deepEqual(navigation.normalizeBooruRailWidths({ left: 333.4, right: 411.8 }), { left: 333, right: 412 });
});

test("Abrir en Media reemplaza la sesion anterior con el filtro exacto solicitado", () => {
  const mediaRoute = navigation.createBooruSectionRootRoute("media");
  const session = navigation.createBooruResourceRouteSession(mediaRoute, [{
    type: "entity",
    kind: "universe",
    id: "overwatch",
    label: "Overwatch",
  }]);

  assert.deepEqual(session.query.map((token) => token.id), ["overwatch"]);
  assert.deepEqual(session.filters, {
    mediaKind: "all",
    reality: "all",
    missing: "none",
    pendingMode: "essential",
  });
  assert.deepEqual(session.results.items, []);
  assert.equal(session.page.page, 1);
  assert.deepEqual(session.selection.ids, []);
  assert.equal(session.scrollTop, 0);
});

test("las subpestañas del mismo perfil reutilizan su DTO y rechazan perfiles ajenos", () => {
  const route = navigation.normalizeBooruWorkspaceRoute({
    section: "universes",
    entityProfile: { kind: "universe", id: "overwatch", tab: "characters" },
  });
  const overwatch = { kind: "universe", id: "overwatch", displayName: "Overwatch" };
  const cachedOverwatch = { ...overwatch, displayName: "Overwatch cached" };
  const valorant = { kind: "universe", id: "valorant", displayName: "Valorant" };

  assert.equal(navigation.resolveBooruProfileForRoute(route, null, overwatch), overwatch);
  assert.equal(navigation.resolveBooruProfileForRoute(route, valorant, overwatch), overwatch);
  assert.equal(navigation.resolveBooruProfileForRoute(route, cachedOverwatch, overwatch), overwatch);
  assert.equal(navigation.resolveBooruProfileForRoute(route, valorant, null), null);
});

test("el renderer persiste preferencias UI separadas y conecta scroll, rueda y seleccion por ruta", () => {
  const workspaceSource = fs.readFileSync(path.join(pluginRoot, "src", "BooruWorkspaceView.jsx"), "utf8");
  const resourceGridSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "media", "ResourceGrid.jsx"), "utf8");
  const entityGridSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "entities", "EntityGrid.jsx"), "utf8");
  const profileGallerySource = fs.readFileSync(path.join(pluginRoot, "src", "components", "entities", "EntityProfileGallery.jsx"), "utf8");
  const columnWheelSource = fs.readFileSync(path.join(nexusUiRoot, "src", "components", "Gallery", "Gallery.jsx"), "utf8");

  assert.match(workspaceSource, /createPluginSettingsApi\("nexus\.booru\.ui"/);
  assert.match(workspaceSource, /railWidths: BOORU_DEFAULT_RAIL_WIDTHS/);
  assert.match(workspaceSource, /ResizableRailHandle/);
  assert.match(workspaceSource, /routeSessionsRef/);
  assert.match(workspaceSource, /sectionLastRouteRef/);
  assert.match(workspaceSource, /profileGallerySelectedIds/);
  assert.match(workspaceSource, /restoreWorkspaceRouteSession\(restoredRoute, null\)/);
  assert.match(workspaceSource, /createBooruResourceRouteSession\(nextRoute, mediaSearchTokens\)/);
  assert.match(workspaceSource, /activeEntityProfile\?\.tab, entityRevision, showEntityProfile/);
  assert.match(resourceGridSource, /onScrollStateChange/);
  assert.match(resourceGridSource, /<GalleryGrid/);
  assert.match(resourceGridSource, /onColumnsChange=\{onColumnsChange\}/);
  assert.match(entityGridSource, /<GalleryGrid/);
  assert.match(entityGridSource, /onColumnsChange=\{onColumnsChange\}/);
  assert.doesNotMatch(resourceGridSource, /onWheel=/);
  assert.doesNotMatch(entityGridSource, /onWheel=/);
  assert.doesNotMatch(profileGallerySource, /onWheel=/);
  assert.match(columnWheelSource, /addEventListener\("wheel", handleWheel, \{ passive: false \}\)/);
  assert.match(columnWheelSource, /removeEventListener\("wheel", handleWheel\)/);
});
