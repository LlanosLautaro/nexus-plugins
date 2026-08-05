import {
  Button,
  GalleryCard,
  GalleryCardMedia,
  GalleryGrid,
  Input,
  StateBlock,
} from "@nexus/ui";

const React = window.React;
const { useEffect, useRef, useState } = React;

const ENTITY_LABELS = {
  author: "Persona",
  artist: "Artist",
  character: "Character",
  universe: "Universe",
};

export default function EntityContextDialog({
  state,
  busy = false,
  onClose,
  onRename,
  onChooseResource,
  MediaPreview,
}) {
  const inputRef = useRef(null);
  const [name, setName] = useState(() => state?.profile?.displayName || state?.item?.displayName || "");
  const mode = state?.mode || "details";
  const profile = state?.profile || null;
  const resources = Array.isArray(state?.resources) ? state.resources : [];

  useEffect(() => {
    setName(state?.profile?.displayName || state?.item?.displayName || "");
  }, [state?.entityId, state?.item?.displayName, state?.profile?.displayName]);

  useEffect(() => {
    if (mode === "rename") inputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!state) return null;

  const entityLabel = ENTITY_LABELS[state.kind] || "Entidad";
  const title = mode === "rename"
    ? `Renombrar ${entityLabel}`
    : mode === "pick-visual"
      ? `Elegir ${state.role === "banner" ? "portada" : "foto de perfil"}`
      : `Detalles de ${entityLabel}`;

  return (
    <div className="booruView__cropOverlay" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <div className="booruEntityContextDialog" role="dialog" aria-modal="true" aria-labelledby="booru-entity-context-title">
        <header className="booruEntityContextDialog__header">
          <div>
            <span className="booruView__groupLabel">{entityLabel}</span>
            <h2 id="booru-entity-context-title">{title}</h2>
          </div>
          <Button type="button" onClick={onClose} disabled={busy}>Cerrar</Button>
        </header>

        {state.loading ? (
          <StateBlock centered title="Cargando entidad" description="Leyendo sus datos en Booru." />
        ) : state.error && mode !== "rename" ? (
          <StateBlock centered title="No se pudo abrir" description={state.error} />
        ) : mode === "rename" ? (
          <form className="booruEntityContextDialog__form" onSubmit={(event) => {
            event.preventDefault();
            const nextName = name.trim();
            if (nextName && !busy) void onRename?.(nextName);
          }}>
            <label htmlFor="booru-entity-rename">Nombre principal</label>
            <Input
              ref={inputRef}
              id="booru-entity-rename"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={busy}
            />
            {(state.kind === "author" || state.kind === "artist") ? (
              <span className="booruView__suggestionsHint">El nombre anterior quedará como alias de esta misma identidad.</span>
            ) : null}
            {state.error ? <p className="booruView__fieldError">{state.error}</p> : null}
            <div className="booruEntityContextDialog__actions">
              <Button type="button" onClick={onClose} disabled={busy}>Cancelar</Button>
              <Button type="submit" tone="primary" disabled={busy || !name.trim()}>{busy ? "Guardando" : "Renombrar"}</Button>
            </div>
          </form>
        ) : mode === "pick-visual" ? (
          <div className="booruEntityContextDialog__picker">
            {resources.length ? (
              <GalleryGrid className="booruEntityContextDialog__grid" columns={5} minColumns={2} maxColumns={8}>
                {resources.map((resource) => (
                  <GalleryCard
                    as="button"
                    type="button"
                    key={resource.id}
                    className="booruEntityContextDialog__resource"
                    onClick={() => !busy && onChooseResource?.(resource)}
                    disabled={busy}
                  >
                    <GalleryCardMedia className="booruEntityContextDialog__preview">
                      <MediaPreview
                        pathValue={resource.storagePath}
                        mediaKind={resource.mediaKind}
                        alt={resource.originalFilename}
                        thumbnail={resource.thumbnail}
                        preferOriginalWhenThumbnailMissing
                        objectFit="contain"
                      />
                    </GalleryCardMedia>
                  </GalleryCard>
                ))}
              </GalleryGrid>
            ) : (
              <StateBlock centered title="Sin recursos" description="Esta entidad todavía no tiene media compatible para usar como visual." />
            )}
          </div>
        ) : (
          <div className="booruEntityContextDialog__details">
            <section>
              <span className="booruView__groupLabel">Nombre principal</span>
              <strong>{profile?.displayName || state?.item?.displayName || "Entidad"}</strong>
            </section>
            <section>
              <span className="booruView__groupLabel">Aliases</span>
              <div className="booruEntityContextDialog__chips">
                {(profile?.aliases || []).length
                  ? profile.aliases.map((alias) => <span key={alias} className="booruView__selectionChip">{alias}</span>)
                  : <span className="booruView__suggestionsHint">Sin aliases.</span>}
              </div>
            </section>
            <section>
              <span className="booruView__groupLabel">Tags de entidad</span>
              <div className="booruEntityContextDialog__chips">
                {(profile?.tags || []).length
                  ? profile.tags.map((tag) => <span key={tag.id} className="booruView__selectionChip booruView__selectionChip--tag">{tag.name}</span>)
                  : <span className="booruView__suggestionsHint">Sin tags.</span>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
