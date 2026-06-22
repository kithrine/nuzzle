/**
 * Placeholder shown while dog cards load. Mirrors the DogCard shell (photo +
 * text lines) so the layout doesn't jump when real data arrives. Decorative —
 * hidden from the accessibility tree; the surrounding grid announces loading.
 */
export function DogCardSkeleton() {
  return (
    <div
      data-testid="dog-card-skeleton"
      aria-hidden="true"
      className="bg-surface rounded-card border border-border shadow-sm overflow-hidden flex flex-col"
    >
      <div className="aspect-[4/3] bg-primary-light animate-pulse" />
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="h-5 w-2/3 bg-border rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-border rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-border rounded animate-pulse" />
        <div className="h-9 w-full bg-border rounded animate-pulse mt-2" />
      </div>
    </div>
  );
}

/**
 * A grid of DogCardSkeletons matching the SearchResults grid. Carries the
 * loading status for screen readers (Rule 13).
 */
export function DogCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading dogs"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <DogCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading dogs…</span>
    </div>
  );
}
