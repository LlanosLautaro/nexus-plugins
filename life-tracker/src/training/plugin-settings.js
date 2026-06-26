export const TRAINING_SETTINGS_DEFAULTS = Object.freeze({
  muscleConceptsDirectory: "Concepts/Muscles",
});

export function normalizeTrainingSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...TRAINING_SETTINGS_DEFAULTS,
    };
  }

  const nextSettings = {
    ...TRAINING_SETTINGS_DEFAULTS,
    ...value,
  };

  if (typeof nextSettings.muscleConceptsDirectory !== "string" || !nextSettings.muscleConceptsDirectory.trim()) {
    nextSettings.muscleConceptsDirectory = TRAINING_SETTINGS_DEFAULTS.muscleConceptsDirectory;
  } else {
    nextSettings.muscleConceptsDirectory = nextSettings.muscleConceptsDirectory
      .replace(/\\/g, "/")
      .replace(/^\.?\//, "")
      .replace(/\/+/g, "/")
      .replace(/\/$/, "")
      .trim();
  }

  return nextSettings;
}

export function readTrainingMuscleConceptsDirectory(settingsValue) {
  return normalizeTrainingSettings(settingsValue).muscleConceptsDirectory;
}
