import { SectionPanel, StateBlock } from "../../../../../nexus-frontend/src/ui/index.js";
import useGalleryColumnWheel from "../shared/useGalleryColumnWheel.js";
import CollapsibleGalleryGroup from "../shared/CollapsibleGalleryGroup.jsx";
const React = window.React;
const { useCallback, useEffect, useMemo, useRef, useState } = React;

export default function ResourceGrid({
  items,
  placements = [],
  selectedIds,
  selectionMode = "single",
  customDragState = null,
  onCustomDragPointerDown,
  shouldSuppressClick,
  totalCount,
  loading,
  scrollKey,
  defaultColumns,
  scrollTop = 0,
  onScrollStateChange,
  onColumnWheel,
  columns = defaultColumns,
  infinite = false,
  hasMore = false,
  onLoadMore,
  onVisibleItemsChange,
  onGroupAssociationHover,
  currentPage,
  pageSize,
  onPageChange,
  onSelect,
  onOpen,
  onContextMenu,
  onClearSelection,
  emptyTitle,
  emptyDescription,
  ResourceCard,
  Pagination,
  getVirtualRange,
}) {
  const contentRef = useRef(null);
  const gridRef = useRef(null);
  const loadMoreSentinelRef = useRef(null);
  const loadMoreRef = useRef(onLoadMore);
  const attachColumnWheel = useGalleryColumnWheel(onColumnWheel);
  const setContentNode = useCallback((node) => {
    contentRef.current = node;
    attachColumnWheel(node);
  }, [attachColumnWheel]);
  const [virtualLayout, setVirtualLayout] = useState({
    gridWidth: 0,
    viewportHeight: 0,
    columns: defaultColumns,
    gap: 8,
  });
  const [virtualRange, setVirtualRange] = useState({
    startIndex: 0,
    endIndex: 0,
  });
  const groupedSections = useMemo(() => {
    if (!Array.isArray(placements) || !placements.length) return [];
    const itemById = new Map((Array.isArray(items) ? items : []).map((item) => [item.id, item]));
    const groups = [];
    const groupByKey = new Map();
    placements.forEach((placement) => {
      const item = itemById.get(placement?.resourceId);
      if (!item) return;
      const groupKey = String(placement?.groupKey || "");
      if (!groupByKey.has(groupKey)) {
        const group = { key: groupKey, label: placement?.groupLabel || groupKey, association: placement?.association || null, entries: [] };
        groupByKey.set(groupKey, group);
        groups.push(group);
      }
      groupByKey.get(groupKey).entries.push({ placement, item });
    });
    return groups;
  }, [items, placements]);
  const grouped = groupedSections.length > 0;

  loadMoreRef.current = onLoadMore;
  useEffect(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      contentNode.scrollTop = Math.max(0, Number(scrollTop) || 0);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [scrollKey, scrollTop]);

  useEffect(() => {
    if (!infinite) {
      return undefined;
    }

    const contentNode = contentRef.current;
    const gridNode = gridRef.current;

    if (!contentNode || !gridNode) {
      return undefined;
    }

    let frameId = 0;
    const updateVirtualLayout = () => {
      const computedStyle = window.getComputedStyle(gridNode);
      const trackSizes = String(computedStyle.gridTemplateColumns || "")
        .split(" ")
        .map((value) => value.trim())
        .filter((value) => /px$/.test(value));
      const columns = Math.max(1, trackSizes.length || defaultColumns);
      const gap = Math.max(0, Number.parseFloat(computedStyle.columnGap) || 8);
      const nextLayout = {
        gridWidth: gridNode.clientWidth || 0,
        viewportHeight: contentNode.clientHeight || 0,
        columns,
        gap,
      };
      const cardSize = Math.max(0, (
        nextLayout.gridWidth - gap * Math.max(0, columns - 1)
      ) / columns);
      const nextRange = getVirtualRange({
        itemCount: items.length,
        columns,
        rowHeight: cardSize + gap,
        scrollTop: contentNode.scrollTop || 0,
        viewportHeight: nextLayout.viewportHeight,
      });

      setVirtualLayout((currentValue) => (
        currentValue.gridWidth === nextLayout.gridWidth
        && currentValue.viewportHeight === nextLayout.viewportHeight
        && currentValue.columns === nextLayout.columns
        && currentValue.gap === nextLayout.gap
          ? currentValue
          : nextLayout
      ));
      setVirtualRange((currentValue) => (
        currentValue.startIndex === nextRange.startIndex
        && currentValue.endIndex === nextRange.endIndex
          ? currentValue
          : nextRange
      ));
    };
    const handleScroll = () => {
      onScrollStateChange?.(contentNode.scrollTop || 0);
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateVirtualLayout();

        if (
          hasMore
          && !loading
          && contentNode.scrollTop + contentNode.clientHeight >= contentNode.scrollHeight - 640
        ) {
          loadMoreRef.current?.();
        }
      });
    };
    const resizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(updateVirtualLayout)
      : null;

    resizeObserver?.observe(contentNode);
    resizeObserver?.observe(gridNode);
    contentNode.addEventListener("scroll", handleScroll, { passive: true });
    updateVirtualLayout();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver?.disconnect();
      contentNode.removeEventListener("scroll", handleScroll);
    };
  }, [columns, hasMore, infinite, items.length, loading, onScrollStateChange]);

  const isVirtualized = infinite && !grouped && virtualLayout.gridWidth > 0;
  const gridMetrics = useMemo(() => {
    const columns = Math.max(1, virtualLayout.columns || defaultColumns);
    const gap = Math.max(0, virtualLayout.gap || 0);
    const cardSize = Math.max(0, (
      virtualLayout.gridWidth - gap * Math.max(0, columns - 1)
    ) / columns);
    const rowHeight = cardSize + gap;

    return {
      columns,
      gap,
      cardSize,
      rowHeight,
    };
  }, [virtualLayout.columns, virtualLayout.gap, virtualLayout.gridWidth]);
  const totalRows = isVirtualized
    ? Math.ceil(items.length / gridMetrics.columns)
    : 0;
  const totalGridHeight = isVirtualized && totalRows
    ? totalRows * gridMetrics.cardSize + Math.max(0, totalRows - 1) * gridMetrics.gap
    : 0;
  const activeVirtualRange = isVirtualized
    ? virtualRange
    : {
      startIndex: 0,
      endIndex: items.length,
    };
  const renderedItems = useMemo(
    () => items.slice(activeVirtualRange.startIndex, activeVirtualRange.endIndex),
    [activeVirtualRange.endIndex, activeVirtualRange.startIndex, items],
  );

  useEffect(() => {
    if (!infinite) {
      return;
    }

    onVisibleItemsChange?.(renderedItems.map((item) => item.id));
  }, [infinite, onVisibleItemsChange, renderedItems]);

  useEffect(() => {
    if (!infinite || !isVirtualized || !hasMore || loading) {
      return undefined;
    }

    const contentNode = contentRef.current;
    const sentinelNode = loadMoreSentinelRef.current;

    if (!contentNode || !sentinelNode || typeof IntersectionObserver !== "function") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreRef.current?.();
        }
      },
      {
        root: contentNode,
        rootMargin: "640px 0px",
      },
    );

    observer.observe(sentinelNode);

    return () => observer.disconnect();
  }, [hasMore, infinite, isVirtualized, loading, totalGridHeight]);

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      {loading && !items.length ? (
        <StateBlock
          centered
          title="Cargando media"
          description="Leyendo la pagina actual de Booru."
        />
      ) : items.length ? (
        <div
          ref={setContentNode}
          className="booruView__resourcePanelBody"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              onClearSelection?.();
            }
          }}
        >
          <div className="booruView__resourcePanelContent">
            {grouped ? (
              <div ref={gridRef} className="booruView__groupedGallery">
                {groupedSections.map((group) => (
                  <CollapsibleGalleryGroup key={group.key} label={group.label} association={group.association} onAssociationHover={onGroupAssociationHover}>
                    <div className="booruView__mediaGrid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                      {group.entries.map(({ placement, item }, index) => (
                        <ResourceCard
                          key={placement.placementId}
                          item={item}
                          absoluteIndex={index}
                          selected={selectedIds.includes(item.id)}
                          multiSelected={selectedIds.includes(item.id) && selectionMode === "multi"}
                          dragResourceIds={selectedIds.includes(item.id) ? selectedIds : [item.id]}
                          customDragActive={Boolean(customDragState?.active && customDragState.resourceIds?.includes(item.id))}
                          onCustomDragPointerDown={onCustomDragPointerDown}
                          shouldSuppressClick={shouldSuppressClick}
                          onSelect={onSelect}
                          onOpen={onOpen}
                          onContextMenu={onContextMenu}
                          columns={columns}
                        />
                      ))}
                    </div>
                  </CollapsibleGalleryGroup>
                ))}
              </div>
            ) : (
              <div
                ref={gridRef}
                className={[
                  "booruView__mediaGrid",
                  infinite ? "booruView__mediaGrid--infinite" : "booruView__mediaGrid--paged",
                  isVirtualized ? "is-virtualized" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  ...(isVirtualized ? { height: `${totalGridHeight}px` } : {}),
                }}
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) onClearSelection?.();
                }}
              >
                {renderedItems.map((item, index) => {
                const absoluteIndex = activeVirtualRange.startIndex + index;
                const selected = selectedIds.includes(item.id);
                const row = Math.floor(absoluteIndex / gridMetrics.columns);
                const column = absoluteIndex % gridMetrics.columns;
                const cardStyle = isVirtualized
                  ? {
                    position: "absolute",
                    top: `${row * gridMetrics.rowHeight}px`,
                    left: `${column * (gridMetrics.cardSize + gridMetrics.gap)}px`,
                    width: `${gridMetrics.cardSize}px`,
                    height: `${gridMetrics.cardSize}px`,
                  }
                  : undefined;

                return (
                  <ResourceCard
                    key={item.id}
                    item={item}
                    absoluteIndex={absoluteIndex}
                    style={cardStyle}
                    selected={selected}
                    multiSelected={selected && selectionMode === "multi"}
                    dragResourceIds={selected ? selectedIds : [item.id]}
                    customDragActive={Boolean(customDragState?.active && customDragState.resourceIds?.includes(item.id))}
                    onCustomDragPointerDown={onCustomDragPointerDown}
                    shouldSuppressClick={shouldSuppressClick}
                    onSelect={onSelect}
                    onOpen={onOpen}
                    onContextMenu={onContextMenu}
                    columns={columns}
                  />
                );
                })}

                {infinite && hasMore ? (
                  <div
                    ref={loadMoreSentinelRef}
                    className="booruView__resourceLoadSentinel"
                    aria-hidden="true"
                    style={isVirtualized ? { top: `${Math.max(0, totalGridHeight - 1)}px` } : undefined}
                  />
                ) : null}
              </div>
            )}

            {grouped && infinite && hasMore ? (
              <div ref={loadMoreSentinelRef} className="booruView__resourceLoadSentinel" aria-hidden="true" />
            ) : null}

            {infinite ? (
              loading ? <span className="booruView__resourceLoadingMore">Cargando más media...</span> : null
            ) : (
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={onPageChange}
              />
            )}
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
