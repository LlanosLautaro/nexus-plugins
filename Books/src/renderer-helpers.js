import {
  BOOKS_ENGINE_ID,
  BOOKS_LIBRARY_VIEW_ID,
  BOOK_READING_STATUSES,
} from "./constants.js";
import {
  normalizeRelativePath,
  readBooksEngineAssignments,
  writeBooksEngineAssignments,
} from "./plugin-settings.js";

const path = window.require("node:path");
const fs = window.require("node:fs");
const { Buffer } = window.require("node:buffer");

export {
  BOOKS_ENGINE_ID,
  BOOKS_LIBRARY_VIEW_ID,
  BOOK_READING_STATUSES,
  readBooksEngineAssignments,
  writeBooksEngineAssignments,
};

const SUPPORTED_BOOK_EXTENSIONS = new Set(["pdf"]);
const MOJIBAKE_HINT_RE = /[ÂÃâ]/;

function repairLikelyMojibakePath(candidatePath) {
  const normalizedCandidatePath = path.normalize(String(candidatePath || ""));

  if (!normalizedCandidatePath || fs.existsSync(normalizedCandidatePath)) {
    return normalizedCandidatePath;
  }

  if (!MOJIBAKE_HINT_RE.test(normalizedCandidatePath)) {
    return normalizedCandidatePath;
  }

  try {
    const repairedPath = path.normalize(
      Buffer.from(normalizedCandidatePath, "latin1").toString("utf8"),
    );

    if (repairedPath && repairedPath !== normalizedCandidatePath && fs.existsSync(repairedPath)) {
      return repairedPath;
    }
  } catch {}

  return normalizedCandidatePath;
}

export function getFileExtension(filePath) {
  const fileName = String(filePath || "")
    .split(/[\\/]/)
    .pop();

  if (!fileName || !fileName.includes(".")) {
    return "";
  }

  return fileName.split(".").pop().trim().toLowerCase();
}

export function isSupportedBookItem(item) {
  if (item?.type !== "file") {
    return false;
  }

  return SUPPORTED_BOOK_EXTENSIONS.has(
    getFileExtension(item?.path || item?.name || ""),
  );
}

export function getContentRelativePath(filePath) {
  const normalizedPath = String(filePath || "").replace(/\\/g, "/");
  const vaultPath = String(window?.vault?.path || "").replace(/\\/g, "/").replace(/\/$/, "");

  if (!normalizedPath) {
    return "";
  }

  if (vaultPath) {
    const contentPrefix = `${vaultPath}/content/`;

    if (normalizedPath.startsWith(contentPrefix)) {
      return normalizedPath.slice(contentPrefix.length);
    }
  }

  const contentMatch = normalizedPath.match(/(?:^|\/)content\/(.+)$/);
  return contentMatch?.[1] || "";
}

export function resolveVaultFilePath(filePath) {
  const rawPath = String(filePath || "").trim();

  if (!rawPath) {
    return "";
  }

  if (path.isAbsolute(rawPath)) {
    return repairLikelyMojibakePath(rawPath);
  }

  const normalizedRelativePath = normalizeRelativePath(rawPath);
  const vaultContentPath = String(window?.vault?.contentPath || "").trim();

  if (vaultContentPath) {
    return repairLikelyMojibakePath(path.join(vaultContentPath, normalizedRelativePath));
  }

  const vaultBasePath = String(window?.vault?.path || "").trim();

  if (vaultBasePath) {
    return repairLikelyMojibakePath(
      path.join(vaultBasePath, "content", normalizedRelativePath),
    );
  }

  return repairLikelyMojibakePath(rawPath);
}

export function buildFolderOptions(byId = {}, rootId = null) {
  return Object.values(byId)
    .filter((item) => item?.type === "folder")
    .map((item) => ({
      id: item.id,
      label: item.id === rootId ? "Vault completo" : item.name,
      rootPath: normalizeRelativePath(getContentRelativePath(item.path || "")),
      path: item.path || "",
    }))
    .filter((option) => option.rootPath)
    .sort((left, right) => left.rootPath.localeCompare(right.rootPath));
}

export function getReadingStatusLabel(status) {
  if (status === "reading") return "Leyendo";
  if (status === "finished") return "Leido";
  if (status === "abandoned") return "Abandonado";
  return "Pendiente";
}

export function formatPercent(value) {
  const normalized = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${Math.round(normalized)}%`;
}

export function formatDateTime(value) {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function queueBooksEditorLogEvent(event, message, data = null, level = "info") {
  try {
    window.__queueNexusDevLogEvent?.({
      process: "renderer",
      surface: "editors",
      subsystem: "renderer.editors.books",
      shard: "43-renderer-editors.jsonl",
      level,
      event,
      message,
      data,
    });
  } catch {}
}
