import Link from "next/link";
import { Lock, MapPin, Check } from "lucide-react";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";
import { formatAgeGroup } from "@/lib/compatibility/display";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DogImage } from "@/components/DogImage";

type AnonymousCompatibility = {
  available: false;
  teaser: string;
};

type AuthenticatedCompatibility = {
  available: true;
  result: CompatibilityResult;
};

type DogCardCompatibility = AnonymousCompatibility | AuthenticatedCompatibility;

function matchTierClasses(score: number): string {
  if (score >= 80) return "bg-match-high-bg text-match-high-text";
  if (score >= 60) return "bg-match-medium-bg text-match-medium-text";
  return "bg-match-low-bg text-match-low-text";
}

export function DogCard({
  dog,
  compatibility,
  isFavorited = false,
}: {
  dog: NormalizedDog;
  compatibility: DogCardCompatibility;
  isFavorited?: boolean;
}) {
  const photo = dog.photos[0] ?? "";
  const breed = dog.breed ?? "Mixed Breed";
  const detailHref = `/dogs/${dog.provider}/${dog.externalId}`;

  return (
    <article className="bg-surface rounded-card border border-border shadow-sm overflow-hidden flex flex-col hover-lift">
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-light">
        <DogImage src={photo} alt={dog.name} />
        <div className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-sm text-primary z-10">
          <FavoriteButton
            provider={dog.provider}
            externalId={dog.externalId}
            dogName={dog.name}
            initialFavorited={isFavorited}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h2 className="font-semibold text-text-primary text-lg leading-tight">
          {dog.name}
        </h2>
        <p className="text-text-secondary text-sm">
          {formatAgeGroup(dog.ageGroup)} &bull; {dog.sizeGroup} &bull; {breed}
          {dog.gender && dog.gender !== "Unknown" && <> &bull; {dog.gender}</>}
        </p>
        {dog.distance != null && (
          <p className="text-text-secondary text-sm flex items-center gap-1">
            <MapPin size={14} className="flex-shrink-0" />
            {dog.distance} miles away
          </p>
        )}

        {compatibility.available ? (
          <AuthenticatedBody result={compatibility.result} detailHref={detailHref} />
        ) : (
          <AnonymousBody teaser={compatibility.teaser} detailHref={detailHref} />
        )}
      </div>
    </article>
  );
}

function AnonymousBody({
  teaser,
  detailHref,
}: {
  teaser: string;
  detailHref: string;
}) {
  return (
    <>
      {/* Compatibility teaser */}
      <div className="mt-1 rounded-button-inline border border-dashed border-border bg-background p-3 flex flex-col gap-2">
        <p className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
          <Lock size={14} className="text-primary flex-shrink-0" />
          Compatibility Matching Available
        </p>
        <p className="text-text-secondary text-sm">{teaser}</p>
        <ul className="flex flex-col gap-1 text-sm text-text-secondary">
          <li className="flex items-center gap-1.5">
            <Check size={14} className="text-primary flex-shrink-0" />
            Match Score
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={14} className="text-primary flex-shrink-0" />
            Why this dog fits
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={14} className="text-primary flex-shrink-0" />
            Potential concerns
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-2 flex flex-col gap-2">
        <Link
          href="/questionnaire"
          className="bg-secondary-cta text-white rounded-button-inline text-sm font-semibold px-4 py-2 text-center hover:opacity-90 transition-opacity hover-press"
        >
          Get My Match
        </Link>
        <Link
          href={detailHref}
          className="text-primary text-sm font-medium text-center hover:underline underline-offset-2"
        >
          View Details
        </Link>
      </div>
    </>
  );
}

function AuthenticatedBody({
  result,
  detailHref,
}: {
  result: CompatibilityResult;
  detailHref: string;
}) {
  const tierClasses = matchTierClasses(result.compatibilityScore);
  const factors = result.positiveFactors.slice(0, 3);

  return (
    <>
      {/* Match badge — label before percentage (RULES Rule 11) */}
      <div
        className={`mt-1 rounded-badge px-3 py-2 flex items-center justify-between gap-2 ${tierClasses}`}
      >
        <span className="font-bold text-sm">{result.matchLabel}</span>
        <span className="font-bold text-xl leading-none">
          {result.compatibilityScore}%
        </span>
      </div>

      {/* Confidence — human label, never a raw number (RULES Rule 11) */}
      <p className="text-text-secondary text-sm">
        {result.confidenceLabel} Confidence
      </p>

      {/* Match factor pills */}
      {factors.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {factors.map((factor) => (
            <li
              key={factor}
              className="bg-primary-light text-primary text-xs rounded-badge px-2 py-1"
            >
              {factor}
            </li>
          ))}
        </ul>
      )}

      {/* Action */}
      <Link
        href={detailHref}
        className="mt-2 bg-primary text-white rounded-button-inline text-sm font-semibold px-4 py-2 text-center hover:opacity-90 transition-opacity hover-press"
      >
        View Details
      </Link>
    </>
  );
}
