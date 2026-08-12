import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createRequire } from "node:module";

// The test suite exercises pure catalog helpers exported by the plugin bundle.
// The production logger imports the Electron facade at module load time, so a
// minimal main-process marker keeps that facade inert under plain Node.
process.__electronMain = { app: {} };

const require = createRequire(import.meta.url);
const { __booruTestUtils } = require("../booru/dist/backend.cjs");

const {
  allocateUniqueEntitySlugSync,
  applyBooruMutationToResourceWindow,
  buildBooruResourceQuery,
  buildResourceMutationResultSync,
  createResourceMutationContextSync,
  createBooruEntityVisualProjection,
  drainRuntimeBackgroundWork,
  ensureCatalogSchema,
  ensureCharacterInUniverseSync,
  ensureTagSync,
  excludeResourceTagSync,
  ensureTypedEntitySync,
  getResourceByIdSync,
  getBooruDetailsFieldSchema,
  getBooruDetailsMixedFields,
  getBooruDetailsPriorityContext,
  getBooruDetailsRealityState,
  getBooruContextualMissingFilterOptions,
  getBooruImplicitRecommendationMissingKind,
  getBooruRecommendationScope,
  getBooruEntityVisualMediaStyle,
  getBooruEntityVisualRenderProps,
  getEntityProfileSync,
  isBooruResourceWindowContextCurrent,
  listDuplicateRows,
  listEntityRelationsSync,
  listEntitiesSync,
  listRecommendationsSync,
  listSearchSuggestionsSync,
  listResourcesSync,
  listTagsSync,
  listLibraryRows,
  listPendingRows,
  listTrashRows,
  listThumbnailBacklogResourceIdsSync,
  normalizeBooruRecommendationScope,
  normalizeBooruResourceMutationResult,
  purgeResourcesSync,
  quickAssignEntitySync,
  mergeClipboardAssociationsIntoResourceSync,
  reintegrateCanonicalResourceSync,
  resourceMatchesBooruSection,
  resolveClipboardAssociationsSync,
  resolveBooruAnchoredResources,
  replaceCharacterUniverseAssignmentSync,
  replaceResourceTagAssignmentsSync,
  restoreResourcesSync,
  saveBasicClassificationSync,
  saveEntityProfileSync,
  saveResourceMetadataSync,
  setEntityVisualLayoutSync,
  setEntityVisualSync,
  syncResourceInheritanceSync,
  trashResourcesSync,
} = __booruTestUtils;

function createBooruDb() {
  const db = new DatabaseSync(":memory:");
  ensureCatalogSchema(db);
  return db;
}

function ensureCharacter(db, name, universeName = `${name} Universe`) {
  const universe = ensureTypedEntitySync(db, "universe", universeName);
  const character = ensureCharacterInUniverseSync(db, {
    name,
    universeId: universe.entity.id,
  });
  return { character, universe };
}

function insertLegacyOrphanCharacter(db, name) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO booru_characters (id, display_name, slug, cover_resource_id, created_at)
    VALUES (?, ?, ?, NULL, ?)
  `).run(id, name, name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), "2026-06-27T12:00:00.000Z");
  return { id, displayName: name };
}

test("ensureCatalogSchema migra catalogos legacy sin trashed_at antes de crear indices nuevos", () => {
  const db = new DatabaseSync(":memory:");

  try {
    db.exec(`
      CREATE TABLE booru_resources (
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
        classification_state TEXT NOT NULL DEFAULT 'unclassified',
        canonical_resource_id TEXT,
        source_path TEXT,
        imported_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL
      );
    `);

    assert.doesNotThrow(() => ensureCatalogSchema(db));

    const resourceColumns = db
      .prepare("PRAGMA table_info(booru_resources)")
      .all()
      .map((row) => String(row.name || ""));
    const thumbnailColumns = db
      .prepare("PRAGMA table_info(booru_resource_thumbnails)")
      .all()
      .map((row) => String(row.name || ""));
    const videoShortColumns = db
      .prepare("PRAGMA table_info(booru_resource_video_shorts)")
      .all()
      .map((row) => String(row.name || ""));

    assert.ok(resourceColumns.includes("trashed_at"));
    assert.ok(resourceColumns.includes("media_info_status"));
    assert.ok(resourceColumns.includes("media_info_error"));
    assert.ok(thumbnailColumns.includes("resource_id"));
    assert.ok(thumbnailColumns.includes("status"));
    assert.ok(videoShortColumns.includes("variant"));
  } finally {
    db.close();
  }
});

function insertResource(db, overrides = {}) {
  const resourceId = overrides.id || crypto.randomUUID();
  const importedAt = overrides.importedAt || "2026-06-27T12:00:00.000Z";
  const originalFilename = overrides.originalFilename || `${resourceId}.jpg`;
  const storageFilename = overrides.storageFilename || originalFilename;
  const storagePath = overrides.storagePath || `C:\\booru\\${storageFilename}`;

  db.prepare(`
    INSERT INTO booru_resources (
      id,
      storage_filename,
      storage_path,
      original_filename,
      extension,
      mime_type,
      media_kind,
      file_size,
      width,
      height,
      duration_ms,
      content_hash,
      reality,
      classification_state,
      canonical_resource_id,
      source_path,
      imported_at,
      last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resourceId,
    storageFilename,
    storagePath,
    originalFilename,
    overrides.extension || ".jpg",
    overrides.mimeType || "image/jpeg",
    overrides.mediaKind || "image",
    Number(overrides.fileSize || 2048),
    overrides.width ?? null,
    overrides.height ?? null,
    overrides.durationMs ?? null,
    overrides.contentHash || `hash-${resourceId}`,
    overrides.reality ?? null,
    overrides.classificationState || "unclassified",
    overrides.canonicalResourceId ?? null,
    overrides.sourcePath || `C:\\downloads\\${originalFilename}`,
    importedAt,
    overrides.lastSeenAt || importedAt,
  );

  return {
    id: resourceId,
    originalFilename,
  };
}

function insertThumbnail(db, overrides = {}) {
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    overrides.resourceId,
    overrides.storagePath || `C:\\booru\\thumbs\\${overrides.resourceId}.webp`,
    overrides.mimeType || "image/webp",
    overrides.width ?? 384,
    overrides.height ?? 256,
    overrides.byteSize ?? 4096,
    overrides.status || "ready",
    overrides.sourceHash || `hash-${overrides.resourceId}`,
    overrides.generatedAt || "2026-06-29T12:00:00.000Z",
    overrides.errorMessage ?? null,
    overrides.frameTimestampMs ?? null,
  );
}

test("ensure-entity reutiliza exact match y puede derivar slug unico", () => {
  const db = createBooruDb();

  try {
    const created = ensureTypedEntitySync(db, "author", "Jane Doe");
    const reused = ensureTypedEntitySync(db, "author", "  jane doe  ");

    assert.equal(created.created, true);
    assert.equal(reused.created, false);
    assert.equal(reused.entity.id, created.entity.id);
    assert.equal(allocateUniqueEntitySlugSync(db, "author", "jane-doe"), "jane-doe-2");
  } finally {
    db.close();
  }
});

test("Persona y Artist crean UUID con nombres adicionales y resuelven siempre la identidad canonica", () => {
  const db = createBooruDb();

  try {
    const created = ensureTypedEntitySync(db, "author", "Jane Doe", [
      "Jane D.",
      "jane d.",
      "Jane Doe",
    ]);
    const reused = ensureTypedEntitySync(db, "author", "Jane D.", ["JD"]);
    const profile = getEntityProfileSync(db, "author", created.entity.id);

    assert.match(created.entity.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.equal(reused.created, false);
    assert.equal(reused.entity.id, created.entity.id);
    assert.deepEqual(profile.aliases, ["Jane D.", "JD"]);
    assert.equal(listSearchSuggestionsSync(db, "jane d").find((item) => item.entityId === created.entity.id)?.label, "Jane Doe");

    const other = ensureTypedEntitySync(db, "author", "Other Person");
    assert.throws(
      () => saveEntityProfileSync(db, {
        kind: "author",
        entityId: other.entity.id,
        aliasNames: ["Jane D."],
      }),
      /ya pertenece a Persona "Jane Doe"/,
    );
    assert.throws(
      () => ensureTypedEntitySync(db, "universe", "World", ["Alternate World"]),
      /Solo Persona y Artist admiten nombres adicionales/,
    );
  } finally {
    db.close();
  }
});

test("el creador por portapapeles persiste aliases y reutiliza la entidad por cualquiera de sus nombres", () => {
  const db = createBooruDb();

  try {
    const [created] = resolveClipboardAssociationsSync(db, {
      association: {
        kind: "artist",
        entityName: "Primary Artist",
        aliasNames: ["Public Handle"],
      },
    });
    const [reused] = resolveClipboardAssociationsSync(db, {
      association: {
        kind: "artist",
        entityName: "Public Handle",
      },
    });

    assert.equal(reused.entityId, created.entityId);
    assert.deepEqual(getEntityProfileSync(db, "artist", created.entityId).aliases, ["Public Handle"]);
  } finally {
    db.close();
  }
});

test("renombrar conserva UUID y convierte el nombre anterior en alias solo para Persona y Artist", () => {
  const db = createBooruDb();

  try {
    const person = ensureTypedEntitySync(db, "author", "Nombre original", ["Alias previo"]);
    const renamedPerson = saveEntityProfileSync(db, {
      kind: "author",
      entityId: person.entity.id,
      displayName: "Nombre principal",
    });

    assert.equal(renamedPerson.id, person.entity.id);
    assert.equal(renamedPerson.displayName, "Nombre principal");
    assert.deepEqual(renamedPerson.aliases, ["Alias previo", "Nombre original"]);
    assert.equal(ensureTypedEntitySync(db, "author", "Nombre original").entity.id, person.entity.id);

    const { character } = ensureCharacter(db, "Character viejo");
    const renamedCharacter = saveEntityProfileSync(db, {
      kind: "character",
      entityId: character.entity.id,
      displayName: "Character nuevo",
    });

    assert.equal(renamedCharacter.id, character.entity.id);
    assert.equal(renamedCharacter.displayName, "Character nuevo");
    assert.deepEqual(renamedCharacter.aliases, []);
  } finally {
    db.close();
  }
});

test("aliases resuelven la entidad canonica y las tags de Character se heredan con exclusion local", () => {
  const db = createBooruDb();
  try {
    const author = ensureTypedEntitySync(db, "author", "Pepetronix");
    const { character, universe } = ensureCharacter(db, "Viper", "Valorant");
    const brownHair = ensureTagSync(db, "brown hair");
    saveEntityProfileSync(db, {
      kind: "author",
      entityId: author.entity.id,
      aliasNames: ["viperr"],
    });
    saveEntityProfileSync(db, {
      kind: "character",
      entityId: character.entity.id,
      tagIds: [brownHair.tag.id],
    });
    const resource = insertResource(db, { id: "resource-viper", contentHash: "hash-viper" });
    saveResourceMetadataSync(db, { resourceId: resource.id, characterIds: [character.entity.id] });

    const inherited = getResourceByIdSync(db, resource.id);
    assert.deepEqual(inherited.manualTags, []);
    assert.deepEqual(inherited.tags.map((tag) => tag.id), [brownHair.tag.id]);
    assert.deepEqual(inherited.universes.map((item) => item.id), [universe.entity.id]);
    assert.equal(listSearchSuggestionsSync(db, "viperr").find((item) => item.entityId === author.entity.id)?.label, "Pepetronix");

    excludeResourceTagSync(db, resource.id, brownHair.tag.id);
    assert.deepEqual(getResourceByIdSync(db, resource.id).tags, []);
  } finally {
    db.close();
  }
});

test("saveBasicClassificationSync clasifica real con Persona requerida y preserva orden visual", () => {
  const db = createBooruDb();

  try {
    const authorA = ensureTypedEntitySync(db, "author", "Persona A");
    const authorB = ensureTypedEntitySync(db, "author", "Persona B");
    const resource = insertResource(db, {
      id: "resource-real",
      contentHash: "hash-real",
    });

    const saved = saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "real",
      authorIds: [authorB.entity.id, authorA.entity.id],
    });

    assert.equal(saved.classificationState, "classified-basic");
    assert.equal(saved.reality, "real");
    assert.deepEqual(saved.authors.map((item) => item.id), [authorB.entity.id, authorA.entity.id]);
    assert.deepEqual(saved.characters.map((item) => item.id), []);

    const authorRows = listEntitiesSync(db, "author");
    assert.equal(authorRows.find((item) => item.id === authorA.entity.id)?.resourceCount, 1);
    assert.equal(authorRows.find((item) => item.id === authorB.entity.id)?.resourceCount, 1);
  } finally {
    db.close();
  }
});

test("Persona domina la realidad al coexistir con Character y Artist sin borrar relaciones", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Artist Core");
    const ignoredAuthor = ensureTypedEntitySync(db, "author", "Persona Real");
    const { character: characterA, universe: universeA } = ensureCharacter(db, "Hero A", "Universe A");
    const { character: characterB, universe: universeB } = ensureCharacter(db, "Hero B", "Universe B");
    const resource = insertResource(db, {
      id: "resource-ficticio",
      contentHash: "hash-ficticio",
    });

    const saved = saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "ficticio",
      authorIds: [ignoredAuthor.entity.id],
      artistIds: [artist.entity.id],
      characterIds: [characterA.entity.id, characterB.entity.id],
    });

    assert.equal(saved.classificationState, "classified-basic");
    assert.equal(saved.reality, "real");
    assert.equal(saved.realitySource, "auto");
    assert.deepEqual(saved.authors.map((item) => item.id), [ignoredAuthor.entity.id]);
    assert.deepEqual(saved.artists.map((item) => item.id), [artist.entity.id]);
    assert.deepEqual(saved.characters.map((item) => item.id), [characterA.entity.id, characterB.entity.id]);
    assert.deepEqual(
      saved.characters.map((item) => item.universe?.id || null),
      [universeA.entity.id, universeB.entity.id],
    );

    const refreshed = getResourceByIdSync(db, resource.id);
    assert.deepEqual(refreshed.characters.map((item) => item.id), [characterA.entity.id, characterB.entity.id]);
    assert.deepEqual(
      refreshed.characters.map((item) => item.universe?.id || null),
      [universeA.entity.id, universeB.entity.id],
    );
  } finally {
    db.close();
  }
});

test("Character no puede crearse ni completar Ficticio sin Universe", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Artist Missing Universe");
    assert.throws(
      () => ensureTypedEntitySync(db, "character", "Hero Missing Universe"),
      /junto con su universe/i,
    );
    const character = insertLegacyOrphanCharacter(db, "Hero Missing Universe");
    const resource = insertResource(db, {
      id: "resource-ficticio-missing-universe",
      contentHash: "hash-ficticio-missing-universe",
    });

    assert.throws(() => {
      saveBasicClassificationSync(db, {
        resourceId: resource.id,
        reality: "ficticio",
        artistIds: [artist.entity.id],
        characterIds: [character.id],
      });
    }, /necesita universe/i);
  } finally {
    db.close();
  }
});

test("ensureCharacterInUniverseSync crea Characters con exactamente un Universe", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Artist Mixed");
    const { character: characterWithUniverse } = ensureCharacter(db, "Hero Existing", "Existing Universe");
    const { character: characterWithoutUniverse } = ensureCharacter(db, "Hero Inline", "Inline Universe");
    const resource = insertResource(db, {
      id: "resource-ficticio-mixed-universes",
      contentHash: "hash-ficticio-mixed-universes",
    });

    const saved = saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "ficticio",
      artistIds: [artist.entity.id],
      characterIds: [characterWithUniverse.entity.id, characterWithoutUniverse.entity.id],
    });

    assert.deepEqual(
      saved.characters.map((item) => item.universe?.displayName || ""),
      ["Existing Universe", "Inline Universe"],
    );
  } finally {
    db.close();
  }
});

test("Universe directo infiere Ficticio pero no completa Esencial sin Character", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Artist Universe Direct");
    const universe = ensureTypedEntitySync(db, "universe", "Universe Direct");
    const resource = insertResource(db, {
      id: "resource-ficticio-universe-direct",
      contentHash: "hash-ficticio-universe-direct",
    });

    const saved = saveResourceMetadataSync(db, {
      resourceId: resource.id,
      artistIds: [artist.entity.id],
      universeIds: [universe.entity.id],
    });

    assert.equal(saved.reality, "ficticio");
    assert.equal(saved.realitySource, "auto");
    assert.equal(saved.classificationState, "unclassified");
    assert.deepEqual(saved.characters, []);
    assert.equal(saved.isPending, true);
    assert.ok(saved.pendingReasons.includes("missing-character"));
    assert.throws(() => saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "ficticio",
      artistIds: [artist.entity.id],
      universeIds: [universe.entity.id],
    }), /necesita al menos un Character/i);
  } finally {
    db.close();
  }
});

test("listEntitiesSync para universe devuelve conteo real y sample cover por cadena character -> resource", () => {
  const db = createBooruDb();

  try {
    const universe = ensureTypedEntitySync(db, "universe", "Galaxy Prime");
    const character = ensureCharacterInUniverseSync(db, { name: "Captain Nova", universeId: universe.entity.id });
    const visibleResource = insertResource(db, {
      id: "resource-universe-visible",
      contentHash: "hash-universe-visible",
      importedAt: "2026-06-27T12:10:00.000Z",
      storagePath: "C:\\booru\\visible.jpg",
    });
    const duplicateResource = insertResource(db, {
      id: "resource-universe-duplicate",
      contentHash: "hash-universe-duplicate",
      classificationState: "duplicate-review",
      importedAt: "2026-06-27T12:11:00.000Z",
      storagePath: "C:\\booru\\duplicate.jpg",
    });

    db.prepare(`
      INSERT INTO booru_resource_characters (resource_id, character_id, sort_order, created_at)
      VALUES (?, ?, ?, ?)
    `).run(visibleResource.id, character.entity.id, 0, "2026-06-27T12:10:00.000Z");

    db.prepare(`
      INSERT INTO booru_resource_characters (resource_id, character_id, sort_order, created_at)
      VALUES (?, ?, ?, ?)
    `).run(duplicateResource.id, character.entity.id, 0, "2026-06-27T12:11:00.000Z");

    const universeRows = listEntitiesSync(db, "universe");
    const row = universeRows.find((item) => item.id === universe.entity.id);

    assert.ok(row);
    assert.equal(row.resourceCount, 1);
    assert.equal(row.sampleResourceId, visibleResource.id);
    assert.equal(row.sampleStoragePath, "C:\\booru\\visible.jpg");
    assert.equal(row.sampleMediaKind, "image");
  } finally {
    db.close();
  }
});

test("el backlog invalida shorts legacy y acepta solo la variante vigente", () => {
  const db = createBooruDb();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "booru-short-variant-"));
  const shortPath = path.join(tempRoot, "preview.mp4");
  fs.writeFileSync(shortPath, "fixture");

  try {
    const resource = insertResource(db, {
      id: "video-short-variant",
      mediaKind: "video",
      extension: ".mp4",
      mimeType: "video/mp4",
      durationMs: 60_000,
    });
    insertThumbnail(db, { resourceId: resource.id });
    db.prepare("UPDATE booru_resources SET media_info_status = 'ready' WHERE id = ?").run(resource.id);
    db.prepare(`
      INSERT INTO booru_resource_video_shorts (
        resource_id, storage_path, status, variant, generated_at, error_message
      ) VALUES (?, ?, 'ready', ?, ?, NULL)
    `).run(resource.id, shortPath, "legacy-60s-v1", "2026-07-20T12:00:00.000Z");

    assert.ok(listThumbnailBacklogResourceIdsSync(db).includes(resource.id));
    db.prepare("UPDATE booru_resource_video_shorts SET variant = ? WHERE resource_id = ?")
      .run("first-15s-muted-v2", resource.id);
    assert.ok(!listThumbnailBacklogResourceIdsSync(db).includes(resource.id));
  } finally {
    db.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("listResourcesSync expone thumbnail y mediaInfoStatus desde el catalogo local", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Media Thumbnail Persona");
    const resource = insertResource(db, {
      id: "resource-thumb-ready",
      contentHash: "hash-thumb-ready",
      width: 1920,
      height: 1080,
    });
    saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "real",
      authorIds: [author.entity.id],
    });

    db.prepare(`
      UPDATE booru_resources
      SET media_info_status = 'ready',
          media_info_error = NULL
      WHERE id = ?
    `).run(resource.id);

    insertThumbnail(db, {
      resourceId: resource.id,
      storagePath: "C:\\booru\\thumbs\\resource-thumb-ready.webp",
      sourceHash: "hash-thumb-ready",
    });

    const page = listResourcesSync(db, {
      section: "media",
      offset: 0,
      limit: 20,
    });
    const row = page.items.find((item) => item.id === resource.id);

    assert.ok(row);
    assert.equal(row.mediaInfoStatus, "ready");
    assert.equal(row.thumbnail?.status, "ready");
    assert.equal(row.thumbnail?.storagePath, "C:\\booru\\thumbs\\resource-thumb-ready.webp");
    assert.equal(row.thumbnail?.mimeType, "image/webp");
  } finally {
    db.close();
  }
});

test("listEntitiesSync prefiere thumbnail derivado cuando ya existe para la cover sample", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Thumb Author");
    const resource = insertResource(db, {
      id: "resource-author-thumb",
      contentHash: "hash-author-thumb",
      storagePath: "C:\\booru\\originals\\author-thumb.jpg",
    });

    db.prepare(`
      INSERT INTO booru_resource_authors (resource_id, author_id, sort_order, created_at)
      VALUES (?, ?, ?, ?)
    `).run(resource.id, author.entity.id, 0, "2026-06-29T12:00:00.000Z");

    insertThumbnail(db, {
      resourceId: resource.id,
      storagePath: "C:\\booru\\thumbs\\author-thumb.webp",
      sourceHash: "hash-author-thumb",
    });

    const authors = listEntitiesSync(db, "author");
    const row = authors.find((item) => item.id === author.entity.id);

    assert.ok(row);
    assert.equal(row.sampleStoragePath, "C:\\booru\\thumbs\\author-thumb.webp");
    assert.equal(row.sampleMediaKind, "image");
  } finally {
    db.close();
  }
});

test("saveResourceMetadataSync persiste artists y tags manuales sin forzar clasificacion minima", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Illustrator One");
    const tagA = ensureTagSync(db, "soft-light");
    const tagB = ensureTagSync(db, "portrait");
    const resource = insertResource(db, {
      id: "resource-metadata-only",
      contentHash: "hash-metadata-only",
    });

    const saved = saveResourceMetadataSync(db, {
      resourceId: resource.id,
      artistIds: [artist.entity.id],
      tagIds: [tagB.tag.id, tagA.tag.id],
    });

    assert.equal(saved.classificationState, "unclassified");
    assert.deepEqual(saved.artists.map((item) => item.id), [artist.entity.id]);
    assert.deepEqual(saved.manualTags.map((item) => item.name), ["portrait", "soft-light"]);

    const artistRows = listEntitiesSync(db, "artist");
    assert.equal(artistRows.find((item) => item.id === artist.entity.id)?.resourceCount, 1);

    const tags = listTagsSync(db);
    assert.equal(tags.find((item) => item.id === tagA.tag.id)?.resourceCount, 1);
    assert.equal(tags.find((item) => item.id === tagB.tag.id)?.resourceCount, 1);
  } finally {
    db.close();
  }
});

test("Details ordena todos los campos por contexto sin ocultar entidades de menor afinidad", () => {
  const personaContext = {
    reality: "real",
    authors: [{ id: "persona-1" }],
    characters: [{ id: "character-1" }],
    artists: [],
    universes: [],
  };
  const fictionalContext = {
    reality: "ficticio",
    authors: [],
    characters: [{ id: "character-1" }],
    artists: [{ id: "artist-1" }],
    universes: [{ id: "universe-1" }],
  };

  assert.equal(getBooruDetailsPriorityContext(personaContext), "author");
  assert.deepEqual(
    getBooruDetailsFieldSchema(personaContext).map((field) => field.kind),
    ["author", "character", "universe", "artist"],
  );
  assert.deepEqual(
    getBooruDetailsFieldSchema(fictionalContext).map((field) => field.kind),
    ["universe", "artist", "author", "character"],
  );
  assert.equal(getBooruDetailsFieldSchema(personaContext).find((field) => field.kind === "author")?.required, true);
  assert.equal(getBooruDetailsFieldSchema(fictionalContext).find((field) => field.kind === "artist")?.required, true);
});

test("Details distingue realidad editable, derivada y valores mixtos", () => {
  assert.deepEqual(
    getBooruDetailsRealityState({ reality: null, mixedFields: [] }),
    { mode: "editable", value: null, mixed: false, source: "auto", label: "Sin definir" },
  );
  assert.equal(getBooruDetailsRealityState({
    reality: "ficticio",
    universes: [{ id: "universe-1" }],
    mixedFields: [],
  }).mode, "editable");
  assert.equal(getBooruDetailsRealityState({
    reality: "ficticio",
    characters: [{ id: "character-1" }],
    mixedFields: [],
  }).mode, "readonly");
  assert.deepEqual(
    getBooruDetailsRealityState({ reality: null, mixedFields: ["reality", "authors"] }),
    { mode: "readonly", value: null, mixed: true, source: "auto", label: "Valores mixtos" },
  );
});

test("Details detecta por separado las relaciones mixtas de una edicion multiple", () => {
  const resources = [
    {
      reality: "real",
      authors: [{ id: "shared-persona" }],
      artists: [{ id: "artist-a" }],
      characters: [],
      directUniverses: [],
      manualTags: [{ id: "shared-tag" }],
    },
    {
      reality: "real",
      authors: [{ id: "shared-persona" }],
      artists: [{ id: "artist-b" }],
      characters: [],
      directUniverses: [],
      manualTags: [{ id: "shared-tag" }, { id: "extra-tag" }],
    },
  ];

  assert.deepEqual(getBooruDetailsMixedFields(resources), ["artists", "manualTags"]);
});

test("el guardado parcial multiple conserva relaciones no editadas", () => {
  const db = createBooruDb();

  try {
    const persona = ensureTypedEntitySync(db, "author", "Partial Persona");
    const artist = ensureTypedEntitySync(db, "artist", "Partial Artist");
    const tag = ensureTagSync(db, "partial-tag");
    const first = insertResource(db, { id: "partial-first" });
    const second = insertResource(db, { id: "partial-second" });

    saveResourceMetadataSync(db, {
      resourceId: first.id,
      dirtyFields: ["authors"],
      authorIds: [persona.entity.id],
    });
    saveResourceMetadataSync(db, {
      resourceId: second.id,
      dirtyFields: ["artists"],
      artistIds: [artist.entity.id],
    });

    const saved = saveResourceMetadataSync(db, {
      resourceIds: [first.id, second.id],
      dirtyFields: ["manualTags"],
      tagPatch: { addIds: [tag.tag.id], removeIds: [] },
    });

    assert.equal(saved.length, 2);
    assert.deepEqual(saved[0].authors.map((item) => item.id), [persona.entity.id]);
    assert.deepEqual(saved[0].artists, []);
    assert.deepEqual(saved[1].authors, []);
    assert.deepEqual(saved[1].artists.map((item) => item.id), [artist.entity.id]);
    assert.ok(saved.every((resource) => resource.manualTags.some((item) => item.id === tag.tag.id)));
  } finally {
    db.close();
  }
});

test("quickAssignEntitySync con author infiere real y clasifica si alcanza el minimo", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Persona Fast");
    const resource = insertResource(db, {
      id: "resource-quick-author",
      contentHash: "hash-quick-author",
    });

    const saved = quickAssignEntitySync(db, {
      resourceId: resource.id,
      kind: "author",
      entityId: author.entity.id,
    });

    assert.equal(saved.reality, "real");
    assert.equal(saved.classificationState, "classified-basic");
    assert.deepEqual(saved.authors.map((item) => item.id), [author.entity.id]);
  } finally {
    db.close();
  }
});

test("el pegado contextual une varias asociaciones en un solo patch sin reemplazar metadata", () => {
  const db = createBooruDb();

  try {
    const persona = ensureTypedEntitySync(db, "author", "Persona existente");
    const artist = ensureTypedEntitySync(db, "artist", "Juancito33");
    const { character } = ensureCharacter(db, "Jinx", "League of Legends");
    const oldTag = ensureTagSync(db, "mago");
    const newTag = ensureTagSync(db, "arcano");
    const resource = insertResource(db, { id: "resource-contextual-paste" });
    saveResourceMetadataSync(db, {
      resourceId: resource.id,
      dirtyFields: ["authors", "manualTags"],
      authorIds: [persona.entity.id],
      tagIds: [oldTag.tag.id],
    });

    const saved = mergeClipboardAssociationsIntoResourceSync(db, resource.id, [
      { kind: "character", entityId: character.entity.id },
      { kind: "artist", entityId: artist.entity.id },
      { kind: "tag", entityId: newTag.tag.id },
    ]);

    assert.deepEqual(saved.authors.map((item) => item.id), [persona.entity.id]);
    assert.deepEqual(saved.characters.map((item) => item.id), [character.entity.id]);
    assert.deepEqual(saved.artists.map((item) => item.id), [artist.entity.id]);
    assert.deepEqual(new Set(saved.manualTags.map((item) => item.id)), new Set([oldTag.tag.id, newTag.tag.id]));
  } finally {
    db.close();
  }
});

test("la reintegracion canonica renueva fecha y fusiona clasificacion rapida sin reemplazar metadata", () => {
  const db = createBooruDb();

  try {
    const persona = ensureTypedEntitySync(db, "author", "Persona reintegrada");
    const artist = ensureTypedEntitySync(db, "artist", "Artist existente");
    const { character, universe } = ensureCharacter(db, "Character existente", "Universe existente");
    const tag = ensureTagSync(db, "tag existente");
    const resource = insertResource(db, {
      id: "canonical-reintegration",
      contentHash: "canonical-reintegration-hash",
      importedAt: "2026-07-20T10:00:00.000Z",
    });
    saveResourceMetadataSync(db, {
      resourceId: resource.id,
      dirtyFields: ["artists", "characters", "manualTags"],
      artistIds: [artist.entity.id],
      characterIds: [character.entity.id],
      tagIds: [tag.tag.id],
    });

    const first = reintegrateCanonicalResourceSync(
      db,
      resource.id,
      "2026-07-21T10:00:00.000Z",
      { kind: "author", entityId: persona.entity.id, scopeId: "profile-persona" },
    );
    const second = reintegrateCanonicalResourceSync(
      db,
      resource.id,
      "2026-07-21T11:00:00.000Z",
      { kind: "author", entityId: persona.entity.id, scopeId: "profile-persona" },
    );

    assert.equal(first.importedAt, "2026-07-21T10:00:00.000Z");
    assert.equal(second.importedAt, "2026-07-21T11:00:00.000Z");
    assert.deepEqual(second.authors.map((item) => item.id), [persona.entity.id]);
    assert.deepEqual(second.artists.map((item) => item.id), [artist.entity.id]);
    assert.deepEqual(second.characters.map((item) => item.id), [character.entity.id]);
    assert.ok(second.universes.some((item) => item.id === universe.entity.id));
    assert.deepEqual(second.manualTags.map((item) => item.id), [tag.tag.id]);
    assert.equal(second.reality, "real");
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM booru_resources").get().count, 1);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM booru_resource_authors WHERE resource_id = ?").get(resource.id).count, 1);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM booru_resources WHERE classification_state = 'duplicate-review'").get().count, 0);
  } finally {
    db.close();
  }
});

test("la realidad automatica se reinicia y un override manual sobrevive a entidades ficticias", () => {
  const db = createBooruDb();

  try {
    const universe = ensureTypedEntitySync(db, "universe", "Override Universe");
    const artist = ensureTypedEntitySync(db, "artist", "Override Artist");
    const automaticResource = insertResource(db, { id: "reality-auto-reset" });
    const manualResource = insertResource(db, { id: "reality-manual-override" });

    const inferred = quickAssignEntitySync(db, {
      resourceId: automaticResource.id,
      kind: "universe",
      entityId: universe.entity.id,
    });
    assert.equal(inferred.reality, "ficticio");
    assert.equal(inferred.realitySource, "auto");

    const reset = saveResourceMetadataSync(db, {
      resourceId: automaticResource.id,
      dirtyFields: ["universes"],
      universeIds: [],
    });
    assert.equal(reset.reality, null);
    assert.equal(reset.realitySource, "auto");

    quickAssignEntitySync(db, {
      resourceId: manualResource.id,
      kind: "universe",
      entityId: universe.entity.id,
    });
    const overridden = saveResourceMetadataSync(db, {
      resourceId: manualResource.id,
      dirtyFields: ["reality"],
      reality: "real",
    });
    assert.equal(overridden.reality, "real");
    assert.equal(overridden.realitySource, "manual");

    const afterArtist = quickAssignEntitySync(db, {
      resourceId: manualResource.id,
      kind: "artist",
      entityId: artist.entity.id,
    });
    assert.equal(afterArtist.reality, "real");
    assert.equal(afterArtist.realitySource, "manual");

    const restoredAutomatic = saveResourceMetadataSync(db, {
      resourceId: manualResource.id,
      dirtyFields: ["reality"],
      reality: null,
    });
    assert.equal(restoredAutomatic.reality, "ficticio");
    assert.equal(restoredAutomatic.realitySource, "auto");
  } finally {
    db.close();
  }
});

test("quickAssignEntitySync con character infiere ficticio y solo clasifica si ya existe artist", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Quick Artist");
    const { character: characterReady, universe } = ensureCharacter(db, "Hero Ready", "Quick Universe");
    const { character: characterMissing } = ensureCharacter(db, "Hero Missing", "Other Universe");
    const readyResource = insertResource(db, {
      id: "resource-quick-character-ready",
      contentHash: "hash-quick-character-ready",
    });
    const missingResource = insertResource(db, {
      id: "resource-quick-character-missing",
      contentHash: "hash-quick-character-missing",
    });

    saveResourceMetadataSync(db, {
      resourceId: readyResource.id,
      artistIds: [artist.entity.id],
    });

    const savedReady = quickAssignEntitySync(db, {
      resourceId: readyResource.id,
      kind: "character",
      entityId: characterReady.entity.id,
    });
    const savedMissing = quickAssignEntitySync(db, {
      resourceId: missingResource.id,
      kind: "character",
      entityId: characterMissing.entity.id,
    });

    assert.equal(savedReady.reality, "ficticio");
    assert.equal(savedReady.classificationState, "classified-basic");
    assert.equal(savedReady.characters[0]?.universe?.id, universe.entity.id);

    assert.equal(savedMissing.reality, "ficticio");
    assert.equal(savedMissing.classificationState, "unclassified");
    assert.ok(savedMissing.characters[0]?.universe?.id);
    assert.ok(savedMissing.pendingReasons.includes("missing-artist"));
  } finally {
    db.close();
  }
});

test("duplicate-review queda fuera de Pendientes y de la biblioteca principal", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Author Solo");
    const pendingResource = insertResource(db, {
      id: "resource-pending",
      contentHash: "hash-pending",
      classificationState: "unclassified",
      importedAt: "2026-06-27T12:00:00.000Z",
    });
    const duplicateResource = insertResource(db, {
      id: "resource-duplicate",
      contentHash: "hash-duplicate",
      classificationState: "duplicate-review",
      canonicalResourceId: pendingResource.id,
      importedAt: "2026-06-27T12:05:00.000Z",
    });

    assert.deepEqual(listPendingRows(db).map((item) => item.id), [pendingResource.id]);
    assert.equal(listLibraryRows(db).some((item) => item.id === duplicateResource.id), false);
    assert.deepEqual(listDuplicateRows(db).map((item) => item.id), [duplicateResource.id]);

    assert.throws(() => {
      saveBasicClassificationSync(db, {
        resourceId: duplicateResource.id,
        reality: "real",
        authorIds: [author.entity.id],
        characterIds: [],
      });
    }, /duplicados exactos/i);
  } finally {
    db.close();
  }
});

test("Media y Pendientes separan recursos incompletos de los esenciales completos", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Pending Queue Author");
    const flatTag = ensureTagSync(db, "pending-flat-tag");
    const newestUnclassified = insertResource(db, {
      id: "pending-newest-unclassified",
      contentHash: "hash-pending-newest-unclassified",
      importedAt: "2026-06-27T12:20:00.000Z",
    });
    const olderUnclassified = insertResource(db, {
      id: "pending-older-unclassified",
      contentHash: "hash-pending-older-unclassified",
      importedAt: "2026-06-27T12:10:00.000Z",
    });
    const classified = insertResource(db, {
      id: "pending-classified",
      contentHash: "hash-pending-classified",
      importedAt: "2026-06-27T12:30:00.000Z",
    });
    const fictionalWithoutEntities = insertResource(db, {
      id: "pending-fictional-without-entities",
      contentHash: "hash-pending-fictional-without-entities",
      reality: "ficticio",
      importedAt: "2026-06-27T12:40:00.000Z",
    });

    saveBasicClassificationSync(db, {
      resourceId: classified.id,
      reality: "real",
      authorIds: [author.entity.id],
    });
    saveResourceMetadataSync(db, {
      resourceId: classified.id,
      tagIds: [flatTag.tag.id],
    });

    const essentialPending = listResourcesSync(db, {
      section: "pending",
      query: { reality: null, pendingMode: "essential" },
      limit: 10,
    });
    const tagPending = listResourcesSync(db, {
      section: "pending",
      query: { reality: null, pendingMode: "tags" },
      limit: 10,
    });
    const media = listResourcesSync(db, {
      section: "media",
      query: {},
      limit: 10,
    });

    assert.equal(essentialPending.totalCount, 3);
    assert.deepEqual(essentialPending.items.map((item) => item.id), [
      fictionalWithoutEntities.id,
      newestUnclassified.id,
      olderUnclassified.id,
    ]);
    assert.equal(tagPending.totalCount, 1);
    assert.deepEqual(tagPending.items.map((item) => item.id), [classified.id]);
    assert.equal(media.totalCount, 1);
    assert.deepEqual(media.items.map((item) => item.id), [classified.id]);
  } finally {
    db.close();
  }
});

test("Pendientes pagina todos los recursos con el orden contextual por fecha predeterminado", () => {
  const db = createBooruDb();

  try {
    const untypedIds = Array.from({ length: 50 }, (_, index) => insertResource(db, {
      id: `pending-untyped-${index}`,
      contentHash: `hash-pending-untyped-${index}`,
      importedAt: `2026-06-27T12:${String(index).padStart(2, "0")}:00.000Z`,
    }).id);
    const partial = insertResource(db, {
      id: "pending-partially-classified",
      contentHash: "hash-pending-partially-classified",
      reality: "ficticio",
      importedAt: "2026-06-27T13:00:00.000Z",
    });

    const firstPage = listResourcesSync(db, {
      section: "pending",
      query: { reality: null, pendingMode: "essential" },
      offset: 0,
      limit: 42,
    });
    const secondPage = listResourcesSync(db, {
      section: "pending",
      query: { reality: null, pendingMode: "essential" },
      offset: 42,
      limit: 42,
    });

    assert.equal(firstPage.totalCount, 51);
    assert.equal(firstPage.items.length, 42);
    assert.equal(firstPage.hasMore, true);
    assert.equal(secondPage.items.length, 9);
    assert.equal(secondPage.hasMore, false);
    assert.deepEqual(
      [...firstPage.items, ...secondPage.items].map((item) => item.id),
      [partial.id, ...[...untypedIds].reverse()],
    );
  } finally {
    db.close();
  }
});

test("la consulta visible distingue Cualquiera, Sin tipo y faltantes contextuales", () => {
  const allQuery = buildBooruResourceQuery({ realityFilter: "all" });
  const untypedQuery = buildBooruResourceQuery({ realityFilter: "untyped" });
  const realMissingQuery = buildBooruResourceQuery({
    realityFilter: "real",
    missingFilter: "author",
  });
  const fictionalOptions = getBooruContextualMissingFilterOptions("ficticio", []);
  const characterFilteredOptions = getBooruContextualMissingFilterOptions("ficticio", [{ kind: "character" }]);
  const artistFilteredOptions = getBooruContextualMissingFilterOptions("ficticio", [{ kind: "artist" }]);
  const authorFilteredOptions = getBooruContextualMissingFilterOptions("real", [{ kind: "author" }]);
  const pendingRealOptions = getBooruContextualMissingFilterOptions("real", [], "essential");

  assert.equal(allQuery.reality, null);
  assert.equal(allQuery.missing, null);
  assert.equal(untypedQuery.reality, null);
  assert.equal(untypedQuery.missing, "type");
  assert.equal(realMissingQuery.reality, "real");
  assert.equal(realMissingQuery.missing, "author");
  assert.deepEqual(fictionalOptions.map((option) => option.value), ["none", "character", "universe", "artist"]);
  assert.equal(characterFilteredOptions.find((option) => option.value === "character")?.disabled, true);
  assert.equal(characterFilteredOptions.find((option) => option.value === "universe")?.disabled, true);
  assert.equal(artistFilteredOptions.find((option) => option.value === "artist")?.disabled, true);
  assert.equal(authorFilteredOptions.find((option) => option.value === "author")?.disabled, true);
  assert.deepEqual(pendingRealOptions.map((option) => option.value), ["none"]);
  assert.equal(getBooruImplicitRecommendationMissingKind("essential", "real"), "author");
  assert.equal(getBooruImplicitRecommendationMissingKind("all", "real"), null);
  assert.equal(getBooruRecommendationScope("pending", "essential"), "essential");
  assert.equal(getBooruRecommendationScope("pending", "tags"), "tags");
  assert.equal(getBooruRecommendationScope("media", "tags"), "all");
  assert.equal(normalizeBooruRecommendationScope("unknown"), "all");
  assert.equal(resourceMatchesBooruSection({ isPending: false }, "media", "essential"), true);
  assert.equal(resourceMatchesBooruSection({ isPending: true }, "media", "essential"), false);
  assert.equal(resourceMatchesBooruSection({ isPending: true }, "pending", "essential"), true);
  assert.equal(resourceMatchesBooruSection({ isPending: false }, "pending", "tags"), true);
});

test("Pendientes mueve una ruta Real entre Esencial y Tags al completarla o romperla", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Pending Transition Persona");
    const resource = insertResource(db, {
      id: "pending-real-transition",
      contentHash: "hash-pending-real-transition",
      reality: "real",
    });
    const listIds = (pendingMode) => listResourcesSync(db, {
      section: "pending",
      query: { pendingMode },
      limit: 20,
    }).items.map((item) => item.id);

    assert.ok(listIds("essential").includes(resource.id));
    assert.equal(listIds("tags").includes(resource.id), false);

    saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "real",
      authorIds: [author.entity.id],
    });

    assert.equal(listIds("essential").includes(resource.id), false);
    assert.ok(listIds("tags").includes(resource.id));

    saveResourceMetadataSync(db, {
      resourceId: resource.id,
      reality: "real",
      authorIds: [],
    });

    assert.ok(listIds("essential").includes(resource.id));
    assert.equal(listIds("tags").includes(resource.id), false);
  } finally {
    db.close();
  }
});

test("las mutaciones reportan revision, salida de consulta, posicion y entidades afectadas", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Anchored Details Persona");
    const resource = insertResource(db, {
      id: "pending-anchored-details",
      contentHash: "hash-pending-anchored-details",
      reality: "real",
    });
    const view = {
      section: "pending",
      query: { pendingMode: "essential", reality: "real" },
    };
    const mutationContext = createResourceMutationContextSync(db, {
      resourceId: resource.id,
      view,
    });

    const updatedResource = saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "real",
      authorIds: [author.entity.id],
    });
    const mutation = normalizeBooruResourceMutationResult(buildResourceMutationResultSync(db, {
      reason: "classification-saved",
      updatedResources: updatedResource,
      context: mutationContext,
    }));

    assert.ok(mutation.revision);
    assert.equal(mutation.reason, "classification-saved");
    assert.deepEqual(mutation.leavingQueryIds, [resource.id]);
    assert.deepEqual(mutation.enteredQueryIds, []);
    assert.deepEqual(mutation.queryPlacements, []);
    assert.equal(mutation.totalCountDelta, -1);
    assert.ok(mutation.affectedEntities.some((entity) => (
      entity.kind === "author" && entity.id === author.entity.id
    )));
    assert.equal(mutation.updatedResources[0]?.id, resource.id);
  } finally {
    db.close();
  }
});

test("Details conserva el recurso anclado cuando la card sale o cambia de posicion", () => {
  const resourceA = { id: "resource-a", marker: "a" };
  const resourceB = { id: "resource-b", marker: "before" };
  const resourceC = { id: "resource-c", marker: "c" };
  const updatedB = { id: "resource-b", marker: "after" };
  const leavingMutation = {
    revision: "revision-leaving",
    reason: "classification-saved",
    updatedResources: [updatedB],
    leavingQueryIds: [resourceB.id],
    totalCountDelta: -1,
  };
  const leavingWindow = applyBooruMutationToResourceWindow(
    [resourceA, resourceB, resourceC],
    leavingMutation,
  );
  const anchoredSelection = resolveBooruAnchoredResources(
    [resourceB.id],
    leavingWindow.items,
    [updatedB],
  );

  assert.deepEqual(leavingWindow.items.map((resource) => resource.id), [resourceA.id, resourceC.id]);
  assert.deepEqual(anchoredSelection, [updatedB]);

  const reorderedWindow = applyBooruMutationToResourceWindow(
    [resourceA, resourceB, resourceC],
    {
      revision: "revision-reordered",
      reason: "metadata-saved",
      updatedResources: [updatedB],
      queryPlacements: [{ resourceId: resourceB.id, index: 0 }],
    },
  );

  assert.deepEqual(reorderedWindow.items.map((resource) => resource.id), [resourceB.id, resourceA.id, resourceC.id]);
  assert.equal(reorderedWindow.items[0]?.marker, "after");

  const requestContext = {
    showResourceWorkspace: true,
    activeResourceSection: "pending",
    querySignature: '{"pendingMode":"essential"}',
    currentResourcePage: 1,
    itemCount: 42,
  };
  assert.equal(isBooruResourceWindowContextCurrent(requestContext, requestContext), true);
  assert.equal(isBooruResourceWindowContextCurrent(requestContext, {
    ...requestContext,
    currentResourcePage: 2,
    itemCount: 84,
  }), false);
  assert.equal(isBooruResourceWindowContextCurrent(requestContext, {
    ...requestContext,
    querySignature: '{"pendingMode":"tags"}',
  }), false);
});

test("los filtros de Pendientes respetan Sin tipo y los faltantes de cada realidad", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Filter Persona");
    const artist = ensureTypedEntitySync(db, "artist", "Filter Artist");
    const { character } = ensureCharacter(db, "Filter Character", "Filter Universe");
    const untyped = insertResource(db, { id: "filter-untyped", contentHash: "hash-filter-untyped" });
    const realMissing = insertResource(db, { id: "filter-real-missing", contentHash: "hash-filter-real-missing", reality: "real" });
    const realComplete = insertResource(db, { id: "filter-real-complete", contentHash: "hash-filter-real-complete" });
    const fictionalMissing = insertResource(db, { id: "filter-fictional-missing", contentHash: "hash-filter-fictional-missing", reality: "ficticio" });
    const fictionalComplete = insertResource(db, { id: "filter-fictional-complete", contentHash: "hash-filter-fictional-complete" });

    saveBasicClassificationSync(db, {
      resourceId: realComplete.id,
      reality: "real",
      authorIds: [author.entity.id],
    });
    saveBasicClassificationSync(db, {
      resourceId: fictionalComplete.id,
      reality: "ficticio",
      characterIds: [character.entity.id],
      artistIds: [artist.entity.id],
    });

    const listIds = (query) => listResourcesSync(db, {
      section: "pending",
      query: { pendingMode: "essential", ...query },
      limit: 20,
    }).items.map((item) => item.id);

    assert.deepEqual(listIds({ missing: "type" }), [untyped.id]);
    assert.deepEqual(listIds({ reality: "real" }), [realMissing.id]);
    assert.deepEqual(listIds({ reality: "real", missing: "author" }), [realMissing.id]);
    assert.deepEqual(listIds({ reality: "ficticio", missing: "character" }), [fictionalMissing.id]);
    assert.equal(listIds({ pendingMode: "tags", reality: "real" }).includes(realComplete.id), true);
    assert.equal(listIds({ pendingMode: "tags", reality: "ficticio" }).includes(fictionalComplete.id), true);

    const mediaIds = listResourcesSync(db, {
      section: "media",
      query: {},
      limit: 20,
    }).items.map((item) => item.id);
    const mediaUntypedIds = listResourcesSync(db, {
      section: "media",
      query: { missing: "type" },
      limit: 20,
    }).items.map((item) => item.id);

    assert.deepEqual(new Set(mediaIds), new Set([realComplete.id, fictionalComplete.id]));
    assert.deepEqual(mediaUntypedIds, []);
  } finally {
    db.close();
  }
});

test("el recomendador de Esencial excluye tags y Real recomienda Persona sin seleccion", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Recommended Persona");
    ensureTypedEntitySync(db, "artist", "Unrelated Artist");
    ensureTagSync(db, "existing-flat-tag");

    const essentialItems = listRecommendationsSync(db, {
      scope: "essential",
      resourceQuery: { reality: "real", pendingMode: "essential" },
      selectedResourceIds: [],
      limit: 50,
    }).items;
    const explicitTagItems = listRecommendationsSync(db, {
      scope: "essential",
      query: "tag:new-essential-tag",
      resourceQuery: { reality: "real", pendingMode: "essential" },
      selectedResourceIds: [],
      limit: 50,
    }).items;

    assert.ok(essentialItems.some((item) => item.entityId === author.entity.id));
    assert.ok(essentialItems.every((item) => item.type === "entity" && item.kind === "author"));
    assert.deepEqual(explicitTagItems, []);
  } finally {
    db.close();
  }
});

test("el recomendador de Tags limita resultados y creacion a tags planas", () => {
  const db = createBooruDb();

  try {
    const tag = ensureTagSync(db, "compact-tag");
    ensureTypedEntitySync(db, "author", "Hidden Persona");

    const tagItems = listRecommendationsSync(db, {
      scope: "tags",
      resourceQuery: { pendingMode: "tags" },
      limit: 50,
    }).items;
    const createItems = listRecommendationsSync(db, {
      scope: "tags",
      query: "new-compact-tag",
      resourceQuery: { pendingMode: "tags" },
      limit: 50,
    }).items;

    assert.ok(tagItems.some((item) => item.tagId === tag.tag.id));
    assert.ok(tagItems.every((item) => item.type === "tag"));
    assert.deepEqual(createItems.map((item) => item.type), ["create-tag"]);
  } finally {
    db.close();
  }
});

test("trashResourcesSync mueve recursos a Papelera y restoreResourcesSync los devuelve", async () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Trash Restore Persona");
    const visible = insertResource(db, {
      id: "resource-trash-visible",
      contentHash: "hash-trash-visible",
    });
    saveBasicClassificationSync(db, {
      resourceId: visible.id,
      reality: "real",
      authorIds: [author.entity.id],
    });

    trashResourcesSync(db, {
      resourceIds: [visible.id],
    });

    assert.equal(listLibraryRows(db).some((item) => item.id === visible.id), false);
    assert.deepEqual(listTrashRows(db).map((item) => item.id), [visible.id]);

    restoreResourcesSync(db, {
      resourceIds: [visible.id],
    });

    assert.equal(listTrashRows(db).length, 0);
    assert.equal(listLibraryRows(db).some((item) => item.id === visible.id), true);
  } finally {
    db.close();
  }
});

test("listResourcesSync devuelve todos los matches reales sin truncar antes del filtro", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Pagination Persona");
    for (let index = 0; index < 260; index += 1) {
      const resource = insertResource(db, {
        id: `resource-video-${index}`,
        contentHash: `hash-video-${index}`,
        mediaKind: "video",
        mimeType: "video/mp4",
        extension: ".mp4",
        originalFilename: `video-${index}.mp4`,
        storageFilename: `video-${index}.mp4`,
        importedAt: `2026-06-27T12:${String(index % 60).padStart(2, "0")}:00.000Z`,
      });
      saveBasicClassificationSync(db, {
        resourceId: resource.id,
        reality: "real",
        authorIds: [author.entity.id],
      });
    }

    const pageA = listResourcesSync(db, {
      section: "media",
      quickFilter: "video",
      offset: 0,
      limit: 180,
    });
    const pageB = listResourcesSync(db, {
      section: "media",
      quickFilter: "video",
      offset: 180,
      limit: 180,
    });

    assert.equal(pageA.totalCount, 260);
    assert.equal(pageA.items.length, 180);
    assert.equal(pageA.hasMore, true);
    assert.equal(pageB.items.length, 80);
    assert.equal(pageB.hasMore, false);
  } finally {
    db.close();
  }
});

test("listRecommendationsSync pagina entidades existentes y respeta el prefijo tipado", () => {
  const db = createBooruDb();

  try {
    for (let index = 0; index < 30; index += 1) {
      ensureTypedEntitySync(db, "author", `Regression Author ${String(index).padStart(2, "0")}`);
    }
    ensureTypedEntitySync(db, "artist", "Regression Artist 00");

    const firstPage = listRecommendationsSync(db, {
      query: "author:Regression",
      offset: 0,
      limit: 24,
    });
    const secondPage = listRecommendationsSync(db, {
      query: "author:Regression",
      offset: 24,
      limit: 24,
    });

    assert.equal(firstPage.items.length, 24);
    // The typed composer intentionally offers one inline create action in
    // addition to the existing exact-kind matches.
    assert.equal(firstPage.totalCount, 31);
    assert.equal(firstPage.hasMore, true);
    assert.equal(secondPage.items.length, 7);
    assert.equal(secondPage.hasMore, false);
    assert.ok([...firstPage.items, ...secondPage.items].every((item) => item.kind === "author"));
    assert.equal(
      [...firstPage.items, ...secondPage.items].filter((item) => item.type === "entity").length,
      30,
    );
  } finally {
    db.close();
  }
});

test("las recomendaciones priorizan compatibilidad sin ocultar tipos de menor afinidad", () => {
  const db = createBooruDb();

  try {
    const universe = ensureTypedEntitySync(db, "universe", "Priority Universe");
    ensureCharacter(db, "Priority Character", "Priority Universe");
    ensureTypedEntitySync(db, "artist", "Priority Artist");
    ensureTypedEntitySync(db, "author", "Priority Persona");

    const recommendations = listRecommendationsSync(db, {
      resourceQuery: {
        includeEntities: [{ kind: "universe", id: universe.entity.id }],
      },
      limit: 100,
    });
    const entityKinds = recommendations.items
      .filter((item) => item.type === "entity")
      .map((item) => item.kind);

    assert.equal(entityKinds[0], "character");
    assert.ok(entityKinds.includes("artist"));
    assert.ok(entityKinds.includes("author"));
    assert.ok(entityKinds.includes("universe"));
  } finally {
    db.close();
  }
});

test("los encuadres avatar y banner se normalizan y se preservan entre si", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Regression Visual Author");
    const resource = insertResource(db, {
      id: "resource-regression-visual",
      contentHash: "hash-regression-visual",
      width: 2400,
      height: 1200,
    });
    const bannerResource = insertResource(db, {
      id: "resource-regression-banner",
      contentHash: "hash-regression-banner",
      width: 2400,
      height: 600,
    });

    setEntityVisualSync(db, {
      kind: "author",
      entityId: author.entity.id,
      resourceId: resource.id,
      visualRole: "avatar",
    });
    setEntityVisualLayoutSync(db, {
      kind: "author",
      entityId: author.entity.id,
      visualRole: "avatar",
      layout: { scale: 2.5, offsetX: 90, offsetY: -90 },
    });
    const profile = setEntityVisualSync(db, {
      kind: "author",
      entityId: author.entity.id,
      resourceId: bannerResource.id,
      visualRole: "banner",
      layout: { scale: 8, offsetX: 1, offsetY: -1 },
    });

    assert.equal(profile.avatarResourceId, resource.id);
    assert.equal(profile.bannerResourceId, bannerResource.id);
    assert.deepEqual(profile.visualSettings.avatar, { scale: 2.5, offsetX: 0.5, offsetY: -0.5 });
    assert.deepEqual(profile.visualSettings.banner, { scale: 4, offsetX: 1, offsetY: -1 });
    assert.deepEqual(profile.visuals.avatar, {
      role: "avatar",
      selection: "avatar",
      resourceId: resource.id,
      source: {
        resourceId: resource.id,
        pathValue: `C:\\booru\\${resource.id}.jpg`,
        previewPath: `C:\\booru\\${resource.id}.jpg`,
        mediaKind: "image",
      },
      layout: { scale: 2.5, offsetX: 0.5, offsetY: -0.5 },
    });

    const card = listEntitiesSync(db, "author").find((item) => item.id === author.entity.id);
    assert.deepEqual(card.visual, profile.visuals.avatar);
    assert.deepEqual(
      getBooruEntityVisualRenderProps(card.visual),
      getBooruEntityVisualRenderProps(profile.visuals.avatar),
    );
    assert.deepEqual(getBooruEntityVisualMediaStyle(card.visual), {
      transform: "translate(50%, -50%) scale(2.5)",
      transformOrigin: "center center",
    });
  } finally {
    db.close();
  }
});

test("cards y perfiles comparten la misma proyeccion visual derivada y el mismo fallback", () => {
  const db = createBooruDb();

  try {
    const author = ensureTypedEntitySync(db, "author", "Derived Visual Author");
    const resource = insertResource(db, {
      id: "resource-derived-visual",
      contentHash: "hash-derived-visual",
    });

    saveBasicClassificationSync(db, {
      resourceId: resource.id,
      reality: "real",
      authorIds: [author.entity.id],
    });

    const profile = getEntityProfileSync(db, "author", author.entity.id);
    const card = listEntitiesSync(db, "author").find((item) => item.id === author.entity.id);
    assert.equal(profile.visuals.avatar.selection, "derived");
    assert.deepEqual(card.visual, profile.visuals.avatar);
    assert.deepEqual(card.visual.layout, { scale: 1, offsetX: 0, offsetY: 0 });

    const noSource = createBooruEntityVisualProjection({
      role: "avatar",
      descriptor: null,
      layout: { scale: 3, offsetX: 1, offsetY: 1 },
    });
    assert.equal(noSource, null);
    assert.equal(getBooruEntityVisualRenderProps(noSource), null);
  } finally {
    db.close();
  }
});

test("la galeria de perfil cuenta los mismos recursos activos que el DTO aunque esten incompletos", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Regression Artist");
    const resources = [0, 1, 2].map((index) => insertResource(db, {
      id: `regression-artist-resource-${index}`,
      contentHash: `regression-artist-hash-${index}`,
    }));
    const insertRelation = db.prepare(`
      INSERT INTO booru_resource_artists (resource_id, artist_id, sort_order, created_at)
      VALUES (?, ?, 0, ?)
    `);
    resources.forEach((resource) => insertRelation.run(
      resource.id,
      artist.entity.id,
      "2026-07-21T12:00:00.000Z",
    ));

    const entity = listEntitiesSync(db, "artist").find((item) => item.id === artist.entity.id);
    const profile = getEntityProfileSync(db, "artist", artist.entity.id);
    const gallery = listResourcesSync(db, {
      section: "profile",
      query: { includeEntities: [{ kind: "artist", id: artist.entity.id }] },
      offset: 0,
      limit: 42,
    });
    const filenameOnlyGallery = listResourcesSync(db, {
      section: "profile",
      query: {
        text: "resource-1",
        includeEntities: [{ kind: "artist", id: artist.entity.id }],
      },
      offset: 0,
      limit: 42,
    });
    const searchableTag = ensureTagSync(db, "Arcane marker");
    replaceResourceTagAssignmentsSync(db, resources[1].id, [searchableTag.tag.id]);
    const filteredGallery = listResourcesSync(db, {
      section: "profile",
      query: {
        textTerms: "arcane",
        includeEntities: [{ kind: "artist", id: artist.entity.id }],
      },
      offset: 0,
      limit: 42,
    });
    const media = listResourcesSync(db, {
      section: "media",
      query: { includeEntities: [{ kind: "artist", id: artist.entity.id }] },
      offset: 0,
      limit: 42,
    });

    assert.equal(entity.resourceCount, 3);
    assert.equal(profile.resourceCount, 3);
    assert.equal(gallery.totalCount, 3);
    assert.equal(gallery.items.length, 3);
    assert.equal(filenameOnlyGallery.totalCount, 0);
    assert.equal(filteredGallery.totalCount, 1);
    assert.equal(filteredGallery.items[0].id, resources[1].id);
    assert.equal(media.totalCount, 0);
  } finally {
    db.close();
  }
});

test("la busqueda contextual usa OR libre, AND exacto, herencia y nunca filename", () => {
  const db = createBooruDb();

  try {
    const { character: mercy, universe: overwatch } = ensureCharacter(db, "Mercy", "Overwatch");
    const persona = ensureTypedEntitySync(db, "author", "Angela Ziegler");
    const mercyResource = insertResource(db, {
      id: "search-mercy",
      originalFilename: "unrelated-file.jpg",
      contentHash: "search-mercy-hash",
    });
    const mageResource = insertResource(db, {
      id: "search-mage",
      originalFilename: "secret-mercy-filename.jpg",
      contentHash: "search-mage-hash",
    });
    const personaResource = insertResource(db, {
      id: "search-persona",
      originalFilename: "plain.jpg",
      contentHash: "search-persona-hash",
    });
    const mageTag = ensureTagSync(db, "Magogia");
    const healerTag = ensureTagSync(db, "Healer");

    db.prepare("INSERT INTO booru_resource_characters (resource_id, character_id, sort_order, created_at) VALUES (?, ?, 0, ?)")
      .run(mercyResource.id, mercy.entity.id, "2026-07-21T12:00:00.000Z");
    db.prepare("INSERT INTO booru_resource_authors (resource_id, author_id, sort_order, created_at) VALUES (?, ?, 0, ?)")
      .run(personaResource.id, persona.entity.id, "2026-07-21T12:00:00.000Z");
    db.prepare("INSERT INTO booru_entity_aliases (entity_kind, entity_id, alias_name, comparable_name, created_at) VALUES ('author', ?, 'Merciful Doctor', 'merciful doctor', ?)")
      .run(persona.entity.id, "2026-07-21T12:00:00.000Z");
    db.prepare("INSERT INTO booru_entity_tags (entity_kind, entity_id, tag_id, created_at) VALUES ('character', ?, ?, ?)")
      .run(mercy.entity.id, healerTag.tag.id, "2026-07-21T12:00:00.000Z");
    replaceResourceTagAssignmentsSync(db, mageResource.id, [mageTag.tag.id]);
    syncResourceInheritanceSync(db, mercyResource.id);

    const orResult = listResourcesSync(db, {
      section: "profile",
      query: { textTerms: "magog mercy" },
      limit: 42,
    });
    const inheritedUniverse = listResourcesSync(db, {
      section: "profile",
      query: { textTerms: "overw" },
      limit: 42,
    });
    const inheritedTag = listResourcesSync(db, {
      section: "profile",
      query: { textTerms: "heal" },
      limit: 42,
    });
    const aliasResult = listResourcesSync(db, {
      section: "profile",
      query: { textTerms: "merciful" },
      limit: 42,
    });
    const exactAndText = listResourcesSync(db, {
      section: "profile",
      query: {
        textTerms: "magog mercy",
        includeEntities: [{ kind: "character", id: mercy.entity.id }],
      },
      limit: 42,
    });
    const filenameResult = listResourcesSync(db, {
      section: "profile",
      query: { textTerms: "secret-mercy-filename" },
      limit: 42,
    });

    assert.deepEqual(new Set(orResult.items.map((item) => item.id)), new Set([mercyResource.id, mageResource.id]));
    assert.deepEqual(inheritedUniverse.items.map((item) => item.id), [mercyResource.id]);
    assert.deepEqual(inheritedTag.items.map((item) => item.id), [mercyResource.id]);
    assert.deepEqual(aliasResult.items.map((item) => item.id), [personaResource.id]);
    assert.deepEqual(exactAndText.items.map((item) => item.id), [mercyResource.id]);
    assert.equal(filenameResult.totalCount, 0);
    assert.equal(overwatch.entity.displayName, "Overwatch");
  } finally {
    db.close();
  }
});

test("la agrupacion por entidad infiere su presencia y no crea grupos Sin entidad", () => {
  const db = createBooruDb();

  try {
    const persona = ensureTypedEntitySync(db, "author", "Grouped Persona");
    const artist = ensureTypedEntitySync(db, "artist", "Grouped Artist");
    const { character } = ensureCharacter(db, "Grouped Character", "Grouped Universe");
    const realResource = insertResource(db, {
      id: "grouped-real",
      contentHash: "grouped-real-hash",
      importedAt: "2026-07-21T12:00:00.000Z",
    });
    const fictionalResource = insertResource(db, {
      id: "grouped-fictional",
      contentHash: "grouped-fictional-hash",
      importedAt: "2026-07-20T12:00:00.000Z",
    });

    saveBasicClassificationSync(db, {
      resourceId: realResource.id,
      reality: "real",
      authorIds: [persona.entity.id],
    });
    saveBasicClassificationSync(db, {
      resourceId: fictionalResource.id,
      reality: "ficticio",
      characterIds: [character.entity.id],
      artistIds: [artist.entity.id],
    });

    const byPersona = listResourcesSync(db, {
      section: "media",
      query: {
        grouping: "sectioned",
        groupBy: "author",
        groupOrderBy: "alphabetical",
        direction: "asc",
      },
      limit: 42,
    });
    const byCharacter = listResourcesSync(db, {
      section: "media",
      query: {
        grouping: "sectioned",
        groupBy: "character",
        groupOrderBy: "alphabetical",
        direction: "asc",
      },
      limit: 42,
    });

    assert.equal(byPersona.totalCount, 1);
    assert.deepEqual(byPersona.items.map((item) => item.id), [realResource.id]);
    assert.deepEqual(byPersona.placements.map((placement) => placement.groupLabel), ["Grouped Persona"]);
    assert.equal(byCharacter.totalCount, 1);
    assert.deepEqual(byCharacter.items.map((item) => item.id), [fictionalResource.id]);
    assert.deepEqual(byCharacter.placements.map((placement) => placement.groupLabel), ["Grouped Character"]);
  } finally {
    db.close();
  }
});

test("las relaciones de perfiles son derivadas, incrementales, buscables y excluyen recursos inactivos", () => {
  const db = createBooruDb();

  try {
    const artistA = ensureTypedEntitySync(db, "artist", "Relation Artist A");
    const artistB = ensureTypedEntitySync(db, "artist", "Relation Artist B");
    const { character, universe } = ensureCharacter(db, "Relation Character", "Relation Universe");
    const resourceA = insertResource(db, { id: "relation-resource-a", contentHash: "relation-hash-a" });
    const resourceB = insertResource(db, { id: "relation-resource-b", contentHash: "relation-hash-b" });

    saveBasicClassificationSync(db, {
      resourceId: resourceA.id,
      reality: "ficticio",
      characterIds: [character.entity.id],
      artistIds: [artistA.entity.id],
    });
    saveBasicClassificationSync(db, {
      resourceId: resourceB.id,
      reality: "ficticio",
      characterIds: [character.entity.id],
      artistIds: [artistB.entity.id],
    });

    const firstArtistsPage = listEntityRelationsSync(db, {
      sourceKind: "universe",
      sourceId: universe.entity.id,
      relationKind: "artist",
      offset: 0,
      limit: 1,
    });
    const secondArtistsPage = listEntityRelationsSync(db, {
      sourceKind: "universe",
      sourceId: universe.entity.id,
      relationKind: "artist",
      offset: 1,
      limit: 1,
    });
    const characterArtists = listEntityRelationsSync(db, {
      sourceKind: "character",
      sourceId: character.entity.id,
      relationKind: "artist",
      query: "B",
    });
    const artistUniverses = listEntityRelationsSync(db, {
      sourceKind: "artist",
      sourceId: artistA.entity.id,
      relationKind: "universe",
    });

    assert.equal(firstArtistsPage.totalCount, 2);
    assert.equal(firstArtistsPage.items.length, 1);
    assert.equal(firstArtistsPage.hasMore, true);
    assert.equal(secondArtistsPage.items.length, 1);
    assert.equal(secondArtistsPage.hasMore, false);
    assert.deepEqual(characterArtists.items.map((item) => item.id), [artistB.entity.id]);
    assert.deepEqual(artistUniverses.items.map((item) => item.id), [universe.entity.id]);

    db.prepare(`
      INSERT INTO booru_resource_universe_exclusions (resource_id, universe_id, created_at)
      VALUES (?, ?, ?)
    `).run(resourceA.id, universe.entity.id, "2026-07-21T12:00:00.000Z");
    assert.equal(listEntityRelationsSync(db, {
      sourceKind: "artist",
      sourceId: artistA.entity.id,
      relationKind: "universe",
    }).totalCount, 0);

    trashResourcesSync(db, { resourceIds: [resourceA.id] });
    assert.equal(listEntityRelationsSync(db, {
      sourceKind: "artist",
      sourceId: artistA.entity.id,
      relationKind: "character",
    }).totalCount, 0);
    assert.equal(listEntityRelationsSync(db, {
      sourceKind: "universe",
      sourceId: universe.entity.id,
      relationKind: "character",
    }).totalCount, 1);
  } finally {
    db.close();
  }
});

test("las listas de entidades buscan por tags propias ademas de nombre y alias", () => {
  const db = createBooruDb();

  try {
    const artist = ensureTypedEntitySync(db, "artist", "Tagged Artist");
    const tag = ensureTagSync(db, "neon palette");
    saveEntityProfileSync(db, {
      kind: "artist",
      entityId: artist.entity.id,
      tagIds: [tag.tag.id],
    });

    assert.deepEqual(
      listEntitiesSync(db, "artist", "neon").map((item) => item.id),
      [artist.entity.id],
    );
  } finally {
    db.close();
  }
});

test("el teardown de Booru aborta procesos y espera los trabajos registrados antes de cerrar", async () => {
  let resolveTask;
  let taskFinished = false;
  let queueFinished = false;
  let childKilled = false;
  const backgroundTasks = new Set();
  const task = new Promise((resolve) => {
    resolveTask = () => {
      taskFinished = true;
      resolve();
    };
  });
  const trackedTask = task.finally(() => backgroundTasks.delete(trackedTask));
  backgroundTasks.add(trackedTask);
  const queue = new Promise((resolve) => {
    setTimeout(() => {
      queueFinished = true;
      resolve();
    }, 5);
  });
  const state = {
    abortController: new AbortController(),
    backgroundTasks,
    childProcesses: new Set([{
      kill() {
        childKilled = true;
      },
    }]),
    fastClassification: { kind: "author", entityId: "author", scopeId: "scope" },
    invalidationTimer: null,
    pendingInvalidations: new Set(["metricsVersion"]),
    queue,
    queuedPaths: new Set(["queued-file"]),
    thumbnailHighPriorityIds: ["high"],
    thumbnailLowPriorityIds: ["low"],
    thumbnailQueuedIds: new Set(["queued"]),
    thumbnailProcessingIds: new Set(["processing"]),
    watcher: null,
    watcherState: {
      active: false,
      stage: "idle",
      pendingCount: 1,
    },
  };

  setTimeout(resolveTask, 10);
  await drainRuntimeBackgroundWork(state);

  assert.equal(state.abortController.signal.aborted, true);
  assert.equal(queueFinished, true);
  assert.equal(taskFinished, true);
  assert.equal(childKilled, true);
  assert.equal(state.backgroundTasks.size, 0);
  assert.equal(state.childProcesses.size, 0);
  assert.equal(state.thumbnailProcessingIds.size, 0);
  assert.equal(state.queuedPaths.size, 0);
  assert.equal(state.watcherState.pendingCount, 0);
});
