import { test, expect, type Page } from "./fixtures";
async function register(page: Page, email: string, name: string) {
  const r = await page.request.post("/api/auth/register", {
    headers: { "X-Requested-With": "ProjectManager" },
    data: {
      name,
      email,
      password: "A secure workspace password 2026!",
      organisation: name + " Studio",
      country: "Nigeria",
      currency: "NGN",
      industry: "Technology",
    },
  });
  expect(r.status()).toBe(201);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: new RegExp("Welcome back, " + name) }),
  ).toBeVisible();
}
test("team invitation, project access, assignments, schedule, document approval and activity", async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const email = `member-${Date.now()}@example.test`;
  await register(page, `owner-${Date.now()}@example.test`, "Ada");
  await page
    .getByRole("button", { name: "Create new project", exact: true })
    .click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Coastal delivery programme");
  await page.getByLabel("Start date", { exact: true }).fill("2026-11-02");
  await page.getByLabel("End date", { exact: true }).fill("2026-11-20");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Coastal delivery programme",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Team & access", exact: true })
    .click();
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page
    .getByRole("button", { name: "Create invitation link", exact: true })
    .click();
  const invite = await page
    .getByLabel("New invitation link", { exact: true })
    .inputValue();
  expect(invite).toContain("#invite=");
  const context = await browser.newContext(),
    member = await context.newPage();
  try {
    const response = await context.request.post(
      "http://127.0.0.1:3100/api/auth/register",
      {
        headers: { "X-Requested-With": "ProjectManager" },
        data: {
          name: "Bola",
          email,
          password: "A secure workspace password 2026!",
          organisation: "Bola Office",
          country: "Nigeria",
          currency: "NGN",
          industry: "Technology",
        },
      },
    );
    expect(response.status()).toBe(201);
    await member.goto(invite);
    await expect(
      member.getByRole("heading", { name: /Welcome back, Bola/ }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "My Projects", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Open Coastal delivery programme",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Team & discussion", exact: true })
      .click();
    await page
      .getByLabel("Project access for Bola", { exact: true })
      .selectOption("editor");
    await expect(
      page.getByLabel("Project access for Bola", { exact: true }),
    ).toHaveValue("editor");
    await member.reload();
    await member
      .getByRole("button", {
        name: "Open Coastal delivery programme",
        exact: true,
      })
      .click();
    await member
      .getByRole("button", { name: "Team & discussion", exact: true })
      .click();
    await member
      .getByLabel("Project discussion message", { exact: true })
      .fill("The site handoff is ready for review.");
    await member.getByLabel("Ada", { exact: true }).check();
    await member
      .getByRole("button", { name: "Post message", exact: true })
      .click();
    await expect(
      member.getByText("The site handoff is ready for review.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tasks", exact: true }).click();
    await page.getByRole("button", { name: "Add task", exact: true }).click();
    await page.getByLabel("Task name", { exact: true }).fill("Prepare access");
    await page
      .getByLabel("Assigned member", { exact: true })
      .selectOption({ label: "Bola" });
    await page.getByLabel("Due date", { exact: true }).fill("2026-11-03");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("button", { name: "Add task", exact: true }).click();
    await page.getByLabel("Task name", { exact: true }).fill("Mobilise team");
    await page.getByLabel("Due date", { exact: true }).fill("2026-11-03");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page
      .getByRole("button", { name: "Schedule & baselines", exact: true })
      .click();
    await page
      .getByLabel("Predecessor", { exact: true })
      .selectOption({ label: "Prepare access" });
    await page
      .getByLabel("Successor", { exact: true })
      .selectOption({ label: "Mobilise team" });
    await page
      .getByRole("button", { name: "Add dependency", exact: true })
      .click();
    await expect(
      page.getByText("Prepare access → Mobilise team", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Apply preview to planned tasks",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Baseline name", { exact: true })
      .fill("Approved mobilisation plan");
    await page
      .getByRole("button", {
        name: "Approve and capture baseline",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByLabel("Compare with", { exact: true })
        .getByRole("option", { name: /Approved mobilisation plan/ }),
    ).toBeAttached();
    await page.getByRole("button", { name: "Documents", exact: true }).click();
    await page
      .getByRole("button", { name: "Create document", exact: true })
      .click();
    await page
      .getByLabel("Document title", { exact: true })
      .fill("Mobilisation approval");
    await page
      .getByLabel("Document content", { exact: true })
      .fill("Approval evidence and delivery arrangements.");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Document control", exact: true })
      .click();
    await page
      .getByLabel("Document", { exact: true })
      .selectOption({ label: "Mobilisation approval · v1 · draft" });
    await page
      .getByRole("button", { name: "Submit for review", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Approve this revision", exact: true })
      .click();
    await expect(page.getByText(/Approval recorded/)).toBeVisible();
    await page.getByRole("button", { name: "Activity", exact: true }).click();
    await expect(page.locator(".tool-activity")).toContainText(
      "document · approved",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page
      .getByRole("button", { name: "Schedule & baselines", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Schedule logic & forecast",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await member
      .getByRole("button", { name: "Open inbox", exact: true })
      .click();
    await expect(
      member.getByText("You were assigned: Prepare access", { exact: true }),
    ).toBeVisible();
    await expect(
      member.getByText("Ada mentioned you in a project discussion", {
        exact: true,
      }),
    ).not.toBeVisible();
  } finally {
    await context.close();
  }
});
test("authenticated learning sync survives a fresh browser context and recovery kit is downloadable", async ({
  page,
  browser,
}) => {
  const email = `learner-${Date.now()}@example.test`;
  await register(page, email, "Ife");
  await page
    .getByRole("button", { name: "Knowledge Centre", exact: true })
    .click();
  await expect(
    page.getByText("Learning progress is saved to your account.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Search learning lessons").fill("business case");
  await page
    .locator(".learning-lessons")
    .getByRole("button", { name: /Open lesson/ })
    .first()
    .click();
  const { learningLessons } = await import("../../shared/knowledge/learning");
  const lesson = learningLessons.find((l) => l.id === "value")!;
  for (const [i, q] of lesson.questions.entries())
    await page
      .locator(".learning-quiz fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(q.answer)
      .check();
  await page
    .getByRole("button", { name: "Check answers", exact: true })
    .click();
  await expect(
    page.getByText("Learning progress is saved to your account.", {
      exact: true,
    }),
  ).toBeVisible();
  const context = await browser.newContext();
  try {
    const r = await context.request.post(
      "http://127.0.0.1:3100/api/auth/login",
      {
        headers: { "X-Requested-With": "ProjectManager" },
        data: { email, password: "A secure workspace password 2026!" },
      },
    );
    expect(r.status()).toBe(200);
    const other = await context.newPage();
    await other.goto("/");
    await expect(
      other.getByRole("heading", { name: /Welcome back, Ife/ }),
    ).toBeVisible();
    await other
      .locator(".sidebar")
      .getByRole("button", { name: "Knowledge Centre", exact: true })
      .click();
    await expect(other.locator(".learning-progress")).toContainText("1/24");
  } finally {
    await context.close();
  }
  await page
    .getByRole("button", { name: "Settings & account", exact: true })
    .click();
  await page
    .getByLabel("Current password", { exact: true })
    .fill("A secure workspace password 2026!");
  await page
    .getByRole("button", { name: "Generate recovery codes", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download private recovery kit", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "next-mile-recovery-codes.txt",
  );
});
