import { app } from "./app.js";
import express from "express";
import { resolve } from "node:path";
const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV === "production") {
  if (!process.env.APP_URL?.startsWith("https://"))
    throw new Error("Production requires an HTTPS APP_URL");
  app.use(express.static(resolve("dist")));
  app.get("/{*path}", (_req, res) => res.sendFile(resolve("dist/index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Next Mile listening on port ${port}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(() => process.exit(0)));
