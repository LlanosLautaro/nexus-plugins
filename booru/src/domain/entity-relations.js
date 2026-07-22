const ENTITY_RELATION_TARGETS = Object.freeze({
  author: Object.freeze([]),
  character: Object.freeze(["artist"]),
  artist: Object.freeze(["character", "universe"]),
  universe: Object.freeze(["character", "artist"]),
});

const ENTITY_RELATION_TABS = Object.freeze({
  artist: "artists",
  character: "characters",
  universe: "universes",
});

const ENTITY_RELATION_LABELS = Object.freeze({
  artist: "Artists",
  character: "Characters",
  universe: "Universes",
});

export function getBooruEntityRelationTargets(sourceKind) {
  return [...(ENTITY_RELATION_TARGETS[String(sourceKind || "").trim()] || [])];
}

export function getBooruEntityRelationKindFromTab(sourceKind, tab) {
  const normalizedTab = String(tab || "").trim();
  return getBooruEntityRelationTargets(sourceKind)
    .find((targetKind) => ENTITY_RELATION_TABS[targetKind] === normalizedTab) || null;
}

export function getBooruEntityProfileTabOptions(sourceKind) {
  return [
    { value: "gallery", label: "Galeria" },
    ...getBooruEntityRelationTargets(sourceKind).map((targetKind) => ({
      value: ENTITY_RELATION_TABS[targetKind],
      label: ENTITY_RELATION_LABELS[targetKind],
      relationKind: targetKind,
    })),
    { value: "data", label: "Datos" },
    { value: "tags", label: "Tags" },
  ];
}

export function normalizeBooruEntityRelationRequest(value = null) {
  const sourceKind = String(value?.sourceKind || "").trim();
  const sourceId = String(value?.sourceId || "").trim();
  const relationKind = String(value?.relationKind || "").trim();
  const query = String(value?.query || "").trim();
  const rawOffset = Number(value?.offset);
  const rawLimit = Number(value?.limit);
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(500, Math.floor(rawLimit))
    : 42;
  const allowUniverseSort = relationKind === "character" && sourceKind !== "universe";
  const browse = normalizeBooruBrowseQuery(value, "entity", allowUniverseSort);

  if (
    !sourceId
    || !getBooruEntityRelationTargets(sourceKind).includes(relationKind)
  ) {
    return null;
  }

  return {
    sourceKind,
    sourceId,
    relationKind,
    query,
    offset,
    limit,
    allowUniverseSort,
    ...browse,
    exactFilters: Array.isArray(value?.exactFilters) ? value.exactFilters.filter(Boolean) : [],
  };
}

export function createBooruIncrementalEntityResult(items = [], request = null) {
  const normalizedItems = Array.isArray(items) ? items.filter((item) => item?.id) : [];
  const incremental = createBooruIncrementalBrowseResult(normalizedItems, request, {
    family: "entity",
    allowUniverseSort: Boolean(request?.allowUniverseSort),
    offset: request?.offset,
    limit: request?.limit,
  });

  return {
    sourceKind: request?.sourceKind || null,
    sourceId: request?.sourceId || null,
    relationKind: request?.relationKind || null,
    query: request?.query || "",
    ...incremental,
  };
}
import { createBooruIncrementalBrowseResult, normalizeBooruBrowseQuery } from "./contextual-browse.js";
