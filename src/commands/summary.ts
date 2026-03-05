import { runAnalysis } from "../core/pipeline.js";
import { renderSummaryText } from "../reports/reportGenerator.js";

export function runSummaryCommand(pathArg: string, json: boolean): string {
  const result = runAnalysis(pathArg);
  if (json) {
    return JSON.stringify(result, null, 2);
  }
  return renderSummaryText(result);
}
