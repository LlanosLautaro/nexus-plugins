import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";

const LM_STUDIO_BASE_URL = "http://127.0.0.1:1234";
const MODELS_ENDPOINT = "/api/v1/models";
const CHAT_ENDPOINT = "/api/v1/chat";
const LOAD_MODEL_ENDPOINT = "/api/v1/models/load";
const REQUEST_TIMEOUT_MS = 60_000;
const MODEL_LOAD_WAIT_TIMEOUT_MS = 45_000;
const MODEL_LOAD_POLL_INTERVAL_MS = 600;
const HISTORY_WINDOW = 20;

type ChatHistoryMessage = {
  role?: string;
  content?: string;
};

type LmStudioModelRecord = {
  type?: string;
  key?: string;
  display_name?: string;
  loaded_instances?: unknown[];
  max_context_length?: number;
  capabilities?: {
    reasoning?: {
      allowed_options?: unknown[];
      default?: unknown;
    };
  };
};

function createSuccess(data: unknown) {
  return {
    ok: true,
    data,
  };
}

function createError(error: unknown, fallbackMessage: string) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage,
  };
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeHistory(history: unknown) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => {
      const role = normalizeText((entry as ChatHistoryMessage)?.role).toLowerCase();
      const content = normalizeText((entry as ChatHistoryMessage)?.content);

      if (!content || (role !== "user" && role !== "assistant")) {
        return null;
      }

      return {
        role,
        content,
      };
    })
    .filter(Boolean)
    .slice(-HISTORY_WINDOW) as Array<{ role: "user" | "assistant"; content: string }>;
}

function buildTranscript(history: unknown, prompt: unknown) {
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

function normalizeReasoning(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const allowedOptions = Array.isArray((value as any).allowed_options)
    ? (value as any).allowed_options
        .map((entry: unknown) => normalizeText(entry))
        .filter(Boolean)
    : [];
  const defaultValue = normalizeText((value as any).default);

  if (!allowedOptions.length && !defaultValue) {
    return null;
  }

  return {
    allowedOptions,
    default: defaultValue || null,
  };
}

function normalizeModelEntry(entry: LmStudioModelRecord | null | undefined) {
  const id = normalizeText(entry?.key);

  if (!id) {
    return null;
  }

  return {
    id,
    label: normalizeText(entry?.display_name) || id,
    loaded: Array.isArray(entry?.loaded_instances) && entry.loaded_instances.length > 0,
    maxContextLength: Number.isFinite(Number(entry?.max_context_length))
      ? Number(entry?.max_context_length)
      : null,
    reasoning: normalizeReasoning(entry?.capabilities?.reasoning),
  };
}

async function requestLmStudioJson(pathname: string, init?: RequestInit) {
  const url = new URL(pathname, LM_STUDIO_BASE_URL);
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      normalizeText(payload?.error?.message) ||
      normalizeText(payload?.message) ||
      `LM Studio devolvio ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}

async function listChatModels() {
  const payload = await requestLmStudioJson(MODELS_ENDPOINT);
  const models = Array.isArray(payload?.models)
    ? payload.models
        .map((entry: LmStudioModelRecord) => normalizeModelEntry(entry))
        .filter(Boolean)
        .filter((entry: any) => Boolean(entry?.id))
    : [];

  return models.sort((left: any, right: any) => {
    if (left.loaded !== right.loaded) {
      return left.loaded ? -1 : 1;
    }

    return String(left.label).localeCompare(String(right.label));
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForModelLoaded(modelId: string) {
  const startedAt = Date.now();
  let lastModels = await listChatModels();

  while (Date.now() - startedAt <= MODEL_LOAD_WAIT_TIMEOUT_MS) {
    const targetModel = lastModels.find((entry: any) => entry?.id === modelId);

    if (targetModel?.loaded) {
      return lastModels;
    }

    await sleep(MODEL_LOAD_POLL_INTERVAL_MS);
    lastModels = await listChatModels();
  }

  throw new Error(`El modelo "${modelId}" no quedo disponible a tiempo en LM Studio.`);
}

async function loadChatModel(payload: any) {
  const model = normalizeText(payload?.model);

  if (!model) {
    throw new Error("Falta el modelo a cargar.");
  }

  await requestLmStudioJson(LOAD_MODEL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
    }),
  });

  const models = await waitForModelLoaded(model);

  return {
    model,
    models,
    baseUrl: LM_STUDIO_BASE_URL,
  };
}

function extractAssistantMessage(payload: any) {
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

function extractResponseMetadata(payload: any) {
  return {
    modelInstanceId: normalizeText(payload?.model_instance_id) || null,
    stats: payload?.stats && typeof payload.stats === "object" ? payload.stats : null,
  };
}

async function sendChatMessage(payload: any) {
  const model = normalizeText(payload?.model);

  if (!model) {
    throw new Error("Selecciona un modelo antes de enviar mensajes.");
  }

  const transcript = buildTranscript(payload?.history, payload?.prompt);
  const responsePayload = await requestLmStudioJson(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: transcript,
    }),
  });

  return {
    message: extractAssistantMessage(responsePayload),
    ...extractResponseMetadata(responsePayload),
  };
}

const chatPlugin: NexusBackendPluginModule = {
  activate(ctx: NexusBackendPluginContext) {
    ctx.registerIpc("chatbot:list-models", async () => {
      try {
        return createSuccess({
          models: await listChatModels(),
          baseUrl: LM_STUDIO_BASE_URL,
        });
      } catch (error) {
        return createError(error, "No se pudieron cargar los modelos de LM Studio.");
      }
    });

    ctx.registerIpc("chatbot:send-message", async (_event, payload: any) => {
      try {
        return createSuccess(await sendChatMessage(payload));
      } catch (error) {
        return createError(error, "No se pudo enviar el mensaje a LM Studio.");
      }
    });

    ctx.registerIpc("chatbot:load-model", async (_event, payload: any) => {
      try {
        return createSuccess(await loadChatModel(payload));
      } catch (error) {
        return createError(error, "No se pudo cargar el modelo en LM Studio.");
      }
    });
  },
};

export default chatPlugin;
