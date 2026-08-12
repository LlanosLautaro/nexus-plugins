import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBooksSettings,
  readBooksEngineAssignments,
  writeBooksEngineAssignments,
} from "../Books/src/plugin-settings.js";

test("normalizeBooksSettings aplica defaults del plugin", () => {
  assert.deepEqual(normalizeBooksSettings(undefined), {
    engineAssignments: [],
  });
});

test("readBooksEngineAssignments acepta rootItemId y mantiene fallback legacy rootPath", () => {
  assert.deepEqual(
    readBooksEngineAssignments({
      engineAssignments: [
        {
          engineId: "nexus.books.document",
          rootItemId: "folder_books",
          rootPath: "Media/Books",
          recursive: false,
        },
        {
          engineId: "nexus.books.document",
          rootPath: "Media/Legacy",
        },
      ],
    }),
    [
      {
        engineId: "nexus.books.document",
        rootItemId: "folder_books",
        rootPath: "Media/Books",
        recursive: false,
      },
      {
        engineId: "nexus.books.document",
        rootItemId: "",
        rootPath: "Media/Legacy",
        recursive: true,
      },
    ],
  );
});

test("writeBooksEngineAssignments persiste rootItemId como identidad autoritativa", () => {
  assert.deepEqual(
    writeBooksEngineAssignments(
      {
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
          rootItemId: "folder_books",
          rootPath: "Media/Books",
          recursive: true,
        },
      ],
    ),
    {
      engineAssignments: [
        {
          engineId: "other.engine",
          rootItemId: "folder_other",
          rootPath: "Other",
          recursive: true,
        },
        {
          engineId: "nexus.books.document",
          rootItemId: "folder_books",
          rootPath: "Media/Books",
          recursive: true,
        },
      ],
    },
  );
});
