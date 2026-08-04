import { Button, Field, TextArea } from "@nexus/ui";

const React = window.React;
const { useEffect, useState } = React;

async function invoke(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo guardar el perfil.");
  return response.data;
}

export default function EntityProfileDataTab({
  kind,
  profile,
  busy = false,
  universeCharacterCreateValue = "",
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse,
  onProfileChange,
  SingleEntityField,
  helpers,
}) {
  const { formatDate } = helpers;
  const metadata = profile?.metadata || {};
  const [aliases, setAliases] = useState(() => (profile?.aliases || []).join("\n"));
  const [socialLinks, setSocialLinks] = useState(() => profile?.socialLinks || []);
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving] = useState(false);
  const facts = [
    { label: "Slug", value: profile?.slug || "Sin slug" },
    { label: "Recursos", value: String(profile?.resourceCount || 0) },
    { label: "Creado", value: formatDate(metadata?.createdAt) || "Sin fecha" },
  ];

  useEffect(() => {
    setAliases((profile?.aliases || []).join("\n"));
    setSocialLinks(profile?.socialLinks || []);
  }, [profile?.id, profile?.aliases, profile?.socialLinks]);

  useEffect(() => {
    if (kind !== "author" && kind !== "artist") return undefined;
    let cancelled = false;
    void invoke("booru:list-social-platforms").then((result) => {
      if (!cancelled) setPlatforms(Array.isArray(result?.items) ? result.items : []);
    }).catch(() => {
      if (!cancelled) setPlatforms([]);
    });
    return () => { cancelled = true; };
  }, [kind]);

  if (kind === "character") facts.push({ label: "Universe", value: profile?.universe?.displayName || "Todavia sin universe" });
  if (kind === "universe") facts.push(
    { label: "Characters", value: String(metadata?.characterCount || 0) },
    { label: "Consumo directo", value: String(metadata?.directResourceCount || 0) },
    { label: "Via characters", value: String(metadata?.inheritedResourceCount || 0) },
  );

  const saveIdentity = async () => {
    setSaving(true);
    try {
      const result = await invoke("booru:save-entity-profile", {
        kind,
        entityId: profile?.id,
        aliasNames: aliases.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
        socialLinks: socialLinks.map((link) => ({ platformId: link?.platform?.id || link?.platformId, url: link?.url })),
      });
      onProfileChange?.(result?.profile || null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booruView__entityProfileData">
      <div className="booruView__entityProfileFacts">
        {facts.map((fact) => <div key={fact.label} className="booruView__entityProfileFact"><span>{fact.label}</span><strong>{fact.value}</strong></div>)}
      </div>

      {kind === "character" ? (
        <Field label="Universe" description="Busca uno existente o crea uno nuevo para este character." className="booruView__field">
          <SingleEntityField kind="universe" label="Universe" value={profile?.universe || null} onChange={(value) => onChangeCharacterUniverse?.(value)} disabled={busy} allowClear={false} placeholder="Buscar universe o crear uno nuevo" />
        </Field>
      ) : null}

      {kind === "universe" ? (
        <Field label="Crear character" description="El character nuevo queda asignado automaticamente a este universe." className="booruView__field">
          <div className="booruView__entityInputRow">
            <input type="text" value={universeCharacterCreateValue} onChange={(event) => onUniverseCharacterCreateValueChange?.(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void onCreateCharacterInUniverse?.(); } }} placeholder="Crear character para este universe" disabled={busy} />
            <Button type="button" onClick={() => void onCreateCharacterInUniverse?.()} disabled={!String(universeCharacterCreateValue || "").trim() || busy}>Crear</Button>
          </div>
        </Field>
      ) : null}

      {(kind === "author" || kind === "artist") ? (
        <>
          <Field label="Otros nombres" description="Uno por linea. Son aliases de esta misma entidad, no tags." className="booruView__field">
            <TextArea value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="Otro nombre conocido" disabled={busy || saving} />
          </Field>
          <Field label="Redes" description="Elige una plataforma registrada y pega su enlace." className="booruView__field">
            <div className="booruView__entityProfileLinks">
              {socialLinks.map((link, index) => (
                <div key={`${link?.id || index}`} className="booruView__entityInputRow">
                  <select value={link?.platform?.id || link?.platformId || ""} onChange={(event) => setSocialLinks((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, platformId: event.target.value, platform: platforms.find((platform) => platform.id === event.target.value) || item.platform } : item))} disabled={busy || saving}>
                    <option value="">Plataforma</option>
                    {platforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.displayName}</option>)}
                  </select>
                  <input type="url" value={link?.url || ""} onChange={(event) => setSocialLinks((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="https://" disabled={busy || saving} />
                  <Button type="button" onClick={() => setSocialLinks((items) => items.filter((_item, itemIndex) => itemIndex !== index))} disabled={busy || saving}>Quitar</Button>
                </div>
              ))}
              <Button type="button" onClick={() => setSocialLinks((items) => [...items, { platformId: "", url: "" }])} disabled={busy || saving || !platforms.length}>Anadir red</Button>
            </div>
          </Field>
          <Button type="button" tone="primary" onClick={() => void saveIdentity()} disabled={busy || saving}>{saving ? "Guardando" : "Guardar datos"}</Button>
        </>
      ) : null}
    </div>
  );
}
