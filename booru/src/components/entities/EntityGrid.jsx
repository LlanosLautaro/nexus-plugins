import {
  GalleryCard,
  GalleryCardBody,
  GalleryCardMedia,
  GalleryCardMeta,
  GalleryCardTitle,
  GalleryGrid,
  SectionPanel,
  StateBlock,
} from "@nexus/ui";
import EntityVisualMedia from "./EntityVisualMedia.jsx";
import CollapsibleGalleryGroup from "../shared/CollapsibleGalleryGroup.jsx";
const React = window.React;
const { useEffect, useMemo, useRef } = React;

export default function EntityGrid({
  kind,
  items,
  placements = [],
  hasMore = false,
  loading = false,
  onLoadMore,
  emptyTitle,
  emptyDescription,
  onOpenEntity,
  onPreviewContextMenu,
  onEntityHover,
  MediaPreview,
  entityKindLabels,
  getInitials,
  embedded = false,
  columns = 5,
  onColumnsChange,
  onGroupAssociationHover,
  scrollKey,
  scrollTop = 0,
  onScrollStateChange,
}) {
  const contentRef = useRef(null);
  const groupedSections = useMemo(() => {
    if (!Array.isArray(placements) || !placements.length) return [];
    const itemById = new Map(items.map((item) => [item.id, item]));
    const groups = [];
    const groupByKey = new Map();
    placements.forEach((placement) => {
      const item = itemById.get(placement?.entityId);
      if (!item) return;
      const key = String(placement?.groupKey || "");
      if (!groupByKey.has(key)) {
        const group = { key, label: placement?.groupLabel || key, association: placement?.association || null, items: [] };
        groupByKey.set(key, group);
        groups.push(group);
      }
      groupByKey.get(key).items.push({ placement, item });
    });
    return groups;
  }, [items, placements]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node || embedded) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      node.scrollTop = Math.max(0, Number(scrollTop) || 0);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [embedded, scrollKey, scrollTop]);

  const content = (
    <>
      {items.length ? (
        <div
          ref={contentRef}
          className="booruView__resourcePanelBody"
          onScroll={(event) => {
            if (!embedded) onScrollStateChange?.(event.currentTarget.scrollTop || 0);
            if (hasMore && !loading && event.currentTarget.scrollTop + event.currentTarget.clientHeight >= event.currentTarget.scrollHeight - 420) {
              onLoadMore?.();
            }
          }}
        >
          {groupedSections.length ? (
            <div className="booruView__groupedGallery">
              {groupedSections.map((group) => (
                <CollapsibleGalleryGroup key={group.key} label={group.label} association={group.association} onAssociationHover={onGroupAssociationHover}>
                  <GalleryGrid
                    className="booruView__entityGrid"
                    columns={columns}
                    minColumns={2}
                    onColumnsChange={onColumnsChange}
                  >
                    {group.items.map(({ placement, item }) => (
                      <EntityCard key={placement.placementId} item={item} />
                    ))}
                  </GalleryGrid>
                </CollapsibleGalleryGroup>
              ))}
            </div>
          ) : (
            <GalleryGrid
              className="booruView__entityGrid"
              columns={columns}
              minColumns={2}
              onColumnsChange={onColumnsChange}
            >
              {items.map((item) => <EntityCard key={item.id} item={item} />)}
            </GalleryGrid>
          )}
          {loading && items.length ? <span className="booruView__resourceLoadingMore">Actualizando seccion...</span> : null}
        </div>
      ) : (
        <StateBlock
          centered
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </>
  );

  function EntityCard({ item }) {
    return (
              <GalleryCard
                as="button"
                type="button"
                className="booruView__entityCard"
                onClick={() => onOpenEntity?.(kind, item)}
                onContextMenu={(event) => onPreviewContextMenu?.(item, event, kind)}
                onPointerEnter={() => onEntityHover?.(kind, item)}
                onPointerLeave={() => onEntityHover?.(null)}
              >
                <GalleryCardMedia
                  className="booruView__entityCardPreview"
                >
                  <EntityVisualMedia
                    visual={item.visual}
                    alt={item.displayName}
                    MediaPreview={MediaPreview}
                    fallback={(
                      <div className="booruView__entityVisualFallback">
                        <span>{getInitials?.(item.displayName) || "?"}</span>
                      </div>
                    )}
                  />
                </GalleryCardMedia>

                <GalleryCardBody className="booruView__entityCardBody">
                  <GalleryCardTitle>{item.displayName}</GalleryCardTitle>
                  {kind === "character" && item?.universe?.displayName ? (
                    <GalleryCardMeta as="div" className="booruView__entityCardMeta">
                      <span>{item.universe.displayName}</span>
                    </GalleryCardMeta>
                  ) : null}
                  <GalleryCardMeta as="div" className="booruView__entityCardMeta">
                    <span>{item.resourceCount} recursos</span>
                    <span>{entityKindLabels[kind] || kind}</span>
                  </GalleryCardMeta>
                </GalleryCardBody>
              </GalleryCard>
    );
  }

  if (embedded) {
    return content;
  }

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      {content}
    </SectionPanel>
  );
}
