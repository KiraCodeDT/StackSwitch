import { runAnalysis } from "../core/pipeline.js";
import { renderExplainText } from "../reports/reportGenerator.js";

export function runExplainCommand(pathArg: string, json: boolean): string {
  const result = runAnalysis(pathArg);
  if (json) {
    return JSON.stringify(result, null, 2);
  }
  return renderExplainText(result);
}
