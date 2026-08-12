import { Button, SectionPanel, SegmentedControl } from "@nexus/ui";
import EntityVisualMedia from "./EntityVisualMedia.jsx";
const React = window.React;
const { useEffect, useRef, useState } = React;
export default function EntityProfileView({
  kind,
  profile,
  activeTab,
  galleryState,
  galleryLoading,
  relationKind,
  relationState,
  relationLoading,
  onLoadMoreGallery,
  onLoadMoreRelations,
  entityMutationBusy,
  universeCharacterCreateValue,
  onTabChange,
  onOpenRelatedEntity,
  onRelatedEntityContextMenu,
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse,
  onVisualContextMenu,
  onGalleryResourceContextMenu,
  onGalleryResourceOpen,
  onPasteClipboardImage,
  onProfileChange,
  MediaPreview,
  canUseVisual,
  DataTab,
  TagsTab,
  GalleryGrid,
  RelationsGrid,
  DownloadIcon,
  helpers,
  profileTabOptions,
  resourceGridColumns,
  entityGridColumns,
  scrollKey,
  scrollTop = 0,
  onScrollStateChange,
  gallerySelectedIds,
  onGallerySelectionChange,
  onResourceColumnsChange,
  onEntityColumnsChange,
  onEntityHover,
  onGroupAssociationHover,
}) {
  const { getInitials, entityKindLabels, isTextEntryElement } = helpers;
  const entityProfileRootRef = useRef(null);
  const fastScopeRef = useRef(`booru-profile-${globalThis.crypto?.randomUUID?.() || Date.now()}`);
  const [fastClassificationActive, setFastClassificationActive] = useState(false);
  const avatarVisual = profile?.visuals?.avatar || profile?.visual || null;
  const bannerVisual = profile?.visuals?.banner || null;
  const profileMeta = [
    `${profile?.resourceCount || 0} recursos`,
    entityKindLabels[kind] || kind,
  ];

  if (kind === "character" && profile?.universe?.displayName) {
    profileMeta.push(profile.universe.displayName);
  }

  useEffect(() => {
    entityProfileRootRef.current?.focus();
  }, [kind, profile?.id]);

  useEffect(() => {
    const node = entityProfileRootRef.current;
    if (!node) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      node.scrollTop = Math.max(0, Number(scrollTop) || 0);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [scrollKey, scrollTop]);

  useEffect(() => () => {
    void pluginIpc.invoke("booru:clear-fast-classification", { scopeId: fastScopeRef.current });
  }, [kind, profile?.id]);

  const toggleFastClassification = async () => {
    if (!profile?.id) return;
    if (fastClassificationActive) {
      await pluginIpc.invoke("booru:clear-fast-classification", { scopeId: fastScopeRef.current });
      setFastClassificationActive(false);
      return;
    }
    const response = await pluginIpc.invoke("booru:set-fast-classification", {
      kind,
      entityId: profile.id,
      scopeId: fastScopeRef.current,
    });
    if (!response?.ok) throw new Error(response?.error || "No se pudo activar la clasificacion rapida.");
    setFastClassificationActive(true);
  };

  const handleKeyDownCapture = (event) => {
    if (
      event.defaultPrevented
      || !(event.ctrlKey || event.metaKey)
      || event.altKey
      || String(event.key || "").toLowerCase() !== "v"
      || isTextEntryElement(event.target)
      || typeof onPasteClipboardImage !== "function"
      || entityMutationBusy
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void onPasteClipboardImage();
  };

  return (
    <SectionPanel className="booruView__panel booruView__panel--fill booruView__entityProfile">
      <div
        ref={entityProfileRootRef}
        className="booruView__resourcePanelBody"
        tabIndex={-1}
        onKeyDownCapture={handleKeyDownCapture}
        onScroll={(event) => onScrollStateChange?.(event.currentTarget.scrollTop || 0)}
      >
        <div className="booruView__resourcePanelContent booruView__entityProfileContent">
          <div className="booruView__entityProfileHero">
            <div
              className="booruView__entityProfileBanner"
              onContextMenu={(event) => onVisualContextMenu?.("banner", bannerVisual, event)}
            >
              <EntityVisualMedia
                visual={bannerVisual}
                alt={profile?.displayName || ""}
                MediaPreview={MediaPreview}
                fallback={(
                  <div className="booruView__entityProfileBannerFallback">
                    <span>{entityKindLabels[kind] || kind}</span>
                  </div>
                )}
              />
            </div>

            <div className="booruView__entityProfileIdentity">
              <div
                className="booruView__entityProfileAvatar"
                onContextMenu={(event) => onVisualContextMenu?.("avatar", avatarVisual, event)}
              >
                <EntityVisualMedia
                  visual={avatarVisual}
                  alt={profile?.displayName || ""}
                  MediaPreview={MediaPreview}
                  fallback={(
                    <div className="booruView__entityVisualFallback">
                      <span>{getInitials(profile?.displayName)}</span>
                    </div>
                  )}
                />
              </div>

              <div className="booruView__entityProfileCopy">
                <span className="booruView__groupLabel">{entityKindLabels[kind] || kind}</span>
                <h2>{profile?.displayName || "Entidad"}</h2>
                <div className="booruView__entityProfileMeta">
                  {profileMeta.map((entry) => (
                    <span key={entry} className="booruView__titlePill">{entry}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="booruView__entityProfileTabs">
              <SegmentedControl
                options={profileTabOptions}
                value={activeTab}
                onChange={(value) => onTabChange?.(value)}
                ariaLabel="Seccion del perfil"
              />
              <Button
                type="button"
                className={[
                  "booruView__fastClassificationToggle",
                  fastClassificationActive ? "is-active" : "",
                ].filter(Boolean).join(" ")}
                aria-pressed={fastClassificationActive}
                aria-label="Clasificacion rapida"
                data-tooltip={'Clasificacion rapida: mientras este perfil siga abierto, los recursos nuevos se asignan automaticamente a esta entidad. Se apaga al salir del perfil.'}
                onClick={() => void toggleFastClassification()}
              >
                <DownloadIcon size={15} />
              </Button>
            </div>
          </div>

          {activeTab === "data" ? (
            <DataTab
              kind={kind}
              profile={profile}
              busy={entityMutationBusy}
              universeCharacterCreateValue={universeCharacterCreateValue}
              onUniverseCharacterCreateValueChange={onUniverseCharacterCreateValueChange}
              onCreateCharacterInUniverse={onCreateCharacterInUniverse}
              onChangeCharacterUniverse={onChangeCharacterUniverse}
              onProfileChange={onProfileChange}
            />
          ) : activeTab === "tags" ? (
            <TagsTab
              kind={kind}
              profile={profile}
              busy={entityMutationBusy}
              onProfileChange={onProfileChange}
            />
          ) : relationKind ? (
            <RelationsGrid
              kind={relationKind}
              state={relationState}
              loading={relationLoading}
              onLoadMore={onLoadMoreRelations}
              onOpenEntity={onOpenRelatedEntity}
              onPreviewContextMenu={onRelatedEntityContextMenu}
              MediaPreview={MediaPreview}
              columns={entityGridColumns}
              onColumnsChange={onEntityColumnsChange}
              onEntityHover={onEntityHover}
              onGroupAssociationHover={onGroupAssociationHover}
            />
          ) : (
            <GalleryGrid
              items={Array.isArray(galleryState?.items) ? galleryState.items : []}
              placements={Array.isArray(galleryState?.placements) ? galleryState.placements : []}
              loading={galleryLoading}
              hasMore={Boolean(galleryState?.hasMore)}
              onLoadMore={onLoadMoreGallery}
              onOpenResource={onGalleryResourceOpen}
              onContextMenu={onGalleryResourceContextMenu}
              MediaPreview={MediaPreview}
              canUseVisual={canUseVisual}
              resourceGridColumns={resourceGridColumns}
              selectedIds={gallerySelectedIds}
              onSelectionChange={onGallerySelectionChange}
              onColumnsChange={onResourceColumnsChange}
              onGroupAssociationHover={onGroupAssociationHover}
            />
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
import { pluginIpc } from "../../ipc-client.js";
