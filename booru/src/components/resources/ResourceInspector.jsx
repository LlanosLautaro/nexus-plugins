import { Button, Field, Notice, SectionPanel, SegmentedControl, StateBlock } from "../../../../../nexus-frontend/src/ui/index.js";
import { FolderIcon } from "../../icons.jsx";

export default function ResourceInspector({
  section,
  activeResource,
  selectedResources,
  draft,
  saving,
  onDraftChange,
  onRestore,
  onPurge,
  onClose,
  helpers,
  MediaPreview,
  EntityField,
  TagField,
  SingleEntityField,
  mediaKindLabels,
  classificationLabels,
  realityLabels,
  realityOptions,
}) {
  const {
    canSaveDraftProgress,
    formatDate,
    formatFileSize,
    getCharacterUniverse,
    getCommonItems,
    getCommonScalar,
    getDraftUniverseForCharacter,
    markDraftDirty,
    openPath,
    pruneCharacterUniverseAssignments,
    renderEntityChips,
    renderTagChips,
  } = helpers;
  const selectionCount = selectedResources.length;
  const isBatch = selectionCount > 1;
  const resource = activeResource || selectedResources[0] || null;

  if (!resource) {
    return (
      <SectionPanel className="booruView__panel booruView__panel--fill">
        <StateBlock
          centered
          title="Selecciona un recurso"
          description="El detalle aparece aqui para clasificar o revisar el item activo."
        />
      </SectionPanel>
    );
  }

  const isDuplicate = section === "duplicates" || resource.classificationState === "duplicate-review";
  const isTrash = section === "trash" || selectedResources.every((item) => item?.trashedAt);
  const canSaveProgress = canSaveDraftProgress(draft);

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      <div className="booruView__inspectorBody">
        <div className="booruView__inspectorTitleRow">
          <div className="booruView__inspectorTitleCopy">
            <strong>{isBatch ? `${selectionCount} recursos seleccionados` : resource.originalFilename}</strong>
            {isBatch && resource.originalFilename ? (
              <span className="booruView__suggestionsHint">{resource.originalFilename}</span>
            ) : null}
          </div>
          <Button type="button" onClick={() => onClose?.()}>
            Cerrar
          </Button>
        </div>

        <div className="booruView__inspectorPreview">
          <MediaPreview
            pathValue={resource.storagePath}
            mediaKind={resource.mediaKind}
            alt={resource.originalFilename}
            large
            controls
          />
        </div>

        <div className="booruView__inspectorSummary">
          <span>{mediaKindLabels[resource.mediaKind] || resource.mediaKind}</span>
          <span>{classificationLabels[resource.classificationState] || resource.classificationState}</span>
          {resource.reality ? <span>{realityLabels[resource.reality] || resource.reality}</span> : null}
          <span>{formatFileSize(resource.fileSize)}</span>
          <span>{formatDate(resource.importedAt)}</span>
          {isBatch ? <span>{selectionCount} seleccionados</span> : null}
        </div>

        {!isBatch ? (
          <>
            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Auto-tags</span>
              <div className="booruView__tagRow">
                {(Array.isArray(resource.systemTags) ? resource.systemTags : []).map((tagValue) => (
                  <span key={tagValue} className="booruView__tagChip">
                    {tagValue}
                  </span>
                ))}
              </div>
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Persona</span>
              {renderEntityChips(resource.authors, "Sin persona asignada")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Artists</span>
              {renderEntityChips(resource.artists, "Sin artist asignado")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Characters</span>
              {renderEntityChips(resource.characters, "Sin character asignado")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Universes</span>
              {renderEntityChips(resource.universes, "Sin universe directo")}
            </div>

            <div className="booruView__tagGroup">
              <span className="booruView__groupLabel">Tags manuales</span>
              {renderTagChips(resource.manualTags, "Sin tags manuales")}
            </div>
          </>
        ) : (
          <StateBlock
            title="Edicion en lote"
            description="Los campos muestran lo comun a toda la seleccion. Lo que cambies se aplica como patch sobre todos los recursos seleccionados."
          />
        )}

        <div className="booruView__pathActions">
          <Button type="button" onClick={() => openPath(resource.storagePath)}>
            <FolderIcon size={15} />
            <span>Ver archivo</span>
          </Button>
          {!isBatch && resource.sourcePath ? (
            <Button type="button" onClick={() => openPath(resource.sourcePath)}>
              <FolderIcon size={15} />
              <span>Ver origen</span>
            </Button>
          ) : null}
        </div>

        {isTrash ? (
          <div className="booruView__inspectorActions">
            <Button
              type="button"
              tone="primary"
              onClick={() => void onRestore?.()}
            >
              Restaurar
            </Button>
            <Button
              type="button"
              onClick={() => void onPurge?.()}
            >
              Purgar
            </Button>
          </div>
        ) : isDuplicate ? (
          <StateBlock
            title="Este recurso quedo fuera de Pendientes"
            description={
              resource.canonicalOriginalFilename
                ? `Se detecto como duplicado exacto de ${resource.canonicalOriginalFilename}.`
                : "Los duplicados exactos no entran a la cola de clasificacion."
            }
          />
        ) : (
          <>
            <Field
              label="Paso 1"
              description="Real o ficticio."
              className="booruView__field"
            >
              <SegmentedControl
                options={realityOptions}
                value={draft?.reality || ""}
                onChange={(value) => {
                  const nextReality = value === "real" || value === "ficticio" ? value : null;

                  onDraftChange?.((currentDraft) => markDraftDirty({
                    ...currentDraft,
                    reality: nextReality,
                  }, "reality"));
                }}
                ariaLabel="Clasificacion real o ficticio"
              />
            </Field>

            {draft?.reality === "real" ? (
              <>
                <EntityField
                  kind="author"
                  label="Persona"
                  description="Obligatorio para recursos reales."
                  required
                  selectedItems={draft.authors}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      authors: items,
                    }, "authors"));
                  }}
                  disabled={saving}
                />

                <EntityField
                  kind="character"
                  label="Characters"
                  description="Opcional para cosplay u otras representaciones."
                  selectedItems={draft.characters}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      characters: items,
                      characterUniverses: pruneCharacterUniverseAssignments(
                        currentDraft.characterUniverses,
                        items,
                      ),
                    }, "characters"));
                  }}
                  disabled={saving}
                />
              </>
            ) : null}

            {draft?.reality === "ficticio" ? (
              <>
                <EntityField
                  kind="artist"
                  label="Artists"
                  description="Obligatorio para recursos ficticios."
                  required
                  selectedItems={draft.artists}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      artists: items,
                    }, "artists"));
                  }}
                  disabled={saving}
                />

                <EntityField
                  kind="character"
                  label="Characters"
                  description="Opcional si ya resuelves el recurso con universe directo. Si agregas un character, necesita universe."
                  selectedItems={draft.characters}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      characters: items,
                      characterUniverses: pruneCharacterUniverseAssignments(
                        currentDraft.characterUniverses,
                        items,
                      ),
                    }, "characters"));
                  }}
                  disabled={saving}
                />

                <EntityField
                  kind="universe"
                  label="Universes"
                  description="Universe directo del recurso. Puede resolver el bloque esencial sin character."
                  selectedItems={draft.universes}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => markDraftDirty({
                      ...currentDraft,
                      universes: items,
                    }, "universes"));
                  }}
                  disabled={saving}
                />

                {Array.isArray(draft.characters) && draft.characters.length ? (
                  <Field
                    label="Universe por character"
                    description="Si un character no tiene universe propio, puedes asignarlo al vuelo."
                    className="booruView__field"
                  >
                    <div className="booruView__characterUniverseList">
                      {draft.characters.map((character) => {
                        const persistedUniverse = getCharacterUniverse(character);
                        const selectedUniverse = getDraftUniverseForCharacter(draft, character.id);
                        const resolvedUniverse = persistedUniverse || selectedUniverse;

                        return (
                          <div key={character.id} className="booruView__characterUniverseRow">
                            <div className="booruView__characterUniverseHeader">
                              <strong>{character.displayName}</strong>
                              {resolvedUniverse ? (
                                <span className="booruView__tagChip">{resolvedUniverse.displayName}</span>
                              ) : (
                                <span className="booruView__metaPlaceholder">Universe requerido</span>
                              )}
                            </div>

                            {persistedUniverse ? (
                              <span className="booruView__suggestionsHint">
                                Universe resuelto desde el character.
                              </span>
                            ) : (
                              <SingleEntityField
                                kind="universe"
                                label={`Universe para ${character.displayName}`}
                                value={selectedUniverse}
                                onChange={(universe) => {
                                  onDraftChange?.((currentDraft) => ({
                                    ...markDraftDirty(currentDraft, "characterUniverses"),
                                    characterUniverses: pruneCharacterUniverseAssignments(
                                      {
                                        ...currentDraft.characterUniverses,
                                        [character.id]: universe,
                                      },
                                      currentDraft.characters,
                                    ),
                                  }));
                                }}
                                disabled={saving}
                                placeholder={`Buscar o crear universe para ${character.displayName}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Field>
                ) : null}
              </>
            ) : (
              <EntityField
                kind="artist"
                label="Artists"
                description="Opcional. Sirve para creadores de la obra visual."
                selectedItems={draft.artists}
                onChange={(items) => {
                  onDraftChange?.((currentDraft) => markDraftDirty({
                    ...currentDraft,
                    artists: items,
                  }, "artists"));
                }}
                disabled={saving}
              />
            )}

            <TagField
              label="Tags manuales"
              description="Tags planas propias de Booru. Enter crea la faltante."
              selectedItems={draft.manualTags}
              onChange={(items) => {
                onDraftChange?.((currentDraft) => markDraftDirty({
                  ...currentDraft,
                  manualTags: items,
                }, "manualTags"));
              }}
              disabled={saving}
            />

            <span className="booruView__suggestionsHint">
              {saving
                ? "Guardando cambios..."
                : canSaveProgress
                  ? "Los cambios se estan preparando para guardado automatico."
                  : "Los cambios se guardan automaticamente al confirmar cada campo."}
            </span>
          </>
        )}
      </div>
    </SectionPanel>
  );
}
