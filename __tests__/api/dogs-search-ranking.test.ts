// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";

// All vi.mock calls are hoisted — must appear before route import.
vi.mock("@/lib/rescuegroups/client");
vi.mock("@/lib/compatibility/normalize");
vi.mock("@/lib/compatibility/engine");
vi.mock("@/lib/auth/get-or-create-user");
vi.mock("@/lib/db/prisma", () => ({
  prisma: { adopterProfile: { findUnique: vi.fn() } },
}));

import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { GET } from "@/app/api/dogs/search/route";

const mockSearch = vi.mocked(searchRescueGroupsDogs);
const mockNormalize = vi.mocked(normalizeRescueGroupsDog);
const mockCalculate = vi.mocked(calculateCompatibility);
const mockGetOrCreateUser = vi.mocked(getOrCreateUser);
const mockFindUnique = vi.mocked(prisma.adopterProfile.findUnique);

const MOCK_RAW: RescueGroupsRawDog = {
  animals: {
    name: "Dog",
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

const MOCK_PROFILE = {
  id: "p1",
  userId: "u1",
  homeType: "House",
  hasChildren: false,
  hasCats: false,
  hasOtherDogs: false,
  activityLevel: "Moderate",
  experienceLevel: "None",
  profileVersion: 1,
  hasYard: null,
  hasFence: null,
  groomingTolerance: null,
  sizePreference: null,
  specialNeedsWilling: null,
  maxDistance: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BASE_DOG: NormalizedDog = {
  provider: "rescuegroups",
  externalId: "x",
  name: "Dog",
  breed: "Lab",
  ageGroup: "Adult",
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
  distance: 10,
};

const BASE_COMPAT: CompatibilityResult = {
  compatibilityScore: 80,
  matchLabel: "Good Match",
  confidenceScore: 100,
  confidenceLabel: "High",
  breakdown: [],
  positiveFactors: [],
  concerns: [],
  shelterQuestions: [],
};

function makeRequest(qs: string) {
  return new NextRequest(`http://localhost/api/dogs/search${qs}`);
}

describe("GET /api/dogs/search — Ranking", () => {
  afterEach(() => vi.resetAllMocks());

  it("RANK-001: higher compatibility score ranks first", async () => {
    // mockSearch returns [DogB, DogA] — wrong order, ranking should fix it
    mockSearch.mockResolvedValueOnce({
      dogs: [
        { id: "dog-b", raw: MOCK_RAW },
        { id: "dog-a", raw: MOCK_RAW },
      ],
      hasMore: false,
    });
    mockNormalize
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog B", distance: 20 })
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog A", distance: 10 });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 70 }) // Dog B
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 90 }); // Dog A
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results[0].dog.name).toBe("Dog A");
    expect(body.results[1].dog.name).toBe("Dog B");
    expect(body.sort).toBe("best_match");
  });

  it("RANK-002: equal compatibility → higher confidence ranks first", async () => {
    mockSearch.mockResolvedValueOnce({
      dogs: [
        { id: "dog-b", raw: MOCK_RAW },
        { id: "dog-a", raw: MOCK_RAW },
      ],
      hasMore: false,
    });
    mockNormalize
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog B" })
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog A" });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 70 }) // Dog B
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 90 }); // Dog A
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(body.results[0].dog.name).toBe("Dog A");
    expect(body.results[1].dog.name).toBe("Dog B");
  });

  it("RANK-003: equal compatibility and confidence → shorter distance ranks first", async () => {
    mockSearch.mockResolvedValueOnce({
      dogs: [
        { id: "dog-b", raw: MOCK_RAW },
        { id: "dog-a", raw: MOCK_RAW },
      ],
      hasMore: false,
    });
    mockNormalize
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog B", distance: 30 })
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog A", distance: 10 });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 90 }) // Dog B
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 90 }); // Dog A
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest("?zip=10001"));
    const body = await res.json();

    expect(body.results[0].dog.name).toBe("Dog A");
    expect(body.results[1].dog.name).toBe("Dog B");
  });
});
