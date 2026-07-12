import { SectionPanel, StateBlock } from "../../../../../nexus-frontend/src/ui/index.js";


export default function EntityGrid({
  kind,
  items,
  emptyTitle,
  emptyDescription,
  onOpenEntity,
  onPreviewContextMenu,
  onEntityHover,
  MediaPreview,
  entityKindLabels,
}) {
  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      {items.length ? (
        <div className="booruView__resourcePanelBody">
          <div className="booruView__entityGrid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="booruView__entityCard"
                onClick={() => onOpenEntity?.(kind, item)}
                onPointerEnter={() => onEntityHover?.(kind, item)}
                onPointerLeave={() => onEntityHover?.(null)}
              >
                <div
                  className="booruView__entityCardPreview"
                  onContextMenu={(event) => onPreviewContextMenu?.(item, event)}
                >
                  <MediaPreview
                    pathValue={item.cardOriginalStoragePath || item.cardPreviewPath || item.sampleStoragePath}
                    mediaKind={item.cardOriginalMediaKind || item.cardMediaKind || item.sampleMediaKind || "image"}
                    alt={item.displayName}
                    autoplay={(item.cardOriginalMediaKind || item.cardMediaKind) === "video"}
                    loop
                    forceOriginal
                  />
                </div>

                <div className="booruView__entityCardBody">
                  <strong>{item.displayName}</strong>
                  {kind === "character" && item?.universe?.displayName ? (
                    <div className="booruView__entityCardMeta">
                      <span>{item.universe.displayName}</span>
                    </div>
                  ) : null}
                  <div className="booruView__entityCardMeta">
                    <span>{item.resourceCount} recursos</span>
                    <span>{entityKindLabels[kind] || kind}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <StateBlock
          centered
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </SectionPanel>
  );
}
