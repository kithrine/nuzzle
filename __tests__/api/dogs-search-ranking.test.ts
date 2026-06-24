// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";

// All vi.mock calls are hoisted — must appear before route import.
vi.mock("@/lib/rescuegroups/client");
vi.mock("@/lib/search/candidate-pool");
vi.mock("@/lib/compatibility/normalize");
vi.mock("@/lib/compatibility/engine");
vi.mock("@/lib/auth/get-or-create-user");
vi.mock("@/lib/db/prisma", () => ({
  prisma: { adopterProfile: { findUnique: vi.fn() } },
}));

import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { getCandidatePool } from "@/lib/search/candidate-pool";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { GET } from "@/app/api/dogs/search/route";

const mockSearch = vi.mocked(searchRescueGroupsDogs);
const mockGetPool = vi.mocked(getCandidatePool);
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

function dog(name: string, over: Partial<NormalizedDog> = {}): NormalizedDog {
  return { ...BASE_DOG, name, externalId: name, ...over };
}

function makeRequest(qs: string) {
  return new NextRequest(`http://localhost/api/dogs/search${qs}`);
}

describe("GET /api/dogs/search — Ranking", () => {
  afterEach(() => vi.resetAllMocks());

  // ── Best match (profiled, no zip) ranks the cached candidate pool ───────────

  it("RANK-001: higher compatibility score ranks first", async () => {
    // Pool comes back in the wrong order; ranking should fix it.
    mockGetPool.mockResolvedValueOnce({
      pool: [dog("Dog B", { distance: 20 }), dog("Dog A", { distance: 10 })],
      total: 2,
    });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 70 }) // Dog B
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 90 }); // Dog A
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest(""));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results[0].dog.name).toBe("Dog A");
    expect(body.results[1].dog.name).toBe("Dog B");
    expect(body.sort).toBe("best_match");
  });

  it("RANK-002: equal compatibility → higher confidence ranks first", async () => {
    mockGetPool.mockResolvedValueOnce({
      pool: [dog("Dog B"), dog("Dog A")],
      total: 2,
    });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 70 }) // Dog B
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 90 }); // Dog A
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest(""));
    const body = await res.json();

    expect(body.results[0].dog.name).toBe("Dog A");
    expect(body.results[1].dog.name).toBe("Dog B");
  });

  it("RANK-003: equal compatibility and confidence → shorter distance ranks first", async () => {
    mockGetPool.mockResolvedValueOnce({
      pool: [dog("Dog B", { distance: 30 }), dog("Dog A", { distance: 10 })],
      total: 2,
    });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 90 }) // Dog B
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 80, confidenceScore: 90 }); // Dog A
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest(""));
    const body = await res.json();

    expect(body.results[0].dog.name).toBe("Dog A");
    expect(body.results[1].dog.name).toBe("Dog B");
  });

  it("RANK-005: best match ranks across the WHOLE pool, not just the first page", async () => {
    // 30 candidates; the best match sits deep in the pool (index 25). A page-only
    // ranking would never surface it — a pool-wide ranking must.
    const pool = Array.from({ length: 30 }, (_, i) => dog(`Dog ${i}`));
    mockGetPool.mockResolvedValueOnce({ pool, total: 30 });
    mockCalculate.mockImplementation((_p, d) => ({
      ...BASE_COMPAT,
      compatibilityScore: d.name === "Dog 25" ? 99 : 50,
    }));
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest(""));
    const body = await res.json();

    expect(body.results[0].dog.name).toBe("Dog 25");
    expect(body.total).toBe(30);
  });

  it("RANK-006: two different profiles surface different top dogs from the same pool", async () => {
    const pool = [dog("Dog X"), dog("Dog Y")];
    mockGetPool.mockResolvedValue({ pool, total: 2 });
    mockGetOrCreateUser.mockResolvedValue({ id: "u1" } as never);
    mockFindUnique.mockResolvedValue(MOCK_PROFILE as never);

    // Profile that favors Dog X.
    mockCalculate.mockImplementation((_p, d) => ({
      ...BASE_COMPAT,
      compatibilityScore: d.name === "Dog X" ? 90 : 40,
    }));
    const bodyA = await (await GET(makeRequest(""))).json();

    // Profile that favors Dog Y.
    mockCalculate.mockImplementation((_p, d) => ({
      ...BASE_COMPAT,
      compatibilityScore: d.name === "Dog Y" ? 90 : 40,
    }));
    const bodyB = await (await GET(makeRequest(""))).json();

    expect(bodyA.results[0].dog.name).toBe("Dog X");
    expect(bodyB.results[0].dog.name).toBe("Dog Y");
  });

  // ── ZIP search stays nearest-first (single-page distance path) ──────────────

  it("RANK-004: ZIP set → nearest first (distance), even over higher compatibility; scores still shown", async () => {
    mockSearch.mockResolvedValueOnce({
      dogs: [
        { id: "dog-far", raw: MOCK_RAW },
        { id: "dog-near", raw: MOCK_RAW },
      ],
      hasMore: false,
    });
    mockNormalize
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog Far", distance: 50 })
      .mockReturnValueOnce({ ...BASE_DOG, name: "Dog Near", distance: 5 });
    mockCalculate
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 95 }) // Dog Far — higher compat
      .mockReturnValueOnce({ ...BASE_COMPAT, compatibilityScore: 60 }); // Dog Near — lower compat
    mockGetOrCreateUser.mockResolvedValueOnce({ id: "u1" } as never);
    mockFindUnique.mockResolvedValueOnce(MOCK_PROFILE as never);

    const res = await GET(makeRequest("?zip=90210"));
    const body = await res.json();

    expect(body.sort).toBe("distance");
    expect(body.results[0].dog.name).toBe("Dog Near"); // nearest first despite lower compatibility
    expect(body.results[1].dog.name).toBe("Dog Far");
    expect(body.results[0].compatibility.compatibilityScore).toBe(60);
  });
});
