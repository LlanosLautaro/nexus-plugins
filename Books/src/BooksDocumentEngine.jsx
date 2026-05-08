const { useEffect, useMemo, useState } = window.React;
import { BookIcon, ExternalIcon, RefreshIcon, ZoomInIcon, ZoomOutIcon } from "./icons.jsx";
import {
  BOOKS_LIBRARY_VIEW_ID,
  BOOK_READING_STATUSES,
  formatDateTime,
  formatPercent,
  getReadingStatusLabel,
  resolveVaultFilePath,
} from "./renderer-helpers.js";

const { ipcRenderer, shell } = window.require("electron");
const { pathToFileURL } = window.require("url");

function clampZoom(value) {
  return Math.max(50, Math.min(220, value));
}

function StatePill({ status }) {
  return (
    <span className={`booksEngine__status booksEngine__status--${status || "pending"}`}>
      {getReadingStatusLabel(status)}
    </span>
  );
}

export default function BooksDocumentEngine({ itemId, filePath, hostApi }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [zoom, setZoom] = useState(100);
  const resolvedFilePath = useMemo(() => resolveVaultFilePath(filePath), [filePath]);

  const viewerUrl = useMemo(() => {
    if (!resolvedFilePath) {
      return "";
    }

    return `${pathToFileURL(resolvedFilePath).href}#toolbar=1&navpanes=0&zoom=${zoom}`;
  }, [resolvedFilePath, zoom]);

  useEffect(() => {
    if (!itemId) {
      return undefined;
    }

    let cancelled = false;

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
          <iframe
            key={`${viewerUrl}:${reloadToken}`}
            className="booksEngine__frame"
            title={book?.title || "Books document"}
            src={viewerUrl}
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
