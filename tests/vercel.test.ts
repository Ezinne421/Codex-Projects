import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
test("Vercel refuses ephemeral SQLite instead of silently losing account data", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "await import('./api/index.ts')",
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        VERCEL: "1",
        NODE_ENV: "production",
        DATABASE_URL: "",
        DB_TEST_PGLITE: "",
      },
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Vercel requires DATABASE_URL/);
});
