import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.resolve(backendRoot, "booru");
const duplicateIngest = await import(pathToFileURL(path.join(pluginRoot, "src", "domain", "duplicate-ingest.js")));

test("el gate por hash serializa ingresos concurrentes del mismo contenido", async () => {
  const execute = duplicateIngest.createBooruKeyedSerialExecutor();
  const order = [];
  let active = 0;
  let maximumActive = 0;

  const task = (id) => execute("same-hash", async () => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    order.push(`start-${id}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
    order.push(`end-${id}`);
    active -= 1;
    return id;
  });

  assert.deepEqual(await Promise.all([task(1), task(2), task(3)]), [1, 2, 3]);
  assert.equal(maximumActive, 1);
  assert.deepEqual(order, ["start-1", "end-1", "start-2", "end-2", "start-3", "end-3"]);
});

test("el resultado de reintegracion identifica solo la card canonica actualizada", () => {
  assert.deepEqual(duplicateIngest.createBooruIngestMutation({
    resource: { id: "canonical-1", importedAt: "2026-07-21T12:00:00.000Z" },
    reusedCanonical: true,
  }), {
    reason: "duplicate-reintegrated",
    resource: { id: "canonical-1", importedAt: "2026-07-21T12:00:00.000Z" },
    createdResourceId: null,
    reusedCanonical: true,
    updatedResourceIds: ["canonical-1"],
    createdResourceIds: [],
  });
});
