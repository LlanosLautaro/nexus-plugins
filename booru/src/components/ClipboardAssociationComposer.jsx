import { Button } from "@nexus/ui";

const React = window.React;
const { useEffect, useState } = React;
const KIND_OPTIONS = [
  ["author", "Persona"], ["artist", "Artist"], ["character", "Character"], ["universe", "Universe"],
];

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
      <input value={value} onChange={(event) => onChange(event.target.value)} autoFocus={label !== "Universe"} />
      {items.length ? <div className="booruClipboardComposer__suggestions">
        {items.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item)}>{item.displayName}</button>)}
      </div> : null}
    </label>
  );
}

export default function ClipboardAssociationComposer({ defaultKind = "author", onCancel, onConfirm }) {
  const [kind, setKind] = useState(defaultKind);
  const [entityName, setEntityName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [universeName, setUniverseName] = useState("");
  const [universeId, setUniverseId] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if ((!entityId && !entityName.trim()) || (kind === "character" && !universeId && !universeName.trim())) return;
    setBusy(true);
    try {
      await onConfirm?.({ kind, entityId, entityName, universeId, universeName });
    } finally { setBusy(false); }
  };

  return <div className="booruClipboardComposer" role="dialog" aria-label="Asociar recurso pegado">
    <select value={kind} onChange={(event) => { setKind(event.target.value); setEntityId(""); setEntityName(""); }}>
      {KIND_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    <EntityField kind={kind} label="Entidad" value={entityName} onChange={(value) => { setEntityName(value); setEntityId(""); }} onSelect={(item) => { setEntityId(item.id); setEntityName(item.displayName); }} />
    {kind === "character" ? <EntityField kind="universe" label="Universe" value={universeName} onChange={(value) => { setUniverseName(value); setUniverseId(""); }} onSelect={(item) => { setUniverseId(item.id); setUniverseName(item.displayName); }} /> : null}
    <div className="booruClipboardComposer__actions">
      <Button type="button" onClick={onCancel} disabled={busy}>Cancelar</Button>
      <Button type="button" tone="primary" onClick={() => void submit()} disabled={busy}>Asociar</Button>
    </div>
  </div>;
}
