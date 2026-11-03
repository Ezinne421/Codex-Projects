import { test, expect } from "./fixtures";
import { resolve } from "node:path";
test("full app: visible library, blank export, project generation, edited save and Word export", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page.getByLabel("Your name").fill("Template Tester");
  await page.getByLabel("Organisation", { exact: true }).fill("Template Works");
  await page
    .getByLabel("Email address")
    .fill(`templates-${Date.now()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("A safe testing password 123");
  await page.getByRole("button", { name: "Create your workspace" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Knowledge Centre", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Knowledge Centre", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Project management templates" }),
  ).toBeVisible();
  await page.getByLabel("Search templates").fill("Reference");
  await page.getByRole("button", { name: /Terms of Reference/ }).click();
  await page.getByLabel("Assignment scope").fill("Assess irrigation needs.");
  await page
    .getByRole("button", { name: "Generate template", exact: true })
    .click();
  await expect(page.getByLabel("Editable template content")).toContainText(
    "Assess irrigation needs.",
  );
  const blank = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download HTML", exact: true })
    .click();
  expect((await blank).suggestedFilename()).toBe("tor-template.html");
  await page.getByRole("button", { name: "My Projects", exact: true }).click();
  await page
    .getByRole("button", { name: "Create new project", exact: true })
    .first()
    .click();
  await page.getByLabel("Project name").fill("Irrigation review");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Irrigation review", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Templates", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: /Project charter/ }).click();
  await page.getByLabel("Sponsor / authorising body").fill("Farm board");
  await page
    .getByLabel("Success criteria")
    .fill("Document verified irrigation needs.");
  await page
    .getByRole("button", { name: "Generate template", exact: true })
    .click();
  const editor = page.getByLabel("Editable template content");
  await expect(editor).toContainText("Farm board");
  await editor.fill((await editor.inputValue()) + "\nReviewed by Ada.");
  await page
    .getByRole("button", { name: "Save to project documents", exact: true })
    .click();
  await expect(
    page.getByText("Saved to project documents", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Irrigation review — Project charter" }),
  ).toBeVisible();
  await page.getByText("Read document", { exact: true }).click();
  await expect(
    page.getByText("Reviewed by Ada.", { exact: false }),
  ).toBeVisible();
  const word = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOCX", exact: true }).first().click();
  expect((await word).suggestedFilename()).toMatch(/\.docx$/);
  await page.reload();
  await page
    .getByRole("button", { name: "Open Irrigation review", exact: true })
    .click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Irrigation review — Project charter" }),
  ).toBeVisible();
});
test("standalone HTML: discover, generate blank, then save a project template and restore it", async ({
  page,
}) => {
  await page.route("**/local-edition", (route) =>
    route.fulfill({
      path: resolve("standalone/projectmanager-ai-africa.html"),
      contentType: "text/html",
    }),
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/local-edition");
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Project management templates" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Use template →", exact: true }),
  ).toHaveCount(16);
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Terms of Reference",
        exact: true,
      }),
    })
    .getByRole("button", { name: "Use template →" })
    .click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Local irrigation");
  await page.getByLabel("Assignment scope").fill("Assess irrigation needs.");
  await page
    .getByRole("button", { name: "Generate template", exact: true })
    .click();
  await expect(page.getByLabel("Editable template content")).toContainText(
    "Assess irrigation needs.",
  );
  const blank = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download HTML", exact: true })
    .click();
  expect((await blank).suggestedFilename()).toMatch(/\.html$/);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "Back to workspace", exact: false })
    .click();
  await page
    .getByRole("button", { name: "+ Create new project", exact: true })
    .click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Local irrigation");
  await page.getByLabel("Location", { exact: true }).fill("Cross River");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("button", { name: "Templates", exact: true })
    .last()
    .click();
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Work Breakdown Structure",
        exact: true,
      }),
    })
    .getByRole("button", { name: "Use template →" })
    .click();
  await page
    .getByLabel("Deliverables / scope")
    .fill("Survey and irrigation design.");
  await page
    .getByRole("button", { name: "Generate template", exact: true })
    .click();
  const editor = page.getByLabel("Editable template content");
  await expect(editor).toContainText("Survey and irrigation design.");
  await editor.fill((await editor.inputValue()) + "\nLocal reviewed edit.");
  await page
    .getByRole("button", { name: "Save to project documents", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Local irrigation — Work Breakdown Structure",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Local irrigation", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Local irrigation — Work Breakdown Structure",
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Templates", exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
