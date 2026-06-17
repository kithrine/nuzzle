// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("openai", () => {
  class MockOpenAI {
    chat = { completions: { create: mockCreate } };
  }
  return { default: MockOpenAI };
});

import { generateExplanation, FALLBACK_EXPLANATION } from "@/lib/ai/explainer";

const MOCK_RESULT: CompatibilityResult = {
  compatibilityScore: 78,
  matchLabel: "Good Match",
  confidenceScore: 80,
  confidenceLabel: "High",
  breakdown: [],
  positiveFactors: ["Good with kids.", "Low energy level."],
  concerns: [],
  shelterQuestions: [],
};

const MOCK_DOG: NormalizedDog = {
  provider: "rescuegroups",
  externalId: "rg-999",
  name: "Charlie",
  breed: "Labrador Mix",
  ageGroup: "Young",
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
  distance: null,
};

describe("generateExplanation", () => {
  beforeEach(() => mockCreate.mockReset());

  it("AI-GEN-001: returns AI-generated text when service responds", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Charlie is a wonderful companion." } }],
    });

    const result = await generateExplanation(MOCK_RESULT, MOCK_DOG);
    expect(result).toBe("Charlie is a wonderful companion.");
  });

  it("AI-GEN-002: returns fallback text when Grok API returns no content", async () => {
    mockCreate.mockResolvedValue({ choices: [] });

    const result = await generateExplanation(MOCK_RESULT, MOCK_DOG);
    expect(result).toBe(FALLBACK_EXPLANATION);
    expect(typeof result).toBe("string");
  });

  it("AI-GEN-003: does not mutate the CompatibilityResult passed to it", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Some text." } }],
    });

    const snapshot = { ...MOCK_RESULT };
    await generateExplanation(snapshot, MOCK_DOG);
    expect(snapshot.compatibilityScore).toBe(MOCK_RESULT.compatibilityScore);
    expect(snapshot.matchLabel).toBe(MOCK_RESULT.matchLabel);
  });
});
