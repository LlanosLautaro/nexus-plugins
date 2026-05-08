const { useEffect, useMemo, useState } = window.React;
import {
  buildFolderOptions,
  BOOKS_ENGINE_ID,
  readBooksEngineAssignments,
  writeBooksEngineAssignments,
} from "./renderer-helpers.js";

function createEmptyAssignment() {
  return {
    rootPath: "",
    recursive: true,
  };
}

function getAssignmentsSignature(assignments) {
  return JSON.stringify(
    Array.isArray(assignments)
      ? assignments.map((assignment) => ({
          rootPath: String(assignment?.rootPath || ""),
          recursive: Boolean(assignment?.recursive),
        }))
      : [],
  );
}

export default function BooksSettingsSection({ ctx }) {
  const baseSettings = ctx.settings.useValue();
  const persistedAssignments = useMemo(
    () => readBooksEngineAssignments(baseSettings),
    [baseSettings],
  );
  const persistedAssignmentsSignature = useMemo(
    () => getAssignmentsSignature(persistedAssignments),
    [persistedAssignments],
  );
  const [draftAssignments, setDraftAssignments] = useState(() =>
    persistedAssignments,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const itemsState = ctx.getItems();
  const folderOptions = buildFolderOptions(itemsState.byId, itemsState.rootId);

  useEffect(() => {
    setDraftAssignments((currentValue) =>
      getAssignmentsSignature(currentValue) === persistedAssignmentsSignature
        ? currentValue
        : persistedAssignments,
    );
  }, [persistedAssignmentsSignature]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const normalizedAssignments = draftAssignments.filter((assignment) => assignment.rootPath);
      const nextSettings = writeBooksEngineAssignments(baseSettings, normalizedAssignments);

      await ctx.settings.set(nextSettings);
      setNotice("Carpetas guardadas. Books reacciona en vivo a estas asignaciones.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar las carpetas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booksPluginSettings">
      <div className="booksPluginSettings__copy">
        <strong>Carpetas reclamadas por Books</strong>
        <p>
          Solo los PDFs dentro de estas carpetas se trataran como biblioteca indexada por
          <code>{BOOKS_ENGINE_ID}</code>.
        </p>
      </div>

      <div className="booksPluginSettings__list">
        {draftAssignments.length ? (
          draftAssignments.map((assignment, index) => (
            <div className="booksPluginSettings__row" key={`${assignment.rootPath}-${index}`}>
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

              <label className="booksPluginSettings__checkbox">
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
                className="booksPluginSettings__secondaryButton"
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
          <div className="booksPluginSettings__empty">
            Sin carpetas asignadas todavia. Fuera de estas carpetas, los PDFs siguen usando el viewer host.
          </div>
        )}
      </div>

      <div className="booksPluginSettings__actions">
        <button
          type="button"
          className="booksPluginSettings__secondaryButton"
          onClick={() =>
            setDraftAssignments((currentValue) => [...currentValue, createEmptyAssignment()])
          }
          disabled={saving}
        >
          Agregar carpeta
        </button>
        <button
          type="button"
          className="booksPluginSettings__primaryButton"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar carpetas"}
        </button>
      </div>

      {notice ? <div className="booksPluginSettings__notice">{notice}</div> : null}
      {error ? <div className="booksPluginSettings__error">{error}</div> : null}
    </div>
  );
}
