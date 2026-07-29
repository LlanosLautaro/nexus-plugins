const { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } = window.React;
import { BookIcon } from "./icons.jsx";
import { formatPercent, resolveVaultFilePath } from "./renderer-helpers.js";
import { createRendererDevLogger } from "../../../nexus-frontend/src/utils/devLog.js";
import {
  CyberIconButton,
  GalleryCard,
  GalleryCardBody,
  GalleryCardMeta,
  GalleryCardTitle,
  GalleryGrid,
  Notice,
  ReloadIcon,
  SearchField,
  SectionPanel,
  Select,
  StateBlock,
  WorkspaceBody,
  WorkspacePage,
} from "@nexus/ui";

const ipcRenderer = window.nexus.ipc;
const booksLibraryLogger = createRendererDevLogger("renderer.plugins.books");

const BOOK_GRID_ASPECT_RATIO = 0.72;
const BOOK_GRID_BODY_HEIGHT = 114;
const BOOK_GRID_OVERSCAN_ROWS = 1;
const BOOK_VIEWPORT_PRESSURE_LOG_COOLDOWN_MS = 1000;
const COVER_PREVIEW_BACKEND_RETRY_DELAYS_MS = [0, 320, 1400, 3200];
const COVER_PREVIEW_RETRY_COOLDOWN_MS = 12_000;
const sessionCoverPreviewCache = new Map();
const sessionCoverPreviewPendingCache = new Map();
const sessionCoverPreviewMissCache = new Map();

function getSessionCoverPreviewCacheKey(itemId, resolvedFilePath) {
  return String(itemId || resolvedFilePath || "");
}

function readSessionCoverPreview(itemId, resolvedFilePath) {
  const cacheKey = getSessionCoverPreviewCacheKey(itemId, resolvedFilePath);
  return cacheKey ? sessionCoverPreviewCache.get(cacheKey) || "" : "";
}

function writeSessionCoverPreview(itemId, resolvedFilePath, previewSrc) {
  const cacheKey = getSessionCoverPreviewCacheKey(itemId, resolvedFilePath);

  if (!cacheKey || !previewSrc) {
    return;
  }

  sessionCoverPreviewMissCache.delete(cacheKey);
  sessionCoverPreviewCache.set(cacheKey, previewSrc);
}

function rememberSessionCoverPreviewMiss(itemId, resolvedFilePath) {
  const cacheKey = getSessionCoverPreviewCacheKey(itemId, resolvedFilePath);

  if (!cacheKey) {
    return;
  }

  sessionCoverPreviewMissCache.set(cacheKey, Date.now());
}

function shouldRetrySessionCoverPreview(itemId, resolvedFilePath) {
  const cacheKey = getSessionCoverPreviewCacheKey(itemId, resolvedFilePath);

  if (!cacheKey) {
    return false;
  }

  const lastMissAt = sessionCoverPreviewMissCache.get(cacheKey);

  if (!lastMissAt) {
    return true;
  }

  return Date.now() - lastMissAt >= COVER_PREVIEW_RETRY_COOLDOWN_MS;
}

const BOOK_SORT_OPTIONS = [
  { value: "added", label: "Mas recientes" },
  { value: "alphabetical", label: "Alfabetico" },
  { value: "progress", label: "Progreso" },
];

function toTimestamp(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function normalizeBooksSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function compareBooks(left, right, sortBy) {
  if (sortBy === "alphabetical") {
    const titleComparison = String(left?.title || "").localeCompare(
      String(right?.title || ""),
      undefined,
      { sensitivity: "base" },
    );

    if (titleComparison !== 0) {
      return titleComparison;
    }

    return String(left?.author || "").localeCompare(String(right?.author || ""), undefined, {
      sensitivity: "base",
    });
  }

  if (sortBy === "progress") {
    const progressDifference =
      Number(right?.progressPercent || 0) - Number(left?.progressPercent || 0);

    if (progressDifference !== 0) {
      return progressDifference;
    }
  } else {
    const addedDifference = toTimestamp(right?.addedAt) - toTimestamp(left?.addedAt);

    if (addedDifference !== 0) {
      return addedDifference;
    }
  }

  return String(left?.title || "").localeCompare(String(right?.title || ""), undefined, {
    sensitivity: "base",
  });
}

function getGridMetrics(containerWidth, requestedColumns = null) {
  const width = Math.max(0, Number(containerWidth) || 0);
  const responsiveColumns =
    width <= 430 ? 1 : width <= 760 ? 2 : width <= 1040 ? 3 : width <= 1320 ? 4 : 5;
  const hasRequestedColumns =
    requestedColumns !== null
    && requestedColumns !== undefined
    && requestedColumns !== "";
  const normalizedRequestedColumns = Number(requestedColumns);
  const columns = hasRequestedColumns && Number.isFinite(normalizedRequestedColumns)
    ? Math.min(8, Math.max(1, Math.round(normalizedRequestedColumns)))
    : responsiveColumns;
  const gap = width <= 760 ? 12 : 14;
  const cardWidth =
    columns > 0 ? Math.max(0, (width - gap * Math.max(0, columns - 1)) / columns) : 0;
  const cardHeight = cardWidth > 0 ? cardWidth / BOOK_GRID_ASPECT_RATIO + BOOK_GRID_BODY_HEIGHT : 0;
  const rowHeight = cardHeight + gap;

  return {
    columns,
    gap,
    cardWidth,
    cardHeight,
    rowHeight,
  };
}

function getBookVirtualRange({
  itemCount,
  columns,
  rowHeight,
  scrollTop,
  viewportHeight,
}) {
  if (!itemCount || !columns || !rowHeight) {
    return {
      startIndex: 0,
      endIndex: 0,
    };
  }

  const totalRows = Math.ceil(itemCount / columns);
  const safeViewportHeight = Math.max(viewportHeight, rowHeight);
  const startRow = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - BOOK_GRID_OVERSCAN_ROWS,
  );
  const endRow = Math.min(
    totalRows,
    Math.ceil((scrollTop + safeViewportHeight) / rowHeight) + BOOK_GRID_OVERSCAN_ROWS,
  );

  return {
    startIndex: startRow * columns,
    endIndex: Math.min(itemCount, endRow * columns),
  };
}

async function requestCachedCoverPreview(itemId) {
  if (!itemId) {
    return null;
  }

  const startedAt = performance.now();
  const response = await ipcRenderer.invoke("books:get-cover-preview", {
    itemId,
  });
  const durationMs = Number((performance.now() - startedAt).toFixed(2));

  if (!response?.ok) {
    if (durationMs >= 150) {
      booksLibraryLogger.warn("books.coverPreview.requestError", "Fallo consultando portada cacheada.", {
        itemId,
        durationMs,
        error: response?.error || null,
      });
    }
    return null;
  }

  if (durationMs >= 250) {
    booksLibraryLogger.warn("books.coverPreview.requestSlow", "Consulta de portada cacheada lenta.", {
      itemId,
      durationMs,
      hasPreview: Boolean(response?.data?.coverPreview),
    });
  }

  return response?.data?.coverPreview ? String(response.data.coverPreview) : null;
}

function requestSessionCoverPreview(itemId, resolvedFilePath) {
  const cacheKey = getSessionCoverPreviewCacheKey(itemId, resolvedFilePath);

  if (!cacheKey || !itemId) {
    return Promise.resolve(null);
  }

  const cachedPreview = readSessionCoverPreview(itemId, resolvedFilePath);

  if (cachedPreview) {
    return Promise.resolve(cachedPreview);
  }

  const pendingPromise = sessionCoverPreviewPendingCache.get(cacheKey);

  if (pendingPromise) {
    return pendingPromise;
  }

  const nextPromise = (async () => {
    const startedAt = performance.now();
    let attempts = 0;

    for (const delayMs of COVER_PREVIEW_BACKEND_RETRY_DELAYS_MS) {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      attempts += 1;
      const previewSrc = await requestCachedCoverPreview(itemId);

      if (previewSrc) {
        writeSessionCoverPreview(itemId, resolvedFilePath, previewSrc);
        const durationMs = Number((performance.now() - startedAt).toFixed(2));

        if (attempts > 1 || durationMs >= 500) {
          booksLibraryLogger.warn("books.coverPreview.retried", "Portada obtenida tras reintentos o espera perceptible.", {
            itemId,
            attempts,
            durationMs,
          });
        }

        return previewSrc;
      }
    }

    rememberSessionCoverPreviewMiss(itemId, resolvedFilePath);
    const durationMs = Number((performance.now() - startedAt).toFixed(2));

    if (attempts > 1 || durationMs >= 500) {
      booksLibraryLogger.warn("books.coverPreview.miss", "No se obtuvo portada tras consultar cache backend.", {
        itemId,
        attempts,
        durationMs,
      });
    }

    return null;
  })()
    .catch(() => null)
    .finally(() => {
      sessionCoverPreviewPendingCache.delete(cacheKey);
    });

  sessionCoverPreviewPendingCache.set(cacheKey, nextPromise);
  return nextPromise;
}

function BookCoverPreview({ book }) {
  const filePath = book?.item?.path || "";
  const itemId = book?.itemId || "";
  const resolvedFilePath = useMemo(() => resolveVaultFilePath(filePath), [filePath]);
  const initialPreviewSrc =
    book?.coverPreview || readSessionCoverPreview(itemId, resolvedFilePath);
  const [shouldLoad, setShouldLoad] = useState(Boolean(initialPreviewSrc));
  const [previewReady, setPreviewReady] = useState(Boolean(initialPreviewSrc));
  const [previewSrc, setPreviewSrc] = useState(initialPreviewSrc);

  useEffect(() => {
    const cachedPreview =
      book?.coverPreview || readSessionCoverPreview(itemId, resolvedFilePath);

    if (book?.coverPreview) {
      writeSessionCoverPreview(itemId, resolvedFilePath, book.coverPreview);
    }

    setPreviewSrc(cachedPreview);
    setPreviewReady(Boolean(cachedPreview));
    setShouldLoad(Boolean(cachedPreview) || shouldRetrySessionCoverPreview(itemId, resolvedFilePath));
  }, [book?.coverPreview, itemId, resolvedFilePath]);

  useEffect(() => {
    if (!shouldLoad || !resolvedFilePath || previewSrc) {
      return undefined;
    }

    let cancelled = false;

    const loadPreview = async () => {
      try {
        const cachedPreview = await requestSessionCoverPreview(itemId, resolvedFilePath);

        if (cancelled) {
          return;
        }

        if (cachedPreview) {
          writeSessionCoverPreview(itemId, resolvedFilePath, cachedPreview);
          setPreviewSrc(cachedPreview);
          setPreviewReady(true);
          return;
        }

        setShouldLoad(false);
        setPreviewReady(false);
      } catch {
        if (cancelled) {
          return;
        }

        setShouldLoad(false);
        setPreviewReady(false);
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [itemId, previewSrc, resolvedFilePath, shouldLoad]);

  return (
    <div className="booksLibrary__coverFrame" aria-hidden="true">
      {previewSrc ? (
        <img
          src={previewSrc}
          className="booksLibrary__coverFrameViewport"
          alt=""
          onLoad={() => setPreviewReady(true)}
          onError={() => {
            setPreviewSrc("");
            setPreviewReady(false);
            setShouldLoad(true);
          }}
        />
      ) : null}
      {!previewReady ? (
        <div
          className="booksLibrary__coverPlaceholder"
        >
          <BookIcon size={26} />
        </div>
      ) : null}
      <div className="booksLibrary__coverShade" />
      <div className="booksLibrary__coverInteractionBlock" />
    </div>
  );
}

function ProgressBar({ value }) {
  const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="booksLibrary__progressBlock">
      <div className="booksLibrary__progressTrack">
        <span
          className="booksLibrary__progressFill"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <span className="booksLibrary__progressValue">{formatPercent(normalizedValue)}</span>
    </div>
  );
}

export default function BooksLibraryView({ ctx }) {
  const contentRef = useRef(null);
  const gridMeasureRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("added");
  const [columnOverride, setColumnOverride] = useState(null);
  const [virtualLayout, setVirtualLayout] = useState({
    gridWidth: 0,
    viewportHeight: 0,
  });
  const [virtualRange, setVirtualRange] = useState({
    startIndex: 0,
    endIndex: 0,
  });
  const viewportPressureLogRef = useRef({
    lastLoggedAt: 0,
  });
  const deferredSearchValue = useDeferredValue(searchValue);

  const loadBooks = async () => {
    setError("");
    setRefreshing(true);
    const startedAt = performance.now();

    try {
      const response = await ipcRenderer.invoke("books:list");

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo cargar la biblioteca Books.");
      }

      const nextBooks = Array.isArray(response?.data?.books) ? response.data.books : [];
      const durationMs = Number((performance.now() - startedAt).toFixed(2));

      if (durationMs >= 250 || nextBooks.length >= 100) {
        booksLibraryLogger.warn("books.library.loadDone", "Carga de biblioteca Books completada.", {
          durationMs,
          totalBooks: nextBooks.length,
          missingInlinePreviewCount: nextBooks.filter((book) => !book?.coverPreview).length,
        });
      }

      startTransition(() => {
        setBooks(nextBooks);
      });
    } catch (loadError) {
      const durationMs = Number((performance.now() - startedAt).toFixed(2));
      booksLibraryLogger.error("books.library.loadError", "Fallo cargando la biblioteca Books.", {
        durationMs,
        error:
          loadError instanceof Error
            ? {
                name: loadError.name,
                message: loadError.message,
              }
            : String(loadError),
      });
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la biblioteca Books.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    booksLibraryLogger.info("books.library.mount", "Vista BooksLibrary montada.", null);
    void loadBooks();

    return () => {
      booksLibraryLogger.info("books.library.unmount", "Vista BooksLibrary desmontada.", null);
    };
  }, []);

  const visibleBooks = useMemo(() => {
    const normalizedQuery = normalizeBooksSearchText(deferredSearchValue);
    const nextBooks = normalizedQuery
      ? books.filter((book) => {
          const searchableText = normalizeBooksSearchText(
            [book?.title, book?.author].filter(Boolean).join(" "),
          );
          return searchableText.includes(normalizedQuery);
        })
      : [...books];

    return nextBooks.sort((left, right) => compareBooks(left, right, sortBy));
  }, [books, deferredSearchValue, sortBy]);

  const gridMetrics = useMemo(
    () => getGridMetrics(virtualLayout.gridWidth, columnOverride),
    [columnOverride, virtualLayout.gridWidth],
  );
  const totalRows = useMemo(
    () =>
      gridMetrics.columns > 0
        ? Math.ceil(visibleBooks.length / gridMetrics.columns)
        : 0,
    [gridMetrics.columns, visibleBooks.length],
  );
  const totalGridHeight = useMemo(() => {
    if (!totalRows) {
      return 0;
    }

    return totalRows * gridMetrics.rowHeight - gridMetrics.gap;
  }, [gridMetrics.gap, gridMetrics.rowHeight, totalRows]);
  useEffect(() => {
    const contentNode = contentRef.current;
    const measureNode = gridMeasureRef.current;

    if (!contentNode || !measureNode) {
      return undefined;
    }

    let frameId = 0;
    const updateVirtualWindow = () => {
      const nextLayout = {
        gridWidth: measureNode.clientWidth || 0,
        viewportHeight: contentNode.clientHeight || 0,
      };
      const nextMetrics = getGridMetrics(nextLayout.gridWidth, columnOverride);
      const nextRange = getBookVirtualRange({
        itemCount: visibleBooks.length,
        columns: nextMetrics.columns,
        rowHeight: nextMetrics.rowHeight,
        scrollTop: contentNode.scrollTop || 0,
        viewportHeight: nextLayout.viewportHeight,
      });

      setVirtualLayout((currentValue) => (
        currentValue.gridWidth === nextLayout.gridWidth
        && currentValue.viewportHeight === nextLayout.viewportHeight
          ? currentValue
          : nextLayout
      ));
      setVirtualRange((currentValue) => (
        currentValue.startIndex === nextRange.startIndex
        && currentValue.endIndex === nextRange.endIndex
          ? currentValue
          : nextRange
      ));
    };
    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateVirtualWindow();
      });
    };
    const resizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(updateVirtualWindow)
      : null;

    resizeObserver?.observe(measureNode);
    resizeObserver?.observe(contentNode);
    contentNode.addEventListener("scroll", handleScroll, { passive: true });
    updateVirtualWindow();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver?.disconnect();
      contentNode.removeEventListener("scroll", handleScroll);
    };
  }, [columnOverride, loading, visibleBooks.length]);
  const virtualizedBooks = useMemo(
    () =>
      visibleBooks.slice(virtualRange.startIndex, virtualRange.endIndex).map((book, index) => {
        const absoluteIndex = virtualRange.startIndex + index;
        const row = Math.floor(absoluteIndex / gridMetrics.columns);
        const column = absoluteIndex % gridMetrics.columns;

        return {
          book,
          style: {
            position: "absolute",
            top: `${row * gridMetrics.rowHeight}px`,
            left: `${column * (gridMetrics.cardWidth + gridMetrics.gap)}px`,
            width: `${gridMetrics.cardWidth}px`,
          },
        };
      }),
    [
      gridMetrics.cardWidth,
      gridMetrics.columns,
      gridMetrics.gap,
      gridMetrics.rowHeight,
      virtualRange.endIndex,
      virtualRange.startIndex,
      visibleBooks,
    ],
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    const visiblePreviewMissCount = virtualizedBooks.filter(({ book }) => !book?.coverPreview).length;

    if (visiblePreviewMissCount < 12) {
      return;
    }

    const now = performance.now();

    if (now - viewportPressureLogRef.current.lastLoggedAt < BOOK_VIEWPORT_PRESSURE_LOG_COOLDOWN_MS) {
      return;
    }

    viewportPressureLogRef.current.lastLoggedAt = now;
    booksLibraryLogger.warn("books.library.viewportPressure", "Viewport de Books con alta presion de previews.", {
      totalBooks: books.length,
      visibleBooks: visibleBooks.length,
      renderedCards: virtualizedBooks.length,
      visiblePreviewMissCount,
    });
  }, [books.length, loading, visibleBooks.length, virtualizedBooks]);

  const handleOpenBook = async (book) => {
    if (!book?.item) {
      return;
    }

    await ctx.actions.openFile({
      item: book.item,
      sourceId: "nexus.books.library",
      reuse: false,
    });
  };

  const showEmptySearchState = !loading && books.length > 0 && visibleBooks.length === 0;

  return (
    <WorkspacePage className="booksLibrary">
      <WorkspaceBody>
        <nav className="booksLibrary__navbar" aria-label="Herramientas de biblioteca">
          <SearchField
            className="booksLibrary__searchField"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Titulo o autor"
            aria-label="Buscar por titulo o autor"
          />

          <Select
            className="booksLibrary__sortField"
            value={sortBy}
            aria-label="Ordenar biblioteca"
            onChange={(event) => setSortBy(event.target.value)}
          >
            {BOOK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <CyberIconButton
            type="button"
            onClick={() => void loadBooks()}
            disabled={refreshing}
            label="Recargar biblioteca"
          >
            <ReloadIcon size={16} />
          </CyberIconButton>
        </nav>

        {error ? (
          <Notice tone="danger">{error}</Notice>
        ) : null}

        <SectionPanel className="booksLibrary__content" padding="tight">
          {loading ? (
            <StateBlock
              eyebrow="Cargando"
              title="Estamos preparando la biblioteca"
              description="Leyendo libros, portadas y progreso guardado."
            />
          ) : books.length === 0 ? (
            <StateBlock
              centered
              eyebrow="Sin libros"
              title="Todavia no hay PDFs reclamados por Books"
              description="Asigna una carpeta PDF a Books desde Settings para empezar a poblar esta biblioteca."
            />
          ) : showEmptySearchState ? (
            <StateBlock
              centered
              eyebrow="Sin resultados"
              title="No encontramos libros para ese filtro"
              description="Prueba con otro titulo, autor o criterio de orden."
            />
          ) : (
            <div ref={contentRef} className="booksLibrary__virtualViewport">
              <GalleryGrid
                ref={gridMeasureRef}
                className="booksLibrary__virtualGrid"
                style={{ height: `${totalGridHeight}px` }}
                columns={gridMetrics.columns}
                minColumns={1}
                maxColumns={8}
                onColumnsChange={setColumnOverride}
                virtual
              >
                {virtualizedBooks.map(({ book, style }) => (
                  <GalleryCard
                    as="button"
                    type="button"
                    key={book.itemId}
                    className="booksLibrary__card"
                    style={style}
                    onClick={() => void handleOpenBook(book)}
                    aria-label={`Abrir ${book.title || "PDF"}`}
                  >
                    <BookCoverPreview book={book} />

                    <GalleryCardBody className="booksLibrary__cardBody">
                      <GalleryCardTitle className="booksLibrary__cardTitle">
                        {book.title || "Documento"}
                      </GalleryCardTitle>
                      <GalleryCardMeta as="p" className="booksLibrary__cardAuthor">
                        {book.author || "Autor sin curar"}
                      </GalleryCardMeta>
                      <ProgressBar value={book.progressPercent} />
                    </GalleryCardBody>
                  </GalleryCard>
                ))}
              </GalleryGrid>
            </div>
          )}
        </SectionPanel>
      </WorkspaceBody>
    </WorkspacePage>
  );
}
