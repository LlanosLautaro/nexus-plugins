import { Button, SectionPanel, SegmentedControl } from "../../../../../nexus-frontend/src/ui/index.js";
const React = window.React;
const { useEffect, useRef, useState } = React;
export default function EntityProfileView({
  kind,
  profile,
  activeTab,
  galleryState,
  galleryLoading,
  onLoadMoreGallery,
  entityMutationBusy,
  universeCharacterCreateValue,
  onBack,
  onTabChange,
  onOpenInMedia,
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
  DownloadIcon,
  helpers,
  profileTabOptions,
  resourceGridColumns,
}) {
  const { getInitials, entityKindLabels, isTextEntryElement, buildAvatarMediaStyle } = helpers;
  const entityProfileRootRef = useRef(null);
  const fastScopeRef = useRef(`booru-profile-${globalThis.crypto?.randomUUID?.() || Date.now()}`);
  const [fastClassificationActive, setFastClassificationActive] = useState(false);
  const bannerSource = profile?.banner?.originalStoragePath || profile?.banner?.sampleStoragePath
    ? {
      pathValue: profile.banner.originalStoragePath || profile.banner.sampleStoragePath,
      mediaKind: profile.banner.originalMediaKind || profile.banner.sampleMediaKind || "image",
    }
    : profile?.sample?.sampleStoragePath
      ? {
        pathValue: profile.sample.sampleStoragePath,
        mediaKind: profile.sample.sampleMediaKind || "image",
      }
      : null;
  const avatarSource = profile?.avatar?.originalStoragePath || profile?.avatar?.sampleStoragePath
    ? {
      pathValue: profile.avatar.originalStoragePath || profile.avatar.sampleStoragePath,
      mediaKind: profile.avatar.originalMediaKind || profile.avatar.sampleMediaKind || "image",
    }
    : profile?.sample?.sampleStoragePath
      ? {
        pathValue: profile.sample.sampleStoragePath,
        mediaKind: profile.sample.sampleMediaKind || "image",
      }
      : null;
  const profileMeta = [
    `${profile?.resourceCount || 0} recursos`,
    entityKindLabels[kind] || kind,
  ];
  const avatarMediaStyle = buildAvatarMediaStyle(profile?.visualSettings?.avatar);
  const bannerMediaStyle = buildAvatarMediaStyle(profile?.visualSettings?.banner);

  if (kind === "character" && profile?.universe?.displayName) {
    profileMeta.push(profile.universe.displayName);
  }

  useEffect(() => {
    entityProfileRootRef.current?.focus();
  }, [kind, profile?.id]);

  useEffect(() => () => {
    void window.nexus.ipc.invoke("booru:clear-fast-classification", { scopeId: fastScopeRef.current });
  }, [kind, profile?.id]);

  const toggleFastClassification = async () => {
    if (!profile?.id) return;
    if (fastClassificationActive) {
      await window.nexus.ipc.invoke("booru:clear-fast-classification", { scopeId: fastScopeRef.current });
      setFastClassificationActive(false);
      return;
    }
    const response = await window.nexus.ipc.invoke("booru:set-fast-classification", {
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
      >
        <div className="booruView__resourcePanelContent booruView__entityProfileContent">
          <div className="booruView__entityProfileToolbar">
            <Button type="button" onClick={() => onBack?.()}>
              Volver
            </Button>
            <Button type="button" tone="primary" onClick={() => onOpenInMedia?.()}>
              Abrir en Media
            </Button>
          </div>

          <div className="booruView__entityProfileHero">
            <div
              className="booruView__entityProfileBanner"
              onContextMenu={(event) => onVisualContextMenu?.("banner", profile?.banner || profile?.sample, event)}
            >
              {bannerSource ? (
                <MediaPreview
                  pathValue={bannerSource.pathValue}
                  mediaKind={bannerSource.mediaKind}
                  alt={profile?.displayName || ""}
                  autoplay={bannerSource.mediaKind === "video"}
                  loop={bannerSource.mediaKind === "video"}
                  objectFit="contain"
                  mediaStyle={bannerMediaStyle}
                  forceOriginal
                />
              ) : (
                <div className="booruView__entityProfileBannerFallback">
                  <span>{entityKindLabels[kind] || kind}</span>
                </div>
              )}
            </div>

            <div className="booruView__entityProfileIdentity">
              <div
                className="booruView__entityProfileAvatar"
                onContextMenu={(event) => onVisualContextMenu?.("avatar", profile?.avatar || profile?.sample, event)}
              >
                {avatarSource ? (
                  <MediaPreview
                    pathValue={avatarSource.pathValue}
                    mediaKind={avatarSource.mediaKind}
                    alt={profile?.displayName || ""}
                  autoplay={avatarSource.mediaKind === "video"}
                  loop={avatarSource.mediaKind === "video"}
                  objectFit="contain"
                  mediaStyle={avatarMediaStyle}
                  forceOriginal
                  />
                ) : (
                  <div className="booruView__entityProfileAvatarFallback">
                    <span>{getInitials(profile?.displayName)}</span>
                  </div>
                )}
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
          ) : (
            <GalleryGrid
              items={Array.isArray(galleryState?.items) ? galleryState.items : []}
              loading={galleryLoading}
              hasMore={Boolean(galleryState?.hasMore)}
              onLoadMore={onLoadMoreGallery}
              onOpenResource={onGalleryResourceOpen}
              onContextMenu={onGalleryResourceContextMenu}
              MediaPreview={MediaPreview}
              canUseVisual={canUseVisual}
              resourceGridColumns={resourceGridColumns}
            />
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
