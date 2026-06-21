import { describe, it, expect } from "vitest";
import type { CompatibilityResult } from "@/lib/compatibility/types";
import { toCardCompatibility } from "@/lib/search/card-compatibility";

const RESULT: CompatibilityResult = {
  compatibilityScore: 91,
  matchLabel: "Strong Match",
  confidenceScore: 80,
  confidenceLabel: "High",
  breakdown: [],
  positiveFactors: ["Good with kids"],
  concerns: [],
  shelterQuestions: [],
};

describe("toCardCompatibility", () => {
  it("CARD-001: available + result → authenticated union", () => {
    expect(toCardCompatibility(RESULT, true, "teaser")).toEqual({
      available: true,
      result: RESULT,
    });
  });

  it("CARD-002: not available → teaser union", () => {
    expect(toCardCompatibility(undefined, false, "Create a profile")).toEqual({
      available: false,
      teaser: "Create a profile",
    });
  });

  it("CARD-003: available but no result → teaser (defensive)", () => {
    expect(toCardCompatibility(undefined, true, "teaser")).toEqual({
      available: false,
      teaser: "teaser",
    });
  });
});
