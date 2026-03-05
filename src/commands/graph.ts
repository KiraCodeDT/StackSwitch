import { runAnalysis } from "../core/pipeline.js";
import { generateDotGraph, generateSvgPlaceholder, writeGraphFile } from "../graphs/graphGenerator.js";

type GraphFormat = "dot" | "svg";

export function runGraphCommand(pathArg: string, json: boolean, format: GraphFormat, outputName?: string): string {
  const result = runAnalysis(pathArg);
  const filename = outputName ?? `architecture.${format}`;
  const content = format === "svg" ? generateSvgPlaceholder(result) : generateDotGraph(result);
  const outputPath = writeGraphFile(pathArg, content, filename);

  if (json) {
    return JSON.stringify({ format, outputPath, stack: result.stack }, null, 2);
  }

  return [
    "Architecture Graph",
    "",
    `Format: ${format}`,
    `Output: ${outputPath}`
  ].join("\n");
}
