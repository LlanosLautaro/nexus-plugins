import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import {
  buildHabitosHomeSnapshot,
  deleteHabitSync,
  deleteTaskSync,
  ensureHabitosSchema,
  nowIso,
  saveHabitSync,
  saveTaskSync,
  toggleOccurrenceSync,
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

function buildHome(sqlite: any) {
  return buildHabitosHomeSnapshot(sqlite, {
    today: todayLocalDate(),
    now: nowIso(),
  });
}

const habitosBackendPlugin: NexusBackendPluginModule = {
  ensureSchema(ctx) {
    ensureHabitosSchema(getSqlite(ctx));
  },

  activate(ctx) {
    ctx.registerIpc("habitos:get-home", async () => {
      try {
        return createSuccess(buildHome(getSqlite(ctx)));
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
        return createSuccess(buildHome(sqlite));
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
        return createSuccess(buildHome(sqlite));
      } catch (error) {
        return createError(error, "No se pudo actualizar la tarea.");
      }
    });

    ctx.registerIpc("habitos:delete-task", async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteTaskSync(sqlite, String(payload?.taskId || ""));
        return createSuccess(buildHome(sqlite));
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
        return createSuccess(buildHome(sqlite));
      } catch (error) {
        return createError(error, "No se pudo guardar el habito.");
      }
    });

    ctx.registerIpc("habitos:toggle-occurrence", async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        toggleOccurrenceSync(sqlite, String(payload?.occurrenceId || ""), {
          now: nowIso(),
        });
        return createSuccess(buildHome(sqlite));
      } catch (error) {
        return createError(error, "No se pudo actualizar la ocurrencia.");
      }
    });

    ctx.registerIpc("habitos:delete-habit", async (_event, payload: any) => {
      try {
        const sqlite = getSqlite(ctx);
        deleteHabitSync(sqlite, String(payload?.habitId || ""));
        return createSuccess(buildHome(sqlite));
      } catch (error) {
        return createError(error, "No se pudo borrar el habito.");
      }
    });
  },
};

export default habitosBackendPlugin;
