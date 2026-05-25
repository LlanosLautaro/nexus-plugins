import PersonalFinanceView from "./PersonalFinanceView.jsx";
import { FINANCE_DASHBOARD_VIEW_ID, FINANCE_PLUGIN_ID } from "./constants.js";
import { WalletIcon } from "./icons.jsx";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = FINANCE_PLUGIN_ID;
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const finanzasRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: FINANCE_DASHBOARD_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Finanzas",
      icon: WalletIcon,
      tone: "data",
      surface: "workspace",
      component: (props) => <PersonalFinanceView {...props} ctx={ctx} />,
    });

    ctx.registerSideToolbarButton({
      id: "nexus.finanzas.dashboard-button",
      pluginId: ctx.pluginId,
      order: 260,
      icon: WalletIcon,
      tone: "data",
      label: "Finanzas",
      onClick: () => {
        void ctx.openView({
          viewId: FINANCE_DASHBOARD_VIEW_ID,
          reuse: true,
          sourceId: "nexus.finanzas.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return (
          workspaceSurface?.kind === "workspace-view"
          && workspaceSurface.viewId === FINANCE_DASHBOARD_VIEW_ID
        );
      },
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default finanzasRendererPlugin;
