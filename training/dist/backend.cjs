var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nexus-plugins/training/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  default: () => backend_default
});
module.exports = __toCommonJS(backend_exports);
var import_node_crypto = require("node:crypto");

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
function normalizeTrainingSlug(value, fallback = "training") {
  const source = normalizeText(value || fallback);
  const slug = source.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
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
function buildTrainingExerciseSummary(exercise) {
  const parts = [];
  const measurementSummary = buildTrainingMeasurementUnitSummary(exercise?.measurement);
  if (measurementSummary) {
    parts.push(measurementSummary);
  }
  const muscles = Array.isArray(exercise?.muscles) ? exercise.muscles.map((muscle) => normalizeOptionalText(muscle?.title || muscle?.name || muscle)).filter(Boolean) : [];
  if (muscles.length) {
    parts.push(muscles.slice(0, 3).join(", "));
  }
  return parts.join(" - ");
}
function buildTrainingRoutineStepSummary(step, exerciseLookup = {}) {
  if (!step) {
    return "";
  }
  const kind = normalizeOptionalText(step.kind) || "exercise";
  if (kind === "rest") {
    const prescription2 = parseJsonObject(step.prescription, {});
    const restSeconds = toFiniteNumber(prescription2.restSeconds);
    const notes = normalizeOptionalText(prescription2.notes);
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
    step.exerciseTitleSnapshot || exercise?.title || step.title || "Exercise"
  );
  const prescription = parseJsonObject(step.prescription, {});
  const measurementSummary = buildTrainingMetricSummary(prescription);
  return [title, measurementSummary].filter(Boolean).join(" - ");
}
function buildTrainingRoutineSummary(routine, exerciseLookup = {}) {
  const steps = Array.isArray(routine?.steps) ? routine.steps : [];
  const exerciseSteps = steps.filter((step) => normalizeOptionalText(step?.kind) !== "rest");
  const preview = steps.slice(0, 2).map((step) => buildTrainingRoutineStepSummary(step, exerciseLookup)).filter(Boolean).join(" - ");
  const base = `${steps.length} pasos`;
  if (!exerciseSteps.length) {
    return preview ? `${base} - ${preview}` : base;
  }
  return preview ? `${base} - ${exerciseSteps.length} ejercicios - ${preview}` : `${base} - ${exerciseSteps.length} ejercicios`;
}
function isComparableTextMatch(value, query) {
  const normalizedValue = normalizeComparableText(value);
  const normalizedQuery = normalizeComparableText(query);
  if (!normalizedQuery) {
    return true;
  }
  return normalizedValue.includes(normalizedQuery);
}

// ../nexus-plugins/training/src/backend.ts
var TRAINING_PLUGIN_ID = "nexus.training";
var TRAINING_RELATION_SOURCE = "training";
var TRAINING_RELATION_TYPE = "targets";
var TRAINING_EXERCISE_KIND = "training_exercise";
var TRAINING_ROUTINE_KIND = "training_routine";
function createSuccess(data) {
  return { ok: true, data };
}
function createError(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function assertNonEmptyString(value, fieldName) {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    throw new Error(`${fieldName} es obligatorio.`);
  }
  return normalized;
}
function parseRowJson(value, fallback) {
  const parsed = parseJsonObject(value, fallback);
  return parsed;
}
function getRepositories(ctx) {
  return ctx.requireRepositories();
}
function getSqlite(ctx) {
  return getRepositories(ctx).sqlite;
}
function getTrainingSearchDocumentId(prefix, id) {
  return `${TRAINING_PLUGIN_ID}:${prefix}:${id}`;
}
function allocateUniqueSlug(baseSlug, existsBySlug, currentId = null) {
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
function findTrainingExerciseBySlugSync(sqlite, slug) {
  return sqlite.prepare(`
    SELECT *
    FROM training_exercises
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
  `).get(slug) ?? null;
}
function findTrainingRoutineBySlugSync(sqlite, slug) {
  return sqlite.prepare(`
    SELECT *
    FROM training_routines
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
  `).get(slug) ?? null;
}
function normalizeActiveConcept(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: String(row.id),
    entityRefId: row.entity_ref_id ? String(row.entity_ref_id) : null,
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    itemId: row.item_id == null ? null : String(row.item_id),
    itemPath: row.item_path == null ? null : String(row.item_path),
    searchText: `${String(row.title || "")} ${String(row.slug || "")} ${String(row.summary || "")}`.trim()
  };
}
function listMuscleConceptsSync(sqlite, query = null) {
  const rows = sqlite.prepare(`
    SELECT c.*, i.path AS item_path
    FROM concepts c
    LEFT JOIN items i ON i.id = c.item_id
    WHERE c.status = 'active'
    ORDER BY c.title COLLATE NOCASE ASC, c.title ASC
  `).all();
  const normalizedQuery = normalizeOptionalText(query);
  return rows.map((row) => normalizeActiveConcept(row)).filter((concept) => {
    if (!concept) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return isComparableTextMatch(concept.searchText, normalizedQuery);
  });
}
async function resolveExistingMuscleConcept(ctx, payload) {
  const repositories = getRepositories(ctx);
  const title = normalizeOptionalText(payload.title);
  const requestedConceptId = normalizeOptionalText(payload.conceptId);
  if (requestedConceptId) {
    const existingById = await repositories.concepts.findById(requestedConceptId);
    if (existingById) {
      return existingById;
    }
  }
  if (!title) {
    throw new Error("Falta el nombre del musculo.");
  }
  const existingByTitle = await repositories.concepts.findByTitleExact(title);
  if (existingByTitle) {
    return existingByTitle;
  }
  return null;
}
function listExerciseMuscleLinksSync(sqlite, entityRefId) {
  return sqlite.prepare(`
    SELECT
      r.id AS relation_id,
      r.from_entity_ref_id,
      r.to_entity_ref_id,
      r.metadata AS relation_metadata,
      c.id AS concept_id,
      c.entity_ref_id AS concept_entity_ref_id,
      c.title AS concept_title,
      c.slug AS concept_slug,
      c.summary AS concept_summary,
      c.item_id AS concept_item_id,
      i.path AS concept_item_path
    FROM relations r
    LEFT JOIN concepts c ON c.entity_ref_id = r.to_entity_ref_id
    LEFT JOIN items i ON i.id = c.item_id
    WHERE r.from_entity_ref_id = ?
      AND r.source = ?
      AND r.type = ?
      AND r.status = 'active'
    ORDER BY r.created_at ASC
  `).all(entityRefId, TRAINING_RELATION_SOURCE, TRAINING_RELATION_TYPE).map((row, index) => {
    const relationMetadata = parseRowJson(row.relation_metadata, {});
    return {
      relationId: String(row.relation_id),
      conceptId: row.concept_id ? String(row.concept_id) : "",
      conceptEntityRefId: row.concept_entity_ref_id ? String(row.concept_entity_ref_id) : "",
      title: String(row.concept_title || "").trim(),
      slug: String(row.concept_slug || "").trim(),
      summary: row.concept_summary == null ? null : String(row.concept_summary),
      itemId: row.concept_item_id == null ? null : String(row.concept_item_id),
      itemPath: row.concept_item_path == null ? null : String(row.concept_item_path),
      sortOrder: Number.isFinite(Number(relationMetadata.sortOrder)) ? Number(relationMetadata.sortOrder) : index
    };
  }).filter((row) => Boolean(row.conceptId));
}
function listExerciseRecordByIdSync(sqlite, exerciseId) {
  return sqlite.prepare(`
    SELECT e.*, er.id AS exercise_entity_ref_id
    FROM training_exercises e
    INNER JOIN entity_refs er ON er.id = e.entity_ref_id
    WHERE e.id = ?
      AND e.status = 'active'
    LIMIT 1
  `).get(exerciseId) ?? null;
}
function normalizeExerciseRecord(ctx, row) {
  if (!row?.id) {
    return null;
  }
  const sqlite = getSqlite(ctx);
  const muscles = listExerciseMuscleLinksSync(sqlite, String(row.exercise_entity_ref_id || row.entity_ref_id || ""));
  const measurement = parseRowJson(row.measurement_json, {});
  const normalized = {
    id: String(row.id),
    entityRefId: String(row.entity_ref_id),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    notes: row.notes == null ? null : String(row.notes),
    measurement,
    muscles,
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    searchSummary: buildTrainingExerciseSummary({
      measurement,
      muscles
    })
  };
  return normalized;
}
function listTrainingExercisesSync(ctx) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT e.*, er.id AS exercise_entity_ref_id
    FROM training_exercises e
    INNER JOIN entity_refs er ON er.id = e.entity_ref_id
    WHERE e.status = 'active'
    ORDER BY e.title COLLATE NOCASE ASC, e.title ASC
  `).all();
  return rows.map((row) => normalizeExerciseRecord(ctx, row)).filter((exercise) => Boolean(exercise));
}
function normalizeRoutineStepRecord(row) {
  if (!row?.id) {
    return null;
  }
  const kind = normalizeOptionalText(row.kind) === "rest" ? "rest" : "exercise";
  const exerciseMeasurementSnapshot = parseRowJson(row.exercise_measurement_snapshot_json, {});
  const prescription = parseRowJson(row.prescription_json, {});
  const resolvedExercise = row.exercise_id ? {
    id: String(row.exercise_id),
    title: String(row.exercise_title || row.exercise_title_snapshot || "").trim(),
    slug: String(row.exercise_slug || "").trim(),
    summary: row.exercise_summary == null ? null : String(row.exercise_summary),
    measurement: parseRowJson(row.exercise_measurement_json, exerciseMeasurementSnapshot)
  } : null;
  return {
    id: String(row.id),
    routineId: String(row.routine_id),
    sortOrder: Number(row.sort_order || 0),
    kind,
    exerciseId: row.exercise_id == null ? null : String(row.exercise_id),
    exerciseTitleSnapshot: row.exercise_title_snapshot == null ? null : String(row.exercise_title_snapshot),
    exerciseMeasurementSnapshot,
    prescription,
    resolvedExercise,
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    searchSummary: buildTrainingRoutineStepSummary(
      {
        kind,
        exerciseId: row.exercise_id == null ? null : String(row.exercise_id),
        exerciseTitleSnapshot: row.exercise_title_snapshot == null ? null : String(row.exercise_title_snapshot),
        prescription
      },
      row.exercise_id && resolvedExercise ? { [String(row.exercise_id)]: resolvedExercise } : {}
    )
  };
}
function listRoutineStepsSync(ctx, routineId) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT s.*, e.title AS exercise_title, e.slug AS exercise_slug, e.summary AS exercise_summary,
      e.measurement_json AS exercise_measurement_json
    FROM training_routine_steps s
    LEFT JOIN training_exercises e ON e.id = s.exercise_id
    WHERE s.routine_id = ?
    ORDER BY s.sort_order ASC, s.created_at ASC
  `).all(routineId);
  return rows.map((row) => normalizeRoutineStepRecord(row)).filter((step) => Boolean(step));
}
function normalizeRoutineRecord(ctx, row) {
  if (!row?.id) {
    return null;
  }
  const steps = listRoutineStepsSync(ctx, String(row.id));
  const lookup = Object.fromEntries(
    steps.filter((step) => step.exerciseId && step.resolvedExercise).map((step) => [String(step.exerciseId), step.resolvedExercise])
  );
  return {
    id: String(row.id),
    entityRefId: String(row.entity_ref_id),
    title: String(row.title || "").trim(),
    slug: String(row.slug || "").trim(),
    summary: row.summary == null ? null : String(row.summary),
    notes: row.notes == null ? null : String(row.notes),
    steps: steps.map((step) => ({
      ...step,
      searchSummary: buildTrainingRoutineStepSummary(step, lookup)
    })),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
    searchSummary: buildTrainingRoutineSummary(
      {
        steps
      },
      lookup
    )
  };
}
function listTrainingRoutinesSync(ctx) {
  const sqlite = getSqlite(ctx);
  const rows = sqlite.prepare(`
    SELECT r.*, er.id AS routine_entity_ref_id
    FROM training_routines r
    INNER JOIN entity_refs er ON er.id = r.entity_ref_id
    WHERE r.status = 'active'
    ORDER BY r.title COLLATE NOCASE ASC, r.title ASC
  `).all();
  return rows.map((row) => normalizeRoutineRecord(ctx, row)).filter((routine) => Boolean(routine));
}
function deleteTrainingSearchDocument(sqlite, documentId) {
  sqlite.prepare("DELETE FROM search_documents_fts WHERE document_id = ?").run(documentId);
  sqlite.prepare("DELETE FROM search_documents WHERE id = ?").run(documentId);
}
function upsertTrainingSearchDocument(sqlite, payload) {
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
    metadata: JSON.stringify(payload.metadata ?? {})
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
async function ensureTrainingExerciseEntityRef(ctx, payload, existingRow) {
  const repositories = getRepositories(ctx);
  if (existingRow?.entity_ref_id) {
    const entityRef = await repositories.entityRefs.findById(String(existingRow.entity_ref_id));
    if (entityRef) {
      return entityRef;
    }
  }
  return repositories.entityRefs.create({
    kind: TRAINING_EXERCISE_KIND
  });
}
async function ensureTrainingRoutineEntityRef(ctx, existingRow) {
  const repositories = getRepositories(ctx);
  if (existingRow?.entity_ref_id) {
    const entityRef = await repositories.entityRefs.findById(String(existingRow.entity_ref_id));
    if (entityRef) {
      return entityRef;
    }
  }
  return repositories.entityRefs.create({
    kind: TRAINING_ROUTINE_KIND
  });
}
async function resolveMuscleSelections(ctx, muscles) {
  const uniqueSelections = /* @__PURE__ */ new Map();
  for (const muscleEntry of muscles) {
    const conceptId = typeof muscleEntry === "string" ? muscleEntry : normalizeOptionalText(muscleEntry?.conceptId || muscleEntry?.id);
    const title = typeof muscleEntry === "string" ? muscleEntry : normalizeOptionalText(muscleEntry?.title || muscleEntry?.name);
    const concept = await resolveExistingMuscleConcept(ctx, {
      conceptId,
      title
    });
    if (!concept) {
      if (conceptId || title) {
        throw new Error(`No se encontro el concept del musculo: ${title || conceptId || "sin nombre"}.`);
      }
      continue;
    }
    uniqueSelections.set(String(concept.id), concept);
  }
  return [...uniqueSelections.values()];
}
async function saveExerciseMuscleRelations(ctx, exerciseEntityRefId, muscles, exerciseTitle) {
  const sqlite = getSqlite(ctx);
  sqlite.prepare(`
    DELETE FROM relations
    WHERE from_entity_ref_id = ?
      AND source = ?
      AND type = ?
  `).run(exerciseEntityRefId, TRAINING_RELATION_SOURCE, TRAINING_RELATION_TYPE);
  const insertRelation = sqlite.prepare(`
    INSERT INTO relations (
      id, from_entity_ref_id, to_entity_ref_id, type, source, status, metadata, created_at, updated_at
    ) VALUES (
      @id, @from_entity_ref_id, @to_entity_ref_id, @type, @source, @status, @metadata, @created_at, @updated_at
    )
  `);
  const timestamp = nowIso();
  for (const [index, muscle] of muscles.entries()) {
    insertRelation.run({
      id: (0, import_node_crypto.randomUUID)(),
      from_entity_ref_id: exerciseEntityRefId,
      to_entity_ref_id: String(muscle.entity_ref_id || muscle.entityRefId),
      type: TRAINING_RELATION_TYPE,
      source: TRAINING_RELATION_SOURCE,
      status: "active",
      metadata: JSON.stringify({
        sortOrder: index,
        muscleTitle: muscle.title,
        exerciseTitle
      }),
      created_at: timestamp,
      updated_at: timestamp
    });
  }
}
function normalizeExerciseInput(payload) {
  const title = assertNonEmptyString(payload?.title, "title");
  const summary = normalizeOptionalText(payload?.summary);
  const notes = normalizeOptionalText(payload?.notes);
  const measurement = normalizeTrainingMeasurement(payload?.measurement);
  return {
    title,
    summary,
    notes,
    measurement,
    slug: normalizeTrainingSlug(payload?.slug || title, "exercise")
  };
}
function normalizeRoutineStepInput(step, exerciseLookup) {
  const raw = typeof step === "object" && step != null ? step : {};
  const kind = normalizeOptionalText(raw.kind) === "rest" ? "rest" : "exercise";
  const exerciseId = kind === "rest" ? null : normalizeOptionalText(raw.exerciseId || raw.exercise_id);
  const exercise = exerciseId ? exerciseLookup.get(exerciseId) : null;
  return {
    kind,
    exerciseId,
    exerciseTitleSnapshot: exercise?.title || normalizeOptionalText(raw.exerciseTitleSnapshot || raw.exercise_title_snapshot) || null,
    exerciseMeasurementSnapshot: exercise?.measurement || parseRowJson(raw.exerciseMeasurementSnapshot || raw.exercise_measurement_snapshot, {}),
    prescription: normalizeTrainingPrescription(raw.prescription || raw.measurement || raw.payload)
  };
}
function normalizeRoutineInput(payload) {
  const title = assertNonEmptyString(payload?.title, "title");
  const summary = normalizeOptionalText(payload?.summary);
  const notes = normalizeOptionalText(payload?.notes);
  return {
    title,
    summary,
    notes,
    slug: normalizeTrainingSlug(payload?.slug || title, "routine")
  };
}
async function saveTrainingExercise(ctx, payload) {
  const repositories = getRepositories(ctx);
  const sqlite = repositories.sqlite;
  const requestedId = normalizeOptionalText(payload?.id);
  const existing = requestedId ? listExerciseRecordByIdSync(sqlite, requestedId) : null;
  const input = normalizeExerciseInput(payload);
  const entityRef = await ensureTrainingExerciseEntityRef(ctx, payload, existing);
  const slug = await allocateUniqueSlug(input.slug, (nextSlug) => Promise.resolve(findTrainingExerciseBySlugSync(sqlite, nextSlug)), existing?.id || null);
  const exerciseId = existing?.id || (0, import_node_crypto.randomUUID)();
  const muscleConcepts = await resolveMuscleSelections(ctx, Array.isArray(payload?.muscles) ? payload.muscles : []);
  const timestamp = nowIso();
  const measurementJson = JSON.stringify(input.measurement || {});
  sqlite.prepare(`
    INSERT INTO training_exercises (
      id, entity_ref_id, title, slug, summary, notes, measurement_json, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @title, @slug, @summary, @notes, @measurement_json, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      measurement_json = excluded.measurement_json,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: exerciseId,
    entity_ref_id: String(entityRef.id),
    title: input.title,
    slug,
    summary: input.summary,
    notes: input.notes,
    measurement_json: measurementJson,
    status: "active",
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp
  });
  await saveExerciseMuscleRelations(ctx, String(entityRef.id), muscleConcepts, input.title);
  const savedRow = listExerciseRecordByIdSync(sqlite, exerciseId);
  if (!savedRow) {
    throw new Error("No se pudo guardar el ejercicio.");
  }
  const savedExercise = normalizeExerciseRecord(ctx, savedRow);
  if (!savedExercise) {
    throw new Error("No se pudo normalizar el ejercicio guardado.");
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
      muscleConcepts.length ? `Musculos: ${muscleConcepts.map((muscle) => muscle.title).join(", ")}` : null,
      savedExercise.searchSummary ? `Medicion: ${savedExercise.searchSummary}` : null
    ].filter(Boolean).join("\n\n"),
    metadata: {
      pluginId: TRAINING_PLUGIN_ID,
      domain: "training",
      type: "exercise",
      exerciseId: savedExercise.id,
      exerciseEntityRefId: savedExercise.entityRefId,
      measurement: savedExercise.measurement,
      muscles: muscleConcepts.map((muscle) => ({
        id: muscle.id,
        entityRefId: muscle.entity_ref_id,
        title: muscle.title,
        slug: muscle.slug,
        summary: muscle.summary
      }))
    }
  });
  return savedExercise;
}
async function saveTrainingRoutine(ctx, payload) {
  const repositories = getRepositories(ctx);
  const sqlite = repositories.sqlite;
  const requestedId = normalizeOptionalText(payload?.id);
  const existing = requestedId ? sqlite.prepare(`
        SELECT *
        FROM training_routines
        WHERE id = ?
          AND status = 'active'
        LIMIT 1
      `).get(requestedId) : null;
  const input = normalizeRoutineInput(payload);
  const entityRef = await ensureTrainingRoutineEntityRef(ctx, existing);
  const slug = await allocateUniqueSlug(input.slug, (nextSlug) => Promise.resolve(findTrainingRoutineBySlugSync(sqlite, nextSlug)), existing?.id || null);
  const routineId = existing?.id || (0, import_node_crypto.randomUUID)();
  const timestamp = nowIso();
  const exerciseLookup = new Map(listTrainingExercisesSync(ctx).map((exercise) => [exercise.id, exercise]));
  const stepsInput = Array.isArray(payload?.steps) ? payload.steps : [];
  const normalizedSteps = stepsInput.map((step) => normalizeRoutineStepInput(step, exerciseLookup));
  const exerciseSteps = normalizedSteps.filter((step) => step.kind === "exercise" && step.exerciseId).map((step) => exerciseLookup.get(String(step.exerciseId))).filter(Boolean);
  sqlite.prepare(`
    INSERT INTO training_routines (
      id, entity_ref_id, title, slug, summary, notes, status, created_at, updated_at
    ) VALUES (
      @id, @entity_ref_id, @title, @slug, @summary, @notes, @status, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      entity_ref_id = excluded.entity_ref_id,
      title = excluded.title,
      slug = excluded.slug,
      summary = excluded.summary,
      notes = excluded.notes,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run({
    id: routineId,
    entity_ref_id: String(entityRef.id),
    title: input.title,
    slug,
    summary: input.summary,
    notes: input.notes,
    status: "active",
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp
  });
  const deleteSteps = sqlite.prepare("DELETE FROM training_routine_steps WHERE routine_id = ?");
  deleteSteps.run(routineId);
  const insertStep = sqlite.prepare(`
    INSERT INTO training_routine_steps (
      id, routine_id, sort_order, kind, exercise_id, exercise_title_snapshot,
      exercise_measurement_snapshot_json, prescription_json, created_at, updated_at
    ) VALUES (
      @id, @routine_id, @sort_order, @kind, @exercise_id, @exercise_title_snapshot,
      @exercise_measurement_snapshot_json, @prescription_json, @created_at, @updated_at
    )
  `);
  normalizedSteps.forEach((step, index) => {
    const exercise = step.exerciseId ? exerciseLookup.get(String(step.exerciseId)) : null;
    insertStep.run({
      id: (0, import_node_crypto.randomUUID)(),
      routine_id: routineId,
      sort_order: index,
      kind: step.kind,
      exercise_id: step.kind === "exercise" ? step.exerciseId : null,
      exercise_title_snapshot: step.kind === "exercise" ? exercise?.title || step.exerciseTitleSnapshot || null : null,
      exercise_measurement_snapshot_json: step.kind === "exercise" ? JSON.stringify(exercise?.measurement || step.exerciseMeasurementSnapshot || {}) : JSON.stringify({}),
      prescription_json: JSON.stringify(step.prescription || {}),
      created_at: timestamp,
      updated_at: timestamp
    });
  });
  const savedRow = sqlite.prepare(`
    SELECT r.*, er.id AS routine_entity_ref_id
    FROM training_routines r
    INNER JOIN entity_refs er ON er.id = r.entity_ref_id
    WHERE r.id = ?
      AND r.status = 'active'
    LIMIT 1
  `).get(routineId);
  if (!savedRow) {
    throw new Error("No se pudo guardar la rutina.");
  }
  const savedRoutine = normalizeRoutineRecord(ctx, savedRow);
  if (!savedRoutine) {
    throw new Error("No se pudo normalizar la rutina guardada.");
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
      savedRoutine.steps.length ? `Pasos:
${savedRoutine.steps.map((step, index) => `${index + 1}. ${step.searchSummary}`).join("\n")}` : null
    ].filter(Boolean).join("\n\n"),
    metadata: {
      pluginId: TRAINING_PLUGIN_ID,
      domain: "training",
      type: "routine",
      routineId: savedRoutine.id,
      routineEntityRefId: savedRoutine.entityRefId,
      stepCount: savedRoutine.steps.length,
      exerciseIds: exerciseSteps.map((exercise) => exercise?.id).filter(Boolean)
    }
  });
  return savedRoutine;
}
async function deleteTrainingExercise(ctx, exerciseId) {
  const repositories = getRepositories(ctx);
  const sqlite = repositories.sqlite;
  const normalizedId = normalizeOptionalText(exerciseId);
  if (!normalizedId) {
    throw new Error("Falta el id del ejercicio.");
  }
  const existing = listExerciseRecordByIdSync(sqlite, normalizedId);
  if (!existing) {
    throw new Error("No se encontro el ejercicio a borrar.");
  }
  const documentId = getTrainingSearchDocumentId("exercise", normalizedId);
  deleteTrainingSearchDocument(sqlite, documentId);
  sqlite.prepare("DELETE FROM training_exercises WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}
async function deleteTrainingRoutine(ctx, routineId) {
  const sqlite = getSqlite(ctx);
  const normalizedId = normalizeOptionalText(routineId);
  if (!normalizedId) {
    throw new Error("Falta el id de la rutina.");
  }
  const existing = sqlite.prepare(`
    SELECT id
    FROM training_routines
    WHERE id = ?
      AND status = 'active'
    LIMIT 1
  `).get(normalizedId);
  if (!existing) {
    throw new Error("No se encontro la rutina a borrar.");
  }
  deleteTrainingSearchDocument(sqlite, getTrainingSearchDocumentId("routine", normalizedId));
  sqlite.prepare("DELETE FROM training_routines WHERE id = ?").run(normalizedId);
  return { id: normalizedId };
}
function registerTrainingSchema(ctx) {
  const sqlite = getSqlite(ctx);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS training_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      entity_ref_id TEXT NOT NULL UNIQUE REFERENCES entity_refs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      notes TEXT,
      measurement_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_exercises_title
      ON training_exercises (title COLLATE NOCASE, title);

    CREATE INDEX IF NOT EXISTS idx_training_exercises_entity_ref_id
      ON training_exercises (entity_ref_id);

    CREATE TABLE IF NOT EXISTS training_routines (
      id TEXT PRIMARY KEY NOT NULL,
      entity_ref_id TEXT NOT NULL UNIQUE REFERENCES entity_refs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_training_routines_title
      ON training_routines (title COLLATE NOCASE, title);

    CREATE INDEX IF NOT EXISTS idx_training_routines_entity_ref_id
      ON training_routines (entity_ref_id);

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
  `);
}
var trainingPlugin = {
  ensureSchema(ctx) {
    registerTrainingSchema(ctx);
  },
  activate(ctx) {
    ctx.registerIpc("training:list", async () => {
      try {
        const exercises = listTrainingExercisesSync(ctx);
        const routines = listTrainingRoutinesSync(ctx);
        const muscles = listMuscleConceptsSync(getSqlite(ctx));
        return createSuccess({
          exercises,
          routines,
          muscles
        });
      } catch (error) {
        return createError(error, "No se pudo cargar la biblioteca de entrenamientos.");
      }
    });
    ctx.registerIpc("training:list-muscles", async (_event, payload) => {
      try {
        const query = typeof payload === "string" ? payload : normalizeOptionalText(payload?.query);
        const muscles = listMuscleConceptsSync(getSqlite(ctx), query);
        return createSuccess({ muscles });
      } catch (error) {
        return createError(error, "No se pudo cargar la lista de musculos.");
      }
    });
    ctx.registerIpc("training:resolve-muscle-concept", async (_event, payload) => {
      try {
        const concept = await resolveExistingMuscleConcept(ctx, {
          conceptId: payload?.conceptId || payload?.id || null,
          title: payload?.title || payload?.name || null,
          slug: payload?.slug || null
        });
        return createSuccess({ concept });
      } catch (error) {
        return createError(error, "No se pudo resolver el concepto del musculo.");
      }
    });
    ctx.registerIpc("training:get-exercise", async (_event, payload) => {
      try {
        const exerciseId = normalizeOptionalText(
          typeof payload === "string" ? payload : payload?.id || payload?.exerciseId
        );
        if (!exerciseId) {
          throw new Error("Falta el id del ejercicio.");
        }
        const exercise = listTrainingExercisesSync(ctx).find((record) => record.id === exerciseId) || null;
        return createSuccess({ exercise });
      } catch (error) {
        return createError(error, "No se pudo cargar el ejercicio.");
      }
    });
    ctx.registerIpc("training:get-routine", async (_event, payload) => {
      try {
        const routineId = normalizeOptionalText(
          typeof payload === "string" ? payload : payload?.id || payload?.routineId
        );
        if (!routineId) {
          throw new Error("Falta el id de la rutina.");
        }
        const routine = listTrainingRoutinesSync(ctx).find((record) => record.id === routineId) || null;
        return createSuccess({ routine });
      } catch (error) {
        return createError(error, "No se pudo cargar la rutina.");
      }
    });
    ctx.registerIpc("training:save-exercise", async (_event, payload) => {
      try {
        return createSuccess({
          exercise: await saveTrainingExercise(ctx, payload || {})
        });
      } catch (error) {
        return createError(error, "No se pudo guardar el ejercicio.");
      }
    });
    ctx.registerIpc("training:delete-exercise", async (_event, payload) => {
      try {
        const exerciseId = normalizeOptionalText(
          typeof payload === "string" ? payload : payload?.id || payload?.exerciseId
        );
        return createSuccess({
          deleted: await deleteTrainingExercise(ctx, exerciseId)
        });
      } catch (error) {
        return createError(error, "No se pudo borrar el ejercicio.");
      }
    });
    ctx.registerIpc("training:save-routine", async (_event, payload) => {
      try {
        return createSuccess({
          routine: await saveTrainingRoutine(ctx, payload || {})
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la rutina.");
      }
    });
    ctx.registerIpc("training:delete-routine", async (_event, payload) => {
      try {
        const routineId = normalizeOptionalText(
          typeof payload === "string" ? payload : payload?.id || payload?.routineId
        );
        return createSuccess({
          deleted: await deleteTrainingRoutine(ctx, routineId)
        });
      } catch (error) {
        return createError(error, "No se pudo borrar la rutina.");
      }
    });
  }
};
var backend_default = trainingPlugin;
//# sourceMappingURL=backend.cjs.map
