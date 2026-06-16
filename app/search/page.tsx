"use client";

import { useState } from "react";
import type { NormalizedDog } from "@/lib/compatibility/types";
import { SearchResults } from "@/components/SearchResults";

type AnonymousCompatibility = { available: false; teaser: string };
type SearchResult = { dog: NormalizedDog; compatibility: AnonymousCompatibility };

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; results: SearchResult[]; zip: string };

export default function SearchPage() {
  const [zip, setZip] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!zip.trim()) return;

    setState({ status: "loading" });

    try {
      const res = await fetch(
        `/api/dogs/search?zip=${encodeURIComponent(zip.trim())}&radius=25`
      );

      if (!res.ok) {
        setState({ status: "error" });
        return;
      }

      const body = await res.json();
      setState({
        status: "success",
        results: body.results ?? [],
        zip: zip.trim(),
      });
    } catch {
      setState({ status: "error" });
    }
  }

  return (
    <main>
      <h1>Browse Dogs</h1>

      <form onSubmit={handleSearch}>
        <label htmlFor="zip">ZIP Code</label>
        <input
          id="zip"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Enter ZIP code"
          required
        />
        <button type="submit" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Searching..." : "Search"}
        </button>
      </form>

      {state.status === "error" && (
        <p>Unable to load dogs at this time. Please try again later.</p>
      )}

      {state.status === "success" && (
        <SearchResults results={state.results} zip={state.zip} />
      )}
    </main>
  );
}
