import { resolveBooruVideoAutoplay } from "../../domain/video-preview-policy.js";
import { GalleryCard, GalleryCardMedia } from "@nexus/ui";
const React = window.React;
const { useCallback, useEffect, useMemo } = React;

export default function ResourceGridCard({
  item,
  absoluteIndex,
  style = undefined,
  selected,
  multiSelected,
  dragResourceIds,
  customDragActive = false,
  onCustomDragPointerDown,
  shouldSuppressClick,
  onSelect,
  onOpen,
  onContextMenu,
  useDrag,
  dndType,
  emptyImage,
  logger,
  uniqueIds,
  MediaPreview,
  defaultColumns,
}) {
  const videoAutoplay = resolveBooruVideoAutoplay(item);
  const normalizedDragResourceIds = useMemo(
    () => uniqueIds(Array.isArray(dragResourceIds) ? dragResourceIds : [item.id]),
    [dragResourceIds, item.id],
  );
  const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
    type: dndType,
    item: () => {
      const payload = {
        id: item.id,
        ids: normalizedDragResourceIds,
        primaryId: item.id,
        resourceId: item.id,
        resourceIds: normalizedDragResourceIds,
      };

      logger.debug(
        "booru.dnd.drag.start",
        "Booru inicio el arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          selected,
          multiSelected,
        },
      );

      return payload;
    },
    canDrag: () => Boolean(item?.id),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_draggedItem, monitor) => {
      logger.debug(
        "booru.dnd.drag.end",
        "Booru termino un arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          didDrop: monitor.didDrop(),
        },
      );
    },
  }), [item.id, multiSelected, normalizedDragResourceIds, selected]);

  useEffect(() => {
    if (typeof previewRef === "function" && typeof emptyImage === "function") {
      previewRef(emptyImage(), {
        captureDraggingState: true,
      });
    }
  }, [previewRef]);

  const handleDragRef = useCallback((node) => {
    dragRef(node);
  }, [dragRef]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(item, event);
    }
  };

  const handleClick = (event) => {
    if (shouldSuppressClick?.()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onSelect?.(item, event);
  };

  const handleDoubleClick = (event) => {
    if (shouldSuppressClick?.()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event?.ctrlKey || event?.metaKey) {
      return;
    }

    onOpen?.(item, event);
  };

  return (
    <GalleryCard
      as="div"
      ref={handleDragRef}
      role="button"
      tabIndex={0}
      interactive
      className={[
        "booruView__mediaCard",
        selected ? "is-selected" : "",
        multiSelected ? "is-multi-selected" : "",
        customDragActive ? "is-custom-dragging" : "",
        isDragging ? "is-dragging" : "",
      ].filter(Boolean).join(" ")}
      selected={selected}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(event) => onContextMenu?.(item, event)}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => onCustomDragPointerDown?.({
        event,
        item,
        resourceIds: normalizedDragResourceIds,
      })}
      onDragStart={() => {
        logger.debug(
          "booru.dnd.drag.dom-start",
          "El navegador disparo dragstart sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds,
          },
        );
      }}
      onDragEnd={() => {
        logger.debug(
          "booru.dnd.drag.dom-end",
          "El navegador disparo dragend sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds,
          },
        );
      }}
      aria-label={item.originalFilename}
      aria-selected={selected}
    >
      <GalleryCardMedia className="booruView__mediaCardPreview">
        <MediaPreview
          pathValue={item.storagePath}
          mediaKind={item.mediaKind}
          alt={item.originalFilename}
          thumbnail={item.thumbnail}
          highPriority={absoluteIndex < defaultColumns || selected}
          preferOriginalWhenThumbnailMissing
          autoplay={videoAutoplay.autoplay}
          loop={item.mediaKind === "video"}
          autoplayPath={videoAutoplay.autoplayPath}
          hoverPlayable={item.mediaKind === "gif"}
        />
      </GalleryCardMedia>
    </GalleryCard>
  );
}
