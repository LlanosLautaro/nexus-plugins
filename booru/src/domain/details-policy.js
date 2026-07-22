import { getBooruRecommendationKindOrder } from "./classification-policy.js";

const DETAILS_FIELD_CONFIG = Object.freeze({
  author: Object.freeze({
    kind: "author",
    field: "authors",
    label: "Persona",
  }),
  artist: Object.freeze({
    kind: "artist",
    field: "artists",
    label: "Artists",
  }),
  character: Object.freeze({
    kind: "character",
    field: "characters",
    label: "Characters",
  }),
  universe: Object.freeze({
    kind: "universe",
    field: "universes",
    label: "Universes",
  }),
});

const DETAILS_RELATION_KEYS = Object.freeze({
  authors: "authors",
  artists: "artists",
  characters: "characters",
  universes: "directUniverses",
  manualTags: "manualTags",
});

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function normalizedItemIds(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => String(item?.id || "").trim())
    .filter(Boolean)
    .sort();
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hasMixedRelations(resources, resourceKey) {
  const reference = normalizedItemIds(resources[0]?.[resourceKey]);
  return resources.slice(1).some((resource) => !arraysEqual(reference, normalizedItemIds(resource?.[resourceKey])));
}

export function getBooruDetailsMixedFields(resources) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);

  if (normalizedResources.length < 2) {
    return [];
  }

  const mixedFields = [];
  const referenceReality = normalizedResources[0]?.reality ?? null;

  if (normalizedResources.slice(1).some((resource) => (resource?.reality ?? null) !== referenceReality)) {
    mixedFields.push("reality");
  }

  for (const [fieldName, resourceKey] of Object.entries(DETAILS_RELATION_KEYS)) {
    if (hasMixedRelations(normalizedResources, resourceKey)) {
      mixedFields.push(fieldName);
    }
  }

  return mixedFields;
}

export function getBooruDetailsPriorityContext(draft = null) {
  if (hasItems(draft?.authors)) {
    return "author";
  }

  if (hasItems(draft?.characters)) {
    return "character";
  }

  if (hasItems(draft?.artists)) {
    return "artist";
  }

  if (hasItems(draft?.universes)) {
    return "universe";
  }

  if (draft?.reality === "real" || draft?.reality === "ficticio") {
    return draft.reality;
  }

  return "default";
}

function getFieldDescription(kind, reality) {
  if (kind === "author") {
    return reality === "real"
      ? "Obligatoria para completar la ruta Real."
      : "Persona presente en el recurso.";
  }

  if (kind === "character") {
    return reality === "ficticio"
      ? "Obligatorio para completar la ruta Ficticio; cada Character conserva su Universe."
      : "Character presente en el recurso.";
  }

  if (kind === "universe") {
    return "Universe asociado directamente; el de cada Character se conserva como relación estructural.";
  }

  return reality === "ficticio"
    ? "Obligatorio para completar la ruta Ficticio."
    : "Artist presente en el recurso.";
}

export function getBooruDetailsFieldSchema(draft = null) {
  const reality = draft?.reality === "real" || draft?.reality === "ficticio"
    ? draft.reality
    : null;
  const context = getBooruDetailsPriorityContext(draft);

  return getBooruRecommendationKindOrder(context).map((kind) => {
    const config = DETAILS_FIELD_CONFIG[kind];
    return {
      ...config,
      required: (kind === "author" && reality === "real")
        || ((kind === "character" || kind === "artist") && reality === "ficticio"),
      description: getFieldDescription(kind, reality),
    };
  });
}

export function getBooruDetailsRealityState(draft = null) {
  const mixedFields = new Set(Array.isArray(draft?.mixedFields) ? draft.mixedFields : []);
  const hasDeterminingEntity = hasItems(draft?.authors)
    || hasItems(draft?.characters)
    || hasItems(draft?.artists)
    || mixedFields.has("authors")
    || mixedFields.has("characters")
    || mixedFields.has("artists");
  const value = draft?.reality === "real" || draft?.reality === "ficticio"
    ? draft.reality
    : null;
  const mixed = mixedFields.has("reality");

  return {
    mode: hasDeterminingEntity ? "readonly" : "editable",
    value,
    mixed,
    source: draft?.realitySource === "manual" ? "manual" : "auto",
    label: mixed ? "Valores mixtos" : value === "real" ? "Real" : value === "ficticio" ? "Ficticio" : "Sin definir",
  };
}
