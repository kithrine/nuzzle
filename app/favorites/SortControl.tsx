"use client";

import { useRouter } from "next/navigation";

interface SortControlProps {
  current: "best" | "recent";
}

export function SortControl({ current }: SortControlProps) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      Sort by:
      <select
        value={current}
        onChange={(e) => router.push(`/favorites?sort=${e.target.value}`)}
        className="border border-border rounded-button-inline px-3 py-1.5 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="best">Best Match</option>
        <option value="recent">Recently Saved</option>
      </select>
    </label>
  );
}
