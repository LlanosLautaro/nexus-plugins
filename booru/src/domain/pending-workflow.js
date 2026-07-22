export const BOORU_NO_MISSING_FILTER = "none";

export const BOORU_RECOMMENDATION_SCOPES = Object.freeze({
  ALL: "all",
  ESSENTIAL: "essential",
  TAGS: "tags",
});

const ESSENTIAL_MISSING_KINDS = new Set(["author", "artist", "character", "universe"]);

export function normalizeBooruRecommendationScope(value) {
  if (value === BOORU_RECOMMENDATION_SCOPES.ESSENTIAL) {
    return BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
  }

  if (value === BOORU_RECOMMENDATION_SCOPES.TAGS) {
    return BOORU_RECOMMENDATION_SCOPES.TAGS;
  }

  return BOORU_RECOMMENDATION_SCOPES.ALL;
}

export function getBooruRecommendationScope(section, pendingMode) {
  if (section !== "pending") {
    return BOORU_RECOMMENDATION_SCOPES.ALL;
  }

  return pendingMode === "tags"
    ? BOORU_RECOMMENDATION_SCOPES.TAGS
    : BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
}

export function getBooruImplicitRecommendationMissingKind(scope, realityValue) {
  return normalizeBooruRecommendationScope(scope) === BOORU_RECOMMENDATION_SCOPES.ESSENTIAL
    && realityValue === "real"
    ? "author"
    : null;
}

export function buildBooruResourceQuery({
  searchTokens = [],
  freeText = "",
  browse = null,
  mediaKindFilter = "all",
  realityFilter = "all",
  pendingMode = "essential",
  missingFilter = BOORU_NO_MISSING_FILTER,
} = {}) {
  let searchReality = null;
  let searchClassificationState = null;
  let searchMissing = null;
  let searchMediaKind = null;
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];

  for (const token of Array.isArray(searchTokens) ? searchTokens : []) {
    if (token?.type === "entity") {
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

    if (token?.type === "tag") {
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

    if (token?.type === "reality" && !token.negative) {
      searchReality = token.value;
      continue;
    }

    if (token?.type === "missing" && !token.negative) {
      searchMissing = token.value;
      continue;
    }

    if (token?.type === "classification-state" && !token.negative) {
      searchClassificationState = token.value;
      continue;
    }

    if (token?.type === "media-kind" && !token.negative) {
      searchMediaKind = token.value;
    }
  }

  const explicitReality = realityFilter === "real" || realityFilter === "ficticio"
    ? realityFilter
    : null;
  const explicitMissing = realityFilter === "untyped"
    ? "type"
    : (missingFilter !== BOORU_NO_MISSING_FILTER ? missingFilter : null);

  return {
    textTerms: String(freeText || "").trim(),
    mediaKind: mediaKindFilter !== "all" ? mediaKindFilter : searchMediaKind,
    reality: explicitReality || searchReality,
    classificationState: searchClassificationState || null,
    pendingMode: pendingMode === "tags" ? "tags" : "essential",
    includeEntities,
    excludeEntities,
    includeTags,
    excludeTags,
    missing: explicitMissing || searchMissing,
    sortBy: browse?.sortBy || "importedAt",
    groupBy: browse?.groupBy || "importedAt",
    groupOrderBy: browse?.groupOrderBy || "importedAt",
    direction: browse?.direction || "desc",
    grouping: browse?.grouping || "continuous",
    randomSeed: browse?.randomSeed || "booru-stable",
  };
}

export function getBooruContextualMissingFilterOptions(
  realityValue,
  includeEntityFilters = [],
  recommendationScope = BOORU_RECOMMENDATION_SCOPES.ALL,
) {
  const entityKinds = new Set(
    (Array.isArray(includeEntityFilters) ? includeEntityFilters : [])
      .map((filter) => String(filter?.kind || "").trim())
      .filter(Boolean),
  );
  const disabledValues = new Set();

  if (entityKinds.has("author")) {
    disabledValues.add("author");
  }

  if (entityKinds.has("artist")) {
    disabledValues.add("artist");
  }

  if (entityKinds.has("character")) {
    disabledValues.add("character");
    disabledValues.add("universe");
  } else if (entityKinds.has("universe")) {
    disabledValues.add("universe");
  }

  const options = [{ value: BOORU_NO_MISSING_FILTER, label: "Ninguno" }];

  if (
    realityValue === "real"
    && normalizeBooruRecommendationScope(recommendationScope) !== BOORU_RECOMMENDATION_SCOPES.ESSENTIAL
  ) {
    options.push({ value: "author", label: "Sin persona" });
  } else if (realityValue === "ficticio") {
    options.push(
      { value: "character", label: "Sin char" },
      { value: "universe", label: "Sin universe" },
      { value: "artist", label: "Sin artist" },
    );
  }

  return options.map((option) => ({
    ...option,
    disabled: option.value !== BOORU_NO_MISSING_FILTER && disabledValues.has(option.value),
  }));
}

export function isBooruMissingFilterCompatible(missingFilter, options = []) {
  if (missingFilter === "type") {
    return true;
  }

  if (!ESSENTIAL_MISSING_KINDS.has(missingFilter)) {
    return missingFilter === BOORU_NO_MISSING_FILTER;
  }

  return options.some((option) => option?.value === missingFilter && !option?.disabled);
}

export function resourceMatchesBooruPendingMode(resource, pendingMode) {
  if (!resource || typeof resource !== "object") {
    return false;
  }

  return pendingMode === "tags"
    ? resource.isPending === false
    : resource.isPending === true;
}

export function resourceMatchesBooruSection(resource, section, pendingMode) {
  if (!resource || typeof resource !== "object") {
    return false;
  }

  if (section === "media") {
    return resource.isPending === false;
  }

  if (section === "pending") {
    return resourceMatchesBooruPendingMode(resource, pendingMode);
  }

  return true;
}
