const {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} = window.React;

import {
  ActionMenu,
  Button,
  Checkbox,
  CyberIconButton,
  Input,
  LoadingIndicator,
  Notice,
  SearchField,
  StateBlock,
  TextArea,
  WorkspaceBody,
  WorkspacePage,
  WorkspaceTopbar,
  WorkspaceTitle,
} from "@nexus/ui";
import {
  DEFAULT_SETTINGS,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  normalizeSettings,
  normalizeSidebarWidth,
} from "./settings.js";
import { DragIcon, FolderIcon, GlobeIcon, MoreIcon, TrashIcon } from "./icons.jsx";
import {
  filterTabs,
  getVirtualRange,
  reorderBefore,
  resolveTabIconUrl,
  shouldSendTabOnDoubleClick,
} from "./ui-helpers.mjs";

const ipcRenderer = pluginIpc;
const TAB_DRAG_TYPE = "nexus.tab-repository.tab";
const GROUP_DRAG_TYPE = "nexus.tab-repository.group";

async function invoke(channel, payload = {}) {
  const response = await ipcRenderer.invoke(channel, payload);
  if (!response?.ok) {
    const error = new Error(response?.error?.message || "La operación no pudo completarse.");
    error.code = response?.error?.code || "tab_repository_error";
    error.details = response?.error?.details;
    throw error;
  }
  return response.data;
}

function Modal({ title, description = "", children, actions, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="tabRepositoryModal" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section aria-modal="true" className="tabRepositoryModal__surface" role="dialog">
        <header className="tabRepositoryModal__header">
          <strong>{title}</strong>
          {description ? <p>{description}</p> : null}
        </header>
        <div className="tabRepositoryModal__body">{children}</div>
        <footer className="tabRepositoryModal__actions">{actions}</footer>
      </section>
    </div>
  );
}

function useVirtualRows(items, rowHeight) {
  const viewportRef = useRef(null);
  const [metrics, setMetrics] = useState({ scrollTop: 0, height: 480 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const update = () => setMetrics({ scrollTop: viewport.scrollTop, height: viewport.clientHeight || 480 });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(viewport);
    viewport.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer?.disconnect();
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  const { start, end } = getVirtualRange({
    itemCount: items.length,
    rowHeight,
    scrollTop: metrics.scrollTop,
    viewportHeight: metrics.height,
  });
  return {
    viewportRef,
    totalHeight: items.length * rowHeight,
    visible: items.slice(start, end).map((item, offset) => ({ item, index: start + offset })),
  };
}

function SiteIcon({ tab, fallback = "globe" }) {
  const iconUrl = resolveTabIconUrl(tab);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [iconUrl]);

  return (
    <span className="tabRepositorySiteIcon" aria-hidden="true">
      {iconUrl && !failed ? (
        <img
          alt=""
          decoding="async"
          draggable="false"
          loading="lazy"
          referrerPolicy="no-referrer"
          src={iconUrl}
          onError={() => setFailed(true)}
        />
      ) : fallback === "folder" ? <FolderIcon /> : <GlobeIcon />}
    </span>
  );
}

function SidebarResizeHandle({ width, onChange, onCommit }) {
  const dragState = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  const finishResize = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    onCommit(widthRef.current);
  };

  return (
    <div
      aria-label="Redimensionar barra lateral de grupos"
      aria-orientation="vertical"
      aria-valuemax={MAX_SIDEBAR_WIDTH}
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuenow={width}
      className="tabRepositorySidebarResizeHandle"
      role="separator"
      tabIndex={0}
      onKeyDown={(event) => {
        const delta = event.key === "ArrowLeft" ? -12 : event.key === "ArrowRight" ? 12 : 0;
        const next = event.key === "Home"
          ? MIN_SIDEBAR_WIDTH
          : event.key === "End"
            ? MAX_SIDEBAR_WIDTH
            : delta
              ? normalizeSidebarWidth(width + delta)
              : width;
        if (next === width) return;
        event.preventDefault();
        widthRef.current = next;
        onChange(next);
        onCommit(next);
      }}
      onPointerCancel={finishResize}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragState.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragState.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const nextWidth = normalizeSidebarWidth(drag.startWidth + event.clientX - drag.startX);
        widthRef.current = nextWidth;
        onChange(nextWidth);
      }}
      onPointerUp={finishResize}
    />
  );
}

function RowMenu({ tab, groups, trashed, onMove, onTrash, onRestore }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const menuGroups = trashed ? [{
    id: "trash",
    items: [{ id: "restore", label: "Restaurar", onClick: onRestore }],
  }] : [{
    id: "move",
    items: [{
      id: "move",
      label: "Mover a grupo",
      children: [
        { id: "ungrouped", label: "Sin grupo", onClick: () => onMove(null) },
        ...groups.map((group) => ({
          id: group.id,
          label: group.name,
          onClick: () => onMove(group.id),
        })),
      ],
    }],
  }, {
    id: "danger",
    items: [{ id: "trash", label: "Mover a papelera", danger: true, onClick: onTrash }],
  }];

  return (
    <div className="tabRepositoryRowMenu">
      <CyberIconButton label="Más acciones" onClick={() => setOpen((value) => !value)} ref={anchorRef}>
        <MoreIcon />
      </CyberIconButton>
      {open ? (
        <ActionMenu
          anchorRef={anchorRef}
          ariaLabel={`Acciones de ${tab.title || tab.url}`}
          groups={menuGroups}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function TabRow({
  ctx,
  tab,
  groups,
  selected,
  selectedIds,
  showTitle,
  showUrl,
  trashed,
  canReorder,
  disabled,
  style,
  onSelect,
  onMove,
  onReorder,
  onSend,
  onTrash,
  onRestore,
}) {
  const dnd = ctx.ReactDnd;
  const [{ isDragging }, dragRef] = dnd.useDrag(() => ({
    type: TAB_DRAG_TYPE,
    item: { tabIds: selected ? selectedIds : [tab.id] },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [selected, selectedIds, tab.id]);
  const [{ isOver }, dropRef] = dnd.useDrop(() => ({
    accept: TAB_DRAG_TYPE,
    canDrop: () => canReorder,
    drop: (item, monitor) => {
      if (!monitor.didDrop()) onReorder(item.tabIds, tab.id);
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) && monitor.canDrop() }),
  }), [canReorder, onReorder, tab.id]);
  const setDropNode = (node) => dropRef(node);

  return (
    <div
      className={[
        "tabRepositoryRow",
        selected && "is-selected",
        isDragging && "is-dragging",
        isOver && "is-drop-target",
      ].filter(Boolean).join(" ")}
      ref={setDropNode}
      style={style}
      onDoubleClick={(event) => {
        if (shouldSendTabOnDoubleClick(event.target, { disabled, trashed })) onSend(tab.id);
      }}
    >
      <span className="tabRepositoryRow__drag" ref={dragRef} aria-hidden="true"><DragIcon /></span>
      <Checkbox
        aria-label={`Seleccionar ${tab.title || tab.url}`}
        checked={selected}
        onChange={(event) => onSelect(tab.id, event.target.checked)}
      />
      <SiteIcon tab={tab} />
      <div className="tabRepositoryRow__identity">
        {showTitle ? <strong>{tab.title || tab.url}</strong> : null}
        {showUrl ? <span>{tab.url}</span> : null}
      </div>
      <span className="tabRepositoryRow__domain">{tab.domain}</span>
      {!trashed ? (
        <CyberIconButton disabled={disabled} label="Enviar a Brave" onClick={() => onSend(tab.id)}>
          <GlobeIcon />
        </CyberIconButton>
      ) : null}
      <RowMenu
        groups={groups}
        onMove={(groupId) => onMove([tab.id], groupId)}
        onRestore={() => onRestore([tab.id])}
        onTrash={() => onTrash([tab.id])}
        tab={tab}
        trashed={trashed}
      />
    </div>
  );
}

function GroupRow({ ctx, group, representativeTab, active, onSelect, onDropTabs, onReorder, onRename, onDelete }) {
  const dnd = ctx.ReactDnd;
  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [{ isDragging }, dragRef] = dnd.useDrag(() => ({
    type: GROUP_DRAG_TYPE,
    item: { groupId: group.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [group.id]);
  const [{ isOver }, dropRef] = dnd.useDrop(() => ({
    accept: [TAB_DRAG_TYPE, GROUP_DRAG_TYPE],
    drop: (item) => {
      if (item.tabIds) onDropTabs(item.tabIds, group.id);
      if (item.groupId && item.groupId !== group.id) onReorder(item.groupId, group.id);
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [group.id, onDropTabs, onReorder]);
  const setRowRef = (node) => {
    dragRef(node);
    dropRef(node);
  };

  return (
    <div
      className={[
        "tabRepositorySidebar__group",
        active && "is-active",
        isDragging && "is-dragging",
        isOver && "is-drop-target",
      ].filter(Boolean).join(" ")}
      ref={setRowRef}
    >
      <button type="button" onClick={onSelect}>
        <SiteIcon fallback="folder" tab={representativeTab} />
        <span>{group.name}</span>
        <small>{group.count}</small>
      </button>
      <CyberIconButton label={`Acciones de ${group.name}`} onClick={() => setMenuOpen((value) => !value)} ref={anchorRef}>
        <MoreIcon />
      </CyberIconButton>
      {menuOpen ? (
        <ActionMenu
          anchorRef={anchorRef}
          ariaLabel={`Acciones de ${group.name}`}
          groups={[{ id: "group", items: [
            { id: "rename", label: "Renombrar", onClick: onRename },
            { id: "delete", label: "Eliminar grupo", description: "Las tabs pasarán a Sin grupo", danger: true, onClick: onDelete },
          ] }]}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </div>
  );
}

function SidebarDropButton({ ctx, className = "", active, children, onClick, onDropTabs }) {
  const [{ isOver }, dropRef] = ctx.ReactDnd.useDrop(() => ({
    accept: TAB_DRAG_TYPE,
    drop: (item) => onDropTabs(item.tabIds),
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [onDropTabs]);
  return (
    <button
      className={[className, active && "is-active", isOver && "is-drop-target"].filter(Boolean).join(" ")}
      ref={dropRef}
      type="button"
      onClick={onClick}
    >{children}</button>
  );
}

function JsonMenu({ onOpen, onCopy, onDownload }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  return (
    <div className="tabRepositoryToolbar__menu">
      <Button ref={anchorRef} onClick={() => setOpen((value) => !value)}>JSON</Button>
      {open ? (
        <ActionMenu
          anchorRef={anchorRef}
          ariaLabel="Intercambio JSON"
          groups={[{ id: "json", items: [
            { id: "import", label: "Importar JSON", onClick: onOpen },
            { id: "copy", label: "Copiar todas las URLs", onClick: onCopy },
            { id: "download", label: "Descargar JSON", onClick: onDownload },
          ] }]}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function BulkMoveMenu({ groups, onMove }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  return (
    <div className="tabRepositoryToolbar__menu">
      <Button ref={anchorRef} onClick={() => setOpen((value) => !value)}>Mover</Button>
      {open ? (
        <ActionMenu
          anchorRef={anchorRef}
          ariaLabel="Mover tabs seleccionadas"
          groups={[{ id: "destinations", items: [
            { id: "ungrouped", label: "Sin grupo", onClick: () => onMove(null) },
            ...groups.map((group) => ({ id: group.id, label: group.name, onClick: () => onMove(group.id) })),
          ] }]}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default function TabRepositoryView({ ctx }) {
  const settings = normalizeSettings(ctx.settings.useValue?.() || DEFAULT_SETTINGS);
  const [sidebarWidth, setSidebarWidth] = useState(settings.sidebarWidth);
  const [snapshot, setSnapshot] = useState({ groups: [], tabs: [], trash: [], counts: {} });
  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const [groupDialog, setGroupDialog] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => setSidebarWidth(settings.sidebarWidth), [settings.sidebarWidth]);

  const loadSnapshot = async () => {
    const next = await invoke("tab-repository:get-snapshot");
    setSnapshot(next);
    return next;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadSnapshot()
      .catch((error) => !cancelled && setNotice({ tone: "danger", message: error.message, code: error.code }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const sourceTabs = scope === "trash"
    ? snapshot.trash
    : scope === "all"
      ? snapshot.tabs
      : scope === "ungrouped"
        ? snapshot.tabs.filter((tab) => !tab.groupId)
        : snapshot.tabs.filter((tab) => tab.groupId === scope);
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visibleTabs = useMemo(() => filterTabs(sourceTabs, normalizedQuery), [normalizedQuery, sourceTabs]);
  const representativeTabs = useMemo(() => {
    const byGroup = new Map();
    let all = null;
    let ungrouped = null;
    for (const tab of snapshot.tabs) {
      if (!all) all = tab;
      if (!tab.groupId && !ungrouped) ungrouped = tab;
      if (tab.groupId && !byGroup.has(tab.groupId)) byGroup.set(tab.groupId, tab);
    }
    return { all, ungrouped, byGroup };
  }, [snapshot.tabs]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const currentGroupId = scope === "ungrouped" ? null : snapshot.groups.some((group) => group.id === scope) ? scope : undefined;
  const canReorderTabs = currentGroupId !== undefined && !normalizedQuery && scope !== "trash";
  const rowHeight = settings.showTitle && settings.showUrl ? 58 : 44;
  const virtual = useVirtualRows(visibleTabs, rowHeight);

  useEffect(() => {
    const visible = new Set(sourceTabs.map((tab) => tab.id));
    setSelectedIds((current) => current.filter((id) => visible.has(id)));
  }, [scope, snapshot]);

  const runMutation = async (channel, payload, message = "") => {
    setBusy(channel);
    setNotice(null);
    try {
      const data = await invoke(channel, payload);
      const nextSnapshot = data?.snapshot || (data?.groups && data?.tabs ? data : null);
      if (nextSnapshot) setSnapshot(nextSnapshot);
      else await loadSnapshot();
      setSelectedIds([]);
      if (message) setNotice({ tone: "success", message });
      return data;
    } catch (error) {
      setNotice({ tone: "danger", message: error.message, code: error.code });
      throw error;
    } finally {
      setBusy("");
    }
  };

  const updateSettings = async (patch) => {
    await ctx.settings.set(normalizeSettings({ ...settings, ...patch }));
  };

  const openCoreSettings = () => void ctx.openView({
    viewId: "core.settings",
    reuse: true,
    sourceId: "nexus.tab-repository.browser-setup",
  });

  const requestBrowserLaunch = (label, retry) => {
    setConfirmDialog({
      title: "Brave está desconectado",
      description: `${label} puede iniciar el perfil vinculado y esperar hasta 30 segundos.`,
      confirmLabel: "Iniciar Brave",
      action: retry,
    });
  };

  const previewImport = async (launchIfNeeded = false) => {
    setBusy("browser-preview");
    setNotice(null);
    try {
      const preview = await invoke("tab-repository:browser-preview", { launchIfNeeded });
      if (!preview.eligibleCount) {
        setNotice({ tone: "info", message: "No hay tabs HTTP/HTTPS para importar." });
        return;
      }
      setImportPreview(preview);
    } catch (error) {
      if (error.code === "target_offline" && !launchIfNeeded) {
        requestBrowserLaunch("Importar desde Brave", () => previewImport(true));
      } else {
        setNotice({ tone: "danger", message: error.message, code: error.code });
      }
    } finally {
      setBusy("");
    }
  };

  const commitImport = async () => {
    const token = importPreview?.token;
    setImportPreview(null);
    if (!token) return;
    try {
      const result = await runMutation("tab-repository:browser-commit", { token });
      setNotice({
        tone: result.closeFailed ? "warning" : "success",
        message: result.closeFailed
          ? `${result.matched} tabs quedaron guardadas; ${result.closeFailed} no pudieron cerrarse en Brave.`
          : `${result.matched} tabs importadas y retiradas de Brave.`,
      });
    } catch {
      // runMutation already exposed the recovery message.
    }
  };

  const sendIds = async (ids, launchIfNeeded = false) => {
    if (!ids.length) return;
    try {
      const data = await runMutation("tab-repository:browser-send", { tabIds: ids, launchIfNeeded });
      const result = data.result;
      setNotice({
        tone: result.failed.length ? "warning" : "success",
        message: result.failed.length
          ? `${result.opened.length} abiertas; ${result.failed.length} permanecen en el repositorio.`
          : `${result.opened.length} ${result.opened.length === 1 ? "tab enviada" : "tabs enviadas"} a Brave.`,
      });
    } catch (error) {
      if (error.code === "target_offline" && !launchIfNeeded) {
        requestBrowserLaunch("Enviar tabs", () => sendIds(ids, true));
      }
    }
  };

  const moveTabs = async (ids, groupId) => {
    try { await runMutation("tab-repository:tabs-move", { tabIds: ids, groupId }); } catch { /* notice set */ }
  };

  const reorderVisibleTabs = async (movingIds, targetId) => {
    if (!canReorderTabs) return;
    const next = reorderBefore(sourceTabs.map((tab) => tab.id), movingIds, targetId);
    try { await runMutation("tab-repository:tabs-reorder", { groupId: currentGroupId, tabIds: next }); } catch { /* notice set */ }
  };

  const reorderGroup = async (sourceId, targetId) => {
    const ids = snapshot.groups.map((group) => group.id).filter((id) => id !== sourceId);
    ids.splice(Math.max(0, ids.indexOf(targetId)), 0, sourceId);
    try { await runMutation("tab-repository:groups-reorder", { groupIds: ids }); } catch { /* notice set */ }
  };

  const saveGroup = async () => {
    const dialog = groupDialog;
    if (!dialog) return;
    setGroupDialog(null);
    try {
      await runMutation(
        dialog.groupId ? "tab-repository:group-rename" : "tab-repository:group-create",
        { groupId: dialog.groupId, name: dialog.name },
      );
    } catch { /* notice set */ }
  };

  const importJsonText = async (text = jsonText) => {
    try {
      const data = await runMutation("tab-repository:json-import", { json: text });
      setJsonDialogOpen(false);
      setJsonText("");
      setNotice({
        tone: data.result.invalid ? "warning" : "success",
        message: `${data.result.imported} nuevas, ${data.result.restored} restauradas, ${data.result.duplicates} duplicadas y ${data.result.invalid} inválidas.`,
      });
    } catch { /* notice set */ }
  };

  const getExport = async () => invoke("tab-repository:json-export");
  const copyExport = async () => {
    try {
      const data = await getExport();
      window.nexus.clipboard.writeText(JSON.stringify(data, null, 2));
      setNotice({ tone: "success", message: `${data.urls.length} URLs copiadas como JSON.` });
    } catch (error) {
      setNotice({ tone: "danger", message: error.message });
    }
  };
  const downloadExport = async () => {
    try {
      const data = await getExport();
      const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `tab-repository-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    } catch (error) {
      setNotice({ tone: "danger", message: error.message });
    }
  };

  const selectTab = (id, checked) => setSelectedIds((current) => checked
    ? [...new Set([...current, id])]
    : current.filter((entry) => entry !== id));
  const selectedVisibleCount = visibleTabs.filter((tab) => selectedSet.has(tab.id)).length;
  const allVisibleSelected = visibleTabs.length > 0 && selectedVisibleCount === visibleTabs.length;

  if (loading) {
    return <WorkspacePage className="tabRepository"><LoadingIndicator label="Cargando repositorio" /></WorkspacePage>;
  }

  return (
    <WorkspacePage className="tabRepository">
      <WorkspaceTopbar className="tabRepositoryToolbar">
        <WorkspaceTitle title="Tab Repository" />
        <div className="tabRepositoryToolbar__actions">
          <Button tone="primary" disabled={Boolean(busy)} onClick={() => void previewImport(false)}>
            Importar desde Brave
          </Button>
          <Button disabled={Boolean(busy)} onClick={() => setGroupDialog({ name: "", groupId: null })}>Crear grupo</Button>
          <Button disabled={!snapshot.tabs.length || Boolean(busy)} onClick={() => setConfirmDialog({
            title: "Reagrupar todo por dominio",
            description: "Se eliminarán los grupos manuales activos. La papelera no cambiará.",
            confirmLabel: "Reagrupar",
            action: async () => {
              setScope("all");
              await runMutation("tab-repository:regroup-domain", {});
            },
          })}>Reagrupar por dominio</Button>
          <JsonMenu onOpen={() => setJsonDialogOpen(true)} onCopy={() => void copyExport()} onDownload={() => void downloadExport()} />
          <div className="tabRepositoryToolbar__batch">
            <Input
              aria-label="Cantidad de tabs por lote"
              max="100"
              min="1"
              type="number"
              value={settings.batchSize}
              onChange={(event) => void updateSettings({ batchSize: event.target.value })}
            />
            <Button
              disabled={scope === "trash" || !visibleTabs.length || Boolean(busy)}
              onClick={() => void sendIds(visibleTabs.slice(0, settings.batchSize).map((tab) => tab.id))}
            >Enviar {Math.min(settings.batchSize, visibleTabs.length)}</Button>
          </div>
        </div>
      </WorkspaceTopbar>

      {notice ? (
        <div className="tabRepository__notice">
          <Notice tone={notice.tone}>{notice.message}</Notice>
          {["native_plugin_disabled", "permission_denied", "target_not_configured", "pairing_required"].includes(notice.code) ? (
            <Button onClick={openCoreSettings}>Abrir Settings</Button>
          ) : null}
        </div>
      ) : null}

      <WorkspaceBody
        className="tabRepository__body"
        style={{ "--tab-repository-sidebar-width": `${sidebarWidth}px` }}
      >
        <aside className="tabRepositorySidebar">
          <nav className="tabRepositorySidebar__special" aria-label="Vistas del repositorio">
            <button className={scope === "all" ? "is-active" : ""} type="button" onClick={() => setScope("all")}>
              <SiteIcon tab={representativeTabs.all} />
              <span>Todas</span><small>{snapshot.counts.active || 0}</small>
            </button>
            <SidebarDropButton
              active={scope === "ungrouped"}
              ctx={ctx}
              onClick={() => setScope("ungrouped")}
              onDropTabs={(ids) => void moveTabs(ids, null)}
            >
              <SiteIcon fallback="folder" tab={representativeTabs.ungrouped} />
              <span>Sin grupo</span><small>{snapshot.counts.ungrouped || 0}</small>
            </SidebarDropButton>
          </nav>
          <div className="tabRepositorySidebar__groups">
            {snapshot.groups.map((group) => (
              <GroupRow
                active={scope === group.id}
                ctx={ctx}
                group={group}
                key={group.id}
                representativeTab={representativeTabs.byGroup.get(group.id)}
                onDelete={() => setConfirmDialog({
                  title: `Eliminar ${group.name}`,
                  description: "Sus tabs pasarán a Sin grupo.",
                  confirmLabel: "Eliminar grupo",
                  action: async () => {
                    if (scope === group.id) setScope("ungrouped");
                    await runMutation("tab-repository:group-delete", { groupId: group.id });
                  },
                })}
                onDropTabs={moveTabs}
                onRename={() => setGroupDialog({ groupId: group.id, name: group.name })}
                onReorder={reorderGroup}
                onSelect={() => setScope(group.id)}
              />
            ))}
          </div>
          <SidebarDropButton
            active={scope === "trash"}
            className="tabRepositorySidebar__trash"
            ctx={ctx}
            onClick={() => setScope("trash")}
            onDropTabs={(ids) => void runMutation("tab-repository:tabs-trash", { tabIds: ids })}
          >
            <TrashIcon /><span>Papelera</span><small>{snapshot.counts.trash || 0}</small>
          </SidebarDropButton>
        </aside>

        <SidebarResizeHandle
          width={sidebarWidth}
          onChange={setSidebarWidth}
          onCommit={(nextWidth) => void updateSettings({ sidebarWidth: nextWidth })}
        />

        <main className="tabRepositoryList">
          <div className="tabRepositoryList__controls">
            <SearchField value={query} placeholder="Buscar por título, URL o dominio" onChange={(event) => setQuery(event.target.value)} />
            <Checkbox
              checked={allVisibleSelected}
              disabled={!visibleTabs.length}
              label={selectedVisibleCount ? `${selectedVisibleCount} seleccionadas` : "Seleccionar visibles"}
              onChange={(event) => setSelectedIds(event.target.checked ? visibleTabs.map((tab) => tab.id) : [])}
            />
            {selectedIds.length ? scope === "trash" ? (
              <Button onClick={() => void runMutation("tab-repository:tabs-restore", { tabIds: selectedIds })}>Restaurar</Button>
            ) : (
              <>
                <BulkMoveMenu groups={snapshot.groups} onMove={(groupId) => void moveTabs(selectedIds, groupId)} />
                <Button tone="danger" onClick={() => void runMutation("tab-repository:tabs-trash", { tabIds: selectedIds })}>Papelera</Button>
              </>
            ) : null}
            {scope === "trash" && snapshot.trash.length ? (
              <Button tone="danger" onClick={() => setConfirmDialog({
                title: "Vaciar papelera",
                description: `${snapshot.trash.length} tabs se eliminarán permanentemente.`,
                confirmLabel: "Vaciar papelera",
                action: async () => runMutation("tab-repository:trash-empty", {}),
              })}>Vaciar papelera</Button>
            ) : null}
          </div>

          {busy ? <div className="tabRepositoryList__busy"><LoadingIndicator label="Procesando" /></div> : null}
          {!visibleTabs.length ? (
            <StateBlock
              centered
              title={query ? "Sin coincidencias" : scope === "trash" ? "La papelera está vacía" : "No hay tabs aquí"}
              description={query ? "Prueba con otra búsqueda." : scope === "all" ? "Importa tabs desde Brave o JSON." : ""}
            />
          ) : (
            <div className="tabRepositoryList__viewport" ref={virtual.viewportRef}>
              <div className="tabRepositoryList__virtual" style={{ height: `${virtual.totalHeight}px` }}>
                {virtual.visible.map(({ item: tab, index }) => (
                  <TabRow
                    canReorder={canReorderTabs}
                    ctx={ctx}
                    disabled={Boolean(busy)}
                    groups={snapshot.groups}
                    key={tab.id}
                    onMove={moveTabs}
                    onReorder={reorderVisibleTabs}
                    onRestore={(ids) => void runMutation("tab-repository:tabs-restore", { tabIds: ids })}
                    onSelect={selectTab}
                    onSend={(id) => void sendIds([id])}
                    onTrash={(ids) => void runMutation("tab-repository:tabs-trash", { tabIds: ids })}
                    selected={selectedSet.has(tab.id)}
                    selectedIds={selectedIds}
                    showTitle={settings.showTitle}
                    showUrl={settings.showUrl}
                    style={{ height: `${rowHeight}px`, transform: `translateY(${index * rowHeight}px)` }}
                    tab={tab}
                    trashed={scope === "trash"}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </WorkspaceBody>

      {groupDialog ? (
        <Modal
          title={groupDialog.groupId ? "Renombrar grupo" : "Crear grupo"}
          onClose={() => setGroupDialog(null)}
          actions={<>
            <Button onClick={() => setGroupDialog(null)}>Cancelar</Button>
            <Button tone="primary" disabled={!groupDialog.name.trim()} onClick={() => void saveGroup()}>Guardar</Button>
          </>}
        >
          <Input
            autoFocus
            maxLength="120"
            placeholder="Nombre del grupo"
            value={groupDialog.name}
            onChange={(event) => setGroupDialog((current) => ({ ...current, name: event.target.value }))}
            onKeyDown={(event) => { if (event.key === "Enter" && groupDialog.name.trim()) void saveGroup(); }}
          />
        </Modal>
      ) : null}

      {confirmDialog ? (
        <Modal
          title={confirmDialog.title}
          description={confirmDialog.description}
          onClose={() => setConfirmDialog(null)}
          actions={<>
            <Button onClick={() => setConfirmDialog(null)}>Cancelar</Button>
            <Button tone="primary" onClick={() => {
              const action = confirmDialog.action;
              setConfirmDialog(null);
              void action();
            }}>{confirmDialog.confirmLabel}</Button>
          </>}
        />
      ) : null}

      {importPreview ? (
        <Modal
          title="Importar todas las tabs recuperables"
          description="Nexus guardará primero los items y después los cerrará en Brave."
          onClose={() => setImportPreview(null)}
          actions={<>
            <Button onClick={() => setImportPreview(null)}>Cancelar</Button>
            <Button tone="primary" onClick={() => void commitImport()}>Importar y cerrar</Button>
          </>}
        >
          <div className="tabRepositoryImportSummary">
            <p><strong>{importPreview.eligibleCount}</strong> tabs HTTP/HTTPS</p>
            <p><strong>{importPreview.pinnedCount}</strong> fijadas incluidas</p>
            <p><strong>{importPreview.excludedCount}</strong> páginas internas excluidas</p>
          </div>
        </Modal>
      ) : null}

      {jsonDialogOpen ? (
        <Modal
          title="Importar URLs desde JSON"
          description="Solo se leerán URLs HTTP/HTTPS; títulos, grupos y otros campos se ignorarán."
          onClose={() => setJsonDialogOpen(false)}
          actions={<>
            <Button onClick={() => setJsonDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => fileInputRef.current?.click()}>Abrir archivo</Button>
            <Button onClick={async () => setJsonText(await window.nexus.clipboard.readText())}>Pegar</Button>
            <Button tone="primary" disabled={!jsonText.trim()} onClick={() => void importJsonText()}>Importar</Button>
          </>}
        >
          <TextArea rows={12} value={jsonText} onChange={(event) => setJsonText(event.target.value)} placeholder='["https://example.com"]' />
          <input
            accept="application/json,.json"
            className="tabRepository__fileInput"
            ref={fileInputRef}
            type="file"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setJsonText(await file.text());
              event.target.value = "";
            }}
          />
        </Modal>
      ) : null}
    </WorkspacePage>
  );
}
import { pluginIpc } from "./ipc-client.js";
