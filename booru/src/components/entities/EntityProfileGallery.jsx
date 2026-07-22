import { StateBlock } from "../../../../../nexus-frontend/src/ui/index.js";
import useGalleryColumnWheel from "../shared/useGalleryColumnWheel.js";
import CollapsibleGalleryGroup from "../shared/CollapsibleGalleryGroup.jsx";
const React = window.React;
const { useCallback, useEffect, useMemo, useRef, useState } = React;

export default function EntityProfileGalleryGrid({
  items,
  placements = [],
  loading,
  hasMore = false,
  onLoadMore,
  onOpenResource,
  onContextMenu,
  MediaPreview,
  canUseVisual,
  resourceGridColumns,
  selectedIds,
  onSelectionChange,
  onColumnWheel,
  onGroupAssociationHover,
}) {
  const sentinelRef = useRef(null);
  const galleryRef = useRef(null);
  const attachColumnWheel = useGalleryColumnWheel(onColumnWheel);
  const setGalleryNode = useCallback((node) => {
    galleryRef.current = node;
    attachColumnWheel(node);
  }, [attachColumnWheel]);
  const [localSelectedIds, setLocalSelectedIds] = useState([]);
  const activeSelectedIds = Array.isArray(selectedIds) ? selectedIds : localSelectedIds;
  const setActiveSelectedIds = (updater) => {
    const nextValue = typeof updater === "function" ? updater(activeSelectedIds) : updater;
    if (typeof onSelectionChange === "function") onSelectionChange(nextValue);
    else setLocalSelectedIds(nextValue);
  };
  const groupedSections = useMemo(() => {
    if (!Array.isArray(placements) || !placements.length) return [];
    const itemById = new Map(items.map((item) => [item.id, item]));
    const groups = [];
    const groupByKey = new Map();
    placements.forEach((placement) => {
      const item = itemById.get(placement?.resourceId);
      if (!item) return;
      const key = String(placement?.groupKey || "");
      if (!groupByKey.has(key)) {
        const group = { key, label: placement?.groupLabel || key, association: placement?.association || null, entries: [] };
        groupByKey.set(key, group);
        groups.push(group);
      }
      groupByKey.get(key).entries.push({ placement, item });
    });
    return groups;
  }, [items, placements]);

  useEffect(() => {
    const availableIds = new Set(items.map((item) => item.id));
    setActiveSelectedIds((current) => current.filter((id) => availableIds.has(id)));
  }, [items]);

  useEffect(() => {
    if (!hasMore || loading || !sentinelRef.current || typeof IntersectionObserver !== "function") return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
    }, { rootMargin: "520px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (loading && !items.length) {
    return <StateBlock centered title="Cargando galeria" description="Leyendo recursos consumidores desde Booru." />;
  }

  if (!items.length) {
    return <StateBlock centered title="Sin recursos todavia" description="Cuando esta entidad consuma media real, aparecera aqui. Ctrl/Cmd+V pega una imagen del portapapeles y la asigna a este perfil." />;
  }

  const renderCard = (item, absoluteIndex, key) => (
    <div
      key={key}
      className={[
        "booruView__mediaCard",
        "booruView__mediaCard--static",
        canUseVisual(item) ? "booruView__mediaCard--contextual" : "",
        activeSelectedIds.includes(item.id) ? "is-multi-selected" : "",
      ].filter(Boolean).join(" ")}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (event.ctrlKey || event.metaKey) {
          setActiveSelectedIds((current) => current.includes(item.id)
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
        const contextIds = activeSelectedIds.includes(item.id) ? activeSelectedIds : [item.id];
        if (!activeSelectedIds.includes(item.id)) setActiveSelectedIds([item.id]);
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
  );

  return (
    <div ref={setGalleryNode} className="booruView__entityProfileGallery">
      {groupedSections.length ? (
        <div className="booruView__groupedGallery">
          {groupedSections.map((group) => (
            <CollapsibleGalleryGroup key={group.key} label={group.label} association={group.association} onAssociationHover={onGroupAssociationHover}>
              <div className="booruView__mediaGrid" style={{ gridTemplateColumns: `repeat(${resourceGridColumns}, minmax(0, 1fr))` }}>
                {group.entries.map(({ placement, item }, index) => renderCard(item, index, placement.placementId))}
              </div>
            </CollapsibleGalleryGroup>
          ))}
        </div>
      ) : (
        <div className="booruView__mediaGrid booruView__mediaGrid--infinite" style={{ gridTemplateColumns: `repeat(${resourceGridColumns}, minmax(0, 1fr))` }}>
          {items.map((item, index) => renderCard(item, index, item.id))}
        </div>
      )}
      {hasMore ? <div ref={sentinelRef} className="booruView__resourceLoadSentinel" aria-hidden="true" /> : null}
      {loading && items.length ? <span className="booruView__resourceLoadingMore">Cargando mas recursos...</span> : null}
    </div>
  );
}
