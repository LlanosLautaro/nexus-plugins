export function filterTabs(tabs, query) {
  const normalized = String(query || "").trim().toLocaleLowerCase("es");
  if (!normalized) return tabs;
  return tabs.filter((tab) => [tab.title, tab.url, tab.domain]
    .filter(Boolean)
    .some((value) => String(value).toLocaleLowerCase("es").includes(normalized)));
}

export function getVirtualRange({ itemCount, rowHeight, scrollTop, viewportHeight, overscan = 8 }) {
  return {
    start: Math.max(0, Math.floor(scrollTop / rowHeight) - overscan),
    end: Math.min(itemCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan),
  };
}

export function reorderBefore(sourceOrder, movingIds, targetId) {
  const moving = new Set(movingIds);
  const next = sourceOrder.filter((id) => !moving.has(id));
  const targetIndex = next.indexOf(targetId);
  next.splice(targetIndex < 0 ? next.length : targetIndex, 0, ...sourceOrder.filter((id) => moving.has(id)));
  return next;
}

export function resolveTabIconUrl(tab) {
  const preferred = typeof tab?.faviconUrl === "string" ? tab.faviconUrl.trim() : "";
  if (preferred) return preferred;
  try {
    const parsed = new URL(tab?.url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return new URL("/favicon.ico", parsed.origin).href;
  } catch {
    return null;
  }
}

export function shouldSendTabOnDoubleClick(target, { disabled = false, trashed = false } = {}) {
  if (disabled || trashed) return false;
  if (!target || typeof target.closest !== "function") return true;
  return !target.closest("button, input, label, a, textarea, select, [role='button'], [role='menuitem'], .tabRepositoryRow__drag");
}
