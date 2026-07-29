const { useEffect, useMemo, useState } = window.React;
import { Button, Checkbox, Notice, Select, StateBlock } from "@nexus/ui";
import {
  buildFolderOptions,
  BOOKS_ENGINE_ID,
  hydrateAssignmentsWithFolderOptions,
  readBooksEngineAssignments,
  resolveFolderOptionForAssignment,
  writeBooksEngineAssignments,
} from "./renderer-helpers.js";

function createEmptyAssignment() {
  return {
    rootItemId: "",
    rootPath: "",
    recursive: true,
  };
}

function getAssignmentSelectValue(assignment) {
  if (assignment?.rootItemId) {
    return assignment.rootItemId;
  }

  const rootPath = String(assignment?.rootPath || "");
  return rootPath ? `legacy:${rootPath}` : "";
}

function getAssignmentsSignature(assignments) {
  return JSON.stringify(
    Array.isArray(assignments)
      ? assignments.map((assignment) => ({
          rootItemId: String(assignment?.rootItemId || ""),
          rootPath: String(assignment?.rootPath || ""),
          recursive: Boolean(assignment?.recursive),
        }))
      : [],
  );
}

export default function BooksSettingsSection({ ctx }) {
  const baseSettings = ctx.settings.useValue();
  const itemsState = ctx.getItems();
  const folderOptions = buildFolderOptions(itemsState.byId, itemsState.rootId);
  const folderOptionsById = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions],
  );
  const persistedAssignments = useMemo(
    () => readBooksEngineAssignments(baseSettings),
    [baseSettings],
  );
  const hydratedPersistedAssignments = useMemo(
    () => hydrateAssignmentsWithFolderOptions(persistedAssignments, folderOptions),
    [folderOptions, persistedAssignments],
  );
  const persistedAssignmentsSignature = useMemo(
    () => getAssignmentsSignature(hydratedPersistedAssignments),
    [hydratedPersistedAssignments],
  );
  const legacyFolderOptions = useMemo(
    () =>
      hydratedPersistedAssignments
        .filter(
          (assignment) =>
            (assignment?.rootItemId || assignment?.rootPath)
            && !resolveFolderOptionForAssignment(assignment, folderOptions),
        )
        .map((assignment, index) => ({
          id: assignment.rootItemId || `legacy:${assignment.rootPath}`,
          label: `${assignment.rootPath || assignment.rootItemId} (sin resolver)`,
          key: `${assignment.rootItemId || assignment.rootPath}:${index}`,
        })),
    [folderOptions, hydratedPersistedAssignments],
  );
  const [draftAssignments, setDraftAssignments] = useState(() =>
    hydratedPersistedAssignments,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftAssignments((currentValue) =>
      getAssignmentsSignature(currentValue) === persistedAssignmentsSignature
        ? currentValue
        : hydratedPersistedAssignments,
    );
  }, [hydratedPersistedAssignments, persistedAssignmentsSignature]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const normalizedAssignments = draftAssignments.filter((assignment) => assignment.rootItemId);
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
            <div
              className="booksPluginSettings__row"
              key={`${assignment.rootItemId || assignment.rootPath || "empty"}-${index}`}
            >
              <Select
                value={getAssignmentSelectValue(assignment)}
                onChange={(event) =>
                  setDraftAssignments((currentValue) =>
                    currentValue.map((entry, entryIndex) =>
                      entryIndex !== index
                        ? entry
                        : (() => {
                            const nextValue = event.target.value;
                            const nextOption = folderOptionsById.get(nextValue) || null;

                            if (!nextValue) {
                              return {
                                ...entry,
                                rootItemId: "",
                                rootPath: "",
                              };
                            }

                            if (nextOption) {
                              return {
                                ...entry,
                                rootItemId: nextOption.id,
                                rootPath: nextOption.rootPath,
                              };
                            }

                            return {
                              ...entry,
                              rootItemId: "",
                              rootPath: nextValue.replace(/^legacy:/, ""),
                            };
                          })(),
                    ),
                  )
                }
                disabled={saving}
              >
                <option value="">Selecciona una carpeta</option>
                {folderOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.rootPath || "Vault completo"}
                  </option>
                ))}
                {legacyFolderOptions.map((option) => (
                  <option key={option.key} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Checkbox
                  className="booksPluginSettings__checkbox"
                  checked={assignment.recursive}
                  label="Recursiva"
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

              <Button
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
              </Button>
            </div>
          ))
        ) : (
          <StateBlock
            className="booksPluginSettings__empty"
            title="Sin carpetas asignadas"
            description="Fuera de estas carpetas, los PDFs siguen usando el viewer host."
          />
        )}
      </div>

      <div className="booksPluginSettings__actions">
        <Button
          type="button"
          className="booksPluginSettings__secondaryButton"
          onClick={() =>
            setDraftAssignments((currentValue) => [...currentValue, createEmptyAssignment()])
          }
          disabled={saving}
        >
          Agregar carpeta
        </Button>
        <Button
          type="button"
          tone="primary"
          className="booksPluginSettings__primaryButton"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar carpetas"}
        </Button>
      </div>

      {notice ? <Notice tone="success" className="booksPluginSettings__notice">{notice}</Notice> : null}
      {error ? <Notice tone="danger" className="booksPluginSettings__error">{error}</Notice> : null}
    </div>
  );
}
