// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DogDetailClient } from "@/app/dogs/[provider]/[externalId]/DogDetailClient";
import type { NormalizedDog } from "@/lib/compatibility/types";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ isSignedIn: false, isLoaded: true, user: null }),
}));

const PHOTOS = Array.from({ length: 6 }, (_, i) => `https://example.test/charlie-${i}.jpg`);

const MULTI_DOG: NormalizedDog = {
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
  photos: PHOTOS,
  description: "A friendly pup.",
  shelterName: "Happy Paws Rescue",
  shelterUrl: "https://happypaws.org/adopt/charlie",
  distance: 3,
};

const ANON = { available: false as const, teaser: "Create a profile." };

describe("DogDetailClient — interactive gallery", () => {
  it("GAL-001: clicking a thumbnail swaps the hero image", () => {
    render(<DogDetailClient dog={MULTI_DOG} compatibility={ANON} />);
    const hero = () => screen.getByRole("img", { name: /charlie/i });
    expect(hero()).toHaveAttribute("src", PHOTOS[0]);

    fireEvent.click(screen.getByRole("button", { name: /view photo 2/i }));

    expect(hero()).toHaveAttribute("src", PHOTOS[1]);
  });

  it("GAL-002: 'View all' opens a lightbox; Next advances; Close dismisses", () => {
    render(<DogDetailClient dog={MULTI_DOG} compatibility={ANON} />);

    fireEvent.click(screen.getByRole("button", { name: /view all/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("1 / 6")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next photo/i }));
    expect(within(screen.getByRole("dialog")).getByText("2 / 6")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
