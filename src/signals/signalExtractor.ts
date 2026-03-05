import { basename } from "node:path";
import { readFileSync } from "node:fs";
import type {
  ConfigSignal,
  FolderSignal,
  ImportSignal,
  ParsedFile,
  SdkCallSignal,
  EnvSignal
} from "../core/types.js";

export type ExtractedSignals = {
  imports: ImportSignal[];
  envVars: EnvSignal[];
  sdkCalls: SdkCallSignal[];
  configs: ConfigSignal[];
  folders: FolderSignal[];
  dependencies: Record<string, string>;
};

function extractDependencies(files: string[]): Record<string, string> {
  const packageJson = files.find((file) => basename(file) === "package.json");
  if (!packageJson) {
    return {};
  }
  try {
    const parsed = JSON.parse(readFileSync(packageJson, "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return {
      ...(parsed.dependencies ?? {}),
      ...(parsed.devDependencies ?? {})
    };
  } catch {
    return {};
  }
}

export function extractSignals(parsedFiles: ParsedFile[], files: string[], folders: string[]): ExtractedSignals {
  const imports: ImportSignal[] = [];
  const envVars: EnvSignal[] = [];
  const sdkCalls: SdkCallSignal[] = [];
  const configs: ConfigSignal[] = [];
  const folderSignals: FolderSignal[] = folders.map((folder) => ({ folder }));

  for (const file of files) {
    const name = basename(file);
    if (
      name === "package.json" ||
      name.endsWith(".config.ts") ||
      name.endsWith(".config.js") ||
      name === ".env" ||
      name.startsWith(".env.")
    ) {
      configs.push({ name, file });
    }
  }

  for (const parsed of parsedFiles) {
    for (const value of parsed.imports) {
      imports.push({ source: value, file: parsed.file });
    }
    for (const key of parsed.envKeys) {
      envVars.push({ key, file: parsed.file });
    }
    for (const call of parsed.sdkCalls) {
      sdkCalls.push({ sdk: call.sdk, call: call.call, file: parsed.file });
    }
  }

  return {
    imports,
    envVars,
    sdkCalls,
    configs,
    folders: folderSignals,
    dependencies: extractDependencies(files)
  };
}
