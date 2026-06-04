import HabitosView from "./HabitosView.jsx";
import { HABITOS_PLUGIN_ID, HABITOS_WORKSPACE_VIEW_ID } from "./constants.js";
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
  styleElement.dataset.nexusPluginStyles = HABITOS_PLUGIN_ID;
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const habitosRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: HABITOS_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Habitos y tareas",
      icon: HabitosIcon,
      tone: "document",
      surface: "workspace",
      component: (props) => <HabitosView {...props} ctx={ctx} />,
    });

    ctx.registerSideToolbarButton({
      id: "nexus.habitos.workspace-button",
      pluginId: ctx.pluginId,
      order: 270,
      icon: HabitosIcon,
      tone: "document",
      label: "Habitos",
      onClick: () => {
        void ctx.openView({
          viewId: HABITOS_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.habitos.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return (
          workspaceSurface?.kind === "workspace-view"
          && workspaceSurface.viewId === HABITOS_WORKSPACE_VIEW_ID
        );
      },
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default habitosRendererPlugin;
