import MusicAudioEngine from "./MusicAudioEngine.jsx";
import MusicaSettingsSection from "./MusicaSettingsSection.jsx";
import { MUSICA_ENGINE_ID, isSupportedAudioItem } from "./renderer-helpers.js";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = "nexus.musica";
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const musicaRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerItemEngine({
      pluginId: ctx.pluginId,
      id: MUSICA_ENGINE_ID,
      displayName: "Musica",
      extensions: ["mp3", "wav", "ogg", "flac", "m4a", "aac", "opus", "oga"],
      mimeTypes: ["audio/*"],
      priority: 320,
      supportsGlobalMatch: false,
      supportsFolderAssignments: true,
      matches: (item) => isSupportedAudioItem(item),
      component: (props) => <MusicAudioEngine {...props} hostApi={props.hostApi || ctx} />,
    });

    ctx.registerSettingsSection({
      id: "nexus.musica.folder-assignments",
      pluginId: ctx.pluginId,
      title: "Carpetas musicales",
      description:
        "Elige que carpetas del vault quedan reclamadas por el engine musical especializado.",
      component: () => <MusicaSettingsSection ctx={ctx} />,
    });
  },
  deactivate() {
    disposeStylesheet();
  },
};

export default musicaRendererPlugin;
