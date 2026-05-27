import {
  MUSICA_ENGINE_ID,
  normalizeItemId,
  normalizeRelativePath,
  readMusicaEngineAssignments,
  writeMusicaEngineAssignments,
} from "./plugin-settings.js";
import { resolveItemLocationFromItemsState } from "../../../nexus-frontend/src/store/items/location.mjs";

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

export function buildFolderOptions(byId = {}, rootId = null) {
  return Object.values(byId)
    .filter((item) => item?.type === "folder")
    .map((item) => {
      const location = resolveItemLocationFromItemsState(
        {
          byId,
          rootId,
        },
        item.id,
      );

      return {
        id: item.id,
        label: item.id === rootId ? "Vault completo" : item.name,
        rootPath: normalizeRelativePath(location?.contentRelativePath || ""),
        path: location?.path || item.path || "",
      };
    })
    .filter((option) => option.rootPath)
    .sort((left, right) => left.rootPath.localeCompare(right.rootPath));
}

export function resolveFolderOptionForAssignment(assignment, folderOptions = []) {
  const assignmentRootItemId = normalizeItemId(assignment?.rootItemId);
  const assignmentRootPath = normalizeRelativePath(assignment?.rootPath);

  if (assignmentRootItemId) {
    return folderOptions.find((option) => option.id === assignmentRootItemId) || null;
  }

  if (!assignmentRootPath) {
    return null;
  }

  return folderOptions.find((option) => option.rootPath === assignmentRootPath) || null;
}

export function hydrateAssignmentsWithFolderOptions(assignments, folderOptions = []) {
  return (Array.isArray(assignments) ? assignments : []).map((assignment) => {
    const folderOption = resolveFolderOptionForAssignment(assignment, folderOptions);

    if (!folderOption) {
      return {
        ...assignment,
        rootItemId: normalizeItemId(assignment?.rootItemId),
        rootPath: normalizeRelativePath(assignment?.rootPath),
      };
    }

    return {
      ...assignment,
      rootItemId: folderOption.id,
      rootPath: folderOption.rootPath,
    };
  });
}

export const readEngineAssignments = readMusicaEngineAssignments;
export const writeEngineAssignments = writeMusicaEngineAssignments;
export { MUSICA_ENGINE_ID };
