import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { NormalizedDog } from "@/lib/compatibility/types";
import type { CardCompatibility } from "@/lib/search/card-compatibility";
import { DogCard } from "@/components/DogCard";

type SearchResult = {
  dog: NormalizedDog;
  compatibility: CardCompatibility;
};

export function SearchResults({
  results,
  zip,
  favoriteIds,
}: {
  results: SearchResult[];
  zip: string;
  favoriteIds?: Set<string>;
}) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <p className="text-text-secondary">
          {zip
            ? `No dogs found near ${zip}. Try expanding your search radius.`
            : "No dogs found. Try adjusting your filters."}
        </p>
        <Link
          href="/search"
          className="bg-primary text-white rounded-button-inline px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Browse Dogs
        </Link>
      </div>
    );
  }

  // "Your Matches" only once results are actually scored (profiled user);
  // otherwise anonymous/unprofiled visitors see a neutral label.
  const scored = results.some((r) => r.compatibility.available);
  const label = zip
    ? "Showing Nearby Dogs"
    : scored
      ? "Showing Your Matches"
      : "Showing Available Dogs";

  return (
    <div className="mt-6">
      <div className="mb-4">
        <p className="text-text-secondary text-sm flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" />
          {label}
        </p>
        <p className="text-text-primary font-semibold text-lg">
          {results.length} dogs found
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {results.map(({ dog, compatibility }) => (
          <DogCard
            key={dog.externalId}
            dog={dog}
            compatibility={compatibility}
            isFavorited={favoriteIds?.has(`${dog.provider}-${dog.externalId}`) ?? false}
          />
        ))}
      </div>
    </div>
  );
}
