import type { Detection, EngineeringMetrics, SignalStore } from "../core/types.js";

function computePlatformPercentages(store: SignalStore): Record<string, number> {
  const counts: Record<string, number> = { Supabase: 0, Firebase: 0, Stripe: 0, OpenAI: 0, Other: 0 };
  for (const dep of Object.keys(store.dependencies)) {
    if (dep.includes("supabase")) {
      counts.Supabase += 1;
    } else if (dep.includes("firebase")) {
      counts.Firebase += 1;
    } else if (dep.includes("stripe")) {
      counts.Stripe += 1;
    } else if (dep.includes("openai")) {
      counts.OpenAI += 1;
    } else {
      counts.Other += 1;
    }
  }
  const total = Math.max(1, Object.values(counts).reduce((sum, value) => sum + value, 0));
  return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, Math.round((value / total) * 100)]));
}

function difficultyFromLockin(platformDependency: Record<string, number>): Detection<"low" | "medium" | "high"> {
  const max = Math.max(...Object.values(platformDependency), 0);
  if (max >= 70) {
    return {
      value: "high",
      confidence: 0.85,
      tier: "high",
      evidence: [{ kind: "dependency", value: "single vendor dominates dependencies", file: "package.json" }]
    };
  }
  if (max >= 40) {
    return {
      value: "medium",
      confidence: 0.7,
      tier: "medium",
      evidence: [{ kind: "dependency", value: "moderate vendor concentration", file: "package.json" }]
    };
  }
  return {
    value: "low",
    confidence: 0.62,
    tier: "medium",
    evidence: [{ kind: "dependency", value: "low vendor concentration", file: "package.json" }]
  };
}

export function analyzePlatformMetrics(store: SignalStore): EngineeringMetrics {
  const platformDependency = computePlatformPercentages(store);
  return {
    platformDependency,
    migrationDifficulty: difficultyFromLockin(platformDependency)
  };
}
