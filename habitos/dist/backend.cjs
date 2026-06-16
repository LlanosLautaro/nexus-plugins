var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nexus-plugins/habitos/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  default: () => backend_default
});
module.exports = __toCommonJS(backend_exports);

// ../nexus-plugins/habitos/src/habitos-core.js
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
function replaceTaskSubitemsSync(sqlite, taskId, subitems, timestamp) {
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
      timestamp,
      timestamp
    );
  }
}
function persistOccurrenceStateSync(sqlite, occurrence, habit, options = {}) {
  const timestamp = options.now || nowIso();
  const referenceDate = options.today || todayLocalDate();
  const nextProgressDataJson = normalizeOccurrenceProgressData(
    options.progressDataJson ?? occurrence.progressDataJson,
    habit
  );
  const nextStatus = OCCURRENCE_STATUS_VALUES.has(String(options.status || "").trim().toLowerCase()) ? String(options.status).trim().toLowerCase() : resolveOccurrenceStatus({
    ...occurrence,
    progressDataJson: nextProgressDataJson
  }, habit, referenceDate);
  const completedAt = nextStatus === "completed" ? occurrence.status === "completed" && occurrence.completedAt ? occurrence.completedAt : timestamp : null;
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
    timestamp,
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
  const timestamp = options.now || nowIso();
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
      timestamp,
      normalized.id
    );
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
      timestamp,
      timestamp
    );
  }
  return findHabitCategoryByIdSync(sqlite, normalized.id);
}
function saveTaskSync(sqlite, payload, options = {}) {
  const existingTask = payload?.id ? findTaskByIdSync(sqlite, String(payload.id)) : null;
  const normalized = normalizeTaskInput(payload, {
    existingTask,
    today: options.today || todayLocalDate()
  });
  const timestamp = options.now || nowIso();
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
        normalized.status === "completed" ? timestamp : null,
        timestamp,
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
        normalized.status === "completed" ? timestamp : null,
        timestamp,
        timestamp
      );
    }
    replaceTaskSubitemsSync(sqlite, normalized.id, normalized.subitems, timestamp);
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
  const timestamp = options.now || nowIso();
  const nextStatus = task.status === "completed" ? "open" : "completed";
  sqlite.prepare(`
    UPDATE habits_tasks
    SET status = ?,
        completed_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    nextStatus,
    nextStatus === "completed" ? timestamp : null,
    timestamp,
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
  const timestamp = options.now || nowIso();
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
        timestamp,
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
        timestamp,
        timestamp
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
  const timestamp = options.now || nowIso();
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
    const failedTaskResult = failExpiredTasks.run(timestamp, today);
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
          timestamp,
          timestamp
        );
        summary.inserted += Number(result.changes || 0);
      }
      if (lastGeneratedDate) {
        updateLastOccurrenceDate.run(lastGeneratedDate, timestamp, habit.id);
      }
    }
    const occurrences = listOccurrencesSync(sqlite);
    for (const occurrence of occurrences) {
      const habit = habitsById.get(occurrence.habitId);
      if (!habit) {
        continue;
      }
      const resolvedOccurrence = resolveOccurrenceRecord(occurrence, habit, today);
      const nextCompletedAt = resolvedOccurrence.status === "completed" ? occurrence.status === "completed" && occurrence.completedAt ? occurrence.completedAt : timestamp : null;
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
        timestamp,
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

// ../nexus-plugins/habitos/src/backend.ts
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
function getSqlite(ctx) {
  return ctx.requireRepositories().sqlite;
}
function resolveViewDate(dateValue) {
  return normalizeLocalDate(dateValue, todayLocalDate());
}
function buildHome(sqlite, dateValue) {
  const actualToday = todayLocalDate();
  return buildHabitosHomeSnapshot(sqlite, {
    today: resolveViewDate(dateValue),
    actualToday,
    now: nowIso()
  });
}
var habitosBackendPlugin = {
  ensureSchema(ctx) {
    ensureHabitosSchema(getSqlite(ctx));
  },
  activate(ctx) {
    ctx.registerIpc("habitos:get-home", async (_event, payload) => {
      try {
        return createSuccess(buildHome(getSqlite(ctx), payload?.date));
      } catch (error) {
        return createError(error, "No se pudo cargar Habitos y tareas.");
      }
    });
    ctx.registerIpc("habitos:save-task", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        saveTaskSync(sqlite, payload, {
          today: todayLocalDate(),
          now: nowIso()
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar la tarea.");
      }
    });
    ctx.registerIpc("habitos:toggle-task", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleTaskSync(sqlite, String(payload?.taskId || ""), {
          now: nowIso()
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar la tarea.");
      }
    });
    ctx.registerIpc("habitos:delete-task", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteTaskSync(sqlite, String(payload?.taskId || ""));
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar la tarea.");
      }
    });
    ctx.registerIpc("habitos:save-habit", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        saveHabitSync(sqlite, payload, {
          today: todayLocalDate(),
          now: nowIso()
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar el habito.");
      }
    });
    ctx.registerIpc("habitos:toggle-occurrence", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleOccurrenceSync(sqlite, String(payload?.occurrenceId || ""), {
          now: nowIso(),
          today: todayLocalDate()
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar la ocurrencia.");
      }
    });
    ctx.registerIpc("habitos:set-occurrence-quantity", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        setOccurrenceQuantitySync(sqlite, String(payload?.occurrenceId || ""), payload?.value, {
          now: nowIso(),
          today: todayLocalDate()
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar la cantidad diaria.");
      }
    });
    ctx.registerIpc("habitos:toggle-occurrence-checklist-item", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleOccurrenceChecklistItemSync(
          sqlite,
          String(payload?.occurrenceId || ""),
          String(payload?.itemId || ""),
          {
            now: nowIso(),
            today: todayLocalDate()
          }
        );
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar el checklist diario.");
      }
    });
    ctx.registerIpc("habitos:delete-habit", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteHabitSync(sqlite, String(payload?.habitId || ""));
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar el habito.");
      }
    });
    ctx.registerIpc("habitos:save-category", async (_event, payload) => {
      try {
        const sqlite = getSqlite(ctx);
        saveHabitCategorySync(sqlite, payload, {
          now: nowIso()
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar la categoria.");
      }
    });
  }
};
var backend_default = habitosBackendPlugin;
//# sourceMappingURL=backend.cjs.map
