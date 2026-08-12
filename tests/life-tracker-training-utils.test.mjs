import test from "node:test";
import assert from "node:assert/strict";
import {
  findTrainingMuscleByAlias,
  listTrainingMuscles,
} from "../life-tracker/src/training/training-muscles.js";
import {
  buildOccurrenceDates,
  doesScheduleMatchDate,
} from "../life-tracker/src/training/training-schedule.js";
import {
  buildTrainingRoutineSummary,
  flattenTrainingStructureSteps,
  migrateLegacyTrainingSteps,
  normalizeTrainingAssignmentInput,
  normalizeTrainingMuscleLoads,
  normalizeTrainingOccurrenceResult,
  normalizeTrainingStructure,
} from "../life-tracker/src/training/training-utils.js";

test("catalogo anatomico resuelve aliases legacy y permite filtros planos", () => {
  const lat = findTrainingMuscleByAlias("dorsales");
  assert.equal(lat?.id, "latissimus-dorsi");
  assert.equal(lat?.regionId, "upper");
  assert.equal(lat?.groupId, "back");

  const forearmMatches = listTrainingMuscles({
    query: "antebrazo",
    groupId: "forearms",
  });

  assert.ok(forearmMatches.some((entry) => entry.id === "brachioradialis"));
  assert.ok(forearmMatches.every((entry) => entry.groupId === "forearms"));
});

test("normalizeTrainingMuscleLoads migra aliases legacy, deduplica y deja warnings visibles", () => {
  const result = normalizeTrainingMuscleLoads([
    { title: "Dorsales", load: 7 },
    { title: "lat", load: 9 },
    { title: "Supinador", load: 5 },
  ], { includeWarnings: true });

  assert.equal(result.muscleLoads.length, 1);
  assert.deepEqual(result.muscleLoads[0], {
    muscleId: "latissimus-dorsi",
    percentage: 100,
    title: "Dorsal ancho",
    slug: "latissimus-dorsi",
    regionId: "upper",
    regionTitle: "Tren superior",
    groupId: "back",
    groupTitle: "Espalda",
  });
  assert.deepEqual(result.warnings, [
    {
      sourceTitle: "Supinador",
      sourceSlug: "supinador",
    },
  ]);
});

test("normalizeTrainingStructure y migrateLegacyTrainingSteps convierten bloques y pasos legacy", () => {
  const exerciseLookup = new Map([
    ["bench-press", {
      id: "bench-press",
      title: "Press banca",
      slug: "press-banca",
      measurement: { mode: "reps" },
    }],
  ]);

  const legacyStructure = migrateLegacyTrainingSteps([
    {
      kind: "exercise",
      exerciseId: "bench-press",
      exerciseTitleSnapshot: "Press banca",
      prescription: { reps: 10 },
    },
    {
      kind: "rest",
      prescription: { restSeconds: 60 },
    },
  ], exerciseLookup);

  assert.equal(legacyStructure.length, 2);
  assert.equal(legacyStructure[0].type, "step");
  assert.equal(legacyStructure[0].resolvedExercise?.title, "Press banca");
  assert.deepEqual(legacyStructure[1].prescription, {
    restSeconds: 60,
  });

  const structure = normalizeTrainingStructure([
    {
      type: "block",
      title: "Superserie",
      repeatCount: 2,
      steps: [
        {
          stepKind: "exercise",
          exerciseId: "bench-press",
          prescription: { reps: 12 },
        },
        {
          stepKind: "rest",
          prescription: { restSeconds: 45 },
        },
      ],
    },
  ], exerciseLookup);

  assert.equal(structure[0].type, "block");
  assert.equal(structure[0].steps.length, 2);
  assert.equal(flattenTrainingStructureSteps(structure).length, 2);
  assert.equal(
    buildTrainingRoutineSummary({ structure }, Object.fromEntries(exerciseLookup)),
    "2 pasos - 1 ejercicios - 1 bloques - Press banca - 12 reps - Rest 45s",
  );
});

test("buildOccurrenceDates y doesScheduleMatchDate reutilizan la recurrencia daily|weekdays", () => {
  assert.deepEqual(
    buildOccurrenceDates({
      scheduleType: "weekdays",
      scheduleConfigJson: { weekdays: [1, 4] },
      startDate: "2026-06-22",
      endDate: "2026-06-28",
    }),
    ["2026-06-22", "2026-06-25"],
  );

  assert.equal(
    doesScheduleMatchDate("weekdays", { weekdays: [1, 4] }, "2026-06-26"),
    false,
  );
  assert.equal(
    doesScheduleMatchDate("daily", {}, "2026-06-26"),
    true,
  );
});

test("normalizeTrainingAssignmentInput compacta weekdays, clamps priority y preserva detailed", () => {
  const assignment = normalizeTrainingAssignmentInput({
    routineId: "routine-a",
    scheduleType: "weekdays",
    scheduleConfigJson: { weekdays: [5, 1, 5] },
    startDate: "2026-06-25",
    time: "07:30",
    priority: "150",
    status: "active",
    completionMode: "detailed",
  });

  assert.deepEqual(assignment, {
    routineId: "routine-a",
    scheduleType: "weekdays",
    scheduleConfigJson: { weekdays: [1, 5] },
    startDate: "2026-06-25",
    endDate: null,
    time: "07:30",
    priority: 100,
    status: "active",
    completionMode: "detailed",
  });
});

test("normalizeTrainingOccurrenceResult serializa detailed y limpia entradas vacias", () => {
  assert.deepEqual(
    normalizeTrainingOccurrenceResult({
      entries: [
        {
          id: "step-a",
          stepId: "step-a",
          exerciseId: "bench-press",
          title: "Press banca",
          actual: { reps: "8", notes: "ultima serie dura" },
        },
        {
          id: "step-b",
          title: "Vacio",
          actual: {},
        },
      ],
    }, "detailed"),
    {
      mode: "detailed",
      entries: [
        {
          id: "step-a",
          stepId: "step-a",
          exerciseId: "bench-press",
          title: "Press banca",
          actual: {
            reps: 8,
            notes: "ultima serie dura",
          },
        },
      ],
    },
  );

  assert.deepEqual(
    normalizeTrainingOccurrenceResult({}, "yes-no"),
    {
      mode: "yes-no",
      completed: true,
    },
  );
});
