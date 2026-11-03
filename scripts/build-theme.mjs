import { build } from "esbuild";
await build({
  entryPoints: ["src/theme.ts"],
  bundle: true,
  outfile: "public/assets/theme-init.js",
  platform: "browser",
  format: "iife",
  target: "es2020",
  minify: true,
});
