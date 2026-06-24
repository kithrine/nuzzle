import type { NormalizedDog } from "@/lib/compatibility/types";

/** User-facing age label. RescueGroups returns "Baby" for puppies; show "Puppy". */
export function formatAgeGroup(ageGroup: NormalizedDog["ageGroup"]): string {
  return ageGroup === "Baby" ? "Puppy" : ageGroup;
}

/** Human-readable dog count for result headers — "No dogs" / "1 dog" / "24 dogs"
 *  (thousands separators preserved). Fixes the "1 dogs" pluralization bug. */
export function formatDogCount(count: number): string {
  if (count === 0) return "No dogs";
  return `${count.toLocaleString()} dog${count === 1 ? "" : "s"}`;
}
