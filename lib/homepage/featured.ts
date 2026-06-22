import type { NormalizedDog } from "@/lib/compatibility/types";

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

/**
 * A monotonically increasing seed that is stable within a fixed time window
 * (default 5 hours) and increments by one when the window flips. Drives both
 * which dogs are featured and the rotation cadence.
 */
export function featuredWindowSeed(now: number, windowMs: number = FIVE_HOURS_MS): number {
  return Math.floor(now / windowMs);
}

// mulberry32 — small, fast, deterministic PRNG (same seed → same sequence).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher–Yates shuffle. Returns a new array; never mutates input. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick up to `count` dogs to feature, preferring those with a photo. The
 * selection is deterministic for a given seed (so it stays stable within a
 * rotation window and changes when the window flips).
 */
export function pickFeatured(dogs: NormalizedDog[], seed: number, count = 8): NormalizedDog[] {
  const withPhotos = dogs.filter((d) => d.photos.length > 0);
  const withoutPhotos = dogs.filter((d) => d.photos.length === 0);
  // Photographed dogs first; unphotographed only fill remaining slots.
  const ordered = [
    ...seededShuffle(withPhotos, seed),
    ...seededShuffle(withoutPhotos, seed),
  ];
  return ordered.slice(0, count);
}
