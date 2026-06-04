const React = window.React;

// ../nexus-frontend/src/ui/cx.js
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// ../nexus-frontend/src/ui/WorkspacePage.jsx
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
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

// ../nexus-plugins/habitos/src/constants.js
var HABITOS_PLUGIN_ID = "nexus.habitos";
var HABITOS_WORKSPACE_VIEW_ID = "nexus.habitos.workspace";
var TASK_PRIORITY_OPTIONS = [
  { value: "3", label: "Alta" },
  { value: "2", label: "Media" },
  { value: "1", label: "Baja" }
];
var WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" }
];
var HABIT_WIZARD_STEPS = [
  { value: 0, label: "Identidad" },
  { value: 1, label: "Frecuencia" },
  { value: 2, label: "Operativa" }
];

// ../nexus-plugins/habitos/src/icons.jsx
function BaseIcon({ children }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    children
  );
}
function HabitosIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "5", width: "16", height: "15", rx: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 10h8" }), /* @__PURE__ */ React.createElement("path", { d: "M8 14h5" }), /* @__PURE__ */ React.createElement("path", { d: "M8 7.5v5" }));
}
function PlusIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "M12 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "M5 12h14" }));
}
function CheckIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "m5 12 4 4 10-10" }));
}
function TrashIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "M4 7h16" }), /* @__PURE__ */ React.createElement("path", { d: "M9 7V4h6v3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 10v8" }), /* @__PURE__ */ React.createElement("path", { d: "M12 10v8" }), /* @__PURE__ */ React.createElement("path", { d: "M16 10v8" }));
}
function ChevronLeftIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "m15 18-6-6 6-6" }));
}
function ChevronRightIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" }));
}

// ../nexus-plugins/habitos/src/HabitosView.jsx
var React2 = window.React;
var {
  startTransition,
  useEffect,
  useState
} = React2;
var { ipcRenderer } = window.require("electron");
function todayLocalDate() {
  const now = /* @__PURE__ */ new Date();
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
    priority: String(source?.priority || 2),
    notes: source?.notes || "",
    reminderAt: source?.reminderAt ? String(source.reminderAt).slice(0, 16) : "",
    isPersistent: source?.isPersistent ?? true,
    subitemsBlocking: source?.subitemsBlocking ?? false,
    subitems: Array.isArray(source?.subitems) && source.subitems.length ? source.subitems.map((entry) => ({
      id: entry.id || "",
      title: entry.title || "",
      isCompleted: Boolean(entry.isCompleted)
    })) : []
  };
}
function createHabitDraft(source = null) {
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays) ? source.scheduleConfigJson.weekdays : [1, 2, 3, 4, 5],
    startDate: source?.startDate || todayLocalDate(),
    endDate: source?.endDate || "",
    time: source?.time || "",
    priority: String(source?.priority || 2),
    notes: source?.notes || ""
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
  const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(parsed);
}
function hashValue(input = "") {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}
function getQueueAccent(item) {
  const base = `${item.category || item.type || "item"}:${item.title || ""}`;
  const hue = hashValue(base) % 360;
  return {
    color: `hsl(${hue} 68% 58%)`,
    label: (item.category || (item.type === "habit" ? "Habito" : "Tarea")).slice(0, 1).toUpperCase()
  };
}
function createEmptyHome() {
  return {
    today: todayLocalDate(),
    tasks: [],
    habits: [],
    dailyQueue: [],
    upcomingTasks: [],
    recentHistory: [],
    tasksSummary: {
      queueCount: 0,
      openCount: 0,
      upcomingCount: 0,
      completedTodayCount: 0,
      failedCount: 0
    },
    habitsSummary: {
      activeCount: 0,
      pendingTodayCount: 0,
      completedTodayCount: 0,
      failedCount: 0
    }
  };
}
function QueueItemCard({
  item,
  isSelected = false,
  onToggle,
  onContextMenu
}) {
  const accent = getQueueAccent(item);
  return /* @__PURE__ */ React2.createElement(
    "article",
    {
      className: [
        "habitosView__queueItem",
        item.isOverdue ? "is-overdue" : "",
        isSelected ? "is-selected" : ""
      ].filter(Boolean).join(" "),
      onContextMenu: (event) => onContextMenu?.(event, item)
    },
    /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "habitosView__queueBadge",
        style: { "--habitos-item-accent": accent.color },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React2.createElement("span", null, accent.label)
    ),
    /* @__PURE__ */ React2.createElement("div", { className: "habitosView__queueCopy" }, /* @__PURE__ */ React2.createElement("strong", null, item.title), /* @__PURE__ */ React2.createElement("span", null, item.type === "habit" ? "Habito" : "Tarea")),
    /* @__PURE__ */ React2.createElement(
      "button",
      {
        type: "button",
        className: "habitosView__queueCheck",
        onClick: onToggle,
        title: item.status === "completed" ? "Reabrir" : "Completar",
        "aria-label": item.status === "completed" ? "Reabrir" : "Completar",
        "aria-pressed": item.status === "completed" ? "true" : "false"
      },
      item.status === "completed" ? /* @__PURE__ */ React2.createElement(CheckIcon, null) : null
    )
  );
}
function FloatingWorkbenchModal({
  isVisible,
  saving = false,
  onClose,
  children
}) {
  if (!isVisible) {
    return null;
  }
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "habitosView__modalBackdrop",
      onClick: () => {
        if (!saving) {
          onClose?.();
        }
      }
    },
    /* @__PURE__ */ React2.createElement("div", { className: "habitosView__modalShell", onClick: (event) => event.stopPropagation() }, children)
  );
}
function CreateChooserModal({
  onTask,
  onHabit,
  onCancel
}) {
  return /* @__PURE__ */ React2.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React2.createElement(PanelHeader, null, /* @__PURE__ */ React2.createElement(PanelTitle, { title: "Crear nuevo" })), /* @__PURE__ */ React2.createElement("div", { className: "habitosView__createChoiceGrid" }, /* @__PURE__ */ React2.createElement("button", { type: "button", className: "habitosView__createChoice", onClick: onTask }, /* @__PURE__ */ React2.createElement("strong", null, "Tarea simple"), /* @__PURE__ */ React2.createElement("span", null, "Resolver algo puntual.")), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "habitosView__createChoice", onClick: onHabit }, /* @__PURE__ */ React2.createElement("strong", null, "Habito base"), /* @__PURE__ */ React2.createElement("span", null, "Repetir una rutina."))), /* @__PURE__ */ React2.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onCancel }, "Cancelar")));
}
function SecondaryListCard({ title, items, renderItem, emptyTitle = "Sin elementos." }) {
  return /* @__PURE__ */ React2.createElement(SectionPanel, null, /* @__PURE__ */ React2.createElement(PanelHeader, null, /* @__PURE__ */ React2.createElement(PanelTitle, { title })), items.length ? /* @__PURE__ */ React2.createElement("div", { className: "habitosView__secondaryList" }, items.map(renderItem)) : /* @__PURE__ */ React2.createElement(StateBlock, { title: emptyTitle }));
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
  onSubmit,
  onCancel
}) {
  return /* @__PURE__ */ React2.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React2.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onToggleAdvanced }, advancedOpen ? "Ocultar avanzado" : "Mostrar avanzado")
    },
    /* @__PURE__ */ React2.createElement(PanelTitle, { title: draft.id ? "Editar tarea" : "Nueva tarea" })
  ), /* @__PURE__ */ React2.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React2.createElement(FieldGrid, null, /* @__PURE__ */ React2.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Ej. Llamar al tecnico",
      required: true
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Categoria" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      value: draft.category,
      onChange: (event) => onChange("category", event.target.value),
      placeholder: "Trabajo, hogar, estudio..."
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Fecha" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "date",
      value: draft.dueDate,
      onChange: (event) => onChange("dueDate", event.target.value),
      required: true
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React2.createElement("select", { value: draft.priority, onChange: (event) => onChange("priority", event.target.value) }, TASK_PRIORITY_OPTIONS.map((option) => /* @__PURE__ */ React2.createElement("option", { key: option.value, value: option.value }, option.label))))), /* @__PURE__ */ React2.createElement("div", { className: "habitosView__subitemEditor" }, /* @__PURE__ */ React2.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React2.createElement("strong", null, "Sub-items")), draft.subitems.length ? /* @__PURE__ */ React2.createElement("div", { className: "habitosView__subitemsDraft" }, draft.subitems.map((subitem, index) => /* @__PURE__ */ React2.createElement("div", { key: subitem.id || index, className: "habitosView__subitemDraftRow" }, /* @__PURE__ */ React2.createElement("label", { className: "habitosView__subitemToggle" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(subitem.isCompleted),
      onChange: (event) => onSubitemChange(index, "isCompleted", event.target.checked)
    }
  ), /* @__PURE__ */ React2.createElement("span", null, "Hecho")), /* @__PURE__ */ React2.createElement(
    "input",
    {
      value: subitem.title,
      onChange: (event) => onSubitemChange(index, "title", event.target.value),
      placeholder: `Paso ${index + 1}`
    }
  ), /* @__PURE__ */ React2.createElement(IconButton, { type: "button", title: "Quitar sub-item", tone: "danger", onClick: () => onRemoveSubitem(index) }, /* @__PURE__ */ React2.createElement(TrashIcon, null))))) : null, /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onAddSubitem }, /* @__PURE__ */ React2.createElement(PlusIcon, null), /* @__PURE__ */ React2.createElement("span", null, "Agregar sub-item"))), advancedOpen ? /* @__PURE__ */ React2.createElement(FieldGrid, null, /* @__PURE__ */ React2.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "time",
      value: draft.time,
      onChange: (event) => onChange("time", event.target.value)
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Recordatorio" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "datetime-local",
      value: draft.reminderAt,
      onChange: (event) => onChange("reminderAt", event.target.value)
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React2.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Contexto breve para esta tarea."
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "habitosView__booleanGrid" }, /* @__PURE__ */ React2.createElement("label", { className: "habitosView__booleanField" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.isPersistent),
      onChange: (event) => onChange("isPersistent", event.target.checked)
    }
  ), /* @__PURE__ */ React2.createElement("span", null, "Se mostrara todos los dias hasta completarse")), /* @__PURE__ */ React2.createElement("label", { className: "habitosView__booleanField" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.subitemsBlocking),
      onChange: (event) => onChange("subitemsBlocking", event.target.checked)
    }
  ), /* @__PURE__ */ React2.createElement("span", null, "Los sub-items bloquean el completado")))) : null, /* @__PURE__ */ React2.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React2.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : draft.id ? "Guardar tarea" : "Crear tarea"), /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar"))));
}
function HabitEditor({
  draft,
  step,
  saving,
  onChange,
  onToggleWeekday,
  onBack,
  onNext,
  onSubmit,
  onCancel
}) {
  const isLastStep = step === HABIT_WIZARD_STEPS.length - 1;
  return /* @__PURE__ */ React2.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React2.createElement(PanelHeader, null, /* @__PURE__ */ React2.createElement(PanelTitle, { title: draft.id ? "Editar habito" : "Nuevo habito" })), /* @__PURE__ */ React2.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React2.createElement("div", { className: "habitosView__modalStep" }, /* @__PURE__ */ React2.createElement("span", null, "Paso ", step + 1, " de ", HABIT_WIZARD_STEPS.length), /* @__PURE__ */ React2.createElement("strong", null, HABIT_WIZARD_STEPS[step]?.label || "Paso")), step === 0 ? /* @__PURE__ */ React2.createElement(FieldGrid, null, /* @__PURE__ */ React2.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Ej. Leer 20 minutos",
      required: true
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Categoria" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      value: draft.category,
      onChange: (event) => onChange("category", event.target.value),
      placeholder: "Salud, estudio, finanzas..."
    }
  ))) : null, step === 1 ? /* @__PURE__ */ React2.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React2.createElement(Field, { label: "Frecuencia" }, /* @__PURE__ */ React2.createElement(
    "select",
    {
      value: draft.scheduleType,
      onChange: (event) => onChange("scheduleType", event.target.value)
    },
    /* @__PURE__ */ React2.createElement("option", { value: "daily" }, "Todos los dias"),
    /* @__PURE__ */ React2.createElement("option", { value: "weekdays" }, "Dias de la semana")
  )), draft.scheduleType === "weekdays" ? /* @__PURE__ */ React2.createElement("div", { className: "habitosView__weekdayGrid" }, WEEKDAY_OPTIONS.map((option) => {
    const active = draft.weekdays.includes(option.value);
    return /* @__PURE__ */ React2.createElement(
      "button",
      {
        key: option.value,
        type: "button",
        className: ["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" "),
        onClick: () => onToggleWeekday(option.value)
      },
      option.label
    );
  })) : /* @__PURE__ */ React2.createElement(Notice, { tone: "info" }, "Se genera una ocurrencia por dia.")) : null, step === 2 ? /* @__PURE__ */ React2.createElement(FieldGrid, null, /* @__PURE__ */ React2.createElement(Field, { label: "Inicio" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "date",
      value: draft.startDate,
      onChange: (event) => onChange("startDate", event.target.value),
      required: true
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Fin opcional" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "date",
      value: draft.endDate,
      onChange: (event) => onChange("endDate", event.target.value)
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "time",
      value: draft.time,
      onChange: (event) => onChange("time", event.target.value)
    }
  )), /* @__PURE__ */ React2.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React2.createElement("select", { value: draft.priority, onChange: (event) => onChange("priority", event.target.value) }, TASK_PRIORITY_OPTIONS.map((option) => /* @__PURE__ */ React2.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React2.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React2.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Criterio simple de uso diario."
    }
  ))) : null, /* @__PURE__ */ React2.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React2.createElement("div", { className: "habitosView__editorNav" }, /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onBack, disabled: step === 0 || saving }, /* @__PURE__ */ React2.createElement(ChevronLeftIcon, null), /* @__PURE__ */ React2.createElement("span", null, "Atras")), !isLastStep ? /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onNext, disabled: saving }, /* @__PURE__ */ React2.createElement("span", null, "Siguiente"), /* @__PURE__ */ React2.createElement(ChevronRightIcon, null)) : null), /* @__PURE__ */ React2.createElement("div", { className: "habitosView__editorNav" }, isLastStep ? /* @__PURE__ */ React2.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : draft.id ? "Guardar habito" : "Crear habito") : null, /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar")))));
}
function HabitosView({ ctx }) {
  const [home, setHome] = useState(createEmptyHome);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState("overview");
  const [taskDraft, setTaskDraft] = useState(createTaskDraft());
  const [habitDraft, setHabitDraft] = useState(createHabitDraft());
  const [taskAdvancedOpen, setTaskAdvancedOpen] = useState(false);
  const [habitStep, setHabitStep] = useState(0);
  const [queueMenu, setQueueMenu] = useState(null);
  useEffect(() => {
    if (!queueMenu) {
      return void 0;
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
  const loadHome = async () => {
    setLoading(true);
    setError("");
    try {
      const nextHome = await invoke("habitos:get-home");
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
    void loadHome();
  }, []);
  const openTaskEditor = (source = null) => {
    setTaskDraft(createTaskDraft(source));
    setTaskAdvancedOpen(Boolean(source?.notes || source?.time || source?.reminderAt || source?.subitems?.length));
    setModalMode("task");
  };
  const openHabitEditor = (source = null) => {
    setHabitDraft(createHabitDraft(source));
    setHabitStep(0);
    setModalMode("habit");
  };
  const openCreateChooser = () => {
    setModalMode("create");
  };
  const closeWorkbench = () => {
    setModalMode("overview");
    setTaskDraft(createTaskDraft());
    setHabitDraft(createHabitDraft());
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
      const nextHome = await invoke(channel, payload);
      applyHomeUpdate(nextHome);
      await onSuccess?.(nextHome);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo completar la operacion.");
    } finally {
      setSaving(false);
    }
  };
  const handleTaskDraftChange = (field, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };
  const handleTaskSubitemChange = (index, field, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      subitems: currentValue.subitems.map((entry, entryIndex) => entryIndex === index ? {
        ...entry,
        [field]: value
      } : entry)
    }));
  };
  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    await runMutation(
      "habitos:save-task",
      {
        ...taskDraft,
        reminderAt: taskDraft.reminderAt ? new Date(taskDraft.reminderAt).toISOString() : null
      },
      {
        onSuccess: closeWorkbench
      }
    );
  };
  const handleHabitSubmit = async (event) => {
    event.preventDefault();
    if (habitStep < HABIT_WIZARD_STEPS.length - 1) {
      setHabitStep((currentValue) => currentValue + 1);
      return;
    }
    await runMutation(
      "habitos:save-habit",
      {
        ...habitDraft,
        scheduleConfigJson: {
          weekdays: habitDraft.scheduleType === "weekdays" ? habitDraft.weekdays : []
        }
      },
      {
        onSuccess: closeWorkbench
      }
    );
  };
  const handleToggleQueueItem = async (item) => {
    setQueueMenu((currentValue) => currentValue?.item?.id === item.id ? null : currentValue);
    if (item.type === "task") {
      await runMutation("habitos:toggle-task", {
        taskId: item.recordId
      });
      return;
    }
    await runMutation("habitos:toggle-occurrence", {
      occurrenceId: item.recordId
    });
  };
  const handleDeleteQueueItem = async (item) => {
    if (item.type === "task") {
      await runMutation("habitos:delete-task", {
        taskId: item.raw?.id || item.recordId
      });
      return;
    }
    await runMutation("habitos:delete-habit", {
      habitId: item.habit?.id
    });
  };
  const renderSecondaryTask = (task) => /* @__PURE__ */ React2.createElement(
    "button",
    {
      key: task.id,
      type: "button",
      className: "habitosView__secondaryCard",
      onClick: () => openTaskEditor(task)
    },
    /* @__PURE__ */ React2.createElement("strong", null, task.title),
    /* @__PURE__ */ React2.createElement("span", null, formatLocalDate(task.dueDate), task.time ? ` - ${task.time}` : "")
  );
  const handleOpenQueueMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setQueueMenu({
      x: event.clientX,
      y: event.clientY,
      item
    });
  };
  return /* @__PURE__ */ React2.createElement(WorkspacePage, { className: "habitosView" }, /* @__PURE__ */ React2.createElement(WorkspaceBody, null, /* @__PURE__ */ React2.createElement(ScrollRegion, null, /* @__PURE__ */ React2.createElement(PanelStack, null, error ? /* @__PURE__ */ React2.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React2.createElement(SectionPanel, null, /* @__PURE__ */ React2.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React2.createElement("div", { className: "habitosView__panelActions" }, /* @__PURE__ */ React2.createElement(IconButton, { type: "button", tone: "primary", title: "Crear nuevo", onClick: openCreateChooser }, /* @__PURE__ */ React2.createElement(PlusIcon, null)))
    },
    /* @__PURE__ */ React2.createElement(PanelTitle, { title: "Tareas pendientes" })
  ), loading ? /* @__PURE__ */ React2.createElement(StateBlock, { title: "Cargando..." }) : home.dailyQueue.length ? /* @__PURE__ */ React2.createElement("div", { className: "habitosView__queueList" }, home.dailyQueue.map((item) => /* @__PURE__ */ React2.createElement(
    QueueItemCard,
    {
      key: item.id,
      item,
      isSelected: queueMenu?.item?.id === item.id,
      onToggle: () => void handleToggleQueueItem(item),
      onContextMenu: handleOpenQueueMenu
    }
  ))) : /* @__PURE__ */ React2.createElement(StateBlock, { title: "No hay tareas pendientes." })), /* @__PURE__ */ React2.createElement(
    SecondaryListCard,
    {
      title: "Tareas proximas",
      items: home.upcomingTasks,
      emptyTitle: "Sin tareas proximas.",
      renderItem: renderSecondaryTask
    }
  )))), queueMenu?.item ? /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "habitosView__contextMenu",
      style: {
        position: "fixed",
        top: `${queueMenu.y}px`,
        left: `${queueMenu.x}px`,
        zIndex: 1400
      },
      onMouseDown: (event) => event.stopPropagation(),
      onContextMenu: (event) => event.preventDefault()
    },
    /* @__PURE__ */ React2.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          setQueueMenu(null);
          if (queueMenu.item.type === "task") {
            openTaskEditor(queueMenu.item.raw);
            return;
          }
          openHabitEditor(queueMenu.item.habit);
        }
      },
      "Editar"
    ),
    /* @__PURE__ */ React2.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          setQueueMenu(null);
          void handleDeleteQueueItem(queueMenu.item);
        }
      },
      "Eliminar"
    )
  ) : null, /* @__PURE__ */ React2.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "create",
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React2.createElement(
      CreateChooserModal,
      {
        onTask: () => {
          openTaskEditor();
        },
        onHabit: () => {
          openHabitEditor();
        },
        onCancel: () => {
          closeWorkbench();
        }
      }
    )
  ), /* @__PURE__ */ React2.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "task",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React2.createElement(
      TaskEditor,
      {
        draft: taskDraft,
        advancedOpen: taskAdvancedOpen,
        saving,
        onChange: handleTaskDraftChange,
        onSubitemChange: handleTaskSubitemChange,
        onAddSubitem: () => {
          setTaskDraft((currentValue) => ({
            ...currentValue,
            subitems: [
              ...currentValue.subitems,
              {
                id: "",
                title: "",
                isCompleted: false
              }
            ]
          }));
        },
        onRemoveSubitem: (index) => {
          setTaskDraft((currentValue) => ({
            ...currentValue,
            subitems: currentValue.subitems.filter((_, entryIndex) => entryIndex !== index)
          }));
        },
        onToggleAdvanced: () => setTaskAdvancedOpen((currentValue) => !currentValue),
        onSubmit: handleTaskSubmit,
        onCancel: () => closeWorkbench()
      }
    )
  ), /* @__PURE__ */ React2.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "habit",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React2.createElement(
      HabitEditor,
      {
        draft: habitDraft,
        step: habitStep,
        saving,
        onChange: (field, value) => {
          setHabitDraft((currentValue) => ({
            ...currentValue,
            [field]: value
          }));
        },
        onToggleWeekday: (weekday) => {
          setHabitDraft((currentValue) => {
            const exists = currentValue.weekdays.includes(weekday);
            return {
              ...currentValue,
              weekdays: exists ? currentValue.weekdays.filter((entry) => entry !== weekday) : [...currentValue.weekdays, weekday].sort((left, right) => left - right)
            };
          });
        },
        onBack: () => setHabitStep((currentValue) => Math.max(0, currentValue - 1)),
        onNext: () => setHabitStep((currentValue) => Math.min(HABIT_WIZARD_STEPS.length - 1, currentValue + 1)),
        onSubmit: handleHabitSubmit,
        onCancel: () => closeWorkbench()
      }
    )
  ));
}

// ../nexus-plugins/habitos/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = HABITOS_PLUGIN_ID;
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var habitosRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerView({
      id: HABITOS_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Habitos y tareas",
      icon: HabitosIcon,
      tone: "document",
      surface: "workspace",
      component: (props) => /* @__PURE__ */ React.createElement(HabitosView, { ...props, ctx })
    });
    ctx.registerSideToolbarButton({
      id: "nexus.habitos.workspace-button",
      pluginId: ctx.pluginId,
      order: 270,
      icon: HabitosIcon,
      tone: "document",
      label: "Habitos",
      onClick: () => {
        void ctx.openView({
          viewId: HABITOS_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.habitos.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === HABITOS_WORKSPACE_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = habitosRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
