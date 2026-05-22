var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nexus-plugins/Books/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  default: () => backend_default
});
module.exports = __toCommonJS(backend_exports);

// ../nexus-plugins/Books/src/book-indexing.ts
var import_promises = __toESM(require("node:fs/promises"));
var import_node_path2 = __toESM(require("node:path"));

// src/backend/vault-runtime/file-system/path-utils.ts
var import_node_path = __toESM(require("node:path"), 1);

// src/shared/vault-state.ts
var currentVault = null;
function getCurrentVault() {
  return currentVault;
}

// src/backend/vault-runtime/file-system/path-utils.ts
function getVaultContentPath() {
  const contentPath = getCurrentVault()?.contentPath;
  return contentPath ? import_node_path.default.normalize(contentPath) : null;
}
function normalizeRelativePath(value) {
  if (value == null) {
    return value;
  }
  const normalized = import_node_path.default.normalize(value);
  if (normalized === ".") {
    return "";
  }
  return normalized.replace(/^[\\/]+/, "");
}
function toVaultRelativePath(value) {
  if (value == null) {
    return value;
  }
  const contentPath = getVaultContentPath();
  const normalizedValue = import_node_path.default.normalize(value);
  if (!import_node_path.default.isAbsolute(normalizedValue) || !contentPath) {
    return normalizeRelativePath(normalizedValue);
  }
  return normalizeRelativePath(import_node_path.default.relative(contentPath, normalizedValue));
}
function toVaultAbsolutePath(value) {
  if (value == null) {
    return value;
  }
  const normalizedValue = import_node_path.default.normalize(value);
  if (import_node_path.default.isAbsolute(normalizedValue)) {
    return normalizedValue;
  }
  const contentPath = getVaultContentPath();
  if (!contentPath) {
    return normalizedValue;
  }
  if (!normalizedValue || normalizedValue === ".") {
    return contentPath;
  }
  return import_node_path.default.join(contentPath, normalizedValue);
}
function getStoredItemPath(item, fieldName = "path") {
  if (!item) {
    return null;
  }
  if (typeof item.getDataValue === "function") {
    return item.getDataValue(fieldName);
  }
  return item[fieldName] ?? null;
}
function serializeVaultItem(item) {
  if (!item) {
    return item;
  }
  const plainItem = typeof item.get === "function" ? item.get({ plain: true }) : { ...item };
  delete plainItem.repo;
  if ("path" in plainItem) {
    plainItem.path = toVaultAbsolutePath(
      getStoredItemPath(item, "path") ?? plainItem.path
    );
  }
  if (!("relative_path" in plainItem) && "path" in plainItem) {
    plainItem.relative_path = toVaultRelativePath(
      getStoredItemPath(item, "path") ?? plainItem.path
    );
  }
  if ("folder_note_path" in plainItem) {
    plainItem.folder_note_path = toVaultAbsolutePath(
      getStoredItemPath(item, "folder_note_path") ?? plainItem.folder_note_path
    );
  }
  if (!("relative_folder_note_path" in plainItem) && "folder_note_path" in plainItem) {
    plainItem.relative_folder_note_path = toVaultRelativePath(
      getStoredItemPath(item, "folder_note_path") ?? plainItem.folder_note_path
    );
  }
  if ("trashPath" in plainItem && plainItem.trashPath != null) {
    plainItem.trashPath = import_node_path.default.normalize(String(plainItem.trashPath));
  }
  return plainItem;
}

// ../nexus-plugins/Books/src/constants.js
var BOOKS_ENGINE_ID = "nexus.books.document";
var BOOK_READING_STATUSES = [
  "pending",
  "reading",
  "finished",
  "abandoned"
];

// ../nexus-plugins/Books/src/plugin-settings.js
var BOOKS_SETTINGS_DEFAULTS = Object.freeze({
  engineAssignments: []
});
function normalizeBooksSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...BOOKS_SETTINGS_DEFAULTS
    };
  }
  return {
    ...BOOKS_SETTINGS_DEFAULTS,
    ...value
  };
}
function normalizeRelativePath2(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+/g, "/").replace(/\/$/, "").trim();
}
function readBooksEngineAssignments(settingsValue) {
  const normalizedSettings = normalizeBooksSettings(settingsValue);
  const assignments = Array.isArray(normalizedSettings.engineAssignments) ? normalizedSettings.engineAssignments : [];
  return assignments.filter((assignment) => assignment?.engineId === BOOKS_ENGINE_ID).map((assignment) => ({
    engineId: BOOKS_ENGINE_ID,
    rootPath: normalizeRelativePath2(assignment.rootPath),
    recursive: typeof assignment.recursive === "boolean" ? assignment.recursive : true
  })).filter((assignment) => assignment.rootPath);
}

// ../nexus-plugins/Books/src/book-indexing.ts
var SUPPORTED_BOOK_EXTENSIONS = /* @__PURE__ */ new Set(["pdf"]);
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function getFileName(filePath) {
  return String(filePath || "").split(/[\\/]/).pop() || "Documento";
}
function getFileExtension(filePath) {
  const fileName = getFileName(filePath);
  if (!fileName.includes(".")) {
    return "";
  }
  return fileName.split(".").pop()?.trim().toLowerCase() || "";
}
function getBaseName(filePath) {
  const fileName = getFileName(filePath);
  const extension = import_node_path2.default.extname(fileName);
  return extension ? fileName.slice(0, -extension.length) : fileName;
}
function normalizeOptionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
function normalizeReadingStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return BOOK_READING_STATUSES.includes(normalized) ? normalized : "pending";
}
function normalizeProgressPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(numericValue)));
}
function normalizeCoverPreview(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
function decodePdfEscapedString(value) {
  if (!value) {
    return "";
  }
  return value.replace(/\\\r?\n/g, "").replace(
    /\\([0-7]{1,3})/g,
    (_, octalValue) => String.fromCharCode(Number.parseInt(octalValue, 8))
  ).replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "	").replace(/\\b/g, "\b").replace(/\\f/g, "\f").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\");
}
function decodePdfHexString(value) {
  const normalized = String(value || "").replace(/[^a-f0-9]/gi, "");
  if (!normalized) {
    return "";
  }
  const evenLengthHex = normalized.length % 2 === 0 ? normalized : `${normalized}0`;
  const buffer = Buffer.from(evenLengthHex, "hex");
  if (buffer.length >= 2 && buffer[0] === 254 && buffer[1] === 255) {
    let result = "";
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      result += String.fromCharCode(buffer.readUInt16BE(index));
    }
    return result.replace(/\u0000/g, "").trim();
  }
  return buffer.toString("utf8").replace(/\u0000/g, "").trim();
}
function decodeXmlEntities(value) {
  return String(value || "").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function extractPdfInfoField(pdfText, fieldName) {
  const literalPattern = new RegExp(
    `/${fieldName}\\s*\\(((?:\\\\.|[^\\\\)])*)\\)`,
    "i"
  );
  const hexPattern = new RegExp(`/${fieldName}\\s*<([0-9a-f\\s]+)>`, "i");
  const literalMatch = pdfText.match(literalPattern);
  if (literalMatch?.[1]) {
    return normalizeOptionalText(decodePdfEscapedString(literalMatch[1]));
  }
  const hexMatch = pdfText.match(hexPattern);
  if (hexMatch?.[1]) {
    return normalizeOptionalText(decodePdfHexString(hexMatch[1]));
  }
  return null;
}
function extractXmpField(pdfText, tagName) {
  const tagPattern = new RegExp(
    `<${tagName}\\b[^>]*>[\\s\\S]*?<rdf:li[^>]*>([\\s\\S]*?)<\\/rdf:li>[\\s\\S]*?<\\/${tagName}>`,
    "i"
  );
  const match = pdfText.match(tagPattern);
  if (!match?.[1]) {
    return null;
  }
  const cleanedValue = decodeXmlEntities(match[1].replace(/<[^>]+>/g, " "));
  return normalizeOptionalText(cleanedValue);
}
function normalizeJoinedBookRow(row) {
  if (!row?.item_id) {
    return null;
  }
  const itemHash = normalizeOptionalText(row.item_hash);
  const coverPreview = normalizeCoverPreview(row.cover_preview);
  const coverPreviewSourceHash = normalizeOptionalText(row.cover_preview_source_hash);
  const hasFreshCoverPreview = Boolean(coverPreview) && (!itemHash || coverPreviewSourceHash === itemHash);
  return {
    itemId: String(row.item_id),
    title: String(row.title || "").trim() || "Documento",
    author: normalizeOptionalText(row.author),
    fileFormat: String(row.file_format || "pdf").trim().toLowerCase() || "pdf",
    addedAt: String(row.added_at || nowIso()),
    lastOpenedAt: row.last_opened_at ? String(row.last_opened_at) : null,
    readingStatus: normalizeReadingStatus(row.reading_status),
    progressPercent: normalizeProgressPercent(row.progress_percent),
    coverPreview: hasFreshCoverPreview ? coverPreview : null,
    coverPreviewSourceHash: hasFreshCoverPreview ? coverPreviewSourceHash : null,
    itemHash,
    item: row.item_path ? serializeVaultItem({
      id: row.item_id,
      name: row.item_name,
      path: row.item_path,
      relative_path: row.item_relative_path,
      type: row.item_type || "file",
      extension: row.item_extension ?? null,
      parentId: row.item_parent_id ?? null,
      icon: row.item_icon ?? "file",
      color: row.item_color ?? null,
      hidden: Boolean(row.item_hidden),
      deleted: Boolean(row.item_deleted)
    }) : null
  };
}
function getSearchBody(book) {
  const statusLabel = book.readingStatus === "reading" ? "leyendo" : book.readingStatus === "finished" ? "leido" : book.readingStatus === "abandoned" ? "abandonado" : "pendiente";
  return [
    book.title,
    book.author,
    book.readingStatus,
    statusLabel,
    `progreso ${book.progressPercent}`,
    book.fileFormat
  ].filter(Boolean).join("\n");
}
async function parsePdfMetadata(filePath) {
  try {
    const buffer = await import_promises.default.readFile(filePath);
    const pdfText = buffer.toString("latin1");
    const title = extractXmpField(pdfText, "dc:title") || extractPdfInfoField(pdfText, "Title");
    const author = extractXmpField(pdfText, "dc:creator") || extractPdfInfoField(pdfText, "Author");
    return {
      title,
      author
    };
  } catch (error) {
    console.warn("[books] No se pudo leer metadata PDF:", filePath, error);
    return {
      title: null,
      author: null
    };
  }
}
function getContentRelativePath(filePath, vaultContentPath) {
  const normalizedPath = String(filePath || "").replace(/\\/g, "/");
  const normalizedContentPath = String(vaultContentPath || "").replace(/\\/g, "/").replace(/\/$/, "");
  if (!normalizedPath || !normalizedContentPath) {
    return "";
  }
  const contentPrefix = `${normalizedContentPath}/`;
  if (normalizedPath.startsWith(contentPrefix)) {
    return normalizedPath.slice(contentPrefix.length);
  }
  const contentMatch = normalizedPath.match(/(?:^|\/)content\/(.+)$/);
  return contentMatch?.[1] || "";
}
function normalizeRelativePath3(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+/g, "/").replace(/\/$/, "").trim();
}
function isSupportedBookItem(item) {
  if (item?.type !== "file") {
    return false;
  }
  return SUPPORTED_BOOK_EXTENSIONS.has(
    getFileExtension(String(item?.path || item?.name || ""))
  );
}
async function isBooksAssignedItem(ctx, item) {
  if (!isSupportedBookItem(item)) {
    return false;
  }
  const settings = await ctx.settings.get();
  const assignments = readBooksEngineAssignments(settings);
  const itemRelativePath = normalizeRelativePath3(
    getContentRelativePath(String(item?.path || ""), ctx.vault.contentPath)
  );
  if (!itemRelativePath) {
    return false;
  }
  return assignments.some((assignment) => {
    const assignmentRoot = normalizeRelativePath3(String(assignment.rootPath || ""));
    if (!assignmentRoot) {
      return false;
    }
    if (itemRelativePath === assignmentRoot) {
      return true;
    }
    if (!itemRelativePath.startsWith(`${assignmentRoot}/`)) {
      return false;
    }
    if (assignment.recursive) {
      return true;
    }
    const relativeSuffix = itemRelativePath.slice(assignmentRoot.length + 1);
    return !relativeSuffix.includes("/");
  });
}
function ensureBooksSchema(sqlite) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS books_items (
      item_id TEXT PRIMARY KEY NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author TEXT,
      file_format TEXT NOT NULL,
      added_at TEXT NOT NULL,
      last_opened_at TEXT,
      reading_status TEXT NOT NULL DEFAULT 'pending',
      progress_percent INTEGER NOT NULL DEFAULT 0,
      cover_preview TEXT,
      cover_preview_source_hash TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_books_items_status ON books_items (reading_status);
    CREATE INDEX IF NOT EXISTS idx_books_items_last_opened_at ON books_items (last_opened_at);
  `);
  const existingColumns = new Set(
    sqlite.prepare("PRAGMA table_info(books_items)").all().map((column) => String(column?.name || "").trim()).filter(Boolean)
  );
  if (!existingColumns.has("cover_preview")) {
    sqlite.prepare("ALTER TABLE books_items ADD COLUMN cover_preview TEXT").run();
  }
  if (!existingColumns.has("cover_preview_source_hash")) {
    sqlite.prepare("ALTER TABLE books_items ADD COLUMN cover_preview_source_hash TEXT").run();
  }
}
function findBookByItemIdSync(sqlite, itemId) {
  return normalizeJoinedBookRow(
    sqlite.prepare(`
      SELECT
        b.item_id,
        b.title,
        b.author,
        b.file_format,
        b.added_at,
        b.last_opened_at,
        b.reading_status,
        b.progress_percent,
        b.cover_preview,
        b.cover_preview_source_hash,
        i.id AS item_id,
        i.name AS item_name,
        i.path AS item_path,
        i.relative_path AS item_relative_path,
        i.type AS item_type,
        i.extension AS item_extension,
        i.parentId AS item_parent_id,
        i.icon AS item_icon,
        i.color AS item_color,
        i.hidden AS item_hidden,
        i.deleted AS item_deleted,
        i.hash AS item_hash
      FROM books_items b
      INNER JOIN items i ON i.id = b.item_id
      WHERE b.item_id = ?
      LIMIT 1
    `).get(itemId)
  );
}
function listBooksSync(sqlite) {
  return sqlite.prepare(`
    SELECT
      b.item_id,
      b.title,
      b.author,
      b.file_format,
      b.added_at,
      b.last_opened_at,
      b.reading_status,
      b.progress_percent,
      b.cover_preview,
      b.cover_preview_source_hash,
      i.id AS item_id,
      i.name AS item_name,
      i.path AS item_path,
      i.relative_path AS item_relative_path,
      i.type AS item_type,
      i.extension AS item_extension,
      i.parentId AS item_parent_id,
      i.icon AS item_icon,
      i.color AS item_color,
      i.hidden AS item_hidden,
      i.deleted AS item_deleted,
      i.hash AS item_hash
    FROM books_items b
    INNER JOIN items i ON i.id = b.item_id
    WHERE COALESCE(i.deleted, 0) = 0
    ORDER BY
      CASE WHEN b.last_opened_at IS NULL THEN 1 ELSE 0 END ASC,
      b.last_opened_at DESC,
      b.added_at DESC,
      b.title COLLATE NOCASE ASC
  `).all().map((row) => normalizeJoinedBookRow(row)).filter(Boolean);
}
function upsertBookSync(sqlite, payload) {
  sqlite.prepare(`
    INSERT INTO books_items (
      item_id, title, author, file_format, added_at, last_opened_at, reading_status, progress_percent,
      cover_preview, cover_preview_source_hash
    ) VALUES (
      @item_id, @title, @author, @file_format, @added_at, @last_opened_at, @reading_status, @progress_percent,
      @cover_preview, @cover_preview_source_hash
    )
    ON CONFLICT(item_id) DO UPDATE SET
      title = excluded.title,
      author = excluded.author,
      file_format = excluded.file_format,
      added_at = excluded.added_at,
      last_opened_at = excluded.last_opened_at,
      reading_status = excluded.reading_status,
      progress_percent = excluded.progress_percent,
      cover_preview = excluded.cover_preview,
      cover_preview_source_hash = excluded.cover_preview_source_hash
  `).run({
    item_id: payload.itemId,
    title: payload.title,
    author: payload.author,
    file_format: payload.fileFormat,
    added_at: payload.addedAt,
    last_opened_at: payload.lastOpenedAt,
    reading_status: normalizeReadingStatus(payload.readingStatus),
    progress_percent: normalizeProgressPercent(payload.progressPercent),
    cover_preview: normalizeCoverPreview(payload.coverPreview),
    cover_preview_source_hash: normalizeOptionalText(payload.coverPreviewSourceHash)
  });
}
function deleteBookSync(sqlite, itemId) {
  sqlite.prepare("DELETE FROM books_items WHERE item_id = ?").run(itemId);
}
async function syncBookSearchDocument(ctx, book, item) {
  await ctx.requireRepositories().search.replaceDocument({
    itemId: book.itemId,
    kind: "item",
    title: book.title,
    subtitle: book.author || null,
    path: String(item?.path || ""),
    body: getSearchBody(book),
    sourceHash: [
      String(item?.hash || ""),
      book.title,
      book.author || "",
      book.readingStatus,
      String(book.progressPercent)
    ].join(":"),
    metadata: {
      pluginId: "nexus.books",
      domain: "book",
      fileFormat: book.fileFormat,
      readingStatus: book.readingStatus,
      progressPercent: book.progressPercent,
      engineId: BOOKS_ENGINE_ID
    }
  });
}
async function deleteBookArtifacts(ctx, itemId) {
  const repositories = ctx.requireRepositories();
  deleteBookSync(repositories.sqlite, itemId);
  await repositories.search.deleteForItem(itemId);
}
async function ensureBookRecord(ctx, item, {
  structuralChanged = true,
  contentChanged = true,
  markOpened = false
} = {}) {
  const repositories = ctx.requireRepositories();
  const itemId = String(item?.id || "");
  if (!itemId || !isSupportedBookItem(item) || !await isBooksAssignedItem(ctx, item)) {
    if (itemId) {
      await deleteBookArtifacts(ctx, itemId);
    }
    return null;
  }
  const existing = findBookByItemIdSync(repositories.sqlite, itemId);
  const shouldRefreshMetadata = !existing || structuralChanged || contentChanged;
  const extractedMetadata = shouldRefreshMetadata ? await parsePdfMetadata(String(item?.path || "")) : { title: null, author: null };
  const addedAt = existing?.addedAt || nowIso();
  const itemHash = normalizeOptionalText(item?.hash);
  const shouldResetCoverPreview = contentChanged || Boolean(existing?.coverPreview) && Boolean(itemHash) && existing?.coverPreviewSourceHash !== itemHash;
  const nextBook = {
    itemId,
    title: extractedMetadata.title || existing?.title || getBaseName(String(item?.path || item?.name || "")) || "Documento",
    author: extractedMetadata.author ?? existing?.author ?? null,
    fileFormat: getFileExtension(String(item?.path || "")) || existing?.fileFormat || "pdf",
    addedAt,
    lastOpenedAt: markOpened ? nowIso() : existing?.lastOpenedAt ?? null,
    readingStatus: existing?.readingStatus || "pending",
    progressPercent: existing?.progressPercent ?? 0,
    coverPreview: shouldResetCoverPreview ? null : existing?.coverPreview ?? null,
    coverPreviewSourceHash: shouldResetCoverPreview ? null : existing?.coverPreviewSourceHash ?? null,
    itemHash
  };
  upsertBookSync(repositories.sqlite, nextBook);
  const persisted = findBookByItemIdSync(repositories.sqlite, itemId);
  if (persisted) {
    await syncBookSearchDocument(ctx, persisted, item);
  }
  return persisted;
}
async function listBooks(ctx) {
  return listBooksSync(ctx.requireRepositories().sqlite);
}
async function getBookByItemId(ctx, itemId, { markOpened = false } = {}) {
  const repositories = ctx.requireRepositories();
  const item = await repositories.items.findById(itemId);
  if (!item) {
    throw new Error("Item no encontrado.");
  }
  if (!isSupportedBookItem(item)) {
    throw new Error("El item solicitado no es un PDF soportado por Books.");
  }
  if (!await isBooksAssignedItem(ctx, item)) {
    throw new Error("El item solicitado no pertenece a carpetas reclamadas por Books.");
  }
  return ensureBookRecord(ctx, item, {
    structuralChanged: false,
    contentChanged: false,
    markOpened
  });
}
async function updateBookState(ctx, itemId, patch) {
  const repositories = ctx.requireRepositories();
  const item = await repositories.items.findById(itemId);
  if (!item) {
    throw new Error("Item no encontrado.");
  }
  const currentBook = await ensureBookRecord(ctx, item, {
    structuralChanged: false,
    contentChanged: false,
    markOpened: false
  }) ?? null;
  if (!currentBook) {
    throw new Error("No se pudo inicializar el registro del libro.");
  }
  const nextBook = {
    ...currentBook,
    readingStatus: patch.readingStatus != null ? normalizeReadingStatus(patch.readingStatus) : currentBook.readingStatus,
    progressPercent: patch.progressPercent != null ? normalizeProgressPercent(patch.progressPercent) : currentBook.progressPercent,
    lastOpenedAt: patch.lastOpenedAt !== void 0 ? patch.lastOpenedAt : currentBook.lastOpenedAt
  };
  upsertBookSync(repositories.sqlite, nextBook);
  const persisted = findBookByItemIdSync(repositories.sqlite, itemId);
  if (persisted) {
    await syncBookSearchDocument(ctx, persisted, item);
  }
  return persisted;
}
async function updateBookCoverPreview(ctx, itemId, payload) {
  const repositories = ctx.requireRepositories();
  const item = await repositories.items.findById(itemId);
  if (!item) {
    throw new Error("Item no encontrado.");
  }
  const currentBook = await ensureBookRecord(ctx, item, {
    structuralChanged: false,
    contentChanged: false,
    markOpened: false
  }) ?? null;
  if (!currentBook) {
    throw new Error("No se pudo inicializar el registro del libro.");
  }
  const coverPreview = normalizeCoverPreview(payload.coverPreview);
  const itemHash = normalizeOptionalText(item?.hash);
  const nextBook = {
    ...currentBook,
    coverPreview,
    coverPreviewSourceHash: coverPreview ? itemHash : null,
    itemHash
  };
  upsertBookSync(repositories.sqlite, nextBook);
  return findBookByItemIdSync(repositories.sqlite, itemId);
}
async function markBookOpened(ctx, itemId) {
  return updateBookState(ctx, itemId, {
    lastOpenedAt: nowIso()
  });
}
async function reconcileBooksAssignments(ctx) {
  const repositories = ctx.requireRepositories();
  const items = await repositories.items.findAll();
  for (const item of items) {
    if (!isSupportedBookItem(item)) {
      continue;
    }
    if (!await isBooksAssignedItem(ctx, item)) {
      await deleteBookArtifacts(ctx, String(item.id));
      continue;
    }
    await ensureBookRecord(ctx, item, {
      structuralChanged: true,
      contentChanged: true,
      markOpened: false
    });
  }
}
function registerBooksSchema(ctx) {
  ensureBooksSchema(ctx.requireRepositories().sqlite);
}

// ../nexus-plugins/Books/src/cover-preview-renderer.ts
var import_node_path4 = __toESM(require("node:path"));
var import_node_url = require("node:url");

// src/shared/electron.ts
function hasElectronApp(value) {
  return Boolean(value && typeof value === "object" && "app" in value);
}
var processElectronMain = process.__electronMain;
var globalElectronMain = globalThis.__electronMain;
var electronMain = (hasElectronApp(processElectronMain) ? processElectronMain : null) ?? (hasElectronApp(globalElectronMain) ? globalElectronMain : null) ?? (processElectronMain && typeof processElectronMain === "object" && "default" in processElectronMain && hasElectronApp(processElectronMain.default) ? processElectronMain.default : null) ?? (globalElectronMain && typeof globalElectronMain === "object" && "default" in globalElectronMain && hasElectronApp(globalElectronMain.default) ? globalElectronMain.default : null);
if (!electronMain) {
  throw new Error("Electron main API no estA disponible en el runtime ESM");
}
var electron = electronMain;

// src/shared/runtime-paths.ts
var import_node_path3 = __toESM(require("node:path"), 1);
function getProjectRootPath() {
  if (electron.app.isPackaged) {
    return electron.app.getAppPath();
  }
  return process.cwd();
}
function resolveFromProjectRoot(...segments) {
  return import_node_path3.default.join(getProjectRootPath(), ...segments);
}
function getNodeModulesPath() {
  return resolveFromProjectRoot("node_modules");
}

// ../nexus-plugins/Books/src/cover-preview-renderer.ts
var { BrowserWindow } = electron;
var COVER_PREVIEW_WIDTH = 220;
var COVER_PREVIEW_HEIGHT = 320;
var RENDER_TIMEOUT_MS = 2e4;
var RENDERER_BOOTSTRAP_URL = `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Books PDF Cover Renderer</title>
    <style>
      html, body {
        margin: 0;
        background: #ffffff;
      }
    </style>
  </head>
  <body></body>
</html>`)} `;
function createTimeoutError(filePath) {
  return new Error(`[books] Timeout renderizando portada PDF en backend: ${filePath}`);
}
function withTimeout(promise, timeoutMs, filePath) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(createTimeoutError(filePath));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}
function createRenderScript(filePath, pdfModuleUrl, workerModuleUrl, wasmUrl) {
  return `(async () => {
    const { readFile } = require("node:fs/promises");
    const { GlobalWorkerOptions, VerbosityLevel, getDocument } = await import(${JSON.stringify(pdfModuleUrl)});
    const workerModuleUrl = ${JSON.stringify(workerModuleUrl)};
    const wasmUrl = ${JSON.stringify(wasmUrl)};
    const filePath = ${JSON.stringify(filePath)};
    const targetWidth = ${COVER_PREVIEW_WIDTH};

    GlobalWorkerOptions.workerSrc = workerModuleUrl;
    globalThis.__booksPdfWorkerModule ||= await import(workerModuleUrl);

    function createCoverPreviewDataUrl(sourceCanvas) {
      const sourceWidth = Math.max(1, sourceCanvas.width || 1);
      const sourceHeight = Math.max(1, sourceCanvas.height || 1);
      const scale = Math.min(1, targetWidth / sourceWidth);

      if (scale >= 0.999) {
        return sourceCanvas.toDataURL("image/jpeg", 0.76);
      }

      const thumbnailCanvas = document.createElement("canvas");
      thumbnailCanvas.width = Math.max(1, Math.round(sourceWidth * scale));
      thumbnailCanvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const thumbnailContext = thumbnailCanvas.getContext("2d", { alpha: false });

      if (!thumbnailContext) {
        return sourceCanvas.toDataURL("image/jpeg", 0.76);
      }

      thumbnailContext.fillStyle = "#ffffff";
      thumbnailContext.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      thumbnailContext.drawImage(sourceCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      return thumbnailCanvas.toDataURL("image/jpeg", 0.76);
    }

    let loadingTask = null;
    let pdfDocument = null;
    let renderTask = null;

    try {
      const fileBuffer = await readFile(filePath);
      loadingTask = getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
        wasmUrl,
        verbosity: VerbosityLevel.ERRORS,
      });
      pdfDocument = await loadingTask.promise;

      const page = await pdfDocument.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({
        scale: targetWidth / Math.max(baseViewport.width, 1),
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(renderViewport.width));
      canvas.height = Math.max(1, Math.round(renderViewport.height));

      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("No se pudo abrir el contexto 2D para la portada backend.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      renderTask = page.render({
        canvasContext: context,
        viewport: renderViewport,
      });
      await renderTask.promise;
      page.cleanup();

      return createCoverPreviewDataUrl(canvas);
    } finally {
      if (renderTask?.cancel) {
        try {
          renderTask.cancel();
        } catch {}
      }

      if (pdfDocument?.destroy) {
        try {
          await pdfDocument.destroy();
        } catch {}
      }

      if (loadingTask?.destroy) {
        try {
          await loadingTask.destroy();
        } catch {}
      }
    }
  })();`;
}
function createPdfCoverPreviewRenderer() {
  let renderWindow = null;
  let renderWindowReady = null;
  let renderQueue = Promise.resolve();
  const nodeModulesPath = getNodeModulesPath();
  const pdfModuleUrl = (0, import_node_url.pathToFileURL)(
    import_node_path4.default.join(nodeModulesPath, "pdfjs-dist", "legacy", "build", "pdf.mjs")
  ).href;
  const workerModuleUrl = (0, import_node_url.pathToFileURL)(
    import_node_path4.default.join(nodeModulesPath, "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")
  ).href;
  const wasmUrl = `${(0, import_node_url.pathToFileURL)(import_node_path4.default.join(nodeModulesPath, "pdfjs-dist", "wasm")).href}/`;
  const resetWindow = async () => {
    const windowToClose = renderWindow;
    renderWindow = null;
    renderWindowReady = null;
    if (windowToClose && !windowToClose.isDestroyed()) {
      windowToClose.destroy();
    }
  };
  const ensureWindow = async () => {
    if (renderWindow && !renderWindow.isDestroyed()) {
      return renderWindow;
    }
    if (renderWindowReady) {
      return renderWindowReady;
    }
    renderWindowReady = (async () => {
      renderWindow = new BrowserWindow({
        show: false,
        width: COVER_PREVIEW_WIDTH,
        height: COVER_PREVIEW_HEIGHT,
        useContentSize: true,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          backgroundThrottling: false
        }
      });
      renderWindow.on("closed", () => {
        renderWindow = null;
        renderWindowReady = null;
      });
      await renderWindow.loadURL(RENDERER_BOOTSTRAP_URL.trim());
      return renderWindow;
    })();
    try {
      return await renderWindowReady;
    } catch (error) {
      await resetWindow();
      throw error;
    }
  };
  const renderOnce = async (filePath) => {
    const browserWindow = await ensureWindow();
    const script = createRenderScript(filePath, pdfModuleUrl, workerModuleUrl, wasmUrl);
    const previewDataUrl = await withTimeout(
      browserWindow.webContents.executeJavaScript(script, true),
      RENDER_TIMEOUT_MS,
      filePath
    );
    return typeof previewDataUrl === "string" ? previewDataUrl.trim() : "";
  };
  const render = async (filePath) => {
    const normalizedPath = String(filePath || "").trim();
    if (!normalizedPath) {
      return "";
    }
    const performRender = async () => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          return await renderOnce(normalizedPath);
        } catch (error) {
          await resetWindow();
          if (attempt === 1) {
            throw error;
          }
        }
      }
      return "";
    };
    const queuedRender = renderQueue.then(performRender, performRender);
    renderQueue = queuedRender.then(
      () => void 0,
      () => void 0
    );
    return queuedRender;
  };
  return {
    render,
    async stop() {
      renderQueue = Promise.resolve();
      await resetWindow();
    }
  };
}

// ../nexus-plugins/Books/src/backend.ts
var COVER_PREVIEW_WARM_CONCURRENCY = 2;
var COVER_PREVIEW_LIST_PRIME_COUNT = 4;
var activeCoverPreviewWarmQueue = null;
function createCoverPreviewWarmQueue(ctx) {
  let stopped = false;
  let activeCount = 0;
  const queuedItemIds = [];
  const skippedItemIds = /* @__PURE__ */ new Set();
  const pdfCoverPreviewRenderer = createPdfCoverPreviewRenderer();
  const pendingPromises = /* @__PURE__ */ new Map();
  const rememberWarmFailure = (itemId, filePath, error) => {
    skippedItemIds.add(itemId);
    console.warn("[books] No se pudo precalentar la portada en backend:", {
      itemId,
      filePath,
      error
    });
  };
  const generateCoverPreview = async (itemId) => {
    if (stopped || !itemId || skippedItemIds.has(itemId)) {
      return false;
    }
    const item = await ctx.requireRepositories().items.findById(itemId);
    if (!item || item.type !== "file") {
      return false;
    }
    const book = await ensureBookRecord(ctx, item, {
      structuralChanged: false,
      contentChanged: false,
      markOpened: false
    });
    if (!book || book.coverPreview) {
      return Boolean(book?.coverPreview);
    }
    const filePath = String(item.path || "");
    if (!filePath) {
      return false;
    }
    try {
      const coverPreview = await pdfCoverPreviewRenderer.render(filePath);
      if (!coverPreview) {
        skippedItemIds.add(itemId);
        return false;
      }
      await updateBookCoverPreview(ctx, itemId, {
        coverPreview
      });
      return true;
    } catch (error) {
      rememberWarmFailure(itemId, filePath, error);
      return false;
    }
  };
  const pump = () => {
    if (stopped) {
      return;
    }
    while (activeCount < COVER_PREVIEW_WARM_CONCURRENCY && queuedItemIds.length) {
      const itemId = queuedItemIds.shift();
      if (!itemId) {
        continue;
      }
      const pending = pendingPromises.get(itemId);
      if (!pending) {
        continue;
      }
      activeCount += 1;
      void generateCoverPreview(itemId).catch((error) => {
        console.warn("[books] Error en la cola de precalentado de portadas:", error);
        return false;
      }).then((result) => {
        pending.resolve(Boolean(result));
      }).finally(() => {
        pendingPromises.delete(itemId);
        activeCount = Math.max(0, activeCount - 1);
        pump();
      });
    }
  };
  return {
    queue(itemId) {
      const normalizedItemId = String(itemId || "");
      if (!normalizedItemId || stopped || skippedItemIds.has(normalizedItemId)) {
        return Promise.resolve(false);
      }
      const existingPending = pendingPromises.get(normalizedItemId);
      if (existingPending) {
        return existingPending.promise;
      }
      let resolvePending;
      const promise = new Promise((resolve) => {
        resolvePending = resolve;
      });
      pendingPromises.set(normalizedItemId, {
        promise,
        resolve: resolvePending
      });
      queuedItemIds.push(normalizedItemId);
      pump();
      return promise;
    },
    queueMany(itemIds) {
      for (const itemId of itemIds) {
        void this.queue(itemId);
      }
    },
    async prime(itemIds) {
      const normalizedIds = itemIds.map((itemId) => String(itemId || "")).filter(Boolean);
      if (!normalizedIds.length || stopped) {
        return;
      }
      await Promise.all(normalizedIds.map((itemId) => this.queue(itemId)));
    },
    async stop() {
      stopped = true;
      queuedItemIds.length = 0;
      skippedItemIds.clear();
      for (const pending of pendingPromises.values()) {
        pending.resolve(false);
      }
      pendingPromises.clear();
      await pdfCoverPreviewRenderer.stop();
    },
    invalidate(itemId) {
      const normalizedItemId = String(itemId || "");
      if (!normalizedItemId) {
        return;
      }
      skippedItemIds.delete(normalizedItemId);
    }
  };
}
function createSuccess(data) {
  return {
    ok: true,
    data
  };
}
function createError(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
var booksPlugin = {
  ensureSchema(ctx) {
    registerBooksSchema(ctx);
  },
  activate(ctx) {
    const coverPreviewWarmQueue = createCoverPreviewWarmQueue(ctx);
    activeCoverPreviewWarmQueue = coverPreviewWarmQueue;
    ctx.registerCleanup(() => {
      if (activeCoverPreviewWarmQueue === coverPreviewWarmQueue) {
        activeCoverPreviewWarmQueue = null;
      }
      void coverPreviewWarmQueue.stop();
    });
    ctx.registerIpc("books:list", async () => {
      try {
        const initialBooks = await listBooks(ctx);
        const uncachedItemIds = initialBooks.filter((book) => !book?.coverPreview).map((book) => String(book?.itemId || "")).filter(Boolean);
        if (uncachedItemIds.length) {
          void coverPreviewWarmQueue.prime(uncachedItemIds.slice(0, COVER_PREVIEW_LIST_PRIME_COUNT)).catch((error) => {
            console.warn("[books] Fallo el precalentado prioritario de portadas:", error);
          });
          coverPreviewWarmQueue.queueMany(
            uncachedItemIds.slice(COVER_PREVIEW_LIST_PRIME_COUNT)
          );
        }
        return createSuccess({
          books: initialBooks
        });
      } catch (error) {
        return createError(error, "No se pudo listar la biblioteca Books.");
      }
    });
    ctx.registerIpc("books:get-cover-preview", async (_event, payload) => {
      try {
        const itemId = typeof payload === "string" ? payload : String(payload?.itemId || "");
        if (!itemId) {
          throw new Error("Falta itemId.");
        }
        const book = await getBookByItemId(ctx, itemId, { markOpened: false });
        if (!book?.coverPreview) {
          void coverPreviewWarmQueue.queue(itemId);
        }
        return createSuccess({
          itemId,
          coverPreview: book?.coverPreview || null
        });
      } catch (error) {
        return createError(error, "No se pudo consultar la portada cacheada del libro.");
      }
    });
    ctx.registerIpc("books:getByItemId", async (_event, payload) => {
      try {
        const itemId = typeof payload === "string" ? payload : String(payload?.itemId || "");
        const markOpened = typeof payload === "object" && payload != null ? Boolean(payload.markOpened) : false;
        if (!itemId) {
          throw new Error("Falta itemId.");
        }
        return createSuccess({
          book: await getBookByItemId(ctx, itemId, { markOpened })
        });
      } catch (error) {
        return createError(error, "No se pudo cargar el libro.");
      }
    });
    ctx.registerIpc("books:update", async (_event, payload) => {
      try {
        const itemId = String(payload?.itemId || "");
        if (!itemId) {
          throw new Error("Falta itemId.");
        }
        return createSuccess({
          book: await updateBookState(ctx, itemId, {
            readingStatus: payload?.readingStatus,
            progressPercent: payload?.progressPercent
          })
        });
      } catch (error) {
        return createError(error, "No se pudo actualizar el libro.");
      }
    });
    ctx.registerIpc("books:mark-opened", async (_event, payload) => {
      try {
        const itemId = typeof payload === "string" ? payload : String(payload?.itemId || "");
        if (!itemId) {
          throw new Error("Falta itemId.");
        }
        return createSuccess({
          book: await markBookOpened(ctx, itemId)
        });
      } catch (error) {
        return createError(error, "No se pudo registrar la apertura del libro.");
      }
    });
    let reconcileQueue = Promise.resolve();
    ctx.settings.subscribe(
      () => {
        reconcileQueue = reconcileQueue.then(() => reconcileBooksAssignments(ctx)).catch((error) => {
          console.error("[books] Error reconciliando assignments live:", error);
        });
      },
      { emitCurrent: true }
    );
  },
  async onItemSync(ctx, payload) {
    const book = await ensureBookRecord(ctx, payload.item, {
      structuralChanged: payload.structuralChanged,
      contentChanged: payload.contentChanged,
      markOpened: false
    });
    if (book && !book.coverPreview) {
      const itemId = String(book.itemId || "");
      if (itemId) {
        if (payload.structuralChanged || payload.contentChanged) {
          activeCoverPreviewWarmQueue?.invalidate(itemId);
        }
        activeCoverPreviewWarmQueue?.queue(itemId);
      }
    }
  }
};
var backend_default = booksPlugin;
//# sourceMappingURL=backend.cjs.map
