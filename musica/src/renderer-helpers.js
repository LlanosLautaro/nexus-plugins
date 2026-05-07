import { normalizeMusicaSettings } from "./plugin-settings.js";

export const MUSICA_ENGINE_ID = "nexus.musica.audio";

const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  "aac",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav",
]);

export function getFileExtension(filePath) {
  const fileName = String(filePath || "")
    .split(/[\\/]/)
    .pop();

  if (!fileName || !fileName.includes(".")) {
    return "";
  }

  return fileName.split(".").pop().trim().toLowerCase();
}

export function isSupportedAudioItem(item) {
  if (item?.type !== "file") {
    return false;
  }

  return SUPPORTED_AUDIO_EXTENSIONS.has(
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

export function normalizeRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
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

export function readEngineAssignments(settingsValue) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const assignments = Array.isArray(normalizedSettings.engineAssignments)
    ? normalizedSettings.engineAssignments
    : [];

  return assignments
    .filter((assignment) => assignment?.engineId === MUSICA_ENGINE_ID)
    .map((assignment) => ({
      engineId: MUSICA_ENGINE_ID,
      rootPath: normalizeRelativePath(assignment.rootPath),
      recursive:
        typeof assignment.recursive === "boolean" ? assignment.recursive : true,
    }))
    .filter((assignment) => assignment.rootPath);
}

export function writeEngineAssignments(settingsValue, assignments) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const retainedAssignments = Array.isArray(normalizedSettings.engineAssignments)
    ? normalizedSettings.engineAssignments.filter((assignment) => assignment?.engineId !== MUSICA_ENGINE_ID)
    : [];

  return {
    ...normalizedSettings,
    engineAssignments: [
      ...retainedAssignments,
      ...assignments.map((assignment) => ({
        engineId: MUSICA_ENGINE_ID,
        rootPath: normalizeRelativePath(assignment.rootPath),
        recursive:
          typeof assignment.recursive === "boolean" ? assignment.recursive : true,
      })),
    ],
  };
}
