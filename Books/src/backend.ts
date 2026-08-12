import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "@nexus/plugin-sdk";
import {
  ensureBookRecord,
  getBookByItemId,
  listBooks,
  markBookOpened,
  reconcileBooksAssignments,
  registerBooksSchema,
  updateBookCoverPreview,
  updateBookState,
} from "./book-indexing";
import { createPdfCoverPreviewRenderer } from "./cover-preview-renderer";
import {
  normalizeRelativePath,
  readBooksEngineAssignments,
  writeBooksEngineAssignments,
} from "./plugin-settings.js";

const COVER_PREVIEW_WARM_CONCURRENCY = 3;
const COVER_PREVIEW_LIST_PRIME_COUNT = 6;
let booksBackendLogger: NexusBackendPluginContext["log"];

async function hydrateResolvedItem(ctx: NexusBackendPluginContext, item: any) {
  if (!item?.id) {
    return item;
  }

  const location = await ctx.resolveItemLocation(String(item.id));

  if (!location) {
    return item;
  }

  return {
    ...item,
    path: location.path,
    relative_path: location.relativePath,
    contentRelativePath: location.contentRelativePath,
  };
}

async function hydrateResolvedBookItems(ctx: NexusBackendPluginContext, books: any[]) {
  return Promise.all(
    (Array.isArray(books) ? books : []).map(async (book) => {
      if (!book?.item?.id) {
        return book;
      }

      return {
        ...book,
        item: await hydrateResolvedItem(ctx, book.item),
      };
    }),
  );
}

async function hydrateResolvedBook(ctx: NexusBackendPluginContext, book: any) {
  const [hydratedBook] = await hydrateResolvedBookItems(ctx, book ? [book] : []);
  return hydratedBook || book || null;
}

function getBooksCoverPreviewPriority(item: any) {
  const lastOpenedAt = Date.parse(String(item?.lastOpenedAt || "")) || 0;
  const addedAt = Date.parse(String(item?.addedAt || "")) || 0;
  return Math.max(lastOpenedAt, addedAt);
}

let activeCoverPreviewWarmQueue: ReturnType<typeof createCoverPreviewWarmQueue> | null = null;

function createCoverPreviewWarmQueue(ctx: NexusBackendPluginContext) {
  let stopped = false;
  let activeCount = 0;
  let taskActive = false;
  let taskTotal = 0;
  let taskCompleted = 0;
  let taskFailed = 0;
  let taskLastError = "";
  const queuedItemIds: string[] = [];
  const skippedItemIds = new Set<string>();
  const queuedAtByItemId = new Map<string, number>();
  const pdfCoverPreviewRenderer = createPdfCoverPreviewRenderer();
  const pendingPromises = new Map<
    string,
    {
      promise: Promise<boolean>;
      resolve: (value: boolean) => void;
    }
  >();

  const rememberWarmFailure = (itemId: string, filePath: string, error: unknown, queueWaitMs: number | null) => {
    skippedItemIds.add(itemId);
    taskLastError = error instanceof Error
      ? error.message
      : "No se pudo generar una portada.";

    booksBackendLogger.warn("books.coverWarm.failure", "Fallo precalentando portada en backend.", {
      itemId,
      filePath,
      queueWaitMs,
      queuedCount: queuedItemIds.length,
      activeCount,
    });

    console.warn("[books] No se pudo precalentar la portada en backend:", {
      itemId,
      filePath,
      queueWaitMs,
      error,
    });
  };

  const updateRuntimeTask = () => {
    if (!taskActive || stopped) {
      return;
    }

    const processedCount = taskCompleted + taskFailed;
    const pendingCount = Math.max(0, taskTotal - processedCount);
    const detail = pendingCount > 0
      ? `${pendingCount} ${pendingCount === 1 ? "portada pendiente" : "portadas pendientes"}`
      : taskFailed > 0
        ? `${taskFailed} ${taskFailed === 1 ? "portada con error" : "portadas con error"}`
        : "Finalizando portadas";

    ctx.tasks.update("books.cover-previews", {
      detail,
      progress: {
        current: processedCount,
        total: taskTotal,
        label: "portadas",
      },
    });

    if (taskFailed > 0) {
      ctx.tasks.fail("books.cover-previews", {
        message: "Algunas portadas no pudieron generarse.",
        detail: taskLastError || detail,
      });
    }

    if (queuedItemIds.length === 0 && activeCount === 0) {
      if (taskFailed === 0) {
        ctx.tasks.complete("books.cover-previews");
      }
      taskActive = false;
    }
  };

  const generateCoverPreview = async (itemId: string) => {
    if (stopped || !itemId || skippedItemIds.has(itemId)) {
      return false;
    }

    ctx.lifecycle.throwIfAborted();

    const rawItem = await ctx.requireRepositories().items.findById(itemId);
    const item = await hydrateResolvedItem(ctx, rawItem);

    if (!item || item.type !== "file") {
      return false;
    }

    const book = await ensureBookRecord(ctx, item, {
      structuralChanged: false,
      contentChanged: false,
      markOpened: false,
    });

    if (!book || book.coverPreview) {
      return Boolean(book?.coverPreview);
    }

    const filePath = String(item.path || "");
    const queuedAt = queuedAtByItemId.get(itemId);
    const queueWaitMs =
      typeof queuedAt === "number"
        ? Number((Date.now() - queuedAt).toFixed(2))
        : null;

    if (!filePath) {
      return false;
    }

    try {
      const coverPreview = await pdfCoverPreviewRenderer.render(filePath);

      ctx.lifecycle.throwIfAborted();

      if (!coverPreview) {
        skippedItemIds.add(itemId);
        return false;
      }

      await updateBookCoverPreview(ctx, itemId, {
        coverPreview,
      });
      return true;
    } catch (error) {
      rememberWarmFailure(itemId, filePath, error, queueWaitMs);
      return false;
    }
  };

  const pump = () => {
    if (stopped) {
      return;
    }

    while (activeCount < COVER_PREVIEW_WARM_CONCURRENCY && queuedItemIds.length) {
      const itemId = queuedItemIds.shift();

      if (!itemId) {
        continue;
      }

      const pending = pendingPromises.get(itemId);

      if (!pending) {
        continue;
      }

      activeCount += 1;
      void ctx.lifecycle.run("books.cover-preview", () => generateCoverPreview(itemId))
        .catch((error) => {
          if (!ctx.lifecycle.signal.aborted) {
            console.warn("[books] Error en la cola de precalentado de portadas:", error);
          }
          return false;
        })
        .then((result) => {
          if (result) {
            taskCompleted += 1;
          } else {
            taskFailed += 1;
            if (!taskLastError) {
              taskLastError = "No se pudo generar una portada.";
            }
          }
          pending.resolve(Boolean(result));
        })
        .finally(() => {
          pendingPromises.delete(itemId);
          queuedAtByItemId.delete(itemId);
          activeCount = Math.max(0, activeCount - 1);
          updateRuntimeTask();
          pump();
        });
    }
  };

  return {
    queue(itemId: string) {
      const normalizedItemId = String(itemId || "");

      if (!normalizedItemId || stopped || skippedItemIds.has(normalizedItemId)) {
        return Promise.resolve(false);
      }

      const existingPending = pendingPromises.get(normalizedItemId);

      if (existingPending) {
        return existingPending.promise;
      }

      let resolvePending!: (value: boolean) => void;
      const promise = new Promise<boolean>((resolve) => {
        resolvePending = resolve;
      });

      pendingPromises.set(normalizedItemId, {
        promise,
        resolve: resolvePending,
      });
      queuedAtByItemId.set(normalizedItemId, Date.now());
      queuedItemIds.push(normalizedItemId);
      if (!taskActive) {
        taskActive = true;
        taskTotal = 0;
        taskCompleted = 0;
        taskFailed = 0;
        taskLastError = "";
        ctx.tasks.start({
          id: "books.cover-previews",
          title: "Generando portadas",
          detail: "Preparando previews de Books",
          progress: {
            current: 0,
            total: 1,
            label: "portadas",
          },
        });
      }
      taskTotal += 1;
      updateRuntimeTask();
      pump();
      return promise;
    },

    queueMany(itemIds: string[]) {
      for (const itemId of itemIds) {
        void this.queue(itemId);
      }
    },

    async prime(itemIds: string[]) {
      const normalizedIds = itemIds
        .map((itemId) => String(itemId || ""))
        .filter(Boolean);

      if (!normalizedIds.length || stopped) {
        return;
      }

      await Promise.all(normalizedIds.map((itemId) => this.queue(itemId)));
    },

    async stop() {
      stopped = true;
      queuedItemIds.length = 0;
      skippedItemIds.clear();
      queuedAtByItemId.clear();
      for (const pending of pendingPromises.values()) {
        pending.resolve(false);
      }
      pendingPromises.clear();
      await pdfCoverPreviewRenderer.stop();
    },

    invalidate(itemId: string) {
      const normalizedItemId = String(itemId || "");

      if (!normalizedItemId) {
        return;
      }

      skippedItemIds.delete(normalizedItemId);
    },
  };
}

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

async function migrateBooksAssignmentIdsIfNeeded(ctx: NexusBackendPluginContext, settingsValue: Record<string, unknown>) {
  const assignments = readBooksEngineAssignments(settingsValue);

  if (!assignments.some((assignment) => !assignment.rootItemId && assignment.rootPath)) {
    return null;
  }

  const items = await ctx.requireRepositories().items.findAll();
  const folderEntries = await Promise.all(
    items
      .filter((item) => item?.type === "folder")
      .map(async (item) => {
        const location = await ctx.resolveItemLocation(String(item.id || ""));
        return [
          normalizeRelativePath(location?.contentRelativePath || ""),
          String(item.id || ""),
        ] as const;
      }),
  );
  const folderIdByRelativePath = new Map(
    folderEntries.filter(([relativePath, itemId]) => relativePath && itemId),
  );

  let changed = false;
  const migratedAssignments = assignments.map((assignment) => {
    if (assignment.rootItemId || !assignment.rootPath) {
      return assignment;
    }

    const resolvedRootItemId = folderIdByRelativePath.get(
      normalizeRelativePath(assignment.rootPath),
    );

    if (!resolvedRootItemId) {
      return assignment;
    }

    changed = true;
    return {
      ...assignment,
      rootItemId: resolvedRootItemId,
    };
  });

  return changed
    ? writeBooksEngineAssignments(settingsValue, migratedAssignments)
    : null;
}

const booksPlugin: NexusBackendPluginModule = {
  ensureSchema(ctx: NexusBackendPluginContext) {
    registerBooksSchema(ctx);
  },

  activate(ctx: NexusBackendPluginContext) {
    booksBackendLogger = ctx.log;
    const coverPreviewWarmQueue = createCoverPreviewWarmQueue(ctx);
    activeCoverPreviewWarmQueue = coverPreviewWarmQueue;
    const stopOnAbort = () => {
      void coverPreviewWarmQueue.stop();
    };
    ctx.lifecycle.signal.addEventListener("abort", stopOnAbort, { once: true });
    ctx.registerCleanup(async () => {
      ctx.lifecycle.signal.removeEventListener("abort", stopOnAbort);
      if (activeCoverPreviewWarmQueue === coverPreviewWarmQueue) {
        activeCoverPreviewWarmQueue = null;
      }

      await coverPreviewWarmQueue.stop();
    });

    ctx.ipc.handle("list", async () => {
      const startedAt = Date.now();
      try {
        const initialBooks = await hydrateResolvedBookItems(ctx, await listBooks(ctx));
        const uncachedBooks = initialBooks
          .filter((book) => !book?.coverPreview)
          .sort((left, right) => getBooksCoverPreviewPriority(right) - getBooksCoverPreviewPriority(left));
        const prioritizedItemIds = uncachedBooks
          .slice(0, COVER_PREVIEW_LIST_PRIME_COUNT)
          .map((book) => String(book?.itemId || ""))
          .filter(Boolean);
        const backgroundItemIds = uncachedBooks
          .slice(COVER_PREVIEW_LIST_PRIME_COUNT)
          .map((book) => String(book?.itemId || ""))
          .filter(Boolean);

        if (prioritizedItemIds.length) {
          await coverPreviewWarmQueue
            .prime(prioritizedItemIds)
            .catch((error) => {
              console.warn("[books] Fallo el precalentado prioritario de portadas:", error);
            });
        }

        if (backgroundItemIds.length) {
          coverPreviewWarmQueue.queueMany(backgroundItemIds);
        }

        const durationMs = Number((Date.now() - startedAt).toFixed(2));
        if (durationMs >= 250 || backgroundItemIds.length >= 50) {
          booksBackendLogger.warn("books.list.done", "Listado Books con trabajo de portadas asociado.", {
            durationMs,
            totalBooks: initialBooks.length,
            uncachedCount: uncachedBooks.length,
            prioritizedCount: prioritizedItemIds.length,
            backgroundQueuedCount: backgroundItemIds.length,
          });
        }

        return createSuccess({
          books: prioritizedItemIds.length
            ? await hydrateResolvedBookItems(ctx, await listBooks(ctx))
            : initialBooks,
        });
      } catch (error) {
        return createError(error, "No se pudo listar la biblioteca Books.");
      }
    });

    ctx.ipc.handle("get-cover-preview", async (_event, payload: any) => {
      try {
        const itemId =
          typeof payload === "string"
            ? payload
            : String(payload?.itemId || "");

        if (!itemId) {
          throw new Error("Falta itemId.");
        }

        const book = await getBookByItemId(ctx, itemId, { markOpened: false });

        if (!book?.coverPreview) {
          void coverPreviewWarmQueue.queue(itemId);
        }

        return createSuccess({
          itemId,
          coverPreview: book?.coverPreview || null,
        });
      } catch (error) {
        return createError(error, "No se pudo consultar la portada cacheada del libro.");
      }
    });

    ctx.ipc.handle("get-by-item-id", async (_event, payload: any) => {
      try {
        const itemId =
          typeof payload === "string"
            ? payload
            : String(payload?.itemId || "");
        const markOpened =
          typeof payload === "object" && payload != null
            ? Boolean(payload.markOpened)
            : false;

        if (!itemId) {
          throw new Error("Falta itemId.");
        }

        return createSuccess({
          book: await hydrateResolvedBook(ctx, await getBookByItemId(ctx, itemId, { markOpened })),
        });
      } catch (error) {
        return createError(error, "No se pudo cargar el libro.");
      }
    });

    ctx.ipc.handle("update", async (_event, payload: any) => {
      try {
        const itemId = String(payload?.itemId || "");

        if (!itemId) {
          throw new Error("Falta itemId.");
        }

        return createSuccess({
          book: await hydrateResolvedBook(
            ctx,
            await updateBookState(ctx, itemId, {
              readingStatus: payload?.readingStatus,
              progressPercent: payload?.progressPercent,
            }),
          ),
        });
      } catch (error) {
        return createError(error, "No se pudo actualizar el libro.");
      }
    });

    let reconcileQueue = Promise.resolve();
    ctx.settings.subscribe(
      async (settingsValue) => {
        reconcileQueue = reconcileQueue
          .then(async () => {
            ctx.lifecycle.throwIfAborted();
            const migratedSettings = await migrateBooksAssignmentIdsIfNeeded(ctx, settingsValue);

            if (migratedSettings) {
              await ctx.settings.set(migratedSettings);
              return;
            }

            ctx.lifecycle.throwIfAborted();
            await reconcileBooksAssignments(ctx);
          })
          .catch((error) => {
            console.error("[books] Error reconciliando assignments live:", error);
          });
        await reconcileQueue;
      },
      { emitCurrent: true },
    );
  },

  async onItemSync(ctx, payload) {
    const resolvedItem = await hydrateResolvedItem(ctx, payload.item);
    const book = await ensureBookRecord(ctx, resolvedItem, {
      structuralChanged: payload.structuralChanged,
      contentChanged: payload.contentChanged,
      markOpened: false,
    });

    if (book && !book.coverPreview) {
      const itemId = String(book.itemId || "");

      if (itemId) {
        if (payload.structuralChanged || payload.contentChanged) {
          activeCoverPreviewWarmQueue?.invalidate(itemId);
        }

        if (payload.structuralChanged && !payload.contentChanged) {
          booksBackendLogger.warn("books.onItemSync.structuralPreviewQueue", "Rename/move estructural llego a cola de portadas Books.", {
            itemId,
            itemPath: String(resolvedItem?.path || ""),
          });
        }

        activeCoverPreviewWarmQueue?.queue(itemId);
      }
    }
  },
};

export default booksPlugin;
