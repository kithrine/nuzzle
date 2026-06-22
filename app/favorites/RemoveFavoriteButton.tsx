"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface RemoveFavoriteButtonProps {
  provider: string;
  externalId: string;
  dogName?: string;
  className?: string;
}

export function RemoveFavoriteButton({
  provider,
  externalId,
  dogName,
  className,
}: RemoveFavoriteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    if (pending) return;
    setPending(true);
    try {
      await fetch(`/api/favorites/${provider}/${externalId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <span className={`group relative inline-flex ${className ?? ""}`}>
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        aria-label={`Remove ${dogName ?? "dog"} from favorites`}
        className="text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
      >
        <X size={20} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-0 mt-1 z-20 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        Remove from favorites
      </span>
    </span>
  );
}
