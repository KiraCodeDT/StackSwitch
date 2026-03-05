import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { AnalysisResult } from "../core/types.js";

function escapeNodeLabel(value: string): string {
  return value.replaceAll("\"", "\\\"");
}

export function generateDotGraph(analysis: AnalysisResult): string {
  const lines: string[] = ["digraph StackSwitch {"];
  lines.push('  rankdir="LR";');
  lines.push('  "Project" -> "Frontend";');
  lines.push(`  "Frontend" [label="${escapeNodeLabel(String(analysis.stack.frontend.value))}"];`);
  lines.push(`  "Auth" [label="${escapeNodeLabel(String(analysis.stack.auth.value))}"];`);
  lines.push(`  "Database" [label="${escapeNodeLabel(String(analysis.stack.database.value))}"];`);
  lines.push(`  "Storage" [label="${escapeNodeLabel(String(analysis.stack.storage.value))}"];`);
  lines.push(`  "Deployment" [label="${escapeNodeLabel(String(analysis.stack.deployment.value))}"];`);
  lines.push('  "Project" -> "Auth";');
  lines.push('  "Project" -> "Database";');
  lines.push('  "Project" -> "Storage";');
  lines.push('  "Project" -> "Deployment";');
  lines.push("}");
  return lines.join("\n");
}

export function generateSvgPlaceholder(analysis: AnalysisResult): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="860" height="220">',
    '  <rect width="100%" height="100%" fill="white" />',
    '  <text x="20" y="40" font-family="monospace" font-size="18">StackSwitch Architecture</text>',
    `  <text x="20" y="80" font-family="monospace" font-size="14">Frontend: ${analysis.stack.frontend.value}</text>`,
    `  <text x="20" y="110" font-family="monospace" font-size="14">Auth: ${analysis.stack.auth.value}</text>`,
    `  <text x="20" y="140" font-family="monospace" font-size="14">Database: ${analysis.stack.database.value}</text>`,
    `  <text x="20" y="170" font-family="monospace" font-size="14">Storage: ${analysis.stack.storage.value}</text>`,
    `  <text x="20" y="200" font-family="monospace" font-size="14">Deployment: ${analysis.stack.deployment.value}</text>`,
    "</svg>"
  ].join("\n");
}

export function writeGraphFile(rootPath: string, content: string, filename: string): string {
  const outputPath = join(rootPath, filename);
  writeFileSync(outputPath, content, "utf8");
  return outputPath;
}
