const { useEffect, useMemo, useRef, useState } = window.React;
import PluginMetadataForm from "./PluginMetadataForm.jsx";
import { MUSICA_ENGINE_ID, isSupportedAudioItem } from "./renderer-helpers.js";

const { ipcRenderer } = window.require("electron");

const DEFAULT_AUDIO_STATE = {
  audioFile: null,
  src: null,
  error: "",
};

const DEFAULT_PLAYBACK_STATE = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
};

const DEFAULT_PREFERENCES_STATE = {
  volume: 0.85,
  muted: false,
};

const DEFAULT_METADATA_STATE = {
  open: false,
  loading: false,
  error: "",
  formInstance: null,
};

function getFileName(filePath) {
  return String(filePath || "")
    .split(/[\\/]/)
    .pop() || "Audio";
}

function getAudioMimeType(filePath, audioFile) {
  if (audioFile?.mimeType) {
    return audioFile.mimeType;
  }

  const extension = String(filePath || "")
    .split(".")
    .pop()
    .trim()
    .toLowerCase();

  if (extension === "wav") return "audio/wav";
  if (extension === "ogg" || extension === "oga" || extension === "opus") return "audio/ogg";
  if (extension === "flac") return "audio/flac";
  if (extension === "m4a") return "audio/mp4";
  if (extension === "aac") return "audio/aac";
  return "audio/mpeg";
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getNavigationItems(navigationItems) {
  return Array.isArray(navigationItems)
    ? navigationItems.filter(isSupportedAudioItem)
    : [];
}

function getPlaybackStateSnapshot(currentValue) {
  return currentValue && typeof currentValue === "object"
    ? { ...DEFAULT_PLAYBACK_STATE, ...currentValue }
    : { ...DEFAULT_PLAYBACK_STATE };
}

function getPreferencesStateSnapshot(currentValue) {
  return currentValue && typeof currentValue === "object"
    ? { ...DEFAULT_PREFERENCES_STATE, ...currentValue }
    : { ...DEFAULT_PREFERENCES_STATE };
}

function getMetadataStateSnapshot(currentValue) {
  return currentValue && typeof currentValue === "object"
    ? { ...DEFAULT_METADATA_STATE, ...currentValue }
    : { ...DEFAULT_METADATA_STATE };
}

export default function MusicAudioEngine({
  tab,
  tabId,
  item,
  itemId,
  filePath,
  navigationItems,
  hostApi,
}) {
  const audioRef = useRef(null);
  const [audioState, setAudioState] = useState(DEFAULT_AUDIO_STATE);
  const [playback, setPlayback] = useState(DEFAULT_PLAYBACK_STATE);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES_STATE);
  const [metadataState, setMetadataState] = useState(DEFAULT_METADATA_STATE);

  const audioItems = useMemo(() => getNavigationItems(navigationItems), [navigationItems]);
  const currentIndex = audioItems.findIndex((entry) => entry?.id === itemId);
  const previousItem = currentIndex > 0 ? audioItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < audioItems.length - 1
      ? audioItems[currentIndex + 1]
      : null;

  useEffect(() => {
    const storedVolume = hostApi.getState().data.audioPlaybackVolume ?? 0.85;
    const storedMuted = hostApi.getState().data.audioPlaybackMuted ?? false;

    setPreferences({
      volume: Number.isFinite(storedVolume) ? storedVolume : 0.85,
      muted: Boolean(storedMuted),
    });
  }, [hostApi]);

  useEffect(() => {
    if (!itemId) {
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    const loadAudio = async () => {
      try {
        const response = await ipcRenderer.invoke("audio:getByItemId", itemId);

        if (cancelled) {
          return;
        }

        if (!response?.ok) {
          setAudioState({
            audioFile: null,
            src: null,
            error: response?.error || "No se pudo cargar el audio musical.",
          });
          return;
        }

        const { audioFile, buffer } = response.data || {};
        const blob = new Blob([buffer], {
          type: getAudioMimeType(filePath, audioFile),
        });
        objectUrl = URL.createObjectURL(blob);

        setAudioState({
          audioFile,
          src: objectUrl,
          error: "",
        });
        setPlayback({
          currentTime: 0,
          duration: Number.isFinite(audioFile?.duration) ? audioFile.duration : 0,
          isPlaying: false,
        });
      } catch (error) {
        if (!cancelled) {
          setAudioState({
            audioFile: null,
            src: null,
            error: error instanceof Error ? error.message : "No se pudo cargar el audio musical.",
          });
        }
      }
    };

    void loadAudio();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [filePath, itemId]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    audio.volume = clamp(preferences.volume, 0, 1);
    audio.muted = preferences.muted;

    return undefined;
  }, [preferences]);

  const openNeighbor = async (nextTarget) => {
    if (!nextTarget?.id) {
      return;
    }

    const uiState = tab?.uiState?.itemEngineSessionOverrideId
      ? {
          itemEngineSessionOverrideId: tab.uiState.itemEngineSessionOverrideId,
        }
      : {};

    await hostApi.actions.openFile({
      item: nextTarget,
      sourceId: "musica.engine.navigation",
      reuse: true,
      targetTabId: tabId,
      uiState,
    });
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setPlayback((currentValue) => ({
        ...getPlaybackStateSnapshot(currentValue),
        isPlaying: true,
      }));
      return;
    }

    audio.pause();
    setPlayback((currentValue) => ({
      ...getPlaybackStateSnapshot(currentValue),
      isPlaying: false,
    }));
  };

  const handleOpenMetadata = async () => {
    if (!itemId) {
      return;
    }

    setMetadataState({
      open: true,
      loading: true,
      error: "",
      formInstance: null,
    });

    try {
      const formsResponse = await ipcRenderer.invoke("metadata:list-item-forms", itemId);

      if (!formsResponse?.ok) {
        throw new Error(formsResponse?.error || "No se pudieron listar formularios de metadata.");
      }

      const musicaForm = (formsResponse.data || []).find(
        (entry) => entry?.resourceId === "audio.track",
      );

      if (!musicaForm) {
        throw new Error("Este item no expone metadata musical editable.");
      }

      const formResponse = await ipcRenderer.invoke("metadata:get-form-instance", {
        itemId,
        resourceId: musicaForm.resourceId,
        variantId: musicaForm.variantId,
      });

      if (!formResponse?.ok) {
        throw new Error(formResponse?.error || "No se pudo abrir el formulario de metadata.");
      }

      setMetadataState({
        open: true,
        loading: false,
        error: "",
        formInstance: formResponse.data,
      });
    } catch (error) {
      setMetadataState({
        open: true,
        loading: false,
        error: error instanceof Error ? error.message : "No se pudo abrir el formulario de metadata.",
        formInstance: null,
      });
    }
  };

  return (
    <div className="musicaEngine">
      <div className="musicaEngine__shell">
        <section className="musicaEngine__hero">
          <div className="musicaEngine__cover">
            {audioState.audioFile?.cover ? (
              <img
                src={audioState.audioFile.cover}
                alt={audioState.audioFile.title || getFileName(filePath)}
                draggable="false"
              />
            ) : (
              <div className="musicaEngine__coverPlaceholder">
                <strong>{getFileName(filePath).slice(0, 1).toUpperCase()}</strong>
                <span>Music engine</span>
              </div>
            )}
          </div>

          <div className="musicaEngine__copy">
            <span className="musicaEngine__eyebrow">Plugin musica</span>
            <h1>{audioState.audioFile?.title || getFileName(filePath)}</h1>
            <p>
              {audioState.audioFile?.authors?.length
                ? audioState.audioFile.authors.join(", ")
                : "Sin autores curados"}
            </p>

            <div className="musicaEngine__meta">
              <span>{audioState.audioFile?.album || "Sin album"}</span>
              <span>{audioState.audioFile?.genre || "Sin genero"}</span>
              <span>{formatTime(playback.duration || audioState.audioFile?.duration || 0)}</span>
            </div>

            <div className="musicaEngine__actions">
              <button type="button" onClick={() => void openNeighbor(previousItem)} disabled={!previousItem}>
                Anterior
              </button>
              <button type="button" className="is-primary" onClick={() => void togglePlayback()} disabled={!audioState.src}>
                {playback.isPlaying ? "Pausar" : "Reproducir"}
              </button>
              <button type="button" onClick={() => void openNeighbor(nextItem)} disabled={!nextItem}>
                Siguiente
              </button>
              <button type="button" onClick={() => void handleOpenMetadata()} disabled={!itemId}>
                Editar metadata
              </button>
            </div>
          </div>
        </section>

        {audioState.error ? (
          <div className="musicaEngine__state musicaEngine__state--error">{audioState.error}</div>
        ) : (
          <section className="musicaEngine__playerPanel">
            <audio
              ref={audioRef}
              src={audioState.src || undefined}
              onPlay={() =>
                setPlayback((currentValue) => ({
                  ...getPlaybackStateSnapshot(currentValue),
                  isPlaying: true,
                }))
              }
              onPause={() =>
                setPlayback((currentValue) => ({
                  ...getPlaybackStateSnapshot(currentValue),
                  isPlaying: false,
                }))
              }
              onTimeUpdate={(event) => {
                const nextCurrentTime = event.currentTarget?.currentTime ?? 0;
                const nextDuration = event.currentTarget?.duration;

                setPlayback((currentValue) => {
                  const nextPlayback = getPlaybackStateSnapshot(currentValue);
                  return {
                    ...nextPlayback,
                    currentTime: nextCurrentTime,
                    duration:
                      Number.isFinite(nextDuration) && nextDuration > 0
                        ? nextDuration
                        : nextPlayback.duration,
                  };
                });
              }}
              onLoadedMetadata={(event) => {
                const nextDuration = event.currentTarget?.duration;

                setPlayback((currentValue) => {
                  const nextPlayback = getPlaybackStateSnapshot(currentValue);
                  return {
                    ...nextPlayback,
                    duration: Number.isFinite(nextDuration)
                      ? nextDuration
                      : nextPlayback.duration,
                  };
                });
              }}
              onEnded={() =>
                setPlayback((currentValue) => {
                  const nextPlayback = getPlaybackStateSnapshot(currentValue);
                  return {
                    ...nextPlayback,
                  isPlaying: false,
                  currentTime: nextPlayback.duration,
                  };
                })
              }
            />

            <div className="musicaEngine__timeline">
              <span>{formatTime(playback.currentTime)}</span>
              <input
                type="range"
                min="0"
                max={Number.isFinite(playback.duration) && playback.duration > 0 ? playback.duration : 0}
                step="0.1"
                value={Math.min(playback.currentTime, playback.duration || 0)}
                onChange={(event) => {
                  const audio = audioRef.current;
                  const nextTime = Number(event.target.value);

                  if (audio) {
                    audio.currentTime = nextTime;
                  }

                  setPlayback((currentValue) => ({
                    ...getPlaybackStateSnapshot(currentValue),
                    currentTime: nextTime,
                  }));
                }}
                disabled={!audioState.src}
              />
              <span>{formatTime(playback.duration)}</span>
            </div>

            <div className="musicaEngine__volume">
              <button
                type="button"
                onClick={() =>
                  setPreferences((currentValue) => {
                    const nextPreferences = getPreferencesStateSnapshot(currentValue);
                    const nextMuted = !nextPreferences.muted;
                    void hostApi.getState().setVar("audioPlaybackMuted", nextMuted);
                    return {
                      ...nextPreferences,
                      muted: nextMuted,
                    };
                  })
                }
              >
                {preferences.muted ? "Activar audio" : "Silenciar"}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={preferences.volume}
                onChange={(event) => {
                  const nextVolume = clamp(Number(event.target.value), 0, 1);
                  setPreferences((currentValue) => {
                    const nextPreferences = getPreferencesStateSnapshot(currentValue);
                    return {
                      ...nextPreferences,
                      volume: nextVolume,
                      muted: nextPreferences.muted && nextVolume > 0 ? false : nextPreferences.muted,
                    };
                  });
                  void hostApi.getState().setVar("audioPlaybackVolume", nextVolume);
                }}
              />
            </div>
          </section>
        )}

        <div className="musicaEngine__details">
          <div>
            <span>Ruta</span>
            <strong>{filePath}</strong>
          </div>
          <div>
            <span>Motor</span>
            <strong>{MUSICA_ENGINE_ID}</strong>
          </div>
          <div>
            <span>Item</span>
            <strong>{item?.id || itemId}</strong>
          </div>
        </div>
      </div>

      {metadataState.open ? (
        <div className="musicaEngine__overlay" onClick={() => setMetadataState((currentValue) => ({ ...getMetadataStateSnapshot(currentValue), open: false }))}>
          <div className="musicaEngine__drawer" onClick={(event) => event.stopPropagation()}>
            <div className="musicaEngine__drawerHeader">
              <div>
                <span>Metadata musical</span>
                <strong>{audioState.audioFile?.title || getFileName(filePath)}</strong>
              </div>
              <button type="button" onClick={() => setMetadataState((currentValue) => ({ ...getMetadataStateSnapshot(currentValue), open: false }))}>
                Cerrar
              </button>
            </div>

            {metadataState.loading ? (
              <div className="musicaEngine__state">Cargando formulario...</div>
            ) : metadataState.error ? (
              <div className="musicaEngine__state musicaEngine__state--error">
                {metadataState.error}
              </div>
            ) : (
              <PluginMetadataForm
                itemId={itemId}
                formInstance={metadataState.formInstance}
                onSubmitted={async () => {
                  await handleOpenMetadata();
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
