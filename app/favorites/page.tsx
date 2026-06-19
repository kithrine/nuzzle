import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { getRescueGroupsDog } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { formatAgeGroup } from "@/lib/compatibility/display";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import type { AdopterProfile, NormalizedDog } from "@/lib/compatibility/types";
import { FavoriteButton } from "@/components/FavoriteButton";

export default async function FavoritesPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/login");

  const [favorites, profile] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.adopterProfile.findUnique({ where: { userId: user.id } }),
  ]);

  if (favorites.length === 0) {
    return (
      <main>
        <h1>Your Saved Dogs</h1>
        <p>You have not saved any dogs yet. Browse dogs and tap the heart to save them here.</p>
        <a href="/search">Browse Dogs</a>
      </main>
    );
  }

  const dogResults = await Promise.allSettled(
    favorites.map(async (fav) => {
      const data = await getRescueGroupsDog(fav.externalId);
      if (!data) return null;
      const dog = normalizeRescueGroupsDog(data.raw, fav.externalId, null);
      return { dog, provider: fav.provider, externalId: fav.externalId };
    }),
  );

  type DogEntry = { dog: NormalizedDog; provider: string; externalId: string };
  const resolved: DogEntry[] = dogResults
    .filter(
      (r): r is PromiseFulfilledResult<DogEntry | null> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value as DogEntry);

  return (
    <main>
      <h1>Your Saved Dogs</h1>
      <p>{favorites.length} saved dog{favorites.length !== 1 ? "s" : ""}</p>

      {resolved.map(({ dog, provider, externalId }) => {
        const compatibility = profile
          ? calculateCompatibility(profile as unknown as AdopterProfile, dog)
          : null;

        return (
          <article key={`${provider}-${externalId}`}>
            {dog.photos[0] && <img src={dog.photos[0]} alt={dog.name} />}
            <h2>{dog.name}</h2>
            <p>
              {formatAgeGroup(dog.ageGroup)} &bull; {dog.sizeGroup} &bull; {dog.breed ?? "Mixed Breed"}
            </p>
            {dog.shelterName && <p>{dog.shelterName}</p>}
            {compatibility && (
              <p>
                {compatibility.matchLabel} &bull; {compatibility.compatibilityScore}%
              </p>
            )}
            <FavoriteButton provider={provider} externalId={externalId} initialFavorited={true} />
            <a href={`/dogs/${provider}/${externalId}`}>View Details</a>
          </article>
        );
      })}

      {resolved.length < favorites.length && (
        <p>Some saved dogs could not be loaded at this time.</p>
      )}
    </main>
  );
}
