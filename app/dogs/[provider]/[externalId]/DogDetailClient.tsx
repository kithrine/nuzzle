"use client";

import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Lock,
  Target,
  MessageCircle,
  TriangleAlert,
  CircleHelp,
  CircleCheck,
  Sparkles,
  ExternalLink,
  PawPrint,
} from "lucide-react";
import type { CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";
import { formatAgeGroup } from "@/lib/compatibility/display";
import { FavoriteButton } from "@/components/FavoriteButton";

type CompatibilityProp =
  | { available: false; teaser: string }
  | { available: true; result: CompatibilityResult };

type Props = {
  dog: NormalizedDog;
  compatibility: CompatibilityProp;
  explanation?: string | null;
  isFavorited?: boolean;
};

function matchTierClasses(score: number): string {
  if (score >= 80) return "bg-match-high-bg text-match-high-text";
  if (score >= 60) return "bg-match-medium-bg text-match-medium-text";
  return "bg-match-low-bg text-match-low-text";
}

function matchTierText(score: number): string {
  if (score >= 80) return "text-match-high-text";
  if (score >= 60) return "text-match-medium-text";
  return "text-match-low-text";
}

export function DogDetailClient({ dog, compatibility, explanation, isFavorited }: Props) {
  const breed = dog.breed ?? "Mixed Breed";
  const photo = dog.photos[0] ?? "";
  const thumbnails = dog.photos.slice(1, 4);
  const extraPhotos = dog.photos.length - 4;

  function handleShelterClick() {
    const anonId = typeof window !== "undefined"
      ? (localStorage.getItem("nuzzle_anon_id") ?? undefined)
      : undefined;
    fetch(`/api/dogs/${dog.provider}/${dog.externalId}/shelter-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymousId: anonId }),
    }).catch(() => {});
  }

  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col gap-6">
        {/* Back link */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline w-fit"
        >
          <ChevronLeft size={16} />
          Back to results
        </Link>

        {/* Hero + thumbnails */}
        {photo && (
          <div className="flex gap-3">
            <div className="relative flex-1 aspect-[16/10] rounded-card overflow-hidden bg-primary-light">
              <img src={photo} alt={dog.name} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            {thumbnails.length > 0 && (
              <div className="hidden sm:flex flex-col gap-3 w-36">
                {thumbnails.map((src, i) => (
                  <div
                    key={src}
                    className="relative flex-1 rounded-card overflow-hidden bg-primary-light"
                  >
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    {i === thumbnails.length - 1 && extraPhotos > 0 && (
                      <span className="absolute bottom-1.5 right-1.5 bg-text-primary/80 text-white text-xs font-semibold rounded-badge px-2 py-0.5 flex items-center gap-1">
                        <PawPrint size={12} />+{extraPhotos}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info card */}
        <section className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{dog.name}</h1>
            <FavoriteButton
              provider={dog.provider}
              externalId={dog.externalId}
              initialFavorited={isFavorited}
            />
          </div>
          <p className="text-text-secondary text-sm mt-1">
            {breed} &bull; {formatAgeGroup(dog.ageGroup)} &bull; {dog.sizeGroup}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-text-secondary text-sm">
            {dog.shelterName && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {dog.shelterName}
              </span>
            )}
            {dog.distance != null && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {dog.distance} miles away
              </span>
            )}
          </div>
        </section>

        {/* Compatibility */}
        {compatibility.available === false ? (
          <AnonymousCompat teaser={compatibility.teaser} />
        ) : (
          <AuthenticatedCompat result={compatibility.result} explanation={explanation} />
        )}

        {/* About */}
        {dog.description && (
          <section className="bg-surface rounded-card border border-border p-5">
            <p className="text-lg font-bold text-text-primary mb-2">About {dog.name}</p>
            <p className="text-text-primary whitespace-pre-line">{dog.description}</p>
          </section>
        )}

        {/* Before You Apply */}
        {compatibility.available && compatibility.result.shelterQuestions.length > 0 && (
          <details
            open
            className="bg-surface rounded-card border border-border p-5"
          >
            <summary className="flex items-center gap-2 cursor-pointer font-bold text-text-primary list-none">
              Before You Apply
              <span className="bg-primary-light text-primary text-xs rounded-badge px-2 py-0.5 font-medium">
                Some info unknown
              </span>
            </summary>
            <p className="text-text-secondary text-sm mt-3">We recommend asking the shelter:</p>
            <ul className="flex flex-col gap-2 mt-2">
              {compatibility.result.shelterQuestions.map((q) => (
                <li key={q} className="flex items-start gap-2 text-question text-sm">
                  <CircleHelp size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Shelter CTA */}
        {dog.shelterUrl && (
          <section className="bg-surface rounded-card border border-border p-5">
            <a
              href={dog.shelterUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleShelterClick}
              className={
                compatibility.available
                  ? "bg-primary text-white rounded-button-full w-full py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  : "border-2 border-primary text-primary rounded-button-full px-6 py-3 font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-light transition-colors"
              }
            >
              <ExternalLink size={18} />
              Visit Shelter Listing
            </a>
          </section>
        )}
      </div>
    </main>
  );
}

function AnonymousCompat({ teaser }: { teaser: string }) {
  const items = [
    { icon: <Target size={16} />, label: "Match Score" },
    { icon: <MessageCircle size={16} />, label: "Match Explanation" },
    { icon: <TriangleAlert size={16} />, label: "Potential Concerns" },
    { icon: <CircleHelp size={16} />, label: "Questions to Ask the Shelter" },
  ];

  return (
    <section className="bg-surface rounded-card border border-border p-6">
      <div className="flex items-start gap-4">
        <div className="bg-secondary-cta/10 text-secondary-cta rounded-full p-3 flex-shrink-0">
          <Lock size={22} />
        </div>
        <div className="flex-1">
          <h2 className="text-secondary-cta font-bold text-lg">
            Compatibility Analysis Available
          </h2>
          <p className="text-text-secondary text-sm mt-1">Create your profile to see:</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
            {items.map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-text-secondary text-sm">
                <span className="text-secondary-cta">{icon}</span>
                {label}
              </li>
            ))}
          </ul>
          <p className="sr-only">{teaser}</p>
          <Link
            href="/questionnaire"
            className="bg-secondary-cta text-white rounded-button-full w-full py-3 font-semibold flex items-center justify-center gap-2 mt-5 hover:opacity-90 transition-opacity"
          >
            Get My Compatibility Match
          </Link>
        </div>
      </div>
    </section>
  );
}

function AuthenticatedCompat({
  result,
  explanation,
}: {
  result: CompatibilityResult;
  explanation?: string | null;
}) {
  return (
    <section className="bg-primary-light rounded-card border border-primary/20 p-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Score + confidence */}
        <div>
          <p className={`font-bold uppercase tracking-wide text-sm ${matchTierText(result.compatibilityScore)}`}>
            {result.matchLabel}
          </p>
          <p className={`text-4xl font-bold ${matchTierText(result.compatibilityScore)}`}>
            {result.compatibilityScore}%
          </p>
          <details className="mt-2">
            <summary
              className={`inline-flex items-center gap-1 cursor-pointer rounded-badge px-2 py-1 text-sm font-medium list-none ${matchTierClasses(
                result.compatibilityScore
              )}`}
            >
              {result.confidenceLabel} Confidence
            </summary>
            <p className="text-text-secondary text-sm mt-2">
              This reflects how complete the shelter and profile data are for this match.
            </p>
          </details>
        </div>

        {/* Why this dog fits */}
        {result.positiveFactors.length > 0 && (
          <div>
            <h2 className="font-bold text-match-high-text mb-2">Why This Dog Fits</h2>
            <ul className="flex flex-col gap-2">
              {result.positiveFactors.map((f) => (
                <li key={f} className="flex items-start gap-2 text-text-primary text-sm">
                  <CircleCheck size={16} className="text-match-high-text flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Potential concerns */}
        {result.concerns.length > 0 && (
          <div>
            <h2 className="font-bold text-concern mb-2">Potential Concerns</h2>
            <ul className="flex flex-col gap-2">
              {result.concerns.map((c) => (
                <li key={c} className="flex items-start gap-2 text-text-primary text-sm">
                  <TriangleAlert size={16} className="text-concern flex-shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI insight */}
      {explanation && (
        <div className="mt-5 pt-5 border-t border-primary/20">
          <p className="flex items-center gap-1.5 font-semibold text-primary mb-1">
            <Sparkles size={16} />
            AI Insight
          </p>
          <p data-testid="ai-explanation" className="text-text-secondary italic text-sm">
            {explanation}
          </p>
        </div>
      )}
    </section>
  );
}
