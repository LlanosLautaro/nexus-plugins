import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import { createDevLogger } from "../../../nexus-backend/src/shared/dev-log.js";
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
const booksBackendLogger = createDevLogger("backend.plugins.books");

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

  const generateCoverPreview = async (itemId: string) => {
    if (stopped || !itemId || skippedItemIds.has(itemId)) {
      return false;
    }

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
      void generateCoverPreview(itemId)
        .catch((error) => {
          console.warn("[books] Error en la cola de precalentado de portadas:", error);
          return false;
        })
        .then((result) => {
          pending.resolve(Boolean(result));
        })
        .finally(() => {
          pendingPromises.delete(itemId);
          queuedAtByItemId.delete(itemId);
          activeCount = Math.max(0, activeCount - 1);
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
    const coverPreviewWarmQueue = createCoverPreviewWarmQueue(ctx);
    activeCoverPreviewWarmQueue = coverPreviewWarmQueue;
    ctx.registerCleanup(() => {
      if (activeCoverPreviewWarmQueue === coverPreviewWarmQueue) {
        activeCoverPreviewWarmQueue = null;
      }

      void coverPreviewWarmQueue.stop();
    });

    ctx.registerIpc("books:list", async () => {
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

    ctx.registerIpc("books:get-cover-preview", async (_event, payload: any) => {
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

    ctx.registerIpc("books:getByItemId", async (_event, payload: any) => {
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

    ctx.registerIpc("books:update", async (_event, payload: any) => {
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

    ctx.registerIpc("books:mark-opened", async (_event, payload: any) => {
      try {
        const itemId =
          typeof payload === "string"
            ? payload
            : String(payload?.itemId || "");

        if (!itemId) {
          throw new Error("Falta itemId.");
        }

        return createSuccess({
          book: await hydrateResolvedBook(ctx, await markBookOpened(ctx, itemId)),
        });
      } catch (error) {
        return createError(error, "No se pudo registrar la apertura del libro.");
      }
    });

    let reconcileQueue = Promise.resolve();
    ctx.settings.subscribe(
      (settingsValue) => {
        reconcileQueue = reconcileQueue
          .then(async () => {
            const migratedSettings = await migrateBooksAssignmentIdsIfNeeded(ctx, settingsValue);

            if (migratedSettings) {
              await ctx.settings.set(migratedSettings);
              return;
            }

            await reconcileBooksAssignments(ctx);
          })
          .catch((error) => {
            console.error("[books] Error reconciliando assignments live:", error);
          });
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
