import { Button, Field, Notice } from "../../../../../nexus-frontend/src/ui/index.js";

const React = window.React;
const { useState } = React;

export default function CharacterCreationDialog({
  name,
  invoke,
  SingleEntityField,
  onCancel,
  onCreated,
}) {
  const [universe, setUniverse] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!universe?.id || busy) return;
    setBusy(true);
    setError("");

    try {
      const result = await invoke("booru:ensure-character-in-universe", {
        name,
        universeId: universe.id,
      });
      onCreated?.(result?.entity || null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear el Character.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="booruCharacterCreation" role="dialog" aria-modal="true" aria-labelledby="booru-character-creation-title">
      <div className="booruCharacterCreation__header">
        <strong id="booru-character-creation-title">Crear Character</strong>
        <span>{name}</span>
      </div>

      <Field
        label="Universe (requerido)"
        description="Busca uno existente o crea un Universe normal antes de confirmar."
      >
        <SingleEntityField
          kind="universe"
          label="Universe"
          value={universe}
          onChange={setUniverse}
          disabled={busy}
          placeholder="Buscar o crear Universe"
          buttonLabel="Elegir"
        />
      </Field>

      {error ? <Notice tone="danger">{error}</Notice> : null}

      <div className="booruCharacterCreation__actions">
        <Button type="button" onClick={() => onCancel?.()} disabled={busy}>Cancelar</Button>
        <Button type="button" tone="primary" onClick={() => void submit()} disabled={!universe?.id || busy}>
          Crear
        </Button>
      </div>
    </div>
  );
}
