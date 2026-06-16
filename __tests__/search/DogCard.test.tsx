import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { DogCard } from "@/components/DogCard";

const MOCK_DOG: NormalizedDog = {
  provider: "rescuegroups",
  externalId: "rg-001",
  name: "Charlie",
  breed: "Labrador Mix",
  ageGroup: "Young",
  sizeGroup: "Medium",
  energyLevel: "High",
  activityLevel: "High",
  exerciseNeeds: "High",
  isKidsOk: true,
  isCatsOk: false,
  isDogsOk: true,
  isSpecialNeeds: false,
  isYardRequired: false,
  fenceNeeds: "Not required",
  ownerExperience: "None",
  photos: ["https://example.test/charlie.jpg"],
  shelterName: "Happy Paws",
  description: "A playful pup.",
  distance: 12,
};

const ANON_COMPAT = {
  available: false as const,
  teaser: "Create your profile to unlock compatibility matching.",
};

describe("DogCard", () => {
  it("renders dog name, age group, size group, and breed (ANON-001a)", () => {
    render(<DogCard dog={MOCK_DOG} compatibility={ANON_COMPAT} />);
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText(/young/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByText(/labrador mix/i)).toBeInTheDocument();
  });

  it("renders dog photo with descriptive alt text (ANON-001b)", () => {
    render(<DogCard dog={MOCK_DOG} compatibility={ANON_COMPAT} />);
    const img = screen.getByRole("img", { name: /charlie/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.test/charlie.jpg");
  });

  it("renders distance when dog.distance is non-null (ANON-001c)", () => {
    render(<DogCard dog={MOCK_DOG} compatibility={ANON_COMPAT} />);
    expect(screen.getByText(/12.*miles/i)).toBeInTheDocument();
  });

  it("omits distance when dog.distance is null (ANON-001d)", () => {
    const dogWithoutDistance: NormalizedDog = { ...MOCK_DOG, distance: null };
    render(<DogCard dog={dogWithoutDistance} compatibility={ANON_COMPAT} />);
    expect(screen.queryByText(/miles/i)).not.toBeInTheDocument();
  });

  it("renders compatibility teaser with correct heading (ANON-002a)", () => {
    render(<DogCard dog={MOCK_DOG} compatibility={ANON_COMPAT} />);
    expect(
      screen.getByText(/compatibility matching available/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/create your profile/i)).toBeInTheDocument();
  });

  it("shows three value-prop bullets and no score percentage (ANON-002b)", () => {
    render(<DogCard dog={MOCK_DOG} compatibility={ANON_COMPAT} />);
    expect(screen.getByText(/match score/i)).toBeInTheDocument();
    expect(screen.getByText(/why this dog fits/i)).toBeInTheDocument();
    expect(screen.getByText(/potential concerns/i)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
