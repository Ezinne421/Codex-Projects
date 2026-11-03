import { test, expect } from "./fixtures";
import { resolve } from "node:path";
import { learningLessons } from "../../shared/knowledge/learning";
for (const edition of ["hosted", "offline"])
  test(`${edition}: learn, apply, recall, persist, review, calculate and follow current guidance`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (edition === "offline")
      await page.route("**/offline-learning", (r) =>
        r.fulfill({
          path: resolve("standalone/projectmanager-ai-africa.html"),
          contentType: "text/html",
        }),
      );
    const open = async () => {
      await page.goto(edition === "hosted" ? "/" : "/offline-learning");
      await page
        .getByRole("button", { name: "Knowledge Centre", exact: true })
        .last()
        .click();
      await expect(
        page.getByRole("heading", { name: "Your skills refresh", exact: true }),
      ).toBeVisible();
    };
    await open();
    await expect(
      page.getByText("24 lessons · 6 learning paths · 48 scenario questions", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByLabel("Search learning lessons").fill("earned value");
    await expect(page.locator(".learning-lessons article")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Open lesson", exact: false })
      .click();
    const lesson = learningLessons.find((l) => l.id === "evm")!;
    await expect(
      page.getByRole("heading", { name: lesson.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Worked decision", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Cost performance index ↗", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("CPI = EV ÷ AC");
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Check answers", exact: true }),
    ).toBeDisabled();
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
    await expect(page.locator(".learning-score")).toContainText("2/2 correct");
    await expect(page.locator(".learning-score")).toContainText("Next review:");
    await expect(page.locator(".learning-progress")).toContainText("1/24");
    await open();
    await expect(page.locator(".learning-progress")).toContainText("1/24");
    const key =
      edition === "hosted"
        ? "pma-knowledge-saved-public-learning-v1"
        : "pma-local-knowledge-saved-learning-v1";
    await page.evaluate((key) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.evm.lastReviewed = "2000-01-01";
      p.evm.due = "2000-01-02";
      localStorage.setItem(key, JSON.stringify(p));
    }, key);
    await open();
    await page
      .getByRole("button", { name: "Review due lessons", exact: true })
      .click();
    await expect(page.locator(".learning-lessons article")).toHaveCount(1);
    await expect(page.locator(".learning-lessons")).toContainText(lesson.title);
    await page
      .getByRole("button", { name: "Practice lab", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Calculate example", exact: true })
      .click();
    await expect(page.locator(".learning-calculation")).toContainText(
      "250,000",
    );
    await page.getByLabel("Earned value (EV)", { exact: true }).fill("0");
    await page
      .getByRole("button", { name: "Calculate example", exact: true })
      .click();
    await expect(page.locator(".learning-calculation")).toContainText(
      "EAC is not calculated",
    );
    await expect(page.locator(".learning-calculation")).not.toContainText(
      "NaN",
    );
    await page
      .getByRole("button", {
        name: "Overall equipment effectiveness",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Calculate example", exact: true })
      .click();
    await expect(page.locator(".learning-calculation")).toContainText("83.79");
    await page
      .getByRole("button", { name: "Three-point PERT estimate", exact: true })
      .click();
    await page
      .getByLabel("Optimistic duration (days)", { exact: true })
      .fill("20");
    await page
      .getByRole("button", { name: "Calculate example", exact: true })
      .click();
    await expect(
      page.locator(".learning-tool").getByRole("alert"),
    ).toContainText("optimistic ≤ most likely");
    await page
      .getByRole("button", { name: "Current guidance", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Current guidance & skills radar",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator(".learning-radar article")).toHaveCount(6);
    await expect(
      page.getByText("PMBOK Guide — Eighth Edition", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Use AI responsibly in project work",
        exact: true,
      })
      .first()
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Use AI responsibly in project work",
        exact: true,
      }),
    ).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.getByRole("button", { name: "Glossary", exact: true }).click();
    await expect(page.getByLabel("Search definitions")).toBeVisible();
    await page
      .getByRole("button", { name: "Learn & refresh", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your skills refresh", exact: true }),
    ).toBeVisible();
    await page.clock.setFixedTime(new Date("2027-03-03T12:00:00Z"));
    await open();
    await page
      .getByRole("button", { name: "Current guidance", exact: true })
      .click();
    await expect(
      page.getByText(/This snapshot is over 90 days old/),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
