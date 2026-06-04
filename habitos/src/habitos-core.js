const TASK_STATUS_VALUES = new Set(["open", "completed", "failed"]);
const HABIT_STATUS_VALUES = new Set(["active", "archived"]);
const OCCURRENCE_STATUS_VALUES = new Set(["pending", "completed", "failed"]);
const HABIT_SCHEDULE_TYPES = new Set(["daily", "weekdays"]);
const DEFAULT_PRIORITY = 2;
const DEFAULT_UPCOMING_LIMIT = 6;
const DEFAULT_HISTORY_LIMIT = 8;

function createId(prefix = "habitos") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function todayLocalDate(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeOptionalText(value) {
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

export function normalizeLocalDate(value, fallbackValue = todayLocalDate()) {
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

export function normalizeTimeValue(value) {
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

export function normalizePriorityValue(value, fallback = DEFAULT_PRIORITY) {
  const numericValue = Math.round(Number(value));
  if (![1, 2, 3].includes(numericValue)) {
    return fallback;
  }

  return numericValue;
}

export function normalizeWeekdays(value) {
  if (!Array.isArray(value)) {
    return [1, 2, 3, 4, 5];
  }

  const uniqueValues = new Set(
    value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6),
  );

  return [...uniqueValues].sort((left, right) => left - right);
}

export function normalizeTaskSubitems(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;

  return source
    .map((entry, index) => {
      const title = String(entry?.title ?? "").trim();
      if (!title) {
        return null;
      }

      return {
        id: String(entry?.id || createId("task-subitem")),
        title,
        isCompleted: normalizeBoolean(entry?.isCompleted, false),
        sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index,
      };
    })
    .filter(Boolean);
}

export function normalizeTaskInput(payload = {}, options = {}) {
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
    normalizeBoolean(existingTask?.subitemsBlocking, false),
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
    subitems,
  };
}

export function normalizeHabitInput(payload = {}, options = {}) {
  const today = options.today || todayLocalDate();
  const existingHabit = options.existingHabit || null;
  const title = String(payload?.title ?? existingHabit?.title ?? "").trim();

  if (!title) {
    throw new Error("El titulo del habito es obligatorio.");
  }

  const scheduleTypeCandidate = String(
    payload?.scheduleType ?? existingHabit?.scheduleType ?? "daily",
  ).trim().toLowerCase();
  const scheduleType = HABIT_SCHEDULE_TYPES.has(scheduleTypeCandidate)
    ? scheduleTypeCandidate
    : "daily";

  let rawScheduleConfig = payload?.scheduleConfigJson ?? existingHabit?.scheduleConfigJson ?? {};
  if (typeof rawScheduleConfig === "string") {
    try {
      rawScheduleConfig = JSON.parse(rawScheduleConfig);
    } catch {
      rawScheduleConfig = {};
    }
  }

  const scheduleConfig = scheduleType === "weekdays"
    ? { weekdays: normalizeWeekdays(rawScheduleConfig?.weekdays) }
    : {};

  const statusCandidate = String(payload?.status ?? existingHabit?.status ?? "active").trim().toLowerCase();

  return {
    id: String(payload?.id || existingHabit?.id || createId("habit")),
    title,
    category: normalizeOptionalText(payload?.category ?? existingHabit?.category),
    scheduleType,
    scheduleConfigJson: scheduleConfig,
    startDate: normalizeLocalDate(payload?.startDate ?? existingHabit?.startDate, today),
    endDate: normalizeOptionalText(payload?.endDate ?? existingHabit?.endDate)
      ? normalizeLocalDate(payload?.endDate ?? existingHabit?.endDate, today)
      : null,
    time: normalizeTimeValue(payload?.time ?? existingHabit?.time),
    priority: normalizePriorityValue(payload?.priority ?? existingHabit?.priority, DEFAULT_PRIORITY),
    notes: normalizeOptionalText(payload?.notes ?? existingHabit?.notes),
    status: HABIT_STATUS_VALUES.has(statusCandidate) ? statusCandidate : "active",
  };
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

export function shouldFailTaskForSnapshot(task, today) {
  return Boolean(
    task
    && task.status === "open"
    && !task.isPersistent
    && compareLocalDates(task.dueDate, today) < 0
  );
}

export function shouldFailPendingOccurrence(occurrence, today) {
  return Boolean(
    occurrence
    && occurrence.status === "pending"
    && compareLocalDates(occurrence.occurrenceDate, today) < 0
  );
}

function formatLocalDateToDayOfWeek(localDate) {
  const date = new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return -1;
  }

  return date.getDay();
}

function eachDateInclusive(startDate, endDate) {
  const values = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const limit = new Date(`${endDate}T00:00:00`);

  while (cursor <= limit) {
    values.push(todayLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return values;
}

export function buildOccurrenceDatesForHabit(habit, endDate) {
  if (!habit?.startDate || !endDate || compareLocalDates(endDate, habit.startDate) < 0) {
    return [];
  }

  return eachDateInclusive(habit.startDate, endDate).filter((entry) => doesHabitMatchDate(habit, entry));
}

export function doesHabitMatchDate(habit, occurrenceDate) {
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
    status: TASK_STATUS_VALUES.has(String(row.status || "").trim().toLowerCase())
      ? String(row.status).trim().toLowerCase()
      : "open",
    completedAt: normalizeDateTimeValue(row.completed_at),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    subitems,
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
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
  };
}

function normalizeHabitRecord(row) {
  if (!row?.id) {
    return null;
  }

  return {
    id: String(row.id),
    title: String(row.title || "").trim(),
    category: normalizeOptionalText(row.category),
    scheduleType: HABIT_SCHEDULE_TYPES.has(String(row.schedule_type || "").trim().toLowerCase())
      ? String(row.schedule_type).trim().toLowerCase()
      : "daily",
    scheduleConfigJson: parseJsonObject(row.schedule_config_json, {}),
    startDate: normalizeLocalDate(row.start_date),
    endDate: row.end_date ? normalizeLocalDate(row.end_date) : null,
    time: normalizeTimeValue(row.time),
    priority: normalizePriorityValue(row.priority),
    notes: normalizeOptionalText(row.notes),
    status: HABIT_STATUS_VALUES.has(String(row.status || "").trim().toLowerCase())
      ? String(row.status).trim().toLowerCase()
      : "active",
    lastOccurrenceDate: row.last_occurrence_date ? normalizeLocalDate(row.last_occurrence_date) : null,
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
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
    status: OCCURRENCE_STATUS_VALUES.has(String(row.status || "").trim().toLowerCase())
      ? String(row.status).trim().toLowerCase()
      : "pending",
    completedAt: normalizeDateTimeValue(row.completed_at),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
  };
}

function listTaskSubitemsGrouped(sqlite) {
  const rows = sqlite.prepare(`
    SELECT *
    FROM habits_task_subitems
    ORDER BY task_id ASC, sort_order ASC, created_at ASC
  `).all();

  const grouped = new Map();

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

export function listTasksSync(sqlite) {
  const groupedSubitems = listTaskSubitemsGrouped(sqlite);

  return sqlite.prepare(`
    SELECT *
    FROM habits_tasks
    ORDER BY due_date ASC, time ASC, created_at ASC
  `).all()
    .map((row) => normalizeTaskRecord(row, groupedSubitems.get(String(row.id)) || []))
    .filter(Boolean);
}

export function listHabitsSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM habits_habits
    ORDER BY title COLLATE NOCASE ASC, created_at ASC
  `).all()
    .map((row) => normalizeHabitRecord(row))
    .filter(Boolean);
}

export function listOccurrencesSync(sqlite) {
  return sqlite.prepare(`
    SELECT *
    FROM habits_habit_occurrences
    ORDER BY occurrence_date DESC, created_at DESC
  `).all()
    .map((row) => normalizeOccurrenceRecord(row))
    .filter(Boolean);
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
  `).all(taskId)
    .map((entry) => normalizeTaskSubitemRecord(entry))
    .filter(Boolean);

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

export function ensureHabitosSchema(sqlite) {
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
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_occurrences_unique ON habits_habit_occurrences (habit_id, occurrence_date);
    CREATE INDEX IF NOT EXISTS idx_habits_occurrences_status ON habits_habit_occurrences (status, occurrence_date DESC);
  `);
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
      timestamp,
    );
  }
}

export function saveTaskSync(sqlite, payload, options = {}) {
  const existingTask = payload?.id ? findTaskByIdSync(sqlite, String(payload.id)) : null;
  const normalized = normalizeTaskInput(payload, {
    existingTask,
    today: options.today || todayLocalDate(),
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
        normalized.id,
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
        timestamp,
      );
    }

    replaceTaskSubitemsSync(sqlite, normalized.id, normalized.subitems, timestamp);
  })();

  return findTaskByIdSync(sqlite, normalized.id);
}

export function toggleTaskSync(sqlite, taskId, options = {}) {
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
    task.id,
  );

  return findTaskByIdSync(sqlite, task.id);
}

export function deleteTaskSync(sqlite, taskId) {
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

export function saveHabitSync(sqlite, payload, options = {}) {
  const existingHabit = payload?.id ? findHabitByIdSync(sqlite, String(payload.id)) : null;
  const normalized = normalizeHabitInput(payload, {
    existingHabit,
    today: options.today || todayLocalDate(),
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
        normalized.notes,
        normalized.status,
        timestamp,
        normalized.id,
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
          notes,
          status,
          last_occurrence_date,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        normalized.notes,
        normalized.status,
        null,
        timestamp,
        timestamp,
      );
    }
  })();

  return findHabitByIdSync(sqlite, normalized.id);
}

export function toggleOccurrenceSync(sqlite, occurrenceId, options = {}) {
  const occurrence = findOccurrenceByIdSync(sqlite, occurrenceId);

  if (!occurrence) {
    throw new Error("No encontramos la ocurrencia solicitada.");
  }

  const timestamp = options.now || nowIso();
  const nextStatus = occurrence.status === "completed" ? "pending" : "completed";

  sqlite.prepare(`
    UPDATE habits_habit_occurrences
    SET status = ?,
        completed_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    nextStatus,
    nextStatus === "completed" ? timestamp : null,
    timestamp,
    occurrence.id,
  );

  return findOccurrenceByIdSync(sqlite, occurrence.id);
}

export function deleteHabitSync(sqlite, habitId) {
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

export function syncOccurrencesUntilToday(sqlite, options = {}) {
  const today = options.today || todayLocalDate();
  const timestamp = options.now || nowIso();
  const habits = listHabitsSync(sqlite).filter((entry) => entry.status === "active");
  const summary = {
    inserted: 0,
    failed: 0,
    tasksFailed: 0,
  };

  const insertOccurrence = sqlite.prepare(`
    INSERT OR IGNORE INTO habits_habit_occurrences (
      id,
      habit_id,
      occurrence_date,
      window_start_at,
      window_end_at,
      status,
      completed_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateLastOccurrenceDate = sqlite.prepare(`
    UPDATE habits_habits
    SET last_occurrence_date = ?,
        updated_at = ?
    WHERE id = ?
  `);

  const failPastOccurrences = sqlite.prepare(`
    UPDATE habits_habit_occurrences
    SET status = 'failed',
        completed_at = NULL,
        updated_at = ?
    WHERE habit_id = ?
      AND status = 'pending'
      AND occurrence_date < ?
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

    for (const habit of habits) {
      const rangeEnd = habit.endDate && compareLocalDates(habit.endDate, today) < 0
        ? habit.endDate
        : today;

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
          null,
          timestamp,
          timestamp,
        );

        summary.inserted += Number(result.changes || 0);
      }

      const failedResult = failPastOccurrences.run(timestamp, habit.id, today);
      summary.failed += Number(failedResult.changes || 0);

      if (lastGeneratedDate) {
        updateLastOccurrenceDate.run(lastGeneratedDate, timestamp, habit.id);
      }
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
    raw: task,
  };
}

function buildOccurrenceQueueItem(occurrence, habit, today) {
  const isOverdue = compareLocalDates(occurrence.occurrenceDate, today) < 0;
  const weekdaySummary = habit.scheduleType === "weekdays"
    ? `Dias fijos: ${normalizeWeekdays(habit.scheduleConfigJson?.weekdays).join(", ")}`
    : "Frecuencia diaria";

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
    isOverdue,
    statusLabel: occurrence.status === "completed" ? "Cumplida" : occurrence.status === "failed" ? "Fallida" : "Pendiente",
    summary: weekdaySummary,
    meta: habit.scheduleType === "weekdays" ? "Dias elegidos" : "Cada dia",
    occurrence,
    habit,
    raw: occurrence,
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
    raw: task,
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
    statusLabel: occurrence.status === "completed" ? "Cumplida" : "Fallida",
    timestamp: occurrence.completedAt || occurrence.updatedAt,
    summary: occurrence.status === "completed"
      ? "Ocurrencia registrada como cumplida."
      : "La ventana del habito cerro sin completarse.",
    occurrence,
    habit,
    raw: occurrence,
  };
}

function getTemporalSortValue(entry) {
  const datePart = String(entry?.date || "");
  const timePart = String(entry?.time || "").trim();
  return `${datePart}|${timePart || "99:99"}`;
}

export function compareDailyQueueItems(left, right) {
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

export function buildHabitosHomeSnapshot(sqlite, options = {}) {
  const today = options.today || todayLocalDate();
  syncOccurrencesUntilToday(sqlite, {
    today,
    now: options.now || nowIso(),
  });

  const tasks = listTasksSync(sqlite);
  const habits = listHabitsSync(sqlite);
  const occurrences = listOccurrencesSync(sqlite);
  const habitsById = new Map(habits.map((entry) => [entry.id, entry]));

  const dailyTaskItems = tasks
    .filter((task) => task.status === "open" && compareLocalDates(task.dueDate, today) <= 0)
    .map((task) => buildTaskQueueItem(task, today));

  const dailyHabitItems = occurrences
    .filter((occurrence) => occurrence.status === "pending" && occurrence.occurrenceDate === today)
    .map((occurrence) => {
      const habit = habitsById.get(occurrence.habitId);
      return habit ? buildOccurrenceQueueItem(occurrence, habit, today) : null;
    })
    .filter(Boolean);

  const upcomingTasks = tasks
    .filter((task) => task.status === "open" && compareLocalDates(task.dueDate, today) > 0)
    .sort(compareUpcomingTasks)
    .slice(0, DEFAULT_UPCOMING_LIMIT);

  const recentHistory = [
    ...tasks.filter((task) => task.status === "completed" || task.status === "failed").map(buildHistoryItemFromTask),
    ...occurrences
      .filter((occurrence) => occurrence.status === "completed" || occurrence.status === "failed")
      .map((occurrence) => buildHistoryItemFromOccurrence(occurrence, habitsById.get(occurrence.habitId))),
  ]
    .sort(compareHistoryEntries)
    .slice(0, DEFAULT_HISTORY_LIMIT);

  const completedTaskIdsToday = new Set(
    tasks
      .filter((task) => task.status === "completed" && String(task.completedAt || "").startsWith(today))
      .map((task) => task.id),
  );

  const completedOccurrencesToday = occurrences.filter(
    (occurrence) => occurrence.status === "completed" && String(occurrence.completedAt || "").startsWith(today),
  );

  return {
    today,
    tasks,
    habits,
    dailyQueue: [...dailyTaskItems, ...dailyHabitItems].sort(compareDailyQueueItems),
    upcomingTasks,
    recentHistory,
    tasksSummary: {
      queueCount: dailyTaskItems.length,
      openCount: tasks.filter((task) => task.status === "open").length,
      upcomingCount: upcomingTasks.length,
      completedTodayCount: completedTaskIdsToday.size,
      failedCount: tasks.filter((task) => task.status === "failed").length,
    },
    habitsSummary: {
      activeCount: habits.filter((habit) => habit.status === "active").length,
      pendingTodayCount: dailyHabitItems.length,
      completedTodayCount: completedOccurrencesToday.length,
      failedCount: occurrences.filter((occurrence) => occurrence.status === "failed").length,
    },
  };
}
