import { runAnalysis } from "../core/pipeline.js";
import { buildMigrationPlan } from "../planners/migrationPlanner.js";

export function runPlanCommand(pathArg: string, targetPair: string, json: boolean): string {
  const analysis = runAnalysis(pathArg);
  const plan = buildMigrationPlan(pathArg, analysis, targetPair);
  if (json) {
    return JSON.stringify(plan, null, 2);
  }

  return [
    "Migration Plan",
    "",
    `${plan.from} -> ${plan.to}`,
    `Affected Files: ${plan.affectedFiles.length}`,
    `Affected Modules: ${plan.affectedModules}`,
    `Complexity: ${plan.complexity}`,
    "",
    "Steps:",
    ...plan.steps.map((step, index) => `${index + 1}. ${step}`)
  ].join("\n");
}
