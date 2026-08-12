import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  filterTabs,
  getVirtualRange,
  reorderBefore,
  resolveTabIconUrl,
  shouldSendTabOnDoubleClick,
} from "../tab-repository/src/ui-helpers.mjs";

const require = createRequire(import.meta.url);
const backendBundlePath = path.resolve(
  import.meta.dirname,
  "../tab-repository/dist/backend.cjs",
);
const pluginBundle = require(backendBundlePath);
const plugin = pluginBundle.default;
const api = pluginBundle.tabRepositoryTestApi;
const {
  extractJsonUrls,
  getGeneralDomain,
  normalizeFaviconUrl,
  normalizeHttpUrl,
  normalizeSettings,
} = pluginBundle;

const resources = [];

async function createDatabase() {
  const root = await mkdtemp(path.join(os.tmpdir(), "nexus-tab-repository-test-"));
  const db = new DatabaseSync(path.join(root, "catalog.db"));
  api.ensureSchema(db);
  resources.push({ root, db });
  return db;
}

function createTasks() {
  return { start() {}, update() {}, complete() {}, fail() {} };
}

afterEach(async () => {
  api.setRuntimeDb(null);
  api.clearImportPreviews();
  while (resources.length) {
    const resource = resources.pop();
    try { resource.db.close(); } catch { /* already closed */ }
    await rm(resource.root, { recursive: true, force: true });
  }
});

test("el manifest declara solo permisos de tabs y entrypoints externos", async () => {
  const manifest = JSON.parse(await readFile(path.resolve(
    import.meta.dirname,
    "../tab-repository/manifest.json",
  ), "utf8"));
  assert.equal(manifest.id, "nexus.tab-repository");
  assert.deepEqual(manifest.permissions, ["browser.tabs.read", "browser.tabs.manage", "host.node"]);
  assert.equal(manifest.permissions.some((permission) => permission.includes("bookmarks")), false);
  assert.equal(manifest.entrypoints.backend, "./dist/backend.cjs");
  assert.equal(manifest.entrypoints.renderer, "./dist/renderer.js");
});

test("normaliza settings sin permitir ocultar título y URL", () => {
  assert.deepEqual(normalizeSettings({ batchSize: 999, showTitle: false, showUrl: false }), {
    batchSize: 100,
    showTitle: false,
    showUrl: true,
    sidebarWidth: 236,
  });
  assert.deepEqual(normalizeSettings({ batchSize: 0, sidebarWidth: 999 }), {
    batchSize: 1,
    showTitle: true,
    showUrl: true,
    sidebarWidth: 440,
  });
});

test("migra bases existentes para persistir el favicon sin perder tabs", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "nexus-tab-repository-legacy-"));
  const db = new DatabaseSync(path.join(root, "catalog.db"));
  resources.push({ root, db });
  db.exec(`
    CREATE TABLE tab_repository_tabs (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      domain TEXT NOT NULL,
      group_id TEXT,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      imported_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      trashed_at TEXT,
      trash_group_id TEXT,
      trash_position INTEGER,
      pending_request_id TEXT,
      pending_started_at TEXT
    );
    INSERT INTO tab_repository_tabs (
      id, url, title, domain, position, created_at, imported_at, updated_at
    ) VALUES ('legacy', 'https://legacy.example/page', 'Legacy', 'legacy.example', 0, 'now', 'now', 'now');
  `);
  api.ensureSchema(db);
  const columns = db.prepare("PRAGMA table_info(tab_repository_tabs)").all();
  assert.equal(columns.some((column) => column.name === "favicon_url"), true);
  assert.equal(api.buildSnapshot(db).tabs[0].title, "Legacy");
});

test("normaliza favicons y resuelve un fallback del mismo origen", () => {
  assert.equal(normalizeFaviconUrl("https://example.com/icon.png"), "https://example.com/icon.png");
  assert.equal(normalizeFaviconUrl("chrome://favicon/https://example.com"), null);
  assert.equal(resolveTabIconUrl({
    url: "https://example.com/path",
    faviconUrl: "https://cdn.example.com/page.png",
  }), "https://cdn.example.com/page.png");
  assert.equal(resolveTabIconUrl({ url: "https://example.com/path" }), "https://example.com/favicon.ico");
});

test("el atajo de doble click ignora controles, papelera y operaciones activas", () => {
  assert.equal(shouldSendTabOnDoubleClick({ closest: () => null }), true);
  assert.equal(shouldSendTabOnDoubleClick({ closest: () => ({ tagName: "BUTTON" }) }), false);
  assert.equal(shouldSendTabOnDoubleClick(null, { trashed: true }), false);
  assert.equal(shouldSendTabOnDoubleClick(null, { disabled: true }), false);
});

test("valida HTTP/HTTPS y conserva la URL exacta", () => {
  const exact = "https://Example.com/path?q=1#fragment";
  assert.equal(normalizeHttpUrl(`  ${exact}  `), exact);
  assert.equal(normalizeHttpUrl("brave://settings"), null);
  assert.equal(normalizeHttpUrl("javascript:alert(1)"), null);
});

test("resuelve dominios registrables, localhost e IP", () => {
  assert.equal(getGeneralDomain("https://news.bbc.co.uk/story"), "bbc.co.uk");
  assert.equal(getGeneralDomain("https://docs.google.com/document"), "google.com");
  assert.equal(getGeneralDomain("http://localhost:32119/test"), "localhost");
  assert.equal(getGeneralDomain("http://127.0.0.1/test"), "127.0.0.1");
});

test("deduplica por URL exacta y restaura desde la papelera", async () => {
  const db = await createDatabase();
  const first = api.importUrls(db, [
    { url: "https://example.com/a", title: "Primera", faviconUrl: "https://example.com/icon.png" },
    { url: "https://example.com/a", title: "Otra" },
  ]);
  assert.deepEqual(first, { imported: 1, duplicates: 1, restored: 0 });
  const tabId = api.buildSnapshot(db).tabs[0].id;
  api.trashTabs(db, [tabId]);
  assert.equal(api.buildSnapshot(db).trash.length, 1);
  const second = api.importUrls(db, [{ url: "https://example.com/a", title: null }]);
  assert.deepEqual(second, { imported: 0, duplicates: 0, restored: 1 });
  const snapshot = api.buildSnapshot(db);
  assert.equal(snapshot.tabs.length, 1);
  assert.equal(snapshot.tabs[0].title, "Primera");
  assert.equal(snapshot.tabs[0].faviconUrl, "https://example.com/icon.png");
  assert.equal(snapshot.trash.length, 0);
});

test("crea, renombra, reordena y elimina grupos sin borrar tabs", async () => {
  const db = await createDatabase();
  api.importUrls(db, [
    { url: "https://one.example/a", title: "A" },
    { url: "https://two.example/b", title: "B" },
  ]);
  const first = api.createGroup(db, "Trabajo");
  const second = api.createGroup(db, "Leer");
  assert.throws(() => api.createGroup(db, "trabajo"), /Ya existe/);
  api.renameGroup(db, second.id, "Después");
  api.reorderGroups(db, [second.id, first.id]);
  const tabIds = api.buildSnapshot(db).tabs.map((tab) => tab.id);
  api.moveTabs(db, tabIds, first.id);
  assert.equal(api.buildSnapshot(db).groups.find((group) => group.id === first.id).count, 2);
  api.reorderTabs(db, first.id, [...tabIds].reverse());
  assert.deepEqual(
    api.buildSnapshot(db).tabs.filter((tab) => tab.groupId === first.id).map((tab) => tab.id),
    [...tabIds].reverse(),
  );
  api.deleteGroup(db, first.id);
  const snapshot = api.buildSnapshot(db);
  assert.equal(snapshot.tabs.length, 2);
  assert.equal(snapshot.tabs.every((tab) => tab.groupId === null), true);
});

test("la papelera conserva y recupera la ubicación anterior", async () => {
  const db = await createDatabase();
  api.importUrls(db, [{ url: "https://example.com/a", title: "A" }]);
  const group = api.createGroup(db, "Grupo");
  const tabId = api.buildSnapshot(db).tabs[0].id;
  api.moveTabs(db, [tabId], group.id);
  api.trashTabs(db, [tabId]);
  assert.equal(api.buildSnapshot(db).trash[0].id, tabId);
  api.restoreTabs(db, [tabId]);
  assert.equal(api.buildSnapshot(db).tabs[0].groupId, group.id);
  api.trashTabs(db, [tabId]);
  assert.equal(api.emptyTrash(db), 1);
  assert.equal(api.buildSnapshot(db).trash.length, 0);
});

test("reagrupar crea grupos solo para dominios repetidos y ordena A-Z", async () => {
  const db = await createDatabase();
  api.importUrls(db, [
    { url: "https://news.bbc.co.uk/z", title: "Zulu" },
    { url: "https://sport.bbc.co.uk/a", title: "Alpha" },
    { url: "https://docs.google.com/b", title: "Beta" },
    { url: "https://mail.google.com/a", title: "Alpha" },
    { url: "https://single.example/a", title: "Single" },
  ]);
  api.createGroup(db, "Manual");
  const result = api.regroupByDomain(db);
  assert.deepEqual(result, { groupsCreated: 2, ungrouped: 1, tabs: 5 });
  const snapshot = api.buildSnapshot(db);
  assert.deepEqual(snapshot.groups.map((group) => group.name), ["bbc.co.uk", "google.com"]);
  assert.equal(snapshot.tabs.filter((tab) => !tab.groupId).length, 1);
  const bbcGroup = snapshot.groups[0];
  assert.deepEqual(
    snapshot.tabs.filter((tab) => tab.groupId === bbcGroup.id).map((tab) => tab.title),
    ["Alpha", "Zulu"],
  );
});

test("importa los tres formatos JSON usando solo URLs y exporta solo activas", async () => {
  const db = await createDatabase();
  assert.deepEqual(extractJsonUrls(["https://a.example", { url: "https://b.example", title: "Ignorado" }]), {
    urls: ["https://a.example", "https://b.example"], invalid: 0, total: 2,
  });
  const result = api.importJson(db, JSON.stringify({
    urls: ["https://a.example", "brave://settings", "https://a.example"],
    groups: [{ name: "Ignorado" }],
  }));
  assert.equal(result.imported, 1);
  assert.equal(result.invalid, 1);
  assert.equal(result.duplicatesInInput, 1);
  const activeId = api.buildSnapshot(db).tabs[0].id;
  api.importJson(db, [{ url: "https://b.example", title: "No se usa" }]);
  api.trashTabs(db, [activeId]);
  assert.deepEqual(api.exportJson(db), {
    urls: ["https://b.example"],
  });
});

test("conserva la base y los settings al desactivar y reactivar el plugin", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "nexus-tab-repository-lifecycle-"));
  resources.push({ root, db: null });
  const nexusPath = path.join(root, ".nexus");
  let settings = { batchSize: 37, showTitle: false, showUrl: true, sidebarWidth: 312 };

  const activate = async () => {
    const handlers = new Map();
    const cleanups = [];
    const abortController = new AbortController();
    const ctx = {
      vault: { nexusPath },
      settings: {
        get: async () => settings,
        set: async (next) => { settings = next; },
      },
      browserConnection: { tabs: {} },
      tasks: createTasks(),
      ipc: {
        handle: (operation, handler) => handlers.set(
          `tab-repository:${operation}`,
          (event, payload) => handler(event, payload, {
            signal: abortController.signal,
            generation: 1,
            onCleanup() {},
            throwIfAborted: () => abortController.signal.throwIfAborted(),
          }),
        ),
      },
      lifecycle: {
        signal: abortController.signal,
        acceptingWork: true,
        run: (_name, producer) => Promise.resolve().then(() => producer({ signal: abortController.signal })),
        throwIfAborted: () => abortController.signal.throwIfAborted(),
      },
      registerCleanup: (cleanup) => cleanups.push(cleanup),
    };
    await plugin.activate(ctx);
    return { handlers, cleanups };
  };

  const first = await activate();
  const imported = await first.handlers.get("tab-repository:json-import")(null, {
    json: ["https://persist.example/path"],
  });
  assert.equal(imported.ok, true);
  await Promise.all(first.cleanups.map((cleanup) => cleanup()));

  const second = await activate();
  const snapshot = await second.handlers.get("tab-repository:get-snapshot")(null, {});
  assert.equal(snapshot.ok, true);
  assert.deepEqual(snapshot.data.tabs.map((tab) => tab.url), ["https://persist.example/path"]);
  assert.deepEqual(settings, { batchSize: 37, showTitle: false, showUrl: true, sidebarWidth: 312 });
  await Promise.all(second.cleanups.map((cleanup) => cleanup()));
});

test("previsualiza solo HTTP/HTTPS y confirma únicamente tabs sin cambios", async () => {
  const db = await createDatabase();
  api.setRuntimeDb(db);
  const closed = [];
  let listCall = 0;
  const initialTabs = [
    { id: 1, connectionId: "c1", url: "https://example.com/a", title: "A", favIconUrl: "https://example.com/a.png", pinned: true },
    { id: 2, connectionId: "c1", url: "https://example.com/b", title: "B" },
    { id: 3, connectionId: "c1", url: "brave://settings", title: "Settings" },
  ];
  const ctx = {
    tasks: createTasks(),
    browserConnection: { tabs: {
      list: async () => {
        listCall += 1;
        return listCall === 1
          ? initialTabs
          : [{ ...initialTabs[0] }, { ...initialTabs[1], url: "https://changed.example" }, initialTabs[2]];
      },
      close: async ({ tabIds, tabId }) => { closed.push(...(tabIds || [tabId])); return { removed: true }; },
    } },
  };
  const preview = await api.previewBrowserImport(ctx, false);
  assert.equal(preview.eligibleCount, 2);
  assert.equal(preview.pinnedCount, 1);
  assert.equal(preview.excludedCount, 1);
  const result = await api.commitBrowserImport(ctx, preview.token);
  assert.equal(result.matched, 1);
  assert.equal(result.skippedChanged, 1);
  assert.deepEqual(closed, [1]);
  assert.deepEqual(api.buildSnapshot(db).tabs.map((tab) => tab.url), ["https://example.com/a"]);
  assert.equal(api.buildSnapshot(db).tabs[0].faviconUrl, "https://example.com/a.png");
  await assert.rejects(() => api.commitBrowserImport(ctx, preview.token), /venció|utilizada/);
});

test("un fallo de persistencia impide cerrar tabs de Brave", async () => {
  const db = await createDatabase();
  api.setRuntimeDb(db);
  let closed = 0;
  const tabs = [{ id: 1, connectionId: "c1", url: "https://example.com", title: "A" }];
  const ctx = {
    tasks: createTasks(),
    browserConnection: { tabs: {
      list: async () => tabs,
      close: async () => { closed += 1; },
    } },
  };
  const preview = await api.previewBrowserImport(ctx, false);
  db.close();
  await assert.rejects(() => api.commitBrowserImport(ctx, preview.token));
  assert.equal(closed, 0);
});

test("el cierre parcial conserva todo lo importado y reporta pendientes", async () => {
  const db = await createDatabase();
  api.setRuntimeDb(db);
  const tabs = [
    { id: 1, connectionId: "c1", url: "https://example.com/a", title: "A" },
    { id: 2, connectionId: "c1", url: "https://example.com/b", title: "B" },
  ];
  const ctx = {
    tasks: createTasks(),
    browserConnection: { tabs: {
      list: async () => tabs,
      close: async ({ tabIds, tabId }) => {
        if (tabIds || tabId === 2) throw new Error("No se pudo cerrar");
        return { removed: true };
      },
    } },
  };
  const preview = await api.previewBrowserImport(ctx, false);
  const result = await api.commitBrowserImport(ctx, preview.token);
  assert.equal(result.closed, 1);
  assert.equal(result.closeFailed, 1);
  assert.equal(api.buildSnapshot(db).tabs.length, 2);
});

test("envía en segundo plano, elimina tras éxito y reutiliza requestId", async () => {
  const db = await createDatabase();
  api.setRuntimeDb(db);
  api.importUrls(db, [{ url: "https://example.com/a", title: "A" }]);
  const tabId = api.buildSnapshot(db).tabs[0].id;
  const requests = [];
  let shouldFail = true;
  const ctx = {
    tasks: createTasks(),
    browserConnection: { tabs: {
      open: async (payload) => {
        requests.push(payload);
        if (shouldFail) {
          const error = new Error("Brave está offline");
          error.code = "target_offline";
          throw error;
        }
        return { id: 10 };
      },
    } },
  };
  await assert.rejects(() => api.sendTabs(ctx, [tabId], false));
  const pendingId = api.buildSnapshot(db).tabs[0].pendingRequestId;
  assert.ok(pendingId);
  shouldFail = false;
  const result = await api.sendTabs(ctx, [tabId], true);
  assert.deepEqual(result.opened, [tabId]);
  assert.equal(requests[0].active, false);
  assert.equal(requests[0].requestId, requests[1].requestId);
  assert.equal(requests[1].launchIfNeeded, true);
  assert.equal(api.buildSnapshot(db).tabs.length, 0);
});

test("vence tokens de importacion y cierra todas las copias exactas de una URL valida", async () => {
  const db = await createDatabase();
  api.setRuntimeDb(db);
  const tabs = [
    { id: 1, connectionId: "c1", url: "https://duplicate.example/a", title: "A" },
    { id: 2, connectionId: "c1", url: "https://duplicate.example/a", title: "A duplicada" },
  ];
  const closed = [];
  const ctx = {
    tasks: createTasks(),
    browserConnection: { tabs: {
      list: async () => tabs,
      close: async ({ tabIds, tabId }) => { closed.push(...(tabIds || [tabId])); },
    } },
  };
  const originalNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    const expired = await api.previewBrowserImport(ctx, false);
    Date.now = () => 1_000_000 + 120_001;
    await assert.rejects(() => api.commitBrowserImport(ctx, expired.token), /venció|utilizada/);
  } finally {
    Date.now = originalNow;
  }
  assert.deepEqual(closed, []);

  const preview = await api.previewBrowserImport(ctx, false);
  const result = await api.commitBrowserImport(ctx, preview.token);
  assert.deepEqual({ imported: result.imported, duplicates: result.duplicates, closed: result.closed }, {
    imported: 1,
    duplicates: 1,
    closed: 2,
  });
  assert.equal(api.buildSnapshot(db).tabs.length, 1);
  assert.deepEqual(closed, [1, 2]);
});

test("continua tras un fallo propio de URL y conserva el orden del lote", async () => {
  const db = await createDatabase();
  api.setRuntimeDb(db);
  api.importUrls(db, [
    { url: "https://example.com/1", title: "1" },
    { url: "https://example.com/2", title: "2" },
    { url: "https://example.com/3", title: "3" },
  ]);
  const tabs = api.buildSnapshot(db).tabs;
  const openedUrls = [];
  const ctx = {
    tasks: createTasks(),
    browserConnection: { tabs: {
      open: async (payload) => {
        openedUrls.push(payload.url);
        if (payload.url.endsWith("/2")) {
          const error = new Error("URL rechazada");
          error.code = "invalid_request";
          throw error;
        }
        return { id: openedUrls.length };
      },
    } },
  };
  const result = await api.sendTabs(ctx, tabs.map((tab) => tab.id), false);
  assert.deepEqual(openedUrls, tabs.map((tab) => tab.url));
  assert.equal(result.opened.length, 2);
  assert.equal(result.failed.length, 1);
  assert.deepEqual(api.buildSnapshot(db).tabs.map((tab) => tab.url), ["https://example.com/2"]);
});

test("filtra y virtualiza una lista sintética grande sin renderizarla completa", () => {
  const tabs = Array.from({ length: 10_000 }, (_, index) => ({
    id: `tab-${index}`,
    title: `Página ${index}`,
    url: `https://domain-${index % 20}.example/item/${index}`,
    domain: `domain-${index % 20}.example`,
  }));
  assert.equal(filterTabs(tabs, "domain-7.example").length, 500);
  const range = getVirtualRange({
    itemCount: tabs.length,
    rowHeight: 58,
    scrollTop: 5800,
    viewportHeight: 580,
  });
  assert.deepEqual(range, { start: 92, end: 118 });
  assert.deepEqual(reorderBefore(["a", "b", "c", "d"], ["b", "c"], "a"), ["b", "c", "a", "d"]);
});
