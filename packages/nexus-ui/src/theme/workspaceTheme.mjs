const DEFAULT_PRESET_ID = "default";

export const THEME_FONT_OPTIONS = {
  system: {
    id: "system",
    label: "Sistema",
    stack: '"Segoe UI Variable", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  technical: {
    id: "technical",
    label: "Técnica",
    stack: '"Bahnschrift", "Segoe UI Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
  },
  mono: {
    id: "mono",
    label: "Monoespaciada",
    stack: '"Cascadia Code", "Consolas", "Courier New", monospace',
  },
};

export const THEME_PRESETS = {
  default: {
    presetId: "default",
    label: "Default",
    canvasHex: "#000000",
    surfaceH: 248,
    surfaceS: 24,
    surfaceBaseL: 0,
    accentH: 266,
    accentS: 86,
    accentL: 62,
    accentShift: 0,
    atmosphereStrength: 16,
    textHex: "#f1ecfa",
    fontFamily: "system",
    fontScale: 1,
    borderStrength: 0.92,
    radiusScale: 0.82,
    glowStrength: 1.12,
    motionScale: 1,
  },
};

export const DEFAULT_WORKSPACE_THEME = { ...THEME_PRESETS[DEFAULT_PRESET_ID] };

const THEME_LIMITS = {
  surfaceH: [0, 360],
  surfaceS: [0, 100],
  surfaceBaseL: [-5, 87],
  accentH: [0, 360],
  accentS: [0, 100],
  accentL: [0, 100],
  accentShift: [0, 60],
  atmosphereStrength: [0, 36],
  fontScale: [0.85, 1.2],
  borderStrength: [0.35, 1.8],
  radiusScale: [0.5, 1.5],
  glowStrength: [0, 1.6],
  motionScale: [0, 1],
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeNumber(value, fallback, [min, max]) {
  const nextValue = Number(value);

  if (!Number.isFinite(nextValue)) {
    return fallback;
  }

  return clamp(nextValue, min, max);
}

function getPresetSeed(presetId) {
  return THEME_PRESETS[presetId] || THEME_PRESETS[DEFAULT_PRESET_ID];
}

function isValidHexColor(value) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || "").trim());
}

function normalizeHexColor(value, fallback) {
  if (!isValidHexColor(value)) {
    return fallback;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length === 4
    ? `#${normalizedValue.slice(1).split("").map((character) => `${character}${character}`).join("")}`
    : normalizedValue.toLowerCase();
}

function normalizeFontFamily(value, fallback = "system") {
  return Object.hasOwn(THEME_FONT_OPTIONS, value) ? value : fallback;
}

export function normalizeWorkspaceTheme(input = {}) {
  const requestedPresetId = typeof input?.presetId === "string"
    ? input.presetId
    : DEFAULT_PRESET_ID;
  const presetId = requestedPresetId === "custom"
    || Object.hasOwn(THEME_PRESETS, requestedPresetId)
    ? requestedPresetId
    : "custom";
  const presetSeed = getPresetSeed(presetId === "custom" ? DEFAULT_PRESET_ID : presetId);
  const nextTheme = {
    ...presetSeed,
    ...input,
    presetId,
  };
  const canvasHex = normalizeHexColor(nextTheme.canvasHex, presetSeed.canvasHex);
  const surfaceSeed = deriveSurfaceSeed(canvasHex, presetSeed);

  return {
    presetId,
    canvasHex,
    // Surface roles are intentionally derived from the single background seed.
    // The fields stay in the normalized contract so older saved themes and
    // consumers remain readable, but they are no longer independent inputs.
    ...surfaceSeed,
    accentH: normalizeNumber(nextTheme.accentH, presetSeed.accentH, THEME_LIMITS.accentH),
    accentS: normalizeNumber(nextTheme.accentS, presetSeed.accentS, THEME_LIMITS.accentS),
    accentL: normalizeNumber(nextTheme.accentL, presetSeed.accentL, THEME_LIMITS.accentL),
    // Compatibility field only. Older saved themes may contain a hue shift,
    // but the single-accent contract intentionally normalizes it away.
    accentShift: 0,
    atmosphereStrength: normalizeNumber(
      nextTheme.atmosphereStrength,
      presetSeed.atmosphereStrength,
      THEME_LIMITS.atmosphereStrength,
    ),
    textHex: normalizeHexColor(nextTheme.textHex, presetSeed.textHex),
    fontFamily: normalizeFontFamily(nextTheme.fontFamily, presetSeed.fontFamily),
    fontScale: normalizeNumber(nextTheme.fontScale, presetSeed.fontScale, THEME_LIMITS.fontScale),
    borderStrength: normalizeNumber(
      nextTheme.borderStrength,
      presetSeed.borderStrength,
      THEME_LIMITS.borderStrength,
    ),
    radiusScale: normalizeNumber(
      nextTheme.radiusScale,
      presetSeed.radiusScale,
      THEME_LIMITS.radiusScale,
    ),
    glowStrength: normalizeNumber(
      nextTheme.glowStrength,
      presetSeed.glowStrength,
      THEME_LIMITS.glowStrength,
    ),
    motionScale: normalizeNumber(
      nextTheme.motionScale,
      presetSeed.motionScale,
      THEME_LIMITS.motionScale,
    ),
  };
}

export function getPresetOptions() {
  return Object.values(THEME_PRESETS).map((preset) => ({
    id: preset.presetId,
    label: preset.label,
  }));
}

export function createPresetTheme(presetId = DEFAULT_PRESET_ID) {
  return normalizeWorkspaceTheme({
    ...getPresetSeed(presetId),
    presetId,
  });
}

function componentToHex(value) {
  return Math.round(value).toString(16).padStart(2, "0");
}

export function hslToHex(h, s, l) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const saturation = clamp(Number(s), 0, 100) / 100;
  const lightness = clamp(Number(l), 0, 100) / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const scaledHue = hue / 60;
  const intermediate = chroma * (1 - Math.abs((scaledHue % 2) - 1));
  const match = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (scaledHue >= 0 && scaledHue < 1) {
    red = chroma;
    green = intermediate;
  } else if (scaledHue < 2) {
    red = intermediate;
    green = chroma;
  } else if (scaledHue < 3) {
    green = chroma;
    blue = intermediate;
  } else if (scaledHue < 4) {
    green = intermediate;
    blue = chroma;
  } else if (scaledHue < 5) {
    red = intermediate;
    blue = chroma;
  } else {
    red = chroma;
    blue = intermediate;
  }

  return `#${componentToHex((red + match) * 255)}${componentToHex((green + match) * 255)}${componentToHex((blue + match) * 255)}`;
}

export function hexToHsl(hexColor) {
  const normalizedHex = String(hexColor || "")
    .trim()
    .replace(/^#/, "");

  const fullHex = normalizedHex.length === 3
    ? normalizedHex.split("").map((char) => `${char}${char}`).join("")
    : normalizedHex;

  if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) {
    return null;
  }

  const red = parseInt(fullHex.slice(0, 2), 16) / 255;
  const green = parseInt(fullHex.slice(2, 4), 16) / 255;
  const blue = parseInt(fullHex.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    switch (max) {
      case red:
        hue = 60 * (((green - blue) / delta) % 6);
        break;
      case green:
        hue = 60 * ((blue - red) / delta + 2);
        break;
      default:
        hue = 60 * ((red - green) / delta + 4);
        break;
    }
  }

  return {
    h: Math.round((hue + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function deriveSurfaceSeed(canvasHex, fallbackTheme) {
  const parsed = hexToHsl(canvasHex);

  if (!parsed) {
    return {
      surfaceH: fallbackTheme.surfaceH,
      surfaceS: fallbackTheme.surfaceS,
      surfaceBaseL: fallbackTheme.surfaceBaseL,
    };
  }

  return {
    surfaceH: (parsed.h + 8) % 360,
    surfaceS: clamp(Math.round(parsed.s * 0.62), 0, 48),
    // The background seed is the actual base surface. Elevation may move
    // slightly above it, but normalization must never brighten the seed first.
    surfaceBaseL: clamp(parsed.l, THEME_LIMITS.surfaceBaseL[0], THEME_LIMITS.surfaceBaseL[1]),
  };
}

export function getAccentHex(theme) {
  const normalizedTheme = normalizeWorkspaceTheme(theme);
  return hslToHex(
    normalizedTheme.accentH,
    normalizedTheme.accentS,
    normalizedTheme.accentL,
  );
}

export function getSurfaceHex(theme) {
  const normalizedTheme = normalizeWorkspaceTheme(theme);
  return hslToHex(
    normalizedTheme.surfaceH,
    normalizedTheme.surfaceS,
    clamp(normalizedTheme.surfaceBaseL + 5, 0, 100),
  );
}

export function getCanvasHex(theme) {
  return normalizeWorkspaceTheme(theme).canvasHex;
}

export function getTextHex(theme) {
  return normalizeWorkspaceTheme(theme).textHex;
}

export function getFontOptions() {
  return Object.values(THEME_FONT_OPTIONS).map(({ id, label }) => ({ id, label }));
}

export function updateAccentFromHex(theme, hexColor) {
  const parsed = hexToHsl(hexColor);

  if (!parsed) {
    return normalizeWorkspaceTheme(theme);
  }

  return normalizeWorkspaceTheme({
    ...theme,
    presetId: "custom",
    accentH: parsed.h,
    accentS: parsed.s,
    accentL: parsed.l,
  });
}

export function updateSurfaceFromHex(theme, hexColor) {
  // Compatibility alias for callers that still use the old surface API.
  // Theme Editor now exposes one background seed and derives all surfaces.
  return updateCanvasFromHex(theme, hexColor);
}

export function updateCanvasFromHex(theme, hexColor) {
  return normalizeWorkspaceTheme({
    ...theme,
    presetId: "custom",
    canvasHex: normalizeHexColor(hexColor, normalizeWorkspaceTheme(theme).canvasHex),
  });
}

export function updateTextFromHex(theme, hexColor) {
  return normalizeWorkspaceTheme({
    ...theme,
    presetId: "custom",
    textHex: normalizeHexColor(hexColor, normalizeWorkspaceTheme(theme).textHex),
  });
}

export function getThemeCssVariables(theme) {
  const normalizedTheme = normalizeWorkspaceTheme(theme);
  const round = (value, precision = 3) => Number(value.toFixed(precision));

  return {
    "--canvas-base": normalizedTheme.canvasHex,
    "--surface-h": `${normalizedTheme.surfaceH}`,
    "--surface-s": `${normalizedTheme.surfaceS}%`,
    "--surface-base-l": `${normalizedTheme.surfaceBaseL}%`,
    "--accent-h": `${normalizedTheme.accentH}`,
    "--accent-s": `${normalizedTheme.accentS}%`,
    "--accent-l": `${normalizedTheme.accentL}%`,
    "--accent-shift": `${normalizedTheme.accentShift}`,
    "--atmosphere-strength": `${normalizedTheme.atmosphereStrength}%`,
    "--text-base": normalizedTheme.textHex,
    "--font-sans": THEME_FONT_OPTIONS[normalizedTheme.fontFamily].stack,
    "--font-scale": `${normalizedTheme.fontScale}`,
    "--border-strength": `${normalizedTheme.borderStrength}`,
    "--radius-scale": `${normalizedTheme.radiusScale}`,
    "--glow-strength": `${normalizedTheme.glowStrength}`,
    "--motion-scale": `${normalizedTheme.motionScale}`,
    "--font-size-root": `${round(16 * normalizedTheme.fontScale)}px`,
    "--border-alpha-panel": `${round(8 * normalizedTheme.borderStrength)}%`,
    "--border-alpha-soft": `${round(7 * normalizedTheme.borderStrength)}%`,
    "--border-alpha-strong": `${round(12 * normalizedTheme.borderStrength)}%`,
    "--glow-atmosphere-strength": `${round(
      normalizedTheme.atmosphereStrength * normalizedTheme.glowStrength,
    )}%`,
    "--radius-xs": `${round(2 * normalizedTheme.radiusScale)}px`,
    "--radius-s": `${round(3 * normalizedTheme.radiusScale)}px`,
    "--radius-m": `${round(5 * normalizedTheme.radiusScale)}px`,
    "--radius-l": `${round(7 * normalizedTheme.radiusScale)}px`,
    "--radius-xl": `${round(9 * normalizedTheme.radiusScale)}px`,
    "--radius-2xl": `${round(12 * normalizedTheme.radiusScale)}px`,
    "--duration-fast": `${round(160 * normalizedTheme.motionScale)}ms`,
    "--duration-normal": `${round(220 * normalizedTheme.motionScale)}ms`,
    "--duration-slow": `${round(320 * normalizedTheme.motionScale)}ms`,
    "--duration-ambient": `${round(2400 * normalizedTheme.motionScale)}ms`,
    "--duration-scan": `${round(1900 * normalizedTheme.motionScale)}ms`,
    "--duration-selector": `${round(500 * normalizedTheme.motionScale)}ms`,
  };
}

export function applyWorkspaceTheme(theme, root = globalThis?.document?.documentElement) {
  const normalizedTheme = normalizeWorkspaceTheme(theme);

  if (!root) {
    return normalizedTheme;
  }

  root.dataset.theme = normalizedTheme.presetId === "custom"
    ? "nexus-custom"
    : `nexus-${normalizedTheme.presetId}`;

  const variables = getThemeCssVariables(normalizedTheme);
  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  return normalizedTheme;
}
