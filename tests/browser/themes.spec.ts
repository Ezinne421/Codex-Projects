import { test, expect, type Page } from "./fixtures";
import { resolve } from "node:path";
async function selectTheme(page: Page, name: string) {
  await page
    .getByRole("button", { name: "Colour theme", exact: true })
    .first()
    .click();
  await page.getByRole("radio", { name, exact: false }).check();
  await page.keyboard.press("Escape");
}
async function expectContrast(page: Page, selector: string) {
  const measure = async () =>
    await page
      .locator(selector)
      .first()
      .evaluate((node) => {
        const s = getComputedStyle(node);
        function luminance(colour: string) {
          const c = document.createElement("canvas").getContext("2d")!;
          c.fillStyle = colour;
          c.fillRect(0, 0, 1, 1);
          const pixels = c.getImageData(0, 0, 1, 1).data;
          const rgb = Array.from(pixels)
            .slice(0, 3)
            .map((x) => x / 255)
            .map((x) =>
              x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4,
            );
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        }
        const fg = luminance(s.color),
          bg = luminance(s.backgroundColor);
        return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      });
  await expect
    .poll(measure, { message: selector + " colour contrast" })
    .toBeGreaterThanOrEqual(4.5);
}
test("themes persist before app startup, sync across tabs, follow device, and work in account settings", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const [name, id] of [
    ["Forest & Sand", "forest"],
    ["Atlantic Blue", "atlantic"],
    ["Midnight", "midnight"],
    ["Signature Plum", "signature"],
  ]) {
    await selectTheme(page, name);
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
    await expectContrast(page, ".theme-trigger");
    await expectContrast(page, ".button.primary");
    await expectContrast(page, "body");
    await page.screenshot({ path: `/tmp/pm-theme-${id}.png`, fullPage: true });
  }
  await selectTheme(page, "Midnight");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  const other = await context.newPage();
  await other.goto("/");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "midnight");
  await selectTheme(other, "Forest & Sand");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "forest");
  await other.close();
  await page.emulateMedia({ colorScheme: "dark" });
  await selectTheme(page, "Follow device");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "signature");
  await selectTheme(page, "Midnight");
  await page
    .getByRole("button", { name: "Knowledge Centre", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Glossary", exact: true }).click();
  await expectContrast(page, ".knowledge-card");
  await page.getByRole("textbox", { name: "Search definitions" }).fill("CPI");
  await page
    .getByRole("button", { name: "Cost performance index", exact: true })
    .click();
  await expectContrast(page, ".knowledge-dialog");
  await page.screenshot({
    path: "/tmp/pm-theme-knowledge-dark.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expectContrast(page, 'input[type="email"]');
  await page.getByRole("button", { name: "Colour theme", exact: true }).click();
  await page.getByRole("radio", { name: /Atlantic Blue/ }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Colour theme", exact: true }),
  ).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "atlantic");
  const response = await page.request.post("/api/auth/register", {
    headers: { "X-Requested-With": "ProjectManager" },
    data: {
      name: "Theme reviewer",
      email: `theme-${Date.now()}@example.test`,
      password: "A private theme test 2026!",
      organisation: "Theme review",
      country: "Nigeria",
      currency: "NGN",
      industry: "Technology",
    },
  });
  expect(response.status()).toBe(201);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Settings & account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Appearance", exact: true }),
  ).toBeVisible();
  await page
    .locator(".settings-appearance")
    .getByRole("button", { name: "Colour theme" })
    .click();
  await page.getByRole("radio", { name: /Midnight/ }).check();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await expectContrast(page, ".settings-panel");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Colour theme", exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/pm-themes-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("device preference resolves before app JS, and unavailable storage keeps the picker usable", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.addInitScript(() =>
    localStorage.setItem("pm-appearance-v1", "system"),
  );
  await page.route("**/src/main.tsx", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await context.close();
  const blocked = await browser.newContext();
  const blockedPage = await blocked.newPage();
  await blockedPage.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Disabled", "SecurityError");
      },
    });
  });
  await blockedPage.goto("/");
  await blockedPage
    .getByRole("button", { name: "Colour theme", exact: true })
    .click();
  await blockedPage.getByRole("radio", { name: /Forest & Sand/ }).check();
  await expect(blockedPage.getByRole("status")).toContainText(
    "for this session",
  );
  await expect(blockedPage.locator("html")).toHaveAttribute(
    "data-theme",
    "forest",
  );
  await blocked.close();
});
test("offline HTML has the same persistent palettes and its library remains usable in dark mode", async ({
  page,
}) => {
  await page.route("**/offline-themes", (route) =>
    route.fulfill({
      path: resolve("standalone/projectmanager-ai-africa.html"),
      contentType: "text/html",
    }),
  );
  await page.goto("/offline-themes");
  await page
    .getByLabel("Colour theme", { exact: true })
    .selectOption("midnight");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await expectContrast(page, ".panel");
  await page.reload();
  await expect(page.getByLabel("Colour theme", { exact: true })).toHaveValue(
    "midnight",
  );
  await page
    .getByRole("button", { name: "Knowledge Centre", exact: true })
    .click();
  await page.getByRole("button", { name: "Glossary", exact: true }).click();
  await expect(page.locator(".knowledge-card").first()).toBeVisible();
  await expectContrast(page, ".knowledge-card");
});
