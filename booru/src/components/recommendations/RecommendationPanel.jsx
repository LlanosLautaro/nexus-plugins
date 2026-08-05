const React = window.React;
const { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } = React;
import { SearchField } from "@nexus/ui";

export default function RecommendationPanel({
  selectedResourceIds = [],
  customDragState = null,
  manualAssignDisabledReason = "",
  assigning = false,
  revisionKey = 0,
  resourceQuery = null,
  recommendationScope = "all",
  draft = null,
  onAssignEntity,
  onApplyRecommendation,
  invoke,
  stepSuggestionIndex,
  normalizeIds,
  EntityDropTarget,
  KindBadge,
  Button,
  StateBlock,
  logger,
  logDuration,
  summarizeIds,
  pageSize,
  helpers,
  variant = "sidebar",
}) {
  const { getRecommendationItemKindClass, getRecommendationKindTooltip } = helpers;
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const selectedResourceIdsSignature = JSON.stringify(Array.isArray(selectedResourceIds) ? selectedResourceIds.filter(Boolean) : []);
  const normalizedSelectedResourceIds = useMemo(
    () => normalizeIds(selectedResourceIds),
    [selectedResourceIdsSignature],
  );
  const selectionCount = normalizedSelectedResourceIds.length;
  const manualAssignDisabled = Boolean(manualAssignDisabledReason) || assigning || !selectionCount;
  const searchDisabled = assigning;
  const showBlockingLoading = loading && items.length === 0;
  const listRef = useRef(null);
  const requestVersionRef = useRef(0);
  const deferredQuery = useDeferredValue(query);
  const normalizedDeferredQuery = String(deferredQuery || "").trim();
  const waitsForQuery = variant === "details";
  const draftSignature = JSON.stringify({
    reality: draft?.reality || null,
    authors: summarizeIds(draft?.authors),
    artists: summarizeIds(draft?.artists),
    characters: summarizeIds(draft?.characters),
    universes: summarizeIds(draft?.universes),
    manualTags: summarizeIds(draft?.manualTags),
  });
  const resourceQuerySignature = JSON.stringify(resourceQuery || {});

  const loadRecommendations = useCallback(async ({
    append = false,
    requestedOffset = 0,
  } = {}) => {
    if (waitsForQuery && !normalizedDeferredQuery) {
      requestVersionRef.current += 1;
      setItems([]);
      setTotalCount(0);
      setHasMore(false);
      setError("");
      setLoading(false);
      return;
    }

    const startedAt = performance.now();
    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;
    setLoading(true);

    logger.debug(
      "booru.recommendations.start",
      "Booru inicio la carga del recomendador unificado.",
      {
        append,
        query: normalizedDeferredQuery || null,
        requestedOffset,
        revisionKey,
        selectedResourceIds: normalizedSelectedResourceIds.slice(0, 12),
        selectedCount: selectionCount,
      },
    );

    try {
      const data = await invoke("booru:list-recommendations", {
        query: normalizedDeferredQuery || null,
        resourceQuery,
        scope: recommendationScope,
        selectedResourceIds: normalizedSelectedResourceIds,
        draft,
        offset: requestedOffset,
        limit: pageSize,
      });

      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems((currentValue) => (append ? [...currentValue, ...nextItems] : nextItems));
      setTotalCount(Number(data?.totalCount || 0));
      setHasMore(Boolean(data?.hasMore));
      setError("");
      logDuration(
        "booru.recommendations.done",
        "Booru resolvio la carga del recomendador.",
        performance.now() - startedAt,
        {
          append,
          query: normalizedDeferredQuery || null,
          requestedOffset,
          itemCount: nextItems.length,
          totalCount: Number(data?.totalCount || 0),
          hasMore: Boolean(data?.hasMore),
          sampleIds: summarizeIds(nextItems),
        },
      );
    } catch (loadError) {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      if (!append) {
        setItems([]);
      }
      setTotalCount(0);
      setHasMore(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las recomendaciones.",
      );
      logger.info(
        "booru.recommendations.error",
        "Booru no pudo cargar el recomendador unificado.",
        {
          query: String(deferredQuery || "").trim() || null,
          requestedOffset,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
        },
      );
    } finally {
      if (requestVersionRef.current === requestVersion) {
        setLoading(false);
      }
    }
  }, [
    deferredQuery,
    draft,
    invoke,
    logDuration,
    logger,
    normalizedSelectedResourceIds,
    pageSize,
    resourceQuery,
    recommendationScope,
    revisionKey,
    selectionCount,
    summarizeIds,
    normalizedDeferredQuery,
    waitsForQuery,
  ]);

  useEffect(() => {
    void loadRecommendations({ append: false, requestedOffset: 0 });
  }, [draftSignature, loadRecommendations, resourceQuerySignature]);

  useEffect(() => {
    setHighlightedIndex(items.length ? 0 : -1);
  }, [items, query]);

  useEffect(() => {
    setQuery("");
  }, [recommendationScope]);

  const handleTriggerItem = async (item) => {
    if (!item || manualAssignDisabled) {
      return;
    }

    try {
      await onApplyRecommendation?.(item);
      setQuery("");
      setError("");
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "No se pudo aplicar la recomendacion.",
      );
    }
  };

  const handleListScroll = useCallback((event) => {
    const target = event.currentTarget;

    if (!target || loading || !hasMore) {
      return;
    }

    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remainingScroll <= 72) {
      void loadRecommendations({
        append: true,
        requestedOffset: items.length,
      });
    }
  }, [hasMore, items.length, loadRecommendations, loading]);

  return (
    <div className={["booruView__quickAssign", variant === "details" ? "booruView__quickAssign--details" : ""].filter(Boolean).join(" ")}>
      <span className="booruView__groupLabel">
        {variant === "details" ? "Agregar" : (recommendationScope === "tags" ? "Tags" : "Recomendaciones")}
      </span>

      <div className="booruView__entityInputRow">
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, items.length, 1));
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, items.length, -1));
              return;
            }

            if (event.key === "Escape") {
              setQuery("");
              setItems([]);
              setHighlightedIndex(-1);
              return;
            }

            if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault();

              if (highlightedIndex >= 0 && items[highlightedIndex]) {
                void handleTriggerItem(items[highlightedIndex]);
              }
            }
          }}
          placeholder={
            recommendationScope === "tags"
              ? "Buscar o crear tags"
              : recommendationScope === "essential"
                ? "Buscar persona, char, artist o universe"
                : "Buscar recomendaciones o usar persona:, char:, artist:, universe:, tag:"
          }
          disabled={searchDisabled}
          aria-label={recommendationScope === "tags" ? "Buscar tags" : "Buscar recomendaciones"}
        />
      </div>

      <span className="booruView__suggestionsHint">
        {manualAssignDisabledReason || (
          selectionCount > 1
            ? `Aplicara la recomendacion elegida a ${selectionCount} recursos seleccionados cuando corresponda.`
            : variant === "details"
              ? "Busca una tag o entidad y aplicala al recurso."
              : "Click aplica sobre el draft actual. Drag/drop conserva la asignacion rapida directa para entidades."
        )}
      </span>

      {error ? <p className="booruView__fieldError">{error}</p> : null}

      {!waitsForQuery || normalizedDeferredQuery ? <div
        ref={listRef}
        className="booruView__quickAssignList"
        onScroll={handleListScroll}
      >
        {showBlockingLoading ? (
          <span className="booruView__suggestionsHint">Cargando recomendaciones...</span>
        ) : items.length ? (
          <>
            {items.map((item, index) => (
              <div
                key={item.id}
                className={highlightedIndex === index ? "booruView__quickAssignRow is-highlighted" : "booruView__quickAssignRow"}
              >
                {item.type === "entity" ? (
                  <EntityDropTarget
                    item={item}
                    kind={item.kind}
                    actionLabel={item.actionLabel || "Aplicar"}
                    manualAssignResourceIds={normalizedSelectedResourceIds}
                    customDragMatch={Boolean(
                      customDragState?.active
                      && customDragState?.overTarget?.kind === item.kind
                      && customDragState?.overTarget?.entityId === item.entityId,
                    )}
                    dropDisabled={assigning}
                    manualAssignDisabled={manualAssignDisabled}
                    assigning={assigning}
                    onAssign={onAssignEntity}
                    onApply={handleTriggerItem}
                  />
                ) : (
                  <div className={["booruView__suggestion", "booruView__recommendationCard"].join(" ")}>
                    <div className="booruView__recommendationCopy">
                      <span>{item.label}</span>
                      <small>{item.detail || ""}</small>
                    </div>
                    <div className="booruView__recommendationActions">
                      <KindBadge
                        item={item}
                        className={getRecommendationItemKindClass(item)}
                        tooltip={getRecommendationKindTooltip(item)}
                      />
                      <Button
                        type="button"
                        onClick={() => void handleTriggerItem(item)}
                        disabled={manualAssignDisabled || assigning}
                      >
                        {item.actionLabel || "Aplicar"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading ? (
              <span className="booruView__suggestionsHint">Actualizando recomendaciones...</span>
            ) : null}
            {!loading && hasMore ? (
              <span className="booruView__suggestionsHint">Scroll para seguir cargando. {items.length} de {totalCount} visibles.</span>
            ) : null}
          </>
        ) : (
          <span className="booruView__suggestionsHint">
            Sin recomendaciones por ahora. Ajusta el contexto o escribe una busqueda.
          </span>
        )}
      </div> : null}
    </div>
  );
}
