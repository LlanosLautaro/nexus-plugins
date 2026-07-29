const { startTransition, useEffect, useLayoutEffect, useRef, useState } = window.React;

import {
  Button,
  LoadingIndicator,
  Notice,
  ReloadIcon,
  StateBlock,
  TextArea,
  WorkspaceBody,
  WorkspacePage,
} from "@nexus/ui";
import { ChatIcon, ClearIcon, SendIcon } from "./icons.jsx";
import { CHAT_VIEW_ID } from "./constants.js";

const ipcRenderer = window.nexus.ipc;

function createMessage(role, content, meta = null) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content: String(content || "").trim(),
    meta,
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
  return <LoadingIndicator className={className} label={label || "Cargando"} />;
}

export default function ChatView({ ctx }) {
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
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los modelos.",
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
        model: normalizedModelId,
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
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el modelo seleccionado.",
      );

      void loadModels({
        keepSelection: true,
        preferredModelId: normalizedModelId,
      });
    } finally {
      if (requestId === modelSwitchRequestIdRef.current) {
        setSwitchingModelId("");
      }
    }
  };

  useEffect(() => {
    void loadModels({
      keepSelection: false,
    });
  }, []);

  useLayoutEffect(() => {
    messageEndRef.current?.scrollIntoView({
      block: "end",
      behavior: "auto",
    });
  }, [messages, sending]);

  useEffect(() => {
    if (loadingModels || switchingModelId || !selectedModel || models.length === 0) {
      return;
    }

    const selectedModelRecord = models.find((entry) => entry.id === selectedModel) || null;
    const hasLoadedModel = models.some((entry) => entry.loaded);

    if (!selectedModelRecord?.loaded && !hasLoadedModel) {
      void handleModelChange(selectedModel, {
        force: true,
      });
    }
  }, [loadingModels, models, selectedModel, switchingModelId]);

  const handleSend = async () => {
    const prompt = String(inputValue || "").trim();
    const selectedModelRecord = models.find((entry) => entry.id === selectedModel) || null;

    if (!prompt || sending || switchingModelId) {
      return;
    }

    if (!selectedModel) {
      setError("No hay un modelo LLM disponible en LM Studio.");
      return;
    }

    if (!selectedModelRecord?.loaded) {
      setError("Espera a que el modelo seleccionado termine de cargarse.");
      return;
    }

    const historyPayload = messages.map((message) => ({
      role: message.role,
      content: message.content,
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
        history: historyPayload,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo completar la respuesta.");
      }

      const assistantMessage = createMessage(
        "assistant",
        response?.data?.message || "",
        {
          modelInstanceId: response?.data?.modelInstanceId || "",
          stats: response?.data?.stats || null,
        },
      );

      setMessages((current) => [...current, assistantMessage]);
    } catch (sendError) {
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setInputValue(prompt);
      setError(
        sendError instanceof Error
          ? sendError.message
          : "No se pudo completar la respuesta.",
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
  const switchingModelRecord =
    models.find((entry) => entry.id === switchingModelId) || selectedModelRecord;
  const showEmptyState = !loadingModels && models.length > 0 && messages.length === 0;
  const composerDisabled =
    sending || Boolean(switchingModelId) || models.length === 0 || !selectedModelRecord?.loaded;

  useEffect(() => {
    if (!ctx?.setWorkspaceFrameActions || !ctx?.clearWorkspaceFrameActions) {
      return undefined;
    }

    ctx.setWorkspaceFrameActions(CHAT_VIEW_ID, [
      {
        id: "chat-model",
        kind: "select",
        title: "Modelo de chat",
        value: selectedModel,
        disabled:
          loadingModels
          || refreshingModels
          || Boolean(switchingModelId)
          || sending
          || models.length === 0,
        options: models.length
          ? models.map((model) => ({ value: model.id, label: model.label }))
          : [{ value: "", label: "Sin modelos LLM", disabled: true }],
        onChange: (nextModelId) => {
          void handleModelChange(nextModelId);
        },
      },
      {
        id: "chat-reload-models",
        icon: ReloadIcon,
        title: "Recargar modelos",
        disabled: refreshingModels || Boolean(switchingModelId) || sending,
        onClick: () => {
          void loadModels();
        },
      },
      {
        id: "chat-clear-session",
        icon: ClearIcon,
        title: "Limpiar sesion",
        disabled: sending || messages.length === 0,
        onClick: () => startTransition(() => setMessages([])),
      },
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
    switchingModelId,
  ]);

  return (
    <WorkspacePage className="chatbotView">
      <WorkspaceBody className="chatbotView__body">
        <div className="chatbotView__statusBar">
          {switchingModelRecord ? (
            <>
              <span className="chatbotView__statusPill">
                {switchingModelId
                  ? `Cargando ${switchingModelRecord.label}`
                  : selectedModelRecord?.loaded
                    ? "Modelo cargado"
                    : "Carga bajo demanda"}
              </span>
              {switchingModelId ? (
                <LoaderDots label="Cambiando modelo" />
              ) : null}
              {selectedModelRecord?.maxContextLength ? (
                <span className="chatbotView__statusCopy">
                  contexto max {formatContextLength(selectedModelRecord.maxContextLength)}
                </span>
              ) : null}
              {!switchingModelId && selectedModelRecord && !selectedModelRecord.loaded ? (
                <Button
                  type="button"
                  className="chatbotView__statusAction"
                  onClick={() => void handleModelChange(selectedModel, { force: true })}
                  disabled={sending}
                >
                  Cargar ahora
                </Button>
              ) : null}
            </>
          ) : (
            <span className="chatbotView__statusCopy">
              {loadingModels ? "Cargando modelos..." : "Sin modelos LLM disponibles en LM Studio."}
            </span>
          )}
        </div>

        <div className="chatbotView__messages" role="log" aria-live="polite">
          {loadingModels ? (
            <StateBlock className="chatbotView__state" title="Cargando modelos de LM Studio" />
          ) : models.length === 0 ? (
            <StateBlock
              className="chatbotView__state"
              title="Sin modelos disponibles"
              description="Carga un modelo en LM Studio y vuelve a refrescar."
            />
          ) : showEmptyState ? (
            <StateBlock
              className="chatbotView__emptyState"
              title="Empieza una conversacion local"
              description="Selecciona un modelo y escribe abajo. La sesion permanece mientras la view siga abierta."
            >
              <span className="chatbotView__emptyIcon">
                <ChatIcon size={22} />
              </span>
            </StateBlock>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={[
                  "chatbotView__message",
                  message.role === "assistant"
                    ? "chatbotView__message--assistant"
                    : "chatbotView__message--user",
                ].join(" ")}
              >
                <header className="chatbotView__messageHeader">
                  <strong>{message.role === "assistant" ? "Asistente" : "Usuario"}</strong>
                  {message.role === "assistant" && message.meta ? (
                    <span>{formatStats(message.meta.stats)}</span>
                  ) : null}
                </header>
                <div className="chatbotView__messageBody">
                  {message.content}
                </div>
              </article>
            ))
          )}

          {sending ? (
            <article className="chatbotView__message chatbotView__message--assistant chatbotView__message--typing">
              <header className="chatbotView__messageHeader">
                <strong>Asistente</strong>
                <span>respondiendo</span>
              </header>
              <LoaderDots className="chatbotView__inlineLoader--message" />
            </article>
          ) : null}

          <div ref={messageEndRef} />
        </div>

        <form className="chatbotView__composer nexus-ui-panel" onSubmit={handleSubmit}>
          <TextArea
            ref={composerRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Escribe aqui. Enter envia, Shift+Enter agrega linea."
            disabled={composerDisabled}
            rows="4"
          />

          <div className="chatbotView__composerBar">
            <span className="chatbotView__composerHint">
              Historial local en memoria, sin persistencia extra.
            </span>

            <Button
              type="submit"
              tone="primary"
              className="chatbotView__primaryButton"
              disabled={composerDisabled || !String(inputValue || "").trim()}
            >
              <SendIcon size={15} />
              <span>{sending ? "Enviando..." : "Enviar"}</span>
            </Button>
          </div>
        </form>

        {error ? <Notice tone="danger">{error}</Notice> : null}
      </WorkspaceBody>
    </WorkspacePage>
  );
}
