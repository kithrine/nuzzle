import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { SearchResults } from "@/components/SearchResults";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ isSignedIn: false, isLoaded: true, user: null }),
}));

const makeDog = (id: string, name: string): NormalizedDog => ({
  provider: "rescuegroups",
  externalId: id,
  name,
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
  photos: [`https://example.test/${id}.jpg`],
  shelterName: "Happy Paws",
  description: null,
  distance: 5,
});

const ANON_COMPAT = {
  available: false as const,
  teaser: "Create your profile to unlock compatibility matching.",
};

const THREE_RESULTS = [
  { dog: makeDog("rg-001", "Charlie"), compatibility: ANON_COMPAT },
  { dog: makeDog("rg-002", "Bella"), compatibility: ANON_COMPAT },
  { dog: makeDog("rg-003", "Max"), compatibility: ANON_COMPAT },
];

describe("SearchResults", () => {
  it("shows 'Showing Nearby Dogs' sort label", () => {
    render(<SearchResults results={THREE_RESULTS} zip="10001" />);
    expect(screen.getByText(/showing nearby dogs/i)).toBeInTheDocument();
  });

  it("renders a DogCard for each result", () => {
    render(<SearchResults results={THREE_RESULTS} zip="10001" />);
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Bella")).toBeInTheDocument();
    expect(screen.getByText("Max")).toBeInTheDocument();
  });

  it("renders the result count", () => {
    render(<SearchResults results={THREE_RESULTS} zip="10001" />);
    expect(screen.getByText(/3.*dogs? found/i)).toBeInTheDocument();
  });

  it("renders empty state when results array is empty", () => {
    render(<SearchResults results={[]} zip="10001" />);
    expect(
      screen.getByText(/no dogs found near 10001/i)
    ).toBeInTheDocument();
  });

  it("renders the compatibility score for authenticated results", () => {
    const AUTH_COMPAT = {
      available: true as const,
      result: {
        compatibilityScore: 91,
        matchLabel: "Strong Match" as const,
        confidenceScore: 80,
        confidenceLabel: "High" as const,
        breakdown: [],
        positiveFactors: ["Good with kids"],
        concerns: [],
        shelterQuestions: [],
      },
    };
    render(
      <SearchResults
        results={[{ dog: makeDog("rg-1", "Rex"), compatibility: AUTH_COMPAT }]}
        zip="10001"
      />,
    );
    expect(screen.getByText(/91%/)).toBeInTheDocument();
  });

  it("uses a nationwide header when no zip is provided", () => {
    render(<SearchResults results={THREE_RESULTS} zip="" />);
    expect(screen.getByText(/showing your matches/i)).toBeInTheDocument();
  });
});
