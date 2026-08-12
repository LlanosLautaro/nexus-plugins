export const NEXUS_PLUGIN_API_VERSION: 2;
export function resolveItemLocationFromItemsState(itemsState: { byId?: Record<string, any>; rootId?: string | null }, itemId: string): ResolvedItemLocation | null;

export type NexusPluginPermission = "host.node" | "host.media" | `browser.${string}`;
export type JsonSchema = Record<string, unknown> | boolean;

export interface NexusPluginManifest {
  id: string;
  displayName: string;
  version: string;
  apiVersion: 2;
  schemaVersion: number;
  description?: string;
  author?: string;
  permissions?: NexusPluginPermission[];
  entrypoints: { backend: string; renderer: string };
  contributes?: Record<string, unknown> & {
    ipc?: { operations: string[] };
  };
}

export interface NexusStructuredError {
  code: string;
  message: string;
  retryable: boolean;
}

export class NexusPluginError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  constructor(code: string, message: string, options?: { retryable?: boolean; cause?: unknown });
}

export function definePluginManifest<T extends NexusPluginManifest>(manifest: T): Readonly<T>;

export interface NexusPluginLogApi {
  debug(event: string, message: string, details?: Record<string, unknown> | null): void;
  info(event: string, message: string, details?: Record<string, unknown> | null): void;
  warn(event: string, message: string, details?: Record<string, unknown> | null): void;
  error(event: string, message: string, details?: Record<string, unknown> | null): void;
}

export interface NexusPluginLifecycleApi {
  readonly signal: AbortSignal;
  readonly acceptingWork: boolean;
  run<T>(name: string, producer: (context: { signal: AbortSignal }) => Promise<T> | T): Promise<T>;
  throwIfAborted(): void;
}

export interface NexusPluginIpcRequestContext {
  readonly signal: AbortSignal;
  readonly generation: number | null;
  onCleanup(cleanup: () => Promise<void> | void): void;
  throwIfAborted(): void;
}

export interface ResolvedItemLocation {
  itemId: string;
  parentId: string | null;
  name: string;
  type: "file" | "folder";
  path: string;
  relativePath: string | null;
  contentRelativePath: string | null;
  ancestorIds: string[];
}

export interface VaultItemSyncPayload {
  item: unknown;
  reason: "created" | "initial-scan" | "snapshot" | "updated" | "content-updated";
  structuralChanged: boolean;
  contentChanged: boolean;
}

export interface NexusPluginStateApi {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<unknown>;
}

export interface NexusPluginSettingsApi {
  get(): Promise<Record<string, unknown>>;
  set(value: Record<string, unknown>): Promise<Record<string, unknown>>;
  subscribe(
    listener: (value: Record<string, unknown>, change: { pluginId: string; value: Record<string, unknown> }) => void | Promise<void>,
    options?: { emitCurrent?: boolean },
  ): () => void;
}

export interface NexusPluginMediaRuntime {
  version: string;
  ffmpegPath: string;
  ffprobePath: string;
  manifestDigest: string;
}

export interface MetadataResourceDefinition {
  resourceId: string;
  supportsItem(context: any, item: any): Promise<boolean> | boolean;
  listVariants(context: any, item: any): Promise<any[]> | any[];
  getFormInstance(context: any, itemId: string, variantId: string): Promise<any>;
  submitForm(context: any, itemId: string, variantId: string, values: Record<string, unknown>): Promise<any>;
}

export interface NexusBackendPluginContext {
  pluginId: string;
  manifest: NexusPluginManifest;
  lifecycle: NexusPluginLifecycleApi;
  log: NexusPluginLogApi;
  state: NexusPluginStateApi;
  settings: NexusPluginSettingsApi;
  vault: unknown;
  getRepositories(): any;
  requireRepositories(): any;
  tasks: unknown;
  browserConnection: unknown;
  resolveItemLocation(itemId: string): Promise<ResolvedItemLocation | null>;
  items: {
    rename(item: unknown, nextName: string): Promise<unknown>;
    rollbackRename(item: unknown, result: unknown): Promise<void>;
  };
  syncMarkdownLinks(payload: VaultItemSyncPayload): Promise<unknown>;
  ipc: {
    handle(
      operation: string,
      contract: { requestSchema?: JsonSchema; responseSchema?: JsonSchema; timeoutClass?: "control" | "io" | "long" | "interactive" },
      handler: (event: unknown, payload: unknown, request: NexusPluginIpcRequestContext) => Promise<unknown> | unknown,
    ): void;
  };
  capabilities: {
    external: { consume(event: unknown, grantId: string): string };
    media: { requireRuntime(): Promise<NexusPluginMediaRuntime> };
  };
  registerMetadataResource(definition: unknown): void;
  registerItemSyncHandler(handler: (payload: VaultItemSyncPayload) => Promise<void> | void): void;
  registerCleanup(cleanup: () => Promise<void> | void): void;
}

export interface NexusRendererPluginContext {
  pluginId: string;
  log: NexusPluginLogApi;
  resolveItemLocation(itemId: string): Promise<ResolvedItemLocation | null>;
  ui: {
    icons: Record<string, unknown>;
    canvas: Record<string, unknown>;
    markdown: Record<string, unknown>;
  };
  [key: string]: unknown;
}

export interface NexusBackendPluginModule {
  activate?(ctx: NexusBackendPluginContext): Promise<void> | void;
  deactivate?(ctx: NexusBackendPluginContext): Promise<void> | void;
  ensureSchema?(ctx: NexusBackendPluginContext): Promise<void> | void;
  onItemSync?(ctx: NexusBackendPluginContext, payload: VaultItemSyncPayload): Promise<void> | void;
}
