const React = window.React;
const {
  startTransition,
  useEffect,
  useState,
} = React;

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
  SectionPanel,
  StateBlock,
  WorkspaceBody,
  WorkspacePage,
} from "../../../nexus-frontend/src/ui/index.js";
import {
  HABIT_WIZARD_STEPS,
  TASK_PRIORITY_OPTIONS,
  WEEKDAY_OPTIONS,
} from "./constants.js";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "./icons.jsx";

const { ipcRenderer } = window.require("electron");

function todayLocalDate() {
  const now = new Date();
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
    subitems: Array.isArray(source?.subitems) && source.subitems.length
      ? source.subitems.map((entry) => ({
          id: entry.id || "",
          title: entry.title || "",
          isCompleted: Boolean(entry.isCompleted),
        }))
      : [],
  };
}

function createHabitDraft(source = null) {
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays)
      ? source.scheduleConfigJson.weekdays
      : [1, 2, 3, 4, 5],
    startDate: source?.startDate || todayLocalDate(),
    endDate: source?.endDate || "",
    time: source?.time || "",
    priority: String(source?.priority || 2),
    notes: source?.notes || "",
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

function QueueItemCard({
  item,
  isSelected = false,
  onToggle,
  onContextMenu,
}) {
  const accent = getQueueAccent(item);

  return (
    <article
      className={[
        "habitosView__queueItem",
        item.isOverdue ? "is-overdue" : "",
        isSelected ? "is-selected" : "",
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
        <span>{item.type === "habit" ? "Habito" : "Tarea"}</span>
      </div>

      <button
        type="button"
        className="habitosView__queueCheck"
        onClick={onToggle}
        title={item.status === "completed" ? "Reabrir" : "Completar"}
        aria-label={item.status === "completed" ? "Reabrir" : "Completar"}
        aria-pressed={item.status === "completed" ? "true" : "false"}
      >
        {item.status === "completed" ? <CheckIcon /> : null}
      </button>
    </article>
  );
}

function FloatingWorkbenchModal({
  isVisible,
  saving = false,
  onClose,
  children,
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="habitosView__modalBackdrop"
      onClick={() => {
        if (!saving) {
          onClose?.();
        }
      }}
    >
      <div className="habitosView__modalShell" onClick={(event) => event.stopPropagation()}>
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
          <strong>Tarea simple</strong>
          <span>Resolver algo puntual.</span>
        </button>

        <button type="button" className="habitosView__createChoice" onClick={onHabit}>
          <strong>Habito base</strong>
          <span>Repetir una rutina.</span>
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
            <select value={draft.priority} onChange={(event) => onChange("priority", event.target.value)}>
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                  <IconButton type="button" title="Quitar sub-item" tone="danger" onClick={() => onRemoveSubitem(index)}>
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
  step,
  saving,
  onChange,
  onToggleWeekday,
  onBack,
  onNext,
  onSubmit,
  onCancel,
}) {
  const isLastStep = step === HABIT_WIZARD_STEPS.length - 1;

  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel">
      <PanelHeader>
        <PanelTitle title={draft.id ? "Editar habito" : "Nuevo habito"} />
      </PanelHeader>

      <form className="habitosView__editorForm" onSubmit={onSubmit}>
        <div className="habitosView__modalStep">
          <span>Paso {step + 1} de {HABIT_WIZARD_STEPS.length}</span>
          <strong>{HABIT_WIZARD_STEPS[step]?.label || "Paso"}</strong>
        </div>

        {step === 0 ? (
          <FieldGrid>
            <Field label="Nombre" wide>
              <input
                value={draft.title}
                onChange={(event) => onChange("title", event.target.value)}
                placeholder="Ej. Leer 20 minutos"
                required
              />
            </Field>

            <Field label="Categoria">
              <input
                value={draft.category}
                onChange={(event) => onChange("category", event.target.value)}
                placeholder="Salud, estudio, finanzas..."
              />
            </Field>
          </FieldGrid>
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
              <select value={draft.priority} onChange={(event) => onChange("priority", event.target.value)}>
                {TASK_PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                {saving ? "Guardando..." : draft.id ? "Guardar habito" : "Crear habito"}
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
      [field]: value,
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

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    await runMutation(
      "habitos:save-task",
      {
        ...taskDraft,
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
      setHabitStep((currentValue) => currentValue + 1);
      return;
    }

    await runMutation(
      "habitos:save-habit",
      {
        ...habitDraft,
        scheduleConfigJson: {
          weekdays: habitDraft.scheduleType === "weekdays" ? habitDraft.weekdays : [],
        },
      },
      {
        onSuccess: closeWorkbench,
      },
    );
  };

  const handleToggleQueueItem = async (item) => {
    setQueueMenu((currentValue) => (
      currentValue?.item?.id === item.id ? null : currentValue
    ));

    if (item.type === "task") {
      await runMutation("habitos:toggle-task", {
        taskId: item.recordId,
      });
      return;
    }

    await runMutation("habitos:toggle-occurrence", {
      occurrenceId: item.recordId,
    });
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

  const renderSecondaryTask = (task) => (
    <button
      key={task.id}
      type="button"
      className="habitosView__secondaryCard"
      onClick={() => openTaskEditor(task)}
    >
      <strong>{task.title}</strong>
      <span>{formatLocalDate(task.dueDate)}{task.time ? ` - ${task.time}` : ""}</span>
    </button>
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

  return (
    <WorkspacePage className="habitosView">
      <WorkspaceBody>
        <ScrollRegion>
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
                    <IconButton type="button" tone="primary" title="Crear nuevo" onClick={openCreateChooser}>
                      <PlusIcon />
                    </IconButton>
                  </div>
                )}
              >
                <PanelTitle title="Tareas pendientes" />
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
                      onToggle={() => void handleToggleQueueItem(item)}
                      onContextMenu={handleOpenQueueMenu}
                    />
                  ))}
                </div>
              ) : (
                <StateBlock title="No hay tareas pendientes." />
              )}
            </SectionPanel>

            <SecondaryListCard
              title="Tareas proximas"
              items={home.upcomingTasks}
              emptyTitle="Sin tareas proximas."
              renderItem={renderSecondaryTask}
            />
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
          step={habitStep}
          saving={saving}
          onChange={(field, value) => {
            setHabitDraft((currentValue) => ({
              ...currentValue,
              [field]: value,
            }));
          }}
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
          onBack={() => setHabitStep((currentValue) => Math.max(0, currentValue - 1))}
          onNext={() => setHabitStep((currentValue) => Math.min(HABIT_WIZARD_STEPS.length - 1, currentValue + 1))}
          onSubmit={handleHabitSubmit}
          onCancel={() => closeWorkbench()}
        />
      </FloatingWorkbenchModal>
    </WorkspacePage>
  );
}
