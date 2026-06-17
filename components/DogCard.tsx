import type { NormalizedDog } from "@/lib/compatibility/types";
import { FavoriteButton } from "@/components/FavoriteButton";

type AnonymousCompatibility = {
  available: false;
  teaser: string;
};

export function DogCard({
  dog,
  compatibility,
  isFavorited = false,
}: {
  dog: NormalizedDog;
  compatibility: AnonymousCompatibility;
  isFavorited?: boolean;
}) {
  const photo = dog.photos[0] ?? "";
  const breed = dog.breed ?? "Mixed Breed";

  return (
    <article>
      <img src={photo} alt={dog.name} />
      <h2>{dog.name}</h2>
      <p>
        {dog.ageGroup} &bull; {dog.sizeGroup} &bull; {breed}
      </p>
      {dog.shelterName && <p>{dog.shelterName}</p>}
      {dog.distance != null && <p>{dog.distance} miles away</p>}

      <div>
        <p>Compatibility Matching Available</p>
        <p>{compatibility.teaser}</p>
        <ul>
          <li>&#10003; Match Score</li>
          <li>&#10003; Why this dog fits</li>
          <li>&#10003; Potential concerns</li>
        </ul>
      </div>

      <FavoriteButton
        provider={dog.provider}
        externalId={dog.externalId}
        initialFavorited={isFavorited}
      />
      <a href={`/dogs/${dog.provider}/${dog.externalId}`}>View Details</a>
    </article>
  );
}
