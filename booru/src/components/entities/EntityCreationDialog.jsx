import { Button, Field, Input, Notice, TextArea } from "@nexus/ui";

const React = window.React;
const { useState } = React;

function parseAliasNames(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export default function EntityCreationDialog({
  kind,
  name,
  invoke,
  entityKindLabels,
  onCancel,
  onCreated,
}) {
  const [primaryName, setPrimaryName] = useState(() => String(name || "").trim());
  const [aliasText, setAliasText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const kindLabel = entityKindLabels?.[kind] || "Entidad";

  const submit = async () => {
    const trimmedName = primaryName.trim();
    if (!trimmedName || busy) return;
    setBusy(true);
    setError("");

    try {
      const result = await invoke("booru:ensure-entity", {
        kind,
        name: trimmedName,
        aliasNames: parseAliasNames(aliasText),
      });
      onCreated?.(result || null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : `No se pudo crear ${kindLabel}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="booruEntityCreation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booru-entity-creation-title"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="booruEntityCreation__header">
        <strong id="booru-entity-creation-title">Crear {kindLabel}</strong>
      </div>

      <Field label="Nombre principal">
        <Input
          value={primaryName}
          onChange={(event) => setPrimaryName(event.target.value)}
          autoFocus
          autoComplete="off"
          disabled={busy}
        />
      </Field>

      <Field
        label="Otros nombres"
        description="Uno por linea. Tambien sirven para buscar y seleccionar esta entidad."
      >
        <TextArea
          value={aliasText}
          onChange={(event) => setAliasText(event.target.value)}
          placeholder="Nombre alternativo"
          rows={3}
          disabled={busy}
        />
      </Field>

      {error ? <Notice tone="danger">{error}</Notice> : null}

      <div className="booruEntityCreation__actions">
        <Button type="button" onClick={() => onCancel?.()} disabled={busy}>Cancelar</Button>
        <Button type="submit" tone="primary" disabled={!primaryName.trim() || busy}>
          {busy ? "Guardando" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
