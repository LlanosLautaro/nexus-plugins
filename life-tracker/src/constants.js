export const LIFE_TRACKER_PLUGIN_ID = "nexus.life-tracker";
export const LIFE_TRACKER_WORKSPACE_VIEW_ID = "nexus.life-tracker.workspace";
export const LIFE_TRACKER_HOME_CANVAS_ID = "home";
export const LIFE_TRACKER_CANVAS_STATE_KEY = "lifeTrackerCanvases";
export const LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY = "lifeTrackerHabitCategoryPresetOverrides";
export const LIFE_TRACKER_LEGACY_DASHBOARD_LAYOUTS_KEY = "dashboardLayouts";
export const LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY = "categoryPresetOverrides";
export const LIFE_TRACKER_DEFAULT_SECTION = "home";
export const LIFE_TRACKER_SECTION_OPTIONS = [
  { value: "home", label: "Inicio" },
  { value: "finance", label: "Dinero" },
  { value: "training", label: "Entrenamiento" },
];

export const HABITOS_PLUGIN_ID = LIFE_TRACKER_PLUGIN_ID;
export const HABITOS_WORKSPACE_VIEW_ID = LIFE_TRACKER_WORKSPACE_VIEW_ID;

export const DAILY_FILTER_OPTIONS = [
  { value: "all", label: "Todo" },
  { value: "tasks", label: "Tareas" },
  { value: "habits", label: "Habitos" },
];

export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" },
];

export const DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID = "mui:Extension";
export const DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR = "#8fb3ff";
export const HABIT_CATEGORY_CREATE_VALUE = "__create_category__";

export const HABIT_CATEGORY_PRESETS = [
  { value: "Dejar un mal habito", label: "Dejar un mal habito", iconId: "mui:Block", color: "#ea4335" },
  { value: "Arte", label: "Arte", iconId: "mui:Brush", color: "#ef4f66" },
  { value: "Meditacion", label: "Meditacion", iconId: "mui:SelfImprovement", color: "#cf34b8" },
  { value: "Estudio", label: "Estudio", iconId: "mui:School", color: "#9b5cf6" },
  { value: "Deportes", label: "Deportes", iconId: "mui:DirectionsBike", color: "#4d71f2" },
  { value: "Entretenimiento", label: "Entretenimiento", iconId: "mui:ConfirmationNumber", color: "#42b7c8" },
  { value: "Social", label: "Social", iconId: "mui:Textsms", color: "#34b893" },
  { value: "Finanzas", label: "Finanzas", iconId: "mui:AttachMoney", color: "#4bb86c" },
  { value: "Salud", label: "Salud", iconId: "mui:LocalHospital", color: "#85c93c" },
  { value: "Trabajo", label: "Trabajo", iconId: "mui:Work", color: "#a6bf3f" },
  { value: "Nutricion", label: "Nutricion", iconId: "mui:Restaurant", color: "#ffa20f" },
  { value: "Hogar", label: "Hogar", iconId: "mui:Home", color: "#ff960f" },
  { value: "Aire libre", label: "Aire libre", iconId: "mui:Landscape", color: "#df7a38" },
  { value: "Otros", label: "Otros", iconId: "mui:Widgets", color: "#df6746" },
];

export const HABIT_PROGRESS_OPTIONS = [
  {
    value: "yes-no",
    label: "Con un si o un no",
    description: "Si cada dia quieres registrar si tuviste exito o no con tu actividad.",
  },
  {
    value: "quantity",
    label: "Con una cantidad",
    description: "Si quieres establecer un valor numerico como meta o limite diario para el habito.",
  },
  {
    value: "checklist",
    label: "Con una lista de actividades",
    description: "Si quieres evaluar tu actividad en base a un conjunto de sub-items.",
  },
];

export const HABIT_QUANTITY_MODE_OPTIONS = [
  { value: "at-least", label: "Al menos" },
  { value: "less-than", label: "Menos de" },
  { value: "exactly", label: "Exactamente" },
  { value: "no-target", label: "Sin objetivo" },
];

export const HABIT_EDIT_WIZARD_STEPS = [
  { value: 0, label: "Identidad" },
  { value: 1, label: "Frecuencia" },
  { value: 2, label: "Operativa" },
];

export const HABIT_WIZARD_STEPS = [
  { value: 0, label: "Categoria" },
  { value: 1, label: "Evaluacion" },
  { value: 2, label: "Configuracion" },
  { value: 3, label: "Frecuencia" },
  { value: 4, label: "Cuando quieres hacerlo?" },
];
