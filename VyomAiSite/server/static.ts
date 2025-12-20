import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const rootDir = process.cwd();
  const distPath = path.resolve(rootDir, "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    // Fallback for some environments or local dev builds
    const localDistPath = path.resolve(rootDir, "public");
    if (fs.existsSync(localDistPath)) {
      app.use(express.static(localDistPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(localDistPath, "index.html"));
      });
      return;
    }

    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
