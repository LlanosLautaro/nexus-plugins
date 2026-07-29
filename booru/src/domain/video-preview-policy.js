export const BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS = 15_000;
export const BOORU_VIDEO_SHORT_DURATION_SECONDS = 15;
export const BOORU_VIDEO_SHORT_VARIANT = "first-15s-muted-v2";

export function shouldGenerateBooruVideoShort(mediaKind, durationMs) {
  const duration = Number(durationMs);
  return mediaKind === "video"
    && Number.isFinite(duration)
    && duration > BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS;
}

export function resolveBooruVideoAutoplay({
  mediaKind,
  durationMs,
  autoplayStoragePath,
  videoShortStatus,
  videoShortVariant,
} = {}) {
  if (mediaKind !== "video") return { autoplay: false, autoplayPath: "", source: "none" };

  const hasDuration = durationMs !== null && durationMs !== undefined && durationMs !== "";
  const duration = Number(durationMs);
  if (hasDuration && Number.isFinite(duration) && duration >= 0 && duration <= BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS) {
    return { autoplay: true, autoplayPath: "", source: "original" };
  }

  const shortPath = String(autoplayStoragePath || "").trim();
  const validShort = shortPath
    && String(videoShortStatus || "").trim() === "ready"
    && String(videoShortVariant || "").trim() === BOORU_VIDEO_SHORT_VARIANT;
  return validShort
    ? { autoplay: true, autoplayPath: shortPath, source: "derivative" }
    : { autoplay: false, autoplayPath: "", source: "pending" };
}
