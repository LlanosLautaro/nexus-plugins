import {
  Button,
  Field,
  InlineField,
  Notice,
  StateBlock,
} from "@nexus/ui";

const React = window.React;
const { useEffect, useMemo, useState } = React;
const ipcRenderer = window.nexus.ipc;

const LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";
const TRAINING_MANAGED_DOC_GROUP_ORDER = ["Ejercicios", "Musculos"];

function invoke(channel, payload) {
  return ipcRenderer.invoke(channel, payload).then((response) => {
    if (!response?.ok) {
      throw new Error(response?.error || "No se pudo ejecutar la operacion.");
    }

    return response.data;
  });
}

function getTrainingManagedDocStatusLabel(status) {
  if (status === "original") {
    return "Original";
  }
  if (status === "missing") {
    return "Faltante";
  }
  return "Editada";
}

function formatImportSummary(result) {
  const summary = result?.summary || {};
  const muscles = summary.muscles || {};
  const exercises = summary.exercises || {};
  const routines = summary.routines || {};

  return [
    `Musculos ${Number(muscles.updated || 0)} actualizados`,
    `Ejercicios ${Number(exercises.created || 0)} creados / ${Number(exercises.updated || 0)} actualizados`,
    `Rutinas ${Number(routines.created || 0)} creadas / ${Number(routines.updated || 0)} actualizadas`,
  ].join(" | ");
}

export default function TrainingHostSettingsSection() {
  const [library, setLibrary] = useState({
    exercises: [],
    muscles: [],
    routines: [],
  });
  const [managedDocs, setManagedDocs] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [managedDocsLoading, setManagedDocsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [singleKind, setSingleKind] = useState("exercise");
  const [singleId, setSingleId] = useState("");
  const [importText, setImportText] = useState("");

  const singleOptions = useMemo(() => {
    if (singleKind === "muscle") {
      return (library.muscles || []).map((muscle) => ({
        id: muscle.id,
        label: muscle.title,
      }));
    }

    if (singleKind === "routine") {
      return (library.routines || []).map((routine) => ({
        id: routine.id,
        label: routine.title,
      }));
    }

    return (library.exercises || []).map((exercise) => ({
      id: exercise.id,
      label: exercise.title,
    }));
  }, [library.exercises, library.muscles, library.routines, singleKind]);

  const docsByGroup = useMemo(() => {
    const groups = new Map();
    for (const group of TRAINING_MANAGED_DOC_GROUP_ORDER) {
      groups.set(group, []);
    }

    for (const doc of Array.isArray(managedDocs) ? managedDocs : []) {
      const groupKey = TRAINING_MANAGED_DOC_GROUP_ORDER.includes(doc?.group)
        ? doc.group
        : TRAINING_MANAGED_DOC_GROUP_ORDER[TRAINING_MANAGED_DOC_GROUP_ORDER.length - 1];
      groups.get(groupKey).push(doc);
    }

    return TRAINING_MANAGED_DOC_GROUP_ORDER
      .map((group) => ({
        group,
        docs: groups.get(group) || [],
      }))
      .filter((entry) => entry.docs.length > 0);
  }, [managedDocs]);

  useEffect(() => {
    if (singleId && singleOptions.some((option) => option.id === singleId)) {
      return;
    }
    setSingleId("");
  }, [singleId, singleOptions]);

  const loadLibrary = async () => {
    setLibraryLoading(true);

    try {
      const data = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list`);
      setLibrary({
        exercises: Array.isArray(data?.exercises) ? data.exercises : [],
        muscles: Array.isArray(data?.muscles) ? data.muscles : [],
        routines: Array.isArray(data?.routines) ? data.routines : [],
      });
    } finally {
      setLibraryLoading(false);
    }
  };

  const loadManagedDocs = async () => {
    setManagedDocsLoading(true);

    try {
      const data = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list-managed-docs`);
      setManagedDocs(Array.isArray(data?.managedDocs) ? data.managedDocs : []);
    } finally {
      setManagedDocsLoading(false);
    }
  };

  const loadAll = async () => {
    setError("");

    try {
      await Promise.all([loadLibrary(), loadManagedDocs()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los ajustes de entrenamiento.");
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleCopyAll = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    setWarnings([]);

    try {
      const data = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:export`, { kind: "all" });
      window.nexus.clipboard.writeText(JSON.stringify(data, null, 2));
      setNotice("JSON copiado.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "No se pudo copiar el export.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyOne = async () => {
    if (!singleId) {
      setError("Selecciona un registro para copiar.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    setWarnings([]);

    try {
      const data = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:export`, {
        kind: singleKind,
        id: singleId,
      });
      window.nexus.clipboard.writeText(JSON.stringify(data, null, 2));
      setNotice("JSON copiado.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "No se pudo copiar el export.");
    } finally {
      setBusy(false);
    }
  };

  const handlePasteClipboard = () => {
    setImportText(window.nexus.clipboard.readText() || "");
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      setError("Pega un JSON antes de importar.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    setWarnings([]);

    try {
      const result = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:import`, {
        text: importText,
      });
      setNotice(formatImportSummary(result));
      setWarnings(Array.isArray(result?.warnings) ? result.warnings : []);
      await loadAll();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "No se pudo importar entrenamiento.");
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreDoc = async (doc) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:restore-managed-doc`, {
        id: doc?.id,
      });
      setManagedDocs(Array.isArray(result?.managedDocs) ? result.managedDocs : []);
      setNotice("Nota restaurada.");
      await loadLibrary();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la nota.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lifeTrackerTrainingSettings">
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}
      {warnings.length ? <Notice tone="warning">{warnings.join(" ")}</Notice> : null}

      <div className="lifeTrackerTrainingSettings__section">
        <div className="lifeTrackerTrainingSettings__sectionHeader">
          <strong>Importar / exportar</strong>
        </div>

        <div className="lifeTrackerTrainingSettings__actions">
          <Button type="button" tone="secondary" onClick={() => void handleCopyAll()} disabled={busy}>
            Copiar todo
          </Button>

          <div className="lifeTrackerTrainingSettings__copyRow">
            <InlineField label="Tipo">
              <select value={singleKind} onChange={(event) => setSingleKind(event.target.value)} disabled={busy || libraryLoading}>
                <option value="exercise">Ejercicio</option>
                <option value="muscle">Musculo</option>
                <option value="routine">Rutina</option>
              </select>
            </InlineField>

            <InlineField label="Registro" grow>
              <select value={singleId} onChange={(event) => setSingleId(event.target.value)} disabled={busy || libraryLoading || !singleOptions.length}>
                <option value="">Selecciona uno</option>
                {singleOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </InlineField>

            <Button type="button" tone="secondary" onClick={() => void handleCopyOne()} disabled={busy || libraryLoading || !singleOptions.length}>
              Copiar uno
            </Button>
          </div>

          <Field label="JSON" wide>
            <textarea
              rows="10"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder='{"version":1,"muscles":[],"exercises":[],"routines":[]}'
              disabled={busy}
            />
          </Field>

          <div className="lifeTrackerTrainingSettings__actions lifeTrackerTrainingSettings__actions--inline">
            <Button type="button" tone="secondary" onClick={handlePasteClipboard} disabled={busy}>
              Pegar
            </Button>
            <Button type="button" tone="primary" onClick={() => void handleImport()} disabled={busy}>
              Importar
            </Button>
          </div>
        </div>
      </div>

      <div className="lifeTrackerTrainingSettings__divider" />

      <div className="lifeTrackerTrainingSettings__section">
        <div className="lifeTrackerTrainingSettings__sectionHeader">
          <strong>Notas gestionadas</strong>
          <Button type="button" tone="secondary" onClick={() => void loadAll()} disabled={busy || managedDocsLoading}>
            Recargar
          </Button>
        </div>

        {managedDocsLoading ? (
          <StateBlock title="Cargando notas gestionadas..." />
        ) : docsByGroup.length ? (
          <div className="lifeTrackerTrainingSettings__groups">
            {docsByGroup.map((entry) => (
              <div key={entry.group} className="lifeTrackerTrainingSettings__group">
                <div className="lifeTrackerTrainingSettings__groupHeader">
                  <strong>{entry.group}</strong>
                  <span>{entry.docs.length}</span>
                </div>

                <div className="lifeTrackerTrainingSettings__rows">
                  {entry.docs.map((doc) => (
                    <div key={doc.id} className="lifeTrackerTrainingSettings__row">
                      <div className="lifeTrackerTrainingSettings__rowCopy">
                        <strong>{doc.label}</strong>
                        <span>{doc.currentRelativePath || doc.relativePath}</span>
                      </div>

                      <div className="lifeTrackerTrainingSettings__rowActions">
                        <span
                          className={[
                            "lifeTrackerTrainingSettings__status",
                            `is-${doc.status || "edited"}`,
                          ].join(" ")}
                        >
                          {getTrainingManagedDocStatusLabel(doc.status)}
                        </span>

                        <Button type="button" tone="secondary" onClick={() => void handleRestoreDoc(doc)} disabled={busy}>
                          Restaurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <StateBlock title="Sin notas gestionadas." />
        )}
      </div>
    </div>
  );
}
