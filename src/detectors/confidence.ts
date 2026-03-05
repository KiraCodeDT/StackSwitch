import type { ConfidenceTier, Detection, Evidence } from "../core/types.js";

export function unknownDetection<T extends string>(): Detection<T> {
  return { value: "unknown", confidence: 0, tier: "unknown", evidence: [] };
}

const KIND_WEIGHTS: Record<Evidence["kind"], number> = {
  sdkCall: 0.48,
  import: 0.36,
  dependency: 0.32,
  config: 0.28,
  env: 0.22,
  file: 0.2,
  folder: 0.15
};

export function scoredDetection<T extends string>(value: T, evidence: Evidence[]): Detection<T> {
  const deduped = new Map<string, Evidence>();
  for (const item of evidence) {
    const key = `${item.kind}:${item.value}:${item.file ?? ""}`;
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }

  const kindCounts: Partial<Record<Evidence["kind"], number>> = {};
  let score = 0.05;
  for (const item of deduped.values()) {
    const count = (kindCounts[item.kind] ?? 0) + 1;
    kindCounts[item.kind] = count;
    const diminishingFactor = count === 1 ? 1 : 0.55;
    score += KIND_WEIGHTS[item.kind] * diminishingFactor;
  }

  const uniqueKinds = Object.keys(kindCounts).length;
  if (uniqueKinds > 1) {
    score += 0.08 * (uniqueKinds - 1);
  }

  const confidence = Math.min(0.99, score);
  let tier: ConfidenceTier = "low";
  if (confidence >= 0.82) {
    tier = "high";
  } else if (confidence >= 0.62) {
    tier = "medium";
  }
  return { value, confidence, tier, evidence: [...deduped.values()] };
}
