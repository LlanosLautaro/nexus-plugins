function normalized(value) {
  return String(value || "").trim();
}

export function resolveItemLocationFromItemsState(itemsState, itemId) {
  const byId = itemsState?.byId || {};
  const item = byId[normalized(itemId)];
  if (!item) return null;

  const visited = new Set();
  const ancestorIds = [];
  const segments = [];
  let current = item;
  let root = null;

  while (current?.id) {
    const currentId = normalized(current.id);
    if (!currentId || visited.has(currentId)) return null;
    visited.add(currentId);
    const parentId = normalized(current.parentId);
    if (!parentId) {
      root = current;
      break;
    }
    if (normalized(current.name)) segments.push(normalized(current.name));
    ancestorIds.push(parentId);
    current = byId[parentId];
    if (!current) return null;
  }

  if (!root) return null;
  const orderedSegments = segments.reverse();
  const rootPath = String(root.path || "").replace(/[\\/]+$/, "");
  const separator = rootPath.includes("\\") || String(item.path || "").includes("\\") ? "\\" : "/";
  const relativePath = orderedSegments.length ? orderedSegments.join(separator) : null;
  return {
    itemId: String(item.id),
    parentId: item.parentId ?? null,
    name: String(item.name || ""),
    type: item.type === "folder" ? "folder" : "file",
    path: [rootPath, ...orderedSegments].filter(Boolean).join(separator),
    relativePath,
    contentRelativePath: orderedSegments.length ? orderedSegments.join("/") : null,
    ancestorIds,
  };
}
