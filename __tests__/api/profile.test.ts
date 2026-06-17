import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    adopterProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { GET, POST, PUT } from "@/app/api/profile/route";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";

const mockGetOrCreateUser = vi.mocked(getOrCreateUser);
const mockFindUnique = vi.mocked(prisma.adopterProfile.findUnique);
const mockCreate = vi.mocked(prisma.adopterProfile.create);
const mockUpdate = vi.mocked(prisma.adopterProfile.update);

const FAKE_USER = {
  id: "db_user_1",
  clerkUserId: "clerk_abc",
  email: "ada@test.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const VALID_PHASE1 = {
  homeType: "Apartment",
  hasChildren: false,
  hasCats: true,
  hasOtherDogs: false,
  activityLevel: "Moderate",
  experienceLevel: "None",
};

function makeRequest(body: object, method = "POST") {
  return new NextRequest("http://localhost/api/profile", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("QUEST-001: POST with all required Phase 1 fields creates profile and returns profileVersion 1", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER as never);
    mockCreate.mockResolvedValue({
      ...VALID_PHASE1,
      id: "profile_1",
      userId: "db_user_1",
      profileVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const res = await POST(makeRequest(VALID_PHASE1));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.profileVersion).toBe(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "db_user_1",
          homeType: "Apartment",
          hasChildren: false,
          activityLevel: "Moderate",
        }),
      })
    );
  });

  it("QUEST-002: POST without required Phase 1 fields returns 422", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER as never);

    const res = await POST(makeRequest({ homeType: "Apartment" }));

    expect(res.status).toBe(422);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("QUEST-003: PUT updates profile and returns incremented profileVersion", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER as never);
    mockUpdate.mockResolvedValue({ profileVersion: 2 } as never);

    const res = await PUT(makeRequest({ activityLevel: "High" }, "PUT"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.profileVersion).toBe(2);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "db_user_1" },
        data: expect.objectContaining({ profileVersion: { increment: 1 } }),
      })
    );
  });

  it("QUEST-004: GET returns existing profile", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER as never);
    mockFindUnique.mockResolvedValue({
      ...VALID_PHASE1,
      id: "profile_1",
      userId: "db_user_1",
      profileVersion: 1,
    } as never);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.homeType).toBe("Apartment");
    expect(body.profileVersion).toBe(1);
  });

  it("QUEST-005: all handlers return 401 when not authenticated", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);

    const [getRes, postRes, putRes] = await Promise.all([
      GET(),
      POST(makeRequest(VALID_PHASE1)),
      PUT(makeRequest({ activityLevel: "High" }, "PUT")),
    ]);

    expect(getRes.status).toBe(401);
    expect(postRes.status).toBe(401);
    expect(putRes.status).toBe(401);
  });
});
