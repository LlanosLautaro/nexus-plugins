import { Button, Input, Select, TextArea } from "@nexus/ui";

const React = window.React;
const { useEffect, useState } = React;
const KIND_OPTIONS = [
  ["author", "Persona"], ["artist", "Artist"], ["character", "Character"], ["universe", "Universe"],
];
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "mkv", "avi"]);

function parseAliasNames(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

async function invoke(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo buscar en Booru.");
  return response.data;
}

function EntityField({ kind, value, onChange, onSelect, label }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const query = String(value || "").trim();
    if (!query) { setItems([]); return undefined; }
    const timer = window.setTimeout(() => {
      void invoke("booru:list-entities", { kind, query }).then((result) => {
        setItems(Array.isArray(result?.items) ? result.items.slice(0, 6) : []);
      }).catch(() => setItems([]));
    }, 140);
    return () => window.clearTimeout(timer);
  }, [kind, value]);
  return (
    <label className="booruClipboardComposer__field">
      <span>{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={label !== "Universe"}
        autoComplete="off"
      />
      {items.length ? <div className="booruClipboardComposer__suggestions">
        {items.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item)}>{item.displayName}</button>)}
      </div> : null}
    </label>
  );
}

function getPreviewKind(pathValue) {
  const extension = String(pathValue || "").split(/[.]/).pop()?.toLowerCase() || "";
  return VIDEO_EXTENSIONS.has(extension) ? "video" : "image";
}

function toFileUrl(pathValue) {
  if (!pathValue) return "";
  return new URL(window.nexus.urls.pathToFileUrl(pathValue)).href;
}

export default function ClipboardAssociationComposer({
  defaultKind = "author",
  tempFilePath = "",
  onCancel,
  onConfirm,
}) {
  const [kind, setKind] = useState(defaultKind);
  const [entityName, setEntityName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [aliasText, setAliasText] = useState("");
  const [universeName, setUniverseName] = useState("");
  const [universeId, setUniverseId] = useState("");
  const [busy, setBusy] = useState(false);
  const previewUrl = toFileUrl(tempFilePath);
  const previewKind = getPreviewKind(tempFilePath);
  const canSubmit = Boolean(
    tempFilePath
    && (entityId || entityName.trim())
    && (kind !== "character" || universeId || universeName.trim()),
  );

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      await onConfirm?.({
        kind,
        entityId,
        entityName,
        aliasNames: entityId ? [] : parseAliasNames(aliasText),
        universeId,
        universeName,
      });
    } finally { setBusy(false); }
  };

  return (
    <div className="booruClipboardComposerOverlay">
      <form
        className="booruClipboardComposer"
        role="dialog"
        aria-modal="true"
        aria-label="Crear entidad desde recurso pegado"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="booruClipboardComposer__preview">
          {previewKind === "video" ? (
            <video src={previewUrl} muted autoPlay loop playsInline preload="metadata" />
          ) : (
            <img src={previewUrl} alt="Recurso pegado pendiente de asociar" draggable="false" />
          )}
        </div>
        <div className="booruClipboardComposer__form">
          <Select value={kind} onChange={(event) => { setKind(event.target.value); setEntityId(""); setEntityName(""); setAliasText(""); }}>
            {KIND_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <EntityField kind={kind} label="Nombre principal" value={entityName} onChange={(value) => { setEntityName(value); setEntityId(""); }} onSelect={(item) => { setEntityId(item.id); setEntityName(item.displayName); setAliasText(""); }} />
          {!entityId && (kind === "author" || kind === "artist") ? (
            <label className="booruClipboardComposer__field">
              <span>Otros nombres</span>
              <TextArea
                value={aliasText}
                onChange={(event) => setAliasText(event.target.value)}
                placeholder="Uno por linea"
                rows={2}
                disabled={busy}
              />
              <small>Tambien sirven para buscar y seleccionar esta entidad.</small>
            </label>
          ) : null}
          {kind === "character" ? <EntityField kind="universe" label="Universe" value={universeName} onChange={(value) => { setUniverseName(value); setUniverseId(""); }} onSelect={(item) => { setUniverseId(item.id); setUniverseName(item.displayName); }} /> : null}
          <div className="booruClipboardComposer__actions">
            <Button type="button" onClick={onCancel} disabled={busy}>Cancelar</Button>
            <Button type="submit" tone="primary" disabled={busy || !canSubmit}>
              {busy ? "Guardando" : entityId ? "Asociar" : "Crear entidad"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
