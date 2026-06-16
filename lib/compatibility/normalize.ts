import type { NormalizedDog } from "@/lib/compatibility/types";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";

// Sets are typed as Set<string> so .has() accepts any incoming string without
// TypeScript narrowing errors. The cast to the specific union happens at the
// return site where we've already confirmed membership.
const AGE_GROUPS = new Set<string>(["Baby", "Young", "Adult", "Senior"]);
const SIZE_GROUPS = new Set<string>(["Small", "Medium", "Large", "X-Large"]);
const ENERGY_LEVELS = new Set<string>(["Low", "Moderate", "High"]);
const FENCE_NEEDS = new Set<string>([
  "Not required",
  "Any type",
  "3 foot",
  "6 foot",
]);
const OWNER_EXPERIENCE = new Set<string>(["None", "Species", "Breed"]);

type AgeGroup = NormalizedDog["ageGroup"];
type SizeGroup = NormalizedDog["sizeGroup"];
type EnergyLevel = NormalizedDog["energyLevel"];
type FenceNeeds = NormalizedDog["fenceNeeds"];
type OwnerExperience = NormalizedDog["ownerExperience"];

function toAgeGroup(v: string | null | undefined): AgeGroup {
  return v != null && AGE_GROUPS.has(v) ? (v as AgeGroup) : "Unknown";
}

function toSizeGroup(v: string | null | undefined): SizeGroup {
  return v != null && SIZE_GROUPS.has(v) ? (v as SizeGroup) : "Unknown";
}

function toEnergyLevel(v: string | null | undefined): EnergyLevel {
  return v != null && ENERGY_LEVELS.has(v) ? (v as EnergyLevel) : "Unknown";
}

function toFenceNeeds(v: string | null | undefined): FenceNeeds {
  return v != null && FENCE_NEEDS.has(v) ? (v as FenceNeeds) : "Unknown";
}

function toOwnerExperience(v: string | null | undefined): OwnerExperience {
  return v != null && OWNER_EXPERIENCE.has(v)
    ? (v as OwnerExperience)
    : "Unknown";
}

function toBooleanOrUnknown(
  v: boolean | null | undefined
): boolean | "Unknown" {
  if (v === true) return true;
  if (v === false) return false;
  return "Unknown";
}

export function normalizeRescueGroupsDog(
  raw: RescueGroupsRawDog,
  externalId: string,
  distance: number | null = null
): NormalizedDog {
  const { animals, shelters } = raw;

  return {
    provider: "rescuegroups",
    externalId,
    name: animals.name ?? "",
    breed: animals.breeds?.primary ?? null,
    ageGroup: toAgeGroup(animals.ageGroup),
    sizeGroup: toSizeGroup(animals.sizeGroup),
    energyLevel: toEnergyLevel(animals.energyLevel),
    activityLevel: toEnergyLevel(animals.activityLevel),
    exerciseNeeds: toEnergyLevel(animals.exerciseNeeds),
    isKidsOk: toBooleanOrUnknown(animals.isKidsOk),
    isCatsOk: toBooleanOrUnknown(animals.isCatsOk),
    isDogsOk: toBooleanOrUnknown(animals.isDogsOk),
    isSpecialNeeds: toBooleanOrUnknown(animals.isSpecialNeeds),
    isYardRequired: toBooleanOrUnknown(animals.isYardRequired),
    fenceNeeds: toFenceNeeds(animals.fenceNeeds),
    ownerExperience: toOwnerExperience(animals.ownerExperience),
    photos: animals.photos ?? [],
    description: animals.description ?? null,
    shelterName: shelters?.name ?? undefined,
    shelterUrl: shelters?.adoptionUrl ?? undefined,
    distance,
  };
}
