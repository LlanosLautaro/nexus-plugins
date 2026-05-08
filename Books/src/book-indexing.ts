import fs from "node:fs/promises";
import path from "node:path";
import { serializeVaultItem } from "../../../nexus-backend/src/backend/vault-runtime/file-system/path-utils.js";
import { BOOKS_ENGINE_ID, BOOK_READING_STATUSES } from "./constants.js";
import { readBooksEngineAssignments } from "./plugin-settings.js";
import type { NexusBackendPluginContext } from "../../../nexus-backend/src/plugins/types.ts";

const SUPPORTED_BOOK_EXTENSIONS = new Set(["pdf"]);

type BookRecord = {
  itemId: string;
  title: string;
  author: string | null;
  fileFormat: string;
  addedAt: string;
  lastOpenedAt: string | null;
  readingStatus: string;
  progressPercent: number;
  coverPreview: string | null;
  coverPreviewSourceHash: string | null;
  itemHash: string | null;
  item?: any;
};

function nowIso() {
  return new Date().toISOString();
}

function getFileName(filePath: string) {
  return String(filePath || "").split(/[\\/]/).pop() || "Documento";
}

function getFileExtension(filePath: string) {
  const fileName = getFileName(filePath);

  if (!fileName.includes(".")) {
    return "";
  }

  return fileName.split(".").pop()?.trim().toLowerCase() || "";
}

function getBaseName(filePath: string) {
  const fileName = getFileName(filePath);
  const extension = path.extname(fileName);
  return extension ? fileName.slice(0, -extension.length) : fileName;
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeReadingStatus(value: unknown) {
  const normalized = String(value || "").trim().toLowerCase();
  return BOOK_READING_STATUSES.includes(normalized) ? normalized : "pending";
}

function normalizeProgressPercent(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(numericValue)));
}

function normalizeCoverPreview(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function decodePdfEscapedString(value: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/\\\r?\n/g, "")
    .replace(/\\([0-7]{1,3})/g, (_, octalValue) =>
      String.fromCharCode(Number.parseInt(octalValue, 8)),
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

function decodePdfHexString(value: string) {
  const normalized = String(value || "").replace(/[^a-f0-9]/gi, "");

  if (!normalized) {
    return "";
  }

  const evenLengthHex = normalized.length % 2 === 0 ? normalized : `${normalized}0`;
  const buffer = Buffer.from(evenLengthHex, "hex");

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    let result = "";

    for (let index = 2; index + 1 < buffer.length; index += 2) {
      result += String.fromCharCode(buffer.readUInt16BE(index));
    }

    return result.replace(/\u0000/g, "").trim();
  }

  return buffer.toString("utf8").replace(/\u0000/g, "").trim();
}

function decodeXmlEntities(value: string) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function extractPdfInfoField(pdfText: string, fieldName: string) {
  const literalPattern = new RegExp(
    `/${fieldName}\\s*\\(((?:\\\\.|[^\\\\)])*)\\)`,
    "i",
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

function extractXmpField(pdfText: string, tagName: string) {
  const tagPattern = new RegExp(
    `<${tagName}\\b[^>]*>[\\s\\S]*?<rdf:li[^>]*>([\\s\\S]*?)<\\/rdf:li>[\\s\\S]*?<\\/${tagName}>`,
    "i",
  );
  const match = pdfText.match(tagPattern);

  if (!match?.[1]) {
    return null;
  }

  const cleanedValue = decodeXmlEntities(match[1].replace(/<[^>]+>/g, " "));
  return normalizeOptionalText(cleanedValue);
}

function normalizeJoinedBookRow(row: any): BookRecord | null {
  if (!row?.item_id) {
    return null;
  }

  const itemHash = normalizeOptionalText(row.item_hash);
  const coverPreview = normalizeCoverPreview(row.cover_preview);
  const coverPreviewSourceHash = normalizeOptionalText(row.cover_preview_source_hash);
  const hasFreshCoverPreview =
    Boolean(coverPreview)
    && (!itemHash || coverPreviewSourceHash === itemHash);

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
    item: row.item_path
      ? serializeVaultItem({
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
          deleted: Boolean(row.item_deleted),
        })
      : null,
  };
}

function getSearchBody(book: BookRecord) {
  const statusLabel =
    book.readingStatus === "reading"
      ? "leyendo"
      : book.readingStatus === "finished"
        ? "leido"
        : book.readingStatus === "abandoned"
          ? "abandonado"
          : "pendiente";

  return [
    book.title,
    book.author,
    book.readingStatus,
    statusLabel,
    `progreso ${book.progressPercent}`,
    book.fileFormat,
  ]
    .filter(Boolean)
    .join("\n");
}

async function parsePdfMetadata(filePath: string) {
  try {
    const buffer = await fs.readFile(filePath);
    const pdfText = buffer.toString("latin1");
    const title =
      extractXmpField(pdfText, "dc:title") || extractPdfInfoField(pdfText, "Title");
    const author =
      extractXmpField(pdfText, "dc:creator") || extractPdfInfoField(pdfText, "Author");

    return {
      title,
      author,
    };
  } catch (error) {
    console.warn("[books] No se pudo leer metadata PDF:", filePath, error);
    return {
      title: null,
      author: null,
    };
  }
}

function getContentRelativePath(filePath: string, vaultContentPath: string) {
  const normalizedPath = String(filePath || "").replace(/\\/g, "/");
  const normalizedContentPath = String(vaultContentPath || "")
    .replace(/\\/g, "/")
    .replace(/\/$/, "");

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

function normalizeRelativePath(value: string) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
}

function isSupportedBookItem(item: any) {
  if (item?.type !== "file") {
    return false;
  }

  return SUPPORTED_BOOK_EXTENSIONS.has(
    getFileExtension(String(item?.path || item?.name || "")),
  );
}

export async function isBooksAssignedItem(ctx: NexusBackendPluginContext, item: any) {
  if (!isSupportedBookItem(item)) {
    return false;
  }

  const settings = await ctx.settings.get();
  const assignments = readBooksEngineAssignments(settings);
  const itemRelativePath = normalizeRelativePath(
    getContentRelativePath(String(item?.path || ""), ctx.vault.contentPath),
  );

  if (!itemRelativePath) {
    return false;
  }

  return assignments.some((assignment) => {
    const assignmentRoot = normalizeRelativePath(String(assignment.rootPath || ""));

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

function ensureBooksSchema(sqlite: any) {
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
    sqlite
      .prepare("PRAGMA table_info(books_items)")
      .all()
      .map((column: any) => String(column?.name || "").trim())
      .filter(Boolean),
  );

  if (!existingColumns.has("cover_preview")) {
    sqlite.prepare("ALTER TABLE books_items ADD COLUMN cover_preview TEXT").run();
  }

  if (!existingColumns.has("cover_preview_source_hash")) {
    sqlite.prepare("ALTER TABLE books_items ADD COLUMN cover_preview_source_hash TEXT").run();
  }
}

function findBookByItemIdSync(sqlite: any, itemId: string) {
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
    `).get(itemId),
  );
}

function listBooksSync(sqlite: any) {
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
  `).all()
    .map((row: any) => normalizeJoinedBookRow(row))
    .filter(Boolean);
}

function upsertBookSync(sqlite: any, payload: BookRecord) {
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
    cover_preview_source_hash: normalizeOptionalText(payload.coverPreviewSourceHash),
  });
}

function deleteBookSync(sqlite: any, itemId: string) {
  sqlite.prepare("DELETE FROM books_items WHERE item_id = ?").run(itemId);
}

async function syncBookSearchDocument(
  ctx: NexusBackendPluginContext,
  book: BookRecord,
  item: any,
) {
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
      String(book.progressPercent),
    ].join(":"),
    metadata: {
      pluginId: "nexus.books",
      domain: "book",
      fileFormat: book.fileFormat,
      readingStatus: book.readingStatus,
      progressPercent: book.progressPercent,
      engineId: BOOKS_ENGINE_ID,
    },
  });
}

export async function deleteBookArtifacts(
  ctx: NexusBackendPluginContext,
  itemId: string,
) {
  const repositories = ctx.requireRepositories();
  deleteBookSync(repositories.sqlite, itemId);
  await repositories.search.deleteForItem(itemId);
}

export async function ensureBookRecord(
  ctx: NexusBackendPluginContext,
  item: any,
  {
    structuralChanged = true,
    contentChanged = true,
    markOpened = false,
  }: {
    structuralChanged?: boolean;
    contentChanged?: boolean;
    markOpened?: boolean;
  } = {},
) {
  const repositories = ctx.requireRepositories();
  const itemId = String(item?.id || "");

  if (!itemId || !isSupportedBookItem(item) || !(await isBooksAssignedItem(ctx, item))) {
    if (itemId) {
      await deleteBookArtifacts(ctx, itemId);
    }
    return null;
  }

  const existing = findBookByItemIdSync(repositories.sqlite, itemId);
  const shouldRefreshMetadata = !existing || structuralChanged || contentChanged;
  const extractedMetadata = shouldRefreshMetadata
    ? await parsePdfMetadata(String(item?.path || ""))
    : { title: null, author: null };
  const addedAt = existing?.addedAt || nowIso();
  const itemHash = normalizeOptionalText(item?.hash);
  const shouldResetCoverPreview =
    contentChanged
    || (Boolean(existing?.coverPreview) && Boolean(itemHash) && existing?.coverPreviewSourceHash !== itemHash);
  const nextBook: BookRecord = {
    itemId,
    title:
      extractedMetadata.title ||
      existing?.title ||
      getBaseName(String(item?.path || item?.name || "")) ||
      "Documento",
    author: extractedMetadata.author ?? existing?.author ?? null,
    fileFormat: getFileExtension(String(item?.path || "")) || existing?.fileFormat || "pdf",
    addedAt,
    lastOpenedAt: markOpened ? nowIso() : existing?.lastOpenedAt ?? null,
    readingStatus: existing?.readingStatus || "pending",
    progressPercent: existing?.progressPercent ?? 0,
    coverPreview: shouldResetCoverPreview ? null : existing?.coverPreview ?? null,
    coverPreviewSourceHash: shouldResetCoverPreview ? null : existing?.coverPreviewSourceHash ?? null,
    itemHash,
  };

  upsertBookSync(repositories.sqlite, nextBook);
  const persisted = findBookByItemIdSync(repositories.sqlite, itemId);

  if (persisted) {
    await syncBookSearchDocument(ctx, persisted, item);
  }

  return persisted;
}

export async function listBooks(ctx: NexusBackendPluginContext) {
  return listBooksSync(ctx.requireRepositories().sqlite);
}

export async function getBookByItemId(
  ctx: NexusBackendPluginContext,
  itemId: string,
  { markOpened = false } = {},
) {
  const repositories = ctx.requireRepositories();
  const item = await repositories.items.findById(itemId);

  if (!item) {
    throw new Error("Item no encontrado.");
  }

  if (!isSupportedBookItem(item)) {
    throw new Error("El item solicitado no es un PDF soportado por Books.");
  }

  if (!(await isBooksAssignedItem(ctx, item))) {
    throw new Error("El item solicitado no pertenece a carpetas reclamadas por Books.");
  }

  return ensureBookRecord(ctx, item, {
    structuralChanged: false,
    contentChanged: false,
    markOpened,
  });
}

export async function updateBookState(
  ctx: NexusBackendPluginContext,
  itemId: string,
  patch: {
    readingStatus?: unknown;
    progressPercent?: unknown;
    lastOpenedAt?: string | null;
  },
) {
  const repositories = ctx.requireRepositories();
  const item = await repositories.items.findById(itemId);

  if (!item) {
    throw new Error("Item no encontrado.");
  }

  const currentBook =
    (await ensureBookRecord(ctx, item, {
      structuralChanged: false,
      contentChanged: false,
      markOpened: false,
    })) ?? null;

  if (!currentBook) {
    throw new Error("No se pudo inicializar el registro del libro.");
  }

  const nextBook: BookRecord = {
    ...currentBook,
    readingStatus:
      patch.readingStatus != null
        ? normalizeReadingStatus(patch.readingStatus)
        : currentBook.readingStatus,
    progressPercent:
      patch.progressPercent != null
        ? normalizeProgressPercent(patch.progressPercent)
        : currentBook.progressPercent,
    lastOpenedAt:
      patch.lastOpenedAt !== undefined ? patch.lastOpenedAt : currentBook.lastOpenedAt,
  };

  upsertBookSync(repositories.sqlite, nextBook);
  const persisted = findBookByItemIdSync(repositories.sqlite, itemId);

  if (persisted) {
    await syncBookSearchDocument(ctx, persisted, item);
  }

  return persisted;
}

export async function updateBookCoverPreview(
  ctx: NexusBackendPluginContext,
  itemId: string,
  payload: {
    coverPreview?: unknown;
  },
) {
  const repositories = ctx.requireRepositories();
  const item = await repositories.items.findById(itemId);

  if (!item) {
    throw new Error("Item no encontrado.");
  }

  const currentBook =
    (await ensureBookRecord(ctx, item, {
      structuralChanged: false,
      contentChanged: false,
      markOpened: false,
    })) ?? null;

  if (!currentBook) {
    throw new Error("No se pudo inicializar el registro del libro.");
  }

  const coverPreview = normalizeCoverPreview(payload.coverPreview);
  const itemHash = normalizeOptionalText(item?.hash);
  const nextBook: BookRecord = {
    ...currentBook,
    coverPreview,
    coverPreviewSourceHash: coverPreview ? itemHash : null,
    itemHash,
  };

  upsertBookSync(repositories.sqlite, nextBook);
  return findBookByItemIdSync(repositories.sqlite, itemId);
}

export async function markBookOpened(
  ctx: NexusBackendPluginContext,
  itemId: string,
) {
  return updateBookState(ctx, itemId, {
    lastOpenedAt: nowIso(),
  });
}

export async function reconcileBooksAssignments(ctx: NexusBackendPluginContext) {
  const repositories = ctx.requireRepositories();
  const items = await repositories.items.findAll();

  for (const item of items) {
    if (!isSupportedBookItem(item)) {
      continue;
    }

    if (!(await isBooksAssignedItem(ctx, item))) {
      await deleteBookArtifacts(ctx, String(item.id));
      continue;
    }

    await ensureBookRecord(ctx, item, {
      structuralChanged: true,
      contentChanged: true,
      markOpened: false,
    });
  }
}

export function registerBooksSchema(ctx: NexusBackendPluginContext) {
  ensureBooksSchema(ctx.requireRepositories().sqlite);
}
