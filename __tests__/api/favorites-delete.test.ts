import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetOrCreateUser = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: mockGetOrCreateUser,
}));

const mockDeleteMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    favorite: {
      deleteMany: mockDeleteMany,
    },
  },
}));

import { DELETE } from "@/app/api/favorites/[provider]/[externalId]/route";

const FAKE_USER = { id: "user-1", clerkUserId: "clerk-1", email: "test@example.com" };

function makeDeleteRequest() {
  return new NextRequest(
    "http://localhost/api/favorites/rescuegroups/rg-123",
    { method: "DELETE" },
  );
}

const FAKE_PARAMS = Promise.resolve({ provider: "rescuegroups", externalId: "rg-123" });

describe("DELETE /api/favorites/[provider]/[externalId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("FAVOR-006: authenticated user, favorite exists — returns 204", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);
    mockDeleteMany.mockResolvedValue({ count: 1 });

    const res = await DELETE(makeDeleteRequest(), { params: FAKE_PARAMS });

    expect(res.status).toBe(204);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", provider: "rescuegroups", externalId: "rg-123" },
    });
  });

  it("FAVOR-007: authenticated user, favorite not found — returns 404", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);
    mockDeleteMany.mockResolvedValue({ count: 0 });

    const res = await DELETE(makeDeleteRequest(), { params: FAKE_PARAMS });

    expect(res.status).toBe(404);
  });

  it("FAVOR-008: unauthenticated — returns 401", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);

    const res = await DELETE(makeDeleteRequest(), { params: FAKE_PARAMS });

    expect(res.status).toBe(401);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });
});
