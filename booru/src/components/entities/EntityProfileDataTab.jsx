import { Button, Field, Notice } from "../../../../../nexus-frontend/src/ui/index.js";
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
  VisualCropper,
  helpers,
}) {
  const { formatDate, entityKindLabels } = helpers;
  const metadata = profile?.metadata || {};
  const avatarSource = profile?.avatar?.sampleStoragePath
    ? {
      pathValue: profile.avatar.sampleStoragePath,
      mediaKind: profile.avatar.sampleMediaKind || "image",
    }
    : profile?.sample?.sampleStoragePath
      ? {
        pathValue: profile.sample.sampleStoragePath,
        mediaKind: profile.sample.sampleMediaKind || "image",
      }
      : null;
  const avatarLayout = profile?.visualSettings?.avatar || null;
  const bannerSource = profile?.banner?.originalStoragePath || profile?.banner?.sampleStoragePath
    ? {
      pathValue: profile.banner.originalStoragePath || profile.banner.sampleStoragePath,
      mediaKind: profile.banner.originalMediaKind || profile.banner.sampleMediaKind || "image",
    }
    : avatarSource;
  const bannerLayout = profile?.visualSettings?.banner || null;
  const facts = [
    { label: "Slug", value: profile?.slug || "Sin slug" },
    { label: "Recursos", value: String(profile?.resourceCount || 0) },
    { label: "Creado", value: formatDate(metadata?.createdAt) || "Sin fecha" },
  ];

  if (kind === "character") {
    facts.push({
      label: "Universe",
      value: profile?.universe?.displayName || "Todavia sin universe",
    });
  }

  if (kind === "universe") {
    facts.push(
      { label: "Characters", value: String(metadata?.characterCount || 0) },
      { label: "Consumo directo", value: String(metadata?.directResourceCount || 0) },
      { label: "Via characters", value: String(metadata?.inheritedResourceCount || 0) },
    );
  }

  return (
    <div className="booruView__entityProfileData">
      <div className="booruView__entityProfileFacts">
        {facts.map((fact) => (
          <div key={fact.label} className="booruView__entityProfileFact">
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>

      {kind === "character" ? (
        <Field
          label="Universe"
          description="Busca uno existente o crea uno nuevo para este character."
          className="booruView__field"
        >
          <SingleEntityField
            kind="universe"
            label="Universe"
            value={profile?.universe || null}
            onChange={(nextUniverse) => onChangeCharacterUniverse?.(nextUniverse)}
            disabled={busy}
            placeholder="Buscar universe o crear uno nuevo"
          />
        </Field>
      ) : null}

      {kind === "universe" ? (
        <Field
          label="Crear character"
          description="El character nuevo queda asignado automaticamente a este universe."
          className="booruView__field"
        >
          <div className="booruView__entityInlineEditor">
            <div className="booruView__entityInputRow">
              <input
                type="text"
                value={universeCharacterCreateValue}
                onChange={(event) => onUniverseCharacterCreateValueChange?.(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void onCreateCharacterInUniverse?.();
                  }
                }}
                placeholder="Crear character para este universe"
                disabled={busy}
                aria-label="Crear character para este universe"
              />
              <Button
                type="button"
                onClick={() => void onCreateCharacterInUniverse?.()}
                disabled={!String(universeCharacterCreateValue || "").trim() || busy}
              >
                Crear
              </Button>
            </div>
          </div>
        </Field>
      ) : null}

      <VisualCropper
        kind={kind}
        entityId={profile?.id}
        role="avatar"
        source={avatarSource}
        initialLayout={avatarLayout}
        busy={busy}
        onSaved={onProfileChange}
      />

      <VisualCropper
        kind={kind}
        entityId={profile?.id}
        role="banner"
        source={bannerSource}
        initialLayout={bannerLayout}
        busy={busy}
        onSaved={onProfileChange}
      />

      {(kind === "author" || kind === "artist") ? (
        <Notice tone="info">
          Redes, enlaces y notas quedan como metadata futura. Por ahora este perfil muestra identidad basica y consumo real.
        </Notice>
      ) : null}
    </div>
  );
}
