import { Button, SectionPanel, SegmentedControl } from "../../../../../nexus-frontend/src/ui/index.js";
const React = window.React;
const { useEffect, useRef } = React;
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
  GalleryGrid,
  helpers,
  profileTabOptions,
  resourceGridColumns,
}) {
  const { getInitials, entityKindLabels, isTextEntryElement, buildAvatarMediaStyle } = helpers;
  const entityProfileRootRef = useRef(null);
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

  if (kind === "character" && profile?.universe?.displayName) {
    profileMeta.push(profile.universe.displayName);
  }

  useEffect(() => {
    entityProfileRootRef.current?.focus();
  }, [kind, profile?.id]);

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
              onContextMenu={(event) => onVisualContextMenu?.(profile?.banner || profile?.sample, event)}
            >
              {bannerSource ? (
                <MediaPreview
                  pathValue={bannerSource.pathValue}
                  mediaKind={bannerSource.mediaKind}
                  alt={profile?.displayName || ""}
                  autoplay={bannerSource.mediaKind === "video"}
                  loop={bannerSource.mediaKind === "video"}
                  objectFit="cover"
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
                onContextMenu={(event) => onVisualContextMenu?.(profile?.avatar || profile?.sample, event)}
              >
                {avatarSource ? (
                  <MediaPreview
                    pathValue={avatarSource.pathValue}
                    mediaKind={avatarSource.mediaKind}
                    alt={profile?.displayName || ""}
                  autoplay={avatarSource.mediaKind === "video"}
                  loop={avatarSource.mediaKind === "video"}
                  objectFit="cover"
                  mediaStyle={avatarSource.mediaKind === "video" ? null : avatarMediaStyle}
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
