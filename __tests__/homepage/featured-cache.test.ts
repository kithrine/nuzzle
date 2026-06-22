import { describe, expect, it, vi, beforeEach } from "vitest";
import { unstable_cache } from "next/cache";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import {
  FEATURED_REVALIDATE_SECONDS,
  getFeaturedPool,
} from "@/lib/homepage/featured-data";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";

// unstable_cache needs Next's runtime context; mock it as an arg-capturing
// passthrough so we can both run the loader and assert how it's configured.
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

vi.mock("@/lib/rescuegroups/client", () => ({
  searchRescueGroupsDogs: vi.fn(),
}));

const mockedCache = vi.mocked(unstable_cache);
const mockedSearch = vi.mocked(searchRescueGroupsDogs);

function rawDog(name: string): RescueGroupsRawDog {
  return {
    animals: {
      name,
      breeds: { primary: "Beagle" },
      ageGroup: "Young",
      photos: [`https://example.test/${name}.jpg`],
    },
    shelters: { name: "Happy Paws", adoptionUrl: "https://happypaws.org" },
  };
}

beforeEach(() => {
  mockedCache.mockClear();
  mockedSearch.mockReset();
  mockedSearch.mockResolvedValue({ dogs: [{ id: "rg-1", raw: rawDog("Rex") }], hasMore: false });
});

describe("featured-data caching", () => {
  it("uses a 5-hour revalidate window", () => {
    expect(FEATURED_REVALIDATE_SECONDS).toBe(18000);
  });

  it("wraps the fetch in unstable_cache keyed by the window seed with a 5h revalidate", async () => {
    await getFeaturedPool(10);

    expect(mockedCache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.arrayContaining(["10"]),
      expect.objectContaining({ revalidate: 18000 }),
    );
  });

  it("fetches the seed-derived page nationwide (no zip)", async () => {
    await getFeaturedPool(10); // page = (10 % 8) + 1 = 3

    expect(mockedSearch).toHaveBeenCalledTimes(1);
    expect(mockedSearch).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, limit: 40 }),
    );
    // nationwide: no zip in the params
    expect(mockedSearch.mock.calls[0][0]).not.toHaveProperty("zip");
  });

  it("returns normalized dogs", async () => {
    const pool = await getFeaturedPool(10);
    expect(pool).toHaveLength(1);
    expect(pool[0].name).toBe("Rex");
  });
});
