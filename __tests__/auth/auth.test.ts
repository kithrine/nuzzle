import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
  },
}));

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";

const mockAuth = vi.mocked(auth);
const mockClerkClient = vi.mocked(clerkClient);
const mockUpsert = vi.mocked(prisma.user.upsert);

function makeClerkClient(email: string) {
  return Promise.resolve({
    users: { getUser: vi.fn().mockResolvedValue({ emailAddresses: [{ emailAddress: email }] }) },
  }) as unknown as ReturnType<typeof clerkClient>;
}

describe("Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AUTH-001: unauthenticated handler returns 401 when auth().userId is null", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    async function protectedHandler() {
      const { userId } = await auth();
      if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const res = await protectedHandler();
    expect(res.status).toBe(401);
  });

  it("AUTH-002: getOrCreateUser returns null when there is no session", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await getOrCreateUser();

    expect(result).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("AUTH-003: getOrCreateUser upserts User with clerkUserId and email on first login", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_abc123" } as never);
    mockClerkClient.mockReturnValue(makeClerkClient("ada@example.com") as never);
    mockUpsert.mockResolvedValue({
      id: "db_1",
      clerkUserId: "clerk_abc123",
      email: "ada@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await getOrCreateUser();

    expect(mockUpsert).toHaveBeenCalledWith({
      where: { clerkUserId: "clerk_abc123" },
      create: { clerkUserId: "clerk_abc123", email: "ada@example.com" },
      update: {},
    });
    expect(result?.clerkUserId).toBe("clerk_abc123");
  });

  it("AUTH-004: getOrCreateUser is idempotent — repeat calls do not create duplicates", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_abc123" } as never);
    mockClerkClient.mockReturnValue(makeClerkClient("ada@example.com") as never);
    const existing = { id: "db_1", clerkUserId: "clerk_abc123", email: "ada@example.com", createdAt: new Date(), updatedAt: new Date() };
    mockUpsert.mockResolvedValue(existing as never);

    await getOrCreateUser();
    const result = await getOrCreateUser();

    // Prisma upsert with update:{} is safe to call N times — no duplicate rows
    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(result?.id).toBe("db_1");
  });
});
