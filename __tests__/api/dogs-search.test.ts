// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ProviderError, RateLimitError } from "@/lib/rescuegroups/types";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";

// Must be hoisted before the route import so the route receives the mock.
vi.mock("@/lib/rescuegroups/client");

import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { GET } from "@/app/api/dogs/search/route";

const mockSearch = vi.mocked(searchRescueGroupsDogs);

const MOCK_RAW_DOG: RescueGroupsRawDog = {
  animals: {
    name: "Biscuit",
    breeds: { primary: "Labrador Mix" },
    ageGroup: "Young",
    sizeGroup: "Medium",
    isKidsOk: true,
    isCatsOk: false,
    isDogsOk: true,
    energyLevel: "High",
    activityLevel: "High",
    exerciseNeeds: "High",
    isSpecialNeeds: false,
    isYardRequired: true,
    fenceNeeds: "Any type",
    ownerExperience: "Species",
    photos: ["https://example.test/biscuit.jpg"],
    description: "A playful pup.",
  },
  shelters: {
    name: "Happy Paws",
    adoptionUrl: "https://example.test/adopt/biscuit",
  },
};

function makeRequest(qs: string) {
  return new NextRequest(`http://localhost/api/dogs/search${qs}`);
}

describe("GET /api/dogs/search", () => {
  afterEach(() => vi.resetAllMocks());

  it("successful search returns dogs array in anonymous response shape", async () => {
    mockSearch.mockResolvedValueOnce({
      dogs: [{ id: "rg-001", raw: MOCK_RAW_DOG }],
      hasMore: false,
    });

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(1);
    expect(body.results[0].dog.provider).toBe("rescuegroups");
    expect(body.results[0].dog.externalId).toBe("rg-001");
    expect(body.results[0].dog.name).toBe("Biscuit");
    expect(body.compatibility.available).toBe(false);
    expect(body.compatibility.teaser).toMatch(/profile/i);
    expect(typeof body.page).toBe("number");
    expect(typeof body.hasMore).toBe("boolean");
  });

  it("empty results returns empty array, not an error", async () => {
    mockSearch.mockResolvedValueOnce({ dogs: [], hasMore: false });

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toEqual([]);
  });

  it("RescueGroups unavailable → 503 with PROVIDER_ERROR code", async () => {
    mockSearch.mockRejectedValueOnce(new ProviderError("timeout"));

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error.code).toBe("PROVIDER_ERROR");
  });

  it("rate limit from provider → 429, not 500", async () => {
    mockSearch.mockRejectedValueOnce(new RateLimitError());

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error.code).toBe("RATE_LIMITED");
  });

  it("pagination params are forwarded to the client", async () => {
    mockSearch.mockResolvedValueOnce({ dogs: [], hasMore: true });

    await GET(makeRequest("?zip=10001&page=2&limit=5"));

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ zip: "10001", page: 2, limit: 5 })
    );
  });
});
