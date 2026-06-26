export const FINANCE_PLUGIN_ID = "nexus.life-tracker.finance";
export const FINANCE_DASHBOARD_VIEW_ID = "nexus.life-tracker.finance";

export const FINANCE_MOVEMENT_KINDS = ["income", "expense"];
export const FINANCE_MOVEMENT_STATUSES = ["posted", "planned"];
export const FINANCE_CASH_DENOMINATIONS = [50, 100, 200, 500, 1000, 2000, 10000, 20000];

export const FINANCE_PRESETS = [
  {
    id: "expense-posted",
    kind: "expense",
    status: "posted",
    label: "Gasto realizado",
    shortLabel: "Gasto real",
  },
  {
    id: "expense-planned",
    kind: "expense",
    status: "planned",
    label: "Gasto pendiente",
    shortLabel: "Gasto pendiente",
  },
  {
    id: "income-posted",
    kind: "income",
    status: "posted",
    label: "Ingreso realizado",
    shortLabel: "Ingreso real",
  },
  {
    id: "income-planned",
    kind: "income",
    status: "planned",
    label: "Ingreso pendiente",
    shortLabel: "Ingreso pendiente",
  },
];

export const FINANCE_PERIOD_FILTERS = [
  { value: "all", label: "Todo" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "365d", label: "12 meses" },
];
