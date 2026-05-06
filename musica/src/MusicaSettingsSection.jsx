const { useEffect, useMemo, useState } = window.React;
import {
  buildFolderOptions,
  MUSICA_ENGINE_ID,
  readEngineAssignments,
  writeEngineAssignments,
} from "./renderer-helpers.js";

function createEmptyAssignment() {
  return {
    rootPath: "",
    recursive: true,
  };
}

export default function MusicaSettingsSection({ ctx }) {
  const baseSettings = ctx.settings.useValue();
  const [draftAssignments, setDraftAssignments] = useState(() =>
    readEngineAssignments(baseSettings),
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const folderOptions = useMemo(() => {
    const itemsState = ctx.getItems();
    return buildFolderOptions(itemsState.byId, itemsState.rootId);
  }, [ctx]);

  useEffect(() => {
    setDraftAssignments(readEngineAssignments(baseSettings));
  }, [baseSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const normalizedAssignments = draftAssignments.filter((assignment) => assignment.rootPath);
      const nextSettings = writeEngineAssignments(baseSettings, normalizedAssignments);

      await ctx.settings.set(nextSettings);
      setNotice("Carpetas guardadas. Musica ya reacciona en vivo a estas asignaciones.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar las carpetas musicales.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="musicaPluginSettings">
      <div className="musicaPluginSettings__copy">
        <strong>Carpetas reclamadas por el engine musical</strong>
        <p>
          Solo los audios dentro de estas carpetas se trataran como musica indexada por
          <code>{MUSICA_ENGINE_ID}</code>.
        </p>
      </div>

      <div className="musicaPluginSettings__list">
        {draftAssignments.length ? (
          draftAssignments.map((assignment, index) => (
            <div className="musicaPluginSettings__row" key={`${assignment.rootPath}-${index}`}>
              <select
                value={assignment.rootPath}
                onChange={(event) =>
                  setDraftAssignments((currentValue) =>
                    currentValue.map((entry, entryIndex) =>
                      entryIndex === index
                        ? {
                            ...entry,
                            rootPath: event.target.value,
                          }
                        : entry,
                    ),
                  )
                }
                disabled={saving}
              >
                <option value="">Selecciona una carpeta</option>
                {folderOptions.map((option) => (
                  <option key={option.rootPath || "__vault__"} value={option.rootPath}>
                    {option.rootPath || "Vault completo"}
                  </option>
                ))}
              </select>

              <label className="musicaPluginSettings__checkbox">
                <input
                  type="checkbox"
                  checked={assignment.recursive}
                  onChange={(event) =>
                    setDraftAssignments((currentValue) =>
                      currentValue.map((entry, entryIndex) =>
                        entryIndex === index
                          ? {
                              ...entry,
                              recursive: event.target.checked,
                            }
                          : entry,
                      ),
                    )
                  }
                  disabled={saving}
                />
                <span>Recursiva</span>
              </label>

              <button
                type="button"
                className="musicaPluginSettings__secondaryButton"
                onClick={() =>
                  setDraftAssignments((currentValue) =>
                    currentValue.filter((_entry, entryIndex) => entryIndex !== index),
                  )
                }
                disabled={saving}
              >
                Quitar
              </button>
            </div>
          ))
        ) : (
          <div className="musicaPluginSettings__empty">
            Sin carpetas asignadas todavia. Fuera de estas carpetas, los audios usaran el
            fallback global del host.
          </div>
        )}
      </div>

      <div className="musicaPluginSettings__actions">
        <button
          type="button"
          className="musicaPluginSettings__secondaryButton"
          onClick={() =>
            setDraftAssignments((currentValue) => [...currentValue, createEmptyAssignment()])
          }
          disabled={saving}
        >
          Agregar carpeta
        </button>
        <button
          type="button"
          className="musicaPluginSettings__primaryButton"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar carpetas"}
        </button>
      </div>

      {notice ? <div className="musicaPluginSettings__notice">{notice}</div> : null}
      {error ? <div className="musicaPluginSettings__error">{error}</div> : null}
    </div>
  );
}
