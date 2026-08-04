import crypto from "node:crypto";
import fsp from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import {
  DEFAULT_SETTINGS,
  IMPORT_PREVIEW_TTL_MS,
  TAB_REPOSITORY_PLUGIN_ID,
  compareTabLabels,
  extractJsonUrls,
  getGeneralDomain,
  isSystemicBrowserError,
  normalizeHttpUrl,
  normalizeSettings,
} from "./domain.ts";

type Db = DatabaseSync;
type Row = Record<string, any>;
type ImportCandidate = {
  connectionId: string;
  tabId: number;
  url: string;
  title: string | null;
  faviconUrl: string | null;
  pinned: boolean;
};
type ImportPreview = {
  token: string;
  createdAt: number;
  expiresAt: number;
  connectionId: string;
  candidates: ImportCandidate[];
  excludedCount: number;
};

const importPreviews = new Map<string, ImportPreview>();
let runtimeDb: Db | null = null;

function nowIso() {
  return new Date().toISOString();
}

function success(data: unknown = {}) {
  return { ok: true, data };
}

function failure(error: unknown, fallback = "La operación no pudo completarse.", details?: unknown) {
  const value = error as any;
  return {
    ok: false,
    error: {
      code: typeof value?.code === "string" ? value.code : "tab_repository_error",
      message: value instanceof Error ? value.message : fallback,
      ...(details === undefined ? {} : { details }),
    },
  };
}

function assertDb() {
  if (!runtimeDb) throw new Error("Tab Repository no está activo.");
  return runtimeDb;
}

function withTransaction<T>(db: Db, callback: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function getStoragePaths(ctx: NexusBackendPluginContext) {
  const root = path.join(ctx.vault.nexusPath, "plugins-data", TAB_REPOSITORY_PLUGIN_ID);
  return { root, database: path.join(root, "catalog.db") };
}

async function ensureStorage(ctx: NexusBackendPluginContext) {
  const paths = getStoragePaths(ctx);
  await fsp.mkdir(paths.root, { recursive: true });
  return paths;
}

function ensureSchema(db: Db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tab_repository_groups (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tab_repository_tabs (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      favicon_url TEXT,
      domain TEXT NOT NULL,
      group_id TEXT REFERENCES tab_repository_groups(id) ON DELETE SET NULL,
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

    CREATE INDEX IF NOT EXISTS idx_tab_repository_tabs_group
      ON tab_repository_tabs (group_id, trashed_at, position);
    CREATE INDEX IF NOT EXISTS idx_tab_repository_tabs_trash
      ON tab_repository_tabs (trashed_at, position);
    CREATE INDEX IF NOT EXISTS idx_tab_repository_tabs_domain
      ON tab_repository_tabs (domain, trashed_at);
  `);
  const columns = db.prepare("PRAGMA table_info(tab_repository_tabs)").all() as Row[];
  if (!columns.some((column) => column.name === "favicon_url")) {
    db.exec("ALTER TABLE tab_repository_tabs ADD COLUMN favicon_url TEXT");
  }
}

function normalizeTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";
  return title ? title.slice(0, 2048) : null;
}

function normalizeFaviconUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const faviconUrl = value.trim();
  if (!faviconUrl) return null;
  if (/^data:image\/(?:png|jpeg|webp|gif|x-icon|vnd\.microsoft\.icon);/i.test(faviconUrl)) {
    return faviconUrl.length <= 128 * 1024 ? faviconUrl : null;
  }
  if (faviconUrl.length > 8192) return null;
  try {
    const parsed = new URL(faviconUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? faviconUrl : null;
  } catch {
    return null;
  }
}

function normalizeGroupName(value: unknown) {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!name) throw new Error("El grupo necesita un nombre.");
  if (name.length > 120) throw new Error("El nombre del grupo no puede superar 120 caracteres.");
  return name;
}

function mapGroup(row: Row) {
  return {
    id: row.id,
    name: row.name,
    position: Number(row.position || 0),
    count: Number(row.tab_count || 0),
  };
}

function mapTab(row: Row) {
  return {
    id: row.id,
    url: row.url,
    title: row.title || null,
    faviconUrl: row.favicon_url || null,
    domain: row.domain,
    groupId: row.group_id || null,
    position: Number(row.position || 0),
    createdAt: row.created_at,
    importedAt: row.imported_at,
    updatedAt: row.updated_at,
    trashedAt: row.trashed_at || null,
    pendingRequestId: row.pending_request_id || null,
  };
}

function getNextTabPosition(db: Db, groupId: string | null, trashed = false) {
  const row = trashed
    ? db.prepare(`
        SELECT COALESCE(MAX(position), -1) + 1 AS next_position
        FROM tab_repository_tabs WHERE trashed_at IS NOT NULL
      `).get() as Row
    : groupId
      ? db.prepare(`
          SELECT COALESCE(MAX(position), -1) + 1 AS next_position
          FROM tab_repository_tabs WHERE trashed_at IS NULL AND group_id = ?
        `).get(groupId) as Row
      : db.prepare(`
          SELECT COALESCE(MAX(position), -1) + 1 AS next_position
          FROM tab_repository_tabs WHERE trashed_at IS NULL AND group_id IS NULL
        `).get() as Row;
  return Number(row?.next_position || 0);
}

function groupExists(db: Db, groupId: string | null) {
  if (!groupId) return false;
  return Boolean(db.prepare("SELECT 1 FROM tab_repository_groups WHERE id = ?").get(groupId));
}

function listGroups(db: Db) {
  return (db.prepare(`
    SELECT groups.*, COUNT(tabs.id) AS tab_count
    FROM tab_repository_groups groups
    LEFT JOIN tab_repository_tabs tabs
      ON tabs.group_id = groups.id AND tabs.trashed_at IS NULL
    GROUP BY groups.id
    ORDER BY groups.position, groups.name COLLATE NOCASE
  `).all() as Row[]).map(mapGroup);
}

function listTabs(db: Db, trashed = false) {
  const rows = db.prepare(trashed ? `
    SELECT tabs.*
    FROM tab_repository_tabs tabs
    WHERE tabs.trashed_at IS NOT NULL
    ORDER BY tabs.trashed_at DESC, tabs.position, tabs.created_at
  ` : `
    SELECT tabs.*
    FROM tab_repository_tabs tabs
    LEFT JOIN tab_repository_groups groups ON groups.id = tabs.group_id
    WHERE tabs.trashed_at IS NULL
    ORDER BY
      CASE WHEN tabs.group_id IS NULL THEN 0 ELSE 1 END,
      groups.position,
      tabs.position,
      tabs.created_at
  `).all() as Row[];
  return rows.map(mapTab);
}

function buildSnapshot(db: Db) {
  const groups = listGroups(db);
  const tabs = listTabs(db, false);
  const trash = listTabs(db, true);
  return {
    groups,
    tabs,
    trash,
    counts: {
      active: tabs.length,
      ungrouped: tabs.filter((tab) => !tab.groupId).length,
      trash: trash.length,
    },
  };
}

function importUrl(db: Db, url: string, title: string | null, rawFaviconUrl: unknown = null) {
  const existing = db.prepare("SELECT * FROM tab_repository_tabs WHERE url = ?").get(url) as Row | undefined;
  const timestamp = nowIso();
  const faviconUrl = normalizeFaviconUrl(rawFaviconUrl);
  if (existing) {
    if (existing.trashed_at) {
      const restoredGroupId = groupExists(db, existing.trash_group_id) ? existing.trash_group_id : null;
      const restoredPosition = Number.isFinite(Number(existing.trash_position))
        ? Number(existing.trash_position)
        : getNextTabPosition(db, restoredGroupId);
      db.prepare(`
        UPDATE tab_repository_tabs
        SET group_id = ?, position = ?, trashed_at = NULL, trash_group_id = NULL,
            trash_position = NULL, favicon_url = COALESCE(favicon_url, ?), updated_at = ?
        WHERE id = ?
      `).run(restoredGroupId, restoredPosition, faviconUrl, timestamp, existing.id);
      return { kind: "restored", id: existing.id } as const;
    }
    if (!existing.favicon_url && faviconUrl) {
      db.prepare("UPDATE tab_repository_tabs SET favicon_url = ?, updated_at = ? WHERE id = ?")
        .run(faviconUrl, timestamp, existing.id);
    }
    return { kind: "duplicates", id: existing.id } as const;
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO tab_repository_tabs (
      id, url, title, favicon_url, domain, group_id, position, created_at, imported_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)
  `).run(
    id,
    url,
    title,
    faviconUrl,
    getGeneralDomain(url),
    getNextTabPosition(db, null),
    timestamp,
    timestamp,
    timestamp,
  );
  return { kind: "imported", id } as const;
}

function importUrls(db: Db, entries: Array<{ url: string; title: string | null; faviconUrl?: string | null }>) {
  return withTransaction(db, () => {
    const result = { imported: 0, duplicates: 0, restored: 0 };
    for (const entry of entries) {
      const outcome = importUrl(db, entry.url, entry.title, entry.faviconUrl);
      result[outcome.kind] += 1;
    }
    return result;
  });
}

function createGroup(db: Db, rawName: unknown) {
  const name = normalizeGroupName(rawName);
  const duplicate = db.prepare("SELECT id FROM tab_repository_groups WHERE name = ? COLLATE NOCASE").get(name);
  if (duplicate) throw new Error("Ya existe un grupo con ese nombre.");
  const positionRow = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM tab_repository_groups").get() as Row;
  const timestamp = nowIso();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO tab_repository_groups (id, name, position, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, Number(positionRow.value || 0), timestamp, timestamp);
  return mapGroup({ id, name, position: positionRow.value, tab_count: 0 });
}

function renameGroup(db: Db, groupId: string, rawName: unknown) {
  const name = normalizeGroupName(rawName);
  const duplicate = db.prepare(`
    SELECT id FROM tab_repository_groups WHERE name = ? COLLATE NOCASE AND id <> ?
  `).get(name, groupId);
  if (duplicate) throw new Error("Ya existe un grupo con ese nombre.");
  const result = db.prepare(`
    UPDATE tab_repository_groups SET name = ?, updated_at = ? WHERE id = ?
  `).run(name, nowIso(), groupId);
  if (!result.changes) throw new Error("El grupo ya no existe.");
}

function deleteGroup(db: Db, groupId: string) {
  withTransaction(db, () => {
    if (!groupExists(db, groupId)) throw new Error("El grupo ya no existe.");
    let nextPosition = getNextTabPosition(db, null);
    const tabs = db.prepare(`
      SELECT id FROM tab_repository_tabs
      WHERE group_id = ? AND trashed_at IS NULL ORDER BY position, created_at
    `).all(groupId) as Row[];
    const update = db.prepare(`
      UPDATE tab_repository_tabs SET group_id = NULL, position = ?, updated_at = ? WHERE id = ?
    `);
    for (const tab of tabs) update.run(nextPosition++, nowIso(), tab.id);
    db.prepare("DELETE FROM tab_repository_groups WHERE id = ?").run(groupId);
    const remaining = db.prepare("SELECT id FROM tab_repository_groups ORDER BY position, name COLLATE NOCASE").all() as Row[];
    const reorder = db.prepare("UPDATE tab_repository_groups SET position = ?, updated_at = ? WHERE id = ?");
    remaining.forEach((group, index) => reorder.run(index, nowIso(), group.id));
  });
}

function reorderGroups(db: Db, orderedIds: unknown) {
  if (!Array.isArray(orderedIds)) throw new Error("El orden de grupos es inválido.");
  const currentIds = (db.prepare("SELECT id FROM tab_repository_groups ORDER BY position").all() as Row[])
    .map((row) => String(row.id));
  const nextIds = orderedIds.map(String);
  if (nextIds.length !== currentIds.length || new Set(nextIds).size !== currentIds.length
    || currentIds.some((id) => !nextIds.includes(id))) {
    throw new Error("El orden de grupos ya no coincide con el repositorio.");
  }
  withTransaction(db, () => {
    const statement = db.prepare("UPDATE tab_repository_groups SET position = ?, updated_at = ? WHERE id = ?");
    nextIds.forEach((id, index) => statement.run(index, nowIso(), id));
  });
}

function normalizeTabIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

function moveTabs(db: Db, rawIds: unknown, rawGroupId: unknown) {
  const tabIds = normalizeTabIds(rawIds);
  const groupId = rawGroupId == null || rawGroupId === "" ? null : String(rawGroupId);
  if (!tabIds.length) throw new Error("Selecciona al menos una tab.");
  if (groupId && !groupExists(db, groupId)) throw new Error("El grupo de destino ya no existe.");
  withTransaction(db, () => {
    let nextPosition = getNextTabPosition(db, groupId);
    const statement = db.prepare(`
      UPDATE tab_repository_tabs
      SET group_id = ?, position = ?, updated_at = ?
      WHERE id = ? AND trashed_at IS NULL
    `);
    for (const id of tabIds) statement.run(groupId, nextPosition++, nowIso(), id);
  });
}

function reorderTabs(db: Db, rawGroupId: unknown, rawIds: unknown) {
  const groupId = rawGroupId == null || rawGroupId === "" ? null : String(rawGroupId);
  const nextIds = normalizeTabIds(rawIds);
  const rows = groupId
    ? db.prepare(`
        SELECT id FROM tab_repository_tabs
        WHERE trashed_at IS NULL AND group_id = ? ORDER BY position, created_at
      `).all(groupId) as Row[]
    : db.prepare(`
        SELECT id FROM tab_repository_tabs
        WHERE trashed_at IS NULL AND group_id IS NULL ORDER BY position, created_at
      `).all() as Row[];
  const currentIds = rows.map((row) => String(row.id));
  if (nextIds.length !== currentIds.length || currentIds.some((id) => !nextIds.includes(id))) {
    throw new Error("El orden de tabs ya no coincide con la vista.");
  }
  withTransaction(db, () => {
    const statement = db.prepare("UPDATE tab_repository_tabs SET position = ?, updated_at = ? WHERE id = ?");
    nextIds.forEach((id, index) => statement.run(index, nowIso(), id));
  });
}

function trashTabs(db: Db, rawIds: unknown) {
  const ids = normalizeTabIds(rawIds);
  if (!ids.length) throw new Error("Selecciona al menos una tab.");
  withTransaction(db, () => {
    let nextPosition = getNextTabPosition(db, null, true);
    const select = db.prepare("SELECT group_id, position FROM tab_repository_tabs WHERE id = ? AND trashed_at IS NULL");
    const update = db.prepare(`
      UPDATE tab_repository_tabs
      SET trash_group_id = ?, trash_position = ?, group_id = NULL, position = ?,
          trashed_at = ?, updated_at = ?
      WHERE id = ? AND trashed_at IS NULL
    `);
    for (const id of ids) {
      const row = select.get(id) as Row | undefined;
      if (!row) continue;
      const timestamp = nowIso();
      update.run(row.group_id || null, row.position, nextPosition++, timestamp, timestamp, id);
    }
  });
}

function restoreTabs(db: Db, rawIds: unknown) {
  const ids = normalizeTabIds(rawIds);
  if (!ids.length) throw new Error("Selecciona al menos una tab.");
  withTransaction(db, () => {
    const select = db.prepare("SELECT * FROM tab_repository_tabs WHERE id = ? AND trashed_at IS NOT NULL");
    const update = db.prepare(`
      UPDATE tab_repository_tabs
      SET group_id = ?, position = ?, trashed_at = NULL, trash_group_id = NULL,
          trash_position = NULL, updated_at = ?
      WHERE id = ?
    `);
    for (const id of ids) {
      const row = select.get(id) as Row | undefined;
      if (!row) continue;
      const groupId = groupExists(db, row.trash_group_id) ? row.trash_group_id : null;
      const position = Number.isFinite(Number(row.trash_position))
        ? Number(row.trash_position)
        : getNextTabPosition(db, groupId);
      update.run(groupId, position, nowIso(), id);
    }
  });
}

function emptyTrash(db: Db) {
  return Number(db.prepare("DELETE FROM tab_repository_tabs WHERE trashed_at IS NOT NULL").run().changes || 0);
}

function regroupByDomain(db: Db) {
  return withTransaction(db, () => {
    const tabs = (db.prepare(`
      SELECT id, url, title, domain FROM tab_repository_tabs WHERE trashed_at IS NULL
    `).all() as Row[]).map((row) => ({
      id: String(row.id),
      url: String(row.url),
      title: row.title ? String(row.title) : null,
      domain: String(row.domain),
    }));
    const byDomain = new Map<string, typeof tabs>();
    for (const tab of tabs) {
      const bucket = byDomain.get(tab.domain) || [];
      bucket.push(tab);
      byDomain.set(tab.domain, bucket);
    }
    db.prepare("UPDATE tab_repository_tabs SET group_id = NULL").run();
    db.prepare("DELETE FROM tab_repository_groups").run();
    const timestamp = nowIso();
    const insertGroup = db.prepare(`
      INSERT INTO tab_repository_groups (id, name, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const updateTab = db.prepare(`
      UPDATE tab_repository_tabs SET group_id = ?, position = ?, updated_at = ? WHERE id = ?
    `);
    const repeatedDomains = [...byDomain.entries()]
      .filter(([, entries]) => entries.length >= 2)
      .sort(([left], [right]) => left.localeCompare(right, "es", { sensitivity: "base" }));
    repeatedDomains.forEach(([domain, entries], groupPosition) => {
      const groupId = crypto.randomUUID();
      insertGroup.run(groupId, domain, groupPosition, timestamp, timestamp);
      entries.sort(compareTabLabels).forEach((tab, position) => {
        updateTab.run(groupId, position, timestamp, tab.id);
      });
    });
    const singletons = [...byDomain.values()]
      .filter((entries) => entries.length === 1)
      .flat()
      .sort(compareTabLabels);
    singletons.forEach((tab, position) => updateTab.run(null, position, timestamp, tab.id));
    return { groupsCreated: repeatedDomains.length, ungrouped: singletons.length, tabs: tabs.length };
  });
}

function clearExpiredPreviews() {
  const now = Date.now();
  for (const [token, preview] of importPreviews.entries()) {
    if (preview.expiresAt <= now) importPreviews.delete(token);
  }
}

function normalizeBrowserTabs(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter((entry) => entry && typeof entry === "object") as Row[] : [];
}

async function previewBrowserImport(ctx: NexusBackendPluginContext, launchIfNeeded: boolean) {
  clearExpiredPreviews();
  const tabs = normalizeBrowserTabs(await ctx.browserConnection.tabs.list({ query: {}, launchIfNeeded }));
  const candidates: ImportCandidate[] = [];
  for (const tab of tabs) {
    const url = normalizeHttpUrl(tab.url);
    const tabId = Number(tab.id);
    const connectionId = typeof tab.connectionId === "string" ? tab.connectionId : "";
    if (!url || !Number.isInteger(tabId) || !connectionId) continue;
    candidates.push({
      connectionId,
      tabId,
      url,
      title: normalizeTitle(tab.title),
      faviconUrl: normalizeFaviconUrl(tab.favIconUrl),
      pinned: tab.pinned === true,
    });
  }
  const connectionIds = [...new Set(candidates.map((entry) => entry.connectionId))];
  if (connectionIds.length > 1) throw new Error("La previsualización mezcló más de una conexión de Brave.");
  const token = crypto.randomUUID();
  const preview: ImportPreview = {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + IMPORT_PREVIEW_TTL_MS,
    connectionId: connectionIds[0] || "",
    candidates,
    excludedCount: tabs.length - candidates.length,
  };
  importPreviews.set(token, preview);
  return {
    token,
    expiresInMs: IMPORT_PREVIEW_TTL_MS,
    eligibleCount: candidates.length,
    pinnedCount: candidates.filter((entry) => entry.pinned).length,
    excludedCount: preview.excludedCount,
  };
}

async function closeImportedTabs(
  ctx: NexusBackendPluginContext,
  candidates: ImportCandidate[],
) {
  const failed: Array<{ tabId: number; message: string }> = [];
  let closed = 0;
  const chunks: ImportCandidate[][] = [];
  for (let index = 0; index < candidates.length; index += 50) chunks.push(candidates.slice(index, index + 50));
  for (const chunk of chunks) {
    try {
      await ctx.browserConnection.tabs.close({
        tabIds: chunk.map((entry) => entry.tabId),
        connectionId: chunk[0]?.connectionId,
        requestId: crypto.randomUUID(),
      });
      closed += chunk.length;
    } catch {
      for (const candidate of chunk) {
        try {
          await ctx.browserConnection.tabs.close({
            tabId: candidate.tabId,
            connectionId: candidate.connectionId,
            requestId: crypto.randomUUID(),
          });
          closed += 1;
        } catch (error) {
          failed.push({
            tabId: candidate.tabId,
            message: error instanceof Error ? error.message : "No se pudo cerrar la tab.",
          });
        }
      }
    }
  }
  return { closed, failed };
}

async function commitBrowserImport(ctx: NexusBackendPluginContext, rawToken: unknown) {
  clearExpiredPreviews();
  const token = String(rawToken || "");
  const preview = importPreviews.get(token);
  if (!preview) {
    const error = new Error("La previsualización venció o ya fue utilizada.") as Error & { code?: string };
    error.code = "preview_expired";
    throw error;
  }
  importPreviews.delete(token);
  const currentTabs = normalizeBrowserTabs(await ctx.browserConnection.tabs.list({ query: {} }));
  const currentById = new Map(currentTabs.map((tab) => [`${tab.connectionId}:${tab.id}`, tab]));
  const matched = preview.candidates.flatMap((candidate) => {
    const current = currentById.get(`${candidate.connectionId}:${candidate.tabId}`);
    return current && current.url === candidate.url
      ? [{ ...candidate, faviconUrl: normalizeFaviconUrl(current.favIconUrl) || candidate.faviconUrl }]
      : [];
  });
  ctx.tasks.start({
    id: "browser-import",
    title: "Importando tabs de Brave",
    progress: { current: 0, total: matched.length, label: "tabs" },
  });
  try {
    const imported = importUrls(assertDb(), matched.map((entry) => ({
      url: entry.url,
      title: entry.title,
      faviconUrl: entry.faviconUrl,
    })));
    ctx.tasks.update("browser-import", {
      detail: "Cerrando las tabs guardadas",
      progress: { current: matched.length, total: matched.length, label: "tabs" },
    });
    const closeResult = await closeImportedTabs(ctx, matched);
    if (closeResult.failed.length) {
      ctx.tasks.fail("browser-import", {
        message: "Algunas tabs quedaron abiertas en Brave.",
        detail: `${closeResult.failed.length} cierres pendientes`,
      });
    } else {
      ctx.tasks.complete("browser-import");
    }
    return {
      ...imported,
      eligible: preview.candidates.length,
      matched: matched.length,
      skippedChanged: preview.candidates.length - matched.length,
      closed: closeResult.closed,
      closeFailed: closeResult.failed.length,
      closeFailures: closeResult.failed,
    };
  } catch (error) {
    ctx.tasks.fail("browser-import", {
      message: "No se pudieron importar las tabs.",
      detail: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function preparePendingRequest(db: Db, tabId: string) {
  return withTransaction(db, () => {
    const row = db.prepare(`
      SELECT * FROM tab_repository_tabs WHERE id = ? AND trashed_at IS NULL
    `).get(tabId) as Row | undefined;
    if (!row) return null;
    const requestId = row.pending_request_id || crypto.randomUUID();
    if (!row.pending_request_id) {
      db.prepare(`
        UPDATE tab_repository_tabs
        SET pending_request_id = ?, pending_started_at = ?, updated_at = ? WHERE id = ?
      `).run(requestId, nowIso(), nowIso(), tabId);
    }
    return { tab: mapTab(row), requestId: String(requestId) };
  });
}

async function sendTabs(
  ctx: NexusBackendPluginContext,
  rawIds: unknown,
  launchIfNeeded: boolean,
) {
  const db = assertDb();
  const ids = normalizeTabIds(rawIds);
  if (!ids.length) throw new Error("No hay tabs para enviar.");
  const result = { opened: [] as string[], failed: [] as Array<{ id: string; message: string }>, aborted: false };
  ctx.tasks.start({
    id: "browser-send",
    title: "Enviando tabs a Brave",
    progress: { current: 0, total: ids.length, label: "tabs" },
  });
  for (let index = 0; index < ids.length; index += 1) {
    const pending = preparePendingRequest(db, ids[index]);
    if (!pending) continue;
    try {
      await ctx.browserConnection.tabs.open({
        url: pending.tab.url,
        active: false,
        launchIfNeeded: launchIfNeeded && result.opened.length === 0,
        requestId: pending.requestId,
      });
      db.prepare("DELETE FROM tab_repository_tabs WHERE id = ?").run(pending.tab.id);
      result.opened.push(pending.tab.id);
    } catch (error: any) {
      result.failed.push({
        id: pending.tab.id,
        message: error instanceof Error ? error.message : "No se pudo abrir la tab.",
      });
      if (isSystemicBrowserError(error?.code)) {
        result.aborted = true;
        ctx.tasks.fail("browser-send", {
          message: "El envío se interrumpió.",
          detail: error instanceof Error ? error.message : String(error),
        });
        const wrapped = error instanceof Error ? error : new Error(String(error));
        (wrapped as any).partial = result;
        throw wrapped;
      }
    }
    ctx.tasks.update("browser-send", {
      progress: { current: index + 1, total: ids.length, label: "tabs" },
    });
  }
  if (result.failed.length) {
    ctx.tasks.fail("browser-send", {
      message: "Algunas tabs no pudieron abrirse.",
      detail: `${result.failed.length} tabs permanecen en el repositorio`,
    });
  } else {
    ctx.tasks.complete("browser-send");
  }
  return result;
}

function importJson(db: Db, rawJson: unknown) {
  const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
  const extracted = extractJsonUrls(parsed);
  const uniqueUrls = [...new Set(extracted.urls)];
  const imported = importUrls(db, uniqueUrls.map((url) => ({ url, title: null })));
  return {
    ...imported,
    total: extracted.total,
    valid: extracted.urls.length,
    invalid: extracted.invalid,
    duplicatesInInput: extracted.urls.length - uniqueUrls.length,
  };
}

function exportJson(db: Db) {
  const urls = listTabs(db, false).map((tab) => tab.url);
  return { urls };
}

function registerHandler(
  ctx: NexusBackendPluginContext,
  channel: string,
  handler: (payload: any) => Promise<unknown> | unknown,
) {
  ctx.registerIpc(channel, async (_event, payload = {}) => {
    try {
      return success(await handler(payload));
    } catch (error: any) {
      return failure(error, undefined, error?.partial);
    }
  });
}

const tabRepositoryPlugin: NexusBackendPluginModule = {
  async ensureSchema(ctx) {
    const paths = await ensureStorage(ctx);
    const db = new DatabaseSync(paths.database);
    try {
      ensureSchema(db);
    } finally {
      db.close();
    }
  },

  async activate(ctx) {
    const paths = await ensureStorage(ctx);
    const db = new DatabaseSync(paths.database);
    ensureSchema(db);
    runtimeDb = db;
    const currentSettings = normalizeSettings(await ctx.settings.get());
    await ctx.settings.set(currentSettings);

    ctx.registerCleanup(() => {
      importPreviews.clear();
      if (runtimeDb === db) runtimeDb = null;
      db.close();
    });

    registerHandler(ctx, "tab-repository:get-snapshot", () => buildSnapshot(db));
    registerHandler(ctx, "tab-repository:group-create", (payload) => createGroup(db, payload.name));
    registerHandler(ctx, "tab-repository:group-rename", (payload) => {
      renameGroup(db, String(payload.groupId || ""), payload.name);
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:group-delete", (payload) => {
      deleteGroup(db, String(payload.groupId || ""));
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:groups-reorder", (payload) => {
      reorderGroups(db, payload.groupIds);
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:tabs-move", (payload) => {
      moveTabs(db, payload.tabIds, payload.groupId);
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:tabs-reorder", (payload) => {
      reorderTabs(db, payload.groupId, payload.tabIds);
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:tabs-trash", (payload) => {
      trashTabs(db, payload.tabIds);
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:tabs-restore", (payload) => {
      restoreTabs(db, payload.tabIds);
      return buildSnapshot(db);
    });
    registerHandler(ctx, "tab-repository:trash-empty", () => ({
      removed: emptyTrash(db),
      snapshot: buildSnapshot(db),
    }));
    registerHandler(ctx, "tab-repository:regroup-domain", () => ({
      result: regroupByDomain(db),
      snapshot: buildSnapshot(db),
    }));
    registerHandler(ctx, "tab-repository:browser-preview", (payload) =>
      previewBrowserImport(ctx, payload.launchIfNeeded === true));
    registerHandler(ctx, "tab-repository:browser-commit", (payload) =>
      commitBrowserImport(ctx, payload.token));
    registerHandler(ctx, "tab-repository:browser-send", async (payload) => ({
      result: await sendTabs(ctx, payload.tabIds, payload.launchIfNeeded === true),
      snapshot: buildSnapshot(db),
    }));
    registerHandler(ctx, "tab-repository:json-import", (payload) => ({
      result: importJson(db, payload.json),
      snapshot: buildSnapshot(db),
    }));
    registerHandler(ctx, "tab-repository:json-export", () => exportJson(db));
  },
};

export default tabRepositoryPlugin;

export const tabRepositoryTestApi = {
  ensureSchema,
  importUrls,
  buildSnapshot,
  createGroup,
  renameGroup,
  deleteGroup,
  reorderGroups,
  moveTabs,
  reorderTabs,
  trashTabs,
  restoreTabs,
  emptyTrash,
  regroupByDomain,
  importJson,
  exportJson,
  previewBrowserImport,
  commitBrowserImport,
  sendTabs,
  setRuntimeDb(db: Db | null) {
    runtimeDb = db;
  },
  clearImportPreviews() {
    importPreviews.clear();
  },
};

export {
  extractJsonUrls,
  getGeneralDomain,
  normalizeFaviconUrl,
  normalizeHttpUrl,
  normalizeSettings,
};
