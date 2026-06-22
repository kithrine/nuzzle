import Link from "next/link";
import { formatAgeGroup } from "@/lib/compatibility/display";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { DogImage } from "@/components/DogImage";
import { featuredWindowSeed, pickFeatured } from "@/lib/homepage/featured";
import { getFeaturedPool } from "@/lib/homepage/featured-data";

// Featured Dogs surfaces 8 real, adoptable dogs nationwide that rotate every
// ~5 hours. The nationwide pool is cached per window in getFeaturedPool
// (unstable_cache), so the RescueGroups call runs at most once per window. The
// seed varies the page we fetch and shuffles the picks, so the set changes each
// window. Each card links to that dog's real detail page.
const FEATURED_COUNT = 8;

export async function FeaturedDogs() {
  // Server component: reading the wall clock is intentional — it selects the
  // current 5-hour rotation window (which is also the cache key in
  // getFeaturedPool), so this isn't a per-render instability.
  // eslint-disable-next-line react-hooks/purity
  const seed = featuredWindowSeed(Date.now());

  let dogs: NormalizedDog[] = [];
  try {
    dogs = await getFeaturedPool(seed);
  } catch {
    dogs = [];
  }

  const featured = pickFeatured(dogs, seed, FEATURED_COUNT);

  if (featured.length === 0) {
    return (
      <div className="w-full text-center py-4">
        <Link href="/search" className="text-primary font-medium hover:underline">
          Browse all available dogs →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-5 w-max">
      {featured.map((dog) => (
        <Link
          key={`${dog.provider}-${dog.externalId}`}
          href={`/dogs/${dog.provider}/${dog.externalId}`}
          className="bg-surface rounded-card shadow-sm flex-shrink-0 w-64 overflow-hidden block hover-lift"
        >
          <div className="relative h-48 overflow-hidden bg-primary-light">
            {dog.photos[0] && <DogImage src={dog.photos[0]} alt={dog.name} />}
          </div>
          <div className="p-4">
            <p className="font-semibold text-text-primary text-base">{dog.name}</p>
            <p className="text-text-secondary text-sm">
              {dog.breed ?? "Mixed Breed"} · {formatAgeGroup(dog.ageGroup)}
            </p>
            <span className="text-primary text-sm font-medium mt-2 block underline underline-offset-2">
              View Details
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
