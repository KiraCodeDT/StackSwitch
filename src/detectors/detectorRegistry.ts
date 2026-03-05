import type { StackProfile, SignalStore } from "../core/types.js";
import { detectAuth } from "./authDetector.js";
import { detectBackendType } from "./backendTypeDetector.js";
import { detectDatabase } from "./databaseDetector.js";
import { detectDeployment } from "./deploymentDetector.js";
import { detectFramework } from "./frameworkDetector.js";
import { detectStorage } from "./storageDetector.js";

export function runDetectors(store: SignalStore): StackProfile {
  return {
    frontend: detectFramework(store),
    backendType: detectBackendType(store),
    auth: detectAuth(store),
    database: detectDatabase(store),
    storage: detectStorage(store),
    deployment: detectDeployment(store)
  };
}
