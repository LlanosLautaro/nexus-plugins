import {
  buildTrainingMeasurementUnitSummary,
  buildTrainingMetricSummary,
  buildTrainingRoutineSummary,
  flattenTrainingStructureSteps,
  isComparableTextMatch,
  normalizeOptionalText,
  normalizeTrainingAssignmentInput,
  normalizeTrainingCompletionMode,
  normalizeTrainingMeasurement,
  normalizeTrainingPrescription,
  normalizeTrainingStructure,
} from "./training-utils.js";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  PlusIcon,
  RefreshIcon,
} from "./icons.jsx";
import {
  Button,
  Field,
  FieldGrid,
  IconButton,
  Notice,
  PanelHeader,
  PanelTitle,
  ScrollRegion,
  SectionPanel,
  SegmentedControl,
  SplitDetail,
  SplitLayout,
  SplitSidebar,
  StateBlock,
  ToolbarActions,
  WorkspaceBody,
  WorkspacePage,
  WorkspaceTitle,
  WorkspaceTopbar,
} from "../../../../nexus-frontend/src/ui/index.js";
import { renderMarkdown } from "../../../../nexus-frontend/src/editors/Markdown/markdownRenderer.js";
import { extractMarkdownMetadata } from "../../../../nexus-frontend/src/editors/Markdown/metadata.js";

const LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";

const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");
const React = window.React;
const { useEffect, useMemo, useState } = React;

const TRAINING_METRIC_MODE_OPTIONS = [
  { value: "reps", label: "Repeticiones" },
  { value: "time", label: "Tiempo" },
  { value: "distance", label: "Distancia" },
  { value: "weight", label: "Peso" },
];

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "archived", label: "Archivada" },
];

const COMPLETION_MODE_OPTIONS = [
  { value: "yes-no", label: "Si/No" },
  { value: "detailed", label: "Detallada" },
];

const SCHEDULE_TYPE_OPTIONS = [
  { value: "daily", label: "Diaria" },
  { value: "weekdays", label: "Dias fijos" },
];

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" },
];

function createId(prefix = "training") {
  return window.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeMetricDraftForMode(metricDraft, context = "exercise") {
  const normalized = {
    mode: metricDraft?.mode || "reps",
    reps: metricDraft?.reps ?? "",
    seconds: metricDraft?.seconds ?? "",
    distance: metricDraft?.distance ?? "",
    distanceUnit: metricDraft?.distanceUnit || "m",
    weight: metricDraft?.weight ?? "",
    weightUnit: metricDraft?.weightUnit || "kg",
    tempo: metricDraft?.tempo || "",
    notes: metricDraft?.notes || "",
    restSeconds: metricDraft?.restSeconds ?? "",
  };

  if (context === "rest") {
    return {
      ...normalized,
      mode: "time",
      reps: "",
      seconds: "",
      distance: "",
      distanceUnit: "m",
      weight: "",
      weightUnit: "kg",
      tempo: "",
    };
  }

  if (normalized.mode === "reps") {
    normalized.seconds = "";
    normalized.distance = "";
    normalized.distanceUnit = "m";
  } else if (normalized.mode === "time") {
    normalized.reps = "";
    normalized.distance = "";
    normalized.distanceUnit = "m";
    normalized.weight = "";
  } else if (normalized.mode === "distance") {
    normalized.reps = "";
    normalized.seconds = "";
    normalized.weight = "";
  } else if (normalized.mode === "weight") {
    normalized.reps = "";
    normalized.seconds = "";
    normalized.distance = "";
    normalized.distanceUnit = "m";
  }

  return normalized;
}

function createExerciseMeasurementDraft(measurement = {}) {
  const normalized = normalizeTrainingMeasurement(measurement);
  return {
    mode: normalized.mode || "reps",
  };
}

function createPrescriptionDraft(metric = {}, context = "exercise") {
  const normalized = normalizeTrainingPrescription(metric);
  return normalizeMetricDraftForMode({
    mode: normalized.mode || "reps",
    reps: normalized.reps == null ? "" : String(normalized.reps),
    seconds: normalized.seconds == null ? "" : String(normalized.seconds),
    distance: normalized.distance == null ? "" : String(normalized.distance),
    distanceUnit: normalized.distanceUnit || normalized.unit || "m",
    weight: normalized.weight == null ? "" : String(normalized.weight),
    weightUnit: normalized.weightUnit || normalized.unit || "kg",
    tempo: normalized.tempo || "",
    notes: normalized.notes || "",
    restSeconds: normalized.restSeconds == null ? "" : String(normalized.restSeconds),
  }, context);
}

function draftMetricToPayload(metricDraft, context = "exercise") {
  if (context === "measurement") {
    return normalizeTrainingMeasurement({
      mode: metricDraft?.mode || "reps",
    });
  }

  if (context === "rest") {
    return normalizeTrainingPrescription({
      restSeconds: metricDraft?.restSeconds,
      notes: metricDraft?.notes,
    });
  }

  return normalizeTrainingPrescription({
    mode: metricDraft?.mode,
    reps: metricDraft?.reps,
    seconds: metricDraft?.seconds,
    distance: metricDraft?.distance,
    distanceUnit: metricDraft?.distanceUnit,
    weight: metricDraft?.weight,
    weightUnit: metricDraft?.weightUnit,
    tempo: metricDraft?.tempo,
    notes: metricDraft?.notes,
  });
}

function createExerciseDraft() {
  return {
    id: null,
    title: "",
    measurement: createExerciseMeasurementDraft(),
    muscleLoads: [],
    legacyWarnings: [],
  };
}

function createStructureStepDraft(kind = "exercise") {
  return {
    id: createId("step"),
    type: "step",
    stepKind: kind === "rest" ? "rest" : "exercise",
    exerciseId: "",
    metric: createPrescriptionDraft({}, kind === "rest" ? "rest" : "exercise"),
  };
}

function createStructureBlockDraft() {
  return {
    id: createId("block"),
    type: "block",
    title: "",
    repeatCount: "2",
    steps: [
      createStructureStepDraft("exercise"),
    ],
  };
}

function createRoutineDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    structure: [],
  };
}

function createAssignmentDraft(source = null) {
  return {
    id: source?.id || null,
    routineId: source?.routineId || source?.routine?.id || "",
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays) ? source.scheduleConfigJson.weekdays : [1, 2, 3, 4, 5],
    startDate: source?.startDate || new Date().toISOString().slice(0, 10),
    endDate: source?.endDate || "",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    status: source?.status || "active",
    completionMode: normalizeTrainingCompletionMode(source?.completionMode, "yes-no"),
  };
}

function exerciseRecordToDraft(exercise) {
  if (!exercise) {
    return createExerciseDraft();
  }

  return {
    id: exercise.id,
    title: exercise.title || "",
    measurement: createExerciseMeasurementDraft(exercise.measurement),
    muscleLoads: Array.isArray(exercise.muscleLoads)
      ? exercise.muscleLoads.map((entry) => ({
          muscleId: entry.muscleId,
          title: entry.title,
          regionId: entry.regionId,
          regionTitle: entry.regionTitle,
          groupId: entry.groupId,
          groupTitle: entry.groupTitle,
          load: Number(entry.load || 5),
        }))
      : [],
    legacyWarnings: Array.isArray(exercise.legacyWarnings) ? exercise.legacyWarnings : [],
  };
}

function structureSegmentToDraft(segment) {
  if (segment?.type === "block") {
    return {
      id: segment.id || createId("block"),
      type: "block",
      title: segment.title || "",
      repeatCount: String(segment.repeatCount || 2),
      steps: Array.isArray(segment.steps) ? segment.steps.map((step) => structureSegmentToDraft(step)) : [],
    };
  }

  return {
    id: segment?.id || createId("step"),
    type: "step",
    stepKind: segment?.stepKind || segment?.kind || "exercise",
    exerciseId: segment?.exerciseId || "",
    metric: createPrescriptionDraft(segment?.prescription || {}, (segment?.stepKind || segment?.kind) === "rest" ? "rest" : "exercise"),
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
    structure: Array.isArray(routine.structure)
      ? routine.structure.map((segment) => structureSegmentToDraft(segment))
      : [],
  };
}

function invoke(channel, payload) {
  return ipcRenderer.invoke(channel, payload).then((response) => {
    if (!response?.ok) {
      throw new Error(response?.error || "No se pudo ejecutar la operacion.");
    }

    return response.data;
  });
}

function readTrainingMarkdownFile(filePath) {
  if (!filePath) {
    return "";
  }

  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error("[training] No se pudo leer la nota asociada:", error);
    return "";
  }
}

async function resolveTrainingDocItem(ctx, doc) {
  if (!doc?.itemId) {
    return null;
  }

  const itemsState = ctx?.getItems?.();
  const ensured = await itemsState?.ensureItemLoaded?.(doc.itemId);
  if (ensured?.item?.id) {
    return ensured.item;
  }

  if (!doc.relativePath) {
    return null;
  }

  const resolved = await ipcRenderer.invoke("items:get-by-relative-path", {
    relativePath: doc.relativePath,
  });

  if (resolved?.id) {
    itemsState?.materializeItems?.([resolved]);
    return resolved;
  }

  return null;
}

async function openTrainingDoc(ctx, doc) {
  if (!ctx?.actions?.openFile) {
    throw new Error("El runtime del plugin no expuso la accion para abrir notas.");
  }

  const item = await resolveTrainingDocItem(ctx, doc);
  if (!item?.id) {
    throw new Error("No se pudo abrir la nota asociada.");
  }

  await ctx.actions.openFile({
    item,
    sourceId: "life-tracker.training.doc",
    reuse: false,
  });
}

function TrainingMarkdownPreview({ filePath }) {
  const source = useMemo(() => readTrainingMarkdownFile(filePath), [filePath]);
  const { body } = useMemo(() => extractMarkdownMetadata(source), [source]);
  const html = useMemo(() => renderMarkdown(body), [body]);

  return (
    <div className="markdown-engine-read markdown-engine-read--compact">
      <div className="markdown-engine-document">
        <article className="markdown-engine-richContent" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

function buildExerciseEditorDescription(exercise) {
  return exercise?.searchSummary || "Define el nombre corto, la unidad base y que musculos trabaja.";
}

function buildRoutineEditorDescription(routine) {
  return routine?.searchSummary || routine?.summary || "Combina pasos y bloques sin salir de una sola rutina.";
}

function findExerciseById(exercises, exerciseId) {
  return exercises.find((exercise) => exercise.id === exerciseId) || null;
}

function findRoutineById(routines, routineId) {
  return routines.find((routine) => routine.id === routineId) || null;
}

function TrainingDocumentCard({
  doc,
  isPersisted = false,
  onOpen,
}) {
  return (
    <SectionPanel className="trainingPlugin__card trainingPlugin__documentCard">
      <PanelHeader
        actions={doc ? (
          <div className="trainingPlugin__documentActions">
            <Button type="button" tone="secondary" onClick={() => void onOpen?.(doc)}>
              Abrir nota
            </Button>
          </div>
        ) : null}
      >
        <PanelTitle
          title="Documento"
          description={doc
            ? "Preview en lectura de la nota de apoyo."
            : isPersisted
              ? "La nota se genera automaticamente en segundo plano."
              : "La nota se crea automaticamente al guardar el ejercicio."}
        />
      </PanelHeader>

      {doc ? (
        <div className="trainingPlugin__documentPreview">
          <TrainingMarkdownPreview filePath={doc.itemPath} />
        </div>
      ) : (
        <div className="trainingPlugin__mutedBlock">
          {isPersisted
            ? "Estamos preparando la nota asociada."
            : "Este ejercicio aun no existe en la biblioteca."}
        </div>
      )}
    </SectionPanel>
  );
}

function StructureSummary({ structure, exercises }) {
  const exerciseLookup = useMemo(
    () => Object.fromEntries((exercises || []).map((exercise) => [exercise.id, exercise])),
    [exercises],
  );
  const summary = buildTrainingRoutineSummary({ structure: normalizeTrainingStructure(structure || []) }, exerciseLookup);
  return <span>{summary || "Sin pasos definidos"}</span>;
}

function TrainingMeasurementUnitEditor({
  value,
  onChange,
}) {
  const currentMode = value?.mode || "reps";

  return (
    <div className="trainingPlugin__measureCard">
      <div className="trainingPlugin__sectionIntro">
        <strong>Unidad base</strong>
        <span>El ejercicio define el tipo de medida. La carga concreta se guarda en la rutina o en la captura diaria.</span>
      </div>

      <Field label="Medida">
        <select value={currentMode} onChange={(event) => onChange({ mode: event.target.value })}>
          {TRAINING_METRIC_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="trainingPlugin__measurePreview">
        <span>Lectura</span>
        <strong>{buildTrainingMeasurementUnitSummary(value) || "Sin definir"}</strong>
      </div>
    </div>
  );
}

function TrainingMetricEditor({
  label,
  value,
  onChange,
  context = "exercise",
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

  return (
    <div className="trainingPlugin__metricEditor">
      <div className="trainingPlugin__sectionIntro">
        <strong>{label}</strong>
        <span>{isRest ? "Descanso de este paso." : "Carga concreta del paso."}</span>
      </div>

      {isRest ? (
        <FieldGrid>
          <Field label="Segundos">
            <input type="number" min="0" value={currentValue.restSeconds} onChange={updateField("restSeconds")} placeholder="90" />
          </Field>
          <Field label="Notas" wide>
            <input type="text" value={currentValue.notes} onChange={updateField("notes")} placeholder="Opcional" />
          </Field>
        </FieldGrid>
      ) : (
        <>
          <FieldGrid>
            <Field label="Modo">
              <select value={mode} onChange={(event) => onChange(normalizeMetricDraftForMode({ ...currentValue, mode: event.target.value }, context))}>
                {TRAINING_METRIC_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            {mode === "reps" ? (
              <Field label="Reps">
                <input type="number" min="0" value={currentValue.reps} onChange={updateField("reps")} placeholder="8" />
              </Field>
            ) : null}

            {mode === "time" ? (
              <Field label="Segundos">
                <input type="number" min="0" value={currentValue.seconds} onChange={updateField("seconds")} placeholder="45" />
              </Field>
            ) : null}

            {mode === "distance" ? (
              <Field label="Distancia">
                <input type="number" min="0" step="0.01" value={currentValue.distance} onChange={updateField("distance")} placeholder="1.5" />
              </Field>
            ) : null}

            {mode === "weight" ? (
              <Field label="Peso">
                <input type="number" min="0" step="0.01" value={currentValue.weight} onChange={updateField("weight")} placeholder="20" />
              </Field>
            ) : null}
          </FieldGrid>

          {(mode === "distance" || mode === "weight" || mode === "reps") ? (
            <FieldGrid>
              {mode === "distance" ? (
                <Field label="Unidad distancia">
                  <input type="text" value={currentValue.distanceUnit} onChange={updateField("distanceUnit")} placeholder="m" />
                </Field>
              ) : null}

              {(mode === "weight" || mode === "reps") ? (
                <Field label="Unidad peso">
                  <input type="text" value={currentValue.weightUnit} onChange={updateField("weightUnit")} placeholder="kg" />
                </Field>
              ) : null}

              <Field label="Tempo" wide>
                <input type="text" value={currentValue.tempo} onChange={updateField("tempo")} placeholder="Opcional" />
              </Field>
            </FieldGrid>
          ) : null}

          <Field label="Notas" wide>
            <input type="text" value={currentValue.notes} onChange={updateField("notes")} placeholder="Opcional" />
          </Field>
        </>
      )}
    </div>
  );
}

function MuscleLoadEditor({
  catalog,
  draft,
  setDraft,
  muscleSearch,
  setMuscleSearch,
  regionFilter,
  setRegionFilter,
  groupFilter,
  setGroupFilter,
  onOpenDoc,
}) {
  const selectedById = new Map((draft.muscleLoads || []).map((entry) => [String(entry.muscleId), entry]));
  const filteredMuscles = useMemo(() => {
    return (catalog.muscles || []).filter((muscle) => {
      if (regionFilter && muscle.regionId !== regionFilter) {
        return false;
      }
      if (groupFilter && muscle.groupId !== groupFilter) {
        return false;
      }
      if (!muscleSearch) {
        return true;
      }
      return isComparableTextMatch(muscle.searchText, muscleSearch);
    });
  }, [catalog.muscles, groupFilter, muscleSearch, regionFilter]);

  function addMuscle(muscle) {
    setDraft((current) => {
      if (current.muscleLoads.some((entry) => entry.muscleId === muscle.id)) {
        return current;
      }

      return {
        ...current,
        muscleLoads: [
          ...current.muscleLoads,
          {
            muscleId: muscle.id,
            title: muscle.title,
            regionId: muscle.regionId,
            regionTitle: muscle.regionTitle,
            groupId: muscle.groupId,
            groupTitle: muscle.groupTitle,
            load: 5,
          },
        ],
      };
    });
  }

  function removeMuscle(muscleId) {
    setDraft((current) => ({
      ...current,
      muscleLoads: current.muscleLoads.filter((entry) => entry.muscleId !== muscleId),
    }));
  }

  function updateLoad(muscleId, nextLoad) {
    setDraft((current) => ({
      ...current,
      muscleLoads: current.muscleLoads.map((entry) => (
        entry.muscleId !== muscleId
          ? entry
          : {
              ...entry,
              load: Math.min(10, Math.max(1, Number(nextLoad) || 1)),
            }
      )),
    }));
  }

  return (
    <SectionPanel className="trainingPlugin__card trainingPlugin__card--aside">
      <PanelHeader>
        <PanelTitle
          title="Musculos"
          description="Seleccion plana, estructura interna anatomica y acceso directo a notas sembradas automaticamente."
        />
      </PanelHeader>

      {draft.legacyWarnings?.length ? (
        <Notice tone="warning">
          {`Quedaron musculos legacy sin mapear: ${draft.legacyWarnings.map((entry) => entry.sourceTitle).join(", ")}.`}
        </Notice>
      ) : null}

      <FieldGrid>
        <Field label="Buscar" wide>
          <input type="search" value={muscleSearch} onChange={(event) => setMuscleSearch(event.target.value)} placeholder="Pecho, trapecio, core..." />
        </Field>
        <Field label="Region">
          <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
            <option value="">Todas</option>
            {(catalog.regions || []).map((region) => (
              <option key={region.id} value={region.id}>{region.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Grupo">
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
            <option value="">Todos</option>
            {(catalog.groups || []).filter((group) => !regionFilter || group.regionId === regionFilter).map((group) => (
              <option key={group.id} value={group.id}>{group.title}</option>
            ))}
          </select>
        </Field>
      </FieldGrid>

      {(draft.muscleLoads || []).length ? (
        <div className="trainingPlugin__chipGrid">
          {draft.muscleLoads.map((entry) => (
            <div key={entry.muscleId} className="trainingPlugin__muscleChip">
              <div className="trainingPlugin__muscleChipCopy">
                <strong>{entry.title}</strong>
                <span>{entry.groupTitle}</span>
              </div>
              <div className="trainingPlugin__muscleChipControls">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={String(entry.load)}
                  onChange={(event) => updateLoad(entry.muscleId, event.target.value)}
                />
                <button type="button" className="trainingPlugin__chipRemove" onClick={() => removeMuscle(entry.muscleId)} aria-label={`Quitar ${entry.title}`}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="trainingPlugin__mutedBlock">Todavia no hay musculos seleccionados.</div>
      )}

      <div className="trainingPlugin__selectorList">
        {filteredMuscles.slice(0, 36).map((muscle) => (
          <div key={muscle.id} className="trainingPlugin__selectorItem">
            <div className="trainingPlugin__selectorItemMain">
              <strong>{muscle.title}</strong>
              <div className="trainingPlugin__selectorItemMeta">
                <span>{`${muscle.regionTitle} / ${muscle.groupTitle}`}</span>
              </div>
              <span>{muscle.regionTitle} · {muscle.groupTitle}</span>
            </div>
            <div className="trainingPlugin__selectorItemActions">
              <Button
                type="button"
                tone={selectedById.has(muscle.id) ? "secondary" : "primary"}
                onClick={() => (selectedById.has(muscle.id) ? removeMuscle(muscle.id) : addMuscle(muscle))}
              >
                {selectedById.has(muscle.id) ? "Quitar" : "Seleccionar"}
              </Button>
              <Button
                type="button"
                tone="secondary"
                disabled={!muscle.doc}
                onClick={() => (muscle.doc ? onOpenDoc?.(muscle.doc) : null)}
              >
                Abrir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function ExerciseEditor(props) {
  const {
    selectedExercise,
    exerciseDraft,
    setExerciseDraft,
    handleSaveExercise,
    handleDeleteExercise,
    handleOpenDoc,
    catalog,
    muscleSearch,
    setMuscleSearch,
    regionFilter,
    setRegionFilter,
    groupFilter,
    setGroupFilter,
  } = props;

  return (
    <div className="trainingPlugin__editor trainingPlugin__editor--exercise">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="primary" onClick={() => void handleSaveExercise()}>
                Guardar ejercicio
              </Button>
              <Button type="button" tone="danger" disabled={!exerciseDraft.id} onClick={() => void handleDeleteExercise()}>
                <DeleteIcon size={16} />
                <span>Eliminar</span>
              </Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Ejercicio"
            title={selectedExercise?.title || "Nuevo ejercicio"}
            description={buildExerciseEditorDescription(selectedExercise)}
          />
        </PanelHeader>
      </SectionPanel>

      <div className="trainingPlugin__exerciseLayout">
        <div className="trainingPlugin__exerciseMain">
          <SectionPanel className="trainingPlugin__card trainingPlugin__card--main">
            <PanelHeader>
              <PanelTitle title="Base" description="Nombre corto y unidad base." />
            </PanelHeader>

            <FieldGrid className="trainingPlugin__singleColumnGrid">
              <Field label="Titulo" wide>
                <input type="text" value={exerciseDraft.title} onChange={(event) => setExerciseDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Nombre del ejercicio" />
              </Field>
            </FieldGrid>

            <TrainingMeasurementUnitEditor
              value={exerciseDraft.measurement}
              onChange={(nextMeasurement) => setExerciseDraft((current) => ({
                ...current,
                measurement: createExerciseMeasurementDraft(nextMeasurement),
              }))}
            />
          </SectionPanel>

          <TrainingDocumentCard
            doc={selectedExercise?.doc || null}
            isPersisted={Boolean(selectedExercise?.id || exerciseDraft.id)}
            onOpen={handleOpenDoc}
          />
        </div>

        <MuscleLoadEditor
          catalog={catalog}
          draft={exerciseDraft}
          setDraft={setExerciseDraft}
          muscleSearch={muscleSearch}
          setMuscleSearch={setMuscleSearch}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          groupFilter={groupFilter}
          setGroupFilter={setGroupFilter}
          onOpenDoc={handleOpenDoc}
        />
      </div>
    </div>
  );
}

function StructureStepCard({
  step,
  exercises,
  onChange,
  onMove,
  onRemove,
}) {
  const selectedExercise = step.exerciseId ? findExerciseById(exercises, step.exerciseId) : null;
  const summary = buildTrainingMetricSummary(draftMetricToPayload(step.metric, step.stepKind === "rest" ? "rest" : "exercise"));

  return (
    <div className="trainingPlugin__stepCard">
      <div className="trainingPlugin__stepHeader">
        <div className="trainingPlugin__stepTitle">
          <strong>{step.stepKind === "rest" ? "Descanso" : selectedExercise?.title || "Paso de ejercicio"}</strong>
          <span>{summary || "Sin carga definida"}</span>
        </div>
        <div className="trainingPlugin__stepActions">
          <IconButton type="button" aria-label="Subir paso" onClick={() => onMove(-1)}>
            <ArrowUpIcon size={14} />
          </IconButton>
          <IconButton type="button" aria-label="Bajar paso" onClick={() => onMove(1)}>
            <ArrowDownIcon size={14} />
          </IconButton>
          <IconButton type="button" tone="danger" aria-label="Quitar paso" onClick={onRemove}>
            <DeleteIcon size={14} />
          </IconButton>
        </div>
      </div>

      <FieldGrid>
        <Field label="Tipo">
          <select
            value={step.stepKind}
            onChange={(event) => onChange({
              ...step,
              stepKind: event.target.value === "rest" ? "rest" : "exercise",
              exerciseId: event.target.value === "rest" ? "" : step.exerciseId,
              metric: createPrescriptionDraft({}, event.target.value === "rest" ? "rest" : "exercise"),
            })}
          >
            <option value="exercise">Ejercicio</option>
            <option value="rest">Descanso</option>
          </select>
        </Field>

        {step.stepKind === "exercise" ? (
          <Field label="Ejercicio" wide>
            <select
              value={step.exerciseId}
              onChange={(event) => {
                const nextExercise = findExerciseById(exercises, event.target.value);
                onChange({
                  ...step,
                  exerciseId: event.target.value,
                  metric: nextExercise
                    ? createPrescriptionDraft(nextExercise.measurement || {}, "exercise")
                    : createPrescriptionDraft({}, "exercise"),
                });
              }}
            >
              <option value="">Selecciona un ejercicio</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>{exercise.title}</option>
              ))}
            </select>
          </Field>
        ) : null}
      </FieldGrid>

      <TrainingMetricEditor
        label={step.stepKind === "rest" ? "Descanso" : "Carga"}
        value={step.metric}
        context={step.stepKind === "rest" ? "rest" : "exercise"}
        onChange={(nextMetric) => onChange({
          ...step,
          metric: normalizeMetricDraftForMode(nextMetric, step.stepKind === "rest" ? "rest" : "exercise"),
        })}
      />
    </div>
  );
}

function StructureBlockCard({
  block,
  exercises,
  onChange,
  onMove,
  onRemove,
}) {
  const blockSummary = buildTrainingRoutineSummary({ structure: [normalizeTrainingStructure([block])[0]] }, Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])));

  function updateStep(stepId, updater) {
    onChange({
      ...block,
      steps: block.steps.map((step) => (step.id === stepId ? updater(step) : step)),
    });
  }

  function moveStep(stepId, direction) {
    const index = block.steps.findIndex((step) => step.id === stepId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= block.steps.length) {
      return;
    }

    const nextSteps = [...block.steps];
    const [moved] = nextSteps.splice(index, 1);
    nextSteps.splice(nextIndex, 0, moved);
    onChange({ ...block, steps: nextSteps });
  }

  return (
    <details className="trainingPlugin__blockCard" open>
      <summary className="trainingPlugin__blockSummary">
        <div className="trainingPlugin__stepTitle">
          <strong>{block.title || "Bloque"}</strong>
          <span>{blockSummary}</span>
        </div>
        <div className="trainingPlugin__stepActions">
          <IconButton type="button" aria-label="Subir bloque" onClick={(event) => { event.preventDefault(); onMove(-1); }}>
            <ArrowUpIcon size={14} />
          </IconButton>
          <IconButton type="button" aria-label="Bajar bloque" onClick={(event) => { event.preventDefault(); onMove(1); }}>
            <ArrowDownIcon size={14} />
          </IconButton>
          <IconButton type="button" tone="danger" aria-label="Quitar bloque" onClick={(event) => { event.preventDefault(); onRemove(); }}>
            <DeleteIcon size={14} />
          </IconButton>
        </div>
      </summary>

      <FieldGrid>
        <Field label="Titulo">
          <input type="text" value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="Superserie, circuito..." />
        </Field>
        <Field label="Repeticiones">
          <input type="number" min="1" value={block.repeatCount} onChange={(event) => onChange({ ...block, repeatCount: event.target.value })} />
        </Field>
      </FieldGrid>

      <div className="trainingPlugin__inlineActions">
        <Button type="button" onClick={() => onChange({ ...block, steps: [...block.steps, createStructureStepDraft("exercise")] })}>
          <PlusIcon size={16} />
          <span>Ejercicio</span>
        </Button>
        <Button type="button" onClick={() => onChange({ ...block, steps: [...block.steps, createStructureStepDraft("rest")] })}>
          <PlusIcon size={16} />
          <span>Descanso</span>
        </Button>
      </div>

      <div className="trainingPlugin__steps">
        {block.steps.map((step) => (
          <StructureStepCard
            key={step.id}
            step={step}
            exercises={exercises}
            onChange={(nextStep) => updateStep(step.id, () => nextStep)}
            onMove={(direction) => moveStep(step.id, direction)}
            onRemove={() => onChange({ ...block, steps: block.steps.filter((entry) => entry.id !== step.id) })}
          />
        ))}
      </div>
    </details>
  );
}

function RoutineEditor({
  selectedRoutine,
  routineDraft,
  setRoutineDraft,
  catalog,
  handleSaveRoutine,
  handleDeleteRoutine,
  openAssignmentFromRoutine,
}) {
  const exerciseLookup = useMemo(
    () => Object.fromEntries((catalog.exercises || []).map((exercise) => [exercise.id, exercise])),
    [catalog.exercises],
  );

  function updateSegment(segmentId, nextSegment) {
    setRoutineDraft((current) => ({
      ...current,
      structure: current.structure.map((segment) => (segment.id === segmentId ? nextSegment : segment)),
    }));
  }

  function moveSegment(segmentId, direction) {
    setRoutineDraft((current) => {
      const index = current.structure.findIndex((segment) => segment.id === segmentId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.structure.length) {
        return current;
      }

      const nextStructure = [...current.structure];
      const [moved] = nextStructure.splice(index, 1);
      nextStructure.splice(nextIndex, 0, moved);
      return { ...current, structure: nextStructure };
    });
  }

  const normalizedStructure = normalizeTrainingStructure(routineDraft.structure || []);
  const routineSummary = buildTrainingRoutineSummary({ structure: normalizedStructure }, exerciseLookup);

  return (
    <div className="trainingPlugin__editor trainingPlugin__editor--routine">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="primary" onClick={() => void handleSaveRoutine()}>
                Guardar rutina
              </Button>
              <Button type="button" onClick={() => openAssignmentFromRoutine(selectedRoutine || { id: routineDraft.id, title: routineDraft.title })} disabled={!routineDraft.id && !routineDraft.title}>
                Asignar rutina
              </Button>
              <Button type="button" tone="danger" disabled={!routineDraft.id} onClick={() => void handleDeleteRoutine()}>
                <DeleteIcon size={16} />
                <span>Eliminar</span>
              </Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Rutina"
            title={selectedRoutine?.title || "Nueva rutina"}
            description={buildRoutineEditorDescription(selectedRoutine)}
          />
        </PanelHeader>
      </SectionPanel>

      <SectionPanel className="trainingPlugin__card trainingPlugin__card--summary">
        <PanelHeader>
          <PanelTitle title="Resumen" description="Nombre breve y lectura compacta." />
        </PanelHeader>
        <FieldGrid className="trainingPlugin__singleColumnGrid">
          <Field label="Titulo" wide>
            <input type="text" value={routineDraft.title} onChange={(event) => setRoutineDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Nombre de la rutina" />
          </Field>
          <Field label="Resumen" wide>
            <input type="text" value={routineDraft.summary} onChange={(event) => setRoutineDraft((current) => ({ ...current, summary: event.target.value }))} placeholder="Contexto breve" />
          </Field>
        </FieldGrid>
        <div className="trainingPlugin__mutedBlock">{routineSummary || "Todavia no hay estructura definida."}</div>
      </SectionPanel>

      <SectionPanel className="trainingPlugin__card trainingPlugin__card--steps">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="primary" onClick={() => setRoutineDraft((current) => ({ ...current, structure: [...current.structure, createStructureStepDraft("exercise")] }))}>
                <PlusIcon size={16} />
                <span>Paso</span>
              </Button>
              <Button type="button" onClick={() => setRoutineDraft((current) => ({ ...current, structure: [...current.structure, createStructureStepDraft("rest")] }))}>
                <PlusIcon size={16} />
                <span>Descanso</span>
              </Button>
              <Button type="button" onClick={() => setRoutineDraft((current) => ({ ...current, structure: [...current.structure, createStructureBlockDraft()] }))}>
                <PlusIcon size={16} />
                <span>Bloque</span>
              </Button>
            </div>
          )}
        >
          <PanelTitle title="Estructura" description="Pasos sueltos o bloques repetibles." />
        </PanelHeader>

        <div className="trainingPlugin__steps">
          {routineDraft.structure.map((segment) => (
            segment.type === "block" ? (
              <StructureBlockCard
                key={segment.id}
                block={segment}
                exercises={catalog.exercises}
                onChange={(nextBlock) => updateSegment(segment.id, nextBlock)}
                onMove={(direction) => moveSegment(segment.id, direction)}
                onRemove={() => setRoutineDraft((current) => ({ ...current, structure: current.structure.filter((entry) => entry.id !== segment.id) }))}
              />
            ) : (
              <StructureStepCard
                key={segment.id}
                step={segment}
                exercises={catalog.exercises}
                onChange={(nextStep) => updateSegment(segment.id, nextStep)}
                onMove={(direction) => moveSegment(segment.id, direction)}
                onRemove={() => setRoutineDraft((current) => ({ ...current, structure: current.structure.filter((entry) => entry.id !== segment.id) }))}
              />
            )
          ))}

          {!routineDraft.structure.length ? (
            <StateBlock
              className="trainingPlugin__empty"
              centered
              eyebrow="Sin estructura"
              title="Agrega pasos o bloques"
              description="La rutina final queda lista para asignarse cuando guardes."
            />
          ) : null}
        </div>
      </SectionPanel>
    </div>
  );
}

function AssignmentEditor({
  selectedAssignment,
  assignmentDraft,
  setAssignmentDraft,
  routines,
  handleSaveAssignment,
  handleDeleteAssignment,
}) {
  const selectedRoutine = findRoutineById(routines, assignmentDraft.routineId);

  return (
    <div className="trainingPlugin__editor trainingPlugin__editor--assignment">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="primary" onClick={() => void handleSaveAssignment()}>
                Guardar programacion
              </Button>
              <Button type="button" tone="danger" disabled={!assignmentDraft.id} onClick={() => void handleDeleteAssignment()}>
                <DeleteIcon size={16} />
                <span>Eliminar</span>
              </Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Programada"
            title={selectedAssignment?.routine?.title || selectedRoutine?.title || "Nueva programacion"}
            description={selectedAssignment?.searchSummary || "Asocia una rutina existente a una recurrencia concreta."}
          />
        </PanelHeader>
      </SectionPanel>

      <SectionPanel className="trainingPlugin__card trainingPlugin__card--summary">
        <PanelHeader>
          <PanelTitle title="Configuracion" description="Rutina, calendario y forma de completar." />
        </PanelHeader>

        <FieldGrid>
          <Field label="Rutina" wide>
            <select value={assignmentDraft.routineId} onChange={(event) => setAssignmentDraft((current) => ({ ...current, routineId: event.target.value }))}>
              <option value="">Selecciona una rutina</option>
              {routines.map((routine) => (
                <option key={routine.id} value={routine.id}>{routine.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Recurrencia">
            <select value={assignmentDraft.scheduleType} onChange={(event) => setAssignmentDraft((current) => ({ ...current, scheduleType: event.target.value }))}>
              {SCHEDULE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Completicion">
            <select value={assignmentDraft.completionMode} onChange={(event) => setAssignmentDraft((current) => ({ ...current, completionMode: event.target.value }))}>
              {COMPLETION_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        {assignmentDraft.scheduleType === "weekdays" ? (
          <div className="trainingPlugin__weekdayRow">
            {WEEKDAY_OPTIONS.map((weekday) => {
              const active = assignmentDraft.weekdays.includes(weekday.value);
              return (
                <button
                  key={weekday.value}
                  type="button"
                  className={["trainingPlugin__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" ")}
                  onClick={() => setAssignmentDraft((current) => ({
                    ...current,
                    weekdays: active
                      ? current.weekdays.filter((entry) => entry !== weekday.value)
                      : [...current.weekdays, weekday.value].sort((left, right) => left - right),
                  }))}
                >
                  {weekday.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <FieldGrid>
          <Field label="Inicio">
            <input type="date" value={assignmentDraft.startDate} onChange={(event) => setAssignmentDraft((current) => ({ ...current, startDate: event.target.value }))} />
          </Field>
          <Field label="Fin">
            <input type="date" value={assignmentDraft.endDate} onChange={(event) => setAssignmentDraft((current) => ({ ...current, endDate: event.target.value }))} />
          </Field>
          <Field label="Hora">
            <input type="time" value={assignmentDraft.time} onChange={(event) => setAssignmentDraft((current) => ({ ...current, time: event.target.value }))} />
          </Field>
          <Field label="Prioridad">
            <input type="number" min="1" max="100" value={assignmentDraft.priority} onChange={(event) => setAssignmentDraft((current) => ({ ...current, priority: event.target.value }))} />
          </Field>
          <Field label="Estado">
            <select value={assignmentDraft.status} onChange={(event) => setAssignmentDraft((current) => ({ ...current, status: event.target.value }))}>
              {ASSIGNMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        <div className="trainingPlugin__mutedBlock">
          {selectedRoutine ? selectedRoutine.searchSummary || "Rutina lista para programar." : "Selecciona una rutina para continuar."}
        </div>
      </SectionPanel>
    </div>
  );
}

function TrainingView({
  ctx,
  shellMode = "standalone",
  showTopbar = true,
}) {
  const isEmbedded = shellMode === "embedded";
  const [mode, setMode] = useState("exercises");
  const [catalog, setCatalog] = useState({
    exercises: [],
    routines: [],
    assignments: [],
    muscles: [],
    regions: [],
    groups: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [muscleSearch, setMuscleSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [exerciseDraft, setExerciseDraft] = useState(createExerciseDraft);
  const [routineDraft, setRoutineDraft] = useState(createRoutineDraft);
  const [assignmentDraft, setAssignmentDraft] = useState(createAssignmentDraft);

  const filteredExercises = useMemo(() => {
    return catalog.exercises.filter((exercise) => isComparableTextMatch(
      [exercise.title, exercise.searchSummary].filter(Boolean).join(" "),
      search,
    ));
  }, [catalog.exercises, search]);

  const filteredRoutines = useMemo(() => {
    return catalog.routines.filter((routine) => isComparableTextMatch(
      [routine.title, routine.summary, routine.searchSummary].filter(Boolean).join(" "),
      search,
    ));
  }, [catalog.routines, search]);

  const filteredAssignments = useMemo(() => {
    return catalog.assignments.filter((assignment) => isComparableTextMatch(
      [assignment.routine?.title, assignment.searchSummary, assignment.status].filter(Boolean).join(" "),
      search,
    ));
  }, [catalog.assignments, search]);

  const selectedExercise = useMemo(
    () => findExerciseById(catalog.exercises, selectedExerciseId),
    [catalog.exercises, selectedExerciseId],
  );
  const selectedRoutine = useMemo(
    () => findRoutineById(catalog.routines, selectedRoutineId),
    [catalog.routines, selectedRoutineId],
  );
  const selectedAssignment = useMemo(
    () => catalog.assignments.find((assignment) => assignment.id === selectedAssignmentId) || null,
    [catalog.assignments, selectedAssignmentId],
  );

  async function loadLibrary(preferred = {}) {
    setLoading(true);
    setError("");

    try {
      const library = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list`);
      const nextCatalog = {
        exercises: Array.isArray(library?.exercises) ? library.exercises : [],
        routines: Array.isArray(library?.routines) ? library.routines : [],
        assignments: Array.isArray(library?.assignments) ? library.assignments : [],
        muscles: Array.isArray(library?.muscles) ? library.muscles : [],
        regions: Array.isArray(library?.regions) ? library.regions : [],
        groups: Array.isArray(library?.groups) ? library.groups : [],
      };
      setCatalog(nextCatalog);
      setSelectedExerciseId(preferred.exerciseId ?? selectedExerciseId ?? nextCatalog.exercises[0]?.id ?? null);
      setSelectedRoutineId(preferred.routineId ?? selectedRoutineId ?? nextCatalog.routines[0]?.id ?? null);
      setSelectedAssignmentId(preferred.assignmentId ?? selectedAssignmentId ?? nextCatalog.assignments[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError?.message || "No se pudo cargar el modulo de entrenamiento.");
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
    const fallbackId = filteredExercises[0]?.id || null;
    const nextSelected = selectedExerciseId && catalog.exercises.some((exercise) => exercise.id === selectedExerciseId)
      ? selectedExerciseId
      : fallbackId;
    if (nextSelected !== selectedExerciseId) {
      setSelectedExerciseId(nextSelected);
      return;
    }

    setExerciseDraft(selectedExercise ? exerciseRecordToDraft(selectedExercise) : createExerciseDraft());
  }, [catalog.exercises, filteredExercises, mode, selectedExercise, selectedExerciseId]);

  useEffect(() => {
    if (mode !== "routines") {
      return;
    }
    const fallbackId = filteredRoutines[0]?.id || null;
    const nextSelected = selectedRoutineId && catalog.routines.some((routine) => routine.id === selectedRoutineId)
      ? selectedRoutineId
      : fallbackId;
    if (nextSelected !== selectedRoutineId) {
      setSelectedRoutineId(nextSelected);
      return;
    }

    setRoutineDraft(selectedRoutine ? routineRecordToDraft(selectedRoutine) : createRoutineDraft());
  }, [catalog.routines, filteredRoutines, mode, selectedRoutine, selectedRoutineId]);

  useEffect(() => {
    if (mode !== "assignments") {
      return;
    }
    const fallbackId = filteredAssignments[0]?.id || null;
    const nextSelected = selectedAssignmentId && catalog.assignments.some((assignment) => assignment.id === selectedAssignmentId)
      ? selectedAssignmentId
      : fallbackId;
    if (nextSelected !== selectedAssignmentId) {
      setSelectedAssignmentId(nextSelected);
      return;
    }

    setAssignmentDraft(selectedAssignment ? createAssignmentDraft(selectedAssignment) : createAssignmentDraft());
  }, [catalog.assignments, filteredAssignments, mode, selectedAssignment, selectedAssignmentId]);

  async function handleSaveExercise() {
    const title = normalizeOptionalText(exerciseDraft.title);
    if (!title) {
      setError("El ejercicio necesita un titulo.");
      return;
    }

    try {
      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-exercise`, {
        id: exerciseDraft.id,
        title,
        measurement: draftMetricToPayload(exerciseDraft.measurement, "measurement"),
        muscleLoads: exerciseDraft.muscleLoads.map((entry) => ({
          muscleId: entry.muscleId,
          load: entry.load,
        })),
      });
      const savedExercise = response?.exercise || null;
      setSelectedExerciseId(savedExercise?.id || null);
      await loadLibrary({
        exerciseId: savedExercise?.id || null,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId,
      });
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar el ejercicio.");
    }
  }

  async function handleDeleteExercise() {
    if (!exerciseDraft.id) {
      return;
    }

    if (!window.confirm(`Borrar el ejercicio "${exerciseDraft.title}"?`)) {
      return;
    }

    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-exercise`, { id: exerciseDraft.id });
      setSelectedExerciseId(null);
      setExerciseDraft(createExerciseDraft());
      await loadLibrary({
        exerciseId: null,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId,
      });
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar el ejercicio.");
    }
  }

  async function handleOpenDoc(doc) {
    try {
      await openTrainingDoc(ctx, doc);
    } catch (openError) {
      setError(openError?.message || "No se pudo abrir la nota asociada.");
    }
  }

  async function handleSaveRoutine() {
    const title = normalizeOptionalText(routineDraft.title);
    if (!title) {
      setError("La rutina necesita un titulo.");
      return;
    }

    try {
      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-routine`, {
        id: routineDraft.id,
        title,
        summary: normalizeOptionalText(routineDraft.summary),
        structure: routineDraft.structure.map((segment) => (
          segment.type === "block"
            ? {
                id: segment.id,
                type: "block",
                title: normalizeOptionalText(segment.title) || "Bloque",
                repeatCount: Number(segment.repeatCount || 1) || 1,
                steps: segment.steps.map((step) => ({
                  id: step.id,
                  type: "step",
                  stepKind: step.stepKind,
                  exerciseId: step.stepKind === "exercise" ? normalizeOptionalText(step.exerciseId) : null,
                  prescription: draftMetricToPayload(step.metric, step.stepKind === "rest" ? "rest" : "exercise"),
                })),
              }
            : {
                id: segment.id,
                type: "step",
                stepKind: segment.stepKind,
                exerciseId: segment.stepKind === "exercise" ? normalizeOptionalText(segment.exerciseId) : null,
                prescription: draftMetricToPayload(segment.metric, segment.stepKind === "rest" ? "rest" : "exercise"),
              }
        )),
      });
      const savedRoutine = response?.routine || null;
      setSelectedRoutineId(savedRoutine?.id || null);
      await loadLibrary({
        exerciseId: selectedExerciseId,
        routineId: savedRoutine?.id || null,
        assignmentId: selectedAssignmentId,
      });
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la rutina.");
    }
  }

  async function handleDeleteRoutine() {
    if (!routineDraft.id) {
      return;
    }

    if (!window.confirm(`Borrar la rutina "${routineDraft.title}"?`)) {
      return;
    }

    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-routine`, { id: routineDraft.id });
      setSelectedRoutineId(null);
      setRoutineDraft(createRoutineDraft());
      await loadLibrary({
        exerciseId: selectedExerciseId,
        routineId: null,
        assignmentId: selectedAssignmentId,
      });
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar la rutina.");
    }
  }

  async function handleSaveAssignment() {
    try {
      const payload = normalizeTrainingAssignmentInput({
        id: assignmentDraft.id,
        routineId: assignmentDraft.routineId,
        scheduleType: assignmentDraft.scheduleType,
        scheduleConfigJson: {
          weekdays: assignmentDraft.weekdays,
        },
        startDate: assignmentDraft.startDate,
        endDate: assignmentDraft.endDate,
        time: assignmentDraft.time,
        priority: assignmentDraft.priority,
        status: assignmentDraft.status,
        completionMode: assignmentDraft.completionMode,
      });

      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-assignment`, {
        id: assignmentDraft.id,
        ...payload,
      });
      const savedAssignment = response?.assignment || null;
      setSelectedAssignmentId(savedAssignment?.id || null);
      await loadLibrary({
        exerciseId: selectedExerciseId,
        routineId: selectedRoutineId,
        assignmentId: savedAssignment?.id || null,
      });
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la rutina programada.");
    }
  }

  async function handleDeleteAssignment() {
    if (!assignmentDraft.id) {
      return;
    }

    if (!window.confirm("Borrar esta rutina programada?")) {
      return;
    }

    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-assignment`, { id: assignmentDraft.id });
      setSelectedAssignmentId(null);
      setAssignmentDraft(createAssignmentDraft());
      await loadLibrary({
        exerciseId: selectedExerciseId,
        routineId: selectedRoutineId,
        assignmentId: null,
      });
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar la rutina programada.");
    }
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

  function createAssignment(prefill = null) {
    setMode("assignments");
    setSelectedAssignmentId(null);
    setAssignmentDraft(createAssignmentDraft(prefill));
  }

  function openAssignmentFromRoutine(routine) {
    createAssignment({
      routineId: routine?.id || "",
    });
  }

  function activateMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  function createItemForMode(targetMode) {
    if (targetMode === "exercises") {
      createExercise();
      return;
    }

    if (targetMode === "routines") {
      createRoutine();
      return;
    }

    createAssignment();
  }

  const currentList = mode === "exercises"
    ? filteredExercises
    : mode === "routines"
      ? filteredRoutines
      : filteredAssignments;
  const modeMeta = {
    exercises: {
      label: "Ejercicios",
      placeholder: "Buscar ejercicios",
      createLabel: "Nuevo ejercicio",
      emptyTitle: "Todavia no hay ejercicios",
    },
    routines: {
      label: "Rutinas",
      placeholder: "Buscar rutinas",
      createLabel: "Nueva rutina",
      emptyTitle: "Todavia no hay rutinas",
    },
    assignments: {
      label: "Programadas",
      placeholder: "Buscar programadas",
      createLabel: "Nueva programada",
      emptyTitle: "Todavia no hay programaciones",
    },
  };
  const currentModeMeta = modeMeta[mode] || modeMeta.exercises;
  const emptyDescription = mode === "assignments" && !catalog.routines.length
    ? "Primero crea una rutina y despues asignala."
    : showTopbar
      ? "Usa la accion principal para crear el primero."
      : "Crea el primero desde este panel.";

  const pageContent = (
    <>
      {showTopbar ? (
        <WorkspaceTopbar>
          <WorkspaceTitle
            eyebrow="Life Tracker"
            title="Entrenamientos"
            description="Catalogo anatomico interno, rutinas con bloques y programacion compacta."
          />

          <ToolbarActions>
            <SegmentedControl
              className="trainingPlugin__modeTabs"
              ariaLabel="Modo de entrenamientos"
              options={[
                { value: "exercises", label: "Ejercicios" },
                { value: "routines", label: "Rutinas" },
                { value: "assignments", label: "Programadas" },
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
              onClick={() => {
                if (mode === "exercises") {
                  createExercise();
                } else if (mode === "routines") {
                  createRoutine();
                } else {
                  createAssignment();
                }
              }}
            >
              <PlusIcon size={16} />
              <span>{mode === "exercises" ? "Nuevo ejercicio" : mode === "routines" ? "Nueva rutina" : "Nueva programacion"}</span>
            </Button>
          </ToolbarActions>
        </WorkspaceTopbar>
      ) : null}

      <WorkspaceBody className="trainingPlugin__body">
        <SplitLayout className="trainingPlugin__content" variant="sidebar-detail">
          <SplitSidebar className="trainingPlugin__sidebar">
            <SectionPanel className="trainingPlugin__sidebarPanel">
              <Field label="Buscar" wide>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={currentModeMeta.placeholder}
                />
              </Field>

              {isEmbedded ? (
                <div className="trainingPlugin__sidebarFolders">
                  <button
                    type="button"
                    className={`trainingPlugin__folderCard ${mode === "exercises" ? "is-active" : ""}`}
                    onClick={() => activateMode("exercises")}
                  >
                    <span className="trainingPlugin__folderEyebrow">Carpeta</span>
                    <strong>Ejercicios</strong>
                    <span>{catalog.exercises.length} registros</span>
                  </button>
                  <button
                    type="button"
                    className={`trainingPlugin__folderCard ${mode === "routines" ? "is-active" : ""}`}
                    onClick={() => activateMode("routines")}
                  >
                    <span className="trainingPlugin__folderEyebrow">Carpeta</span>
                    <strong>Rutinas</strong>
                    <span>{catalog.routines.length} registros</span>
                  </button>
                  <div className="trainingPlugin__folderAux">
                    <button
                      type="button"
                      className={`trainingPlugin__folderLink ${mode === "assignments" ? "is-active" : ""}`}
                      onClick={() => activateMode("assignments")}
                    >
                      <span>Programadas</span>
                      <strong>{catalog.assignments.length}</strong>
                    </button>
                    <button
                      type="button"
                      className="trainingPlugin__folderGhostButton"
                      onClick={() => loadLibrary()}
                    >
                      Refrescar
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="trainingPlugin__list">
                <div className="trainingPlugin__listHeader">
                  <div className="trainingPlugin__listHeaderCopy">
                    <strong>{currentModeMeta.label}</strong>
                    <span>{currentList.length} registros</span>
                  </div>
                  {!showTopbar ? (
                    <button
                      type="button"
                      className="trainingPlugin__listAction"
                      onClick={() => createItemForMode(mode)}
                    >
                      <PlusIcon size={14} />
                      <span>{currentModeMeta.createLabel}</span>
                    </button>
                  ) : null}
                </div>

                {mode === "exercises" ? filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    className={`trainingPlugin__listCard ${selectedExerciseId === exercise.id ? "is-active" : ""}`}
                    onClick={() => {
                      activateMode("exercises");
                      setSelectedExerciseId(exercise.id);
                    }}
                  >
                    <span className="trainingPlugin__listCardTitle">{exercise.title}</span>
                    <span className="trainingPlugin__listCardSummary">{exercise.searchSummary || "Sin unidad definida"}</span>
                  </button>
                )) : null}

                {mode === "routines" ? filteredRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    type="button"
                    className={`trainingPlugin__listCard ${selectedRoutineId === routine.id ? "is-active" : ""}`}
                    onClick={() => {
                      activateMode("routines");
                      setSelectedRoutineId(routine.id);
                    }}
                  >
                    <span className="trainingPlugin__listCardTitle">{routine.title}</span>
                    <span className="trainingPlugin__listCardSummary">{routine.searchSummary || routine.summary || "Sin pasos definidos"}</span>
                  </button>
                )) : null}

                {mode === "assignments" ? filteredAssignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    type="button"
                    className={`trainingPlugin__listCard ${selectedAssignmentId === assignment.id ? "is-active" : ""}`}
                    onClick={() => {
                      activateMode("assignments");
                      setSelectedAssignmentId(assignment.id);
                    }}
                  >
                    <span className="trainingPlugin__listCardTitle">{assignment.routine?.title || "Rutina programada"}</span>
                    <span className="trainingPlugin__listCardSummary">{assignment.searchSummary}</span>
                  </button>
                )) : null}

                {!currentList.length ? (
                  <StateBlock
                    className="trainingPlugin__empty"
                    centered
                    eyebrow="Sin datos"
                    title={currentModeMeta.emptyTitle}
                    description={emptyDescription}
                  />
                ) : null}
              </div>
            </SectionPanel>
          </SplitSidebar>

          <SplitDetail className="trainingPlugin__detail">
            <ScrollRegion className="trainingPlugin__detailScroll">
              {error ? <Notice tone="danger">{error}</Notice> : null}

              {loading ? (
                <StateBlock
                  eyebrow="Cargando"
                  title="Estamos leyendo entrenamiento"
                  description="Enseguida veras ejercicios, rutinas y programaciones."
                />
              ) : null}

              {!loading && mode === "exercises" ? (
                <ExerciseEditor
                  selectedExercise={selectedExercise}
                  exerciseDraft={exerciseDraft}
                  setExerciseDraft={setExerciseDraft}
                  handleSaveExercise={handleSaveExercise}
                  handleDeleteExercise={handleDeleteExercise}
                  handleOpenDoc={handleOpenDoc}
                  catalog={catalog}
                  muscleSearch={muscleSearch}
                  setMuscleSearch={setMuscleSearch}
                  regionFilter={regionFilter}
                  setRegionFilter={setRegionFilter}
                  groupFilter={groupFilter}
                  setGroupFilter={setGroupFilter}
                />
              ) : null}

              {!loading && mode === "routines" ? (
                <RoutineEditor
                  selectedRoutine={selectedRoutine}
                  routineDraft={routineDraft}
                  setRoutineDraft={setRoutineDraft}
                  catalog={catalog}
                  handleSaveRoutine={handleSaveRoutine}
                  handleDeleteRoutine={handleDeleteRoutine}
                  openAssignmentFromRoutine={openAssignmentFromRoutine}
                />
              ) : null}

              {!loading && mode === "assignments" ? (
                <AssignmentEditor
                  selectedAssignment={selectedAssignment}
                  assignmentDraft={assignmentDraft}
                  setAssignmentDraft={setAssignmentDraft}
                  routines={catalog.routines}
                  handleSaveAssignment={handleSaveAssignment}
                  handleDeleteAssignment={handleDeleteAssignment}
                />
              ) : null}
            </ScrollRegion>
          </SplitDetail>
        </SplitLayout>
      </WorkspaceBody>
    </>
  );

  if (isEmbedded) {
    return <div className="trainingPlugin trainingPlugin--embedded">{pageContent}</div>;
  }

  return (
    <WorkspacePage className="trainingPlugin">
      {pageContent}
    </WorkspacePage>
  );
}

export default TrainingView;
