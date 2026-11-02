import { test } from "node:test";
import assert from "node:assert/strict";
import { createRetryableInitializer } from "../server/database-initialization.js";
test("a failed first connection recovers on a later request instead of poisoning the running service", async () => {
  let now = 0,
    attempts = 0;
  const ready = createRetryableInitializer(
    async () => {
      attempts++;
      if (attempts === 1) throw Error("temporary connection timeout");
    },
    5000,
    () => now,
  );
  assert.equal(
    attempts,
    0,
    "does not open database connections during module import",
  );
  const first = ready();
  assert.equal(ready(), first, "concurrent requests share initialization");
  await assert.rejects(first);
  now = 4999;
  await assert.rejects(ready());
  assert.equal(attempts, 1, "cooldown prevents a retry storm");
  now = 5000;
  const retry = ready();
  assert.equal(ready(), retry);
  await retry;
  assert.equal(attempts, 2);
  now = 999999;
  await ready();
  assert.equal(attempts, 2, "successful initialization is reused");
});
