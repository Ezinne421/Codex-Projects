import { randomUUID, randomBytes, createHash } from "node:crypto";
import type { Express, Request, RequestHandler } from "express";
import { z } from "zod";
import { authDb, type Database } from "./db.js";
import {
  readLearningProgress,
  recordPractice,
  localStudyDay,
  validStudyDay,
} from "../shared/knowledge/practice.js";
import { learningLessons } from "../shared/knowledge/learning.js";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status });
}
const admin = (req: Request) => ["owner", "admin"].includes(req.user.role);
export async function sessionUser(token: string) {
  const user = await authDb
    .prepare(
      "SELECT u.id,u.email,u.name,u.org_id,u.country,u.currency,u.industry FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?",
    )
    .get(digest(token), Date.now());
  if (!user) return;
  // Backfill the original owner membership without changing existing records or ownership.
  await authDb
    .prepare(
      "INSERT INTO memberships(org_id,user_id,role) SELECT ?,?,'owner' WHERE NOT EXISTS(SELECT 1 FROM memberships WHERE org_id=? AND user_id=?) ON CONFLICT(org_id,user_id) DO NOTHING",
    )
    .run(user.org_id, user.id, user.org_id, user.id);
  const selected = await authDb
    .prepare(
      "SELECT m.org_id,m.role FROM session_workspaces w JOIN memberships m ON m.org_id=w.org_id WHERE w.token_hash=? AND m.user_id=?",
    )
    .get(digest(token), user.id);
  const membership =
    selected ||
    (await authDb
      .prepare(
        "SELECT org_id,role FROM memberships WHERE org_id=? AND user_id=?",
      )
      .get(user.org_id, user.id));
  return { ...user, ...membership };
}
export async function permission(req: Request, id: string) {
  const p = await req.db.prepare("SELECT * FROM projects WHERE id=?").get(id);
  if (!p) fail(404, "Project not found");
  let role = admin(req)
    ? "manager"
    : (
        await req.db
          .prepare(
            "SELECT role FROM project_members WHERE project_id=? AND user_id=?",
          )
          .get(id, req.user.id)
      )?.role;
  if (!role) fail(404, "Project not found");
  if (req.user.role === "viewer") role = "viewer";
  return {
    project: p,
    role,
    canEdit: role !== "viewer",
    canManage: role === "manager",
  };
}
export async function accessibleProject(
  req: Request,
  id: string,
  level: "view" | "edit" | "manage" = req.method === "GET" ? "view" : "edit",
) {
  const access = await permission(req, id);
  if (
    (level === "edit" && !access.canEdit) ||
    (level === "manage" && !access.canManage)
  )
    fail(403, "Your project role does not permit this action.");
  return access.project;
}
export async function member(req: Request, userId: string) {
  const m = await authDb
    .prepare(
      "SELECT user_id,role FROM memberships WHERE org_id=? AND user_id=?",
    )
    .get(req.user.org_id, userId);
  if (!m) fail(400, "Choose a current workspace member.");
  return m;
}
export async function projectAssignee(
  req: Request,
  projectId: string,
  userId: string,
) {
  const m = await member(req, userId);
  const p = await req.db
    .prepare(
      "SELECT role FROM project_members WHERE project_id=? AND user_id=?",
    )
    .get(projectId, userId);
  if (!["owner", "admin"].includes(m.role) && !p)
    fail(400, "Give this member project access before assigning work.");
}
export async function logActivity(
  req: Request,
  action: string,
  id: string,
  projectId?: string,
  details: unknown = {},
) {
  await req.db
    .prepare(
      "INSERT INTO audit_logs(actor,action,record_id,project_id,actor_name,details) VALUES(?,?,?,?,?,?)",
    )
    .run(
      req.user.id,
      action,
      id,
      projectId || String(req.params.id || id),
      req.user.name,
      JSON.stringify(details),
    );
}
export async function notifyMember(
  req: Request,
  userId: string,
  projectId: string,
  title: string,
  kind: string,
  id = randomUUID(),
) {
  if (userId === req.user.id) return;
  await req.db
    .prepare(
      "INSERT INTO notifications(id,user_id,project_id,title,kind) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
    )
    .run(id, userId, projectId, title, kind);
}
export async function documentSnapshot(req: Request, id: string) {
  const d = await req.db.prepare("SELECT * FROM documents WHERE id=?").get(id);
  if (!d) return;
  await req.db
    .prepare(
      "INSERT INTO document_versions(id,document_id,revision,title,type,content,source,actor,approval_status,approved_by,approved_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(document_id,revision) DO NOTHING",
    )
    .run(
      randomUUID(),
      id,
      d.revision,
      d.title,
      d.type,
      d.content,
      d.source,
      d.last_editor || "legacy",
      d.approval_status,
      d.approved_by,
      d.approved_at,
    );
}
export async function saveDocument(
  req: Request,
  id: string,
  projectId: string,
  data: Record<string, any>,
  old: any,
) {
  const expected = req.body.expected_revision;
  if (old && expected !== undefined && expected !== old.revision)
    fail(
      409,
      "This document changed. Reload the latest version before editing.",
    );
  await req.db.exec("BEGIN");
  try {
    await req.db
      .prepare("UPDATE projects SET revision=revision+1 WHERE id=?")
      .run(projectId);
    if (old) {
      await documentSnapshot(req, id);
      const result = await req.db
        .prepare(
          "UPDATE documents SET title=?,type=?,content=?,revision=revision+1,approval_status='draft',last_editor=?,approved_by=NULL,approved_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=? AND project_id=? AND revision=?",
        )
        .run(
          data.title,
          data.type,
          data.content,
          req.user.id,
          id,
          projectId,
          old.revision,
        );
      if (result.changes !== 1)
        fail(409, "This document changed. Reload before editing.");
    } else
      await req.db
        .prepare(
          "INSERT INTO documents(id,project_id,title,type,content,source,last_editor) VALUES(?,?,?,?,?,?,?)",
        )
        .run(
          id,
          projectId,
          data.title,
          data.type,
          data.content,
          "Manual draft",
          req.user.id,
        );
    await documentSnapshot(req, id);
    await logActivity(
      req,
      old ? "documents.revised" : "documents.created",
      id,
      projectId,
      { revision: old ? old.revision + 1 : 1 },
    );
    await req.db.exec("COMMIT");
  } catch (e) {
    await req.db.exec("ROLLBACK");
    throw e;
  }
}
export function registerWorkspaceRoutes(
  app: Express,
  requireAuth: RequestHandler,
  tenant: RequestHandler,
  applicationUrl: string,
) {
  app.get("/api/workspaces", requireAuth, async (req, res) => {
    res.json(
      await authDb
        .prepare(
          "SELECT o.id,o.name,m.role FROM memberships m JOIN organisations o ON o.id=m.org_id WHERE m.user_id=? ORDER BY o.name",
        )
        .all(req.user.id),
    );
  });
  app.post("/api/workspaces/switch", requireAuth, async (req, res) => {
    const { org_id } = z.object({ org_id: z.string().uuid() }).parse(req.body);
    if (
      !(await authDb
        .prepare("SELECT role FROM memberships WHERE org_id=? AND user_id=?")
        .get(org_id, req.user.id))
    )
      fail(403, "You are not a member of this workspace.");
    await authDb
      .prepare(
        "INSERT INTO session_workspaces(token_hash,org_id) VALUES(?,?) ON CONFLICT(token_hash) DO UPDATE SET org_id=excluded.org_id",
      )
      .run(digest(req.cookies.pm_session), org_id);
    res.json({ ok: true });
  });
  app.get("/api/workspace/members", requireAuth, async (req, res) => {
    res.json(
      await authDb
        .prepare(
          "SELECT u.id,u.name,u.email,m.role,m.weekly_capacity FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.org_id=? ORDER BY u.name",
        )
        .all(req.user.org_id),
    );
  });
  app.put("/api/workspace/members/:userId", requireAuth, async (req, res) => {
    if (!admin(req))
      fail(403, "Workspace administration requires an owner or admin.");
    const p = z
      .object({
        role: z.enum(["owner", "admin", "member", "viewer"]),
        weekly_capacity: z.number().min(0).max(168),
      })
      .parse(req.body);
    const target = await member(req, String(req.params.userId));
    if (
      target.role === "owner" &&
      (p.role !== "owner" || req.user.id !== target.user_id)
    )
      fail(
        403,
        "Only the owner can change their own capacity; ownership cannot be downgraded here.",
      );
    if (target.role !== "owner" && p.role === "owner")
      fail(403, "Ownership cannot be transferred here.");
    await authDb
      .prepare(
        "UPDATE memberships SET role=?,weekly_capacity=? WHERE org_id=? AND user_id=?",
      )
      .run(p.role, p.weekly_capacity, req.user.org_id, target.user_id);
    res.json({ ok: true });
  });
  app.delete(
    "/api/workspace/members/:userId",
    requireAuth,
    tenant,
    async (req, res) => {
      if (!admin(req))
        fail(403, "Workspace administration requires an owner or admin.");
      const target = await member(req, String(req.params.userId));
      if (target.role === "owner")
        fail(403, "The workspace owner cannot be removed.");
      await authDb
        .prepare("DELETE FROM memberships WHERE org_id=? AND user_id=?")
        .run(req.user.org_id, target.user_id);
      await req.db
        .prepare("DELETE FROM project_members WHERE user_id=?")
        .run(target.user_id);
      await req.db
        .prepare("UPDATE tasks SET assignee_id=NULL WHERE assignee_id=?")
        .run(target.user_id);
      await req.db
        .prepare("DELETE FROM notifications WHERE user_id=?")
        .run(target.user_id);
      res.json({ ok: true });
    },
  );
  app.get("/api/workspace/invitations", requireAuth, async (req, res) => {
    if (!admin(req))
      fail(403, "Workspace administration requires an owner or admin.");
    res.json(
      await authDb
        .prepare(
          "SELECT id,email,role,status,expires_at,created_at FROM invitations WHERE org_id=? ORDER BY created_at DESC",
        )
        .all(req.user.org_id),
    );
  });
  app.post("/api/workspace/invitations", requireAuth, async (req, res) => {
    if (!admin(req))
      fail(403, "Only workspace owners and admins can invite members.");
    const p = z
      .object({
        email: z
          .email()
          .max(254)
          .transform((s) => s.toLowerCase()),
        role: z.enum(["admin", "member", "viewer"]),
      })
      .parse(req.body);
    const token = randomBytes(32).toString("hex"),
      id = randomUUID();
    await authDb
      .prepare(
        "INSERT INTO invitations(id,org_id,email,role,token_hash,created_by,expires_at) VALUES(?,?,?,?,?,?,?)",
      )
      .run(
        id,
        req.user.org_id,
        p.email,
        p.role,
        digest(token),
        req.user.id,
        Date.now() + 7 * 86400000,
      );
    res.status(201).json({
      id,
      url: new URL("/#invite=" + token, applicationUrl).toString(),
      expiresInDays: 7,
    });
  });
  app.delete(
    "/api/workspace/invitations/:id",
    requireAuth,
    async (req, res) => {
      if (!admin(req))
        fail(403, "Workspace administration requires an owner or admin.");
      await authDb
        .prepare(
          "UPDATE invitations SET status='revoked' WHERE id=? AND org_id=? AND status='pending'",
        )
        .run(String(req.params.id), req.user.org_id);
      res.json({ ok: true });
    },
  );
  app.post(
    "/api/workspace/accept-invitation",
    requireAuth,
    async (req, res) => {
      const { token } = z
        .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
        .parse(req.body);
      await authDb.exec("BEGIN");
      try {
        const invite = await authDb
          .prepare(
            "SELECT * FROM invitations WHERE token_hash=? AND status='pending' AND expires_at>?",
          )
          .get(digest(token), Date.now());
        if (!invite)
          fail(400, "This invitation is invalid, expired or already used.");
        if (invite.email !== req.user.email)
          fail(403, "Sign in with the email address named in this invitation.");
        const changed = await authDb
          .prepare(
            "UPDATE invitations SET status='accepted' WHERE id=? AND status='pending'",
          )
          .run(invite.id);
        if (changed.changes !== 1)
          fail(409, "This invitation has already been used.");
        await authDb
          .prepare(
            "INSERT INTO memberships(org_id,user_id,role) VALUES(?,?,?) ON CONFLICT(org_id,user_id) DO NOTHING",
          )
          .run(invite.org_id, req.user.id, invite.role);
        await authDb
          .prepare(
            "INSERT INTO session_workspaces(token_hash,org_id) VALUES(?,?) ON CONFLICT(token_hash) DO UPDATE SET org_id=excluded.org_id",
          )
          .run(digest(req.cookies.pm_session), invite.org_id);
        await authDb.exec("COMMIT");
        res.json({ ok: true });
      } catch (e) {
        await authDb.exec("ROLLBACK");
        throw e;
      }
    },
  );
  app.get("/api/learning", requireAuth, async (req, res) => {
    const row = await authDb
      .prepare("SELECT state,version FROM learning_progress WHERE user_id=?")
      .get(req.user.id);
    res.json({
      progress: readLearningProgress(row?.state || null),
      version: row?.version || 0,
      userId: req.user.id,
    });
  });
  app.put("/api/learning/:lessonId", requireAuth, async (req, res) => {
    const p = z
      .object({
        correct: z.number().int().min(0).max(10),
        total: z.number().int().min(1).max(10),
        day: z.string(),
        version: z.number().int().min(0),
        expected_user_id: z.string().uuid().optional(),
      })
      .parse(req.body);
    if (p.expected_user_id && p.expected_user_id !== req.user.id)
      fail(409, "The signed-in account changed. Reload before syncing.");
    if (
      !validStudyDay(p.day) ||
      Date.parse(p.day) > Date.parse(localStudyDay()) + 86400000 ||
      p.day < "2000-01-01"
    )
      fail(400, "Use the current study date.");
    const id = String(req.params.lessonId);
    if (
      !learningLessons.some(
        (l) =>
          l.id === id && l.questions.length === p.total && p.correct <= p.total,
      )
    )
      fail(400, "Invalid lesson attempt.");
    const old = await authDb
      .prepare("SELECT state,version FROM learning_progress WHERE user_id=?")
      .get(req.user.id);
    if ((old?.version || 0) !== p.version)
      fail(
        409,
        "Learning progress changed on another device. Refresh and retry.",
      );
    const next = recordPractice(
      readLearningProgress(old?.state || null),
      id,
      p.correct,
      p.total,
      p.day,
    );
    const changed = old
      ? await authDb
          .prepare(
            "UPDATE learning_progress SET state=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND version=?",
          )
          .run(JSON.stringify(next), req.user.id, p.version)
      : await authDb
          .prepare(
            "INSERT INTO learning_progress(user_id,state) VALUES(?,?) ON CONFLICT(user_id) DO NOTHING",
          )
          .run(req.user.id, JSON.stringify(next));
    if (changed.changes !== 1)
      fail(409, "Learning progress changed. Refresh and retry.");
    res.json({ progress: next, version: p.version + 1, userId: req.user.id });
  });
  app.get("/api/notifications", requireAuth, tenant, async (req, res) => {
    const rows = await req.db
      .prepare(
        "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC,id LIMIT 100",
      )
      .all(req.user.id);
    const allowed = [];
    for (const row of rows) {
      try {
        await accessibleProject(req, row.project_id, "view");
        allowed.push(row);
      } catch {}
    }
    res.json(allowed);
  });
  app.put(
    "/api/notifications/:id/read",
    requireAuth,
    tenant,
    async (req, res) => {
      await req.db
        .prepare(
          "UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?",
        )
        .run(String(req.params.id), req.user.id);
      res.json({ ok: true });
    },
  );
  app.get("/api/projects/:id/people", requireAuth, tenant, async (req, res) => {
    await accessibleProject(req, String(req.params.id), "view");
    const members = await authDb
      .prepare(
        "SELECT u.id,u.name,u.email,m.role,m.weekly_capacity FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.org_id=?",
      )
      .all(req.user.org_id);
    const grants = await req.db
      .prepare("SELECT user_id,role FROM project_members WHERE project_id=?")
      .all(String(req.params.id));
    res.json(
      members.map((m) => ({
        ...m,
        projectRole: ["owner", "admin"].includes(m.role)
          ? "manager"
          : grants.find((g) => g.user_id === m.id)?.role || null,
      })),
    );
  });
  app.put(
    "/api/projects/:id/people/:userId",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id),
        userId = String(req.params.userId);
      await accessibleProject(req, id, "manage");
      await member(req, userId);
      const { role } = z
        .object({ role: z.enum(["manager", "editor", "viewer"]) })
        .parse(req.body);
      await req.db
        .prepare(
          "INSERT INTO project_members(project_id,user_id,role) VALUES(?,?,?) ON CONFLICT(project_id,user_id) DO UPDATE SET role=excluded.role",
        )
        .run(id, userId, role);
      await logActivity(req, "project.access.granted", userId, id, { role });
      res.json({ ok: true });
    },
  );
  app.delete(
    "/api/projects/:id/people/:userId",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "manage");
      const userId = String(req.params.userId);
      await req.db
        .prepare("DELETE FROM project_members WHERE project_id=? AND user_id=?")
        .run(id, userId);
      await logActivity(req, "project.access.removed", userId, id);
      res.json({ ok: true });
    },
  );
  app.get(
    "/api/projects/:id/activity",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "view");
      res.json(
        await req.db
          .prepare(
            "SELECT * FROM audit_logs WHERE project_id=? ORDER BY id DESC LIMIT 200",
          )
          .all(id),
      );
    },
  );
  app.get(
    "/api/projects/:id/comments",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "view");
      res.json(
        await req.db
          .prepare(
            "SELECT * FROM comments WHERE project_id=? ORDER BY created_at,id",
          )
          .all(id),
      );
    },
  );
  app.post(
    "/api/projects/:id/comments",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "edit");
      const p = z
        .object({
          content: z.string().trim().min(1).max(6000),
          entity_type: z
            .enum(["project", "task", "document"])
            .default("project"),
          entity_id: z.string().uuid().nullable().default(null),
          mention_ids: z.array(z.string().uuid()).max(30).default([]),
        })
        .parse(req.body);
      if (p.entity_type !== "project") {
        const table = p.entity_type === "task" ? "tasks" : "documents";
        if (
          !p.entity_id ||
          !(await req.db
            .prepare(`SELECT id FROM ${table} WHERE id=? AND project_id=?`)
            .get(p.entity_id, id))
        )
          fail(400, "The linked record is not in this project.");
      }
      for (const userId of new Set(p.mention_ids))
        await projectAssignee(req, id, userId);
      const key = randomUUID();
      await req.db
        .prepare(
          "INSERT INTO comments(id,project_id,entity_type,entity_id,author_id,author_name,content) VALUES(?,?,?,?,?,?,?)",
        )
        .run(
          key,
          id,
          p.entity_type,
          p.entity_id,
          req.user.id,
          req.user.name,
          p.content,
        );
      for (const userId of new Set(p.mention_ids))
        await notifyMember(
          req,
          userId,
          id,
          `${req.user.name} mentioned you in a project discussion`,
          "mention",
        );
      await logActivity(req, "comment.created", key, id, {
        entity_type: p.entity_type,
      });
      res.status(201).json({ id: key });
    },
  );
  app.get(
    "/api/projects/:id/documents/:docId/versions",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id),
        docId = String(req.params.docId);
      await accessibleProject(req, id, "view");
      if (
        !(await req.db
          .prepare("SELECT id FROM documents WHERE id=? AND project_id=?")
          .get(docId, id))
      )
        fail(404, "Document not found");
      await documentSnapshot(req, docId);
      res.json(
        await req.db
          .prepare(
            "SELECT * FROM document_versions WHERE document_id=? ORDER BY revision DESC",
          )
          .all(docId),
      );
    },
  );
  app.post(
    "/api/projects/:id/documents/:docId/review",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id),
        docId = String(req.params.docId);
      const p = z
        .object({
          action: z.enum(["submit", "approve", "request_changes"]),
          revision: z.number().int().positive(),
          comment: z.string().trim().max(2000).default(""),
        })
        .parse(req.body);
      await accessibleProject(
        req,
        id,
        p.action === "submit" ? "edit" : "manage",
      );
      const d = await req.db
        .prepare("SELECT * FROM documents WHERE id=? AND project_id=?")
        .get(docId, id);
      if (!d) fail(404, "Document not found");
      if (d.revision !== p.revision)
        fail(409, "Review the latest document version.");
      if (
        (p.action === "submit" &&
          !["draft", "changes_requested"].includes(d.approval_status)) ||
        (p.action !== "submit" && d.approval_status !== "in_review")
      )
        fail(409, "The requested review transition is not available.");
      if (p.action === "request_changes" && !p.comment)
        fail(400, "Explain which changes are needed.");
      const status =
        p.action === "submit"
          ? "in_review"
          : p.action === "approve"
            ? "approved"
            : "changes_requested";
      await req.db.exec("BEGIN");
      try {
        await documentSnapshot(req, docId);
        const changed = await req.db
          .prepare(
            "UPDATE documents SET approval_status=?,approved_by=?,approved_at=? WHERE id=? AND revision=? AND approval_status=?",
          )
          .run(
            status,
            p.action === "approve" ? req.user.id : null,
            p.action === "approve" ? new Date().toISOString() : null,
            docId,
            p.revision,
            d.approval_status,
          );
        if (changed.changes !== 1)
          fail(409, "The document changed during review.");
        await req.db
          .prepare(
            "UPDATE document_versions SET approval_status=?,approved_by=?,approved_at=? WHERE document_id=? AND revision=?",
          )
          .run(
            status,
            p.action === "approve" ? req.user.id : null,
            p.action === "approve" ? new Date().toISOString() : null,
            docId,
            p.revision,
          );
        await logActivity(req, "document." + status, docId, id, {
          revision: p.revision,
          comment: p.comment,
          selfApproval: d.last_editor === req.user.id,
        });
        if (d.last_editor)
          await notifyMember(
            req,
            d.last_editor,
            id,
            `Document ${d.title}: ${status.replaceAll("_", " ")}`,
            "review",
          );
        await req.db.exec("COMMIT");
      } catch (e) {
        await req.db.exec("ROLLBACK");
        throw e;
      }
      res.json({ ok: true });
    },
  );
}
