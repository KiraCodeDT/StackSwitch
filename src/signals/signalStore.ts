import type { SignalStore } from "../core/types.js";
import type { ExtractedSignals } from "./signalExtractor.js";

export function createSignalStore(extracted: ExtractedSignals): SignalStore {
  return {
    imports: extracted.imports,
    configs: extracted.configs,
    envVars: extracted.envVars,
    folders: extracted.folders,
    sdkCalls: extracted.sdkCalls,
    dependencies: extracted.dependencies
  };
}
