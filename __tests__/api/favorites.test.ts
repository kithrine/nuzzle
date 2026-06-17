import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetOrCreateUser = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: mockGetOrCreateUser,
}));

const mockCreate = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    favorite: {
      create: mockCreate,
      findMany: mockFindMany,
    },
  },
}));

import { GET, POST } from "@/app/api/favorites/route";

const FAKE_USER = { id: "user-1", clerkUserId: "clerk-1", email: "test@example.com" };

function makePostRequest(body: object) {
  return new NextRequest("http://localhost/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest() {
  return new NextRequest("http://localhost/api/favorites", { method: "GET" });
}

describe("POST /api/favorites", () => {
  beforeEach(() => vi.clearAllMocks());

  it("FAVOR-001: authenticated user adds a new favorite — returns 201", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);
    const fakeFavorite = {
      id: "fav-1",
      provider: "rescuegroups",
      externalId: "rg-123",
      createdAt: new Date("2024-01-01"),
    };
    mockCreate.mockResolvedValue(fakeFavorite);

    const res = await POST(makePostRequest({ provider: "rescuegroups", externalId: "rg-123" }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("fav-1");
    expect(body.provider).toBe("rescuegroups");
    expect(body.externalId).toBe("rg-123");
    expect(mockCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", provider: "rescuegroups", externalId: "rg-123" },
    });
  });

  it("FAVOR-002: duplicate favorite — returns 409 with DUPLICATE error code", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);
    const { Prisma } = await import("@prisma/client");
    const dupError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "5.0.0",
    });
    mockCreate.mockRejectedValue(dupError);

    const res = await POST(makePostRequest({ provider: "rescuegroups", externalId: "rg-123" }));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("DUPLICATE");
  });

  it("FAVOR-003: unauthenticated — returns 401", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);

    const res = await POST(makePostRequest({ provider: "rescuegroups", externalId: "rg-123" }));

    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("GET /api/favorites", () => {
  beforeEach(() => vi.clearAllMocks());

  it("FAVOR-004: authenticated user — returns 200 with favorites array", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);
    const fakeFavorites = [
      { id: "fav-1", provider: "rescuegroups", externalId: "rg-111", createdAt: new Date() },
      { id: "fav-2", provider: "rescuegroups", externalId: "rg-222", createdAt: new Date() },
    ];
    mockFindMany.mockResolvedValue(fakeFavorites);

    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
    expect(body[0].externalId).toBe("rg-111");
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("FAVOR-005: unauthenticated — returns 401", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);

    const res = await GET(makeGetRequest());

    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
