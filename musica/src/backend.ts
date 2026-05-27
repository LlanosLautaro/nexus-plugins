import fs from "node:fs";
import fsp from "node:fs/promises";
import {
  bufferToDataUrl,
  ensureAudioTrackWithAuthors,
  getAudioItemName,
  getAudioTrackAuthorNames,
  getModelValue,
  isMusicaCoverArtEnabled,
  isMusicaAssignedItem,
  isSupportedAudioItem,
  parseAudioMetadata,
  syncAudioTrackRecord,
} from "./audio-indexing";
import { registerMusicaMetadataResources } from "./metadata-resource";
import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../nexus-backend/src/plugins/types.ts";
import {
  normalizeRelativePath,
  readMusicaEngineAssignments,
  writeMusicaEngineAssignments,
} from "./plugin-settings.js";

async function hydrateResolvedItem(ctx: NexusBackendPluginContext, item: any) {
  if (!item?.id) {
    return item;
  }

  const location = await ctx.resolveItemLocation(String(item.id));

  if (!location) {
    return item;
  }

  return {
    ...item,
    path: location.path,
    relative_path: location.relativePath,
    contentRelativePath: location.contentRelativePath,
  };
}

async function migrateMusicaAssignmentIdsIfNeeded(
  ctx: NexusBackendPluginContext,
  settingsValue: Record<string, unknown>,
) {
  const assignments = readMusicaEngineAssignments(settingsValue);

  if (!assignments.some((assignment) => !assignment.rootItemId && assignment.rootPath)) {
    return null;
  }

  const items = await ctx.requireRepositories().items.findAll();
  const folderEntries = await Promise.all(
    items
      .filter((item) => item?.type === "folder")
      .map(async (item) => {
        const location = await ctx.resolveItemLocation(String(item.id || ""));
        return [
          normalizeRelativePath(location?.contentRelativePath || ""),
          String(item.id || ""),
        ] as const;
      }),
  );
  const folderIdByRelativePath = new Map(
    folderEntries.filter(([relativePath, itemId]) => relativePath && itemId),
  );

  let changed = false;
  const migratedAssignments = assignments.map((assignment) => {
    if (assignment.rootItemId || !assignment.rootPath) {
      return assignment;
    }

    const resolvedRootItemId = folderIdByRelativePath.get(
      normalizeRelativePath(assignment.rootPath),
    );

    if (!resolvedRootItemId) {
      return assignment;
    }

    changed = true;
    return {
      ...assignment,
      rootItemId: resolvedRootItemId,
    };
  });

  return changed
    ? writeMusicaEngineAssignments(settingsValue, migratedAssignments)
    : null;
}

async function reconcileMusicaAssignments(ctx: NexusBackendPluginContext) {
  const repositories = ctx.requireRepositories();
  const items = await repositories.items.findAll();
  const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);

  for (const item of items) {
    const resolvedItem = await hydrateResolvedItem(ctx, item);

    if (!isSupportedAudioItem(resolvedItem)) {
      continue;
    }

    const assignedToMusica = await isMusicaAssignedItem(ctx, resolvedItem);

    if (!assignedToMusica) {
      await repositories.audio.deleteTrack(String(getModelValue(item, "id") ?? ""));
      continue;
    }

    await syncAudioTrackRecord(repositories, resolvedItem, {
      structuralChanged: true,
      contentChanged: false,
      extractEmbeddedCoverArt,
    });
  }
}

const musicaPlugin: NexusBackendPluginModule = {
  ensureSchema: ({ requireRepositories }) => {
    requireRepositories().sqlite.exec(`
      CREATE TABLE IF NOT EXISTS audio_tracks (
        id TEXT PRIMARY KEY NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        kind TEXT NOT NULL DEFAULT 'song',
        name TEXT NOT NULL,
        duration REAL,
        genre TEXT,
        album TEXT,
        year INTEGER,
        trackNumber INTEGER,
        discNumber INTEGER,
        mimeType TEXT,
        bitrate INTEGER,
        sampleRate INTEGER,
        bitsPerSample INTEGER,
        cover TEXT,
        coverMimeType TEXT,
        metadataCompleted INTEGER NOT NULL DEFAULT 0,
        lastScannedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS audio_authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS audio_track_authors (
        audioTrackId TEXT NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
        authorId INTEGER NOT NULL REFERENCES audio_authors(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (audioTrackId, authorId)
      );

      CREATE TABLE IF NOT EXISTS audio_playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS audio_track_playlists (
        audioTrackId TEXT NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
        playlistId INTEGER NOT NULL REFERENCES audio_playlists(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (audioTrackId, playlistId)
      );
    `);
  },
  activate: (ctx: NexusBackendPluginContext) => {
    registerMusicaMetadataResources(ctx);

    ctx.registerIpc("audio:getByItemId", async (_event, itemId: string) => {
      try {
        const repositories = ctx.getRepositories();
        const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);

        if (!repositories?.items) {
          return {
            ok: false,
            error: "No hay un vault activo con repositorios inicializados.",
          };
        }

        const item = await hydrateResolvedItem(ctx, await repositories.items.findById(itemId));

        if (!item) {
          return {
            ok: false,
            error: "Item no encontrado",
          };
        }

        const filePath = getModelValue(item, "path");

        if (typeof filePath !== "string" || !filePath || !fs.existsSync(filePath)) {
          return {
            ok: false,
            error: "Archivo no encontrado",
          };
        }

        const itemAssignedToMusica = await isMusicaAssignedItem(ctx, item);
        const audioTrack = itemAssignedToMusica
          ? await ensureAudioTrackWithAuthors(repositories, item, {
              structuralChanged: true,
              contentChanged: true,
              extractEmbeddedCoverArt,
            })
          : await repositories.audio.findTrackWithAuthors(itemId);

        const metadata = audioTrack
          ? null
          : await parseAudioMetadata(filePath, {
              includeCovers: extractEmbeddedCoverArt,
            });
        const metadataMimeType = metadata?.format ? (metadata.format as any).mimeType ?? null : null;
        const picture = extractEmbeddedCoverArt ? metadata?.common?.picture?.[0] : null;
        const authors = getAudioTrackAuthorNames(audioTrack);
        const audioFile = {
          id: String(getModelValue(item, "id") ?? itemId),
          path: filePath,
          title: getModelValue(audioTrack, "name") || getAudioItemName(item),
          duration: getModelValue(audioTrack, "duration") ?? metadata?.format?.duration ?? null,
          mimeType: getModelValue(audioTrack, "mimeType") ?? metadataMimeType,
          cover: extractEmbeddedCoverArt
            ? (getModelValue(audioTrack, "cover") ?? (picture ? bufferToDataUrl(picture.data, picture.format) : null))
            : null,
          genre: getModelValue(audioTrack, "genre") ?? null,
          album: getModelValue(audioTrack, "album") ?? null,
          authors,
          metadataCompleted: Boolean(getModelValue(audioTrack, "metadataCompleted")),
        };

        const buffer = await fsp.readFile(filePath);

        return {
          ok: true,
          data: {
            audioFile,
            buffer,
          },
        };
      } catch (error) {
        console.error("Error en audio:getByItemId:", error);

        return {
          ok: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    });

    let reconcileQueue = Promise.resolve();
    ctx.settings.subscribe(
      (settingsValue) => {
        reconcileQueue = reconcileQueue
          .then(async () => {
            const migratedSettings = await migrateMusicaAssignmentIdsIfNeeded(ctx, settingsValue);

            if (migratedSettings) {
              await ctx.settings.set(migratedSettings);
              return;
            }

            await reconcileMusicaAssignments(ctx);
          })
          .catch((error) => {
            console.error("[musica] Error reconciliando assignments live:", error);
          });
      },
      { emitCurrent: true },
    );
  },
  onItemSync: async (ctx, payload) => {
    const resolvedItem = await hydrateResolvedItem(ctx, payload.item);
    const assignedToMusica = await isMusicaAssignedItem(ctx, resolvedItem);
    const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);

    if (!assignedToMusica) {
      await ctx.requireRepositories().audio.deleteTrack(String(getModelValue(resolvedItem, "id") ?? ""));
      return;
    }

    await syncAudioTrackRecord(ctx.requireRepositories(), resolvedItem, {
      structuralChanged: payload.structuralChanged,
      contentChanged: payload.contentChanged,
      extractEmbeddedCoverArt,
    });
  },
};

export default musicaPlugin;
