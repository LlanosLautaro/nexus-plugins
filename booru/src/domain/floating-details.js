export const BOORU_FLOATING_DETAILS_MIN_WIDTH = 360;
export const BOORU_FLOATING_DETAILS_MIN_HEIGHT = 320;

export function createBooruFloatingDetailsGeometry(viewport = {}) {
  const viewportWidth = Math.max(BOORU_FLOATING_DETAILS_MIN_WIDTH, Number(viewport.width || 1280));
  const viewportHeight = Math.max(BOORU_FLOATING_DETAILS_MIN_HEIGHT, Number(viewport.height || 800));
  const width = Math.min(520, viewportWidth - 32);
  const height = Math.min(680, viewportHeight - 32);
  return {
    x: Math.max(16, viewportWidth - width - 24),
    y: Math.max(16, Math.round((viewportHeight - height) / 2)),
    width,
    height,
  };
}

export function clampBooruFloatingDetailsGeometry(value, viewport = {}) {
  const viewportWidth = Math.max(1, Number(viewport.width || 1280));
  const viewportHeight = Math.max(1, Number(viewport.height || 800));
  const width = Math.min(
    viewportWidth,
    Math.max(Math.min(BOORU_FLOATING_DETAILS_MIN_WIDTH, viewportWidth), Number(value?.width || 520)),
  );
  const height = Math.min(
    viewportHeight,
    Math.max(Math.min(BOORU_FLOATING_DETAILS_MIN_HEIGHT, viewportHeight), Number(value?.height || 680)),
  );
  return {
    x: Math.min(Math.max(0, Number(value?.x || 0)), Math.max(0, viewportWidth - width)),
    y: Math.min(Math.max(0, Number(value?.y || 0)), Math.max(0, viewportHeight - height)),
    width,
    height,
  };
}

