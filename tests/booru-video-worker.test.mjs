import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");

test("el worker multimedia recibe ejecutables del host y no resuelve copias privadas", async () => {
  const workerPath = path.join(repositoryRoot, "booru", "assets", "booru_media_worker.py");
  const source = await fs.readFile(workerPath, "utf8");
  assert.match(source, /--ffmpeg/);
  assert.match(source, /--ffprobe/);
  assert.doesNotMatch(source, /ffmpeg-static|ffprobe-static|dist[\\/]vendor/);
  await assert.rejects(fs.access(path.join(repositoryRoot, "booru", "dist", "vendor", "ffmpeg.exe")));
  await assert.rejects(fs.access(path.join(repositoryRoot, "booru", "dist", "vendor", "ffprobe.exe")));
});
