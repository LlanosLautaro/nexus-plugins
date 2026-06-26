import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import {
  buildHabitosHomeSnapshot,
  compareDailyQueueItems,
  clearCategoryReferencesSync,
  deleteHabitSync,
  deleteHabitCategorySync,
  deleteTaskSync,
  ensureHabitosSchema,
  normalizeLocalDate,
  nowIso,
  renameCategoryReferencesSync,
  saveHabitCategorySync,
  saveHabitSync,
  saveTaskSync,
  setOccurrenceQuantitySync,
  toggleOccurrenceSync,
  toggleOccurrenceChecklistItemSync,
  toggleTaskSync,
  todayLocalDate,
} from "./habitos-core.js";
import financeBackendPlugin from "./finance/backend.ts";
import trainingBackendPlugin, { buildTrainingHomeContribution } from "./training/backend.ts";

const LIFE_TRACKER_HABITS_CHANNEL_PREFIX = "life-tracker:habits";

function createSuccess(data: unknown) {
  return {
    ok: true,
    data,
  };
}

function createError(error: unknown, fallbackMessage: string) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage,
  };
}

function getSqlite(ctx: NexusBackendPluginContext) {
  return ctx.requireRepositories().sqlite;
}

function resolveViewDate(dateValue: unknown) {
  return normalizeLocalDate(dateValue, todayLocalDate());
}

function compareHistoryEntries(left: any, right: any) {
  return String(right?.timestamp || "").localeCompare(String(left?.timestamp || ""));
}

function buildHome(sqlite: any, dateValue?: unknown) {
  const actualToday = todayLocalDate();
  const today = resolveViewDate(dateValue);
  const baseHome = buildHabitosHomeSnapshot(sqlite, {
    today,
    actualToday,
    now: nowIso(),
  });
  const trainingHome = buildTrainingHomeContribution(({
    requireRepositories() {
      return {
        sqlite,
      };
    },
  }) as NexusBackendPluginContext, {
    today,
    actualToday,
    historyLimit: Math.max(8, Array.isArray(baseHome.recentHistory) ? baseHome.recentHistory.length : 0),
  });

  return {
    ...baseHome,
    dailyQueue: [...baseHome.dailyQueue, ...trainingHome.dailyQueue].sort(compareDailyQueueItems),
    recentHistory: [...baseHome.recentHistory, ...trainingHome.recentHistory]
      .sort(compareHistoryEntries)
      .slice(0, Math.max(8, Array.isArray(baseHome.recentHistory) ? baseHome.recentHistory.length : 0)),
  };
}

const lifeTrackerBackendPlugin: NexusBackendPluginModule = {
  ensureSchema(ctx) {
    ensureHabitosSchema(getSqlite(ctx));
    financeBackendPlugin.ensureSchema?.(ctx);
    trainingBackendPlugin.ensureSchema?.(ctx);
  },

  activate(ctx) {
    financeBackendPlugin.activate?.(ctx);
    trainingBackendPlugin.activate?.(ctx);

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:get-home`, async (_event, payload: any) => {
      try {
        return createSuccess(buildHome(getSqlite(ctx), payload?.date));
      } catch (error) {
        return createError(error, "No se pudo cargar Life Tracker.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-task`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        saveTaskSync(sqlite, payload, {
          today: todayLocalDate(),
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar la tarea.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-task`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleTaskSync(sqlite, String(payload?.taskId || ""), {
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar la tarea.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-task`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteTaskSync(sqlite, String(payload?.taskId || ""));
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar la tarea.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-habit`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        saveHabitSync(sqlite, payload, {
          today: todayLocalDate(),
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar el habito.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleOccurrenceSync(sqlite, String(payload?.occurrenceId || ""), {
          now: nowIso(),
          today: todayLocalDate(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar la ocurrencia.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:set-occurrence-quantity`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        setOccurrenceQuantitySync(sqlite, String(payload?.occurrenceId || ""), payload?.value, {
          now: nowIso(),
          today: todayLocalDate(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar la cantidad diaria.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence-checklist-item`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleOccurrenceChecklistItemSync(
          sqlite,
          String(payload?.occurrenceId || ""),
          String(payload?.itemId || ""),
          {
            now: nowIso(),
            today: todayLocalDate(),
          },
        );
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar el checklist diario.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-habit`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteHabitSync(sqlite, String(payload?.habitId || ""));
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar el habito.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-category`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        saveHabitCategorySync(sqlite, payload, {
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo guardar la categoria.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-category`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteHabitCategorySync(sqlite, String(payload?.categoryId || ""), {
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar la categoria.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:rename-category-references`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        renameCategoryReferencesSync(
          sqlite,
          String(payload?.previousName || ""),
          String(payload?.nextName || ""),
          {
            now: nowIso(),
          },
        );
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudieron actualizar las referencias de categoria.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:clear-category-references`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        clearCategoryReferencesSync(sqlite, String(payload?.categoryName || ""), {
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudieron limpiar las referencias de categoria.");
      }
    });
  },
};

export default lifeTrackerBackendPlugin;
