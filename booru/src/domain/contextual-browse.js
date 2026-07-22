export const BOORU_BROWSE_DIRECTIONS = Object.freeze({ ASC: "asc", DESC: "desc" });
export const BOORU_BROWSE_GROUPINGS = Object.freeze({ CONTINUOUS: "continuous", SECTIONED: "sectioned" });

export const BOORU_RESOURCE_SORT_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha de integracion" },
  { value: "author", label: "Persona" },
  { value: "character", label: "Character" },
  { value: "universe", label: "Universe" },
  { value: "artist", label: "Artist" },
  { value: "tag", label: "Tag plana" },
  { value: "random", label: "Aleatorio" },
]);

export const BOORU_RESOURCE_GROUP_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha" },
  { value: "author", label: "Persona" },
  { value: "character", label: "Character" },
  { value: "universe", label: "Universe" },
  { value: "artist", label: "Artist" },
]);

export const BOORU_RESOURCE_GROUP_ORDER_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha de integración" },
  { value: "alphabetical", label: "Alfabético" },
]);

export const BOORU_ENTITY_SORT_OPTIONS = Object.freeze([
  { value: "name", label: "Nombre" },
  { value: "createdAt", label: "Fecha de creacion" },
  { value: "resourceCount", label: "Cantidad de recursos" },
  { value: "random", label: "Aleatorio" },
]);

const RESOURCE_SORTS = new Set(BOORU_RESOURCE_SORT_OPTIONS.map((option) => option.value));
const RESOURCE_GROUPS = new Set(BOORU_RESOURCE_GROUP_OPTIONS.map((option) => option.value));
const RESOURCE_GROUP_ORDERS = new Set(BOORU_RESOURCE_GROUP_ORDER_OPTIONS.map((option) => option.value));
const ENTITY_SORTS = new Set([...BOORU_ENTITY_SORT_OPTIONS.map((option) => option.value), "universe"]);

export function normalizeBooruFreeTextTerms(value) {
  const source = Array.isArray(value) ? value : String(value || "").match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
  const terms = [];
  const seen = new Set();

  for (const candidate of source) {
    const term = String(candidate || "")
      .trim()
      .replace(/^"|"$/g, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es-AR");
    if (!term || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }

  return terms;
}

export function createBooruRandomSeed() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function normalizeBooruBrowseQuery(value = null, family = "resource", allowUniverseSort = false) {
  const isEntity = family === "entity";
  const allowedSorts = isEntity ? ENTITY_SORTS : RESOURCE_SORTS;
  const fallbackSort = isEntity ? "name" : "importedAt";
  const fallbackDirection = isEntity ? "asc" : "desc";
  let sortBy = allowedSorts.has(String(value?.sortBy || "")) ? String(value.sortBy) : fallbackSort;
  if (sortBy === "universe" && (!isEntity || !allowUniverseSort)) sortBy = fallbackSort;
  const direction = value?.direction === "asc" || value?.direction === "desc"
    ? value.direction
    : fallbackDirection;
  const randomSeed = String(value?.randomSeed || "").trim() || "booru-stable";
  const grouping = sortBy === "random"
    ? "continuous"
    : (value?.grouping === "sectioned" ? "sectioned" : "continuous");

  let groupBy = String(value?.groupBy || "").trim();
  if (isEntity) {
    if (!ENTITY_SORTS.has(groupBy) || groupBy === "random") {
      groupBy = grouping === "sectioned" && sortBy !== "random" ? sortBy : "name";
    }
    if (groupBy === "universe" && !allowUniverseSort) groupBy = "name";
  } else if (!RESOURCE_GROUPS.has(groupBy)) {
    groupBy = grouping === "sectioned" && RESOURCE_GROUPS.has(sortBy) ? sortBy : "importedAt";
  }

  const groupOrderBy = RESOURCE_GROUP_ORDERS.has(String(value?.groupOrderBy || ""))
    ? String(value.groupOrderBy)
    : (isEntity ? "alphabetical" : "importedAt");

  return { sortBy, direction, grouping, randomSeed, groupBy, groupOrderBy };
}

export function getBooruEntitySortOptions({ allowUniverseSort = false } = {}) {
  return [
    ...BOORU_ENTITY_SORT_OPTIONS.slice(0, 3),
    ...(allowUniverseSort ? [{ value: "universe", label: "Universe" }] : []),
    BOORU_ENTITY_SORT_OPTIONS.at(-1),
  ];
}

function compareText(left, right) {
  return String(left || "").localeCompare(String(right || ""), "es-AR", { sensitivity: "base", numeric: true });
}

function seededRank(id, seed) {
  const value = `${seed}:${id}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function firstName(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => String(item?.displayName || item?.name || "").trim())
    .filter(Boolean)
    .sort(compareText)[0] || "";
}

function getResourceSortValue(item, sortBy) {
  if (sortBy === "author") return firstName(item?.authors);
  if (sortBy === "artist") return firstName(item?.artists);
  if (sortBy === "character") return firstName(item?.characters);
  if (sortBy === "universe") return firstName(item?.universes);
  if (sortBy === "tag") return firstName(item?.manualTags);
  return String(item?.importedAt || "");
}

function getEntitySortValue(item, sortBy) {
  if (sortBy === "createdAt") return String(item?.createdAt || "");
  if (sortBy === "resourceCount") return Number(item?.resourceCount || 0);
  if (sortBy === "universe") return String(item?.universe?.displayName || "");
  return String(item?.displayName || "");
}

export function sortBooruBrowseItems(items = [], browseValue = null, family = "resource", allowUniverseSort = false) {
  const browse = normalizeBooruBrowseQuery(browseValue, family, allowUniverseSort);
  if (family === "resource" && browse.grouping === "sectioned") {
    return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
      const importedDifference = compareText(right?.importedAt, left?.importedAt);
      return importedDifference || compareText(left?.id, right?.id);
    });
  }
  const direction = browse.direction === "desc" ? -1 : 1;
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    if (browse.sortBy === "random") {
      const rankDifference = seededRank(left?.id, browse.randomSeed) - seededRank(right?.id, browse.randomSeed);
      if (rankDifference) return rankDifference;
    } else {
      const leftValue = family === "entity" ? getEntitySortValue(left, browse.sortBy) : getResourceSortValue(left, browse.sortBy);
      const rightValue = family === "entity" ? getEntitySortValue(right, browse.sortBy) : getResourceSortValue(right, browse.sortBy);
      const missingDifference = Number(!leftValue && leftValue !== 0) - Number(!rightValue && rightValue !== 0);
      if (missingDifference) return missingDifference * direction;
      const valueDifference = typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue - rightValue
        : compareText(leftValue, rightValue);
      if (valueDifference) return valueDifference * direction;
    }
    return compareText(left?.id, right?.id);
  });
}

function initialBucket(value) {
  const first = String(value || "").trim().charAt(0).toLocaleUpperCase("es-AR");
  if (/\d/.test(first)) return { key: "initial:0-9", label: "0-9", rank: 1 };
  if (/\p{L}/u.test(first)) return { key: `initial:${first}`, label: first, rank: 0 };
  return { key: "initial:#", label: "#", rank: 2 };
}

function dateBucket(value, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { key: "date:missing", label: "Sin fecha", rank: 6 };
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.floor((startToday.getTime() - startDate.getTime()) / 86400000);
  if (dayDifference <= 0) return { key: "date:today", label: "Hoy", rank: 0 };
  if (dayDifference === 1) return { key: "date:yesterday", label: "Ayer", rank: 1 };
  if (dayDifference < 7) return { key: "date:week", label: "Ultimos 7 dias", rank: 2 };
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return { key: "date:month", label: "Este mes", rank: 3 };
  if (date.getFullYear() === now.getFullYear()) return { key: "date:year", label: "Este ano", rank: 4 };
  return { key: "date:older", label: "Anteriores", rank: 5 };
}

function countBucket(value) {
  const count = Math.max(0, Number(value || 0));
  if (!count) return { key: "count:0", label: "0", rank: 0 };
  if (count < 10) return { key: "count:1-9", label: "1-9", rank: 1 };
  if (count < 50) return { key: "count:10-49", label: "10-49", rank: 2 };
  if (count < 100) return { key: "count:50-99", label: "50-99", rank: 3 };
  return { key: "count:100+", label: "100+", rank: 4 };
}

function exactBuckets(values, missingLabel, includeMissing = true, associationKind = "") {
  const entries = Array.from(new Map((Array.isArray(values) ? values : [])
    .map((item) => ({
      id: String(item?.id || "").trim(),
      name: String(item?.displayName || item?.name || "").trim(),
    }))
    .filter((item) => item.name)
    .map((item) => [`${item.id || item.name.normalize("NFKC").toLocaleLowerCase("es-AR")}`, item])).values())
    .sort((left, right) => compareText(left.name, right.name));
  return entries.length
    ? entries.map((entry) => ({
      key: `value:${associationKind || "text"}:${entry.id || entry.name.normalize("NFKC").toLocaleLowerCase("es-AR")}`,
      label: entry.name,
      rank: 0,
      association: associationKind && entry.id ? { kind: associationKind, entityId: entry.id } : null,
    }))
    : (includeMissing ? [{ key: `missing:${missingLabel}`, label: `Sin ${missingLabel}`, rank: 1 }] : []);
}

function resourceBuckets(item, groupBy, now) {
  if (groupBy === "importedAt") return [dateBucket(item?.importedAt, now)];
  if (groupBy === "author") return exactBuckets(item?.authors, "Persona", false, "author");
  if (groupBy === "artist") return exactBuckets(item?.artists, "Artist", false, "artist");
  if (groupBy === "character") return exactBuckets(item?.characters, "Character", false, "character");
  if (groupBy === "universe") return exactBuckets(item?.universes, "Universe", false, "universe");
  return [];
}

function entityBuckets(item, sortBy, now) {
  if (sortBy === "name") return [initialBucket(item?.displayName)];
  if (sortBy === "createdAt") return [dateBucket(item?.createdAt, now)];
  if (sortBy === "resourceCount") return [countBucket(item?.resourceCount)];
  if (sortBy === "universe") return exactBuckets(item?.universe ? [item.universe] : [], "Universe", true, "universe");
  return [];
}

export function createBooruGroupedPlacements(items = [], browseValue = null, family = "resource", allowUniverseSort = false, now = new Date()) {
  const browse = normalizeBooruBrowseQuery(browseValue, family, allowUniverseSort);
  if (browse.grouping !== "sectioned" || browse.sortBy === "random") return [];
  const sortedItems = sortBooruBrowseItems(items, browse, family, allowUniverseSort);
  const groupMap = new Map();

  for (const item of sortedItems) {
    const buckets = family === "entity"
      ? entityBuckets(item, browse.groupBy, now)
      : resourceBuckets(item, browse.groupBy, now);
    for (const bucket of buckets) {
      if (!groupMap.has(bucket.key)) groupMap.set(bucket.key, {
        ...bucket,
        newestImportedAt: "",
        placements: [],
      });
      const group = groupMap.get(bucket.key);
      if (family === "resource" && compareText(item?.importedAt, group.newestImportedAt) > 0) {
        group.newestImportedAt = String(item?.importedAt || "");
      }
      group.placements.push({
        placementId: `${bucket.key}:${item.id}`,
        resourceId: family === "resource" ? item.id : null,
        entityId: family === "entity" ? item.id : null,
        groupKey: bucket.key,
        groupLabel: bucket.label,
        association: bucket.association || null,
      });
    }
  }

  const directionFactor = browse.direction === "desc" ? -1 : 1;
  const groups = Array.from(groupMap.values()).sort((left, right) => {
    if (family === "resource") {
      const valueDifference = browse.groupOrderBy === "alphabetical"
        ? compareText(left.label, right.label)
        : compareText(left.newestImportedAt, right.newestImportedAt);
      if (valueDifference) return valueDifference * directionFactor;
      return compareText(left.label, right.label) * directionFactor;
    }

    const dateSort = browse.groupBy === "createdAt";
    const entityDirectionFactor = directionFactor * (dateSort ? -1 : 1);
    if (left.rank !== right.rank) return (left.rank - right.rank) * entityDirectionFactor;
    return compareText(left.label, right.label) * entityDirectionFactor;
  });
  return groups.flatMap((group) => group.placements);
}

export function createBooruIncrementalBrowseResult(items = [], browseValue = null, options = {}) {
  const family = options.family === "entity" ? "entity" : "resource";
  const allowUniverseSort = Boolean(options.allowUniverseSort);
  const offset = Math.max(0, Number(options.offset || 0));
  const limit = Math.max(1, Number(options.limit || 42));
  const browse = normalizeBooruBrowseQuery(browseValue, family, allowUniverseSort);
  const groupableItems = family === "resource" && browse.grouping === "sectioned"
    ? (Array.isArray(items) ? items : []).filter((item) => resourceBuckets(item, browse.groupBy, options.now).length > 0)
    : items;
  const sortedItems = sortBooruBrowseItems(groupableItems, browse, family, allowUniverseSort);
  const allPlacements = createBooruGroupedPlacements(sortedItems, browse, family, allowUniverseSort, options.now);

  if (!allPlacements.length) {
    const pageItems = sortedItems.slice(offset, offset + limit);
    return {
      browse,
      items: pageItems,
      placements: [],
      totalCount: sortedItems.length,
      placementCount: sortedItems.length,
      hasMore: offset + pageItems.length < sortedItems.length,
    };
  }

  const pagePlacements = allPlacements.slice(offset, offset + limit);
  const pageIds = new Set(pagePlacements.map((placement) => family === "entity" ? placement.entityId : placement.resourceId));
  return {
    browse,
    items: sortedItems.filter((item) => pageIds.has(item.id)),
    placements: pagePlacements,
    totalCount: sortedItems.length,
    placementCount: allPlacements.length,
    hasMore: offset + pagePlacements.length < allPlacements.length,
  };
}
