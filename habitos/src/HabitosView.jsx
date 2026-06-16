const React = window.React;
const {
  startTransition,
  useEffect,
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
  DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
  DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
  HABIT_CATEGORY_PRESETS,
  HABIT_EDIT_WIZARD_STEPS,
  HABIT_PROGRESS_OPTIONS,
  HABIT_QUANTITY_MODE_OPTIONS,
  HABIT_WIZARD_STEPS,
  WEEKDAY_OPTIONS,
} from "./constants.js";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
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

function hashValue(input = "") {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getQueueAccent(item) {
  const base = `${item.category || item.type || "item"}:${item.title || ""}`;
  const hue = hashValue(base) % 360;

  return {
    color: `hsl(${hue} 68% 58%)`,
    label: (item.category || (item.type === "habit" ? "Habito" : "Tarea")).slice(0, 1).toUpperCase(),
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

function HabitOutcomePanel({ chart }) {
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
    <SectionPanel className="habitosView__trendPanel">
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
        <PanelTitle title="Evolucion de habitos" />
      </PanelHeader>
      <HabitOutcomeLineChart chartData={selectedChart} rangeValue={rangeValue} />
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
  const accent = getQueueAccent(item);
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
        <span>{accent.label}</span>
      </div>

      <div className="habitosView__queueCopy">
        <strong>{item.title}</strong>
      </div>

      <div className="habitosView__queueActions">
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
      </div>

      <div className="habitosView__editorActions">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </SectionPanel>
  );
}

function buildHabitCategoryOptions(customCategories = [], selectedCategory = "") {
  const nextOptions = HABIT_CATEGORY_PRESETS.map((entry) => ({
    ...entry,
    kind: "preset",
  }));
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
    >
      <span
        className="habitosView__categoryOptionIcon"
        style={isCreate ? undefined : { background: color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR }}
        aria-hidden="true"
      >
        <RemoteCategoryIcon iconId={iconId} size="xl" />
      </span>
      <strong>{title}</strong>
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
}) {
  const categoryOptions = buildHabitCategoryOptions(categories, selectedCategory);

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

function SecondaryListCard({ title, items, renderItem, emptyTitle = "Sin elementos." }) {
  return (
    <SectionPanel>
      <PanelHeader>
        <PanelTitle title={title} />
      </PanelHeader>

      {items.length ? (
        <div className="habitosView__secondaryList">
          {items.map(renderItem)}
        </div>
      ) : (
        <StateBlock title={emptyTitle} />
      )}
    </SectionPanel>
  );
}

function HabitListItem({
  habit,
  isSelected = false,
  onSelect,
}) {
  const accent = getQueueAccent({
    type: "habit",
    title: habit.title,
    category: habit.category,
  });
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
        <span>{accent.label}</span>
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
  saving,
  onEdit,
  onToggleStatus,
}) {
  const latestHistoryEntry = getLatestHabitHistoryEntry(home, habit.id);
  const todaySummary = getHabitTodaySummary(home, habit);
  const progressOption = getHabitProgressOption(habit.progressMode);
  const checklistItems = getHabitChecklistItemsValue(habit);
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

          <FieldGrid className="habitosView__habitMetaGrid">
            {detailItems.map((item) => (
              <div key={item.label} className="habitosView__detailCard">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </FieldGrid>
        </SectionPanel>

        <SectionPanel tone="soft">
          <PanelHeader>
            <PanelTitle title="Evaluacion" />
          </PanelHeader>

          <FieldGrid className="habitosView__habitMetaGrid">
            <div className="habitosView__detailCard">
              <span>Tipo</span>
              <strong>{getHabitProgressLabel(habit)}</strong>
              {progressOption?.description ? (
                <small>{progressOption.description}</small>
              ) : null}
            </div>

            {habit.progressMode === "quantity" ? (
              <div className="habitosView__detailCard">
                <span>Objetivo</span>
                <strong>{getHabitQuantitySummary(habit)}</strong>
              </div>
            ) : null}

            {habit.progressMode === "checklist" ? (
              <div className="habitosView__detailCard">
                <span>Sub-items</span>
                {checklistItems.length ? (
                  <ul className="habitosView__detailList">
                    {checklistItems.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                ) : (
                  <small>Sin sub-items definidos.</small>
                )}
              </div>
            ) : null}
          </FieldGrid>
        </SectionPanel>

        <SectionPanel tone="soft">
          <PanelHeader>
            <PanelTitle title="Actividad" />
          </PanelHeader>

          <FieldGrid className="habitosView__habitMetaGrid">
            <div className="habitosView__detailCard">
              <span>Dia visible</span>
              <strong>{todaySummary}</strong>
            </div>

            <div className="habitosView__detailCard">
              <span>Ultimo registro</span>
              <strong>{latestHistoryEntry ? latestHistoryEntry.statusLabel : "Sin actividad reciente"}</strong>
              {latestHistoryEntry ? (
                <small>
                  {formatLocalDateTime(latestHistoryEntry.timestamp)}
                  {" - "}
                  {latestHistoryEntry.summary}
                </small>
              ) : null}
            </div>
          </FieldGrid>
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

function HabitsDrawer({
  habits,
  selectedHabitId,
  home,
  saving,
  onClose,
  onCreateHabit,
  onSelectHabit,
  onEditHabit,
  onToggleHabitStatus,
}) {
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const pausedHabits = habits.filter((habit) => habit.status !== "active");
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) || null;

  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel habitosView__drawerPanel">
      <PanelHeader
        actions={(
          <div className="habitosView__drawerHeaderActions">
            <Button type="button" tone="primary" onClick={onCreateHabit} disabled={saving}>
              Nuevo habito
            </Button>
            <Button type="button" onClick={onClose} disabled={saving}>
              Cerrar
            </Button>
          </div>
        )}
      >
        <PanelTitle
          title="Habitos"
          description="Gestion lateral de rutinas activas y pausadas."
        />
      </PanelHeader>

      <div className="habitosView__drawerBody">
        <SplitLayout variant="sidebar-detail" className="habitosView__habitSplit">
          <SplitSidebar className="habitosView__habitSidebar">
            <ScrollRegion className="habitosView__habitSidebarScroll">
              {habits.length ? (
                <PanelStack className="habitosView__habitSidebarStack">
                  <HabitsGroup
                    title="Activos"
                    habits={activeHabits}
                    selectedHabitId={selectedHabitId}
                    onSelectHabit={onSelectHabit}
                    emptyTitle="Sin habitos activos."
                  />

                  <HabitsGroup
                    title="En pausa"
                    habits={pausedHabits}
                    selectedHabitId={selectedHabitId}
                    onSelectHabit={onSelectHabit}
                    emptyTitle="Sin habitos en pausa."
                  />
                </PanelStack>
              ) : (
                <StateBlock
                  title="Todavia no hay habitos."
                  description="Puedes crear uno nuevo y luego gestionarlo desde aqui."
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
            <DraftNumberInput
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
  onSelectCategory,
  onSelectProgressMode,
  onToggleWeekday,
  onBack,
  onNext,
  onCommitNumber,
  onSubmit,
  onCancel,
}) {
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
                <DraftNumberInput
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
        <PanelTitle
          title="Nuevo habito"
          description="Configura el habito, define como evaluarlo y guardalo en tu cola diaria."
        />
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
          />
        ) : null}

        {step === 1 ? (
          <div className="habitosView__wizardStep">
            <div className="habitosView__sectionIntro">
              <strong>Como quieres evaluar tu progreso?</strong>
              <span>Este paso define el camino que seguira el wizard para tu habito.</span>
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
                      <div key={item.id || index} className="habitosView__subitemDraftRow">
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
                      Nuevo item
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
              <strong>Con que frecuencia quieres realizarlo?</strong>
              <span>Define si el habito corre todos los dias o solo en dias elegidos.</span>
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
            ) : (
              <Notice tone="info">
                Se genera una ocurrencia por dia.
              </Notice>
            )}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="habitosView__wizardStep">
            <div className="habitosView__sectionIntro">
              <strong>Cuando quieres hacerlo?</strong>
              <span>Define fechas, prioridad y la capa operativa que todavia queda pendiente.</span>
            </div>

            <FieldGrid>
              <Field
                label="Fecha de inicio"
                description={draft.startDate === todayLocalDate() ? "Hoy" : ""}
              >
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(event) => onChange("startDate", event.target.value)}
                />
              </Field>

              <div className="habitosView__booleanGrid">
                <label className="habitosView__booleanField">
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

            <Notice tone="info">
              Hora y recordatorios aun sin soporte.
            </Notice>

            <FieldGrid>
              <Field
                label="Prioridad"
                description="Del 1 al 100. A mayor valor, mas importante es."
              >
                <DraftNumberInput
                  min="1"
                  max="100"
                  step="1"
                  value={draft.priority}
                  onChange={(value) => onChange("priority", value)}
                  onCommit={(value) => onCommitNumber("priority", value)}
                />
              </Field>

              <div className="habitosView__detailCard">
                <span>Frecuencia actual</span>
                <strong>{getCreationFrequencySummary(draft)}</strong>
              </div>
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

export default function HabitosView({ ctx }) {
  const systemToday = todayLocalDate();
  const [home, setHome] = useState(createEmptyHome);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState("overview");
  const [isHabitsDrawerOpen, setIsHabitsDrawerOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [taskDraft, setTaskDraft] = useState(createTaskDraft());
  const [habitDraft, setHabitDraft] = useState(createHabitDraft());
  const [habitWizardError, setHabitWizardError] = useState("");
  const [categoryBuilderOpen, setCategoryBuilderOpen] = useState(false);
  const [categoryBuilderDraft, setCategoryBuilderDraft] = useState(createHabitCategoryDraft());
  const [categoryBuilderError, setCategoryBuilderError] = useState("");
  const [taskAdvancedOpen, setTaskAdvancedOpen] = useState(false);
  const [habitStep, setHabitStep] = useState(0);
  const [queueMenu, setQueueMenu] = useState(null);
  const [expandedChecklistIds, setExpandedChecklistIds] = useState([]);
  const [manualEditableOccurrenceIds, setManualEditableOccurrenceIds] = useState([]);
  const [viewDate, setViewDate] = useState(systemToday);
  const viewDatePickerRef = useRef(null);

  useEffect(() => {
    if (!queueMenu) {
      return undefined;
    }

    const handlePointerDown = () => {
      setQueueMenu(null);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setQueueMenu(null);
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
  }, [queueMenu]);

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
      const nextHome = await invoke("habitos:get-home", {
        date: requestedDate,
      });
      startTransition(() => {
        setHome(nextHome || createEmptyHome());
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Habitos y tareas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHome(viewDate);
  }, [viewDate]);

  const openTaskEditor = (source = null) => {
    setQueueMenu(null);
    setTaskDraft(createTaskDraft(source));
    setTaskAdvancedOpen(Boolean(source?.notes || source?.time || source?.reminderAt || source?.subitems?.length));
    setModalMode("task");
  };

  const openHabitEditor = (source = null) => {
    setQueueMenu(null);
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
    setModalMode("create");
  };

  const openHabitsDrawer = () => {
    setQueueMenu(null);
    setSelectedHabitId((currentValue) => (
      home.habits.some((habit) => habit.id === currentValue)
        ? currentValue
        : getDefaultHabitId(home.habits)
    ));
    setIsHabitsDrawerOpen(true);
  };

  const closeHabitsDrawer = () => {
    setIsHabitsDrawerOpen(false);
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

  const handleOpenCategoryBuilder = () => {
    setCategoryBuilderError("");
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderOpen(true);
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
    setHabitDraft((currentValue) => ({
      ...currentValue,
      category: value,
    }));
  };

  const handleSaveCategoryBuilder = async () => {
    const normalizedName = normalizeCategoryNameValue(categoryBuilderDraft.name);
    const knownCategoryNames = new Set([
      ...HABIT_CATEGORY_PRESETS.map((entry) => normalizeCategoryNameValue(entry.value)),
      ...home.categoryCatalog.map((entry) => normalizeCategoryNameValue(entry.name)),
    ]);

    if (!normalizedName) {
      setCategoryBuilderError("El nombre de la categoria es obligatorio.");
      return;
    }

    if (knownCategoryNames.has(normalizedName)) {
      setCategoryBuilderError("Ya existe una categoria con ese nombre.");
      return;
    }

    setCategoryBuilderError("");

    await runMutation(
      "habitos:save-category",
      {
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
            (entry) => normalizeCategoryNameValue(entry.name) === normalizedName,
          );
          const nextCategoryName = savedCategory?.name || String(categoryBuilderDraft.name || "").trim();

          setHabitDraft((currentValue) => ({
            ...currentValue,
            category: nextCategoryName,
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
      "habitos:save-task",
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

    if (habitStep < HABIT_WIZARD_STEPS.length - 1) {
      if (!habitDraft.id && habitStep === 0 && !habitDraft.category) {
        setHabitWizardError("Elige una categoria para seguir.");
        return;
      }

      if (!habitDraft.id && habitStep === 1 && !habitDraft.progressMode) {
        setHabitWizardError("Elige como quieres evaluar tu progreso.");
        return;
      }

      if (!habitDraft.id && habitStep === 2) {
        const title = String(habitDraft.title || "").trim();

        if (!title) {
          setHabitWizardError("El nombre del habito es obligatorio.");
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

      if (!habitDraft.id && habitStep === 3) {
        if (habitDraft.scheduleType === "weekdays" && !habitDraft.weekdays.length) {
          setHabitWizardError("Elige al menos un dia de la semana.");
          return;
        }
      }

      setHabitWizardError("");
      setHabitStep((currentValue) => currentValue + 1);
      return;
    }

    const nextHabitId = habitDraft.id || createDraftId("habit");
    const payload = buildHabitPayload(habitDraft, {
      id: nextHabitId,
    });

    await runMutation(
      "habitos:save-habit",
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

      await runMutation("habitos:toggle-task", {
        taskId: item.recordId,
      });
      return;
    }

    if (!canEditOccurrenceResult(item)) {
      return;
    }

    await runMutation("habitos:toggle-occurrence", {
      occurrenceId: item.recordId,
    });
  };

  const handleCommitOccurrenceQuantity = async (item, value) => {
    if (!canEditOccurrenceResult(item)) {
      return;
    }

    await runMutation("habitos:set-occurrence-quantity", {
      occurrenceId: item.recordId,
      value,
    });
  };

  const handleToggleOccurrenceChecklistItem = async (item, itemId) => {
    if (!canEditOccurrenceResult(item)) {
      return;
    }

    await runMutation("habitos:toggle-occurrence-checklist-item", {
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

  const canEditOccurrenceResult = (item) => {
    if (!item || item.type !== "habit" || item.isProjected) {
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
      await runMutation("habitos:delete-task", {
        taskId: item.raw?.id || item.recordId,
      });
      return;
    }

    await runMutation("habitos:delete-habit", {
      habitId: item.habit?.id,
    });
  };

  const handleToggleHabitStatus = async (habit) => {
    setSelectedHabitId(habit.id);
    await runMutation(
      "habitos:save-habit",
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
    setQueueMenu({
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const selectedHabit = home.habits.find((habit) => habit.id === selectedHabitId) || null;

  return (
    <WorkspacePage className="habitosView">
      <WorkspaceBody>
        <ScrollRegion className="habitosView__mainScroll">
          <PanelStack>
            {error ? (
              <Notice tone="danger">
                {error}
              </Notice>
            ) : null}

            <SectionPanel>
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

                    <Button type="button" onClick={openHabitsDrawer}>
                      Habitos
                    </Button>
                    <IconButton type="button" tone="primary" aria-label="Crear nuevo" onClick={openCreateChooser}>
                      <PlusIcon />
                    </IconButton>
                  </div>
                )}
              >
                <PanelTitle
                  title={isPastView ? "Historial del dia" : isFutureView ? "Plan del dia" : "Panel del dia"}
                  description={isPastView
                    ? "Resultados cerrados por fecha. Usa click derecho para habilitar edicion manual del resultado."
                    : isFutureView
                      ? "Vista previa de tareas y ocurrencias previstas para esa fecha."
                      : undefined}
                />
              </PanelHeader>

              {loading ? (
                <StateBlock title="Cargando..." />
              ) : home.dailyQueue.length ? (
                <div className="habitosView__queueList">
                  {home.dailyQueue.map((item) => (
                    <QueueItemCard
                      key={item.id}
                      item={item}
                      isSelected={queueMenu?.item?.id === item.id}
                      saving={saving}
                      resultEditable={item.type === "task" ? viewDate === actualToday : canEditOccurrenceResult(item)}
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
                <StateBlock title={isPastView ? "No hay historial para esta fecha." : isFutureView ? "No hay actividad prevista para esta fecha." : "No hay actividad para hoy."} />
              )}
            </SectionPanel>

            <HabitOutcomePanel chart={home.habitOutcomeChart} />

            {viewDate === actualToday ? (
              <SecondaryListCard
                title="Tareas proximas"
                items={home.upcomingTasks}
                emptyTitle="Sin tareas proximas."
                renderItem={renderSecondaryTask}
              />
            ) : null}
          </PanelStack>
        </ScrollRegion>
      </WorkspaceBody>

      {queueMenu?.item ? (
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

      <FloatingWorkbenchModal
        isVisible={isHabitsDrawerOpen}
        saving={saving}
        layout="drawer"
        onClose={closeHabitsDrawer}
      >
        <HabitsDrawer
          habits={home.habits}
          selectedHabitId={selectedHabit?.id || ""}
          home={home}
          saving={saving}
          onClose={closeHabitsDrawer}
          onCreateHabit={() => openHabitEditor()}
          onSelectHabit={setSelectedHabitId}
          onEditHabit={openHabitEditor}
          onToggleHabitStatus={(habit) => void handleToggleHabitStatus(habit)}
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
          onCancel={() => {
            closeWorkbench();
          }}
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
