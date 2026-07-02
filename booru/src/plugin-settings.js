export const BOORU_SETTINGS_DEFAULTS = Object.freeze({
  watchFolderPath: "",
  pythonExecutable: "",
});

function normalizeTextSetting(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^"(.*)"$/, "$1");
}

export function normalizeBooruSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...BOORU_SETTINGS_DEFAULTS,
    };
  }

  return {
    watchFolderPath: normalizeTextSetting(value.watchFolderPath),
    pythonExecutable: normalizeTextSetting(value.pythonExecutable),
  };
}

export function readBooruWatchFolderPath(value) {
  return normalizeBooruSettings(value).watchFolderPath;
}

export function readBooruPythonExecutable(value) {
  return normalizeBooruSettings(value).pythonExecutable;
}
