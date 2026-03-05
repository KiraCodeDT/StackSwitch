import type { DependencyMap, SignalStore, StackProfile } from "../core/types.js";

const TECH_BUCKETS: Record<string, string[]> = {
  Supabase: ["@supabase/supabase-js", "@supabase/storage-js"],
  Firebase: ["firebase", "firebase-admin"],
  Clerk: ["@clerk/nextjs", "@clerk/clerk-js"],
  Stripe: ["stripe", "@stripe/stripe-js"],
  OpenAI: ["openai"]
};

export function analyzeDependencies(store: SignalStore, stack: StackProfile): DependencyMap {
  const map: DependencyMap = {};
  for (const [platform, dependencies] of Object.entries(TECH_BUCKETS)) {
    const matched = dependencies.filter((dep) => dep in store.dependencies);
    if (matched.length > 0) {
      map[platform] = matched;
    }
  }

  if (stack.frontend.value !== "unknown") {
    map[stack.frontend.value] = map[stack.frontend.value] ?? [];
  }
  return map;
}
