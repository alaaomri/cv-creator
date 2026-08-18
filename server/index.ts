import "dotenv/config";
import path from "node:path";
import express, { Request, Response } from "express";
import { buildApp } from "./app";

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  const app = buildApp();

  // Vite dev middleware in development; static dist serving in production.
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CV Studio Fullstack] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
