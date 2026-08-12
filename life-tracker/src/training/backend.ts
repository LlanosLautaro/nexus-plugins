import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../../nexus-backend/src/plugins/types.ts";
import {
  buildMarkdownDocumentWithFrontmatter,
  extractYamlFrontmatter,
} from "../../../../nexus-backend/src/internalModules/core/markdown-frontmatter.ts";
import {
  addDaysToLocalDate,
  buildOccurrenceDates,
  compareLocalDates,
  doesScheduleMatchDate,
  getOccurrenceWindowEndAt,
  getOccurrenceWindowStartAt,
  normalizeLocalDate,
  normalizeTimeValue,
  todayLocalDate,
} from "./training-schedule.js";
import {
  TRAINING_MUSCLE_CATALOG,
  TRAINING_MUSCLE_GROUPS,
  TRAINING_MUSCLE_REGIONS,
  getTrainingMuscleById,
  listTrainingMuscles,
} from "./training-muscles.js";
import {
  TRAINING_STARTER_EXERCISES,
  TRAINING_STARTER_LIBRARY_VERSION,
} from "./training-starter-library.js";
import {
  buildTrainingExerciseTagSummary,
  buildTrainingExerciseTypeSummary,
  buildTrainingExerciseSummary,
  buildTrainingMeasurementCategorySummary,
  buildTrainingMetricSummary,
  buildTrainingRoutineStepSummary,
  buildTrainingRoutineSummary,
  flattenTrainingStructureSteps,
  isComparableTextMatch,
  migrateLegacyTrainingSteps,
  normalizeOptionalText,
  normalizeTrainingAssignmentInput,
  normalizeTrainingCompletionMode,
  normalizeTrainingExerciseTags,
  normalizeTrainingExerciseType,
  normalizeTrainingMeasurement,
  normalizeTrainingMeasurementCategory,
  normalizeTrainingMuscleLoads,
  normalizeTrainingOccurrenceResult,
  normalizeTrainingPrescription,
  normalizeTrainingSlug,
  normalizeTrainingStructure,
  parseJsonObject,
} from "./training-utils.js";

const TRAINING_PLUGIN_ID = "nexus.life-tracker.training";
const LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";
const TRAINING_EXERCISE_KIND = "training_exercise";
const TRAINING_ROUTINE_KIND = "training_routine";
const TRAINING_HISTORY_DAYS = 21;
const TRAINING_HOME_HISTORY_LIMIT = 8;
const TRAINING_CONCEPTS_ROOT = "Concepts/Fitness";
const TRAINING_MUSCLE_CONCEPTS_DIRECTORY = `${TRAINING_CONCEPTS_ROOT}/Muscles`;
const TRAINING_EXERCISE_CONCEPTS_DIRECTORY = `${TRAINING_CONCEPTS_ROOT}/Exercises`;
const TRAINING_LEGACY_FOLDER_NOTE_FILE_NAME = "_folder.md";
const TRAINING_MANAGED_DOCS_ASSET_DIRECTORY = path.resolve(
  __dirname,
  "..",
  "assets",
  "training",
  "managed-docs",
);
const TRAINING_STARTER_EXERCISE_ID_TOKEN = "__NEXUS_TRAINING_EXERCISE_ID__";
const TRAINING_TRANSFER_SCHEMA_VERSION = 2;
const trainingConceptCoverageInFlight = new Map<string, Promise<void>>();
const trainingMarkdownLinkSyncInFlight = new Map<string, Promise<void>>();
const trainingMarkdownLinksSynced = new Set<string>();
const TRAINING_STARTER_LIBRARY_STATE_KEY = "starterLibraryVersion";

type TrainingExerciseType = "exercise" | "stretch" | "warmup" | "coordination";
type TrainingMeasurementCategory = "strength" | "cardio" | "balance" | "flexibility";
type TrainingExerciseTag =
  | "strength"
  | "cardio"
  | "balance"
  | "flexibility"
  | "endurance"
  | "motor-control"
  | "isometric"
  | "unilateral"
  | "explosive";

type TrainingDocRecord = {
  conceptId: string;
  itemId: string;
  itemPath: string;
  relativePath: string | null;
  title: string;
  summary: string | null;
  frontmatter: Record<string, unknown>;
};

type TrainingExerciseRecord = {
  id: string;
  entityRefId: string;
  title: string;
  slug: string;
  summary: string | null;
  notes: string | null;
  exerciseType: TrainingExerciseType;
  measurementCategory: TrainingMeasurementCategory;
  tags: TrainingExerciseTag[];
  measurement: Record<string, unknown>;
  muscleLoads: Array<Record<string, unknown>>;
  legacyWarnings: Array<Record<string, unknown>>;
  templateKey: string | null;
  personalDifficultyScore: number | null;
  isStarter: boolean;
  createdAt: string;
  updatedAt: string;
  searchSummary: string;
  doc: TrainingDocRecord | null;
};

type TrainingRoutineRecord = {
  id: string;
  entityRefId: string;
  title: string;
  slug: string;
  summary: string | null;
  notes: string | null;
  structure: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
  searchSummary: string;
};

type TrainingRoutineAssignmentRecord = {
  id: string;
  routineId: string;
  scheduleType: "daily" | "weekdays";
  scheduleConfigJson: Record<string, unknown>;
  startDate: string;
  endDate: string | null;
  time: string | null;
  priority: number;
  status: "active" | "archived";
  completionMode: "yes-no" | "detailed";
  createdAt: string;
  updatedAt: string;
  routine: TrainingRoutineRecord | null;
  searchSummary: string;
};

type TrainingRoutineOccurrenceRecord = {
  id: string;
  assignmentId: string;
  occurrenceDate: string;
  windowStartAt: string;
  windowEndAt: string;
  status: "pending" | "completed" | "failed";
  resultJson: Record<string, unknown>;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TrainingLibrarySnapshot = {
  exercises: TrainingExerciseRecord[];
  routines: TrainingRoutineRecord[];
  assignments: TrainingRoutineAssignmentRecord[];
  muscles: Array<(typeof TRAINING_MUSCLE_CATALOG)[number] & { doc: TrainingDocRecord | null }>;
  regions: typeof TRAINING_MUSCLE_REGIONS;
  groups: typeof TRAINING_MUSCLE_GROUPS;
};

type TrainingExerciseInput = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  notes?: string | null;
  exerciseType?: unknown;
  measurementCategory?: unknown;
  tags?: Array<unknown>;
  measurement?: unknown;
  muscleLoads?: Array<unknown>;
  templateKey?: string | null;
  personalDifficultyScore?: unknown;
  docMarkdown?: string | null;
};

type TrainingRoutineInput = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  notes?: string | null;
  structure?: Array<unknown>;
  steps?: Array<unknown>;
};

type TrainingTransferMuscleRecord = {
  id: string;
  title: string;
  regionId: string;
  regionTitle: string;
  groupId: string;
  groupTitle: string;
  markdown: string;
};

type TrainingTransferExerciseRecord = {
  title: string;
  summary: string | null;
  exerciseType: TrainingExerciseType;
  measurementCategory: TrainingMeasurementCategory;
  tags: TrainingExerciseTag[];
  measurement: Record<string, unknown>;
  muscleLoads: Array<Record<string, unknown>>;
  templateKey: string | null;
  personalDifficultyScore: number | null;
  markdown: string;
};

type TrainingTransferRoutineSegment = Record<string, unknown>;

type TrainingTransferRoutineRecord = {
  title: string;
  summary: string | null;
  notes: string | null;
  structure: TrainingTransferRoutineSegment[];
};

type TrainingTransferEnvelope = {
  version: number;
  muscles: TrainingTransferMuscleRecord[];
  exercises: TrainingTransferExerciseRecord[];
  routines: TrainingTransferRoutineRecord[];
};

type TrainingConceptTemplateContext = {
  payload: TrainingConceptNotePayload;
  slug: string;
  title: string;
};

type TrainingConceptTemplateDefinition = {
  frontmatter?: (context: TrainingConceptTemplateContext) => Record<string, unknown>;
  body?: (context: TrainingConceptTemplateContext) => string;
};

type TrainingConceptNotePayload = {
  title: string;
  slug?: string | null;
  fileBaseName?: string | null;
  relativeDirectoryPath?: string | null;
  templateId?: string | null;
  frontmatter?: Record<string, unknown> | null;
  summary?: string | null;
  content?: string | null;
};

type TrainingManagedDocRecord = {
  id: string;
  kind: "starter-exercise" | "muscle";
  group: "Ejercicios" | "Musculos";
  label: string;
  description: string | null;
  status: "original" | "edited" | "missing";
  relativePath: string;
  currentRelativePath: string | null;
  itemId: string | null;
  itemPath: string | null;
  conceptId: string | null;
  exerciseId: string | null;
  exerciseTemplateKey: string | null;
  muscleId: string | null;
};

const TRAINING_CONCEPT_TEMPLATES: Record<string, TrainingConceptTemplateDefinition> = {
  "fitness-muscle": {
    frontmatter: ({ payload, title }) => ({
      nexus: {
        defaultView: "read",
        card: {
          title,
          summary: payload.summary?.trim() || "",
        },
      },
      fitness: {
        domain: "training",
        kind: "muscle",
      },
    }),
    body: ({ title, payload }) => [
      `# ${title}`,
      "",
      payload.summary?.trim() || "Describe la funcion principal de este musculo y como se siente cuando trabaja.",
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
    ].join("\n"),
  },
  "fitness-exercise": {
    frontmatter: ({ payload, title }) => ({
      nexus: {
        defaultView: "read",
        card: {
          title,
          summary: payload.summary?.trim() || "",
        },
      },
      fitness: {
        domain: "training",
        kind: "exercise",
      },
    }),
    body: ({ title, payload }) => [
      `# ${title}`,
      "",
      payload.summary?.trim() || "Describe el patron general, la tecnica y cualquier referencia util para ejecutar este ejercicio.",
      "",
      "## Tecnica",
      "",
      "## Videos / embeds",
      "",
      "## Relacionados",
      "",
      "## Notas",
    ].join("\n"),
  },
};

const TRAINING_STARTER_EXERCISE_BY_TEMPLATE_KEY = new Map(
  TRAINING_STARTER_EXERCISES.map((exercise) => [exercise.templateKey, exercise]),
);

function createSuccess(data: unknown) {
  return { ok: true, data };
}

function createError(error: unknown, fallbackMessage: string) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function assertNonEmptyString(value: unknown, fieldName: string) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return normalized;
}

function normalizeOptionalNumber(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  const normalized = Number(String(value).replace(",", "."));
  return Number.isFinite(normalized) ? normalized : null;
}

function getTrainingStarterExerciseDefinition(templateKey: unknown) {
  const normalizedTemplateKey = normalizeOptionalText(templateKey);
  return normalizedTemplateKey
    ? TRAINING_STARTER_EXERCISE_BY_TEMPLATE_KEY.get(normalizedTemplateKey) || null
    : null;
}

function parseRowJson<T = Record<string, unknown>>(value: unknown, fallback: T): T {
  if (Array.isArray(fallback)) {
    if (value == null || value === "") {
      return [...fallback] as T;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return (Array.isArray(parsed) ? parsed : [...fallback]) as T;
      } catch {
        return [...fallback] as T;
      }
    }

    return (Array.isArray(value) ? value : [...fallback]) as T;
  }

  const parsed = parseJsonObject(value, fallback as Record<string, unknown>);
  return parsed as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function cloneJsonValue<T>(value: T): T {
  if (value == null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

function deepMergeObjects(
  baseValue: Record<string, unknown>,
  overrideValue: Record<string, unknown>,
) {
  const result: Record<string, unknown> = {
    ...cloneJsonValue(baseValue),
  };

  for (const [key, value] of Object.entries(overrideValue)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMergeObjects(result[key] as Record<string, unknown>, value);
      continue;
    }

    result[key] = cloneJsonValue(value);
  }

  return result;
}

function getRepositories(ctx: NexusBackendPluginContext) {
  return ctx.requireRepositories();
}

function getSqlite(ctx: NexusBackendPluginContext) {
  return getRepositories(ctx).sqlite;
}

function normalizeRelativeContentPath(value: unknown) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
}

function resolveAbsoluteContentPath(ctx: NexusBackendPluginContext, relativePath: unknown) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  return normalizedRelativePath
    ? path.join(ctx.vault.contentPath, normalizedRelativePath)
    : "";
}

function normalizeTrainingNoteFileBaseName(value: unknown, fallback = "Concepto") {
  const source = normalizeOptionalText(value) || fallback;
  const sanitized = source
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();

  return sanitized || fallback;
}

function buildTrainingConceptRelativePath(directoryRelativePath: string, fileBaseName: string) {
  const normalizedDirectoryPath = normalizeRelativeContentPath(directoryRelativePath);
  const normalizedFileBaseName = normalizeTrainingNoteFileBaseName(fileBaseName, "Concepto");
  return normalizeRelativeContentPath(
    normalizedDirectoryPath
      ? `${normalizedDirectoryPath}/${normalizedFileBaseName}.md`
      : `${normalizedFileBaseName}.md`,
  );
}

function getTrainingMuscleConceptPreferredFileBaseName(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  return normalizeTrainingNoteFileBaseName(muscle.title, muscle.id);
}

function getTrainingMuscleConceptPreferredRelativePath(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  return buildTrainingConceptRelativePath(
    TRAINING_MUSCLE_CONCEPTS_DIRECTORY,
    getTrainingMuscleConceptPreferredFileBaseName(muscle),
  );
}

function getTrainingMuscleConceptLegacyRelativePaths(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  return [
    normalizeRelativeContentPath(`${TRAINING_MUSCLE_CONCEPTS_DIRECTORY}/${muscle.id}.md`),
  ].filter((relativePath, index, list) => relativePath && list.indexOf(relativePath) === index);
}

function getTrainingExerciseConceptPreferredFileBaseName(
  exercise: Pick<TrainingExerciseRecord, "title" | "slug">,
) {
  return normalizeTrainingNoteFileBaseName(exercise.title, exercise.slug || "Ejercicio");
}

function getTrainingExerciseConceptPreferredRelativePath(
  exercise: Pick<TrainingExerciseRecord, "title" | "slug">,
) {
  return buildTrainingConceptRelativePath(
    TRAINING_EXERCISE_CONCEPTS_DIRECTORY,
    getTrainingExerciseConceptPreferredFileBaseName(exercise),
  );
}

function getTrainingExerciseConceptLegacyRelativePaths(
  exercise: Pick<TrainingExerciseRecord, "slug">,
) {
  return [
    normalizeRelativeContentPath(`${TRAINING_EXERCISE_CONCEPTS_DIRECTORY}/${exercise.slug}.md`),
  ].filter((relativePath, index, list) => relativePath && list.indexOf(relativePath) === index);
}

function getTrainingStarterExerciseManagedDocId(templateKey: string) {
  return `starter-exercise:${templateKey}`;
}

function getTrainingMuscleManagedDocId(muscleId: string) {
  return `muscle:${muscleId}`;
}

function buildTrainingMuscleConceptSummary(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  return `${muscle.groupTitle} - ${muscle.regionTitle}`;
}

function joinTrainingNaturalList(items: string[]) {
  if (!items.length) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} y ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function buildTrainingMuscleInlineLink(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  return `[${muscle.title}](${getTrainingMuscleConceptPreferredFileBaseName(muscle)}.md)`;
}

function buildTrainingMuscleRelatedSummary(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  const relatedLinks = (Array.isArray(muscle.relatedMuscleIds) ? muscle.relatedMuscleIds : [])
    .map((relatedMuscleId) => getTrainingMuscleById(relatedMuscleId))
    .filter(Boolean)
    .map((relatedMuscle) => buildTrainingMuscleInlineLink(relatedMuscle));

  if (!relatedLinks.length) {
    return "Suele trabajar junto a otros musculos cercanos del mismo patron.";
  }

  return `Suele trabajar junto a ${joinTrainingNaturalList(relatedLinks)}.`;
}

function buildTrainingMuscleBody(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  const summary = buildTrainingMuscleConceptSummary(muscle);
  const movementSummary = String(muscle.movementSummary || "").trim()
    || "Describe la funcion principal de este musculo y como se siente cuando trabaja.";

  return [
    `# ${muscle.title}`,
    "",
    summary,
    "",
    "## Funcion",
    "",
    movementSummary,
    "",
    "## Trabaja con",
    "",
    buildTrainingMuscleRelatedSummary(muscle),
  ].join("\n");
}

function buildManagedStarterExerciseMuscleLines(
  definition: (typeof TRAINING_STARTER_EXERCISES)[number],
) {
  return definition.muscleLoads.map((entry) => {
    const muscle = getTrainingMuscleById(entry.muscleId);
    const muscleTitle = muscle?.title || entry.muscleId;
    const musclePath = muscle
      ? `../Muscles/${getTrainingMuscleConceptPreferredFileBaseName(muscle)}.md`
      : "";

    return musclePath
      ? `- [${muscleTitle}](${musclePath}): ${entry.percentage}%`
      : `- ${muscleTitle}: ${entry.percentage}%`;
  });
}

function buildTrainingStarterExerciseTaxonomyLines(
  definition: (typeof TRAINING_STARTER_EXERCISES)[number],
) {
  const typeSummary = buildTrainingExerciseTypeSummary(definition.exerciseType);
  const categorySummary = buildTrainingMeasurementCategorySummary(definition.measurementCategory);
  const tagSummary = buildTrainingExerciseTagSummary(definition.tags, {
    measurementCategory: definition.measurementCategory,
  });

  return [
    `- Tipo: ${typeSummary}`,
    `- Perfil principal: ${categorySummary}`,
    tagSummary ? `- Tags: ${tagSummary}` : null,
  ].filter(Boolean) as string[];
}

function buildTrainingStarterExerciseBody(
  definition: (typeof TRAINING_STARTER_EXERCISES)[number],
) {
  return [
    `# ${definition.title}`,
    "",
    definition.description,
    "",
    "## Perfil",
    "",
    ...buildTrainingStarterExerciseTaxonomyLines(definition),
    "",
    "## Tecnica",
    "",
    ...definition.technique.map((line) => `- ${line}`),
    "",
    "## Puntos clave",
    "",
    ...definition.keyPoints.map((line) => `- ${line}`),
    "",
    "## Musculos implicados",
    "",
    ...buildManagedStarterExerciseMuscleLines(definition),
    "",
    "## Notas",
    "",
    ...definition.notes.map((line) => `- ${line}`),
  ].join("\n");
}

function buildTrainingStarterExerciseConceptPayload(
  definition: (typeof TRAINING_STARTER_EXERCISES)[number],
  exerciseId: string,
): TrainingConceptNotePayload {
  return {
    title: definition.title,
    slug: definition.title,
    fileBaseName: definition.title,
    relativeDirectoryPath: TRAINING_EXERCISE_CONCEPTS_DIRECTORY,
    summary: definition.summary,
    content: buildTrainingStarterExerciseBody(definition),
    frontmatter: {
      nexus: {
        defaultView: "read",
        card: {
          title: definition.title,
          summary: definition.summary,
        },
      },
      fitness: {
        domain: "training",
        kind: "exercise",
        targetId: exerciseId,
        templateKey: definition.templateKey,
        exerciseType: normalizeTrainingExerciseType(definition.exerciseType),
        measurementCategory: normalizeTrainingMeasurementCategory(definition.measurementCategory),
        tags: normalizeTrainingExerciseTags(definition.tags, {
          measurementCategory: definition.measurementCategory,
        }),
      },
    },
  };
}

function buildLegacyTrainingMuscleConceptPayload(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
): TrainingConceptNotePayload {
  return {
    title: muscle.title,
    slug: muscle.id,
    fileBaseName: getTrainingMuscleConceptPreferredFileBaseName(muscle),
    relativeDirectoryPath: TRAINING_MUSCLE_CONCEPTS_DIRECTORY,
    templateId: "fitness-muscle",
    summary: buildTrainingMuscleConceptSummary(muscle),
    frontmatter: {
      fitness: {
        domain: "training",
        kind: "muscle",
        targetId: muscle.id,
        regionId: muscle.regionId,
        groupId: muscle.groupId,
      },
      nexus: {
        card: {
          title: muscle.title,
          summary: buildTrainingMuscleConceptSummary(muscle),
        },
      },
    },
  };
}

function buildTrainingMuscleConceptPayload(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
): TrainingConceptNotePayload {
  return {
    ...buildLegacyTrainingMuscleConceptPayload(muscle),
    content: buildTrainingMuscleBody(muscle),
  };
}

function normalizeTrainingMarkdownForComparison(value: unknown) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function withoutTrainingCoverForComparison(source: string) {
  const parsed = extractYamlFrontmatter(source);
  if (
    parsed.parseError
    || !parsed.hasFrontmatter
    || !Object.prototype.hasOwnProperty.call(parsed.frontmatter, "cover")
  ) {
    return source;
  }

  const frontmatter = { ...parsed.frontmatter };
  delete frontmatter.cover;
  return buildMarkdownDocumentWithFrontmatter({
    frontmatter,
    body: parsed.body,
  });
}

function preserveTrainingCover(
  currentDoc: TrainingDocRecord | null,
  managedContent: string,
) {
  if (!currentDoc?.itemPath || !existsSync(currentDoc.itemPath)) {
    return managedContent;
  }

  try {
    const currentSource = readFileSync(currentDoc.itemPath, "utf8");
    const currentParsed = extractYamlFrontmatter(currentSource);
    const cover = currentParsed.frontmatter.cover;
    if (currentParsed.parseError || typeof cover !== "string" || !cover.trim()) {
      return managedContent;
    }

    const managedParsed = extractYamlFrontmatter(managedContent);
    if (managedParsed.parseError) {
      return managedContent;
    }

    return buildMarkdownDocumentWithFrontmatter({
      frontmatter: {
        ...managedParsed.frontmatter,
        cover: cover.trim(),
      },
      body: managedParsed.body,
    });
  } catch {
    return managedContent;
  }
}

function getRealTrainingConceptId(value: unknown) {
  const normalizedValue = normalizeOptionalText(value);
  return normalizedValue && !normalizedValue.startsWith("item:")
    ? normalizedValue
    : null;
}

function readFrontmatterFromMarkdownPath(markdownPath: string) {
  if (!markdownPath) {
    return {};
  }

  try {
    const content = readFileSync(markdownPath, "utf8");
    const { frontmatter } = extractYamlFrontmatter(content);
    return isPlainObject(frontmatter) ? frontmatter : {};
  } catch {
    return {};
  }
}

function selectTrainingDocRowByConceptIdSync(sqlite: any, conceptId: string) {
  return sqlite.prepare(`
    SELECT
      c.id AS concept_id,
      c.item_id AS item_id,
      c.title AS title,
      c.summary AS summary,
      i.path AS item_path
    FROM concepts c
    LEFT JOIN items i ON i.id = c.item_id
    WHERE c.id = ?
    LIMIT 1
  `).get(conceptId) ?? null;
}

function buildTrainingDocRecordSync(ctx: NexusBackendPluginContext, row: any): TrainingDocRecord | null {
  if (!row?.concept_id || !row?.item_id || !row?.item_path) {
    return null;
  }

  const relativePath = normalizeRelativeContentPath(row.item_path);
  const itemPath = resolveAbsoluteContentPath(ctx, relativePath);

  return {
    conceptId: String(row.concept_id),
    itemId: String(row.item_id),
    itemPath,
    relativePath: relativePath || null,
    title: String(row.title || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    frontmatter: readFrontmatterFromMarkdownPath(itemPath),
  };
}

function getTrainingDocRecordByConceptIdSync(ctx: NexusBackendPluginContext, conceptId: unknown) {
  const normalizedConceptId = normalizeOptionalText(conceptId);
  if (!normalizedConceptId) {
    return null;
  }

  const sqlite = getSqlite(ctx);
  return buildTrainingDocRecordSync(ctx, selectTrainingDocRowByConceptIdSync(sqlite, normalizedConceptId));
}

function findTrainingExerciseByConceptIdSync(sqlite: any, conceptId: string) {
  return sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE concept_id = ?
    LIMIT 1
  `).get(conceptId) ?? null;
}

function listTrainingMuscleDocRowsSync(sqlite: any) {
  return sqlite.prepare(`
    SELECT
      tmc.muscle_id,
      c.id AS concept_id,
      c.item_id AS item_id,
      c.title AS title,
      c.summary AS summary,
      i.path AS item_path
    FROM training_muscle_concepts tmc
    LEFT JOIN concepts c ON c.id = tmc.concept_id
    LEFT JOIN items i ON i.id = c.item_id
    ORDER BY tmc.muscle_id ASC
  `).all() as any[];
}

function getTrainingMuscleDocsByIdSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const docsById = new Map();

  for (const row of listTrainingMuscleDocRowsSync(sqlite)) {
    const doc = buildTrainingDocRecordSync(ctx, row);
    if (doc) {
      docsById.set(String(row.muscle_id), doc);
    }
  }

  return docsById;
}

function enrichTrainingMuscleCatalogSync(
  ctx: NexusBackendPluginContext,
  muscles: Array<(typeof TRAINING_MUSCLE_CATALOG)[number]> = TRAINING_MUSCLE_CATALOG,
) {
  const docsById = getTrainingMuscleDocsByIdSync(ctx);
  return muscles.map((muscle) => ({
    ...muscle,
    doc: docsById.get(muscle.id)
      || findTrainingExistingMuscleDocRecordSync(ctx, muscle)
      || null,
  }));
}

function ensureTableColumn(sqlite: any, tableName: string, columnName: string, definition: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column: any) => String(column?.name || "").trim() === columnName)) {
    return;
  }

  sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function getTrainingSearchDocumentId(prefix: "exercise" | "routine", id: string) {
  return `${TRAINING_PLUGIN_ID}:${prefix}:${id}`;
}

function allocateUniqueSlug(baseSlug: string, existsBySlug: (slug: string) => Promise<any>, currentId: string | null = null) {
  return (async () => {
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await existsBySlug(slug);
      if (!existing || String(existing.id) === String(currentId || "")) {
        return slug;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  })();
}

function allocateUniqueSlugSync(baseSlug: string, existsBySlug: (slug: string) => any, currentId: string | null = null) {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = existsBySlug(slug);
    if (!existing || String(existing.id) === String(currentId || "")) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function getTrainingConceptTemplate(templateId: string | null | undefined) {
  const normalizedTemplateId = normalizeOptionalText(templateId);
  return normalizedTemplateId ? TRAINING_CONCEPT_TEMPLATES[normalizedTemplateId] || null : null;
}

function buildTrainingConceptFrontmatter(
  title: string,
  slug: string,
  payload: TrainingConceptNotePayload,
) {
  const template = getTrainingConceptTemplate(payload.templateId);
  const templateFrontmatter = template?.frontmatter?.({
    payload,
    slug,
    title,
  }) || {};
  const payloadFrontmatter = isPlainObject(payload.frontmatter) ? payload.frontmatter : {};

  if (!Object.keys(templateFrontmatter).length && !Object.keys(payloadFrontmatter).length) {
    return {};
  }

  return deepMergeObjects(templateFrontmatter, payloadFrontmatter);
}

function buildTrainingConceptBody(
  title: string,
  slug: string,
  payload: TrainingConceptNotePayload,
) {
  if (typeof payload.content === "string") {
    return payload.content;
  }

  const template = getTrainingConceptTemplate(payload.templateId);
  const templatedBody = template?.body?.({
    payload,
    slug,
    title,
  });

  if (typeof templatedBody === "string" && templatedBody.trim()) {
    return templatedBody;
  }

  const summary = payload.summary?.trim();
  return summary ? `# ${title}\n\n${summary}` : `# ${title}`;
}

function buildTrainingConceptMarkdownContent(
  title: string,
  slug: string,
  payload: TrainingConceptNotePayload,
) {
  return buildMarkdownDocumentWithFrontmatter({
    frontmatter: buildTrainingConceptFrontmatter(title, slug, payload),
    body: buildTrainingConceptBody(title, slug, payload),
  });
}

async function allocateTrainingConceptMarkdownPath(
  directoryAbsolutePath: string,
  baseFileName: string,
  duplicateSeparator = "-",
) {
  const normalizedBaseFileName = normalizeTrainingNoteFileBaseName(baseFileName, "Concepto");
  let filePath = path.join(directoryAbsolutePath, `${normalizedBaseFileName}.md`);
  let suffix = 2;

  while (true) {
    try {
      await fs.access(filePath);
      filePath = path.join(directoryAbsolutePath, `${normalizedBaseFileName}${duplicateSeparator}${suffix}.md`);
      suffix += 1;
    } catch {
      return filePath;
    }
  }
}

function selectTrainingItemRowsByPathSync(sqlite: any, relativePath: string) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return [];
  }

  return sqlite.prepare(`
    SELECT *
    FROM items
    WHERE LOWER(REPLACE(path, '\\', '/')) = LOWER(?)
      AND COALESCE(deleted, 0) = 0
    ORDER BY
      CASE WHEN type = 'file' THEN 0 ELSE 1 END ASC,
      id ASC
  `).all(normalizedRelativePath) as any[];
}

function canDeleteTrainingStaleItemSync(sqlite: any, itemId: string) {
  const childCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM items
    WHERE parentId = ?
      AND COALESCE(deleted, 0) = 0
  `).get(itemId)?.count ?? 0;
  if (Number(childCount) > 0) {
    return false;
  }

  const conceptCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM concepts
    WHERE item_id = ?
  `).get(itemId)?.count ?? 0;
  if (Number(conceptCount) > 0) {
    return false;
  }

  const searchCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM search_documents
    WHERE item_id = ?
  `).get(itemId)?.count ?? 0;
  if (Number(searchCount) > 0) {
    return false;
  }

  const markdownLinkCount = sqlite.prepare(`
    SELECT COUNT(*) AS count
    FROM markdown_links
    WHERE source_item_id = ?
       OR resolved_item_id = ?
  `).get(itemId, itemId)?.count ?? 0;

  return Number(markdownLinkCount) <= 0;
}

function pruneTrainingItemRowsByPathSync(
  sqlite: any,
  relativePath: string,
  preferredType: "file" | "folder",
  keepItemId: string | null = null,
) {
  const rows = selectTrainingItemRowsByPathSync(sqlite, relativePath);
  if (!rows.length) {
    return;
  }

  const normalizedKeepId = normalizeOptionalText(keepItemId);
  const preferredRow = normalizedKeepId
    ? rows.find((row) => String(row.id) === normalizedKeepId) || null
    : rows.find((row) => String(row.type) === preferredType) || rows[0] || null;

  for (const row of rows) {
    if (preferredRow?.id && String(row.id) === String(preferredRow.id)) {
      continue;
    }

    if (!canDeleteTrainingStaleItemSync(sqlite, String(row.id))) {
      continue;
    }

    sqlite.prepare("DELETE FROM items WHERE id = ?").run(String(row.id));
  }
}

function deleteTrainingItemRowsByPathSync(sqlite: any, relativePath: string) {
  for (const row of selectTrainingItemRowsByPathSync(sqlite, relativePath)) {
    if (!canDeleteTrainingStaleItemSync(sqlite, String(row.id))) {
      continue;
    }

    sqlite.prepare("DELETE FROM items WHERE id = ?").run(String(row.id));
  }
}

function pruneMissingTrainingItemRowsByPathSync(
  ctx: NexusBackendPluginContext,
  relativePath: string,
) {
  const sqlite = getSqlite(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return;
  }

  for (const row of selectTrainingItemRowsByPathSync(sqlite, normalizedRelativePath)) {
    const absolutePath = resolveAbsoluteContentPath(ctx, row.path || normalizedRelativePath);
    if (absolutePath && existsSync(absolutePath)) {
      continue;
    }

    if (!canDeleteTrainingStaleItemSync(sqlite, String(row.id))) {
      continue;
    }

    sqlite.prepare("DELETE FROM items WHERE id = ?").run(String(row.id));
  }
}

async function findTrainingItemByRelativePath(
  ctx: NexusBackendPluginContext,
  relativePath: string,
  expectedType: "file" | "folder",
) {
  const repositories = getRepositories(ctx);
  const sqlite = getSqlite(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return expectedType === "folder"
      ? repositories.items.findRoot()
      : null;
  }

  pruneMissingTrainingItemRowsByPathSync(ctx, normalizedRelativePath);
  pruneTrainingItemRowsByPathSync(sqlite, normalizedRelativePath, expectedType);
  const preferredRow = selectTrainingItemRowsByPathSync(sqlite, normalizedRelativePath)
    .find((row) => String(row.type) === expectedType) || null;

  return preferredRow?.id
    ? repositories.items.findById(String(preferredRow.id))
    : null;
}

async function ensureTrainingItemPath(
  ctx: NexusBackendPluginContext,
  relativePath: string,
  finalType: "file" | "folder",
) {
  const repositories = getRepositories(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);

  if (!normalizedRelativePath) {
    return repositories.items.findRoot();
  }

  const existing = await findTrainingItemByRelativePath(ctx, normalizedRelativePath, finalType);
  if (existing) {
    return existing;
  }

  const rootItem = await repositories.items.findRoot();
  if (!rootItem) {
    throw new Error("No encontramos la raiz del vault para registrar el item.");
  }

  const segments = normalizedRelativePath.split("/").filter(Boolean);
  let currentItem = rootItem;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLastSegment = index === segments.length - 1;
    const segmentRelativePath = segments.slice(0, index + 1).join("/");
    const expectedType = isLastSegment ? finalType : "folder";
    const existingChild = await repositories.items.findChildByParentAndName(currentItem.id, segment);

    if (existingChild) {
      currentItem = existingChild;

      if (isLastSegment && String(existingChild.type) !== expectedType) {
        currentItem = await existingChild.update({
          type: expectedType,
          icon: expectedType === "folder" ? "folder" : "file",
          extension: expectedType === "file"
            ? (path.extname(segment).replace(/^\./, "") || null)
            : null,
        });
      }

      continue;
    }

    currentItem = await repositories.items.create({
      id: randomUUID(),
      name: segment,
      path: segmentRelativePath,
      relative_path: segmentRelativePath,
      type: expectedType,
      parentId: currentItem.id,
      icon: expectedType === "folder" ? "folder" : "file",
      extension: expectedType === "file"
        ? (path.extname(segment).replace(/^\./, "") || null)
        : null,
    });

    if (!currentItem) {
      throw new Error(`No se pudo registrar el item del vault: ${segmentRelativePath}`);
    }
  }

  return currentItem;
}

async function createTrainingConceptNote(
  ctx: NexusBackendPluginContext,
  payload: TrainingConceptNotePayload,
) {
  const repositories = getRepositories(ctx);
  const title = assertNonEmptyString(payload?.title, "title");
  const baseSlug = normalizeTrainingSlug(payload.slug || title, "concept");
  const fileBaseName = normalizeTrainingNoteFileBaseName(payload.fileBaseName || title, title);
  const slug = await allocateUniqueSlug(
    baseSlug,
    (nextSlug) => repositories.concepts.findBySlug(nextSlug),
  );
  const relativeDirectoryPath = normalizeRelativeContentPath(
    payload.relativeDirectoryPath || TRAINING_CONCEPTS_ROOT,
  );
  const directoryAbsolutePath = resolveAbsoluteContentPath(ctx, relativeDirectoryPath);
  const markdownAbsolutePath = await allocateTrainingConceptMarkdownPath(
    directoryAbsolutePath,
    fileBaseName,
    payload.fileBaseName ? " " : "-",
  );
  const markdownFileName = path.basename(markdownAbsolutePath);
  const markdownRelativePath = normalizeRelativeContentPath(
    relativeDirectoryPath
      ? `${relativeDirectoryPath}/${markdownFileName}`
      : markdownFileName,
  );

  await fs.mkdir(directoryAbsolutePath, { recursive: true });
  await fs.writeFile(
    markdownAbsolutePath,
    buildTrainingConceptMarkdownContent(title, slug, payload),
    { flag: "wx" },
  );

  await ensureTrainingItemPath(ctx, relativeDirectoryPath, "folder");
  const item = await ensureTrainingItemPath(ctx, markdownRelativePath, "file");
  if (!item?.id) {
    throw new Error(`No se pudo registrar el markdown del concepto: ${markdownRelativePath}`);
  }

  const existingConcept = await repositories.concepts.findByItemId(String(item.id));
  const concept = existingConcept || await repositories.concepts.create({
    title,
    slug,
    itemId: String(item.id),
    summary: payload.summary ?? null,
  });

  return {
    concept,
    item,
  };
}

function deleteTrainingSearchDocument(sqlite: any, documentId: string) {
  sqlite.prepare("DELETE FROM search_documents_fts WHERE document_id = ?").run(documentId);
  sqlite.prepare("DELETE FROM search_documents WHERE id = ?").run(documentId);
}

function upsertTrainingSearchDocument(sqlite: any, payload: {
  id: string;
  entityRefId: string;
  kind: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  metadata: unknown;
}) {
  const timestamp = nowIso();
  const row = {
    id: payload.id,
    item_id: null,
    entity_ref_id: payload.entityRefId,
    kind: payload.kind,
    title: payload.title,
    subtitle: payload.subtitle,
    path: null,
    body: payload.body,
    source_hash: null,
    indexed_at: timestamp,
    metadata: JSON.stringify(payload.metadata ?? {}),
  };

  sqlite.prepare("DELETE FROM search_documents_fts WHERE document_id = ?").run(row.id);
  sqlite.prepare("DELETE FROM search_documents WHERE id = ?").run(row.id);
  sqlite.prepare(`
    INSERT INTO search_documents (
      id, item_id, entity_ref_id, kind, title, subtitle, path, body, source_hash, indexed_at, metadata
    ) VALUES (
      @id, @item_id, @entity_ref_id, @kind, @title, @subtitle, @path, @body, @source_hash, @indexed_at, @metadata
    )
  `).run(row);
  sqlite.prepare(`
    INSERT INTO search_documents_fts (document_id, title, subtitle, body)
    VALUES (?, ?, ?, ?)
  `).run(row.id, row.title, row.subtitle || "", row.body || "");
}

function findTrainingExerciseBySlugSync(sqlite: any, slug: string) {
  return sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
  `).get(slug) ?? null;
}

function findTrainingExerciseByTemplateKeySync(sqlite: any, templateKey: string) {
  return sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE template_key = ?
      AND status = 'active'
    LIMIT 1
  `).get(templateKey) ?? null;
}

function findTrainingExerciseByTitleExactSync(sqlite: any, title: string) {
  return sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE title = ? COLLATE NOCASE
      AND status = 'active'
    ORDER BY title COLLATE NOCASE ASC, title ASC
    LIMIT 1
  `).get(title) ?? null;
}

function findTrainingRoutineByTitleExactSync(sqlite: any, title: string) {
  return sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE title = ? COLLATE NOCASE
      AND status = 'active'
    ORDER BY title COLLATE NOCASE ASC, title ASC
    LIMIT 1
  `).get(title) ?? null;
}

function findTrainingMuscleByTitleSync(title: unknown) {
  const normalizedTitle = normalizeOptionalText(title);
  if (!normalizedTitle) {
    return null;
  }

  return TRAINING_MUSCLE_CATALOG.find((entry) => entry.title.localeCompare(normalizedTitle, undefined, { sensitivity: "accent" }) === 0)
    || TRAINING_MUSCLE_CATALOG.find((entry) => normalizeTrainingSlug(entry.title, "muscle") === normalizeTrainingSlug(normalizedTitle, "muscle"))
    || null;
}

function findTrainingRoutineBySlugSync(sqlite: any, slug: string) {
  return sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
  `).get(slug) ?? null;
}

function listLegacyExerciseMusclesSync(sqlite: any, entityRefId: string) {
  return sqlite.prepare(`
    SELECT
      c.title AS concept_title,
      c.slug AS concept_slug
    FROM relations r
    LEFT JOIN concepts c ON c.entity_ref_id = r.to_entity_ref_id
    WHERE r.from_entity_ref_id = ?
      AND r.source = 'training'
      AND r.type = 'targets'
      AND r.status = 'active'
    ORDER BY r.created_at ASC
  `).all(entityRefId).map((row: any) => ({
    title: String(row?.concept_title || "").trim(),
    slug: String(row?.concept_slug || "").trim(),
    load: 5,
  })).filter((entry: any) => entry.title || entry.slug);
}

function normalizeLegacyExerciseMetadataMuscles(rawMuscles: unknown) {
  if (!Array.isArray(rawMuscles)) {
    return [];
  }

  return rawMuscles.map((entry: any) => {
    const source = entry && typeof entry === "object" ? entry : { title: entry };
    if (source.percentage != null || source.load != null) {
      return source;
    }

    return {
      ...source,
      load: 5,
    };
  }).filter((entry: any) => (
    normalizeOptionalText(entry?.title)
      || normalizeOptionalText(entry?.name)
      || normalizeOptionalText(entry?.slug)
      || normalizeOptionalText(entry?.muscleId)
      || normalizeOptionalText(entry?.id)
  ));
}

function findLegacyExerciseSearchDocumentSync(sqlite: any, entityRefId: string) {
  return sqlite.prepare(`
    SELECT id, title, subtitle, body, metadata
    FROM search_documents
    WHERE entity_ref_id = ?
      AND id LIKE 'nexus.training:exercise:%'
    ORDER BY indexed_at DESC
    LIMIT 1
  `).get(entityRefId) ?? null;
}

function normalizeExerciseRecord(ctx: NexusBackendPluginContext, row: any): TrainingExerciseRecord | null {
  if (!row?.id) {
    return null;
  }

  const sqlite = getSqlite(ctx);
  const measurement = parseRowJson<Record<string, unknown>>(row.measurement_json, {});
  const storedMuscleLoads = parseRowJson<any[]>(row.muscle_loads_json, []);
  const storedWarnings = parseRowJson<any[]>(row.legacy_muscle_warnings_json, []);
  const exerciseType = normalizeTrainingExerciseType(row.exercise_type);
  const measurementCategory = normalizeTrainingMeasurementCategory(row.measurement_category);
  const fallbackLegacyMuscles = !storedMuscleLoads.length
    ? listLegacyExerciseMusclesSync(sqlite, String(row.entity_ref_id))
    : [];
  const fallbackLegacyData = fallbackLegacyMuscles.length
    ? normalizeTrainingMuscleLoads(fallbackLegacyMuscles, { includeWarnings: true })
    : { muscleLoads: [], warnings: [] };
  const muscleLoads = storedMuscleLoads.length
    ? normalizeTrainingMuscleLoads(storedMuscleLoads)
    : fallbackLegacyData.muscleLoads;
  const tags = normalizeTrainingExerciseTags(parseRowJson<any[]>(row.tags_json, []), {
    measurementCategory,
  });
  const legacyWarnings = storedWarnings.length
    ? storedWarnings
    : fallbackLegacyData.warnings;

  return {
    id: String(row.id),
    entityRefId: String(row.entity_ref_id),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    notes: row.notes == null ? null : String(row.notes),
    exerciseType,
    measurementCategory,
    tags,
    measurement,
    muscleLoads,
    legacyWarnings,
    templateKey: normalizeOptionalText(row.template_key),
    personalDifficultyScore: normalizeOptionalNumber(row.personal_difficulty_score),
    isStarter: Boolean(getTrainingStarterExerciseDefinition(row.template_key)),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    searchSummary: buildTrainingExerciseSummary({
      exerciseType,
      measurementCategory,
      tags,
      measurement,
      muscleLoads,
    }),
    doc: getTrainingDocRecordByConceptIdSync(ctx, row.concept_id)
      || findTrainingExistingExerciseDocRecordSync(ctx, {
        title: String(row.title || "").trim(),
        slug: String(row.slug || "").trim(),
        summary: row.summary == null ? null : String(row.summary),
      }),
  };
}

function listTrainingExercisesSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE status = 'active'
    ORDER BY title COLLATE NOCASE ASC, title ASC
  `).all() as any[];

  return rows
    .map((row) => normalizeExerciseRecord(ctx, row))
    .filter((exercise): exercise is TrainingExerciseRecord => Boolean(exercise));
}

function migrateLegacySearchExercisesSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const legacyRows = sqlite.prepare(`
    SELECT er.id AS entity_ref_id, er.created_at, er.updated_at
    FROM entity_refs er
    LEFT JOIN training_exercises te ON te.entity_ref_id = er.id
    WHERE er.kind = ?
      AND er.status = 'active'
      AND te.id IS NULL
    ORDER BY er.created_at ASC
  `).all(TRAINING_EXERCISE_KIND) as any[];

  for (const legacyRow of legacyRows) {
    const legacyDocument = findLegacyExerciseSearchDocumentSync(sqlite, String(legacyRow.entity_ref_id));
    if (!legacyDocument) {
      continue;
    }

    const title = normalizeOptionalText(legacyDocument.title);
    if (!title) {
      continue;
    }

    const metadata = parseRowJson<Record<string, any>>(legacyDocument.metadata, {});
    const metadataMuscles = normalizeLegacyExerciseMetadataMuscles(metadata?.muscles);
    const rawLegacyMuscles = metadataMuscles.length
      ? metadataMuscles
      : listLegacyExerciseMusclesSync(sqlite, String(legacyRow.entity_ref_id));
    const normalizedLegacyMuscles = normalizeTrainingMuscleLoads(rawLegacyMuscles, { includeWarnings: true });
    const measurement = normalizeTrainingMeasurement(metadata?.measurement);
    const summary = normalizeOptionalText(metadata?.summary || legacyDocument.subtitle);
    const notes = normalizeOptionalText(metadata?.notes);
    const exerciseType = normalizeTrainingExerciseType(metadata?.exerciseType);
    const measurementCategory = normalizeTrainingMeasurementCategory(metadata?.measurementCategory);
    const exerciseId = normalizeOptionalText(metadata?.exerciseId)
      || normalizeOptionalText(metadata?.id)
      || randomUUID();
    const slug = allocateUniqueSlugSync(
      normalizeTrainingSlug(metadata?.slug || title, "exercise"),
      (nextSlug) => findTrainingExerciseBySlugSync(sqlite, nextSlug),
    );
    const timestamp = nowIso();

    sqlite.prepare(`
      INSERT INTO training_exercises (
        id, entity_ref_id, template_key, title, slug, summary, notes, exercise_type, measurement_category, tags_json,
        measurement_json, muscle_loads_json, legacy_muscle_warnings_json, personal_difficulty_score, status, created_at, updated_at
      ) VALUES (
        @id, @entity_ref_id, @template_key, @title, @slug, @summary, @notes, @exercise_type, @measurement_category, @tags_json,
        @measurement_json, @muscle_loads_json, @legacy_muscle_warnings_json, @personal_difficulty_score, @status, @created_at, @updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        entity_ref_id = excluded.entity_ref_id,
        template_key = excluded.template_key,
        title = excluded.title,
        slug = excluded.slug,
        summary = excluded.summary,
        notes = excluded.notes,
        exercise_type = excluded.exercise_type,
        measurement_category = excluded.measurement_category,
        tags_json = excluded.tags_json,
        measurement_json = excluded.measurement_json,
        muscle_loads_json = excluded.muscle_loads_json,
        legacy_muscle_warnings_json = excluded.legacy_muscle_warnings_json,
        personal_difficulty_score = excluded.personal_difficulty_score,
        status = excluded.status,
        updated_at = excluded.updated_at
    `).run({
      id: exerciseId,
      entity_ref_id: String(legacyRow.entity_ref_id),
      template_key: null,
      title,
      slug,
      summary,
      notes,
      exercise_type: exerciseType,
      measurement_category: measurementCategory,
      tags_json: JSON.stringify([]),
      measurement_json: JSON.stringify(measurement || {}),
      muscle_loads_json: JSON.stringify(normalizedLegacyMuscles.muscleLoads || []),
      legacy_muscle_warnings_json: JSON.stringify(normalizedLegacyMuscles.warnings || []),
      personal_difficulty_score: null,
      status: "active",
      created_at: String(legacyRow.created_at || timestamp),
      updated_at: String(legacyRow.updated_at || legacyRow.created_at || timestamp),
    });

    const savedRow = sqlite.prepare(`
      SELECT *
      FROM training_exercises
      WHERE entity_ref_id = ?
      LIMIT 1
    `).get(String(legacyRow.entity_ref_id));
    const savedExercise = savedRow ? normalizeExerciseRecord(ctx, savedRow) : null;

    if (!savedExercise) {
      continue;
    }

    upsertTrainingSearchDocument(sqlite, {
      id: getTrainingSearchDocumentId("exercise", savedExercise.id),
      entityRefId: savedExercise.entityRefId,
      kind: "concept",
      title: savedExercise.title,
      subtitle: savedExercise.searchSummary || savedExercise.summary,
      body: [
        savedExercise.summary,
        savedExercise.notes,
        savedExercise.searchSummary ? `Musculos: ${savedExercise.searchSummary}` : null,
      ].filter(Boolean).join("\n\n"),
      metadata: {
        pluginId: TRAINING_PLUGIN_ID,
        domain: "training",
        type: "exercise",
        exerciseId: savedExercise.id,
        exerciseType: savedExercise.exerciseType,
        measurementCategory: savedExercise.measurementCategory,
        tags: savedExercise.tags,
        measurement: savedExercise.measurement,
        muscleLoads: savedExercise.muscleLoads,
        templateKey: savedExercise.templateKey,
        personalDifficultyScore: savedExercise.personalDifficultyScore,
      },
    });
  }
}

function listLegacyRoutineStepsSync(ctx: NexusBackendPluginContext, routineId: string) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT s.*, e.title AS exercise_title, e.slug AS exercise_slug, e.measurement_json AS exercise_measurement_json
    FROM training_routine_steps s
    LEFT JOIN training_exercises e ON e.id = s.exercise_id
    WHERE s.routine_id = ?
    ORDER BY s.sort_order ASC, s.created_at ASC
  `).all(routineId) as any[];
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));

  return rows.map((row) => ({
    id: String(row.id),
    kind: String(row.kind || "exercise").trim().toLowerCase() === "rest" ? "rest" : "exercise",
    exerciseId: row.exercise_id == null ? null : String(row.exercise_id),
    exerciseTitleSnapshot: row.exercise_title_snapshot == null
      ? row.exercise_title == null ? null : String(row.exercise_title)
      : String(row.exercise_title_snapshot),
    exerciseMeasurementSnapshot: parseRowJson<Record<string, unknown>>(
      row.exercise_measurement_snapshot_json || row.exercise_measurement_json,
      {},
    ),
    prescription: normalizeTrainingPrescription(row.prescription_json),
    resolvedExercise: row.exercise_id ? exerciseLookup.get(String(row.exercise_id)) || null : null,
  }));
}

function normalizeRoutineRecord(ctx: NexusBackendPluginContext, row: any): TrainingRoutineRecord | null {
  if (!row?.id) {
    return null;
  }

  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const storedStructure = parseRowJson<any[]>(row.structure_json, []);
  const structure = storedStructure.length
    ? normalizeTrainingStructure(storedStructure, exerciseLookup)
    : migrateLegacyTrainingSteps(listLegacyRoutineStepsSync(ctx, String(row.id)), exerciseLookup);
  const lookup = Object.fromEntries(
    [...exerciseLookup.entries()].map(([id, exercise]) => [id, exercise]),
  );

  return {
    id: String(row.id),
    entityRefId: String(row.entity_ref_id),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    notes: row.notes == null ? null : String(row.notes),
    structure,
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    searchSummary: buildTrainingRoutineSummary({ structure }, lookup),
  };
}

function listTrainingRoutinesSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE status = 'active'
    ORDER BY title COLLATE NOCASE ASC, title ASC
  `).all() as any[];

  return rows
    .map((row) => normalizeRoutineRecord(ctx, row))
    .filter((routine): routine is TrainingRoutineRecord => Boolean(routine));
}

function normalizeAssignmentRecord(ctx: NexusBackendPluginContext, row: any, routineLookup: Map<string, TrainingRoutineRecord>): TrainingRoutineAssignmentRecord | null {
  if (!row?.id) {
    return null;
  }

  const routineId = String(row.routine_id || "");
  const routine = routineLookup.get(routineId) || null;

  return {
    id: String(row.id),
    routineId,
    scheduleType: String(row.schedule_type || "daily").trim().toLowerCase() === "weekdays" ? "weekdays" : "daily",
    scheduleConfigJson: parseRowJson<Record<string, unknown>>(row.schedule_config_json, {}),
    startDate: normalizeLocalDate(row.start_date),
    endDate: row.end_date ? normalizeLocalDate(row.end_date, normalizeLocalDate(row.start_date)) : null,
    time: normalizeTimeValue(row.time),
    priority: Math.max(1, Math.round(Number(row.priority || 1)) || 1),
    status: String(row.status || "").trim().toLowerCase() === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(row.completion_mode),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    routine,
    searchSummary: [
      routine?.title || "Rutina",
      row.schedule_type === "weekdays" ? "Dias elegidos" : "Diaria",
      normalizeTrainingCompletionMode(row.completion_mode) === "detailed" ? "Carga detallada" : "Si/No",
    ].join(" - "),
  };
}

function listTrainingAssignmentsSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const routines = listTrainingRoutinesSync(ctx);
  const routineLookup = new Map(routines.map((routine) => [routine.id, routine]));
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_routine_assignments
    ORDER BY updated_at DESC, created_at DESC
  `).all() as any[];

  return rows
    .map((row) => normalizeAssignmentRecord(ctx, row, routineLookup))
    .filter((assignment): assignment is TrainingRoutineAssignmentRecord => Boolean(assignment));
}

function findTrainingExerciseRecordByTitleSync(ctx: NexusBackendPluginContext, title: unknown) {
  const normalizedTitle = normalizeOptionalText(title);
  if (!normalizedTitle) {
    return null;
  }

  const normalizedSlug = normalizeTrainingSlug(normalizedTitle, "exercise");
  return listTrainingExercisesSync(ctx).find((exercise) => (
    normalizeTrainingSlug(exercise.title, "exercise") === normalizedSlug
  )) || null;
}

function findTrainingRoutineRecordByTitleSync(ctx: NexusBackendPluginContext, title: unknown) {
  const normalizedTitle = normalizeOptionalText(title);
  if (!normalizedTitle) {
    return null;
  }

  const normalizedSlug = normalizeTrainingSlug(normalizedTitle, "routine");
  return listTrainingRoutinesSync(ctx).find((routine) => (
    normalizeTrainingSlug(routine.title, "routine") === normalizedSlug
  )) || null;
}

function listTrainingOccurrencesSync(sqlite: any) {
  const rows = sqlite.prepare(`
    SELECT *
    FROM training_routine_occurrences
    ORDER BY occurrence_date DESC, updated_at DESC
  `).all() as any[];

  return rows.map((row) => ({
    id: String(row.id),
    assignmentId: String(row.assignment_id),
    occurrenceDate: normalizeLocalDate(row.occurrence_date),
    windowStartAt: String(row.window_start_at || getOccurrenceWindowStartAt(normalizeLocalDate(row.occurrence_date))),
    windowEndAt: String(row.window_end_at || getOccurrenceWindowEndAt(normalizeLocalDate(row.occurrence_date))),
    status: String(row.status || "").trim().toLowerCase() === "failed" ? "failed" : "completed",
    resultJson: parseRowJson<Record<string, unknown>>(row.result_json, {}),
    completedAt: row.completed_at == null ? null : String(row.completed_at),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
  } satisfies TrainingRoutineOccurrenceRecord));
}

function findTrainingMuscleConceptBindingSync(sqlite: any, muscleId: string) {
  return sqlite.prepare(`
    SELECT concept_id
    FROM training_muscle_concepts
    WHERE muscle_id = ?
    LIMIT 1
  `).get(muscleId) ?? null;
}

function upsertTrainingMuscleConceptBindingSync(sqlite: any, muscleId: string, conceptId: string) {
  const timestamp = nowIso();
  sqlite.prepare(`
    INSERT INTO training_muscle_concepts (
      muscle_id, concept_id, created_at, updated_at
    ) VALUES (
      @muscle_id, @concept_id, @created_at, @updated_at
    )
    ON CONFLICT(muscle_id) DO UPDATE SET
      concept_id = excluded.concept_id,
      updated_at = excluded.updated_at
  `).run({
    muscle_id: muscleId,
    concept_id: conceptId,
    created_at: timestamp,
    updated_at: timestamp,
  });
}

function getTrainingSystemStateValueSync(sqlite: any, stateKey: string) {
  const row = sqlite.prepare(`
    SELECT state_value
    FROM training_system_state
    WHERE state_key = ?
    LIMIT 1
  `).get(stateKey);

  return row?.state_value == null ? null : String(row.state_value);
}

function setTrainingSystemStateValueSync(sqlite: any, stateKey: string, stateValue: string) {
  const timestamp = nowIso();
  sqlite.prepare(`
    INSERT INTO training_system_state (
      state_key, state_value, created_at, updated_at
    ) VALUES (
      @state_key, @state_value, @created_at, @updated_at
    )
    ON CONFLICT(state_key) DO UPDATE SET
      state_value = excluded.state_value,
      updated_at = excluded.updated_at
  `).run({
    state_key: stateKey,
    state_value: stateValue,
    created_at: timestamp,
    updated_at: timestamp,
  });
}

function buildTrainingFolderNoteContent({
  title,
  summary,
  kind,
}: {
  title: string;
  summary: string;
  kind: "muscle" | "exercise";
}) {
  return buildMarkdownDocumentWithFrontmatter({
    frontmatter: {
      nexus: {
        defaultView: "read",
        folderView: "gallery",
        card: {
          title,
          summary,
        },
      },
      fitness: {
        domain: "training",
        kind,
      },
    },
    body: `# ${title}\n\n${summary}`,
  });
}

export function buildTrainingManagedDocAssets() {
  const assets = [
    {
      relativePath: `${TRAINING_MUSCLE_CONCEPTS_DIRECTORY}/${getTrainingFolderNoteFileName(TRAINING_MUSCLE_CONCEPTS_DIRECTORY)}`,
      content: buildTrainingFolderNoteContent({
        title: "Musculos",
        summary: "Galeria de notas anatomicas del catalogo canonico de entrenamiento.",
        kind: "muscle",
      }),
    },
    {
      relativePath: `${TRAINING_EXERCISE_CONCEPTS_DIRECTORY}/${getTrainingFolderNoteFileName(TRAINING_EXERCISE_CONCEPTS_DIRECTORY)}`,
      content: buildTrainingFolderNoteContent({
        title: "Ejercicios",
        summary: "Galeria de notas de ejercicios y tecnica de entrenamiento.",
        kind: "exercise",
      }),
    },
    ...TRAINING_MUSCLE_CATALOG.map((muscle) => ({
      relativePath: getTrainingMuscleConceptPreferredRelativePath(muscle),
      content: buildTrainingConceptMarkdownContent(
        muscle.title,
        muscle.id,
        buildTrainingMuscleConceptPayload(muscle),
      ),
    })),
    ...TRAINING_STARTER_EXERCISES.map((definition) => ({
      relativePath: getTrainingExerciseConceptPreferredRelativePath({
        title: definition.title,
        slug: normalizeTrainingSlug(definition.title, "exercise"),
      }),
      content: buildTrainingConceptMarkdownContent(
        definition.title,
        definition.title,
        buildTrainingStarterExerciseConceptPayload(
          definition,
          TRAINING_STARTER_EXERCISE_ID_TOKEN,
        ),
      ),
    })),
  ];

  return assets.map((asset) => ({
    relativePath: normalizeRelativeContentPath(asset.relativePath),
    content: asset.content,
  }));
}

async function copyTrainingManagedDocAssets(ctx: NexusBackendPluginContext) {
  if (!existsSync(TRAINING_MANAGED_DOCS_ASSET_DIRECTORY)) {
    return false;
  }

  const assetEntries = await fs.readdir(TRAINING_MANAGED_DOCS_ASSET_DIRECTORY, {
    withFileTypes: true,
  });

  await Promise.all(assetEntries.map((entry) => fs.cp(
    path.join(TRAINING_MANAGED_DOCS_ASSET_DIRECTORY, entry.name),
    path.join(ctx.vault.contentPath, entry.name),
    { recursive: entry.isDirectory(), force: true },
  )));

  return true;
}

function getTrainingFolderNoteLegacyFileNames(directoryRelativePath: string) {
  const normalizedDirectoryPath = normalizeRelativeContentPath(directoryRelativePath);
  const baseNames = [TRAINING_LEGACY_FOLDER_NOTE_FILE_NAME];

  if (normalizedDirectoryPath === TRAINING_EXERCISE_CONCEPTS_DIRECTORY) {
    baseNames.push("Excercises.md");
  }

  return [...new Set(baseNames)];
}

function getTrainingFolderNoteFileName(directoryRelativePath: string) {
  const segments = normalizeRelativeContentPath(directoryRelativePath).split("/").filter(Boolean);
  const baseName = segments[segments.length - 1] || "Folder";
  return `${baseName}.md`;
}

async function doesTrainingPathExist(absolutePath: string) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureTrainingMarkdownItem(
  ctx: NexusBackendPluginContext,
  relativePath: string,
) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return null;
  }

  const absolutePath = resolveAbsoluteContentPath(ctx, normalizedRelativePath);
  if (!(await doesTrainingPathExist(absolutePath))) {
    return null;
  }

  await ensureTrainingItemPath(ctx, path.dirname(normalizedRelativePath), "folder");
  const item = await ensureTrainingItemPath(ctx, normalizedRelativePath, "file");
  if (!item?.id) {
    return null;
  }

  pruneTrainingItemRowsByPathSync(getSqlite(ctx), normalizedRelativePath, "file", String(item.id));
  return findTrainingItemByRelativePath(ctx, normalizedRelativePath, "file");
}

async function renameTrainingMarkdownItemPath(
  ctx: NexusBackendPluginContext,
  currentRelativePath: string,
  nextRelativePath: string,
  itemId: string | null = null,
  { replaceExisting = false }: { replaceExisting?: boolean } = {},
) {
  const normalizedCurrentRelativePath = normalizeRelativeContentPath(currentRelativePath);
  const normalizedNextRelativePath = normalizeRelativeContentPath(nextRelativePath);
  const normalizedItemId = normalizeOptionalText(itemId);
  if (!normalizedCurrentRelativePath || !normalizedNextRelativePath) {
    return null;
  }

  if (normalizedCurrentRelativePath === normalizedNextRelativePath) {
    return ensureTrainingMarkdownItem(ctx, normalizedNextRelativePath);
  }

  const currentAbsolutePath = resolveAbsoluteContentPath(ctx, normalizedCurrentRelativePath);
  const nextAbsolutePath = resolveAbsoluteContentPath(ctx, normalizedNextRelativePath);
  if (!currentAbsolutePath || !nextAbsolutePath) {
    return null;
  }

  if (!(await doesTrainingPathExist(currentAbsolutePath))) {
    return ensureTrainingMarkdownItem(ctx, normalizedNextRelativePath);
  }

  if (await doesTrainingPathExist(nextAbsolutePath) && !replaceExisting) {
    return ensureTrainingMarkdownItem(ctx, normalizedCurrentRelativePath);
  }

  const repositories = getRepositories(ctx);
  const currentItem = normalizedItemId
    ? await repositories.items.findById(normalizedItemId)
    : await findTrainingItemByRelativePath(ctx, normalizedCurrentRelativePath, "file");

  if (replaceExisting && await doesTrainingPathExist(nextAbsolutePath)) {
    await fs.rm(nextAbsolutePath, { force: true });
  }

  await fs.mkdir(path.dirname(nextAbsolutePath), { recursive: true });
  await fs.rename(currentAbsolutePath, nextAbsolutePath);

  if (currentItem?.id) {
    await repositories.items.updateById(String(currentItem.id), {
      name: path.basename(normalizedNextRelativePath),
      path: normalizedNextRelativePath,
      relative_path: normalizedNextRelativePath,
      extension: path.extname(normalizedNextRelativePath).replace(/^\./, "") || null,
    });
  }

  if (!normalizedItemId) {
    deleteTrainingItemRowsByPathSync(getSqlite(ctx), normalizedCurrentRelativePath);
  }

  return ensureTrainingMarkdownItem(ctx, normalizedNextRelativePath);
}

function findTrainingExistingMuscleDocRecordSync(
  ctx: NexusBackendPluginContext,
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  const fallbackSummary = `${muscle.groupTitle} - ${muscle.regionTitle}`;
  const candidateRelativePaths = [
    getTrainingMuscleConceptPreferredRelativePath(muscle),
    ...getTrainingMuscleConceptLegacyRelativePaths(muscle),
  ];

  for (const relativePath of candidateRelativePaths) {
    const doc = findTrainingDocRecordByRelativePathSync(
      ctx,
      relativePath,
      muscle.title,
      fallbackSummary,
    );
    if (doc) {
      return doc;
    }
  }

  return null;
}

function findTrainingExistingExerciseDocRecordSync(
  ctx: NexusBackendPluginContext,
  exercise: Pick<TrainingExerciseRecord, "title" | "slug" | "summary">,
) {
  const candidateRelativePaths = [
    getTrainingExerciseConceptPreferredRelativePath(exercise),
    ...getTrainingExerciseConceptLegacyRelativePaths(exercise),
  ];

  for (const relativePath of candidateRelativePaths) {
    const doc = findTrainingDocRecordByRelativePathSync(
      ctx,
      relativePath,
      exercise.title,
      exercise.summary ?? null,
    );
    if (doc) {
      return doc;
    }
  }

  return null;
}

async function ensureTrainingConceptForItem(
  ctx: NexusBackendPluginContext,
  payload: {
    itemId: string;
    title: string;
    slug: string;
    summary: string | null;
  },
) {
  const repositories = getRepositories(ctx);
  const existingConcept = await repositories.concepts.findByItemId(String(payload.itemId));
  if (existingConcept) {
    return existingConcept;
  }

  const conceptSlug = await allocateUniqueSlug(
    normalizeTrainingSlug(payload.slug || payload.title, "concept"),
    (nextSlug) => repositories.concepts.findBySlug(nextSlug),
  );

  return repositories.concepts.create({
    title: payload.title,
    slug: conceptSlug,
    itemId: String(payload.itemId),
    summary: payload.summary,
  });
}

function findTrainingDocRecordByRelativePathSync(
  ctx: NexusBackendPluginContext,
  relativePath: string,
  fallbackTitle: string,
  fallbackSummary: string | null = null,
) {
  const sqlite = getSqlite(ctx);
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  if (!normalizedRelativePath) {
    return null;
  }

  pruneMissingTrainingItemRowsByPathSync(ctx, normalizedRelativePath);
  const itemRow = selectTrainingItemRowsByPathSync(sqlite, normalizedRelativePath)
    .find((row) => String(row.type) === "file") || null;
  if (!itemRow?.id) {
    return null;
  }

  const conceptRow = sqlite.prepare(`
    SELECT c.id AS concept_id, c.title, c.summary, i.path AS item_path, c.item_id
    FROM concepts c
    LEFT JOIN items i ON i.id = c.item_id
    WHERE c.item_id = ?
    LIMIT 1
  `).get(String(itemRow.id)) ?? null;

  const itemPath = resolveAbsoluteContentPath(ctx, normalizedRelativePath);
  if (!itemPath || !existsSync(itemPath)) {
    return null;
  }

  return {
    conceptId: conceptRow?.concept_id ? String(conceptRow.concept_id) : `item:${itemRow.id}`,
    itemId: String(itemRow.id),
    itemPath,
    relativePath: normalizedRelativePath,
    title: String(conceptRow?.title || fallbackTitle || "").trim(),
    summary: conceptRow?.summary == null ? fallbackSummary : String(conceptRow.summary),
    frontmatter: readFrontmatterFromMarkdownPath(itemPath),
  } satisfies TrainingDocRecord;
}

async function ensureTrainingFolderNote(
  ctx: NexusBackendPluginContext,
  {
    directoryRelativePath,
    title,
    summary,
    kind,
  }: {
    directoryRelativePath: string;
    title: string;
    summary: string;
    kind: "muscle" | "exercise";
  },
) {
  const repositories = getRepositories(ctx);
  const sqlite = getSqlite(ctx);
  const folderAbsolutePath = resolveAbsoluteContentPath(ctx, directoryRelativePath);
  const folderRelativePath = normalizeRelativeContentPath(directoryRelativePath);
  const folderNoteFileName = getTrainingFolderNoteFileName(folderRelativePath);
  const folderNoteRelativePath = normalizeRelativeContentPath(
    folderRelativePath
      ? `${folderRelativePath}/${folderNoteFileName}`
      : folderNoteFileName,
  );
  const folderNoteAbsolutePath = path.join(folderAbsolutePath, folderNoteFileName);
  const legacyFileNames = getTrainingFolderNoteLegacyFileNames(folderRelativePath)
    .filter((fileName) => normalizeRelativeContentPath(fileName) !== folderNoteFileName);
  const legacyEntries = legacyFileNames.map((fileName) => ({
    fileName,
    relativePath: normalizeRelativeContentPath(
      folderRelativePath
        ? `${folderRelativePath}/${fileName}`
        : fileName,
    ),
    absolutePath: path.join(folderAbsolutePath, fileName),
  }));

  await fs.mkdir(folderAbsolutePath, { recursive: true });

  if (!(await doesTrainingPathExist(folderNoteAbsolutePath))) {
    let migratedLegacyFile = false;

    for (const legacyEntry of legacyEntries) {
      if (!(await doesTrainingPathExist(legacyEntry.absolutePath))) {
        continue;
      }

      await fs.rename(legacyEntry.absolutePath, folderNoteAbsolutePath);
      migratedLegacyFile = true;
      break;
    }

    if (!migratedLegacyFile) {
      await fs.writeFile(
        folderNoteAbsolutePath,
        buildTrainingFolderNoteContent({ title, summary, kind }),
        { flag: "wx" },
      );
    }
  }

  for (const legacyEntry of legacyEntries) {
    if (!(await doesTrainingPathExist(legacyEntry.absolutePath))) {
      deleteTrainingItemRowsByPathSync(sqlite, legacyEntry.relativePath);
      continue;
    }

    const legacyStats = await fs.stat(legacyEntry.absolutePath);
    if (legacyStats.size <= 0) {
      await fs.unlink(legacyEntry.absolutePath);
      deleteTrainingItemRowsByPathSync(sqlite, legacyEntry.relativePath);
    }
  }

  await ensureTrainingItemPath(ctx, folderRelativePath, "folder");
  for (const legacyEntry of legacyEntries) {
    const legacyFolderNoteItem = await findTrainingItemByRelativePath(ctx, legacyEntry.relativePath, "file");
    if (!legacyFolderNoteItem?.id) {
      continue;
    }

    await legacyFolderNoteItem.update({
      name: folderNoteFileName,
      path: folderNoteRelativePath,
      relative_path: folderNoteRelativePath,
      type: "file",
      extension: "md",
    });
    deleteTrainingItemRowsByPathSync(sqlite, legacyEntry.relativePath);
  }

  const folderNoteItem = await ensureTrainingItemPath(ctx, folderNoteRelativePath, "file");
  pruneTrainingItemRowsByPathSync(sqlite, folderNoteRelativePath, "file", folderNoteItem?.id ? String(folderNoteItem.id) : null);

  const folderItem = await findTrainingItemByRelativePath(ctx, folderRelativePath, "folder");
  if (!folderItem) {
    return null;
  }

  await folderItem.update({
    is_folder_with_note: true,
    folder_note_path: folderNoteRelativePath,
  });

  return folderItem;
}

async function ensureTrainingConceptFolders(ctx: NexusBackendPluginContext) {
  await ensureTrainingFolderNote(ctx, {
    directoryRelativePath: TRAINING_MUSCLE_CONCEPTS_DIRECTORY,
    title: "Musculos",
    summary: "Galeria de notas anatomicas del catalogo canonico de entrenamiento.",
    kind: "muscle",
  });
  await ensureTrainingFolderNote(ctx, {
    directoryRelativePath: TRAINING_EXERCISE_CONCEPTS_DIRECTORY,
    title: "Ejercicios",
    summary: "Galeria de notas de ejercicios y tecnica de entrenamiento.",
    kind: "exercise",
  });
}

function updateTrainingConceptRowSync(
  sqlite: any,
  conceptId: string,
  {
    itemId,
    title,
    summary,
  }: {
    itemId: string;
    title: string;
    summary: string | null;
  },
) {
  sqlite.prepare(`
    UPDATE concepts
    SET item_id = ?,
        title = ?,
        summary = ?,
        updated_at = ?
    WHERE id = ?
  `).run(itemId, title, summary, nowIso(), conceptId);
}

async function ensureTrainingManagedMarkdownItem(
  ctx: NexusBackendPluginContext,
  {
    relativePath,
    content,
    currentRelativePath = null,
    currentItemId = null,
  }: {
    relativePath: string;
    content: string;
    currentRelativePath?: string | null;
    currentItemId?: string | null;
  },
) {
  const normalizedRelativePath = normalizeRelativeContentPath(relativePath);
  const normalizedCurrentRelativePath = normalizeRelativeContentPath(currentRelativePath);
  const absolutePath = resolveAbsoluteContentPath(ctx, normalizedRelativePath);

  if (!normalizedRelativePath || !absolutePath) {
    throw new Error("La ruta del markdown gestionado no es valida.");
  }

  if (
    normalizedCurrentRelativePath
    && normalizedCurrentRelativePath !== normalizedRelativePath
  ) {
    const currentAbsolutePath = resolveAbsoluteContentPath(ctx, normalizedCurrentRelativePath);
    if (
      currentAbsolutePath
      && await doesTrainingPathExist(currentAbsolutePath)
      && !(await doesTrainingPathExist(absolutePath))
    ) {
      await renameTrainingMarkdownItemPath(
        ctx,
        normalizedCurrentRelativePath,
        normalizedRelativePath,
        currentItemId,
      );
    }
  }

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");
  await ensureTrainingItemPath(ctx, path.dirname(normalizedRelativePath), "folder");
  const item = await ensureTrainingItemPath(ctx, normalizedRelativePath, "file");
  pruneTrainingItemRowsByPathSync(getSqlite(ctx), normalizedRelativePath, "file", item?.id ? String(item.id) : null);
  return item;
}

async function ensureTrainingManagedConceptDoc(
  ctx: NexusBackendPluginContext,
  {
    relativePath,
    currentRelativePath = null,
    currentItemId = null,
    currentConceptId = null,
    title,
    slug,
    summary,
    content,
  }: {
    relativePath: string;
    currentRelativePath?: string | null;
    currentItemId?: string | null;
    currentConceptId?: string | null;
    title: string;
    slug: string;
    summary: string | null;
    content: string;
  },
) {
  const item = await ensureTrainingManagedMarkdownItem(ctx, {
    relativePath,
    content,
    currentRelativePath,
    currentItemId,
  });

  if (!item?.id) {
    throw new Error(`No se pudo registrar la nota gestionada: ${relativePath}`);
  }

  const sqlite = getSqlite(ctx);
  const conceptId = normalizeOptionalText(currentConceptId);
  if (conceptId) {
    updateTrainingConceptRowSync(sqlite, conceptId, {
      itemId: String(item.id),
      title,
      summary,
    });
    return getTrainingDocRecordByConceptIdSync(ctx, conceptId);
  }

  const concept = await ensureTrainingConceptForItem(ctx, {
    itemId: String(item.id),
    title,
    slug,
    summary,
  });
  return getTrainingDocRecordByConceptIdSync(ctx, String(concept.id));
}

function upsertTrainingExerciseSearchDocument(sqlite: any, exercise: TrainingExerciseRecord) {
  const taxonomySummary = [
    buildTrainingExerciseTypeSummary(exercise.exerciseType),
    buildTrainingMeasurementCategorySummary(exercise.measurementCategory),
    buildTrainingExerciseTagSummary(exercise.tags, {
      measurementCategory: exercise.measurementCategory,
      omitMeasurementCategory: true,
    }),
  ].filter(Boolean).join(" - ");

  upsertTrainingSearchDocument(sqlite, {
    id: getTrainingSearchDocumentId("exercise", exercise.id),
    entityRefId: exercise.entityRefId,
    kind: "concept",
    title: exercise.title,
    subtitle: exercise.searchSummary || exercise.summary,
    body: [
      exercise.summary,
      exercise.notes,
      taxonomySummary ? `Taxonomia: ${taxonomySummary}` : null,
      exercise.searchSummary ? `Resumen: ${exercise.searchSummary}` : null,
    ].filter(Boolean).join("\n\n"),
    metadata: {
      pluginId: TRAINING_PLUGIN_ID,
      domain: "training",
      type: "exercise",
      exerciseId: exercise.id,
      exerciseType: exercise.exerciseType,
      measurementCategory: exercise.measurementCategory,
      tags: exercise.tags,
      measurement: exercise.measurement,
      muscleLoads: exercise.muscleLoads,
      templateKey: exercise.templateKey,
      personalDifficultyScore: exercise.personalDifficultyScore,
      isStarter: exercise.isStarter,
    },
  });
}

async function ensureTrainingMuscleConcept(
  ctx: NexusBackendPluginContext,
  muscleId: string,
  { ensureFolders = true }: { ensureFolders?: boolean } = {},
) {
  const normalizedMuscleId = normalizeOptionalText(muscleId);
  if (!normalizedMuscleId) {
    throw new Error("Falta el id del musculo.");
  }

  const sqlite = getSqlite(ctx);
  const muscle = TRAINING_MUSCLE_CATALOG.find((entry) => entry.id === normalizedMuscleId) || null;
  if (!muscle) {
    throw new Error("No encontramos ese musculo canonico.");
  }

  const existingBinding = findTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId);
  const existingDoc = existingBinding?.concept_id
    ? getTrainingDocRecordByConceptIdSync(ctx, existingBinding.concept_id)
    : null;
  if (ensureFolders) {
    await ensureTrainingConceptFolders(ctx);
  }
  const preferredRelativePath = getTrainingMuscleConceptPreferredRelativePath(muscle);
  const legacyRelativePath = getTrainingMuscleConceptLegacyRelativePaths(muscle)[0] || null;

  if (existingDoc?.relativePath) {
    if (existingDoc.relativePath !== preferredRelativePath) {
      await renameTrainingMarkdownItemPath(
        ctx,
        existingDoc.relativePath,
        preferredRelativePath,
        existingDoc.itemId,
        { replaceExisting: true },
      );
      return getTrainingDocRecordByConceptIdSync(ctx, existingBinding?.concept_id);
    }

    return existingDoc;
  }

  const musclePayload = buildTrainingMuscleConceptPayload(muscle);
  let existingItem = await ensureTrainingMarkdownItem(ctx, preferredRelativePath);
  if (!existingItem && legacyRelativePath) {
    const legacyItem = await ensureTrainingMarkdownItem(ctx, legacyRelativePath);
    if (legacyItem) {
      existingItem = await renameTrainingMarkdownItemPath(
        ctx,
        legacyRelativePath,
        preferredRelativePath,
        String(legacyItem.id),
      );
    }
  }

  const concept = existingItem?.id
    ? await ensureTrainingConceptForItem(ctx, {
        itemId: String(existingItem.id),
        title: muscle.title,
        slug: muscle.id,
        summary: musclePayload.summary ?? null,
      })
    : (await createTrainingConceptNote(ctx, musclePayload)).concept;

  if (!concept?.id) {
    throw new Error("No se pudo crear la nota del musculo.");
  }

  upsertTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId, String(concept.id));
  return getTrainingDocRecordByConceptIdSync(ctx, String(concept.id));
}

async function ensureAllTrainingMuscleConcepts(ctx: NexusBackendPluginContext) {
  await ensureTrainingConceptFolders(ctx);
  const docs = [];

  for (const muscle of TRAINING_MUSCLE_CATALOG) {
    const doc = await ensureTrainingMuscleConcept(ctx, muscle.id, { ensureFolders: false });
    if (doc) {
      docs.push(doc);
    }
  }

  return docs;
}

function buildTrainingExerciseConceptPayloadFromRecord(
  exercise: TrainingExerciseRecord,
): TrainingConceptNotePayload {
  const starterDefinition = getTrainingStarterExerciseDefinition(exercise.templateKey);
  if (starterDefinition) {
    return buildTrainingStarterExerciseConceptPayload(starterDefinition, exercise.id);
  }

  const exerciseSummary = exercise.summary || exercise.searchSummary || "Documento de ejercicio.";
  return {
    title: exercise.title,
    slug: exercise.slug || exercise.title,
    fileBaseName: getTrainingExerciseConceptPreferredFileBaseName(exercise),
    relativeDirectoryPath: TRAINING_EXERCISE_CONCEPTS_DIRECTORY,
    templateId: "fitness-exercise",
    summary: exerciseSummary,
    frontmatter: {
      fitness: {
        domain: "training",
        kind: "exercise",
        targetId: exercise.id,
        exerciseType: exercise.exerciseType,
        measurementCategory: exercise.measurementCategory,
        tags: exercise.tags,
      },
      nexus: {
        card: {
          title: exercise.title,
          summary: exercise.summary || exercise.searchSummary || "",
        },
      },
    },
  };
}

function readTrainingMarkdownSource(
  doc: TrainingDocRecord | null | undefined,
  fallbackContent = "",
) {
  if (!doc?.itemPath || !existsSync(doc.itemPath)) {
    return fallbackContent;
  }

  try {
    return readFileSync(doc.itemPath, "utf8");
  } catch {
    return fallbackContent;
  }
}

function buildTrainingExerciseMarkdownFallback(
  exercise: TrainingExerciseRecord,
) {
  const payload = buildTrainingExerciseConceptPayloadFromRecord(exercise);
  return buildTrainingConceptMarkdownContent(
    exercise.title,
    exercise.slug || exercise.title,
    payload,
  );
}

function buildTrainingMuscleMarkdownFallback(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  const payload = buildTrainingMuscleConceptPayload(muscle);
  return buildTrainingConceptMarkdownContent(muscle.title, muscle.id, payload);
}

function buildLegacyTrainingMuscleMarkdownFallback(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  const payload = buildLegacyTrainingMuscleConceptPayload(muscle);
  return buildTrainingConceptMarkdownContent(muscle.title, muscle.id, payload);
}

function buildTrainingTransferRoutineSegment(
  segment: Record<string, unknown>,
  exerciseLookup: Map<string, TrainingExerciseRecord>,
): TrainingTransferRoutineSegment {
  if (segment?.type === "block") {
    return {
      type: "block",
      title: normalizeOptionalText(segment.title) || "",
      repeatCount: Math.max(1, Math.round(Number(segment.repeatCount || 1)) || 1),
      steps: Array.isArray(segment.steps)
        ? segment.steps.map((step) => buildTrainingTransferRoutineSegment(step, exerciseLookup))
        : [],
    };
  }

  const stepKind = String(segment?.stepKind || segment?.kind || "exercise").trim().toLowerCase() === "rest"
    ? "rest"
    : "exercise";
  const exerciseId = normalizeOptionalText(segment?.exerciseId);
  const exercise = exerciseId ? exerciseLookup.get(exerciseId) || null : null;

  return {
    type: "step",
    stepKind,
    exerciseTitle: stepKind === "exercise" ? exercise?.title || "" : null,
    prescription: cloneJsonValue(normalizeTrainingPrescription(segment?.prescription)),
  };
}

function buildTrainingTransferMuscleRecord(
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number] & { doc: TrainingDocRecord | null },
): TrainingTransferMuscleRecord {
  return {
    id: muscle.id,
    title: muscle.title,
    regionId: muscle.regionId,
    regionTitle: muscle.regionTitle,
    groupId: muscle.groupId,
    groupTitle: muscle.groupTitle,
    markdown: readTrainingMarkdownSource(muscle.doc, buildTrainingMuscleMarkdownFallback(muscle)),
  };
}

function buildTrainingTransferExerciseRecord(
  exercise: TrainingExerciseRecord,
): TrainingTransferExerciseRecord {
  return {
    title: exercise.title,
    summary: exercise.summary,
    exerciseType: exercise.exerciseType,
    measurementCategory: exercise.measurementCategory,
    tags: [...(exercise.tags || [])],
    measurement: cloneJsonValue(normalizeTrainingMeasurement(exercise.measurement)),
    muscleLoads: (exercise.muscleLoads || []).map((entry) => ({
      muscleId: entry.muscleId,
      muscleTitle: entry.title || null,
      percentage: Number(entry.percentage || 0),
    })),
    templateKey: exercise.templateKey,
    personalDifficultyScore: exercise.personalDifficultyScore,
    markdown: readTrainingMarkdownSource(exercise.doc, buildTrainingExerciseMarkdownFallback(exercise)),
  };
}

function buildTrainingTransferRoutineRecord(
  routine: TrainingRoutineRecord,
  exerciseLookup: Map<string, TrainingExerciseRecord>,
): TrainingTransferRoutineRecord {
  return {
    title: routine.title,
    summary: routine.summary,
    notes: routine.notes,
    structure: Array.isArray(routine.structure)
      ? routine.structure.map((segment) => buildTrainingTransferRoutineSegment(segment, exerciseLookup))
      : [],
  };
}

function collectTrainingExerciseIdsFromStructure(structure: Array<Record<string, unknown>>) {
  return Array.from(new Set(
    flattenTrainingStructureSteps(Array.isArray(structure) ? structure : [])
      .filter((entry) => entry?.type === "step")
      .map((entry) => normalizeOptionalText(entry.exerciseId))
      .filter(Boolean),
  ));
}

function collectTrainingMuscleIdsFromExercises(exercises: TrainingExerciseRecord[]) {
  return Array.from(new Set(
    exercises.flatMap((exercise) => (
      Array.isArray(exercise.muscleLoads)
        ? exercise.muscleLoads.map((entry) => normalizeOptionalText(entry.muscleId)).filter(Boolean)
        : []
    )),
  ));
}

function buildTrainingTransferEnvelope(
  ctx: NexusBackendPluginContext,
  payload: Record<string, unknown> = {},
): TrainingTransferEnvelope {
  const requestedKind = normalizeOptionalText(payload.kind) || "all";
  const requestedId = normalizeOptionalText(payload.id);
  const exercises = listTrainingExercisesSync(ctx);
  const routines = listTrainingRoutinesSync(ctx);
  const muscles = enrichTrainingMuscleCatalogSync(ctx);
  const exerciseLookup = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  if (requestedKind === "muscle") {
    const muscle = muscles.find((entry) => entry.id === requestedId);
    if (!muscle) {
      throw new Error("No encontramos ese musculo para exportar.");
    }

    return {
      version: TRAINING_TRANSFER_SCHEMA_VERSION,
      muscles: [buildTrainingTransferMuscleRecord(muscle)],
      exercises: [],
      routines: [],
    };
  }

  if (requestedKind === "exercise") {
    const exercise = exercises.find((entry) => entry.id === requestedId);
    if (!exercise) {
      throw new Error("No encontramos ese ejercicio para exportar.");
    }

    const relatedMuscleIds = new Set(collectTrainingMuscleIdsFromExercises([exercise]));
    return {
      version: TRAINING_TRANSFER_SCHEMA_VERSION,
      muscles: muscles
        .filter((entry) => relatedMuscleIds.has(entry.id))
        .map((entry) => buildTrainingTransferMuscleRecord(entry)),
      exercises: [buildTrainingTransferExerciseRecord(exercise)],
      routines: [],
    };
  }

  if (requestedKind === "routine") {
    const routine = routines.find((entry) => entry.id === requestedId);
    if (!routine) {
      throw new Error("No encontramos esa rutina para exportar.");
    }

    const relatedExerciseIds = new Set(collectTrainingExerciseIdsFromStructure(routine.structure));
    const relatedExercises = exercises.filter((entry) => relatedExerciseIds.has(entry.id));
    const relatedMuscleIds = new Set(collectTrainingMuscleIdsFromExercises(relatedExercises));

    return {
      version: TRAINING_TRANSFER_SCHEMA_VERSION,
      muscles: muscles
        .filter((entry) => relatedMuscleIds.has(entry.id))
        .map((entry) => buildTrainingTransferMuscleRecord(entry)),
      exercises: relatedExercises.map((entry) => buildTrainingTransferExerciseRecord(entry)),
      routines: [buildTrainingTransferRoutineRecord(routine, exerciseLookup)],
    };
  }

  return {
    version: TRAINING_TRANSFER_SCHEMA_VERSION,
    muscles: muscles.map((entry) => buildTrainingTransferMuscleRecord(entry)),
    exercises: exercises.map((entry) => buildTrainingTransferExerciseRecord(entry)),
    routines: routines.map((entry) => buildTrainingTransferRoutineRecord(entry, exerciseLookup)),
  };
}

async function ensureTrainingExerciseConcept(ctx: NexusBackendPluginContext, exerciseId: string) {
  const sqlite = getSqlite(ctx);
  const normalizedExerciseId = normalizeOptionalText(exerciseId);
  if (!normalizedExerciseId) {
    throw new Error("Falta el id del ejercicio.");
  }

  const existingRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(normalizedExerciseId);

  const exercise = existingRow ? normalizeExerciseRecord(ctx, existingRow) : null;
  if (!exercise) {
    throw new Error("No encontramos ese ejercicio.");
  }

  await ensureTrainingConceptFolders(ctx);
  const preferredRelativePath = getTrainingExerciseConceptPreferredRelativePath(exercise);
  const legacyRelativePath = getTrainingExerciseConceptLegacyRelativePaths(exercise)[0] || null;

  if (exercise.doc && normalizeOptionalText(existingRow?.concept_id)) {
    if (exercise.doc.relativePath && exercise.doc.relativePath !== preferredRelativePath) {
      await renameTrainingMarkdownItemPath(ctx, exercise.doc.relativePath, preferredRelativePath, exercise.doc.itemId);
      return getTrainingDocRecordByConceptIdSync(ctx, existingRow?.concept_id);
    }

    return exercise.doc;
  }

  const exercisePayload = buildTrainingExerciseConceptPayloadFromRecord(exercise);
  let existingItem = await ensureTrainingMarkdownItem(ctx, preferredRelativePath);
  if (!existingItem && legacyRelativePath) {
    const legacyItem = await ensureTrainingMarkdownItem(ctx, legacyRelativePath);
    if (legacyItem) {
      existingItem = await renameTrainingMarkdownItemPath(
        ctx,
        legacyRelativePath,
        preferredRelativePath,
        String(legacyItem.id),
      );
    }
  }

  const created = existingItem?.id
    ? {
        concept: await ensureTrainingConceptForItem(ctx, {
          itemId: String(existingItem.id),
          title: exercise.title,
          slug: exercise.slug || exercise.title,
          summary: exercisePayload.summary ?? null,
        }),
      }
    : await createTrainingConceptNote(ctx, exercisePayload);

  sqlite.prepare(`
    UPDATE training_exercises
    SET concept_id = ?,
        updated_at = ?
    WHERE id = ?
  `).run(String(created.concept.id), nowIso(), normalizedExerciseId);

  return getTrainingDocRecordByConceptIdSync(ctx, String(created.concept.id));
}

async function saveTrainingExerciseDocMarkdown(
  ctx: NexusBackendPluginContext,
  exerciseId: string,
  markdown: string,
) {
  const normalizedExerciseId = normalizeOptionalText(exerciseId);
  if (!normalizedExerciseId) {
    throw new Error("Falta el id del ejercicio.");
  }

  const sqlite = getSqlite(ctx);
  const exerciseRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(normalizedExerciseId);
  const exercise = exerciseRow ? normalizeExerciseRecord(ctx, exerciseRow) : null;
  if (!exercise) {
    throw new Error("No encontramos ese ejercicio.");
  }

  const doc = await ensureTrainingExerciseConcept(ctx, normalizedExerciseId);
  const currentDoc = doc || exercise.doc;
  const nextDoc = await ensureTrainingManagedConceptDoc(ctx, {
    relativePath: getTrainingExerciseConceptPreferredRelativePath(exercise),
    currentRelativePath: currentDoc?.relativePath || null,
    currentItemId: currentDoc?.itemId || null,
    currentConceptId: getRealTrainingConceptId(exerciseRow?.concept_id) || getRealTrainingConceptId(currentDoc?.conceptId),
    title: exercise.title,
    slug: exercise.slug || exercise.title,
    summary: exercise.summary || exercise.searchSummary || null,
    content: String(markdown ?? ""),
  });

  const conceptId = getRealTrainingConceptId(nextDoc?.conceptId);
  if (conceptId) {
    sqlite.prepare(`
      UPDATE training_exercises
      SET concept_id = ?,
          updated_at = ?
      WHERE id = ?
    `).run(conceptId, nowIso(), normalizedExerciseId);
  }

  const refreshedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(normalizedExerciseId);
  const refreshedExercise = refreshedRow ? normalizeExerciseRecord(ctx, refreshedRow) : null;
  if (refreshedExercise) {
    upsertTrainingExerciseSearchDocument(sqlite, refreshedExercise);
  }

  return refreshedExercise;
}

async function saveTrainingMuscleDocMarkdown(
  ctx: NexusBackendPluginContext,
  muscleId: string,
  markdown: string,
) {
  const normalizedMuscleId = normalizeOptionalText(muscleId);
  if (!normalizedMuscleId) {
    throw new Error("Falta el id del musculo.");
  }

  const sqlite = getSqlite(ctx);
  const muscle = TRAINING_MUSCLE_CATALOG.find((entry) => entry.id === normalizedMuscleId) || null;
  if (!muscle) {
    throw new Error("No encontramos ese musculo canonico.");
  }

  await ensureTrainingConceptFolders(ctx);
  const existingBinding = findTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId);
  const existingDoc = existingBinding?.concept_id
    ? getTrainingDocRecordByConceptIdSync(ctx, existingBinding.concept_id)
    : findTrainingExistingMuscleDocRecordSync(ctx, muscle);
  const doc = await ensureTrainingManagedConceptDoc(ctx, {
    relativePath: getTrainingMuscleConceptPreferredRelativePath(muscle),
    currentRelativePath: existingDoc?.relativePath || null,
    currentItemId: existingDoc?.itemId || null,
    currentConceptId: getRealTrainingConceptId(existingBinding?.concept_id) || getRealTrainingConceptId(existingDoc?.conceptId),
    title: muscle.title,
    slug: muscle.id,
    summary: buildTrainingMuscleConceptSummary(muscle),
    content: String(markdown ?? ""),
  });

  const conceptId = getRealTrainingConceptId(doc?.conceptId);
  if (!conceptId) {
    throw new Error("No se pudo guardar la nota del musculo.");
  }

  upsertTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId, conceptId);
  return enrichTrainingMuscleCatalogSync(
    ctx,
    TRAINING_MUSCLE_CATALOG.filter((entry) => entry.id === normalizedMuscleId),
  )[0] || null;
}

function getTrainingConceptCoverageKey(ctx: NexusBackendPluginContext) {
  return path.normalize(String(ctx?.vault?.contentPath || "__training__"));
}

function queueTrainingManagedMarkdownLinkSync(ctx: NexusBackendPluginContext) {
  if (typeof ctx.syncMarkdownLinks !== "function" || !ctx.lifecycle.acceptingWork) {
    return;
  }

  const coverageKey = getTrainingConceptCoverageKey(ctx);
  if (trainingMarkdownLinksSynced.has(coverageKey) || trainingMarkdownLinkSyncInFlight.has(coverageKey)) {
    return;
  }

  const pendingRun = ctx.lifecycle.run("life-tracker.training-markdown-links", async ({ signal }) => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    signal.throwIfAborted();
    const repositories = getRepositories(ctx);
    const markdownItems = (await repositories.items.findAll()).filter((item: any) => {
      const relativePath = normalizeRelativeContentPath(item?.relative_path || item?.path);
      return item?.type === "file" && (
        relativePath.startsWith(`${TRAINING_MUSCLE_CONCEPTS_DIRECTORY}/`)
        || relativePath.startsWith(`${TRAINING_EXERCISE_CONCEPTS_DIRECTORY}/`)
      );
    });

    for (const item of markdownItems) {
      signal.throwIfAborted();
      await ctx.syncMarkdownLinks({
        item,
        reason: "content-updated",
        structuralChanged: false,
        contentChanged: true,
      });
    }

    signal.throwIfAborted();
    trainingMarkdownLinksSynced.add(coverageKey);
  }).catch((error) => {
    console.error("[life-tracker.training] No se pudieron indexar los enlaces de notas gestionadas.", error);
  }).finally(() => {
    trainingMarkdownLinkSyncInFlight.delete(coverageKey);
  });

  trainingMarkdownLinkSyncInFlight.set(coverageKey, pendingRun);
}

async function ensureTrainingStarterExerciseRecord(
  ctx: NexusBackendPluginContext,
  definition: (typeof TRAINING_STARTER_EXERCISES)[number],
) {
  const sqlite = getSqlite(ctx);
  const canonicalSlug = normalizeTrainingSlug(definition.title, "exercise");
  const existingRow = findTrainingExerciseByTemplateKeySync(sqlite, definition.templateKey)
    || findTrainingExerciseBySlugSync(sqlite, canonicalSlug)
    || findTrainingExerciseByTitleExactSync(sqlite, definition.title);
  const entityRef = await ensureTrainingExerciseEntityRef(ctx, existingRow);
  const exerciseId = existingRow?.id || randomUUID();
  const timestamp = nowIso();
  const exerciseType = normalizeTrainingExerciseType(definition.exerciseType);
  const measurementCategory = normalizeTrainingMeasurementCategory(definition.measurementCategory);
  const tags = normalizeTrainingExerciseTags(definition.tags || [], { measurementCategory });
  const measurement = normalizeTrainingMeasurement(definition.measurement || {});
  const muscleLoads = normalizeTrainingMuscleLoads(definition.muscleLoads || []);

  sqlite.prepare(`
    INSERT INTO training_exercises (
      id, entity_ref_id, concept_id, template_key, title, slug, summary, notes, exercise_type, measurement_category, tags_json,
      measurement_json, muscle_loads_json, legacy_muscle_warnings_json, personal_difficulty_score, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @concept_id, @template_key, @title, @slug, @summary, @notes, @exercise_type, @measurement_category, @tags_json,
      @measurement_json, @muscle_loads_json, @legacy_muscle_warnings_json, @personal_difficulty_score, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      concept_id = excluded.concept_id,
      template_key = excluded.template_key,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      exercise_type = excluded.exercise_type,
      measurement_category = excluded.measurement_category,
      tags_json = excluded.tags_json,
      measurement_json = excluded.measurement_json,
      muscle_loads_json = excluded.muscle_loads_json,
      legacy_muscle_warnings_json = excluded.legacy_muscle_warnings_json,
      personal_difficulty_score = excluded.personal_difficulty_score,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: exerciseId,
    entity_ref_id: String((entityRef as any).id),
    concept_id: existingRow?.concept_id ?? null,
    template_key: definition.templateKey,
    title: definition.title,
    slug: canonicalSlug,
    summary: definition.summary,
    notes: existingRow?.notes ?? null,
    exercise_type: exerciseType,
    measurement_category: measurementCategory,
    tags_json: JSON.stringify(tags),
    measurement_json: JSON.stringify(measurement),
    muscle_loads_json: JSON.stringify(muscleLoads),
    legacy_muscle_warnings_json: JSON.stringify([]),
    personal_difficulty_score: normalizeOptionalNumber(existingRow?.personal_difficulty_score),
    status: "active",
    created_at: existingRow?.created_at || timestamp,
    updated_at: timestamp,
  });

  const savedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(exerciseId);
  const savedExercise = savedRow ? normalizeExerciseRecord(ctx, savedRow) : null;

  if (!savedExercise) {
    throw new Error(`No se pudo preparar el ejercicio base: ${definition.title}.`);
  }

  upsertTrainingExerciseSearchDocument(sqlite, savedExercise);
  return savedExercise;
}

async function restoreTrainingMuscleManagedDoc(ctx: NexusBackendPluginContext, muscleId: string) {
  const normalizedMuscleId = normalizeOptionalText(muscleId);
  if (!normalizedMuscleId) {
    throw new Error("Falta el id del musculo.");
  }

  const sqlite = getSqlite(ctx);
  const muscle = TRAINING_MUSCLE_CATALOG.find((entry) => entry.id === normalizedMuscleId) || null;
  if (!muscle) {
    throw new Error("No encontramos ese musculo canonico.");
  }

  await ensureTrainingConceptFolders(ctx);
  const payload = buildTrainingMuscleConceptPayload(muscle);
  const existingBinding = findTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId);
  const existingDoc = existingBinding?.concept_id
    ? getTrainingDocRecordByConceptIdSync(ctx, existingBinding.concept_id)
    : findTrainingExistingMuscleDocRecordSync(ctx, muscle);
  const managedContent = buildTrainingConceptMarkdownContent(muscle.title, muscle.id, payload);
  const doc = await ensureTrainingManagedConceptDoc(ctx, {
    relativePath: getTrainingMuscleConceptPreferredRelativePath(muscle),
    currentRelativePath: existingDoc?.relativePath || null,
    currentItemId: existingDoc?.itemId || null,
    currentConceptId: getRealTrainingConceptId(existingBinding?.concept_id) || getRealTrainingConceptId(existingDoc?.conceptId),
    title: muscle.title,
    slug: muscle.id,
    summary: payload.summary ?? null,
    content: preserveTrainingCover(existingDoc, managedContent),
  });

  const conceptId = getRealTrainingConceptId(doc?.conceptId);
  if (!conceptId) {
    throw new Error("No se pudo restaurar la nota del musculo.");
  }

  upsertTrainingMuscleConceptBindingSync(sqlite, normalizedMuscleId, conceptId);
  return getTrainingDocRecordByConceptIdSync(ctx, conceptId);
}

async function upgradeTrainingLegacyMuscleManagedDocIfNeeded(
  ctx: NexusBackendPluginContext,
  muscle: (typeof TRAINING_MUSCLE_CATALOG)[number],
) {
  const sqlite = getSqlite(ctx);
  const existingBinding = findTrainingMuscleConceptBindingSync(sqlite, muscle.id);
  const currentDoc = getRealTrainingConceptId(existingBinding?.concept_id)
    ? getTrainingDocRecordByConceptIdSync(ctx, existingBinding?.concept_id)
    : findTrainingExistingMuscleDocRecordSync(ctx, muscle);

  if (!currentDoc?.itemPath || !existsSync(currentDoc.itemPath)) {
    return;
  }

  const currentContent = readFileSync(currentDoc.itemPath, "utf8");
  const normalizedCurrentContent = normalizeTrainingMarkdownForComparison(currentContent);
  const legacyContent = buildLegacyTrainingMuscleMarkdownFallback(muscle);
  const normalizedLegacyContent = normalizeTrainingMarkdownForComparison(legacyContent);
  const currentBody = normalizeTrainingMarkdownForComparison(extractYamlFrontmatter(currentContent).body || "");
  const legacyBody = normalizeTrainingMarkdownForComparison(extractYamlFrontmatter(legacyContent).body || "");

  if (normalizedCurrentContent !== normalizedLegacyContent && currentBody !== legacyBody) {
    return;
  }

  await restoreTrainingMuscleManagedDoc(ctx, muscle.id);
}

async function restoreTrainingStarterExerciseManagedDoc(
  ctx: NexusBackendPluginContext,
  templateKey: string,
  { ensureFolders = true }: { ensureFolders?: boolean } = {},
) {
  const definition = getTrainingStarterExerciseDefinition(templateKey);
  if (!definition) {
    throw new Error("No encontramos esa plantilla de ejercicio.");
  }

  const sqlite = getSqlite(ctx);
  if (ensureFolders) {
    await ensureTrainingConceptFolders(ctx);
  }
  const exercise = await ensureTrainingStarterExerciseRecord(ctx, definition);
  const currentRow = findTrainingExerciseByTemplateKeySync(sqlite, definition.templateKey);
  const currentDoc = getRealTrainingConceptId(currentRow?.concept_id)
    ? getTrainingDocRecordByConceptIdSync(ctx, currentRow?.concept_id)
    : exercise.doc || findTrainingExistingExerciseDocRecordSync(ctx, exercise);
  const payload = buildTrainingStarterExerciseConceptPayload(definition, exercise.id);
  const managedContent = buildTrainingConceptMarkdownContent(exercise.title, exercise.slug || exercise.title, payload);
  const doc = await ensureTrainingManagedConceptDoc(ctx, {
    relativePath: getTrainingExerciseConceptPreferredRelativePath(exercise),
    currentRelativePath: currentDoc?.relativePath || null,
    currentItemId: currentDoc?.itemId || null,
    currentConceptId: getRealTrainingConceptId(currentRow?.concept_id) || getRealTrainingConceptId(currentDoc?.conceptId),
    title: exercise.title,
    slug: exercise.slug || exercise.title,
    summary: payload.summary ?? null,
    content: preserveTrainingCover(currentDoc, managedContent),
  });

  const conceptId = getRealTrainingConceptId(doc?.conceptId);
  if (!conceptId) {
    throw new Error("No se pudo restaurar la nota del ejercicio base.");
  }

  sqlite.prepare(`
    UPDATE training_exercises
    SET concept_id = ?,
        updated_at = ?
    WHERE id = ?
  `).run(conceptId, nowIso(), exercise.id);

  const refreshedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(exercise.id);
  const refreshedExercise = refreshedRow ? normalizeExerciseRecord(ctx, refreshedRow) : null;
  if (refreshedExercise) {
    upsertTrainingExerciseSearchDocument(sqlite, refreshedExercise);
  }

  return {
    exercise: refreshedExercise,
    doc: getTrainingDocRecordByConceptIdSync(ctx, conceptId),
  };
}

async function ensureTrainingConceptCoverage(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const currentVersion = Number(getTrainingSystemStateValueSync(sqlite, TRAINING_STARTER_LIBRARY_STATE_KEY) || 0);
  if (currentVersion >= TRAINING_STARTER_LIBRARY_VERSION) {
    return;
  }

  const coverageKey = getTrainingConceptCoverageKey(ctx);
  const existingRun = trainingConceptCoverageInFlight.get(coverageKey);
  if (existingRun) {
    await existingRun;
    return;
  }

  const pendingRun = (async () => {
    try {
      ctx.lifecycle.throwIfAborted();
      await copyTrainingManagedDocAssets(ctx);
      ctx.lifecycle.throwIfAborted();
      await ensureTrainingConceptFolders(ctx);
      ctx.lifecycle.throwIfAborted();
      await ensureAllTrainingMuscleConcepts(ctx);
      for (const muscle of TRAINING_MUSCLE_CATALOG) {
        ctx.lifecycle.throwIfAborted();
        await upgradeTrainingLegacyMuscleManagedDocIfNeeded(ctx, muscle);
      }
      for (const definition of TRAINING_STARTER_EXERCISES) {
        ctx.lifecycle.throwIfAborted();
        await ensureTrainingStarterExerciseRecord(ctx, definition);
        await restoreTrainingStarterExerciseManagedDoc(ctx, definition.templateKey, {
          ensureFolders: false,
        });
      }
      setTrainingSystemStateValueSync(sqlite, TRAINING_STARTER_LIBRARY_STATE_KEY, String(TRAINING_STARTER_LIBRARY_VERSION));
      queueTrainingManagedMarkdownLinkSync(ctx);
    } finally {
      trainingConceptCoverageInFlight.delete(coverageKey);
    }
  })();

  trainingConceptCoverageInFlight.set(coverageKey, pendingRun);
  await pendingRun;
}

function resolveManagedTrainingDocStatus(
  currentDoc: TrainingDocRecord | null,
  expectedRelativePath: string,
  expectedContent: string,
): "original" | "edited" | "missing" {
  if (!currentDoc?.itemPath || !existsSync(currentDoc.itemPath)) {
    return "missing";
  }

  if (normalizeRelativeContentPath(currentDoc.relativePath) !== normalizeRelativeContentPath(expectedRelativePath)) {
    return "edited";
  }

  const currentContent = readFileSync(currentDoc.itemPath, "utf8");
  return normalizeTrainingMarkdownForComparison(withoutTrainingCoverForComparison(currentContent))
    === normalizeTrainingMarkdownForComparison(withoutTrainingCoverForComparison(expectedContent))
    ? "original"
    : "edited";
}

async function listTrainingManagedDocs(ctx: NexusBackendPluginContext) {
  await ensureTrainingConceptCoverage(ctx);

  const sqlite = getSqlite(ctx);
  const managedDocs: TrainingManagedDocRecord[] = [];

  for (const definition of TRAINING_STARTER_EXERCISES) {
    const exerciseRow = findTrainingExerciseByTemplateKeySync(sqlite, definition.templateKey)
      || findTrainingExerciseBySlugSync(sqlite, normalizeTrainingSlug(definition.title, "exercise"))
      || findTrainingExerciseByTitleExactSync(sqlite, definition.title);
    const exercise = exerciseRow ? normalizeExerciseRecord(ctx, exerciseRow) : null;
    const conceptPayload = buildTrainingStarterExerciseConceptPayload(
      definition,
      exercise?.id || `starter:${definition.templateKey}`,
    );
    const expectedRelativePath = getTrainingExerciseConceptPreferredRelativePath({
      title: definition.title,
      slug: normalizeTrainingSlug(definition.title, "exercise"),
    } as Pick<TrainingExerciseRecord, "title" | "slug">);
    const currentDoc = exercise?.doc || findTrainingDocRecordByRelativePathSync(
      ctx,
      expectedRelativePath,
      definition.title,
      definition.summary,
    );

    managedDocs.push({
      id: getTrainingStarterExerciseManagedDocId(definition.templateKey),
      kind: "starter-exercise",
      group: "Ejercicios",
      label: definition.title,
      description: definition.summary,
      status: exercise
        ? resolveManagedTrainingDocStatus(
            currentDoc,
            expectedRelativePath,
            buildTrainingConceptMarkdownContent(
              definition.title,
              exercise.slug || normalizeTrainingSlug(definition.title, "exercise"),
              conceptPayload,
            ),
          )
        : "missing",
      relativePath: expectedRelativePath,
      currentRelativePath: currentDoc?.relativePath || null,
      itemId: currentDoc?.itemId || null,
      itemPath: currentDoc?.itemPath || null,
      conceptId: getRealTrainingConceptId(currentDoc?.conceptId),
      exerciseId: exercise?.id || null,
      exerciseTemplateKey: definition.templateKey,
      muscleId: null,
    });
  }

  for (const muscle of TRAINING_MUSCLE_CATALOG) {
    const payload = buildTrainingMuscleConceptPayload(muscle);
    const expectedRelativePath = getTrainingMuscleConceptPreferredRelativePath(muscle);
    const existingBinding = findTrainingMuscleConceptBindingSync(sqlite, muscle.id);
    const currentDoc = getRealTrainingConceptId(existingBinding?.concept_id)
      ? getTrainingDocRecordByConceptIdSync(ctx, existingBinding?.concept_id)
      : findTrainingExistingMuscleDocRecordSync(ctx, muscle);

    managedDocs.push({
      id: getTrainingMuscleManagedDocId(muscle.id),
      kind: "muscle",
      group: "Musculos",
      label: muscle.title,
      description: buildTrainingMuscleConceptSummary(muscle),
      status: resolveManagedTrainingDocStatus(
        currentDoc,
        expectedRelativePath,
        buildTrainingConceptMarkdownContent(muscle.title, muscle.id, payload),
      ),
      relativePath: expectedRelativePath,
      currentRelativePath: currentDoc?.relativePath || null,
      itemId: currentDoc?.itemId || null,
      itemPath: currentDoc?.itemPath || null,
      conceptId: getRealTrainingConceptId(existingBinding?.concept_id) || getRealTrainingConceptId(currentDoc?.conceptId),
      exerciseId: null,
      exerciseTemplateKey: null,
      muscleId: muscle.id,
    });
  }

  return managedDocs;
}

async function restoreTrainingManagedDoc(ctx: NexusBackendPluginContext, managedDocId: string) {
  const normalizedManagedDocId = normalizeOptionalText(managedDocId);
  if (!normalizedManagedDocId) {
    throw new Error("Falta el id de la nota gestionada.");
  }

  if (normalizedManagedDocId.startsWith("starter-exercise:")) {
    const templateKey = normalizedManagedDocId.slice("starter-exercise:".length);
    const restored = await restoreTrainingStarterExerciseManagedDoc(ctx, templateKey);
    return {
      restoredId: normalizedManagedDocId,
      ...restored,
      managedDocs: await listTrainingManagedDocs(ctx),
    };
  }

  if (normalizedManagedDocId.startsWith("muscle:")) {
    const muscleId = normalizedManagedDocId.slice("muscle:".length);
    const doc = await restoreTrainingMuscleManagedDoc(ctx, muscleId);
    return {
      restoredId: normalizedManagedDocId,
      doc,
      managedDocs: await listTrainingManagedDocs(ctx),
    };
  }

  throw new Error("No encontramos esa nota gestionada.");
}

async function ensureTrainingExerciseEntityRef(ctx: NexusBackendPluginContext, existingRow: any | null) {
  const repositories = getRepositories(ctx);
  if (existingRow?.entity_ref_id) {
    const entityRef = await repositories.entityRefs.findById(String(existingRow.entity_ref_id));
    if (entityRef) {
      return entityRef;
    }
  }

  return repositories.entityRefs.create({
    kind: TRAINING_EXERCISE_KIND,
  });
}

async function ensureTrainingRoutineEntityRef(ctx: NexusBackendPluginContext, existingRow: any | null) {
  const repositories = getRepositories(ctx);
  if (existingRow?.entity_ref_id) {
    const entityRef = await repositories.entityRefs.findById(String(existingRow.entity_ref_id));
    if (entityRef) {
      return entityRef;
    }
  }

  return repositories.entityRefs.create({
    kind: TRAINING_ROUTINE_KIND,
  });
}

function sumTrainingMusclePercentages(muscleLoads: Array<Record<string, unknown>>) {
  return muscleLoads.reduce((sum, entry) => sum + Number(entry?.percentage || 0), 0);
}

function assertTrainingMusclePercentagesTotal(muscleLoads: Array<Record<string, unknown>>) {
  if (!muscleLoads.length) {
    return;
  }

  const total = sumTrainingMusclePercentages(muscleLoads);
  if (total !== 100) {
    throw new Error(`Los porcentajes musculares deben sumar 100. Total actual: ${total}.`);
  }
}

function normalizeExerciseInput(payload: TrainingExerciseInput) {
  const title = assertNonEmptyString(payload?.title, "title");
  const summary = normalizeOptionalText(payload?.summary);
  const notes = normalizeOptionalText(payload?.notes);
  const exerciseType = normalizeTrainingExerciseType(payload?.exerciseType);
  const measurementCategory = normalizeTrainingMeasurementCategory(payload?.measurementCategory);
  const tags = normalizeTrainingExerciseTags(Array.isArray(payload?.tags) ? payload.tags : [], {
    measurementCategory,
  });
  const measurement = normalizeTrainingMeasurement(payload?.measurement);
  const muscleLoads = normalizeTrainingMuscleLoads(Array.isArray(payload?.muscleLoads) ? payload.muscleLoads : []);
  const templateKey = normalizeOptionalText(payload?.templateKey);
  const personalDifficultyScore = normalizeOptionalNumber(payload?.personalDifficultyScore);

  assertTrainingMusclePercentagesTotal(muscleLoads);

  return {
    title,
    summary,
    notes,
    exerciseType,
    measurementCategory,
    tags,
    measurement,
    muscleLoads,
    templateKey,
    personalDifficultyScore,
    slug: normalizeTrainingSlug(payload?.slug || title, "exercise"),
  };
}

function normalizeRoutineInput(payload: TrainingRoutineInput, exerciseLookup: Map<string, TrainingExerciseRecord>) {
  const title = assertNonEmptyString(payload?.title, "title");
  const summary = normalizeOptionalText(payload?.summary);
  const notes = normalizeOptionalText(payload?.notes);
  const rawStructure = Array.isArray(payload?.structure) ? payload.structure : [];
  const structure = rawStructure.length
    ? normalizeTrainingStructure(rawStructure, exerciseLookup)
    : migrateLegacyTrainingSteps(Array.isArray(payload?.steps) ? payload.steps : [], exerciseLookup);

  return {
    title,
    summary,
    notes,
    structure,
    slug: normalizeTrainingSlug(payload?.slug || title, "routine"),
  };
}

function normalizeTrainingTransferEnvelopePayload(payload: unknown): TrainingTransferEnvelope {
  const payloadRecord = isPlainObject(payload) ? payload : null;
  const source = typeof payload === "string"
    ? JSON.parse(payload)
    : typeof payloadRecord?.text === "string"
      ? JSON.parse(String(payloadRecord.text))
      : payload;

  if (!isPlainObject(source)) {
    throw new Error("El import/export de entrenamiento espera un objeto JSON.");
  }

  const version = Math.round(Number(source.version || TRAINING_TRANSFER_SCHEMA_VERSION)) || TRAINING_TRANSFER_SCHEMA_VERSION;
  if (version < 1 || version > TRAINING_TRANSFER_SCHEMA_VERSION) {
    throw new Error(`Version de entrenamiento no soportada: ${version}.`);
  }

  return {
    version,
    muscles: Array.isArray(source.muscles) ? source.muscles as TrainingTransferMuscleRecord[] : [],
    exercises: Array.isArray(source.exercises) ? source.exercises as TrainingTransferExerciseRecord[] : [],
    routines: Array.isArray(source.routines) ? source.routines as TrainingTransferRoutineRecord[] : [],
  };
}

function resolveTrainingImportMuscleLoads(
  rawMuscleLoads: unknown,
  warnings: string[],
  label: string,
) {
  const source = Array.isArray(rawMuscleLoads) ? rawMuscleLoads : [];
  const resolvedLoads = [];

  for (const entry of source) {
    const muscleTitle = normalizeOptionalText(entry?.["muscleTitle"]);
    const muscleId = normalizeOptionalText(entry?.["muscleId"]);
    const muscle = muscleTitle
      ? findTrainingMuscleByTitleSync(muscleTitle)
      : muscleId
        ? getTrainingMuscleById(muscleId) || null
        : null;

    if (!muscle) {
      warnings.push(`"${label}": no se reconocio el musculo "${muscleTitle || muscleId || "sin nombre"}".`);
      continue;
    }

    resolvedLoads.push({
      muscleId: muscle.id,
      percentage: Number(entry?.["percentage"] || 0),
    });
  }

  return resolvedLoads;
}

function resolveTrainingImportRoutineStructure(
  rawStructure: unknown,
  exerciseTitleLookup: Map<string, TrainingExerciseRecord>,
  warnings: string[],
  routineTitle: string,
) {
  const source = Array.isArray(rawStructure) ? rawStructure : [];
  let hasResolutionError = false;

  function resolveSegment(segment: any): Record<string, unknown> | null {
    if (segment?.type === "block") {
      const steps = Array.isArray(segment.steps)
        ? segment.steps.map((step) => resolveSegment(step)).filter(Boolean) as Record<string, unknown>[]
        : [];
      return {
        type: "block",
        title: normalizeOptionalText(segment.title) || "Bloque",
        repeatCount: Math.max(1, Math.round(Number(segment.repeatCount || 1)) || 1),
        steps,
      };
    }

    const stepKind = String(segment?.stepKind || segment?.kind || "exercise").trim().toLowerCase() === "rest"
      ? "rest"
      : "exercise";
    if (stepKind === "rest") {
      return {
        type: "step",
        stepKind: "rest",
        prescription: normalizeTrainingPrescription(segment?.prescription),
      };
    }

    const exerciseTitle = normalizeOptionalText(segment?.exerciseTitle || segment?.title || segment?.exerciseName);
    const exerciseKey = normalizeTrainingSlug(exerciseTitle || "", "exercise");
    const resolvedExercise = exerciseTitle ? exerciseTitleLookup.get(exerciseKey) || null : null;

    if (!resolvedExercise?.id) {
      hasResolutionError = true;
      warnings.push(`La rutina "${routineTitle}" referencia el ejercicio "${exerciseTitle || "sin nombre"}" y no se pudo resolver.`);
      return null;
    }

    return {
      type: "step",
      stepKind: "exercise",
      exerciseId: resolvedExercise.id,
      prescription: normalizeTrainingPrescription(segment?.prescription),
    };
  }

  const resolvedStructure = source
    .map((segment) => resolveSegment(segment))
    .filter(Boolean) as Record<string, unknown>[];

  if (hasResolutionError) {
    return null;
  }

  return resolvedStructure;
}

async function importTrainingTransferEnvelope(
  ctx: NexusBackendPluginContext,
  payload: unknown,
) {
  await ensureTrainingConceptCoverage(ctx);

  const envelope = normalizeTrainingTransferEnvelopePayload(payload);
  const warnings: string[] = [];
  const summary = {
    muscles: { created: 0, updated: 0, skipped: 0 },
    exercises: { created: 0, updated: 0, skipped: 0 },
    routines: { created: 0, updated: 0, skipped: 0 },
  };
  const exerciseTitleLookup = new Map(
    listTrainingExercisesSync(ctx).map((exercise) => [normalizeTrainingSlug(exercise.title, "exercise"), exercise]),
  );

  for (const entry of envelope.muscles) {
    const title = normalizeOptionalText(entry?.title);
    const muscle = findTrainingMuscleByTitleSync(title);
    if (!title || !muscle) {
      summary.muscles.skipped += 1;
      warnings.push(`No se reconocio el musculo "${title || "sin nombre"}".`);
      continue;
    }

    const existingDoc = findTrainingExistingMuscleDocRecordSync(ctx, muscle);
    try {
      await saveTrainingMuscleDocMarkdown(
        ctx,
        muscle.id,
        typeof entry?.markdown === "string" && entry.markdown.length
          ? entry.markdown
          : buildTrainingMuscleMarkdownFallback(muscle),
      );
      summary.muscles[existingDoc ? "updated" : "created"] += 1;
    } catch (error) {
      summary.muscles.skipped += 1;
      warnings.push(`No se pudo importar el musculo "${title}": ${error instanceof Error ? error.message : "error desconocido"}.`);
    }
  }

  for (const entry of envelope.exercises) {
    const title = normalizeOptionalText(entry?.title);
    if (!title) {
      summary.exercises.skipped += 1;
      warnings.push("Se omitio un ejercicio sin titulo.");
      continue;
    }

    try {
      const exerciseKey = normalizeTrainingSlug(title, "exercise");
      const existingExercise = exerciseTitleLookup.get(exerciseKey) || null;
      const savedExercise = await saveTrainingExercise(ctx, {
        id: existingExercise?.id || null,
        title,
        summary: normalizeOptionalText(entry?.summary),
        exerciseType: entry?.exerciseType,
        measurementCategory: entry?.measurementCategory,
        tags: Array.isArray(entry?.tags) ? entry.tags : [],
        measurement: entry?.measurement,
        muscleLoads: resolveTrainingImportMuscleLoads(entry?.muscleLoads, warnings, title),
        templateKey: normalizeOptionalText(entry?.templateKey),
        personalDifficultyScore: entry?.personalDifficultyScore,
        docMarkdown: typeof entry?.markdown === "string" && entry.markdown.length
          ? entry.markdown
          : null,
      });
      exerciseTitleLookup.set(exerciseKey, savedExercise);
      summary.exercises[existingExercise ? "updated" : "created"] += 1;
    } catch (error) {
      summary.exercises.skipped += 1;
      warnings.push(`No se pudo importar el ejercicio "${title}": ${error instanceof Error ? error.message : "error desconocido"}.`);
    }
  }

  for (const entry of envelope.routines) {
    const title = normalizeOptionalText(entry?.title);
    if (!title) {
      summary.routines.skipped += 1;
      warnings.push("Se omitio una rutina sin titulo.");
      continue;
    }

    const structure = resolveTrainingImportRoutineStructure(entry?.structure, exerciseTitleLookup, warnings, title);
    if (!structure) {
      summary.routines.skipped += 1;
      continue;
    }

    try {
      const existingRoutine = findTrainingRoutineRecordByTitleSync(ctx, title);
      await saveTrainingRoutine(ctx, {
        id: existingRoutine?.id || null,
        title,
        summary: normalizeOptionalText(entry?.summary),
        notes: normalizeOptionalText(entry?.notes),
        structure,
      });
      summary.routines[existingRoutine ? "updated" : "created"] += 1;
    } catch (error) {
      summary.routines.skipped += 1;
      warnings.push(`No se pudo importar la rutina "${title}": ${error instanceof Error ? error.message : "error desconocido"}.`);
    }
  }

  return {
    version: envelope.version,
    summary,
    warnings,
  };
}

async function saveTrainingExercise(ctx: NexusBackendPluginContext, payload: TrainingExerciseInput) {
  const repositories = getRepositories(ctx);
  const sqlite = repositories.sqlite;
  const requestedId = normalizeOptionalText(payload?.id);
  const existing = requestedId
    ? sqlite.prepare(`
        SELECT *
        FROM training_exercises
        WHERE id = ?
        LIMIT 1
      `).get(requestedId)
    : null;
  const input = normalizeExerciseInput(payload);
  const rawPayload = payload && typeof payload === "object" ? payload : {};
  const hasSummaryField = Object.prototype.hasOwnProperty.call(rawPayload, "summary");
  const hasNotesField = Object.prototype.hasOwnProperty.call(rawPayload, "notes");
  const hasTemplateKeyField = Object.prototype.hasOwnProperty.call(rawPayload, "templateKey");
  const hasDifficultyField = Object.prototype.hasOwnProperty.call(rawPayload, "personalDifficultyScore");
  const hasDocMarkdownField = Object.prototype.hasOwnProperty.call(rawPayload, "docMarkdown");
  const entityRef = await ensureTrainingExerciseEntityRef(ctx, existing);
  const slug = await allocateUniqueSlug(
    input.slug,
    (nextSlug) => Promise.resolve(findTrainingExerciseBySlugSync(sqlite, nextSlug)),
    existing?.id || null,
  );
  const exerciseId = existing?.id || randomUUID();
  const timestamp = nowIso();

  sqlite.prepare(`
    INSERT INTO training_exercises (
      id, entity_ref_id, concept_id, template_key, title, slug, summary, notes, exercise_type, measurement_category, tags_json,
      measurement_json, muscle_loads_json, legacy_muscle_warnings_json, personal_difficulty_score, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @concept_id, @template_key, @title, @slug, @summary, @notes, @exercise_type, @measurement_category, @tags_json,
      @measurement_json, @muscle_loads_json, @legacy_muscle_warnings_json, @personal_difficulty_score, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      concept_id = excluded.concept_id,
      template_key = excluded.template_key,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      exercise_type = excluded.exercise_type,
      measurement_category = excluded.measurement_category,
      tags_json = excluded.tags_json,
      measurement_json = excluded.measurement_json,
      muscle_loads_json = excluded.muscle_loads_json,
      legacy_muscle_warnings_json = excluded.legacy_muscle_warnings_json,
      personal_difficulty_score = excluded.personal_difficulty_score,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: exerciseId,
    entity_ref_id: String((entityRef as any).id),
    concept_id: existing?.concept_id ?? null,
    template_key: hasTemplateKeyField
      ? input.templateKey
      : normalizeOptionalText(existing?.template_key),
    title: input.title,
    slug,
    summary: hasSummaryField
      ? input.summary
      : normalizeOptionalText(existing?.summary),
    notes: hasNotesField
      ? input.notes
      : normalizeOptionalText(existing?.notes),
    exercise_type: input.exerciseType,
    measurement_category: input.measurementCategory,
    tags_json: JSON.stringify(input.tags || []),
    measurement_json: JSON.stringify(input.measurement || {}),
    muscle_loads_json: JSON.stringify(input.muscleLoads || []),
    legacy_muscle_warnings_json: JSON.stringify([]),
    personal_difficulty_score: hasDifficultyField
      ? input.personalDifficultyScore
      : normalizeOptionalNumber(existing?.personal_difficulty_score),
    status: "active",
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
  });

  const savedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(exerciseId);

  const savedExercise = savedRow ? normalizeExerciseRecord(ctx, savedRow) : null;
  if (!savedExercise) {
    throw new Error("No se pudo guardar el ejercicio.");
  }

  await ensureTrainingExerciseConcept(ctx, savedExercise.id);
  const refreshedRow = sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(exerciseId);
  let savedExerciseWithDoc = refreshedRow ? normalizeExerciseRecord(ctx, refreshedRow) : savedExercise;

  if (hasDocMarkdownField && typeof rawPayload.docMarkdown === "string") {
    const exerciseWithImportedDoc = await saveTrainingExerciseDocMarkdown(ctx, exerciseId, rawPayload.docMarkdown);
    if (exerciseWithImportedDoc) {
      savedExerciseWithDoc = exerciseWithImportedDoc;
    }
  }

  upsertTrainingExerciseSearchDocument(sqlite, savedExerciseWithDoc);

  return savedExerciseWithDoc;
}

async function saveTrainingRoutine(ctx: NexusBackendPluginContext, payload: TrainingRoutineInput) {
  const sqlite = getSqlite(ctx);
  const requestedId = normalizeOptionalText(payload?.id);
  const existing = requestedId
    ? sqlite.prepare(`
        SELECT *
        FROM training_routines
        WHERE id = ?
        LIMIT 1
      `).get(requestedId)
    : null;
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const input = normalizeRoutineInput(payload, exerciseLookup);
  const entityRef = await ensureTrainingRoutineEntityRef(ctx, existing);
  const slug = await allocateUniqueSlug(
    input.slug,
    (nextSlug) => Promise.resolve(findTrainingRoutineBySlugSync(sqlite, nextSlug)),
    existing?.id || null,
  );
  const routineId = existing?.id || randomUUID();
  const timestamp = nowIso();
  const flattenedSteps = flattenTrainingStructureSteps(input.structure).filter((entry) => entry.type === "step");
  const exerciseSteps = flattenedSteps.filter((step) => step.stepKind !== "rest" && step.exerciseId);

  sqlite.prepare(`
    INSERT INTO training_routines (
      id, entity_ref_id, title, slug, summary, notes, structure_json, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @title, @slug, @summary, @notes, @structure_json, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      structure_json = excluded.structure_json,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: routineId,
    entity_ref_id: String((entityRef as any).id),
    title: input.title,
    slug,
    summary: input.summary,
    notes: input.notes,
    structure_json: JSON.stringify(input.structure || []),
    status: "active",
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
  });

  sqlite.prepare("DELETE FROM training_routine_steps WHERE routine_id = ?").run(routineId);

  const savedRow = sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE id = ?
    LIMIT 1
  `).get(routineId);

  const savedRoutine = savedRow ? normalizeRoutineRecord(ctx, savedRow) : null;
  if (!savedRoutine) {
    throw new Error("No se pudo guardar la rutina.");
  }

  upsertTrainingSearchDocument(sqlite, {
    id: getTrainingSearchDocumentId("routine", savedRoutine.id),
    entityRefId: savedRoutine.entityRefId,
    kind: "concept",
    title: savedRoutine.title,
    subtitle: savedRoutine.searchSummary || savedRoutine.summary,
    body: [
      savedRoutine.summary,
      savedRoutine.notes,
      savedRoutine.searchSummary ? `Estructura: ${savedRoutine.searchSummary}` : null,
    ].filter(Boolean).join("\n\n"),
    metadata: {
      pluginId: TRAINING_PLUGIN_ID,
      domain: "training",
      type: "routine",
      routineId: savedRoutine.id,
      stepCount: flattenedSteps.length,
      exerciseIds: exerciseSteps.map((step) => step.exerciseId).filter(Boolean),
    },
  });

  return savedRoutine;
}

async function deleteTrainingExercise(ctx: NexusBackendPluginContext, exerciseId: string) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText(exerciseId);

  if (!normalizedId) {
    throw new Error("Falta el id del ejercicio.");
  }

  const existing = sqlite.prepare(`
    SELECT id
    FROM training_exercises
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);

  if (!existing) {
    throw new Error("No se encontro el ejercicio a borrar.");
  }

  deleteTrainingSearchDocument(sqlite, getTrainingSearchDocumentId("exercise", normalizedId));
  sqlite.prepare("DELETE FROM training_exercises WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}

async function deleteTrainingRoutine(ctx: NexusBackendPluginContext, routineId: string) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText(routineId);

  if (!normalizedId) {
    throw new Error("Falta el id de la rutina.");
  }

  const existing = sqlite.prepare(`
    SELECT id
    FROM training_routines
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);

  if (!existing) {
    throw new Error("No se encontro la rutina a borrar.");
  }

  deleteTrainingSearchDocument(sqlite, getTrainingSearchDocumentId("routine", normalizedId));
  sqlite.prepare("DELETE FROM training_routine_assignments WHERE routine_id = ?").run(normalizedId);
  sqlite.prepare("DELETE FROM training_routines WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}

async function saveTrainingAssignment(ctx: NexusBackendPluginContext, payload: any) {
  const sqlite = getSqlite(ctx);
  const requestedId = normalizeOptionalText(payload?.id);
  const existing = requestedId
    ? sqlite.prepare(`
        SELECT *
        FROM training_routine_assignments
        WHERE id = ?
        LIMIT 1
      `).get(requestedId)
    : null;
  const input = normalizeTrainingAssignmentInput(payload, {
    existingAssignment: existing
      ? {
          routineId: String(existing.routine_id),
          scheduleType: String(existing.schedule_type),
          scheduleConfigJson: parseRowJson(existing.schedule_config_json, {}),
          startDate: String(existing.start_date),
          endDate: existing.end_date ? String(existing.end_date) : null,
          time: existing.time ? String(existing.time) : null,
          priority: Number(existing.priority || 1),
          status: String(existing.status || "active"),
          completionMode: String(existing.completion_mode || "yes-no"),
        }
      : null,
  });
  const routine = listTrainingRoutinesSync(ctx).find((entry) => entry.id === input.routineId) || null;

  if (!routine) {
    throw new Error("No encontramos la rutina seleccionada.");
  }

  const assignmentId = existing?.id || randomUUID();
  const timestamp = nowIso();

  sqlite.prepare(`
    INSERT INTO training_routine_assignments (
      id, routine_id, schedule_type, schedule_config_json, start_date, end_date, time,
      priority, status, completion_mode, created_at, updated_at
    ) VALUES (
      @id, @routine_id, @schedule_type, @schedule_config_json, @start_date, @end_date, @time,
      @priority, @status, @completion_mode, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      routine_id = excluded.routine_id,
      schedule_type = excluded.schedule_type,
      schedule_config_json = excluded.schedule_config_json,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      time = excluded.time,
      priority = excluded.priority,
      status = excluded.status,
      completion_mode = excluded.completion_mode,
      updated_at = excluded.updated_at
  `).run({
    id: assignmentId,
    routine_id: input.routineId,
    schedule_type: input.scheduleType,
    schedule_config_json: JSON.stringify(input.scheduleConfigJson || {}),
    start_date: input.startDate,
    end_date: input.endDate,
    time: input.time,
    priority: input.priority,
    status: input.status,
    completion_mode: input.completionMode,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
  });

  const saved = listTrainingAssignmentsSync(ctx).find((entry) => entry.id === assignmentId) || null;
  if (!saved) {
    throw new Error("No se pudo guardar la rutina programada.");
  }

  return saved;
}

async function deleteTrainingAssignment(ctx: NexusBackendPluginContext, assignmentId: string) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText(assignmentId);

  if (!normalizedId) {
    throw new Error("Falta el id de la rutina programada.");
  }

  const existing = sqlite.prepare(`
    SELECT id
    FROM training_routine_assignments
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);

  if (!existing) {
    throw new Error("No se encontro la rutina programada.");
  }

  sqlite.prepare("DELETE FROM training_routine_assignments WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}

function createProjectedTrainingOccurrence(assignment: TrainingRoutineAssignmentRecord, occurrenceDate: string, actualToday: string) {
  const isPast = compareLocalDates(occurrenceDate, actualToday) < 0;
  return {
    id: `projected:${assignment.id}:${occurrenceDate}`,
    assignmentId: assignment.id,
    occurrenceDate,
    windowStartAt: getOccurrenceWindowStartAt(occurrenceDate),
    windowEndAt: getOccurrenceWindowEndAt(occurrenceDate),
    status: isPast ? "failed" : "pending",
    resultJson: {},
    completedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isProjected: true,
  };
}

function buildTrainingQueueItem(
  occurrence: TrainingRoutineOccurrenceRecord & { isProjected?: boolean },
  assignment: TrainingRoutineAssignmentRecord,
  today: string,
  actualToday: string,
) {
  const isOverdue = compareLocalDates(occurrence.occurrenceDate, actualToday) < 0;
  const statusLabel = occurrence.status === "completed"
    ? "Completada"
    : occurrence.status === "failed"
      ? "Fallida"
      : "Pendiente";

  return {
    id: `routine:${assignment.id}:${occurrence.occurrenceDate}`,
    type: "routine",
    recordId: occurrence.id,
    assignmentId: assignment.id,
    title: assignment.routine?.title || "Rutina programada",
    category: "Entrenamiento",
    date: today,
    time: assignment.time,
    priority: assignment.priority,
    status: occurrence.status,
    completionMode: assignment.completionMode,
    isProjected: Boolean((occurrence as any).isProjected),
    isOverdue,
    statusLabel,
    summary: assignment.routine?.searchSummary || assignment.searchSummary,
    meta: assignment.scheduleType === "weekdays" ? "Dias elegidos" : "Cada dia",
    assignment,
    routine: assignment.routine,
    resultJson: occurrence.resultJson,
    raw: occurrence,
  };
}

function buildTrainingHistoryItem(
  occurrence: TrainingRoutineOccurrenceRecord & { isProjected?: boolean },
  assignment: TrainingRoutineAssignmentRecord,
) {
  const statusLabel = occurrence.status === "completed" ? "Completada" : "Fallida";

  return {
    id: `history-routine:${assignment.id}:${occurrence.occurrenceDate}`,
    type: "routine",
    recordId: occurrence.id,
    assignmentId: assignment.id,
    title: assignment.routine?.title || "Rutina programada",
    category: "Entrenamiento",
    status: occurrence.status,
    statusLabel,
    timestamp: occurrence.completedAt || `${occurrence.occurrenceDate}T23:59:59.999Z`,
    summary: occurrence.status === "completed"
      ? "Rutina registrada."
      : "La rutina no se marco en esa fecha.",
    assignment,
    routine: assignment.routine,
    raw: occurrence,
  };
}

function buildTrainingHomeItems(
  ctx: NexusBackendPluginContext,
  {
    today = todayLocalDate(),
    actualToday = todayLocalDate(),
    historyDays = TRAINING_HISTORY_DAYS,
    historyLimit = TRAINING_HOME_HISTORY_LIMIT,
  } = {},
) {
  const sqlite = getSqlite(ctx);
  const assignments = listTrainingAssignmentsSync(ctx);
  const occurrences = listTrainingOccurrencesSync(sqlite);
  const occurrenceByKey = new Map(
    occurrences.map((occurrence) => [`${occurrence.assignmentId}:${occurrence.occurrenceDate}`, occurrence]),
  );
  const dailyQueue = assignments
    .filter((assignment) => assignment.status === "active")
    .filter((assignment) => compareLocalDates(today, assignment.startDate) >= 0)
    .filter((assignment) => !assignment.endDate || compareLocalDates(today, assignment.endDate) <= 0)
    .filter((assignment) => doesScheduleMatchDate(assignment.scheduleType, assignment.scheduleConfigJson, today))
    .map((assignment) => {
      const persisted = occurrenceByKey.get(`${assignment.id}:${today}`);
      return buildTrainingQueueItem(
        persisted || createProjectedTrainingOccurrence(assignment, today, actualToday),
        assignment,
        today,
        actualToday,
      );
    });

  const historyStart = addDaysToLocalDate(actualToday, -(historyDays - 1));
  const historyEntries = [];

  for (const assignment of assignments) {
    const persistedByAssignment = occurrences.filter((entry) => entry.assignmentId === assignment.id);
    const persistedByDate = new Map(persistedByAssignment.map((entry) => [entry.occurrenceDate, entry]));
    const syntheticHistoryAllowed = assignment.status === "active" || assignment.endDate;
    const syntheticRangeEnd = assignment.endDate && compareLocalDates(assignment.endDate, addDaysToLocalDate(actualToday, -1)) < 0
      ? assignment.endDate
      : addDaysToLocalDate(actualToday, -1);
    const syntheticDates = syntheticHistoryAllowed
      ? buildOccurrenceDates({
          scheduleType: assignment.scheduleType,
          scheduleConfigJson: assignment.scheduleConfigJson,
          startDate: compareLocalDates(assignment.startDate, historyStart) > 0 ? assignment.startDate : historyStart,
          endDate: syntheticRangeEnd,
        })
      : [];

    for (const occurrenceDate of syntheticDates) {
      const persisted = persistedByDate.get(occurrenceDate);
      historyEntries.push(buildTrainingHistoryItem(
        persisted || createProjectedTrainingOccurrence(assignment, occurrenceDate, actualToday),
        assignment,
      ));
    }

    for (const occurrence of persistedByAssignment) {
      if (compareLocalDates(occurrence.occurrenceDate, historyStart) < 0 || compareLocalDates(occurrence.occurrenceDate, actualToday) > 0) {
        continue;
      }

      if (syntheticDates.includes(occurrence.occurrenceDate)) {
        continue;
      }

      historyEntries.push(buildTrainingHistoryItem(occurrence, assignment));
    }
  }

  return {
    dailyQueue,
    recentHistory: historyEntries
      .sort((left, right) => String(right?.timestamp || "").localeCompare(String(left?.timestamp || "")))
      .slice(0, historyLimit),
  };
}

export function buildTrainingHomeContribution(
  ctx: NexusBackendPluginContext,
  options: {
    today?: string;
    actualToday?: string;
    historyDays?: number;
    historyLimit?: number;
  } = {},
) {
  return buildTrainingHomeItems(ctx, options);
}

async function saveTrainingOccurrenceResult(ctx: NexusBackendPluginContext, payload: any) {
  const sqlite = getSqlite(ctx);
  const assignmentId = normalizeOptionalText(payload?.assignmentId);
  const occurrenceDate = normalizeLocalDate(payload?.occurrenceDate);
  const clear = Boolean(payload?.clear);

  if (!assignmentId) {
    throw new Error("Falta la rutina programada.");
  }

  const assignment = listTrainingAssignmentsSync(ctx).find((entry) => entry.id === assignmentId) || null;
  if (!assignment) {
    throw new Error("No encontramos la rutina programada.");
  }

  if (!doesScheduleMatchDate(assignment.scheduleType, assignment.scheduleConfigJson, occurrenceDate)) {
    throw new Error("La fecha elegida no coincide con la recurrencia.");
  }

  if (compareLocalDates(occurrenceDate, assignment.startDate) < 0) {
    throw new Error("La fecha elegida es anterior al inicio de la rutina.");
  }

  if (assignment.endDate && compareLocalDates(occurrenceDate, assignment.endDate) > 0) {
    throw new Error("La fecha elegida queda fuera de la ventana activa.");
  }

  if (clear) {
    sqlite.prepare(`
      DELETE FROM training_routine_occurrences
      WHERE assignment_id = ?
        AND occurrence_date = ?
    `).run(assignmentId, occurrenceDate);
    return { cleared: true };
  }

  const resultJson = normalizeTrainingOccurrenceResult(
    payload?.result || payload?.resultJson || {},
    assignment.completionMode,
  );
  const existing = sqlite.prepare(`
    SELECT *
    FROM training_routine_occurrences
    WHERE assignment_id = ?
      AND occurrence_date = ?
    LIMIT 1
  `).get(assignmentId, occurrenceDate);
  const occurrenceId = existing?.id || randomUUID();
  const timestamp = nowIso();

  sqlite.prepare(`
    INSERT INTO training_routine_occurrences (
      id, assignment_id, occurrence_date, window_start_at, window_end_at, status,
      result_json, completed_at, created_at, updated_at
    ) VALUES (
      @id, @assignment_id, @occurrence_date, @window_start_at, @window_end_at, @status,
      @result_json, @completed_at, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      assignment_id = excluded.assignment_id,
      occurrence_date = excluded.occurrence_date,
      window_start_at = excluded.window_start_at,
      window_end_at = excluded.window_end_at,
      status = excluded.status,
      result_json = excluded.result_json,
      completed_at = excluded.completed_at,
      updated_at = excluded.updated_at
  `).run({
    id: occurrenceId,
    assignment_id: assignmentId,
    occurrence_date: occurrenceDate,
    window_start_at: getOccurrenceWindowStartAt(occurrenceDate),
    window_end_at: getOccurrenceWindowEndAt(occurrenceDate),
    status: "completed",
    result_json: JSON.stringify(resultJson),
    completed_at: timestamp,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
  });

  return {
    occurrence: listTrainingOccurrencesSync(sqlite).find((entry) => entry.id === occurrenceId) || null,
  };
}

function migrateLegacyExerciseMusclesSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT id, entity_ref_id, muscle_loads_json, legacy_muscle_warnings_json
    FROM training_exercises
  `).all() as any[];

  for (const row of rows) {
    const parsedLoads = parseRowJson<any[]>(row.muscle_loads_json, []);
    const parsedWarnings = parseRowJson<any[]>(row.legacy_muscle_warnings_json, []);
    const currentLoads = Array.isArray(parsedLoads) ? parsedLoads : [];
    const currentWarnings = Array.isArray(parsedWarnings) ? parsedWarnings : [];
    const needsLegacyLoadMigration = currentLoads.some((entry) => (
      entry && typeof entry === "object" && ("load" in entry || entry.percentage == null)
    ));
    if ((currentLoads.length || currentWarnings.length) && !needsLegacyLoadMigration) {
      continue;
    }

    const legacyMuscles = currentLoads.length
      ? currentLoads
      : listLegacyExerciseMusclesSync(sqlite, String(row.entity_ref_id));
    if (!legacyMuscles.length && !currentWarnings.length) {
      continue;
    }

    const migrated = normalizeTrainingMuscleLoads(legacyMuscles, { includeWarnings: true });
    sqlite.prepare(`
      UPDATE training_exercises
      SET muscle_loads_json = ?,
          legacy_muscle_warnings_json = ?
      WHERE id = ?
    `).run(
      JSON.stringify(migrated.muscleLoads || []),
      JSON.stringify(migrated.warnings || []),
      String(row.id),
    );

    const refreshedRow = sqlite.prepare(`
      SELECT *
      FROM training_exercises
      WHERE id = ?
      LIMIT 1
    `).get(String(row.id));
    const refreshedExercise = refreshedRow ? normalizeExerciseRecord(ctx, refreshedRow) : null;
    if (refreshedExercise) {
      upsertTrainingExerciseSearchDocument(sqlite, refreshedExercise);
    }
  }
}

function migrateLegacyRoutineStructuresSync(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const rows = sqlite.prepare(`
    SELECT id, structure_json
    FROM training_routines
  `).all() as any[];

  for (const row of rows) {
    const structure = parseRowJson<any[]>(row.structure_json, []);
    if (structure.length) {
      continue;
    }

    const legacySteps = listLegacyRoutineStepsSync(ctx, String(row.id));
    if (!legacySteps.length) {
      continue;
    }

    sqlite.prepare(`
      UPDATE training_routines
      SET structure_json = ?
      WHERE id = ?
    `).run(
      JSON.stringify(migrateLegacyTrainingSteps(legacySteps, exerciseLookup)),
      String(row.id),
    );
  }
}

function registerTrainingSchema(ctx: NexusBackendPluginContext) {
  const sqlite = getSqlite(ctx);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS training_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      entity_ref_id TEXT NOT NULL UNIQUE REFERENCES entity_refs(id) ON DELETE CASCADE,
      concept_id TEXT UNIQUE REFERENCES concepts(id) ON DELETE SET NULL,
      template_key TEXT UNIQUE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      notes TEXT,
      exercise_type TEXT NOT NULL DEFAULT 'exercise',
      measurement_category TEXT NOT NULL DEFAULT 'strength',
      tags_json TEXT NOT NULL DEFAULT '[]',
      measurement_json TEXT NOT NULL DEFAULT '{}',
      muscle_loads_json TEXT NOT NULL DEFAULT '[]',
      legacy_muscle_warnings_json TEXT NOT NULL DEFAULT '[]',
      personal_difficulty_score REAL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_exercises_title
      ON training_exercises (title COLLATE NOCASE, title);

    CREATE TABLE IF NOT EXISTS training_muscle_concepts (
      muscle_id TEXT PRIMARY KEY NOT NULL,
      concept_id TEXT NOT NULL UNIQUE REFERENCES concepts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_system_state (
      state_key TEXT PRIMARY KEY NOT NULL,
      state_value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_routines (
      id TEXT PRIMARY KEY NOT NULL,
      entity_ref_id TEXT NOT NULL UNIQUE REFERENCES entity_refs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      notes TEXT,
      structure_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routines_title
      ON training_routines (title COLLATE NOCASE, title);

    CREATE TABLE IF NOT EXISTS training_routine_steps (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT NOT NULL REFERENCES training_routines(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      kind TEXT NOT NULL DEFAULT 'exercise',
      exercise_id TEXT REFERENCES training_exercises(id) ON DELETE SET NULL,
      exercise_title_snapshot TEXT,
      exercise_measurement_snapshot_json TEXT NOT NULL DEFAULT '{}',
      prescription_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routine_steps_routine_id
      ON training_routine_steps (routine_id, sort_order);

    CREATE TABLE IF NOT EXISTS training_routine_assignments (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT NOT NULL REFERENCES training_routines(id) ON DELETE CASCADE,
      schedule_type TEXT NOT NULL DEFAULT 'daily',
      schedule_config_json TEXT NOT NULL DEFAULT '{}',
      start_date TEXT NOT NULL,
      end_date TEXT,
      time TEXT,
      priority INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      completion_mode TEXT NOT NULL DEFAULT 'yes-no',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routine_assignments_routine_id
      ON training_routine_assignments (routine_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS training_routine_occurrences (
      id TEXT PRIMARY KEY NOT NULL,
      assignment_id TEXT NOT NULL REFERENCES training_routine_assignments(id) ON DELETE CASCADE,
      occurrence_date TEXT NOT NULL,
      window_start_at TEXT NOT NULL,
      window_end_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      result_json TEXT NOT NULL DEFAULT '{}',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_training_routine_occurrences_unique
      ON training_routine_occurrences (assignment_id, occurrence_date);

    CREATE INDEX IF NOT EXISTS idx_training_routine_occurrences_date
      ON training_routine_occurrences (occurrence_date DESC, updated_at DESC);
  `);

  ensureTableColumn(sqlite, "training_exercises", "muscle_loads_json", "TEXT NOT NULL DEFAULT '[]'");
  ensureTableColumn(sqlite, "training_exercises", "legacy_muscle_warnings_json", "TEXT NOT NULL DEFAULT '[]'");
  ensureTableColumn(sqlite, "training_exercises", "concept_id", "TEXT REFERENCES concepts(id) ON DELETE SET NULL");
  ensureTableColumn(sqlite, "training_exercises", "template_key", "TEXT");
  ensureTableColumn(sqlite, "training_exercises", "personal_difficulty_score", "REAL");
  ensureTableColumn(sqlite, "training_exercises", "exercise_type", "TEXT NOT NULL DEFAULT 'exercise'");
  ensureTableColumn(sqlite, "training_exercises", "measurement_category", "TEXT NOT NULL DEFAULT 'strength'");
  ensureTableColumn(sqlite, "training_exercises", "tags_json", "TEXT NOT NULL DEFAULT '[]'");
  ensureTableColumn(sqlite, "training_routines", "structure_json", "TEXT NOT NULL DEFAULT '[]'");

  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_training_exercises_concept_id
      ON training_exercises (concept_id);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_training_exercises_template_key
      ON training_exercises (template_key);

    CREATE TABLE IF NOT EXISTS training_muscle_concepts (
      muscle_id TEXT PRIMARY KEY NOT NULL,
      concept_id TEXT NOT NULL UNIQUE REFERENCES concepts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  sqlite.prepare(`
    UPDATE training_exercises
    SET muscle_loads_json = COALESCE(NULLIF(TRIM(muscle_loads_json), ''), '[]'),
        legacy_muscle_warnings_json = COALESCE(NULLIF(TRIM(legacy_muscle_warnings_json), ''), '[]'),
        exercise_type = COALESCE(NULLIF(TRIM(exercise_type), ''), 'exercise'),
        measurement_category = COALESCE(NULLIF(TRIM(measurement_category), ''), 'strength'),
        tags_json = COALESCE(NULLIF(TRIM(tags_json), ''), '[]'),
        template_key = NULLIF(TRIM(template_key), '')
    WHERE muscle_loads_json IS NULL
       OR TRIM(muscle_loads_json) = ''
       OR legacy_muscle_warnings_json IS NULL
       OR TRIM(legacy_muscle_warnings_json) = ''
       OR exercise_type IS NULL
       OR TRIM(exercise_type) = ''
       OR measurement_category IS NULL
       OR TRIM(measurement_category) = ''
       OR tags_json IS NULL
       OR TRIM(tags_json) = ''
       OR template_key IS NOT NULL
  `).run();

  sqlite.prepare(`
    UPDATE training_routines
    SET structure_json = COALESCE(NULLIF(TRIM(structure_json), ''), '[]')
    WHERE structure_json IS NULL
       OR TRIM(structure_json) = ''
  `).run();

  migrateLegacySearchExercisesSync(ctx);
  migrateLegacyExerciseMusclesSync(ctx);
  migrateLegacyRoutineStructuresSync(ctx);
}

const trainingPlugin: NexusBackendPluginModule = {
  ensureSchema(ctx) {
    registerTrainingSchema(ctx);
  },
  activate(ctx) {
    registerTrainingSchema(ctx);
    void ctx.lifecycle.run("life-tracker.training-seed", () => ensureTrainingConceptCoverage(ctx))
      .then(() => queueTrainingManagedMarkdownLinkSync(ctx))
      .catch((error) => {
        console.error("[life-tracker.training] No se pudo sembrar la documentacion fitness.", error);
      });

    ctx.ipc.handle("training.list", async () => {
      try {
        await ensureTrainingConceptCoverage(ctx);
        queueTrainingManagedMarkdownLinkSync(ctx);
        return createSuccess({
          exercises: listTrainingExercisesSync(ctx),
          routines: listTrainingRoutinesSync(ctx),
          assignments: listTrainingAssignmentsSync(ctx),
          muscles: enrichTrainingMuscleCatalogSync(ctx),
          regions: TRAINING_MUSCLE_REGIONS,
          groups: TRAINING_MUSCLE_GROUPS,
        } satisfies TrainingLibrarySnapshot);
      } catch (error) {
        return createError(error, "No se pudo cargar la biblioteca de entrenamientos.");
      }
    });

    ctx.ipc.handle("training.list-muscles", async (_event, payload: any) => {
      try {
        await ensureTrainingConceptCoverage(ctx);
        const query = typeof payload === "string" ? payload : normalizeOptionalText(payload?.query);
        const regionId = normalizeOptionalText(payload?.regionId);
        const groupId = normalizeOptionalText(payload?.groupId);
        const muscles = listTrainingMuscles({
          query: query || "",
          regionId: regionId || "",
          groupId: groupId || "",
        });
        return createSuccess({
          muscles: enrichTrainingMuscleCatalogSync(ctx, muscles),
          regions: TRAINING_MUSCLE_REGIONS,
          groups: TRAINING_MUSCLE_GROUPS,
        });
      } catch (error) {
        return createError(error, "No se pudo cargar la lista de musculos.");
      }
    });

    ctx.ipc.handle("training.ensure-muscle-concept", async (_event, payload: any) => {
      try {
        const muscleId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.muscleId);
        if (!muscleId) {
          throw new Error("Falta el id del musculo.");
        }

        const doc = await ensureTrainingMuscleConcept(ctx, muscleId);
        const muscle = enrichTrainingMuscleCatalogSync(
          ctx,
          TRAINING_MUSCLE_CATALOG.filter((entry) => entry.id === muscleId),
        )[0] || null;

        return createSuccess({
          doc,
          muscle,
        });
      } catch (error) {
        return createError(error, "No se pudo crear la nota del musculo.");
      }
    });

    ctx.ipc.handle("training.ensure-exercise-concept", async (_event, payload: any) => {
      try {
        const exerciseId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.exerciseId);
        if (!exerciseId) {
          throw new Error("Falta el id del ejercicio.");
        }

        const doc = await ensureTrainingExerciseConcept(ctx, exerciseId);
        const exercise = listTrainingExercisesSync(ctx).find((record) => record.id === exerciseId) || null;

        return createSuccess({
          doc,
          exercise,
        });
      } catch (error) {
        return createError(error, "No se pudo crear la nota del ejercicio.");
      }
    });

    ctx.ipc.handle("training.ensure-all-muscle-concepts", async () => {
      try {
        const docs = await ensureAllTrainingMuscleConcepts(ctx);
        return createSuccess({
          docs,
          muscles: enrichTrainingMuscleCatalogSync(ctx),
        });
      } catch (error) {
        return createError(error, "No se pudo crear la base de notas musculares.");
      }
    });

    ctx.ipc.handle("training.list-managed-docs", async () => {
      try {
        return createSuccess({
          managedDocs: await listTrainingManagedDocs(ctx),
        });
      } catch (error) {
        return createError(error, "No se pudo cargar el estado de las notas de entrenamiento.");
      }
    });

    ctx.ipc.handle("training.restore-managed-doc", async (_event, payload: any) => {
      try {
        const managedDocId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.managedDocId);
        if (!managedDocId) {
          throw new Error("Falta el id de la nota gestionada.");
        }

        return createSuccess(await restoreTrainingManagedDoc(ctx, managedDocId));
      } catch (error) {
        return createError(error, "No se pudo restaurar la nota gestionada.");
      }
    });

    ctx.ipc.handle("training.export", async (_event, payload: any) => {
      try {
        await ensureTrainingConceptCoverage(ctx);
        return createSuccess(buildTrainingTransferEnvelope(ctx, isPlainObject(payload) ? payload : {}));
      } catch (error) {
        return createError(error, "No se pudo exportar entrenamiento.");
      }
    });

    ctx.ipc.handle("training.import", async (_event, payload: any) => {
      try {
        return createSuccess(await importTrainingTransferEnvelope(ctx, payload));
      } catch (error) {
        return createError(error, "No se pudo importar entrenamiento.");
      }
    });

    ctx.ipc.handle("training.save-muscle-doc", async (_event, payload: any) => {
      try {
        const muscleId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.muscleId);
        if (!muscleId) {
          throw new Error("Falta el id del musculo.");
        }

        return createSuccess({
          muscle: await saveTrainingMuscleDocMarkdown(ctx, muscleId, typeof payload?.markdown === "string" ? payload.markdown : ""),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la nota del musculo.");
      }
    });

    ctx.ipc.handle("training.get-exercise", async (_event, payload: any) => {
      try {
        const exerciseId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.exerciseId);
        if (!exerciseId) {
          throw new Error("Falta el id del ejercicio.");
        }

        return createSuccess({
          exercise: listTrainingExercisesSync(ctx).find((record) => record.id === exerciseId) || null,
        });
      } catch (error) {
        return createError(error, "No se pudo cargar el ejercicio.");
      }
    });

    ctx.ipc.handle("training.get-routine", async (_event, payload: any) => {
      try {
        const routineId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.routineId);
        if (!routineId) {
          throw new Error("Falta el id de la rutina.");
        }

        return createSuccess({
          routine: listTrainingRoutinesSync(ctx).find((record) => record.id === routineId) || null,
        });
      } catch (error) {
        return createError(error, "No se pudo cargar la rutina.");
      }
    });

    ctx.ipc.handle("training.save-exercise", async (_event, payload: TrainingExerciseInput) => {
      try {
        return createSuccess({
          exercise: await saveTrainingExercise(ctx, payload || {}),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar el ejercicio.");
      }
    });

    ctx.ipc.handle("training.delete-exercise", async (_event, payload: any) => {
      try {
        const exerciseId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.exerciseId);
        return createSuccess({
          deleted: await deleteTrainingExercise(ctx, exerciseId),
        });
      } catch (error) {
        return createError(error, "No se pudo borrar el ejercicio.");
      }
    });

    ctx.ipc.handle("training.save-routine", async (_event, payload: TrainingRoutineInput) => {
      try {
        return createSuccess({
          routine: await saveTrainingRoutine(ctx, payload || {}),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la rutina.");
      }
    });

    ctx.ipc.handle("training.delete-routine", async (_event, payload: any) => {
      try {
        const routineId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.routineId);
        return createSuccess({
          deleted: await deleteTrainingRoutine(ctx, routineId),
        });
      } catch (error) {
        return createError(error, "No se pudo borrar la rutina.");
      }
    });

    ctx.ipc.handle("training.list-assignments", async () => {
      try {
        return createSuccess({
          assignments: listTrainingAssignmentsSync(ctx),
        });
      } catch (error) {
        return createError(error, "No se pudo cargar las rutinas programadas.");
      }
    });

    ctx.ipc.handle("training.get-assignment", async (_event, payload: any) => {
      try {
        const assignmentId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.assignmentId);
        if (!assignmentId) {
          throw new Error("Falta el id de la rutina programada.");
        }

        return createSuccess({
          assignment: listTrainingAssignmentsSync(ctx).find((record) => record.id === assignmentId) || null,
        });
      } catch (error) {
        return createError(error, "No se pudo cargar la rutina programada.");
      }
    });

    ctx.ipc.handle("training.save-assignment", async (_event, payload: any) => {
      try {
        return createSuccess({
          assignment: await saveTrainingAssignment(ctx, payload || {}),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la rutina programada.");
      }
    });

    ctx.ipc.handle("training.delete-assignment", async (_event, payload: any) => {
      try {
        const assignmentId = normalizeOptionalText(typeof payload === "string" ? payload : payload?.id || payload?.assignmentId);
        return createSuccess({
          deleted: await deleteTrainingAssignment(ctx, assignmentId),
        });
      } catch (error) {
        return createError(error, "No se pudo borrar la rutina programada.");
      }
    });

    ctx.ipc.handle("training.save-occurrence-result", async (_event, payload: any) => {
      try {
        return createSuccess(await saveTrainingOccurrenceResult(ctx, payload || {}));
      } catch (error) {
        return createError(error, "No se pudo guardar el resultado de la rutina.");
      }
    });
  },
};

export default trainingPlugin;
