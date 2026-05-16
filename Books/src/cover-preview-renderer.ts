import path from "node:path";
import { pathToFileURL } from "node:url";
import { electron } from "../../../nexus-backend/src/shared/electron.js";
import { getNodeModulesPath } from "../../../nexus-backend/src/shared/runtime-paths.js";

const { BrowserWindow } = electron;

const COVER_PREVIEW_WIDTH = 220;
const COVER_PREVIEW_HEIGHT = 320;
const RENDER_TIMEOUT_MS = 20_000;
const RENDERER_BOOTSTRAP_URL = `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Books PDF Cover Renderer</title>
    <style>
      html, body {
        margin: 0;
        background: #ffffff;
      }
    </style>
  </head>
  <body></body>
</html>`)} `;

function createTimeoutError(filePath: string) {
  return new Error(`[books] Timeout renderizando portada PDF en backend: ${filePath}`);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, filePath: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(createTimeoutError(filePath));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function createRenderScript(
  filePath: string,
  pdfModuleUrl: string,
  workerModuleUrl: string,
  wasmUrl: string,
) {
  return `(async () => {
    const { readFile } = require("node:fs/promises");
    const { GlobalWorkerOptions, VerbosityLevel, getDocument } = await import(${JSON.stringify(pdfModuleUrl)});
    const workerModuleUrl = ${JSON.stringify(workerModuleUrl)};
    const wasmUrl = ${JSON.stringify(wasmUrl)};
    const filePath = ${JSON.stringify(filePath)};
    const targetWidth = ${COVER_PREVIEW_WIDTH};

    GlobalWorkerOptions.workerSrc = workerModuleUrl;
    globalThis.__booksPdfWorkerModule ||= await import(workerModuleUrl);

    function createCoverPreviewDataUrl(sourceCanvas) {
      const sourceWidth = Math.max(1, sourceCanvas.width || 1);
      const sourceHeight = Math.max(1, sourceCanvas.height || 1);
      const scale = Math.min(1, targetWidth / sourceWidth);

      if (scale >= 0.999) {
        return sourceCanvas.toDataURL("image/jpeg", 0.76);
      }

      const thumbnailCanvas = document.createElement("canvas");
      thumbnailCanvas.width = Math.max(1, Math.round(sourceWidth * scale));
      thumbnailCanvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const thumbnailContext = thumbnailCanvas.getContext("2d", { alpha: false });

      if (!thumbnailContext) {
        return sourceCanvas.toDataURL("image/jpeg", 0.76);
      }

      thumbnailContext.fillStyle = "#ffffff";
      thumbnailContext.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      thumbnailContext.drawImage(sourceCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      return thumbnailCanvas.toDataURL("image/jpeg", 0.76);
    }

    let loadingTask = null;
    let pdfDocument = null;
    let renderTask = null;

    try {
      const fileBuffer = await readFile(filePath);
      loadingTask = getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
        wasmUrl,
        verbosity: VerbosityLevel.ERRORS,
      });
      pdfDocument = await loadingTask.promise;

      const page = await pdfDocument.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({
        scale: targetWidth / Math.max(baseViewport.width, 1),
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(renderViewport.width));
      canvas.height = Math.max(1, Math.round(renderViewport.height));

      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("No se pudo abrir el contexto 2D para la portada backend.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      renderTask = page.render({
        canvasContext: context,
        viewport: renderViewport,
      });
      await renderTask.promise;
      page.cleanup();

      return createCoverPreviewDataUrl(canvas);
    } finally {
      if (renderTask?.cancel) {
        try {
          renderTask.cancel();
        } catch {}
      }

      if (pdfDocument?.destroy) {
        try {
          await pdfDocument.destroy();
        } catch {}
      }

      if (loadingTask?.destroy) {
        try {
          await loadingTask.destroy();
        } catch {}
      }
    }
  })();`;
}

export function createPdfCoverPreviewRenderer() {
  let renderWindow: any = null;
  let renderWindowReady: Promise<any> | null = null;
  let renderQueue = Promise.resolve();

  const nodeModulesPath = getNodeModulesPath();
  const pdfModuleUrl = pathToFileURL(
    path.join(nodeModulesPath, "pdfjs-dist", "legacy", "build", "pdf.mjs"),
  ).href;
  const workerModuleUrl = pathToFileURL(
    path.join(nodeModulesPath, "pdfjs-dist", "legacy", "build", "pdf.worker.mjs"),
  ).href;
  const wasmUrl = `${pathToFileURL(path.join(nodeModulesPath, "pdfjs-dist", "wasm")).href}/`;

  const resetWindow = async () => {
    const windowToClose = renderWindow;
    renderWindow = null;
    renderWindowReady = null;

    if (windowToClose && !windowToClose.isDestroyed()) {
      windowToClose.destroy();
    }
  };

  const ensureWindow = async () => {
    if (renderWindow && !renderWindow.isDestroyed()) {
      return renderWindow;
    }

    if (renderWindowReady) {
      return renderWindowReady;
    }

    renderWindowReady = (async () => {
      renderWindow = new BrowserWindow({
        show: false,
        width: COVER_PREVIEW_WIDTH,
        height: COVER_PREVIEW_HEIGHT,
        useContentSize: true,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          backgroundThrottling: false,
        },
      });

      renderWindow.on("closed", () => {
        renderWindow = null;
        renderWindowReady = null;
      });

      await renderWindow.loadURL(RENDERER_BOOTSTRAP_URL.trim());
      return renderWindow;
    })();

    try {
      return await renderWindowReady;
    } catch (error) {
      await resetWindow();
      throw error;
    }
  };

  const renderOnce = async (filePath: string) => {
    const browserWindow = await ensureWindow();
    const script = createRenderScript(filePath, pdfModuleUrl, workerModuleUrl, wasmUrl);
    const previewDataUrl = await withTimeout(
      browserWindow.webContents.executeJavaScript(script, true),
      RENDER_TIMEOUT_MS,
      filePath,
    );

    return typeof previewDataUrl === "string" ? previewDataUrl.trim() : "";
  };

  const render = async (filePath: string) => {
    const normalizedPath = String(filePath || "").trim();

    if (!normalizedPath) {
      return "";
    }

    const performRender = async () => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          return await renderOnce(normalizedPath);
        } catch (error) {
          await resetWindow();

          if (attempt === 1) {
            throw error;
          }
        }
      }

      return "";
    };

    const queuedRender = renderQueue.then(performRender, performRender);
    renderQueue = queuedRender.then(
      () => undefined,
      () => undefined,
    );

    return queuedRender;
  };

  return {
    render,
    async stop() {
      renderQueue = Promise.resolve();
      await resetWindow();
    },
  };
}
