import { extname } from "node:path";
import type { ParsedFile } from "../core/types.js";
import { parseTsJsFile } from "./parsers/tsJsParser.js";

export type FileParser = (filePath: string) => ParsedFile;

const registry = new Map<string, FileParser>([
  [".ts", parseTsJsFile],
  [".tsx", parseTsJsFile],
  [".js", parseTsJsFile],
  [".jsx", parseTsJsFile],
  [".mjs", parseTsJsFile],
  [".cjs", parseTsJsFile]
]);

export function parseFileByLanguage(filePath: string): ParsedFile | null {
  const parser = registry.get(extname(filePath));
  if (!parser) {
    return null;
  }
  return parser(filePath);
}
