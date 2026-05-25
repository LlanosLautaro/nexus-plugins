const React = window.React;

// ../nexus-plugins/training/src/training-utils.js
function normalizeText(value) {
  return String(value ?? "").trim();
}
function normalizeComparableText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
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
function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}
function parseJsonObject(value, fallback = {}) {
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
  const data = parseJsonObject(measurement, {});
  const mode = normalizeOptionalText(data.mode);
  return mode ? TRAINING_MEASUREMENT_MODE_LABELS[mode] || mode : "";
}
function buildTrainingMetricSummary(metric) {
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
function isComparableTextMatch(value, query) {
  const normalizedValue = normalizeComparableText(value);
  const normalizedQuery = normalizeComparableText(query);
  if (!normalizedQuery) {
    return true;
  }
  return normalizedValue.includes(normalizedQuery);
}

// ../nexus-plugins/training/src/icons.jsx
var React2 = window.React;
function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React2.createElement(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    children
  );
}
function TrainingIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M7 6.5h10" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 17.5h10" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 9.5h2v5h-2z" }), /* @__PURE__ */ React2.createElement("path", { d: "M16 9.5h2v5h-2z" }), /* @__PURE__ */ React2.createElement("path", { d: "M9 12h6" }), /* @__PURE__ */ React2.createElement("path", { d: "M10.5 8.5v7" }), /* @__PURE__ */ React2.createElement("path", { d: "M13.5 8.5v7" }));
}
function PlusIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 5.5v13" }), /* @__PURE__ */ React2.createElement("path", { d: "M5.5 12h13" }));
}
function DeleteIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M5.5 7.5h13" }), /* @__PURE__ */ React2.createElement("path", { d: "M9 7.5V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M8 10.25v6.25" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 10.25v6.25" }), /* @__PURE__ */ React2.createElement("path", { d: "M16 10.25v6.25" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 7.5l.75 10A1.5 1.5 0 0 0 9.25 19h5.5a1.5 1.5 0 0 0 1.5-1.5l.75-10" }));
}
function RefreshIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M20 6v5h-5" }), /* @__PURE__ */ React2.createElement("path", { d: "M4 18v-5h5" }), /* @__PURE__ */ React2.createElement("path", { d: "M18 11a7 7 0 0 0-12-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 13a7 7 0 0 0 12 3" }));
}
function ArrowUpIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m8 12 4-4 4 4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 8v8" }));
}
function ArrowDownIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m8 12 4 4 4-4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 8v8" }));
}

// ../nexus-plugins/training/src/TrainingView.jsx
var { ipcRenderer } = window.require("electron");
var React3 = window.React;
var { useEffect, useMemo, useState } = React3;
var TRAINING_METRIC_MODE_OPTIONS = [
  { value: "reps", label: "Repeticiones" },
  { value: "time", label: "Tiempo" },
  { value: "distance", label: "Distancia" },
  { value: "weight", label: "Peso" }
];
function createExerciseMeasurementDraft(measurement = {}) {
  const normalized = normalizeTrainingMeasurement(measurement);
  return {
    mode: normalized.mode || "reps"
  };
}
function createRoutineMetricDraft(metric = {}, context = "exercise") {
  const normalized = context === "rest" ? normalizeTrainingPrescription(metric) : normalizeTrainingPrescription(metric);
  return {
    mode: normalized.mode || "reps",
    reps: normalized.reps == null ? "" : String(normalized.reps),
    seconds: normalized.seconds == null ? "" : String(normalized.seconds),
    distance: normalized.distance == null ? "" : String(normalized.distance),
    distanceUnit: normalized.distanceUnit || normalized.unit || "m",
    weight: normalized.weight == null ? "" : String(normalized.weight),
    weightUnit: normalized.weightUnit || normalized.unit || "kg",
    tempo: normalized.tempo || "",
    notes: normalized.notes || "",
    restSeconds: context === "rest" && normalized.restSeconds != null ? String(normalized.restSeconds) : ""
  };
}
function normalizeMetricDraftForMode(metricDraft, context = "exercise") {
  const normalized = createRoutineMetricDraft(metricDraft, context);
  const mode = normalized.mode || "reps";
  const nextDraft = {
    ...normalized,
    mode
  };
  if (context === "rest") {
    nextDraft.reps = "";
    nextDraft.seconds = "";
    nextDraft.distance = "";
    nextDraft.distanceUnit = "m";
    nextDraft.weight = "";
    nextDraft.weightUnit = "kg";
    nextDraft.tempo = "";
    return nextDraft;
  }
  if (mode === "reps") {
    nextDraft.seconds = "";
    nextDraft.distance = "";
    nextDraft.distanceUnit = "m";
  } else if (mode === "time") {
    nextDraft.reps = "";
    nextDraft.distance = "";
    nextDraft.distanceUnit = "m";
    nextDraft.weight = "";
    nextDraft.weightUnit = "kg";
  } else if (mode === "distance") {
    nextDraft.reps = "";
    nextDraft.seconds = "";
    nextDraft.weight = "";
    nextDraft.weightUnit = "kg";
  } else if (mode === "weight") {
    nextDraft.reps = "";
    nextDraft.seconds = "";
    nextDraft.distance = "";
    nextDraft.distanceUnit = "m";
  } else {
    nextDraft.reps = "";
    nextDraft.seconds = "";
    nextDraft.distance = "";
    nextDraft.distanceUnit = "m";
    nextDraft.weight = "";
    nextDraft.weightUnit = "kg";
  }
  return nextDraft;
}
function updateMetricDraftMode(metricDraft, nextMode, context = "exercise") {
  return normalizeMetricDraftForMode({
    ...metricDraft,
    mode: nextMode
  }, context);
}
function createExerciseDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    notes: "",
    measurement: createExerciseMeasurementDraft(),
    muscles: []
  };
}
function createRoutineStepDraft(kind = "exercise") {
  return {
    id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind,
    exerciseId: "",
    metric: createRoutineMetricDraft({}, kind === "rest" ? "rest" : "exercise")
  };
}
function createRoutineDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    notes: "",
    steps: []
  };
}
function exerciseRecordToDraft(exercise) {
  if (!exercise) {
    return createExerciseDraft();
  }
  const measurement = normalizeTrainingMeasurement(exercise.measurement);
  return {
    id: exercise.id,
    title: exercise.title || "",
    summary: exercise.summary || "",
    notes: exercise.notes || "",
    measurement: createExerciseMeasurementDraft(measurement),
    muscles: Array.isArray(exercise.muscles) ? exercise.muscles.map((muscle) => ({
      conceptId: muscle.conceptId || muscle.concept_id || muscle.entityRefId || muscle.entity_ref_id || muscle.id,
      entityRefId: muscle.conceptEntityRefId || muscle.concept_entity_ref_id || muscle.entityRefId || muscle.entity_ref_id || null,
      title: muscle.title || "",
      slug: muscle.slug || "",
      summary: muscle.summary || ""
    })) : []
  };
}
function routineRecordToDraft(routine) {
  if (!routine) {
    return createRoutineDraft();
  }
  return {
    id: routine.id,
    title: routine.title || "",
    summary: routine.summary || "",
    notes: routine.notes || "",
    steps: Array.isArray(routine.steps) ? routine.steps.map((step) => ({
      id: step.id || window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: step.kind || "exercise",
      exerciseId: step.exerciseId || step.exercise_id || "",
      metric: normalizeMetricDraftForMode(
        createRoutineMetricDraft(normalizeTrainingPrescription(step.prescription), step.kind === "rest" ? "rest" : "exercise"),
        step.kind === "rest" ? "rest" : "exercise"
      )
    })) : []
  };
}
function draftMetricToPayload(metricDraft, context = "exercise") {
  if (context === "rest") {
    return normalizeTrainingPrescription({
      restSeconds: metricDraft.restSeconds,
      notes: metricDraft.notes
    });
  }
  if (context === "exercise") {
    return normalizeTrainingMeasurement({
      mode: metricDraft.mode
    });
  }
  return normalizeTrainingPrescription({
    mode: metricDraft.mode,
    reps: metricDraft.reps,
    seconds: metricDraft.seconds,
    distance: metricDraft.distance,
    distanceUnit: metricDraft.distanceUnit,
    weight: metricDraft.weight,
    weightUnit: metricDraft.weightUnit,
    tempo: metricDraft.tempo,
    notes: metricDraft.notes
  });
}
function normalizeSearchValue(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function createOptionLabel(option) {
  const title = normalizeOptionalText(option?.title || option?.name || "");
  const summary = normalizeOptionalText(option?.summary || "");
  return summary ? `${title} - ${summary}` : title;
}
function normalizePathSearchValue(value) {
  return String(value ?? "").replace(/\\/g, "/").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function normalizeConceptRecord(concept) {
  if (!concept) {
    return null;
  }
  return {
    id: concept.id || concept.conceptId || concept.concept_id || null,
    entityRefId: concept.entityRefId || concept.entity_ref_id || concept.entityRefID || null,
    title: concept.title || concept.name || "",
    slug: concept.slug || "",
    summary: concept.summary || ""
  };
}
async function invoke(channel, payload) {
  const response = await ipcRenderer.invoke(channel, payload);
  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo ejecutar la operacion.");
  }
  return response.data;
}
function findExerciseById(exercises, exerciseId) {
  return exercises.find((exercise) => exercise.id === exerciseId) || null;
}
function TrainingMeasurementUnitEditor({
  label,
  value,
  onChange,
  disabled = false
}) {
  const currentMode = value?.mode || "reps";
  return /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, label), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Unidad de medida"), /* @__PURE__ */ React3.createElement(
    "select",
    {
      value: currentMode,
      onChange: (event) => onChange({ mode: event.target.value }),
      disabled
    },
    TRAINING_METRIC_MODE_OPTIONS.map((option) => /* @__PURE__ */ React3.createElement("option", { key: option.value, value: option.value }, option.label))
  ))), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__state" }, "Unidad: ", buildTrainingMeasurementUnitSummary(value) || "sin definir"));
}
function TrainingMetricEditor({
  label,
  value,
  onChange,
  context = "exercise",
  disabled = false
}) {
  const currentValue = normalizeMetricDraftForMode(value, context);
  const isRest = context === "rest";
  const mode = currentValue.mode || "reps";
  const updateField = (fieldName) => (event) => {
    onChange({
      ...currentValue,
      [fieldName]: event.target.value
    });
  };
  const updateMode = (event) => {
    onChange(updateMetricDraftMode(currentValue, event.target.value, context));
  };
  return /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, label), isRest ? /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Descanso"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: currentValue.restSeconds,
      onChange: updateField("restSeconds"),
      disabled,
      placeholder: "90"
    }
  ))), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Notas"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: currentValue.notes,
      onChange: updateField("notes"),
      disabled,
      placeholder: "Detalle del descanso."
    }
  ))) : /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Modo"), /* @__PURE__ */ React3.createElement("select", { value: mode, onChange: updateMode, disabled }, TRAINING_METRIC_MODE_OPTIONS.map((option) => /* @__PURE__ */ React3.createElement("option", { key: option.value, value: option.value }, option.label)))), mode === "reps" ? /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Reps"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: currentValue.reps,
      onChange: updateField("reps"),
      disabled,
      placeholder: "8"
    }
  )) : null, mode === "time" ? /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Segundos"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: currentValue.seconds,
      onChange: updateField("seconds"),
      disabled,
      placeholder: "45"
    }
  )) : null, mode === "distance" ? /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Distancia"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      min: "0",
      step: "0.01",
      value: currentValue.distance,
      onChange: updateField("distance"),
      disabled,
      placeholder: "1.5"
    }
  )) : null, mode === "weight" ? /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Peso"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      min: "0",
      step: "0.01",
      value: currentValue.weight,
      onChange: updateField("weight"),
      disabled,
      placeholder: "20"
    }
  )) : null), mode === "distance" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Unidad distancia"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.distanceUnit,
      onChange: updateField("distanceUnit"),
      disabled,
      placeholder: "m"
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Tempo"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.tempo,
      onChange: updateField("tempo"),
      disabled,
      placeholder: "3-1-1"
    }
  ))) : null, mode === "weight" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Unidad peso"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.weightUnit,
      onChange: updateField("weightUnit"),
      disabled,
      placeholder: "kg"
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Tempo"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.tempo,
      onChange: updateField("tempo"),
      disabled,
      placeholder: "3-1-1"
    }
  ))) : null, mode === "reps" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Peso"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      min: "0",
      step: "0.01",
      value: currentValue.weight,
      onChange: updateField("weight"),
      disabled,
      placeholder: "20"
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Unidad peso"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.weightUnit,
      onChange: updateField("weightUnit"),
      disabled,
      placeholder: "kg"
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Tempo"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.tempo,
      onChange: updateField("tempo"),
      disabled,
      placeholder: "3-1-1"
    }
  ))) : null, mode === "time" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Tempo"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: currentValue.tempo,
      onChange: updateField("tempo"),
      disabled,
      placeholder: "3-1-1"
    }
  ))) : null, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Notas"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: currentValue.notes,
      onChange: updateField("notes"),
      disabled,
      placeholder: "Detalle opcional."
    }
  ))));
}
function TrainingView() {
  const [mode, setMode] = useState("exercises");
  const [catalog, setCatalog] = useState({
    exercises: [],
    routines: [],
    muscles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [muscleSearch, setMuscleSearch] = useState("");
  const [muscleConceptFolder, setMuscleConceptFolder] = useState("Concepts/Muscles");
  const [exerciseDraft, setExerciseDraft] = useState(createExerciseDraft);
  const [routineDraft, setRoutineDraft] = useState(createRoutineDraft);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [muscleInput, setMuscleInput] = useState("");
  const filteredExercises = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(search);
    return catalog.exercises.filter((exercise) => {
      if (!normalizedSearch) {
        return true;
      }
      const muscles = Array.isArray(exercise.muscles) ? exercise.muscles.map((muscle) => muscle.title).join(" ") : "";
      return [
        exercise.title,
        exercise.summary,
        exercise.notes,
        exercise.searchSummary,
        muscles
      ].some((value) => isComparableTextMatch(value, normalizedSearch));
    });
  }, [catalog.exercises, search]);
  const filteredRoutines = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(search);
    return catalog.routines.filter((routine) => {
      if (!normalizedSearch) {
        return true;
      }
      return [
        routine.title,
        routine.summary,
        routine.notes,
        routine.searchSummary,
        Array.isArray(routine.steps) ? routine.steps.map((step) => step.searchSummary).join(" ") : ""
      ].some((value) => isComparableTextMatch(value, normalizedSearch));
    });
  }, [catalog.routines, search]);
  const filteredMuscles = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(muscleSearch);
    const normalizedFolder = normalizePathSearchValue(muscleConceptFolder);
    return catalog.muscles.filter((muscle) => {
      const pathMatches = !normalizedFolder || normalizePathSearchValue(muscle.itemPath || muscle.path || muscle.item_path || "").includes(normalizedFolder);
      if (!pathMatches) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return [
        muscle.title,
        muscle.slug,
        muscle.summary,
        muscle.searchText
      ].some((value) => isComparableTextMatch(value, normalizedSearch));
    });
  }, [catalog.muscles, muscleSearch, muscleConceptFolder]);
  const selectedExercise = useMemo(
    () => findExerciseById(catalog.exercises, selectedExerciseId),
    [catalog.exercises, selectedExerciseId]
  );
  const selectedRoutine = useMemo(
    () => catalog.routines.find((routine) => routine.id === selectedRoutineId) || null,
    [catalog.routines, selectedRoutineId]
  );
  async function loadLibrary(preferredExerciseId = null, preferredRoutineId = null) {
    setLoading(true);
    setError("");
    try {
      const [library, muscleResponse] = await Promise.all([
        invoke("training:list"),
        invoke("training:list-muscles", { query: "" })
      ]);
      const nextCatalog = {
        exercises: Array.isArray(library?.exercises) ? library.exercises : [],
        routines: Array.isArray(library?.routines) ? library.routines : [],
        muscles: Array.isArray(muscleResponse?.muscles) ? muscleResponse.muscles : Array.isArray(library?.muscles) ? library.muscles : []
      };
      setCatalog(nextCatalog);
      const nextExerciseId = preferredExerciseId || selectedExerciseId || nextCatalog.exercises[0]?.id || null;
      const nextRoutineId = preferredRoutineId || selectedRoutineId || nextCatalog.routines[0]?.id || null;
      setSelectedExerciseId(nextExerciseId);
      setSelectedRoutineId(nextRoutineId);
    } catch (loadError) {
      setError(loadError?.message || "No se pudo cargar el plugin de entrenamientos.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void loadLibrary();
  }, []);
  useEffect(() => {
    if (mode !== "exercises") {
      return;
    }
    if (!selectedExerciseId && catalog.exercises.length) {
      setSelectedExerciseId(catalog.exercises[0].id);
      return;
    }
    if (selectedExerciseId && !catalog.exercises.some((exercise) => exercise.id === selectedExerciseId)) {
      setSelectedExerciseId(catalog.exercises[0]?.id || null);
      return;
    }
    const selected = catalog.exercises.find((exercise) => exercise.id === selectedExerciseId);
    setExerciseDraft(selected ? exerciseRecordToDraft(selected) : createExerciseDraft());
  }, [mode, selectedExerciseId, catalog.exercises]);
  useEffect(() => {
    if (mode !== "routines") {
      return;
    }
    if (!selectedRoutineId && catalog.routines.length) {
      setSelectedRoutineId(catalog.routines[0].id);
      return;
    }
    if (selectedRoutineId && !catalog.routines.some((routine) => routine.id === selectedRoutineId)) {
      setSelectedRoutineId(catalog.routines[0]?.id || null);
      return;
    }
    const selected = catalog.routines.find((routine) => routine.id === selectedRoutineId);
    setRoutineDraft(selected ? routineRecordToDraft(selected) : createRoutineDraft());
  }, [mode, selectedRoutineId, catalog.routines]);
  async function handleSaveExercise() {
    const title = normalizeOptionalText(exerciseDraft.title);
    if (!title) {
      setError("El ejercicio necesita un titulo.");
      return;
    }
    setError("");
    try {
      const payload = {
        id: exerciseDraft.id,
        title,
        summary: normalizeOptionalText(exerciseDraft.summary),
        notes: normalizeOptionalText(exerciseDraft.notes),
        measurement: draftMetricToPayload(exerciseDraft.measurement, "exercise"),
        muscles: exerciseDraft.muscles.map((muscle) => ({
          conceptId: muscle.conceptId || muscle.entityRefId || null,
          title: muscle.title,
          slug: muscle.slug || null
        }))
      };
      const response = await invoke("training:save-exercise", payload);
      const savedExercise = response?.exercise || null;
      const nextExerciseId = savedExercise?.id || exerciseDraft.id || null;
      setExerciseDraft(savedExercise ? exerciseRecordToDraft(savedExercise) : createExerciseDraft());
      setSelectedExerciseId(nextExerciseId);
      await loadLibrary(nextExerciseId, selectedRoutineId);
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar el ejercicio.");
    }
  }
  async function handleSaveRoutine() {
    const title = normalizeOptionalText(routineDraft.title);
    if (!title) {
      setError("La rutina necesita un titulo.");
      return;
    }
    setError("");
    try {
      const payload = {
        id: routineDraft.id,
        title,
        summary: normalizeOptionalText(routineDraft.summary),
        notes: normalizeOptionalText(routineDraft.notes),
        steps: routineDraft.steps.map((step) => {
          const exercise = step.exerciseId ? findExerciseById(catalog.exercises, step.exerciseId) : null;
          return {
            kind: step.kind || "exercise",
            exerciseId: step.kind === "exercise" ? step.exerciseId || null : null,
            prescription: draftMetricToPayload(step.metric, step.kind === "rest" ? "rest" : "exercise"),
            exerciseTitleSnapshot: exercise?.title || null,
            exerciseMeasurementSnapshot: exercise?.measurement || null
          };
        })
      };
      const response = await invoke("training:save-routine", payload);
      const savedRoutine = response?.routine || null;
      const nextRoutineId = savedRoutine?.id || routineDraft.id || null;
      setRoutineDraft(savedRoutine ? routineRecordToDraft(savedRoutine) : createRoutineDraft());
      setSelectedRoutineId(nextRoutineId);
      await loadLibrary(selectedExerciseId, nextRoutineId);
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la rutina.");
    }
  }
  async function handleDeleteExercise() {
    if (!exerciseDraft.id) {
      return;
    }
    if (!window.confirm(`Borrar el ejercicio "${exerciseDraft.title}"?`)) {
      return;
    }
    setError("");
    try {
      await invoke("training:delete-exercise", { id: exerciseDraft.id });
      setExerciseDraft(createExerciseDraft());
      setSelectedExerciseId(null);
      await loadLibrary(null, selectedRoutineId);
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar el ejercicio.");
    }
  }
  async function handleDeleteRoutine() {
    if (!routineDraft.id) {
      return;
    }
    if (!window.confirm(`Borrar la rutina "${routineDraft.title}"?`)) {
      return;
    }
    setError("");
    try {
      await invoke("training:delete-routine", { id: routineDraft.id });
      setRoutineDraft(createRoutineDraft());
      setSelectedRoutineId(null);
      await loadLibrary(selectedExerciseId, null);
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar la rutina.");
    }
  }
  async function handleAddMuscle() {
    const rawTitle = normalizeOptionalText(muscleInput);
    if (!rawTitle) {
      return;
    }
    setError("");
    try {
      const normalizedTitle = normalizeSearchValue(rawTitle);
      const normalizedFolder = normalizePathSearchValue(muscleConceptFolder);
      const existingMuscle = catalog.muscles.find((muscle) => {
        const titleMatches = normalizeSearchValue(muscle.title) === normalizedTitle;
        const pathMatches = !normalizedFolder || normalizePathSearchValue(muscle.itemPath || muscle.path || muscle.item_path || "").includes(normalizedFolder);
        return titleMatches && pathMatches;
      }) || catalog.muscles.find((muscle) => normalizeSearchValue(muscle.title) === normalizedTitle);
      let concept = existingMuscle ? normalizeConceptRecord(existingMuscle) : null;
      if (!concept) {
        const response = await invoke("concepts:create", {
          title: rawTitle,
          summary: `Musculo: ${rawTitle}`,
          relativeDirectoryPath: muscleConceptFolder
        });
        concept = normalizeConceptRecord(response?.concept || null);
      }
      if (!concept) {
        throw new Error("No se pudo resolver el musculo.");
      }
      setExerciseDraft((current) => {
        const exists = current.muscles.some((muscle) => String(muscle.conceptId || muscle.entityRefId) === String(concept.id));
        if (exists) {
          return current;
        }
        return {
          ...current,
          muscles: [
            ...current.muscles,
            {
              conceptId: concept.id,
              entityRefId: concept.entityRefId,
              title: concept.title,
              slug: concept.slug,
              summary: concept.summary || ""
            }
          ]
        };
      });
      setMuscleInput("");
      await loadLibrary(selectedExerciseId, selectedRoutineId);
    } catch (muscleError) {
      setError(muscleError?.message || "No se pudo crear o enlazar el musculo.");
    }
  }
  function addMuscleFromSelector(muscle) {
    setExerciseDraft((current) => {
      const muscleId = String(muscle.conceptId || muscle.entityRefId || muscle.id);
      const exists = current.muscles.some((entry) => String(entry.conceptId || entry.entityRefId) === muscleId);
      if (exists) {
        return current;
      }
      return {
        ...current,
        muscles: [
          ...current.muscles,
          {
            conceptId: muscle.conceptId || muscle.id,
            entityRefId: muscle.entityRefId || null,
            title: muscle.title,
            slug: muscle.slug,
            summary: muscle.summary || ""
          }
        ]
      };
    });
  }
  function removeMuscleFromExercise(muscleId) {
    setExerciseDraft((current) => ({
      ...current,
      muscles: current.muscles.filter((muscle) => String(muscle.conceptId || muscle.entityRefId) !== String(muscleId))
    }));
  }
  function createExercise() {
    setMode("exercises");
    setSelectedExerciseId(null);
    setExerciseDraft(createExerciseDraft());
  }
  function createRoutine() {
    setMode("routines");
    setSelectedRoutineId(null);
    setRoutineDraft(createRoutineDraft());
  }
  function addRoutineStep(kind = "exercise") {
    setRoutineDraft((current) => ({
      ...current,
      steps: [...current.steps, createRoutineStepDraft(kind)]
    }));
  }
  function updateRoutineStep(stepId, updates) {
    setRoutineDraft((current) => ({
      ...current,
      steps: current.steps.map((step) => {
        if (step.id !== stepId) {
          return step;
        }
        const nextStep = { ...step, ...updates };
        if (updates.exerciseId && updates.kind !== "rest") {
          const exercise = findExerciseById(catalog.exercises, updates.exerciseId);
          if (exercise) {
            const metric = exercise.measurement || {};
            const currentMetric = nextStep.metric || createRoutineMetricDraft({}, "exercise");
            const isEmptyMetric = ![
              currentMetric.reps,
              currentMetric.seconds,
              currentMetric.distance,
              currentMetric.weight,
              currentMetric.tempo,
              currentMetric.notes
            ].some(Boolean);
            if (isEmptyMetric) {
              nextStep.metric = {
                ...normalizeMetricDraftForMode(createRoutineMetricDraft(metric, "exercise"), "exercise"),
                notes: metric.notes || ""
              };
            }
          }
        }
        if (updates.kind === "rest") {
          nextStep.exerciseId = "";
        }
        return nextStep;
      })
    }));
  }
  function removeRoutineStep(stepId) {
    setRoutineDraft((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== stepId)
    }));
  }
  function moveRoutineStep(stepId, direction) {
    setRoutineDraft((current) => {
      const index = current.steps.findIndex((step) => step.id === stepId);
      if (index < 0) {
        return current;
      }
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.steps.length) {
        return current;
      }
      const nextSteps = [...current.steps];
      const [movedStep] = nextSteps.splice(index, 1);
      nextSteps.splice(nextIndex, 0, movedStep);
      return {
        ...current,
        steps: nextSteps
      };
    });
  }
  const selectedExerciseMuscleIds = new Set(
    (exerciseDraft.muscles || []).map((muscle) => String(muscle.conceptId || muscle.entityRefId))
  );
  return /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__topbar" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__titleBlock" }, /* @__PURE__ */ React3.createElement("strong", null, "Entrenamientos"), /* @__PURE__ */ React3.createElement("span", null, "Ejercicios, musculos y rutinas lineales con concepts enlazados.")), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__topbarActions" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__modeToggle", role: "tablist", "aria-label": "Modo de entrenamientos" }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      className: `trainingPlugin__modeButton ${mode === "exercises" ? "is-active" : ""}`,
      onClick: () => setMode("exercises")
    },
    "Ejercicios"
  ), /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      className: `trainingPlugin__modeButton ${mode === "routines" ? "is-active" : ""}`,
      onClick: () => setMode("routines")
    },
    "Rutinas"
  )), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: () => loadLibrary() }, /* @__PURE__ */ React3.createElement(RefreshIcon, { size: 16 })), /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      className: "trainingPlugin__secondaryButton",
      onClick: mode === "exercises" ? createExercise : createRoutine
    },
    /* @__PURE__ */ React3.createElement(PlusIcon, { size: 16 })
  ))), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__content" }, /* @__PURE__ */ React3.createElement("aside", { className: "trainingPlugin__sidebar" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__searchField" }, /* @__PURE__ */ React3.createElement("span", null, "Buscar"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "search",
      value: search,
      onChange: (event) => setSearch(event.target.value),
      placeholder: mode === "exercises" ? "Buscar ejercicios" : "Buscar rutinas"
    }
  )), mode === "exercises" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__list" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__listHeader" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__listHeaderCopy" }, /* @__PURE__ */ React3.createElement("strong", null, "Ejercicios"), /* @__PURE__ */ React3.createElement("span", null, filteredExercises.length, " registros"))), filteredExercises.map((exercise) => /* @__PURE__ */ React3.createElement(
    "button",
    {
      key: exercise.id,
      type: "button",
      className: `trainingPlugin__listCard ${selectedExerciseId === exercise.id ? "is-active" : ""}`,
      onClick: () => {
        setMode("exercises");
        setSelectedExerciseId(exercise.id);
      }
    },
    /* @__PURE__ */ React3.createElement("span", { className: "trainingPlugin__listCardTitle" }, exercise.title),
    /* @__PURE__ */ React3.createElement("span", { className: "trainingPlugin__listCardSummary" }, exercise.searchSummary || exercise.summary || "Sin unidad definida")
  )), !filteredExercises.length ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__empty" }, /* @__PURE__ */ React3.createElement("strong", null, "No hay ejercicios."), /* @__PURE__ */ React3.createElement("div", null, "Crealo desde el boton +.")) : null) : /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__list" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__listHeader" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__listHeaderCopy" }, /* @__PURE__ */ React3.createElement("strong", null, "Rutinas"), /* @__PURE__ */ React3.createElement("span", null, filteredRoutines.length, " registros"))), filteredRoutines.map((routine) => /* @__PURE__ */ React3.createElement(
    "button",
    {
      key: routine.id,
      type: "button",
      className: `trainingPlugin__listCard ${selectedRoutineId === routine.id ? "is-active" : ""}`,
      onClick: () => {
        setMode("routines");
        setSelectedRoutineId(routine.id);
      }
    },
    /* @__PURE__ */ React3.createElement("span", { className: "trainingPlugin__listCardTitle" }, routine.title),
    /* @__PURE__ */ React3.createElement("span", { className: "trainingPlugin__listCardSummary" }, routine.searchSummary || routine.summary || "Sin pasos definidos")
  )), !filteredRoutines.length ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__empty" }, /* @__PURE__ */ React3.createElement("strong", null, "No hay rutinas."), /* @__PURE__ */ React3.createElement("div", null, "Creala desde el boton +.")) : null)), /* @__PURE__ */ React3.createElement("main", { className: "trainingPlugin__detail" }, error ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__state trainingPlugin__state--error" }, error) : null, loading ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__state" }, "Cargando entrenamientos...") : null, !loading && mode === "exercises" ? /* @__PURE__ */ React3.createElement("section", { className: "trainingPlugin__panel" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__panelCopy" }, /* @__PURE__ */ React3.createElement("strong", null, selectedExercise?.title || "Nuevo ejercicio"), /* @__PURE__ */ React3.createElement("span", null, selectedExercise?.searchSummary || selectedExercise?.summary || "Defini el movimiento, la unidad y los musculos asociados.")), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__formGrid" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Titulo"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: exerciseDraft.title,
      onChange: (event) => setExerciseDraft((current) => ({ ...current, title: event.target.value })),
      placeholder: "Sentadilla"
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Resumen"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: exerciseDraft.summary,
      onChange: (event) => setExerciseDraft((current) => ({ ...current, summary: event.target.value })),
      placeholder: "Describe el ejercicio en una linea."
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Notas"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: exerciseDraft.notes,
      onChange: (event) => setExerciseDraft((current) => ({ ...current, notes: event.target.value })),
      placeholder: "Indicaciones, tecnica o contexto."
    }
  )), /* @__PURE__ */ React3.createElement(
    TrainingMeasurementUnitEditor,
    {
      label: "Unidad",
      value: exerciseDraft.measurement,
      onChange: (nextMeasurement) => setExerciseDraft((current) => ({
        ...current,
        measurement: createExerciseMeasurementDraft(nextMeasurement)
      }))
    }
  ), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Musculos"), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__fieldRow" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__inlineField" }, /* @__PURE__ */ React3.createElement("span", null, "Carpeta de concepts"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: muscleConceptFolder,
      onChange: (event) => setMuscleConceptFolder(event.target.value),
      placeholder: "Concepts/Muscles"
    }
  ))), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__buttonRow" }, /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: muscleInput,
      onChange: (event) => setMuscleInput(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void handleAddMuscle();
        }
      },
      placeholder: "Biceps braquial"
    }
  ), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: () => void handleAddMuscle() }, "Agregar")), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__chipRow" }, (exerciseDraft.muscles || []).map((muscle) => /* @__PURE__ */ React3.createElement("span", { key: String(muscle.conceptId || muscle.entityRefId), className: "trainingPlugin__chip" }, /* @__PURE__ */ React3.createElement("span", { className: "trainingPlugin__chipLabel" }, muscle.title), /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      className: "trainingPlugin__chipRemove",
      onClick: () => removeMuscleFromExercise(muscle.conceptId || muscle.entityRefId),
      "aria-label": `Quitar ${muscle.title}`
    },
    "x"
  )))), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__searchField" }, /* @__PURE__ */ React3.createElement("span", null, "Concepts sugeridos"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "search",
      value: muscleSearch,
      onChange: (event) => setMuscleSearch(event.target.value),
      placeholder: "Filtrar concepts activos"
    }
  )), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__selectorList" }, filteredMuscles.slice(0, 20).map((muscle) => {
    const muscleId = String(muscle.conceptId || muscle.entityRefId || muscle.id);
    return /* @__PURE__ */ React3.createElement("div", { key: muscleId, className: "trainingPlugin__selectorItem" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__selectorItemMain" }, /* @__PURE__ */ React3.createElement("strong", null, createOptionLabel(muscle)), /* @__PURE__ */ React3.createElement("span", null, muscle.slug || muscle.title)), /* @__PURE__ */ React3.createElement(
      "button",
      {
        type: "button",
        className: "trainingPlugin__secondaryButton",
        disabled: selectedExerciseMuscleIds.has(muscleId),
        onClick: () => addMuscleFromSelector(muscle)
      },
      selectedExerciseMuscleIds.has(muscleId) ? "Agregado" : "Agregar"
    ));
  }), !filteredMuscles.length ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__state" }, "No hay concepts que coincidan con ese filtro.") : null))), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__buttonRow" }, /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__primaryButton", onClick: () => void handleSaveExercise() }, "Guardar ejercicio"), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: createExercise }, "Nuevo"), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: () => void handleDeleteExercise(), disabled: !exerciseDraft.id }, /* @__PURE__ */ React3.createElement(DeleteIcon, { size: 16 })))) : null, !loading && mode === "routines" ? /* @__PURE__ */ React3.createElement("section", { className: "trainingPlugin__panel" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__panelCopy" }, /* @__PURE__ */ React3.createElement("strong", null, selectedRoutine?.title || "Nueva rutina"), /* @__PURE__ */ React3.createElement("span", null, selectedRoutine?.searchSummary || selectedRoutine?.summary || "Armada con pasos lineales, ejercicios y descansos.")), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__formGrid" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Titulo"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: routineDraft.title,
      onChange: (event) => setRoutineDraft((current) => ({ ...current, title: event.target.value })),
      placeholder: "Push day"
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Resumen"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: routineDraft.summary,
      onChange: (event) => setRoutineDraft((current) => ({ ...current, summary: event.target.value })),
      placeholder: "Que persigue esta rutina."
    }
  )), /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Notas"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: routineDraft.notes,
      onChange: (event) => setRoutineDraft((current) => ({ ...current, notes: event.target.value })),
      placeholder: "Observaciones generales."
    }
  )), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__field trainingPlugin__field--wide" }, /* @__PURE__ */ React3.createElement("span", null, "Pasos"), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__buttonRow" }, /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: () => addRoutineStep("exercise") }, "Agregar ejercicio"), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: () => addRoutineStep("rest") }, "Agregar descanso")), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__steps" }, routineDraft.steps.map((step, index) => {
    const selectedExerciseForStep = step.exerciseId ? findExerciseById(catalog.exercises, step.exerciseId) : null;
    return /* @__PURE__ */ React3.createElement("div", { key: step.id, className: "trainingPlugin__step" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__stepHeader" }, /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__stepTitle" }, /* @__PURE__ */ React3.createElement("strong", null, "Paso ", index + 1), /* @__PURE__ */ React3.createElement("span", null, buildTrainingMetricSummary(
      draftMetricToPayload(step.metric, step.kind === "rest" ? "rest" : "exercise")
    ) || "Paso sin configurar")), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__stepActions" }, /* @__PURE__ */ React3.createElement(
      "button",
      {
        type: "button",
        className: "trainingPlugin__iconButton",
        onClick: () => moveRoutineStep(step.id, -1),
        disabled: index === 0
      },
      /* @__PURE__ */ React3.createElement(ArrowUpIcon, { size: 16 })
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        type: "button",
        className: "trainingPlugin__iconButton",
        onClick: () => moveRoutineStep(step.id, 1),
        disabled: index === routineDraft.steps.length - 1
      },
      /* @__PURE__ */ React3.createElement(ArrowDownIcon, { size: 16 })
    ), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__iconButton", onClick: () => removeRoutineStep(step.id) }, /* @__PURE__ */ React3.createElement(DeleteIcon, { size: 16 })))), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__formGrid" }, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field" }, /* @__PURE__ */ React3.createElement("span", null, "Tipo"), /* @__PURE__ */ React3.createElement(
      "select",
      {
        value: step.kind,
        onChange: (event) => updateRoutineStep(step.id, {
          kind: event.target.value === "rest" ? "rest" : "exercise",
          metric: event.target.value === "rest" ? createRoutineMetricDraft(step.metric, "rest") : normalizeMetricDraftForMode(step.metric, "exercise")
        })
      },
      /* @__PURE__ */ React3.createElement("option", { value: "exercise" }, "Ejercicio"),
      /* @__PURE__ */ React3.createElement("option", { value: "rest" }, "Descanso")
    )), step.kind === "exercise" ? /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("label", { className: "trainingPlugin__field" }, /* @__PURE__ */ React3.createElement("span", null, "Ejercicio"), /* @__PURE__ */ React3.createElement(
      "select",
      {
        value: step.exerciseId,
        onChange: (event) => {
          const nextExerciseId = event.target.value;
          const nextExercise = findExerciseById(catalog.exercises, nextExerciseId);
          updateRoutineStep(step.id, {
            exerciseId: nextExerciseId,
            kind: "exercise",
            metric: nextExercise ? normalizeMetricDraftForMode(
              createRoutineMetricDraft(nextExercise.measurement || {}, "exercise"),
              "exercise"
            ) : normalizeMetricDraftForMode(step.metric, "exercise")
          });
        }
      },
      /* @__PURE__ */ React3.createElement("option", { value: "" }, "Selecciona un ejercicio"),
      catalog.exercises.map((exercise) => /* @__PURE__ */ React3.createElement("option", { key: exercise.id, value: exercise.id }, exercise.title))
    )), /* @__PURE__ */ React3.createElement(
      TrainingMetricEditor,
      {
        label: "Prescripci\xF3n",
        context: "exercise",
        value: step.metric,
        onChange: (nextMetric) => updateRoutineStep(step.id, {
          metric: normalizeMetricDraftForMode(nextMetric, "exercise")
        })
      }
    ), selectedExerciseForStep ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__state" }, "Ejercicio: ", selectedExerciseForStep.title, selectedExerciseForStep.searchSummary ? ` - ${selectedExerciseForStep.searchSummary}` : "") : null) : /* @__PURE__ */ React3.createElement(
      TrainingMetricEditor,
      {
        label: "Descanso",
        context: "rest",
        value: step.metric,
        onChange: (nextMetric) => updateRoutineStep(step.id, {
          metric: normalizeMetricDraftForMode(nextMetric, "rest")
        })
      }
    )));
  }), !routineDraft.steps.length ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__empty" }, /* @__PURE__ */ React3.createElement("strong", null, "La rutina todavia no tiene pasos."), /* @__PURE__ */ React3.createElement("div", null, "Agrega un ejercicio o un descanso para empezar.")) : null))), /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__buttonRow" }, /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__primaryButton", onClick: () => void handleSaveRoutine() }, "Guardar rutina"), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: createRoutine }, "Nueva"), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "trainingPlugin__secondaryButton", onClick: () => void handleDeleteRoutine(), disabled: !routineDraft.id }, /* @__PURE__ */ React3.createElement(DeleteIcon, { size: 16 })))) : null, !loading && !catalog.exercises.length && mode === "exercises" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__empty" }, /* @__PURE__ */ React3.createElement("strong", null, "Sin ejercicios todavia."), /* @__PURE__ */ React3.createElement("div", null, "Crealo desde el boton + y luego enlaza sus musculos.")) : null, !loading && !catalog.routines.length && mode === "routines" ? /* @__PURE__ */ React3.createElement("div", { className: "trainingPlugin__empty" }, /* @__PURE__ */ React3.createElement("strong", null, "Sin rutinas todavia."), /* @__PURE__ */ React3.createElement("div", null, "Creala desde el boton + y arma sus pasos lineales.")) : null)));
}
var TrainingView_default = TrainingView;

// ../nexus-plugins/training/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = "nexus.training";
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var trainingRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerView({
      id: "nexus.training.workspace",
      pluginId: ctx.pluginId,
      title: "Entrenamientos",
      icon: TrainingIcon,
      tone: "document",
      surface: "workspace",
      component: (props) => /* @__PURE__ */ React.createElement(TrainingView_default, { ...props, ctx })
    });
    ctx.registerSideToolbarButton({
      id: "nexus.training.workspace-button",
      pluginId: ctx.pluginId,
      order: 260,
      icon: TrainingIcon,
      tone: "document",
      label: "Entrenamientos",
      onClick: () => {
        void ctx.openView({
          viewId: "nexus.training.workspace",
          reuse: true,
          sourceId: "nexus.training.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === "nexus.training.workspace";
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = trainingRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
