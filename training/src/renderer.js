import TrainingView from "./TrainingView.jsx";
import { TrainingIcon } from "./icons.jsx";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = "nexus.training";
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const trainingRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: "nexus.training.workspace",
      pluginId: ctx.pluginId,
      title: "Entrenamientos",
      icon: TrainingIcon,
      tone: "document",
      surface: "workspace",
      component: (props) => <TrainingView {...props} ctx={ctx} />,
    });

    ctx.registerSideToolbarButton({
      id: "nexus.training.workspace-button",
      pluginId: ctx.pluginId,
      order: 260,
      icon: TrainingIcon,
      tone: "document",
      label: "Entrenamientos",
      onClick: () => {
        void ctx.openView({
          viewId: "nexus.training.workspace",
          reuse: true,
          sourceId: "nexus.training.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return (
          workspaceSurface?.kind === "workspace-view"
          && workspaceSurface.viewId === "nexus.training.workspace"
        );
      },
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default trainingRendererPlugin;
