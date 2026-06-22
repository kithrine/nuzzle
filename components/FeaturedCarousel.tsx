"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Client shell around the (server-rendered) Featured Dogs row. Owns the
 * horizontal scroll container ref so the arrow buttons can actually scroll it.
 * The dog cards are passed in as `children` so they can stay a server component.
 */
export function FeaturedCarousel({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCards(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    // ~80% of the visible width per click; fall back to ~one card when width
    // isn't measurable yet (e.g. before layout).
    const amount = el.clientWidth ? el.clientWidth * 0.8 : 220;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        aria-label="Scroll left"
        className="flex-shrink-0 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-text-primary shadow-sm transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <div ref={scrollerRef} className="overflow-x-auto pb-2 flex-1">
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollByCards(1)}
        aria-label="Scroll right"
        className="flex-shrink-0 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-text-primary shadow-sm transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
