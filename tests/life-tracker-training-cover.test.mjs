import test from "node:test";
import assert from "node:assert/strict";
import {
  TRAINING_COVER_PROPERTY_REF,
  buildTrainingCoverLink,
  cleanTrainingCoverTarget,
  pasteTrainingCover,
  resolveTrainingCoverImageUrl,
} from "../life-tracker/src/training/training-cover.js";

test("training cover normaliza enlaces internos legibles", () => {
  assert.equal(buildTrainingCoverLink("_attachments\\quadriceps.png"), "[[_attachments/quadriceps.png]]");
  assert.equal(cleanTrainingCoverTarget("[[_attachments/quadriceps.png|Portada]]"), "_attachments/quadriceps.png");
  assert.equal(cleanTrainingCoverTarget("[Portada](_attachments/quadriceps.png)"), "_attachments/quadriceps.png");
});

test("training cover importa la imagen y aplica un patch versionado", async () => {
  const calls = [];
  const ipcRenderer = {
    async invoke(channel, payload) {
      calls.push({ channel, payload });
      if (channel === "markdown:media:import") {
        return {
          ok: true,
          itemId: "cover-item",
          relativePath: "_attachments/quadriceps-cover.png",
          mediaKind: "image",
          mimeType: "image/png",
        };
      }
      if (channel === "items:source-load") {
        return { ok: true, data: { sourceHash: "source-hash" } };
      }
      if (channel === "views:item-edit") {
        return { ok: true, data: { sourceHash: "next-hash" } };
      }
      throw new Error(`Canal inesperado: ${channel}`);
    },
  };

  const result = await pasteTrainingCover({
    doc: {
      itemId: "muscle-note",
      relativePath: "Concepts/Fitness/Muscles/Cuadriceps.md",
      frontmatter: {},
    },
    muscleId: "quadriceps",
    ipcRenderer,
    captureImage: async () => ({ grantId: "clipboard-grant" }),
  });

  assert.equal(result.coverLink, "[[_attachments/quadriceps-cover.png]]");
  assert.deepEqual(calls.map((entry) => entry.channel), [
    "markdown:media:import",
    "items:source-load",
    "views:item-edit",
  ]);
  assert.equal(calls[0].payload.sourceGrant, "clipboard-grant");
  assert.deepEqual(calls[2].payload.property, TRAINING_COVER_PROPERTY_REF);
  assert.equal(calls[2].payload.expectedHash, "source-hash");
  assert.equal(calls[2].payload.operation.value, "[[_attachments/quadriceps-cover.png]]");
});

test("training cover resuelve la imagen del vault desde la metadata", async () => {
  const ipcRenderer = {
    async invoke(channel, payload) {
      assert.equal(channel, "items:get-by-relative-path");
      assert.equal(payload.relativePath, "_attachments/quadriceps-cover.png");
      return {
        id: "cover-item",
        extension: "png",
        path: "D:\\Vault\\content\\_attachments\\quadriceps-cover.png",
      };
    },
  };

  const url = await resolveTrainingCoverImageUrl(
    {
      itemId: "muscle-note",
      relativePath: "Concepts/Fitness/Muscles/Cuadriceps.md",
      frontmatter: { cover: "[[_attachments/quadriceps-cover.png]]" },
    },
    {
      ipcRenderer,
      pathToFileUrl: (filePath) => `file-url:${filePath}`,
    },
  );

  assert.equal(url, "file-url:D:\\Vault\\content\\_attachments\\quadriceps-cover.png");
});
