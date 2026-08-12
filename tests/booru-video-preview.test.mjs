import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const policy = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "video-preview-policy.js")));

test("la politica usa original hasta 15 s y derivado a partir de 15 s exactos superados", () => {
  for (const durationMs of [10_000, 15_000]) {
    assert.equal(policy.shouldGenerateBooruVideoShort("video", durationMs), false);
    assert.deepEqual(policy.resolveBooruVideoAutoplay({ mediaKind: "video", durationMs }), {
      autoplay: true,
      autoplayPath: "",
      source: "original",
    });
  }

  for (const durationMs of [15_001, 16_000, 60_000, 61_000]) {
    assert.equal(policy.shouldGenerateBooruVideoShort("video", durationMs), true);
  }
  assert.equal(policy.resolveBooruVideoAutoplay({ mediaKind: "video", durationMs: null }).autoplay, false);
});

test("solo la variante vigente habilita autoplay derivado en videos largos", () => {
  const base = {
    mediaKind: "video",
    durationMs: 60_000,
    autoplayStoragePath: "C:\\booru\\shorts\\preview.mp4",
    videoShortStatus: "ready",
  };
  assert.equal(policy.resolveBooruVideoAutoplay({
    ...base,
    videoShortVariant: "legacy-60s-v1",
  }).autoplay, false);
  assert.deepEqual(policy.resolveBooruVideoAutoplay({
    ...base,
    videoShortVariant: policy.BOORU_VIDEO_SHORT_VARIANT,
  }), {
    autoplay: true,
    autoplayPath: base.autoplayStoragePath,
    source: "derivative",
  });
});

test("GIF y WebP animado permanecen fuera de la politica de shorts de video", () => {
  assert.equal(policy.shouldGenerateBooruVideoShort("gif", 60_000), false);
  assert.equal(policy.shouldGenerateBooruVideoShort("image", 60_000), false);
  assert.equal(policy.resolveBooruVideoAutoplay({ mediaKind: "gif", durationMs: 60_000 }).source, "none");
  assert.equal(policy.resolveBooruVideoAutoplay({ mediaKind: "image", durationMs: 60_000 }).source, "none");
});

test("el worker recibe la duracion versionada y el hero conserva el original", () => {
  const workerSource = fs.readFileSync(path.join(pluginRoot, "assets", "booru_media_worker.py"), "utf8");
  const backendSource = fs.readFileSync(path.join(pluginRoot, "src", "backend.ts"), "utf8");
  const heroSource = fs.readFileSync(path.join(pluginRoot, "src", "components", "media", "ResourceHeroOverlay.jsx"), "utf8");
  assert.match(workerSource, /--video-short-duration-seconds/);
  assert.match(workerSource, /"-t", str\(duration_seconds\)/);
  assert.match(backendSource, /BOORU_VIDEO_SHORT_VARIANT/);
  assert.doesNotMatch(heroSource, /autoplayStoragePath|videoShortVariant/);
});
