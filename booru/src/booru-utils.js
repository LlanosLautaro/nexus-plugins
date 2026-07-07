export function normalizeBooruText(value) {
  return String(value ?? "").trim();
}

export function normalizeBooruOptionalText(value) {
  const normalized = normalizeBooruText(value);
  return normalized || null;
}

export function normalizeBooruComparableText(value) {
  return normalizeBooruText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeBooruSlug(value, fallback = "booru") {
  const source = normalizeBooruText(value || fallback);
  const slug = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function normalizeBooruReality(value) {
  const normalized = normalizeBooruComparableText(value);

  if (normalized === "real") {
    return "real";
  }

  if (normalized === "ficticio") {
    return "ficticio";
  }

  return null;
}

export function uniqueBooruIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const value of values) {
    const normalized = normalizeBooruText(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

const BOORU_ENTITY_PREFIX_ALIASES = Object.freeze({
  persona: "author",
  author: "author",
  char: "character",
  character: "character",
  artist: "artist",
  universe: "universe",
});

const BOORU_MISSING_FILTER_ALIASES = Object.freeze({
  type: "type",
  tipo: "type",
  reality: "type",
  persona: "author",
  author: "author",
  artist: "artist",
  char: "character",
  character: "character",
  universe: "universe",
  "char-universe": "universe",
  "character-universe": "universe",
});

const BOORU_MEDIA_KIND_SET = new Set(["image", "video", "gif"]);

function uniqueComparableStrings(values) {
  const result = [];
  const seen = new Set();

  for (const value of Array.isArray(values) ? values : []) {
    const normalizedValue = normalizeBooruText(value);
    const comparableValue = normalizeBooruComparableText(normalizedValue);

    if (!normalizedValue || !comparableValue || seen.has(comparableValue)) {
      continue;
    }

    seen.add(comparableValue);
    result.push(normalizedValue);
  }

  return result;
}

export function normalizeBooruEntityPrefix(prefix) {
  const normalizedPrefix = normalizeBooruComparableText(prefix);
  return BOORU_ENTITY_PREFIX_ALIASES[normalizedPrefix] || null;
}

export function normalizeBooruMissingFilter(value) {
  const normalizedValue = normalizeBooruComparableText(value);
  return BOORU_MISSING_FILTER_ALIASES[normalizedValue] || null;
}

function unquoteBooruQueryValue(value) {
  const normalizedValue = normalizeBooruText(value);

  if (
    normalizedValue.length >= 2
    && normalizedValue.startsWith("\"")
    && normalizedValue.endsWith("\"")
  ) {
    return normalizedValue.slice(1, -1).replace(/\\"/g, "\"");
  }

  return normalizedValue;
}

export function tokenizeBooruQuery(value) {
  const normalizedValue = normalizeBooruText(value);

  if (!normalizedValue) {
    return [];
  }

  return normalizedValue.match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
}

export function parseBooruSearchSyntax(value) {
  const tokens = [];
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];
  let missing = null;
  const plainTextTokens = [];
  const rawTokens = tokenizeBooruQuery(value);
  let mediaKind = null;
  let reality = null;
  let classificationState = null;

  for (const rawToken of rawTokens) {
    const trimmedToken = normalizeBooruText(rawToken);

    if (!trimmedToken) {
      continue;
    }

    const negative = trimmedToken.startsWith("-") && trimmedToken.includes(":");
    const normalizedToken = negative ? trimmedToken.slice(1) : trimmedToken;
    const separatorIndex = normalizedToken.indexOf(":");

    if (separatorIndex <= 0) {
      plainTextTokens.push(unquoteBooruQueryValue(trimmedToken));
      continue;
    }

    const rawPrefix = normalizedToken.slice(0, separatorIndex);
    const rawValue = normalizedToken.slice(separatorIndex + 1);
    const tokenValue = unquoteBooruQueryValue(rawValue);

    if (!tokenValue) {
      continue;
    }

    const entityKind = normalizeBooruEntityPrefix(rawPrefix);

    if (entityKind) {
      const item = {
        kind: entityKind,
        value: tokenValue,
        label: tokenValue,
      };

      tokens.push({
        raw: trimmedToken,
        type: "entity",
        kind: entityKind,
        negative,
        value: tokenValue,
      });

      if (negative) {
        excludeEntities.push(item);
      } else {
        includeEntities.push(item);
      }
      continue;
    }

    const normalizedPrefix = normalizeBooruComparableText(rawPrefix);

    if (normalizedPrefix === "tag") {
      const item = {
        value: tokenValue,
        label: tokenValue,
      };

      tokens.push({
        raw: trimmedToken,
        type: "tag",
        negative,
        value: tokenValue,
      });

      if (negative) {
        excludeTags.push(item);
      } else {
        includeTags.push(item);
      }
      continue;
    }

    if (normalizedPrefix === "reality") {
      const nextReality = normalizeBooruReality(tokenValue);

      if (!nextReality) {
        plainTextTokens.push(unquoteBooruQueryValue(trimmedToken));
        continue;
      }

      reality = nextReality;
      tokens.push({
        raw: trimmedToken,
        type: "reality",
        negative: false,
        value: nextReality,
      });
      continue;
    }

    if (normalizedPrefix === "media") {
      const nextMediaKind = normalizeBooruComparableText(tokenValue);

      if (!BOORU_MEDIA_KIND_SET.has(nextMediaKind)) {
        plainTextTokens.push(unquoteBooruQueryValue(trimmedToken));
        continue;
      }

      mediaKind = nextMediaKind;
      tokens.push({
        raw: trimmedToken,
        type: "media-kind",
        negative: false,
        value: nextMediaKind,
      });
      continue;
    }

    if (normalizedPrefix === "status") {
      const nextStatus = normalizeBooruComparableText(tokenValue);

      if (nextStatus !== "unclassified") {
        plainTextTokens.push(unquoteBooruQueryValue(trimmedToken));
        continue;
      }

      classificationState = "unclassified";
      tokens.push({
        raw: trimmedToken,
        type: "classification-state",
        negative: false,
        value: classificationState,
      });
      continue;
    }

    if (normalizedPrefix === "missing") {
      const normalizedMissing = normalizeBooruMissingFilter(tokenValue);

      if (!normalizedMissing) {
        plainTextTokens.push(unquoteBooruQueryValue(trimmedToken));
        continue;
      }

      missing = normalizedMissing;
      tokens.push({
        raw: trimmedToken,
        type: "missing",
        negative: false,
        value: normalizedMissing,
      });
      continue;
    }

    plainTextTokens.push(unquoteBooruQueryValue(trimmedToken));
  }

  return {
    raw: normalizeBooruText(value),
    tokens,
    query: {
      text: normalizeBooruOptionalText(plainTextTokens.join(" ")),
      mediaKind,
      reality,
      classificationState,
      includeEntities,
      excludeEntities,
      includeTags,
      excludeTags,
      missing,
    },
  };
}
