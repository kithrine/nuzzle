import Link from "next/link";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { formatAgeGroup } from "@/lib/compatibility/display";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { DogImage } from "@/components/DogImage";
import { featuredWindowSeed, pickFeatured } from "@/lib/homepage/featured";

// Featured Dogs surfaces 8 real, adoptable dogs nationwide that rotate every
// ~5 hours. The homepage is regenerated on that cadence (ISR `revalidate` in
// app/page.tsx), so this makes ~one RescueGroups call per window. The seed
// both varies the page we fetch and shuffles the picks, so the set changes
// each window. Each card links to that dog's real detail page.
const FEATURED_POOL_PAGES = 8;
const FEATURED_COUNT = 8;

export async function FeaturedDogs() {
  // Server component: reading the wall clock is intentional — it selects the
  // current 5-hour rotation window. The page is ISR-regenerated on that cadence
  // (revalidate in app/page.tsx), so this isn't a per-render instability.
  // eslint-disable-next-line react-hooks/purity
  const seed = featuredWindowSeed(Date.now());

  let dogs: NormalizedDog[] = [];
  try {
    const { dogs: raw } = await searchRescueGroupsDogs({
      page: (seed % FEATURED_POOL_PAGES) + 1,
      limit: 40,
    });
    dogs = raw.map(({ id, raw: rawDog }) => normalizeRescueGroupsDog(rawDog, id, null));
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
    <div className="flex gap-4 w-max">
      {featured.map((dog) => (
        <Link
          key={`${dog.provider}-${dog.externalId}`}
          href={`/dogs/${dog.provider}/${dog.externalId}`}
          className="bg-surface rounded-card shadow-sm flex-shrink-0 w-48 overflow-hidden block hover:shadow-md transition-shadow"
        >
          <div className="relative h-36 overflow-hidden bg-primary-light">
            {dog.photos[0] && <DogImage src={dog.photos[0]} alt={dog.name} />}
          </div>
          <div className="p-3">
            <p className="font-semibold text-text-primary text-sm">{dog.name}</p>
            <p className="text-text-secondary text-xs">
              {dog.breed ?? "Mixed Breed"} · {formatAgeGroup(dog.ageGroup)}
            </p>
            <span className="text-primary text-xs font-medium mt-2 block underline underline-offset-2">
              View Details
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
