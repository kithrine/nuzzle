import type { NormalizedDog } from "@/lib/compatibility/types";
import { DogCard } from "@/components/DogCard";

type AnonymousCompatibility = {
  available: false;
  teaser: string;
};

type SearchResult = {
  dog: NormalizedDog;
  compatibility: AnonymousCompatibility;
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
      <p>
        No dogs found near {zip}. Try expanding your search radius.
      </p>
    );
  }

  return (
    <div>
      <p>Showing Nearby Dogs</p>
      <p>{results.length} dogs found</p>
      {results.map(({ dog, compatibility }) => (
        <DogCard
          key={dog.externalId}
          dog={dog}
          compatibility={compatibility}
          isFavorited={favoriteIds?.has(`${dog.provider}-${dog.externalId}`) ?? false}
        />
      ))}
    </div>
  );
}
