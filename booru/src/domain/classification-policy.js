export const BOORU_REALITY_AUTO = "auto";
export const BOORU_REALITY_MANUAL = "manual";

export const BOORU_CLASSIFICATION_KINDS = Object.freeze([
  "author",
  "character",
  "universe",
  "artist",
]);

const RECOMMENDATION_KIND_PRIORITY = Object.freeze({
  author: Object.freeze(["author", "character", "universe", "artist"]),
  character: Object.freeze(["universe", "artist", "author", "character"]),
  artist: Object.freeze(["character", "universe", "author", "artist"]),
  universe: Object.freeze(["character", "artist", "author", "universe"]),
  real: Object.freeze(["author", "character", "universe", "artist"]),
  ficticio: Object.freeze(["character", "universe", "artist", "author"]),
  default: BOORU_CLASSIFICATION_KINDS,
});

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

export function normalizeRealitySource(value) {
  return value === BOORU_REALITY_MANUAL
    ? BOORU_REALITY_MANUAL
    : BOORU_REALITY_AUTO;
}

export function resolveBooruReality({
  reality = null,
  realitySource = BOORU_REALITY_AUTO,
  realityWasEdited = false,
  authors = [],
  artists = [],
  characters = [],
  universes = [],
} = {}) {
  const normalizedReality = reality === "real" || reality === "ficticio"
    ? reality
    : null;

  // Persona is the only hard precedence rule. It intentionally clears a
  // previous override so removing Persona can derive the remaining context.
  if (hasItems(authors)) {
    return { reality: "real", source: BOORU_REALITY_AUTO };
  }

  if (realityWasEdited) {
    if (normalizedReality) {
      return { reality: normalizedReality, source: BOORU_REALITY_MANUAL };
    }

    realitySource = BOORU_REALITY_AUTO;
  }

  if (normalizeRealitySource(realitySource) === BOORU_REALITY_MANUAL && normalizedReality) {
    return { reality: normalizedReality, source: BOORU_REALITY_MANUAL };
  }

  if (hasItems(characters) || hasItems(artists) || hasItems(universes)) {
    return { reality: "ficticio", source: BOORU_REALITY_AUTO };
  }

  return { reality: null, source: BOORU_REALITY_AUTO };
}

export function getBooruEssentialState({
  reality = null,
  authors = [],
  artists = [],
  characters = [],
  universes = [],
} = {}) {
  const missing = [];

  if (!reality) {
    missing.push("reality");
  } else if (reality === "real") {
    if (!hasItems(authors)) {
      missing.push("author");
    }
  } else if (reality === "ficticio") {
    if (!hasItems(characters)) {
      missing.push("character");
    }

    const hasUniverse = hasItems(universes)
      || characters.some((character) => Boolean(character?.universe?.id));

    if (!hasUniverse || characters.some((character) => !character?.universe?.id)) {
      missing.push("universe");
    }

    if (!hasItems(artists)) {
      missing.push("artist");
    }
  }

  return {
    complete: missing.length === 0,
    missing,
    classificationState: missing.length ? "unclassified" : "classified-basic",
  };
}

export function getBooruRecommendationKindOrder(context = null) {
  const normalizedContext = String(context || "").trim();
  return RECOMMENDATION_KIND_PRIORITY[normalizedContext]
    || RECOMMENDATION_KIND_PRIORITY.default;
}

export function getBooruRecommendationKindRank(context, kind) {
  const index = getBooruRecommendationKindOrder(context).indexOf(kind);
  return index >= 0 ? index : BOORU_CLASSIFICATION_KINDS.length;
}
