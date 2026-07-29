const React = window.React;
const {
  useEffect,
  useRef,
  useState,
} = React;

import {
  Button,
  Field,
  FieldGrid,
  CyberIconButton,
  Notice,
  PanelHeader,
  PanelTitle,
  SectionPanel,
} from "@nexus/ui";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  HabitosIcon,
  PlusIcon,
  TrashIcon,
} from "../icons.jsx";
import { todayLocalDate } from "./drafts.js";

function EditorSection({
  title,
  description = "",
  children,
}) {
  return (
    <div className="habitosView__wizardStep">
      {title ? (
        <div className="habitosView__sectionIntro">
          <strong>{title}</strong>
          {description ? <span>{description}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
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
  const hasCurrentValue = Number.isFinite(currentValue);
  const normalizedCurrentValue = hasCurrentValue
    ? currentValue
    : Number.isFinite(minValue)
      ? minValue
      : 0;
  const isDecrementDisabled = disabled
    || (Number.isFinite(minValue) && normalizedCurrentValue <= minValue && hasCurrentValue);
  const isIncrementDisabled = disabled
    || (Number.isFinite(maxValue) && normalizedCurrentValue >= maxValue && hasCurrentValue);

  const commitValue = (rawValue) => {
    onCommit?.(rawValue);
  };

  const adjustValue = (direction) => {
    if (disabled) {
      return;
    }

    const nextBaseValue = hasCurrentValue ? currentValue : normalizedCurrentValue;
    let nextValue = nextBaseValue + (stepValue * direction);

    if (Number.isFinite(minValue)) {
      nextValue = Math.max(minValue, nextValue);
    }

    if (Number.isFinite(maxValue)) {
      nextValue = Math.min(maxValue, nextValue);
    }

    const serializedValue = String(nextValue);
    onChange(serializedValue);
    commitValue(serializedValue);
  };

  return (
    <div className="habitosView__numberStepper">
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

function useDragReorder(resetKey, onMoveItem) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const dragIntentRef = useRef(null);

  useEffect(() => {
    dragIntentRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  }, [resetKey]);

  const resetDragState = () => {
    dragIntentRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      resetDragState();
      return;
    }

    onMoveItem?.(draggedIndex, targetIndex);
    resetDragState();
  };

  return {
    draggedIndex,
    dropIndex,
    dragIntentRef,
    resetDragState,
    handleDrop,
    setDraggedIndex,
    setDropIndex,
  };
}

function ChecklistDraftEditor({
  items = [],
  disabled = false,
  addLabel = "Agregar item",
  itemPlaceholder = "Item",
  centeredAction = false,
  onAddItem,
  onChangeItem,
  onRemoveItem,
  onMoveItem,
}) {
  const dragResetKey = items.map((item, index) => item.id || `${index}:${item.title || ""}`).join("|");
  const {
    draggedIndex,
    dropIndex,
    dragIntentRef,
    handleDrop,
    resetDragState,
    setDraggedIndex,
    setDropIndex,
  } = useDragReorder(dragResetKey, onMoveItem);

  return (
    <div className="habitosView__subitemEditor">
      <div className="habitosView__sectionIntro">
        <strong>Sub-items</strong>
      </div>

      {items.length ? (
        <div className="habitosView__subitemsDraft">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className={[
                "habitosView__subitemDraftRow",
                draggedIndex === index ? "is-dragging" : "",
                dropIndex === index && draggedIndex !== index ? "is-drop-target" : "",
              ].filter(Boolean).join(" ")}
              draggable={!disabled && items.length > 1}
              onDragStart={(event) => {
                if (disabled || dragIntentRef.current !== index) {
                  event.preventDefault();
                  return;
                }

                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
                setDraggedIndex(index);
                setDropIndex(index);
              }}
              onDragEnd={resetDragState}
              onDragOver={(event) => {
                if (disabled || draggedIndex === null) {
                  return;
                }

                event.preventDefault();
                if (dropIndex !== index) {
                  setDropIndex(index);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(index);
              }}
            >
              <button
                type="button"
                className="habitosView__subitemDragHandle"
                aria-label="Reordenar item"
                draggable={false}
                disabled={disabled || items.length <= 1}
                onPointerDown={() => {
                  dragIntentRef.current = index;
                }}
                onPointerUp={() => {
                  dragIntentRef.current = null;
                }}
                onPointerCancel={() => {
                  dragIntentRef.current = null;
                }}
              >
                <span />
                <span />
              </button>

              <input
                value={item.title}
                onChange={(event) => onChangeItem?.(index, event.target.value)}
                placeholder={typeof itemPlaceholder === "function" ? itemPlaceholder(index) : itemPlaceholder}
                disabled={disabled}
              />

              <CyberIconButton
                type="button"
                aria-label="Eliminar item"
                tone="danger"
                onClick={() => onRemoveItem?.(index)}
                disabled={disabled}
              >
                <TrashIcon />
              </CyberIconButton>
            </div>
          ))}
        </div>
      ) : null}

      <div className={centeredAction ? "habitosView__centeredAction" : ""}>
        <Button type="button" onClick={onAddItem} disabled={disabled}>
          <PlusIcon />
          <span>{addLabel}</span>
        </Button>
      </div>
    </div>
  );
}

function CreateChoiceCard({
  title,
  description,
  icon = null,
  onClick,
}) {
  return (
    <button type="button" className="habitosView__createChoice" onClick={onClick}>
      {icon ? (
        <span className="habitosView__createChoiceIcon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

export function FloatingWorkbenchModal({
  isVisible = false,
  saving = false,
  layout = "modal",
  onClose,
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

export function CreateChooserModal({
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
        <CreateChoiceCard
          title="Tarea simple"
          description="Actividad de instancia unica sin repeticion ni seguimiento historico."
          icon={<ClockIcon />}
          onClick={onTask}
        />

        <CreateChoiceCard
          title="Habito"
          description="Actividad recurrente con seguimiento diario y formas de evaluacion distintas."
          icon={<HabitosIcon />}
          onClick={onHabit}
        />

        <CreateChoiceCard
          title="Rutina de ejercicios"
          description="Asigna una rutina existente con recurrencia propia y seguimiento simple o detallado."
          onClick={onRoutine}
        />
      </div>

      <div className="habitosView__editorActions">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </SectionPanel>
  );
}

export function TaskEditor({
  draft,
  advancedOpen,
  saving,
  renderCategoryPicker,
  onChange,
  onAddSubitem,
  onChangeSubitemTitle,
  onMoveSubitem,
  onRemoveSubitem,
  onToggleAdvanced,
  onCommitNumber,
  onSubmit,
  onCancel,
}) {
  const taskIsCompleted = draft.status === "completed";

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
        <EditorSection title="Base">
          <FieldGrid>
            <Field label="Nombre" wide>
              <input
                value={draft.title}
                onChange={(event) => onChange("title", event.target.value)}
                placeholder="Ej. Llamar al tecnico"
                required
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

          {renderCategoryPicker?.({
            selectedCategory: draft.category,
            onSelectCategory: (value) => onChange("category", value),
            saving,
          })}
        </EditorSection>

        <EditorSection title="Sub-items">
          {taskIsCompleted ? (
            <Notice tone="info">
              Reabre la tarea para cambiar sus sub-items o su bloqueo.
            </Notice>
          ) : null}

          <ChecklistDraftEditor
            items={draft.subitems}
            disabled={saving || taskIsCompleted}
            addLabel="Agregar sub-item"
            itemPlaceholder={(index) => `Paso ${index + 1}`}
            onAddItem={onAddSubitem}
            onChangeItem={onChangeSubitemTitle}
            onMoveItem={onMoveSubitem}
            onRemoveItem={onRemoveSubitem}
          />
        </EditorSection>

        {advancedOpen ? (
          <EditorSection title="Avanzado">
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
                    disabled={taskIsCompleted}
                  />
                  <span>Los sub-items bloquean el completado</span>
                </label>
              </div>
            </FieldGrid>
          </EditorSection>
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

function HabitEvaluationFields({
  draft,
  saving,
  quantityModeOptions,
  onChange,
  onCommitNumber,
}) {
  if (draft.progressMode === "yes-no") {
    return (
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
    );
  }

  if (draft.progressMode === "quantity") {
    return (
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
              disabled={saving}
            >
              {quantityModeOptions.map((option) => (
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
              placeholder="Objetivo"
              disabled={saving || draft.quantityMode === "no-target"}
            />

            <input
              value={draft.quantityUnit}
              onChange={(event) => onChange("quantityUnit", event.target.value)}
              placeholder="Unidad"
              disabled={saving}
            />

            <span className="habitosView__quantitySuffix">en el dia</span>
          </div>
        </Field>
      </FieldGrid>
    );
  }

  if (draft.progressMode === "checklist") {
    return (
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

        <ChecklistDraftEditor
          items={draft.checklistItems}
          disabled={saving}
          addLabel="Agregar item"
          itemPlaceholder="item"
          centeredAction
          onAddItem={() => onChange("addChecklistItem")}
          onChangeItem={(index, value) => onChange("checklistItem", { index, value })}
          onMoveItem={(fromIndex, toIndex) => onChange("moveChecklistItem", { fromIndex, toIndex })}
          onRemoveItem={(index) => onChange("removeChecklistItem", index)}
        />
      </>
    );
  }

  return null;
}

export function HabitEditor({
  draft,
  step,
  saving,
  wizardError,
  stepLabels,
  progressOptions,
  quantityModeOptions,
  weekdayOptions,
  renderCategoryPicker,
  onChange,
  onSelectProgressMode,
  onToggleWeekday,
  onBack,
  onNext,
  onCommitNumber,
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(draft.id);
  const isLastStep = step === stepLabels.length - 1;
  const progressOption = progressOptions.find((option) => option.value === draft.progressMode) || null;

  return (
    <SectionPanel tone="highlight" className="habitosView__modalPanel">
      <PanelHeader>
        <PanelTitle title={isEditing ? "Editar habito" : "Nuevo habito"} />
      </PanelHeader>

      <form className="habitosView__editorForm" onSubmit={onSubmit}>
        <div className="habitosView__modalStep">
          <span>Paso {step + 1} de {stepLabels.length}</span>
          <strong>{stepLabels[step]?.label || "Paso"}</strong>
        </div>

        {wizardError ? (
          <Notice tone="danger">
            {wizardError}
          </Notice>
        ) : null}

        {step === 0 ? (
          renderCategoryPicker?.({
            selectedCategory: draft.category,
            onSelectCategory: (value) => onChange("category", value),
            saving,
          })
        ) : null}

        {step === 1 ? (
          <EditorSection
            title="Evaluacion"
            description={isEditing && progressOption
              ? `Tipo actual: ${progressOption.label}. En esta pasada no se puede convertir.`
              : "Define como quieres registrar el progreso de este habito."}
          >
            {!isEditing ? (
              <div className="habitosView__wizardOptionGrid habitosView__wizardOptionGrid--stacked">
                {progressOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "habitosView__wizardOptionCard",
                      draft.progressMode === option.value ? "is-selected" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => onSelectProgressMode(option.value)}
                    disabled={saving}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {draft.progressMode ? (
              <HabitEvaluationFields
                draft={draft}
                saving={saving}
                quantityModeOptions={quantityModeOptions}
                onChange={onChange}
                onCommitNumber={onCommitNumber}
              />
            ) : null}
          </EditorSection>
        ) : null}

        {step === 2 ? (
          <EditorSection title="Frecuencia">
            <Field label="Frecuencia">
              <select
                value={draft.scheduleType}
                onChange={(event) => onChange("scheduleType", event.target.value)}
                disabled={saving}
              >
                <option value="daily">Todos los dias</option>
                <option value="weekdays">Dias de la semana</option>
              </select>
            </Field>

            {draft.scheduleType === "weekdays" ? (
              <div className="habitosView__weekdayGrid">
                {weekdayOptions.map((option) => {
                  const active = draft.weekdays.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" ")}
                      onClick={() => onToggleWeekday(option.value)}
                      disabled={saving}
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
          </EditorSection>
        ) : null}

        {step === 3 ? (
          <EditorSection title="Operativa">
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
                    disabled={saving}
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
                    disabled={saving}
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
                      disabled={saving}
                    />
                    <span className="habitosView__quantitySuffix">dias</span>
                  </div>
                </Field>
              </FieldGrid>
            ) : null}

            <FieldGrid>
              <Field label="Hora">
                <input
                  type="time"
                  value={draft.time}
                  onChange={(event) => onChange("time", event.target.value)}
                  disabled={saving}
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
                  disabled={saving}
                />
              </Field>

              <Field label="Notas" wide>
                <textarea
                  rows="3"
                  value={draft.notes}
                  onChange={(event) => onChange("notes", event.target.value)}
                  placeholder="Criterio simple de uso diario."
                  disabled={saving}
                />
              </Field>
            </FieldGrid>
          </EditorSection>
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
                {saving ? "Guardando..." : isEditing ? "Guardar habito" : "Crear habito"}
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
