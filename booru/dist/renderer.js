const React = window.React;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// scripts/plugins/shims/react.cjs
var require_react = __commonJS({
  "scripts/plugins/shims/react.cjs"(exports, module) {
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

// scripts/plugins/shims/react-dom.cjs
var require_react_dom = __commonJS({
  "scripts/plugins/shims/react-dom.cjs"(exports, module) {
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

// ../nexus-plugins/booru/src/renderer.js
init_define_process();

// ../nexus-plugins/booru/src/BooruWorkspaceView.jsx
init_define_process();

// ../nexus-plugins/booru/src/constants.js
init_define_process();
var BOORU_PLUGIN_ID = "nexus.booru";
var BOORU_WORKSPACE_VIEW_ID = "nexus.booru.workspace";
var BOORU_DEFAULT_SECTION = "media";
var BOORU_SECTION_OPTIONS = [
  { value: "media", label: "Media" },
  { value: "pending", label: "Pendientes" },
  { value: "authors", label: "Persona" },
  { value: "characters", label: "Characters" },
  { value: "artists", label: "Artists" },
  { value: "universes", label: "Universes" },
  { value: "settings", label: "Ajustes" }
];
var BOORU_CLASSIFICATION_LABELS = Object.freeze({
  "unclassified": "Sin clasificar",
  "classified-basic": "Clasificado basico",
  "duplicate-review": "Duplicado en revision"
});
var BOORU_MEDIA_KIND_LABELS = Object.freeze({
  image: "Image",
  video: "Video",
  gif: "GIF"
});
var BOORU_REALITY_OPTIONS = [
  { value: "undefined", label: "Sin definir" },
  { value: "real", label: "Real" },
  { value: "ficticio", label: "Ficticio" }
];
var BOORU_REALITY_LABELS = Object.freeze({
  real: "Real",
  ficticio: "Ficticio"
});
var BOORU_ENTITY_KIND_LABELS = Object.freeze({
  author: "Persona",
  artist: "Artist",
  character: "Character",
  universe: "Universe"
});

// ../nexus-frontend/src/utils/devLog.js
init_define_process();
var DEV_LOG_BATCH_CHANNEL = "dev-log:append-batch";
var ipcRenderer = window.nexus.ipc;
var rendererDevLoggingEnabled = window.location.protocol !== "file:";
var devLogRawConsole = {
  debug: console.debug.bind(console),
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};
var rendererDevLogState = {
  queue: Array.isArray(window.__NEXUS_DEV_LOG_BUFFER__) ? window.__NEXUS_DEV_LOG_BUFFER__ : [],
  flushTimer: null,
  consoleBridgeInstalled: false,
  ipcBridgeInstalled: false,
  initialized: false,
  verbose: window.localStorage?.getItem("NEXUS_DEV_LOG_VERBOSE") === "1"
};
window.__NEXUS_DEV_LOG_BUFFER__ = rendererDevLogState.queue;
window.__NEXUS_DEV_LOG_RUN_ID__ = window.__NEXUS_DEV_LOG_RUN_ID__ || (globalThis.crypto?.randomUUID?.() || `renderer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
function getRendererRunId() {
  return window.__NEXUS_DEV_LOG_RUN_ID__;
}
function shouldMirrorRendererConsole(level) {
  return level === "warn" || level === "error" || level === "fatal";
}
function resolveRendererScope(scope) {
  const normalizedScope = String(scope || "").trim() || "renderer.startup";
  if (normalizedScope.startsWith("renderer.startup")) {
    return {
      process: "renderer",
      surface: "startup",
      subsystem: normalizedScope,
      shard: "40-renderer-startup.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.store") || normalizedScope.startsWith("renderer.items")) {
    return {
      process: "renderer",
      surface: "store",
      subsystem: normalizedScope,
      shard: "41-renderer-store.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.explorer")) {
    return {
      process: "renderer",
      surface: "explorer",
      subsystem: normalizedScope,
      shard: "42-renderer-explorer.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.editors")) {
    return {
      process: "renderer",
      surface: "editors",
      subsystem: normalizedScope,
      shard: "43-renderer-editors.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.plugins")) {
    return {
      process: "renderer",
      surface: "plugins",
      subsystem: normalizedScope,
      shard: "44-renderer-plugins.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.ipc")) {
    return {
      process: "renderer",
      surface: "ipc",
      subsystem: normalizedScope,
      shard: "50-ipc.jsonl"
    };
  }
  return {
    process: "renderer",
    surface: "startup",
    subsystem: normalizedScope,
    shard: "40-renderer-startup.jsonl"
  };
}
function serializeUnknown(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack || null,
      cause: serializeUnknown(value.cause, seen)
    };
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((entry) => serializeUnknown(entry, seen));
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) {
      return "[circular]";
    }
    seen.add(value);
    const serialized = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeUnknown(entry, seen)])
    );
    seen.delete(value);
    return serialized;
  }
  return value ?? null;
}
function buildRendererEvent(partialEvent = {}) {
  return {
    ts: partialEvent.ts || (/* @__PURE__ */ new Date()).toISOString(),
    rendererRunId: partialEvent.rendererRunId || getRendererRunId(),
    process: "renderer",
    surface: partialEvent.surface || "startup",
    subsystem: partialEvent.subsystem || "renderer.startup",
    level: partialEvent.level || "info",
    event: partialEvent.event || "renderer.unspecified",
    message: partialEvent.message || "",
    durationMs: typeof partialEvent.durationMs === "number" ? Number(partialEvent.durationMs.toFixed(2)) : null,
    requestId: partialEvent.requestId || null,
    data: partialEvent.data ? serializeUnknown(partialEvent.data) : null,
    shard: partialEvent.shard || null
  };
}
function queueRendererDevLogEvent(partialEvent = {}) {
  if (!rendererDevLoggingEnabled) {
    return;
  }
  rendererDevLogState.queue.push(buildRendererEvent(partialEvent));
  if (shouldMirrorRendererConsole(partialEvent.level || "info")) {
    const rawMethod = partialEvent.level === "warn" ? devLogRawConsole.warn : devLogRawConsole.error;
    rawMethod(partialEvent.message || partialEvent.event || "", partialEvent.data || "");
  }
  scheduleRendererDevLogFlush();
}
function scheduleRendererDevLogFlush() {
  if (rendererDevLogState.flushTimer) {
    return;
  }
  rendererDevLogState.flushTimer = window.setTimeout(() => {
    rendererDevLogState.flushTimer = null;
    flushRendererDevLogBuffer();
  }, 80);
}
function flushRendererDevLogBuffer() {
  if (!rendererDevLoggingEnabled) {
    rendererDevLogState.queue.length = 0;
    return;
  }
  if (!rendererDevLogState.queue.length) {
    return;
  }
  const events = rendererDevLogState.queue.splice(0, rendererDevLogState.queue.length);
  try {
    ipcRenderer.send(DEV_LOG_BATCH_CHANNEL, {
      events
    });
  } catch (error) {
    rendererDevLogState.queue.unshift(...events);
    devLogRawConsole.error("[dev-log] No se pudo flush-ear el batch del renderer.", error);
  }
}
function createRendererDevLogger(scope) {
  const context = resolveRendererScope(scope);
  return {
    context,
    debug(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "debug", event, message, data });
    },
    info(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "info", event, message, data });
    },
    warn(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "warn", event, message, data });
    },
    error(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "error", event, message, data });
    }
  };
}

// ../nexus-plugins/booru/src/icons.jsx
init_define_process();
function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    children
  );
}
function BooruIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("rect", { x: "4.5", y: "5", width: "15", height: "14", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "m8 14 2.7-2.7a1.3 1.3 0 0 1 1.8 0L16 14.8" }), /* @__PURE__ */ React.createElement("path", { d: "m13 11.5 1.2-1.2a1.3 1.3 0 0 1 1.8 0l2 2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "9.2", r: "1.1" }));
}
function FolderIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4.75 7.25h4l1.8 1.9h8.7A1.75 1.75 0 0 1 21 10.9v6.35A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V9A1.75 1.75 0 0 1 4.75 7.25Z" }));
}
function DownloadIcon(props) {
  return /* @__PURE__ */ React.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 3.8v10.1" }), /* @__PURE__ */ React.createElement("path", { d: "m8.4 10.6 3.6 3.7 3.6-3.7" }), /* @__PURE__ */ React.createElement("path", { d: "M5 18.4v1.1A1.7 1.7 0 0 0 6.7 21h10.6a1.7 1.7 0 0 0 1.7-1.5v-1.1" }));
}

// ../packages/nexus-ui/src/index.js
init_define_process();

// ../packages/nexus-ui/src/components/Button/Button.jsx
init_define_process();

// ../packages/nexus-ui/src/utils/cx.js
init_define_process();
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// ../packages/nexus-ui/src/components/Button/Button.jsx
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

// ../packages/nexus-ui/src/components/SegmentedControl/SegmentedControl.jsx
init_define_process();
function readOptionValue(option) {
  return option?.value ?? option?.id;
}
function SegmentedControl({
  ariaLabel = "Selector",
  className = "",
  flush = false,
  iconOnly = false,
  onChange,
  options = [],
  orientation = "horizontal",
  renderIcon,
  value,
  variant = "default"
}) {
  const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  const activeIndex = Math.max(
    0,
    normalizedOptions.findIndex((option) => readOptionValue(option) === value)
  );
  const isCyber = variant === "cyber" || iconOnly;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "aria-label": ariaLabel,
      className: cx(
        "nexus-ui-segmented",
        `nexus-ui-segmented--${orientation}`,
        variant !== "default" && `nexus-ui-segmented--${variant}`,
        isCyber && "nexus-ui-segmented--icon-only",
        flush && "nexus-ui-segmented--flush",
        normalizedOptions.length && "has-active",
        className
      ),
      role: "radiogroup",
      style: {
        "--segment-count": Math.max(1, normalizedOptions.length),
        "--active-index": activeIndex
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__highlight", "aria-hidden": "true" }),
    normalizedOptions.map((option) => {
      const optionValue = readOptionValue(option);
      const active = optionValue === value;
      const disabled = Boolean(option.disabled);
      const icon = renderIcon?.(option) ?? option.icon ?? null;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          "aria-checked": active,
          "aria-label": iconOnly ? option.label : void 0,
          className: cx(
            "nexus-ui-segmented__button",
            active && "is-active",
            disabled && "is-disabled"
          ),
          disabled,
          key: optionValue,
          role: "radio",
          type: "button",
          onClick: () => {
            if (!disabled) {
              onChange?.(optionValue);
            }
          }
        },
        icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__icon" }, icon) : null,
        isCyber ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__glare", "aria-hidden": "true" }) : null,
        !iconOnly ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__label" }, option.label) : null,
        iconOnly ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-tooltip" }, option.label) : null
      );
    })
  );
}

// ../packages/nexus-ui/src/components/ActionMenu/ActionMenu.jsx
init_define_process();
var import_react = __toESM(require_react(), 1);
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
  const menuRef = (0, import_react.useRef)(null);
  const [position, setPosition] = (0, import_react.useState)({
    ready: false,
    submenusLeft: false,
    x: x ?? 0,
    y: y ?? 0
  });
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useLayoutEffect)(() => {
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

// ../packages/nexus-ui/src/components/Input/Input.jsx
init_define_process();
var import_react2 = __toESM(require_react(), 1);
var Input = (0, import_react2.forwardRef)(function Input2({ className = "", type = "text", ...props }, ref) {
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

// ../packages/nexus-ui/src/components/Select/Select.jsx
init_define_process();
var import_react3 = __toESM(require_react(), 1);
var Select = (0, import_react3.forwardRef)(function Select2({ className = "", children, ...props }, ref) {
  return /* @__PURE__ */ React.createElement(
    "select",
    {
      ...props,
      ref,
      className: cx("nexus-ui-select", className)
    },
    children
  );
});

// ../packages/nexus-ui/src/components/SearchField/SearchField.jsx
init_define_process();
var import_react4 = __toESM(require_react(), 1);
function DefaultSearchIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), /* @__PURE__ */ React.createElement("path", { d: "m15.5 15.5 4 4" }));
}
var SearchField = (0, import_react4.forwardRef)(function SearchField2({
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

// ../packages/nexus-ui/src/components/Gallery/Gallery.jsx
init_define_process();
var import_react5 = __toESM(require_react(), 1);
function normalizeColumnCount(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : fallback;
}
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && typeof ref === "object") {
    ref.current = value;
  }
}
var GalleryGrid = (0, import_react5.forwardRef)(function GalleryGrid2({
  as: Component = "div",
  className = "",
  compact = false,
  virtual = false,
  columns,
  defaultColumns,
  minColumns = 1,
  maxColumns = 12,
  adjustableColumns = true,
  onColumnsChange,
  style,
  children,
  ...props
}, ref) {
  const nodeRef = (0, import_react5.useRef)(null);
  const leftControlPressedRef = (0, import_react5.useRef)(false);
  const [uncontrolledColumns, setUncontrolledColumns] = (0, import_react5.useState)(
    () => normalizeColumnCount(defaultColumns)
  );
  const controlledColumns = normalizeColumnCount(columns);
  const activeColumns = controlledColumns ?? uncontrolledColumns;
  const normalizedMinColumns = normalizeColumnCount(minColumns, 1);
  const normalizedMaxColumns = Math.max(
    normalizedMinColumns,
    normalizeColumnCount(maxColumns, 12)
  );
  const setNodeRef = (0, import_react5.useCallback)((node) => {
    nodeRef.current = node;
    assignRef(ref, node);
  }, [ref]);
  (0, import_react5.useEffect)(() => {
    if (!adjustableColumns || !activeColumns || !nodeRef.current) {
      return void 0;
    }
    const handleKeyDown = (event) => {
      if (event.code === "ControlLeft") {
        leftControlPressedRef.current = true;
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "ControlLeft") {
        leftControlPressedRef.current = false;
      }
    };
    const handleBlur = () => {
      leftControlPressedRef.current = false;
    };
    const handleWheel = (event) => {
      if (!leftControlPressedRef.current || !Number(event.deltaY)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const direction = Number(event.deltaY) < 0 ? -1 : 1;
      const nextColumns = Math.min(
        normalizedMaxColumns,
        Math.max(normalizedMinColumns, activeColumns + direction)
      );
      if (nextColumns === activeColumns) {
        return;
      }
      if (controlledColumns == null) {
        setUncontrolledColumns(nextColumns);
      }
      onColumnsChange?.(nextColumns);
    };
    const node = nodeRef.current;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      node.removeEventListener("wheel", handleWheel);
    };
  }, [
    activeColumns,
    adjustableColumns,
    controlledColumns,
    normalizedMaxColumns,
    normalizedMinColumns,
    onColumnsChange
  ]);
  const resolvedStyle = activeColumns && !virtual ? {
    ...style,
    gridTemplateColumns: `repeat(${activeColumns}, minmax(0, 1fr))`
  } : style;
  return /* @__PURE__ */ React.createElement(
    Component,
    {
      ...props,
      ref: setNodeRef,
      "data-gallery-columns": activeColumns || void 0,
      style: resolvedStyle,
      className: cx(
        "nexus-ui-gallery",
        activeColumns && adjustableColumns && "nexus-ui-gallery--columns-adjustable",
        compact && "nexus-ui-gallery--compact",
        virtual && "nexus-ui-gallery--virtual",
        className
      )
    },
    children
  );
});
var GalleryCard = (0, import_react5.forwardRef)(function GalleryCard2({
  as: Component = "article",
  className = "",
  interactive,
  selected = false,
  children,
  ...props
}, ref) {
  const isInteractive = interactive ?? (Component === "button" || Component === "a");
  return /* @__PURE__ */ React.createElement(
    Component,
    {
      ...props,
      ref,
      className: cx(
        "nexus-ui-gallery-card",
        isInteractive && "nexus-ui-gallery-card--interactive",
        selected && "is-selected",
        className
      )
    },
    children
  );
});
function GalleryCardMedia({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-gallery-card__media", className) }, children);
}
function GalleryCardBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-gallery-card__body", className) }, children);
}
function GalleryCardTitle({ as: Component = "strong", className = "", children }) {
  return /* @__PURE__ */ React.createElement(Component, { className: cx("nexus-ui-gallery-card__title", className) }, children);
}
function GalleryCardMeta({ as: Component = "span", className = "", children }) {
  return /* @__PURE__ */ React.createElement(Component, { className: cx("nexus-ui-gallery-card__meta", className) }, children);
}

// ../packages/nexus-ui/src/components/ReloadIcon/ReloadIcon.jsx
init_define_process();
function ReloadIcon({ size = 18, className = "" }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      "aria-hidden": "true",
      className,
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    /* @__PURE__ */ React.createElement("path", { d: "M20 6v5h-5" }),
    /* @__PURE__ */ React.createElement("path", { d: "M4 18v-5h5" }),
    /* @__PURE__ */ React.createElement("path", { d: "M18 11a7 7 0 0 0-12-3" }),
    /* @__PURE__ */ React.createElement("path", { d: "M6 13a7 7 0 0 0 12 3" })
  );
}

// ../packages/nexus-ui/src/legacy/Fields.jsx
init_define_process();
function Field({ className = "", label = "", description = "", wide = false, children }) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-field", wide && "nexus-ui-field--wide", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__label" }, label), description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__description" }, description) : null, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-field__control" }, children));
}
function InlineField({ className = "", label = "", children, grow = false }) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-inline-field", grow && "nexus-ui-inline-field--grow", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-inline-field__label" }, label), /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-inline-field__control" }, children));
}

// ../packages/nexus-ui/src/legacy/Panels.jsx
init_define_process();
function SectionPanel({ className = "", tone = "default", padding = "default", children }) {
  return /* @__PURE__ */ React.createElement("section", { className: cx(
    "nexus-ui-panel",
    tone !== "default" && `nexus-ui-panel--${tone}`,
    padding !== "default" && `nexus-ui-panel--padding-${padding}`,
    className
  ) }, children);
}
function PanelStack({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-stack", className) }, children);
}

// ../packages/nexus-ui/src/legacy/States.jsx
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
function MetricCard({
  className = "",
  tone = "default",
  eyebrow = "",
  value = "",
  description = "",
  children = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx(
    "nexus-ui-metric",
    tone !== "default" && `nexus-ui-metric--${tone}`,
    className
  ) }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, /* @__PURE__ */ React.createElement("strong", null, value), description ? /* @__PURE__ */ React.createElement("p", null, description) : null, children);
}

// ../packages/nexus-ui/src/legacy/Workspace.jsx
init_define_process();
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}
function SplitLayout({ className = "", variant = "main-aside", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx(
    "nexus-ui-split",
    variant === "sidebar-detail" ? "nexus-ui-split--sidebar-detail" : "nexus-ui-split--main-aside",
    className
  ) }, children);
}
function SplitSidebar({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("aside", { className: cx("nexus-ui-split__sidebar", className) }, children);
}
function SplitDetail({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("main", { className: cx("nexus-ui-split__detail", className) }, children);
}
function ScrollRegion({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-scroll-region", className) }, children);
}

// ../nexus-plugins/booru/src/booru-utils.js
init_define_process();
function normalizeBooruText(value) {
  return String(value ?? "").trim();
}
function normalizeBooruComparableText(value) {
  return normalizeBooruText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ");
}
function normalizeBooruReality(value) {
  const normalized = normalizeBooruComparableText(value);
  if (normalized === "real") {
    return "real";
  }
  if (normalized === "ficticio") {
    return "ficticio";
  }
  return null;
}
var BOORU_ENTITY_PREFIX_ALIASES = Object.freeze({
  persona: "author",
  author: "author",
  char: "character",
  character: "character",
  artist: "artist",
  universe: "universe"
});
var BOORU_MISSING_FILTER_ALIASES = Object.freeze({
  type: "type",
  tipo: "type",
  reality: "type",
  persona: "author",
  author: "author",
  artist: "artist",
  char: "character",
  character: "character",
  universe: "universe",
  "char-universe": "universe",
  "character-universe": "universe"
});
var BOORU_MEDIA_KIND_SET = /* @__PURE__ */ new Set(["image", "video", "gif"]);
function normalizeBooruEntityPrefix(prefix) {
  const normalizedPrefix = normalizeBooruComparableText(prefix);
  return BOORU_ENTITY_PREFIX_ALIASES[normalizedPrefix] || null;
}
function normalizeBooruMissingFilter(value) {
  const normalizedValue = normalizeBooruComparableText(value);
  return BOORU_MISSING_FILTER_ALIASES[normalizedValue] || null;
}
function unquoteBooruQueryValue(value) {
  const normalizedValue = normalizeBooruText(value);
  if (normalizedValue.length >= 2 && normalizedValue.startsWith('"') && normalizedValue.endsWith('"')) {
    return normalizedValue.slice(1, -1).replace(/\\"/g, '"');
  }
  return normalizedValue;
}
function tokenizeBooruQuery(value) {
  const normalizedValue = normalizeBooruText(value);
  if (!normalizedValue) {
    return [];
  }
  return normalizedValue.match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
}
function parseBooruSearchSyntax(value) {
  const tokens = [];
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];
  let missing = null;
  const rawTokens = tokenizeBooruQuery(value);
  let mediaKind = null;
  let reality = null;
  let classificationState = null;
  for (const rawToken of rawTokens) {
    const trimmedToken = normalizeBooruText(rawToken);
    if (!trimmedToken) {
      continue;
    }
    const negative = trimmedToken.startsWith("-") && trimmedToken.length > 1;
    const normalizedToken = negative ? trimmedToken.slice(1) : trimmedToken;
    const separatorIndex = normalizedToken.indexOf(":");
    if (separatorIndex <= 0) {
      const tokenValue2 = unquoteBooruQueryValue(normalizedToken);
      if (!tokenValue2) {
        continue;
      }
      const item2 = {
        id: null,
        value: tokenValue2,
        label: tokenValue2
      };
      tokens.push({
        raw: trimmedToken,
        type: "tag",
        negative,
        id: null,
        value: tokenValue2
      });
      if (negative) {
        excludeTags.push(item2);
      } else {
        includeTags.push(item2);
      }
      continue;
    }
    const rawPrefix = normalizedToken.slice(0, separatorIndex);
    const rawValue = normalizedToken.slice(separatorIndex + 1);
    const tokenValue = unquoteBooruQueryValue(rawValue);
    if (!tokenValue) {
      continue;
    }
    const entityKind = normalizeBooruEntityPrefix(rawPrefix);
    if (entityKind) {
      const item2 = {
        kind: entityKind,
        id: null,
        value: tokenValue,
        label: tokenValue
      };
      tokens.push({
        raw: trimmedToken,
        type: "entity",
        kind: entityKind,
        negative,
        id: null,
        value: tokenValue
      });
      if (negative) {
        excludeEntities.push(item2);
      } else {
        includeEntities.push(item2);
      }
      continue;
    }
    const normalizedPrefix = normalizeBooruComparableText(rawPrefix);
    if (normalizedPrefix === "tag") {
      const item2 = {
        id: null,
        value: tokenValue,
        label: tokenValue
      };
      tokens.push({
        raw: trimmedToken,
        type: "tag",
        negative,
        id: null,
        value: tokenValue
      });
      if (negative) {
        excludeTags.push(item2);
      } else {
        includeTags.push(item2);
      }
      continue;
    }
    if (normalizedPrefix === "reality") {
      const nextReality = normalizeBooruReality(tokenValue);
      if (!nextReality) {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      reality = nextReality;
      tokens.push({
        raw: trimmedToken,
        type: "reality",
        negative: false,
        value: nextReality
      });
      continue;
    }
    if (normalizedPrefix === "media") {
      const nextMediaKind = normalizeBooruComparableText(tokenValue);
      if (!BOORU_MEDIA_KIND_SET.has(nextMediaKind)) {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      mediaKind = nextMediaKind;
      tokens.push({
        raw: trimmedToken,
        type: "media-kind",
        negative: false,
        value: nextMediaKind
      });
      continue;
    }
    if (normalizedPrefix === "status") {
      const nextStatus = normalizeBooruComparableText(tokenValue);
      if (nextStatus !== "unclassified") {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      classificationState = "unclassified";
      tokens.push({
        raw: trimmedToken,
        type: "classification-state",
        negative: false,
        value: classificationState
      });
      continue;
    }
    if (normalizedPrefix === "missing") {
      const normalizedMissing = normalizeBooruMissingFilter(tokenValue);
      if (!normalizedMissing) {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      missing = normalizedMissing;
      tokens.push({
        raw: trimmedToken,
        type: "missing",
        negative: false,
        value: normalizedMissing
      });
      continue;
    }
    const fallbackTagValue = unquoteBooruQueryValue(normalizedToken);
    if (!fallbackTagValue) {
      continue;
    }
    const item = {
      id: null,
      value: fallbackTagValue,
      label: fallbackTagValue
    };
    tokens.push({
      raw: trimmedToken,
      type: "tag",
      negative,
      id: null,
      value: fallbackTagValue
    });
    if (negative) {
      excludeTags.push(item);
    } else {
      includeTags.push(item);
    }
  }
  return {
    raw: normalizeBooruText(value),
    tokens,
    query: {
      mediaKind,
      reality,
      classificationState,
      includeEntities,
      excludeEntities,
      includeTags,
      excludeTags,
      missing
    }
  };
}

// ../nexus-plugins/booru/src/domain/classification-policy.js
init_define_process();
var BOORU_REALITY_AUTO = "auto";
var BOORU_REALITY_MANUAL = "manual";
var BOORU_CLASSIFICATION_KINDS = Object.freeze([
  "author",
  "character",
  "universe",
  "artist"
]);
var RECOMMENDATION_KIND_PRIORITY = Object.freeze({
  author: Object.freeze(["author", "character", "universe", "artist"]),
  character: Object.freeze(["universe", "artist", "author", "character"]),
  artist: Object.freeze(["character", "universe", "author", "artist"]),
  universe: Object.freeze(["character", "artist", "author", "universe"]),
  real: Object.freeze(["author", "character", "universe", "artist"]),
  ficticio: Object.freeze(["character", "universe", "artist", "author"]),
  default: BOORU_CLASSIFICATION_KINDS
});
function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}
function normalizeRealitySource(value) {
  return value === BOORU_REALITY_MANUAL ? BOORU_REALITY_MANUAL : BOORU_REALITY_AUTO;
}
function resolveBooruReality({
  reality = null,
  realitySource = BOORU_REALITY_AUTO,
  realityWasEdited = false,
  authors = [],
  artists = [],
  characters = [],
  universes = []
} = {}) {
  const normalizedReality = reality === "real" || reality === "ficticio" ? reality : null;
  if (hasItems(authors)) {
    return { reality: "real", source: BOORU_REALITY_AUTO };
  }
  if (realityWasEdited) {
    if (normalizedReality) {
      return { reality: normalizedReality, source: BOORU_REALITY_MANUAL };
    }
    realitySource = BOORU_REALITY_AUTO;
  }
  if (normalizeRealitySource(realitySource) === BOORU_REALITY_MANUAL && normalizedReality) {
    return { reality: normalizedReality, source: BOORU_REALITY_MANUAL };
  }
  if (hasItems(characters) || hasItems(artists) || hasItems(universes)) {
    return { reality: "ficticio", source: BOORU_REALITY_AUTO };
  }
  return { reality: null, source: BOORU_REALITY_AUTO };
}
function getBooruEssentialState({
  reality = null,
  authors = [],
  artists = [],
  characters = [],
  universes = []
} = {}) {
  const missing = [];
  if (!reality) {
    missing.push("reality");
  } else if (reality === "real") {
    if (!hasItems(authors)) {
      missing.push("author");
    }
  } else if (reality === "ficticio") {
    if (!hasItems(characters)) {
      missing.push("character");
    }
    const hasUniverse = hasItems(universes) || characters.some((character) => Boolean(character?.universe?.id));
    if (!hasUniverse || characters.some((character) => !character?.universe?.id)) {
      missing.push("universe");
    }
    if (!hasItems(artists)) {
      missing.push("artist");
    }
  }
  return {
    complete: missing.length === 0,
    missing,
    classificationState: missing.length ? "unclassified" : "classified-basic"
  };
}
function getBooruRecommendationKindOrder(context = null) {
  const normalizedContext = String(context || "").trim();
  return RECOMMENDATION_KIND_PRIORITY[normalizedContext] || RECOMMENDATION_KIND_PRIORITY.default;
}

// ../nexus-plugins/booru/src/domain/details-policy.js
init_define_process();
var DETAILS_FIELD_CONFIG = Object.freeze({
  author: Object.freeze({
    kind: "author",
    field: "authors",
    label: "Persona"
  }),
  artist: Object.freeze({
    kind: "artist",
    field: "artists",
    label: "Artists"
  }),
  character: Object.freeze({
    kind: "character",
    field: "characters",
    label: "Characters"
  }),
  universe: Object.freeze({
    kind: "universe",
    field: "universes",
    label: "Universes"
  })
});
var DETAILS_RELATION_KEYS = Object.freeze({
  authors: "authors",
  artists: "artists",
  characters: "characters",
  universes: "directUniverses",
  manualTags: "manualTags"
});
function hasItems2(value) {
  return Array.isArray(value) && value.length > 0;
}
function normalizedItemIds(value) {
  return (Array.isArray(value) ? value : []).map((item) => String(item?.id || "").trim()).filter(Boolean).sort();
}
function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function hasMixedRelations(resources, resourceKey) {
  const reference = normalizedItemIds(resources[0]?.[resourceKey]);
  return resources.slice(1).some((resource) => !arraysEqual(reference, normalizedItemIds(resource?.[resourceKey])));
}
function getBooruDetailsMixedFields(resources) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);
  if (normalizedResources.length < 2) {
    return [];
  }
  const mixedFields = [];
  const referenceReality = normalizedResources[0]?.reality ?? null;
  if (normalizedResources.slice(1).some((resource) => (resource?.reality ?? null) !== referenceReality)) {
    mixedFields.push("reality");
  }
  for (const [fieldName, resourceKey] of Object.entries(DETAILS_RELATION_KEYS)) {
    if (hasMixedRelations(normalizedResources, resourceKey)) {
      mixedFields.push(fieldName);
    }
  }
  return mixedFields;
}
function getBooruDetailsPriorityContext(draft = null) {
  if (hasItems2(draft?.authors)) {
    return "author";
  }
  if (hasItems2(draft?.characters)) {
    return "character";
  }
  if (hasItems2(draft?.artists)) {
    return "artist";
  }
  if (hasItems2(draft?.universes)) {
    return "universe";
  }
  if (draft?.reality === "real" || draft?.reality === "ficticio") {
    return draft.reality;
  }
  return "default";
}
function getFieldDescription(kind, reality) {
  if (kind === "author") {
    return reality === "real" ? "Obligatoria para completar la ruta Real." : "Persona presente en el recurso.";
  }
  if (kind === "character") {
    return reality === "ficticio" ? "Obligatorio para completar la ruta Ficticio; cada Character conserva su Universe." : "Character presente en el recurso.";
  }
  if (kind === "universe") {
    return "Universe asociado directamente; el de cada Character se conserva como relaci\xF3n estructural.";
  }
  return reality === "ficticio" ? "Obligatorio para completar la ruta Ficticio." : "Artist presente en el recurso.";
}
function getBooruDetailsFieldSchema(draft = null) {
  const reality = draft?.reality === "real" || draft?.reality === "ficticio" ? draft.reality : null;
  const context = getBooruDetailsPriorityContext(draft);
  return getBooruRecommendationKindOrder(context).map((kind) => {
    const config = DETAILS_FIELD_CONFIG[kind];
    return {
      ...config,
      required: kind === "author" && reality === "real" || (kind === "character" || kind === "artist") && reality === "ficticio",
      description: getFieldDescription(kind, reality)
    };
  });
}
function getBooruDetailsRealityState(draft = null) {
  const mixedFields = new Set(Array.isArray(draft?.mixedFields) ? draft.mixedFields : []);
  const hasDeterminingEntity = hasItems2(draft?.authors) || hasItems2(draft?.characters) || hasItems2(draft?.artists) || mixedFields.has("authors") || mixedFields.has("characters") || mixedFields.has("artists");
  const value = draft?.reality === "real" || draft?.reality === "ficticio" ? draft.reality : null;
  const mixed = mixedFields.has("reality");
  return {
    mode: hasDeterminingEntity ? "readonly" : "editable",
    value,
    mixed,
    source: draft?.realitySource === "manual" ? "manual" : "auto",
    label: mixed ? "Valores mixtos" : value === "real" ? "Real" : value === "ficticio" ? "Ficticio" : "Sin definir"
  };
}

// ../nexus-plugins/booru/src/domain/entity-relations.js
init_define_process();

// ../nexus-plugins/booru/src/domain/contextual-browse.js
init_define_process();
var BOORU_BROWSE_DIRECTIONS = Object.freeze({ ASC: "asc", DESC: "desc" });
var BOORU_BROWSE_GROUPINGS = Object.freeze({ CONTINUOUS: "continuous", SECTIONED: "sectioned" });
var BOORU_RESOURCE_SORT_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha de integracion" },
  { value: "author", label: "Persona" },
  { value: "character", label: "Character" },
  { value: "universe", label: "Universe" },
  { value: "artist", label: "Artist" },
  { value: "tag", label: "Tag plana" },
  { value: "random", label: "Aleatorio" }
]);
var BOORU_RESOURCE_GROUP_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha" },
  { value: "author", label: "Persona" },
  { value: "character", label: "Character" },
  { value: "universe", label: "Universe" },
  { value: "artist", label: "Artist" }
]);
var BOORU_RESOURCE_GROUP_ORDER_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha de integraci\xF3n" },
  { value: "alphabetical", label: "Alfab\xE9tico" }
]);
var BOORU_ENTITY_SORT_OPTIONS = Object.freeze([
  { value: "name", label: "Nombre" },
  { value: "createdAt", label: "Fecha de creacion" },
  { value: "resourceCount", label: "Cantidad de recursos" },
  { value: "random", label: "Aleatorio" }
]);
var RESOURCE_SORTS = new Set(BOORU_RESOURCE_SORT_OPTIONS.map((option) => option.value));
var RESOURCE_GROUPS = new Set(BOORU_RESOURCE_GROUP_OPTIONS.map((option) => option.value));
var RESOURCE_GROUP_ORDERS = new Set(BOORU_RESOURCE_GROUP_ORDER_OPTIONS.map((option) => option.value));
var ENTITY_SORTS = /* @__PURE__ */ new Set([...BOORU_ENTITY_SORT_OPTIONS.map((option) => option.value), "universe"]);
function createBooruRandomSeed() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function normalizeBooruBrowseQuery(value = null, family = "resource", allowUniverseSort = false) {
  const isEntity = family === "entity";
  const allowedSorts = isEntity ? ENTITY_SORTS : RESOURCE_SORTS;
  const fallbackSort = isEntity ? "name" : "importedAt";
  const fallbackDirection = isEntity ? "asc" : "desc";
  let sortBy = allowedSorts.has(String(value?.sortBy || "")) ? String(value.sortBy) : fallbackSort;
  if (sortBy === "universe" && (!isEntity || !allowUniverseSort)) sortBy = fallbackSort;
  const direction = value?.direction === "asc" || value?.direction === "desc" ? value.direction : fallbackDirection;
  const randomSeed = String(value?.randomSeed || "").trim() || "booru-stable";
  const grouping = sortBy === "random" ? "continuous" : value?.grouping === "sectioned" ? "sectioned" : "continuous";
  let groupBy = String(value?.groupBy || "").trim();
  if (isEntity) {
    if (!ENTITY_SORTS.has(groupBy) || groupBy === "random") {
      groupBy = grouping === "sectioned" && sortBy !== "random" ? sortBy : "name";
    }
    if (groupBy === "universe" && !allowUniverseSort) groupBy = "name";
  } else if (!RESOURCE_GROUPS.has(groupBy)) {
    groupBy = grouping === "sectioned" && RESOURCE_GROUPS.has(sortBy) ? sortBy : "importedAt";
  }
  const groupOrderBy = RESOURCE_GROUP_ORDERS.has(String(value?.groupOrderBy || "")) ? String(value.groupOrderBy) : isEntity ? "alphabetical" : "importedAt";
  return { sortBy, direction, grouping, randomSeed, groupBy, groupOrderBy };
}
function getBooruEntitySortOptions({ allowUniverseSort = false } = {}) {
  return [
    ...BOORU_ENTITY_SORT_OPTIONS.slice(0, 3),
    ...allowUniverseSort ? [{ value: "universe", label: "Universe" }] : [],
    BOORU_ENTITY_SORT_OPTIONS.at(-1)
  ];
}

// ../nexus-plugins/booru/src/domain/entity-relations.js
var ENTITY_RELATION_TARGETS = Object.freeze({
  author: Object.freeze([]),
  character: Object.freeze(["artist"]),
  artist: Object.freeze(["character", "universe"]),
  universe: Object.freeze(["character", "artist"])
});
var ENTITY_RELATION_TABS = Object.freeze({
  artist: "artists",
  character: "characters",
  universe: "universes"
});
var ENTITY_RELATION_LABELS = Object.freeze({
  artist: "Artists",
  character: "Characters",
  universe: "Universes"
});
function getBooruEntityRelationTargets(sourceKind) {
  return [...ENTITY_RELATION_TARGETS[String(sourceKind || "").trim()] || []];
}
function getBooruEntityRelationKindFromTab(sourceKind, tab) {
  const normalizedTab = String(tab || "").trim();
  return getBooruEntityRelationTargets(sourceKind).find((targetKind) => ENTITY_RELATION_TABS[targetKind] === normalizedTab) || null;
}
function getBooruEntityProfileTabOptions(sourceKind) {
  return [
    { value: "gallery", label: "Galeria" },
    ...getBooruEntityRelationTargets(sourceKind).map((targetKind) => ({
      value: ENTITY_RELATION_TABS[targetKind],
      label: ENTITY_RELATION_LABELS[targetKind],
      relationKind: targetKind
    })),
    { value: "data", label: "Datos" },
    { value: "tags", label: "Tags" }
  ];
}

// ../nexus-plugins/booru/src/domain/resource-actions.js
init_define_process();
var UNIVERSAL_IMAGE_ACTIONS = Object.freeze([
  { id: "copy", label: "Copiar al portapapeles" },
  { id: "google", label: "Buscar en Google" }
]);
function buildBooruResourceActions({
  surface = "resource",
  section = "media",
  selectionCount = 1,
  imageCompatible = false,
  visualCompatible = false
} = {}) {
  const normalizedCount = Math.max(1, Number(selectionCount || 1));
  if (section === "trash") {
    return [
      { id: "details", label: "Detalles" },
      { id: "restore", label: normalizedCount > 1 ? "Restaurar selecci\xF3n" : "Restaurar" },
      { id: "purge", label: normalizedCount > 1 ? "Purgar selecci\xF3n" : "Purgar", danger: true }
    ];
  }
  return [
    { id: "details", label: "Detalles" },
    ...imageCompatible ? UNIVERSAL_IMAGE_ACTIONS : [],
    ...surface === "profile" && visualCompatible ? [
      { id: "set-avatar", label: "Usar como perfil" },
      { id: "set-banner", label: "Usar como banner" }
    ] : [],
    ...surface === "profile" ? [
      {
        id: "disassociate-profile",
        label: normalizedCount > 1 ? "Desasociar selecci\xF3n de esta entidad" : "Desasociar de esta entidad"
      }
    ] : [],
    {
      id: "trash",
      label: normalizedCount > 1 ? "Eliminar selecci\xF3n" : "Eliminar",
      danger: true
    }
  ];
}

// ../nexus-plugins/booru/src/domain/contextual-paste.js
init_define_process();
var ASSOCIATION_KINDS = /* @__PURE__ */ new Set(["author", "artist", "character", "universe", "tag"]);
function normalizeBooruClipboardAssociation(value) {
  const kind = String(value?.kind || "").trim();
  const entityId = String(value?.entityId || value?.id || "").trim();
  const entityName = String(value?.entityName || value?.name || "").trim();
  if (!ASSOCIATION_KINDS.has(kind) || !entityId && !entityName) return null;
  return {
    kind,
    entityId,
    entityName,
    universeId: String(value?.universeId || "").trim(),
    universeName: String(value?.universeName || "").trim()
  };
}
function mergeBooruClipboardAssociations(...sources) {
  const associations = [];
  const seen = /* @__PURE__ */ new Set();
  sources.flat(Infinity).forEach((candidate) => {
    const association = normalizeBooruClipboardAssociation(candidate);
    if (!association) return;
    const identity = association.entityId ? `${association.kind}:id:${association.entityId}` : `${association.kind}:name:${association.entityName.normalize("NFKC").toLocaleLowerCase("es-AR")}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    associations.push(association);
  });
  return associations;
}

// ../nexus-plugins/booru/src/domain/floating-details.js
init_define_process();
var BOORU_FLOATING_DETAILS_MIN_WIDTH = 360;
var BOORU_FLOATING_DETAILS_MIN_HEIGHT = 320;
function createBooruFloatingDetailsGeometry(viewport = {}) {
  const viewportWidth = Math.max(BOORU_FLOATING_DETAILS_MIN_WIDTH, Number(viewport.width || 1280));
  const viewportHeight = Math.max(BOORU_FLOATING_DETAILS_MIN_HEIGHT, Number(viewport.height || 800));
  const width = Math.min(520, viewportWidth - 32);
  const height = Math.min(680, viewportHeight - 32);
  return {
    x: Math.max(16, viewportWidth - width - 24),
    y: Math.max(16, Math.round((viewportHeight - height) / 2)),
    width,
    height
  };
}
function clampBooruFloatingDetailsGeometry(value, viewport = {}) {
  const viewportWidth = Math.max(1, Number(viewport.width || 1280));
  const viewportHeight = Math.max(1, Number(viewport.height || 800));
  const width = Math.min(
    viewportWidth,
    Math.max(Math.min(BOORU_FLOATING_DETAILS_MIN_WIDTH, viewportWidth), Number(value?.width || 520))
  );
  const height = Math.min(
    viewportHeight,
    Math.max(Math.min(BOORU_FLOATING_DETAILS_MIN_HEIGHT, viewportHeight), Number(value?.height || 680))
  );
  return {
    x: Math.min(Math.max(0, Number(value?.x || 0)), Math.max(0, viewportWidth - width)),
    y: Math.min(Math.max(0, Number(value?.y || 0)), Math.max(0, viewportHeight - height)),
    width,
    height
  };
}

// ../nexus-plugins/booru/src/domain/workspace-navigation.js
init_define_process();
var BOORU_WORKSPACE_SECTIONS = Object.freeze([
  "media",
  "pending",
  "authors",
  "characters",
  "artists",
  "universes",
  "settings"
]);
var BOORU_ENTITY_SECTION_KIND = Object.freeze({
  authors: "author",
  characters: "character",
  artists: "artist",
  universes: "universe"
});
var BOORU_SETTINGS_SUBVIEWS = /* @__PURE__ */ new Set(["overview", "duplicates", "trash"]);
var BOORU_NAVIGATION_INPUT_KEY = "booruNavigation";
var BOORU_GRID_FAMILIES = Object.freeze({
  RESOURCES: "resources",
  ENTITIES: "entities",
  PROFILE_RESOURCES: "profileResources"
});
var BOORU_GRID_COLUMN_LIMITS = Object.freeze({ min: 2, max: 12 });
var BOORU_DEFAULT_GRID_COLUMNS = Object.freeze({
  [BOORU_GRID_FAMILIES.RESOURCES]: 6,
  [BOORU_GRID_FAMILIES.ENTITIES]: 5,
  [BOORU_GRID_FAMILIES.PROFILE_RESOURCES]: 6
});
function normalizeText(value) {
  return String(value || "").trim();
}
function normalizeSection(value) {
  const section = normalizeText(value);
  return BOORU_WORKSPACE_SECTIONS.includes(section) ? section : "media";
}
function normalizeProfile(value, section) {
  const expectedKind = BOORU_ENTITY_SECTION_KIND[section] || null;
  const kind = normalizeText(value?.kind);
  const id = normalizeText(value?.id);
  const tab = normalizeText(value?.tab) || "gallery";
  if (!expectedKind || kind !== expectedKind || !id) {
    return null;
  }
  return { kind, id, tab };
}
function normalizeBooruWorkspaceRoute(value = null) {
  const section = normalizeSection(value?.section);
  const settingsSubview = section === "settings" && BOORU_SETTINGS_SUBVIEWS.has(normalizeText(value?.settingsSubview)) ? normalizeText(value?.settingsSubview) : "overview";
  return {
    section,
    settingsSubview,
    entityKind: BOORU_ENTITY_SECTION_KIND[section] || null,
    profile: normalizeProfile(value?.entityProfile || value?.profile, section)
  };
}
function createBooruWorkspaceRouteKey(value = null) {
  const route = normalizeBooruWorkspaceRoute(value);
  if (route.section === "settings") {
    return `settings:${route.settingsSubview}`;
  }
  if (route.profile) {
    return `${route.section}:${route.profile.id}:${route.profile.tab}`;
  }
  return `${route.section}:root`;
}
function createBooruSectionRootRoute(section) {
  return normalizeBooruWorkspaceRoute({ section, settingsSubview: "overview", entityProfile: null });
}
function routeToBooruWorkspaceInput(routeValue, baseInput = null, navigation = null) {
  const route = normalizeBooruWorkspaceRoute(routeValue);
  const nextInput = {
    ...baseInput && typeof baseInput === "object" ? baseInput : {},
    section: route.section,
    settingsSubview: route.settingsSubview,
    entityProfile: route.profile ? { ...route.profile } : null
  };
  if (navigation) {
    nextInput[BOORU_NAVIGATION_INPUT_KEY] = normalizeBooruNavigationState(navigation, route);
  }
  return nextInput;
}
function normalizeBooruNavigationState(value = null, activeRouteValue = null) {
  const activeRoute = normalizeBooruWorkspaceRoute(activeRouteValue || value?.activeRoute);
  const rawStack = Array.isArray(value?.backStack) ? value.backStack : [];
  const backStack = [];
  for (const candidate of rawStack) {
    const route = normalizeBooruWorkspaceRoute(candidate);
    if (createBooruWorkspaceRouteKey(route) === createBooruWorkspaceRouteKey(activeRoute)) {
      continue;
    }
    if (!backStack.length || createBooruWorkspaceRouteKey(backStack.at(-1)) !== createBooruWorkspaceRouteKey(route)) {
      backStack.push(route);
    }
  }
  return { activeRoute, backStack };
}
function pushBooruWorkspaceRoute(navigationValue, nextRouteValue) {
  const navigation = normalizeBooruNavigationState(navigationValue);
  const nextRoute = normalizeBooruWorkspaceRoute(nextRouteValue);
  const currentKey = createBooruWorkspaceRouteKey(navigation.activeRoute);
  const nextKey = createBooruWorkspaceRouteKey(nextRoute);
  if (currentKey === nextKey) {
    return { ...navigation, activeRoute: nextRoute };
  }
  return normalizeBooruNavigationState({
    activeRoute: nextRoute,
    backStack: [...navigation.backStack, navigation.activeRoute]
  }, nextRoute);
}
function replaceBooruWorkspaceRoute(navigationValue, nextRouteValue) {
  const navigation = normalizeBooruNavigationState(navigationValue);
  const nextRoute = normalizeBooruWorkspaceRoute(nextRouteValue);
  return normalizeBooruNavigationState({ ...navigation, activeRoute: nextRoute }, nextRoute);
}
async function popBooruWorkspaceRoute(navigationValue, isRouteAvailable = null) {
  const navigation = normalizeBooruNavigationState(navigationValue);
  const remaining = [...navigation.backStack];
  while (remaining.length) {
    const candidate = remaining.pop();
    const available = typeof isRouteAvailable !== "function" || await isRouteAvailable(candidate);
    if (available) {
      return normalizeBooruNavigationState({ activeRoute: candidate, backStack: remaining }, candidate);
    }
    const ancestor = createBooruSectionRootRoute(candidate.section);
    const ancestorAvailable = typeof isRouteAvailable !== "function" || await isRouteAvailable(ancestor);
    if (ancestorAvailable) {
      return normalizeBooruNavigationState({ activeRoute: ancestor, backStack: remaining }, ancestor);
    }
  }
  const fallback = createBooruSectionRootRoute(navigation.activeRoute.section);
  return normalizeBooruNavigationState({ activeRoute: fallback, backStack: [] }, fallback);
}
function resetBooruWorkspaceSection(navigationValue, section) {
  const root = createBooruSectionRootRoute(section);
  const navigation = normalizeBooruNavigationState(navigationValue, root);
  return {
    activeRoute: root,
    backStack: navigation.backStack.filter((route) => route.section !== root.section)
  };
}
function clampColumns(value, fallback) {
  const numericValue = Number(value);
  const normalizedValue = Number.isFinite(numericValue) ? Math.round(numericValue) : fallback;
  return Math.min(BOORU_GRID_COLUMN_LIMITS.max, Math.max(BOORU_GRID_COLUMN_LIMITS.min, normalizedValue));
}
function normalizeBooruGridPreferences(value = null) {
  return Object.fromEntries(
    Object.entries(BOORU_DEFAULT_GRID_COLUMNS).map(([family, fallback]) => [
      family,
      clampColumns(value?.[family], fallback)
    ])
  );
}
function createEmptyBooruRouteSession() {
  return {
    query: null,
    filters: null,
    order: null,
    direction: null,
    grouping: null,
    groupBy: null,
    groupOrderBy: null,
    results: null,
    selection: null,
    scrollTop: 0
  };
}
function createBooruResourceRouteSession(routeValue, searchTokens = []) {
  const route = normalizeBooruWorkspaceRoute(routeValue);
  return {
    ...createEmptyBooruRouteSession(),
    route,
    query: Array.isArray(searchTokens) ? searchTokens.filter(Boolean) : [],
    filters: {
      mediaKind: "all",
      reality: "all",
      missing: "none",
      pendingMode: "essential"
    },
    results: {
      items: [],
      totalCount: 0,
      hasMore: false,
      querySignature: ""
    },
    page: { page: 1, querySignature: "" },
    selection: { ids: [], activeId: "", mode: "single" }
  };
}
function resolveBooruProfileForRoute(routeValue, sessionProfile = null, currentProfile = null) {
  const route = normalizeBooruWorkspaceRoute(routeValue);
  if (!route.profile) return null;
  return [currentProfile, sessionProfile].find((candidate) => String(candidate?.kind || "").trim() === route.profile.kind && String(candidate?.id || "").trim() === route.profile.id) || null;
}

// ../nexus-plugins/booru/src/domain/pending-workflow.js
init_define_process();
var BOORU_NO_MISSING_FILTER = "none";
var BOORU_RECOMMENDATION_SCOPES = Object.freeze({
  ALL: "all",
  ESSENTIAL: "essential",
  TAGS: "tags"
});
var ESSENTIAL_MISSING_KINDS = /* @__PURE__ */ new Set(["author", "artist", "character", "universe"]);
function normalizeBooruRecommendationScope(value) {
  if (value === BOORU_RECOMMENDATION_SCOPES.ESSENTIAL) {
    return BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
  }
  if (value === BOORU_RECOMMENDATION_SCOPES.TAGS) {
    return BOORU_RECOMMENDATION_SCOPES.TAGS;
  }
  return BOORU_RECOMMENDATION_SCOPES.ALL;
}
function getBooruRecommendationScope(section, pendingMode) {
  if (section !== "pending") {
    return BOORU_RECOMMENDATION_SCOPES.ALL;
  }
  return pendingMode === "tags" ? BOORU_RECOMMENDATION_SCOPES.TAGS : BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
}
function buildBooruResourceQuery({
  searchTokens = [],
  freeText = "",
  browse = null,
  mediaKindFilter = "all",
  realityFilter = "all",
  pendingMode = "essential",
  missingFilter = BOORU_NO_MISSING_FILTER
} = {}) {
  let searchReality = null;
  let searchClassificationState = null;
  let searchMissing = null;
  let searchMediaKind = null;
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];
  for (const token of Array.isArray(searchTokens) ? searchTokens : []) {
    if (token?.type === "entity") {
      const nextFilter = {
        kind: token.kind,
        id: token.id || null,
        value: token.value,
        label: token.label || token.value
      };
      if (token.negative) {
        excludeEntities.push(nextFilter);
      } else {
        includeEntities.push(nextFilter);
      }
      continue;
    }
    if (token?.type === "tag") {
      const nextFilter = {
        id: token.id || null,
        value: token.value,
        label: token.label || token.value
      };
      if (token.negative) {
        excludeTags.push(nextFilter);
      } else {
        includeTags.push(nextFilter);
      }
      continue;
    }
    if (token?.type === "reality" && !token.negative) {
      searchReality = token.value;
      continue;
    }
    if (token?.type === "missing" && !token.negative) {
      searchMissing = token.value;
      continue;
    }
    if (token?.type === "classification-state" && !token.negative) {
      searchClassificationState = token.value;
      continue;
    }
    if (token?.type === "media-kind" && !token.negative) {
      searchMediaKind = token.value;
    }
  }
  const explicitReality = realityFilter === "real" || realityFilter === "ficticio" ? realityFilter : null;
  const explicitMissing = realityFilter === "untyped" ? "type" : missingFilter !== BOORU_NO_MISSING_FILTER ? missingFilter : null;
  return {
    textTerms: String(freeText || "").trim(),
    mediaKind: mediaKindFilter !== "all" ? mediaKindFilter : searchMediaKind,
    reality: explicitReality || searchReality,
    classificationState: searchClassificationState || null,
    pendingMode: pendingMode === "tags" ? "tags" : "essential",
    includeEntities,
    excludeEntities,
    includeTags,
    excludeTags,
    missing: explicitMissing || searchMissing,
    sortBy: browse?.sortBy || "importedAt",
    groupBy: browse?.groupBy || "importedAt",
    groupOrderBy: browse?.groupOrderBy || "importedAt",
    direction: browse?.direction || "desc",
    grouping: browse?.grouping || "continuous",
    randomSeed: browse?.randomSeed || "booru-stable"
  };
}
function getBooruContextualMissingFilterOptions(realityValue, includeEntityFilters = [], recommendationScope = BOORU_RECOMMENDATION_SCOPES.ALL) {
  const entityKinds = new Set(
    (Array.isArray(includeEntityFilters) ? includeEntityFilters : []).map((filter) => String(filter?.kind || "").trim()).filter(Boolean)
  );
  const disabledValues = /* @__PURE__ */ new Set();
  if (entityKinds.has("author")) {
    disabledValues.add("author");
  }
  if (entityKinds.has("artist")) {
    disabledValues.add("artist");
  }
  if (entityKinds.has("character")) {
    disabledValues.add("character");
    disabledValues.add("universe");
  } else if (entityKinds.has("universe")) {
    disabledValues.add("universe");
  }
  const options = [{ value: BOORU_NO_MISSING_FILTER, label: "Ninguno" }];
  if (realityValue === "real" && normalizeBooruRecommendationScope(recommendationScope) !== BOORU_RECOMMENDATION_SCOPES.ESSENTIAL) {
    options.push({ value: "author", label: "Sin persona" });
  } else if (realityValue === "ficticio") {
    options.push(
      { value: "character", label: "Sin char" },
      { value: "universe", label: "Sin universe" },
      { value: "artist", label: "Sin artist" }
    );
  }
  return options.map((option) => ({
    ...option,
    disabled: option.value !== BOORU_NO_MISSING_FILTER && disabledValues.has(option.value)
  }));
}
function isBooruMissingFilterCompatible(missingFilter, options = []) {
  if (missingFilter === "type") {
    return true;
  }
  if (!ESSENTIAL_MISSING_KINDS.has(missingFilter)) {
    return missingFilter === BOORU_NO_MISSING_FILTER;
  }
  return options.some((option) => option?.value === missingFilter && !option?.disabled);
}

// ../nexus-plugins/booru/src/domain/resource-mutations.js
init_define_process();
function normalizeBooruResourceMutationResult(value) {
  const source = value && typeof value === "object" ? value : {};
  const legacyResources = Array.isArray(source.resource) ? source.resource : [source.resource].filter(Boolean);
  const updatedResources = (Array.isArray(source.updatedResources) ? source.updatedResources : legacyResources).filter((resource) => resource?.id);
  return {
    revision: String(source.revision || "").trim(),
    reason: String(source.reason || "unknown").trim() || "unknown",
    updatedResources,
    leavingQueryIds: Array.from(new Set(
      (Array.isArray(source.leavingQueryIds) ? source.leavingQueryIds : []).map((resourceId) => String(resourceId || "").trim()).filter(Boolean)
    )),
    enteredQueryIds: Array.from(new Set(
      (Array.isArray(source.enteredQueryIds) ? source.enteredQueryIds : []).map((resourceId) => String(resourceId || "").trim()).filter(Boolean)
    )),
    queryPlacements: (Array.isArray(source.queryPlacements) ? source.queryPlacements : []).map((placement) => ({
      resourceId: String(placement?.resourceId || "").trim(),
      index: Number(placement?.index)
    })).filter((placement) => placement.resourceId && Number.isInteger(placement.index) && placement.index >= 0),
    affectedEntities: (Array.isArray(source.affectedEntities) ? source.affectedEntities : []).map((entity) => ({
      kind: String(entity?.kind || "").trim(),
      id: String(entity?.id || "").trim()
    })).filter((entity) => entity.kind && entity.id),
    totalCountDelta: Number.isFinite(Number(source.totalCountDelta)) ? Number(source.totalCountDelta) : 0
  };
}
function mergeBooruResourceRecords(currentResources, nextResources) {
  const nextById = new Map(
    (Array.isArray(nextResources) ? nextResources : []).filter((resource) => resource?.id).map((resource) => [resource.id, resource])
  );
  const merged = (Array.isArray(currentResources) ? currentResources : []).filter((resource) => resource?.id).map((resource) => nextById.get(resource.id) || resource);
  const currentIds = new Set(merged.map((resource) => resource.id));
  for (const resource of nextById.values()) {
    if (!currentIds.has(resource.id)) {
      merged.push(resource);
    }
  }
  return merged;
}
function applyBooruMutationToResourceWindow(currentItems, rawMutation) {
  const mutation = normalizeBooruResourceMutationResult(rawMutation);
  const originalItems = (Array.isArray(currentItems) ? currentItems : []).filter((item) => item?.id);
  const originalWindowSize = originalItems.length;
  const updatedById = new Map(mutation.updatedResources.map((resource) => [resource.id, resource]));
  const leavingIds = new Set(mutation.leavingQueryIds);
  const placementById = new Map(
    mutation.queryPlacements.map((placement) => [placement.resourceId, placement.index])
  );
  const touchedIds = /* @__PURE__ */ new Set([
    ...updatedById.keys(),
    ...leavingIds
  ]);
  const nextItems = originalItems.filter((item) => !touchedIds.has(item.id));
  const positionedResources = [];
  for (const resource of mutation.updatedResources) {
    if (leavingIds.has(resource.id)) {
      continue;
    }
    const placement = placementById.get(resource.id);
    const wasLoaded = originalItems.some((item) => item.id === resource.id);
    if (Number.isInteger(placement) && placement >= 0 && placement < originalWindowSize) {
      positionedResources.push({ resource, placement });
    } else if (wasLoaded && placement == null) {
      positionedResources.push({ resource, placement: originalItems.findIndex((item) => item.id === resource.id) });
    }
  }
  positionedResources.sort((left, right) => left.placement - right.placement).forEach(({ resource, placement }) => {
    nextItems.splice(Math.min(placement, nextItems.length), 0, resource);
  });
  return {
    items: nextItems,
    mutation
  };
}
function resolveBooruAnchoredResources(resourceIds, visibleResources, anchoredResources) {
  const visibleById = new Map(
    (Array.isArray(visibleResources) ? visibleResources : []).filter((resource) => resource?.id).map((resource) => [resource.id, resource])
  );
  const anchoredById = new Map(
    (Array.isArray(anchoredResources) ? anchoredResources : []).filter((resource) => resource?.id).map((resource) => [resource.id, resource])
  );
  return (Array.isArray(resourceIds) ? resourceIds : []).map((resourceId) => anchoredById.get(resourceId) || visibleById.get(resourceId) || null).filter(Boolean);
}
function isBooruResourceWindowContextCurrent(requestContext, currentContext) {
  if (!requestContext || !currentContext) {
    return false;
  }
  return Boolean(currentContext.showResourceWorkspace) && String(currentContext.activeResourceSection || "") === String(requestContext.activeResourceSection || "") && String(currentContext.querySignature || "") === String(requestContext.querySignature || "") && Number(currentContext.currentResourcePage || 1) === Number(requestContext.currentResourcePage || 1) && Number(currentContext.itemCount || 0) === Number(requestContext.itemCount || 0);
}

// ../nexus-plugins/booru/src/components/index.js
init_define_process();

// ../nexus-plugins/booru/src/components/EntityVisualCropper.jsx
init_define_process();

// ../nexus-plugins/booru/src/domain/entity-visual-policy.js
init_define_process();
var DEFAULT_ENTITY_VISUAL_LAYOUT = Object.freeze({
  scale: 1,
  offsetX: 0,
  offsetY: 0
});
function clamp(value, minimum, maximum, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.min(maximum, Math.max(minimum, numericValue)) : fallback;
}
function normalizeBooruEntityVisualLayout(value = null) {
  const rawOffsetX = Number(value?.offsetX);
  const rawOffsetY = Number(value?.offsetY);
  const offsetX = Number.isFinite(rawOffsetX) && Math.abs(rawOffsetX) > 1 ? rawOffsetX / 180 : rawOffsetX;
  const offsetY = Number.isFinite(rawOffsetY) && Math.abs(rawOffsetY) > 1 ? rawOffsetY / 180 : rawOffsetY;
  return {
    scale: clamp(value?.scale, 0.2, 4, DEFAULT_ENTITY_VISUAL_LAYOUT.scale),
    offsetX: clamp(offsetX, -1.5, 1.5, DEFAULT_ENTITY_VISUAL_LAYOUT.offsetX),
    offsetY: clamp(offsetY, -1.5, 1.5, DEFAULT_ENTITY_VISUAL_LAYOUT.offsetY)
  };
}
function getBooruEntityVisualMediaStyle(visualOrLayout = null) {
  const layout = normalizeBooruEntityVisualLayout(visualOrLayout?.layout || visualOrLayout);
  return {
    transform: `translate(${layout.offsetX * 100}%, ${layout.offsetY * 100}%) scale(${layout.scale})`,
    transformOrigin: "center center"
  };
}
function getBooruEntityVisualRenderProps(visual = null) {
  const pathValue = String(visual?.source?.pathValue || "").trim();
  if (!pathValue) {
    return null;
  }
  const mediaKind = String(visual?.source?.mediaKind || "image").trim() || "image";
  return {
    pathValue,
    mediaKind,
    mediaStyle: getBooruEntityVisualMediaStyle(visual),
    objectFit: "contain",
    forceOriginal: true,
    autoplay: mediaKind === "video",
    loop: mediaKind === "video"
  };
}

// ../nexus-plugins/booru/src/components/EntityVisualCropper.jsx
var React2 = window.React;
var { useEffect: useEffect3, useMemo, useRef: useRef3, useState: useState3 } = React2;
async function invoke(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo guardar el encuadre.");
  }
  return response.data;
}
function clamp2(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}
function toFileUrl(pathValue) {
  if (!pathValue) return "";
  return new URL(window.nexus.urls.pathToFileUrl(pathValue)).href;
}
function EntityVisualCropper({
  kind,
  entityId,
  role,
  source,
  initialLayout,
  busy = false,
  onSaved,
  onCancel
}) {
  const frameRef = useRef3(null);
  const pointerRef = useRef3(null);
  const [layout, setLayout] = useState3(() => normalizeBooruEntityVisualLayout(initialLayout));
  const [saving, setSaving] = useState3(false);
  const isBanner = role === "banner";
  useEffect3(() => {
    setLayout(normalizeBooruEntityVisualLayout(initialLayout));
  }, [entityId, initialLayout?.offsetX, initialLayout?.offsetY, initialLayout?.scale, role]);
  const mediaStyle = useMemo(() => getBooruEntityVisualMediaStyle(layout), [layout]);
  const beginPointer = (event) => {
    if (busy || saving || !frameRef.current) return;
    event.preventDefault();
    const bounds = frameRef.current.getBoundingClientRect();
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      width: bounds.width,
      height: bounds.height,
      layout
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const movePointer = (event) => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = (event.clientX - gesture.x) / Math.max(1, gesture.width);
    const dy = (event.clientY - gesture.y) / Math.max(1, gesture.height);
    setLayout((current) => ({
      ...current,
      offsetX: clamp2(gesture.layout.offsetX + dx, -1.5, 1.5),
      offsetY: clamp2(gesture.layout.offsetY + dy, -1.5, 1.5)
    }));
  };
  const endPointer = (event) => {
    if (pointerRef.current?.id === event.pointerId) pointerRef.current = null;
  };
  const handleWheel = (event) => {
    if (busy || saving) return;
    event.preventDefault();
    const multiplier = event.deltaY < 0 ? 1.12 : 0.88;
    setLayout((current) => ({
      ...current,
      scale: clamp2(current.scale * multiplier, 0.2, 4)
    }));
  };
  const save = async () => {
    setSaving(true);
    try {
      const result = await invoke("booru:set-entity-visual-layout", {
        kind,
        entityId,
        visualRole: role,
        layout
      });
      onSaved?.(result?.profile || null);
    } finally {
      setSaving(false);
    }
  };
  if (!source?.pathValue) return null;
  const src = toFileUrl(source.pathValue);
  return /* @__PURE__ */ React2.createElement("div", { className: "booruVisualCropper", role: "dialog", "aria-label": `Ajustar ${isBanner ? "banner" : "perfil"}` }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: frameRef,
      className: ["booruVisualCropper__frame", isBanner ? "is-banner" : "is-avatar"].join(" "),
      onPointerDown: beginPointer,
      onPointerMove: movePointer,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel: handleWheel
    },
    source.mediaKind === "video" ? /* @__PURE__ */ React2.createElement("video", { src, style: mediaStyle, muted: true, autoPlay: true, loop: true, playsInline: true, preload: "metadata" }) : /* @__PURE__ */ React2.createElement("img", { src, alt: "", draggable: "false", style: mediaStyle })
  ), /* @__PURE__ */ React2.createElement("div", { className: "booruVisualCropper__actions" }, /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: () => {
        setLayout(normalizeBooruEntityVisualLayout(initialLayout));
        onCancel?.();
      },
      disabled: saving
    },
    "Cancelar"
  ), /* @__PURE__ */ React2.createElement(Button, { type: "button", tone: "primary", onClick: () => void save(), disabled: busy || saving }, saving ? "Guardando" : "Confirmar")));
}

// ../nexus-plugins/booru/src/components/ClipboardAssociationComposer.jsx
init_define_process();
var React3 = window.React;
var { useEffect: useEffect4, useState: useState4 } = React3;
var KIND_OPTIONS = [
  ["author", "Persona"],
  ["artist", "Artist"],
  ["character", "Character"],
  ["universe", "Universe"]
];
async function invoke2(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo buscar en Booru.");
  return response.data;
}
function EntityField({ kind, value, onChange, onSelect, label }) {
  const [items, setItems] = useState4([]);
  useEffect4(() => {
    const query = String(value || "").trim();
    if (!query) {
      setItems([]);
      return void 0;
    }
    const timer = window.setTimeout(() => {
      void invoke2("booru:list-entities", { kind, query }).then((result) => {
        setItems(Array.isArray(result?.items) ? result.items.slice(0, 6) : []);
      }).catch(() => setItems([]));
    }, 140);
    return () => window.clearTimeout(timer);
  }, [kind, value]);
  return /* @__PURE__ */ React3.createElement("label", { className: "booruClipboardComposer__field" }, /* @__PURE__ */ React3.createElement("span", null, label), /* @__PURE__ */ React3.createElement("input", { value, onChange: (event) => onChange(event.target.value), autoFocus: label !== "Universe" }), items.length ? /* @__PURE__ */ React3.createElement("div", { className: "booruClipboardComposer__suggestions" }, items.map((item) => /* @__PURE__ */ React3.createElement("button", { key: item.id, type: "button", onClick: () => onSelect(item) }, item.displayName))) : null);
}
function ClipboardAssociationComposer({ defaultKind = "author", onCancel, onConfirm }) {
  const [kind, setKind] = useState4(defaultKind);
  const [entityName, setEntityName] = useState4("");
  const [entityId, setEntityId] = useState4("");
  const [universeName, setUniverseName] = useState4("");
  const [universeId, setUniverseId] = useState4("");
  const [busy, setBusy] = useState4(false);
  const submit = async () => {
    if (!entityId && !entityName.trim() || kind === "character" && !universeId && !universeName.trim()) return;
    setBusy(true);
    try {
      await onConfirm?.({ kind, entityId, entityName, universeId, universeName });
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React3.createElement("div", { className: "booruClipboardComposer", role: "dialog", "aria-label": "Asociar recurso pegado" }, /* @__PURE__ */ React3.createElement("select", { value: kind, onChange: (event) => {
    setKind(event.target.value);
    setEntityId("");
    setEntityName("");
  } }, KIND_OPTIONS.map(([value, label]) => /* @__PURE__ */ React3.createElement("option", { key: value, value }, label))), /* @__PURE__ */ React3.createElement(EntityField, { kind, label: "Entidad", value: entityName, onChange: (value) => {
    setEntityName(value);
    setEntityId("");
  }, onSelect: (item) => {
    setEntityId(item.id);
    setEntityName(item.displayName);
  } }), kind === "character" ? /* @__PURE__ */ React3.createElement(EntityField, { kind: "universe", label: "Universe", value: universeName, onChange: (value) => {
    setUniverseName(value);
    setUniverseId("");
  }, onSelect: (item) => {
    setUniverseId(item.id);
    setUniverseName(item.displayName);
  } }) : null, /* @__PURE__ */ React3.createElement("div", { className: "booruClipboardComposer__actions" }, /* @__PURE__ */ React3.createElement(Button, { type: "button", onClick: onCancel, disabled: busy }, "Cancelar"), /* @__PURE__ */ React3.createElement(Button, { type: "button", tone: "primary", onClick: () => void submit(), disabled: busy }, "Asociar")));
}

// ../nexus-plugins/booru/src/components/entities/CharacterCreationDialog.jsx
init_define_process();
var React4 = window.React;
var { useState: useState5 } = React4;
function CharacterCreationDialog({
  name,
  invoke: invoke7,
  SingleEntityField,
  onCancel,
  onCreated
}) {
  const [universe, setUniverse] = useState5(null);
  const [busy, setBusy] = useState5(false);
  const [error, setError] = useState5("");
  const submit = async () => {
    if (!universe?.id || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await invoke7("booru:ensure-character-in-universe", {
        name,
        universeId: universe.id
      });
      onCreated?.(result?.entity || null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear el Character.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React4.createElement("div", { className: "booruCharacterCreation", role: "dialog", "aria-modal": "true", "aria-labelledby": "booru-character-creation-title" }, /* @__PURE__ */ React4.createElement("div", { className: "booruCharacterCreation__header" }, /* @__PURE__ */ React4.createElement("strong", { id: "booru-character-creation-title" }, "Crear Character"), /* @__PURE__ */ React4.createElement("span", null, name)), /* @__PURE__ */ React4.createElement(
    Field,
    {
      label: "Universe (requerido)",
      description: "Busca uno existente o crea un Universe normal antes de confirmar."
    },
    /* @__PURE__ */ React4.createElement(
      SingleEntityField,
      {
        kind: "universe",
        label: "Universe",
        value: universe,
        onChange: setUniverse,
        disabled: busy,
        placeholder: "Buscar o crear Universe",
        buttonLabel: "Elegir"
      }
    )
  ), error ? /* @__PURE__ */ React4.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React4.createElement("div", { className: "booruCharacterCreation__actions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => onCancel?.(), disabled: busy }, "Cancelar"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => void submit(), disabled: !universe?.id || busy }, "Crear")));
}

// ../nexus-plugins/booru/src/components/settings/SettingsSection.jsx
init_define_process();
var React5 = window.React;
var { useEffect: useEffect5, useState: useState6 } = React5;
async function invoke3(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo actualizar las plataformas.");
  return response.data;
}
function SettingsSection({
  snapshot,
  busyAction,
  loading,
  onRefresh,
  onRescan,
  onRestart,
  onOpenDuplicates,
  onOpenTrash,
  onOpenPath
}) {
  const [platforms, setPlatforms] = useState6([]);
  const [platformName, setPlatformName] = useState6("");
  const [iconResourceId, setIconResourceId] = useState6("");
  const [resources, setResources] = useState6([]);
  const [platformError, setPlatformError] = useState6("");
  const loadPlatforms = async () => {
    const result = await invoke3("booru:list-social-platforms");
    setPlatforms(Array.isArray(result?.items) ? result.items : []);
  };
  useEffect5(() => {
    void loadPlatforms().catch((error) => setPlatformError(error.message));
  }, []);
  useEffect5(() => {
    void invoke3("booru:list-resources", { section: "media", limit: 80 }).then((result) => {
      setResources(Array.isArray(result?.items) ? result.items : []);
    }).catch(() => setResources([]));
  }, []);
  const pasteIcon = async () => {
    const tempFilePath = await window.nexus.clipboard.exportMediaToTempFile("booru-platform-icon");
    const result = await invoke3("booru:import-social-platform-icon", { tempFilePath });
    setIconResourceId(result?.resource?.id || "");
  };
  const savePlatform = async () => {
    const result = await invoke3("booru:save-social-platform", { displayName: platformName, iconResourceId: iconResourceId || null });
    if (result?.platform) {
      setPlatformName("");
      setIconResourceId("");
      await loadPlatforms();
    }
  };
  const importFileIcon = async (event) => {
    const file = event.target.files?.[0];
    if (!file?.path) return;
    const result = await invoke3("booru:import-social-platform-icon-file", { sourcePath: file.path });
    setIconResourceId(result?.resource?.id || "");
    event.target.value = "";
  };
  const deletePlatform = async (platform) => {
    const preview = await invoke3("booru:delete-social-platform", { platformId: platform.id });
    if (!preview?.affectedProfiles?.length || window.confirm(`Esta plataforma esta usada por: ${preview.affectedProfiles.map((item) => item.displayName).join(", ")}. Se eliminaran esos enlaces. Continuar?`)) {
      await invoke3("booru:delete-social-platform", { platformId: platform.id, confirmed: true });
      await loadPlatforms();
    }
  };
  return /* @__PURE__ */ React5.createElement("div", { className: "booruView__content booruView__content--metrics" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__metrics" }, /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Total", value: String(snapshot?.stats?.totalCount || 0), description: "Catalogo" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Pendientes", value: String(snapshot?.stats?.pendingCount || 0), description: "Cola real" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Duplicados", value: String(snapshot?.stats?.duplicateCount || 0), description: "Revision exacta" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Papelera", value: String(snapshot?.stats?.trashCount || 0), description: "Interna" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Basico", value: String(snapshot?.stats?.classifiedBasicCount || 0), description: "Completos" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Image", value: String(snapshot?.stats?.imageCount || 0), description: "Preview" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Video/GIF", value: String((snapshot?.stats?.videoCount || 0) + (snapshot?.stats?.gifCount || 0)), description: "Animados" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Thumbs ready", value: String(snapshot?.stats?.thumbnailReadyCount || 0), description: "Derivados listos" }), /* @__PURE__ */ React5.createElement(MetricCard, { eyebrow: "Thumbs backlog", value: String(snapshot?.stats?.thumbnailBacklogCount || 0), description: "Pendientes o error" })), /* @__PURE__ */ React5.createElement("div", { className: "booruView__metricsPanels" }, /* @__PURE__ */ React5.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__statusStack" }, /* @__PURE__ */ React5.createElement("span", { className: "booruView__groupLabel" }, "Ajustes"), /* @__PURE__ */ React5.createElement("div", { className: "booruView__settingsActions" }, /* @__PURE__ */ React5.createElement(Button, { type: "button", onClick: () => onOpenDuplicates?.() }, /* @__PURE__ */ React5.createElement("span", null, "Duplicados"), /* @__PURE__ */ React5.createElement("small", null, snapshot?.stats?.duplicateCount || 0)), /* @__PURE__ */ React5.createElement(Button, { type: "button", onClick: () => onOpenTrash?.() }, /* @__PURE__ */ React5.createElement("span", null, "Papelera"), /* @__PURE__ */ React5.createElement("small", null, snapshot?.stats?.trashCount || 0))), /* @__PURE__ */ React5.createElement("span", { className: "booruView__suggestionsHint" }, "La busqueda principal ahora compone chips de tags y filtros estructurados; no busca por filename."))), /* @__PURE__ */ React5.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__statusStack" }, /* @__PURE__ */ React5.createElement("span", { className: "booruView__groupLabel" }, "Plataformas de redes"), /* @__PURE__ */ React5.createElement(Field, { label: "Nueva plataforma", className: "booruView__field" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React5.createElement(Input, { value: platformName, onChange: (event) => setPlatformName(event.target.value), placeholder: "Nombre de la red" }), /* @__PURE__ */ React5.createElement(Button, { type: "button", onClick: () => void pasteIcon() }, "Pegar icono"), /* @__PURE__ */ React5.createElement("label", { className: "nexus-ui-button" }, /* @__PURE__ */ React5.createElement("span", null, "Elegir archivo"), /* @__PURE__ */ React5.createElement("input", { type: "file", accept: "image/png,image/svg+xml,image/*", onChange: (event) => void importFileIcon(event), hidden: true })), /* @__PURE__ */ React5.createElement(Button, { type: "button", tone: "primary", onClick: () => void savePlatform(), disabled: !platformName.trim() }, "Guardar"))), /* @__PURE__ */ React5.createElement(Field, { label: "O usar recurso existente", className: "booruView__field" }, /* @__PURE__ */ React5.createElement(Select, { value: iconResourceId, onChange: (event) => setIconResourceId(event.target.value) }, /* @__PURE__ */ React5.createElement("option", { value: "" }, "Sin icono"), resources.map((resource) => /* @__PURE__ */ React5.createElement("option", { key: resource.id, value: resource.id }, resource.originalFilename)))), iconResourceId ? /* @__PURE__ */ React5.createElement("span", { className: "booruView__suggestionsHint" }, "Icono preparado desde recurso ", iconResourceId.slice(0, 8), ".") : null, platformError ? /* @__PURE__ */ React5.createElement(Notice, { tone: "danger" }, platformError) : null, /* @__PURE__ */ React5.createElement("div", { className: "booruView__tagRow" }, platforms.length ? platforms.map((platform) => /* @__PURE__ */ React5.createElement("span", { key: platform.id, className: "booruView__selectionChip" }, /* @__PURE__ */ React5.createElement("span", null, platform.displayName, platform.profileCount ? ` (${platform.profileCount})` : ""), /* @__PURE__ */ React5.createElement("button", { type: "button", className: "booruView__selectionChipRemove", onClick: () => void deletePlatform(platform), "aria-label": `Eliminar ${platform.displayName}` }, "x"))) : /* @__PURE__ */ React5.createElement("span", { className: "booruView__suggestionsHint" }, "Todavia no hay plataformas registradas.")))), /* @__PURE__ */ React5.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__statusStack" }, /* @__PURE__ */ React5.createElement("span", { className: "booruView__groupLabel" }, "Watcher y runtime"), /* @__PURE__ */ React5.createElement(
    StateBlock,
    {
      title: snapshot?.watcher?.active ? "Watcher activo" : "Watcher inactivo",
      description: snapshot?.watcher?.watchedPath || "Todavia no hay carpeta vigilada configurada."
    }
  ), snapshot?.derivatives?.lastError ? /* @__PURE__ */ React5.createElement(Notice, { tone: "danger" }, snapshot.derivatives.lastError) : null, /* @__PURE__ */ React5.createElement("div", { className: "booruView__pathActions" }, /* @__PURE__ */ React5.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onRescan?.(),
      disabled: busyAction === "rescan"
    },
    "Releer carpeta"
  ), /* @__PURE__ */ React5.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onRestart?.(),
      disabled: busyAction === "restart"
    },
    "Reiniciar watcher"
  ), /* @__PURE__ */ React5.createElement(
    Button,
    {
      type: "button",
      onClick: () => void onRefresh?.(),
      disabled: loading
    },
    /* @__PURE__ */ React5.createElement(ReloadIcon, { size: 15 }),
    /* @__PURE__ */ React5.createElement("span", null, "Actualizar")
  ), /* @__PURE__ */ React5.createElement(
    Button,
    {
      type: "button",
      onClick: () => onOpenPath?.(snapshot?.storage?.root),
      disabled: !snapshot?.storage?.root
    },
    /* @__PURE__ */ React5.createElement(FolderIcon, { size: 15 }),
    /* @__PURE__ */ React5.createElement("span", null, "Ver storage")
  ), /* @__PURE__ */ React5.createElement(
    Button,
    {
      type: "button",
      onClick: () => onOpenPath?.(snapshot?.settings?.watchFolderPath),
      disabled: !snapshot?.settings?.watchFolderPath
    },
    /* @__PURE__ */ React5.createElement(FolderIcon, { size: 15 }),
    /* @__PURE__ */ React5.createElement("span", null, "Ver carpeta vigilada")
  )))), /* @__PURE__ */ React5.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__statusStack" }, /* @__PURE__ */ React5.createElement("span", { className: "booruView__groupLabel" }, "Python y storage"), /* @__PURE__ */ React5.createElement(
    StateBlock,
    {
      title: snapshot?.python?.available ? "Python disponible" : "Python no disponible",
      description: snapshot?.python?.available ? snapshot.python.resolvedExecutable || snapshot.python.command : snapshot?.python?.error || "Booru necesita Python para su pipeline interno."
    }
  ), /* @__PURE__ */ React5.createElement("div", { className: "booruView__runtimeMeta" }, /* @__PURE__ */ React5.createElement("span", null, "DB: ", snapshot?.storage?.catalogPath || "Sin catalogo"), /* @__PURE__ */ React5.createElement("span", null, "Media: ", snapshot?.storage?.mediaRoot || "Sin carpeta media"), /* @__PURE__ */ React5.createElement("span", null, "Duplicados: ", snapshot?.storage?.duplicatesRoot || "Sin carpeta duplicates"), /* @__PURE__ */ React5.createElement("span", null, "Thumbs: ", snapshot?.storage?.thumbsRoot || "Sin carpeta thumbs"), /* @__PURE__ */ React5.createElement("span", null, "Worker activos: ", snapshot?.derivatives?.activeCount || 0)))), /* @__PURE__ */ React5.createElement(SectionPanel, { className: "booruView__panel" }, /* @__PURE__ */ React5.createElement("div", { className: "booruView__statusStack booruView__syntaxGuide" }, /* @__PURE__ */ React5.createElement("span", { className: "booruView__groupLabel" }, "Sintaxis de busqueda"), /* @__PURE__ */ React5.createElement("p", { className: "booruView__syntaxGuideCopy" }, "Los terminos sueltos son tags. Tambien acepta prefijos tipados, negativos y un faltante publico a la vez."), /* @__PURE__ */ React5.createElement("div", { className: "booruView__syntaxExamples" }, [
    "jinx",
    "-artist:foo",
    "persona:ana",
    "reality:ficticio missing:artist",
    'universe:"Blue Archive"',
    'char:"Hatsune Miku"'
  ].map((example) => /* @__PURE__ */ React5.createElement("span", { key: example, className: "booruView__selectionChip booruView__selectionChip--syntax" }, example)))))));
}

// ../nexus-plugins/booru/src/components/entities/EntityGrid.jsx
init_define_process();

// ../nexus-plugins/booru/src/components/entities/EntityVisualMedia.jsx
init_define_process();
function EntityVisualMedia({
  visual,
  alt = "",
  fallback = null,
  MediaPreview
}) {
  const renderProps = getBooruEntityVisualRenderProps(visual);
  if (!renderProps) {
    return fallback;
  }
  return /* @__PURE__ */ React.createElement(
    MediaPreview,
    {
      ...renderProps,
      alt
    }
  );
}

// ../nexus-plugins/booru/src/components/shared/CollapsibleGalleryGroup.jsx
init_define_process();
var React6 = window.React;
var { useState: useState7 } = React6;
function CollapsibleGalleryGroup({ label, association = null, onAssociationHover, children }) {
  const [collapsed, setCollapsed] = useState7(false);
  return /* @__PURE__ */ React6.createElement(
    "section",
    {
      className: ["booruView__galleryGroup", collapsed ? "is-collapsed" : ""].filter(Boolean).join(" "),
      onPointerEnter: () => onAssociationHover?.(association),
      onPointerLeave: () => onAssociationHover?.(null)
    },
    /* @__PURE__ */ React6.createElement(
      Button,
      {
        type: "button",
        className: "booruView__galleryGroupHeader",
        "aria-expanded": !collapsed,
        onClick: () => setCollapsed((currentValue) => !currentValue)
      },
      /* @__PURE__ */ React6.createElement("span", { className: "booruView__galleryGroupChevron", "aria-hidden": "true" }),
      /* @__PURE__ */ React6.createElement("span", null, label),
      /* @__PURE__ */ React6.createElement("span", { className: "booruView__galleryGroupDivider", "aria-hidden": "true" })
    ),
    collapsed ? null : children
  );
}

// ../nexus-plugins/booru/src/components/entities/EntityGrid.jsx
var React7 = window.React;
var { useEffect: useEffect6, useMemo: useMemo2, useRef: useRef4 } = React7;
function EntityGrid({
  kind,
  items,
  placements = [],
  hasMore = false,
  loading = false,
  onLoadMore,
  emptyTitle,
  emptyDescription,
  onOpenEntity,
  onPreviewContextMenu,
  onEntityHover,
  MediaPreview,
  entityKindLabels,
  getInitials: getInitials2,
  embedded = false,
  columns = 5,
  onColumnsChange,
  onGroupAssociationHover,
  scrollKey,
  scrollTop = 0,
  onScrollStateChange
}) {
  const contentRef = useRef4(null);
  const groupedSections = useMemo2(() => {
    if (!Array.isArray(placements) || !placements.length) return [];
    const itemById = new Map(items.map((item) => [item.id, item]));
    const groups = [];
    const groupByKey = /* @__PURE__ */ new Map();
    placements.forEach((placement) => {
      const item = itemById.get(placement?.entityId);
      if (!item) return;
      const key = String(placement?.groupKey || "");
      if (!groupByKey.has(key)) {
        const group = { key, label: placement?.groupLabel || key, association: placement?.association || null, items: [] };
        groupByKey.set(key, group);
        groups.push(group);
      }
      groupByKey.get(key).items.push({ placement, item });
    });
    return groups;
  }, [items, placements]);
  useEffect6(() => {
    const node = contentRef.current;
    if (!node || embedded) return void 0;
    const frameId = window.requestAnimationFrame(() => {
      node.scrollTop = Math.max(0, Number(scrollTop) || 0);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [embedded, scrollKey, scrollTop]);
  const content = /* @__PURE__ */ React7.createElement(React7.Fragment, null, items.length ? /* @__PURE__ */ React7.createElement(
    "div",
    {
      ref: contentRef,
      className: "booruView__resourcePanelBody",
      onScroll: (event) => {
        if (!embedded) onScrollStateChange?.(event.currentTarget.scrollTop || 0);
        if (hasMore && !loading && event.currentTarget.scrollTop + event.currentTarget.clientHeight >= event.currentTarget.scrollHeight - 420) {
          onLoadMore?.();
        }
      }
    },
    groupedSections.length ? /* @__PURE__ */ React7.createElement("div", { className: "booruView__groupedGallery" }, groupedSections.map((group) => /* @__PURE__ */ React7.createElement(CollapsibleGalleryGroup, { key: group.key, label: group.label, association: group.association, onAssociationHover: onGroupAssociationHover }, /* @__PURE__ */ React7.createElement(
      GalleryGrid,
      {
        className: "booruView__entityGrid",
        columns,
        minColumns: 2,
        onColumnsChange
      },
      group.items.map(({ placement, item }) => /* @__PURE__ */ React7.createElement(EntityCard, { key: placement.placementId, item }))
    )))) : /* @__PURE__ */ React7.createElement(
      GalleryGrid,
      {
        className: "booruView__entityGrid",
        columns,
        minColumns: 2,
        onColumnsChange
      },
      items.map((item) => /* @__PURE__ */ React7.createElement(EntityCard, { key: item.id, item }))
    ),
    loading && items.length ? /* @__PURE__ */ React7.createElement("span", { className: "booruView__resourceLoadingMore" }, "Actualizando seccion...") : null
  ) : /* @__PURE__ */ React7.createElement(
    StateBlock,
    {
      centered: true,
      title: emptyTitle,
      description: emptyDescription
    }
  ));
  function EntityCard({ item }) {
    return /* @__PURE__ */ React7.createElement(
      GalleryCard,
      {
        as: "button",
        type: "button",
        className: "booruView__entityCard",
        onClick: () => onOpenEntity?.(kind, item),
        onPointerEnter: () => onEntityHover?.(kind, item),
        onPointerLeave: () => onEntityHover?.(null)
      },
      /* @__PURE__ */ React7.createElement(
        GalleryCardMedia,
        {
          className: "booruView__entityCardPreview",
          onContextMenu: (event) => onPreviewContextMenu?.(item, event)
        },
        /* @__PURE__ */ React7.createElement(
          EntityVisualMedia,
          {
            visual: item.visual,
            alt: item.displayName,
            MediaPreview,
            fallback: /* @__PURE__ */ React7.createElement("div", { className: "booruView__entityVisualFallback" }, /* @__PURE__ */ React7.createElement("span", null, getInitials2?.(item.displayName) || "?"))
          }
        )
      ),
      /* @__PURE__ */ React7.createElement(GalleryCardBody, { className: "booruView__entityCardBody" }, /* @__PURE__ */ React7.createElement(GalleryCardTitle, null, item.displayName), kind === "character" && item?.universe?.displayName ? /* @__PURE__ */ React7.createElement(GalleryCardMeta, { as: "div", className: "booruView__entityCardMeta" }, /* @__PURE__ */ React7.createElement("span", null, item.universe.displayName)) : null, /* @__PURE__ */ React7.createElement(GalleryCardMeta, { as: "div", className: "booruView__entityCardMeta" }, /* @__PURE__ */ React7.createElement("span", null, item.resourceCount, " recursos"), /* @__PURE__ */ React7.createElement("span", null, entityKindLabels[kind] || kind)))
    );
  }
  if (embedded) {
    return content;
  }
  return /* @__PURE__ */ React7.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, content);
}

// ../nexus-plugins/booru/src/components/entities/EntityNavigationBar.jsx
init_define_process();
function EntityNavigationBar({
  kind,
  contextLabel,
  profileOpen,
  searchValue,
  createValue,
  busy = false,
  searchable = true,
  searchContent = null,
  browseControls = null,
  onBack,
  onOpenInMedia,
  onSearchChange,
  onCreateChange,
  onCreate,
  entityKindLabels
}) {
  const kindLabel = entityKindLabels[kind] || kind || "Entidad";
  return /* @__PURE__ */ React.createElement("nav", { className: "booruView__entityNavbar", "aria-label": "Navegacion de entidades" }, /* @__PURE__ */ React.createElement("div", { className: "booruView__entityNavbarContext" }, profileOpen ? /* @__PURE__ */ React.createElement(Button, { type: "button", onClick: () => onBack?.() }, "Volver") : null, /* @__PURE__ */ React.createElement("div", { className: "booruView__entityNavbarTitle" }, /* @__PURE__ */ React.createElement("span", null, kindLabel), profileOpen && contextLabel ? /* @__PURE__ */ React.createElement("strong", null, contextLabel) : null), profileOpen ? /* @__PURE__ */ React.createElement(Button, { type: "button", onClick: () => onOpenInMedia?.() }, "Abrir en Media") : null), searchable ? searchContent || /* @__PURE__ */ React.createElement(InlineField, { label: "Buscar", grow: true, className: "booruView__entityNavbarSearch" }, /* @__PURE__ */ React.createElement(
    SearchField,
    {
      value: searchValue,
      onChange: (event) => onSearchChange?.(event.target.value),
      placeholder: profileOpen ? "Buscar en esta seccion" : `Buscar ${kindLabel.toLowerCase()}`,
      "aria-label": `Buscar ${kindLabel.toLowerCase()}`
    }
  )) : null, browseControls, /* @__PURE__ */ React.createElement("div", { className: "booruView__entityNavbarCreate" }, /* @__PURE__ */ React.createElement(InlineField, { label: "Crear", grow: true }, /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createValue,
      onChange: (event) => onCreateChange?.(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onCreate?.();
        }
      },
      placeholder: `Crear ${kindLabel.toLowerCase()}`,
      "aria-label": `Crear ${kindLabel.toLowerCase()}`
    }
  )), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: () => onCreate?.(),
      disabled: !String(createValue || "").trim() || busy
    },
    "Crear"
  )));
}

// ../nexus-plugins/booru/src/components/entities/EntityRelationsGrid.jsx
init_define_process();
var React8 = window.React;
var { useEffect: useEffect7, useRef: useRef5 } = React8;
function EntityRelationsGrid({
  kind,
  state,
  loading,
  onLoadMore,
  onOpenEntity,
  onPreviewContextMenu,
  EntityGrid: EntityGrid2,
  MediaPreview,
  entityKindLabels,
  getInitials: getInitials2,
  columns,
  onColumnsChange,
  onEntityHover,
  onGroupAssociationHover
}) {
  const sentinelRef = useRef5(null);
  const items = Array.isArray(state?.items) ? state.items : [];
  useEffect7(() => {
    if (!state?.hasMore || loading || !sentinelRef.current || typeof IntersectionObserver !== "function") {
      return void 0;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
    }, { rootMargin: "420px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, onLoadMore, state?.hasMore]);
  if (loading && !items.length) {
    return /* @__PURE__ */ React8.createElement(StateBlock, { centered: true, title: "Cargando relaciones", description: "Leyendo perfiles relacionados desde Booru." });
  }
  return /* @__PURE__ */ React8.createElement("div", { className: "booruView__entityRelations" }, /* @__PURE__ */ React8.createElement(
    EntityGrid2,
    {
      embedded: true,
      kind,
      items,
      placements: Array.isArray(state?.placements) ? state.placements : [],
      emptyTitle: "Sin relaciones",
      emptyDescription: "No hay perfiles relacionados para esta consulta.",
      onOpenEntity,
      onPreviewContextMenu,
      MediaPreview,
      entityKindLabels,
      getInitials: getInitials2,
      columns,
      onColumnsChange,
      onEntityHover,
      onGroupAssociationHover
    }
  ), state?.hasMore ? /* @__PURE__ */ React8.createElement("div", { ref: sentinelRef, className: "booruView__resourceLoadSentinel", "aria-hidden": "true" }) : null, loading && items.length ? /* @__PURE__ */ React8.createElement("span", { className: "booruView__resourceLoadingMore" }, "Cargando mas perfiles...") : null);
}

// ../nexus-plugins/booru/src/components/entities/EntityProfileGallery.jsx
init_define_process();

// ../nexus-plugins/booru/src/domain/video-preview-policy.js
init_define_process();
var BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS = 15e3;
var BOORU_VIDEO_SHORT_VARIANT = "first-15s-muted-v2";
function resolveBooruVideoAutoplay({
  mediaKind,
  durationMs,
  autoplayStoragePath,
  videoShortStatus,
  videoShortVariant
} = {}) {
  if (mediaKind !== "video") return { autoplay: false, autoplayPath: "", source: "none" };
  const hasDuration = durationMs !== null && durationMs !== void 0 && durationMs !== "";
  const duration = Number(durationMs);
  if (hasDuration && Number.isFinite(duration) && duration >= 0 && duration <= BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS) {
    return { autoplay: true, autoplayPath: "", source: "original" };
  }
  const shortPath = String(autoplayStoragePath || "").trim();
  const validShort = shortPath && String(videoShortStatus || "").trim() === "ready" && String(videoShortVariant || "").trim() === BOORU_VIDEO_SHORT_VARIANT;
  return validShort ? { autoplay: true, autoplayPath: shortPath, source: "derivative" } : { autoplay: false, autoplayPath: "", source: "pending" };
}

// ../nexus-plugins/booru/src/components/entities/EntityProfileGallery.jsx
var React9 = window.React;
var { useEffect: useEffect8, useMemo: useMemo3, useRef: useRef6, useState: useState8 } = React9;
function EntityProfileGalleryGrid({
  items,
  placements = [],
  loading,
  hasMore = false,
  onLoadMore,
  onOpenResource,
  onContextMenu,
  MediaPreview,
  canUseVisual,
  resourceGridColumns,
  selectedIds,
  onSelectionChange,
  onColumnsChange,
  onGroupAssociationHover
}) {
  const sentinelRef = useRef6(null);
  const [localSelectedIds, setLocalSelectedIds] = useState8([]);
  const activeSelectedIds = Array.isArray(selectedIds) ? selectedIds : localSelectedIds;
  const setActiveSelectedIds = (updater) => {
    const nextValue = typeof updater === "function" ? updater(activeSelectedIds) : updater;
    if (typeof onSelectionChange === "function") onSelectionChange(nextValue);
    else setLocalSelectedIds(nextValue);
  };
  const groupedSections = useMemo3(() => {
    if (!Array.isArray(placements) || !placements.length) return [];
    const itemById = new Map(items.map((item) => [item.id, item]));
    const groups = [];
    const groupByKey = /* @__PURE__ */ new Map();
    placements.forEach((placement) => {
      const item = itemById.get(placement?.resourceId);
      if (!item) return;
      const key = String(placement?.groupKey || "");
      if (!groupByKey.has(key)) {
        const group = { key, label: placement?.groupLabel || key, association: placement?.association || null, entries: [] };
        groupByKey.set(key, group);
        groups.push(group);
      }
      groupByKey.get(key).entries.push({ placement, item });
    });
    return groups;
  }, [items, placements]);
  useEffect8(() => {
    const availableIds = new Set(items.map((item) => item.id));
    setActiveSelectedIds((current) => current.filter((id) => availableIds.has(id)));
  }, [items]);
  useEffect8(() => {
    if (!hasMore || loading || !sentinelRef.current || typeof IntersectionObserver !== "function") return void 0;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
    }, { rootMargin: "520px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);
  if (loading && !items.length) {
    return /* @__PURE__ */ React9.createElement(StateBlock, { centered: true, title: "Cargando galeria", description: "Leyendo recursos consumidores desde Booru." });
  }
  if (!items.length) {
    return /* @__PURE__ */ React9.createElement(StateBlock, { centered: true, title: "Sin recursos todavia", description: "Cuando esta entidad consuma media real, aparecera aqui. Ctrl/Cmd+V pega una imagen del portapapeles y la asigna a este perfil." });
  }
  const renderCard = (item, absoluteIndex, key) => {
    const videoAutoplay = resolveBooruVideoAutoplay(item);
    return /* @__PURE__ */ React9.createElement(
      GalleryCard,
      {
        as: "div",
        key,
        interactive: true,
        selected: activeSelectedIds.includes(item.id),
        className: [
          "booruView__mediaCard",
          "booruView__mediaCard--static",
          canUseVisual(item) ? "booruView__mediaCard--contextual" : "",
          activeSelectedIds.includes(item.id) ? "is-multi-selected" : ""
        ].filter(Boolean).join(" "),
        role: "button",
        tabIndex: 0,
        onClick: (event) => {
          if (event.ctrlKey || event.metaKey) {
            setActiveSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
            return;
          }
          onOpenResource?.(item, items);
        },
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenResource?.(item, items);
          }
        },
        onContextMenu: (event) => {
          const contextIds = activeSelectedIds.includes(item.id) ? activeSelectedIds : [item.id];
          if (!activeSelectedIds.includes(item.id)) setActiveSelectedIds([item.id]);
          onContextMenu?.(item, event, contextIds);
        }
      },
      /* @__PURE__ */ React9.createElement(GalleryCardMedia, { className: "booruView__mediaCardPreview" }, /* @__PURE__ */ React9.createElement(
        MediaPreview,
        {
          pathValue: item.storagePath,
          mediaKind: item.mediaKind,
          alt: item.originalFilename,
          thumbnail: item.thumbnail,
          highPriority: absoluteIndex < resourceGridColumns,
          preferOriginalWhenThumbnailMissing: true,
          autoplay: videoAutoplay.autoplay,
          loop: item.mediaKind === "video",
          autoplayPath: videoAutoplay.autoplayPath,
          hoverPlayable: item.mediaKind === "gif"
        }
      ))
    );
  };
  return /* @__PURE__ */ React9.createElement("div", { className: "booruView__entityProfileGallery" }, groupedSections.length ? /* @__PURE__ */ React9.createElement("div", { className: "booruView__groupedGallery" }, groupedSections.map((group) => /* @__PURE__ */ React9.createElement(CollapsibleGalleryGroup, { key: group.key, label: group.label, association: group.association, onAssociationHover: onGroupAssociationHover }, /* @__PURE__ */ React9.createElement(
    GalleryGrid,
    {
      className: "booruView__mediaGrid",
      columns: resourceGridColumns,
      minColumns: 2,
      onColumnsChange
    },
    group.entries.map(({ placement, item }, index) => renderCard(item, index, placement.placementId))
  )))) : /* @__PURE__ */ React9.createElement(
    GalleryGrid,
    {
      className: "booruView__mediaGrid booruView__mediaGrid--infinite",
      columns: resourceGridColumns,
      minColumns: 2,
      onColumnsChange
    },
    items.map((item, index) => renderCard(item, index, item.id))
  ), hasMore ? /* @__PURE__ */ React9.createElement("div", { ref: sentinelRef, className: "booruView__resourceLoadSentinel", "aria-hidden": "true" }) : null, loading && items.length ? /* @__PURE__ */ React9.createElement("span", { className: "booruView__resourceLoadingMore" }, "Cargando mas recursos...") : null);
}

// ../nexus-plugins/booru/src/components/media/ResourceHeroOverlay.jsx
init_define_process();
var React10 = window.React;
var { useEffect: useEffect9 } = React10;
function ResourceHeroOverlay({
  item,
  index = 0,
  totalCount = 0,
  onClose,
  onPrev,
  onNext,
  MediaPreview,
  mediaKindLabels
}) {
  useEffect9(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);
  useEffect9(() => {
    if (!item || item.mediaKind !== "video") return void 0;
    const pausedByHero = Array.from(document.querySelectorAll("video:not(.booruView__heroMedia)")).filter((video) => !video.paused).map((video) => {
      video.pause();
      return video;
    });
    return () => {
      pausedByHero.forEach((video) => void video.play().catch(() => void 0));
    };
  }, [item?.id, item?.mediaKind]);
  if (!item) return null;
  return /* @__PURE__ */ React10.createElement("div", { className: "booruView__heroOverlay", onClick: () => onClose?.() }, /* @__PURE__ */ React10.createElement("div", { className: "booruView__heroShell", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React10.createElement("button", { type: "button", className: "booruView__heroNav booruView__heroNav--prev", onClick: () => onPrev?.(), "aria-label": "Recurso anterior" }, "<"), /* @__PURE__ */ React10.createElement("div", { className: "booruView__heroStage" }, /* @__PURE__ */ React10.createElement(
    MediaPreview,
    {
      pathValue: item.storagePath,
      mediaKind: item.mediaKind,
      alt: item.originalFilename,
      controls: item.mediaKind === "video",
      autoplay: item.mediaKind === "video",
      loop: item.mediaKind === "video",
      forceOriginal: true,
      preferOriginalWhenThumbnailMissing: true,
      objectFit: "contain",
      className: "booruView__heroMedia"
    }
  ), /* @__PURE__ */ React10.createElement("div", { className: "booruView__heroMeta" }, /* @__PURE__ */ React10.createElement("strong", null, item.originalFilename), /* @__PURE__ */ React10.createElement("span", null, mediaKindLabels[item.mediaKind] || item.mediaKind, " \xB7 ", index + 1, " / ", Math.max(1, totalCount)))), /* @__PURE__ */ React10.createElement("button", { type: "button", className: "booruView__heroNav booruView__heroNav--next", onClick: () => onNext?.(), "aria-label": "Siguiente recurso" }, ">")));
}

// ../nexus-plugins/booru/src/components/resources/FloatingDetailsWindow.jsx
init_define_process();
var React11 = window.React;
var { useEffect: useEffect10, useRef: useRef7 } = React11;
function getViewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}
function FloatingDetailsWindow({ geometry, onGeometryChange, onClose, children }) {
  const dragRef = useRef7(null);
  useEffect10(() => {
    const handleResize = () => onGeometryChange?.(clampBooruFloatingDetailsGeometry(geometry, getViewport()));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [geometry, onGeometryChange]);
  const startPointerOperation = (event, mode) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      geometry
    };
  };
  const movePointerOperation = (event) => {
    const operation = dragRef.current;
    if (!operation || operation.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - operation.clientX;
    const deltaY = event.clientY - operation.clientY;
    const nextGeometry = operation.mode === "resize" ? { ...operation.geometry, width: operation.geometry.width + deltaX, height: operation.geometry.height + deltaY } : { ...operation.geometry, x: operation.geometry.x + deltaX, y: operation.geometry.y + deltaY };
    onGeometryChange?.(clampBooruFloatingDetailsGeometry(nextGeometry, getViewport()));
  };
  const finishPointerOperation = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  return /* @__PURE__ */ React11.createElement(
    "aside",
    {
      className: "booruView__floatingDetails",
      "aria-label": "Detalles del recurso",
      style: { left: geometry.x, top: geometry.y, width: geometry.width, height: geometry.height }
    },
    /* @__PURE__ */ React11.createElement(
      "div",
      {
        className: "booruView__floatingDetailsBar",
        onPointerDown: (event) => startPointerOperation(event, "move"),
        onPointerMove: movePointerOperation,
        onPointerUp: finishPointerOperation,
        onPointerCancel: finishPointerOperation
      },
      /* @__PURE__ */ React11.createElement("strong", null, "Detalles"),
      /* @__PURE__ */ React11.createElement(Button, { type: "button", onPointerDown: (event) => event.stopPropagation(), onClick: onClose }, "Cerrar")
    ),
    /* @__PURE__ */ React11.createElement("div", { className: "booruView__floatingDetailsContent" }, children),
    /* @__PURE__ */ React11.createElement(
      "div",
      {
        className: "booruView__floatingDetailsResize",
        role: "separator",
        "aria-label": "Redimensionar detalles",
        tabIndex: -1,
        onPointerDown: (event) => startPointerOperation(event, "resize"),
        onPointerMove: movePointerOperation,
        onPointerUp: finishPointerOperation,
        onPointerCancel: finishPointerOperation,
        style: { minWidth: BOORU_FLOATING_DETAILS_MIN_WIDTH, minHeight: BOORU_FLOATING_DETAILS_MIN_HEIGHT }
      }
    )
  );
}

// ../nexus-plugins/booru/src/components/shared/FloatingContextMenu.jsx
init_define_process();
function FloatingContextMenu({ state, onClose, onAction }) {
  if (!state?.items?.length) return null;
  return /* @__PURE__ */ React.createElement(
    ActionMenu,
    {
      ariaLabel: "Acciones de Booru",
      groups: [{ id: "booru-actions", items: state.items }],
      x: state.x,
      y: state.y,
      onAction: (action) => onAction?.(action.id),
      onClose
    }
  );
}

// ../nexus-plugins/booru/src/components/shared/ContextBrowseControls.jsx
init_define_process();
function ContextBrowseControls({
  value,
  options,
  groupOptions = [],
  groupOrderOptions = [],
  onChange,
  onRegenerateRandom,
  compact = false
}) {
  const directionLabel = value?.direction === "desc" ? "Decreciente" : "Creciente";
  const random = value?.sortBy === "random";
  const hasResourceGrouping = groupOptions.length > 0;
  const resourceSectioned = value?.grouping === "sectioned" && hasResourceGrouping;
  return /* @__PURE__ */ React.createElement("div", { className: ["booruView__browseControls", compact ? "is-compact" : ""].filter(Boolean).join(" ") }, resourceSectioned ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { className: "booruView__browseField" }, /* @__PURE__ */ React.createElement("span", null, "Agrupar por"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: value?.groupBy || "importedAt",
      onChange: (event) => onChange?.({ ...value, groupBy: event.target.value }),
      "aria-label": "Criterio de agrupaci\xF3n"
    },
    groupOptions.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.value, value: option.value }, option.label))
  )), /* @__PURE__ */ React.createElement("label", { className: "booruView__browseField" }, /* @__PURE__ */ React.createElement("span", null, "Ordenar grupos"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: value?.groupOrderBy || "importedAt",
      onChange: (event) => onChange?.({ ...value, groupOrderBy: event.target.value }),
      "aria-label": "Criterio de orden de grupos"
    },
    groupOrderOptions.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.value, value: option.value }, option.label))
  ))) : /* @__PURE__ */ React.createElement("label", { className: "booruView__browseField" }, /* @__PURE__ */ React.createElement("span", null, "Ordenar"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: value?.sortBy || "",
      onChange: (event) => {
        const sortBy = event.target.value;
        onChange?.({
          ...value,
          sortBy,
          ...!hasResourceGrouping && value?.grouping === "sectioned" && sortBy !== "random" ? { groupBy: sortBy } : {}
        });
      },
      "aria-label": "Criterio de orden"
    },
    (Array.isArray(options) ? options : []).map((option) => /* @__PURE__ */ React.createElement("option", { key: option.value, value: option.value }, option.label))
  )), /* @__PURE__ */ React.createElement("span", { className: "booruView__browseTooltipHost" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      className: "booruView__browseDirection",
      "aria-label": directionLabel,
      onClick: () => onChange?.({
        ...value,
        direction: value?.direction === "desc" ? "asc" : "desc"
      })
    },
    /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, value?.direction === "desc" ? "\u2193" : "\u2191")
  ), /* @__PURE__ */ React.createElement("span", { className: "booruView__browseTooltip", role: "tooltip" }, directionLabel)), random && !resourceSectioned ? /* @__PURE__ */ React.createElement("span", { className: "booruView__browseTooltipHost" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      className: "booruView__browseDirection",
      "aria-label": "Volver a mezclar",
      onClick: () => onRegenerateRandom?.()
    },
    /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u21BB")
  ), /* @__PURE__ */ React.createElement("span", { className: "booruView__browseTooltip", role: "tooltip" }, "Volver a mezclar")) : null, /* @__PURE__ */ React.createElement(
    SegmentedControl,
    {
      className: "booruView__browseGrouping",
      variant: "compact",
      options: [
        { value: "continuous", label: "Continuo" },
        { value: "sectioned", label: "Seccionado" }
      ],
      value: random ? "continuous" : value?.grouping || "continuous",
      onChange: (grouping) => onChange?.({
        ...value,
        grouping,
        ...!hasResourceGrouping && grouping === "sectioned" ? { groupBy: value?.sortBy } : {}
      }),
      disabled: random,
      ariaLabel: "Modo de agrupacion"
    }
  ));
}

// ../nexus-plugins/booru/src/components/media/BooruDragPreviewLayer.jsx
init_define_process();
var React12 = window.React;
var { useMemo: useMemo4 } = React12;
function BooruDragPreviewLayer({ resourcesById, customDragState = null, MediaPreview, getPreviewStyles, resolveDragIds, useDragLayer: useDragLayer2, dndType }) {
  if (customDragState?.active) {
    const primaryResource = resourcesById.get(customDragState.primaryId) || customDragState.primaryResource || null;
    return /* @__PURE__ */ React12.createElement("div", { className: "booruView__dragPreviewLayer" }, /* @__PURE__ */ React12.createElement(
      "div",
      {
        className: [
          "booruView__dragPreview",
          customDragState.resourceIds?.length > 1 ? "is-multi" : ""
        ].filter(Boolean).join(" "),
        style: getPreviewStyles({
          x: customDragState.x,
          y: customDragState.y
        })
      },
      /* @__PURE__ */ React12.createElement("div", { className: "booruView__dragPreviewThumb" }, primaryResource ? /* @__PURE__ */ React12.createElement(
        MediaPreview,
        {
          pathValue: primaryResource.storagePath,
          mediaKind: primaryResource.mediaKind,
          alt: primaryResource.originalFilename,
          thumbnail: primaryResource.thumbnail,
          preferOriginalWhenThumbnailMissing: true
        }
      ) : /* @__PURE__ */ React12.createElement("div", { className: "booruView__previewFallback" }, "Media")),
      /* @__PURE__ */ React12.createElement("div", { className: "booruView__dragPreviewCopy" }, /* @__PURE__ */ React12.createElement("span", null, primaryResource?.originalFilename || "Moviendo recurso"), /* @__PURE__ */ React12.createElement("small", null, customDragState.overTarget?.label ? `Soltar en ${customDragState.overTarget.label}` : customDragState.resourceIds?.length > 1 ? `${customDragState.resourceIds.length} recursos` : "Arrastra hacia una asignacion rapida"))
    ));
  }
  const dragLayerState = useDragLayer2((monitor) => ({
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem()
  }));
  const dragSummary = useMemo4(() => {
    const draggedIds = resolveDragIds(dragLayerState.item);
    if (!draggedIds.length) {
      return null;
    }
    const primaryId = String(dragLayerState.item?.primaryId || draggedIds[0] || "").trim();
    const primaryResource = resourcesById.get(primaryId) || resourcesById.get(draggedIds[0]) || null;
    return {
      count: draggedIds.length,
      label: primaryResource?.originalFilename || "Moviendo recurso",
      primaryResource
    };
  }, [dragLayerState.item, resourcesById]);
  if (!dragLayerState.isDragging || dragLayerState.itemType !== dndType || !dragSummary) {
    return null;
  }
  return /* @__PURE__ */ React12.createElement("div", { className: "booruView__dragPreviewLayer" }, /* @__PURE__ */ React12.createElement(
    "div",
    {
      className: [
        "booruView__dragPreview",
        dragSummary.count > 1 ? "is-multi" : ""
      ].filter(Boolean).join(" "),
      style: getPreviewStyles(dragLayerState.currentOffset)
    },
    /* @__PURE__ */ React12.createElement("div", { className: "booruView__dragPreviewThumb" }, dragSummary.primaryResource ? /* @__PURE__ */ React12.createElement(
      MediaPreview,
      {
        pathValue: dragSummary.primaryResource.storagePath,
        mediaKind: dragSummary.primaryResource.mediaKind,
        alt: dragSummary.primaryResource.originalFilename,
        thumbnail: dragSummary.primaryResource.thumbnail,
        preferOriginalWhenThumbnailMissing: true
      }
    ) : /* @__PURE__ */ React12.createElement("div", { className: "booruView__previewFallback" }, "Media")),
    /* @__PURE__ */ React12.createElement("div", { className: "booruView__dragPreviewCopy" }, /* @__PURE__ */ React12.createElement("span", null, dragSummary.label), dragSummary.count > 1 ? /* @__PURE__ */ React12.createElement("small", null, dragSummary.count, " recursos") : null)
  ));
}

// ../nexus-plugins/booru/src/components/media/MediaThumbnail.jsx
init_define_process();
var React13 = window.React;
var { useEffect: useEffect11, useRef: useRef8, useState: useState9 } = React13;
function MediaThumbnail({
  pathValue,
  mediaKind,
  alt = "",
  className = "",
  controls = false,
  autoplay = false,
  loop = false,
  large = false,
  thumbnail = null,
  highPriority = false,
  preferOriginalWhenThumbnailMissing = true,
  forceOriginal = false,
  hoverPlayable = false,
  mediaStyle = null,
  objectFit = "",
  autoplayPath = "",
  toFileUrl: toFileUrl3,
  logger,
  mediaKindLabels
}) {
  const originalUrl = toFileUrl3(pathValue);
  const autoplayUrl = toFileUrl3(autoplayPath);
  const isAnimatedImage = mediaKind === "gif" || /\.webp(?:$|[?#])/i.test(String(pathValue || ""));
  const [hoverActive, setHoverActive] = useState9(false);
  const hoverTimerRef = useRef8(0);
  const thumbnailUrl = !controls && thumbnail?.status === "ready" ? toFileUrl3(thumbnail?.storagePath) : "";
  const canUseOriginalPreview = preferOriginalWhenThumbnailMissing && mediaKind !== "video";
  const shouldUseOriginal = forceOriginal || isAnimatedImage || hoverActive && hoverPlayable && mediaKind !== "video";
  const imageUrl = controls || shouldUseOriginal ? originalUrl : thumbnailUrl || (canUseOriginalPreview ? originalUrl : "");
  const pendingThumbnail = !controls && !thumbnailUrl && !canUseOriginalPreview && (!thumbnail || thumbnail?.status === "pending");
  const erroredThumbnail = !controls && thumbnail?.status === "error";
  const lastErrorSignatureRef = useRef8("");
  const previewSource = controls || shouldUseOriginal ? mediaKind === "video" ? "original-video" : "original-image" : thumbnailUrl ? "thumbnail" : canUseOriginalPreview ? "original-fallback" : "placeholder";
  const resolvedMediaStyle = {
    ...objectFit ? { objectFit } : {},
    ...mediaStyle && typeof mediaStyle === "object" ? mediaStyle : {}
  };
  useEffect11(() => () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }
  }, []);
  const startHoverPreview = () => {
    if (!hoverPlayable || mediaKind === "video" || controls || hoverTimerRef.current || hoverActive) {
      return;
    }
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = 0;
      setHoverActive(true);
    }, 1e3);
  };
  const stopHoverPreview = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }
    setHoverActive(false);
  };
  const handlePreviewError = (failedUrl) => {
    const normalizedUrl = String(failedUrl || "").trim();
    const signature = [
      mediaKind,
      previewSource,
      controls ? "interactive" : "card",
      normalizedUrl,
      String(thumbnail?.status || ""),
      String(pathValue || "")
    ].join("|");
    if (lastErrorSignatureRef.current === signature) {
      return;
    }
    lastErrorSignatureRef.current = signature;
    logger.info(
      "booru.media-preview.error",
      "Booru detecto un fallo de carga en una preview de media.",
      {
        mediaKind,
        previewSource,
        controls,
        large,
        sourceUrl: normalizedUrl || null,
        originalPath: String(pathValue || "").trim() || null,
        thumbnailStatus: String(thumbnail?.status || "").trim() || null,
        thumbnailPath: String(thumbnail?.storagePath || "").trim() || null
      }
    );
  };
  if ((controls || autoplay) && mediaKind === "video" && originalUrl) {
    return /* @__PURE__ */ React13.createElement(
      "video",
      {
        className: [
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className
        ].filter(Boolean).join(" "),
        src: !controls && autoplay && autoplayUrl ? autoplayUrl : originalUrl,
        style: resolvedMediaStyle,
        muted: !controls || autoplay,
        playsInline: true,
        preload: controls ? "metadata" : "auto",
        autoPlay: autoplay,
        loop: loop || autoplay,
        controls,
        onError: () => handlePreviewError(originalUrl),
        onPointerEnter: startHoverPreview,
        onPointerLeave: stopHoverPreview
      }
    );
  }
  if (imageUrl) {
    return /* @__PURE__ */ React13.createElement(
      "img",
      {
        className: [
          "booruView__previewMedia",
          controls ? "is-interactive" : "",
          className
        ].filter(Boolean).join(" "),
        src: imageUrl,
        style: resolvedMediaStyle,
        alt,
        loading: controls ? void 0 : "lazy",
        decoding: controls ? void 0 : "async",
        fetchPriority: highPriority ? "high" : "low",
        draggable: "false",
        onError: () => handlePreviewError(imageUrl),
        onPointerEnter: startHoverPreview,
        onPointerLeave: stopHoverPreview
      }
    );
  }
  if (pendingThumbnail) {
    return /* @__PURE__ */ React13.createElement("div", { className: ["booruView__previewPlaceholder", large ? "is-large" : "", className].filter(Boolean).join(" ") }, /* @__PURE__ */ React13.createElement("span", { className: "booruView__previewPlaceholderShimmer" }));
  }
  return /* @__PURE__ */ React13.createElement("div", { className: ["booruView__previewFallback", large ? "is-large" : "", className].filter(Boolean).join(" ") }, /* @__PURE__ */ React13.createElement("span", null, erroredThumbnail ? "Preview" : mediaKindLabels[mediaKind] || "Media"));
}

// ../nexus-plugins/booru/src/components/search/ResourceSearchComposer.jsx
init_define_process();
var React14 = window.React;
var { useCallback: useCallback2, useEffect: useEffect12, useMemo: useMemo5, useState: useState10 } = React14;
function ResourceSearchComposer({
  tokens,
  onChange,
  freeText = "",
  onFreeTextChange,
  disabled = false,
  helpers,
  invoke: invoke7,
  realitySuggestions,
  missingSuggestions,
  allowedKinds = null
}) {
  const { normalizeResourceSearchTokens: normalizeResourceSearchTokens2, buildResourceSearchTokenKey: buildResourceSearchTokenKey2, parseResourceSearchDraft: parseResourceSearchDraft2, normalizeSearchText: normalizeSearchText2, normalizeResourceSearchToken: normalizeResourceSearchToken2, createResourceSearchTokenFromSuggestion: createResourceSearchTokenFromSuggestion2, getResourceQueryTokenClass: getResourceQueryTokenClass2, buildResourceQueryTokenLabel: buildResourceQueryTokenLabel2, stepSuggestionIndex: stepSuggestionIndex2 } = helpers;
  const [suggestions, setSuggestions] = useState10([]);
  const [loading, setLoading] = useState10(false);
  const [error, setError] = useState10("");
  const [highlightedIndex, setHighlightedIndex] = useState10(-1);
  const tokensSignature = useMemo5(
    () => normalizeResourceSearchTokens2(tokens).map((token) => buildResourceSearchTokenKey2(token)).join("|"),
    [tokens]
  );
  const draftValue = useMemo5(() => {
    const matches = String(freeText || "").match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
    return matches.at(-1) || "";
  }, [freeText]);
  const parsedDraft = useMemo5(
    () => parseResourceSearchDraft2(draftValue),
    [draftValue]
  );
  useEffect12(() => {
    let cancelled = false;
    const queryValue = String(parsedDraft?.value || "").trim();
    if (!String(parsedDraft?.raw || "").trim()) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    if (parsedDraft.mode === "reality") {
      const nextSuggestions = realitySuggestions.filter((item) => !queryValue || normalizeSearchText2(item.label).includes(normalizeSearchText2(queryValue)));
      setSuggestions(nextSuggestions);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }
    if (parsedDraft.mode === "missing") {
      const nextSuggestions = missingSuggestions.filter((item) => {
        if (!queryValue) {
          return true;
        }
        return normalizeSearchText2(item.label).includes(normalizeSearchText2(queryValue)) || String(item.value || "").includes(normalizeSearchText2(queryValue));
      });
      setSuggestions(nextSuggestions);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }
    if (!queryValue) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    const isExplicitTag = parsedDraft.mode === "tag" && /^(?:-?tag:)/i.test(String(parsedDraft.raw || ""));
    const activeReality = normalizeResourceSearchTokens2(tokens).find((token) => token?.type === "reality" && !token?.negative)?.value || null;
    const nextPromise = parsedDraft.mode === "entity" && parsedDraft.kind ? invoke7("booru:list-entities", {
      kind: parsedDraft.kind,
      query: queryValue
    }) : isExplicitTag ? invoke7("booru:list-tags", { query: queryValue }) : invoke7("booru:list-search-suggestions", { query: queryValue, reality: activeReality, allowedKinds });
    void nextPromise.then((data) => {
      if (cancelled) {
        return;
      }
      if (parsedDraft.mode === "entity") {
        setSuggestions(
          (Array.isArray(data?.items) ? data.items : []).map((item) => ({
            id: `entity:${parsedDraft.kind}:${item.id}`,
            type: "entity",
            kind: parsedDraft.kind,
            entityId: item.id,
            label: item.displayName,
            detail: `${item.resourceCount} recursos`
          }))
        );
      } else if (isExplicitTag) {
        setSuggestions(
          (Array.isArray(data?.items) ? data.items : []).map((item) => ({
            id: `tag:${item.id}`,
            type: "tag",
            tagId: item.id,
            label: item.name,
            detail: `${item.resourceCount} recursos`
          }))
        );
      } else {
        setSuggestions(Array.isArray(data?.items) ? data.items : []);
      }
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar sugerencias."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [allowedKinds, invoke7, missingSuggestions, parsedDraft, realitySuggestions, tokensSignature]);
  useEffect12(() => {
    setHighlightedIndex(-1);
  }, [suggestions, draftValue]);
  const handleCommitToken = useCallback2((nextToken) => {
    const normalizedToken = normalizeResourceSearchToken2(nextToken);
    if (!normalizedToken) {
      return false;
    }
    onChange?.(normalizeResourceSearchTokens2([
      ...Array.isArray(tokens) ? tokens : [],
      normalizedToken
    ]));
    const source = String(freeText || "");
    const fragmentIndex = source.lastIndexOf(draftValue);
    const nextFreeText = fragmentIndex >= 0 ? `${source.slice(0, fragmentIndex)}${source.slice(fragmentIndex + draftValue.length)}`.trim().replace(/\s+/g, " ") : source;
    onFreeTextChange?.(nextFreeText);
    setSuggestions([]);
    setHighlightedIndex(-1);
    setError("");
    return true;
  }, [draftValue, freeText, onChange, onFreeTextChange, tokens]);
  const handleCommitRawToken = useCallback2((rawToken, suggestion) => {
    const nextToken = suggestion ? createResourceSearchTokenFromSuggestion2(rawToken, suggestion) : null;
    return handleCommitToken(nextToken);
  }, [handleCommitToken]);
  const handleChange = (event) => {
    onFreeTextChange?.(String(event.target.value || ""));
    setError("");
  };
  return /* @__PURE__ */ React14.createElement("div", { className: "booruView__searchComposer" }, normalizeResourceSearchTokens2(tokens).length ? /* @__PURE__ */ React14.createElement("div", { className: "booruView__searchCriteria" }, /* @__PURE__ */ React14.createElement("span", { className: "booruView__groupLabel" }, "Buscando"), /* @__PURE__ */ React14.createElement("div", { className: "booruView__entitySelection booruView__entitySelection--composer" }, normalizeResourceSearchTokens2(tokens).map((token) => /* @__PURE__ */ React14.createElement(
    "span",
    {
      key: buildResourceSearchTokenKey2(token),
      className: ["booruView__selectionChip", getResourceQueryTokenClass2(token)].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ React14.createElement("span", null, buildResourceQueryTokenLabel2(token)),
    /* @__PURE__ */ React14.createElement(
      "button",
      {
        type: "button",
        className: "booruView__selectionChipRemove",
        onClick: () => {
          onChange?.(
            normalizeResourceSearchTokens2(tokens).filter(
              (item) => buildResourceSearchTokenKey2(item) !== buildResourceSearchTokenKey2(token)
            )
          );
        },
        "aria-label": `Quitar token ${buildResourceQueryTokenLabel2(token)}`,
        disabled
      },
      "x"
    )
  )))) : null, /* @__PURE__ */ React14.createElement("div", { className: "booruView__searchComposerShell" }, /* @__PURE__ */ React14.createElement("div", { className: "booruView__entitySelection booruView__entitySelection--composer" }, /* @__PURE__ */ React14.createElement(
    SearchField,
    {
      value: freeText,
      onChange: handleChange,
      onKeyDown: (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, -1));
          return;
        }
        if (event.key === "Escape") {
          onFreeTextChange?.("");
          setSuggestions([]);
          setHighlightedIndex(-1);
          return;
        }
        if (event.key === "Backspace" && !String(freeText || "").trim()) {
          const normalizedTokens = normalizeResourceSearchTokens2(tokens);
          if (!normalizedTokens.length) {
            return;
          }
          event.preventDefault();
          onChange?.(normalizedTokens.slice(0, -1));
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          if (!String(draftValue || "").trim()) {
            return;
          }
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            event.preventDefault();
            void handleCommitRawToken(draftValue, suggestions[highlightedIndex]);
          }
        }
      },
      placeholder: "Buscar tags, personas, characters, artists o universes",
      disabled,
      "aria-label": "Buscar por texto libre o filtros exactos"
    }
  ))), error ? /* @__PURE__ */ React14.createElement("p", { className: "booruView__fieldError" }, error) : null, String(draftValue || "").trim() ? /* @__PURE__ */ React14.createElement("div", { className: "booruView__suggestions booruView__suggestions--stacked" }, loading ? /* @__PURE__ */ React14.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando sugerencias...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React14.createElement(
    "button",
    {
      key: `${item.id}:${tokensSignature}`,
      type: "button",
      className: [
        "booruView__suggestion",
        highlightedIndex === index ? "is-highlighted" : ""
      ].filter(Boolean).join(" "),
      onClick: () => {
        void handleCommitRawToken(draftValue, item);
      }
    },
    /* @__PURE__ */ React14.createElement("span", null, item.label),
    item.detail ? /* @__PURE__ */ React14.createElement("small", null, item.detail) : null
  )) : /* @__PURE__ */ React14.createElement("span", { className: "booruView__suggestionsHint" }, "Enter conserva el texto libre. Elige una sugerencia para filtrar por su ID exacto.")) : null);
}

// ../nexus-plugins/booru/src/components/search/SingleEntityAutocompleteField.jsx
init_define_process();
var React15 = window.React;
var { useEffect: useEffect13, useMemo: useMemo6, useState: useState11 } = React15;
function SingleEntityAutocompleteField({
  kind,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  buttonLabel = "Asignar",
  invoke: invoke7,
  helpers,
  entityKindLabels,
  onEnsureEntity,
  allowClear = true
}) {
  const { findExactEntityMatch: findExactEntityMatch2, stepSuggestionIndex: stepSuggestionIndex2 } = helpers;
  const [query, setQuery] = useState11("");
  const [suggestions, setSuggestions] = useState11([]);
  const [loading, setLoading] = useState11(false);
  const [error, setError] = useState11("");
  const [highlightedIndex, setHighlightedIndex] = useState11(-1);
  useEffect13(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    void invoke7("booru:list-entities", { kind, query: trimmedQuery }).then((data) => {
      if (cancelled) {
        return;
      }
      const currentValueId = String(value?.id || "").trim();
      setSuggestions(
        (Array.isArray(data?.items) ? data.items : []).filter((item) => item.id !== currentValueId)
      );
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar sugerencias."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [kind, query, value]);
  useEffect13(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);
  const handleSelectEntity = (entity) => {
    onChange?.(entity);
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };
  const handleEnsureEntity = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || disabled) {
      return;
    }
    const exactSuggestion = findExactEntityMatch2(suggestions, trimmedQuery);
    if (exactSuggestion) {
      handleSelectEntity(exactSuggestion);
      return;
    }
    setLoading(true);
    try {
      const result = onEnsureEntity ? await onEnsureEntity(kind, trimmedQuery) : await invoke7("booru:ensure-entity", { kind, name: trimmedQuery });
      if (result?.entity) handleSelectEntity(result.entity);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la entidad."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React15.createElement("div", { className: "booruView__entityInlineEditor" }, value ? /* @__PURE__ */ React15.createElement("div", { className: "booruView__entitySelection" }, /* @__PURE__ */ React15.createElement("span", { className: "booruView__selectionChip" }, /* @__PURE__ */ React15.createElement("span", null, value.displayName), allowClear ? /* @__PURE__ */ React15.createElement(
    "button",
    {
      type: "button",
      className: "booruView__selectionChipRemove",
      onClick: () => onChange?.(null),
      disabled,
      "aria-label": `Quitar ${value.displayName}`
    },
    "x"
  ) : null)) : null, /* @__PURE__ */ React15.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React15.createElement(
    SearchField,
    {
      value: query,
      onChange: (event) => setQuery(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, -1));
          return;
        }
        if (event.key === "Escape") {
          setQuery("");
          setSuggestions([]);
          setHighlightedIndex(-1);
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            handleSelectEntity(suggestions[highlightedIndex]);
            return;
          }
          void handleEnsureEntity();
        }
      },
      placeholder: placeholder || `Buscar ${label.toLowerCase()} o crear uno nuevo`,
      disabled,
      "aria-label": label
    }
  ), /* @__PURE__ */ React15.createElement(
    Button,
    {
      type: "button",
      onClick: () => void handleEnsureEntity(),
      disabled: !String(query || "").trim() || disabled
    },
    buttonLabel
  )), error ? /* @__PURE__ */ React15.createElement("p", { className: "booruView__fieldError" }, error) : null, String(query || "").trim() ? /* @__PURE__ */ React15.createElement("div", { className: "booruView__suggestions" }, loading ? /* @__PURE__ */ React15.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando sugerencias...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React15.createElement(
    "button",
    {
      key: item.id,
      type: "button",
      className: [
        "booruView__suggestion",
        highlightedIndex === index ? "is-highlighted" : ""
      ].filter(Boolean).join(" "),
      onClick: () => handleSelectEntity(item)
    },
    /* @__PURE__ */ React15.createElement("span", null, item.displayName),
    /* @__PURE__ */ React15.createElement("small", null, item.resourceCount, " recursos")
  )) : /* @__PURE__ */ React15.createElement("span", { className: "booruView__suggestionsHint" }, "Sin coincidencias. Enter crea ", entityKindLabels[kind]?.toLowerCase() || "la entidad", ".")) : null);
}

// ../nexus-plugins/booru/src/components/search/EntityAutocompleteField.jsx
init_define_process();
var React16 = window.React;
var { useEffect: useEffect14, useMemo: useMemo7, useState: useState12 } = React16;
function EntityAutocompleteField({
  kind,
  label,
  description,
  required = false,
  selectedItems,
  onChange,
  disabled = false,
  invoke: invoke7,
  helpers,
  entityKindLabels,
  onEnsureEntity,
  priorityEntity = null
}) {
  const { normalizeSelectedEntities: normalizeSelectedEntities2, findExactEntityMatch: findExactEntityMatch2, stepSuggestionIndex: stepSuggestionIndex2 } = helpers;
  const [query, setQuery] = useState12("");
  const [suggestions, setSuggestions] = useState12([]);
  const [loading, setLoading] = useState12(false);
  const [error, setError] = useState12("");
  const [highlightedIndex, setHighlightedIndex] = useState12(-1);
  useEffect14(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    void invoke7("booru:list-entities", { kind, query: trimmedQuery }).then((data) => {
      if (cancelled) {
        return;
      }
      const selectedIds = new Set((Array.isArray(selectedItems) ? selectedItems : []).map((item) => item.id));
      const availableItems = (Array.isArray(data?.items) ? data.items : []).filter((item) => !selectedIds.has(item.id));
      setSuggestions(availableItems.sort((left, right) => Number(right?.id === priorityEntity?.entityId) - Number(left?.id === priorityEntity?.entityId)));
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar sugerencias."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [invoke7, kind, priorityEntity?.entityId, query, selectedItems]);
  useEffect14(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);
  const handleSelectEntity = (entity) => {
    onChange?.(normalizeSelectedEntities2([...selectedItems || [], entity]));
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };
  const handleEnsureEntity = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || disabled) {
      return;
    }
    const existingSelectedMatch = findExactEntityMatch2(selectedItems, trimmedQuery);
    if (existingSelectedMatch) {
      setQuery("");
      setSuggestions([]);
      setError("");
      return;
    }
    const exactSuggestion = findExactEntityMatch2(suggestions, trimmedQuery);
    if (exactSuggestion) {
      handleSelectEntity(exactSuggestion);
      return;
    }
    setLoading(true);
    try {
      const result = onEnsureEntity ? await onEnsureEntity(kind, trimmedQuery) : await invoke7("booru:ensure-entity", { kind, name: trimmedQuery });
      if (result?.entity) handleSelectEntity(result.entity);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la entidad."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React16.createElement(
    Field,
    {
      label: required ? `${label} (requerido)` : label,
      description,
      className: "booruView__field"
    },
    /* @__PURE__ */ React16.createElement("div", { className: "booruView__entityEditor" }, Array.isArray(selectedItems) && selectedItems.length ? /* @__PURE__ */ React16.createElement("div", { className: "booruView__entitySelection" }, selectedItems.map((item) => /* @__PURE__ */ React16.createElement("span", { key: item.id, className: "booruView__selectionChip" }, /* @__PURE__ */ React16.createElement("span", null, item.displayName), /* @__PURE__ */ React16.createElement(
      "button",
      {
        type: "button",
        className: "booruView__selectionChipRemove",
        onClick: () => onChange?.(selectedItems.filter((entry) => entry.id !== item.id)),
        disabled,
        "aria-label": `Quitar ${item.displayName}`
      },
      "x"
    )))) : null, /* @__PURE__ */ React16.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React16.createElement(
      SearchField,
      {
        value: query,
        onChange: (event) => setQuery(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, 1));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, -1));
            return;
          }
          if (event.key === "Escape") {
            setQuery("");
            setSuggestions([]);
            setHighlightedIndex(-1);
            return;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
              handleSelectEntity(suggestions[highlightedIndex]);
              return;
            }
            void handleEnsureEntity();
          }
        },
        placeholder: `Buscar ${label.toLowerCase()} o crear uno nuevo`,
        disabled,
        "aria-label": `Buscar ${label.toLowerCase()}`
      }
    ), /* @__PURE__ */ React16.createElement(
      Button,
      {
        type: "button",
        onClick: () => void handleEnsureEntity(),
        disabled: !String(query || "").trim() || disabled
      },
      "Agregar"
    )), error ? /* @__PURE__ */ React16.createElement("p", { className: "booruView__fieldError" }, error) : null, String(query || "").trim() ? /* @__PURE__ */ React16.createElement("div", { className: "booruView__suggestions" }, loading ? /* @__PURE__ */ React16.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando sugerencias...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React16.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: [
          "booruView__suggestion",
          highlightedIndex === index ? "is-highlighted" : ""
        ].filter(Boolean).join(" "),
        onClick: () => handleSelectEntity(item)
      },
      /* @__PURE__ */ React16.createElement("span", null, item.displayName),
      /* @__PURE__ */ React16.createElement("small", null, item.resourceCount, " recursos")
    )) : /* @__PURE__ */ React16.createElement("span", { className: "booruView__suggestionsHint" }, "Sin coincidencias. Enter crea ", entityKindLabels[kind]?.toLowerCase() || "la entidad", ".")) : null)
  );
}

// ../nexus-plugins/booru/src/components/search/TagAutocompleteField.jsx
init_define_process();
var React17 = window.React;
var { useEffect: useEffect15, useMemo: useMemo8, useState: useState13 } = React17;
function TagAutocompleteField({
  label,
  description,
  selectedItems,
  onChange,
  disabled = false,
  invoke: invoke7,
  helpers
}) {
  const { normalizeSelectedTags: normalizeSelectedTags2, findExactTagMatch: findExactTagMatch2, stepSuggestionIndex: stepSuggestionIndex2 } = helpers;
  const [query, setQuery] = useState13("");
  const [suggestions, setSuggestions] = useState13([]);
  const [loading, setLoading] = useState13(false);
  const [error, setError] = useState13("");
  const [highlightedIndex, setHighlightedIndex] = useState13(-1);
  useEffect15(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    void invoke7("booru:list-tags", { query: trimmedQuery }).then((data) => {
      if (cancelled) {
        return;
      }
      const selectedIds = new Set((Array.isArray(selectedItems) ? selectedItems : []).map((item) => item.id));
      setSuggestions(
        (Array.isArray(data?.items) ? data.items : []).filter((item) => !selectedIds.has(item.id))
      );
      setError("");
    }).catch((loadError) => {
      if (cancelled) {
        return;
      }
      setSuggestions([]);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar las tags."
      );
    }).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [invoke7, query, selectedItems]);
  useEffect15(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);
  const handleSelectTag = (tag) => {
    onChange?.(normalizeSelectedTags2([...selectedItems || [], tag]));
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };
  const handleEnsureTag = async () => {
    const trimmedQuery = String(query || "").trim();
    if (!trimmedQuery || disabled) {
      return;
    }
    const existingSelectedMatch = findExactTagMatch2(selectedItems, trimmedQuery);
    if (existingSelectedMatch) {
      setQuery("");
      setSuggestions([]);
      setError("");
      return;
    }
    const exactSuggestion = findExactTagMatch2(suggestions, trimmedQuery);
    if (exactSuggestion) {
      handleSelectTag(exactSuggestion);
      return;
    }
    setLoading(true);
    try {
      const result = await invoke7("booru:ensure-tag", { name: trimmedQuery });
      handleSelectTag(result.tag);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la tag."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React17.createElement(
    Field,
    {
      label,
      description,
      className: "booruView__field"
    },
    /* @__PURE__ */ React17.createElement("div", { className: "booruView__entityEditor" }, Array.isArray(selectedItems) && selectedItems.length ? /* @__PURE__ */ React17.createElement("div", { className: "booruView__entitySelection" }, selectedItems.map((item) => /* @__PURE__ */ React17.createElement("span", { key: item.id, className: "booruView__selectionChip" }, /* @__PURE__ */ React17.createElement("span", null, item.name), /* @__PURE__ */ React17.createElement(
      "button",
      {
        type: "button",
        className: "booruView__selectionChipRemove",
        onClick: () => onChange?.(selectedItems.filter((entry) => entry.id !== item.id)),
        disabled,
        "aria-label": `Quitar ${item.name}`
      },
      "x"
    )))) : null, /* @__PURE__ */ React17.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React17.createElement(
      SearchField,
      {
        value: query,
        onChange: (event) => setQuery(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, 1));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, suggestions.length, -1));
            return;
          }
          if (event.key === "Escape") {
            setQuery("");
            setSuggestions([]);
            setHighlightedIndex(-1);
            return;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
              handleSelectTag(suggestions[highlightedIndex]);
              return;
            }
            void handleEnsureTag();
          }
        },
        placeholder: "Buscar tag o crear una nueva",
        disabled,
        "aria-label": "Buscar tag"
      }
    ), /* @__PURE__ */ React17.createElement(
      Button,
      {
        type: "button",
        onClick: () => void handleEnsureTag(),
        disabled: !String(query || "").trim() || disabled
      },
      "Agregar"
    )), error ? /* @__PURE__ */ React17.createElement("p", { className: "booruView__fieldError" }, error) : null, String(query || "").trim() ? /* @__PURE__ */ React17.createElement("div", { className: "booruView__suggestions" }, loading ? /* @__PURE__ */ React17.createElement("span", { className: "booruView__suggestionsHint" }, "Buscando tags...") : suggestions.length ? suggestions.map((item, index) => /* @__PURE__ */ React17.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: [
          "booruView__suggestion",
          highlightedIndex === index ? "is-highlighted" : ""
        ].filter(Boolean).join(" "),
        onClick: () => handleSelectTag(item)
      },
      /* @__PURE__ */ React17.createElement("span", null, item.name),
      /* @__PURE__ */ React17.createElement("small", null, item.resourceCount, " recursos")
    )) : /* @__PURE__ */ React17.createElement("span", { className: "booruView__suggestionsHint" }, "Sin coincidencias. Enter crea la tag manual.")) : null)
  );
}

// ../nexus-plugins/booru/src/components/recommendations/RecommendationKindBadge.jsx
init_define_process();
var React18 = window.React;
var { useCallback: useCallback3, useEffect: useEffect16, useRef: useRef9, useState: useState14 } = React18;
function RecommendationKindBadge({
  item,
  tooltip = "",
  className = "",
  helpers
}) {
  const { getRecommendationKindBadgeLabel: getRecommendationKindBadgeLabel2 } = helpers;
  const [visible, setVisible] = useState14(false);
  const hoverTimerRef = useRef9(null);
  const clearHoverTimer = useCallback3(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);
  const startTooltipTimer = useCallback3(() => {
    clearHoverTimer();
    if (!tooltip) {
      return;
    }
    hoverTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, 1e3);
  }, [clearHoverTimer, tooltip]);
  const stopTooltip = useCallback3(() => {
    clearHoverTimer();
    setVisible(false);
  }, [clearHoverTimer]);
  useEffect16(() => () => {
    clearHoverTimer();
  }, [clearHoverTimer]);
  return /* @__PURE__ */ React18.createElement(
    "span",
    {
      className: [
        "booruView__selectionChip",
        "booruView__selectionChip--kindBadge",
        className
      ].filter(Boolean).join(" "),
      "aria-label": tooltip || void 0,
      onMouseEnter: startTooltipTimer,
      onMouseLeave: stopTooltip
    },
    /* @__PURE__ */ React18.createElement("span", null, getRecommendationKindBadgeLabel2(item)),
    visible && tooltip ? /* @__PURE__ */ React18.createElement("span", { className: "booruView__kindTooltip", role: "tooltip" }, tooltip) : null
  );
}

// ../nexus-plugins/booru/src/components/recommendations/RecommendationEntityDropTarget.jsx
init_define_process();
var React19 = window.React;
var { useCallback: useCallback4, useEffect: useEffect17, useMemo: useMemo9, useRef: useRef10 } = React19;
function RecommendationEntityDropTarget({
  item,
  kind,
  manualAssignResourceIds = [],
  customDragMatch = false,
  dropDisabled = false,
  manualAssignDisabled = false,
  assigning = false,
  actionLabel = "Aplicar",
  onAssign,
  onApply,
  useDrop: useDrop2,
  dndType,
  resolveDragIds,
  logger,
  uniqueIds: uniqueIds2,
  KindBadge,
  Button: Button2,
  helpers
}) {
  const { getRecommendationItemKindClass: getRecommendationItemKindClass2, getRecommendationKindTooltip: getRecommendationKindTooltip2 } = helpers;
  const normalizedManualAssignResourceIds = useMemo9(
    () => uniqueIds2(manualAssignResourceIds),
    [manualAssignResourceIds]
  );
  const hoverSignatureRef = useRef10("");
  const dragOverLogAtRef = useRef10(0);
  const [{ isOver, canDrop }, dropRef] = useDrop2(() => ({
    accept: dndType,
    canDrop: (draggedItem) => {
      const draggedIds = resolveDragIds(draggedItem);
      return !dropDisabled && !assigning && draggedIds.length > 0;
    },
    hover: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      const draggedIds = resolveDragIds(draggedItem);
      const hoverSignature = `${item.id}:${draggedIds.join("|")}`;
      if (!draggedIds.length || hoverSignatureRef.current === hoverSignature) {
        return;
      }
      hoverSignatureRef.current = hoverSignature;
      logger.debug(
        "booru.dnd.drop.hover",
        "Booru detecto hover sobre un destino rapido.",
        {
          entityId: item.id,
          kind,
          resourceIds: draggedIds
        }
      );
    },
    drop: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true }) || dropDisabled || assigning) {
        return;
      }
      const draggedIds = resolveDragIds(draggedItem);
      if (!draggedIds.length) {
        return;
      }
      logger.debug(
        "booru.dnd.drop.commit",
        "Booru recibio un drop sobre un destino rapido.",
        {
          entityId: item.id,
          kind,
          resourceIds: draggedIds
        }
      );
      void onAssign?.({
        resourceId: draggedIds[0],
        resourceIds: draggedIds,
        kind,
        entityId: item.id
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }), [assigning, dropDisabled, item.id, kind, logger, onAssign, resolveDragIds]);
  useEffect17(() => {
    if (!isOver) {
      hoverSignatureRef.current = "";
    }
  }, [isOver]);
  const handleDropRef = useCallback4((node) => {
    dropRef(node);
  }, [dropRef]);
  const kindTooltip = getRecommendationKindTooltip2(item);
  return /* @__PURE__ */ React19.createElement(
    "div",
    {
      ref: handleDropRef,
      className: [
        "booruView__suggestion",
        "booruView__recommendationCard",
        "booruView__recommendationCard--entity",
        "booruView__suggestion--dropTarget",
        isOver && canDrop ? "is-drop-target" : "",
        customDragMatch ? "is-drop-target" : ""
      ].filter(Boolean).join(" "),
      "data-booru-quick-assign-target": "true",
      "data-booru-kind": kind,
      "data-booru-entity-id": item.entityId || item.id,
      "data-booru-label": item.label || item.displayName,
      onDragEnterCapture: () => {
        logger.debug(
          "booru.dnd.native.enter",
          "El navegador detecto dragenter sobre un destino rapido.",
          {
            entityId: item.id,
            kind
          }
        );
      },
      onDragOverCapture: () => {
        const now = Date.now();
        if (now - dragOverLogAtRef.current < 400) {
          return;
        }
        dragOverLogAtRef.current = now;
        logger.debug(
          "booru.dnd.native.over",
          "El navegador detecto dragover sobre un destino rapido.",
          {
            entityId: item.id,
            kind
          }
        );
      },
      onDropCapture: () => {
        logger.debug(
          "booru.dnd.native.drop",
          "El navegador detecto drop nativo sobre un destino rapido.",
          {
            entityId: item.id,
            kind
          }
        );
      }
    },
    /* @__PURE__ */ React19.createElement("div", { className: "booruView__recommendationCopy" }, /* @__PURE__ */ React19.createElement("span", null, item.label || item.displayName), /* @__PURE__ */ React19.createElement("small", null, item.detail || `${item.resourceCount || 0} recursos`)),
    /* @__PURE__ */ React19.createElement("div", { className: "booruView__recommendationActions" }, /* @__PURE__ */ React19.createElement(
      KindBadge,
      {
        item,
        className: getRecommendationItemKindClass2(item),
        tooltip: kindTooltip
      }
    ), /* @__PURE__ */ React19.createElement(
      Button2,
      {
        type: "button",
        onClick: () => void onApply?.(item),
        disabled: manualAssignDisabled || assigning || !normalizedManualAssignResourceIds.length
      },
      actionLabel
    ))
  );
}

// ../nexus-plugins/booru/src/components/media/ResourceGrid.jsx
init_define_process();
var React20 = window.React;
var { useEffect: useEffect18, useMemo: useMemo10, useRef: useRef11, useState: useState15 } = React20;
function ResourceGrid({
  items,
  placements = [],
  selectedIds,
  selectionMode = "single",
  customDragState = null,
  onCustomDragPointerDown,
  shouldSuppressClick,
  totalCount,
  loading,
  scrollKey,
  defaultColumns,
  scrollTop = 0,
  onScrollStateChange,
  onColumnsChange,
  columns = defaultColumns,
  infinite = false,
  hasMore = false,
  onLoadMore,
  onVisibleItemsChange,
  onGroupAssociationHover,
  currentPage,
  pageSize,
  onPageChange,
  onSelect,
  onOpen,
  onContextMenu,
  onClearSelection,
  emptyTitle,
  emptyDescription,
  ResourceCard,
  Pagination,
  getVirtualRange
}) {
  const contentRef = useRef11(null);
  const gridRef = useRef11(null);
  const loadMoreSentinelRef = useRef11(null);
  const loadMoreRef = useRef11(onLoadMore);
  const [virtualLayout, setVirtualLayout] = useState15({
    gridWidth: 0,
    viewportHeight: 0,
    columns: defaultColumns,
    gap: 8
  });
  const [virtualRange, setVirtualRange] = useState15({
    startIndex: 0,
    endIndex: 0
  });
  const groupedSections = useMemo10(() => {
    if (!Array.isArray(placements) || !placements.length) return [];
    const itemById = new Map((Array.isArray(items) ? items : []).map((item) => [item.id, item]));
    const groups = [];
    const groupByKey = /* @__PURE__ */ new Map();
    placements.forEach((placement) => {
      const item = itemById.get(placement?.resourceId);
      if (!item) return;
      const groupKey = String(placement?.groupKey || "");
      if (!groupByKey.has(groupKey)) {
        const group = { key: groupKey, label: placement?.groupLabel || groupKey, association: placement?.association || null, entries: [] };
        groupByKey.set(groupKey, group);
        groups.push(group);
      }
      groupByKey.get(groupKey).entries.push({ placement, item });
    });
    return groups;
  }, [items, placements]);
  const grouped = groupedSections.length > 0;
  loadMoreRef.current = onLoadMore;
  useEffect18(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return void 0;
    const frameId = window.requestAnimationFrame(() => {
      contentNode.scrollTop = Math.max(0, Number(scrollTop) || 0);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [scrollKey, scrollTop]);
  useEffect18(() => {
    if (!infinite) {
      return void 0;
    }
    const contentNode = contentRef.current;
    const gridNode = gridRef.current;
    if (!contentNode || !gridNode) {
      return void 0;
    }
    let frameId = 0;
    const updateVirtualLayout = () => {
      const computedStyle = window.getComputedStyle(gridNode);
      const trackSizes = String(computedStyle.gridTemplateColumns || "").split(" ").map((value) => value.trim()).filter((value) => /px$/.test(value));
      const columns2 = Math.max(1, trackSizes.length || defaultColumns);
      const gap = Math.max(0, Number.parseFloat(computedStyle.columnGap) || 8);
      const nextLayout = {
        gridWidth: gridNode.clientWidth || 0,
        viewportHeight: contentNode.clientHeight || 0,
        columns: columns2,
        gap
      };
      const cardSize = Math.max(0, (nextLayout.gridWidth - gap * Math.max(0, columns2 - 1)) / columns2);
      const nextRange = getVirtualRange({
        itemCount: items.length,
        columns: columns2,
        rowHeight: cardSize + gap,
        scrollTop: contentNode.scrollTop || 0,
        viewportHeight: nextLayout.viewportHeight
      });
      setVirtualLayout((currentValue) => currentValue.gridWidth === nextLayout.gridWidth && currentValue.viewportHeight === nextLayout.viewportHeight && currentValue.columns === nextLayout.columns && currentValue.gap === nextLayout.gap ? currentValue : nextLayout);
      setVirtualRange((currentValue) => currentValue.startIndex === nextRange.startIndex && currentValue.endIndex === nextRange.endIndex ? currentValue : nextRange);
    };
    const handleScroll = () => {
      onScrollStateChange?.(contentNode.scrollTop || 0);
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateVirtualLayout();
        if (hasMore && !loading && contentNode.scrollTop + contentNode.clientHeight >= contentNode.scrollHeight - 640) {
          loadMoreRef.current?.();
        }
      });
    };
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(updateVirtualLayout) : null;
    resizeObserver?.observe(contentNode);
    resizeObserver?.observe(gridNode);
    contentNode.addEventListener("scroll", handleScroll, { passive: true });
    updateVirtualLayout();
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      contentNode.removeEventListener("scroll", handleScroll);
    };
  }, [columns, hasMore, infinite, items.length, loading, onScrollStateChange]);
  const isVirtualized = infinite && !grouped && virtualLayout.gridWidth > 0;
  const gridMetrics = useMemo10(() => {
    const columns2 = Math.max(1, virtualLayout.columns || defaultColumns);
    const gap = Math.max(0, virtualLayout.gap || 0);
    const cardSize = Math.max(0, (virtualLayout.gridWidth - gap * Math.max(0, columns2 - 1)) / columns2);
    const rowHeight = cardSize + gap;
    return {
      columns: columns2,
      gap,
      cardSize,
      rowHeight
    };
  }, [virtualLayout.columns, virtualLayout.gap, virtualLayout.gridWidth]);
  const totalRows = isVirtualized ? Math.ceil(items.length / gridMetrics.columns) : 0;
  const totalGridHeight = isVirtualized && totalRows ? totalRows * gridMetrics.cardSize + Math.max(0, totalRows - 1) * gridMetrics.gap : 0;
  const activeVirtualRange = isVirtualized ? virtualRange : {
    startIndex: 0,
    endIndex: items.length
  };
  const renderedItems = useMemo10(
    () => items.slice(activeVirtualRange.startIndex, activeVirtualRange.endIndex),
    [activeVirtualRange.endIndex, activeVirtualRange.startIndex, items]
  );
  useEffect18(() => {
    if (!infinite) {
      return;
    }
    onVisibleItemsChange?.(renderedItems.map((item) => item.id));
  }, [infinite, onVisibleItemsChange, renderedItems]);
  useEffect18(() => {
    if (!infinite || !isVirtualized || !hasMore || loading) {
      return void 0;
    }
    const contentNode = contentRef.current;
    const sentinelNode = loadMoreSentinelRef.current;
    if (!contentNode || !sentinelNode || typeof IntersectionObserver !== "function") {
      return void 0;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreRef.current?.();
        }
      },
      {
        root: contentNode,
        rootMargin: "640px 0px"
      }
    );
    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [hasMore, infinite, isVirtualized, loading, totalGridHeight]);
  return /* @__PURE__ */ React20.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, loading && !items.length ? /* @__PURE__ */ React20.createElement(
    StateBlock,
    {
      centered: true,
      title: "Cargando media",
      description: "Leyendo la pagina actual de Booru."
    }
  ) : items.length ? /* @__PURE__ */ React20.createElement(
    "div",
    {
      ref: contentRef,
      className: "booruView__resourcePanelBody",
      onPointerDown: (event) => {
        if (event.target === event.currentTarget) {
          onClearSelection?.();
        }
      }
    },
    /* @__PURE__ */ React20.createElement("div", { className: "booruView__resourcePanelContent" }, grouped ? /* @__PURE__ */ React20.createElement("div", { ref: gridRef, className: "booruView__groupedGallery" }, groupedSections.map((group) => /* @__PURE__ */ React20.createElement(CollapsibleGalleryGroup, { key: group.key, label: group.label, association: group.association, onAssociationHover: onGroupAssociationHover }, /* @__PURE__ */ React20.createElement(
      GalleryGrid,
      {
        className: "booruView__mediaGrid",
        columns,
        minColumns: 2,
        onColumnsChange
      },
      group.entries.map(({ placement, item }, index) => /* @__PURE__ */ React20.createElement(
        ResourceCard,
        {
          key: placement.placementId,
          item,
          absoluteIndex: index,
          selected: selectedIds.includes(item.id),
          multiSelected: selectedIds.includes(item.id) && selectionMode === "multi",
          dragResourceIds: selectedIds.includes(item.id) ? selectedIds : [item.id],
          customDragActive: Boolean(customDragState?.active && customDragState.resourceIds?.includes(item.id)),
          onCustomDragPointerDown,
          shouldSuppressClick,
          onSelect,
          onOpen,
          onContextMenu,
          columns
        }
      ))
    )))) : /* @__PURE__ */ React20.createElement(
      GalleryGrid,
      {
        ref: gridRef,
        className: [
          "booruView__mediaGrid",
          infinite ? "booruView__mediaGrid--infinite" : "booruView__mediaGrid--paged",
          isVirtualized ? "is-virtualized" : ""
        ].filter(Boolean).join(" "),
        virtual: isVirtualized,
        columns,
        minColumns: 2,
        onColumnsChange,
        style: {
          ...isVirtualized ? { height: `${totalGridHeight}px` } : {}
        },
        onPointerDown: (event) => {
          if (event.target === event.currentTarget) onClearSelection?.();
        }
      },
      renderedItems.map((item, index) => {
        const absoluteIndex = activeVirtualRange.startIndex + index;
        const selected = selectedIds.includes(item.id);
        const row = Math.floor(absoluteIndex / gridMetrics.columns);
        const column = absoluteIndex % gridMetrics.columns;
        const cardStyle = isVirtualized ? {
          position: "absolute",
          top: `${row * gridMetrics.rowHeight}px`,
          left: `${column * (gridMetrics.cardSize + gridMetrics.gap)}px`,
          width: `${gridMetrics.cardSize}px`,
          height: `${gridMetrics.cardSize}px`
        } : void 0;
        return /* @__PURE__ */ React20.createElement(
          ResourceCard,
          {
            key: item.id,
            item,
            absoluteIndex,
            style: cardStyle,
            selected,
            multiSelected: selected && selectionMode === "multi",
            dragResourceIds: selected ? selectedIds : [item.id],
            customDragActive: Boolean(customDragState?.active && customDragState.resourceIds?.includes(item.id)),
            onCustomDragPointerDown,
            shouldSuppressClick,
            onSelect,
            onOpen,
            onContextMenu,
            columns
          }
        );
      }),
      infinite && hasMore ? /* @__PURE__ */ React20.createElement(
        "div",
        {
          ref: loadMoreSentinelRef,
          className: "booruView__resourceLoadSentinel",
          "aria-hidden": "true",
          style: isVirtualized ? { top: `${Math.max(0, totalGridHeight - 1)}px` } : void 0
        }
      ) : null
    ), grouped && infinite && hasMore ? /* @__PURE__ */ React20.createElement("div", { ref: loadMoreSentinelRef, className: "booruView__resourceLoadSentinel", "aria-hidden": "true" }) : null, infinite ? loading ? /* @__PURE__ */ React20.createElement("span", { className: "booruView__resourceLoadingMore" }, "Cargando m\xE1s media...") : null : /* @__PURE__ */ React20.createElement(
      Pagination,
      {
        currentPage,
        totalCount,
        pageSize,
        onPageChange
      }
    ))
  ) : /* @__PURE__ */ React20.createElement(
    StateBlock,
    {
      centered: true,
      title: emptyTitle,
      description: emptyDescription
    }
  ));
}

// ../nexus-plugins/booru/src/components/media/ResourcePagination.jsx
init_define_process();
var React21 = window.React;
var { useEffect: useEffect19, useState: useState16 } = React21;
function ResourcePagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  Button: Button2,
  clampPage,
  getPageWindow
}) {
  const totalPages = Math.max(1, Math.ceil(Number(totalCount || 0) / Math.max(1, Number(pageSize || 1))));
  const [pageInputValue, setPageInputValue] = useState16(String(currentPage || 1));
  useEffect19(() => {
    setPageInputValue(String(currentPage || 1));
  }, [currentPage]);
  if (totalPages <= 1) {
    return null;
  }
  const safeCurrentPage = clampPage(currentPage, totalPages);
  const pageWindow = getPageWindow(safeCurrentPage, totalPages);
  const commitPageInput = () => {
    onPageChange?.(clampPage(pageInputValue, totalPages));
  };
  return /* @__PURE__ */ React21.createElement("div", { className: "booruView__pagination" }, /* @__PURE__ */ React21.createElement("div", { className: "booruView__paginationButtons" }, /* @__PURE__ */ React21.createElement(
    Button2,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(1),
      disabled: safeCurrentPage <= 1,
      "aria-label": "Ir a la primera pagina"
    },
    "<<"
  ), /* @__PURE__ */ React21.createElement(
    Button2,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(safeCurrentPage - 1),
      disabled: safeCurrentPage <= 1,
      "aria-label": "Ir a la pagina anterior"
    },
    "<"
  ), pageWindow.map((pageNumber) => /* @__PURE__ */ React21.createElement(
    Button2,
    {
      key: pageNumber,
      type: "button",
      tone: pageNumber === safeCurrentPage ? "primary" : "secondary",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(pageNumber),
      "aria-label": `Ir a la pagina ${pageNumber}`
    },
    pageNumber
  )), /* @__PURE__ */ React21.createElement(
    Button2,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(safeCurrentPage + 1),
      disabled: safeCurrentPage >= totalPages,
      "aria-label": "Ir a la pagina siguiente"
    },
    ">"
  ), /* @__PURE__ */ React21.createElement(
    Button2,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: () => onPageChange?.(totalPages),
      disabled: safeCurrentPage >= totalPages,
      "aria-label": "Ir a la ultima pagina"
    },
    ">>"
  )), /* @__PURE__ */ React21.createElement("div", { className: "booruView__paginationJump" }, /* @__PURE__ */ React21.createElement(
    "input",
    {
      type: "number",
      min: 1,
      max: totalPages,
      value: pageInputValue,
      onChange: (event) => setPageInputValue(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitPageInput();
        }
      },
      "aria-label": "Numero de pagina"
    }
  ), /* @__PURE__ */ React21.createElement(
    Button2,
    {
      type: "button",
      className: "booruView__paginationButton",
      onClick: commitPageInput
    },
    "Ir"
  )));
}

// ../nexus-plugins/booru/src/components/media/ResourceGridCard.jsx
init_define_process();
var React22 = window.React;
var { useCallback: useCallback5, useEffect: useEffect20, useMemo: useMemo11 } = React22;
function ResourceGridCard({
  item,
  absoluteIndex,
  style = void 0,
  selected,
  multiSelected,
  dragResourceIds,
  customDragActive = false,
  onCustomDragPointerDown,
  shouldSuppressClick,
  onSelect,
  onOpen,
  onContextMenu,
  useDrag: useDrag2,
  dndType,
  emptyImage,
  logger,
  uniqueIds: uniqueIds2,
  MediaPreview,
  defaultColumns
}) {
  const videoAutoplay = resolveBooruVideoAutoplay(item);
  const normalizedDragResourceIds = useMemo11(
    () => uniqueIds2(Array.isArray(dragResourceIds) ? dragResourceIds : [item.id]),
    [dragResourceIds, item.id]
  );
  const [{ isDragging }, dragRef, previewRef] = useDrag2(() => ({
    type: dndType,
    item: () => {
      const payload = {
        id: item.id,
        ids: normalizedDragResourceIds,
        primaryId: item.id,
        resourceId: item.id,
        resourceIds: normalizedDragResourceIds
      };
      logger.debug(
        "booru.dnd.drag.start",
        "Booru inicio el arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          selected,
          multiSelected
        }
      );
      return payload;
    },
    canDrag: () => Boolean(item?.id),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (_draggedItem, monitor) => {
      logger.debug(
        "booru.dnd.drag.end",
        "Booru termino un arrastre de recursos.",
        {
          resourceId: item.id,
          resourceIds: normalizedDragResourceIds,
          didDrop: monitor.didDrop()
        }
      );
    }
  }), [item.id, multiSelected, normalizedDragResourceIds, selected]);
  useEffect20(() => {
    if (typeof previewRef === "function" && typeof emptyImage === "function") {
      previewRef(emptyImage(), {
        captureDraggingState: true
      });
    }
  }, [previewRef]);
  const handleDragRef = useCallback5((node) => {
    dragRef(node);
  }, [dragRef]);
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(item, event);
    }
  };
  const handleClick = (event) => {
    if (shouldSuppressClick?.()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onSelect?.(item, event);
  };
  const handleDoubleClick = (event) => {
    if (shouldSuppressClick?.()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event?.ctrlKey || event?.metaKey) {
      return;
    }
    onOpen?.(item, event);
  };
  return /* @__PURE__ */ React22.createElement(
    GalleryCard,
    {
      as: "div",
      ref: handleDragRef,
      role: "button",
      tabIndex: 0,
      interactive: true,
      className: [
        "booruView__mediaCard",
        selected ? "is-selected" : "",
        multiSelected ? "is-multi-selected" : "",
        customDragActive ? "is-custom-dragging" : "",
        isDragging ? "is-dragging" : ""
      ].filter(Boolean).join(" "),
      selected,
      style,
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onContextMenu: (event) => onContextMenu?.(item, event),
      onKeyDown: handleKeyDown,
      onPointerDown: (event) => onCustomDragPointerDown?.({
        event,
        item,
        resourceIds: normalizedDragResourceIds
      }),
      onDragStart: () => {
        logger.debug(
          "booru.dnd.drag.dom-start",
          "El navegador disparo dragstart sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds
          }
        );
      },
      onDragEnd: () => {
        logger.debug(
          "booru.dnd.drag.dom-end",
          "El navegador disparo dragend sobre una card de Booru.",
          {
            resourceId: item.id,
            resourceIds: normalizedDragResourceIds
          }
        );
      },
      "aria-label": item.originalFilename,
      "aria-selected": selected
    },
    /* @__PURE__ */ React22.createElement(GalleryCardMedia, { className: "booruView__mediaCardPreview" }, /* @__PURE__ */ React22.createElement(
      MediaPreview,
      {
        pathValue: item.storagePath,
        mediaKind: item.mediaKind,
        alt: item.originalFilename,
        thumbnail: item.thumbnail,
        highPriority: absoluteIndex < defaultColumns || selected,
        preferOriginalWhenThumbnailMissing: true,
        autoplay: videoAutoplay.autoplay,
        loop: item.mediaKind === "video",
        autoplayPath: videoAutoplay.autoplayPath,
        hoverPlayable: item.mediaKind === "gif"
      }
    ))
  );
}

// ../nexus-plugins/booru/src/components/recommendations/RecommendationPanel.jsx
init_define_process();
var React23 = window.React;
var { useCallback: useCallback6, useDeferredValue, useEffect: useEffect21, useMemo: useMemo12, useRef: useRef12, useState: useState17 } = React23;
function RecommendationPanel({
  selectedResourceIds = [],
  customDragState = null,
  manualAssignDisabledReason = "",
  assigning = false,
  revisionKey = 0,
  resourceQuery = null,
  recommendationScope = "all",
  draft = null,
  onAssignEntity,
  onApplyRecommendation,
  invoke: invoke7,
  stepSuggestionIndex: stepSuggestionIndex2,
  normalizeIds,
  EntityDropTarget,
  KindBadge,
  Button: Button2,
  StateBlock: StateBlock2,
  logger,
  logDuration,
  summarizeIds,
  pageSize,
  helpers
}) {
  const { getRecommendationItemKindClass: getRecommendationItemKindClass2, getRecommendationKindTooltip: getRecommendationKindTooltip2 } = helpers;
  const [query, setQuery] = useState17("");
  const [items, setItems] = useState17([]);
  const [loading, setLoading] = useState17(false);
  const [error, setError] = useState17("");
  const [highlightedIndex, setHighlightedIndex] = useState17(-1);
  const [totalCount, setTotalCount] = useState17(0);
  const [hasMore, setHasMore] = useState17(false);
  const selectedResourceIdsSignature = JSON.stringify(Array.isArray(selectedResourceIds) ? selectedResourceIds.filter(Boolean) : []);
  const normalizedSelectedResourceIds = useMemo12(
    () => normalizeIds(selectedResourceIds),
    [selectedResourceIdsSignature]
  );
  const selectionCount = normalizedSelectedResourceIds.length;
  const manualAssignDisabled = Boolean(manualAssignDisabledReason) || assigning || !selectionCount;
  const searchDisabled = assigning;
  const showBlockingLoading = loading && items.length === 0;
  const listRef = useRef12(null);
  const requestVersionRef = useRef12(0);
  const deferredQuery = useDeferredValue(query);
  const draftSignature = JSON.stringify({
    reality: draft?.reality || null,
    authors: summarizeIds(draft?.authors),
    artists: summarizeIds(draft?.artists),
    characters: summarizeIds(draft?.characters),
    universes: summarizeIds(draft?.universes),
    manualTags: summarizeIds(draft?.manualTags)
  });
  const resourceQuerySignature = JSON.stringify(resourceQuery || {});
  const loadRecommendations = useCallback6(async ({
    append = false,
    requestedOffset = 0
  } = {}) => {
    const startedAt = performance.now();
    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;
    setLoading(true);
    logger.debug(
      "booru.recommendations.start",
      "Booru inicio la carga del recomendador unificado.",
      {
        append,
        query: String(deferredQuery || "").trim() || null,
        requestedOffset,
        revisionKey,
        selectedResourceIds: normalizedSelectedResourceIds.slice(0, 12),
        selectedCount: selectionCount
      }
    );
    try {
      const data = await invoke7("booru:list-recommendations", {
        query: String(deferredQuery || "").trim() || null,
        resourceQuery,
        scope: recommendationScope,
        selectedResourceIds: normalizedSelectedResourceIds,
        draft,
        offset: requestedOffset,
        limit: pageSize
      });
      if (requestVersionRef.current !== requestVersion) {
        return;
      }
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems((currentValue) => append ? [...currentValue, ...nextItems] : nextItems);
      setTotalCount(Number(data?.totalCount || 0));
      setHasMore(Boolean(data?.hasMore));
      setError("");
      logDuration(
        "booru.recommendations.done",
        "Booru resolvio la carga del recomendador.",
        performance.now() - startedAt,
        {
          append,
          query: String(deferredQuery || "").trim() || null,
          requestedOffset,
          itemCount: nextItems.length,
          totalCount: Number(data?.totalCount || 0),
          hasMore: Boolean(data?.hasMore),
          sampleIds: summarizeIds(nextItems)
        }
      );
    } catch (loadError) {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }
      if (!append) {
        setItems([]);
      }
      setTotalCount(0);
      setHasMore(false);
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar las recomendaciones."
      );
      logger.info(
        "booru.recommendations.error",
        "Booru no pudo cargar el recomendador unificado.",
        {
          query: String(deferredQuery || "").trim() || null,
          requestedOffset,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (requestVersionRef.current === requestVersion) {
        setLoading(false);
      }
    }
  }, [
    deferredQuery,
    draft,
    invoke7,
    logDuration,
    logger,
    normalizedSelectedResourceIds,
    pageSize,
    resourceQuery,
    recommendationScope,
    revisionKey,
    selectionCount,
    summarizeIds
  ]);
  useEffect21(() => {
    void loadRecommendations({ append: false, requestedOffset: 0 });
  }, [draftSignature, loadRecommendations, resourceQuerySignature]);
  useEffect21(() => {
    setHighlightedIndex(items.length ? 0 : -1);
  }, [items, query]);
  useEffect21(() => {
    setQuery("");
  }, [recommendationScope]);
  const handleTriggerItem = async (item) => {
    if (!item || manualAssignDisabled) {
      return;
    }
    try {
      await onApplyRecommendation?.(item);
      setQuery("");
      setError("");
    } catch (applyError) {
      setError(
        applyError instanceof Error ? applyError.message : "No se pudo aplicar la recomendacion."
      );
    }
  };
  const handleListScroll = useCallback6((event) => {
    const target = event.currentTarget;
    if (!target || loading || !hasMore) {
      return;
    }
    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remainingScroll <= 72) {
      void loadRecommendations({
        append: true,
        requestedOffset: items.length
      });
    }
  }, [hasMore, items.length, loadRecommendations, loading]);
  return /* @__PURE__ */ React23.createElement("div", { className: "booruView__quickAssign" }, /* @__PURE__ */ React23.createElement("span", { className: "booruView__groupLabel" }, recommendationScope === "tags" ? "Tags" : "Recomendaciones"), /* @__PURE__ */ React23.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React23.createElement(
    SearchField,
    {
      value: query,
      onChange: (event) => setQuery(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, items.length, 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightedIndex((currentValue) => stepSuggestionIndex2(currentValue, items.length, -1));
          return;
        }
        if (event.key === "Escape") {
          setQuery("");
          setItems([]);
          setHighlightedIndex(-1);
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          if (highlightedIndex >= 0 && items[highlightedIndex]) {
            void handleTriggerItem(items[highlightedIndex]);
          }
        }
      },
      placeholder: recommendationScope === "tags" ? "Buscar o crear tags" : recommendationScope === "essential" ? "Buscar persona, char, artist o universe" : "Buscar recomendaciones o usar persona:, char:, artist:, universe:, tag:",
      disabled: searchDisabled,
      "aria-label": recommendationScope === "tags" ? "Buscar tags" : "Buscar recomendaciones"
    }
  )), /* @__PURE__ */ React23.createElement("span", { className: "booruView__suggestionsHint" }, manualAssignDisabledReason || (selectionCount > 1 ? `Aplicara la recomendacion elegida a ${selectionCount} recursos seleccionados cuando corresponda.` : "Click aplica sobre el draft actual. Drag/drop conserva la asignacion rapida directa para entidades.")), error ? /* @__PURE__ */ React23.createElement("p", { className: "booruView__fieldError" }, error) : null, /* @__PURE__ */ React23.createElement(
    "div",
    {
      ref: listRef,
      className: "booruView__quickAssignList",
      onScroll: handleListScroll
    },
    showBlockingLoading ? /* @__PURE__ */ React23.createElement("span", { className: "booruView__suggestionsHint" }, "Cargando recomendaciones...") : items.length ? /* @__PURE__ */ React23.createElement(React23.Fragment, null, items.map((item, index) => /* @__PURE__ */ React23.createElement(
      "div",
      {
        key: item.id,
        className: highlightedIndex === index ? "booruView__quickAssignRow is-highlighted" : "booruView__quickAssignRow"
      },
      item.type === "entity" ? /* @__PURE__ */ React23.createElement(
        EntityDropTarget,
        {
          item,
          kind: item.kind,
          actionLabel: item.actionLabel || "Aplicar",
          manualAssignResourceIds: normalizedSelectedResourceIds,
          customDragMatch: Boolean(
            customDragState?.active && customDragState?.overTarget?.kind === item.kind && customDragState?.overTarget?.entityId === item.entityId
          ),
          dropDisabled: assigning,
          manualAssignDisabled,
          assigning,
          onAssign: onAssignEntity,
          onApply: handleTriggerItem
        }
      ) : /* @__PURE__ */ React23.createElement("div", { className: ["booruView__suggestion", "booruView__recommendationCard"].join(" ") }, /* @__PURE__ */ React23.createElement("div", { className: "booruView__recommendationCopy" }, /* @__PURE__ */ React23.createElement("span", null, item.label), /* @__PURE__ */ React23.createElement("small", null, item.detail || "")), /* @__PURE__ */ React23.createElement("div", { className: "booruView__recommendationActions" }, /* @__PURE__ */ React23.createElement(
        KindBadge,
        {
          item,
          className: getRecommendationItemKindClass2(item),
          tooltip: getRecommendationKindTooltip2(item)
        }
      ), /* @__PURE__ */ React23.createElement(
        Button2,
        {
          type: "button",
          onClick: () => void handleTriggerItem(item),
          disabled: manualAssignDisabled || assigning
        },
        item.actionLabel || "Aplicar"
      )))
    )), loading ? /* @__PURE__ */ React23.createElement("span", { className: "booruView__suggestionsHint" }, "Actualizando recomendaciones...") : null, !loading && hasMore ? /* @__PURE__ */ React23.createElement("span", { className: "booruView__suggestionsHint" }, "Scroll para seguir cargando. ", items.length, " de ", totalCount, " visibles.") : null) : /* @__PURE__ */ React23.createElement("span", { className: "booruView__suggestionsHint" }, "Sin recomendaciones por ahora. Ajusta el contexto o escribe una busqueda.")
  ));
}

// ../nexus-plugins/booru/src/components/resources/ResourceInspector.jsx
init_define_process();
function formatDuration(value) {
  if (value == null || value === "") {
    return "\u2014";
  }
  const durationMs = Number(value);
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "\u2014";
  }
  const totalSeconds = Math.round(durationMs / 1e3);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
function getSharedMetadataValue(resources, selectValue, formatValue = (value) => String(value ?? "")) {
  const values = (Array.isArray(resources) ? resources : []).filter(Boolean).map(selectValue);
  if (!values.length) {
    return "\u2014";
  }
  const formattedValues = values.map((value) => formatValue(value) || "\u2014");
  return formattedValues.every((value) => value === formattedValues[0]) ? formattedValues[0] : "Varios";
}
function ResourceInspector({
  section,
  activeResource,
  selectedResources,
  draft,
  saving,
  onDraftChange,
  onRestore,
  onPurge,
  onClose,
  onEnsureEntity,
  helpers,
  MediaPreview,
  EntityField: EntityField2,
  TagField,
  SingleEntityField,
  mediaKindLabels,
  realityOptions,
  priorityEntity = null
}) {
  const {
    applyClassificationPolicyToDraft: applyClassificationPolicyToDraft2,
    canSaveDraftProgress: canSaveDraftProgress2,
    formatFileSize: formatFileSize2,
    getCharacterUniverse: getCharacterUniverse2,
    getDraftUniverseForCharacter: getDraftUniverseForCharacter2,
    markDraftDirty: markDraftDirty2,
    pruneCharacterUniverseAssignments: pruneCharacterUniverseAssignments2
  } = helpers;
  const normalizedSelection = (Array.isArray(selectedResources) ? selectedResources : []).filter(Boolean);
  const selectionCount = normalizedSelection.length;
  const isBatch = selectionCount > 1;
  const resource = activeResource || normalizedSelection[0] || null;
  if (!resource) {
    return /* @__PURE__ */ React.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, /* @__PURE__ */ React.createElement(
      StateBlock,
      {
        centered: true,
        title: "Selecciona un recurso",
        description: "Details aparece aqu\xED para clasificar o revisar el recurso activo."
      }
    ));
  }
  const isDuplicate = section === "duplicates" || resource.classificationState === "duplicate-review";
  const isTrash = section === "trash" || normalizedSelection.every((item) => item?.trashedAt);
  const canSaveProgress = canSaveDraftProgress2(draft);
  const mixedFields = new Set(Array.isArray(draft?.mixedFields) ? draft.mixedFields : []);
  const realityState = getBooruDetailsRealityState(draft);
  const fieldSchema = getBooruDetailsFieldSchema(draft);
  const metadataResources = isBatch ? normalizedSelection : [resource];
  const metadata = [
    {
      label: "Resoluci\xF3n",
      value: getSharedMetadataValue(
        metadataResources,
        (item) => item?.width && item?.height ? `${item.width}\xD7${item.height}` : null,
        (value) => value || "\u2014"
      )
    },
    {
      label: "Peso",
      value: getSharedMetadataValue(metadataResources, (item) => item?.fileSize, formatFileSize2)
    },
    {
      label: "Tipo",
      value: getSharedMetadataValue(
        metadataResources,
        (item) => item?.mediaKind,
        (value) => mediaKindLabels[value] || value || "\u2014"
      )
    },
    {
      label: "Duraci\xF3n",
      value: getSharedMetadataValue(metadataResources, (item) => item?.durationMs, formatDuration)
    }
  ];
  return /* @__PURE__ */ React.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill" }, /* @__PURE__ */ React.createElement("div", { className: "booruView__inspectorBody" }, /* @__PURE__ */ React.createElement("div", { className: "booruView__inspectorTitleRow" }, /* @__PURE__ */ React.createElement("div", { className: "booruView__inspectorTitleCopy" }, /* @__PURE__ */ React.createElement("strong", null, isBatch ? `${selectionCount} recursos seleccionados` : resource.originalFilename), isBatch ? /* @__PURE__ */ React.createElement("span", { className: "booruView__suggestionsHint" }, "Los cambios se aplican como patch a toda la selecci\xF3n.") : null), /* @__PURE__ */ React.createElement(Button, { type: "button", onClick: () => onClose?.() }, "Cerrar")), /* @__PURE__ */ React.createElement("div", { className: "booruView__inspectorPreview" }, /* @__PURE__ */ React.createElement(
    MediaPreview,
    {
      pathValue: resource.storagePath,
      mediaKind: resource.mediaKind,
      alt: resource.originalFilename,
      large: true,
      controls: true
    }
  )), /* @__PURE__ */ React.createElement("dl", { className: "booruView__detailsMetadata", "aria-label": "Metadata del recurso" }, metadata.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.label, className: "booruView__detailsMetadataItem" }, /* @__PURE__ */ React.createElement("dt", null, item.label), /* @__PURE__ */ React.createElement("dd", null, item.value)))), isTrash ? /* @__PURE__ */ React.createElement("div", { className: "booruView__inspectorActions" }, /* @__PURE__ */ React.createElement(Button, { type: "button", tone: "primary", onClick: () => void onRestore?.() }, "Restaurar"), /* @__PURE__ */ React.createElement(Button, { type: "button", onClick: () => void onPurge?.() }, "Purgar")) : isDuplicate ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      title: "Este recurso qued\xF3 fuera de Pendientes",
      description: resource.canonicalOriginalFilename ? `Se detect\xF3 como duplicado exacto de ${resource.canonicalOriginalFilename}.` : "Los duplicados exactos no entran a la cola de clasificaci\xF3n."
    }
  ) : /* @__PURE__ */ React.createElement("div", { className: "booruView__detailsEditor" }, realityState.mode === "editable" ? /* @__PURE__ */ React.createElement(
    Field,
    {
      label: "Realidad",
      description: realityState.mixed ? "La selecci\xF3n contiene valores mixtos. Elige uno solo si quieres reemplazarlos en todos los recursos." : "Puedes definirla mientras no haya Persona, Character ni Artist.",
      className: "booruView__field"
    },
    /* @__PURE__ */ React.createElement(
      SegmentedControl,
      {
        options: realityOptions,
        value: draft?.reality || "undefined",
        variant: "compact",
        onChange: (value) => {
          const nextReality = value === "real" || value === "ficticio" ? value : null;
          onDraftChange?.((currentDraft) => applyClassificationPolicyToDraft2(markDraftDirty2({
            ...currentDraft,
            reality: nextReality
          }, "reality"), { realityWasEdited: true }));
        },
        ariaLabel: "Realidad del recurso"
      }
    )
  ) : /* @__PURE__ */ React.createElement("div", { className: "booruView__detailsReality", "aria-label": "Realidad del recurso" }, /* @__PURE__ */ React.createElement("span", null, "Realidad"), /* @__PURE__ */ React.createElement("strong", null, realityState.label), /* @__PURE__ */ React.createElement("small", null, realityState.mixed ? "La selecci\xF3n conserva sus valores derivados." : realityState.source === "manual" ? "Valor manual conservado; las entidades tienen prioridad visual." : "Determinada por las entidades asociadas.")), fieldSchema.map((fieldConfig) => {
    const selectedItems = draft?.[fieldConfig.field] || [];
    const mixed = mixedFields.has(fieldConfig.field);
    return /* @__PURE__ */ React.createElement(
      EntityField2,
      {
        key: fieldConfig.kind,
        kind: fieldConfig.kind,
        label: fieldConfig.label,
        description: mixed ? `Valores mixtos; se muestran los compartidos. ${fieldConfig.description}` : fieldConfig.description,
        required: fieldConfig.required,
        selectedItems,
        onEnsureEntity,
        onChange: (items) => {
          onDraftChange?.((currentDraft) => {
            const nextDraft = markDraftDirty2({
              ...currentDraft,
              [fieldConfig.field]: items,
              ...fieldConfig.kind === "character" ? {
                characterUniverses: pruneCharacterUniverseAssignments2(
                  currentDraft.characterUniverses,
                  items
                )
              } : {}
            }, fieldConfig.field);
            return applyClassificationPolicyToDraft2(nextDraft);
          });
        },
        disabled: saving,
        priorityEntity: priorityEntity?.kind === fieldConfig.kind ? priorityEntity : null
      }
    );
  }), Array.isArray(draft?.characters) && draft.characters.some((character) => !getCharacterUniverse2(character)) ? /* @__PURE__ */ React.createElement("div", { className: "booruView__characterUniverseRepair" }, /* @__PURE__ */ React.createElement("span", { className: "booruView__groupLabel" }, "Universe requerido"), /* @__PURE__ */ React.createElement("span", { className: "booruView__suggestionsHint" }, "Repara los Characters heredados inv\xE1lidos antes de completar la clasificaci\xF3n."), /* @__PURE__ */ React.createElement("div", { className: "booruView__characterUniverseList" }, draft.characters.filter((character) => !getCharacterUniverse2(character)).map((character) => {
    const selectedUniverse = getDraftUniverseForCharacter2(draft, character.id);
    return /* @__PURE__ */ React.createElement("div", { key: character.id, className: "booruView__characterUniverseRow" }, /* @__PURE__ */ React.createElement("div", { className: "booruView__characterUniverseHeader" }, /* @__PURE__ */ React.createElement("strong", null, character.displayName), selectedUniverse ? /* @__PURE__ */ React.createElement("span", { className: "booruView__tagChip" }, selectedUniverse.displayName) : /* @__PURE__ */ React.createElement("span", { className: "booruView__metaPlaceholder" }, "Sin Universe")), /* @__PURE__ */ React.createElement(
      SingleEntityField,
      {
        kind: "universe",
        label: `Universe para ${character.displayName}`,
        value: selectedUniverse,
        onChange: (universe) => {
          onDraftChange?.((currentDraft) => ({
            ...markDraftDirty2(currentDraft, "characterUniverses"),
            characterUniverses: pruneCharacterUniverseAssignments2(
              {
                ...currentDraft.characterUniverses,
                [character.id]: universe
              },
              currentDraft.characters
            )
          }));
        },
        disabled: saving,
        placeholder: `Buscar o crear Universe para ${character.displayName}`,
        onEnsureEntity
      }
    ));
  }))) : null, /* @__PURE__ */ React.createElement(
    TagField,
    {
      label: "Tags",
      description: mixedFields.has("manualTags") ? "Valores mixtos; se muestran las tags compartidas. Buscar o crear aqu\xED modifica solo las tags planas." : "Tags planas del recurso. Enter crea la faltante.",
      selectedItems: draft?.manualTags || [],
      onChange: (items) => {
        onDraftChange?.((currentDraft) => markDraftDirty2({
          ...currentDraft,
          manualTags: items
        }, "manualTags"));
      },
      disabled: saving
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "booruView__suggestionsHint booruView__detailsSaveState" }, saving ? "Guardando cambios..." : canSaveProgress ? "Preparando guardado autom\xE1tico..." : "Los cambios se guardan al confirmar cada campo."))));
}

// ../nexus-plugins/booru/src/components/entities/EntityProfileView.jsx
init_define_process();
var React24 = window.React;
var { useEffect: useEffect22, useRef: useRef13, useState: useState18 } = React24;
function EntityProfileView({
  kind,
  profile,
  activeTab,
  galleryState,
  galleryLoading,
  relationKind,
  relationState,
  relationLoading,
  onLoadMoreGallery,
  onLoadMoreRelations,
  entityMutationBusy,
  universeCharacterCreateValue,
  onTabChange,
  onOpenRelatedEntity,
  onRelatedEntityContextMenu,
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse,
  onVisualContextMenu,
  onGalleryResourceContextMenu,
  onGalleryResourceOpen,
  onPasteClipboardImage,
  onProfileChange,
  MediaPreview,
  canUseVisual,
  DataTab,
  TagsTab,
  GalleryGrid: GalleryGrid3,
  RelationsGrid,
  DownloadIcon: DownloadIcon2,
  helpers,
  profileTabOptions,
  resourceGridColumns,
  entityGridColumns,
  scrollKey,
  scrollTop = 0,
  onScrollStateChange,
  gallerySelectedIds,
  onGallerySelectionChange,
  onResourceColumnsChange,
  onEntityColumnsChange,
  onEntityHover,
  onGroupAssociationHover
}) {
  const { getInitials: getInitials2, entityKindLabels, isTextEntryElement: isTextEntryElement2 } = helpers;
  const entityProfileRootRef = useRef13(null);
  const fastScopeRef = useRef13(`booru-profile-${globalThis.crypto?.randomUUID?.() || Date.now()}`);
  const [fastClassificationActive, setFastClassificationActive] = useState18(false);
  const avatarVisual = profile?.visuals?.avatar || profile?.visual || null;
  const bannerVisual = profile?.visuals?.banner || null;
  const profileMeta = [
    `${profile?.resourceCount || 0} recursos`,
    entityKindLabels[kind] || kind
  ];
  if (kind === "character" && profile?.universe?.displayName) {
    profileMeta.push(profile.universe.displayName);
  }
  useEffect22(() => {
    entityProfileRootRef.current?.focus();
  }, [kind, profile?.id]);
  useEffect22(() => {
    const node = entityProfileRootRef.current;
    if (!node) return void 0;
    const frameId = window.requestAnimationFrame(() => {
      node.scrollTop = Math.max(0, Number(scrollTop) || 0);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [scrollKey, scrollTop]);
  useEffect22(() => () => {
    void window.nexus.ipc.invoke("booru:clear-fast-classification", { scopeId: fastScopeRef.current });
  }, [kind, profile?.id]);
  const toggleFastClassification = async () => {
    if (!profile?.id) return;
    if (fastClassificationActive) {
      await window.nexus.ipc.invoke("booru:clear-fast-classification", { scopeId: fastScopeRef.current });
      setFastClassificationActive(false);
      return;
    }
    const response = await window.nexus.ipc.invoke("booru:set-fast-classification", {
      kind,
      entityId: profile.id,
      scopeId: fastScopeRef.current
    });
    if (!response?.ok) throw new Error(response?.error || "No se pudo activar la clasificacion rapida.");
    setFastClassificationActive(true);
  };
  const handleKeyDownCapture = (event) => {
    if (event.defaultPrevented || !(event.ctrlKey || event.metaKey) || event.altKey || String(event.key || "").toLowerCase() !== "v" || isTextEntryElement2(event.target) || typeof onPasteClipboardImage !== "function" || entityMutationBusy) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    void onPasteClipboardImage();
  };
  return /* @__PURE__ */ React24.createElement(SectionPanel, { className: "booruView__panel booruView__panel--fill booruView__entityProfile" }, /* @__PURE__ */ React24.createElement(
    "div",
    {
      ref: entityProfileRootRef,
      className: "booruView__resourcePanelBody",
      tabIndex: -1,
      onKeyDownCapture: handleKeyDownCapture,
      onScroll: (event) => onScrollStateChange?.(event.currentTarget.scrollTop || 0)
    },
    /* @__PURE__ */ React24.createElement("div", { className: "booruView__resourcePanelContent booruView__entityProfileContent" }, /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityProfileHero" }, /* @__PURE__ */ React24.createElement(
      "div",
      {
        className: "booruView__entityProfileBanner",
        onContextMenu: (event) => onVisualContextMenu?.("banner", bannerVisual, event)
      },
      /* @__PURE__ */ React24.createElement(
        EntityVisualMedia,
        {
          visual: bannerVisual,
          alt: profile?.displayName || "",
          MediaPreview,
          fallback: /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityProfileBannerFallback" }, /* @__PURE__ */ React24.createElement("span", null, entityKindLabels[kind] || kind))
        }
      )
    ), /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityProfileIdentity" }, /* @__PURE__ */ React24.createElement(
      "div",
      {
        className: "booruView__entityProfileAvatar",
        onContextMenu: (event) => onVisualContextMenu?.("avatar", avatarVisual, event)
      },
      /* @__PURE__ */ React24.createElement(
        EntityVisualMedia,
        {
          visual: avatarVisual,
          alt: profile?.displayName || "",
          MediaPreview,
          fallback: /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityVisualFallback" }, /* @__PURE__ */ React24.createElement("span", null, getInitials2(profile?.displayName)))
        }
      )
    ), /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityProfileCopy" }, /* @__PURE__ */ React24.createElement("span", { className: "booruView__groupLabel" }, entityKindLabels[kind] || kind), /* @__PURE__ */ React24.createElement("h2", null, profile?.displayName || "Entidad"), /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityProfileMeta" }, profileMeta.map((entry) => /* @__PURE__ */ React24.createElement("span", { key: entry, className: "booruView__titlePill" }, entry))))), /* @__PURE__ */ React24.createElement("div", { className: "booruView__entityProfileTabs" }, /* @__PURE__ */ React24.createElement(
      SegmentedControl,
      {
        options: profileTabOptions,
        value: activeTab,
        onChange: (value) => onTabChange?.(value),
        ariaLabel: "Seccion del perfil"
      }
    ), /* @__PURE__ */ React24.createElement(
      Button,
      {
        type: "button",
        className: [
          "booruView__fastClassificationToggle",
          fastClassificationActive ? "is-active" : ""
        ].filter(Boolean).join(" "),
        "aria-pressed": fastClassificationActive,
        "aria-label": "Clasificacion rapida",
        "data-tooltip": "Clasificacion rapida: mientras este perfil siga abierto, los recursos nuevos se asignan automaticamente a esta entidad. Se apaga al salir del perfil.",
        onClick: () => void toggleFastClassification()
      },
      /* @__PURE__ */ React24.createElement(DownloadIcon2, { size: 15 })
    ))), activeTab === "data" ? /* @__PURE__ */ React24.createElement(
      DataTab,
      {
        kind,
        profile,
        busy: entityMutationBusy,
        universeCharacterCreateValue,
        onUniverseCharacterCreateValueChange,
        onCreateCharacterInUniverse,
        onChangeCharacterUniverse,
        onProfileChange
      }
    ) : activeTab === "tags" ? /* @__PURE__ */ React24.createElement(
      TagsTab,
      {
        kind,
        profile,
        busy: entityMutationBusy,
        onProfileChange
      }
    ) : relationKind ? /* @__PURE__ */ React24.createElement(
      RelationsGrid,
      {
        kind: relationKind,
        state: relationState,
        loading: relationLoading,
        onLoadMore: onLoadMoreRelations,
        onOpenEntity: onOpenRelatedEntity,
        onPreviewContextMenu: onRelatedEntityContextMenu,
        MediaPreview,
        columns: entityGridColumns,
        onColumnsChange: onEntityColumnsChange,
        onEntityHover,
        onGroupAssociationHover
      }
    ) : /* @__PURE__ */ React24.createElement(
      GalleryGrid3,
      {
        items: Array.isArray(galleryState?.items) ? galleryState.items : [],
        placements: Array.isArray(galleryState?.placements) ? galleryState.placements : [],
        loading: galleryLoading,
        hasMore: Boolean(galleryState?.hasMore),
        onLoadMore: onLoadMoreGallery,
        onOpenResource: onGalleryResourceOpen,
        onContextMenu: onGalleryResourceContextMenu,
        MediaPreview,
        canUseVisual,
        resourceGridColumns,
        selectedIds: gallerySelectedIds,
        onSelectionChange: onGallerySelectionChange,
        onColumnsChange: onResourceColumnsChange,
        onGroupAssociationHover
      }
    ))
  ));
}

// ../nexus-plugins/booru/src/components/entities/EntityProfileDataTab.jsx
init_define_process();
var React25 = window.React;
var { useEffect: useEffect23, useState: useState19 } = React25;
async function invoke4(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo guardar el perfil.");
  return response.data;
}
function EntityProfileDataTab({
  kind,
  profile,
  busy = false,
  universeCharacterCreateValue = "",
  onUniverseCharacterCreateValueChange,
  onCreateCharacterInUniverse,
  onChangeCharacterUniverse,
  onProfileChange,
  SingleEntityField,
  helpers
}) {
  const { formatDate: formatDate2 } = helpers;
  const metadata = profile?.metadata || {};
  const [aliases, setAliases] = useState19(() => (profile?.aliases || []).join("\n"));
  const [socialLinks, setSocialLinks] = useState19(() => profile?.socialLinks || []);
  const [platforms, setPlatforms] = useState19([]);
  const [saving, setSaving] = useState19(false);
  const facts = [
    { label: "Slug", value: profile?.slug || "Sin slug" },
    { label: "Recursos", value: String(profile?.resourceCount || 0) },
    { label: "Creado", value: formatDate2(metadata?.createdAt) || "Sin fecha" }
  ];
  useEffect23(() => {
    setAliases((profile?.aliases || []).join("\n"));
    setSocialLinks(profile?.socialLinks || []);
  }, [profile?.id, profile?.aliases, profile?.socialLinks]);
  useEffect23(() => {
    if (kind !== "author" && kind !== "artist") return void 0;
    let cancelled = false;
    void invoke4("booru:list-social-platforms").then((result) => {
      if (!cancelled) setPlatforms(Array.isArray(result?.items) ? result.items : []);
    }).catch(() => {
      if (!cancelled) setPlatforms([]);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);
  if (kind === "character") facts.push({ label: "Universe", value: profile?.universe?.displayName || "Todavia sin universe" });
  if (kind === "universe") facts.push(
    { label: "Characters", value: String(metadata?.characterCount || 0) },
    { label: "Consumo directo", value: String(metadata?.directResourceCount || 0) },
    { label: "Via characters", value: String(metadata?.inheritedResourceCount || 0) }
  );
  const saveIdentity = async () => {
    setSaving(true);
    try {
      const result = await invoke4("booru:save-entity-profile", {
        kind,
        entityId: profile?.id,
        aliasNames: aliases.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
        socialLinks: socialLinks.map((link) => ({ platformId: link?.platform?.id || link?.platformId, url: link?.url }))
      });
      onProfileChange?.(result?.profile || null);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ React25.createElement("div", { className: "booruView__entityProfileData" }, /* @__PURE__ */ React25.createElement("div", { className: "booruView__entityProfileFacts" }, facts.map((fact) => /* @__PURE__ */ React25.createElement("div", { key: fact.label, className: "booruView__entityProfileFact" }, /* @__PURE__ */ React25.createElement("span", null, fact.label), /* @__PURE__ */ React25.createElement("strong", null, fact.value)))), kind === "character" ? /* @__PURE__ */ React25.createElement(Field, { label: "Universe", description: "Busca uno existente o crea uno nuevo para este character.", className: "booruView__field" }, /* @__PURE__ */ React25.createElement(SingleEntityField, { kind: "universe", label: "Universe", value: profile?.universe || null, onChange: (value) => onChangeCharacterUniverse?.(value), disabled: busy, allowClear: false, placeholder: "Buscar universe o crear uno nuevo" })) : null, kind === "universe" ? /* @__PURE__ */ React25.createElement(Field, { label: "Crear character", description: "El character nuevo queda asignado automaticamente a este universe.", className: "booruView__field" }, /* @__PURE__ */ React25.createElement("div", { className: "booruView__entityInputRow" }, /* @__PURE__ */ React25.createElement("input", { type: "text", value: universeCharacterCreateValue, onChange: (event) => onUniverseCharacterCreateValueChange?.(event.target.value), onKeyDown: (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void onCreateCharacterInUniverse?.();
    }
  }, placeholder: "Crear character para este universe", disabled: busy }), /* @__PURE__ */ React25.createElement(Button, { type: "button", onClick: () => void onCreateCharacterInUniverse?.(), disabled: !String(universeCharacterCreateValue || "").trim() || busy }, "Crear"))) : null, kind === "author" || kind === "artist" ? /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement(Field, { label: "Aliases", description: "Un nombre por linea. Tambien resuelven esta entidad en el buscador.", className: "booruView__field" }, /* @__PURE__ */ React25.createElement("textarea", { value: aliases, onChange: (event) => setAliases(event.target.value), placeholder: "Otro nombre conocido", disabled: busy || saving })), /* @__PURE__ */ React25.createElement(Field, { label: "Redes", description: "Elige una plataforma registrada y pega su enlace.", className: "booruView__field" }, /* @__PURE__ */ React25.createElement("div", { className: "booruView__entityProfileLinks" }, socialLinks.map((link, index) => /* @__PURE__ */ React25.createElement("div", { key: `${link?.id || index}`, className: "booruView__entityInputRow" }, /* @__PURE__ */ React25.createElement("select", { value: link?.platform?.id || link?.platformId || "", onChange: (event) => setSocialLinks((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, platformId: event.target.value, platform: platforms.find((platform) => platform.id === event.target.value) || item.platform } : item)), disabled: busy || saving }, /* @__PURE__ */ React25.createElement("option", { value: "" }, "Plataforma"), platforms.map((platform) => /* @__PURE__ */ React25.createElement("option", { key: platform.id, value: platform.id }, platform.displayName))), /* @__PURE__ */ React25.createElement("input", { type: "url", value: link?.url || "", onChange: (event) => setSocialLinks((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item)), placeholder: "https://", disabled: busy || saving }), /* @__PURE__ */ React25.createElement(Button, { type: "button", onClick: () => setSocialLinks((items) => items.filter((_item, itemIndex) => itemIndex !== index)), disabled: busy || saving }, "Quitar"))), /* @__PURE__ */ React25.createElement(Button, { type: "button", onClick: () => setSocialLinks((items) => [...items, { platformId: "", url: "" }]), disabled: busy || saving || !platforms.length }, "Anadir red"))), /* @__PURE__ */ React25.createElement(Button, { type: "button", tone: "primary", onClick: () => void saveIdentity(), disabled: busy || saving }, saving ? "Guardando" : "Guardar datos")) : null);
}

// ../nexus-plugins/booru/src/components/entities/EntityProfileTagsTab.jsx
init_define_process();
var React26 = window.React;
var { useEffect: useEffect24, useState: useState20 } = React26;
async function invoke5(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo guardar las tags.");
  return response.data;
}
function EntityProfileTagsTab({
  kind,
  profile,
  busy = false,
  onProfileChange,
  TagField
}) {
  const [tags, setTags] = useState20(() => Array.isArray(profile?.tags) ? profile.tags : []);
  const [saving, setSaving] = useState20(false);
  useEffect24(() => {
    setTags(Array.isArray(profile?.tags) ? profile.tags : []);
  }, [profile?.id, profile?.tags]);
  const save = async (nextTags) => {
    setTags(nextTags);
    setSaving(true);
    try {
      const result = await invoke5("booru:save-entity-profile", {
        kind,
        entityId: profile?.id,
        tagIds: nextTags.map((tag) => tag.id),
        aliasNames: profile?.aliases || [],
        socialLinks: (profile?.socialLinks || []).map((link) => ({
          platformId: link?.platform?.id,
          url: link?.url
        }))
      });
      onProfileChange?.(result?.profile || null);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ React26.createElement("div", { className: "booruView__entityProfileData" }, /* @__PURE__ */ React26.createElement(
    Field,
    {
      label: "Tags",
      description: "Se heredan automaticamente a los recursos asociados a esta entidad.",
      className: "booruView__field"
    },
    /* @__PURE__ */ React26.createElement(
      TagField,
      {
        label: "Tags de entidad",
        selectedItems: tags,
        onChange: (nextTags) => void save(nextTags),
        disabled: busy || saving
      }
    )
  ), saving ? /* @__PURE__ */ React26.createElement("span", { className: "booruView__suggestionsHint" }, "Sincronizando tags heredadas...") : null);
}

// ../nexus-plugins/booru/src/BooruWorkspaceView.jsx
var ipcRenderer2 = window.nexus.ipc;
var { pathToFileUrl } = window.nexus.urls;
var React27 = window.React;
var { useCallback: useCallback7, useDeferredValue: useDeferredValue2, useEffect: useEffect25, useMemo: useMemo13, useRef: useRef14, useState: useState21 } = React27;
var ReactDnd = window.__NEXUS_HOST_REACT_DND__ || {};
var ReactDndHtml5Backend = window.__NEXUS_HOST_REACT_DND_HTML5_BACKEND__ || {};
var { useDrag, useDragLayer, useDrop } = ReactDnd;
var { getEmptyImage } = ReactDndHtml5Backend;
var safeUseDrag = typeof useDrag === "function" ? useDrag : (() => [{ isDragging: false }, () => void 0, () => void 0]);
var safeUseDragLayer = typeof useDragLayer === "function" ? useDragLayer : (() => ({
  currentOffset: null,
  isDragging: false,
  itemType: "",
  item: null
}));
var safeUseDrop = typeof useDrop === "function" ? useDrop : (() => [{ isOver: false, canDrop: false }, () => void 0]);
var booruViewLogger = createRendererDevLogger("renderer.plugins.booru");
var WORKSPACE_FRAME_SECTION_NONCE_KEY = "workspaceFrameSectionNonce";
var SETTINGS_SUBVIEW_OPTIONS = /* @__PURE__ */ new Set(["overview", "duplicates", "trash"]);
var RESOURCE_SECTIONS = /* @__PURE__ */ new Set(["media", "pending", "duplicates", "trash"]);
var ENTITY_SECTION_KIND_MAP = Object.freeze({
  authors: "author",
  characters: "character",
  artists: "artist",
  universes: "universe"
});
var ENTITY_KIND_SECTION_MAP = Object.freeze({
  author: "authors",
  character: "characters",
  artist: "artists",
  universe: "universes"
});
var CLASSIFICATION_SIDEBAR_SECTIONS = /* @__PURE__ */ new Set(["media", "pending"]);
var MEDIA_FILTER_OPTIONS = [
  { value: "all", label: "Todo" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "gif", label: "GIF" }
];
var MEDIA_REALITY_FILTER_OPTIONS = [
  { value: "all", label: "Cualquiera" },
  { value: "real", label: "Real" },
  { value: "ficticio", label: "Ficticio" }
];
var PENDING_REALITY_FILTER_OPTIONS = [
  MEDIA_REALITY_FILTER_OPTIONS[0],
  { value: "untyped", label: "Sin tipo" },
  ...MEDIA_REALITY_FILTER_OPTIONS.slice(1)
];
var PENDING_MODE_OPTIONS = [
  { value: "essential", label: "Esencial" },
  { value: "tags", label: "Tags" }
];
var RESOURCE_SEARCH_REALITY_SUGGESTIONS = [
  { id: "reality:real", type: "reality", value: "real", label: "Real", detail: "Filtro de tipo" },
  { id: "reality:ficticio", type: "reality", value: "ficticio", label: "Ficticio", detail: "Filtro de tipo" }
];
var RESOURCE_SEARCH_MISSING_SUGGESTIONS = [
  { id: "missing:type", type: "missing", value: "type", label: "Sin tipo", detail: "Faltante" },
  { id: "missing:author", type: "missing", value: "author", label: "Sin persona", detail: "Faltante" },
  { id: "missing:artist", type: "missing", value: "artist", label: "Sin artist", detail: "Faltante" },
  { id: "missing:character", type: "missing", value: "character", label: "Sin character", detail: "Faltante" },
  { id: "missing:universe", type: "missing", value: "universe", label: "Sin universe", detail: "Faltante" }
];
var EMPTY_RESOURCE_SEARCH_SUGGESTIONS = [];
var RECOMMENDATION_PAGE_SIZE = 24;
var BOORU_RESOURCE_DND_TYPE = "nexus.booru.resource-card";
var RESOURCE_PAGE_SIZE = 42;
var RESOURCE_GRID_COLUMNS = 6;
var RESOURCE_GRID_OVERSCAN_ROWS = 2;
var NO_SETTINGS_SUBVIEW = "overview";
var RESOURCE_SELECTION_SECTIONS = {
  media: { ids: [], activeId: "", mode: "single" },
  pending: { ids: [], activeId: "", mode: "single" },
  duplicates: { ids: [], activeId: "", mode: "single" },
  trash: { ids: [], activeId: "", mode: "single" }
};
var EMPTY_SELECTION_STATE = Object.freeze({
  ids: Object.freeze([]),
  activeId: "",
  mode: "single"
});
var DRAFT_ENTITY_FIELD_BY_KIND = Object.freeze({
  author: "authors",
  artist: "artists",
  character: "characters",
  universe: "universes"
});
var RESOURCE_PAGE_SECTIONS = {
  media: { page: 1, querySignature: "" },
  pending: { page: 1, querySignature: "" },
  duplicates: { page: 1, querySignature: "" },
  trash: { page: 1, querySignature: "" }
};
var ENTITY_PROFILE_PAGE_SECTIONS = {
  authors: { page: 1, profileKey: "" },
  characters: { page: 1, profileKey: "" },
  artists: { page: 1, profileKey: "" },
  universes: { page: 1, profileKey: "" }
};
async function invoke6(channel, payload) {
  const response = await ipcRenderer2.invoke(channel, payload);
  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo ejecutar la operacion.");
  }
  return response.data;
}
function MediaThumbnail2(props) {
  return /* @__PURE__ */ React27.createElement(
    MediaThumbnail,
    {
      ...props,
      toFileUrl: toFileUrl2,
      logger: booruViewLogger,
      mediaKindLabels: BOORU_MEDIA_KIND_LABELS
    }
  );
}
function SingleEntityAutocompleteField2(props) {
  return /* @__PURE__ */ React27.createElement(SingleEntityAutocompleteField, { ...props, invoke: invoke6, helpers: { findExactEntityMatch, stepSuggestionIndex }, entityKindLabels: BOORU_ENTITY_KIND_LABELS });
}
function EntityAutocompleteField2(props) {
  return /* @__PURE__ */ React27.createElement(EntityAutocompleteField, { ...props, invoke: invoke6, helpers: { normalizeSelectedEntities, findExactEntityMatch, stepSuggestionIndex }, entityKindLabels: BOORU_ENTITY_KIND_LABELS });
}
function TagAutocompleteField2(props) {
  return /* @__PURE__ */ React27.createElement(TagAutocompleteField, { ...props, invoke: invoke6, helpers: { normalizeSelectedTags, findExactTagMatch, stepSuggestionIndex } });
}
function RecommendationKindBadge2(props) {
  return /* @__PURE__ */ React27.createElement(RecommendationKindBadge, { ...props, helpers: { getRecommendationKindBadgeLabel } });
}
function RecommendationEntityDropTarget2(props) {
  return /* @__PURE__ */ React27.createElement(RecommendationEntityDropTarget, { ...props, useDrop: safeUseDrop, dndType: BOORU_RESOURCE_DND_TYPE, resolveDragIds: resolveDraggedResourceIds, logger: booruViewLogger, uniqueIds, KindBadge: RecommendationKindBadge2, Button, helpers: { getRecommendationItemKindClass, getRecommendationKindTooltip } });
}
function ResourceGrid2(props) {
  return /* @__PURE__ */ React27.createElement(ResourceGrid, { ...props, ResourceCard: ResourceGridCard2, Pagination: ResourcePagination2, getVirtualRange: getResourceVirtualRange, defaultColumns: RESOURCE_GRID_COLUMNS });
}
function ResourcePagination2(props) {
  return /* @__PURE__ */ React27.createElement(ResourcePagination, { ...props, Button, clampPage: clampPageNumber, getPageWindow: getResourcePageWindow });
}
function ResourceGridCard2(props) {
  return /* @__PURE__ */ React27.createElement(ResourceGridCard, { ...props, useDrag: safeUseDrag, dndType: BOORU_RESOURCE_DND_TYPE, emptyImage: getEmptyImage, logger: booruViewLogger, uniqueIds, MediaPreview: MediaThumbnail2, defaultColumns: props.columns || RESOURCE_GRID_COLUMNS });
}
function RecommendationPanel2(props) {
  return /* @__PURE__ */ React27.createElement(RecommendationPanel, { ...props, invoke: invoke6, stepSuggestionIndex, normalizeIds: uniqueIds, EntityDropTarget: RecommendationEntityDropTarget2, KindBadge: RecommendationKindBadge2, Button, StateBlock, logger: booruViewLogger, logDuration: logRendererDuration, summarizeIds: summarizeIdsForLog, pageSize: RECOMMENDATION_PAGE_SIZE, helpers: { getRecommendationItemKindClass, getRecommendationKindTooltip } });
}
function ResourceInspector2(props) {
  return /* @__PURE__ */ React27.createElement(ResourceInspector, { ...props, helpers: { applyClassificationPolicyToDraft, canSaveDraftProgress, formatFileSize, getCharacterUniverse, getDraftUniverseForCharacter, markDraftDirty, pruneCharacterUniverseAssignments }, MediaPreview: MediaThumbnail2, EntityField: EntityAutocompleteField2, TagField: TagAutocompleteField2, SingleEntityField: SingleEntityAutocompleteField2, mediaKindLabels: BOORU_MEDIA_KIND_LABELS, realityOptions: BOORU_REALITY_OPTIONS });
}
function EntityProfileView2(props) {
  return /* @__PURE__ */ React27.createElement(EntityProfileView, { ...props, MediaPreview: MediaThumbnail2, canUseVisual: canUseResourceAsEntityVisual, DataTab: EntityProfileDataTab2, TagsTab: EntityProfileTagsTab2, GalleryGrid: EntityProfileGalleryGrid, RelationsGrid: EntityRelationsGrid2, DownloadIcon, profileTabOptions: getBooruEntityProfileTabOptions(props.kind), helpers: { getInitials, entityKindLabels: BOORU_ENTITY_KIND_LABELS, isTextEntryElement } });
}
function EntityRelationsGrid2(props) {
  return /* @__PURE__ */ React27.createElement(EntityRelationsGrid, { ...props, EntityGrid, entityKindLabels: BOORU_ENTITY_KIND_LABELS, getInitials });
}
function EntityProfileDataTab2(props) {
  return /* @__PURE__ */ React27.createElement(EntityProfileDataTab, { ...props, SingleEntityField: SingleEntityAutocompleteField2, helpers: { formatDate, entityKindLabels: BOORU_ENTITY_KIND_LABELS } });
}
function EntityProfileTagsTab2(props) {
  return /* @__PURE__ */ React27.createElement(EntityProfileTagsTab, { ...props, TagField: TagAutocompleteField2 });
}
function normalizeSearchText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
function getActiveSection(input) {
  const requestedSection = typeof input?.section === "string" ? input.section.trim() : "";
  if (requestedSection === "metrics") {
    return "settings";
  }
  if (BOORU_SECTION_OPTIONS.some((option) => option.value === requestedSection)) {
    return requestedSection;
  }
  if (RESOURCE_SECTIONS.has(requestedSection)) {
    return requestedSection;
  }
  return BOORU_DEFAULT_SECTION;
}
function getSettingsSubview(input) {
  const requestedSubview = typeof input?.settingsSubview === "string" ? input.settingsSubview.trim() : "";
  if (SETTINGS_SUBVIEW_OPTIONS.has(requestedSubview)) {
    return requestedSubview;
  }
  return NO_SETTINGS_SUBVIEW;
}
function getActiveResourceSection(activeSection, settingsSubview) {
  if (RESOURCE_SECTIONS.has(activeSection)) {
    return activeSection;
  }
  if (activeSection === "settings" && (settingsSubview === "duplicates" || settingsSubview === "trash")) {
    return settingsSubview;
  }
  return null;
}
function formatFileSize(value) {
  const size = Number(value || 0);
  if (!Number.isFinite(size) || size <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let currentValue = size;
  let unitIndex = 0;
  while (currentValue >= 1024 && unitIndex < units.length - 1) {
    currentValue /= 1024;
    unitIndex += 1;
  }
  return `${currentValue >= 10 || unitIndex === 0 ? currentValue.toFixed(0) : currentValue.toFixed(1)} ${units[unitIndex]}`;
}
function formatDate(value) {
  if (!value) {
    return "";
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(dateValue);
}
function openPath(pathValue) {
  const normalizedPath = String(pathValue || "").trim();
  if (!normalizedPath) {
    return;
  }
  window.nexus.desktop.showItemInFolder(normalizedPath);
}
function toFileUrl2(pathValue) {
  const normalizedPath = String(pathValue || "").trim();
  if (!normalizedPath) {
    return "";
  }
  try {
    return pathToFileUrl(normalizedPath);
  } catch {
    return "";
  }
}
function truncateDiagnosticText(value, maxLength = 1600) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}
function isFormControlElement(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  const interactiveNode = target.closest("input, textarea, select, button, [contenteditable='true']");
  return Boolean(interactiveNode);
}
function isTextEntryElement(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}
function summarizeIdsForLog(items, maxCount = 8) {
  return (Array.isArray(items) ? items : []).map((item) => String(item?.id || item || "").trim()).filter(Boolean).slice(0, maxCount);
}
function summarizeResourcesForLog(items) {
  const resourceItems = Array.isArray(items) ? items : [];
  const thumbnailStatusCounts = {
    ready: 0,
    pending: 0,
    error: 0,
    missing: 0
  };
  for (const item of resourceItems) {
    const status = String(item?.thumbnail?.status || "").trim();
    if (status === "ready" || status === "pending" || status === "error") {
      thumbnailStatusCounts[status] += 1;
    } else {
      thumbnailStatusCounts.missing += 1;
    }
  }
  return {
    itemCount: resourceItems.length,
    sampleIds: summarizeIdsForLog(resourceItems),
    thumbnailStatusCounts
  };
}
function logRendererDuration(eventBase, message, durationMs, data = null) {
  const method = durationMs >= 180 ? "info" : "debug";
  booruViewLogger[method](eventBase, message, {
    durationMs: Number(durationMs.toFixed(2)),
    ...data && typeof data === "object" ? data : {}
  });
}
function normalizeSelectedEntities(items) {
  const uniqueItems = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item?.id || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    uniqueItems.push(item);
  }
  return uniqueItems;
}
function normalizeSelectedTags(items) {
  const uniqueItems = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item?.id || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    uniqueItems.push(item);
  }
  return uniqueItems;
}
function uniqueIds(items) {
  const seenIds = /* @__PURE__ */ new Set();
  const normalizedIds = [];
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    normalizedIds.push(itemId);
  }
  return normalizedIds;
}
function findExactEntityMatch(items, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return null;
  }
  return (Array.isArray(items) ? items : []).find((item) => normalizeSearchText(item?.displayName) === normalizedQuery || normalizeSearchText(item?.slug) === normalizedQuery) || null;
}
function resolveDraggedResourceIds(draggedItem) {
  return uniqueIds([
    ...Array.isArray(draggedItem?.resourceIds) ? draggedItem.resourceIds : [],
    ...Array.isArray(draggedItem?.ids) ? draggedItem.ids : [],
    draggedItem?.resourceId,
    draggedItem?.id,
    draggedItem?.primaryId
  ]);
}
function getDragPreviewStyles(currentOffset) {
  if (!currentOffset) {
    return {
      display: "none"
    };
  }
  return {
    transform: `translate(${currentOffset.x + 14}px, ${currentOffset.y + 14}px)`
  };
}
function getQuickAssignTargetDescriptor(node) {
  const targetNode = node?.closest?.("[data-booru-quick-assign-target='true']");
  if (!targetNode) {
    return null;
  }
  const kind = String(targetNode.getAttribute("data-booru-kind") || "").trim();
  const entityId = String(targetNode.getAttribute("data-booru-entity-id") || "").trim();
  const label = String(targetNode.getAttribute("data-booru-label") || "").trim();
  if (!kind || !entityId) {
    return null;
  }
  return {
    kind,
    entityId,
    label: label || null
  };
}
function findExactTagMatch(items, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return null;
  }
  return (Array.isArray(items) ? items : []).find((item) => normalizeSearchText(item?.name) === normalizedQuery) || null;
}
function getCharacterUniverse(character) {
  return character?.universe?.id ? character.universe : null;
}
function getDraftUniverseForCharacter(draft, characterId) {
  const normalizedCharacterId = String(characterId || "").trim();
  if (!normalizedCharacterId) {
    return null;
  }
  const universe = draft?.characterUniverses?.[normalizedCharacterId];
  return universe?.id ? universe : null;
}
function resolveCharacterUniverse(draft, character) {
  return getCharacterUniverse(character) || getDraftUniverseForCharacter(draft, character?.id);
}
function pruneCharacterUniverseAssignments(assignments, characters) {
  const allowedCharacterIds = new Set(
    (Array.isArray(characters) ? characters : []).map((item) => String(item?.id || "").trim()).filter(Boolean)
  );
  const nextAssignments = {};
  for (const [characterId, universe] of Object.entries(assignments || {})) {
    if (!allowedCharacterIds.has(characterId) || !universe?.id) {
      continue;
    }
    nextAssignments[characterId] = universe;
  }
  return nextAssignments;
}
function getCommonScalar(resources, key) {
  if (!Array.isArray(resources) || !resources.length) {
    return null;
  }
  const firstValue = resources[0]?.[key] ?? null;
  return resources.every((resource) => (resource?.[key] ?? null) === firstValue) ? firstValue : null;
}
function getCommonItems(resources, key) {
  if (!Array.isArray(resources) || !resources.length) {
    return [];
  }
  const referenceItems = Array.isArray(resources[0]?.[key]) ? resources[0][key] : [];
  const allIdSets = resources.map((resource) => new Set((Array.isArray(resource?.[key]) ? resource[key] : []).map((item) => item.id)));
  return referenceItems.filter((item) => allIdSets.every((idSet) => idSet.has(item.id)));
}
function getCommonIds(resources, key) {
  return getCommonItems(resources, key).map((item) => item.id);
}
function arraysEqual2(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}
function clampPageNumber(value, totalPages = Number.MAX_SAFE_INTEGER) {
  const normalizedValue = Math.max(1, Number.parseInt(String(value || ""), 10) || 1);
  const normalizedTotalPages = Math.max(1, Number(totalPages || 1));
  return Math.min(normalizedValue, normalizedTotalPages);
}
function normalizeResourcePageState(sectionState, querySignature = "") {
  return {
    page: clampPageNumber(sectionState?.page, Number.MAX_SAFE_INTEGER),
    querySignature: String(sectionState?.querySignature || querySignature || "")
  };
}
function getResourcePageWindow(currentPage, totalPages) {
  const safeCurrentPage = clampPageNumber(currentPage, totalPages);
  const safeTotalPages = Math.max(1, Number(totalPages || 1));
  const pages = [];
  const lastPage = Math.min(safeTotalPages, safeCurrentPage + 8);
  for (let page = safeCurrentPage; page <= lastPage; page += 1) {
    pages.push(page);
  }
  return pages;
}
function mergeResourcesIntoItems(items, nextResources) {
  const nextById = new Map(
    (Array.isArray(nextResources) ? nextResources : []).filter(Boolean).map((item) => [item.id, item])
  );
  if (!nextById.size) {
    return Array.isArray(items) ? items : [];
  }
  return (Array.isArray(items) ? items : []).map((item) => nextById.get(item.id) || item);
}
function appendResourcePageItems(items, nextResources) {
  const nextItems = Array.isArray(nextResources) ? nextResources.filter(Boolean) : [];
  const nextById = new Map(nextItems.map((item) => [item.id, item]));
  const seenIds = /* @__PURE__ */ new Set();
  const mergedItems = [];
  for (const item of Array.isArray(items) ? items : []) {
    const itemId = String(item?.id || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    mergedItems.push(nextById.get(itemId) || item);
  }
  for (const item of nextItems) {
    const itemId = String(item?.id || "").trim();
    if (!itemId || seenIds.has(itemId)) {
      continue;
    }
    seenIds.add(itemId);
    mergedItems.push(item);
  }
  return mergedItems;
}
function appendBrowsePlacements(items, nextPlacements) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  for (const placement of [...Array.isArray(items) ? items : [], ...Array.isArray(nextPlacements) ? nextPlacements : []]) {
    const id = String(placement?.placementId || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(placement);
  }
  return merged;
}
function normalizeResourceEntityFilters(items) {
  const uniqueItems = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const kind = String(item?.kind || "").trim();
    const id = String(item?.id || "").trim();
    if (!kind || !id) {
      continue;
    }
    const dedupeKey = `${kind}:${id}`;
    if (seenIds.has(dedupeKey)) {
      continue;
    }
    seenIds.add(dedupeKey);
    uniqueItems.push({
      kind,
      id,
      label: String(item?.label || item?.displayName || "").trim() || null
    });
  }
  return uniqueItems;
}
function getSelectionChipKindClass(kind) {
  const normalizedKind = String(kind || "").trim();
  return normalizedKind ? `booruView__selectionChip--${normalizedKind}` : "";
}
function getMissingFilterChipClass(value) {
  if (value === "author") {
    return getSelectionChipKindClass("author");
  }
  if (value === "artist") {
    return getSelectionChipKindClass("artist");
  }
  if (value === "character") {
    return getSelectionChipKindClass("character");
  }
  if (value === "universe") {
    return getSelectionChipKindClass("universe");
  }
  if (value === "type") {
    return "booruView__selectionChip--reality";
  }
  return "";
}
function buildResourceQueryTokenLabel(token) {
  if (!token) {
    return "";
  }
  if (token.type === "entity") {
    const kindLabel = BOORU_ENTITY_KIND_LABELS[String(token.kind || "")] || "Entidad";
    return `${token.negative ? "No " : ""}${kindLabel}: ${token.value}`;
  }
  if (token.type === "tag") {
    return `${token.negative ? "No " : ""}Tag: ${token.value}`;
  }
  if (token.type === "reality") {
    return `Tipo: ${BOORU_REALITY_LABELS[token.value] || token.value}`;
  }
  if (token.type === "media-kind") {
    return `Media: ${BOORU_MEDIA_KIND_LABELS[token.value] || token.value}`;
  }
  if (token.type === "classification-state") {
    return token.value === "unclassified" ? "Sin clasificar" : String(token.value || "");
  }
  if (token.type === "missing") {
    if (token.value === "type") {
      return "Sin tipo";
    }
    if (token.value === "author") {
      return "Sin persona";
    }
    if (token.value === "artist") {
      return "Sin artist";
    }
    if (token.value === "character") {
      return "Sin char";
    }
    return "Sin universe";
  }
  return String(token.value || token.raw || "").trim();
}
function getResourceQueryTokenClass(token) {
  if (token?.type === "entity") {
    return getSelectionChipKindClass(token.kind);
  }
  if (token?.type === "reality") {
    return "booruView__selectionChip--reality";
  }
  if (token?.type === "missing") {
    return getMissingFilterChipClass(token.value);
  }
  return "";
}
function buildResourceSearchTokenKey(token) {
  return [
    String(token?.type || "").trim(),
    token?.negative ? "1" : "0",
    String(token?.kind || "").trim(),
    String(token?.id || "").trim(),
    String(token?.value || "").trim()
  ].join("|");
}
function normalizeResourceSearchToken(token) {
  if (!token || typeof token !== "object") {
    return null;
  }
  const type = String(token?.type || "").trim();
  const negative = Boolean(token?.negative);
  const id = String(token?.id || "").trim() || null;
  const value = String(token?.value || "").trim();
  if (!value) {
    return null;
  }
  if (type === "entity") {
    const kind = String(token?.kind || "").trim();
    if (!ENTITY_KIND_SECTION_MAP[kind]) {
      return null;
    }
    return {
      type,
      negative,
      kind,
      id,
      value,
      label: String(token?.label || value).trim() || value
    };
  }
  if (type === "tag") {
    return {
      type,
      negative,
      id,
      value,
      label: String(token?.label || value).trim() || value
    };
  }
  if (type === "reality") {
    const normalizedReality = value === "real" || value === "ficticio" ? value : "";
    if (!normalizedReality) {
      return null;
    }
    return {
      type,
      negative: false,
      value: normalizedReality,
      label: normalizedReality
    };
  }
  if (type === "missing") {
    const normalizedMissing = value === "type" || value === "author" || value === "artist" || value === "character" || value === "universe" ? value : "";
    if (!normalizedMissing) {
      return null;
    }
    return {
      type,
      negative: false,
      value: normalizedMissing,
      label: normalizedMissing
    };
  }
  if (type === "media-kind") {
    const normalizedMediaKind = value === "image" || value === "video" || value === "gif" ? value : "";
    if (!normalizedMediaKind) {
      return null;
    }
    return {
      type,
      negative: false,
      value: normalizedMediaKind,
      label: normalizedMediaKind
    };
  }
  if (type === "classification-state") {
    if (value !== "unclassified") {
      return null;
    }
    return {
      type,
      negative: false,
      value,
      label: value
    };
  }
  return null;
}
function normalizeResourceSearchTokens(items) {
  const seenKeys = /* @__PURE__ */ new Set();
  const normalizedTokens = [];
  for (const rawToken of Array.isArray(items) ? items : []) {
    const normalizedToken = normalizeResourceSearchToken(rawToken);
    if (!normalizedToken) {
      continue;
    }
    const tokenKey = buildResourceSearchTokenKey(normalizedToken);
    if (seenKeys.has(tokenKey)) {
      continue;
    }
    seenKeys.add(tokenKey);
    normalizedTokens.push(normalizedToken);
  }
  return normalizedTokens;
}
function createSearchTokenFromParsedToken(token) {
  return normalizeResourceSearchToken({
    ...token,
    id: token?.id || null,
    label: token?.value
  });
}
function buildResourceSearchInputTokens(input) {
  const directTokens = normalizeResourceSearchTokens(input?.resourceSearchTokens);
  if (directTokens.length) {
    return directTokens;
  }
  return normalizeResourceEntityFilters(input?.entityFilters).map((filter) => ({
    type: "entity",
    negative: false,
    kind: filter.kind,
    id: filter.id,
    value: filter.label || filter.id,
    label: filter.label || filter.id
  }));
}
function getRecommendationItemKindClass(item) {
  if (item?.type === "entity") {
    return getSelectionChipKindClass(item.kind);
  }
  if (item?.type === "create-entity") {
    return getSelectionChipKindClass(item.kind);
  }
  if (item?.type === "reality-action") {
    return "booruView__selectionChip--reality";
  }
  return "";
}
function getRecommendationKindBadgeLabel(item) {
  if (item?.type === "reality-action") {
    return "R";
  }
  if (item?.type === "tag" || item?.type === "create-tag") {
    return "T";
  }
  if (item?.kind === "author") {
    return "P";
  }
  if (item?.kind === "artist") {
    return "A";
  }
  if (item?.kind === "character") {
    return "C";
  }
  if (item?.kind === "universe") {
    return "U";
  }
  return "?";
}
function getRecommendationKindTooltip(item) {
  if (item?.type === "reality-action") {
    return "Realidad";
  }
  if (item?.type === "tag" || item?.type === "create-tag") {
    return "Tag";
  }
  if (item?.kind === "author") {
    return "Persona";
  }
  if (item?.kind === "artist") {
    return "Artist";
  }
  if (item?.kind === "character") {
    return "Character";
  }
  if (item?.kind === "universe") {
    return "Universe";
  }
  return "";
}
function normalizeEntityProfileInput(value, sectionKind = null) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const kind = String(value?.kind || "").trim();
  const id = String(value?.id || "").trim();
  const requestedTab = String(value?.tab || "").trim();
  const tab = getBooruEntityProfileTabOptions(kind).some((option) => option.value === requestedTab) ? requestedTab : "gallery";
  if (!kind || !id || !ENTITY_KIND_SECTION_MAP[kind]) {
    return null;
  }
  if (sectionKind && sectionKind !== kind) {
    return null;
  }
  return {
    kind,
    id,
    tab
  };
}
function getEntityProfileKey(entityProfile) {
  if (!entityProfile?.kind || !entityProfile?.id) {
    return "";
  }
  return `${entityProfile.kind}:${entityProfile.id}`;
}
function getEntityProfileLabel(entityProfile, profileData = null) {
  return String(
    profileData?.displayName || entityProfile?.displayName || entityProfile?.label || ""
  ).trim();
}
function isPreviewableMediaKind(mediaKind) {
  const normalizedMediaKind = String(mediaKind || "").trim();
  return normalizedMediaKind === "image" || normalizedMediaKind === "gif" || normalizedMediaKind === "video";
}
function isClipboardCompatibleMediaKind(mediaKind) {
  const normalizedMediaKind = String(mediaKind || "").trim();
  return normalizedMediaKind === "image" || normalizedMediaKind === "gif";
}
function canUseResourceAsEntityVisual(resource) {
  return isPreviewableMediaKind(resource?.mediaKind);
}
function canUseResourceForImageActions(resource) {
  return isClipboardCompatibleMediaKind(resource?.mediaKind);
}
function buildContextResourceFromDescriptor(descriptor) {
  const source = descriptor?.source && typeof descriptor.source === "object" ? descriptor.source : null;
  const resourceId = String(source?.resourceId || descriptor?.resourceId || descriptor?.sampleResourceId || descriptor?.id || "").trim();
  const previewPath = String(source?.previewPath || descriptor?.sampleStoragePath || descriptor?.cardPreviewPath || "").trim();
  const storagePath = String(
    source?.pathValue || descriptor?.originalStoragePath || descriptor?.cardOriginalStoragePath || descriptor?.storagePath || descriptor?.cardStoragePath || descriptor?.sampleStoragePath || descriptor?.cardPreviewPath || ""
  ).trim();
  const mediaKind = String(
    source?.mediaKind || descriptor?.originalMediaKind || descriptor?.cardOriginalMediaKind || descriptor?.sampleMediaKind || descriptor?.cardMediaKind || descriptor?.mediaKind || ""
  ).trim();
  if (!resourceId || !storagePath || !isPreviewableMediaKind(mediaKind)) {
    return null;
  }
  return {
    id: resourceId,
    storagePath,
    previewPath,
    mediaKind
  };
}
function getInitials(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) {
    return "?";
  }
  return words.map((word) => word[0]?.toUpperCase() || "").join("");
}
function stepSuggestionIndex(currentIndex, length, direction) {
  if (!length) {
    return -1;
  }
  if (currentIndex < 0) {
    return direction > 0 ? 0 : length - 1;
  }
  return (currentIndex + direction + length) % length;
}
function normalizeSectionSelection(sectionState, visibleIds = null) {
  const nextIds = Array.isArray(sectionState?.ids) ? sectionState.ids.filter(Boolean) : [];
  const allowedIds = visibleIds instanceof Set ? nextIds.filter((resourceId) => visibleIds.has(resourceId)) : nextIds;
  const collapsedByVisibility = visibleIds instanceof Set && allowedIds.length < nextIds.length;
  const nextMode = allowedIds.length > 0 && sectionState?.mode === "multi" && !(collapsedByVisibility && allowedIds.length === 1) ? "multi" : "single";
  const nextActiveId = allowedIds.includes(sectionState?.activeId) ? sectionState.activeId : allowedIds.at(-1) || "";
  return {
    ids: allowedIds,
    activeId: nextActiveId,
    mode: nextMode
  };
}
function markDraftDirty(draft, fieldName) {
  const dirtyFields = new Set(Array.isArray(draft?.dirtyFields) ? draft.dirtyFields : []);
  dirtyFields.add(fieldName);
  return {
    ...draft,
    dirtyFields: Array.from(dirtyFields),
    mixedFields: (Array.isArray(draft?.mixedFields) ? draft.mixedFields : []).filter((mixedField) => mixedField !== fieldName)
  };
}
function applyClassificationPolicyToDraft(draft, { realityWasEdited = false } = {}) {
  const realityPolicy = resolveBooruReality({
    reality: draft?.reality,
    realitySource: draft?.realitySource,
    realityWasEdited,
    authors: draft?.authors,
    artists: draft?.artists,
    characters: draft?.characters,
    universes: draft?.universes
  });
  return {
    ...draft,
    reality: realityPolicy.reality,
    realitySource: realityPolicy.source
  };
}
function buildClassificationDraft(resources) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);
  if (!normalizedResources.length) {
    return {
      resourceIds: [],
      reality: null,
      realitySource: "auto",
      authors: [],
      artists: [],
      characters: [],
      universes: [],
      manualTags: [],
      characterUniverses: {},
      dirtyFields: [],
      mixedFields: []
    };
  }
  if (normalizedResources.length === 1) {
    const resource = normalizedResources[0];
    return {
      resourceIds: [resource.id],
      reality: resource.reality || null,
      realitySource: normalizeRealitySource(resource.realitySource),
      authors: Array.isArray(resource.authors) ? resource.authors : [],
      artists: Array.isArray(resource.artists) ? resource.artists : [],
      characters: Array.isArray(resource.characters) ? resource.characters : [],
      universes: Array.isArray(resource.directUniverses) ? resource.directUniverses : [],
      manualTags: Array.isArray(resource.manualTags) ? resource.manualTags : [],
      characterUniverses: {},
      dirtyFields: [],
      mixedFields: []
    };
  }
  return {
    resourceIds: normalizedResources.map((resource) => resource.id),
    reality: getCommonScalar(normalizedResources, "reality"),
    realitySource: normalizeRealitySource(getCommonScalar(normalizedResources, "realitySource")),
    authors: getCommonItems(normalizedResources, "authors"),
    artists: getCommonItems(normalizedResources, "artists"),
    characters: getCommonItems(normalizedResources, "characters"),
    universes: getCommonItems(normalizedResources, "directUniverses"),
    manualTags: getCommonItems(normalizedResources, "manualTags"),
    characterUniverses: {},
    dirtyFields: [],
    mixedFields: getBooruDetailsMixedFields(normalizedResources)
  };
}
function canSaveClassification(draft) {
  if (!draft?.resourceIds?.length) {
    return false;
  }
  const characters = (Array.isArray(draft.characters) ? draft.characters : []).map((character) => ({
    ...character,
    universe: resolveCharacterUniverse(draft, character)
  }));
  return getBooruEssentialState({
    reality: draft.reality,
    authors: draft.authors,
    artists: draft.artists,
    characters,
    universes: draft.universes
  }).complete;
}
function canSaveDraftProgress(draft) {
  return Array.isArray(draft?.dirtyFields) && draft.dirtyFields.length > 0;
}
function buildRelationPatch(currentIds, nextIds) {
  return {
    addIds: nextIds.filter((entry) => !currentIds.includes(entry)),
    removeIds: currentIds.filter((entry) => !nextIds.includes(entry))
  };
}
function buildSavePayload(selectedResources, draft) {
  const normalizedResources = (Array.isArray(selectedResources) ? selectedResources : []).filter(Boolean);
  const dirtyFields = Array.isArray(draft?.dirtyFields) ? draft.dirtyFields : [];
  const characterUniverseAssignments = (Array.isArray(draft?.characters) ? draft.characters : []).map((character) => {
    const assignedUniverse = getDraftUniverseForCharacter(draft, character.id);
    if (!assignedUniverse) {
      return null;
    }
    const currentUniverseId = getCharacterUniverse(character)?.id || "";
    if (normalizedResources.length === 1 && currentUniverseId === assignedUniverse.id) {
      return null;
    }
    return {
      characterId: character.id,
      universeId: assignedUniverse.id
    };
  }).filter(Boolean);
  if (normalizedResources.length === 1) {
    return {
      resourceId: normalizedResources[0].id,
      dirtyFields,
      reality: draft.reality,
      authorIds: draft.authors.map((item) => item.id),
      artistIds: draft.artists.map((item) => item.id),
      characterIds: draft.characters.map((item) => item.id),
      universeIds: draft.universes.map((item) => item.id),
      tagIds: draft.manualTags.map((item) => item.id),
      characterUniverses: characterUniverseAssignments
    };
  }
  return {
    resourceIds: normalizedResources.map((resource) => resource.id),
    dirtyFields,
    reality: draft.reality,
    authorPatch: buildRelationPatch(getCommonIds(normalizedResources, "authors"), draft.authors.map((item) => item.id)),
    artistPatch: buildRelationPatch(getCommonIds(normalizedResources, "artists"), draft.artists.map((item) => item.id)),
    characterPatch: buildRelationPatch(getCommonIds(normalizedResources, "characters"), draft.characters.map((item) => item.id)),
    universePatch: buildRelationPatch(getCommonIds(normalizedResources, "directUniverses"), draft.universes.map((item) => item.id)),
    tagPatch: buildRelationPatch(getCommonIds(normalizedResources, "manualTags"), draft.manualTags.map((item) => item.id)),
    characterUniverses: characterUniverseAssignments
  };
}
function isTextInputTarget(target) {
  const nodeName = String(target?.nodeName || "").toLowerCase();
  if (target?.isContentEditable) {
    return true;
  }
  return nodeName === "input" || nodeName === "textarea" || nodeName === "select" || nodeName === "button";
}
function mergeSnapshotQueueRequest(currentRequest, nextRequest) {
  const normalizedCurrent = currentRequest && typeof currentRequest === "object" ? currentRequest : {
    silent: true,
    syncResources: false,
    reasons: []
  };
  const normalizedNext = nextRequest && typeof nextRequest === "object" ? nextRequest : {
    silent: true,
    syncResources: false,
    reasons: []
  };
  return {
    silent: Boolean(normalizedCurrent.silent) && Boolean(normalizedNext.silent),
    syncResources: Boolean(normalizedCurrent.syncResources) || Boolean(normalizedNext.syncResources),
    reasons: Array.from(/* @__PURE__ */ new Set([
      ...Array.isArray(normalizedCurrent.reasons) ? normalizedCurrent.reasons : [],
      ...Array.isArray(normalizedNext.reasons) ? normalizedNext.reasons : []
    ])).slice(-6)
  };
}
function getResourceVirtualRange({
  itemCount,
  columns,
  rowHeight,
  scrollTop,
  viewportHeight
}) {
  if (!itemCount || !columns || !rowHeight) {
    return {
      startIndex: 0,
      endIndex: itemCount
    };
  }
  const totalRows = Math.ceil(itemCount / columns);
  const startRow = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - RESOURCE_GRID_OVERSCAN_ROWS
  );
  const endRow = Math.min(
    totalRows,
    Math.ceil((scrollTop + Math.max(1, viewportHeight)) / rowHeight) + RESOURCE_GRID_OVERSCAN_ROWS
  );
  return {
    startIndex: startRow * columns,
    endIndex: Math.min(itemCount, endRow * columns)
  };
}
function parseResourceSearchDraft(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return {
      raw: "",
      negative: false,
      mode: "tag",
      value: ""
    };
  }
  const negative = rawValue.startsWith("-") && rawValue.length > 1;
  const normalizedValue = negative ? rawValue.slice(1) : rawValue;
  const separatorIndex = normalizedValue.indexOf(":");
  if (separatorIndex > 0) {
    const rawPrefix = normalizedValue.slice(0, separatorIndex);
    const rawTokenValue = normalizedValue.slice(separatorIndex + 1).trim();
    const entityKind = normalizeBooruEntityPrefix(rawPrefix);
    if (entityKind) {
      return {
        raw: rawValue,
        negative,
        mode: "entity",
        kind: entityKind,
        value: rawTokenValue
      };
    }
    if (normalizeSearchText(rawPrefix) === "tag") {
      return {
        raw: rawValue,
        negative,
        mode: "tag",
        value: rawTokenValue
      };
    }
    if (normalizeSearchText(rawPrefix) === "reality") {
      return {
        raw: rawValue,
        negative: false,
        mode: "reality",
        value: rawTokenValue
      };
    }
    if (normalizeSearchText(rawPrefix) === "missing") {
      return {
        raw: rawValue,
        negative: false,
        mode: "missing",
        value: rawTokenValue
      };
    }
  }
  return {
    raw: rawValue,
    negative,
    mode: "tag",
    value: normalizedValue.replace(/^"|"$/g, "")
  };
}
function createResourceSearchTokenFromSuggestion(fragment, suggestion) {
  const parsedDraft = parseResourceSearchDraft(fragment);
  if (!suggestion) {
    return null;
  }
  if (suggestion.type === "entity") {
    return normalizeResourceSearchToken({
      type: "entity",
      negative: parsedDraft.negative,
      kind: suggestion.kind,
      id: suggestion.entityId || suggestion.id || null,
      value: suggestion.label,
      label: suggestion.label
    });
  }
  if (suggestion.type === "tag") {
    return normalizeResourceSearchToken({
      type: "tag",
      negative: parsedDraft.negative,
      id: suggestion.tagId || suggestion.id || null,
      value: suggestion.label,
      label: suggestion.label
    });
  }
  if (suggestion.type === "reality" || suggestion.type === "missing") {
    return normalizeResourceSearchToken({
      type: suggestion.type,
      negative: false,
      value: suggestion.value,
      label: suggestion.label
    });
  }
  return null;
}
function createResourceSearchTokenFromFragment(fragment) {
  const parsedSearch = parseBooruSearchSyntax(fragment);
  return createSearchTokenFromParsedToken(parsedSearch?.tokens?.[0] || null);
}
function BooruWorkspaceView({ input = null, ctx }) {
  const uiPreferencesApi = useMemo13(
    () => ctx.createPluginSettingsApi("nexus.booru.ui", {
      gridColumns: BOORU_DEFAULT_GRID_COLUMNS
    }),
    [ctx]
  );
  const persistedUiPreferences = uiPreferencesApi.useValue();
  const gridColumns = useMemo13(
    () => normalizeBooruGridPreferences(persistedUiPreferences?.gridColumns),
    [persistedUiPreferences?.gridColumns]
  );
  const [snapshot, setSnapshot] = useState21(null);
  const [loading, setLoading] = useState21(true);
  const [resourceLoading, setResourceLoading] = useState21(false);
  const [busyAction, setBusyAction] = useState21("");
  const [savingClassification, setSavingClassification] = useState21(false);
  const [error, setError] = useState21("");
  const [resourceSearchTokens, setResourceSearchTokens] = useState21(() => buildResourceSearchInputTokens(input));
  const [resourceSearchText, setResourceSearchText] = useState21("");
  const [entitySearchValue, setEntitySearchValue] = useState21("");
  const [entitySearchTokens, setEntitySearchTokens] = useState21([]);
  const [resourceBrowse, setResourceBrowse] = useState21(() => normalizeBooruBrowseQuery(null, "resource"));
  const [entityBrowse, setEntityBrowse] = useState21(() => normalizeBooruBrowseQuery(null, "entity"));
  const [entityCreateValue, setEntityCreateValue] = useState21("");
  const [resourceMediaKindFilter, setResourceMediaKindFilter] = useState21("all");
  const [resourceRealityFilter, setResourceRealityFilter] = useState21("all");
  const [resourceMissingFilter, setResourceMissingFilter] = useState21(BOORU_NO_MISSING_FILTER);
  const [resourcePendingMode, setResourcePendingMode] = useState21("essential");
  const [resourceState, setResourceState] = useState21({
    items: [],
    placements: [],
    totalCount: 0,
    placementCount: 0,
    hasMore: false,
    querySignature: ""
  });
  const [resourcePageState, setResourcePageState] = useState21(RESOURCE_PAGE_SECTIONS);
  const [selectedResourceState, setSelectedResourceState] = useState21(RESOURCE_SELECTION_SECTIONS);
  const [classificationDraft, setClassificationDraft] = useState21(buildClassificationDraft([]));
  const [entityItems, setEntityItems] = useState21([]);
  const [entityPlacements, setEntityPlacements] = useState21([]);
  const [entityTotalCount, setEntityTotalCount] = useState21(0);
  const [entityHasMore, setEntityHasMore] = useState21(false);
  const [entityLoading, setEntityLoading] = useState21(false);
  const [entityBusy, setEntityBusy] = useState21(false);
  const [entityError, setEntityError] = useState21("");
  const [entityProfile, setEntityProfile] = useState21(null);
  const [entityProfileLoading, setEntityProfileLoading] = useState21(false);
  const [entityProfileError, setEntityProfileError] = useState21("");
  const [entityProfileGalleryState, setEntityProfileGalleryState] = useState21({ items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false });
  const [entityProfileGalleryLoading, setEntityProfileGalleryLoading] = useState21(false);
  const [entityProfileRelationState, setEntityProfileRelationState] = useState21({ items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false, relationKind: null });
  const [entityProfileRelationLoading, setEntityProfileRelationLoading] = useState21(false);
  const [entityProfilePageState, setEntityProfilePageState] = useState21(ENTITY_PROFILE_PAGE_SECTIONS);
  const [universeCharacterCreateValue, setUniverseCharacterCreateValue] = useState21("");
  const [entityRevision, setEntityRevision] = useState21(0);
  const [contextMenuState, setContextMenuState] = useState21(null);
  const [customDragState, setCustomDragState] = useState21(null);
  const [inspectorOpen, setInspectorOpen] = useState21(false);
  const [detailsContext, setDetailsContext] = useState21(null);
  const [anchoredResources, setAnchoredResources] = useState21([]);
  const [floatingDetailsGeometry, setFloatingDetailsGeometry] = useState21(() => createBooruFloatingDetailsGeometry({
    width: window.innerWidth,
    height: window.innerHeight
  }));
  const [resourceHeroState, setResourceHeroState] = useState21(null);
  const [entityVisualCropState, setEntityVisualCropState] = useState21(null);
  const [clipboardAssociationState, setClipboardAssociationState] = useState21(null);
  const [characterCreationName, setCharacterCreationName] = useState21("");
  const [activeRouteScrollTop, setActiveRouteScrollTop] = useState21(0);
  const [profileGallerySelectedIds, setProfileGallerySelectedIds] = useState21([]);
  const characterCreationResolverRef = useRef14(null);
  const hoveredEntityRef = useRef14(null);
  const hoveredGroupAssociationRef = useRef14(null);
  const routeSessionsRef = useRef14(/* @__PURE__ */ new Map());
  const sectionLastRouteRef = useRef14(/* @__PURE__ */ new Map());
  const sectionNavigationRef = useRef14(/* @__PURE__ */ new Map());
  const activeRouteScrollTopRef = useRef14(0);
  const finishCharacterCreation = useCallback7((result = null) => {
    const resolveRequest = characterCreationResolverRef.current;
    characterCreationResolverRef.current = null;
    setCharacterCreationName("");
    resolveRequest?.(result);
  }, []);
  const ensureEntityFromUi = useCallback7((kind, name) => {
    if (kind !== "character") {
      return invoke6("booru:ensure-entity", { kind, name });
    }
    return new Promise((resolve) => {
      characterCreationResolverRef.current?.(null);
      characterCreationResolverRef.current = resolve;
      setCharacterCreationName(String(name || "").trim());
    });
  }, []);
  useEffect25(() => () => {
    characterCreationResolverRef.current?.(null);
    characterCreationResolverRef.current = null;
  }, []);
  const activeSection = getActiveSection(input);
  const settingsSubview = getSettingsSubview(input);
  const activeResourceSection = getActiveResourceSection(activeSection, settingsSubview);
  const normalizedResourceSearchTokens = useMemo13(
    () => normalizeResourceSearchTokens(resourceSearchTokens),
    [resourceSearchTokens]
  );
  const resourceSearchTokensSignature = useMemo13(
    () => normalizedResourceSearchTokens.map((token) => buildResourceSearchTokenKey(token)).join("|"),
    [normalizedResourceSearchTokens]
  );
  const deferredEntitySearchValue = useDeferredValue2(entitySearchValue);
  const normalizedEntitySearchTokens = useMemo13(
    () => normalizeResourceSearchTokens(entitySearchTokens),
    [entitySearchTokens]
  );
  const activeEntityKind = ENTITY_SECTION_KIND_MAP[activeSection] || null;
  const activeEntityProfile = normalizeEntityProfileInput(input?.entityProfile, activeEntityKind);
  const workspaceRoute = useMemo13(
    () => normalizeBooruWorkspaceRoute({
      section: activeSection,
      settingsSubview,
      entityProfile: activeEntityProfile
    }),
    [activeEntityProfile?.id, activeEntityProfile?.kind, activeEntityProfile?.tab, activeSection, settingsSubview]
  );
  const workspaceRouteKey = createBooruWorkspaceRouteKey(workspaceRoute);
  const showResourceWorkspace = Boolean(activeResourceSection);
  const showClassificationSidebar = CLASSIFICATION_SIDEBAR_SECTIONS.has(activeResourceSection);
  const supportsMissingResourceFilters = activeResourceSection === "pending" && resourcePendingMode === "essential";
  const visibleRealityFilterOptions = activeResourceSection === "media" ? MEDIA_REALITY_FILTER_OPTIONS : PENDING_REALITY_FILTER_OPTIONS;
  const effectiveResourceRealityFilter = activeResourceSection === "media" && resourceRealityFilter === "untyped" ? "all" : resourceRealityFilter;
  const resourceQuerySearchTokens = useMemo13(
    () => supportsMissingResourceFilters ? normalizedResourceSearchTokens : normalizedResourceSearchTokens.filter((token) => token?.type !== "missing"),
    [normalizedResourceSearchTokens, supportsMissingResourceFilters]
  );
  const showEntityProfile = Boolean(activeEntityKind && activeEntityProfile?.id);
  const activeEntityRelationKind = showEntityProfile ? getBooruEntityRelationKindFromTab(activeEntityKind, activeEntityProfile?.tab) : null;
  const activeEntityProfileBrowseTab = activeEntityProfile?.tab === "gallery" || Boolean(activeEntityRelationKind);
  const entityBrowseUsesResources = showEntityProfile && activeEntityProfile?.tab === "gallery";
  const allowUniverseEntitySort = activeEntityKind === "character" || activeEntityRelationKind === "character" && activeEntityKind !== "universe";
  const entitySearchAllowedKinds = useMemo13(
    () => entityBrowseUsesResources ? null : [activeEntityRelationKind || activeEntityKind].filter(Boolean),
    [activeEntityKind, activeEntityRelationKind, entityBrowseUsesResources]
  );
  const resourceItems = Array.isArray(resourceState?.items) ? resourceState.items : [];
  const [visibleResourceIds, setVisibleResourceIds] = useState21([]);
  const entityProfileGalleryItems = Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [];
  const resourceQuery = useMemo13(() => buildBooruResourceQuery({
    searchTokens: resourceQuerySearchTokens,
    freeText: resourceSearchText,
    browse: resourceBrowse,
    mediaKindFilter: showClassificationSidebar ? resourceMediaKindFilter : "all",
    realityFilter: showClassificationSidebar ? effectiveResourceRealityFilter : "all",
    pendingMode: activeResourceSection === "pending" ? resourcePendingMode : "essential",
    missingFilter: showClassificationSidebar && supportsMissingResourceFilters ? resourceMissingFilter : BOORU_NO_MISSING_FILTER
  }), [
    activeResourceSection,
    effectiveResourceRealityFilter,
    resourceMediaKindFilter,
    resourceMissingFilter,
    resourcePendingMode,
    resourceQuerySearchTokens,
    resourceSearchText,
    resourceBrowse,
    showClassificationSidebar,
    supportsMissingResourceFilters
  ]);
  const resourceQuerySignature = JSON.stringify(resourceQuery || {});
  const recommendationScope = getBooruRecommendationScope(activeResourceSection, resourcePendingMode);
  const contextualMissingFilterOptions = useMemo13(
    () => getBooruContextualMissingFilterOptions(
      resourceQuery.reality,
      resourceQuery.includeEntities,
      recommendationScope
    ),
    [recommendationScope, resourceQuerySignature]
  );
  const contextualMissingFilterOptionsSignature = JSON.stringify(contextualMissingFilterOptions);
  const hasContextualMissingFilters = contextualMissingFilterOptions.some(
    (option) => option.value !== BOORU_NO_MISSING_FILTER
  );
  const visibleMissingFilterValue = contextualMissingFilterOptions.some(
    (option) => option.value === resourceQuery.missing && !option.disabled
  ) ? resourceQuery.missing : BOORU_NO_MISSING_FILTER;
  const entityProfileKey = getEntityProfileKey(activeEntityProfile);
  const entityThumbnailPrimingEnabled = showEntityProfile && activeEntityProfile?.tab === "gallery";
  const visibleResourceItems = useMemo13(() => {
    if (activeResourceSection !== "media" || !visibleResourceIds.length) {
      return resourceItems;
    }
    const visibleIds = new Set(visibleResourceIds);
    return resourceItems.filter((item) => visibleIds.has(item.id));
  }, [activeResourceSection, resourceItems, visibleResourceIds]);
  const thumbnailPrimingItems = showResourceWorkspace ? visibleResourceItems : entityThumbnailPrimingEnabled ? entityProfileGalleryItems : [];
  const mediaThumbnailPrimingItems = useMemo13(
    () => activeResourceSection === "media" ? thumbnailPrimingItems.filter((item) => {
      const status = String(item?.thumbnail?.status || "").trim();
      return status !== "ready" && status !== "error";
    }) : thumbnailPrimingItems,
    [activeResourceSection, thumbnailPrimingItems]
  );
  const currentEntityProfilePage = activeEntityKind ? clampPageNumber(entityProfilePageState?.[activeSection]?.page, Number.MAX_SAFE_INTEGER) : 1;
  const visibleThumbnailPrimingUnavailableRef = useRef14(false);
  const primedResourcePageSignatureRef = useRef14("");
  const primedMediaThumbnailIdsRef = useRef14(/* @__PURE__ */ new Set());
  const visibleResourceIdsRef = useRef14([]);
  const mediaLoadMoreLockedRef = useRef14(false);
  const mediaResourceRequestRef = useRef14(null);
  const mediaThumbnailRefreshRef = useRef14({
    inFlight: false,
    queued: false
  });
  const classificationDraftRef = useRef14(classificationDraft);
  const resourceRequestVersionRef = useRef14(0);
  const entitySectionRequestVersionRef = useRef14(0);
  const entityProfileRequestVersionRef = useRef14(0);
  const entityProfileGalleryRequestVersionRef = useRef14(0);
  const entityProfileRelationRequestVersionRef = useRef14(0);
  const latestInputRef = useRef14(input);
  const diagnosticsContextRef = useRef14({
    activeSection,
    showResourceWorkspace,
    showEntityProfile,
    currentResourcePage: 1,
    currentEntityProfilePage: 1,
    resourceItemCount: 0,
    entityItemCount: 0,
    selectedCount: 0,
    loading: true,
    resourceLoading: false,
    entityLoading: false,
    busyAction: ""
  });
  const renderBurstRef = useRef14({
    windowStartedAt: performance.now(),
    renderCount: 0,
    lastLoggedAt: 0
  });
  const snapshotRequestStateRef = useRef14({
    inFlight: false,
    queuedRequest: null
  });
  const autosaveTimerRef = useRef14(0);
  const autosaveStateRef = useRef14({
    inFlight: false,
    queued: false
  });
  const customDragSessionRef = useRef14(null);
  const customDragTimerRef = useRef14(0);
  const suppressNextResourceClickRef = useRef14(false);
  const handleQuickAssignEntityRef = useRef14(null);
  const lastSectionNonceRef = useRef14(String(input?.[WORKSPACE_FRAME_SECTION_NONCE_KEY] || "").trim());
  const currentWorkspaceRouteRef = useRef14(workspaceRoute);
  const latestWorkspaceSessionStateRef = useRef14(null);
  const anchoredResourcesRef = useRef14([]);
  const detailsAnchorRef = useRef14({ open: false, section: "", ids: [], activeId: "" });
  const detailsAnchorRequestVersionRef = useRef14(0);
  const resourceWindowContextRef = useRef14(null);
  const resourceWindowRequestVersionRef = useRef14(0);
  const currentResourcePage = showResourceWorkspace ? normalizeResourcePageState(resourcePageState[activeResourceSection], resourceQuerySignature).page : 1;
  const currentResourcePageMatchesQuery = !showResourceWorkspace || String(resourcePageState?.[activeResourceSection]?.querySignature || "") === resourceQuerySignature;
  resourceWindowContextRef.current = {
    activeResourceSection,
    currentResourcePage,
    itemCount: resourceItems.length,
    query: resourceQuery,
    querySignature: resourceQuerySignature,
    showResourceWorkspace
  };
  latestWorkspaceSessionStateRef.current = {
    resourceSearchTokens,
    resourceSearchText,
    resourceBrowse,
    resourceMediaKindFilter,
    resourceRealityFilter,
    resourceMissingFilter,
    resourcePendingMode,
    resourceState,
    resourcePageState,
    selectedResourceState,
    entitySearchValue,
    entitySearchTokens,
    entityBrowse,
    entityItems,
    entityPlacements,
    entityTotalCount,
    entityHasMore,
    entityProfile,
    entityProfileGalleryState,
    entityProfileRelationState,
    entityProfilePageState,
    profileGallerySelectedIds
  };
  const handleVisibleResourceIdsChange = useCallback7((nextIds) => {
    const normalizedIds = uniqueIds(nextIds);
    setVisibleResourceIds((currentIds) => arraysEqual2(currentIds, normalizedIds) ? currentIds : normalizedIds);
  }, []);
  useEffect25(() => {
    visibleResourceIdsRef.current = visibleResourceIds;
  }, [visibleResourceIds]);
  useEffect25(() => {
    booruViewLogger.info(
      "booru.dnd.runtime",
      "Booru verifico el runtime compartido de drag and drop.",
      {
        hasUseDrag: typeof useDrag === "function",
        hasUseDrop: typeof useDrop === "function",
        hasUseDragLayer: typeof useDragLayer === "function",
        hasEmptyImage: typeof getEmptyImage === "function"
      }
    );
  }, []);
  useEffect25(() => {
    classificationDraftRef.current = classificationDraft;
  }, [classificationDraft]);
  useEffect25(() => {
    anchoredResourcesRef.current = anchoredResources;
  }, [anchoredResources]);
  useEffect25(() => {
    latestInputRef.current = input;
  }, [input]);
  useEffect25(() => {
    hoveredEntityRef.current = null;
    hoveredGroupAssociationRef.current = null;
  }, [workspaceRouteKey]);
  const captureWorkspaceRouteSession = useCallback7((routeValue) => {
    const route = normalizeBooruWorkspaceRoute(routeValue);
    const routeKey = createBooruWorkspaceRouteKey(route);
    const state = latestWorkspaceSessionStateRef.current;
    if (!state) return;
    const resourceSection = getActiveResourceSection(route.section, route.settingsSubview);
    const session = {
      route,
      query: null,
      filters: null,
      order: null,
      direction: null,
      grouping: null,
      results: null,
      selection: null,
      scrollTop: activeRouteScrollTopRef.current
    };
    if (resourceSection) {
      session.query = state.resourceSearchTokens;
      session.freeText = state.resourceSearchText;
      session.filters = {
        mediaKind: state.resourceMediaKindFilter,
        reality: state.resourceRealityFilter,
        missing: state.resourceMissingFilter,
        pendingMode: state.resourcePendingMode
      };
      session.results = state.resourceState;
      session.page = state.resourcePageState?.[resourceSection] || null;
      session.selection = state.selectedResourceState?.[resourceSection] || null;
      session.order = state.resourceBrowse?.sortBy || null;
      session.direction = state.resourceBrowse?.direction || null;
      session.grouping = state.resourceBrowse?.grouping || null;
      session.randomSeed = state.resourceBrowse?.randomSeed || null;
      session.groupBy = state.resourceBrowse?.groupBy || null;
      session.groupOrderBy = state.resourceBrowse?.groupOrderBy || null;
    } else if (route.entityKind) {
      const routeBrowse = route.profile?.tab === "gallery" ? state.resourceBrowse : state.entityBrowse;
      session.query = state.entitySearchValue;
      session.exactFilters = state.entitySearchTokens;
      session.order = routeBrowse?.sortBy || null;
      session.direction = routeBrowse?.direction || null;
      session.grouping = routeBrowse?.grouping || null;
      session.randomSeed = routeBrowse?.randomSeed || null;
      session.groupBy = routeBrowse?.groupBy || null;
      session.groupOrderBy = routeBrowse?.groupOrderBy || null;
      session.results = route.profile ? {
        profile: state.entityProfile,
        gallery: state.entityProfileGalleryState,
        relations: state.entityProfileRelationState
      } : {
        entities: state.entityItems,
        placements: state.entityPlacements,
        totalCount: state.entityTotalCount,
        hasMore: state.entityHasMore
      };
      session.page = state.entityProfilePageState?.[route.section] || null;
      session.selection = route.profile ? state.profileGallerySelectedIds : null;
    }
    routeSessionsRef.current.set(routeKey, session);
    sectionLastRouteRef.current.set(route.section, route);
  }, []);
  const restoreWorkspaceRouteSession = useCallback7((routeValue, routeInput = null) => {
    const route = normalizeBooruWorkspaceRoute(routeValue);
    const routeKey = createBooruWorkspaceRouteKey(route);
    const session = routeSessionsRef.current.get(routeKey) || null;
    const resourceSection = getActiveResourceSection(route.section, route.settingsSubview);
    const nextScrollTop = Math.max(0, Number(session?.scrollTop) || 0);
    activeRouteScrollTopRef.current = nextScrollTop;
    setActiveRouteScrollTop(nextScrollTop);
    setProfileGallerySelectedIds(Array.isArray(session?.selection) ? session.selection : []);
    if (resourceSection) {
      setResourceSearchTokens(session?.query || buildResourceSearchInputTokens(routeInput));
      setResourceSearchText(String(session?.freeText || ""));
      setResourceBrowse(normalizeBooruBrowseQuery({
        sortBy: session?.order,
        direction: session?.direction,
        grouping: session?.grouping,
        randomSeed: session?.randomSeed,
        groupBy: session?.groupBy,
        groupOrderBy: session?.groupOrderBy
      }, "resource"));
      setResourceMediaKindFilter(session?.filters?.mediaKind || "all");
      setResourceRealityFilter(session?.filters?.reality || "all");
      setResourceMissingFilter(session?.filters?.missing || BOORU_NO_MISSING_FILTER);
      setResourcePendingMode(session?.filters?.pendingMode || "essential");
      setResourceState(session?.results || { items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false, querySignature: "" });
      setResourcePageState((currentValue) => ({
        ...currentValue,
        [resourceSection]: session?.page || { page: 1, querySignature: "" }
      }));
      setSelectedResourceState((currentValue) => ({
        ...currentValue,
        [resourceSection]: normalizeSectionSelection(session?.selection || EMPTY_SELECTION_STATE)
      }));
      return;
    }
    if (route.entityKind) {
      setEntitySearchValue(String(session?.query || ""));
      setEntitySearchTokens(Array.isArray(session?.exactFilters) ? session.exactFilters : []);
      const restoredBrowseValue = {
        sortBy: session?.order,
        direction: session?.direction,
        grouping: session?.grouping,
        randomSeed: session?.randomSeed,
        groupBy: session?.groupBy,
        groupOrderBy: session?.groupOrderBy
      };
      if (route.profile?.tab === "gallery") {
        setResourceBrowse(normalizeBooruBrowseQuery(restoredBrowseValue, "resource"));
      } else {
        setEntityBrowse(normalizeBooruBrowseQuery(restoredBrowseValue, "entity", route.entityKind === "character"));
      }
      if (route.profile) {
        setEntityProfile(resolveBooruProfileForRoute(
          route,
          session?.results?.profile,
          latestWorkspaceSessionStateRef.current?.entityProfile
        ));
        setEntityProfileGalleryState(session?.results?.gallery || { items: [], totalCount: 0, hasMore: false });
        setEntityProfileRelationState(session?.results?.relations || { items: [], totalCount: 0, hasMore: false, relationKind: null });
        setEntityProfilePageState((currentValue) => ({
          ...currentValue,
          [route.section]: session?.page || { page: 1, profileKey: `${route.profile.kind}:${route.profile.id}` }
        }));
      } else {
        setEntityItems(session?.results?.entities || []);
        setEntityPlacements(session?.results?.placements || []);
        setEntityTotalCount(Number(session?.results?.totalCount || 0));
        setEntityHasMore(Boolean(session?.results?.hasMore));
      }
    }
  }, []);
  const openWorkspaceRoute = useCallback7((routeValue, navigationValue, baseInput = latestInputRef.current) => {
    const route = normalizeBooruWorkspaceRoute(routeValue);
    void ctx.openView({
      viewId: BOORU_WORKSPACE_VIEW_ID,
      reuse: true,
      input: routeToBooruWorkspaceInput(route, baseInput, navigationValue)
    });
  }, [ctx]);
  const handleRouteScrollStateChange = useCallback7((nextScrollTop) => {
    const normalizedScrollTop = Math.max(0, Number(nextScrollTop) || 0);
    activeRouteScrollTopRef.current = normalizedScrollTop;
    const route = currentWorkspaceRouteRef.current;
    const routeKey = createBooruWorkspaceRouteKey(route);
    const currentSession = routeSessionsRef.current.get(routeKey);
    if (currentSession) {
      routeSessionsRef.current.set(routeKey, { ...currentSession, scrollTop: normalizedScrollTop });
    }
  }, []);
  const handleGridColumnsChange = useCallback7((family, nextColumnCount) => {
    if (nextColumnCount === gridColumns[family]) return;
    void uiPreferencesApi.set({
      ...persistedUiPreferences && typeof persistedUiPreferences === "object" ? persistedUiPreferences : {},
      gridColumns: {
        ...gridColumns,
        [family]: nextColumnCount
      }
    });
  }, [gridColumns, persistedUiPreferences, uiPreferencesApi]);
  const updateResourceBrowse = useCallback7((nextValue) => {
    setResourceBrowse((currentValue) => {
      const enteringRandom = nextValue?.sortBy === "random" && currentValue?.sortBy !== "random";
      return normalizeBooruBrowseQuery({
        ...currentValue,
        ...nextValue,
        randomSeed: enteringRandom ? createBooruRandomSeed() : nextValue?.randomSeed || currentValue?.randomSeed
      }, "resource");
    });
  }, []);
  const updateEntityBrowse = useCallback7((nextValue) => {
    setEntityBrowse((currentValue) => {
      const enteringRandom = nextValue?.sortBy === "random" && currentValue?.sortBy !== "random";
      return normalizeBooruBrowseQuery({
        ...currentValue,
        ...nextValue,
        randomSeed: enteringRandom ? createBooruRandomSeed() : nextValue?.randomSeed || currentValue?.randomSeed
      }, "entity", allowUniverseEntitySort);
    });
  }, [allowUniverseEntitySort]);
  useEffect25(() => {
    const previousRoute = currentWorkspaceRouteRef.current;
    const previousRouteKey = createBooruWorkspaceRouteKey(previousRoute);
    const nextNonce = String(input?.[WORKSPACE_FRAME_SECTION_NONCE_KEY] || "").trim();
    const isFrameSectionAction = Boolean(nextNonce && nextNonce !== lastSectionNonceRef.current);
    if (isFrameSectionAction) {
      lastSectionNonceRef.current = nextNonce;
      captureWorkspaceRouteSession(previousRoute);
      sectionNavigationRef.current.set(
        previousRoute.section,
        normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], previousRoute)
      );
      setResourceHeroState(null);
      setInspectorOpen(false);
      setAnchoredResources([]);
      setContextMenuState(null);
      if (previousRoute.section === workspaceRoute.section) {
        for (const [key, session] of routeSessionsRef.current.entries()) {
          if (session?.route?.section === workspaceRoute.section) routeSessionsRef.current.delete(key);
        }
        sectionLastRouteRef.current.delete(workspaceRoute.section);
        sectionNavigationRef.current.delete(workspaceRoute.section);
        const resetNavigation = resetBooruWorkspaceSection(
          normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], previousRoute),
          workspaceRoute.section
        );
        const resetRoute = resetNavigation.activeRoute;
        currentWorkspaceRouteRef.current = resetRoute;
        restoreWorkspaceRouteSession(resetRoute, null);
        openWorkspaceRoute(resetRoute, resetNavigation, input);
        return;
      }
      const restoredNavigation = sectionNavigationRef.current.get(workspaceRoute.section);
      const restoredRoute = sectionLastRouteRef.current.get(workspaceRoute.section) || createBooruSectionRootRoute(workspaceRoute.section);
      const nextNavigation = normalizeBooruNavigationState(
        restoredNavigation || { activeRoute: restoredRoute, backStack: [] },
        restoredRoute
      );
      currentWorkspaceRouteRef.current = restoredRoute;
      restoreWorkspaceRouteSession(restoredRoute, null);
      openWorkspaceRoute(restoredRoute, nextNavigation, input);
      return;
    }
    if (previousRouteKey === workspaceRouteKey) return;
    captureWorkspaceRouteSession(previousRoute);
    currentWorkspaceRouteRef.current = workspaceRoute;
    sectionLastRouteRef.current.set(workspaceRoute.section, workspaceRoute);
    sectionNavigationRef.current.set(
      workspaceRoute.section,
      normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], workspaceRoute)
    );
    restoreWorkspaceRouteSession(workspaceRoute, input);
  }, [
    captureWorkspaceRouteSession,
    input?.[WORKSPACE_FRAME_SECTION_NONCE_KEY],
    input?.[BOORU_NAVIGATION_INPUT_KEY],
    openWorkspaceRoute,
    restoreWorkspaceRouteSession,
    workspaceRouteKey
  ]);
  useEffect25(() => {
    if (activeResourceSection === "media") {
      setResourceRealityFilter((currentValue) => currentValue === "untyped" ? "all" : currentValue);
    }
    if (!supportsMissingResourceFilters) {
      setResourceMissingFilter(BOORU_NO_MISSING_FILTER);
      setResourceSearchTokens((currentValue) => {
        const normalizedTokens = normalizeResourceSearchTokens(currentValue);
        const nextTokens = normalizedTokens.filter((token) => token?.type !== "missing");
        return nextTokens.length === normalizedTokens.length ? currentValue : nextTokens;
      });
    }
  }, [activeResourceSection, supportsMissingResourceFilters]);
  useEffect25(() => {
    setResourceMissingFilter((currentValue) => isBooruMissingFilterCompatible(currentValue, contextualMissingFilterOptions) ? currentValue : BOORU_NO_MISSING_FILTER);
    setResourceSearchTokens((currentValue) => {
      const normalizedTokens = normalizeResourceSearchTokens(currentValue);
      const nextTokens = normalizedTokens.filter((token) => token?.type !== "missing" || token?.negative || isBooruMissingFilterCompatible(token.value, contextualMissingFilterOptions));
      return nextTokens.length === normalizedTokens.length ? currentValue : nextTokens;
    });
  }, [contextualMissingFilterOptionsSignature]);
  useEffect25(() => {
    if (!activeEntityKind) {
      setEntityCreateValue("");
    }
  }, [activeEntityKind]);
  useEffect25(() => {
    if (activeEntityKind !== "universe" || !showEntityProfile) {
      setUniverseCharacterCreateValue("");
    }
  }, [activeEntityKind, showEntityProfile, activeEntityProfile?.id]);
  useEffect25(() => {
    if (!showEntityProfile) {
      setEntityProfile(null);
      setEntityProfileError("");
      setEntityProfileLoading(false);
      setEntityProfileGalleryState({ items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false });
      setEntityProfileGalleryLoading(false);
      setEntityProfileRelationState({ items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false, relationKind: null });
      setEntityProfileRelationLoading(false);
    }
  }, [showEntityProfile]);
  useEffect25(() => {
    if (!showResourceWorkspace) {
      setInspectorOpen(false);
      setAnchoredResources([]);
      detailsAnchorRequestVersionRef.current += 1;
    }
  }, [showResourceWorkspace]);
  useEffect25(() => {
    if (!showResourceWorkspace) {
      return;
    }
    mediaLoadMoreLockedRef.current = false;
    setResourcePageState((currentValue) => {
      const currentSectionState = currentValue[activeResourceSection];
      if (String(currentSectionState?.querySignature || "") === resourceQuerySignature) {
        return currentValue;
      }
      return {
        ...currentValue,
        [activeResourceSection]: {
          page: 1,
          querySignature: resourceQuerySignature
        }
      };
    });
  }, [activeResourceSection, resourceQuerySignature, showResourceWorkspace]);
  useEffect25(() => {
    if (!showEntityProfile || !activeEntityKind) {
      return;
    }
    setEntityProfilePageState((currentValue) => {
      const nextProfileKey = entityProfileKey;
      const currentSectionState = currentValue[activeSection] || { page: 1, profileKey: "" };
      if (String(currentSectionState.profileKey || "") === nextProfileKey) {
        return currentValue;
      }
      return {
        ...currentValue,
        [activeSection]: {
          page: 1,
          profileKey: nextProfileKey
        }
      };
    });
  }, [activeEntityKind, activeSection, entityProfileKey, showEntityProfile]);
  useEffect25(() => {
    if (!showEntityProfile || activeEntityProfile?.tab !== "gallery") {
      return;
    }
    setEntityProfilePageState((currentValue) => ({
      ...currentValue,
      [activeSection]: {
        page: 1,
        profileKey: entityProfileKey
      }
    }));
  }, [activeSection, activeEntityProfile?.tab, deferredEntitySearchValue, entityProfileKey, normalizedEntitySearchTokens, resourceBrowse, showEntityProfile]);
  useEffect25(() => {
    if (!showResourceWorkspace) {
      return;
    }
    const totalPages = Math.max(1, Math.ceil(Number(resourceState.placementCount || resourceState.totalCount || 0) / RESOURCE_PAGE_SIZE));
    if (currentResourcePage > totalPages) {
      setResourcePageState((currentValue) => ({
        ...currentValue,
        [activeResourceSection]: {
          page: totalPages,
          querySignature: resourceQuerySignature
        }
      }));
    }
  }, [activeResourceSection, currentResourcePage, resourceQuerySignature, resourceState.placementCount, resourceState.totalCount, showResourceWorkspace]);
  useEffect25(() => {
    if (!showEntityProfile || !activeEntityKind) {
      return;
    }
    const totalPages = Math.max(1, Math.ceil(Number(entityProfileGalleryState.placementCount || entityProfileGalleryState.totalCount || 0) / RESOURCE_PAGE_SIZE));
    if (currentEntityProfilePage > totalPages) {
      setEntityProfilePageState((currentValue) => ({
        ...currentValue,
        [activeSection]: {
          page: totalPages,
          profileKey: entityProfileKey
        }
      }));
    }
  }, [
    activeEntityKind,
    activeSection,
    currentEntityProfilePage,
    entityProfileGalleryState.placementCount,
    entityProfileGalleryState.totalCount,
    entityProfileKey,
    showEntityProfile
  ]);
  const loadSnapshot = async ({ silent = false, reason = "manual" } = {}) => {
    const nextRequest = {
      silent: Boolean(silent),
      reasons: [String(reason || "manual")]
    };
    if (snapshotRequestStateRef.current.inFlight) {
      booruViewLogger.debug(
        "booru.snapshot.queue",
        "Booru encolo una recarga de snapshot mientras otra seguia en vuelo.",
        {
          requestedReason: String(reason || "manual"),
          silent: Boolean(silent),
          queuedRequest: snapshotRequestStateRef.current.queuedRequest
        }
      );
      snapshotRequestStateRef.current.queuedRequest = mergeSnapshotQueueRequest(
        snapshotRequestStateRef.current.queuedRequest,
        nextRequest
      );
      return null;
    }
    snapshotRequestStateRef.current.inFlight = true;
    const startedAt = performance.now();
    if (!silent) {
      setLoading(true);
    }
    booruViewLogger.debug(
      "booru.snapshot.start",
      "Booru inicio una carga de snapshot.",
      {
        reason: String(reason || "manual"),
        silent: Boolean(silent),
        ...diagnosticsContextRef.current
      }
    );
    try {
      const nextSnapshot = await invoke6("booru:get-snapshot");
      setSnapshot(nextSnapshot);
      setError("");
      logRendererDuration(
        "booru.snapshot.done",
        "Booru resolvio una carga de snapshot.",
        performance.now() - startedAt,
        {
          reason: String(reason || "manual"),
          silent: Boolean(silent),
          watcherStage: String(nextSnapshot?.watcher?.stage || "").trim() || null,
          watcherPendingCount: Number(nextSnapshot?.watcher?.pendingCount || 0),
          stats: {
            totalCount: Number(nextSnapshot?.stats?.totalCount || 0),
            pendingCount: Number(nextSnapshot?.stats?.pendingCount || 0),
            duplicateCount: Number(nextSnapshot?.stats?.duplicateCount || 0),
            trashCount: Number(nextSnapshot?.stats?.trashCount || 0),
            thumbnailBacklogCount: Number(nextSnapshot?.stats?.thumbnailBacklogCount || 0),
            thumbnailReadyCount: Number(nextSnapshot?.stats?.thumbnailReadyCount || 0),
            thumbnailErrorCount: Number(nextSnapshot?.stats?.thumbnailErrorCount || 0)
          }
        }
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar el estado actual de Booru."
      );
      booruViewLogger.info(
        "booru.snapshot.error",
        "Booru no pudo resolver una carga de snapshot.",
        {
          reason: String(reason || "manual"),
          silent: Boolean(silent),
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || ""),
          ...diagnosticsContextRef.current
        }
      );
    } finally {
      snapshotRequestStateRef.current.inFlight = false;
      setLoading(false);
      if (snapshotRequestStateRef.current.queuedRequest) {
        const queuedRequest = snapshotRequestStateRef.current.queuedRequest;
        snapshotRequestStateRef.current.queuedRequest = null;
        void loadSnapshot({
          silent: queuedRequest.silent,
          reason: queuedRequest.reasons.join("|") || "queued"
        });
      }
    }
  };
  const loadResources = async ({ requestedPage = currentResourcePage } = {}) => {
    if (!showResourceWorkspace || !activeResourceSection) {
      return;
    }
    const normalizedRequestedPage = clampPageNumber(requestedPage, Number.MAX_SAFE_INTEGER);
    const isInfiniteMedia = true;
    const activeMediaRequest = mediaResourceRequestRef.current;
    if (isInfiniteMedia && activeMediaRequest?.querySignature === resourceQuerySignature && !(normalizedRequestedPage === 1 && activeMediaRequest.page !== 1)) {
      return;
    }
    const nextQuery = {
      section: activeResourceSection,
      query: resourceQuery,
      offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
      limit: RESOURCE_PAGE_SIZE
    };
    const startedAt = performance.now();
    resourceRequestVersionRef.current += 1;
    const requestVersion = resourceRequestVersionRef.current;
    if (isInfiniteMedia) {
      mediaResourceRequestRef.current = {
        requestVersion,
        page: normalizedRequestedPage,
        querySignature: resourceQuerySignature
      };
    }
    setResourceLoading(true);
    booruViewLogger.debug(
      "booru.resources.start",
      "Booru inicio una carga de recursos.",
      {
        requestVersion,
        section: activeResourceSection,
        requestedPage: normalizedRequestedPage,
        query: resourceQuery
      }
    );
    try {
      const nextResources = await invoke6("booru:list-resources", nextQuery);
      if (resourceRequestVersionRef.current !== requestVersion) {
        return;
      }
      setResourceState((currentValue) => ({
        items: isInfiniteMedia && normalizedRequestedPage > 1 && currentValue.querySignature === resourceQuerySignature ? appendResourcePageItems(currentValue.items, nextResources?.items) : Array.isArray(nextResources?.items) ? nextResources.items : [],
        placements: isInfiniteMedia && normalizedRequestedPage > 1 && currentValue.querySignature === resourceQuerySignature ? appendBrowsePlacements(currentValue.placements, nextResources?.placements) : Array.isArray(nextResources?.placements) ? nextResources.placements : [],
        totalCount: Number(nextResources?.totalCount || 0),
        placementCount: Number(nextResources?.placementCount || nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore),
        querySignature: resourceQuerySignature
      }));
      setError("");
      logRendererDuration(
        "booru.resources.done",
        "Booru resolvio una carga de recursos.",
        performance.now() - startedAt,
        {
          requestVersion,
          section: activeResourceSection,
          requestedPage: normalizedRequestedPage,
          query: resourceQuery,
          totalCount: Number(nextResources?.totalCount || 0),
          hasMore: Boolean(nextResources?.hasMore),
          ...summarizeResourcesForLog(nextResources?.items)
        }
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudo listar la biblioteca de Booru."
      );
      booruViewLogger.info(
        "booru.resources.error",
        "Booru no pudo listar recursos.",
        {
          requestVersion,
          section: activeResourceSection,
          requestedPage: normalizedRequestedPage,
          query: resourceQuery,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (mediaResourceRequestRef.current?.requestVersion === requestVersion) {
        mediaResourceRequestRef.current = null;
      }
      if (isInfiniteMedia && normalizedRequestedPage > 1) {
        mediaLoadMoreLockedRef.current = false;
      }
      if (resourceRequestVersionRef.current === requestVersion) {
        setResourceLoading(false);
      }
    }
  };
  const refreshVisibleMediaResources = async () => {
    if (activeResourceSection !== "media") {
      return;
    }
    const refreshState = mediaThumbnailRefreshRef.current;
    if (refreshState.inFlight) {
      refreshState.queued = true;
      return;
    }
    const resourceIds = uniqueIds(visibleResourceIdsRef.current);
    if (!resourceIds.length) {
      return;
    }
    refreshState.inFlight = true;
    try {
      const result = await invoke6("booru:get-resources-by-ids", { resourceIds });
      const refreshedItems = Array.isArray(result?.items) ? result.items : [];
      if (refreshedItems.length) {
        setResourceState((currentValue) => ({
          ...currentValue,
          items: mergeResourcesIntoItems(currentValue.items, refreshedItems)
        }));
      }
    } catch (refreshError) {
      booruViewLogger.info(
        "booru.thumbnail.visible-refresh.error",
        "Booru no pudo actualizar las thumbnails visibles.",
        {
          resourceIds: summarizeIdsForLog(resourceIds),
          error: refreshError instanceof Error ? refreshError.message : String(refreshError || "")
        }
      );
    } finally {
      refreshState.inFlight = false;
      if (refreshState.queued) {
        refreshState.queued = false;
        void refreshVisibleMediaResources();
      }
    }
  };
  const reconcileResourceWindow = async () => {
    const requestContext = resourceWindowContextRef.current;
    if (!requestContext?.showResourceWorkspace || !requestContext.activeResourceSection) {
      return;
    }
    resourceWindowRequestVersionRef.current += 1;
    const requestVersion = resourceWindowRequestVersionRef.current;
    const requestedLimit = Math.max(
      RESOURCE_PAGE_SIZE,
      Number(requestContext.itemCount || 0),
      Number(requestContext.currentResourcePage || 1) * RESOURCE_PAGE_SIZE
    );
    try {
      const result = await invoke6("booru:list-resources", {
        section: requestContext.activeResourceSection,
        query: requestContext.query,
        offset: 0,
        limit: requestedLimit
      });
      const currentContext = resourceWindowContextRef.current;
      if (resourceWindowRequestVersionRef.current !== requestVersion || !isBooruResourceWindowContextCurrent(requestContext, currentContext)) {
        return;
      }
      setResourceState({
        items: Array.isArray(result?.items) ? result.items : [],
        placements: Array.isArray(result?.placements) ? result.placements : [],
        totalCount: Number(result?.totalCount || 0),
        placementCount: Number(result?.placementCount || result?.totalCount || 0),
        hasMore: Boolean(result?.hasMore),
        querySignature: requestContext.querySignature
      });
    } catch (reconcileError) {
      booruViewLogger.info(
        "booru.resources.reconcile.error",
        "Booru no pudo reconciliar la ventana incremental activa.",
        {
          section: requestContext.activeResourceSection,
          querySignature: requestContext.querySignature,
          error: reconcileError instanceof Error ? reconcileError.message : String(reconcileError || "")
        }
      );
    }
  };
  const refreshDetailsAnchor = async () => {
    const requestContext = detailsAnchorRef.current;
    const resourceIds = uniqueIds(requestContext?.ids);
    if (!requestContext?.open || !requestContext.section || !resourceIds.length) {
      return;
    }
    detailsAnchorRequestVersionRef.current += 1;
    const requestVersion = detailsAnchorRequestVersionRef.current;
    try {
      const result = await invoke6("booru:get-resources-by-ids", { resourceIds });
      const currentContext = detailsAnchorRef.current;
      if (detailsAnchorRequestVersionRef.current !== requestVersion || !currentContext?.open || currentContext.section !== requestContext.section || currentContext.activeId !== requestContext.activeId || !arraysEqual2(uniqueIds(currentContext.ids), resourceIds)) {
        return;
      }
      const refreshedResources = Array.isArray(result?.items) ? result.items.filter((item) => item?.id) : [];
      const refreshedById = new Map(refreshedResources.map((resource) => [resource.id, resource]));
      const activeResource2 = refreshedById.get(requestContext.activeId) || null;
      const activeWasDeleted = !activeResource2 || requestContext.section !== "trash" && Boolean(activeResource2?.trashedAt);
      if (activeWasDeleted) {
        setInspectorOpen(false);
        setDetailsContext(null);
        setAnchoredResources([]);
        if (requestContext.section === "profile") {
          setProfileGallerySelectedIds([]);
        } else {
          setSelectedResourceState((currentValue) => ({
            ...currentValue,
            [requestContext.section]: RESOURCE_SELECTION_SECTIONS[requestContext.section] || EMPTY_SELECTION_STATE
          }));
        }
        return;
      }
      const nextResources = resourceIds.map((resourceId) => refreshedById.get(resourceId) || null).filter(Boolean);
      const nextIds = nextResources.map((resource) => resource.id);
      setAnchoredResources(nextResources);
      if (!arraysEqual2(nextIds, resourceIds)) {
        if (requestContext.section === "profile") {
          setProfileGallerySelectedIds(nextIds);
          setDetailsContext((currentValue) => currentValue ? { ...currentValue, ids: nextIds } : currentValue);
        } else {
          setSelectedResourceState((currentValue) => ({
            ...currentValue,
            [requestContext.section]: {
              ids: nextIds,
              activeId: requestContext.activeId,
              mode: nextIds.length > 1 ? "multi" : "single"
            }
          }));
        }
      }
    } catch (refreshError) {
      booruViewLogger.info(
        "booru.details.anchor-refresh.error",
        "Booru no pudo actualizar el recurso anclado de Details.",
        {
          resourceIds,
          error: refreshError instanceof Error ? refreshError.message : String(refreshError || "")
        }
      );
    }
  };
  const loadEntityProfile = async () => {
    if (!showEntityProfile || !activeEntityProfile?.id || !activeEntityKind) {
      return;
    }
    const startedAt = performance.now();
    entityProfileRequestVersionRef.current += 1;
    const requestVersion = entityProfileRequestVersionRef.current;
    setEntityProfileLoading(true);
    booruViewLogger.debug(
      "booru.entity-profile.start",
      "Booru inicio la carga de un perfil de entidad.",
      {
        requestVersion,
        kind: activeEntityKind,
        entityId: activeEntityProfile.id,
        tab: activeEntityProfile?.tab || null
      }
    );
    try {
      const nextProfile = await invoke6("booru:get-entity-profile", {
        kind: activeEntityKind,
        id: activeEntityProfile.id
      });
      if (entityProfileRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfile(nextProfile || null);
      setEntityProfileError("");
      logRendererDuration(
        "booru.entity-profile.done",
        "Booru resolvio un perfil de entidad.",
        performance.now() - startedAt,
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          resourceCount: Number(nextProfile?.resourceCount || 0),
          slug: String(nextProfile?.slug || "").trim() || null
        }
      );
    } catch (loadError) {
      if (entityProfileRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfile(null);
      setEntityProfileError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar el perfil de la entidad."
      );
      booruViewLogger.info(
        "booru.entity-profile.error",
        "Booru no pudo cargar un perfil de entidad.",
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (entityProfileRequestVersionRef.current === requestVersion) {
        setEntityProfileLoading(false);
      }
    }
  };
  const loadEntityProfileGallery = async ({ requestedPage = currentEntityProfilePage } = {}) => {
    if (!showEntityProfile || activeEntityProfile?.tab !== "gallery" || !activeEntityKind || !activeEntityProfile?.id) {
      return;
    }
    const normalizedRequestedPage = clampPageNumber(requestedPage, Number.MAX_SAFE_INTEGER);
    const startedAt = performance.now();
    entityProfileGalleryRequestVersionRef.current += 1;
    const requestVersion = entityProfileGalleryRequestVersionRef.current;
    setEntityProfileGalleryLoading(true);
    booruViewLogger.debug(
      "booru.entity-profile.gallery.start",
      "Booru inicio la carga de la galeria de un perfil de entidad.",
      {
        requestVersion,
        kind: activeEntityKind,
        entityId: activeEntityProfile.id,
        requestedPage: normalizedRequestedPage
      }
    );
    try {
      const contextualQuery = buildBooruResourceQuery({
        searchTokens: normalizedEntitySearchTokens,
        freeText: deferredEntitySearchValue,
        browse: resourceBrowse
      });
      const nextResources = await invoke6("booru:list-resources", {
        section: "profile",
        query: {
          ...contextualQuery,
          includeEntities: [...contextualQuery.includeEntities, {
            kind: activeEntityKind,
            id: activeEntityProfile.id,
            label: getEntityProfileLabel(activeEntityProfile, entityProfile) || null
          }]
        },
        offset: (normalizedRequestedPage - 1) * RESOURCE_PAGE_SIZE,
        limit: RESOURCE_PAGE_SIZE
      });
      if (entityProfileGalleryRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfileGalleryState((currentValue) => ({
        items: normalizedRequestedPage > 1 ? appendResourcePageItems(currentValue.items, nextResources?.items) : Array.isArray(nextResources?.items) ? nextResources.items : [],
        placements: normalizedRequestedPage > 1 ? appendBrowsePlacements(currentValue.placements, nextResources?.placements) : Array.isArray(nextResources?.placements) ? nextResources.placements : [],
        totalCount: Number(nextResources?.totalCount || 0),
        placementCount: Number(nextResources?.placementCount || nextResources?.totalCount || 0),
        hasMore: Boolean(nextResources?.hasMore)
      }));
      setEntityProfileError("");
      logRendererDuration(
        "booru.entity-profile.gallery.done",
        "Booru resolvio la galeria de un perfil de entidad.",
        performance.now() - startedAt,
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          requestedPage: normalizedRequestedPage,
          totalCount: Number(nextResources?.totalCount || 0),
          hasMore: Boolean(nextResources?.hasMore),
          ...summarizeResourcesForLog(nextResources?.items)
        }
      );
    } catch (loadError) {
      if (entityProfileGalleryRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfileGalleryState({ items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false });
      setEntityProfileError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar la galeria de la entidad."
      );
      booruViewLogger.info(
        "booru.entity-profile.gallery.error",
        "Booru no pudo cargar la galeria de un perfil de entidad.",
        {
          requestVersion,
          kind: activeEntityKind,
          entityId: activeEntityProfile.id,
          requestedPage: normalizedRequestedPage,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (entityProfileGalleryRequestVersionRef.current === requestVersion) {
        setEntityProfileGalleryLoading(false);
      }
    }
  };
  const loadEntityProfileRelations = async ({ append = false } = {}) => {
    if (!showEntityProfile || !activeEntityRelationKind || !activeEntityKind || !activeEntityProfile?.id) {
      return;
    }
    const offset = append ? entityProfileRelationState.placements?.length || entityProfileRelationState.items.length : 0;
    const requestVersion = ++entityProfileRelationRequestVersionRef.current;
    setEntityProfileRelationLoading(true);
    try {
      const result = await invoke6("booru:list-entity-relations", {
        sourceKind: activeEntityKind,
        sourceId: activeEntityProfile.id,
        relationKind: activeEntityRelationKind,
        query: String(deferredEntitySearchValue || "").trim() || null,
        exactFilters: normalizedEntitySearchTokens,
        ...entityBrowse,
        offset,
        limit: RESOURCE_PAGE_SIZE
      });
      if (entityProfileRelationRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfileRelationState((currentValue) => ({
        items: append ? appendResourcePageItems(currentValue.items, result?.items) : Array.isArray(result?.items) ? result.items : [],
        placements: append ? appendBrowsePlacements(currentValue.placements, result?.placements) : Array.isArray(result?.placements) ? result.placements : [],
        totalCount: Number(result?.totalCount || 0),
        placementCount: Number(result?.placementCount || result?.totalCount || 0),
        hasMore: Boolean(result?.hasMore),
        relationKind: activeEntityRelationKind
      }));
      setEntityProfileError("");
    } catch (loadError) {
      if (entityProfileRelationRequestVersionRef.current !== requestVersion) {
        return;
      }
      setEntityProfileRelationState({ items: [], placements: [], totalCount: 0, placementCount: 0, hasMore: false, relationKind: activeEntityRelationKind });
      setEntityProfileError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar las relaciones del perfil."
      );
    } finally {
      if (entityProfileRelationRequestVersionRef.current === requestVersion) {
        setEntityProfileRelationLoading(false);
      }
    }
  };
  useEffect25(() => {
    void loadSnapshot({ reason: "mount" });
  }, []);
  useEffect25(() => {
    if (!showResourceWorkspace) {
      return;
    }
    if (!currentResourcePageMatchesQuery) {
      return;
    }
    void loadResources({ requestedPage: currentResourcePage });
  }, [
    activeResourceSection,
    currentResourcePage,
    currentResourcePageMatchesQuery,
    resourceQuerySignature,
    showResourceWorkspace
  ]);
  useEffect25(() => {
    if (!showResourceWorkspace || !activeResourceSection || currentResourcePageMatchesQuery) {
      return;
    }
    setResourcePageState((currentValue) => ({
      ...currentValue,
      [activeResourceSection]: {
        page: 1,
        querySignature: resourceQuerySignature
      }
    }));
  }, [
    activeResourceSection,
    currentResourcePageMatchesQuery,
    resourceQuerySignature,
    showResourceWorkspace
  ]);
  useEffect25(() => {
    if (!showEntityProfile) {
      return;
    }
    void loadEntityProfile();
  }, [activeEntityKind, activeEntityProfile?.id, activeEntityProfile?.tab, entityRevision, showEntityProfile]);
  useEffect25(() => {
    if (!showEntityProfile || activeEntityProfile?.tab !== "gallery") {
      return;
    }
    void loadEntityProfileGallery({ requestedPage: currentEntityProfilePage });
  }, [
    activeEntityKind,
    activeEntityProfile?.id,
    activeEntityProfile?.tab,
    currentEntityProfilePage,
    deferredEntitySearchValue,
    normalizedEntitySearchTokens,
    resourceBrowse,
    showEntityProfile
  ]);
  useEffect25(() => {
    if (!showEntityProfile || !activeEntityRelationKind) {
      return;
    }
    void loadEntityProfileRelations({ append: false });
  }, [
    activeEntityKind,
    activeEntityProfile?.id,
    activeEntityRelationKind,
    deferredEntitySearchValue,
    normalizedEntitySearchTokens,
    entityBrowse,
    entityRevision,
    showEntityProfile
  ]);
  useEffect25(() => {
    if (snapshot?.derivatives && typeof snapshot?.stats?.thumbnailBacklogCount === "number") {
      visibleThumbnailPrimingUnavailableRef.current = false;
    }
  }, [snapshot?.derivatives, snapshot?.stats?.thumbnailBacklogCount]);
  useEffect25(() => {
    const stateApi = typeof ctx?.getState === "function" ? ctx.getState() : null;
    if (!stateApi?.subscribeKey) {
      return void 0;
    }
    booruViewLogger.debug(
      "booru.runtime-state.subscribe",
      "Booru suscribio invalidaciones de runtime para la view activa.",
      {
        section: activeSection,
        showResourceWorkspace,
        showEntityProfile,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        resourceQuerySignature,
        entityProfileKey
      }
    );
    const unsubscribers = [
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.resourcesVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de recursos.",
          {
            key: "resourcesVersion",
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey
          }
        );
        if (showResourceWorkspace) {
          void reconcileResourceWindow();
          void refreshDetailsAnchor();
        }
        if (showEntityProfile && activeEntityProfile?.tab !== "data") {
          setEntityProfilePageForSection(activeSection, 1);
          void loadEntityProfileGallery({ requestedPage: 1 });
        }
        if (showEntityProfile) {
          void loadEntityProfile();
        }
        void loadSnapshot({ silent: true, reason: "state:resources" });
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.thumbnailsVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio una actualizacion de thumbnails.",
          {
            key: "thumbnailsVersion",
            ...diagnosticsContextRef.current
          }
        );
        if (activeResourceSection === "media") {
          void refreshVisibleMediaResources();
        }
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.entitiesVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de entidades.",
          {
            key: "entitiesVersion",
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey
          }
        );
        setEntityRevision((currentValue) => currentValue + 1);
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.watcherVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de watcher.",
          {
            key: "watcherVersion",
            ...diagnosticsContextRef.current
          }
        );
        void loadSnapshot({ silent: true, reason: "state:watcher" });
      }),
      stateApi.subscribeKey("plugins.runtimeState.nexus.booru.metricsVersion", () => {
        booruViewLogger.debug(
          "booru.runtime-state.bump",
          "Booru recibio invalidacion de metricas.",
          {
            key: "metricsVersion",
            ...diagnosticsContextRef.current
          }
        );
        void loadSnapshot({ silent: true, reason: "state:metrics" });
      })
    ];
    return () => {
      booruViewLogger.debug(
        "booru.runtime-state.unsubscribe",
        "Booru limpio suscripciones de invalidacion de runtime.",
        {
          section: activeSection,
          resourceQuerySignature,
          entityProfileKey
        }
      );
      unsubscribers.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [
    activeSection,
    activeEntityProfile?.tab,
    activeEntityProfile?.id,
    currentEntityProfilePage,
    currentResourcePage,
    ctx,
    resourceQuerySignature,
    showEntityProfile,
    showResourceWorkspace
  ]);
  const loadEntitySection = async ({ append = false } = {}) => {
    if (!activeEntityKind || showEntityProfile || append && (entityLoading || !entityHasMore)) return;
    const startedAt = performance.now();
    const requestVersion = ++entitySectionRequestVersionRef.current;
    setEntityLoading(true);
    booruViewLogger.debug(
      "booru.entities.section.start",
      "Booru inicio la carga de entidades para una seccion.",
      {
        kind: activeEntityKind,
        query: String(deferredEntitySearchValue || "").trim() || null,
        entityRevision
      }
    );
    try {
      const data = await invoke6("booru:list-entities", {
        kind: activeEntityKind,
        query: String(deferredEntitySearchValue || "").trim() || null,
        exactFilters: normalizedEntitySearchTokens,
        ...entityBrowse,
        offset: append ? entityPlacements.length || entityItems.length : 0,
        limit: RESOURCE_PAGE_SIZE
      });
      if (entitySectionRequestVersionRef.current !== requestVersion) return;
      setEntityItems((currentValue) => append ? appendResourcePageItems(currentValue, data?.items) : Array.isArray(data?.items) ? data.items : []);
      setEntityPlacements((currentValue) => append ? appendBrowsePlacements(currentValue, data?.placements) : Array.isArray(data?.placements) ? data.placements : []);
      setEntityTotalCount(Number(data?.totalCount || 0));
      setEntityHasMore(Boolean(data?.hasMore));
      setEntityError("");
      logRendererDuration(
        "booru.entities.section.done",
        "Booru resolvio la carga de entidades de una seccion.",
        performance.now() - startedAt,
        {
          kind: activeEntityKind,
          query: String(deferredEntitySearchValue || "").trim() || null,
          entityRevision,
          itemCount: Array.isArray(data?.items) ? data.items.length : 0,
          sampleIds: summarizeIdsForLog(data?.items)
        }
      );
    } catch (loadError) {
      if (entitySectionRequestVersionRef.current !== requestVersion) return;
      if (!append) {
        setEntityItems([]);
        setEntityPlacements([]);
        setEntityTotalCount(0);
        setEntityHasMore(false);
      }
      setEntityError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar la seccion."
      );
      booruViewLogger.info(
        "booru.entities.section.error",
        "Booru no pudo cargar las entidades de la seccion activa.",
        {
          kind: activeEntityKind,
          query: String(deferredEntitySearchValue || "").trim() || null,
          entityRevision,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: loadError instanceof Error ? loadError.message : String(loadError || "")
        }
      );
    } finally {
      if (entitySectionRequestVersionRef.current === requestVersion) setEntityLoading(false);
    }
  };
  useEffect25(() => {
    if (!activeEntityKind || showEntityProfile) {
      setEntityItems([]);
      setEntityPlacements([]);
      setEntityTotalCount(0);
      setEntityHasMore(false);
      setEntityLoading(false);
      setEntityError("");
      return;
    }
    void loadEntitySection({ append: false });
  }, [activeEntityKind, deferredEntitySearchValue, entityBrowse, entityRevision, normalizedEntitySearchTokens, showEntityProfile]);
  const currentSelection = useMemo13(() => {
    if (!showResourceWorkspace) {
      return EMPTY_SELECTION_STATE;
    }
    return selectedResourceState[activeResourceSection] || RESOURCE_SELECTION_SECTIONS[activeResourceSection] || EMPTY_SELECTION_STATE;
  }, [activeResourceSection, selectedResourceState, showResourceWorkspace]);
  useEffect25(() => {
    if (!showResourceWorkspace) {
      return;
    }
    if (inspectorOpen) {
      return;
    }
    setSelectedResourceState((currentValue) => {
      const nextSectionState = currentValue[activeResourceSection] || RESOURCE_SELECTION_SECTIONS[activeResourceSection];
      const visibleIds = new Set(resourceItems.map((item) => item.id));
      const normalizedSelection = normalizeSectionSelection(nextSectionState, visibleIds);
      if (arraysEqual2(nextSectionState.ids, normalizedSelection.ids) && nextSectionState.activeId === normalizedSelection.activeId && nextSectionState.mode === normalizedSelection.mode) {
        return currentValue;
      }
      return {
        ...currentValue,
        [activeResourceSection]: normalizedSelection
      };
    });
  }, [activeResourceSection, inspectorOpen, resourceItems, showResourceWorkspace]);
  const floatingDetailsActive = Boolean(
    inspectorOpen && detailsContext?.mode === "floating" && showEntityProfile && detailsContext?.surfaceKey === workspaceRouteKey
  );
  const floatingDetailsIdsSignature = uniqueIds(detailsContext?.ids).join("|");
  const detailsSelection = useMemo13(() => {
    if (!floatingDetailsActive) return currentSelection;
    const ids = floatingDetailsIdsSignature ? floatingDetailsIdsSignature.split("|") : [];
    return {
      ids,
      activeId: String(detailsContext?.activeId || "").trim(),
      mode: ids.length > 1 ? "multi" : "single"
    };
  }, [currentSelection, detailsContext?.activeId, floatingDetailsActive, floatingDetailsIdsSignature]);
  const detailsSourceItems = floatingDetailsActive ? Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [] : resourceItems;
  const currentSelectionIdsSignature = uniqueIds(detailsSelection.ids).join("|");
  detailsAnchorRef.current = {
    open: inspectorOpen && (showResourceWorkspace || floatingDetailsActive),
    section: floatingDetailsActive ? "profile" : activeResourceSection || "",
    surfaceKey: floatingDetailsActive ? workspaceRouteKey : activeResourceSection || "",
    ids: uniqueIds(detailsSelection.ids),
    activeId: String(detailsSelection.activeId || "").trim()
  };
  const selectedResources = useMemo13(() => {
    return resolveBooruAnchoredResources(detailsSelection.ids, detailsSourceItems, anchoredResources);
  }, [anchoredResources, detailsSelection.ids, detailsSourceItems]);
  const activeResource = useMemo13(() => {
    const activeId = String(detailsSelection.activeId || "").trim();
    return activeId ? selectedResources.find((resource) => resource.id === activeId) || null : selectedResources[0] || null;
  }, [detailsSelection.activeId, selectedResources]);
  useEffect25(() => {
    if (!detailsSelection.ids.length) {
      setInspectorOpen(false);
      setDetailsContext(null);
      setAnchoredResources([]);
    }
  }, [detailsSelection.ids.length]);
  useEffect25(() => {
    if (!inspectorOpen || !detailsSelection.ids.length || !showResourceWorkspace && !floatingDetailsActive) {
      return;
    }
    const visibleById = new Map(detailsSourceItems.map((resource) => [resource.id, resource]));
    const visibleSelection = detailsSelection.ids.map((resourceId) => visibleById.get(resourceId)).filter(Boolean);
    if (visibleSelection.length) {
      setAnchoredResources((currentValue) => mergeBooruResourceRecords(currentValue, visibleSelection));
    }
    void refreshDetailsAnchor();
  }, [
    activeResourceSection,
    detailsSelection.activeId,
    currentSelectionIdsSignature,
    floatingDetailsActive,
    inspectorOpen,
    showResourceWorkspace
  ]);
  const dragPreviewResourcesById = useMemo13(
    () => new Map(resourceItems.map((item) => [item.id, item])),
    [resourceItems]
  );
  const activeHeroItem = useMemo13(() => {
    const heroItems = Array.isArray(resourceHeroState?.items) ? resourceHeroState.items : [];
    const activeHeroId = String(resourceHeroState?.activeId || "").trim();
    return heroItems.find((item) => item?.id === activeHeroId) || heroItems[0] || null;
  }, [resourceHeroState]);
  const selectedResourceIdsSignature = selectedResources.map((resource) => resource.id).join("|");
  const showInspector = showResourceWorkspace && inspectorOpen && detailsContext?.mode !== "floating" && Boolean(activeResource);
  const showFloatingInspector = floatingDetailsActive && Boolean(activeResource);
  const applyResourceMutationResult = (rawResult, expectedQuerySignature = resourceQuerySignature) => {
    const mutation = normalizeBooruResourceMutationResult(rawResult);
    const anchorIds = new Set(detailsAnchorRef.current?.ids || []);
    const anchorUpdates = mutation.updatedResources.filter((resource) => anchorIds.has(resource.id));
    if (anchorUpdates.length) {
      setAnchoredResources((currentValue) => mergeBooruResourceRecords(currentValue, anchorUpdates).filter((resource) => anchorIds.has(resource.id)));
    }
    if (showEntityProfile && mutation.updatedResources.length) {
      setEntityProfileGalleryState((currentValue) => ({
        ...currentValue,
        items: mergeBooruResourceRecords(currentValue?.items || [], mutation.updatedResources)
      }));
    }
    if (resourceWindowContextRef.current?.querySignature === expectedQuerySignature) {
      if (resourceWindowContextRef.current?.query?.grouping === "sectioned") {
        void reconcileActiveResourceWindow();
      } else {
        setResourceState((currentValue) => {
          const nextWindow = applyBooruMutationToResourceWindow(currentValue.items, mutation);
          return {
            ...currentValue,
            items: nextWindow.items,
            totalCount: Math.max(0, Number(currentValue.totalCount || 0) + mutation.totalCountDelta)
          };
        });
      }
    }
    return mutation;
  };
  const consumeSuppressedResourceClick = useCallback7(() => {
    if (!suppressNextResourceClickRef.current) {
      return false;
    }
    suppressNextResourceClickRef.current = false;
    return true;
  }, []);
  const clearCustomDragSession = useCallback7(() => {
    if (customDragTimerRef.current) {
      window.clearTimeout(customDragTimerRef.current);
      customDragTimerRef.current = 0;
    }
    if (customDragSessionRef.current) {
      window.removeEventListener("pointermove", customDragSessionRef.current.handlePointerMove, true);
      window.removeEventListener("pointerup", customDragSessionRef.current.handlePointerUp, true);
      window.removeEventListener("pointercancel", customDragSessionRef.current.handlePointerCancel, true);
      customDragSessionRef.current = null;
    }
  }, []);
  const handleCustomDragPointerDown = useCallback7(({ event, item, resourceIds }) => {
    if (!showResourceWorkspace || activeResourceSection === "trash") {
      return;
    }
    if (event?.button !== 0 || event?.pointerType === "touch") {
      return;
    }
    if (isFormControlElement(event?.target)) {
      return;
    }
    clearCustomDragSession();
    suppressNextResourceClickRef.current = false;
    const normalizedResourceIds = uniqueIds(Array.isArray(resourceIds) ? resourceIds : [item?.id]);
    const session = {
      pointerId: event.pointerId,
      primaryId: item?.id,
      primaryResource: item,
      resourceIds: normalizedResourceIds,
      startedAt: performance.now(),
      startX: Number(event.clientX || 0),
      startY: Number(event.clientY || 0),
      latestX: Number(event.clientX || 0),
      latestY: Number(event.clientY || 0),
      active: false,
      overTargetSignature: "",
      handlePointerMove: null,
      handlePointerUp: null,
      handlePointerCancel: null
    };
    const syncCustomDragTarget = () => {
      if (!session.active) {
        return;
      }
      const hoveredNode = document.elementFromPoint(session.latestX, session.latestY);
      const nextTarget = getQuickAssignTargetDescriptor(hoveredNode);
      const nextSignature = nextTarget ? `${nextTarget.kind}:${nextTarget.entityId}` : "";
      if (session.overTargetSignature === nextSignature) {
        setCustomDragState((currentValue) => {
          if (!currentValue?.active) {
            return currentValue;
          }
          if (currentValue.x === session.latestX && currentValue.y === session.latestY && (currentValue.overTarget && nextTarget ? currentValue.overTarget.kind === nextTarget.kind && currentValue.overTarget.entityId === nextTarget.entityId : currentValue.overTarget === nextTarget)) {
            return currentValue;
          }
          return {
            ...currentValue,
            x: session.latestX,
            y: session.latestY,
            overTarget: nextTarget
          };
        });
        return;
      }
      session.overTargetSignature = nextSignature;
      booruViewLogger.debug(
        "booru.dnd.custom.hover",
        "Booru actualizo el hover del drag interno.",
        {
          resourceIds: session.resourceIds,
          overTarget: nextTarget
        }
      );
      setCustomDragState((currentValue) => currentValue?.active ? {
        ...currentValue,
        x: session.latestX,
        y: session.latestY,
        overTarget: nextTarget
      } : currentValue);
    };
    const activateCustomDrag = () => {
      if (session.active) {
        return;
      }
      session.active = true;
      booruViewLogger.debug(
        "booru.dnd.custom.start",
        "Booru activo el drag interno por hold.",
        {
          resourceIds: session.resourceIds,
          primaryId: session.primaryId
        }
      );
      setCustomDragState({
        active: true,
        primaryId: session.primaryId,
        primaryResource: session.primaryResource,
        resourceIds: session.resourceIds,
        x: session.latestX,
        y: session.latestY,
        overTarget: null
      });
      syncCustomDragTarget();
    };
    session.handlePointerMove = (moveEvent) => {
      if (moveEvent.pointerId !== session.pointerId) {
        return;
      }
      session.latestX = Number(moveEvent.clientX || 0);
      session.latestY = Number(moveEvent.clientY || 0);
      if (!session.active && performance.now() - session.startedAt >= 150) {
        activateCustomDrag();
      } else {
        syncCustomDragTarget();
      }
    };
    session.handlePointerUp = (upEvent) => {
      if (upEvent.pointerId !== session.pointerId) {
        return;
      }
      const dragWasActive = session.active;
      const dropTarget = dragWasActive ? getQuickAssignTargetDescriptor(document.elementFromPoint(session.latestX, session.latestY)) : null;
      clearCustomDragSession();
      setCustomDragState(null);
      if (!dragWasActive) {
        booruViewLogger.debug(
          "booru.dnd.custom.tap",
          "Booru trato la interaccion como click normal porque el hold no se completo.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId
          }
        );
        return;
      }
      suppressNextResourceClickRef.current = true;
      window.setTimeout(() => {
        suppressNextResourceClickRef.current = false;
      }, 0);
      if (dropTarget) {
        booruViewLogger.info(
          "booru.dnd.custom.drop",
          "Booru resolvio un drop interno sobre asignacion rapida.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId,
            target: dropTarget
          }
        );
        void handleQuickAssignEntityRef.current?.({
          resourceId: session.resourceIds[0] || null,
          resourceIds: session.resourceIds,
          kind: dropTarget.kind,
          entityId: dropTarget.entityId
        });
      } else {
        booruViewLogger.debug(
          "booru.dnd.custom.cancel",
          "Booru cancelo el drag interno sin destino valido.",
          {
            resourceIds: session.resourceIds,
            primaryId: session.primaryId,
            x: session.latestX,
            y: session.latestY
          }
        );
      }
    };
    session.handlePointerCancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== session.pointerId) {
        return;
      }
      clearCustomDragSession();
      setCustomDragState(null);
      booruViewLogger.debug(
        "booru.dnd.custom.pointer-cancel",
        "Booru recibio pointercancel durante el drag interno.",
        {
          resourceIds: session.resourceIds,
          primaryId: session.primaryId
        }
      );
    };
    customDragSessionRef.current = session;
    customDragTimerRef.current = window.setTimeout(() => {
      customDragTimerRef.current = 0;
      if (customDragSessionRef.current === session) {
        activateCustomDrag();
      }
    }, 150);
    window.addEventListener("pointermove", session.handlePointerMove, true);
    window.addEventListener("pointerup", session.handlePointerUp, true);
    window.addEventListener("pointercancel", session.handlePointerCancel, true);
  }, [
    activeResourceSection,
    clearCustomDragSession,
    showResourceWorkspace
  ]);
  useEffect25(() => {
    diagnosticsContextRef.current = {
      activeSection,
      showResourceWorkspace,
      showEntityProfile,
      currentResourcePage,
      currentEntityProfilePage,
      resourceItemCount: resourceItems.length,
      entityItemCount: entityItems.length,
      selectedCount: currentSelection.ids.length,
      loading,
      resourceLoading,
      entityLoading,
      busyAction
    };
  }, [
    activeSection,
    busyAction,
    currentEntityProfilePage,
    currentResourcePage,
    currentSelection.ids.length,
    entityItems.length,
    entityLoading,
    loading,
    resourceItems.length,
    resourceLoading,
    showEntityProfile,
    showResourceWorkspace
  ]);
  useEffect25(() => () => {
    clearCustomDragSession();
  }, [clearCustomDragSession]);
  useEffect25(() => {
    clearCustomDragSession();
    setCustomDragState(null);
  }, [activeSection, activeResourceSection, clearCustomDragSession]);
  useEffect25(() => {
    const now = performance.now();
    const renderBurstState = renderBurstRef.current;
    if (now - renderBurstState.windowStartedAt >= 1e3) {
      renderBurstState.windowStartedAt = now;
      renderBurstState.renderCount = 0;
    }
    renderBurstState.renderCount += 1;
    if (renderBurstState.renderCount >= 24 && now - renderBurstState.lastLoggedAt >= 1e3) {
      renderBurstState.lastLoggedAt = now;
      booruViewLogger.info(
        "booru.view.render-burst",
        "Booru detecto una rafaga de renders en renderer.",
        {
          renderCount: renderBurstState.renderCount,
          windowMs: Number((now - renderBurstState.windowStartedAt).toFixed(2)),
          ...diagnosticsContextRef.current,
          resourceQuerySignature,
          entityProfileKey
        }
      );
    }
  });
  useEffect25(() => {
    if (typeof window.requestAnimationFrame !== "function") {
      return void 0;
    }
    let frameId = 0;
    let lastFrameAt = performance.now();
    let lastLoggedAt = 0;
    const tick = (timestamp) => {
      const deltaMs = timestamp - lastFrameAt;
      if (!document.hidden && deltaMs >= 220 && timestamp - lastLoggedAt >= 2e3) {
        lastLoggedAt = timestamp;
        booruViewLogger.info(
          "booru.performance.frame-gap",
          "Booru detecto un gap de frames anormal en renderer.",
          {
            deltaMs: Number(deltaMs.toFixed(2)),
            ...diagnosticsContextRef.current,
            resourceQuerySignature,
            entityProfileKey
          }
        );
      }
      lastFrameAt = timestamp;
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [entityProfileKey, resourceQuerySignature]);
  useEffect25(() => {
    if (typeof window.PerformanceObserver !== "function") {
      return void 0;
    }
    let observer = null;
    try {
      observer = new window.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < 80) {
            continue;
          }
          booruViewLogger.info(
            "booru.performance.long-task",
            "Booru detecto una long task en renderer.",
            {
              durationMs: Number(entry.duration.toFixed(2)),
              name: entry.name || null,
              entryType: entry.entryType || null,
              startTimeMs: Number(entry.startTime.toFixed(2)),
              ...diagnosticsContextRef.current,
              resourceQuerySignature,
              entityProfileKey
            }
          );
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      return void 0;
    }
    return () => {
      observer?.disconnect?.();
    };
  }, [entityProfileKey, resourceQuerySignature]);
  useEffect25(() => {
    booruViewLogger.info(
      "booru.view.navigation",
      "Booru cambio de seccion o perfil activo.",
      {
        section: activeSection,
        showResourceWorkspace,
        showEntityProfile,
        entityProfileKey: entityProfileKey || null,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        resourceQuerySignature
      }
    );
  }, [
    activeSection,
    currentEntityProfilePage,
    currentResourcePage,
    entityProfileKey,
    resourceQuerySignature,
    showEntityProfile,
    showResourceWorkspace
  ]);
  useEffect25(() => {
    if (!detailsAnchorRef.current?.open) {
      setClassificationDraft(buildClassificationDraft([]));
      return;
    }
    setClassificationDraft((currentDraft) => {
      const currentResourceIds = Array.isArray(currentDraft?.resourceIds) ? currentDraft.resourceIds : [];
      if (arraysEqual2(currentResourceIds, selectedResources.map((resource) => resource.id)) && currentDraft?.dirtyFields?.length) {
        return currentDraft;
      }
      return buildClassificationDraft(selectedResources);
    });
  }, [selectedResources, showResourceWorkspace, floatingDetailsActive]);
  useEffect25(() => {
    const clearCurrentSelection = () => {
      if (!activeResourceSection) {
        return;
      }
      setSelectedResourceState((currentValue) => ({
        ...currentValue,
        [activeResourceSection]: {
          ids: [],
          activeId: "",
          mode: "single"
        }
      }));
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Delete" || isTextInputTarget(event.target)) {
        return;
      }
      if (!showResourceWorkspace || !currentSelection.ids.length || activeResourceSection === "trash") {
        return;
      }
      event.preventDefault();
      void (async () => {
        try {
          setBusyAction("trash");
          const result = await invoke6("booru:trash-resources", {
            resourceIds: currentSelection.ids,
            view: { section: activeResourceSection, query: resourceQuery }
          });
          applyResourceMutationResult(result);
          setSnapshot(result?.snapshot || snapshot);
          setError("");
          setContextMenuState(null);
          clearCurrentSelection();
          setInspectorOpen(false);
          setAnchoredResources([]);
        } catch (trashError) {
          setError(
            trashError instanceof Error ? trashError.message : "No se pudo enviar la seleccion a la papelera."
          );
        } finally {
          setBusyAction("");
        }
      })();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeResourceSection, currentSelection.ids, resourceQuerySignature, showResourceWorkspace, snapshot]);
  useEffect25(() => {
    const supportsVisibleThumbnailPriming = snapshot?.derivatives && typeof snapshot?.stats?.thumbnailBacklogCount === "number";
    const isInfiniteMedia = activeResourceSection === "media";
    const itemsToPrime = isInfiniteMedia ? mediaThumbnailPrimingItems.filter((item) => !primedMediaThumbnailIdsRef.current.has(item.id)) : thumbnailPrimingItems;
    const primingSignature = JSON.stringify({
      section: activeSection,
      mode: showResourceWorkspace ? "resource-section" : entityThumbnailPrimingEnabled ? "entity-profile" : "idle",
      page: showResourceWorkspace ? currentResourcePage : currentEntityProfilePage,
      querySignature: showResourceWorkspace ? resourceQuerySignature : entityProfileKey,
      ids: itemsToPrime.map((item) => item.id)
    });
    if (!itemsToPrime.length || !supportsVisibleThumbnailPriming || visibleThumbnailPrimingUnavailableRef.current || !isInfiniteMedia && primedResourcePageSignatureRef.current === primingSignature) {
      return;
    }
    if (isInfiniteMedia) {
      itemsToPrime.forEach((item) => primedMediaThumbnailIdsRef.current.add(item.id));
    } else {
      primedResourcePageSignatureRef.current = primingSignature;
    }
    booruViewLogger.debug(
      "booru.thumbnail-prime.start",
      "Booru priorizo thumbnails visibles sin repetir las que ya estan listas.",
      {
        mode: showResourceWorkspace ? "resource-section" : "entity-profile",
        section: activeSection,
        resourcePage: currentResourcePage,
        entityProfilePage: currentEntityProfilePage,
        itemCount: itemsToPrime.length,
        sampleIds: summarizeIdsForLog(itemsToPrime)
      }
    );
    void invoke6("booru:prime-visible-thumbnails", {
      resourceIds: itemsToPrime.map((item) => item.id)
    }).catch((primeError) => {
      const errorMessage = primeError instanceof Error ? primeError.message : String(primeError || "");
      if (errorMessage.includes("No handler registered")) {
        visibleThumbnailPrimingUnavailableRef.current = true;
      }
      booruViewLogger.info(
        "booru.thumbnail-prime.error",
        "Booru no pudo priorizar thumbnails visibles.",
        {
          mode: showResourceWorkspace ? "resource-section" : "entity-profile",
          section: activeSection,
          itemCount: itemsToPrime.length,
          sampleIds: summarizeIdsForLog(itemsToPrime),
          error: truncateDiagnosticText(errorMessage, 600)
        }
      );
    });
  }, [
    activeSection,
    currentEntityProfilePage,
    currentResourcePage,
    entityProfileKey,
    entityThumbnailPrimingEnabled,
    mediaThumbnailPrimingItems,
    resourceQuerySignature,
    thumbnailPrimingItems,
    showResourceWorkspace,
    snapshot?.derivatives,
    snapshot?.stats?.thumbnailBacklogCount
  ]);
  const handleAction = async (actionId, channel) => {
    const startedAt = performance.now();
    setBusyAction(actionId);
    booruViewLogger.debug(
      "booru.action.start",
      "Booru inicio una accion general de runtime.",
      {
        actionId,
        channel,
        ...diagnosticsContextRef.current
      }
    );
    try {
      const nextSnapshot = await invoke6(channel);
      setSnapshot(nextSnapshot);
      setError("");
      logRendererDuration(
        "booru.action.done",
        "Booru resolvio una accion general de runtime.",
        performance.now() - startedAt,
        {
          actionId,
          channel
        }
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "No se pudo ejecutar la accion de Booru."
      );
      booruViewLogger.info(
        "booru.action.error",
        "Booru no pudo resolver una accion general de runtime.",
        {
          actionId,
          channel,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: actionError instanceof Error ? actionError.message : String(actionError || "")
        }
      );
    } finally {
      setBusyAction("");
    }
  };
  const setSelectionForSection = (section, nextSelection) => {
    const normalizedSelection = normalizeSectionSelection(nextSelection);
    booruViewLogger.debug(
      "booru.selection.change",
      "Booru actualizo la seleccion de recursos.",
      {
        section,
        mode: normalizedSelection.mode,
        activeId: normalizedSelection.activeId || null,
        selectedCount: normalizedSelection.ids.length,
        sampleIds: normalizedSelection.ids.slice(0, 12)
      }
    );
    setSelectedResourceState((currentValue) => ({
      ...currentValue,
      [section]: normalizedSelection
    }));
  };
  const setResourcePageForSection = (section, nextPage) => {
    setResourcePageState((currentValue) => ({
      ...currentValue,
      [section]: {
        page: clampPageNumber(nextPage, Number.MAX_SAFE_INTEGER),
        querySignature: resourceQuerySignature
      }
    }));
  };
  const loadNextMediaPage = () => {
    if (!resourceState.hasMore || resourceLoading || mediaLoadMoreLockedRef.current) {
      return;
    }
    mediaLoadMoreLockedRef.current = true;
    const nextPage = currentResourcePage + 1;
    setResourcePageForSection(activeResourceSection, nextPage);
    void loadResources({ requestedPage: nextPage });
  };
  const setEntityProfilePageForSection = (section, nextPage) => {
    setEntityProfilePageState((currentValue) => ({
      ...currentValue,
      [section]: {
        page: clampPageNumber(nextPage, Number.MAX_SAFE_INTEGER),
        profileKey: entityProfileKey
      }
    }));
  };
  const loadNextEntityProfileGalleryPage = () => {
    if (!showEntityProfile || !entityProfileGalleryState.hasMore || entityProfileGalleryLoading) {
      return;
    }
    setEntityProfilePageForSection(activeSection, currentEntityProfilePage + 1);
  };
  const loadNextEntityProfileRelationPage = () => {
    if (!showEntityProfile || !activeEntityRelationKind || !entityProfileRelationState.hasMore || entityProfileRelationLoading) {
      return;
    }
    void loadEntityProfileRelations({ append: true });
  };
  const clearSelectionForSection = (section) => {
    setSelectionForSection(section, {
      ids: [],
      activeId: "",
      mode: "single"
    });
  };
  const openResourceHero = (item, items = resourceItems) => {
    if (!item?.id) {
      return;
    }
    const nextItems = (Array.isArray(items) ? items : []).filter((entry) => entry?.id && isPreviewableMediaKind(entry.mediaKind));
    if (!nextItems.length) {
      return;
    }
    setResourceHeroState({
      activeId: item.id,
      items: nextItems
    });
    setInspectorOpen(false);
    setAnchoredResources([]);
  };
  const stepResourceHero = (direction) => {
    setResourceHeroState((currentValue) => {
      const items = Array.isArray(currentValue?.items) ? currentValue.items : [];
      const activeId = String(currentValue?.activeId || "").trim();
      const currentIndex = items.findIndex((entry) => entry?.id === activeId);
      if (currentIndex < 0) {
        return currentValue;
      }
      const nextIndex = Math.min(
        items.length - 1,
        Math.max(0, currentIndex + direction)
      );
      if (nextIndex === currentIndex) {
        return currentValue;
      }
      return {
        ...currentValue,
        activeId: items[nextIndex]?.id || activeId
      };
    });
  };
  useEffect25(() => {
    setResourceHeroState(null);
  }, [activeSection, activeEntityProfile?.id, settingsSubview]);
  const handleResourceClick = (item, event) => {
    if (!showResourceWorkspace || !activeResourceSection) {
      return;
    }
    const isToggle = Boolean(event?.ctrlKey || event?.metaKey);
    const currentIds = Array.isArray(currentSelection.ids) ? currentSelection.ids : [];
    if (!isToggle) {
      setSelectionForSection(activeResourceSection, {
        ids: [item.id],
        activeId: item.id,
        mode: "single"
      });
      return;
    }
    const itemSelected = currentIds.includes(item.id);
    const nextIds = itemSelected ? currentIds.filter((resourceId) => resourceId !== item.id) : [...currentIds, item.id];
    setSelectionForSection(activeResourceSection, {
      ids: nextIds,
      activeId: nextIds.length ? itemSelected && currentSelection.activeId === item.id ? nextIds.at(-1) || nextIds[0] || "" : item.id : "",
      mode: nextIds.length > 1 ? "multi" : "single"
    });
  };
  const handleResourceOpen = (item, event) => {
    if (!showResourceWorkspace || !activeResourceSection || event?.ctrlKey || event?.metaKey) {
      return;
    }
    openResourceHero(item, resourceItems);
  };
  const openResourceContextMenu = (item, event) => {
    if (!showResourceWorkspace || !activeResourceSection) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const selectionIds = currentSelection.ids.includes(item.id) ? currentSelection.ids : [item.id];
    const activeId = item.id;
    setSelectionForSection(activeResourceSection, {
      ids: selectionIds,
      activeId,
      mode: selectionIds.length > 1 ? "multi" : "single"
    });
    const itemsById = new Map(resourceItems.map((resource) => [resource.id, resource]));
    const selectedContextResources = selectionIds.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
    const singleContextResource = selectedContextResources.length === 1 ? selectedContextResources[0] : null;
    const imageCompatible = canUseResourceForImageActions(singleContextResource);
    const menuItems = buildBooruResourceActions({
      surface: "resource",
      section: activeResourceSection,
      selectionCount: selectionIds.length,
      imageCompatible
    });
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: menuItems,
      resourceIds: selectionIds,
      resources: selectedContextResources,
      activeId,
      surface: "resource",
      section: activeResourceSection
    });
  };
  const openEntityProfileResourceContextMenu = (item, event, selectedIds = [item?.id]) => {
    if (!showEntityProfile || !activeEntityKind || !activeEntityProfile?.id || !item?.id) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const contextIds = uniqueIds(selectedIds);
    const profileItemsById = new Map((entityProfileGalleryState?.items || []).map((resource) => [resource.id, resource]));
    const contextResources = contextIds.map((resourceId) => profileItemsById.get(resourceId)).filter(Boolean);
    setProfileGallerySelectedIds(contextIds);
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: buildBooruResourceActions({
        surface: "profile",
        selectionCount: contextIds.length,
        imageCompatible: contextResources.length === 1 && canUseResourceForImageActions(item),
        visualCompatible: contextResources.length === 1 && canUseResourceAsEntityVisual(item)
      }),
      resourceIds: contextIds,
      resources: contextResources,
      activeId: item.id,
      surface: "profile",
      section: "profile",
      entityKind: activeEntityKind,
      entityId: activeEntityProfile.id
    });
  };
  const openEntityCardContextMenu = (item, event) => {
    const contextResource = buildContextResourceFromDescriptor(item?.visual || item);
    if (!contextResource) {
      return;
    }
    if (!canUseResourceForImageActions(contextResource)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: [
        { id: "copy", label: "Copiar al portapapeles" },
        { id: "google", label: "Buscar en Google" }
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource]
    });
  };
  const openEntityProfileVisualContextMenu = (visualRole, descriptor, event) => {
    const contextResource = buildContextResourceFromDescriptor(descriptor);
    if (!contextResource) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      items: [
        ...canUseResourceForImageActions(contextResource) ? [
          { id: "copy", label: "Copiar al portapapeles" },
          { id: "google", label: "Buscar en Google" }
        ] : [],
        { id: "adjust-visual", label: "Ajustar" }
      ],
      resourceIds: [contextResource.id],
      resources: [contextResource],
      visualRole,
      entityKind: activeEntityKind,
      entityId: activeEntityProfile?.id
    });
  };
  const getContextSelectionResources = () => {
    if (Array.isArray(contextMenuState?.resources) && contextMenuState.resources.length) {
      return contextMenuState.resources.filter(Boolean);
    }
    const ids = Array.isArray(contextMenuState?.resourceIds) ? contextMenuState.resourceIds : [];
    const itemsById = new Map([
      ...resourceItems,
      ...Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [],
      ...anchoredResourcesRef.current
    ].map((resource) => [resource.id, resource]));
    return ids.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
  };
  const handleCopyToClipboard = async (resource) => {
    await window.nexus.clipboard.writeImageFromPath(resource.storagePath);
  };
  const handleContextMenuAction = async (actionId) => {
    const contextResources = getContextSelectionResources();
    const contextIds = uniqueIds([
      ...Array.isArray(contextMenuState?.resourceIds) ? contextMenuState.resourceIds : [],
      ...contextResources.map((resource) => resource.id)
    ]);
    const singleResource = contextResources.length === 1 ? contextResources[0] : null;
    const contextActiveId = String(contextMenuState?.activeId || contextIds[0] || "").trim();
    const contextEntityKind = String(contextMenuState?.entityKind || "").trim();
    const contextEntityId = String(contextMenuState?.entityId || "").trim();
    const contextVisualRole = String(contextMenuState?.visualRole || "").trim();
    const contextSurface = String(contextMenuState?.surface || "resource").trim();
    setContextMenuState(null);
    try {
      if ((actionId === "set-avatar" || actionId === "set-banner") && singleResource && contextEntityKind && contextEntityId) {
        setBusyAction(actionId);
        const result = await invoke6("booru:set-entity-visual", {
          kind: contextEntityKind,
          entityId: contextEntityId,
          resourceId: singleResource.id,
          visualRole: actionId === "set-avatar" ? "avatar" : "banner"
        });
        if (result?.profile) {
          setEntityProfile(result.profile);
        }
        setEntityProfileError("");
        return;
      }
      if (actionId === "adjust-visual" && singleResource && contextEntityKind && contextEntityId && (contextVisualRole === "avatar" || contextVisualRole === "banner")) {
        setEntityVisualCropState({
          kind: contextEntityKind,
          entityId: contextEntityId,
          role: contextVisualRole,
          source: { pathValue: singleResource.storagePath, mediaKind: singleResource.mediaKind },
          initialLayout: entityProfile?.visualSettings?.[contextVisualRole] || null
        });
        return;
      }
      if (actionId === "disassociate-profile" && contextEntityKind && contextEntityId && contextIds.length) {
        setEntityBusy(true);
        const result = await invoke6("booru:disassociate-resources-from-entity", {
          kind: contextEntityKind,
          entityId: contextEntityId,
          resourceIds: contextIds
        });
        if (result?.profile) setEntityProfile(result.profile);
        setEntityProfileGalleryState((current) => ({
          ...current,
          items: (current?.items || []).filter((item) => !contextIds.includes(item.id))
        }));
        setEntityRevision((current) => current + 1);
        return;
      }
      if (actionId === "details" && contextIds.length) {
        const contextById = new Map(contextResources.map((resource) => [resource.id, resource]));
        setAnchoredResources(
          contextIds.map((resourceId) => contextById.get(resourceId)).filter(Boolean)
        );
        if (contextSurface === "profile" && showEntityProfile) {
          setProfileGallerySelectedIds(contextIds);
          setDetailsContext({
            mode: "floating",
            surfaceKey: workspaceRouteKey,
            ids: contextIds,
            activeId: contextActiveId,
            profileContext: { kind: contextEntityKind, entityId: contextEntityId }
          });
          setFloatingDetailsGeometry((currentValue) => clampBooruFloatingDetailsGeometry(currentValue, {
            width: window.innerWidth,
            height: window.innerHeight
          }));
        } else if (activeResourceSection) {
          setSelectionForSection(activeResourceSection, {
            ids: contextIds,
            activeId: contextActiveId,
            mode: contextIds.length > 1 ? "multi" : "single"
          });
          setDetailsContext({ mode: "fixed", surfaceKey: activeResourceSection });
        }
        setInspectorOpen(true);
        return;
      }
      if (actionId === "copy" && singleResource) {
        await handleCopyToClipboard(singleResource);
        return;
      }
      if (actionId === "google" && singleResource) {
        await invoke6("booru:open-in-brave", { resourceId: singleResource.id });
        return;
      }
      if (actionId === "trash") {
        setBusyAction("trash");
        const result = await invoke6("booru:trash-resources", {
          resourceIds: contextIds,
          ...activeResourceSection ? { view: { section: activeResourceSection, query: resourceQuery } } : {}
        });
        applyResourceMutationResult(result);
        setSnapshot(result?.snapshot || snapshot);
        if (activeResourceSection) clearSelectionForSection(activeResourceSection);
        if (contextSurface === "profile") {
          setProfileGallerySelectedIds([]);
          setEntityProfileGalleryState((currentValue) => ({
            ...currentValue,
            items: (currentValue?.items || []).filter((resource) => !contextIds.includes(resource.id))
          }));
        }
        setInspectorOpen(false);
        setDetailsContext(null);
        setAnchoredResources([]);
        return;
      }
      if (actionId === "restore") {
        setBusyAction("restore");
        const result = await invoke6("booru:restore-resources", {
          resourceIds: contextIds,
          view: { section: activeResourceSection, query: resourceQuery }
        });
        applyResourceMutationResult(result);
        setSnapshot(result?.snapshot || snapshot);
        return;
      }
      if (actionId === "purge") {
        setBusyAction("purge");
        const result = await invoke6("booru:purge-resources", {
          resourceIds: contextIds,
          view: { section: activeResourceSection, query: resourceQuery }
        });
        applyResourceMutationResult(result);
        setSnapshot(result?.snapshot || snapshot);
        clearSelectionForSection(activeResourceSection);
        setInspectorOpen(false);
        setAnchoredResources([]);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "No se pudo ejecutar la accion contextual."
      );
    } finally {
      setEntityBusy(false);
      setBusyAction("");
    }
  };
  const persistClassificationDraft = async (draftToPersist) => {
    if (!canSaveDraftProgress(draftToPersist)) {
      return;
    }
    if (autosaveStateRef.current.inFlight) {
      autosaveStateRef.current.queued = true;
      return;
    }
    autosaveStateRef.current.inFlight = true;
    setSavingClassification(true);
    const startedAt = performance.now();
    booruViewLogger.debug(
      "booru.classification.autosave.start",
      "Booru inicio un autosave de clasificacion o metadata.",
      {
        resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
        dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : []
      }
    );
    try {
      const itemsById = new Map(
        [
          ...resourceItems,
          ...Array.isArray(entityProfileGalleryState?.items) ? entityProfileGalleryState.items : [],
          ...anchoredResourcesRef.current
        ].map((item) => [item.id, item])
      );
      const draftResources = draftToPersist.resourceIds.map((resourceId) => itemsById.get(resourceId)).filter(Boolean);
      const expectedQuerySignature = resourceQuerySignature;
      const payload = {
        ...buildSavePayload(draftResources, draftToPersist),
        ...showResourceWorkspace ? { view: { section: activeResourceSection, query: resourceQuery } } : {}
      };
      const result = await invoke6(
        canSaveClassification(draftToPersist) ? "booru:save-basic-classification" : "booru:save-resource-metadata",
        payload
      );
      const mutation = applyResourceMutationResult(result, expectedQuerySignature);
      const savedResources = normalizeSelectedEntities(mutation.updatedResources);
      const savedById = new Map(savedResources.map((item) => [item.id, item]));
      const orderedSavedResources = draftToPersist.resourceIds.map((resourceId) => savedById.get(resourceId)).filter(Boolean);
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      setEntityRevision((currentValue) => currentValue + 1);
      setClassificationDraft((currentDraft) => arraysEqual2(currentDraft.resourceIds || [], draftToPersist.resourceIds || []) ? {
        ...buildClassificationDraft(orderedSavedResources.length ? orderedSavedResources : draftResources),
        dirtyFields: []
      } : currentDraft);
      logRendererDuration(
        "booru.classification.autosave.done",
        "Booru resolvio un autosave de clasificacion o metadata.",
        performance.now() - startedAt,
        {
          resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
          dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
          savedCount: orderedSavedResources.length,
          sampleIds: summarizeIdsForLog(orderedSavedResources)
        }
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el recurso."
      );
      booruViewLogger.info(
        "booru.classification.autosave.error",
        "Booru no pudo persistir un autosave de clasificacion o metadata.",
        {
          resourceIds: Array.isArray(draftToPersist?.resourceIds) ? draftToPersist.resourceIds.slice(0, 16) : [],
          dirtyFields: Array.isArray(draftToPersist?.dirtyFields) ? draftToPersist.dirtyFields : [],
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: saveError instanceof Error ? saveError.message : String(saveError || "")
        }
      );
    } finally {
      autosaveStateRef.current.inFlight = false;
      setSavingClassification(false);
      if (autosaveStateRef.current.queued) {
        autosaveStateRef.current.queued = false;
        const latestDraft = classificationDraftRef.current;
        if (canSaveDraftProgress(latestDraft)) {
          void persistClassificationDraft(latestDraft);
        }
      }
    }
  };
  useEffect25(() => {
    if (!showResourceWorkspace && !floatingDetailsActive || showResourceWorkspace && (activeResourceSection === "duplicates" || activeResourceSection === "trash")) {
      return void 0;
    }
    if (!canSaveDraftProgress(classificationDraft)) {
      return void 0;
    }
    const draftSnapshot = classificationDraft;
    autosaveTimerRef.current = window.setTimeout(() => {
      autosaveTimerRef.current = 0;
      void persistClassificationDraft(draftSnapshot);
    }, 220);
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = 0;
      }
    };
  }, [activeResourceSection, classificationDraft, floatingDetailsActive, selectedResourceIdsSignature, showResourceWorkspace]);
  const handleQuickAssignEntity = async ({ resourceId, resourceIds, kind, entityId }) => {
    const normalizedResourceIds = uniqueIds([
      resourceId,
      ...Array.isArray(resourceIds) ? resourceIds : []
    ]);
    if (!normalizedResourceIds.length || !kind || !entityId) {
      return;
    }
    const startedAt = performance.now();
    setBusyAction("quick-assign");
    booruViewLogger.debug(
      "booru.quick-assign.start",
      "Booru inicio una asignacion rapida.",
      {
        resourceId: normalizedResourceIds[0] || null,
        resourceIds: normalizedResourceIds,
        kind,
        entityId
      }
    );
    try {
      const expectedQuerySignature = resourceQuerySignature;
      const result = await invoke6("booru:quick-assign-entity", {
        resourceId: normalizedResourceIds[0] || null,
        resourceIds: normalizedResourceIds,
        kind,
        entityId,
        view: { section: activeResourceSection, query: resourceQuery }
      });
      setSnapshot(result?.snapshot || snapshot);
      const mutation = applyResourceMutationResult(result, expectedQuerySignature);
      const updatedResources = normalizeSelectedEntities(mutation.updatedResources);
      setError("");
      setEntityRevision((currentValue) => currentValue + 1);
      logRendererDuration(
        "booru.quick-assign.done",
        "Booru resolvio una asignacion rapida.",
        performance.now() - startedAt,
        {
          resourceId: normalizedResourceIds[0] || null,
          resourceIds: normalizedResourceIds,
          kind,
          entityId,
          resultResourceIds: updatedResources.map((resource) => resource.id)
        }
      );
    } catch (assignError) {
      setError(
        assignError instanceof Error ? assignError.message : "No se pudo aplicar la asignacion rapida."
      );
      booruViewLogger.info(
        "booru.quick-assign.error",
        "Booru no pudo aplicar una asignacion rapida.",
        {
          resourceId: normalizedResourceIds[0] || null,
          resourceIds: normalizedResourceIds,
          kind,
          entityId,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: assignError instanceof Error ? assignError.message : String(assignError || "")
        }
      );
    } finally {
      setBusyAction("");
    }
  };
  handleQuickAssignEntityRef.current = handleQuickAssignEntity;
  const handleApplyRecommendation = async (item) => {
    if (!item || !selectedResources.length) {
      return;
    }
    const selectedResourceIds = selectedResources.map((resource) => resource.id);
    const startedAt = performance.now();
    const usesCreationFlow = item.type === "create-tag" || item.type === "create-entity";
    const resolveDraftForSelection = (currentDraft) => arraysEqual2(
      Array.isArray(currentDraft?.resourceIds) ? currentDraft.resourceIds : [],
      selectedResourceIds
    ) ? currentDraft : buildClassificationDraft(selectedResources);
    const applyEntityToDraft = (currentDraft, kind, entity) => {
      const draftField = DRAFT_ENTITY_FIELD_BY_KIND[kind];
      if (!draftField || !entity?.id) {
        return currentDraft;
      }
      const currentItems = Array.isArray(currentDraft?.[draftField]) ? currentDraft[draftField] : [];
      const nextItems = normalizeSelectedEntities([...currentItems, entity]);
      const nextDraft = {
        ...currentDraft,
        [draftField]: nextItems
      };
      if (draftField === "characters") {
        nextDraft.characterUniverses = pruneCharacterUniverseAssignments(
          currentDraft.characterUniverses,
          nextItems
        );
      }
      if (!nextDraft.reality && kind === "author") {
        nextDraft.reality = "real";
      }
      if (!nextDraft.reality && (kind === "character" || kind === "universe")) {
        nextDraft.reality = "ficticio";
      }
      return applyClassificationPolicyToDraft(markDraftDirty(nextDraft, draftField));
    };
    booruViewLogger.debug(
      "booru.recommendation.apply.start",
      "Booru inicio la aplicacion de una recomendacion sobre el draft.",
      {
        itemId: item.id || null,
        itemType: item.type || null,
        itemKind: item.kind || null,
        selectedResourceIds: selectedResourceIds.slice(0, 16)
      }
    );
    if (usesCreationFlow) {
      setBusyAction("recommendation-apply");
    }
    try {
      if (item.type === "reality-action") {
        setClassificationDraft((currentDraft) => applyClassificationPolicyToDraft(markDraftDirty({
          ...resolveDraftForSelection(currentDraft),
          reality: item.reality || null
        }, "reality"), { realityWasEdited: true }));
      } else if (item.type === "entity") {
        const nextEntity = item.entity || {
          id: item.entityId,
          displayName: item.label
        };
        setClassificationDraft((currentDraft) => applyEntityToDraft(
          resolveDraftForSelection(currentDraft),
          item.kind,
          nextEntity
        ));
      } else if (item.type === "tag") {
        const nextTag = item.tag || {
          id: item.tagId,
          name: item.label
        };
        setClassificationDraft((currentDraft) => {
          const baseDraft = resolveDraftForSelection(currentDraft);
          return markDraftDirty({
            ...baseDraft,
            manualTags: normalizeSelectedTags([
              ...Array.isArray(baseDraft.manualTags) ? baseDraft.manualTags : [],
              nextTag
            ])
          }, "manualTags");
        });
      } else if (item.type === "create-tag") {
        const result = await invoke6("booru:ensure-tag", { name: item.createName || item.label });
        const nextTag = result?.tag;
        if (!nextTag?.id) {
          throw new Error("Booru no devolvio la tag creada.");
        }
        setClassificationDraft((currentDraft) => {
          const baseDraft = resolveDraftForSelection(currentDraft);
          return markDraftDirty({
            ...baseDraft,
            manualTags: normalizeSelectedTags([
              ...Array.isArray(baseDraft.manualTags) ? baseDraft.manualTags : [],
              nextTag
            ])
          }, "manualTags");
        });
      } else if (item.type === "create-entity") {
        const result = await ensureEntityFromUi(item.kind, item.createName || item.label);
        const nextEntity = result?.entity;
        if (!result) {
          return;
        }
        if (!nextEntity?.id) {
          throw new Error("Booru no devolvio la entidad creada.");
        }
        setClassificationDraft((currentDraft) => applyEntityToDraft(
          resolveDraftForSelection(currentDraft),
          item.kind,
          nextEntity
        ));
        setEntityRevision((currentValue) => currentValue + 1);
      }
      setError("");
      logRendererDuration(
        "booru.recommendation.apply.done",
        "Booru aplico una recomendacion sobre el draft actual.",
        performance.now() - startedAt,
        {
          itemId: item.id || null,
          itemType: item.type || null,
          itemKind: item.kind || null,
          selectedResourceIds: selectedResourceIds.slice(0, 16)
        }
      );
    } catch (applyError) {
      setError(
        applyError instanceof Error ? applyError.message : "No se pudo aplicar la recomendacion."
      );
      booruViewLogger.info(
        "booru.recommendation.apply.error",
        "Booru no pudo aplicar una recomendacion sobre el draft.",
        {
          itemId: item.id || null,
          itemType: item.type || null,
          itemKind: item.kind || null,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          error: applyError instanceof Error ? applyError.message : String(applyError || "")
        }
      );
    } finally {
      if (usesCreationFlow) {
        setBusyAction("");
      }
    }
  };
  const handleSetCharacterUniverse = async (nextUniverse) => {
    if (activeEntityKind !== "character" || !activeEntityProfile?.id) {
      return;
    }
    setEntityBusy(true);
    try {
      const result = await invoke6("booru:set-character-universe", {
        characterId: activeEntityProfile.id,
        universeId: nextUniverse?.id || null
      });
      if (result?.profile) {
        setEntityProfile(result.profile);
      }
      setEntityError("");
      setEntityProfileError("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (saveError) {
      setEntityError(
        saveError instanceof Error ? saveError.message : "No se pudo actualizar el universe del character."
      );
    } finally {
      setEntityBusy(false);
    }
  };
  const handleCreateCharacterInUniverse = async () => {
    if (activeEntityKind !== "universe" || !activeEntityProfile?.id) {
      return;
    }
    const trimmedName = String(universeCharacterCreateValue || "").trim();
    if (!trimmedName) {
      return;
    }
    setEntityBusy(true);
    try {
      await invoke6("booru:ensure-character-in-universe", {
        name: trimmedName,
        universeId: activeEntityProfile.id
      });
      setEntityError("");
      setEntityProfileError("");
      setUniverseCharacterCreateValue("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (createError) {
      setEntityError(
        createError instanceof Error ? createError.message : "No se pudo crear el character dentro del universe."
      );
    } finally {
      setEntityBusy(false);
    }
  };
  const importClipboardMedia = async (associationValue) => {
    const associations = mergeBooruClipboardAssociations(associationValue);
    if (!associations.length) {
      setClipboardAssociationState({ defaultKind: activeEntityKind || "author" });
      return;
    }
    if (entityBusy) return;
    setEntityBusy(true);
    try {
      const tempFilePath = await window.nexus.clipboard.exportMediaToTempFile("booru-media");
      const result = await invoke6("booru:paste-clipboard-media", {
        tempFilePath,
        associations
      });
      setSnapshot(result?.snapshot || snapshot);
      if (result?.profile) {
        setEntityProfile(result.profile);
      }
      setEntityError("");
      setEntityProfileError("");
      setClipboardAssociationState(null);
      setEntityRevision((currentValue) => currentValue + 1);
      if (showEntityProfile) setEntityProfilePageForSection(activeSection, 1);
      if (showEntityProfile && activeEntityProfile?.tab !== "data" && currentEntityProfilePage === 1) {
        await loadEntityProfileGallery({ requestedPage: 1 });
      } else if (showResourceWorkspace) {
        await reconcileActiveResourceWindow();
      }
    } catch (pasteError) {
      const message = pasteError instanceof Error ? pasteError.message : "No se pudo pegar el recurso del portapapeles en Booru.";
      if (showEntityProfile) setEntityProfileError(message);
      else setError(message);
    } finally {
      setEntityBusy(false);
    }
  };
  const handlePasteClipboardImageToEntity = async () => {
    if (!showEntityProfile || !activeEntityKind || !activeEntityProfile?.id) return;
    await importClipboardMedia(mergeBooruClipboardAssociations(
      { kind: activeEntityKind, entityId: activeEntityProfile.id },
      hoveredGroupAssociationRef.current,
      hoveredEntityRef.current?.id && hoveredEntityRef.current?.kind ? { kind: hoveredEntityRef.current.kind, entityId: hoveredEntityRef.current.id } : null
    ));
  };
  const handleClipboardPasteShortcut = (event) => {
    if (event.defaultPrevented || !(event.ctrlKey || event.metaKey) || event.altKey || String(event.key || "").toLowerCase() !== "v" || isTextEntryElement(event.target) || entityBusy) return;
    event.preventDefault();
    event.stopPropagation();
    const associations = mergeBooruClipboardAssociations(
      showEntityProfile && activeEntityKind && activeEntityProfile?.id ? { kind: activeEntityKind, entityId: activeEntityProfile.id } : null,
      hoveredGroupAssociationRef.current,
      hoveredEntityRef.current?.id && hoveredEntityRef.current?.kind ? { kind: hoveredEntityRef.current.kind, entityId: hoveredEntityRef.current.id } : null
    );
    if (associations.length) {
      void importClipboardMedia(associations);
      return;
    }
    setClipboardAssociationState({ defaultKind: activeEntityKind || "author" });
  };
  useEffect25(() => {
    window.addEventListener("keydown", handleClipboardPasteShortcut, true);
    return () => window.removeEventListener("keydown", handleClipboardPasteShortcut, true);
  }, [
    activeEntityKind,
    activeEntityProfile?.id,
    entityBusy,
    showEntityProfile
  ]);
  const handleEnsureSectionEntity = async () => {
    const trimmedName = String(entityCreateValue || "").trim();
    if (!activeEntityKind || !trimmedName) {
      return;
    }
    setEntityBusy(true);
    try {
      if (activeEntityKind === "character") {
        const created = await ensureEntityFromUi("character", trimmedName);
        if (!created?.entity?.id) {
          return;
        }
      } else {
        await invoke6("booru:ensure-entity", {
          kind: activeEntityKind,
          name: trimmedName
        });
      }
      setEntityError("");
      setEntityCreateValue("");
      setEntityRevision((currentValue) => currentValue + 1);
    } catch (ensureError) {
      setEntityError(
        ensureError instanceof Error ? ensureError.message : "No se pudo asegurar la entidad."
      );
    } finally {
      setEntityBusy(false);
    }
  };
  const handleRestoreSelected = async () => {
    try {
      setBusyAction("restore");
      const result = await invoke6("booru:restore-resources", {
        resourceIds: currentSelection.ids,
        view: { section: activeResourceSection, query: resourceQuery }
      });
      applyResourceMutationResult(result);
      setSnapshot(result?.snapshot || snapshot);
      setError("");
    } catch (restoreError) {
      setError(
        restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la seleccion."
      );
    } finally {
      setBusyAction("");
    }
  };
  const handlePurgeSelected = async () => {
    try {
      setBusyAction("purge");
      const result = await invoke6("booru:purge-resources", {
        resourceIds: currentSelection.ids,
        view: { section: activeResourceSection, query: resourceQuery }
      });
      applyResourceMutationResult(result);
      setSnapshot(result?.snapshot || snapshot);
      setError("");
      if (activeResourceSection) {
        clearSelectionForSection(activeResourceSection);
      }
      setInspectorOpen(false);
      setAnchoredResources([]);
    } catch (purgeError) {
      setError(
        purgeError instanceof Error ? purgeError.message : "No se pudo purgar la seleccion."
      );
    } finally {
      setBusyAction("");
    }
  };
  const hasBlockingSetupWarning = !snapshot?.settings?.watchFolderPath || snapshot?.settings?.watchFolderPath && !snapshot?.python?.available;
  const handleOpenEntity = (kind, item) => {
    if (!item?.id) {
      return;
    }
    const currentRoute = currentWorkspaceRouteRef.current;
    const nextRoute = normalizeBooruWorkspaceRoute({
      section: ENTITY_KIND_SECTION_MAP[kind] || activeSection,
      entityProfile: { kind, id: item.id, tab: "gallery" }
    });
    const navigation = pushBooruWorkspaceRoute(
      normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], currentRoute),
      nextRoute
    );
    captureWorkspaceRouteSession(currentRoute);
    openWorkspaceRoute(nextRoute, navigation, input);
  };
  const handleCloseEntityProfile = async () => {
    const currentRoute = currentWorkspaceRouteRef.current;
    const navigation = await popBooruWorkspaceRoute(
      normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], currentRoute),
      async (candidate) => {
        if (!candidate.profile) return true;
        try {
          return Boolean(await invoke6("booru:get-entity-profile", {
            kind: candidate.profile.kind,
            id: candidate.profile.id
          }));
        } catch {
          return false;
        }
      }
    );
    captureWorkspaceRouteSession(currentRoute);
    openWorkspaceRoute(navigation.activeRoute, navigation, input);
  };
  const handleChangeEntityProfileTab = (nextTab) => {
    if (!activeEntityProfile?.id || !activeEntityKind) {
      return;
    }
    const normalizedTab = getBooruEntityProfileTabOptions(activeEntityKind).some((option) => option.value === nextTab) ? nextTab : "gallery";
    const currentRoute = currentWorkspaceRouteRef.current;
    const nextRoute = normalizeBooruWorkspaceRoute({
      section: activeSection,
      entityProfile: {
        kind: activeEntityKind,
        id: activeEntityProfile.id,
        tab: normalizedTab
      }
    });
    const navigation = replaceBooruWorkspaceRoute(
      normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], currentRoute),
      nextRoute
    );
    captureWorkspaceRouteSession(currentRoute);
    openWorkspaceRoute(nextRoute, navigation, input);
  };
  const handleOpenEntityInMedia = () => {
    if (!activeEntityKind || !activeEntityProfile?.id) {
      return;
    }
    const entityLabel = getEntityProfileLabel(activeEntityProfile, entityProfile) || BOORU_ENTITY_KIND_LABELS[activeEntityKind] || "Entidad";
    const currentRoute = currentWorkspaceRouteRef.current;
    const nextRoute = createBooruSectionRootRoute("media");
    const mediaSearchTokens = [
      {
        type: "entity",
        negative: false,
        kind: activeEntityKind,
        id: activeEntityProfile.id,
        value: entityLabel,
        label: entityLabel
      }
    ];
    const navigation = pushBooruWorkspaceRoute(
      normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], currentRoute),
      nextRoute
    );
    captureWorkspaceRouteSession(currentRoute);
    routeSessionsRef.current.set(
      createBooruWorkspaceRouteKey(nextRoute),
      createBooruResourceRouteSession(nextRoute, mediaSearchTokens)
    );
    openWorkspaceRoute(nextRoute, navigation, {
      ...input && typeof input === "object" ? input : {},
      resourceSearchTokens: mediaSearchTokens
    });
  };
  const handleOpenSettingsSubview = (nextSubview) => {
    const normalizedSubview = nextSubview === "duplicates" || nextSubview === "trash" ? nextSubview : NO_SETTINGS_SUBVIEW;
    const currentRoute = currentWorkspaceRouteRef.current;
    const nextRoute = normalizeBooruWorkspaceRoute({
      section: "settings",
      settingsSubview: normalizedSubview
    });
    const navigation = pushBooruWorkspaceRoute(
      normalizeBooruNavigationState(input?.[BOORU_NAVIGATION_INPUT_KEY], currentRoute),
      nextRoute
    );
    captureWorkspaceRouteSession(currentRoute);
    openWorkspaceRoute(nextRoute, navigation, input);
  };
  if (activeSection === "settings" && settingsSubview === NO_SETTINGS_SUBVIEW) {
    return /* @__PURE__ */ React27.createElement(WorkspacePage, { className: "booruView" }, /* @__PURE__ */ React27.createElement(WorkspaceBody, { className: "booruView__body" }, /* @__PURE__ */ React27.createElement(ScrollRegion, { className: "booruView__detailScroll" }, loading && !snapshot ? /* @__PURE__ */ React27.createElement(
      StateBlock,
      {
        centered: true,
        title: "Cargando plugin",
        description: "Leyendo biblioteca, entidades y runtime local."
      }
    ) : /* @__PURE__ */ React27.createElement("div", { className: "booruView__content" }, error ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, error) : null, !snapshot?.settings?.watchFolderPath ? /* @__PURE__ */ React27.createElement(Notice, { tone: "warning" }, "Booru todavia no tiene una carpeta vigilada configurada.") : null, snapshot?.settings?.watchFolderPath && !snapshot?.python?.available ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, snapshot?.python?.error || "No se encontro Python para Booru.") : null, /* @__PURE__ */ React27.createElement(
      SettingsSection,
      {
        snapshot,
        busyAction,
        loading,
        onRefresh: () => loadSnapshot({ silent: false, reason: "metrics-refresh" }),
        onRescan: () => handleAction("rescan", "booru:rescan-watch-folder"),
        onRestart: () => handleAction("restart", "booru:restart-watcher"),
        onOpenDuplicates: () => handleOpenSettingsSubview("duplicates"),
        onOpenTrash: () => handleOpenSettingsSubview("trash"),
        onOpenPath: openPath
      }
    )))));
  }
  return /* @__PURE__ */ React27.createElement(WorkspacePage, { className: "booruView", onKeyDownCapture: handleClipboardPasteShortcut }, /* @__PURE__ */ React27.createElement(WorkspaceBody, { className: "booruView__body" }, /* @__PURE__ */ React27.createElement(
    SplitLayout,
    {
      variant: "sidebar-detail",
      className: ["booruView__layout", activeEntityKind ? "booruView__layout--entity" : ""].filter(Boolean).join(" ")
    },
    showResourceWorkspace ? /* @__PURE__ */ React27.createElement(SplitSidebar, { className: "booruView__sidebar" }, /* @__PURE__ */ React27.createElement(ScrollRegion, { className: "booruView__sidebarScroll" }, /* @__PURE__ */ React27.createElement(PanelStack, { className: "booruView__sidebarStack" }, /* @__PURE__ */ React27.createElement(SectionPanel, { className: "booruView__panel booruView__panel--compact booruView__panel--fill" }, /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(Field, { label: "Buscar", className: "booruView__field" }, /* @__PURE__ */ React27.createElement(
      ResourceSearchComposer,
      {
        tokens: normalizedResourceSearchTokens,
        onChange: setResourceSearchTokens,
        freeText: resourceSearchText,
        onFreeTextChange: setResourceSearchText,
        invoke: invoke6,
        realitySuggestions: RESOURCE_SEARCH_REALITY_SUGGESTIONS,
        missingSuggestions: supportsMissingResourceFilters ? RESOURCE_SEARCH_MISSING_SUGGESTIONS : EMPTY_RESOURCE_SEARCH_SUGGESTIONS,
        helpers: {
          normalizeResourceSearchTokens,
          buildResourceSearchTokenKey,
          parseResourceSearchDraft,
          normalizeSearchText,
          normalizeResourceSearchToken,
          createResourceSearchTokenFromSuggestion,
          createResourceSearchTokenFromFragment,
          tokenizeBooruQuery,
          getResourceQueryTokenClass,
          buildResourceQueryTokenLabel,
          stepSuggestionIndex
        }
      }
    )), showClassificationSidebar ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__filterStack" }, activeResourceSection === "pending" ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__filterGroup" }, /* @__PURE__ */ React27.createElement("span", { className: "booruView__groupLabel" }, "Pendientes"), /* @__PURE__ */ React27.createElement(
      SegmentedControl,
      {
        className: "booruView__filterSegmented",
        variant: "compact",
        options: PENDING_MODE_OPTIONS,
        value: resourcePendingMode,
        onChange: (value) => {
          const nextMode = value === "tags" ? "tags" : "essential";
          setResourcePendingMode(nextMode);
          if (nextMode === "tags") {
            setResourceMissingFilter(BOORU_NO_MISSING_FILTER);
            setResourceSearchTokens((currentValue) => normalizeResourceSearchTokens(currentValue).filter((token) => token?.type !== "missing" || token?.negative));
          }
        },
        ariaLabel: "Modo de pendientes"
      }
    )) : null, /* @__PURE__ */ React27.createElement("div", { className: "booruView__filterGroup" }, /* @__PURE__ */ React27.createElement("span", { className: "booruView__groupLabel" }, "Media"), /* @__PURE__ */ React27.createElement(
      SegmentedControl,
      {
        className: "booruView__filterSegmented",
        variant: "compact",
        options: MEDIA_FILTER_OPTIONS,
        value: resourceMediaKindFilter,
        onChange: (value) => setResourceMediaKindFilter(value || "all"),
        ariaLabel: "Filtro de media"
      }
    )), /* @__PURE__ */ React27.createElement("div", { className: "booruView__filterGroup" }, /* @__PURE__ */ React27.createElement("span", { className: "booruView__groupLabel" }, "Tipo"), /* @__PURE__ */ React27.createElement(
      SegmentedControl,
      {
        className: "booruView__filterSegmented",
        variant: "compact",
        options: visibleRealityFilterOptions,
        value: effectiveResourceRealityFilter,
        onChange: (value) => setResourceRealityFilter(value || "all"),
        ariaLabel: "Filtro de tipo"
      }
    )), supportsMissingResourceFilters && hasContextualMissingFilters ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__filterGroup" }, /* @__PURE__ */ React27.createElement("span", { className: "booruView__groupLabel" }, "Faltantes"), /* @__PURE__ */ React27.createElement(
      SegmentedControl,
      {
        className: "booruView__filterSegmented",
        variant: "compact",
        options: contextualMissingFilterOptions,
        value: visibleMissingFilterValue,
        onChange: (value) => {
          setResourceSearchTokens((currentValue) => normalizeResourceSearchTokens(currentValue).filter((token) => token?.type !== "missing" || token?.negative));
          setResourceMissingFilter(value || BOORU_NO_MISSING_FILTER);
        },
        ariaLabel: "Filtro de datos faltantes"
      }
    )) : null) : null, showClassificationSidebar ? /* @__PURE__ */ React27.createElement(
      RecommendationPanel2,
      {
        selectedResourceIds: selectedResources.map((resource) => resource.id),
        customDragState,
        manualAssignDisabledReason: selectedResources.length === 0 ? "Selecciona recursos para aplicar sugerencias o arrastra una card sobre una entidad." : "",
        assigning: busyAction === "quick-assign" || busyAction === "recommendation-apply",
        revisionKey: entityRevision,
        resourceQuery,
        recommendationScope,
        draft: classificationDraft,
        onAssignEntity: handleQuickAssignEntity,
        onApplyRecommendation: handleApplyRecommendation
      }
    ) : null))))) : null,
    /* @__PURE__ */ React27.createElement(SplitDetail, { className: "booruView__detail" }, activeEntityKind ? /* @__PURE__ */ React27.createElement(
      EntityNavigationBar,
      {
        kind: activeEntityKind,
        contextLabel: getEntityProfileLabel(activeEntityProfile, entityProfile),
        profileOpen: showEntityProfile,
        searchValue: entitySearchValue,
        createValue: entityCreateValue,
        busy: entityBusy,
        searchable: !showEntityProfile || activeEntityProfileBrowseTab,
        searchContent: !showEntityProfile || activeEntityProfileBrowseTab ? /* @__PURE__ */ React27.createElement(
          ResourceSearchComposer,
          {
            tokens: normalizedEntitySearchTokens,
            onChange: setEntitySearchTokens,
            freeText: entitySearchValue,
            onFreeTextChange: setEntitySearchValue,
            invoke: invoke6,
            realitySuggestions: EMPTY_RESOURCE_SEARCH_SUGGESTIONS,
            missingSuggestions: EMPTY_RESOURCE_SEARCH_SUGGESTIONS,
            allowedKinds: entitySearchAllowedKinds,
            helpers: {
              normalizeResourceSearchTokens,
              buildResourceSearchTokenKey,
              parseResourceSearchDraft,
              normalizeSearchText,
              normalizeResourceSearchToken,
              createResourceSearchTokenFromSuggestion,
              getResourceQueryTokenClass,
              buildResourceQueryTokenLabel,
              stepSuggestionIndex
            }
          }
        ) : null,
        browseControls: activeEntityProfileBrowseTab || !showEntityProfile ? /* @__PURE__ */ React27.createElement(
          ContextBrowseControls,
          {
            compact: true,
            value: entityBrowseUsesResources ? resourceBrowse : entityBrowse,
            options: entityBrowseUsesResources ? BOORU_RESOURCE_SORT_OPTIONS : getBooruEntitySortOptions({ allowUniverseSort: allowUniverseEntitySort }),
            groupOptions: entityBrowseUsesResources ? BOORU_RESOURCE_GROUP_OPTIONS : [],
            groupOrderOptions: entityBrowseUsesResources ? BOORU_RESOURCE_GROUP_ORDER_OPTIONS : [],
            onChange: entityBrowseUsesResources ? updateResourceBrowse : updateEntityBrowse,
            onRegenerateRandom: () => entityBrowseUsesResources ? updateResourceBrowse({ randomSeed: createBooruRandomSeed() }) : updateEntityBrowse({ randomSeed: createBooruRandomSeed() })
          }
        ) : null,
        onBack: handleCloseEntityProfile,
        onOpenInMedia: handleOpenEntityInMedia,
        onSearchChange: setEntitySearchValue,
        onCreateChange: setEntityCreateValue,
        onCreate: () => void handleEnsureSectionEntity(),
        entityKindLabels: BOORU_ENTITY_KIND_LABELS
      }
    ) : null, loading && !snapshot ? /* @__PURE__ */ React27.createElement(
      StateBlock,
      {
        centered: true,
        title: "Cargando plugin",
        description: "Leyendo biblioteca, entidades y runtime local."
      }
    ) : showResourceWorkspace ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__content booruView__content--workspace" }, error ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, error) : null, entityError ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, entityError) : null, hasBlockingSetupWarning && (activeResourceSection === "media" || activeResourceSection === "pending") ? !snapshot?.settings?.watchFolderPath ? /* @__PURE__ */ React27.createElement(Notice, { tone: "warning" }, "Booru todavia no tiene una carpeta vigilada configurada.") : /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, snapshot?.python?.error || "No se encontro Python para Booru.") : null, /* @__PURE__ */ React27.createElement(
      ContextBrowseControls,
      {
        value: resourceBrowse,
        options: BOORU_RESOURCE_SORT_OPTIONS,
        groupOptions: BOORU_RESOURCE_GROUP_OPTIONS,
        groupOrderOptions: BOORU_RESOURCE_GROUP_ORDER_OPTIONS,
        onChange: updateResourceBrowse,
        onRegenerateRandom: () => updateResourceBrowse({ randomSeed: createBooruRandomSeed() })
      }
    ), /* @__PURE__ */ React27.createElement("div", { className: [
      "booruView__workspaceGrid",
      !showInspector ? "booruView__workspaceGrid--single" : ""
    ].filter(Boolean).join(" ") }, /* @__PURE__ */ React27.createElement(
      ResourceGrid2,
      {
        items: resourceItems,
        placements: resourceState.placements,
        selectedIds: currentSelection.ids,
        selectionMode: currentSelection.mode,
        customDragState,
        onCustomDragPointerDown: handleCustomDragPointerDown,
        shouldSuppressClick: consumeSuppressedResourceClick,
        totalCount: resourceState.totalCount,
        loading: resourceLoading,
        scrollKey: `${activeResourceSection}:${resourceQuerySignature}:${resourceSearchTokensSignature}`,
        scrollTop: activeRouteScrollTop,
        onScrollStateChange: handleRouteScrollStateChange,
        columns: gridColumns[BOORU_GRID_FAMILIES.RESOURCES],
        onColumnsChange: (nextColumns) => handleGridColumnsChange(BOORU_GRID_FAMILIES.RESOURCES, nextColumns),
        infinite: true,
        hasMore: resourceState.hasMore,
        onLoadMore: loadNextMediaPage,
        onVisibleItemsChange: handleVisibleResourceIdsChange,
        onGroupAssociationHover: (association) => {
          hoveredGroupAssociationRef.current = association;
        },
        onSelect: handleResourceClick,
        onOpen: handleResourceOpen,
        onContextMenu: openResourceContextMenu,
        onClearSelection: () => clearSelectionForSection(activeResourceSection),
        emptyTitle: activeResourceSection === "pending" ? "No hay pendientes" : activeResourceSection === "duplicates" ? "No hay duplicados" : activeResourceSection === "trash" ? "La papelera esta vacia" : "Todavia no hay media",
        emptyDescription: activeResourceSection === "pending" ? "Cuando Booru detecte recursos incompletos, apareceran aqui por prioridad." : activeResourceSection === "duplicates" ? "No se detectaron duplicados exactos en esta tanda." : activeResourceSection === "trash" ? "Los recursos eliminados desde Booru apareceran aqui." : "Cuando Booru detecte archivos soportados, apareceran aqui."
      }
    ), showInspector ? /* @__PURE__ */ React27.createElement(
      ResourceInspector2,
      {
        section: activeResourceSection,
        activeResource,
        selectedResources,
        draft: classificationDraft,
        saving: savingClassification,
        onDraftChange: (updater) => {
          setClassificationDraft((currentDraft) => typeof updater === "function" ? updater(currentDraft) : updater);
        },
        onRestore: handleRestoreSelected,
        onPurge: handlePurgeSelected,
        onClose: () => {
          setInspectorOpen(false);
          setDetailsContext(null);
          setAnchoredResources([]);
        },
        onEnsureEntity: ensureEntityFromUi
      }
    ) : null)) : /* @__PURE__ */ React27.createElement(ScrollRegion, { className: "booruView__detailScroll" }, /* @__PURE__ */ React27.createElement("div", { className: "booruView__content" }, error ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, error) : null, entityError ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, entityError) : null, entityProfileError ? /* @__PURE__ */ React27.createElement(Notice, { tone: "danger" }, entityProfileError) : null, activeEntityKind ? showEntityProfile ? entityProfileLoading && !entityProfile ? /* @__PURE__ */ React27.createElement(
      StateBlock,
      {
        centered: true,
        title: "Cargando perfil",
        description: `Preparando ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "la entidad"} desde Booru.`
      }
    ) : entityProfile ? /* @__PURE__ */ React27.createElement(
      EntityProfileView2,
      {
        kind: activeEntityKind,
        profile: entityProfile,
        activeTab: activeEntityProfile?.tab || "gallery",
        galleryState: entityProfileGalleryState,
        galleryLoading: entityProfileGalleryLoading,
        relationKind: activeEntityRelationKind,
        relationState: entityProfileRelationState,
        relationLoading: entityProfileRelationLoading,
        entityMutationBusy: entityBusy,
        universeCharacterCreateValue,
        onLoadMoreGallery: loadNextEntityProfileGalleryPage,
        onLoadMoreRelations: loadNextEntityProfileRelationPage,
        onTabChange: handleChangeEntityProfileTab,
        onOpenRelatedEntity: handleOpenEntity,
        onRelatedEntityContextMenu: openEntityCardContextMenu,
        onUniverseCharacterCreateValueChange: setUniverseCharacterCreateValue,
        onCreateCharacterInUniverse: handleCreateCharacterInUniverse,
        onChangeCharacterUniverse: handleSetCharacterUniverse,
        onVisualContextMenu: openEntityProfileVisualContextMenu,
        onGalleryResourceContextMenu: openEntityProfileResourceContextMenu,
        onGalleryResourceOpen: openResourceHero,
        onPasteClipboardImage: handlePasteClipboardImageToEntity,
        onProfileChange: setEntityProfile,
        resourceGridColumns: gridColumns[BOORU_GRID_FAMILIES.PROFILE_RESOURCES],
        entityGridColumns: gridColumns[BOORU_GRID_FAMILIES.ENTITIES],
        scrollKey: workspaceRouteKey,
        scrollTop: activeRouteScrollTop,
        onScrollStateChange: handleRouteScrollStateChange,
        gallerySelectedIds: profileGallerySelectedIds,
        onGallerySelectionChange: setProfileGallerySelectedIds,
        onResourceColumnsChange: (nextColumns) => handleGridColumnsChange(BOORU_GRID_FAMILIES.PROFILE_RESOURCES, nextColumns),
        onEntityColumnsChange: (nextColumns) => handleGridColumnsChange(BOORU_GRID_FAMILIES.ENTITIES, nextColumns),
        onEntityHover: (kind, item) => {
          hoveredEntityRef.current = item ? { kind, id: item.id } : null;
        },
        onGroupAssociationHover: (association) => {
          hoveredGroupAssociationRef.current = association;
        }
      }
    ) : /* @__PURE__ */ React27.createElement(
      StateBlock,
      {
        centered: true,
        title: "Perfil no disponible",
        description: "La entidad solicitada ya no esta disponible o su perfil no pudo cargarse."
      }
    ) : entityLoading ? entityItems.length ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__entitySectionContent" }, /* @__PURE__ */ React27.createElement(
      EntityGrid,
      {
        kind: activeEntityKind,
        items: entityItems,
        placements: entityPlacements,
        hasMore: entityHasMore,
        loading: entityLoading,
        onLoadMore: () => void loadEntitySection({ append: true }),
        emptyTitle: `Sin ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "elementos"} todavia`,
        emptyDescription: "Empieza a escribir y presiona Enter para crear el primero.",
        onOpenEntity: handleOpenEntity,
        onPreviewContextMenu: openEntityCardContextMenu,
        onEntityHover: (kind, item) => {
          hoveredEntityRef.current = item ? { kind, id: item.id } : null;
        },
        MediaPreview: MediaThumbnail2,
        entityKindLabels: BOORU_ENTITY_KIND_LABELS,
        getInitials,
        columns: gridColumns[BOORU_GRID_FAMILIES.ENTITIES],
        onColumnsChange: (nextColumns) => handleGridColumnsChange(BOORU_GRID_FAMILIES.ENTITIES, nextColumns),
        onGroupAssociationHover: (association) => {
          hoveredGroupAssociationRef.current = association;
        },
        scrollKey: workspaceRouteKey,
        scrollTop: activeRouteScrollTop,
        onScrollStateChange: handleRouteScrollStateChange
      }
    )) : /* @__PURE__ */ React27.createElement(
      StateBlock,
      {
        centered: true,
        title: "Cargando seccion",
        description: `Leyendo ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "entidades"} desde Booru.`
      }
    ) : /* @__PURE__ */ React27.createElement(
      EntityGrid,
      {
        kind: activeEntityKind,
        items: entityItems,
        placements: entityPlacements,
        hasMore: entityHasMore,
        loading: entityLoading,
        onLoadMore: () => void loadEntitySection({ append: true }),
        emptyTitle: `Sin ${BOORU_ENTITY_KIND_LABELS[activeEntityKind]?.toLowerCase() || "elementos"} todavia`,
        emptyDescription: "Empieza a escribir y presiona Enter para crear el primero.",
        onOpenEntity: handleOpenEntity,
        onPreviewContextMenu: openEntityCardContextMenu,
        onEntityHover: (kind, item) => {
          hoveredEntityRef.current = item ? { kind, id: item.id } : null;
        },
        MediaPreview: MediaThumbnail2,
        entityKindLabels: BOORU_ENTITY_KIND_LABELS,
        getInitials,
        columns: gridColumns[BOORU_GRID_FAMILIES.ENTITIES],
        onColumnsChange: (nextColumns) => handleGridColumnsChange(BOORU_GRID_FAMILIES.ENTITIES, nextColumns),
        onGroupAssociationHover: (association) => {
          hoveredGroupAssociationRef.current = association;
        },
        scrollKey: workspaceRouteKey,
        scrollTop: activeRouteScrollTop,
        onScrollStateChange: handleRouteScrollStateChange
      }
    ) : null)))
  ), /* @__PURE__ */ React27.createElement(
    FloatingContextMenu,
    {
      state: contextMenuState,
      onClose: () => setContextMenuState(null),
      onAction: (actionId) => void handleContextMenuAction(actionId)
    }
  ), showFloatingInspector ? /* @__PURE__ */ React27.createElement(
    FloatingDetailsWindow,
    {
      geometry: floatingDetailsGeometry,
      onGeometryChange: setFloatingDetailsGeometry,
      onClose: () => {
        setInspectorOpen(false);
        setDetailsContext(null);
        setAnchoredResources([]);
      }
    },
    /* @__PURE__ */ React27.createElement(
      ResourceInspector2,
      {
        section: "profile",
        activeResource,
        selectedResources,
        draft: classificationDraft,
        saving: savingClassification,
        onDraftChange: (updater) => {
          setClassificationDraft((currentDraft) => typeof updater === "function" ? updater(currentDraft) : updater);
        },
        onClose: () => {
          setInspectorOpen(false);
          setDetailsContext(null);
          setAnchoredResources([]);
        },
        onEnsureEntity: ensureEntityFromUi,
        priorityEntity: detailsContext?.profileContext || null
      }
    )
  ) : null, /* @__PURE__ */ React27.createElement(
    ResourceHeroOverlay,
    {
      item: activeHeroItem,
      index: Math.max(0, (Array.isArray(resourceHeroState?.items) ? resourceHeroState.items : []).findIndex((entry) => entry?.id === activeHeroItem?.id)),
      totalCount: Array.isArray(resourceHeroState?.items) ? resourceHeroState.items.length : 0,
      onClose: () => setResourceHeroState(null),
      onPrev: () => stepResourceHero(-1),
      onNext: () => stepResourceHero(1),
      MediaPreview: MediaThumbnail2,
      mediaKindLabels: BOORU_MEDIA_KIND_LABELS
    }
  ), entityVisualCropState ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__cropOverlay" }, /* @__PURE__ */ React27.createElement(
    EntityVisualCropper,
    {
      ...entityVisualCropState,
      onSaved: (profile) => {
        if (profile) setEntityProfile(profile);
        setEntityVisualCropState(null);
      },
      onCancel: () => setEntityVisualCropState(null)
    }
  )) : null, /* @__PURE__ */ React27.createElement(
    BooruDragPreviewLayer,
    {
      resourcesById: dragPreviewResourcesById,
      customDragState,
      MediaPreview: MediaThumbnail2,
      getPreviewStyles: getDragPreviewStyles,
      resolveDragIds: resolveDraggedResourceIds,
      useDragLayer: safeUseDragLayer,
      dndType: BOORU_RESOURCE_DND_TYPE
    }
  ), clipboardAssociationState ? /* @__PURE__ */ React27.createElement(
    ClipboardAssociationComposer,
    {
      defaultKind: clipboardAssociationState.defaultKind,
      onCancel: () => setClipboardAssociationState(null),
      onConfirm: importClipboardMedia
    }
  ) : null, characterCreationName ? /* @__PURE__ */ React27.createElement("div", { className: "booruView__cropOverlay" }, /* @__PURE__ */ React27.createElement(
    CharacterCreationDialog,
    {
      name: characterCreationName,
      invoke: invoke6,
      SingleEntityField: SingleEntityAutocompleteField2,
      onCancel: () => finishCharacterCreation(null),
      onCreated: (entity) => {
        if (!entity?.id) return;
        setEntityRevision((currentValue) => currentValue + 1);
        finishCharacterCreation({ kind: "character", created: true, entity });
      }
    }
  )) : null));
}

// ../nexus-plugins/booru/src/renderer.js
var styleElement = null;
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
var booruRendererPlugin = {
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
        defaultSection: BOORU_DEFAULT_SECTION
      },
      component: (props) => /* @__PURE__ */ React.createElement(BooruWorkspaceView, { ...props, ctx })
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
          sourceId: "nexus.booru.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === BOORU_WORKSPACE_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = booruRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
