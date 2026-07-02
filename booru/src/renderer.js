import BooruWorkspaceView from "./BooruWorkspaceView.jsx";
import {
  BOORU_DEFAULT_SECTION,
  BOORU_PLUGIN_ID,
  BOORU_SECTION_OPTIONS,
  BOORU_WORKSPACE_VIEW_ID,
} from "./constants.js";
import { BooruIcon } from "./icons.jsx";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = BOORU_PLUGIN_ID;
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const booruRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: BOORU_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Booru",
      icon: BooruIcon,
      tone: "document",
      surface: "workspace",
      workspaceFrame: {
        sections: BOORU_SECTION_OPTIONS,
        defaultSection: BOORU_DEFAULT_SECTION,
      },
      component: (props) => <BooruWorkspaceView {...props} ctx={ctx} />,
    });

    ctx.registerSideToolbarButton({
      id: "nexus.booru.workspace-button",
      pluginId: ctx.pluginId,
      order: 280,
      icon: BooruIcon,
      tone: "document",
      label: "Booru",
      onClick: () => {
        void ctx.openView({
          viewId: BOORU_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.booru.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return (
          workspaceSurface?.kind === "workspace-view"
          && workspaceSurface.viewId === BOORU_WORKSPACE_VIEW_ID
        );
      },
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default booruRendererPlugin;
