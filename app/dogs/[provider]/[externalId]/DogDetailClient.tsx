"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
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
  X,
} from "lucide-react";
import type { CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";
import { formatAgeGroup } from "@/lib/compatibility/display";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DogImage } from "@/components/DogImage";

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
  const photos = dog.photos;
  const thumbs = photos.slice(0, 4);
  const extraPhotos = photos.length - 4;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }
  function step(delta: number) {
    setLightboxIndex((i) => (i + delta + photos.length) % photos.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, photos.length]);

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
    <main className="relative overflow-hidden bg-background min-h-[calc(100vh-4rem)]">
      {/* Decorative botanical corners (tablet+) */}
      <img
        src="/images/flowers-left.png"
        alt=""
        aria-hidden="true"
        className="hidden md:block pointer-events-none select-none absolute -bottom-8 left-0 w-44 lg:w-60 h-auto z-0"
      />
      <img
        src="/images/flowers-right.png"
        alt=""
        aria-hidden="true"
        className="hidden md:block pointer-events-none select-none absolute -bottom-10 right-0 w-44 lg:w-60 h-auto z-0"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col gap-6">
        {/* Back link */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline w-fit"
        >
          <ChevronLeft size={16} />
          Back to results
        </Link>

        {/* Hero + thumbnails (interactive) */}
        {photos.length > 0 && (
          <div className="flex gap-3">
            <div className="relative flex-1 aspect-[16/10] rounded-card overflow-hidden bg-primary-light">
              <DogImage src={photos[activeIndex]} alt={dog.name} />
            </div>
            {photos.length > 1 && (
              <div className="hidden sm:flex flex-col gap-3 w-36">
                {thumbs.map((src, i) => {
                  const isViewAll = i === 3 && extraPhotos > 0;
                  const active = i === activeIndex;
                  return (
                    <button
                      key={src}
                      type="button"
                      aria-label={isViewAll ? "View all photos" : `View photo ${i + 1}`}
                      onClick={() => (isViewAll ? openLightbox(activeIndex) : setActiveIndex(i))}
                      className={`relative flex-1 rounded-card overflow-hidden bg-primary-light transition-shadow ${
                        active ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/40"
                      }`}
                    >
                      <DogImage src={src} alt="" />
                      {isViewAll && (
                        <span className="absolute inset-0 bg-text-primary/60 text-white text-sm font-semibold flex items-center justify-center gap-1">
                          <PawPrint size={14} />+{extraPhotos}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lightbox / carousel */}
        {lightboxOpen &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${dog.name} photos`}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white/90 hover:text-white"
              >
                <X size={28} />
              </button>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 sm:left-6 text-white/90 hover:text-white"
              >
                <ChevronLeft size={36} />
              </button>
              <div className="px-12 sm:px-16" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[lightboxIndex]}
                  alt=""
                  className="max-w-full max-h-[80vh] object-contain mx-auto select-none"
                />
                <p className="text-white text-center text-sm mt-3">
                  {lightboxIndex + 1} / {photos.length}
                </p>
              </div>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 sm:right-6 text-white/90 hover:text-white"
              >
                <ChevronRight size={36} />
              </button>
            </div>,
            document.body,
          )}

        {/* Info card */}
        <section className="relative overflow-hidden bg-surface rounded-card border border-border p-5">
          <img
            src="/images/flowers-about.png"
            alt=""
            aria-hidden="true"
            className="hidden sm:block pointer-events-none select-none absolute bottom-0 right-0 w-28 lg:w-36 h-auto"
          />
          <div className="relative z-10 sm:pr-32 lg:pr-40">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{dog.name}</h1>
              <FavoriteButton
                provider={dog.provider}
                externalId={dog.externalId}
                initialFavorited={isFavorited}
                dogName={dog.name}
              />
            </div>
            <p className="text-text-secondary text-sm mt-1">
              {breed} &bull; {formatAgeGroup(dog.ageGroup)} &bull; {dog.sizeGroup}
              {dog.gender && dog.gender !== "Unknown" && <> &bull; {dog.gender}</>}
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
