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
  externalId: "rg-123",
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
  photos: ["https://example.test/charlie.jpg"],
  description: "A friendly pup.",
  shelterName: "Happy Paws Rescue",
  shelterUrl: "https://happypaws.org/adopt/charlie",
  distance: 3,
};

const MOCK_COMPAT: CompatibilityResult = {
  compatibilityScore: 91,
  matchLabel: "Strong Match",
  confidenceScore: 85,
  confidenceLabel: "High",
  breakdown: [],
  positiveFactors: [],
  concerns: [],
  shelterQuestions: [],
};

describe("DogDetailClient — structured explanations", () => {
  it("STRUCT-001: renders positive factors under Why This Dog Fits heading", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{
          available: true,
          result: {
            ...MOCK_COMPAT,
            positiveFactors: [
              "This dog is good with cats.",
              "This dog's energy level matches your lifestyle.",
            ],
          },
        }}
      />
    );
    expect(screen.getByText(/why this dog fits/i)).toBeInTheDocument();
    expect(screen.getByText("This dog is good with cats.")).toBeInTheDocument();
    expect(
      screen.getByText("This dog's energy level matches your lifestyle.")
    ).toBeInTheDocument();
  });

  it("STRUCT-002: renders concerns under Potential Concerns heading", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{
          available: true,
          result: {
            ...MOCK_COMPAT,
            concerns: [
              "This dog may need more daily exercise than your profile suggests.",
            ],
          },
        }}
      />
    );
    expect(screen.getByText(/potential concerns/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "This dog may need more daily exercise than your profile suggests."
      )
    ).toBeInTheDocument();
  });

  it("STRUCT-003: Potential Concerns section is not rendered when concerns is empty", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{
          available: true,
          result: { ...MOCK_COMPAT, concerns: [] },
        }}
      />
    );
    expect(screen.queryByText(/potential concerns/i)).not.toBeInTheDocument();
  });

  it("US-014: low match dog explanation sections still render", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{
          available: true,
          result: {
            ...MOCK_COMPAT,
            compatibilityScore: 35,
            matchLabel: "Low Match",
            positiveFactors: ["This dog does not require a yard."],
            concerns: ["Your activity level and this dog's energy level may not be a good match."],
          },
        }}
      />
    );
    expect(screen.getByText(/low match/i)).toBeInTheDocument();
    expect(screen.getByText(/why this dog fits/i)).toBeInTheDocument();
    expect(screen.getByText("This dog does not require a yard.")).toBeInTheDocument();
    expect(screen.getByText(/potential concerns/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your activity level and this dog's energy level may not be a good match."
      )
    ).toBeInTheDocument();
  });
});
