// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";

// All vi.mock calls are hoisted — must appear before route import.
vi.mock("@/lib/ai/explainer", () => ({
  generateExplanation: vi.fn(),
  FALLBACK_EXPLANATION: "Fallback.",
}));
vi.mock("@/lib/rescuegroups/client");
vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { adopterProfile: { findUnique: vi.fn() } },
}));

import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { generateExplanation } from "@/lib/ai/explainer";
import { GET } from "@/app/api/dogs/search/route";

const mockSearch = vi.mocked(searchRescueGroupsDogs);

const MOCK_RAW: RescueGroupsRawDog = {
  animals: {
    name: "Biscuit",
    breeds: { primary: "Lab" },
    ageGroup: "Adult",
    sizeGroup: "Medium",
    isKidsOk: true,
    isCatsOk: true,
    isDogsOk: true,
    energyLevel: "Moderate",
    activityLevel: "Moderate",
    exerciseNeeds: "Moderate",
    isSpecialNeeds: false,
    isYardRequired: false,
    fenceNeeds: "Not required",
    ownerExperience: "None",
    photos: [],
    description: "A dog.",
  },
  shelters: { name: "Shelter", adoptionUrl: "https://example.test" },
};

describe("Search route AI isolation", () => {
  it("AI-SEARCH-001: search route never calls generateExplanation", async () => {
    mockSearch.mockResolvedValue({ dogs: [{ id: "rg-001", raw: MOCK_RAW }], hasMore: false });

    const req = new NextRequest("http://localhost/api/dogs/search?zip=10001");
    await GET(req);

    expect(vi.mocked(generateExplanation)).not.toHaveBeenCalled();
  });
});
