const React = window.React;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:process>
var init_define_process = __esm({
  "<define:process>"() {
  }
});

// scripts/shims/react.cjs
var require_react = __commonJS({
  "scripts/shims/react.cjs"(exports, module) {
    init_define_process();
    function requireReact() {
      const hostReact = globalThis?.window?.__NEXUS_HOST_REACT__ || globalThis?.window?.React;
      if (!hostReact) {
        throw new Error("Nexus plugins renderer no encontro el React del host en window.__NEXUS_HOST_REACT__.");
      }
      return hostReact;
    }
    module.exports = requireReact();
  }
});

// scripts/shims/react-dom.cjs
var require_react_dom = __commonJS({
  "scripts/shims/react-dom.cjs"(exports, module) {
    init_define_process();
    function requireReactDom() {
      const hostReactDom = globalThis?.window?.__NEXUS_HOST_REACT_DOM__;
      if (!hostReactDom) {
        throw new Error("Nexus plugins renderer no encontro react-dom del host en window.__NEXUS_HOST_REACT_DOM__.");
      }
      return hostReactDom;
    }
    module.exports = requireReactDom();
  }
});

// tab-repository/src/renderer.js
init_define_process();

// tab-repository/src/TabRepositoryView.jsx
init_define_process();

// packages/nexus-ui/src/index.js
init_define_process();

// packages/nexus-ui/src/components/Button/Button.jsx
init_define_process();

// packages/nexus-ui/src/utils/cx.js
init_define_process();
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// packages/nexus-ui/src/components/Button/Button.jsx
function Button({
  className = "",
  tone = "secondary",
  children,
  ...props
}) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...props,
      className: cx(
        "nexus-ui-button",
        tone !== "secondary" && `nexus-ui-button--${tone}`,
        className
      )
    },
    children
  );
}

// packages/nexus-ui/src/components/CyberIconButton/CyberIconButton.jsx
init_define_process();
var import_react = __toESM(require_react(), 1);

// packages/nexus-ui/src/components/Tooltip/Tooltip.jsx
init_define_process();
function Tooltip({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("span", { className: cx("nexus-ui-tooltip", className) }, children);
}

// packages/nexus-ui/src/components/CyberIconButton/CyberIconButton.jsx
function CyberIconButton({
  active = false,
  className = "",
  children,
  label,
  title,
  tone = "neutral",
  ref,
  onClick,
  onPointerLeave,
  ...props
}) {
  const [tooltipDismissed, setTooltipDismissed] = (0, import_react.useState)(false);
  const accessibleLabel = props["aria-label"] || label || title;
  const tooltipLabel = label || title;
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...props,
      ref,
      type: props.type || "button",
      className: cx(
        "nexus-ui-cyber-icon-button",
        active && "is-active",
        tone !== "neutral" && `nexus-ui-cyber-icon-button--${tone}`,
        tooltipDismissed && "is-tooltip-dismissed",
        className
      ),
      "aria-label": accessibleLabel,
      onClick: (event) => {
        setTooltipDismissed(true);
        onClick?.(event);
      },
      onPointerLeave: (event) => {
        setTooltipDismissed(false);
        onPointerLeave?.(event);
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-cyber-icon-button__icon" }, children),
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-cyber-icon-button__glare", "aria-hidden": "true" }),
    tooltipLabel ? /* @__PURE__ */ React.createElement(Tooltip, null, tooltipLabel) : null
  );
}

// packages/nexus-ui/src/components/ActionMenu/ActionMenu.jsx
init_define_process();
var import_react2 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);
var VIEWPORT_MARGIN = 8;
function ActionMenu({
  align = "end",
  anchorRef,
  ariaLabel,
  className = "",
  groups = [],
  onAction,
  onClose,
  x,
  y
}) {
  const menuRef = (0, import_react2.useRef)(null);
  const [position, setPosition] = (0, import_react2.useState)({
    ready: false,
    submenusLeft: false,
    x: x ?? 0,
    y: y ?? 0
  });
  (0, import_react2.useEffect)(() => {
    const handlePointerDown = (event) => {
      const clickedAnchor = anchorRef?.current?.contains?.(event.target);
      if (!menuRef.current?.contains(event.target) && !clickedAnchor) {
        onClose?.();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    const closeOnViewportChange = () => onClose?.();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [anchorRef, onClose]);
  (0, import_react2.useLayoutEffect)(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const menuRect = menu.getBoundingClientRect();
    const anchorRect = anchorRef?.current?.getBoundingClientRect();
    const requestedX = Number.isFinite(x) ? x : align === "start" ? anchorRect?.left ?? VIEWPORT_MARGIN : (anchorRect?.right ?? VIEWPORT_MARGIN) - menuRect.width;
    const requestedY = Number.isFinite(y) ? y : (anchorRect?.bottom ?? VIEWPORT_MARGIN) + 7;
    setPosition({
      ready: true,
      submenusLeft: requestedX + menuRect.width + 224 > window.innerWidth,
      x: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedX, window.innerWidth - menuRect.width - VIEWPORT_MARGIN)
      ),
      y: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedY, window.innerHeight - menuRect.height - VIEWPORT_MARGIN)
      )
    });
  }, [align, anchorRef, groups, x, y]);
  const renderActions = (actions, depth = 0) => actions.map((action) => {
    const children = Array.isArray(action.children) ? action.children : [];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cx(
          "nexus-ui-action-menu__item",
          children.length && "has-children"
        ),
        key: action.id
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          "aria-checked": action.checked,
          "aria-haspopup": children.length ? "menu" : void 0,
          className: cx(
            action.danger && "is-danger",
            action.checked && "is-selected"
          ),
          disabled: action.disabled,
          role: action.role || "menuitem",
          type: "button",
          onClick: () => {
            if (children.length) return;
            onAction?.(action);
            action.onClick?.();
            if (!action.keepOpen) onClose?.();
          }
        },
        action.icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-action-menu__icon" }, action.icon) : null,
        /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-action-menu__copy" }, /* @__PURE__ */ React.createElement("strong", null, action.label), action.description ? /* @__PURE__ */ React.createElement("small", null, action.description) : null),
        /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-action-menu__end" }, children.length ? "\u203A" : action.end)
      ),
      children.length ? /* @__PURE__ */ React.createElement(
        "div",
        {
          "aria-label": action.label,
          className: "nexus-ui-action-menu nexus-ui-action-menu__submenu",
          role: "menu",
          style: { "--submenu-depth": depth + 1 }
        },
        renderActions(children, depth + 1)
      ) : null
    );
  });
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ React.createElement(
      "div",
      {
        "aria-label": ariaLabel,
        className: cx(
          "nexus-ui-action-menu",
          position.submenusLeft && "has-submenus-left",
          className
        ),
        ref: menuRef,
        role: "menu",
        style: {
          left: `${position.x}px`,
          top: `${position.y}px`,
          visibility: position.ready ? "visible" : "hidden"
        }
      },
      groups.map((group, groupIndex) => /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-action-menu__group", key: group.id || groupIndex }, renderActions(group.items || [])))
    ),
    document.body
  );
}

// packages/nexus-ui/src/components/Input/Input.jsx
init_define_process();
var import_react3 = __toESM(require_react(), 1);
var Input = (0, import_react3.forwardRef)(function Input2({ className = "", type = "text", ...props }, ref) {
  return /* @__PURE__ */ React.createElement(
    "input",
    {
      ...props,
      ref,
      className: cx("nexus-ui-input", className),
      type
    }
  );
});

// packages/nexus-ui/src/components/TextArea/TextArea.jsx
init_define_process();
var import_react4 = __toESM(require_react(), 1);
var TextArea = (0, import_react4.forwardRef)(function TextArea2({ className = "", ...props }, ref) {
  return /* @__PURE__ */ React.createElement(
    "textarea",
    {
      ...props,
      ref,
      className: cx("nexus-ui-textarea", className)
    }
  );
});

// packages/nexus-ui/src/components/Checkbox/Checkbox.jsx
init_define_process();
function Checkbox({
  className = "",
  description = "",
  label,
  ...props
}) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-checkbox", className) }, /* @__PURE__ */ React.createElement("input", { ...props, className: "nexus-ui-checkbox__input", type: "checkbox" }), /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-checkbox__box", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 12 10" }, /* @__PURE__ */ React.createElement("path", { d: "M1 5.1 4.2 8 11 1" }))), label || description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-checkbox__copy" }, label ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-checkbox__label" }, label) : null, description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-checkbox__description" }, description) : null) : null);
}

// packages/nexus-ui/src/components/SearchField/SearchField.jsx
init_define_process();
var import_react5 = __toESM(require_react(), 1);
function DefaultSearchIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), /* @__PURE__ */ React.createElement("path", { d: "m15.5 15.5 4 4" }));
}
var SearchField = (0, import_react5.forwardRef)(function SearchField2({
  className = "",
  endAction = null,
  icon,
  inputClassName = "",
  ...props
}, ref) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-search-field", className) }, icon !== null ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-search-field__icon" }, icon === void 0 ? /* @__PURE__ */ React.createElement(DefaultSearchIcon, null) : icon) : null, /* @__PURE__ */ React.createElement(
    "input",
    {
      ...props,
      ref,
      className: cx("nexus-ui-search-field__input", inputClassName),
      type: "search"
    }
  ), endAction ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-search-field__action" }, endAction) : null);
});

// packages/nexus-ui/src/components/LoadingIndicator/LoadingIndicator.jsx
init_define_process();
function LoadingIndicator({
  className = "",
  label = "Cargando",
  ...props
}) {
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      ...props,
      className: cx("nexus-ui-loading", className),
      role: "status",
      "aria-label": label
    },
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-loading__cell" }),
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-loading__cell" }),
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-loading__cell" }),
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-loading__cell" })
  );
}

// packages/nexus-ui/src/legacy/States.jsx
init_define_process();
function Notice({ className = "", tone = "info", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-notice", `nexus-ui-notice--${tone}`, className) }, children);
}
function StateBlock({
  className = "",
  tone = "default",
  eyebrow = "",
  title = "",
  description = "",
  centered = false,
  children = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx(
    "nexus-ui-state",
    tone !== "default" && `nexus-ui-state--${tone}`,
    centered && "nexus-ui-state--centered",
    className
  ) }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null, children);
}

// packages/nexus-ui/src/legacy/Workspace.jsx
init_define_process();
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceTopbar({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-topbar", className) }, children);
}
function WorkspaceTitle({ className = "", eyebrow = "", title = "", description = "", aside = null }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-title", className) }, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-title__copy" }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null), aside ? /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-title__aside" }, aside) : null);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}

// tab-repository/src/settings.js
init_define_process();
var TAB_REPOSITORY_PLUGIN_ID = "nexus.tab-repository";
var TAB_REPOSITORY_VIEW_ID = "nexus.tab-repository.workspace";
var MIN_SIDEBAR_WIDTH = 180;
var MAX_SIDEBAR_WIDTH = 440;
var DEFAULT_SETTINGS = Object.freeze({
  batchSize: 20,
  showTitle: true,
  showUrl: true,
  sidebarWidth: 236
});
function normalizeSidebarWidth(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, Math.round(parsed))) : DEFAULT_SETTINGS.sidebarWidth;
}
function normalizeSettings(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const parsedBatchSize = Number(source.batchSize);
  const batchSize = Number.isFinite(parsedBatchSize) ? Math.max(1, Math.min(100, Math.trunc(parsedBatchSize))) : DEFAULT_SETTINGS.batchSize;
  let showTitle = source.showTitle !== false;
  let showUrl = source.showUrl !== false;
  if (!showTitle && !showUrl) showUrl = true;
  return {
    batchSize,
    showTitle,
    showUrl,
    sidebarWidth: normalizeSidebarWidth(source.sidebarWidth)
  };
}

// tab-repository/src/icons.jsx
init_define_process();
function RepositoryIcon({ className = "" }) {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", className, fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { d: "M5 5.5h14v4H5zM5 10.5h14v4H5zM5 15.5h14v3H5z" }), /* @__PURE__ */ React.createElement("path", { d: "M8 7.5h8M8 12.5h8M8 17h5" }));
}
function GlobeIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "8" }), /* @__PURE__ */ React.createElement("path", { d: "M4.5 12h15M12 4c2.1 2.2 3.2 4.9 3.2 8S14.1 17.8 12 20M12 4C9.9 6.2 8.8 8.9 8.8 12S9.9 17.8 12 20" }));
}
function MoreIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "5", cy: "12", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "19", cy: "12", r: "1.5" }));
}
function DragIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "7", r: "1.25" }), /* @__PURE__ */ React.createElement("circle", { cx: "16", cy: "7", r: "1.25" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "12", r: "1.25" }), /* @__PURE__ */ React.createElement("circle", { cx: "16", cy: "12", r: "1.25" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "17", r: "1.25" }), /* @__PURE__ */ React.createElement("circle", { cx: "16", cy: "17", r: "1.25" }));
}
function TrashIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { d: "M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12M10 10v6M14 10v6" }));
}
function FolderIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { d: "M4 6.5h6l2 2h8v9H4z" }));
}

// tab-repository/src/ui-helpers.mjs
init_define_process();
function filterTabs(tabs, query) {
  const normalized = String(query || "").trim().toLocaleLowerCase("es");
  if (!normalized) return tabs;
  return tabs.filter((tab) => [tab.title, tab.url, tab.domain].filter(Boolean).some((value) => String(value).toLocaleLowerCase("es").includes(normalized)));
}
function getVirtualRange({ itemCount, rowHeight, scrollTop, viewportHeight, overscan = 8 }) {
  return {
    start: Math.max(0, Math.floor(scrollTop / rowHeight) - overscan),
    end: Math.min(itemCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan)
  };
}
function reorderBefore(sourceOrder, movingIds, targetId) {
  const moving = new Set(movingIds);
  const next = sourceOrder.filter((id) => !moving.has(id));
  const targetIndex = next.indexOf(targetId);
  next.splice(targetIndex < 0 ? next.length : targetIndex, 0, ...sourceOrder.filter((id) => moving.has(id)));
  return next;
}
function resolveTabIconUrl(tab) {
  const preferred = typeof tab?.faviconUrl === "string" ? tab.faviconUrl.trim() : "";
  if (preferred) return preferred;
  try {
    const parsed = new URL(tab?.url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return new URL("/favicon.ico", parsed.origin).href;
  } catch {
    return null;
  }
}
function shouldSendTabOnDoubleClick(target, { disabled = false, trashed = false } = {}) {
  if (disabled || trashed) return false;
  if (!target || typeof target.closest !== "function") return true;
  return !target.closest("button, input, label, a, textarea, select, [role='button'], [role='menuitem'], .tabRepositoryRow__drag");
}

// tab-repository/src/ipc-client.js
init_define_process();
var runtimeIpc = null;
function configurePluginIpc(ipc) {
  runtimeIpc = ipc;
}
function toOperation(channel) {
  return String(channel || "").replace(/^tab-repository:/, "").replace(/:/g, ".");
}
var pluginIpc = Object.freeze({
  invoke(channel, ...args) {
    if (!runtimeIpc) throw new Error("PLUGIN_IPC_NOT_READY");
    return runtimeIpc.invoke(toOperation(channel), ...args);
  }
});

// tab-repository/src/TabRepositoryView.jsx
var {
  useEffect: useEffect2,
  useLayoutEffect: useLayoutEffect2,
  useMemo,
  useRef: useRef2,
  useState: useState3
} = window.React;
var ipcRenderer = pluginIpc;
var TAB_DRAG_TYPE = "nexus.tab-repository.tab";
var GROUP_DRAG_TYPE = "nexus.tab-repository.group";
async function invoke(channel, payload = {}) {
  const response = await ipcRenderer.invoke(channel, payload);
  if (!response?.ok) {
    const error = new Error(response?.error?.message || "La operaci\xF3n no pudo completarse.");
    error.code = response?.error?.code || "tab_repository_error";
    error.details = response?.error?.details;
    throw error;
  }
  return response.data;
}
function Modal({ title, description = "", children, actions, onClose }) {
  useEffect2(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryModal", role: "presentation", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose?.();
  } }, /* @__PURE__ */ React.createElement("section", { "aria-modal": "true", className: "tabRepositoryModal__surface", role: "dialog" }, /* @__PURE__ */ React.createElement("header", { className: "tabRepositoryModal__header" }, /* @__PURE__ */ React.createElement("strong", null, title), description ? /* @__PURE__ */ React.createElement("p", null, description) : null), /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryModal__body" }, children), /* @__PURE__ */ React.createElement("footer", { className: "tabRepositoryModal__actions" }, actions)));
}
function useVirtualRows(items, rowHeight) {
  const viewportRef = useRef2(null);
  const [metrics, setMetrics] = useState3({ scrollTop: 0, height: 480 });
  useLayoutEffect2(() => {
    const viewport = viewportRef.current;
    if (!viewport) return void 0;
    const update = () => setMetrics({ scrollTop: viewport.scrollTop, height: viewport.clientHeight || 480 });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(viewport);
    viewport.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer?.disconnect();
      viewport.removeEventListener("scroll", update);
    };
  }, []);
  const { start, end } = getVirtualRange({
    itemCount: items.length,
    rowHeight,
    scrollTop: metrics.scrollTop,
    viewportHeight: metrics.height
  });
  return {
    viewportRef,
    totalHeight: items.length * rowHeight,
    visible: items.slice(start, end).map((item, offset) => ({ item, index: start + offset }))
  };
}
function SiteIcon({ tab, fallback = "globe" }) {
  const iconUrl = resolveTabIconUrl(tab);
  const [failed, setFailed] = useState3(false);
  useEffect2(() => setFailed(false), [iconUrl]);
  return /* @__PURE__ */ React.createElement("span", { className: "tabRepositorySiteIcon", "aria-hidden": "true" }, iconUrl && !failed ? /* @__PURE__ */ React.createElement(
    "img",
    {
      alt: "",
      decoding: "async",
      draggable: "false",
      loading: "lazy",
      referrerPolicy: "no-referrer",
      src: iconUrl,
      onError: () => setFailed(true)
    }
  ) : fallback === "folder" ? /* @__PURE__ */ React.createElement(FolderIcon, null) : /* @__PURE__ */ React.createElement(GlobeIcon, null));
}
function SidebarResizeHandle({ width, onChange, onCommit }) {
  const dragState = useRef2(null);
  const widthRef = useRef2(width);
  widthRef.current = width;
  const finishResize = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    onCommit(widthRef.current);
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "aria-label": "Redimensionar barra lateral de grupos",
      "aria-orientation": "vertical",
      "aria-valuemax": MAX_SIDEBAR_WIDTH,
      "aria-valuemin": MIN_SIDEBAR_WIDTH,
      "aria-valuenow": width,
      className: "tabRepositorySidebarResizeHandle",
      role: "separator",
      tabIndex: 0,
      onKeyDown: (event) => {
        const delta = event.key === "ArrowLeft" ? -12 : event.key === "ArrowRight" ? 12 : 0;
        const next = event.key === "Home" ? MIN_SIDEBAR_WIDTH : event.key === "End" ? MAX_SIDEBAR_WIDTH : delta ? normalizeSidebarWidth(width + delta) : width;
        if (next === width) return;
        event.preventDefault();
        widthRef.current = next;
        onChange(next);
        onCommit(next);
      },
      onPointerCancel: finishResize,
      onPointerDown: (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragState.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      },
      onPointerMove: (event) => {
        const drag = dragState.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const nextWidth = normalizeSidebarWidth(drag.startWidth + event.clientX - drag.startX);
        widthRef.current = nextWidth;
        onChange(nextWidth);
      },
      onPointerUp: finishResize
    }
  );
}
function RowMenu({ tab, groups, trashed, onMove, onTrash, onRestore }) {
  const anchorRef = useRef2(null);
  const [open, setOpen] = useState3(false);
  const menuGroups = trashed ? [{
    id: "trash",
    items: [{ id: "restore", label: "Restaurar", onClick: onRestore }]
  }] : [{
    id: "move",
    items: [{
      id: "move",
      label: "Mover a grupo",
      children: [
        { id: "ungrouped", label: "Sin grupo", onClick: () => onMove(null) },
        ...groups.map((group) => ({
          id: group.id,
          label: group.name,
          onClick: () => onMove(group.id)
        }))
      ]
    }]
  }, {
    id: "danger",
    items: [{ id: "trash", label: "Mover a papelera", danger: true, onClick: onTrash }]
  }];
  return /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryRowMenu" }, /* @__PURE__ */ React.createElement(CyberIconButton, { label: "M\xE1s acciones", onClick: () => setOpen((value) => !value), ref: anchorRef }, /* @__PURE__ */ React.createElement(MoreIcon, null)), open ? /* @__PURE__ */ React.createElement(
    ActionMenu,
    {
      anchorRef,
      ariaLabel: `Acciones de ${tab.title || tab.url}`,
      groups: menuGroups,
      onClose: () => setOpen(false)
    }
  ) : null);
}
function TabRow({
  ctx,
  tab,
  groups,
  selected,
  selectedIds,
  showTitle,
  showUrl,
  trashed,
  canReorder,
  disabled,
  style,
  onSelect,
  onMove,
  onReorder,
  onSend,
  onTrash,
  onRestore
}) {
  const dnd = ctx.ReactDnd;
  const [{ isDragging }, dragRef] = dnd.useDrag(() => ({
    type: TAB_DRAG_TYPE,
    item: { tabIds: selected ? selectedIds : [tab.id] },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [selected, selectedIds, tab.id]);
  const [{ isOver }, dropRef] = dnd.useDrop(() => ({
    accept: TAB_DRAG_TYPE,
    canDrop: () => canReorder,
    drop: (item, monitor) => {
      if (!monitor.didDrop()) onReorder(item.tabIds, tab.id);
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) && monitor.canDrop() })
  }), [canReorder, onReorder, tab.id]);
  const setDropNode = (node) => dropRef(node);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: [
        "tabRepositoryRow",
        selected && "is-selected",
        isDragging && "is-dragging",
        isOver && "is-drop-target"
      ].filter(Boolean).join(" "),
      ref: setDropNode,
      style,
      onDoubleClick: (event) => {
        if (shouldSendTabOnDoubleClick(event.target, { disabled, trashed })) onSend(tab.id);
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "tabRepositoryRow__drag", ref: dragRef, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(DragIcon, null)),
    /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        "aria-label": `Seleccionar ${tab.title || tab.url}`,
        checked: selected,
        onChange: (event) => onSelect(tab.id, event.target.checked)
      }
    ),
    /* @__PURE__ */ React.createElement(SiteIcon, { tab }),
    /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryRow__identity" }, showTitle ? /* @__PURE__ */ React.createElement("strong", null, tab.title || tab.url) : null, showUrl ? /* @__PURE__ */ React.createElement("span", null, tab.url) : null),
    /* @__PURE__ */ React.createElement("span", { className: "tabRepositoryRow__domain" }, tab.domain),
    !trashed ? /* @__PURE__ */ React.createElement(CyberIconButton, { disabled, label: "Enviar a Brave", onClick: () => onSend(tab.id) }, /* @__PURE__ */ React.createElement(GlobeIcon, null)) : null,
    /* @__PURE__ */ React.createElement(
      RowMenu,
      {
        groups,
        onMove: (groupId) => onMove([tab.id], groupId),
        onRestore: () => onRestore([tab.id]),
        onTrash: () => onTrash([tab.id]),
        tab,
        trashed
      }
    )
  );
}
function GroupRow({ ctx, group, representativeTab, active, onSelect, onDropTabs, onReorder, onRename, onDelete }) {
  const dnd = ctx.ReactDnd;
  const anchorRef = useRef2(null);
  const [menuOpen, setMenuOpen] = useState3(false);
  const [{ isDragging }, dragRef] = dnd.useDrag(() => ({
    type: GROUP_DRAG_TYPE,
    item: { groupId: group.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [group.id]);
  const [{ isOver }, dropRef] = dnd.useDrop(() => ({
    accept: [TAB_DRAG_TYPE, GROUP_DRAG_TYPE],
    drop: (item) => {
      if (item.tabIds) onDropTabs(item.tabIds, group.id);
      if (item.groupId && item.groupId !== group.id) onReorder(item.groupId, group.id);
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) })
  }), [group.id, onDropTabs, onReorder]);
  const setRowRef = (node) => {
    dragRef(node);
    dropRef(node);
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: [
        "tabRepositorySidebar__group",
        active && "is-active",
        isDragging && "is-dragging",
        isOver && "is-drop-target"
      ].filter(Boolean).join(" "),
      ref: setRowRef
    },
    /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onSelect }, /* @__PURE__ */ React.createElement(SiteIcon, { fallback: "folder", tab: representativeTab }), /* @__PURE__ */ React.createElement("span", null, group.name), /* @__PURE__ */ React.createElement("small", null, group.count)),
    /* @__PURE__ */ React.createElement(CyberIconButton, { label: `Acciones de ${group.name}`, onClick: () => setMenuOpen((value) => !value), ref: anchorRef }, /* @__PURE__ */ React.createElement(MoreIcon, null)),
    menuOpen ? /* @__PURE__ */ React.createElement(
      ActionMenu,
      {
        anchorRef,
        ariaLabel: `Acciones de ${group.name}`,
        groups: [{ id: "group", items: [
          { id: "rename", label: "Renombrar", onClick: onRename },
          { id: "delete", label: "Eliminar grupo", description: "Las tabs pasar\xE1n a Sin grupo", danger: true, onClick: onDelete }
        ] }],
        onClose: () => setMenuOpen(false)
      }
    ) : null
  );
}
function SidebarDropButton({ ctx, className = "", active, children, onClick, onDropTabs }) {
  const [{ isOver }, dropRef] = ctx.ReactDnd.useDrop(() => ({
    accept: TAB_DRAG_TYPE,
    drop: (item) => onDropTabs(item.tabIds),
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) })
  }), [onDropTabs]);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      className: [className, active && "is-active", isOver && "is-drop-target"].filter(Boolean).join(" "),
      ref: dropRef,
      type: "button",
      onClick
    },
    children
  );
}
function JsonMenu({ onOpen, onCopy, onDownload }) {
  const anchorRef = useRef2(null);
  const [open, setOpen] = useState3(false);
  return /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryToolbar__menu" }, /* @__PURE__ */ React.createElement(Button, { ref: anchorRef, onClick: () => setOpen((value) => !value) }, "JSON"), open ? /* @__PURE__ */ React.createElement(
    ActionMenu,
    {
      anchorRef,
      ariaLabel: "Intercambio JSON",
      groups: [{ id: "json", items: [
        { id: "import", label: "Importar JSON", onClick: onOpen },
        { id: "copy", label: "Copiar todas las URLs", onClick: onCopy },
        { id: "download", label: "Descargar JSON", onClick: onDownload }
      ] }],
      onClose: () => setOpen(false)
    }
  ) : null);
}
function BulkMoveMenu({ groups, onMove }) {
  const anchorRef = useRef2(null);
  const [open, setOpen] = useState3(false);
  return /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryToolbar__menu" }, /* @__PURE__ */ React.createElement(Button, { ref: anchorRef, onClick: () => setOpen((value) => !value) }, "Mover"), open ? /* @__PURE__ */ React.createElement(
    ActionMenu,
    {
      anchorRef,
      ariaLabel: "Mover tabs seleccionadas",
      groups: [{ id: "destinations", items: [
        { id: "ungrouped", label: "Sin grupo", onClick: () => onMove(null) },
        ...groups.map((group) => ({ id: group.id, label: group.name, onClick: () => onMove(group.id) }))
      ] }],
      onClose: () => setOpen(false)
    }
  ) : null);
}
function TabRepositoryView({ ctx }) {
  const settings = normalizeSettings(ctx.settings.useValue?.() || DEFAULT_SETTINGS);
  const [sidebarWidth, setSidebarWidth] = useState3(settings.sidebarWidth);
  const [snapshot, setSnapshot] = useState3({ groups: [], tabs: [], trash: [], counts: {} });
  const [scope, setScope] = useState3("all");
  const [query, setQuery] = useState3("");
  const [selectedIds, setSelectedIds] = useState3([]);
  const [loading, setLoading] = useState3(true);
  const [busy, setBusy] = useState3("");
  const [notice, setNotice] = useState3(null);
  const [groupDialog, setGroupDialog] = useState3(null);
  const [confirmDialog, setConfirmDialog] = useState3(null);
  const [importPreview, setImportPreview] = useState3(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState3(false);
  const [jsonText, setJsonText] = useState3("");
  const fileInputRef = useRef2(null);
  useEffect2(() => setSidebarWidth(settings.sidebarWidth), [settings.sidebarWidth]);
  const loadSnapshot = async () => {
    const next = await invoke("tab-repository:get-snapshot");
    setSnapshot(next);
    return next;
  };
  useEffect2(() => {
    let cancelled = false;
    setLoading(true);
    loadSnapshot().catch((error) => !cancelled && setNotice({ tone: "danger", message: error.message, code: error.code })).finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);
  const sourceTabs = scope === "trash" ? snapshot.trash : scope === "all" ? snapshot.tabs : scope === "ungrouped" ? snapshot.tabs.filter((tab) => !tab.groupId) : snapshot.tabs.filter((tab) => tab.groupId === scope);
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visibleTabs = useMemo(() => filterTabs(sourceTabs, normalizedQuery), [normalizedQuery, sourceTabs]);
  const representativeTabs = useMemo(() => {
    const byGroup = /* @__PURE__ */ new Map();
    let all = null;
    let ungrouped = null;
    for (const tab of snapshot.tabs) {
      if (!all) all = tab;
      if (!tab.groupId && !ungrouped) ungrouped = tab;
      if (tab.groupId && !byGroup.has(tab.groupId)) byGroup.set(tab.groupId, tab);
    }
    return { all, ungrouped, byGroup };
  }, [snapshot.tabs]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const currentGroupId = scope === "ungrouped" ? null : snapshot.groups.some((group) => group.id === scope) ? scope : void 0;
  const canReorderTabs = currentGroupId !== void 0 && !normalizedQuery && scope !== "trash";
  const rowHeight = settings.showTitle && settings.showUrl ? 58 : 44;
  const virtual = useVirtualRows(visibleTabs, rowHeight);
  useEffect2(() => {
    const visible = new Set(sourceTabs.map((tab) => tab.id));
    setSelectedIds((current) => current.filter((id) => visible.has(id)));
  }, [scope, snapshot]);
  const runMutation = async (channel, payload, message = "") => {
    setBusy(channel);
    setNotice(null);
    try {
      const data = await invoke(channel, payload);
      const nextSnapshot = data?.snapshot || (data?.groups && data?.tabs ? data : null);
      if (nextSnapshot) setSnapshot(nextSnapshot);
      else await loadSnapshot();
      setSelectedIds([]);
      if (message) setNotice({ tone: "success", message });
      return data;
    } catch (error) {
      setNotice({ tone: "danger", message: error.message, code: error.code });
      throw error;
    } finally {
      setBusy("");
    }
  };
  const updateSettings = async (patch) => {
    await ctx.settings.set(normalizeSettings({ ...settings, ...patch }));
  };
  const openCoreSettings = () => void ctx.openView({
    viewId: "core.settings",
    reuse: true,
    sourceId: "nexus.tab-repository.browser-setup"
  });
  const requestBrowserLaunch = (label, retry) => {
    setConfirmDialog({
      title: "Brave est\xE1 desconectado",
      description: `${label} puede iniciar el perfil vinculado y esperar hasta 30 segundos.`,
      confirmLabel: "Iniciar Brave",
      action: retry
    });
  };
  const previewImport = async (launchIfNeeded = false) => {
    setBusy("browser-preview");
    setNotice(null);
    try {
      const preview = await invoke("tab-repository:browser-preview", { launchIfNeeded });
      if (!preview.eligibleCount) {
        setNotice({ tone: "info", message: "No hay tabs HTTP/HTTPS para importar." });
        return;
      }
      setImportPreview(preview);
    } catch (error) {
      if (error.code === "target_offline" && !launchIfNeeded) {
        requestBrowserLaunch("Importar desde Brave", () => previewImport(true));
      } else {
        setNotice({ tone: "danger", message: error.message, code: error.code });
      }
    } finally {
      setBusy("");
    }
  };
  const commitImport = async () => {
    const token = importPreview?.token;
    setImportPreview(null);
    if (!token) return;
    try {
      const result = await runMutation("tab-repository:browser-commit", { token });
      setNotice({
        tone: result.closeFailed ? "warning" : "success",
        message: result.closeFailed ? `${result.matched} tabs quedaron guardadas; ${result.closeFailed} no pudieron cerrarse en Brave.` : `${result.matched} tabs importadas y retiradas de Brave.`
      });
    } catch {
    }
  };
  const sendIds = async (ids, launchIfNeeded = false) => {
    if (!ids.length) return;
    try {
      const data = await runMutation("tab-repository:browser-send", { tabIds: ids, launchIfNeeded });
      const result = data.result;
      setNotice({
        tone: result.failed.length ? "warning" : "success",
        message: result.failed.length ? `${result.opened.length} abiertas; ${result.failed.length} permanecen en el repositorio.` : `${result.opened.length} ${result.opened.length === 1 ? "tab enviada" : "tabs enviadas"} a Brave.`
      });
    } catch (error) {
      if (error.code === "target_offline" && !launchIfNeeded) {
        requestBrowserLaunch("Enviar tabs", () => sendIds(ids, true));
      }
    }
  };
  const moveTabs = async (ids, groupId) => {
    try {
      await runMutation("tab-repository:tabs-move", { tabIds: ids, groupId });
    } catch {
    }
  };
  const reorderVisibleTabs = async (movingIds, targetId) => {
    if (!canReorderTabs) return;
    const next = reorderBefore(sourceTabs.map((tab) => tab.id), movingIds, targetId);
    try {
      await runMutation("tab-repository:tabs-reorder", { groupId: currentGroupId, tabIds: next });
    } catch {
    }
  };
  const reorderGroup = async (sourceId, targetId) => {
    const ids = snapshot.groups.map((group) => group.id).filter((id) => id !== sourceId);
    ids.splice(Math.max(0, ids.indexOf(targetId)), 0, sourceId);
    try {
      await runMutation("tab-repository:groups-reorder", { groupIds: ids });
    } catch {
    }
  };
  const saveGroup = async () => {
    const dialog = groupDialog;
    if (!dialog) return;
    setGroupDialog(null);
    try {
      await runMutation(
        dialog.groupId ? "tab-repository:group-rename" : "tab-repository:group-create",
        { groupId: dialog.groupId, name: dialog.name }
      );
    } catch {
    }
  };
  const importJsonText = async (text = jsonText) => {
    try {
      const data = await runMutation("tab-repository:json-import", { json: text });
      setJsonDialogOpen(false);
      setJsonText("");
      setNotice({
        tone: data.result.invalid ? "warning" : "success",
        message: `${data.result.imported} nuevas, ${data.result.restored} restauradas, ${data.result.duplicates} duplicadas y ${data.result.invalid} inv\xE1lidas.`
      });
    } catch {
    }
  };
  const getExport = async () => invoke("tab-repository:json-export");
  const copyExport = async () => {
    try {
      const data = await getExport();
      window.nexus.clipboard.writeText(JSON.stringify(data, null, 2));
      setNotice({ tone: "success", message: `${data.urls.length} URLs copiadas como JSON.` });
    } catch (error) {
      setNotice({ tone: "danger", message: error.message });
    }
  };
  const downloadExport = async () => {
    try {
      const data = await getExport();
      const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `tab-repository-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    } catch (error) {
      setNotice({ tone: "danger", message: error.message });
    }
  };
  const selectTab = (id, checked) => setSelectedIds((current) => checked ? [.../* @__PURE__ */ new Set([...current, id])] : current.filter((entry) => entry !== id));
  const selectedVisibleCount = visibleTabs.filter((tab) => selectedSet.has(tab.id)).length;
  const allVisibleSelected = visibleTabs.length > 0 && selectedVisibleCount === visibleTabs.length;
  if (loading) {
    return /* @__PURE__ */ React.createElement(WorkspacePage, { className: "tabRepository" }, /* @__PURE__ */ React.createElement(LoadingIndicator, { label: "Cargando repositorio" }));
  }
  return /* @__PURE__ */ React.createElement(WorkspacePage, { className: "tabRepository" }, /* @__PURE__ */ React.createElement(WorkspaceTopbar, { className: "tabRepositoryToolbar" }, /* @__PURE__ */ React.createElement(WorkspaceTitle, { title: "Tab Repository" }), /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryToolbar__actions" }, /* @__PURE__ */ React.createElement(Button, { tone: "primary", disabled: Boolean(busy), onClick: () => void previewImport(false) }, "Importar desde Brave"), /* @__PURE__ */ React.createElement(Button, { disabled: Boolean(busy), onClick: () => setGroupDialog({ name: "", groupId: null }) }, "Crear grupo"), /* @__PURE__ */ React.createElement(Button, { disabled: !snapshot.tabs.length || Boolean(busy), onClick: () => setConfirmDialog({
    title: "Reagrupar todo por dominio",
    description: "Se eliminar\xE1n los grupos manuales activos. La papelera no cambiar\xE1.",
    confirmLabel: "Reagrupar",
    action: async () => {
      setScope("all");
      await runMutation("tab-repository:regroup-domain", {});
    }
  }) }, "Reagrupar por dominio"), /* @__PURE__ */ React.createElement(JsonMenu, { onOpen: () => setJsonDialogOpen(true), onCopy: () => void copyExport(), onDownload: () => void downloadExport() }), /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryToolbar__batch" }, /* @__PURE__ */ React.createElement(
    Input,
    {
      "aria-label": "Cantidad de tabs por lote",
      max: "100",
      min: "1",
      type: "number",
      value: settings.batchSize,
      onChange: (event) => void updateSettings({ batchSize: event.target.value })
    }
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      disabled: scope === "trash" || !visibleTabs.length || Boolean(busy),
      onClick: () => void sendIds(visibleTabs.slice(0, settings.batchSize).map((tab) => tab.id))
    },
    "Enviar ",
    Math.min(settings.batchSize, visibleTabs.length)
  )))), notice ? /* @__PURE__ */ React.createElement("div", { className: "tabRepository__notice" }, /* @__PURE__ */ React.createElement(Notice, { tone: notice.tone }, notice.message), ["native_plugin_disabled", "permission_denied", "target_not_configured", "pairing_required"].includes(notice.code) ? /* @__PURE__ */ React.createElement(Button, { onClick: openCoreSettings }, "Abrir Settings") : null) : null, /* @__PURE__ */ React.createElement(
    WorkspaceBody,
    {
      className: "tabRepository__body",
      style: { "--tab-repository-sidebar-width": `${sidebarWidth}px` }
    },
    /* @__PURE__ */ React.createElement("aside", { className: "tabRepositorySidebar" }, /* @__PURE__ */ React.createElement("nav", { className: "tabRepositorySidebar__special", "aria-label": "Vistas del repositorio" }, /* @__PURE__ */ React.createElement("button", { className: scope === "all" ? "is-active" : "", type: "button", onClick: () => setScope("all") }, /* @__PURE__ */ React.createElement(SiteIcon, { tab: representativeTabs.all }), /* @__PURE__ */ React.createElement("span", null, "Todas"), /* @__PURE__ */ React.createElement("small", null, snapshot.counts.active || 0)), /* @__PURE__ */ React.createElement(
      SidebarDropButton,
      {
        active: scope === "ungrouped",
        ctx,
        onClick: () => setScope("ungrouped"),
        onDropTabs: (ids) => void moveTabs(ids, null)
      },
      /* @__PURE__ */ React.createElement(SiteIcon, { fallback: "folder", tab: representativeTabs.ungrouped }),
      /* @__PURE__ */ React.createElement("span", null, "Sin grupo"),
      /* @__PURE__ */ React.createElement("small", null, snapshot.counts.ungrouped || 0)
    )), /* @__PURE__ */ React.createElement("div", { className: "tabRepositorySidebar__groups" }, snapshot.groups.map((group) => /* @__PURE__ */ React.createElement(
      GroupRow,
      {
        active: scope === group.id,
        ctx,
        group,
        key: group.id,
        representativeTab: representativeTabs.byGroup.get(group.id),
        onDelete: () => setConfirmDialog({
          title: `Eliminar ${group.name}`,
          description: "Sus tabs pasar\xE1n a Sin grupo.",
          confirmLabel: "Eliminar grupo",
          action: async () => {
            if (scope === group.id) setScope("ungrouped");
            await runMutation("tab-repository:group-delete", { groupId: group.id });
          }
        }),
        onDropTabs: moveTabs,
        onRename: () => setGroupDialog({ groupId: group.id, name: group.name }),
        onReorder: reorderGroup,
        onSelect: () => setScope(group.id)
      }
    ))), /* @__PURE__ */ React.createElement(
      SidebarDropButton,
      {
        active: scope === "trash",
        className: "tabRepositorySidebar__trash",
        ctx,
        onClick: () => setScope("trash"),
        onDropTabs: (ids) => void runMutation("tab-repository:tabs-trash", { tabIds: ids })
      },
      /* @__PURE__ */ React.createElement(TrashIcon, null),
      /* @__PURE__ */ React.createElement("span", null, "Papelera"),
      /* @__PURE__ */ React.createElement("small", null, snapshot.counts.trash || 0)
    )),
    /* @__PURE__ */ React.createElement(
      SidebarResizeHandle,
      {
        width: sidebarWidth,
        onChange: setSidebarWidth,
        onCommit: (nextWidth) => void updateSettings({ sidebarWidth: nextWidth })
      }
    ),
    /* @__PURE__ */ React.createElement("main", { className: "tabRepositoryList" }, /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryList__controls" }, /* @__PURE__ */ React.createElement(SearchField, { value: query, placeholder: "Buscar por t\xEDtulo, URL o dominio", onChange: (event) => setQuery(event.target.value) }), /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        checked: allVisibleSelected,
        disabled: !visibleTabs.length,
        label: selectedVisibleCount ? `${selectedVisibleCount} seleccionadas` : "Seleccionar visibles",
        onChange: (event) => setSelectedIds(event.target.checked ? visibleTabs.map((tab) => tab.id) : [])
      }
    ), selectedIds.length ? scope === "trash" ? /* @__PURE__ */ React.createElement(Button, { onClick: () => void runMutation("tab-repository:tabs-restore", { tabIds: selectedIds }) }, "Restaurar") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(BulkMoveMenu, { groups: snapshot.groups, onMove: (groupId) => void moveTabs(selectedIds, groupId) }), /* @__PURE__ */ React.createElement(Button, { tone: "danger", onClick: () => void runMutation("tab-repository:tabs-trash", { tabIds: selectedIds }) }, "Papelera")) : null, scope === "trash" && snapshot.trash.length ? /* @__PURE__ */ React.createElement(Button, { tone: "danger", onClick: () => setConfirmDialog({
      title: "Vaciar papelera",
      description: `${snapshot.trash.length} tabs se eliminar\xE1n permanentemente.`,
      confirmLabel: "Vaciar papelera",
      action: async () => runMutation("tab-repository:trash-empty", {})
    }) }, "Vaciar papelera") : null), busy ? /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryList__busy" }, /* @__PURE__ */ React.createElement(LoadingIndicator, { label: "Procesando" })) : null, !visibleTabs.length ? /* @__PURE__ */ React.createElement(
      StateBlock,
      {
        centered: true,
        title: query ? "Sin coincidencias" : scope === "trash" ? "La papelera est\xE1 vac\xEDa" : "No hay tabs aqu\xED",
        description: query ? "Prueba con otra b\xFAsqueda." : scope === "all" ? "Importa tabs desde Brave o JSON." : ""
      }
    ) : /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryList__viewport", ref: virtual.viewportRef }, /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryList__virtual", style: { height: `${virtual.totalHeight}px` } }, virtual.visible.map(({ item: tab, index }) => /* @__PURE__ */ React.createElement(
      TabRow,
      {
        canReorder: canReorderTabs,
        ctx,
        disabled: Boolean(busy),
        groups: snapshot.groups,
        key: tab.id,
        onMove: moveTabs,
        onReorder: reorderVisibleTabs,
        onRestore: (ids) => void runMutation("tab-repository:tabs-restore", { tabIds: ids }),
        onSelect: selectTab,
        onSend: (id) => void sendIds([id]),
        onTrash: (ids) => void runMutation("tab-repository:tabs-trash", { tabIds: ids }),
        selected: selectedSet.has(tab.id),
        selectedIds,
        showTitle: settings.showTitle,
        showUrl: settings.showUrl,
        style: { height: `${rowHeight}px`, transform: `translateY(${index * rowHeight}px)` },
        tab,
        trashed: scope === "trash"
      }
    )))))
  ), groupDialog ? /* @__PURE__ */ React.createElement(
    Modal,
    {
      title: groupDialog.groupId ? "Renombrar grupo" : "Crear grupo",
      onClose: () => setGroupDialog(null),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: () => setGroupDialog(null) }, "Cancelar"), /* @__PURE__ */ React.createElement(Button, { tone: "primary", disabled: !groupDialog.name.trim(), onClick: () => void saveGroup() }, "Guardar"))
    },
    /* @__PURE__ */ React.createElement(
      Input,
      {
        autoFocus: true,
        maxLength: "120",
        placeholder: "Nombre del grupo",
        value: groupDialog.name,
        onChange: (event) => setGroupDialog((current) => ({ ...current, name: event.target.value })),
        onKeyDown: (event) => {
          if (event.key === "Enter" && groupDialog.name.trim()) void saveGroup();
        }
      }
    )
  ) : null, confirmDialog ? /* @__PURE__ */ React.createElement(
    Modal,
    {
      title: confirmDialog.title,
      description: confirmDialog.description,
      onClose: () => setConfirmDialog(null),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: () => setConfirmDialog(null) }, "Cancelar"), /* @__PURE__ */ React.createElement(Button, { tone: "primary", onClick: () => {
        const action = confirmDialog.action;
        setConfirmDialog(null);
        void action();
      } }, confirmDialog.confirmLabel))
    }
  ) : null, importPreview ? /* @__PURE__ */ React.createElement(
    Modal,
    {
      title: "Importar todas las tabs recuperables",
      description: "Nexus guardar\xE1 primero los items y despu\xE9s los cerrar\xE1 en Brave.",
      onClose: () => setImportPreview(null),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: () => setImportPreview(null) }, "Cancelar"), /* @__PURE__ */ React.createElement(Button, { tone: "primary", onClick: () => void commitImport() }, "Importar y cerrar"))
    },
    /* @__PURE__ */ React.createElement("div", { className: "tabRepositoryImportSummary" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, importPreview.eligibleCount), " tabs HTTP/HTTPS"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, importPreview.pinnedCount), " fijadas incluidas"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, importPreview.excludedCount), " p\xE1ginas internas excluidas"))
  ) : null, jsonDialogOpen ? /* @__PURE__ */ React.createElement(
    Modal,
    {
      title: "Importar URLs desde JSON",
      description: "Solo se leer\xE1n URLs HTTP/HTTPS; t\xEDtulos, grupos y otros campos se ignorar\xE1n.",
      onClose: () => setJsonDialogOpen(false),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: () => setJsonDialogOpen(false) }, "Cancelar"), /* @__PURE__ */ React.createElement(Button, { onClick: () => fileInputRef.current?.click() }, "Abrir archivo"), /* @__PURE__ */ React.createElement(Button, { onClick: async () => setJsonText(await window.nexus.clipboard.readText()) }, "Pegar"), /* @__PURE__ */ React.createElement(Button, { tone: "primary", disabled: !jsonText.trim(), onClick: () => void importJsonText() }, "Importar"))
    },
    /* @__PURE__ */ React.createElement(TextArea, { rows: 12, value: jsonText, onChange: (event) => setJsonText(event.target.value), placeholder: '["https://example.com"]' }),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        accept: "application/json,.json",
        className: "tabRepository__fileInput",
        ref: fileInputRef,
        type: "file",
        onChange: async (event) => {
          const file = event.target.files?.[0];
          if (file) setJsonText(await file.text());
          event.target.value = "";
        }
      }
    )
  ) : null);
}

// tab-repository/src/TabRepositorySettings.jsx
init_define_process();
function TabRepositorySettings({ ctx }) {
  const settings = normalizeSettings(ctx.settings.useValue?.() || DEFAULT_SETTINGS);
  const updateVisibility = async (field, checked) => {
    const next = normalizeSettings({ ...settings, [field]: checked });
    await ctx.settings.set(next);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "tabRepositorySettings" }, /* @__PURE__ */ React.createElement("div", { className: "tabRepositorySettings__row" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Contenido de cada fila"), /* @__PURE__ */ React.createElement("p", null, "La b\xFAsqueda siempre consulta t\xEDtulo y URL, aunque uno est\xE9 oculto.")), /* @__PURE__ */ React.createElement("div", { className: "tabRepositorySettings__checks" }, /* @__PURE__ */ React.createElement(
    Checkbox,
    {
      checked: settings.showTitle,
      disabled: settings.showTitle && !settings.showUrl,
      label: "Mostrar t\xEDtulo",
      onChange: (event) => void updateVisibility("showTitle", event.target.checked)
    }
  ), /* @__PURE__ */ React.createElement(
    Checkbox,
    {
      checked: settings.showUrl,
      disabled: settings.showUrl && !settings.showTitle,
      label: "Mostrar URL",
      onChange: (event) => void updateVisibility("showUrl", event.target.checked)
    }
  ))), /* @__PURE__ */ React.createElement(Notice, { tone: "info" }, "Al menos uno de los dos campos debe permanecer visible."));
}

// tab-repository/src/renderer.js
var styleElement = null;
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
var tabRepositoryRenderer = {
  activate(ctx) {
    configurePluginIpc(ctx.ipc);
    ensureStylesheet();
    ctx.registerView({
      id: TAB_REPOSITORY_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Tab Repository",
      icon: RepositoryIcon,
      tone: "code",
      surface: "workspace",
      component: (props) => /* @__PURE__ */ React.createElement(TabRepositoryView, { ...props, ctx })
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
        sourceId: "nexus.tab-repository.toolbar"
      }),
      isActive: ({ getState }) => {
        const surface = getState().data.workspaceSurface;
        return surface?.kind === "workspace-view" && surface.viewId === TAB_REPOSITORY_VIEW_ID;
      }
    });
    ctx.registerSettingsSection({
      id: "nexus.tab-repository.visibility",
      pluginId: ctx.pluginId,
      title: "Visualizaci\xF3n",
      component: () => /* @__PURE__ */ React.createElement(TabRepositorySettings, { ctx })
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = tabRepositoryRenderer;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
