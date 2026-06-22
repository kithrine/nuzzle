import { unstable_cache } from "next/cache";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import type { NormalizedDog } from "@/lib/compatibility/types";

export const FEATURED_REVALIDATE_SECONDS = 18000; // 5 hours

const FEATURED_POOL_PAGES = 8;
const FEATURED_POOL_LIMIT = 40;

/**
 * Load the nationwide pool of dogs the homepage features, cached per 5-hour
 * window. RescueGroups search is a POST (which Next's fetch cache never caches),
 * so we cache at the data layer with `unstable_cache`: the provider call runs at
 * most once per window regardless of whether the homepage renders statically or
 * dynamically. The window seed is part of the cache key, so the cached set
 * rotates exactly when the window flips.
 */
export function getFeaturedPool(seed: number): Promise<NormalizedDog[]> {
  return unstable_cache(
    async () => {
      const page = (seed % FEATURED_POOL_PAGES) + 1;
      const { dogs } = await searchRescueGroupsDogs({ page, limit: FEATURED_POOL_LIMIT });
      return dogs.map(({ id, raw }) => normalizeRescueGroupsDog(raw, id, null));
    },
    ["featured-dogs", String(seed)],
    { revalidate: FEATURED_REVALIDATE_SECONDS, tags: ["featured-dogs"] },
  )();
}
