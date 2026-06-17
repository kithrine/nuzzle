import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetOrCreateUser = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: mockGetOrCreateUser,
}));

const mockCreate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    analyticsEvent: {
      create: mockCreate,
    },
  },
}));

const mockGetRescueGroupsDog = vi.hoisted(() => vi.fn());
vi.mock("@/lib/rescuegroups/client", () => ({
  getRescueGroupsDog: mockGetRescueGroupsDog,
}));

const mockNormalize = vi.hoisted(() => vi.fn());
vi.mock("@/lib/compatibility/normalize", () => ({
  normalizeRescueGroupsDog: mockNormalize,
}));

import { POST } from "@/app/api/dogs/[provider]/[externalId]/shelter-click/route";

const FAKE_USER = { id: "user-1", clerkUserId: "clerk-1", email: "test@example.com" };
const FAKE_RAW = { id: "rg-123", raw: {} };
const SHELTER_URL = "https://shelter.example.com/dog-123";
const FAKE_DOG = {
  provider: "rescuegroups" as const,
  externalId: "rg-123",
  shelterUrl: SHELTER_URL,
  name: "Buddy",
  breed: null,
  ageGroup: "Adult" as const,
  sizeGroup: "Medium" as const,
  energyLevel: "Moderate" as const,
  activityLevel: "Moderate" as const,
  exerciseNeeds: "Moderate" as const,
  isKidsOk: "Unknown" as const,
  isCatsOk: "Unknown" as const,
  isDogsOk: "Unknown" as const,
  isSpecialNeeds: false,
  isYardRequired: "Unknown" as const,
  fenceNeeds: "Unknown" as const,
  ownerExperience: "None" as const,
  photos: [],
  description: null,
  distance: null,
};

const FAKE_PARAMS = Promise.resolve({ provider: "rescuegroups", externalId: "rg-123" });

function makeRequest(body?: object) {
  return new NextRequest(
    "http://localhost/api/dogs/rescuegroups/rg-123/shelter-click",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    },
  );
}

describe("POST /api/dogs/[provider]/[externalId]/shelter-click", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRescueGroupsDog.mockResolvedValue(FAKE_RAW);
    mockNormalize.mockReturnValue(FAKE_DOG);
    mockCreate.mockResolvedValue({ id: "evt-1" });
  });

  it("SHLT-001: authenticated user — creates shelter_click event with userId, returns shelterUrl", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);

    const res = await POST(makeRequest(), { params: FAKE_PARAMS });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.shelterUrl).toBe(SHELTER_URL);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        anonymousId: null,
        eventName: "shelter_click",
        eventData: expect.objectContaining({ shelterUrl: SHELTER_URL }),
      },
    });
  });

  it("SHLT-002: anonymous user with anonymousId — creates event with anonymousId, userId null", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);

    const res = await POST(makeRequest({ anonymousId: "anon-xyz" }), { params: FAKE_PARAMS });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.shelterUrl).toBe(SHELTER_URL);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: null,
        anonymousId: "anon-xyz",
        eventName: "shelter_click",
        eventData: expect.objectContaining({ shelterUrl: SHELTER_URL }),
      },
    });
  });

  it("SHLT-003: dog not found — returns 404", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);
    mockGetRescueGroupsDog.mockResolvedValue(null);

    const res = await POST(makeRequest(), { params: FAKE_PARAMS });

    expect(res.status).toBe(404);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
