import {
  Button,
  Checkbox,
  Select,
} from "@nexus/ui";
import {
  buildFolderOptions,
  hydrateAssignmentsWithFolderOptions,
  MUSICA_ENGINE_ID,
  readEngineAssignments,
  resolveFolderOptionForAssignment,
  writeEngineAssignments,
} from "./renderer-helpers.js";

const { useEffect, useMemo, useState } = window.React;

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

export default function MusicaSettingsSection({ ctx }) {
  const baseSettings = ctx.settings.useValue();
  const itemsState = ctx.getItems();
  const folderOptions = buildFolderOptions(itemsState.byId, itemsState.rootId);
  const folderOptionsById = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions],
  );
  const persistedAssignments = useMemo(
    () => readEngineAssignments(baseSettings),
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
            <div
              className="musicaPluginSettings__row"
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
                label="Recursiva"
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

              <Button
                type="button"
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
          <div className="musicaPluginSettings__empty">
            Sin carpetas asignadas todavia. Fuera de estas carpetas, los audios usaran el
            fallback global del host.
          </div>
        )}
      </div>

      <div className="musicaPluginSettings__actions">
        <Button
          type="button"
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
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar carpetas"}
        </Button>
      </div>

      {notice ? <div className="musicaPluginSettings__notice">{notice}</div> : null}
      {error ? <div className="musicaPluginSettings__error">{error}</div> : null}
    </div>
  );
}
