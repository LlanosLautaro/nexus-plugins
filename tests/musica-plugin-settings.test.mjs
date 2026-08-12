import test from "node:test";
import assert from "node:assert/strict";
import {
  MUSICA_SETTINGS_DEFAULTS,
  isMusicaEmbeddedCoverArtEnabled,
  normalizeMusicaSettings,
  readMusicaEngineAssignments,
  resolveEmbeddedCoverPayload,
  writeMusicaEngineAssignments,
} from "../musica/src/plugin-settings.js";

test("normalizeMusicaSettings aplica defaults del plugin", () => {
  assert.deepEqual(normalizeMusicaSettings(undefined), {
    extractEmbeddedCoverArt: true,
    engineAssignments: [],
  });
  assert.equal(MUSICA_SETTINGS_DEFAULTS.extractEmbeddedCoverArt, true);
});

test("isMusicaEmbeddedCoverArtEnabled respeta override explicito", () => {
  assert.equal(isMusicaEmbeddedCoverArtEnabled({}), true);
  assert.equal(isMusicaEmbeddedCoverArtEnabled({ extractEmbeddedCoverArt: true }), true);
  assert.equal(isMusicaEmbeddedCoverArtEnabled({ extractEmbeddedCoverArt: false }), false);
});

test("resolveEmbeddedCoverPayload limpia cover cuando el setting esta desactivado", () => {
  assert.deepEqual(
    resolveEmbeddedCoverPayload({
      enabled: true,
      cover: "data:image/png;base64,abc",
      coverMimeType: "image/png",
    }),
    {
      cover: "data:image/png;base64,abc",
      coverMimeType: "image/png",
    },
  );

  assert.deepEqual(
    resolveEmbeddedCoverPayload({
      enabled: false,
      cover: "data:image/png;base64,abc",
      coverMimeType: "image/png",
    }),
    {
      cover: null,
      coverMimeType: null,
    },
  );
});

test("readMusicaEngineAssignments acepta rootItemId y mantiene fallback legacy rootPath", () => {
  assert.deepEqual(
    readMusicaEngineAssignments({
      engineAssignments: [
        {
          engineId: "nexus.musica.audio",
          rootItemId: "folder_123",
          rootPath: "Media/Musica",
          recursive: false,
        },
        {
          engineId: "nexus.musica.audio",
          rootPath: "Media/Legacy",
        },
      ],
    }),
    [
      {
        engineId: "nexus.musica.audio",
        rootItemId: "folder_123",
        rootPath: "Media/Musica",
        recursive: false,
      },
      {
        engineId: "nexus.musica.audio",
        rootItemId: "",
        rootPath: "Media/Legacy",
        recursive: true,
      },
    ],
  );
});

test("writeMusicaEngineAssignments persiste rootItemId como identidad autoritativa", () => {
  assert.deepEqual(
    writeMusicaEngineAssignments(
      {
        extractEmbeddedCoverArt: false,
        engineAssignments: [
          {
            engineId: "other.engine",
            rootItemId: "folder_other",
            rootPath: "Other",
            recursive: true,
          },
        ],
      },
      [
        {
          rootItemId: "folder_music",
          rootPath: "Media/Musica",
          recursive: true,
        },
      ],
    ),
    {
      extractEmbeddedCoverArt: false,
      engineAssignments: [
        {
          engineId: "other.engine",
          rootItemId: "folder_other",
          rootPath: "Other",
          recursive: true,
        },
        {
          engineId: "nexus.musica.audio",
          rootItemId: "folder_music",
          rootPath: "Media/Musica",
          recursive: true,
        },
      ],
    },
  );
});
