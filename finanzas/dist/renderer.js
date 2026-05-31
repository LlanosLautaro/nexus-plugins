const React = window.React;

// ../nexus-plugins/finanzas/src/constants.js
var FINANCE_PLUGIN_ID = "nexus.finanzas";
var FINANCE_DASHBOARD_VIEW_ID = "nexus.finanzas.dashboard";
var FINANCE_CASH_DENOMINATIONS = [50, 100, 200, 500, 1e3, 2e3, 1e4, 2e4];
var FINANCE_PRESETS = [
  {
    id: "expense-posted",
    kind: "expense",
    status: "posted",
    label: "Gasto realizado",
    shortLabel: "Gasto real"
  },
  {
    id: "expense-planned",
    kind: "expense",
    status: "planned",
    label: "Gasto pendiente",
    shortLabel: "Gasto pendiente"
  },
  {
    id: "income-posted",
    kind: "income",
    status: "posted",
    label: "Ingreso realizado",
    shortLabel: "Ingreso real"
  },
  {
    id: "income-planned",
    kind: "income",
    status: "planned",
    label: "Ingreso pendiente",
    shortLabel: "Ingreso pendiente"
  }
];
var FINANCE_PERIOD_FILTERS = [
  { value: "all", label: "Todo" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "365d", label: "12 meses" }
];

// ../nexus-plugins/finanzas/src/icons.jsx
var React2 = window.React;
function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React2.createElement(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    children
  );
}
function WalletIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4.75 8.25a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M16.5 12h2.75v2.5H16.5a1.25 1.25 0 0 1 0-2.5Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M7.5 6.25V5.5a1.75 1.75 0 0 1 1.75-1.75H17" }));
}
function RefreshIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M20 6v5h-5" }), /* @__PURE__ */ React2.createElement("path", { d: "M4 18v-5h5" }), /* @__PURE__ */ React2.createElement("path", { d: "M18 11a7 7 0 0 0-12-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 13a7 7 0 0 0 12 3" }));
}
function PencilIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" }), /* @__PURE__ */ React2.createElement("path", { d: "m13 7 4 4" }));
}
function TrashIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4.5 7.5h15" }), /* @__PURE__ */ React2.createElement("path", { d: "M9.5 7.5V5.75A1.75 1.75 0 0 1 11.25 4h1.5a1.75 1.75 0 0 1 1.75 1.75V7.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 7.5 8 19a1.5 1.5 0 0 0 1.49 1.37h5.02A1.5 1.5 0 0 0 16 19l1-11.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 11v5" }), /* @__PURE__ */ React2.createElement("path", { d: "M14 11v5" }));
}
function ArrowInIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 18V6" }), /* @__PURE__ */ React2.createElement("path", { d: "m7.5 10.5 4.5-4.5 4.5 4.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M5 19.25h14" }));
}
function ArrowOutIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 6v12" }), /* @__PURE__ */ React2.createElement("path", { d: "m16.5 13.5-4.5 4.5-4.5-4.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M5 4.75h14" }));
}

// ../nexus-frontend/src/ui/cx.js
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// ../nexus-frontend/src/ui/WorkspacePage.jsx
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceTopbar({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-topbar", className) }, children);
}
function WorkspaceTitle({
  className = "",
  eyebrow = "",
  title = "",
  description = "",
  aside = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-title", className) }, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-title__copy" }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null), aside ? /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-title__aside" }, aside) : null);
}
function ToolbarActions({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-toolbar-actions", className) }, children);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}
function SplitLayout({ className = "", variant = "main-aside", children }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cx(
        "nexus-ui-split",
        variant === "sidebar-detail" ? "nexus-ui-split--sidebar-detail" : "nexus-ui-split--main-aside",
        className
      )
    },
    children
  );
}
function SplitMain({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-split__main", className) }, children);
}
function SplitAside({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("aside", { className: cx("nexus-ui-split__aside", className) }, children);
}
function ScrollRegion({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-scroll-region", className) }, children);
}

// ../nexus-frontend/src/ui/SectionPanel.jsx
function SectionPanel({
  className = "",
  tone = "default",
  padding = "default",
  children
}) {
  return /* @__PURE__ */ React.createElement(
    "section",
    {
      className: cx(
        "nexus-ui-panel",
        tone !== "default" && `nexus-ui-panel--${tone}`,
        padding !== "default" && `nexus-ui-panel--padding-${padding}`,
        className
      )
    },
    children
  );
}
function PanelHeader({ className = "", children, actions = null }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-panel-header", className) }, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-panel-header__copy" }, children), actions ? /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-panel-header__actions" }, actions) : null);
}
function PanelTitle({ eyebrow = "", title = "", description = "" }) {
  return /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-panel-title" }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null);
}
function PanelStack({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-stack", className) }, children);
}

// ../nexus-frontend/src/ui/Actions.jsx
function Button({
  className = "",
  tone = "secondary",
  iconOnly = false,
  children,
  ...props
}) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...props,
      className: cx(
        "nexus-ui-button",
        tone !== "secondary" && `nexus-ui-button--${tone}`,
        iconOnly && "nexus-ui-button--icon",
        className
      )
    },
    children
  );
}
function IconButton({ className = "", tone = "secondary", title = "", children, ...props }) {
  return /* @__PURE__ */ React.createElement(
    Button,
    {
      ...props,
      className,
      tone,
      iconOnly: true,
      title,
      "aria-label": props["aria-label"] || title || void 0
    },
    children
  );
}
function SegmentedControl({
  className = "",
  options = [],
  value,
  onChange,
  ariaLabel = "Selector"
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-segmented", className), role: "tablist", "aria-label": ariaLabel }, options.map((option) => {
    const optionValue = option.value;
    const active = optionValue === value;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: optionValue,
        type: "button",
        role: "tab",
        "aria-selected": active,
        className: cx("nexus-ui-segmented__button", active && "is-active"),
        onClick: () => onChange?.(optionValue)
      },
      option.icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__icon" }, option.icon) : null,
      /* @__PURE__ */ React.createElement("span", null, option.label)
    );
  }));
}

// ../nexus-frontend/src/ui/Fields.jsx
function Field({
  className = "",
  label = "",
  description = "",
  wide = false,
  children
}) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-field", wide && "nexus-ui-field--wide", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__label" }, label), description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__description" }, description) : null, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-field__control" }, children));
}
function InlineField({
  className = "",
  label = "",
  children,
  grow = false
}) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-inline-field", grow && "nexus-ui-inline-field--grow", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-inline-field__label" }, label), /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-inline-field__control" }, children));
}
function FieldGrid({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-field-grid", className) }, children);
}

// ../nexus-frontend/src/ui/States.jsx
function Notice({ className = "", tone = "info", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-notice", `nexus-ui-notice--${tone}`, className) }, children);
}
function StateBlock({
  className = "",
  tone = "default",
  eyebrow = "",
  title = "",
  description = "",
  centered = false,
  children = null
}) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cx(
        "nexus-ui-state",
        tone !== "default" && `nexus-ui-state--${tone}`,
        centered && "nexus-ui-state--centered",
        className
      )
    },
    eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null,
    title ? /* @__PURE__ */ React.createElement("strong", null, title) : null,
    description ? /* @__PURE__ */ React.createElement("p", null, description) : null,
    children
  );
}
function MetricCard({
  className = "",
  tone = "default",
  eyebrow = "",
  value = "",
  description = "",
  children = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-metric", tone !== "default" && `nexus-ui-metric--${tone}`, className) }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, /* @__PURE__ */ React.createElement("strong", null, value), description ? /* @__PURE__ */ React.createElement("p", null, description) : null, children);
}

// ../nexus-plugins/finanzas/src/PersonalFinanceView.jsx
var {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} = window.React;
var { ipcRenderer } = window.require("electron");
var CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
var LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium"
});
var DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short"
});
var MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  year: "2-digit"
});
var FINANCE_WORKBENCH_TABS = [
  { value: "compose", label: "Registrar" },
  { value: "cash", label: "Efectivo" },
  { value: "reports", label: "Reportes" }
];
function todayLocalDate() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function buildEmptyFormState(presetId = "expense-posted") {
  const preset = FINANCE_PRESETS.find((entry) => entry.id === presetId) || FINANCE_PRESETS[0];
  return {
    id: "",
    presetId: preset.id,
    kind: preset.kind,
    status: preset.status,
    title: "",
    amount: "",
    movementDate: todayLocalDate(),
    category: "",
    platform: "",
    counterparty: "",
    notes: ""
  };
}
function buildFormStateFromMovement(movement) {
  const preset = FINANCE_PRESETS.find(
    (entry) => entry.kind === movement?.kind && entry.status === movement?.status
  ) || FINANCE_PRESETS[0];
  return {
    id: movement?.id || "",
    presetId: preset.id,
    kind: preset.kind,
    status: preset.status,
    title: movement?.title || "",
    amount: Number.isFinite(Number(movement?.amountCents)) ? (Number(movement.amountCents) / 100).toFixed(2) : "",
    movementDate: movement?.movementDate || todayLocalDate(),
    category: movement?.category || "",
    platform: movement?.platform || "",
    counterparty: movement?.counterparty || "",
    notes: movement?.notes || ""
  };
}
function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getSignedAmountCents(movement) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}
function formatCurrency(cents) {
  return CURRENCY_FORMATTER.format((Number(cents) || 0) / 100);
}
function formatSignedCurrency(cents) {
  const absoluteValue = formatCurrency(Math.abs(Number(cents) || 0));
  return `${Number(cents) < 0 ? "-" : "+"}${absoluteValue}`;
}
function formatDateLabel(value) {
  if (!value) {
    return "Sin fecha";
  }
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : LONG_DATE_FORMATTER.format(date);
}
function formatMonthLabel(value) {
  const date = /* @__PURE__ */ new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : MONTH_FORMATTER.format(date);
}
function formatDateTimeLabel(value) {
  if (!value) {
    return "Sin registro";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_TIME_FORMATTER.format(date);
}
function formatDenominationLabel(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}
function getPresetById(presetId) {
  return FINANCE_PRESETS.find((entry) => entry.id === presetId) || FINANCE_PRESETS[0];
}
function getMovementStatusLabel(status) {
  return status === "planned" ? "Pendiente" : "Realizado";
}
function getMovementKindLabel(kind) {
  return kind === "income" ? "Ingreso" : "Gasto";
}
function buildCashCountFormState(denominations, sourceCounts = {}) {
  return Object.fromEntries(
    denominations.map((denomination) => [
      String(denomination),
      String(sourceCounts?.[String(denomination)] ?? "")
    ])
  );
}
function normalizeCashCountValue(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(0, Math.round(numericValue));
}
function calculateCashCountTotalCents(denominations, counts) {
  return denominations.reduce((total, denomination) => {
    return total + 100 * normalizeCashCountValue(counts?.[String(denomination)]);
  }, 0);
}
function compareMovementsByDate(left, right) {
  const leftKey = `${left?.movementDate || ""}:${left?.updatedAt || ""}:${left?.createdAt || ""}`;
  const rightKey = `${right?.movementDate || ""}:${right?.updatedAt || ""}:${right?.createdAt || ""}`;
  return leftKey.localeCompare(rightKey);
}
function resolvePeriodStart(period) {
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  if (period === "30d") {
    now.setDate(now.getDate() - 29);
    return now;
  }
  if (period === "90d") {
    now.setDate(now.getDate() - 89);
    return now;
  }
  if (period === "365d") {
    now.setDate(now.getDate() - 364);
    return now;
  }
  return null;
}
function isMovementAfterStart(movement, startDate) {
  if (!startDate) {
    return true;
  }
  const movementDate = /* @__PURE__ */ new Date(`${movement?.movementDate || ""}T00:00:00`);
  if (Number.isNaN(movementDate.getTime())) {
    return false;
  }
  return movementDate >= startDate;
}
function calculatePortfolioSummary(movements) {
  let actualBalanceCents = 0;
  let projectedBalanceCents = 0;
  let plannedExpenseCents = 0;
  let plannedIncomeCents = 0;
  for (const movement of movements) {
    const signedAmount = getSignedAmountCents(movement);
    if (movement?.status === "posted") {
      actualBalanceCents += signedAmount;
      projectedBalanceCents += signedAmount;
      continue;
    }
    projectedBalanceCents += signedAmount;
    if (movement?.kind === "expense") {
      plannedExpenseCents += Math.abs(signedAmount);
    } else {
      plannedIncomeCents += Math.abs(signedAmount);
    }
  }
  return {
    actualBalanceCents,
    projectedBalanceCents,
    plannedExpenseCents,
    plannedIncomeCents
  };
}
function buildTimelineSeries(movements, period) {
  const startDate = resolvePeriodStart(period);
  const sortedMovements = [...movements].sort(compareMovementsByDate);
  const groupedByDate = /* @__PURE__ */ new Map();
  let actualSeed = 0;
  let projectedSeed = 0;
  for (const movement of sortedMovements) {
    const signedAmount = getSignedAmountCents(movement);
    const isPosted = movement?.status === "posted";
    if (!isMovementAfterStart(movement, startDate)) {
      projectedSeed += signedAmount;
      if (isPosted) {
        actualSeed += signedAmount;
      }
      continue;
    }
    const dateKey = String(movement?.movementDate || "");
    const bucket = groupedByDate.get(dateKey) || {
      actualDelta: 0,
      projectedDelta: 0
    };
    bucket.projectedDelta += signedAmount;
    if (isPosted) {
      bucket.actualDelta += signedAmount;
    }
    groupedByDate.set(dateKey, bucket);
  }
  let actualRunningBalance = actualSeed;
  let projectedRunningBalance = projectedSeed;
  const points = [...groupedByDate.entries()].map(([dateKey, bucket]) => {
    actualRunningBalance += bucket.actualDelta;
    projectedRunningBalance += bucket.projectedDelta;
    return {
      date: dateKey,
      actualBalanceCents: actualRunningBalance,
      projectedBalanceCents: projectedRunningBalance
    };
  });
  return {
    points,
    actualSeed,
    projectedSeed
  };
}
function buildMonthlyFlowRows(movements, period) {
  const startDate = resolvePeriodStart(period);
  const buckets = /* @__PURE__ */ new Map();
  for (const movement of movements) {
    if (!isMovementAfterStart(movement, startDate)) {
      continue;
    }
    const movementDate = String(movement?.movementDate || "");
    const monthKey = movementDate.slice(0, 7);
    if (!monthKey) {
      continue;
    }
    const bucket = buckets.get(monthKey) || {
      monthKey,
      postedIncomeCents: 0,
      plannedIncomeCents: 0,
      postedExpenseCents: 0,
      plannedExpenseCents: 0
    };
    const amountCents = Math.max(0, Number(movement?.amountCents || 0));
    if (movement?.kind === "income") {
      if (movement?.status === "posted") {
        bucket.postedIncomeCents += amountCents;
      } else {
        bucket.plannedIncomeCents += amountCents;
      }
    } else if (movement?.status === "posted") {
      bucket.postedExpenseCents += amountCents;
    } else {
      bucket.plannedExpenseCents += amountCents;
    }
    buckets.set(monthKey, bucket);
  }
  const rows = [...buckets.values()].sort(
    (left, right) => String(left.monthKey).localeCompare(String(right.monthKey))
  );
  const maxValue = rows.reduce((highest, row) => {
    return Math.max(
      highest,
      row.postedIncomeCents + row.plannedIncomeCents,
      row.postedExpenseCents + row.plannedExpenseCents
    );
  }, 0);
  return {
    rows,
    maxValue
  };
}
function buildLinePath(points, valueKey, chartWidth, chartHeight, minValue, maxValue) {
  if (!points.length) {
    return "";
  }
  const safeRange = Math.max(1, maxValue - minValue);
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;
  return points.map((point, index) => {
    const x = points.length > 1 ? index * stepX : chartWidth / 2;
    const y = chartHeight - (Number(point?.[valueKey] || 0) - minValue) / safeRange * chartHeight;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}
function BalanceTimelineChart({ points }) {
  if (!points.length) {
    return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__emptyChart" }, "Sin movimientos para graficar en este rango.");
  }
  const allValues = points.flatMap((point) => [
    Number(point.actualBalanceCents || 0),
    Number(point.projectedBalanceCents || 0)
  ]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const chartWidth = 100;
  const chartHeight = 58;
  const actualPath = buildLinePath(points, "actualBalanceCents", chartWidth, chartHeight, minValue, maxValue);
  const projectedPath = buildLinePath(
    points,
    "projectedBalanceCents",
    chartWidth,
    chartHeight,
    minValue,
    maxValue
  );
  const zeroY = chartHeight - (0 - minValue) / Math.max(1, maxValue - minValue) * chartHeight;
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__timeline" }, /* @__PURE__ */ React.createElement(
    "svg",
    {
      className: "financeDashboard__timelineSvg",
      viewBox: `0 0 ${chartWidth} ${chartHeight}`,
      preserveAspectRatio: "none",
      role: "img",
      "aria-label": "Evolucion del balance actual y proyectado"
    },
    /* @__PURE__ */ React.createElement(
      "line",
      {
        x1: "0",
        y1: zeroY.toFixed(2),
        x2: chartWidth,
        y2: zeroY.toFixed(2),
        className: "financeDashboard__timelineAxis"
      }
    ),
    /* @__PURE__ */ React.createElement("path", { d: projectedPath, className: "financeDashboard__timelineProjected" }),
    /* @__PURE__ */ React.createElement("path", { d: actualPath, className: "financeDashboard__timelineActual" })
  ), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__timelineLegend" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "financeDashboard__legendSwatch financeDashboard__legendSwatch--actual" }), "Actual"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "financeDashboard__legendSwatch financeDashboard__legendSwatch--projected" }), "Proyectado")), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__timelineTicks" }, /* @__PURE__ */ React.createElement("span", null, formatDateLabel(points[0]?.date)), /* @__PURE__ */ React.createElement("span", null, formatDateLabel(points.at(-1)?.date))));
}
function MonthlyFlowChart({ rows, maxValue }) {
  if (!rows.length || !maxValue) {
    return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__emptyChart" }, "Aun no hay flujo suficiente para este rango.");
  }
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowRows" }, rows.map((row) => {
    const incomeTotal = row.postedIncomeCents + row.plannedIncomeCents;
    const expenseTotal = row.postedExpenseCents + row.plannedExpenseCents;
    return /* @__PURE__ */ React.createElement("div", { key: row.monthKey, className: "financeDashboard__flowRow" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowMonth" }, formatMonthLabel(row.monthKey)), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowMetric" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowLabel" }, "Ingresos"), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowTrack" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--income",
        style: {
          width: `${Math.max(0, row.postedIncomeCents) / maxValue * 100}%`
        }
      }
    ), row.plannedIncomeCents > 0 ? /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--incomePlanned",
        style: {
          width: `${Math.max(0, incomeTotal) / maxValue * 100}%`
        }
      }
    ) : null), /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowValue" }, formatCurrency(incomeTotal))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowMetric" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowLabel" }, "Gastos"), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowTrack" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--expense",
        style: {
          width: `${Math.max(0, row.postedExpenseCents) / maxValue * 100}%`
        }
      }
    ), row.plannedExpenseCents > 0 ? /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--expensePlanned",
        style: {
          width: `${Math.max(0, expenseTotal) / maxValue * 100}%`
        }
      }
    ) : null), /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowValue" }, formatCurrency(expenseTotal))));
  }));
}
function MovementRow({ movement, onEdit, onDelete, deleting }) {
  const signedAmountCents = getSignedAmountCents(movement);
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementRow" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementMain" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementTitleRow" }, /* @__PURE__ */ React.createElement("strong", null, movement?.title || "Movimiento"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: [
        "financeDashboard__movementAmount",
        movement?.kind === "income" ? "financeDashboard__movementAmount--income" : "financeDashboard__movementAmount--expense"
      ].join(" ")
    },
    formatSignedCurrency(signedAmountCents)
  )), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementMeta" }, /* @__PURE__ */ React.createElement("span", null, formatDateLabel(movement?.movementDate)), /* @__PURE__ */ React.createElement("span", null, movement?.category || "Sin categoria"), /* @__PURE__ */ React.createElement("span", null, movement?.platform || "Sin plataforma"), movement?.counterparty ? /* @__PURE__ */ React.createElement("span", null, movement.counterparty) : null), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementPills" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__pill" }, getMovementKindLabel(movement?.kind)), /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__pill" }, getMovementStatusLabel(movement?.status))), movement?.notes ? /* @__PURE__ */ React.createElement("p", { className: "financeDashboard__movementNotes" }, movement.notes) : null), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementActions" }, /* @__PURE__ */ React.createElement(IconButton, { type: "button", className: "financeDashboard__iconButton", onClick: onEdit, title: "Editar movimiento" }, /* @__PURE__ */ React.createElement(PencilIcon, { size: 15 })), /* @__PURE__ */ React.createElement(
    IconButton,
    {
      type: "button",
      className: "financeDashboard__iconButton financeDashboard__iconButton--danger",
      tone: "danger",
      onClick: onDelete,
      disabled: deleting,
      title: "Borrar movimiento"
    },
    /* @__PURE__ */ React.createElement(TrashIcon, { size: 15 })
  )));
}
function CashCountHistoryRow({ cashCount }) {
  const varianceIsPositive = Number(cashCount?.varianceCents || 0) > 0;
  const varianceIsNegative = Number(cashCount?.varianceCents || 0) < 0;
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashHistoryRow" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashHistoryMain" }, /* @__PURE__ */ React.createElement("strong", null, formatDateTimeLabel(cashCount?.countedAt)), /* @__PURE__ */ React.createElement("span", null, "Contado:", " ", formatCurrency(cashCount?.totalCountedCents))), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: [
        "financeDashboard__cashVariance",
        varianceIsPositive && "financeDashboard__cashVariance--positive",
        varianceIsNegative && "financeDashboard__cashVariance--negative"
      ].filter(Boolean).join(" ")
    },
    formatSignedCurrency(cashCount?.varianceCents || 0)
  ));
}
function PersonalFinanceView() {
  const titleInputRef = useRef(null);
  const [movements, setMovements] = useState([]);
  const [cashAudit, setCashAudit] = useState({
    counts: [],
    denominations: FINANCE_CASH_DENOMINATIONS,
    latestCashCount: null,
    currentExpectedCents: 0,
    currentCountedCents: null,
    currentVarianceCents: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCashCount, setSavingCashCount] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [periodFilter, setPeriodFilter] = useState("90d");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formState, setFormState] = useState(() => buildEmptyFormState());
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [workbenchTab, setWorkbenchTab] = useState("compose");
  const [cashCountForm, setCashCountForm] = useState(
    () => buildCashCountFormState(FINANCE_CASH_DENOMINATIONS)
  );
  const deferredSearchValue = useDeferredValue(searchValue);
  const loadMovements = async () => {
    setError("");
    setRefreshing(true);
    try {
      const response = await ipcRenderer.invoke("finanzas:list");
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudieron cargar los movimientos.");
      }
      startTransition(() => {
        setMovements(Array.isArray(response?.data?.movements) ? response.data.movements : []);
        const nextCashAudit = response?.data?.cashAudit || null;
        const nextDenominations = Array.isArray(nextCashAudit?.denominations) && nextCashAudit.denominations.length ? nextCashAudit.denominations : FINANCE_CASH_DENOMINATIONS;
        const nextLatestCashCount = nextCashAudit?.latestCashCount || null;
        setCashAudit({
          counts: Array.isArray(nextCashAudit?.counts) ? nextCashAudit.counts : [],
          denominations: nextDenominations,
          latestCashCount: nextLatestCashCount,
          currentExpectedCents: Number(nextCashAudit?.currentExpectedCents || 0),
          currentCountedCents: nextCashAudit?.currentCountedCents == null ? null : Number(nextCashAudit.currentCountedCents),
          currentVarianceCents: nextCashAudit?.currentVarianceCents == null ? null : Number(nextCashAudit.currentVarianceCents)
        });
        setCashCountForm(buildCashCountFormState(nextDenominations, nextLatestCashCount?.counts));
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar los movimientos."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    void loadMovements();
  }, []);
  const categories = useMemo(() => {
    return [...new Set(movements.map((movement) => movement?.category).filter(Boolean))].sort(
      (left, right) => String(left).localeCompare(String(right), void 0, { sensitivity: "base" })
    );
  }, [movements]);
  const platforms = useMemo(() => {
    return [...new Set(movements.map((movement) => movement?.platform).filter(Boolean))].sort(
      (left, right) => String(left).localeCompare(String(right), void 0, { sensitivity: "base" })
    );
  }, [movements]);
  const summary = useMemo(() => calculatePortfolioSummary(movements), [movements]);
  const cashDenominations = useMemo(() => {
    return Array.isArray(cashAudit?.denominations) && cashAudit.denominations.length ? cashAudit.denominations : FINANCE_CASH_DENOMINATIONS;
  }, [cashAudit?.denominations]);
  const queryFilteredMovements = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredSearchValue);
    return movements.filter((movement) => {
      if (kindFilter !== "all" && movement?.kind !== kindFilter) {
        return false;
      }
      if (statusFilter !== "all" && movement?.status !== statusFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const searchableText = normalizeSearchText(
        [
          movement?.title,
          movement?.category,
          movement?.platform,
          movement?.counterparty,
          movement?.notes
        ].filter(Boolean).join(" ")
      );
      return searchableText.includes(normalizedQuery);
    });
  }, [deferredSearchValue, kindFilter, movements, statusFilter]);
  const visibleMovements = useMemo(() => {
    const startDate = resolvePeriodStart(periodFilter);
    return queryFilteredMovements.filter((movement) => isMovementAfterStart(movement, startDate));
  }, [periodFilter, queryFilteredMovements]);
  const timelineSeries = useMemo(
    () => buildTimelineSeries(queryFilteredMovements, periodFilter),
    [periodFilter, queryFilteredMovements]
  );
  const monthlyFlow = useMemo(
    () => buildMonthlyFlowRows(queryFilteredMovements, periodFilter),
    [periodFilter, queryFilteredMovements]
  );
  const editingMovement = Boolean(formState.id);
  const activePreset = getPresetById(formState.presetId);
  const cashCountPreview = useMemo(() => {
    const totalCountedCents = calculateCashCountTotalCents(cashDenominations, cashCountForm);
    const expectedCents = Number(cashAudit?.currentExpectedCents || 0);
    return {
      totalCountedCents,
      expectedCents,
      varianceCents: totalCountedCents - expectedCents
    };
  }, [cashAudit?.currentExpectedCents, cashCountForm, cashDenominations]);
  const recentCashCounts = useMemo(
    () => Array.isArray(cashAudit?.counts) ? cashAudit.counts.slice(0, 4) : [],
    [cashAudit?.counts]
  );
  const updateFormState = (patch) => {
    setFormState((current) => ({
      ...current,
      ...patch
    }));
  };
  const applyPreset = (presetId) => {
    const preset = getPresetById(presetId);
    setFormState((current) => ({
      ...current,
      presetId: preset.id,
      kind: preset.kind,
      status: preset.status
    }));
    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  };
  const resetForm = () => {
    setFormState(buildEmptyFormState(activePreset?.id));
    setShowAdvancedForm(false);
    setWorkbenchTab("compose");
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const numericAmount = Number(formState.amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Ingresa un monto valido mayor a cero.");
      }
      const response = await ipcRenderer.invoke("finanzas:save-movement", {
        id: formState.id || void 0,
        kind: formState.kind,
        status: formState.status,
        title: formState.title,
        amount: numericAmount,
        movementDate: formState.movementDate,
        category: formState.category,
        platform: formState.platform,
        counterparty: formState.counterparty,
        notes: formState.notes
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar el movimiento.");
      }
      resetForm();
      await loadMovements();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el movimiento."
      );
    } finally {
      setSaving(false);
    }
  };
  const handleEditMovement = (movement) => {
    setFormState(buildFormStateFromMovement(movement));
    setShowAdvancedForm(true);
    setWorkbenchTab("compose");
    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  };
  const handleDeleteMovement = async (movement) => {
    const movementId = String(movement?.id || "");
    if (!movementId) {
      return;
    }
    const confirmed = window.confirm(`Borrar "${movement?.title || "este movimiento"}"?`);
    if (!confirmed) {
      return;
    }
    setDeletingId(movementId);
    setError("");
    try {
      const response = await ipcRenderer.invoke("finanzas:delete-movement", {
        id: movementId
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo borrar el movimiento.");
      }
      if (formState.id === movementId) {
        resetForm();
      }
      await loadMovements();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "No se pudo borrar el movimiento."
      );
    } finally {
      setDeletingId("");
    }
  };
  const handleCashCountFieldChange = (denomination, nextValue) => {
    setCashCountForm((current) => ({
      ...current,
      [String(denomination)]: nextValue
    }));
  };
  const handleSaveCashCount = async () => {
    setSavingCashCount(true);
    setError("");
    try {
      const countsPayload = Object.fromEntries(
        cashDenominations.map((denomination) => [
          String(denomination),
          normalizeCashCountValue(cashCountForm[String(denomination)])
        ])
      );
      const response = await ipcRenderer.invoke("finanzas:save-cash-count", {
        counts: countsPayload
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar el arqueo.");
      }
      await loadMovements();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el arqueo de efectivo."
      );
    } finally {
      setSavingCashCount(false);
    }
  };
  const hasAnyMovement = movements.length > 0;
  const cashVarianceIsPositive = cashCountPreview.varianceCents > 0;
  const cashVarianceIsNegative = cashCountPreview.varianceCents < 0;
  const workbenchTitle = workbenchTab === "cash" ? "Arqueo de efectivo" : workbenchTab === "reports" ? "Reportes compactos" : editingMovement ? "Editar movimiento" : "Nuevo movimiento";
  const workbenchDescription = workbenchTab === "cash" ? "Compara el efectivo contado contra el saldo esperado en movimientos realizados con plataforma `Efectivo`." : workbenchTab === "reports" ? "Lectura rapida de balance y flujo sin salir del dashboard." : "Registra ingresos y gastos con un flujo corto por defecto y detalles opcionales solo cuando hacen falta.";
  return /* @__PURE__ */ React.createElement(WorkspacePage, { className: "financeDashboard" }, /* @__PURE__ */ React.createElement(WorkspaceTopbar, null, /* @__PURE__ */ React.createElement(
    WorkspaceTitle,
    {
      eyebrow: "Plugin finanzas",
      title: "Finanzas",
      description: "Movimientos como centro del flujo diario, con arqueo y reportes como herramientas auxiliares."
    }
  ), /* @__PURE__ */ React.createElement(ToolbarActions, null, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: () => {
        resetForm();
        setWorkbenchTab("compose");
        window.requestAnimationFrame(() => titleInputRef.current?.focus());
      }
    },
    "Nuevo movimiento"
  ), /* @__PURE__ */ React.createElement(
    IconButton,
    {
      type: "button",
      onClick: () => void loadMovements(),
      disabled: refreshing,
      title: "Recargar movimientos"
    },
    /* @__PURE__ */ React.createElement(RefreshIcon, { size: 16 })
  ))), /* @__PURE__ */ React.createElement(WorkspaceBody, { className: "financeDashboard__content" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__summaryRow" }, /* @__PURE__ */ React.createElement(
    MetricCard,
    {
      className: "financeDashboard__summaryCard",
      tone: "highlight",
      eyebrow: "Saldo actual",
      value: formatCurrency(summary.actualBalanceCents),
      description: `Basado solo en movimientos realizados. Quedan ${formatCurrency(summary.plannedIncomeCents)} en ingresos pendientes y ${formatCurrency(summary.plannedExpenseCents)} en gastos pendientes.`
    }
  ), /* @__PURE__ */ React.createElement(
    MetricCard,
    {
      className: "financeDashboard__summaryCard",
      tone: "soft",
      eyebrow: "Saldo proyectado",
      value: formatCurrency(summary.projectedBalanceCents),
      description: "Resultado esperado si se ejecutan todos los pendientes ya cargados."
    }
  ), /* @__PURE__ */ React.createElement(
    MetricCard,
    {
      className: "financeDashboard__summaryCard financeDashboard__summaryCard--variance",
      eyebrow: "Efectivo contado",
      value: formatCurrency(cashCountPreview.totalCountedCents),
      description: `Esperado: ${formatCurrency(cashCountPreview.expectedCents)}. Diferencia: ${formatSignedCurrency(cashCountPreview.varianceCents)}.`
    }
  )), error ? /* @__PURE__ */ React.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React.createElement(SplitLayout, { className: "financeDashboard__workspace" }, /* @__PURE__ */ React.createElement(SplitMain, null, /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--history" }, /* @__PURE__ */ React.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__panelHeaderActions" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__historyCount" }, visibleMovements.length, " ", "visibles"))
    },
    /* @__PURE__ */ React.createElement(
      PanelTitle,
      {
        eyebrow: "Centro de trabajo",
        title: "Movimientos",
        description: "Consulta, filtra y edita ingresos y gastos sin perder el contexto principal."
      }
    )
  ), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__filtersBar" }, /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField financeDashboard__inlineField--search", label: "Buscar", grow: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "search",
      value: searchValue,
      onChange: (event) => setSearchValue(event.target.value),
      placeholder: "Titulo, categoria, plataforma o nota"
    }
  )), /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField", label: "Periodo" }, /* @__PURE__ */ React.createElement("select", { value: periodFilter, onChange: (event) => setPeriodFilter(event.target.value) }, FINANCE_PERIOD_FILTERS.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField", label: "Tipo" }, /* @__PURE__ */ React.createElement("select", { value: kindFilter, onChange: (event) => setKindFilter(event.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todos"), /* @__PURE__ */ React.createElement("option", { value: "expense" }, "Gastos"), /* @__PURE__ */ React.createElement("option", { value: "income" }, "Ingresos"))), /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField", label: "Estado" }, /* @__PURE__ */ React.createElement("select", { value: statusFilter, onChange: (event) => setStatusFilter(event.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todos"), /* @__PURE__ */ React.createElement("option", { value: "posted" }, "Realizados"), /* @__PURE__ */ React.createElement("option", { value: "planned" }, "Pendientes")))), /* @__PURE__ */ React.createElement(ScrollRegion, { className: "financeDashboard__movementRegion" }, loading ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      eyebrow: "Cargando",
      title: "Estamos leyendo tus movimientos",
      description: "En un momento veras el historial filtrable."
    }
  ) : !hasAnyMovement ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      centered: true,
      eyebrow: "Sin actividad",
      title: "Todavia no hay movimientos",
      description: "Empieza con un gasto o ingreso desde el panel lateral."
    }
  ) : visibleMovements.length === 0 ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      centered: true,
      eyebrow: "Sin resultados",
      title: "No hay movimientos para esos filtros",
      description: "Prueba con otro periodo o limpia la busqueda."
    }
  ) : /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementList" }, visibleMovements.map((movement) => /* @__PURE__ */ React.createElement(
    MovementRow,
    {
      key: movement.id,
      movement,
      deleting: deletingId === movement.id,
      onEdit: () => handleEditMovement(movement),
      onDelete: () => void handleDeleteMovement(movement)
    }
  )))))), /* @__PURE__ */ React.createElement(SplitAside, { className: "financeDashboard__aside" }, /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--workbench" }, /* @__PURE__ */ React.createElement(PanelStack, null, /* @__PURE__ */ React.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React.createElement(
        SegmentedControl,
        {
          ariaLabel: "Zona de trabajo de finanzas",
          options: FINANCE_WORKBENCH_TABS,
          value: workbenchTab,
          onChange: setWorkbenchTab
        }
      )
    },
    /* @__PURE__ */ React.createElement(PanelTitle, { title: workbenchTitle, description: workbenchDescription })
  ), workbenchTab === "compose" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__presetGrid", role: "tablist", "aria-label": "Tipo de movimiento" }, FINANCE_PRESETS.map((preset) => /* @__PURE__ */ React.createElement(
    Button,
    {
      key: preset.id,
      type: "button",
      className: [
        "financeDashboard__presetButton",
        formState.presetId === preset.id && "is-active",
        preset.kind === "income" ? "financeDashboard__presetButton--income" : "financeDashboard__presetButton--expense"
      ].filter(Boolean).join(" "),
      onClick: () => applyPreset(preset.id)
    },
    preset.kind === "income" ? /* @__PURE__ */ React.createElement(ArrowInIcon, { size: 16 }) : /* @__PURE__ */ React.createElement(ArrowOutIcon, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, preset.shortLabel)
  ))), /* @__PURE__ */ React.createElement("form", { className: "financeDashboard__form", onSubmit: handleSubmit }, /* @__PURE__ */ React.createElement(FieldGrid, null, /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--wide", label: "Titulo", wide: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: titleInputRef,
      type: "text",
      value: formState.title,
      onChange: (event) => updateFormState({ title: event.target.value }),
      placeholder: activePreset.kind === "income" ? "Ej. sueldo, venta, transferencia" : "Ej. supermercado, alquiler, cuota",
      required: true
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--amount", label: "Monto", wide: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      min: "0",
      step: "0.01",
      value: formState.amount,
      onChange: (event) => updateFormState({ amount: event.target.value }),
      placeholder: "0.00",
      required: true
    }
  )), showAdvancedForm ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field", label: "Fecha" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: formState.movementDate,
      onChange: (event) => updateFormState({ movementDate: event.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field", label: "Categoria" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      list: "finanzas-categories",
      value: formState.category,
      onChange: (event) => updateFormState({ category: event.target.value }),
      placeholder: "Comida, transporte, sueldo..."
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field", label: "Plataforma" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      list: "finanzas-platforms",
      value: formState.platform,
      onChange: (event) => updateFormState({ platform: event.target.value }),
      placeholder: "Efectivo, Mercado Pago, banco..."
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--wide", label: "Origen o lugar", wide: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: formState.counterparty,
      onChange: (event) => updateFormState({ counterparty: event.target.value }),
      placeholder: "Comercio, persona, empresa o contexto"
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--wide", label: "Notas", wide: true }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: formState.notes,
      onChange: (event) => updateFormState({ notes: event.target.value }),
      placeholder: "Detalle opcional"
    }
  ))) : null), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__formActions" }, /* @__PURE__ */ React.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : editingMovement ? "Guardar cambios" : "Agregar movimiento"), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: () => setShowAdvancedForm((current) => !current),
      disabled: saving
    },
    showAdvancedForm ? "Ocultar avanzado" : "Mostrar avanzado"
  ), editingMovement ? /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: resetForm,
      disabled: saving
    },
    "Cancelar edicion"
  ) : null)), /* @__PURE__ */ React.createElement("datalist", { id: "finanzas-categories" }, categories.map((category) => /* @__PURE__ */ React.createElement("option", { key: category, value: category }))), /* @__PURE__ */ React.createElement("datalist", { id: "finanzas-platforms" }, platforms.map((platform) => /* @__PURE__ */ React.createElement("option", { key: platform, value: platform })))) : null, workbenchTab === "cash" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStats" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStat" }, /* @__PURE__ */ React.createElement("span", null, "Esperado"), /* @__PURE__ */ React.createElement("strong", null, formatCurrency(cashCountPreview.expectedCents))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStat" }, /* @__PURE__ */ React.createElement("span", null, "Contado"), /* @__PURE__ */ React.createElement("strong", null, formatCurrency(cashCountPreview.totalCountedCents))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStat" }, /* @__PURE__ */ React.createElement("span", null, "Diferencia"), /* @__PURE__ */ React.createElement(
    "strong",
    {
      className: [
        cashVarianceIsPositive && "financeDashboard__cashVariance--positive",
        cashVarianceIsNegative && "financeDashboard__cashVariance--negative"
      ].filter(Boolean).join(" ")
    },
    formatSignedCurrency(cashCountPreview.varianceCents)
  ))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashGrid" }, cashDenominations.map((denomination) => /* @__PURE__ */ React.createElement(Field, { key: denomination, className: "financeDashboard__cashField", label: `${formatDenominationLabel(denomination)} ARS` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9]*",
      value: cashCountForm[String(denomination)] ?? "",
      onChange: (event) => handleCashCountFieldChange(denomination, event.target.value),
      placeholder: "0"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__formActions" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: () => void handleSaveCashCount(),
      disabled: savingCashCount
    },
    savingCashCount ? "Guardando arqueo..." : "Registrar arqueo"
  )), /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      className: "financeDashboard__cashHint",
      title: cashAudit?.latestCashCount ? "Ultimo arqueo registrado" : "Todavia no hay arqueos",
      description: cashAudit?.latestCashCount ? formatDateTimeLabel(cashAudit.latestCashCount.countedAt) : "Registra el primero para comparar el efectivo real con lo cargado."
    }
  ), recentCashCounts.length ? /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashHistory" }, recentCashCounts.map((cashCount) => /* @__PURE__ */ React.createElement(CashCountHistoryRow, { key: cashCount.id, cashCount }))) : null) : null, workbenchTab === "reports" ? /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__chartsGrid" }, /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--chart", tone: "soft" }, /* @__PURE__ */ React.createElement(PanelHeader, { actions: /* @__PURE__ */ React.createElement(WalletIcon, { size: 18 }) }, /* @__PURE__ */ React.createElement(PanelTitle, { eyebrow: "Grafico", title: "Nivel de dinero en el tiempo" })), /* @__PURE__ */ React.createElement(BalanceTimelineChart, { points: timelineSeries.points })), /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--chart", tone: "soft" }, /* @__PURE__ */ React.createElement(PanelHeader, null, /* @__PURE__ */ React.createElement(PanelTitle, { eyebrow: "Flujo", title: "Ingresos y egresos por mes" })), /* @__PURE__ */ React.createElement(MonthlyFlowChart, { rows: monthlyFlow.rows, maxValue: monthlyFlow.maxValue }))) : null))))));
}

// ../nexus-plugins/finanzas/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = FINANCE_PLUGIN_ID;
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var finanzasRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerView({
      id: FINANCE_DASHBOARD_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Finanzas",
      icon: WalletIcon,
      tone: "data",
      surface: "workspace",
      component: (props) => /* @__PURE__ */ React.createElement(PersonalFinanceView, { ...props, ctx })
    });
    ctx.registerSideToolbarButton({
      id: "nexus.finanzas.dashboard-button",
      pluginId: ctx.pluginId,
      order: 260,
      icon: WalletIcon,
      tone: "data",
      label: "Finanzas",
      onClick: () => {
        void ctx.openView({
          viewId: FINANCE_DASHBOARD_VIEW_ID,
          reuse: true,
          sourceId: "nexus.finanzas.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === FINANCE_DASHBOARD_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = finanzasRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
