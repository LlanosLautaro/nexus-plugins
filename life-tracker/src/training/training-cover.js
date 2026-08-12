const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
]);

export const TRAINING_COVER_PROPERTY_REF = Object.freeze({
  namespace: "note",
  key: "cover",
  valueType: "link",
  valueShape: "scalar",
});

function responseErrorMessage(response, fallback) {
  if (typeof response?.error === "string" && response.error.trim()) {
    return response.error;
  }
  if (typeof response?.error?.message === "string" && response.error.message.trim()) {
    return response.error.message;
  }
  return fallback;
}

function normalizeExtension(value) {
  return String(value || "").replace(/^\./, "").trim().toLowerCase();
}

function isImageItem(item) {
  const extension = normalizeExtension(item?.extension || String(item?.path || "").split(".").at(-1));
  return IMAGE_EXTENSIONS.has(extension);
}

export function getTrainingCoverValue(doc) {
  const value = doc?.frontmatter?.cover;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function hasTrainingCoverProperty(doc) {
  if (!Object.prototype.hasOwnProperty.call(doc?.frontmatter || {}, "cover")) return false;
  const value = doc.frontmatter.cover;
  return value != null && (typeof value !== "string" || Boolean(value.trim()));
}

export function buildTrainingCoverLink(relativePath) {
  const normalizedPath = String(relativePath || "").trim().replace(/\\/g, "/");
  return normalizedPath ? `[[${normalizedPath}]]` : "";
}

export function cleanTrainingCoverTarget(value) {
  let target = String(value || "").trim();
  const markdownMatch = target.match(/^\[[^\]]*\]\((.+)\)$/);
  if (markdownMatch) target = markdownMatch[1].trim();
  if (target.startsWith("[[") && target.endsWith("]]")) target = target.slice(2, -2);
  if (target.includes("|")) target = target.split("|", 1)[0];
  if (target.includes("#")) target = target.split("#", 1)[0];
  if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
  return target.trim().replace(/\\/g, "/");
}

export function isTrainingTextEntryElement(target) {
  const element = typeof Element !== "undefined" && target instanceof Element ? target : null;
  if (!element) return false;
  return Boolean(
    element.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
  );
}

async function itemToImageUrl(item, ipcRenderer, pathToFileUrl) {
  if (!item || !isImageItem(item)) return "";
  const filePath = item.path
    || (await ipcRenderer.invoke("items:resolve-location", { itemId: item.id }))?.path;
  return filePath ? pathToFileUrl(filePath) : "";
}

export async function resolveTrainingCoverImageUrl(
  doc,
  { ipcRenderer, pathToFileUrl },
) {
  const rawCover = getTrainingCoverValue(doc);
  const target = cleanTrainingCoverTarget(rawCover);
  if (!target) return "";
  if (/^https?:\/\//i.test(target)) return target;

  const sourceFolder = String(doc?.relativePath || "")
    .replace(/\\/g, "/")
    .split("/")
    .slice(0, -1)
    .join("/");
  const candidates = [target, sourceFolder ? `${sourceFolder}/${target}` : target];

  for (const relativePath of [...new Set(candidates)]) {
    const item = await ipcRenderer.invoke("items:get-by-relative-path", { relativePath });
    const url = await itemToImageUrl(item, ipcRenderer, pathToFileUrl);
    if (url) return url;
  }

  return "";
}

export async function pasteTrainingCover({
  doc,
  muscleId,
  ipcRenderer,
  captureImage,
}) {
  if (!doc?.itemId) {
    throw new Error("Este musculo todavia no tiene una nota Markdown asociada.");
  }

  const capture = await captureImage("life-tracker-muscle-cover");
  if (!capture?.grantId) {
    throw new Error("El portapapeles no contiene una imagen.");
  }

  const importedResponse = await ipcRenderer.invoke("markdown:media:import", {
    sourceKind: "clipboard",
    sourceGrant: capture.grantId,
    preferredName: `${String(muscleId || "muscle").trim() || "muscle"}-cover`,
  });
  if (!importedResponse?.ok) {
    throw new Error(responseErrorMessage(importedResponse, "No se pudo importar la imagen al vault."));
  }
  if (importedResponse.mediaKind !== "image" || !importedResponse.relativePath) {
    throw new Error("El recurso importado no es una imagen valida.");
  }

  const sourceResponse = await ipcRenderer.invoke("items:source-load", { itemId: doc.itemId });
  if (!sourceResponse?.ok || !sourceResponse.data?.sourceHash) {
    throw new Error(responseErrorMessage(sourceResponse, "No se pudo preparar la nota para editarla."));
  }

  const coverLink = buildTrainingCoverLink(importedResponse.relativePath);
  const editResponse = await ipcRenderer.invoke("views:item-edit", {
    itemId: doc.itemId,
    expectedHash: sourceResponse.data.sourceHash,
    property: TRAINING_COVER_PROPERTY_REF,
    operation: {
      kind: "set",
      value: coverLink,
      replaceIncompatible: hasTrainingCoverProperty(doc),
    },
    writerId: "life-tracker:training:muscle-cover",
  });
  if (!editResponse?.ok) {
    throw new Error(responseErrorMessage(editResponse, "La nota cambio antes de guardar la portada."));
  }

  return {
    coverLink,
    itemId: doc.itemId,
    relativePath: importedResponse.relativePath,
    sourceHash: editResponse.data?.sourceHash || sourceResponse.data.sourceHash,
  };
}
