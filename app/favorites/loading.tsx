/**
 * Route-level loading UI for the Favorites dashboard. Shown while the server
 * resolves favorites + their RescueGroups data. Mirrors the dashboard shell
 * (sidebar + horizontal saved-dog cards) so the layout doesn't jump.
 */
export default function FavoritesLoading() {
  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      <div
        role="status"
        aria-label="Loading your saved dogs"
        className="flex gap-8 max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8"
      >
        {/* Sidebar placeholder */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="h-6 w-40 bg-border rounded animate-pulse mb-6" />
          <div className="flex flex-col gap-3">
            <div className="h-9 w-full bg-border rounded animate-pulse" />
            <div className="h-9 w-full bg-border rounded animate-pulse" />
            <div className="h-9 w-full bg-border rounded animate-pulse" />
          </div>
        </aside>

        {/* Main column */}
        <section className="flex-1 min-w-0">
          <div className="h-8 w-48 bg-border rounded animate-pulse" />
          <div className="h-4 w-64 bg-border rounded animate-pulse mt-3" />
          <div className="h-20 w-full bg-primary-light rounded-card animate-pulse my-6" />

          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-card border border-border p-4 flex gap-4"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-button-inline bg-primary-light animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-5 w-1/3 bg-border rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-border rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-border rounded animate-pulse" />
                  <div className="h-6 w-32 bg-border rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <span className="sr-only">Loading your saved dogs…</span>
      </div>
    </main>
  );
}
