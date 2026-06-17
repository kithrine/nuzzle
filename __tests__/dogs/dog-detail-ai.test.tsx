// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DogDetailClient } from "@/app/dogs/[provider]/[externalId]/DogDetailClient";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ isSignedIn: false, isLoaded: true, user: null }),
}));

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

const MOCK_COMPAT: CompatibilityResult = {
  compatibilityScore: 78,
  matchLabel: "Good Match",
  confidenceScore: 80,
  confidenceLabel: "High",
  breakdown: [],
  positiveFactors: [],
  concerns: [],
  shelterQuestions: [],
};

describe("DogDetailClient — AI explanation", () => {
  it("AI-RENDER-001: renders AI explanation when explanation prop is provided", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{ available: true, result: MOCK_COMPAT }}
        explanation="Charlie is a great match for your active lifestyle."
      />,
    );
    expect(screen.getByTestId("ai-explanation")).toBeInTheDocument();
    expect(screen.getByText(/charlie is a great match/i)).toBeInTheDocument();
  });

  it("AI-RENDER-002: no explanation section when explanation is null", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{ available: true, result: MOCK_COMPAT }}
        explanation={null}
      />,
    );
    expect(screen.queryByTestId("ai-explanation")).not.toBeInTheDocument();
  });
});
