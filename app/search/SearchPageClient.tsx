"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { NormalizedDog, CompatibilityResult } from "@/lib/compatibility/types";
import { toCardCompatibility, type CardCompatibility } from "@/lib/search/card-compatibility";
import { SearchFilters, type FilterValues } from "@/components/SearchFilters";
import { SearchResults } from "@/components/SearchResults";
import { ActiveFilters } from "@/components/ActiveFilters";

const EMPTY_FILTERS: FilterValues = {
  zip: "",
  radius: "25",
  breed: "",
  ageGroup: "",
  sizeGroup: "",
};

type SearchResult = { dog: NormalizedDog; compatibility: CardCompatibility };

type PageData = { results: SearchResult[]; hasMore: boolean; total: number };

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | ({ status: "success"; page: number; zip: string } & PageData);

const DEFAULT_TEASER = "Create a profile to unlock compatibility matching.";

function buildApiUrl(filters: FilterValues, page: number): string {
  const params = new URLSearchParams({ page: String(page), limit: "12" });
  if (filters.zip) params.set("zip", filters.zip);
  if (filters.zip && filters.radius) params.set("radius", filters.radius);
  if (filters.breed) params.set("breed", filters.breed);
  if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);
  if (filters.sizeGroup) params.set("sizeGroup", filters.sizeGroup);
  return `/api/dogs/search?${params}`;
}

function buildPageUrl(filters: FilterValues, page: number, source: string | null): string {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.zip) params.set("zip", filters.zip);
  if (filters.zip && filters.radius) params.set("radius", filters.radius);
  if (filters.breed) params.set("breed", filters.breed);
  if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);
  if (filters.sizeGroup) params.set("sizeGroup", filters.sizeGroup);
  if (source) params.set("source", source);
  return `/search?${params}`;
}

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const source = searchParams.get("source");

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
  // Cache fetched pages so paging back doesn't re-hit RescueGroups (rate limits).
  const cacheRef = useRef<Map<number, PageData>>(new Map());
  // The filters currently applied to the displayed results (drives the chips).
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(initialFilters);

  async function loadPage(filters: FilterValues, page: number) {
    const cached = cacheRef.current.get(page);
    if (cached) {
      setState({ status: "success", page, zip: filters.zip, ...cached });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch(buildApiUrl(filters, page));
      if (!res.ok) {
        setState({ status: "error" });
        return;
      }
      const body = await res.json();
      const available: boolean = body.compatibility?.available ?? false;
      const teaser: string = body.compatibility?.teaser ?? DEFAULT_TEASER;
      const results: SearchResult[] = (body.results ?? []).map(
        (r: { dog: NormalizedDog; compatibility?: CompatibilityResult }) => ({
          dog: r.dog,
          compatibility: toCardCompatibility(r.compatibility, available, teaser),
        }),
      );
      const data: PageData = {
        results,
        hasMore: body.hasMore ?? false,
        total: body.total ?? results.length,
      };
      cacheRef.current.set(page, data);
      setState({ status: "success", page, zip: filters.zip, ...data });
    } catch {
      setState({ status: "error" });
    }
  }

  function goToPage(page: number) {
    const filters = appliedFilters;
    router.push(buildPageUrl(filters, page, source));
    loadPage(filters, page);
  }

  // Apply a brand-new filter set (form submit, chip removal, clear all).
  function applyFilters(filters: FilterValues) {
    setAppliedFilters(filters);
    cacheRef.current.clear();
    router.push(buildPageUrl(filters, 1, source));
    loadPage(filters, 1);
  }

  // Everyone gets dogs on load — nationwide when there's no zip, zip-filtered
  // when the URL carries one. One provider call per page (rate-limit friendly).
  // The server scores results from the session, so this works for anonymous
  // and profiled users alike.
  useEffect(() => {
    loadPage(initialFilters, initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch favorites once for authenticated users to show correct heart state.
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
    applyFilters(filters);
  }

  function removeFilter(field: "zip" | "breed" | "ageGroup" | "sizeGroup") {
    applyFilters({ ...appliedFilters, [field]: "" });
  }

  function clearFilters() {
    applyFilters(EMPTY_FILTERS);
  }

  // Heading + subline vary by source (post-questionnaire) and auth state.
  const total = state.status === "success" ? state.total : 0;

  let heading = "Browse Dogs";
  let subline: React.ReactNode =
    "Browse adoptable dogs and find one that fits your lifestyle.";

  if (source === "questionnaire" || isSignedIn) {
    heading = source === "questionnaire" ? "Your Best Matches" : "Best Matches For You";
    if (appliedFilters.zip) {
      // A ZIP switches ordering to nearest-first (scores still shown).
      subline =
        state.status === "success"
          ? `Nearest first · ${total.toLocaleString()} dogs within ${appliedFilters.radius} mi of ${appliedFilters.zip}`
          : "Sorted by distance from your ZIP.";
    } else {
      subline =
        state.status === "success"
          ? `Ranked by your compatibility profile · ${total.toLocaleString()} dogs available`
          : "Ranked by your compatibility profile.";
    }
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
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/15 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 md:px-6 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{heading}</h1>
          <p className="mt-1 text-text-primary text-sm md:text-base max-w-md">{subline}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <SearchFilters
          key={JSON.stringify(appliedFilters)}
          defaultValues={appliedFilters}
          onSubmit={handleSubmit}
          isLoading={state.status === "loading"}
        />

        <ActiveFilters filters={appliedFilters} onRemove={removeFilter} onClear={clearFilters} />

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
            {(state.page > 1 || state.hasMore) && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => goToPage(state.page - 1)}
                  disabled={state.page <= 1}
                  className="bg-surface border border-border rounded-button-inline px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light transition-colors disabled:opacity-40 disabled:hover:bg-surface hover-press"
                >
                  Previous
                </button>
                <span className="text-text-secondary text-sm">Page {state.page}</span>
                <button
                  onClick={() => goToPage(state.page + 1)}
                  disabled={!state.hasMore}
                  className="bg-surface border border-border rounded-button-inline px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light transition-colors disabled:opacity-40 disabled:hover:bg-surface hover-press"
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
