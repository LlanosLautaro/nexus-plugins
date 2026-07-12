import { Button, MetricCard, Notice, SectionPanel, StateBlock } from "../../../../../nexus-frontend/src/ui/index.js";
import { FolderIcon, RefreshIcon } from "../../icons.jsx";


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
                <RefreshIcon size={15} />
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
