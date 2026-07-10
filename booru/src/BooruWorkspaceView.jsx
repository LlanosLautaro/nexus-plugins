import {
  BOORU_CLASSIFICATION_LABELS,
  BOORU_DEFAULT_SECTION,
  BOORU_ENTITY_KIND_LABELS,
  BOORU_MEDIA_KIND_LABELS,
  BOORU_REALITY_LABELS,
  BOORU_REALITY_OPTIONS,
  BOORU_SECTION_OPTIONS,
  BOORU_WORKSPACE_VIEW_ID,
} from "./constants.js";
import { createRendererDevLogger } from "../../../nexus-frontend/src/utils/devLog.js";
import {
  AlertIcon,
  FolderIcon,
  PulseIcon,
  RefreshIcon,
} from "./icons.jsx";
import {
  Button,
  Field,
  InlineField,
  MetricCard,
  Notice,
  PanelStack,
  ScrollRegion,
  SectionPanel,
  SegmentedControl,
  SplitDetail,
  SplitLayout,
  SplitSidebar,
  StateBlock,
  WorkspaceBody,
  WorkspacePage,
} from "../../../nexus-frontend/src/ui/index.js";
import {
  normalizeBooruEntityPrefix,
  normalizeBooruMissingFilter,
  parseBooruSearchSyntax,
  tokenizeBooruQuery,
} from "./booru-utils.js";

const ipcRenderer = window.nexus.ipc;
const { pathToFileUrl } = window.nexus.urls;
const React = window.React;
const { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } = React;
const ReactDnd = window.__NEXUS_HOST_REACT_DND__ || {};
const ReactDndHtml5Backend = window.__NEXUS_HOST_REACT_DND_HTML5_BACKEND__ || {};
const { useDrag, useDragLayer, useDrop } = ReactDnd;
const { getEmptyImage } = ReactDndHtml5Backend;
const safeUseDrag = typeof useDrag === "function"
  ? useDrag
  : (() => [{ isDragging: false }, () => undefined, () => undefined]);
const safeUseDragLayer = typeof useDragLayer === "function"
  ? useDragLayer
  : (() => ({
    currentOffset: null,
    isDragging: false,
    itemType: "",
    item: null,
  }));
const safeUseDrop = typeof useDrop === "function"
  ? useDrop
  : (() => [{ isOver: false, canDrop: false }, () => undefined]);
const booruViewLogger = createRendererDevLogger("renderer.plugins.booru");

const WORKSPACE_FRAME_SECTION_NONCE_KEY = "workspaceFrameSectionNonce";
const SETTINGS_SUBVIEW_OPTIONS = new Set(["overview", "duplicates", "trash"]);
const RESOURCE_SECTIONS = new Set(["media", "pending", "duplicates", "trash"]);
const ENTITY_SECTION_KIND_MAP = Object.freeze({
  authors: "author",
  characters: "character",
  artists: "artist",
  universes: "universe",
});
const ENTITY_KIND_SECTION_MAP = Object.freeze({
  author: "authors",
  character: "characters",
  artist: "artists",
  universe: "universes",
});
const ENTITY_PROFILE_TAB_OPTIONS = [
  { value: "gallery", label: "Galeria" },
  { value: "data", label: "Datos" },
];
const CLASSIFICATION_SIDEBAR_SECTIONS = new Set(["media", "pending"]);
const MEDIA_FILTER_OPTIONS = [
  { value: "all", label: "Todo" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "gif", label: "GIF" },
];
const REALITY_FILTER_OPTIONS = [
  { value: "all", label: "Cualquiera" },
  { value: "real", label: "Real" },
  { value: "ficticio", label: "Ficticio" },
];
const PENDING_MODE_OPTIONS = [
  { value: "essential", label: "Esencial" },
  { value: "tags", label: "Tags" },
];
const RECOMMENDATION_PAGE_SIZE = 24;
const NO_MISSING_FILTER = "none";
const BOORU_RESOURCE_DND_TYPE = "nexus.booru.resource-card";
const RESOURCE_PAGE_SIZE = 42;
const RESOURCE_GRID_COLUMNS = 6;
const NO_SETTINGS_SUBVIEW = "overview";
const RESOURCE_SELECTION_SECTIONS = {
  media: { ids: [], activeId: "", mode: "single" },
  pending: { ids: [], activeId: "", mode: "single" },
  duplicates: { ids: [], activeId: "", mode: "single" },
  trash: { ids: [], activeId: "", mode: "single" },
};
const EMPTY_SELECTION_STATE = Object.freeze({
  ids: Object.freeze([]),
  activeId: "",
  mode: "single",
});
const DRAFT_ENTITY_FIELD_BY_KIND = Object.freeze({
  author: "authors",
  artist: "artists",
  character: "characters",
  universe: "universes",
});
const RESOURCE_PAGE_SECTIONS = {
  media: { page: 1, querySignature: "" },
  pending: { page: 1, querySignature: "" },
  duplicates: { page: 1, querySignature: "" },
  trash: { page: 1, querySignature: "" },
};
const ENTITY_PROFILE_PAGE_SECTIONS = {
  authors: { page: 1, profileKey: "" },
  characters: { page: 1, profileKey: "" },
  artists: { page: 1, profileKey: "" },
  universes: { page: 1, profileKey: "" },
};

async function invoke(channel, payload) {
  const response = await ipcRenderer.invoke(channel, payload);

  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo ejecutar la operacion.");
  }

  return response.data;
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getActiveSection(input) {
  const requestedSection = typeof input?.section === "string"
    ? input.section.trim()
    : "";

  if (requestedSection === "metrics") {
    return "settings";
  }

  if (BOORU_SECTION_OPTIONS.some((option) => option.value === requestedSection)) {
    return requestedSection;
  }

  if (RESOURCE_SECTIONS.has(requestedSection)) {
    return requestedSection;
  }

  return BOORU_DEFAULT_SECTION;
}

function getSettingsSubview(input) {
  const requestedSubview = typeof input?.settingsSubview === "string"
    ? input.settingsSubview.trim()
    : "";

  if (SETTINGS_SUBVIEW_OPTIONS.has(requestedSubview)) {
    return requestedSubview;
  }

  return NO_SETTINGS_SUBVIEW;
}

function getActiveResourceSection(activeSection, settingsSubview) {
  if (RESOURCE_SECTIONS.has(activeSection)) {
    return activeSection;
  }

  if (activeSection === "settings" && (settingsSubview === "duplicates" || settingsSubview === "trash")) {
    return settingsSubview;
  }

  return null;
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
    timeStyle: "short",
  }).format(dateValue);
}

function openPath(pathValue) {
  const normalizedPath = String(pathValue || "").trim();

  if (!normalizedPath) {
    return;
  }

  window.nexus.desktop.showItemInFolder(normalizedPath);
}

function toFileUrl(pathValue) {
  const normalizedPath = String(pathValue || "").trim();

  if (!normalizedPath) {
    return "";
  }

  try {
    return pathToFileUrl(normalizedPath);
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

function isTextEntryElement(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function summarizeIdsForLog(items, maxCount = 8) {
  return (Array.isArray(items) ? items : [])
    .map((item) => String(item?.id || item || "").trim())
    .filter(Boolean)
    .slice(0, maxCount);
}

function summarizeEntityFiltersForLog(filters) {
  return (Array.isArray(filters) ? filters : [])
    .map((filter) => ({
      kind: String(filter?.kind || "").trim() || null,
      id: String(filter?.id || "").trim() || null,
      label: String(filter?.label || "").trim() || null,
    }))
    .filter((filter) => filter.kind && filter.id);
}

function summarizeResourcesForLog(items) {
  const resourceItems = Array.isArray(items) ? items : [];
  const thumbnailStatusCounts = {
    ready: 0,
    pending: 0,
    error: 0,
    missing: 0,
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
    thumbnailStatusCounts,
  };
}

function logRendererDuration(eventBase, message, durationMs, data = null) {
  const method = durationMs >= 180 ? "info" : "debug";
  booruViewLogger[method](eventBase, message, {
    durationMs: Number(durationMs.toFixed(2)),
    ...(data && typeof data === "object" ? data : {}),
  });
}

function normalizeSelectedEntities(items) {
  const uniqueItems = [];
  const seenIds = new Set();

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
  const seenIds = new Set();

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
  const seenIds = new Set();
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

  return (
    (Array.isArray(items) ? items : []).find((item) => (
      normalizeSearchText(item?.displayName) === normalizedQuery
      || normalizeSearchText(item?.slug) === normalizedQuery
    ))
    || null
  );
}

function resolveDraggedResourceIds(draggedItem) {
  return uniqueIds([
    ...(Array.isArray(draggedItem?.resourceIds) ? draggedItem.resourceIds : []),
    ...(Array.isArray(draggedItem?.ids) ? draggedItem.ids : []),
    draggedItem?.resourceId,
    draggedItem?.id,
    draggedItem?.primaryId,
  ]);
}

function getDragPreviewStyles(currentOffset) {
  if (!currentOffset) {
    return {
      display: "none",
    };
  }

  return {
    transform: `translate(${currentOffset.x + 14}px, ${currentOffset.y + 14}px)`,
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
    label: label || null,
  };
}

function findExactTagMatch(items, query) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    (Array.isArray(items) ? items : []).find((item) => normalizeSearchText(item?.name) === normalizedQuery)
    || null
  );
}

function renderEntityChips(items, emptyLabel) {
  if (!Array.isArray(items) || !items.length) {
    return <span className="booruView__metaPlaceholder">{emptyLabel}</span>;
  }

  return (
    <div className="booruView__tagRow">
      {items.map((item) => (
        <span key={item.id} className="booruView__tagChip">
          {item?.universe?.displayName ? `${item.displayName} - ${item.universe.displayName}` : item.displayName}
        </span>
      ))}
    </div>
  );
}

function renderTagChips(items, emptyLabel) {
  if (!Array.isArray(items) || !items.length) {
    return <span className="booruView__metaPlaceholder">{emptyLabel}</span>;
  }

  return (
    <div className="booruView__tagRow">
      {items.map((item) => (
        <span key={item.id} className="booruView__tagChip">
          {item.name}
        </span>
      ))}
    </div>
  );
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
    (Array.isArray(characters) ? characters : [])
      .map((item) => String(item?.id || "").trim())
      .filter(Boolean),
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
    querySignature: String(sectionState?.querySignature || querySignature || ""),
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
  return (Array.isArray(filters) ? filters : [])
    .map((filter) => `${String(filter?.kind || "").trim()}:${String(filter?.id || "").trim()}`)
    .filter(Boolean)
    .join("|");
}

function mergeResourcesIntoItems(items, nextResources) {
  const nextById = new Map(
    (Array.isArray(nextResources) ? nextResources : [])
      .filter(Boolean)
      .map((item) => [item.id, item]),
  );

  if (!nextById.size) {
    return Array.isArray(items) ? items : [];
  }

  return (Array.isArray(items) ? items : []).map((item) => nextById.get(item.id) || item);
}

function normalizeResourceEntityFilters(items) {
  const uniqueItems = [];
  const seenIds = new Set();

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
      label: String(item?.label || item?.displayName || "").trim() || null,
    });
  }

  return uniqueItems;
}

function getEntityFilterChipLabel(filter) {
  const kindLabel = BOORU_ENTITY_KIND_LABELS[String(filter?.kind || "")] || "Entidad";
  const baseLabel = String(filter?.label || "").trim() || kindLabel;
  return `${kindLabel}: ${baseLabel}`;
}

function getSelectionChipKindClass(kind) {
  const normalizedKind = String(kind || "").trim();
  return normalizedKind ? `booruView__selectionChip--${normalizedKind}` : "";
}

function getMissingFilterChipClass(value) {
  if (value === "author") {
    return getSelectionChipKindClass("author");
  }

  if (value === "artist") {
    return getSelectionChipKindClass("artist");
  }

  if (value === "character") {
    return getSelectionChipKindClass("character");
  }

  if (value === "universe") {
    return getSelectionChipKindClass("universe");
  }

  if (value === "type") {
    return "booruView__selectionChip--reality";
  }

  return "";
}

function buildResourceQueryTokenLabel(token) {
  if (!token) {
    return "";
  }

  if (token.type === "entity") {
    const kindLabel = BOORU_ENTITY_KIND_LABELS[String(token.kind || "")] || "Entidad";
    return `${token.negative ? "No " : ""}${kindLabel}: ${token.value}`;
  }

  if (token.type === "tag") {
    return `${token.negative ? "No " : ""}Tag: ${token.value}`;
  }

  if (token.type === "reality") {
    return `Tipo: ${BOORU_REALITY_LABELS[token.value] || token.value}`;
  }

  if (token.type === "media-kind") {
    return `Media: ${BOORU_MEDIA_KIND_LABELS[token.value] || token.value}`;
  }

  if (token.type === "classification-state") {
    return token.value === "unclassified" ? "Sin clasificar" : String(token.value || "");
  }

  if (token.type === "missing") {
    if (token.value === "type") {
      return "Sin tipo";
    }

    if (token.value === "author") {
      return "Sin persona";
    }

    if (token.value === "artist") {
      return "Sin artist";
    }

    if (token.value === "character") {
      return "Sin char";
    }

    return "Sin universe";
  }

  return String(token.value || token.raw || "").trim();
}

function removeStructuredQueryToken(value, tokenRaw) {
  const normalizedTokenRaw = String(tokenRaw || "").trim();

  if (!normalizedTokenRaw) {
    return String(value || "").trim();
  }

  const currentTokens = String(value || "")
    .match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
  let removed = false;

  return currentTokens
    .filter((token) => {
      if (!removed && token === normalizedTokenRaw) {
        removed = true;
        return false;
      }

      return true;
    })
    .join(" ")
    .trim();
}

function buildResourceQuery({
  searchTokens = [],
  mediaKindFilter = "all",
  realityFilter = "all",
  pendingMode = "essential",
  missingFilter = NO_MISSING_FILTER,
}) {
  let searchReality = null;
  let searchClassificationState = null;
  let searchMissing = null;
  let searchMediaKind = null;
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];

  for (const token of normalizeResourceSearchTokens(searchTokens)) {
    if (token.type === "entity") {
      const nextFilter = {
        kind: token.kind,
        id: token.id || null,
        value: token.value,
        label: token.label || token.value,
      };

      if (token.negative) {
        excludeEntities.push(nextFilter);
      } else {
        includeEntities.push(nextFilter);
      }
      continue;
    }

    if (token.type === "tag") {
      const nextFilter = {
        id: token.id || null,
        value: token.value,
        label: token.label || token.value,
      };

      if (token.negative) {
        excludeTags.push(nextFilter);
      } else {
        includeTags.push(nextFilter);
      }
      continue;
    }

    if (token.type === "reality" && !token.negative) {
      searchReality = token.value;
      continue;
    }

    if (token.type === "missing" && !token.negative) {
      searchMissing = token.value;
      continue;
    }

    if (token.type === "classification-state" && !token.negative) {
      searchClassificationState = token.value;
      continue;
    }

    if (token.type === "media-kind" && !token.negative) {
      searchMediaKind = token.value;
    }
  }

  return {
    mediaKind: mediaKindFilter !== "all" ? mediaKindFilter : searchMediaKind,
    reality: realityFilter !== "all" ? realityFilter : searchReality,
    classificationState: searchClassificationState || null,
    pendingMode: pendingMode === "tags" ? "tags" : "essential",
    includeEntities,
    excludeEntities,
    includeTags,
    excludeTags,
    missing: missingFilter !== NO_MISSING_FILTER ? missingFilter : searchMissing,
  };
}

function getContextualMissingFilterOptions(realityValue, includeEntityFilters = []) {
  const entityKinds = new Set(
    (Array.isArray(includeEntityFilters) ? includeEntityFilters : [])
      .map((filter) => String(filter?.kind || "").trim())
      .filter(Boolean),
  );
  const disabledValues = new Set();

  if (entityKinds.has("character")) {
    disabledValues.add("character");
    disabledValues.add("universe");
  } else if (entityKinds.has("universe")) {
    disabledValues.add("universe");
  }

  const options = [{ value: NO_MISSING_FILTER, label: "Ninguno" }];

  if (realityValue === "real") {
    options.push({ value: "author", label: "Sin persona" });
    return options.map((option) => ({
      ...option,
      disabled: option.value !== NO_MISSING_FILTER && disabledValues.has(option.value),
    }));
  }

  if (realityValue === "ficticio") {
    options.push(
      { value: "character", label: "Sin char" },
      { value: "artist", label: "Sin artist" },
      { value: "universe", label: "Sin universe" },
    );
    return options.map((option) => ({
      ...option,
      disabled: option.value !== NO_MISSING_FILTER && disabledValues.has(option.value),
    }));
  }

  options.push({ value: "type", label: "Sin tipo" });
  return options.map((option) => ({
    ...option,
    disabled: option.value !== NO_MISSING_FILTER && disabledValues.has(option.value),
  }));
}

function getResourceQueryTokenClass(token) {
  if (token?.type === "entity") {
    return getSelectionChipKindClass(token.kind);
  }

  if (token?.type === "reality") {
    return "booruView__selectionChip--reality";
  }

  if (token?.type === "missing") {
    return getMissingFilterChipClass(token.value);
  }

  return "";
}

function buildResourceSearchTokenKey(token) {
  return [
    String(token?.type || "").trim(),
    token?.negative ? "1" : "0",
    String(token?.kind || "").trim(),
    String(token?.id || "").trim(),
    String(token?.value || "").trim(),
  ].join("|");
}

function normalizeResourceSearchToken(token) {
  if (!token || typeof token !== "object") {
    return null;
  }

  const type = String(token?.type || "").trim();
  const negative = Boolean(token?.negative);
  const id = String(token?.id || "").trim() || null;
  const value = String(token?.value || "").trim();

  if (!value) {
    return null;
  }

  if (type === "entity") {
    const kind = String(token?.kind || "").trim();

    if (!ENTITY_KIND_SECTION_MAP[kind]) {
      return null;
    }

    return {
      type,
      negative,
      kind,
      id,
      value,
      label: String(token?.label || value).trim() || value,
    };
  }

  if (type === "tag") {
    return {
      type,
      negative,
      id,
      value,
      label: String(token?.label || value).trim() || value,
    };
  }

  if (type === "reality") {
    const normalizedReality = value === "real" || value === "ficticio" ? value : "";

    if (!normalizedReality) {
      return null;
    }

    return {
      type,
      negative: false,
      value: normalizedReality,
      label: normalizedReality,
    };
  }

  if (type === "missing") {
    const normalizedMissing = value === "type"
      || value === "author"
      || value === "artist"
      || value === "character"
      || value === "universe"
      ? value
      : "";

    if (!normalizedMissing) {
      return null;
    }

    return {
      type,
      negative: false,
      value: normalizedMissing,
      label: normalizedMissing,
    };
  }

  if (type === "media-kind") {
    const normalizedMediaKind = value === "image" || value === "video" || value === "gif" ? value : "";

    if (!normalizedMediaKind) {
      return null;
    }

    return {
      type,
      negative: false,
      value: normalizedMediaKind,
      label: normalizedMediaKind,
    };
  }

  if (type === "classification-state") {
    if (value !== "unclassified") {
      return null;
    }

    return {
      type,
      negative: false,
      value,
      label: value,
    };
  }

  return null;
}

function normalizeResourceSearchTokens(items) {
  const seenKeys = new Set();
  const normalizedTokens = [];

  for (const rawToken of Array.isArray(items) ? items : []) {
    const normalizedToken = normalizeResourceSearchToken(rawToken);

    if (!normalizedToken) {
      continue;
    }

    const tokenKey = buildResourceSearchTokenKey(normalizedToken);

    if (seenKeys.has(tokenKey)) {
      continue;
    }

    seenKeys.add(tokenKey);
    normalizedTokens.push(normalizedToken);
  }

  return normalizedTokens;
}

function createSearchTokenFromParsedToken(token) {
  return normalizeResourceSearchToken({
    ...token,
    id: token?.id || null,
    label: token?.value,
  });
}

function buildResourceSearchInputTokens(input) {
  const directTokens = normalizeResourceSearchTokens(input?.resourceSearchTokens);

  if (directTokens.length) {
    return directTokens;
  }

  return normalizeResourceEntityFilters(input?.entityFilters).map((filter) => ({
    type: "entity",
    negative: false,
    kind: filter.kind,
    id: filter.id,
    value: filter.label || filter.id,
    label: filter.label || filter.id,
  }));
}

function getRecommendationItemKindClass(item) {
  if (item?.type === "entity") {
    return getSelectionChipKindClass(item.kind);
  }

  if (item?.type === "create-entity") {
    return getSelectionChipKindClass(item.kind);
  }

  if (item?.type === "reality-action") {
    return "booruView__selectionChip--reality";
  }

  return "";
}

function getRecommendationKindBadgeLabel(item) {
  if (item?.type === "reality-action") {
    return "R";
  }

  if (item?.type === "tag" || item?.type === "create-tag") {
    return "T";
  }

  if (item?.kind === "author") {
    return "P";
  }

  if (item?.kind === "artist") {
    return "A";
  }

  if (item?.kind === "character") {
    return "C";
  }

  if (item?.kind === "universe") {
    return "U";
  }

  return "?";
}

function getRecommendationKindTooltip(item) {
  if (item?.type === "reality-action") {
    return "Realidad";
  }

  if (item?.type === "tag" || item?.type === "create-tag") {
    return "Tag";
  }

  if (item?.kind === "author") {
    return "Persona";
  }

  if (item?.kind === "artist") {
    return "Artist";
  }

  if (item?.kind === "character") {
    return "Character";
  }

  if (item?.kind === "universe") {
    return "Universe";
  }

  return "";
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
    tab,
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
    profileData?.displayName
    || entityProfile?.displayName
    || entityProfile?.label
    || "",
  ).trim();
}

function isPreviewableMediaKind(mediaKind) {
  const normalizedMediaKind = String(mediaKind || "").trim();
  return normalizedMediaKind === "image" || normalizedMediaKind === "gif" || normalizedMediaKind === "video";
}

function isClipboardCompatibleMediaKind(mediaKind) {
  const normalizedMediaKind = String(mediaKind || "").trim();
  return normalizedMediaKind === "image" || normalizedMediaKind === "gif";
}

function canUseResourceAsEntityVisual(resource) {
  return isPreviewableMediaKind(resource?.mediaKind);
}

function canUseResourceForImageActions(resource) {
  return isClipboardCompatibleMediaKind(resource?.mediaKind);
}

function buildContextResourceFromDescriptor(descriptor) {
  const resourceId = String(descriptor?.sampleResourceId || descriptor?.id || "").trim();
  const previewPath = String(descriptor?.sampleStoragePath || descriptor?.cardPreviewPath || "").trim();
  const storagePath = String(
    descriptor?.storagePath
    || descriptor?.cardStoragePath
    || descriptor?.sampleStoragePath
    || descriptor?.cardPreviewPath
    || "",
  ).trim();
  const mediaKind = String(
    descriptor?.sampleMediaKind
    || descriptor?.cardMediaKind
    || descriptor?.mediaKind
    || "",
  ).trim();

  if (!resourceId || !storagePath || !isPreviewableMediaKind(mediaKind)) {
    return null;
  }

  return {
    id: resourceId,
    storagePath,
    previewPath,
    mediaKind,
  };
}

function getInitials(value) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

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
  const nextMode = allowedIds.length > 0
    && sectionState?.mode === "multi"
    && !(collapsedByVisibility && allowedIds.length === 1)
    ? "multi"
    : "single";
  const nextActiveId = allowedIds.includes(sectionState?.activeId) ? sectionState.activeId : (allowedIds.at(-1) || "");

  return {
    ids: allowedIds,
    activeId: nextActiveId,
    mode: nextMode,
  };
}

function markDraftDirty(draft, fieldName) {
  const dirtyFields = new Set(Array.isArray(draft?.dirtyFields) ? draft.dirtyFields : []);
  dirtyFields.add(fieldName);

  return {
    ...draft,
    dirtyFields: Array.from(dirtyFields),
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
      dirtyFields: [],
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
      dirtyFields: [],
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
    dirtyFields: [],
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
    return ((Array.isArray(draft.characters) && draft.characters.length > 0) || (Array.isArray(draft.universes) && draft.universes.length > 0))
      && draft.characters.every((character) => Boolean(resolveCharacterUniverse(draft, character)));
  }

  return false;
}

function canSaveDraftProgress(draft) {
  return Array.isArray(draft?.dirtyFields) && draft.dirtyFields.length > 0;
}

function buildRelationPatch(currentIds, nextIds) {
  return {
    addIds: nextIds.filter((entry) => !currentIds.includes(entry)),
    removeIds: currentIds.filter((entry) => !nextIds.includes(entry)),
  };
}

function buildSavePayload(selectedResources, draft) {
  const normalizedResources = (Array.isArray(selectedResources) ? selectedResources : []).filter(Boolean);
  const dirtyFields = Array.isArray(draft?.dirtyFields) ? draft.dirtyFields : [];
  const characterUniverseAssignments = (Array.isArray(draft?.characters) ? draft.characters : [])
    .map((character) => {
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
        universeId: assignedUniverse.id,
      };
    })
    .filter(Boolean);

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
      characterUniverses: characterUniverseAssignments,
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
    characterUniverses: characterUniverseAssignments,
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
  const working =
    loading
    || resourceLoading
    || Boolean(busyAction)
    || savingClassification
    || pendingCount > 0
    || thumbnailActiveCount > 0
    || thumbnailBacklogCount > 0;
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

function getSnapshotRefreshSignature(snapshot) {
  return JSON.stringify({
    totalCount: Number(snapshot?.stats?.totalCount || 0),
    duplicateCount: Number(snapshot?.stats?.duplicateCount || 0),
    pendingCount: Number(snapshot?.stats?.pendingCount || 0),
    trashCount: Number(snapshot?.stats?.trashCount || 0),
    watcherStage: String(snapshot?.watcher?.stage || ""),
    watcherPendingCount: Number(snapshot?.watcher?.pendingCount || 0),
    lastIngestedAt: String(snapshot?.watcher?.lastIngestedAt || ""),
    lastIngestedStoragePath: String(snapshot?.watcher?.lastIngestedStoragePath || ""),
    thumbnailReadyCount: Number(snapshot?.stats?.thumbnailReadyCount || 0),
    thumbnailErrorCount: Number(snapshot?.stats?.thumbnailErrorCount || 0),
    thumbnailBacklogCount: Number(snapshot?.stats?.thumbnailBacklogCount || 0),
    thumbnailLastError: String(snapshot?.derivatives?.lastError || ""),
  });
}

function mergeSnapshotQueueRequest(currentRequest, nextRequest) {
  const normalizedCurrent = currentRequest && typeof currentRequest === "object"
    ? currentRequest
    : {
      silent: true,
      syncResources: false,
      reasons: [],
    };
  const normalizedNext = nextRequest && typeof nextRequest === "object"
    ? nextRequest
    : {
      silent: true,
      syncResources: false,
      reasons: [],
    };

  return {
    silent: Boolean(normalizedCurrent.silent) && Boolean(normalizedNext.silent),
    syncResources: Boolean(normalizedCurrent.syncResources) || Boolean(normalizedNext.syncResources),
    reasons: Array.from(new Set([
      ...(Array.isArray(normalizedCurrent.reasons) ? normalizedCurrent.reasons : []),
      ...(Array.isArray(normalizedNext.reasons) ? normalizedNext.reasons : []),
    ])).slice(-6),
  };
}

function getSnapshotPollConfig(snapshot) {
  const watcherPendingCount = Number(snapshot?.watcher?.pendingCount || 0);
  const watcherStage = String(snapshot?.watcher?.stage || "");
  const thumbnailActiveCount = Number(snapshot?.derivatives?.activeCount || 0);
  const thumbnailBacklogCount = Number(snapshot?.stats?.thumbnailBacklogCount || 0);

  if (watcherPendingCount > 0) {
    return {
      pollMs: 1500,
      mode: "watcher-pending",
      watcherPendingCount,
      watcherStage,
      thumbnailActiveCount,
      thumbnailBacklogCount,
    };
  }

  if (watcherStage === "starting") {
    return {
      pollMs: 1500,
      mode: "watcher-starting",
      watcherPendingCount,
      watcherStage,
      thumbnailActiveCount,
      thumbnailBacklogCount,
    };
  }

  if (thumbnailActiveCount > 0) {
    return {
      pollMs: 5000,
      mode: "thumbnails-active",
      watcherPendingCount,
      watcherStage,
      thumbnailActiveCount,
      thumbnailBacklogCount,
    };
  }

  return {
    pollMs: 30000,
    mode: "idle",
    watcherPendingCount,
    watcherStage,
    thumbnailActiveCount,
    thumbnailBacklogCount,
  };
}

function MediaThumbnail({
  pathValue,
  mediaKind,
  alt = "",
  className = "",
  controls = false,
  autoplay = false,
  loop = false,
  large = false,
  thumbnail = null,
  highPriority = false,
  preferOriginalWhenThumbnailMissing = true,
  forceOriginal = false,
  hoverPlayable = false,
  mediaStyle = null,
  objectFit = "",
}) {
  const originalUrl = toFileUrl(pathValue);
  const [hoverActive, setHoverActive] = useState(false);
  const hoverTimerRef = useRef(0);
  const thumbnailUrl = !controls && thumbnail?.status === "ready"
    ? toFileUrl(thumbnail?.storagePath)
    : "";
  const canUseOriginalPreview = preferOriginalWhenThumbnailMissing && mediaKind !== "video";
  const shouldUseOriginal = forceOriginal || (hoverActive && hoverPlayable && mediaKind !== "video");
  const imageUrl = controls || shouldUseOriginal
    ? originalUrl
    : (thumbnailUrl || (canUseOriginalPreview ? originalUrl : ""));
  const pendingThumbnail = !controls && !thumbnailUrl && !canUseOriginalPreview && (!thumbnail || thumbnail?.status === "pending");
  const erroredThumbnail = !controls && thumbnail?.status === "error";
  const lastErrorSignatureRef = useRef("");
  const previewSource = controls || shouldUseOriginal
    ? (mediaKind === "video" ? "original-video" : "original-image")
    : (thumbnailUrl ? "thumbnail" : (canUseOriginalPreview ? "original-fallback" : "placeholder"));
  const resolvedMediaStyle = {
    ...(objectFit ? { objectFit } : {}),
    ...(mediaStyle && typeof mediaStyle === "object" ? mediaStyle : {}),
  };

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }
  }, []);

  const startHoverPreview = () => {
    if (!hoverPlayable || mediaKind === "video" || controls || hoverTimerRef.current || hoverActive) {
      return;
    }

    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = 0;
      setHoverActive(true);
    }, 1000);
  };

  const stopHoverPreview = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }

    setHoverActive(false);
  };

  const handlePreviewError = (failedUrl) => {
    const normalizedUrl = String(failedUrl || "").trim();
    const signature = [
      mediaKind,
      previewSource,
      controls ? "interactive" : "card",
      normalizedUrl,
      String(thumbnail?.status || ""),
      String(pathValue || ""),
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
        thumbnailPath: String(thumbnail?.storagePath || "").trim() || null,
      },
    );
  };

  if ((controls || autoplay) && mediaKind === "video" && originalUrl) {
    return (
      <video
        className={[
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className,
        ].filter(Boolean).join(" ")}
        src={originalUrl}
        style={resolvedMediaStyle}
        muted={!controls || autoplay}
        playsInline
        preload={controls ? "metadata" : "auto"}
        autoPlay={autoplay}
        loop={loop || autoplay}
        controls={controls}
        onError={() => handlePreviewError(originalUrl)}
        onPointerEnter={startHoverPreview}
        onPointerLeave={stopHoverPreview}
      />
    );
  }

  if (imageUrl) {
    return (
      <img
        className={[
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className,
        ].filter(Boolean).join(" ")}
        src={imageUrl}
        style={resolvedMediaStyle}
        alt={alt}
        loading={controls ? undefined : "lazy"}
        decoding={controls ? undefined : "async"}
        fetchPriority={highPriority ? "high" : "low"}
        draggable="false"
        onError={() => handlePreviewError(imageUrl)}
        onPointerEnter={startHoverPreview}
        onPointerLeave={stopHoverPreview}
      />
    );
  }

  if (pendingThumbnail) {
    return (
      <div className={["booruView__previewPlaceholder", large ? "is-large" : "", className].filter(Boolean).join(" ")}>
        <span className="booruView__previewPlaceholderShimmer" />
      </div>
    );
  }

  return (
    <div className={["booruView__previewFallback", large ? "is-large" : "", className].filter(Boolean).join(" ")}>
      <span>{erroredThumbnail ? "Preview" : (BOORU_MEDIA_KIND_LABELS[mediaKind] || "Media")}</span>
    </div>
  );
}

function FloatingContextMenu({ state, onClose, onAction }) {
  useEffect(() => {
    if (!state) {
      return undefined;
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

  return (
    <div
      className="booruView__contextMenu"
      style={{
        left: Math.max(8, state.x),
        top: Math.max(8, state.y),
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {state.items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={[
            "booruView__contextMenuItem",
            item.danger ? "is-danger" : "",
          ].filter(Boolean).join(" ")}
          onClick={() => onAction?.(item.id)}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function BooruDragPreviewLayer({ resourcesById, customDragState = null }) {
  if (customDragState?.active) {
    const primaryResource = resourcesById.get(customDragState.primaryId) || customDragState.primaryResource || null;

    return (
      <div className="booruView__dragPreviewLayer">
        <div
          className={[
            "booruView__dragPreview",
            customDragState.resourceIds?.length > 1 ? "is-multi" : "",
          ].filter(Boolean).join(" ")}
          style={getDragPreviewStyles({
            x: customDragState.x,
            y: customDragState.y,
          })}
        >
          <div className="booruView__dragPreviewThumb">
            {primaryResource ? (
              <MediaThumbnail
                pathValue={primaryResource.storagePath}
                mediaKind={primaryResource.mediaKind}
                alt={primaryResource.originalFilename}
                thumbnail={primaryResource.thumbnail}
                preferOriginalWhenThumbnailMissing
              />
            ) : (
              <div className="booruView__previewFallback">Media</div>
            )}
          </div>
          <div className="booruView__dragPreviewCopy">
            <span>{primaryResource?.originalFilename || "Moviendo recurso"}</span>
            <small>
              {customDragState.overTarget?.label
                ? `Soltar en ${customDragState.overTarget.label}`
                : customDragState.resourceIds?.length > 1
                  ? `${customDragState.resourceIds.length} recursos`
                  : "Arrastra hacia una asignacion rapida"}
            </small>
          </div>
        </div>
      </div>
    );
  }

  const dragLayerState = safeUseDragLayer((monitor) => ({
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem(),
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
      primaryResource,
    };
  }, [dragLayerState.item, resourcesById]);

  if (!dragLayerState.isDragging || dragLayerState.itemType !== BOORU_RESOURCE_DND_TYPE || !dragSummary) {
    return null;
  }

  return (
    <div className="booruView__dragPreviewLayer">
      <div
        className={[
          "booruView__dragPreview",
          dragSummary.count > 1 ? "is-multi" : "",
        ].filter(Boolean).join(" ")}
        style={getDragPreviewStyles(dragLayerState.currentOffset)}
      >
        <div className="booruView__dragPreviewThumb">
          {dragSummary.primaryResource ? (
            <MediaThumbnail
              pathValue={dragSummary.primaryResource.storagePath}
              mediaKind={dragSummary.primaryResource.mediaKind}
              alt={dragSummary.primaryResource.originalFilename}
              thumbnail={dragSummary.primaryResource.thumbnail}
              preferOriginalWhenThumbnailMissing
            />
          ) : (
            <div className="booruView__previewFallback">Media</div>
          )}
        </div>
        <div className="booruView__dragPreviewCopy">
          <span>{dragSummary.label}</span>
          {dragSummary.count > 1 ? (
            <small>{dragSummary.count} recursos</small>
          ) : null}
        </div>
      </div>
    </div>
  );
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
  onOpen,
  onContextMenu,
}) {
  const normalizedDragResourceIds = useMemo(
    () => uniqueIds(Array.isArray(dragResourceIds) ? dragResourceIds : [item.id]),
    [dragResourceIds, item.id],
  );
  const [{ isDragging }, dragRef, previewRef] = safeUseDrag(() => ({
    type: BOORU_RESOURCE_DND_TYPE,
    item: () => {
      const payload = {
        id: item.id,
        ids: normalizedDragResourceIds,
        primaryId: item.id,
        resourceId: item.id,
        resourceIds: normalizedDragResourceIds,
      };

      booruViewLogger.debug(
        "booru.dnd.drag.start",
        "Booru inicio el arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          selected,
          multiSelected,
        },
      );

      return payload;
    },
    canDrag: () => Boolean(item?.id),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_draggedItem, monitor) => {
      booruViewLogger.debug(
        "booru.dnd.drag.end",
        "Booru termino un arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          didDrop: monitor.didDrop(),
        },
      );
    },
  }), [item.id, multiSelected, normalizedDragResourceIds, selected]);

  useEffect(() => {
    if (typeof previewRef === "function" && typeof getEmptyImage === "function") {
      previewRef(getEmptyImage(), {
        captureDraggingState: true,
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

  const handleDoubleClick = (event) => {
    if (shouldSuppressClick?.()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event?.ctrlKey || event?.metaKey) {
      return;
    }

    onOpen?.(item, event);
  };

  return (
    <div
      ref={handleDragRef}
      role="button"
      tabIndex={0}
      className={[
        "booruView__mediaCard",
        selected ? "is-selected" : "",
        multiSelected ? "is-multi-selected" : "",
        customDragActive ? "is-custom-dragging" : "",
        isDragging ? "is-dragging" : "",
      ].filter(Boolean).join(" ")}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(event) => onContextMenu?.(item, event)}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => onCustomDragPointerDown?.({
        event,
        item,
        resourceIds: normalizedDragResourceIds,
      })}
      onDragStart={() => {
        booruViewLogger.debug(
          "booru.dnd.drag.dom-start",
          "El navegador disparo dragstart sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds,
          },
        );
      }}
      onDragEnd={() => {
        booruViewLogger.debug(
          "booru.dnd.drag.dom-end",
          "El navegador disparo dragend sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds,
          },
        );
      }}
      aria-label={item.originalFilename}
      aria-selected={selected}
    >
      <div className="booruView__mediaCardPreview">
        <MediaThumbnail
          pathValue={item.storagePath}
          mediaKind={item.mediaKind}
          alt={item.originalFilename}
          thumbnail={item.thumbnail}
          highPriority={absoluteIndex < RESOURCE_GRID_COLUMNS || selected}
          preferOriginalWhenThumbnailMissing
          hoverPlayable={item.mediaKind === "gif"}
        />
      </div>
    </div>
  );
}

function ResourcePagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
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

  return (
    <div className="booruView__pagination">
      <div className="booruView__paginationButtons">
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Ir a la primera pagina"
        >
          {"<<"}
        </Button>
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Ir a la pagina anterior"
        >
          {"<"}
        </Button>

        {pageWindow.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            tone={pageNumber === safeCurrentPage ? "primary" : "secondary"}
            className="booruView__paginationButton"
            onClick={() => onPageChange?.(pageNumber)}
            aria-label={`Ir a la pagina ${pageNumber}`}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Ir a la pagina siguiente"
        >
          {">"}
        </Button>
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Ir a la ultima pagina"
        >
          {">>"}
        </Button>
      </div>

      <div className="booruView__paginationJump">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageInputValue}
          onChange={(event) => setPageInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitPageInput();
            }
          }}
          aria-label="Numero de pagina"
        />
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={commitPageInput}
        >
          Ir
        </Button>
      </div>
    </div>
  );
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
  onOpen,
  onContextMenu,
  onClearSelection,
  emptyTitle,
  emptyDescription,
}) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [scrollKey]);

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      {loading && !items.length ? (
        <StateBlock
          centered
          title="Cargando media"
          description="Leyendo la pagina actual de Booru."
        />
      ) : items.length ? (
        <div
          ref={contentRef}
          className="booruView__resourcePanelBody"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              onClearSelection?.();
            }
          }}
        >
          <div className="booruView__resourcePanelContent">
            <div
              className="booruView__mediaGrid booruView__mediaGrid--paged"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) {
                  onClearSelection?.();
                }
              }}
            >
              {items.map((item, absoluteIndex) => {
                const selected = selectedIds.includes(item.id);

                return (
                  <ResourceGridCard
                    key={item.id}
                    item={item}
                    absoluteIndex={absoluteIndex}
                    selected={selected}
                    multiSelected={selected && selectionMode === "multi"}
                    dragResourceIds={selected ? selectedIds : [item.id]}
                    customDragActive={Boolean(customDragState?.active && customDragState.resourceIds?.includes(item.id))}
                    onCustomDragPointerDown={onCustomDragPointerDown}
                    shouldSuppressClick={shouldSuppressClick}
                    onSelect={onSelect}
                    onOpen={onOpen}
                    onContextMenu={onContextMenu}
                  />
                );
              })}
            </div>

            <ResourcePagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      ) : (
        <StateBlock
          centered
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </SectionPanel>
  );
}

const RESOURCE_SEARCH_REALITY_SUGGESTIONS = [
  { id: "reality:real", type: "reality", value: "real", label: "Real", detail: "Filtro de tipo" },
  { id: "reality:ficticio", type: "reality", value: "ficticio", label: "Ficticio", detail: "Filtro de tipo" },
];
const RESOURCE_SEARCH_MISSING_SUGGESTIONS = [
  { id: "missing:type", type: "missing", value: "type", label: "Sin tipo", detail: "Filtro de faltantes" },
  { id: "missing:author", type: "missing", value: "author", label: "Sin persona", detail: "Filtro de faltantes" },
  { id: "missing:artist", type: "missing", value: "artist", label: "Sin artist", detail: "Filtro de faltantes" },
  { id: "missing:character", type: "missing", value: "character", label: "Sin char", detail: "Filtro de faltantes" },
  { id: "missing:universe", type: "missing", value: "universe", label: "Sin universe", detail: "Filtro de faltantes" },
];

function parseResourceSearchDraft(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return {
      raw: "",
      negative: false,
      mode: "tag",
      value: "",
    };
  }

  const negative = rawValue.startsWith("-") && rawValue.length > 1;
  const normalizedValue = negative ? rawValue.slice(1) : rawValue;
  const separatorIndex = normalizedValue.indexOf(":");

  if (separatorIndex > 0) {
    const rawPrefix = normalizedValue.slice(0, separatorIndex);
    const rawTokenValue = normalizedValue.slice(separatorIndex + 1).trim();
    const entityKind = normalizeBooruEntityPrefix(rawPrefix);

    if (entityKind) {
      return {
        raw: rawValue,
        negative,
        mode: "entity",
        kind: entityKind,
        value: rawTokenValue,
      };
    }

    if (normalizeSearchText(rawPrefix) === "tag") {
      return {
        raw: rawValue,
        negative,
        mode: "tag",
        value: rawTokenValue,
      };
    }

    if (normalizeSearchText(rawPrefix) === "reality") {
      return {
        raw: rawValue,
        negative: false,
        mode: "reality",
        value: rawTokenValue,
      };
    }

    if (normalizeSearchText(rawPrefix) === "missing") {
      return {
        raw: rawValue,
        negative: false,
        mode: "missing",
        value: rawTokenValue,
      };
    }
  }

  return {
    raw: rawValue,
    negative,
    mode: "tag",
    value: negative ? normalizedValue : rawValue,
  };
}

function createResourceSearchTokenFromSuggestion(fragment, suggestion) {
  const parsedDraft = parseResourceSearchDraft(fragment);

  if (!suggestion) {
    return null;
  }

  if (suggestion.type === "entity") {
    return normalizeResourceSearchToken({
      type: "entity",
      negative: parsedDraft.negative,
      kind: suggestion.kind,
      id: suggestion.entityId || suggestion.id || null,
      value: suggestion.label,
      label: suggestion.label,
    });
  }

  if (suggestion.type === "tag") {
    return normalizeResourceSearchToken({
      type: "tag",
      negative: parsedDraft.negative,
      id: suggestion.tagId || suggestion.id || null,
      value: suggestion.label,
      label: suggestion.label,
    });
  }

  if (suggestion.type === "reality" || suggestion.type === "missing") {
    return normalizeResourceSearchToken({
      type: suggestion.type,
      negative: false,
      value: suggestion.value,
      label: suggestion.label,
    });
  }

  return null;
}

function createResourceSearchTokenFromFragment(fragment) {
  const parsedSearch = parseBooruSearchSyntax(fragment);
  return createSearchTokenFromParsedToken(parsedSearch?.tokens?.[0] || null);
}

function ResourceSearchComposer({
  tokens,
  onChange,
  disabled = false,
}) {
  const [draftValue, setDraftValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const tokensSignature = useMemo(
    () => normalizeResourceSearchTokens(tokens).map((token) => buildResourceSearchTokenKey(token)).join("|"),
    [tokens],
  );
  const parsedDraft = useMemo(
    () => parseResourceSearchDraft(draftValue),
    [draftValue],
  );

  useEffect(() => {
    let cancelled = false;
    const queryValue = String(parsedDraft?.value || "").trim();

    if (!String(parsedDraft?.raw || "").trim()) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (parsedDraft.mode === "reality") {
      const nextSuggestions = RESOURCE_SEARCH_REALITY_SUGGESTIONS.filter((item) => (
        !queryValue || normalizeSearchText(item.label).includes(normalizeSearchText(queryValue))
      ));
      setSuggestions(nextSuggestions);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }

    if (parsedDraft.mode === "missing") {
      const nextSuggestions = RESOURCE_SEARCH_MISSING_SUGGESTIONS.filter((item) => {
        if (!queryValue) {
          return true;
        }

        return normalizeSearchText(item.label).includes(normalizeSearchText(queryValue))
          || String(item.value || "").includes(normalizeSearchText(queryValue));
      });
      setSuggestions(nextSuggestions);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }

    if (!queryValue) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    const nextPromise = parsedDraft.mode === "entity" && parsedDraft.kind
      ? invoke("booru:list-entities", {
        kind: parsedDraft.kind,
        query: queryValue,
      })
      : invoke("booru:list-tags", { query: queryValue });

    void nextPromise
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (parsedDraft.mode === "entity") {
          setSuggestions(
            (Array.isArray(data?.items) ? data.items : []).map((item) => ({
              id: `entity:${parsedDraft.kind}:${item.id}`,
              type: "entity",
              kind: parsedDraft.kind,
              entityId: item.id,
              label: item.displayName,
              detail: `${item.resourceCount} recursos`,
            })),
          );
        } else {
          setSuggestions(
            (Array.isArray(data?.items) ? data.items : []).map((item) => ({
              id: `tag:${item.id}`,
              type: "tag",
              tagId: item.id,
              label: item.name,
              detail: `${item.resourceCount} recursos`,
            })),
          );
        }
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar sugerencias.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [parsedDraft]);

  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [suggestions, draftValue]);

  const handleCommitToken = useCallback((nextToken) => {
    const normalizedToken = normalizeResourceSearchToken(nextToken);

    if (!normalizedToken) {
      return false;
    }

    onChange?.(normalizeResourceSearchTokens([
      ...(Array.isArray(tokens) ? tokens : []),
      normalizedToken,
    ]));
    setDraftValue("");
    setSuggestions([]);
    setHighlightedIndex(-1);
    setError("");
    return true;
  }, [onChange, tokens]);

  const handleCommitRawToken = useCallback((rawToken, suggestion = null) => {
    const nextToken = suggestion
      ? createResourceSearchTokenFromSuggestion(rawToken, suggestion)
      : createResourceSearchTokenFromFragment(rawToken);
    return handleCommitToken(nextToken);
  }, [handleCommitToken]);

  const handleChange = (event) => {
    const nextValue = String(event.target.value || "");
    const endsWithWhitespace = /\s$/.test(nextValue);
    const rawTokens = tokenizeBooruQuery(nextValue);
    const completeTokens = endsWithWhitespace ? rawTokens : rawTokens.slice(0, -1);
    const trailingToken = endsWithWhitespace ? "" : (rawTokens.at(-1) || "");

    if (completeTokens.length) {
      let nextTokens = Array.isArray(tokens) ? tokens : [];

      for (const rawToken of completeTokens) {
        const nextToken = createResourceSearchTokenFromFragment(rawToken);

        if (!nextToken) {
          continue;
        }

        nextTokens = normalizeResourceSearchTokens([
          ...nextTokens,
          nextToken,
        ]);
      }

      onChange?.(nextTokens);
      setError("");
    }

    setDraftValue(trailingToken);
  };

  return (
    <div className="booruView__searchComposer">
      <div className="booruView__searchComposerShell">
        <div className="booruView__entitySelection booruView__entitySelection--composer">
          {normalizeResourceSearchTokens(tokens).map((token) => (
            <span
              key={buildResourceSearchTokenKey(token)}
              className={["booruView__selectionChip", getResourceQueryTokenClass(token)].filter(Boolean).join(" ")}
            >
              <span>{buildResourceQueryTokenLabel(token)}</span>
              <button
                type="button"
                className="booruView__selectionChipRemove"
                onClick={() => {
                  onChange?.(
                    normalizeResourceSearchTokens(tokens).filter(
                      (item) => buildResourceSearchTokenKey(item) !== buildResourceSearchTokenKey(token),
                    ),
                  );
                }}
                aria-label={`Quitar token ${buildResourceQueryTokenLabel(token)}`}
                disabled={disabled}
              >
                x
              </button>
            </span>
          ))}

          <input
            type="text"
            value={draftValue}
            onChange={handleChange}
            onKeyDown={(event) => {
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
                setDraftValue("");
                setSuggestions([]);
                setHighlightedIndex(-1);
                return;
              }

              if (event.key === "Backspace" && !String(draftValue || "").trim()) {
                const normalizedTokens = normalizeResourceSearchTokens(tokens);

                if (!normalizedTokens.length) {
                  return;
                }

                event.preventDefault();
                onChange?.(normalizedTokens.slice(0, -1));
                return;
              }

              if (event.key === "Enter" || event.key === "Tab") {
                if (!String(draftValue || "").trim()) {
                  return;
                }

                event.preventDefault();
                const selectedSuggestion = highlightedIndex >= 0 && suggestions[highlightedIndex]
                  ? suggestions[highlightedIndex]
                  : suggestions[0];
                void handleCommitRawToken(draftValue, selectedSuggestion || null);
              }
            }}
            placeholder="Tag, persona:, char:, artist:, universe:, reality:, missing:"
            className="booruView__searchComposerInput"
            disabled={disabled}
            aria-label="Buscar por tags y filtros estructurados"
          />
        </div>
      </div>

      {error ? <p className="booruView__fieldError">{error}</p> : null}

      {String(draftValue || "").trim() ? (
        <div className="booruView__suggestions booruView__suggestions--stacked">
          {loading ? (
            <span className="booruView__suggestionsHint">Buscando sugerencias...</span>
          ) : suggestions.length ? (
            suggestions.map((item, index) => (
              <button
                key={`${item.id}:${tokensSignature}`}
                type="button"
                className={[
                  "booruView__suggestion",
                  highlightedIndex === index ? "is-highlighted" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => {
                  void handleCommitRawToken(draftValue, item);
                }}
              >
                <span>{item.label}</span>
                {item.detail ? <small>{item.detail}</small> : null}
              </button>
            ))
          ) : (
            <span className="booruView__suggestionsHint">
              Tab o Enter agrega el filtro exacto sin crear tags nuevas.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SingleEntityAutocompleteField({
  kind,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  buttonLabel = "Asignar",
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

    void invoke("booru:list-entities", { kind, query: trimmedQuery })
      .then((data) => {
        if (cancelled) {
          return;
        }

        const currentValueId = String(value?.id || "").trim();
        setSuggestions(
          (Array.isArray(data?.items) ? data.items : []).filter((item) => item.id !== currentValueId),
        );
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar sugerencias.",
        );
      })
      .finally(() => {
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
        ensureError instanceof Error
          ? ensureError.message
          : "No se pudo asegurar la entidad.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booruView__entityInlineEditor">
      {value ? (
        <div className="booruView__entitySelection">
          <span className="booruView__selectionChip">
            <span>{value.displayName}</span>
            <button
              type="button"
              className="booruView__selectionChipRemove"
              onClick={() => onChange?.(null)}
              disabled={disabled}
              aria-label={`Quitar ${value.displayName}`}
            >
              x
            </button>
          </span>
        </div>
      ) : null}

      <div className="booruView__entityInputRow">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
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
          }}
          placeholder={placeholder || `Buscar ${label.toLowerCase()} o crear uno nuevo`}
          disabled={disabled}
          aria-label={label}
        />
        <Button
          type="button"
          onClick={() => void handleEnsureEntity()}
          disabled={!String(query || "").trim() || disabled}
        >
          {buttonLabel}
        </Button>
      </div>

      {error ? <p className="booruView__fieldError">{error}</p> : null}

      {String(query || "").trim() ? (
        <div className="booruView__suggestions">
          {loading ? (
            <span className="booruView__suggestionsHint">Buscando sugerencias...</span>
          ) : suggestions.length ? (
              suggestions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "booruView__suggestion",
                    highlightedIndex === index ? "is-highlighted" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSelectEntity(item)}
                >
                <span>{item.displayName}</span>
                <small>{item.resourceCount} recursos</small>
              </button>
            ))
          ) : (
            <span className="booruView__suggestionsHint">
              Sin coincidencias. Enter crea {BOORU_ENTITY_KIND_LABELS[kind]?.toLowerCase() || "la entidad"}.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function EntityAutocompleteField({
  kind,
  label,
  description,
  required = false,
  selectedItems,
  onChange,
  disabled = false,
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

    void invoke("booru:list-entities", { kind, query: trimmedQuery })
      .then((data) => {
        if (cancelled) {
          return;
        }

        const selectedIds = new Set((Array.isArray(selectedItems) ? selectedItems : []).map((item) => item.id));
        setSuggestions(
          (Array.isArray(data?.items) ? data.items : []).filter((item) => !selectedIds.has(item.id)),
        );
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar sugerencias.",
        );
      })
      .finally(() => {
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
    onChange?.(normalizeSelectedEntities([...(selectedItems || []), entity]));
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
        ensureError instanceof Error
          ? ensureError.message
          : "No se pudo asegurar la entidad.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Field
      label={required ? `${label} (requerido)` : label}
      description={description}
      className="booruView__field"
    >
      <div className="booruView__entityEditor">
        {Array.isArray(selectedItems) && selectedItems.length ? (
          <div className="booruView__entitySelection">
            {selectedItems.map((item) => (
              <span key={item.id} className="booruView__selectionChip">
                <span>{item.displayName}</span>
                <button
                  type="button"
                  className="booruView__selectionChipRemove"
                  onClick={() => onChange?.(selectedItems.filter((entry) => entry.id !== item.id))}
                  disabled={disabled}
                  aria-label={`Quitar ${item.displayName}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="booruView__entityInputRow">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
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
            }}
            placeholder={`Buscar ${label.toLowerCase()} o crear uno nuevo`}
            disabled={disabled}
          />
          <Button
            type="button"
            onClick={() => void handleEnsureEntity()}
            disabled={!String(query || "").trim() || disabled}
          >
            Agregar
          </Button>
        </div>

        {error ? <p className="booruView__fieldError">{error}</p> : null}

        {String(query || "").trim() ? (
          <div className="booruView__suggestions">
            {loading ? (
              <span className="booruView__suggestionsHint">Buscando sugerencias...</span>
            ) : suggestions.length ? (
              suggestions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "booruView__suggestion",
                    highlightedIndex === index ? "is-highlighted" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSelectEntity(item)}
                >
                  <span>{item.displayName}</span>
                  <small>{item.resourceCount} recursos</small>
                </button>
              ))
            ) : (
              <span className="booruView__suggestionsHint">
                Sin coincidencias. Enter crea {BOORU_ENTITY_KIND_LABELS[kind]?.toLowerCase() || "la entidad"}.
              </span>
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function TagAutocompleteField({
  label,
  description,
  selectedItems,
  onChange,
  disabled = false,
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

    void invoke("booru:list-tags", { query: trimmedQuery })
      .then((data) => {
        if (cancelled) {
          return;
        }

        const selectedIds = new Set((Array.isArray(selectedItems) ? selectedItems : []).map((item) => item.id));
        setSuggestions(
          (Array.isArray(data?.items) ? data.items : []).filter((item) => !selectedIds.has(item.id)),
        );
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las tags.",
        );
      })
      .finally(() => {
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
    onChange?.(normalizeSelectedTags([...(selectedItems || []), tag]));
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
        ensureError instanceof Error
          ? ensureError.message
          : "No se pudo asegurar la tag.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Field
      label={label}
      description={description}
      className="booruView__field"
    >
      <div className="booruView__entityEditor">
        {Array.isArray(selectedItems) && selectedItems.length ? (
          <div className="booruView__entitySelection">
            {selectedItems.map((item) => (
              <span key={item.id} className="booruView__selectionChip">
                <span>{item.name}</span>
                <button
                  type="button"
                  className="booruView__selectionChipRemove"
                  onClick={() => onChange?.(selectedItems.filter((entry) => entry.id !== item.id))}
                  disabled={disabled}
                  aria-label={`Quitar ${item.name}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="booruView__entityInputRow">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
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
            }}
            placeholder="Buscar tag o crear una nueva"
            disabled={disabled}
          />
          <Button
            type="button"
            onClick={() => void handleEnsureTag()}
            disabled={!String(query || "").trim() || disabled}
          >
            Agregar
          </Button>
        </div>

        {error ? <p className="booruView__fieldError">{error}</p> : null}

        {String(query || "").trim() ? (
          <div className="booruView__suggestions">
            {loading ? (
              <span className="booruView__suggestionsHint">Buscando tags...</span>
            ) : suggestions.length ? (
              suggestions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "booruView__suggestion",
                    highlightedIndex === index ? "is-highlighted" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSelectTag(item)}
                >
                  <span>{item.name}</span>
                  <small>{item.resourceCount} recursos</small>
                </button>
              ))
            ) : (
              <span className="booruView__suggestionsHint">
                Sin coincidencias. Enter crea la tag manual.
              </span>
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function RecommendationEntityDropTarget({
  item,
  kind,
  manualAssignResourceIds = [],
  customDragMatch = false,
  dropDisabled = false,
  manualAssignDisabled = false,
  assigning = false,
  actionLabel = "Aplicar",
  onAssign,
  onApply,
}) {
  const normalizedManualAssignResourceIds = useMemo(
    () => uniqueIds(manualAssignResourceIds),
    [manualAssignResourceIds],
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
          resourceIds: draggedIds,
        },
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
          resourceIds: draggedIds,
        },
      );

      void onAssign?.({
        resourceId: draggedIds[0],
        resourceIds: draggedIds,
        kind,
        entityId: item.id,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [assigning, dropDisabled, item.id, kind, onAssign]);

  useEffect(() => {
    if (!isOver) {
      hoverSignatureRef.current = "";
    }
  }, [isOver]);

  const handleDropRef = useCallback((node) => {
    dropRef(node);
  }, [dropRef]);

  const kindTooltip = getRecommendationKindTooltip(item);

  return (
    <div
      ref={handleDropRef}
      className={[
        "booruView__suggestion",
        "booruView__recommendationCard",
        "booruView__recommendationCard--entity",
        "booruView__suggestion--dropTarget",
        isOver && canDrop ? "is-drop-target" : "",
        customDragMatch ? "is-drop-target" : "",
      ].filter(Boolean).join(" ")}
      data-booru-quick-assign-target="true"
      data-booru-kind={kind}
      data-booru-entity-id={item.entityId || item.id}
      data-booru-label={item.label || item.displayName}
      onDragEnterCapture={() => {
        booruViewLogger.debug(
          "booru.dnd.native.enter",
          "El navegador detecto dragenter sobre un destino rapido.",
          {
            entityId: item.id,
            kind,
          },
        );
      }}
      onDragOverCapture={() => {
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
            kind,
          },
        );
      }}
      onDropCapture={() => {
        booruViewLogger.debug(
          "booru.dnd.native.drop",
          "El navegador detecto drop nativo sobre un destino rapido.",
          {
            entityId: item.id,
            kind,
          },
        );
      }}
    >
      <div className="booruView__recommendationCopy">
        <span>{item.label || item.displayName}</span>
        <small>{item.detail || `${item.resourceCount || 0} recursos`}</small>
      </div>
      <div className="booruView__recommendationActions">
        <RecommendationKindBadge
          item={item}
          className={getRecommendationItemKindClass(item)}
          tooltip={kindTooltip}
        />
        <Button
          type="button"
          onClick={() => void onApply?.(item)}
          disabled={manualAssignDisabled || assigning || !normalizedManualAssignResourceIds.length}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function RecommendationKindBadge({
  item,
  tooltip = "",
  className = "",
}) {
  const [visible, setVisible] = useState(false);
  const hoverTimerRef = useRef(null);
  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);
  const startTooltipTimer = useCallback(() => {
    clearHoverTimer();

    if (!tooltip) {
      return;
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, 1000);
  }, [clearHoverTimer, tooltip]);
  const stopTooltip = useCallback(() => {
    clearHoverTimer();
    setVisible(false);
  }, [clearHoverTimer]);

  useEffect(() => () => {
    clearHoverTimer();
  }, [clearHoverTimer]);

  return (
    <span
      className={[
        "booruView__selectionChip",
        "booruView__selectionChip--kindBadge",
        className,
      ].filter(Boolean).join(" ")}
      aria-label={tooltip || undefined}
      onMouseEnter={startTooltipTimer}
      onMouseLeave={stopTooltip}
    >
      <span>{getRecommendationKindBadgeLabel(item)}</span>
      {visible && tooltip ? (
        <span className="booruView__kindTooltip" role="tooltip">
          {tooltip}
        </span>
      ) : null}
    </span>
  );
}

function RecommendationPanel({
  selectedResourceIds = [],
  customDragState = null,
  manualAssignDisabledReason = "",
  assigning = false,
  revisionKey = 0,
  resourceQuery = null,
  draft = null,
  onAssignEntity,
  onApplyRecommendation,
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const selectedResourceIdsSignature = JSON.stringify(Array.isArray(selectedResourceIds) ? selectedResourceIds.filter(Boolean) : []);
  const normalizedSelectedResourceIds = useMemo(
    () => uniqueIds(selectedResourceIds),
    [selectedResourceIdsSignature],
  );
  const selectionCount = normalizedSelectedResourceIds.length;
  const manualAssignDisabled = Boolean(manualAssignDisabledReason) || assigning || !selectionCount;
  const searchDisabled = assigning;
  const showBlockingLoading = loading && items.length === 0;
  const listRef = useRef(null);
  const requestVersionRef = useRef(0);
  const deferredQuery = useDeferredValue(query);
  const draftSignature = JSON.stringify({
    reality: draft?.reality || null,
    authors: summarizeIdsForLog(draft?.authors),
    artists: summarizeIdsForLog(draft?.artists),
    characters: summarizeIdsForLog(draft?.characters),
    universes: summarizeIdsForLog(draft?.universes),
    manualTags: summarizeIdsForLog(draft?.manualTags),
  });
  const resourceQuerySignature = JSON.stringify(resourceQuery || {});

  const loadRecommendations = useCallback(async ({
    append = false,
    requestedOffset = 0,
  } = {}) => {
    const startedAt = performance.now();
    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;
    setLoading(true);

    booruViewLogger.debug(
      "booru.recommendations.start",
      "Booru inicio la carga del recomendador unificado.",
      {
        append,
        query: String(deferredQuery || "").trim() || null,
        requestedOffset,
        revisionKey,
        selectedResourceIds: normalizedSelectedResourceIds.slice(0, 12),
        selectedCount: selectionCount,
      },
    );

    try {
      const data = await invoke("booru:list-recommendations", {
        query: String(deferredQuery || "").trim() || null,
        resourceQuery,
        selectedResourceIds: normalizedSelectedResourceIds,
        draft,
        offset: requestedOffset,
        limit: RECOMMENDATION_PAGE_SIZE,
      });

      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems((currentValue) => (append ? [...currentValue, ...nextItems] : nextItems));
      setTotalCount(Number(data?.totalCount || 0));
      setHasMore(Boolean(data?.hasMore));
      setError("");
      logRendererDuration(
        "booru.recommendations.done",
        "Booru resolvio la carga del recomendador.",
        performance.now() - startedAt,
        {
          append,
          query: String(deferredQuery || "").trim() || null,
          requestedOffset,
          itemCount: nextItems.length,
          totalCount: Number(data?.totalCount || 0),
          hasMore: Boolean(data?.hasMore),
          sampleIds: summarizeIdsForLog(nextItems),
        },
      );
    } catch (loadError) {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      if (!append) {
        setItems([]);
      }
      setTotalCount(0);
      setHasMore(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las recomendaciones.",
      );
      booruViewLogger.info(
        "booru.recommendations.error",
        "Booru no pudo cargar el recomendador unificado.",
        {
          query: String(deferredQuery || "").trim() || null,
          requestedOffset,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
        },
      );
    } finally {
      if (requestVersionRef.current === requestVersion) {
        setLoading(false);
      }
    }
  }, [deferredQuery, draft, normalizedSelectedResourceIds, resourceQuery, revisionKey, selectionCount]);

  useEffect(() => {
    void loadRecommendations({ append: false, requestedOffset: 0 });
  }, [draftSignature, loadRecommendations, resourceQuerySignature]);

  useEffect(() => {
    setHighlightedIndex(items.length ? 0 : -1);
  }, [items, query]);

  const handleTriggerItem = async (item) => {
    if (!item || manualAssignDisabled) {
      return;
    }

    try {
      await onApplyRecommendation?.(item);
      setQuery("");
      setError("");
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "No se pudo aplicar la recomendacion.",
      );
    }
  };

  const handleListScroll = useCallback((event) => {
    const target = event.currentTarget;

    if (!target || loading || !hasMore) {
      return;
    }

    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remainingScroll <= 72) {
      void loadRecommendations({
        append: true,
        requestedOffset: items.length,
      });
    }
  }, [hasMore, items.length, loadRecommendations, loading]);

  return (
    <div className="booruView__quickAssign">
      <span className="booruView__groupLabel">Recomendaciones</span>

      <div className="booruView__entityInputRow">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
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
              event.preventDefault();

              if (highlightedIndex >= 0 && items[highlightedIndex]) {
                void handleTriggerItem(items[highlightedIndex]);
              }
            }
          }}
          placeholder="Buscar recomendaciones o usar persona:, char:, artist:, universe:, tag:"
          disabled={searchDisabled}
        />
      </div>

      <span className="booruView__suggestionsHint">
        {manualAssignDisabledReason || (
          selectionCount > 1
            ? `Aplicara la recomendacion elegida a ${selectionCount} recursos seleccionados cuando corresponda.`
            : "Click aplica sobre el draft actual. Drag/drop conserva la asignacion rapida directa para entidades."
        )}
      </span>

      {error ? <p className="booruView__fieldError">{error}</p> : null}

      <div
        ref={listRef}
        className="booruView__quickAssignList"
        onScroll={handleListScroll}
      >
        {showBlockingLoading ? (
          <span className="booruView__suggestionsHint">Cargando recomendaciones...</span>
        ) : items.length ? (
          <>
            {items.map((item, index) => (
              <div
                key={item.id}
                className={highlightedIndex === index ? "booruView__quickAssignRow is-highlighted" : "booruView__quickAssignRow"}
              >
                {item.type === "entity" ? (
                  <RecommendationEntityDropTarget
                    item={item}
                    kind={item.kind}
                    actionLabel={item.actionLabel || "Aplicar"}
                    manualAssignResourceIds={normalizedSelectedResourceIds}
                    customDragMatch={Boolean(
                      customDragState?.active
                      && customDragState?.overTarget?.kind === item.kind
                      && customDragState?.overTarget?.entityId === item.entityId,
                    )}
                    dropDisabled={assigning}
                    manualAssignDisabled={manualAssignDisabled}
                    assigning={assigning}
                    onAssign={onAssignEntity}
                    onApply={handleTriggerItem}
                  />
                ) : (
                  <div className={["booruView__suggestion", "booruView__recommendationCard"].join(" ")}>
                    <div className="booruView__recommendationCopy">
                      <span>{item.label}</span>
                      <small>{item.detail || ""}</small>
                    </div>
                    <div className="booruView__recommendationActions">
                      <RecommendationKindBadge
                        item={item}
                        className={getRecommendationItemKindClass(item)}
                        tooltip={getRecommendationKindTooltip(item)}
                      />
                      <Button
                        type="button"
                        onClick={() => void handleTriggerItem(item)}
                        disabled={manualAssignDisabled || assigning}
                      >
                        {item.actionLabel || "Aplicar"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading ? (
              <span className="booruView__suggestionsHint">Actualizando recomendaciones...</span>
            ) : null}
            {!loading && hasMore ? (
              <span className="booruView__suggestionsHint">Scroll para seguir cargando. {items.length} de {totalCount} visibles.</span>
            ) : null}
          </>
        ) : (
          <span className="booruView__suggestionsHint">
            Sin recomendaciones por ahora. Ajusta el contexto o escribe una busqueda.
          </span>
        )}
      </div>
    </div>
  );
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
  onClose,
}) {
  const selectionCount = selectedResources.length;
  const isBatch = selectionCount > 1;
  const resource = activeResource || selectedResources[0] || null;

  if (!resource) {
    return (
      <SectionPanel className="booruView__panel booruView__panel--fill">
        <StateBlock
          centered
          title="Selecciona un recurso"
          description="El detalle aparece aqui para clasificar o revisar el item activo."
        />
      </SectionPanel>
    );
  }

  const isDuplicate = section === "duplicates" || resource.classificationState === "duplicate-review";
  const isTrash = section === "trash" || selectedResources.every((item) => item?.trashedAt);
  const canSaveProgress = canSaveDraftProgress(draft);

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      <div className="booruView__inspectorBody">
        <div className="booruView__inspectorTitleRow">
          <div className="booruView__inspectorTitleCopy">
            <strong>{isBatch ? `${selectionCount} recursos seleccionados` : resource.originalFilename}</strong>
            {isBatch && resource.originalFilename ? (
              <span className="booruView__suggestionsHint">{resource.originalFilename}</span>
            ) : null}
          </div>
          <Button type="button" onClick={() => onClose?.()}>
            Cerrar
          </Button>
        </div>

        <div className="booruView__inspectorPreview">
          <MediaThumbnail
            pathValue={resource.storagePath}
            mediaKind={resource.mediaKind}
            alt={resource.originalFilename}
            large
            controls
          />
        </div>

        <div className="booruView__inspectorSummary">
          <span>{BOORU_MEDIA_KIND_LABELS[resource.mediaKind] || resource.mediaKind}</span>
          <span>{BOORU_CLASSIFICATION_LABELS[resource.classificationState] || resource.classificationState}</span>
          {resource.reality ? <span>{BOORU_REALITY_LABELS[resource.reality] || resource.reality}</span> : null}
          <span>{formatFileSize(resource.fileSize)}</span>
          <span>{formatDate(resource.importedAt)}</span>
          {isBatch ? <span>{selectionCount} seleccionados</span> : null}
        </div>

        {!isBatch ? (
          <>
            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Auto-tags</span>
              <div className="booruView__tagRow">
                {(Array.isArray(resource.systemTags) ? resource.systemTags : []).map((tagValue) => (
                  <span key={tagValue} className="booruView__tagChip">
                    {tagValue}
                  </span>
                ))}
              </div>
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Persona</span>
              {renderEntityChips(resource.authors, "Sin persona asignada")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Artists</span>
              {renderEntityChips(resource.artists, "Sin artist asignado")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Characters</span>
              {renderEntityChips(resource.characters, "Sin character asignado")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Universes</span>
              {renderEntityChips(resource.universes, "Sin universe directo")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Tags manuales</span>
              {renderTagChips(resource.manualTags, "Sin tags manuales")}
            </div>
          </>
        ) : (
          <StateBlock
            title="Edicion en lote"
            description="Los campos muestran lo comun a toda la seleccion. Lo que cambies se aplica como patch sobre todos los recursos seleccionados."
          />
        )}

        <div className="booruView__pathActions">
          <Button type="button" onClick={() => openPath(resource.storagePath)}>
            <FolderIcon size={15} />
            <span>Ver archivo</span>
          </Button>
          {!isBatch && resource.sourcePath ? (
            <Button type="button" onClick={() => openPath(resource.sourcePath)}>
              <FolderIcon size={15} />
              <span>Ver origen</span>
            </Button>
          ) : null}
        </div>

        {isTrash ? (
          <div className="booruView__inspectorActions">
            <Button
              type="button"
              tone="primary"
              onClick={() => void onRestore?.()}
            >
              Restaurar
            </Button>
            <Button
              type="button"
              onClick={() => void onPurge?.()}
            >
              Purgar
            </Button>
          </div>
        ) : isDuplicate ? (
          <StateBlock
            title="Este recurso quedo fuera de Pendientes"
            description={
              resource.canonicalOriginalFilename
                ? `Se detecto como duplicado exacto de ${resource.canonicalOriginalFilename}.`
                : "Los duplicados exactos no entran a la cola de clasificacion."
            }
          />
        ) : (
          <>
            <Field
              label="Paso 1"
              description="Real o ficticio."
              className="booruView__field"
            >
              <SegmentedControl
                options={BOORU_REALITY_OPTIONS}
                value={draft?.reality || ""}
                onChange={(value) => {
                  const nextReality = value === "real" || value === "ficticio" ? value : null;

                  onDraftChange?.((currentDraft) => markDraftDirty({
                    ...currentDraft,
                    reality: nextReality,
                  }, "reality"));
                }}
                ariaLabel="Clasificacion real o ficticio"
              />
            </Field>

            {draft?.reality === "real" ? (
              <>
                <EntityAutocompleteField
                  kind="author"
                  label="Persona"
                  description="Obligatorio para recursos reales."
                  required
                  selectedItems={draft.authors}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      authors: items,
                    }, "authors"));
                  }}
                  disabled={saving}
                />

                <EntityAutocompleteField
                  kind="character"
                  label="Characters"
                  description="Opcional para cosplay u otras representaciones."
                  selectedItems={draft.characters}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      characters: items,
                      characterUniverses: pruneCharacterUniverseAssignments(
                        currentDraft.characterUniverses,
                        items,
                      ),
                    }, "characters"));
                  }}
                  disabled={saving}
                />
              </>
            ) : null}

            {draft?.reality === "ficticio" ? (
              <>
                <EntityAutocompleteField
                  kind="artist"
                  label="Artists"
                  description="Obligatorio para recursos ficticios."
                  required
                  selectedItems={draft.artists}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      artists: items,
                    }, "artists"));
                  }}
                  disabled={saving}
                />

                <EntityAutocompleteField
                  kind="character"
                  label="Characters"
                  description="Opcional si ya resuelves el recurso con universe directo. Si agregas un character, necesita universe."
                  selectedItems={draft.characters}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      characters: items,
                      characterUniverses: pruneCharacterUniverseAssignments(
                        currentDraft.characterUniverses,
                        items,
                      ),
                    }, "characters"));
                  }}
                  disabled={saving}
                />

                <EntityAutocompleteField
                  kind="universe"
                  label="Universes"
                  description="Universe directo del recurso. Puede resolver el bloque esencial sin character."
                  selectedItems={draft.universes}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      universes: items,
                    }, "universes"));
                  }}
                  disabled={saving}
                />

                {Array.isArray(draft.characters) && draft.characters.length ? (
                  <Field
                    label="Universe por character"
                    description="Si un character no tiene universe propio, puedes asignarlo al vuelo."
                    className="booruView__field"
                  >
                    <div className="booruView__characterUniverseList">
                      {draft.characters.map((character) => {
                        const persistedUniverse = getCharacterUniverse(character);
                        const selectedUniverse = getDraftUniverseForCharacter(draft, character.id);
                        const resolvedUniverse = persistedUniverse || selectedUniverse;

                        return (
                          <div key={character.id} className="booruView__characterUniverseRow">
                            <div className="booruView__characterUniverseHeader">
                              <strong>{character.displayName}</strong>
                              {resolvedUniverse ? (
                                <span className="booruView__tagChip">{resolvedUniverse.displayName}</span>
                              ) : (
                                <span className="booruView__metaPlaceholder">Universe requerido</span>
                              )}
                            </div>

                            {persistedUniverse ? (
                              <span className="booruView__suggestionsHint">
                                Universe resuelto desde el character.
                              </span>
                            ) : (
                              <SingleEntityAutocompleteField
                                kind="universe"
                                label={`Universe para ${character.displayName}`}
                                value={selectedUniverse}
                                onChange={(universe) => {
                                  onDraftChange?.((currentDraft) => ({
                                    ...markDraftDirty(currentDraft, "characterUniverses"),
                                    characterUniverses: pruneCharacterUniverseAssignments(
                                      {
                                        ...currentDraft.characterUniverses,
                                        [character.id]: universe,
                                      },
                                      currentDraft.characters,
                                    ),
                                  }));
                                }}
                                disabled={saving}
                                placeholder={`Buscar o crear universe para ${character.displayName}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Field>
                ) : null}
              </>
            ) : (
              <EntityAutocompleteField
                kind="artist"
                label="Artists"
                description="Opcional. Sirve para creadores de la obra visual."
                selectedItems={draft.artists}
                onChange={(items) => {
                  onDraftChange?.((currentDraft) => markDraftDirty({
                    ...currentDraft,
                    artists: items,
                  }, "artists"));
                }}
                disabled={saving}
              />
            )}

            <TagAutocompleteField
              label="Tags manuales"
              description="Tags planas propias de Booru. Enter crea la faltante."
              selectedItems={draft.manualTags}
              onChange={(items) => {
                onDraftChange?.((currentDraft) => markDraftDirty({
                  ...currentDraft,
                  manualTags: items,
                }, "manualTags"));
              }}
              disabled={saving}
            />

            <span className="booruView__suggestionsHint">
              {saving
                ? "Guardando cambios..."
                : canSaveProgress
                  ? "Los cambios se estan preparando para guardado automatico."
                  : "Los cambios se guardan automaticamente al confirmar cada campo."}
            </span>
          </>
        )}
      </div>
    </SectionPanel>
  );
}

function EntityGrid({
  kind,
  items,
  emptyTitle,
  emptyDescription,
  onOpenEntity,
  onPreviewContextMenu,
}) {
  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      {items.length ? (
        <div className="booruView__resourcePanelBody">
          <div className="booruView__entityGrid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="booruView__entityCard"
                onClick={() => onOpenEntity?.(kind, item)}
              >
                <div
                  className="booruView__entityCardPreview"
                  onContextMenu={(event) => onPreviewContextMenu?.(item, event)}
                >
                  <MediaThumbnail
                    pathValue={item.cardPreviewPath || item.sampleStoragePath}
                    mediaKind={item.cardMediaKind || item.sampleMediaKind || "image"}
                    alt={item.displayName}
                  />
                </div>

                <div className="booruView__entityCardBody">
                  <strong>{item.displayName}</strong>
                  {kind === "character" && item?.universe?.displayName ? (
                    <div className="booruView__entityCardMeta">
                      <span>{item.universe.displayName}</span>
                    </div>
                  ) : null}
                  <div className="booruView__entityCardMeta">
                    <span>{item.resourceCount} recursos</span>
                    <span>{BOORU_ENTITY_KIND_LABELS[kind] || kind}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <StateBlock
          centered
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </SectionPanel>
  );
}

function EntityProfileGalleryGrid({
  items,
  loading,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onOpenResource,
  onContextMenu,
}) {
  if (loading && !items.length) {
    return (
      <StateBlock
        centered
        title="Cargando galeria"
        description="Leyendo recursos consumidores desde Booru."
      />
    );
  }

  if (!items.length) {
    return (
      <StateBlock
        centered
        title="Sin recursos todavia"
        description="Cuando esta entidad consuma media real, aparecera aqui. Ctrl/Cmd+V pega una imagen del portapapeles y la asigna a este perfil."
      />
    );
  }

  return (
    <div className="booruView__entityProfileGallery">
      <div className="booruView__mediaGrid booruView__mediaGrid--paged">
        {items.map((item, absoluteIndex) => (
          <div
            key={item.id}
            className={[
              "booruView__mediaCard",
              "booruView__mediaCard--static",
              canUseResourceAsEntityVisual(item) ? "booruView__mediaCard--contextual" : "",
            ].filter(Boolean).join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => onOpenResource?.(item, items)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenResource?.(item, items);
              }
            }}
            onContextMenu={(event) => onContextMenu?.(item, event)}
          >
            <div className="booruView__mediaCardPreview">
              <MediaThumbnail
                pathValue={item.storagePath}
                mediaKind={item.mediaKind}
                alt={item.originalFilename}
                thumbnail={item.thumbnail}
                highPriority={absoluteIndex < RESOURCE_GRID_COLUMNS}
                preferOriginalWhenThumbnailMissing
                hoverPlayable={item.mediaKind === "gif"}
              />
            </div>
          </div>
        ))}
      </div>

      <ResourcePagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function buildAvatarMediaStyle(layout) {
  const scale = Number(layout?.scale || 1);
  const offsetX = Number(layout?.offsetX || 0);
  const offsetY = Number(layout?.offsetY || 0);

  return {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    transformOrigin: "center center",
  };
}

function AvatarLayoutEditor({
  kind,
  profileId,
  avatarSource,
  initialLayout = null,
  busy = false,
  onProfileChange,
}) {
  const [scale, setScale] = useState(Number(initialLayout?.scale || 1));
  const [offsetX, setOffsetX] = useState(Number(initialLayout?.offsetX || 0));
  const [offsetY, setOffsetY] = useState(Number(initialLayout?.offsetY || 0));

  useEffect(() => {
    setScale(Number(initialLayout?.scale || 1));
    setOffsetX(Number(initialLayout?.offsetX || 0));
    setOffsetY(Number(initialLayout?.offsetY || 0));
  }, [
    initialLayout?.offsetX,
    initialLayout?.offsetY,
    initialLayout?.scale,
    profileId,
  ]);

  useEffect(() => {
    if (!kind || !profileId || !avatarSource?.pathValue || busy) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      void invoke("booru:set-entity-visual-layout", {
        kind,
        entityId: profileId,
        visualRole: "avatar",
        layout: {
          scale,
          offsetX,
          offsetY,
        },
      })
        .then((result) => {
          if (result?.profile) {
            onProfileChange?.(result.profile);
          }
        })
        .catch(() => {});
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [avatarSource?.pathValue, busy, kind, offsetX, offsetY, onProfileChange, profileId, scale]);

  if (!avatarSource || avatarSource.mediaKind === "video") {
    return null;
  }

  const mediaStyle = buildAvatarMediaStyle({ scale, offsetX, offsetY });

  return (
    <Field
      label="Avatar"
      description="Ajusta el encuadre persistente de la imagen de perfil."
      className="booruView__field"
    >
      <div className="booruView__avatarLayoutEditor">
        <div className="booruView__avatarLayoutPreview">
          <MediaThumbnail
            pathValue={avatarSource.pathValue}
            mediaKind={avatarSource.mediaKind}
            alt="Preview del avatar"
            forceOriginal
            mediaStyle={mediaStyle}
          />
        </div>

        <div className="booruView__avatarLayoutControls">
          <label className="booruView__avatarLayoutControl">
            <span>Zoom</span>
            <input
              type="range"
              min="0.8"
              max="2.4"
              step="0.01"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value || 1))}
              disabled={busy}
            />
          </label>

          <label className="booruView__avatarLayoutControl">
            <span>X</span>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={offsetX}
              onChange={(event) => setOffsetX(Number(event.target.value || 0))}
              disabled={busy}
            />
          </label>

          <label className="booruView__avatarLayoutControl">
            <span>Y</span>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={offsetY}
              onChange={(event) => setOffsetY(Number(event.target.value || 0))}
              disabled={busy}
            />
          </label>
        </div>
      </div>
    </Field>
  );
}

function EntityProfileDataTab({
  kind,
  profile,
  busy = false,
  universeCharacterCreateValue = "",
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse,
  onProfileChange,
}) {
  const metadata = profile?.metadata || {};
  const avatarSource = profile?.avatar?.sampleStoragePath
    ? {
      pathValue: profile.avatar.sampleStoragePath,
      mediaKind: profile.avatar.sampleMediaKind || "image",
    }
    : profile?.sample?.sampleStoragePath
      ? {
        pathValue: profile.sample.sampleStoragePath,
        mediaKind: profile.sample.sampleMediaKind || "image",
      }
      : null;
  const avatarLayout = profile?.visualSettings?.avatar || null;
  const facts = [
    { label: "Slug", value: profile?.slug || "Sin slug" },
    { label: "Recursos", value: String(profile?.resourceCount || 0) },
    { label: "Creado", value: formatDate(metadata?.createdAt) || "Sin fecha" },
  ];

  if (kind === "character") {
    facts.push({
      label: "Universe",
      value: profile?.universe?.displayName || "Todavia sin universe",
    });
  }

  if (kind === "universe") {
    facts.push(
      { label: "Characters", value: String(metadata?.characterCount || 0) },
      { label: "Consumo directo", value: String(metadata?.directResourceCount || 0) },
      { label: "Via characters", value: String(metadata?.inheritedResourceCount || 0) },
    );
  }

  return (
    <div className="booruView__entityProfileData">
      <div className="booruView__entityProfileFacts">
        {facts.map((fact) => (
          <div key={fact.label} className="booruView__entityProfileFact">
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>

      {kind === "character" ? (
        <Field
          label="Universe"
          description="Busca uno existente o crea uno nuevo para este character."
          className="booruView__field"
        >
          <SingleEntityAutocompleteField
            kind="universe"
            label="Universe"
            value={profile?.universe || null}
            onChange={(nextUniverse) => onChangeCharacterUniverse?.(nextUniverse)}
            disabled={busy}
            placeholder="Buscar universe o crear uno nuevo"
          />
        </Field>
      ) : null}

      {kind === "universe" ? (
        <Field
          label="Crear character"
          description="El character nuevo queda asignado automaticamente a este universe."
          className="booruView__field"
        >
          <div className="booruView__entityInlineEditor">
            <div className="booruView__entityInputRow">
              <input
                type="text"
                value={universeCharacterCreateValue}
                onChange={(event) => onUniverseCharacterCreateValueChange?.(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void onCreateCharacterInUniverse?.();
                  }
                }}
                placeholder="Crear character para este universe"
                disabled={busy}
                aria-label="Crear character para este universe"
              />
              <Button
                type="button"
                onClick={() => void onCreateCharacterInUniverse?.()}
                disabled={!String(universeCharacterCreateValue || "").trim() || busy}
              >
                Crear
              </Button>
            </div>
          </div>
        </Field>
      ) : null}

      <AvatarLayoutEditor
        kind={kind}
        profileId={profile?.id}
        avatarSource={avatarSource}
        initialLayout={avatarLayout}
        busy={busy}
        onProfileChange={onProfileChange}
      />

      {(kind === "author" || kind === "artist") ? (
        <Notice tone="info">
          Redes, enlaces y notas quedan como metadata futura. Por ahora este perfil muestra identidad basica y consumo real.
        </Notice>
      ) : null}
    </div>
  );
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
  onGalleryResourceContextMenu,
  onGalleryResourceOpen,
  onPasteClipboardImage,
  onProfileChange,
}) {
  const entityProfileRootRef = useRef(null);
  const bannerSource = profile?.banner?.sampleStoragePath
    ? {
      pathValue: profile.banner.sampleStoragePath,
      mediaKind: profile.banner.sampleMediaKind || "image",
    }
    : profile?.sample?.sampleStoragePath
      ? {
        pathValue: profile.sample.sampleStoragePath,
        mediaKind: profile.sample.sampleMediaKind || "image",
      }
      : null;
  const avatarSource = profile?.avatar?.sampleStoragePath
    ? {
      pathValue: profile.avatar.sampleStoragePath,
      mediaKind: profile.avatar.sampleMediaKind || "image",
    }
    : profile?.sample?.sampleStoragePath
      ? {
        pathValue: profile.sample.sampleStoragePath,
        mediaKind: profile.sample.sampleMediaKind || "image",
      }
      : null;
  const profileMeta = [
    `${profile?.resourceCount || 0} recursos`,
    BOORU_ENTITY_KIND_LABELS[kind] || kind,
  ];
  const avatarMediaStyle = buildAvatarMediaStyle(profile?.visualSettings?.avatar);

  if (kind === "character" && profile?.universe?.displayName) {
    profileMeta.push(profile.universe.displayName);
  }

  useEffect(() => {
    entityProfileRootRef.current?.focus();
  }, [kind, profile?.id]);

  const handleKeyDownCapture = (event) => {
    if (
      event.defaultPrevented
      || !(event.ctrlKey || event.metaKey)
      || event.altKey
      || String(event.key || "").toLowerCase() !== "v"
      || isTextEntryElement(event.target)
      || typeof onPasteClipboardImage !== "function"
      || entityMutationBusy
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void onPasteClipboardImage();
  };

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill booruView__entityProfile">
      <div
        ref={entityProfileRootRef}
        className="booruView__resourcePanelBody"
        tabIndex={-1}
        onKeyDownCapture={handleKeyDownCapture}
      >
        <div className="booruView__resourcePanelContent booruView__entityProfileContent">
          <div className="booruView__entityProfileToolbar">
            <Button type="button" onClick={() => onBack?.()}>
              Volver
            </Button>
            <Button type="button" tone="primary" onClick={() => onOpenInMedia?.()}>
              Abrir en Media
            </Button>
          </div>

          <div className="booruView__entityProfileHero">
            <div
              className="booruView__entityProfileBanner"
              onContextMenu={(event) => onVisualContextMenu?.(profile?.banner || profile?.sample, event)}
            >
              {bannerSource ? (
                <MediaThumbnail
                  pathValue={bannerSource.pathValue}
                  mediaKind={bannerSource.mediaKind}
                  alt={profile?.displayName || ""}
                  autoplay={bannerSource.mediaKind === "video"}
                  loop={bannerSource.mediaKind === "video"}
                  objectFit="cover"
                />
              ) : (
                <div className="booruView__entityProfileBannerFallback">
                  <span>{BOORU_ENTITY_KIND_LABELS[kind] || kind}</span>
                </div>
              )}
            </div>

            <div className="booruView__entityProfileIdentity">
              <div
                className="booruView__entityProfileAvatar"
                onContextMenu={(event) => onVisualContextMenu?.(profile?.avatar || profile?.sample, event)}
              >
                {avatarSource ? (
                  <MediaThumbnail
                    pathValue={avatarSource.pathValue}
                    mediaKind={avatarSource.mediaKind}
                    alt={profile?.displayName || ""}
                    autoplay={avatarSource.mediaKind === "video"}
                    loop={avatarSource.mediaKind === "video"}
                    objectFit="cover"
                    mediaStyle={avatarSource.mediaKind === "video" ? null : avatarMediaStyle}
                  />
                ) : (
                  <div className="booruView__entityProfileAvatarFallback">
                    <span>{getInitials(profile?.displayName)}</span>
                  </div>
                )}
              </div>

              <div className="booruView__entityProfileCopy">
                <span className="booruView__groupLabel">{BOORU_ENTITY_KIND_LABELS[kind] || kind}</span>
                <h2>{profile?.displayName || "Entidad"}</h2>
                <div className="booruView__entityProfileMeta">
                  {profileMeta.map((entry) => (
                    <span key={entry} className="booruView__titlePill">{entry}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="booruView__entityProfileTabs">
              <SegmentedControl
                options={ENTITY_PROFILE_TAB_OPTIONS}
                value={activeTab}
                onChange={(value) => onTabChange?.(value)}
                ariaLabel="Seccion del perfil"
              />
            </div>
          </div>

          {activeTab === "data" ? (
            <EntityProfileDataTab
              kind={kind}
              profile={profile}
              busy={entityMutationBusy}
              universeCharacterCreateValue={universeCharacterCreateValue}
              onUniverseCharacterCreateValueChange={onUniverseCharacterCreateValueChange}
              onCreateCharacterInUniverse={onCreateCharacterInUniverse}
              onChangeCharacterUniverse={onChangeCharacterUniverse}
              onProfileChange={onProfileChange}
            />
          ) : (
            <EntityProfileGalleryGrid
              items={Array.isArray(galleryState?.items) ? galleryState.items : []}
              loading={galleryLoading}
              currentPage={currentPage}
              totalCount={galleryState?.totalCount || 0}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onOpenResource={onGalleryResourceOpen}
              onContextMenu={onGalleryResourceContextMenu}
            />
          )}
        </div>
      </div>
    </SectionPanel>
  );
}

function ResourceHeroOverlay({
  item,
  index = 0,
  totalCount = 0,
  onClose,
  onPrev,
  onNext,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key === "ArrowLeft") {
        onPrev?.();
        return;
      }

      if (event.key === "ArrowRight") {
        onNext?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  if (!item) {
    return null;
  }

  return (
    <div className="booruView__heroOverlay" onClick={() => onClose?.()}>
      <div
        className="booruView__heroShell"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="booruView__heroNav booruView__heroNav--prev"
          onClick={() => onPrev?.()}
          aria-label="Recurso anterior"
        >
          {"<"}
        </button>

        <div className="booruView__heroStage">
          <MediaThumbnail
            pathValue={item.storagePath}
            mediaKind={item.mediaKind}
            alt={item.originalFilename}
            controls={item.mediaKind === "video"}
            autoplay={item.mediaKind === "video"}
            loop={item.mediaKind === "video"}
            forceOriginal
            preferOriginalWhenThumbnailMissing
            objectFit="contain"
            className="booruView__heroMedia"
          />

          <div className="booruView__heroMeta">
            <strong>{item.originalFilename}</strong>
            <span>
              {BOORU_MEDIA_KIND_LABELS[item.mediaKind] || item.mediaKind}
              {" · "}
              {index + 1} / {Math.max(1, totalCount)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="booruView__heroNav booruView__heroNav--next"
          onClick={() => onNext?.()}
          aria-label="Siguiente recurso"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

function SettingsSection({
  snapshot,
  busyAction,
  loading,
  onRefresh,
  onRescan,
  onRestart,
  onOpenDuplicates,
  onOpenTrash,
}) {
  return (
    <div className="booruView__content booruView__content--metrics">
      <div className="booruView__metrics">
        <MetricCard eyebrow="Total" value={String(snapshot?.stats?.totalCount || 0)} description="Catalogo" />
        <MetricCard eyebrow="Pendientes" value={String(snapshot?.stats?.pendingCount || 0)} description="Cola real" />
        <MetricCard eyebrow="Duplicados" value={String(snapshot?.stats?.duplicateCount || 0)} description="Revision exacta" />
        <MetricCard eyebrow="Papelera" value={String(snapshot?.stats?.trashCount || 0)} description="Interna" />
        <MetricCard eyebrow="Basico" value={String(snapshot?.stats?.classifiedBasicCount || 0)} description="Completos" />
        <MetricCard eyebrow="Image" value={String(snapshot?.stats?.imageCount || 0)} description="Preview" />
        <MetricCard eyebrow="Video/GIF" value={String((snapshot?.stats?.videoCount || 0) + (snapshot?.stats?.gifCount || 0))} description="Animados" />
        <MetricCard eyebrow="Thumbs ready" value={String(snapshot?.stats?.thumbnailReadyCount || 0)} description="Derivados listos" />
        <MetricCard eyebrow="Thumbs backlog" value={String(snapshot?.stats?.thumbnailBacklogCount || 0)} description="Pendientes o error" />
      </div>

      <div className="booruView__metricsPanels">
        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Ajustes</span>
            <div className="booruView__settingsActions">
              <Button type="button" onClick={() => onOpenDuplicates?.()}>
                <span>Duplicados</span>
                <small>{snapshot?.stats?.duplicateCount || 0}</small>
              </Button>
              <Button type="button" onClick={() => onOpenTrash?.()}>
                <span>Papelera</span>
                <small>{snapshot?.stats?.trashCount || 0}</small>
              </Button>
            </div>
            <span className="booruView__suggestionsHint">
              La busqueda principal ahora compone chips de tags y filtros estructurados; no busca por filename.
            </span>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Watcher y runtime</span>
            <StateBlock
              title={snapshot?.watcher?.active ? "Watcher activo" : "Watcher inactivo"}
              description={snapshot?.watcher?.watchedPath || "Todavia no hay carpeta vigilada configurada."}
            />
            {snapshot?.derivatives?.lastError ? (
              <Notice tone="danger">{snapshot.derivatives.lastError}</Notice>
            ) : null}
            <div className="booruView__pathActions">
              <Button
                type="button"
                onClick={() => void onRescan?.()}
                disabled={busyAction === "rescan"}
              >
                Releer carpeta
              </Button>
              <Button
                type="button"
                onClick={() => void onRestart?.()}
                disabled={busyAction === "restart"}
              >
                Reiniciar watcher
              </Button>
              <Button
                type="button"
                onClick={() => void onRefresh?.()}
                disabled={loading}
              >
                <RefreshIcon size={15} />
                <span>Actualizar</span>
              </Button>
              <Button
                type="button"
                onClick={() => openPath(snapshot?.storage?.root)}
                disabled={!snapshot?.storage?.root}
              >
                <FolderIcon size={15} />
                <span>Ver storage</span>
              </Button>
              <Button
                type="button"
                onClick={() => openPath(snapshot?.settings?.watchFolderPath)}
                disabled={!snapshot?.settings?.watchFolderPath}
              >
                <FolderIcon size={15} />
                <span>Ver carpeta vigilada</span>
              </Button>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Python y storage</span>
            <StateBlock
              title={snapshot?.python?.available ? "Python disponible" : "Python no disponible"}
              description={
                snapshot?.python?.available
                  ? snapshot.python.resolvedExecutable || snapshot.python.command
                  : snapshot?.python?.error || "Booru necesita Python para su pipeline interno."
              }
            />
            <div className="booruView__runtimeMeta">
              <span>DB: {snapshot?.storage?.catalogPath || "Sin catalogo"}</span>
              <span>Media: {snapshot?.storage?.mediaRoot || "Sin carpeta media"}</span>
              <span>Duplicados: {snapshot?.storage?.duplicatesRoot || "Sin carpeta duplicates"}</span>
              <span>Thumbs: {snapshot?.storage?.thumbsRoot || "Sin carpeta thumbs"}</span>
              <span>Worker activos: {snapshot?.derivatives?.activeCount || 0}</span>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack booruView__syntaxGuide">
            <span className="booruView__groupLabel">Sintaxis de busqueda</span>
            <p className="booruView__syntaxGuideCopy">
              Los terminos sueltos son tags. Tambien acepta prefijos tipados, negativos y un faltante publico a la vez.
            </p>
            <div className="booruView__syntaxExamples">
              {[
                "jinx",
                "-artist:foo",
                "persona:ana",
                "reality:ficticio missing:artist",
                "universe:\"Blue Archive\"",
                "char:\"Hatsune Miku\"",
              ].map((example) => (
                <span key={example} className="booruView__selectionChip booruView__selectionChip--syntax">
                  {example}
                </span>
              ))}
            </div>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}

export default function BooruWorkspaceView({ input = null, ctx }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [savingClassification, setSavingClassification] = useState(false);
  const [error, setError] = useState("");
  const [resourceSearchTokens, setResourceSearchTokens] = useState(() => buildResourceSearchInputTokens(input));
  const [entitySearchValue, setEntitySearchValue] = useState("");
  const [entityCreateValue, setEntityCreateValue] = useState("");
  const [entityCreateUniverse, setEntityCreateUniverse] = useState(null);
  const [resourceMediaKindFilter, setResourceMediaKindFilter] = useState("all");
  const [resourceRealityFilter, setResourceRealityFilter] = useState("all");
  const [resourcePendingMode, setResourcePendingMode] = useState("essential");
  const [resourceMissingFilter, setResourceMissingFilter] = useState(NO_MISSING_FILTER);
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
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [resourceHeroState, setResourceHeroState] = useState(null);
  const activeSection = getActiveSection(input);
  const settingsSubview = getSettingsSubview(input);
  const activeResourceSection = getActiveResourceSection(activeSection, settingsSubview);
  const normalizedResourceSearchTokens = useMemo(
    () => normalizeResourceSearchTokens(resourceSearchTokens),
    [resourceSearchTokens],
  );
  const resourceSearchTokensSignature = useMemo(
    () => normalizedResourceSearchTokens.map((token) => buildResourceSearchTokenKey(token)).join("|"),
    [normalizedResourceSearchTokens],
  );
  const deferredEntitySearchValue = useDeferredValue(entitySearchValue);
  const activeEntityKind = ENTITY_SECTION_KIND_MAP[activeSection] || null;
  const activeEntityProfile = normalizeEntityProfileInput(input?.entityProfile, activeEntityKind);
  const showResourceWorkspace = Boolean(activeResourceSection);
  const showClassificationSidebar = CLASSIFICATION_SIDEBAR_SECTIONS.has(activeResourceSection);
  const showEntityProfile = Boolean(activeEntityKind && activeEntityProfile?.id);
  const resourceItems = Array.isArray(resourceState?.items) ? resourceState.items : [];
  const entityProfileGalleryItems = Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [];
  const resourceQuery = useMemo(() => buildResourceQuery({
    searchTokens: normalizedResourceSearchTokens,
    mediaKindFilter: showClassificationSidebar ? resourceMediaKindFilter : "all",
    realityFilter: showClassificationSidebar ? resourceRealityFilter : "all",
    pendingMode: activeResourceSection === "pending" ? resourcePendingMode : "essential",
    missingFilter: showClassificationSidebar ? resourceMissingFilter : NO_MISSING_FILTER,
  }), [
    activeResourceSection,
    resourceMediaKindFilter,
    resourceMissingFilter,
    resourcePendingMode,
    resourceRealityFilter,
    normalizedResourceSearchTokens,
    showClassificationSidebar,
  ]);
  const activeRealityFilter = resourceQuery?.reality || null;
  const contextualMissingFilterOptions = useMemo(
    () => getContextualMissingFilterOptions(activeRealityFilter, resourceQuery?.includeEntities),
    [activeRealityFilter, resourceQuery?.includeEntities],
  );
  const resourceQuerySignature = JSON.stringify(resourceQuery || {});
  const entityProfileKey = getEntityProfileKey(activeEntityProfile);
  const entityThumbnailPrimingEnabled = showEntityProfile && activeEntityProfile?.tab !== "data";
  const thumbnailPrimingItems = showResourceWorkspace ? resourceItems : (entityThumbnailPrimingEnabled ? entityProfileGalleryItems : []);
  const currentEntityProfilePage = activeEntityKind
    ? clampPageNumber(entityProfilePageState?.[activeSection]?.page, Number.MAX_SAFE_INTEGER)
    : 1;
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
    busyAction: "",
  });
  const renderBurstRef = useRef({
    windowStartedAt: performance.now(),
    renderCount: 0,
    lastLoggedAt: 0,
  });
  const snapshotRequestStateRef = useRef({
    inFlight: false,
    queuedRequest: null,
  });
  const autosaveTimerRef = useRef(0);
  const autosaveStateRef = useRef({
    inFlight: false,
    queued: false,
  });
  const customDragSessionRef = useRef(null);
  const customDragTimerRef = useRef(0);
  const suppressNextResourceClickRef = useRef(false);
  const handleQuickAssignEntityRef = useRef(null);
  const lastSectionNonceRef = useRef("");
  const previousVisibleResourceIdsRef = useRef([]);
  const currentResourcePage = showResourceWorkspace
    ? normalizeResourcePageState(resourcePageState[activeResourceSection], resourceQuerySignature).page
    : 1;

  useEffect(() => {
    booruViewLogger.info(
      "booru.dnd.runtime",
      "Booru verifico el runtime compartido de drag and drop.",
      {
        hasUseDrag: typeof useDrag === "function",
        hasUseDrop: typeof useDrop === "function",
        hasUseDragLayer: typeof useDragLayer === "function",
        hasEmptyImage: typeof getEmptyImage === "function",
      },
    );
  }, []);

  useEffect(() => {
    classificationDraftRef.current = classificationDraft;
  }, [classificationDraft]);

  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);

  useEffect(() => {
    const nextTokens = buildResourceSearchInputTokens(input);
    const nextSignature = nextTokens.map((token) => buildResourceSearchTokenKey(token)).join("|");

    setResourceSearchTokens((currentValue) => {
      const currentSignature = normalizeResourceSearchTokens(currentValue)
        .map((token) => buildResourceSearchTokenKey(token))
        .join("|");

      return currentSignature === nextSignature ? currentValue : nextTokens;
    });
  }, [input]);

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
      setInspectorOpen(false);
    }
  }, [showResourceWorkspace]);

  useEffect(() => {
    if (!showResourceWorkspace) {
      return;
    }

    setResourcePageState((currentValue) => {
      const nextSectionState = normalizeResourcePageState(currentValue[activeResourceSection], resourceQuerySignature);

      if (nextSectionState.querySignature === resourceQuerySignature) {
        return currentValue;
      }

      return {
        ...currentValue,
        [activeResourceSection]: {
          page: 1,
          querySignature: resourceQuerySignature,
        },
      };
    });
  }, [activeResourceSection, resourceQuerySignature, showResourceWorkspace]);

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
          profileKey: nextProfileKey,
        },
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
        [activeResourceSection]: {
          page: totalPages,
          querySignature: resourceQuerySignature,
        },
      }));
    }
  }, [activeResourceSection, currentResourcePage, resourceQuerySignature, resourceState.totalCount, showResourceWorkspace]);

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
          profileKey: entityProfileKey,
        },
      }));
    }
  }, [
    activeEntityKind,
    activeSection,
    currentEntityProfilePage,
    entityProfileGalleryState.totalCount,
    entityProfileKey,
    showEntityProfile,
  ]);

  const loadSnapshot = async ({ silent = false, reason = "manual" } = {}) => {
    const nextRequest = {
      silent: Boolean(silent),
      reasons: [String(reason || "manual")],
    };

    if (snapshotRequestStateRef.current.inFlight) {
      booruViewLogger.debug(
        "booru.snapshot.queue",
        "Booru encolo una recarga de snapshot mientras otra seguia en vuelo.",
        {
          requestedReason: String(reason || "manual"),
          silent: Boolean(silent),
          queuedRequest: snapshotRequestStateRef.current.queuedRequest,
        },
      );
      snapshotRequestStateRef.current.queuedRequest = mergeSnapshotQueueRequest(
        snapshotRequestStateRef.current.queuedRequest,
        nextRequest,
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
        ...diagnosticsContextRef.current,
      },
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
            thumbnailErrorCount: Number(nextSnapshot?.stats?.thumbnailErrorCount || 0),
          },
        },
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el estado actual de Booru.",
      );
      booruViewLogger.info(
        "booru.snapshot.error",
        "Booru no pudo resolver una carga de snapshot.",
        {
          reason: String(reason || "manual"),
          silent: Boolean(silent),
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
          ...diagnosticsContextRef.current,
        },
      );
    } finally {
      snapshotRequestStateRef.current.inFlight = false;
      setLoading(false);

      if (snapshotRequestStateRef.current.queuedRequest) {
        const queuedRequest = snapshotRequestStateRef.current.queuedRequest;
        snapshotRequestStateRef.current.queuedRequest = null;
        void loadSnapshot({
          silent: queuedRequest.silent,
          reason: queuedRequest.reasons.join("|") || "queued",
        });
      }
    }
  };

  const loadResources = async ({ requestedPage = currentResourcePage } = {}) => {
    if (!showResourceWorkspace || !activeResourceSection) {
      return;
    }

    const normalizedRequestedPage = clampPageNumber(requestedPage, Number.MAX_SAFE_INTEGER);
    const nextQuery = {
      section: activeResourceSection,
      query: resourceQuery,
      offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
      limit: RESOURCE_PAGE_SIZE,
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
          section: activeResourceSection,
          requestedPage: normalizedRequestedPage,
          query: resourceQuery,
        },
      );

    try {
      const nextResources = await invoke("booru:list-resources", nextQuery);

      if (resourceRequestVersionRef.current !== requestVersion) {
        return;
      }

      setResourceState((currentValue) => ({
        items: Array.isArray(nextResources?.items) ? nextResources.items : [],
        totalCount: Number(nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore),
      }));
      setError("");
      logRendererDuration(
        "booru.resources.done",
        "Booru resolvio una carga de recursos.",
        performance.now() - startedAt,
        {
          requestVersion,
          section: activeResourceSection,
          requestedPage: normalizedRequestedPage,
          query: resourceQuery,
          totalCount: Number(nextResources?.totalCount || 0),
          hasMore: Boolean(nextResources?.hasMore),
          ...summarizeResourcesForLog(nextResources?.items),
        },
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo listar la biblioteca de Booru.",
      );
      booruViewLogger.info(
        "booru.resources.error",
        "Booru no pudo listar recursos.",
        {
          requestVersion,
          section: activeResourceSection,
          requestedPage: normalizedRequestedPage,
          query: resourceQuery,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
        },
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
        tab: activeEntityProfile?.tab || null,
      },
    );

    try {
      const nextProfile = await invoke("booru:get-entity-profile", {
        kind: activeEntityKind,
        id: activeEntityProfile.id,
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
          slug: String(nextProfile?.slug || "").trim() || null,
        },
      );
    } catch (loadError) {
      if (entityProfileRequestVersionRef.current !== requestVersion) {
        return;
      }

      setEntityProfile(null);
      setEntityProfileError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el perfil de la entidad.",
      );
      booruViewLogger.info(
        "booru.entity-profile.error",
        "Booru no pudo cargar un perfil de entidad.",
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
        },
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
        requestedPage: normalizedRequestedPage,
      },
    );

    try {
      const nextResources = await invoke("booru:list-resources", {
        section: "media",
        query: {
          includeEntities: [{
            kind: activeEntityKind,
            id: activeEntityProfile.id,
            label: getEntityProfileLabel(activeEntityProfile, entityProfile) || null,
          }],
        },
        offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
        limit: RESOURCE_PAGE_SIZE,
      });

      if (entityProfileGalleryRequestVersionRef.current !== requestVersion) {
        return;
      }

      setEntityProfileGalleryState({
        items: Array.isArray(nextResources?.items) ? nextResources.items : [],
        totalCount: Number(nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore),
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
          ...summarizeResourcesForLog(nextResources?.items),
        },
      );
    } catch (loadError) {
      if (entityProfileGalleryRequestVersionRef.current !== requestVersion) {
        return;
      }

      setEntityProfileGalleryState({ items: [], totalCount: 0, hasMore: false });
      setEntityProfileError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la galeria de la entidad.",
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
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
        },
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
    activeResourceSection,
    currentResourcePage,
    resourceQuerySignature,
    showResourceWorkspace,
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
    showEntityProfile,
  ]);

  useEffect(() => {
    if (snapshot?.derivatives && typeof snapshot?.stats?.thumbnailBacklogCount === "number") {
      visibleThumbnailPrimingUnavailableRef.current = false;
    }
  }, [snapshot?.derivatives, snapshot?.stats?.thumbnailBacklogCount]);

  useEffect(() => {
    const stateApi = typeof ctx?.getState === "function" ? ctx.getState() : null;

    if (!stateApi?.subscribeKey) {
      return undefined;
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
        entityProfileKey,
      },
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
            entityProfileKey,
          },
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
            entityProfileKey,
          },
        );
        setEntityRevision((currentValue) => currentValue + 1);
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.watcherVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de watcher.",
          {
            key: "watcherVersion",
            ...diagnosticsContextRef.current,
          },
        );
        void loadSnapshot({ silent: true, reason: "state:watcher" });
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.metricsVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de metricas.",
          {
            key: "metricsVersion",
            ...diagnosticsContextRef.current,
          },
        );
        void loadSnapshot({ silent: true, reason: "state:metrics" });
      }),
    ];

    return () => {
      booruViewLogger.debug(
        "booru.runtime-state.unsubscribe",
        "Booru limpio suscripciones de invalidacion de runtime.",
        {
          section: activeSection,
          resourceQuerySignature,
          entityProfileKey,
        },
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
    resourceQuerySignature,
    showEntityProfile,
    showResourceWorkspace,
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
        entityRevision,
      },
    );

    void invoke("booru:list-entities", {
      kind: activeEntityKind,
      query: String(deferredEntitySearchValue || "").trim() || null,
    })
      .then((data) => {
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
            sampleIds: summarizeIdsForLog(data?.items),
          },
        );
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setEntityItems([]);
        setEntityError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la seccion.",
        );
        booruViewLogger.info(
          "booru.entities.section.error",
          "Booru no pudo cargar las entidades de la seccion activa.",
          {
            kind: activeEntityKind,
            query: String(deferredEntitySearchValue || "").trim() || null,
            entityRevision,
            durationMs: Number((performance.now() - startedAt).toFixed(2)),
            error: loadError instanceof Error ? loadError.message : String(loadError || ""),
          },
        );
      })
      .finally(() => {
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
    resourceLoading,
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
    snapshot?.watcher?.stage,
  ]);
  const watcherStage = String(snapshot?.watcher?.stage || "");

  useEffect(() => {
    if (!ctx?.setWorkspaceFrameActions || !ctx?.clearWorkspaceFrameActions) {
      return undefined;
    }

    const statusIcon = watcherStage === "error" || watcherStage.startsWith("blocked")
      ? AlertIcon
      : PulseIcon;
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
              ...(latestInputRef.current && typeof latestInputRef.current === "object" ? latestInputRef.current : {}),
              section: "settings",
              settingsSubview: "overview",
            },
          });
        },
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
      },
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
    watcherStage,
  ]);

  const currentSelection = useMemo(() => {
    if (!showResourceWorkspace) {
      return EMPTY_SELECTION_STATE;
    }

    return selectedResourceState[activeResourceSection]
      || RESOURCE_SELECTION_SECTIONS[activeResourceSection]
      || EMPTY_SELECTION_STATE;
  }, [activeResourceSection, selectedResourceState, showResourceWorkspace]);

  useEffect(() => {
    if (!showResourceWorkspace) {
      return;
    }

    setSelectedResourceState((currentValue) => {
      const nextSectionState = currentValue[activeResourceSection] || RESOURCE_SELECTION_SECTIONS[activeResourceSection];
      const visibleIds = new Set(resourceItems.map((item) => item.id));
      const normalizedSelection = normalizeSectionSelection(nextSectionState, visibleIds);

      if (
        arraysEqual(nextSectionState.ids, normalizedSelection.ids)
        && nextSectionState.activeId === normalizedSelection.activeId
        && nextSectionState.mode === normalizedSelection.mode
      ) {
        return currentValue;
      }

      return {
        ...currentValue,
        [activeResourceSection]: normalizedSelection,
      };
    });
  }, [activeResourceSection, resourceItems, showResourceWorkspace]);

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

  useEffect(() => {
    if (!currentSelection.ids.length) {
      setInspectorOpen(false);
    }
  }, [currentSelection.ids.length]);

  const dragPreviewResourcesById = useMemo(
    () => new Map(resourceItems.map((item) => [item.id, item])),
    [resourceItems],
  );
  const activeHeroItem = useMemo(() => {
    const heroItems = Array.isArray(resourceHeroState?.items) ? resourceHeroState.items : [];
    const activeHeroId = String(resourceHeroState?.activeId || "").trim();
    return heroItems.find((item) => item?.id === activeHeroId) || heroItems[0] || null;
  }, [resourceHeroState]);
  const selectedResourceIdsSignature = selectedResources.map((resource) => resource.id).join("|");
  const showInspector = showResourceWorkspace && inspectorOpen && selectedResources.length > 0;

  useEffect(() => {
    if (!showClassificationSidebar) {
      return;
    }

    const allowedFilterValues = new Set(
      contextualMissingFilterOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value),
    );
    setResourceMissingFilter((currentValue) => (
      allowedFilterValues.has(currentValue) ? currentValue : NO_MISSING_FILTER
    ));
  }, [contextualMissingFilterOptions, showClassificationSidebar]);

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
    if (!showResourceWorkspace || activeResourceSection === "trash") {
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
      handlePointerCancel: null,
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

          if (
            currentValue.x === session.latestX
            && currentValue.y === session.latestY
            && ((currentValue.overTarget && nextTarget)
              ? (
                currentValue.overTarget.kind === nextTarget.kind
                && currentValue.overTarget.entityId === nextTarget.entityId
              )
              : currentValue.overTarget === nextTarget)
          ) {
            return currentValue;
          }

          return {
            ...currentValue,
            x: session.latestX,
            y: session.latestY,
            overTarget: nextTarget,
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
          overTarget: nextTarget,
        },
      );
      setCustomDragState((currentValue) => (
        currentValue?.active
          ? {
            ...currentValue,
            x: session.latestX,
            y: session.latestY,
            overTarget: nextTarget,
          }
          : currentValue
      ));
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
          primaryId: session.primaryId,
        },
      );
      setCustomDragState({
        active: true,
        primaryId: session.primaryId,
        primaryResource: session.primaryResource,
        resourceIds: session.resourceIds,
        x: session.latestX,
        y: session.latestY,
        overTarget: null,
      });
      syncCustomDragTarget();
    };

    session.handlePointerMove = (moveEvent) => {
      if (moveEvent.pointerId !== session.pointerId) {
        return;
      }

      session.latestX = Number(moveEvent.clientX || 0);
      session.latestY = Number(moveEvent.clientY || 0);

      if (!session.active && (performance.now() - session.startedAt) >= 150) {
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
      const dropTarget = dragWasActive
        ? getQuickAssignTargetDescriptor(document.elementFromPoint(session.latestX, session.latestY))
        : null;

      clearCustomDragSession();
      setCustomDragState(null);

      if (!dragWasActive) {
        booruViewLogger.debug(
          "booru.dnd.custom.tap",
          "Booru trato la interaccion como click normal porque el hold no se completo.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId,
          },
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
            target: dropTarget,
          },
        );
        void handleQuickAssignEntityRef.current?.({
          resourceId: session.resourceIds[0] || null,
          resourceIds: session.resourceIds,
          kind: dropTarget.kind,
          entityId: dropTarget.entityId,
        });
      } else {
        booruViewLogger.debug(
          "booru.dnd.custom.cancel",
          "Booru cancelo el drag interno sin destino valido.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId,
            x: session.latestX,
            y: session.latestY,
          },
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
          primaryId: session.primaryId,
        },
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
    activeResourceSection,
    clearCustomDragSession,
    showResourceWorkspace,
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
      busyAction,
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
    showResourceWorkspace,
  ]);

  useEffect(() => () => {
    clearCustomDragSession();
  }, [clearCustomDragSession]);

  useEffect(() => {
    clearCustomDragSession();
    setCustomDragState(null);
  }, [activeSection, activeResourceSection, clearCustomDragSession]);

  useEffect(() => {
    const now = performance.now();
    const renderBurstState = renderBurstRef.current;

    if (now - renderBurstState.windowStartedAt >= 1000) {
      renderBurstState.windowStartedAt = now;
      renderBurstState.renderCount = 0;
    }

    renderBurstState.renderCount += 1;

    if (renderBurstState.renderCount >= 24 && now - renderBurstState.lastLoggedAt >= 1000) {
      renderBurstState.lastLoggedAt = now;
      booruViewLogger.info(
        "booru.view.render-burst",
        "Booru detecto una rafaga de renders en renderer.",
        {
          renderCount: renderBurstState.renderCount,
          windowMs: Number((now - renderBurstState.windowStartedAt).toFixed(2)),
          ...diagnosticsContextRef.current,
          resourceQuerySignature,
          entityProfileKey,
        },
      );
    }
  });

  useEffect(() => {
    if (typeof window.requestAnimationFrame !== "function") {
      return undefined;
    }

    let frameId = 0;
    let lastFrameAt = performance.now();
    let lastLoggedAt = 0;

    const tick = (timestamp) => {
      const deltaMs = timestamp - lastFrameAt;

      if (!document.hidden && deltaMs >= 220 && timestamp - lastLoggedAt >= 2000) {
        lastLoggedAt = timestamp;
        booruViewLogger.info(
          "booru.performance.frame-gap",
          "Booru detecto un gap de frames anormal en renderer.",
          {
            deltaMs: Number(deltaMs.toFixed(2)),
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey,
          },
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
      return undefined;
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
              entityProfileKey,
            },
          );
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      return undefined;
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
        resourceQuerySignature,
      },
    );
  }, [
    activeSection,
    currentEntityProfilePage,
    currentResourcePage,
    entityProfileKey,
    resourceQuerySignature,
    showEntityProfile,
    showResourceWorkspace,
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
      if (!activeResourceSection) {
        return;
      }

      setSelectedResourceState((currentValue) => ({
        ...currentValue,
        [activeResourceSection]: {
          ids: [],
          activeId: "",
          mode: "single",
        },
      }));
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Delete" || isTextInputTarget(event.target)) {
        return;
      }

      if (!showResourceWorkspace || !currentSelection.ids.length || activeResourceSection === "trash") {
        return;
      }

      event.preventDefault();

      void (async () => {
        try {
          setBusyAction("trash");
          const result = await invoke("booru:trash-resources", {
            resourceIds: currentSelection.ids,
          });
          setSnapshot(result?.snapshot || snapshot);
          setError("");
          setContextMenuState(null);
          clearCurrentSelection();
        } catch (trashError) {
          setError(
            trashError instanceof Error
              ? trashError.message
              : "No se pudo enviar la seleccion a la papelera.",
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
  }, [activeResourceSection, currentSelection.ids, showResourceWorkspace, snapshot]);

  useEffect(() => {
    const supportsVisibleThumbnailPriming =
      snapshot?.derivatives
      && typeof snapshot?.stats?.thumbnailBacklogCount === "number";
    const primingSignature = JSON.stringify({
      section: activeSection,
      mode: showResourceWorkspace ? "resource-section" : (entityThumbnailPrimingEnabled ? "entity-profile" : "idle"),
      page: showResourceWorkspace ? currentResourcePage : currentEntityProfilePage,
      querySignature: showResourceWorkspace ? resourceQuerySignature : entityProfileKey,
      ids: thumbnailPrimingItems.map((item) => item.id),
    });

    if (
      !thumbnailPrimingItems.length
      || !supportsVisibleThumbnailPriming
      || visibleThumbnailPrimingUnavailableRef.current
      || primedResourcePageSignatureRef.current === primingSignature
    ) {
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
        sampleIds: summarizeIdsForLog(thumbnailPrimingItems),
      },
    );
    void invoke("booru:prime-visible-thumbnails", {
      resourceIds: thumbnailPrimingItems.map((item) => item.id),
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
          error: truncateDiagnosticText(errorMessage, 600),
        },
      );
    });
  }, [
    activeSection,
    currentEntityProfilePage,
    currentResourcePage,
    entityProfileKey,
    entityThumbnailPrimingEnabled,
    resourceQuerySignature,
    thumbnailPrimingItems,
    showResourceWorkspace,
    snapshot?.derivatives,
    snapshot?.stats?.thumbnailBacklogCount,
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
        ...diagnosticsContextRef.current,
      },
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
          channel,
        },
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo ejecutar la accion de Booru.",
      );
      booruViewLogger.info(
        "booru.action.error",
        "Booru no pudo resolver una accion general de runtime.",
        {
          actionId,
          channel,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: actionError instanceof Error ? actionError.message : String(actionError || ""),
        },
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
        sampleIds: normalizedSelection.ids.slice(0, 12),
      },
    );
    setSelectedResourceState((currentValue) => ({
      ...currentValue,
      [section]: normalizedSelection,
    }));
  };

  const setResourcePageForSection = (section, nextPage) => {
    setResourcePageState((currentValue) => ({
      ...currentValue,
      [section]: {
        page: clampPageNumber(nextPage, Number.MAX_SAFE_INTEGER),
        querySignature: resourceQuerySignature,
      },
    }));
  };

  const setEntityProfilePageForSection = (section, nextPage) => {
    setEntityProfilePageState((currentValue) => ({
      ...currentValue,
      [section]: {
        page: clampPageNumber(nextPage, Number.MAX_SAFE_INTEGER),
        profileKey: entityProfileKey,
      },
    }));
  };

  const clearSelectionForSection = (section) => {
    setSelectionForSection(section, {
      ids: [],
      activeId: "",
      mode: "single",
    });
  };

  const openResourceHero = (item, items = resourceItems) => {
    if (!item?.id) {
      return;
    }

    const nextItems = (Array.isArray(items) ? items : [])
      .filter((entry) => entry?.id && isPreviewableMediaKind(entry.mediaKind));

    if (!nextItems.length) {
      return;
    }

    setResourceHeroState({
      activeId: item.id,
      items: nextItems,
    });
    setInspectorOpen(false);
  };

  const stepResourceHero = (direction) => {
    setResourceHeroState((currentValue) => {
      const items = Array.isArray(currentValue?.items) ? currentValue.items : [];
      const activeId = String(currentValue?.activeId || "").trim();
      const currentIndex = items.findIndex((entry) => entry?.id === activeId);

      if (currentIndex < 0) {
        return currentValue;
      }

      const nextIndex = Math.min(
        items.length - 1,
        Math.max(0, currentIndex + direction),
      );

      if (nextIndex === currentIndex) {
        return currentValue;
      }

      return {
        ...currentValue,
        activeId: items[nextIndex]?.id || activeId,
      };
    });
  };

  useEffect(() => {
    if (!showResourceWorkspace || !activeResourceSection || !inspectorOpen) {
      previousVisibleResourceIdsRef.current = resourceItems.map((item) => item.id);
      return;
    }

    const nextVisibleIds = resourceItems.map((item) => item.id);
    const currentActiveId = String(currentSelection.activeId || "").trim();
    const activeStillVisible = currentActiveId && nextVisibleIds.includes(currentActiveId);

    if (!activeStillVisible) {
      if (!nextVisibleIds.length) {
        setInspectorOpen(false);
        previousVisibleResourceIdsRef.current = nextVisibleIds;
        return;
      }

      const previousIds = previousVisibleResourceIdsRef.current;
      const previousIndex = previousIds.indexOf(currentActiveId);
      const fallbackIndex = previousIndex >= 0
        ? Math.min(previousIndex, nextVisibleIds.length - 1)
        : 0;
      const replacementId = nextVisibleIds[fallbackIndex] || nextVisibleIds[0] || "";

      if (replacementId) {
        setSelectionForSection(activeResourceSection, {
          ids: [replacementId],
          activeId: replacementId,
          mode: "single",
        });
      } else {
        setInspectorOpen(false);
      }
    }

    previousVisibleResourceIdsRef.current = nextVisibleIds;
  }, [
    activeResourceSection,
    currentSelection.activeId,
    inspectorOpen,
    resourceItems,
    showResourceWorkspace,
  ]);

  useEffect(() => {
    const nextNonce = String(input?.[WORKSPACE_FRAME_SECTION_NONCE_KEY] || "").trim();

    if (!nextNonce || lastSectionNonceRef.current === nextNonce) {
      return;
    }

    lastSectionNonceRef.current = nextNonce;
    setResourceHeroState(null);
    setInspectorOpen(false);
    setContextMenuState(null);

    if (activeResourceSection) {
      clearSelectionForSection(activeResourceSection);
      setResourcePageForSection(activeResourceSection, 1);
    }

    if (activeSection === "settings" && settingsSubview !== NO_SETTINGS_SUBVIEW) {
      void ctx.openView({
        viewId: BOORU_WORKSPACE_VIEW_ID,
        reuse: true,
        input: {
          ...(input && typeof input === "object" ? input : {}),
          section: "settings",
          settingsSubview: NO_SETTINGS_SUBVIEW,
          entityProfile: null,
        },
      });
      return;
    }

    if (showEntityProfile) {
      void ctx.openView({
        viewId: BOORU_WORKSPACE_VIEW_ID,
        reuse: true,
        input: {
          ...(input && typeof input === "object" ? input : {}),
          section: activeSection,
          entityProfile: null,
        },
      });
    }
  }, [
    activeResourceSection,
    activeSection,
    ctx,
    input,
    settingsSubview,
    showEntityProfile,
  ]);

  useEffect(() => {
    setResourceHeroState(null);
  }, [activeSection, activeEntityProfile?.id, settingsSubview]);

  const handleResourceClick = (item, event) => {
    if (!showResourceWorkspace || !activeResourceSection) {
      return;
    }

    const isToggle = Boolean(event?.ctrlKey || event?.metaKey);
    const currentIds = Array.isArray(currentSelection.ids) ? currentSelection.ids : [];

    if (!isToggle) {
      setSelectionForSection(activeResourceSection, {
        ids: [item.id],
        activeId: item.id,
        mode: "single",
      });
      return;
    }

    const itemSelected = currentIds.includes(item.id);
    const nextIds = itemSelected
      ? currentIds.filter((resourceId) => resourceId !== item.id)
      : [...currentIds, item.id];

    setSelectionForSection(activeResourceSection, {
      ids: nextIds,
      activeId: nextIds.length
        ? (
          itemSelected && currentSelection.activeId === item.id
            ? (nextIds.at(-1) || nextIds[0] || "")
            : item.id
        )
        : "",
      mode: nextIds.length > 1 ? "multi" : "single",
    });
  };

  const handleResourceOpen = (item, event) => {
    if (!showResourceWorkspace || !activeResourceSection || event?.ctrlKey || event?.metaKey) {
      return;
    }

    openResourceHero(item, resourceItems);
  };

  const openResourceContextMenu = (item, event) => {
    if (!showResourceWorkspace || !activeResourceSection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const selectionIds = currentSelection.ids.includes(item.id)
      ? currentSelection.ids
      : [item.id];
    const activeId = item.id;

    setSelectionForSection(activeResourceSection, {
      ids: selectionIds,
      activeId,
      mode: selectionIds.length > 1 ? "multi" : "single",
    });

    const itemsById = new Map(resourceItems.map((resource) => [resource.id, resource]));
    const selectedContextResources = selectionIds.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
    const singleContextResource = selectedContextResources.length === 1 ? selectedContextResources[0] : null;
    const imageCompatible = canUseResourceForImageActions(singleContextResource);
    const menuItems = activeResourceSection === "trash"
      ? [
        { id: "details", label: "Detalles" },
        { id: "restore", label: "Restaurar" },
        { id: "purge", label: "Purgar", danger: true },
      ]
      : [
        { id: "details", label: "Detalles" },
        { id: "trash", label: "Eliminar", danger: true },
        ...(imageCompatible ? [{ id: "copy", label: "Copiar al portapapeles" }] : []),
        ...(imageCompatible ? [{ id: "google", label: "Buscar en Google" }] : []),
      ];

    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: menuItems,
      resourceIds: selectionIds,
      resources: selectedContextResources,
      activeId,
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
        ...(canUseResourceForImageActions(item) ? [
          { id: "copy", label: "Copiar al portapapeles" },
          { id: "google", label: "Buscar en Google" },
        ] : []),
        { id: "set-avatar", label: "Usar como perfil" },
        { id: "set-banner", label: "Usar como banner" },
      ],
      resourceIds: [item.id],
      resources: [item],
      entityKind: activeEntityKind,
      entityId: activeEntityProfile.id,
    });
  };

  const openEntityCardContextMenu = (item, event) => {
    const contextResource = buildContextResourceFromDescriptor({
      sampleResourceId: item?.cardResourceId || item?.sampleResourceId,
      storagePath: item?.cardStoragePath || item?.sampleStoragePath,
      sampleStoragePath: item?.cardPreviewPath || item?.sampleStoragePath,
      sampleMediaKind: item?.cardMediaKind || item?.sampleMediaKind,
    });

    if (!contextResource) {
      return;
    }

    if (!canUseResourceForImageActions(contextResource)) {
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
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource],
    });
  };

  const openEntityProfileVisualContextMenu = (descriptor, event) => {
    const contextResource = buildContextResourceFromDescriptor(descriptor);

    if (!contextResource || !canUseResourceForImageActions(contextResource)) {
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
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource],
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
    await window.nexus.clipboard.writeImageFromPath(resource.storagePath);
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
          visualRole: actionId === "set-avatar" ? "avatar" : "banner",
        });
        if (result?.profile) {
          setEntityProfile(result.profile);
        }
        setEntityProfileError("");
        return;
      }

      if (actionId === "details" && activeResourceSection) {
        setInspectorOpen(true);
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
          resourceIds: contextIds,
        });
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeResourceSection);
        setInspectorOpen(false);
        return;
      }

      if (actionId === "restore") {
        setBusyAction("restore");
        const result = await invoke("booru:restore-resources", {
          resourceIds: contextIds,
        });
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeResourceSection);
        setInspectorOpen(false);
        return;
      }

      if (actionId === "purge") {
        setBusyAction("purge");
        const result = await invoke("booru:purge-resources", {
          resourceIds: contextIds,
        });
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeResourceSection);
        setInspectorOpen(false);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo ejecutar la accion contextual.",
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
        dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
      },
    );

    try {
      const itemsById = new Map(resourceItems.map((item) => [item.id, item]));
      const draftResources = draftToPersist.resourceIds
        .map((resourceId) => itemsById.get(resourceId))
        .filter(Boolean);
      const payload = buildSavePayload(draftResources, draftToPersist);
      const result = await invoke(
        canSaveClassification(draftToPersist) ? "booru:save-basic-classification" : "booru:save-resource-metadata",
        payload,
      );
      const savedResources = normalizeSelectedEntities(
        Array.isArray(result?.resource)
          ? result.resource
          : [result?.resource].filter(Boolean),
      );
      const savedById = new Map(savedResources.map((item) => [item.id, item]));
      const orderedSavedResources = draftToPersist.resourceIds
        .map((resourceId) => savedById.get(resourceId))
        .filter(Boolean);

      if (orderedSavedResources.length) {
        setResourceState((currentValue) => ({
          ...currentValue,
          items: mergeResourcesIntoItems(currentValue.items, orderedSavedResources),
        }));
      }

      setSnapshot(result?.snapshot || snapshot);
      setError("");
      setEntityRevision((currentValue) => currentValue + 1);
      setClassificationDraft((currentDraft) => (
        arraysEqual(currentDraft.resourceIds || [], draftToPersist.resourceIds || [])
          ? {
            ...buildClassificationDraft(orderedSavedResources.length ? orderedSavedResources : draftResources),
            dirtyFields: [],
          }
          : currentDraft
      ));
      logRendererDuration(
        "booru.classification.autosave.done",
        "Booru resolvio un autosave de clasificacion o metadata.",
        performance.now() - startedAt,
        {
          resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
          dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
          savedCount: orderedSavedResources.length,
          sampleIds: summarizeIdsForLog(orderedSavedResources),
        },
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el recurso.",
      );
      booruViewLogger.info(
        "booru.classification.autosave.error",
        "Booru no pudo persistir un autosave de clasificacion o metadata.",
        {
          resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
          dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: saveError instanceof Error ? saveError.message : String(saveError || ""),
        },
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
    if (!showResourceWorkspace || activeResourceSection === "duplicates" || activeResourceSection === "trash") {
      return undefined;
    }

    if (!canSaveDraftProgress(classificationDraft)) {
      return undefined;
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
  }, [activeResourceSection, classificationDraft, selectedResourceIdsSignature, showResourceWorkspace]);

  const handleQuickAssignEntity = async ({ resourceId, resourceIds, kind, entityId }) => {
    const normalizedResourceIds = uniqueIds([
      resourceId,
      ...(Array.isArray(resourceIds) ? resourceIds : []),
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
        entityId,
      },
    );

    try {
      const result = await invoke("booru:quick-assign-entity", {
        resourceId: normalizedResourceIds[0] || null,
        resourceIds: normalizedResourceIds,
        kind,
        entityId,
      });

      setSnapshot(result?.snapshot || snapshot);
      const updatedResources = normalizeSelectedEntities(
        Array.isArray(result?.resource)
          ? result.resource
          : [result?.resource].filter(Boolean),
      );

      if (updatedResources.length) {
        setResourceState((currentValue) => ({
          ...currentValue,
          items: mergeResourcesIntoItems(currentValue.items, updatedResources),
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
          resultResourceIds: updatedResources.map((resource) => resource.id),
        },
      );
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : "No se pudo aplicar la asignacion rapida.",
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
          error: assignError instanceof Error ? assignError.message : String(assignError || ""),
        },
      );
    } finally {
      setBusyAction("");
    }
  };
  handleQuickAssignEntityRef.current = handleQuickAssignEntity;

  const handleApplyRecommendation = async (item) => {
    if (!item || !selectedResources.length) {
      return;
    }

    const selectedResourceIds = selectedResources.map((resource) => resource.id);
    const startedAt = performance.now();
    const usesCreationFlow = item.type === "create-tag" || item.type === "create-entity";
    const resolveDraftForSelection = (currentDraft) => (
      arraysEqual(
        Array.isArray(currentDraft?.resourceIds) ? currentDraft.resourceIds : [],
        selectedResourceIds,
      )
        ? currentDraft
        : buildClassificationDraft(selectedResources)
    );
    const applyEntityToDraft = (currentDraft, kind, entity) => {
      const draftField = DRAFT_ENTITY_FIELD_BY_KIND[kind];

      if (!draftField || !entity?.id) {
        return currentDraft;
      }

      const currentItems = Array.isArray(currentDraft?.[draftField]) ? currentDraft[draftField] : [];
      const nextItems = normalizeSelectedEntities([...currentItems, entity]);
      const nextDraft = {
        ...currentDraft,
        [draftField]: nextItems,
      };

      if (draftField === "characters") {
        nextDraft.characterUniverses = pruneCharacterUniverseAssignments(
          currentDraft.characterUniverses,
          nextItems,
        );
      }

      if (!nextDraft.reality && kind === "author") {
        nextDraft.reality = "real";
      }

      if (!nextDraft.reality && (kind === "character" || kind === "universe")) {
        nextDraft.reality = "ficticio";
      }

      return markDraftDirty(nextDraft, draftField);
    };

    booruViewLogger.debug(
      "booru.recommendation.apply.start",
      "Booru inicio la aplicacion de una recomendacion sobre el draft.",
      {
        itemId: item.id || null,
        itemType: item.type || null,
        itemKind: item.kind || null,
        selectedResourceIds: selectedResourceIds.slice(0, 16),
      },
    );

    if (usesCreationFlow) {
      setBusyAction("recommendation-apply");
    }

    try {
      if (item.type === "reality-action") {
        setClassificationDraft((currentDraft) => markDraftDirty({
          ...resolveDraftForSelection(currentDraft),
          reality: item.reality || null,
        }, "reality"));
      } else if (item.type === "entity") {
        const nextEntity = item.entity || {
          id: item.entityId,
          displayName: item.label,
        };
        setClassificationDraft((currentDraft) => applyEntityToDraft(
          resolveDraftForSelection(currentDraft),
          item.kind,
          nextEntity,
        ));
      } else if (item.type === "tag") {
        const nextTag = item.tag || {
          id: item.tagId,
          name: item.label,
        };
        setClassificationDraft((currentDraft) => {
          const baseDraft = resolveDraftForSelection(currentDraft);
          return markDraftDirty({
            ...baseDraft,
            manualTags: normalizeSelectedTags([
              ...(Array.isArray(baseDraft.manualTags) ? baseDraft.manualTags : []),
              nextTag,
            ]),
          }, "manualTags");
        });
      } else if (item.type === "create-tag") {
        const result = await invoke("booru:ensure-tag", { name: item.createName || item.label });
        const nextTag = result?.tag;

        if (!nextTag?.id) {
          throw new Error("Booru no devolvio la tag creada.");
        }

        setClassificationDraft((currentDraft) => {
          const baseDraft = resolveDraftForSelection(currentDraft);
          return markDraftDirty({
            ...baseDraft,
            manualTags: normalizeSelectedTags([
              ...(Array.isArray(baseDraft.manualTags) ? baseDraft.manualTags : []),
              nextTag,
            ]),
          }, "manualTags");
        });
      } else if (item.type === "create-entity") {
        const result = await invoke("booru:ensure-entity", {
          kind: item.kind,
          name: item.createName || item.label,
        });
        const nextEntity = result?.entity;

        if (!nextEntity?.id) {
          throw new Error("Booru no devolvio la entidad creada.");
        }

        setClassificationDraft((currentDraft) => applyEntityToDraft(
          resolveDraftForSelection(currentDraft),
          item.kind,
          nextEntity,
        ));
        setEntityRevision((currentValue) => currentValue + 1);
      }

      setError("");
      logRendererDuration(
        "booru.recommendation.apply.done",
        "Booru aplico una recomendacion sobre el draft actual.",
        performance.now() - startedAt,
        {
          itemId: item.id || null,
          itemType: item.type || null,
          itemKind: item.kind || null,
          selectedResourceIds: selectedResourceIds.slice(0, 16),
        },
      );
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "No se pudo aplicar la recomendacion.",
      );
      booruViewLogger.info(
        "booru.recommendation.apply.error",
        "Booru no pudo aplicar una recomendacion sobre el draft.",
        {
          itemId: item.id || null,
          itemType: item.type || null,
          itemKind: item.kind || null,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: applyError instanceof Error ? applyError.message : String(applyError || ""),
        },
      );
    } finally {
      if (usesCreationFlow) {
        setBusyAction("");
      }
    }
  };

  const handleSetCharacterUniverse = async (nextUniverse) => {
    if (activeEntityKind !== "character" || !activeEntityProfile?.id) {
      return;
    }

    setEntityBusy(true);

    try {
      const result = await invoke("booru:set-character-universe", {
        characterId: activeEntityProfile.id,
        universeId: nextUniverse?.id || null,
      });
      if (result?.profile) {
        setEntityProfile(result.profile);
      }
      setEntityError("");
      setEntityProfileError("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (saveError) {
      setEntityError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el universe del character.",
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
        universeId: activeEntityProfile.id,
      });
      setEntityError("");
      setEntityProfileError("");
      setUniverseCharacterCreateValue("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (createError) {
      setEntityError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear el character dentro del universe.",
      );
    } finally {
      setEntityBusy(false);
    }
  };

  const handlePasteClipboardImageToEntity = async () => {
    if (!showEntityProfile || !activeEntityKind || !activeEntityProfile?.id || entityBusy) {
      return;
    }

    setEntityBusy(true);

    try {
      const tempFilePath = await window.nexus.clipboard.exportImageToTempFile("booru-entity");
      const result = await invoke("booru:paste-clipboard-image-to-entity", {
        kind: activeEntityKind,
        entityId: activeEntityProfile.id,
        tempFilePath,
      });

      setSnapshot(result?.snapshot || snapshot);
      if (result?.profile) {
        setEntityProfile(result.profile);
      }
      setEntityError("");
      setEntityProfileError("");
      setEntityRevision((currentValue) => currentValue + 1);
      setEntityProfilePageForSection(activeSection, 1);

      if (activeEntityProfile?.tab !== "data" && currentEntityProfilePage === 1) {
        await loadEntityProfileGallery({ requestedPage: 1 });
      }
    } catch (pasteError) {
      setEntityProfileError(
        pasteError instanceof Error
          ? pasteError.message
          : "No se pudo pegar la imagen del portapapeles en esta entidad.",
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
          universeId: entityCreateUniverse.id,
        });
      } else {
        await invoke("booru:ensure-entity", {
          kind: activeEntityKind,
          name: trimmedName,
        });
      }
      setEntityError("");
      setEntityCreateValue("");
      setEntityCreateUniverse(null);
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (ensureError) {
      setEntityError(
        ensureError instanceof Error
          ? ensureError.message
          : "No se pudo asegurar la entidad.",
      );
    } finally {
      setEntityBusy(false);
    }
  };

  const handleRestoreSelected = async () => {
    try {
      setBusyAction("restore");
      const result = await invoke("booru:restore-resources", {
        resourceIds: currentSelection.ids,
      });
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      if (activeResourceSection) {
        clearSelectionForSection(activeResourceSection);
      }
      setInspectorOpen(false);
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "No se pudo restaurar la seleccion.",
      );
    } finally {
      setBusyAction("");
    }
  };

  const handlePurgeSelected = async () => {
    try {
      setBusyAction("purge");
      const result = await invoke("booru:purge-resources", {
        resourceIds: currentSelection.ids,
      });
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      if (activeResourceSection) {
        clearSelectionForSection(activeResourceSection);
      }
      setInspectorOpen(false);
    } catch (purgeError) {
      setError(
        purgeError instanceof Error
          ? purgeError.message
          : "No se pudo purgar la seleccion.",
      );
    } finally {
      setBusyAction("");
    }
  };

  const hasBlockingSetupWarning = !snapshot?.settings?.watchFolderPath
    || (snapshot?.settings?.watchFolderPath && !snapshot?.python?.available);
  const handleOpenEntity = (kind, item) => {
    if (!item?.id) {
      return;
    }

    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...(input && typeof input === "object" ? input : {}),
        section: ENTITY_KIND_SECTION_MAP[kind] || activeSection,
        entityProfile: {
          kind,
          id: item.id,
          tab: "gallery",
        },
      },
    });
  };

  const handleCloseEntityProfile = () => {
    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...(input && typeof input === "object" ? input : {}),
        section: activeSection,
        entityProfile: null,
      },
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
        ...(input && typeof input === "object" ? input : {}),
        section: activeSection,
        entityProfile: {
          kind: activeEntityKind,
          id: activeEntityProfile.id,
          tab: normalizedTab,
        },
      },
    });
  };

  const handleOpenEntityInMedia = () => {
    if (!activeEntityKind || !activeEntityProfile?.id) {
      return;
    }

    const entityLabel = getEntityProfileLabel(activeEntityProfile, entityProfile)
      || BOORU_ENTITY_KIND_LABELS[activeEntityKind]
      || "Entidad";

    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...(input && typeof input === "object" ? input : {}),
        section: "media",
        entityProfile: null,
        settingsSubview: NO_SETTINGS_SUBVIEW,
        resourceSearchTokens: [
          {
            type: "entity",
            negative: false,
            kind: activeEntityKind,
            id: activeEntityProfile.id,
            value: entityLabel,
            label: entityLabel,
          },
        ],
      },
    });
  };

  const handleOpenSettingsSubview = (nextSubview) => {
    const normalizedSubview = nextSubview === "duplicates" || nextSubview === "trash"
      ? nextSubview
      : NO_SETTINGS_SUBVIEW;

    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: {
        ...(input && typeof input === "object" ? input : {}),
        section: "settings",
        settingsSubview: normalizedSubview,
        entityProfile: null,
      },
    });
  };

  if (activeSection === "settings" && settingsSubview === NO_SETTINGS_SUBVIEW) {
    return (
      <WorkspacePage className="booruView">
        <WorkspaceBody className="booruView__body">
          <ScrollRegion className="booruView__detailScroll">
            {loading && !snapshot ? (
              <StateBlock
                centered
                title="Cargando plugin"
                description="Leyendo biblioteca, entidades y runtime local."
              />
            ) : (
              <div className="booruView__content">
                {error ? <Notice tone="danger">{error}</Notice> : null}
                {!snapshot?.settings?.watchFolderPath ? (
                  <Notice tone="warning">
                    Booru todavia no tiene una carpeta vigilada configurada.
                  </Notice>
                ) : null}
                {snapshot?.settings?.watchFolderPath && !snapshot?.python?.available ? (
                  <Notice tone="danger">
                    {snapshot?.python?.error || "No se encontro Python para Booru."}
                  </Notice>
                ) : null}
                <SettingsSection
                  snapshot={snapshot}
                  busyAction={busyAction}
                  loading={loading}
                  onRefresh={() => loadSnapshot({ silent: false, reason: "metrics-refresh" })}
                  onRescan={() => handleAction("rescan", "booru:rescan-watch-folder")}
                  onRestart={() => handleAction("restart", "booru:restart-watcher")}
                  onOpenDuplicates={() => handleOpenSettingsSubview("duplicates")}
                  onOpenTrash={() => handleOpenSettingsSubview("trash")}
                />
              </div>
            )}
          </ScrollRegion>
        </WorkspaceBody>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage className="booruView">
      <WorkspaceBody className="booruView__body">
        <SplitLayout variant="sidebar-detail" className="booruView__layout">
          <SplitSidebar className="booruView__sidebar">
            <ScrollRegion className="booruView__sidebarScroll">
              <PanelStack className="booruView__sidebarStack">
                <SectionPanel className="booruView__panel booruView__panel--compact booruView__panel--fill">
                  {showResourceWorkspace ? (
                    <>
                      <Field label="Buscar" className="booruView__field">
                        <ResourceSearchComposer
                          tokens={normalizedResourceSearchTokens}
                          onChange={setResourceSearchTokens}
                        />
                      </Field>

                      {showClassificationSidebar ? (
                        <div className="booruView__filterStack">
                          {activeResourceSection === "pending" ? (
                            <div className="booruView__filterGroup">
                              <span className="booruView__groupLabel">Pendientes</span>
                              <SegmentedControl
                                className="booruView__filterSegmented"
                                variant="compact"
                                options={PENDING_MODE_OPTIONS}
                                value={resourcePendingMode}
                                onChange={(value) => setResourcePendingMode(value === "tags" ? "tags" : "essential")}
                                ariaLabel="Modo de pendientes"
                              />
                            </div>
                          ) : null}

                          <div className="booruView__filterGroup">
                            <span className="booruView__groupLabel">Media</span>
                            <SegmentedControl
                              className="booruView__filterSegmented"
                              variant="compact"
                              options={MEDIA_FILTER_OPTIONS}
                              value={resourceMediaKindFilter}
                              onChange={(value) => setResourceMediaKindFilter(value || "all")}
                              ariaLabel="Filtro de media"
                            />
                          </div>

                          <div className="booruView__filterGroup">
                            <span className="booruView__groupLabel">Tipo</span>
                            <SegmentedControl
                              className="booruView__filterSegmented"
                              variant="compact"
                              options={REALITY_FILTER_OPTIONS}
                              value={resourceRealityFilter}
                              onChange={(value) => setResourceRealityFilter(value || "all")}
                              ariaLabel="Filtro de tipo"
                            />
                          </div>

                          <div className="booruView__filterGroup">
                            <span className="booruView__groupLabel">Faltantes</span>
                            <SegmentedControl
                              className="booruView__filterSegmented"
                              variant="compact"
                              options={contextualMissingFilterOptions}
                              value={resourceMissingFilter}
                              onChange={(value) => setResourceMissingFilter(value || NO_MISSING_FILTER)}
                              ariaLabel="Filtro de faltantes"
                            />
                          </div>
                        </div>
                      ) : null}

                      {showClassificationSidebar ? (
                        <RecommendationPanel
                          selectedResourceIds={selectedResources.map((resource) => resource.id)}
                          customDragState={customDragState}
                          manualAssignDisabledReason={
                            selectedResources.length === 0
                              ? "Selecciona recursos para aplicar sugerencias o arrastra una card sobre una entidad."
                              : ""
                          }
                          assigning={busyAction === "quick-assign" || busyAction === "recommendation-apply"}
                          revisionKey={entityRevision}
                          resourceQuery={resourceQuery}
                          draft={classificationDraft}
                          onAssignEntity={handleQuickAssignEntity}
                          onApplyRecommendation={handleApplyRecommendation}
                        />
                      ) : null}
                    </>
                  ) : null}

                  {activeEntityKind ? (
                    <>
                      <InlineField label="Buscar" grow className="booruView__inlineField">
                        <input
                          type="text"
                          value={entitySearchValue}
                          onChange={(event) => setEntitySearchValue(event.target.value)}
                          placeholder={`Buscar ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidad"}`}
                        />
                      </InlineField>

                      <InlineField label="Crear" grow className="booruView__inlineField">
                        <input
                          type="text"
                          value={entityCreateValue}
                          onChange={(event) => setEntityCreateValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void handleEnsureSectionEntity();
                            }
                          }}
                          placeholder={`Crear ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidad"}`}
                        />
                      </InlineField>

                      {activeEntityKind === "character" ? (
                        <Field label="Universe inicial" className="booruView__field">
                          <SingleEntityAutocompleteField
                            kind="universe"
                            label="Universe inicial"
                            value={entityCreateUniverse}
                            onChange={setEntityCreateUniverse}
                            disabled={entityBusy}
                            placeholder="Buscar universe o crear uno nuevo"
                            buttonLabel="Elegir"
                          />
                        </Field>
                      ) : null}

                      <div className="booruView__sidebarActions booruView__sidebarActions--compact">
                        <Button
                          type="button"
                          onClick={() => void handleEnsureSectionEntity()}
                          disabled={!String(entityCreateValue || "").trim() || entityBusy}
                        >
                          Crear
                        </Button>
                      </div>
                    </>
                  ) : null}
                </SectionPanel>
              </PanelStack>
            </ScrollRegion>
          </SplitSidebar>

          <SplitDetail className="booruView__detail">
            {loading && !snapshot ? (
              <StateBlock
                centered
                title="Cargando plugin"
                description="Leyendo biblioteca, entidades y runtime local."
              />
            ) : showResourceWorkspace ? (
              <div className="booruView__content booruView__content--workspace">
                {error ? <Notice tone="danger">{error}</Notice> : null}
                {entityError ? <Notice tone="danger">{entityError}</Notice> : null}

                {hasBlockingSetupWarning && (activeResourceSection === "media" || activeResourceSection === "pending") ? (
                  !snapshot?.settings?.watchFolderPath ? (
                    <Notice tone="warning">
                      Booru todavia no tiene una carpeta vigilada configurada.
                    </Notice>
                  ) : (
                    <Notice tone="danger">
                      {snapshot?.python?.error || "No se encontro Python para Booru."}
                    </Notice>
                  )
                ) : null}

                <div className={[
                  "booruView__workspaceGrid",
                  !showInspector ? "booruView__workspaceGrid--single" : "",
                ].filter(Boolean).join(" ")}>
                  <ResourceGrid
                    items={resourceItems}
                    selectedIds={currentSelection.ids}
                    selectionMode={currentSelection.mode}
                    customDragState={customDragState}
                    onCustomDragPointerDown={handleCustomDragPointerDown}
                    shouldSuppressClick={consumeSuppressedResourceClick}
                    totalCount={resourceState.totalCount}
                    loading={resourceLoading}
                    scrollKey={`${activeResourceSection}:${currentResourcePage}:${resourceQuerySignature}:${resourceSearchTokensSignature}`}
                    currentPage={currentResourcePage}
                    pageSize={RESOURCE_PAGE_SIZE}
                    onPageChange={(nextPage) => setResourcePageForSection(activeResourceSection, nextPage)}
                    onSelect={handleResourceClick}
                    onOpen={handleResourceOpen}
                    onContextMenu={openResourceContextMenu}
                    onClearSelection={() => clearSelectionForSection(activeResourceSection)}
                    emptyTitle={
                      activeResourceSection === "pending"
                        ? "No hay pendientes"
                        : activeResourceSection === "duplicates"
                          ? "No hay duplicados"
                          : activeResourceSection === "trash"
                            ? "La papelera esta vacia"
                            : "Todavia no hay media"
                    }
                    emptyDescription={
                      activeResourceSection === "pending"
                        ? "Cuando Booru detecte recursos incompletos, apareceran aqui por prioridad."
                        : activeResourceSection === "duplicates"
                          ? "No se detectaron duplicados exactos en esta tanda."
                          : activeResourceSection === "trash"
                            ? "Los recursos eliminados desde Booru apareceran aqui."
                            : "Cuando Booru detecte archivos soportados, apareceran aqui."
                    }
                  />

                  {showInspector ? (
                    <ResourceInspector
                      section={activeResourceSection}
                      activeResource={activeResource}
                      selectedResources={selectedResources}
                      draft={classificationDraft}
                      saving={savingClassification}
                      onDraftChange={(updater) => {
                        setClassificationDraft((currentDraft) => (
                          typeof updater === "function"
                            ? updater(currentDraft)
                            : updater
                        ));
                      }}
                      onRestore={handleRestoreSelected}
                      onPurge={handlePurgeSelected}
                      onClose={() => setInspectorOpen(false)}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <ScrollRegion className="booruView__detailScroll">
                <div className="booruView__content">
                  {error ? <Notice tone="danger">{error}</Notice> : null}
                  {entityError ? <Notice tone="danger">{entityError}</Notice> : null}
                  {entityProfileError ? <Notice tone="danger">{entityProfileError}</Notice> : null}

                  {activeEntityKind ? (
                    showEntityProfile ? (
                      entityProfileLoading && !entityProfile ? (
                        <StateBlock
                          centered
                          title="Cargando perfil"
                          description={`Preparando ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "la entidad"} desde Booru.`}
                        />
                      ) : entityProfile ? (
                        <EntityProfileView
                          kind={activeEntityKind}
                          profile={entityProfile}
                          activeTab={activeEntityProfile?.tab || "gallery"}
                          galleryState={entityProfileGalleryState}
                          galleryLoading={entityProfileGalleryLoading}
                          currentPage={currentEntityProfilePage}
                          pageSize={RESOURCE_PAGE_SIZE}
                          entityMutationBusy={entityBusy}
                          universeCharacterCreateValue={universeCharacterCreateValue}
                          onPageChange={(nextPage) => setEntityProfilePageForSection(activeSection, nextPage)}
                          onBack={handleCloseEntityProfile}
                          onTabChange={handleChangeEntityProfileTab}
                          onOpenInMedia={handleOpenEntityInMedia}
                          onUniverseCharacterCreateValueChange={setUniverseCharacterCreateValue}
                          onCreateCharacterInUniverse={handleCreateCharacterInUniverse}
                          onChangeCharacterUniverse={handleSetCharacterUniverse}
                          onVisualContextMenu={openEntityProfileVisualContextMenu}
                          onGalleryResourceContextMenu={openEntityProfileResourceContextMenu}
                          onGalleryResourceOpen={openResourceHero}
                          onPasteClipboardImage={handlePasteClipboardImageToEntity}
                          onProfileChange={setEntityProfile}
                        />
                      ) : (
                        <StateBlock
                          centered
                          title="Perfil no disponible"
                          description="La entidad solicitada ya no esta disponible o su perfil no pudo cargarse."
                        />
                      )
                    ) : entityLoading ? (
                      entityItems.length ? (
                        <div className="booruView__entitySectionContent">
                          <EntityGrid
                            kind={activeEntityKind}
                            items={entityItems}
                            emptyTitle={`Sin ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "elementos"} todavia`}
                            emptyDescription="Empieza a escribir y presiona Enter para crear el primero."
                            onOpenEntity={handleOpenEntity}
                            onPreviewContextMenu={openEntityCardContextMenu}
                          />
                          <span className="booruView__suggestionsHint">Actualizando seccion...</span>
                        </div>
                      ) : (
                      <StateBlock
                        centered
                        title="Cargando seccion"
                        description={`Leyendo ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidades"} desde Booru.`}
                      />
                      )
                    ) : (
                      <EntityGrid
                        kind={activeEntityKind}
                        items={entityItems}
                        emptyTitle={`Sin ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "elementos"} todavia`}
                        emptyDescription="Empieza a escribir y presiona Enter para crear el primero."
                        onOpenEntity={handleOpenEntity}
                        onPreviewContextMenu={openEntityCardContextMenu}
                      />
                    )
                  ) : null}
                </div>
              </ScrollRegion>
            )}
          </SplitDetail>
        </SplitLayout>

        <FloatingContextMenu
          state={contextMenuState}
          onClose={() => setContextMenuState(null)}
          onAction={(actionId) => void handleContextMenuAction(actionId)}
        />
        <ResourceHeroOverlay
          item={activeHeroItem}
          index={Math.max(0, (Array.isArray(resourceHeroState?.items) ? resourceHeroState.items : []).findIndex((entry) => entry?.id === activeHeroItem?.id))}
          totalCount={Array.isArray(resourceHeroState?.items) ? resourceHeroState.items.length : 0}
          onClose={() => setResourceHeroState(null)}
          onPrev={() => stepResourceHero(-1)}
          onNext={() => stepResourceHero(1)}
        />
        <BooruDragPreviewLayer
          resourcesById={dragPreviewResourcesById}
          customDragState={customDragState}
        />
      </WorkspaceBody>
    </WorkspacePage>
  );
}
