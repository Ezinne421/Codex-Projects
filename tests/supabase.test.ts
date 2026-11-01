import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const pg = process.env.DB_TEST_PGLITE === "1";
const dir = mkdtempSync(join(tmpdir(), "pm-supabase-"));
process.env.DATA_DIR = dir;
const { authDb, requestDatabase } = await import("../server/db.js");
after(async () => {
  await authDb.close();
  rmSync(dir, { recursive: true, force: true });
});
test(
  "private account tables deny API-role access even if future API grants are added",
  { skip: !pg },
  async () => {
    const flags = await authDb
      .prepare(
        "SELECT relname,relrowsecurity FROM pg_class JOIN pg_namespace n ON n.oid=pg_class.relnamespace WHERE nspname='pm_ai_africa_auth' AND relname IN ('users','organisations','sessions','reset_tokens','request_limits')",
      )
      .all();
    assert.equal(flags.length, 5);
    assert.ok(flags.every((r) => r.relrowsecurity));
    await authDb.exec("CREATE ROLE pm_test_api NOLOGIN");
    await authDb.exec("GRANT USAGE ON SCHEMA pm_ai_africa_auth TO pm_test_api");
    await authDb.exec("GRANT SELECT ON users TO pm_test_api");
    await authDb
      .prepare("INSERT INTO organisations(id,name) VALUES(?,?)")
      .run("org-test", "Private org");
    await authDb
      .prepare(
        "INSERT INTO users(id,email,password_hash,name,org_id,country,currency,industry) VALUES(?,?,?,?,?,?,?,?)",
      )
      .run(
        "user-test",
        "private@example.com",
        "private-hash",
        "Owner",
        "org-test",
        "Nigeria",
        "NGN",
        "Agriculture",
      );
    const express = (await import("express")).default;
    const app = express();
    app.get("/probe", requestDatabase, async (_req, res) => {
      try {
        await authDb.exec("BEGIN");
        await authDb.exec("SET LOCAL ROLE pm_test_api");
        const rows = await authDb.prepare("SELECT id FROM users").all();
        await authDb.exec("ROLLBACK");
        res.json({ count: rows.length });
      } catch {
        await authDb.exec("ROLLBACK");
        res.status(500).end();
      }
    });
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((r) => server.once("listening", r));
    try {
      const res = await fetch(
        `http://127.0.0.1:${(server.address() as any).port}/probe`,
      );
      assert.equal(res.status, 200);
      assert.equal((await res.json()).count, 0);
      assert.equal(
        (await authDb.prepare("SELECT id FROM users").all()).length,
        1,
      );
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  },
);
