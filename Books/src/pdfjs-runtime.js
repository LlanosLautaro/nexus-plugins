let pdfJsRuntimePromise = null;

export async function loadBooksPdfJsRuntime() {
  if (!pdfJsRuntimePromise) {
    pdfJsRuntimePromise = import("pdfjs-dist/legacy/build/pdf.mjs").then(async (pdfjsLib) => {
      const workerModuleUrl = new URL("./pdf.worker.mjs", import.meta.url).href;
      const wasmUrl = new URL("./wasm/", import.meta.url).href;

      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModuleUrl;
      globalThis.__booksPdfWorkerModule ||= import(workerModuleUrl);
      await globalThis.__booksPdfWorkerModule;

      return {
        ...pdfjsLib,
        wasmUrl,
        workerModuleUrl,
      };
    });
  }

  return pdfJsRuntimePromise;
}
