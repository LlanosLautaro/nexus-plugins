const React = window.React;
const { useCallback, useEffect, useMemo, useRef } = React;

export default function RecommendationEntityDropTarget({
  item,
  kind,
  manualAssignResourceIds = [],
  customDragMatch = false,
  dropDisabled = false,
  manualAssignDisabled = false,
  assigning = false,
  actionLabel = "Aplicar",
  onAssign,
  onApply,
  useDrop,
  dndType,
  resolveDragIds,
  logger,
  uniqueIds,
  KindBadge,
  Button,
  helpers,
}) {
  const { getRecommendationItemKindClass, getRecommendationKindTooltip } = helpers;
  const normalizedManualAssignResourceIds = useMemo(
    () => uniqueIds(manualAssignResourceIds),
    [manualAssignResourceIds],
  );
  const hoverSignatureRef = useRef("");
  const dragOverLogAtRef = useRef(0);
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: dndType,
    canDrop: (draggedItem) => {
      const draggedIds = resolveDragIds(draggedItem);
      return !dropDisabled && !assigning && draggedIds.length > 0;
    },
    hover: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      const draggedIds = resolveDragIds(draggedItem);
      const hoverSignature = `${item.id}:${draggedIds.join("|")}`;

      if (!draggedIds.length || hoverSignatureRef.current === hoverSignature) {
        return;
      }

      hoverSignatureRef.current = hoverSignature;
      logger.debug(
        "booru.dnd.drop.hover",
        "Booru detecto hover sobre un destino rapido.",
        {
          entityId: item.id,
          kind,
          resourceIds: draggedIds,
        },
      );
    },
    drop: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true }) || dropDisabled || assigning) {
        return;
      }

      const draggedIds = resolveDragIds(draggedItem);

      if (!draggedIds.length) {
        return;
      }

      logger.debug(
        "booru.dnd.drop.commit",
        "Booru recibio un drop sobre un destino rapido.",
        {
          entityId: item.id,
          kind,
          resourceIds: draggedIds,
        },
      );

      void onAssign?.({
        resourceId: draggedIds[0],
        resourceIds: draggedIds,
        kind,
        entityId: item.id,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [assigning, dropDisabled, item.id, kind, logger, onAssign, resolveDragIds]);

  useEffect(() => {
    if (!isOver) {
      hoverSignatureRef.current = "";
    }
  }, [isOver]);

  const handleDropRef = useCallback((node) => {
    dropRef(node);
  }, [dropRef]);

  const kindTooltip = getRecommendationKindTooltip(item);

  return (
    <div
      ref={handleDropRef}
      className={[
        "booruView__suggestion",
        "booruView__recommendationCard",
        "booruView__recommendationCard--entity",
        "booruView__suggestion--dropTarget",
        isOver && canDrop ? "is-drop-target" : "",
        customDragMatch ? "is-drop-target" : "",
      ].filter(Boolean).join(" ")}
      data-booru-quick-assign-target="true"
      data-booru-kind={kind}
      data-booru-entity-id={item.entityId || item.id}
      data-booru-label={item.label || item.displayName}
      onDragEnterCapture={() => {
        logger.debug(
          "booru.dnd.native.enter",
          "El navegador detecto dragenter sobre un destino rapido.",
          {
            entityId: item.id,
            kind,
          },
        );
      }}
      onDragOverCapture={() => {
        const now = Date.now();

        if (now - dragOverLogAtRef.current < 400) {
          return;
        }

        dragOverLogAtRef.current = now;
        logger.debug(
          "booru.dnd.native.over",
          "El navegador detecto dragover sobre un destino rapido.",
          {
            entityId: item.id,
            kind,
          },
        );
      }}
      onDropCapture={() => {
        logger.debug(
          "booru.dnd.native.drop",
          "El navegador detecto drop nativo sobre un destino rapido.",
          {
            entityId: item.id,
            kind,
          },
        );
      }}
    >
      <div className="booruView__recommendationCopy">
        <span>{item.label || item.displayName}</span>
        <small>{item.detail || `${item.resourceCount || 0} recursos`}</small>
      </div>
      <div className="booruView__recommendationActions">
        <KindBadge
          item={item}
          className={getRecommendationItemKindClass(item)}
          tooltip={kindTooltip}
        />
        <Button
          type="button"
          onClick={() => void onApply?.(item)}
          disabled={manualAssignDisabled || assigning || !normalizedManualAssignResourceIds.length}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
