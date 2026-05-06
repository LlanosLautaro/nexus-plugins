import fs from "node:fs";
import path from "node:path";
import { parseFile } from "music-metadata";
import type { VaultRepositories } from "../../../nexus-backend/src/backend/vault-runtime/db/repositories.ts";
import { getPluginSettingsStateKey } from "../../../nexus-backend/src/plugins/state-keys.ts";

const AUDIO_EXTENSIONS = new Set([
  "aac",
  "aif",
  "aiff",
  "alac",
  "flac",
  "m4a",
  "mp3",
  "ogg",
  "oga",
  "opus",
  "wav",
  "webm",
  "wma",
]);

export function bufferToDataUrl(
  data: Uint8Array | Buffer | null | undefined,
  mime = "image/jpeg",
) {
  if (!data) {
    return null;
  }

  return `data:${mime};base64,${Buffer.from(data).toString("base64")}`;
}

export function getModelValue(record: any, field: string) {
  if (record && typeof record.get === "function") {
    return record.get(field);
  }

  return record?.[field];
}

export function getAudioItemName(item: any) {
  const itemName = getModelValue(item, "name");

  if (typeof itemName === "string" && itemName) {
    return path.basename(itemName, path.extname(itemName));
  }

  const filePath = getModelValue(item, "path");

  if (typeof filePath === "string" && filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  return String(getModelValue(item, "id") ?? "");
}

export function isSupportedAudioItem(item: any) {
  if (!item || getModelValue(item, "type") !== "file") {
    return false;
  }

  const extension = String(getModelValue(item, "extension") ?? "")
    .replace(/^\./, "")
    .toLowerCase();

  if (extension) {
    return AUDIO_EXTENSIONS.has(extension);
  }

  const filePath = getModelValue(item, "path");
  if (typeof filePath !== "string" || !filePath) {
    return false;
  }

  return AUDIO_EXTENSIONS.has(path.extname(filePath).replace(/^\./, "").toLowerCase());
}

function normalizeRelativePath(value: string | null | undefined) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
}

function getContentRelativePath(contentPath: string, itemPath: string | null | undefined) {
  const normalizedContentPath = String(contentPath || "").replace(/\\/g, "/").replace(/\/$/, "");
  const normalizedItemPath = String(itemPath || "").replace(/\\/g, "/");

  if (!normalizedContentPath || !normalizedItemPath) {
    return "";
  }

  if (normalizedItemPath.startsWith(`${normalizedContentPath}/`)) {
    return normalizedItemPath.slice(normalizedContentPath.length + 1);
  }

  return "";
}

function assignmentMatchesPath(
  assignment: { rootPath: string; recursive: boolean },
  relativeItemPath: string,
) {
  const normalizedRoot = normalizeRelativePath(assignment.rootPath);
  const normalizedItemPath = normalizeRelativePath(relativeItemPath);

  if (!normalizedRoot || !normalizedItemPath) {
    return false;
  }

  if (normalizedItemPath === normalizedRoot) {
    return true;
  }

  if (!normalizedItemPath.startsWith(`${normalizedRoot}/`)) {
    return false;
  }

  if (assignment.recursive) {
    return true;
  }

  const suffix = normalizedItemPath.slice(normalizedRoot.length + 1);
  return !suffix.includes("/");
}

export async function getMusicaEngineAssignments(ctx: {
  pluginId?: string;
  settings?: { get: () => Promise<Record<string, unknown>> };
  state: { get: (key: string) => Promise<unknown> };
}) {
  const settingsValue = ctx.settings?.get
    ? await ctx.settings.get()
    : await ctx.state.get(
        getPluginSettingsStateKey(ctx.pluginId || "nexus.musica"),
      );
  const assignments = Array.isArray((settingsValue as any)?.engineAssignments)
    ? (settingsValue as any).engineAssignments
    : [];

  return assignments
    .filter((assignment: any) => assignment?.engineId === "nexus.musica.audio")
    .map((assignment: any) => ({
      rootPath: normalizeRelativePath(assignment.rootPath),
      recursive:
        typeof assignment.recursive === "boolean" ? assignment.recursive : true,
    }))
    .filter((assignment: any) => assignment.rootPath);
}

export async function isMusicaAssignedItem(
  ctx: {
    pluginId?: string;
    vault: { contentPath: string };
    settings?: { get: () => Promise<Record<string, unknown>> };
    state: { get: (key: string) => Promise<unknown> };
  },
  item: any,
) {
  if (!isSupportedAudioItem(item)) {
    return false;
  }

  const relativeItemPath = getContentRelativePath(
    ctx.vault.contentPath,
    String(getModelValue(item, "path") ?? ""),
  );

  if (!relativeItemPath) {
    return false;
  }

  const assignments = await getMusicaEngineAssignments(ctx);
  return assignments.some((assignment) => assignmentMatchesPath(assignment, relativeItemPath));
}

function dedupeStrings(values: Array<string | null | undefined>) {
  const unique = new Set<string>();

  for (const value of values) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (normalized) {
      unique.add(normalized);
    }
  }

  return [...unique];
}

export function extractAuthors(metadata: any) {
  const fromArtists = Array.isArray(metadata?.common?.artists) ? metadata.common.artists : [];
  const fromArtist = typeof metadata?.common?.artist === "string" ? [metadata.common.artist] : [];

  return dedupeStrings([...fromArtists, ...fromArtist]);
}

export async function parseAudioMetadata(filePath: string) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    return await parseFile(filePath, { skipCovers: false });
  } catch (error) {
    console.warn("music-metadata fallo para", filePath, error);
    return null;
  }
}

function getMetadataMimeType(metadata: any) {
  return metadata?.format ? (metadata.format as any).mimeType ?? null : null;
}

export function getAudioTrackAuthorNames(track: any) {
  const authors = Array.isArray(track?.authors) ? [...track.authors] : [];

  return authors
    .sort((left, right) => Number(left.position ?? 0) - Number(right.position ?? 0))
    .map((author) => {
      const name = getModelValue(author, "name");
      return typeof name === "string" ? name.trim() : "";
    })
    .filter(Boolean);
}

export async function findAudioTrackWithAuthors(
  repositories: VaultRepositories,
  itemId: string,
) {
  if (!itemId) {
    return null;
  }

  return repositories.audio.findTrackWithAuthors(itemId);
}

export async function replaceAudioAuthors(
  repositories: VaultRepositories,
  audioId: string,
  authorNames: string[],
) {
  await repositories.audio.replaceTrackAuthors(audioId, authorNames);
}

export async function ensureAudioTrackWithAuthors(
  repositories: VaultRepositories,
  item: any,
  options = {
    structuralChanged: true,
    contentChanged: true,
  },
) {
  const itemId = String(getModelValue(item, "id") ?? "");
  let track = await findAudioTrackWithAuthors(repositories, itemId);

  if (track) {
    return track;
  }

  await syncAudioTrackRecord(repositories, item, options);
  track = await findAudioTrackWithAuthors(repositories, itemId);

  return track;
}

export async function syncAudioTrackRecord(
  repositories: VaultRepositories,
  item: any,
  options: {
    structuralChanged: boolean;
    contentChanged: boolean;
  },
) {
  const itemId = String(getModelValue(item, "id") ?? "");
  const existingTrack = itemId ? await findAudioTrackWithAuthors(repositories, itemId) : null;

  if (!isSupportedAudioItem(item)) {
    if (existingTrack) {
      await repositories.audio.deleteTrack(itemId);
    }

    return null;
  }

  if (existingTrack && !options.structuralChanged && !options.contentChanged) {
    return existingTrack;
  }

  const filePath = getModelValue(item, "path");
  const metadata = typeof filePath === "string" && filePath ? await parseAudioMetadata(filePath) : null;
  const metadataCompleted = Boolean(getModelValue(existingTrack, "metadataCompleted"));
  const picture = metadata?.common?.picture?.[0];
  const authorNames = extractAuthors(metadata);
  const currentTrackName = getModelValue(existingTrack, "name");
  const shouldRefreshNameFromFile =
    options.structuralChanged || (!metadataCompleted && !currentTrackName);

  const technicalPayload = {
    duration: Number.isFinite(metadata?.format?.duration) ? metadata.format.duration : null,
    mimeType: getMetadataMimeType(metadata),
    bitrate: Number.isFinite(metadata?.format?.bitrate) ? metadata.format.bitrate : null,
    sampleRate: Number.isFinite(metadata?.format?.sampleRate) ? metadata.format.sampleRate : null,
    bitsPerSample: Number.isFinite(metadata?.format?.bitsPerSample)
      ? metadata.format.bitsPerSample
      : null,
    lastScannedAt: new Date(),
  };

  const editablePayload = {
    name: getAudioItemName(item),
    genre: Array.isArray(metadata?.common?.genre)
      ? metadata.common.genre.filter(Boolean).join(", ")
      : null,
    album: metadata?.common?.album ?? null,
    year: Number.isFinite(metadata?.common?.year) ? metadata.common.year : null,
    trackNumber: Number.isFinite(metadata?.common?.track?.no) ? metadata.common.track.no : null,
    discNumber: Number.isFinite(metadata?.common?.disk?.no) ? metadata.common.disk.no : null,
    cover: picture ? bufferToDataUrl(picture.data, picture.format) : null,
    coverMimeType: picture?.format ?? null,
  };

  const payload = existingTrack
    ? {
        id: itemId,
        kind: getModelValue(existingTrack, "kind") ?? "song",
        name: shouldRefreshNameFromFile ? editablePayload.name : getModelValue(existingTrack, "name"),
        genre: getModelValue(existingTrack, "genre"),
        album: getModelValue(existingTrack, "album"),
        year: getModelValue(existingTrack, "year"),
        trackNumber: getModelValue(existingTrack, "trackNumber"),
        discNumber: getModelValue(existingTrack, "discNumber"),
        cover:
          !metadataCompleted && !getModelValue(existingTrack, "cover") && editablePayload.cover
            ? editablePayload.cover
            : getModelValue(existingTrack, "cover"),
        coverMimeType:
          !metadataCompleted && !getModelValue(existingTrack, "coverMimeType") && editablePayload.coverMimeType
            ? editablePayload.coverMimeType
            : getModelValue(existingTrack, "coverMimeType"),
        metadataCompleted,
        ...technicalPayload,
      }
    : {
        id: itemId,
        kind: "song",
        metadataCompleted: false,
        ...editablePayload,
        ...technicalPayload,
      };

  const track = await repositories.audio.upsertTrack(payload);

  if (!existingTrack) {
    await replaceAudioAuthors(repositories, itemId, authorNames);
  }

  return track;
}
