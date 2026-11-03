import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localStudyDay } from "../shared/knowledge/practice";
const dir = mkdtempSync(join(tmpdir(), "pm-workspace-"));
process.env.DATA_DIR = dir;
const { app } = await import("../server/app.js");
const { authDb } = await import("../server/db.js");
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((r) => server.once("listening", r));
const base = `http://127.0.0.1:${(server.address() as any).port}/api`;
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
) {
  return fetch(base + path, {
    method,
    headers: {
      "content-type": "application/json",
      "x-requested-with": "ProjectManager",
      cookie,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
async function json(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
  status = 200,
) {
  const r = await request(path, method, body, cookie);
  const data = await r.json();
  assert.equal(r.status, status, JSON.stringify(data));
  return data;
}
const password = "A secure workspace password 2026!";
async function account(email: string) {
  const r = await request("/auth/register", "POST", {
    name: email.split("@")[0],
    email,
    password,
    organisation: email,
    country: "Nigeria",
    currency: "NGN",
    industry: "Technology",
  });
  assert.equal(r.status, 201);
  const cookie = r.headers.get("set-cookie")!.split(";")[0];
  return { cookie, user: await json("/me", "GET", undefined, cookie), email };
}
after(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  await authDb.close();
  rmSync(dir, { recursive: true, force: true });
});
test("workspace roles, invitations, project isolation, scheduling, reviews and recovery", async (t) => {
  const owner = await account("owner@example.test"),
    bob = await account("bob@example.test"),
    outsider = await account("outsider@example.test");
  let project: any,
    taskA: any,
    taskB: any,
    doc: any,
    inviteToken = "";
  const spec = {
    title: "Regional service rollout",
    description: "Real working plan",
    industry: "Technology",
    location: "Lagos",
    currency: "NGN",
    start_date: "2026-11-02",
    end_date: "2026-11-20",
    contingency: 0,
    tax: 0,
    status: "Active",
  };
  const task = (title: string, extra = {}) => ({
    title,
    owner: "",
    start_date: "2026-11-02",
    end_date: "2026-11-06",
    status: "To do",
    progress: 0,
    ...extra,
  });
  await t.test(
    "single-use invitations preserve the personal workspace and restrict project access",
    async () => {
      await json(
        "/workspace/members/" + owner.user.id,
        "PUT",
        { role: "owner", weekly_capacity: 24 },
        owner.cookie,
      );
      assert.equal(
        (await json("/workspace/members", "GET", undefined, owner.cookie)).find(
          (m: any) => m.id === owner.user.id,
        ).weekly_capacity,
        24,
      );
      await json(
        "/workspace/members/" + owner.user.id,
        "PUT",
        { role: "member", weekly_capacity: 24 },
        owner.cookie,
        403,
      );
      project = await json("/projects", "POST", spec, owner.cookie, 201);
      const inv = await json(
        "/workspace/invitations",
        "POST",
        { email: bob.email, role: "member" },
        owner.cookie,
        201,
      );
      inviteToken = new URLSearchParams(new URL(inv.url).hash.slice(1)).get(
        "invite",
      )!;
      await json(
        "/workspace/accept-invitation",
        "POST",
        { token: inviteToken },
        outsider.cookie,
        403,
      );
      await json(
        "/workspace/accept-invitation",
        "POST",
        { token: inviteToken },
        bob.cookie,
      );
      assert.equal(
        (await json("/workspaces", "GET", undefined, bob.cookie)).length,
        2,
      );
      assert.equal(
        (await json("/projects", "GET", undefined, bob.cookie)).length,
        0,
      );
      await json(
        "/projects/" + project.project.id,
        "GET",
        undefined,
        bob.cookie,
        404,
      );
      await json(
        "/workspace/invitations",
        "POST",
        { email: outsider.email, role: "admin" },
        bob.cookie,
        403,
      );
      await json(
        "/workspace/accept-invitation",
        "POST",
        { token: inviteToken },
        bob.cookie,
        400,
      );
    },
  );
  await t.test(
    "project viewers cannot write and editors can collaborate and receive assignments",
    async () => {
      const id = project.project.id;
      await json(
        `/projects/${id}/people/${bob.user.id}`,
        "PUT",
        { role: "viewer" },
        owner.cookie,
      );
      assert.equal(
        (await json("/projects/" + id, "GET", undefined, bob.cookie))
          .permissions.canEdit,
        false,
      );
      await json(
        `/projects/${id}/tasks`,
        "POST",
        task("Forbidden"),
        bob.cookie,
        403,
      );
      await json(
        `/projects/${id}/people/${bob.user.id}`,
        "PUT",
        { role: "editor" },
        owner.cookie,
      );
      taskA = await json(
        `/projects/${id}/tasks`,
        "POST",
        task("Foundation", { assignee_id: bob.user.id, effort_hours: 48 }),
        owner.cookie,
        201,
      );
      assert.equal(
        (
          await json("/projects/" + id, "GET", undefined, owner.cookie)
        ).tasks.find((r: any) => r.id === taskA.id).owner,
        "bob",
      );
      taskB = await json(
        `/projects/${id}/tasks`,
        "POST",
        task("Installation", { end_date: "2026-11-03", weight: 3 }),
        bob.cookie,
        201,
      );
      await json(
        `/projects/${id}/tasks`,
        "POST",
        task("Invalid assignee", { assignee_id: outsider.user.id }),
        owner.cookie,
        400,
      );
      await json(
        `/projects/${id}/comments`,
        "POST",
        { content: "Please review the handoff.", mention_ids: [owner.user.id] },
        bob.cookie,
        201,
      );
      assert.ok(
        (await json("/notifications", "GET", undefined, bob.cookie)).some(
          (n: any) => n.kind === "assignment",
        ),
      );
      assert.ok(
        (await json("/notifications", "GET", undefined, owner.cookie)).some(
          (n: any) => n.kind === "mention",
        ),
      );
      await json(
        `/projects/${id}/people/${outsider.user.id}`,
        "PUT",
        { role: "editor" },
        owner.cookie,
        400,
      );
    },
  );
  await t.test(
    "schedule rejects cycles and stale previews, applies dependencies and retains baselines",
    async () => {
      const id = project.project.id,
        edge = {
          task_id: taskB.id,
          predecessor_id: taskA.id,
          relationship: "FS",
          lag_days: 0,
        };
      await json(
        `/projects/${id}/dependencies`,
        "PUT",
        { dependencies: [edge] },
        owner.cookie,
      );
      let preview = await json(
        `/projects/${id}/schedule`,
        "GET",
        undefined,
        owner.cookie,
      );
      assert.equal(
        preview.tasks.find((x: any) => x.id === taskB.id).start_date,
        "2026-11-09",
      );
      assert.ok(preview.workload.some((r: any) => r.hours > r.capacity));
      await json(
        `/projects/${id}/dependencies`,
        "PUT",
        {
          dependencies: [
            edge,
            { ...edge, task_id: taskA.id, predecessor_id: taskB.id },
          ],
        },
        owner.cookie,
        400,
      );
      await json(
        `/projects/${id}/tasks/${taskB.id}`,
        "PUT",
        task("Installation revised", { end_date: "2026-11-03" }),
        owner.cookie,
      );
      await json(
        `/projects/${id}/schedule/apply`,
        "POST",
        { fingerprint: preview.fingerprint },
        owner.cookie,
        409,
      );
      preview = await json(
        `/projects/${id}/schedule`,
        "GET",
        undefined,
        owner.cookie,
      );
      await json(
        `/projects/${id}/schedule/apply`,
        "POST",
        { fingerprint: preview.fingerprint },
        owner.cookie,
      );
      const current = await json(
        "/projects/" + id,
        "GET",
        undefined,
        owner.cookie,
      );
      assert.equal(
        current.tasks.find((r: any) => r.id === taskB.id).start_date,
        "2026-11-09",
      );
      await json(
        `/projects/${id}/baselines`,
        "POST",
        { title: "Approved baseline" },
        bob.cookie,
        403,
      );
      await json(
        `/projects/${id}/baselines`,
        "POST",
        { title: "Approved baseline" },
        owner.cookie,
        201,
      );
      const baseline = (
        await json(`/projects/${id}/baselines`, "GET", undefined, bob.cookie)
      )[0];
      assert.equal(baseline.record.tasks.length, 2);
      await json(
        `/projects/${id}/tasks/${taskB.id}`,
        "PUT",
        task("Later revision"),
        bob.cookie,
      );
      assert.equal(
        (
          await json(`/projects/${id}/baselines`, "GET", undefined, bob.cookie)
        )[0].record.tasks.find((r: any) => r.id === taskB.id).title,
        "Installation revised",
      );
    },
  );
  await t.test(
    "document revisions remain auditable and approved records cannot be silently overwritten or deleted",
    async () => {
      const id = project.project.id;
      doc = await json(
        `/projects/${id}/documents`,
        "POST",
        {
          title: "Delivery plan",
          type: "Project plan",
          content: "First draft",
        },
        bob.cookie,
        201,
      );
      await json(
        `/projects/${id}/documents/${doc.id}/review`,
        "POST",
        { action: "submit", revision: 1 },
        bob.cookie,
      );
      await json(
        `/projects/${id}/documents/${doc.id}/review`,
        "POST",
        { action: "approve", revision: 1 },
        bob.cookie,
        403,
      );
      await json(
        `/projects/${id}/documents/${doc.id}/review`,
        "POST",
        { action: "approve", revision: 1 },
        owner.cookie,
      );
      await json(
        `/projects/${id}/documents/${doc.id}`,
        "PUT",
        {
          title: "Delivery plan",
          type: "Project plan",
          content: "Second draft",
          expected_revision: 1,
        },
        bob.cookie,
      );
      await json(
        `/projects/${id}/documents/${doc.id}`,
        "PUT",
        {
          title: "Stale change",
          type: "Project plan",
          content: "Wrong",
          expected_revision: 1,
        },
        owner.cookie,
        409,
      );
      const versions = await json(
        `/projects/${id}/documents/${doc.id}/versions`,
        "GET",
        undefined,
        bob.cookie,
      );
      assert.equal(versions.length, 2);
      assert.equal(
        versions.find((r: any) => r.revision === 1).content,
        "First draft",
      );
      assert.equal(
        versions.find((r: any) => r.revision === 1).approval_status,
        "approved",
      );
      assert.equal(versions[0].approval_status, "draft");
      await json(
        `/projects/${id}/documents/${doc.id}`,
        "DELETE",
        undefined,
        owner.cookie,
        409,
      );
      assert.ok(
        (
          await json(`/projects/${id}/activity`, "GET", undefined, bob.cookie)
        ).some((r: any) => r.action === "document.approved"),
      );
    },
  );
  await t.test(
    "learning progress is account-scoped and concurrent updates require the current version",
    async () => {
      const first = await json("/learning", "GET", undefined, bob.cookie);
      await json(
        "/learning/value",
        "PUT",
        {
          correct: 2,
          total: 2,
          day: localStudyDay(),
          version: first.version,
          expected_user_id: bob.user.id,
        },
        bob.cookie,
      );
      const restored = await json("/learning", "GET", undefined, bob.cookie);
      assert.equal(restored.progress.value.passed, true);
      assert.equal(
        (await json("/learning", "GET", undefined, owner.cookie)).progress
          .value,
        undefined,
      );
      await json(
        "/learning/value",
        "PUT",
        { correct: 2, total: 2, day: localStudyDay(), version: 0 },
        bob.cookie,
        409,
      );
      await json(
        "/learning/value",
        "PUT",
        {
          correct: 2,
          total: 2,
          day: localStudyDay(),
          version: restored.version,
          expected_user_id: owner.user.id,
        },
        bob.cookie,
        409,
      );
    },
  );
  await t.test(
    "removal revokes active workspace access and clears grants before later reinvitation",
    async () => {
      await json(
        "/workspace/members/" + bob.user.id,
        "DELETE",
        undefined,
        owner.cookie,
      );
      await json(
        "/projects/" + project.project.id,
        "GET",
        undefined,
        bob.cookie,
        404,
      );
      const again = await json(
        "/workspace/invitations",
        "POST",
        { email: bob.email, role: "viewer" },
        owner.cookie,
        201,
      );
      await json(
        "/workspace/accept-invitation",
        "POST",
        {
          token: new URLSearchParams(new URL(again.url).hash.slice(1)).get(
            "invite",
          ),
        },
        bob.cookie,
      );
      assert.equal(
        (await json("/projects", "GET", undefined, bob.cookie)).length,
        0,
      );
      await json(
        "/workspace/members/" + owner.user.id,
        "DELETE",
        undefined,
        owner.cookie,
        403,
      );
    },
  );
  await t.test(
    "recovery codes require the password, are single-use and revoke every session and remaining code",
    async () => {
      await json(
        "/auth/recovery-codes",
        "POST",
        { password: "wrong password" },
        outsider.cookie,
        403,
      );
      const kit = await json(
        "/auth/recovery-codes",
        "POST",
        { password },
        outsider.cookie,
      );
      assert.equal(kit.codes.length, 8);
      const newer = "Another long secure password 2026!";
      await json(
        "/auth/recover-code",
        "POST",
        { email: outsider.email, code: "0".repeat(32), password: newer },
        "",
        400,
      );
      await json("/auth/recover-code", "POST", {
        email: outsider.email,
        code: kit.codes[0],
        password: newer,
      });
      await json("/me", "GET", undefined, outsider.cookie, 401);
      await json(
        "/auth/recover-code",
        "POST",
        { email: outsider.email, code: kit.codes[1], password: newer },
        "",
        400,
      );
      const login = await request("/auth/login", "POST", {
        email: outsider.email,
        password: newer,
      });
      assert.equal(login.status, 200);
    },
  );
});
