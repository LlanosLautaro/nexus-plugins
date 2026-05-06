const { useEffect, useMemo, useState } = window.React;

const { ipcRenderer } = window.require("electron");

function normalizeFieldValue(field, value) {
  if (field.type === "boolean") {
    return Boolean(value);
  }

  if (field.type === "string-list") {
    return Array.isArray(value) ? value.map((entry) => String(entry ?? "")) : [];
  }

  if (field.type === "number") {
    if (value == null || value === "") {
      return "";
    }

    return String(value);
  }

  return value == null ? "" : String(value);
}

function normalizeFormValues(definition, values = {}) {
  return Object.fromEntries(
    (definition?.fields || []).map((field) => [
      field.name,
      normalizeFieldValue(field, values?.[field.name]),
    ]),
  );
}

function areValuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function MetadataField({ field, value, disabled, onChange, inputId }) {
  if (field.type === "textarea") {
    return (
      <textarea
        id={inputId}
        className="musicaMetadata__textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder || ""}
        disabled={disabled}
        rows={4}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        id={inputId}
        className="musicaMetadata__input"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder || ""}
        disabled={disabled}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="musicaMetadata__checkbox">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "string-list") {
    const entries = Array.isArray(value) ? value : [];

    return (
      <div className="musicaMetadata__list">
        {entries.length ? (
          entries.map((entryValue, index) => (
            <div className="musicaMetadata__listRow" key={`${field.name}-${index}`}>
              <input
                id={index === 0 ? inputId : undefined}
                className="musicaMetadata__input"
                type="text"
                value={entryValue}
                onChange={(event) => {
                  const nextEntries = [...entries];
                  nextEntries[index] = event.target.value;
                  onChange(nextEntries);
                }}
                placeholder={field.placeholder || field.label}
                disabled={disabled}
              />

              <button
                type="button"
                className="musicaMetadata__secondaryButton"
                onClick={() => {
                  onChange(entries.filter((_entry, entryIndex) => entryIndex !== index));
                }}
                disabled={disabled}
              >
                Quitar
              </button>
            </div>
          ))
        ) : (
          <div className="musicaMetadata__emptyList">Sin valores cargados todavia.</div>
        )}

        <button
          type="button"
          className="musicaMetadata__secondaryButton"
          onClick={() => onChange([...(entries || []), ""])}
          disabled={disabled}
        >
          {field.addLabel || "Agregar"}
        </button>
      </div>
    );
  }

  return (
    <input
      id={inputId}
      className="musicaMetadata__input"
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder || ""}
      disabled={disabled}
    />
  );
}

export default function PluginMetadataForm({ itemId, formInstance, onSubmitted }) {
  const definition = formInstance?.definition || null;
  const normalizedInitialValues = useMemo(
    () => normalizeFormValues(definition, formInstance?.values),
    [definition, formInstance?.values],
  );
  const [baseValues, setBaseValues] = useState(normalizedInitialValues);
  const [draftValues, setDraftValues] = useState(normalizedInitialValues);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    setBaseValues(normalizedInitialValues);
    setDraftValues(normalizedInitialValues);
    setSubmitError("");
    setNotices([]);
  }, [normalizedInitialValues]);

  const isDirty = useMemo(
    () => !areValuesEqual(baseValues, draftValues),
    [baseValues, draftValues],
  );

  if (!definition) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!itemId || !isDirty || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setNotices([]);

    try {
      const response = await ipcRenderer.invoke("metadata:submit-form", {
        itemId,
        resourceId: definition.resourceId,
        variantId: definition.variantId,
        values: draftValues,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar la metadata musical.");
      }

      const nextValues = normalizeFormValues(definition, response.data?.values);
      setBaseValues(nextValues);
      setDraftValues(nextValues);
      setNotices(Array.isArray(response.data?.notices) ? response.data.notices : []);
      await onSubmitted?.(response.data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la metadata musical.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="musicaMetadata" onSubmit={handleSubmit}>
      <div className="musicaMetadata__body">
        <div className="musicaMetadata__header">
          <div>
            <h3>{definition.title}</h3>
            {definition.description ? <p>{definition.description}</p> : null}
          </div>
        </div>

        <div className="musicaMetadata__grid">
          {(definition.fields || []).map((field) => {
            const inputId = `musica-metadata-${field.name}`;

            return (
              <div
                className={[
                  "musicaMetadata__field",
                  field.type === "boolean" && "musicaMetadata__field--boolean",
                  field.type === "string-list" && "musicaMetadata__field--string-list",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={field.name}
              >
                {field.type !== "boolean" ? (
                  <div className="musicaMetadata__labelRow">
                    <label htmlFor={inputId}>{field.label}</label>
                    {field.description ? <p>{field.description}</p> : null}
                  </div>
                ) : (
                  <div className="musicaMetadata__labelRow">
                    {field.description ? <p>{field.description}</p> : null}
                  </div>
                )}

                <MetadataField
                  field={field}
                  value={draftValues[field.name]}
                  disabled={submitting}
                  onChange={(nextValue) =>
                    setDraftValues((currentValue) => ({
                      ...currentValue,
                      [field.name]: nextValue,
                    }))
                  }
                  inputId={inputId}
                />
              </div>
            );
          })}
        </div>

        {submitError ? (
          <div className="musicaMetadata__state musicaMetadata__state--error">
            {submitError}
          </div>
        ) : null}

        {notices.length ? (
          <div className="musicaMetadata__notices">
            {notices.map((notice, index) => (
              <div className="musicaMetadata__state" key={`${notice}-${index}`}>
                {notice}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="musicaMetadata__actions">
        <button
          type="button"
          className="musicaMetadata__secondaryButton"
          disabled={submitting || !isDirty}
          onClick={() => {
            setDraftValues(baseValues);
            setSubmitError("");
            setNotices([]);
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="musicaMetadata__primaryButton"
          disabled={submitting || !isDirty}
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
