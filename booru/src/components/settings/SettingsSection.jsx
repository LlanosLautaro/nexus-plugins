import {
  Button,
  Field,
  Input,
  MetricCard,
  Notice,
  ReloadIcon,
  SectionPanel,
  Select,
  StateBlock,
} from "@nexus/ui";
import { FolderIcon } from "../../icons.jsx";

const React = window.React;
const { useEffect, useState } = React;

async function invoke(channel, payload) {
  const response = await pluginIpc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo actualizar las plataformas.");
  return response.data;
}


export default function SettingsSection({
  snapshot,
  busyAction,
  loading,
  onRefresh,
  onRescan,
  onRestart,
  onOpenDuplicates,
  onOpenTrash,
  onOpenPath,
}) {
  const [platforms, setPlatforms] = useState([]);
  const [platformName, setPlatformName] = useState("");
  const [iconResourceId, setIconResourceId] = useState("");
  const [resources, setResources] = useState([]);
  const [platformError, setPlatformError] = useState("");
  const loadPlatforms = async () => {
    const result = await invoke("booru:list-social-platforms");
    setPlatforms(Array.isArray(result?.items) ? result.items : []);
  };
  useEffect(() => { void loadPlatforms().catch((error) => setPlatformError(error.message)); }, []);
  useEffect(() => {
    void invoke("booru:list-resources", { section: "media", limit: 80 }).then((result) => {
      setResources(Array.isArray(result?.items) ? result.items : []);
    }).catch(() => setResources([]));
  }, []);
  const pasteIcon = async () => {
    const capture = await window.nexus.clipboard.captureMedia("booru-platform-icon");
    const result = await invoke("booru:import-social-platform-icon", { grantId: capture.grantId });
    setIconResourceId(result?.resource?.id || "");
  };
  const savePlatform = async () => {
    const result = await invoke("booru:save-social-platform", { displayName: platformName, iconResourceId: iconResourceId || null });
    if (result?.platform) {
      setPlatformName("");
      setIconResourceId("");
      await loadPlatforms();
    }
  };
  const importFileIcon = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const grant = await window.nexus.drag.grantFile(file);
    if (!grant?.grantId) return;
    const result = await invoke("booru:import-social-platform-icon-file", { grantId: grant.grantId });
    setIconResourceId(result?.resource?.id || "");
    event.target.value = "";
  };
  const deletePlatform = async (platform) => {
    const preview = await invoke("booru:delete-social-platform", { platformId: platform.id });
    if (!preview?.affectedProfiles?.length || window.confirm(`Esta plataforma esta usada por: ${preview.affectedProfiles.map((item) => item.displayName).join(", ")}. Se eliminaran esos enlaces. Continuar?`)) {
      await invoke("booru:delete-social-platform", { platformId: platform.id, confirmed: true });
      await loadPlatforms();
    }
  };
  return (
    <div className="booruView__content booruView__content--metrics">
      <div className="booruView__metrics">
        <MetricCard eyebrow="Total" value={String(snapshot?.stats?.totalCount || 0)} description="Catalogo" />
        <MetricCard eyebrow="Pendientes" value={String(snapshot?.stats?.pendingCount || 0)} description="Cola real" />
        <MetricCard eyebrow="Duplicados" value={String(snapshot?.stats?.duplicateCount || 0)} description="Revision exacta" />
        <MetricCard eyebrow="Papelera" value={String(snapshot?.stats?.trashCount || 0)} description="Interna" />
        <MetricCard eyebrow="Basico" value={String(snapshot?.stats?.classifiedBasicCount || 0)} description="Completos" />
        <MetricCard eyebrow="Image" value={String(snapshot?.stats?.imageCount || 0)} description="Preview" />
        <MetricCard eyebrow="Video/GIF" value={String((snapshot?.stats?.videoCount || 0) + (snapshot?.stats?.gifCount || 0))} description="Animados" />
        <MetricCard eyebrow="Thumbs ready" value={String(snapshot?.stats?.thumbnailReadyCount || 0)} description="Derivados listos" />
        <MetricCard eyebrow="Thumbs backlog" value={String(snapshot?.stats?.thumbnailBacklogCount || 0)} description="Pendientes o error" />
      </div>

      <div className="booruView__metricsPanels">
        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Ajustes</span>
            <div className="booruView__settingsActions">
              <Button type="button" onClick={() => onOpenDuplicates?.()}>
                <span>Duplicados</span>
                <small>{snapshot?.stats?.duplicateCount || 0}</small>
              </Button>
              <Button type="button" onClick={() => onOpenTrash?.()}>
                <span>Papelera</span>
                <small>{snapshot?.stats?.trashCount || 0}</small>
              </Button>
            </div>
            <span className="booruView__suggestionsHint">
              La busqueda principal ahora compone chips de tags y filtros estructurados; no busca por filename.
            </span>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Plataformas de redes</span>
            <Field label="Nueva plataforma" className="booruView__field">
              <div className="booruView__entityInputRow">
                <Input value={platformName} onChange={(event) => setPlatformName(event.target.value)} placeholder="Nombre de la red" />
                <Button type="button" onClick={() => void pasteIcon()}>Pegar icono</Button>
                <label className="nexus-ui-button"><span>Elegir archivo</span><input type="file" accept="image/png,image/svg+xml,image/*" onChange={(event) => void importFileIcon(event)} hidden /></label>
                <Button type="button" tone="primary" onClick={() => void savePlatform()} disabled={!platformName.trim()}>Guardar</Button>
              </div>
            </Field>
            <Field label="O usar recurso existente" className="booruView__field">
              <Select value={iconResourceId} onChange={(event) => setIconResourceId(event.target.value)}>
                <option value="">Sin icono</option>
                {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.originalFilename}</option>)}
              </Select>
            </Field>
            {iconResourceId ? <span className="booruView__suggestionsHint">Icono preparado desde recurso {iconResourceId.slice(0, 8)}.</span> : null}
            {platformError ? <Notice tone="danger">{platformError}</Notice> : null}
            <div className="booruView__tagRow">
              {platforms.length ? platforms.map((platform) => (
                <span key={platform.id} className="booruView__selectionChip">
                  <span>{platform.displayName}{platform.profileCount ? ` (${platform.profileCount})` : ""}</span>
                  <button type="button" className="booruView__selectionChipRemove" onClick={() => void deletePlatform(platform)} aria-label={`Eliminar ${platform.displayName}`}>x</button>
                </span>
              )) : <span className="booruView__suggestionsHint">Todavia no hay plataformas registradas.</span>}
            </div>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Watcher y runtime</span>
            <StateBlock
              title={snapshot?.watcher?.active ? "Watcher activo" : "Watcher inactivo"}
              description={snapshot?.watcher?.watchedPath || "Todavia no hay carpeta vigilada configurada."}
            />
            {snapshot?.derivatives?.lastError ? (
              <Notice tone="danger">{snapshot.derivatives.lastError}</Notice>
            ) : null}
            <div className="booruView__pathActions">
              <Button
                type="button"
                onClick={() => void onRescan?.()}
                disabled={busyAction === "rescan"}
              >
                Releer carpeta
              </Button>
              <Button
                type="button"
                onClick={() => void onRestart?.()}
                disabled={busyAction === "restart"}
              >
                Reiniciar watcher
              </Button>
              <Button
                type="button"
                onClick={() => void onRefresh?.()}
                disabled={loading}
              >
                <ReloadIcon size={15} />
                <span>Actualizar</span>
              </Button>
              <Button
                type="button"
                onClick={() => onOpenPath?.(snapshot?.storage?.root)}
                disabled={!snapshot?.storage?.root}
              >
                <FolderIcon size={15} />
                <span>Ver storage</span>
              </Button>
              <Button
                type="button"
                onClick={() => onOpenPath?.(snapshot?.settings?.watchFolderPath)}
                disabled={!snapshot?.settings?.watchFolderPath}
              >
                <FolderIcon size={15} />
                <span>Ver carpeta vigilada</span>
              </Button>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack">
            <span className="booruView__groupLabel">Python y storage</span>
            <StateBlock
              title={snapshot?.python?.available ? "Python disponible" : "Python no disponible"}
              description={
                snapshot?.python?.available
                  ? snapshot.python.resolvedExecutable || snapshot.python.command
                  : snapshot?.python?.error || "Booru necesita Python para su pipeline interno."
              }
            />
            <div className="booruView__runtimeMeta">
              <span>DB: {snapshot?.storage?.catalogPath || "Sin catalogo"}</span>
              <span>Media: {snapshot?.storage?.mediaRoot || "Sin carpeta media"}</span>
              <span>Duplicados: {snapshot?.storage?.duplicatesRoot || "Sin carpeta duplicates"}</span>
              <span>Thumbs: {snapshot?.storage?.thumbsRoot || "Sin carpeta thumbs"}</span>
              <span>Worker activos: {snapshot?.derivatives?.activeCount || 0}</span>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel className="booruView__panel">
          <div className="booruView__statusStack booruView__syntaxGuide">
            <span className="booruView__groupLabel">Sintaxis de busqueda</span>
            <p className="booruView__syntaxGuideCopy">
              Los terminos sueltos son tags. Tambien acepta prefijos tipados, negativos y un faltante publico a la vez.
            </p>
            <div className="booruView__syntaxExamples">
              {[
                "jinx",
                "-artist:foo",
                "persona:ana",
                "reality:ficticio missing:artist",
                "universe:\"Blue Archive\"",
                "char:\"Hatsune Miku\"",
              ].map((example) => (
                <span key={example} className="booruView__selectionChip booruView__selectionChip--syntax">
                  {example}
                </span>
              ))}
            </div>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
import { pluginIpc } from "../../ipc-client.js";
