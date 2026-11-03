import {
  tenantMigrations as versionedTenantMigrations,
  authMigrations,
  migrateSqlite,
} from "./migrations.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { mkdirSync, chmodSync } from "node:fs";
import { resolve, join } from "node:path";
import type { Request, Response, NextFunction } from "express";
import {
  authSchema,
  tenantSchema,
  workspaceAuthSchema,
  workspaceTenantSchema,
  sharedMigrationSchema,
} from "./schema.js";
import { createRetryableInitializer } from "./database-initialization.js";
import { databaseErrorTag } from "./database-error.js";
import { verifiedDatabaseConfig } from "./database-url.js";
export const dataDir = resolve(process.env.DATA_DIR || ".data");
const pgMode = !!process.env.DATABASE_URL || process.env.DB_TEST_PGLITE === "1";
const testPg = process.env.DB_TEST_PGLITE === "1";
if (testPg && process.env.NODE_ENV !== "test")
  throw new Error("The PostgreSQL test driver requires NODE_ENV=test");
if (process.env.VERCEL && !process.env.DATABASE_URL)
  throw new Error(
    "Vercel requires DATABASE_URL for persistent PostgreSQL storage. Local SQLite storage is not supported on Vercel.",
  );
export interface Database {
  prepare(sql: string): {
    get(...values: any[]): Promise<any | undefined>;
    all(...values: any[]): Promise<any[]>;
    run(...values: any[]): Promise<{ changes: number }>;
  };
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}
type Connection = {
  query: (
    sql: string,
    values?: any[],
  ) => Promise<{ rows: any[]; rowCount?: number | null }>;
  release: () => Promise<void>;
};
type Scope = {
  connection: Connection;
  ended: boolean;
  pending: number;
  releaseRequested: boolean;
  releaseStarted: boolean;
};
const scopes = new AsyncLocalStorage<Scope>();
const authNamespace = "pm_ai_africa_auth";
const authTables = [
  "organisations",
  "users",
  "sessions",
  "reset_tokens",
  "request_limits",
  "memberships",
  "invitations",
  "session_workspaces",
  "learning_progress",
  "recovery_codes",
  "schema_migrations",
];
const tenantTables = [
  "projects",
  "tasks",
  "budget_items",
  "expenses",
  "risks",
  "updates",
  "documents",
  "ai_history",
  "audit_logs",
  "project_members",
  "task_dependencies",
  "project_baselines",
  "document_versions",
  "comments",
  "notifications",
  "schema_migrations",
];
let sqliteRoot: any, pool: any, pglite: any, DatabaseSync: any;
let queue = Promise.resolve();
const tenantMigrations = new Set<string>();
async function serialLease() {
  let unlock!: () => void;
  const before = queue;
  queue = new Promise<void>((r) => (unlock = r));
  await before;
  return unlock;
}
let initializationStage = "configuration";
let databaseShape: Record<string, boolean | number> = {};
async function initializeDatabase() {
  initializationStage = "configuration";
  try {
    if (testPg) {
      const { PGlite } = await import("@electric-sql/pglite");
      pglite = new PGlite();
      await pglite.waitReady;
      await migrate(
        { query: (s, v) => pglite.query(s, v) },
        authNamespace,
        authSchema + workspaceAuthSchema + sharedMigrationSchema,
      );
    } else if (pgMode) {
      const { Pool, types } = await import("pg");
      types.setTypeParser(20, (v) => {
        const n = Number(v);
        if (!Number.isSafeInteger(n))
          throw Error("Database integer outside supported range");
        return n;
      });
      const connectionConfig = verifiedDatabaseConfig(
        process.env.DATABASE_URL!,
      );
      databaseShape = {
        supabasePooler: /\.pooler\.supabase\.com$/i.test(
          connectionConfig.host || "",
        ),
        port: connectionConfig.port || 5432,
        qualifiedUsername: !!connectionConfig.user?.includes("."),
        passwordConfigured: !!connectionConfig.password,
      };
      pool = new Pool({
        ...connectionConfig,
        max: 5,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 20000,
      });
      pool.on("error", () => console.error("PostgreSQL connection error"));
      initializationStage = "connect";
      const conn = await pool.connect();
      try {
        initializationStage = "schema";
        await migrate(
          conn,
          authNamespace,
          authSchema + workspaceAuthSchema + sharedMigrationSchema,
        );
      } finally {
        conn.release();
      }
    } else {
      ({ DatabaseSync } = await import("node:sqlite"));
      mkdirSync(dataDir, { recursive: true, mode: 0o700 });
      chmodSync(dataDir, 0o700);
      sqliteRoot = openSqlite(join(dataDir, "auth.sqlite"));
      sqliteRoot.exec(authSchema + workspaceAuthSchema + sharedMigrationSchema);
      migrateSqlite(sqliteRoot, authMigrations);
    }
    initializationStage = "ready";
  } catch (error) {
    console.error(
      "Database initialization failed",
      initializationStage,
      databaseErrorTag(error),
    );
    const failedPool = pool;
    pool = undefined;
    try {
      await failedPool?.end();
    } catch {}
    if (!pgMode) {
      try {
        sqliteRoot?.close();
      } catch {}
      sqliteRoot = undefined;
    }
    if (testPg) {
      try {
        await pglite?.close();
      } catch {}
      pglite = undefined;
    }
    throw error;
  }
}
const ensureDatabaseReady = createRetryableInitializer(initializeDatabase);

function openSqlite(path: string) {
  const db = new DatabaseSync(path);
  db.exec(
    "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;",
  );
  return db;
}
function pgSql(sql: string, schema: string) {
  let index = 0;
  // Transform identifiers and placeholders only outside SQL string literals.
  return sql
    .split(/('(?:''|[^'])*')/g)
    .map((part, i) => {
      if (i % 2) return part;
      let result = part
        .replace(/\?/g, () => "$" + ++index)
        .replace(/\b(rateMinor|amountMinor)\b/g, '"$1"')
        .replace(/\bREAL\b/g, "DOUBLE PRECISION")
        .replace(
          /\b(expires_at|reset_time|rateMinor|amountMinor)("?) INTEGER\b/g,
          "$1$2 BIGINT",
        )
        .replace(
          /audit_logs\(id INTEGER PRIMARY KEY/g,
          "audit_logs(id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY",
        );
      for (const table of schema === authNamespace ? authTables : tenantTables)
        result = result.replace(
          new RegExp("\\b" + table + "\\b", "g"),
          `"${schema}"."${table}"`,
        );
      return result;
    })
    .join("");
}

export async function migrate(
  conn: { query: (s: string, v?: any[]) => Promise<any> },
  schema: string,
  ddl: string,
) {
  const migrations =
    schema === authNamespace ? authMigrations : versionedTenantMigrations;
  const expected = Math.max(0, ...migrations.map((m) => m.version));
  const current = async () => {
    try {
      const exists = await conn.query("SELECT to_regclass($1) AS relation", [
        `"${schema}"."schema_migrations"`,
      ]);
      if (!exists.rows[0]?.relation) return false;
      const found = await conn.query(
        pgSql("SELECT MAX(version) AS version FROM schema_migrations", schema),
      );
      return Number(found.rows[0]?.version || 0) >= expected;
    } catch (e) {
      if (["42P01", "3F000"].includes((e as any).code)) return false;
      throw e;
    }
  };
  // A current schema is read-only at startup. Re-running DDL here can deadlock
  // with normal requests on another serverless instance.
  if (await current()) return;
  await conn.query("BEGIN");
  try {
    if (!testPg)
      await conn.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        "projectmanager:" + schema,
      ]);
    // Another instance may have completed the migration while we waited.
    if (await current()) {
      await conn.query("COMMIT");
      return;
    }
    if (schema !== "public")
      await conn.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    for (const statement of ddl
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean))
      await conn.query(pgSql(statement, schema));
    for (const migration of migrations) {
      const found = await conn.query(
        pgSql("SELECT version FROM schema_migrations WHERE version=?", schema),
        [migration.version],
      );
      if (found.rows.length) continue;
      for (const statement of migration.sql
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean))
        await conn.query(pgSql(statement, schema));
      await conn.query(
        pgSql("INSERT INTO schema_migrations(version) VALUES(?)", schema),
        [migration.version],
      );
    }
    // Keep application schemas private, including on Supabase installations
    // whose public data API grants privileges to anon/authenticated roles.
    const apiRoles = await conn.query(
      "SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated')",
    );
    await conn.query(`REVOKE ALL ON SCHEMA "${schema}" FROM PUBLIC`);
    for (const role of apiRoles.rows)
      await conn.query(
        `REVOKE ALL ON SCHEMA "${schema}" FROM "${role.rolname}"`,
      );
    for (const table of schema === authNamespace ? authTables : tenantTables) {
      await conn.query(
        `ALTER TABLE "${schema}"."${table}" ENABLE ROW LEVEL SECURITY`,
      );
      await conn.query(
        `REVOKE ALL ON TABLE "${schema}"."${table}" FROM PUBLIC`,
      );
      for (const role of apiRoles.rows)
        await conn.query(
          `REVOKE ALL ON TABLE "${schema}"."${table}" FROM "${role.rolname}"`,
        );
    }
    await conn.query("COMMIT");
  } catch (e) {
    await conn.query("ROLLBACK");
    throw e;
  }
}
async function lease(): Promise<Connection> {
  await ensureDatabaseReady();
  if (testPg) {
    const unlock = await serialLease();
    return {
      query: (s, v) => pglite.query(s, v),
      release: async () => {
        try {
          await pglite.query("ROLLBACK");
        } finally {
          unlock();
        }
      },
    };
  }
  if (pgMode) {
    const client = await pool.connect();
    return {
      query: (s, v) => client.query(s, v),
      release: async () => {
        try {
          await client.query("ROLLBACK");
          client.release();
        } catch {
          client.release(true);
        }
      },
    };
  }
  const unlock = await serialLease();
  return {
    query: async () => ({ rows: [] }),
    release: async () => {
      try {
        if (sqliteRoot.isTransaction) sqliteRoot.exec("ROLLBACK");
      } finally {
        unlock();
      }
    },
  };
}
function maybeRelease(scope: Scope) {
  if (scope.releaseRequested && !scope.pending && !scope.releaseStarted) {
    scope.releaseStarted = true;
    void scope.connection
      .release()
      .catch(() => console.error("Database release failed"));
  }
}
async function scopedQuery(sql: string, values: any[] = []) {
  const scope = scopes.getStore();
  if (scope?.ended) throw Error("Request database scope has ended");
  if (scope) {
    scope.pending++;
    try {
      return await scope.connection.query(sql, values);
    } finally {
      scope.pending--;
      maybeRelease(scope);
    }
  }
  // Administration/tests outside HTTP requests use an explicit short connection lease.
  const conn = await lease();
  try {
    return await conn.query(sql, values);
  } finally {
    await conn.release();
  }
}
export async function requestDatabase(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const connection = await lease();
    if (res.destroyed) {
      await connection.release();
      return;
    }
    const scope: Scope = {
      connection,
      ended: false,
      pending: 0,
      releaseRequested: false,
      releaseStarted: false,
    };
    const finish = () => {
      scope.ended = true;
      scope.releaseRequested = true;
      maybeRelease(scope);
    };
    res.once("finish", finish);
    res.once("close", finish);
    scopes.run(scope, () => next());
  } catch (error) {
    console.error(
      "Persistent database unavailable",
      initializationStage,
      databaseErrorTag(error),
      {
        ...databaseShape,
        clients: pool?.totalCount || 0,
        idle: pool?.idleCount || 0,
        waiting: pool?.waitingCount || 0,
      },
    );
    res.status(503).json({
      error:
        "The database is temporarily unavailable. Please try again shortly.",
    });
  }
}
function adapter(schema: string, sqlite?: any, isRoot = false): Database {
  async function query(
    sql: string,
    values: any[],
    kind: "get" | "all" | "run",
  ) {
    await ensureDatabaseReady();
    if (scopes.getStore()?.ended)
      throw Error("Request database scope has ended");
    if (!pgMode) {
      const handle = isRoot ? sqliteRoot : sqlite;
      return handle.prepare(sql)[kind](...values);
    }
    const result = await scopedQuery(pgSql(sql, schema), values);
    return kind === "all"
      ? result.rows
      : kind === "get"
        ? result.rows[0]
        : { changes: result.rowCount ?? 0 };
  }
  return {
    prepare: (sql) => ({
      get: (...v) => query(sql, v, "get"),
      all: (...v) => query(sql, v, "all"),
      run: (...v) => query(sql, v, "run"),
    }),
    exec: async (sql) => {
      await ensureDatabaseReady();
      if (!pgMode) {
        (isRoot ? sqliteRoot : sqlite).exec(sql);
        return;
      }
      await scopedQuery(pgSql(sql, schema));
    },
    close: async () => {
      if (!pgMode) {
        if (isRoot) sqliteRoot?.close();
        else sqlite.close();
      } else if (isRoot) {
        if (testPg) await pglite?.close();
        else await pool?.end();
      }
    },
  };
}
export const authDb = adapter(authNamespace, undefined, true);
export async function tenantDb(orgId: string): Promise<Database> {
  if (!/^[0-9a-f-]{36}$/.test(orgId)) throw Error("Invalid organisation");
  if (
    !(await authDb
      .prepare("SELECT id FROM organisations WHERE id=?")
      .get(orgId))
  )
    throw Error("Unknown organisation");
  if (!pgMode) {
    const db = openSqlite(join(dataDir, `org-${orgId}.sqlite`));
    db.exec(tenantSchema + workspaceTenantSchema + sharedMigrationSchema);
    migrateSqlite(db, versionedTenantMigrations);
    return adapter("", db);
  }
  const schema = "pm_org_" + orgId.replaceAll("-", "_");
  if (!tenantMigrations.has(schema)) {
    const scope = scopes.getStore();
    if (!scope || scope.ended)
      throw Error("Tenant access requires an active authenticated request");
    scope.pending++;
    try {
      await migrate(
        scope.connection,
        schema,
        tenantSchema + workspaceTenantSchema + sharedMigrationSchema,
      );
      tenantMigrations.add(schema);
    } finally {
      scope.pending--;
      maybeRelease(scope);
    }
  }
  return adapter(schema);
}
