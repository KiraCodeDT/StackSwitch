import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AnalysisConfig } from "../core/types.js";

const DEFAULT_CONFIG: AnalysisConfig = {
  ignore: ["node_modules", "dist", "build", "coverage", ".git"],
  confidenceThreshold: 0.6,
  limits: {
    maxFiles: 5000,
    maxAstNodes: 1_000_000,
    scanTimeoutMs: 8000
  }
};

export function loadConfig(rootPath: string): AnalysisConfig {
  const configPath = join(rootPath, "stackswitch.config.json");
  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = JSON.parse(readFileSync(configPath, "utf8")) as Partial<AnalysisConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...raw,
      limits: {
        ...DEFAULT_CONFIG.limits,
        ...(raw.limits ?? {})
      }
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export { DEFAULT_CONFIG };
