import ChatView from "./ChatView.jsx";
import { CHAT_PLUGIN_ID, CHAT_VIEW_ID } from "./constants.js";
import { ChatIcon } from "./icons.jsx";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = CHAT_PLUGIN_ID;
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const chatRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: CHAT_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Chat",
      icon: ChatIcon,
      tone: "code",
      component: (props) => <ChatView {...props} ctx={ctx} />,
    });

    ctx.registerSideToolbarButton({
      id: "nexus.chat.panel-button",
      pluginId: ctx.pluginId,
      order: 270,
      icon: ChatIcon,
      tone: "code",
      label: "Chat",
      onClick: () => {
        void ctx.openView({
          viewId: CHAT_VIEW_ID,
          reuse: true,
          sourceId: "nexus.chat.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const state = getState();
        const tabs = state.data.tabs || [];
        const activeTab = tabs.find((tab) => tab.id === state.data.activeTabId);
        return activeTab?.kind === "view" && activeTab.viewId === CHAT_VIEW_ID;
      },
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default chatRendererPlugin;
