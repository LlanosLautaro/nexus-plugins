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

// chat/src/renderer.js
init_define_process();

// chat/src/ChatView.jsx
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

// packages/nexus-ui/src/components/TextArea/TextArea.jsx
init_define_process();
var import_react = __toESM(require_react(), 1);
var TextArea = (0, import_react.forwardRef)(function TextArea2({ className = "", ...props }, ref) {
  return /* @__PURE__ */ React.createElement(
    "textarea",
    {
      ...props,
      ref,
      className: cx("nexus-ui-textarea", className)
    }
  );
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

// packages/nexus-ui/src/components/ReloadIcon/ReloadIcon.jsx
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
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}

// chat/src/icons.jsx
init_define_process();
var React2 = window.React;
function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React2.createElement(
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
function ChatIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M6.75 7.25h10.5A1.75 1.75 0 0 1 19 9v6a1.75 1.75 0 0 1-1.75 1.75H12l-3.75 3v-3H6.75A1.75 1.75 0 0 1 5 15V9a1.75 1.75 0 0 1 1.75-1.75Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M8.75 11.25h6.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M8.75 13.75h4.5" }));
}
function ClearIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M5.5 7.5h13" }), /* @__PURE__ */ React2.createElement("path", { d: "M9.25 7.5V5.75A1.75 1.75 0 0 1 11 4h2a1.75 1.75 0 0 1 1.75 1.75V7.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M8 10.5v5.25" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 10.5v5.25" }), /* @__PURE__ */ React2.createElement("path", { d: "M16 10.5v5.25" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 7.5l.8 10.1A1.5 1.5 0 0 0 9.3 19h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7.5" }));
}
function SendIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m4.75 12 14-6.25-3.5 12.5-4.25-4.25L4.75 12Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M10.75 13.75 18.75 5.75" }));
}

// chat/src/constants.js
init_define_process();
var CHAT_PLUGIN_ID = "nexus.chat";
var CHAT_VIEW_ID = "nexus.chat.panel";

// chat/src/ipc-client.js
init_define_process();
var runtimeIpc = null;
function configurePluginIpc(ipc) {
  runtimeIpc = ipc;
}
function toOperation(channel) {
  return String(channel || "").replace(/^chatbot:/, "").replace(/:/g, ".");
}
var pluginIpc = Object.freeze({
  invoke(channel, ...args) {
    if (!runtimeIpc) throw new Error("PLUGIN_IPC_NOT_READY");
    return runtimeIpc.invoke(toOperation(channel), ...args);
  }
});

// chat/src/ChatView.jsx
var { startTransition, useEffect, useLayoutEffect, useRef, useState } = window.React;
var ipcRenderer = pluginIpc;
function createMessage(role, content, meta = null) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content: String(content || "").trim(),
    meta
  };
}
function formatContextLength(value) {
  if (!Number.isFinite(Number(value))) {
    return "";
  }
  return new Intl.NumberFormat("es-AR").format(Number(value));
}
function formatStats(stats) {
  if (!stats || typeof stats !== "object") {
    return "";
  }
  const tokens = Number(stats.total_output_tokens || 0);
  const speed = Number(stats.tokens_per_second || 0);
  const tokenLabel = tokens > 0 ? `${tokens} tok` : "";
  const speedLabel = speed > 0 ? `${speed.toFixed(1)} tok/s` : "";
  return [tokenLabel, speedLabel].filter(Boolean).join(" | ");
}
function LoaderDots({ className = "", label = "" }) {
  return /* @__PURE__ */ React.createElement(LoadingIndicator, { className, label: label || "Cargando" });
}
function ChatView({ ctx }) {
  const composerRef = useRef(null);
  const messageEndRef = useRef(null);
  const modelSwitchRequestIdRef = useRef(0);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [switchingModelId, setSwitchingModelId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const loadModels = async ({ keepSelection = true, preferredModelId = "" } = {}) => {
    setError("");
    if (loadingModels) {
      setRefreshingModels(false);
    } else {
      setRefreshingModels(true);
    }
    try {
      const response = await ipcRenderer.invoke("chatbot:list-models");
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudieron cargar los modelos.");
      }
      const nextModels = Array.isArray(response?.data?.models) ? response.data.models : [];
      startTransition(() => {
        setModels(nextModels);
        setSelectedModel((currentValue) => {
          if (preferredModelId && nextModels.some((entry) => entry.id === preferredModelId)) {
            return preferredModelId;
          }
          if (keepSelection && currentValue && nextModels.some((entry) => entry.id === currentValue)) {
            return currentValue;
          }
          return nextModels.find((entry) => entry.loaded)?.id || nextModels[0]?.id || "";
        });
      });
      return nextModels;
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar los modelos."
      );
    } finally {
      setLoadingModels(false);
      setRefreshingModels(false);
    }
    return [];
  };
  const handleModelChange = async (nextModelId, { force = false } = {}) => {
    const normalizedModelId = String(nextModelId || "").trim();
    if (!normalizedModelId) {
      return;
    }
    const nextModelRecord = models.find((entry) => entry.id === normalizedModelId) || null;
    if (!force && normalizedModelId === selectedModel && nextModelRecord?.loaded) {
      return;
    }
    const requestId = modelSwitchRequestIdRef.current + 1;
    modelSwitchRequestIdRef.current = requestId;
    setError("");
    setSwitchingModelId(normalizedModelId);
    setSelectedModel(normalizedModelId);
    try {
      const response = await ipcRenderer.invoke("chatbot:load-model", {
        model: normalizedModelId
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo cargar el modelo.");
      }
      if (requestId !== modelSwitchRequestIdRef.current) {
        return;
      }
      const nextModels = Array.isArray(response?.data?.models) ? response.data.models : [];
      startTransition(() => {
        setModels(nextModels);
        setSelectedModel(normalizedModelId);
      });
    } catch (loadError) {
      if (requestId !== modelSwitchRequestIdRef.current) {
        return;
      }
      setError(
        loadError instanceof Error ? loadError.message : "No se pudo cargar el modelo seleccionado."
      );
      void loadModels({
        keepSelection: true,
        preferredModelId: normalizedModelId
      });
    } finally {
      if (requestId === modelSwitchRequestIdRef.current) {
        setSwitchingModelId("");
      }
    }
  };
  useEffect(() => {
    void loadModels({
      keepSelection: false
    });
  }, []);
  useLayoutEffect(() => {
    messageEndRef.current?.scrollIntoView({
      block: "end",
      behavior: "auto"
    });
  }, [messages, sending]);
  useEffect(() => {
    if (loadingModels || switchingModelId || !selectedModel || models.length === 0) {
      return;
    }
    const selectedModelRecord2 = models.find((entry) => entry.id === selectedModel) || null;
    const hasLoadedModel = models.some((entry) => entry.loaded);
    if (!selectedModelRecord2?.loaded && !hasLoadedModel) {
      void handleModelChange(selectedModel, {
        force: true
      });
    }
  }, [loadingModels, models, selectedModel, switchingModelId]);
  const handleSend = async () => {
    const prompt = String(inputValue || "").trim();
    const selectedModelRecord2 = models.find((entry) => entry.id === selectedModel) || null;
    if (!prompt || sending || switchingModelId) {
      return;
    }
    if (!selectedModel) {
      setError("No hay un modelo LLM disponible en LM Studio.");
      return;
    }
    if (!selectedModelRecord2?.loaded) {
      setError("Espera a que el modelo seleccionado termine de cargarse.");
      return;
    }
    const historyPayload = messages.map((message) => ({
      role: message.role,
      content: message.content
    }));
    const userMessage = createMessage("user", prompt);
    setSending(true);
    setError("");
    setMessages((current) => [...current, userMessage]);
    setInputValue("");
    try {
      const response = await ipcRenderer.invoke("chatbot:send-message", {
        model: selectedModel,
        prompt,
        history: historyPayload
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo completar la respuesta.");
      }
      const assistantMessage = createMessage(
        "assistant",
        response?.data?.message || "",
        {
          modelInstanceId: response?.data?.modelInstanceId || "",
          stats: response?.data?.stats || null
        }
      );
      setMessages((current) => [...current, assistantMessage]);
    } catch (sendError) {
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setInputValue(prompt);
      setError(
        sendError instanceof Error ? sendError.message : "No se pudo completar la respuesta."
      );
    } finally {
      setSending(false);
      window.requestAnimationFrame(() => {
        composerRef.current?.focus();
      });
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleSend();
  };
  const handleComposerKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    void handleSend();
  };
  const selectedModelRecord = models.find((entry) => entry.id === selectedModel) || null;
  const switchingModelRecord = models.find((entry) => entry.id === switchingModelId) || selectedModelRecord;
  const showEmptyState = !loadingModels && models.length > 0 && messages.length === 0;
  const composerDisabled = sending || Boolean(switchingModelId) || models.length === 0 || !selectedModelRecord?.loaded;
  useEffect(() => {
    if (!ctx?.setWorkspaceFrameActions || !ctx?.clearWorkspaceFrameActions) {
      return void 0;
    }
    ctx.setWorkspaceFrameActions(CHAT_VIEW_ID, [
      {
        id: "chat-model",
        kind: "select",
        title: "Modelo de chat",
        value: selectedModel,
        disabled: loadingModels || refreshingModels || Boolean(switchingModelId) || sending || models.length === 0,
        options: models.length ? models.map((model) => ({ value: model.id, label: model.label })) : [{ value: "", label: "Sin modelos LLM", disabled: true }],
        onChange: (nextModelId) => {
          void handleModelChange(nextModelId);
        }
      },
      {
        id: "chat-reload-models",
        icon: ReloadIcon,
        title: "Recargar modelos",
        disabled: refreshingModels || Boolean(switchingModelId) || sending,
        onClick: () => {
          void loadModels();
        }
      },
      {
        id: "chat-clear-session",
        icon: ClearIcon,
        title: "Limpiar sesion",
        disabled: sending || messages.length === 0,
        onClick: () => startTransition(() => setMessages([]))
      }
    ]);
    return () => {
      ctx.clearWorkspaceFrameActions(CHAT_VIEW_ID);
    };
  }, [
    ctx,
    loadingModels,
    messages.length,
    models,
    refreshingModels,
    selectedModel,
    sending,
    switchingModelId
  ]);
  return /* @__PURE__ */ React.createElement(WorkspacePage, { className: "chatbotView" }, /* @__PURE__ */ React.createElement(WorkspaceBody, { className: "chatbotView__body" }, /* @__PURE__ */ React.createElement("div", { className: "chatbotView__statusBar" }, switchingModelRecord ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "chatbotView__statusPill" }, switchingModelId ? `Cargando ${switchingModelRecord.label}` : selectedModelRecord?.loaded ? "Modelo cargado" : "Carga bajo demanda"), switchingModelId ? /* @__PURE__ */ React.createElement(LoaderDots, { label: "Cambiando modelo" }) : null, selectedModelRecord?.maxContextLength ? /* @__PURE__ */ React.createElement("span", { className: "chatbotView__statusCopy" }, "contexto max ", formatContextLength(selectedModelRecord.maxContextLength)) : null, !switchingModelId && selectedModelRecord && !selectedModelRecord.loaded ? /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      className: "chatbotView__statusAction",
      onClick: () => void handleModelChange(selectedModel, { force: true }),
      disabled: sending
    },
    "Cargar ahora"
  ) : null) : /* @__PURE__ */ React.createElement("span", { className: "chatbotView__statusCopy" }, loadingModels ? "Cargando modelos..." : "Sin modelos LLM disponibles en LM Studio.")), /* @__PURE__ */ React.createElement("div", { className: "chatbotView__messages", role: "log", "aria-live": "polite" }, loadingModels ? /* @__PURE__ */ React.createElement(StateBlock, { className: "chatbotView__state", title: "Cargando modelos de LM Studio" }) : models.length === 0 ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      className: "chatbotView__state",
      title: "Sin modelos disponibles",
      description: "Carga un modelo en LM Studio y vuelve a refrescar."
    }
  ) : showEmptyState ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      className: "chatbotView__emptyState",
      title: "Empieza una conversacion local",
      description: "Selecciona un modelo y escribe abajo. La sesion permanece mientras la view siga abierta."
    },
    /* @__PURE__ */ React.createElement("span", { className: "chatbotView__emptyIcon" }, /* @__PURE__ */ React.createElement(ChatIcon, { size: 22 }))
  ) : messages.map((message) => /* @__PURE__ */ React.createElement(
    "article",
    {
      key: message.id,
      className: [
        "chatbotView__message",
        message.role === "assistant" ? "chatbotView__message--assistant" : "chatbotView__message--user"
      ].join(" ")
    },
    /* @__PURE__ */ React.createElement("header", { className: "chatbotView__messageHeader" }, /* @__PURE__ */ React.createElement("strong", null, message.role === "assistant" ? "Asistente" : "Usuario"), message.role === "assistant" && message.meta ? /* @__PURE__ */ React.createElement("span", null, formatStats(message.meta.stats)) : null),
    /* @__PURE__ */ React.createElement("div", { className: "chatbotView__messageBody" }, message.content)
  )), sending ? /* @__PURE__ */ React.createElement("article", { className: "chatbotView__message chatbotView__message--assistant chatbotView__message--typing" }, /* @__PURE__ */ React.createElement("header", { className: "chatbotView__messageHeader" }, /* @__PURE__ */ React.createElement("strong", null, "Asistente"), /* @__PURE__ */ React.createElement("span", null, "respondiendo")), /* @__PURE__ */ React.createElement(LoaderDots, { className: "chatbotView__inlineLoader--message" })) : null, /* @__PURE__ */ React.createElement("div", { ref: messageEndRef })), /* @__PURE__ */ React.createElement("form", { className: "chatbotView__composer nexus-ui-panel", onSubmit: handleSubmit }, /* @__PURE__ */ React.createElement(
    TextArea,
    {
      ref: composerRef,
      value: inputValue,
      onChange: (event) => setInputValue(event.target.value),
      onKeyDown: handleComposerKeyDown,
      placeholder: "Escribe aqui. Enter envia, Shift+Enter agrega linea.",
      disabled: composerDisabled,
      rows: "4"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "chatbotView__composerBar" }, /* @__PURE__ */ React.createElement("span", { className: "chatbotView__composerHint" }, "Historial local en memoria, sin persistencia extra."), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "submit",
      tone: "primary",
      className: "chatbotView__primaryButton",
      disabled: composerDisabled || !String(inputValue || "").trim()
    },
    /* @__PURE__ */ React.createElement(SendIcon, { size: 15 }),
    /* @__PURE__ */ React.createElement("span", null, sending ? "Enviando..." : "Enviar")
  ))), error ? /* @__PURE__ */ React.createElement(Notice, { tone: "danger" }, error) : null));
}

// chat/src/renderer.js
var styleElement = null;
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
var chatRendererPlugin = {
  activate(ctx) {
    configurePluginIpc(ctx.ipc);
    ensureStylesheet();
    ctx.registerView({
      id: CHAT_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Chat",
      icon: ChatIcon,
      tone: "code",
      surface: "workspace",
      component: (props) => /* @__PURE__ */ React.createElement(ChatView, { ...props, ctx })
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
          sourceId: "nexus.chat.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === CHAT_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = chatRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
