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
  gender: "Male",
  energyLevel: "Moderate",
  activityLevel: "Moderate",
  exerciseNeeds: "Moderate",
  groomingNeeds: "Low",
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

// ─── Energy / Activity Fit — 14 pts ───────────────────────────────────────────

describe("Energy / Activity Fit", () => {
  it("SCORE-001: exact energy match → 14 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, activityLevel: "Low" },
      { ...BASE_DOG, energyLevel: "Low", activityLevel: "Low", exerciseNeeds: "Low" },
    );
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(14);
  });

  it("SCORE-002: adjacent energy (Moderate vs High) → 9 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, activityLevel: "Moderate" },
      { ...BASE_DOG, energyLevel: "High" },
    );
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(9);
  });

  it("SCORE-003: opposite energy (Low vs High) → 2 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, activityLevel: "Low" },
      { ...BASE_DOG, energyLevel: "High", activityLevel: "High", exerciseNeeds: "High" },
    );
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(2);
    expect(result.concerns.length).toBeGreaterThan(0);
  });

  it("SCORE-004: all energy fields Unknown → 7 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      energyLevel: "Unknown",
      activityLevel: "Unknown",
      exerciseNeeds: "Unknown",
    });
    expect(cat(result, "Energy / Activity Fit")?.score).toBe(7);
  });
});

// ─── Kids Compatibility — 16 pts ──────────────────────────────────────────────

describe("Kids Compatibility", () => {
  it("SCORE-005: has children + isKidsOk true → 16 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true },
      { ...BASE_DOG, isKidsOk: true },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(16);
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

  it("SCORE-007: has children + isKidsOk Unknown → 8 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: true },
      { ...BASE_DOG, isKidsOk: "Unknown" },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(8);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("children")]),
    );
  });

  it("SCORE-008: no children → 16 pts regardless of isKidsOk", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasChildren: false },
      { ...BASE_DOG, isKidsOk: false },
    );
    expect(cat(result, "Kids Compatibility")?.score).toBe(16);
  });
});

// ─── Cats Compatibility — 16 pts ──────────────────────────────────────────────

describe("Cats Compatibility", () => {
  it("SCORE-009: has cats + isCatsOk true → 16 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: true },
      { ...BASE_DOG, isCatsOk: true },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(16);
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

  it("SCORE-011: has cats + isCatsOk Unknown → 8 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: true },
      { ...BASE_DOG, isCatsOk: "Unknown" },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(8);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("cats")]),
    );
  });

  it("SCORE-012: no cats → 16 pts regardless of isCatsOk", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasCats: false },
      { ...BASE_DOG, isCatsOk: false },
    );
    expect(cat(result, "Cats Compatibility")?.score).toBe(16);
  });
});

// ─── Dogs Compatibility — 12 pts ──────────────────────────────────────────────

describe("Dogs Compatibility", () => {
  it("SCORE-013: has other dogs + isDogsOk true → 12 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: true },
      { ...BASE_DOG, isDogsOk: true },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(12);
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

  it("SCORE-015: has other dogs + isDogsOk Unknown → 6 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: true },
      { ...BASE_DOG, isDogsOk: "Unknown" },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(6);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("dogs")]),
    );
  });

  it("SCORE-016: no other dogs → 12 pts regardless of isDogsOk", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasOtherDogs: false },
      { ...BASE_DOG, isDogsOk: false },
    );
    expect(cat(result, "Dogs Compatibility")?.score).toBe(12);
  });
});

// ─── Yard & Fence — 10 pts (5 + 5) ────────────────────────────────────────────

describe("Yard & Fence", () => {
  it("SCORE-017: yard required + user has yard → 10 (5 yard + 5 fence-not-required)", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasYard: true },
      { ...BASE_DOG, isYardRequired: true, fenceNeeds: "Not required" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(10);
  });

  it("SCORE-018: yard required + user lacks yard → 5 + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasYard: false },
      { ...BASE_DOG, isYardRequired: true, fenceNeeds: "Not required" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(5);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("yard")]),
    );
  });

  it("SCORE-019: yard not required → 10 (5 + 5)", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isYardRequired: false,
      fenceNeeds: "Not required",
    });
    expect(cat(result, "Yard & Fence")?.score).toBe(10);
  });

  it("SCORE-020: yard required Unknown → 8 (3 yard + 5 fence)", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      isYardRequired: "Unknown",
      fenceNeeds: "Not required",
    });
    expect(cat(result, "Yard & Fence")?.score).toBe(8);
  });

  it("SCORE-021: fence required + user has fence → 10 (5 + 5)", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasFence: true },
      { ...BASE_DOG, isYardRequired: false, fenceNeeds: "Any type" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(10);
  });

  it("SCORE-022: fence required + user lacks fence → 5 + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, hasFence: false },
      { ...BASE_DOG, isYardRequired: false, fenceNeeds: "6 foot" },
    );
    expect(cat(result, "Yard & Fence")?.score).toBe(5);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("fence")]),
    );
  });
});

// ─── Experience Level — 8 pts ─────────────────────────────────────────────────

describe("Experience Level", () => {
  it("SCORE-023: dog needs breed exp + user has none → 1 pt + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "None" },
      { ...BASE_DOG, ownerExperience: "Breed" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(1);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("breed")]),
    );
  });

  it("SCORE-024: dog needs breed exp + user has species exp → 5 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "Species" },
      { ...BASE_DOG, ownerExperience: "Breed" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(5);
  });

  it("SCORE-025: dog needs breed exp + user has breed exp → 8 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "Breed" },
      { ...BASE_DOG, ownerExperience: "Breed" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(8);
  });

  it("SCORE-026: dog needs no exp → 8 pts for any user", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, experienceLevel: "None" },
      { ...BASE_DOG, ownerExperience: "None" },
    );
    expect(cat(result, "Experience Level")?.score).toBe(8);
  });
});

// ─── Size Preference — 7 pts ──────────────────────────────────────────────────

describe("Size Preference", () => {
  it("SCORE-027: exact size match → 7 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sizePreference: "Medium" },
      { ...BASE_DOG, sizeGroup: "Medium" },
    );
    expect(cat(result, "Size Preference")?.score).toBe(7);
  });

  it("SCORE-028: adjacent size (Medium pref, Large dog) → 4 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sizePreference: "Medium" },
      { ...BASE_DOG, sizeGroup: "Large" },
    );
    expect(cat(result, "Size Preference")?.score).toBe(4);
  });

  it("SCORE-029: non-matching size (Small pref, X-Large dog) → 2 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sizePreference: "Small" },
      { ...BASE_DOG, sizeGroup: "X-Large" },
    );
    expect(cat(result, "Size Preference")?.score).toBe(2);
  });

  it("SCORE-030: dog size Unknown → 3 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, {
      ...BASE_DOG,
      sizeGroup: "Unknown",
    });
    expect(cat(result, "Size Preference")?.score).toBe(3);
  });
});

// ─── Age Preference — 7 pts ───────────────────────────────────────────────────

describe("Age Preference", () => {
  it("SCORE-AGE-001: exact age match → 7 pts + positive factor", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, agePreference: "Adult" },
      { ...BASE_DOG, ageGroup: "Adult" },
    );
    expect(cat(result, "Age Preference")?.score).toBe(7);
    expect(result.positiveFactors).toEqual(
      expect.arrayContaining([expect.stringContaining("age")]),
    );
  });

  it("SCORE-AGE-002: no age preference → 7 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, { ...BASE_DOG, ageGroup: "Senior" });
    expect(cat(result, "Age Preference")?.score).toBe(7);
  });

  it("SCORE-AGE-003: adjacent age (Young pref, Adult dog) → 4 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, agePreference: "Young" },
      { ...BASE_DOG, ageGroup: "Adult" },
    );
    expect(cat(result, "Age Preference")?.score).toBe(4);
  });

  it("SCORE-AGE-004: far age (Baby pref, Senior dog) → 2 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, agePreference: "Baby" },
      { ...BASE_DOG, ageGroup: "Senior" },
    );
    expect(cat(result, "Age Preference")?.score).toBe(2);
  });

  it("SCORE-AGE-005: dog age Unknown → 3 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, agePreference: "Adult" },
      { ...BASE_DOG, ageGroup: "Unknown" },
    );
    expect(cat(result, "Age Preference")?.score).toBe(3);
  });
});

// ─── Sex Preference — 2 pts ───────────────────────────────────────────────────

describe("Sex Preference", () => {
  it("SCORE-SEX-001: sex match → 2 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sexPreference: "Male" },
      { ...BASE_DOG, gender: "Male" },
    );
    expect(cat(result, "Sex Preference")?.score).toBe(2);
  });

  it("SCORE-SEX-002: no sex preference → 2 pts", () => {
    const result = calculateCompatibility(BASE_PROFILE, { ...BASE_DOG, gender: "Female" });
    expect(cat(result, "Sex Preference")?.score).toBe(2);
  });

  it("SCORE-SEX-003: sex mismatch → 0 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sexPreference: "Female" },
      { ...BASE_DOG, gender: "Male" },
    );
    expect(cat(result, "Sex Preference")?.score).toBe(0);
  });

  it("SCORE-SEX-004: dog gender Unknown (preference set) → 1 pt", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, sexPreference: "Female" },
      { ...BASE_DOG, gender: "Unknown" },
    );
    expect(cat(result, "Sex Preference")?.score).toBe(1);
  });
});

// ─── Grooming Fit — 4 pts ─────────────────────────────────────────────────────

describe("Grooming Fit", () => {
  it("SCORE-GROOM-001: tolerance ≥ need → 4 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, groomingTolerance: "High" },
      { ...BASE_DOG, groomingNeeds: "High" },
    );
    expect(cat(result, "Grooming Fit")?.score).toBe(4);
  });

  it("SCORE-GROOM-002: tolerance one step below need → 2 pts", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, groomingTolerance: "Moderate" },
      { ...BASE_DOG, groomingNeeds: "High" },
    );
    expect(cat(result, "Grooming Fit")?.score).toBe(2);
  });

  it("SCORE-GROOM-003: tolerance two steps below need → 0 pts + concern", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, groomingTolerance: "Low" },
      { ...BASE_DOG, groomingNeeds: "High" },
    );
    expect(cat(result, "Grooming Fit")?.score).toBe(0);
    expect(result.concerns).toEqual(
      expect.arrayContaining([expect.stringContaining("grooming")]),
    );
  });

  it("SCORE-GROOM-004: grooming need Unknown → 2 pts + shelter question", () => {
    const result = calculateCompatibility(
      { ...BASE_PROFILE, groomingTolerance: "Low" },
      { ...BASE_DOG, groomingNeeds: "Unknown" },
    );
    expect(cat(result, "Grooming Fit")?.score).toBe(2);
    expect(result.shelterQuestions).toEqual(
      expect.arrayContaining([expect.stringContaining("grooming")]),
    );
  });

  it("SCORE-GROOM-005: no grooming tolerance specified → 4 pts (no constraint)", () => {
    const result = calculateCompatibility(BASE_PROFILE, { ...BASE_DOG, groomingNeeds: "High" });
    expect(cat(result, "Grooming Fit")?.score).toBe(4);
  });
});

// ─── Special Needs — 4 pts ────────────────────────────────────────────────────

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

  it("AI-005: breakdown always has exactly 11 categories", () => {
    const result = calculateCompatibility(BASE_PROFILE, BASE_DOG);
    expect(result.breakdown).toHaveLength(11);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
  });
});
