import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  Heart,
  SquarePen,
  Award,
  ChevronRight,
  MapPin,
  Info,
  CircleCheck,
  Lock,
  PawPrint,
  Zap,
  Cat,
  Dog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DogImage } from "@/components/DogImage";
import { prisma } from "@/lib/db/prisma";
import { getRescueGroupsDog } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { formatAgeGroup } from "@/lib/compatibility/display";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import type {
  AdopterProfile,
  CompatibilityResult,
  NormalizedDog,
} from "@/lib/compatibility/types";
import { RemoveFavoriteButton } from "./RemoveFavoriteButton";
import { SortControl } from "./SortControl";

// Same 3-tier thresholds used app-wide (DogCard / DogDetailClient).
function matchTierText(score: number): string {
  if (score >= 80) return "text-match-high-text";
  if (score >= 60) return "text-match-medium-text";
  return "text-match-low-text";
}
function matchTierClasses(score: number): string {
  if (score >= 80) return "bg-match-high-bg text-match-high-text";
  if (score >= 60) return "bg-match-medium-bg text-match-medium-text";
  return "bg-match-low-bg text-match-low-text";
}

// Short trait chips derived from real NormalizedDog fields (the engine's
// positiveFactors are full sentences, not chip labels).
function dogTraitChips(dog: NormalizedDog): { label: string; Icon: LucideIcon }[] {
  const chips: { label: string; Icon: LucideIcon }[] = [];
  if (dog.energyLevel !== "Unknown") chips.push({ label: `${dog.energyLevel} Energy`, Icon: Zap });
  if (dog.isCatsOk === true) chips.push({ label: "Good with Cats", Icon: Cat });
  if (dog.isDogsOk === true) chips.push({ label: "Good with Dogs", Icon: Dog });
  if (dog.isKidsOk === true) chips.push({ label: "Family Friendly", Icon: Users });
  return chips.slice(0, 3);
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const user = await getOrCreateUser();
  if (!user) redirect("/login");

  const { sort } = await searchParams;
  const sortMode: "best" | "recent" = sort === "recent" ? "recent" : "best";

  const [favorites, profile, clerkUser] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.adopterProfile.findUnique({ where: { userId: user.id } }),
    currentUser(),
  ]);

  const firstName = clerkUser?.firstName ?? "there";

  const sidebar = <DashboardSidebar firstName={firstName} active="saved" />;

  const privacyNote = (
    <p className="flex items-center justify-center gap-1.5 text-text-secondary text-xs mt-8">
      <Lock size={12} /> Your data is private and never shared.
    </p>
  );

  // ── Empty state ──────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <main className="bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex gap-8 max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {sidebar}
          <section className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-6">
              <Heart size={22} className="text-primary" fill="currentColor" /> Saved Dogs
            </h1>
            <div className="bg-surface rounded-card border border-border p-10 flex flex-col items-center text-center">
              <div className="bg-primary-light rounded-full p-5 mb-4">
                <PawPrint size={36} className="text-primary" />
              </div>
              <p className="text-lg font-bold text-text-primary">You haven&apos;t saved any dogs yet</p>
              <p className="text-text-secondary text-sm mt-1 mb-6 max-w-sm">
                Browse dogs and save your favorites to easily come back to them later.
              </p>
              <Link
                href="/search"
                className="bg-primary text-white rounded-button-full px-6 py-3 font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity hover-press"
              >
                <PawPrint size={18} /> Browse Dogs
              </Link>
            </div>
            {privacyNote}
          </section>
        </div>
      </main>
    );
  }

  // ── Resolve saved dogs + compatibility ───────────────────────────
  type DogEntry = {
    dog: NormalizedDog;
    provider: string;
    externalId: string;
    compatibility: CompatibilityResult | null;
  };

  const dogResults = await Promise.allSettled(
    favorites.map(async (fav): Promise<DogEntry | null> => {
      const data = await getRescueGroupsDog(fav.externalId);
      if (!data) return null;
      const dog = normalizeRescueGroupsDog(data.raw, fav.externalId, null);
      const compatibility = profile
        ? calculateCompatibility(profile as unknown as AdopterProfile, dog)
        : null;
      return { dog, provider: fav.provider, externalId: fav.externalId, compatibility };
    }),
  );

  const resolved: DogEntry[] = dogResults
    .filter(
      (r): r is PromiseFulfilledResult<DogEntry | null> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value as DogEntry);

  if (sortMode === "best") {
    resolved.sort(
      (a, b) =>
        (b.compatibility?.compatibilityScore ?? -1) -
        (a.compatibility?.compatibilityScore ?? -1),
    );
  }
  // "recent" keeps the createdAt-desc order from the query.

  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex gap-8 max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {sidebar}
        <section className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <Heart size={22} className="text-primary" fill="currentColor" /> Saved Dogs
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Your favorite dogs and their compatibility matches.
              </p>
              <p className="flex items-center gap-2 text-xs text-text-secondary mt-2">
                <span className="flex items-center gap-1 text-match-high-text">
                  <CircleCheck size={14} /> Profile: {profile ? "Complete" : "Incomplete"}
                </span>
                <span className="text-border">|</span>
                Last updated: Today
              </p>
            </div>
            <Link
              href="/questionnaire"
              className="flex-shrink-0 inline-flex items-center gap-2 border border-border rounded-button-inline px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light/50 transition-colors hover-press"
            >
              <SquarePen size={16} /> Edit Profile
            </Link>
          </div>

          {/* Matches banner */}
          {profile && (
            <div className="bg-primary-light/60 border border-border rounded-card p-4 flex items-center gap-3 my-6">
              <Award size={28} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm">
                  We&apos;re finding great matches for you!
                </p>
                <p className="text-text-secondary text-sm">
                  Your profile helps us surface dogs that are the best fit for your lifestyle.
                </p>
              </div>
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 text-primary text-sm font-medium flex-shrink-0"
              >
                Learn how matches work <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {/* Count + Sort */}
          <div className="flex items-center justify-between mb-4 mt-6">
            <p className="font-semibold text-text-primary">
              {favorites.length} Saved Dog{favorites.length !== 1 ? "s" : ""}
            </p>
            <SortControl current={sortMode} />
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4">
            {resolved.map(({ dog, provider, externalId, compatibility }) => {
              const chips = dogTraitChips(dog);
              return (
                <article
                  key={`${provider}-${externalId}`}
                  className="relative bg-surface rounded-card border border-border p-4 hover-lift"
                >
                  <RemoveFavoriteButton
                    provider={provider}
                    externalId={externalId}
                    dogName={dog.name}
                    className="absolute top-3 right-3"
                  />
                  <div className="flex gap-4">
                    {dog.photos[0] && (
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-button-inline overflow-hidden bg-primary-light flex-shrink-0">
                        <DogImage src={dog.photos[0]} alt={dog.name} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between gap-3">
                      {/* Info */}
                      <div className="min-w-0 pr-6">
                        <p className="font-bold text-lg text-text-primary flex items-center gap-2">
                          {dog.name}
                          <Heart size={16} className="text-primary" fill="currentColor" />
                        </p>
                        <p className="text-text-secondary text-sm">
                          {dog.breed ?? "Mixed Breed"} &bull; {formatAgeGroup(dog.ageGroup)}
                          {dog.gender && dog.gender !== "Unknown" && <> &bull; {dog.gender}</>} &bull;{" "}
                          {dog.sizeGroup}
                        </p>
                        {(dog.shelterName || dog.distance != null) && (
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-secondary text-xs mt-1">
                            {dog.shelterName && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {dog.shelterName}
                              </span>
                            )}
                            {dog.distance != null && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {dog.distance} miles away
                              </span>
                            )}
                          </p>
                        )}
                        {chips.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {chips.map(({ label, Icon }) => (
                              <span
                                key={label}
                                className="bg-primary-light text-primary text-xs rounded-badge px-2 py-1 inline-flex items-center gap-1"
                              >
                                <Icon size={12} /> {label}
                              </span>
                            ))}
                          </div>
                        )}
                        {dog.description && (
                          <p
                            className="text-text-secondary text-sm mt-2"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {dog.description}
                          </p>
                        )}
                      </div>

                      {/* Match + actions (sm:pr-7 reserves a corner lane for the × remove button) */}
                      <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between gap-2 flex-shrink-0 sm:text-right sm:pr-7">
                        <div className="sm:mb-2">
                          {compatibility ? (
                            <>
                              <p
                                className={`text-3xl font-bold leading-none ${matchTierText(
                                  compatibility.compatibilityScore,
                                )}`}
                              >
                                {compatibility.compatibilityScore}%
                              </p>
                              <p className="text-xs font-semibold tracking-wide text-text-secondary mt-1">
                                MATCH
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 text-xs rounded-badge px-2 py-1 mt-2 ${matchTierClasses(
                                  compatibility.compatibilityScore,
                                )}`}
                              >
                                {compatibility.confidenceLabel} Confidence <Info size={12} />
                              </span>
                            </>
                          ) : (
                            <Link href="/questionnaire" className="text-secondary-cta text-sm font-medium">
                              Complete profile for match
                            </Link>
                          )}
                        </div>
                        <Link
                          href={`/dogs/${provider}/${externalId}`}
                          className="inline-flex items-center justify-center border border-primary text-primary rounded-button-inline px-4 py-2 text-sm font-medium hover:bg-primary-light transition-colors whitespace-nowrap hover-press"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {resolved.length < favorites.length && (
            <p className="text-text-secondary text-sm mt-4">
              Some saved dogs could not be loaded at this time.
            </p>
          )}

          {privacyNote}
        </section>
      </div>
    </main>
  );
}
