// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import type { AdopterProfile, NormalizedDog } from "@/lib/compatibility/types";

const BASE_PROFILE: AdopterProfile = {
  homeType: "House",
  hasChildren: false,
  hasCats: false,
  hasOtherDogs: false,
  activityLevel: "Moderate",
  experienceLevel: "None",
};

const BASE_DOG: NormalizedDog = {
  provider: "rescuegroups",
  externalId: "t1",
  name: "Rex",
  breed: "Lab",
  ageGroup: "Adult",
  sizeGroup: "Medium",
  energyLevel: "Moderate",
  activityLevel: "Moderate",
  exerciseNeeds: "Moderate",
  isKidsOk: true,
  isCatsOk: true,
  isDogsOk: true,
  isSpecialNeeds: false,
  isYardRequired: false,
  fenceNeeds: "Not required",
  ownerExperience: "None",
  photos: [],
  description: null,
  distance: 5,
};

describe("Confidence Scoring", () => {
  it("CONF-001: all fields populated → confidence = 100 (High)", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(result.confidenceScore).toBe(100);
    expect(result.confidenceLabel).toBe("High");
  });

  it("CONF-002: isKidsOk Unknown when user has kids → confidence reduced by 15", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true },
      { ...BASE_DOG, isKidsOk: "Unknown" },
    );
    expect(result.confidenceScore).toBe(85);
  });

  it("CONF-003: isCatsOk Unknown when user has cats → confidence reduced by 15", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: true },
      { ...BASE_DOG, isCatsOk: "Unknown" },
    );
    expect(result.confidenceScore).toBe(85);
  });

  it("CONF-004: isDogsOk Unknown when user has dogs → confidence reduced by 12", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: true },
      { ...BASE_DOG, isDogsOk: "Unknown" },
    );
    expect(result.confidenceScore).toBe(88);
  });

  it("CONF-005: all energy fields Unknown → confidence reduced by 15", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      energyLevel: "Unknown",
      activityLevel: "Unknown",
      exerciseNeeds: "Unknown",
    });
    expect(result.confidenceScore).toBe(85);
  });

  it("CONF-006: isYardRequired Unknown → confidence reduced by 8", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isYardRequired: "Unknown",
    });
    expect(result.confidenceScore).toBe(92);
  });

  it("CONF-007: fenceNeeds Unknown → confidence reduced by 8", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      fenceNeeds: "Unknown",
    });
    expect(result.confidenceScore).toBe(92);
  });

  it("CONF-008: ownerExperience Unknown → confidence reduced by 8", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      ownerExperience: "Unknown",
    });
    expect(result.confidenceScore).toBe(92);
  });

  it("CONF-009: sizeGroup Unknown → confidence reduced by 6", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      sizeGroup: "Unknown",
    });
    expect(result.confidenceScore).toBe(94);
  });

  it("CONF-010: isSpecialNeeds Unknown → confidence reduced by 5", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isSpecialNeeds: "Unknown",
    });
    expect(result.confidenceScore).toBe(95);
  });

  it("CONF-011: all penalties applied → confidence = 8 (never below 0)", () => {
    // Total penalties: 15+15+12+15+8+8+8+6+5 = 92 → confidence = 100−92 = 8
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true, hasCats: true, hasOtherDogs: true },
      {
        ...BASE_DOG,
        isKidsOk: "Unknown",
        isCatsOk: "Unknown",
        isDogsOk: "Unknown",
        energyLevel: "Unknown",
        activityLevel: "Unknown",
        exerciseNeeds: "Unknown",
        isYardRequired: "Unknown",
        fenceNeeds: "Unknown",
        ownerExperience: "Unknown",
        sizeGroup: "Unknown",
        isSpecialNeeds: "Unknown",
      },
    );
    expect(result.confidenceScore).toBe(8);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
  });

  it("CONF-012: confidence never above 100 with full known data", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(result.confidenceScore).toBe(100);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });
});
