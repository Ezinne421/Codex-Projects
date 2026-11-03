import { createHash } from "node:crypto";
import type { Store } from "express-rate-limit";
import { authDb } from "./db.js";
/** Shared counters survive Vercel cold starts and separate function instances. */
export function createDatabaseRateLimitStore(
  prefix: string,
  windowMs: number,
  enabled = process.env.NODE_ENV === "test" ||
    !!process.env.DATABASE_URL ||
    process.env.DB_TEST_PGLITE === "1",
): Store | undefined {
  if (!enabled) return undefined;
  const bucket = () => Math.floor(Date.now() / windowMs);
  const key = (ip: string) =>
    `${prefix}:${bucket()}:${createHash("sha256").update(ip).digest("hex")}`;
  return {
    localKeys: false,
    prefix,
    async increment(ip: string) {
      const reset = (bucket() + 1) * windowMs;
      await authDb
        .prepare("DELETE FROM request_limits WHERE reset_time < ?")
        .run(Date.now());
      const row = await authDb
        .prepare(
          "INSERT INTO request_limits(id,hits,reset_time) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET hits=request_limits.hits+1 RETURNING hits,reset_time",
        )
        .get(key(ip), reset);
      return {
        totalHits: Number(row.hits),
        resetTime: new Date(Number(row.reset_time)),
      };
    },
    async decrement(ip: string) {
      await authDb
        .prepare(
          "UPDATE request_limits SET hits=CASE WHEN hits>0 THEN hits-1 ELSE 0 END WHERE id=?",
        )
        .run(key(ip));
    },
    async resetKey(ip: string) {
      await authDb
        .prepare("DELETE FROM request_limits WHERE id=?")
        .run(key(ip));
    },
  };
}
