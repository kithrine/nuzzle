"use client";

import { useEffect, useRef, useState } from "react";
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

  return (
    <main>
      <h1>Browse Dogs</h1>

      <SearchFilters
        defaultValues={initialFilters}
        onSubmit={handleSubmit}
        isLoading={state.status === "loading"}
      />

      {state.status === "error" && (
        <p>Unable to load dogs at this time. Please try again later.</p>
      )}

      {state.status === "success" && (
        <>
          <SearchResults results={state.results} zip={state.zip} favoriteIds={favoriteIds} />
          {state.hasMore && (
            <button onClick={handleNextPage}>Next Page</button>
          )}
        </>
      )}
    </main>
  );
}
