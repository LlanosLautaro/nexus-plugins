import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import chokidar from "chokidar";
import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "@nexus/plugin-sdk";
import {
  createBooruMediaRuntimeAccess,
  isSystemicMediaRuntimeError,
} from "./media-runtime.mjs";
import { BOORU_ENTITY_KIND_LABELS, BOORU_PLUGIN_ID } from "./constants.js";
import {
  normalizeBooruSettings,
  readBooruPythonExecutable,
  readBooruWatchFolderPath,
} from "./plugin-settings.js";
import {
  getBooruEssentialState,
  getBooruRecommendationKindOrder,
  getBooruRecommendationKindRank,
  normalizeRealitySource,
  resolveBooruReality,
} from "./domain/classification-policy.js";
import {
  getBooruDetailsFieldSchema,
  getBooruDetailsMixedFields,
  getBooruDetailsPriorityContext,
  getBooruDetailsRealityState,
} from "./domain/details-policy.js";
import {
  createBooruEntityVisualProjection,
  getBooruEntityVisualMediaStyle,
  getBooruEntityVisualRenderProps,
  normalizeBooruEntityVisualLayout as normalizeEntityVisualLayout,
  normalizeBooruEntityVisualSettings as normalizeEntityVisualSettings,
} from "./domain/entity-visual-policy.js";
import {
  createBooruIncrementalEntityResult,
  normalizeBooruEntityRelationRequest,
} from "./domain/entity-relations.js";
import {
  createBooruIncrementalBrowseResult,
  normalizeBooruBrowseQuery,
  normalizeBooruFreeTextTerms,
} from "./domain/contextual-browse.js";
import {
  BOORU_RECOMMENDATION_SCOPES,
  buildBooruResourceQuery,
  getBooruContextualMissingFilterOptions,
  getBooruImplicitRecommendationMissingKind,
  getBooruRecommendationScope,
  isBooruMissingFilterCompatible,
  normalizeBooruRecommendationScope,
  resourceMatchesBooruPendingMode,
  resourceMatchesBooruSection,
} from "./domain/pending-workflow.js";
import {
  applyBooruMutationToResourceWindow,
  isBooruResourceWindowContextCurrent,
  normalizeBooruResourceMutationResult,
  resolveBooruAnchoredResources,
} from "./domain/resource-mutations.js";
import {
  createBooruIngestMutation,
  createBooruKeyedSerialExecutor,
} from "./domain/duplicate-ingest.js";
import {
  BOORU_VIDEO_SHORT_DURATION_SECONDS,
  BOORU_VIDEO_SHORT_VARIANT,
  shouldGenerateBooruVideoShort,
} from "./domain/video-preview-policy.js";
import {
  normalizeBooruComparableText,
  normalizeBooruEntityPrefix,
  normalizeBooruMissingFilter,
  normalizeBooruOptionalText,
  normalizeBooruReality,
  normalizeBooruSlug,
  normalizeBooruText,
  parseBooruSearchSyntax,
  uniqueBooruIds,
} from "./booru-utils.js";

type PythonStatus = {
  available: boolean;
  command: string;
  resolvedExecutable: string | null;
  error: string | null;
};

type BooruEntityKind = "author" | "artist" | "character" | "universe";
type BooruEntityVisualRole = "avatar" | "banner";
type BooruMissingFilter = "type" | "author" | "artist" | "character" | "universe";
type BooruPendingMode = "essential" | "tags";
type BooruRecommendationScope = "all" | "essential" | "tags";

type BooruLinkedEntityRecord = {
  id: string;
  displayName: string;
  slug: string;
};

type BooruTagRecord = {
  id: string;
  name: string;
  source: string;
};

type BooruCharacterLinkedEntityRecord = BooruLinkedEntityRecord & {
  universe: BooruLinkedEntityRecord | null;
};

type CharacterUniverseAssignmentPayload = {
  characterId?: unknown;
  universeId?: unknown;
};

type BooruAssignmentPatchPayload = {
  addIds?: unknown;
  removeIds?: unknown;
};

type ListResourcesPayload = {
  section?: unknown;
  query?: unknown;
  offset?: unknown;
  limit?: unknown;
};

type ResourceEntityFilterPayload = {
  kind?: unknown;
  id?: unknown;
  value?: unknown;
  label?: unknown;
};

type ResourceTagFilterPayload = {
  id?: unknown;
  value?: unknown;
  label?: unknown;
};

type ResourceQueryPayload = {
  text?: unknown;
  textTerms?: unknown;
  mediaKind?: unknown;
  reality?: unknown;
  classificationState?: unknown;
  pendingMode?: unknown;
  includeEntities?: unknown;
  excludeEntities?: unknown;
  includeTags?: unknown;
  excludeTags?: unknown;
  missing?: unknown;
  sortBy?: unknown;
  groupBy?: unknown;
  groupOrderBy?: unknown;
  direction?: unknown;
  grouping?: unknown;
  randomSeed?: unknown;
};

type ResourceMutationViewPayload = {
  section?: unknown;
  query?: unknown;
};

type RecommendationDraftPayload = {
  reality?: unknown;
  authors?: unknown;
  artists?: unknown;
  characters?: unknown;
  universes?: unknown;
  manualTags?: unknown;
};

type ListRecommendationsPayload = {
  query?: unknown;
  resourceQuery?: unknown;
  scope?: unknown;
  selectedResourceIds?: unknown;
  draft?: unknown;
  offset?: unknown;
  limit?: unknown;
};

type PrimeVisibleThumbnailsPayload = {
  resourceIds?: unknown;
};

type ThumbnailStatus = "pending" | "ready" | "error";
type MediaInfoStatus = "pending" | "ready" | "error";
type BooruMediaRuntimeAccess = ReturnType<typeof createBooruMediaRuntimeAccess>;

type RuntimeState = {
  generation: string;
  shuttingDown: boolean;
  abortController: AbortController;
  childProcesses: Set<any>;
  backgroundTasks: Set<Promise<unknown>>;
  ctx: NexusBackendPluginContext;
  storageRoot: string;
  catalogPath: string;
  mediaRoot: string;
  duplicatesRoot: string;
  thumbsRoot: string;
  shortsRoot: string;
  watcher: any | null;
  watcherState: {
    active: boolean;
    stage: string;
    watchedPath: string;
    lastError: string;
    lastIngestedAt: string | null;
    lastIngestedOriginalFilename: string | null;
    lastIngestedStoragePath: string | null;
    pendingCount: number;
  };
  python: PythonStatus;
  mediaRuntimeAccess: BooruMediaRuntimeAccess;
  queue: Promise<void>;
  queuedPaths: Set<string>;
  ingestByContentHash: ReturnType<typeof createBooruKeyedSerialExecutor>;
  thumbnailHighPriorityIds: string[];
  thumbnailLowPriorityIds: string[];
  thumbnailQueuedIds: Set<string>;
  thumbnailProcessingIds: Set<string>;
  thumbnailLastError: string;
  thumbnailTaskActive: boolean;
  thumbnailTaskTotal: number;
  thumbnailTaskCompleted: number;
  thumbnailTaskFailed: number;
  ingestTaskActive: boolean;
  ingestTaskTotal: number;
  ingestTaskCompleted: number;
  ingestTaskFailed: number;
  invalidationVersion: number;
  pendingInvalidations: Set<RuntimeInvalidationKey>;
  invalidationTimer: ReturnType<typeof setTimeout> | null;
  invalidationDelayMs: number;
  db: DatabaseSync | null;
  fastClassification: { kind: BooruEntityKind; entityId: string; scopeId: string } | null;
};

type RuntimeInvalidationKey =
  | "resourcesVersion"
  | "thumbnailsVersion"
  | "entitiesVersion"
  | "watcherVersion"
  | "metricsVersion";

type NormalizedResourceEntityFilter = {
  kind: BooruEntityKind;
  id: string | null;
  value: string | null;
  label: string | null;
};

type NormalizedResourceTagFilter = {
  id: string | null;
  value: string | null;
  label: string | null;
};

type NormalizedResourceQuery = {
  text: string | null;
  textTerms: string[];
  mediaKind: "image" | "video" | "gif" | null;
  reality: "real" | "ficticio" | null;
  classificationState: "unclassified" | null;
  pendingMode: BooruPendingMode | null;
  includeEntities: NormalizedResourceEntityFilter[];
  excludeEntities: NormalizedResourceEntityFilter[];
  includeTags: NormalizedResourceTagFilter[];
  excludeTags: NormalizedResourceTagFilter[];
  missing: BooruMissingFilter | null;
  sortBy: string;
  groupBy: string;
  groupOrderBy: string;
  direction: "asc" | "desc";
  grouping: "continuous" | "sectioned";
  randomSeed: string;
};

type NormalizedResourceMutationView = {
  section: BooruResourceSection;
  query: NormalizedResourceQuery;
};

type BooruEntityVisualLayout = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type BooruEntityVisualSettings = {
  avatar: BooruEntityVisualLayout;
  banner: BooruEntityVisualLayout;
};

type NormalizedRecommendationDraft = {
  reality: "real" | "ficticio" | null;
  authors: string[];
  artists: string[];
  characters: string[];
  universes: string[];
  manualTags: string[];
};

type SaveBasicClassificationPayload = {
  resourceId?: unknown;
  resourceIds?: unknown;
  dirtyFields?: unknown;
  reality?: unknown;
  authorIds?: unknown;
  authorPatch?: unknown;
  artistIds?: unknown;
  artistPatch?: unknown;
  characterIds?: unknown;
  characterPatch?: unknown;
  universeIds?: unknown;
  universePatch?: unknown;
  characterUniverses?: unknown;
  tagIds?: unknown;
  tagPatch?: unknown;
  view?: ResourceMutationViewPayload;
};

type SaveResourceMetadataPayload = {
  resourceId?: unknown;
  resourceIds?: unknown;
  dirtyFields?: unknown;
  reality?: unknown;
  authorIds?: unknown;
  authorPatch?: unknown;
  artistIds?: unknown;
  artistPatch?: unknown;
  characterIds?: unknown;
  characterPatch?: unknown;
  universeIds?: unknown;
  universePatch?: unknown;
  characterUniverses?: unknown;
  tagIds?: unknown;
  tagPatch?: unknown;
  view?: ResourceMutationViewPayload;
};

type QuickAssignEntityPayload = {
  resourceId?: unknown;
  resourceIds?: unknown;
  kind?: unknown;
  entityId?: unknown;
  view?: ResourceMutationViewPayload;
};

type PasteClipboardImageToEntityPayload = {
  kind?: unknown;
  entityId?: unknown;
  grantId?: unknown;
};

type ClipboardAssociationPayload = {
  kind?: unknown;
  entityId?: unknown;
  entityName?: unknown;
  aliasNames?: unknown;
  universeId?: unknown;
  universeName?: unknown;
};

type PasteClipboardMediaPayload = PasteClipboardImageToEntityPayload & {
  association?: ClipboardAssociationPayload;
  associations?: ClipboardAssociationPayload[];
};

type SetCharacterUniversePayload = {
  characterId?: unknown;
  universeId?: unknown;
};

type EnsureCharacterInUniversePayload = {
  name?: unknown;
  universeId?: unknown;
};

type SetEntityVisualPayload = {
  kind?: unknown;
  entityId?: unknown;
  resourceId?: unknown;
  visualRole?: unknown;
  layout?: unknown;
};

type SetEntityVisualLayoutPayload = {
  kind?: unknown;
  entityId?: unknown;
  visualRole?: unknown;
  scale?: unknown;
  offsetX?: unknown;
  offsetY?: unknown;
};

type SaveEntityProfilePayload = {
  kind?: unknown;
  entityId?: unknown;
  displayName?: unknown;
  aliasNames?: unknown;
  tagIds?: unknown;
  socialLinks?: unknown;
};

type ResourceEntityAssociationPayload = {
  kind?: unknown;
  entityId?: unknown;
  resourceIds?: unknown;
};

type FastClassificationPayload = {
  kind?: unknown;
  entityId?: unknown;
  scopeId?: unknown;
};

type TrashResourcesPayload = {
  resourceIds?: unknown;
  view?: ResourceMutationViewPayload;
};

type OpenInBravePayload = {
  resourceId?: unknown;
};

type BooruResourceSection = "media" | "pending" | "duplicates" | "trash" | "profile";

type NormalizedBooruAssignmentPatch = {
  addIds: string[];
  removeIds: string[];
};

type SpawnedJsonExecutionResult = {
  args: string[];
  command: string;
  data: any;
  durationMs: number;
  exitCode: number;
  stderr: string;
  stdout: string;
};

type IngestFileOptions = {
  updateWatcherState?: boolean;
  sourcePathOverride?: string | null;
  originalFilenameOverride?: string | null;
};

type IngestFileResult = {
  resource: any;
  createdResourceId: string | null;
  reusedCanonical: boolean;
  reason: "resource-created" | "duplicate-reintegrated";
  updatedResourceIds: string[];
  createdResourceIds: string[];
};

const CLIPBOARD_IMAGE_TEMP_ROOT = path.join(os.tmpdir(), "new-nexus", "clipboard-images");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".bmp",
  ".avif",
]);
const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mkv",
  ".mov",
  ".avi",
  ".m4v",
]);
const GIF_EXTENSIONS = new Set([".gif"]);
const ENTITY_TABLES: Record<BooruEntityKind, string> = {
  author: "booru_authors",
  artist: "booru_artists",
  character: "booru_characters",
  universe: "booru_universes",
};
const ENTITY_VISUAL_COLUMNS: Record<BooruEntityVisualRole, string> = {
  avatar: "avatar_resource_id",
  banner: "banner_resource_id",
};
const RESOURCE_RELATION_TABLES: Partial<Record<BooruEntityKind, string>> = {
  author: "booru_resource_authors",
  artist: "booru_resource_artists",
  character: "booru_resource_characters",
};
const RESOURCE_RELATION_ENTITY_ID_COLUMNS: Partial<Record<BooruEntityKind, string>> = {
  author: "author_id",
  artist: "artist_id",
  character: "character_id",
};
const BOORU_RESOURCE_SECTIONS = new Set<BooruResourceSection>(["media", "pending", "duplicates", "trash", "profile"]);
const BOORU_RESOURCE_MEDIA_KINDS = new Set<NormalizedResourceQuery["mediaKind"]>(["image", "video", "gif"]);
const BOORU_RECOMMENDATION_PAGE_SIZE = 24;
const DEFAULT_RESOURCE_PAGE_SIZE = 120;
const MAX_RESOURCE_PAGE_SIZE = 5000;
const BRAVE_PROFILE_DIRECTORY = "Plugins";
const THUMBNAIL_VARIANT_NAME = "grid";
const THUMBNAIL_MAX_SIDE_PX = 384;
const THUMBNAIL_CONCURRENCY = 2;
const BOORU_RUNTIME_STATE_KEYS: Record<RuntimeInvalidationKey, string> = {
  resourcesVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.resourcesVersion`,
  thumbnailsVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.thumbnailsVersion`,
  entitiesVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.entitiesVersion`,
  watcherVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.watcherVersion`,
  metricsVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.metricsVersion`,
};
let booruBackendLogger: NexusBackendPluginContext["log"];

let runtimeState: RuntimeState | null = null;

class BooruRuntimeCancelledError extends Error {
  constructor() {
    super("El runtime de Booru fue cancelado.");
    this.name = "BooruRuntimeCancelledError";
  }
}

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

function nowIso() {
  return new Date().toISOString();
}

function truncateDiagnosticText(value: unknown, maxLength = 2400) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function summarizeIdsForLog(ids: unknown, maxCount = 12) {
  return uniqueBooruIds(Array.isArray(ids) ? ids : []).slice(0, maxCount);
}

function logBackendDuration(
  event: string,
  message: string,
  durationMs: number,
  data: Record<string, unknown> = {},
) {
  const method = durationMs >= 180 ? "info" : "debug";
  booruBackendLogger[method](event, message, {
    durationMs: Number(durationMs.toFixed(2)),
    ...data,
  });
}

function isRuntimeStateActive(
  state: RuntimeState | null | undefined,
): state is RuntimeState {
  return Boolean(
    isRuntimeStateCurrent(state) &&
    !state.shuttingDown &&
    !state.abortController.signal.aborted,
  );
}

function isRuntimeStateCurrent(
  state: RuntimeState | null | undefined,
): state is RuntimeState {
  return Boolean(state && runtimeState === state && state.db);
}

function assertRuntimeStateActive(state: RuntimeState) {
  if (!isRuntimeStateActive(state)) {
    throw new BooruRuntimeCancelledError();
  }
}

function assertRuntimeStateCurrent(state: RuntimeState) {
  if (!isRuntimeStateCurrent(state)) {
    throw new BooruRuntimeCancelledError();
  }
}

function isRuntimeCancellation(error: unknown) {
  return (
    error instanceof BooruRuntimeCancelledError ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function trackRuntimeBackgroundTask<T>(state: RuntimeState, task: Promise<T>) {
  const trackedTask = state.ctx.lifecycle.run(
    "booru.background",
    () => task,
  ) as Promise<unknown>;
  state.backgroundTasks.add(trackedTask);
  void trackedTask.finally(() => {
    state.backgroundTasks.delete(trackedTask);
  }).catch(() => undefined);
  return task;
}

function scheduleRuntimeInvalidationForState(
  state: RuntimeState | null | undefined,
  ...keys: RuntimeInvalidationKey[]
) {
  if (!isRuntimeStateActive(state)) {
    return;
  }

  keys.forEach((key) => state.pendingInvalidations.add(key));
  const hasNonMetricsInvalidation = Array.from(state.pendingInvalidations).some((key) => key !== "metricsVersion");
  const desiredDelayMs = hasNonMetricsInvalidation ? 40 : 350;

  if (state.invalidationTimer) {
    if (desiredDelayMs >= state.invalidationDelayMs) {
      return;
    }

    clearTimeout(state.invalidationTimer);
    state.invalidationTimer = null;
  }

  state.invalidationDelayMs = desiredDelayMs;
  state.invalidationTimer = setTimeout(() => {
    if (!isRuntimeStateActive(state)) {
      return;
    }

    const pendingKeys = Array.from(state.pendingInvalidations);
    state.pendingInvalidations.clear();
    state.invalidationTimer = null;
    state.invalidationDelayMs = 0;

    if (!pendingKeys.length) {
      return;
    }

    const versionBase = `${Date.now()}-${state.invalidationVersion++}`;

    const invalidationTask = Promise.all(
      pendingKeys.map((key) => state.ctx.state.set(
        BOORU_RUNTIME_STATE_KEYS[key],
        `${versionBase}:${key}`,
      )),
    )
      .then(() => {
        booruBackendLogger.debug(
          "booru.runtime-invalidation.flush",
          "Booru publico invalidaciones de runtime para el renderer.",
          {
            keys: pendingKeys,
            versionBase,
          },
        );
      })
      .catch((error) => {
        booruBackendLogger.warn(
          "booru.runtime-invalidation.error",
          "Booru no pudo publicar invalidaciones de runtime.",
          {
            keys: pendingKeys,
            error,
          },
        );
      });
    trackRuntimeBackgroundTask(state, invalidationTask);
  }, desiredDelayMs);
}

function scheduleRuntimeInvalidation(...keys: RuntimeInvalidationKey[]) {
  scheduleRuntimeInvalidationForState(runtimeState, ...keys);
}

function withTransaction<T>(db: DatabaseSync, callback: () => T) {
  db.exec("BEGIN");

  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function getStoragePaths(ctx: NexusBackendPluginContext) {
  const storageRoot = path.join(ctx.vault.nexusPath, "plugins-data", BOORU_PLUGIN_ID);
  return {
    storageRoot,
    catalogPath: path.join(storageRoot, "catalog.db"),
    mediaRoot: path.join(storageRoot, "media"),
    duplicatesRoot: path.join(storageRoot, "review", "duplicates"),
    thumbsRoot: path.join(storageRoot, "thumbs"),
    shortsRoot: path.join(storageRoot, "shorts"),
  };
}

async function ensureStoragePaths(storagePaths: ReturnType<typeof getStoragePaths>) {
  for (const directoryPath of [
    storagePaths.storageRoot,
    storagePaths.mediaRoot,
    storagePaths.duplicatesRoot,
    storagePaths.thumbsRoot,
    storagePaths.shortsRoot,
  ]) {
    await fsp.mkdir(directoryPath, { recursive: true });
  }
}

function ensureCatalogSchema(db: DatabaseSync) {
  db.function("booru_normalize", { deterministic: true }, (value: unknown) => normalizeBooruComparableText(value));
  db.function("booru_seeded_rank", { deterministic: true }, (id: unknown, seed: unknown) => {
    const digest = crypto.createHash("sha256").update(`${String(seed || "")}:${String(id || "")}`).digest("hex");
    return Number.parseInt(digest.slice(0, 12), 16);
  });
  db.exec(`
    CREATE TABLE IF NOT EXISTS booru_resources (
      id TEXT PRIMARY KEY NOT NULL,
      storage_filename TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      extension TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      media_kind TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      width INTEGER,
      height INTEGER,
      duration_ms INTEGER,
      content_hash TEXT NOT NULL,
      reality TEXT,
      reality_source TEXT NOT NULL DEFAULT 'auto',
      classification_state TEXT NOT NULL DEFAULT 'unclassified',
      canonical_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      source_path TEXT,
      trashed_at TEXT,
      imported_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resources_state
    ON booru_resources (classification_state, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_hash
    ON booru_resources (content_hash);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_kind
    ON booru_resources (media_kind, imported_at DESC);

    CREATE TABLE IF NOT EXISTS booru_tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_resource_tags (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS booru_entity_tags (
      entity_kind TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (entity_kind, entity_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS booru_entity_aliases (
      entity_kind TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      alias_name TEXT NOT NULL,
      comparable_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (entity_kind, entity_id, comparable_name)
    );

    CREATE TABLE IF NOT EXISTS booru_social_platforms (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL UNIQUE,
      icon_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      icon_layout_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_entity_social_links (
      id TEXT PRIMARY KEY NOT NULL,
      entity_kind TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      platform_id TEXT NOT NULL REFERENCES booru_social_platforms(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (entity_kind, entity_id, platform_id, url)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_inherited_tags (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      source_kind TEXT NOT NULL,
      source_entity_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, tag_id, source_kind, source_entity_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_tag_exclusions (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_inherited_universes (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      character_id TEXT NOT NULL REFERENCES booru_characters(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, universe_id, character_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_universe_exclusions (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, universe_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_video_shorts (
      resource_id TEXT PRIMARY KEY NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      storage_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      variant TEXT NOT NULL DEFAULT 'legacy-60s-v1',
      generated_at TEXT,
      error_message TEXT
    );

    CREATE TABLE IF NOT EXISTS booru_authors (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_artists (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_characters (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_universes (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_resource_authors (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES booru_authors(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, author_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_authors_resource
    ON booru_resource_authors (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_authors_author
    ON booru_resource_authors (author_id);

    CREATE TABLE IF NOT EXISTS booru_resource_artists (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      artist_id TEXT NOT NULL REFERENCES booru_artists(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, artist_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_artists_resource
    ON booru_resource_artists (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_artists_artist
    ON booru_resource_artists (artist_id);

    CREATE TABLE IF NOT EXISTS booru_resource_characters (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      character_id TEXT NOT NULL REFERENCES booru_characters(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, character_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_characters_resource
    ON booru_resource_characters (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_characters_character
    ON booru_resource_characters (character_id);

    CREATE TABLE IF NOT EXISTS booru_character_universes (
      character_id TEXT NOT NULL REFERENCES booru_characters(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (character_id, universe_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_universes (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, universe_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_universes_resource
    ON booru_resource_universes (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_universes_universe
    ON booru_resource_universes (universe_id);

    CREATE TABLE IF NOT EXISTS booru_resource_thumbnails (
      resource_id TEXT PRIMARY KEY NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      storage_path TEXT,
      mime_type TEXT,
      width INTEGER,
      height INTEGER,
      byte_size INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      source_hash TEXT,
      generated_at TEXT,
      error_message TEXT,
      frame_timestamp_ms INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_thumbnails_status
    ON booru_resource_thumbnails (status, generated_at DESC);
  `);

  const resourceColumns = new Set(
    db.prepare(`PRAGMA table_info(booru_resources)`).all().map((row: any) => String(row?.name || "")),
  );

  const addedRealitySource = !resourceColumns.has("reality_source");

  if (addedRealitySource) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN reality_source TEXT NOT NULL DEFAULT 'auto'`);
    db.exec(`
      UPDATE booru_resources
      SET reality_source = CASE
        WHEN reality IS NULL THEN 'auto'
        WHEN EXISTS (
          SELECT 1 FROM booru_resource_authors rel
          WHERE rel.resource_id = booru_resources.id
        ) THEN 'auto'
        WHEN reality = 'ficticio' AND (
          EXISTS (
            SELECT 1 FROM booru_resource_artists rel
            WHERE rel.resource_id = booru_resources.id
          )
          OR EXISTS (
            SELECT 1 FROM booru_resource_characters rel
            WHERE rel.resource_id = booru_resources.id
          )
          OR EXISTS (
            SELECT 1 FROM booru_resource_universes rel
            WHERE rel.resource_id = booru_resources.id
          )
        ) THEN 'auto'
        ELSE 'manual'
      END
    `);
  }

  if (!resourceColumns.has("trashed_at")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN trashed_at TEXT`);
  }

  if (!resourceColumns.has("media_info_status")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN media_info_status TEXT NOT NULL DEFAULT 'pending'`);
  }

  if (!resourceColumns.has("media_info_error")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN media_info_error TEXT`);
  }

  const videoShortColumns = new Set(
    db.prepare(`PRAGMA table_info(booru_resource_video_shorts)`).all().map((row: any) => String(row?.name || "")),
  );
  if (!videoShortColumns.has("variant")) {
    db.exec(`ALTER TABLE booru_resource_video_shorts ADD COLUMN variant TEXT NOT NULL DEFAULT 'legacy-60s-v1'`);
  }

  for (const entityTable of Object.values(ENTITY_TABLES)) {
    const entityColumns = new Set(
      db.prepare(`PRAGMA table_info(${entityTable})`).all().map((row: any) => String(row?.name || "")),
    );

    if (!entityColumns.has("avatar_resource_id")) {
      db.exec(`
        ALTER TABLE ${entityTable}
        ADD COLUMN avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL
      `);
    }

    if (!entityColumns.has("banner_resource_id")) {
      db.exec(`
        ALTER TABLE ${entityTable}
        ADD COLUMN banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL
      `);
    }

    if (!entityColumns.has("visual_settings_json")) {
      db.exec(`
        ALTER TABLE ${entityTable}
        ADD COLUMN visual_settings_json TEXT
      `);
    }
  }

  db.exec(`
    DELETE FROM booru_character_universes
    WHERE rowid NOT IN (
      SELECT MIN(rowid)
      FROM booru_character_universes
      GROUP BY character_id
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_booru_character_universes_character
    ON booru_character_universes (character_id);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_trashed
    ON booru_resources (trashed_at, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_media_info
    ON booru_resources (media_info_status, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_entity_aliases_lookup
    ON booru_entity_aliases (entity_kind, comparable_name);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_inherited_tags_resource
    ON booru_resource_inherited_tags (resource_id, tag_id);
  `);

  if (addedRealitySource) {
    db.prepare(`SELECT id FROM booru_resources`).all().forEach((row: any) => {
      const resourceId = normalizeBooruText(row?.id);
      if (resourceId) reconcileResourceClassificationSync(db, resourceId);
    });
  }
}

function resolveBooruRuntimeAssetPath(...segments: string[]) {
  return path.resolve(__dirname, "..", ...segments);
}

function getBooruMediaWorkerPath() {
  return resolveBooruRuntimeAssetPath("assets", "booru_media_worker.py");
}

function getThumbnailOutputPaths(thumbsRoot: string, resourceId: string) {
  const variantRoot = path.join(thumbsRoot, THUMBNAIL_VARIANT_NAME);
  const basePath = path.join(variantRoot, resourceId);
  return {
    basePath,
    webpPath: `${basePath}.webp`,
    jpegPath: `${basePath}.jpg`,
  };
}

function normalizeThumbnailStatus(value: unknown): ThumbnailStatus {
  const normalized = normalizeBooruText(value).toLowerCase();
  return normalized === "ready" || normalized === "error" ? normalized : "pending";
}

function normalizeMediaInfoStatus(value: unknown): MediaInfoStatus {
  const normalized = normalizeBooruText(value).toLowerCase();
  return normalized === "ready" || normalized === "error" ? normalized : "pending";
}

function normalizeThumbnailDescriptor(row: any) {
  const hasExplicitThumbnailRow =
    Object.prototype.hasOwnProperty.call(row || {}, "thumbnail_status")
    || Object.prototype.hasOwnProperty.call(row || {}, "status");
  const status = normalizeThumbnailStatus(row?.thumbnail_status ?? row?.status);
  const storagePath = normalizeBooruOptionalText(row?.thumbnail_storage_path ?? row?.storage_path);
  const mimeType = normalizeBooruOptionalText(row?.thumbnail_mime_type ?? row?.mime_type);
  const width = Number.isFinite(Number(row?.thumbnail_width ?? row?.width))
    ? Number(row.thumbnail_width ?? row.width)
    : null;
  const height = Number.isFinite(Number(row?.thumbnail_height ?? row?.height))
    ? Number(row.thumbnail_height ?? row.height)
    : null;
  const byteSize = Number.isFinite(Number(row?.thumbnail_byte_size ?? row?.byte_size))
    ? Number(row.thumbnail_byte_size ?? row.byte_size)
    : null;
  const sourceHash = normalizeBooruOptionalText(row?.thumbnail_source_hash ?? row?.source_hash);
  const generatedAt = normalizeBooruOptionalText(row?.thumbnail_generated_at ?? row?.generated_at);
  const errorMessage = normalizeBooruOptionalText(row?.thumbnail_error_message ?? row?.error_message);
  const frameTimestampMs = Number.isFinite(Number(row?.thumbnail_frame_timestamp_ms ?? row?.frame_timestamp_ms))
    ? Number(row.thumbnail_frame_timestamp_ms ?? row.frame_timestamp_ms)
    : null;

  if (!hasExplicitThumbnailRow && !storagePath && !errorMessage) {
    return null;
  }

  return {
    status,
    storagePath,
    mimeType,
    width,
    height,
    byteSize,
    sourceHash,
    generatedAt,
    errorMessage,
    frameTimestampMs,
  };
}

function toSqlLikePattern(value: string | null) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return `%${normalized.replace(/[%_]/g, (match) => `\\${match}`)}%`;
}

function getEntityTable(kind: BooruEntityKind) {
  return ENTITY_TABLES[kind];
}

function getResourceRelationTable(kind: BooruEntityKind) {
  return RESOURCE_RELATION_TABLES[kind] || null;
}

function getResourceRelationEntityIdColumn(kind: BooruEntityKind) {
  return RESOURCE_RELATION_ENTITY_ID_COLUMNS[kind] || null;
}

function normalizeLinkedEntityRow(row: any): BooruLinkedEntityRecord {
  return {
    id: String(row?.id || ""),
    displayName: String(row?.display_name || row?.displayName || "").trim(),
    slug: String(row?.slug || "").trim(),
  };
}

function normalizeTagRow(row: any): BooruTagRecord {
  return {
    id: String(row?.id || ""),
    name: String(row?.name || "").trim(),
    source: String(row?.source || "manual").trim() || "manual",
  };
}

function getDefaultEntityVisualSettings(): BooruEntityVisualSettings {
  return normalizeEntityVisualSettings(null);
}

function parseEntityVisualSettings(value: unknown): BooruEntityVisualSettings {
  if (typeof value !== "string" || !value.trim()) {
    return getDefaultEntityVisualSettings();
  }

  try {
    return normalizeEntityVisualSettings(JSON.parse(value));
  } catch {
    return getDefaultEntityVisualSettings();
  }
}

function serializeEntityVisualSettings(value: BooruEntityVisualSettings) {
  return JSON.stringify(normalizeEntityVisualSettings(value));
}

function normalizeOptionalLinkedEntityRow(row: any): BooruLinkedEntityRecord | null {
  if (!row) {
    return null;
  }

  const normalizedRow = normalizeLinkedEntityRow(row);
  return normalizedRow.id ? normalizedRow : null;
}

function getCharacterUniverseRecordSync(db: DatabaseSync, characterId: string) {
  const statement = db.prepare(`
    SELECT u.id, u.display_name, u.slug
    FROM booru_character_universes rel
    INNER JOIN booru_universes u ON u.id = rel.universe_id
    WHERE rel.character_id = ?
    ORDER BY rel.created_at ASC, u.display_name COLLATE NOCASE ASC
    LIMIT 1
  `);

  return normalizeOptionalLinkedEntityRow(statement.get(characterId) || null);
}

function listResourceEntitiesSync(
  db: DatabaseSync,
  kind: Extract<BooruEntityKind, "author" | "artist" | "character">,
  resourceId: string,
) {
  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);

  if (!relationTable || !relationEntityIdColumn) {
    return [];
  }

  const statement = db.prepare(`
    SELECT e.id, e.display_name, e.slug
    FROM ${relationTable} rel
    INNER JOIN ${getEntityTable(kind)} e ON e.id = rel.${relationEntityIdColumn}
    WHERE rel.resource_id = ?
    ORDER BY rel.sort_order ASC, e.display_name COLLATE NOCASE ASC
  `);

  return statement.all(resourceId).map((row: any) => {
    const normalizedRow = normalizeLinkedEntityRow(row);

    if (kind === "character") {
      return {
        ...normalizedRow,
        universe: getCharacterUniverseRecordSync(db, normalizedRow.id),
      } satisfies BooruCharacterLinkedEntityRecord;
    }

    return normalizedRow;
  });
}

function listResourceUniversesSync(db: DatabaseSync, resourceId: string) {
  const statement = db.prepare(`
    SELECT DISTINCT u.id, u.display_name, u.slug
    FROM booru_universes u
    WHERE (
      EXISTS (
        SELECT 1 FROM booru_resource_universes rel
        WHERE rel.resource_id = ? AND rel.universe_id = u.id
      )
      OR EXISTS (
        SELECT 1 FROM booru_resource_inherited_universes rel
        WHERE rel.resource_id = ? AND rel.universe_id = u.id
      )
    )
      AND NOT EXISTS (
        SELECT 1 FROM booru_resource_universe_exclusions exclusion
        WHERE exclusion.resource_id = ? AND exclusion.universe_id = u.id
      )
    ORDER BY u.display_name COLLATE NOCASE ASC
  `);

  return statement.all(resourceId, resourceId, resourceId).map(normalizeLinkedEntityRow);
}

function listDirectResourceUniversesSync(db: DatabaseSync, resourceId: string) {
  return db.prepare(`
    SELECT u.id, u.display_name, u.slug
    FROM booru_resource_universes rel
    INNER JOIN booru_universes u ON u.id = rel.universe_id
    WHERE rel.resource_id = ?
    ORDER BY rel.sort_order ASC, u.display_name COLLATE NOCASE ASC
  `).all(resourceId).map(normalizeLinkedEntityRow);
}

function listResourceTagsSync(db: DatabaseSync, resourceId: string) {
  const statement = db.prepare(`
    SELECT DISTINCT t.id, t.name, t.source
    FROM booru_tags t
    WHERE (
      EXISTS (
        SELECT 1 FROM booru_resource_tags rel
        WHERE rel.resource_id = ? AND rel.tag_id = t.id
      )
      OR EXISTS (
        SELECT 1 FROM booru_resource_inherited_tags rel
        WHERE rel.resource_id = ? AND rel.tag_id = t.id
      )
    )
      AND NOT EXISTS (
        SELECT 1 FROM booru_resource_tag_exclusions exclusion
        WHERE exclusion.resource_id = ? AND exclusion.tag_id = t.id
      )
    ORDER BY t.name COLLATE NOCASE ASC
  `);

  return statement.all(resourceId, resourceId, resourceId).map(normalizeTagRow);
}

function listDirectResourceTagsSync(db: DatabaseSync, resourceId: string) {
  return db.prepare(`
    SELECT t.id, t.name, t.source
    FROM booru_resource_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.resource_id = ?
    ORDER BY t.name COLLATE NOCASE ASC
  `).all(resourceId).map(normalizeTagRow);
}

function listEntityTagsSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  return db.prepare(`
    SELECT t.id, t.name, t.source
    FROM booru_entity_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.entity_kind = ? AND rel.entity_id = ?
    ORDER BY t.name COLLATE NOCASE ASC
  `).all(kind, entityId).map(normalizeTagRow);
}

function listEntityAliasesSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  return db.prepare(`
    SELECT alias_name
    FROM booru_entity_aliases
    WHERE entity_kind = ? AND entity_id = ?
    ORDER BY alias_name COLLATE NOCASE ASC
  `).all(kind, entityId).map((row: any) => String(row?.alias_name || "").trim()).filter(Boolean);
}

function listEntitySocialLinksSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  return db.prepare(`
    SELECT rel.id, rel.url, platform.id AS platform_id, platform.display_name AS platform_name,
      platform.icon_resource_id, platform.icon_layout_json
    FROM booru_entity_social_links rel
    INNER JOIN booru_social_platforms platform ON platform.id = rel.platform_id
    WHERE rel.entity_kind = ? AND rel.entity_id = ?
    ORDER BY platform.display_name COLLATE NOCASE ASC, rel.created_at ASC
  `).all(kind, entityId).map((row: any) => ({
    id: String(row?.id || ""),
    url: String(row?.url || ""),
    platform: {
      id: String(row?.platform_id || ""),
      displayName: String(row?.platform_name || ""),
      iconResourceId: normalizeBooruOptionalText(row?.icon_resource_id),
      iconLayout: parseEntityVisualSettings(row?.icon_layout_json)?.avatar || null,
    },
  }));
}

function getPendingReasons(resource: {
  reality: ReturnType<typeof normalizeBooruReality>;
  authors: BooruLinkedEntityRecord[];
  artists: BooruLinkedEntityRecord[];
  characters: BooruCharacterLinkedEntityRecord[];
  universes: BooruLinkedEntityRecord[];
  manualTags: BooruTagRecord[];
  classificationState: string;
  trashedAt: string | null;
}) {
  if (resource.classificationState === "duplicate-review" || resource.trashedAt) {
    return {
      isPending: false,
      pendingScore: 0,
      pendingReasons: [] as string[],
      essentialCompletionState: "hidden",
    };
  }

  const essential = getBooruEssentialState(resource);
  const reasonWeights = {
    reality: 100,
    author: 60,
    character: 60,
    universe: 40,
    artist: 15,
  };
  const reasons = essential.missing.map((missingKind) => `missing-${missingKind}`);
  const pendingScore = essential.missing.reduce(
    (score, missingKind) => score + (reasonWeights[missingKind as keyof typeof reasonWeights] || 1),
    0,
  );

  if (!reasons.length) {
    return {
      isPending: false,
      pendingScore: 0,
      pendingReasons: [] as string[],
      essentialCompletionState: "complete",
    };
  }

  return {
    isPending: true,
    pendingScore: Math.max(1, pendingScore),
    pendingReasons: reasons,
    essentialCompletionState: reasons[0] || "incomplete",
  };
}

function normalizeResourceRow(db: DatabaseSync, row: any) {
  if (!row) {
    return null;
  }

  const width = Number.isFinite(Number(row.width)) ? Number(row.width) : null;
  const height = Number.isFinite(Number(row.height)) ? Number(row.height) : null;
  const mediaKind = String(row.media_kind || "");
  const systemTags = [mediaKind];
  const resourceId = String(row.id || "");

  if (width && height) {
    systemTags.push(`resolution:${width}x${height}`);
  }

  const authors = listResourceEntitiesSync(db, "author", resourceId);
  const artists = listResourceEntitiesSync(db, "artist", resourceId);
  const characters = listResourceEntitiesSync(db, "character", resourceId);
  const directUniverses = listDirectResourceUniversesSync(db, resourceId);
  const universes = listResourceUniversesSync(db, resourceId);
  const manualTags = listDirectResourceTagsSync(db, resourceId);
  const tags = listResourceTagsSync(db, resourceId);
  const trashedAt = row.trashed_at == null ? null : String(row.trashed_at);
  const thumbnail = normalizeThumbnailDescriptor(row);
  const pendingState = getPendingReasons({
    reality: normalizeBooruReality(row.reality),
    authors,
    artists,
    characters,
    directUniverses,
    universes,
    manualTags,
    classificationState: String(row.classification_state || "unclassified"),
    trashedAt,
  });

  return {
    id: resourceId,
    storageFilename: String(row.storage_filename || ""),
    storagePath: String(row.storage_path || ""),
    originalFilename: String(row.original_filename || ""),
    extension: String(row.extension || ""),
    mimeType: String(row.mime_type || ""),
    mediaKind,
    fileSize: Number(row.file_size || 0),
    width,
    height,
    durationMs: Number.isFinite(Number(row.duration_ms)) ? Number(row.duration_ms) : null,
    mediaInfoStatus: normalizeMediaInfoStatus(row.media_info_status),
    mediaInfoError: normalizeBooruOptionalText(row.media_info_error),
    autoplayStoragePath: normalizeBooruOptionalText(row.video_short_storage_path),
    videoShortStatus: normalizeBooruOptionalText(row.video_short_status),
    videoShortVariant: normalizeBooruOptionalText(row.video_short_variant),
    thumbnail,
    contentHash: String(row.content_hash || ""),
    reality: normalizeBooruReality(row.reality),
    realitySource: normalizeRealitySource(row.reality_source),
    classificationState: String(row.classification_state || "unclassified"),
    canonicalResourceId: row.canonical_resource_id == null ? null : String(row.canonical_resource_id),
    canonicalOriginalFilename:
      row.canonical_original_filename == null ? null : String(row.canonical_original_filename),
    sourcePath: row.source_path == null ? null : String(row.source_path),
    trashedAt,
    importedAt: String(row.imported_at || ""),
    lastSeenAt: String(row.last_seen_at || ""),
    authors,
    artists,
    characters,
    directUniverses,
    universes,
    manualTags,
    tags,
    systemTags,
    pendingScore: pendingState.pendingScore,
    pendingReasons: pendingState.pendingReasons,
    isPending: pendingState.isPending,
    essentialCompletionState: pendingState.essentialCompletionState,
  };
}

function getCanonicalResourceByHash(db: DatabaseSync, contentHash: string) {
  const statement = db.prepare(`
    SELECT id, original_filename
    FROM booru_resources
    WHERE content_hash = ?
      AND classification_state != 'duplicate-review'
      AND trashed_at IS NULL
    ORDER BY rowid ASC
    LIMIT 1
  `);

  return statement.get(contentHash) || null;
}

function getResourceByIdSync(db: DatabaseSync, resourceId: string) {
  const statement = db.prepare(`
    SELECT
      r.*,
      c.original_filename AS canonical_original_filename,
      th.storage_path AS thumbnail_storage_path,
      th.mime_type AS thumbnail_mime_type,
      th.width AS thumbnail_width,
      th.height AS thumbnail_height,
      th.byte_size AS thumbnail_byte_size,
      th.status AS thumbnail_status,
      th.source_hash AS thumbnail_source_hash,
      th.generated_at AS thumbnail_generated_at,
      th.error_message AS thumbnail_error_message,
      th.frame_timestamp_ms AS thumbnail_frame_timestamp_ms
      ,vs.storage_path AS video_short_storage_path
      ,vs.status AS video_short_status
      ,vs.variant AS video_short_variant
    FROM booru_resources r
    LEFT JOIN booru_resources c ON c.id = r.canonical_resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    LEFT JOIN booru_resource_video_shorts vs ON vs.resource_id = r.id
    WHERE r.id = ?
    LIMIT 1
  `);

  return normalizeResourceRow(db, statement.get(resourceId) || null);
}

function normalizeResourceSection(value: unknown): BooruResourceSection {
  const normalized = normalizeBooruText(value) as BooruResourceSection;
  return BOORU_RESOURCE_SECTIONS.has(normalized) ? normalized : "media";
}

function normalizeResourceEntityFilters(value: unknown): NormalizedResourceEntityFilter[] {
  const seenKeys = new Set<string>();
  const normalizedFilters: NormalizedResourceEntityFilter[] = [];

  for (const rawValue of Array.isArray(value) ? value : []) {
    const rawFilter = rawValue as ResourceEntityFilterPayload;
    const rawKind = normalizeBooruText(rawFilter?.kind);
    const kind = (ENTITY_TABLES[rawKind as BooruEntityKind]
      ? rawKind
      : normalizeBooruEntityPrefix(rawKind)) as BooruEntityKind | null;
    const id = normalizeBooruOptionalText(rawFilter?.id);
    const filterValue = normalizeBooruOptionalText(rawFilter?.value);
    const comparableValue = normalizeBooruComparableText(filterValue);

    if (!ENTITY_TABLES[kind as BooruEntityKind] || (!id && !comparableValue)) {
      continue;
    }

    const dedupeKey = `${kind}:${id || ""}:${comparableValue || ""}`;

    if (seenKeys.has(dedupeKey)) {
      continue;
    }

    seenKeys.add(dedupeKey);
    normalizedFilters.push({
      kind: kind as BooruEntityKind,
      id,
      value: filterValue,
      label: normalizeBooruOptionalText(rawFilter?.label) || filterValue,
    });
  }

  return normalizedFilters;
}

function normalizeResourceTagFilters(value: unknown): NormalizedResourceTagFilter[] {
  const seenKeys = new Set<string>();
  const normalizedFilters: NormalizedResourceTagFilter[] = [];

  for (const rawValue of Array.isArray(value) ? value : []) {
    const rawFilter = rawValue as ResourceTagFilterPayload;
    const id = normalizeBooruOptionalText(rawFilter?.id);
    const filterValue = normalizeBooruOptionalText(rawFilter?.value);
    const comparableValue = normalizeBooruComparableText(filterValue);

    if (!id && !comparableValue) {
      continue;
    }

    const dedupeKey = `${id || ""}:${comparableValue || ""}`;

    if (seenKeys.has(dedupeKey)) {
      continue;
    }

    seenKeys.add(dedupeKey);
    normalizedFilters.push({
      id,
      value: filterValue,
      label: normalizeBooruOptionalText(rawFilter?.label) || filterValue,
    });
  }

  return normalizedFilters;
}

function normalizeResourceMissingFilter(value: unknown): BooruMissingFilter | null {
  if (Array.isArray(value)) {
    for (let index = value.length - 1; index >= 0; index -= 1) {
      const normalizedMissing = normalizeBooruMissingFilter(value[index]);

      if (normalizedMissing) {
        return normalizedMissing;
      }
    }

    return null;
  }

  return normalizeBooruMissingFilter(value);
}

function normalizePendingMode(value: unknown): BooruPendingMode | null {
  const normalizedValue = normalizeBooruComparableText(value);

  if (normalizedValue === "essential" || normalizedValue === "tags") {
    return normalizedValue;
  }

  return null;
}

function normalizeResourceQuery(value: unknown): NormalizedResourceQuery {
  const rawQuery = (value && typeof value === "object" ? value : {}) as ResourceQueryPayload;
  const mediaKind = normalizeBooruComparableText(rawQuery?.mediaKind);
  const classificationState = normalizeBooruComparableText(rawQuery?.classificationState);
  const browse = normalizeBooruBrowseQuery(rawQuery, "resource");
  const textTerms = normalizeBooruFreeTextTerms(rawQuery?.textTerms ?? rawQuery?.text);

  return {
    text: normalizeBooruOptionalText(rawQuery?.text),
    textTerms,
    mediaKind: BOORU_RESOURCE_MEDIA_KINDS.has(mediaKind as NormalizedResourceQuery["mediaKind"])
      ? mediaKind as NormalizedResourceQuery["mediaKind"]
      : null,
    reality: normalizeBooruReality(rawQuery?.reality),
    classificationState: classificationState === "unclassified" ? "unclassified" : null,
    pendingMode: normalizePendingMode(rawQuery?.pendingMode),
    includeEntities: normalizeResourceEntityFilters(rawQuery?.includeEntities),
    excludeEntities: normalizeResourceEntityFilters(rawQuery?.excludeEntities),
    includeTags: normalizeResourceTagFilters(rawQuery?.includeTags),
    excludeTags: normalizeResourceTagFilters(rawQuery?.excludeTags),
    missing: normalizeResourceMissingFilter(rawQuery?.missing),
    ...browse,
  };
}

function normalizePagingNumber(value: unknown, fallback: number, maxValue: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.min(maxValue, Math.floor(parsed));
}

function buildPendingSqlExpressions(alias = "r") {
  const missingReality = `(CASE WHEN ${alias}.reality IS NULL OR TRIM(${alias}.reality) = '' THEN 1 ELSE 0 END)`;
  const missingAuthor = `(CASE WHEN ${alias}.reality = 'real' AND NOT EXISTS (
    SELECT 1 FROM booru_resource_authors rel WHERE rel.resource_id = ${alias}.id
  ) THEN 1 ELSE 0 END)`;
  const missingArtist = `(CASE WHEN ${alias}.reality = 'ficticio' AND NOT EXISTS (
    SELECT 1 FROM booru_resource_artists rel WHERE rel.resource_id = ${alias}.id
  ) THEN 1 ELSE 0 END)`;
  const missingCharacter = `(CASE WHEN ${alias}.reality = 'ficticio'
    AND NOT EXISTS (SELECT 1 FROM booru_resource_characters rel WHERE rel.resource_id = ${alias}.id)
  THEN 1 ELSE 0 END)`;
  const missingUniverse = `(CASE WHEN ${alias}.reality = 'ficticio'
    AND (
      (
        NOT EXISTS (
          SELECT 1
          FROM booru_resource_universes rel
          WHERE rel.resource_id = ${alias}.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM booru_resource_characters rel
          INNER JOIN booru_character_universes cu ON cu.character_id = rel.character_id
          WHERE rel.resource_id = ${alias}.id
        )
      )
      OR EXISTS (
        SELECT 1
        FROM booru_resource_characters rel
        WHERE rel.resource_id = ${alias}.id
          AND NOT EXISTS (
            SELECT 1
            FROM booru_character_universes cu
            WHERE cu.character_id = rel.character_id
          )
      )
    )
  THEN 1 ELSE 0 END)`;
  const manualTagCount = `(
    SELECT COUNT(DISTINCT rel.tag_id)
    FROM booru_resource_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.resource_id = ${alias}.id
      AND t.source = 'manual'
  )`;
  // Pendientes is a completion queue. Count the essential classification data
  // that a resource already has, rather than weighting the categories it
  // still lacks. This keeps completely untyped imports at the very front,
  // followed by progressively more classified resources.
  const essentialTagCount = `(
    (CASE WHEN ${alias}.reality IS NULL OR TRIM(${alias}.reality) = '' THEN 0 ELSE 1 END) +
    (SELECT COUNT(DISTINCT rel.author_id) FROM booru_resource_authors rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.artist_id) FROM booru_resource_artists rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.character_id) FROM booru_resource_characters rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.universe_id) FROM booru_resource_universes rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.universe_id)
      FROM booru_resource_inherited_universes rel
      WHERE rel.resource_id = ${alias}.id
        AND NOT EXISTS (
          SELECT 1
          FROM booru_resource_universes direct_rel
          WHERE direct_rel.resource_id = ${alias}.id
            AND direct_rel.universe_id = rel.universe_id
        )
    )
  )`;
  const rawScore = `(
    (${missingReality} * 100) +
    (${missingAuthor} * 60) +
    (${missingArtist} * 15) +
    (${missingCharacter} * 60) +
    (${missingUniverse} * 40)
  )`;
  const isPending = `(CASE
    WHEN ${alias}.classification_state = 'duplicate-review' OR ${alias}.trashed_at IS NOT NULL THEN 0
    WHEN ${rawScore} > 0 THEN 1
    ELSE 0
  END)`;
  const pendingScore = `(CASE
    WHEN ${isPending} = 1 THEN MAX(1, ${rawScore})
    ELSE 0
  END)`;

  return {
    isPending,
    pendingScore,
    essentialTagCount,
    manualTagCount,
  };
}

function buildEntityFilterSql(
  alias: string,
  filter: NormalizedResourceEntityFilter,
  resolvedIds: string[] = [],
  negate = false,
) {
  const parameters: unknown[] = [];
  const filterIds = uniqueBooruIds(resolvedIds.length ? resolvedIds : (filter.id ? [filter.id] : []));

  if (filter.kind === "universe") {
    if (filterIds.length) {
      const placeholders = filterIds.map(() => "?").join(", ");
      const directClause = `EXISTS (
        SELECT 1
        FROM booru_resource_universes rel
        WHERE rel.resource_id = ${alias}.id
          AND rel.universe_id IN (${placeholders})
      )`;
      const inheritedClause = `EXISTS (
        SELECT 1
        FROM booru_resource_characters rc
        INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
        WHERE rc.resource_id = ${alias}.id
          AND cu.universe_id IN (${placeholders})
          AND NOT EXISTS (
            SELECT 1
            FROM booru_resource_universe_exclusions excluded
            WHERE excluded.resource_id = ${alias}.id
              AND excluded.universe_id = cu.universe_id
          )
      )`;
      parameters.push(...filterIds, ...filterIds);
      return {
        clause: negate
          ? `(NOT ${directClause} AND NOT ${inheritedClause})`
          : `(${directClause} OR ${inheritedClause})`,
        parameters,
      };
    }

    return negate ? null : { clause: "0 = 1", parameters: [] };
  }

  const relationTable = getResourceRelationTable(filter.kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(filter.kind);
  const entityTable = getEntityTable(filter.kind);

  if (!relationTable || !relationEntityIdColumn || !entityTable) {
    return null;
  }

  if (filterIds.length) {
    const placeholders = filterIds.map(() => "?").join(", ");
    return {
      clause: `${negate ? "NOT " : ""}EXISTS (
        SELECT 1
        FROM ${relationTable} rel
        WHERE rel.resource_id = ${alias}.id
          AND rel.${relationEntityIdColumn} IN (${placeholders})
      )`,
      parameters: filterIds,
    };
  }

  return negate ? null : { clause: "0 = 1", parameters: [] };
}

function buildTagFilterSql(
  alias: string,
  filter: NormalizedResourceTagFilter,
  resolvedIds: string[] = [],
  negate = false,
) {
  const filterIds = uniqueBooruIds(resolvedIds.length ? resolvedIds : (filter.id ? [filter.id] : []));

  if (filterIds.length) {
    const placeholders = filterIds.map(() => "?").join(", ");
    return {
      clause: negate
        ? `(NOT EXISTS (SELECT 1 FROM booru_resource_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})) AND NOT EXISTS (SELECT 1 FROM booru_resource_inherited_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})))`
        : `(EXISTS (SELECT 1 FROM booru_resource_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})) OR EXISTS (SELECT 1 FROM booru_resource_inherited_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})))`,
      parameters: negate ? [...filterIds, ...filterIds] : [...filterIds, ...filterIds],
    };
  }

  return negate ? null : { clause: "0 = 1", parameters: [] };
}

function buildResourceListSqlParts(
  db: DatabaseSync,
  section: BooruResourceSection,
  query: NormalizedResourceQuery,
) {
  const whereClauses: string[] = [];
  const parameters: unknown[] = [];
  const pendingSql = buildPendingSqlExpressions("r");
  const pendingMode = section === "pending" && query.pendingMode === "tags"
    ? "tags"
    : "essential";

  if (section === "duplicates") {
    whereClauses.push(`r.classification_state = 'duplicate-review'`);
    whereClauses.push(`r.trashed_at IS NULL`);
  } else if (section === "trash") {
    whereClauses.push(`r.trashed_at IS NOT NULL`);
  } else {
    whereClauses.push(`r.classification_state != 'duplicate-review'`);
    whereClauses.push(`r.trashed_at IS NULL`);

    if (section === "media") {
      whereClauses.push(`${pendingSql.isPending} = 0`);
    } else if (section === "pending") {
      whereClauses.push(pendingMode === "tags"
        ? `${pendingSql.isPending} = 0`
        : `${pendingSql.isPending} = 1`);
    }
  }

  if (query.textTerms.length) {
    const termClauses = query.textTerms.map((term) => {
      const pattern = `%${term}%`;
      const entitySources = [
        ["author", "booru_resource_authors", "author_id", "booru_authors"],
        ["artist", "booru_resource_artists", "artist_id", "booru_artists"],
        ["character", "booru_resource_characters", "character_id", "booru_characters"],
        ["universe", "booru_resource_universes", "universe_id", "booru_universes"],
      ] as const;
      const clauses = [
        `EXISTS (
          SELECT 1 FROM booru_resource_tags rel
          INNER JOIN booru_tags value ON value.id = rel.tag_id
          WHERE rel.resource_id = r.id AND booru_normalize(value.name) LIKE ?
        )`,
        `EXISTS (
          SELECT 1 FROM booru_resource_inherited_tags rel
          INNER JOIN booru_tags value ON value.id = rel.tag_id
          WHERE rel.resource_id = r.id AND booru_normalize(value.name) LIKE ?
        )`,
      ];
      parameters.push(pattern, pattern);

      entitySources.forEach(([kind, relationTable, entityColumn, entityTable]) => {
        clauses.push(`EXISTS (
          SELECT 1 FROM ${relationTable} rel
          INNER JOIN ${entityTable} entity ON entity.id = rel.${entityColumn}
          WHERE rel.resource_id = r.id
            AND (
              booru_normalize(entity.display_name) LIKE ?
              OR EXISTS (
                SELECT 1 FROM booru_entity_aliases alias
                WHERE alias.entity_kind = '${kind}'
                  AND alias.entity_id = entity.id
                  AND alias.comparable_name LIKE ?
              )
            )
        )`);
        parameters.push(pattern, pattern);
      });

      clauses.push(`EXISTS (
        SELECT 1
        FROM booru_resource_characters rc
        INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
        INNER JOIN booru_universes universe ON universe.id = cu.universe_id
        WHERE rc.resource_id = r.id
          AND NOT EXISTS (
            SELECT 1 FROM booru_resource_universe_exclusions excluded
            WHERE excluded.resource_id = r.id AND excluded.universe_id = universe.id
          )
          AND (
            booru_normalize(universe.display_name) LIKE ?
            OR EXISTS (
              SELECT 1 FROM booru_entity_aliases alias
              WHERE alias.entity_kind = 'universe'
                AND alias.entity_id = universe.id
                AND alias.comparable_name LIKE ?
            )
          )
      )`);
      parameters.push(pattern, pattern);
      return `(${clauses.join(" OR ")})`;
    });
    whereClauses.push(`(${termClauses.join(" OR ")})`);
  }

  if (query.classificationState === "unclassified") {
    whereClauses.push(`r.classification_state = 'unclassified'`);
  }

  if (query.mediaKind === "image" || query.mediaKind === "video" || query.mediaKind === "gif") {
    whereClauses.push(`r.media_kind = ?`);
    parameters.push(query.mediaKind);
  }

  if (query.reality === "real" || query.reality === "ficticio") {
    whereClauses.push(`r.reality = ?`);
    parameters.push(query.reality);
  }

  if (query.missing === "type") {
    whereClauses.push(`(r.reality IS NULL OR TRIM(r.reality) = '')`);
  } else if (query.missing === "author") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_authors rel
      WHERE rel.resource_id = r.id
    )`);
  } else if (query.missing === "artist") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_artists rel
      WHERE rel.resource_id = r.id
    )`);
  } else if (query.missing === "character") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_characters rel
      WHERE rel.resource_id = r.id
    )`);
  } else if (query.missing === "universe") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_universes rel
      WHERE rel.resource_id = r.id
    ) AND NOT EXISTS (
      SELECT 1
      FROM booru_resource_characters rel
      INNER JOIN booru_character_universes cu ON cu.character_id = rel.character_id
      WHERE rel.resource_id = r.id
    )`);
  }

  for (const entityFilter of query.includeEntities) {
    const resolvedIds = resolveEntityIdsForResourceFilterSync(db, entityFilter);
    const filterSql = buildEntityFilterSql("r", entityFilter, resolvedIds, false);

    if (!filterSql) {
      continue;
    }

    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }

  for (const entityFilter of query.excludeEntities) {
    const resolvedIds = resolveEntityIdsForResourceFilterSync(db, entityFilter);
    const filterSql = buildEntityFilterSql("r", entityFilter, resolvedIds, true);

    if (!filterSql) {
      continue;
    }

    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }

  for (const tagFilter of query.includeTags) {
    const resolvedIds = resolveTagIdsForResourceFilterSync(db, tagFilter);
    const filterSql = buildTagFilterSql("r", tagFilter, resolvedIds, false);

    if (!filterSql) {
      continue;
    }

    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }

  for (const tagFilter of query.excludeTags) {
    const resolvedIds = resolveTagIdsForResourceFilterSync(db, tagFilter);
    const filterSql = buildTagFilterSql("r", tagFilter, resolvedIds, true);

    if (!filterSql) {
      continue;
    }

    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }

  if (query.grouping === "sectioned") {
    if (query.groupBy === "author") {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM booru_resource_authors rel WHERE rel.resource_id = r.id
      )`);
    } else if (query.groupBy === "artist") {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM booru_resource_artists rel WHERE rel.resource_id = r.id
      )`);
    } else if (query.groupBy === "character") {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM booru_resource_characters rel WHERE rel.resource_id = r.id
      )`);
    } else if (query.groupBy === "universe") {
      whereClauses.push(`(
        EXISTS (
          SELECT 1 FROM booru_resource_universes rel WHERE rel.resource_id = r.id
        )
        OR EXISTS (
          SELECT 1
          FROM booru_resource_characters rc
          INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
          WHERE rc.resource_id = r.id
            AND NOT EXISTS (
              SELECT 1 FROM booru_resource_universe_exclusions excluded
              WHERE excluded.resource_id = r.id AND excluded.universe_id = cu.universe_id
            )
        )
      )`);
    }
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join("\n      AND ")}` : "";
  const directionSql = query.grouping === "sectioned"
    ? "DESC"
    : (query.direction === "asc" ? "ASC" : "DESC");
  const orderParameters: unknown[] = [];
  let orderExpression = "r.imported_at";

  if (query.grouping === "sectioned") {
    orderExpression = "r.imported_at";
  } else if (query.sortBy === "author") {
    orderExpression = `(SELECT MIN(entity.display_name) FROM booru_resource_authors rel INNER JOIN booru_authors entity ON entity.id = rel.author_id WHERE rel.resource_id = r.id)`;
  } else if (query.sortBy === "artist") {
    orderExpression = `(SELECT MIN(entity.display_name) FROM booru_resource_artists rel INNER JOIN booru_artists entity ON entity.id = rel.artist_id WHERE rel.resource_id = r.id)`;
  } else if (query.sortBy === "character") {
    orderExpression = `(SELECT MIN(entity.display_name) FROM booru_resource_characters rel INNER JOIN booru_characters entity ON entity.id = rel.character_id WHERE rel.resource_id = r.id)`;
  } else if (query.sortBy === "universe") {
    orderExpression = `(SELECT MIN(value.display_name) FROM (
      SELECT universe.display_name
      FROM booru_resource_universes rel
      INNER JOIN booru_universes universe ON universe.id = rel.universe_id
      WHERE rel.resource_id = r.id
      UNION
      SELECT universe.display_name
      FROM booru_resource_characters rc
      INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
      INNER JOIN booru_universes universe ON universe.id = cu.universe_id
      WHERE rc.resource_id = r.id
        AND NOT EXISTS (
          SELECT 1 FROM booru_resource_universe_exclusions excluded
          WHERE excluded.resource_id = r.id AND excluded.universe_id = universe.id
        )
    ) value)`;
  } else if (query.sortBy === "tag") {
    orderExpression = `(SELECT MIN(tag.name) FROM booru_resource_tags rel INNER JOIN booru_tags tag ON tag.id = rel.tag_id WHERE rel.resource_id = r.id AND tag.source = 'manual')`;
  } else if (query.sortBy === "random") {
    orderExpression = "booru_seeded_rank(r.id, ?)";
    orderParameters.push(query.randomSeed);
  } else if (section === "trash") {
    orderExpression = "r.trashed_at";
  }

  const orderBySql = query.sortBy === "random"
    ? `ORDER BY ${orderExpression} ${directionSql}, r.id ASC`
    : `ORDER BY (${orderExpression}) IS NULL ${directionSql}, ${orderExpression} COLLATE NOCASE ${directionSql}, r.id ASC`;

  return {
    whereSql,
    parameters,
    orderBySql,
    orderParameters,
  };
}

function getResourceRowsByIdsSync(db: DatabaseSync, resourceIds: string[]) {
  if (!resourceIds.length) {
    return [];
  }

  const placeholders = resourceIds.map(() => "?").join(", ");
  const rows = db.prepare(`
    SELECT
      r.*,
      c.original_filename AS canonical_original_filename,
      th.storage_path AS thumbnail_storage_path,
      th.mime_type AS thumbnail_mime_type,
      th.width AS thumbnail_width,
      th.height AS thumbnail_height,
      th.byte_size AS thumbnail_byte_size,
      th.status AS thumbnail_status,
      th.source_hash AS thumbnail_source_hash,
      th.generated_at AS thumbnail_generated_at,
      th.error_message AS thumbnail_error_message,
      th.frame_timestamp_ms AS thumbnail_frame_timestamp_ms
      ,vs.storage_path AS video_short_storage_path
      ,vs.status AS video_short_status
      ,vs.variant AS video_short_variant
    FROM booru_resources r
    LEFT JOIN booru_resources c ON c.id = r.canonical_resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    LEFT JOIN booru_resource_video_shorts vs ON vs.resource_id = r.id
    WHERE r.id IN (${placeholders})
  `).all(...resourceIds);
  const rowById = new Map(rows.map((row: any) => [String(row?.id || ""), row]));

  return resourceIds
    .map((resourceId) => normalizeResourceRow(db, rowById.get(resourceId) || null))
    .filter(Boolean);
}

function normalizeResourceMutationView(value: unknown): NormalizedResourceMutationView | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawView = value as ResourceMutationViewPayload;
  return {
    section: normalizeResourceSection(rawView.section),
    query: normalizeResourceQuery(rawView.query),
  };
}

function listOrderedResourceIdsForViewSync(
  db: DatabaseSync,
  view: NormalizedResourceMutationView,
) {
  const sqlParts = buildResourceListSqlParts(db, view.section, view.query);
  return db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
  `).all(...sqlParts.parameters, ...sqlParts.orderParameters).map((row: any) => String(row?.id || "")).filter(Boolean);
}

function collectAffectedResourceEntities(resources: any[]) {
  const affected = new Map<string, { kind: string; id: string }>();
  const fieldKinds = [
    ["authors", "author"],
    ["artists", "artist"],
    ["characters", "character"],
    ["universes", "universe"],
    ["manualTags", "tag"],
  ] as const;

  for (const resource of resources) {
    for (const [fieldName, kind] of fieldKinds) {
      for (const entity of Array.isArray(resource?.[fieldName]) ? resource[fieldName] : []) {
        const id = normalizeBooruOptionalText(entity?.id);

        if (id) {
          affected.set(`${kind}:${id}`, { kind, id });
        }
      }
    }
  }

  return Array.from(affected.values());
}

function createResourceMutationContextSync(
  db: DatabaseSync,
  payload: SaveResourceMetadataPayload | SaveBasicClassificationPayload | QuickAssignEntityPayload | TrashResourcesPayload,
) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds, payload?.resourceId);
  const view = normalizeResourceMutationView(payload?.view);
  const beforeResources = getResourceRowsByIdsSync(db, resourceIds);
  const beforeMatchingIds = view
    ? listOrderedResourceIdsForViewSync(db, view).filter((resourceId) => resourceIds.includes(resourceId))
    : [];

  return {
    resourceIds,
    view,
    beforeResources,
    beforeMatchingIds,
  };
}

function buildResourceMutationResultSync(
  db: DatabaseSync,
  {
    reason,
    updatedResources: rawUpdatedResources,
    context,
  }: {
    reason: string;
    updatedResources: any;
    context: ReturnType<typeof createResourceMutationContextSync>;
  },
) {
  const updatedResources = (Array.isArray(rawUpdatedResources)
    ? rawUpdatedResources
    : [rawUpdatedResources].filter(Boolean))
    .filter((resource) => resource?.id);
  const changedIds = uniqueBooruIds([
    ...context.resourceIds,
    ...updatedResources.map((resource) => String(resource.id)),
  ]);
  const beforeMatchingIds = new Set(context.beforeMatchingIds);
  const orderedAfterIds = context.view ? listOrderedResourceIdsForViewSync(db, context.view) : [];
  const afterIndexById = new Map(orderedAfterIds.map((resourceId, index) => [resourceId, index]));
  const afterMatchingIds = new Set(changedIds.filter((resourceId) => afterIndexById.has(resourceId)));
  const leavingQueryIds = changedIds.filter(
    (resourceId) => beforeMatchingIds.has(resourceId) && !afterMatchingIds.has(resourceId),
  );
  const enteredQueryIds = changedIds.filter(
    (resourceId) => !beforeMatchingIds.has(resourceId) && afterMatchingIds.has(resourceId),
  );
  const queryPlacements = changedIds
    .filter((resourceId) => afterIndexById.has(resourceId))
    .map((resourceId) => ({
      resourceId,
      index: Number(afterIndexById.get(resourceId)),
    }));

  return {
    revision: `${Date.now()}-${crypto.randomUUID()}`,
    reason: normalizeBooruOptionalText(reason) || "resource-mutated",
    updatedResources,
    leavingQueryIds,
    enteredQueryIds,
    queryPlacements,
    affectedEntities: collectAffectedResourceEntities([
      ...context.beforeResources,
      ...updatedResources,
    ]),
    totalCountDelta: enteredQueryIds.length - leavingQueryIds.length,
  };
}

function countResourcesSync(
  db: DatabaseSync,
  section: BooruResourceSection,
  query: NormalizedResourceQuery,
) {
  const sqlParts = buildResourceListSqlParts(db, section, query);
  const row = db.prepare(`
    SELECT COUNT(*) AS total_count
    FROM booru_resources r
    ${sqlParts.whereSql}
  `).get(...sqlParts.parameters) || {};

  return Number(row?.total_count || 0);
}

function listResourcesSync(
  db: DatabaseSync,
  payload: ListResourcesPayload = {},
) {
  const section = normalizeResourceSection(payload?.section);
  const query = normalizeResourceQuery(payload?.query);
  const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
  const limit = Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
  const sqlParts = buildResourceListSqlParts(db, section, query);
  const totalCount = countResourcesSync(db, section, query);
  const grouped = query.grouping === "sectioned" && query.sortBy !== "random";
  const requestedLimit = grouped ? Math.max(totalCount, 1) : limit;
  const requestedOffset = grouped ? 0 : offset;
  const resourceIds = db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
    LIMIT ?
    OFFSET ?
  `).all(...sqlParts.parameters, ...sqlParts.orderParameters, requestedLimit, requestedOffset)
    .map((row: any) => String(row?.id || "")).filter(Boolean);
  const items = getResourceRowsByIdsSync(db, resourceIds);

  if (grouped) {
    return {
      section,
      query,
      ...createBooruIncrementalBrowseResult(items, query, {
        family: "resource",
        offset,
        limit,
      }),
    };
  }

  return {
    section,
    query,
    items,
    placements: [],
    totalCount,
    placementCount: totalCount,
    hasMore: offset + items.length < totalCount,
  };
}

function listAllResourcesForSectionSync(db: DatabaseSync, section: BooruResourceSection) {
  const emptyQuery = normalizeResourceQuery({});
  const totalCount = countResourcesSync(db, section, emptyQuery);

  if (!totalCount) {
    return [];
  }

  const sqlParts = buildResourceListSqlParts(db, section, emptyQuery);
  const resourceIds = db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
    LIMIT ?
    OFFSET 0
  `).all(...sqlParts.parameters, ...sqlParts.orderParameters, totalCount).map((row: any) => String(row?.id || "")).filter(Boolean);

  return getResourceRowsByIdsSync(db, resourceIds);
}

function listLibraryRows(db: DatabaseSync) {
  return listAllResourcesForSectionSync(db, "media");
}

function listPendingRows(db: DatabaseSync) {
  return listAllResourcesForSectionSync(db, "pending");
}

function listDuplicateRows(db: DatabaseSync) {
  return listAllResourcesForSectionSync(db, "duplicates");
}

function listTrashRows(db: DatabaseSync) {
  return listAllResourcesForSectionSync(db, "trash");
}

function readStats(db: DatabaseSync) {
  const totalRow = db.prepare(`
    SELECT
      COUNT(*) AS totalCount,
      SUM(CASE WHEN classification_state = 'duplicate-review' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS duplicateCount,
      SUM(CASE WHEN classification_state = 'unclassified' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS unclassifiedCount,
      SUM(CASE WHEN classification_state = 'classified-basic' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS classifiedBasicCount,
      SUM(CASE WHEN trashed_at IS NOT NULL THEN 1 ELSE 0 END) AS trashCount,
      SUM(CASE WHEN media_kind = 'image' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS imageCount,
      SUM(CASE WHEN media_kind = 'video' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS videoCount,
      SUM(CASE WHEN media_kind = 'gif' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS gifCount
    FROM booru_resources
  `).get() || {};
  const thumbnailRow = db.prepare(`
    SELECT
      COUNT(*) AS thumbnailCount,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
      SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS readyCount,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS errorCount
    FROM booru_resource_thumbnails
  `).get() || {};
  const totalResourceCount = Number(totalRow.totalCount || 0);
  const thumbnailCount = Number(thumbnailRow.thumbnailCount || 0);
  const thumbnailPendingCount = Number(thumbnailRow.pendingCount || 0);
  const thumbnailReadyCount = Number(thumbnailRow.readyCount || 0);
  const thumbnailErrorCount = Number(thumbnailRow.errorCount || 0);
  const missingThumbnailRows = Math.max(0, totalResourceCount - thumbnailCount);

  return {
    totalCount: totalResourceCount,
    duplicateCount: Number(totalRow.duplicateCount || 0),
    pendingCount: countResourcesSync(db, "pending", normalizeResourceQuery({})),
    unclassifiedCount: Number(totalRow.unclassifiedCount || 0),
    classifiedBasicCount: Number(totalRow.classifiedBasicCount || 0),
    trashCount: Number(totalRow.trashCount || 0),
    imageCount: Number(totalRow.imageCount || 0),
    videoCount: Number(totalRow.videoCount || 0),
    gifCount: Number(totalRow.gifCount || 0),
    thumbnailPendingCount,
    thumbnailReadyCount,
    thumbnailErrorCount,
    thumbnailBacklogCount: thumbnailPendingCount + thumbnailErrorCount + missingThumbnailRows,
  };
}

function resolveMediaDescriptor(filePath: string) {
  const extension = path.extname(filePath || "").toLowerCase();

  if (GIF_EXTENSIONS.has(extension)) {
    return {
      extension,
      mediaKind: "gif",
      mimeType: "image/gif",
    };
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return {
      extension,
      mediaKind: "image",
      mimeType: `image/${extension.replace(/^\./, "")}`,
    };
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    const subtype = extension === ".m4v" ? "mp4" : extension.replace(/^\./, "");
    return {
      extension,
      mediaKind: "video",
      mimeType: `video/${subtype}`,
    };
  }

  return null;
}

async function computeFileHash(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", reject);
    stream.on("data", (chunk) => {
      hash.update(chunk);
    });
    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
}

async function moveFile(sourcePath: string, targetPath: string) {
  await fsp.mkdir(path.dirname(targetPath), { recursive: true });

  try {
    await fsp.rename(sourcePath, targetPath);
    return;
  } catch (error: any) {
    if (error?.code !== "EXDEV") {
      throw error;
    }
  }

  await fsp.copyFile(sourcePath, targetPath);
  await fsp.unlink(sourcePath);
}

function isPathInsideDirectory(parentPath: string, candidatePath: string) {
  const normalizedParent = path.resolve(parentPath);
  const normalizedCandidate = path.resolve(candidatePath);
  const relativePath = path.relative(normalizedParent, normalizedCandidate);

  if (!relativePath) {
    return true;
  }

  return !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}

function assertClipboardTempFilePath(tempFilePath: unknown) {
  const rawPath = String(tempFilePath || "").trim();

  if (!rawPath) {
    throw new Error("No se encontro una imagen temporal valida para Booru.");
  }

  const normalizedPath = path.resolve(rawPath);

  if (!isPathInsideDirectory(CLIPBOARD_IMAGE_TEMP_ROOT, normalizedPath)) {
    throw new Error("La imagen temporal del portapapeles no pertenece al staging autorizado.");
  }

  return normalizedPath;
}

function buildClipboardImportedFilename() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return `clipboard-${timestamp}.png`;
}

function probePythonCommand(command: string): PythonStatus {
  const result = spawnSync(
    command,
    ["-c", "import sys; print(sys.executable)"],
    {
      encoding: "utf8",
      timeout: 5000,
      windowsHide: true,
    },
  );

  if (result.error || result.status !== 0) {
    return {
      available: false,
      command,
      resolvedExecutable: null,
      error:
        result.error?.message
        || String(result.stderr || result.stdout || "No se pudo ejecutar Python.").trim(),
    };
  }

  return {
    available: true,
    command,
    resolvedExecutable: String(result.stdout || "").trim() || command,
    error: null,
  };
}

function resolvePythonStatus(settingsValue: Record<string, unknown>) {
  const explicitPython = readBooruPythonExecutable(settingsValue);

  if (explicitPython) {
    return probePythonCommand(explicitPython);
  }

  return probePythonCommand("python");
}

function getWorkerPythonCommand(state: RuntimeState) {
  return state.python.resolvedExecutable || state.python.command || "python";
}

function getThumbnailRowSync(db: DatabaseSync, resourceId: string) {
  return db.prepare(`
    SELECT *
    FROM booru_resource_thumbnails
    WHERE resource_id = ?
    LIMIT 1
  `).get(resourceId) || null;
}

function getVideoShortRowSync(db: DatabaseSync, resourceId: string) {
  return db.prepare(`
    SELECT *
    FROM booru_resource_video_shorts
    WHERE resource_id = ?
    LIMIT 1
  `).get(resourceId) || null;
}

function ensureThumbnailPendingRowSync(db: DatabaseSync, resourceId: string, sourceHash: string) {
  db.prepare(`
    INSERT INTO booru_resource_thumbnails (
      resource_id,
      storage_path,
      mime_type,
      width,
      height,
      byte_size,
      status,
      source_hash,
      generated_at,
      error_message,
      frame_timestamp_ms
    ) VALUES (?, NULL, NULL, NULL, NULL, NULL, 'pending', ?, NULL, NULL, NULL)
    ON CONFLICT(resource_id) DO UPDATE SET
      status = 'pending',
      source_hash = excluded.source_hash,
      error_message = NULL
  `).run(resourceId, sourceHash);
}

function shouldGenerateThumbnailSync(resource: any, thumbnailRow: any, videoShortRow: any = null) {
  if (!resource?.id || !resource?.storagePath || !resource?.contentHash) {
    return false;
  }

  if (!thumbnailRow) {
    return true;
  }

  const status = normalizeThumbnailStatus(thumbnailRow.status);
  const storagePath = normalizeBooruOptionalText(thumbnailRow.storage_path);
  const sourceHash = normalizeBooruOptionalText(thumbnailRow.source_hash);
  const mediaInfoStatus = normalizeMediaInfoStatus(resource.mediaInfoStatus);
  const metadataReady = resource.width && resource.height && mediaInfoStatus === "ready";

  if (sourceHash !== resource.contentHash) {
    return true;
  }

  if (status !== "ready") {
    return true;
  }

  if (!metadataReady) {
    return true;
  }

  if (!storagePath || !fs.existsSync(storagePath)) return true;

  if (shouldGenerateBooruVideoShort(resource.mediaKind, resource.durationMs)) {
    const shortPath = normalizeBooruOptionalText(videoShortRow?.storage_path);
    return normalizeBooruOptionalText(videoShortRow?.variant) !== BOORU_VIDEO_SHORT_VARIANT
      || normalizeThumbnailStatus(videoShortRow?.status) !== "ready"
      || !shortPath
      || !fs.existsSync(shortPath);
  }

  return false;
}

function listThumbnailBacklogResourceIdsSync(db: DatabaseSync) {
  return db.prepare(`
    SELECT
      r.id,
      r.media_kind,
      r.duration_ms,
      r.media_info_status,
      r.content_hash,
      th.resource_id AS thumbnail_resource_id,
      th.source_hash AS thumbnail_source_hash,
      th.status AS thumbnail_status,
      vs.resource_id AS short_resource_id,
      vs.storage_path AS short_storage_path,
      vs.status AS short_status,
      vs.variant AS short_variant
    FROM booru_resources r
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    LEFT JOIN booru_resource_video_shorts vs ON vs.resource_id = r.id
    WHERE th.resource_id IS NULL
       OR th.source_hash IS NULL
       OR th.source_hash != r.content_hash
       OR th.status != 'ready'
       OR r.media_info_status != 'ready'
       OR (r.media_kind = 'video' AND r.duration_ms > 15000)
    ORDER BY r.imported_at DESC, r.id ASC
  `).all().filter((row: any) => {
    const thumbnailPending = !row?.thumbnail_resource_id
      || !row?.thumbnail_source_hash
      || row.thumbnail_source_hash !== row.content_hash
      || normalizeThumbnailStatus(row?.thumbnail_status) !== "ready"
      || normalizeMediaInfoStatus(row?.media_info_status) !== "ready";
    if (thumbnailPending) return true;
    if (!shouldGenerateBooruVideoShort(row?.media_kind, row?.duration_ms)) return false;

    const shortPath = normalizeBooruOptionalText(row?.short_storage_path);
    return !row?.short_resource_id
      || normalizeThumbnailStatus(row?.short_status) !== "ready"
      || normalizeBooruOptionalText(row?.short_variant) !== BOORU_VIDEO_SHORT_VARIANT
      || !shortPath
      || !fs.existsSync(shortPath);
  }).map((row: any) => String(row?.id || "")).filter(Boolean);
}

async function readSpawnedJson(
  state: RuntimeState,
  command: string,
  args: string[],
): Promise<SpawnedJsonExecutionResult> {
  assertRuntimeStateActive(state);

  return new Promise<any>((resolve, reject) => {
    const startedAt = performance.now();
    const child = spawn(command, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      signal: state.abortController.signal,
    });
    state.childProcesses.add(child);
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      state.childProcesses.delete(child);
      callback();
    };

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk || "");
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    child.on("error", (error) => {
      finish(() => reject(error));
    });
    child.on("close", (code) => {
      const durationMs = Number((performance.now() - startedAt).toFixed(2));

      if (code !== 0) {
        finish(() => reject(Object.assign(
          new Error(String(stderr || stdout || `El proceso termino con codigo ${code}.`).trim()),
          {
            args,
            command,
            durationMs,
            exitCode: Number(code ?? -1),
            stderr,
            stdout,
          },
        )));
        return;
      }

      try {
        const result = {
          args,
          command,
          data: JSON.parse(stdout || "{}"),
          durationMs,
          exitCode: Number(code ?? 0),
          stderr,
          stdout,
        };
        finish(() => resolve(result));
      } catch (error: any) {
        finish(() => reject(Object.assign(
          new Error(`El worker de Booru devolvio JSON invalido. ${error?.message || ""}`.trim()),
          {
            args,
            command,
            durationMs,
            exitCode: Number(code ?? 0),
            stderr,
            stdout,
          },
        )));
      }
    });
  });
}

async function removeFileIfExists(filePath: string | null | undefined) {
  if (!filePath) {
    return;
  }

  try {
    await fsp.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

async function runThumbnailWorkerForResource(state: RuntimeState, resource: any) {
  if (!state.python.available) {
    throw new Error(
      state.python.error
      || "No se encontro Python para Booru. Configura pythonExecutable o asegurate de que python este disponible en PATH.",
    );
  }

  const workerPath = getBooruMediaWorkerPath();
  const mediaRuntime = await state.mediaRuntimeAccess.requireRuntime();

  if (!fs.existsSync(workerPath)) {
    throw new Error(`No se encontro el worker Python de Booru en ${workerPath}.`);
  }

  const outputPaths = getThumbnailOutputPaths(state.thumbsRoot, resource.id);
  const shortPath = path.join(state.shortsRoot, `${resource.id}.${BOORU_VIDEO_SHORT_VARIANT}.mp4`);
  await fsp.mkdir(path.dirname(outputPaths.webpPath), { recursive: true });
  await fsp.mkdir(path.dirname(shortPath), { recursive: true });

  return readSpawnedJson(state, getWorkerPythonCommand(state), [
    workerPath,
    "--source-path",
    resource.storagePath,
    "--media-kind",
    resource.mediaKind,
    "--ffmpeg-path",
    mediaRuntime.ffmpegPath,
    "--ffprobe-path",
    mediaRuntime.ffprobePath,
    "--thumbnail-webp-path",
    outputPaths.webpPath,
    "--thumbnail-jpeg-path",
    outputPaths.jpegPath,
    "--video-short-path",
    shortPath,
    "--video-short-duration-seconds",
    String(BOORU_VIDEO_SHORT_DURATION_SECONDS),
    "--max-side",
    String(THUMBNAIL_MAX_SIDE_PX),
  ]);
}

function persistThumbnailSuccessSync(
  db: DatabaseSync,
  resourceId: string,
  sourceHash: string,
  workerResult: any,
) {
  const generatedAt = nowIso();
  const thumbnailStoragePath = normalizeBooruOptionalText(workerResult?.thumbnailPath);

  db.prepare(`
    UPDATE booru_resources
    SET width = ?,
        height = ?,
        duration_ms = ?,
        media_info_status = 'ready',
        media_info_error = NULL,
        last_seen_at = ?
    WHERE id = ?
  `).run(
    Number.isFinite(Number(workerResult?.width)) ? Number(workerResult.width) : null,
    Number.isFinite(Number(workerResult?.height)) ? Number(workerResult.height) : null,
    Number.isFinite(Number(workerResult?.durationMs)) ? Number(workerResult.durationMs) : null,
    generatedAt,
    resourceId,
  );

  db.prepare(`
    INSERT INTO booru_resource_thumbnails (
      resource_id,
      storage_path,
      mime_type,
      width,
      height,
      byte_size,
      status,
      source_hash,
      generated_at,
      error_message,
      frame_timestamp_ms
    ) VALUES (?, ?, ?, ?, ?, ?, 'ready', ?, ?, NULL, ?)
    ON CONFLICT(resource_id) DO UPDATE SET
      storage_path = excluded.storage_path,
      mime_type = excluded.mime_type,
      width = excluded.width,
      height = excluded.height,
      byte_size = excluded.byte_size,
      status = 'ready',
      source_hash = excluded.source_hash,
      generated_at = excluded.generated_at,
      error_message = NULL,
      frame_timestamp_ms = excluded.frame_timestamp_ms
  `).run(
    resourceId,
    thumbnailStoragePath,
    normalizeBooruOptionalText(workerResult?.thumbnailMimeType),
    Number.isFinite(Number(workerResult?.thumbnailWidth)) ? Number(workerResult.thumbnailWidth) : null,
    Number.isFinite(Number(workerResult?.thumbnailHeight)) ? Number(workerResult.thumbnailHeight) : null,
    Number.isFinite(Number(workerResult?.thumbnailByteSize)) ? Number(workerResult.thumbnailByteSize) : null,
    sourceHash,
    generatedAt,
    Number.isFinite(Number(workerResult?.frameTimestampMs)) ? Number(workerResult.frameTimestampMs) : null,
  );

  const shortPath = normalizeBooruOptionalText(workerResult?.shortPath);
  const shortError = normalizeBooruOptionalText(workerResult?.shortError);
  if (shouldGenerateBooruVideoShort("video", workerResult?.durationMs)) {
    db.prepare(`
      INSERT INTO booru_resource_video_shorts (resource_id, storage_path, status, variant, generated_at, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(resource_id) DO UPDATE SET
        storage_path = excluded.storage_path,
        status = excluded.status,
        variant = excluded.variant,
        generated_at = excluded.generated_at,
        error_message = excluded.error_message
    `).run(
      resourceId,
      shortPath,
      shortPath ? "ready" : (shortError ? "error" : "pending"),
      BOORU_VIDEO_SHORT_VARIANT,
      generatedAt,
      shortError,
    );
  } else {
    db.prepare(`DELETE FROM booru_resource_video_shorts WHERE resource_id = ?`).run(resourceId);
  }
}

function persistThumbnailErrorSync(
  db: DatabaseSync,
  resourceId: string,
  sourceHash: string,
  errorMessage: string,
) {
  const normalizedMessage = String(errorMessage || "No se pudo generar la preview.").trim();

  db.prepare(`
    UPDATE booru_resources
    SET media_info_status = 'error',
        media_info_error = ?,
        last_seen_at = ?
    WHERE id = ?
  `).run(normalizedMessage, nowIso(), resourceId);

  db.prepare(`
    INSERT INTO booru_resource_thumbnails (
      resource_id,
      storage_path,
      mime_type,
      width,
      height,
      byte_size,
      status,
      source_hash,
      generated_at,
      error_message,
      frame_timestamp_ms
    ) VALUES (?, NULL, NULL, NULL, NULL, NULL, 'error', ?, ?, ?, NULL)
    ON CONFLICT(resource_id) DO UPDATE SET
      status = 'error',
      source_hash = excluded.source_hash,
      generated_at = excluded.generated_at,
      error_message = excluded.error_message
  `).run(resourceId, sourceHash, nowIso(), normalizedMessage);
}

function queueThumbnailGeneration(resourceIds: string[], priority: "high" | "low" = "low") {
  const state = runtimeState;

  if (!isRuntimeStateActive(state) || state.mediaRuntimeAccess.isUnavailable()) {
    return;
  }

  let queuedAny = false;
  let queuedCount = 0;

  for (const resourceId of uniqueBooruIds(resourceIds)) {
    if (!resourceId || state.thumbnailProcessingIds.has(resourceId)) {
      continue;
    }

    if (state.thumbnailQueuedIds.has(resourceId)) {
      if (priority === "high") {
        state.thumbnailLowPriorityIds = state.thumbnailLowPriorityIds.filter((queuedId) => queuedId !== resourceId);
        if (!state.thumbnailHighPriorityIds.includes(resourceId)) {
          state.thumbnailHighPriorityIds.unshift(resourceId);
        }
      }
      continue;
    }

    const resource = getResourceByIdSync(state.db, resourceId);

    if (!resource || !shouldGenerateThumbnailSync(
      resource,
      getThumbnailRowSync(state.db, resourceId),
      getVideoShortRowSync(state.db, resourceId),
    )) {
      continue;
    }

    state.thumbnailQueuedIds.add(resourceId);
    queuedAny = true;
    queuedCount += 1;
    if (priority === "high") {
      state.thumbnailHighPriorityIds.unshift(resourceId);
    } else {
      state.thumbnailLowPriorityIds.push(resourceId);
    }
  }

  if (queuedAny && state.python.available) {
    if (!state.thumbnailTaskActive) {
      state.thumbnailTaskActive = true;
      state.thumbnailTaskTotal = 0;
      state.thumbnailTaskCompleted = 0;
      state.thumbnailTaskFailed = 0;
      state.ctx.tasks.start({
        id: "booru.thumbnails",
        title: "Creando thumbnails",
        detail: "Preparando previews de Booru",
        progress: {
          current: 0,
          total: queuedCount,
          label: "previews",
        },
      });
    }
    state.thumbnailTaskTotal += queuedCount;
    state.ctx.tasks.update("booru.thumbnails", {
      detail: `${state.thumbnailTaskTotal - state.thumbnailTaskCompleted - state.thumbnailTaskFailed} pendientes`,
      progress: {
        current: state.thumbnailTaskCompleted + state.thumbnailTaskFailed,
        total: state.thumbnailTaskTotal,
        label: "previews",
      },
    });
    booruBackendLogger.debug(
      "booru.thumbnail.queue.enqueued",
      "Booru encolo recursos para generar thumbnails.",
      {
        priority,
        requestedCount: uniqueBooruIds(resourceIds).length,
        queuedHighPriorityCount: state.thumbnailHighPriorityIds.length,
        queuedLowPriorityCount: state.thumbnailLowPriorityIds.length,
        processingCount: state.thumbnailProcessingIds.size,
        sampleIds: summarizeIdsForLog(resourceIds),
      },
    );
    scheduleRuntimeInvalidationForState(state, "metricsVersion");
  }

  void pumpThumbnailQueue();
}

function stopThumbnailQueueForSystemicFailure(state: RuntimeState, errorMessage: string) {
  const droppedCount = state.thumbnailHighPriorityIds.length + state.thumbnailLowPriorityIds.length;
  state.thumbnailHighPriorityIds = [];
  state.thumbnailLowPriorityIds = [];
  state.thumbnailQueuedIds.clear();
  state.thumbnailTaskFailed += droppedCount;
  state.thumbnailLastError = errorMessage;
}

function dequeueNextThumbnailResourceId(state: RuntimeState) {
  const nextHighPriorityId = state.thumbnailHighPriorityIds.shift();

  if (nextHighPriorityId) {
    state.thumbnailQueuedIds.delete(nextHighPriorityId);
    return nextHighPriorityId;
  }

  const nextLowPriorityId = state.thumbnailLowPriorityIds.shift();

  if (nextLowPriorityId) {
    state.thumbnailQueuedIds.delete(nextLowPriorityId);
    return nextLowPriorityId;
  }

  return "";
}

async function processThumbnailQueueEntry(state: RuntimeState, resourceId: string) {
  assertRuntimeStateActive(state);

  const resource = getResourceByIdSync(state.db, resourceId);

  if (!resource) {
    return true;
  }

  const thumbnailRow = getThumbnailRowSync(state.db, resourceId);
  const previousVideoShortRow = getVideoShortRowSync(state.db, resourceId);

  if (!shouldGenerateThumbnailSync(resource, thumbnailRow, previousVideoShortRow)) {
    return true;
  }

  ensureThumbnailPendingRowSync(state.db, resourceId, resource.contentHash);
  const outputPaths = getThumbnailOutputPaths(state.thumbsRoot, resourceId);
  const startedAt = performance.now();
  booruBackendLogger.debug(
    "booru.thumbnail.worker.start",
    "Booru inicio el worker de thumbnail para un recurso.",
    {
      resourceId,
      mediaKind: resource.mediaKind,
      storagePath: resource.storagePath,
      originalFilename: resource.originalFilename,
      existingThumbnailStatus: normalizeThumbnailStatus(thumbnailRow?.status),
      outputWebpPath: outputPaths.webpPath,
      outputJpegPath: outputPaths.jpegPath,
    },
  );

  try {
    const workerExecution = await runThumbnailWorkerForResource(state, resource);
    assertRuntimeStateActive(state);
    const workerResult = workerExecution.data;
    withTransaction(state.db, () => {
      persistThumbnailSuccessSync(state.db!, resourceId, resource.contentHash, workerResult);
    });
    state.thumbnailLastError = "";
    const thumbnailPath = normalizeBooruOptionalText(workerResult?.thumbnailPath);

    if (thumbnailPath !== outputPaths.webpPath) {
      await removeFileIfExists(outputPaths.webpPath);
    }

    if (thumbnailPath !== outputPaths.jpegPath) {
      await removeFileIfExists(outputPaths.jpegPath);
    }

    const nextShortPath = normalizeBooruOptionalText(workerResult?.shortPath);
    const previousShortPath = normalizeBooruOptionalText(previousVideoShortRow?.storage_path);
    if (previousShortPath && previousShortPath !== nextShortPath) {
      await removeFileIfExists(previousShortPath);
    }

    logBackendDuration(
      "booru.thumbnail.worker.done",
      "Booru resolvio el worker de thumbnail para un recurso.",
      performance.now() - startedAt,
      {
        resourceId,
        mediaKind: resource.mediaKind,
        storagePath: resource.storagePath,
        thumbnailPath,
        thumbnailMimeType: normalizeBooruOptionalText(workerResult?.thumbnailMimeType),
        width: Number.isFinite(Number(workerResult?.width)) ? Number(workerResult.width) : null,
        height: Number.isFinite(Number(workerResult?.height)) ? Number(workerResult.height) : null,
        durationMsOriginal: Number.isFinite(Number(workerResult?.durationMs)) ? Number(workerResult.durationMs) : null,
        thumbnailWidth: Number.isFinite(Number(workerResult?.thumbnailWidth)) ? Number(workerResult.thumbnailWidth) : null,
        thumbnailHeight: Number.isFinite(Number(workerResult?.thumbnailHeight)) ? Number(workerResult.thumbnailHeight) : null,
        stderrLength: workerExecution.stderr.length,
        stderrSnippet: /error|invalid|decode|cannot/i.test(workerExecution.stderr || "")
          ? truncateDiagnosticText(workerExecution.stderr)
          : "",
      },
    );
    return true;
  } catch (error: any) {
    if (isRuntimeCancellation(error) || !isRuntimeStateActive(state)) {
      return false;
    }

    const errorMessage =
      error instanceof Error ? error.message : "No se pudo generar la thumbnail de Booru.";
    withTransaction(state.db, () => {
      persistThumbnailErrorSync(state.db!, resourceId, resource.contentHash, errorMessage);
    });
    state.thumbnailLastError = errorMessage;
    const workerFailurePayload = {
      resourceId,
      mediaKind: resource.mediaKind,
      storagePath: resource.storagePath,
      originalFilename: resource.originalFilename,
      outputWebpPath: outputPaths.webpPath,
      outputJpegPath: outputPaths.jpegPath,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      errorMessage,
      command: typeof error?.command === "string" ? error.command : getWorkerPythonCommand(state),
      args: Array.isArray(error?.args) ? error.args : [],
      exitCode: Number.isFinite(Number(error?.exitCode)) ? Number(error.exitCode) : null,
      stderrSnippet: truncateDiagnosticText(error?.stderr),
      stdoutSnippet: truncateDiagnosticText(error?.stdout),
    };
    const systemicFailure = isSystemicMediaRuntimeError(error)
      || /No se encontro (Python|worker)|Configura pythonExecutable/i.test(errorMessage);
    if (systemicFailure) {
      stopThumbnailQueueForSystemicFailure(state, errorMessage);
    }
    booruBackendLogger[systemicFailure ? "warn" : "info"](
      "booru.thumbnail.worker.error",
      "Booru no pudo generar la thumbnail de un recurso.",
      workerFailurePayload,
    );
    return false;
  }
}

function syncThumbnailRuntimeTask(state: RuntimeState) {
  if (!state.thumbnailTaskActive || !isRuntimeStateActive(state)) {
    return;
  }

  const processedCount = state.thumbnailTaskCompleted + state.thumbnailTaskFailed;
  const pendingCount = Math.max(0, state.thumbnailTaskTotal - processedCount);
  const patch = {
    detail: pendingCount > 0
      ? `${pendingCount} ${pendingCount === 1 ? "preview pendiente" : "previews pendientes"}`
      : state.thumbnailTaskFailed > 0
        ? `${state.thumbnailTaskFailed} ${state.thumbnailTaskFailed === 1 ? "preview con error" : "previews con error"}`
        : "Finalizando previews",
    progress: {
      current: processedCount,
      total: state.thumbnailTaskTotal,
      label: "previews",
    },
  };

  state.ctx.tasks.update("booru.thumbnails", patch);

  if (state.thumbnailTaskFailed > 0) {
    state.ctx.tasks.fail("booru.thumbnails", {
      message: "Algunas thumbnails no pudieron crearse.",
      detail: patch.detail,
    });
  }

  const queueEmpty =
    state.thumbnailHighPriorityIds.length === 0
    && state.thumbnailLowPriorityIds.length === 0
    && state.thumbnailProcessingIds.size === 0;

  if (!queueEmpty) {
    return;
  }

  if (state.thumbnailTaskFailed === 0) {
    state.ctx.tasks.complete("booru.thumbnails");
  }
  state.thumbnailTaskActive = false;
}

async function pumpThumbnailQueue() {
  const state = runtimeState;

  if (!isRuntimeStateActive(state) || !state.python.available) {
    return;
  }

  if (
    !state.thumbnailTaskActive
    && (state.thumbnailHighPriorityIds.length || state.thumbnailLowPriorityIds.length)
  ) {
    state.thumbnailTaskActive = true;
    state.thumbnailTaskTotal =
      state.thumbnailHighPriorityIds.length + state.thumbnailLowPriorityIds.length;
    state.thumbnailTaskCompleted = 0;
    state.thumbnailTaskFailed = 0;
    state.ctx.tasks.start({
      id: "booru.thumbnails",
      title: "Creando thumbnails",
      detail: `${state.thumbnailTaskTotal} ${state.thumbnailTaskTotal === 1 ? "preview pendiente" : "previews pendientes"}`,
      progress: {
        current: 0,
        total: state.thumbnailTaskTotal,
        label: "previews",
      },
    });
  }

  while (
    state.thumbnailProcessingIds.size < THUMBNAIL_CONCURRENCY
    && (state.thumbnailHighPriorityIds.length || state.thumbnailLowPriorityIds.length)
  ) {
    const nextResourceId = dequeueNextThumbnailResourceId(state);

    if (!nextResourceId || state.thumbnailProcessingIds.has(nextResourceId)) {
      continue;
    }

    state.thumbnailProcessingIds.add(nextResourceId);
    scheduleRuntimeInvalidationForState(state, "metricsVersion");
    let workerSucceeded = false;
    const task = processThumbnailQueueEntry(state, nextResourceId)
      .then((succeeded) => {
        workerSucceeded = Boolean(succeeded);
      })
      .catch((error) => {
        if (!isRuntimeCancellation(error) && isRuntimeStateActive(state)) {
          booruBackendLogger.error(
            "booru.thumbnail.worker.unhandled",
            "Booru encontro un error inesperado en la cola de thumbnails.",
            { resourceId: nextResourceId, error },
          );
        }
      })
      .finally(() => {
        if (workerSucceeded) {
          state.thumbnailTaskCompleted += 1;
        } else {
          state.thumbnailTaskFailed += 1;
        }
        state.thumbnailProcessingIds.delete(nextResourceId);
        syncThumbnailRuntimeTask(state);
        scheduleRuntimeInvalidationForState(state, "thumbnailsVersion");
        scheduleRuntimeInvalidationForState(state, "metricsVersion");
        if (isRuntimeStateActive(state)) {
          void pumpThumbnailQueue();
        }
      });
    trackRuntimeBackgroundTask(state, task);
  }
}

function createRuntimeState(ctx: NexusBackendPluginContext): RuntimeState {
  const storagePaths = getStoragePaths(ctx);

  return {
    generation: crypto.randomUUID(),
    shuttingDown: false,
    abortController: new AbortController(),
    childProcesses: new Set<any>(),
    backgroundTasks: new Set<Promise<unknown>>(),
    ctx,
    storageRoot: storagePaths.storageRoot,
    catalogPath: storagePaths.catalogPath,
    mediaRoot: storagePaths.mediaRoot,
    duplicatesRoot: storagePaths.duplicatesRoot,
    thumbsRoot: storagePaths.thumbsRoot,
    shortsRoot: storagePaths.shortsRoot,
    watcher: null,
    watcherState: {
      active: false,
      stage: "idle",
      watchedPath: "",
      lastError: "",
      lastIngestedAt: null,
      lastIngestedOriginalFilename: null,
      lastIngestedStoragePath: null,
      pendingCount: 0,
    },
    python: {
      available: false,
      command: "python",
      resolvedExecutable: null,
      error: null,
    },
    mediaRuntimeAccess: createBooruMediaRuntimeAccess(ctx),
    queue: Promise.resolve(),
    queuedPaths: new Set<string>(),
    ingestByContentHash: createBooruKeyedSerialExecutor(),
    thumbnailHighPriorityIds: [],
    thumbnailLowPriorityIds: [],
    thumbnailQueuedIds: new Set<string>(),
    thumbnailProcessingIds: new Set<string>(),
    thumbnailLastError: "",
    thumbnailTaskActive: false,
    thumbnailTaskTotal: 0,
    thumbnailTaskCompleted: 0,
    thumbnailTaskFailed: 0,
    ingestTaskActive: false,
    ingestTaskTotal: 0,
    ingestTaskCompleted: 0,
    ingestTaskFailed: 0,
    invalidationVersion: 1,
    pendingInvalidations: new Set<RuntimeInvalidationKey>(),
    invalidationTimer: null,
    invalidationDelayMs: 0,
    db: null,
    fastClassification: null,
  };
}

function buildResourcesSnapshot(ctx: NexusBackendPluginContext, settingsValue: Record<string, unknown>) {
  const state = runtimeState;

  if (!state || !state.db) {
    const storagePaths = getStoragePaths(ctx);

    return {
      pluginId: BOORU_PLUGIN_ID,
      settings: normalizeBooruSettings(settingsValue),
      python: {
        available: false,
        command: "python",
        resolvedExecutable: null,
        error: "Booru todavia no inicializo su runtime interno.",
      },
      watcher: {
        active: false,
        stage: "idle",
        watchedPath: "",
        lastError: "Booru todavia no inicializo su runtime interno.",
        lastIngestedAt: null,
        lastIngestedOriginalFilename: null,
        lastIngestedStoragePath: null,
        pendingCount: 0,
      },
      storage: {
        root: storagePaths.storageRoot,
        catalogPath: storagePaths.catalogPath,
        mediaRoot: storagePaths.mediaRoot,
        duplicatesRoot: storagePaths.duplicatesRoot,
        thumbsRoot: storagePaths.thumbsRoot,
        shortsRoot: storagePaths.shortsRoot,
      },
      stats: {
        totalCount: 0,
        duplicateCount: 0,
        pendingCount: 0,
        unclassifiedCount: 0,
        classifiedBasicCount: 0,
        trashCount: 0,
        imageCount: 0,
        videoCount: 0,
        gifCount: 0,
        thumbnailPendingCount: 0,
        thumbnailReadyCount: 0,
        thumbnailErrorCount: 0,
        thumbnailBacklogCount: 0,
      },
      derivatives: {
        activeCount: 0,
        highPriorityCount: 0,
        lowPriorityCount: 0,
        lastError: "",
      },
      library: [],
      pending: [],
      duplicates: [],
      trash: [],
    };
  }

  return {
    pluginId: BOORU_PLUGIN_ID,
    settings: normalizeBooruSettings(settingsValue),
    python: state.python,
    watcher: {
      ...state.watcherState,
    },
    storage: {
      root: state.storageRoot,
      catalogPath: state.catalogPath,
      mediaRoot: state.mediaRoot,
      duplicatesRoot: state.duplicatesRoot,
      thumbsRoot: state.thumbsRoot,
      shortsRoot: state.shortsRoot,
    },
    stats: readStats(state.db),
    derivatives: {
      activeCount: state.thumbnailProcessingIds.size,
      highPriorityCount: state.thumbnailHighPriorityIds.length,
      lowPriorityCount: state.thumbnailLowPriorityIds.length,
      lastError: state.thumbnailLastError,
    },
    library: [],
    pending: [],
    duplicates: [],
    trash: [],
  };
}

function getVisibleResourceDescriptorSync(db: DatabaseSync, resourceId: string | null) {
  const normalizedResourceId = normalizeBooruOptionalText(resourceId);

  if (!normalizedResourceId) {
    return null;
  }

  const row = db.prepare(`
    SELECT
      r.id,
      r.storage_path,
      r.media_kind,
      th.storage_path AS thumbnail_storage_path,
      th.status AS thumbnail_status
    FROM booru_resources AS r
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE r.id = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
    LIMIT 1
  `).get(normalizedResourceId);

  if (!row) {
    return null;
  }

  const thumbnailReady = normalizeThumbnailStatus(row?.thumbnail_status) === "ready";

  return {
    sampleResourceId: String(row.id || ""),
    originalStoragePath: String(row.storage_path || ""),
    originalMediaKind: normalizeBooruOptionalText(row.media_kind),
    storagePath: String(row.storage_path || ""),
    sampleStoragePath: thumbnailReady
      ? (normalizeBooruOptionalText(row?.thumbnail_storage_path) || String(row.storage_path || ""))
      : String(row.storage_path || ""),
    sampleMediaKind: thumbnailReady
      ? "image"
      : normalizeBooruOptionalText(row.media_kind),
  };
}

function buildVisibleResourceDescriptorFromRow(row: any) {
  if (!row) {
    return {
      sampleResourceId: null,
      originalStoragePath: null,
      originalMediaKind: null,
      storagePath: null,
      sampleStoragePath: null,
      sampleMediaKind: null,
    };
  }

  const thumbnailReady = normalizeThumbnailStatus(row?.thumbnail_status) === "ready";

  return {
    sampleResourceId: normalizeBooruOptionalText(row?.id),
    originalStoragePath: normalizeBooruOptionalText(row?.storage_path),
    originalMediaKind: normalizeBooruOptionalText(row?.media_kind),
    storagePath: normalizeBooruOptionalText(row?.storage_path),
    sampleStoragePath: thumbnailReady
      ? (normalizeBooruOptionalText(row?.thumbnail_storage_path) || normalizeBooruOptionalText(row?.storage_path))
      : normalizeBooruOptionalText(row?.storage_path),
    sampleMediaKind: thumbnailReady
      ? "image"
      : normalizeBooruOptionalText(row?.media_kind),
  };
}

function listEntityConsumerResourcesSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
) {
  if (kind === "universe") {
    return db.prepare(`
      SELECT DISTINCT
        r.id,
        r.storage_path,
        r.media_kind,
        r.imported_at,
        th.storage_path AS thumbnail_storage_path,
        th.status AS thumbnail_status
      FROM booru_resources r
      LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
      LEFT JOIN booru_resource_universes rru
        ON rru.resource_id = r.id
       AND rru.universe_id = ?
      LEFT JOIN booru_resource_characters rchar
        ON rchar.resource_id = r.id
      LEFT JOIN booru_character_universes cuni
        ON cuni.character_id = rchar.character_id
       AND cuni.universe_id = ?
      WHERE r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
        AND (rru.universe_id IS NOT NULL OR cuni.universe_id IS NOT NULL)
      ORDER BY r.imported_at DESC, r.id ASC
    `).all(entityId, entityId);
  }

  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);

  if (!relationTable || !relationEntityIdColumn) {
    return [];
  }

  return db.prepare(`
    SELECT DISTINCT
      r.id,
      r.storage_path,
      r.media_kind,
      r.imported_at,
      th.storage_path AS thumbnail_storage_path,
      th.status AS thumbnail_status
    FROM ${relationTable} rel
    INNER JOIN booru_resources r ON r.id = rel.resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE rel.${relationEntityIdColumn} = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
    ORDER BY r.imported_at DESC, rel.sort_order ASC, r.id ASC
  `).all(entityId);
}

function getStableSampleIndex(seed: string, size: number) {
  if (!size) {
    return 0;
  }

  let hashValue = 0;

  for (const character of String(seed || "")) {
    hashValue = ((hashValue << 5) - hashValue) + character.charCodeAt(0);
    hashValue |= 0;
  }

  return Math.abs(hashValue) % size;
}

function getEntitySampleDescriptorSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
  coverResourceId: string | null,
) {
  const explicitCover = getVisibleResourceDescriptorSync(db, coverResourceId);

  if (explicitCover) {
    return explicitCover;
  }

  const candidates = listEntityConsumerResourcesSync(db, kind, entityId);

  if (!candidates.length) {
    return {
      sampleResourceId: null,
      sampleStoragePath: null,
      sampleMediaKind: null,
    };
  }

  const imageFirstCandidates = candidates.filter((candidate: any) => String(candidate?.media_kind || "") !== "video");
  const samplePool = imageFirstCandidates.length ? imageFirstCandidates : candidates;
  const selected = samplePool[getStableSampleIndex(entityId, samplePool.length)] || samplePool[0];

  return buildVisibleResourceDescriptorFromRow(selected);
}

function getFirstVisibleResourceDescriptorSync(
  db: DatabaseSync,
  resourceIds: Array<string | null | undefined>,
) {
  for (const resourceId of resourceIds) {
    const descriptor = getVisibleResourceDescriptorSync(db, normalizeBooruOptionalText(resourceId));

    if (descriptor) {
      return descriptor;
    }
  }

  return null;
}

function pickEntityVisualDescriptorSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
  explicitResourceIds: Array<string | null | undefined>,
  variant: "sample" | "banner" | "avatar",
) {
  const explicitVisual = getFirstVisibleResourceDescriptorSync(db, explicitResourceIds);

  if (explicitVisual) {
    return explicitVisual;
  }

  const candidates = listEntityConsumerResourcesSync(db, kind, entityId);

  if (!candidates.length) {
    return {
      sampleResourceId: null,
      sampleStoragePath: null,
      sampleMediaKind: null,
    };
  }

  const imageFirstCandidates = candidates.filter((candidate: any) => String(candidate?.media_kind || "") !== "video");
  const samplePool = imageFirstCandidates.length ? imageFirstCandidates : candidates;
  const baseIndex = getStableSampleIndex(`${entityId}:${variant}`, samplePool.length);
  let selected = samplePool[baseIndex] || samplePool[0];

  if (variant === "banner" && samplePool.length > 1) {
    const avatarIndex = getStableSampleIndex(`${entityId}:avatar`, samplePool.length);

    if (avatarIndex === baseIndex) {
      selected = samplePool[(baseIndex + 1) % samplePool.length] || selected;
    }
  }

  return buildVisibleResourceDescriptorFromRow(selected);
}

function resolveEntityVisualProjectionSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
  baseRow: any,
  role: BooruEntityVisualRole,
  layout: BooruEntityVisualLayout,
) {
  const explicitCandidates = role === "banner"
    ? [
      { resourceId: normalizeBooruOptionalText(baseRow?.banner_resource_id), selection: "banner" },
      { resourceId: normalizeBooruOptionalText(baseRow?.cover_resource_id), selection: "cover" },
    ]
    : [
      { resourceId: normalizeBooruOptionalText(baseRow?.avatar_resource_id), selection: "avatar" },
      { resourceId: normalizeBooruOptionalText(baseRow?.cover_resource_id), selection: "cover" },
    ];

  for (const candidate of explicitCandidates) {
    const descriptor = getVisibleResourceDescriptorSync(db, candidate.resourceId);

    if (descriptor) {
      return createBooruEntityVisualProjection({
        role,
        descriptor,
        layout,
        selection: candidate.selection,
      });
    }
  }

  return createBooruEntityVisualProjection({
    role,
    descriptor: pickEntityVisualDescriptorSync(db, kind, entityId, [], role),
    layout,
    selection: "derived",
  });
}

function getEntityBaseRowByIdSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  return getEntityBaseRows(db, kind).find((row: any) => String(row?.id || "") === entityId) || null;
}

function getUniverseCharacterCountSync(db: DatabaseSync, universeId: string) {
  const row = db.prepare(`
    SELECT COUNT(DISTINCT cu.character_id) AS character_count
    FROM booru_character_universes cu
    WHERE cu.universe_id = ?
  `).get(universeId);

  return Number(row?.character_count || 0);
}

function getUniverseDirectResourceCountSync(db: DatabaseSync, universeId: string) {
  const row = db.prepare(`
    SELECT COUNT(DISTINCT r.id) AS resource_count
    FROM booru_resource_universes rel
    INNER JOIN booru_resources r ON r.id = rel.resource_id
    WHERE rel.universe_id = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
  `).get(universeId);

  return Number(row?.resource_count || 0);
}

function getUniverseInheritedResourceCountSync(db: DatabaseSync, universeId: string) {
  const row = db.prepare(`
    SELECT COUNT(DISTINCT r.id) AS resource_count
    FROM booru_character_universes cu
    INNER JOIN booru_resource_characters rc ON rc.character_id = cu.character_id
    INNER JOIN booru_resources r ON r.id = rc.resource_id
    WHERE cu.universe_id = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM booru_resource_universe_exclusions excluded
        WHERE excluded.resource_id = r.id
          AND excluded.universe_id = cu.universe_id
      )
  `).get(universeId);

  return Number(row?.resource_count || 0);
}

function getEntityProfileSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  const baseRow = getEntityBaseRowByIdSync(db, kind, entityId);

  if (!baseRow) {
    return null;
  }

  const normalizedRow = normalizeEntityRow(db, kind, baseRow);
  const coverResourceId = normalizeBooruOptionalText(baseRow?.cover_resource_id);
  const avatarResourceId = normalizeBooruOptionalText(baseRow?.avatar_resource_id);
  const bannerResourceId = normalizeBooruOptionalText(baseRow?.banner_resource_id);
  const sample = pickEntityVisualDescriptorSync(db, kind, entityId, [coverResourceId], "sample");
  const banner = pickEntityVisualDescriptorSync(
    db,
    kind,
    entityId,
    [bannerResourceId, coverResourceId],
    "banner",
  );
  const avatar = pickEntityVisualDescriptorSync(
    db,
    kind,
    entityId,
    [avatarResourceId, coverResourceId],
    "avatar",
  );
  const createdAt = String(baseRow?.created_at || "");
  const visualSettings = parseEntityVisualSettings(baseRow?.visual_settings_json);
  const avatarVisual = normalizedRow.visual || resolveEntityVisualProjectionSync(
    db,
    kind,
    entityId,
    baseRow,
    "avatar",
    visualSettings.avatar,
  );
  const bannerVisual = resolveEntityVisualProjectionSync(
    db,
    kind,
    entityId,
    baseRow,
    "banner",
    visualSettings.banner,
  );
  const profile = {
    kind,
    id: normalizedRow.id,
    displayName: normalizedRow.displayName,
    slug: normalizedRow.slug,
    coverResourceId: normalizedRow.coverResourceId,
    avatarResourceId: normalizedRow.avatarResourceId,
    bannerResourceId: normalizedRow.bannerResourceId,
    createdAt,
    resourceCount: normalizedRow.resourceCount,
    sample,
    banner,
    avatar,
    visual: avatarVisual,
    visuals: {
      avatar: avatarVisual,
      banner: bannerVisual,
    },
    visualSettings,
    tags: listEntityTagsSync(db, kind, entityId),
    aliases: kind === "author" || kind === "artist" ? listEntityAliasesSync(db, kind, entityId) : [],
    socialLinks: kind === "author" || kind === "artist" ? listEntitySocialLinksSync(db, kind, entityId) : [],
    metadata: {
      createdAt,
      visualSettings,
    } as Record<string, any>,
  };

  if (kind === "character") {
    return {
      ...profile,
      universe: normalizedRow.universe || null,
      metadata: {
        ...profile.metadata,
        universe: normalizedRow.universe || null,
      },
    };
  }

  if (kind === "universe") {
    const characterCount = getUniverseCharacterCountSync(db, entityId);
    const directResourceCount = getUniverseDirectResourceCountSync(db, entityId);
    const inheritedResourceCount = getUniverseInheritedResourceCountSync(db, entityId);

    return {
      ...profile,
      metadata: {
        ...profile.metadata,
        characterCount,
        directResourceCount,
        inheritedResourceCount,
      },
    };
  }

  return profile;
}

function getEntityBaseRows(db: DatabaseSync, kind: BooruEntityKind) {
  if (kind === "universe") {
    return db.prepare(`
      SELECT
        e.*,
        (
          SELECT COUNT(*)
          FROM (
            SELECT r.id
            FROM booru_resource_universes rru
            INNER JOIN booru_resources r ON r.id = rru.resource_id
            WHERE rru.universe_id = e.id
              AND r.classification_state != 'duplicate-review'
              AND r.trashed_at IS NULL
            UNION
            SELECT r.id
            FROM booru_character_universes cu
            INNER JOIN booru_resource_characters rc ON rc.character_id = cu.character_id
            INNER JOIN booru_resources r ON r.id = rc.resource_id
            WHERE cu.universe_id = e.id
              AND r.classification_state != 'duplicate-review'
              AND r.trashed_at IS NULL
              AND NOT EXISTS (
                SELECT 1
                FROM booru_resource_universe_exclusions excluded
                WHERE excluded.resource_id = r.id
                  AND excluded.universe_id = cu.universe_id
              )
          ) counted
        ) AS resource_count
      FROM booru_universes e
      ORDER BY e.display_name COLLATE NOCASE ASC
    `).all();
  }

  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);

  if (!relationTable || !relationEntityIdColumn) {
    return db.prepare(`
      SELECT
        e.*,
        0 AS resource_count
      FROM ${getEntityTable(kind)} e
      ORDER BY e.display_name COLLATE NOCASE ASC
    `).all();
  }

  return db.prepare(`
    SELECT
      e.*,
      COUNT(DISTINCT rsrc.id) AS resource_count
    FROM ${getEntityTable(kind)} e
    LEFT JOIN ${relationTable} rel ON rel.${relationEntityIdColumn} = e.id
    LEFT JOIN booru_resources rsrc
      ON rsrc.id = rel.resource_id
     AND rsrc.classification_state != 'duplicate-review'
     AND rsrc.trashed_at IS NULL
    GROUP BY e.id
    ORDER BY e.display_name COLLATE NOCASE ASC
  `).all();
}

function normalizeEntityRow(db: DatabaseSync, kind: BooruEntityKind, row: any) {
  const sampleDescriptor = getEntitySampleDescriptorSync(
    db,
    kind,
    String(row?.id || ""),
    normalizeBooruOptionalText(row?.cover_resource_id),
  );
  const entityId = String(row?.id || "");
  const visualSettings = parseEntityVisualSettings(row?.visual_settings_json);
  const visual = resolveEntityVisualProjectionSync(
    db,
    kind,
    entityId,
    row,
    "avatar",
    visualSettings.avatar,
  );
  const visualSource = visual?.source || null;
  const baseRow = {
    id: entityId,
    kind,
    displayName: String(row?.display_name || "").trim(),
    slug: String(row?.slug || "").trim(),
    coverResourceId: normalizeBooruOptionalText(row?.cover_resource_id),
    avatarResourceId: normalizeBooruOptionalText(row?.avatar_resource_id),
    bannerResourceId: normalizeBooruOptionalText(row?.banner_resource_id),
    createdAt: String(row?.created_at || ""),
    resourceCount: Number(row?.resource_count || 0),
    sampleResourceId: sampleDescriptor.sampleResourceId,
    sampleOriginalStoragePath: sampleDescriptor.originalStoragePath,
    sampleStoragePath: sampleDescriptor.sampleStoragePath,
    sampleMediaKind: sampleDescriptor.sampleMediaKind,
    visual,
    visualSettings,
    cardResourceId: visualSource?.resourceId || null,
    cardStoragePath: visualSource?.pathValue || null,
    cardOriginalStoragePath: visualSource?.pathValue || null,
    cardOriginalMediaKind: visualSource?.mediaKind || null,
    cardPreviewPath: visualSource?.previewPath || null,
    cardMediaKind: visualSource?.mediaKind || null,
  };

  if (kind === "character") {
    return {
      ...baseRow,
      universe: getCharacterUniverseRecordSync(db, baseRow.id),
    };
  }

  return baseRow;
}

function getEntityQueryScore(row: any, comparableQuery: string, slugQuery: string) {
  const displayComparable = normalizeBooruComparableText(row?.display_name);
  const rowSlug = normalizeBooruText(row?.slug).toLowerCase();

  if (comparableQuery && displayComparable === comparableQuery) {
    return 300;
  }

  if (slugQuery && rowSlug === slugQuery) {
    return 280;
  }

  if (comparableQuery && displayComparable.startsWith(comparableQuery)) {
    return 220;
  }

  if (slugQuery && rowSlug.startsWith(slugQuery)) {
    return 200;
  }

  if (comparableQuery && displayComparable.includes(comparableQuery)) {
    return 140;
  }

  if (slugQuery && rowSlug.includes(slugQuery)) {
    return 120;
  }

  return 0;
}

function getEntityAliasQueryScoreSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string, comparableQuery: string) {
  if (!comparableQuery) return 0;
  const aliases = listEntityAliasesSync(db, kind, entityId);
  return aliases.reduce((bestScore, alias) => Math.max(bestScore, getEntityQueryScore({ display_name: alias, slug: alias }, comparableQuery, "")), 0);
}

function getEntityTagQueryScoreSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string, comparableQuery: string) {
  if (!comparableQuery) return 0;

  return listEntityTagsSync(db, kind, entityId).reduce((bestScore, tag) => {
    const tagComparable = normalizeBooruComparableText(tag?.name);
    let score = 0;

    if (tagComparable === comparableQuery) score = 180;
    else if (tagComparable.startsWith(comparableQuery)) score = 120;
    else if (tagComparable.includes(comparableQuery)) score = 80;

    return Math.max(bestScore, score);
  }, 0);
}

function getEntitySearchScoreSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  row: any,
  comparableQuery: string,
  slugQuery: string,
) {
  const entityId = String(row?.id || "");
  return Math.max(
    getEntityQueryScore(row, comparableQuery, slugQuery),
    getEntityAliasQueryScoreSync(db, kind, entityId, comparableQuery),
    getEntityTagQueryScoreSync(db, kind, entityId, comparableQuery),
  );
}

function listEntitiesSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  query: string | null = null,
) {
  const queryTerms = normalizeBooruFreeTextTerms(query);
  const scoreForRow = (row: any) => queryTerms.reduce((bestScore, term) => Math.max(
    bestScore,
    getEntitySearchScoreSync(db, kind, row, term, normalizeBooruText(normalizeBooruSlug(term, "")).toLowerCase()),
  ), 0);
  const rows = getEntityBaseRows(db, kind);
  const filteredRows = queryTerms.length
    ? rows
      .filter((row) => scoreForRow(row) > 0)
      .sort((left, right) => {
        const leftScore = scoreForRow(left);
        const rightScore = scoreForRow(right);

        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }

        if (Number(right?.resource_count || 0) !== Number(left?.resource_count || 0)) {
          return Number(right?.resource_count || 0) - Number(left?.resource_count || 0);
        }

        return String(left?.display_name || "").localeCompare(String(right?.display_name || ""), "es-AR");
      })
    : rows;

  return filteredRows.map((row) => normalizeEntityRow(db, kind, row));
}

function filterEntitiesByExactFiltersSync(db: DatabaseSync, kind: BooruEntityKind, items: any[], rawFilters: unknown) {
  const filters = Array.isArray(rawFilters) ? rawFilters : [];
  if (!filters.length) return items;

  return items.filter((item) => filters.every((rawFilter: any) => {
    const type = normalizeBooruText(rawFilter?.type);
    const negative = Boolean(rawFilter?.negative);
    let matches = false;

    if (type === "entity") {
      const filterKind = normalizeBooruText(rawFilter?.kind);
      const filterId = normalizeBooruOptionalText(rawFilter?.id);
      matches = filterKind === kind && Boolean(filterId) && filterId === String(item?.id || "");
    } else if (type === "tag") {
      const tagIds = resolveTagIdsForResourceFilterSync(db, {
        id: normalizeBooruOptionalText(rawFilter?.id),
        value: normalizeBooruOptionalText(rawFilter?.value),
        label: normalizeBooruOptionalText(rawFilter?.label),
      });
      if (tagIds.length) {
        const placeholders = tagIds.map(() => "?").join(", ");
        matches = Boolean(db.prepare(`
          SELECT 1 FROM booru_entity_tags
          WHERE entity_kind = ? AND entity_id = ? AND tag_id IN (${placeholders})
          LIMIT 1
        `).get(kind, item.id, ...tagIds));
      }
    }

    return negative ? !matches : matches;
  }));
}

function listEntityRelationIdsSync(
  db: DatabaseSync,
  sourceKind: BooruEntityKind,
  sourceId: string,
  relationKind: BooruEntityKind,
) {
  if (sourceKind === "universe" && relationKind === "character") {
    return db.prepare(`
      SELECT DISTINCT cu.character_id AS id
      FROM booru_character_universes cu
      WHERE cu.universe_id = ?
    `).all(sourceId).map((row: any) => String(row?.id || "")).filter(Boolean);
  }

  if (sourceKind === "universe" && relationKind === "artist") {
    return db.prepare(`
      SELECT DISTINCT ra.artist_id AS id
      FROM booru_resource_artists ra
      INNER JOIN booru_resources r ON r.id = ra.resource_id
      WHERE r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
        AND (
          EXISTS (
            SELECT 1
            FROM booru_resource_universes ru
            WHERE ru.resource_id = r.id
              AND ru.universe_id = ?
          )
          OR EXISTS (
            SELECT 1
            FROM booru_resource_characters rc
            INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
            WHERE rc.resource_id = r.id
              AND cu.universe_id = ?
              AND NOT EXISTS (
                SELECT 1
                FROM booru_resource_universe_exclusions excluded
                WHERE excluded.resource_id = r.id
                  AND excluded.universe_id = cu.universe_id
              )
          )
        )
    `).all(sourceId, sourceId).map((row: any) => String(row?.id || "")).filter(Boolean);
  }

  if (sourceKind === "character" && relationKind === "artist") {
    return db.prepare(`
      SELECT DISTINCT ra.artist_id AS id
      FROM booru_resource_characters rc
      INNER JOIN booru_resources r ON r.id = rc.resource_id
      INNER JOIN booru_resource_artists ra ON ra.resource_id = r.id
      WHERE rc.character_id = ?
        AND r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
    `).all(sourceId).map((row: any) => String(row?.id || "")).filter(Boolean);
  }

  if (sourceKind === "artist" && relationKind === "character") {
    return db.prepare(`
      SELECT DISTINCT rc.character_id AS id
      FROM booru_resource_artists ra
      INNER JOIN booru_resources r ON r.id = ra.resource_id
      INNER JOIN booru_resource_characters rc ON rc.resource_id = r.id
      WHERE ra.artist_id = ?
        AND r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
    `).all(sourceId).map((row: any) => String(row?.id || "")).filter(Boolean);
  }

  if (sourceKind === "artist" && relationKind === "universe") {
    return db.prepare(`
      SELECT DISTINCT related.id
      FROM (
        SELECT ru.universe_id AS id
        FROM booru_resource_artists ra
        INNER JOIN booru_resources r ON r.id = ra.resource_id
        INNER JOIN booru_resource_universes ru ON ru.resource_id = r.id
        WHERE ra.artist_id = ?
          AND r.classification_state != 'duplicate-review'
          AND r.trashed_at IS NULL
        UNION
        SELECT cu.universe_id AS id
        FROM booru_resource_artists ra
        INNER JOIN booru_resources r ON r.id = ra.resource_id
        INNER JOIN booru_resource_characters rc ON rc.resource_id = r.id
        INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
        WHERE ra.artist_id = ?
          AND r.classification_state != 'duplicate-review'
          AND r.trashed_at IS NULL
          AND NOT EXISTS (
            SELECT 1
            FROM booru_resource_universe_exclusions excluded
            WHERE excluded.resource_id = r.id
              AND excluded.universe_id = cu.universe_id
          )
      ) related
    `).all(sourceId, sourceId).map((row: any) => String(row?.id || "")).filter(Boolean);
  }

  return [];
}

function listEntityRelationsSync(db: DatabaseSync, payload: any = {}) {
  const request = normalizeBooruEntityRelationRequest(payload);

  if (!request) {
    throw new Error("La relacion de entidades solicitada no es valida.");
  }

  const sourceKind = request.sourceKind as BooruEntityKind;
  const relationKind = request.relationKind as BooruEntityKind;

  if (!getEntityBaseRowByIdSync(db, sourceKind, request.sourceId)) {
    throw new Error("La entidad de origen ya no existe en Booru.");
  }

  const relatedIds = new Set(listEntityRelationIdsSync(
    db,
    sourceKind,
    request.sourceId,
    relationKind,
  ));
  const items = filterEntitiesByExactFiltersSync(
    db,
    relationKind,
    listEntitiesSync(db, relationKind, request.query)
      .filter((item) => relatedIds.has(String(item?.id || ""))),
    request.exactFilters,
  );

  return createBooruIncrementalEntityResult(items, request);
}

function getTagQueryScore(row: any, comparableQuery: string) {
  const comparableName = normalizeBooruComparableText(row?.name);

  if (comparableQuery && comparableName === comparableQuery) {
    return 300;
  }

  if (comparableQuery && comparableName.startsWith(comparableQuery)) {
    return 220;
  }

  if (comparableQuery && comparableName.includes(comparableQuery)) {
    return 140;
  }

  return 0;
}

function listTagsSync(db: DatabaseSync, query: string | null = null) {
  const comparableQuery = normalizeBooruComparableText(query);
  const rows = db.prepare(`
    SELECT
      t.*,
      COUNT(DISTINCT rel.resource_id) AS resource_count
    FROM booru_tags t
    LEFT JOIN booru_resource_tags rel ON rel.tag_id = t.id
    WHERE t.source = 'manual'
    GROUP BY t.id
    ORDER BY t.name COLLATE NOCASE ASC
  `).all();

  const filteredRows = comparableQuery
    ? rows
      .filter((row: any) => getTagQueryScore(row, comparableQuery) > 0)
      .sort((left: any, right: any) => {
        const leftScore = getTagQueryScore(left, comparableQuery);
        const rightScore = getTagQueryScore(right, comparableQuery);

        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }

        if (Number(right?.resource_count || 0) !== Number(left?.resource_count || 0)) {
          return Number(right?.resource_count || 0) - Number(left?.resource_count || 0);
        }

        return String(left?.name || "").localeCompare(String(right?.name || ""), "es-AR");
      })
    : rows;

  return filteredRows.map((row: any) => ({
    ...normalizeTagRow(row),
    resourceCount: Number(row?.resource_count || 0),
  }));
}

function listSearchSuggestionsSync(db: DatabaseSync, query: string | null, payload: any = {}) {
  const normalizedQuery = normalizeBooruOptionalText(query);
  const requestedKinds = Array.isArray(payload?.allowedKinds)
    ? new Set(payload.allowedKinds.map((value: unknown) => normalizeBooruText(value)).filter((value: string) => ENTITY_TABLES[value as BooruEntityKind]))
    : null;
  const kinds: BooruEntityKind[] = ["author", "character", "artist", "universe"];
  const items: any[] = [];
  kinds.forEach((kind) => {
    if (requestedKinds && !requestedKinds.has(kind)) return;
    listEntitiesSync(db, kind, normalizedQuery).slice(0, 12).forEach((entity) => {
      items.push({
        id: `entity:${kind}:${entity.id}`,
        type: "entity",
        kind,
        entityId: entity.id,
        label: entity.displayName,
        detail: kind === "character" && entity?.universe?.displayName
          ? `${BOORU_ENTITY_KIND_LABELS[kind]} · ${entity.universe.displayName}`
          : BOORU_ENTITY_KIND_LABELS[kind],
      });
    });
  });
  listTagsSync(db, normalizedQuery).slice(0, 12).forEach((tag) => {
    items.push({ id: `tag:${tag.id}`, type: "tag", tagId: tag.id, label: tag.name, detail: "Tag" });
  });
  return items.slice(0, 24);
}

function findTagByIdSync(db: DatabaseSync, tagId: string) {
  const statement = db.prepare(`
    SELECT *
    FROM booru_tags
    WHERE id = ?
    LIMIT 1
  `);

  return statement.get(tagId) || null;
}

function findTagByExactNameSync(db: DatabaseSync, value: string) {
  const normalizedName = normalizeBooruComparableText(value);
  const statement = db.prepare(`
    SELECT *
    FROM booru_tags
    WHERE source = 'manual'
    ORDER BY created_at ASC
  `);
  const rows = statement.all();

  return (
    rows.find((row: any) => normalizeBooruComparableText(row?.name) === normalizedName)
    || null
  );
}

function ensureTagSync(db: DatabaseSync, name: string) {
  const normalizedName = normalizeBooruOptionalText(name);

  if (!normalizedName) {
    throw new Error("El nombre de la tag es obligatorio.");
  }

  const existing = findTagByExactNameSync(db, normalizedName);

  if (existing) {
    return {
      created: false,
      tag: {
        ...normalizeTagRow(existing),
        resourceCount: listTagsSync(db, normalizedName)
          .find((tag) => tag.id === String(existing.id || ""))?.resourceCount || 0,
      },
    };
  }

  const tagId = crypto.randomUUID();
  const createdAt = nowIso();
  db.prepare(`
    INSERT INTO booru_tags (
      id,
      name,
      source,
      created_at
    ) VALUES (?, ?, 'manual', ?)
  `).run(tagId, normalizedName, createdAt);

  return {
    created: true,
    tag: {
      id: tagId,
      name: normalizedName,
      source: "manual",
      resourceCount: 0,
    },
  };
}

function findEntityBySlugSync(db: DatabaseSync, kind: BooruEntityKind, slug: string) {
  const statement = db.prepare(`
    SELECT *
    FROM ${getEntityTable(kind)}
    WHERE slug = ?
    LIMIT 1
  `);

  return statement.get(slug) || null;
}

function findEntityByIdSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  const statement = db.prepare(`
    SELECT *
    FROM ${getEntityTable(kind)}
    WHERE id = ?
    LIMIT 1
  `);

  return statement.get(entityId) || null;
}

function findEntityNameOwnerIdsSync(db: DatabaseSync, kind: BooruEntityKind, value: string) {
  const comparableName = normalizeBooruComparableText(value);
  if (!comparableName) return [];

  const ownerIds = new Set<string>();
  db.prepare(`
    SELECT id
    FROM ${getEntityTable(kind)}
    ORDER BY created_at ASC
  `).all().forEach((row: any) => {
    if (normalizeBooruComparableText(row?.display_name) === comparableName) {
      ownerIds.add(String(row?.id || ""));
    }
  });
  db.prepare(`
    SELECT entity_id
    FROM booru_entity_aliases
    WHERE entity_kind = ? AND comparable_name = ?
    ORDER BY created_at ASC
  `).all(kind, comparableName).forEach((row: any) => ownerIds.add(String(row?.entity_id || "")));

  return [...ownerIds].filter(Boolean);
}

function getEntityRecordByIdSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  return listEntitiesSync(db, kind).find((entity) => entity.id === entityId) || null;
}

function findEntityByExactNameSync(db: DatabaseSync, kind: BooruEntityKind, value: string) {
  const normalizedSlug = normalizeBooruSlug(value, "");

  const ownerIds = findEntityNameOwnerIdsSync(db, kind, value);
  if (ownerIds.length > 1) {
    throw new Error(`El nombre ingresado coincide con mas de una ${BOORU_ENTITY_KIND_LABELS[kind]}. Revisa sus nombres adicionales antes de continuar.`);
  }
  if (ownerIds.length === 1) {
    return findEntityByIdSync(db, kind, ownerIds[0]);
  }

  if (normalizedSlug) {
    const bySlug = findEntityBySlugSync(db, kind, normalizedSlug);

    if (bySlug) {
      return bySlug;
    }
  }

  return null;
}

function allocateUniqueEntitySlugSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  baseSlug: string,
  currentId: string | null = null,
) {
  let slug = normalizeBooruSlug(baseSlug, kind);
  let suffix = 2;

  for (;;) {
    const existing = findEntityBySlugSync(db, kind, slug);

    if (!existing || String(existing.id || "") === currentId) {
      return slug;
    }

    slug = `${normalizeBooruSlug(baseSlug, kind)}-${suffix}`;
    suffix += 1;
  }
}

function ensureTypedEntityRecordSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  name: string,
  aliasNames: unknown = [],
) {
  const displayName = normalizeBooruOptionalText(name);

  if (!displayName) {
    throw new Error(`El nombre para ${kind} es obligatorio.`);
  }

  const aliases = normalizeEntityAliasesForPrimaryName(kind, displayName, aliasNames);
  const existing = findEntityByExactNameSync(db, kind, displayName);

  if (existing) {
    if (aliases.length) {
      mergeEntityAliasesSync(db, kind, String(existing.id || ""), aliases);
    }
    return {
      created: false,
      entity: normalizeEntityRow(db, kind, {
        ...existing,
        resource_count: getEntityRecordByIdSync(db, kind, String(existing.id || ""))?.resourceCount || 0,
      }),
    };
  }

  const entityId = crypto.randomUUID();
  const createdAt = nowIso();
  const slug = allocateUniqueEntitySlugSync(db, kind, displayName);

  withTransaction(db, () => {
    assertEntityNamesAvailableSync(db, kind, null, [displayName, ...aliases]);
    db.prepare(`
      INSERT INTO ${getEntityTable(kind)} (
        id,
        display_name,
        slug,
        cover_resource_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      entityId,
      displayName,
      slug,
      null,
      createdAt,
    );
    replaceEntityAliasesSync(db, kind, entityId, aliases);
  });

  return {
    created: true,
    entity: normalizeEntityRow(db, kind, {
      id: entityId,
      display_name: displayName,
      slug,
      cover_resource_id: null,
      avatar_resource_id: null,
      banner_resource_id: null,
      created_at: createdAt,
      resource_count: 0,
    }),
  };
}

function ensureTypedEntitySync(db: DatabaseSync, kind: BooruEntityKind, name: string, aliasNames: unknown = []) {
  if (kind === "character") {
    throw new Error("Un character debe crearse junto con su universe.");
  }

  return ensureTypedEntityRecordSync(db, kind, name, aliasNames);
}

function normalizeRecommendationDraftIds(value: unknown) {
  return uniqueBooruIds(
    (Array.isArray(value) ? value : []).map((item) => (
      typeof item === "string"
        ? item
        : (item && typeof item === "object" ? (item as any).id : null)
    )),
  );
}

function normalizeRecommendationDraft(value: unknown): NormalizedRecommendationDraft {
  const rawDraft = (value && typeof value === "object" ? value : {}) as RecommendationDraftPayload;
  return {
    reality: normalizeBooruReality(rawDraft?.reality),
    authors: normalizeRecommendationDraftIds(rawDraft?.authors),
    artists: normalizeRecommendationDraftIds(rawDraft?.artists),
    characters: normalizeRecommendationDraftIds(rawDraft?.characters),
    universes: normalizeRecommendationDraftIds(rawDraft?.universes),
    manualTags: normalizeRecommendationDraftIds(rawDraft?.manualTags),
  };
}

function normalizeRecommendationSearch(value: unknown) {
  const parsed = parseBooruSearchSyntax(value);
  const recommendationTokens = parsed.tokens.filter((token: any) => !token?.negative && (
    token?.type === "entity" || token?.type === "tag"
  ));
  const explicitToken = recommendationTokens.find((token: any) => {
    const rawToken = normalizeBooruText(token?.raw);
    const normalizedToken = rawToken.startsWith("-") ? rawToken.slice(1) : rawToken;
    const separatorIndex = normalizedToken.indexOf(":");

    if (separatorIndex <= 0) {
      return false;
    }

    const rawPrefix = normalizedToken.slice(0, separatorIndex);
    const normalizedPrefix = normalizeBooruComparableText(rawPrefix);

    return Boolean(
      normalizeBooruEntityPrefix(rawPrefix)
      || normalizedPrefix === "tag",
    );
  }) || null;
  const searchText = normalizeBooruOptionalText(
    explicitToken?.value || recommendationTokens.at(-1)?.value || parsed.raw,
  );
  return {
    raw: parsed.raw,
    explicitToken,
    searchText,
  };
}

function getRecommendationMissingKind(
  missingFilter: BooruMissingFilter | null,
): BooruEntityKind | null {
  if (missingFilter === "author") {
    return "author";
  }

  if (missingFilter === "artist") {
    return "artist";
  }

  if (missingFilter === "character") {
    return "character";
  }

  if (missingFilter === "universe") {
    return "universe";
  }

  return null;
}

function resolveEntityIdsFromFiltersSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  filters: NormalizedResourceEntityFilter[] = [],
) {
  const resolvedIds = new Set<string>();

  for (const filter of filters) {
    if (filter.kind !== kind) {
      continue;
    }

    if (filter.id) {
      resolvedIds.add(filter.id);
      continue;
    }

    if (!filter.value) {
      continue;
    }

    const comparableFilterValue = normalizeBooruComparableText(filter.value);
    const matchedRows = listEntitiesSync(db, kind, filter.value)
      .filter((row: any) => normalizeBooruComparableText(row?.displayName) === comparableFilterValue
        || normalizeBooruComparableText(row?.slug) === comparableFilterValue)
      .slice(0, 6);

    for (const row of matchedRows) {
      if (row?.id) {
        resolvedIds.add(row.id);
      }
    }
  }

  return Array.from(resolvedIds);
}

function resolveEntityIdsForResourceFilterSync(
  db: DatabaseSync,
  filter: NormalizedResourceEntityFilter,
) {
  if (filter.id) {
    return [filter.id];
  }

  if (!filter.value) {
    return [];
  }

  const comparableFilterValue = normalizeBooruComparableText(filter.value);

  return listEntitiesSync(db, filter.kind, filter.value)
    .filter((row: any) => normalizeBooruComparableText(row?.displayName) === comparableFilterValue
      || normalizeBooruComparableText(row?.slug) === comparableFilterValue)
    .slice(0, 6)
    .map((row: any) => String(row?.id || "").trim())
    .filter(Boolean);
}

function resolveTagIdsForResourceFilterSync(
  db: DatabaseSync,
  filter: NormalizedResourceTagFilter,
) {
  if (filter.id) {
    return [filter.id];
  }

  const tag = findTagByExactNameSync(db, filter.value);
  return tag?.id ? [String(tag.id)] : [];
}

function listRelatedArtistCountsByCharacterIdsSync(db: DatabaseSync, characterIds: string[]) {
  if (!characterIds.length) {
    return new Map<string, number>();
  }

  const placeholders = characterIds.map(() => "?").join(", ");
  const rows = db.prepare(`
    SELECT rel.artist_id AS artist_id, COUNT(DISTINCT rel.resource_id) AS relation_count
    FROM booru_resource_artists rel
    INNER JOIN booru_resource_characters rchar ON rchar.resource_id = rel.resource_id
    INNER JOIN booru_resources r ON r.id = rel.resource_id
    WHERE rchar.character_id IN (${placeholders})
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
    GROUP BY rel.artist_id
    ORDER BY relation_count DESC, artist_id ASC
  `).all(...characterIds);

  return new Map(
    rows.map((row: any) => [String(row?.artist_id || ""), Number(row?.relation_count || 0)]),
  );
}

function compareRecommendationItems(left: Record<string, any>, right: Record<string, any>) {
  const labelCompare = String(left?.label || "").localeCompare(String(right?.label || ""), "es-AR");

  if (labelCompare !== 0) {
    return labelCompare;
  }

  const leftCreates = String(left?.type || "").startsWith("create-");
  const rightCreates = String(right?.type || "").startsWith("create-");

  if (leftCreates !== rightCreates) {
    return leftCreates ? 1 : -1;
  }

  return String(left?.id || "").localeCompare(String(right?.id || ""), "es-AR");
}

function buildRecommendationItemsSync(
  db: DatabaseSync,
  payload: ListRecommendationsPayload = {},
) {
  const recommendationSearch = normalizeRecommendationSearch(payload?.query);
  const resourceQuery = normalizeResourceQuery(payload?.resourceQuery);
  const recommendationScope = normalizeBooruRecommendationScope(payload?.scope) as BooruRecommendationScope;
  const draft = normalizeRecommendationDraft(payload?.draft);
  const selectedResourceIds = uniqueBooruIds(payload?.selectedResourceIds);
  const selectedResources = getResourceRowsByIdsSync(db, selectedResourceIds);
  const comparableSearchText = normalizeBooruComparableText(recommendationSearch.searchText);
  const hasSearchText = Boolean(comparableSearchText);
  const explicitKind = recommendationSearch.explicitToken?.type === "entity"
    ? recommendationSearch.explicitToken.kind as BooruEntityKind
    : null;
  const explicitTagMode = recommendationSearch.explicitToken?.type === "tag";
  const searchText = recommendationSearch.searchText;
  const selectedRealityValues = Array.from(new Set(
    selectedResources
      .map((resource: any) => resource?.reality || null)
      .filter((value) => value === "real" || value === "ficticio"),
  ));
  const selectedReality = selectedRealityValues.length === 1
    ? selectedRealityValues[0] as "real" | "ficticio"
    : null;
  const resourceFilterKinds = Array.from(new Set(resourceQuery.includeEntities.map((filter) => filter.kind)));
  const singleResourceFilterKind = resourceFilterKinds.length === 1 ? resourceFilterKinds[0] : null;
  const filteredUniverseIds = uniqueBooruIds(
    resolveEntityIdsFromFiltersSync(db, "universe", resourceQuery.includeEntities),
  );
  const filteredCharacterIds = uniqueBooruIds(
    resolveEntityIdsFromFiltersSync(db, "character", resourceQuery.includeEntities),
  );
  const selectedUniverseIds = uniqueBooruIds(selectedResources.flatMap((resource: any) => ([
    ...(Array.isArray(resource?.universes) ? resource.universes.map((item: any) => item?.id) : []),
    ...(Array.isArray(resource?.characters) ? resource.characters.map((item: any) => item?.universe?.id) : []),
  ])));
  const selectedCharacterIds = uniqueBooruIds(
    selectedResources.flatMap((resource: any) => (
      Array.isArray(resource?.characters) ? resource.characters.map((item: any) => item?.id) : []
    )),
  );
  const universeContextIds = uniqueBooruIds([
    ...draft.universes,
    ...filteredUniverseIds,
    ...selectedUniverseIds,
  ]);
  const characterContextIds = uniqueBooruIds([
    ...draft.characters,
    ...filteredCharacterIds,
    ...selectedCharacterIds,
  ]);
  const relatedArtistCounts = listRelatedArtistCountsByCharacterIdsSync(db, characterContextIds);
  const relatedArtistCountsFromFilters = filteredCharacterIds.length
    ? listRelatedArtistCountsByCharacterIdsSync(db, filteredCharacterIds)
    : relatedArtistCounts;
  const effectiveReality = resourceQuery.reality || draft.reality || selectedReality || null;
  const activeMissingFilter = resourceQuery.missing;
  const explicitMissingDrivenKind = getRecommendationMissingKind(activeMissingFilter);
  const missingDrivenKind = explicitMissingDrivenKind
    || (!explicitKind && !explicitTagMode
      ? getBooruImplicitRecommendationMissingKind(recommendationScope, effectiveReality)
      : null);
  const allowEssentialRecommendations = recommendationScope !== BOORU_RECOMMENDATION_SCOPES.TAGS;
  const allowTagRecommendations = recommendationScope !== BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
  const allEntityKinds = ["author", "artist", "character", "universe"] as BooruEntityKind[];
  const recommendationContext = (() => {
    if (missingDrivenKind) {
      return missingDrivenKind;
    }

    if (filteredUniverseIds.length) {
      return "universe";
    }

    if (filteredCharacterIds.length) {
      return "character";
    }

    if (singleResourceFilterKind) {
      return singleResourceFilterKind;
    }

    if (universeContextIds.length) {
      return "universe";
    }

    if (characterContextIds.length) {
      return "character";
    }

    return effectiveReality || null;
  })();
  const preferredKinds = getBooruRecommendationKindOrder(recommendationContext) as BooruEntityKind[];
  const preferredIncludesTags = allowTagRecommendations && Boolean(
    recommendationScope === BOORU_RECOMMENDATION_SCOPES.TAGS
    || (effectiveReality === "ficticio"
    && !missingDrivenKind
    && !filteredUniverseIds.length
    && !filteredCharacterIds.length
    && !universeContextIds.length
    && !characterContextIds.length),
  );
  const preferredIncludesRealityActions = Boolean(
    allowEssentialRecommendations
    && !effectiveReality
    && !explicitKind
    && !explicitTagMode
    && !missingDrivenKind,
  );
  const hasPreferredBucket = Boolean(
    preferredKinds.length || preferredIncludesTags || preferredIncludesRealityActions,
  );
  const needsRealityChoice = !hasSearchText
    && allowEssentialRecommendations
    && !effectiveReality
    && !explicitKind
    && !explicitTagMode
    && !missingDrivenKind
    && !resourceFilterKinds.length
    && !universeContextIds.length
    && !characterContextIds.length;
  let narrowKind: BooruEntityKind | null = null;
  let includeTags = allowTagRecommendations && !explicitKind;

  if (explicitKind) {
    narrowKind = explicitKind;
    includeTags = false;
  } else if (explicitTagMode) {
    narrowKind = null;
    includeTags = allowTagRecommendations;
  } else if (hasSearchText) {
    if (missingDrivenKind) {
      narrowKind = missingDrivenKind;
      includeTags = false;
    } else {
      narrowKind = null;
      includeTags = true;
    }
  } else if (missingDrivenKind) {
    narrowKind = missingDrivenKind;
    includeTags = false;
  }

  const candidateKinds = !allowEssentialRecommendations || explicitTagMode
    ? []
    : narrowKind
    ? [narrowKind]
    : allEntityKinds;
  const contextualCreateKind = explicitKind
    || (!includeTags && candidateKinds.length === 1 ? candidateKinds[0] : null);
  const seenItemIds = new Set<string>();
  const items: Array<Record<string, any>> = [];

  const pushItem = (item: Record<string, any>) => {
    if (!item?.id || seenItemIds.has(item.id)) {
      return;
    }

    seenItemIds.add(item.id);
    items.push(item);
  };

  const pushRealityItems = () => {
    if (!allowEssentialRecommendations || explicitKind || explicitTagMode || missingDrivenKind || effectiveReality) {
      return;
    }

    for (const realityOption of ["real", "ficticio"] as const) {
      const label = realityOption === "real" ? "Real" : "Ficticio";

      if (
        comparableSearchText
        && !normalizeBooruComparableText(label).includes(comparableSearchText)
      ) {
        continue;
      }

      pushItem({
        id: `reality:${realityOption}`,
        type: "reality-action",
        label,
        detail: "Clasificacion base",
        actionLabel: "Aplicar",
        reality: realityOption,
      });
    }
  };

  const pushTextModeEntityItems = (kinds: BooruEntityKind[]) => {
    for (const kind of kinds) {
      listEntitiesSync(db, kind, searchText).forEach((row: any) => {
        pushItem({
          id: `entity:${kind}:${row.id}`,
          type: "entity",
          kind,
          entityId: row.id,
          label: row.displayName,
          detail: row?.universe?.displayName
            ? `${BOORU_ENTITY_KIND_LABELS[kind]} Â· ${row.universe.displayName} Â· ${row.resourceCount} recursos`
            : `${BOORU_ENTITY_KIND_LABELS[kind]} Â· ${row.resourceCount} recursos`,
          actionLabel: "Aplicar",
          resourceCount: Number(row?.resourceCount || 0),
          entity: row,
          dropEnabled: true,
        });
      });
    }
  };

  const pushTextModeTagItems = () => {
    listTagsSync(db, searchText).forEach((tag: any) => {
      pushItem({
        id: `tag:${tag.id}`,
        type: "tag",
        kind: "tag",
        tagId: tag.id,
        label: tag.name,
        detail: `Tag Â· ${tag.resourceCount} recursos`,
        actionLabel: "Aplicar",
        resourceCount: Number(tag?.resourceCount || 0),
        tag,
      });
    });
  };

  const pushTextModeCreateItem = () => {
    if (!searchText) {
      return;
    }

    const createKind = explicitKind || missingDrivenKind || null;

    if (createKind) {
      if (!allowEssentialRecommendations) {
        return;
      }

      const exactEntity = findEntityByExactNameSync(db, createKind, searchText);

      if (!exactEntity) {
        pushItem({
          id: `create-entity:${createKind}:${normalizeBooruComparableText(searchText)}`,
          type: "create-entity",
          kind: createKind,
          label: searchText,
          detail: `Crear ${BOORU_ENTITY_KIND_LABELS[createKind]}`,
          actionLabel: "Crear",
          createName: searchText,
        });
      }

      return;
    }

    if (!allowTagRecommendations) {
      return;
    }

    const exactTag = findTagByExactNameSync(db, searchText);

    if (!exactTag) {
      pushItem({
        id: `create-tag:${normalizeBooruComparableText(searchText)}`,
        type: "create-tag",
        kind: "tag",
        label: searchText,
        detail: "Crear tag plana",
        actionLabel: "Crear",
        createName: searchText,
      });
    }
  };

  const isPreferredItem = (item: Record<string, any>) => {
    if (item?.type === "reality-action") {
      return preferredIncludesRealityActions;
    }

    if (item?.type === "tag" || item?.type === "create-tag") {
      return preferredIncludesTags;
    }

    const itemKind = String(item?.kind || "").trim() as BooruEntityKind;

    if (!preferredKinds.includes(itemKind)) {
      return false;
    }

    if (itemKind === "character") {
      const itemUniverseId = normalizeBooruOptionalText(item?.entity?.universe?.id);

      if (filteredUniverseIds.length) {
        return Boolean(itemUniverseId && filteredUniverseIds.includes(itemUniverseId));
      }

      if (universeContextIds.length) {
        return Boolean(itemUniverseId && universeContextIds.includes(itemUniverseId));
      }
    }

    if (itemKind === "artist") {
      const entityId = normalizeBooruOptionalText(item?.entityId);

      if (!entityId) {
        return false;
      }

      if (filteredCharacterIds.length) {
        return relatedArtistCountsFromFilters.has(entityId);
      }

      if (characterContextIds.length) {
        return relatedArtistCounts.has(entityId);
      }
    }

    return true;
  };

  const compareContextualItems = (left: Record<string, any>, right: Record<string, any>) => {
    const preferredCompare = Number(isPreferredItem(right)) - Number(isPreferredItem(left));

    if (preferredCompare !== 0) {
      return preferredCompare;
    }

    const leftKind = String(left?.kind || "").trim();
    const rightKind = String(right?.kind || "").trim();
    const kindRankCompare = getBooruRecommendationKindRank(recommendationContext, leftKind)
      - getBooruRecommendationKindRank(recommendationContext, rightKind);

    if (kindRankCompare !== 0) {
      return kindRankCompare;
    }

    return compareRecommendationItems(left, right);
  };

  if (hasSearchText) {
    const hardRestrictionKind = explicitKind || missingDrivenKind || null;

    pushRealityItems();
    pushTextModeEntityItems(
      !allowEssentialRecommendations || explicitTagMode
        ? []
        : (hardRestrictionKind ? [hardRestrictionKind] : allEntityKinds),
    );

    if (allowTagRecommendations && (explicitTagMode || !hardRestrictionKind)) {
      pushTextModeTagItems();
    }

    pushTextModeCreateItem();

    if (!hasPreferredBucket || explicitTagMode) {
      return items.sort(compareRecommendationItems);
    }

    return items.sort(compareContextualItems);
  }

  if (needsRealityChoice) {
    for (const realityOption of ["real", "ficticio"] as const) {
      const label = realityOption === "real" ? "Real" : "Ficticio";

      if (
        comparableSearchText
        && !normalizeBooruComparableText(label).includes(comparableSearchText)
      ) {
        continue;
      }

      pushItem({
        id: `reality:${realityOption}`,
        type: "reality-action",
        label,
        detail: "Clasificacion base",
        actionLabel: "Aplicar",
        reality: realityOption,
      });
    }

    return items.sort(compareRecommendationItems);
  }

  for (const kind of candidateKinds) {
    listEntitiesSync(db, kind, searchText)
      .forEach((row: any) => {
        pushItem({
          id: `entity:${kind}:${row.id}`,
          type: "entity",
          kind,
          entityId: row.id,
          label: row.displayName,
          detail: row?.universe?.displayName
            ? `${BOORU_ENTITY_KIND_LABELS[kind]} · ${row.universe.displayName} · ${row.resourceCount} recursos`
            : `${BOORU_ENTITY_KIND_LABELS[kind]} · ${row.resourceCount} recursos`,
          actionLabel: "Aplicar",
          resourceCount: Number(row?.resourceCount || 0),
          entity: row,
          dropEnabled: true,
        });
      });
  }

  if (includeTags) {
    listTagsSync(db, searchText).forEach((tag: any) => {
      pushItem({
        id: `tag:${tag.id}`,
        type: "tag",
        kind: "tag",
        tagId: tag.id,
        label: tag.name,
        detail: `Tag · ${tag.resourceCount} recursos`,
        actionLabel: "Aplicar",
        resourceCount: Number(tag?.resourceCount || 0),
        tag,
      });
    });
  }

  if (searchText) {
    if (contextualCreateKind) {
      const exactEntity = findEntityByExactNameSync(db, contextualCreateKind, searchText);

      if (!exactEntity) {
        pushItem({
          id: `create-entity:${contextualCreateKind}:${normalizeBooruComparableText(searchText)}`,
          type: "create-entity",
          kind: contextualCreateKind,
          label: searchText,
          detail: `Crear ${BOORU_ENTITY_KIND_LABELS[contextualCreateKind]}`,
          actionLabel: "Crear",
          createName: searchText,
        });
      }
    } else {
      const exactTag = findTagByExactNameSync(db, searchText);

      if (!exactTag) {
        pushItem({
          id: `create-tag:${normalizeBooruComparableText(searchText)}`,
          type: "create-tag",
          kind: "tag",
          label: searchText,
          detail: "Crear tag plana",
          actionLabel: "Crear",
          createName: searchText,
        });
      }
    }
  }

  return items.sort(compareContextualItems);
}

function listRecommendationsSync(
  db: DatabaseSync,
  payload: ListRecommendationsPayload = {},
) {
  const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
  const limit = Math.max(1, normalizePagingNumber(payload?.limit, BOORU_RECOMMENDATION_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
  const items = buildRecommendationItemsSync(db, payload);
  return {
    items: items.slice(offset, offset + limit),
    totalCount: items.length,
    hasMore: offset + limit < items.length,
  };
}

function setEntityVisualSync(db: DatabaseSync, payload: SetEntityVisualPayload) {
  const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
  const entityId = normalizeBooruText(payload?.entityId);
  const resourceId = normalizeBooruText(payload?.resourceId);
  const visualRole = normalizeBooruText(payload?.visualRole) as BooruEntityVisualRole;
  const visualColumn = ENTITY_VISUAL_COLUMNS[visualRole];

  if (!ENTITY_TABLES[kind]) {
    throw new Error("El tipo de entidad solicitado no existe en Booru.");
  }

  if (!entityId) {
    throw new Error("La entidad solicitada no es valida.");
  }

  if (!resourceId) {
    throw new Error("El recurso seleccionado no es valido.");
  }

  if (!visualColumn) {
    throw new Error("El visual solicitado no existe en Booru.");
  }

  const entity = getEntityBaseRowByIdSync(db, kind, entityId);

  if (!entity) {
    throw new Error("La entidad solicitada ya no existe en Booru.");
  }

  const resource = getResourceByIdSync(db, resourceId);

  if (!resource?.id || resource.classificationState === "duplicate-review" || resource.trashedAt) {
    throw new Error("El recurso seleccionado ya no esta disponible en Booru.");
  }

  const hasLayout = payload?.layout && typeof payload.layout === "object";
  const nextVisualSettings = hasLayout
    ? normalizeEntityVisualSettings({
        ...parseEntityVisualSettings(entity?.visual_settings_json),
        [visualRole]: payload.layout,
      })
    : null;

  withTransaction(db, () => {
    if (nextVisualSettings) {
      db.prepare(`
        UPDATE ${getEntityTable(kind)}
        SET ${visualColumn} = ?, visual_settings_json = ?
        WHERE id = ?
      `).run(resourceId, serializeEntityVisualSettings(nextVisualSettings), entityId);
      return;
    }

    db.prepare(`
      UPDATE ${getEntityTable(kind)}
      SET ${visualColumn} = ?
      WHERE id = ?
    `).run(resourceId, entityId);
  });

  const profile = getEntityProfileSync(db, kind, entityId);

  if (!profile) {
    throw new Error("No se pudo reconstruir el perfil despues de actualizar la imagen.");
  }

  return profile;
}

function setEntityVisualLayoutSync(db: DatabaseSync, payload: SetEntityVisualLayoutPayload) {
  const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
  const entityId = normalizeBooruText(payload?.entityId);
  const visualRole = normalizeBooruText(payload?.visualRole) as BooruEntityVisualRole;

  if (!ENTITY_TABLES[kind]) {
    throw new Error("El tipo de entidad solicitado no existe en Booru.");
  }

  if (!entityId) {
    throw new Error("La entidad solicitada no es valida.");
  }

  if (visualRole !== "avatar" && visualRole !== "banner") {
    throw new Error("El visual solicitado no admite ajuste de encuadre.");
  }

  const entity = getEntityBaseRowByIdSync(db, kind, entityId);

  if (!entity) {
    throw new Error("La entidad solicitada ya no existe en Booru.");
  }

  const currentSettings = parseEntityVisualSettings(entity?.visual_settings_json);
  const nextSettings = normalizeEntityVisualSettings({
    ...currentSettings,
    [visualRole]: {
      scale: (payload as any)?.layout?.scale ?? payload?.scale,
      offsetX: (payload as any)?.layout?.offsetX ?? payload?.offsetX,
      offsetY: (payload as any)?.layout?.offsetY ?? payload?.offsetY,
    },
  });

  db.prepare(`
    UPDATE ${getEntityTable(kind)}
    SET visual_settings_json = ?
    WHERE id = ?
  `).run(serializeEntityVisualSettings(nextSettings), entityId);

  const profile = getEntityProfileSync(db, kind, entityId);

  if (!profile) {
    throw new Error("No se pudo reconstruir el perfil despues de actualizar su encuadre.");
  }

  return profile;
}

function setCharacterUniverseSync(db: DatabaseSync, payload: SetCharacterUniversePayload) {
  const characterId = normalizeBooruText(payload?.characterId);
  const universeId = normalizeBooruText(payload?.universeId);

  if (!characterId) {
    throw new Error("El character solicitado no es valido.");
  }

  if (!universeId) {
    throw new Error("Todo character necesita exactamente un universe.");
  }

  const character = findEntityByIdSync(db, "character", characterId);

  if (!character) {
    throw new Error("El character solicitado ya no existe en Booru.");
  }

  const universe = findEntityByIdSync(db, "universe", universeId);

  if (!universe) {
    throw new Error("El universe solicitado ya no existe en Booru.");
  }

  withTransaction(db, () => {
    replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
    syncEntityConsumerInheritanceSync(db, "character", characterId);
  });

  const profile = getEntityProfileSync(db, "character", characterId);

  if (!profile) {
    throw new Error("No se pudo reconstruir el perfil del character despues de actualizar su universe.");
  }

  return profile;
}

function ensureCharacterInUniverseSync(db: DatabaseSync, payload: EnsureCharacterInUniversePayload) {
  const universeId = normalizeBooruText(payload?.universeId);
  const name = normalizeBooruText(payload?.name);

  if (!universeId) {
    throw new Error("Hace falta un universe para crear el character.");
  }

  const universe = findEntityByIdSync(db, "universe", universeId);

  if (!universe) {
    throw new Error("El universe solicitado ya no existe en Booru.");
  }

  const ensured = ensureTypedEntityRecordSync(db, "character", name);
  const characterId = String(ensured?.entity?.id || "").trim();

  if (!characterId) {
    throw new Error("No se pudo asegurar el character.");
  }

  const currentUniverse = getCharacterUniverseRecordSync(db, characterId);

  if (currentUniverse?.id && currentUniverse.id !== universeId) {
    throw new Error(`Ese character ya existe en ${currentUniverse.displayName}.`);
  }

  if (!currentUniverse?.id) {
    withTransaction(db, () => {
      replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
      syncEntityConsumerInheritanceSync(db, "character", characterId);
    });
  }

  return {
    created: Boolean(ensured?.created),
    entity: getEntityRecordByIdSync(db, "character", characterId) || ensured.entity,
  };
}

function normalizeUniqueTextList(value: unknown) {
  const seen = new Set<string>();
  const values: string[] = [];
  (Array.isArray(value) ? value : []).forEach((entry) => {
    const text = normalizeBooruOptionalText(entry);
    const comparable = normalizeBooruComparableText(text);
    if (!text || !comparable || seen.has(comparable)) return;
    seen.add(comparable);
    values.push(text);
  });
  return values;
}

function normalizeEntityAliasesForPrimaryName(
  kind: BooruEntityKind,
  primaryName: unknown,
  value: unknown,
) {
  const aliases = normalizeUniqueTextList(value);
  if (aliases.length && kind !== "author" && kind !== "artist") {
    throw new Error("Solo Persona y Artist admiten nombres adicionales.");
  }

  const primaryComparable = normalizeBooruComparableText(primaryName);
  return aliases.filter((alias) => normalizeBooruComparableText(alias) !== primaryComparable);
}

function assertEntityNamesAvailableSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  currentEntityId: string | null,
  names: string[],
) {
  const checked = new Set<string>();
  normalizeUniqueTextList(names).forEach((name) => {
    const comparableName = normalizeBooruComparableText(name);
    if (!comparableName || checked.has(comparableName)) return;
    checked.add(comparableName);

    const conflictingId = findEntityNameOwnerIdsSync(db, kind, name)
      .find((ownerId) => ownerId !== currentEntityId);
    if (!conflictingId) return;

    const conflictingEntity = findEntityByIdSync(db, kind, conflictingId);
    const conflictingName = normalizeBooruOptionalText(conflictingEntity?.display_name) || name;
    throw new Error(`El nombre "${name}" ya pertenece a ${BOORU_ENTITY_KIND_LABELS[kind]} "${conflictingName}".`);
  });
}

function replaceEntityAliasesSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
  aliases: string[],
) {
  db.prepare(`DELETE FROM booru_entity_aliases WHERE entity_kind = ? AND entity_id = ?`).run(kind, entityId);
  const insertAlias = db.prepare(`
    INSERT INTO booru_entity_aliases (entity_kind, entity_id, alias_name, comparable_name, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  aliases.forEach((alias) => insertAlias.run(kind, entityId, alias, normalizeBooruComparableText(alias), nowIso()));
}

function mergeEntityAliasesSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
  aliasNames: unknown,
) {
  const entity = findEntityByIdSync(db, kind, entityId);
  if (!entity) throw new Error("La entidad solicitada ya no existe en Booru.");

  const aliases = normalizeEntityAliasesForPrimaryName(kind, entity?.display_name, [
    ...listEntityAliasesSync(db, kind, entityId),
    ...normalizeUniqueTextList(aliasNames),
  ]);
  assertEntityNamesAvailableSync(db, kind, entityId, [String(entity?.display_name || ""), ...aliases]);
  withTransaction(db, () => replaceEntityAliasesSync(db, kind, entityId, aliases));
}

function normalizeSocialLinks(value: unknown) {
  const seen = new Set<string>();
  const links: Array<{ platformId: string; url: string }> = [];
  (Array.isArray(value) ? value : []).forEach((entry: any) => {
    const platformId = normalizeBooruOptionalText(entry?.platformId);
    const url = normalizeBooruOptionalText(entry?.url);
    if (!platformId || !url) return;
    const key = `${platformId}:${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ platformId, url });
  });
  return links;
}

function saveEntityProfileSync(db: DatabaseSync, payload: SaveEntityProfilePayload) {
  const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
  const entityId = normalizeBooruOptionalText(payload?.entityId);
  if (!ENTITY_TABLES[kind] || !entityId || !findEntityByIdSync(db, kind, entityId)) {
    throw new Error("La entidad solicitada ya no existe en Booru.");
  }

  const entity = findEntityByIdSync(db, kind, entityId);
  const currentDisplayName = normalizeBooruOptionalText(entity?.display_name);
  const hasDisplayName = Object.prototype.hasOwnProperty.call(payload || {}, "displayName");
  const displayName = hasDisplayName
    ? normalizeBooruOptionalText(payload?.displayName)
    : currentDisplayName;
  if (!displayName) {
    throw new Error("El nombre principal es obligatorio.");
  }

  const tagIds = Object.prototype.hasOwnProperty.call(payload || {}, "tagIds")
    ? uniqueBooruIds(payload?.tagIds)
    : listEntityTagsSync(db, kind, entityId).map((tag) => tag.id);
  assertValidTagIdsSync(db, tagIds);
  const requestedAliases = Object.prototype.hasOwnProperty.call(payload || {}, "aliasNames")
    ? normalizeUniqueTextList(payload?.aliasNames)
    : listEntityAliasesSync(db, kind, entityId);
  const aliases = normalizeEntityAliasesForPrimaryName(kind, displayName, [
    ...requestedAliases,
    ...((kind === "author" || kind === "artist")
      && normalizeBooruComparableText(displayName) !== normalizeBooruComparableText(currentDisplayName)
      ? [currentDisplayName]
      : []),
  ]);
  const socialLinks = Object.prototype.hasOwnProperty.call(payload || {}, "socialLinks")
    ? normalizeSocialLinks(payload?.socialLinks)
    : listEntitySocialLinksSync(db, kind, entityId).map((link: any) => ({ platformId: link?.platform?.id, url: link?.url }));
  if ((aliases.length || socialLinks.length) && kind !== "author" && kind !== "artist") {
    throw new Error("Solo Persona y Artist admiten aliases y redes.");
  }
  assertEntityNamesAvailableSync(db, kind, entityId, [displayName, ...aliases]);

  socialLinks.forEach((link) => {
    if (!db.prepare(`SELECT id FROM booru_social_platforms WHERE id = ?`).get(link.platformId)) {
      throw new Error("Una plataforma seleccionada ya no existe.");
    }
  });

  withTransaction(db, () => {
    if (hasDisplayName && displayName !== currentDisplayName) {
      db.prepare(`UPDATE ${getEntityTable(kind)} SET display_name = ? WHERE id = ?`)
        .run(displayName, entityId);
    }

    db.prepare(`DELETE FROM booru_entity_tags WHERE entity_kind = ? AND entity_id = ?`).run(kind, entityId);
    const insertTag = db.prepare(`
      INSERT INTO booru_entity_tags (entity_kind, entity_id, tag_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    tagIds.forEach((tagId) => insertTag.run(kind, entityId, tagId, nowIso()));

    if (kind === "author" || kind === "artist") {
      replaceEntityAliasesSync(db, kind, entityId, aliases);

      db.prepare(`DELETE FROM booru_entity_social_links WHERE entity_kind = ? AND entity_id = ?`).run(kind, entityId);
      const insertLink = db.prepare(`
        INSERT INTO booru_entity_social_links (id, entity_kind, entity_id, platform_id, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      socialLinks.forEach((link) => insertLink.run(crypto.randomUUID(), kind, entityId, link.platformId, link.url, nowIso()));
    }

    syncEntityConsumerInheritanceSync(db, kind, entityId);
  });

  return getEntityProfileSync(db, kind, entityId);
}

function listSocialPlatformsSync(db: DatabaseSync) {
  return db.prepare(`
    SELECT p.*, COUNT(DISTINCT rel.id) AS profile_count
    FROM booru_social_platforms p
    LEFT JOIN booru_entity_social_links rel ON rel.platform_id = p.id
    GROUP BY p.id
    ORDER BY p.display_name COLLATE NOCASE ASC
  `).all().map((row: any) => ({
    id: String(row?.id || ""),
    displayName: String(row?.display_name || ""),
    iconResourceId: normalizeBooruOptionalText(row?.icon_resource_id),
    iconLayout: parseEntityVisualSettings(row?.icon_layout_json)?.avatar || null,
    profileCount: Number(row?.profile_count || 0),
  }));
}

function saveSocialPlatformSync(db: DatabaseSync, payload: any) {
  const id = normalizeBooruOptionalText(payload?.id) || crypto.randomUUID();
  const displayName = normalizeBooruOptionalText(payload?.displayName);
  const iconResourceId = normalizeBooruOptionalText(payload?.iconResourceId);
  if (!displayName) throw new Error("El nombre de la plataforma es obligatorio.");
  if (iconResourceId && !getResourceByIdSync(db, iconResourceId)) throw new Error("El icono elegido ya no existe.");
  const currentLayout = normalizeEntityVisualLayout(payload?.iconLayout);
  const layoutJson = serializeEntityVisualSettings({ avatar: currentLayout, banner: normalizeEntityVisualLayout({}) });
  const existing = db.prepare(`SELECT id FROM booru_social_platforms WHERE id = ?`).get(id);
  if (existing) {
    db.prepare(`UPDATE booru_social_platforms SET display_name = ?, icon_resource_id = ?, icon_layout_json = ? WHERE id = ?`)
      .run(displayName, iconResourceId, layoutJson, id);
  } else {
    db.prepare(`INSERT INTO booru_social_platforms (id, display_name, icon_resource_id, icon_layout_json, created_at) VALUES (?, ?, ?, ?, ?)`)
      .run(id, displayName, iconResourceId, layoutJson, nowIso());
  }
  return listSocialPlatformsSync(db).find((platform) => platform.id === id) || null;
}

function deleteSocialPlatformSync(db: DatabaseSync, payload: any) {
  const platformId = normalizeBooruOptionalText(payload?.platformId);
  const confirmed = payload?.confirmed === true;
  if (!platformId) throw new Error("La plataforma solicitada no es valida.");
  const consumers = db.prepare(`
    SELECT rel.entity_kind, rel.entity_id, e.display_name
    FROM booru_entity_social_links rel
    LEFT JOIN booru_authors e ON rel.entity_kind = 'author' AND e.id = rel.entity_id
    WHERE rel.platform_id = ? AND rel.entity_kind = 'author'
  `).all(platformId);
  const artistConsumers = db.prepare(`
    SELECT rel.entity_kind, rel.entity_id, e.display_name
    FROM booru_entity_social_links rel
    INNER JOIN booru_artists e ON rel.entity_kind = 'artist' AND e.id = rel.entity_id
    WHERE rel.platform_id = ?
  `).all(platformId);
  const affectedProfiles = [...consumers, ...artistConsumers].map((row: any) => ({
    kind: String(row?.entity_kind || ""), id: String(row?.entity_id || ""), displayName: String(row?.display_name || ""),
  }));
  if (affectedProfiles.length && !confirmed) return { deleted: false, affectedProfiles };
  db.prepare(`DELETE FROM booru_social_platforms WHERE id = ?`).run(platformId);
  return { deleted: true, affectedProfiles };
}

function excludeResourceTagSync(db: DatabaseSync, resourceId: string, tagId: string) {
  if (!getResourceByIdSync(db, resourceId) || !findTagByIdSync(db, tagId)) throw new Error("La tag o el recurso ya no existe.");
  const isInherited = Boolean(db.prepare(`
    SELECT 1
    FROM booru_resource_inherited_tags
    WHERE resource_id = ? AND tag_id = ?
    LIMIT 1
  `).get(resourceId, tagId));
  withTransaction(db, () => {
    db.prepare(`DELETE FROM booru_resource_tags WHERE resource_id = ? AND tag_id = ?`).run(resourceId, tagId);
    if (isInherited) {
      db.prepare(`INSERT OR IGNORE INTO booru_resource_tag_exclusions (resource_id, tag_id, created_at) VALUES (?, ?, ?)`)
        .run(resourceId, tagId, nowIso());
    } else {
      db.prepare(`DELETE FROM booru_resource_tag_exclusions WHERE resource_id = ? AND tag_id = ?`).run(resourceId, tagId);
    }
  });
  return getResourceByIdSync(db, resourceId);
}

function excludeResourceUniverseSync(db: DatabaseSync, resourceId: string, universeId: string) {
  if (!getResourceByIdSync(db, resourceId) || !findEntityByIdSync(db, "universe", universeId)) throw new Error("El universe o el recurso ya no existe.");
  withTransaction(db, () => {
    db.prepare(`DELETE FROM booru_resource_universes WHERE resource_id = ? AND universe_id = ?`).run(resourceId, universeId);
    db.prepare(`INSERT OR IGNORE INTO booru_resource_universe_exclusions (resource_id, universe_id, created_at) VALUES (?, ?, ?)`)
      .run(resourceId, universeId, nowIso());
    syncResourceInheritanceSync(db, resourceId);
    reconcileResourceClassificationSync(db, resourceId);
  });
  return getResourceByIdSync(db, resourceId);
}

function disassociateResourcesFromEntitySync(db: DatabaseSync, payload: ResourceEntityAssociationPayload) {
  const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
  const entityId = normalizeBooruOptionalText(payload?.entityId);
  const resourceIds = uniqueBooruIds(payload?.resourceIds);
  if (!ENTITY_TABLES[kind] || !entityId || !resourceIds.length) throw new Error("La entidad y los recursos son obligatorios.");
  const table = kind === "universe" ? "booru_resource_universes" : getResourceRelationTable(kind);
  const column = kind === "universe" ? "universe_id" : getResourceRelationEntityIdColumn(kind);
  if (!table || !column) throw new Error("No se puede desasociar este tipo de entidad.");
  withTransaction(db, () => {
    const unlink = db.prepare(`DELETE FROM ${table} WHERE resource_id = ? AND ${column} = ?`);
    resourceIds.forEach((resourceId) => {
      unlink.run(resourceId, entityId);
      syncResourceInheritanceSync(db, resourceId);
      reconcileResourceClassificationSync(db, resourceId);
    });
    const visualColumnNames = Object.values(ENTITY_VISUAL_COLUMNS);
    visualColumnNames.forEach((columnName) => {
      const placeholders = resourceIds.map(() => "?").join(", ");
      if (placeholders) {
        db.prepare(`UPDATE ${getEntityTable(kind)} SET ${columnName} = NULL WHERE id = ? AND ${columnName} IN (${placeholders})`)
          .run(entityId, ...resourceIds);
      }
    });
  });
  return { resourceIds, profile: getEntityProfileSync(db, kind, entityId) };
}

function replaceResourceEntityAssignmentsSync(
  db: DatabaseSync,
  kind: Extract<BooruEntityKind, "author" | "artist" | "character">,
  resourceId: string,
  entityIds: string[],
) {
  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);

  if (!relationTable || !relationEntityIdColumn) {
    return;
  }

  db.prepare(`DELETE FROM ${relationTable} WHERE resource_id = ?`).run(resourceId);

  if (!entityIds.length) {
    return;
  }

  const insertStatement = db.prepare(`
    INSERT INTO ${relationTable} (
      resource_id,
      ${relationEntityIdColumn},
      sort_order,
      created_at
    ) VALUES (?, ?, ?, ?)
  `);
  const createdAt = nowIso();

  entityIds.forEach((entityId, index) => {
    insertStatement.run(resourceId, entityId, index, createdAt);
  });
}

function syncResourceInheritanceSync(db: DatabaseSync, resourceId: string) {
  db.prepare(`DELETE FROM booru_resource_inherited_tags WHERE resource_id = ?`).run(resourceId);
  db.prepare(`DELETE FROM booru_resource_inherited_universes WHERE resource_id = ?`).run(resourceId);

  const sources: Array<{ kind: BooruEntityKind; entityId: string }> = [];
  const addSources = (kind: Extract<BooruEntityKind, "author" | "artist" | "character">) => {
    const relationTable = getResourceRelationTable(kind)!;
    const entityColumn = getResourceRelationEntityIdColumn(kind)!;
    db.prepare(`SELECT ${entityColumn} AS entity_id FROM ${relationTable} WHERE resource_id = ?`)
      .all(resourceId)
      .forEach((row: any) => sources.push({ kind, entityId: String(row?.entity_id || "") }));
  };

  addSources("author");
  addSources("artist");
  addSources("character");
  db.prepare(`SELECT universe_id FROM booru_resource_universes WHERE resource_id = ?`)
    .all(resourceId)
    .forEach((row: any) => sources.push({ kind: "universe", entityId: String(row?.universe_id || "") }));

  const inheritedUniverseInsert = db.prepare(`
    INSERT OR IGNORE INTO booru_resource_inherited_universes (
      resource_id, universe_id, character_id, created_at
    ) VALUES (?, ?, ?, ?)
  `);
  const characterUniverseRows = db.prepare(`
    SELECT rc.character_id, cu.universe_id
    FROM booru_resource_characters rc
    INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
    WHERE rc.resource_id = ?
  `).all(resourceId);

  characterUniverseRows.forEach((row: any) => {
    const characterId = String(row?.character_id || "");
    const universeId = String(row?.universe_id || "");
    if (!characterId || !universeId) return;
    inheritedUniverseInsert.run(resourceId, universeId, characterId, nowIso());
    sources.push({ kind: "universe", entityId: universeId });
  });

  const tagInsert = db.prepare(`
    INSERT OR IGNORE INTO booru_resource_inherited_tags (
      resource_id, tag_id, source_kind, source_entity_id, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `);
  const seenSources = new Set<string>();
  sources.forEach(({ kind, entityId }) => {
    if (!entityId) return;
    const key = `${kind}:${entityId}`;
    if (seenSources.has(key)) return;
    seenSources.add(key);
    listEntityTagsSync(db, kind, entityId).forEach((tag) => {
      tagInsert.run(resourceId, tag.id, kind, entityId, nowIso());
    });
  });
}

function syncEntityConsumerInheritanceSync(db: DatabaseSync, kind: BooruEntityKind, entityId: string) {
  const resourceIds = new Set<string>();
  if (kind === "universe") {
    db.prepare(`SELECT resource_id FROM booru_resource_universes WHERE universe_id = ?`).all(entityId)
      .forEach((row: any) => resourceIds.add(String(row?.resource_id || "")));
    db.prepare(`
      SELECT rc.resource_id
      FROM booru_resource_characters rc
      INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
      WHERE cu.universe_id = ?
    `).all(entityId).forEach((row: any) => resourceIds.add(String(row?.resource_id || "")));
  } else {
    const table = getResourceRelationTable(kind);
    const column = getResourceRelationEntityIdColumn(kind);
    if (table && column) {
      db.prepare(`SELECT resource_id FROM ${table} WHERE ${column} = ?`).all(entityId)
        .forEach((row: any) => resourceIds.add(String(row?.resource_id || "")));
    }
  }
  resourceIds.forEach((resourceId) => {
    if (resourceId) {
      syncResourceInheritanceSync(db, resourceId);
      reconcileResourceClassificationSync(db, resourceId);
    }
  });
}

function reconcileResourceClassificationSync(db: DatabaseSync, resourceId: string) {
  const resource = getResourceByIdSync(db, resourceId);

  if (!resource || resource.classificationState === "duplicate-review" || resource.trashedAt) {
    return resource;
  }

  const realityPolicy = resolveBooruReality({
    reality: resource.reality,
    realitySource: resource.realitySource,
    authors: resource.authors,
    artists: resource.artists,
    characters: resource.characters,
    universes: resource.universes,
  });
  const classificationState = getBooruEssentialState({
    reality: realityPolicy.reality,
    authors: resource.authors,
    artists: resource.artists,
    characters: resource.characters,
    universes: resource.universes,
  }).classificationState;

  db.prepare(`
    UPDATE booru_resources
    SET reality = ?, reality_source = ?, classification_state = ?
    WHERE id = ?
  `).run(realityPolicy.reality, realityPolicy.source, classificationState, resourceId);

  return getResourceByIdSync(db, resourceId);
}

function replaceResourceTagAssignmentsSync(
  db: DatabaseSync,
  resourceId: string,
  tagIds: string[],
) {
  db.prepare(`
    DELETE FROM booru_resource_tags
    WHERE resource_id = ?
  `).run(resourceId);

  if (!tagIds.length) {
    return;
  }

  const insertStatement = db.prepare(`
    INSERT INTO booru_resource_tags (
      resource_id,
      tag_id,
      created_at
    ) VALUES (?, ?, ?)
  `);
  const createdAt = nowIso();

  tagIds.forEach((tagId) => {
    insertStatement.run(resourceId, tagId, createdAt);
    db.prepare(`DELETE FROM booru_resource_tag_exclusions WHERE resource_id = ? AND tag_id = ?`).run(resourceId, tagId);
  });
}

function replaceResourceUniverseAssignmentsSync(
  db: DatabaseSync,
  resourceId: string,
  universeIds: string[],
) {
  db.prepare(`
    DELETE FROM booru_resource_universes
    WHERE resource_id = ?
  `).run(resourceId);

  if (!universeIds.length) {
    return;
  }

  const insertStatement = db.prepare(`
    INSERT INTO booru_resource_universes (
      resource_id,
      universe_id,
      sort_order,
      created_at
    ) VALUES (?, ?, ?, ?)
  `);
  const createdAt = nowIso();

  universeIds.forEach((universeId, index) => {
    insertStatement.run(resourceId, universeId, index, createdAt);
    db.prepare(`DELETE FROM booru_resource_universe_exclusions WHERE resource_id = ? AND universe_id = ?`).run(resourceId, universeId);
  });
}

function replaceCharacterUniverseAssignmentSync(
  db: DatabaseSync,
  characterId: string,
  universeId: string,
) {
  if (!universeId) {
    throw new Error("Todo character necesita exactamente un universe.");
  }

  db.prepare(`
    DELETE FROM booru_character_universes
    WHERE character_id = ?
  `).run(characterId);

  db.prepare(`
    INSERT INTO booru_character_universes (
      character_id,
      universe_id,
      created_at
    ) VALUES (?, ?, ?)
  `).run(characterId, universeId, nowIso());
}

function normalizeCharacterUniverseAssignments(
  value: unknown,
): Array<{ characterId: string; universeId: string }> {
  const assignmentMap = new Map<string, string>();

  for (const item of Array.isArray(value) ? value : []) {
    const assignment = item as CharacterUniverseAssignmentPayload;
    const characterId = normalizeBooruOptionalText(assignment?.characterId);
    const universeId = normalizeBooruOptionalText(assignment?.universeId);

    if (!characterId || !universeId) {
      continue;
    }

    assignmentMap.set(characterId, universeId);
  }

  return Array.from(assignmentMap.entries()).map(([characterId, universeId]) => ({
    characterId,
    universeId,
  }));
}

function normalizeDirtyFields(value: unknown) {
  return new Set(
    (Array.isArray(value) ? value : [])
      .map((entry) => normalizeBooruText(entry))
      .filter(Boolean),
  );
}

function normalizeAssignmentPatch(value: unknown): NormalizedBooruAssignmentPatch {
  const patchValue = value as BooruAssignmentPatchPayload;
  return {
    addIds: uniqueBooruIds(patchValue?.addIds),
    removeIds: uniqueBooruIds(patchValue?.removeIds),
  };
}

function applyIdsPatch(currentIds: string[], patch: NormalizedBooruAssignmentPatch) {
  const nextIds = [...currentIds];
  const removedIds = new Set(patch.removeIds);

  const withoutRemoved = nextIds.filter((entry) => !removedIds.has(entry));

  for (const entry of patch.addIds) {
    if (!withoutRemoved.includes(entry)) {
      withoutRemoved.push(entry);
    }
  }

  return withoutRemoved;
}

function getDerivedClassificationStateSync(
  reality: ReturnType<typeof normalizeBooruReality>,
  authorIds: string[],
  artistIds: string[],
  characterRecords: Array<{ universe: BooruLinkedEntityRecord | null }>,
  resourceUniverseIds: string[],
) {
  return getBooruEssentialState({
    reality,
    authors: authorIds,
    artists: artistIds,
    characters: characterRecords,
    universes: resourceUniverseIds,
  }).classificationState;
}

function getLinkedEntityRecordByIdSync(
  db: DatabaseSync,
  kind: BooruEntityKind,
  entityId: string,
) {
  const row = findEntityByIdSync(db, kind, entityId);
  return row ? normalizeLinkedEntityRow(row) : null;
}

function assertValidEntityIdsSync(db: DatabaseSync, kind: BooruEntityKind, entityIds: string[]) {
  for (const entityId of entityIds) {
    if (!findEntityByIdSync(db, kind, entityId)) {
      throw new Error(`Uno de los ${kind}s seleccionados ya no existe.`);
    }
  }
}

function assertValidTagIdsSync(db: DatabaseSync, tagIds: string[]) {
  for (const tagId of tagIds) {
    const tag = findTagByIdSync(db, tagId);

    if (!tag || String(tag.source || "manual") !== "manual") {
      throw new Error("Una de las tags manuales seleccionadas ya no existe.");
    }
  }
}

function buildCharacterRecordsForIdsSync(
  db: DatabaseSync,
  characterIds: string[],
) {
  return characterIds
    .map((characterId) => {
      const baseCharacter = getLinkedEntityRecordByIdSync(db, "character", characterId);

      if (!baseCharacter) {
        return null;
      }

      return {
        ...baseCharacter,
        universe: getCharacterUniverseRecordSync(db, characterId),
      };
    })
    .filter(Boolean) as BooruCharacterLinkedEntityRecord[];
}

function resolveRelationFieldUpdateMode(
  payload: SaveResourceMetadataPayload | SaveBasicClassificationPayload,
  dirtyFields: Set<string>,
  fieldName: string,
  replaceKey: keyof SaveResourceMetadataPayload,
  patchKey: keyof SaveResourceMetadataPayload,
) {
  if (dirtyFields.size) {
    if (!dirtyFields.has(fieldName)) {
      return "keep";
    }

    return payload?.[patchKey] ? "patch" : "replace";
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, String(patchKey))) {
    return "patch";
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, String(replaceKey))) {
    return "replace";
  }

  return "keep";
}

function getResourceFieldIds(resource: any, fieldName: "authors" | "artists" | "characters" | "directUniverses" | "manualTags") {
  if (!Array.isArray(resource?.[fieldName])) {
    return [];
  }

  return resource[fieldName].map((item: any) => item.id);
}

function resolveNextResourceDraftSync(
  db: DatabaseSync,
  resource: any,
  payload: SaveResourceMetadataPayload | SaveBasicClassificationPayload,
  dirtyFields: Set<string>,
) {
  const hasRealityField = dirtyFields.size
    ? dirtyFields.has("reality")
    : payload && Object.prototype.hasOwnProperty.call(payload, "reality");
  const requestedCharacterUniverses = normalizeCharacterUniverseAssignments(payload?.characterUniverses);
  const requestedReality = hasRealityField ? normalizeBooruReality(payload?.reality) : resource.reality;
  const authorMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "authors", "authorIds", "authorPatch");
  const artistMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "artists", "artistIds", "artistPatch");
  const characterMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "characters", "characterIds", "characterPatch");
  const universeMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "universes", "universeIds", "universePatch");
  const tagMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "manualTags", "tagIds", "tagPatch");
  const currentAuthorIds = getResourceFieldIds(resource, "authors");
  const currentArtistIds = getResourceFieldIds(resource, "artists");
  const currentCharacterIds = getResourceFieldIds(resource, "characters");
  const currentUniverseIds = getResourceFieldIds(resource, "directUniverses");
  const currentTagIds = getResourceFieldIds(resource, "manualTags");
  const authorIds = authorMode === "replace"
    ? uniqueBooruIds(payload?.authorIds)
    : authorMode === "patch"
      ? applyIdsPatch(currentAuthorIds, normalizeAssignmentPatch(payload?.authorPatch))
      : currentAuthorIds;
  const artistIds = artistMode === "replace"
    ? uniqueBooruIds(payload?.artistIds)
    : artistMode === "patch"
      ? applyIdsPatch(currentArtistIds, normalizeAssignmentPatch(payload?.artistPatch))
      : currentArtistIds;
  const characterIds = characterMode === "replace"
    ? uniqueBooruIds(payload?.characterIds)
    : characterMode === "patch"
      ? applyIdsPatch(currentCharacterIds, normalizeAssignmentPatch(payload?.characterPatch))
      : currentCharacterIds;
  const universeIds = universeMode === "replace"
    ? uniqueBooruIds(payload?.universeIds)
    : universeMode === "patch"
      ? applyIdsPatch(currentUniverseIds, normalizeAssignmentPatch(payload?.universePatch))
      : currentUniverseIds;
  const tagIds = tagMode === "replace"
    ? uniqueBooruIds(payload?.tagIds)
    : tagMode === "patch"
      ? applyIdsPatch(currentTagIds, normalizeAssignmentPatch(payload?.tagPatch))
      : currentTagIds;

  assertValidEntityIdsSync(db, "author", authorIds);
  assertValidEntityIdsSync(db, "artist", artistIds);
  assertValidEntityIdsSync(db, "character", characterIds);
  assertValidEntityIdsSync(db, "universe", universeIds);
  assertValidTagIdsSync(db, tagIds);

  requestedCharacterUniverses.forEach(({ characterId, universeId }) => {
    if (!findEntityByIdSync(db, "character", characterId)) {
      throw new Error("Uno de los characters seleccionados ya no existe.");
    }

    if (!findEntityByIdSync(db, "universe", universeId)) {
      throw new Error("Uno de los universes seleccionados ya no existe.");
    }
  });

  const requestedCharacterUniverseMap = new Map(
    requestedCharacterUniverses.map((assignment) => [assignment.characterId, assignment.universeId]),
  );
  const characterRecords = characterIds.map((characterId) => {
    const baseCharacter = getLinkedEntityRecordByIdSync(db, "character", characterId);

    if (!baseCharacter) {
      throw new Error("Uno de los characters seleccionados ya no existe.");
    }

    const assignedUniverseId = requestedCharacterUniverseMap.get(characterId);
    const assignedUniverse = assignedUniverseId
      ? getLinkedEntityRecordByIdSync(db, "universe", assignedUniverseId)
      : null;

    return {
      ...baseCharacter,
      universe: assignedUniverse || getCharacterUniverseRecordSync(db, characterId),
    };
  });

  const realityPolicy = resolveBooruReality({
    reality: requestedReality,
    realitySource: resource.realitySource,
    realityWasEdited: Boolean(hasRealityField),
    authors: authorIds,
    artists: artistIds,
    characters: characterIds,
    universes: universeIds,
  });
  const reality = realityPolicy.reality;

  return {
    resourceId: resource.id,
    reality,
    realitySource: realityPolicy.source,
    authorIds,
    artistIds,
    characterIds,
    universeIds,
    tagIds,
    requestedCharacterUniverses,
    characterRecords,
    classificationState: getDerivedClassificationStateSync(
      reality,
      authorIds,
      artistIds,
      characterRecords,
      universeIds,
    ),
    dirtyFields,
  };
}

function assertBasicClassificationCompleteSync(nextDraft: ReturnType<typeof resolveNextResourceDraftSync>) {
  const essential = getBooruEssentialState({
    reality: nextDraft.reality,
    authors: nextDraft.authorIds,
    artists: nextDraft.artistIds,
    characters: nextDraft.characterRecords,
    universes: nextDraft.universeIds,
  });

  if (essential.missing.includes("reality")) {
    throw new Error("Debes elegir si el recurso es real o ficticio.");
  }

  if (essential.missing.includes("author")) {
    throw new Error("Un recurso real necesita al menos una Persona.");
  }

  if (essential.missing.includes("character")) {
    throw new Error("Un recurso ficticio necesita al menos un Character.");
  }

  if (essential.missing.includes("universe")) {
    throw new Error("Cada character de un recurso ficticio necesita universe.");
  }

  if (essential.missing.includes("artist")) {
    throw new Error("Un recurso ficticio necesita al menos un Artist.");
  }
}

function saveResourcesSync(
  db: DatabaseSync,
  payload: SaveResourceMetadataPayload | SaveBasicClassificationPayload,
  { requireBasicClassification = false }: { requireBasicClassification?: boolean } = {},
) {
  const explicitResourceId = normalizeBooruOptionalText(payload?.resourceId);
  const resourceIds = uniqueBooruIds([
    explicitResourceId,
    ...((Array.isArray(payload?.resourceIds) ? payload.resourceIds : [])),
  ]);

  if (!resourceIds.length) {
    throw new Error("resourceId es obligatorio.");
  }

  const dirtyFields = normalizeDirtyFields(payload?.dirtyFields);
  const resources = resourceIds.map((resourceId) => {
    const resource = getResourceByIdSync(db, resourceId);

    if (!resource) {
      throw new Error("No se encontro uno de los recursos que quieres actualizar.");
    }

    if (resource.classificationState === "duplicate-review") {
      throw new Error("Los duplicados exactos no se editan desde este flujo.");
    }

    if (resource.trashedAt) {
      throw new Error("Los recursos en papelera deben restaurarse antes de editarse.");
    }

    return resource;
  });

  const nextDrafts = resources.map((resource) => resolveNextResourceDraftSync(db, resource, payload, dirtyFields));

  if (requireBasicClassification) {
    nextDrafts.forEach(assertBasicClassificationCompleteSync);
  }

  withTransaction(db, () => {
    const requestedCharacterUniverses = normalizeCharacterUniverseAssignments(payload?.characterUniverses);
    requestedCharacterUniverses.forEach(({ characterId, universeId }) => {
      replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
    });

    nextDrafts.forEach((nextDraft) => {
      const dirtyFieldSet = nextDraft.dirtyFields;
      const shouldWriteEverything = !dirtyFieldSet.size;

      if (shouldWriteEverything || dirtyFieldSet.has("authors")) {
        replaceResourceEntityAssignmentsSync(db, "author", nextDraft.resourceId, nextDraft.authorIds);
      }

      if (shouldWriteEverything || dirtyFieldSet.has("artists")) {
        replaceResourceEntityAssignmentsSync(db, "artist", nextDraft.resourceId, nextDraft.artistIds);
      }

      if (shouldWriteEverything || dirtyFieldSet.has("characters")) {
        replaceResourceEntityAssignmentsSync(db, "character", nextDraft.resourceId, nextDraft.characterIds);
      }

      if (shouldWriteEverything || dirtyFieldSet.has("universes")) {
        replaceResourceUniverseAssignmentsSync(db, nextDraft.resourceId, nextDraft.universeIds);
      }

      if (shouldWriteEverything || dirtyFieldSet.has("manualTags")) {
        replaceResourceTagAssignmentsSync(db, nextDraft.resourceId, nextDraft.tagIds);
      }

      syncResourceInheritanceSync(db, nextDraft.resourceId);

      db.prepare(`
        UPDATE booru_resources
        SET reality = ?, reality_source = ?, classification_state = ?, last_seen_at = ?
        WHERE id = ?
      `).run(
        nextDraft.reality,
        nextDraft.realitySource,
        nextDraft.classificationState,
        nowIso(),
        nextDraft.resourceId,
      );
      reconcileResourceClassificationSync(db, nextDraft.resourceId);
    });
  });

  const refreshedResources = resourceIds.map((resourceId) => getResourceByIdSync(db, resourceId)).filter(Boolean);
  return refreshedResources.length === 1 ? refreshedResources[0] : refreshedResources;
}

function saveResourceMetadataSync(db: DatabaseSync, payload: SaveResourceMetadataPayload) {
  return saveResourcesSync(db, payload, { requireBasicClassification: false });
}

function saveBasicClassificationSync(db: DatabaseSync, payload: SaveBasicClassificationPayload) {
  return saveResourcesSync(db, payload, { requireBasicClassification: true });
}

function quickAssignEntitySync(db: DatabaseSync, payload: QuickAssignEntityPayload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds, payload?.resourceId);
  const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
  const entityId = normalizeBooruOptionalText(payload?.entityId);

  if (!resourceIds.length || !entityId) {
    throw new Error("resourceId/resourceIds y entityId son obligatorios.");
  }

  if (kind !== "author" && kind !== "artist" && kind !== "character" && kind !== "universe") {
    throw new Error("El tipo de asignacion rapida no existe en Booru.");
  }

  if (!findEntityByIdSync(db, kind, entityId)) {
    throw new Error("La entidad objetivo ya no existe.");
  }

  const resources = resourceIds.map((resourceId) => {
    const resource = getResourceByIdSync(db, resourceId);

    if (!resource) {
      throw new Error("No se encontro uno de los recursos que quieres actualizar.");
    }

    if (resource.classificationState === "duplicate-review") {
      throw new Error("Los duplicados exactos no se editan desde este flujo.");
    }

    if (resource.trashedAt) {
      throw new Error("Los recursos en papelera deben restaurarse antes de editarse.");
    }

    return resource;
  });

  const updatedResources = resources.map((resource) => {
    if (kind === "author") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        dirtyFields: ["authors"],
        authorPatch: { addIds: [entityId] },
      });
    }

    if (kind === "artist") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        dirtyFields: ["artists"],
        artistPatch: { addIds: [entityId] },
      });
    }

    if (kind === "universe") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        dirtyFields: ["universes"],
        universePatch: { addIds: [entityId] },
      });
    }

    return saveResourceMetadataSync(db, {
      resourceId: resource.id,
      dirtyFields: ["characters"],
      characterPatch: { addIds: [entityId] },
    });
  }).flatMap((resourceValue) => Array.isArray(resourceValue) ? resourceValue : [resourceValue]);

  return updatedResources.length === 1 ? updatedResources[0] : updatedResources;
}

async function pasteClipboardImageToEntitySync(
  ctx: NexusBackendPluginContext,
  db: DatabaseSync,
  payload: PasteClipboardImageToEntityPayload,
  tempFilePath: string,
) {
  const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
  const entityId = normalizeBooruText(payload?.entityId);

  if (!ENTITY_TABLES[kind]) {
    throw new Error("El tipo de entidad solicitado no existe en Booru.");
  }

  if (!entityId) {
    throw new Error("La entidad solicitada no es valida.");
  }

  if (!findEntityByIdSync(db, kind, entityId)) {
    throw new Error("La entidad objetivo ya no existe.");
  }

  try {
    const ingestResult = await ingestFile(ctx, tempFilePath, {
      updateWatcherState: false,
      sourcePathOverride: "clipboard://image",
      originalFilenameOverride: buildClipboardImportedFilename(),
    });

    if (!ingestResult?.resource?.id) {
      throw new Error("No se pudo importar la imagen del portapapeles a Booru.");
    }

    const resource = quickAssignEntitySync(db, {
      resourceId: ingestResult.resource.id,
      kind,
      entityId,
    });
    const profile = getEntityProfileSync(db, kind, entityId);

    if (!profile) {
      throw new Error("No se pudo reconstruir el perfil despues del pegado.");
    }

    return {
      profile,
      resource,
      reusedCanonical: ingestResult.reusedCanonical,
      createdResourceId: ingestResult.createdResourceId,
      reason: ingestResult.reason,
      updatedResourceIds: ingestResult.updatedResourceIds,
      createdResourceIds: ingestResult.createdResourceIds,
    };
  } finally {
    await removeFileIfExists(tempFilePath);
  }
}

type ResolvedClipboardAssociation = {
  kind: BooruEntityKind | "tag";
  entityId: string;
};

function resolveClipboardAssociationsSync(db: DatabaseSync, payload: PasteClipboardMediaPayload) {
  const candidates = Array.isArray(payload?.associations) && payload.associations.length
    ? payload.associations
    : [payload?.association && typeof payload.association === "object" ? payload.association : payload];
  const resolved: ResolvedClipboardAssociation[] = [];
  const seen = new Set<string>();

  candidates.forEach((association) => {
    const kind = normalizeBooruText(association?.kind) as BooruEntityKind | "tag";
    let entityId = normalizeBooruText(association?.entityId);

    if (kind !== "tag" && !ENTITY_TABLES[kind]) {
      throw new Error("Elegí una entidad válida para asociar el recurso.");
    }

    if (!entityId) {
      const entityName = normalizeBooruText(association?.entityName);
      if (!entityName) throw new Error("Escribí o elegí una entidad antes de pegar.");

      if (kind === "tag") {
        entityId = String(ensureTagSync(db, entityName)?.tag?.id || "");
      } else if (kind === "character") {
        let universeId = normalizeBooruText(association?.universeId);
        if (!universeId) {
          const universeName = normalizeBooruText(association?.universeName);
          if (!universeName) throw new Error("Un Character necesita un Universe.");
          universeId = String(ensureTypedEntitySync(db, "universe", universeName)?.entity?.id || "");
        }
        entityId = String(ensureCharacterInUniverseSync(db, { name: entityName, universeId })?.entity?.id || "");
      } else {
        entityId = String(ensureTypedEntitySync(db, kind, entityName, association?.aliasNames)?.entity?.id || "");
      }
    }

    const targetExists = kind === "tag"
      ? findTagByIdSync(db, entityId)
      : findEntityByIdSync(db, kind, entityId);
    if (!entityId || !targetExists) throw new Error("Una de las asociaciones objetivo ya no existe.");

    const identity = `${kind}:${entityId}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    resolved.push({ kind, entityId });
  });

  if (!resolved.length) throw new Error("Elegí al menos una asociación antes de pegar.");
  return resolved;
}

function mergeClipboardAssociationsIntoResourceSync(
  db: DatabaseSync,
  resourceId: string,
  associations: ResolvedClipboardAssociation[],
) {
  const idsByKind = new Map<string, string[]>();
  associations.forEach(({ kind, entityId }) => {
    idsByKind.set(kind, [...(idsByKind.get(kind) || []), entityId]);
  });

  return saveResourceMetadataSync(db, {
    resourceId,
    dirtyFields: [
      ...(idsByKind.has("author") ? ["authors"] : []),
      ...(idsByKind.has("artist") ? ["artists"] : []),
      ...(idsByKind.has("character") ? ["characters"] : []),
      ...(idsByKind.has("universe") ? ["universes"] : []),
      ...(idsByKind.has("tag") ? ["manualTags"] : []),
    ],
    authorPatch: { addIds: idsByKind.get("author") || [] },
    artistPatch: { addIds: idsByKind.get("artist") || [] },
    characterPatch: { addIds: idsByKind.get("character") || [] },
    universePatch: { addIds: idsByKind.get("universe") || [] },
    tagPatch: { addIds: idsByKind.get("tag") || [] },
  });
}

async function pasteClipboardMediaSync(
  ctx: NexusBackendPluginContext,
  db: DatabaseSync,
  payload: PasteClipboardMediaPayload,
  tempFilePath: string,
) {
  const associations = resolveClipboardAssociationsSync(db, payload);

  try {
    const ingestResult = await ingestFile(ctx, tempFilePath, {
      updateWatcherState: false,
      sourcePathOverride: "clipboard://image",
      originalFilenameOverride: buildClipboardImportedFilename(),
    });

    if (!ingestResult?.resource?.id) {
      throw new Error("No se pudo importar el recurso del portapapeles a Booru.");
    }

    const resource = mergeClipboardAssociationsIntoResourceSync(db, ingestResult.resource.id, associations);
    const profileAssociation = associations.find((association) => association.kind !== "tag") || null;

    return {
      profile: profileAssociation
        ? getEntityProfileSync(db, profileAssociation.kind as BooruEntityKind, profileAssociation.entityId)
        : null,
      resource,
      associations,
      reusedCanonical: ingestResult.reusedCanonical,
      createdResourceId: ingestResult.createdResourceId,
      reason: ingestResult.reason,
      updatedResourceIds: ingestResult.updatedResourceIds,
      createdResourceIds: ingestResult.createdResourceIds,
    };
  } finally {
    await removeFileIfExists(tempFilePath);
  }
}

function normalizeRequestedResourceIds(value: unknown, fallbackResourceId: unknown = null) {
  return uniqueBooruIds([
    normalizeBooruOptionalText(fallbackResourceId),
    ...((Array.isArray(value) ? value : [])),
  ]);
}

function trashResourcesSync(db: DatabaseSync, payload: TrashResourcesPayload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds);

  if (!resourceIds.length) {
    throw new Error("Necesitas al menos un recurso para enviarlo a la papelera.");
  }

  const trashedAt = nowIso();

  withTransaction(db, () => {
    const updateStatement = db.prepare(`
      UPDATE booru_resources
      SET trashed_at = ?, last_seen_at = ?
      WHERE id = ?
    `);

    resourceIds.forEach((resourceId) => {
      const resource = getResourceByIdSync(db, resourceId);

      if (!resource) {
        throw new Error("Uno de los recursos seleccionados ya no existe.");
      }

      updateStatement.run(trashedAt, trashedAt, resourceId);
    });
  });

  return resourceIds.map((resourceId) => getResourceByIdSync(db, resourceId)).filter(Boolean);
}

function restoreResourcesSync(db: DatabaseSync, payload: TrashResourcesPayload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds);

  if (!resourceIds.length) {
    throw new Error("Necesitas al menos un recurso para restaurarlo.");
  }

  withTransaction(db, () => {
    const updateStatement = db.prepare(`
      UPDATE booru_resources
      SET trashed_at = NULL, last_seen_at = ?
      WHERE id = ?
    `);

    resourceIds.forEach((resourceId) => {
      const resource = getResourceByIdSync(db, resourceId);

      if (!resource) {
        throw new Error("Uno de los recursos seleccionados ya no existe.");
      }

      updateStatement.run(nowIso(), resourceId);
    });
  });

  return resourceIds.map((resourceId) => getResourceByIdSync(db, resourceId)).filter(Boolean);
}

async function purgeResourcesSync(db: DatabaseSync, payload: TrashResourcesPayload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds);

  if (!resourceIds.length) {
    throw new Error("Necesitas al menos un recurso para purgarlo.");
  }

  const resources = resourceIds.map((resourceId) => {
    const resource = getResourceByIdSync(db, resourceId);

    if (!resource) {
      throw new Error("Uno de los recursos seleccionados ya no existe.");
    }

    return {
      resource,
      thumbnailRow: getThumbnailRowSync(db, resourceId),
    };
  });

  withTransaction(db, () => {
    const deleteStatement = db.prepare(`
      DELETE FROM booru_resources
      WHERE id = ?
    `);

    resourceIds.forEach((resourceId) => {
      deleteStatement.run(resourceId);
    });
  });

  await Promise.all(resources.map(async ({ resource, thumbnailRow }) => {
    const normalizedPath = normalizeBooruOptionalText(resource?.storagePath);

    if (!normalizedPath) {
      return;
    }

    try {
      await fsp.unlink(normalizedPath);
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    const explicitThumbnailPath = normalizeBooruOptionalText(thumbnailRow?.storage_path);
    const outputPaths = runtimeState?.thumbsRoot ? getThumbnailOutputPaths(runtimeState.thumbsRoot, resource.id) : null;
    const thumbnailPaths = new Set<string>();

    if (explicitThumbnailPath) {
      thumbnailPaths.add(explicitThumbnailPath);
    }

    if (outputPaths?.webpPath) {
      thumbnailPaths.add(outputPaths.webpPath);
    }

    if (outputPaths?.jpegPath) {
      thumbnailPaths.add(outputPaths.jpegPath);
    }

    await Promise.all(Array.from(thumbnailPaths).map((filePath) => removeFileIfExists(filePath)));
  }));

  if (runtimeState) {
    const trashedIds = new Set(resourceIds);
    runtimeState.thumbnailHighPriorityIds = runtimeState.thumbnailHighPriorityIds.filter((resourceId) => !trashedIds.has(resourceId));
    runtimeState.thumbnailLowPriorityIds = runtimeState.thumbnailLowPriorityIds.filter((resourceId) => !trashedIds.has(resourceId));
    resourceIds.forEach((resourceId) => {
      runtimeState?.thumbnailQueuedIds.delete(resourceId);
    });
  }

  return {
    purgedIds: resourceIds,
  };
}

function resolveBraveExecutableCandidatePaths() {
  return [
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
      : "",
    process.env.PROGRAMFILES
      ? path.join(process.env.PROGRAMFILES, "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
      : "",
    process.env["PROGRAMFILES(X86)"]
      ? path.join(process.env["PROGRAMFILES(X86)"], "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
      : "",
    "brave.exe",
  ].filter(Boolean);
}

async function openResourceInBraveSync(db: DatabaseSync, payload: OpenInBravePayload) {
  const resourceId = normalizeBooruOptionalText(payload?.resourceId);

  if (!resourceId) {
    throw new Error("resourceId es obligatorio.");
  }

  const resource = getResourceByIdSync(db, resourceId);

  if (!resource) {
    throw new Error("No se encontro el recurso solicitado.");
  }

  if (resource.mediaKind !== "image" && resource.mediaKind !== "gif") {
    throw new Error("Buscar en Google solo esta disponible para imagenes o GIF.");
  }

  const normalizedStoragePath = normalizeBooruOptionalText(resource.storagePath);

  if (!normalizedStoragePath || !fs.existsSync(normalizedStoragePath)) {
    throw new Error("No se encontro el archivo que quieres abrir en Brave.");
  }

  const fileUrl = encodeURI(`file:///${normalizedStoragePath.replace(/\\/g, "/")}`);
  const spawnErrors: string[] = [];

  for (const executablePath of resolveBraveExecutableCandidatePaths()) {
    try {
      const child = spawn(
        executablePath,
        [`--profile-directory=${BRAVE_PROFILE_DIRECTORY}`, fileUrl],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        },
      );

      child.unref();
      return {
        executablePath,
        fileUrl,
      };
    } catch (error: any) {
      spawnErrors.push(error?.message || String(error));
    }
  }

  throw new Error(
    `No se pudo abrir Brave con el perfil ${BRAVE_PROFILE_DIRECTORY}. ${spawnErrors.join(" | ")}`.trim(),
  );
}

function addResourceEntityAssignmentSync(
  db: DatabaseSync,
  resourceId: string,
  kind: BooruEntityKind,
  entityId: string,
) {
  const relationTable = kind === "universe" ? "booru_resource_universes" : getResourceRelationTable(kind);
  const relationEntityIdColumn = kind === "universe" ? "universe_id" : getResourceRelationEntityIdColumn(kind);
  if (!relationTable || !relationEntityIdColumn) throw new Error("El tipo de clasificacion rapida no existe.");

  db.prepare(`
    INSERT OR IGNORE INTO ${relationTable} (
      resource_id,
      ${relationEntityIdColumn},
      sort_order,
      created_at
    ) VALUES (
      ?, ?,
      COALESCE((SELECT MAX(sort_order) + 1 FROM ${relationTable} WHERE resource_id = ?), 0),
      ?
    )
  `).run(resourceId, entityId, resourceId, nowIso());

  if (kind === "universe") {
    db.prepare(`DELETE FROM booru_resource_universe_exclusions WHERE resource_id = ? AND universe_id = ?`)
      .run(resourceId, entityId);
  }
}

function reintegrateCanonicalResourceSync(
  db: DatabaseSync,
  resourceId: string,
  importedAt: string,
  fastTarget: RuntimeState["fastClassification"] = null,
) {
  const canonical = getResourceByIdSync(db, resourceId);
  if (!canonical || canonical.classificationState === "duplicate-review" || canonical.trashedAt) {
    throw new Error("No se pudo reintegrar el recurso canonico detectado en Booru.");
  }

  withTransaction(db, () => {
    db.prepare(`
      UPDATE booru_resources
      SET imported_at = ?, last_seen_at = ?
      WHERE id = ?
    `).run(importedAt, importedAt, resourceId);

    if (fastTarget && findEntityByIdSync(db, fastTarget.kind, fastTarget.entityId)) {
      addResourceEntityAssignmentSync(db, resourceId, fastTarget.kind, fastTarget.entityId);
    }

    syncResourceInheritanceSync(db, resourceId);
    reconcileResourceClassificationSync(db, resourceId);
  });

  return getResourceByIdSync(db, resourceId);
}

async function ingestHashedFile(
  state: RuntimeState,
  absoluteFilePath: string,
  mediaDescriptor: NonNullable<ReturnType<typeof resolveMediaDescriptor>>,
  contentHash: string,
  options: IngestFileOptions,
): Promise<IngestFileResult> {
  assertRuntimeStateCurrent(state);
  const canonicalResource = getCanonicalResourceByHash(state.db!, contentHash);
  const importedAt = nowIso();
  const originalFilename = String(
    options.originalFilenameOverride
    || path.basename(absoluteFilePath),
  ).trim() || path.basename(absoluteFilePath);
  const updateWatcherState = options.updateWatcherState !== false;

  if (canonicalResource) {
    const canonicalId = String(canonicalResource.id || "");
    const reusedResource = reintegrateCanonicalResourceSync(
      state.db!,
      canonicalId,
      importedAt,
      state.fastClassification,
    );
    if (!reusedResource) throw new Error("No se pudo reutilizar el recurso canonico detectado en Booru.");

    if (path.resolve(reusedResource.storagePath) !== absoluteFilePath) {
      await removeFileIfExists(absoluteFilePath);
      assertRuntimeStateCurrent(state);
    }

    if (updateWatcherState) {
      state.watcherState.lastIngestedAt = importedAt;
      state.watcherState.lastIngestedOriginalFilename = originalFilename;
      state.watcherState.lastIngestedStoragePath = reusedResource.storagePath;
      state.watcherState.lastError = "";
    }

    queueThumbnailGeneration([canonicalId], "high");
    scheduleRuntimeInvalidationForState(state, "resourcesVersion", "entitiesVersion", "watcherVersion");
    return createBooruIngestMutation({ resource: reusedResource, reusedCanonical: true }) as IngestFileResult;
  }

  const resourceId = crypto.randomUUID();
  const storageFilename = `${resourceId}${mediaDescriptor.extension}`;
  const storagePath = path.join(state.mediaRoot, storageFilename);
  const sourcePath = options.sourcePathOverride === undefined
    ? absoluteFilePath
    : (options.sourcePathOverride || null);

  await moveFile(absoluteFilePath, storagePath);
  assertRuntimeStateCurrent(state);
  const fileStat = await fsp.stat(storagePath);
  assertRuntimeStateCurrent(state);

  state.db!.prepare(`
    INSERT INTO booru_resources (
      id, storage_filename, storage_path, original_filename, extension, mime_type,
      media_kind, file_size, width, height, duration_ms, content_hash, reality,
      classification_state, canonical_resource_id, source_path, media_info_status,
      media_info_error, imported_at, last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resourceId, storageFilename, storagePath, originalFilename,
    mediaDescriptor.extension, mediaDescriptor.mimeType, mediaDescriptor.mediaKind,
    Number(fileStat.size || 0), null, null, null, contentHash, null, "unclassified",
    null, sourcePath, "pending", null, importedAt, importedAt,
  );
  ensureThumbnailPendingRowSync(state.db!, resourceId, contentHash);

  const fastTarget = state.fastClassification;
  if (fastTarget && findEntityByIdSync(state.db!, fastTarget.kind, fastTarget.entityId)) {
    quickAssignEntitySync(state.db!, {
      resourceId,
      kind: fastTarget.kind,
      entityId: fastTarget.entityId,
    });
  }

  if (updateWatcherState) {
    state.watcherState.lastIngestedAt = importedAt;
    state.watcherState.lastIngestedOriginalFilename = originalFilename;
    state.watcherState.lastIngestedStoragePath = storagePath;
    state.watcherState.lastError = "";
  }

  queueThumbnailGeneration([resourceId], "high");
  scheduleRuntimeInvalidationForState(state, "resourcesVersion", "entitiesVersion", "watcherVersion");
  return createBooruIngestMutation({
    resource: getResourceByIdSync(state.db!, resourceId),
    createdResourceId: resourceId,
  }) as IngestFileResult;
}

async function ingestFile(
  ctx: NexusBackendPluginContext,
  filePath: string,
  options: IngestFileOptions = {},
): Promise<IngestFileResult | null> {
  const state = runtimeState;

  if (!state || !state.db) {
    return null;
  }

  const absoluteFilePath = path.resolve(filePath);
  const mediaDescriptor = resolveMediaDescriptor(absoluteFilePath);
  if (!mediaDescriptor) {
    return null;
  }

  if (!fs.existsSync(absoluteFilePath)) {
    return null;
  }

  const contentHash = await computeFileHash(absoluteFilePath);
  assertRuntimeStateCurrent(state);
  return state.ingestByContentHash(contentHash, () => ingestHashedFile(
    state,
    absoluteFilePath,
    mediaDescriptor,
    contentHash,
    options,
  ));
}

function queueIngest(ctx: NexusBackendPluginContext, filePath: string) {
  const state = runtimeState;

  if (!isRuntimeStateActive(state)) {
    return;
  }

  const absoluteFilePath = path.resolve(String(filePath || ""));

  if (!absoluteFilePath || state.queuedPaths.has(absoluteFilePath)) {
    return;
  }

  state.queuedPaths.add(absoluteFilePath);
  state.watcherState.pendingCount += 1;
  if (!state.ingestTaskActive) {
    state.ingestTaskActive = true;
    state.ingestTaskTotal = 0;
    state.ingestTaskCompleted = 0;
    state.ingestTaskFailed = 0;
    state.ctx.tasks.start({
      id: "booru.ingest",
      title: "Importando medios",
      detail: "Preparando archivos de Booru",
      progress: {
        current: 0,
        total: 1,
        label: "archivos",
      },
    });
  }
  state.ingestTaskTotal += 1;
  state.ctx.tasks.update("booru.ingest", {
    detail: `${state.watcherState.pendingCount} ${state.watcherState.pendingCount === 1 ? "archivo pendiente" : "archivos pendientes"}`,
    progress: {
      current: state.ingestTaskCompleted + state.ingestTaskFailed,
      total: state.ingestTaskTotal,
      label: "archivos",
    },
  });
  scheduleRuntimeInvalidationForState(state, "watcherVersion");
  let ingestFailed = false;
  state.queue = state.queue
    .then(() => {
      assertRuntimeStateActive(state);
      return ingestFile(ctx, absoluteFilePath);
    })
    .catch((error) => {
      if (isRuntimeCancellation(error) || !isRuntimeStateActive(state)) {
        return;
      }
      state.watcherState.lastError =
        error instanceof Error ? error.message : "No se pudo ingerir el archivo.";
      ingestFailed = true;
      state.ingestTaskFailed += 1;
      state.ctx.tasks.update("booru.ingest", {
        detail: state.watcherState.lastError,
        progress: {
          current: state.ingestTaskCompleted + state.ingestTaskFailed,
          total: state.ingestTaskTotal,
          label: "archivos",
        },
      });
      state.ctx.tasks.fail("booru.ingest", {
        message: "No se pudieron importar todos los medios.",
        detail: state.watcherState.lastError,
      });
      scheduleRuntimeInvalidationForState(state, "watcherVersion");
    })
    .finally(() => {
      if (!ingestFailed) {
        state.ingestTaskCompleted += 1;
      }
      state.queuedPaths.delete(absoluteFilePath);
      state.watcherState.pendingCount = Math.max(0, state.watcherState.pendingCount - 1);
      state.ctx.tasks.update("booru.ingest", {
        detail: state.watcherState.pendingCount > 0
          ? `${state.watcherState.pendingCount} ${state.watcherState.pendingCount === 1 ? "archivo pendiente" : "archivos pendientes"}`
          : state.ingestTaskFailed > 0
            ? `${state.ingestTaskFailed} ${state.ingestTaskFailed === 1 ? "archivo con error" : "archivos con error"}`
            : "Finalizando importación",
        progress: {
          current: state.ingestTaskCompleted + state.ingestTaskFailed,
          total: state.ingestTaskTotal,
          label: "archivos",
        },
      });
      if (state.watcherState.pendingCount === 0) {
        if (state.ingestTaskFailed === 0) {
          state.ctx.tasks.complete("booru.ingest");
        }
        state.ingestTaskActive = false;
      }
      scheduleRuntimeInvalidationForState(state, "watcherVersion");
    });
}

async function stopWatcher(state: RuntimeState | null = runtimeState) {
  if (!state?.watcher) {
    if (state) {
      state.watcherState.active = false;
      state.watcherState.stage = "idle";
      scheduleRuntimeInvalidationForState(state, "watcherVersion");
    }
    return;
  }

  await state.watcher.close();
  state.watcher = null;
  state.watcherState.active = false;
  state.watcherState.stage = "idle";
  scheduleRuntimeInvalidationForState(state, "watcherVersion");
}

async function restartWatcher(
  state: RuntimeState,
  ctx: NexusBackendPluginContext,
  settingsValue: Record<string, unknown>,
) {
  if (!isRuntimeStateActive(state)) {
    return;
  }

  await stopWatcher(state);
  assertRuntimeStateActive(state);
  state.python = resolvePythonStatus(settingsValue);
  state.watcherState.watchedPath = readBooruWatchFolderPath(settingsValue);
  state.watcherState.lastError = "";

  const watchFolderPath = readBooruWatchFolderPath(settingsValue);

  if (!watchFolderPath) {
    state.watcherState.stage = "idle-no-folder";
    state.ctx.tasks.complete("booru.watcher");
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }

  if (!state.python.available) {
    state.watcherState.stage = "blocked-python";
    state.watcherState.lastError =
      state.python.error
      || "No se encontro Python para Booru. Configura pythonExecutable o asegurate de que python este disponible en PATH.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError,
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "Booru no puede vigilar la carpeta.",
      detail: state.watcherState.lastError,
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }

  if (!fs.existsSync(watchFolderPath) || !fs.statSync(watchFolderPath).isDirectory()) {
    state.watcherState.stage = "blocked-folder";
    state.watcherState.lastError = "La carpeta vigilada no existe o no es una carpeta valida.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError,
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "Booru no puede vigilar la carpeta.",
      detail: state.watcherState.lastError,
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }

  if (watchFolderPath.startsWith(state.storageRoot)) {
    state.watcherState.stage = "blocked-folder";
    state.watcherState.lastError = "La carpeta vigilada no puede apuntar al storage interno de Booru.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError,
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "Booru no puede vigilar la carpeta.",
      detail: state.watcherState.lastError,
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }

  state.watcherState.stage = "starting";
  scheduleRuntimeInvalidationForState(state, "watcherVersion");
  state.watcher = chokidar.watch(watchFolderPath, {
    ignoreInitial: false,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 1500,
      pollInterval: 150,
    },
  });

  state.watcher.on("add", (addedPath: string) => {
    if (isRuntimeStateActive(state)) {
      queueIngest(ctx, addedPath);
    }
  });
  state.watcher.on("ready", () => {
    if (!isRuntimeStateActive(state)) {
      return;
    }
    state.watcherState.active = true;
    state.watcherState.stage = "watching";
    state.ctx.tasks.complete("booru.watcher");
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
  });
  state.watcher.on("error", (error: Error) => {
    if (!isRuntimeStateActive(state)) {
      return;
    }
    state.watcherState.active = false;
    state.watcherState.stage = "error";
    state.watcherState.lastError = error instanceof Error ? error.message : "Error en el watcher de Booru.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError,
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "El watcher de Booru se detuvo.",
      detail: state.watcherState.lastError,
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
  });
}

async function rescanWatchFolder(ctx: NexusBackendPluginContext, settingsValue: Record<string, unknown>) {
  const state = runtimeState;
  const watchFolderPath = readBooruWatchFolderPath(settingsValue);

  if (!state || !watchFolderPath || !fs.existsSync(watchFolderPath)) {
    return;
  }

  const entries = await fsp.readdir(watchFolderPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    queueIngest(ctx, path.join(watchFolderPath, entry.name));
  }
}

function assertRuntimeDb() {
  const db = runtimeState?.db;

  if (!db) {
    throw new Error("Booru todavia no inicializo su catalogo interno.");
  }

  return db;
}

async function drainRuntimeBackgroundWork(state: RuntimeState) {
  state.abortController.abort();
  state.thumbnailHighPriorityIds = [];
  state.thumbnailLowPriorityIds = [];
  state.thumbnailQueuedIds.clear();
  state.fastClassification = null;

  if (state.invalidationTimer) {
    clearTimeout(state.invalidationTimer);
    state.invalidationTimer = null;
  }
  state.pendingInvalidations.clear();

  await stopWatcher(state);
  await Promise.allSettled([state.queue]);

  while (state.backgroundTasks.size) {
    await Promise.allSettled([...state.backgroundTasks]);
  }

  for (const child of state.childProcesses) {
    try {
      child.kill();
    } catch {
      // El AbortController ya intento detener los procesos; un child cerrado no requiere mas trabajo.
    }
  }
  state.childProcesses.clear();
  state.thumbnailProcessingIds.clear();
  state.queuedPaths.clear();
  state.watcherState.pendingCount = 0;
}

async function shutdownRuntimeState(state: RuntimeState) {
  if (state.shuttingDown) {
    return;
  }

  const startedAt = performance.now();
  state.shuttingDown = true;
  await drainRuntimeBackgroundWork(state);

  const db = state.db;
  state.db = null;
  db?.close();

  if (runtimeState === state) {
    runtimeState = null;
  }

  booruBackendLogger.info(
    "booru.runtime.shutdown.done",
    "Booru cerro su runtime despues de drenar trabajos asincronos.",
    {
      generation: state.generation,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    },
  );
}

const booruPlugin: NexusBackendPluginModule = {
  async ensureSchema(ctx: NexusBackendPluginContext) {
    const storagePaths = getStoragePaths(ctx);
    await ensureStoragePaths(storagePaths);
    const db = new DatabaseSync(storagePaths.catalogPath);
    ensureCatalogSchema(db);
    db.close();
  },

  async activate(ctx: NexusBackendPluginContext) {
    booruBackendLogger = ctx.log;
    const state = createRuntimeState(ctx);
    runtimeState = state;
    const abortFromHost = () => {
      if (!state.abortController.signal.aborted) {
        state.abortController.abort(ctx.lifecycle.signal.reason);
      }
    };
    if (ctx.lifecycle.signal.aborted) {
      abortFromHost();
    } else {
      ctx.lifecycle.signal.addEventListener("abort", abortFromHost, { once: true });
    }
    await ensureStoragePaths(getStoragePaths(ctx));
    state.db = new DatabaseSync(state.catalogPath);
    ensureCatalogSchema(state.db);

    const applySettings = async (settingsValue: Record<string, unknown>) => {
      if (!isRuntimeStateActive(state)) {
        return;
      }

      await restartWatcher(state, ctx, settingsValue);

      if (isRuntimeStateActive(state)) {
        queueThumbnailGeneration(listThumbnailBacklogResourceIdsSync(state.db), "low");
      }

      scheduleRuntimeInvalidationForState(state, "watcherVersion");
    };

    ctx.registerCleanup(async () => {
      ctx.lifecycle.signal.removeEventListener("abort", abortFromHost);
      await shutdownRuntimeState(state);
    });

    ctx.ipc.handle("get-snapshot", async () => {
      const startedAt = performance.now();
      try {
        const snapshot = buildResourcesSnapshot(ctx, await ctx.settings.get());
        const durationMs = Number((performance.now() - startedAt).toFixed(2));

        if (durationMs >= 250) {
          booruBackendLogger.info("booru.snapshot.done", "Snapshot de Booru resuelto en backend.", {
            durationMs,
            watcherStage: String(snapshot?.watcher?.stage || ""),
            watcherPendingCount: Number(snapshot?.watcher?.pendingCount || 0),
            thumbnailActiveCount: Number(snapshot?.derivatives?.activeCount || 0),
            thumbnailBacklogCount: Number(snapshot?.stats?.thumbnailBacklogCount || 0),
            totalCount: Number(snapshot?.stats?.totalCount || 0),
          });
        }

        return createSuccess(snapshot);
      } catch (error) {
        return createError(error, "No se pudo leer el estado actual de Booru.");
      }
    });

    ctx.ipc.handle("list-resources", async (_event, payload: ListResourcesPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const result = listResourcesSync(db, payload);
        logBackendDuration(
          "booru.resources.list.done",
          "Booru resolvio una pagina de recursos en backend.",
          performance.now() - startedAt,
          {
            section: result.section,
            query: result.query,
            offset: normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER),
            limit: Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE)),
            itemCount: result.items.length,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            sampleIds: summarizeIdsForLog(result.items),
          },
        );
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo listar la biblioteca de Booru.");
      }
    });

    ctx.ipc.handle("get-resources-by-ids", async (_event, payload: { resourceIds?: unknown }) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const resourceIds = uniqueBooruIds(payload?.resourceIds);
        const items = getResourceRowsByIdsSync(db, resourceIds);
        logBackendDuration(
          "booru.resources.visible-refresh.done",
          "Booru actualizo recursos visibles despues de generar thumbnails.",
          performance.now() - startedAt,
          {
            requestedCount: resourceIds.length,
            itemCount: items.length,
            sampleIds: summarizeIdsForLog(items),
          },
        );
        return createSuccess({ items });
      } catch (error) {
        return createError(error, "No se pudieron actualizar los recursos visibles de Booru.");
      }
    });

    ctx.ipc.handle("prime-visible-thumbnails", async (_event, payload: PrimeVisibleThumbnailsPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const resourceIds = uniqueBooruIds(payload?.resourceIds);
        queueThumbnailGeneration(resourceIds, "high");
        const queuedCount = resourceIds.filter((resourceId) => {
          const resource = getResourceByIdSync(db, resourceId);
          return resource && shouldGenerateThumbnailSync(resource, getThumbnailRowSync(db, resourceId));
        }).length;
        logBackendDuration(
          "booru.thumbnail-prime.done",
          "Booru priorizo thumbnails visibles en backend.",
          performance.now() - startedAt,
          {
            requestedCount: resourceIds.length,
            queuedCount,
            sampleIds: summarizeIdsForLog(resourceIds),
          },
        );
        return createSuccess({
          queuedCount,
        });
      } catch (error) {
        return createError(error, "No se pudieron priorizar las thumbnails visibles de Booru.");
      }
    });

    ctx.ipc.handle("list-entities", async (_event, payload: any) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
        const query = normalizeBooruOptionalText(payload?.query);

        if (!ENTITY_TABLES[kind]) {
          throw new Error("El tipo de entidad solicitado no existe en Booru.");
        }

        const allItems = filterEntitiesByExactFiltersSync(db, kind, listEntitiesSync(db, kind, query), payload?.exactFilters);
        const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
        const limit = Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
        const allowUniverseSort = kind === "character";
        const result = createBooruIncrementalBrowseResult(allItems, payload, {
          family: "entity",
          allowUniverseSort,
          offset,
          limit,
        });
        logBackendDuration(
          "booru.entities.list.done",
          "Booru resolvio una lista de entidades en backend.",
          performance.now() - startedAt,
          {
            kind,
            query,
            itemCount: result.items.length,
            totalCount: result.totalCount,
            sampleIds: summarizeIdsForLog(result.items),
          },
        );
        return createSuccess({
          kind,
          query,
          ...result,
        });
      } catch (error) {
        return createError(error, "No se pudo listar entidades de Booru.");
      }
    });

    ctx.ipc.handle("get-entity-profile", async (_event, payload: any) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
        const entityId = normalizeBooruText(payload?.id);

        if (!ENTITY_TABLES[kind]) {
          throw new Error("El tipo de entidad solicitado no existe en Booru.");
        }

        if (!entityId) {
          throw new Error("Hace falta un id de entidad para abrir el perfil.");
        }

        const profile = getEntityProfileSync(db, kind, entityId);

        if (!profile) {
          throw new Error("La entidad solicitada ya no existe en Booru.");
        }

        logBackendDuration(
          "booru.entity-profile.done",
          "Booru resolvio un perfil de entidad en backend.",
          performance.now() - startedAt,
          {
            kind,
            entityId,
            resourceCount: Number(profile?.resourceCount || 0),
            slug: normalizeBooruOptionalText(profile?.slug),
          },
        );
        return createSuccess(profile);
      } catch (error) {
        return createError(error, "No se pudo cargar el perfil de entidad en Booru.");
      }
    });

    ctx.ipc.handle("list-entity-relations", async (_event, payload: any) => {
      const startedAt = performance.now();
      try {
        const result = listEntityRelationsSync(assertRuntimeDb(), payload);
        logBackendDuration(
          "booru.entity-relations.list.done",
          "Booru resolvio relaciones derivadas de un perfil.",
          performance.now() - startedAt,
          {
            sourceKind: result.sourceKind,
            sourceId: result.sourceId,
            relationKind: result.relationKind,
            query: result.query || null,
            itemCount: result.items.length,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            sampleIds: summarizeIdsForLog(result.items),
          },
        );
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudieron cargar las relaciones del perfil.");
      }
    });

    ctx.ipc.handle("list-tags", async (_event, payload: any) => {
      try {
        const db = assertRuntimeDb();
        const query = normalizeBooruOptionalText(payload?.query);
        return createSuccess({
          items: listTagsSync(db, query),
        });
      } catch (error) {
        return createError(error, "No se pudo listar tags de Booru.");
      }
    });

    ctx.ipc.handle("list-search-suggestions", async (_event, payload: any) => {
      try {
        return createSuccess({ items: listSearchSuggestionsSync(assertRuntimeDb(), normalizeBooruOptionalText(payload?.query), payload) });
      } catch (error) {
        return createError(error, "No se pudieron cargar las sugerencias de busqueda.");
      }
    });

    ctx.ipc.handle("list-social-platforms", async () => {
      try {
        return createSuccess({ items: listSocialPlatformsSync(assertRuntimeDb()) });
      } catch (error) {
        return createError(error, "No se pudieron cargar las plataformas.");
      }
    });

    ctx.ipc.handle("save-social-platform", async (_event, payload: any) => {
      try {
        const platform = saveSocialPlatformSync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ platform });
      } catch (error) {
        return createError(error, "No se pudo guardar la plataforma.");
      }
    });

    ctx.ipc.handle("delete-social-platform", async (_event, payload: any) => {
      try {
        const result = deleteSocialPlatformSync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo eliminar la plataforma.");
      }
    });

    ctx.ipc.handle("import-social-platform-icon", async (event, payload: any) => {
      const tempFilePath = assertClipboardTempFilePath(
        ctx.capabilities.external.consume(event, String(payload?.grantId || "")),
      );
      try {
        const result = await ingestFile(ctx, tempFilePath, {
          updateWatcherState: false,
          sourcePathOverride: "clipboard://social-platform-icon",
          originalFilenameOverride: buildClipboardImportedFilename(),
        });
        if (!result?.resource) throw new Error("No se pudo importar el icono.");
        return createSuccess({ resource: result.resource });
      } catch (error) {
        return createError(error, "No se pudo importar el icono de plataforma.");
      } finally {
        await removeFileIfExists(tempFilePath);
      }
    });

    ctx.ipc.handle("import-social-platform-icon-file", async (event, payload: any) => {
      const sourcePath = ctx.capabilities.external.consume(event, String(payload?.grantId || ""));
      if (!sourcePath || !fs.existsSync(sourcePath)) return createError(new Error("El archivo elegido ya no existe."), "No se pudo importar el icono de plataforma.");
      const tempFilePath = path.join(CLIPBOARD_IMAGE_TEMP_ROOT, `${crypto.randomUUID()}${path.extname(sourcePath) || ".png"}`);
      try {
        await fsp.mkdir(CLIPBOARD_IMAGE_TEMP_ROOT, { recursive: true });
        await fsp.copyFile(sourcePath, tempFilePath);
        const result = await ingestFile(ctx, tempFilePath, {
          updateWatcherState: false,
          sourcePathOverride: `platform-icon://${path.basename(sourcePath)}`,
          originalFilenameOverride: path.basename(sourcePath),
        });
        if (!result?.resource) throw new Error("No se pudo importar el icono.");
        return createSuccess({ resource: result.resource });
      } catch (error) {
        return createError(error, "No se pudo importar el icono de plataforma.");
      } finally {
        await removeFileIfExists(tempFilePath);
      }
    });

    ctx.ipc.handle("list-recommendations", async (_event, payload: ListRecommendationsPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const result = listRecommendationsSync(db, payload);
        logBackendDuration(
          "booru.recommendations.list.done",
          "Booru resolvio una pagina de recomendaciones.",
          performance.now() - startedAt,
          {
            query: normalizeBooruOptionalText(payload?.query),
            offset: normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER),
            limit: Math.max(1, normalizePagingNumber(payload?.limit, BOORU_RECOMMENDATION_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE)),
            itemCount: result.items.length,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            sampleIds: summarizeIdsForLog(result.items),
          },
        );
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudieron listar recomendaciones de Booru.");
      }
    });

    ctx.ipc.handle("ensure-entity", async (_event, payload: any) => {
      try {
        const db = assertRuntimeDb();
        const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
        const name = normalizeBooruText(payload?.name);

        if (!ENTITY_TABLES[kind]) {
          throw new Error("El tipo de entidad solicitado no existe en Booru.");
        }

        const result = {
          kind,
          ...ensureTypedEntitySync(db, kind, name, payload?.aliasNames),
        };
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo asegurar la entidad en Booru.");
      }
    });

    ctx.ipc.handle("set-character-universe", async (_event, payload: SetCharacterUniversePayload) => {
      try {
        const db = assertRuntimeDb();
        const profile = setCharacterUniverseSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo actualizar el universe del character en Booru.");
      }
    });

    ctx.ipc.handle("ensure-character-in-universe", async (_event, payload: EnsureCharacterInUniversePayload) => {
      try {
        const db = assertRuntimeDb();
        const result = ensureCharacterInUniverseSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo crear el character dentro del universe en Booru.");
      }
    });

    ctx.ipc.handle("set-entity-visual", async (_event, payload: SetEntityVisualPayload) => {
      try {
        const db = assertRuntimeDb();
        const profile = setEntityVisualSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo actualizar el visual de la entidad en Booru.");
      }
    });

    ctx.ipc.handle("set-entity-visual-layout", async (_event, payload: SetEntityVisualLayoutPayload) => {
      try {
        const db = assertRuntimeDb();
        const profile = setEntityVisualLayoutSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo actualizar el encuadre del perfil de entidad en Booru.");
      }
    });

    ctx.ipc.handle("save-entity-profile", async (_event, payload: SaveEntityProfilePayload) => {
      try {
        const profile = saveEntityProfileSync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo guardar el perfil de entidad.");
      }
    });

    ctx.ipc.handle("disassociate-resources-from-entity", async (_event, payload: ResourceEntityAssociationPayload) => {
      try {
        const result = disassociateResourcesFromEntitySync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudieron desasociar los recursos de la entidad.");
      }
    });

    ctx.ipc.handle("exclude-resource-tag", async (_event, payload: any) => {
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = excludeResourceTagSync(db, normalizeBooruText(payload?.resourceId), normalizeBooruText(payload?.tagId));
        const mutation = buildResourceMutationResultSync(db, {
          reason: "inherited-tag-excluded",
          updatedResources: resource,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion");
        return createSuccess(mutation);
      } catch (error) {
        return createError(error, "No se pudo excluir la tag heredada.");
      }
    });

    ctx.ipc.handle("exclude-resource-universe", async (_event, payload: any) => {
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = excludeResourceUniverseSync(db, normalizeBooruText(payload?.resourceId), normalizeBooruText(payload?.universeId));
        const mutation = buildResourceMutationResultSync(db, {
          reason: "inherited-universe-excluded",
          updatedResources: resource,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion");
        return createSuccess(mutation);
      } catch (error) {
        return createError(error, "No se pudo excluir el universe heredado.");
      }
    });

    ctx.ipc.handle("set-fast-classification", async (_event, payload: FastClassificationPayload) => {
      try {
        const state = runtimeState;
        const kind = normalizeBooruText(payload?.kind) as BooruEntityKind;
        const entityId = normalizeBooruOptionalText(payload?.entityId);
        const scopeId = normalizeBooruOptionalText(payload?.scopeId);
        if (!state || !ENTITY_TABLES[kind] || !entityId || !scopeId || !findEntityByIdSync(assertRuntimeDb(), kind, entityId)) {
          throw new Error("El perfil de clasificacion rapida ya no existe.");
        }
        state.fastClassification = { kind, entityId, scopeId };
        return createSuccess({ active: true });
      } catch (error) {
        return createError(error, "No se pudo activar la clasificacion rapida.");
      }
    });

    ctx.ipc.handle("clear-fast-classification", async (_event, payload: FastClassificationPayload) => {
      const state = runtimeState;
      const scopeId = normalizeBooruOptionalText(payload?.scopeId);
      if (state?.fastClassification && (!scopeId || state.fastClassification.scopeId === scopeId)) {
        state.fastClassification = null;
      }
      return createSuccess({ active: false });
    });

    ctx.ipc.handle("ensure-tag", async (_event, payload: any) => {
      try {
        const db = assertRuntimeDb();
        const name = normalizeBooruText(payload?.name);
        const result = ensureTagSync(db, name);
        scheduleRuntimeInvalidation("metricsVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo asegurar la tag en Booru.");
      }
    });

    ctx.ipc.handle("save-resource-metadata", async (_event, payload: SaveResourceMetadataPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = saveResourceMetadataSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "metadata-saved",
          updatedResources: resource,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.resource-metadata.save.done",
          "Booru guardo metadata de recursos en backend.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds || [payload?.resourceId]),
            dirtyFields: Array.isArray(payload?.dirtyFields) ? payload.dirtyFields : [],
            resultCount: Array.isArray(resource) ? resource.length : (resource ? 1 : 0),
          },
        );
        return createSuccess({
          ...mutation,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la metadata del recurso en Booru.");
      }
    });

    ctx.ipc.handle("save-basic-classification", async (_event, payload: SaveBasicClassificationPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = saveBasicClassificationSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "classification-saved",
          updatedResources: resource,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.classification.save.done",
          "Booru guardo clasificacion basica en backend.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds || [payload?.resourceId]),
            dirtyFields: Array.isArray(payload?.dirtyFields) ? payload.dirtyFields : [],
            resultCount: Array.isArray(resource) ? resource.length : (resource ? 1 : 0),
          },
        );
        return createSuccess({
          ...mutation,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la clasificacion minima de Booru.");
      }
    });

    ctx.ipc.handle("quick-assign-entity", async (_event, payload: QuickAssignEntityPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = quickAssignEntitySync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "entity-assigned",
          updatedResources: resource,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.quick-assign.done",
          "Booru aplico una asignacion rapida en backend.",
          performance.now() - startedAt,
          {
            resourceId: normalizeBooruOptionalText(payload?.resourceId),
            resourceIds: summarizeIdsForLog(payload?.resourceIds || [payload?.resourceId]),
            kind: normalizeBooruOptionalText(payload?.kind),
            entityId: normalizeBooruOptionalText(payload?.entityId),
            resultResourceIds: summarizeIdsForLog(Array.isArray(resource) ? resource : [resource]),
          },
        );
        return createSuccess({
          ...mutation,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo aplicar la asignacion rapida en Booru.");
      }
    });

    ctx.ipc.handle("paste-clipboard-image-to-entity", async (event, payload: PasteClipboardImageToEntityPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const tempFilePath = assertClipboardTempFilePath(
          ctx.capabilities.external.consume(event, String(payload?.grantId || "")),
        );
        const result = await pasteClipboardImageToEntitySync(ctx, db, payload, tempFilePath);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.clipboard-paste.done",
          "Booru importo una imagen del portapapeles y la asigno a una entidad.",
          performance.now() - startedAt,
          {
            kind: normalizeBooruOptionalText(payload?.kind),
            entityId: normalizeBooruOptionalText(payload?.entityId),
            createdResourceId: normalizeBooruOptionalText(result?.createdResourceId),
            reusedCanonical: Boolean(result?.reusedCanonical),
            resultResourceIds: summarizeIdsForLog(Array.isArray(result?.resource) ? result.resource : [result?.resource]),
          },
        );
        return createSuccess({
          ...result,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo pegar la imagen del portapapeles en Booru.");
      }
    });

    ctx.ipc.handle("discard-clipboard-media", async (event, payload: { grantId?: unknown }) => {
      try {
        const tempFilePath = assertClipboardTempFilePath(
          ctx.capabilities.external.consume(event, String(payload?.grantId || "")),
        );
        await removeFileIfExists(tempFilePath);
        return createSuccess({ discarded: true });
      } catch (error) {
        return createError(error, "No se pudo descartar el recurso temporal del portapapeles.");
      }
    });

    ctx.ipc.handle("paste-clipboard-media", async (event, payload: PasteClipboardMediaPayload) => {
      try {
        const db = assertRuntimeDb();
        const tempFilePath = assertClipboardTempFilePath(
          ctx.capabilities.external.consume(event, String(payload?.grantId || "")),
        );
        const result = await pasteClipboardMediaSync(ctx, db, payload, tempFilePath);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        return createSuccess({
          ...result,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo importar el recurso del portapapeles en Booru.");
      }
    });

    ctx.ipc.handle("trash-resources", async (_event, payload: TrashResourcesPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resources = trashResourcesSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "resources-trashed",
          updatedResources: resources,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.trash.done",
          "Booru envio recursos a la papelera interna.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds),
            resultCount: Array.isArray(resources) ? resources.length : 0,
          },
        );
        return createSuccess({
          ...mutation,
          resources,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo enviar la seleccion a la papelera de Booru.");
      }
    });

    ctx.ipc.handle("restore-resources", async (_event, payload: TrashResourcesPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resources = restoreResourcesSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "resources-restored",
          updatedResources: resources,
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.restore.done",
          "Booru restauro recursos desde la papelera interna.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds),
            resultCount: Array.isArray(resources) ? resources.length : 0,
          },
        );
        return createSuccess({
          ...mutation,
          resources,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo restaurar la seleccion de Booru.");
      }
    });

    ctx.ipc.handle("purge-resources", async (_event, payload: TrashResourcesPayload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const result = await purgeResourcesSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "resources-purged",
          updatedResources: [],
          context: mutationContext,
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.purge.done",
          "Booru purgo recursos desde la papelera interna.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds),
            purgedIds: summarizeIdsForLog(result?.purgedIds),
          },
        );
        return createSuccess({
          ...mutation,
          ...result,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get()),
        });
      } catch (error) {
        return createError(error, "No se pudo purgar la seleccion de Booru.");
      }
    });

    ctx.ipc.handle("open-in-brave", async (_event, payload: OpenInBravePayload) => {
      try {
        const db = assertRuntimeDb();
        return createSuccess(await openResourceInBraveSync(db, payload));
      } catch (error) {
        return createError(error, "No se pudo abrir el recurso en Brave.");
      }
    });

    ctx.ipc.handle("restart-watcher", async () => {
      try {
        const state = runtimeState;
        assertRuntimeStateActive(state!);
        const settingsValue = await ctx.settings.get();
        await restartWatcher(state!, ctx, settingsValue);
        scheduleRuntimeInvalidationForState(state, "watcherVersion");
        return createSuccess(buildResourcesSnapshot(ctx, settingsValue));
      } catch (error) {
        return createError(error, "No se pudo reiniciar el watcher de Booru.");
      }
    });

    ctx.ipc.handle("rescan-watch-folder", async () => {
      try {
        const settingsValue = await ctx.settings.get();
        await rescanWatchFolder(ctx, settingsValue);
        scheduleRuntimeInvalidation("watcherVersion");
        return createSuccess(buildResourcesSnapshot(ctx, settingsValue));
      } catch (error) {
        return createError(error, "No se pudo releer la carpeta vigilada de Booru.");
      }
    });

    ctx.settings.subscribe(
      (settingsValue) => {
        const task = applySettings(normalizeBooruSettings(settingsValue));
        trackRuntimeBackgroundTask(state, task);
        return task;
      },
      { emitCurrent: true },
    );

    queueThumbnailGeneration(listThumbnailBacklogResourceIdsSync(state.db), "low");
  },
};

export const __booruTestUtils = {
  applyBooruMutationToResourceWindow,
  createBooruIncrementalEntityResult,
  createBooruEntityVisualProjection,
  getBooruEntityVisualMediaStyle,
  getBooruEntityVisualRenderProps,
  getBooruDetailsFieldSchema,
  getBooruDetailsMixedFields,
  getBooruDetailsPriorityContext,
  getBooruDetailsRealityState,
  buildBooruResourceQuery,
  buildResourceMutationResultSync,
  createResourceMutationContextSync,
  getBooruContextualMissingFilterOptions,
  getBooruImplicitRecommendationMissingKind,
  getBooruRecommendationScope,
  isBooruResourceWindowContextCurrent,
  isBooruMissingFilterCompatible,
  normalizeBooruRecommendationScope,
  normalizeBooruEntityRelationRequest,
  normalizeBooruResourceMutationResult,
  normalizeEntityVisualLayout,
  normalizeEntityVisualSettings,
  resourceMatchesBooruPendingMode,
  resourceMatchesBooruSection,
  resolveBooruAnchoredResources,
  ensureCatalogSchema,
  ensureTypedEntitySync,
  ensureCharacterInUniverseSync,
  ensureTagSync,
  allocateUniqueEntitySlugSync,
  setCharacterUniverseSync,
  replaceCharacterUniverseAssignmentSync,
  replaceResourceTagAssignmentsSync,
  saveResourceMetadataSync,
  saveBasicClassificationSync,
  quickAssignEntitySync,
  resolveClipboardAssociationsSync,
  mergeClipboardAssociationsIntoResourceSync,
  reintegrateCanonicalResourceSync,
  createBooruIngestMutation,
  createBooruKeyedSerialExecutor,
  listEntitiesSync,
  listEntityRelationsSync,
  getEntityProfileSync,
  listTagsSync,
  listSearchSuggestionsSync,
  saveEntityProfileSync,
  syncResourceInheritanceSync,
  excludeResourceTagSync,
  disassociateResourcesFromEntitySync,
  listLibraryRows,
  listPendingRows,
  listDuplicateRows,
  listTrashRows,
  listThumbnailBacklogResourceIdsSync,
  listResourcesSync,
  listRecommendationsSync,
  setEntityVisualSync,
  setEntityVisualLayoutSync,
  trashResourcesSync,
  restoreResourcesSync,
  purgeResourcesSync,
  getResourceByIdSync,
  buildResourcesSnapshot,
  drainRuntimeBackgroundWork,
};

export default booruPlugin;
