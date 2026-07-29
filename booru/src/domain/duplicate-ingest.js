export function createBooruKeyedSerialExecutor() {
  const pendingByKey = new Map();

  return async function runBooruKeyedTask(rawKey, task) {
    const key = String(rawKey || "").trim();
    if (!key) throw new Error("La clave de ingestion es obligatoria.");
    if (typeof task !== "function") throw new Error("La tarea de ingestion es obligatoria.");

    const previous = pendingByKey.get(key) || Promise.resolve();
    let releaseCurrent;
    const current = new Promise((resolve) => {
      releaseCurrent = resolve;
    });
    pendingByKey.set(key, current);

    await previous.catch(() => undefined);
    try {
      return await task();
    } finally {
      releaseCurrent();
      if (pendingByKey.get(key) === current) pendingByKey.delete(key);
    }
  };
}

export function createBooruIngestMutation({
  resource,
  createdResourceId = null,
  reusedCanonical = false,
} = {}) {
  const resourceId = String(resource?.id || "").trim();
  const createdId = String(createdResourceId || "").trim() || null;
  return {
    reason: reusedCanonical ? "duplicate-reintegrated" : "resource-created",
    resource,
    createdResourceId: createdId,
    reusedCanonical: Boolean(reusedCanonical),
    updatedResourceIds: resourceId ? [resourceId] : [],
    createdResourceIds: createdId ? [createdId] : [],
  };
}
