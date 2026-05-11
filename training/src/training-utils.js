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

export function buildTrainingExerciseSummary(exercise) {
  const parts = [];
  const measurementSummary = buildTrainingMeasurementUnitSummary(exercise?.measurement);

  if (measurementSummary) {
    parts.push(measurementSummary);
  }

  const muscles = Array.isArray(exercise?.muscles)
    ? exercise.muscles
        .map((muscle) => normalizeOptionalText(muscle?.title || muscle?.name || muscle))
        .filter(Boolean)
    : [];

  if (muscles.length) {
    parts.push(muscles.slice(0, 3).join(", "));
  }

  return parts.join(" - ");
}

export function buildTrainingRoutineStepSummary(step, exerciseLookup = {}) {
  if (!step) {
    return "";
  }

  const kind = normalizeOptionalText(step.kind) || "exercise";

  if (kind === "rest") {
    const prescription = parseJsonObject(step.prescription, {});
    const restSeconds = toFiniteNumber(prescription.restSeconds);
    const notes = normalizeOptionalText(prescription.notes);
    const parts = [];

    parts.push(restSeconds != null ? `Rest ${restSeconds}s` : "Rest");

    if (notes) {
      parts.push(notes);
    }

    return parts.join(" - ");
  }

  const exerciseId = normalizeOptionalText(step.exerciseId);
  const exercise = exerciseId ? exerciseLookup[exerciseId] : null;
  const title = normalizeOptionalText(
    step.exerciseTitleSnapshot ||
      exercise?.title ||
      step.title ||
      "Exercise",
  );
  const prescription = parseJsonObject(step.prescription, {});
  const measurementSummary = buildTrainingMetricSummary(prescription);

  return [title, measurementSummary].filter(Boolean).join(" - ");
}

export function buildTrainingRoutineSummary(routine, exerciseLookup = {}) {
  const steps = Array.isArray(routine?.steps) ? routine.steps : [];
  const exerciseSteps = steps.filter((step) => normalizeOptionalText(step?.kind) !== "rest");
  const preview = steps
    .slice(0, 2)
    .map((step) => buildTrainingRoutineStepSummary(step, exerciseLookup))
    .filter(Boolean)
    .join(" - ");
  const base = `${steps.length} pasos`;

  if (!exerciseSteps.length) {
    return preview ? `${base} - ${preview}` : base;
  }

  return preview ? `${base} - ${exerciseSteps.length} ejercicios - ${preview}` : `${base} - ${exerciseSteps.length} ejercicios`;
}

export function normalizeTrainingMetricInput(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: true });
}

export function isComparableTextMatch(value, query) {
  const normalizedValue = normalizeComparableText(value);
  const normalizedQuery = normalizeComparableText(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizedValue.includes(normalizedQuery);
}
