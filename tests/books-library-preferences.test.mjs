import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBooksGridColumnOverride,
  normalizeBooksLibraryPreferences,
  writeBooksGridColumns,
} from "../Books/src/library-preferences.js";

test("Books conserva el layout responsivo hasta que existe una preferencia explicita", () => {
  assert.equal(normalizeBooksGridColumnOverride(null), null);
  assert.equal(normalizeBooksGridColumnOverride(undefined), null);
  assert.equal(normalizeBooksGridColumnOverride(""), null);
  assert.deepEqual(normalizeBooksLibraryPreferences(), { gridColumns: null });
});

test("Books normaliza la cantidad persistida de columnas dentro del rango de GalleryGrid", () => {
  assert.equal(normalizeBooksGridColumnOverride(4.6), 5);
  assert.equal(normalizeBooksGridColumnOverride(-10), 1);
  assert.equal(normalizeBooksGridColumnOverride(99), 8);
  assert.equal(normalizeBooksGridColumnOverride("invalido"), null);
});

test("Books actualiza gridColumns sin descartar futuras preferencias UI", () => {
  assert.deepEqual(
    writeBooksGridColumns({ gridColumns: 3, futurePreference: true }, 6),
    { gridColumns: 6, futurePreference: true },
  );
});
