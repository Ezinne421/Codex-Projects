import { test, expect } from "./fixtures";
test("register, create, budget, task, risk, document, export, logout and return", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start your first project", exact: true })
    .click();
  await page.getByLabel("Your name").fill("Ezinne Okafor");
  await page.getByLabel("Organisation", { exact: true }).fill("Impact Works");
  await page
    .getByLabel("Email address")
    .fill(`ezinne-${Date.now()}@example.com`);
  const email = await page.getByLabel("Email address").inputValue();
  await page
    .getByLabel("Password", { exact: true })
    .fill("Correct horse battery 123!");
  await page.getByRole("button", { name: "Create your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome back, Ezinne/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create new project", exact: true })
    .click();
  await page.getByLabel("Project name").fill("Cross River maize");
  await page
    .getByLabel("What are you working towards?")
    .fill("Cultivate 500 hectares of maize with accountable cost tracking.");
  await page
    .getByLabel("Location", { exact: true })
    .fill("Cross River, Nigeria");
  await page.getByLabel("Start date").fill("2026-10-01");
  await page.getByLabel("End date").fill("2027-03-31");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Cross River maize", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Budget", exact: true }).click();
  await page.getByRole("button", { name: "Add budget item" }).click();
  await page.getByLabel("Budget item", { exact: true }).fill("Seeds");
  await page.getByLabel("Quantity", { exact: true }).fill("500");
  await page.getByLabel("Unit cost").fill("5000");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("cell", { name: "Seeds", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "₦2,500,000.00", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page.getByRole("button", { name: "Add task" }).click();
  await page.getByLabel("Task name").fill("Prepare land");
  await page.getByLabel("Responsible person").fill("Ada");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("cell", { name: "Prepare land", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Risks", exact: true }).click();
  await page.getByRole("button", { name: "Add risk" }).click();
  await page.getByLabel("Risk description").fill("Late rainfall");
  await page.getByLabel("Mitigation measures").fill("Monitor forecasts");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Late rainfall" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await page
    .getByRole("button", { name: "Create document", exact: true })
    .click();
  await page.getByLabel("Document title").fill("Maize project plan");
  await page
    .getByLabel("Document content")
    .fill("Objective: cultivate maize. Verify all estimates with suppliers.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Maize project plan" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOCX", exact: true }).first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.docx$/);
  await page.screenshot({
    path: "/tmp/projectmanager-workspace.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Settings & account" }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Correct horse battery 123!");
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("button", { name: /Cross River maize/ }).first(),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "My Projects", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "My Projects", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/projectmanager-mobile.png",
    fullPage: true,
  });
});
test("landing page fits mobile and desktop", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Next Mile — Turn plans into progress.");
  await expect(
    page.getByRole("heading", { name: /Turn plans into progress/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/projectmanager-landing.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
