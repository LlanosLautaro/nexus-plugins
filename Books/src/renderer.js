import BooksDocumentEngine from "./BooksDocumentEngine.jsx";
import BooksLibraryView from "./BooksLibraryView.jsx";
import BooksSettingsSection from "./BooksSettingsSection.jsx";
import { BookIcon } from "./icons.jsx";
import {
  BOOKS_ENGINE_ID,
  BOOKS_LIBRARY_VIEW_ID,
  isSupportedBookItem,
} from "./renderer-helpers.js";

let styleElement = null;

function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }

  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = "nexus.books";
  document.head.appendChild(styleElement);
}

function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}

const booksRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();

    ctx.registerView({
      id: BOOKS_LIBRARY_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Books",
      icon: BookIcon,
      tone: "document",
      component: (props) => <BooksLibraryView {...props} ctx={ctx} />,
    });

    ctx.registerSideToolbarButton({
      id: "nexus.books.library-button",
      pluginId: ctx.pluginId,
      order: 250,
      icon: BookIcon,
      tone: "document",
      label: "Books",
      onClick: () => {
        void ctx.openView({
          viewId: BOOKS_LIBRARY_VIEW_ID,
          reuse: true,
          sourceId: "nexus.books.toolbar",
        });
      },
      isActive: ({ getState }) => {
        const state = getState();
        const tabs = state.data.tabs || [];
        const activeTab = tabs.find((tab) => tab.id === state.data.activeTabId);
        return activeTab?.kind === "view" && activeTab.viewId === BOOKS_LIBRARY_VIEW_ID;
      },
    });

    ctx.registerItemEngine({
      pluginId: ctx.pluginId,
      id: BOOKS_ENGINE_ID,
      displayName: "Books",
      extensions: ["pdf"],
      mimeTypes: ["application/pdf"],
      priority: 330,
      supportsGlobalMatch: false,
      supportsFolderAssignments: true,
      matches: (item) => isSupportedBookItem(item),
      component: (props) => <BooksDocumentEngine {...props} hostApi={props.hostApi || ctx} />,
    });

    ctx.registerSettingsSection({
      id: "nexus.books.folder-assignments",
      pluginId: ctx.pluginId,
      title: "Carpetas Books",
      description:
        "Elige que carpetas del vault quedan reclamadas por el engine PDF-first de Books.",
      component: () => <BooksSettingsSection ctx={ctx} />,
    });
  },

  deactivate() {
    disposeStylesheet();
  },
};

export default booksRendererPlugin;
