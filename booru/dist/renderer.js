const React = window.React;

// ../nexus-plugins/booru/src/constants.js
var BOORU_PLUGIN_ID = "nexus.booru";
var BOORU_WORKSPACE_VIEW_ID = "nexus.booru.workspace";
var BOORU_DEFAULT_SECTION = "media";
var BOORU_SECTION_OPTIONS = [
  { value: "media", label: "Media" },
  { value: "pending", label: "Pendientes" },
  { value: "duplicates", label: "Duplicados" },
  { value: "trash", label: "Papelera" },
  { value: "metrics", label: "Metricas" },
  { value: "authors", label: "Persona" },
  { value: "characters", label: "Characters" },
  { value: "artists", label: "Artists" },
  { value: "universes", label: "Universes" }
];
var BOORU_CLASSIFICATION_LABELS = Object.freeze({
  "unclassified": "Sin clasificar",
  "classified-basic": "Clasificado basico",
  "duplicate-review": "Duplicado en revision"
});
var BOORU_MEDIA_KIND_LABELS = Object.freeze({
  image: "Image",
  video: "Video",
  gif: "GIF"
});
var BOORU_REALITY_OPTIONS = [
  { value: "real", label: "Real" },
  { value: "ficticio", label: "Ficticio" }
];
var BOORU_REALITY_LABELS = Object.freeze({
  real: "Real",
  ficticio: "Ficticio"
});
var BOORU_ENTITY_KIND_LABELS = Object.freeze({
  author: "Persona",
  artist: "Artist",
  character: "Character",
  universe: "Universe"
});

// ../nexus-frontend/src/utils/devLog.js
var DEV_LOG_BATCH_CHANNEL = "dev-log:append-batch";
var { ipcRenderer } = window.require("electron");
var devLogRawConsole = {
  debug: console.debug.bind(console),
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};
var rendererDevLogState = {
  queue: Array.isArray(window.__NEXUS_DEV_LOG_BUFFER__) ? window.__NEXUS_DEV_LOG_BUFFER__ : [],
  flushTimer: null,
  consoleBridgeInstalled: false,
  ipcBridgeInstalled: false,
  initialized: false,
  verbose: window.localStorage?.getItem("NEXUS_DEV_LOG_VERBOSE") === "1"
};
window.__NEXUS_DEV_LOG_BUFFER__ = rendererDevLogState.queue;
window.__NEXUS_DEV_LOG_RUN_ID__ = window.__NEXUS_DEV_LOG_RUN_ID__ || (globalThis.crypto?.randomUUID?.() || `renderer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
function getRendererRunId() {
  return window.__NEXUS_DEV_LOG_RUN_ID__;
}
function shouldMirrorRendererConsole(level) {
  return level === "warn" || level === "error" || level === "fatal";
}
function resolveRendererScope(scope) {
  const normalizedScope = String(scope || "").trim() || "renderer.startup";
  if (normalizedScope.startsWith("renderer.startup")) {
    return {
      process: "renderer",
      surface: "startup",
      subsystem: normalizedScope,
      shard: "40-renderer-startup.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.store") || normalizedScope.startsWith("renderer.items")) {
    return {
      process: "renderer",
      surface: "store",
      subsystem: normalizedScope,
      shard: "41-renderer-store.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.explorer")) {
    return {
      process: "renderer",
      surface: "explorer",
      subsystem: normalizedScope,
      shard: "42-renderer-explorer.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.editors")) {
    return {
      process: "renderer",
      surface: "editors",
      subsystem: normalizedScope,
      shard: "43-renderer-editors.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.plugins")) {
    return {
      process: "renderer",
      surface: "plugins",
      subsystem: normalizedScope,
      shard: "44-renderer-plugins.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.ipc")) {
    return {
      process: "renderer",
      surface: "ipc",
      subsystem: normalizedScope,
      shard: "50-ipc.jsonl"
    };
  }
  return {
    process: "renderer",
    surface: "startup",
    subsystem: normalizedScope,
    shard: "40-renderer-startup.jsonl"
  };
}
function serializeUnknown(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack || null,
      cause: serializeUnknown(value.cause, seen)
    };
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((entry) => serializeUnknown(entry, seen));
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) {
      return "[circular]";
    }
    seen.add(value);
    const serialized = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeUnknown(entry, seen)])
    );
    seen.delete(value);
    return serialized;
  }
  return value ?? null;
}
function buildRendererEvent(partialEvent = {}) {
  return {
    ts: partialEvent.ts || (/* @__PURE__ */ new Date()).toISOString(),
    rendererRunId: partialEvent.rendererRunId || getRendererRunId(),
    process: "renderer",
    surface: partialEvent.surface || "startup",
    subsystem: partialEvent.subsystem || "renderer.startup",
    level: partialEvent.level || "info",
    event: partialEvent.event || "renderer.unspecified",
    message: partialEvent.message || "",
    durationMs: typeof partialEvent.durationMs === "number" ? Number(partialEvent.durationMs.toFixed(2)) : null,
    requestId: partialEvent.requestId || null,
    data: partialEvent.data ? serializeUnknown(partialEvent.data) : null,
    shard: partialEvent.shard || null
  };
}
function queueRendererDevLogEvent(partialEvent = {}) {
  rendererDevLogState.queue.push(buildRendererEvent(partialEvent));
  if (shouldMirrorRendererConsole(partialEvent.level || "info")) {
    const rawMethod = partialEvent.level === "warn" ? devLogRawConsole.warn : devLogRawConsole.error;
    rawMethod(partialEvent.message || partialEvent.event || "", partialEvent.data || "");
  }
  scheduleRendererDevLogFlush();
}
function scheduleRendererDevLogFlush() {
  if (rendererDevLogState.flushTimer) {
    return;
  }
  rendererDevLogState.flushTimer = window.setTimeout(() => {
    rendererDevLogState.flushTimer = null;
    flushRendererDevLogBuffer();
  }, 80);
}
function flushRendererDevLogBuffer() {
  if (!rendererDevLogState.queue.length) {
    return;
  }
  const events = rendererDevLogState.queue.splice(0, rendererDevLogState.queue.length);
  try {
    ipcRenderer.send(DEV_LOG_BATCH_CHANNEL, {
      events
    });
  } catch (error) {
    rendererDevLogState.queue.unshift(...events);
    devLogRawConsole.error("[dev-log] No se pudo flush-ear el batch del renderer.", error);
  }
}
function createRendererDevLogger(scope) {
  const context = resolveRendererScope(scope);
  return {
    context,
    debug(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "debug", event, message, data });
    },
    info(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "info", event, message, data });
    },
    warn(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "warn", event, message, data });
    },
    error(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "error", event, message, data });
    }
  };
}

// ../nexus-plugins/booru/src/icons.jsx
function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    children
  );
}
function BooruIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "4.5", y: "5", width: "15", height: "14", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "m8 14 2.7-2.7a1.3 1.3 0 0 1 1.8 0L16 14.8" }), /* @__PURE__ */ React.createElement("path", { d: "m13 11.5 1.2-1.2a1.3 1.3 0 0 1 1.8 0l2 2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "9.2", r: "1.1" }));
}
function RefreshIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M20 6v5h-5" }), /* @__PURE__ */ React.createElement("path", { d: "M4 18v-5h5" }), /* @__PURE__ */ React.createElement("path", { d: "M18 11a7 7 0 0 0-12-3" }), /* @__PURE__ */ React.createElement("path", { d: "M6 13a7 7 0 0 0 12 3" }));
}
function FolderIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4.75 7.25h4l1.8 1.9h8.7A1.75 1.75 0 0 1 21 10.9v6.35A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V9A1.75 1.75 0 0 1 4.75 7.25Z" }));
}
function PulseIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M3.5 12h3.1l1.8-3.4 3.1 7 2.6-5h6.4" }));
}
function AlertIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 4.7 19 18H5l7-13.3Z" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9.4v3.9" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "15.9", r: ".75", fill: "currentColor", stroke: "none" }));
}

// ../nexus-frontend/src/ui/cx.js
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// ../nexus-frontend/src/ui/WorkspacePage.jsx
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}
function SplitLayout({ className = "", variant = "main-aside", children }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cx(
        "nexus-ui-split",
        variant === "sidebar-detail" ? "nexus-ui-split--sidebar-detail" : "nexus-ui-split--main-aside",
        className
      )
    },
    children
  );
}
function SplitSidebar({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("aside", { className: cx("nexus-ui-split__sidebar", className) }, children);
}
function SplitDetail({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("main", { className: cx("nexus-ui-split__detail", className) }, children);
}
function ScrollRegion({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-scroll-region", className) }, children);
}

// ../nexus-frontend/src/ui/SectionPanel.jsx
function SectionPanel({
  className = "",
  tone = "default",
  padding = "default",
  children
}) {
  return /* @__PURE__ */ React.createElement(
    "section",
    {
      className: cx(
        "nexus-ui-panel",
        tone !== "default" && `nexus-ui-panel--${tone}`,
        padding !== "default" && `nexus-ui-panel--padding-${padding}`,
        className
      )
    },
    children
  );
}
function PanelStack({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-stack", className) }, children);
}

// ../nexus-frontend/src/ui/Actions.jsx
function Button({
  className = "",
  tone = "secondary",
  iconOnly = false,
  children,
  ...props
}) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...props,
      className: cx(
        "nexus-ui-button",
        tone !== "secondary" && `nexus-ui-button--${tone}`,
        iconOnly && "nexus-ui-button--icon",
        className
      )
    },
    children
  );
}
function SegmentedControl({
  className = "",
  options = [],
  value,
  onChange,
  ariaLabel = "Selector"
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-segmented", className), role: "tablist", "aria-label": ariaLabel }, options.map((option) => {
    const optionValue = option.value;
    const active = optionValue === value;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: optionValue,
        type: "button",
        role: "tab",
        "aria-selected": active,
        className: cx("nexus-ui-segmented__button", active && "is-active"),
        onClick: () => onChange?.(optionValue)
      },
      option.icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__icon" }, option.icon) : null,
      /* @__PURE__ */ React.createElement("span", null, option.label)
    );
  }));
}

// ../nexus-frontend/src/ui/Fields.jsx
function Field({
  className = "",
  label = "",
  description = "",
  wide = false,
  children
}) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-field", wide && "nexus-ui-field--wide", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__label" }, label), description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__description" }, description) : null, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-field__control" }, children));
}
function InlineField({
  className = "",
  label = "",
  children,
  grow = false
}) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-inline-field", grow && "nexus-ui-inline-field--grow", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-inline-field__label" }, label), /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-inline-field__control" }, children));
}

// ../nexus-frontend/src/ui/States.jsx
function Notice({ className = "", tone = "info", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-notice", `nexus-ui-notice--${tone}`, className) }, children);
}
function StateBlock({
  className = "",
  tone = "default",
  eyebrow = "",
  title = "",
  description = "",
  centered = false,
  children = null
}) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cx(
        "nexus-ui-state",
        tone !== "default" && `nexus-ui-state--${tone}`,
        centered && "nexus-ui-state--centered",
        className
      )
    },
    eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null,
    title ? /* @__PURE__ */ React.createElement("strong", null, title) : null,
    description ? /* @__PURE__ */ React.createElement("p", null, description) : null,
    children
  );
}
function MetricCard({
  className = "",
  tone = "default",
  eyebrow = "",
  value = "",
  description = "",
  children = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-metric", tone !== "default" && `nexus-ui-metric--${tone}`, className) }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, /* @__PURE__ */ React.createElement("strong", null, value), description ? /* @__PURE__ */ React.createElement("p", null, description) : null, children);
}

// ../nexus-plugins/booru/src/BooruWorkspaceView.jsx
var { clipboard, ipcRenderer: ipcRenderer2, nativeImage, shell } = window.require("electron");
var { pathToFileURL } = window.require("url");
var React2 = window.React;
var { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } = React2;
var ReactDnd = window.__NEXUS_HOST_REACT_DND__ || {};
var ReactDndHtml5Backend = window.__NEXUS_HOST_REACT_DND_HTML5_BACKEND__ || {};
var { useDrag, useDragLayer, useDrop } = ReactDnd;
var { getEmptyImage } = ReactDndHtml5Backend;
var safeUseDrag = typeof useDrag === "function" ? useDrag : (() => [{ isDragging: false }, () => void 0, () => void 0]);
var safeUseDragLayer = typeof useDragLayer === "function" ? useDragLayer : (() => ({
  currentOffset: null,
  isDragging: false,
  itemType: "",
  item: null
}));
var safeUseDrop = typeof useDrop === "function" ? useDrop : (() => [{ isOver: false, canDrop: false }, () => void 0]);
var booruViewLogger = createRendererDevLogger("renderer.plugins.booru");
var RESOURCE_SECTIONS = /* @__PURE__ */ new Set(["media", "pending", "duplicates", "trash"]);
var ENTITY_SECTION_KIND_MAP = Object.freeze({
  authors: "author",
  characters: "character",
  artists: "artist",
  universes: "universe"
});
var ENTITY_KIND_SECTION_MAP = Object.freeze({
  author: "authors",
  character: "characters",
  artist: "artists",
  universe: "universes"
});
var ENTITY_PROFILE_TAB_OPTIONS = [
  { value: "gallery", label: "Galeria" },
  { value: "data", label: "Datos" }
];
var QUICK_FILTER_OPTIONS = [
  { value: "all", label: "Todo" },
  { value: "unclassified", label: "Sin clasificar" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "gif", label: "GIF" }
];
var QUICK_ASSIGN_KIND_OPTIONS = [
  { value: "author", label: "Persona" },
  { value: "character", label: "Characters" },
  { value: "artist", label: "Artists" },
  { value: "universe", label: "Universes" }
];
var BOORU_RESOURCE_DND_TYPE = "nexus.booru.resource-card";
var RESOURCE_PAGE_SIZE = 42;
var RESOURCE_GRID_COLUMNS = 6;
var RESOURCE_SELECTION_SECTIONS = {
  media: { ids: [], activeId: "", mode: "single" },
  pending: { ids: [], activeId: "", mode: "single" },
  duplicates: { ids: [], activeId: "", mode: "single" },
  trash: { ids: [], activeId: "", mode: "single" }
};
var EMPTY_SELECTION_STATE = Object.freeze({
  ids: Object.freeze([]),
  activeId: "",
  mode: "single"
});
var RESOURCE_PAGE_SECTIONS = {
  media: { page: 1, querySignature: "" },
  pending: { page: 1, querySignature: "" },
  duplicates: { page: 1, querySignature: "" },
  trash: { page: 1, querySignature: "" }
};
var ENTITY_PROFILE_PAGE_SECTIONS = {
  authors: { page: 1, profileKey: "" },
  characters: { page: 1, profileKey: "" },
  artists: { page: 1, profileKey: "" },
  universes: { page: 1, profileKey: "" }
};
async function invoke(channel, payload) {
  const response = await ipcRenderer2.invoke(channel, payload);
  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo ejecutar la operacion.");
  }
  return response.data;
}
function normalizeSearchText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
function getActiveSection(input) {
  const requestedSection = typeof input?.section === "string" ? input.section.trim() : "";
  if (BOORU_SECTION_OPTIONS.some((option) => option.value === requestedSection)) {
    return requestedSection;
  }
  return BOORU_DEFAULT_SECTION;
}
function formatFileSize(value) {
  const size = Number(value || 0);
  if (!Number.isFinite(size) || size <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let currentValue = size;
  let unitIndex = 0;
  while (currentValue >= 1024 && unitIndex < units.length - 1) {
    currentValue /= 1024;
    unitIndex += 1;
  }
  return `${currentValue >= 10 || unitIndex === 0 ? currentValue.toFixed(0) : currentValue.toFixed(1)} ${units[unitIndex]}`;
}
function formatDate(value) {
  if (!value) {
    return "";
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(dateValue);
}
function openPath(pathValue) {
  const normalizedPath = String(pathValue || "").trim();
  if (!normalizedPath) {
    return;
  }
  void shell.showItemInFolder(normalizedPath);
}
function toFileUrl(pathValue) {
  const normalizedPath = String(pathValue || "").trim();
  if (!normalizedPath) {
    return "";
  }
  try {
    return pathToFileURL(normalizedPath).href;
  } catch {
    return "";
  }
}
function truncateDiagnosticText(value, maxLength = 1600) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}
function isFormControlElement(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  const interactiveNode = target.closest("input, textarea, select, button, [contenteditable='true']");
  return Boolean(interactiveNode);
}
function summarizeIdsForLog(items, maxCount = 8) {
  return (Array.isArray(items) ? items : []).map((item) => String(item?.id || item || "").trim()).filter(Boolean).slice(0, maxCount);
}
function summarizeEntityFiltersForLog(filters) {
  return (Array.isArray(filters) ? filters : []).map((filter) => ({
    kind: String(filter?.kind || "").trim() || null,
    id: String(filter?.id || "").trim() || null,
    label: String(filter?.label || "").trim() || null
  })).filter((filter) => filter.kind && filter.id);
}
function summarizeResourcesForLog(items) {
  const resourceItems = Array.isArray(items) ? items : [];
  const thumbnailStatusCounts = {
    ready: 0,
    pending: 0,
    error: 0,
    missing: 0
  };
  for (const item of resourceItems) {
    const status = String(item?.thumbnail?.status || "").trim();
    if (status === "ready" || status === "pending" || status === "error") {
      thumbnailStatusCounts[status] += 1;
    } else {
      thumbnailStatusCounts.missing += 1;
    }
  }
  return {
    itemCount: resourceItems.length,
    sampleIds: summarizeIdsForLog(resourceItems),
    thumbnailStatusCounts
  };
}
function logRendererDuration(eventBase, message, durationMs, data = null) {
  const method = durationMs >= 180 ? "info" : "debug";
  booruViewLogger[method](eventBase, message, {
    durationMs: Number(durationMs.toFixed(2)),
    ...data && typeof data === "object" ? data : {}
  });
}
function normalizeSelectedEntities(items) {
  const uniqueItems = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item?.id || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    uniqueItems.push(item);
  }
  return uniqueItems;
}
function normalizeSelectedTags(items) {
  const uniqueItems = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item?.id || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    uniqueItems.push(item);
  }
  return uniqueItems;
}
function uniqueIds(items) {
  const seenIds = /* @__PURE__ */ new Set();
  const normalizedIds = [];
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    normalizedIds.push(itemId);
  }
  return normalizedIds;
}
function findExactEntityMatch(items, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return null;
  }
  return (Array.isArray(items) ? items : []).find((item) => normalizeSearchText(item?.displayName) === normalizedQuery || normalizeSearchText(item?.slug) === normalizedQuery) || null;
}
function resolveDraggedResourceIds(draggedItem) {
  return uniqueIds([
    ...Array.isArray(draggedItem?.resourceIds) ? draggedItem.resourceIds : [],
    ...Array.isArray(draggedItem?.ids) ? draggedItem.ids : [],
    draggedItem?.resourceId,
    draggedItem?.id,
    draggedItem?.primaryId
  ]);
}
function getDragPreviewStyles(currentOffset) {
  if (!currentOffset) {
    return {
      display: "none"
    };
  }
  return {
    transform: `translate(${currentOffset.x + 14}px, ${currentOffset.y + 14}px)`
  };
}
function getQuickAssignTargetDescriptor(node) {
  const targetNode = node?.closest?.("[data-booru-quick-assign-target='true']");
  if (!targetNode) {
    return null;
  }
  const kind = String(targetNode.getAttribute("data-booru-kind") || "").trim();
  const entityId = String(targetNode.getAttribute("data-booru-entity-id") || "").trim();
  const label = String(targetNode.getAttribute("data-booru-label") || "").trim();
  if (!kind || !entityId) {
    return null;
  }
  return {
    kind,
    entityId,
    label: label || null
  };
}
function findExactTagMatch(items, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return null;
  }
  return (Array.isArray(items) ? items : []).find((item) => normalizeSearchText(item?.name) === normalizedQuery) || null;
}
function renderEntityChips(items, emptyLabel) {
  if (!Array.isArray(items) || !items.length) {
    return /* @__PURE__ */ React2.createElement("span", { className: "booruView__metaPlaceholder" }, emptyLabel);
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagRow" }, items.map((item) => /* @__PURE__ */ React2.createElement("span", { key: item.id, className: "booruView__tagChip" }, item?.universe?.displayName ? `${item.displayName} - ${item.universe.displayName}` : item.displayName)));
}
function renderTagChips(items, emptyLabel) {
  if (!Array.isArray(items) || !items.length) {
    return /* @__PURE__ */ React2.createElement("span", { className: "booruView__metaPlaceholder" }, emptyLabel);
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagRow" }, items.map((item) => /* @__PURE__ */ React2.createElement("span", { key: item.id, className: "booruView__tagChip" }, item.name)));
}
function getCharacterUniverse(character) {
  return character?.universe?.id ? character.universe : null;
}
function getDraftUniverseForCharacter(draft, characterId) {
  const normalizedCharacterId = String(characterId || "").trim();
  if (!normalizedCharacterId) {
    return null;
  }
  const universe = draft?.characterUniverses?.[normalizedCharacterId];
  return universe?.id ? universe : null;
}
function resolveCharacterUniverse(draft, character) {
  return getCharacterUniverse(character) || getDraftUniverseForCharacter(draft, character?.id);
}
function pruneCharacterUniverseAssignments(assignments, characters) {
  const allowedCharacterIds = new Set(
    (Array.isArray(characters) ? characters : []).map((item) => String(item?.id || "").trim()).filter(Boolean)
  );
  const nextAssignments = {};
  for (const [characterId, universe] of Object.entries(assignments || {})) {
    if (!allowedCharacterIds.has(characterId) || !universe?.id) {
      continue;
    }
    nextAssignments[characterId] = universe;
  }
  return nextAssignments;
}
function getCommonScalar(resources, key) {
  if (!Array.isArray(resources) || !resources.length) {
    return null;
  }
  const firstValue = resources[0]?.[key] ?? null;
  return resources.every((resource) => (resource?.[key] ?? null) === firstValue) ? firstValue : null;
}
function getCommonItems(resources, key) {
  if (!Array.isArray(resources) || !resources.length) {
    return [];
  }
  const referenceItems = Array.isArray(resources[0]?.[key]) ? resources[0][key] : [];
  const allIdSets = resources.map((resource) => new Set((Array.isArray(resource?.[key]) ? resource[key] : []).map((item) => item.id)));
  return referenceItems.filter((item) => allIdSets.every((idSet) => idSet.has(item.id)));
}
function getCommonIds(resources, key) {
  return getCommonItems(resources, key).map((item) => item.id);
}
function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}
function clampPageNumber(value, totalPages = Number.MAX_SAFE_INTEGER) {
  const normalizedValue = Math.max(1, Number.parseInt(String(value || ""), 10) || 1);
  const normalizedTotalPages = Math.max(1, Number(totalPages || 1));
  return Math.min(normalizedValue, normalizedTotalPages);
}
function normalizeResourcePageState(sectionState, querySignature = "") {
  return {
    page: clampPageNumber(sectionState?.page, Number.MAX_SAFE_INTEGER),
    querySignature: String(sectionState?.querySignature || querySignature || "")
  };
}
function getResourcePageWindow(currentPage, totalPages) {
  const safeCurrentPage = clampPageNumber(currentPage, totalPages);
  const safeTotalPages = Math.max(1, Number(totalPages || 1));
  const pages = [];
  const lastPage = Math.min(safeTotalPages, safeCurrentPage + 8);
  for (let page = safeCurrentPage; page <= lastPage; page += 1) {
    pages.push(page);
  }
  return pages;
}
function getEntityFilterSignature(filters) {
  return (Array.isArray(filters) ? filters : []).map((filter) => `${String(filter?.kind || "").trim()}:${String(filter?.id || "").trim()}`).filter(Boolean).join("|");
}
function mergeResourcesIntoItems(items, nextResources) {
  const nextById = new Map(
    (Array.isArray(nextResources) ? nextResources : []).filter(Boolean).map((item) => [item.id, item])
  );
  if (!nextById.size) {
    return Array.isArray(items) ? items : [];
  }
  return (Array.isArray(items) ? items : []).map((item) => nextById.get(item.id) || item);
}
function normalizeResourceEntityFilters(items) {
  const uniqueItems = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const kind = String(item?.kind || "").trim();
    const id = String(item?.id || "").trim();
    if (!kind || !id) {
      continue;
    }
    const dedupeKey = `${kind}:${id}`;
    if (seenIds.has(dedupeKey)) {
      continue;
    }
    seenIds.add(dedupeKey);
    uniqueItems.push({
      kind,
      id,
      label: String(item?.label || item?.displayName || "").trim() || null
    });
  }
  return uniqueItems;
}
function getEntityFilterChipLabel(filter) {
  const kindLabel = BOORU_ENTITY_KIND_LABELS[String(filter?.kind || "")] || "Entidad";
  const baseLabel = String(filter?.label || "").trim() || kindLabel;
  return `${kindLabel}: ${baseLabel}`;
}
function normalizeEntityProfileInput(value, sectionKind = null) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const kind = String(value?.kind || "").trim();
  const id = String(value?.id || "").trim();
  const tab = String(value?.tab || "").trim() === "data" ? "data" : "gallery";
  if (!kind || !id || !ENTITY_KIND_SECTION_MAP[kind]) {
    return null;
  }
  if (sectionKind && sectionKind !== kind) {
    return null;
  }
  return {
    kind,
    id,
    tab
  };
}
function getEntityProfileKey(entityProfile) {
  if (!entityProfile?.kind || !entityProfile?.id) {
    return "";
  }
  return `${entityProfile.kind}:${entityProfile.id}`;
}
function getEntityProfileLabel(entityProfile, profileData = null) {
  return String(
    profileData?.displayName || entityProfile?.displayName || entityProfile?.label || ""
  ).trim();
}
function canUseResourceAsEntityVisual(resource) {
  const mediaKind = String(resource?.mediaKind || "").trim();
  return mediaKind === "image" || mediaKind === "gif";
}
function buildContextResourceFromDescriptor(descriptor) {
  const resourceId = String(descriptor?.sampleResourceId || descriptor?.id || "").trim();
  const previewPath = String(descriptor?.sampleStoragePath || descriptor?.cardPreviewPath || "").trim();
  const storagePath = String(
    descriptor?.storagePath || descriptor?.cardStoragePath || descriptor?.sampleStoragePath || descriptor?.cardPreviewPath || ""
  ).trim();
  const mediaKind = String(
    descriptor?.sampleMediaKind || descriptor?.cardMediaKind || descriptor?.mediaKind || ""
  ).trim();
  if (!resourceId || !storagePath || !canUseResourceAsEntityVisual({ mediaKind })) {
    return null;
  }
  return {
    id: resourceId,
    storagePath,
    previewPath,
    mediaKind
  };
}
function getInitials(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) {
    return "?";
  }
  return words.map((word) => word[0]?.toUpperCase() || "").join("");
}
function stepSuggestionIndex(currentIndex, length, direction) {
  if (!length) {
    return -1;
  }
  if (currentIndex < 0) {
    return direction > 0 ? 0 : length - 1;
  }
  return (currentIndex + direction + length) % length;
}
function normalizeSectionSelection(sectionState, visibleIds = null) {
  const nextIds = Array.isArray(sectionState?.ids) ? sectionState.ids.filter(Boolean) : [];
  const allowedIds = visibleIds instanceof Set ? nextIds.filter((resourceId) => visibleIds.has(resourceId)) : nextIds;
  const collapsedByVisibility = visibleIds instanceof Set && allowedIds.length < nextIds.length;
  const nextMode = allowedIds.length > 0 && sectionState?.mode === "multi" && !(collapsedByVisibility && allowedIds.length === 1) ? "multi" : "single";
  const nextActiveId = allowedIds.includes(sectionState?.activeId) ? sectionState.activeId : allowedIds.at(-1) || "";
  return {
    ids: allowedIds,
    activeId: nextActiveId,
    mode: nextMode
  };
}
function markDraftDirty(draft, fieldName) {
  const dirtyFields = new Set(Array.isArray(draft?.dirtyFields) ? draft.dirtyFields : []);
  dirtyFields.add(fieldName);
  return {
    ...draft,
    dirtyFields: Array.from(dirtyFields)
  };
}
function buildClassificationDraft(resources) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);
  if (!normalizedResources.length) {
    return {
      resourceIds: [],
      reality: null,
      authors: [],
      artists: [],
      characters: [],
      universes: [],
      manualTags: [],
      characterUniverses: {},
      dirtyFields: []
    };
  }
  if (normalizedResources.length === 1) {
    const resource = normalizedResources[0];
    return {
      resourceIds: [resource.id],
      reality: resource.reality || null,
      authors: Array.isArray(resource.authors) ? resource.authors : [],
      artists: Array.isArray(resource.artists) ? resource.artists : [],
      characters: Array.isArray(resource.characters) ? resource.characters : [],
      universes: Array.isArray(resource.universes) ? resource.universes : [],
      manualTags: Array.isArray(resource.manualTags) ? resource.manualTags : [],
      characterUniverses: {},
      dirtyFields: []
    };
  }
  return {
    resourceIds: normalizedResources.map((resource) => resource.id),
    reality: getCommonScalar(normalizedResources, "reality"),
    authors: getCommonItems(normalizedResources, "authors"),
    artists: getCommonItems(normalizedResources, "artists"),
    characters: getCommonItems(normalizedResources, "characters"),
    universes: getCommonItems(normalizedResources, "universes"),
    manualTags: getCommonItems(normalizedResources, "manualTags"),
    characterUniverses: {},
    dirtyFields: []
  };
}
function canSaveClassification(draft) {
  if (!draft?.resourceIds?.length || !draft?.reality) {
    return false;
  }
  if (draft.reality === "real") {
    return Array.isArray(draft.authors) && draft.authors.length > 0;
  }
  if (draft.reality === "ficticio") {
    return (Array.isArray(draft.characters) && draft.characters.length > 0 || Array.isArray(draft.universes) && draft.universes.length > 0) && draft.characters.every((character) => Boolean(resolveCharacterUniverse(draft, character)));
  }
  return false;
}
function canSaveDraftProgress(draft) {
  return Array.isArray(draft?.dirtyFields) && draft.dirtyFields.length > 0;
}
function buildRelationPatch(currentIds, nextIds) {
  return {
    addIds: nextIds.filter((entry) => !currentIds.includes(entry)),
    removeIds: currentIds.filter((entry) => !nextIds.includes(entry))
  };
}
function buildSavePayload(selectedResources, draft) {
  const normalizedResources = (Array.isArray(selectedResources) ? selectedResources : []).filter(Boolean);
  const dirtyFields = Array.isArray(draft?.dirtyFields) ? draft.dirtyFields : [];
  const characterUniverseAssignments = (Array.isArray(draft?.characters) ? draft.characters : []).map((character) => {
    const assignedUniverse = getDraftUniverseForCharacter(draft, character.id);
    if (!assignedUniverse) {
      return null;
    }
    const currentUniverseId = getCharacterUniverse(character)?.id || "";
    if (normalizedResources.length === 1 && currentUniverseId === assignedUniverse.id) {
      return null;
    }
    return {
      characterId: character.id,
      universeId: assignedUniverse.id
    };
  }).filter(Boolean);
  if (normalizedResources.length === 1) {
    return {
      resourceId: normalizedResources[0].id,
      dirtyFields,
      reality: draft.reality,
      authorIds: draft.authors.map((item) => item.id),
      artistIds: draft.artists.map((item) => item.id),
      characterIds: draft.characters.map((item) => item.id),
      universeIds: draft.universes.map((item) => item.id),
      tagIds: draft.manualTags.map((item) => item.id),
      characterUniverses: characterUniverseAssignments
    };
  }
  return {
    resourceIds: normalizedResources.map((resource) => resource.id),
    dirtyFields,
    reality: draft.reality,
    authorPatch: buildRelationPatch(getCommonIds(normalizedResources, "authors"), draft.authors.map((item) => item.id)),
    artistPatch: buildRelationPatch(getCommonIds(normalizedResources, "artists"), draft.artists.map((item) => item.id)),
    characterPatch: buildRelationPatch(getCommonIds(normalizedResources, "characters"), draft.characters.map((item) => item.id)),
    universePatch: buildRelationPatch(getCommonIds(normalizedResources, "universes"), draft.universes.map((item) => item.id)),
    tagPatch: buildRelationPatch(getCommonIds(normalizedResources, "manualTags"), draft.manualTags.map((item) => item.id)),
    characterUniverses: characterUniverseAssignments
  };
}
function isTextInputTarget(target) {
  const nodeName = String(target?.nodeName || "").toLowerCase();
  if (target?.isContentEditable) {
    return true;
  }
  return nodeName === "input" || nodeName === "textarea" || nodeName === "select" || nodeName === "button";
}
function composeFrameStatusTitle(snapshot, { loading, busyAction, savingClassification, resourceLoading }) {
  const watcher = snapshot?.watcher || null;
  const pendingCount = Number(watcher?.pendingCount || 0);
  const thumbnailBacklogCount = Number(snapshot?.stats?.thumbnailBacklogCount || 0);
  const thumbnailReadyCount = Number(snapshot?.stats?.thumbnailReadyCount || 0);
  const thumbnailErrorCount = Number(snapshot?.stats?.thumbnailErrorCount || 0);
  const thumbnailActiveCount = Number(snapshot?.derivatives?.activeCount || 0);
  const working = loading || resourceLoading || Boolean(busyAction) || savingClassification || pendingCount > 0 || thumbnailActiveCount > 0 || thumbnailBacklogCount > 0;
  const blocked = watcher?.stage === "error" || String(watcher?.stage || "").startsWith("blocked");
  if (!working && !blocked) {
    return "";
  }
  const lines = [];
  if (blocked) {
    lines.push("Booru necesita atencion.");
  } else if (pendingCount > 0) {
    lines.push(`Booru esta procesando ${pendingCount} archivo${pendingCount === 1 ? "" : "s"}.`);
  } else if (thumbnailActiveCount > 0 || thumbnailBacklogCount > 0) {
    lines.push(`Booru esta generando previews (${thumbnailReadyCount} listas, ${thumbnailBacklogCount} pendientes).`);
  } else if (busyAction === "rescan") {
    lines.push("Booru esta releyendo la carpeta vigilada.");
  } else if (busyAction === "restart") {
    lines.push("Booru esta reiniciando el watcher.");
  } else if (savingClassification) {
    lines.push("Booru esta guardando cambios en la seleccion.");
  } else {
    lines.push("Booru esta actualizando su estado.");
  }
  if (watcher?.lastError) {
    lines.push(watcher.lastError);
  } else if (snapshot?.derivatives?.lastError) {
    lines.push(snapshot.derivatives.lastError);
  } else if (watcher?.lastIngestedOriginalFilename) {
    lines.push(`Ultimo importado: ${watcher.lastIngestedOriginalFilename}`);
  }
  if (thumbnailErrorCount > 0) {
    lines.push(`${thumbnailErrorCount} thumbnail${thumbnailErrorCount === 1 ? "" : "s"} con error.`);
  }
  lines.push("Click para abrir Metricas.");
  return lines.join("\n");
}
function mergeSnapshotQueueRequest(currentRequest, nextRequest) {
  const normalizedCurrent = currentRequest && typeof currentRequest === "object" ? currentRequest : {
    silent: true,
    syncResources: false,
    reasons: []
  };
  const normalizedNext = nextRequest && typeof nextRequest === "object" ? nextRequest : {
    silent: true,
    syncResources: false,
    reasons: []
  };
  return {
    silent: Boolean(normalizedCurrent.silent) && Boolean(normalizedNext.silent),
    syncResources: Boolean(normalizedCurrent.syncResources) || Boolean(normalizedNext.syncResources),
    reasons: Array.from(/* @__PURE__ */ new Set([
      ...Array.isArray(normalizedCurrent.reasons) ? normalizedCurrent.reasons : [],
      ...Array.isArray(normalizedNext.reasons) ? normalizedNext.reasons : []
    ])).slice(-6)
  };
}
function MediaThumbnail({
  pathValue,
  mediaKind,
  alt = "",
  className = "",
  controls = false,
  large = false,
  thumbnail = null,
  highPriority = false,
  preferOriginalWhenThumbnailMissing = true
}) {
  const originalUrl = toFileUrl(pathValue);
  const thumbnailUrl = !controls && thumbnail?.status === "ready" ? toFileUrl(thumbnail?.storagePath) : "";
  const canUseOriginalPreview = preferOriginalWhenThumbnailMissing && mediaKind !== "video";
  const imageUrl = controls ? originalUrl : thumbnailUrl || (canUseOriginalPreview ? originalUrl : "");
  const pendingThumbnail = !controls && !thumbnailUrl && !canUseOriginalPreview && (!thumbnail || thumbnail?.status === "pending");
  const erroredThumbnail = !controls && thumbnail?.status === "error";
  const lastErrorSignatureRef = useRef("");
  const previewSource = controls ? mediaKind === "video" ? "original-video" : "original-image" : thumbnailUrl ? "thumbnail" : canUseOriginalPreview ? "original-fallback" : "placeholder";
  const handlePreviewError = (failedUrl) => {
    const normalizedUrl = String(failedUrl || "").trim();
    const signature = [
      mediaKind,
      previewSource,
      controls ? "interactive" : "card",
      normalizedUrl,
      String(thumbnail?.status || ""),
      String(pathValue || "")
    ].join("|");
    if (lastErrorSignatureRef.current === signature) {
      return;
    }
    lastErrorSignatureRef.current = signature;
    booruViewLogger.info(
      "booru.media-preview.error",
      "Booru detecto un fallo de carga en una preview de media.",
      {
        mediaKind,
        previewSource,
        controls,
        large,
        sourceUrl: normalizedUrl || null,
        originalPath: String(pathValue || "").trim() || null,
        thumbnailStatus: String(thumbnail?.status || "").trim() || null,
        thumbnailPath: String(thumbnail?.storagePath || "").trim() || null
      }
    );
  };
  if (controls && mediaKind === "video" && originalUrl) {
    return /* @__PURE__ */ React2.createElement(
      "video",
      {
        className: [
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className
        ].filter(Boolean).join(" "),
        src: originalUrl,
        muted: !controls,
        playsInline: true,
        preload: "metadata",
        controls,
        onError: () => handlePreviewError(originalUrl)
      }
    );
  }
  if (imageUrl) {
    return /* @__PURE__ */ React2.createElement(
      "img",
      {
        className: [
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className
        ].filter(Boolean).join(" "),
        src: imageUrl,
        alt,
        loading: controls ? void 0 : "lazy",
        decoding: controls ? void 0 : "async",
        fetchPriority: highPriority ? "high" : "low",
        draggable: "false",
        onError: () => handlePreviewError(imageUrl)
      }
    );
  }
  if (pendingThumbnail) {
    return /* @__PURE__ */ React2.createElement("div", { className: ["booruView__previewPlaceholder", large ? "is-large" : "", className].filter(Boolean).join(" ") }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__previewPlaceholderShimmer" }));
  }
  return /* @__PURE__ */ React2.createElement("div", { className: ["booruView__previewFallback", large ? "is-large" : "", className].filter(Boolean).join(" ") }, /* @__PURE__ */ React2.createElement("span", null, erroredThumbnail ? "Preview" : BOORU_MEDIA_KIND_LABELS[mediaKind] || "Media"));
}
function FloatingContextMenu({ state, onClose, onAction }) {
  useEffect(() => {
    if (!state) {
      return void 0;
    }
    const handlePointerDown = () => onClose?.();
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, state]);
  if (!state?.items?.length) {
    return null;
  }
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "booruView__contextMenu",
      style: {
        left: Math.max(8, state.x),
        top: Math.max(8, state.y)
      },
      onPointerDown: (event) => event.stopPropagation()
    },
    state.items.map((item) => /* @__PURE__ */ React2.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: [
          "booruView__contextMenuItem",
          item.danger ? "is-danger" : ""
        ].filter(Boolean).join(" "),
        onClick: () => onAction?.(item.id),
        disabled: item.disabled
      },
      item.label
    ))
  );
}
function BooruDragPreviewLayer({ resourcesById, customDragState = null }) {
  if (customDragState?.active) {
    const primaryResource = resourcesById.get(customDragState.primaryId) || customDragState.primaryResource || null;
    return /* @__PURE__ */ React2.createElement("div", { className: "booruView__dragPreviewLayer" }, /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: [
          "booruView__dragPreview",
          customDragState.resourceIds?.length > 1 ? "is-multi" : ""
        ].filter(Boolean).join(" "),
        style: getDragPreviewStyles({
          x: customDragState.x,
          y: customDragState.y
        })
      },
      /* @__PURE__ */ React2.createElement("div", { className: "booruView__dragPreviewThumb" }, primaryResource ? /* @__PURE__ */ React2.createElement(
        MediaThumbnail,
        {
          pathValue: primaryResource.storagePath,
          mediaKind: primaryResource.mediaKind,
          alt: primaryResource.originalFilename,
          thumbnail: primaryResource.thumbnail,
          preferOriginalWhenThumbnailMissing: true
        }
      ) : /* @__PURE__ */ React2.createElement("div", { className: "booruView__previewFallback" }, "Media")),
      /* @__PURE__ */ React2.createElement("div", { className: "booruView__dragPreviewCopy" }, /* @__PURE__ */ React2.createElement("span", null, primaryResource?.originalFilename || "Moviendo recurso"), /* @__PURE__ */ React2.createElement("small", null, customDragState.overTarget?.label ? `Soltar en ${customDragState.overTarget.label}` : customDragState.resourceIds?.length > 1 ? `${customDragState.resourceIds.length} recursos` : "Arrastra hacia una asignacion rapida"))
    ));
  }
  const dragLayerState = safeUseDragLayer((monitor) => ({
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem()
  }));
  const dragSummary = useMemo(() => {
    const draggedIds = resolveDraggedResourceIds(dragLayerState.item);
    if (!draggedIds.length) {
      return null;
    }
    const primaryId = String(dragLayerState.item?.primaryId || draggedIds[0] || "").trim();
    const primaryResource = resourcesById.get(primaryId) || resourcesById.get(draggedIds[0]) || null;
    return {
      count: draggedIds.length,
      label: primaryResource?.originalFilename || "Moviendo recurso",
      primaryResource
    };
  }, [dragLayerState.item, resourcesById]);
  if (!dragLayerState.isDragging || dragLayerState.itemType !== BOORU_RESOURCE_DND_TYPE || !dragSummary) {
    return null;
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__dragPreviewLayer" }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: [
        "booruView__dragPreview",
        dragSummary.count > 1 ? "is-multi" : ""
      ].filter(Boolean).join(" "),
      style: getDragPreviewStyles(dragLayerState.currentOffset)
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__dragPreviewThumb" }, dragSummary.primaryResource ? /* @__PURE__ */ React2.createElement(
      MediaThumbnail,
      {
        pathValue: dragSummary.primaryResource.storagePath,
        mediaKind: dragSummary.primaryResource.mediaKind,
        alt: dragSummary.primaryResource.originalFilename,
        thumbnail: dragSummary.primaryResource.thumbnail,
        preferOriginalWhenThumbnailMissing: true
      }
    ) : /* @__PURE__ */ React2.createElement("div", { className: "booruView__previewFallback" }, "Media")),
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__dragPreviewCopy" }, /* @__PURE__ */ React2.createElement("span", null, dragSummary.label), dragSummary.count > 1 ? /* @__PURE__ */ React2.createElement("small", null, dragSummary.count, " recursos") : null)
  ));
}
function ResourceGridCard({
  item,
  absoluteIndex,
  selected,
  multiSelected,
  dragResourceIds,
  customDragActive = false,
  onCustomDragPointerDown,
  shouldSuppressClick,
  onSelect,
  onContextMenu
}) {
  const normalizedDragResourceIds = useMemo(
    () => uniqueIds(Array.isArray(dragResourceIds) ? dragResourceIds : [item.id]),
    [dragResourceIds, item.id]
  );
  const [{ isDragging }, dragRef, previewRef] = safeUseDrag(() => ({
    type: BOORU_RESOURCE_DND_TYPE,
    item: () => {
      const payload = {
        id: item.id,
        ids: normalizedDragResourceIds,
        primaryId: item.id,
        resourceId: item.id,
        resourceIds: normalizedDragResourceIds
      };
      booruViewLogger.debug(
        "booru.dnd.drag.start",
        "Booru inicio el arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          selected,
          multiSelected
        }
      );
      return payload;
    },
    canDrag: () => Boolean(item?.id),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (_draggedItem, monitor) => {
      booruViewLogger.debug(
        "booru.dnd.drag.end",
        "Booru termino un arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          didDrop: monitor.didDrop()
        }
      );
    }
  }), [item.id, multiSelected, normalizedDragResourceIds, selected]);
  useEffect(() => {
    if (typeof previewRef === "function" && typeof getEmptyImage === "function") {
      previewRef(getEmptyImage(), {
        captureDraggingState: true
      });
    }
  }, [previewRef]);
  const handleDragRef = useCallback((node) => {
    dragRef(node);
  }, [dragRef]);
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(item, event);
    }
  };
  const handleClick = (event) => {
    if (shouldSuppressClick?.()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onSelect?.(item, event);
  };
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: handleDragRef,
      role: "button",
      tabIndex: 0,
      className: [
        "booruView__mediaCard",
        selected ? "is-selected" : "",
        multiSelected ? "is-multi-selected" : "",
        customDragActive ? "is-custom-dragging" : "",
        isDragging ? "is-dragging" : ""
      ].filter(Boolean).join(" "),
      onClick: handleClick,
      onContextMenu: (event) => onContextMenu?.(item, event),
      onKeyDown: handleKeyDown,
      onPointerDown: (event) => onCustomDragPointerDown?.({
        event,
        item,
        resourceIds: normalizedDragResourceIds
      }),
      onDragStart: () => {
        booruViewLogger.debug(
          "booru.dnd.drag.dom-start",
          "El navegador disparo dragstart sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds
          }
        );
      },
      onDragEnd: () => {
        booruViewLogger.debug(
          "booru.dnd.drag.dom-end",
          "El navegador disparo dragend sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds
          }
        );
      },
      "aria-label": item.originalFilename,
      "aria-selected": selected
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__mediaCardPreview" }, /* @__PURE__ */ React2.createElement(
      MediaThumbnail,
      {
        pathValue: item.storagePath,
        mediaKind: item.mediaKind,
        alt: item.originalFilename,
        thumbnail: item.thumbnail,
        highPriority: absoluteIndex < RESOURCE_GRID_COLUMNS || selected,
        preferOriginalWhenThumbnailMissing: true
      }
    ))
  );
}
function ResourcePagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange
}) {
  const totalPages = Math.max(1, Math.ceil(Number(totalCount || 0) / Math.max(1, Number(pageSize || 1))));
  const [pageInputValue, setPageInputValue] = useState(String(currentPage || 1));
  useEffect(() => {
    setPageInputValue(String(currentPage || 1));
  }, [currentPage]);
  if (totalPages <= 1) {
    return null;
  }
  const safeCurrentPage = clampPageNumber(currentPage, totalPages);
  const pageWindow = getResourcePageWindow(safeCurrentPage, totalPages);
  const commitPageInput = () => {
    onPageChange?.(clampPageNumber(pageInputValue, totalPages));
  };
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__pagination" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__paginationButtons" }, /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(1),
      disabled: safeCurrentPage <= 1,
      "aria-label": "Ir a la primera pagina"
    },
    "<<"
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(safeCurrentPage - 1),
      disabled: safeCurrentPage <= 1,
      "aria-label": "Ir a la pagina anterior"
    },
    "<"
  ), pageWindow.map((pageNumber) => /* @__PURE__ */ React2.createElement(
    Button,
    {
      key: pageNumber,
      type: "button",
      tone: pageNumber === safeCurrentPage ? "primary" : "secondary",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(pageNumber),
      "aria-label": `Ir a la pagina ${pageNumber}`
    },
    pageNumber
  )), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(safeCurrentPage + 1),
      disabled: safeCurrentPage >= totalPages,
      "aria-label": "Ir a la pagina siguiente"
    },
    ">"
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(totalPages),
      disabled: safeCurrentPage >= totalPages,
      "aria-label": "Ir a la ultima pagina"
    },
    ">>"
  )), /* @__PURE__ */ React2.createElement("div", { className: "booruView__paginationJump" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "number",
      min: 1,
      max: totalPages,
      value: pageInputValue,
      onChange: (event) => setPageInputValue(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitPageInput();
        }
      },
      "aria-label": "Numero de pagina"
    }
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: commitPageInput
    },
    "Ir"
  )));
}
function ResourceGrid({
  items,
  selectedIds,
  selectionMode = "single",
  customDragState = null,
  onCustomDragPointerDown,
  shouldSuppressClick,
  totalCount,
  loading,
  scrollKey,
  currentPage,
  pageSize,
  onPageChange,
  onSelect,
  onContextMenu,
  onClearSelection,
  emptyTitle,
  emptyDescription
}) {
  const contentRef = useRef(null);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [scrollKey]);
  return /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, loading && !items.length ? /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: "Cargando media",
      description: "Leyendo la pagina actual de Booru."
    }
  ) : items.length ? /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: contentRef,
      className: "booruView__resourcePanelBody",
      onPointerDown: (event) => {
        if (event.target === event.currentTarget) {
          onClearSelection?.();
        }
      }
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__resourcePanelContent" }, /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "booruView__mediaGrid booruView__mediaGrid--paged",
        onPointerDown: (event) => {
          if (event.target === event.currentTarget) {
            onClearSelection?.();
          }
        }
      },
      items.map((item, absoluteIndex) => {
        const selected = selectedIds.includes(item.id);
        return /* @__PURE__ */ React2.createElement(
          ResourceGridCard,
          {
            key: item.id,
            item,
            absoluteIndex,
            selected,
            multiSelected: selected && selectionMode === "multi",
            dragResourceIds: selected ? selectedIds : [item.id],
            customDragActive: Boolean(customDragState?.active && customDragState.resourceIds?.includes(item.id)),
            onCustomDragPointerDown,
            shouldSuppressClick,
            onSelect,
            onContextMenu
          }
        );
      })
    ), /* @__PURE__ */ React2.createElement(
      ResourcePagination,
      {
        currentPage,
        totalCount,
        pageSize,
        onPageChange
      }
    ))
  ) : /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: emptyTitle,
      description: emptyDescription
    }
  ));
}
function SingleEntityAutocompleteField({
  kind,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  buttonLabel = "Asignar"
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    void invoke("booru:list-entities", { kind, query: trimmedQuery }).then((data) => {
      if (cancelled) {
        return;
      }
      const currentValueId = String(value?.id || "").trim();
      setSuggestions(
        (Array.isArray(data?.items) ? data.items : []).filter((item) => item.id !== currentValueId)
      );
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar sugerencias."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [kind, query, value]);
  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);
  const handleSelectEntity = (entity) => {
    onChange?.(entity);
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };
  const handleEnsureEntity = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || disabled) {
      return;
    }
    const exactSuggestion = findExactEntityMatch(suggestions, trimmedQuery);
    if (exactSuggestion) {
      handleSelectEntity(exactSuggestion);
      return;
    }
    setLoading(true);
    try {
      const result = await invoke("booru:ensure-entity", { kind, name: trimmedQuery });
      handleSelectEntity(result.entity);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la entidad."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInlineEditor" }, value ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__entitySelection" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__selectionChip" }, /* @__PURE__ */ React2.createElement("span", null, value.displayName), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "booruView__selectionChipRemove",
      onClick: () => onChange?.(null),
      disabled,
      "aria-label": `Quitar ${value.displayName}`
    },
    "x"
  ))) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "text",
      value: query,
      onChange: (event) => setQuery(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, -1));
          return;
        }
        if (event.key === "Escape") {
          setQuery("");
          setSuggestions([]);
          setHighlightedIndex(-1);
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            handleSelectEntity(suggestions[highlightedIndex]);
            return;
          }
          void handleEnsureEntity();
        }
      },
      placeholder: placeholder || `Buscar ${label.toLowerCase()} o crear uno nuevo`,
      disabled,
      "aria-label": label
    }
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void handleEnsureEntity(),
      disabled: !String(query || "").trim() || disabled
    },
    buttonLabel
  )), error ? /* @__PURE__ */ React2.createElement("p", { className: "booruView__fieldError" }, error) : null, String(query || "").trim() ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__suggestions" }, loading ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando sugerencias...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React2.createElement(
    "button",
    {
      key: item.id,
      type: "button",
      className: [
        "booruView__suggestion",
        highlightedIndex === index ? "is-highlighted" : ""
      ].filter(Boolean).join(" "),
      onClick: () => handleSelectEntity(item)
    },
    /* @__PURE__ */ React2.createElement("span", null, item.displayName),
    /* @__PURE__ */ React2.createElement("small", null, item.resourceCount, " recursos")
  )) : /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Sin coincidencias. Enter crea ", BOORU_ENTITY_KIND_LABELS[kind]?.toLowerCase() || "la entidad", ".")) : null);
}
function EntityAutocompleteField({
  kind,
  label,
  description,
  required = false,
  selectedItems,
  onChange,
  disabled = false
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    void invoke("booru:list-entities", { kind, query: trimmedQuery }).then((data) => {
      if (cancelled) {
        return;
      }
      const selectedIds = new Set((Array.isArray(selectedItems) ? selectedItems : []).map((item) => item.id));
      setSuggestions(
        (Array.isArray(data?.items) ? data.items : []).filter((item) => !selectedIds.has(item.id))
      );
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar sugerencias."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [kind, query, selectedItems]);
  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);
  const handleSelectEntity = (entity) => {
    onChange?.(normalizeSelectedEntities([...selectedItems || [], entity]));
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };
  const handleEnsureEntity = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || disabled) {
      return;
    }
    const existingSelectedMatch = findExactEntityMatch(selectedItems, trimmedQuery);
    if (existingSelectedMatch) {
      setQuery("");
      setSuggestions([]);
      setError("");
      return;
    }
    const exactSuggestion = findExactEntityMatch(suggestions, trimmedQuery);
    if (exactSuggestion) {
      handleSelectEntity(exactSuggestion);
      return;
    }
    setLoading(true);
    try {
      const result = await invoke("booru:ensure-entity", { kind, name: trimmedQuery });
      handleSelectEntity(result.entity);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la entidad."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React2.createElement(
    Field,
    {
      label: required ? `${label} (requerido)` : label,
      description,
      className: "booruView__field"
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityEditor" }, Array.isArray(selectedItems) && selectedItems.length ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__entitySelection" }, selectedItems.map((item) => /* @__PURE__ */ React2.createElement("span", { key: item.id, className: "booruView__selectionChip" }, /* @__PURE__ */ React2.createElement("span", null, item.displayName), /* @__PURE__ */ React2.createElement(
      "button",
      {
        type: "button",
        className: "booruView__selectionChipRemove",
        onClick: () => onChange?.(selectedItems.filter((entry) => entry.id !== item.id)),
        disabled,
        "aria-label": `Quitar ${item.displayName}`
      },
      "x"
    )))) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React2.createElement(
      "input",
      {
        type: "text",
        value: query,
        onChange: (event) => setQuery(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, 1));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, -1));
            return;
          }
          if (event.key === "Escape") {
            setQuery("");
            setSuggestions([]);
            setHighlightedIndex(-1);
            return;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
              handleSelectEntity(suggestions[highlightedIndex]);
              return;
            }
            void handleEnsureEntity();
          }
        },
        placeholder: `Buscar ${label.toLowerCase()} o crear uno nuevo`,
        disabled
      }
    ), /* @__PURE__ */ React2.createElement(
      Button,
      {
        type: "button",
        onClick: () => void handleEnsureEntity(),
        disabled: !String(query || "").trim() || disabled
      },
      "Agregar"
    )), error ? /* @__PURE__ */ React2.createElement("p", { className: "booruView__fieldError" }, error) : null, String(query || "").trim() ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__suggestions" }, loading ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando sugerencias...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React2.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: [
          "booruView__suggestion",
          highlightedIndex === index ? "is-highlighted" : ""
        ].filter(Boolean).join(" "),
        onClick: () => handleSelectEntity(item)
      },
      /* @__PURE__ */ React2.createElement("span", null, item.displayName),
      /* @__PURE__ */ React2.createElement("small", null, item.resourceCount, " recursos")
    )) : /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Sin coincidencias. Enter crea ", BOORU_ENTITY_KIND_LABELS[kind]?.toLowerCase() || "la entidad", ".")) : null)
  );
}
function TagAutocompleteField({
  label,
  description,
  selectedItems,
  onChange,
  disabled = false
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    void invoke("booru:list-tags", { query: trimmedQuery }).then((data) => {
      if (cancelled) {
        return;
      }
      const selectedIds = new Set((Array.isArray(selectedItems) ? selectedItems : []).map((item) => item.id));
      setSuggestions(
        (Array.isArray(data?.items) ? data.items : []).filter((item) => !selectedIds.has(item.id))
      );
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar las tags."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query, selectedItems]);
  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);
  const handleSelectTag = (tag) => {
    onChange?.(normalizeSelectedTags([...selectedItems || [], tag]));
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };
  const handleEnsureTag = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || disabled) {
      return;
    }
    const existingSelectedMatch = findExactTagMatch(selectedItems, trimmedQuery);
    if (existingSelectedMatch) {
      setQuery("");
      setSuggestions([]);
      setError("");
      return;
    }
    const exactSuggestion = findExactTagMatch(suggestions, trimmedQuery);
    if (exactSuggestion) {
      handleSelectTag(exactSuggestion);
      return;
    }
    setLoading(true);
    try {
      const result = await invoke("booru:ensure-tag", { name: trimmedQuery });
      handleSelectTag(result.tag);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la tag."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React2.createElement(
    Field,
    {
      label,
      description,
      className: "booruView__field"
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityEditor" }, Array.isArray(selectedItems) && selectedItems.length ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__entitySelection" }, selectedItems.map((item) => /* @__PURE__ */ React2.createElement("span", { key: item.id, className: "booruView__selectionChip" }, /* @__PURE__ */ React2.createElement("span", null, item.name), /* @__PURE__ */ React2.createElement(
      "button",
      {
        type: "button",
        className: "booruView__selectionChipRemove",
        onClick: () => onChange?.(selectedItems.filter((entry) => entry.id !== item.id)),
        disabled,
        "aria-label": `Quitar ${item.name}`
      },
      "x"
    )))) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React2.createElement(
      "input",
      {
        type: "text",
        value: query,
        onChange: (event) => setQuery(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, 1));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, -1));
            return;
          }
          if (event.key === "Escape") {
            setQuery("");
            setSuggestions([]);
            setHighlightedIndex(-1);
            return;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
              handleSelectTag(suggestions[highlightedIndex]);
              return;
            }
            void handleEnsureTag();
          }
        },
        placeholder: "Buscar tag o crear una nueva",
        disabled
      }
    ), /* @__PURE__ */ React2.createElement(
      Button,
      {
        type: "button",
        onClick: () => void handleEnsureTag(),
        disabled: !String(query || "").trim() || disabled
      },
      "Agregar"
    )), error ? /* @__PURE__ */ React2.createElement("p", { className: "booruView__fieldError" }, error) : null, String(query || "").trim() ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__suggestions" }, loading ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando tags...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React2.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: [
          "booruView__suggestion",
          highlightedIndex === index ? "is-highlighted" : ""
        ].filter(Boolean).join(" "),
        onClick: () => handleSelectTag(item)
      },
      /* @__PURE__ */ React2.createElement("span", null, item.name),
      /* @__PURE__ */ React2.createElement("small", null, item.resourceCount, " recursos")
    )) : /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Sin coincidencias. Enter crea la tag manual.")) : null)
  );
}
function QuickAssignDropTarget({
  item,
  kind,
  manualAssignResourceIds = [],
  customDragMatch = false,
  dropDisabled = false,
  manualAssignDisabled = false,
  assigning = false,
  onAssign
}) {
  const normalizedManualAssignResourceIds = useMemo(
    () => uniqueIds(manualAssignResourceIds),
    [manualAssignResourceIds]
  );
  const hoverSignatureRef = useRef("");
  const dragOverLogAtRef = useRef(0);
  const [{ isOver, canDrop }, dropRef] = safeUseDrop(() => ({
    accept: BOORU_RESOURCE_DND_TYPE,
    canDrop: (draggedItem) => {
      const draggedIds = resolveDraggedResourceIds(draggedItem);
      return !dropDisabled && !assigning && draggedIds.length > 0;
    },
    hover: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      const draggedIds = resolveDraggedResourceIds(draggedItem);
      const hoverSignature = `${item.id}:${draggedIds.join("|")}`;
      if (!draggedIds.length || hoverSignatureRef.current === hoverSignature) {
        return;
      }
      hoverSignatureRef.current = hoverSignature;
      booruViewLogger.debug(
        "booru.dnd.drop.hover",
        "Booru detecto hover sobre un destino rapido.",
        {
          entityId: item.id,
          kind,
          resourceIds: draggedIds
        }
      );
    },
    drop: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true }) || dropDisabled || assigning) {
        return;
      }
      const draggedIds = resolveDraggedResourceIds(draggedItem);
      if (!draggedIds.length) {
        return;
      }
      booruViewLogger.debug(
        "booru.dnd.drop.commit",
        "Booru recibio un drop sobre un destino rapido.",
        {
          entityId: item.id,
          kind,
          resourceIds: draggedIds
        }
      );
      void onAssign?.({
        resourceId: draggedIds[0],
        resourceIds: draggedIds,
        kind,
        entityId: item.id
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }), [assigning, dropDisabled, item.id, kind, onAssign]);
  useEffect(() => {
    if (!isOver) {
      hoverSignatureRef.current = "";
    }
  }, [isOver]);
  const handleDropRef = useCallback((node) => {
    dropRef(node);
  }, [dropRef]);
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: handleDropRef,
      className: [
        "booruView__suggestion",
        "booruView__suggestion--dropTarget",
        isOver && canDrop ? "is-drop-target" : "",
        customDragMatch ? "is-drop-target" : ""
      ].filter(Boolean).join(" "),
      "data-booru-quick-assign-target": "true",
      "data-booru-kind": kind,
      "data-booru-entity-id": item.id,
      "data-booru-label": item.displayName,
      onDragEnterCapture: () => {
        booruViewLogger.debug(
          "booru.dnd.native.enter",
          "El navegador detecto dragenter sobre un destino rapido.",
          {
            entityId: item.id,
            kind
          }
        );
      },
      onDragOverCapture: () => {
        const now = Date.now();
        if (now - dragOverLogAtRef.current < 400) {
          return;
        }
        dragOverLogAtRef.current = now;
        booruViewLogger.debug(
          "booru.dnd.native.over",
          "El navegador detecto dragover sobre un destino rapido.",
          {
            entityId: item.id,
            kind
          }
        );
      },
      onDropCapture: () => {
        booruViewLogger.debug(
          "booru.dnd.native.drop",
          "El navegador detecto drop nativo sobre un destino rapido.",
          {
            entityId: item.id,
            kind
          }
        );
      }
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__quickAssignCopy" }, /* @__PURE__ */ React2.createElement("span", null, item.displayName), /* @__PURE__ */ React2.createElement("small", null, item.resourceCount, " recursos")),
    /* @__PURE__ */ React2.createElement(
      Button,
      {
        type: "button",
        onClick: () => void onAssign?.({
          resourceIds: normalizedManualAssignResourceIds,
          kind,
          entityId: item.id
        }),
        disabled: manualAssignDisabled || assigning || !normalizedManualAssignResourceIds.length
      },
      "Asignar"
    )
  );
}
function QuickAssignPanel({
  selectedResourceIds = [],
  customDragState = null,
  manualAssignDisabledReason = "",
  assigning = false,
  revisionKey = 0,
  onAssign
}) {
  const [kind, setKind] = useState("author");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const normalizedSelectedResourceIds = Array.isArray(selectedResourceIds) ? selectedResourceIds.filter(Boolean) : [];
  const selectionCount = normalizedSelectedResourceIds.length;
  const manualAssignDisabled = Boolean(manualAssignDisabledReason) || assigning || !selectionCount;
  const searchDisabled = assigning;
  const showBlockingLoading = loading && items.length === 0;
  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();
    setLoading(true);
    booruViewLogger.debug(
      "booru.quick-assign.targets.start",
      "Booru inicio la carga de destinos rapidos.",
      {
        kind,
        query: String(query || "").trim() || null,
        revisionKey,
        selectedResourceIds: normalizedSelectedResourceIds.slice(0, 12),
        selectedCount: selectionCount
      }
    );
    void invoke("booru:list-entities", {
      kind,
      query: String(query || "").trim() || null
    }).then((data) => {
      if (cancelled) {
        return;
      }
      setItems(Array.isArray(data?.items) ? data.items.slice(0, 12) : []);
      setError("");
      logRendererDuration(
        "booru.quick-assign.targets.done",
        "Booru resolvio los destinos rapidos.",
        performance.now() - startedAt,
        {
          kind,
          query: String(query || "").trim() || null,
          revisionKey,
          selectedResourceIds: normalizedSelectedResourceIds.slice(0, 12),
          selectedCount: selectionCount,
          itemCount: Array.isArray(data?.items) ? data.items.length : 0,
          sampleIds: summarizeIdsForLog(data?.items)
        }
      );
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setItems([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar los destinos rapidos."
      );
      booruViewLogger.info(
        "booru.quick-assign.targets.error",
        "Booru no pudo cargar los destinos rapidos.",
        {
          kind,
          query: String(query || "").trim() || null,
          revisionKey,
          selectedResourceIds: normalizedSelectedResourceIds.slice(0, 12),
          selectedCount: selectionCount,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [kind, query, revisionKey]);
  useEffect(() => {
    setHighlightedIndex(items.length ? 0 : -1);
  }, [items, query]);
  const handleAssignEntity = async (resourceIds, entityId) => {
    const nextResourceIds = Array.isArray(resourceIds) ? resourceIds.filter(Boolean) : [];
    if (!nextResourceIds.length || !entityId || manualAssignDisabled) {
      return;
    }
    await onAssign?.({
      resourceIds: nextResourceIds,
      kind,
      entityId
    });
  };
  const handleEnsureEntity = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || manualAssignDisabled) {
      return;
    }
    const exactExisting = findExactEntityMatch(items, trimmedQuery);
    if (exactExisting) {
      await handleAssignEntity(normalizedSelectedResourceIds, exactExisting.id);
      setQuery("");
      return;
    }
    setLoading(true);
    try {
      const result = await invoke("booru:ensure-entity", { kind, name: trimmedQuery });
      await handleAssignEntity(normalizedSelectedResourceIds, result?.entity?.id);
      setQuery("");
      setError("");
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar el destino rapido."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__quickAssign" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Asignacion rapida"), /* @__PURE__ */ React2.createElement("div", { className: "booruView__quickAssignKinds", role: "tablist", "aria-label": "Asignacion rapida por entidad" }, QUICK_ASSIGN_KIND_OPTIONS.map((option) => /* @__PURE__ */ React2.createElement(
    Button,
    {
      key: option.value,
      type: "button",
      tone: kind === option.value ? "primary" : "secondary",
      className: "booruView__quickAssignKindButton",
      onClick: () => {
        setKind(option.value);
        setQuery("");
        setItems([]);
        setHighlightedIndex(-1);
      }
    },
    option.label
  ))), /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "text",
      value: query,
      onChange: (event) => setQuery(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, items.length, 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, items.length, -1));
          return;
        }
        if (event.key === "Escape") {
          setQuery("");
          setItems([]);
          setHighlightedIndex(-1);
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          if (manualAssignDisabled) {
            return;
          }
          event.preventDefault();
          if (highlightedIndex >= 0 && items[highlightedIndex]) {
            void handleAssignEntity(normalizedSelectedResourceIds, items[highlightedIndex].id);
            setQuery("");
            return;
          }
          void handleEnsureEntity();
        }
      },
      placeholder: `Buscar ${BOORU_ENTITY_KIND_LABELS[kind]?.toLowerCase() || "entidad"} o crear`,
      disabled: searchDisabled
    }
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void handleEnsureEntity(),
      disabled: !String(query || "").trim() || manualAssignDisabled
    },
    "Asignar"
  )), /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, manualAssignDisabledReason || (selectionCount > 1 ? `Asignara la entidad elegida a ${selectionCount} recursos seleccionados.` : "Arrastra una card al destino o usa el boton explicito para asignarla.")), error ? /* @__PURE__ */ React2.createElement("p", { className: "booruView__fieldError" }, error) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__quickAssignList" }, showBlockingLoading ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Cargando destinos...") : items.length ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, items.map((item, index) => /* @__PURE__ */ React2.createElement(
    "div",
    {
      key: item.id,
      className: highlightedIndex === index ? "booruView__quickAssignRow is-highlighted" : "booruView__quickAssignRow"
    },
    /* @__PURE__ */ React2.createElement(
      QuickAssignDropTarget,
      {
        item,
        kind,
        manualAssignResourceIds: normalizedSelectedResourceIds,
        customDragMatch: Boolean(
          customDragState?.active && customDragState?.overTarget?.kind === kind && customDragState?.overTarget?.entityId === item.id
        ),
        dropDisabled: assigning,
        manualAssignDisabled,
        assigning,
        onAssign
      }
    )
  )), loading ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Actualizando destinos...") : null) : /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Sin destinos todavia. Empieza a escribir para encontrar o crear el primero.")));
}
function ResourceInspector({
  section,
  activeResource,
  selectedResources,
  draft,
  saving,
  onDraftChange,
  onRestore,
  onPurge,
  onClose
}) {
  const selectionCount = selectedResources.length;
  const isBatch = selectionCount > 1;
  const resource = activeResource || selectedResources[0] || null;
  if (!resource) {
    return /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, /* @__PURE__ */ React2.createElement(
      StateBlock,
      {
        centered: true,
        title: "Selecciona un recurso",
        description: "El detalle aparece aqui para clasificar o revisar el item activo."
      }
    ));
  }
  const isDuplicate = section === "duplicates" || resource.classificationState === "duplicate-review";
  const isTrash = section === "trash" || selectedResources.every((item) => item?.trashedAt);
  const canSaveProgress = canSaveDraftProgress(draft);
  return /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__inspectorBody" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__inspectorTitleRow" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__inspectorTitleCopy" }, /* @__PURE__ */ React2.createElement("strong", null, isBatch ? `${selectionCount} recursos seleccionados` : resource.originalFilename), isBatch && resource.originalFilename ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, resource.originalFilename) : null), /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: () => onClose?.() }, "Cerrar")), /* @__PURE__ */ React2.createElement("div", { className: "booruView__inspectorPreview" }, /* @__PURE__ */ React2.createElement(
    MediaThumbnail,
    {
      pathValue: resource.storagePath,
      mediaKind: resource.mediaKind,
      alt: resource.originalFilename,
      large: true,
      controls: true
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "booruView__inspectorSummary" }, /* @__PURE__ */ React2.createElement("span", null, BOORU_MEDIA_KIND_LABELS[resource.mediaKind] || resource.mediaKind), /* @__PURE__ */ React2.createElement("span", null, BOORU_CLASSIFICATION_LABELS[resource.classificationState] || resource.classificationState), resource.reality ? /* @__PURE__ */ React2.createElement("span", null, BOORU_REALITY_LABELS[resource.reality] || resource.reality) : null, /* @__PURE__ */ React2.createElement("span", null, formatFileSize(resource.fileSize)), /* @__PURE__ */ React2.createElement("span", null, formatDate(resource.importedAt)), isBatch ? /* @__PURE__ */ React2.createElement("span", null, selectionCount, " seleccionados") : null), !isBatch ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagGroup" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Auto-tags"), /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagRow" }, (Array.isArray(resource.systemTags) ? resource.systemTags : []).map((tagValue) => /* @__PURE__ */ React2.createElement("span", { key: tagValue, className: "booruView__tagChip" }, tagValue)))), /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagGroup" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Persona"), renderEntityChips(resource.authors, "Sin persona asignada")), /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagGroup" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Artists"), renderEntityChips(resource.artists, "Sin artist asignado")), /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagGroup" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Characters"), renderEntityChips(resource.characters, "Sin character asignado")), /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagGroup" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Universes"), renderEntityChips(resource.universes, "Sin universe directo")), /* @__PURE__ */ React2.createElement("div", { className: "booruView__tagGroup" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Tags manuales"), renderTagChips(resource.manualTags, "Sin tags manuales"))) : /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      title: "Edicion en lote",
      description: "Los campos muestran lo comun a toda la seleccion. Lo que cambies se aplica como patch sobre todos los recursos seleccionados."
    }
  ), /* @__PURE__ */ React2.createElement("div", { className: "booruView__pathActions" }, /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: () => openPath(resource.storagePath) }, /* @__PURE__ */ React2.createElement(FolderIcon, { size: 15 }), /* @__PURE__ */ React2.createElement("span", null, "Ver archivo")), !isBatch && resource.sourcePath ? /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: () => openPath(resource.sourcePath) }, /* @__PURE__ */ React2.createElement(FolderIcon, { size: 15 }), /* @__PURE__ */ React2.createElement("span", null, "Ver origen")) : null), isTrash ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__inspectorActions" }, /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: () => void onRestore?.()
    },
    "Restaurar"
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onPurge?.()
    },
    "Purgar"
  )) : isDuplicate ? /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      title: "Este recurso quedo fuera de Pendientes",
      description: resource.canonicalOriginalFilename ? `Se detecto como duplicado exacto de ${resource.canonicalOriginalFilename}.` : "Los duplicados exactos no entran a la cola de clasificacion."
    }
  ) : /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    Field,
    {
      label: "Paso 1",
      description: "Real o ficticio.",
      className: "booruView__field"
    },
    /* @__PURE__ */ React2.createElement(
      SegmentedControl,
      {
        options: BOORU_REALITY_OPTIONS,
        value: draft?.reality || "",
        onChange: (value) => {
          const nextReality = value === "real" || value === "ficticio" ? value : null;
          onDraftChange?.((currentDraft) => markDraftDirty({
            ...currentDraft,
            reality: nextReality
          }, "reality"));
        },
        ariaLabel: "Clasificacion real o ficticio"
      }
    )
  ), draft?.reality === "real" ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    EntityAutocompleteField,
    {
      kind: "author",
      label: "Persona",
      description: "Obligatorio para recursos reales.",
      required: true,
      selectedItems: draft.authors,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          authors: items
        }, "authors"));
      },
      disabled: saving
    }
  ), /* @__PURE__ */ React2.createElement(
    EntityAutocompleteField,
    {
      kind: "character",
      label: "Characters",
      description: "Opcional para cosplay u otras representaciones.",
      selectedItems: draft.characters,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          characters: items,
          characterUniverses: pruneCharacterUniverseAssignments(
            currentDraft.characterUniverses,
            items
          )
        }, "characters"));
      },
      disabled: saving
    }
  )) : null, draft?.reality === "ficticio" ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    EntityAutocompleteField,
    {
      kind: "artist",
      label: "Artists",
      description: "Obligatorio para recursos ficticios.",
      required: true,
      selectedItems: draft.artists,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          artists: items
        }, "artists"));
      },
      disabled: saving
    }
  ), /* @__PURE__ */ React2.createElement(
    EntityAutocompleteField,
    {
      kind: "character",
      label: "Characters",
      description: "Opcional si ya resuelves el recurso con universe directo. Si agregas un character, necesita universe.",
      selectedItems: draft.characters,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          characters: items,
          characterUniverses: pruneCharacterUniverseAssignments(
            currentDraft.characterUniverses,
            items
          )
        }, "characters"));
      },
      disabled: saving
    }
  ), /* @__PURE__ */ React2.createElement(
    EntityAutocompleteField,
    {
      kind: "universe",
      label: "Universes",
      description: "Universe directo del recurso. Puede resolver el bloque esencial sin character.",
      selectedItems: draft.universes,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          universes: items
        }, "universes"));
      },
      disabled: saving
    }
  ), Array.isArray(draft.characters) && draft.characters.length ? /* @__PURE__ */ React2.createElement(
    Field,
    {
      label: "Universe por character",
      description: "Si un character no tiene universe propio, puedes asignarlo al vuelo.",
      className: "booruView__field"
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__characterUniverseList" }, draft.characters.map((character) => {
      const persistedUniverse = getCharacterUniverse(character);
      const selectedUniverse = getDraftUniverseForCharacter(draft, character.id);
      const resolvedUniverse = persistedUniverse || selectedUniverse;
      return /* @__PURE__ */ React2.createElement("div", { key: character.id, className: "booruView__characterUniverseRow" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__characterUniverseHeader" }, /* @__PURE__ */ React2.createElement("strong", null, character.displayName), resolvedUniverse ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__tagChip" }, resolvedUniverse.displayName) : /* @__PURE__ */ React2.createElement("span", { className: "booruView__metaPlaceholder" }, "Universe requerido")), persistedUniverse ? /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Universe resuelto desde el character.") : /* @__PURE__ */ React2.createElement(
        SingleEntityAutocompleteField,
        {
          kind: "universe",
          label: `Universe para ${character.displayName}`,
          value: selectedUniverse,
          onChange: (universe) => {
            onDraftChange?.((currentDraft) => ({
              ...markDraftDirty(currentDraft, "characterUniverses"),
              characterUniverses: pruneCharacterUniverseAssignments(
                {
                  ...currentDraft.characterUniverses,
                  [character.id]: universe
                },
                currentDraft.characters
              )
            }));
          },
          disabled: saving,
          placeholder: `Buscar o crear universe para ${character.displayName}`
        }
      ));
    }))
  ) : null) : /* @__PURE__ */ React2.createElement(
    EntityAutocompleteField,
    {
      kind: "artist",
      label: "Artists",
      description: "Opcional. Sirve para creadores de la obra visual.",
      selectedItems: draft.artists,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          artists: items
        }, "artists"));
      },
      disabled: saving
    }
  ), /* @__PURE__ */ React2.createElement(
    TagAutocompleteField,
    {
      label: "Tags manuales",
      description: "Tags planas propias de Booru. Enter crea la faltante.",
      selectedItems: draft.manualTags,
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty({
          ...currentDraft,
          manualTags: items
        }, "manualTags"));
      },
      disabled: saving
    }
  ), /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, saving ? "Guardando cambios..." : canSaveProgress ? "Los cambios se estan preparando para guardado automatico." : "Los cambios se guardan automaticamente al confirmar cada campo."))));
}
function EntityGrid({
  kind,
  items,
  emptyTitle,
  emptyDescription,
  onOpenEntity,
  onPreviewContextMenu
}) {
  return /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, items.length ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__resourcePanelBody" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityGrid" }, items.map((item) => /* @__PURE__ */ React2.createElement(
    "button",
    {
      key: item.id,
      type: "button",
      className: "booruView__entityCard",
      onClick: () => onOpenEntity?.(kind, item)
    },
    /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "booruView__entityCardPreview",
        onContextMenu: (event) => onPreviewContextMenu?.(item, event)
      },
      /* @__PURE__ */ React2.createElement(
        MediaThumbnail,
        {
          pathValue: item.cardPreviewPath || item.sampleStoragePath,
          mediaKind: item.cardMediaKind || item.sampleMediaKind || "image",
          alt: item.displayName
        }
      )
    ),
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityCardBody" }, /* @__PURE__ */ React2.createElement("strong", null, item.displayName), kind === "character" && item?.universe?.displayName ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityCardMeta" }, /* @__PURE__ */ React2.createElement("span", null, item.universe.displayName)) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityCardMeta" }, /* @__PURE__ */ React2.createElement("span", null, item.resourceCount, " recursos"), /* @__PURE__ */ React2.createElement("span", null, BOORU_ENTITY_KIND_LABELS[kind] || kind)))
  )))) : /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: emptyTitle,
      description: emptyDescription
    }
  ));
}
function EntityProfileGalleryGrid({
  items,
  loading,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onContextMenu
}) {
  if (loading && !items.length) {
    return /* @__PURE__ */ React2.createElement(
      StateBlock,
      {
        centered: true,
        title: "Cargando galeria",
        description: "Leyendo recursos consumidores desde Booru."
      }
    );
  }
  if (!items.length) {
    return /* @__PURE__ */ React2.createElement(
      StateBlock,
      {
        centered: true,
        title: "Sin recursos todavia",
        description: "Cuando esta entidad consuma media real, aparecera aqui."
      }
    );
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileGallery" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__mediaGrid booruView__mediaGrid--paged" }, items.map((item, absoluteIndex) => /* @__PURE__ */ React2.createElement(
    "div",
    {
      key: item.id,
      className: [
        "booruView__mediaCard",
        "booruView__mediaCard--static",
        canUseResourceAsEntityVisual(item) ? "booruView__mediaCard--contextual" : ""
      ].filter(Boolean).join(" "),
      onContextMenu: (event) => onContextMenu?.(item, event)
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__mediaCardPreview" }, /* @__PURE__ */ React2.createElement(
      MediaThumbnail,
      {
        pathValue: item.storagePath,
        mediaKind: item.mediaKind,
        alt: item.originalFilename,
        thumbnail: item.thumbnail,
        highPriority: absoluteIndex < RESOURCE_GRID_COLUMNS,
        preferOriginalWhenThumbnailMissing: true
      }
    ))
  ))), /* @__PURE__ */ React2.createElement(
    ResourcePagination,
    {
      currentPage,
      totalCount,
      pageSize,
      onPageChange
    }
  ));
}
function EntityProfileDataTab({
  kind,
  profile,
  busy = false,
  universeCharacterCreateValue = "",
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse
}) {
  const metadata = profile?.metadata || {};
  const facts = [
    { label: "Slug", value: profile?.slug || "Sin slug" },
    { label: "Recursos", value: String(profile?.resourceCount || 0) },
    { label: "Creado", value: formatDate(metadata?.createdAt) || "Sin fecha" }
  ];
  if (kind === "character") {
    facts.push({
      label: "Universe",
      value: profile?.universe?.displayName || "Todavia sin universe"
    });
  }
  if (kind === "universe") {
    facts.push(
      { label: "Characters", value: String(metadata?.characterCount || 0) },
      { label: "Consumo directo", value: String(metadata?.directResourceCount || 0) },
      { label: "Via characters", value: String(metadata?.inheritedResourceCount || 0) }
    );
  }
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileData" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileFacts" }, facts.map((fact) => /* @__PURE__ */ React2.createElement("div", { key: fact.label, className: "booruView__entityProfileFact" }, /* @__PURE__ */ React2.createElement("span", null, fact.label), /* @__PURE__ */ React2.createElement("strong", null, fact.value)))), kind === "character" ? /* @__PURE__ */ React2.createElement(
    Field,
    {
      label: "Universe",
      description: "Busca uno existente o crea uno nuevo para este character.",
      className: "booruView__field"
    },
    /* @__PURE__ */ React2.createElement(
      SingleEntityAutocompleteField,
      {
        kind: "universe",
        label: "Universe",
        value: profile?.universe || null,
        onChange: (nextUniverse) => onChangeCharacterUniverse?.(nextUniverse),
        disabled: busy,
        placeholder: "Buscar universe o crear uno nuevo"
      }
    )
  ) : null, kind === "universe" ? /* @__PURE__ */ React2.createElement(
    Field,
    {
      label: "Crear character",
      description: "El character nuevo queda asignado automaticamente a este universe.",
      className: "booruView__field"
    },
    /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInlineEditor" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React2.createElement(
      "input",
      {
        type: "text",
        value: universeCharacterCreateValue,
        onChange: (event) => onUniverseCharacterCreateValueChange?.(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void onCreateCharacterInUniverse?.();
          }
        },
        placeholder: "Crear character para este universe",
        disabled: busy,
        "aria-label": "Crear character para este universe"
      }
    ), /* @__PURE__ */ React2.createElement(
      Button,
      {
        type: "button",
        onClick: () => void onCreateCharacterInUniverse?.(),
        disabled: !String(universeCharacterCreateValue || "").trim() || busy
      },
      "Crear"
    )))
  ) : null, kind === "author" || kind === "artist" ? /* @__PURE__ */ React2.createElement(Notice, { tone: "info" }, "Redes, enlaces y notas quedan como metadata futura. Por ahora este perfil muestra identidad basica y consumo real.") : null);
}
function EntityProfileView({
  kind,
  profile,
  activeTab,
  galleryState,
  galleryLoading,
  currentPage,
  pageSize,
  entityMutationBusy,
  universeCharacterCreateValue,
  onBack,
  onTabChange,
  onPageChange,
  onOpenInMedia,
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse,
  onVisualContextMenu,
  onGalleryResourceContextMenu
}) {
  const bannerSource = profile?.banner?.sampleStoragePath ? {
    pathValue: profile.banner.sampleStoragePath,
    mediaKind: profile.banner.sampleMediaKind || "image"
  } : profile?.sample?.sampleStoragePath ? {
    pathValue: profile.sample.sampleStoragePath,
    mediaKind: profile.sample.sampleMediaKind || "image"
  } : null;
  const avatarSource = profile?.avatar?.sampleStoragePath ? {
    pathValue: profile.avatar.sampleStoragePath,
    mediaKind: profile.avatar.sampleMediaKind || "image"
  } : profile?.sample?.sampleStoragePath ? {
    pathValue: profile.sample.sampleStoragePath,
    mediaKind: profile.sample.sampleMediaKind || "image"
  } : null;
  const profileMeta = [
    `${profile?.resourceCount || 0} recursos`,
    BOORU_ENTITY_KIND_LABELS[kind] || kind
  ];
  if (kind === "character" && profile?.universe?.displayName) {
    profileMeta.push(profile.universe.displayName);
  }
  return /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill booruView__entityProfile" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__resourcePanelBody" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__resourcePanelContent booruView__entityProfileContent" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileToolbar" }, /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: () => onBack?.() }, "Volver"), /* @__PURE__ */ React2.createElement(Button, { type: "button", tone: "primary", onClick: () => onOpenInMedia?.() }, "Abrir en Media")), /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileHero" }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "booruView__entityProfileBanner",
      onContextMenu: (event) => onVisualContextMenu?.(profile?.banner || profile?.sample, event)
    },
    bannerSource ? /* @__PURE__ */ React2.createElement(
      MediaThumbnail,
      {
        pathValue: bannerSource.pathValue,
        mediaKind: bannerSource.mediaKind,
        alt: profile?.displayName || ""
      }
    ) : /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileBannerFallback" }, /* @__PURE__ */ React2.createElement("span", null, BOORU_ENTITY_KIND_LABELS[kind] || kind))
  ), /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileIdentity" }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "booruView__entityProfileAvatar",
      onContextMenu: (event) => onVisualContextMenu?.(profile?.avatar || profile?.sample, event)
    },
    avatarSource ? /* @__PURE__ */ React2.createElement(
      MediaThumbnail,
      {
        pathValue: avatarSource.pathValue,
        mediaKind: avatarSource.mediaKind,
        alt: profile?.displayName || ""
      }
    ) : /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileAvatarFallback" }, /* @__PURE__ */ React2.createElement("span", null, getInitials(profile?.displayName)))
  ), /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileCopy" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, BOORU_ENTITY_KIND_LABELS[kind] || kind), /* @__PURE__ */ React2.createElement("h2", null, profile?.displayName || "Entidad"), /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileMeta" }, profileMeta.map((entry) => /* @__PURE__ */ React2.createElement("span", { key: entry, className: "booruView__titlePill" }, entry))))), /* @__PURE__ */ React2.createElement("div", { className: "booruView__entityProfileTabs" }, /* @__PURE__ */ React2.createElement(
    SegmentedControl,
    {
      options: ENTITY_PROFILE_TAB_OPTIONS,
      value: activeTab,
      onChange: (value) => onTabChange?.(value),
      ariaLabel: "Seccion del perfil"
    }
  ))), activeTab === "data" ? /* @__PURE__ */ React2.createElement(
    EntityProfileDataTab,
    {
      kind,
      profile,
      busy: entityMutationBusy,
      universeCharacterCreateValue,
      onUniverseCharacterCreateValueChange,
      onCreateCharacterInUniverse,
      onChangeCharacterUniverse
    }
  ) : /* @__PURE__ */ React2.createElement(
    EntityProfileGalleryGrid,
    {
      items: Array.isArray(galleryState?.items) ? galleryState.items : [],
      loading: galleryLoading,
      currentPage,
      totalCount: galleryState?.totalCount || 0,
      pageSize,
      onPageChange,
      onContextMenu: onGalleryResourceContextMenu
    }
  ))));
}
function MetricsSection({
  snapshot,
  busyAction,
  loading,
  onRefresh,
  onRescan,
  onRestart
}) {
  return /* @__PURE__ */ React2.createElement("div", { className: "booruView__content booruView__content--metrics" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__metrics" }, /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Total", value: String(snapshot?.stats?.totalCount || 0), description: "Catalogo" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Pendientes", value: String(snapshot?.stats?.pendingCount || 0), description: "Cola real" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Duplicados", value: String(snapshot?.stats?.duplicateCount || 0), description: "Revision exacta" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Papelera", value: String(snapshot?.stats?.trashCount || 0), description: "Interna" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Basico", value: String(snapshot?.stats?.classifiedBasicCount || 0), description: "Completos" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Image", value: String(snapshot?.stats?.imageCount || 0), description: "Preview" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Video/GIF", value: String((snapshot?.stats?.videoCount || 0) + (snapshot?.stats?.gifCount || 0)), description: "Animados" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Thumbs ready", value: String(snapshot?.stats?.thumbnailReadyCount || 0), description: "Derivados listos" }), /* @__PURE__ */ React2.createElement(MetricCard, { eyebrow: "Thumbs backlog", value: String(snapshot?.stats?.thumbnailBacklogCount || 0), description: "Pendientes o error" })), /* @__PURE__ */ React2.createElement("div", { className: "booruView__metricsPanels" }, /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__statusStack" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Watcher y runtime"), /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      title: snapshot?.watcher?.active ? "Watcher activo" : "Watcher inactivo",
      description: snapshot?.watcher?.watchedPath || "Todavia no hay carpeta vigilada configurada."
    }
  ), snapshot?.derivatives?.lastError ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, snapshot.derivatives.lastError) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__pathActions" }, /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onRescan?.(),
      disabled: busyAction === "rescan"
    },
    "Releer carpeta"
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onRestart?.(),
      disabled: busyAction === "restart"
    },
    "Reiniciar watcher"
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onRefresh?.(),
      disabled: loading
    },
    /* @__PURE__ */ React2.createElement(RefreshIcon, { size: 15 }),
    /* @__PURE__ */ React2.createElement("span", null, "Actualizar")
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => openPath(snapshot?.storage?.root),
      disabled: !snapshot?.storage?.root
    },
    /* @__PURE__ */ React2.createElement(FolderIcon, { size: 15 }),
    /* @__PURE__ */ React2.createElement("span", null, "Ver storage")
  ), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => openPath(snapshot?.settings?.watchFolderPath),
      disabled: !snapshot?.settings?.watchFolderPath
    },
    /* @__PURE__ */ React2.createElement(FolderIcon, { size: 15 }),
    /* @__PURE__ */ React2.createElement("span", null, "Ver carpeta vigilada")
  )))), /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__statusStack" }, /* @__PURE__ */ React2.createElement("span", { className: "booruView__groupLabel" }, "Python y storage"), /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      title: snapshot?.python?.available ? "Python disponible" : "Python no disponible",
      description: snapshot?.python?.available ? snapshot.python.resolvedExecutable || snapshot.python.command : snapshot?.python?.error || "Booru necesita Python para su pipeline interno."
    }
  ), /* @__PURE__ */ React2.createElement("div", { className: "booruView__runtimeMeta" }, /* @__PURE__ */ React2.createElement("span", null, "DB: ", snapshot?.storage?.catalogPath || "Sin catalogo"), /* @__PURE__ */ React2.createElement("span", null, "Media: ", snapshot?.storage?.mediaRoot || "Sin carpeta media"), /* @__PURE__ */ React2.createElement("span", null, "Duplicados: ", snapshot?.storage?.duplicatesRoot || "Sin carpeta duplicates"), /* @__PURE__ */ React2.createElement("span", null, "Thumbs: ", snapshot?.storage?.thumbsRoot || "Sin carpeta thumbs"), /* @__PURE__ */ React2.createElement("span", null, "Worker activos: ", snapshot?.derivatives?.activeCount || 0))))));
}
function BooruWorkspaceView({ input = null, ctx }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [savingClassification, setSavingClassification] = useState(false);
  const [error, setError] = useState("");
  const [resourceSearchValue, setResourceSearchValue] = useState("");
  const [entitySearchValue, setEntitySearchValue] = useState("");
  const [entityCreateValue, setEntityCreateValue] = useState("");
  const [entityCreateUniverse, setEntityCreateUniverse] = useState(null);
  const [quickFilter, setQuickFilter] = useState("all");
  const [resourceEntityFilters, setResourceEntityFilters] = useState(
    normalizeResourceEntityFilters(input?.entityFilters)
  );
  const [resourceState, setResourceState] = useState({ items: [], totalCount: 0, hasMore: false });
  const [resourcePageState, setResourcePageState] = useState(RESOURCE_PAGE_SECTIONS);
  const [selectedResourceState, setSelectedResourceState] = useState(RESOURCE_SELECTION_SECTIONS);
  const [classificationDraft, setClassificationDraft] = useState(buildClassificationDraft([]));
  const [entityItems, setEntityItems] = useState([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityBusy, setEntityBusy] = useState(false);
  const [entityError, setEntityError] = useState("");
  const [entityProfile, setEntityProfile] = useState(null);
  const [entityProfileLoading, setEntityProfileLoading] = useState(false);
  const [entityProfileError, setEntityProfileError] = useState("");
  const [entityProfileGalleryState, setEntityProfileGalleryState] = useState({ items: [], totalCount: 0, hasMore: false });
  const [entityProfileGalleryLoading, setEntityProfileGalleryLoading] = useState(false);
  const [entityProfilePageState, setEntityProfilePageState] = useState(ENTITY_PROFILE_PAGE_SECTIONS);
  const [universeCharacterCreateValue, setUniverseCharacterCreateValue] = useState("");
  const [entityRevision, setEntityRevision] = useState(0);
  const [contextMenuState, setContextMenuState] = useState(null);
  const [customDragState, setCustomDragState] = useState(null);
  const activeSection = getActiveSection(input);
  const deferredResourceSearchValue = useDeferredValue(resourceSearchValue);
  const deferredEntitySearchValue = useDeferredValue(entitySearchValue);
  const activeEntityKind = ENTITY_SECTION_KIND_MAP[activeSection] || null;
  const activeEntityProfile = normalizeEntityProfileInput(input?.entityProfile, activeEntityKind);
  const showResourceWorkspace = RESOURCE_SECTIONS.has(activeSection);
  const showEntityProfile = Boolean(activeEntityKind && activeEntityProfile?.id);
  const resourceItems = Array.isArray(resourceState?.items) ? resourceState.items : [];
  const entityProfileGalleryItems = Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [];
  const resourceFilterSignature = getEntityFilterSignature(resourceEntityFilters);
  const resourceQuerySignature = JSON.stringify({
    search: String(deferredResourceSearchValue || "").trim(),
    quickFilter,
    entityFilters: resourceFilterSignature
  });
  const entityProfileKey = getEntityProfileKey(activeEntityProfile);
  const entityThumbnailPrimingEnabled = showEntityProfile && activeEntityProfile?.tab !== "data";
  const thumbnailPrimingItems = showResourceWorkspace ? resourceItems : entityThumbnailPrimingEnabled ? entityProfileGalleryItems : [];
  const currentEntityProfilePage = activeEntityKind ? clampPageNumber(entityProfilePageState?.[activeSection]?.page, Number.MAX_SAFE_INTEGER) : 1;
  const visibleThumbnailPrimingUnavailableRef = useRef(false);
  const primedResourcePageSignatureRef = useRef("");
  const classificationDraftRef = useRef(classificationDraft);
  const resourceRequestVersionRef = useRef(0);
  const entityProfileRequestVersionRef = useRef(0);
  const entityProfileGalleryRequestVersionRef = useRef(0);
  const latestInputRef = useRef(input);
  const diagnosticsContextRef = useRef({
    activeSection,
    showResourceWorkspace,
    showEntityProfile,
    currentResourcePage: 1,
    currentEntityProfilePage: 1,
    resourceItemCount: 0,
    entityItemCount: 0,
    selectedCount: 0,
    loading: true,
    resourceLoading: false,
    entityLoading: false,
    busyAction: ""
  });
  const renderBurstRef = useRef({
    windowStartedAt: performance.now(),
    renderCount: 0,
    lastLoggedAt: 0
  });
  const snapshotRequestStateRef = useRef({
    inFlight: false,
    queuedRequest: null
  });
  const autosaveTimerRef = useRef(0);
  const autosaveStateRef = useRef({
    inFlight: false,
    queued: false
  });
  const customDragSessionRef = useRef(null);
  const customDragTimerRef = useRef(0);
  const suppressNextResourceClickRef = useRef(false);
  const handleQuickAssignEntityRef = useRef(null);
  const currentResourcePage = showResourceWorkspace ? normalizeResourcePageState(resourcePageState[activeSection], resourceQuerySignature).page : 1;
  useEffect(() => {
    booruViewLogger.info(
      "booru.dnd.runtime",
      "Booru verifico el runtime compartido de drag and drop.",
      {
        hasUseDrag: typeof useDrag === "function",
        hasUseDrop: typeof useDrop === "function",
        hasUseDragLayer: typeof useDragLayer === "function",
        hasEmptyImage: typeof getEmptyImage === "function"
      }
    );
  }, []);
  useEffect(() => {
    classificationDraftRef.current = classificationDraft;
  }, [classificationDraft]);
  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);
  useEffect(() => {
    const nextFilters = normalizeResourceEntityFilters(input?.entityFilters);
    setResourceEntityFilters((currentValue) => getEntityFilterSignature(currentValue) === getEntityFilterSignature(nextFilters) ? currentValue : nextFilters);
  }, [input?.entityFilters]);
  useEffect(() => {
    if (!activeEntityKind) {
      setEntityCreateValue("");
    }
  }, [activeEntityKind]);
  useEffect(() => {
    if (activeEntityKind !== "character") {
      setEntityCreateUniverse(null);
    }
  }, [activeEntityKind]);
  useEffect(() => {
    if (activeEntityKind !== "universe" || !showEntityProfile) {
      setUniverseCharacterCreateValue("");
    }
  }, [activeEntityKind, showEntityProfile, activeEntityProfile?.id]);
  useEffect(() => {
    if (!showEntityProfile) {
      setEntityProfile(null);
      setEntityProfileError("");
      setEntityProfileLoading(false);
      setEntityProfileGalleryState({ items: [], totalCount: 0, hasMore: false });
      setEntityProfileGalleryLoading(false);
    }
  }, [showEntityProfile]);
  useEffect(() => {
    if (!showResourceWorkspace) {
      return;
    }
    setResourcePageState((currentValue) => {
      const nextSectionState = normalizeResourcePageState(currentValue[activeSection], resourceQuerySignature);
      if (nextSectionState.querySignature === resourceQuerySignature) {
        return currentValue;
      }
      return {
        ...currentValue,
        [activeSection]: {
          page: 1,
          querySignature: resourceQuerySignature
        }
      };
    });
  }, [activeSection, resourceQuerySignature, showResourceWorkspace]);
  useEffect(() => {
    if (!showEntityProfile || !activeEntityKind) {
      return;
    }
    setEntityProfilePageState((currentValue) => {
      const nextProfileKey = entityProfileKey;
      const currentSectionState = currentValue[activeSection] || { page: 1, profileKey: "" };
      if (String(currentSectionState.profileKey || "") === nextProfileKey) {
        return currentValue;
      }
      return {
        ...currentValue,
        [activeSection]: {
          page: 1,
          profileKey: nextProfileKey
        }
      };
    });
  }, [activeEntityKind, activeSection, entityProfileKey, showEntityProfile]);
  useEffect(() => {
    if (!showResourceWorkspace) {
      return;
    }
    const totalPages = Math.max(1, Math.ceil(Number(resourceState.totalCount || 0) / RESOURCE_PAGE_SIZE));
    if (currentResourcePage > totalPages) {
      setResourcePageState((currentValue) => ({
        ...currentValue,
        [activeSection]: {
          page: totalPages,
          querySignature: resourceQuerySignature
        }
      }));
    }
  }, [activeSection, currentResourcePage, resourceQuerySignature, resourceState.totalCount, showResourceWorkspace]);
  useEffect(() => {
    if (!showEntityProfile || !activeEntityKind) {
      return;
    }
    const totalPages = Math.max(1, Math.ceil(Number(entityProfileGalleryState.totalCount || 0) / RESOURCE_PAGE_SIZE));
    if (currentEntityProfilePage > totalPages) {
      setEntityProfilePageState((currentValue) => ({
        ...currentValue,
        [activeSection]: {
          page: totalPages,
          profileKey: entityProfileKey
        }
      }));
    }
  }, [
    activeEntityKind,
    activeSection,
    currentEntityProfilePage,
    entityProfileGalleryState.totalCount,
    entityProfileKey,
    showEntityProfile
  ]);
  const loadSnapshot = async ({ silent = false, reason = "manual" } = {}) => {
    const nextRequest = {
      silent: Boolean(silent),
      reasons: [String(reason || "manual")]
    };
    if (snapshotRequestStateRef.current.inFlight) {
      booruViewLogger.debug(
        "booru.snapshot.queue",
        "Booru encolo una recarga de snapshot mientras otra seguia en vuelo.",
        {
          requestedReason: String(reason || "manual"),
          silent: Boolean(silent),
          queuedRequest: snapshotRequestStateRef.current.queuedRequest
        }
      );
      snapshotRequestStateRef.current.queuedRequest = mergeSnapshotQueueRequest(
        snapshotRequestStateRef.current.queuedRequest,
        nextRequest
      );
      return null;
    }
    snapshotRequestStateRef.current.inFlight = true;
    const startedAt = performance.now();
    if (!silent) {
      setLoading(true);
    }
    booruViewLogger.debug(
      "booru.snapshot.start",
      "Booru inicio una carga de snapshot.",
      {
        reason: String(reason || "manual"),
        silent: Boolean(silent),
        ...diagnosticsContextRef.current
      }
    );
    try {
      const nextSnapshot = await invoke("booru:get-snapshot");
      setSnapshot(nextSnapshot);
      setError("");
      logRendererDuration(
        "booru.snapshot.done",
        "Booru resolvio una carga de snapshot.",
        performance.now() - startedAt,
        {
          reason: String(reason || "manual"),
          silent: Boolean(silent),
          watcherStage: String(nextSnapshot?.watcher?.stage || "").trim() || null,
          watcherPendingCount: Number(nextSnapshot?.watcher?.pendingCount || 0),
          stats: {
            totalCount: Number(nextSnapshot?.stats?.totalCount || 0),
            pendingCount: Number(nextSnapshot?.stats?.pendingCount || 0),
            duplicateCount: Number(nextSnapshot?.stats?.duplicateCount || 0),
            trashCount: Number(nextSnapshot?.stats?.trashCount || 0),
            thumbnailBacklogCount: Number(nextSnapshot?.stats?.thumbnailBacklogCount || 0),
            thumbnailReadyCount: Number(nextSnapshot?.stats?.thumbnailReadyCount || 0),
            thumbnailErrorCount: Number(nextSnapshot?.stats?.thumbnailErrorCount || 0)
          }
        }
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar el estado actual de Booru."
      );
      booruViewLogger.info(
        "booru.snapshot.error",
        "Booru no pudo resolver una carga de snapshot.",
        {
          reason: String(reason || "manual"),
          silent: Boolean(silent),
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
          ...diagnosticsContextRef.current
        }
      );
    } finally {
      snapshotRequestStateRef.current.inFlight = false;
      setLoading(false);
      if (snapshotRequestStateRef.current.queuedRequest) {
        const queuedRequest = snapshotRequestStateRef.current.queuedRequest;
        snapshotRequestStateRef.current.queuedRequest = null;
        void loadSnapshot({
          silent: queuedRequest.silent,
          reason: queuedRequest.reasons.join("|") || "queued"
        });
      }
    }
  };
  const loadResources = async ({ requestedPage = currentResourcePage } = {}) => {
    if (!showResourceWorkspace) {
      return;
    }
    const normalizedRequestedPage = clampPageNumber(requestedPage, Number.MAX_SAFE_INTEGER);
    const nextQuery = {
      section: activeSection,
      search: String(deferredResourceSearchValue || "").trim() || null,
      quickFilter,
      entityFilters: resourceEntityFilters,
      offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
      limit: RESOURCE_PAGE_SIZE
    };
    const startedAt = performance.now();
    resourceRequestVersionRef.current += 1;
    const requestVersion = resourceRequestVersionRef.current;
    setResourceLoading(true);
    booruViewLogger.debug(
      "booru.resources.start",
      "Booru inicio una carga de recursos.",
      {
        requestVersion,
        section: activeSection,
        requestedPage: normalizedRequestedPage,
        search: nextQuery.search,
        quickFilter,
        entityFilters: summarizeEntityFiltersForLog(resourceEntityFilters)
      }
    );
    try {
      const nextResources = await invoke("booru:list-resources", nextQuery);
      if (resourceRequestVersionRef.current !== requestVersion) {
        return;
      }
      setResourceState((currentValue) => ({
        items: Array.isArray(nextResources?.items) ? nextResources.items : [],
        totalCount: Number(nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore)
      }));
      setError("");
      logRendererDuration(
        "booru.resources.done",
        "Booru resolvio una carga de recursos.",
        performance.now() - startedAt,
        {
          requestVersion,
          section: activeSection,
          requestedPage: normalizedRequestedPage,
          search: nextQuery.search,
          quickFilter,
          entityFilters: summarizeEntityFiltersForLog(resourceEntityFilters),
          totalCount: Number(nextResources?.totalCount || 0),
          hasMore: Boolean(nextResources?.hasMore),
          ...summarizeResourcesForLog(nextResources?.items)
        }
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudo listar la biblioteca de Booru."
      );
      booruViewLogger.info(
        "booru.resources.error",
        "Booru no pudo listar recursos.",
        {
          requestVersion,
          section: activeSection,
          requestedPage: normalizedRequestedPage,
          search: nextQuery.search,
          quickFilter,
          entityFilters: summarizeEntityFiltersForLog(resourceEntityFilters),
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      setResourceLoading(false);
    }
  };
  const loadEntityProfile = async () => {
    if (!showEntityProfile || !activeEntityProfile?.id || !activeEntityKind) {
      return;
    }
    const startedAt = performance.now();
    entityProfileRequestVersionRef.current += 1;
    const requestVersion = entityProfileRequestVersionRef.current;
    setEntityProfileLoading(true);
    booruViewLogger.debug(
      "booru.entity-profile.start",
      "Booru inicio la carga de un perfil de entidad.",
      {
        requestVersion,
        kind: activeEntityKind,
        entityId: activeEntityProfile.id,
        tab: activeEntityProfile?.tab || null
      }
    );
    try {
      const nextProfile = await invoke("booru:get-entity-profile", {
        kind: activeEntityKind,
        id: activeEntityProfile.id
      });
      if (entityProfileRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfile(nextProfile || null);
      setEntityProfileError("");
      logRendererDuration(
        "booru.entity-profile.done",
        "Booru resolvio un perfil de entidad.",
        performance.now() - startedAt,
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          resourceCount: Number(nextProfile?.resourceCount || 0),
          slug: String(nextProfile?.slug || "").trim() || null
        }
      );
    } catch (loadError) {
      if (entityProfileRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfile(null);
      setEntityProfileError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar el perfil de la entidad."
      );
      booruViewLogger.info(
        "booru.entity-profile.error",
        "Booru no pudo cargar un perfil de entidad.",
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (entityProfileRequestVersionRef.current === requestVersion) {
        setEntityProfileLoading(false);
      }
    }
  };
  const loadEntityProfileGallery = async ({ requestedPage = currentEntityProfilePage } = {}) => {
    if (!showEntityProfile || activeEntityProfile?.tab === "data" || !activeEntityKind || !activeEntityProfile?.id) {
      return;
    }
    const normalizedRequestedPage = clampPageNumber(requestedPage, Number.MAX_SAFE_INTEGER);
    const startedAt = performance.now();
    entityProfileGalleryRequestVersionRef.current += 1;
    const requestVersion = entityProfileGalleryRequestVersionRef.current;
    setEntityProfileGalleryLoading(true);
    booruViewLogger.debug(
      "booru.entity-profile.gallery.start",
      "Booru inicio la carga de la galeria de un perfil de entidad.",
      {
        requestVersion,
        kind: activeEntityKind,
        entityId: activeEntityProfile.id,
        requestedPage: normalizedRequestedPage
      }
    );
    try {
      const nextResources = await invoke("booru:list-resources", {
        section: "media",
        search: null,
        quickFilter: "all",
        entityFilters: [{
          kind: activeEntityKind,
          id: activeEntityProfile.id,
          label: getEntityProfileLabel(activeEntityProfile, entityProfile) || null
        }],
        offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
        limit: RESOURCE_PAGE_SIZE
      });
      if (entityProfileGalleryRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfileGalleryState({
        items: Array.isArray(nextResources?.items) ? nextResources.items : [],
        totalCount: Number(nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore)
      });
      setEntityProfileError("");
      logRendererDuration(
        "booru.entity-profile.gallery.done",
        "Booru resolvio la galeria de un perfil de entidad.",
        performance.now() - startedAt,
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          requestedPage: normalizedRequestedPage,
          totalCount: Number(nextResources?.totalCount || 0),
          hasMore: Boolean(nextResources?.hasMore),
          ...summarizeResourcesForLog(nextResources?.items)
        }
      );
    } catch (loadError) {
      if (entityProfileGalleryRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfileGalleryState({ items: [], totalCount: 0, hasMore: false });
      setEntityProfileError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar la galeria de la entidad."
      );
      booruViewLogger.info(
        "booru.entity-profile.gallery.error",
        "Booru no pudo cargar la galeria de un perfil de entidad.",
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          requestedPage: normalizedRequestedPage,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (entityProfileGalleryRequestVersionRef.current === requestVersion) {
        setEntityProfileGalleryLoading(false);
      }
    }
  };
  useEffect(() => {
    void loadSnapshot({ reason: "mount" });
  }, []);
  useEffect(() => {
    if (!showResourceWorkspace) {
      return;
    }
    void loadResources({ requestedPage: currentResourcePage });
  }, [
    activeSection,
    currentResourcePage,
    deferredResourceSearchValue,
    quickFilter,
    resourceFilterSignature,
    showResourceWorkspace
  ]);
  useEffect(() => {
    if (!showEntityProfile) {
      return;
    }
    void loadEntityProfile();
  }, [activeEntityKind, activeEntityProfile?.id, entityRevision, showEntityProfile]);
  useEffect(() => {
    if (!showEntityProfile || activeEntityProfile?.tab === "data") {
      return;
    }
    void loadEntityProfileGallery({ requestedPage: currentEntityProfilePage });
  }, [
    activeEntityKind,
    activeEntityProfile?.id,
    activeEntityProfile?.tab,
    currentEntityProfilePage,
    showEntityProfile
  ]);
  useEffect(() => {
    if (snapshot?.derivatives && typeof snapshot?.stats?.thumbnailBacklogCount === "number") {
      visibleThumbnailPrimingUnavailableRef.current = false;
    }
  }, [snapshot?.derivatives, snapshot?.stats?.thumbnailBacklogCount]);
  useEffect(() => {
    const stateApi = typeof ctx?.getState === "function" ? ctx.getState() : null;
    if (!stateApi?.subscribeKey) {
      return void 0;
    }
    booruViewLogger.debug(
      "booru.runtime-state.subscribe",
      "Booru suscribio invalidaciones de runtime para la view activa.",
      {
        section: activeSection,
        showResourceWorkspace,
        showEntityProfile,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        resourceQuerySignature,
        entityProfileKey
      }
    );
    const unsubscribers = [
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.resourcesVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de recursos.",
          {
            key: "resourcesVersion",
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey
          }
        );
        if (showResourceWorkspace) {
          void loadResources({ requestedPage: currentResourcePage });
        }
        if (showEntityProfile && activeEntityProfile?.tab !== "data") {
          void loadEntityProfileGallery({ requestedPage: currentEntityProfilePage });
        }
        if (showEntityProfile) {
          void loadEntityProfile();
        }
        void loadSnapshot({ silent: true, reason: "state:resources" });
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.entitiesVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de entidades.",
          {
            key: "entitiesVersion",
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey
          }
        );
        setEntityRevision((currentValue) => currentValue + 1);
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.watcherVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de watcher.",
          {
            key: "watcherVersion",
            ...diagnosticsContextRef.current
          }
        );
        void loadSnapshot({ silent: true, reason: "state:watcher" });
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.metricsVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de metricas.",
          {
            key: "metricsVersion",
            ...diagnosticsContextRef.current
          }
        );
        void loadSnapshot({ silent: true, reason: "state:metrics" });
      })
    ];
    return () => {
      booruViewLogger.debug(
        "booru.runtime-state.unsubscribe",
        "Booru limpio suscripciones de invalidacion de runtime.",
        {
          section: activeSection,
          resourceQuerySignature,
          entityProfileKey
        }
      );
      unsubscribers.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [
    activeSection,
    activeEntityProfile?.tab,
    activeEntityProfile?.id,
    currentEntityProfilePage,
    currentResourcePage,
    ctx,
    deferredResourceSearchValue,
    quickFilter,
    resourceFilterSignature,
    showEntityProfile,
    showResourceWorkspace
  ]);
  useEffect(() => {
    if (!activeEntityKind) {
      setEntityItems([]);
      setEntityLoading(false);
      setEntityError("");
      return;
    }
    let cancelled = false;
    const startedAt = performance.now();
    setEntityLoading(true);
    booruViewLogger.debug(
      "booru.entities.section.start",
      "Booru inicio la carga de entidades para una seccion.",
      {
        kind: activeEntityKind,
        query: String(deferredEntitySearchValue || "").trim() || null,
        entityRevision
      }
    );
    void invoke("booru:list-entities", {
      kind: activeEntityKind,
      query: String(deferredEntitySearchValue || "").trim() || null
    }).then((data) => {
      if (cancelled) {
        return;
      }
      setEntityItems(Array.isArray(data?.items) ? data.items : []);
      setEntityError("");
      logRendererDuration(
        "booru.entities.section.done",
        "Booru resolvio la carga de entidades de una seccion.",
        performance.now() - startedAt,
        {
          kind: activeEntityKind,
          query: String(deferredEntitySearchValue || "").trim() || null,
          entityRevision,
          itemCount: Array.isArray(data?.items) ? data.items.length : 0,
          sampleIds: summarizeIdsForLog(data?.items)
        }
      );
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setEntityItems([]);
      setEntityError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar la seccion."
      );
      booruViewLogger.info(
        "booru.entities.section.error",
        "Booru no pudo cargar las entidades de la seccion activa.",
        {
          kind: activeEntityKind,
          query: String(deferredEntitySearchValue || "").trim() || null,
          entityRevision,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    }).finally(() => {
      if (!cancelled) {
        setEntityLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeEntityKind, deferredEntitySearchValue, entityRevision]);
  const frameStatusTitle = useMemo(() => composeFrameStatusTitle(snapshot, {
    loading,
    busyAction,
    savingClassification,
    resourceLoading
  }), [
    busyAction,
    loading,
    resourceLoading,
    savingClassification,
    snapshot?.derivatives?.activeCount,
    snapshot?.derivatives?.lastError,
    snapshot?.stats?.thumbnailBacklogCount,
    snapshot?.stats?.thumbnailErrorCount,
    snapshot?.stats?.thumbnailReadyCount,
    snapshot?.watcher?.lastError,
    snapshot?.watcher?.lastIngestedOriginalFilename,
    snapshot?.watcher?.pendingCount,
    snapshot?.watcher?.stage
  ]);
  const watcherStage = String(snapshot?.watcher?.stage || "");
  useEffect(() => {
    if (!ctx?.setWorkspaceFrameActions || !ctx?.clearWorkspaceFrameActions) {
      return void 0;
    }
    const statusIcon = watcherStage === "error" || watcherStage.startsWith("blocked") ? AlertIcon : PulseIcon;
    const actions = [];
    if (frameStatusTitle) {
      actions.push({
        id: "booru-runtime-status",
        icon: statusIcon,
        title: frameStatusTitle,
        active: true,
        onClick: () => {
          void ctx.openView({
            viewId: BOORU_WORKSPACE_VIEW_ID,
            reuse: true,
            input: {
              ...latestInputRef.current && typeof latestInputRef.current === "object" ? latestInputRef.current : {},
              section: "metrics"
            }
          });
        }
      });
    }
    actions.push({
      id: "booru-refresh",
      icon: RefreshIcon,
      title: loading || resourceLoading || entityLoading ? "Actualizando..." : "Actualizar",
      disabled: loading || resourceLoading || entityLoading,
      onClick: () => {
        void loadSnapshot({ silent: false, reason: "frame-refresh" });
        if (showResourceWorkspace) {
          void loadResources({ requestedPage: currentResourcePage });
        } else if (activeEntityKind) {
          setEntityRevision((currentValue) => currentValue + 1);
        }
      }
    });
    ctx.setWorkspaceFrameActions(BOORU_WORKSPACE_VIEW_ID, actions);
    return () => {
      ctx.clearWorkspaceFrameActions(BOORU_WORKSPACE_VIEW_ID);
    };
  }, [
    activeEntityKind,
    busyAction,
    ctx,
    entityLoading,
    frameStatusTitle,
    loading,
    currentResourcePage,
    resourceLoading,
    savingClassification,
    showResourceWorkspace,
    watcherStage
  ]);
  const currentSelection = useMemo(() => {
    if (!showResourceWorkspace) {
      return EMPTY_SELECTION_STATE;
    }
    return selectedResourceState[activeSection] || RESOURCE_SELECTION_SECTIONS[activeSection] || EMPTY_SELECTION_STATE;
  }, [activeSection, selectedResourceState, showResourceWorkspace]);
  useEffect(() => {
    if (!showResourceWorkspace) {
      return;
    }
    setSelectedResourceState((currentValue) => {
      const nextSectionState = currentValue[activeSection] || RESOURCE_SELECTION_SECTIONS[activeSection];
      const visibleIds = new Set(resourceItems.map((item) => item.id));
      const normalizedSelection = normalizeSectionSelection(nextSectionState, visibleIds);
      if (arraysEqual(nextSectionState.ids, normalizedSelection.ids) && nextSectionState.activeId === normalizedSelection.activeId && nextSectionState.mode === normalizedSelection.mode) {
        return currentValue;
      }
      return {
        ...currentValue,
        [activeSection]: normalizedSelection
      };
    });
  }, [activeSection, resourceItems, showResourceWorkspace]);
  const selectedResources = useMemo(() => {
    if (!showResourceWorkspace) {
      return [];
    }
    const itemsById = new Map(resourceItems.map((item) => [item.id, item]));
    return currentSelection.ids.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
  }, [currentSelection.ids, resourceItems, showResourceWorkspace]);
  const activeResource = useMemo(() => {
    if (!showResourceWorkspace) {
      return null;
    }
    return selectedResources.find((resource) => resource.id === currentSelection.activeId) || selectedResources[0] || null;
  }, [currentSelection.activeId, selectedResources, showResourceWorkspace]);
  const dragPreviewResourcesById = useMemo(
    () => new Map(resourceItems.map((item) => [item.id, item])),
    [resourceItems]
  );
  const selectedResourceIdsSignature = selectedResources.map((resource) => resource.id).join("|");
  const showInspector = showResourceWorkspace && selectedResources.length > 0;
  const consumeSuppressedResourceClick = useCallback(() => {
    if (!suppressNextResourceClickRef.current) {
      return false;
    }
    suppressNextResourceClickRef.current = false;
    return true;
  }, []);
  const clearCustomDragSession = useCallback(() => {
    if (customDragTimerRef.current) {
      window.clearTimeout(customDragTimerRef.current);
      customDragTimerRef.current = 0;
    }
    if (customDragSessionRef.current) {
      window.removeEventListener("pointermove", customDragSessionRef.current.handlePointerMove, true);
      window.removeEventListener("pointerup", customDragSessionRef.current.handlePointerUp, true);
      window.removeEventListener("pointercancel", customDragSessionRef.current.handlePointerCancel, true);
      customDragSessionRef.current = null;
    }
  }, []);
  const handleCustomDragPointerDown = useCallback(({ event, item, resourceIds }) => {
    if (!showResourceWorkspace || activeSection === "trash") {
      return;
    }
    if (event?.button !== 0 || event?.pointerType === "touch") {
      return;
    }
    if (isFormControlElement(event?.target)) {
      return;
    }
    clearCustomDragSession();
    suppressNextResourceClickRef.current = false;
    const normalizedResourceIds = uniqueIds(Array.isArray(resourceIds) ? resourceIds : [item?.id]);
    const session = {
      pointerId: event.pointerId,
      primaryId: item?.id,
      primaryResource: item,
      resourceIds: normalizedResourceIds,
      startedAt: performance.now(),
      startX: Number(event.clientX || 0),
      startY: Number(event.clientY || 0),
      latestX: Number(event.clientX || 0),
      latestY: Number(event.clientY || 0),
      active: false,
      overTargetSignature: "",
      handlePointerMove: null,
      handlePointerUp: null,
      handlePointerCancel: null
    };
    const syncCustomDragTarget = () => {
      if (!session.active) {
        return;
      }
      const hoveredNode = document.elementFromPoint(session.latestX, session.latestY);
      const nextTarget = getQuickAssignTargetDescriptor(hoveredNode);
      const nextSignature = nextTarget ? `${nextTarget.kind}:${nextTarget.entityId}` : "";
      if (session.overTargetSignature === nextSignature) {
        setCustomDragState((currentValue) => {
          if (!currentValue?.active) {
            return currentValue;
          }
          if (currentValue.x === session.latestX && currentValue.y === session.latestY && (currentValue.overTarget && nextTarget ? currentValue.overTarget.kind === nextTarget.kind && currentValue.overTarget.entityId === nextTarget.entityId : currentValue.overTarget === nextTarget)) {
            return currentValue;
          }
          return {
            ...currentValue,
            x: session.latestX,
            y: session.latestY,
            overTarget: nextTarget
          };
        });
        return;
      }
      session.overTargetSignature = nextSignature;
      booruViewLogger.debug(
        "booru.dnd.custom.hover",
        "Booru actualizo el hover del drag interno.",
        {
          resourceIds: session.resourceIds,
          overTarget: nextTarget
        }
      );
      setCustomDragState((currentValue) => currentValue?.active ? {
        ...currentValue,
        x: session.latestX,
        y: session.latestY,
        overTarget: nextTarget
      } : currentValue);
    };
    const activateCustomDrag = () => {
      if (session.active) {
        return;
      }
      session.active = true;
      booruViewLogger.debug(
        "booru.dnd.custom.start",
        "Booru activo el drag interno por hold.",
        {
          resourceIds: session.resourceIds,
          primaryId: session.primaryId
        }
      );
      setCustomDragState({
        active: true,
        primaryId: session.primaryId,
        primaryResource: session.primaryResource,
        resourceIds: session.resourceIds,
        x: session.latestX,
        y: session.latestY,
        overTarget: null
      });
      syncCustomDragTarget();
    };
    session.handlePointerMove = (moveEvent) => {
      if (moveEvent.pointerId !== session.pointerId) {
        return;
      }
      session.latestX = Number(moveEvent.clientX || 0);
      session.latestY = Number(moveEvent.clientY || 0);
      if (!session.active && performance.now() - session.startedAt >= 150) {
        activateCustomDrag();
      } else {
        syncCustomDragTarget();
      }
    };
    session.handlePointerUp = (upEvent) => {
      if (upEvent.pointerId !== session.pointerId) {
        return;
      }
      const dragWasActive = session.active;
      const dropTarget = dragWasActive ? getQuickAssignTargetDescriptor(document.elementFromPoint(session.latestX, session.latestY)) : null;
      clearCustomDragSession();
      setCustomDragState(null);
      if (!dragWasActive) {
        booruViewLogger.debug(
          "booru.dnd.custom.tap",
          "Booru trato la interaccion como click normal porque el hold no se completo.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId
          }
        );
        return;
      }
      suppressNextResourceClickRef.current = true;
      window.setTimeout(() => {
        suppressNextResourceClickRef.current = false;
      }, 0);
      if (dropTarget) {
        booruViewLogger.info(
          "booru.dnd.custom.drop",
          "Booru resolvio un drop interno sobre asignacion rapida.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId,
            target: dropTarget
          }
        );
        void handleQuickAssignEntityRef.current?.({
          resourceId: session.resourceIds[0] || null,
          resourceIds: session.resourceIds,
          kind: dropTarget.kind,
          entityId: dropTarget.entityId
        });
      } else {
        booruViewLogger.debug(
          "booru.dnd.custom.cancel",
          "Booru cancelo el drag interno sin destino valido.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId,
            x: session.latestX,
            y: session.latestY
          }
        );
      }
    };
    session.handlePointerCancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== session.pointerId) {
        return;
      }
      clearCustomDragSession();
      setCustomDragState(null);
      booruViewLogger.debug(
        "booru.dnd.custom.pointer-cancel",
        "Booru recibio pointercancel durante el drag interno.",
        {
          resourceIds: session.resourceIds,
          primaryId: session.primaryId
        }
      );
    };
    customDragSessionRef.current = session;
    customDragTimerRef.current = window.setTimeout(() => {
      customDragTimerRef.current = 0;
      if (customDragSessionRef.current === session) {
        activateCustomDrag();
      }
    }, 150);
    window.addEventListener("pointermove", session.handlePointerMove, true);
    window.addEventListener("pointerup", session.handlePointerUp, true);
    window.addEventListener("pointercancel", session.handlePointerCancel, true);
  }, [
    activeSection,
    clearCustomDragSession,
    showResourceWorkspace
  ]);
  useEffect(() => {
    diagnosticsContextRef.current = {
      activeSection,
      showResourceWorkspace,
      showEntityProfile,
      currentResourcePage,
      currentEntityProfilePage,
      resourceItemCount: resourceItems.length,
      entityItemCount: entityItems.length,
      selectedCount: currentSelection.ids.length,
      loading,
      resourceLoading,
      entityLoading,
      busyAction
    };
  }, [
    activeSection,
    busyAction,
    currentEntityProfilePage,
    currentResourcePage,
    currentSelection.ids.length,
    entityItems.length,
    entityLoading,
    loading,
    resourceItems.length,
    resourceLoading,
    showEntityProfile,
    showResourceWorkspace
  ]);
  useEffect(() => () => {
    clearCustomDragSession();
  }, [clearCustomDragSession]);
  useEffect(() => {
    clearCustomDragSession();
    setCustomDragState(null);
  }, [activeSection, clearCustomDragSession]);
  useEffect(() => {
    const now = performance.now();
    const renderBurstState = renderBurstRef.current;
    if (now - renderBurstState.windowStartedAt >= 1e3) {
      renderBurstState.windowStartedAt = now;
      renderBurstState.renderCount = 0;
    }
    renderBurstState.renderCount += 1;
    if (renderBurstState.renderCount >= 24 && now - renderBurstState.lastLoggedAt >= 1e3) {
      renderBurstState.lastLoggedAt = now;
      booruViewLogger.info(
        "booru.view.render-burst",
        "Booru detecto una rafaga de renders en renderer.",
        {
          renderCount: renderBurstState.renderCount,
          windowMs: Number((now - renderBurstState.windowStartedAt).toFixed(2)),
          ...diagnosticsContextRef.current,
          resourceQuerySignature,
          entityProfileKey
        }
      );
    }
  });
  useEffect(() => {
    if (typeof window.requestAnimationFrame !== "function") {
      return void 0;
    }
    let frameId = 0;
    let lastFrameAt = performance.now();
    let lastLoggedAt = 0;
    const tick = (timestamp) => {
      const deltaMs = timestamp - lastFrameAt;
      if (!document.hidden && deltaMs >= 220 && timestamp - lastLoggedAt >= 2e3) {
        lastLoggedAt = timestamp;
        booruViewLogger.info(
          "booru.performance.frame-gap",
          "Booru detecto un gap de frames anormal en renderer.",
          {
            deltaMs: Number(deltaMs.toFixed(2)),
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey
          }
        );
      }
      lastFrameAt = timestamp;
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [entityProfileKey, resourceQuerySignature]);
  useEffect(() => {
    if (typeof window.PerformanceObserver !== "function") {
      return void 0;
    }
    let observer = null;
    try {
      observer = new window.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < 80) {
            continue;
          }
          booruViewLogger.info(
            "booru.performance.long-task",
            "Booru detecto una long task en renderer.",
            {
              durationMs: Number(entry.duration.toFixed(2)),
              name: entry.name || null,
              entryType: entry.entryType || null,
              startTimeMs: Number(entry.startTime.toFixed(2)),
              ...diagnosticsContextRef.current,
              resourceQuerySignature,
              entityProfileKey
            }
          );
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      return void 0;
    }
    return () => {
      observer?.disconnect?.();
    };
  }, [entityProfileKey, resourceQuerySignature]);
  useEffect(() => {
    booruViewLogger.info(
      "booru.view.navigation",
      "Booru cambio de seccion o perfil activo.",
      {
        section: activeSection,
        showResourceWorkspace,
        showEntityProfile,
        entityProfileKey: entityProfileKey || null,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        resourceQuerySignature
      }
    );
  }, [
    activeSection,
    currentEntityProfilePage,
    currentResourcePage,
    entityProfileKey,
    resourceQuerySignature,
    showEntityProfile,
    showResourceWorkspace
  ]);
  useEffect(() => {
    if (!showResourceWorkspace) {
      setClassificationDraft(buildClassificationDraft([]));
      return;
    }
    setClassificationDraft((currentDraft) => {
      const currentResourceIds = Array.isArray(currentDraft?.resourceIds) ? currentDraft.resourceIds : [];
      if (arraysEqual(currentResourceIds, selectedResources.map((resource) => resource.id)) && currentDraft?.dirtyFields?.length) {
        return currentDraft;
      }
      return buildClassificationDraft(selectedResources);
    });
  }, [selectedResources, showResourceWorkspace]);
  useEffect(() => {
    const clearCurrentSelection = () => {
      setSelectedResourceState((currentValue) => ({
        ...currentValue,
        [activeSection]: {
          ids: [],
          activeId: "",
          mode: "single"
        }
      }));
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Delete" || isTextInputTarget(event.target)) {
        return;
      }
      if (!showResourceWorkspace || !currentSelection.ids.length || activeSection === "trash") {
        return;
      }
      event.preventDefault();
      void (async () => {
        try {
          setBusyAction("trash");
          const result = await invoke("booru:trash-resources", {
            resourceIds: currentSelection.ids
          });
          setSnapshot(result?.snapshot || snapshot);
          setError("");
          setContextMenuState(null);
          clearCurrentSelection();
        } catch (trashError) {
          setError(
            trashError instanceof Error ? trashError.message : "No se pudo enviar la seleccion a la papelera."
          );
        } finally {
          setBusyAction("");
        }
      })();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSection, currentSelection.ids, showResourceWorkspace, snapshot]);
  useEffect(() => {
    const supportsVisibleThumbnailPriming = snapshot?.derivatives && typeof snapshot?.stats?.thumbnailBacklogCount === "number";
    const primingSignature = JSON.stringify({
      section: activeSection,
      mode: showResourceWorkspace ? "resource-section" : entityThumbnailPrimingEnabled ? "entity-profile" : "idle",
      page: showResourceWorkspace ? currentResourcePage : currentEntityProfilePage,
      search: showResourceWorkspace ? String(deferredResourceSearchValue || "").trim() : "",
      quickFilter: showResourceWorkspace ? quickFilter : "all",
      entityFilters: showResourceWorkspace ? resourceFilterSignature : entityProfileKey,
      ids: thumbnailPrimingItems.map((item) => item.id)
    });
    if (!thumbnailPrimingItems.length || !supportsVisibleThumbnailPriming || visibleThumbnailPrimingUnavailableRef.current || primedResourcePageSignatureRef.current === primingSignature) {
      return;
    }
    primedResourcePageSignatureRef.current = primingSignature;
    booruViewLogger.debug(
      "booru.thumbnail-prime.start",
      "Booru priorizo thumbnails visibles desde la pagina cargada.",
      {
        mode: showResourceWorkspace ? "resource-section" : "entity-profile",
        section: activeSection,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        itemCount: thumbnailPrimingItems.length,
        sampleIds: summarizeIdsForLog(thumbnailPrimingItems)
      }
    );
    void invoke("booru:prime-visible-thumbnails", {
      resourceIds: thumbnailPrimingItems.map((item) => item.id)
    }).catch((primeError) => {
      const errorMessage = primeError instanceof Error ? primeError.message : String(primeError || "");
      if (errorMessage.includes("No handler registered")) {
        visibleThumbnailPrimingUnavailableRef.current = true;
      }
      booruViewLogger.info(
        "booru.thumbnail-prime.error",
        "Booru no pudo priorizar thumbnails visibles.",
        {
          mode: showResourceWorkspace ? "resource-section" : "entity-profile",
          section: activeSection,
          itemCount: thumbnailPrimingItems.length,
          sampleIds: summarizeIdsForLog(thumbnailPrimingItems),
          error: truncateDiagnosticText(errorMessage, 600)
        }
      );
    });
  }, [
    activeSection,
    currentEntityProfilePage,
    currentResourcePage,
    deferredResourceSearchValue,
    entityProfileKey,
    entityThumbnailPrimingEnabled,
    quickFilter,
    resourceFilterSignature,
    thumbnailPrimingItems,
    showResourceWorkspace,
    snapshot?.derivatives,
    snapshot?.stats?.thumbnailBacklogCount
  ]);
  const handleAction = async (actionId, channel) => {
    const startedAt = performance.now();
    setBusyAction(actionId);
    booruViewLogger.debug(
      "booru.action.start",
      "Booru inicio una accion general de runtime.",
      {
        actionId,
        channel,
        ...diagnosticsContextRef.current
      }
    );
    try {
      const nextSnapshot = await invoke(channel);
      setSnapshot(nextSnapshot);
      setError("");
      logRendererDuration(
        "booru.action.done",
        "Booru resolvio una accion general de runtime.",
        performance.now() - startedAt,
        {
          actionId,
          channel
        }
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "No se pudo ejecutar la accion de Booru."
      );
      booruViewLogger.info(
        "booru.action.error",
        "Booru no pudo resolver una accion general de runtime.",
        {
          actionId,
          channel,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: actionError instanceof Error ? actionError.message : String(actionError || "")
        }
      );
    } finally {
      setBusyAction("");
    }
  };
  const setSelectionForSection = (section, nextSelection) => {
    const normalizedSelection = normalizeSectionSelection(nextSelection);
    booruViewLogger.debug(
      "booru.selection.change",
      "Booru actualizo la seleccion de recursos.",
      {
        section,
        mode: normalizedSelection.mode,
        activeId: normalizedSelection.activeId || null,
        selectedCount: normalizedSelection.ids.length,
        sampleIds: normalizedSelection.ids.slice(0, 12)
      }
    );
    setSelectedResourceState((currentValue) => ({
      ...currentValue,
      [section]: normalizedSelection
    }));
  };
  const setResourcePageForSection = (section, nextPage) => {
    setResourcePageState((currentValue) => ({
      ...currentValue,
      [section]: {
        page: clampPageNumber(nextPage, Number.MAX_SAFE_INTEGER),
        querySignature: resourceQuerySignature
      }
    }));
  };
  const setEntityProfilePageForSection = (section, nextPage) => {
    setEntityProfilePageState((currentValue) => ({
      ...currentValue,
      [section]: {
        page: clampPageNumber(nextPage, Number.MAX_SAFE_INTEGER),
        profileKey: entityProfileKey
      }
    }));
  };
  const clearSelectionForSection = (section) => {
    setSelectionForSection(section, {
      ids: [],
      activeId: "",
      mode: "single"
    });
  };
  const handleResourceClick = (item, event) => {
    if (!showResourceWorkspace) {
      return;
    }
    const isToggle = Boolean(event?.ctrlKey || event?.metaKey);
    const currentIds = Array.isArray(currentSelection.ids) ? currentSelection.ids : [];
    const itemSelected = currentIds.includes(item.id);
    if (isToggle) {
      if (currentSelection.mode !== "multi") {
        if (itemSelected) {
          setSelectionForSection(activeSection, {
            ids: [item.id],
            activeId: item.id,
            mode: "single"
          });
          return;
        }
        setSelectionForSection(activeSection, {
          ids: [item.id],
          activeId: item.id,
          mode: "multi"
        });
        return;
      }
      const nextIds = itemSelected ? currentIds.filter((resourceId) => resourceId !== item.id) : [...currentIds, item.id];
      setSelectionForSection(activeSection, {
        ids: nextIds,
        activeId: nextIds.length ? itemSelected && currentSelection.activeId === item.id ? nextIds.at(-1) || nextIds[0] || "" : item.id : "",
        mode: nextIds.length > 1 ? "multi" : "single"
      });
      return;
    }
    setSelectionForSection(activeSection, {
      ids: [item.id],
      activeId: item.id,
      mode: "single"
    });
  };
  const openResourceContextMenu = (item, event) => {
    if (!showResourceWorkspace) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const selectionIds = currentSelection.ids.includes(item.id) ? currentSelection.ids : [item.id];
    const activeId = item.id;
    setSelectionForSection(activeSection, {
      ids: selectionIds,
      activeId,
      mode: selectionIds.length > 1 ? "multi" : "single"
    });
    const itemsById = new Map(resourceItems.map((resource) => [resource.id, resource]));
    const selectedContextResources = selectionIds.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
    const singleContextResource = selectedContextResources.length === 1 ? selectedContextResources[0] : null;
    const imageCompatible = canUseResourceAsEntityVisual(singleContextResource);
    const menuItems = activeSection === "trash" ? [
      { id: "restore", label: "Restaurar" },
      { id: "purge", label: "Purgar", danger: true }
    ] : [
      { id: "trash", label: "Eliminar", danger: true },
      ...imageCompatible ? [{ id: "copy", label: "Copiar al portapapeles" }] : [],
      ...imageCompatible ? [{ id: "google", label: "Buscar en Google" }] : []
    ];
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: menuItems,
      resourceIds: selectionIds,
      resources: selectedContextResources,
      activeId
    });
  };
  const openEntityProfileResourceContextMenu = (item, event) => {
    if (!showEntityProfile || !activeEntityKind || !activeEntityProfile?.id || !canUseResourceAsEntityVisual(item)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: [
        { id: "copy", label: "Copiar al portapapeles" },
        { id: "google", label: "Buscar en Google" },
        { id: "set-avatar", label: "Usar como perfil" },
        { id: "set-banner", label: "Usar como banner" }
      ],
      resourceIds: [item.id],
      resources: [item],
      entityKind: activeEntityKind,
      entityId: activeEntityProfile.id
    });
  };
  const openEntityCardContextMenu = (item, event) => {
    const contextResource = buildContextResourceFromDescriptor({
      sampleResourceId: item?.cardResourceId || item?.sampleResourceId,
      storagePath: item?.cardStoragePath || item?.sampleStoragePath,
      sampleStoragePath: item?.cardPreviewPath || item?.sampleStoragePath,
      sampleMediaKind: item?.cardMediaKind || item?.sampleMediaKind
    });
    if (!contextResource) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: [
        { id: "copy", label: "Copiar al portapapeles" },
        { id: "google", label: "Buscar en Google" }
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource]
    });
  };
  const openEntityProfileVisualContextMenu = (descriptor, event) => {
    const contextResource = buildContextResourceFromDescriptor(descriptor);
    if (!contextResource) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: [
        { id: "copy", label: "Copiar al portapapeles" },
        { id: "google", label: "Buscar en Google" }
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource]
    });
  };
  const getContextSelectionResources = () => {
    if (Array.isArray(contextMenuState?.resources) && contextMenuState.resources.length) {
      return contextMenuState.resources.filter(Boolean);
    }
    const ids = Array.isArray(contextMenuState?.resourceIds) ? contextMenuState.resourceIds : [];
    const itemsById = new Map(resourceItems.map((resource) => [resource.id, resource]));
    return ids.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
  };
  const handleCopyToClipboard = async (resource) => {
    const image = nativeImage.createFromPath(resource.storagePath);
    if (image.isEmpty()) {
      throw new Error("No se pudo copiar la imagen al portapapeles.");
    }
    clipboard.writeImage(image);
  };
  const handleContextMenuAction = async (actionId) => {
    const contextResources = getContextSelectionResources();
    const contextIds = contextResources.map((resource) => resource.id);
    const singleResource = contextResources.length === 1 ? contextResources[0] : null;
    const contextEntityKind = String(contextMenuState?.entityKind || "").trim();
    const contextEntityId = String(contextMenuState?.entityId || "").trim();
    setContextMenuState(null);
    try {
      if ((actionId === "set-avatar" || actionId === "set-banner") && singleResource && contextEntityKind && contextEntityId) {
        setBusyAction(actionId);
        const result = await invoke("booru:set-entity-visual", {
          kind: contextEntityKind,
          entityId: contextEntityId,
          resourceId: singleResource.id,
          visualRole: actionId === "set-avatar" ? "avatar" : "banner"
        });
        if (result?.profile) {
          setEntityProfile(result.profile);
        }
        setEntityProfileError("");
        return;
      }
      if (actionId === "copy" && singleResource) {
        await handleCopyToClipboard(singleResource);
        return;
      }
      if (actionId === "google" && singleResource) {
        await invoke("booru:open-in-brave", { resourceId: singleResource.id });
        return;
      }
      if (actionId === "trash") {
        setBusyAction("trash");
        const result = await invoke("booru:trash-resources", {
          resourceIds: contextIds
        });
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeSection);
        return;
      }
      if (actionId === "restore") {
        setBusyAction("restore");
        const result = await invoke("booru:restore-resources", {
          resourceIds: contextIds
        });
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeSection);
        return;
      }
      if (actionId === "purge") {
        setBusyAction("purge");
        const result = await invoke("booru:purge-resources", {
          resourceIds: contextIds
        });
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeSection);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "No se pudo ejecutar la accion contextual."
      );
    } finally {
      setBusyAction("");
    }
  };
  const persistClassificationDraft = async (draftToPersist) => {
    if (!canSaveDraftProgress(draftToPersist)) {
      return;
    }
    if (autosaveStateRef.current.inFlight) {
      autosaveStateRef.current.queued = true;
      return;
    }
    autosaveStateRef.current.inFlight = true;
    setSavingClassification(true);
    const startedAt = performance.now();
    booruViewLogger.debug(
      "booru.classification.autosave.start",
      "Booru inicio un autosave de clasificacion o metadata.",
      {
        resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
        dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : []
      }
    );
    try {
      const itemsById = new Map(resourceItems.map((item) => [item.id, item]));
      const draftResources = draftToPersist.resourceIds.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
      const payload = buildSavePayload(draftResources, draftToPersist);
      const result = await invoke(
        canSaveClassification(draftToPersist) ? "booru:save-basic-classification" : "booru:save-resource-metadata",
        payload
      );
      const savedResources = normalizeSelectedEntities(
        Array.isArray(result?.resource) ? result.resource : [result?.resource].filter(Boolean)
      );
      const savedById = new Map(savedResources.map((item) => [item.id, item]));
      const orderedSavedResources = draftToPersist.resourceIds.map((resourceId) => savedById.get(resourceId)).filter(Boolean);
      if (orderedSavedResources.length) {
        setResourceState((currentValue) => ({
          ...currentValue,
          items: mergeResourcesIntoItems(currentValue.items, orderedSavedResources)
        }));
      }
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      setEntityRevision((currentValue) => currentValue + 1);
      setClassificationDraft((currentDraft) => arraysEqual(currentDraft.resourceIds || [], draftToPersist.resourceIds || []) ? {
        ...buildClassificationDraft(orderedSavedResources.length ? orderedSavedResources : draftResources),
        dirtyFields: []
      } : currentDraft);
      logRendererDuration(
        "booru.classification.autosave.done",
        "Booru resolvio un autosave de clasificacion o metadata.",
        performance.now() - startedAt,
        {
          resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
          dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
          savedCount: orderedSavedResources.length,
          sampleIds: summarizeIdsForLog(orderedSavedResources)
        }
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el recurso."
      );
      booruViewLogger.info(
        "booru.classification.autosave.error",
        "Booru no pudo persistir un autosave de clasificacion o metadata.",
        {
          resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
          dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: saveError instanceof Error ? saveError.message : String(saveError || "")
        }
      );
    } finally {
      autosaveStateRef.current.inFlight = false;
      setSavingClassification(false);
      if (autosaveStateRef.current.queued) {
        autosaveStateRef.current.queued = false;
        const latestDraft = classificationDraftRef.current;
        if (canSaveDraftProgress(latestDraft)) {
          void persistClassificationDraft(latestDraft);
        }
      }
    }
  };
  useEffect(() => {
    if (!showResourceWorkspace || activeSection === "duplicates" || activeSection === "trash") {
      return void 0;
    }
    if (!canSaveDraftProgress(classificationDraft)) {
      return void 0;
    }
    const draftSnapshot = classificationDraft;
    autosaveTimerRef.current = window.setTimeout(() => {
      autosaveTimerRef.current = 0;
      void persistClassificationDraft(draftSnapshot);
    }, 220);
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = 0;
      }
    };
  }, [activeSection, classificationDraft, selectedResourceIdsSignature, showResourceWorkspace]);
  const handleQuickAssignEntity = async ({ resourceId, resourceIds, kind, entityId }) => {
    const normalizedResourceIds = uniqueIds([
      resourceId,
      ...Array.isArray(resourceIds) ? resourceIds : []
    ]);
    if (!normalizedResourceIds.length || !kind || !entityId) {
      return;
    }
    const startedAt = performance.now();
    setBusyAction("quick-assign");
    booruViewLogger.debug(
      "booru.quick-assign.start",
      "Booru inicio una asignacion rapida.",
      {
        resourceId: normalizedResourceIds[0] || null,
        resourceIds: normalizedResourceIds,
        kind,
        entityId
      }
    );
    try {
      const result = await invoke("booru:quick-assign-entity", {
        resourceId: normalizedResourceIds[0] || null,
        resourceIds: normalizedResourceIds,
        kind,
        entityId
      });
      setSnapshot(result?.snapshot || snapshot);
      const updatedResources = normalizeSelectedEntities(
        Array.isArray(result?.resource) ? result.resource : [result?.resource].filter(Boolean)
      );
      if (updatedResources.length) {
        setResourceState((currentValue) => ({
          ...currentValue,
          items: mergeResourcesIntoItems(currentValue.items, updatedResources)
        }));
      }
      setError("");
      setEntityRevision((currentValue) => currentValue + 1);
      logRendererDuration(
        "booru.quick-assign.done",
        "Booru resolvio una asignacion rapida.",
        performance.now() - startedAt,
        {
          resourceId: normalizedResourceIds[0] || null,
          resourceIds: normalizedResourceIds,
          kind,
          entityId,
          resultResourceIds: updatedResources.map((resource) => resource.id)
        }
      );
    } catch (assignError) {
      setError(
        assignError instanceof Error ? assignError.message : "No se pudo aplicar la asignacion rapida."
      );
      booruViewLogger.info(
        "booru.quick-assign.error",
        "Booru no pudo aplicar una asignacion rapida.",
        {
          resourceId: normalizedResourceIds[0] || null,
          resourceIds: normalizedResourceIds,
          kind,
          entityId,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: assignError instanceof Error ? assignError.message : String(assignError || "")
        }
      );
    } finally {
      setBusyAction("");
    }
  };
  handleQuickAssignEntityRef.current = handleQuickAssignEntity;
  const handleSetCharacterUniverse = async (nextUniverse) => {
    if (activeEntityKind !== "character" || !activeEntityProfile?.id) {
      return;
    }
    setEntityBusy(true);
    try {
      const result = await invoke("booru:set-character-universe", {
        characterId: activeEntityProfile.id,
        universeId: nextUniverse?.id || null
      });
      if (result?.profile) {
        setEntityProfile(result.profile);
      }
      setEntityError("");
      setEntityProfileError("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (saveError) {
      setEntityError(
        saveError instanceof Error ? saveError.message : "No se pudo actualizar el universe del character."
      );
    } finally {
      setEntityBusy(false);
    }
  };
  const handleCreateCharacterInUniverse = async () => {
    if (activeEntityKind !== "universe" || !activeEntityProfile?.id) {
      return;
    }
    const trimmedName = String(universeCharacterCreateValue || "").trim();
    if (!trimmedName) {
      return;
    }
    setEntityBusy(true);
    try {
      await invoke("booru:ensure-character-in-universe", {
        name: trimmedName,
        universeId: activeEntityProfile.id
      });
      setEntityError("");
      setEntityProfileError("");
      setUniverseCharacterCreateValue("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (createError) {
      setEntityError(
        createError instanceof Error ? createError.message : "No se pudo crear el character dentro del universe."
      );
    } finally {
      setEntityBusy(false);
    }
  };
  const handleEnsureSectionEntity = async () => {
    const trimmedName = String(entityCreateValue || "").trim();
    if (!activeEntityKind || !trimmedName) {
      return;
    }
    setEntityBusy(true);
    try {
      if (activeEntityKind === "character" && entityCreateUniverse?.id) {
        await invoke("booru:ensure-character-in-universe", {
          name: trimmedName,
          universeId: entityCreateUniverse.id
        });
      } else {
        await invoke("booru:ensure-entity", {
          kind: activeEntityKind,
          name: trimmedName
        });
      }
      setEntityError("");
      setEntityCreateValue("");
      setEntityCreateUniverse(null);
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (ensureError) {
      setEntityError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la entidad."
      );
    } finally {
      setEntityBusy(false);
    }
  };
  const handleRestoreSelected = async () => {
    try {
      setBusyAction("restore");
      const result = await invoke("booru:restore-resources", {
        resourceIds: currentSelection.ids
      });
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      clearSelectionForSection(activeSection);
    } catch (restoreError) {
      setError(
        restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la seleccion."
      );
    } finally {
      setBusyAction("");
    }
  };
  const handlePurgeSelected = async () => {
    try {
      setBusyAction("purge");
      const result = await invoke("booru:purge-resources", {
        resourceIds: currentSelection.ids
      });
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      clearSelectionForSection(activeSection);
    } catch (purgeError) {
      setError(
        purgeError instanceof Error ? purgeError.message : "No se pudo purgar la seleccion."
      );
    } finally {
      setBusyAction("");
    }
  };
  const hasBlockingSetupWarning = !snapshot?.settings?.watchFolderPath || snapshot?.settings?.watchFolderPath && !snapshot?.python?.available;
  const handleOpenEntity = (kind, item) => {
    if (!item?.id) {
      return;
    }
    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...input && typeof input === "object" ? input : {},
        section: ENTITY_KIND_SECTION_MAP[kind] || activeSection,
        entityProfile: {
          kind,
          id: item.id,
          tab: "gallery"
        }
      }
    });
  };
  const handleCloseEntityProfile = () => {
    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...input && typeof input === "object" ? input : {},
        section: activeSection,
        entityProfile: null
      }
    });
  };
  const handleChangeEntityProfileTab = (nextTab) => {
    if (!activeEntityProfile?.id || !activeEntityKind) {
      return;
    }
    const normalizedTab = nextTab === "data" ? "data" : "gallery";
    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...input && typeof input === "object" ? input : {},
        section: activeSection,
        entityProfile: {
          kind: activeEntityKind,
          id: activeEntityProfile.id,
          tab: normalizedTab
        }
      }
    });
  };
  const handleOpenEntityInMedia = () => {
    if (!activeEntityKind || !activeEntityProfile?.id) {
      return;
    }
    const entityLabel = getEntityProfileLabel(activeEntityProfile, entityProfile) || BOORU_ENTITY_KIND_LABELS[activeEntityKind] || "Entidad";
    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...input && typeof input === "object" ? input : {},
        section: "media",
        entityProfile: null,
        entityFilters: [
          {
            kind: activeEntityKind,
            id: activeEntityProfile.id,
            label: entityLabel
          }
        ]
      }
    });
  };
  if (activeSection === "metrics") {
    return /* @__PURE__ */ React2.createElement(WorkspacePage, { className: "booruView" }, /* @__PURE__ */ React2.createElement(WorkspaceBody, { className: "booruView__body" }, /* @__PURE__ */ React2.createElement(ScrollRegion, { className: "booruView__detailScroll" }, loading && !snapshot ? /* @__PURE__ */ React2.createElement(
      StateBlock,
      {
        centered: true,
        title: "Cargando plugin",
        description: "Leyendo biblioteca, entidades y runtime local."
      }
    ) : /* @__PURE__ */ React2.createElement("div", { className: "booruView__content" }, error ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, error) : null, !snapshot?.settings?.watchFolderPath ? /* @__PURE__ */ React2.createElement(Notice, { tone: "warning" }, "Booru todavia no tiene una carpeta vigilada configurada.") : null, snapshot?.settings?.watchFolderPath && !snapshot?.python?.available ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, snapshot?.python?.error || "No se encontro Python para Booru.") : null, /* @__PURE__ */ React2.createElement(
      MetricsSection,
      {
        snapshot,
        busyAction,
        loading,
        onRefresh: () => loadSnapshot({ silent: false, reason: "metrics-refresh" }),
        onRescan: () => handleAction("rescan", "booru:rescan-watch-folder"),
        onRestart: () => handleAction("restart", "booru:restart-watcher")
      }
    )))));
  }
  return /* @__PURE__ */ React2.createElement(WorkspacePage, { className: "booruView" }, /* @__PURE__ */ React2.createElement(WorkspaceBody, { className: "booruView__body" }, /* @__PURE__ */ React2.createElement(SplitLayout, { variant: "sidebar-detail", className: "booruView__layout" }, /* @__PURE__ */ React2.createElement(SplitSidebar, { className: "booruView__sidebar" }, /* @__PURE__ */ React2.createElement(ScrollRegion, { className: "booruView__sidebarScroll" }, /* @__PURE__ */ React2.createElement(PanelStack, { className: "booruView__sidebarStack" }, /* @__PURE__ */ React2.createElement(SectionPanel, { className: "booruView__panel booruView__panel--compact" }, showResourceWorkspace ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(InlineField, { label: "Buscar", grow: true, className: "booruView__inlineField" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "text",
      value: resourceSearchValue,
      onChange: (event) => setResourceSearchValue(event.target.value),
      placeholder: "Buscar media, persona, artist, character, universe o tag"
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "booruView__quickFilters booruView__quickFilters--compact" }, QUICK_FILTER_OPTIONS.map((option) => /* @__PURE__ */ React2.createElement(
    Button,
    {
      key: option.value,
      type: "button",
      tone: quickFilter === option.value ? "primary" : "secondary",
      className: "booruView__quickFilterButton",
      onClick: () => setQuickFilter(option.value)
    },
    option.label
  ))), resourceEntityFilters.length ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__entitySelection" }, resourceEntityFilters.map((filter) => /* @__PURE__ */ React2.createElement("span", { key: `${filter.kind}:${filter.id}`, className: "booruView__selectionChip" }, /* @__PURE__ */ React2.createElement("span", null, getEntityFilterChipLabel(filter)), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "booruView__selectionChipRemove",
      onClick: () => {
        setResourceEntityFilters((currentValue) => currentValue.filter((entry) => !(entry.kind === filter.kind && entry.id === filter.id)));
      },
      "aria-label": `Quitar filtro ${getEntityFilterChipLabel(filter)}`
    },
    "x"
  )))) : null, activeSection !== "trash" ? /* @__PURE__ */ React2.createElement(
    QuickAssignPanel,
    {
      selectedResourceIds: selectedResources.map((resource) => resource.id),
      customDragState,
      manualAssignDisabledReason: selectedResources.length === 0 ? "Puedes arrastrar una card al destino o seleccionar recursos para usar el boton." : "",
      assigning: busyAction === "quick-assign",
      revisionKey: entityRevision,
      onAssign: handleQuickAssignEntity
    }
  ) : null) : null, activeEntityKind ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(InlineField, { label: "Buscar", grow: true, className: "booruView__inlineField" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "text",
      value: entitySearchValue,
      onChange: (event) => setEntitySearchValue(event.target.value),
      placeholder: `Buscar ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidad"}`
    }
  )), /* @__PURE__ */ React2.createElement(InlineField, { label: "Crear", grow: true, className: "booruView__inlineField" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "text",
      value: entityCreateValue,
      onChange: (event) => setEntityCreateValue(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void handleEnsureSectionEntity();
        }
      },
      placeholder: `Crear ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidad"}`
    }
  )), activeEntityKind === "character" ? /* @__PURE__ */ React2.createElement(Field, { label: "Universe inicial", className: "booruView__field" }, /* @__PURE__ */ React2.createElement(
    SingleEntityAutocompleteField,
    {
      kind: "universe",
      label: "Universe inicial",
      value: entityCreateUniverse,
      onChange: setEntityCreateUniverse,
      disabled: entityBusy,
      placeholder: "Buscar universe o crear uno nuevo",
      buttonLabel: "Elegir"
    }
  )) : null, /* @__PURE__ */ React2.createElement("div", { className: "booruView__sidebarActions booruView__sidebarActions--compact" }, /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => void handleEnsureSectionEntity(),
      disabled: !String(entityCreateValue || "").trim() || entityBusy
    },
    "Crear"
  ))) : null)))), /* @__PURE__ */ React2.createElement(SplitDetail, { className: "booruView__detail" }, loading && !snapshot ? /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: "Cargando plugin",
      description: "Leyendo biblioteca, entidades y runtime local."
    }
  ) : showResourceWorkspace ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__content booruView__content--workspace" }, error ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, error) : null, entityError ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, entityError) : null, hasBlockingSetupWarning && (activeSection === "media" || activeSection === "pending") ? !snapshot?.settings?.watchFolderPath ? /* @__PURE__ */ React2.createElement(Notice, { tone: "warning" }, "Booru todavia no tiene una carpeta vigilada configurada.") : /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, snapshot?.python?.error || "No se encontro Python para Booru.") : null, /* @__PURE__ */ React2.createElement("div", { className: [
    "booruView__workspaceGrid",
    !showInspector ? "booruView__workspaceGrid--single" : ""
  ].filter(Boolean).join(" ") }, /* @__PURE__ */ React2.createElement(
    ResourceGrid,
    {
      items: resourceItems,
      selectedIds: currentSelection.ids,
      selectionMode: currentSelection.mode,
      customDragState,
      onCustomDragPointerDown: handleCustomDragPointerDown,
      shouldSuppressClick: consumeSuppressedResourceClick,
      totalCount: resourceState.totalCount,
      loading: resourceLoading,
      scrollKey: `${activeSection}:${currentResourcePage}:${resourceQuerySignature}`,
      currentPage: currentResourcePage,
      pageSize: RESOURCE_PAGE_SIZE,
      onPageChange: (nextPage) => setResourcePageForSection(activeSection, nextPage),
      onSelect: handleResourceClick,
      onContextMenu: openResourceContextMenu,
      onClearSelection: () => clearSelectionForSection(activeSection),
      emptyTitle: activeSection === "pending" ? "No hay pendientes" : activeSection === "duplicates" ? "No hay duplicados" : activeSection === "trash" ? "La papelera esta vacia" : "Todavia no hay media",
      emptyDescription: activeSection === "pending" ? "Cuando Booru detecte recursos incompletos, apareceran aqui por prioridad." : activeSection === "duplicates" ? "No se detectaron duplicados exactos en esta tanda." : activeSection === "trash" ? "Los recursos eliminados desde Booru apareceran aqui." : "Cuando Booru detecte archivos soportados, apareceran aqui."
    }
  ), showInspector ? /* @__PURE__ */ React2.createElement(
    ResourceInspector,
    {
      section: activeSection,
      activeResource,
      selectedResources,
      draft: classificationDraft,
      saving: savingClassification,
      onDraftChange: (updater) => {
        setClassificationDraft((currentDraft) => typeof updater === "function" ? updater(currentDraft) : updater);
      },
      onRestore: handleRestoreSelected,
      onPurge: handlePurgeSelected,
      onClose: () => clearSelectionForSection(activeSection)
    }
  ) : null)) : /* @__PURE__ */ React2.createElement(ScrollRegion, { className: "booruView__detailScroll" }, /* @__PURE__ */ React2.createElement("div", { className: "booruView__content" }, error ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, error) : null, entityError ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, entityError) : null, entityProfileError ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, entityProfileError) : null, activeEntityKind ? showEntityProfile ? entityProfileLoading && !entityProfile ? /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: "Cargando perfil",
      description: `Preparando ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "la entidad"} desde Booru.`
    }
  ) : entityProfile ? /* @__PURE__ */ React2.createElement(
    EntityProfileView,
    {
      kind: activeEntityKind,
      profile: entityProfile,
      activeTab: activeEntityProfile?.tab || "gallery",
      galleryState: entityProfileGalleryState,
      galleryLoading: entityProfileGalleryLoading,
      currentPage: currentEntityProfilePage,
      pageSize: RESOURCE_PAGE_SIZE,
      entityMutationBusy: entityBusy,
      universeCharacterCreateValue,
      onPageChange: (nextPage) => setEntityProfilePageForSection(activeSection, nextPage),
      onBack: handleCloseEntityProfile,
      onTabChange: handleChangeEntityProfileTab,
      onOpenInMedia: handleOpenEntityInMedia,
      onUniverseCharacterCreateValueChange: setUniverseCharacterCreateValue,
      onCreateCharacterInUniverse: handleCreateCharacterInUniverse,
      onChangeCharacterUniverse: handleSetCharacterUniverse,
      onVisualContextMenu: openEntityProfileVisualContextMenu,
      onGalleryResourceContextMenu: openEntityProfileResourceContextMenu
    }
  ) : /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: "Perfil no disponible",
      description: "La entidad solicitada ya no esta disponible o su perfil no pudo cargarse."
    }
  ) : entityLoading ? entityItems.length ? /* @__PURE__ */ React2.createElement("div", { className: "booruView__entitySectionContent" }, /* @__PURE__ */ React2.createElement(
    EntityGrid,
    {
      kind: activeEntityKind,
      items: entityItems,
      emptyTitle: `Sin ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "elementos"} todavia`,
      emptyDescription: "Empieza a escribir y presiona Enter para crear el primero.",
      onOpenEntity: handleOpenEntity,
      onPreviewContextMenu: openEntityCardContextMenu
    }
  ), /* @__PURE__ */ React2.createElement("span", { className: "booruView__suggestionsHint" }, "Actualizando seccion...")) : /* @__PURE__ */ React2.createElement(
    StateBlock,
    {
      centered: true,
      title: "Cargando seccion",
      description: `Leyendo ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidades"} desde Booru.`
    }
  ) : /* @__PURE__ */ React2.createElement(
    EntityGrid,
    {
      kind: activeEntityKind,
      items: entityItems,
      emptyTitle: `Sin ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "elementos"} todavia`,
      emptyDescription: "Empieza a escribir y presiona Enter para crear el primero.",
      onOpenEntity: handleOpenEntity,
      onPreviewContextMenu: openEntityCardContextMenu
    }
  ) : null)))), /* @__PURE__ */ React2.createElement(
    FloatingContextMenu,
    {
      state: contextMenuState,
      onClose: () => setContextMenuState(null),
      onAction: (actionId) => void handleContextMenuAction(actionId)
    }
  ), /* @__PURE__ */ React2.createElement(
    BooruDragPreviewLayer,
    {
      resourcesById: dragPreviewResourcesById,
      customDragState
    }
  )));
}

// ../nexus-plugins/booru/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = BOORU_PLUGIN_ID;
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var booruRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerView({
      id: BOORU_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Booru",
      icon: BooruIcon,
      tone: "document",
      surface: "workspace",
      workspaceFrame: {
        sections: BOORU_SECTION_OPTIONS,
        defaultSection: BOORU_DEFAULT_SECTION
      },
      component: (props) => /* @__PURE__ */ React.createElement(BooruWorkspaceView, { ...props, ctx })
    });
    ctx.registerSideToolbarButton({
      id: "nexus.booru.workspace-button",
      pluginId: ctx.pluginId,
      order: 280,
      icon: BooruIcon,
      tone: "document",
      label: "Booru",
      onClick: () => {
        void ctx.openView({
          viewId: BOORU_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.booru.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === BOORU_WORKSPACE_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = booruRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
