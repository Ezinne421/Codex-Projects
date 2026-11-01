import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const dir = mkdtempSync(join(tmpdir(), "pm-limits-"));
process.env.DATA_DIR = dir;
const { createDatabaseRateLimitStore } =
  await import("../server/rate-limit-store.js");
const { authDb } = await import("../server/db.js");
after(async () => {
  await authDb.close();
  rmSync(dir, { recursive: true, force: true });
});
test("limits are atomic and shared across independently created stores", async () => {
  const first = createDatabaseRateLimitStore("test", 3600000, true)!;
  const second = createDatabaseRateLimitStore("test", 3600000, true)!;
  const results = await Promise.all([
    first.increment("client"),
    second.increment("client"),
    first.increment("client"),
  ]);
  assert.deepEqual(results.map((r) => r.totalHits).sort(), [1, 2, 3]);
  await second.decrement("client");
  assert.equal((await first.increment("client")).totalHits, 3);
  await second.resetKey("client");
  assert.equal((await first.increment("client")).totalHits, 1);
  const keys = await authDb.prepare("SELECT id FROM request_limits").all();
  assert.ok(keys.length);
  assert.ok(keys.every((r) => !r.id.includes("client")));
});
