import type { Detection, Evidence, SignalStore } from "../core/types.js";
import { scoredDetection, unknownDetection } from "./confidence.js";

export function detectBackendType(store: SignalStore): Detection<string> {
  if (store.dependencies["@supabase/supabase-js"] || store.dependencies.firebase) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "@supabase/supabase-js|firebase", file: "package.json" }];
    const baasSdkCall = store.sdkCalls.find((item) => item.sdk === "supabase" || item.sdk === "firebase");
    if (baasSdkCall) {
      evidence.push({ kind: "sdkCall", value: `${baasSdkCall.sdk}.${baasSdkCall.call}`, file: baasSdkCall.file });
    }
    return scoredDetection("Backend-as-a-Service", evidence);
  }
  if (store.dependencies.express || store.dependencies.fastify || store.dependencies.koa) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "express|fastify|koa", file: "package.json" }];
    const serverFile = store.folders.find((item) => item.folder.includes("server") || item.folder.includes("api"));
    if (serverFile) {
      evidence.push({ kind: "folder", value: serverFile.folder });
    }
    return scoredDetection("Custom Backend", evidence);
  }
  if (store.dependencies["@vercel/node"] || store.dependencies["serverless"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "serverless", file: "package.json" }];
    const serverlessConfig = store.configs.find(
      (item) => item.name.includes("serverless") || item.name === "vercel.json"
    );
    if (serverlessConfig) {
      evidence.push({ kind: "config", value: serverlessConfig.name, file: serverlessConfig.file });
    }
    return scoredDetection("Serverless Backend", evidence);
  }
  return unknownDetection();
}
