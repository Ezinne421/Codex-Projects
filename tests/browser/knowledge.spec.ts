import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
for (const edition of ["hosted", "offline"])
  test(`${edition}: knowledge search, formulas, related terms, bookmarks, filters, CSV and mobile`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const open = async () => {
      if (edition === "hosted") {
        await page.goto("/");
        await page
          .getByRole("button", { name: "Knowledge Centre", exact: true })
          .last()
          .click();
      } else {
        await page.route("**/offline-knowledge", (r) =>
          r.fulfill({
            path: resolve("standalone/projectmanager-ai-africa.html"),
            contentType: "text/html",
          }),
        );
        await page.goto("/offline-knowledge");
        await page
          .getByRole("button", { name: "Knowledge Centre", exact: true })
          .click();
      }
    };
    await open();
    await expect(
      page.getByRole("heading", { name: "Knowledge Centre", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("538 definitions", { exact: true }),
    ).toBeVisible();
    const search = page.getByRole("textbox", { name: "Search definitions" });
    await search.fill("CPI");
    await page
      .getByRole("button", { name: "Cost performance index", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", {
        name: "Cost performance index",
        exact: true,
      }),
    ).toBeVisible();
    await expect(dialog).toContainText("CPI = EV ÷ AC");
    await expect(dialog).toContainText("Conditions & interpretation");
    await dialog
      .getByRole("button", { name: "Save this term", exact: true })
      .click();
    await dialog.getByRole("button", { name: /Earned value/ }).click();
    await expect(
      dialog.getByRole("heading", { name: "Earned value", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await search.fill("");
    await page.getByRole("button", { name: /^Saved \(1\)$/ }).click();
    await expect(page.locator(".knowledge-card")).toHaveCount(1);
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export glossary CSV", exact: true })
      .click();
    expect((await downloaded).suggestedFilename()).toBe(
      "project-operations-glossary.csv",
    );
    await open();
    await page.getByRole("button", { name: /^Saved \(1\)$/ }).click();
    await expect(page.locator(".knowledge-card")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page.getByLabel("Knowledge topic").selectOption("inventory");
    await page
      .getByRole("button", { name: "Terms starting with S", exact: true })
      .click();
    const names = await page.locator(".knowledge-card h2").allTextContents();
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.startsWith("S"))).toBeTruthy();
    await search.fill("zzzzunknownterm");
    await expect(
      page.getByRole("heading", { name: "No matching definitions" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .first()
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("heading", { name: "Knowledge Centre", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await search.fill("CPI");
    await page
      .getByRole("button", { name: "Cost performance index", exact: true })
      .click();
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate((e) => e.getBoundingClientRect().width),
    ).toBeLessThan(390);
    await dialog.getByRole("button", { name: "Close definition" }).click();
    expect(errors).toEqual([]);
  });
