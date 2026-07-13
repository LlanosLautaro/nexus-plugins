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
  DownloadIcon,
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
import { ClipboardAssociationComposer, EntityVisualCropper } from "./components/index.js";
import SettingsSection from "./components/settings/SettingsSection.jsx";
import EntityGrid from "./components/entities/EntityGrid.jsx";
import EntityProfileGalleryGrid from "./components/entities/EntityProfileGallery.jsx";
import ResourceHeroOverlay from "./components/media/ResourceHeroOverlay.jsx";
import FloatingContextMenu from "./components/shared/FloatingContextMenu.jsx";
import BooruDragPreviewLayer from "./components/media/BooruDragPreviewLayer.jsx";
import MediaThumbnailComponent from "./components/media/MediaThumbnail.jsx";
import ResourceSearchComposer from "./components/search/ResourceSearchComposer.jsx";
import SingleEntityAutocompleteFieldComponent from "./components/search/SingleEntityAutocompleteField.jsx";
import EntityAutocompleteFieldComponent from "./components/search/EntityAutocompleteField.jsx";
import TagAutocompleteFieldComponent from "./components/search/TagAutocompleteField.jsx";
import RecommendationKindBadgeComponent from "./components/recommendations/RecommendationKindBadge.jsx";
import RecommendationEntityDropTargetComponent from "./components/recommendations/RecommendationEntityDropTarget.jsx";
import ResourceGridComponent from "./components/media/ResourceGrid.jsx";
import ResourcePaginationComponent from "./components/media/ResourcePagination.jsx";
import ResourceGridCardComponent from "./components/media/ResourceGridCard.jsx";
import RecommendationPanelComponent from "./components/recommendations/RecommendationPanel.jsx";
import ResourceInspectorComponent from "./components/resources/ResourceInspector.jsx";
import EntityProfileViewComponent from "./components/entities/EntityProfileView.jsx";
import EntityProfileDataTabComponent from "./components/entities/EntityProfileDataTab.jsx";
import EntityProfileTagsTabComponent from "./components/entities/EntityProfileTagsTab.jsx";

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
  { value: "tags", label: "Tags" },
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
const RESOURCE_SEARCH_REALITY_SUGGESTIONS = [
  { id: "reality:real", type: "reality", value: "real", label: "Real", detail: "Filtro de tipo" },
  { id: "reality:ficticio", type: "reality", value: "ficticio", label: "Ficticio", detail: "Filtro de tipo" },
];
const RESOURCE_SEARCH_MISSING_SUGGESTIONS = [
  { id: "missing:author", type: "missing", value: "author", label: "Sin persona", detail: "Faltante" },
  { id: "missing:artist", type: "missing", value: "artist", label: "Sin artist", detail: "Faltante" },
  { id: "missing:character", type: "missing", value: "character", label: "Sin character", detail: "Faltante" },
  { id: "missing:universe", type: "missing", value: "universe", label: "Sin universe", detail: "Faltante" },
];
const RECOMMENDATION_PAGE_SIZE = 24;
const NO_MISSING_FILTER = "none";
const BOORU_RESOURCE_DND_TYPE = "nexus.booru.resource-card";
const RESOURCE_PAGE_SIZE = 42;
const RESOURCE_GRID_COLUMNS = 6;
const RESOURCE_GRID_OVERSCAN_ROWS = 2;
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

function MediaThumbnail(props) {
  return (
    <MediaThumbnailComponent
      {...props}
      toFileUrl={toFileUrl}
      logger={booruViewLogger}
      mediaKindLabels={BOORU_MEDIA_KIND_LABELS}
    />
  );
}

function SingleEntityAutocompleteField(props) {
  return <SingleEntityAutocompleteFieldComponent {...props} invoke={invoke} helpers={{ findExactEntityMatch, stepSuggestionIndex }} entityKindLabels={BOORU_ENTITY_KIND_LABELS} />;
}

function EntityAutocompleteField(props) {
  return <EntityAutocompleteFieldComponent {...props} invoke={invoke} helpers={{ normalizeSelectedEntities, findExactEntityMatch, stepSuggestionIndex }} entityKindLabels={BOORU_ENTITY_KIND_LABELS} />;
}

function TagAutocompleteField(props) {
  return <TagAutocompleteFieldComponent {...props} invoke={invoke} helpers={{ normalizeSelectedTags, findExactTagMatch, stepSuggestionIndex }} />;
}

function RecommendationKindBadge(props) {
  return <RecommendationKindBadgeComponent {...props} helpers={{ getRecommendationKindBadgeLabel }} />;
}

function RecommendationEntityDropTarget(props) {
  return <RecommendationEntityDropTargetComponent {...props} useDrop={safeUseDrop} dndType={BOORU_RESOURCE_DND_TYPE} resolveDragIds={resolveDraggedResourceIds} logger={booruViewLogger} uniqueIds={uniqueIds} KindBadge={RecommendationKindBadge} Button={Button} helpers={{ getRecommendationItemKindClass, getRecommendationKindTooltip }} />;
}

function ResourceGrid(props) {
  return <ResourceGridComponent {...props} ResourceCard={ResourceGridCard} Pagination={ResourcePagination} getVirtualRange={getResourceVirtualRange} defaultColumns={RESOURCE_GRID_COLUMNS} />;
}

function ResourcePagination(props) {
  return <ResourcePaginationComponent {...props} Button={Button} clampPage={clampPageNumber} getPageWindow={getResourcePageWindow} />;
}

function ResourceGridCard(props) {
  return <ResourceGridCardComponent {...props} useDrag={safeUseDrag} dndType={BOORU_RESOURCE_DND_TYPE} emptyImage={getEmptyImage} logger={booruViewLogger} uniqueIds={uniqueIds} MediaPreview={MediaThumbnail} defaultColumns={RESOURCE_GRID_COLUMNS} />;
}

function RecommendationPanel(props) {
  return <RecommendationPanelComponent {...props} invoke={invoke} stepSuggestionIndex={stepSuggestionIndex} normalizeIds={uniqueIds} EntityDropTarget={RecommendationEntityDropTarget} KindBadge={RecommendationKindBadge} Button={Button} StateBlock={StateBlock} logger={booruViewLogger} logDuration={logRendererDuration} summarizeIds={summarizeIdsForLog} pageSize={RECOMMENDATION_PAGE_SIZE} helpers={{ getRecommendationItemKindClass, getRecommendationKindTooltip }} />;
}

function ResourceInspector(props) {
  return <ResourceInspectorComponent {...props} helpers={{ canSaveDraftProgress, formatDate, formatFileSize, getCommonScalar, getCommonItems, getCharacterUniverse, getDraftUniverseForCharacter, markDraftDirty, openPath, pruneCharacterUniverseAssignments, renderEntityChips, renderTagChips }} MediaPreview={MediaThumbnail} EntityField={EntityAutocompleteField} TagField={TagAutocompleteField} SingleEntityField={SingleEntityAutocompleteField} mediaKindLabels={BOORU_MEDIA_KIND_LABELS} classificationLabels={BOORU_CLASSIFICATION_LABELS} realityLabels={BOORU_REALITY_LABELS} realityOptions={BOORU_REALITY_OPTIONS} />;
}

function EntityProfileView(props) {
  return <EntityProfileViewComponent {...props} MediaPreview={MediaThumbnail} canUseVisual={canUseResourceAsEntityVisual} DataTab={EntityProfileDataTab} TagsTab={EntityProfileTagsTab} GalleryGrid={EntityProfileGalleryGrid} DownloadIcon={DownloadIcon} profileTabOptions={ENTITY_PROFILE_TAB_OPTIONS} resourceGridColumns={RESOURCE_GRID_COLUMNS} helpers={{ getInitials, entityKindLabels: BOORU_ENTITY_KIND_LABELS, isTextEntryElement, buildAvatarMediaStyle }} />;
}

function EntityProfileDataTab(props) {
  return <EntityProfileDataTabComponent {...props} SingleEntityField={SingleEntityAutocompleteField} helpers={{ formatDate, entityKindLabels: BOORU_ENTITY_KIND_LABELS }} />;
}

function EntityProfileTagsTab(props) {
  return <EntityProfileTagsTabComponent {...props} TagField={TagAutocompleteField} />;
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

function appendResourcePageItems(items, nextResources) {
  const nextItems = Array.isArray(nextResources) ? nextResources.filter(Boolean) : [];
  const nextById = new Map(nextItems.map((item) => [item.id, item]));
  const seenIds = new Set();
  const mergedItems = [];

  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item?.id || "").trim();

    if (!itemId || seenIds.has(itemId)) {
      continue;
    }

    seenIds.add(itemId);
    mergedItems.push(nextById.get(itemId) || item);
  }

  for (const item of nextItems) {
    const itemId = String(item?.id || "").trim();

    if (!itemId || seenIds.has(itemId)) {
      continue;
    }

    seenIds.add(itemId);
    mergedItems.push(item);
  }

  return mergedItems;
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
  const requestedTab = String(value?.tab || "").trim();
  const tab = ["gallery", "data", "tags"].includes(requestedTab) ? requestedTab : "gallery";

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
    descriptor?.originalStoragePath
    || descriptor?.cardOriginalStoragePath
    || descriptor?.storagePath
    || descriptor?.cardStoragePath
    || descriptor?.sampleStoragePath
    || descriptor?.cardPreviewPath
    || "",
  ).trim();
  const mediaKind = String(
    descriptor?.originalMediaKind
    || descriptor?.cardOriginalMediaKind
    || descriptor?.sampleMediaKind
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

function getResourceVirtualRange({
  itemCount,
  columns,
  rowHeight,
  scrollTop,
  viewportHeight,
}) {
  if (!itemCount || !columns || !rowHeight) {
    return {
      startIndex: 0,
      endIndex: itemCount,
    };
  }

  const totalRows = Math.ceil(itemCount / columns);
  const startRow = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - RESOURCE_GRID_OVERSCAN_ROWS,
  );
  const endRow = Math.min(
    totalRows,
    Math.ceil((scrollTop + Math.max(1, viewportHeight)) / rowHeight) + RESOURCE_GRID_OVERSCAN_ROWS,
  );

  return {
    startIndex: startRow * columns,
    endIndex: Math.min(itemCount, endRow * columns),
  };
}

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

function buildAvatarMediaStyle(layout) {
  const scale = Math.min(4, Math.max(0.2, Number(layout?.scale || 1)));
  const offsetX = Number(layout?.offsetX || 0);
  const offsetY = Number(layout?.offsetY || 0);

  return {
    transform: `translate(${offsetX * 100}%, ${offsetY * 100}%) scale(${scale})`,
    transformOrigin: "center center",
  };
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
  const [resourceState, setResourceState] = useState({
    items: [],
    totalCount: 0,
    hasMore: false,
    querySignature: "",
  });
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
  const [entityVisualCropState, setEntityVisualCropState] = useState(null);
  const [clipboardAssociationState, setClipboardAssociationState] = useState(null);
  const hoveredEntityRef = useRef(null);
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
  const [visibleResourceIds, setVisibleResourceIds] = useState([]);
  const entityProfileGalleryItems = Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [];
  const resourceQuery = useMemo(() => buildResourceQuery({
    searchTokens: normalizedResourceSearchTokens,
    mediaKindFilter: showClassificationSidebar ? resourceMediaKindFilter : "all",
    realityFilter: showClassificationSidebar ? resourceRealityFilter : "all",
    pendingMode: activeResourceSection === "pending" ? resourcePendingMode : "essential",
    missingFilter: NO_MISSING_FILTER,
  }), [
    activeResourceSection,
    resourceMediaKindFilter,
    resourcePendingMode,
    resourceRealityFilter,
    normalizedResourceSearchTokens,
    showClassificationSidebar,
  ]);
  const resourceQuerySignature = JSON.stringify(resourceQuery || {});
  const entityProfileKey = getEntityProfileKey(activeEntityProfile);
  const entityThumbnailPrimingEnabled = showEntityProfile && activeEntityProfile?.tab !== "data";
  const visibleResourceItems = useMemo(() => {
    if (activeResourceSection !== "media" || !visibleResourceIds.length) {
      return resourceItems;
    }

    const visibleIds = new Set(visibleResourceIds);
    return resourceItems.filter((item) => visibleIds.has(item.id));
  }, [activeResourceSection, resourceItems, visibleResourceIds]);
  const thumbnailPrimingItems = showResourceWorkspace
    ? visibleResourceItems
    : (entityThumbnailPrimingEnabled ? entityProfileGalleryItems : []);
  const mediaThumbnailPrimingItems = useMemo(
    () => activeResourceSection === "media"
      ? thumbnailPrimingItems.filter((item) => {
        const status = String(item?.thumbnail?.status || "").trim();
        return status !== "ready" && status !== "error";
      })
      : thumbnailPrimingItems,
    [activeResourceSection, thumbnailPrimingItems],
  );
  const currentEntityProfilePage = activeEntityKind
    ? clampPageNumber(entityProfilePageState?.[activeSection]?.page, Number.MAX_SAFE_INTEGER)
    : 1;
  const visibleThumbnailPrimingUnavailableRef = useRef(false);
  const primedResourcePageSignatureRef = useRef("");
  const primedMediaThumbnailIdsRef = useRef(new Set());
  const visibleResourceIdsRef = useRef([]);
  const mediaLoadMoreLockedRef = useRef(false);
  const mediaResourceRequestRef = useRef(null);
  const mediaThumbnailRefreshRef = useRef({
    inFlight: false,
    queued: false,
  });
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
  const currentResourcePageMatchesQuery = !showResourceWorkspace
    || String(resourcePageState?.[activeResourceSection]?.querySignature || "") === resourceQuerySignature;
  const handleVisibleResourceIdsChange = useCallback((nextIds) => {
    const normalizedIds = uniqueIds(nextIds);

    setVisibleResourceIds((currentIds) => (
      arraysEqual(currentIds, normalizedIds) ? currentIds : normalizedIds
    ));
  }, []);

  useEffect(() => {
    visibleResourceIdsRef.current = visibleResourceIds;
  }, [visibleResourceIds]);

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

    // Every resource section is incremental. A section/query transition must
    // always release the paging lock, not only the historical Media surface.
    mediaLoadMoreLockedRef.current = false;

    setResourcePageState((currentValue) => {
      const currentSectionState = currentValue[activeResourceSection];

      if (String(currentSectionState?.querySignature || "") === resourceQuerySignature) {
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
    // Every resource surface uses the same incremental transport. Page state
    // remains internal only so the existing IPC offset contract stays stable.
    const isInfiniteMedia = true;
    const activeMediaRequest = mediaResourceRequestRef.current;

    if (
      isInfiniteMedia
      && activeMediaRequest?.querySignature === resourceQuerySignature
      && !(normalizedRequestedPage === 1 && activeMediaRequest.page !== 1)
    ) {
      return;
    }

    const nextQuery = {
      section: activeResourceSection,
      query: resourceQuery,
      offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
      limit: RESOURCE_PAGE_SIZE,
    };
    const startedAt = performance.now();
    resourceRequestVersionRef.current += 1;
    const requestVersion = resourceRequestVersionRef.current;

    if (isInfiniteMedia) {
      mediaResourceRequestRef.current = {
        requestVersion,
        page: normalizedRequestedPage,
        querySignature: resourceQuerySignature,
      };
    }

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
        items: isInfiniteMedia
          && normalizedRequestedPage > 1
          && currentValue.querySignature === resourceQuerySignature
          ? appendResourcePageItems(currentValue.items, nextResources?.items)
          : (Array.isArray(nextResources?.items) ? nextResources.items : []),
        totalCount: Number(nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore),
        querySignature: resourceQuerySignature,
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
      if (mediaResourceRequestRef.current?.requestVersion === requestVersion) {
        mediaResourceRequestRef.current = null;
      }

      if (isInfiniteMedia && normalizedRequestedPage > 1) {
        mediaLoadMoreLockedRef.current = false;
      }

      if (resourceRequestVersionRef.current === requestVersion) {
        setResourceLoading(false);
      }
    }
  };

  const refreshVisibleMediaResources = async () => {
    if (activeResourceSection !== "media") {
      return;
    }

    const refreshState = mediaThumbnailRefreshRef.current;

    if (refreshState.inFlight) {
      refreshState.queued = true;
      return;
    }

    const resourceIds = uniqueIds(visibleResourceIdsRef.current);

    if (!resourceIds.length) {
      return;
    }

    refreshState.inFlight = true;

    try {
      const result = await invoke("booru:get-resources-by-ids", { resourceIds });
      const refreshedItems = Array.isArray(result?.items) ? result.items : [];

      if (refreshedItems.length) {
        setResourceState((currentValue) => ({
          ...currentValue,
          items: mergeResourcesIntoItems(currentValue.items, refreshedItems),
        }));
      }
    } catch (refreshError) {
      booruViewLogger.info(
        "booru.thumbnail.visible-refresh.error",
        "Booru no pudo actualizar las thumbnails visibles.",
        {
          resourceIds: summarizeIdsForLog(resourceIds),
          error: refreshError instanceof Error ? refreshError.message : String(refreshError || ""),
        },
      );
    } finally {
      refreshState.inFlight = false;

      if (refreshState.queued) {
        refreshState.queued = false;
        void refreshVisibleMediaResources();
      }
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

      setEntityProfileGalleryState((currentValue) => ({
        items: normalizedRequestedPage > 1
          ? appendResourcePageItems(currentValue.items, nextResources?.items)
          : (Array.isArray(nextResources?.items) ? nextResources.items : []),
        totalCount: Number(nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore),
      }));
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

    if (!currentResourcePageMatchesQuery) {
      return;
    }

    void loadResources({ requestedPage: currentResourcePage });
  }, [
    activeResourceSection,
    currentResourcePage,
    currentResourcePageMatchesQuery,
    resourceQuerySignature,
    showResourceWorkspace,
  ]);

  useEffect(() => {
    if (!showResourceWorkspace || !activeResourceSection || currentResourcePageMatchesQuery) {
      return;
    }

    setResourcePageState((currentValue) => ({
      ...currentValue,
      [activeResourceSection]: {
        page: 1,
        querySignature: resourceQuerySignature,
      },
    }));
  }, [
    activeResourceSection,
    currentResourcePageMatchesQuery,
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
          // Imports are sorted into the newest edge of every resource queue.
          // Reloading a later incremental page leaves that edge invisible,
          // most noticeably in Pendientes after a newly downloaded file.
          setResourcePageForSection(activeResourceSection, 1);
          void loadResources({ requestedPage: 1 });
        }
        if (showEntityProfile && activeEntityProfile?.tab !== "data") {
          // A watcher import belongs at the newest edge of this gallery. Reset
          // its incremental cursor before reloading so the newly associated
          // fast-classification resource is visible without reopening the profile.
          setEntityProfilePageForSection(activeSection, 1);
          void loadEntityProfileGallery({ requestedPage: 1 });
        }
        if (showEntityProfile) {
          void loadEntityProfile();
        }
        void loadSnapshot({ silent: true, reason: "state:resources" });
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.thumbnailsVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio una actualizacion de thumbnails.",
          {
            key: "thumbnailsVersion",
            ...diagnosticsContextRef.current,
          },
        );

        if (activeResourceSection === "media") {
          void refreshVisibleMediaResources();
        }
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
          if (activeResourceSection === "media") {
            setResourcePageForSection(activeResourceSection, 1);
            void loadResources({ requestedPage: 1 });
          } else {
            void loadResources({ requestedPage: currentResourcePage });
          }
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
    const isInfiniteMedia = activeResourceSection === "media";
    const itemsToPrime = isInfiniteMedia
      ? mediaThumbnailPrimingItems.filter((item) => !primedMediaThumbnailIdsRef.current.has(item.id))
      : thumbnailPrimingItems;
    const primingSignature = JSON.stringify({
      section: activeSection,
      mode: showResourceWorkspace ? "resource-section" : (entityThumbnailPrimingEnabled ? "entity-profile" : "idle"),
      page: showResourceWorkspace ? currentResourcePage : currentEntityProfilePage,
      querySignature: showResourceWorkspace ? resourceQuerySignature : entityProfileKey,
      ids: itemsToPrime.map((item) => item.id),
    });

    if (
      !itemsToPrime.length
      || !supportsVisibleThumbnailPriming
      || visibleThumbnailPrimingUnavailableRef.current
      || (!isInfiniteMedia && primedResourcePageSignatureRef.current === primingSignature)
    ) {
      return;
    }

    if (isInfiniteMedia) {
      itemsToPrime.forEach((item) => primedMediaThumbnailIdsRef.current.add(item.id));
    } else {
      primedResourcePageSignatureRef.current = primingSignature;
    }
    booruViewLogger.debug(
      "booru.thumbnail-prime.start",
      "Booru priorizo thumbnails visibles sin repetir las que ya estan listas.",
      {
        mode: showResourceWorkspace ? "resource-section" : "entity-profile",
        section: activeSection,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        itemCount: itemsToPrime.length,
        sampleIds: summarizeIdsForLog(itemsToPrime),
      },
    );
    void invoke("booru:prime-visible-thumbnails", {
      resourceIds: itemsToPrime.map((item) => item.id),
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
          itemCount: itemsToPrime.length,
          sampleIds: summarizeIdsForLog(itemsToPrime),
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
    mediaThumbnailPrimingItems,
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

  const loadNextMediaPage = () => {
    if (
      !resourceState.hasMore
      || resourceLoading
      || mediaLoadMoreLockedRef.current
    ) {
      return;
    }

    mediaLoadMoreLockedRef.current = true;
    const nextPage = currentResourcePage + 1;
    setResourcePageForSection(activeResourceSection, nextPage);
    // Do not depend exclusively on the page-state effect to start this
    // request. A runtime invalidation can replace that state in the same
    // render turn, leaving the grid stuck after its first loaded page.
    void loadResources({ requestedPage: nextPage });
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

  const loadNextEntityProfileGalleryPage = () => {
    if (
      !showEntityProfile
      || !entityProfileGalleryState.hasMore
      || entityProfileGalleryLoading
    ) {
      return;
    }
    setEntityProfilePageForSection(activeSection, currentEntityProfilePage + 1);
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

  const openEntityProfileResourceContextMenu = (item, event, selectedIds = [item?.id]) => {
    if (!showEntityProfile || !activeEntityKind || !activeEntityProfile?.id || !item?.id) {
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
        ...(canUseResourceAsEntityVisual(item) ? [
          { id: "set-avatar", label: "Usar como perfil" },
          { id: "set-banner", label: "Usar como banner" },
        ] : []),
        { id: "disassociate-profile", label: selectedIds.length > 1 ? "Desasociar seleccion de esta entidad" : "Desasociar de esta entidad" },
      ],
      resourceIds: uniqueIds(selectedIds),
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

  const openEntityProfileVisualContextMenu = (visualRole, descriptor, event) => {
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
        ...(canUseResourceForImageActions(contextResource) ? [
          { id: "copy", label: "Copiar al portapapeles" },
          { id: "google", label: "Buscar en Google" },
        ] : []),
        { id: "adjust-visual", label: "Ajustar" },
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource],
      visualRole,
      entityKind: activeEntityKind,
      entityId: activeEntityProfile?.id,
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
    const contextIds = uniqueIds([
      ...(Array.isArray(contextMenuState?.resourceIds) ? contextMenuState.resourceIds : []),
      ...contextResources.map((resource) => resource.id),
    ]);
    const singleResource = contextResources.length === 1 ? contextResources[0] : null;
    const contextEntityKind = String(contextMenuState?.entityKind || "").trim();
    const contextEntityId = String(contextMenuState?.entityId || "").trim();
    const contextVisualRole = String(contextMenuState?.visualRole || "").trim();
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

      if (actionId === "adjust-visual" && singleResource && contextEntityKind && contextEntityId && (contextVisualRole === "avatar" || contextVisualRole === "banner")) {
        setEntityVisualCropState({
          kind: contextEntityKind,
          entityId: contextEntityId,
          role: contextVisualRole,
          source: { pathValue: singleResource.storagePath, mediaKind: singleResource.mediaKind },
          initialLayout: entityProfile?.visualSettings?.[contextVisualRole] || null,
        });
        return;
      }

      if (actionId === "disassociate-profile" && contextEntityKind && contextEntityId && contextIds.length) {
        setEntityBusy(true);
        const result = await invoke("booru:disassociate-resources-from-entity", {
          kind: contextEntityKind,
          entityId: contextEntityId,
          resourceIds: contextIds,
        });
        if (result?.profile) setEntityProfile(result.profile);
        setEntityProfileGalleryState((current) => ({
          ...current,
          items: (current?.items || []).filter((item) => !contextIds.includes(item.id)),
        }));
        setEntityRevision((current) => current + 1);
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
      setEntityBusy(false);
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

  const importClipboardMedia = async (association) => {
    if (!association || entityBusy) return;
    setEntityBusy(true);

    try {
      const tempFilePath = await window.nexus.clipboard.exportMediaToTempFile("booru-media");
      const result = await invoke("booru:paste-clipboard-media", {
        tempFilePath,
        association,
      });

      setSnapshot(result?.snapshot || snapshot);
      if (result?.profile) {
        setEntityProfile(result.profile);
      }
      setEntityError("");
      setEntityProfileError("");
      setClipboardAssociationState(null);
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

  const handlePasteClipboardImageToEntity = async () => {
    if (!showEntityProfile || !activeEntityKind || !activeEntityProfile?.id) return;
    await importClipboardMedia({ kind: activeEntityKind, entityId: activeEntityProfile.id });
  };

  const handleClipboardPasteShortcut = (event) => {
    if (
      event.defaultPrevented
      || !(event.ctrlKey || event.metaKey)
      || event.altKey
      || String(event.key || "").toLowerCase() !== "v"
      || isTextEntryElement(event.target)
      || entityBusy
    ) return;
    event.preventDefault();
    event.stopPropagation();

    if (showEntityProfile && activeEntityKind && activeEntityProfile?.id) {
      void importClipboardMedia({ kind: activeEntityKind, entityId: activeEntityProfile.id });
      return;
    }

    const hoveredEntity = hoveredEntityRef.current;
    if (hoveredEntity?.id && hoveredEntity?.kind) {
      void importClipboardMedia({ kind: hoveredEntity.kind, entityId: hoveredEntity.id });
      return;
    }
    setClipboardAssociationState({ defaultKind: activeEntityKind || "author" });
  };

  useEffect(() => {
    // WorkspacePage only receives keyboard events while it owns focus. Capture
    // on window keeps Ctrl/Cmd+V reliable after pointer-only navigation and
    // still leaves editable fields untouched through the guard above.
    window.addEventListener("keydown", handleClipboardPasteShortcut, true);
    return () => window.removeEventListener("keydown", handleClipboardPasteShortcut, true);
  }, [
    activeEntityKind,
    activeEntityProfile?.id,
    entityBusy,
    showEntityProfile,
  ]);

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

    const normalizedTab = ["gallery", "data", "tags"].includes(nextTab) ? nextTab : "gallery";
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
                  onOpenPath={openPath}
                />
              </div>
            )}
          </ScrollRegion>
        </WorkspaceBody>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage className="booruView" onKeyDownCapture={handleClipboardPasteShortcut}>
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
                          invoke={invoke}
                          realitySuggestions={RESOURCE_SEARCH_REALITY_SUGGESTIONS}
                          missingSuggestions={RESOURCE_SEARCH_MISSING_SUGGESTIONS}
                          helpers={{
                            normalizeResourceSearchTokens,
                            buildResourceSearchTokenKey,
                            parseResourceSearchDraft,
                            normalizeSearchText,
                            normalizeResourceSearchToken,
                            createResourceSearchTokenFromSuggestion,
                            createResourceSearchTokenFromFragment,
                            tokenizeBooruQuery,
                            getResourceQueryTokenClass,
                            buildResourceQueryTokenLabel,
                            stepSuggestionIndex,
                          }}
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
                    scrollKey={`${activeResourceSection}:${resourceQuerySignature}:${resourceSearchTokensSignature}`}
                    infinite
                    hasMore={resourceState.hasMore}
                    onLoadMore={loadNextMediaPage}
                    onVisibleItemsChange={handleVisibleResourceIdsChange}
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
                      onExcludeTag={async (tag) => {
                        if (!activeResource?.id || !tag?.id) return;
                        const result = await invoke("booru:exclude-resource-tag", { resourceId: activeResource.id, tagId: tag.id });
                        if (result?.resource?.id) {
                          setResourceState((current) => ({
                            ...current,
                            items: (current?.items || []).map((item) => item.id === result.resource.id ? result.resource : item),
                          }));
                        }
                      }}
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
                          entityMutationBusy={entityBusy}
                          universeCharacterCreateValue={universeCharacterCreateValue}
                          onLoadMoreGallery={loadNextEntityProfileGalleryPage}
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
                            onEntityHover={(kind, item) => {
                              hoveredEntityRef.current = item ? { kind, id: item.id } : null;
                            }}
                            MediaPreview={MediaThumbnail}
                            entityKindLabels={BOORU_ENTITY_KIND_LABELS}
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
                        onEntityHover={(kind, item) => {
                          hoveredEntityRef.current = item ? { kind, id: item.id } : null;
                        }}
                        MediaPreview={MediaThumbnail}
                        entityKindLabels={BOORU_ENTITY_KIND_LABELS}
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
          MediaPreview={MediaThumbnail}
          mediaKindLabels={BOORU_MEDIA_KIND_LABELS}
        />
        {entityVisualCropState ? (
          <div className="booruView__cropOverlay">
            <EntityVisualCropper
              {...entityVisualCropState}
              onSaved={(profile) => {
                if (profile) setEntityProfile(profile);
                setEntityVisualCropState(null);
              }}
              onCancel={() => setEntityVisualCropState(null)}
            />
          </div>
        ) : null}
        <BooruDragPreviewLayer
          resourcesById={dragPreviewResourcesById}
          customDragState={customDragState}
          MediaPreview={MediaThumbnail}
          getPreviewStyles={getDragPreviewStyles}
          resolveDragIds={resolveDraggedResourceIds}
          useDragLayer={safeUseDragLayer}
          dndType={BOORU_RESOURCE_DND_TYPE}
        />
        {clipboardAssociationState ? (
          <ClipboardAssociationComposer
            defaultKind={clipboardAssociationState.defaultKind}
            onCancel={() => setClipboardAssociationState(null)}
            onConfirm={importClipboardMedia}
          />
        ) : null}
      </WorkspaceBody>
    </WorkspacePage>
  );
}
