export const HABITOS_PLUGIN_ID = "nexus.habitos";
export const HABITOS_WORKSPACE_VIEW_ID = "nexus.habitos.workspace";

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
  { value: "Dejar un mal habito", label: "Dejar un mal habito", iconId: "mui:Block", color: "#ff9f96" },
  { value: "Arte", label: "Arte", iconId: "mui:Brush", color: "#ffcf8b" },
  { value: "Meditacion", label: "Meditacion", iconId: "mui:SelfImprovement", color: "#b8dfc5" },
  { value: "Estudio", label: "Estudio", iconId: "mui:School", color: "#9dc9ff" },
  { value: "Deportes", label: "Deportes", iconId: "mui:DirectionsBike", color: "#8fded2" },
  { value: "Entretenimiento", label: "Entretenimiento", iconId: "mui:SportsEsports", color: "#ffd88d" },
  { value: "Social", label: "Social", iconId: "mui:Textsms", color: "#ffc3d4" },
  { value: "Finanzas", label: "Finanzas", iconId: "mui:AttachMoney", color: "#a9da83" },
  { value: "Salud", label: "Salud", iconId: "mui:LocalHospital", color: "#8fd8d1" },
  { value: "Trabajo", label: "Trabajo", iconId: "mui:Work", color: "#c5d0dc" },
  { value: "Nutricion", label: "Nutricion", iconId: "mui:Restaurant", color: "#ffcf9c" },
  { value: "Hogar", label: "Hogar", iconId: "mui:Home", color: "#f3c39f" },
  { value: "Aire libre", label: "Aire libre", iconId: "mui:Landscape", color: "#9fd6a1" },
  { value: "Otros", label: "Otros", iconId: "mui:Extension", color: "#c1cad8" },
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
