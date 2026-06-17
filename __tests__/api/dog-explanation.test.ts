// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";

vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    adopterProfile: { findUnique: vi.fn() },
    compatibilityScore: { findFirst: vi.fn(), create: vi.fn() },
    aiExplanation: { create: vi.fn() },
  },
}));

vi.mock("@/lib/ai/explainer", () => ({
  generateExplanation: vi.fn(),
  FALLBACK_EXPLANATION: "Fallback explanation text.",
}));

import { POST } from "@/app/api/dogs/[provider]/[externalId]/explanation/route";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { generateExplanation } from "@/lib/ai/explainer";

const mockGetOrCreateUser = vi.mocked(getOrCreateUser);
const mockFindProfile = vi.mocked(prisma.adopterProfile.findUnique);
const mockFindFirst = vi.mocked(prisma.compatibilityScore.findFirst);
const mockCreateScore = vi.mocked(prisma.compatibilityScore.create);
const mockCreateAi = vi.mocked(prisma.aiExplanation.create);
const mockGenerate = vi.mocked(generateExplanation);

const FAKE_USER = {
  id: "user_1",
  clerkUserId: "clerk_1",
  email: "test@test.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const FAKE_PROFILE = {
  id: "profile_1",
  userId: "user_1",
  profileVersion: 1,
  homeType: "House",
  hasChildren: false,
  hasCats: false,
  hasOtherDogs: false,
  activityLevel: "Moderate",
  experienceLevel: "None",
};

const MOCK_RESULT: CompatibilityResult = {
  compatibilityScore: 78,
  matchLabel: "Good Match",
  confidenceScore: 80,
  confidenceLabel: "High",
  breakdown: [],
  positiveFactors: ["Good with kids."],
  concerns: [],
  shelterQuestions: [],
};

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
  photos: [],
  description: null,
  distance: null,
};

function makeRequest(body: object) {
  return new NextRequest(
    "http://localhost/api/dogs/rescuegroups/rg-123/explanation",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
  );
}

describe("POST /api/dogs/[provider]/[externalId]/explanation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("AI-CACHE-001: first request generates explanation and stores it", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER as never);
    mockFindProfile.mockResolvedValue(FAKE_PROFILE as never);
    mockFindFirst.mockResolvedValue(null);
    mockCreateScore.mockResolvedValue({ id: "score_1" } as never);
    mockCreateAi.mockResolvedValue({} as never);
    mockGenerate.mockResolvedValue("Charlie is a great match.");

    const res = await POST(makeRequest({ result: MOCK_RESULT, dog: MOCK_DOG }), {
      params: Promise.resolve({ provider: "rescuegroups", externalId: "rg-123" }),
    });
    const body = await res.json();

    expect(body.explanation).toBe("Charlie is a great match.");
    expect(mockGenerate).toHaveBeenCalledOnce();
    expect(mockCreateAi).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ model: "llama-3.3-70b-versatile" }),
      }),
    );
  });

  it("AI-CACHE-002: second request returns cached explanation without calling generateExplanation", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER as never);
    mockFindProfile.mockResolvedValue(FAKE_PROFILE as never);
    mockFindFirst.mockResolvedValue({
      id: "score_1",
      aiExplanations: [{ explanationJson: { text: "Cached text." } }],
    } as never);

    const res = await POST(makeRequest({ result: MOCK_RESULT, dog: MOCK_DOG }), {
      params: Promise.resolve({ provider: "rescuegroups", externalId: "rg-123" }),
    });
    const body = await res.json();

    expect(body.explanation).toBe("Cached text.");
    expect(mockGenerate).not.toHaveBeenCalled();
  });
});
