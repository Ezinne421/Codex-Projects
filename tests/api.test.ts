import { test, after } from "node:test";
import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readSheet } from "read-excel-file/node";
const dir = mkdtempSync(join(tmpdir(), "pm-api-"));
process.env.DATA_DIR = dir;
delete process.env.AI_API_KEY;
delete process.env.SMTP_HOST;
const { app } = await import("../server/app.js");
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((r) => server.once("listening", r));
const url = `http://127.0.0.1:${(server.address() as any).port}`;
const request = async (path: string, method = "GET", body?: any, cookie = "") =>
  fetch(url + "/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "ProjectManager",
      cookie,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const registration = (email: string) => ({
  email,
  password: "Correct horse battery 123!",
  name: "Ezinne Okafor",
  organisation: "Impact Works",
  industry: "Agriculture",
  country: "Nigeria",
  currency: "NGN",
});
let owner = "",
  other = "",
  projectId = "",
  taskId = "";
const project = {
  title: "Cross River maize",
  description: "Cultivate 500 hectares over six months.",
  industry: "Agriculture",
  location: "Cross River",
  currency: "NGN",
  start_date: "2026-10-01",
  end_date: "2027-03-31",
  contingency: 10,
  tax: 7.5,
};
after(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  const { authDb } = await import("../server/db.js");
  authDb.close();
  rmSync(dir, { recursive: true, force: true });
});
test("MVP API journeys and isolation", async (t) => {
  await t.test("registers accounts with private sessions", async () => {
    for (const email of ["owner@example.com", "other@example.com"]) {
      const res = await request("/auth/register", "POST", registration(email));
      assert.equal(res.status, 201);
      const cookie = res.headers.get("set-cookie")!;
      assert.match(cookie, /HttpOnly/);
      assert.match(cookie, /SameSite=Lax/);
      if (email.startsWith("owner")) owner = cookie.split(";")[0];
      else other = cookie.split(";")[0];
    }
    assert.equal((await request("/projects")).status, 401);
    assert.equal(
      (
        await request("/auth/login", "POST", {
          email: "owner@example.com",
          password: "wrong",
        })
      ).status,
      401,
    );
  });
  await t.test("rejects CSRF requests and weak passwords", async () => {
    const csrf = await fetch(url + "/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: owner,
        origin: "https://evil.example",
      },
      body: JSON.stringify(project),
    });
    assert.equal(csrf.status, 403);
    const bad = await request("/auth/register", "POST", {
      ...registration("weak@example.com"),
      password: "weak",
    });
    assert.equal(bad.status, 400);
  });
  await t.test("creates project and validates date ordering", async () => {
    const res = await request("/projects", "POST", project, owner);
    assert.equal(res.status, 201);
    projectId = (await res.json()).project.id;
    assert.equal(
      (
        await request(
          "/projects",
          "POST",
          { ...project, end_date: "2020-01-01" },
          owner,
        )
      ).status,
      400,
    );
  });
  await t.test("calculates persisted budget and actual expenses", async () => {
    for (const line of [
      {
        title: "Land preparation",
        category: "Equipment",
        quantity: 500,
        rateMinor: 1500000,
      },
      {
        title: "Seeds",
        category: "Materials",
        quantity: 500,
        rateMinor: 500000,
      },
    ])
      assert.equal(
        (
          await request(
            `/projects/${projectId}/budget_items`,
            "POST",
            line,
            owner,
          )
        ).status,
        201,
      );
    assert.equal(
      (
        await request(
          `/projects/${projectId}/expenses`,
          "POST",
          { title: "Deposit", amountMinor: 30000000, date: "2026-10-31" },
          owner,
        )
      ).status,
      201,
    );
    const data = await (
      await request(`/projects/${projectId}`, "GET", undefined, owner)
    ).json();
    assert.equal(data.finance.subtotal, 1000000000);
    assert.equal(data.finance.total, 1182500000);
    assert.equal(data.finance.spent, 30000000);
    assert.equal(data.finance.remaining, 1152500000);
  });
  await t.test(
    "creates and edits tasks, risks, updates and documents",
    async () => {
      const task = {
        title: "Prepare fields",
        owner: "Ada",
        start_date: "2026-10-01",
        end_date: "2026-11-01",
        status: "In progress",
        progress: 40,
      };
      let response = await request(
        `/projects/${projectId}/tasks`,
        "POST",
        task,
        owner,
      );
      assert.equal(response.status, 201);
      taskId = (await response.json()).id;
      assert.equal(
        (
          await request(
            `/projects/${projectId}/tasks/${taskId}`,
            "PUT",
            { ...task, status: "Done", progress: 100 },
            owner,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/projects/${projectId}/tasks/${taskId}`,
            "PUT",
            { ...task, status: "Done", progress: 40 },
            owner,
          )
        ).status,
        400,
      );
      const risk = {
        title: "Late rainfall",
        category: "Environmental",
        probability: 4,
        impact: 5,
        warning: "Dry weather",
        mitigation: "Monitor forecasts",
        contingency: "Adjust planting window",
        owner: "Ada",
        review_date: "2026-11-01",
        status: "Open",
      };
      assert.equal(
        (await request(`/projects/${projectId}/risks`, "POST", risk, owner))
          .status,
        201,
      );
      assert.equal(
        (
          await request(
            `/projects/${projectId}/updates`,
            "POST",
            {
              content: "Field preparation verified at 40%.",
              date: "2026-10-31",
            },
            owner,
          )
        ).status,
        201,
      );
      assert.equal(
        (
          await request(
            `/projects/${projectId}/documents`,
            "POST",
            {
              title: "Maize project plan",
              type: "Project plan",
              content:
                "Scope: 500 hectares. Estimates require supplier validation.",
            },
            owner,
          )
        ).status,
        201,
      );
    },
  );
  await t.test(
    "denies foreign project IDs, child writes, exports and AI",
    async () => {
      assert.deepEqual(
        await (await request("/projects", "GET", undefined, other)).json(),
        [],
      );
      for (const path of [
        `/projects/${projectId}`,
        `/projects/${projectId}/export/pdf`,
      ])
        assert.equal(
          (await request(path, "GET", undefined, other)).status,
          404,
        );
      assert.equal(
        (
          await request(
            `/projects/${projectId}/tasks/${taskId}`,
            "DELETE",
            undefined,
            other,
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            `/projects/${projectId}/ai`,
            "POST",
            { kind: "plan" },
            other,
          )
        ).status,
        404,
      );
      assert.equal(
        (await request(`/projects/${projectId}`, "DELETE", undefined, other))
          .status,
        404,
      );
      assert.equal(
        readdirSync(dir).filter((f) => /^org-.*\.sqlite$/.test(f)).length,
        2,
      );
    },
  );
  await t.test("exports real PDF, DOCX and Excel content", async () => {
    const pdf = await request(
      `/projects/${projectId}/export/pdf`,
      "GET",
      undefined,
      owner,
    );
    assert.equal(pdf.status, 200);
    assert.equal(
      Buffer.from(await pdf.arrayBuffer())
        .subarray(0, 5)
        .toString(),
      "%PDF-",
    );
    const docx = await request(
      `/projects/${projectId}/export/docx`,
      "GET",
      undefined,
      owner,
    );
    assert.equal(
      Buffer.from(await docx.arrayBuffer())
        .subarray(0, 2)
        .toString(),
      "PK",
    );
    const xlsx = await request(
      `/projects/${projectId}/export/xlsx`,
      "GET",
      undefined,
      owner,
    );
    const buffer = Buffer.from(await xlsx.arrayBuffer());
    const summary = await readSheet(buffer, "Summary");
    assert.equal(summary[2][1], 11825000);
    const lines = await readSheet(buffer, "budget_items");
    assert.equal(lines.length, 3);
  });
  await t.test(
    "AI and recovery fail honestly without credentials",
    async () => {
      assert.equal(
        (
          await request(
            `/projects/${projectId}/ai`,
            "POST",
            { kind: "plan" },
            owner,
          )
        ).status,
        503,
      );
      assert.equal(
        (await request("/auth/forgot", "POST", { email: "owner@example.com" }))
          .status,
        503,
      );
    },
  );
  await t.test(
    "AI output is saved as a reviewable draft using a mocked provider",
    async () => {
      process.env.AI_API_KEY = "test-placeholder";
      const nativeFetch = globalThis.fetch;
      globalThis.fetch = (async (input: any, init: any) =>
        String(input) === "https://api.openai.com/v1/chat/completions"
          ? new Response(
              JSON.stringify({
                choices: [
                  {
                    message: {
                      content:
                        "Project plan\nRecorded scope: 500 hectares. Missing: verified supplier prices.",
                    },
                  },
                ],
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            )
          : nativeFetch(input, init)) as typeof fetch;
      try {
        const response = await request(
          `/projects/${projectId}/ai`,
          "POST",
          { kind: "plan" },
          owner,
        );
        assert.equal(response.status, 200);
        const data = await response.json();
        assert.ok(data.documentId);
        const bundle = await (
          await request(`/projects/${projectId}`, "GET", undefined, owner)
        ).json();
        assert.equal(
          bundle.documents.find((d: any) => d.id === data.documentId).source,
          "AI draft — review required",
        );
      } finally {
        globalThis.fetch = nativeFetch;
        delete process.env.AI_API_KEY;
      }
    },
  );
  await t.test(
    "logout invalidates session and login restores saved work",
    async () => {
      assert.equal(
        (await request("/auth/logout", "POST", {}, owner)).status,
        200,
      );
      assert.equal(
        (await request("/projects", "GET", undefined, owner)).status,
        401,
      );
      const login = await request("/auth/login", "POST", {
        email: "owner@example.com",
        password: registration("").password,
      });
      assert.equal(login.status, 200);
      owner = login.headers.get("set-cookie")!.split(";")[0];
      const restored = await (
        await request(`/projects/${projectId}`, "GET", undefined, owner)
      ).json();
      assert.equal(restored.tasks[0].progress, 100);
      assert.equal(restored.updates.length, 1);
      assert.equal(restored.risks.length, 1);
    },
  );
  await t.test(
    "duplicate excludes actual expenses and progress updates",
    async () => {
      const duplicate = await request(
        `/projects/${projectId}/duplicate`,
        "POST",
        {},
        owner,
      );
      assert.equal(duplicate.status, 201);
      const data = await duplicate.json();
      assert.equal(data.expenses.length, 0);
      assert.equal(data.updates.length, 0);
      assert.equal(data.budget_items.length, 2);
    },
  );
  await t.test(
    "recovery tokens expire, change passwords, revoke sessions and are single-use",
    async () => {
      const { authDb } = await import("../server/db.js");
      const user = authDb
        .prepare("SELECT id FROM users WHERE email=?")
        .get("owner@example.com")!;
      const expired = randomBytes(32).toString("hex");
      const valid = randomBytes(32).toString("hex");
      const digest = (v: string) =>
        createHash("sha256").update(v).digest("hex");
      authDb
        .prepare("INSERT INTO reset_tokens VALUES(?,?,?)")
        .run(digest(expired), user.id, Date.now() - 1);
      assert.equal(
        (
          await request("/auth/reset", "POST", {
            token: expired,
            password: "New correct horse battery!",
          })
        ).status,
        400,
      );
      authDb
        .prepare("INSERT INTO reset_tokens VALUES(?,?,?)")
        .run(digest(valid), user.id, Date.now() + 60000);
      assert.equal(
        (
          await request("/auth/reset", "POST", {
            token: valid,
            password: "New correct horse battery!",
          })
        ).status,
        200,
      );
      assert.equal(
        (await request("/projects", "GET", undefined, owner)).status,
        401,
      );
      assert.equal(
        (
          await request("/auth/reset", "POST", {
            token: valid,
            password: "Another new password!",
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request("/auth/login", "POST", {
            email: "owner@example.com",
            password: registration("").password,
          })
        ).status,
        401,
      );
      assert.equal(
        (
          await request("/auth/login", "POST", {
            email: "owner@example.com",
            password: "New correct horse battery!",
          })
        ).status,
        200,
      );
    },
  );
});
