import {
  buildTrainingExerciseTagSummary,
  buildTrainingExerciseTypeSummary,
  buildTrainingExerciseSummary,
  buildTrainingMeasurementCategorySummary,
  buildTrainingMeasurementUnitSummary,
  buildTrainingMetricSummary,
  buildTrainingRoutineSummary,
  buildTrainingRoutineStepSummary,
  buildTrainingStructureSummary,
  flattenTrainingStructureSteps,
  isComparableTextMatch,
  normalizeOptionalText,
  normalizeTrainingAssignmentInput,
  normalizeTrainingCompletionMode,
  normalizeTrainingExerciseTags,
  normalizeTrainingMeasurement,
  normalizeTrainingPrescription,
  normalizeTrainingStructure,
  resolveTrainingExerciseTags,
  TRAINING_EXERCISE_TAG_LABELS,
  TRAINING_EXERCISE_TAG_ORDER,
  TRAINING_EXERCISE_TYPE_LABELS,
  TRAINING_MEASUREMENT_CATEGORY_LABELS,
} from "./training-utils.js";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  ImageIcon,
  PlusIcon,
  RefreshIcon,
} from "./icons.jsx";
import {
  getTrainingCoverValue,
  hasTrainingCoverProperty,
  isTrainingTextEntryElement,
  pasteTrainingCover,
  resolveTrainingCoverImageUrl,
} from "./training-cover.js";
import {
  Button,
  Field,
  FieldGrid,
  CyberIconButton,
  GalleryCard,
  GalleryCardBody,
  GalleryCardMedia,
  GalleryCardMeta,
  GalleryCardTitle,
  GalleryGrid,
  InlineField,
  Notice,
  PanelHeader,
  PanelStack,
  PanelTitle,
  ScrollRegion,
  SearchField,
  Select,
  SectionPanel,
  SplitDetail,
  SplitLayout,
  SplitSidebar,
  StateBlock,
  ToolbarActions,
  WorkspaceBody,
  WorkspacePage,
  WorkspaceTitle,
  WorkspaceTopbar,
} from "@nexus/ui";
let MarkdownLiveEditor;
let MarkdownReadSurface;

export function configureTrainingHostUi(ui) {
  MarkdownLiveEditor = ui.markdown.EmbeddedMarkdownLiveEditor;
  MarkdownReadSurface = ui.markdown.EmbeddedMarkdownReadSurface;
}

const LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";

const ipcRenderer = pluginIpc;
const { pathToFileUrl } = window.nexus.urls;
const React = window.React;
const { useEffect, useMemo, useRef, useState } = React;

const TRAINING_METRIC_MODE_OPTIONS = [
  { value: "reps", label: "Repeticiones" },
  { value: "time", label: "Tiempo" },
  { value: "distance", label: "Distancia" },
  { value: "weight", label: "Peso" },
];

const TRAINING_EXERCISE_TYPE_OPTIONS = Object.entries(TRAINING_EXERCISE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TRAINING_MEASUREMENT_CATEGORY_OPTIONS = Object.entries(TRAINING_MEASUREMENT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TRAINING_EXERCISE_TAG_OPTIONS = TRAINING_EXERCISE_TAG_ORDER.map((value) => ({
  value,
  label: TRAINING_EXERCISE_TAG_LABELS[value],
}));

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
    exerciseType: "exercise",
    measurementCategory: "strength",
    tags: [],
    measurement: createExerciseMeasurementDraft(),
    muscleLoads: [],
    legacyWarnings: [],
    templateKey: null,
    personalDifficultyScore: "",
  };
}

function sumDraftMusclePercentages(muscleLoads = []) {
  return muscleLoads.reduce((sum, entry) => sum + Math.max(0, Number(entry?.percentage || 0)), 0);
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
    exerciseType: exercise.exerciseType || "exercise",
    measurementCategory: exercise.measurementCategory || "strength",
    tags: Array.isArray(exercise.tags) ? [...exercise.tags] : [],
    measurement: createExerciseMeasurementDraft(exercise.measurement),
    muscleLoads: Array.isArray(exercise.muscleLoads)
      ? exercise.muscleLoads.map((entry) => ({
          muscleId: entry.muscleId,
          title: entry.title,
          regionId: entry.regionId,
          regionTitle: entry.regionTitle,
          groupId: entry.groupId,
          groupTitle: entry.groupTitle,
          percentage: Number(entry.percentage || 0),
        }))
      : [],
    legacyWarnings: Array.isArray(exercise.legacyWarnings) ? exercise.legacyWarnings : [],
    templateKey: exercise.templateKey || null,
    personalDifficultyScore: exercise.personalDifficultyScore == null ? "" : String(exercise.personalDifficultyScore),
  };
}

function getExerciseEffectiveTags(exercise) {
  return resolveTrainingExerciseTags(exercise?.tags || [], exercise?.measurementCategory);
}

function buildExerciseTypeAndDifficultyMeta(exercise) {
  const parts = [];
  if (exercise?.exerciseType && exercise.exerciseType !== "exercise") {
    parts.push(buildTrainingExerciseTypeSummary(exercise.exerciseType));
  }
  if (exercise?.personalDifficultyScore != null) {
    parts.push(`Dificultad ${exercise.personalDifficultyScore}`);
  }
  return parts.join(" · ");
}

function buildExerciseTaxonomyMetaItems(exercise) {
  return [
    { label: "Tipo", value: buildTrainingExerciseTypeSummary(exercise?.exerciseType) || "Ejercicio" },
    { label: "Perfil", value: buildTrainingMeasurementCategorySummary(exercise?.measurementCategory) || "Fuerza" },
    {
      label: "Tags",
      value: buildTrainingExerciseTagSummary(exercise?.tags || [], {
        measurementCategory: exercise?.measurementCategory,
      }) || "Sin tags",
    },
  ];
}

function buildMuscleMaxLoadLookup(exercises = []) {
  const nextLookup = new Map();

  for (const exercise of Array.isArray(exercises) ? exercises : []) {
    for (const entry of Array.isArray(exercise?.muscleLoads) ? exercise.muscleLoads : []) {
      const muscleId = normalizeOptionalText(entry?.muscleId);
      const percentage = Math.max(0, Number(entry?.percentage || 0));
      if (!muscleId) {
        continue;
      }

      const currentMax = nextLookup.get(muscleId) || 0;
      if (percentage > currentMax) {
        nextLookup.set(muscleId, percentage);
      }
    }
  }

  return nextLookup;
}

function buildMuscleMaxLoadSummary(muscleId, maxLoadLookup) {
  const maxLoad = Math.max(0, Number(maxLoadLookup?.get?.(muscleId) || 0));
  if (maxLoad <= 0) {
    return "Foco max. sin registro";
  }
  return `Foco max. ${maxLoad}%`;
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

async function readTrainingMarkdownFile(filePath) {
  if (!filePath) {
    return "";
  }

  try {
    return await window.nexus.files.readText(filePath);
  } catch (error) {
    console.error("[training] No se pudo leer la nota asociada:", error);
    return "";
  }
}

function quoteYamlScalar(value) {
  return JSON.stringify(String(value || ""));
}

function buildTrainingMarkdownFrontmatter({
  title,
  summary,
  kind,
}) {
  return [
    "---",
    "nexus:",
    "  defaultView: read",
    "  card:",
    `    title: ${quoteYamlScalar(title)}`,
    `    summary: ${quoteYamlScalar(summary || "")}`,
    "fitness:",
    "  domain: training",
    `  kind: ${kind}`,
    "---",
    "",
  ].join("\n");
}

function buildExerciseMarkdownTemplate({
  title = "Nuevo ejercicio",
  summary = "",
} = {}) {
  const resolvedTitle = normalizeOptionalText(title) || "Nuevo ejercicio";
  const resolvedSummary = normalizeOptionalText(summary)
    || "Describe el patron general, la tecnica y cualquier referencia util para ejecutar este ejercicio.";

  return [
    buildTrainingMarkdownFrontmatter({
      title: resolvedTitle,
      summary: normalizeOptionalText(summary) || "",
      kind: "exercise",
    }),
    `# ${resolvedTitle}`,
    "",
    resolvedSummary,
    "",
    "## Tecnica",
    "",
    "## Videos / embeds",
    "",
    "## Relacionados",
    "",
    "## Notas",
    "",
  ].join("\n");
}

function buildMuscleMarkdownTemplate(muscle) {
  const title = normalizeOptionalText(muscle?.title) || "Musculo";
  const summary = [muscle?.groupTitle, muscle?.regionTitle].filter(Boolean).join(" - ");

  return [
    buildTrainingMarkdownFrontmatter({
      title,
      summary,
      kind: "muscle",
    }),
    `# ${title}`,
    "",
    summary || "Describe la funcion principal de este musculo y como se siente cuando trabaja.",
    "",
    "## Funcion",
    "",
    "## Tecnica / ubicacion",
    "",
    "## Videos / embeds",
    "",
    "## Relacionados",
    "",
    "## Notas",
    "",
  ].join("\n");
}

async function readTrainingDocMarkdown(doc, fallbackContent = "") {
  const source = await readTrainingMarkdownFile(doc?.itemPath);
  return source || fallbackContent;
}

function formatTrainingCount(count, singular, plural = `${singular}s`) {
  const safeCount = Math.max(0, Number(count) || 0);
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
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
  title = "Nota",
  description = "",
  markdown = "",
  mode = "preview",
  editorKey = "",
  onChange = null,
  headerActions = null,
}) {
  return (
    <SectionPanel className="trainingPlugin__card trainingPlugin__documentCard">
      <PanelHeader actions={headerActions}>
        <PanelTitle title={title} description={description} />
      </PanelHeader>

      <div className={["trainingPlugin__documentPreview", mode === "edit" ? "is-edit" : "is-preview"].join(" ")}>
        {mode === "edit" ? (
          <MarkdownLiveEditor
            key={editorKey}
            filePath=""
            value={markdown}
            onChange={(nextMarkdown) => onChange?.(nextMarkdown)}
            persistToDisk={false}
          />
        ) : (
          <MarkdownReadSurface value={markdown} compact />
        )}
      </div>
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

const TRAINING_SECTION_OPTIONS = [
  { value: "exercises", label: "Ejercicios", countKey: "exercises" },
  { value: "muscles", label: "Musculos", countKey: "muscles" },
  { value: "routines", label: "Rutinas", countKey: "routines" },
  { value: "assignments", label: "Programadas", countKey: "assignments" },
];

function TrainingSectionRail({
  mode,
  catalog,
  onChange,
  onRefresh,
  showRefresh = true,
}) {
  return (
    <SectionPanel className="trainingPlugin__railPanel" padding="tight">
      <div className="trainingPlugin__railList">
        {TRAINING_SECTION_OPTIONS.map((option) => {
          const count = Array.isArray(catalog?.[option.countKey]) ? catalog[option.countKey].length : 0;
          return (
            <button
              key={option.value}
              type="button"
              className={["trainingPlugin__railButton", mode === option.value ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => onChange(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      {showRefresh ? (
        <div className="trainingPlugin__railFooter">
          <Button type="button" tone="secondary" onClick={() => void onRefresh?.()}>
            <RefreshIcon size={16} />
            <span>Refrescar</span>
          </Button>
        </div>
      ) : null}
    </SectionPanel>
  );
}

function TrainingGalleryHeader({
  eyebrow = "",
  title,
  countLabel,
  searchValue = "",
  searchPlaceholder = "Buscar",
  onSearchChange,
  actions = null,
  filters = null,
}) {
  return (
    <SectionPanel className="trainingPlugin__galleryHeader" tone="highlight" padding="tight">
      <PanelHeader actions={actions}>
        <PanelTitle eyebrow={eyebrow} title={title} description={countLabel} />
      </PanelHeader>

      <div className="trainingPlugin__galleryToolbar">
        {typeof onSearchChange === "function" ? (
          <InlineField className="trainingPlugin__gallerySearch" label="Buscar" grow>
            <SearchField
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </InlineField>
        ) : null}
        {filters}
      </div>
    </SectionPanel>
  );
}

function TrainingGalleryCard({
  title,
  summary,
  meta = "",
  active = false,
  media = null,
  editMode = false,
  busy = false,
  onClick,
}) {
  return (
    <GalleryCard
      as="button"
      type="button"
      className={["trainingPlugin__galleryCard", active ? "is-active" : ""].filter(Boolean).join(" ")}
      selected={active}
      aria-pressed={editMode ? active : undefined}
      aria-busy={busy || undefined}
      onClick={onClick}
    >
      {media}
      <GalleryCardBody>
        <GalleryCardTitle>{title}</GalleryCardTitle>
        {summary ? <GalleryCardMeta className="trainingPlugin__galleryCardSummary">{summary}</GalleryCardMeta> : null}
        {meta ? <GalleryCardMeta className="trainingPlugin__galleryCardMeta">{meta}</GalleryCardMeta> : null}
      </GalleryCardBody>
    </GalleryCard>
  );
}

function TrainingCoverMedia({ doc, title, editMode = false, selected = false, busy = false }) {
  const coverValue = getTrainingCoverValue(doc);
  const hasCoverProperty = hasTrainingCoverProperty(doc);
  const requestKey = `${doc?.itemId || "missing"}:${coverValue}`;
  const [media, setMedia] = useState({ key: "", source: "", failed: false });

  useEffect(() => {
    let cancelled = false;
    if (!coverValue) {
      setMedia({ key: requestKey, source: "", failed: false });
      return () => { cancelled = true; };
    }

    void resolveTrainingCoverImageUrl(doc, { ipcRenderer, pathToFileUrl })
      .then((source) => {
        if (!cancelled) setMedia({ key: requestKey, source, failed: false });
      })
      .catch(() => {
        if (!cancelled) setMedia({ key: requestKey, source: "", failed: true });
      });
    return () => { cancelled = true; };
  }, [coverValue, doc, requestKey]);

  const hasImage = media.key === requestKey && media.source && !media.failed;
  const editLabel = busy
    ? "Guardando portada..."
    : hasCoverProperty
      ? "Ctrl+V para reemplazar"
      : "Ctrl+V para anadir";

  return (
    <GalleryCardMedia className="trainingPlugin__galleryCardMedia">
      {hasImage ? (
        <img
          alt={`Portada de ${title}`}
          draggable="false"
          src={media.source}
          onError={() => setMedia((current) => ({ ...current, failed: true }))}
        />
      ) : (
        <span className="trainingPlugin__galleryCardMediaPlaceholder" aria-hidden="true">
          <ImageIcon size={24} />
        </span>
      )}
      {editMode && selected ? (
        <span className="trainingPlugin__galleryCardMediaEdit">{editLabel}</span>
      ) : null}
    </GalleryCardMedia>
  );
}

function TrainingMetaPanel({
  title,
  items = [],
  className = "",
}) {
  const visibleItems = items.filter((entry) => normalizeOptionalText(entry?.value));

  return (
    <SectionPanel className={["trainingPlugin__card", "trainingPlugin__metaPanel", className].filter(Boolean).join(" ")}>
      <PanelHeader>
        <PanelTitle title={title} />
      </PanelHeader>

      {visibleItems.length ? (
        <div className="trainingPlugin__metaList">
          {visibleItems.map((entry) => (
            <div key={entry.label} className="trainingPlugin__metaListRow">
              <span>{entry.label}</span>
              <strong>{entry.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="trainingPlugin__mutedBlock">Sin datos.</div>
      )}
    </SectionPanel>
  );
}

function ExercisePreview({
  exercise,
  markdown,
  onBack,
  onEdit,
  onOpenDoc,
}) {
  if (!exercise) {
    return (
      <StateBlock
        eyebrow="Ejercicios"
        title="No encontramos ese ejercicio."
      />
    );
  }

  return (
    <PanelStack className="trainingPlugin__detailStack">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onBack}>Volver</Button>
              {exercise.doc ? (
                <Button type="button" tone="secondary" onClick={() => void onOpenDoc?.(exercise.doc)}>
                  Abrir nota
                </Button>
              ) : null}
              <Button type="button" tone="primary" onClick={onEdit}>Editar</Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Ejercicio"
            title={exercise.title}
            description={buildTrainingExerciseSummary(exercise) || buildExerciseEditorDescription(exercise)}
          />
        </PanelHeader>
      </SectionPanel>

      <div className="trainingPlugin__detailColumns">
        <div className="trainingPlugin__detailMain">
          <TrainingDocumentCard
            title="Nota"
            markdown={markdown}
            mode="preview"
          />
        </div>

        <div className="trainingPlugin__detailAside">
          <TrainingMetaPanel
            title="Taxonomia"
            items={buildExerciseTaxonomyMetaItems(exercise)}
          />

          <TrainingMetaPanel
            title="Medida"
            items={[
              { label: "Unidad", value: buildTrainingMeasurementUnitSummary(exercise.measurement) || "Sin definir" },
              { label: "Dificultad", value: exercise.personalDifficultyScore == null ? "" : String(exercise.personalDifficultyScore) },
            ]}
          />

          <SectionPanel className="trainingPlugin__card trainingPlugin__metaPanel">
            <PanelHeader>
              <PanelTitle title="Musculos" />
            </PanelHeader>

            {Array.isArray(exercise.muscleLoads) && exercise.muscleLoads.length ? (
              <div className="trainingPlugin__chipGrid">
                {exercise.muscleLoads.map((entry) => (
                  <div key={entry.muscleId} className="trainingPlugin__muscleChip is-static">
                    <div className="trainingPlugin__muscleChipCopy">
                      <strong>{entry.title}</strong>
                      <span>{entry.groupTitle}</span>
                    </div>
                    <div className="trainingPlugin__muscleChipControls">
                      <strong>{`${entry.percentage}%`}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="trainingPlugin__mutedBlock">Sin musculos vinculados.</div>
            )}
          </SectionPanel>
        </div>
      </div>
    </PanelStack>
  );
}

function MusclePreview({
  muscle,
  markdown,
  onBack,
  onEdit,
  onOpenDoc,
}) {
  if (!muscle) {
    return (
      <StateBlock
        eyebrow="Musculos"
        title="No encontramos ese musculo."
      />
    );
  }

  return (
    <PanelStack className="trainingPlugin__detailStack">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onBack}>Volver</Button>
              {muscle.doc ? (
                <Button type="button" tone="secondary" onClick={() => void onOpenDoc?.(muscle.doc)}>
                  Abrir nota
                </Button>
              ) : null}
              <Button type="button" tone="primary" onClick={onEdit}>Editar</Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Musculo"
            title={muscle.title}
            description={[muscle.groupTitle, muscle.regionTitle].filter(Boolean).join(" - ")}
          />
        </PanelHeader>
      </SectionPanel>

      <div className="trainingPlugin__detailColumns trainingPlugin__detailColumns--muscle">
        <div className="trainingPlugin__detailMain">
          <TrainingDocumentCard
            title="Nota"
            markdown={markdown}
            mode="preview"
          />
        </div>

        <div className="trainingPlugin__detailAside">
          <TrainingMetaPanel
            title="Catalogo"
            items={[
              { label: "Region", value: muscle.regionTitle },
              { label: "Grupo", value: muscle.groupTitle },
              { label: "Id", value: muscle.id },
            ]}
          />
        </div>
      </div>
    </PanelStack>
  );
}

function RoutinePreview({
  routine,
  exercises,
  onBack,
  onEdit,
  onAssign,
}) {
  const exerciseLookup = useMemo(
    () => Object.fromEntries((exercises || []).map((exercise) => [exercise.id, exercise])),
    [exercises],
  );
  const flattenedSteps = useMemo(
    () => flattenTrainingStructureSteps(normalizeTrainingStructure(routine?.structure || []), { includeBlocks: true }),
    [routine?.structure],
  );

  if (!routine) {
    return (
      <StateBlock
        eyebrow="Rutinas"
        title="No encontramos esa rutina."
      />
    );
  }

  return (
    <PanelStack className="trainingPlugin__detailStack">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onBack}>Volver</Button>
              <Button type="button" tone="secondary" onClick={() => onAssign?.(routine)}>Asignar</Button>
              <Button type="button" tone="primary" onClick={onEdit}>Editar</Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Rutina"
            title={routine.title}
            description={routine.searchSummary || routine.summary || buildTrainingStructureSummary(routine.structure, exerciseLookup)}
          />
        </PanelHeader>
      </SectionPanel>

      <div className="trainingPlugin__detailColumns">
        <div className="trainingPlugin__detailMain">
          <SectionPanel className="trainingPlugin__card">
            <PanelHeader>
              <PanelTitle title="Estructura" description={buildTrainingRoutineSummary(routine, exerciseLookup)} />
            </PanelHeader>

            {flattenedSteps.length ? (
              <div className="trainingPlugin__structurePreview">
                {flattenedSteps.map((entry, index) => (
                  entry.type === "block" ? (
                    <div key={entry.id || `block-${index + 1}`} className="trainingPlugin__structureRow is-block">
                      <strong>{entry.title || `Bloque ${index + 1}`}</strong>
                      <span>{`${entry.repeatCount || 1} vueltas`}</span>
                    </div>
                  ) : (
                    <div key={entry.id || `step-${index + 1}`} className="trainingPlugin__structureRow">
                      <strong>{`${index + 1}. ${buildTrainingRoutineStepSummary(entry, exerciseLookup) || "Paso"}`}</strong>
                      {entry.parentBlockTitle ? (
                        <span>{`${entry.parentBlockTitle} x${entry.parentBlockRepeatCount || 1}`}</span>
                      ) : null}
                    </div>
                  )
                ))}
              </div>
            ) : (
              <StateBlock centered title="Sin estructura" />
            )}
          </SectionPanel>
        </div>

        <div className="trainingPlugin__detailAside">
          <TrainingMetaPanel
            title="Resumen"
            items={[
              { label: "Titulo corto", value: routine.title },
              { label: "Descripcion", value: routine.summary || "" },
            ]}
          />
        </div>
      </div>
    </PanelStack>
  );
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
  const totalPercentage = sumDraftMusclePercentages(draft.muscleLoads || []);
  const remainingPercentage = 100 - totalPercentage;
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

      const currentTotal = sumDraftMusclePercentages(current.muscleLoads || []);
      const defaultPercentage = currentTotal >= 100
        ? 1
        : Math.min(25, Math.max(1, 100 - currentTotal));

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
            percentage: defaultPercentage,
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

  function updatePercentage(muscleId, nextPercentage) {
    setDraft((current) => ({
      ...current,
      muscleLoads: current.muscleLoads.map((entry) => (
        entry.muscleId !== muscleId
          ? entry
          : {
              ...entry,
              percentage: Math.min(100, Math.max(1, Number(nextPercentage) || 1)),
            }
      )),
    }));
  }

  return (
    <SectionPanel className="trainingPlugin__card trainingPlugin__card--aside">
      <PanelHeader>
        <PanelTitle
          title="Musculos"
          
        />
      </PanelHeader>

      {draft.legacyWarnings?.length ? (
        <Notice tone="warning">
          {`Quedaron musculos legacy sin mapear: ${draft.legacyWarnings.map((entry) => entry.sourceTitle).join(", ")}.`}
        </Notice>
      ) : null}

      <div
        className={[
          "trainingPlugin__muscleLoadSummary",
          totalPercentage === 100 ? "is-valid" : "",
          totalPercentage > 100 ? "is-over" : totalPercentage < 100 ? "is-under" : "",
        ].filter(Boolean).join(" ")}
      >
        <strong>{`Total ${totalPercentage}%`}</strong>
        <span>
          {remainingPercentage === 0
            ? "Listo para guardar."
            : remainingPercentage > 0
              ? `Faltan ${remainingPercentage}%.`
              : `Sobran ${Math.abs(remainingPercentage)}%.`}
        </span>
      </div>

      <FieldGrid>
        <Field label="Buscar" wide>
          <SearchField value={muscleSearch} onChange={(event) => setMuscleSearch(event.target.value)} placeholder="Pecho, trapecio, core..." aria-label="Buscar musculos" />
        </Field>
        <Field label="Region">
          <Select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
            <option value="">Todas</option>
            {(catalog.regions || []).map((region) => (
              <option key={region.id} value={region.id}>{region.title}</option>
            ))}
          </Select>
        </Field>
        <Field label="Grupo">
          <Select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
            <option value="">Todos</option>
            {(catalog.groups || []).filter((group) => !regionFilter || group.regionId === regionFilter).map((group) => (
              <option key={group.id} value={group.id}>{group.title}</option>
            ))}
          </Select>
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
                  max="100"
                  value={String(entry.percentage ?? 0)}
                  onChange={(event) => updatePercentage(entry.muscleId, event.target.value)}
                />
                <span className="trainingPlugin__muscleChipSuffix">%</span>
                <button type="button" className="trainingPlugin__chipRemove" onClick={() => removeMuscle(entry.muscleId)} aria-label={`Quitar ${entry.title}`}>
                  x
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
              <span>{muscle.regionTitle} - {muscle.groupTitle}</span>
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
    exerciseMarkdown,
    setExerciseMarkdown,
    editorKey,
    handleSaveExercise,
    handleDeleteExercise,
    handleOpenDoc,
    onCancel,
    catalog,
    muscleSearch,
    setMuscleSearch,
    regionFilter,
    setRegionFilter,
    groupFilter,
    setGroupFilter,
  } = props;
  const effectiveTags = getExerciseEffectiveTags(exerciseDraft);

  function handleExerciseTypeChange(nextType) {
    setExerciseDraft((current) => ({
      ...current,
      exerciseType: nextType || "exercise",
    }));
  }

  function handleMeasurementCategoryChange(nextCategory) {
    setExerciseDraft((current) => ({
      ...current,
      measurementCategory: nextCategory || "strength",
      tags: normalizeTrainingExerciseTags(current.tags || [], {
        measurementCategory: nextCategory || "strength",
      }),
    }));
  }

  function toggleExerciseTag(tagId) {
    if (!tagId || tagId === exerciseDraft.measurementCategory) {
      return;
    }

    setExerciseDraft((current) => {
      const nextTags = Array.isArray(current.tags) && current.tags.includes(tagId)
        ? current.tags.filter((entry) => entry !== tagId)
        : [...(Array.isArray(current.tags) ? current.tags : []), tagId];

      return {
        ...current,
        tags: normalizeTrainingExerciseTags(nextTags, {
          measurementCategory: current.measurementCategory,
        }),
      };
    });
  }

  return (
    <PanelStack className="trainingPlugin__detailStack trainingPlugin__editor trainingPlugin__editor--exercise">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onCancel}>
                {selectedExercise?.id ? "Cancelar" : "Volver"}
              </Button>
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
            description={selectedExercise?.id
              ? buildExerciseEditorDescription(selectedExercise)
              : "Crea el ejercicio, define su taxonomia y prepara la nota antes de persistirla."}
          />
        </PanelHeader>
      </SectionPanel>

      <div className="trainingPlugin__detailColumns">
        <div className="trainingPlugin__detailMain">
          <SectionPanel className="trainingPlugin__card trainingPlugin__card--main">
            <PanelHeader>
              <PanelTitle title="Base" description="Nombre corto, taxonomia, unidad base y dificultad." />
            </PanelHeader>

            <FieldGrid className="trainingPlugin__singleColumnGrid">
              <Field label="Titulo" wide>
                <input type="text" value={exerciseDraft.title} onChange={(event) => setExerciseDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Nombre del ejercicio" />
              </Field>
              <Field label="Tipo">
                <select value={exerciseDraft.exerciseType} onChange={(event) => handleExerciseTypeChange(event.target.value)}>
                  {TRAINING_EXERCISE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Perfil principal">
                <select value={exerciseDraft.measurementCategory} onChange={(event) => handleMeasurementCategoryChange(event.target.value)}>
                  {TRAINING_MEASUREMENT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Dificultad personal" wide>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={exerciseDraft.personalDifficultyScore}
                  onChange={(event) => setExerciseDraft((current) => ({ ...current, personalDifficultyScore: event.target.value }))}
                  placeholder="Opcional, 0 a 100"
                />
              </Field>
              <Field label="Tags" wide>
                <div className="trainingPlugin__tagToggleGrid">
                  {TRAINING_EXERCISE_TAG_OPTIONS.map((option) => {
                    const active = effectiveTags.includes(option.value);
                    const locked = exerciseDraft.measurementCategory === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={[
                          "trainingPlugin__tagToggle",
                          active ? "is-active" : "",
                          locked ? "is-locked" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => toggleExerciseTag(option.value)}
                        disabled={locked}
                        aria-pressed={active}
                      >
                        <span>{option.label}</span>
                        {locked ? <strong>Perfil</strong> : null}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </FieldGrid>

            <div className="trainingPlugin__sectionIntro trainingPlugin__sectionIntro--compact">
              <span>
                {`${buildTrainingMeasurementCategorySummary(exerciseDraft.measurementCategory) || "Fuerza"} tambien se aplica como tag principal.`}
              </span>
              <span>Valor personal opcional. La unidad base del ejercicio sigue definiendose por separado.</span>
            </div>

            <TrainingMeasurementUnitEditor
              value={exerciseDraft.measurement}
              onChange={(nextMeasurement) => setExerciseDraft((current) => ({
                ...current,
                measurement: createExerciseMeasurementDraft(nextMeasurement),
              }))}
            />
          </SectionPanel>

          <TrainingDocumentCard
            title="Nota"
            description={selectedExercise?.id
              ? "Editor embebido"
              : "La nota real del vault se crea cuando guardas el ejercicio."}
            markdown={exerciseMarkdown}
            mode="edit"
            editorKey={editorKey}
            onChange={setExerciseMarkdown}
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
    </PanelStack>
  );
}

function MuscleEditor({
  muscle,
  markdown,
  editorKey,
  onChangeMarkdown,
  onCancel,
  onSave,
  onOpenDoc,
}) {
  return (
    <PanelStack className="trainingPlugin__detailStack trainingPlugin__editor">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onCancel}>Cancelar</Button>
              {muscle?.doc ? (
                <Button type="button" tone="secondary" onClick={() => void onOpenDoc?.(muscle.doc)}>
                  Abrir nota
                </Button>
              ) : null}
              <Button type="button" tone="primary" onClick={() => void onSave?.()}>
                Guardar nota
              </Button>
            </div>
          )}
        >
          <PanelTitle
            eyebrow="Musculo"
            title={muscle?.title || "Musculo"}
            description={[muscle?.groupTitle, muscle?.regionTitle].filter(Boolean).join(" - ")}
          />
        </PanelHeader>
      </SectionPanel>

      <div className="trainingPlugin__detailColumns trainingPlugin__detailColumns--muscle">
        <div className="trainingPlugin__detailMain">
          <TrainingDocumentCard
            title="Nota"
            description="Editor embebido"
            markdown={markdown}
            mode="edit"
            editorKey={editorKey}
            onChange={onChangeMarkdown}
          />
        </div>

        <div className="trainingPlugin__detailAside">
          <TrainingMetaPanel
            title="Catalogo"
            items={[
              { label: "Region", value: muscle?.regionTitle },
              { label: "Grupo", value: muscle?.groupTitle },
              { label: "Id", value: muscle?.id },
            ]}
          />
        </div>
      </div>
    </PanelStack>
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
          <CyberIconButton type="button" aria-label="Subir paso" onClick={() => onMove(-1)}>
            <ArrowUpIcon size={14} />
          </CyberIconButton>
          <CyberIconButton type="button" aria-label="Bajar paso" onClick={() => onMove(1)}>
            <ArrowDownIcon size={14} />
          </CyberIconButton>
          <CyberIconButton type="button" tone="danger" aria-label="Quitar paso" onClick={onRemove}>
            <DeleteIcon size={14} />
          </CyberIconButton>
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
          <CyberIconButton type="button" aria-label="Subir bloque" onClick={(event) => { event.preventDefault(); onMove(-1); }}>
            <ArrowUpIcon size={14} />
          </CyberIconButton>
          <CyberIconButton type="button" aria-label="Bajar bloque" onClick={(event) => { event.preventDefault(); onMove(1); }}>
            <ArrowDownIcon size={14} />
          </CyberIconButton>
          <CyberIconButton type="button" tone="danger" aria-label="Quitar bloque" onClick={(event) => { event.preventDefault(); onRemove(); }}>
            <DeleteIcon size={14} />
          </CyberIconButton>
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
  onCancel,
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
    <PanelStack className="trainingPlugin__detailStack trainingPlugin__editor trainingPlugin__editor--routine">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onCancel}>
                {selectedRoutine?.id ? "Cancelar" : "Volver"}
              </Button>
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
            description={selectedRoutine?.id
              ? buildRoutineEditorDescription(selectedRoutine)
              : "Crea la rutina y define su estructura dentro del mismo detalle."}
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
    </PanelStack>
  );
}

function AssignmentEditor({
  selectedAssignment,
  assignmentDraft,
  setAssignmentDraft,
  routines,
  handleSaveAssignment,
  handleDeleteAssignment,
  onCancel,
}) {
  const selectedRoutine = findRoutineById(routines, assignmentDraft.routineId);

  return (
    <PanelStack className="trainingPlugin__detailStack trainingPlugin__editor trainingPlugin__editor--assignment">
      <SectionPanel className="trainingPlugin__detailHeader" tone="highlight" padding="tight">
        <PanelHeader
          actions={(
            <div className="trainingPlugin__headerActions">
              <Button type="button" tone="secondary" onClick={onCancel}>
                {selectedAssignment?.id ? "Cancelar" : "Volver"}
              </Button>
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
    </PanelStack>
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
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [routineSearch, setRoutineSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [muscleSearch, setMuscleSearch] = useState("");
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState("");
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState("");
  const [exerciseTagFilter, setExerciseTagFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedMuscleId, setSelectedMuscleId] = useState(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [exerciseView, setExerciseView] = useState("gallery");
  const [muscleView, setMuscleView] = useState("gallery");
  const [routineView, setRoutineView] = useState("gallery");
  const [assignmentView, setAssignmentView] = useState("gallery");
  const [exerciseDraft, setExerciseDraft] = useState(createExerciseDraft);
  const [routineDraft, setRoutineDraft] = useState(createRoutineDraft);
  const [assignmentDraft, setAssignmentDraft] = useState(createAssignmentDraft);
  const [exerciseMarkdown, setExerciseMarkdown] = useState(() => buildExerciseMarkdownTemplate());
  const [muscleMarkdown, setMuscleMarkdown] = useState("");
  const [exerciseEditorKey, setExerciseEditorKey] = useState(() => createId("exercise-editor"));
  const [muscleEditorKey, setMuscleEditorKey] = useState(() => createId("muscle-editor"));
  const [muscleCoverEditMode, setMuscleCoverEditMode] = useState(false);
  const [muscleCoverTargetId, setMuscleCoverTargetId] = useState(null);
  const [muscleCoverBusyId, setMuscleCoverBusyId] = useState(null);
  const [muscleCoverNotice, setMuscleCoverNotice] = useState("");
  const exerciseMarkdownLoadIdRef = useRef(0);
  const muscleMarkdownLoadIdRef = useRef(0);

  const filteredExercises = useMemo(() => {
    return catalog.exercises.filter((exercise) => {
      if (exerciseTypeFilter && (exercise.exerciseType || "exercise") !== exerciseTypeFilter) {
        return false;
      }
      if (exerciseCategoryFilter && (exercise.measurementCategory || "strength") !== exerciseCategoryFilter) {
        return false;
      }
      if (exerciseTagFilter && !getExerciseEffectiveTags(exercise).includes(exerciseTagFilter)) {
        return false;
      }
      return isComparableTextMatch(
        [exercise.title, exercise.searchSummary].filter(Boolean).join(" "),
        exerciseSearch,
      );
    });
  }, [catalog.exercises, exerciseCategoryFilter, exerciseSearch, exerciseTagFilter, exerciseTypeFilter]);

  const filteredRoutines = useMemo(() => {
    return catalog.routines.filter((routine) => isComparableTextMatch(
      [routine.title, routine.summary, routine.searchSummary].filter(Boolean).join(" "),
      routineSearch,
    ));
  }, [catalog.routines, routineSearch]);

  const filteredAssignments = useMemo(() => {
    return catalog.assignments.filter((assignment) => isComparableTextMatch(
      [assignment.routine?.title, assignment.searchSummary, assignment.status].filter(Boolean).join(" "),
      assignmentSearch,
    ));
  }, [catalog.assignments, assignmentSearch]);
  const filteredMuscles = useMemo(() => {
    return catalog.muscles.filter((muscle) => {
      if (regionFilter && muscle.regionId !== regionFilter) {
        return false;
      }
      if (groupFilter && muscle.groupId !== groupFilter) {
        return false;
      }
      return isComparableTextMatch(muscle.searchText, muscleSearch);
    });
  }, [catalog.muscles, groupFilter, muscleSearch, regionFilter]);

  const selectedExercise = useMemo(
    () => findExerciseById(catalog.exercises, selectedExerciseId),
    [catalog.exercises, selectedExerciseId],
  );
  const selectedMuscle = useMemo(
    () => catalog.muscles.find((muscle) => muscle.id === selectedMuscleId) || null,
    [catalog.muscles, selectedMuscleId],
  );
  const selectedRoutine = useMemo(
    () => findRoutineById(catalog.routines, selectedRoutineId),
    [catalog.routines, selectedRoutineId],
  );
  const selectedAssignment = useMemo(
    () => catalog.assignments.find((assignment) => assignment.id === selectedAssignmentId) || null,
    [catalog.assignments, selectedAssignmentId],
  );
  const visibleGroupOptions = useMemo(
    () => (catalog.groups || []).filter((group) => !regionFilter || group.regionId === regionFilter),
    [catalog.groups, regionFilter],
  );
  const muscleMaxLoadLookup = useMemo(
    () => buildMuscleMaxLoadLookup(catalog.exercises),
    [catalog.exercises],
  );

  async function loadLibrary(preferred = {}, { silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError("");
    }

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

      const hasOwnPreferred = (key) => Object.prototype.hasOwnProperty.call(preferred, key);
      const nextExerciseId = hasOwnPreferred("exerciseId") ? preferred.exerciseId : selectedExerciseId;
      const nextMuscleId = hasOwnPreferred("muscleId") ? preferred.muscleId : selectedMuscleId;
      const nextRoutineId = hasOwnPreferred("routineId") ? preferred.routineId : selectedRoutineId;
      const nextAssignmentId = hasOwnPreferred("assignmentId") ? preferred.assignmentId : selectedAssignmentId;

      setCatalog(nextCatalog);
      setSelectedExerciseId(nextExerciseId && nextCatalog.exercises.some((exercise) => exercise.id === nextExerciseId) ? nextExerciseId : null);
      setSelectedMuscleId(nextMuscleId && nextCatalog.muscles.some((muscle) => muscle.id === nextMuscleId) ? nextMuscleId : null);
      setSelectedRoutineId(nextRoutineId && nextCatalog.routines.some((routine) => routine.id === nextRoutineId) ? nextRoutineId : null);
      setSelectedAssignmentId(nextAssignmentId && nextCatalog.assignments.some((assignment) => assignment.id === nextAssignmentId) ? nextAssignmentId : null);
      return nextCatalog;
    } catch (loadError) {
      setError(loadError?.message || "No se pudo cargar el modulo de entrenamiento.");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function handlePasteMuscleCover(muscle) {
    if (!muscle?.id || !muscle.doc?.itemId || muscleCoverBusyId) return;

    const hasCurrentCover = hasTrainingCoverProperty(muscle.doc);
    if (
      hasCurrentCover
      && !window.confirm(`Reemplazar la portada de "${muscle.title}"?`)
    ) {
      return;
    }

    setMuscleCoverBusyId(muscle.id);
    setMuscleCoverNotice("");
    setError("");

    try {
      await pasteTrainingCover({
        doc: muscle.doc,
        muscleId: muscle.id,
        ipcRenderer,
        captureImage: (prefix) => window.nexus.clipboard.captureImage(prefix),
      });
      await loadLibrary({ muscleId: selectedMuscleId }, { silent: true });
      setMuscleCoverNotice(`Portada actualizada para ${muscle.title}.`);
    } catch (pasteError) {
      setError(pasteError?.message || "No se pudo guardar la portada del musculo.");
    } finally {
      setMuscleCoverBusyId(null);
    }
  }

  useEffect(() => {
    void loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!muscleCoverEditMode || mode !== "muscles" || muscleView !== "gallery") {
      return undefined;
    }

    const handlePasteShortcut = (event) => {
      if (
        event.defaultPrevented
        || !(event.ctrlKey || event.metaKey)
        || event.altKey
        || String(event.key || "").toLowerCase() !== "v"
        || isTrainingTextEntryElement(event.target)
        || muscleCoverBusyId
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const muscle = catalog.muscles.find((entry) => entry.id === muscleCoverTargetId) || null;
      if (!muscle) {
        setError("Selecciona primero el musculo cuya portada quieres cambiar.");
        return;
      }
      void handlePasteMuscleCover(muscle);
    };

    window.addEventListener("keydown", handlePasteShortcut, true);
    return () => window.removeEventListener("keydown", handlePasteShortcut, true);
    // handlePasteMuscleCover debe leer el catalogo y los hashes vigentes de este render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.muscles, mode, muscleCoverBusyId, muscleCoverEditMode, muscleCoverTargetId, muscleView]);

  useEffect(() => {
    if (selectedExerciseId && !catalog.exercises.some((exercise) => exercise.id === selectedExerciseId)) {
      setSelectedExerciseId(null);
      setExerciseView("gallery");
    }
  }, [catalog.exercises, selectedExerciseId]);

  useEffect(() => {
    if (selectedMuscleId && !catalog.muscles.some((muscle) => muscle.id === selectedMuscleId)) {
      setSelectedMuscleId(null);
      setMuscleView("gallery");
    }
  }, [catalog.muscles, selectedMuscleId]);

  useEffect(() => {
    if (selectedRoutineId && !catalog.routines.some((routine) => routine.id === selectedRoutineId)) {
      setSelectedRoutineId(null);
      setRoutineView("gallery");
    }
  }, [catalog.routines, selectedRoutineId]);

  useEffect(() => {
    if (selectedAssignmentId && !catalog.assignments.some((assignment) => assignment.id === selectedAssignmentId)) {
      setSelectedAssignmentId(null);
      setAssignmentView("gallery");
    }
  }, [catalog.assignments, selectedAssignmentId]);

  async function hydrateExerciseDetail(exercise, nextView = "preview") {
    if (!exercise) {
      setSelectedExerciseId(null);
      setExerciseDraft(createExerciseDraft());
      setExerciseMarkdown(buildExerciseMarkdownTemplate());
      setExerciseView("gallery");
      return;
    }

    setSelectedExerciseId(exercise.id);
    setExerciseDraft(exerciseRecordToDraft(exercise));
    const fallbackMarkdown = buildExerciseMarkdownTemplate({
      title: exercise.title,
      summary: exercise.summary || exercise.searchSummary || "",
    });
    const loadId = exerciseMarkdownLoadIdRef.current + 1;
    exerciseMarkdownLoadIdRef.current = loadId;
    setExerciseMarkdown(fallbackMarkdown);
    setExerciseView(nextView);

    const nextMarkdown = await readTrainingDocMarkdown(
      exercise.doc,
      fallbackMarkdown,
    );

    if (exerciseMarkdownLoadIdRef.current !== loadId) {
      return;
    }

    setExerciseMarkdown(nextMarkdown);
  }

  async function hydrateMuscleDetail(muscle, nextView = "preview") {
    if (!muscle) {
      setSelectedMuscleId(null);
      setMuscleMarkdown("");
      setMuscleView("gallery");
      return;
    }

    setSelectedMuscleId(muscle.id);
    const fallbackMarkdown = buildMuscleMarkdownTemplate(muscle);
    const loadId = muscleMarkdownLoadIdRef.current + 1;
    muscleMarkdownLoadIdRef.current = loadId;
    setMuscleMarkdown(fallbackMarkdown);
    setMuscleView(nextView);

    const nextMarkdown = await readTrainingDocMarkdown(muscle.doc, fallbackMarkdown);

    if (muscleMarkdownLoadIdRef.current !== loadId) {
      return;
    }

    setMuscleMarkdown(nextMarkdown);
  }

  function hydrateRoutineDetail(routine, nextView = "preview") {
    if (!routine) {
      setSelectedRoutineId(null);
      setRoutineDraft(createRoutineDraft());
      setRoutineView("gallery");
      return;
    }

    setSelectedRoutineId(routine.id);
    setRoutineDraft(routineRecordToDraft(routine));
    setRoutineView(nextView);
  }

  function hydrateAssignmentDetail(assignment, nextView = "edit") {
    if (!assignment) {
      setSelectedAssignmentId(null);
      setAssignmentDraft(createAssignmentDraft());
      setAssignmentView("gallery");
      return;
    }

    setSelectedAssignmentId(assignment.id);
    setAssignmentDraft(createAssignmentDraft(assignment));
    setAssignmentView(nextView);
  }

  function openExercisePreviewByRecord(exercise) {
    setMode("exercises");
    setError("");
    void hydrateExerciseDetail(exercise, "preview");
  }

  function openExerciseEditByRecord(exercise) {
    setMode("exercises");
    setError("");
    setExerciseEditorKey(createId("exercise-editor"));
    void hydrateExerciseDetail(exercise, "edit");
  }

  function openMusclePreviewByRecord(muscle) {
    setMode("muscles");
    setMuscleCoverEditMode(false);
    setMuscleCoverTargetId(null);
    setMuscleCoverNotice("");
    setError("");
    void hydrateMuscleDetail(muscle, "preview");
  }

  function openMuscleEditByRecord(muscle) {
    setMode("muscles");
    setError("");
    setMuscleEditorKey(createId("muscle-editor"));
    void hydrateMuscleDetail(muscle, "edit");
  }

  function openRoutinePreviewByRecord(routine) {
    setMode("routines");
    setError("");
    hydrateRoutineDetail(routine, "preview");
  }

  function openRoutineEditByRecord(routine) {
    setMode("routines");
    setError("");
    hydrateRoutineDetail(routine, "edit");
  }

  function openAssignmentEditByRecord(assignment) {
    setMode("assignments");
    setError("");
    hydrateAssignmentDetail(assignment, "edit");
  }

  async function handleSaveExercise() {
    const title = normalizeOptionalText(exerciseDraft.title);
    if (!title) {
      setError("El ejercicio necesita un titulo.");
      return;
    }

    const totalPercentage = sumDraftMusclePercentages(exerciseDraft.muscleLoads || []);
    if (totalPercentage !== 100) {
      setError(`La distribucion muscular debe sumar 100%. Ahora suma ${totalPercentage}%.`);
      return;
    }

    try {
      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-exercise`, {
        id: exerciseDraft.id,
        title,
        exerciseType: exerciseDraft.exerciseType,
        measurementCategory: exerciseDraft.measurementCategory,
        tags: exerciseDraft.tags,
        measurement: draftMetricToPayload(exerciseDraft.measurement, "measurement"),
        muscleLoads: exerciseDraft.muscleLoads.map((entry) => ({
          muscleId: entry.muscleId,
          percentage: entry.percentage,
        })),
        templateKey: exerciseDraft.templateKey,
        personalDifficultyScore: normalizeOptionalText(exerciseDraft.personalDifficultyScore) == null
          ? null
          : Number(exerciseDraft.personalDifficultyScore),
        docMarkdown: exerciseMarkdown,
      });
      const savedExercise = response?.exercise || null;
      const nextCatalog = await loadLibrary({
        exerciseId: savedExercise?.id || null,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId,
      });
      openExercisePreviewByRecord(findExerciseById(nextCatalog?.exercises || [], savedExercise?.id || null));
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
      setExerciseMarkdown(buildExerciseMarkdownTemplate());
      setExerciseView("gallery");
      await loadLibrary({
        exerciseId: null,
        muscleId: selectedMuscleId,
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

  async function handleSaveMuscle() {
    if (!selectedMuscleId) {
      return;
    }

    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-muscle-doc`, {
        muscleId: selectedMuscleId,
        markdown: muscleMarkdown,
      });
      const nextCatalog = await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId,
      });
      openMusclePreviewByRecord((nextCatalog?.muscles || []).find((muscle) => muscle.id === selectedMuscleId) || null);
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la nota del musculo.");
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
      const nextCatalog = await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: savedRoutine?.id || null,
        assignmentId: selectedAssignmentId,
      });
      openRoutinePreviewByRecord(findRoutineById(nextCatalog?.routines || [], savedRoutine?.id || null));
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
      setRoutineView("gallery");
      await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
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
      const nextCatalog = await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: savedAssignment?.id || null,
      });
      openAssignmentEditByRecord(
        (nextCatalog?.assignments || []).find((assignment) => assignment.id === savedAssignment?.id) || null,
      );
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
      setAssignmentView("gallery");
      await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
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
    setExerciseMarkdown(buildExerciseMarkdownTemplate());
    setExerciseEditorKey(createId("exercise-editor"));
    setExerciseView("edit");
    setError("");
  }

  function createRoutine() {
    setMode("routines");
    setSelectedRoutineId(null);
    setRoutineDraft(createRoutineDraft());
    setRoutineView("edit");
    setError("");
  }

  function createAssignment(prefill = null) {
    setMode("assignments");
    setSelectedAssignmentId(null);
    setAssignmentDraft(createAssignmentDraft(prefill));
    setAssignmentView("edit");
    setError("");
  }

  function openAssignmentFromRoutine(routine) {
    createAssignment({
      routineId: routine?.id || "",
    });
  }

  function activateMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMuscleCoverEditMode(false);
    setMuscleCoverTargetId(null);
    setMuscleCoverNotice("");
    if (nextMode === "exercises") {
      setExerciseView("gallery");
    } else if (nextMode === "muscles") {
      setMuscleView("gallery");
    } else if (nextMode === "routines") {
      setRoutineView("gallery");
    } else {
      setAssignmentView("gallery");
    }
  }

  function renderExerciseGallery() {
    return (
      <PanelStack className="trainingPlugin__detailStack">
        <TrainingGalleryHeader
          eyebrow="Entrenamiento"
          title="Ejercicios"
          countLabel={formatTrainingCount(filteredExercises.length, "ejercicio")}
          searchValue={exerciseSearch}
          searchPlaceholder="Buscar ejercicios"
          onSearchChange={setExerciseSearch}
          filters={(
            <>
              <InlineField label="Tipo">
                <select value={exerciseTypeFilter} onChange={(event) => setExerciseTypeFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {TRAINING_EXERCISE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InlineField>
              <InlineField label="Perfil">
                <select value={exerciseCategoryFilter} onChange={(event) => setExerciseCategoryFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {TRAINING_MEASUREMENT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InlineField>
              <InlineField label="Tag">
                <select value={exerciseTagFilter} onChange={(event) => setExerciseTagFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {TRAINING_EXERCISE_TAG_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InlineField>
            </>
          )}
          actions={(
            <Button type="button" tone="primary" onClick={createExercise}>
              <PlusIcon size={16} />
              <span>Nuevo</span>
            </Button>
          )}
        />

        {filteredExercises.length ? (
          <GalleryGrid className="trainingPlugin__galleryGrid">
            {filteredExercises.map((exercise) => (
              <TrainingGalleryCard
                key={exercise.id}
                title={exercise.title}
                summary={buildTrainingExerciseSummary(exercise) || "Sin resumen"}
                meta={buildExerciseTypeAndDifficultyMeta(exercise)}
                active={selectedExerciseId === exercise.id}
                onClick={() => openExercisePreviewByRecord(exercise)}
              />
            ))}
          </GalleryGrid>
        ) : (
          <StateBlock centered title="Sin ejercicios" description="Crea el primero desde el boton +." />
        )}
      </PanelStack>
    );
  }

  function renderMuscleGallery() {
    return (
      <PanelStack className="trainingPlugin__detailStack">
        <TrainingGalleryHeader
          eyebrow="Entrenamiento"
          title="Musculos"
          countLabel={formatTrainingCount(filteredMuscles.length, "musculo", "musculos")}
          searchValue={muscleSearch}
          searchPlaceholder="Buscar musculos"
          onSearchChange={setMuscleSearch}
          filters={(
            <>
              <InlineField label="Region">
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                  <option value="">Todas</option>
                  {(catalog.regions || []).map((region) => (
                    <option key={region.id} value={region.id}>{region.title}</option>
                  ))}
                </select>
              </InlineField>
              <InlineField label="Grupo">
                <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {visibleGroupOptions.map((group) => (
                    <option key={group.id} value={group.id}>{group.title}</option>
                  ))}
                </select>
              </InlineField>
            </>
          )}
          actions={(
            <Button
              type="button"
              tone={muscleCoverEditMode ? "primary" : "secondary"}
              onClick={() => {
                setMuscleCoverEditMode((current) => !current);
                setMuscleCoverTargetId(null);
                setMuscleCoverNotice("");
                setError("");
              }}
            >
              {muscleCoverEditMode ? "Terminar" : "Editar portadas"}
            </Button>
          )}
        />

        {muscleCoverEditMode ? (
          <Notice>Selecciona un musculo y pega una imagen con Ctrl+V.</Notice>
        ) : null}
        {muscleCoverNotice ? <Notice tone="success">{muscleCoverNotice}</Notice> : null}

        {filteredMuscles.length ? (
          <GalleryGrid className="trainingPlugin__galleryGrid">
            {filteredMuscles.map((muscle) => (
              <TrainingGalleryCard
                key={muscle.id}
                title={muscle.title}
                summary={[muscle.groupTitle, muscle.regionTitle].filter(Boolean).join(" - ")}
                meta={buildMuscleMaxLoadSummary(muscle.id, muscleMaxLoadLookup)}
                active={muscleCoverEditMode
                  ? muscleCoverTargetId === muscle.id
                  : selectedMuscleId === muscle.id}
                editMode={muscleCoverEditMode}
                busy={muscleCoverBusyId === muscle.id}
                media={(
                  <TrainingCoverMedia
                    doc={muscle.doc}
                    title={muscle.title}
                    editMode={muscleCoverEditMode}
                    selected={muscleCoverTargetId === muscle.id}
                    busy={muscleCoverBusyId === muscle.id}
                  />
                )}
                onClick={() => {
                  if (muscleCoverEditMode) {
                    setMuscleCoverTargetId(muscle.id);
                    setMuscleCoverNotice("");
                    setError("");
                    return;
                  }
                  openMusclePreviewByRecord(muscle);
                }}
              />
            ))}
          </GalleryGrid>
        ) : (
          <StateBlock centered title="Sin musculos" description="Ajusta la busqueda o los filtros." />
        )}
      </PanelStack>
    );
  }

  function renderRoutineGallery() {
    return (
      <PanelStack className="trainingPlugin__detailStack">
        <TrainingGalleryHeader
          eyebrow="Entrenamiento"
          title="Rutinas"
          countLabel={formatTrainingCount(filteredRoutines.length, "rutina")}
          searchValue={routineSearch}
          searchPlaceholder="Buscar rutinas"
          onSearchChange={setRoutineSearch}
          actions={(
            <Button type="button" tone="primary" onClick={createRoutine}>
              <PlusIcon size={16} />
              <span>Nuevo</span>
            </Button>
          )}
        />

        {filteredRoutines.length ? (
          <GalleryGrid className="trainingPlugin__galleryGrid">
            {filteredRoutines.map((routine) => (
              <TrainingGalleryCard
                key={routine.id}
                title={routine.title}
                summary={routine.searchSummary || routine.summary || buildTrainingRoutineSummary(routine)}
                active={selectedRoutineId === routine.id}
                onClick={() => openRoutinePreviewByRecord(routine)}
              />
            ))}
          </GalleryGrid>
        ) : (
          <StateBlock centered title="Sin rutinas" description="Crea la primera desde el boton +." />
        )}
      </PanelStack>
    );
  }

  function renderAssignmentGallery() {
    return (
      <PanelStack className="trainingPlugin__detailStack">
        <TrainingGalleryHeader
          eyebrow="Entrenamiento"
          title="Programadas"
          countLabel={formatTrainingCount(filteredAssignments.length, "programada")}
          searchValue={assignmentSearch}
          searchPlaceholder="Buscar programadas"
          onSearchChange={setAssignmentSearch}
          actions={(
            <Button type="button" tone="primary" onClick={() => createAssignment()}>
              <PlusIcon size={16} />
              <span>Nueva</span>
            </Button>
          )}
        />

        {filteredAssignments.length ? (
          <GalleryGrid className="trainingPlugin__galleryGrid">
            {filteredAssignments.map((assignment) => (
              <TrainingGalleryCard
                key={assignment.id}
                title={assignment.routine?.title || "Rutina programada"}
                summary={assignment.searchSummary || assignment.status || "Sin resumen"}
                meta={assignment.status === "archived" ? "Archivada" : "Activa"}
                active={selectedAssignmentId === assignment.id}
                onClick={() => openAssignmentEditByRecord(assignment)}
              />
            ))}
          </GalleryGrid>
        ) : (
          <StateBlock
            centered
            title="Sin programadas"
            description={catalog.routines.length ? "Crea una programacion nueva cuando la necesites." : "Primero crea una rutina."}
          />
        )}
      </PanelStack>
    );
  }

  function renderModeContent() {
    if (mode === "exercises") {
      if (exerciseView === "preview") {
        return (
          <ExercisePreview
            exercise={selectedExercise}
            markdown={exerciseMarkdown}
            onBack={() => setExerciseView("gallery")}
            onEdit={() => openExerciseEditByRecord(selectedExercise)}
            onOpenDoc={handleOpenDoc}
          />
        );
      }

      if (exerciseView === "edit") {
        return (
          <ExerciseEditor
            selectedExercise={selectedExercise}
            exerciseDraft={exerciseDraft}
            setExerciseDraft={setExerciseDraft}
            exerciseMarkdown={exerciseMarkdown}
            setExerciseMarkdown={setExerciseMarkdown}
            editorKey={exerciseEditorKey}
            handleSaveExercise={handleSaveExercise}
            handleDeleteExercise={handleDeleteExercise}
            handleOpenDoc={handleOpenDoc}
            onCancel={() => {
              if (selectedExercise?.id) {
                openExercisePreviewByRecord(selectedExercise);
                return;
              }
              setExerciseView("gallery");
            }}
            catalog={catalog}
            muscleSearch={muscleSearch}
            setMuscleSearch={setMuscleSearch}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            groupFilter={groupFilter}
            setGroupFilter={setGroupFilter}
          />
        );
      }

      return renderExerciseGallery();
    }

    if (mode === "muscles") {
      if (muscleView === "preview") {
        return (
          <MusclePreview
            muscle={selectedMuscle}
            markdown={muscleMarkdown}
            onBack={() => setMuscleView("gallery")}
            onEdit={() => openMuscleEditByRecord(selectedMuscle)}
            onOpenDoc={handleOpenDoc}
          />
        );
      }

      if (muscleView === "edit") {
        return (
          <MuscleEditor
            muscle={selectedMuscle}
            markdown={muscleMarkdown}
            editorKey={muscleEditorKey}
            onChangeMarkdown={setMuscleMarkdown}
            onCancel={() => openMusclePreviewByRecord(selectedMuscle)}
            onSave={handleSaveMuscle}
            onOpenDoc={handleOpenDoc}
          />
        );
      }

      return renderMuscleGallery();
    }

    if (mode === "routines") {
      if (routineView === "preview") {
        return (
          <RoutinePreview
            routine={selectedRoutine}
            exercises={catalog.exercises}
            onBack={() => setRoutineView("gallery")}
            onEdit={() => openRoutineEditByRecord(selectedRoutine)}
            onAssign={openAssignmentFromRoutine}
          />
        );
      }

      if (routineView === "edit") {
        return (
          <RoutineEditor
            selectedRoutine={selectedRoutine}
            routineDraft={routineDraft}
            setRoutineDraft={setRoutineDraft}
            catalog={catalog}
            handleSaveRoutine={handleSaveRoutine}
            handleDeleteRoutine={handleDeleteRoutine}
            openAssignmentFromRoutine={openAssignmentFromRoutine}
            onCancel={() => {
              if (selectedRoutine?.id) {
                openRoutinePreviewByRecord(selectedRoutine);
                return;
              }
              setRoutineView("gallery");
            }}
          />
        );
      }

      return renderRoutineGallery();
    }

    if (assignmentView === "edit") {
      return (
        <AssignmentEditor
          selectedAssignment={selectedAssignment}
          assignmentDraft={assignmentDraft}
          setAssignmentDraft={setAssignmentDraft}
          routines={catalog.routines}
          handleSaveAssignment={handleSaveAssignment}
          handleDeleteAssignment={handleDeleteAssignment}
          onCancel={() => setAssignmentView("gallery")}
        />
      );
    }

    return renderAssignmentGallery();
  }

  const pageContent = (
    <>
      {showTopbar ? (
        <WorkspaceTopbar>
          <WorkspaceTitle
            eyebrow="Life Tracker"
            title="Entrenamientos"
            
          />

          <ToolbarActions>
            <Button type="button" onClick={() => void loadLibrary()}>
              <RefreshIcon size={16} />
              <span>Refrescar</span>
            </Button>
          </ToolbarActions>
        </WorkspaceTopbar>
      ) : null}

      <WorkspaceBody className="trainingPlugin__body">
        <SplitLayout className="trainingPlugin__content trainingPlugin__content--compact" variant="sidebar-detail">
          <SplitSidebar className="trainingPlugin__rail">
            <TrainingSectionRail
              mode={mode}
              catalog={catalog}
              onChange={activateMode}
              onRefresh={() => loadLibrary()}
              showRefresh={!showTopbar || isEmbedded}
            />
          </SplitSidebar>

          <SplitDetail className="trainingPlugin__detail">
            <ScrollRegion className="trainingPlugin__detailScroll">
              {error ? <Notice tone="danger">{error}</Notice> : null}

              {loading ? (
                <StateBlock
                  eyebrow="Cargando"
                  title="Cargando entrenamiento"
                />
              ) : renderModeContent()}
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

import { pluginIpc } from "../ipc-client.js";
