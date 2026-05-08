import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import { electron } from "../../../nexus-backend/src/shared/electron.js";
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

const COVER_PREVIEW_SIZE = Object.freeze({
  width: 220,
  height: 320,
});
const COVER_PREVIEW_WARM_CONCURRENCY = 10;
const COVER_PREVIEW_LIST_PRIME_COUNT = 30;

let activeCoverPreviewWarmQueue: ReturnType<typeof createCoverPreviewWarmQueue> | null = null;

function createCoverPreviewWarmQueue(ctx: NexusBackendPluginContext) {
  let stopped = false;
  let activeCount = 0;
  const queuedItemIds: string[] = [];
  const pendingPromises = new Map<
    string,
    {
      promise: Promise<boolean>;
      resolve: (value: boolean) => void;
    }
  >();

  const generateCoverPreview = async (itemId: string) => {
    if (stopped || !itemId) {
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
      const thumbnail = await electron.nativeImage.createThumbnailFromPath(
        filePath,
        COVER_PREVIEW_SIZE,
      );

      if (!thumbnail || thumbnail.isEmpty()) {
        return false;
      }

      await updateBookCoverPreview(ctx, itemId, {
        coverPreview: thumbnail.toDataURL(),
      });
      return true;
    } catch (error) {
      console.warn("[books] No se pudo precalentar la portada en backend:", {
        itemId,
        filePath,
        error,
      });
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

      if (!normalizedItemId || stopped) {
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

    stop() {
      stopped = true;
      queuedItemIds.length = 0;
      for (const pending of pendingPromises.values()) {
        pending.resolve(false);
      }
      pendingPromises.clear();
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

      coverPreviewWarmQueue.stop();
    });

    ctx.registerIpc("books:list", async () => {
      try {
        const initialBooks = await listBooks(ctx);
        const uncachedItemIds = initialBooks
          .filter((book) => !book?.coverPreview)
          .map((book) => String(book?.itemId || ""))
          .filter(Boolean);

        if (uncachedItemIds.length) {
          await coverPreviewWarmQueue.prime(
            uncachedItemIds.slice(0, COVER_PREVIEW_LIST_PRIME_COUNT),
          );
          coverPreviewWarmQueue.queueMany(
            uncachedItemIds.slice(COVER_PREVIEW_LIST_PRIME_COUNT),
          );
        }

        return createSuccess({
          books: await listBooks(ctx),
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
        activeCoverPreviewWarmQueue?.queue(itemId);
      }
    }
  },
};

export default booksPlugin;
