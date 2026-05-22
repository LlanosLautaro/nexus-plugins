const { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } = window.React;
import { BookIcon, RefreshIcon } from "./icons.jsx";
import { formatPercent, resolveVaultFilePath } from "./renderer-helpers.js";

const { ipcRenderer } = window.require("electron");

const BOOK_GRID_ASPECT_RATIO = 0.72;
const BOOK_GRID_BODY_HEIGHT = 114;
const BOOK_GRID_OVERSCAN_ROWS = 1;
const COVER_PREVIEW_BACKEND_RETRY_DELAYS_MS = [0, 180, 900];
const sessionCoverPreviewCache = new Map();

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

  sessionCoverPreviewCache.set(cacheKey, previewSrc);
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

function getGridMetrics(containerWidth) {
  const width = Math.max(0, Number(containerWidth) || 0);
  const columns =
    width <= 430 ? 1 : width <= 760 ? 2 : width <= 1040 ? 3 : width <= 1320 ? 4 : 5;
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

async function requestCachedCoverPreview(itemId) {
  if (!itemId) {
    return null;
  }

  const response = await ipcRenderer.invoke("books:get-cover-preview", {
    itemId,
  });

  if (!response?.ok) {
    return null;
  }

  return response?.data?.coverPreview ? String(response.data.coverPreview) : null;
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

    setPreviewSrc(cachedPreview);
    setPreviewReady(Boolean(cachedPreview));
    setShouldLoad(true);
  }, [book?.coverPreview, itemId, resolvedFilePath]);

  useEffect(() => {
    if (!shouldLoad || !resolvedFilePath || previewSrc) {
      return undefined;
    }

    let cancelled = false;

    const loadPreview = async () => {
      try {
        for (const delayMs of COVER_PREVIEW_BACKEND_RETRY_DELAYS_MS) {
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }

          if (cancelled) {
            return;
          }

          const cachedPreview = await requestCachedCoverPreview(itemId);

          if (cancelled) {
            return;
          }

          if (!cachedPreview) {
            continue;
          }

          writeSessionCoverPreview(itemId, resolvedFilePath, cachedPreview);
          setPreviewSrc(cachedPreview);
          setPreviewReady(true);
          return;
        }

        setPreviewReady(false);
      } catch {
        if (cancelled) {
          return;
        }

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
  const [gridViewportWidth, setGridViewportWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const deferredSearchValue = useDeferredValue(searchValue);

  const loadBooks = async () => {
    setError("");
    setRefreshing(true);

    try {
      const response = await ipcRenderer.invoke("books:list");

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo cargar la biblioteca Books.");
      }

      startTransition(() => {
        setBooks(Array.isArray(response?.data?.books) ? response.data.books : []);
      });
    } catch (loadError) {
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
    void loadBooks();
  }, []);

  useEffect(() => {
    const contentNode = contentRef.current;
    const measureNode = gridMeasureRef.current;

    if (!contentNode || !measureNode) {
      return undefined;
    }

    let frameId = 0;
    const updateScrollState = () => {
      frameId = 0;
      setScrollTop(contentNode.scrollTop || 0);
      setViewportHeight(contentNode.clientHeight || 0);
    };
    const handleScroll = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateScrollState);
      }
    };
    const resizeObserver = new ResizeObserver(() => {
      setGridViewportWidth(measureNode.clientWidth || 0);
      setViewportHeight(contentNode.clientHeight || 0);
    });

    resizeObserver.observe(measureNode);
    resizeObserver.observe(contentNode);
    contentNode.addEventListener("scroll", handleScroll, { passive: true });
    setGridViewportWidth(measureNode.clientWidth || 0);
    setViewportHeight(contentNode.clientHeight || 0);
    setScrollTop(contentNode.scrollTop || 0);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      contentNode.removeEventListener("scroll", handleScroll);
    };
  }, [books.length, deferredSearchValue, loading, sortBy]);

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

  const gridMetrics = useMemo(() => getGridMetrics(gridViewportWidth), [gridViewportWidth]);
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
  const virtualRange = useMemo(() => {
    if (!visibleBooks.length || !gridMetrics.columns || !gridMetrics.rowHeight) {
      return {
        startIndex: 0,
        endIndex: 0,
      };
    }

    const safeViewportHeight = Math.max(viewportHeight, gridMetrics.rowHeight);
    const startRow = Math.max(
      0,
      Math.floor(scrollTop / gridMetrics.rowHeight) - BOOK_GRID_OVERSCAN_ROWS,
    );
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + safeViewportHeight) / gridMetrics.rowHeight) + BOOK_GRID_OVERSCAN_ROWS,
    );

    return {
      startIndex: startRow * gridMetrics.columns,
      endIndex: Math.min(visibleBooks.length, endRow * gridMetrics.columns),
    };
  }, [
    gridMetrics.columns,
    gridMetrics.rowHeight,
    scrollTop,
    totalRows,
    viewportHeight,
    visibleBooks.length,
  ]);
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
    <div className="booksLibrary">
      <div className="booksLibrary__topbar">
        <div className="booksLibrary__titleBlock">
          <span className="booksLibrary__eyebrow">Plugin books</span>
          <strong>Biblioteca</strong>
        </div>

        <div className="booksLibrary__controls">
          <label className="booksLibrary__searchField">
            <span className="booksLibrary__controlLabel">Buscar</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Titulo o autor"
            />
          </label>

          <label className="booksLibrary__sortField">
            <span className="booksLibrary__controlLabel">Ordenar</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {BOOK_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="booksLibrary__iconButton"
            onClick={() => void loadBooks()}
            disabled={refreshing}
            title="Recargar biblioteca"
          >
            <RefreshIcon size={16} />
          </button>
        </div>
      </div>

      <div ref={contentRef} className="booksLibrary__content">
        {loading ? (
          <div className="booksLibrary__state">Cargando biblioteca...</div>
        ) : books.length === 0 ? (
          <div className="booksLibrary__state">
            Sin libros indexados todavia. Asigna carpetas PDF a `Books` desde Settings.
          </div>
        ) : showEmptySearchState ? (
          <div className="booksLibrary__state">
            No hay resultados para esa busqueda. Prueba con otro titulo, autor o criterio de orden.
          </div>
        ) : (
          <div ref={gridMeasureRef} className="booksLibrary__virtualViewport">
            <div className="booksLibrary__virtualGrid" style={{ height: `${totalGridHeight}px` }}>
              {virtualizedBooks.map(({ book, style }) => (
              <button
                type="button"
                key={book.itemId}
                className="booksLibrary__card"
                style={style}
                onClick={() => void handleOpenBook(book)}
                title={book.title || "Abrir PDF"}
              >
                <BookCoverPreview book={book} />

                <div className="booksLibrary__cardBody">
                  <strong className="booksLibrary__cardTitle">{book.title || "Documento"}</strong>
                  <p className="booksLibrary__cardAuthor">{book.author || "Autor sin curar"}</p>
                  <ProgressBar value={book.progressPercent} />
                </div>
              </button>
              ))}
            </div>
          </div>
        )}

        {error ? (
          <div className="booksLibrary__state booksLibrary__state--error">{error}</div>
        ) : null}
      </div>
    </div>
  );
}
