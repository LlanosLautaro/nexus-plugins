const React = window.React;
const { useEffect } = React;

export default function ResourceHeroOverlay({
  item,
  index = 0,
  totalCount = 0,
  onClose,
  onPrev,
  onNext,
  MediaPreview,
  mediaKindLabels,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!item) return null;

  return (
    <div className="booruView__heroOverlay" onClick={() => onClose?.()}>
      <div className="booruView__heroShell" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="booruView__heroNav booruView__heroNav--prev" onClick={() => onPrev?.()} aria-label="Recurso anterior">{"<"}</button>
        <div className="booruView__heroStage">
          <MediaPreview
            pathValue={item.storagePath}
            mediaKind={item.mediaKind}
            alt={item.originalFilename}
            controls={item.mediaKind === "video"}
            autoplay={item.mediaKind === "video"}
            loop={item.mediaKind === "video"}
            forceOriginal
            preferOriginalWhenThumbnailMissing
            objectFit="contain"
            className="booruView__heroMedia"
          />
          <div className="booruView__heroMeta">
            <strong>{item.originalFilename}</strong>
            <span>{mediaKindLabels[item.mediaKind] || item.mediaKind}{" · "}{index + 1} / {Math.max(1, totalCount)}</span>
          </div>
        </div>
        <button type="button" className="booruView__heroNav booruView__heroNav--next" onClick={() => onNext?.()} aria-label="Siguiente recurso">{">"}</button>
      </div>
    </div>
  );
}
