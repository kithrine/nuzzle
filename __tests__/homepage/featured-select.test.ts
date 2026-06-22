import { describe, expect, it } from "vitest";
import {
  featuredWindowSeed,
  pickFeatured,
  seededShuffle,
} from "@/lib/homepage/featured";
import type { NormalizedDog } from "@/lib/compatibility/types";

function makeDog(id: string, withPhoto = true): NormalizedDog {
  return {
    provider: "rescuegroups",
    externalId: id,
    name: `Dog ${id}`,
    breed: "Mixed",
    ageGroup: "Young",
    sizeGroup: "Medium",
    energyLevel: "Moderate",
    activityLevel: "Moderate",
    exerciseNeeds: "Moderate",
    isKidsOk: "Unknown",
    isCatsOk: "Unknown",
    isDogsOk: "Unknown",
    isSpecialNeeds: "Unknown",
    isYardRequired: "Unknown",
    fenceNeeds: "Unknown",
    ownerExperience: "Unknown",
    photos: withPhoto ? [`https://example.test/${id}.jpg`] : [],
    description: null,
    distance: null,
  };
}

const FIVE_HOURS = 5 * 60 * 60 * 1000;

describe("featuredWindowSeed", () => {
  it("is stable for two timestamps within the same 5-hour window", () => {
    const base = 1_700_000_000_000;
    expect(featuredWindowSeed(base)).toBe(featuredWindowSeed(base + 60_000));
  });

  it("increments by one across consecutive 5-hour windows", () => {
    const base = 1_700_000_000_000;
    const a = featuredWindowSeed(base);
    const b = featuredWindowSeed(base + FIVE_HOURS);
    expect(b).toBe(a + 1);
  });
});

describe("seededShuffle", () => {
  it("is deterministic for the same seed and does not mutate the input", () => {
    const input = ["a", "b", "c", "d", "e", "f"];
    const copy = [...input];
    const first = seededShuffle(input, 42);
    const second = seededShuffle(input, 42);
    expect(first).toEqual(second);
    expect(input).toEqual(copy); // not mutated
  });
});

describe("pickFeatured", () => {
  const dogs = Array.from({ length: 12 }, (_, i) => makeDog(`rg-${i}`));

  it("is deterministic for the same seed", () => {
    const a = pickFeatured(dogs, 7, 8).map((d) => d.externalId);
    const b = pickFeatured(dogs, 7, 8).map((d) => d.externalId);
    expect(a).toEqual(b);
  });

  it("produces a different ordering for different seeds", () => {
    const a = pickFeatured(dogs, 1, 8).map((d) => d.externalId).join(",");
    const b = pickFeatured(dogs, 9999, 8).map((d) => d.externalId).join(",");
    expect(a).not.toEqual(b);
  });

  it("caps the result at the requested count", () => {
    expect(pickFeatured(dogs, 3, 8)).toHaveLength(8);
  });

  it("returns all dogs when fewer than count are available", () => {
    const few = dogs.slice(0, 3);
    expect(pickFeatured(few, 3, 8)).toHaveLength(3);
  });

  it("prefers dogs that have a photo", () => {
    const withPhotos = Array.from({ length: 8 }, (_, i) => makeDog(`p-${i}`, true));
    const withoutPhotos = Array.from({ length: 8 }, (_, i) => makeDog(`n-${i}`, false));
    const picked = pickFeatured([...withoutPhotos, ...withPhotos], 5, 8);
    expect(picked).toHaveLength(8);
    expect(picked.every((d) => d.photos.length > 0)).toBe(true);
  });
});
