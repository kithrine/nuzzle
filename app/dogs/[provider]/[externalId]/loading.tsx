/**
 * Route-level loading UI for the Dog Detail page. Shown while the server
 * fetches the dog, profile, compatibility, and explanation. Mirrors the
 * detail layout (hero + info card + compatibility block).
 */
export default function DogDetailLoading() {
  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      <div
        role="status"
        aria-label="Loading dog details"
        className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col gap-6"
      >
        {/* Back link */}
        <div className="h-4 w-32 bg-border rounded animate-pulse" />

        {/* Hero + thumbnails */}
        <div className="flex gap-3">
          <div className="flex-1 aspect-[16/10] rounded-card bg-primary-light animate-pulse" />
          <div className="hidden sm:flex flex-col gap-3 w-36">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-card bg-primary-light animate-pulse" />
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
          <div className="h-8 w-1/2 bg-border rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-border rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-border rounded animate-pulse" />
        </div>

        {/* Compatibility block */}
        <div className="bg-surface rounded-card border border-border p-6 flex flex-col gap-3">
          <div className="h-6 w-40 bg-border rounded animate-pulse" />
          <div className="h-4 w-full bg-border rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-border rounded animate-pulse" />
          <div className="h-11 w-full bg-border rounded animate-pulse mt-2" />
        </div>

        <span className="sr-only">Loading dog details…</span>
      </div>
    </main>
  );
}
