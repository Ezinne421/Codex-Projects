import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  tenantSchema,
  workspaceTenantSchema,
  sharedMigrationSchema,
} from "../server/schema";
import { tenantMigrations, migrateSqlite } from "../server/migrations";
test("additive migration preserves existing projects, tasks and documents and can be run repeatedly", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys=ON");
    db.exec(tenantSchema);
    db.prepare(
      "INSERT INTO projects(id,title,description,industry,location,currency,start_date,end_date) VALUES(?,?,?,?,?,?,?,?)",
    ).run(
      "legacy-project",
      "Original plan",
      "Keep this description",
      "Agriculture",
      "Enugu",
      "NGN",
      "2026-10-01",
      "2026-12-01",
    );
    db.prepare(
      "INSERT INTO tasks(id,project_id,title,owner,start_date,end_date,status,progress) VALUES(?,?,?,?,?,?,?,?)",
    ).run(
      "legacy-task",
      "legacy-project",
      "Fieldwork",
      "Original owner",
      "2026-10-03",
      "2026-10-08",
      "In progress",
      40,
    );
    db.prepare(
      "INSERT INTO documents(id,project_id,title,type,content,source) VALUES(?,?,?,?,?,?)",
    ).run(
      "legacy-document",
      "legacy-project",
      "Original charter",
      "Project charter",
      "Unchanged original content",
      "Manual draft",
    );
    db.exec(workspaceTenantSchema + sharedMigrationSchema);
    migrateSqlite(db, tenantMigrations);
    migrateSqlite(db, tenantMigrations);
    const task = db
      .prepare("SELECT * FROM tasks WHERE id=?")
      .get("legacy-task")!;
    assert.equal(task.progress, 40);
    assert.equal(task.owner, "Original owner");
    assert.equal(task.weight, 1);
    assert.equal(task.assignee_id, null);
    const document = db
      .prepare("SELECT * FROM documents WHERE id=?")
      .get("legacy-document")!;
    assert.equal(document.content, "Unchanged original content");
    assert.equal(document.revision, 1);
    assert.equal(document.approval_status, "draft");
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM schema_migrations").get()!.n,
      1,
    );
    assert.equal(
      db.prepare("SELECT title FROM projects").get()!.title,
      "Original plan",
    );
  } finally {
    db.close();
  }
});
