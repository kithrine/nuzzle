// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedDogs } from "@/components/FeaturedDogs";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";

// getFeaturedPool wraps the fetch in unstable_cache, which needs Next's runtime
// context — mock it as a passthrough so the loader runs the (mocked) client.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/lib/rescuegroups/client", () => ({
  searchRescueGroupsDogs: vi.fn(),
}));

const mockedSearch = vi.mocked(searchRescueGroupsDogs);

function rawDog(name: string, breed: string): RescueGroupsRawDog {
  return {
    animals: {
      name,
      breeds: { primary: breed },
      ageGroup: "Young",
      photos: [`https://example.test/${name}.jpg`],
    },
    shelters: { name: "Happy Paws", adoptionUrl: "https://happypaws.org" },
  };
}

beforeEach(() => {
  mockedSearch.mockReset();
});

describe("FeaturedDogs", () => {
  it("links each card to that dog's real detail page", async () => {
    mockedSearch.mockResolvedValue({
      dogs: [
        { id: "rg-1", raw: rawDog("Rex", "Beagle") },
        { id: "rg-2", raw: rawDog("Sadie", "Boxer") },
      ],
      hasMore: false,
    });

    render(await FeaturedDogs());

    const rexLink = screen.getByRole("link", { name: /rex/i });
    expect(rexLink).toHaveAttribute("href", "/dogs/rescuegroups/rg-1");
    const sadieLink = screen.getByRole("link", { name: /sadie/i });
    expect(sadieLink).toHaveAttribute("href", "/dogs/rescuegroups/rg-2");
  });

  it("falls back to a Browse link when no dogs are returned", async () => {
    mockedSearch.mockResolvedValue({ dogs: [], hasMore: false });

    render(await FeaturedDogs());

    const browseLink = screen.getByRole("link", { name: /browse all available dogs/i });
    expect(browseLink).toHaveAttribute("href", "/search");
  });

  it("falls back gracefully when the provider call fails", async () => {
    mockedSearch.mockRejectedValue(new Error("provider down"));

    render(await FeaturedDogs());

    expect(
      screen.getByRole("link", { name: /browse all available dogs/i }),
    ).toBeInTheDocument();
  });
});
