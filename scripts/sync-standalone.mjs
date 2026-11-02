// Generate the inline template engine from the shared TypeScript source.
import ts from "typescript";
import { build } from "esbuild";
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
const bundle = await build({
  entryPoints: ["shared/knowledge/browser.ts"],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "PMKnowledge",
  platform: "browser",
  target: "es2020",
});
const knowledgeScript =
  '<script id="knowledge-engine">\n' +
  bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script") +
  "\n</script>";
const interfaceScript =
  '<script id="knowledge-interface">\n' +
  readFileSync("scripts/standalone-knowledge.js", "utf8").replace(
    /<\/script/gi,
    "<\\/script",
  ) +
  "\n</script>";
for (const [id, script] of [
  ["knowledge-engine", knowledgeScript],
  ["knowledge-interface", interfaceScript],
]) {
  const pattern = new RegExp('<script id="' + id + '">[\\s\\S]*?<\\/script>');
  if (pattern.test(html)) html = html.replace(pattern, () => script);
  else
    html = html.replace(
      "<script>\n'use strict';",
      () => script + "\n<script>\n'use strict';",
    );
}
const styles =
  '<style id="knowledge-styles">' +
  readFileSync("src/knowledge.css", "utf8") +
  "\nheader .buttons{flex-shrink:0}@media(max-width:600px){header{height:auto;min-height:80px;flex-wrap:wrap;padding:15px 20px}header .buttons{flex-wrap:wrap}}\n</style>";
if (html.includes('<style id="knowledge-styles">'))
  html = html.replace(
    /<style id="knowledge-styles">[\s\S]*?<\/style>/,
    () => styles,
  );
else html = html.replace("</head>", () => styles + "\n</head>");
writeFileSync(path, html);
