// Generate the inline template engine from the shared TypeScript source.
import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
const path = "standalone/projectmanager-ai-africa.html";
const compiled = ts.transpileModule(
  readFileSync("shared/templates.ts", "utf8"),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
  },
).outputText;
const script =
  '<script id="management-template-engine">\n(()=>{const exports={};\n' +
  compiled.replace(/<\/script/gi, "<\\/script") +
  "\nwindow.PMTemplates=exports;})();\n</script>";
let html = readFileSync(path, "utf8");
if (html.includes('<script id="management-template-engine">'))
  html = html.replace(
    /<script id="management-template-engine">[\s\S]*?<\/script>/,
    () => script,
  );
else
  html = html.replace(
    "<script>\n'use strict';",
    script + "\n<script>\n'use strict';",
  );
writeFileSync(path, html);
