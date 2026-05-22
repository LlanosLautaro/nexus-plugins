const { useEffect, useMemo, useRef, useState } = window.React;
import { BookIcon } from "./icons.jsx";
import { loadBooksPdfJsRuntime } from "./pdfjs-runtime.js";
import { queueBooksEditorLogEvent } from "./renderer-helpers.js";

const { readFile } = window.require("node:fs/promises");

const PAGE_OBSERVER_ROOT_MARGIN = "1200px 0px";
const DEFAULT_PAGE_ASPECT_RATIO = 1.414;
const VIEWER_HORIZONTAL_PADDING = 32;

function clampPositiveNumber(value, fallbackValue) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallbackValue;
}

function buildPageShellMetrics(containerWidth, aspectRatio, zoom) {
  const safeContainerWidth = clampPositiveNumber(containerWidth, 880);
  const safeAspectRatio = clampPositiveNumber(aspectRatio, DEFAULT_PAGE_ASPECT_RATIO);
  const safeZoom = clampPositiveNumber(zoom, 100);
  const availableWidth = Math.max(280, safeContainerWidth - VIEWER_HORIZONTAL_PADDING);
  const pageWidth = Math.max(240, Math.round(availableWidth * (safeZoom / 100)));
  const pageHeight = Math.max(320, Math.round(pageWidth * safeAspectRatio));

  return {
    pageWidth,
    pageHeight,
  };
}

function BooksPdfPage({
  pdfDocument,
  pageNumber,
  zoom,
  containerWidth,
  defaultAspectRatio,
  viewportRootRef,
  documentKey,
  onFirstPageRendered,
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const firstPageReportedRef = useRef(false);
  const [shouldRender, setShouldRender] = useState(pageNumber === 1);
  const [pageAspectRatio, setPageAspectRatio] = useState(defaultAspectRatio || DEFAULT_PAGE_ASPECT_RATIO);
  const [renderState, setRenderState] = useState({
    status: pageNumber === 1 ? "loading" : "idle",
    error: "",
  });

  useEffect(() => {
    setShouldRender(pageNumber === 1);
    setPageAspectRatio(defaultAspectRatio || DEFAULT_PAGE_ASPECT_RATIO);
    setRenderState({
      status: pageNumber === 1 ? "loading" : "idle",
      error: "",
    });
    firstPageReportedRef.current = false;
  }, [defaultAspectRatio, documentKey, pageNumber]);

  useEffect(() => {
    const wrapperNode = wrapperRef.current;

    if (!wrapperNode || shouldRender) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        root: viewportRootRef.current || null,
        rootMargin: PAGE_OBSERVER_ROOT_MARGIN,
      },
    );

    observer.observe(wrapperNode);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender, viewportRootRef]);

  useEffect(() => {
    if (!pdfDocument || !shouldRender || !canvasRef.current || !containerWidth) {
      return undefined;
    }

    let cancelled = false;
    let renderTask = null;
    let pdfPage = null;

    const renderPage = async () => {
      setRenderState({
        status: "loading",
        error: "",
      });

      try {
        pdfPage = await pdfDocument.getPage(pageNumber);

        if (cancelled) {
          return;
        }

        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const nextAspectRatio = clampPositiveNumber(
          baseViewport.height / Math.max(baseViewport.width, 1),
          DEFAULT_PAGE_ASPECT_RATIO,
        );
        const { pageWidth } = buildPageShellMetrics(containerWidth, nextAspectRatio, zoom);
        const cssScale = pageWidth / Math.max(baseViewport.width, 1);
        const cssViewport = pdfPage.getViewport({ scale: cssScale });
        const outputScale = Math.max(1, window.devicePixelRatio || 1);
        const renderViewport = pdfPage.getViewport({ scale: cssScale * outputScale });
        const canvasNode = canvasRef.current;

        if (!canvasNode) {
          return;
        }

        const canvasContext = canvasNode.getContext("2d", { alpha: false });

        if (!canvasContext) {
          throw new Error("No se pudo abrir el contexto 2D para el visor PDF.");
        }

        canvasNode.width = Math.max(1, Math.round(renderViewport.width));
        canvasNode.height = Math.max(1, Math.round(renderViewport.height));
        canvasNode.style.width = `${Math.max(1, Math.round(cssViewport.width))}px`;
        canvasNode.style.height = `${Math.max(1, Math.round(cssViewport.height))}px`;

        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext.fillStyle = "#ffffff";
        canvasContext.fillRect(0, 0, canvasNode.width, canvasNode.height);

        renderTask = pdfPage.render({
          canvasContext,
          viewport: renderViewport,
        });
        await renderTask.promise;

        if (cancelled) {
          return;
        }

        setPageAspectRatio(nextAspectRatio);
        setRenderState({
          status: "ready",
          error: "",
        });
        pdfPage.cleanup();

        if (pageNumber === 1 && !firstPageReportedRef.current) {
          firstPageReportedRef.current = true;
          onFirstPageRendered?.({
            pageNumber,
            width: Math.max(1, Math.round(cssViewport.width)),
            height: Math.max(1, Math.round(cssViewport.height)),
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "No se pudo renderizar la pagina PDF.";

        setRenderState({
          status: "error",
          error: message,
        });
        queueBooksEditorLogEvent(
          "books.document.pdfjs.page.error",
          "Books no pudo renderizar una pagina PDF.",
          {
            pageNumber,
            error: message,
          },
          "warn",
        );
      }
    };

    void renderPage();

    return () => {
      cancelled = true;

      if (renderTask?.cancel) {
        try {
          renderTask.cancel();
        } catch {}
      }

      if (pdfPage?.cleanup) {
        try {
          pdfPage.cleanup();
        } catch {}
      }
    };
  }, [containerWidth, onFirstPageRendered, pageNumber, pdfDocument, shouldRender, zoom]);

  const shellMetrics = useMemo(
    () => buildPageShellMetrics(containerWidth, pageAspectRatio, zoom),
    [containerWidth, pageAspectRatio, zoom],
  );

  return (
    <div ref={wrapperRef} className="booksEngine__page">
      <div
        className={[
          "booksEngine__pageShell",
          renderState.status === "error" && "is-error",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: `${shellMetrics.pageWidth}px`,
          minHeight: `${shellMetrics.pageHeight}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          className={[
            "booksEngine__pageCanvas",
            renderState.status === "ready" && "is-ready",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {renderState.status !== "ready" ? (
          <div className="booksEngine__pageOverlay">
            <div className="booksEngine__pageOverlayCard">
              <BookIcon size={22} />
              <strong>Pagina {pageNumber}</strong>
              <span>
                {renderState.status === "error"
                  ? renderState.error
                  : shouldRender
                    ? "Renderizando..."
                    : "Esperando a ser visible..."}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function BooksPdfViewer({
  filePath,
  zoom,
  reloadToken,
  closing = false,
}) {
  const viewportRef = useRef(null);
  const firstPageLoggedRef = useRef(false);
  const activeLoadingTaskRef = useRef(null);
  const activeDocumentRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewerState, setViewerState] = useState({
    status: filePath ? "loading" : "idle",
    error: "",
    pageCount: 0,
    pdfDocument: null,
    defaultAspectRatio: DEFAULT_PAGE_ASPECT_RATIO,
    documentKey: "",
  });

  useEffect(() => {
    const viewportNode = viewportRef.current;

    if (!viewportNode) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(viewportNode.clientWidth || 0);
    });

    resizeObserver.observe(viewportNode);
    setContainerWidth(viewportNode.clientWidth || 0);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;
    let pdfDocument = null;

    firstPageLoggedRef.current = false;
    setViewerState((currentValue) => ({
      ...currentValue,
      status: filePath ? "loading" : "idle",
      error: "",
      pageCount: 0,
      pdfDocument: null,
      documentKey: filePath ? `${filePath}:${reloadToken}` : "",
    }));

    if (!filePath || closing) {
      return undefined;
    }

    const startedAt = performance.now();
    queueBooksEditorLogEvent(
      "books.document.pdfjs.load.start",
      "Books comenzo a cargar un PDF con PDF.js.",
      {
          filePath,
          reloadToken,
        },
      );

    const loadDocument = async () => {
      try {
        const [pdfJsRuntime, fileBuffer] = await Promise.all([
          loadBooksPdfJsRuntime(),
          readFile(filePath),
        ]);

        if (cancelled) {
          return;
        }

        loadingTask = pdfJsRuntime.getDocument({
          data: new Uint8Array(fileBuffer),
          useSystemFonts: true,
          wasmUrl: pdfJsRuntime.wasmUrl,
          verbosity: pdfJsRuntime.VerbosityLevel.ERRORS,
        });
        activeLoadingTaskRef.current = loadingTask;
        pdfDocument = await loadingTask.promise;
        activeDocumentRef.current = pdfDocument;

        if (cancelled) {
          if (pdfDocument?.destroy) {
            await pdfDocument.destroy().catch(() => {});
          }
          return;
        }

        const firstPage = await pdfDocument.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 1 });
        const defaultAspectRatio = clampPositiveNumber(
          firstViewport.height / Math.max(firstViewport.width, 1),
          DEFAULT_PAGE_ASPECT_RATIO,
        );

        firstPage.cleanup();

        setViewerState({
          status: "ready",
          error: "",
          pageCount: pdfDocument.numPages,
          pdfDocument,
          defaultAspectRatio,
          documentKey: `${filePath}:${reloadToken}`,
        });

        queueBooksEditorLogEvent(
          "books.document.pdfjs.ready",
          "Books dejo listo un documento PDF.js.",
          {
            filePath,
            reloadToken,
            pageCount: pdfDocument.numPages,
            fileSizeBytes: fileBuffer.byteLength,
            elapsedMs: Number((performance.now() - startedAt).toFixed(1)),
          },
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "No se pudo cargar el PDF en Books.";

        setViewerState({
          status: "error",
          error: message,
          pageCount: 0,
          pdfDocument: null,
          defaultAspectRatio: DEFAULT_PAGE_ASPECT_RATIO,
          documentKey: `${filePath}:${reloadToken}`,
        });
        queueBooksEditorLogEvent(
          "books.document.pdfjs.error",
          "Books fallo al cargar un PDF con PDF.js.",
          {
            filePath,
            reloadToken,
            error: message,
          },
          "warn",
        );
      }
    };

    void loadDocument();

    return () => {
      cancelled = true;
      setViewerState((currentValue) => ({
        ...currentValue,
        pdfDocument: null,
      }));

      const currentLoadingTask = loadingTask || activeLoadingTaskRef.current;
      const currentDocument = pdfDocument || activeDocumentRef.current;

      activeLoadingTaskRef.current = null;
      activeDocumentRef.current = null;

      if (currentLoadingTask?.destroy) {
        void currentLoadingTask.destroy().catch(() => {});
      }

      if (currentDocument?.destroy) {
        void currentDocument.destroy().catch(() => {});
      }
    };
  }, [closing, filePath, reloadToken]);

  const handleFirstPageRendered = ({ pageNumber, width, height }) => {
    if (pageNumber !== 1 || firstPageLoggedRef.current) {
      return;
    }

    firstPageLoggedRef.current = true;
    queueBooksEditorLogEvent(
      "books.document.pdfjs.first-page-rendered",
      "Books renderizo la primera pagina del PDF.js viewer.",
      {
        filePath,
        reloadToken,
        width,
        height,
      },
    );
  };

  if (!filePath) {
    return <div className="booksEngine__state">No se encontro la ruta local del PDF.</div>;
  }

  if (closing) {
    return <div className="booksEngine__state">Cerrando documento...</div>;
  }

  return (
    <div ref={viewportRef} className="booksEngine__viewerViewport">
      {viewerState.status === "loading" ? (
        <div className="booksEngine__state">Cargando PDF...</div>
      ) : viewerState.status === "error" ? (
        <div className="booksEngine__state booksEngine__state--error">{viewerState.error}</div>
      ) : viewerState.pdfDocument ? (
        <div className="booksEngine__pageStack">
          {Array.from({ length: viewerState.pageCount }, (_entry, index) => (
            <BooksPdfPage
              key={`${viewerState.documentKey}:page-${index + 1}`}
              pdfDocument={viewerState.pdfDocument}
              pageNumber={index + 1}
              zoom={zoom}
              containerWidth={containerWidth}
              defaultAspectRatio={viewerState.defaultAspectRatio}
              viewportRootRef={viewportRef}
              documentKey={viewerState.documentKey}
              onFirstPageRendered={handleFirstPageRendered}
            />
          ))}
        </div>
      ) : (
        <div className="booksEngine__state">El visor PDF no pudo inicializarse.</div>
      )}
    </div>
  );
}
