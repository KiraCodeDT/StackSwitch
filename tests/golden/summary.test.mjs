import test from "node:test";
import assert from "node:assert/strict";
import { runAnalysis } from "../../dist/core/pipeline.js";

test("detects Next.js + Supabase fixture", () => {
  const result = runAnalysis("fixtures/nextjs-supabase", { useCache: false });
  assert.equal(result.stack.frontend.value, "Next.js");
  assert.equal(result.stack.auth.value, "Supabase Auth");
});

test("detects React + Postgres fixture", () => {
  const result = runAnalysis("fixtures/react-node-postgres", { useCache: false });
  assert.equal(result.stack.frontend.value, "React");
  assert.equal(result.stack.database.value, "PostgreSQL");
});

test("detects Vue + Firebase fixture", () => {
  const result = runAnalysis("fixtures/vue-firebase", { useCache: false });
  assert.equal(result.stack.frontend.value, "Vue");
  assert.equal(result.stack.auth.value, "Firebase Auth");
});
