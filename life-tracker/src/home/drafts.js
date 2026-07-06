import {
  DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
  DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
} from "../constants.js";

export function todayLocalDate(baseDate = new Date()) {
  const now = baseDate;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDraftId(prefix = "draft") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeCategoryNameValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeHexColorDraftValue(value, fallbackValue = DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return fallbackValue;
  }

  const prefixedValue = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(prefixedValue)
    ? prefixedValue
    : fallbackValue;
}

export function tokenizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function addDaysToLocalDate(localDate, daysToAdd) {
  const base = new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return todayLocalDate();
  }

  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate(base);
}

export function getInclusiveDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 1;
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000) + 1;
}

export function normalizeIntegerDraftValue(value, {
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  fallback = "",
} = {}) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }

  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return String(Math.min(max, Math.max(min, Math.round(numericValue))));
}

export function parseHabitProgressConfigValue(source = null) {
  if (!source?.progressConfigJson) {
    return {};
  }

  if (typeof source.progressConfigJson === "object") {
    return source.progressConfigJson;
  }

  try {
    return JSON.parse(String(source.progressConfigJson));
  } catch {
    return {};
  }
}

export function getHabitChecklistItemsValue(source = null) {
  const progressConfig = parseHabitProgressConfigValue(source);
  const itemsSource = Array.isArray(source?.checklistItems)
    ? source.checklistItems
    : progressConfig.items;

  return Array.isArray(itemsSource)
    ? itemsSource
      .map((entry, index) => {
        const title = String(entry?.title || "").trim();
        if (!title) {
          return null;
        }

        return {
          id: String(entry?.id || createDraftId("habit-item")),
          title,
          sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index,
        };
      })
      .filter(Boolean)
    : [];
}

export function getHabitQuantityConfigValue(source = null) {
  const progressConfig = parseHabitProgressConfigValue(source);

  return {
    quantityMode: source?.quantityMode ?? progressConfig.quantityMode ?? "at-least",
    quantityTarget: source?.quantityTarget ?? progressConfig.quantityTarget ?? "",
    quantityUnit: source?.quantityUnit ?? progressConfig.quantityUnit ?? "",
  };
}

export function createDraftChecklistItem(source = null) {
  return {
    id: source?.id || createDraftId("draft-item"),
    title: source?.title || "",
  };
}

export function createTaskDraft(source = null) {
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    dueDate: source?.dueDate || todayLocalDate(),
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    reminderAt: source?.reminderAt ? String(source.reminderAt).slice(0, 16) : "",
    isPersistent: source?.isPersistent ?? true,
    status: source?.status || "open",
    subitemsBlocking: source?.subitemsBlocking ?? false,
    subitems: Array.isArray(source?.subitems) && source.subitems.length
      ? source.subitems.map((entry) => ({
          id: entry.id || "",
          title: entry.title || "",
          isCompleted: Boolean(entry.isCompleted),
        }))
      : [],
  };
}

export function createHabitCategoryDraft(source = null) {
  return {
    id: source?.id || "",
    kind: source?.kind || "custom",
    presetId: source?.presetId || "",
    originalName: source?.originalName || source?.name || "",
    name: source?.name || "",
    iconId: source?.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
    color: source?.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
  };
}

export function createHabitDraft(source = null) {
  const startDate = source?.startDate || todayLocalDate();
  const normalizedEndDate = source?.endDate || "";
  const hasEndDate = Boolean(normalizedEndDate);
  const checklistItems = getHabitChecklistItemsValue(source);
  const quantityConfig = getHabitQuantityConfigValue(source);

  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    progressMode: source ? (source.progressMode || "yes-no") : "",
    quantityMode: quantityConfig.quantityMode,
    quantityTarget: quantityConfig.quantityTarget === null ? "" : String(quantityConfig.quantityTarget),
    quantityUnit: quantityConfig.quantityUnit || "",
    checklistItems: checklistItems.length
      ? checklistItems.map((entry) => createDraftChecklistItem(entry))
      : [
          createDraftChecklistItem(),
          createDraftChecklistItem(),
        ],
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays)
      ? source.scheduleConfigJson.weekdays
      : [1, 2, 3, 4, 5],
    startDate,
    hasEndDate,
    endDate: hasEndDate ? normalizedEndDate : "",
    durationDays: hasEndDate ? String(getInclusiveDayCount(startDate, normalizedEndDate)) : "1",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    status: source?.status || "active",
  };
}

export function buildHabitPayload(source = null, overrides = {}) {
  const scheduleType = overrides.scheduleType ?? source?.scheduleType ?? "daily";
  const progressConfig = parseHabitProgressConfigValue(source);
  const progressMode = overrides.progressMode ?? source?.progressMode ?? "yes-no";
  const weekdaysSource = overrides.weekdays
    ?? overrides.scheduleConfigJson?.weekdays
    ?? source?.weekdays
    ?? source?.scheduleConfigJson?.weekdays
    ?? [];
  const weekdays = Array.isArray(weekdaysSource)
    ? weekdaysSource
      .map((entry) => Number(entry))
      .filter((entry) => Number.isInteger(entry))
    : [];
  const checklistItemsSource = Array.isArray(overrides.checklistItems)
    ? overrides.checklistItems
    : Array.isArray(source?.checklistItems)
      ? source.checklistItems
      : progressConfig.items;

  return {
    id: overrides.id ?? source?.id ?? "",
    title: overrides.title ?? source?.title ?? "",
    category: overrides.category ?? source?.category ?? "",
    progressMode,
    quantityMode: overrides.quantityMode ?? source?.quantityMode ?? progressConfig.quantityMode ?? "at-least",
    quantityTarget: overrides.quantityTarget ?? source?.quantityTarget ?? progressConfig.quantityTarget ?? "",
    quantityUnit: overrides.quantityUnit ?? source?.quantityUnit ?? progressConfig.quantityUnit ?? "",
    checklistItems: Array.isArray(checklistItemsSource)
      ? checklistItemsSource.map((entry, index) => ({
          id: String(entry?.id || createDraftId("habit-item")),
          title: String(entry?.title || ""),
          sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry?.sortOrder) : index,
        }))
      : [],
    scheduleType,
    scheduleConfigJson: {
      weekdays: scheduleType === "weekdays" ? weekdays : [],
    },
    startDate: overrides.startDate ?? source?.startDate ?? todayLocalDate(),
    endDate: overrides.endDate ?? source?.endDate ?? "",
    time: overrides.time ?? source?.time ?? "",
    priority: normalizeIntegerDraftValue(overrides.priority ?? source?.priority ?? 1, {
      min: 1,
      max: 100,
      fallback: "1",
    }),
    notes: overrides.notes ?? source?.notes ?? "",
    status: overrides.status ?? source?.status ?? "active",
  };
}
