import { test as base, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
// Browser journeys share a localhost IP. Reset only their local quota counters
// between independent tests; production rate limits remain fully enabled.
export const test = base.extend<{ localQuota: void }>({
  localQuota: [
    async ({}, use) => {
      const db = new DatabaseSync("/tmp/pm-browser-test/auth.sqlite");
      try {
        db.exec("PRAGMA busy_timeout=5000; DELETE FROM request_limits");
      } finally {
        db.close();
      }
      await use();
    },
    { auto: true },
  ],
});
export { expect };
export type { Page } from "@playwright/test";
