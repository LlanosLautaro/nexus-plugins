export const MUSICA_ENGINE_ID = "nexus.musica.audio";

export const MUSICA_SETTINGS_DEFAULTS = Object.freeze({
  extractEmbeddedCoverArt: true,
  engineAssignments: [],
});

export function normalizeItemId(value) {
  const normalized = String(value || "").trim();
  return normalized || "";
}

export function normalizeRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
}

export function normalizeMusicaSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...MUSICA_SETTINGS_DEFAULTS,
    };
  }

  return {
    ...MUSICA_SETTINGS_DEFAULTS,
    ...value,
  };
}

export function isMusicaEmbeddedCoverArtEnabled(value) {
  return normalizeMusicaSettings(value).extractEmbeddedCoverArt !== false;
}

function normalizeMusicaAssignment(assignment) {
  return {
    engineId: MUSICA_ENGINE_ID,
    rootItemId: normalizeItemId(assignment?.rootItemId),
    rootPath: normalizeRelativePath(assignment?.rootPath),
    recursive:
      typeof assignment?.recursive === "boolean" ? assignment.recursive : true,
  };
}

export function readMusicaEngineAssignments(settingsValue) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const assignments = Array.isArray(normalizedSettings.engineAssignments)
    ? normalizedSettings.engineAssignments
    : [];

  return assignments
    .filter((assignment) => assignment?.engineId === MUSICA_ENGINE_ID)
    .map(normalizeMusicaAssignment)
    .filter((assignment) => assignment.rootItemId || assignment.rootPath);
}

export function writeMusicaEngineAssignments(settingsValue, assignments) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const retainedAssignments = Array.isArray(normalizedSettings.engineAssignments)
    ? normalizedSettings.engineAssignments.filter(
        (assignment) => assignment?.engineId !== MUSICA_ENGINE_ID,
      )
    : [];

  return {
    ...normalizedSettings,
    engineAssignments: [
      ...retainedAssignments,
      ...assignments
        .map(normalizeMusicaAssignment)
        .filter((assignment) => assignment.rootItemId || assignment.rootPath),
    ],
  };
}

export function resolveEmbeddedCoverPayload({
  enabled = true,
  cover = null,
  coverMimeType = null,
} = {}) {
  if (!enabled) {
    return {
      cover: null,
      coverMimeType: null,
    };
  }

  return {
    cover: cover ?? null,
    coverMimeType: coverMimeType ?? null,
  };
}
