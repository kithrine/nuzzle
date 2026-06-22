import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

const mockUseUser = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { SearchPageClient } from "@/app/search/SearchPageClient";

const searchBody = {
  results: [],
  hasMore: false,
  total: 0,
  compatibility: { available: false, teaser: "Create a profile." },
};

function searchCallCount(): number {
  const f = fetch as unknown as ReturnType<typeof vi.fn>;
  return f.mock.calls.filter(
    ([url]) => typeof url === "string" && url.includes("/api/dogs/search"),
  ).length;
}

describe("SearchPageClient — session-safe fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => searchBody }),
    );
  });

  it("CACHE-001: fetches search results with cache: no-store (never the HTTP cache)", async () => {
    render(<SearchPageClient />);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/dogs/search"),
        expect.objectContaining({ cache: "no-store" }),
      ),
    );
  });

  it("CACHE-002: re-fetches results when the user logs out in place", async () => {
    const { rerender } = render(<SearchPageClient />);
    await waitFor(() => expect(searchCallCount()).toBe(1));

    // Simulate an in-place logout (no navigation / remount).
    mockUseUser.mockReturnValue({ isSignedIn: false, isLoaded: true });
    rerender(<SearchPageClient />);

    await waitFor(() => expect(searchCallCount()).toBeGreaterThan(1));
  });
});
