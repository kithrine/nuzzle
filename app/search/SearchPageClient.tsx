"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { SearchFilters, type FilterValues } from "@/components/SearchFilters";
import { SearchResults } from "@/components/SearchResults";

type AnonymousCompatibility = { available: false; teaser: string };
type SearchResult = { dog: NormalizedDog; compatibility: AnonymousCompatibility };

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; results: SearchResult[]; zip: string; page: number; hasMore: boolean };

function buildApiUrl(filters: FilterValues & { page: number }): string {
  const params = new URLSearchParams({
    zip: filters.zip,
    radius: filters.radius,
    page: String(filters.page),
  });
  if (filters.breed) params.set("breed", filters.breed);
  if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);
  if (filters.sizeGroup) params.set("sizeGroup", filters.sizeGroup);
  return `/api/dogs/search?${params}`;
}

function buildPageUrl(filters: FilterValues & { page: number }): string {
  const params = new URLSearchParams({
    zip: filters.zip,
    radius: filters.radius,
    page: String(filters.page),
  });
  if (filters.breed) params.set("breed", filters.breed);
  if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);
  if (filters.sizeGroup) params.set("sizeGroup", filters.sizeGroup);
  return `/search?${params}`;
}

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const initialFilters: FilterValues = {
    zip: searchParams.get("zip") ?? "",
    radius: searchParams.get("radius") ?? "25",
    breed: searchParams.get("breed") ?? "",
    ageGroup: searchParams.get("ageGroup") ?? "",
    sizeGroup: searchParams.get("sizeGroup") ?? "",
  };
  const initialPage = Number(searchParams.get("page") ?? "1");

  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const didAutoSearch = useRef(false);

  async function runSearch(filters: FilterValues, page: number) {
    setState({ status: "loading" });
    try {
      const res = await fetch(buildApiUrl({ ...filters, page }));
      if (!res.ok) {
        setState({ status: "error" });
        return;
      }
      const body = await res.json();
      setState({
        status: "success",
        results: body.results ?? [],
        zip: filters.zip,
        page,
        hasMore: body.hasMore ?? false,
      });
    } catch {
      setState({ status: "error" });
    }
  }

  // Auto-search on mount when URL already has a zip (refresh / direct link)
  useEffect(() => {
    if (initialFilters.zip && !didAutoSearch.current) {
      didAutoSearch.current = true;
      runSearch(initialFilters, initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch favorites once for authenticated users to show correct initial heart state
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((favs: Array<{ provider: string; externalId: string }>) => {
        setFavoriteIds(new Set(favs.map((f) => `${f.provider}-${f.externalId}`)));
      })
      .catch(() => {});
  }, [isSignedIn]);

  function handleSubmit(filters: FilterValues) {
    router.push(buildPageUrl({ ...filters, page: 1 }));
    runSearch(filters, 1);
  }

  function handleNextPage() {
    if (state.status !== "success") return;
    const filters: FilterValues = {
      zip: state.zip,
      radius: initialFilters.radius,
      breed: initialFilters.breed,
      ageGroup: initialFilters.ageGroup,
      sizeGroup: initialFilters.sizeGroup,
    };
    const nextPage = state.page + 1;
    router.push(buildPageUrl({ ...filters, page: nextPage }));
    runSearch(filters, nextPage);
  }

  // Heading + subline vary by source (post-questionnaire) and auth state.
  const source = searchParams.get("source");
  const resultCount = state.status === "success" ? state.results.length : 0;

  let heading = "Browse Dogs";
  let subline: React.ReactNode =
    "Browse adoptable dogs and find one that fits your lifestyle.";

  if (source === "questionnaire") {
    heading = "Your Best Matches";
    subline = `Profile Complete · ${resultCount} Strong Matches Found`;
  } else if (isSignedIn) {
    heading = "Best Matches For You";
    subline = "Based on your profile and what matters most to you.";
  } else {
    subline = (
      <>
        Find your perfect match.{" "}
        <Link href="/questionnaire" className="text-primary font-medium hover:underline">
          Create a profile
        </Link>{" "}
        to unlock your compatibility score and personalized insights.
      </>
    );
  }

  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative h-44 md:h-56 overflow-hidden">
        <Image
          src="/images/browse-hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/30 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 md:px-6 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{heading}</h1>
          <p className="mt-1 text-text-secondary text-sm md:text-base max-w-md">
            {subline}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <SearchFilters
          defaultValues={initialFilters}
          onSubmit={handleSubmit}
          isLoading={state.status === "loading"}
        />

        {state.status === "loading" && (
          <p className="text-text-secondary mt-6">Loading dogs…</p>
        )}

        {state.status === "error" && (
          <p className="text-text-secondary mt-6">
            Unable to load dogs at this time. Please try again later.
          </p>
        )}

        {state.status === "success" && (
          <>
            <SearchResults
              results={state.results}
              zip={state.zip}
              favoriteIds={favoriteIds}
            />
            {state.hasMore && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className="text-text-secondary text-sm">Page {state.page}</span>
                <button
                  onClick={handleNextPage}
                  className="bg-surface border border-border rounded-button-inline px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light transition-colors"
                >
                  Next Page
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
