import type { Detection, SignalStore } from "../core/types.js";
import { scoredDetection, unknownDetection } from "./confidence.js";

export function detectDeployment(store: SignalStore): Detection<string> {
  const configNames = new Set(store.configs.map((item) => item.name));
  if (configNames.has("vercel.json") || store.envVars.some((item) => item.key.includes("VERCEL"))) {
    return scoredDetection("Vercel", [
      { kind: "config", value: "vercel.json", file: "vercel.json" },
      { kind: "file", value: "vercel.json", file: "vercel.json" }
    ]);
  }
  if (configNames.has("netlify.toml") || store.envVars.some((item) => item.key.includes("NETLIFY"))) {
    return scoredDetection("Netlify", [
      { kind: "config", value: "netlify.toml", file: "netlify.toml" },
      { kind: "file", value: "netlify.toml", file: "netlify.toml" }
    ]);
  }
  if (store.configs.some((item) => item.name.toLowerCase() === "dockerfile")) {
    return scoredDetection("Docker", [
      { kind: "config", value: "Dockerfile", file: "Dockerfile" },
      { kind: "file", value: "Dockerfile", file: "Dockerfile" }
    ]);
  }
  if (store.envVars.some((item) => item.key.includes("RAILWAY"))) {
    return scoredDetection("Railway", [{ kind: "env", value: "RAILWAY_*" }]);
  }
  if (store.envVars.some((item) => item.key.includes("FLY_"))) {
    return scoredDetection("Fly.io", [{ kind: "env", value: "FLY_*" }]);
  }
  return unknownDetection();
}
