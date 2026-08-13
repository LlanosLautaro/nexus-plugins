import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promoteStagedRelease } from "../scripts/release-transaction.mjs";

function writeTree(root, marker) {
  fs.mkdirSync(path.join(root, "fixture", "dist"), { recursive: true });
  fs.writeFileSync(path.join(root, "fixture", "manifest.json"), `${marker}-manifest`);
  fs.writeFileSync(path.join(root, "fixture", "dist", "bundle.js"), `${marker}-bundle`);
}

test("un fallo de release restaura manifests y dist exactamente", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-plugin-release-"));
  const workspaceRoot = path.join(root, "workspace");
  const stageRoot = path.join(root, "stage");
  try {
    writeTree(workspaceRoot, "old");
    writeTree(stageRoot, "new");
    assert.throws(() => promoteStagedRelease({ workspaceRoot, stageRoot, plugins: ["fixture"], failAfterTarget: 1 }), /simulado/);
    assert.equal(fs.readFileSync(path.join(workspaceRoot, "fixture", "manifest.json"), "utf8"), "old-manifest");
    assert.equal(fs.readFileSync(path.join(workspaceRoot, "fixture", "dist", "bundle.js"), "utf8"), "old-bundle");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("una promocion verde aplica manifest y dist juntos", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-plugin-release-"));
  const workspaceRoot = path.join(root, "workspace");
  const stageRoot = path.join(root, "stage");
  try {
    writeTree(workspaceRoot, "old");
    writeTree(stageRoot, "new");
    promoteStagedRelease({ workspaceRoot, stageRoot, plugins: ["fixture"] });
    assert.equal(fs.readFileSync(path.join(workspaceRoot, "fixture", "manifest.json"), "utf8"), "new-manifest");
    assert.equal(fs.readFileSync(path.join(workspaceRoot, "fixture", "dist", "bundle.js"), "utf8"), "new-bundle");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
