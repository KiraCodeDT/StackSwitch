import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { AnalysisConfig } from "../core/types.js";

export type ScanResult = {
  files: string[];
  folders: string[];
};

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".env"]);

export function scanRepository(rootPath: string, config: AnalysisConfig): ScanResult {
  const start = Date.now();
  const files: string[] = [];
  const folders = new Set<string>();

  function walk(dir: string): void {
    if (Date.now() - start > config.limits.scanTimeoutMs || files.length >= config.limits.maxFiles) {
      return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(rootPath, fullPath);
      const top = relPath.split("/")[0] ?? relPath;

      if (config.ignore.includes(top) || config.ignore.includes(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        folders.add(relPath);
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = entry.name.includes(".") ? `.${entry.name.split(".").pop()}` : "";
      if (CODE_EXTENSIONS.has(extension) || entry.name === "package.json" || entry.name.startsWith(".env")) {
        files.push(fullPath);
      }
    }
  }

  if (statSync(rootPath).isDirectory()) {
    walk(rootPath);
  }

  return { files, folders: [...folders] };
}
