const { useCallback, useEffect, useMemo, useRef, useState } = window.React;
import {
  BookIcon,
  ExternalIcon,
  RefreshIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./icons.jsx";
import BooksPdfViewer from "./BooksPdfViewer.jsx";
import {
  BOOKS_LIBRARY_VIEW_ID,
  BOOK_READING_STATUSES,
  formatDateTime,
  formatPercent,
  getReadingStatusLabel,
  queueBooksEditorLogEvent,
  resolveVaultFilePath,
} from "./renderer-helpers.js";

const { ipcRenderer, shell } = window.require("electron");

const PDF_VIEWER_CLOSE_SETTLE_MS = 32;

function clampZoom(value) {
  return Math.max(50, Math.min(220, value));
}

function waitForNextPaint(count = 2) {
  return new Promise((resolve) => {
    const step = (remaining) => {
      if (remaining <= 0) {
        resolve();
        return;
      }

      window.requestAnimationFrame(() => step(remaining - 1));
    };

    step(count);
  });
}

function StatePill({ status }) {
  return (
    <span className={`booksEngine__status booksEngine__status--${status || "pending"}`}>
      {getReadingStatusLabel(status)}
    </span>
  );
}

export default function BooksDocumentEngine({ itemId, filePath, hostApi, tabId }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isClosingViewer, setIsClosingViewer] = useState(false);
  const preclosePromiseRef = useRef(null);
  const latestPayloadRef = useRef({
    filePath,
    tabId: tabId || null,
  });

  const resolvedFilePath = useMemo(() => resolveVaultFilePath(filePath), [filePath]);

  latestPayloadRef.current = {
    filePath: resolvedFilePath || filePath,
    tabId: tabId || null,
  };

  const prepareViewerForClose = useCallback((reason = "unknown") => {
    if (preclosePromiseRef.current) {
      return preclosePromiseRef.current;
    }

    const latestPayload = latestPayloadRef.current;

    queueBooksEditorLogEvent(
      "books.document.viewer.cleanup.start",
      "Books comenzo a retirar el viewer PDF.js antes de cerrar la tab.",
      {
        reason,
        tabId: latestPayload.tabId,
        filePath: latestPayload.filePath,
      },
    );

    const startedAt = performance.now();
    setIsClosingViewer(true);
    preclosePromiseRef.current = waitForNextPaint(2).then(async () => {
      await new Promise((resolve) => setTimeout(resolve, PDF_VIEWER_CLOSE_SETTLE_MS));
      preclosePromiseRef.current = null;
      queueBooksEditorLogEvent(
        "books.document.viewer.cleanup",
        "El engine PDF de Books retiro el viewer PDF.js antes de desmontarse.",
        {
          reason,
          tabId: latestPayload.tabId,
          filePath: latestPayload.filePath,
          settleDelayMs: PDF_VIEWER_CLOSE_SETTLE_MS,
          elapsedMs: Number((performance.now() - startedAt).toFixed(1)),
        },
      );
      return true;
    });

    return preclosePromiseRef.current;
  }, []);

  useEffect(() => {
    if (!tabId || typeof hostApi?.registerTabCloseHandler !== "function") {
      return undefined;
    }

    return hostApi.registerTabCloseHandler(tabId, () =>
      prepareViewerForClose("tab-close-handler"),
    );
  }, [hostApi, tabId, prepareViewerForClose]);

  useEffect(() => {
    if (!itemId) {
      return undefined;
    }

    let cancelled = false;
    setIsClosingViewer(false);

    const loadBook = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await ipcRenderer.invoke("books:getByItemId", {
          itemId,
          markOpened: true,
        });

        if (cancelled) {
          return;
        }

        if (!response?.ok) {
          throw new Error(response?.error || "No se pudo cargar el libro.");
        }

        setBook(response?.data?.book || null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el libro.");
          setBook(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBook();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const handleUpdateBook = async (patch) => {
    if (!itemId) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await ipcRenderer.invoke("books:update", {
        itemId,
        ...patch,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo actualizar el libro.");
      }

      setBook(response?.data?.book || null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar el libro.");
    } finally {
      setSaving(false);
    }
  };

  const openExternal = async () => {
    if (!resolvedFilePath) {
      return;
    }

    await shell.openPath(resolvedFilePath);
  };

  return (
    <section className="booksEngine">
      <div className="booksEngine__toolbar">
        <div className="booksEngine__toolbarGroup">
          <button type="button" onClick={() => setZoom((currentValue) => clampZoom(currentValue - 10))}>
            <ZoomOutIcon size={16} />
          </button>
          <button type="button" onClick={() => setZoom(100)}>
            {zoom}%
          </button>
          <button type="button" onClick={() => setZoom((currentValue) => clampZoom(currentValue + 10))}>
            <ZoomInIcon size={16} />
          </button>
        </div>

        <div className="booksEngine__toolbarGroup">
          <button type="button" onClick={() => setReloadToken((currentValue) => currentValue + 1)}>
            <RefreshIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              void hostApi.openView({
                viewId: BOOKS_LIBRARY_VIEW_ID,
                reuse: true,
                sourceId: "nexus.books.engine",
              })
            }
          >
            <BookIcon size={16} />
          </button>
          <button type="button" onClick={() => void openExternal()}>
            <ExternalIcon size={16} />
          </button>
        </div>
      </div>

      <div className="booksEngine__body">
        <div className="booksEngine__viewerShell">
          <BooksPdfViewer
            filePath={resolvedFilePath}
            zoom={zoom}
            reloadToken={reloadToken}
            closing={isClosingViewer}
          />
        </div>

        <aside className="booksEngine__aside">
          {loading ? (
            <div className="booksEngine__state">Cargando libro...</div>
          ) : book ? (
            <>
              <div className="booksEngine__copy">
                <span className="booksEngine__eyebrow">Books</span>
                <h1>{book.title}</h1>
                <p>{book.author || "Autor sin curar"}</p>
              </div>

              <div className="booksEngine__panel">
                <div className="booksEngine__field">
                  <span>Estado</span>
                  <StatePill status={book.readingStatus} />
                </div>

                <div className="booksEngine__choiceGroup">
                  {BOOK_READING_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={[
                        "booksEngine__choiceButton",
                        book.readingStatus === status && "is-active",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={saving}
                      onClick={() => void handleUpdateBook({ readingStatus: status })}
                    >
                      {getReadingStatusLabel(status)}
                    </button>
                  ))}
                </div>

                <div className="booksEngine__field">
                  <span>Progreso</span>
                  <div className="booksEngine__progressRow">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={book.progressPercent}
                      disabled={saving}
                      onChange={(event) =>
                        setBook((currentValue) =>
                          currentValue
                            ? {
                                ...currentValue,
                                progressPercent: Number(event.target.value),
                              }
                            : currentValue,
                        )
                      }
                      onMouseUp={() => void handleUpdateBook({ progressPercent: book.progressPercent })}
                      onTouchEnd={() => void handleUpdateBook({ progressPercent: book.progressPercent })}
                    />
                    <button
                      type="button"
                      className="booksEngine__secondaryButton"
                      disabled={saving}
                      onClick={() => void handleUpdateBook({ progressPercent: book.progressPercent })}
                    >
                      {formatPercent(book.progressPercent)}
                    </button>
                  </div>
                </div>

                <div className="booksEngine__field">
                  <span>Ultima apertura</span>
                  <strong>{formatDateTime(book.lastOpenedAt)}</strong>
                </div>

                <div className="booksEngine__field">
                  <span>Ruta</span>
                  <strong>{resolvedFilePath || filePath}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="booksEngine__state">No se pudo resolver el libro actual.</div>
          )}

          {error ? <div className="booksEngine__state booksEngine__state--error">{error}</div> : null}
        </aside>
      </div>
    </section>
  );
}
