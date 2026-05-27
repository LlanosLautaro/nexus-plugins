const React = window.React;

// ../nexus-plugins/musica/src/PluginMetadataForm.jsx
var { useEffect, useMemo, useState } = window.React;
var { ipcRenderer } = window.require("electron");
function normalizeFieldValue(field, value) {
  if (field.type === "boolean") {
    return Boolean(value);
  }
  if (field.type === "string-list") {
    return Array.isArray(value) ? value.map((entry) => String(entry ?? "")) : [];
  }
  if (field.type === "number") {
    if (value == null || value === "") {
      return "";
    }
    return String(value);
  }
  return value == null ? "" : String(value);
}
function normalizeFormValues(definition, values = {}) {
  return Object.fromEntries(
    (definition?.fields || []).map((field) => [
      field.name,
      normalizeFieldValue(field, values?.[field.name])
    ])
  );
}
function areValuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function MetadataField({ field, value, disabled, onChange, inputId }) {
  if (field.type === "textarea") {
    return /* @__PURE__ */ React.createElement(
      "textarea",
      {
        id: inputId,
        className: "musicaMetadata__textarea",
        value,
        onChange: (event) => onChange(event.target.value),
        placeholder: field.placeholder || "",
        disabled,
        rows: 4
      }
    );
  }
  if (field.type === "number") {
    return /* @__PURE__ */ React.createElement(
      "input",
      {
        id: inputId,
        className: "musicaMetadata__input",
        type: "number",
        value,
        onChange: (event) => onChange(event.target.value),
        placeholder: field.placeholder || "",
        disabled
      }
    );
  }
  if (field.type === "boolean") {
    return /* @__PURE__ */ React.createElement("label", { className: "musicaMetadata__checkbox" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: Boolean(value),
        onChange: (event) => onChange(event.target.checked),
        disabled
      }
    ), /* @__PURE__ */ React.createElement("span", null, field.label));
  }
  if (field.type === "string-list") {
    const entries = Array.isArray(value) ? value : [];
    return /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__list" }, entries.length ? entries.map((entryValue, index) => /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__listRow", key: `${field.name}-${index}` }, /* @__PURE__ */ React.createElement(
      "input",
      {
        id: index === 0 ? inputId : void 0,
        className: "musicaMetadata__input",
        type: "text",
        value: entryValue,
        onChange: (event) => {
          const nextEntries = [...entries];
          nextEntries[index] = event.target.value;
          onChange(nextEntries);
        },
        placeholder: field.placeholder || field.label,
        disabled
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "musicaMetadata__secondaryButton",
        onClick: () => {
          onChange(entries.filter((_entry, entryIndex) => entryIndex !== index));
        },
        disabled
      },
      "Quitar"
    ))) : /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__emptyList" }, "Sin valores cargados todavia."), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "musicaMetadata__secondaryButton",
        onClick: () => onChange([...entries || [], ""]),
        disabled
      },
      field.addLabel || "Agregar"
    ));
  }
  return /* @__PURE__ */ React.createElement(
    "input",
    {
      id: inputId,
      className: "musicaMetadata__input",
      type: "text",
      value,
      onChange: (event) => onChange(event.target.value),
      placeholder: field.placeholder || "",
      disabled
    }
  );
}
function PluginMetadataForm({ itemId, formInstance, onSubmitted }) {
  const definition = formInstance?.definition || null;
  const normalizedInitialValues = useMemo(
    () => normalizeFormValues(definition, formInstance?.values),
    [definition, formInstance?.values]
  );
  const [baseValues, setBaseValues] = useState(normalizedInitialValues);
  const [draftValues, setDraftValues] = useState(normalizedInitialValues);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notices, setNotices] = useState([]);
  useEffect(() => {
    setBaseValues(normalizedInitialValues);
    setDraftValues(normalizedInitialValues);
    setSubmitError("");
    setNotices([]);
  }, [normalizedInitialValues]);
  const isDirty = useMemo(
    () => !areValuesEqual(baseValues, draftValues),
    [baseValues, draftValues]
  );
  if (!definition) {
    return null;
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!itemId || !isDirty || submitting) {
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setNotices([]);
    try {
      const response = await ipcRenderer.invoke("metadata:submit-form", {
        itemId,
        resourceId: definition.resourceId,
        variantId: definition.variantId,
        values: draftValues
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar la metadata musical.");
      }
      const nextValues = normalizeFormValues(definition, response.data?.values);
      setBaseValues(nextValues);
      setDraftValues(nextValues);
      setNotices(Array.isArray(response.data?.notices) ? response.data.notices : []);
      await onSubmitted?.(response.data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la metadata musical.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ React.createElement("form", { className: "musicaMetadata", onSubmit: handleSubmit }, /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__body" }, /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, definition.title), definition.description ? /* @__PURE__ */ React.createElement("p", null, definition.description) : null)), /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__grid" }, (definition.fields || []).map((field) => {
    const inputId = `musica-metadata-${field.name}`;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: [
          "musicaMetadata__field",
          field.type === "boolean" && "musicaMetadata__field--boolean",
          field.type === "string-list" && "musicaMetadata__field--string-list"
        ].filter(Boolean).join(" "),
        key: field.name
      },
      field.type !== "boolean" ? /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__labelRow" }, /* @__PURE__ */ React.createElement("label", { htmlFor: inputId }, field.label), field.description ? /* @__PURE__ */ React.createElement("p", null, field.description) : null) : /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__labelRow" }, field.description ? /* @__PURE__ */ React.createElement("p", null, field.description) : null),
      /* @__PURE__ */ React.createElement(
        MetadataField,
        {
          field,
          value: draftValues[field.name],
          disabled: submitting,
          onChange: (nextValue) => setDraftValues((currentValue) => ({
            ...currentValue,
            [field.name]: nextValue
          })),
          inputId
        }
      )
    );
  })), submitError ? /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__state musicaMetadata__state--error" }, submitError) : null, notices.length ? /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__notices" }, notices.map((notice, index) => /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__state", key: `${notice}-${index}` }, notice))) : null), /* @__PURE__ */ React.createElement("div", { className: "musicaMetadata__actions" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "musicaMetadata__secondaryButton",
      disabled: submitting || !isDirty,
      onClick: () => {
        setDraftValues(baseValues);
        setSubmitError("");
        setNotices([]);
      }
    },
    "Cancelar"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "musicaMetadata__primaryButton",
      disabled: submitting || !isDirty
    },
    submitting ? "Guardando..." : "Guardar"
  )));
}

// ../nexus-plugins/musica/src/plugin-settings.js
var MUSICA_ENGINE_ID = "nexus.musica.audio";
var MUSICA_SETTINGS_DEFAULTS = Object.freeze({
  extractEmbeddedCoverArt: true,
  engineAssignments: []
});
function normalizeItemId(value) {
  const normalized = String(value || "").trim();
  return normalized || "";
}
function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+/g, "/").replace(/\/$/, "").trim();
}
function normalizeMusicaSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...MUSICA_SETTINGS_DEFAULTS
    };
  }
  return {
    ...MUSICA_SETTINGS_DEFAULTS,
    ...value
  };
}
function normalizeMusicaAssignment(assignment) {
  return {
    engineId: MUSICA_ENGINE_ID,
    rootItemId: normalizeItemId(assignment?.rootItemId),
    rootPath: normalizeRelativePath(assignment?.rootPath),
    recursive: typeof assignment?.recursive === "boolean" ? assignment.recursive : true
  };
}
function readMusicaEngineAssignments(settingsValue) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const assignments = Array.isArray(normalizedSettings.engineAssignments) ? normalizedSettings.engineAssignments : [];
  return assignments.filter((assignment) => assignment?.engineId === MUSICA_ENGINE_ID).map(normalizeMusicaAssignment).filter((assignment) => assignment.rootItemId || assignment.rootPath);
}
function writeMusicaEngineAssignments(settingsValue, assignments) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const retainedAssignments = Array.isArray(normalizedSettings.engineAssignments) ? normalizedSettings.engineAssignments.filter(
    (assignment) => assignment?.engineId !== MUSICA_ENGINE_ID
  ) : [];
  return {
    ...normalizedSettings,
    engineAssignments: [
      ...retainedAssignments,
      ...assignments.map(normalizeMusicaAssignment).filter((assignment) => assignment.rootItemId || assignment.rootPath)
    ]
  };
}

// ../nexus-frontend/src/store/items/location.mjs
function normalizeItemId2(value) {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || "";
}
function normalizeName(value) {
  return String(value || "").trim();
}
function trimTrailingSeparators(value) {
  return String(value || "").replace(/[\\/]+$/, "");
}
function guessSeparator(...values) {
  return values.some((value) => String(value || "").includes("\\")) ? "\\" : "/";
}
function joinSegments(basePath, segments, separator) {
  const normalizedBasePath = trimTrailingSeparators(basePath);
  if (!segments.length) {
    return normalizedBasePath;
  }
  return [normalizedBasePath, ...segments].filter(Boolean).join(separator);
}
function joinRelativePath(segments, separator) {
  return segments.length ? segments.join(separator) : null;
}
function resolveItemLocationFromItemsState(itemsState, itemId, options = {}) {
  const byId = itemsState?.byId || {};
  const normalizedItemId = normalizeItemId2(itemId);
  if (!normalizedItemId) {
    return null;
  }
  const item = byId[normalizedItemId];
  if (!item) {
    return null;
  }
  const visitedIds = /* @__PURE__ */ new Set();
  const ancestorIds = [];
  const relativeSegments = [];
  let currentItem = item;
  let rootItem = null;
  while (currentItem?.id) {
    const currentItemId = normalizeItemId2(currentItem.id);
    if (!currentItemId || visitedIds.has(currentItemId)) {
      return null;
    }
    visitedIds.add(currentItemId);
    const currentParentId = normalizeItemId2(currentItem.parentId);
    if (!currentParentId) {
      rootItem = currentItem;
      break;
    }
    const currentName = normalizeName(currentItem.name);
    if (currentName) {
      relativeSegments.push(currentName);
    }
    ancestorIds.push(currentParentId);
    const parentItem = byId[currentParentId];
    if (!parentItem) {
      return null;
    }
    currentItem = parentItem;
  }
  if (!rootItem) {
    return null;
  }
  const rootPathCandidate = options.rootPath || options.vaultContentPath || "";
  const separator = guessSeparator(rootPathCandidate);
  const orderedSegments = [...relativeSegments].reverse();
  const resolvedRelativePath = joinRelativePath(orderedSegments, separator);
  return {
    itemId: String(item.id),
    parentId: item.parentId ?? null,
    name: String(item.name || ""),
    type: item.type === "folder" ? "folder" : "file",
    path: joinSegments(rootPathCandidate, orderedSegments, separator),
    relativePath: resolvedRelativePath,
    contentRelativePath: orderedSegments.length ? orderedSegments.join("/") : null,
    ancestorIds
  };
}

// ../nexus-plugins/musica/src/renderer-helpers.js
var SUPPORTED_AUDIO_EXTENSIONS = /* @__PURE__ */ new Set([
  "aac",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav"
]);
function getFileExtension(filePath) {
  const fileName = String(filePath || "").split(/[\\/]/).pop();
  if (!fileName || !fileName.includes(".")) {
    return "";
  }
  return fileName.split(".").pop().trim().toLowerCase();
}
function isSupportedAudioItem(item) {
  if (item?.type !== "file") {
    return false;
  }
  return SUPPORTED_AUDIO_EXTENSIONS.has(
    getFileExtension(item?.path || item?.name || "")
  );
}
function buildFolderOptions(byId = {}, rootId = null) {
  return Object.values(byId).filter((item) => item?.type === "folder").map((item) => {
    const location = resolveItemLocationFromItemsState(
      {
        byId,
        rootId
      },
      item.id
    );
    return {
      id: item.id,
      label: item.id === rootId ? "Vault completo" : item.name,
      rootPath: normalizeRelativePath(location?.contentRelativePath || ""),
      path: location?.path || item.path || ""
    };
  }).filter((option) => option.rootPath).sort((left, right) => left.rootPath.localeCompare(right.rootPath));
}
function resolveFolderOptionForAssignment(assignment, folderOptions = []) {
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
function hydrateAssignmentsWithFolderOptions(assignments, folderOptions = []) {
  return (Array.isArray(assignments) ? assignments : []).map((assignment) => {
    const folderOption = resolveFolderOptionForAssignment(assignment, folderOptions);
    if (!folderOption) {
      return {
        ...assignment,
        rootItemId: normalizeItemId(assignment?.rootItemId),
        rootPath: normalizeRelativePath(assignment?.rootPath)
      };
    }
    return {
      ...assignment,
      rootItemId: folderOption.id,
      rootPath: folderOption.rootPath
    };
  });
}
var readEngineAssignments = readMusicaEngineAssignments;
var writeEngineAssignments = writeMusicaEngineAssignments;

// ../nexus-plugins/musica/src/MusicAudioEngine.jsx
var { useEffect: useEffect2, useMemo: useMemo2, useRef, useState: useState2 } = window.React;
var { ipcRenderer: ipcRenderer2 } = window.require("electron");
var DEFAULT_AUDIO_STATE = {
  audioFile: null,
  src: null,
  error: ""
};
var DEFAULT_PLAYBACK_STATE = {
  currentTime: 0,
  duration: 0,
  isPlaying: false
};
var DEFAULT_PREFERENCES_STATE = {
  volume: 0.85,
  muted: false
};
var DEFAULT_METADATA_STATE = {
  open: false,
  loading: false,
  error: "",
  formInstance: null
};
function getFileName(filePath) {
  return String(filePath || "").split(/[\\/]/).pop() || "Audio";
}
function getAudioMimeType(filePath, audioFile) {
  if (audioFile?.mimeType) {
    return audioFile.mimeType;
  }
  const extension = String(filePath || "").split(".").pop().trim().toLowerCase();
  if (extension === "wav") return "audio/wav";
  if (extension === "ogg" || extension === "oga" || extension === "opus") return "audio/ogg";
  if (extension === "flac") return "audio/flac";
  if (extension === "m4a") return "audio/mp4";
  if (extension === "aac") return "audio/aac";
  return "audio/mpeg";
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function getNavigationItems(navigationItems) {
  return Array.isArray(navigationItems) ? navigationItems.filter(isSupportedAudioItem) : [];
}
function getPlaybackStateSnapshot(currentValue) {
  return currentValue && typeof currentValue === "object" ? { ...DEFAULT_PLAYBACK_STATE, ...currentValue } : { ...DEFAULT_PLAYBACK_STATE };
}
function getPreferencesStateSnapshot(currentValue) {
  return currentValue && typeof currentValue === "object" ? { ...DEFAULT_PREFERENCES_STATE, ...currentValue } : { ...DEFAULT_PREFERENCES_STATE };
}
function getMetadataStateSnapshot(currentValue) {
  return currentValue && typeof currentValue === "object" ? { ...DEFAULT_METADATA_STATE, ...currentValue } : { ...DEFAULT_METADATA_STATE };
}
function MusicAudioEngine({
  tab,
  tabId,
  item,
  itemId,
  filePath,
  navigationItems,
  hostApi
}) {
  const audioRef = useRef(null);
  const [audioState, setAudioState] = useState2(DEFAULT_AUDIO_STATE);
  const [playback, setPlayback] = useState2(DEFAULT_PLAYBACK_STATE);
  const [preferences, setPreferences] = useState2(DEFAULT_PREFERENCES_STATE);
  const [metadataState, setMetadataState] = useState2(DEFAULT_METADATA_STATE);
  const audioItems = useMemo2(() => getNavigationItems(navigationItems), [navigationItems]);
  const currentIndex = audioItems.findIndex((entry) => entry?.id === itemId);
  const previousItem = currentIndex > 0 ? audioItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < audioItems.length - 1 ? audioItems[currentIndex + 1] : null;
  useEffect2(() => {
    const storedVolume = hostApi.getState().data.audioPlaybackVolume ?? 0.85;
    const storedMuted = hostApi.getState().data.audioPlaybackMuted ?? false;
    setPreferences({
      volume: Number.isFinite(storedVolume) ? storedVolume : 0.85,
      muted: Boolean(storedMuted)
    });
  }, [hostApi]);
  useEffect2(() => {
    if (!itemId) {
      return void 0;
    }
    let cancelled = false;
    let objectUrl = null;
    const loadAudio = async () => {
      try {
        const response = await ipcRenderer2.invoke("audio:getByItemId", itemId);
        if (cancelled) {
          return;
        }
        if (!response?.ok) {
          setAudioState({
            audioFile: null,
            src: null,
            error: response?.error || "No se pudo cargar el audio musical."
          });
          return;
        }
        const { audioFile, buffer } = response.data || {};
        const blob = new Blob([buffer], {
          type: getAudioMimeType(filePath, audioFile)
        });
        objectUrl = URL.createObjectURL(blob);
        setAudioState({
          audioFile,
          src: objectUrl,
          error: ""
        });
        setPlayback({
          currentTime: 0,
          duration: Number.isFinite(audioFile?.duration) ? audioFile.duration : 0,
          isPlaying: false
        });
      } catch (error) {
        if (!cancelled) {
          setAudioState({
            audioFile: null,
            src: null,
            error: error instanceof Error ? error.message : "No se pudo cargar el audio musical."
          });
        }
      }
    };
    void loadAudio();
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [filePath, itemId]);
  useEffect2(() => {
    const audio = audioRef.current;
    if (!audio) {
      return void 0;
    }
    audio.volume = clamp(preferences.volume, 0, 1);
    audio.muted = preferences.muted;
    return void 0;
  }, [preferences]);
  const openNeighbor = async (nextTarget) => {
    if (!nextTarget?.id) {
      return;
    }
    const uiState = tab?.uiState?.itemEngineSessionOverrideId ? {
      itemEngineSessionOverrideId: tab.uiState.itemEngineSessionOverrideId
    } : {};
    await hostApi.actions.openFile({
      item: nextTarget,
      sourceId: "musica.engine.navigation",
      reuse: true,
      targetTabId: tabId,
      uiState
    });
  };
  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      await audio.play();
      setPlayback((currentValue) => ({
        ...getPlaybackStateSnapshot(currentValue),
        isPlaying: true
      }));
      return;
    }
    audio.pause();
    setPlayback((currentValue) => ({
      ...getPlaybackStateSnapshot(currentValue),
      isPlaying: false
    }));
  };
  const handleOpenMetadata = async () => {
    if (!itemId) {
      return;
    }
    setMetadataState({
      open: true,
      loading: true,
      error: "",
      formInstance: null
    });
    try {
      const formsResponse = await ipcRenderer2.invoke("metadata:list-item-forms", itemId);
      if (!formsResponse?.ok) {
        throw new Error(formsResponse?.error || "No se pudieron listar formularios de metadata.");
      }
      const musicaForm = (formsResponse.data || []).find(
        (entry) => entry?.resourceId === "audio.track"
      );
      if (!musicaForm) {
        throw new Error("Este item no expone metadata musical editable.");
      }
      const formResponse = await ipcRenderer2.invoke("metadata:get-form-instance", {
        itemId,
        resourceId: musicaForm.resourceId,
        variantId: musicaForm.variantId
      });
      if (!formResponse?.ok) {
        throw new Error(formResponse?.error || "No se pudo abrir el formulario de metadata.");
      }
      setMetadataState({
        open: true,
        loading: false,
        error: "",
        formInstance: formResponse.data
      });
    } catch (error) {
      setMetadataState({
        open: true,
        loading: false,
        error: error instanceof Error ? error.message : "No se pudo abrir el formulario de metadata.",
        formInstance: null
      });
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "musicaEngine" }, /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__shell" }, /* @__PURE__ */ React.createElement("section", { className: "musicaEngine__hero" }, /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__cover" }, audioState.audioFile?.cover ? /* @__PURE__ */ React.createElement("img", { src: audioState.audioFile.cover, alt: audioState.audioFile.title || getFileName(filePath) }) : /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__coverPlaceholder" }, /* @__PURE__ */ React.createElement("strong", null, getFileName(filePath).slice(0, 1).toUpperCase()), /* @__PURE__ */ React.createElement("span", null, "Music engine"))), /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__copy" }, /* @__PURE__ */ React.createElement("span", { className: "musicaEngine__eyebrow" }, "Plugin musica"), /* @__PURE__ */ React.createElement("h1", null, audioState.audioFile?.title || getFileName(filePath)), /* @__PURE__ */ React.createElement("p", null, audioState.audioFile?.authors?.length ? audioState.audioFile.authors.join(", ") : "Sin autores curados"), /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__meta" }, /* @__PURE__ */ React.createElement("span", null, audioState.audioFile?.album || "Sin album"), /* @__PURE__ */ React.createElement("span", null, audioState.audioFile?.genre || "Sin genero"), /* @__PURE__ */ React.createElement("span", null, formatTime(playback.duration || audioState.audioFile?.duration || 0))), /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => void openNeighbor(previousItem), disabled: !previousItem }, "Anterior"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "is-primary", onClick: () => void togglePlayback(), disabled: !audioState.src }, playback.isPlaying ? "Pausar" : "Reproducir"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => void openNeighbor(nextItem), disabled: !nextItem }, "Siguiente"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => void handleOpenMetadata(), disabled: !itemId }, "Editar metadata")))), audioState.error ? /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__state musicaEngine__state--error" }, audioState.error) : /* @__PURE__ */ React.createElement("section", { className: "musicaEngine__playerPanel" }, /* @__PURE__ */ React.createElement(
    "audio",
    {
      ref: audioRef,
      src: audioState.src || void 0,
      onPlay: () => setPlayback((currentValue) => ({
        ...getPlaybackStateSnapshot(currentValue),
        isPlaying: true
      })),
      onPause: () => setPlayback((currentValue) => ({
        ...getPlaybackStateSnapshot(currentValue),
        isPlaying: false
      })),
      onTimeUpdate: (event) => {
        const nextCurrentTime = event.currentTarget?.currentTime ?? 0;
        const nextDuration = event.currentTarget?.duration;
        setPlayback((currentValue) => {
          const nextPlayback = getPlaybackStateSnapshot(currentValue);
          return {
            ...nextPlayback,
            currentTime: nextCurrentTime,
            duration: Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : nextPlayback.duration
          };
        });
      },
      onLoadedMetadata: (event) => {
        const nextDuration = event.currentTarget?.duration;
        setPlayback((currentValue) => {
          const nextPlayback = getPlaybackStateSnapshot(currentValue);
          return {
            ...nextPlayback,
            duration: Number.isFinite(nextDuration) ? nextDuration : nextPlayback.duration
          };
        });
      },
      onEnded: () => setPlayback((currentValue) => {
        const nextPlayback = getPlaybackStateSnapshot(currentValue);
        return {
          ...nextPlayback,
          isPlaying: false,
          currentTime: nextPlayback.duration
        };
      })
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__timeline" }, /* @__PURE__ */ React.createElement("span", null, formatTime(playback.currentTime)), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "0",
      max: Number.isFinite(playback.duration) && playback.duration > 0 ? playback.duration : 0,
      step: "0.1",
      value: Math.min(playback.currentTime, playback.duration || 0),
      onChange: (event) => {
        const audio = audioRef.current;
        const nextTime = Number(event.target.value);
        if (audio) {
          audio.currentTime = nextTime;
        }
        setPlayback((currentValue) => ({
          ...getPlaybackStateSnapshot(currentValue),
          currentTime: nextTime
        }));
      },
      disabled: !audioState.src
    }
  ), /* @__PURE__ */ React.createElement("span", null, formatTime(playback.duration))), /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__volume" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPreferences((currentValue) => {
        const nextPreferences = getPreferencesStateSnapshot(currentValue);
        const nextMuted = !nextPreferences.muted;
        void hostApi.getState().setVar("audioPlaybackMuted", nextMuted);
        return {
          ...nextPreferences,
          muted: nextMuted
        };
      })
    },
    preferences.muted ? "Activar audio" : "Silenciar"
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "0",
      max: "1",
      step: "0.01",
      value: preferences.volume,
      onChange: (event) => {
        const nextVolume = clamp(Number(event.target.value), 0, 1);
        setPreferences((currentValue) => {
          const nextPreferences = getPreferencesStateSnapshot(currentValue);
          return {
            ...nextPreferences,
            volume: nextVolume,
            muted: nextPreferences.muted && nextVolume > 0 ? false : nextPreferences.muted
          };
        });
        void hostApi.getState().setVar("audioPlaybackVolume", nextVolume);
      }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__details" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Ruta"), /* @__PURE__ */ React.createElement("strong", null, filePath)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Motor"), /* @__PURE__ */ React.createElement("strong", null, MUSICA_ENGINE_ID)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Item"), /* @__PURE__ */ React.createElement("strong", null, item?.id || itemId)))), metadataState.open ? /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__overlay", onClick: () => setMetadataState((currentValue) => ({ ...getMetadataStateSnapshot(currentValue), open: false })) }, /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__drawer", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__drawerHeader" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Metadata musical"), /* @__PURE__ */ React.createElement("strong", null, audioState.audioFile?.title || getFileName(filePath))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setMetadataState((currentValue) => ({ ...getMetadataStateSnapshot(currentValue), open: false })) }, "Cerrar")), metadataState.loading ? /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__state" }, "Cargando formulario...") : metadataState.error ? /* @__PURE__ */ React.createElement("div", { className: "musicaEngine__state musicaEngine__state--error" }, metadataState.error) : /* @__PURE__ */ React.createElement(
    PluginMetadataForm,
    {
      itemId,
      formInstance: metadataState.formInstance,
      onSubmitted: async () => {
        await handleOpenMetadata();
      }
    }
  ))) : null);
}

// ../nexus-plugins/musica/src/MusicaSettingsSection.jsx
var { useEffect: useEffect3, useMemo: useMemo3, useState: useState3 } = window.React;
function createEmptyAssignment() {
  return {
    rootItemId: "",
    rootPath: "",
    recursive: true
  };
}
function getAssignmentSelectValue(assignment) {
  if (assignment?.rootItemId) {
    return assignment.rootItemId;
  }
  const rootPath = String(assignment?.rootPath || "");
  return rootPath ? `legacy:${rootPath}` : "";
}
function getAssignmentsSignature(assignments) {
  return JSON.stringify(
    Array.isArray(assignments) ? assignments.map((assignment) => ({
      rootItemId: String(assignment?.rootItemId || ""),
      rootPath: String(assignment?.rootPath || ""),
      recursive: Boolean(assignment?.recursive)
    })) : []
  );
}
function MusicaSettingsSection({ ctx }) {
  const baseSettings = ctx.settings.useValue();
  const itemsState = ctx.getItems();
  const folderOptions = buildFolderOptions(itemsState.byId, itemsState.rootId);
  const folderOptionsById = useMemo3(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions]
  );
  const persistedAssignments = useMemo3(
    () => readEngineAssignments(baseSettings),
    [baseSettings]
  );
  const hydratedPersistedAssignments = useMemo3(
    () => hydrateAssignmentsWithFolderOptions(persistedAssignments, folderOptions),
    [folderOptions, persistedAssignments]
  );
  const persistedAssignmentsSignature = useMemo3(
    () => getAssignmentsSignature(hydratedPersistedAssignments),
    [hydratedPersistedAssignments]
  );
  const legacyFolderOptions = useMemo3(
    () => hydratedPersistedAssignments.filter(
      (assignment) => (assignment?.rootItemId || assignment?.rootPath) && !resolveFolderOptionForAssignment(assignment, folderOptions)
    ).map((assignment, index) => ({
      id: assignment.rootItemId || `legacy:${assignment.rootPath}`,
      label: `${assignment.rootPath || assignment.rootItemId} (sin resolver)`,
      key: `${assignment.rootItemId || assignment.rootPath}:${index}`
    })),
    [folderOptions, hydratedPersistedAssignments]
  );
  const [draftAssignments, setDraftAssignments] = useState3(
    () => hydratedPersistedAssignments
  );
  const [saving, setSaving] = useState3(false);
  const [notice, setNotice] = useState3("");
  const [error, setError] = useState3("");
  useEffect3(() => {
    setDraftAssignments(
      (currentValue) => getAssignmentsSignature(currentValue) === persistedAssignmentsSignature ? currentValue : hydratedPersistedAssignments
    );
  }, [hydratedPersistedAssignments, persistedAssignmentsSignature]);
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const normalizedAssignments = draftAssignments.filter((assignment) => assignment.rootItemId);
      const nextSettings = writeEngineAssignments(baseSettings, normalizedAssignments);
      await ctx.settings.set(nextSettings);
      setNotice("Carpetas guardadas. Musica ya reacciona en vivo a estas asignaciones.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar las carpetas musicales.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings" }, /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings__copy" }, /* @__PURE__ */ React.createElement("strong", null, "Carpetas reclamadas por el engine musical"), /* @__PURE__ */ React.createElement("p", null, "Solo los audios dentro de estas carpetas se trataran como musica indexada por", /* @__PURE__ */ React.createElement("code", null, MUSICA_ENGINE_ID), ".")), /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings__list" }, draftAssignments.length ? draftAssignments.map((assignment, index) => /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "musicaPluginSettings__row",
      key: `${assignment.rootItemId || assignment.rootPath || "empty"}-${index}`
    },
    /* @__PURE__ */ React.createElement(
      "select",
      {
        value: getAssignmentSelectValue(assignment),
        onChange: (event) => setDraftAssignments(
          (currentValue) => currentValue.map(
            (entry, entryIndex) => entryIndex !== index ? entry : (() => {
              const nextValue = event.target.value;
              const nextOption = folderOptionsById.get(nextValue) || null;
              if (!nextValue) {
                return {
                  ...entry,
                  rootItemId: "",
                  rootPath: ""
                };
              }
              if (nextOption) {
                return {
                  ...entry,
                  rootItemId: nextOption.id,
                  rootPath: nextOption.rootPath
                };
              }
              return {
                ...entry,
                rootItemId: "",
                rootPath: nextValue.replace(/^legacy:/, "")
              };
            })()
          )
        ),
        disabled: saving
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecciona una carpeta"),
      folderOptions.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.id, value: option.id }, option.rootPath || "Vault completo")),
      legacyFolderOptions.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.key, value: option.id }, option.label))
    ),
    /* @__PURE__ */ React.createElement("label", { className: "musicaPluginSettings__checkbox" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: assignment.recursive,
        onChange: (event) => setDraftAssignments(
          (currentValue) => currentValue.map(
            (entry, entryIndex) => entryIndex === index ? {
              ...entry,
              recursive: event.target.checked
            } : entry
          )
        ),
        disabled: saving
      }
    ), /* @__PURE__ */ React.createElement("span", null, "Recursiva")),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "musicaPluginSettings__secondaryButton",
        onClick: () => setDraftAssignments(
          (currentValue) => currentValue.filter((_entry, entryIndex) => entryIndex !== index)
        ),
        disabled: saving
      },
      "Quitar"
    )
  )) : /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings__empty" }, "Sin carpetas asignadas todavia. Fuera de estas carpetas, los audios usaran el fallback global del host.")), /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings__actions" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "musicaPluginSettings__secondaryButton",
      onClick: () => setDraftAssignments((currentValue) => [...currentValue, createEmptyAssignment()]),
      disabled: saving
    },
    "Agregar carpeta"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "musicaPluginSettings__primaryButton",
      onClick: () => void handleSave(),
      disabled: saving
    },
    saving ? "Guardando..." : "Guardar carpetas"
  )), notice ? /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings__notice" }, notice) : null, error ? /* @__PURE__ */ React.createElement("div", { className: "musicaPluginSettings__error" }, error) : null);
}

// ../nexus-plugins/musica/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = "nexus.musica";
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var musicaRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerItemEngine({
      pluginId: ctx.pluginId,
      id: MUSICA_ENGINE_ID,
      displayName: "Musica",
      extensions: ["mp3", "wav", "ogg", "flac", "m4a", "aac", "opus", "oga"],
      mimeTypes: ["audio/*"],
      priority: 320,
      supportsGlobalMatch: false,
      supportsFolderAssignments: true,
      matches: (item) => isSupportedAudioItem(item),
      component: (props) => /* @__PURE__ */ React.createElement(MusicAudioEngine, { ...props, hostApi: props.hostApi || ctx })
    });
    ctx.registerSettingsSection({
      id: "nexus.musica.folder-assignments",
      pluginId: ctx.pluginId,
      title: "Carpetas musicales",
      description: "Elige que carpetas del vault quedan reclamadas por el engine musical especializado.",
      component: () => /* @__PURE__ */ React.createElement(MusicaSettingsSection, { ctx })
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = musicaRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
