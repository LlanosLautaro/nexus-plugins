import LifeTrackerView, { LIFE_TRACKER_HOME_WIDGET_PROVIDERS } from "./LifeTrackerView.jsx";
import {
  LIFE_TRACKER_DEFAULT_SECTION,
  LIFE_TRACKER_PLUGIN_ID,
  LIFE_TRACKER_SECTION_OPTIONS,
  LIFE_TRACKER_WORKSPACE_VIEW_ID,
} from "./constants.js";
import { HabitosIcon } from "./icons.jsx";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = LIFE_TRACKER_PLUGIN_ID;
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const lifeTrackerRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: LIFE_TRACKER_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Life Tracker",
      icon: HabitosIcon,
      tone: "document",
      surface: "workspace",
      workspaceFrame: {
        sections: LIFE_TRACKER_SECTION_OPTIONS,
        defaultSection: LIFE_TRACKER_DEFAULT_SECTION,
      },
      component: (props) => <LifeTrackerView {...props} ctx={ctx} />,
    });

    LIFE_TRACKER_HOME_WIDGET_PROVIDERS.forEach((provider) => {
      ctx.registerWidgetProvider({
        ...provider,
        pluginId: ctx.pluginId,
      });
    });

    ctx.registerSideToolbarButton({
      id: "nexus.life-tracker.workspace-button",
      pluginId: ctx.pluginId,
      order: 270,
      icon: HabitosIcon,
      tone: "document",
      label: "Life Tracker",
      onClick: () => {
        void ctx.openView({
          viewId: LIFE_TRACKER_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.life-tracker.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return (
          workspaceSurface?.kind === "workspace-view"
          && workspaceSurface.viewId === LIFE_TRACKER_WORKSPACE_VIEW_ID
        );
      },
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default lifeTrackerRendererPlugin;
