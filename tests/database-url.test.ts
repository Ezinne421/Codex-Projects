import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { verifiedDatabaseUrl } from "../server/database-url.js";
test("database URLs require encrypted certificate-verified connections, including Supabase URIs without SSL parameters", () => {
  for (const params of [
    "",
    "?sslmode=disable",
    "?sslmode=no-verify",
    "?sslmode=require&uselibpqcompat=true",
  ]) {
    const url = verifiedDatabaseUrl(
      "postgresql://test:example@db.example.com:6543/postgres" + params,
    );
    const client = new Client({ connectionString: url });
    assert.notEqual(client.ssl, false);
    assert.notEqual((client.ssl as any).rejectUnauthorized, false);
    assert.equal((client.ssl as any).checkServerIdentity, undefined);
  }
  assert.throws(() => verifiedDatabaseUrl("https://example.com"));
  const configured = new URL(
    verifiedDatabaseUrl(
      "postgresql://test:example@db.example.com/postgres?sslrootcert=%2Ftrusted%2Fprovider.crt",
    ),
  );
  assert.equal(
    configured.searchParams.get("sslrootcert"),
    "/trusted/provider.crt",
  );
});
