const React = window.React;
const { useCallback, useEffect, useMemo, useRef, useState } = React;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [mediaSize, setMediaSize] = useState({
    width: Number(item?.width || 0),
    height: Number(item?.height || 0),
  });
  const viewportRef = useRef(null);
  const pointerRef = useRef(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setMediaSize({
      width: Number(item?.width || 0),
      height: Number(item?.height || 0),
    });
  }, [item?.id]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    const updateSize = () => {
      const bounds = node.getBoundingClientRect();
      setViewportSize({ width: bounds.width, height: bounds.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [item?.id]);

  const fittedSize = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return { width: 1, height: 1 };
    }
    const sourceWidth = Math.max(1, mediaSize.width || viewportSize.width || 1);
    const sourceHeight = Math.max(1, mediaSize.height || viewportSize.height || 1);
    const fitScale = Math.min(
      viewportSize.width / sourceWidth || 1,
      viewportSize.height / sourceHeight || 1,
    );
    return {
      width: Math.max(1, sourceWidth * fitScale),
      height: Math.max(1, sourceHeight * fitScale),
    };
  }, [mediaSize.height, mediaSize.width, viewportSize.height, viewportSize.width]);

  const clampPan = useCallback((value, nextZoom = zoom) => {
    const maxX = Math.max(0, (fittedSize.width * nextZoom - viewportSize.width) / 2);
    const maxY = Math.max(0, (fittedSize.height * nextZoom - viewportSize.height) / 2);
    return {
      x: clamp(value?.x, -maxX, maxX),
      y: clamp(value?.y, -maxY, maxY),
    };
  }, [fittedSize.height, fittedSize.width, viewportSize.height, viewportSize.width, zoom]);

  useEffect(() => {
    setPan((currentValue) => clampPan(currentValue));
  }, [clampPan]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    const handleWheel = (event) => {
      event.preventDefault();
      setZoom((currentValue) => {
        const nextValue = currentValue + (event.deltaY < 0 ? 0.2 : -0.2);
        const normalizedZoom = Math.min(6, Math.max(1, Number(nextValue.toFixed(2))));
        setPan((currentPan) => clampPan(currentPan, normalizedZoom));
        return normalizedZoom;
      });
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [clampPan, item?.id]);

  const beginPan = (event) => {
    if (zoom <= 1 || event.button !== 0) return;
    event.preventDefault();
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pan,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const movePan = (event) => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    event.preventDefault();
    setPan(clampPan({
      x: gesture.pan.x + event.clientX - gesture.x,
      y: gesture.pan.y + event.clientY - gesture.y,
    }));
  };

  const endPan = (event) => {
    if (pointerRef.current?.id === event.pointerId) {
      pointerRef.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (!item || item.mediaKind !== "video") return undefined;
    const pausedByHero = Array.from(document.querySelectorAll("video:not(.booruView__heroMedia)"))
      .filter((video) => !video.paused)
      .map((video) => {
        video.pause();
        return video;
      });
    return () => {
      pausedByHero.forEach((video) => void video.play().catch(() => undefined));
    };
  }, [item?.id, item?.mediaKind]);

  if (!item) return null;

  return (
    <div className="booruView__heroOverlay" onClick={() => onClose?.()}>
      <div className="booruView__heroShell" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="booruView__heroNav booruView__heroNav--prev" onClick={() => onPrev?.()} aria-label="Recurso anterior">{"<"}</button>
        <div className="booruView__heroStage">
          <div
            ref={viewportRef}
            className={["booruView__heroViewport", zoom > 1 ? "is-pannable" : ""].filter(Boolean).join(" ")}
            onPointerDown={beginPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          >
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
              onMediaReady={(dimensions) => setMediaSize({
                width: Number(dimensions?.width || item?.width || 0),
                height: Number(dimensions?.height || item?.height || 0),
              })}
              mediaStyle={{
                width: `${fittedSize.width}px`,
                height: `${fittedSize.height}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
              className="booruView__heroMedia"
            />
          </div>
          <div className="booruView__heroMeta">
            <strong>{item.originalFilename}</strong>
            <span>{mediaKindLabels[item.mediaKind] || item.mediaKind}{" · "}{index + 1} / {Math.max(1, totalCount)}{" · "}{Math.round(zoom * 100)}%</span>
          </div>
        </div>
        <button type="button" className="booruView__heroNav booruView__heroNav--next" onClick={() => onNext?.()} aria-label="Siguiente recurso">{">"}</button>
      </div>
    </div>
  );
}
