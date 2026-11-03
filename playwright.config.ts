import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 90000,
  workers: 1,
  use: {
    actionTimeout: 15000,
    baseURL: "http://127.0.0.1:3100",
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "PORT=3100 APP_URL=http://127.0.0.1:3100 DATA_DIR=/tmp/pm-browser-test npm run dev",
    url: "http://127.0.0.1:3100/api/health",
    reuseExistingServer: false,
  },
  reporter: "list",
});
