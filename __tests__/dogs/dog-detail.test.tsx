// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DogDetailClient } from "@/app/dogs/[provider]/[externalId]/DogDetailClient";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";

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
  description: "A friendly and playful pup looking for his forever home.",
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
  positiveFactors: ["Good with cats", "Moderate energy matches yours"],
  concerns: [],
  shelterQuestions: [],
};

describe("DogDetailClient", () => {
  it("US-011: renders photo, name, age, breed, shelter name, distance, and description", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{ available: false, teaser: "Create a profile." }}
      />
    );
    expect(screen.getByRole("img", { name: /charlie/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /charlie/i })).toBeInTheDocument();
    expect(screen.getByText(/young/i)).toBeInTheDocument();
    expect(screen.getByText(/labrador mix/i)).toBeInTheDocument();
    expect(screen.getByText(/happy paws rescue/i)).toBeInTheDocument();
    expect(screen.getByText(/3.*miles/i)).toBeInTheDocument();
    expect(screen.getByText(/friendly and playful pup/i)).toBeInTheDocument();
  });

  it("ANON-003: anonymous user sees teaser CTA and no compatibility percentage", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{
          available: false,
          teaser: "Create a profile to unlock compatibility matching.",
        }}
      />
    );
    expect(screen.getByText(/get my compatibility match/i)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("profiled user: compatibility card shows score, match label, and confidence label", () => {
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{ available: true, result: MOCK_COMPAT }}
      />
    );
    expect(screen.getByText(/91/)).toBeInTheDocument();
    expect(screen.getByText(/strong match/i)).toBeInTheDocument();
    expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
  });

  it("US-012: Before You Apply section shows shelter questions when present", () => {
    const compatWithQuestions: CompatibilityResult = {
      ...MOCK_COMPAT,
      shelterQuestions: [
        "Has Charlie lived with or been around children?",
        "How much daily exercise does Charlie currently need?",
      ],
    };
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{ available: true, result: compatWithQuestions }}
      />
    );
    expect(screen.getByText(/before you apply/i)).toBeInTheDocument();
    expect(
      screen.getByText(/has charlie lived with or been around children/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/how much daily exercise does charlie currently need/i)
    ).toBeInTheDocument();
  });

  it("US-013: Visit Shelter Listing link has correct href and fires shelter_click on click", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(
      <DogDetailClient
        dog={MOCK_DOG}
        compatibility={{ available: false, teaser: "Create a profile." }}
      />
    );
    const link = screen.getByRole("link", { name: /visit shelter listing/i });
    expect(link).toHaveAttribute("href", "https://happypaws.org/adopt/charlie");
    expect(link).toHaveAttribute("target", "_blank");
    fireEvent.click(link);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "shelter_click" })
    );
    dispatchSpy.mockRestore();
  });
});
