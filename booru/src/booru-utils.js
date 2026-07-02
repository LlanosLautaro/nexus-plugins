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
