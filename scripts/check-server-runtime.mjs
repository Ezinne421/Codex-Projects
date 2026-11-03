// Compile the actual server graph, then load it with Node rather than the tsx loader.
// This catches production ESM resolution errors that a browser/Bundler check permits.
import {
  mkdtempSync,
  writeFileSync,
  symlinkSync,
  unlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const output = mkdtempSync(join(tmpdir(), "pm-server-runtime-"));
try {
  execFileSync(
    process.execPath,
    [
      resolve("node_modules/typescript/bin/tsc"),
      "-p",
      "tsconfig.server.json",
      "--noEmit",
      "false",
      "--outDir",
      output,
      "--rootDir",
      process.cwd(),
    ],
    { stdio: "inherit" },
  );
  writeFileSync(
    join(output, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  symlinkSync(resolve("node_modules"), join(output, "node_modules"), "dir");
  const env = {
    ...process.env,
    NODE_ENV: "production",
    APP_URL: "https://runtime-check.example.invalid",
    DATA_DIR: join(output, "data"),
  };
  for (const key of [
    "DATABASE_URL",
    "DB_TEST_PGLITE",
    "VERCEL",
    "AI_API_KEY",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
  ])
    delete env[key];
  const entry = pathToFileURL(join(output, "api/index.js")).href;
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const app=(await import(${JSON.stringify(entry)})).default;if(typeof app!=='function')throw Error('Missing Vercel request handler');`,
    ],
    { env, stdio: "inherit", cwd: output },
  );
  console.log("Compiled production server loads successfully in Node.");
} finally {
  try {
    unlinkSync(join(output, "node_modules"));
  } catch {}
  rmSync(output, { recursive: true, force: true });
}
