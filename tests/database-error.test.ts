import { test } from "node:test";
import assert from "node:assert/strict";
import { databaseErrorTag } from "../server/database-error.js";
test("database diagnostics classify failures without including raw credential-bearing messages", () => {
  const secret = "never-print-this";
  const cases: [unknown, string][] = [
    [
      { message: `Connection terminated due to connection timeout ${secret}` },
      "DATABASE_CONNECTION_TIMEOUT",
    ],
    [
      {
        message: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string ${secret}`,
      },
      "DATABASE_PASSWORD_MISSING",
    ],
    [
      { message: `Tenant or user not found ${secret}` },
      "DATABASE_USER_OR_TENANT_NOT_FOUND",
    ],
    [
      { message: `SASL authentication failed ${secret}` },
      "DATABASE_AUTHENTICATION_FAILED",
    ],
    [{ message: `unrecognised error ${secret}`, code: "28P01" }, "28P01"],
  ];
  for (const [error, tag] of cases) {
    assert.equal(databaseErrorTag(error), tag);
    assert.ok(!databaseErrorTag(error).includes(secret));
  }
});
