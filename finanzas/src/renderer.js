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
  activate() {},
  deactivate() {},
};

export default finanzasRendererPlugin;
