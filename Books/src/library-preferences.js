export const BOOKS_GRID_COLUMN_LIMITS = Object.freeze({ min: 1, max: 8 });

export const BOOKS_DEFAULT_LIBRARY_PREFERENCES = Object.freeze({
  gridColumns: null,
});

export function normalizeBooksGridColumnOverride(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.min(
    BOOKS_GRID_COLUMN_LIMITS.max,
    Math.max(BOOKS_GRID_COLUMN_LIMITS.min, Math.round(numericValue)),
  );
}

export function normalizeBooksLibraryPreferences(value = null) {
  return {
    gridColumns: normalizeBooksGridColumnOverride(value?.gridColumns),
  };
}

export function writeBooksGridColumns(currentValue, nextColumnCount) {
  const gridColumns = normalizeBooksGridColumnOverride(nextColumnCount);

  return {
    ...(currentValue && typeof currentValue === "object" ? currentValue : {}),
    gridColumns,
  };
}
