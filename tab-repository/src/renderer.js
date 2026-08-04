import TabRepositoryView from "./TabRepositoryView.jsx";
import TabRepositorySettings from "./TabRepositorySettings.jsx";
import { RepositoryIcon } from "./icons.jsx";
import { TAB_REPOSITORY_PLUGIN_ID, TAB_REPOSITORY_VIEW_ID } from "./settings.js";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") return;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = new URL("./styles.css", import.meta.url).href;
  styleElement.dataset.nexusPluginStyles = TAB_REPOSITORY_PLUGIN_ID;
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const tabRepositoryRenderer = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerView({
      id: TAB_REPOSITORY_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Tab Repository",
      icon: RepositoryIcon,
      tone: "code",
      surface: "workspace",
      component: (props) => <TabRepositoryView {...props} ctx={ctx} />,
    });
    ctx.registerSideToolbarButton({
      id: "nexus.tab-repository.toolbar",
      pluginId: ctx.pluginId,
      order: 280,
      icon: RepositoryIcon,
      tone: "code",
      label: "Tab Repository",
      onClick: () => void ctx.openView({
        viewId: TAB_REPOSITORY_VIEW_ID,
        reuse: true,
        sourceId: "nexus.tab-repository.toolbar",
      }),
      isActive: ({ getState }) => {
        const surface = getState().data.workspaceSurface;
        return surface?.kind === "workspace-view" && surface.viewId === TAB_REPOSITORY_VIEW_ID;
      },
    });
    ctx.registerSettingsSection({
      id: "nexus.tab-repository.visibility",
      pluginId: ctx.pluginId,
      title: "Visualización",
      component: () => <TabRepositorySettings ctx={ctx} />,
    });
  },
  deactivate() {
    disposeStylesheet();
  },
};

export default tabRepositoryRenderer;
