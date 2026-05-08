import { BOOKS_ENGINE_ID } from "./constants.js";

export const BOOKS_SETTINGS_DEFAULTS = Object.freeze({
  engineAssignments: [],
});

export function normalizeBooksSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...BOOKS_SETTINGS_DEFAULTS,
    };
  }

  return {
    ...BOOKS_SETTINGS_DEFAULTS,
    ...value,
  };
}

export function normalizeRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
}

export function readBooksEngineAssignments(settingsValue) {
  const normalizedSettings = normalizeBooksSettings(settingsValue);
  const assignments = Array.isArray(normalizedSettings.engineAssignments)
    ? normalizedSettings.engineAssignments
    : [];

  return assignments
    .filter((assignment) => assignment?.engineId === BOOKS_ENGINE_ID)
    .map((assignment) => ({
      engineId: BOOKS_ENGINE_ID,
      rootPath: normalizeRelativePath(assignment.rootPath),
      recursive:
        typeof assignment.recursive === "boolean" ? assignment.recursive : true,
    }))
    .filter((assignment) => assignment.rootPath);
}

export function writeBooksEngineAssignments(settingsValue, assignments) {
  const normalizedSettings = normalizeBooksSettings(settingsValue);
  const retainedAssignments = Array.isArray(normalizedSettings.engineAssignments)
    ? normalizedSettings.engineAssignments.filter((assignment) => assignment?.engineId !== BOOKS_ENGINE_ID)
    : [];

  return {
    ...normalizedSettings,
    engineAssignments: [
      ...retainedAssignments,
      ...assignments.map((assignment) => ({
        engineId: BOOKS_ENGINE_ID,
        rootPath: normalizeRelativePath(assignment.rootPath),
        recursive:
          typeof assignment.recursive === "boolean" ? assignment.recursive : true,
      })),
    ],
  };
}
