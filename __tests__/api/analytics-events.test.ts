import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetOrCreateUser = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/get-or-create-user", () => ({
  getOrCreateUser: mockGetOrCreateUser,
}));

const mockCreate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/prisma", () => ({
  prisma: { analyticsEvent: { create: mockCreate } },
}));

const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal("fetch", mockFetch);

import { POST } from "@/app/api/analytics/events/route";
import { track } from "@/lib/analytics/track";

const FAKE_USER = { id: "user-1", clerkUserId: "clerk-1", email: "test@example.com" };

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analytics/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: "evt-1" });
  });

  it("ANLYT-001: authenticated user — stores event with userId, returns 201", async () => {
    mockGetOrCreateUser.mockResolvedValue(FAKE_USER);
    const res = await POST(
      makeRequest({ eventName: "dog_viewed", eventData: { dogExternalId: "rg-123" } }),
    );
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        anonymousId: null,
        eventName: "dog_viewed",
        eventData: { dogExternalId: "rg-123" },
      },
    });
  });

  it("ANLYT-002: anonymous user with anonymousId — stores event with anonymousId, userId null", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);
    const res = await POST(
      makeRequest({
        eventName: "search_performed",
        eventData: { query: "labrador" },
        anonymousId: "anon-abc",
      }),
    );
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: null,
        anonymousId: "anon-abc",
        eventName: "search_performed",
        eventData: { query: "labrador" },
      },
    });
  });

  it("ANLYT-003: invalid eventName — returns 422 VALIDATION_ERROR", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ eventName: "not_a_real_event", eventData: {} }));
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("ANLYT-004: eventData contains PII key 'email' — returns 422 VALIDATION_ERROR", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);
    const res = await POST(
      makeRequest({
        eventName: "dog_viewed",
        eventData: { dogExternalId: "rg-123", email: "user@example.com" },
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toMatch(/PII/);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("ANLYT-005: eventData contains PII key 'phone' — returns 422 VALIDATION_ERROR", async () => {
    mockGetOrCreateUser.mockResolvedValue(null);
    const res = await POST(
      makeRequest({
        eventName: "dog_viewed",
        eventData: { dogExternalId: "rg-123", phone: "555-1234" },
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("track() client utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response(null, { status: 201 }));
  });

  it("ANLYT-006: track() returns void immediately (fire-and-forget), calls fetch with correct args", () => {
    const result = track("dog_viewed", { dogExternalId: "rg-123" });
    expect(result).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: "dog_viewed", eventData: { dogExternalId: "rg-123" } }),
    });
  });
});
