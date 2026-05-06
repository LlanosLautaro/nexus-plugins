import path from "node:path";
import {
  buildFileNameFromBaseName,
  rollbackRenamedVaultItem,
  renameVaultItem,
} from "../../../nexus-backend/src/backend/vault-runtime/file-system/operations/rename-item.ts";
import type { MetadataFieldDefinition } from "../../../nexus-backend/src/shared/types.ts";
import type {
  MetadataResourceDefinition,
  NexusBackendPluginContext,
} from "../../../nexus-backend/src/plugins/types.ts";
import {
  ensureAudioTrackWithAuthors,
  getAudioTrackAuthorNames,
  getAudioItemName,
  getModelValue,
  isMusicaAssignedItem,
  isSupportedAudioItem,
  replaceAudioAuthors,
} from "./audio-indexing";

const AUDIO_TRACK_RESOURCE_ID = "audio.track";
const AUDIO_TRACK_VARIANT_ID = "basic";

const AUDIO_TRACK_FIELDS: MetadataFieldDefinition[] = [
  {
    name: "name",
    type: "text",
    label: "Nombre",
    description:
      "Este valor se guarda sin extension y renombra el archivo real al guardar.",
    placeholder: "Nombre de la cancion",
    required: true,
  },
  {
    name: "authors",
    type: "string-list",
    label: "Autores",
    description: "Uno o mas autores. Se preserva el orden para colaboraciones.",
    addLabel: "Agregar autor",
  },
  {
    name: "genre",
    type: "text",
    label: "Genero",
    placeholder: "Ej. Synthwave",
  },
  {
    name: "album",
    type: "text",
    label: "Album",
    placeholder: "Nombre del album",
  },
  {
    name: "year",
    type: "number",
    label: "Anio",
    placeholder: "2026",
  },
  {
    name: "trackNumber",
    type: "number",
    label: "Pista",
    placeholder: "1",
  },
  {
    name: "discNumber",
    type: "number",
    label: "Disco",
    placeholder: "1",
  },
  {
    name: "metadataCompleted",
    type: "boolean",
    label: "Metadata completada",
    description:
      "Marcala cuando ya corregiste nombre, autores y demas campos curados manualmente.",
  },
];

function ensureVariantId(variantId: string) {
  if (variantId !== AUDIO_TRACK_VARIANT_ID) {
    throw new Error(`Variant no soportada: ${variantId}`);
  }
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const normalizedValues: string[] = [];

  for (const entry of value) {
    const normalized = String(entry ?? "").trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    normalizedValues.push(normalized);
  }

  return normalizedValues;
}

function normalizeOptionalInteger(
  value: unknown,
  label: string,
  { allowZero = false } = {},
) {
  if (value == null || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(numericValue)) {
    throw new Error(`${label} debe ser un numero entero.`);
  }

  if (!allowZero && numericValue <= 0) {
    throw new Error(`${label} debe ser mayor a 0.`);
  }

  return numericValue;
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }

    if (
      normalized === "" ||
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no"
    ) {
      return false;
    }
  }

  return Boolean(value);
}

function normalizeTrackFormValues(item: any, values: Record<string, unknown>) {
  const extension =
    String(getModelValue(item, "extension") ?? "")
      .replace(/^\./, "")
      .trim() ||
    path.extname(String(getModelValue(item, "name") ?? "")).replace(/^\./, "");

  const baseName = String(values?.name ?? "").trim();
  const fullFileName = buildFileNameFromBaseName(baseName, extension);
  const normalizedBaseName = extension
    ? fullFileName.slice(0, fullFileName.length - extension.length - 1)
    : fullFileName;

  return {
    name: normalizedBaseName,
    fullFileName,
    authors: normalizeStringList(values?.authors),
    genre: normalizeOptionalText(values?.genre),
    album: normalizeOptionalText(values?.album),
    year: normalizeOptionalInteger(values?.year, "Anio"),
    trackNumber: normalizeOptionalInteger(values?.trackNumber, "Pista"),
    discNumber: normalizeOptionalInteger(values?.discNumber, "Disco"),
    metadataCompleted: normalizeBoolean(values?.metadataCompleted),
  };
}

function buildTrackFormValues(item: any, track: any) {
  return {
    name: String(getModelValue(track, "name") ?? getAudioItemName(item) ?? "").trim(),
    authors: getAudioTrackAuthorNames(track),
    genre: getModelValue(track, "genre") ?? "",
    album: getModelValue(track, "album") ?? "",
    year: getModelValue(track, "year") ?? null,
    trackNumber: getModelValue(track, "trackNumber") ?? null,
    discNumber: getModelValue(track, "discNumber") ?? null,
    metadataCompleted: Boolean(getModelValue(track, "metadataCompleted")),
  };
}

async function requireAudioItem(models: Record<string, any>, itemId: string) {
  const item = await models.items.findById(itemId);

  if (!item) {
    throw new Error(`Item no encontrado: ${itemId}`);
  }

  if (!isSupportedAudioItem(item)) {
    throw new Error("El item solicitado no es un audio soportado.");
  }

  return item;
}

function toVaultRelativePath(ctx: NexusBackendPluginContext, value: string | null | undefined) {
  if (value == null) {
    return value;
  }

  const normalizedValue = path.normalize(value);
  const relativePath = path.relative(path.normalize(ctx.vault.contentPath), normalizedValue);
  return relativePath === "." ? "" : relativePath.replace(/\\/g, "/");
}

function serializePluginItem(ctx: NexusBackendPluginContext, item: any) {
  if (!item) {
    return item;
  }

  const plainItem =
    typeof item.get === "function"
      ? item.get({ plain: true })
      : { ...item };

  delete plainItem.repo;

  if ("path" in plainItem) {
    plainItem.path = getModelValue(item, "path") ?? plainItem.path;
    plainItem.relative_path = toVaultRelativePath(ctx, plainItem.path);
  }

  if ("folder_note_path" in plainItem && plainItem.folder_note_path) {
    plainItem.relative_folder_note_path = toVaultRelativePath(ctx, plainItem.folder_note_path);
  }

  return plainItem;
}

const audioTrackMetadataResource: MetadataResourceDefinition = {
  resourceId: AUDIO_TRACK_RESOURCE_ID,
  supportsItem: async (ctx, item) =>
    isSupportedAudioItem(item) && (await isMusicaAssignedItem(ctx, item)),
  listVariants: async () => [
    {
      resourceId: AUDIO_TRACK_RESOURCE_ID,
      variantId: AUDIO_TRACK_VARIANT_ID,
      title: "Metadata musical",
      description:
        "Edita el nombre real del archivo y la metadata curada de la cancion.",
      rendererMode: "auto",
      fields: AUDIO_TRACK_FIELDS,
    },
  ],
  getFormInstance: async (ctx, itemId, variantId) => {
    ensureVariantId(variantId);

    const repositories = ctx.requireRepositories();
    const item = await requireAudioItem(repositories, itemId);
    const track = await ensureAudioTrackWithAuthors(repositories, item);

    if (!track) {
      throw new Error("No se pudo inicializar el registro derivado de audio.");
    }

    return {
      definition: {
        resourceId: AUDIO_TRACK_RESOURCE_ID,
        variantId: AUDIO_TRACK_VARIANT_ID,
        title: "Metadata musical",
        description:
          "Edita el nombre real del archivo y la metadata curada de la cancion.",
        rendererMode: "auto",
        fields: AUDIO_TRACK_FIELDS,
      },
      values: buildTrackFormValues(item, track),
    };
  },
  submitForm: async (ctx, itemId, variantId, values) => {
    ensureVariantId(variantId);

    const repositories = ctx.requireRepositories();
    const item = await requireAudioItem(repositories, itemId);

    const normalizedValues = normalizeTrackFormValues(item, values);
    const track =
      (await ensureAudioTrackWithAuthors(repositories, item, {
        structuralChanged: true,
        contentChanged: true,
      })) ?? null;

    let renameResult: any = null;

    try {
      if (normalizedValues.fullFileName !== getModelValue(item, "name")) {
        renameResult = await renameVaultItem(item, normalizedValues.fullFileName);
      }

      item.name = normalizedValues.fullFileName;
      await item.save();

      const trackPayload = {
        name: normalizedValues.name,
        genre: normalizedValues.genre,
        album: normalizedValues.album,
        year: normalizedValues.year,
        trackNumber: normalizedValues.trackNumber,
        discNumber: normalizedValues.discNumber,
        metadataCompleted: normalizedValues.metadataCompleted,
      };

      if (track) {
        await repositories.audio.upsertTrack({
          id: itemId,
          kind: getModelValue(track, "kind") ?? "song",
          duration: getModelValue(track, "duration") ?? null,
          mimeType: getModelValue(track, "mimeType") ?? null,
          bitrate: getModelValue(track, "bitrate") ?? null,
          sampleRate: getModelValue(track, "sampleRate") ?? null,
          bitsPerSample: getModelValue(track, "bitsPerSample") ?? null,
          cover: getModelValue(track, "cover") ?? null,
          coverMimeType: getModelValue(track, "coverMimeType") ?? null,
          lastScannedAt: getModelValue(track, "lastScannedAt") ?? null,
          ...trackPayload,
        });
      } else {
        await repositories.audio.upsertTrack({
          id: itemId,
          kind: "song",
          ...trackPayload,
        });
      }

      await replaceAudioAuthors(repositories, itemId, normalizedValues.authors);

      return {
        values: {
          name: normalizedValues.name,
          authors: normalizedValues.authors,
          genre: normalizedValues.genre ?? "",
          album: normalizedValues.album ?? "",
          year: normalizedValues.year,
          trackNumber: normalizedValues.trackNumber,
          discNumber: normalizedValues.discNumber,
          metadataCompleted: normalizedValues.metadataCompleted,
        },
        item: serializePluginItem(ctx, item),
        notices: renameResult?.renamed
          ? ["El archivo se renombro y la metadata se guardo correctamente."]
          : ["Metadata guardada correctamente."],
      };
    } catch (error) {
      if (renameResult?.renamed) {
        try {
          await rollbackRenamedVaultItem(item, renameResult);
        } catch (rollbackError) {
          console.error("Error revirtiendo rename del audio:", rollbackError);
        }
      }

      throw error;
    }
  },
};

export function registerMusicaMetadataResources(ctx: NexusBackendPluginContext) {
  ctx.registerMetadataResource(audioTrackMetadataResource);
}
