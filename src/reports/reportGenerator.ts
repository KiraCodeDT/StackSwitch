import type { AnalysisResult, Detection } from "../core/types.js";

function lineDetection(label: string, detection: Detection<string>): string {
  return `${label}: ${detection.value} (confidence ${detection.confidence.toFixed(2)}, ${detection.tier})`;
}

export function renderSummaryText(result: AnalysisResult): string {
  const lockinTop = Object.entries(result.metrics.platformDependency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, value]) => `${name}: ${value}%`)
    .join(", ");

  return [
    "Repo Summary",
    "",
    lineDetection("Framework", result.stack.frontend),
    lineDetection("Backend", result.stack.backendType),
    lineDetection("Auth", result.stack.auth),
    lineDetection("Database", result.stack.database),
    lineDetection("Storage", result.stack.storage),
    lineDetection("Deployment", result.stack.deployment),
    "",
    `Migration Difficulty: ${result.metrics.migrationDifficulty.value}`,
    `Platform Lock-In: ${lockinTop}`
  ].join("\n");
}

export function renderExplainText(result: AnalysisResult): string {
  const authEvidence = result.stack.auth.evidence.slice(0, 3).map((item) => `${item.value}${item.file ? ` (${item.file})` : ""}`);
  return [
    "Project Explanation",
    "",
    `Framework: ${result.stack.frontend.value}`,
    `Architecture: ${result.stack.backendType.value}`,
    "",
    `Auth: ${result.stack.auth.value}`,
    `Database: ${result.stack.database.value}`,
    `Storage: ${result.stack.storage.value}`,
    "",
    "Key Evidence",
    ...authEvidence.map((item) => `- ${item}`),
    "",
    "Assumptions",
    ...result.assumptions.map((item) => `- ${item.message}`)
  ].join("\n");
}
