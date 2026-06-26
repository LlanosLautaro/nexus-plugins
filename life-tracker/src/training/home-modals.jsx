const React = window.React;

import {
  Button,
  Field,
  FieldGrid,
  Notice,
  PanelHeader,
  PanelTitle,
  SectionPanel,
  SegmentedControl,
  StateBlock,
} from "../../../../nexus-frontend/src/ui/index.js";
import { WEEKDAY_OPTIONS } from "../constants.js";
import {
  buildTrainingMeasurementUnitSummary,
  buildTrainingMetricSummary,
  flattenTrainingStructureSteps,
  normalizeTrainingAssignmentInput,
  normalizeTrainingCompletionMode,
  normalizeTrainingMeasurement,
  normalizeTrainingPrescription,
} from "./training-utils.js";

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

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function createMetricDraft(source = {}, fallbackMode = "reps") {
  const normalized = normalizeTrainingPrescription(source);
  const mode = normalized.mode || fallbackMode || "reps";

  return {
    mode,
    reps: normalized.reps == null ? "" : String(normalized.reps),
    seconds: normalized.seconds == null ? "" : String(normalized.seconds),
    distance: normalized.distance == null ? "" : String(normalized.distance),
    distanceUnit: normalized.distanceUnit || normalized.unit || "m",
    weight: normalized.weight == null ? "" : String(normalized.weight),
    weightUnit: normalized.weightUnit || normalized.unit || "kg",
    tempo: normalized.tempo || "",
    notes: normalized.notes || "",
  };
}

function metricDraftToPayload(draft = {}) {
  return normalizeTrainingPrescription({
    mode: draft.mode,
    reps: draft.reps,
    seconds: draft.seconds,
    distance: draft.distance,
    distanceUnit: draft.distanceUnit,
    weight: draft.weight,
    weightUnit: draft.weightUnit,
    tempo: draft.tempo,
    notes: draft.notes,
  });
}

function hasMeaningfulMetricPayload(payload = {}) {
  return ["reps", "seconds", "distance", "weight", "tempo", "notes"]
    .some((field) => payload?.[field] != null && payload[field] !== "");
}

function findRoutineById(routines = [], routineId = "") {
  return routines.find((entry) => entry.id === routineId) || null;
}

function normalizeWeekdaysSource(source = null) {
  return Array.isArray(source?.scheduleConfigJson?.weekdays)
    ? source.scheduleConfigJson.weekdays
    : [1, 2, 3, 4, 5];
}

export function createRoutineAssignmentDraft(source = null) {
  return {
    id: source?.id || "",
    routineId: source?.routineId || source?.routine?.id || "",
    scheduleType: source?.scheduleType || "daily",
    weekdays: normalizeWeekdaysSource(source),
    startDate: source?.startDate || todayDateValue(),
    endDate: source?.endDate || "",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    status: source?.status === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(source?.completionMode, "yes-no"),
  };
}

function buildExistingResultEntryLookup(item = null) {
  const resultEntries = Array.isArray(item?.resultJson?.entries)
    ? item.resultJson.entries
    : [];
  const lookup = new Map();

  for (const entry of resultEntries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    if (entry.stepId) {
      lookup.set(`step:${entry.stepId}`, entry);
    }
    if (entry.exerciseId) {
      lookup.set(`exercise:${entry.exerciseId}`, entry);
    }
    if (entry.id) {
      lookup.set(`id:${entry.id}`, entry);
    }
  }

  return lookup;
}

function getDetailedStepMode(step = null) {
  const prescription = normalizeTrainingPrescription(step?.prescription || step?.metric || {});
  const measurement = normalizeTrainingMeasurement(
    step?.resolvedExercise?.measurement
      || step?.exerciseMeasurementSnapshot
      || {},
  );

  return prescription.mode || measurement.mode || "reps";
}

export function createRoutineCaptureDraft(item = null) {
  const routine = item?.routine || item?.assignment?.routine || null;
  const structure = Array.isArray(routine?.structure) ? routine.structure : [];
  const existingLookup = buildExistingResultEntryLookup(item);
  const steps = flattenTrainingStructureSteps(structure)
    .filter((entry) => entry?.type === "step")
    .filter((entry) => String(entry?.stepKind || entry?.kind || "exercise").trim().toLowerCase() !== "rest")
    .map((step, index) => {
      const mode = getDetailedStepMode(step);
      const prescription = normalizeTrainingPrescription(step.prescription || step.metric || { mode });
      const measurement = normalizeTrainingMeasurement(
        step?.resolvedExercise?.measurement
          || step?.exerciseMeasurementSnapshot
          || { mode },
      );
      const existingResult = existingLookup.get(`step:${step.id}`)
        || existingLookup.get(`exercise:${step.exerciseId}`)
        || existingLookup.get(`id:${step.id}`)
        || null;
      const existingActual = normalizeTrainingPrescription(existingResult?.actual || {});
      const actualSeed = Object.keys(existingActual).length
        ? existingActual
        : prescription;

      return {
        id: String(step.id || `step-${index + 1}`),
        stepId: step.id || null,
        exerciseId: step.exerciseId || step?.resolvedExercise?.id || null,
        title: step?.resolvedExercise?.title || step.exerciseTitleSnapshot || step.title || `Ejercicio ${index + 1}`,
        blockTitle: step.parentBlockTitle || "",
        blockRepeatCount: Number.isFinite(Number(step.parentBlockRepeatCount))
          ? Number(step.parentBlockRepeatCount)
          : null,
        measurement: {
          ...measurement,
          mode,
        },
        prescription,
        actual: createMetricDraft(actualSeed, mode),
      };
    });

  return {
    itemId: item?.id || "",
    assignmentId: item?.assignmentId || item?.assignment?.id || "",
    occurrenceDate: item?.raw?.occurrenceDate || item?.date || todayDateValue(),
    title: item?.title || routine?.title || "Rutina programada",
    summary: item?.summary || routine?.searchSummary || "",
    status: item?.status || "pending",
    completionMode: normalizeTrainingCompletionMode(item?.completionMode, "detailed"),
    steps,
  };
}

export function serializeRoutineCaptureDraft(draft = null) {
  return {
    mode: "detailed",
    entries: Array.isArray(draft?.steps)
      ? draft.steps
        .map((step) => {
          const actual = metricDraftToPayload(step.actual);
          if (!hasMeaningfulMetricPayload(actual)) {
            return null;
          }

          return {
            id: step.id || null,
            stepId: step.stepId || null,
            exerciseId: step.exerciseId || null,
            title: step.title || "Ejercicio",
            actual,
          };
        })
        .filter(Boolean)
      : [],
  };
}

function TrainingMetricFields({ value, onChange }) {
  const mode = value?.mode || "reps";
  const updateField = (field) => (event) => {
    onChange({
      ...value,
      [field]: event.target.value,
    });
  };

  return (
    <FieldGrid>
      {mode === "time" ? (
        <Field label="Segundos">
          <input type="number" min="0" value={value.seconds} onChange={updateField("seconds")} placeholder="60" />
        </Field>
      ) : null}

      {mode === "distance" ? (
        <>
          <Field label="Distancia">
            <input type="number" min="0" value={value.distance} onChange={updateField("distance")} placeholder="500" />
          </Field>
          <Field label="Unidad">
            <input type="text" value={value.distanceUnit} onChange={updateField("distanceUnit")} placeholder="m" />
          </Field>
        </>
      ) : null}

      {mode === "weight" ? (
        <>
          <Field label="Peso">
            <input type="number" min="0" value={value.weight} onChange={updateField("weight")} placeholder="20" />
          </Field>
          <Field label="Unidad">
            <input type="text" value={value.weightUnit} onChange={updateField("weightUnit")} placeholder="kg" />
          </Field>
        </>
      ) : null}

      {mode === "reps" ? (
        <Field label="Repeticiones">
          <input type="number" min="0" value={value.reps} onChange={updateField("reps")} placeholder="12" />
        </Field>
      ) : null}

      {(mode === "reps" || mode === "weight") ? (
        <Field label="Tempo">
          <input type="text" value={value.tempo} onChange={updateField("tempo")} placeholder="2-0-2" />
        </Field>
      ) : null}

      <Field label="Notas" wide>
        <input type="text" value={value.notes} onChange={updateField("notes")} placeholder="Opcional" />
      </Field>
    </FieldGrid>
  );
}

export function RoutineAssignmentModal({
  draft,
  routines = [],
  loading = false,
  error = "",
  saving = false,
  onChange,
  onToggleWeekday,
  onSave,
  onDelete,
  onCancel,
  onOpenTrainingSection,
}) {
  const selectedRoutine = findRoutineById(routines, draft?.routineId);

  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel lifeTrackerTrainingModal">
      <PanelHeader
        actions={(
          <div className="habitosView__editorActions">
            <Button type="button" tone="primary" disabled={loading || saving} onClick={() => void onSave?.()}>
              Guardar programacion
            </Button>
            {draft?.id ? (
              <Button type="button" tone="danger" disabled={saving} onClick={() => void onDelete?.()}>
                Eliminar
              </Button>
            ) : null}
            <Button type="button" disabled={saving} onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        )}
      >
        <PanelTitle
          title={draft?.id ? "Editar rutina programada" : "Rutina de ejercicios"}
          description="Selecciona una rutina existente y define su calendario."
        />
      </PanelHeader>

      <div className="lifeTrackerTrainingModal__content">
        {error ? <Notice tone="danger">{error}</Notice> : null}

        {loading ? (
          <StateBlock title="Cargando rutinas..." description="Estamos preparando el catalogo de entrenamiento." />
        ) : null}

        {!loading && !routines.length ? (
          <div className="lifeTrackerTrainingModal__emptyState">
            <StateBlock
              title="Primero necesitamos una rutina"
              description="Crea al menos una rutina en Entrenamientos para poder programarla desde Life Tracker."
            />
            <div className="habitosView__editorActions">
              <Button type="button" tone="secondary" onClick={onOpenTrainingSection}>
                Abrir entrenamientos
              </Button>
            </div>
          </div>
        ) : null}

        {!loading && routines.length ? (
          <div className="lifeTrackerTrainingModal__stack">
            <FieldGrid>
              <Field label="Rutina" wide>
                <select value={draft.routineId} onChange={(event) => onChange?.("routineId", event.target.value)}>
                  <option value="">Selecciona una rutina</option>
                  {routines.map((routine) => (
                    <option key={routine.id} value={routine.id}>{routine.title}</option>
                  ))}
                </select>
              </Field>
            </FieldGrid>

            <FieldGrid>
              <Field label="Recurrencia" wide>
                <SegmentedControl
                  ariaLabel="Recurrencia"
                  options={SCHEDULE_TYPE_OPTIONS}
                  value={draft.scheduleType}
                  onChange={(value) => onChange?.("scheduleType", value)}
                />
              </Field>
              <Field label="Completicion" wide>
                <SegmentedControl
                  ariaLabel="Modo de completicion"
                  options={COMPLETION_MODE_OPTIONS}
                  value={draft.completionMode}
                  onChange={(value) => onChange?.("completionMode", value)}
                />
              </Field>
            </FieldGrid>

            {draft.scheduleType === "weekdays" ? (
              <div className="trainingPlugin__weekdayRow lifeTrackerTrainingModal__weekdayRow">
                {WEEKDAY_OPTIONS.map((weekday) => {
                  const active = draft.weekdays.includes(weekday.value);
                  return (
                    <button
                      key={weekday.value}
                      type="button"
                      className={["trainingPlugin__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" ")}
                      onClick={() => onToggleWeekday?.(weekday.value)}
                    >
                      {weekday.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <FieldGrid>
              <Field label="Inicio">
                <input type="date" value={draft.startDate} onChange={(event) => onChange?.("startDate", event.target.value)} />
              </Field>
              <Field label="Fin">
                <input type="date" value={draft.endDate} onChange={(event) => onChange?.("endDate", event.target.value)} />
              </Field>
              <Field label="Hora">
                <input type="time" value={draft.time} onChange={(event) => onChange?.("time", event.target.value)} />
              </Field>
              <Field label="Prioridad">
                <input type="number" min="1" max="100" value={draft.priority} onChange={(event) => onChange?.("priority", event.target.value)} />
              </Field>
              <Field label="Estado">
                <select value={draft.status} onChange={(event) => onChange?.("status", event.target.value)}>
                  {ASSIGNMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
            </FieldGrid>

            <div className="trainingPlugin__mutedBlock">
              {selectedRoutine
                ? selectedRoutine.searchSummary || "Rutina lista para programar."
                : "Selecciona una rutina para continuar."}
            </div>
          </div>
        ) : null}
      </div>
    </SectionPanel>
  );
}

export function normalizeRoutineAssignmentPayload(draft = null) {
  return normalizeTrainingAssignmentInput({
    ...draft,
    scheduleConfigJson: {
      weekdays: draft?.scheduleType === "weekdays" ? draft?.weekdays : [],
    },
  });
}

export function RoutineCaptureModal({
  draft,
  error = "",
  saving = false,
  onChangeStep,
  onSave,
  onClear,
  onCancel,
}) {
  const stepCount = Array.isArray(draft?.steps) ? draft.steps.length : 0;

  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel lifeTrackerTrainingModal">
      <PanelHeader
        actions={(
          <div className="habitosView__editorActions">
            <Button type="button" tone="primary" disabled={!stepCount || saving} onClick={() => void onSave?.()}>
              Guardar resultado
            </Button>
            {draft?.status === "completed" ? (
              <Button type="button" tone="danger" disabled={saving} onClick={() => void onClear?.()}>
                Quitar resultado
              </Button>
            ) : null}
            <Button type="button" disabled={saving} onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        )}
      >
        <PanelTitle
          title={draft?.title || "Rutina detallada"}
          description={draft?.occurrenceDate ? `Captura detallada del ${draft.occurrenceDate}.` : "Carga resultados por ejercicio."}
        />
      </PanelHeader>

      <div className="lifeTrackerTrainingModal__content">
        {error ? <Notice tone="danger">{error}</Notice> : null}

        {draft?.summary ? (
          <div className="trainingPlugin__mutedBlock">
            {draft.summary}
          </div>
        ) : null}

        {!stepCount ? (
          <StateBlock
            title="No hay ejercicios para registrar"
            description="La rutina no tiene pasos de ejercicio disponibles para captura detallada."
          />
        ) : (
          <div className="lifeTrackerTrainingModal__captureList">
            {draft.steps.map((step, index) => {
              const mode = step?.actual?.mode || step?.measurement?.mode || "reps";
              const prescriptionSummary = buildTrainingMetricSummary(step.prescription);
              const measurementSummary = buildTrainingMeasurementUnitSummary(step.measurement) || mode;

              return (
                <section key={step.id || `capture-step-${index + 1}`} className="lifeTrackerTrainingModal__captureCard">
                  <div className="lifeTrackerTrainingModal__captureHeader">
                    <div className="trainingPlugin__sectionIntro trainingPlugin__sectionIntro--compact">
                      <strong>{step.title}</strong>
                      <span>
                        {step.blockTitle
                          ? `${step.blockTitle}${step.blockRepeatCount ? ` x${step.blockRepeatCount}` : ""}`
                          : `Paso ${index + 1}`}
                      </span>
                    </div>

                    <div className="lifeTrackerTrainingModal__captureMeta">
                      <span>{measurementSummary}</span>
                      {prescriptionSummary ? <span>{prescriptionSummary}</span> : null}
                    </div>
                  </div>

                  <TrainingMetricFields
                    value={step.actual}
                    onChange={(nextValue) => onChangeStep?.(step.id, {
                      ...nextValue,
                      mode,
                    })}
                  />
                </section>
              );
            })}
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
