var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nexus-plugins/chat/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  default: () => backend_default
});
module.exports = __toCommonJS(backend_exports);
var LM_STUDIO_BASE_URL = "http://127.0.0.1:1234";
var MODELS_ENDPOINT = "/api/v1/models";
var CHAT_ENDPOINT = "/api/v1/chat";
var LOAD_MODEL_ENDPOINT = "/api/v1/models/load";
var REQUEST_TIMEOUT_MS = 6e4;
var MODEL_LOAD_WAIT_TIMEOUT_MS = 45e3;
var MODEL_LOAD_POLL_INTERVAL_MS = 600;
var HISTORY_WINDOW = 20;
function createSuccess(data) {
  return {
    ok: true,
    data
  };
}
function createError(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
function normalizeText(value) {
  return String(value ?? "").trim();
}
function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history.map((entry) => {
    const role = normalizeText(entry?.role).toLowerCase();
    const content = normalizeText(entry?.content);
    if (!content || role !== "user" && role !== "assistant") {
      return null;
    }
    return {
      role,
      content
    };
  }).filter(Boolean).slice(-HISTORY_WINDOW);
}
function buildTranscript(history, prompt) {
  const normalizedPrompt = normalizeText(prompt);
  if (!normalizedPrompt) {
    throw new Error("Falta el prompt del chat.");
  }
  const transcriptLines = normalizeHistory(history).map((entry) => {
    const speaker = entry.role === "assistant" ? "Asistente" : "Usuario";
    return `${speaker}: ${entry.content}`;
  });
  transcriptLines.push(`Usuario: ${normalizedPrompt}`);
  transcriptLines.push("Asistente:");
  return transcriptLines.join("\n\n");
}
function normalizeReasoning(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const allowedOptions = Array.isArray(value.allowed_options) ? value.allowed_options.map((entry) => normalizeText(entry)).filter(Boolean) : [];
  const defaultValue = normalizeText(value.default);
  if (!allowedOptions.length && !defaultValue) {
    return null;
  }
  return {
    allowedOptions,
    default: defaultValue || null
  };
}
function normalizeModelEntry(entry) {
  const id = normalizeText(entry?.key);
  if (!id) {
    return null;
  }
  return {
    id,
    label: normalizeText(entry?.display_name) || id,
    loaded: Array.isArray(entry?.loaded_instances) && entry.loaded_instances.length > 0,
    maxContextLength: Number.isFinite(Number(entry?.max_context_length)) ? Number(entry?.max_context_length) : null,
    reasoning: normalizeReasoning(entry?.capabilities?.reasoning)
  };
}
async function requestLmStudioJson(pathname, init) {
  const url = new URL(pathname, LM_STUDIO_BASE_URL);
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers || {}
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const message = normalizeText(payload?.error?.message) || normalizeText(payload?.message) || `LM Studio devolvio ${response.status}.`;
    throw new Error(message);
  }
  return payload;
}
async function listChatModels() {
  const payload = await requestLmStudioJson(MODELS_ENDPOINT);
  const models = Array.isArray(payload?.models) ? payload.models.map((entry) => normalizeModelEntry(entry)).filter(Boolean).filter((entry) => Boolean(entry?.id)) : [];
  return models.sort((left, right) => {
    if (left.loaded !== right.loaded) {
      return left.loaded ? -1 : 1;
    }
    return String(left.label).localeCompare(String(right.label));
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function waitForModelLoaded(modelId) {
  const startedAt = Date.now();
  let lastModels = await listChatModels();
  while (Date.now() - startedAt <= MODEL_LOAD_WAIT_TIMEOUT_MS) {
    const targetModel = lastModels.find((entry) => entry?.id === modelId);
    if (targetModel?.loaded) {
      return lastModels;
    }
    await sleep(MODEL_LOAD_POLL_INTERVAL_MS);
    lastModels = await listChatModels();
  }
  throw new Error(`El modelo "${modelId}" no quedo disponible a tiempo en LM Studio.`);
}
async function loadChatModel(payload) {
  const model = normalizeText(payload?.model);
  if (!model) {
    throw new Error("Falta el modelo a cargar.");
  }
  await requestLmStudioJson(LOAD_MODEL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model
    })
  });
  const models = await waitForModelLoaded(model);
  return {
    model,
    models,
    baseUrl: LM_STUDIO_BASE_URL
  };
}
function extractAssistantMessage(payload) {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (let index = output.length - 1; index >= 0; index -= 1) {
    const block = output[index];
    if (normalizeText(block?.type) !== "message") {
      continue;
    }
    const content = normalizeText(block?.content);
    if (content) {
      return content;
    }
  }
  throw new Error("LM Studio no devolvio un bloque de mensaje util.");
}
function extractResponseMetadata(payload) {
  return {
    modelInstanceId: normalizeText(payload?.model_instance_id) || null,
    stats: payload?.stats && typeof payload.stats === "object" ? payload.stats : null
  };
}
async function sendChatMessage(payload) {
  const model = normalizeText(payload?.model);
  if (!model) {
    throw new Error("Selecciona un modelo antes de enviar mensajes.");
  }
  const transcript = buildTranscript(payload?.history, payload?.prompt);
  const responsePayload = await requestLmStudioJson(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: transcript
    })
  });
  return {
    message: extractAssistantMessage(responsePayload),
    ...extractResponseMetadata(responsePayload)
  };
}
var chatPlugin = {
  activate(ctx) {
    ctx.registerIpc("chatbot:list-models", async () => {
      try {
        return createSuccess({
          models: await listChatModels(),
          baseUrl: LM_STUDIO_BASE_URL
        });
      } catch (error) {
        return createError(error, "No se pudieron cargar los modelos de LM Studio.");
      }
    });
    ctx.registerIpc("chatbot:send-message", async (_event, payload) => {
      try {
        return createSuccess(await sendChatMessage(payload));
      } catch (error) {
        return createError(error, "No se pudo enviar el mensaje a LM Studio.");
      }
    });
    ctx.registerIpc("chatbot:load-model", async (_event, payload) => {
      try {
        return createSuccess(await loadChatModel(payload));
      } catch (error) {
        return createError(error, "No se pudo cargar el modelo en LM Studio.");
      }
    });
  }
};
var backend_default = chatPlugin;
//# sourceMappingURL=backend.cjs.map
