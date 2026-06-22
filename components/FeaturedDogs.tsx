import Link from "next/link";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { formatAgeGroup } from "@/lib/compatibility/display";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { DogImage } from "@/components/DogImage";

// A default location is used purely to surface a few real, adoptable dogs on
// the marketing homepage. Each card links to that dog's real detail page.
const FEATURED_ZIP = "10001";

export async function FeaturedDogs() {
  let dogs: NormalizedDog[] = [];
  try {
    const { dogs: raw } = await searchRescueGroupsDogs({
      zip: FEATURED_ZIP,
      radius: 100,
      page: 1,
      limit: 6,
    });
    dogs = raw.map(({ id, raw: rawDog }) => normalizeRescueGroupsDog(rawDog, id, null));
  } catch {
    dogs = [];
  }

  // Prefer dogs that have a photo, but fall back to whatever we have.
  const withPhotos = dogs.filter((d) => d.photos[0]);
  const featured = (withPhotos.length > 0 ? withPhotos : dogs).slice(0, 5);

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
