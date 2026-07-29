import { StateBlock } from "@nexus/ui";

const React = window.React;
const { useEffect, useRef } = React;

export default function EntityRelationsGrid({
  kind,
  state,
  loading,
  onLoadMore,
  onOpenEntity,
  onPreviewContextMenu,
  EntityGrid,
  MediaPreview,
  entityKindLabels,
  getInitials,
  columns,
  onColumnsChange,
  onEntityHover,
  onGroupAssociationHover,
}) {
  const sentinelRef = useRef(null);
  const items = Array.isArray(state?.items) ? state.items : [];

  useEffect(() => {
    if (!state?.hasMore || loading || !sentinelRef.current || typeof IntersectionObserver !== "function") {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
    }, { rootMargin: "420px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, onLoadMore, state?.hasMore]);

  if (loading && !items.length) {
    return <StateBlock centered title="Cargando relaciones" description="Leyendo perfiles relacionados desde Booru." />;
  }

  return (
    <div className="booruView__entityRelations">
      <EntityGrid
        embedded
        kind={kind}
        items={items}
        placements={Array.isArray(state?.placements) ? state.placements : []}
        emptyTitle="Sin relaciones"
        emptyDescription="No hay perfiles relacionados para esta consulta."
        onOpenEntity={onOpenEntity}
        onPreviewContextMenu={onPreviewContextMenu}
        MediaPreview={MediaPreview}
        entityKindLabels={entityKindLabels}
        getInitials={getInitials}
        columns={columns}
        onColumnsChange={onColumnsChange}
        onEntityHover={onEntityHover}
        onGroupAssociationHover={onGroupAssociationHover}
      />
      {state?.hasMore ? <div ref={sentinelRef} className="booruView__resourceLoadSentinel" aria-hidden="true" /> : null}
      {loading && items.length ? <span className="booruView__resourceLoadingMore">Cargando mas perfiles...</span> : null}
    </div>
  );
}
