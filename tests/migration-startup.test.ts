import test from "node:test";
import assert from "node:assert/strict";
import { migrate } from "../server/db";
test("an up-to-date server schema does not run DDL during a cold start", async () => {
  const queries: string[] = [];
  await migrate(
    {
      async query(sql: string) {
        queries.push(sql);
        if (/to_regclass/.test(sql))
          return { rows: [{ relation: "schema_migrations" }] };
        return { rows: [{ version: 1 }] };
      },
    },
    "pm_ai_africa_auth",
    "CREATE TABLE placeholder(id TEXT)",
  );
  assert.equal(queries.length, 2);
  assert.match(queries[1], /SELECT MAX/);
  assert.ok(!queries.some((q) => /BEGIN|ALTER|CREATE|REVOKE/.test(q)));
});
test("a migration waiter rechecks readiness inside the transaction before making changes", async () => {
  const queries: string[] = [];
  let checks = 0;
  await migrate(
    {
      async query(sql: string) {
        queries.push(sql);
        if (/to_regclass/.test(sql))
          return { rows: [{ relation: "schema_migrations" }] };
        if (/SELECT MAX/.test(sql))
          return { rows: [{ version: ++checks === 1 ? 0 : 1 }] };
        return { rows: [] };
      },
    },
    "pm_ai_africa_auth",
    "CREATE TABLE placeholder(id TEXT)",
  );
  assert.equal(checks, 2);
  assert.ok(queries.includes("BEGIN"));
  assert.ok(queries.includes("COMMIT"));
  assert.ok(!queries.some((q) => /CREATE TABLE|ALTER TABLE|REVOKE/.test(q)));
});
