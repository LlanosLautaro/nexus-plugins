export function normalizeBooruResourceMutationResult(value) {
  const source = value && typeof value === "object" ? value : {};
  const legacyResources = Array.isArray(source.resource)
    ? source.resource
    : [source.resource].filter(Boolean);
  const updatedResources = (Array.isArray(source.updatedResources)
    ? source.updatedResources
    : legacyResources)
    .filter((resource) => resource?.id);

  return {
    revision: String(source.revision || "").trim(),
    reason: String(source.reason || "unknown").trim() || "unknown",
    updatedResources,
    leavingQueryIds: Array.from(new Set(
      (Array.isArray(source.leavingQueryIds) ? source.leavingQueryIds : [])
        .map((resourceId) => String(resourceId || "").trim())
        .filter(Boolean),
    )),
    enteredQueryIds: Array.from(new Set(
      (Array.isArray(source.enteredQueryIds) ? source.enteredQueryIds : [])
        .map((resourceId) => String(resourceId || "").trim())
        .filter(Boolean),
    )),
    queryPlacements: (Array.isArray(source.queryPlacements) ? source.queryPlacements : [])
      .map((placement) => ({
        resourceId: String(placement?.resourceId || "").trim(),
        index: Number(placement?.index),
      }))
      .filter((placement) => placement.resourceId && Number.isInteger(placement.index) && placement.index >= 0),
    affectedEntities: (Array.isArray(source.affectedEntities) ? source.affectedEntities : [])
      .map((entity) => ({
        kind: String(entity?.kind || "").trim(),
        id: String(entity?.id || "").trim(),
      }))
      .filter((entity) => entity.kind && entity.id),
    totalCountDelta: Number.isFinite(Number(source.totalCountDelta))
      ? Number(source.totalCountDelta)
      : 0,
  };
}

export function mergeBooruResourceRecords(currentResources, nextResources) {
  const nextById = new Map(
    (Array.isArray(nextResources) ? nextResources : [])
      .filter((resource) => resource?.id)
      .map((resource) => [resource.id, resource]),
  );
  const merged = (Array.isArray(currentResources) ? currentResources : [])
    .filter((resource) => resource?.id)
    .map((resource) => nextById.get(resource.id) || resource);
  const currentIds = new Set(merged.map((resource) => resource.id));

  for (const resource of nextById.values()) {
    if (!currentIds.has(resource.id)) {
      merged.push(resource);
    }
  }

  return merged;
}

export function applyBooruMutationToResourceWindow(currentItems, rawMutation) {
  const mutation = normalizeBooruResourceMutationResult(rawMutation);
  const originalItems = (Array.isArray(currentItems) ? currentItems : []).filter((item) => item?.id);
  const originalWindowSize = originalItems.length;
  const updatedById = new Map(mutation.updatedResources.map((resource) => [resource.id, resource]));
  const leavingIds = new Set(mutation.leavingQueryIds);
  const placementById = new Map(
    mutation.queryPlacements.map((placement) => [placement.resourceId, placement.index]),
  );
  const touchedIds = new Set([
    ...updatedById.keys(),
    ...leavingIds,
  ]);
  const nextItems = originalItems.filter((item) => !touchedIds.has(item.id));
  const positionedResources = [];

  for (const resource of mutation.updatedResources) {
    if (leavingIds.has(resource.id)) {
      continue;
    }

    const placement = placementById.get(resource.id);
    const wasLoaded = originalItems.some((item) => item.id === resource.id);

    if (Number.isInteger(placement) && placement >= 0 && placement < originalWindowSize) {
      positionedResources.push({ resource, placement });
    } else if (wasLoaded && placement == null) {
      positionedResources.push({ resource, placement: originalItems.findIndex((item) => item.id === resource.id) });
    }
  }

  positionedResources
    .sort((left, right) => left.placement - right.placement)
    .forEach(({ resource, placement }) => {
      nextItems.splice(Math.min(placement, nextItems.length), 0, resource);
    });

  return {
    items: nextItems,
    mutation,
  };
}

export function resolveBooruAnchoredResources(resourceIds, visibleResources, anchoredResources) {
  const visibleById = new Map(
    (Array.isArray(visibleResources) ? visibleResources : [])
      .filter((resource) => resource?.id)
      .map((resource) => [resource.id, resource]),
  );
  const anchoredById = new Map(
    (Array.isArray(anchoredResources) ? anchoredResources : [])
      .filter((resource) => resource?.id)
      .map((resource) => [resource.id, resource]),
  );

  return (Array.isArray(resourceIds) ? resourceIds : [])
    .map((resourceId) => anchoredById.get(resourceId) || visibleById.get(resourceId) || null)
    .filter(Boolean);
}

export function isBooruResourceWindowContextCurrent(requestContext, currentContext) {
  if (!requestContext || !currentContext) {
    return false;
  }

  return Boolean(currentContext.showResourceWorkspace)
    && String(currentContext.activeResourceSection || "") === String(requestContext.activeResourceSection || "")
    && String(currentContext.querySignature || "") === String(requestContext.querySignature || "")
    && Number(currentContext.currentResourcePage || 1) === Number(requestContext.currentResourcePage || 1)
    && Number(currentContext.itemCount || 0) === Number(requestContext.itemCount || 0);
}
