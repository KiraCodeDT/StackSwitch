import { resolve } from "node:path";
import type { AnalysisResult, Detection, ParsedFile } from "./types.js";
import { loadConfig } from "../config/loadConfig.js";
import { buildCacheKey, readCache, writeCache } from "../cache/cacheStore.js";
import { scanRepository } from "../scanner/repoScanner.js";
import { parseFileByLanguage } from "../parser/languageParserRegistry.js";
import { extractSignals } from "../signals/signalExtractor.js";
import { createSignalStore } from "../signals/signalStore.js";
import { runDetectors } from "../detectors/detectorRegistry.js";
import { analyzeDependencies } from "../analyzers/dependencyAnalyzer.js";
import { analyzePlatformMetrics } from "../analyzers/platformDependencyAnalyzer.js";

export type PipelineOptions = {
  useCache?: boolean;
};

function applyConfidenceThreshold<T extends string>(
  detection: Detection<T>,
  threshold: number
): Detection<T> {
  if (detection.value === "unknown" || detection.confidence >= threshold) {
    return detection;
  }
  return {
    value: "unknown",
    confidence: detection.confidence,
    tier: "unknown",
    evidence: detection.evidence
  };
}

export function runAnalysis(rootPathInput: string, options: PipelineOptions = {}): AnalysisResult {
  const rootPath = resolve(rootPathInput);
  const config = loadConfig(rootPath);
  const cacheKey = buildCacheKey(rootPath, config);
  if (options.useCache !== false) {
    const cached = readCache(rootPath, cacheKey);
    if (cached) {
      return cached;
    }
  }

  const scan = scanRepository(rootPath, config);
  const parsedFiles: ParsedFile[] = [];
  for (const file of scan.files) {
    const parsed = parseFileByLanguage(file);
    if (parsed) {
      parsedFiles.push(parsed);
    }
    if (parsedFiles.length >= config.limits.maxAstNodes) {
      break;
    }
  }

  const extracted = extractSignals(parsedFiles, scan.files, scan.folders);
  const signalStore = createSignalStore(extracted);
  const rawStack = runDetectors(signalStore);
  const stack = {
    frontend: applyConfidenceThreshold(rawStack.frontend, config.confidenceThreshold),
    backendType: applyConfidenceThreshold(rawStack.backendType, config.confidenceThreshold),
    auth: applyConfidenceThreshold(rawStack.auth, config.confidenceThreshold),
    database: applyConfidenceThreshold(rawStack.database, config.confidenceThreshold),
    storage: applyConfidenceThreshold(rawStack.storage, config.confidenceThreshold),
    deployment: applyConfidenceThreshold(rawStack.deployment, config.confidenceThreshold)
  };
  const dependencies = analyzeDependencies(signalStore, stack);
  const metrics = analyzePlatformMetrics(signalStore);

  const result: AnalysisResult = {
    analysisVersion: "v2",
    rootPath,
    stack,
    dependencies,
    metrics,
    assumptions: [
      { message: "Analysis is static and deterministic; dynamic runtime behaviors are not executed." },
      { message: "Low-confidence detections may be returned as unknown." }
    ]
  };

  writeCache(rootPath, cacheKey, result);
  return result;
}
