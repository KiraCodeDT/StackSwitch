import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AnalysisResult } from "../core/types.js";

type Rule = {
  from: string;
  to: string;
  patterns: string[];
  steps: string[];
};

export type MigrationPlan = {
  from: string;
  to: string;
  affectedFiles: string[];
  affectedModules: number;
  complexity: "low" | "medium" | "high";
  steps: string[];
  assumptions: string[];
};

function loadRules(rootPath: string): Rule[] {
  const rulesDir = join(rootPath, "rules");
  if (!existsSync(rulesDir)) {
    return [];
  }
  const files = readdirSync(rulesDir).filter((file) => file.endsWith(".json"));
  const rules: Rule[] = [];
  for (const file of files) {
    try {
      rules.push(JSON.parse(readFileSync(join(rulesDir, file), "utf8")) as Rule);
    } catch {
      // Ignore malformed rule files to keep command deterministic and resilient.
    }
  }
  return rules;
}

function splitPair(input: string): { target: string; value: string } | null {
  const [target, value] = input.split("=");
  if (!target || !value) {
    return null;
  }
  return { target: target.trim(), value: value.trim() };
}

export function buildMigrationPlan(rootPath: string, analysis: AnalysisResult, targetPair: string): MigrationPlan {
  const parsed = splitPair(targetPair);
  if (!parsed) {
    return {
      from: "unknown",
      to: "unknown",
      affectedFiles: [],
      affectedModules: 0,
      complexity: "low",
      steps: ["Use <key=value> format, e.g. auth=clerk."],
      assumptions: ["Invalid target pair input."]
    };
  }

  const fromValue = parsed.target === "auth" ? analysis.stack.auth.value : "unknown";
  const rules = loadRules(rootPath);
  const matched = rules.find((rule) => rule.from === String(fromValue).toLowerCase().replace(/\s+/g, "-") && rule.to === parsed.value);

  const evidenceFiles = analysis.stack.auth.evidence.map((item) => item.file).filter((file): file is string => Boolean(file));
  const uniqueFiles = [...new Set(evidenceFiles)];

  const complexity = uniqueFiles.length > 20 ? "high" : uniqueFiles.length > 6 ? "medium" : "low";
  return {
    from: String(fromValue),
    to: parsed.value,
    affectedFiles: uniqueFiles,
    affectedModules: Math.max(1, Math.ceil(uniqueFiles.length / 3)),
    complexity,
    steps: matched?.steps ?? [
      "Replace provider SDK client initialization.",
      "Update auth/session provider and middleware.",
      "Update auth hooks and login flows.",
      "Verify callback URLs and environment variables."
    ],
    assumptions: [
      "Plan uses static signals and may miss runtime-only flows.",
      "Effort is estimated from evidence-linked files."
    ]
  };
}
