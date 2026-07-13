import { StateBlock } from "../../../../../nexus-frontend/src/ui/index.js";
const React = window.React;
const { useEffect, useRef, useState } = React;


export default function EntityProfileGalleryGrid({
  items,
  loading,
  hasMore = false,
  onLoadMore,
  onOpenResource,
  onContextMenu,
  MediaPreview,
  canUseVisual,
  resourceGridColumns,
}) {
  const sentinelRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const availableIds = new Set(items.map((item) => item.id));
    setSelectedIds((current) => current.filter((id) => availableIds.has(id)));
  }, [items]);

  useEffect(() => {
    if (!hasMore || loading || !sentinelRef.current || typeof IntersectionObserver !== "function") {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
    }, { rootMargin: "520px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);
  if (loading && !items.length) {
    return (
      <StateBlock
        centered
        title="Cargando galeria"
        description="Leyendo recursos consumidores desde Booru."
      />
    );
  }

  if (!items.length) {
    return (
      <StateBlock
        centered
        title="Sin recursos todavia"
        description="Cuando esta entidad consuma media real, aparecera aqui. Ctrl/Cmd+V pega una imagen del portapapeles y la asigna a este perfil."
      />
    );
  }

  return (
    <div className="booruView__entityProfileGallery">
      <div className="booruView__mediaGrid booruView__mediaGrid--infinite">
        {items.map((item, absoluteIndex) => (
          <div
            key={item.id}
            className={[
              "booruView__mediaCard",
              "booruView__mediaCard--static",
              canUseVisual(item) ? "booruView__mediaCard--contextual" : "",
              selectedIds.includes(item.id) ? "is-multi-selected" : "",
            ].filter(Boolean).join(" ")}
            role="button"
            tabIndex={0}
            onClick={(event) => {
              if (event.ctrlKey || event.metaKey) {
                setSelectedIds((current) => current.includes(item.id)
                  ? current.filter((id) => id !== item.id)
                  : [...current, item.id]);
                return;
              }
              onOpenResource?.(item, items);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenResource?.(item, items);
              }
            }}
            onContextMenu={(event) => {
              const contextIds = selectedIds.includes(item.id) ? selectedIds : [item.id];
              if (!selectedIds.includes(item.id)) setSelectedIds([item.id]);
              onContextMenu?.(item, event, contextIds);
            }}
          >
            <div className="booruView__mediaCardPreview">
              <MediaPreview
                pathValue={item.storagePath}
                mediaKind={item.mediaKind}
                alt={item.originalFilename}
                thumbnail={item.thumbnail}
                highPriority={absoluteIndex < resourceGridColumns}
                preferOriginalWhenThumbnailMissing
                autoplay={item.mediaKind === "video" && (Number(item.durationMs || 0) <= 60000 || Boolean(item.autoplayStoragePath))}
                loop={item.mediaKind === "video"}
                autoplayPath={item.autoplayStoragePath}
                hoverPlayable={item.mediaKind === "gif"}
              />
            </div>
          </div>
        ))}
      </div>
      {hasMore ? <div ref={sentinelRef} className="booruView__resourceLoadSentinel" aria-hidden="true" /> : null}
      {loading && items.length ? <span className="booruView__resourceLoadingMore">Cargando mÃƒÂ¡s recursos...</span> : null}
    </div>
  );
}
