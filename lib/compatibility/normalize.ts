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

function toGender(v: string | null | undefined): "Male" | "Female" | "Unknown" {
  if (v === "Male" || v === "Female") return v;
  return "Unknown";
}

const NAMED_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
};

// RescueGroups description fields arrive HTML-escaped (e.g. "&#39;", "&nbsp;").
// Decode named + numeric entities and collapse the runs of spaces that
// "&nbsp;&nbsp;" produces, while preserving newlines so paragraphs survive.
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&apos;|&#39;/g, (m) => NAMED_ENTITIES[m])
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/[ \t]{2,}/g, " ");
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
    breed: animals.breedPrimary ?? animals.breeds?.primary ?? null,
    ageGroup: toAgeGroup(animals.ageGroup),
    sizeGroup: toSizeGroup(animals.sizeGroup),
    gender: toGender(animals.sex),
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
    description: (() => {
      const d = animals.descriptionText ?? animals.description ?? null;
      return d ? decodeEntities(d) : null;
    })(),
    shelterName: shelters?.name ?? undefined,
    shelterUrl: shelters?.adoptionUrl ?? undefined,
    distance:
      distance ?? (typeof animals.distance === "number" ? animals.distance : null),
  };
}
