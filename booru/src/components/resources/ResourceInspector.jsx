import { Button, Field, SectionPanel, SegmentedControl, StateBlock } from "@nexus/ui";
import {
  getBooruDetailsFieldSchema,
  getBooruDetailsRealityState,
} from "../../domain/details-policy.js";

function formatDuration(value) {
  if (value == null || value === "") {
    return "—";
  }

  const durationMs = Number(value);

  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "—";
  }

  const totalSeconds = Math.round(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getSharedMetadataValue(resources, selectValue, formatValue = (value) => String(value ?? "")) {
  const values = (Array.isArray(resources) ? resources : []).filter(Boolean).map(selectValue);

  if (!values.length) {
    return "—";
  }

  const formattedValues = values.map((value) => formatValue(value) || "—");
  return formattedValues.every((value) => value === formattedValues[0])
    ? formattedValues[0]
    : "Varios";
}

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
  onEnsureEntity,
  helpers,
  MediaPreview,
  EntityField,
  TagField,
  SingleEntityField,
  mediaKindLabels,
  realityOptions,
  priorityEntity = null,
}) {
  const {
    applyClassificationPolicyToDraft,
    canSaveDraftProgress,
    formatFileSize,
    getCharacterUniverse,
    getDraftUniverseForCharacter,
    markDraftDirty,
    pruneCharacterUniverseAssignments,
  } = helpers;
  const normalizedSelection = (Array.isArray(selectedResources) ? selectedResources : []).filter(Boolean);
  const selectionCount = normalizedSelection.length;
  const isBatch = selectionCount > 1;
  const resource = activeResource || normalizedSelection[0] || null;

  if (!resource) {
    return (
      <SectionPanel className="booruView__panel booruView__panel--fill">
        <StateBlock
          centered
          title="Selecciona un recurso"
          description="Details aparece aquí para clasificar o revisar el recurso activo."
        />
      </SectionPanel>
    );
  }

  const isDuplicate = section === "duplicates" || resource.classificationState === "duplicate-review";
  const isTrash = section === "trash" || normalizedSelection.every((item) => item?.trashedAt);
  const canSaveProgress = canSaveDraftProgress(draft);
  const mixedFields = new Set(Array.isArray(draft?.mixedFields) ? draft.mixedFields : []);
  const realityState = getBooruDetailsRealityState(draft);
  const fieldSchema = getBooruDetailsFieldSchema(draft);
  const metadataResources = isBatch ? normalizedSelection : [resource];
  const metadata = [
    {
      label: "Resolución",
      value: getSharedMetadataValue(
        metadataResources,
        (item) => item?.width && item?.height ? `${item.width}×${item.height}` : null,
        (value) => value || "—",
      ),
    },
    {
      label: "Peso",
      value: getSharedMetadataValue(metadataResources, (item) => item?.fileSize, formatFileSize),
    },
    {
      label: "Tipo",
      value: getSharedMetadataValue(
        metadataResources,
        (item) => item?.mediaKind,
        (value) => mediaKindLabels[value] || value || "—",
      ),
    },
    {
      label: "Duración",
      value: getSharedMetadataValue(metadataResources, (item) => item?.durationMs, formatDuration),
    },
  ];

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill">
      <div className="booruView__inspectorBody">
        <div className="booruView__inspectorTitleRow">
          <div className="booruView__inspectorTitleCopy">
            <strong>{isBatch ? `${selectionCount} recursos seleccionados` : resource.originalFilename}</strong>
            {isBatch ? <span className="booruView__suggestionsHint">Los cambios se aplican como patch a toda la selección.</span> : null}
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

        <dl className="booruView__detailsMetadata" aria-label="Metadata del recurso">
          {metadata.map((item) => (
            <div key={item.label} className="booruView__detailsMetadataItem">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        {isTrash ? (
          <div className="booruView__inspectorActions">
            <Button type="button" tone="primary" onClick={() => void onRestore?.()}>
              Restaurar
            </Button>
            <Button type="button" onClick={() => void onPurge?.()}>
              Purgar
            </Button>
          </div>
        ) : isDuplicate ? (
          <StateBlock
            title="Este recurso quedó fuera de Pendientes"
            description={
              resource.canonicalOriginalFilename
                ? `Se detectó como duplicado exacto de ${resource.canonicalOriginalFilename}.`
                : "Los duplicados exactos no entran a la cola de clasificación."
            }
          />
        ) : (
          <div className="booruView__detailsEditor">
            {realityState.mode === "editable" ? (
              <Field
                label="Realidad"
                description={
                  realityState.mixed
                    ? "La selección contiene valores mixtos. Elige uno solo si quieres reemplazarlos en todos los recursos."
                    : "Puedes definirla mientras no haya Persona, Character ni Artist."
                }
                className="booruView__field"
              >
                <SegmentedControl
                  options={realityOptions}
                  value={draft?.reality || "undefined"}
                  variant="compact"
                  onChange={(value) => {
                    const nextReality = value === "real" || value === "ficticio" ? value : null;
                    onDraftChange?.((currentDraft) => applyClassificationPolicyToDraft(markDraftDirty({
                      ...currentDraft,
                      reality: nextReality,
                    }, "reality"), { realityWasEdited: true }));
                  }}
                  ariaLabel="Realidad del recurso"
                />
              </Field>
            ) : (
              <div className="booruView__detailsReality" aria-label="Realidad del recurso">
                <span>Realidad</span>
                <strong>{realityState.label}</strong>
                <small>
                  {realityState.mixed
                    ? "La selección conserva sus valores derivados."
                    : realityState.source === "manual"
                      ? "Valor manual conservado; las entidades tienen prioridad visual."
                      : "Determinada por las entidades asociadas."}
                </small>
              </div>
            )}

            {fieldSchema.map((fieldConfig) => {
              const selectedItems = draft?.[fieldConfig.field] || [];
              const mixed = mixedFields.has(fieldConfig.field);

              return (
                <EntityField
                  key={fieldConfig.kind}
                  kind={fieldConfig.kind}
                  label={fieldConfig.label}
                  description={mixed ? `Valores mixtos; se muestran los compartidos. ${fieldConfig.description}` : fieldConfig.description}
                  required={fieldConfig.required}
                  selectedItems={selectedItems}
                  onEnsureEntity={onEnsureEntity}
                  onChange={(items) => {
                    onDraftChange?.((currentDraft) => {
                      const nextDraft = markDraftDirty({
                        ...currentDraft,
                        [fieldConfig.field]: items,
                        ...(fieldConfig.kind === "character" ? {
                          characterUniverses: pruneCharacterUniverseAssignments(
                            currentDraft.characterUniverses,
                            items,
                          ),
                        } : {}),
                      }, fieldConfig.field);
                      return applyClassificationPolicyToDraft(nextDraft);
                    });
                  }}
                  disabled={saving}
                  priorityEntity={priorityEntity?.kind === fieldConfig.kind ? priorityEntity : null}
                />
              );
            })}

            {Array.isArray(draft?.characters) && draft.characters.some((character) => !getCharacterUniverse(character)) ? (
              <div className="booruView__characterUniverseRepair">
                <span className="booruView__groupLabel">Universe requerido</span>
                <span className="booruView__suggestionsHint">Repara los Characters heredados inválidos antes de completar la clasificación.</span>
                <div className="booruView__characterUniverseList">
                  {draft.characters.filter((character) => !getCharacterUniverse(character)).map((character) => {
                    const selectedUniverse = getDraftUniverseForCharacter(draft, character.id);

                    return (
                      <div key={character.id} className="booruView__characterUniverseRow">
                        <div className="booruView__characterUniverseHeader">
                          <strong>{character.displayName}</strong>
                          {selectedUniverse ? (
                            <span className="booruView__tagChip">{selectedUniverse.displayName}</span>
                          ) : (
                            <span className="booruView__metaPlaceholder">Sin Universe</span>
                          )}
                        </div>
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
                          placeholder={`Buscar o crear Universe para ${character.displayName}`}
                          onEnsureEntity={onEnsureEntity}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <TagField
              label="Tags"
              description={
                mixedFields.has("manualTags")
                  ? "Valores mixtos; se muestran las tags compartidas. Buscar o crear aquí modifica solo las tags planas."
                  : "Tags planas del recurso. Enter crea la faltante."
              }
              selectedItems={draft?.manualTags || []}
              onChange={(items) => {
                onDraftChange?.((currentDraft) => markDraftDirty({
                  ...currentDraft,
                  manualTags: items,
                }, "manualTags"));
              }}
              disabled={saving}
            />

            <span className="booruView__suggestionsHint booruView__detailsSaveState">
              {saving
                ? "Guardando cambios..."
                : canSaveProgress
                  ? "Preparando guardado automático..."
                  : "Los cambios se guardan al confirmar cada campo."}
            </span>
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
