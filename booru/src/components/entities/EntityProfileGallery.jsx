import {
  GalleryCard,
  GalleryCardMedia,
  GalleryGrid,
  StateBlock,
} from "@nexus/ui";
import CollapsibleGalleryGroup from "../shared/CollapsibleGalleryGroup.jsx";
import { resolveBooruVideoAutoplay } from "../../domain/video-preview-policy.js";
const React = window.React;
const { useEffect, useMemo, useRef, useState } = React;

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
  onColumnsChange,
  onGroupAssociationHover,
}) {
  const sentinelRef = useRef(null);
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

  const renderCard = (item, absoluteIndex, key) => {
    const videoAutoplay = resolveBooruVideoAutoplay(item);
    return (
    <GalleryCard
      as="div"
      key={key}
      interactive
      selected={activeSelectedIds.includes(item.id)}
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
      <GalleryCardMedia className="booruView__mediaCardPreview">
        <MediaPreview
          pathValue={item.storagePath}
          mediaKind={item.mediaKind}
          alt={item.originalFilename}
          thumbnail={item.thumbnail}
          highPriority={absoluteIndex < resourceGridColumns}
          preferOriginalWhenThumbnailMissing
          autoplay={videoAutoplay.autoplay}
          loop={item.mediaKind === "video"}
          autoplayPath={videoAutoplay.autoplayPath}
          hoverPlayable={item.mediaKind === "gif"}
        />
      </GalleryCardMedia>
    </GalleryCard>
    );
  };

  return (
    <div className="booruView__entityProfileGallery">
      {groupedSections.length ? (
        <div className="booruView__groupedGallery">
          {groupedSections.map((group) => (
            <CollapsibleGalleryGroup key={group.key} label={group.label} association={group.association} onAssociationHover={onGroupAssociationHover}>
              <GalleryGrid
                className="booruView__mediaGrid"
                columns={resourceGridColumns}
                minColumns={2}
                onColumnsChange={onColumnsChange}
              >
                {group.entries.map(({ placement, item }, index) => renderCard(item, index, placement.placementId))}
              </GalleryGrid>
            </CollapsibleGalleryGroup>
          ))}
        </div>
      ) : (
        <GalleryGrid
          className="booruView__mediaGrid booruView__mediaGrid--infinite"
          columns={resourceGridColumns}
          minColumns={2}
          onColumnsChange={onColumnsChange}
        >
          {items.map((item, index) => renderCard(item, index, item.id))}
        </GalleryGrid>
      )}
      {hasMore ? <div ref={sentinelRef} className="booruView__resourceLoadSentinel" aria-hidden="true" /> : null}
      {loading && items.length ? <span className="booruView__resourceLoadingMore">Cargando mas recursos...</span> : null}
    </div>
  );
}
