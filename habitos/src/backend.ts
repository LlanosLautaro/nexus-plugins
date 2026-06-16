import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import {
  buildHabitosHomeSnapshot,
  deleteHabitSync,
  deleteTaskSync,
  ensureHabitosSchema,
  normalizeLocalDate,
  nowIso,
  saveHabitCategorySync,
  saveHabitSync,
  saveTaskSync,
  setOccurrenceQuantitySync,
  toggleOccurrenceSync,
  toggleOccurrenceChecklistItemSync,
  toggleTaskSync,
  todayLocalDate,
} from "./habitos-core.js";

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

function buildHome(sqlite: any, dateValue?: unknown) {
  const actualToday = todayLocalDate();
  return buildHabitosHomeSnapshot(sqlite, {
    today: resolveViewDate(dateValue),
    actualToday,
    now: nowIso(),
  });
}

const habitosBackendPlugin: NexusBackendPluginModule = {
  ensureSchema(ctx) {
    ensureHabitosSchema(getSqlite(ctx));
  },

  activate(ctx) {
    ctx.registerIpc("habitos:get-home", async (_event, payload: any) => {
      try {
        return createSuccess(buildHome(getSqlite(ctx), payload?.date));
      } catch (error) {
        return createError(error, "No se pudo cargar Habitos y tareas.");
      }
    });

    ctx.registerIpc("habitos:save-task", async (_event, payload: any) => {
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

    ctx.registerIpc("habitos:toggle-task", async (_event, payload: any) => {
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

    ctx.registerIpc("habitos:delete-task", async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteTaskSync(sqlite, String(payload?.taskId || ""));
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar la tarea.");
      }
    });

    ctx.registerIpc("habitos:save-habit", async (_event, payload: any) => {
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

    ctx.registerIpc("habitos:toggle-occurrence", async (_event, payload: any) => {
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

    ctx.registerIpc("habitos:set-occurrence-quantity", async (_event, payload: any) => {
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

    ctx.registerIpc("habitos:toggle-occurrence-checklist-item", async (_event, payload: any) => {
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

    ctx.registerIpc("habitos:delete-habit", async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteHabitSync(sqlite, String(payload?.habitId || ""));
        return createSuccess(buildHome(sqlite, payload?.date));
      } catch (error) {
        return createError(error, "No se pudo borrar el habito.");
      }
    });

    ctx.registerIpc("habitos:save-category", async (_event, payload: any) => {
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
  },
};

export default habitosBackendPlugin;
