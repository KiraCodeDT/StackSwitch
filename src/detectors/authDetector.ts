import type { Detection, Evidence, SignalStore } from "../core/types.js";
import { scoredDetection, unknownDetection } from "./confidence.js";

export function detectAuth(store: SignalStore): Detection<string> {
  const supabaseEvidence: Evidence[] = [
    ...store.imports
      .filter((item) => item.source.includes("supabase"))
      .slice(0, 2)
      .map((item) => ({ kind: "import" as const, value: item.source, file: item.file })),
    ...store.sdkCalls
      .filter((call) => call.sdk === "supabase" && call.call.toLowerCase().includes("auth"))
      .slice(0, 2)
      .map((call) => ({ kind: "sdkCall" as const, value: `${call.sdk}.${call.call}`, file: call.file }))
  ];
  if (store.dependencies["@supabase/supabase-js"] || supabaseEvidence.length > 0) {
    if (store.dependencies["@supabase/supabase-js"]) {
      supabaseEvidence.unshift({ kind: "dependency", value: "@supabase/supabase-js", file: "package.json" });
    }
    return scoredDetection("Supabase Auth", supabaseEvidence);
  }

  if (store.dependencies["@clerk/nextjs"] || store.dependencies["@clerk/clerk-js"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "@clerk/*", file: "package.json" }];
    const clerkImport = store.imports.find((item) => item.source.includes("@clerk"));
    if (clerkImport) {
      evidence.push({ kind: "import", value: clerkImport.source, file: clerkImport.file });
    }
    return scoredDetection("Clerk", evidence);
  }
  if (store.dependencies.firebase || store.dependencies["firebase-admin"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "firebase", file: "package.json" }];
    const firebaseAuthImport = store.imports.find((item) => item.source.includes("firebase/auth"));
    if (firebaseAuthImport) {
      evidence.push({ kind: "import", value: firebaseAuthImport.source, file: firebaseAuthImport.file });
    }
    return scoredDetection("Firebase Auth", evidence);
  }
  if (store.dependencies.nextauth || store.dependencies["next-auth"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "next-auth", file: "package.json" }];
    const nextAuthImport = store.imports.find((item) => item.source.includes("next-auth"));
    if (nextAuthImport) {
      evidence.push({ kind: "import", value: nextAuthImport.source, file: nextAuthImport.file });
    }
    return scoredDetection("NextAuth", evidence);
  }
  if (store.dependencies.auth0 || store.dependencies["@auth0/nextjs-auth0"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "auth0", file: "package.json" }];
    const auth0Import = store.imports.find((item) => item.source.includes("auth0"));
    if (auth0Import) {
      evidence.push({ kind: "import", value: auth0Import.source, file: auth0Import.file });
    }
    return scoredDetection("Auth0", evidence);
  }

  return unknownDetection();
}
