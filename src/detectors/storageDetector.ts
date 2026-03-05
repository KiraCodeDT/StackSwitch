import type { Detection, Evidence, SignalStore } from "../core/types.js";
import { scoredDetection, unknownDetection } from "./confidence.js";

export function detectStorage(store: SignalStore): Detection<string> {
  if (store.dependencies["@supabase/storage-js"]) {
    return scoredDetection("Supabase Storage", [{ kind: "dependency", value: "@supabase/storage-js", file: "package.json" }]);
  }
  const supabaseStorageCall = store.sdkCalls.find(
    (item) => item.sdk === "supabase" && item.call.toLowerCase().includes("storage")
  );
  if (supabaseStorageCall) {
    return scoredDetection("Supabase Storage", [
      { kind: "sdkCall", value: `${supabaseStorageCall.sdk}.${supabaseStorageCall.call}`, file: supabaseStorageCall.file }
    ]);
  }
  if (store.dependencies["@aws-sdk/client-s3"]) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "@aws-sdk/client-s3", file: "package.json" }];
    const s3Import = store.imports.find((item) => item.source === "@aws-sdk/client-s3");
    if (s3Import) {
      evidence.push({ kind: "import", value: s3Import.source, file: s3Import.file });
    }
    return scoredDetection("AWS S3", evidence);
  }
  if (store.dependencies.cloudinary) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "cloudinary", file: "package.json" }];
    const cloudinaryImport = store.imports.find((item) => item.source === "cloudinary");
    if (cloudinaryImport) {
      evidence.push({ kind: "import", value: cloudinaryImport.source, file: cloudinaryImport.file });
    }
    return scoredDetection("Cloudinary", evidence);
  }
  if (store.dependencies.firebase) {
    const evidence: Evidence[] = [{ kind: "dependency", value: "firebase", file: "package.json" }];
    const firebaseImport = store.imports.find((item) => item.source.includes("firebase/storage"));
    if (firebaseImport) {
      evidence.push({ kind: "import", value: firebaseImport.source, file: firebaseImport.file });
    }
    return scoredDetection("Firebase Storage", evidence);
  }
  return unknownDetection();
}
