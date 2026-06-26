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
  activate() {},
  deactivate() {},
};

export default trainingRendererPlugin;
