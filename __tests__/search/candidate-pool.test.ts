// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";
import type { NormalizedDog } from "@/lib/compatibility/types";

vi.mock("@/lib/rescuegroups/client");
vi.mock("@/lib/compatibility/normalize");

import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { RateLimitError } from "@/lib/rescuegroups/types";
import { fetchCandidatePoolUncached, CANDIDATE_POOL_SIZE } from "@/lib/search/candidate-pool";

const mockSearch = vi.mocked(searchRescueGroupsDogs);
const mockNormalize = vi.mocked(normalizeRescueGroupsDog);

const RAW = {} as RescueGroupsRawDog;

function fullPage(prefix: string) {
  return {
    dogs: Array.from({ length: 50 }, (_, i) => ({ id: `${prefix}${i}`, raw: RAW })),
    hasMore: true,
    total: 1000,
  };
}

describe("fetchCandidatePoolUncached", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Normalize echoes the provider id into externalId so identity/dedupe is testable.
    mockNormalize.mockImplementation(
      (_raw, id) => ({ externalId: id, name: `Dog ${id}` }) as unknown as NormalizedDog,
    );
  });

  it("POOL-001: fetches multiple pages and caps the pool at CANDIDATE_POOL_SIZE", async () => {
    mockSearch.mockImplementation(async ({ page }) => fullPage(`p${page}-`));

    const { pool } = await fetchCandidatePoolUncached({});

    expect(pool.length).toBe(CANDIDATE_POOL_SIZE);
    expect(mockSearch).toHaveBeenCalledTimes(CANDIDATE_POOL_SIZE / 50);
  });

  it("POOL-002: stops early when a page returns fewer than a full page (end of catalog)", async () => {
    mockSearch
      .mockResolvedValueOnce(fullPage("a"))
      .mockResolvedValueOnce({
        dogs: Array.from({ length: 20 }, (_, i) => ({ id: `b${i}`, raw: RAW })),
        hasMore: false,
        total: 70,
      });

    const { pool } = await fetchCandidatePoolUncached({});

    expect(pool.length).toBe(70);
    expect(mockSearch).toHaveBeenCalledTimes(2);
  });

  it("POOL-003: tolerates a rate limit mid-fetch and returns what it gathered", async () => {
    mockSearch
      .mockResolvedValueOnce(fullPage("a"))
      .mockRejectedValueOnce(new RateLimitError());

    const { pool } = await fetchCandidatePoolUncached({});

    expect(pool.length).toBe(50);
  });

  it("POOL-004: dedupes dogs that appear on more than one page", async () => {
    mockSearch
      .mockResolvedValueOnce(fullPage("a")) // a0..a49
      .mockResolvedValueOnce({
        // a0 repeats, then b0..b48 → 50 total, 1 duplicate
        dogs: [
          { id: "a0", raw: RAW },
          ...Array.from({ length: 49 }, (_, i) => ({ id: `b${i}`, raw: RAW })),
        ],
        hasMore: true,
        total: 100,
      })
      .mockResolvedValueOnce({ dogs: [], hasMore: false, total: 100 });

    const { pool } = await fetchCandidatePoolUncached({});
    const ids = pool.map((d) => d.externalId);

    expect(ids).toHaveLength(99);
    expect(ids.filter((id) => id === "a0")).toHaveLength(1);
  });
});
