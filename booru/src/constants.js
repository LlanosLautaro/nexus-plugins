export const BOORU_PLUGIN_ID = "nexus.booru";
export const BOORU_WORKSPACE_VIEW_ID = "nexus.booru.workspace";
export const BOORU_DEFAULT_SECTION = "media";

export const BOORU_SECTION_OPTIONS = [
  { value: "media", label: "Media" },
  { value: "pending", label: "Pendientes" },
  { value: "duplicates", label: "Duplicados" },
  { value: "trash", label: "Papelera" },
  { value: "metrics", label: "Metricas" },
  { value: "authors", label: "Persona" },
  { value: "characters", label: "Characters" },
  { value: "artists", label: "Artists" },
  { value: "universes", label: "Universes" },
];

export const BOORU_CLASSIFICATION_LABELS = Object.freeze({
  "unclassified": "Sin clasificar",
  "classified-basic": "Clasificado basico",
  "duplicate-review": "Duplicado en revision",
});

export const BOORU_MEDIA_KIND_LABELS = Object.freeze({
  image: "Image",
  video: "Video",
  gif: "GIF",
});

export const BOORU_REALITY_OPTIONS = [
  { value: "real", label: "Real" },
  { value: "ficticio", label: "Ficticio" },
];

export const BOORU_REALITY_LABELS = Object.freeze({
  real: "Real",
  ficticio: "Ficticio",
});

export const BOORU_ENTITY_KIND_LABELS = Object.freeze({
  author: "Persona",
  artist: "Artist",
  character: "Character",
  universe: "Universe",
});
