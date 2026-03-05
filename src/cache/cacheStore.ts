import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import type { AnalysisConfig, AnalysisResult } from "../core/types.js";

const CACHE_DIR = ".cache/stackswitch";

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function safeGitHead(rootPath: string): string | null {
  try {
    return execSync("git rev-parse HEAD", { cwd: rootPath, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return null;
  }
}

export function buildCacheKey(rootPath: string, config: AnalysisConfig): string {
  const gitHead = safeGitHead(rootPath);
  const configHash = hashValue(JSON.stringify(config));
  if (gitHead) {
    return `${gitHead}_${configHash}`;
  }
  return `nogit_${hashValue(`${rootPath}:${configHash}`)}`;
}

export function readCache(rootPath: string, key: string): AnalysisResult | null {
  const file = join(rootPath, CACHE_DIR, `${key}.json`);
  if (!existsSync(file)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8")) as AnalysisResult;
  } catch {
    return null;
  }
}

export function writeCache(rootPath: string, key: string, result: AnalysisResult): void {
  const dir = join(rootPath, CACHE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${key}.json`), JSON.stringify(result, null, 2), "utf8");
}
