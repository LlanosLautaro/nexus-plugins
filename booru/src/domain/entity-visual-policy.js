const DEFAULT_ENTITY_VISUAL_LAYOUT = Object.freeze({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
});

function clamp(value, minimum, maximum, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? Math.min(maximum, Math.max(minimum, numericValue))
    : fallback;
}

export function normalizeBooruEntityVisualLayout(value = null) {
  const rawOffsetX = Number(value?.offsetX);
  const rawOffsetY = Number(value?.offsetY);
  // Older profiles stored offsets in pixels. Convert those values once into
  // the normalized frame space consumed by every projection surface.
  const offsetX = Number.isFinite(rawOffsetX) && Math.abs(rawOffsetX) > 1
    ? rawOffsetX / 180
    : rawOffsetX;
  const offsetY = Number.isFinite(rawOffsetY) && Math.abs(rawOffsetY) > 1
    ? rawOffsetY / 180
    : rawOffsetY;

  return {
    scale: clamp(value?.scale, 0.2, 4, DEFAULT_ENTITY_VISUAL_LAYOUT.scale),
    offsetX: clamp(offsetX, -1.5, 1.5, DEFAULT_ENTITY_VISUAL_LAYOUT.offsetX),
    offsetY: clamp(offsetY, -1.5, 1.5, DEFAULT_ENTITY_VISUAL_LAYOUT.offsetY),
  };
}

export function normalizeBooruEntityVisualSettings(value = null) {
  return {
    avatar: normalizeBooruEntityVisualLayout(value?.avatar),
    banner: normalizeBooruEntityVisualLayout(value?.banner),
  };
}

export function createBooruEntityVisualProjection({
  role = "avatar",
  descriptor = null,
  layout = null,
  selection = "derived",
} = {}) {
  const resourceId = String(descriptor?.sampleResourceId || descriptor?.resourceId || "").trim();
  const pathValue = String(
    descriptor?.originalStoragePath
    || descriptor?.storagePath
    || descriptor?.sampleStoragePath
    || descriptor?.pathValue
    || "",
  ).trim();
  const previewPath = String(
    descriptor?.sampleStoragePath
    || descriptor?.storagePath
    || descriptor?.originalStoragePath
    || descriptor?.previewPath
    || "",
  ).trim();
  const mediaKind = String(
    descriptor?.originalMediaKind
    || descriptor?.mediaKind
    || descriptor?.sampleMediaKind
    || "image",
  ).trim() || "image";

  if (!resourceId || !pathValue) {
    return null;
  }

  return {
    role: role === "banner" ? "banner" : "avatar",
    selection: ["avatar", "banner", "cover", "derived"].includes(selection)
      ? selection
      : "derived",
    resourceId,
    source: {
      resourceId,
      pathValue,
      previewPath: previewPath || pathValue,
      mediaKind,
    },
    layout: normalizeBooruEntityVisualLayout(layout),
  };
}

export function getBooruEntityVisualMediaStyle(visualOrLayout = null) {
  const layout = normalizeBooruEntityVisualLayout(visualOrLayout?.layout || visualOrLayout);
  return {
    transform: `translate(${layout.offsetX * 100}%, ${layout.offsetY * 100}%) scale(${layout.scale})`,
    transformOrigin: "center center",
  };
}

export function getBooruEntityVisualRenderProps(visual = null) {
  const pathValue = String(visual?.source?.pathValue || "").trim();

  if (!pathValue) {
    return null;
  }

  const mediaKind = String(visual?.source?.mediaKind || "image").trim() || "image";
  return {
    pathValue,
    mediaKind,
    mediaStyle: getBooruEntityVisualMediaStyle(visual),
    objectFit: "contain",
    forceOriginal: true,
    autoplay: mediaKind === "video",
    loop: mediaKind === "video",
  };
}
