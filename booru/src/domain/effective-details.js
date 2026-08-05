const CHIP_FIELDS = Object.freeze([
  ["author", "authors"],
  ["artist", "artists"],
  ["character", "characters"],
]);

function normalizeItems(value) {
  return (Array.isArray(value) ? value : []).filter((item) => item?.id);
}

function commonItems(resources, field) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);
  if (!normalizedResources.length) return [];
  const firstItems = normalizeItems(normalizedResources[0]?.[field]);
  return firstItems.filter((item) => normalizedResources.every((resource) => (
    normalizeItems(resource?.[field]).some((candidate) => candidate.id === item.id)
  )));
}

function createChip(item, kind, field, persisted = true) {
  return {
    id: item.id,
    kind,
    field,
    label: String(item.displayName || item.name || item.label || "").trim(),
    persisted,
  };
}

export function buildBooruEffectiveDetailChips(resources = [], draft = null) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);
  const chips = [];

  for (const [kind, field] of CHIP_FIELDS) {
    const persistedIds = new Set(commonItems(normalizedResources, field).map((item) => item.id));
    normalizeItems(draft?.[field]).forEach((item) => {
      chips.push(createChip(item, kind, field, persistedIds.has(item.id)));
    });
  }

  const persistedUniverses = commonItems(normalizedResources, "universes");
  const persistedUniverseIds = new Set(persistedUniverses.map((item) => item.id));
  const directUniverseIds = new Set(commonItems(normalizedResources, "directUniverses").map((item) => item.id));
  const draftUniverses = normalizeItems(draft?.universes);
  const universeById = new Map(
    persistedUniverses
      .filter((item) => !directUniverseIds.has(item.id))
      .map((item) => [item.id, item]),
  );
  draftUniverses.forEach((item) => universeById.set(item.id, item));
  universeById.forEach((item) => {
    chips.push(createChip(item, "universe", "universes", persistedUniverseIds.has(item.id)));
  });

  const persistedTags = commonItems(normalizedResources, "tags");
  const persistedTagIds = new Set(persistedTags.map((item) => item.id));
  const directTagIds = new Set(commonItems(normalizedResources, "manualTags").map((item) => item.id));
  const tagById = new Map(
    persistedTags
      .filter((item) => !directTagIds.has(item.id))
      .map((item) => [item.id, item]),
  );
  normalizeItems(draft?.manualTags).forEach((item) => tagById.set(item.id, item));
  tagById.forEach((item) => {
    chips.push(createChip(item, "tag", "manualTags", persistedTagIds.has(item.id)));
  });

  return chips.filter((chip) => chip.label);
}
