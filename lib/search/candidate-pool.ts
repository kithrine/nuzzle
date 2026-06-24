import { unstable_cache } from "next/cache";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { RateLimitError } from "@/lib/rescuegroups/types";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import type { NormalizedDog } from "@/lib/compatibility/types";

// How many dogs we pull and rank for a profiled "best match" search. Ranking a
// large sample (vs. one 12-dog page) is what makes matches actually personal —
// two different profiles surface different top dogs. Tunable; trades RescueGroups
// API load (on a cache miss) for matching breadth.
export const CANDIDATE_POOL_SIZE = 500;
const POOL_PAGE_SIZE = 50; // RescueGroups caps a page at 50
const POOL_MAX_PAGES = Math.ceil(CANDIDATE_POOL_SIZE / POOL_PAGE_SIZE);
export const CANDIDATE_POOL_REVALIDATE = 3600; // seconds (1h)

export type PoolFilters = {
  zip?: string;
  radius?: number;
  breed?: string;
  ageGroup?: string;
  sizeGroup?: string;
};

/**
 * Pull a large candidate pool from RescueGroups by walking pages sequentially.
 * The pool is user-independent (dogs only, no scores) — scoring happens per
 * request against the live profile. Sequential (not parallel) to avoid a burst
 * 429; the multi-page cost is only paid on a cache miss (see getCandidatePool).
 * Returns the gathered dogs even if a page is rate-limited, so search degrades
 * gracefully rather than failing.
 */
export async function fetchCandidatePoolUncached(
  filters: PoolFilters,
): Promise<{ pool: NormalizedDog[]; total: number }> {
  const seen = new Set<string>();
  const pool: NormalizedDog[] = [];
  let total = 0;

  for (let page = 1; page <= POOL_MAX_PAGES; page++) {
    let result;
    try {
      result = await searchRescueGroupsDogs({ ...filters, page, limit: POOL_PAGE_SIZE });
    } catch (err) {
      if (err instanceof RateLimitError) break; // use what we have
      throw err;
    }

    if (typeof result.total === "number") total = result.total;

    for (const { id, raw } of result.dogs) {
      if (seen.has(id)) continue;
      seen.add(id);
      pool.push(normalizeRescueGroupsDog(raw, id, null));
      if (pool.length >= CANDIDATE_POOL_SIZE) break;
    }

    if (pool.length >= CANDIDATE_POOL_SIZE) break;
    if (result.dogs.length < POOL_PAGE_SIZE) break; // reached the end of the catalog
  }

  return { pool, total: total || pool.length };
}

/**
 * Cached wrapper: the pool is shared across all users and refreshed at most once
 * per revalidate window. Keyed by the filter set only (never by user/auth), so a
 * guest and a signed-in user draw from the same pool — only the scoring differs.
 */
export function getCandidatePool(
  filters: PoolFilters,
): Promise<{ pool: NormalizedDog[]; total: number }> {
  const key = [
    "candidate-pool",
    filters.zip ?? "",
    String(filters.radius ?? ""),
    filters.breed ?? "",
    filters.ageGroup ?? "",
    filters.sizeGroup ?? "",
  ];
  return unstable_cache(() => fetchCandidatePoolUncached(filters), key, {
    revalidate: CANDIDATE_POOL_REVALIDATE,
    tags: ["candidate-pool"],
  })();
}
