import type { Detection, SignalStore } from "../core/types.js";
import { scoredDetection, unknownDetection } from "./confidence.js";

export function detectFramework(store: SignalStore): Detection<string> {
  const evidence = [];
  const hasFrontendFolder = store.folders.some(
    (item) => item.folder === "src" || item.folder === "app" || item.folder === "pages"
  );
  if (store.dependencies.next || store.imports.some((item) => item.source.startsWith("next/"))) {
    evidence.push(
      { kind: "dependency" as const, value: "next", file: "package.json" },
      ...store.imports
        .filter((item) => item.source.startsWith("next/"))
        .slice(0, 2)
        .map((item) => ({ kind: "import" as const, value: item.source, file: item.file }))
    );
    if (hasFrontendFolder) {
      evidence.push({ kind: "folder" as const, value: "src|app|pages" });
    }
    return scoredDetection("Next.js", evidence);
  }

  if (store.dependencies.react) {
    evidence.push({ kind: "dependency" as const, value: "react", file: "package.json" });
    const reactImport = store.imports.find((item) => item.source === "react");
    if (reactImport) {
      evidence.push({ kind: "import" as const, value: "react", file: reactImport.file });
    } else if (hasFrontendFolder) {
      evidence.push({ kind: "folder" as const, value: "src|app|pages" });
    }
    return scoredDetection("React", evidence);
  }

  if (store.dependencies.vue) {
    evidence.push({ kind: "dependency" as const, value: "vue", file: "package.json" });
    const vueImport = store.imports.find((item) => item.source === "vue");
    if (vueImport) {
      evidence.push({ kind: "import" as const, value: "vue", file: vueImport.file });
    } else if (hasFrontendFolder) {
      evidence.push({ kind: "folder" as const, value: "src|app|pages" });
    }
    return scoredDetection("Vue", evidence);
  }

  if (store.dependencies.svelte) {
    evidence.push({ kind: "dependency" as const, value: "svelte", file: "package.json" });
    const svelteImport = store.imports.find((item) => item.source === "svelte");
    if (svelteImport) {
      evidence.push({ kind: "import" as const, value: "svelte", file: svelteImport.file });
    } else if (hasFrontendFolder) {
      evidence.push({ kind: "folder" as const, value: "src|app|pages" });
    }
    return scoredDetection("Svelte", evidence);
  }

  return unknownDetection();
}
