const React = window.React;
const { useEffect, useRef, useState } = React;

export default function MediaThumbnail({
  pathValue,
  mediaKind,
  alt = "",
  className = "",
  controls = false,
  autoplay = false,
  loop = false,
  large = false,
  thumbnail = null,
  highPriority = false,
  preferOriginalWhenThumbnailMissing = true,
  forceOriginal = false,
  hoverPlayable = false,
  mediaStyle = null,
  objectFit = "",
  toFileUrl,
  logger,
  mediaKindLabels,
}) {
  const originalUrl = toFileUrl(pathValue);
  const isAnimatedImage = mediaKind === "gif" || /\.webp(?:$|[?#])/i.test(String(pathValue || ""));
  const [hoverActive, setHoverActive] = useState(false);
  const hoverTimerRef = useRef(0);
  const thumbnailUrl = !controls && thumbnail?.status === "ready"
    ? toFileUrl(thumbnail?.storagePath)
    : "";
  const canUseOriginalPreview = preferOriginalWhenThumbnailMissing && mediaKind !== "video";
  const shouldUseOriginal = forceOriginal || isAnimatedImage || (hoverActive && hoverPlayable && mediaKind !== "video");
  const imageUrl = controls || shouldUseOriginal
    ? originalUrl
    : (thumbnailUrl || (canUseOriginalPreview ? originalUrl : ""));
  const pendingThumbnail = !controls && !thumbnailUrl && !canUseOriginalPreview && (!thumbnail || thumbnail?.status === "pending");
  const erroredThumbnail = !controls && thumbnail?.status === "error";
  const lastErrorSignatureRef = useRef("");
  const previewSource = controls || shouldUseOriginal
    ? (mediaKind === "video" ? "original-video" : "original-image")
    : (thumbnailUrl ? "thumbnail" : (canUseOriginalPreview ? "original-fallback" : "placeholder"));
  const resolvedMediaStyle = {
    ...(objectFit ? { objectFit } : {}),
    ...(mediaStyle && typeof mediaStyle === "object" ? mediaStyle : {}),
  };

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }
  }, []);

  const startHoverPreview = () => {
    if (!hoverPlayable || mediaKind === "video" || controls || hoverTimerRef.current || hoverActive) {
      return;
    }

    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = 0;
      setHoverActive(true);
    }, 1000);
  };

  const stopHoverPreview = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }

    setHoverActive(false);
  };

  const handlePreviewError = (failedUrl) => {
    const normalizedUrl = String(failedUrl || "").trim();
    const signature = [
      mediaKind,
      previewSource,
      controls ? "interactive" : "card",
      normalizedUrl,
      String(thumbnail?.status || ""),
      String(pathValue || ""),
    ].join("|");

    if (lastErrorSignatureRef.current === signature) {
      return;
    }

    lastErrorSignatureRef.current = signature;
    logger.info(
      "booru.media-preview.error",
      "Booru detecto un fallo de carga en una preview de media.",
      {
        mediaKind,
        previewSource,
        controls,
        large,
        sourceUrl: normalizedUrl || null,
        originalPath: String(pathValue || "").trim() || null,
        thumbnailStatus: String(thumbnail?.status || "").trim() || null,
        thumbnailPath: String(thumbnail?.storagePath || "").trim() || null,
      },
    );
  };

  if ((controls || autoplay) && mediaKind === "video" && originalUrl) {
    return (
      <video
        className={[
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className,
        ].filter(Boolean).join(" ")}
        src={originalUrl}
        style={resolvedMediaStyle}
        muted={!controls || autoplay}
        playsInline
        preload={controls ? "metadata" : "auto"}
        autoPlay={autoplay}
        loop={loop || autoplay}
        controls={controls}
        onError={() => handlePreviewError(originalUrl)}
        onPointerEnter={startHoverPreview}
        onPointerLeave={stopHoverPreview}
      />
    );
  }

  if (imageUrl) {
    return (
      <img
        className={[
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className,
        ].filter(Boolean).join(" ")}
        src={imageUrl}
        style={resolvedMediaStyle}
        alt={alt}
        loading={controls ? undefined : "lazy"}
        decoding={controls ? undefined : "async"}
        fetchPriority={highPriority ? "high" : "low"}
        draggable="false"
        onError={() => handlePreviewError(imageUrl)}
        onPointerEnter={startHoverPreview}
        onPointerLeave={stopHoverPreview}
      />
    );
  }

  if (pendingThumbnail) {
    return (
      <div className={["booruView__previewPlaceholder", large ? "is-large" : "", className].filter(Boolean).join(" ")}>
        <span className="booruView__previewPlaceholderShimmer" />
      </div>
    );
  }

  return (
    <div className={["booruView__previewFallback", large ? "is-large" : "", className].filter(Boolean).join(" ")}>
      <span>{erroredThumbnail ? "Preview" : (mediaKindLabels[mediaKind] || "Media")}</span>
    </div>
  );
}
