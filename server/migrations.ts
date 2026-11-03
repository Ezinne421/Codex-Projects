export const tenantMigrations = [
  {
    version: 1,
    sql: `
ALTER TABLE projects ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN working_week TEXT NOT NULL DEFAULT '1,2,3,4,5';
ALTER TABLE tasks ADD COLUMN assignee_id TEXT;
ALTER TABLE tasks ADD COLUMN milestone INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN weight REAL NOT NULL DEFAULT 1;
ALTER TABLE tasks ADD COLUMN effort_hours REAL NOT NULL DEFAULT 8;
ALTER TABLE tasks ADD COLUMN fixed_start INTEGER NOT NULL DEFAULT 0;
ALTER TABLE documents ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE documents ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN last_editor TEXT;
ALTER TABLE documents ADD COLUMN approved_by TEXT;
ALTER TABLE documents ADD COLUMN approved_at TEXT;
ALTER TABLE audit_logs ADD COLUMN project_id TEXT;
ALTER TABLE audit_logs ADD COLUMN actor_name TEXT NOT NULL DEFAULT '';
ALTER TABLE audit_logs ADD COLUMN details TEXT NOT NULL DEFAULT '{}';
`,
  },
];
export const authMigrations: { version: number; sql: string }[] = [
  { version: 1, sql: "" },
];
export function migrateSqlite(db: any, migrations: typeof tenantMigrations) {
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const migration of migrations) {
      if (
        db
          .prepare("SELECT version FROM schema_migrations WHERE version=?")
          .get(migration.version)
      )
        continue;
      if (migration.sql.trim()) db.exec(migration.sql);
      db.prepare("INSERT INTO schema_migrations(version) VALUES(?)").run(
        migration.version,
      );
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
