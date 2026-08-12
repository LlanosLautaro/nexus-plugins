import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  createBooruMediaRuntimeAccess,
  isSystemicMediaRuntimeError,
} from "../booru/src/media-runtime.mjs";

test("Booru comparte una sola verificacion host.media", async () => {
  let calls = 0;
  const expected = { version: "9.0", ffmpegPath: "synthetic-ffmpeg", ffprobePath: "synthetic-ffprobe", manifestDigest: "a".repeat(64) };
  const access = createBooruMediaRuntimeAccess({
    capabilities: { media: { requireRuntime: async () => { calls += 1; return expected; } } },
  });
  const [left, right] = await Promise.all([access.requireRuntime(), access.requireRuntime()]);
  assert.equal(left, expected);
  assert.equal(right, expected);
  assert.equal(calls, 1);
  assert.equal(access.isUnavailable(), false);
});

test("Booru consolida ausencia del runtime y no reintenta por recurso", async () => {
  let calls = 0;
  const error = Object.assign(new Error("El runtime multimedia de Nexus no esta disponible."), {
    code: "MULTIMEDIA_RUNTIME_UNAVAILABLE",
  });
  const access = createBooruMediaRuntimeAccess({
    capabilities: { media: { requireRuntime: async () => { calls += 1; throw error; } } },
  });
  await assert.rejects(access.requireRuntime(), /runtime multimedia/);
  await assert.rejects(access.requireRuntime(), /runtime multimedia/);
  assert.equal(calls, 1);
  assert.equal(access.isUnavailable(), true);
  assert.equal(isSystemicMediaRuntimeError(error), true);
});

test("Booru ya no distribuye ni resuelve binarios privados", async () => {
  const repositoryRoot = path.resolve(import.meta.dirname, "..");
  const pluginRoot = path.join(repositoryRoot, "booru");
  const [manifest, backendSource, buildSource] = await Promise.all([
    fsp.readFile(path.join(pluginRoot, "manifest.json"), "utf8").then(JSON.parse),
    fsp.readFile(path.join(pluginRoot, "src", "backend.ts"), "utf8"),
    fsp.readFile(path.join(repositoryRoot, "scripts", "build-plugin.mjs"), "utf8"),
  ]);
  assert.deepEqual(manifest.permissions, ["host.node", "host.media"]);
  assert.doesNotMatch(backendSource, /dist[\\/]vendor|vendor[\\/]ffmpeg|vendor[\\/]ffprobe/);
  assert.doesNotMatch(buildSource, /ffmpeg-static|ffprobe-static/);
  await assert.rejects(fsp.access(path.join(pluginRoot, "dist", "vendor", "ffmpeg.exe")));
  await assert.rejects(fsp.access(path.join(pluginRoot, "dist", "vendor", "ffprobe.exe")));
});
