import {
  buildTrainingMetricSummary,
  buildTrainingMeasurementUnitSummary,
  isComparableTextMatch,
  normalizeOptionalText,
  normalizeTrainingMeasurement,
  normalizeTrainingPrescription,
} from "./training-utils.js";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  PlusIcon,
  RefreshIcon,
  TrainingIcon,
} from "./icons.jsx";
import {
  Button,
  Notice,
  PanelHeader,
  PanelTitle,
  SectionPanel,
  SegmentedControl,
  SplitDetail,
  SplitLayout,
  SplitSidebar,
  ToolbarActions,
  WorkspaceBody,
  WorkspacePage,
  WorkspaceTitle,
  WorkspaceTopbar,
  StateBlock,
} from "../../../nexus-frontend/src/ui/index.js";

const { ipcRenderer } = window.require("electron");
const React = window.React;
const { useEffect, useMemo, useState } = React;

const TRAINING_METRIC_MODE_OPTIONS = [
  { value: "reps", label: "Repeticiones" },
  { value: "time", label: "Tiempo" },
  { value: "distance", label: "Distancia" },
  { value: "weight", label: "Peso" },
];

function createExerciseMeasurementDraft(measurement = {}) {
  const normalized = normalizeTrainingMeasurement(measurement);
  return {
    mode: normalized.mode || "reps",
  };
}

function createRoutineMetricDraft(metric = {}, context = "exercise") {
  const normalized = context === "rest"
    ? normalizeTrainingPrescription(metric)
    : normalizeTrainingPrescription(metric);

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
    restSeconds: context === "rest" && normalized.restSeconds != null ? String(normalized.restSeconds) : "",
  };
}

function normalizeMetricDraftForMode(metricDraft, context = "exercise") {
  const normalized = createRoutineMetricDraft(metricDraft, context);
  const mode = normalized.mode || "reps";

  const nextDraft = {
    ...normalized,
    mode,
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
    mode: nextMode,
  }, context);
}

function createExerciseDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    notes: "",
    measurement: createExerciseMeasurementDraft(),
    muscles: [],
  };
}

function createRoutineStepDraft(kind = "exercise") {
  return {
    id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind,
    exerciseId: "",
    metric: createRoutineMetricDraft({}, kind === "rest" ? "rest" : "exercise"),
  };
}

function createRoutineDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    notes: "",
    steps: [],
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
      summary: muscle.summary || "",
    })) : [],
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
    steps: Array.isArray(routine.steps)
      ? routine.steps.map((step) => ({
          id: step.id || window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          kind: step.kind || "exercise",
          exerciseId: step.exerciseId || step.exercise_id || "",
          metric: normalizeMetricDraftForMode(
            createRoutineMetricDraft(normalizeTrainingPrescription(step.prescription), step.kind === "rest" ? "rest" : "exercise"),
            step.kind === "rest" ? "rest" : "exercise",
          ),
        }))
      : [],
  };
}

function draftMetricToPayload(metricDraft, context = "exercise") {
  if (context === "rest") {
    return normalizeTrainingPrescription({
      restSeconds: metricDraft.restSeconds,
      notes: metricDraft.notes,
    });
  }

  if (context === "exercise") {
    return normalizeTrainingMeasurement({
      mode: metricDraft.mode,
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
    notes: metricDraft.notes,
  });
}

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function createOptionLabel(option) {
  const title = normalizeOptionalText(option?.title || option?.name || "");
  const summary = normalizeOptionalText(option?.summary || "");
  return summary ? `${title} - ${summary}` : title;
}

function normalizePathSearchValue(value) {
  return String(value ?? "")
    .replace(/\\/g, "/")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
    summary: concept.summary || "",
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
  disabled = false,
}) {
  const currentMode = value?.mode || "reps";

  return (
    <div className="trainingPlugin__field trainingPlugin__field--wide">
      <span>{label}</span>
      <div className="trainingPlugin__fieldRow">
        <label className="trainingPlugin__inlineField">
          <span>Unidad de medida</span>
          <select
            value={currentMode}
            onChange={(event) => onChange({ mode: event.target.value })}
            disabled={disabled}
          >
            {TRAINING_METRIC_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="trainingPlugin__state">
        Unidad: {buildTrainingMeasurementUnitSummary(value) || "sin definir"}
      </div>
    </div>
  );
}

function TrainingMetricEditor({
  label,
  value,
  onChange,
  context = "exercise",
  disabled = false,
}) {
  const currentValue = normalizeMetricDraftForMode(value, context);
  const isRest = context === "rest";
  const mode = currentValue.mode || "reps";

  const updateField = (fieldName) => (event) => {
    onChange({
      ...currentValue,
      [fieldName]: event.target.value,
    });
  };

  const updateMode = (event) => {
    onChange(updateMetricDraftMode(currentValue, event.target.value, context));
  };

  return (
    <div className="trainingPlugin__field trainingPlugin__field--wide">
      <span>{label}</span>

      {isRest ? (
        <>
          <div className="trainingPlugin__fieldRow">
            <label className="trainingPlugin__inlineField">
              <span>Descanso</span>
              <input
                type="number"
                min="0"
                value={currentValue.restSeconds}
                onChange={updateField("restSeconds")}
                disabled={disabled}
                placeholder="90"
              />
            </label>
          </div>

          <label className="trainingPlugin__field trainingPlugin__field--wide">
            <span>Notas</span>
            <textarea
              value={currentValue.notes}
              onChange={updateField("notes")}
              disabled={disabled}
              placeholder="Detalle del descanso."
            />
          </label>
        </>
      ) : (
        <>
          <div className="trainingPlugin__fieldRow">
            <label className="trainingPlugin__inlineField">
              <span>Modo</span>
              <select value={mode} onChange={updateMode} disabled={disabled}>
                {TRAINING_METRIC_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {mode === "reps" ? (
              <label className="trainingPlugin__inlineField">
                <span>Reps</span>
                <input
                  type="number"
                  min="0"
                  value={currentValue.reps}
                  onChange={updateField("reps")}
                  disabled={disabled}
                  placeholder="8"
                />
              </label>
            ) : null}

            {mode === "time" ? (
              <label className="trainingPlugin__inlineField">
                <span>Segundos</span>
                <input
                  type="number"
                  min="0"
                  value={currentValue.seconds}
                  onChange={updateField("seconds")}
                  disabled={disabled}
                  placeholder="45"
                />
              </label>
            ) : null}

            {mode === "distance" ? (
              <label className="trainingPlugin__inlineField">
                <span>Distancia</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentValue.distance}
                  onChange={updateField("distance")}
                  disabled={disabled}
                  placeholder="1.5"
                />
              </label>
            ) : null}

            {mode === "weight" ? (
              <label className="trainingPlugin__inlineField">
                <span>Peso</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentValue.weight}
                  onChange={updateField("weight")}
                  disabled={disabled}
                  placeholder="20"
                />
              </label>
            ) : null}
          </div>

          {mode === "distance" ? (
            <div className="trainingPlugin__fieldRow">
              <label className="trainingPlugin__inlineField">
                <span>Unidad distancia</span>
                <input
                  type="text"
                  value={currentValue.distanceUnit}
                  onChange={updateField("distanceUnit")}
                  disabled={disabled}
                  placeholder="m"
                />
              </label>

              <label className="trainingPlugin__inlineField">
                <span>Tempo</span>
                <input
                  type="text"
                  value={currentValue.tempo}
                  onChange={updateField("tempo")}
                  disabled={disabled}
                  placeholder="3-1-1"
                />
              </label>
            </div>
          ) : null}

          {mode === "weight" ? (
            <div className="trainingPlugin__fieldRow">
              <label className="trainingPlugin__inlineField">
                <span>Unidad peso</span>
                <input
                  type="text"
                  value={currentValue.weightUnit}
                  onChange={updateField("weightUnit")}
                  disabled={disabled}
                  placeholder="kg"
                />
              </label>

              <label className="trainingPlugin__inlineField">
                <span>Tempo</span>
                <input
                  type="text"
                  value={currentValue.tempo}
                  onChange={updateField("tempo")}
                  disabled={disabled}
                  placeholder="3-1-1"
                />
              </label>
            </div>
          ) : null}

          {mode === "reps" ? (
            <div className="trainingPlugin__fieldRow">
              <label className="trainingPlugin__inlineField">
                <span>Peso</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentValue.weight}
                  onChange={updateField("weight")}
                  disabled={disabled}
                  placeholder="20"
                />
              </label>

              <label className="trainingPlugin__inlineField">
                <span>Unidad peso</span>
                <input
                  type="text"
                  value={currentValue.weightUnit}
                  onChange={updateField("weightUnit")}
                  disabled={disabled}
                  placeholder="kg"
                />
              </label>

              <label className="trainingPlugin__inlineField">
                <span>Tempo</span>
                <input
                  type="text"
                  value={currentValue.tempo}
                  onChange={updateField("tempo")}
                  disabled={disabled}
                  placeholder="3-1-1"
                />
              </label>
            </div>
          ) : null}

          {mode === "time" ? (
            <div className="trainingPlugin__fieldRow">
              <label className="trainingPlugin__inlineField">
                <span>Tempo</span>
                <input
                  type="text"
                  value={currentValue.tempo}
                  onChange={updateField("tempo")}
                  disabled={disabled}
                  placeholder="3-1-1"
                />
              </label>
            </div>
          ) : null}

          <label className="trainingPlugin__field trainingPlugin__field--wide">
            <span>Notas</span>
            <textarea
              value={currentValue.notes}
              onChange={updateField("notes")}
              disabled={disabled}
              placeholder="Detalle opcional."
            />
          </label>
        </>
      )}
    </div>
  );
}

function TrainingView() {
  const [mode, setMode] = useState("exercises");
  const [catalog, setCatalog] = useState({
    exercises: [],
    routines: [],
    muscles: [],
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
        muscles,
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
        Array.isArray(routine.steps)
          ? routine.steps.map((step) => step.searchSummary).join(" ")
          : "",
      ].some((value) => isComparableTextMatch(value, normalizedSearch));
    });
  }, [catalog.routines, search]);

  const filteredMuscles = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(muscleSearch);
    const normalizedFolder = normalizePathSearchValue(muscleConceptFolder);

    return catalog.muscles.filter((muscle) => {
      const pathMatches = !normalizedFolder
        || normalizePathSearchValue(muscle.itemPath || muscle.path || muscle.item_path || "").includes(normalizedFolder);

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
        muscle.searchText,
      ].some((value) => isComparableTextMatch(value, normalizedSearch));
    });
  }, [catalog.muscles, muscleSearch, muscleConceptFolder]);

  const selectedExercise = useMemo(
    () => findExerciseById(catalog.exercises, selectedExerciseId),
    [catalog.exercises, selectedExerciseId],
  );
  const selectedRoutine = useMemo(
    () => catalog.routines.find((routine) => routine.id === selectedRoutineId) || null,
    [catalog.routines, selectedRoutineId],
  );

  async function loadLibrary(preferredExerciseId = null, preferredRoutineId = null) {
    setLoading(true);
    setError("");

    try {
      const [library, muscleResponse] = await Promise.all([
        invoke("training:list"),
        invoke("training:list-muscles", { query: "" }),
      ]);

      const nextCatalog = {
        exercises: Array.isArray(library?.exercises) ? library.exercises : [],
        routines: Array.isArray(library?.routines) ? library.routines : [],
        muscles: Array.isArray(muscleResponse?.muscles)
          ? muscleResponse.muscles
          : Array.isArray(library?.muscles)
            ? library.muscles
            : [],
      };

      setCatalog(nextCatalog);

      const nextExerciseId =
        preferredExerciseId ||
        selectedExerciseId ||
        nextCatalog.exercises[0]?.id ||
        null;
      const nextRoutineId =
        preferredRoutineId ||
        selectedRoutineId ||
        nextCatalog.routines[0]?.id ||
        null;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          slug: muscle.slug || null,
        })),
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
            exerciseId: step.kind === "exercise" ? (step.exerciseId || null) : null,
            prescription: draftMetricToPayload(step.metric, step.kind === "rest" ? "rest" : "exercise"),
            exerciseTitleSnapshot: exercise?.title || null,
            exerciseMeasurementSnapshot: exercise?.measurement || null,
          };
        }),
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
        const pathMatches = !normalizedFolder
          || normalizePathSearchValue(muscle.itemPath || muscle.path || muscle.item_path || "").includes(normalizedFolder);

        return titleMatches && pathMatches;
      }) || catalog.muscles.find((muscle) => normalizeSearchValue(muscle.title) === normalizedTitle);

      let concept = existingMuscle ? normalizeConceptRecord(existingMuscle) : null;

      if (!concept) {
        const response = await invoke("concepts:create", {
          title: rawTitle,
          summary: `Musculo: ${rawTitle}`,
          relativeDirectoryPath: muscleConceptFolder,
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
              summary: concept.summary || "",
            },
          ],
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
            summary: muscle.summary || "",
          },
        ],
      };
    });
  }

  function removeMuscleFromExercise(muscleId) {
    setExerciseDraft((current) => ({
      ...current,
      muscles: current.muscles.filter((muscle) => String(muscle.conceptId || muscle.entityRefId) !== String(muscleId)),
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
      steps: [...current.steps, createRoutineStepDraft(kind)],
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
              currentMetric.notes,
            ].some(Boolean);

            if (isEmptyMetric) {
              nextStep.metric = {
                ...normalizeMetricDraftForMode(createRoutineMetricDraft(metric, "exercise"), "exercise"),
                notes: metric.notes || "",
              };
            }
          }
        }

        if (updates.kind === "rest") {
          nextStep.exerciseId = "";
        }

        return nextStep;
      }),
    }));
  }

  function removeRoutineStep(stepId) {
    setRoutineDraft((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== stepId),
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
        steps: nextSteps,
      };
    });
  }

  const selectedExerciseMuscleIds = new Set(
    (exerciseDraft.muscles || []).map((muscle) => String(muscle.conceptId || muscle.entityRefId)),
  );

  return (
    <WorkspacePage className="trainingPlugin">
      <WorkspaceTopbar>
        <WorkspaceTitle
          eyebrow="Plugin training"
          title="Entrenamientos"
          description="Ejercicios, rutinas y musculos enlazados con una UI mas humana y menos expuesta a detalles internos."
        />

        <ToolbarActions>
          <SegmentedControl
            ariaLabel="Modo de entrenamientos"
            options={[
              { value: "exercises", label: "Ejercicios" },
              { value: "routines", label: "Rutinas" },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Button type="button" onClick={() => loadLibrary()}>
            <RefreshIcon size={16} />
            <span>Refrescar</span>
          </Button>
          <Button
            type="button"
            tone="primary"
            onClick={mode === "exercises" ? createExercise : createRoutine}
          >
            <PlusIcon size={16} />
            <span>{mode === "exercises" ? "Nuevo ejercicio" : "Nueva rutina"}</span>
          </Button>
        </ToolbarActions>
      </WorkspaceTopbar>

      <WorkspaceBody className="trainingPlugin__body">
        <SplitLayout className="trainingPlugin__content" variant="sidebar-detail">
          <SplitSidebar className="trainingPlugin__sidebar">
            <SectionPanel className="trainingPlugin__sidebarPanel">
              <label className="trainingPlugin__searchField">
                <span>Buscar</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={mode === "exercises" ? "Buscar ejercicios" : "Buscar rutinas"}
                />
              </label>

              {mode === "exercises" ? (
                <div className="trainingPlugin__list">
                  <div className="trainingPlugin__listHeader">
                    <div className="trainingPlugin__listHeaderCopy">
                      <strong>Ejercicios</strong>
                      <span>{filteredExercises.length} registros</span>
                    </div>
                  </div>

                  {filteredExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      className={`trainingPlugin__listCard ${selectedExerciseId === exercise.id ? "is-active" : ""}`}
                      onClick={() => {
                        setMode("exercises");
                        setSelectedExerciseId(exercise.id);
                      }}
                    >
                      <span className="trainingPlugin__listCardTitle">{exercise.title}</span>
                      <span className="trainingPlugin__listCardSummary">
                        {exercise.searchSummary || exercise.summary || "Sin unidad definida"}
                      </span>
                    </button>
                  ))}

                  {!filteredExercises.length ? (
                    <StateBlock
                      className="trainingPlugin__empty"
                      centered
                      eyebrow="Sin ejercicios"
                      title="Todavia no hay ejercicios"
                      description="Crea el primero desde el boton superior."
                    />
                  ) : null}
                </div>
              ) : (
                <div className="trainingPlugin__list">
                  <div className="trainingPlugin__listHeader">
                    <div className="trainingPlugin__listHeaderCopy">
                      <strong>Rutinas</strong>
                      <span>{filteredRoutines.length} registros</span>
                    </div>
                  </div>

                  {filteredRoutines.map((routine) => (
                    <button
                      key={routine.id}
                      type="button"
                      className={`trainingPlugin__listCard ${selectedRoutineId === routine.id ? "is-active" : ""}`}
                      onClick={() => {
                        setMode("routines");
                        setSelectedRoutineId(routine.id);
                      }}
                    >
                      <span className="trainingPlugin__listCardTitle">{routine.title}</span>
                      <span className="trainingPlugin__listCardSummary">
                        {routine.searchSummary || routine.summary || "Sin pasos definidos"}
                      </span>
                    </button>
                  ))}

                  {!filteredRoutines.length ? (
                    <StateBlock
                      className="trainingPlugin__empty"
                      centered
                      eyebrow="Sin rutinas"
                      title="Todavia no hay rutinas"
                      description="Crea la primera desde el boton superior."
                    />
                  ) : null}
                </div>
              )}
            </SectionPanel>
          </SplitSidebar>

          <SplitDetail className="trainingPlugin__detail">
            {error ? <Notice tone="danger">{error}</Notice> : null}
            {loading ? (
              <StateBlock
                eyebrow="Cargando"
                title="Estamos leyendo la biblioteca de entrenamientos"
                description="Enseguida veras ejercicios, rutinas y relaciones disponibles."
              />
            ) : null}

            {!loading && mode === "exercises" ? (
              <div className="trainingPlugin__detailStack">
                <SectionPanel className="trainingPlugin__panel trainingPlugin__panel--hero" tone="highlight">
                  <PanelHeader>
                    <PanelTitle
                      eyebrow="Ejercicio"
                      title={selectedExercise?.title || "Nuevo ejercicio"}
                      description={selectedExercise?.searchSummary || selectedExercise?.summary || "Define el movimiento, la unidad y los musculos asociados."}
                    />
                  </PanelHeader>
                </SectionPanel>

                <SectionPanel className="trainingPlugin__panel">
                  <PanelHeader>
                    <PanelTitle title="Resumen del ejercicio" description="Empieza por nombre, descripcion y unidad principal." />
                  </PanelHeader>

                  <div className="trainingPlugin__formGrid">
                    <label className="trainingPlugin__field trainingPlugin__field--wide">
                      <span>Titulo</span>
                      <input
                        type="text"
                        value={exerciseDraft.title}
                        onChange={(event) => setExerciseDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Sentadilla"
                      />
                    </label>

                    <label className="trainingPlugin__field trainingPlugin__field--wide">
                      <span>Resumen</span>
                      <textarea
                        value={exerciseDraft.summary}
                        onChange={(event) => setExerciseDraft((current) => ({ ...current, summary: event.target.value }))}
                        placeholder="Describe el ejercicio en una linea."
                      />
                    </label>

                    <label className="trainingPlugin__field trainingPlugin__field--wide">
                      <span>Notas</span>
                      <textarea
                        value={exerciseDraft.notes}
                        onChange={(event) => setExerciseDraft((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="Indicaciones, tecnica o contexto."
                      />
                    </label>

                    <TrainingMeasurementUnitEditor
                      label="Unidad"
                      value={exerciseDraft.measurement}
                      onChange={(nextMeasurement) =>
                        setExerciseDraft((current) => ({
                          ...current,
                          measurement: createExerciseMeasurementDraft(nextMeasurement),
                        }))
                      }
                    />
                  </div>
                </SectionPanel>

                <SectionPanel className="trainingPlugin__panel">
                  <PanelHeader>
                    <PanelTitle title="Musculos vinculados" description="Relaciona el ejercicio con musculos existentes o crea nuevos si no estan disponibles." />
                  </PanelHeader>

                  <div className="trainingPlugin__field trainingPlugin__field--wide">
                    <div className="trainingPlugin__buttonRow">
                      <input
                        type="text"
                        value={muscleInput}
                        onChange={(event) => setMuscleInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleAddMuscle();
                          }
                        }}
                        placeholder="Biceps braquial"
                      />
                      <Button type="button" onClick={() => void handleAddMuscle()}>
                        Agregar
                      </Button>
                    </div>

                    <div className="trainingPlugin__chipRow">
                      {(exerciseDraft.muscles || []).map((muscle) => (
                        <span key={String(muscle.conceptId || muscle.entityRefId)} className="trainingPlugin__chip">
                          <span className="trainingPlugin__chipLabel">{muscle.title}</span>
                          <button
                            type="button"
                            className="trainingPlugin__chipRemove"
                            onClick={() => removeMuscleFromExercise(muscle.conceptId || muscle.entityRefId)}
                            aria-label={`Quitar ${muscle.title}`}
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>

                    <label className="trainingPlugin__searchField">
                      <span>Conceptos sugeridos</span>
                      <input
                        type="search"
                        value={muscleSearch}
                        onChange={(event) => setMuscleSearch(event.target.value)}
                        placeholder="Filtrar sugerencias"
                      />
                    </label>

                    <div className="trainingPlugin__selectorList">
                      {filteredMuscles.slice(0, 20).map((muscle) => {
                        const muscleId = String(muscle.conceptId || muscle.entityRefId || muscle.id);

                        return (
                          <div key={muscleId} className="trainingPlugin__selectorItem">
                            <div className="trainingPlugin__selectorItemMain">
                              <strong>{muscle.title || createOptionLabel(muscle)}</strong>
                              <span>{muscle.summary || muscle.slug || "Concepto relacionado con este ejercicio."}</span>
                            </div>
                            <Button
                              type="button"
                              className="trainingPlugin__secondaryButton"
                              disabled={selectedExerciseMuscleIds.has(muscleId)}
                              onClick={() => addMuscleFromSelector(muscle)}
                            >
                              {selectedExerciseMuscleIds.has(muscleId) ? "Agregado" : "Vincular"}
                            </Button>
                          </div>
                        );
                      })}
                      {!filteredMuscles.length ? (
                        <StateBlock
                          className="trainingPlugin__state"
                          title="No hay sugerencias para ese filtro"
                          description="Prueba con otro nombre o crea un musculo nuevo."
                        />
                      ) : null}
                    </div>

                    <details className="trainingPlugin__advanced">
                      <summary>Opciones avanzadas</summary>
                      <div className="trainingPlugin__fieldRow">
                        <label className="trainingPlugin__inlineField">
                          <span>Carpeta para nuevos musculos</span>
                          <input
                            type="text"
                            value={muscleConceptFolder}
                            onChange={(event) => setMuscleConceptFolder(event.target.value)}
                            placeholder="Concepts/Muscles"
                          />
                        </label>
                      </div>
                    </details>
                  </div>
                </SectionPanel>

                <div className="trainingPlugin__buttonRow trainingPlugin__buttonRow--actions">
                  <Button type="button" tone="primary" onClick={() => void handleSaveExercise()}>
                    Guardar ejercicio
                  </Button>
                  <Button type="button" onClick={createExercise}>
                    Nuevo
                  </Button>
                  <Button type="button" tone="danger" onClick={() => void handleDeleteExercise()} disabled={!exerciseDraft.id}>
                    <DeleteIcon size={16} />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            ) : null}

            {!loading && mode === "routines" ? (
              <div className="trainingPlugin__detailStack">
                <SectionPanel className="trainingPlugin__panel trainingPlugin__panel--hero" tone="highlight">
                  <PanelHeader>
                    <PanelTitle
                      eyebrow="Rutina"
                      title={selectedRoutine?.title || "Nueva rutina"}
                      description={selectedRoutine?.searchSummary || selectedRoutine?.summary || "Arma una secuencia lineal de ejercicios y descansos."}
                    />
                  </PanelHeader>
                </SectionPanel>

                <SectionPanel className="trainingPlugin__panel">
                  <PanelHeader>
                    <PanelTitle title="Resumen de la rutina" description="Define el nombre y el objetivo antes de bajar al detalle de pasos." />
                  </PanelHeader>

                  <div className="trainingPlugin__formGrid">
                    <label className="trainingPlugin__field trainingPlugin__field--wide">
                      <span>Titulo</span>
                      <input
                        type="text"
                        value={routineDraft.title}
                        onChange={(event) => setRoutineDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Push day"
                      />
                    </label>

                    <label className="trainingPlugin__field trainingPlugin__field--wide">
                      <span>Resumen</span>
                      <textarea
                        value={routineDraft.summary}
                        onChange={(event) => setRoutineDraft((current) => ({ ...current, summary: event.target.value }))}
                        placeholder="Que persigue esta rutina."
                      />
                    </label>

                    <label className="trainingPlugin__field trainingPlugin__field--wide">
                      <span>Notas</span>
                      <textarea
                        value={routineDraft.notes}
                        onChange={(event) => setRoutineDraft((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="Observaciones generales."
                      />
                    </label>
                  </div>
                </SectionPanel>

                <SectionPanel className="trainingPlugin__panel">
                  <PanelHeader>
                    <PanelTitle title="Pasos" description="Alterna ejercicios y descansos en el orden real de la rutina." />
                  </PanelHeader>

                  <div className="trainingPlugin__field trainingPlugin__field--wide">
                    <div className="trainingPlugin__buttonRow">
                      <Button type="button" onClick={() => addRoutineStep("exercise")}>
                        Agregar ejercicio
                      </Button>
                      <Button type="button" onClick={() => addRoutineStep("rest")}>
                        Agregar descanso
                      </Button>
                    </div>

                    <div className="trainingPlugin__steps">
                      {routineDraft.steps.map((step, index) => {
                        const selectedExerciseForStep = step.exerciseId
                          ? findExerciseById(catalog.exercises, step.exerciseId)
                          : null;

                        return (
                          <div key={step.id} className="trainingPlugin__step">
                            <div className="trainingPlugin__stepHeader">
                              <div className="trainingPlugin__stepTitle">
                                <strong>Paso {index + 1}</strong>
                                <span>
                                  {buildTrainingMetricSummary(
                                    draftMetricToPayload(step.metric, step.kind === "rest" ? "rest" : "exercise"),
                                  ) || "Paso sin configurar"}
                                </span>
                              </div>

                              <div className="trainingPlugin__stepActions">
                                <Button
                                  type="button"
                                  className="trainingPlugin__iconButton"
                                  onClick={() => moveRoutineStep(step.id, -1)}
                                  disabled={index === 0}
                                >
                                  <ArrowUpIcon size={16} />
                                </Button>
                                <Button
                                  type="button"
                                  className="trainingPlugin__iconButton"
                                  onClick={() => moveRoutineStep(step.id, 1)}
                                  disabled={index === routineDraft.steps.length - 1}
                                >
                                  <ArrowDownIcon size={16} />
                                </Button>
                                <Button type="button" tone="danger" className="trainingPlugin__iconButton" onClick={() => removeRoutineStep(step.id)}>
                                  <DeleteIcon size={16} />
                                </Button>
                              </div>
                            </div>

                            <div className="trainingPlugin__formGrid">
                              <label className="trainingPlugin__field">
                                <span>Tipo</span>
                                <select
                                  value={step.kind}
                                  onChange={(event) =>
                                    updateRoutineStep(step.id, {
                                      kind: event.target.value === "rest" ? "rest" : "exercise",
                                      metric: event.target.value === "rest"
                                        ? createRoutineMetricDraft(step.metric, "rest")
                                        : normalizeMetricDraftForMode(step.metric, "exercise"),
                                    })
                                  }
                                >
                                  <option value="exercise">Ejercicio</option>
                                  <option value="rest">Descanso</option>
                                </select>
                              </label>

                              {step.kind === "exercise" ? (
                                <>
                                  <label className="trainingPlugin__field">
                                    <span>Ejercicio</span>
                                    <select
                                      value={step.exerciseId}
                                      onChange={(event) => {
                                        const nextExerciseId = event.target.value;
                                        const nextExercise = findExerciseById(catalog.exercises, nextExerciseId);

                                        updateRoutineStep(step.id, {
                                          exerciseId: nextExerciseId,
                                          kind: "exercise",
                                          metric: nextExercise
                                            ? normalizeMetricDraftForMode(
                                                createRoutineMetricDraft(nextExercise.measurement || {}, "exercise"),
                                                "exercise",
                                              )
                                            : normalizeMetricDraftForMode(step.metric, "exercise"),
                                        });
                                      }}
                                    >
                                      <option value="">Selecciona un ejercicio</option>
                                      {catalog.exercises.map((exercise) => (
                                        <option key={exercise.id} value={exercise.id}>
                                          {exercise.title}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <TrainingMetricEditor
                                    label="Prescripción"
                                    context="exercise"
                                    value={step.metric}
                                    onChange={(nextMetric) =>
                                      updateRoutineStep(step.id, {
                                        metric: normalizeMetricDraftForMode(nextMetric, "exercise"),
                                      })
                                    }
                                  />

                                  {selectedExerciseForStep ? (
                                    <StateBlock
                                      className="trainingPlugin__state"
                                      title={`Ejercicio: ${selectedExerciseForStep.title}`}
                                      description={selectedExerciseForStep.searchSummary || "Ejercicio enlazado correctamente."}
                                    />
                                  ) : null}
                                </>
                              ) : (
                                <TrainingMetricEditor
                                  label="Descanso"
                                  context="rest"
                                  value={step.metric}
                                  onChange={(nextMetric) =>
                                    updateRoutineStep(step.id, {
                                      metric: normalizeMetricDraftForMode(nextMetric, "rest"),
                                    })
                                  }
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {!routineDraft.steps.length ? (
                        <StateBlock
                          className="trainingPlugin__empty"
                          centered
                          eyebrow="Sin pasos"
                          title="La rutina todavia no tiene pasos"
                          description="Agrega un ejercicio o un descanso para empezar."
                        />
                      ) : null}
                    </div>
                  </div>
                </SectionPanel>

                <div className="trainingPlugin__buttonRow trainingPlugin__buttonRow--actions">
                  <Button type="button" tone="primary" onClick={() => void handleSaveRoutine()}>
                    Guardar rutina
                  </Button>
                  <Button type="button" onClick={createRoutine}>
                    Nueva
                  </Button>
                  <Button type="button" tone="danger" onClick={() => void handleDeleteRoutine()} disabled={!routineDraft.id}>
                    <DeleteIcon size={16} />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            ) : null}

            {!loading && !catalog.exercises.length && mode === "exercises" ? (
              <StateBlock
                className="trainingPlugin__empty"
                centered
                eyebrow="Sin ejercicios"
                title="Aun no hay ejercicios cargados"
                description="Crea el primero y luego enlaza sus musculos."
              />
            ) : null}

            {!loading && !catalog.routines.length && mode === "routines" ? (
              <StateBlock
                className="trainingPlugin__empty"
                centered
                eyebrow="Sin rutinas"
                title="Aun no hay rutinas cargadas"
                description="Crea la primera y arma sus pasos lineales."
              />
            ) : null}
          </SplitDetail>
        </SplitLayout>
      </WorkspaceBody>
    </WorkspacePage>
  );
}

export default TrainingView;
