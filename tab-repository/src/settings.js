export const TAB_REPOSITORY_PLUGIN_ID = "nexus.tab-repository";
export const TAB_REPOSITORY_VIEW_ID = "nexus.tab-repository.workspace";
export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 440;
export const DEFAULT_SETTINGS = Object.freeze({
  batchSize: 20,
  showTitle: true,
  showUrl: true,
  sidebarWidth: 236,
});

export function normalizeSidebarWidth(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, Math.round(parsed)))
    : DEFAULT_SETTINGS.sidebarWidth;
}

export function normalizeSettings(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const parsedBatchSize = Number(source.batchSize);
  const batchSize = Number.isFinite(parsedBatchSize)
    ? Math.max(1, Math.min(100, Math.trunc(parsedBatchSize)))
    : DEFAULT_SETTINGS.batchSize;
  let showTitle = source.showTitle !== false;
  let showUrl = source.showUrl !== false;
  if (!showTitle && !showUrl) showUrl = true;
  return {
    batchSize,
    showTitle,
    showUrl,
    sidebarWidth: normalizeSidebarWidth(source.sidebarWidth),
  };
}
