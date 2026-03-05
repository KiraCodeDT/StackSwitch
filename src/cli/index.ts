#!/usr/bin/env node
import { cwd } from "node:process";
import { runExplainCommand } from "../commands/explain.js";
import { runGraphCommand } from "../commands/graph.js";
import { runPlanCommand } from "../commands/plan.js";
import { runSummaryCommand } from "../commands/summary.js";

type CliFlags = {
  json: boolean;
  path: string;
  format: "dot" | "svg";
  out?: string;
};

function parseFlags(args: string[]): CliFlags {
  const json = args.includes("--json");
  const pathIndex = args.indexOf("--path");
  const formatIndex = args.indexOf("--format");
  const outIndex = args.indexOf("--out");

  return {
    json,
    path: pathIndex >= 0 ? (args[pathIndex + 1] ?? cwd()) : cwd(),
    format: (formatIndex >= 0 ? args[formatIndex + 1] : "dot") as "dot" | "svg",
    out: outIndex >= 0 ? args[outIndex + 1] : undefined
  };
}

function printHelp(): void {
  const help = [
    "StackSwitch",
    "",
    "Usage:",
    "  stack-switch [summary] [--path <repo>] [--json]",
    "  stack-switch explain [--path <repo>] [--json]",
    "  stack-switch graph [--path <repo>] [--format dot|svg] [--out file] [--json]",
    "  stack-switch plan <targetPair> [--path <repo>] [--json]",
    "",
    "Examples:",
    "  stack-switch",
    "  stack-switch summary --json",
    "  stack-switch explain --path ../my-repo",
    "  stack-switch graph --format svg --out architecture.svg",
    "  stack-switch plan auth=clerk --json"
  ];
  console.log(help.join("\n"));
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] && !args[0].startsWith("--") ? args[0] : "summary";
  const flags = parseFlags(args);

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "summary") {
    console.log(runSummaryCommand(flags.path, flags.json));
    return;
  }
  if (command === "explain") {
    console.log(runExplainCommand(flags.path, flags.json));
    return;
  }
  if (command === "graph") {
    console.log(runGraphCommand(flags.path, flags.json, flags.format, flags.out));
    return;
  }
  if (command === "plan") {
    const targetPair = args.find((item) => item.includes("=")) ?? "";
    console.log(runPlanCommand(flags.path, targetPair, flags.json));
    return;
  }

  // Default invocation aliases to summary.
  if (!["summary", "explain", "graph", "plan"].includes(command)) {
    console.log(runSummaryCommand(flags.path, flags.json));
  }
}

main();
