import type { CompatibilityResult } from "@/lib/compatibility/types";

export type CardCompatibility =
  | { available: false; teaser: string }
  | { available: true; result: CompatibilityResult };

// Adapts the search API's per-result shape (a CompatibilityResult plus a
// top-level `available` flag) into the discriminated union DogCard expects.
export function toCardCompatibility(
  result: CompatibilityResult | undefined,
  available: boolean,
  teaser: string,
): CardCompatibility {
  if (available && result) return { available: true, result };
  return { available: false, teaser };
}
