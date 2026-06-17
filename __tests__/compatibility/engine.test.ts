// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
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

function cat(result: ReturnType<typeof calculateCompatibility>, name: string) {
  return result.breakdown.find((b) => b.category === name);
}

// ─── Energy / Activity Fit ────────────────────────────────────────────────────

describe("Energy / Activity Fit", () => {
  it("SCORE-001: exact energy match → 16 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, activityLevel: "Low" },
      { ...BASE_DOG, energyLevel: "Low", activityLevel: "Low", exerciseNeeds: "Low" },
    );
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(16);
  });

  it("SCORE-002: adjacent energy (Moderate vs High) → 10 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, activityLevel: "Moderate" },
      { ...BASE_DOG, energyLevel: "High" },
    );
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(10);
  });

  it("SCORE-003: opposite energy (Low vs High) → 2 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, activityLevel: "Low" },
      { ...BASE_DOG, energyLevel: "High", activityLevel: "High", exerciseNeeds: "High" },
    );
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(2);
    expect(result.concerns.length).toBeGreaterThan(0);
  });

  it("SCORE-004: all energy fields Unknown → 8 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      energyLevel: "Unknown",
      activityLevel: "Unknown",
      exerciseNeeds: "Unknown",
    });
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(8);
  });
});

// ─── Kids Compatibility ───────────────────────────────────────────────────────

describe("Kids Compatibility", () => {
  it("SCORE-005: has children + isKidsOk true → 18 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true },
      { ...BASE_DOG, isKidsOk: true },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(18);
  });

  it("SCORE-006: has children + isKidsOk false → 0 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true },
      { ...BASE_DOG, isKidsOk: false },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(0);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("children")]),
    );
  });

  it("SCORE-007: has children + isKidsOk Unknown → 9 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true },
      { ...BASE_DOG, isKidsOk: "Unknown" },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(9);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("children")]),
    );
  });

  it("SCORE-008: no children → 18 pts regardless of isKidsOk", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: false },
      { ...BASE_DOG, isKidsOk: false },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(18);
  });
});

// ─── Cats Compatibility ───────────────────────────────────────────────────────

describe("Cats Compatibility", () => {
  it("SCORE-009: has cats + isCatsOk true → 18 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: true },
      { ...BASE_DOG, isCatsOk: true },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(18);
  });

  it("SCORE-010: has cats + isCatsOk false → 0 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: true },
      { ...BASE_DOG, isCatsOk: false },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(0);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("cats")]),
    );
  });

  it("SCORE-011: has cats + isCatsOk Unknown → 9 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: true },
      { ...BASE_DOG, isCatsOk: "Unknown" },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(9);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("cats")]),
    );
  });

  it("SCORE-012: no cats → 18 pts regardless of isCatsOk", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: false },
      { ...BASE_DOG, isCatsOk: false },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(18);
  });
});

// ─── Dogs Compatibility ───────────────────────────────────────────────────────

describe("Dogs Compatibility", () => {
  it("SCORE-013: has other dogs + isDogsOk true → 14 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: true },
      { ...BASE_DOG, isDogsOk: true },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(14);
  });

  it("SCORE-014: has other dogs + isDogsOk false → 0 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: true },
      { ...BASE_DOG, isDogsOk: false },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(0);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("other dogs")]),
    );
  });

  it("SCORE-015: has other dogs + isDogsOk Unknown → 7 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: true },
      { ...BASE_DOG, isDogsOk: "Unknown" },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(7);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("dogs")]),
    );
  });

  it("SCORE-016: no other dogs → 14 pts regardless of isDogsOk", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: false },
      { ...BASE_DOG, isDogsOk: false },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(14);
  });
});

// ─── Yard & Fence ─────────────────────────────────────────────────────────────

describe("Yard & Fence", () => {
  it("SCORE-017: yard required + user has yard → yard portion = 6 pts (Yard & Fence = 12)", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasYard: true },
      { ...BASE_DOG, isYardRequired: true, fenceNeeds: "Not required" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(12);
  });

  it("SCORE-018: yard required + user lacks yard → 0 for yard portion + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasYard: false },
      { ...BASE_DOG, isYardRequired: true, fenceNeeds: "Not required" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(6);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("yard")]),
    );
  });

  it("SCORE-019: yard not required → 6 pts for yard portion (Yard & Fence = 12)", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isYardRequired: false,
      fenceNeeds: "Not required",
    });
    expect(cat(result, "Yard & Fence")?.score).toBe(12);
  });

  it("SCORE-020: yard required Unknown → 3 pts for yard portion", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isYardRequired: "Unknown",
      fenceNeeds: "Not required",
    });
    expect(cat(result, "Yard & Fence")?.score).toBe(9);
  });

  it("SCORE-021: fence required + user has fence → fence portion = 6 pts (Yard & Fence = 12)", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasFence: true },
      { ...BASE_DOG, isYardRequired: false, fenceNeeds: "Any type" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(12);
  });

  it("SCORE-022: fence required + user lacks fence → 0 for fence portion + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasFence: false },
      { ...BASE_DOG, isYardRequired: false, fenceNeeds: "6 foot" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(6);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("fence")]),
    );
  });
});

// ─── Experience Level ─────────────────────────────────────────────────────────

describe("Experience Level", () => {
  it("SCORE-023: dog needs breed exp + user has none → 2 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "None" },
      { ...BASE_DOG, ownerExperience: "Breed" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(2);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("breed")]),
    );
  });

  it("SCORE-024: dog needs breed exp + user has species exp → 6 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "Species" },
      { ...BASE_DOG, ownerExperience: "Breed" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(6);
  });

  it("SCORE-025: dog needs breed exp + user has breed exp → 10 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "Breed" },
      { ...BASE_DOG, ownerExperience: "Breed" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(10);
  });

  it("SCORE-026: dog needs no exp → 10 pts for any user", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "None" },
      { ...BASE_DOG, ownerExperience: "None" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(10);
  });
});

// ─── Size Preference ──────────────────────────────────────────────────────────

describe("Size Preference", () => {
  it("SCORE-027: exact size match → 8 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sizePreference: "Medium" },
      { ...BASE_DOG, sizeGroup: "Medium" },
    );
    expect(cat(result, "Size Preference")?.score).toBe(8);
  });

  it("SCORE-028: adjacent size (Medium pref, Large dog) → 5 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sizePreference: "Medium" },
      { ...BASE_DOG, sizeGroup: "Large" },
    );
    expect(cat(result, "Size Preference")?.score).toBe(5);
  });

  it("SCORE-029: non-matching size (Small pref, X-Large dog) → 2 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sizePreference: "Small" },
      { ...BASE_DOG, sizeGroup: "X-Large" },
    );
    expect(cat(result, "Size Preference")?.score).toBe(2);
  });

  it("SCORE-030: dog size Unknown → 4 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      sizeGroup: "Unknown",
    });
    expect(cat(result, "Size Preference")?.score).toBe(4);
  });
});

// ─── Special Needs ────────────────────────────────────────────────────────────

describe("Special Needs", () => {
  it("SCORE-031: special needs dog + user willing → 4 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, specialNeedsWilling: true },
      { ...BASE_DOG, isSpecialNeeds: true },
    );
    expect(cat(result, "Special Needs")?.score).toBe(4);
  });

  it("SCORE-032: special needs dog + user not willing → 0 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, specialNeedsWilling: false },
      { ...BASE_DOG, isSpecialNeeds: true },
    );
    expect(cat(result, "Special Needs")?.score).toBe(0);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("special needs")]),
    );
  });

  it("SCORE-033: dog has no special needs → 4 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isSpecialNeeds: false,
    });
    expect(cat(result, "Special Needs")?.score).toBe(4);
  });
});

// ─── Total Score ──────────────────────────────────────────────────────────────

describe("Total Score", () => {
  it("SCORE-034: all best-fit values → compatibilityScore = 100", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(result.compatibilityScore).toBe(100);
  });
});

// ─── Determinism ─────────────────────────────────────────────────────────────

describe("Determinism", () => {
  it("DET-001: same inputs produce same compatibilityScore", () => {
    const r1 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    const r2 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(r1.compatibilityScore).toBe(r2.compatibilityScore);
  });

  it("DET-002: same inputs produce same matchLabel", () => {
    const r1 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    const r2 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(r1.matchLabel).toBe(r2.matchLabel);
  });

  it("DET-003: same inputs produce same confidenceScore", () => {
    const r1 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    const r2 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(r1.confidenceScore).toBe(r2.confidenceScore);
  });

  it("DET-004: same inputs produce same breakdown (deep equal)", () => {
    const r1 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    const r2 = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(r1.breakdown).toEqual(r2.breakdown);
  });
});

// ─── AI Safety ────────────────────────────────────────────────────────────────

describe("AI Safety", () => {
  it("AI-001: makes no external HTTP calls", () => {
    const spy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("Engine made an external HTTP call — not allowed");
    });
    try {
      const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
      expect(spy).not.toHaveBeenCalled();
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    } finally {
      spy.mockRestore();
    }
  });

  it("AI-002: returns valid result without any AI service", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(result.compatibilityScore).toBeLessThanOrEqual(100);
    expect(result.matchLabel).toBeDefined();
  });

  it("AI-003: result score is a primitive (not mutated externally)", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    const original = result.compatibilityScore;
    expect(typeof result.compatibilityScore).toBe("number");
    expect(result.compatibilityScore).toBe(original);
  });

  it("AI-004: produces complete explanation arrays without AI", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(Array.isArray(result.positiveFactors)).toBe(true);
    expect(Array.isArray(result.concerns)).toBe(true);
    expect(Array.isArray(result.shelterQuestions)).toBe(true);
  });

  it("AI-005: breakdown always has exactly 8 categories", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(result.breakdown).toHaveLength(8);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
  });
});
