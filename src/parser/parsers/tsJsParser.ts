import { readFileSync } from "node:fs";
import type { ParsedFile } from "../../core/types.js";

const IMPORT_REGEX = /import\s+[^'"]*['"]([^'"]+)['"]/g;
const REQUIRE_REGEX = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
const ENV_REGEX = /process\.env\.([A-Z0-9_]+)/g;
const SDK_CALL_REGEX = /\b(supabase|firebase|clerk|auth0|stripe|openai)\.([a-zA-Z0-9_]+)/g;

export function parseTsJsFile(filePath: string): ParsedFile {
  const content = readFileSync(filePath, "utf8");
  const imports = new Set<string>();
  const envKeys = new Set<string>();
  const sdkCalls: ParsedFile["sdkCalls"] = [];

  for (const match of content.matchAll(IMPORT_REGEX)) {
    imports.add(match[1]);
  }
  for (const match of content.matchAll(REQUIRE_REGEX)) {
    imports.add(match[1]);
  }
  for (const match of content.matchAll(ENV_REGEX)) {
    envKeys.add(match[1]);
  }
  for (const match of content.matchAll(SDK_CALL_REGEX)) {
    sdkCalls.push({ sdk: match[1], call: match[2] });
  }

  return {
    file: filePath,
    imports: [...imports],
    envKeys: [...envKeys],
    sdkCalls
  };
}
