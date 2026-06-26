import {
  findTrainingMuscleByAlias,
  getTrainingMuscleById,
} from "./training-muscles.js";
import {
  normalizeLocalDate,
  normalizeTimeValue,
  normalizeWeekdays,
} from "./training-schedule.js";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeComparableText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
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

export function normalizeTrainingSlug(value, fallback = "training") {
  const source = normalizeText(value || fallback);
  const slug = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

export function parseJsonObject(value, fallback = {}) {
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
  const source = parseJsonObject(value, {});
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

  const mode = normalizeOptionalText(source.mode);
  if (mode) {
    normalized.mode = mode;
  }

  const distanceUnit = normalizeOptionalText(source.distanceUnit);
  if (distanceUnit) {
    normalized.distanceUnit = distanceUnit;
  }

  const weightUnit = normalizeOptionalText(source.weightUnit);
  if (weightUnit) {
    normalized.weightUnit = weightUnit;
  }

  const unit = normalizeOptionalText(source.unit);
  if (unit) {
    normalized.unit = unit;
  }

  const tempo = normalizeOptionalText(source.tempo);
  if (tempo) {
    normalized.tempo = tempo;
  }

  const notes = normalizeOptionalText(source.notes);
  if (notes) {
    normalized.notes = notes;
  }

  if (source.extra && typeof source.extra === "object" && !Array.isArray(source.extra)) {
    normalized.extra = cloneJson(source.extra);
  }

  return normalized;
}

export function normalizeTrainingMeasurement(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: false });
}

export function normalizeTrainingPrescription(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: true });
}

export function normalizeTrainingMetricInput(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: true });
}

const TRAINING_MEASUREMENT_MODE_LABELS = {
  reps: "Repeticiones",
  time: "Tiempo",
  distance: "Distancia",
  weight: "Peso",
};

export function buildTrainingMeasurementUnitSummary(measurement) {
  const data = parseJsonObject(measurement, {});
  const mode = normalizeOptionalText(data.mode);
  return mode ? TRAINING_MEASUREMENT_MODE_LABELS[mode] || mode : "";
}

export function buildTrainingMetricSummary(metric) {
  const data = parseJsonObject(metric, {});
  const parts = [];
  const mode = normalizeOptionalText(data.mode);

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

export function normalizeTrainingMuscleLoads(value, options = {}) {
  const source = Array.isArray(value) ? value : [];
  const includeWarnings = Boolean(options.includeWarnings);
  const uniqueLoads = new Map();
  const warnings = [];

  for (const entry of source) {
    const raw = entry && typeof entry === "object" ? entry : { muscleId: entry };
    const rawMuscleId = normalizeOptionalText(raw.muscleId || raw.id);
    const load = normalizeTrainingLoad(raw.load);
    const resolvedMuscle = rawMuscleId
      ? getTrainingMuscleById(rawMuscleId)
      : findTrainingMuscleByAlias(raw.title || raw.name || raw.slug || "");

    if (!resolvedMuscle || load == null) {
      if (includeWarnings) {
        const warningLabel = normalizeOptionalText(raw.title || raw.name || raw.slug || rawMuscleId);
        if (warningLabel) {
          warnings.push({
            sourceTitle: warningLabel,
            sourceSlug: normalizeTrainingSlug(warningLabel, "legacy-muscle"),
          });
        }
      }
      continue;
    }

    uniqueLoads.set(resolvedMuscle.id, {
      muscleId: resolvedMuscle.id,
      load,
      title: resolvedMuscle.title,
      slug: resolvedMuscle.slug,
      regionId: resolvedMuscle.regionId,
      regionTitle: resolvedMuscle.regionTitle,
      groupId: resolvedMuscle.groupId,
      groupTitle: resolvedMuscle.groupTitle,
    });
  }

  const muscleLoads = [...uniqueLoads.values()].sort((left, right) => {
    const groupCompare = String(left.groupTitle || "").localeCompare(String(right.groupTitle || ""));
    if (groupCompare !== 0) {
      return groupCompare;
    }

    return String(left.title || "").localeCompare(String(right.title || ""));
  });

  return includeWarnings
    ? {
        muscleLoads,
        warnings,
      }
    : muscleLoads;
}

export function buildTrainingMuscleLoadSummary(muscleLoads) {
  const list = Array.isArray(muscleLoads) ? muscleLoads : [];
  return list
    .slice(0, 4)
    .map((entry) => `${entry.title || getTrainingMuscleById(entry.muscleId)?.title || entry.muscleId} ${entry.load}/10`)
    .join(", ");
}

export function buildTrainingExerciseSummary(exercise) {
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
  return normalizeOptionalText(value) === "rest" ? "rest" : "exercise";
}

function normalizeExerciseSnapshot(rawExercise, rawSegment) {
  return {
    id: normalizeOptionalText(rawExercise?.id || rawSegment?.exerciseId || rawSegment?.exercise_id),
    title: normalizeOptionalText(rawExercise?.title || rawSegment?.exerciseTitleSnapshot || rawSegment?.exercise_title_snapshot) || "Ejercicio",
    slug: normalizeOptionalText(rawExercise?.slug),
    measurement: normalizeTrainingMeasurement(
      rawExercise?.measurement || rawSegment?.exerciseMeasurementSnapshot || rawSegment?.exercise_measurement_snapshot,
    ),
  };
}

function normalizeStructureStep(step, exerciseLookup = new Map(), stepIndex = 0) {
  const raw = step && typeof step === "object" ? step : {};
  const stepKind = normalizeRoutineStepKind(raw.stepKind || raw.kind);
  const exerciseId = stepKind === "rest"
    ? null
    : normalizeOptionalText(raw.exerciseId || raw.exercise_id);
  const exercise = exerciseId ? exerciseLookup.get(exerciseId) : null;

  return {
    id: normalizeOptionalText(raw.id) || `step-${stepIndex + 1}`,
    type: "step",
    stepKind,
    exerciseId,
    exerciseTitleSnapshot: stepKind === "exercise"
      ? (exercise?.title || normalizeOptionalText(raw.exerciseTitleSnapshot || raw.exercise_title_snapshot) || "Ejercicio")
      : null,
    exerciseMeasurementSnapshot: stepKind === "exercise"
      ? normalizeTrainingMeasurement(
          exercise?.measurement || raw.exerciseMeasurementSnapshot || raw.exercise_measurement_snapshot,
        )
      : {},
    prescription: normalizeTrainingPrescription(raw.prescription || raw.metric || raw.payload || raw.measurement),
    resolvedExercise: stepKind === "exercise"
      ? normalizeExerciseSnapshot(exercise, raw)
      : null,
  };
}

function normalizeStructureBlock(block, exerciseLookup = new Map(), blockIndex = 0) {
  const raw = block && typeof block === "object" ? block : {};
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const repeatCount = Math.max(1, Math.round(Number(raw.repeatCount || raw.rounds || 1)) || 1);

  return {
    id: normalizeOptionalText(raw.id) || `block-${blockIndex + 1}`,
    type: "block",
    title: normalizeOptionalText(raw.title) || `Bloque ${blockIndex + 1}`,
    repeatCount,
    steps: rawSteps.map((step, index) => normalizeStructureStep(step, exerciseLookup, index)),
  };
}

function normalizeStructureSegment(segment, exerciseLookup = new Map(), index = 0) {
  const raw = segment && typeof segment === "object" ? segment : {};
  const type = normalizeOptionalText(raw.type);
  return type === "block"
    ? normalizeStructureBlock(raw, exerciseLookup, index)
    : normalizeStructureStep(raw, exerciseLookup, index);
}

export function migrateLegacyTrainingSteps(steps, exerciseLookup = new Map()) {
  const source = Array.isArray(steps) ? steps : [];
  return source.map((step, index) => normalizeStructureStep(step, exerciseLookup, index));
}

export function normalizeTrainingStructure(value, exerciseLookup = new Map()) {
  const source = Array.isArray(value)
    ? value
    : Array.isArray(value?.segments)
      ? value.segments
      : [];

  return source.map((segment, index) => normalizeStructureSegment(segment, exerciseLookup, index));
}

export function flattenTrainingStructureSteps(structure, options = {}) {
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
          repeatCount: segment.repeatCount,
        });
      }

      for (const step of Array.isArray(segment.steps) ? segment.steps : []) {
        flattened.push({
          ...step,
          parentBlockId: segment.id,
          parentBlockTitle: segment.title,
          parentBlockRepeatCount: segment.repeatCount,
        });
      }
      continue;
    }

    flattened.push(segment);
  }

  return flattened;
}

export function buildTrainingRoutineStepSummary(step, exerciseLookup = {}) {
  if (!step) {
    return "";
  }

  const stepKind = normalizeRoutineStepKind(step.stepKind || step.kind);

  if (stepKind === "rest") {
    const prescription = parseJsonObject(step.prescription, {});
    const restSeconds = toFiniteNumber(prescription.restSeconds);
    const notes = normalizeOptionalText(prescription.notes);
    const parts = [restSeconds != null ? `Rest ${restSeconds}s` : "Rest"];

    if (notes) {
      parts.push(notes);
    }

    return parts.join(" - ");
  }

  const exerciseId = normalizeOptionalText(step.exerciseId || step.exercise_id);
  const exercise = exerciseId ? exerciseLookup[exerciseId] : null;
  const title = normalizeOptionalText(
    step.exerciseTitleSnapshot
      || step.exercise_title_snapshot
      || step.title
      || exercise?.title
      || step.resolvedExercise?.title
      || "Ejercicio",
  );
  const metricSummary = buildTrainingMetricSummary(step.prescription || step.metric);

  return [title, metricSummary].filter(Boolean).join(" - ");
}

export function buildTrainingRoutineSummary(routine, exerciseLookup = {}) {
  const structure = Array.isArray(routine?.structure)
    ? routine.structure
    : Array.isArray(routine?.steps)
      ? migrateLegacyTrainingSteps(routine.steps)
      : [];
  const flattenedSteps = flattenTrainingStructureSteps(structure).filter((entry) => entry.type === "step");
  const exerciseSteps = flattenedSteps.filter((step) => normalizeRoutineStepKind(step.stepKind || step.kind) !== "rest");
  const blockCount = structure.filter((segment) => segment?.type === "block").length;
  const preview = flattenedSteps
    .slice(0, 2)
    .map((step) => buildTrainingRoutineStepSummary(step, exerciseLookup))
    .filter(Boolean)
    .join(" - ");

  const parts = [`${flattenedSteps.length} pasos`, `${exerciseSteps.length} ejercicios`];
  if (blockCount) {
    parts.push(`${blockCount} bloques`);
  }
  if (preview) {
    parts.push(preview);
  }

  return parts.join(" - ");
}

export function buildTrainingStructureSummary(structure, exerciseLookup = {}) {
  return buildTrainingRoutineSummary({ structure }, exerciseLookup);
}

export function normalizeTrainingCompletionMode(value, fallback = "yes-no") {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "detailed" ? "detailed" : fallback;
}

export function normalizeTrainingAssignmentInput(payload = {}, options = {}) {
  const existingAssignment = options.existingAssignment || null;
  const routineId = normalizeOptionalText(payload?.routineId ?? existingAssignment?.routineId);
  const startDate = normalizeLocalDate(payload?.startDate ?? existingAssignment?.startDate);
  const endDateValue = normalizeOptionalText(payload?.endDate ?? existingAssignment?.endDate);
  const scheduleType = String(payload?.scheduleType ?? existingAssignment?.scheduleType ?? "daily").trim().toLowerCase();
  const normalizedScheduleType = scheduleType === "weekdays" ? "weekdays" : "daily";
  const scheduleConfigJson = normalizedScheduleType === "weekdays"
    ? { weekdays: normalizeWeekdays(payload?.scheduleConfigJson?.weekdays ?? existingAssignment?.scheduleConfigJson?.weekdays) }
    : {};
  const priority = Math.min(100, Math.max(1, Math.round(Number(payload?.priority ?? existingAssignment?.priority ?? 1)) || 1));

  if (!routineId) {
    throw new Error("Selecciona una rutina.");
  }

  return {
    routineId,
    scheduleType: normalizedScheduleType,
    scheduleConfigJson,
    startDate,
    endDate: endDateValue ? normalizeLocalDate(endDateValue, startDate) : null,
    time: normalizeTimeValue(payload?.time ?? existingAssignment?.time),
    priority,
    status: normalizeOptionalText(payload?.status ?? existingAssignment?.status) === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(payload?.completionMode ?? existingAssignment?.completionMode),
  };
}

export function normalizeTrainingOccurrenceResult(value, completionMode = "yes-no") {
  const normalizedMode = normalizeTrainingCompletionMode(completionMode);

  if (normalizedMode === "detailed") {
    const source = value && typeof value === "object" ? value : {};
    const entriesSource = Array.isArray(source.entries) ? source.entries : [];

    return {
      mode: "detailed",
      entries: entriesSource
        .map((entry, index) => {
          const raw = entry && typeof entry === "object" ? entry : {};
          const actual = normalizeTrainingPrescription(raw.actual || raw.metric || raw.prescription || {});
          const hasActual = Object.keys(actual).length > 0;
          if (!hasActual) {
            return null;
          }

          return {
            id: normalizeOptionalText(raw.id) || `entry-${index + 1}`,
            stepId: normalizeOptionalText(raw.stepId) || null,
            exerciseId: normalizeOptionalText(raw.exerciseId) || null,
            title: normalizeOptionalText(raw.title) || "Ejercicio",
            actual,
          };
        })
        .filter(Boolean),
    };
  }

  return {
    mode: "yes-no",
    completed: true,
  };
}

export function isComparableTextMatch(value, query) {
  const normalizedValue = normalizeComparableText(value);
  const normalizedQuery = normalizeComparableText(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizedValue.includes(normalizedQuery);
}
