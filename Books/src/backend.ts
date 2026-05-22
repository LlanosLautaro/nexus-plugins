import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
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

const COVER_PREVIEW_WARM_CONCURRENCY = 3;
const COVER_PREVIEW_LIST_PRIME_COUNT = 6;

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
  const pdfCoverPreviewRenderer = createPdfCoverPreviewRenderer();
  const pendingPromises = new Map<
    string,
    {
      promise: Promise<boolean>;
      resolve: (value: boolean) => void;
    }
  >();

  const rememberWarmFailure = (itemId: string, filePath: string, error: unknown) => {
    skippedItemIds.add(itemId);

    console.warn("[books] No se pudo precalentar la portada en backend:", {
      itemId,
      filePath,
      error,
    });
  };

  const generateCoverPreview = async (itemId: string) => {
    if (stopped || !itemId || skippedItemIds.has(itemId)) {
      return false;
    }

    const item = await ctx.requireRepositories().items.findById(itemId);

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
      rememberWarmFailure(itemId, filePath, error);
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
      try {
        const initialBooks = await listBooks(ctx);
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

        return createSuccess({
          books: prioritizedItemIds.length ? await listBooks(ctx) : initialBooks,
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
          book: await getBookByItemId(ctx, itemId, { markOpened }),
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
          book: await updateBookState(ctx, itemId, {
            readingStatus: payload?.readingStatus,
            progressPercent: payload?.progressPercent,
          }),
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
          book: await markBookOpened(ctx, itemId),
        });
      } catch (error) {
        return createError(error, "No se pudo registrar la apertura del libro.");
      }
    });

    let reconcileQueue = Promise.resolve();
    ctx.settings.subscribe(
      () => {
        reconcileQueue = reconcileQueue
          .then(() => reconcileBooksAssignments(ctx))
          .catch((error) => {
            console.error("[books] Error reconciliando assignments live:", error);
          });
      },
      { emitCurrent: true },
    );
  },

  async onItemSync(ctx, payload) {
    const book = await ensureBookRecord(ctx, payload.item, {
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

        activeCoverPreviewWarmQueue?.queue(itemId);
      }
    }
  },
};

export default booksPlugin;
