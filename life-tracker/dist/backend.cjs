var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nexus-plugins/life-tracker/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  default: () => backend_default3
});
module.exports = __toCommonJS(backend_exports);

// ../nexus-plugins/life-tracker/src/habitos-core.js
var TASK_STATUS_VALUES = /* @__PURE__ */ new Set(["open", "completed", "failed"]);
var HABIT_STATUS_VALUES = /* @__PURE__ */ new Set(["active", "archived"]);
var OCCURRENCE_STATUS_VALUES = /* @__PURE__ */ new Set(["pending", "completed", "failed", "recorded"]);
var CLOSED_QUEUE_STATUSES = /* @__PURE__ */ new Set(["completed", "failed", "recorded"]);
var HABIT_SCHEDULE_TYPES = /* @__PURE__ */ new Set(["daily", "weekdays"]);
var HABIT_PROGRESS_MODES = /* @__PURE__ */ new Set(["yes-no", "quantity", "checklist"]);
var HABIT_QUANTITY_MODES = /* @__PURE__ */ new Set(["at-least", "less-than", "exactly", "no-target"]);
var DEFAULT_PRIORITY = 1;
var DEFAULT_UPCOMING_LIMIT = 6;
var DEFAULT_HISTORY_LIMIT = 8;
var DEFAULT_HABIT_OUTCOME_SERIES_DAYS = 365;
var HABIT_OUTCOME_CHART_RANGES = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "1m", label: "1 mes", days: 30 },
  { value: "1y", label: "1 ano", days: 365 }
];
var CATEGORY_ICON_ID_PATTERN = /^(mui|mit):[\w.-]+$/i;
var HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function createId(prefix = "habitos") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function todayLocalDate(baseDate = /* @__PURE__ */ new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function normalizeOptionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 1 || value === "1" || value === "true") {
    return true;
  }
  if (value === 0 || value === "0" || value === "false") {
    return false;
  }
  return fallback;
}
function hasOwn(objectValue, key) {
  return Boolean(objectValue) && Object.prototype.hasOwnProperty.call(objectValue, key);
}
function normalizeLocalDate(value, fallbackValue = todayLocalDate()) {
  const normalized = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackValue;
  }
  return todayLocalDate(parsed);
}
function normalizeTimeValue(value) {
  const normalized = String(value ?? "").trim();
  return /^\d{2}:\d{2}$/.test(normalized) ? normalized : null;
}
function normalizeDateTimeValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}
function normalizePriorityValue(value, fallback = DEFAULT_PRIORITY) {
  const numericValue = Math.round(Number(value));
  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 100) {
    return fallback;
  }
  return numericValue;
}
function normalizeNonNegativeIntegerValue(value, fallback = null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }
  const numericValue = Math.round(Number(normalized));
  if (!Number.isInteger(numericValue) || numericValue < 0) {
    return fallback;
  }
  return numericValue;
}
function normalizeCategoryIconId(value, fallback = "mui:Extension") {
  const normalized = String(value ?? "").trim();
  return CATEGORY_ICON_ID_PATTERN.test(normalized) ? normalized : fallback;
}
function normalizeHexColorValue(value, fallback = "#8fb3ff") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }
  const prefixedValue = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return HEX_COLOR_PATTERN.test(prefixedValue) ? prefixedValue : fallback;
}
function normalizeHabitCategoryInput(payload = {}, options = {}) {
  const existingCategory = options.existingCategory || null;
  const name = String(payload?.name ?? existingCategory?.name ?? "").trim();
  if (!name) {
    throw new Error("El nombre de la categoria es obligatorio.");
  }
  if (name.length > 60) {
    throw new Error("El nombre de la categoria es demasiado largo.");
  }
  return {
    id: String(payload?.id || existingCategory?.id || createId("habit-category")),
    name,
    iconId: normalizeCategoryIconId(payload?.iconId ?? existingCategory?.iconId, "mui:Extension"),
    color: normalizeHexColorValue(payload?.color ?? existingCategory?.color, "#8fb3ff")
  };
}
function normalizeHabitProgressModeValue(value, fallback = "yes-no") {
  const normalized = String(value ?? "").trim().toLowerCase();
  return HABIT_PROGRESS_MODES.has(normalized) ? normalized : fallback;
}
function normalizeHabitQuantityModeValue(value, fallback = "at-least") {
  const normalized = String(value ?? "").trim().toLowerCase();
  return HABIT_QUANTITY_MODES.has(normalized) ? normalized : fallback;
}
function normalizeHabitChecklistItems(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  return source.map((entry, index) => {
    const title = String(entry?.title ?? "").trim();
    if (!title) {
      return null;
    }
    return {
      id: String(entry?.id || createId("habit-item")),
      title,
      sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index
    };
  }).filter(Boolean);
}
function normalizeHabitProgressConfig(payload = {}, options = {}) {
  const existingHabit = options.existingHabit || null;
  const progressMode = normalizeHabitProgressModeValue(options.progressMode, "yes-no");
  const existingConfig = parseJsonObject(existingHabit?.progressConfigJson, {});
  const payloadConfig = hasOwn(payload, "progressConfigJson") ? parseJsonObject(payload?.progressConfigJson, {}) : {};
  if (progressMode === "quantity") {
    const hasExplicitQuantityFields = hasOwn(payload, "quantityMode") || hasOwn(payload, "quantityTarget") || hasOwn(payload, "quantityUnit") || hasOwn(payload, "progressConfigJson");
    const quantityMode = normalizeHabitQuantityModeValue(
      hasExplicitQuantityFields ? payload?.quantityMode ?? payloadConfig?.quantityMode ?? existingConfig?.quantityMode : existingConfig?.quantityMode,
      "at-least"
    );
    const quantityTarget = quantityMode === "no-target" ? null : normalizeNonNegativeIntegerValue(
      hasExplicitQuantityFields ? payload?.quantityTarget ?? payloadConfig?.quantityTarget ?? existingConfig?.quantityTarget : existingConfig?.quantityTarget,
      null
    );
    if (quantityMode !== "no-target" && quantityTarget === null) {
      throw new Error("Define un objetivo numerico valido para este habito.");
    }
    return {
      quantityMode,
      quantityTarget,
      quantityUnit: normalizeOptionalText(
        hasExplicitQuantityFields ? payload?.quantityUnit ?? payloadConfig?.quantityUnit ?? existingConfig?.quantityUnit : existingConfig?.quantityUnit
      )
    };
  }
  if (progressMode === "checklist") {
    const hasExplicitChecklistFields = hasOwn(payload, "checklistItems") || hasOwn(payload, "progressConfigJson");
    const checklistItems = normalizeHabitChecklistItems(
      hasExplicitChecklistFields ? Array.isArray(payload?.checklistItems) ? payload.checklistItems : payloadConfig?.items : existingConfig?.items,
      existingConfig?.items || []
    );
    if (!checklistItems.length) {
      throw new Error("Agrega al menos un sub-item para este habito.");
    }
    return {
      items: checklistItems
    };
  }
  return {};
}
function normalizeWeekdays(value) {
  if (!Array.isArray(value)) {
    return [1, 2, 3, 4, 5];
  }
  const uniqueValues = new Set(
    value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6)
  );
  return [...uniqueValues].sort((left, right) => left - right);
}
function normalizeTaskSubitems(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  return source.map((entry, index) => {
    const title = String(entry?.title ?? "").trim();
    if (!title) {
      return null;
    }
    return {
      id: String(entry?.id || createId("task-subitem")),
      title,
      isCompleted: normalizeBoolean(entry?.isCompleted, false),
      sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index
    };
  }).filter(Boolean);
}
function normalizeTaskInput(payload = {}, options = {}) {
  const today = options.today || todayLocalDate();
  const existingTask = options.existingTask || null;
  const title = String(payload?.title ?? existingTask?.title ?? "").trim();
  if (!title) {
    throw new Error("El titulo de la tarea es obligatorio.");
  }
  const statusCandidate = String(payload?.status ?? existingTask?.status ?? "open").trim().toLowerCase();
  const status = TASK_STATUS_VALUES.has(statusCandidate) ? statusCandidate : "open";
  const subitems = normalizeTaskSubitems(payload?.subitems, existingTask?.subitems || []);
  const subitemsBlocking = normalizeBoolean(
    payload?.subitemsBlocking,
    normalizeBoolean(existingTask?.subitemsBlocking, false)
  );
  if (status === "completed" && subitemsBlocking && subitems.some((entry) => !entry.isCompleted)) {
    throw new Error("No puedes completar la tarea hasta cerrar todos los sub-items obligatorios.");
  }
  return {
    id: String(payload?.id || existingTask?.id || createId("task")),
    title,
    category: normalizeOptionalText(payload?.category ?? existingTask?.category),
    dueDate: normalizeLocalDate(payload?.dueDate ?? existingTask?.dueDate, today),
    time: normalizeTimeValue(payload?.time ?? existingTask?.time),
    priority: normalizePriorityValue(payload?.priority ?? existingTask?.priority, DEFAULT_PRIORITY),
    notes: normalizeOptionalText(payload?.notes ?? existingTask?.notes),
    reminderAt: normalizeDateTimeValue(payload?.reminderAt ?? existingTask?.reminderAt),
    isPersistent: normalizeBoolean(payload?.isPersistent, existingTask?.isPersistent ?? true),
    subitemsBlocking,
    status,
    subitems
  };
}
function normalizeHabitInput(payload = {}, options = {}) {
  const today = options.today || todayLocalDate();
  const existingHabit = options.existingHabit || null;
  const title = String(payload?.title ?? existingHabit?.title ?? "").trim();
  if (!title) {
    throw new Error("El titulo del habito es obligatorio.");
  }
  const scheduleTypeCandidate = String(
    payload?.scheduleType ?? existingHabit?.scheduleType ?? "daily"
  ).trim().toLowerCase();
  const scheduleType = HABIT_SCHEDULE_TYPES.has(scheduleTypeCandidate) ? scheduleTypeCandidate : "daily";
  let rawScheduleConfig = payload?.scheduleConfigJson ?? existingHabit?.scheduleConfigJson ?? {};
  if (typeof rawScheduleConfig === "string") {
    try {
      rawScheduleConfig = JSON.parse(rawScheduleConfig);
    } catch {
      rawScheduleConfig = {};
    }
  }
  const scheduleConfig = scheduleType === "weekdays" ? { weekdays: normalizeWeekdays(rawScheduleConfig?.weekdays) } : {};
  const statusCandidate = String(payload?.status ?? existingHabit?.status ?? "active").trim().toLowerCase();
  const progressMode = normalizeHabitProgressModeValue(
    payload?.progressMode ?? existingHabit?.progressMode,
    "yes-no"
  );
  const progressConfigJson = normalizeHabitProgressConfig(payload, {
    existingHabit,
    progressMode
  });
  return {
    id: String(payload?.id || existingHabit?.id || createId("habit")),
    title,
    category: normalizeOptionalText(payload?.category ?? existingHabit?.category),
    scheduleType,
    scheduleConfigJson: scheduleConfig,
    startDate: normalizeLocalDate(payload?.startDate ?? existingHabit?.startDate, today),
    endDate: normalizeOptionalText(payload?.endDate ?? existingHabit?.endDate) ? normalizeLocalDate(payload?.endDate ?? existingHabit?.endDate, today) : null,
    time: normalizeTimeValue(payload?.time ?? existingHabit?.time),
    priority: normalizePriorityValue(payload?.priority ?? existingHabit?.priority, DEFAULT_PRIORITY),
    progressMode,
    progressConfigJson,
    notes: normalizeOptionalText(payload?.notes ?? existingHabit?.notes),
    status: HABIT_STATUS_VALUES.has(statusCandidate) ? statusCandidate : "active"
  };
}
function getHabitQuantityConfig(habit) {
  const progressConfig = parseJsonObject(habit?.progressConfigJson, {});
  const quantityMode = normalizeHabitQuantityModeValue(progressConfig?.quantityMode, "at-least");
  return {
    quantityMode,
    quantityTarget: quantityMode === "no-target" ? null : normalizeNonNegativeIntegerValue(progressConfig?.quantityTarget, null),
    quantityUnit: normalizeOptionalText(progressConfig?.quantityUnit)
  };
}
function getHabitChecklistItems(habit) {
  return normalizeHabitChecklistItems(parseJsonObject(habit?.progressConfigJson, {})?.items, []);
}
function normalizeOccurrenceProgressData(value, habit = null) {
  const progressMode = normalizeHabitProgressModeValue(habit?.progressMode, "yes-no");
  const parsed = parseJsonObject(value, {});
  if (progressMode === "quantity") {
    return {
      value: normalizeNonNegativeIntegerValue(parsed?.value ?? parsed?.quantityValue, null)
    };
  }
  if (progressMode === "checklist") {
    const allowedIds = new Set(getHabitChecklistItems(habit).map((entry) => entry.id));
    const checkedItemIds = (Array.isArray(parsed?.checkedItemIds) ? parsed.checkedItemIds : Array.isArray(parsed?.items) ? parsed.items.filter((entry) => normalizeBoolean(entry?.isCompleted, false)).map((entry) => entry?.id) : []).map((entry) => String(entry || "").trim()).filter(Boolean).filter((entry, index, values) => values.indexOf(entry) === index).filter((entry) => !allowedIds.size || allowedIds.has(entry));
    return {
      checkedItemIds
    };
  }
  return {};
}
function serializeOccurrenceProgressData(progressDataJson, habit = null) {
  return JSON.stringify(normalizeOccurrenceProgressData(progressDataJson, habit));
}
function getOccurrenceWindowStartAt(occurrenceDate) {
  return `${occurrenceDate}T00:00:00.000`;
}
function getOccurrenceWindowEndAt(occurrenceDate) {
  return `${occurrenceDate}T23:59:59.999`;
}
function compareLocalDates(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}
function getOccurrenceStatusLabel(status) {
  if (status === "completed") {
    return "Cumplida";
  }
  if (status === "failed") {
    return "Fallida";
  }
  if (status === "recorded") {
    return "Registrada";
  }
  return "Pendiente";
}
function doesQuantityValueMeetGoal(quantityMode, quantityTarget, value) {
  if (!Number.isInteger(value) || value < 0 || quantityTarget === null) {
    return false;
  }
  if (quantityMode === "less-than") {
    return value < quantityTarget;
  }
  if (quantityMode === "exactly") {
    return value === quantityTarget;
  }
  return value >= quantityTarget;
}
function resolveOccurrenceStatus(occurrence, habit, referenceDate) {
  if (!occurrence || !habit) {
    return "pending";
  }
  const progressMode = normalizeHabitProgressModeValue(habit.progressMode, "yes-no");
  const normalizedStatus = OCCURRENCE_STATUS_VALUES.has(String(occurrence.status || "").trim().toLowerCase()) ? String(occurrence.status).trim().toLowerCase() : "pending";
  const progressDataJson = normalizeOccurrenceProgressData(occurrence.progressDataJson, habit);
  const isPastOccurrence = compareLocalDates(occurrence.occurrenceDate, referenceDate) < 0;
  if (progressMode === "yes-no") {
    return normalizedStatus;
  }
  if (progressMode === "quantity") {
    const { quantityMode, quantityTarget } = getHabitQuantityConfig(habit);
    const value = progressDataJson.value;
    if (quantityMode === "no-target") {
      return value === null ? "pending" : "recorded";
    }
    return doesQuantityValueMeetGoal(quantityMode, quantityTarget, value) ? "completed" : isPastOccurrence ? "failed" : "pending";
  }
  if (progressMode === "checklist") {
    const checklistItems = getHabitChecklistItems(habit);
    const allCompleted = checklistItems.length > 0 && checklistItems.every((entry) => progressDataJson.checkedItemIds.includes(entry.id));
    return allCompleted ? "completed" : isPastOccurrence ? "failed" : "pending";
  }
  return normalizedStatus;
}
function resolveOccurrenceRecord(occurrence, habit, referenceDate) {
  if (!occurrence) {
    return null;
  }
  const progressDataJson = normalizeOccurrenceProgressData(occurrence.progressDataJson, habit);
  const status = resolveOccurrenceStatus({
    ...occurrence,
    progressDataJson
  }, habit, referenceDate);
  return {
    ...occurrence,
    progressMode: habit?.progressMode || "yes-no",
    progressConfigJson: parseJsonObject(habit?.progressConfigJson, {}),
    progressDataJson,
    status,
    statusLabel: getOccurrenceStatusLabel(status)
  };
}
function createProjectedOccurrenceRecord(habit, occurrenceDate) {
  return {
    id: `projected:${habit.id}:${occurrenceDate}`,
    habitId: habit.id,
    occurrenceDate,
    windowStartAt: getOccurrenceWindowStartAt(occurrenceDate),
    windowEndAt: getOccurrenceWindowEndAt(occurrenceDate),
    status: "pending",
    progressDataJson: {},
    completedAt: null,
    createdAt: null,
    updatedAt: null,
    isProjected: true
  };
}
function formatLocalDateToDayOfWeek(localDate) {
  const date = /* @__PURE__ */ new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return -1;
  }
  return date.getDay();
}
function eachDateInclusive(startDate, endDate) {
  const values = [];
  const cursor = /* @__PURE__ */ new Date(`${startDate}T00:00:00`);
  const limit = /* @__PURE__ */ new Date(`${endDate}T00:00:00`);
  while (cursor <= limit) {
    values.push(todayLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return values;
}
function addDaysToLocalDate(localDate, daysToAdd) {
  const base = /* @__PURE__ */ new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return todayLocalDate();
  }
  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate(base);
}
function doesHabitMatchDate(habit, occurrenceDate) {
  if (!habit || habit.status !== "active") {
    return false;
  }
  if (compareLocalDates(occurrenceDate, habit.startDate) < 0) {
    return false;
  }
  if (habit.endDate && compareLocalDates(occurrenceDate, habit.endDate) > 0) {
    return false;
  }
  if (habit.scheduleType === "weekdays") {
    const weekdays = normalizeWeekdays(habit.scheduleConfigJson?.weekdays);
    return weekdays.includes(formatLocalDateToDayOfWeek(occurrenceDate));
  }
  return true;
}
function parseJsonObject(value, fallback = {}) {
  if (!value) {
    return fallback;
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}
function normalizeTaskRecord(row, subitems = []) {
  if (!row?.id) {
    return null;
  }
  return {
    id: String(row.id),
    title: String(row.title || "").trim(),
    category: normalizeOptionalText(row.category),
    dueDate: normalizeLocalDate(row.due_date),
    time: normalizeTimeValue(row.time),
    priority: normalizePriorityValue(row.priority),
    notes: normalizeOptionalText(row.notes),
    reminderAt: normalizeDateTimeValue(row.reminder_at),
    isPersistent: normalizeBoolean(row.is_persistent, true),
    subitemsBlocking: normalizeBoolean(row.subitems_blocking, false),
    status: TASK_STATUS_VALUES.has(String(row.status || "").trim().toLowerCase()) ? String(row.status).trim().toLowerCase() : "open",
    completedAt: normalizeDateTimeValue(row.completed_at),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    subitems
  };
}
function normalizeTaskSubitemRecord(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    title: String(row.title || "").trim(),
    isCompleted: normalizeBoolean(row.is_completed, false),
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso())
  };
}
function normalizeHabitRecord(row) {
  if (!row?.id) {
    return null;
  }
  const progressMode = normalizeHabitProgressModeValue(row.progress_mode, "yes-no");
  const progressConfigJson = normalizeHabitProgressConfig({
    progressConfigJson: parseJsonObject(row.progress_config_json, {})
  }, {
    progressMode
  });
  return {
    id: String(row.id),
    title: String(row.title || "").trim(),
    category: normalizeOptionalText(row.category),
    scheduleType: HABIT_SCHEDULE_TYPES.has(String(row.schedule_type || "").trim().toLowerCase()) ? String(row.schedule_type).trim().toLowerCase() : "daily",
    scheduleConfigJson: parseJsonObject(row.schedule_config_json, {}),
    startDate: normalizeLocalDate(row.start_date),
    endDate: row.end_date ? normalizeLocalDate(row.end_date) : null,
    time: normalizeTimeValue(row.time),
    priority: normalizePriorityValue(row.priority),
    progressMode,
    progressConfigJson,
    notes: normalizeOptionalText(row.notes),
    status: HABIT_STATUS_VALUES.has(String(row.status || "").trim().toLowerCase()) ? String(row.status).trim().toLowerCase() : "active",
    lastOccurrenceDate: row.last_occurrence_date ? normalizeLocalDate(row.last_occurrence_date) : null,
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso())
  };
}
function normalizeOccurrenceRecord(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: String(row.id),
    habitId: String(row.habit_id),
    occurrenceDate: normalizeLocalDate(row.occurrence_date),
    windowStartAt: String(row.window_start_at || getOccurrenceWindowStartAt(normalizeLocalDate(row.occurrence_date))),
    windowEndAt: String(row.window_end_at || getOccurrenceWindowEndAt(normalizeLocalDate(row.occurrence_date))),
    status: OCCURRENCE_STATUS_VALUES.has(String(row.status || "").trim().toLowerCase()) ? String(row.status).trim().toLowerCase() : "pending",
    progressDataJson: parseJsonObject(row.progress_data_json, {}),
    completedAt: normalizeDateTimeValue(row.completed_at),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso())
  };
}
function listTaskSubitemsGrouped(sqlite) {
  const rows = sqlite.prepare(`
    SELECT *
    FROM habits_task_subitems
    ORDER BY task_id ASC, sort_order ASC, created_at ASC
  `).all();
  const grouped = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const subitem = normalizeTaskSubitemRecord(row);
    if (!subitem) {
      continue;
    }
    const list = grouped.get(subitem.taskId) || [];
    list.push(subitem);
    grouped.set(subitem.taskId, list);
  }
  return grouped;
}
function listTasksSync(sqlite) {
  const groupedSubitems = listTaskSubitemsGrouped(sqlite);
  return sqlite.prepare(`
    SELECT *
    FROM habits_tasks
    ORDER BY due_date ASC, time ASC, created_at ASC
  `).all().map((row) => normalizeTaskRecord(row, groupedSubitems.get(String(row.id)) || [])).filter(Boolean);
}
function listHabitsSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM habits_habits
    ORDER BY title COLLATE NOCASE ASC, created_at ASC
  `).all().map((row) => normalizeHabitRecord(row)).filter(Boolean);
}
function listOccurrencesSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM habits_habit_occurrences
    ORDER BY occurrence_date DESC, created_at DESC
  `).all().map((row) => normalizeOccurrenceRecord(row)).filter(Boolean);
}
function findTaskByIdSync(sqlite, taskId) {
  const row = sqlite.prepare(`
    SELECT *
    FROM habits_tasks
    WHERE id = ?
    LIMIT 1
  `).get(taskId);
  if (!row) {
    return null;
  }
  const subitems = sqlite.prepare(`
    SELECT *
    FROM habits_task_subitems
    WHERE task_id = ?
    ORDER BY sort_order ASC, created_at ASC
  `).all(taskId).map((entry) => normalizeTaskSubitemRecord(entry)).filter(Boolean);
  return normalizeTaskRecord(row, subitems);
}
function findHabitByIdSync(sqlite, habitId) {
  const row = sqlite.prepare(`
    SELECT *
    FROM habits_habits
    WHERE id = ?
    LIMIT 1
  `).get(habitId);
  return normalizeHabitRecord(row);
}
function findOccurrenceByIdSync(sqlite, occurrenceId) {
  const row = sqlite.prepare(`
    SELECT *
    FROM habits_habit_occurrences
    WHERE id = ?
    LIMIT 1
  `).get(occurrenceId);
  return normalizeOccurrenceRecord(row);
}
function normalizeHabitCategoryRecord(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: String(row.id),
    name: String(row.name || "").trim(),
    iconId: normalizeCategoryIconId(row.icon_id, "mui:Extension"),
    color: normalizeHexColorValue(row.color, "#8fb3ff"),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso())
  };
}
function findHabitCategoryByIdSync(sqlite, categoryId) {
  const row = sqlite.prepare(`
    SELECT *
    FROM habits_categories
    WHERE id = ?
    LIMIT 1
  `).get(categoryId);
  return normalizeHabitCategoryRecord(row);
}
function findHabitCategoryByNameSync(sqlite, categoryName) {
  const row = sqlite.prepare(`
    SELECT *
    FROM habits_categories
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
    LIMIT 1
  `).get(String(categoryName || "").trim());
  return normalizeHabitCategoryRecord(row);
}
function listHabitCategoriesSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM habits_categories
    ORDER BY LOWER(name) ASC, created_at ASC
  `).all().map(normalizeHabitCategoryRecord).filter(Boolean);
}
function listTableColumns(sqlite, tableName) {
  return sqlite.prepare(`PRAGMA table_info(${tableName})`).all().map((row) => String(row?.name || "").trim()).filter(Boolean);
}
function ensureTableColumn(sqlite, tableName, columnName, definitionSql) {
  const columns = new Set(listTableColumns(sqlite, tableName));
  if (columns.has(columnName)) {
    return;
  }
  sqlite.exec(`
    ALTER TABLE ${tableName}
    ADD COLUMN ${columnName} ${definitionSql}
  `);
}
function ensureHabitosSchema(sqlite) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS habits_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      due_date TEXT NOT NULL,
      time TEXT,
      priority INTEGER NOT NULL,
      notes TEXT,
      reminder_at TEXT,
      is_persistent INTEGER NOT NULL DEFAULT 1,
      subitems_blocking INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_habits_tasks_due_date ON habits_tasks (due_date ASC, time ASC, priority DESC);
    CREATE INDEX IF NOT EXISTS idx_habits_tasks_status ON habits_tasks (status, due_date ASC);

    CREATE TABLE IF NOT EXISTS habits_task_subitems (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_habits_task_subitems_task_id ON habits_task_subitems (task_id, sort_order ASC);

    CREATE TABLE IF NOT EXISTS habits_categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon_id TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_categories_name ON habits_categories (name COLLATE NOCASE);

    CREATE TABLE IF NOT EXISTS habits_habits (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      schedule_type TEXT NOT NULL,
      schedule_config_json TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      time TEXT,
      priority INTEGER NOT NULL,
      progress_mode TEXT NOT NULL DEFAULT 'yes-no',
      progress_config_json TEXT NOT NULL DEFAULT '{}',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      last_occurrence_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_habits_habits_status ON habits_habits (status, start_date ASC);

    CREATE TABLE IF NOT EXISTS habits_habit_occurrences (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      occurrence_date TEXT NOT NULL,
      window_start_at TEXT NOT NULL,
      window_end_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      progress_data_json TEXT NOT NULL DEFAULT '{}',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_occurrences_unique ON habits_habit_occurrences (habit_id, occurrence_date);
    CREATE INDEX IF NOT EXISTS idx_habits_occurrences_status ON habits_habit_occurrences (status, occurrence_date DESC);
  `);
  ensureTableColumn(sqlite, "habits_habits", "progress_mode", "TEXT NOT NULL DEFAULT 'yes-no'");
  ensureTableColumn(sqlite, "habits_habits", "progress_config_json", "TEXT NOT NULL DEFAULT '{}'");
  ensureTableColumn(sqlite, "habits_habit_occurrences", "progress_data_json", "TEXT NOT NULL DEFAULT '{}'");
  sqlite.prepare(`
    UPDATE habits_habits
    SET progress_mode = COALESCE(NULLIF(TRIM(progress_mode), ''), 'yes-no'),
        progress_config_json = COALESCE(NULLIF(TRIM(progress_config_json), ''), '{}')
    WHERE progress_mode IS NULL
       OR TRIM(progress_mode) = ''
       OR progress_config_json IS NULL
       OR TRIM(progress_config_json) = ''
  `).run();
  sqlite.prepare(`
    UPDATE habits_habit_occurrences
    SET progress_data_json = COALESCE(NULLIF(TRIM(progress_data_json), ''), '{}')
    WHERE progress_data_json IS NULL
       OR TRIM(progress_data_json) = ''
  `).run();
}
function replaceTaskSubitemsSync(sqlite, taskId, subitems, timestamp2) {
  sqlite.prepare(`
    DELETE FROM habits_task_subitems
    WHERE task_id = ?
  `).run(taskId);
  if (!subitems.length) {
    return;
  }
  const insertStatement = sqlite.prepare(`
    INSERT INTO habits_task_subitems (
      id,
      task_id,
      title,
      sort_order,
      is_completed,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const subitem of subitems) {
    insertStatement.run(
      subitem.id,
      taskId,
      subitem.title,
      subitem.sortOrder,
      subitem.isCompleted ? 1 : 0,
      timestamp2,
      timestamp2
    );
  }
}
function persistOccurrenceStateSync(sqlite, occurrence, habit, options = {}) {
  const timestamp2 = options.now || nowIso();
  const referenceDate = options.today || todayLocalDate();
  const nextProgressDataJson = normalizeOccurrenceProgressData(
    options.progressDataJson ?? occurrence.progressDataJson,
    habit
  );
  const nextStatus = OCCURRENCE_STATUS_VALUES.has(String(options.status || "").trim().toLowerCase()) ? String(options.status).trim().toLowerCase() : resolveOccurrenceStatus({
    ...occurrence,
    progressDataJson: nextProgressDataJson
  }, habit, referenceDate);
  const completedAt = nextStatus === "completed" ? occurrence.status === "completed" && occurrence.completedAt ? occurrence.completedAt : timestamp2 : null;
  sqlite.prepare(`
    UPDATE habits_habit_occurrences
    SET status = ?,
        progress_data_json = ?,
        completed_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    nextStatus,
    serializeOccurrenceProgressData(nextProgressDataJson, habit),
    completedAt,
    timestamp2,
    occurrence.id
  );
  return findOccurrenceByIdSync(sqlite, occurrence.id);
}
function saveHabitCategorySync(sqlite, payload, options = {}) {
  const existingCategory = payload?.id ? findHabitCategoryByIdSync(sqlite, String(payload.id)) : null;
  const normalized = normalizeHabitCategoryInput(payload, {
    existingCategory
  });
  const existingByName = findHabitCategoryByNameSync(sqlite, normalized.name);
  if (existingByName && existingByName.id !== normalized.id) {
    throw new Error("Ya existe una categoria con ese nombre.");
  }
  const timestamp2 = options.now || nowIso();
  sqlite.transaction(() => {
    if (existingCategory) {
      sqlite.prepare(`
        UPDATE habits_categories
        SET name = ?,
            icon_id = ?,
            color = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        normalized.name,
        normalized.iconId,
        normalized.color,
        timestamp2,
        normalized.id
      );
      if (existingCategory.name !== normalized.name) {
        sqlite.prepare(`
          UPDATE habits_habits
          SET category = ?,
              updated_at = ?
          WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
        `).run(
          normalized.name,
          timestamp2,
          existingCategory.name
        );
        sqlite.prepare(`
          UPDATE habits_tasks
          SET category = ?,
              updated_at = ?
          WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
        `).run(
          normalized.name,
          timestamp2,
          existingCategory.name
        );
      }
    } else {
      sqlite.prepare(`
        INSERT INTO habits_categories (
          id,
          name,
          icon_id,
          color,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        normalized.id,
        normalized.name,
        normalized.iconId,
        normalized.color,
        timestamp2,
        timestamp2
      );
    }
  })();
  return findHabitCategoryByIdSync(sqlite, normalized.id);
}
function deleteHabitCategorySync(sqlite, categoryId, options = {}) {
  const existingCategory = findHabitCategoryByIdSync(sqlite, String(categoryId || ""));
  if (!existingCategory) {
    throw new Error("La categoria no existe.");
  }
  const timestamp2 = options.now || nowIso();
  sqlite.transaction(() => {
    sqlite.prepare(`
      DELETE FROM habits_categories
      WHERE id = ?
    `).run(existingCategory.id);
    sqlite.prepare(`
      UPDATE habits_habits
      SET category = '',
          updated_at = ?
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
    `).run(
      timestamp2,
      existingCategory.name
    );
    sqlite.prepare(`
      UPDATE habits_tasks
      SET category = '',
          updated_at = ?
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
    `).run(
      timestamp2,
      existingCategory.name
    );
  })();
  return existingCategory;
}
function renameCategoryReferencesSync(sqlite, previousName, nextName, options = {}) {
  const fromName = String(previousName || "").trim();
  const toName = String(nextName || "").trim();
  if (!fromName || !toName || fromName === toName) {
    return;
  }
  const timestamp2 = options.now || nowIso();
  sqlite.transaction(() => {
    sqlite.prepare(`
      UPDATE habits_habits
      SET category = ?,
          updated_at = ?
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
    `).run(
      toName,
      timestamp2,
      fromName
    );
    sqlite.prepare(`
      UPDATE habits_tasks
      SET category = ?,
          updated_at = ?
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
    `).run(
      toName,
      timestamp2,
      fromName
    );
  })();
}
function clearCategoryReferencesSync(sqlite, categoryName, options = {}) {
  const normalizedName = String(categoryName || "").trim();
  if (!normalizedName) {
    return;
  }
  const timestamp2 = options.now || nowIso();
  sqlite.transaction(() => {
    sqlite.prepare(`
      UPDATE habits_habits
      SET category = '',
          updated_at = ?
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
    `).run(
      timestamp2,
      normalizedName
    );
    sqlite.prepare(`
      UPDATE habits_tasks
      SET category = '',
          updated_at = ?
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?))
    `).run(
      timestamp2,
      normalizedName
    );
  })();
}
function saveTaskSync(sqlite, payload, options = {}) {
  const existingTask = payload?.id ? findTaskByIdSync(sqlite, String(payload.id)) : null;
  const normalized = normalizeTaskInput(payload, {
    existingTask,
    today: options.today || todayLocalDate()
  });
  const timestamp2 = options.now || nowIso();
  sqlite.transaction(() => {
    if (existingTask) {
      sqlite.prepare(`
        UPDATE habits_tasks
        SET title = ?,
            category = ?,
            due_date = ?,
            time = ?,
            priority = ?,
            notes = ?,
            reminder_at = ?,
            is_persistent = ?,
            subitems_blocking = ?,
            status = ?,
            completed_at = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        normalized.title,
        normalized.category,
        normalized.dueDate,
        normalized.time,
        normalized.priority,
        normalized.notes,
        normalized.reminderAt,
        normalized.isPersistent ? 1 : 0,
        normalized.subitemsBlocking ? 1 : 0,
        normalized.status,
        normalized.status === "completed" ? timestamp2 : null,
        timestamp2,
        normalized.id
      );
    } else {
      sqlite.prepare(`
        INSERT INTO habits_tasks (
          id,
          title,
          category,
          due_date,
          time,
          priority,
          notes,
          reminder_at,
          is_persistent,
          subitems_blocking,
          status,
          completed_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        normalized.id,
        normalized.title,
        normalized.category,
        normalized.dueDate,
        normalized.time,
        normalized.priority,
        normalized.notes,
        normalized.reminderAt,
        normalized.isPersistent ? 1 : 0,
        normalized.subitemsBlocking ? 1 : 0,
        normalized.status,
        normalized.status === "completed" ? timestamp2 : null,
        timestamp2,
        timestamp2
      );
    }
    replaceTaskSubitemsSync(sqlite, normalized.id, normalized.subitems, timestamp2);
  })();
  return findTaskByIdSync(sqlite, normalized.id);
}
function toggleTaskSync(sqlite, taskId, options = {}) {
  const task = findTaskByIdSync(sqlite, taskId);
  if (!task) {
    throw new Error("No encontramos la tarea solicitada.");
  }
  if (task.status !== "completed" && task.subitemsBlocking && task.subitems.some((entry) => !entry.isCompleted)) {
    throw new Error("Completa los sub-items obligatorios antes de cerrar la tarea.");
  }
  const timestamp2 = options.now || nowIso();
  const nextStatus = task.status === "completed" ? "open" : "completed";
  sqlite.prepare(`
    UPDATE habits_tasks
    SET status = ?,
        completed_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    nextStatus,
    nextStatus === "completed" ? timestamp2 : null,
    timestamp2,
    task.id
  );
  return findTaskByIdSync(sqlite, task.id);
}
function deleteTaskSync(sqlite, taskId) {
  sqlite.transaction(() => {
    sqlite.prepare(`
      DELETE FROM habits_task_subitems
      WHERE task_id = ?
    `).run(taskId);
    sqlite.prepare(`
      DELETE FROM habits_tasks
      WHERE id = ?
    `).run(taskId);
  })();
  return true;
}
function saveHabitSync(sqlite, payload, options = {}) {
  const existingHabit = payload?.id ? findHabitByIdSync(sqlite, String(payload.id)) : null;
  const normalized = normalizeHabitInput(payload, {
    existingHabit,
    today: options.today || todayLocalDate()
  });
  const timestamp2 = options.now || nowIso();
  sqlite.transaction(() => {
    if (existingHabit) {
      sqlite.prepare(`
        UPDATE habits_habits
        SET title = ?,
            category = ?,
            schedule_type = ?,
            schedule_config_json = ?,
            start_date = ?,
            end_date = ?,
            time = ?,
            priority = ?,
            progress_mode = ?,
            progress_config_json = ?,
            notes = ?,
            status = ?,
            last_occurrence_date = NULL,
            updated_at = ?
        WHERE id = ?
      `).run(
        normalized.title,
        normalized.category,
        normalized.scheduleType,
        JSON.stringify(normalized.scheduleConfigJson),
        normalized.startDate,
        normalized.endDate,
        normalized.time,
        normalized.priority,
        normalized.progressMode,
        JSON.stringify(normalized.progressConfigJson),
        normalized.notes,
        normalized.status,
        timestamp2,
        normalized.id
      );
      sqlite.prepare(`
        DELETE FROM habits_habit_occurrences
        WHERE habit_id = ?
          AND status IN ('pending', 'failed')
      `).run(normalized.id);
    } else {
      sqlite.prepare(`
        INSERT INTO habits_habits (
          id,
          title,
          category,
          schedule_type,
          schedule_config_json,
          start_date,
          end_date,
          time,
          priority,
          progress_mode,
          progress_config_json,
          notes,
          status,
          last_occurrence_date,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        normalized.id,
        normalized.title,
        normalized.category,
        normalized.scheduleType,
        JSON.stringify(normalized.scheduleConfigJson),
        normalized.startDate,
        normalized.endDate,
        normalized.time,
        normalized.priority,
        normalized.progressMode,
        JSON.stringify(normalized.progressConfigJson),
        normalized.notes,
        normalized.status,
        null,
        timestamp2,
        timestamp2
      );
    }
  })();
  return findHabitByIdSync(sqlite, normalized.id);
}
function toggleOccurrenceSync(sqlite, occurrenceId, options = {}) {
  const occurrence = findOccurrenceByIdSync(sqlite, occurrenceId);
  if (!occurrence) {
    throw new Error("No encontramos la ocurrencia solicitada.");
  }
  const habit = findHabitByIdSync(sqlite, occurrence.habitId);
  if (!habit) {
    throw new Error("No encontramos el habito de esta ocurrencia.");
  }
  if (habit.progressMode !== "yes-no") {
    throw new Error("Este habito se actualiza desde su control diario especifico.");
  }
  const nextStatus = occurrence.status === "pending" ? "completed" : occurrence.status === "completed" ? "failed" : "pending";
  return persistOccurrenceStateSync(sqlite, occurrence, habit, {
    status: nextStatus,
    now: options.now,
    today: options.today
  });
}
function setOccurrenceQuantitySync(sqlite, occurrenceId, value, options = {}) {
  const occurrence = findOccurrenceByIdSync(sqlite, occurrenceId);
  if (!occurrence) {
    throw new Error("No encontramos la ocurrencia solicitada.");
  }
  const habit = findHabitByIdSync(sqlite, occurrence.habitId);
  if (!habit) {
    throw new Error("No encontramos el habito de esta ocurrencia.");
  }
  if (habit.progressMode !== "quantity") {
    throw new Error("Esta ocurrencia no usa progreso por cantidad.");
  }
  const normalizedValue = normalizeNonNegativeIntegerValue(value, null);
  const rawValue = String(value ?? "").trim();
  if (rawValue && normalizedValue === null) {
    throw new Error("Ingresa una cantidad valida para este habito.");
  }
  return persistOccurrenceStateSync(sqlite, occurrence, habit, {
    progressDataJson: {
      value: normalizedValue
    },
    now: options.now,
    today: options.today
  });
}
function toggleOccurrenceChecklistItemSync(sqlite, occurrenceId, itemId, options = {}) {
  const occurrence = findOccurrenceByIdSync(sqlite, occurrenceId);
  if (!occurrence) {
    throw new Error("No encontramos la ocurrencia solicitada.");
  }
  const habit = findHabitByIdSync(sqlite, occurrence.habitId);
  if (!habit) {
    throw new Error("No encontramos el habito de esta ocurrencia.");
  }
  if (habit.progressMode !== "checklist") {
    throw new Error("Esta ocurrencia no usa progreso por checklist.");
  }
  const normalizedItemId = String(itemId || "").trim();
  const checklistItems = getHabitChecklistItems(habit);
  if (!normalizedItemId || !checklistItems.some((entry) => entry.id === normalizedItemId)) {
    throw new Error("No encontramos el sub-item solicitado.");
  }
  const progressDataJson = normalizeOccurrenceProgressData(occurrence.progressDataJson, habit);
  const checkedItemIds = new Set(progressDataJson.checkedItemIds);
  if (checkedItemIds.has(normalizedItemId)) {
    checkedItemIds.delete(normalizedItemId);
  } else {
    checkedItemIds.add(normalizedItemId);
  }
  return persistOccurrenceStateSync(sqlite, occurrence, habit, {
    progressDataJson: {
      checkedItemIds: checklistItems.filter((entry) => checkedItemIds.has(entry.id)).map((entry) => entry.id)
    },
    now: options.now,
    today: options.today
  });
}
function deleteHabitSync(sqlite, habitId) {
  sqlite.transaction(() => {
    sqlite.prepare(`
      DELETE FROM habits_habit_occurrences
      WHERE habit_id = ?
    `).run(habitId);
    sqlite.prepare(`
      DELETE FROM habits_habits
      WHERE id = ?
    `).run(habitId);
  })();
  return true;
}
function syncOccurrencesUntilToday(sqlite, options = {}) {
  const today = options.today || todayLocalDate();
  const timestamp2 = options.now || nowIso();
  const habits = listHabitsSync(sqlite);
  const activeHabits = habits.filter((entry) => entry.status === "active");
  const habitsById = new Map(habits.map((entry) => [entry.id, entry]));
  const summary = {
    inserted: 0,
    reevaluated: 0,
    tasksFailed: 0
  };
  const insertOccurrence = sqlite.prepare(`
    INSERT OR IGNORE INTO habits_habit_occurrences (
      id,
      habit_id,
      occurrence_date,
      window_start_at,
      window_end_at,
      status,
      progress_data_json,
      completed_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateLastOccurrenceDate = sqlite.prepare(`
    UPDATE habits_habits
    SET last_occurrence_date = ?,
        updated_at = ?
    WHERE id = ?
  `);
  const failExpiredTasks = sqlite.prepare(`
    UPDATE habits_tasks
    SET status = 'failed',
        completed_at = NULL,
        updated_at = ?
    WHERE status = 'open'
      AND is_persistent = 0
      AND due_date < ?
  `);
  sqlite.transaction(() => {
    const failedTaskResult = failExpiredTasks.run(timestamp2, today);
    summary.tasksFailed += Number(failedTaskResult.changes || 0);
    for (const habit of activeHabits) {
      const rangeEnd = habit.endDate && compareLocalDates(habit.endDate, today) < 0 ? habit.endDate : today;
      if (compareLocalDates(rangeEnd, habit.startDate) < 0) {
        continue;
      }
      let lastGeneratedDate = null;
      for (const occurrenceDate of eachDateInclusive(habit.startDate, rangeEnd)) {
        if (!doesHabitMatchDate(habit, occurrenceDate)) {
          continue;
        }
        lastGeneratedDate = occurrenceDate;
        const result = insertOccurrence.run(
          createId("occurrence"),
          habit.id,
          occurrenceDate,
          getOccurrenceWindowStartAt(occurrenceDate),
          getOccurrenceWindowEndAt(occurrenceDate),
          "pending",
          "{}",
          null,
          timestamp2,
          timestamp2
        );
        summary.inserted += Number(result.changes || 0);
      }
      if (lastGeneratedDate) {
        updateLastOccurrenceDate.run(lastGeneratedDate, timestamp2, habit.id);
      }
    }
    const occurrences = listOccurrencesSync(sqlite);
    for (const occurrence of occurrences) {
      const habit = habitsById.get(occurrence.habitId);
      if (!habit) {
        continue;
      }
      const resolvedOccurrence = resolveOccurrenceRecord(occurrence, habit, today);
      const nextCompletedAt = resolvedOccurrence.status === "completed" ? occurrence.status === "completed" && occurrence.completedAt ? occurrence.completedAt : timestamp2 : null;
      const nextProgressDataJson = serializeOccurrenceProgressData(resolvedOccurrence.progressDataJson, habit);
      if (occurrence.status === resolvedOccurrence.status && String(occurrence.completedAt || "") === String(nextCompletedAt || "") && serializeOccurrenceProgressData(occurrence.progressDataJson, habit) === nextProgressDataJson) {
        continue;
      }
      sqlite.prepare(`
        UPDATE habits_habit_occurrences
        SET status = ?,
            progress_data_json = ?,
            completed_at = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        resolvedOccurrence.status,
        nextProgressDataJson,
        nextCompletedAt,
        timestamp2,
        occurrence.id
      );
      summary.reevaluated += 1;
    }
  })();
  return summary;
}
function buildTaskQueueItem(task, today) {
  const isOverdue = compareLocalDates(task.dueDate, today) < 0;
  return {
    id: `task:${task.id}`,
    type: "task",
    recordId: task.id,
    title: task.title,
    category: task.category,
    date: task.dueDate,
    time: task.time,
    priority: task.priority,
    status: task.status,
    isOverdue,
    statusLabel: task.status === "completed" ? "Completada" : task.status === "failed" ? "Fallida" : "Abierta",
    summary: isOverdue ? "Sigue pendiente desde un dia anterior." : "Pendiente para hoy.",
    meta: task.isPersistent && isOverdue ? "Pendiente" : task.isPersistent ? "Persistente" : "Tarea del dia",
    subitems: task.subitems,
    subitemsBlocking: task.subitemsBlocking,
    raw: task
  };
}
function buildOccurrenceQueueItem(occurrence, habit, today) {
  const isOverdue = compareLocalDates(occurrence.occurrenceDate, today) < 0;
  const weekdaySummary = habit.scheduleType === "weekdays" ? `Dias fijos: ${normalizeWeekdays(habit.scheduleConfigJson?.weekdays).join(", ")}` : "Frecuencia diaria";
  return {
    id: `occurrence:${occurrence.id}`,
    type: "habit",
    recordId: occurrence.id,
    title: habit.title,
    category: habit.category,
    date: occurrence.occurrenceDate,
    time: habit.time,
    priority: habit.priority,
    status: occurrence.status,
    progressMode: habit.progressMode,
    progressConfigJson: parseJsonObject(habit.progressConfigJson, {}),
    progressDataJson: occurrence.progressDataJson,
    isProjected: Boolean(occurrence.isProjected),
    isOverdue,
    statusLabel: getOccurrenceStatusLabel(occurrence.status),
    summary: weekdaySummary,
    meta: habit.scheduleType === "weekdays" ? "Dias elegidos" : "Cada dia",
    occurrence,
    habit,
    raw: occurrence
  };
}
function buildHistoryItemFromTask(task) {
  return {
    id: `history-task:${task.id}`,
    type: "task",
    recordId: task.id,
    title: task.title,
    category: task.category,
    status: task.status,
    statusLabel: task.status === "completed" ? "Completada" : "Fallida",
    timestamp: task.completedAt || task.updatedAt,
    summary: task.status === "completed" ? "Se completo manualmente." : "Vencio sin completarse.",
    raw: task
  };
}
function buildHistoryItemFromOccurrence(occurrence, habit) {
  return {
    id: `history-occurrence:${occurrence.id}`,
    type: "habit",
    recordId: occurrence.id,
    title: habit?.title || "Habito",
    category: habit?.category || null,
    status: occurrence.status,
    statusLabel: getOccurrenceStatusLabel(occurrence.status),
    timestamp: occurrence.completedAt || occurrence.updatedAt,
    summary: occurrence.status === "completed" ? "Ocurrencia registrada como cumplida." : occurrence.status === "recorded" ? "Se guardo una cantidad para ese dia." : "La ventana del habito cerro sin completarse.",
    occurrence,
    habit,
    raw: occurrence
  };
}
function getTemporalSortValue(entry) {
  const datePart = String(entry?.date || "");
  const timePart = String(entry?.time || "").trim();
  return `${datePart}|${timePart || "99:99"}`;
}
function getQueueCompletionRank(entry) {
  return CLOSED_QUEUE_STATUSES.has(String(entry?.status || "").trim().toLowerCase()) ? 1 : 0;
}
function isTaskVisibleInDailyQueue(task, today, actualToday, {
  isPastView = false,
  isFutureView = false
} = {}) {
  if (!task) {
    return false;
  }
  if (isPastView || isFutureView) {
    return task.dueDate === today;
  }
  const dueDateCompare = compareLocalDates(task.dueDate, today);
  if (task.status === "open") {
    return dueDateCompare <= 0;
  }
  if (dueDateCompare === 0) {
    return true;
  }
  return task.status === "completed" && String(task.completedAt || "").startsWith(actualToday);
}
function compareDailyQueueItems(left, right) {
  const statusRankCompare = getQueueCompletionRank(left) - getQueueCompletionRank(right);
  if (statusRankCompare !== 0) {
    return statusRankCompare;
  }
  const temporalCompare = getTemporalSortValue(left).localeCompare(getTemporalSortValue(right));
  if (temporalCompare !== 0) {
    return temporalCompare;
  }
  const priorityCompare = Number(right?.priority || 0) - Number(left?.priority || 0);
  if (priorityCompare !== 0) {
    return priorityCompare;
  }
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}
function compareUpcomingTasks(left, right) {
  const dateCompare = compareLocalDates(left?.dueDate, right?.dueDate);
  if (dateCompare !== 0) {
    return dateCompare;
  }
  const timeCompare = String(left?.time || "99:99").localeCompare(String(right?.time || "99:99"));
  if (timeCompare !== 0) {
    return timeCompare;
  }
  const priorityCompare = Number(right?.priority || 0) - Number(left?.priority || 0);
  if (priorityCompare !== 0) {
    return priorityCompare;
  }
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}
function compareHistoryEntries(left, right) {
  return String(right?.timestamp || "").localeCompare(String(left?.timestamp || ""));
}
function buildHabitOutcomeSeries(occurrences, options = {}) {
  const endDate = options.endDate || todayLocalDate();
  const days = Number.isInteger(options.days) && options.days > 0 ? options.days : DEFAULT_HABIT_OUTCOME_SERIES_DAYS;
  const startDate = addDaysToLocalDate(endDate, -(days - 1));
  const buckets = new Map(
    eachDateInclusive(startDate, endDate).map((date) => [
      date,
      {
        date,
        completedCount: 0,
        failedCount: 0
      }
    ])
  );
  for (const occurrence of occurrences) {
    if (!occurrence || occurrence.status === "recorded") {
      continue;
    }
    if (compareLocalDates(occurrence.occurrenceDate, startDate) < 0 || compareLocalDates(occurrence.occurrenceDate, endDate) > 0) {
      continue;
    }
    const bucket = buckets.get(occurrence.occurrenceDate);
    if (!bucket) {
      continue;
    }
    if (occurrence.status === "completed") {
      bucket.completedCount += 1;
    } else if (occurrence.status === "failed") {
      bucket.failedCount += 1;
    }
  }
  return {
    rangeStart: startDate,
    rangeEnd: endDate,
    points: [...buckets.values()]
  };
}
function formatHabitOutcomeChartLabel(localDate, rangeValue) {
  const parsed = /* @__PURE__ */ new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return localDate;
  }
  return new Intl.DateTimeFormat("es-AR", rangeValue === "1y" ? {
    day: "2-digit",
    month: "short"
  } : {
    day: "2-digit",
    month: "2-digit"
  }).format(parsed);
}
function buildHabitOutcomeChartFromSeries(series) {
  const points = Array.isArray(series?.points) ? series.points : [];
  const ranges = {};
  for (const rangeDefinition of HABIT_OUTCOME_CHART_RANGES) {
    const visiblePoints = points.slice(-rangeDefinition.days);
    const completedValues = visiblePoints.map((entry) => Number(entry?.completedCount || 0));
    const failedValues = visiblePoints.map((entry) => Number(entry?.failedCount || 0));
    ranges[rangeDefinition.value] = {
      value: rangeDefinition.value,
      label: rangeDefinition.label,
      rangeStart: visiblePoints[0]?.date || series?.rangeEnd || todayLocalDate(),
      rangeEnd: visiblePoints.at(-1)?.date || series?.rangeEnd || todayLocalDate(),
      labels: visiblePoints.map((entry) => formatHabitOutcomeChartLabel(entry.date, rangeDefinition.value)),
      datasets: [
        {
          id: "completed",
          label: "Cumplidos",
          values: completedValues
        },
        {
          id: "failed",
          label: "Fallidos",
          values: failedValues
        }
      ],
      totals: {
        completed: completedValues.reduce((sum, value) => sum + value, 0),
        failed: failedValues.reduce((sum, value) => sum + value, 0)
      }
    };
  }
  return {
    defaultRange: HABIT_OUTCOME_CHART_RANGES[0].value,
    options: HABIT_OUTCOME_CHART_RANGES.map((entry) => ({
      value: entry.value,
      label: entry.label
    })),
    ranges
  };
}
function buildHabitosHomeSnapshot(sqlite, options = {}) {
  const today = options.today || todayLocalDate();
  const actualToday = options.actualToday || today;
  syncOccurrencesUntilToday(sqlite, {
    today: actualToday,
    now: options.now || nowIso()
  });
  const tasks = listTasksSync(sqlite);
  const habits = listHabitsSync(sqlite);
  const categoryCatalog = listHabitCategoriesSync(sqlite);
  const habitsById = new Map(habits.map((entry) => [entry.id, entry]));
  const occurrences = listOccurrencesSync(sqlite).map((occurrence) => resolveOccurrenceRecord(occurrence, habitsById.get(occurrence.habitId), actualToday)).filter(Boolean);
  const isPastView = compareLocalDates(today, actualToday) < 0;
  const isFutureView = compareLocalDates(today, actualToday) > 0;
  const habitOutcomeSeriesEndDate = isFutureView ? actualToday : today;
  const dailyTaskItems = tasks.filter((task) => isTaskVisibleInDailyQueue(task, today, actualToday, {
    isPastView,
    isFutureView
  })).map((task) => buildTaskQueueItem(task, today));
  const persistedHabitItems = occurrences.filter((occurrence) => occurrence.occurrenceDate === today).map((occurrence) => {
    const habit = habitsById.get(occurrence.habitId);
    return habit ? buildOccurrenceQueueItem(occurrence, habit, today) : null;
  }).filter(Boolean);
  const projectedFutureHabitItems = isFutureView ? habits.filter((habit) => doesHabitMatchDate(habit, today)).filter((habit) => !persistedHabitItems.some((item) => item.habit?.id === habit.id)).map((habit) => buildOccurrenceQueueItem(createProjectedOccurrenceRecord(habit, today), habit, today)) : [];
  const dailyHabitItems = [...persistedHabitItems, ...projectedFutureHabitItems];
  const upcomingTasks = tasks.filter((task) => task.status === "open" && compareLocalDates(task.dueDate, actualToday) > 0).sort(compareUpcomingTasks).slice(0, DEFAULT_UPCOMING_LIMIT);
  const recentHistory = [
    ...tasks.filter((task) => task.status === "completed" || task.status === "failed").map(buildHistoryItemFromTask),
    ...occurrences.filter((occurrence) => occurrence.occurrenceDate !== today).filter((occurrence) => occurrence.status === "completed" || occurrence.status === "failed" || occurrence.status === "recorded").map((occurrence) => buildHistoryItemFromOccurrence(occurrence, habitsById.get(occurrence.habitId)))
  ].sort(compareHistoryEntries).slice(0, DEFAULT_HISTORY_LIMIT);
  const completedTaskIdsToday = new Set(
    tasks.filter((task) => task.status === "completed" && String(task.completedAt || "").startsWith(actualToday)).map((task) => task.id)
  );
  const completedOccurrencesToday = occurrences.filter(
    (occurrence) => occurrence.occurrenceDate === actualToday && occurrence.status === "completed"
  );
  return {
    today,
    actualToday,
    tasks,
    habits,
    categoryCatalog,
    habitOutcomeChart: buildHabitOutcomeChartFromSeries(
      buildHabitOutcomeSeries(occurrences, {
        endDate: habitOutcomeSeriesEndDate
      })
    ),
    dailyQueue: [...dailyTaskItems, ...dailyHabitItems].sort(compareDailyQueueItems),
    upcomingTasks,
    recentHistory,
    tasksSummary: {
      queueCount: dailyTaskItems.length,
      openCount: tasks.filter((task) => task.status === "open").length,
      upcomingCount: upcomingTasks.length,
      completedTodayCount: completedTaskIdsToday.size,
      failedCount: tasks.filter((task) => task.status === "failed").length
    },
    habitsSummary: {
      activeCount: habits.filter((habit) => habit.status === "active").length,
      pendingTodayCount: dailyHabitItems.filter((item) => item.status === "pending").length,
      completedTodayCount: completedOccurrencesToday.length,
      failedCount: occurrences.filter((occurrence) => occurrence.status === "failed").length
    }
  };
}

// ../nexus-plugins/life-tracker/src/finance/backend.ts
var import_node_crypto = require("node:crypto");

// ../nexus-plugins/life-tracker/src/finance/constants.js
var FINANCE_MOVEMENT_KINDS = ["income", "expense"];
var FINANCE_MOVEMENT_STATUSES = ["posted", "planned"];
var FINANCE_CASH_DENOMINATIONS = [50, 100, 200, 500, 1e3, 2e3, 1e4, 2e4];

// ../nexus-plugins/life-tracker/src/finance/backend.ts
var LIFE_TRACKER_FINANCE_CHANNEL_PREFIX = "life-tracker:finance";
function createSuccess(data) {
  return {
    ok: true,
    data
  };
}
function createError(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
function nowIso2() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function todayLocalDate2() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function normalizeOptionalText2(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
function normalizeMovementKind(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return FINANCE_MOVEMENT_KINDS.includes(normalized) ? normalized : "expense";
}
function normalizeMovementStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return FINANCE_MOVEMENT_STATUSES.includes(normalized) ? normalized : "posted";
}
function normalizeMovementDate(value) {
  const normalized = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return todayLocalDate2();
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function normalizeAmountCents(payload) {
  if (Number.isFinite(Number(payload?.amountCents))) {
    return Math.max(0, Math.round(Number(payload.amountCents)));
  }
  if (Number.isFinite(Number(payload?.amount))) {
    return Math.max(0, Math.round(Number(payload.amount) * 100));
  }
  const rawValue = String(payload?.amount ?? "").trim();
  if (!rawValue) {
    return 0;
  }
  const normalized = rawValue.replace(/\s+/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue * 100)) : 0;
}
function normalizeComparableText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
function isCashPlatform(value) {
  const normalized = normalizeComparableText(value);
  if (!normalized) {
    return false;
  }
  return normalized === "efectivo" || normalized === "cash" || normalized === "caja" || normalized.startsWith("efectivo ") || normalized.includes(" efectivo");
}
function getSignedAmountCents(movement) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}
function getCashMovementDeltaCents(movement) {
  if (!movement || movement.status !== "posted" || !isCashPlatform(movement.platform)) {
    return 0;
  }
  return getSignedAmountCents(movement);
}
function normalizeMovementRow(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: String(row.id),
    kind: normalizeMovementKind(row.kind),
    status: normalizeMovementStatus(row.status),
    amountCents: Math.max(0, Math.round(Number(row.amount_cents || 0))),
    movementDate: normalizeMovementDate(row.movement_date),
    title: String(row.title || "").trim() || "Movimiento",
    category: normalizeOptionalText2(row.category),
    platform: normalizeOptionalText2(row.platform),
    counterparty: normalizeOptionalText2(row.counterparty),
    notes: normalizeOptionalText2(row.notes),
    createdAt: String(row.created_at || nowIso2()),
    updatedAt: String(row.updated_at || row.created_at || nowIso2())
  };
}
function buildEmptyCashCounts() {
  return Object.fromEntries(
    FINANCE_CASH_DENOMINATIONS.map((denomination) => [String(denomination), 0])
  );
}
function normalizeCashBucketAmount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(0, Math.round(numericValue));
}
function normalizeCashCounts(value) {
  const nextCounts = buildEmptyCashCounts();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return nextCounts;
  }
  for (const denomination of FINANCE_CASH_DENOMINATIONS) {
    nextCounts[String(denomination)] = normalizeCashBucketAmount(value?.[String(denomination)]);
  }
  return nextCounts;
}
function parseCashCountsJson(value) {
  if (typeof value !== "string" || !value.trim()) {
    return buildEmptyCashCounts();
  }
  try {
    return normalizeCashCounts(JSON.parse(value));
  } catch {
    return buildEmptyCashCounts();
  }
}
function calculateCashCountsTotalCents(counts) {
  return FINANCE_CASH_DENOMINATIONS.reduce((total, denomination) => {
    return total + 100 * normalizeCashBucketAmount(counts[String(denomination)]);
  }, 0);
}
function normalizeCashCountRow(row) {
  if (!row?.id) {
    return null;
  }
  const counts = parseCashCountsJson(row.counts_json);
  const totalCountedCents = Math.max(
    0,
    Math.round(Number(row.total_counted_cents ?? calculateCashCountsTotalCents(counts)))
  );
  const expectedCents = Math.round(Number(row.expected_cents || 0));
  const varianceCents = Math.round(Number(row.variance_cents || 0));
  return {
    id: String(row.id),
    countedAt: String(row.counted_at || row.created_at || nowIso2()),
    counts,
    totalCountedCents,
    expectedCents,
    varianceCents,
    createdAt: String(row.created_at || nowIso2())
  };
}
function ensureFinanceSchema(sqlite) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS finance_movements (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      movement_date TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      platform TEXT,
      counterparty TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_finance_movements_date ON finance_movements (movement_date DESC, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_finance_movements_kind_status ON finance_movements (kind, status);
    CREATE INDEX IF NOT EXISTS idx_finance_movements_category ON finance_movements (category);
    CREATE INDEX IF NOT EXISTS idx_finance_movements_platform ON finance_movements (platform);

    CREATE TABLE IF NOT EXISTS finance_cash_counts (
      id TEXT PRIMARY KEY NOT NULL,
      counted_at TEXT NOT NULL,
      counts_json TEXT NOT NULL,
      total_counted_cents INTEGER NOT NULL,
      expected_cents INTEGER NOT NULL,
      variance_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_finance_cash_counts_counted_at ON finance_cash_counts (counted_at DESC, created_at DESC);
  `);
}
function listMovementsSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM finance_movements
    ORDER BY movement_date DESC, updated_at DESC, created_at DESC, title COLLATE NOCASE ASC
  `).all().map((row) => normalizeMovementRow(row)).filter(Boolean);
}
function listCashCountsSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM finance_cash_counts
    ORDER BY counted_at DESC, created_at DESC
  `).all().map((row) => normalizeCashCountRow(row)).filter(Boolean);
}
function findMovementByIdSync(sqlite, movementId) {
  return normalizeMovementRow(
    sqlite.prepare(`
      SELECT *
      FROM finance_movements
      WHERE id = ?
      LIMIT 1
    `).get(movementId)
  );
}
function saveMovementSync(sqlite, payload) {
  sqlite.prepare(`
    INSERT INTO finance_movements (
      id,
      kind,
      status,
      amount_cents,
      movement_date,
      title,
      category,
      platform,
      counterparty,
      notes,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @kind,
      @status,
      @amount_cents,
      @movement_date,
      @title,
      @category,
      @platform,
      @counterparty,
      @notes,
      @created_at,
      @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      kind = excluded.kind,
      status = excluded.status,
      amount_cents = excluded.amount_cents,
      movement_date = excluded.movement_date,
      title = excluded.title,
      category = excluded.category,
      platform = excluded.platform,
      counterparty = excluded.counterparty,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).run({
    id: payload.id,
    kind: payload.kind,
    status: payload.status,
    amount_cents: payload.amountCents,
    movement_date: payload.movementDate,
    title: payload.title,
    category: payload.category,
    platform: payload.platform,
    counterparty: payload.counterparty,
    notes: payload.notes,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt
  });
}
function saveCashCountSync(sqlite, payload) {
  sqlite.prepare(`
    INSERT INTO finance_cash_counts (
      id,
      counted_at,
      counts_json,
      total_counted_cents,
      expected_cents,
      variance_cents,
      created_at
    ) VALUES (
      @id,
      @counted_at,
      @counts_json,
      @total_counted_cents,
      @expected_cents,
      @variance_cents,
      @created_at
    )
  `).run({
    id: payload.id,
    counted_at: payload.countedAt,
    counts_json: JSON.stringify(payload.counts),
    total_counted_cents: payload.totalCountedCents,
    expected_cents: payload.expectedCents,
    variance_cents: payload.varianceCents,
    created_at: payload.createdAt
  });
}
function deleteMovementSync(sqlite, movementId) {
  sqlite.prepare("DELETE FROM finance_movements WHERE id = ?").run(movementId);
}
function normalizeMovementPayload(payload, existing) {
  const title = String(payload?.title || "").trim();
  if (!title) {
    throw new Error("El movimiento necesita un titulo.");
  }
  const amountCents = normalizeAmountCents(payload);
  if (!amountCents) {
    throw new Error("El movimiento necesita un monto mayor a cero.");
  }
  const createdAt = existing?.createdAt || nowIso2();
  return {
    id: String(payload?.id || existing?.id || (0, import_node_crypto.randomUUID)()),
    kind: normalizeMovementKind(payload?.kind ?? existing?.kind),
    status: normalizeMovementStatus(payload?.status ?? existing?.status),
    amountCents,
    movementDate: normalizeMovementDate(payload?.movementDate ?? existing?.movementDate),
    title,
    category: normalizeOptionalText2(payload?.category ?? existing?.category),
    platform: normalizeOptionalText2(payload?.platform ?? existing?.platform),
    counterparty: normalizeOptionalText2(payload?.counterparty ?? existing?.counterparty),
    notes: normalizeOptionalText2(payload?.notes ?? existing?.notes),
    createdAt,
    updatedAt: nowIso2()
  };
}
function getCashAuditSummary(movements, cashCounts) {
  const latestCashCount = cashCounts[0] || null;
  if (!latestCashCount) {
    const expectedWithoutBaselineCents = movements.reduce((total, movement) => {
      return total + getCashMovementDeltaCents(movement);
    }, 0);
    return {
      latestCashCount: null,
      currentExpectedCents: expectedWithoutBaselineCents,
      currentCountedCents: null,
      currentVarianceCents: null
    };
  }
  const movementDeltaSinceLatestCountCents = movements.reduce((total, movement) => {
    return total + (String(movement?.updatedAt || movement?.createdAt || "") > latestCashCount.createdAt ? getCashMovementDeltaCents(movement) : 0);
  }, 0);
  const currentExpectedCents = latestCashCount.totalCountedCents + movementDeltaSinceLatestCountCents;
  return {
    latestCashCount,
    currentExpectedCents,
    currentCountedCents: latestCashCount.totalCountedCents,
    currentVarianceCents: latestCashCount.totalCountedCents - currentExpectedCents
  };
}
function registerFinanceSchema(ctx) {
  ensureFinanceSchema(ctx.requireRepositories().sqlite);
}
async function listFinanceDashboard(ctx) {
  const sqlite = ctx.requireRepositories().sqlite;
  const movements = listMovementsSync(sqlite);
  const cashCounts = listCashCountsSync(sqlite);
  const cashAudit = getCashAuditSummary(movements, cashCounts);
  return {
    movements,
    cashAudit: {
      ...cashAudit,
      counts: cashCounts,
      denominations: FINANCE_CASH_DENOMINATIONS
    }
  };
}
async function saveFinanceMovement(ctx, payload) {
  const sqlite = ctx.requireRepositories().sqlite;
  const requestedId = String(payload?.id || "").trim();
  const existing = requestedId ? findMovementByIdSync(sqlite, requestedId) : null;
  const normalizedMovement = normalizeMovementPayload(payload, existing);
  saveMovementSync(sqlite, normalizedMovement);
  return findMovementByIdSync(sqlite, normalizedMovement.id);
}
async function saveFinanceCashCount(ctx, payload) {
  const sqlite = ctx.requireRepositories().sqlite;
  const movements = listMovementsSync(sqlite);
  const cashCounts = listCashCountsSync(sqlite);
  const summary = getCashAuditSummary(movements, cashCounts);
  const counts = normalizeCashCounts(payload?.counts);
  const totalCountedCents = calculateCashCountsTotalCents(counts);
  const expectedCents = summary.currentExpectedCents;
  const varianceCents = totalCountedCents - expectedCents;
  const countedAt = nowIso2();
  const normalizedCashCount = {
    id: (0, import_node_crypto.randomUUID)(),
    countedAt,
    counts,
    totalCountedCents,
    expectedCents,
    varianceCents,
    createdAt: countedAt
  };
  saveCashCountSync(sqlite, normalizedCashCount);
  return normalizedCashCount;
}
async function deleteFinanceMovement(ctx, movementId) {
  const sqlite = ctx.requireRepositories().sqlite;
  const normalizedId = String(movementId || "").trim();
  if (!normalizedId) {
    throw new Error("Falta el id del movimiento.");
  }
  const existing = findMovementByIdSync(sqlite, normalizedId);
  if (!existing) {
    throw new Error("No se encontro el movimiento a borrar.");
  }
  deleteMovementSync(sqlite, normalizedId);
  return {
    id: normalizedId
  };
}
var lifeTrackerFinancePlugin = {
  ensureSchema(ctx) {
    registerFinanceSchema(ctx);
  },
  activate(ctx) {
    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:list`, async () => {
      try {
        return createSuccess(await listFinanceDashboard(ctx));
      } catch (error) {
        return createError(error, "No se pudieron cargar los datos de finanzas.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:save-movement`, async (_event, payload) => {
      try {
        return createSuccess({
          movement: await saveFinanceMovement(ctx, payload)
        });
      } catch (error) {
        return createError(error, "No se pudo guardar el movimiento.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:save-cash-count`, async (_event, payload) => {
      try {
        return createSuccess({
          cashCount: await saveFinanceCashCount(ctx, payload)
        });
      } catch (error) {
        return createError(error, "No se pudo guardar el arqueo de efectivo.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:delete-movement`, async (_event, payload) => {
      try {
        const movementId = typeof payload === "string" ? payload : String(payload?.id || "");
        return createSuccess({
          deleted: await deleteFinanceMovement(ctx, movementId)
        });
      } catch (error) {
        return createError(error, "No se pudo borrar el movimiento.");
      }
    });
  }
};
var backend_default = lifeTrackerFinancePlugin;

// ../nexus-plugins/life-tracker/src/training/backend.ts
var import_node_crypto2 = require("node:crypto");
var import_promises = __toESM(require("node:fs/promises"));
var import_node_fs = require("node:fs");
var import_node_path = __toESM(require("node:path"));

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};

// src/internalModules/core/markdown-frontmatter.ts
function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
function normalizeSource(source) {
  return String(source || "").replace(/\r\n/g, "\n");
}
function extractYamlFrontmatter(source) {
  const text = normalizeSource(source);
  const lines = text.split("\n");
  if (!lines.length || lines[0].trim() !== "---") {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      rawFrontmatter: "",
      body: text,
      bodyStartLine: 0,
      parseError: null
    };
  }
  let delimiterLineIndex = -1;
  for (let index = 1; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (trimmed === "---" || trimmed === "...") {
      delimiterLineIndex = index;
      break;
    }
  }
  if (delimiterLineIndex < 0) {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      rawFrontmatter: "",
      body: text,
      bodyStartLine: 0,
      parseError: null
    };
  }
  const rawFrontmatter = lines.slice(1, delimiterLineIndex).join("\n");
  const body = lines.slice(delimiterLineIndex + 1).join("\n");
  try {
    const parsed = rawFrontmatter.trim() ? jsYaml.load(rawFrontmatter) : {};
    return {
      hasFrontmatter: true,
      frontmatter: isPlainObject(parsed) ? parsed : {},
      rawFrontmatter,
      body,
      bodyStartLine: delimiterLineIndex + 1,
      parseError: null
    };
  } catch (error) {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      rawFrontmatter: "",
      body: text,
      bodyStartLine: 0,
      parseError: error instanceof Error ? error.message : "No se pudo parsear el frontmatter YAML."
    };
  }
}
function stringifyYamlFrontmatter(frontmatter) {
  if (!isPlainObject(frontmatter) || !Object.keys(frontmatter).length) {
    return "";
  }
  const dumped = jsYaml.dump(frontmatter, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  }).trimEnd();
  if (!dumped) {
    return "";
  }
  return `---
${dumped}
---`;
}
function buildMarkdownDocumentWithFrontmatter({
  frontmatter,
  body
}) {
  const serializedFrontmatter = stringifyYamlFrontmatter(frontmatter);
  const normalizedBody = typeof body === "string" ? body.trim() : "";
  if (!serializedFrontmatter) {
    return normalizedBody ? `${normalizedBody}
` : "";
  }
  if (!normalizedBody) {
    return `${serializedFrontmatter}
`;
  }
  return `${serializedFrontmatter}

${normalizedBody}
`;
}

// ../nexus-plugins/life-tracker/src/training/training-schedule.js
var TRAINING_SCHEDULE_TYPES = /* @__PURE__ */ new Set(["daily", "weekdays"]);
function todayLocalDate3(baseDate = /* @__PURE__ */ new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function normalizeLocalDate2(value, fallbackValue = todayLocalDate3()) {
  const normalized = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackValue;
  }
  return todayLocalDate3(parsed);
}
function normalizeTimeValue2(value) {
  const normalized = String(value ?? "").trim();
  return /^\d{2}:\d{2}$/.test(normalized) ? normalized : null;
}
function compareLocalDates2(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}
function addDaysToLocalDate2(localDate, daysToAdd) {
  const base = /* @__PURE__ */ new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return todayLocalDate3();
  }
  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate3(base);
}
function normalizeWeekdays2(value) {
  if (!Array.isArray(value)) {
    return [1, 2, 3, 4, 5];
  }
  const uniqueValues = new Set(
    value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6)
  );
  return [...uniqueValues].sort((left, right) => left - right);
}
function formatLocalDateToDayOfWeek2(localDate) {
  const parsed = /* @__PURE__ */ new Date(`${localDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getDay();
}
function doesScheduleMatchDate(scheduleType, scheduleConfigJson, occurrenceDate) {
  const normalizedScheduleType = TRAINING_SCHEDULE_TYPES.has(String(scheduleType || "").trim().toLowerCase()) ? String(scheduleType).trim().toLowerCase() : "daily";
  if (normalizedScheduleType === "weekdays") {
    const weekdays = normalizeWeekdays2(scheduleConfigJson?.weekdays);
    return weekdays.includes(formatLocalDateToDayOfWeek2(occurrenceDate));
  }
  return true;
}
function buildOccurrenceDates({
  scheduleType = "daily",
  scheduleConfigJson = {},
  startDate,
  endDate
}) {
  if (!startDate || !endDate || compareLocalDates2(endDate, startDate) < 0) {
    return [];
  }
  const dates = [];
  let cursor = startDate;
  while (compareLocalDates2(cursor, endDate) <= 0) {
    if (doesScheduleMatchDate(scheduleType, scheduleConfigJson, cursor)) {
      dates.push(cursor);
    }
    cursor = addDaysToLocalDate2(cursor, 1);
  }
  return dates;
}
function getOccurrenceWindowStartAt2(occurrenceDate) {
  return `${occurrenceDate}T00:00:00.000`;
}
function getOccurrenceWindowEndAt2(occurrenceDate) {
  return `${occurrenceDate}T23:59:59.999`;
}

// ../nexus-plugins/life-tracker/src/training/training-muscles.js
function normalizeComparableText2(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
var REGION_DEFINITIONS = [
  {
    id: "upper",
    title: "Tren superior",
    groups: [
      {
        id: "chest",
        title: "Pecho",
        muscles: [
          {
            id: "pectoralis-major-clavicular",
            title: "Pectoral superior",
            aliases: ["pectoral clavicular", "upper chest", "upper pec"]
          },
          {
            id: "pectoralis-major-sternal",
            title: "Pectoral medio",
            aliases: ["pectoral", "pecho", "middle chest", "chest"]
          },
          {
            id: "pectoralis-minor",
            title: "Pectoral menor",
            aliases: ["lower chest", "inner chest"]
          }
        ]
      },
      {
        id: "shoulders",
        title: "Hombros",
        muscles: [
          {
            id: "deltoid-anterior",
            title: "Deltoides frontal",
            aliases: ["deltoides anterior", "front delt"]
          },
          {
            id: "deltoid-lateral",
            title: "Deltoides lateral",
            aliases: ["deltoides medio", "side delt"]
          },
          {
            id: "deltoid-posterior",
            title: "Deltoides posterior",
            aliases: ["rear delt", "deltoides trasero"]
          }
        ]
      },
      {
        id: "back",
        title: "Espalda",
        muscles: [
          {
            id: "latissimus-dorsi",
            title: "Dorsal ancho",
            aliases: ["lats", "dorsales", "lat"]
          },
          {
            id: "teres-major",
            title: "Redondo mayor",
            aliases: ["teres major"]
          },
          {
            id: "rhomboids",
            title: "Romboides",
            aliases: ["rhomboid", "romboide"]
          },
          {
            id: "trapezius-middle-lower",
            title: "Trapecio medio e inferior",
            aliases: ["lower traps", "mid traps", "trapecio bajo"]
          }
        ]
      },
      {
        id: "traps-neck",
        title: "Trapecios",
        muscles: [
          {
            id: "trapezius-upper",
            title: "Trapecio superior",
            aliases: ["upper traps", "trapecio alto"]
          },
          {
            id: "levator-scapulae",
            title: "Elevador de la escapula",
            aliases: ["neck support", "levator scapulae"]
          }
        ]
      },
      {
        id: "biceps",
        title: "Biceps",
        muscles: [
          {
            id: "biceps-brachii",
            title: "Biceps braquial",
            aliases: ["biceps", "bicep"]
          },
          {
            id: "brachialis",
            title: "Braquial",
            aliases: ["brachialis"]
          }
        ]
      },
      {
        id: "triceps",
        title: "Triceps",
        muscles: [
          {
            id: "triceps-long-head",
            title: "Triceps cabeza larga",
            aliases: ["triceps long head"]
          },
          {
            id: "triceps-lateral-medial",
            title: "Triceps lateral y medial",
            aliases: ["triceps", "triceps lateral", "triceps medial"]
          }
        ]
      },
      {
        id: "forearms",
        title: "Antebrazos",
        muscles: [
          {
            id: "brachioradialis",
            title: "Braquiorradial",
            aliases: ["brachioradialis"]
          },
          {
            id: "forearm-flexors",
            title: "Flexores del antebrazo",
            aliases: ["forearm flexors", "flexores"]
          },
          {
            id: "forearm-extensors",
            title: "Extensores del antebrazo",
            aliases: ["forearm extensors", "extensores"]
          }
        ]
      }
    ]
  },
  {
    id: "core",
    title: "Core",
    groups: [
      {
        id: "abs",
        title: "Abdomen",
        muscles: [
          {
            id: "rectus-abdominis",
            title: "Recto abdominal",
            aliases: ["abs", "abdominales", "six pack"]
          },
          {
            id: "transverse-abdominis",
            title: "Transverso abdominal",
            aliases: ["core profundo", "transverse abs"]
          }
        ]
      },
      {
        id: "obliques",
        title: "Oblicuos",
        muscles: [
          {
            id: "obliques",
            title: "Oblicuos",
            aliases: ["oblique", "serrato lateral"]
          },
          {
            id: "serratus-anterior",
            title: "Serrato anterior",
            aliases: ["serratus", "boxer muscle"]
          }
        ]
      },
      {
        id: "lumbar",
        title: "Zona lumbar",
        muscles: [
          {
            id: "erector-spinae",
            title: "Erectores espinales",
            aliases: ["lumbar", "espalda baja", "lower back"]
          }
        ]
      }
    ]
  },
  {
    id: "lower",
    title: "Tren inferior",
    groups: [
      {
        id: "glutes",
        title: "Gluteos",
        muscles: [
          {
            id: "gluteus-maximus",
            title: "Gluteo mayor",
            aliases: ["glute max", "gluteo"]
          },
          {
            id: "gluteus-medius",
            title: "Gluteo medio",
            aliases: ["glute med", "abductor gluteo"]
          }
        ]
      },
      {
        id: "quads",
        title: "Cuadriceps",
        muscles: [
          {
            id: "quadriceps",
            title: "Cuadriceps",
            aliases: ["quads", "quad"]
          },
          {
            id: "vastus-medialis",
            title: "Vasto medial",
            aliases: ["teardrop quad", "vmo"]
          }
        ]
      },
      {
        id: "hamstrings",
        title: "Isquiotibiales",
        muscles: [
          {
            id: "hamstrings",
            title: "Isquiotibiales",
            aliases: ["hamstrings", "hams", "femorales"]
          }
        ]
      },
      {
        id: "calves",
        title: "Pantorrillas",
        muscles: [
          {
            id: "gastrocnemius",
            title: "Gemelos",
            aliases: ["gastrocnemius", "calves", "pantorrilla"]
          },
          {
            id: "soleus",
            title: "Soleo",
            aliases: ["soleus"]
          }
        ]
      },
      {
        id: "hips",
        title: "Cadera",
        muscles: [
          {
            id: "adductors",
            title: "Aductores",
            aliases: ["adductor", "inner thigh"]
          },
          {
            id: "abductors",
            title: "Abductores",
            aliases: ["abductor", "outer thigh"]
          },
          {
            id: "hip-flexors",
            title: "Flexores de cadera",
            aliases: ["hip flexor", "psoas"]
          }
        ]
      }
    ]
  }
];
var TRAINING_MUSCLE_REGIONS = REGION_DEFINITIONS.map((region) => ({
  id: region.id,
  title: region.title
}));
var TRAINING_MUSCLE_GROUPS = REGION_DEFINITIONS.flatMap(
  (region) => region.groups.map((group) => ({
    id: group.id,
    title: group.title,
    regionId: region.id,
    regionTitle: region.title
  }))
);
var TRAINING_MUSCLE_CATALOG = REGION_DEFINITIONS.flatMap(
  (region) => region.groups.flatMap(
    (group) => group.muscles.map((muscle) => {
      const aliases = Array.isArray(muscle.aliases) ? [...new Set([muscle.title, ...muscle.aliases].map((entry) => String(entry).trim()).filter(Boolean))] : [muscle.title];
      return {
        id: muscle.id,
        title: muscle.title,
        slug: muscle.id,
        aliases,
        regionId: region.id,
        regionTitle: region.title,
        groupId: group.id,
        groupTitle: group.title,
        searchText: normalizeComparableText2([muscle.id, muscle.title, region.title, group.title, ...aliases].join(" "))
      };
    })
  )
);
var MUSCLE_BY_ID = new Map(TRAINING_MUSCLE_CATALOG.map((muscle) => [muscle.id, muscle]));
var MUSCLE_BY_ALIAS = /* @__PURE__ */ new Map();
for (const muscle of TRAINING_MUSCLE_CATALOG) {
  for (const alias of muscle.aliases) {
    MUSCLE_BY_ALIAS.set(normalizeComparableText2(alias), muscle);
  }
}
function getTrainingMuscleById(muscleId) {
  return MUSCLE_BY_ID.get(String(muscleId || "").trim()) || null;
}
function findTrainingMuscleByAlias(value) {
  const normalized = normalizeComparableText2(value);
  return normalized ? MUSCLE_BY_ALIAS.get(normalized) || null : null;
}
function listTrainingMuscles({
  query = "",
  regionId = "",
  groupId = ""
} = {}) {
  const normalizedQuery = normalizeComparableText2(query);
  const normalizedRegionId = String(regionId || "").trim();
  const normalizedGroupId = String(groupId || "").trim();
  return TRAINING_MUSCLE_CATALOG.filter((muscle) => {
    if (normalizedRegionId && muscle.regionId !== normalizedRegionId) {
      return false;
    }
    if (normalizedGroupId && muscle.groupId !== normalizedGroupId) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return muscle.searchText.includes(normalizedQuery);
  });
}

// ../nexus-plugins/life-tracker/src/training/training-utils.js
function normalizeText(value) {
  return String(value ?? "").trim();
}
function toFiniteNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const normalized = String(value).replace(",", ".");
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return null;
  }
  return numericValue;
}
function cloneJson(value) {
  if (value == null) {
    return null;
  }
  return JSON.parse(JSON.stringify(value));
}
function normalizeTrainingSlug(value, fallback = "training") {
  const source = normalizeText(value || fallback);
  const slug = source.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}
function normalizeOptionalText3(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}
function parseJsonObject2(value, fallback = {}) {
  if (value == null || value === "") {
    return { ...fallback };
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return { ...fallback };
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return { ...fallback };
}
function normalizeMetricBlock(value, { includeRestSeconds = true } = {}) {
  const source = parseJsonObject2(value, {});
  const normalized = {};
  const numberFields = ["sets", "reps", "seconds", "distance", "weight", "rounds"];
  for (const field of numberFields) {
    const numericValue = toFiniteNumber(source[field]);
    if (numericValue != null) {
      normalized[field] = numericValue;
    }
  }
  if (includeRestSeconds) {
    const restSeconds = toFiniteNumber(source.restSeconds);
    if (restSeconds != null) {
      normalized.restSeconds = restSeconds;
    }
  }
  const mode = normalizeOptionalText3(source.mode);
  if (mode) {
    normalized.mode = mode;
  }
  const distanceUnit = normalizeOptionalText3(source.distanceUnit);
  if (distanceUnit) {
    normalized.distanceUnit = distanceUnit;
  }
  const weightUnit = normalizeOptionalText3(source.weightUnit);
  if (weightUnit) {
    normalized.weightUnit = weightUnit;
  }
  const unit = normalizeOptionalText3(source.unit);
  if (unit) {
    normalized.unit = unit;
  }
  const tempo = normalizeOptionalText3(source.tempo);
  if (tempo) {
    normalized.tempo = tempo;
  }
  const notes = normalizeOptionalText3(source.notes);
  if (notes) {
    normalized.notes = notes;
  }
  if (source.extra && typeof source.extra === "object" && !Array.isArray(source.extra)) {
    normalized.extra = cloneJson(source.extra);
  }
  return normalized;
}
function normalizeTrainingMeasurement(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: false });
}
function normalizeTrainingPrescription(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: true });
}
var TRAINING_MEASUREMENT_MODE_LABELS = {
  reps: "Repeticiones",
  time: "Tiempo",
  distance: "Distancia",
  weight: "Peso"
};
function buildTrainingMeasurementUnitSummary(measurement) {
  const data = parseJsonObject2(measurement, {});
  const mode = normalizeOptionalText3(data.mode);
  return mode ? TRAINING_MEASUREMENT_MODE_LABELS[mode] || mode : "";
}
function buildTrainingMetricSummary(metric) {
  const data = parseJsonObject2(metric, {});
  const parts = [];
  const mode = normalizeOptionalText3(data.mode);
  if (mode === "time") {
    if (data.seconds != null) {
      parts.push(`${data.seconds}s`);
    }
  } else if (mode === "distance") {
    if (data.distance != null) {
      const distanceUnit = data.distanceUnit || data.unit || "m";
      parts.push(`${data.distance} ${distanceUnit}`.trim());
    }
  } else if (mode === "weight") {
    if (data.weight != null) {
      const weightUnit = data.weightUnit || data.unit || "kg";
      parts.push(`${data.weight} ${weightUnit}`.trim());
    }
  } else if (data.sets != null && data.reps != null) {
    parts.push(`${data.sets}x${data.reps}`);
  } else if (data.reps != null) {
    parts.push(`${data.reps} reps`);
  } else if (data.seconds != null) {
    parts.push(`${data.seconds}s`);
  } else if (data.distance != null) {
    const distanceUnit = data.distanceUnit || data.unit || "m";
    parts.push(`${data.distance} ${distanceUnit}`.trim());
  } else if (data.weight != null) {
    const weightUnit = data.weightUnit || data.unit || "kg";
    parts.push(`${data.weight} ${weightUnit}`.trim());
  } else if (mode === "reps") {
    parts.push("reps");
  } else if (mode) {
    parts.push(mode);
  }
  if (data.restSeconds != null) {
    parts.push(`rest ${data.restSeconds}s`);
  }
  if (data.tempo) {
    parts.push(`tempo ${data.tempo}`);
  }
  if (!parts.length && data.mode) {
    parts.push(data.mode);
  }
  return parts.join(" - ");
}
function normalizeTrainingLoad(value) {
  const numericValue = Math.round(Number(value));
  if (!Number.isInteger(numericValue)) {
    return null;
  }
  return Math.min(10, Math.max(1, numericValue));
}
function normalizeTrainingMuscleLoads(value, options = {}) {
  const source = Array.isArray(value) ? value : [];
  const includeWarnings = Boolean(options.includeWarnings);
  const uniqueLoads = /* @__PURE__ */ new Map();
  const warnings = [];
  for (const entry of source) {
    const raw = entry && typeof entry === "object" ? entry : { muscleId: entry };
    const rawMuscleId = normalizeOptionalText3(raw.muscleId || raw.id);
    const load2 = normalizeTrainingLoad(raw.load);
    const resolvedMuscle = rawMuscleId ? getTrainingMuscleById(rawMuscleId) : findTrainingMuscleByAlias(raw.title || raw.name || raw.slug || "");
    if (!resolvedMuscle || load2 == null) {
      if (includeWarnings) {
        const warningLabel = normalizeOptionalText3(raw.title || raw.name || raw.slug || rawMuscleId);
        if (warningLabel) {
          warnings.push({
            sourceTitle: warningLabel,
            sourceSlug: normalizeTrainingSlug(warningLabel, "legacy-muscle")
          });
        }
      }
      continue;
    }
    uniqueLoads.set(resolvedMuscle.id, {
      muscleId: resolvedMuscle.id,
      load: load2,
      title: resolvedMuscle.title,
      slug: resolvedMuscle.slug,
      regionId: resolvedMuscle.regionId,
      regionTitle: resolvedMuscle.regionTitle,
      groupId: resolvedMuscle.groupId,
      groupTitle: resolvedMuscle.groupTitle
    });
  }
  const muscleLoads = [...uniqueLoads.values()].sort((left, right) => {
    const groupCompare = String(left.groupTitle || "").localeCompare(String(right.groupTitle || ""));
    if (groupCompare !== 0) {
      return groupCompare;
    }
    return String(left.title || "").localeCompare(String(right.title || ""));
  });
  return includeWarnings ? {
    muscleLoads,
    warnings
  } : muscleLoads;
}
function buildTrainingMuscleLoadSummary(muscleLoads) {
  const list = Array.isArray(muscleLoads) ? muscleLoads : [];
  return list.slice(0, 4).map((entry) => `${entry.title || getTrainingMuscleById(entry.muscleId)?.title || entry.muscleId} ${entry.load}/10`).join(", ");
}
function buildTrainingExerciseSummary(exercise) {
  const parts = [];
  const measurementSummary = buildTrainingMeasurementUnitSummary(exercise?.measurement);
  if (measurementSummary) {
    parts.push(measurementSummary);
  }
  const muscleSummary = buildTrainingMuscleLoadSummary(exercise?.muscleLoads);
  if (muscleSummary) {
    parts.push(muscleSummary);
  }
  return parts.join(" - ");
}
function normalizeRoutineStepKind(value) {
  return normalizeOptionalText3(value) === "rest" ? "rest" : "exercise";
}
function normalizeExerciseSnapshot(rawExercise, rawSegment) {
  return {
    id: normalizeOptionalText3(rawExercise?.id || rawSegment?.exerciseId || rawSegment?.exercise_id),
    title: normalizeOptionalText3(rawExercise?.title || rawSegment?.exerciseTitleSnapshot || rawSegment?.exercise_title_snapshot) || "Ejercicio",
    slug: normalizeOptionalText3(rawExercise?.slug),
    measurement: normalizeTrainingMeasurement(
      rawExercise?.measurement || rawSegment?.exerciseMeasurementSnapshot || rawSegment?.exercise_measurement_snapshot
    )
  };
}
function normalizeStructureStep(step, exerciseLookup = /* @__PURE__ */ new Map(), stepIndex = 0) {
  const raw = step && typeof step === "object" ? step : {};
  const stepKind = normalizeRoutineStepKind(raw.stepKind || raw.kind);
  const exerciseId = stepKind === "rest" ? null : normalizeOptionalText3(raw.exerciseId || raw.exercise_id);
  const exercise = exerciseId ? exerciseLookup.get(exerciseId) : null;
  return {
    id: normalizeOptionalText3(raw.id) || `step-${stepIndex + 1}`,
    type: "step",
    stepKind,
    exerciseId,
    exerciseTitleSnapshot: stepKind === "exercise" ? exercise?.title || normalizeOptionalText3(raw.exerciseTitleSnapshot || raw.exercise_title_snapshot) || "Ejercicio" : null,
    exerciseMeasurementSnapshot: stepKind === "exercise" ? normalizeTrainingMeasurement(
      exercise?.measurement || raw.exerciseMeasurementSnapshot || raw.exercise_measurement_snapshot
    ) : {},
    prescription: normalizeTrainingPrescription(raw.prescription || raw.metric || raw.payload || raw.measurement),
    resolvedExercise: stepKind === "exercise" ? normalizeExerciseSnapshot(exercise, raw) : null
  };
}
function normalizeStructureBlock(block, exerciseLookup = /* @__PURE__ */ new Map(), blockIndex = 0) {
  const raw = block && typeof block === "object" ? block : {};
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const repeatCount = Math.max(1, Math.round(Number(raw.repeatCount || raw.rounds || 1)) || 1);
  return {
    id: normalizeOptionalText3(raw.id) || `block-${blockIndex + 1}`,
    type: "block",
    title: normalizeOptionalText3(raw.title) || `Bloque ${blockIndex + 1}`,
    repeatCount,
    steps: rawSteps.map((step, index) => normalizeStructureStep(step, exerciseLookup, index))
  };
}
function normalizeStructureSegment(segment, exerciseLookup = /* @__PURE__ */ new Map(), index = 0) {
  const raw = segment && typeof segment === "object" ? segment : {};
  const type2 = normalizeOptionalText3(raw.type);
  return type2 === "block" ? normalizeStructureBlock(raw, exerciseLookup, index) : normalizeStructureStep(raw, exerciseLookup, index);
}
function migrateLegacyTrainingSteps(steps, exerciseLookup = /* @__PURE__ */ new Map()) {
  const source = Array.isArray(steps) ? steps : [];
  return source.map((step, index) => normalizeStructureStep(step, exerciseLookup, index));
}
function normalizeTrainingStructure(value, exerciseLookup = /* @__PURE__ */ new Map()) {
  const source = Array.isArray(value) ? value : Array.isArray(value?.segments) ? value.segments : [];
  return source.map((segment, index) => normalizeStructureSegment(segment, exerciseLookup, index));
}
function flattenTrainingStructureSteps(structure, options = {}) {
  const segments = Array.isArray(structure) ? structure : [];
  const includeBlocks = Boolean(options.includeBlocks);
  const flattened = [];
  for (const segment of segments) {
    if (!segment) {
      continue;
    }
    if (segment.type === "block") {
      if (includeBlocks) {
        flattened.push({
          id: segment.id,
          type: "block",
          title: segment.title,
          repeatCount: segment.repeatCount
        });
      }
      for (const step of Array.isArray(segment.steps) ? segment.steps : []) {
        flattened.push({
          ...step,
          parentBlockId: segment.id,
          parentBlockTitle: segment.title,
          parentBlockRepeatCount: segment.repeatCount
        });
      }
      continue;
    }
    flattened.push(segment);
  }
  return flattened;
}
function buildTrainingRoutineStepSummary(step, exerciseLookup = {}) {
  if (!step) {
    return "";
  }
  const stepKind = normalizeRoutineStepKind(step.stepKind || step.kind);
  if (stepKind === "rest") {
    const prescription = parseJsonObject2(step.prescription, {});
    const restSeconds = toFiniteNumber(prescription.restSeconds);
    const notes = normalizeOptionalText3(prescription.notes);
    const parts = [restSeconds != null ? `Rest ${restSeconds}s` : "Rest"];
    if (notes) {
      parts.push(notes);
    }
    return parts.join(" - ");
  }
  const exerciseId = normalizeOptionalText3(step.exerciseId || step.exercise_id);
  const exercise = exerciseId ? exerciseLookup[exerciseId] : null;
  const title = normalizeOptionalText3(
    step.exerciseTitleSnapshot || step.exercise_title_snapshot || step.title || exercise?.title || step.resolvedExercise?.title || "Ejercicio"
  );
  const metricSummary = buildTrainingMetricSummary(step.prescription || step.metric);
  return [title, metricSummary].filter(Boolean).join(" - ");
}
function buildTrainingRoutineSummary(routine, exerciseLookup = {}) {
  const structure = Array.isArray(routine?.structure) ? routine.structure : Array.isArray(routine?.steps) ? migrateLegacyTrainingSteps(routine.steps) : [];
  const flattenedSteps = flattenTrainingStructureSteps(structure).filter((entry) => entry.type === "step");
  const exerciseSteps = flattenedSteps.filter((step) => normalizeRoutineStepKind(step.stepKind || step.kind) !== "rest");
  const blockCount = structure.filter((segment) => segment?.type === "block").length;
  const preview = flattenedSteps.slice(0, 2).map((step) => buildTrainingRoutineStepSummary(step, exerciseLookup)).filter(Boolean).join(" - ");
  const parts = [`${flattenedSteps.length} pasos`, `${exerciseSteps.length} ejercicios`];
  if (blockCount) {
    parts.push(`${blockCount} bloques`);
  }
  if (preview) {
    parts.push(preview);
  }
  return parts.join(" - ");
}
function normalizeTrainingCompletionMode(value, fallback = "yes-no") {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "detailed" ? "detailed" : fallback;
}
function normalizeTrainingAssignmentInput(payload = {}, options = {}) {
  const existingAssignment = options.existingAssignment || null;
  const routineId = normalizeOptionalText3(payload?.routineId ?? existingAssignment?.routineId);
  const startDate = normalizeLocalDate2(payload?.startDate ?? existingAssignment?.startDate);
  const endDateValue = normalizeOptionalText3(payload?.endDate ?? existingAssignment?.endDate);
  const scheduleType = String(payload?.scheduleType ?? existingAssignment?.scheduleType ?? "daily").trim().toLowerCase();
  const normalizedScheduleType = scheduleType === "weekdays" ? "weekdays" : "daily";
  const scheduleConfigJson = normalizedScheduleType === "weekdays" ? { weekdays: normalizeWeekdays2(payload?.scheduleConfigJson?.weekdays ?? existingAssignment?.scheduleConfigJson?.weekdays) } : {};
  const priority = Math.min(100, Math.max(1, Math.round(Number(payload?.priority ?? existingAssignment?.priority ?? 1)) || 1));
  if (!routineId) {
    throw new Error("Selecciona una rutina.");
  }
  return {
    routineId,
    scheduleType: normalizedScheduleType,
    scheduleConfigJson,
    startDate,
    endDate: endDateValue ? normalizeLocalDate2(endDateValue, startDate) : null,
    time: normalizeTimeValue2(payload?.time ?? existingAssignment?.time),
    priority,
    status: normalizeOptionalText3(payload?.status ?? existingAssignment?.status) === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(payload?.completionMode ?? existingAssignment?.completionMode)
  };
}
function normalizeTrainingOccurrenceResult(value, completionMode = "yes-no") {
  const normalizedMode = normalizeTrainingCompletionMode(completionMode);
  if (normalizedMode === "detailed") {
    const source = value && typeof value === "object" ? value : {};
    const entriesSource = Array.isArray(source.entries) ? source.entries : [];
    return {
      mode: "detailed",
      entries: entriesSource.map((entry, index) => {
        const raw = entry && typeof entry === "object" ? entry : {};
        const actual = normalizeTrainingPrescription(raw.actual || raw.metric || raw.prescription || {});
        const hasActual = Object.keys(actual).length > 0;
        if (!hasActual) {
          return null;
        }
        return {
          id: normalizeOptionalText3(raw.id) || `entry-${index + 1}`,
          stepId: normalizeOptionalText3(raw.stepId) || null,
          exerciseId: normalizeOptionalText3(raw.exerciseId) || null,
          title: normalizeOptionalText3(raw.title) || "Ejercicio",
          actual
        };
      }).filter(Boolean)
    };
  }
  return {
    mode: "yes-no",
    completed: true
  };
}

// ../nexus-plugins/life-tracker/src/training/backend.ts
var TRAINING_PLUGIN_ID = "nexus.life-tracker.training";
var LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";
var TRAINING_EXERCISE_KIND = "training_exercise";
var TRAINING_ROUTINE_KIND = "training_routine";
var TRAINING_HISTORY_DAYS = 21;
var TRAINING_HOME_HISTORY_LIMIT = 8;
var TRAINING_CONCEPTS_ROOT = "Concepts/Fitness";
var TRAINING_MUSCLE_CONCEPTS_DIRECTORY = `${TRAINING_CONCEPTS_ROOT}/Muscles`;
var TRAINING_EXERCISE_CONCEPTS_DIRECTORY = `${TRAINING_CONCEPTS_ROOT}/Exercises`;
var TRAINING_LEGACY_FOLDER_NOTE_FILE_NAME = "_folder.md";
var trainingConceptCoverageInFlight = /* @__PURE__ */ new Map();
var TRAINING_CONCEPT_TEMPLATES = {
  "fitness-muscle": {
    frontmatter: ({ payload, title }) => ({
      nexus: {
        defaultView: "read",
        card: {
          title,
          summary: payload.summary?.trim() || ""
        }
      },
      fitness: {
        domain: "training",
        kind: "muscle"
      }
    }),
    body: ({ title, payload }) => [
      `# ${title}`,
      "",
      payload.summary?.trim() || "Describe la funcion principal de este musculo y como se siente cuando trabaja.",
      "",
      "## Funcion",
      "",
      "## Tecnica / ubicacion",
      "",
      "## Videos / embeds",
      "",
      "## Relacionados",
      "",
      "## Notas"
    ].join("\n")
  },
  "fitness-exercise": {
    frontmatter: ({ payload, title }) => ({
      nexus: {
        defaultView: "read",
        card: {
          title,
          summary: payload.summary?.trim() || ""
        }
      },
      fitness: {
        domain: "training",
        kind: "exercise"
      }
    }),
    body: ({ title, payload }) => [
      `# ${title}`,
      "",
      payload.summary?.trim() || "Describe el patron general, la tecnica y cualquier referencia util para ejecutar este ejercicio.",
      "",
      "## Tecnica",
      "",
      "## Videos / embeds",
      "",
      "## Relacionados",
      "",
      "## Notas"
    ].join("\n")
  }
};
function createSuccess2(data) {
  return { ok: true, data };
}
function createError2(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
function nowIso3() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function assertNonEmptyString(value, fieldName) {
  const normalized = normalizeOptionalText3(value);
  if (!normalized) {
    throw new Error(`${fieldName} es obligatorio.`);
  }
  return normalized;
}
function parseRowJson(value, fallback) {
  const parsed = parseJsonObject2(value, fallback);
  return parsed;
}
function isPlainObject2(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
function cloneJsonValue(value) {
  if (value == null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}
function deepMergeObjects(baseValue, overrideValue) {
  const result = {
    ...cloneJsonValue(baseValue)
  };
  for (const [key, value] of Object.entries(overrideValue)) {
    if (isPlainObject2(value) && isPlainObject2(result[key])) {
      result[key] = deepMergeObjects(result[key], value);
      continue;
    }
    result[key] = cloneJsonValue(value);
  }
  return result;
}
function getRepositories(ctx) {
  return ctx.requireRepositories();
}
function getSqlite(ctx) {
  return getRepositories(ctx).sqlite;
}
function normalizeRelativeContentPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+/g, "/").replace(/\/$/, "").trim();
}
function resolveAbsoluteContentPath(ctx, relativePath) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  return normalizedRelativePath ? import_node_path.default.join(ctx.vault.contentPath, normalizedRelativePath) : "";
}
function readFrontmatterFromMarkdownPath(markdownPath) {
  if (!markdownPath) {
    return {};
  }
  try {
    const content = (0, import_node_fs.readFileSync)(markdownPath, "utf8");
    const { frontmatter } = extractYamlFrontmatter(content);
    return isPlainObject2(frontmatter) ? frontmatter : {};
  } catch {
    return {};
  }
}
function selectTrainingDocRowByConceptIdSync(sqlite, conceptId) {
  return sqlite.prepare(`
    SELECT
      c.id AS concept_id,
      c.item_id AS item_id,
      c.title AS title,
      c.summary AS summary,
      i.path AS item_path
    FROM concepts c
    LEFT JOIN items i ON i.id = c.item_id
    WHERE c.id = ?
    LIMIT 1
  `).get(conceptId) ?? null;
}
function buildTrainingDocRecordSync(ctx, row) {
  if (!row?.concept_id || !row?.item_id || !row?.item_path) {
    return null;
  }
  const relativePath = normalizeRelativeContentPath(row.item_path);
  const itemPath = resolveAbsoluteContentPath(ctx, relativePath);
  return {
    conceptId: String(row.concept_id),
    itemId: String(row.item_id),
    itemPath,
    relativePath: relativePath || null,
    title: String(row.title || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    frontmatter: readFrontmatterFromMarkdownPath(itemPath)
  };
}
function getTrainingDocRecordByConceptIdSync(ctx, conceptId) {
  const normalizedConceptId = normalizeOptionalText3(conceptId);
  if (!normalizedConceptId) {
    return null;
  }
  const sqlite = getSqlite(ctx);
  return buildTrainingDocRecordSync(ctx, selectTrainingDocRowByConceptIdSync(sqlite, normalizedConceptId));
}
function listTrainingMuscleDocRowsSync(sqlite) {
  return sqlite.prepare(`
    SELECT
      tmc.muscle_id,
      c.id AS concept_id,
      c.item_id AS item_id,
      c.title AS title,
      c.summary AS summary,
      i.path AS item_path
    FROM training_muscle_concepts tmc
    LEFT JOIN concepts c ON c.id = tmc.concept_id
    LEFT JOIN items i ON i.id = c.item_id
    ORDER BY tmc.muscle_id ASC
  `).all();
}
function getTrainingMuscleDocsByIdSync(ctx) {
  const sqlite = getSqlite(ctx);
  const docsById = /* @__PURE__ */ new Map();
  for (const row of listTrainingMuscleDocRowsSync(sqlite)) {
    const doc = buildTrainingDocRecordSync(ctx, row);
    if (doc) {
      docsById.set(String(row.muscle_id), doc);
    }
  }
  return docsById;
}
function enrichTrainingMuscleCatalogSync(ctx, muscles = TRAINING_MUSCLE_CATALOG) {
  const docsById = getTrainingMuscleDocsByIdSync(ctx);
  return muscles.map((muscle) => ({
    ...muscle,
    doc: docsById.get(muscle.id) || findTrainingDocRecordByRelativePathSync(
      ctx,
      normalizeRelativeContentPath(`${TRAINING_MUSCLE_CONCEPTS_DIRECTORY}/${muscle.id}.md`),
      muscle.title,
      `${muscle.groupTitle} - ${muscle.regionTitle}`
    ) || null
  }));
}
function ensureTableColumn2(sqlite, tableName, columnName, definition) {
  const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column) => String(column?.name || "").trim() === columnName)) {
    return;
  }
  sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}
function getTrainingSearchDocumentId(prefix, id) {
  return `${TRAINING_PLUGIN_ID}:${prefix}:${id}`;
}
function allocateUniqueSlug(baseSlug, existsBySlug, currentId = null) {
  return (async () => {
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const existing = await existsBySlug(slug);
      if (!existing || String(existing.id) === String(currentId || "")) {
        return slug;
      }
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  })();
}
function allocateUniqueSlugSync(baseSlug, existsBySlug, currentId = null) {
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = existsBySlug(slug);
    if (!existing || String(existing.id) === String(currentId || "")) {
      return slug;
    }
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
function getTrainingConceptTemplate(templateId) {
  const normalizedTemplateId = normalizeOptionalText3(templateId);
  return normalizedTemplateId ? TRAINING_CONCEPT_TEMPLATES[normalizedTemplateId] || null : null;
}
function buildTrainingConceptFrontmatter(title, slug, payload) {
  const template = getTrainingConceptTemplate(payload.templateId);
  const templateFrontmatter = template?.frontmatter?.({
    payload,
    slug,
    title
  }) || {};
  const payloadFrontmatter = isPlainObject2(payload.frontmatter) ? payload.frontmatter : {};
  if (!Object.keys(templateFrontmatter).length && !Object.keys(payloadFrontmatter).length) {
    return {};
  }
  return deepMergeObjects(templateFrontmatter, payloadFrontmatter);
}
function buildTrainingConceptBody(title, slug, payload) {
  if (typeof payload.content === "string") {
    return payload.content;
  }
  const template = getTrainingConceptTemplate(payload.templateId);
  const templatedBody = template?.body?.({
    payload,
    slug,
    title
  });
  if (typeof templatedBody === "string" && templatedBody.trim()) {
    return templatedBody;
  }
  const summary = payload.summary?.trim();
  return summary ? `# ${title}

${summary}` : `# ${title}`;
}
function buildTrainingConceptMarkdownContent(title, slug, payload) {
  return buildMarkdownDocumentWithFrontmatter({
    frontmatter: buildTrainingConceptFrontmatter(title, slug, payload),
    body: buildTrainingConceptBody(title, slug, payload)
  });
}
async function allocateTrainingConceptMarkdownPath(directoryAbsolutePath, baseSlug) {
  let filePath = import_node_path.default.join(directoryAbsolutePath, `${baseSlug}.md`);
  let suffix = 2;
  while (true) {
    try {
      await import_promises.default.access(filePath);
      filePath = import_node_path.default.join(directoryAbsolutePath, `${baseSlug}-${suffix}.md`);
      suffix += 1;
    } catch {
      return filePath;
    }
  }
}
function selectTrainingItemRowsByPathSync(sqlite, relativePath) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return [];
  }
  return sqlite.prepare(`
    SELECT *
    FROM items
    WHERE LOWER(path) = LOWER(?)
      AND COALESCE(deleted, 0) = 0
    ORDER BY
      CASE WHEN type = 'file' THEN 0 ELSE 1 END ASC,
      id ASC
  `).all(normalizedRelativePath);
}
function canDeleteTrainingStaleItemSync(sqlite, itemId) {
  const childCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM items
    WHERE parentId = ?
      AND COALESCE(deleted, 0) = 0
  `).get(itemId)?.count ?? 0;
  if (Number(childCount) > 0) {
    return false;
  }
  const conceptCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM concepts
    WHERE item_id = ?
  `).get(itemId)?.count ?? 0;
  if (Number(conceptCount) > 0) {
    return false;
  }
  const searchCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM search_documents
    WHERE item_id = ?
  `).get(itemId)?.count ?? 0;
  if (Number(searchCount) > 0) {
    return false;
  }
  const markdownLinkCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM markdown_links
    WHERE source_item_id = ?
       OR resolved_item_id = ?
  `).get(itemId, itemId)?.count ?? 0;
  return Number(markdownLinkCount) <= 0;
}
function pruneTrainingItemRowsByPathSync(sqlite, relativePath, preferredType, keepItemId = null) {
  const rows = selectTrainingItemRowsByPathSync(sqlite, relativePath);
  if (!rows.length) {
    return;
  }
  const normalizedKeepId = normalizeOptionalText3(keepItemId);
  const preferredRow = normalizedKeepId ? rows.find((row) => String(row.id) === normalizedKeepId) || null : rows.find((row) => String(row.type) === preferredType) || rows[0] || null;
  for (const row of rows) {
    if (preferredRow?.id && String(row.id) === String(preferredRow.id)) {
      continue;
    }
    if (!canDeleteTrainingStaleItemSync(sqlite, String(row.id))) {
      continue;
    }
    sqlite.prepare("DELETE FROM items WHERE id = ?").run(String(row.id));
  }
}
function deleteTrainingItemRowsByPathSync(sqlite, relativePath) {
  for (const row of selectTrainingItemRowsByPathSync(sqlite, relativePath)) {
    if (!canDeleteTrainingStaleItemSync(sqlite, String(row.id))) {
      continue;
    }
    sqlite.prepare("DELETE FROM items WHERE id = ?").run(String(row.id));
  }
}
function pruneMissingTrainingItemRowsByPathSync(ctx, relativePath) {
  const sqlite = getSqlite(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return;
  }
  for (const row of selectTrainingItemRowsByPathSync(sqlite, normalizedRelativePath)) {
    const absolutePath = resolveAbsoluteContentPath(ctx, row.path || normalizedRelativePath);
    if (absolutePath && (0, import_node_fs.existsSync)(absolutePath)) {
      continue;
    }
    if (!canDeleteTrainingStaleItemSync(sqlite, String(row.id))) {
      continue;
    }
    sqlite.prepare("DELETE FROM items WHERE id = ?").run(String(row.id));
  }
}
async function findTrainingItemByRelativePath(ctx, relativePath, expectedType) {
  const repositories = getRepositories(ctx);
  const sqlite = getSqlite(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return expectedType === "folder" ? repositories.items.findRoot() : null;
  }
  pruneMissingTrainingItemRowsByPathSync(ctx, normalizedRelativePath);
  pruneTrainingItemRowsByPathSync(sqlite, normalizedRelativePath, expectedType);
  const preferredRow = selectTrainingItemRowsByPathSync(sqlite, normalizedRelativePath).find((row) => String(row.type) === expectedType) || null;
  return preferredRow?.id ? repositories.items.findById(String(preferredRow.id)) : null;
}
async function ensureTrainingItemPath(ctx, relativePath, finalType) {
  const repositories = getRepositories(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return repositories.items.findRoot();
  }
  const existing = await findTrainingItemByRelativePath(ctx, normalizedRelativePath, finalType);
  if (existing) {
    return existing;
  }
  const rootItem = await repositories.items.findRoot();
  if (!rootItem) {
    throw new Error("No encontramos la raiz del vault para registrar el item.");
  }
  const segments = normalizedRelativePath.split("/").filter(Boolean);
  let currentItem = rootItem;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLastSegment = index === segments.length - 1;
    const segmentRelativePath = segments.slice(0, index + 1).join("/");
    const expectedType = isLastSegment ? finalType : "folder";
    const existingChild = await repositories.items.findChildByParentAndName(currentItem.id, segment);
    if (existingChild) {
      currentItem = existingChild;
      if (isLastSegment && String(existingChild.type) !== expectedType) {
        currentItem = await existingChild.update({
          type: expectedType,
          icon: expectedType === "folder" ? "folder" : "file",
          extension: expectedType === "file" ? import_node_path.default.extname(segment).replace(/^\./, "") || null : null
        });
      }
      continue;
    }
    currentItem = await repositories.items.create({
      id: (0, import_node_crypto2.randomUUID)(),
      name: segment,
      path: segmentRelativePath,
      relative_path: segmentRelativePath,
      type: expectedType,
      parentId: currentItem.id,
      icon: expectedType === "folder" ? "folder" : "file",
      extension: expectedType === "file" ? import_node_path.default.extname(segment).replace(/^\./, "") || null : null
    });
    if (!currentItem) {
      throw new Error(`No se pudo registrar el item del vault: ${segmentRelativePath}`);
    }
  }
  return currentItem;
}
async function createTrainingConceptNote(ctx, payload) {
  const repositories = getRepositories(ctx);
  const title = assertNonEmptyString(payload?.title, "title");
  const baseSlug = normalizeTrainingSlug(payload.slug || title, "concept");
  const slug = await allocateUniqueSlug(
    baseSlug,
    (nextSlug) => repositories.concepts.findBySlug(nextSlug)
  );
  const relativeDirectoryPath = normalizeRelativeContentPath(
    payload.relativeDirectoryPath || TRAINING_CONCEPTS_ROOT
  );
  const directoryAbsolutePath = resolveAbsoluteContentPath(ctx, relativeDirectoryPath);
  const markdownAbsolutePath = await allocateTrainingConceptMarkdownPath(directoryAbsolutePath, slug);
  const markdownFileName = import_node_path.default.basename(markdownAbsolutePath);
  const markdownRelativePath = normalizeRelativeContentPath(
    relativeDirectoryPath ? `${relativeDirectoryPath}/${markdownFileName}` : markdownFileName
  );
  await import_promises.default.mkdir(directoryAbsolutePath, { recursive: true });
  await import_promises.default.writeFile(
    markdownAbsolutePath,
    buildTrainingConceptMarkdownContent(title, slug, payload),
    { flag: "wx" }
  );
  await ensureTrainingItemPath(ctx, relativeDirectoryPath, "folder");
  const item = await ensureTrainingItemPath(ctx, markdownRelativePath, "file");
  if (!item?.id) {
    throw new Error(`No se pudo registrar el markdown del concepto: ${markdownRelativePath}`);
  }
  const existingConcept = await repositories.concepts.findByItemId(String(item.id));
  const concept = existingConcept || await repositories.concepts.create({
    title,
    slug,
    itemId: String(item.id),
    summary: payload.summary ?? null
  });
  return {
    concept,
    item
  };
}
function deleteTrainingSearchDocument(sqlite, documentId) {
  sqlite.prepare("DELETE FROM search_documents_fts WHERE document_id = ?").run(documentId);
  sqlite.prepare("DELETE FROM search_documents WHERE id = ?").run(documentId);
}
function upsertTrainingSearchDocument(sqlite, payload) {
  const timestamp2 = nowIso3();
  const row = {
    id: payload.id,
    item_id: null,
    entity_ref_id: payload.entityRefId,
    kind: payload.kind,
    title: payload.title,
    subtitle: payload.subtitle,
    path: null,
    body: payload.body,
    source_hash: null,
    indexed_at: timestamp2,
    metadata: JSON.stringify(payload.metadata ?? {})
  };
  sqlite.prepare("DELETE FROM search_documents_fts WHERE document_id = ?").run(row.id);
  sqlite.prepare("DELETE FROM search_documents WHERE id = ?").run(row.id);
  sqlite.prepare(`
    INSERT INTO search_documents (
      id, item_id, entity_ref_id, kind, title, subtitle, path, body, source_hash, indexed_at, metadata
    ) VALUES (
      @id, @item_id, @entity_ref_id, @kind, @title, @subtitle, @path, @body, @source_hash, @indexed_at, @metadata
    )
  `).run(row);
  sqlite.prepare(`
    INSERT INTO search_documents_fts (document_id, title, subtitle, body)
    VALUES (?, ?, ?, ?)
  `).run(row.id, row.title, row.subtitle || "", row.body || "");
}
function findTrainingExerciseBySlugSync(sqlite, slug) {
  return sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
  `).get(slug) ?? null;
}
function findTrainingRoutineBySlugSync(sqlite, slug) {
  return sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
  `).get(slug) ?? null;
}
function listLegacyExerciseMusclesSync(sqlite, entityRefId) {
  return sqlite.prepare(`
    SELECT
      c.title AS concept_title,
      c.slug AS concept_slug
    FROM relations r
    LEFT JOIN concepts c ON c.entity_ref_id = r.to_entity_ref_id
    WHERE r.from_entity_ref_id = ?
      AND r.source = 'training'
      AND r.type = 'targets'
      AND r.status = 'active'
    ORDER BY r.created_at ASC
  `).all(entityRefId).map((row) => ({
    title: String(row?.concept_title || "").trim(),
    slug: String(row?.concept_slug || "").trim(),
    load: 5
  })).filter((entry) => entry.title || entry.slug);
}
function findLegacyExerciseSearchDocumentSync(sqlite, entityRefId) {
  return sqlite.prepare(`
    SELECT id, title, subtitle, body, metadata
    FROM search_documents
    WHERE entity_ref_id = ?
      AND id LIKE 'nexus.training:exercise:%'
    ORDER BY indexed_at DESC
    LIMIT 1
  `).get(entityRefId) ?? null;
}
function normalizeExerciseRecord(ctx, row) {
  if (!row?.id) {
    return null;
  }
  const sqlite = getSqlite(ctx);
  const measurement = parseRowJson(row.measurement_json, {});
  const storedMuscleLoads = parseRowJson(row.muscle_loads_json, []);
  const storedWarnings = parseRowJson(row.legacy_muscle_warnings_json, []);
  const fallbackLegacyMuscles = !storedMuscleLoads.length ? listLegacyExerciseMusclesSync(sqlite, String(row.entity_ref_id)) : [];
  const fallbackLegacyData = fallbackLegacyMuscles.length ? normalizeTrainingMuscleLoads(fallbackLegacyMuscles, { includeWarnings: true }) : { muscleLoads: [], warnings: [] };
  const muscleLoads = storedMuscleLoads.length ? normalizeTrainingMuscleLoads(storedMuscleLoads) : fallbackLegacyData.muscleLoads;
  const legacyWarnings = storedWarnings.length ? storedWarnings : fallbackLegacyData.warnings;
  return {
    id: String(row.id),
    entityRefId: String(row.entity_ref_id),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    notes: row.notes == null ? null : String(row.notes),
    measurement,
    muscleLoads,
    legacyWarnings,
    createdAt: String(row.created_at || nowIso3()),
    updatedAt: String(row.updated_at || row.created_at || nowIso3()),
    searchSummary: buildTrainingExerciseSummary({
      measurement,
      muscleLoads
    }),
    doc: getTrainingDocRecordByConceptIdSync(ctx, row.concept_id) || findTrainingDocRecordByRelativePathSync(
      ctx,
      normalizeRelativeContentPath(`${TRAINING_EXERCISE_CONCEPTS_DIRECTORY}/${String(row.slug || "").trim()}.md`),
      String(row.title || "").trim(),
      row.summary == null ? null : String(row.summary)
    )
  };
}
function listTrainingExercisesSync(ctx) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE status = 'active'
    ORDER BY title COLLATE NOCASE ASC, title ASC
  `).all();
  return rows.map((row) => normalizeExerciseRecord(ctx, row)).filter((exercise) => Boolean(exercise));
}
function migrateLegacySearchExercisesSync(ctx) {
  const sqlite = getSqlite(ctx);
  const legacyRows = sqlite.prepare(`
    SELECT er.id AS entity_ref_id, er.created_at, er.updated_at
    FROM entity_refs er
    LEFT JOIN training_exercises te ON te.entity_ref_id = er.id
    WHERE er.kind = ?
      AND er.status = 'active'
      AND te.id IS NULL
    ORDER BY er.created_at ASC
  `).all(TRAINING_EXERCISE_KIND);
  for (const legacyRow of legacyRows) {
    const legacyDocument = findLegacyExerciseSearchDocumentSync(sqlite, String(legacyRow.entity_ref_id));
    if (!legacyDocument) {
      continue;
    }
    const title = normalizeOptionalText3(legacyDocument.title);
    if (!title) {
      continue;
    }
    const metadata = parseRowJson(legacyDocument.metadata, {});
    const rawLegacyMuscles = Array.isArray(metadata?.muscles) && metadata.muscles.length ? metadata.muscles : listLegacyExerciseMusclesSync(sqlite, String(legacyRow.entity_ref_id));
    const normalizedLegacyMuscles = normalizeTrainingMuscleLoads(rawLegacyMuscles, { includeWarnings: true });
    const measurement = normalizeTrainingMeasurement(metadata?.measurement);
    const summary = normalizeOptionalText3(metadata?.summary || legacyDocument.subtitle);
    const notes = normalizeOptionalText3(metadata?.notes);
    const exerciseId = normalizeOptionalText3(metadata?.exerciseId) || normalizeOptionalText3(metadata?.id) || (0, import_node_crypto2.randomUUID)();
    const slug = allocateUniqueSlugSync(
      normalizeTrainingSlug(metadata?.slug || title, "exercise"),
      (nextSlug) => findTrainingExerciseBySlugSync(sqlite, nextSlug)
    );
    const timestamp2 = nowIso3();
    sqlite.prepare(`
      INSERT INTO training_exercises (
        id, entity_ref_id, title, slug, summary, notes, measurement_json, muscle_loads_json,
        legacy_muscle_warnings_json, status, created_at, updated_at
      ) VALUES (
        @id, @entity_ref_id, @title, @slug, @summary, @notes, @measurement_json, @muscle_loads_json,
        @legacy_muscle_warnings_json, @status, @created_at, @updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        entity_ref_id = excluded.entity_ref_id,
        title = excluded.title,
        slug = excluded.slug,
        summary = excluded.summary,
        notes = excluded.notes,
        measurement_json = excluded.measurement_json,
        muscle_loads_json = excluded.muscle_loads_json,
        legacy_muscle_warnings_json = excluded.legacy_muscle_warnings_json,
        status = excluded.status,
        updated_at = excluded.updated_at
    `).run({
      id: exerciseId,
      entity_ref_id: String(legacyRow.entity_ref_id),
      title,
      slug,
      summary,
      notes,
      measurement_json: JSON.stringify(measurement || {}),
      muscle_loads_json: JSON.stringify(normalizedLegacyMuscles.muscleLoads || []),
      legacy_muscle_warnings_json: JSON.stringify(normalizedLegacyMuscles.warnings || []),
      status: "active",
      created_at: String(legacyRow.created_at || timestamp2),
      updated_at: String(legacyRow.updated_at || legacyRow.created_at || timestamp2)
    });
    const savedRow = sqlite.prepare(`
      SELECT *
      FROM training_exercises
      WHERE entity_ref_id = ?
      LIMIT 1
    `).get(String(legacyRow.entity_ref_id));
    const savedExercise = savedRow ? normalizeExerciseRecord(ctx, savedRow) : null;
    if (!savedExercise) {
      continue;
    }
    upsertTrainingSearchDocument(sqlite, {
      id: getTrainingSearchDocumentId("exercise", savedExercise.id),
      entityRefId: savedExercise.entityRefId,
      kind: "concept",
      title: savedExercise.title,
      subtitle: savedExercise.searchSummary || savedExercise.summary,
      body: [
        savedExercise.summary,
        savedExercise.notes,
        savedExercise.searchSummary ? `Musculos: ${savedExercise.searchSummary}` : null
      ].filter(Boolean).join("\n\n"),
      metadata: {
        pluginId: TRAINING_PLUGIN_ID,
        domain: "training",
        type: "exercise",
        exerciseId: savedExercise.id,
        measurement: savedExercise.measurement,
        muscleLoads: savedExercise.muscleLoads
      }
    });
  }
}
function listLegacyRoutineStepsSync(ctx, routineId) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT s.*, e.title AS exercise_title, e.slug AS exercise_slug, e.measurement_json AS exercise_measurement_json
    FROM training_routine_steps s
    LEFT JOIN training_exercises e ON e.id = s.exercise_id
    WHERE s.routine_id = ?
    ORDER BY s.sort_order ASC, s.created_at ASC
  `).all(routineId);
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  return rows.map((row) => ({
    id: String(row.id),
    kind: String(row.kind || "exercise").trim().toLowerCase() === "rest" ? "rest" : "exercise",
    exerciseId: row.exercise_id == null ? null : String(row.exercise_id),
    exerciseTitleSnapshot: row.exercise_title_snapshot == null ? row.exercise_title == null ? null : String(row.exercise_title) : String(row.exercise_title_snapshot),
    exerciseMeasurementSnapshot: parseRowJson(
      row.exercise_measurement_snapshot_json || row.exercise_measurement_json,
      {}
    ),
    prescription: normalizeTrainingPrescription(row.prescription_json),
    resolvedExercise: row.exercise_id ? exerciseLookup.get(String(row.exercise_id)) || null : null
  }));
}
function normalizeRoutineRecord(ctx, row) {
  if (!row?.id) {
    return null;
  }
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const storedStructure = parseRowJson(row.structure_json, []);
  const structure = storedStructure.length ? normalizeTrainingStructure(storedStructure, exerciseLookup) : migrateLegacyTrainingSteps(listLegacyRoutineStepsSync(ctx, String(row.id)), exerciseLookup);
  const lookup = Object.fromEntries(
    [...exerciseLookup.entries()].map(([id, exercise]) => [id, exercise])
  );
  return {
    id: String(row.id),
    entityRefId: String(row.entity_ref_id),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    notes: row.notes == null ? null : String(row.notes),
    structure,
    createdAt: String(row.created_at || nowIso3()),
    updatedAt: String(row.updated_at || row.created_at || nowIso3()),
    searchSummary: buildTrainingRoutineSummary({ structure }, lookup)
  };
}
function listTrainingRoutinesSync(ctx) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE status = 'active'
    ORDER BY title COLLATE NOCASE ASC, title ASC
  `).all();
  return rows.map((row) => normalizeRoutineRecord(ctx, row)).filter((routine) => Boolean(routine));
}
function normalizeAssignmentRecord(ctx, row, routineLookup) {
  if (!row?.id) {
    return null;
  }
  const routineId = String(row.routine_id || "");
  const routine = routineLookup.get(routineId) || null;
  return {
    id: String(row.id),
    routineId,
    scheduleType: String(row.schedule_type || "daily").trim().toLowerCase() === "weekdays" ? "weekdays" : "daily",
    scheduleConfigJson: parseRowJson(row.schedule_config_json, {}),
    startDate: normalizeLocalDate2(row.start_date),
    endDate: row.end_date ? normalizeLocalDate2(row.end_date, normalizeLocalDate2(row.start_date)) : null,
    time: normalizeTimeValue2(row.time),
    priority: Math.max(1, Math.round(Number(row.priority || 1)) || 1),
    status: String(row.status || "").trim().toLowerCase() === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(row.completion_mode),
    createdAt: String(row.created_at || nowIso3()),
    updatedAt: String(row.updated_at || row.created_at || nowIso3()),
    routine,
    searchSummary: [
      routine?.title || "Rutina",
      row.schedule_type === "weekdays" ? "Dias elegidos" : "Diaria",
      normalizeTrainingCompletionMode(row.completion_mode) === "detailed" ? "Carga detallada" : "Si/No"
    ].join(" - ")
  };
}
function listTrainingAssignmentsSync(ctx) {
  const sqlite = getSqlite(ctx);
  const routines = listTrainingRoutinesSync(ctx);
  const routineLookup = new Map(routines.map((routine) => [routine.id, routine]));
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_routine_assignments
    ORDER BY updated_at DESC, created_at DESC
  `).all();
  return rows.map((row) => normalizeAssignmentRecord(ctx, row, routineLookup)).filter((assignment) => Boolean(assignment));
}
function listTrainingOccurrencesSync(sqlite) {
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_routine_occurrences
    ORDER BY occurrence_date DESC, updated_at DESC
  `).all();
  return rows.map((row) => ({
    id: String(row.id),
    assignmentId: String(row.assignment_id),
    occurrenceDate: normalizeLocalDate2(row.occurrence_date),
    windowStartAt: String(row.window_start_at || getOccurrenceWindowStartAt2(normalizeLocalDate2(row.occurrence_date))),
    windowEndAt: String(row.window_end_at || getOccurrenceWindowEndAt2(normalizeLocalDate2(row.occurrence_date))),
    status: String(row.status || "").trim().toLowerCase() === "failed" ? "failed" : "completed",
    resultJson: parseRowJson(row.result_json, {}),
    completedAt: row.completed_at == null ? null : String(row.completed_at),
    createdAt: String(row.created_at || nowIso3()),
    updatedAt: String(row.updated_at || row.created_at || nowIso3())
  }));
}
function findTrainingMuscleConceptBindingSync(sqlite, muscleId) {
  return sqlite.prepare(`
    SELECT concept_id
    FROM training_muscle_concepts
    WHERE muscle_id = ?
    LIMIT 1
  `).get(muscleId) ?? null;
}
function upsertTrainingMuscleConceptBindingSync(sqlite, muscleId, conceptId) {
  const timestamp2 = nowIso3();
  sqlite.prepare(`
    INSERT INTO training_muscle_concepts (
      muscle_id, concept_id, created_at, updated_at
    ) VALUES (
      @muscle_id, @concept_id, @created_at, @updated_at
    )
    ON CONFLICT(muscle_id) DO UPDATE SET
      concept_id = excluded.concept_id,
      updated_at = excluded.updated_at
  `).run({
    muscle_id: muscleId,
    concept_id: conceptId,
    created_at: timestamp2,
    updated_at: timestamp2
  });
}
function buildTrainingFolderNoteContent({
  title,
  summary,
  kind
}) {
  return buildMarkdownDocumentWithFrontmatter({
    frontmatter: {
      nexus: {
        defaultView: "read",
        folderView: "gallery",
        card: {
          title,
          summary
        }
      },
      fitness: {
        domain: "training",
        kind
      }
    },
    body: `# ${title}

${summary}`
  });
}
function getTrainingFolderNoteLegacyFileNames(directoryRelativePath) {
  const normalizedDirectoryPath = normalizeRelativeContentPath(directoryRelativePath);
  const baseNames = [TRAINING_LEGACY_FOLDER_NOTE_FILE_NAME];
  if (normalizedDirectoryPath === TRAINING_EXERCISE_CONCEPTS_DIRECTORY) {
    baseNames.push("Excercises.md");
  }
  return [...new Set(baseNames)];
}
function getTrainingFolderNoteFileName(directoryRelativePath) {
  const segments = normalizeRelativeContentPath(directoryRelativePath).split("/").filter(Boolean);
  const baseName = segments[segments.length - 1] || "Folder";
  return `${baseName}.md`;
}
async function doesTrainingPathExist(absolutePath) {
  try {
    await import_promises.default.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}
async function ensureTrainingMarkdownItem(ctx, relativePath) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return null;
  }
  const absolutePath = resolveAbsoluteContentPath(ctx, normalizedRelativePath);
  if (!await doesTrainingPathExist(absolutePath)) {
    return null;
  }
  await ensureTrainingItemPath(ctx, import_node_path.default.dirname(normalizedRelativePath), "folder");
  const item = await ensureTrainingItemPath(ctx, normalizedRelativePath, "file");
  if (!item?.id) {
    return null;
  }
  pruneTrainingItemRowsByPathSync(getSqlite(ctx), normalizedRelativePath, "file", String(item.id));
  return findTrainingItemByRelativePath(ctx, normalizedRelativePath, "file");
}
async function ensureTrainingConceptForItem(ctx, payload) {
  const repositories = getRepositories(ctx);
  const existingConcept = await repositories.concepts.findByItemId(String(payload.itemId));
  if (existingConcept) {
    return existingConcept;
  }
  const conceptSlug = await allocateUniqueSlug(
    normalizeTrainingSlug(payload.slug || payload.title, "concept"),
    (nextSlug) => repositories.concepts.findBySlug(nextSlug)
  );
  return repositories.concepts.create({
    title: payload.title,
    slug: conceptSlug,
    itemId: String(payload.itemId),
    summary: payload.summary
  });
}
function findTrainingDocRecordByRelativePathSync(ctx, relativePath, fallbackTitle, fallbackSummary = null) {
  const sqlite = getSqlite(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return null;
  }
  pruneMissingTrainingItemRowsByPathSync(ctx, normalizedRelativePath);
  const itemRow = selectTrainingItemRowsByPathSync(sqlite, normalizedRelativePath).find((row) => String(row.type) === "file") || null;
  if (!itemRow?.id) {
    return null;
  }
  const conceptRow = sqlite.prepare(`
    SELECT c.id AS concept_id, c.title, c.summary, i.path AS item_path, c.item_id
    FROM concepts c
    LEFT JOIN items i ON i.id = c.item_id
    WHERE c.item_id = ?
    LIMIT 1
  `).get(String(itemRow.id)) ?? null;
  const itemPath = resolveAbsoluteContentPath(ctx, normalizedRelativePath);
  if (!itemPath || !(0, import_node_fs.existsSync)(itemPath)) {
    return null;
  }
  return {
    conceptId: conceptRow?.concept_id ? String(conceptRow.concept_id) : `item:${itemRow.id}`,
    itemId: String(itemRow.id),
    itemPath,
    relativePath: normalizedRelativePath,
    title: String(conceptRow?.title || fallbackTitle || "").trim(),
    summary: conceptRow?.summary == null ? fallbackSummary : String(conceptRow.summary),
    frontmatter: readFrontmatterFromMarkdownPath(itemPath)
  };
}
async function ensureTrainingFolderNote(ctx, {
  directoryRelativePath,
  title,
  summary,
  kind
}) {
  const repositories = getRepositories(ctx);
  const sqlite = getSqlite(ctx);
  const folderAbsolutePath = resolveAbsoluteContentPath(ctx, directoryRelativePath);
  const folderRelativePath = normalizeRelativeContentPath(directoryRelativePath);
  const folderNoteFileName = getTrainingFolderNoteFileName(folderRelativePath);
  const folderNoteRelativePath = normalizeRelativeContentPath(
    folderRelativePath ? `${folderRelativePath}/${folderNoteFileName}` : folderNoteFileName
  );
  const folderNoteAbsolutePath = import_node_path.default.join(folderAbsolutePath, folderNoteFileName);
  const legacyFileNames = getTrainingFolderNoteLegacyFileNames(folderRelativePath).filter((fileName) => normalizeRelativeContentPath(fileName) !== folderNoteFileName);
  const legacyEntries = legacyFileNames.map((fileName) => ({
    fileName,
    relativePath: normalizeRelativeContentPath(
      folderRelativePath ? `${folderRelativePath}/${fileName}` : fileName
    ),
    absolutePath: import_node_path.default.join(folderAbsolutePath, fileName)
  }));
  await import_promises.default.mkdir(folderAbsolutePath, { recursive: true });
  if (!await doesTrainingPathExist(folderNoteAbsolutePath)) {
    let migratedLegacyFile = false;
    for (const legacyEntry of legacyEntries) {
      if (!await doesTrainingPathExist(legacyEntry.absolutePath)) {
        continue;
      }
      await import_promises.default.rename(legacyEntry.absolutePath, folderNoteAbsolutePath);
      migratedLegacyFile = true;
      break;
    }
    if (!migratedLegacyFile) {
      await import_promises.default.writeFile(
        folderNoteAbsolutePath,
        buildTrainingFolderNoteContent({ title, summary, kind }),
        { flag: "wx" }
      );
    }
  }
  for (const legacyEntry of legacyEntries) {
    if (!await doesTrainingPathExist(legacyEntry.absolutePath)) {
      deleteTrainingItemRowsByPathSync(sqlite, legacyEntry.relativePath);
      continue;
    }
    const legacyStats = await import_promises.default.stat(legacyEntry.absolutePath);
    if (legacyStats.size <= 0) {
      await import_promises.default.unlink(legacyEntry.absolutePath);
      deleteTrainingItemRowsByPathSync(sqlite, legacyEntry.relativePath);
    }
  }
  await ensureTrainingItemPath(ctx, folderRelativePath, "folder");
  for (const legacyEntry of legacyEntries) {
    const legacyFolderNoteItem = await findTrainingItemByRelativePath(ctx, legacyEntry.relativePath, "file");
    if (!legacyFolderNoteItem?.id) {
      continue;
    }
    await legacyFolderNoteItem.update({
      name: folderNoteFileName,
      path: folderNoteRelativePath,
      relative_path: folderNoteRelativePath,
      type: "file",
      extension: "md"
    });
    deleteTrainingItemRowsByPathSync(sqlite, legacyEntry.relativePath);
  }
  const folderNoteItem = await ensureTrainingItemPath(ctx, folderNoteRelativePath, "file");
  pruneTrainingItemRowsByPathSync(sqlite, folderNoteRelativePath, "file", folderNoteItem?.id ? String(folderNoteItem.id) : null);
  const folderItem = await findTrainingItemByRelativePath(ctx, folderRelativePath, "folder");
  if (!folderItem) {
    return null;
  }
  await folderItem.update({
    is_folder_with_note: true,
    folder_note_path: folderNoteRelativePath
  });
  return folderItem;
}
async function ensureTrainingConceptFolders(ctx) {
  await ensureTrainingFolderNote(ctx, {
    directoryRelativePath: TRAINING_MUSCLE_CONCEPTS_DIRECTORY,
    title: "Musculos",
    summary: "Galeria de notas anatomicas del catalogo canonico de entrenamiento.",
    kind: "muscle"
  });
  await ensureTrainingFolderNote(ctx, {
    directoryRelativePath: TRAINING_EXERCISE_CONCEPTS_DIRECTORY,
    title: "Ejercicios",
    summary: "Galeria de notas de ejercicios y tecnica de entrenamiento.",
    kind: "exercise"
  });
}
async function ensureTrainingMuscleConcept(ctx, muscleId) {
  const normalizedMuscleId = normalizeOptionalText3(muscleId);
  if (!normalizedMuscleId) {
    throw new Error("Falta el id del musculo.");
  }
  const sqlite = getSqlite(ctx);
  const muscle = TRAINING_MUSCLE_CATALOG.find((entry) => entry.id === normalizedMuscleId) || null;
  if (!muscle) {
    throw new Error("No encontramos ese musculo canonico.");
  }
  const existingBinding = findTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId);
  const existingDoc = existingBinding?.concept_id ? getTrainingDocRecordByConceptIdSync(ctx, existingBinding.concept_id) : null;
  if (existingDoc) {
    return existingDoc;
  }
  await ensureTrainingConceptFolders(ctx);
  const muscleSummary = `${muscle.groupTitle} - ${muscle.regionTitle}`;
  const existingRelativePath = normalizeRelativeContentPath(`${TRAINING_MUSCLE_CONCEPTS_DIRECTORY}/${muscle.id}.md`);
  const existingItem = await ensureTrainingMarkdownItem(ctx, existingRelativePath);
  const concept = existingItem?.id ? await ensureTrainingConceptForItem(ctx, {
    itemId: String(existingItem.id),
    title: muscle.title,
    slug: muscle.id,
    summary: muscleSummary
  }) : (await createTrainingConceptNote(ctx, {
    title: muscle.title,
    slug: muscle.id,
    relativeDirectoryPath: TRAINING_MUSCLE_CONCEPTS_DIRECTORY,
    templateId: "fitness-muscle",
    summary: muscleSummary,
    frontmatter: {
      fitness: {
        domain: "training",
        kind: "muscle",
        targetId: muscle.id,
        regionId: muscle.regionId,
        groupId: muscle.groupId
      },
      nexus: {
        card: {
          title: muscle.title,
          summary: muscleSummary
        }
      }
    }
  })).concept;
  if (!concept?.id) {
    throw new Error("No se pudo crear la nota del musculo.");
  }
  upsertTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId, String(concept.id));
  return getTrainingDocRecordByConceptIdSync(ctx, String(concept.id));
}
async function ensureAllTrainingMuscleConcepts(ctx) {
  await ensureTrainingConceptFolders(ctx);
  const docs = [];
  for (const muscle of TRAINING_MUSCLE_CATALOG) {
    const doc = await ensureTrainingMuscleConcept(ctx, muscle.id);
    if (doc) {
      docs.push(doc);
    }
  }
  return docs;
}
async function ensureAllTrainingExerciseConcepts(ctx) {
  await ensureTrainingConceptFolders(ctx);
  const docs = [];
  for (const exercise of listTrainingExercisesSync(ctx)) {
    const doc = await ensureTrainingExerciseConcept(ctx, exercise.id);
    if (doc) {
      docs.push(doc);
    }
  }
  return docs;
}
async function ensureTrainingExerciseConcept(ctx, exerciseId) {
  const sqlite = getSqlite(ctx);
  const normalizedExerciseId = normalizeOptionalText3(exerciseId);
  if (!normalizedExerciseId) {
    throw new Error("Falta el id del ejercicio.");
  }
  const existingRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(normalizedExerciseId);
  const exercise = existingRow ? normalizeExerciseRecord(ctx, existingRow) : null;
  if (!exercise) {
    throw new Error("No encontramos ese ejercicio.");
  }
  if (exercise.doc && normalizeOptionalText3(existingRow?.concept_id)) {
    return exercise.doc;
  }
  await ensureTrainingConceptFolders(ctx);
  const exerciseSummary = exercise.summary || exercise.searchSummary || "Documento de ejercicio.";
  const existingRelativePath = normalizeRelativeContentPath(`${TRAINING_EXERCISE_CONCEPTS_DIRECTORY}/${exercise.slug}.md`);
  const existingItem = await ensureTrainingMarkdownItem(ctx, existingRelativePath);
  const created = existingItem?.id ? {
    concept: await ensureTrainingConceptForItem(ctx, {
      itemId: String(existingItem.id),
      title: exercise.title,
      slug: exercise.slug || exercise.title,
      summary: exerciseSummary
    })
  } : await createTrainingConceptNote(ctx, {
    title: exercise.title,
    slug: exercise.slug || exercise.title,
    relativeDirectoryPath: TRAINING_EXERCISE_CONCEPTS_DIRECTORY,
    templateId: "fitness-exercise",
    summary: exerciseSummary,
    frontmatter: {
      fitness: {
        domain: "training",
        kind: "exercise",
        targetId: exercise.id
      },
      nexus: {
        card: {
          title: exercise.title,
          summary: exercise.summary || exercise.searchSummary || ""
        }
      }
    }
  });
  sqlite.prepare(`
    UPDATE training_exercises
    SET concept_id = ?,
        updated_at = ?
    WHERE id = ?
  `).run(String(created.concept.id), nowIso3(), normalizedExerciseId);
  return getTrainingDocRecordByConceptIdSync(ctx, String(created.concept.id));
}
function getTrainingConceptCoverageKey(ctx) {
  return import_node_path.default.normalize(String(ctx?.vault?.contentPath || "__training__"));
}
async function ensureTrainingConceptCoverage(ctx) {
  const coverageKey = getTrainingConceptCoverageKey(ctx);
  const existingRun = trainingConceptCoverageInFlight.get(coverageKey);
  if (existingRun) {
    await existingRun;
    return;
  }
  const pendingRun = (async () => {
    try {
      await ensureTrainingConceptFolders(ctx);
      await ensureAllTrainingMuscleConcepts(ctx);
      await ensureAllTrainingExerciseConcepts(ctx);
    } finally {
      trainingConceptCoverageInFlight.delete(coverageKey);
    }
  })();
  trainingConceptCoverageInFlight.set(coverageKey, pendingRun);
  await pendingRun;
}
async function ensureTrainingExerciseEntityRef(ctx, existingRow) {
  const repositories = getRepositories(ctx);
  if (existingRow?.entity_ref_id) {
    const entityRef = await repositories.entityRefs.findById(String(existingRow.entity_ref_id));
    if (entityRef) {
      return entityRef;
    }
  }
  return repositories.entityRefs.create({
    kind: TRAINING_EXERCISE_KIND
  });
}
async function ensureTrainingRoutineEntityRef(ctx, existingRow) {
  const repositories = getRepositories(ctx);
  if (existingRow?.entity_ref_id) {
    const entityRef = await repositories.entityRefs.findById(String(existingRow.entity_ref_id));
    if (entityRef) {
      return entityRef;
    }
  }
  return repositories.entityRefs.create({
    kind: TRAINING_ROUTINE_KIND
  });
}
function normalizeExerciseInput(payload) {
  const title = assertNonEmptyString(payload?.title, "title");
  const summary = normalizeOptionalText3(payload?.summary);
  const notes = normalizeOptionalText3(payload?.notes);
  const measurement = normalizeTrainingMeasurement(payload?.measurement);
  const muscleLoads = normalizeTrainingMuscleLoads(Array.isArray(payload?.muscleLoads) ? payload.muscleLoads : []);
  return {
    title,
    summary,
    notes,
    measurement,
    muscleLoads,
    slug: normalizeTrainingSlug(payload?.slug || title, "exercise")
  };
}
function normalizeRoutineInput(payload, exerciseLookup) {
  const title = assertNonEmptyString(payload?.title, "title");
  const summary = normalizeOptionalText3(payload?.summary);
  const notes = normalizeOptionalText3(payload?.notes);
  const rawStructure = Array.isArray(payload?.structure) ? payload.structure : [];
  const structure = rawStructure.length ? normalizeTrainingStructure(rawStructure, exerciseLookup) : migrateLegacyTrainingSteps(Array.isArray(payload?.steps) ? payload.steps : [], exerciseLookup);
  return {
    title,
    summary,
    notes,
    structure,
    slug: normalizeTrainingSlug(payload?.slug || title, "routine")
  };
}
async function saveTrainingExercise(ctx, payload) {
  const repositories = getRepositories(ctx);
  const sqlite = repositories.sqlite;
  const requestedId = normalizeOptionalText3(payload?.id);
  const existing = requestedId ? sqlite.prepare(`
        SELECT *
        FROM training_exercises
        WHERE id = ?
        LIMIT 1
      `).get(requestedId) : null;
  const input = normalizeExerciseInput(payload);
  const entityRef = await ensureTrainingExerciseEntityRef(ctx, existing);
  const slug = await allocateUniqueSlug(
    input.slug,
    (nextSlug) => Promise.resolve(findTrainingExerciseBySlugSync(sqlite, nextSlug)),
    existing?.id || null
  );
  const exerciseId = existing?.id || (0, import_node_crypto2.randomUUID)();
  const timestamp2 = nowIso3();
  sqlite.prepare(`
    INSERT INTO training_exercises (
      id, entity_ref_id, concept_id, title, slug, summary, notes, measurement_json, muscle_loads_json,
      legacy_muscle_warnings_json, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @concept_id, @title, @slug, @summary, @notes, @measurement_json, @muscle_loads_json,
      @legacy_muscle_warnings_json, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      concept_id = excluded.concept_id,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      measurement_json = excluded.measurement_json,
      muscle_loads_json = excluded.muscle_loads_json,
      legacy_muscle_warnings_json = excluded.legacy_muscle_warnings_json,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: exerciseId,
    entity_ref_id: String(entityRef.id),
    concept_id: existing?.concept_id ?? null,
    title: input.title,
    slug,
    summary: input.summary,
    notes: input.notes,
    measurement_json: JSON.stringify(input.measurement || {}),
    muscle_loads_json: JSON.stringify(input.muscleLoads || []),
    legacy_muscle_warnings_json: JSON.stringify([]),
    status: "active",
    created_at: existing?.created_at || timestamp2,
    updated_at: timestamp2
  });
  const savedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(exerciseId);
  const savedExercise = savedRow ? normalizeExerciseRecord(ctx, savedRow) : null;
  if (!savedExercise) {
    throw new Error("No se pudo guardar el ejercicio.");
  }
  await ensureTrainingExerciseConcept(ctx, savedExercise.id);
  const refreshedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(exerciseId);
  const savedExerciseWithDoc = refreshedRow ? normalizeExerciseRecord(ctx, refreshedRow) : savedExercise;
  upsertTrainingSearchDocument(sqlite, {
    id: getTrainingSearchDocumentId("exercise", savedExerciseWithDoc.id),
    entityRefId: savedExerciseWithDoc.entityRefId,
    kind: "concept",
    title: savedExerciseWithDoc.title,
    subtitle: savedExerciseWithDoc.searchSummary || savedExerciseWithDoc.summary,
    body: [
      savedExerciseWithDoc.summary,
      savedExerciseWithDoc.notes,
      savedExerciseWithDoc.searchSummary ? `Musculos: ${savedExerciseWithDoc.searchSummary}` : null
    ].filter(Boolean).join("\n\n"),
    metadata: {
      pluginId: TRAINING_PLUGIN_ID,
      domain: "training",
      type: "exercise",
      exerciseId: savedExerciseWithDoc.id,
      measurement: savedExerciseWithDoc.measurement,
      muscleLoads: savedExerciseWithDoc.muscleLoads
    }
  });
  return savedExerciseWithDoc;
}
async function saveTrainingRoutine(ctx, payload) {
  const sqlite = getSqlite(ctx);
  const requestedId = normalizeOptionalText3(payload?.id);
  const existing = requestedId ? sqlite.prepare(`
        SELECT *
        FROM training_routines
        WHERE id = ?
        LIMIT 1
      `).get(requestedId) : null;
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const input = normalizeRoutineInput(payload, exerciseLookup);
  const entityRef = await ensureTrainingRoutineEntityRef(ctx, existing);
  const slug = await allocateUniqueSlug(
    input.slug,
    (nextSlug) => Promise.resolve(findTrainingRoutineBySlugSync(sqlite, nextSlug)),
    existing?.id || null
  );
  const routineId = existing?.id || (0, import_node_crypto2.randomUUID)();
  const timestamp2 = nowIso3();
  const flattenedSteps = flattenTrainingStructureSteps(input.structure).filter((entry) => entry.type === "step");
  const exerciseSteps = flattenedSteps.filter((step) => step.stepKind !== "rest" && step.exerciseId);
  sqlite.prepare(`
    INSERT INTO training_routines (
      id, entity_ref_id, title, slug, summary, notes, structure_json, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @title, @slug, @summary, @notes, @structure_json, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      structure_json = excluded.structure_json,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: routineId,
    entity_ref_id: String(entityRef.id),
    title: input.title,
    slug,
    summary: input.summary,
    notes: input.notes,
    structure_json: JSON.stringify(input.structure || []),
    status: "active",
    created_at: existing?.created_at || timestamp2,
    updated_at: timestamp2
  });
  sqlite.prepare("DELETE FROM training_routine_steps WHERE routine_id = ?").run(routineId);
  const savedRow = sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE id = ?
    LIMIT 1
  `).get(routineId);
  const savedRoutine = savedRow ? normalizeRoutineRecord(ctx, savedRow) : null;
  if (!savedRoutine) {
    throw new Error("No se pudo guardar la rutina.");
  }
  upsertTrainingSearchDocument(sqlite, {
    id: getTrainingSearchDocumentId("routine", savedRoutine.id),
    entityRefId: savedRoutine.entityRefId,
    kind: "concept",
    title: savedRoutine.title,
    subtitle: savedRoutine.searchSummary || savedRoutine.summary,
    body: [
      savedRoutine.summary,
      savedRoutine.notes,
      savedRoutine.searchSummary ? `Estructura: ${savedRoutine.searchSummary}` : null
    ].filter(Boolean).join("\n\n"),
    metadata: {
      pluginId: TRAINING_PLUGIN_ID,
      domain: "training",
      type: "routine",
      routineId: savedRoutine.id,
      stepCount: flattenedSteps.length,
      exerciseIds: exerciseSteps.map((step) => step.exerciseId).filter(Boolean)
    }
  });
  return savedRoutine;
}
async function deleteTrainingExercise(ctx, exerciseId) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText3(exerciseId);
  if (!normalizedId) {
    throw new Error("Falta el id del ejercicio.");
  }
  const existing = sqlite.prepare(`
    SELECT id
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);
  if (!existing) {
    throw new Error("No se encontro el ejercicio a borrar.");
  }
  deleteTrainingSearchDocument(sqlite, getTrainingSearchDocumentId("exercise", normalizedId));
  sqlite.prepare("DELETE FROM training_exercises WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}
async function deleteTrainingRoutine(ctx, routineId) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText3(routineId);
  if (!normalizedId) {
    throw new Error("Falta el id de la rutina.");
  }
  const existing = sqlite.prepare(`
    SELECT id
    FROM training_routines
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);
  if (!existing) {
    throw new Error("No se encontro la rutina a borrar.");
  }
  deleteTrainingSearchDocument(sqlite, getTrainingSearchDocumentId("routine", normalizedId));
  sqlite.prepare("DELETE FROM training_routine_assignments WHERE routine_id = ?").run(normalizedId);
  sqlite.prepare("DELETE FROM training_routines WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}
async function saveTrainingAssignment(ctx, payload) {
  const sqlite = getSqlite(ctx);
  const requestedId = normalizeOptionalText3(payload?.id);
  const existing = requestedId ? sqlite.prepare(`
        SELECT *
        FROM training_routine_assignments
        WHERE id = ?
        LIMIT 1
      `).get(requestedId) : null;
  const input = normalizeTrainingAssignmentInput(payload, {
    existingAssignment: existing ? {
      routineId: String(existing.routine_id),
      scheduleType: String(existing.schedule_type),
      scheduleConfigJson: parseRowJson(existing.schedule_config_json, {}),
      startDate: String(existing.start_date),
      endDate: existing.end_date ? String(existing.end_date) : null,
      time: existing.time ? String(existing.time) : null,
      priority: Number(existing.priority || 1),
      status: String(existing.status || "active"),
      completionMode: String(existing.completion_mode || "yes-no")
    } : null
  });
  const routine = listTrainingRoutinesSync(ctx).find((entry) => entry.id === input.routineId) || null;
  if (!routine) {
    throw new Error("No encontramos la rutina seleccionada.");
  }
  const assignmentId = existing?.id || (0, import_node_crypto2.randomUUID)();
  const timestamp2 = nowIso3();
  sqlite.prepare(`
    INSERT INTO training_routine_assignments (
      id, routine_id, schedule_type, schedule_config_json, start_date, end_date, time,
      priority, status, completion_mode, created_at, updated_at
    ) VALUES (
      @id, @routine_id, @schedule_type, @schedule_config_json, @start_date, @end_date, @time,
      @priority, @status, @completion_mode, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      routine_id = excluded.routine_id,
      schedule_type = excluded.schedule_type,
      schedule_config_json = excluded.schedule_config_json,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      time = excluded.time,
      priority = excluded.priority,
      status = excluded.status,
      completion_mode = excluded.completion_mode,
      updated_at = excluded.updated_at
  `).run({
    id: assignmentId,
    routine_id: input.routineId,
    schedule_type: input.scheduleType,
    schedule_config_json: JSON.stringify(input.scheduleConfigJson || {}),
    start_date: input.startDate,
    end_date: input.endDate,
    time: input.time,
    priority: input.priority,
    status: input.status,
    completion_mode: input.completionMode,
    created_at: existing?.created_at || timestamp2,
    updated_at: timestamp2
  });
  const saved = listTrainingAssignmentsSync(ctx).find((entry) => entry.id === assignmentId) || null;
  if (!saved) {
    throw new Error("No se pudo guardar la rutina programada.");
  }
  return saved;
}
async function deleteTrainingAssignment(ctx, assignmentId) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText3(assignmentId);
  if (!normalizedId) {
    throw new Error("Falta el id de la rutina programada.");
  }
  const existing = sqlite.prepare(`
    SELECT id
    FROM training_routine_assignments
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);
  if (!existing) {
    throw new Error("No se encontro la rutina programada.");
  }
  sqlite.prepare("DELETE FROM training_routine_assignments WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}
function createProjectedTrainingOccurrence(assignment, occurrenceDate, actualToday) {
  const isPast = compareLocalDates2(occurrenceDate, actualToday) < 0;
  return {
    id: `projected:${assignment.id}:${occurrenceDate}`,
    assignmentId: assignment.id,
    occurrenceDate,
    windowStartAt: getOccurrenceWindowStartAt2(occurrenceDate),
    windowEndAt: getOccurrenceWindowEndAt2(occurrenceDate),
    status: isPast ? "failed" : "pending",
    resultJson: {},
    completedAt: null,
    createdAt: nowIso3(),
    updatedAt: nowIso3(),
    isProjected: true
  };
}
function buildTrainingQueueItem(occurrence, assignment, today, actualToday) {
  const isOverdue = compareLocalDates2(occurrence.occurrenceDate, actualToday) < 0;
  const statusLabel = occurrence.status === "completed" ? "Completada" : occurrence.status === "failed" ? "Fallida" : "Pendiente";
  return {
    id: `routine:${assignment.id}:${occurrence.occurrenceDate}`,
    type: "routine",
    recordId: occurrence.id,
    assignmentId: assignment.id,
    title: assignment.routine?.title || "Rutina programada",
    category: "Entrenamiento",
    date: today,
    time: assignment.time,
    priority: assignment.priority,
    status: occurrence.status,
    completionMode: assignment.completionMode,
    isProjected: Boolean(occurrence.isProjected),
    isOverdue,
    statusLabel,
    summary: assignment.routine?.searchSummary || assignment.searchSummary,
    meta: assignment.scheduleType === "weekdays" ? "Dias elegidos" : "Cada dia",
    assignment,
    routine: assignment.routine,
    resultJson: occurrence.resultJson,
    raw: occurrence
  };
}
function buildTrainingHistoryItem(occurrence, assignment) {
  const statusLabel = occurrence.status === "completed" ? "Completada" : "Fallida";
  return {
    id: `history-routine:${assignment.id}:${occurrence.occurrenceDate}`,
    type: "routine",
    recordId: occurrence.id,
    assignmentId: assignment.id,
    title: assignment.routine?.title || "Rutina programada",
    category: "Entrenamiento",
    status: occurrence.status,
    statusLabel,
    timestamp: occurrence.completedAt || `${occurrence.occurrenceDate}T23:59:59.999Z`,
    summary: occurrence.status === "completed" ? "Rutina registrada." : "La rutina no se marco en esa fecha.",
    assignment,
    routine: assignment.routine,
    raw: occurrence
  };
}
function buildTrainingHomeItems(ctx, {
  today = todayLocalDate3(),
  actualToday = todayLocalDate3(),
  historyDays = TRAINING_HISTORY_DAYS,
  historyLimit = TRAINING_HOME_HISTORY_LIMIT
} = {}) {
  const sqlite = getSqlite(ctx);
  const assignments = listTrainingAssignmentsSync(ctx);
  const occurrences = listTrainingOccurrencesSync(sqlite);
  const occurrenceByKey = new Map(
    occurrences.map((occurrence) => [`${occurrence.assignmentId}:${occurrence.occurrenceDate}`, occurrence])
  );
  const dailyQueue = assignments.filter((assignment) => assignment.status === "active").filter((assignment) => compareLocalDates2(today, assignment.startDate) >= 0).filter((assignment) => !assignment.endDate || compareLocalDates2(today, assignment.endDate) <= 0).filter((assignment) => doesScheduleMatchDate(assignment.scheduleType, assignment.scheduleConfigJson, today)).map((assignment) => {
    const persisted = occurrenceByKey.get(`${assignment.id}:${today}`);
    return buildTrainingQueueItem(
      persisted || createProjectedTrainingOccurrence(assignment, today, actualToday),
      assignment,
      today,
      actualToday
    );
  });
  const historyStart = addDaysToLocalDate2(actualToday, -(historyDays - 1));
  const historyEntries = [];
  for (const assignment of assignments) {
    const persistedByAssignment = occurrences.filter((entry) => entry.assignmentId === assignment.id);
    const persistedByDate = new Map(persistedByAssignment.map((entry) => [entry.occurrenceDate, entry]));
    const syntheticHistoryAllowed = assignment.status === "active" || assignment.endDate;
    const syntheticRangeEnd = assignment.endDate && compareLocalDates2(assignment.endDate, addDaysToLocalDate2(actualToday, -1)) < 0 ? assignment.endDate : addDaysToLocalDate2(actualToday, -1);
    const syntheticDates = syntheticHistoryAllowed ? buildOccurrenceDates({
      scheduleType: assignment.scheduleType,
      scheduleConfigJson: assignment.scheduleConfigJson,
      startDate: compareLocalDates2(assignment.startDate, historyStart) > 0 ? assignment.startDate : historyStart,
      endDate: syntheticRangeEnd
    }) : [];
    for (const occurrenceDate of syntheticDates) {
      const persisted = persistedByDate.get(occurrenceDate);
      historyEntries.push(buildTrainingHistoryItem(
        persisted || createProjectedTrainingOccurrence(assignment, occurrenceDate, actualToday),
        assignment
      ));
    }
    for (const occurrence of persistedByAssignment) {
      if (compareLocalDates2(occurrence.occurrenceDate, historyStart) < 0 || compareLocalDates2(occurrence.occurrenceDate, actualToday) > 0) {
        continue;
      }
      if (syntheticDates.includes(occurrence.occurrenceDate)) {
        continue;
      }
      historyEntries.push(buildTrainingHistoryItem(occurrence, assignment));
    }
  }
  return {
    dailyQueue,
    recentHistory: historyEntries.sort((left, right) => String(right?.timestamp || "").localeCompare(String(left?.timestamp || ""))).slice(0, historyLimit)
  };
}
function buildTrainingHomeContribution(ctx, options = {}) {
  return buildTrainingHomeItems(ctx, options);
}
async function saveTrainingOccurrenceResult(ctx, payload) {
  const sqlite = getSqlite(ctx);
  const assignmentId = normalizeOptionalText3(payload?.assignmentId);
  const occurrenceDate = normalizeLocalDate2(payload?.occurrenceDate);
  const clear = Boolean(payload?.clear);
  if (!assignmentId) {
    throw new Error("Falta la rutina programada.");
  }
  const assignment = listTrainingAssignmentsSync(ctx).find((entry) => entry.id === assignmentId) || null;
  if (!assignment) {
    throw new Error("No encontramos la rutina programada.");
  }
  if (!doesScheduleMatchDate(assignment.scheduleType, assignment.scheduleConfigJson, occurrenceDate)) {
    throw new Error("La fecha elegida no coincide con la recurrencia.");
  }
  if (compareLocalDates2(occurrenceDate, assignment.startDate) < 0) {
    throw new Error("La fecha elegida es anterior al inicio de la rutina.");
  }
  if (assignment.endDate && compareLocalDates2(occurrenceDate, assignment.endDate) > 0) {
    throw new Error("La fecha elegida queda fuera de la ventana activa.");
  }
  if (clear) {
    sqlite.prepare(`
      DELETE FROM training_routine_occurrences
      WHERE assignment_id = ?
        AND occurrence_date = ?
    `).run(assignmentId, occurrenceDate);
    return { cleared: true };
  }
  const resultJson = normalizeTrainingOccurrenceResult(
    payload?.result || payload?.resultJson || {},
    assignment.completionMode
  );
  const existing = sqlite.prepare(`
    SELECT *
    FROM training_routine_occurrences
    WHERE assignment_id = ?
      AND occurrence_date = ?
    LIMIT 1
  `).get(assignmentId, occurrenceDate);
  const occurrenceId = existing?.id || (0, import_node_crypto2.randomUUID)();
  const timestamp2 = nowIso3();
  sqlite.prepare(`
    INSERT INTO training_routine_occurrences (
      id, assignment_id, occurrence_date, window_start_at, window_end_at, status,
      result_json, completed_at, created_at, updated_at
    ) VALUES (
      @id, @assignment_id, @occurrence_date, @window_start_at, @window_end_at, @status,
      @result_json, @completed_at, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      assignment_id = excluded.assignment_id,
      occurrence_date = excluded.occurrence_date,
      window_start_at = excluded.window_start_at,
      window_end_at = excluded.window_end_at,
      status = excluded.status,
      result_json = excluded.result_json,
      completed_at = excluded.completed_at,
      updated_at = excluded.updated_at
  `).run({
    id: occurrenceId,
    assignment_id: assignmentId,
    occurrence_date: occurrenceDate,
    window_start_at: getOccurrenceWindowStartAt2(occurrenceDate),
    window_end_at: getOccurrenceWindowEndAt2(occurrenceDate),
    status: "completed",
    result_json: JSON.stringify(resultJson),
    completed_at: timestamp2,
    created_at: existing?.created_at || timestamp2,
    updated_at: timestamp2
  });
  return {
    occurrence: listTrainingOccurrencesSync(sqlite).find((entry) => entry.id === occurrenceId) || null
  };
}
function migrateLegacyExerciseMusclesSync(sqlite) {
  const rows = sqlite.prepare(`
    SELECT id, entity_ref_id, muscle_loads_json, legacy_muscle_warnings_json
    FROM training_exercises
  `).all();
  for (const row of rows) {
    const currentLoads = parseRowJson(row.muscle_loads_json, []);
    const currentWarnings = parseRowJson(row.legacy_muscle_warnings_json, []);
    if (currentLoads.length || currentWarnings.length) {
      continue;
    }
    const legacyMuscles = listLegacyExerciseMusclesSync(sqlite, String(row.entity_ref_id));
    if (!legacyMuscles.length) {
      continue;
    }
    const migrated = normalizeTrainingMuscleLoads(legacyMuscles, { includeWarnings: true });
    sqlite.prepare(`
      UPDATE training_exercises
      SET muscle_loads_json = ?,
          legacy_muscle_warnings_json = ?
      WHERE id = ?
    `).run(
      JSON.stringify(migrated.muscleLoads || []),
      JSON.stringify(migrated.warnings || []),
      String(row.id)
    );
  }
}
function migrateLegacyRoutineStructuresSync(ctx) {
  const sqlite = getSqlite(ctx);
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const rows = sqlite.prepare(`
    SELECT id, structure_json
    FROM training_routines
  `).all();
  for (const row of rows) {
    const structure = parseRowJson(row.structure_json, []);
    if (structure.length) {
      continue;
    }
    const legacySteps = listLegacyRoutineStepsSync(ctx, String(row.id));
    if (!legacySteps.length) {
      continue;
    }
    sqlite.prepare(`
      UPDATE training_routines
      SET structure_json = ?
      WHERE id = ?
    `).run(
      JSON.stringify(migrateLegacyTrainingSteps(legacySteps, exerciseLookup)),
      String(row.id)
    );
  }
}
function registerTrainingSchema(ctx) {
  const sqlite = getSqlite(ctx);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS training_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      entity_ref_id TEXT NOT NULL UNIQUE REFERENCES entity_refs(id) ON DELETE CASCADE,
      concept_id TEXT UNIQUE REFERENCES concepts(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      notes TEXT,
      measurement_json TEXT NOT NULL DEFAULT '{}',
      muscle_loads_json TEXT NOT NULL DEFAULT '[]',
      legacy_muscle_warnings_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_exercises_title
      ON training_exercises (title COLLATE NOCASE, title);

    CREATE TABLE IF NOT EXISTS training_muscle_concepts (
      muscle_id TEXT PRIMARY KEY NOT NULL,
      concept_id TEXT NOT NULL UNIQUE REFERENCES concepts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_routines (
      id TEXT PRIMARY KEY NOT NULL,
      entity_ref_id TEXT NOT NULL UNIQUE REFERENCES entity_refs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      notes TEXT,
      structure_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routines_title
      ON training_routines (title COLLATE NOCASE, title);

    CREATE TABLE IF NOT EXISTS training_routine_steps (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT NOT NULL REFERENCES training_routines(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      kind TEXT NOT NULL DEFAULT 'exercise',
      exercise_id TEXT REFERENCES training_exercises(id) ON DELETE SET NULL,
      exercise_title_snapshot TEXT,
      exercise_measurement_snapshot_json TEXT NOT NULL DEFAULT '{}',
      prescription_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routine_steps_routine_id
      ON training_routine_steps (routine_id, sort_order);

    CREATE TABLE IF NOT EXISTS training_routine_assignments (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT NOT NULL REFERENCES training_routines(id) ON DELETE CASCADE,
      schedule_type TEXT NOT NULL DEFAULT 'daily',
      schedule_config_json TEXT NOT NULL DEFAULT '{}',
      start_date TEXT NOT NULL,
      end_date TEXT,
      time TEXT,
      priority INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      completion_mode TEXT NOT NULL DEFAULT 'yes-no',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routine_assignments_routine_id
      ON training_routine_assignments (routine_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS training_routine_occurrences (
      id TEXT PRIMARY KEY NOT NULL,
      assignment_id TEXT NOT NULL REFERENCES training_routine_assignments(id) ON DELETE CASCADE,
      occurrence_date TEXT NOT NULL,
      window_start_at TEXT NOT NULL,
      window_end_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      result_json TEXT NOT NULL DEFAULT '{}',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_training_routine_occurrences_unique
      ON training_routine_occurrences (assignment_id, occurrence_date);

    CREATE INDEX IF NOT EXISTS idx_training_routine_occurrences_date
      ON training_routine_occurrences (occurrence_date DESC, updated_at DESC);
  `);
  ensureTableColumn2(sqlite, "training_exercises", "muscle_loads_json", "TEXT NOT NULL DEFAULT '[]'");
  ensureTableColumn2(sqlite, "training_exercises", "legacy_muscle_warnings_json", "TEXT NOT NULL DEFAULT '[]'");
  ensureTableColumn2(sqlite, "training_exercises", "concept_id", "TEXT REFERENCES concepts(id) ON DELETE SET NULL");
  ensureTableColumn2(sqlite, "training_routines", "structure_json", "TEXT NOT NULL DEFAULT '[]'");
  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_training_exercises_concept_id
      ON training_exercises (concept_id);

    CREATE TABLE IF NOT EXISTS training_muscle_concepts (
      muscle_id TEXT PRIMARY KEY NOT NULL,
      concept_id TEXT NOT NULL UNIQUE REFERENCES concepts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  sqlite.prepare(`
    UPDATE training_exercises
    SET muscle_loads_json = COALESCE(NULLIF(TRIM(muscle_loads_json), ''), '[]'),
        legacy_muscle_warnings_json = COALESCE(NULLIF(TRIM(legacy_muscle_warnings_json), ''), '[]')
    WHERE muscle_loads_json IS NULL
       OR TRIM(muscle_loads_json) = ''
       OR legacy_muscle_warnings_json IS NULL
       OR TRIM(legacy_muscle_warnings_json) = ''
  `).run();
  sqlite.prepare(`
    UPDATE training_routines
    SET structure_json = COALESCE(NULLIF(TRIM(structure_json), ''), '[]')
    WHERE structure_json IS NULL
       OR TRIM(structure_json) = ''
  `).run();
  migrateLegacySearchExercisesSync(ctx);
  migrateLegacyExerciseMusclesSync(sqlite);
  migrateLegacyRoutineStructuresSync(ctx);
}
var trainingPlugin = {
  ensureSchema(ctx) {
    registerTrainingSchema(ctx);
  },
  activate(ctx) {
    registerTrainingSchema(ctx);
    void ensureTrainingConceptCoverage(ctx).catch((error) => {
      console.error("[life-tracker.training] No se pudo sembrar la documentacion fitness.", error);
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list`, async () => {
      try {
        await ensureTrainingConceptCoverage(ctx);
        return createSuccess2({
          exercises: listTrainingExercisesSync(ctx),
          routines: listTrainingRoutinesSync(ctx),
          assignments: listTrainingAssignmentsSync(ctx),
          muscles: enrichTrainingMuscleCatalogSync(ctx),
          regions: TRAINING_MUSCLE_REGIONS,
          groups: TRAINING_MUSCLE_GROUPS
        });
      } catch (error) {
        return createError2(error, "No se pudo cargar la biblioteca de entrenamientos.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list-muscles`, async (_event, payload) => {
      try {
        await ensureTrainingConceptCoverage(ctx);
        const query = typeof payload === "string" ? payload : normalizeOptionalText3(payload?.query);
        const regionId = normalizeOptionalText3(payload?.regionId);
        const groupId = normalizeOptionalText3(payload?.groupId);
        const muscles = listTrainingMuscles({
          query: query || "",
          regionId: regionId || "",
          groupId: groupId || ""
        });
        return createSuccess2({
          muscles: enrichTrainingMuscleCatalogSync(ctx, muscles),
          regions: TRAINING_MUSCLE_REGIONS,
          groups: TRAINING_MUSCLE_GROUPS
        });
      } catch (error) {
        return createError2(error, "No se pudo cargar la lista de musculos.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:ensure-muscle-concept`, async (_event, payload) => {
      try {
        const muscleId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.muscleId);
        if (!muscleId) {
          throw new Error("Falta el id del musculo.");
        }
        const doc = await ensureTrainingMuscleConcept(ctx, muscleId);
        const muscle = enrichTrainingMuscleCatalogSync(
          ctx,
          TRAINING_MUSCLE_CATALOG.filter((entry) => entry.id === muscleId)
        )[0] || null;
        return createSuccess2({
          doc,
          muscle
        });
      } catch (error) {
        return createError2(error, "No se pudo crear la nota del musculo.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:ensure-exercise-concept`, async (_event, payload) => {
      try {
        const exerciseId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.exerciseId);
        if (!exerciseId) {
          throw new Error("Falta el id del ejercicio.");
        }
        const doc = await ensureTrainingExerciseConcept(ctx, exerciseId);
        const exercise = listTrainingExercisesSync(ctx).find((record) => record.id === exerciseId) || null;
        return createSuccess2({
          doc,
          exercise
        });
      } catch (error) {
        return createError2(error, "No se pudo crear la nota del ejercicio.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:ensure-all-muscle-concepts`, async () => {
      try {
        const docs = await ensureAllTrainingMuscleConcepts(ctx);
        return createSuccess2({
          docs,
          muscles: enrichTrainingMuscleCatalogSync(ctx)
        });
      } catch (error) {
        return createError2(error, "No se pudo crear la base de notas musculares.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:get-exercise`, async (_event, payload) => {
      try {
        const exerciseId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.exerciseId);
        if (!exerciseId) {
          throw new Error("Falta el id del ejercicio.");
        }
        return createSuccess2({
          exercise: listTrainingExercisesSync(ctx).find((record) => record.id === exerciseId) || null
        });
      } catch (error) {
        return createError2(error, "No se pudo cargar el ejercicio.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:get-routine`, async (_event, payload) => {
      try {
        const routineId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.routineId);
        if (!routineId) {
          throw new Error("Falta el id de la rutina.");
        }
        return createSuccess2({
          routine: listTrainingRoutinesSync(ctx).find((record) => record.id === routineId) || null
        });
      } catch (error) {
        return createError2(error, "No se pudo cargar la rutina.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-exercise`, async (_event, payload) => {
      try {
        return createSuccess2({
          exercise: await saveTrainingExercise(ctx, payload || {})
        });
      } catch (error) {
        return createError2(error, "No se pudo guardar el ejercicio.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-exercise`, async (_event, payload) => {
      try {
        const exerciseId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.exerciseId);
        return createSuccess2({
          deleted: await deleteTrainingExercise(ctx, exerciseId)
        });
      } catch (error) {
        return createError2(error, "No se pudo borrar el ejercicio.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-routine`, async (_event, payload) => {
      try {
        return createSuccess2({
          routine: await saveTrainingRoutine(ctx, payload || {})
        });
      } catch (error) {
        return createError2(error, "No se pudo guardar la rutina.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-routine`, async (_event, payload) => {
      try {
        const routineId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.routineId);
        return createSuccess2({
          deleted: await deleteTrainingRoutine(ctx, routineId)
        });
      } catch (error) {
        return createError2(error, "No se pudo borrar la rutina.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list-assignments`, async () => {
      try {
        return createSuccess2({
          assignments: listTrainingAssignmentsSync(ctx)
        });
      } catch (error) {
        return createError2(error, "No se pudo cargar las rutinas programadas.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:get-assignment`, async (_event, payload) => {
      try {
        const assignmentId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.assignmentId);
        if (!assignmentId) {
          throw new Error("Falta el id de la rutina programada.");
        }
        return createSuccess2({
          assignment: listTrainingAssignmentsSync(ctx).find((record) => record.id === assignmentId) || null
        });
      } catch (error) {
        return createError2(error, "No se pudo cargar la rutina programada.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-assignment`, async (_event, payload) => {
      try {
        return createSuccess2({
          assignment: await saveTrainingAssignment(ctx, payload || {})
        });
      } catch (error) {
        return createError2(error, "No se pudo guardar la rutina programada.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-assignment`, async (_event, payload) => {
      try {
        const assignmentId = normalizeOptionalText3(typeof payload === "string" ? payload : payload?.id || payload?.assignmentId);
        return createSuccess2({
          deleted: await deleteTrainingAssignment(ctx, assignmentId)
        });
      } catch (error) {
        return createError2(error, "No se pudo borrar la rutina programada.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-occurrence-result`, async (_event, payload) => {
      try {
        return createSuccess2(await saveTrainingOccurrenceResult(ctx, payload || {}));
      } catch (error) {
        return createError2(error, "No se pudo guardar el resultado de la rutina.");
      }
    });
  }
};
var backend_default2 = trainingPlugin;

// ../nexus-plugins/life-tracker/src/backend.ts
var LIFE_TRACKER_HABITS_CHANNEL_PREFIX = "life-tracker:habits";
function createSuccess3(data) {
  return {
    ok: true,
    data
  };
}
function createError3(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
function getSqlite2(ctx) {
  return ctx.requireRepositories().sqlite;
}
function resolveViewDate(dateValue) {
  return normalizeLocalDate(dateValue, todayLocalDate());
}
function compareHistoryEntries2(left, right) {
  return String(right?.timestamp || "").localeCompare(String(left?.timestamp || ""));
}
function buildHome(sqlite, dateValue) {
  const actualToday = todayLocalDate();
  const today = resolveViewDate(dateValue);
  const baseHome = buildHabitosHomeSnapshot(sqlite, {
    today,
    actualToday,
    now: nowIso()
  });
  const trainingHome = buildTrainingHomeContribution({
    requireRepositories() {
      return {
        sqlite
      };
    }
  }, {
    today,
    actualToday,
    historyLimit: Math.max(8, Array.isArray(baseHome.recentHistory) ? baseHome.recentHistory.length : 0)
  });
  return {
    ...baseHome,
    dailyQueue: [...baseHome.dailyQueue, ...trainingHome.dailyQueue].sort(compareDailyQueueItems),
    recentHistory: [...baseHome.recentHistory, ...trainingHome.recentHistory].sort(compareHistoryEntries2).slice(0, Math.max(8, Array.isArray(baseHome.recentHistory) ? baseHome.recentHistory.length : 0))
  };
}
var lifeTrackerBackendPlugin = {
  ensureSchema(ctx) {
    ensureHabitosSchema(getSqlite2(ctx));
    backend_default.ensureSchema?.(ctx);
    backend_default2.ensureSchema?.(ctx);
  },
  activate(ctx) {
    backend_default.activate?.(ctx);
    backend_default2.activate?.(ctx);
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:get-home`, async (_event, payload) => {
      try {
        return createSuccess3(buildHome(getSqlite2(ctx), payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo cargar Life Tracker.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-task`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        saveTaskSync(sqlite, payload, {
          today: todayLocalDate(),
          now: nowIso()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo guardar la tarea.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-task`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        toggleTaskSync(sqlite, String(payload?.taskId || ""), {
          now: nowIso()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo actualizar la tarea.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-task`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        deleteTaskSync(sqlite, String(payload?.taskId || ""));
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo borrar la tarea.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-habit`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        saveHabitSync(sqlite, payload, {
          today: todayLocalDate(),
          now: nowIso()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo guardar el habito.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        toggleOccurrenceSync(sqlite, String(payload?.occurrenceId || ""), {
          now: nowIso(),
          today: todayLocalDate()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo actualizar la ocurrencia.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:set-occurrence-quantity`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        setOccurrenceQuantitySync(sqlite, String(payload?.occurrenceId || ""), payload?.value, {
          now: nowIso(),
          today: todayLocalDate()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo guardar la cantidad diaria.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence-checklist-item`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        toggleOccurrenceChecklistItemSync(
          sqlite,
          String(payload?.occurrenceId || ""),
          String(payload?.itemId || ""),
          {
            now: nowIso(),
            today: todayLocalDate()
          }
        );
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo actualizar el checklist diario.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-habit`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        deleteHabitSync(sqlite, String(payload?.habitId || ""));
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo borrar el habito.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-category`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        saveHabitCategorySync(sqlite, payload, {
          now: nowIso()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo guardar la categoria.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-category`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        deleteHabitCategorySync(sqlite, String(payload?.categoryId || ""), {
          now: nowIso()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudo borrar la categoria.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:rename-category-references`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        renameCategoryReferencesSync(
          sqlite,
          String(payload?.previousName || ""),
          String(payload?.nextName || ""),
          {
            now: nowIso()
          }
        );
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudieron actualizar las referencias de categoria.");
      }
    });
    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:clear-category-references`, async (_event, payload) => {
      try {
        const sqlite = getSqlite2(ctx);
        clearCategoryReferencesSync(sqlite, String(payload?.categoryName || ""), {
          now: nowIso()
        });
        return createSuccess3(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError3(error, "No se pudieron limpiar las referencias de categoria.");
      }
    });
  }
};
var backend_default3 = lifeTrackerBackendPlugin;
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
//# sourceMappingURL=backend.cjs.map
