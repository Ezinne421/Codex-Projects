import type { Express, RequestHandler } from "express";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { authDb } from "./db.js";
import { accessibleProject, logActivity, fail } from "./workspace.js";
import {
  analyseSchedule,
  workingDistance,
  workingSpan,
  addWorkingDays,
  type Dependency,
} from "../shared/scheduling.js";
async function records(req: any, id: string) {
  const project = await accessibleProject(req, id, "view");
  const tasks = await req.db
    .prepare("SELECT * FROM tasks WHERE project_id=? ORDER BY id")
    .all(id);
  const dependencies = await req.db
    .prepare(
      "SELECT d.* FROM task_dependencies d JOIN tasks t ON t.id=d.task_id WHERE t.project_id=? ORDER BY d.task_id,d.predecessor_id",
    )
    .all(id);
  return { project, tasks, dependencies };
}
const fingerprint = (data: unknown) =>
  createHash("sha256").update(JSON.stringify(data)).digest("hex");
function analyse(data: any) {
  try {
    return analyseSchedule(data.project, data.tasks, data.dependencies);
  } catch (e) {
    fail(400, (e as Error).message);
  }
}
export function registerScheduleRoutes(
  app: Express,
  requireAuth: RequestHandler,
  tenant: RequestHandler,
) {
  app.get(
    "/api/projects/:id/schedule",
    requireAuth,
    tenant,
    async (req, res) => {
      const data = await records(req, String(req.params.id));
      const analysis = analyse(data);
      const members = await authDb
        .prepare(
          "SELECT u.id,u.name,m.weekly_capacity FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.org_id=?",
        )
        .all(req.user.org_id);
      const workload: Record<
        string,
        {
          userId: string;
          name: string;
          week: string;
          hours: number;
          capacity: number;
        }
      > = {};
      for (const task of data.tasks) {
        if (!task.assignee_id || !task.effort_hours) continue;
        const m = members.find((x) => x.id === task.assignee_id);
        if (!m) continue;
        const length = Math.max(
          1,
          workingSpan(
            task.start_date,
            task.end_date,
            data.project.working_week,
          ),
        );
        for (let i = 0; i < Math.min(length, 2600); i++) {
          const date = addWorkingDays(
              task.start_date,
              i,
              data.project.working_week,
            ),
            d = new Date(date + "T00:00:00Z"),
            weekday = d.getUTCDay();
          d.setUTCDate(d.getUTCDate() - (weekday === 0 ? 6 : weekday - 1));
          const week = d.toISOString().slice(0, 10),
            key = m.id + week;
          const row = (workload[key] ??= {
            userId: m.id,
            name: m.name,
            week,
            hours: 0,
            capacity: m.weekly_capacity,
          });
          row.hours += task.effort_hours / length;
        }
      }
      res.json({
        ...analysis,
        sourceRevision: data.project.revision,
        fingerprint: fingerprint(data),
        dependencies: data.dependencies,
        workload: Object.values(workload).sort((a, b) =>
          a.week.localeCompare(b.week),
        ),
      });
    },
  );
  app.put(
    "/api/projects/:id/dependencies",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "edit");
      const { dependencies } = z
        .object({
          dependencies: z
            .array(
              z.object({
                task_id: z.string().uuid(),
                predecessor_id: z.string().uuid(),
                relationship: z.enum(["FS", "SS", "FF", "SF"]),
                lag_days: z.number().int().min(-365).max(365),
              }),
            )
            .max(5000),
        })
        .parse(req.body);
      const data = await records(req, id);
      analyse({ ...data, dependencies });
      const unique = new Set(
        dependencies.map((d) => d.task_id + ":" + d.predecessor_id),
      );
      if (unique.size !== dependencies.length)
        fail(400, "Each predecessor can be linked to a task once.");
      await req.db.exec("BEGIN");
      try {
        await req.db
          .prepare("UPDATE projects SET revision=revision+1 WHERE id=?")
          .run(id);
        await req.db
          .prepare(
            "DELETE FROM task_dependencies WHERE task_id IN(SELECT id FROM tasks WHERE project_id=?)",
          )
          .run(id);
        for (const d of dependencies)
          await req.db
            .prepare(
              "INSERT INTO task_dependencies(task_id,predecessor_id,relationship,lag_days) VALUES(?,?,?,?)",
            )
            .run(d.task_id, d.predecessor_id, d.relationship, d.lag_days);
        await logActivity(req, "schedule.dependencies.updated", id, id, {
          count: dependencies.length,
        });
        await req.db.exec("COMMIT");
      } catch (e) {
        await req.db.exec("ROLLBACK");
        throw e;
      }
      res.json({ ok: true });
    },
  );
  app.post(
    "/api/projects/:id/schedule/apply",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "edit");
      const p = z
        .object({ fingerprint: z.string().length(64) })
        .parse(req.body);
      await req.db.exec("BEGIN");
      try {
        const data = await records(req, id);
        if (fingerprint(data) !== p.fingerprint)
          fail(409, "Project data changed. Preview the schedule again.");
        const analysis = analyse(data);
        if (analysis.issues.length)
          fail(
            409,
            "Resolve fixed-date conflicts before applying this schedule.",
          );
        const lock = await req.db
          .prepare(
            "UPDATE projects SET revision=revision+1 WHERE id=? AND revision=?",
          )
          .run(id, data.project.revision);
        if (lock.changes !== 1)
          fail(409, "The schedule changed. Preview again.");
        for (const t of analysis.tasks)
          if (t.status !== "Done")
            await req.db
              .prepare(
                "UPDATE tasks SET start_date=?,end_date=? WHERE id=? AND project_id=?",
              )
              .run(t.start_date, t.end_date, t.id, id);
        await logActivity(req, "schedule.applied", id, id, {
          finish: analysis.finish,
          changed: analysis.tasks.filter((t) => t.changed).length,
        });
        await req.db.exec("COMMIT");
        res.json({ ok: true });
      } catch (e) {
        await req.db.exec("ROLLBACK");
        throw e;
      }
    },
  );
  app.get(
    "/api/projects/:id/baselines",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "view");
      res.json(
        (
          await req.db
            .prepare(
              "SELECT * FROM project_baselines WHERE project_id=? ORDER BY created_at DESC,id DESC",
            )
            .all(id)
        ).map((r) => ({
          ...r,
          record: JSON.parse(r.record_json),
          record_json: undefined,
        })),
      );
    },
  );
  app.post(
    "/api/projects/:id/baselines",
    requireAuth,
    tenant,
    async (req, res) => {
      const id = String(req.params.id);
      await accessibleProject(req, id, "manage");
      const { title } = z
        .object({ title: z.string().trim().min(1).max(150) })
        .parse(req.body);
      const data = await records(req, id);
      const budget = await req.db
        .prepare("SELECT * FROM budget_items WHERE project_id=? ORDER BY id")
        .all(id);
      const key = randomUUID();
      await req.db
        .prepare(
          "INSERT INTO project_baselines(id,project_id,title,record_json,created_by) VALUES(?,?,?,?,?)",
        )
        .run(
          key,
          id,
          title,
          JSON.stringify({
            ...data,
            budget,
            approvedBy: req.user.name,
            capturedAt: new Date().toISOString(),
          }),
          req.user.id,
        );
      await logActivity(req, "baseline.approved", key, id, { title });
      res.status(201).json({ id: key });
    },
  );
}
