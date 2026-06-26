const React = window.React;
const {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} = React;
import {
  CategoryScale,
  Chart as ChartJS,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
} from "chart.js";

import {
  Button,
  Field,
  FieldGrid,
  IconButton,
  Notice,
  PanelHeader,
  PanelStack,
  PanelTitle,
  ScrollRegion,
  SegmentedControl,
  SectionPanel,
  SplitDetail,
  SplitLayout,
  SplitSidebar,
  StateBlock,
  WorkspaceBody,
  WorkspacePage,
} from "../../../nexus-frontend/src/ui/index.js";
import {
  getCachedIconSvgMarkup,
  loadIconSvgMarkup,
  loadUnifiedIconCatalog,
} from "../../../nexus-frontend/src/components/icons/iconCatalogClient.js";
import {
  CanvasWorkspace,
  createCanvasStateFromLegacyLayouts,
} from "../../../nexus-frontend/src/internalModules/runtime/CanvasWorkspace.jsx";
import PersonalFinanceView from "./finance/PersonalFinanceView.jsx";
import TrainingView from "./training/TrainingView.jsx";
import {
  createRoutineAssignmentDraft,
  createRoutineCaptureDraft,
  normalizeRoutineAssignmentPayload,
  RoutineAssignmentModal,
  RoutineCaptureModal,
  serializeRoutineCaptureDraft,
} from "./training/home-modals.jsx";
import { TRAINING_SETTINGS_DEFAULTS } from "./training/plugin-settings.js";
import {
  DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
  DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
  HABIT_CATEGORY_PRESETS,
  HABIT_EDIT_WIZARD_STEPS,
  HABIT_PROGRESS_OPTIONS,
  HABIT_QUANTITY_MODE_OPTIONS,
  HABIT_WIZARD_STEPS,
  LIFE_TRACKER_CANVAS_STATE_KEY,
  LIFE_TRACKER_DEFAULT_SECTION,
  LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY,
  LIFE_TRACKER_HOME_CANVAS_ID,
  LIFE_TRACKER_LEGACY_DASHBOARD_LAYOUTS_KEY,
  LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY,
  LIFE_TRACKER_PLUGIN_ID,
  LIFE_TRACKER_SECTION_OPTIONS,
  LIFE_TRACKER_WORKSPACE_VIEW_ID,
  WEEKDAY_OPTIONS,
} from "./constants.js";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
} from "./icons.jsx";

const { ipcRenderer } = window.require("electron");

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
);

const HABIT_OUTCOME_RANGE_TICK_LIMITS = {
  "7d": 7,
  "1m": 8,
  "1y": 12,
};
const LIFE_TRACKER_HABITS_CHANNEL_PREFIX = "life-tracker:habits";
const LIFE_TRACKER_FINANCE_CHANNEL_PREFIX = "life-tracker:finance";
const LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";
const LIFE_TRACKER_HABITS_CHANNELS = {
  getHome: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:get-home`,
  saveTask: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-task`,
  toggleTask: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-task`,
  deleteTask: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-task`,
  saveHabit: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-habit`,
  toggleOccurrence: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence`,
  setOccurrenceQuantity: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:set-occurrence-quantity`,
  toggleOccurrenceChecklistItem: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence-checklist-item`,
  deleteHabit: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-habit`,
  saveCategory: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-category`,
  deleteCategory: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-category`,
  renameCategoryReferences: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:rename-category-references`,
  clearCategoryReferences: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:clear-category-references`,
};
const LIFE_TRACKER_FINANCE_CHANNELS = {
  list: `${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:list`,
};
const LIFE_TRACKER_TRAINING_CHANNELS = {
  list: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list`,
  listAssignments: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list-assignments`,
  getAssignment: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:get-assignment`,
  saveAssignment: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-assignment`,
  deleteAssignment: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-assignment`,
  saveOccurrenceResult: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-occurrence-result`,
};
const HABITOS_DASHBOARD_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};
const HABITOS_DASHBOARD_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};
const HABITOS_DASHBOARD_DEFAULT_LAYOUTS = {
  lg: [
    { i: "daily-queue", x: 0, y: 0, w: 8, h: 13, minW: 4, minH: 7 },
    { i: "habit-outcome", x: 8, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
    { i: "upcoming-tasks", x: 8, y: 7, w: 4, h: 6, minW: 3, minH: 5 },
  ],
  md: [
    { i: "daily-queue", x: 0, y: 0, w: 6, h: 13, minW: 4, minH: 7 },
    { i: "habit-outcome", x: 6, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
    { i: "upcoming-tasks", x: 6, y: 7, w: 4, h: 6, minW: 3, minH: 5 },
  ],
  sm: [
    { i: "daily-queue", x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 7 },
    { i: "habit-outcome", x: 0, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
    { i: "upcoming-tasks", x: 3, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
  ],
  xs: [
    { i: "daily-queue", x: 0, y: 0, w: 4, h: 11, minW: 2, minH: 7 },
    { i: "habit-outcome", x: 0, y: 11, w: 4, h: 6, minW: 2, minH: 5 },
    { i: "upcoming-tasks", x: 0, y: 17, w: 4, h: 6, minW: 2, minH: 5 },
  ],
  xxs: [
    { i: "daily-queue", x: 0, y: 0, w: 2, h: 10, minW: 2, minH: 6 },
    { i: "habit-outcome", x: 0, y: 10, w: 2, h: 6, minW: 2, minH: 5 },
    { i: "upcoming-tasks", x: 0, y: 16, w: 2, h: 6, minW: 2, minH: 5 },
  ],
};
const HABITOS_DASHBOARD_MARGIN = [12, 12];
const HABITOS_DASHBOARD_ROW_HEIGHT = 30;
const HABITOS_DASHBOARD_RESIZE_HANDLES = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
const EMPTY_TRAINING_LIBRARY = {
  exercises: [],
  routines: [],
  assignments: [],
  muscles: [],
  regions: [],
  groups: [],
};

function normalizeDashboardGridInteger(value, fallbackValue, {
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
} = {}) {
  const numericValue = Math.round(Number(value));
  if (!Number.isInteger(numericValue)) {
    return fallbackValue;
  }

  return Math.min(max, Math.max(min, numericValue));
}

function normalizeHabitosDashboardLayoutItem(item, fallbackItem, cols) {
  const minW = normalizeDashboardGridInteger(item?.minW, fallbackItem.minW, {
    min: 1,
    max: cols,
  });
  const minH = normalizeDashboardGridInteger(item?.minH, fallbackItem.minH, {
    min: 1,
  });
  const w = normalizeDashboardGridInteger(item?.w, fallbackItem.w, {
    min: minW,
    max: cols,
  });
  const h = normalizeDashboardGridInteger(item?.h, fallbackItem.h, {
    min: minH,
  });

  return {
    i: fallbackItem.i,
    x: normalizeDashboardGridInteger(item?.x, fallbackItem.x, {
      min: 0,
      max: Math.max(0, cols - w),
    }),
    y: normalizeDashboardGridInteger(item?.y, fallbackItem.y, {
      min: 0,
    }),
    w,
    h,
    minW,
    minH,
    resizeHandles: HABITOS_DASHBOARD_RESIZE_HANDLES,
  };
}

function normalizeHabitosDashboardLayouts(source) {
  const rawLayouts = source && typeof source === "object" ? source : {};
  const normalizedLayouts = {};

  for (const breakpoint of Object.keys(HABITOS_DASHBOARD_DEFAULT_LAYOUTS)) {
    const fallbackItems = HABITOS_DASHBOARD_DEFAULT_LAYOUTS[breakpoint];
    const rawItems = Array.isArray(rawLayouts?.[breakpoint]) ? rawLayouts[breakpoint] : [];
    const rawItemsById = new Map(
      rawItems.map((entry) => [String(entry?.i || ""), entry]),
    );

    normalizedLayouts[breakpoint] = fallbackItems.map((fallbackItem) =>
      normalizeHabitosDashboardLayoutItem(
        rawItemsById.get(fallbackItem.i),
        fallbackItem,
        HABITOS_DASHBOARD_COLS[breakpoint],
      ));
  }

  return normalizedLayouts;
}

function getHabitosDashboardLayoutsSignature(layouts) {
  return JSON.stringify(normalizeHabitosDashboardLayouts(layouts));
}

function readHabitosDashboardLayouts(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return normalizeHabitosDashboardLayouts(baseSettings[LIFE_TRACKER_LEGACY_DASHBOARD_LAYOUTS_KEY]);
}

function writeHabitosDashboardLayouts(settingsValue, layouts) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return {
    ...baseSettings,
    [LIFE_TRACKER_LEGACY_DASHBOARD_LAYOUTS_KEY]: normalizeHabitosDashboardLayouts(layouts),
  };
}

function getHabitCategoryPresetId(value) {
  return `preset:${normalizeCategoryNameValue(value)}`;
}

function normalizeHabitCategoryPresetOverrideValue(value, preset) {
  const normalizedValue = value && typeof value === "object" ? value : {};

  return {
    id: getHabitCategoryPresetId(preset.value),
    presetId: getHabitCategoryPresetId(preset.value),
    kind: "preset",
    originalName: preset.value,
    name: String(normalizedValue.name || preset.value).trim() || preset.value,
    iconId: normalizedValue.iconId || preset.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
    color: normalizeHexColorDraftValue(
      normalizedValue.color,
      preset.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
    ),
    deleted: Boolean(normalizedValue.deleted),
  };
}

function readHabitCategoryPresetOverrides(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  const rawOverrides =
    baseSettings[LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]
    || baseSettings[LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY];
  const normalizedOverrides = {};

  for (const preset of HABIT_CATEGORY_PRESETS) {
    const presetId = getHabitCategoryPresetId(preset.value);
    normalizedOverrides[presetId] = normalizeHabitCategoryPresetOverrideValue(
      rawOverrides?.[presetId],
      preset,
    );
  }

  return normalizedOverrides;
}

function writeHabitCategoryPresetOverrides(settingsValue, overrides) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  const nextOverrides = {};

  for (const preset of HABIT_CATEGORY_PRESETS) {
    const presetId = getHabitCategoryPresetId(preset.value);
    const normalizedOverride = normalizeHabitCategoryPresetOverrideValue(overrides?.[presetId], preset);

    if (
      normalizedOverride.name !== preset.value
      || normalizedOverride.iconId !== preset.iconId
      || normalizedOverride.color !== preset.color
      || normalizedOverride.deleted
    ) {
      nextOverrides[presetId] = {
        name: normalizedOverride.name,
        iconId: normalizedOverride.iconId,
        color: normalizedOverride.color,
        deleted: normalizedOverride.deleted,
      };
    }
  }

  return {
    ...baseSettings,
    [LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]: nextOverrides,
  };
}

function readLifeTrackerCanvasState(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return baseSettings[LIFE_TRACKER_CANVAS_STATE_KEY] || null;
}

function writeLifeTrackerCanvasState(settingsValue, canvasState) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return {
    ...baseSettings,
    [LIFE_TRACKER_CANVAS_STATE_KEY]: canvasState,
  };
}

function hasPluginSettingsOverrides(value, defaults = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const relevantKeys = new Set([
    ...Object.keys(defaults || {}),
    ...Object.keys(value || {}),
  ]);

  for (const key of relevantKeys) {
    if (JSON.stringify(value?.[key]) !== JSON.stringify(defaults?.[key])) {
      return true;
    }
  }

  return false;
}

function createMigratedPluginSettingsApi(ctx, pluginId, {
  defaults = {},
  legacyPluginId = null,
} = {}) {
  const currentApi = ctx.createPluginSettingsApi(pluginId, defaults);
  const legacyApi = legacyPluginId ? ctx.createPluginSettingsApi(legacyPluginId, defaults) : null;

  const resolveValue = (currentValue, legacyValue) => {
    if (hasPluginSettingsOverrides(currentValue, defaults)) {
      return currentValue;
    }

    if (legacyApi && hasPluginSettingsOverrides(legacyValue, defaults)) {
      return legacyValue;
    }

    return currentValue;
  };

  return {
    stateKey: currentApi.stateKey,
    async get() {
      const [currentValue, legacyValue] = await Promise.all([
        currentApi.get(),
        legacyApi ? legacyApi.get() : Promise.resolve(null),
      ]);
      return resolveValue(currentValue, legacyValue);
    },
    async set(value) {
      return currentApi.set(value);
    },
    subscribe(listener, options) {
      return currentApi.subscribe(listener, options);
    },
    useValue() {
      const currentValue = currentApi.useValue();
      const legacyValue = legacyApi ? legacyApi.useValue() : null;
      return resolveValue(currentValue, legacyValue);
    },
  };
}

function buildEffectivePresetCategories(presetOverrides = {}) {
  return HABIT_CATEGORY_PRESETS
    .map((preset) => normalizeHabitCategoryPresetOverrideValue(
      presetOverrides[getHabitCategoryPresetId(preset.value)],
      preset,
    ))
    .filter((entry) => !entry.deleted)
    .map((entry) => ({
      id: entry.id,
      presetId: entry.presetId,
      kind: "preset",
      originalName: entry.originalName,
      name: entry.name,
      value: entry.name,
      label: entry.name,
      iconId: entry.iconId,
      color: entry.color,
    }));
}

function buildManagedHabitCategories(customCategories = [], presetOverrides = {}) {
  return [
    ...buildEffectivePresetCategories(presetOverrides),
    ...customCategories.map((entry) => ({
      ...entry,
      kind: "custom",
      value: entry.name,
      label: entry.name,
    })),
  ];
}

function todayLocalDate(baseDate = new Date()) {
  const now = baseDate;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createTaskDraft(source = null) {
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    dueDate: source?.dueDate || todayLocalDate(),
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    reminderAt: source?.reminderAt ? String(source.reminderAt).slice(0, 16) : "",
    isPersistent: source?.isPersistent ?? true,
    subitemsBlocking: source?.subitemsBlocking ?? false,
    subitems: Array.isArray(source?.subitems) && source.subitems.length
      ? source.subitems.map((entry) => ({
          id: entry.id || "",
          title: entry.title || "",
          isCompleted: Boolean(entry.isCompleted),
        }))
      : [],
  };
}

function createDraftChecklistItem(source = null) {
  return {
    id: source?.id || createDraftId("draft-item"),
    title: source?.title || "",
  };
}

function createHabitCategoryDraft(source = null) {
  return {
    id: source?.id || "",
    kind: source?.kind || "custom",
    presetId: source?.presetId || "",
    originalName: source?.originalName || source?.name || "",
    name: source?.name || "",
    iconId: source?.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
    color: source?.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
  };
}

function normalizeCategoryNameValue(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeHexColorDraftValue(value, fallbackValue = DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return fallbackValue;
  }

  const prefixedValue = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(prefixedValue)
    ? prefixedValue
    : fallbackValue;
}

function tokenizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function addDaysToLocalDate(localDate, daysToAdd) {
  const base = new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return todayLocalDate();
  }

  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate(base);
}

function compareLocalDates(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}

function clampViewDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim())
    ? String(value).trim()
    : todayLocalDate();
}

function getInclusiveDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 1;
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000) + 1;
}

function normalizeIntegerDraftValue(value, {
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  fallback = "",
} = {}) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }

  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return String(Math.min(max, Math.max(min, Math.round(numericValue))));
}

function createDraftId(prefix = "draft") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseHabitProgressConfigValue(source = null) {
  if (!source?.progressConfigJson) {
    return {};
  }

  if (typeof source.progressConfigJson === "object") {
    return source.progressConfigJson;
  }

  try {
    return JSON.parse(String(source.progressConfigJson));
  } catch {
    return {};
  }
}

function getHabitChecklistItemsValue(source = null) {
  const progressConfig = parseHabitProgressConfigValue(source);
  const itemsSource = Array.isArray(source?.checklistItems)
    ? source.checklistItems
    : progressConfig.items;

  return Array.isArray(itemsSource)
    ? itemsSource
      .map((entry, index) => {
        const title = String(entry?.title || "").trim();
        if (!title) {
          return null;
        }

        return {
          id: String(entry?.id || createDraftId("habit-item")),
          title,
          sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index,
        };
      })
      .filter(Boolean)
    : [];
}

function getHabitQuantityConfigValue(source = null) {
  const progressConfig = parseHabitProgressConfigValue(source);

  return {
    quantityMode: source?.quantityMode ?? progressConfig.quantityMode ?? "at-least",
    quantityTarget: source?.quantityTarget ?? progressConfig.quantityTarget ?? "",
    quantityUnit: source?.quantityUnit ?? progressConfig.quantityUnit ?? "",
  };
}

function createHabitDraft(source = null) {
  const startDate = source?.startDate || todayLocalDate();
  const normalizedEndDate = source?.endDate || "";
  const hasEndDate = Boolean(normalizedEndDate);
  const checklistItems = getHabitChecklistItemsValue(source);
  const quantityConfig = getHabitQuantityConfigValue(source);

  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    progressMode: source ? (source.progressMode || "yes-no") : "",
    quantityMode: quantityConfig.quantityMode,
    quantityTarget: quantityConfig.quantityTarget === null ? "" : String(quantityConfig.quantityTarget),
    quantityUnit: quantityConfig.quantityUnit || "",
    checklistItems: checklistItems.length
      ? checklistItems.map((entry) => createDraftChecklistItem(entry))
      : [
          createDraftChecklistItem(),
          createDraftChecklistItem(),
        ],
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays)
      ? source.scheduleConfigJson.weekdays
      : [1, 2, 3, 4, 5],
    startDate,
    hasEndDate,
    endDate: hasEndDate ? normalizedEndDate : "",
    durationDays: hasEndDate ? String(getInclusiveDayCount(startDate, normalizedEndDate)) : "1",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    status: source?.status || "active",
  };
}

async function invoke(channel, payload) {
  const response = await ipcRenderer.invoke(channel, payload);

  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo completar la operacion.");
  }

  return response.data;
}

function formatLocalDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(parsed);
}

function formatVisibleDateLabel(value) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
}

function resolveQueueCategoryPresentation(item, categoryCatalog = [], presetOverrides = {}) {
  if (item?.type === "routine") {
    return {
      color: "var(--habitos-accent)",
      iconId: DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
    };
  }

  const normalizedCategory = normalizeCategoryNameValue(item?.category);

  if (normalizedCategory) {
    const customCategory = categoryCatalog.find(
      (entry) => normalizeCategoryNameValue(entry?.name) === normalizedCategory,
    );

    if (customCategory) {
      return {
        color: customCategory.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
        iconId: customCategory.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
      };
    }

    const presetCategory = buildEffectivePresetCategories(presetOverrides).find(
      (entry) => normalizeCategoryNameValue(entry.value) === normalizedCategory,
    );

    if (presetCategory) {
      return {
        color: presetCategory.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
        iconId: presetCategory.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
      };
    }
  }

  return {
    color: DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
    iconId: DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
  };
}

function createEmptyHome() {
  const currentToday = todayLocalDate();
  return {
    today: currentToday,
    actualToday: currentToday,
    tasks: [],
    habits: [],
    categoryCatalog: [],
    habitOutcomeChart: {
      defaultRange: "7d",
      options: [
        { value: "7d", label: "7 dias" },
        { value: "1m", label: "1 mes" },
        { value: "1y", label: "1 ano" },
      ],
      ranges: {
        "7d": {
          value: "7d",
          label: "7 dias",
          rangeStart: currentToday,
          rangeEnd: currentToday,
          labels: [],
          datasets: [
            { id: "completed", label: "Cumplidos", values: [] },
            { id: "failed", label: "Fallidos", values: [] },
          ],
          totals: { completed: 0, failed: 0 },
        },
        "1m": {
          value: "1m",
          label: "1 mes",
          rangeStart: currentToday,
          rangeEnd: currentToday,
          labels: [],
          datasets: [
            { id: "completed", label: "Cumplidos", values: [] },
            { id: "failed", label: "Fallidos", values: [] },
          ],
          totals: { completed: 0, failed: 0 },
        },
        "1y": {
          value: "1y",
          label: "1 ano",
          rangeStart: currentToday,
          rangeEnd: currentToday,
          labels: [],
          datasets: [
            { id: "completed", label: "Cumplidos", values: [] },
            { id: "failed", label: "Fallidos", values: [] },
          ],
          totals: { completed: 0, failed: 0 },
        },
      },
    },
    dailyQueue: [],
    upcomingTasks: [],
    recentHistory: [],
    tasksSummary: {
      queueCount: 0,
      openCount: 0,
      upcomingCount: 0,
      completedTodayCount: 0,
      failedCount: 0,
    },
    habitsSummary: {
      activeCount: 0,
      pendingTodayCount: 0,
      completedTodayCount: 0,
      failedCount: 0,
    },
  };
}

function resolveChartThemeValue(name, fallbackValue) {
  if (typeof document === "undefined") {
    return fallbackValue;
  }

  const computedStyle = getComputedStyle(document.documentElement);
  const resolvedValue = computedStyle.getPropertyValue(name).trim();
  return resolvedValue || fallbackValue;
}

function DashboardEditOverlay() {
  return <div className="habitosDashboard__editOverlay" aria-hidden="true" />;
}

function DashboardPanelTitle({ title = "", description = "", editMode = false }) {
  return <PanelTitle title={title} description={description} />;
}

const FINANCE_WIDGET_CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatFinanceWidgetCurrency(cents) {
  return FINANCE_WIDGET_CURRENCY_FORMATTER.format((Number(cents) || 0) / 100);
}

function getFinanceWidgetSignedAmountCents(movement) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}

function buildFinanceWidgetSummary(snapshot) {
  const movements = Array.isArray(snapshot?.movements) ? snapshot.movements : [];
  const actualBalanceCents = movements.reduce((total, movement) => {
    return movement?.status === "posted"
      ? total + getFinanceWidgetSignedAmountCents(movement)
      : total;
  }, 0);
  const projectedBalanceCents = movements.reduce((total, movement) => {
    return total + getFinanceWidgetSignedAmountCents(movement);
  }, 0);

  return {
    actualBalanceCents,
    projectedBalanceCents,
    movementCount: movements.length,
    cashAudit: snapshot?.cashAudit || null,
    latestMovement: movements[0] || null,
  };
}

function buildTrainingWidgetSummary(snapshot) {
  const exercises = Array.isArray(snapshot?.exercises) ? snapshot.exercises : [];
  const routines = Array.isArray(snapshot?.routines) ? snapshot.routines : [];
  const assignments = Array.isArray(snapshot?.assignments) ? snapshot.assignments : [];
  const activeAssignments = assignments.filter((entry) => entry?.status === "active");

  return {
    exerciseCount: exercises.length,
    routineCount: routines.length,
    activeAssignmentCount: activeAssignments.length,
    latestExercise: exercises[0] || null,
    latestRoutine: routines[0] || null,
    latestAssignment: activeAssignments[0] || assignments[0] || null,
  };
}

function LifeTrackerWidgetValue({ eyebrow = "", value = "", tone = "default" }) {
  return (
    <div className={["lifeTrackerWidget__value", tone !== "default" ? `is-${tone}` : ""].filter(Boolean).join(" ")}>
      <span>{eyebrow}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function LifeTrackerDailyQueueWidget({ widgetContext }) {
  return widgetContext?.renderDailyQueue?.() || null;
}

export function LifeTrackerHabitOutcomeWidget({ widgetContext }) {
  return widgetContext?.renderHabitOutcome?.() || null;
}

export function LifeTrackerUpcomingTasksWidget({ widgetContext }) {
  return widgetContext?.renderUpcomingTasks?.() || null;
}

export function LifeTrackerFinanceSummaryWidget({ widgetContext }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadFinanceSummary() {
      setLoading(true);
      setError("");

      try {
        const response = await ipcRenderer.invoke(LIFE_TRACKER_FINANCE_CHANNELS.list);
        if (!response?.ok) {
          throw new Error(response?.error || "No se pudieron cargar los datos de dinero.");
        }

        if (!isCancelled) {
          setSnapshot(response.data || null);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos de dinero.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadFinanceSummary();

    return () => {
      isCancelled = true;
    };
  }, []);

  const summary = useMemo(() => buildFinanceWidgetSummary(snapshot), [snapshot]);

  return (
    <SectionPanel className="habitosDashboard__widget lifeTrackerWidget lifeTrackerWidget--finance">
      <PanelHeader
        actions={(
          <Button type="button" tone="secondary" onClick={() => widgetContext?.openSection?.("finance")}>
            Abrir dinero
          </Button>
        )}
      >
        <DashboardPanelTitle
          title="Dinero"
          description="Saldo rapido y pulso reciente del modulo financiero."
        />
      </PanelHeader>

      <div className="habitosDashboard__widgetBody lifeTrackerWidget__summaryBody">
        {loading ? (
          <StateBlock title="Cargando dinero..." />
        ) : error ? (
          <Notice tone="danger">{error}</Notice>
        ) : (
          <>
            <div className="lifeTrackerWidget__valueGrid">
              <LifeTrackerWidgetValue eyebrow="Saldo actual" value={formatFinanceWidgetCurrency(summary.actualBalanceCents)} tone="accent" />
              <LifeTrackerWidgetValue eyebrow="Proyectado" value={formatFinanceWidgetCurrency(summary.projectedBalanceCents)} />
              <LifeTrackerWidgetValue
                eyebrow="Efectivo esperado"
                value={formatFinanceWidgetCurrency(summary.cashAudit?.currentExpectedCents || 0)}
              />
            </div>
            <div className="lifeTrackerWidget__metaList">
              <span>{summary.movementCount} movimientos visibles en el tablero financiero.</span>
              <span>
                {summary.latestMovement?.title
                  ? `Ultimo: ${summary.latestMovement.title}`
                  : "Todavia no hay movimientos cargados."}
              </span>
            </div>
          </>
        )}
      </div>
    </SectionPanel>
  );
}

export function LifeTrackerTrainingSummaryWidget({ widgetContext }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadTrainingSummary() {
      setLoading(true);
      setError("");

      try {
        const response = await ipcRenderer.invoke(LIFE_TRACKER_TRAINING_CHANNELS.list);
        if (!response?.ok) {
          throw new Error(response?.error || "No se pudieron cargar los datos de entrenamiento.");
        }

        if (!isCancelled) {
          setSnapshot(response.data || null);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos de entrenamiento.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadTrainingSummary();

    return () => {
      isCancelled = true;
    };
  }, [widgetContext?.trainingRefreshToken]);

  const summary = useMemo(() => buildTrainingWidgetSummary(snapshot), [snapshot]);

  return (
    <SectionPanel className="habitosDashboard__widget lifeTrackerWidget lifeTrackerWidget--training">
      <PanelHeader
        actions={(
          <Button type="button" tone="secondary" onClick={() => widgetContext?.openSection?.("training")}>
            Abrir entrenamiento
          </Button>
        )}
      >
        <DashboardPanelTitle
          title="Entrenamiento"
          description="Ejercicios, rutinas y programadas activas dentro de Life Tracker."
        />
      </PanelHeader>

      <div className="habitosDashboard__widgetBody lifeTrackerWidget__summaryBody">
        {loading ? (
          <StateBlock title="Cargando entrenamiento..." />
        ) : error ? (
          <Notice tone="danger">{error}</Notice>
        ) : (
          <>
            <div className="lifeTrackerWidget__valueGrid">
              <LifeTrackerWidgetValue eyebrow="Ejercicios" value={String(summary.exerciseCount)} tone="accent" />
              <LifeTrackerWidgetValue eyebrow="Rutinas" value={String(summary.routineCount)} />
              <LifeTrackerWidgetValue eyebrow="Programadas activas" value={String(summary.activeAssignmentCount)} />
            </div>
            <div className="lifeTrackerWidget__metaList">
              <span>
                {summary.latestRoutine?.title
                  ? `Rutina destacada: ${summary.latestRoutine.title}`
                  : "Todavia no hay rutinas guardadas."}
              </span>
              <span>
                {summary.latestAssignment?.routine?.title
                  ? `Activa: ${summary.latestAssignment.routine.title}`
                  : summary.latestExercise?.title
                    ? `Ejercicio reciente: ${summary.latestExercise.title}`
                    : "Todavia no hay ejercicios cargados."}
              </span>
            </div>
          </>
        )}
      </div>
    </SectionPanel>
  );
}

export const LIFE_TRACKER_HOME_WIDGET_PROVIDERS = [
  {
    id: "daily-queue",
    title: "Panel del dia",
    order: 100,
    defaultSize: { w: 7, h: 14, minW: 4, minH: 7 },
    defaultPlacement: {
      lg: { x: 0, y: 0, w: 7, h: 14, minW: 4, minH: 7 },
      md: { x: 0, y: 0, w: 6, h: 14, minW: 4, minH: 7 },
      sm: { x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 7 },
      xs: { x: 0, y: 0, w: 4, h: 11, minW: 2, minH: 7 },
      xxs: { x: 0, y: 0, w: 2, h: 10, minW: 2, minH: 6 },
    },
    component: LifeTrackerDailyQueueWidget,
  },
  {
    id: "habit-outcome",
    title: "Evolucion de habitos",
    order: 200,
    defaultSize: { w: 5, h: 7, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 7, y: 0, w: 5, h: 7, minW: 3, minH: 6 },
      md: { x: 6, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
      sm: { x: 0, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 11, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 10, w: 2, h: 6, minW: 2, minH: 5 },
    },
    component: LifeTrackerHabitOutcomeWidget,
  },
  {
    id: "upcoming-tasks",
    title: "Tareas proximas",
    order: 300,
    defaultSize: { w: 5, h: 7, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 7, y: 7, w: 5, h: 7, minW: 3, minH: 5 },
      md: { x: 6, y: 7, w: 4, h: 7, minW: 3, minH: 5 },
      sm: { x: 3, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 17, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 16, w: 2, h: 6, minW: 2, minH: 5 },
    },
    component: LifeTrackerUpcomingTasksWidget,
  },
  {
    id: "finance-summary",
    title: "Dinero",
    order: 400,
    defaultSize: { w: 6, h: 6, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 0, y: 14, w: 6, h: 6, minW: 3, minH: 5 },
      md: { x: 0, y: 14, w: 5, h: 6, minW: 3, minH: 5 },
      sm: { x: 0, y: 18, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 23, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 22, w: 2, h: 6, minW: 2, minH: 5 },
    },
    component: LifeTrackerFinanceSummaryWidget,
  },
  {
    id: "training-summary",
    title: "Entrenamiento",
    order: 500,
    defaultSize: { w: 6, h: 6, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 6, y: 14, w: 6, h: 6, minW: 3, minH: 5 },
      md: { x: 5, y: 14, w: 5, h: 6, minW: 3, minH: 5 },
      sm: { x: 3, y: 18, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 29, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 28, w: 2, h: 6, minW: 2, minH: 5 },
    },
    component: LifeTrackerTrainingSummaryWidget,
  },
];

function HabitOutcomeLineChart({
  chartData,
  rangeValue = "7d",
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const labels = Array.isArray(chartData?.labels) ? chartData.labels : [];
  const datasets = Array.isArray(chartData?.datasets) ? chartData.datasets : [];
  const completedDataset = datasets.find((entry) => entry.id === "completed") || datasets[0] || null;
  const failedDataset = datasets.find((entry) => entry.id === "failed") || datasets[1] || null;
  const totals = chartData?.totals || {
    completed: 0,
    failed: 0,
  };
  const maxTicksLimit = HABIT_OUTCOME_RANGE_TICK_LIMITS[rangeValue] || 7;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const context2d = canvas.getContext("2d");
    if (!context2d) {
      return undefined;
    }

    chartRef.current?.destroy();

    const textMuted = resolveChartThemeValue("--color-text-muted", "rgba(255, 255, 255, 0.72)");
    const gridColor = resolveChartThemeValue("--color-border-default", "rgba(255, 255, 255, 0.12)");
    const completedColor = "#39c88a";
    const completedFill = "rgba(57, 200, 138, 0.16)";
    const failedColor = "#ff6b7a";
    const failedFill = "rgba(255, 107, 122, 0.12)";

    chartRef.current = new ChartJS(context2d, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: completedDataset?.label || "Cumplidos",
            data: Array.isArray(completedDataset?.values) ? completedDataset.values : [],
            borderColor: completedColor,
            backgroundColor: completedFill,
            borderWidth: 2.4,
            tension: 0.28,
            pointRadius: rangeValue === "1y" ? 0 : 2.2,
            pointHoverRadius: 0,
            pointBackgroundColor: completedColor,
            pointBorderWidth: 0,
            fill: false,
          },
          {
            label: failedDataset?.label || "Fallidos",
            data: Array.isArray(failedDataset?.values) ? failedDataset.values : [],
            borderColor: failedColor,
            backgroundColor: failedFill,
            borderWidth: 2.4,
            tension: 0.28,
            pointRadius: rangeValue === "1y" ? 0 : 2.2,
            pointHoverRadius: 0,
            pointBackgroundColor: failedColor,
            pointBorderWidth: 0,
            fill: false,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: textMuted,
              autoSkip: true,
              maxTicksLimit,
            },
          },
          y: {
            beginAtZero: true,
            border: {
              display: false,
            },
            grid: {
              color: gridColor,
              drawTicks: false,
            },
            ticks: {
              color: textMuted,
              precision: 0,
              stepSize: 1,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [completedDataset, failedDataset, labels, maxTicksLimit, rangeValue]);

  return (
    <div className="habitosView__trendChartShell">
      <div className="habitosView__trendLegend" aria-hidden="true">
        <span className="is-completed">Cumplidos</span>
        <span className="is-failed">Fallidos</span>
        <span className="habitosView__trendTotal">C {totals.completed}</span>
        <span className="habitosView__trendTotal">F {totals.failed}</span>
      </div>
      <div className="habitosView__trendCanvasWrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function HabitOutcomePanel({ chart, className = "", dashboardEditMode = false }) {
  const defaultRange = chart?.defaultRange || "7d";
  const [rangeValue, setRangeValue] = useState(defaultRange);
  const rangeOptions = Array.isArray(chart?.options) && chart.options.length
    ? chart.options
    : createEmptyHome().habitOutcomeChart.options;
  const selectedChart = chart?.ranges?.[rangeValue]
    || chart?.ranges?.[defaultRange]
    || createEmptyHome().habitOutcomeChart.ranges["7d"];

  useEffect(() => {
    if (!rangeOptions.some((option) => option.value === rangeValue)) {
      setRangeValue(defaultRange);
    }
  }, [defaultRange, rangeOptions, rangeValue]);

  return (
    <SectionPanel
      className={[
        "habitosDashboard__widget",
        "habitosView__trendPanel",
        className,
      ].filter(Boolean).join(" ")}
    >
      <PanelHeader
        actions={(
          <SegmentedControl
            className="habitosView__trendRangeControl"
            ariaLabel="Rango del grafico de habitos"
            options={rangeOptions}
            value={rangeValue}
            onChange={setRangeValue}
          />
        )}
      >
        <DashboardPanelTitle title="Evolucion de habitos" editMode={dashboardEditMode} />
      </PanelHeader>
      <div className="habitosDashboard__widgetBody habitosView__trendPanelBody">
        <HabitOutcomeLineChart chartData={selectedChart} rangeValue={rangeValue} />
      </div>
    </SectionPanel>
  );
}

function getDefaultHabitId(habits = []) {
  const activeHabit = habits.find((entry) => entry.status === "active");
  return activeHabit?.id || habits[0]?.id || "";
}

function getPriorityLabel(value) {
  return String(value || 1);
}

function formatLocalDateTime(value) {
  if (!value) {
    return "Sin registro";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function formatHabitSchedule(habit) {
  if (!habit) {
    return "Sin frecuencia";
  }

  if (habit.scheduleType === "weekdays") {
    const weekdayLabels = Array.isArray(habit.scheduleConfigJson?.weekdays)
      ? habit.scheduleConfigJson.weekdays
        .map((weekday) => WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label || null)
        .filter(Boolean)
      : [];

    return weekdayLabels.length ? `Dias fijos: ${weekdayLabels.join(", ")}` : "Dias fijos";
  }

  return "Todos los dias";
}

function getHabitStatusLabel(status) {
  return status === "active" ? "Activo" : "En pausa";
}

function getHabitProgressOption(value) {
  return HABIT_PROGRESS_OPTIONS.find((option) => option.value === value) || null;
}

function getHabitQuantityModeOption(value) {
  return HABIT_QUANTITY_MODE_OPTIONS.find((option) => option.value === value) || null;
}

function getHabitProgressLabel(habit) {
  return getHabitProgressOption(habit?.progressMode)?.label || "Con un si o un no";
}

function getHabitQuantitySummary(habit) {
  const quantityConfig = getHabitQuantityConfigValue(habit);
  const quantityModeOption = getHabitQuantityModeOption(quantityConfig.quantityMode);

  if (quantityConfig.quantityMode === "no-target") {
    return "Sin objetivo numerico diario.";
  }

  const targetLabel = quantityConfig.quantityTarget ?? "";
  const unitLabel = String(quantityConfig.quantityUnit || "").trim();
  return `${quantityModeOption?.label || "Objetivo"} ${targetLabel}${unitLabel ? ` ${unitLabel}` : ""} en el dia`;
}

function getCreationFrequencySummary(draft) {
  if (draft.scheduleType !== "weekdays") {
    return "Todos los dias";
  }

  const weekdayLabels = WEEKDAY_OPTIONS
    .filter((option) => draft.weekdays.includes(option.value))
    .map((option) => option.label);

  return weekdayLabels.length ? `Dias de la semana: ${weekdayLabels.join(", ")}` : "Sin dias elegidos";
}

function getVisibleDayContext(home) {
  return home?.today === (home?.actualToday || todayLocalDate()) ? "Hoy" : "En este dia";
}

function getHabitTodayOccurrence(home, habitId) {
  return home.dailyQueue.find(
    (entry) => entry.type === "habit" && entry.habit?.id === habitId,
  ) || null;
}

function getHabitTodaySummary(home, habit) {
  if (!habit) {
    return "Sin habito seleccionado.";
  }

  if (habit.status !== "active") {
    return "En pausa. No genera ocurrencias.";
  }

  const todayOccurrence = getHabitTodayOccurrence(home, habit.id);

  if (todayOccurrence?.isOverdue) {
    return "Tiene una ocurrencia pendiente desde antes.";
  }

  if (todayOccurrence?.status === "completed") {
    return `${getVisibleDayContext(home)} ya se marco como cumplido.`;
  }

  if (todayOccurrence?.status === "failed") {
    return `${getVisibleDayContext(home)} esta marcado como fallido.`;
  }

  if (todayOccurrence?.status === "recorded") {
    return `${getVisibleDayContext(home)} ya tiene una cantidad registrada.`;
  }

  if (todayOccurrence) {
    return home?.today === (home?.actualToday || todayLocalDate())
      ? "Tiene una ocurrencia activa para hoy."
      : "Tiene una ocurrencia activa para la fecha visible.";
  }

  return home?.today === (home?.actualToday || todayLocalDate())
    ? "Hoy no tiene ocurrencia pendiente."
    : "No tiene ocurrencia pendiente para la fecha visible.";
}

function getLatestHabitHistoryEntry(home, habitId) {
  const todayOccurrence = getHabitTodayOccurrence(home, habitId);

  if (todayOccurrence && todayOccurrence.status !== "pending") {
    return {
      status: todayOccurrence.status,
      statusLabel: todayOccurrence.statusLabel,
      timestamp: todayOccurrence.occurrence?.completedAt || todayOccurrence.occurrence?.updatedAt || null,
      summary: todayOccurrence.status === "completed"
        ? "Ocurrencia registrada como cumplida."
        : todayOccurrence.status === "recorded"
          ? "Se guardo una cantidad para ese dia."
          : "La ocurrencia de ese dia quedo marcada como fallida.",
    };
  }

  return home.recentHistory.find((entry) => entry.type === "habit" && entry.habit?.id === habitId) || null;
}

function buildHabitPayload(source = null, overrides = {}) {
  const scheduleType = overrides.scheduleType ?? source?.scheduleType ?? "daily";
  const progressConfig = parseHabitProgressConfigValue(source);
  const progressMode = overrides.progressMode ?? source?.progressMode ?? "yes-no";
  const weekdaysSource = overrides.weekdays
    ?? overrides.scheduleConfigJson?.weekdays
    ?? source?.weekdays
    ?? source?.scheduleConfigJson?.weekdays
    ?? [];
  const weekdays = Array.isArray(weekdaysSource)
    ? weekdaysSource
      .map((entry) => Number(entry))
      .filter((entry) => Number.isInteger(entry))
    : [];
  const checklistItemsSource = Array.isArray(overrides.checklistItems)
    ? overrides.checklistItems
    : Array.isArray(source?.checklistItems)
      ? source.checklistItems
      : progressConfig.items;

  return {
    id: overrides.id ?? source?.id ?? "",
    title: overrides.title ?? source?.title ?? "",
    category: overrides.category ?? source?.category ?? "",
    progressMode,
    quantityMode: overrides.quantityMode ?? source?.quantityMode ?? progressConfig.quantityMode ?? "at-least",
    quantityTarget: overrides.quantityTarget ?? source?.quantityTarget ?? progressConfig.quantityTarget ?? "",
    quantityUnit: overrides.quantityUnit ?? source?.quantityUnit ?? progressConfig.quantityUnit ?? "",
    checklistItems: Array.isArray(checklistItemsSource)
      ? checklistItemsSource.map((entry, index) => ({
          id: String(entry?.id || createDraftId("habit-item")),
          title: String(entry?.title || ""),
          sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index,
        }))
      : [],
    scheduleType,
    scheduleConfigJson: {
      weekdays: scheduleType === "weekdays" ? weekdays : [],
    },
    startDate: overrides.startDate ?? source?.startDate ?? todayLocalDate(),
    endDate: overrides.endDate ?? source?.endDate ?? "",
    time: overrides.time ?? source?.time ?? "",
    priority: normalizeIntegerDraftValue(overrides.priority ?? source?.priority ?? 1, {
      min: 1,
      max: 100,
      fallback: "1",
    }),
    notes: overrides.notes ?? source?.notes ?? "",
    status: overrides.status ?? source?.status ?? "active",
  };
}

function buildUpcomingTaskMenuItem(task) {
  return {
    id: `upcoming-task:${task.id}`,
    type: "task",
    recordId: task.id,
    title: task.title,
    raw: task,
  };
}

function shouldShowQueueStatusPill(item) {
  if (item?.type === "routine") {
    return item.completionMode === "detailed" || item.status === "failed";
  }

  return item?.type === "habit"
    && item.progressMode !== "yes-no"
    && item.status
    && item.status !== "pending";
}

function isQueueItemSettled(item) {
  return ["completed", "failed", "recorded"].includes(String(item?.status || "").trim().toLowerCase());
}

function getQueueToggleMeta(item) {
  if (item.type === "task") {
    return {
      title: item.status === "completed" ? "Reabrir" : "Completar",
      ariaLabel: item.status === "completed" ? "Reabrir tarea" : "Completar tarea",
      isPressed: item.status === "completed",
      className: item.status === "completed" ? "is-completed" : "",
      content: item.status === "completed" ? <CheckIcon /> : null,
    };
  }

  if (item.type === "routine") {
    if (item.completionMode === "detailed") {
      return null;
    }

    if (item.status === "completed") {
      return {
        title: "Quitar resultado",
        ariaLabel: "Quitar resultado de rutina",
        isPressed: true,
        className: "is-completed",
        content: <CheckIcon />,
      };
    }

    return {
      title: "Marcar hecha",
      ariaLabel: "Marcar rutina como completada",
      isPressed: false,
      className: "",
      content: null,
    };
  }

  if (item.progressMode !== "yes-no") {
    return null;
  }

  if (item.status === "completed") {
    return {
      title: "Marcar fallida",
      ariaLabel: "Marcar habito como fallido",
      isPressed: true,
      className: "is-completed",
      content: <CheckIcon />,
    };
  }

  if (item.status === "failed") {
    return {
      title: "Volver a pendiente",
      ariaLabel: "Volver habito a pendiente",
      isPressed: false,
      className: "is-failed",
      content: <span className="habitosView__queueCheckGlyph">x</span>,
    };
  }

  return {
    title: "Marcar cumplida",
    ariaLabel: "Marcar habito como cumplido",
    isPressed: false,
    className: "",
    content: null,
  };
}

function getRoutineDetailedActionLabel(item) {
  return item?.status === "completed" ? "Editar detalle" : "Registrar detalle";
}

function getOccurrenceQuantityDraftValue(item) {
  const value = item?.progressDataJson?.value;
  return Number.isInteger(Number(value)) ? String(Number(value)) : "";
}

function parseOccurrenceQuantityDraftValue(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return {
      isValid: true,
      value: null,
      serialized: "",
    };
  }

  if (!/^\d+$/.test(normalized)) {
    return {
      isValid: false,
      value: null,
      serialized: normalized,
    };
  }

  const numericValue = Number(normalized);
  return {
    isValid: Number.isInteger(numericValue) && numericValue >= 0,
    value: Number.isInteger(numericValue) && numericValue >= 0 ? numericValue : null,
    serialized: String(numericValue),
  };
}

function getChecklistProgressSummary(item) {
  const checklistItems = getHabitChecklistItemsValue(item);
  const checkedIds = new Set(
    Array.isArray(item?.progressDataJson?.checkedItemIds)
      ? item.progressDataJson.checkedItemIds
      : [],
  );

  return `${[...checkedIds].filter((entry) => checklistItems.some((itemEntry) => itemEntry.id === entry)).length}/${checklistItems.length}`;
}

function QueueStatusPill({ status, label }) {
  return (
    <span className={["habitosView__queueStatusPill", `is-${status || "pending"}`].join(" ")}>
      {label}
    </span>
  );
}

function QuantityQueueInput({
  item,
  disabled = false,
  onCommit,
}) {
  const committedValue = getOccurrenceQuantityDraftValue(item);
  const [draftValue, setDraftValue] = useState(committedValue);
  const isCommittingRef = useRef(false);
  const lastSubmittedValueRef = useRef(committedValue);

  useEffect(() => {
    setDraftValue(committedValue);
    lastSubmittedValueRef.current = committedValue;
  }, [committedValue, item.recordId]);

  const commitDraftValue = (rawValue, { resetOnInvalid = false } = {}) => {
    const parsed = parseOccurrenceQuantityDraftValue(rawValue);

    if (!parsed.isValid) {
      if (resetOnInvalid) {
        setDraftValue(committedValue);
      }
      return;
    }

    if (parsed.serialized === lastSubmittedValueRef.current || isCommittingRef.current) {
      return;
    }

    isCommittingRef.current = true;
    lastSubmittedValueRef.current = parsed.serialized;

    Promise.resolve(onCommit?.(parsed.value))
      .catch(() => {
        lastSubmittedValueRef.current = committedValue;
        setDraftValue(committedValue);
      })
      .finally(() => {
        isCommittingRef.current = false;
      });
  };

  useEffect(() => {
    const parsed = parseOccurrenceQuantityDraftValue(draftValue);

    if (!parsed.isValid || disabled || parsed.serialized === lastSubmittedValueRef.current || isCommittingRef.current) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      commitDraftValue(draftValue);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [committedValue, disabled, draftValue, onCommit]);

  return (
    <input
      className="habitosView__queueNumberInput"
      type="number"
      min="0"
      step="1"
      inputMode="numeric"
      value={draftValue}
      placeholder="0"
      disabled={disabled}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={() => commitDraftValue(draftValue, { resetOnInvalid: true })}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitDraftValue(draftValue, { resetOnInvalid: true });
        }

        if (event.key === "Escape") {
          event.preventDefault();
          setDraftValue(committedValue);
        }
      }}
    />
  );
}

function QueueItemCard({
  item,
  categoryCatalog = [],
  presetOverrides = {},
  isSelected = false,
  saving = false,
  resultEditable = true,
  onToggle,
  onContextMenu,
  onCommitQuantity,
  onToggleChecklistItem,
  onToggleChecklistExpanded,
  isChecklistExpanded = false,
}) {
  const accent = resolveQueueCategoryPresentation(item, categoryCatalog, presetOverrides);
  const toggleMeta = getQueueToggleMeta(item);
  const isSettled = isQueueItemSettled(item);
  const checklistItems = item.type === "habit" && item.progressMode === "checklist"
    ? getHabitChecklistItemsValue(item)
    : [];
  const checkedIds = new Set(
    Array.isArray(item?.progressDataJson?.checkedItemIds)
      ? item.progressDataJson.checkedItemIds
      : [],
  );
  const controlsDisabled = saving || !resultEditable;
  const routineDetailActionLabel = item.type === "routine" && item.completionMode === "detailed"
    ? getRoutineDetailedActionLabel(item)
    : "";
  const secondaryCopy = item.type === "routine"
    ? [item.meta, item.summary].filter(Boolean).join(" - ")
    : "";

  return (
    <article
      className={[
        "habitosView__queueItem",
        item.isOverdue ? "is-overdue" : "",
        isSelected ? "is-selected" : "",
        item.status ? `is-status-${item.status}` : "",
        isSettled ? "is-settled" : "",
      ].filter(Boolean).join(" ")}
      onContextMenu={(event) => onContextMenu?.(event, item)}
    >
      <div
        className="habitosView__queueBadge"
        style={{ "--habitos-item-accent": accent.color }}
        aria-hidden="true"
      >
        <RemoteCategoryIcon iconId={accent.iconId} color={accent.color} />
      </div>

      <div className="habitosView__queueCopy">
        <div className="habitosView__queueCopyText">
          <strong>{item.title}</strong>
          {secondaryCopy ? <span>{secondaryCopy}</span> : null}
        </div>
      </div>

      <div className="habitosView__queueActions">
        {item.type === "routine" && shouldShowQueueStatusPill(item) ? (
          <QueueStatusPill status={item.status} label={item.statusLabel} />
        ) : null}

        {item.type === "habit" && item.progressMode === "quantity" ? (
          <>
            {shouldShowQueueStatusPill(item) ? (
              <QueueStatusPill status={item.status} label={item.statusLabel} />
            ) : null}
            <div className="habitosView__queueQuantityControl">
              <QuantityQueueInput
                item={item}
                disabled={controlsDisabled}
                onCommit={(value) => onCommitQuantity?.(item, value)}
              />
            </div>
          </>
        ) : null}

        {item.type === "habit" && item.progressMode === "checklist" ? (
          <>
            {shouldShowQueueStatusPill(item) ? (
              <QueueStatusPill status={item.status} label={item.statusLabel} />
            ) : null}
            <button
              type="button"
              className={["habitosView__queueExpand", isChecklistExpanded ? "is-expanded" : ""].filter(Boolean).join(" ")}
              onClick={() => onToggleChecklistExpanded?.(item.recordId)}
              disabled={saving}
              aria-expanded={isChecklistExpanded ? "true" : "false"}
            >
              <ChevronRightIcon />
              <span>Sub-items {getChecklistProgressSummary(item)}</span>
            </button>
          </>
        ) : null}

        {item.type === "routine" && item.completionMode === "detailed" ? (
          <button
            type="button"
            className="habitosView__queueInlineAction"
            onClick={onToggle}
            disabled={controlsDisabled}
          >
            {routineDetailActionLabel}
          </button>
        ) : null}

        {toggleMeta ? (
          <button
            type="button"
            className={["habitosView__queueCheck", toggleMeta.className].filter(Boolean).join(" ")}
            onClick={onToggle}
            aria-label={toggleMeta.ariaLabel}
            aria-pressed={toggleMeta.isPressed ? "true" : "false"}
            disabled={controlsDisabled}
          >
            {toggleMeta.content}
          </button>
        ) : null}
      </div>

      {item.type === "habit" && item.progressMode === "checklist" ? (
        <div
          className={[
            "habitosView__queueChecklistRegion",
            isChecklistExpanded ? "is-expanded" : "",
          ].filter(Boolean).join(" ")}
          aria-hidden={isChecklistExpanded ? undefined : "true"}
        >
          <div className="habitosView__queueChecklist">
          {checklistItems.map((checklistItem) => {
            const isCompleted = checkedIds.has(checklistItem.id);

            return (
              <button
                key={checklistItem.id}
                type="button"
                className={["habitosView__queueChecklistItem", isCompleted ? "is-completed" : ""].filter(Boolean).join(" ")}
                onClick={() => onToggleChecklistItem?.(item, checklistItem.id)}
                disabled={controlsDisabled || !isChecklistExpanded}
                tabIndex={isChecklistExpanded ? 0 : -1}
              >
                <span className="habitosView__queueChecklistMark" aria-hidden="true">
                  {isCompleted ? <CheckIcon /> : null}
                </span>
                <span>{checklistItem.title}</span>
              </button>
            );
          })}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function DraftNumberInput({
  value,
  onChange,
  onCommit,
  ...inputProps
}) {
  return (
    <input
      {...inputProps}
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onCommit?.(event.target.value)}
    />
  );
}

function StepperNumberInput({
  value,
  onChange,
  onCommit,
  min,
  max,
  step = 1,
  disabled = false,
  ...inputProps
}) {
  const minValue = Number.isFinite(Number(min)) ? Number(min) : null;
  const maxValue = Number.isFinite(Number(max)) ? Number(max) : null;
  const stepValue = Number.isFinite(Number(step)) && Number(step) > 0 ? Number(step) : 1;
  const currentValue = Number(String(value ?? "").trim());
  const hasNumericValue = Number.isFinite(currentValue);

  const clampValue = (nextValue) => {
    let normalizedValue = nextValue;

    if (minValue !== null) {
      normalizedValue = Math.max(minValue, normalizedValue);
    }

    if (maxValue !== null) {
      normalizedValue = Math.min(maxValue, normalizedValue);
    }

    return Math.round(normalizedValue);
  };

  const commitValue = (rawValue) => {
    onCommit?.(rawValue);
  };

  const adjustValue = (direction) => {
    if (disabled) {
      return;
    }

    const baseValue = hasNumericValue
      ? currentValue
      : minValue ?? 0;
    const nextValue = String(clampValue(baseValue + (direction * stepValue)));

    onChange(nextValue);
    commitValue(nextValue);
  };

  const isDecrementDisabled = disabled || (hasNumericValue && minValue !== null && currentValue <= minValue);
  const isIncrementDisabled = disabled || (hasNumericValue && maxValue !== null && currentValue >= maxValue);

  return (
    <div className={["habitosView__numberStepper", disabled ? "is-disabled" : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className="habitosView__numberStepperButton"
        onClick={() => adjustValue(-1)}
        disabled={isDecrementDisabled}
        aria-label="Bajar valor"
      >
        <ChevronLeftIcon />
      </button>

      <input
        {...inputProps}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => commitValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitValue(event.currentTarget.value);
          }
        }}
      />

      <button
        type="button"
        className="habitosView__numberStepperButton"
        onClick={() => adjustValue(1)}
        disabled={isIncrementDisabled}
        aria-label="Subir valor"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

function DateDraftInput({
  value,
  onChange,
  showTodayLabel = false,
  ...inputProps
}) {
  const isTodayDefault = showTodayLabel && value === todayLocalDate();

  return (
    <div className={["habitosView__dateField", isTodayDefault ? "is-default-today" : ""].filter(Boolean).join(" ")}>
      <input
        {...inputProps}
        className="habitosView__dateFieldInput"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {isTodayDefault ? (
        <span className="habitosView__dateFieldGhost" aria-hidden="true">
          Hoy
        </span>
      ) : null}
    </div>
  );
}

function FloatingWorkbenchModal({
  isVisible,
  saving = false,
  onClose,
  layout = "centered",
  children,
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={["habitosView__modalBackdrop", layout === "drawer" ? "is-drawer" : ""].filter(Boolean).join(" ")}
      onClick={() => {
        if (!saving) {
          onClose?.();
        }
      }}
    >
      <div
        className={["habitosView__modalShell", layout === "drawer" ? "is-drawer" : ""].filter(Boolean).join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function CreateChooserModal({
  onTask,
  onHabit,
  onRoutine,
  onCancel,
}) {
  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel">
      <PanelHeader>
        <PanelTitle title="Crear nuevo" />
      </PanelHeader>

      <div className="habitosView__createChoiceGrid">
        <button type="button" className="habitosView__createChoice" onClick={onTask}>
          <strong>Tarea</strong>
          <span>Actividad de instancia unica sin seguimiento en el tiempo.</span>
        </button>

        <button type="button" className="habitosView__createChoice" onClick={onHabit}>
          <strong>Habito</strong>
          <span>Actividad que se repite en el tiempo. Posee un seguimiento detallado y estadisticas.</span>
        </button>

        <button type="button" className="habitosView__createChoice" onClick={onRoutine}>
          <strong>Rutina de ejercicios</strong>
          <span>Asigna una rutina existente con recurrencia propia y seguimiento simple o detallado.</span>
        </button>
      </div>

      <div className="habitosView__editorActions">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </SectionPanel>
  );
}

function buildHabitCategoryOptions(customCategories = [], selectedCategory = "", presetOverrides = {}) {
  const nextOptions = buildEffectivePresetCategories(presetOverrides);
  const knownNames = new Set(nextOptions.map((entry) => normalizeCategoryNameValue(entry.value)));

  for (const entry of customCategories) {
    const normalizedName = normalizeCategoryNameValue(entry?.name);
    if (!normalizedName || knownNames.has(normalizedName)) {
      continue;
    }

    nextOptions.push({
      kind: "custom",
      value: entry.name,
      label: entry.name,
      iconId: entry.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
      color: entry.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
    });
    knownNames.add(normalizedName);
  }

  const normalizedSelectedCategory = normalizeCategoryNameValue(selectedCategory);
  if (normalizedSelectedCategory && !knownNames.has(normalizedSelectedCategory)) {
    nextOptions.push({
      kind: "custom",
      value: selectedCategory,
      label: selectedCategory,
      iconId: DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
      color: DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
    });
  }

  return nextOptions;
}

function RemoteCategoryIcon({
  iconId,
  color = "#111111",
  size = "m",
}) {
  const [svgMarkup, setSvgMarkup] = useState(() => getCachedIconSvgMarkup(iconId));

  useEffect(() => {
    let isCancelled = false;

    if (!iconId) {
      setSvgMarkup(null);
      return () => {
        isCancelled = true;
      };
    }

    const cachedMarkup = getCachedIconSvgMarkup(iconId);
    if (cachedMarkup) {
      setSvgMarkup(cachedMarkup);
    } else {
      setSvgMarkup(null);
    }

    void loadIconSvgMarkup(iconId)
      .then((markup) => {
        if (!isCancelled) {
          setSvgMarkup(markup || null);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSvgMarkup(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [iconId]);

  return (
    <span
      className={["habitosView__remoteCategoryIcon", `is-${size}`].join(" ")}
      style={{ color }}
      aria-hidden="true"
    >
      {svgMarkup ? (
        <span
          className="app-icon__svg"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : null}
    </span>
  );
}

function HabitCategoryColorControl({
  value,
  disabled = false,
  onChange,
}) {
  const normalizedValue = normalizeHexColorDraftValue(value, DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR);

  return (
    <label className="habitosView__categoryColorControl">
      <input
        className="habitosView__categoryColorInput"
        type="color"
        value={normalizedValue}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Elegir color de categoria"
      />
      <input
        className="habitosView__categoryColorText"
        type="text"
        value={normalizedValue.toUpperCase()}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Color hexadecimal de categoria"
      />
    </label>
  );
}

function CategoryOptionCard({
  title,
  iconId,
  color,
  isSelected = false,
  isCreate = false,
  onContextMenu,
  onClick,
}) {
  return (
    <button
      type="button"
      className={[
        "habitosView__categoryOptionCard",
        isSelected ? "is-selected" : "",
        isCreate ? "is-create" : "",
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <strong>{title}</strong>
      <span
        className="habitosView__categoryOptionIcon"
        style={isCreate ? undefined : { background: color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR }}
        aria-hidden="true"
      >
        <RemoteCategoryIcon iconId={iconId} size="xl" />
      </span>
    </button>
  );
}

function CustomHabitCategoryBuilder({
  draft,
  saving,
  error = "",
  onChange,
  onCancel,
  onSave,
}) {
  const [catalogIcons, setCatalogIcons] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [visibleIconCount, setVisibleIconCount] = useState(48);

  useEffect(() => {
    let isActive = true;

    setCatalogLoading(true);
    setCatalogError("");

    void loadUnifiedIconCatalog()
      .then((payload) => {
        if (!isActive) {
          return;
        }

        setCatalogIcons(Array.isArray(payload?.icons) ? payload.icons : []);
        setCatalogLoading(false);
      })
      .catch((loadError) => {
        if (!isActive) {
          return;
        }

        setCatalogIcons([]);
        setCatalogError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catalogo de iconos.");
        setCatalogLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setVisibleIconCount(48);
  }, [iconSearchQuery]);

  const searchTokens = tokenizeSearch(iconSearchQuery);
  const filteredIcons = catalogIcons.filter((option) => (
    searchTokens.length === 0
      ? true
      : searchTokens.every((token) => String(option?.searchText || "").includes(token))
  ));
  const visibleIcons = filteredIcons.slice(0, visibleIconCount);
  const showIconLabels = searchTokens.length > 0;
  const selectedColor = normalizeHexColorDraftValue(draft.color, DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR);

  const handleCatalogScroll = (event) => {
    const node = event.currentTarget;
    const remainingScroll = node.scrollHeight - node.scrollTop - node.clientHeight;

    if (remainingScroll > 120 || visibleIconCount >= filteredIcons.length) {
      return;
    }

    setVisibleIconCount((currentValue) => Math.min(currentValue + 48, filteredIcons.length));
  };

  return (
    <div className="habitosView__categoryBuilderPanel">
      <div className="habitosView__categoryBuilderPreview">
        <span
          className="habitosView__categoryBuilderPreviewIcon"
          style={{ background: selectedColor }}
          aria-hidden="true"
        >
          <RemoteCategoryIcon iconId={draft.iconId} size="l" />
        </span>
        <div className="habitosView__categoryBuilderPreviewCopy">
          <strong>{String(draft.name || "").trim() || "Nueva categoria"}</strong>
          <span>{draft.iconId.replace(/^[^:]+:/, "")}</span>
        </div>
      </div>

      <FieldGrid>
        <Field label="Nombre" wide>
          <input
            value={draft.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Nombre de la categoria"
            maxLength="60"
          />
        </Field>
      </FieldGrid>

      <div className="habitosView__categoryBuilderTools">
        <HabitCategoryColorControl
          value={selectedColor}
          disabled={saving}
          onChange={(value) => onChange("color", value)}
        />

        <label className="habitosView__categoryIconSearch">
          <input
            type="text"
            value={iconSearchQuery}
            onChange={(event) => setIconSearchQuery(event.target.value)}
            placeholder="Buscar icono"
            disabled={saving}
          />
        </label>
      </div>

      <div className="habitosView__categoryIconMeta">
        <span>
          {catalogLoading
            ? "Cargando iconos..."
            : catalogError
              ? catalogError
              : `${filteredIcons.length.toLocaleString("es-AR")} iconos`}
        </span>
      </div>

      <div className="habitosView__categoryIconViewport" onScroll={handleCatalogScroll}>
        <div
          className={[
            "habitosView__categoryIconGrid",
            showIconLabels ? "is-searching" : "",
          ].filter(Boolean).join(" ")}
        >
          {visibleIcons.map((option) => (
            <button
              key={option.id}
              type="button"
              className={[
                "habitosView__categoryIconOption",
                draft.iconId === option.id ? "is-selected" : "",
                showIconLabels ? "has-label" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => onChange("iconId", option.id)}
              disabled={saving}
              aria-label={option.label || option.name}
            >
              <RemoteCategoryIcon
                iconId={option.id}
                color="var(--color-text)"
                size={showIconLabels ? "xl" : "l"}
              />
              {showIconLabels ? (
                <span className="habitosView__categoryIconOptionLabel">
                  {option.label || option.name || option.id.replace(/^[^:]+:/, "")}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <Notice tone="danger">
          {error}
        </Notice>
      ) : null}

      <div className="habitosView__editorActions">
        <Button
          type="button"
          tone="primary"
          onClick={onSave}
          disabled={saving || !String(draft.name || "").trim()}
        >
          {saving ? "Guardando..." : "Crear categoria"}
        </Button>
        <Button type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function HabitCategoryPicker({
  categories = [],
  presetOverrides = {},
  selectedCategory = "",
  saving = false,
  builderOpen = false,
  builderDraft,
  builderError = "",
  onSelectCategory,
  onOpenBuilder,
  onCloseBuilder,
  onChangeCategoryBuilder,
  onSaveBuilder,
  onOpenCategoryMenu,
}) {
  const categoryOptions = buildHabitCategoryOptions(categories, selectedCategory, presetOverrides);

  return (
    <div className="habitosView__wizardStep">
      <div className="habitosView__sectionIntro">
        <strong>Categoria</strong>
        <span>Elige una categoria o crea una propia sin salir del wizard.</span>
      </div>

      <div className="habitosView__categoryOptionGrid">
        {categoryOptions.map((option) => (
          <CategoryOptionCard
            key={option.value}
            title={option.label}
            iconId={option.iconId}
            color={option.color}
            isSelected={selectedCategory === option.value}
            onClick={() => onSelectCategory(option.value)}
            onContextMenu={option.kind === "custom"
              ? (event) => onOpenCategoryMenu?.(event, option)
              : undefined}
          />
        ))}

        <CategoryOptionCard
          title="Crear categoria"
          iconId="mui:Add"
          isCreate
          isSelected={builderOpen}
          onClick={() => (builderOpen ? onCloseBuilder?.() : onOpenBuilder?.())}
        />
      </div>

      {builderOpen ? (
        <CustomHabitCategoryBuilder
          draft={builderDraft}
          saving={saving}
          error={builderError}
          onChange={onChangeCategoryBuilder}
          onCancel={onCloseBuilder}
          onSave={onSaveBuilder}
        />
      ) : null}
    </div>
  );
}

function WizardOptionCard({
  title,
  description,
  isSelected = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={[
        "habitosView__wizardOptionCard",
        isSelected ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      <strong>{title}</strong>
      <span>{description}</span>
      {disabled ? (
        <small>Sin soporte por ahora</small>
      ) : null}
    </button>
  );
}

function SecondaryListCard({
  className = "",
  title,
  items,
  renderItem,
  emptyTitle = "Sin elementos.",
  dashboardEditMode = false,
}) {
  return (
    <SectionPanel
      className={[
        "habitosDashboard__widget",
        "habitosView__secondaryPanel",
        className,
      ].filter(Boolean).join(" ")}
    >
      <PanelHeader>
        <DashboardPanelTitle title={title} editMode={dashboardEditMode} />
      </PanelHeader>

      <div className="habitosDashboard__widgetBody habitosView__secondaryPanelBody">
        {items.length ? (
          <div className="habitosView__secondaryList">
            {items.map(renderItem)}
          </div>
        ) : (
          <StateBlock title={emptyTitle} />
        )}
      </div>
    </SectionPanel>
  );
}

function HabitListItem({
  habit,
  categoryCatalog = [],
  presetOverrides = {},
  isSelected = false,
  onSelect,
}) {
  const accent = resolveQueueCategoryPresentation({
    type: "habit",
    title: habit.title,
    category: habit.category,
  }, categoryCatalog, presetOverrides);
  const summaryParts = [];

  if (habit.category) {
    summaryParts.push(habit.category);
  }

  summaryParts.push(formatHabitSchedule(habit));

  return (
    <button
      type="button"
      className={[
        "habitosView__habitRow",
        isSelected ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      onClick={onSelect}
    >
      <div
        className="habitosView__habitRowBadge"
        style={{ "--habitos-item-accent": accent.color }}
        aria-hidden="true"
      >
        <RemoteCategoryIcon iconId={accent.iconId} color={accent.color} />
      </div>

      <div className="habitosView__habitRowCopy">
        <strong>{habit.title}</strong>
        <span>{summaryParts.join(" - ")}</span>
      </div>

      <span className={["habitosView__habitStatus", habit.status !== "active" ? "is-paused" : ""].filter(Boolean).join(" ")}>
        {getHabitStatusLabel(habit.status)}
      </span>
    </button>
  );
}

function HabitsGroup({
  title,
  habits,
  categoryCatalog = [],
  presetOverrides = {},
  selectedHabitId,
  onSelectHabit,
  emptyTitle,
}) {
  return (
    <div className="habitosView__habitGroup">
      <div className="habitosView__habitGroupHeader">
        <strong>{title}</strong>
        <span>{habits.length}</span>
      </div>

      {habits.length ? (
        <div className="habitosView__habitGroupList">
          {habits.map((habit) => (
            <HabitListItem
              key={habit.id}
              habit={habit}
              categoryCatalog={categoryCatalog}
              presetOverrides={presetOverrides}
              isSelected={habit.id === selectedHabitId}
              onSelect={() => onSelectHabit(habit.id)}
            />
          ))}
        </div>
      ) : (
        <StateBlock title={emptyTitle} />
      )}
    </div>
  );
}

function HabitDetailsPanel({
  habit,
  home,
  presetOverrides = {},
  saving,
  onEdit,
  onToggleStatus,
}) {
  const latestHistoryEntry = getLatestHabitHistoryEntry(home, habit.id);
  const todaySummary = getHabitTodaySummary(home, habit);
  const progressOption = getHabitProgressOption(habit.progressMode);
  const checklistItems = getHabitChecklistItemsValue(habit);
  const accent = resolveQueueCategoryPresentation({
    type: "habit",
    title: habit.title,
    category: habit.category,
  }, home?.categoryCatalog || [], presetOverrides);
  const detailItems = [
    { label: "Estado", value: getHabitStatusLabel(habit.status) },
    { label: "Frecuencia", value: formatHabitSchedule(habit) },
    { label: "Inicio", value: formatLocalDate(habit.startDate) },
    { label: "Fin", value: habit.endDate ? formatLocalDate(habit.endDate) : "Sin cierre" },
    { label: "Hora", value: habit.time || "Sin hora" },
    { label: "Prioridad", value: getPriorityLabel(habit.priority) },
  ];

  if (habit.category) {
    detailItems.unshift({
      label: "Categoria",
      value: habit.category,
    });
  }

  return (
    <ScrollRegion className="habitosView__habitDetailScroll">
      <PanelStack>
        <SectionPanel tone="highlight">
          <PanelHeader
            actions={(
              <div className="habitosView__habitDetailActions">
                <Button
                  type="button"
                  tone={habit.status === "active" ? "secondary" : "primary"}
                  onClick={onToggleStatus}
                  disabled={saving}
                >
                  {habit.status === "active" ? "Pausar habito" : "Reactivar habito"}
                </Button>
                <Button type="button" onClick={onEdit} disabled={saving}>
                  <PencilIcon />
                  <span>Editar</span>
                </Button>
              </div>
            )}
          >
            <PanelTitle
              eyebrow="Habito"
              title={habit.title}
              description={formatHabitSchedule(habit)}
            />
          </PanelHeader>

          <div className="habitosView__habitDetailHero">
            <div
              className="habitosView__habitDetailHeroBadge"
              style={{ "--habitos-item-accent": accent.color }}
              aria-hidden="true"
            >
              <RemoteCategoryIcon iconId={accent.iconId} color={accent.color} size="xxl" />
            </div>

            <div className="habitosView__detailMetaList">
              {detailItems.map((item) => (
                <div key={item.label} className="habitosView__detailMetaRow">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </SectionPanel>

        <SectionPanel tone="soft">
          <PanelHeader>
            <PanelTitle title="Evaluacion" />
          </PanelHeader>

          <div className="habitosView__detailMetaList habitosView__detailMetaList--section">
            <div className="habitosView__detailMetaRow">
              <span>Tipo</span>
              <div className="habitosView__detailMetaContent">
                <strong>{getHabitProgressLabel(habit)}</strong>
                {progressOption?.description ? (
                  <small>{progressOption.description}</small>
                ) : null}
              </div>
            </div>

            {habit.progressMode === "quantity" ? (
              <div className="habitosView__detailMetaRow">
                <span>Objetivo</span>
                <strong>{getHabitQuantitySummary(habit)}</strong>
              </div>
            ) : null}

            {habit.progressMode === "checklist" ? (
              <div className="habitosView__detailMetaRow is-stack">
                <span>Sub-items</span>
                <div className="habitosView__detailMetaContent">
                  {checklistItems.length ? (
                    <ul className="habitosView__detailCompactList">
                      {checklistItems.map((item) => (
                        <li key={item.id}>{item.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <small>Sin sub-items definidos.</small>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </SectionPanel>

        <SectionPanel tone="soft">
          <PanelHeader>
            <PanelTitle title="Actividad" />
          </PanelHeader>

          <div className="habitosView__detailMetaList habitosView__detailMetaList--section">
            <div className="habitosView__detailMetaRow">
              <span>Dia visible</span>
              <strong>{todaySummary}</strong>
            </div>

            <div className="habitosView__detailMetaRow">
              <span>Ultimo registro</span>
              <div className="habitosView__detailMetaContent">
                <strong>{latestHistoryEntry ? latestHistoryEntry.statusLabel : "Sin actividad reciente"}</strong>
                {latestHistoryEntry ? (
                  <small>
                    {formatLocalDateTime(latestHistoryEntry.timestamp)}
                    {" - "}
                    {latestHistoryEntry.summary}
                  </small>
                ) : null}
              </div>
            </div>
          </div>
        </SectionPanel>

        {habit.notes ? (
          <SectionPanel>
            <PanelHeader>
              <PanelTitle title="Notas" />
            </PanelHeader>

            <p className="habitosView__habitNotes">{habit.notes}</p>
          </SectionPanel>
        ) : null}
      </PanelStack>
    </ScrollRegion>
  );
}

function HabitsSettingsSection({
  habits,
  selectedHabitId,
  home,
  presetOverrides = {},
  saving,
  onCreateHabit,
  onSelectHabit,
  onEditHabit,
  onToggleHabitStatus,
}) {
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const pausedHabits = habits.filter((habit) => habit.status !== "active");
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) || null;

  return (
    <SplitLayout variant="sidebar-detail" className="habitosView__habitSplit">
      <SplitSidebar className="habitosView__habitSidebar">
        <div className="habitosView__settingsSectionHeader">
          <div className="habitosView__settingsSectionCopy">
            <strong>Habitos</strong>
            <span>Activos y en pausa</span>
          </div>
          <Button type="button" tone="primary" onClick={onCreateHabit} disabled={saving}>
            Nuevo habito
          </Button>
        </div>

        <ScrollRegion className="habitosView__habitSidebarScroll">
          {habits.length ? (
            <PanelStack className="habitosView__habitSidebarStack">
              <HabitsGroup
                title="Activos"
                habits={activeHabits}
                categoryCatalog={home.categoryCatalog}
                presetOverrides={presetOverrides}
                selectedHabitId={selectedHabitId}
                onSelectHabit={onSelectHabit}
                emptyTitle="Sin habitos activos."
              />

              <HabitsGroup
                title="En pausa"
                habits={pausedHabits}
                categoryCatalog={home.categoryCatalog}
                presetOverrides={presetOverrides}
                selectedHabitId={selectedHabitId}
                onSelectHabit={onSelectHabit}
                emptyTitle="Sin habitos en pausa."
              />
            </PanelStack>
          ) : (
            <StateBlock
              title="Todavia no hay habitos."
              description="Crea uno nuevo para administrarlo desde aqui."
            >
              <Button type="button" tone="primary" onClick={onCreateHabit} disabled={saving}>
                Crear habito
              </Button>
            </StateBlock>
          )}
        </ScrollRegion>
      </SplitSidebar>

      <SplitDetail className="habitosView__habitDetail">
        {selectedHabit ? (
          <HabitDetailsPanel
            habit={selectedHabit}
            home={home}
            presetOverrides={presetOverrides}
            saving={saving}
            onEdit={() => onEditHabit(selectedHabit)}
            onToggleStatus={() => onToggleHabitStatus(selectedHabit)}
          />
        ) : (
          <StateBlock
            title={habits.length ? "Selecciona un habito." : "Sin detalles por mostrar."}
            description={habits.length ? "Elige un habito de la lista para ver su operativa." : ""}
          />
        )}
      </SplitDetail>
    </SplitLayout>
  );
}

function CategorySettingsListItem({
  category,
  isSelected = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={["habitosView__categorySettingRow", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
      onClick={onSelect}
    >
      <div className="habitosView__categorySettingRowCopy">
        <strong>{category.name}</strong>
      </div>
      <span
        className="habitosView__categorySettingRowBadge"
        style={{ background: category.color }}
        aria-hidden="true"
      >
        <RemoteCategoryIcon iconId={category.iconId} size="l" />
      </span>
    </button>
  );
}

function CategorySettingsSection({
  categories,
  selectedCategoryId,
  selectedCategory,
  builderOpen,
  builderDraft,
  builderError,
  saving,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onChangeCategoryBuilder,
  onSaveCategoryBuilder,
  onCloseCategoryBuilder,
}) {
  return (
    <SplitLayout variant="sidebar-detail" className="habitosView__habitSplit">
      <SplitSidebar className="habitosView__habitSidebar">
        <div className="habitosView__settingsSectionHeader">
          <div className="habitosView__settingsSectionCopy">
            <strong>Categorias</strong>
            <span>Color e icono</span>
          </div>
          <Button type="button" tone="primary" onClick={onCreateCategory} disabled={saving}>
            Nueva categoria
          </Button>
        </div>

        <ScrollRegion className="habitosView__habitSidebarScroll">
          {categories.length ? (
            <div className="habitosView__categorySettingsList">
              {categories.map((category) => (
                <CategorySettingsListItem
                  key={category.id}
                  category={category}
                  isSelected={selectedCategoryId === category.id}
                  onSelect={() => onSelectCategory(category.id)}
                />
              ))}
            </div>
          ) : (
            <StateBlock
              title="Sin categorias."
              description="Crea una categoria para reutilizarla en tus habitos."
            >
              <Button type="button" tone="primary" onClick={onCreateCategory} disabled={saving}>
                Crear categoria
              </Button>
            </StateBlock>
          )}
        </ScrollRegion>
      </SplitSidebar>

      <SplitDetail className="habitosView__habitDetail">
        {builderOpen ? (
          <PanelStack>
            <SectionPanel tone="highlight">
              <PanelHeader>
                <PanelTitle
                  title={builderDraft?.id ? "Editar categoria" : "Nueva categoria"}
                />
              </PanelHeader>

              <CustomHabitCategoryBuilder
                draft={builderDraft}
                saving={saving}
                error={builderError}
                onChange={onChangeCategoryBuilder}
                onCancel={onCloseCategoryBuilder}
                onSave={onSaveCategoryBuilder}
              />
            </SectionPanel>
          </PanelStack>
        ) : selectedCategory ? (
          <PanelStack>
            <SectionPanel tone="highlight">
              <PanelHeader
                actions={(
                  <div className="habitosView__habitDetailActions">
                    <Button type="button" onClick={() => onEditCategory(selectedCategory)} disabled={saving}>
                      <PencilIcon />
                      <span>Editar</span>
                    </Button>
                    <Button type="button" tone="danger" onClick={() => onDeleteCategory(selectedCategory)} disabled={saving}>
                      <TrashIcon />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                )}
              >
                <PanelTitle
                  title={selectedCategory.name}
                  description={selectedCategory.kind === "preset" ? "Categoria base" : "Categoria personalizada"}
                />
              </PanelHeader>

              <div className="habitosView__categoryDetailHero">
                <span
                  className="habitosView__categoryDetailHeroIcon"
                  style={{ background: selectedCategory.color }}
                  aria-hidden="true"
                >
                  <RemoteCategoryIcon iconId={selectedCategory.iconId} size="xxl" />
                </span>

                <div className="habitosView__categoryMetaList">
                  <div className="habitosView__categoryMetaRow">
                    <span>Nombre</span>
                    <strong>{selectedCategory.name}</strong>
                  </div>
                  <div className="habitosView__categoryMetaRow">
                    <span>Color</span>
                    <strong>{selectedCategory.color.toUpperCase()}</strong>
                  </div>
                  <div className="habitosView__categoryMetaRow">
                    <span>Icono</span>
                    <strong>{selectedCategory.iconId.replace(/^[^:]+:/, "")}</strong>
                  </div>
                </div>
              </div>
            </SectionPanel>
          </PanelStack>
        ) : (
          <StateBlock
            title={categories.length ? "Selecciona una categoria." : "Sin detalles por mostrar."}
            description={categories.length ? "Elige una categoria para editarla o eliminarla." : ""}
          />
        )}
      </SplitDetail>
    </SplitLayout>
  );
}

function SettingsDrawer({
  activeTab,
  habits,
  selectedHabitId,
  home,
  presetOverrides = {},
  saving,
  onClose,
  onChangeTab,
  onCreateHabit,
  onSelectHabit,
  onEditHabit,
  onToggleHabitStatus,
  categories,
  selectedCategoryId,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  categoryBuilderOpen,
  categoryBuilderDraft,
  categoryBuilderError,
  onChangeCategoryBuilder,
  onSaveCategoryBuilder,
  onCloseCategoryBuilder,
}) {
  const tabOptions = [
    { id: "habits", label: "Habitos" },
    { id: "categories", label: "Categorias" },
  ];

  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel habitosView__drawerPanel">
      <PanelHeader
        actions={(
          <div className="habitosView__drawerHeaderActions">
            <Button type="button" onClick={onClose} disabled={saving}>
              Cerrar
            </Button>
          </div>
        )}
      >
        <PanelTitle title="Configuraciones" />
      </PanelHeader>

      <div className="habitosView__drawerBody">
        <SplitLayout variant="sidebar-detail" className="habitosView__settingsSplit">
          <SplitSidebar className="habitosView__settingsSidebar">
            <div className="habitosView__settingsTabs">
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={["habitosView__settingsTab", activeTab === tab.id ? "is-active" : ""].filter(Boolean).join(" ")}
                  onClick={() => onChangeTab(tab.id)}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </SplitSidebar>

          <SplitDetail className="habitosView__settingsDetail">
            {activeTab === "habits" ? (
              <HabitsSettingsSection
                habits={habits}
                selectedHabitId={selectedHabitId}
                home={home}
                presetOverrides={presetOverrides}
                saving={saving}
                onCreateHabit={onCreateHabit}
                onSelectHabit={onSelectHabit}
                onEditHabit={onEditHabit}
                onToggleHabitStatus={onToggleHabitStatus}
              />
            ) : (
              <CategorySettingsSection
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                selectedCategory={selectedCategory}
                builderOpen={categoryBuilderOpen}
                builderDraft={categoryBuilderDraft}
                builderError={categoryBuilderError}
                saving={saving}
                onSelectCategory={onSelectCategory}
                onCreateCategory={onCreateCategory}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                onChangeCategoryBuilder={onChangeCategoryBuilder}
                onSaveCategoryBuilder={onSaveCategoryBuilder}
                onCloseCategoryBuilder={onCloseCategoryBuilder}
              />
            )}
          </SplitDetail>
        </SplitLayout>
      </div>
    </SectionPanel>
  );
}

function TaskEditor({
  draft,
  advancedOpen,
  saving,
  onChange,
  onSubitemChange,
  onAddSubitem,
  onRemoveSubitem,
  onToggleAdvanced,
  onCommitNumber,
  onSubmit,
  onCancel,
}) {
  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel">
      <PanelHeader
        actions={(
          <Button type="button" onClick={onToggleAdvanced}>
            {advancedOpen ? "Ocultar avanzado" : "Mostrar avanzado"}
          </Button>
        )}
      >
        <PanelTitle title={draft.id ? "Editar tarea" : "Nueva tarea"} />
      </PanelHeader>

      <form className="habitosView__editorForm" onSubmit={onSubmit}>
        <FieldGrid>
          <Field label="Nombre" wide>
            <input
              value={draft.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Ej. Llamar al tecnico"
              required
            />
          </Field>

          <Field label="Categoria">
            <input
              value={draft.category}
              onChange={(event) => onChange("category", event.target.value)}
              placeholder="Trabajo, hogar, estudio..."
            />
          </Field>

          <Field label="Fecha">
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => onChange("dueDate", event.target.value)}
              required
            />
          </Field>

          <Field label="Prioridad">
            <StepperNumberInput
              min="1"
              max="100"
              step="1"
              value={draft.priority}
              onChange={(value) => onChange("priority", value)}
              onCommit={(value) => onCommitNumber("priority", value)}
            />
          </Field>
        </FieldGrid>

        <div className="habitosView__subitemEditor">
          <div className="habitosView__sectionIntro">
            <strong>Sub-items</strong>
          </div>

          {draft.subitems.length ? (
            <div className="habitosView__subitemsDraft">
              {draft.subitems.map((subitem, index) => (
                <div key={subitem.id || index} className="habitosView__subitemDraftRow">
                  <label className="habitosView__subitemToggle">
                    <input
                      type="checkbox"
                      checked={Boolean(subitem.isCompleted)}
                      onChange={(event) => onSubitemChange(index, "isCompleted", event.target.checked)}
                    />
                    <span>Hecho</span>
                  </label>
                  <input
                    value={subitem.title}
                    onChange={(event) => onSubitemChange(index, "title", event.target.value)}
                    placeholder={`Paso ${index + 1}`}
                  />
                  <IconButton
                    type="button"
                    aria-label="Quitar sub-item"
                    tone="danger"
                    onClick={() => onRemoveSubitem(index)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          ) : null}

          <Button type="button" onClick={onAddSubitem}>
            <PlusIcon />
            <span>Agregar sub-item</span>
          </Button>
        </div>

        {advancedOpen ? (
          <FieldGrid>
            <Field label="Hora">
              <input
                type="time"
                value={draft.time}
                onChange={(event) => onChange("time", event.target.value)}
              />
            </Field>

            <Field label="Recordatorio">
              <input
                type="datetime-local"
                value={draft.reminderAt}
                onChange={(event) => onChange("reminderAt", event.target.value)}
              />
            </Field>

            <Field label="Notas" wide>
              <textarea
                rows="3"
                value={draft.notes}
                onChange={(event) => onChange("notes", event.target.value)}
                placeholder="Contexto breve para esta tarea."
              />
            </Field>

            <div className="habitosView__booleanGrid">
              <label className="habitosView__booleanField">
                <input
                  type="checkbox"
                  checked={Boolean(draft.isPersistent)}
                  onChange={(event) => onChange("isPersistent", event.target.checked)}
                />
                <span>Se mostrara todos los dias hasta completarse</span>
              </label>

              <label className="habitosView__booleanField">
                <input
                  type="checkbox"
                  checked={Boolean(draft.subitemsBlocking)}
                  onChange={(event) => onChange("subitemsBlocking", event.target.checked)}
                />
                <span>Los sub-items bloquean el completado</span>
              </label>
            </div>
          </FieldGrid>
        ) : null}

        <div className="habitosView__editorActions">
          <Button type="submit" tone="primary" disabled={saving}>
            {saving ? "Guardando..." : draft.id ? "Guardar tarea" : "Crear tarea"}
          </Button>
          <Button type="button" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </SectionPanel>
  );
}

function HabitEditor({
  draft,
  categories,
  presetOverrides = {},
  step,
  saving,
  wizardError,
  categoryBuilderOpen,
  categoryBuilderDraft,
  categoryBuilderError,
  onChange,
  onSelectExistingCategory,
  onOpenCategoryBuilder,
  onCloseCategoryBuilder,
  onChangeCategoryBuilder,
  onSaveCategoryBuilder,
  onOpenCategoryMenu,
  onSelectCategory,
  onSelectProgressMode,
  onToggleWeekday,
  onBack,
  onNext,
  onCommitNumber,
  onSubmit,
  onCancel,
}) {
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState(null);
  const [dropChecklistIndex, setDropChecklistIndex] = useState(null);
  const checklistDragIntentRef = useRef(null);

  useEffect(() => {
    checklistDragIntentRef.current = null;
    setDraggedChecklistIndex(null);
    setDropChecklistIndex(null);
  }, [draft.id, draft.progressMode, step]);

  const resetChecklistDragState = () => {
    checklistDragIntentRef.current = null;
    setDraggedChecklistIndex(null);
    setDropChecklistIndex(null);
  };

  const handleChecklistDrop = (targetIndex) => {
    if (draggedChecklistIndex === null || draggedChecklistIndex === targetIndex) {
      resetChecklistDragState();
      return;
    }

    onChange("moveChecklistItem", {
      fromIndex: draggedChecklistIndex,
      toIndex: targetIndex,
    });
    resetChecklistDragState();
  };

  if (draft.id) {
    const isLastStep = step === HABIT_EDIT_WIZARD_STEPS.length - 1;

    return (
      <SectionPanel tone="highlight" className="habitosView__modalPanel">
        <PanelHeader>
          <PanelTitle title="Editar habito" />
        </PanelHeader>

        <form className="habitosView__editorForm" onSubmit={onSubmit}>
          <div className="habitosView__modalStep">
            <span>Paso {step + 1} de {HABIT_EDIT_WIZARD_STEPS.length}</span>
            <strong>{HABIT_EDIT_WIZARD_STEPS[step]?.label || "Paso"}</strong>
          </div>

          {step === 0 ? (
            <div className="habitosView__wizardStep">
              <FieldGrid>
                <Field label="Nombre" wide>
                  <input
                    value={draft.title}
                    onChange={(event) => onChange("title", event.target.value)}
                    placeholder="Ej. Leer 20 minutos"
                    required
                  />
                </Field>
              </FieldGrid>

              <HabitCategoryPicker
                categories={categories}
                presetOverrides={presetOverrides}
                selectedCategory={draft.category}
                saving={saving}
                builderOpen={categoryBuilderOpen}
                builderDraft={categoryBuilderDraft}
                builderError={categoryBuilderError}
                onSelectCategory={onSelectExistingCategory}
                onOpenBuilder={onOpenCategoryBuilder}
                onCloseBuilder={onCloseCategoryBuilder}
                onChangeCategoryBuilder={onChangeCategoryBuilder}
                onSaveCategoryBuilder={onSaveCategoryBuilder}
                onOpenCategoryMenu={onOpenCategoryMenu}
              />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="habitosView__wizardStep">
              <Field label="Frecuencia">
                <select
                  value={draft.scheduleType}
                  onChange={(event) => onChange("scheduleType", event.target.value)}
                >
                  <option value="daily">Todos los dias</option>
                  <option value="weekdays">Dias de la semana</option>
                </select>
              </Field>

              {draft.scheduleType === "weekdays" ? (
                <div className="habitosView__weekdayGrid">
                  {WEEKDAY_OPTIONS.map((option) => {
                    const active = draft.weekdays.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" ")}
                        onClick={() => onToggleWeekday(option.value)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Notice tone="info">
                  Se genera una ocurrencia por dia.
                </Notice>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <FieldGrid>
              <Field label="Inicio">
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(event) => onChange("startDate", event.target.value)}
                  required
                />
              </Field>

              <Field label="Fin opcional">
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(event) => onChange("endDate", event.target.value)}
                />
              </Field>

              <Field label="Hora">
                <input
                  type="time"
                  value={draft.time}
                  onChange={(event) => onChange("time", event.target.value)}
                />
              </Field>

              <Field label="Prioridad">
                <StepperNumberInput
                  min="1"
                  max="100"
                  step="1"
                  value={draft.priority}
                  onChange={(value) => onChange("priority", value)}
                  onCommit={(value) => onCommitNumber("priority", value)}
                />
              </Field>

              <Field label="Notas" wide>
                <textarea
                  rows="3"
                  value={draft.notes}
                  onChange={(event) => onChange("notes", event.target.value)}
                  placeholder="Criterio simple de uso diario."
                />
              </Field>
            </FieldGrid>
          ) : null}

          <div className="habitosView__editorActions">
            <div className="habitosView__editorNav">
              <Button type="button" onClick={onBack} disabled={step === 0 || saving}>
                <ChevronLeftIcon />
                <span>Atras</span>
              </Button>
              {!isLastStep ? (
                <Button type="button" onClick={onNext} disabled={saving}>
                  <span>Siguiente</span>
                  <ChevronRightIcon />
                </Button>
              ) : null}
            </div>

            <div className="habitosView__editorNav">
              {isLastStep ? (
                <Button type="submit" tone="primary" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar habito"}
                </Button>
              ) : null}
              <Button type="button" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </SectionPanel>
    );
  }

  const isLastStep = step === HABIT_WIZARD_STEPS.length - 1;
  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel">
      <PanelHeader>
        <PanelTitle title="Nuevo habito" />
      </PanelHeader>

      <form className="habitosView__editorForm" onSubmit={onSubmit}>
        <div className="habitosView__modalStep">
          <span>Paso {step + 1} de {HABIT_WIZARD_STEPS.length}</span>
          <strong>{HABIT_WIZARD_STEPS[step]?.label || "Paso"}</strong>
        </div>

        {wizardError ? (
          <Notice tone="danger">
            {wizardError}
          </Notice>
        ) : null}

        {step === 0 ? (
          <HabitCategoryPicker
            categories={categories}
            presetOverrides={presetOverrides}
            selectedCategory={draft.category}
            saving={saving}
            builderOpen={categoryBuilderOpen}
            builderDraft={categoryBuilderDraft}
            builderError={categoryBuilderError}
            onSelectCategory={onSelectCategory}
            onOpenBuilder={onOpenCategoryBuilder}
            onCloseBuilder={onCloseCategoryBuilder}
            onChangeCategoryBuilder={onChangeCategoryBuilder}
            onSaveCategoryBuilder={onSaveCategoryBuilder}
            onOpenCategoryMenu={onOpenCategoryMenu}
          />
        ) : null}

        {step === 1 ? (
          <div className="habitosView__wizardStep">
            <div className="habitosView__sectionIntro">
              <strong>Como quieres evaluarlo?</strong>
            </div>

            <div className="habitosView__wizardOptionGrid habitosView__wizardOptionGrid--stacked">
              {HABIT_PROGRESS_OPTIONS.map((option) => (
                <WizardOptionCard
                  key={option.value}
                  title={option.label}
                  description={option.description}
                  isSelected={draft.progressMode === option.value}
                  onClick={() => onSelectProgressMode(option.value)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="habitosView__wizardStep">
            {draft.progressMode === "yes-no" ? (
              <FieldGrid>
                <Field label="Nombre" wide>
                  <input
                    value={draft.title}
                    onChange={(event) => onChange("title", event.target.value)}
                    placeholder="Nombre del habito"
                    required
                  />
                </Field>

                <Field label="Descripcion" wide>
                  <textarea
                    rows="3"
                    value={draft.notes}
                    onChange={(event) => onChange("notes", event.target.value)}
                    placeholder="Descripcion (opcional)"
                  />
                </Field>
              </FieldGrid>
            ) : null}

            {draft.progressMode === "quantity" ? (
              <FieldGrid>
                <Field label="Nombre" wide>
                  <input
                    value={draft.title}
                    onChange={(event) => onChange("title", event.target.value)}
                    placeholder="Nombre del habito"
                    required
                  />
                </Field>

                <Field label="Objetivo diario" wide>
                  <div className="habitosView__quantitySentence">
                    <select
                      value={draft.quantityMode}
                      onChange={(event) => onChange("quantityMode", event.target.value)}
                    >
                      {HABIT_QUANTITY_MODE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <DraftNumberInput
                      min="0"
                      step="1"
                      value={draft.quantityTarget}
                      onChange={(value) => onChange("quantityTarget", value)}
                      onCommit={(value) => onCommitNumber("quantityTarget", value)}
                      placeholder="Objetivo int"
                      disabled={draft.quantityMode === "no-target"}
                    />

                    <input
                      value={draft.quantityUnit}
                      onChange={(event) => onChange("quantityUnit", event.target.value)}
                      placeholder="Unidad (opcional)"
                    />

                    <span className="habitosView__quantitySuffix">en el dia</span>
                  </div>
                </Field>

                <Field label="Descripcion" wide>
                  <textarea
                    rows="3"
                    value={draft.notes}
                    onChange={(event) => onChange("notes", event.target.value)}
                    placeholder="Descripcion (opcional)"
                  />
                </Field>
              </FieldGrid>
            ) : null}

            {draft.progressMode === "checklist" ? (
              <>
                <FieldGrid>
                  <Field label="Nombre" wide>
                    <input
                      value={draft.title}
                      onChange={(event) => onChange("title", event.target.value)}
                      placeholder="Nombre del habito"
                      required
                    />
                  </Field>
                </FieldGrid>

                <div className="habitosView__subitemEditor">
                  <div className="habitosView__sectionIntro">
                    <strong>Sub-items</strong>
                  </div>

                  <div className="habitosView__subitemsDraft">
                    {draft.checklistItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className={[
                          "habitosView__subitemDraftRow",
                          draggedChecklistIndex === index ? "is-dragging" : "",
                          dropChecklistIndex === index && draggedChecklistIndex !== index ? "is-drop-target" : "",
                        ].filter(Boolean).join(" ")}
                        draggable={draft.checklistItems.length > 1}
                        onDragStart={(event) => {
                          if (checklistDragIntentRef.current !== index) {
                            event.preventDefault();
                            return;
                          }

                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", String(index));
                          setDraggedChecklistIndex(index);
                          setDropChecklistIndex(index);
                        }}
                        onDragEnd={() => {
                          resetChecklistDragState();
                        }}
                        onDragOver={(event) => {
                          if (draggedChecklistIndex === null) {
                            return;
                          }

                          event.preventDefault();
                          if (dropChecklistIndex !== index) {
                            setDropChecklistIndex(index);
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          handleChecklistDrop(index);
                        }}
                      >
                        <button
                          type="button"
                          className="habitosView__subitemDragHandle"
                          aria-label="Reordenar item"
                          draggable={false}
                          onPointerDown={() => {
                            checklistDragIntentRef.current = index;
                          }}
                          onPointerUp={() => {
                            checklistDragIntentRef.current = null;
                          }}
                          onPointerCancel={() => {
                            checklistDragIntentRef.current = null;
                          }}
                        >
                          <span />
                          <span />
                        </button>

                        <input
                          value={item.title}
                          onChange={(event) => onChange("checklistItem", {
                            index,
                            value: event.target.value,
                          })}
                          placeholder="item"
                        />
                        <IconButton
                          type="button"
                          aria-label="Eliminar item"
                          tone="danger"
                          onClick={() => onChange("removeChecklistItem", index)}
                        >
                          <TrashIcon />
                        </IconButton>
                      </div>
                    ))}
                  </div>

                  <div className="habitosView__centeredAction">
                    <Button type="button" onClick={() => onChange("addChecklistItem")}>
                      Agregar item
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="habitosView__wizardStep">
            <div className="habitosView__sectionIntro">
              <strong>Frecuencia</strong>
            </div>

            <Field label="Frecuencia">
              <select
                value={draft.scheduleType}
                onChange={(event) => onChange("scheduleType", event.target.value)}
              >
                <option value="daily">Todos los dias</option>
                <option value="weekdays">Dias de la semana</option>
              </select>
            </Field>

            {draft.scheduleType === "weekdays" ? (
              <div className="habitosView__weekdayGrid">
                {WEEKDAY_OPTIONS.map((option) => {
                  const active = draft.weekdays.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" ")}
                      onClick={() => onToggleWeekday(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="habitosView__wizardStep">
            <div className="habitosView__sectionIntro">
              <strong>Cuando quieres hacerlo?</strong>
            </div>

            <FieldGrid>
              <Field label="Fecha de inicio">
                <DateDraftInput
                  value={draft.startDate}
                  onChange={(value) => onChange("startDate", value)}
                  showTodayLabel
                />
              </Field>

              <div className="habitosView__toggleCard">
                <label className="habitosView__booleanField habitosView__booleanField--inline">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.hasEndDate)}
                    onChange={(event) => onChange("hasEndDate", event.target.checked)}
                  />
                  <span>Fecha de fin</span>
                </label>
              </div>
            </FieldGrid>

            {draft.hasEndDate ? (
              <FieldGrid>
                <Field label="Fecha de fin">
                  <input
                    type="date"
                    value={draft.endDate}
                    onChange={(event) => onChange("endDate", event.target.value)}
                  />
                </Field>

                <Field label="Duracion">
                  <div className="habitosView__durationField">
                    <DraftNumberInput
                      min="1"
                      step="1"
                      value={draft.durationDays}
                      onChange={(value) => onChange("durationDays", value)}
                      onCommit={(value) => onCommitNumber("durationDays", value)}
                    />
                    <span className="habitosView__quantitySuffix">dias</span>
                  </div>
                </Field>
              </FieldGrid>
            ) : null}

            <div className="habitosView__inlineHint">
              Hora y recordatorios: pronto.
            </div>

            <FieldGrid>
              <Field label="Prioridad">
                <StepperNumberInput
                  min="1"
                  max="100"
                  step="1"
                  value={draft.priority}
                  onChange={(value) => onChange("priority", value)}
                  onCommit={(value) => onCommitNumber("priority", value)}
                />
              </Field>
            </FieldGrid>
          </div>
        ) : null}

          <div className="habitosView__editorActions">
            <div className="habitosView__editorNav">
              <Button type="button" onClick={onBack} disabled={step === 0 || saving}>
                <ChevronLeftIcon />
                <span>Atras</span>
              </Button>
              {![0, 1].includes(step) && !isLastStep ? (
                <Button type="button" onClick={onNext} disabled={saving}>
                  <span>Siguiente</span>
                  <ChevronRightIcon />
                </Button>
              ) : null}
            </div>

          <div className="habitosView__editorNav">
            {isLastStep ? (
              <Button type="submit" tone="primary" disabled={saving}>
                {saving ? "Guardando..." : "Crear habito"}
              </Button>
            ) : null}
            <Button type="button" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </SectionPanel>
  );
}

export default function LifeTrackerView({ ctx, input = null }) {
  const systemToday = todayLocalDate();
  const pluginSettings = ctx.settings.useValue();
  const pluginSettingsRef = useRef(pluginSettings);
  const legacyHabitsSettingsApi = useMemo(
    () => ctx.createPluginSettingsApi("nexus.habitos"),
    [ctx],
  );
  const legacyHabitsSettings = legacyHabitsSettingsApi.useValue();
  const trainingSettingsApi = useMemo(
    () => createMigratedPluginSettingsApi(ctx, `${LIFE_TRACKER_PLUGIN_ID}.training`, {
      defaults: TRAINING_SETTINGS_DEFAULTS,
      legacyPluginId: "nexus.training",
    }),
    [ctx],
  );
  const financeSettingsApi = useMemo(
    () => createMigratedPluginSettingsApi(ctx, `${LIFE_TRACKER_PLUGIN_ID}.finance`, {
      legacyPluginId: "nexus.finanzas",
    }),
    [ctx],
  );
  const activeSection = typeof input?.section === "string" && input.section.trim()
    ? input.section
    : LIFE_TRACKER_DEFAULT_SECTION;
  const dashboardEditMode = Boolean(input?.dashboardEditMode);
  const widgetProviders = ctx.useWidgetProviders();
  const lifeTrackerWidgetProviders = useMemo(
    () => widgetProviders
      .filter((provider) => provider?.pluginId === LIFE_TRACKER_PLUGIN_ID)
      .sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0)),
    [widgetProviders],
  );
  const canvasWidgetProviders = useMemo(() => {
    if (lifeTrackerWidgetProviders.length) {
      return lifeTrackerWidgetProviders;
    }

    return LIFE_TRACKER_HOME_WIDGET_PROVIDERS.map((provider) => ({
      ...provider,
      pluginId: LIFE_TRACKER_PLUGIN_ID,
    }));
  }, [lifeTrackerWidgetProviders]);
  const presetCategoryOverrides = useMemo(
    () => readHabitCategoryPresetOverrides(pluginSettings),
    [pluginSettings],
  );
  const canvasStateValue = useMemo(
    () => readLifeTrackerCanvasState(pluginSettings),
    [pluginSettings],
  );
  const migratedCanvasState = useMemo(() => {
    if (canvasStateValue) {
      return canvasStateValue;
    }

    const legacyLayouts = readHabitosDashboardLayouts(legacyHabitsSettings);
    return createCanvasStateFromLegacyLayouts(
      legacyLayouts,
      canvasWidgetProviders,
      {
        breakpoints: HABITOS_DASHBOARD_BREAKPOINTS,
        colsByBreakpoint: HABITOS_DASHBOARD_COLS,
      },
    );
  }, [canvasStateValue, canvasWidgetProviders, legacyHabitsSettings]);
  const [home, setHome] = useState(createEmptyHome);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState("overview");
  const [isHabitsDrawerOpen, setIsHabitsDrawerOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("habits");
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [taskDraft, setTaskDraft] = useState(createTaskDraft());
  const [habitDraft, setHabitDraft] = useState(createHabitDraft());
  const [habitWizardError, setHabitWizardError] = useState("");
  const [categoryBuilderOpen, setCategoryBuilderOpen] = useState(false);
  const [categoryBuilderDraft, setCategoryBuilderDraft] = useState(createHabitCategoryDraft());
  const [categoryBuilderError, setCategoryBuilderError] = useState("");
  const [taskAdvancedOpen, setTaskAdvancedOpen] = useState(false);
  const [habitStep, setHabitStep] = useState(0);
  const [trainingLibrary, setTrainingLibrary] = useState(EMPTY_TRAINING_LIBRARY);
  const [trainingLibraryLoading, setTrainingLibraryLoading] = useState(false);
  const [trainingLibraryError, setTrainingLibraryError] = useState("");
  const [trainingAssignmentDraft, setTrainingAssignmentDraft] = useState(createRoutineAssignmentDraft());
  const [trainingAssignmentError, setTrainingAssignmentError] = useState("");
  const [routineCaptureDraft, setRoutineCaptureDraft] = useState(null);
  const [routineCaptureError, setRoutineCaptureError] = useState("");
  const [trainingRefreshToken, setTrainingRefreshToken] = useState(0);
  const [queueMenu, setQueueMenu] = useState(null);
  const [categoryMenu, setCategoryMenu] = useState(null);
  const [expandedChecklistIds, setExpandedChecklistIds] = useState([]);
  const [manualEditableOccurrenceIds, setManualEditableOccurrenceIds] = useState([]);
  const [viewDate, setViewDate] = useState(systemToday);
  const viewDatePickerRef = useRef(null);
  const isEditingHabitDraft = Boolean(habitDraft.id);
  const activeHabitWizardSteps = isEditingHabitDraft
    ? HABIT_EDIT_WIZARD_STEPS
    : HABIT_WIZARD_STEPS;
  const lastHabitStepIndex = activeHabitWizardSteps.length - 1;
  const managedCategories = useMemo(
    () => buildManagedHabitCategories(home.categoryCatalog, presetCategoryOverrides),
    [home.categoryCatalog, presetCategoryOverrides],
  );

  useEffect(() => {
    pluginSettingsRef.current = pluginSettings;
  }, [pluginSettings]);

  useEffect(() => {
    setHabitStep((currentValue) => Math.min(Math.max(currentValue, 0), lastHabitStepIndex));
  }, [lastHabitStepIndex]);

  useEffect(() => {
    if (!queueMenu && !categoryMenu) {
      return undefined;
    }

    const handlePointerDown = () => {
      setQueueMenu(null);
      setCategoryMenu(null);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setQueueMenu(null);
        setCategoryMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handlePointerDown);
    window.addEventListener("scroll", handlePointerDown, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handlePointerDown);
      window.removeEventListener("scroll", handlePointerDown, true);
    };
  }, [categoryMenu, queueMenu]);

  useEffect(() => {
    const hasCurrentCanvasState = Boolean(readLifeTrackerCanvasState(pluginSettings));
    if (hasCurrentCanvasState || !migratedCanvasState) {
      return;
    }

    void ctx.settings.set(writeLifeTrackerCanvasState(pluginSettings, migratedCanvasState));
  }, [ctx.settings, migratedCanvasState, pluginSettings]);

  useEffect(() => {
    const baseSettings = pluginSettings && typeof pluginSettings === "object" ? pluginSettings : {};
    if (baseSettings[LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]) {
      return;
    }

    const legacySettings = legacyHabitsSettings && typeof legacyHabitsSettings === "object"
      ? legacyHabitsSettings
      : {};
    if (!legacySettings[LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]) {
      return;
    }

    void ctx.settings.set(
      writeHabitCategoryPresetOverrides(pluginSettings, readHabitCategoryPresetOverrides(legacySettings)),
    );
  }, [ctx.settings, legacyHabitsSettings, pluginSettings]);

  useEffect(() => {
    if (!isHabitsDrawerOpen) {
      return;
    }

    if (!home.habits.length) {
      if (selectedHabitId) {
        setSelectedHabitId("");
      }
      return;
    }

    const selectionExists = home.habits.some((habit) => habit.id === selectedHabitId);
    if (!selectionExists) {
      setSelectedHabitId(getDefaultHabitId(home.habits));
    }
  }, [home.habits, isHabitsDrawerOpen, selectedHabitId]);

  useEffect(() => {
    if (!isHabitsDrawerOpen) {
      return;
    }

    if (!managedCategories.length) {
      if (selectedCategoryId) {
        setSelectedCategoryId("");
      }
      return;
    }

    const selectionExists = managedCategories.some((category) => category.id === selectedCategoryId);
    if (!selectionExists) {
      setSelectedCategoryId(managedCategories[0]?.id || "");
    }
  }, [isHabitsDrawerOpen, managedCategories, selectedCategoryId]);

  useEffect(() => {
    const visibleChecklistIds = new Set(
      home.dailyQueue
        .filter((entry) => entry.type === "habit" && entry.progressMode === "checklist")
        .map((entry) => entry.recordId),
    );

    setExpandedChecklistIds((currentValue) => currentValue.filter((entry) => visibleChecklistIds.has(entry)));
  }, [home.dailyQueue]);

  useEffect(() => {
    const visibleOccurrenceIds = new Set(
      home.dailyQueue
        .filter((entry) => entry.type === "habit" && !entry.isProjected)
        .map((entry) => entry.recordId),
    );

    setManualEditableOccurrenceIds((currentValue) => currentValue.filter((entry) => visibleOccurrenceIds.has(entry)));
  }, [home.dailyQueue, viewDate]);

  const loadHome = async (requestedDate = systemToday) => {
    setLoading(true);
    setError("");

    try {
      const nextHome = await invoke(LIFE_TRACKER_HABITS_CHANNELS.getHome, {
        date: requestedDate,
      });
      startTransition(() => {
        setHome(nextHome || createEmptyHome());
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Life Tracker.");
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingLibrary = async ({ silent = false } = {}) => {
    if (!silent) {
      setTrainingLibraryLoading(true);
    }
    setTrainingLibraryError("");

    try {
      const nextLibrary = await invoke(LIFE_TRACKER_TRAINING_CHANNELS.list);
      setTrainingLibrary(nextLibrary || EMPTY_TRAINING_LIBRARY);
      return nextLibrary || EMPTY_TRAINING_LIBRARY;
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : "No se pudo cargar la biblioteca de entrenamiento.";
      setTrainingLibraryError(message);
      return null;
    } finally {
      if (!silent) {
        setTrainingLibraryLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeSection !== "home") {
      return;
    }

    void loadHome(viewDate);
  }, [activeSection, viewDate]);

  const openLifeTrackerSection = (section) => {
    void ctx.openView({
      viewId: LIFE_TRACKER_WORKSPACE_VIEW_ID,
      reuse: true,
      sourceId: "nexus.life-tracker.section",
      input: {
        ...(input && typeof input === "object" ? input : {}),
        section,
        dashboardEditMode: section === "home" ? dashboardEditMode : false,
      },
    });
  };

  const financeCtx = useMemo(
    () => ({
      ...ctx,
      pluginId: `${LIFE_TRACKER_PLUGIN_ID}.finance`,
      settings: financeSettingsApi,
    }),
    [ctx, financeSettingsApi],
  );
  const trainingCtx = useMemo(
    () => ({
      ...ctx,
      pluginId: `${LIFE_TRACKER_PLUGIN_ID}.training`,
      settings: trainingSettingsApi,
    }),
    [ctx, trainingSettingsApi],
  );

  const openTaskEditor = (source = null) => {
    setQueueMenu(null);
    setError("");
    setTaskDraft(createTaskDraft(source));
    setTaskAdvancedOpen(Boolean(source?.notes || source?.time || source?.reminderAt || source?.subitems?.length));
    setModalMode("task");
  };

  const openHabitEditor = (source = null) => {
    setQueueMenu(null);
    setError("");
    setHabitDraft(createHabitDraft(source));
    setHabitWizardError("");
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
    setHabitStep(0);
    setModalMode("habit");
  };

  const openCreateChooser = () => {
    setQueueMenu(null);
    setError("");
    setModalMode("create");
  };

  const openRoutineAssignmentEditor = (source = null) => {
    setQueueMenu(null);
    setCategoryMenu(null);
    setError("");
    setTrainingAssignmentError("");
    setTrainingAssignmentDraft(createRoutineAssignmentDraft(source));
    setModalMode("routine-assignment");
    void loadTrainingLibrary();
  };

  const openRoutineCaptureEditor = (item) => {
    setQueueMenu(null);
    setCategoryMenu(null);
    setError("");
    setRoutineCaptureError("");
    setRoutineCaptureDraft(createRoutineCaptureDraft(item));
    setModalMode("routine-capture");
  };

  const openHabitsDrawer = () => {
    setQueueMenu(null);
    setCategoryMenu(null);
    setSelectedHabitId((currentValue) => (
      home.habits.some((habit) => habit.id === currentValue)
        ? currentValue
        : getDefaultHabitId(home.habits)
    ));
    setSelectedCategoryId((currentValue) => (
      managedCategories.some((category) => category.id === currentValue)
        ? currentValue
        : (managedCategories[0]?.id || "")
    ));
    setSettingsTab("habits");
    setIsHabitsDrawerOpen(true);
  };

  const closeHabitsDrawer = () => {
    setIsHabitsDrawerOpen(false);
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
  };

  const closeWorkbench = () => {
    setModalMode("overview");
    setTaskDraft(createTaskDraft());
    setHabitDraft(createHabitDraft());
    setHabitWizardError("");
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
    setTaskAdvancedOpen(false);
    setHabitStep(0);
    setTrainingAssignmentDraft(createRoutineAssignmentDraft());
    setTrainingAssignmentError("");
    setRoutineCaptureDraft(null);
    setRoutineCaptureError("");
  };

  const applyHomeUpdate = (nextHome) => {
    startTransition(() => {
      setHome(nextHome || createEmptyHome());
    });
  };

  const runMutation = async (channel, payload, { onSuccess } = {}) => {
    setSaving(true);
    setError("");

    try {
      const nextHome = await invoke(channel, {
        ...(payload || {}),
        date: viewDate,
      });
      applyHomeUpdate(nextHome);
      await onSuccess?.(nextHome);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo completar la operacion.");
    } finally {
      setSaving(false);
    }
  };

  const runTrainingMutation = async (
    channel,
    payload,
    {
      onSuccess,
      refreshHome = true,
      refreshTraining = true,
    } = {},
  ) => {
    setSaving(true);
    setError("");

    try {
      const result = await invoke(channel, payload || {});

      if (refreshHome && activeSection === "home") {
        await loadHome(viewDate);
      }

      if (refreshTraining) {
        await loadTrainingLibrary({ silent: true });
        setTrainingRefreshToken((currentValue) => currentValue + 1);
      }

      await onSuccess?.(result);
      return result;
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo completar la operacion.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleTrainingAssignmentDraftChange = (field, value) => {
    setTrainingAssignmentError("");
    setTrainingAssignmentDraft((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleToggleTrainingWeekday = (weekday) => {
    setTrainingAssignmentError("");
    setTrainingAssignmentDraft((currentValue) => {
      const isActive = currentValue.weekdays.includes(weekday);
      return {
        ...currentValue,
        weekdays: isActive
          ? currentValue.weekdays.filter((entry) => entry !== weekday)
          : [...currentValue.weekdays, weekday].sort((left, right) => left - right),
      };
    });
  };

  const handleSaveRoutineAssignment = async () => {
    try {
      const payload = normalizeRoutineAssignmentPayload(trainingAssignmentDraft);
      setTrainingAssignmentError("");
      await runTrainingMutation(
        LIFE_TRACKER_TRAINING_CHANNELS.saveAssignment,
        {
          id: trainingAssignmentDraft.id || undefined,
          ...payload,
        },
        {
          onSuccess: () => {
            closeWorkbench();
          },
        },
      );
    } catch (validationError) {
      setTrainingAssignmentError(
        validationError instanceof Error
          ? validationError.message
          : "No se pudo validar la programacion.",
      );
    }
  };

  const handleDeleteRoutineAssignment = async (assignmentId = trainingAssignmentDraft.id) => {
    if (!assignmentId) {
      closeWorkbench();
      return;
    }

    await runTrainingMutation(
      LIFE_TRACKER_TRAINING_CHANNELS.deleteAssignment,
      {
        assignmentId,
      },
      {
        onSuccess: () => {
          closeWorkbench();
        },
      },
    );
  };

  const handleRoutineCaptureStepChange = (stepId, nextActual) => {
    setRoutineCaptureError("");
    setRoutineCaptureDraft((currentValue) => {
      if (!currentValue) {
        return currentValue;
      }

      return {
        ...currentValue,
        steps: currentValue.steps.map((step) => (
          step.id === stepId
            ? {
                ...step,
                actual: nextActual,
              }
            : step
        )),
      };
    });
  };

  const handleSaveRoutineCapture = async () => {
    if (!routineCaptureDraft?.assignmentId) {
      setRoutineCaptureError("No encontramos la rutina programada.");
      return;
    }

    const serializedResult = serializeRoutineCaptureDraft(routineCaptureDraft);
    if (!serializedResult.entries.length) {
      setRoutineCaptureError("Carga al menos un resultado antes de guardar.");
      return;
    }

    await runTrainingMutation(
      LIFE_TRACKER_TRAINING_CHANNELS.saveOccurrenceResult,
      {
        assignmentId: routineCaptureDraft.assignmentId,
        occurrenceDate: routineCaptureDraft.occurrenceDate,
        result: serializedResult,
      },
      {
        onSuccess: () => {
          closeWorkbench();
        },
      },
    );
  };

  const handleClearRoutineCapture = async () => {
    if (!routineCaptureDraft?.assignmentId) {
      setRoutineCaptureError("No encontramos la rutina programada.");
      return;
    }

    await runTrainingMutation(
      LIFE_TRACKER_TRAINING_CHANNELS.saveOccurrenceResult,
      {
        assignmentId: routineCaptureDraft.assignmentId,
        occurrenceDate: routineCaptureDraft.occurrenceDate,
        clear: true,
      },
      {
        onSuccess: () => {
          closeWorkbench();
        },
      },
    );
  };

  const persistPresetCategoryOverrides = async (nextOverrides) => {
    await ctx.settings.set(writeHabitCategoryPresetOverrides(pluginSettings, nextOverrides));
  };

  const handleOpenCategoryBuilder = (source = null) => {
    setCategoryBuilderError("");
    setCategoryBuilderDraft(createHabitCategoryDraft(source));
    setCategoryBuilderOpen(true);
    setCategoryMenu(null);
  };

  const handleCloseCategoryBuilder = () => {
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
  };

  const handleChangeCategoryBuilder = (field, value) => {
    setCategoryBuilderError("");
    setCategoryBuilderDraft((currentValue) => ({
      ...currentValue,
      [field]: field === "color"
        ? normalizeHexColorDraftValue(value, DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR)
        : value,
    }));
  };

  const handleSelectExistingHabitCategory = (value) => {
    setCategoryBuilderError("");
    setCategoryBuilderOpen(false);
    setCategoryMenu(null);
    setHabitDraft((currentValue) => ({
      ...currentValue,
      category: value,
    }));
  };

  const handleSaveCategoryBuilder = async () => {
    const normalizedName = normalizeCategoryNameValue(categoryBuilderDraft.name);
    const editingCategoryId = String(categoryBuilderDraft.id || "").trim();
    const editingPresetId = String(categoryBuilderDraft.presetId || "").trim();
    const previousCategoryName = String(categoryBuilderDraft.originalName || "").trim();
    const knownCategoryNames = new Set(
      managedCategories
        .filter((entry) => entry.id !== editingCategoryId && entry.id !== editingPresetId)
        .map((entry) => normalizeCategoryNameValue(entry.name || entry.label || entry.value)),
    );

    if (!normalizedName) {
      setCategoryBuilderError("El nombre de la categoria es obligatorio.");
      return;
    }

    if (knownCategoryNames.has(normalizedName)) {
      setCategoryBuilderError("Ya existe una categoria con ese nombre.");
      return;
    }

    setCategoryBuilderError("");

    if (categoryBuilderDraft.kind === "preset" && editingPresetId) {
      const nextCategoryName = String(categoryBuilderDraft.name || "").trim();
      const nextOverrides = {
        ...presetCategoryOverrides,
        [editingPresetId]: {
          ...presetCategoryOverrides[editingPresetId],
          name: nextCategoryName,
          iconId: categoryBuilderDraft.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
          color: normalizeHexColorDraftValue(
            categoryBuilderDraft.color,
            DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
          ),
          deleted: false,
        },
      };

      const finalizePresetSave = async () => {
        await persistPresetCategoryOverrides(nextOverrides);
        setHabitDraft((currentValue) => ({
          ...currentValue,
          category: currentValue.category === previousCategoryName || !currentValue.category
            ? nextCategoryName
            : currentValue.category,
        }));
        setCategoryBuilderOpen(false);
        setCategoryBuilderDraft(createHabitCategoryDraft());
        setCategoryBuilderError("");

        if (!habitDraft.id) {
          setHabitStep(1);
        }
      };

      if (previousCategoryName && previousCategoryName !== nextCategoryName) {
        await runMutation(
          LIFE_TRACKER_HABITS_CHANNELS.renameCategoryReferences,
          {
            previousName: previousCategoryName,
            nextName: nextCategoryName,
          },
          {
            onSuccess: finalizePresetSave,
          },
        );
        return;
      }

      await finalizePresetSave();
      return;
    }

    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveCategory,
      {
        id: editingCategoryId || undefined,
        name: String(categoryBuilderDraft.name || "").trim(),
        iconId: categoryBuilderDraft.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
        color: normalizeHexColorDraftValue(
          categoryBuilderDraft.color,
          DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
        ),
      },
      {
        onSuccess: (nextHome) => {
          const savedCategory = (nextHome?.categoryCatalog || []).find(
            (entry) => (
              editingCategoryId
                ? String(entry.id || "") === editingCategoryId
                : normalizeCategoryNameValue(entry.name) === normalizedName
            ),
          );
          const nextCategoryName = savedCategory?.name || String(categoryBuilderDraft.name || "").trim();

          setHabitDraft((currentValue) => ({
            ...currentValue,
            category: currentValue.category === previousCategoryName || !currentValue.category
              ? nextCategoryName
              : currentValue.category,
          }));
          setCategoryBuilderOpen(false);
          setCategoryBuilderDraft(createHabitCategoryDraft());
          setCategoryBuilderError("");

          if (!habitDraft.id) {
            setHabitStep(1);
          }
        },
      },
    );
  };

  const handleOpenCategoryMenu = (event, option) => {
    event.preventDefault();
    event.stopPropagation();
    setQueueMenu(null);
    setCategoryMenu({
      x: event.clientX,
      y: event.clientY,
      option,
    });
  };

  const handleDeleteCategory = async (option) => {
    if (option.kind === "preset" && option.presetId) {
      const nextOverrides = {
        ...presetCategoryOverrides,
        [option.presetId]: {
          ...presetCategoryOverrides[option.presetId],
          deleted: true,
        },
      };

      await runMutation(
        LIFE_TRACKER_HABITS_CHANNELS.clearCategoryReferences,
        {
          categoryName: option.value,
        },
        {
          onSuccess: async () => {
            await persistPresetCategoryOverrides(nextOverrides);
            setHabitDraft((currentValue) => (
              currentValue.category === option.value
                ? {
                    ...currentValue,
                    category: "",
                  }
                : currentValue
            ));
            setCategoryMenu(null);
            setCategoryBuilderOpen(false);
            setCategoryBuilderDraft(createHabitCategoryDraft());
            setCategoryBuilderError("");
          },
        },
      );
      return;
    }

    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.deleteCategory,
      {
        categoryId: option.id,
      },
      {
        onSuccess: () => {
          setHabitDraft((currentValue) => (
            currentValue.category === option.value
              ? {
                  ...currentValue,
                  category: "",
                }
              : currentValue
          ));
          setCategoryMenu(null);
          setCategoryBuilderOpen(false);
          setCategoryBuilderDraft(createHabitCategoryDraft());
          setCategoryBuilderError("");
        },
      },
    );
  };

  const handleCreateCategoryFromSettings = () => {
    setSettingsTab("categories");
    handleOpenCategoryBuilder();
  };

  const handleEditCategoryFromSettings = (category) => {
    setSettingsTab("categories");
    setSelectedCategoryId(String(category?.id || ""));
    handleOpenCategoryBuilder(category);
  };

  const handleDeleteCategoryFromSettings = (category) => {
    void handleDeleteCategory(category);
  };

  const handleTaskDraftChange = (field, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleTaskDraftNumberCommit = (field, value) => {
    if (field !== "priority") {
      return;
    }

    setTaskDraft((currentValue) => ({
      ...currentValue,
      priority: normalizeIntegerDraftValue(value, {
        min: 1,
        max: 100,
        fallback: "1",
      }),
    }));
  };

  const handleTaskSubitemChange = (index, field, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      subitems: currentValue.subitems.map((entry, entryIndex) => (
        entryIndex === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )),
    }));
  };

  const handleHabitDraftChange = (field, value) => {
    setHabitWizardError("");

    if (field === "addChecklistItem") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        checklistItems: [
          ...currentValue.checklistItems,
          createDraftChecklistItem(),
        ],
      }));
      return;
    }

    if (field === "removeChecklistItem") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        checklistItems: currentValue.checklistItems.filter((_, index) => index !== value),
      }));
      return;
    }

    if (field === "moveChecklistItem") {
      setHabitDraft((currentValue) => {
        const fromIndex = Number(value?.fromIndex);
        const toIndex = Number(value?.toIndex);

        if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
          return currentValue;
        }

        if (
          fromIndex < 0
          || toIndex < 0
          || fromIndex >= currentValue.checklistItems.length
          || toIndex >= currentValue.checklistItems.length
          || fromIndex === toIndex
        ) {
          return currentValue;
        }

        const nextChecklistItems = [...currentValue.checklistItems];
        const [movedItem] = nextChecklistItems.splice(fromIndex, 1);
        nextChecklistItems.splice(toIndex, 0, movedItem);

        return {
          ...currentValue,
          checklistItems: nextChecklistItems.map((entry, index) => ({
            ...entry,
            sortOrder: index,
          })),
        };
      });
      return;
    }

    if (field === "checklistItem") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        checklistItems: currentValue.checklistItems.map((entry, index) => (
          index === value.index
            ? {
                ...entry,
                title: value.value,
              }
            : entry
        )),
      }));
      return;
    }

    if (field === "quantityMode") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        quantityMode: value,
        quantityTarget: value === "no-target" ? "" : currentValue.quantityTarget,
      }));
      return;
    }

    if (field === "startDate") {
      setHabitDraft((currentValue) => {
        const nextStartDate = value || todayLocalDate();

        if (!currentValue.hasEndDate) {
          return {
            ...currentValue,
            startDate: nextStartDate,
          };
        }

        const durationDays = Math.max(1, Number(currentValue.durationDays || 1));
        return {
          ...currentValue,
          startDate: nextStartDate,
          endDate: addDaysToLocalDate(nextStartDate, durationDays - 1),
        };
      });
      return;
    }

    if (field === "hasEndDate") {
      setHabitDraft((currentValue) => {
        if (!value) {
          return {
            ...currentValue,
            hasEndDate: false,
            endDate: "",
            durationDays: "1",
          };
        }

        return {
          ...currentValue,
          hasEndDate: true,
          endDate: currentValue.endDate || currentValue.startDate,
          durationDays: currentValue.durationDays || "1",
        };
      });
      return;
    }

    if (field === "endDate") {
      setHabitDraft((currentValue) => {
        const nextEndDate = value || currentValue.startDate;
        const safeEndDate = getInclusiveDayCount(currentValue.startDate, nextEndDate) === 1
          && nextEndDate < currentValue.startDate
          ? currentValue.startDate
          : nextEndDate;

        return {
          ...currentValue,
          endDate: safeEndDate,
          durationDays: String(getInclusiveDayCount(currentValue.startDate, safeEndDate)),
        };
      });
      return;
    }

    if (field === "durationDays") {
      setHabitDraft((currentValue) => {
        const rawValue = String(value ?? "");
        const numericValue = Number(rawValue);
        if (!rawValue.trim() || !Number.isFinite(numericValue) || numericValue < 1) {
          return {
            ...currentValue,
            durationDays: rawValue,
          };
        }

        const normalizedDuration = Math.round(numericValue);
        return {
          ...currentValue,
          durationDays: rawValue,
          endDate: addDaysToLocalDate(currentValue.startDate, normalizedDuration - 1),
        };
      });
      return;
    }

    if (field === "priority") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        priority: value,
      }));
      return;
    }

    setHabitDraft((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleHabitDraftNumberCommit = (field, value) => {
    if (field === "durationDays") {
      setHabitDraft((currentValue) => {
        const normalizedDuration = normalizeIntegerDraftValue(value, {
          min: 1,
          fallback: "1",
        });

        return {
          ...currentValue,
          durationDays: normalizedDuration,
          endDate: addDaysToLocalDate(currentValue.startDate, Number(normalizedDuration) - 1),
        };
      });
      return;
    }

    if (field === "quantityTarget") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        quantityTarget: currentValue.quantityMode === "no-target"
          ? ""
          : normalizeIntegerDraftValue(value, {
              min: 0,
              fallback: "",
            }),
      }));
      return;
    }

    if (field === "priority") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        priority: normalizeIntegerDraftValue(value, {
          min: 1,
          max: 100,
          fallback: "1",
        }),
      }));
    }
  };

  const handleSelectHabitCategory = (value) => {
    setHabitWizardError("");
    handleSelectExistingHabitCategory(value);
    setHabitStep(1);
  };

  const handleSelectHabitProgressMode = (value) => {
    setHabitWizardError("");
    setHabitDraft((currentValue) => ({
      ...currentValue,
      progressMode: value,
    }));
    setHabitStep(2);
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveTask,
      {
        ...taskDraft,
        priority: normalizeIntegerDraftValue(taskDraft.priority, {
          min: 1,
          max: 100,
          fallback: "1",
        }),
        reminderAt: taskDraft.reminderAt
          ? new Date(taskDraft.reminderAt).toISOString()
          : null,
      },
      {
        onSuccess: closeWorkbench,
      },
    );
  };

  const handleHabitSubmit = async (event) => {
    event.preventDefault();

    if (habitStep < lastHabitStepIndex) {
      if (!isEditingHabitDraft && habitStep === 0 && !habitDraft.category) {
        setHabitWizardError("Elige una categoria para seguir.");
        return;
      }

      if (!isEditingHabitDraft && habitStep === 1 && !habitDraft.progressMode) {
        setHabitWizardError("Elige como quieres evaluar tu progreso.");
        return;
      }

      if (
        (isEditingHabitDraft && habitStep === 0)
        || (!isEditingHabitDraft && habitStep === 2)
      ) {
        const title = String(habitDraft.title || "").trim();

        if (!title) {
          setHabitWizardError("El nombre del habito es obligatorio.");
          return;
        }

        if (!String(habitDraft.category || "").trim()) {
          setHabitWizardError("Elige una categoria para continuar.");
          return;
        }

        if (habitDraft.progressMode === "quantity") {
          if (habitDraft.quantityMode !== "no-target" && String(habitDraft.quantityTarget || "").trim() === "") {
            setHabitWizardError("Define el objetivo numerico para continuar.");
            return;
          }
        }

        if (habitDraft.progressMode === "checklist") {
          const items = habitDraft.checklistItems.map((entry) => String(entry.title || "").trim());

          if (!items.some(Boolean)) {
            setHabitWizardError("Agrega al menos un sub-item.");
            return;
          }

          if (items.some((entry) => !entry)) {
            setHabitWizardError("Completa o elimina los sub-items vacios.");
            return;
          }
        }
      }

      if (
        (isEditingHabitDraft && habitStep === 1)
        || (!isEditingHabitDraft && habitStep === 3)
      ) {
        if (habitDraft.scheduleType === "weekdays" && !habitDraft.weekdays.length) {
          setHabitWizardError("Elige al menos un dia de la semana.");
          return;
        }
      }

      setHabitWizardError("");
      setHabitStep((currentValue) => Math.min(currentValue + 1, lastHabitStepIndex));
      return;
    }

    const normalizedTitle = String(habitDraft.title || "").trim();
    if (!normalizedTitle) {
      setHabitWizardError("El nombre del habito es obligatorio.");
      return;
    }

    if (!String(habitDraft.category || "").trim()) {
      setHabitWizardError("Elige una categoria para continuar.");
      return;
    }

    if (habitDraft.scheduleType === "weekdays" && !habitDraft.weekdays.length) {
      setHabitWizardError("Elige al menos un dia de la semana.");
      return;
    }

    if (
      habitDraft.progressMode === "quantity"
      && habitDraft.quantityMode !== "no-target"
      && String(habitDraft.quantityTarget || "").trim() === ""
    ) {
      setHabitWizardError("Define el objetivo numerico para guardar.");
      return;
    }

    if (habitDraft.progressMode === "checklist") {
      const items = habitDraft.checklistItems.map((entry) => String(entry.title || "").trim());

      if (!items.some(Boolean)) {
        setHabitWizardError("Agrega al menos un sub-item.");
        return;
      }

      if (items.some((entry) => !entry)) {
        setHabitWizardError("Completa o elimina los sub-items vacios.");
        return;
      }
    }

    setHabitWizardError("");

    const nextHabitId = habitDraft.id || createDraftId("habit");
    const payload = buildHabitPayload(habitDraft, {
      id: nextHabitId,
    });

    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveHabit,
      payload,
      {
        onSuccess: () => {
          setSelectedHabitId(nextHabitId);
          closeWorkbench();
        },
      },
    );
  };

  const handleToggleQueueItem = async (item) => {
    setQueueMenu((currentValue) => (
      currentValue?.item?.id === item.id ? null : currentValue
    ));

    if (item.type === "task") {
      if (viewDate !== actualToday) {
        return;
      }

      await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleTask, {
        taskId: item.recordId,
      });
      return;
    }

    if (item.type === "routine") {
      if (!canEditQueueItemResult(item)) {
        return;
      }

      if (item.completionMode === "detailed") {
        openRoutineCaptureEditor(item);
        return;
      }

      await runTrainingMutation(LIFE_TRACKER_TRAINING_CHANNELS.saveOccurrenceResult, {
        assignmentId: item.assignmentId,
        occurrenceDate: item.raw?.occurrenceDate || viewDate,
        clear: item.status === "completed",
      });
      return;
    }

    if (!canEditQueueItemResult(item)) {
      return;
    }

    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleOccurrence, {
      occurrenceId: item.recordId,
    });
  };

  const handleCommitOccurrenceQuantity = async (item, value) => {
    if (!canEditQueueItemResult(item)) {
      return;
    }

    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.setOccurrenceQuantity, {
      occurrenceId: item.recordId,
      value,
    });
  };

  const handleToggleOccurrenceChecklistItem = async (item, itemId) => {
    if (!canEditQueueItemResult(item)) {
      return;
    }

    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleOccurrenceChecklistItem, {
      occurrenceId: item.recordId,
      itemId,
    });
  };

  const handleToggleChecklistExpanded = (occurrenceId) => {
    setExpandedChecklistIds((currentValue) => (
      currentValue.includes(occurrenceId)
        ? currentValue.filter((entry) => entry !== occurrenceId)
        : [...currentValue, occurrenceId]
    ));
  };

  const enableManualOccurrenceEdit = (occurrenceId) => {
    setManualEditableOccurrenceIds((currentValue) => (
      currentValue.includes(occurrenceId) ? currentValue : [...currentValue, occurrenceId]
    ));
  };

  const disableManualOccurrenceEdit = (occurrenceId) => {
    setManualEditableOccurrenceIds((currentValue) => currentValue.filter((entry) => entry !== occurrenceId));
  };

  const canEditQueueItemResult = (item) => {
    if (!item) {
      return false;
    }

    if (item.type === "routine") {
      return !isFutureView;
    }

    if (item.type !== "habit" || item.isProjected) {
      return false;
    }

    if (!isPastView) {
      return !isFutureView;
    }

    return manualEditableOccurrenceIds.includes(item.recordId);
  };

  const actualToday = home.actualToday || systemToday;
  const isPastView = compareLocalDates(viewDate, actualToday) < 0;
  const isFutureView = compareLocalDates(viewDate, actualToday) > 0;

  const handleShiftViewDate = (daysToAdd) => {
    setViewDate((currentValue) => clampViewDate(addDaysToLocalDate(currentValue, daysToAdd)));
  };

  const handleSelectViewDate = (nextDate) => {
    setViewDate(clampViewDate(nextDate));
  };

  const handleOpenViewDatePicker = () => {
    const input = viewDatePickerRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  const handleDeleteQueueItem = async (item) => {
    if (item.type === "task") {
      await runMutation(LIFE_TRACKER_HABITS_CHANNELS.deleteTask, {
        taskId: item.raw?.id || item.recordId,
      });
      return;
    }

    if (item.type === "routine") {
      await handleDeleteRoutineAssignment(item.assignmentId);
      return;
    }

    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.deleteHabit, {
      habitId: item.habit?.id,
    });
  };

  const handleToggleHabitStatus = async (habit) => {
    setSelectedHabitId(habit.id);
    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveHabit,
      buildHabitPayload(habit, {
        status: habit.status === "active" ? "archived" : "active",
      }),
    );
  };

  const renderSecondaryTask = (task) => (
    <article
      key={task.id}
      className={[
        "habitosView__secondaryCard",
        queueMenu?.item?.id === `upcoming-task:${task.id}` ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      onContextMenu={(event) => handleOpenQueueMenu(event, buildUpcomingTaskMenuItem(task))}
    >
      <strong>{task.title}</strong>
      <span>{formatLocalDate(task.dueDate)}{task.time ? ` - ${task.time}` : ""}</span>
    </article>
  );

  const handleOpenQueueMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryMenu(null);
    setQueueMenu({
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const selectedHabit = home.habits.find((habit) => habit.id === selectedHabitId) || null;
  const selectedCategory = managedCategories.find((category) => category.id === selectedCategoryId) || null;
  const dailyPanelTitle = isPastView
    ? "Historial del dia"
    : isFutureView
      ? "Plan del dia"
      : "Panel del dia";
  const dailyPanelDescription = isPastView
    ? "Resultados cerrados por fecha. Usa click derecho para habilitar edicion manual del resultado."
    : isFutureView
      ? "Vista previa de tareas y ocurrencias previstas para esa fecha."
      : "";
  const renderDailyQueueWidget = () => (
    <SectionPanel className="habitosDashboard__widget habitosView__queuePanel">
      <PanelHeader
        actions={(
          <div className="habitosView__panelActions">
            <div className="habitosView__dayNavigator">
              <button
                type="button"
                className="habitosView__dayNavButton"
                onClick={() => handleShiftViewDate(-1)}
                disabled={loading || saving}
                aria-label="Dia anterior"
              >
                <ChevronLeftIcon />
              </button>

              <button
                type="button"
                className="habitosView__dayNavCurrent"
                onClick={handleOpenViewDatePicker}
                disabled={loading || saving}
                aria-label="Elegir fecha"
              >
                <span>{formatVisibleDateLabel(viewDate)}</span>
              </button>

              <button
                type="button"
                className="habitosView__dayNavButton"
                onClick={() => handleShiftViewDate(1)}
                disabled={loading || saving}
                aria-label="Dia siguiente"
              >
                <ChevronRightIcon />
              </button>

              {viewDate !== actualToday ? (
                <Button
                  type="button"
                  tone="secondary"
                  onClick={() => handleSelectViewDate(actualToday)}
                  disabled={loading || saving}
                >
                  Volver a hoy
                </Button>
              ) : null}

              <input
                ref={viewDatePickerRef}
                className="habitosView__datePickerInput"
                type="date"
                value={viewDate}
                onChange={(event) => handleSelectViewDate(event.target.value)}
                tabIndex="-1"
                aria-hidden="true"
              />
            </div>

            <IconButton
              type="button"
              aria-label="Configuraciones"
              title="Configuraciones"
              onClick={openHabitsDrawer}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton type="button" tone="primary" aria-label="Crear nuevo" onClick={openCreateChooser}>
              <PlusIcon />
            </IconButton>
          </div>
        )}
      >
        <DashboardPanelTitle
          title={dailyPanelTitle}
          description={dailyPanelDescription}
          editMode={dashboardEditMode}
        />
      </PanelHeader>

      <div className="habitosDashboard__widgetBody habitosView__queuePanelBody">
        {loading ? (
          <StateBlock title="Cargando..." />
        ) : home.dailyQueue.length ? (
          <div className="habitosView__queueList">
            {home.dailyQueue.map((item) => (
              <QueueItemCard
                key={item.id}
                item={item}
                categoryCatalog={home.categoryCatalog}
                presetOverrides={presetCategoryOverrides}
                isSelected={queueMenu?.item?.id === item.id}
                saving={saving}
                resultEditable={item.type === "task" ? viewDate === actualToday : canEditQueueItemResult(item)}
                onToggle={() => void handleToggleQueueItem(item)}
                onContextMenu={handleOpenQueueMenu}
                onCommitQuantity={(queueItem, value) => handleCommitOccurrenceQuantity(queueItem, value)}
                onToggleChecklistItem={(queueItem, itemId) => handleToggleOccurrenceChecklistItem(queueItem, itemId)}
                onToggleChecklistExpanded={handleToggleChecklistExpanded}
                isChecklistExpanded={expandedChecklistIds.includes(item.recordId)}
              />
            ))}
          </div>
        ) : (
          <StateBlock
            title={isPastView
              ? "No hay historial para esta fecha."
              : isFutureView
                ? "No hay actividad prevista para esta fecha."
                : "No hay actividad para hoy."}
          />
        )}
      </div>
    </SectionPanel>
  );

  const renderHabitOutcomeWidget = () => (
    <HabitOutcomePanel chart={home.habitOutcomeChart} dashboardEditMode={dashboardEditMode} />
  );

  const renderUpcomingTasksWidget = () => (
    <SecondaryListCard
      title="Tareas proximas"
      items={viewDate === actualToday ? home.upcomingTasks : []}
      emptyTitle={viewDate === actualToday
        ? "Sin tareas proximas."
        : "Disponible solo para hoy."}
      renderItem={renderSecondaryTask}
      dashboardEditMode={dashboardEditMode}
    />
  );

  const persistHomeCanvasState = async (nextCanvasState) => {
    await ctx.settings.set(
      writeLifeTrackerCanvasState(pluginSettingsRef.current, nextCanvasState),
    );
  };

  const lifeTrackerWidgetContext = {
    openSection: openLifeTrackerSection,
    renderDailyQueue: renderDailyQueueWidget,
    renderHabitOutcome: renderHabitOutcomeWidget,
    renderUpcomingTasks: renderUpcomingTasksWidget,
    trainingRefreshToken,
  };

  return (
    <WorkspacePage className="habitosView lifeTrackerView">
      {activeSection === "home" ? (
        <WorkspaceBody>
          <ScrollRegion className="habitosView__mainScroll">
            <PanelStack className="habitosView__dashboardStack">
              {error ? (
                <Notice tone="danger">
                  {error}
                </Notice>
              ) : null}

              <CanvasWorkspace
                providers={canvasWidgetProviders}
                canvasState={migratedCanvasState}
                onPersistCanvasState={persistHomeCanvasState}
                onPersistError={(settingsError) => {
                  setError(
                    settingsError instanceof Error
                      ? settingsError.message
                      : "No se pudo guardar el lienzo de Life Tracker.",
                  );
                }}
                editMode={dashboardEditMode}
                widgetContext={lifeTrackerWidgetContext}
                gridClassName="habitosDashboard__grid"
                itemClassName="habitosDashboard__item"
                editOverlayClassName="habitosDashboard__editOverlay"
                draggableCancel=".nexus-ui-panel-header__actions, .habitosDashboard__widgetBody, button, input, select, textarea, label, canvas"
                breakpoints={HABITOS_DASHBOARD_BREAKPOINTS}
                cols={HABITOS_DASHBOARD_COLS}
                rowHeight={HABITOS_DASHBOARD_ROW_HEIGHT}
                margin={HABITOS_DASHBOARD_MARGIN}
                containerPadding={[0, 0]}
              />
            </PanelStack>
          </ScrollRegion>
        </WorkspaceBody>
      ) : null}

      {activeSection === "finance" ? (
        <PersonalFinanceView shellMode="embedded" showTopbar={false} />
      ) : null}

      {activeSection === "training" ? (
        <TrainingView ctx={trainingCtx} shellMode="embedded" showTopbar={false} />
      ) : null}

      {activeSection === "home" && queueMenu?.item ? (
        <div
          className="habitosView__contextMenu"
          style={{
            position: "fixed",
            top: `${queueMenu.y}px`,
            left: `${queueMenu.x}px`,
            zIndex: 1400,
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          {queueMenu.item.type === "habit" && isPastView && !queueMenu.item.isProjected ? (
            <button
              type="button"
              className="context-menu-item"
              onClick={() => {
                const occurrenceId = queueMenu.item.recordId;
                setQueueMenu(null);
                if (manualEditableOccurrenceIds.includes(occurrenceId)) {
                  disableManualOccurrenceEdit(occurrenceId);
                  return;
                }

                enableManualOccurrenceEdit(occurrenceId);
              }}
            >
              {manualEditableOccurrenceIds.includes(queueMenu.item.recordId) ? "Bloquear resultado" : "Editar resultado"}
            </button>
          ) : null}
          <button
            type="button"
            className="context-menu-item"
            onClick={() => {
              setQueueMenu(null);
              if (queueMenu.item.type === "task") {
                openTaskEditor(queueMenu.item.raw);
                return;
              }

              if (queueMenu.item.type === "routine") {
                openRoutineAssignmentEditor(queueMenu.item.assignment);
                return;
              }

              openHabitEditor(queueMenu.item.habit);
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="context-menu-item"
            onClick={() => {
              setQueueMenu(null);
              void handleDeleteQueueItem(queueMenu.item);
            }}
          >
            Eliminar
          </button>
        </div>
      ) : null}

      {activeSection === "home" && categoryMenu?.option ? (
        <div
          className="habitosView__contextMenu"
          style={{
            position: "fixed",
            top: `${categoryMenu.y}px`,
            left: `${categoryMenu.x}px`,
            zIndex: 1400,
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            type="button"
            className="context-menu-item"
            onClick={() => {
              handleOpenCategoryBuilder({
                id: categoryMenu.option.id,
                name: categoryMenu.option.label,
                iconId: categoryMenu.option.iconId,
                color: categoryMenu.option.color,
              });
            }}
          >
            Editar categoria
          </button>
          <button
            type="button"
            className="context-menu-item"
            onClick={() => {
              void handleDeleteCategory(categoryMenu.option);
            }}
          >
            Eliminar categoria
          </button>
        </div>
      ) : null}

      <FloatingWorkbenchModal
        isVisible={isHabitsDrawerOpen}
        saving={saving}
        layout="drawer"
        onClose={closeHabitsDrawer}
      >
        <SettingsDrawer
          activeTab={settingsTab}
          habits={home.habits}
          selectedHabitId={selectedHabit?.id || ""}
          home={home}
          presetOverrides={presetCategoryOverrides}
          saving={saving}
          onClose={closeHabitsDrawer}
          onChangeTab={setSettingsTab}
          onCreateHabit={() => openHabitEditor()}
          onSelectHabit={setSelectedHabitId}
          onEditHabit={openHabitEditor}
          onToggleHabitStatus={(habit) => void handleToggleHabitStatus(habit)}
          categories={managedCategories}
          selectedCategoryId={selectedCategory?.id || ""}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={handleCreateCategoryFromSettings}
          onEditCategory={handleEditCategoryFromSettings}
          onDeleteCategory={handleDeleteCategoryFromSettings}
          categoryBuilderOpen={categoryBuilderOpen}
          categoryBuilderDraft={categoryBuilderDraft}
          categoryBuilderError={categoryBuilderError}
          onChangeCategoryBuilder={handleChangeCategoryBuilder}
          onSaveCategoryBuilder={() => void handleSaveCategoryBuilder()}
          onCloseCategoryBuilder={handleCloseCategoryBuilder}
        />
      </FloatingWorkbenchModal>

      <FloatingWorkbenchModal
        isVisible={modalMode === "create"}
        onClose={() => {
          closeWorkbench();
        }}
      >
        <CreateChooserModal
          onTask={() => {
            openTaskEditor();
          }}
          onHabit={() => {
            openHabitEditor();
          }}
          onRoutine={() => {
            openRoutineAssignmentEditor();
          }}
          onCancel={() => {
            closeWorkbench();
          }}
        />
      </FloatingWorkbenchModal>

      <FloatingWorkbenchModal
        isVisible={modalMode === "routine-assignment"}
        saving={saving}
        onClose={() => {
          closeWorkbench();
        }}
      >
        <RoutineAssignmentModal
          draft={trainingAssignmentDraft}
          routines={trainingLibrary.routines}
          loading={trainingLibraryLoading}
          error={trainingAssignmentError || trainingLibraryError || error}
          saving={saving}
          onChange={handleTrainingAssignmentDraftChange}
          onToggleWeekday={handleToggleTrainingWeekday}
          onSave={() => void handleSaveRoutineAssignment()}
          onDelete={() => void handleDeleteRoutineAssignment()}
          onCancel={() => closeWorkbench()}
          onOpenTrainingSection={() => {
            closeWorkbench();
            openLifeTrackerSection("training");
          }}
        />
      </FloatingWorkbenchModal>

      <FloatingWorkbenchModal
        isVisible={modalMode === "routine-capture"}
        saving={saving}
        onClose={() => {
          closeWorkbench();
        }}
      >
        <RoutineCaptureModal
          draft={routineCaptureDraft}
          error={routineCaptureError || error}
          saving={saving}
          onChangeStep={handleRoutineCaptureStepChange}
          onSave={() => void handleSaveRoutineCapture()}
          onClear={() => void handleClearRoutineCapture()}
          onCancel={() => closeWorkbench()}
        />
      </FloatingWorkbenchModal>

      <FloatingWorkbenchModal
        isVisible={modalMode === "task"}
        saving={saving}
        onClose={() => {
          closeWorkbench();
        }}
      >
        <TaskEditor
          draft={taskDraft}
          advancedOpen={taskAdvancedOpen}
          saving={saving}
          onChange={handleTaskDraftChange}
          onCommitNumber={handleTaskDraftNumberCommit}
          onSubitemChange={handleTaskSubitemChange}
          onAddSubitem={() => {
            setTaskDraft((currentValue) => ({
              ...currentValue,
              subitems: [
                ...currentValue.subitems,
                {
                  id: "",
                  title: "",
                  isCompleted: false,
                },
              ],
            }));
          }}
          onRemoveSubitem={(index) => {
            setTaskDraft((currentValue) => ({
              ...currentValue,
              subitems: currentValue.subitems.filter((_, entryIndex) => entryIndex !== index),
            }));
          }}
          onToggleAdvanced={() => setTaskAdvancedOpen((currentValue) => !currentValue)}
          onSubmit={handleTaskSubmit}
          onCancel={() => closeWorkbench()}
        />
      </FloatingWorkbenchModal>

      <FloatingWorkbenchModal
        isVisible={modalMode === "habit"}
        saving={saving}
        onClose={() => {
          closeWorkbench();
        }}
      >
        <HabitEditor
          draft={habitDraft}
          categories={home.categoryCatalog}
          presetOverrides={presetCategoryOverrides}
          step={habitStep}
          saving={saving}
          wizardError={habitWizardError}
          categoryBuilderOpen={categoryBuilderOpen}
          categoryBuilderDraft={categoryBuilderDraft}
          categoryBuilderError={categoryBuilderError}
          onChange={handleHabitDraftChange}
          onSelectExistingCategory={handleSelectExistingHabitCategory}
          onOpenCategoryBuilder={handleOpenCategoryBuilder}
          onCloseCategoryBuilder={handleCloseCategoryBuilder}
          onChangeCategoryBuilder={handleChangeCategoryBuilder}
          onSaveCategoryBuilder={() => void handleSaveCategoryBuilder()}
          onOpenCategoryMenu={handleOpenCategoryMenu}
          onCommitNumber={handleHabitDraftNumberCommit}
          onSelectCategory={handleSelectHabitCategory}
          onSelectProgressMode={handleSelectHabitProgressMode}
          onToggleWeekday={(weekday) => {
            setHabitDraft((currentValue) => {
              const exists = currentValue.weekdays.includes(weekday);
              return {
                ...currentValue,
                weekdays: exists
                  ? currentValue.weekdays.filter((entry) => entry !== weekday)
                  : [...currentValue.weekdays, weekday].sort((left, right) => left - right),
              };
            });
          }}
          onBack={() => {
            setHabitWizardError("");
            setHabitStep((currentValue) => Math.max(0, currentValue - 1));
          }}
          onNext={() => void handleHabitSubmit({ preventDefault() {} })}
          onSubmit={handleHabitSubmit}
          onCancel={() => closeWorkbench()}
        />
      </FloatingWorkbenchModal>
    </WorkspacePage>
  );
}
