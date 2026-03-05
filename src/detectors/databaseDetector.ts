import type { Detection, Evidence, SignalStore } from "../core/types.js";
import { scoredDetection, unknownDetection } from "./confidence.js";

export function detectDatabase(store: SignalStore): Detection<string> {
  if (store.dependencies["@supabase/supabase-js"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "@supabase/supabase-js", file: "package.json" }];
    const dbCall = store.sdkCalls.find((item) => item.sdk === "supabase" && ["from", "rpc", "schema"].includes(item.call));
    if (dbCall) {
      evidence.push({ kind: "sdkCall", value: `${dbCall.sdk}.${dbCall.call}`, file: dbCall.file });
    }
    if (evidence.length > 1) {
      return scoredDetection("Supabase Postgres", evidence);
    }
  }
  if (store.dependencies.pg || store.dependencies.postgres) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "pg|postgres", file: "package.json" }];
    const pgImport = store.imports.find((item) => item.source === "pg" || item.source === "postgres");
    if (pgImport) {
      evidence.push({ kind: "import", value: pgImport.source, file: pgImport.file });
    }
    return scoredDetection("PostgreSQL", evidence);
  }
  if (store.dependencies.mongodb || store.dependencies.mongoose) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "mongodb|mongoose", file: "package.json" }];
    const mongoImport = store.imports.find((item) => item.source === "mongodb" || item.source === "mongoose");
    if (mongoImport) {
      evidence.push({ kind: "import", value: mongoImport.source, file: mongoImport.file });
    }
    return scoredDetection("MongoDB", evidence);
  }
  if (store.dependencies.mysql || store.dependencies.mysql2) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "mysql|mysql2", file: "package.json" }];
    const mysqlImport = store.imports.find((item) => item.source === "mysql" || item.source === "mysql2");
    if (mysqlImport) {
      evidence.push({ kind: "import", value: mysqlImport.source, file: mysqlImport.file });
    }
    return scoredDetection("MySQL", evidence);
  }
  return unknownDetection();
}
