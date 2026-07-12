const React = window.React;
const { useMemo } = React;

export default function BooruDragPreviewLayer({ resourcesById, customDragState = null, MediaPreview, getPreviewStyles, resolveDragIds, useDragLayer, dndType }) {
  if (customDragState?.active) {
    const primaryResource = resourcesById.get(customDragState.primaryId) || customDragState.primaryResource || null;

    return (
      <div className="booruView__dragPreviewLayer">
        <div
          className={[
            "booruView__dragPreview",
            customDragState.resourceIds?.length > 1 ? "is-multi" : "",
          ].filter(Boolean).join(" ")}
          style={getPreviewStyles({
            x: customDragState.x,
            y: customDragState.y,
          })}
        >
          <div className="booruView__dragPreviewThumb">
            {primaryResource ? (
              <MediaPreview
                pathValue={primaryResource.storagePath}
                mediaKind={primaryResource.mediaKind}
                alt={primaryResource.originalFilename}
                thumbnail={primaryResource.thumbnail}
                preferOriginalWhenThumbnailMissing
              />
            ) : (
              <div className="booruView__previewFallback">Media</div>
            )}
          </div>
          <div className="booruView__dragPreviewCopy">
            <span>{primaryResource?.originalFilename || "Moviendo recurso"}</span>
            <small>
              {customDragState.overTarget?.label
                ? `Soltar en ${customDragState.overTarget.label}`
                : customDragState.resourceIds?.length > 1
                  ? `${customDragState.resourceIds.length} recursos`
                  : "Arrastra hacia una asignacion rapida"}
            </small>
          </div>
        </div>
      </div>
    );
  }

  const dragLayerState = useDragLayer((monitor) => ({
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem(),
  }));

  const dragSummary = useMemo(() => {
    const draggedIds = resolveDragIds(dragLayerState.item);

    if (!draggedIds.length) {
      return null;
    }

    const primaryId = String(dragLayerState.item?.primaryId || draggedIds[0] || "").trim();
    const primaryResource = resourcesById.get(primaryId) || resourcesById.get(draggedIds[0]) || null;

    return {
      count: draggedIds.length,
      label: primaryResource?.originalFilename || "Moviendo recurso",
      primaryResource,
    };
  }, [dragLayerState.item, resourcesById]);

  if (!dragLayerState.isDragging || dragLayerState.itemType !== dndType || !dragSummary) {
    return null;
  }

  return (
    <div className="booruView__dragPreviewLayer">
      <div
        className={[
          "booruView__dragPreview",
          dragSummary.count > 1 ? "is-multi" : "",
        ].filter(Boolean).join(" ")}
        style={getPreviewStyles(dragLayerState.currentOffset)}
      >
        <div className="booruView__dragPreviewThumb">
          {dragSummary.primaryResource ? (
            <MediaPreview
              pathValue={dragSummary.primaryResource.storagePath}
              mediaKind={dragSummary.primaryResource.mediaKind}
              alt={dragSummary.primaryResource.originalFilename}
              thumbnail={dragSummary.primaryResource.thumbnail}
              preferOriginalWhenThumbnailMissing
            />
          ) : (
            <div className="booruView__previewFallback">Media</div>
          )}
        </div>
        <div className="booruView__dragPreviewCopy">
          <span>{dragSummary.label}</span>
          {dragSummary.count > 1 ? (
            <small>{dragSummary.count} recursos</small>
          ) : null}
        </div>
      </div>
    </div>
  );
}
