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
  toggleTaskSubitemSync,
  toggleTaskSync,
  todayLocalDate,
} from "./habitos-core.js";
import financeBackendPlugin from "./finance/backend.ts";
import trainingBackendPlugin, {
  buildTrainingHomeContribution,
  buildTrainingManagedDocAssets,
} from "./training/backend.ts";

export { buildTrainingManagedDocAssets };

const LIFE_TRACKER_HABITS_CHANNEL_PREFIX = "life-tracker:habits";
const LIFE_TRACKER_SETTINGS_STATE_KEY = "plugins.settings.nexus.life-tracker";
const LEGACY_HABITS_SETTINGS_STATE_KEY = "plugins.settings.nexus.habitos";
const LIFE_TRACKER_CANVAS_STATE_KEY = "lifeTrackerCanvases";
const LEGACY_DASHBOARD_LAYOUTS_KEY = "dashboardLayouts";
const LEGACY_CANVAS_WIDGET_IDS = ["daily-queue", "habit-outcome", "upcoming-tasks"];

const LEGACY_DASHBOARD_DEFAULT_LAYOUTS = {
  lg: [
    { i: "daily-queue", x: 0, y: 0, w: 8, h: 13 },
    { i: "habit-outcome", x: 8, y: 0, w: 4, h: 7 },
    { i: "upcoming-tasks", x: 8, y: 7, w: 4, h: 6 },
  ],
  md: [
    { i: "daily-queue", x: 0, y: 0, w: 6, h: 13 },
    { i: "habit-outcome", x: 6, y: 0, w: 4, h: 7 },
    { i: "upcoming-tasks", x: 6, y: 7, w: 4, h: 6 },
  ],
  sm: [
    { i: "daily-queue", x: 0, y: 0, w: 6, h: 12 },
    { i: "habit-outcome", x: 0, y: 12, w: 3, h: 6 },
    { i: "upcoming-tasks", x: 3, y: 12, w: 3, h: 6 },
  ],
  xs: [
    { i: "daily-queue", x: 0, y: 0, w: 4, h: 11 },
    { i: "habit-outcome", x: 0, y: 11, w: 4, h: 6 },
    { i: "upcoming-tasks", x: 0, y: 17, w: 4, h: 6 },
  ],
  xxs: [
    { i: "daily-queue", x: 0, y: 0, w: 2, h: 10 },
    { i: "habit-outcome", x: 0, y: 10, w: 2, h: 6 },
    { i: "upcoming-tasks", x: 0, y: 16, w: 2, h: 6 },
  ],
} as const;

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

function sameLayoutPosition(left: any, right: any) {
  return Number(left?.x) === Number(right?.x)
    && Number(left?.y) === Number(right?.y)
    && Number(left?.w) === Number(right?.w)
    && Number(left?.h) === Number(right?.h);
}

function migrateLegacyCanvasLayoutSync(sqlite: any) {
  const rows = sqlite.prepare(
    "SELECT key, value FROM States WHERE key IN (?, ?)",
  ).all(LIFE_TRACKER_SETTINGS_STATE_KEY, LEGACY_HABITS_SETTINGS_STATE_KEY) as Array<{
    key: string;
    value: string | null;
  }>;
  const settingsByKey = new Map(rows.map((row) => {
    try {
      return [row.key, row.value ? JSON.parse(row.value) : null] as const;
    } catch {
      return [row.key, null] as const;
    }
  }));
  const currentSettings = settingsByKey.get(LIFE_TRACKER_SETTINGS_STATE_KEY);
  const legacySettings = settingsByKey.get(LEGACY_HABITS_SETTINGS_STATE_KEY);
  const currentCanvasState = currentSettings?.[LIFE_TRACKER_CANVAS_STATE_KEY];
  const legacyLayouts = legacySettings?.[LEGACY_DASHBOARD_LAYOUTS_KEY];

  if (!currentCanvasState?.layouts || !legacyLayouts || typeof legacyLayouts !== "object") {
    return;
  }

  let shouldRecover = false;
  for (const [breakpoint, defaults] of Object.entries(LEGACY_DASHBOARD_DEFAULT_LAYOUTS)) {
    const currentItems = Array.isArray(currentCanvasState.layouts[breakpoint])
      ? currentCanvasState.layouts[breakpoint]
      : [];
    const legacyItems = Array.isArray(legacyLayouts[breakpoint])
      ? legacyLayouts[breakpoint]
      : [];
    const currentById = new Map(currentItems.map((item: any) => [item?.i, item]));
    const legacyById = new Map(legacyItems.map((item: any) => [item?.i, item]));

    for (const defaultItem of defaults) {
      const currentItem = currentById.get(defaultItem.i);
      const legacyItem = legacyById.get(defaultItem.i);
      if (!sameLayoutPosition(currentItem, defaultItem)) {
        return;
      }
      if (!sameLayoutPosition(legacyItem, defaultItem)) {
        shouldRecover = true;
      }
    }
  }

  if (!shouldRecover) {
    return;
  }

  const recoveredLayouts = Object.fromEntries(
    Object.entries(currentCanvasState.layouts).map(([breakpoint, currentItems]) => {
      const legacyItems = Array.isArray(legacyLayouts[breakpoint]) ? legacyLayouts[breakpoint] : [];
      const legacyById = new Map(legacyItems.map((item: any) => [item?.i, item]));
      return [
        breakpoint,
        (Array.isArray(currentItems) ? currentItems : []).map((currentItem: any) => {
          if (!LEGACY_CANVAS_WIDGET_IDS.includes(currentItem?.i)) {
            return currentItem;
          }

          const legacyItem = legacyById.get(currentItem.i);
          return legacyItem
            ? { ...currentItem, ...legacyItem, i: currentItem.i, resizeHandles: currentItem.resizeHandles }
            : currentItem;
        }),
      ];
    }),
  );
  const nextSettings = {
    ...currentSettings,
    [LIFE_TRACKER_CANVAS_STATE_KEY]: {
      ...currentCanvasState,
      layouts: recoveredLayouts,
    },
  };

  sqlite.prepare(
    "UPDATE States SET value = ?, updatedAt = ? WHERE key = ?",
  ).run(JSON.stringify(nextSettings), nowIso(), LIFE_TRACKER_SETTINGS_STATE_KEY);
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
    migrateLegacyCanvasLayoutSync(getSqlite(ctx));
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

    ctx.registerIpc(`${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-task-subitem`, async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleTaskSubitemSync(
          sqlite,
          String(payload?.taskId || ""),
          String(payload?.subitemId || ""),
          {
            now: nowIso(),
          },
        );
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo actualizar el sub-item de la tarea.");
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
