export type ConfidenceTier = "high" | "medium" | "low" | "unknown";

export type Evidence = {
  kind: "import" | "dependency" | "config" | "env" | "folder" | "sdkCall" | "file";
  value: string;
  file?: string;
};

export type Detection<T> = {
  value: T | "unknown";
  confidence: number;
  tier: ConfidenceTier;
  evidence: Evidence[];
};

export type StackProfile = {
  frontend: Detection<string>;
  backendType: Detection<string>;
  auth: Detection<string>;
  database: Detection<string>;
  storage: Detection<string>;
  deployment: Detection<string>;
};

export type DependencyMap = Record<string, string[]>;

export type EngineeringMetrics = {
  platformDependency: Record<string, number>;
  migrationDifficulty: Detection<"low" | "medium" | "high">;
};

export type ImportSignal = { source: string; file: string };
export type ConfigSignal = { name: string; file: string };
export type EnvSignal = { key: string; file: string };
export type FolderSignal = { folder: string };
export type SdkCallSignal = { sdk: string; call: string; file: string };

export type SignalStore = {
  imports: ImportSignal[];
  configs: ConfigSignal[];
  envVars: EnvSignal[];
  folders: FolderSignal[];
  sdkCalls: SdkCallSignal[];
  dependencies: Record<string, string>;
};

export type Assumption = {
  message: string;
};

export type AnalysisResult = {
  analysisVersion: string;
  rootPath: string;
  stack: StackProfile;
  dependencies: DependencyMap;
  metrics: EngineeringMetrics;
  assumptions: Assumption[];
};

export type AnalysisConfig = {
  ignore: string[];
  confidenceThreshold: number;
  limits: {
    maxFiles: number;
    maxAstNodes: number;
    scanTimeoutMs: number;
  };
};

export type ParsedFile = {
  file: string;
  imports: string[];
  envKeys: string[];
  sdkCalls: { sdk: string; call: string }[];
};
