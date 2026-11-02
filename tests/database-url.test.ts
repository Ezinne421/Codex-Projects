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

test("Supabase connections trust the official CA while retaining certificate and hostname verification", async () => {
  const { verifiedDatabaseConfig } = await import("../server/database-url.js");
  const { supabaseCertificateAuthority } =
    await import("../server/supabase-ca.js");
  const { X509Certificate } = await import("node:crypto");
  const { checkServerIdentity } = await import("node:tls");
  const certificate = new X509Certificate(supabaseCertificateAuthority);
  assert.equal(
    certificate.fingerprint256,
    "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA",
  );
  const config = verifiedDatabaseConfig(
    "postgresql://test:example@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require",
  );
  const ssl = config.ssl as any;
  assert.equal(ssl.rejectUnauthorized, true);
  assert.equal(ssl.checkServerIdentity, checkServerIdentity);
  assert.ok(ssl.ca.includes(supabaseCertificateAuthority));
  assert.ok(ssl.ca.length > 1);
  const client = new Client(config);
  assert.ok((client.ssl as any).ca.includes(supabaseCertificateAuthority));
  const other = verifiedDatabaseConfig(
    "postgresql://test:example@unrelated.example.com/postgres",
  );
  assert.equal((other.ssl as any).ca, undefined);
});

test("missing or placeholder database passwords are identified without exposing credentials", async () => {
  const { verifiedDatabaseConfig } = await import("../server/database-url.js");
  for (const password of ["", "[YOUR-PASSWORD]"])
    assert.throws(
      () =>
        verifiedDatabaseConfig(
          `postgresql://test:${password}@db.example.com/postgres`,
        ),
      (e) =>
        ["DATABASE_PASSWORD_MISSING", "DATABASE_PASSWORD_PLACEHOLDER"].includes(
          (e as any).code,
        ),
    );
});
