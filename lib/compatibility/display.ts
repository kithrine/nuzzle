import type { NormalizedDog } from "@/lib/compatibility/types";

/** User-facing age label. RescueGroups returns "Baby" for puppies; show "Puppy". */
export function formatAgeGroup(ageGroup: NormalizedDog["ageGroup"]): string {
  return ageGroup === "Baby" ? "Puppy" : ageGroup;
}
