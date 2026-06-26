export const TRAINING_SCHEDULE_TYPES = new Set(["daily", "weekdays"]);

export function todayLocalDate(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export function compareLocalDates(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}

export function addDaysToLocalDate(localDate, daysToAdd) {
  const base = new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return todayLocalDate();
  }

  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate(base);
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

function formatLocalDateToDayOfWeek(localDate) {
  const parsed = new Date(`${localDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getDay();
}

export function doesScheduleMatchDate(scheduleType, scheduleConfigJson, occurrenceDate) {
  const normalizedScheduleType = TRAINING_SCHEDULE_TYPES.has(String(scheduleType || "").trim().toLowerCase())
    ? String(scheduleType).trim().toLowerCase()
    : "daily";

  if (normalizedScheduleType === "weekdays") {
    const weekdays = normalizeWeekdays(scheduleConfigJson?.weekdays);
    return weekdays.includes(formatLocalDateToDayOfWeek(occurrenceDate));
  }

  return true;
}

export function buildOccurrenceDates({
  scheduleType = "daily",
  scheduleConfigJson = {},
  startDate,
  endDate,
}) {
  if (!startDate || !endDate || compareLocalDates(endDate, startDate) < 0) {
    return [];
  }

  const dates = [];
  let cursor = startDate;

  while (compareLocalDates(cursor, endDate) <= 0) {
    if (doesScheduleMatchDate(scheduleType, scheduleConfigJson, cursor)) {
      dates.push(cursor);
    }
    cursor = addDaysToLocalDate(cursor, 1);
  }

  return dates;
}

export function getOccurrenceWindowStartAt(occurrenceDate) {
  return `${occurrenceDate}T00:00:00.000`;
}

export function getOccurrenceWindowEndAt(occurrenceDate) {
  return `${occurrenceDate}T23:59:59.999`;
}
