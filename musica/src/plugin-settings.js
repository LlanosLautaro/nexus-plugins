export const MUSICA_SETTINGS_DEFAULTS = Object.freeze({
  extractEmbeddedCoverArt: true,
});

export function normalizeMusicaSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...MUSICA_SETTINGS_DEFAULTS,
    };
  }

  return {
    ...MUSICA_SETTINGS_DEFAULTS,
    ...value,
  };
}

export function isMusicaEmbeddedCoverArtEnabled(value) {
  return normalizeMusicaSettings(value).extractEmbeddedCoverArt !== false;
}

export function resolveEmbeddedCoverPayload({
  enabled = true,
  cover = null,
  coverMimeType = null,
} = {}) {
  if (!enabled) {
    return {
      cover: null,
      coverMimeType: null,
    };
  }

  return {
    cover: cover ?? null,
    coverMimeType: coverMimeType ?? null,
  };
}
